import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Loader2, Sparkles, Send, ChevronRight, Plus, X,
    Clock, Trophy, Flame, AlertTriangle, Trash2
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    saveFridgeItem, getFridgeItems, deleteFridgeItem,
    saveWasteLog, getWasteStats
} from '../services/database';

// ── Step 1: Connect to Google Gemini AI ──
// This creates a connection to Google's AI using your API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// ── Step 2: Write the System Prompt ──
// This tells the AI WHO it is and HOW to behave
// Think of it as training the AI for your specific use case
const SYSTEM_PROMPT = `You are "Zero Waste Chef" — an AI assistant for GreenGrid, an Indian waste management app.

YOUR RULES:
- You are India-first. Always prefer Indian recipes: roti, dal, rice, sabzi, dosa, idli, paratha, khichdi, upma, poha, chutney, raita, etc.
- Help users SAVE food from being wasted by suggesting recipes, storage tips, and meal plans.
- Be practical, fun, encouraging. Use emojis. Keep responses concise.
- When suggesting recipes: include name, time needed, difficulty, and brief steps.
- When giving storage tips: be specific (e.g., "wrap in newspaper, store at room temperature for 3 days").
- Consider Indian kitchen context (pressure cooker, tawa, kadhai, masalas available).
- If food seems spoiled or unsafe, advise composting or disposal — NEVER suggest eating unsafe food.
- You can suggest preservation: freezing, pickling, drying, making chutneys.
- For nutrition questions: focus on practical Indian dietary advice.
- For grocery tips: suggest portion sizes for Indian families of 3-4.`;

// ── Helper functions ──
function daysUntil(dateStr) {
    if (!dateStr) return 999;
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const exp = new Date(dateStr); exp.setHours(0, 0, 0, 0);
    return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
}

function expiryColor(days) {
    if (days <= 0) return '#ef4444';
    if (days <= 2) return '#f59e0b';
    if (days <= 5) return '#eab308';
    return '#10b981';
}

function expiryLabel(days) {
    if (days < 0) return '❌ Expired';
    if (days === 0) return '🔴 Today!';
    if (days === 1) return '🔴 Tomorrow';
    if (days <= 3) return `🟡 ${days} days left`;
    return `🟢 ${days} days left`;
}

// ── Quick action chips that send pre-written prompts to AI ──
const quickChips = [
    { label: '🧊 Storage Tips', prompt: 'Give me storage and preservation tips for common Indian kitchen items like rice, dal, vegetables, milk, curd, and bread. Be specific about temperatures and durations.' },
    { label: '🍱 Meal Plan', prompt: null }, // Will be built dynamically from fridge items
    { label: '🛒 Grocery Tips', prompt: null }, // Will be built dynamically from waste stats
    { label: '📊 Nutrition', prompt: 'Based on typical Indian home cooking, what are common nutritional imbalances? Suggest easy recipes to balance carbs, protein, and vitamins. Focus on practical everyday Indian dishes.' },
];

// ═══════════════════════════════════════════════
// ── THE COMPONENT ──
// ═══════════════════════════════════════════════
export default function ZeroWasteChef({ userId }) {
    // ── UI State ──
    const [expanded, setExpanded] = useState(false);
    const [activeView, setActiveView] = useState('main'); // main, chat, fridge, scoreboard

    // ── Chat State ──
    // Messages shown on screen
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Namaste! 🙏 I\'m your Zero Waste Chef.\n\nTell me what food you have — I\'ll suggest Indian recipes to save it from the bin!\n\nExamples:\n• "I have leftover rice and dal"\n• "My bananas are turning brown"\n• "Give me a meal plan for the week"' }
    ]);
    const [input, setInput] = useState('');         // What user is typing
    const [chatLoading, setChatLoading] = useState(false); // AI is thinking?
    const chatEndRef = useRef(null);                       // Auto-scroll to bottom
    const chatHistory = useRef([]);                         // Memory of conversation

    // ── Fridge State ──
    const [fridgeItems, setFridgeItems] = useState([]);
    const [fridgeLoading, setFridgeLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemExpiry, setNewItemExpiry] = useState('');
    const [newItemQty, setNewItemQty] = useState('');

    // ── Scoreboard State ──
    const [wasteStats, setWasteStats] = useState([]);

    // ── Load data from Firebase when component mounts ──
    useEffect(() => {
        if (!userId) return;
        loadFridge();
        loadStats();
    }, [userId]);

    // Auto-scroll chat to bottom when new messages appear
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function loadFridge() {
        setFridgeLoading(true);
        try { setFridgeItems(await getFridgeItems(userId)); }
        catch (e) { console.error('Failed to load fridge:', e); }
        setFridgeLoading(false);
    }

    async function loadStats() {
        try { setWasteStats(await getWasteStats(userId)); }
        catch (e) { console.error('Failed to load stats:', e); }
    }

    // ═══════════════════════════════════════════════
    // ── Step 3: Send Message to Gemini AI ──
    // This is the CORE function. It:
    // 1. Takes the user's message
    // 2. Adds the system prompt + conversation history
    // 3. Sends everything to Gemini
    // 4. Gets the response and shows it
    // ═══════════════════════════════════════════════
    async function sendMessage(text) {
        if (!text.trim()) return;

        // Show user's message on screen immediately
        setMessages(prev => [...prev, { role: 'user', text }]);
        setInput('');
        setChatLoading(true);

        try {
            // Choose the AI model
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            // Build the full prompt with context
            // We include: system instructions + past conversation + new message
            const fullPrompt = [
                SYSTEM_PROMPT,
                '',
                'Conversation so far:',
                ...chatHistory.current.map(m => `${m.role}: ${m.text}`),
                '',
                `User: ${text}`
            ].join('\n');

            // Send to Gemini and wait for response
            const result = await model.generateContent(fullPrompt);
            const aiReply = result.response.text();

            // Save to conversation history (keep last 16 messages for context)
            chatHistory.current.push({ role: 'User', text });
            chatHistory.current.push({ role: 'Chef', text: aiReply });
            if (chatHistory.current.length > 16) {
                chatHistory.current = chatHistory.current.slice(-12);
            }

            // Show AI's response on screen
            setMessages(prev => [...prev, { role: 'ai', text: aiReply }]);

        } catch (err) {
            console.error('AI error:', err);
            setMessages(prev => [...prev, {
                role: 'ai',
                text: '😅 Sorry, I had trouble connecting to AI. Please check your internet and try again!'
            }]);
        }

        setChatLoading(false);
    }

    // ── Quick chip handlers ──
    function handleChip(chip) {
        if (chip.prompt) {
            sendMessage(chip.prompt);
        } else if (chip.label.includes('Meal')) {
            const items = fridgeItems.filter(f => f.status === 'active').map(f => f.name).join(', ');
            sendMessage(items
                ? `I have these items: ${items}. Create a 3-day Indian meal plan (breakfast, lunch, dinner) that uses ALL of these. Include prep times. Zero waste.`
                : 'Create a 3-day zero-waste Indian meal plan for a family of 4. Suggest what to buy and how to use every ingredient across all meals.');
        } else if (chip.label.includes('Grocery')) {
            const wasted = wasteStats.filter(w => w.action === 'wasted').map(w => w.itemName);
            sendMessage(wasted.length
                ? `I've been wasting these items: ${wasted.join(', ')}. Give me smart grocery shopping tips to reduce waste. Suggest portions for a family of 4.`
                : 'Give me smart grocery shopping tips to reduce food waste in an Indian household. Cover vegetables, fruits, dairy, and grains.');
        }
        setActiveView('chat');
    }

    // ── Fridge: Add item manually ──
    async function addItemToFridge() {
        if (!newItemName.trim()) return;
        const expDate = newItemExpiry || (() => {
            const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0];
        })();
        await saveFridgeItem(userId, {
            name: newItemName.trim(),
            emoji: '🍽️',
            category: 'other',
            quantity: newItemQty || '1',
            expiryDate: expDate,
            preservationTip: '',
        });
        setNewItemName('');
        setNewItemExpiry('');
        setNewItemQty('');
        setShowAddForm(false);
        await loadFridge();
    }

    // ── Fridge: Mark as used or wasted ──
    async function handleUsed(item) {
        await deleteFridgeItem(userId, item.id);
        await saveWasteLog(userId, { itemName: item.name, action: 'used', weight: item.quantity, co2Saved: 0.5 });
        await loadFridge();
        await loadStats();
    }

    async function handleWasted(item) {
        await deleteFridgeItem(userId, item.id);
        await saveWasteLog(userId, { itemName: item.name, action: 'wasted', weight: item.quantity, co2Saved: 0 });
        await loadFridge();
        await loadStats();
    }

    // ── Scoreboard calculations ──
    const totalSaved = wasteStats.filter(w => w.action === 'used').length;
    const totalWasted = wasteStats.filter(w => w.action === 'wasted').length;
    const co2Saved = wasteStats.filter(w => w.action === 'used').reduce((sum, w) => sum + (w.co2Saved || 0.5), 0);
    const streak = (() => {
        let count = 0;
        const sorted = [...wasteStats].filter(w => w.action === 'used')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (!sorted.length) return 0;
        let lastDate = new Date(); lastDate.setHours(0, 0, 0, 0);
        for (const log of sorted) {
            const logDate = new Date(log.createdAt); logDate.setHours(0, 0, 0, 0);
            if (Math.floor((lastDate - logDate) / 86400000) <= 1) { count++; lastDate = logDate; }
            else break;
        }
        return count;
    })();
    const expiringToday = fridgeItems.filter(f => f.status === 'active' && daysUntil(f.expiryDate) <= 1).length;

    // ═══════════════════════════════════════════════
    // ── COLLAPSED VIEW (shows as a card) ──
    // ═══════════════════════════════════════════════
    if (!expanded) {
        return (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ marginTop: 16 }}>
                <div className="section-header">
                    <span className="section-title">Zero Waste Chef</span>
                    <span className="badge badge-blue" style={{ fontSize: '0.58rem' }}><Sparkles size={8} /> AI</span>
                </div>
                <div className="card" style={{ padding: 20, background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(236,72,153,0.06))', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer' }}
                    onClick={() => setExpanded(true)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👨‍🍳</div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Zero Waste Chef</p>
                            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>AI recipes • Fridge tracker • Meal planner</p>
                        </div>
                        <ChevronRight size={18} color="#a78bfa" />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                        {[
                            { v: `${fridgeItems.length}`, l: 'In Fridge', c: '#60a5fa' },
                            { v: `${totalSaved}`, l: 'Saved', c: '#34d399' },
                            { v: `${streak}🔥`, l: 'Streak', c: '#f59e0b' },
                        ].map((s, i) => (
                            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '8px 0', background: 'rgba(0,0,0,0.15)', borderRadius: 8 }}>
                                <p style={{ fontWeight: 800, fontSize: '1rem', color: s.c }}>{s.v}</p>
                                <p style={{ fontSize: '0.6rem', color: '#64748b', marginTop: 2 }}>{s.l}</p>
                            </div>
                        ))}
                    </div>
                    {expiringToday > 0 && (
                        <div style={{ marginTop: 10, padding: '6px 10px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <AlertTriangle size={12} color="#ef4444" />
                            <span style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 600 }}>{expiringToday} item{expiringToday > 1 ? 's' : ''} expiring today!</span>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }

    // ═══════════════════════════════════════════════
    // ── EXPANDED VIEW ──
    // ═══════════════════════════════════════════════
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16 }}>
            {/* Header */}
            <div className="section-header">
                <span className="section-title" style={{ cursor: 'pointer' }} onClick={() => { setExpanded(false); setActiveView('main'); }}>← Zero Waste Chef</span>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
                {[
                    { id: 'main', label: '🏠 Home' },
                    { id: 'chat', label: '👨‍🍳 Chef AI' },
                    { id: 'fridge', label: '🧊 My Fridge' },
                    { id: 'scoreboard', label: '🏆 Score' },
                ].map(t => (
                    <button key={t.id} className={`tab-pill ${activeView === t.id ? 'active' : ''}`}
                        onClick={() => setActiveView(t.id)} style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ═══ HOME TAB ═══ */}
            {activeView === 'main' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Quick Actions */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {quickChips.map((chip, i) => (
                            <button key={i} className="btn btn-sm btn-secondary" style={{ fontSize: '0.7rem' }} onClick={() => handleChip(chip)}>
                                {chip.label}
                            </button>
                        ))}
                    </div>

                    {/* Expiring Soon */}
                    {fridgeItems.filter(f => f.status === 'active' && daysUntil(f.expiryDate) <= 3).length > 0 && (
                        <div className="card card-sm" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)', padding: 14 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f59e0b', marginBottom: 8 }}>⚠️ Use Soon</p>
                            {fridgeItems.filter(f => f.status === 'active' && daysUntil(f.expiryDate) <= 3).map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                    <span style={{ fontSize: '1.2rem' }}>{item.emoji}</span>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.78rem', fontWeight: 500 }}>{item.name}</p>
                                        <p style={{ fontSize: '0.62rem', color: expiryColor(daysUntil(item.expiryDate)) }}>{expiryLabel(daysUntil(item.expiryDate))}</p>
                                    </div>
                                    <button className="btn btn-sm" style={{ fontSize: '0.62rem', padding: '3px 8px', background: 'rgba(99,102,241,0.1)', color: '#a78bfa', border: 'none' }}
                                        onClick={() => { sendMessage(`I have ${item.name} (${item.quantity}) expiring in ${daysUntil(item.expiryDate)} days. Give me quick Indian recipes to use it. Also give a preservation tip.`); setActiveView('chat'); }}>
                                        🍳 Recipe
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Impact Summary */}
                    <div className="card card-sm" style={{ padding: 14 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 10 }}>🏆 Your Impact</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
                            {[
                                { v: totalSaved, l: 'Saved', c: '#34d399', e: '✅' },
                                { v: totalWasted, l: 'Wasted', c: '#ef4444', e: '❌' },
                                { v: `${co2Saved.toFixed(1)}`, l: 'kg CO₂', c: '#60a5fa', e: '🌍' },
                                { v: `${streak}`, l: 'Streak', c: '#f59e0b', e: '🔥' },
                            ].map((s, i) => (
                                <div key={i} style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.85rem' }}>{s.e}</p>
                                    <p style={{ fontWeight: 800, fontSize: '0.9rem', color: s.c }}>{s.v}</p>
                                    <p style={{ fontSize: '0.55rem', color: '#64748b' }}>{s.l}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Daily Tip */}
                    <div className="card card-sm" style={{ padding: 14, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '1.2rem' }}>💡</span>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.78rem', color: '#34d399' }}>Tip of the Day</p>
                                <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
                                    {['Leftover rice? Make lemon rice or curd rice — takes just 5 minutes! 🍋',
                                        'Ripe bananas are perfect for banana sheera or smoothies 🍌',
                                        'Stale roti? Make roti chips or roti upma — crispy and delicious! 🫓',
                                        'Wrap coriander in damp paper towel — stays fresh for 2 weeks 🌿',
                                        'Freeze grated ginger & garlic in ice cube trays — always ready! 🧄',
                                        'Overripe tomatoes? Perfect for chutney or rasam 🍅',
                                        'Store onions & potatoes separately — together they spoil faster 🧅'][new Date().getDay()]}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ CHEF AI CHAT TAB ═══ */}
            {activeView === 'chat' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {/* Chat Messages */}
                    <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 8 }}>
                        {messages.map((msg, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '85%',
                                    padding: '10px 14px',
                                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                    background: msg.role === 'user' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)'}`,
                                }}>
                                    <p style={{ fontSize: '0.78rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                </div>
                            </motion.div>
                        ))}
                        {chatLoading && (
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 14px' }}>
                                <Loader2 size={14} color="#a78bfa" style={{ animation: 'spin 1s linear infinite' }} />
                                <span style={{ fontSize: '0.75rem', color: '#a78bfa' }}>Chef is cooking up ideas...</span>
                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Quick Chips */}
                    <div style={{ display: 'flex', gap: 4, overflowX: 'auto', padding: '8px 0', marginBottom: 4 }}>
                        {quickChips.map((chip, i) => (
                            <button key={i} className="tab-pill" style={{ fontSize: '0.62rem', whiteSpace: 'nowrap', padding: '4px 8px' }} onClick={() => handleChip(chip)}>
                                {chip.label}
                            </button>
                        ))}
                    </div>

                    {/* Text Input Bar */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                            placeholder="Type what food you have..."
                            style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 10,
                                padding: '10px 14px',
                                fontSize: '0.82rem',
                                color: '#e2e8f0',
                                outline: 'none',
                            }}
                        />
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={chatLoading || !input.trim()}
                            style={{
                                background: input.trim() ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                                border: 'none', borderRadius: 10,
                                width: 38, height: 38,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: input.trim() ? 'pointer' : 'default',
                                flexShrink: 0,
                            }}>
                            <Send size={16} color={input.trim() ? '#a78bfa' : '#475569'} />
                        </button>
                    </div>
                </div>
            )}

            {/* ═══ MY FRIDGE TAB ═══ */}
            {activeView === 'fridge' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Add Item Button / Form */}
                    {!showAddForm ? (
                        <button className="btn btn-sm btn-primary" style={{ fontSize: '0.75rem' }} onClick={() => setShowAddForm(true)}>
                            <Plus size={14} /> Add Item to Fridge
                        </button>
                    ) : (
                        <div className="card card-sm" style={{ padding: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>Add Item</p>
                                <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={16} /></button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <input
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                    placeholder="Item name (e.g., Tomatoes)"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', fontSize: '0.82rem', color: '#e2e8f0', outline: 'none' }}
                                />
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input
                                        value={newItemQty}
                                        onChange={e => setNewItemQty(e.target.value)}
                                        placeholder="Qty (e.g., 500g)"
                                        style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', fontSize: '0.82rem', color: '#e2e8f0', outline: 'none' }}
                                    />
                                    <input
                                        type="date"
                                        value={newItemExpiry}
                                        onChange={e => setNewItemExpiry(e.target.value)}
                                        style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', fontSize: '0.82rem', color: '#e2e8f0', outline: 'none' }}
                                    />
                                </div>
                                <button className="btn btn-sm btn-primary" onClick={addItemToFridge} disabled={!newItemName.trim()} style={{ fontSize: '0.75rem' }}>
                                    ✅ Add to Fridge
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Fridge Items List */}
                    {fridgeLoading ? (
                        <div style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>
                            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                            <p style={{ fontSize: '0.82rem', marginTop: 8 }}>Loading fridge...</p>
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : fridgeItems.filter(f => f.status === 'active').length === 0 ? (
                        <div className="card card-sm" style={{ textAlign: 'center', padding: 30 }}>
                            <p style={{ fontSize: '1.5rem', marginBottom: 8 }}>🧊</p>
                            <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>Fridge is empty!</p>
                            <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>Add food items to start tracking expiry dates</p>
                        </div>
                    ) : (
                        fridgeItems.filter(f => f.status === 'active').map((item, i) => {
                            const days = daysUntil(item.expiryDate);
                            return (
                                <motion.div key={item.id} className="card card-sm" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                    style={{ borderLeftWidth: 3, borderLeftColor: expiryColor(days), padding: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: '1.3rem' }}>{item.emoji}</span>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, fontSize: '0.82rem' }}>{item.name}</p>
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
                                                <span style={{ fontSize: '0.62rem', color: '#64748b' }}>{item.quantity}</span>
                                                <span style={{ fontSize: '0.62rem', fontWeight: 600, color: expiryColor(days) }}>{expiryLabel(days)}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button onClick={() => handleUsed(item)} title="Used it" style={{ background: 'rgba(16,185,129,0.1)', border: 'none', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                <span style={{ fontSize: '0.7rem' }}>✅</span>
                                            </button>
                                            <button onClick={() => handleWasted(item)} title="Wasted" style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                <span style={{ fontSize: '0.7rem' }}>🗑️</span>
                                            </button>
                                            <button onClick={() => { sendMessage(`I have ${item.name} (${item.quantity}) expiring in ${days} days. Quick Indian recipe and storage tip please.`); setActiveView('chat'); }} title="Recipe"
                                                style={{ background: 'rgba(99,102,241,0.1)', border: 'none', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                <span style={{ fontSize: '0.7rem' }}>🍳</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            )}

            {/* ═══ SCOREBOARD TAB ═══ */}
            {activeView === 'scoreboard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Big Stats */}
                    <div className="card" style={{ padding: 20, textAlign: 'center', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.04))', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <p style={{ fontSize: '2.5rem' }}>🏆</p>
                        <p style={{ fontWeight: 800, fontSize: '1.6rem', color: '#34d399', marginTop: 4 }}>{totalSaved}</p>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Items Saved from Waste</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16 }}>
                            {[
                                { v: `${co2Saved.toFixed(1)}kg`, l: 'CO₂ Saved', c: '#60a5fa' },
                                { v: `${totalSaved * 2}`, l: 'Meals Made', c: '#f59e0b' },
                                { v: `${streak}🔥`, l: 'Day Streak', c: '#ef4444' },
                            ].map((s, i) => (
                                <div key={i}>
                                    <p style={{ fontWeight: 800, fontSize: '1.1rem', color: s.c }}>{s.v}</p>
                                    <p style={{ fontSize: '0.62rem', color: '#64748b', marginTop: 2 }}>{s.l}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weekly Summary */}
                    <div className="card card-sm" style={{ padding: 14 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>📅 This Week</p>
                        {(() => {
                            const weekLogs = wasteStats.filter(w => (new Date() - new Date(w.createdAt)) < 7 * 86400000);
                            const wUsed = weekLogs.filter(w => w.action === 'used').length;
                            const wWasted = weekLogs.filter(w => w.action === 'wasted').length;
                            const rate = wUsed + wWasted > 0 ? Math.round((wUsed / (wUsed + wWasted)) * 100) : 0;
                            return (
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <div style={{ flex: 1, textAlign: 'center', padding: 10, background: 'rgba(16,185,129,0.08)', borderRadius: 8 }}>
                                        <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#34d399' }}>{wUsed}</p>
                                        <p style={{ fontSize: '0.6rem', color: '#64748b' }}>Used</p>
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'center', padding: 10, background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>
                                        <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#ef4444' }}>{wWasted}</p>
                                        <p style={{ fontSize: '0.6rem', color: '#64748b' }}>Wasted</p>
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'center', padding: 10, background: 'rgba(99,102,241,0.08)', borderRadius: 8 }}>
                                        <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#a78bfa' }}>{rate}%</p>
                                        <p style={{ fontSize: '0.6rem', color: '#64748b' }}>Save Rate</p>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Recent Activity */}
                    {wasteStats.length > 0 && (
                        <div className="card card-sm" style={{ padding: 14 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>📜 Recent Activity</p>
                            {wasteStats.slice(0, 8).map((log, i) => (
                                <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                    <span style={{ fontSize: '0.9rem' }}>{log.action === 'used' ? '✅' : '🗑️'}</span>
                                    <p style={{ flex: 1, fontSize: '0.72rem', fontWeight: 500 }}>{log.itemName}</p>
                                    <span style={{ fontSize: '0.6rem', color: '#64748b' }}>{new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}
