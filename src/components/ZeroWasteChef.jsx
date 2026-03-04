import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, Loader2, Sparkles, X, Send, ChevronRight, Trash2,
    Clock, Plus, ShoppingCart, Calendar, Trophy, Flame, Leaf,
    ArrowRight, RotateCcw, BookOpen, Heart, AlertTriangle, Info
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveFridgeItem, getFridgeItems, deleteFridgeItem, saveWasteLog, getWasteStats, addTransaction, updateUserStats } from '../services/database';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are "Zero Waste Chef" — an AI assistant for GreenGrid, an Indian waste management app. Your role:
- You are India-first. Always prefer Indian recipes: roti, dal, rice, sabzi, dosa, idli, paratha, khichdi, upma, poha, chutney, raita, etc.
- You help users SAVE food from being wasted by suggesting recipes, storage tips, and meal plans.
- If the user sends a food photo, identify everything visible and suggest how to use it.
- Be practical, fun, and encouraging. Use emojis. Keep responses concise.
- When suggesting recipes, include: name, time, difficulty, brief steps.
- When giving storage tips, be specific (e.g., "wrap in newspaper, store at room temperature").
- Always consider Indian kitchen context (masalas, pressure cooker, tawa, kadhai available).
- If food seems spoiled or unsafe, advise composting or disposal — never suggest eating unsafe food.
- You can suggest preservation methods: freezing, pickling, drying, making chutneys.`;

function daysUntil(dateStr) {
    if (!dateStr) return 999;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const exp = new Date(dateStr);
    exp.setHours(0, 0, 0, 0);
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
    if (days === 0) return '🔴 Expires Today';
    if (days === 1) return '🔴 Tomorrow';
    if (days <= 3) return `🟡 ${days} days`;
    if (days <= 7) return `🟢 ${days} days`;
    return `🟢 ${days} days`;
}

const quickChips = [
    { label: '📸 Scan Food', action: 'scan' },
    { label: '🧊 Storage Tips', action: 'tips' },
    { label: '🍱 Meal Plan', action: 'mealplan' },
    { label: '🛒 Grocery Tips', action: 'grocery' },
    { label: '📊 Nutrition', action: 'nutrition' },
];

export default function ZeroWasteChef({ userId, onDonate }) {
    // View state
    const [activeView, setActiveView] = useState('main'); // main, chat, fridge, scoreboard
    const [expanded, setExpanded] = useState(false);

    // Chat state
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Namaste! 🙏 I\'m your Zero Waste Chef. Snap a photo of your food, or tell me what you have — I\'ll help you save it from the bin! 🍛', time: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [chatPhoto, setChatPhoto] = useState(null);
    const chatFileRef = useRef(null);
    const chatEndRef = useRef(null);
    const chatHistory = useRef([]);

    // Fridge state
    const [fridgeItems, setFridgeItems] = useState([]);
    const [fridgeLoading, setFridgeLoading] = useState(false);
    const [scanMode, setScanMode] = useState(false);
    const [scanLoading, setScanLoading] = useState(false);
    const scanFileRef = useRef(null);

    // Scoreboard state
    const [wasteStats, setWasteStats] = useState([]);
    const [statsLoading, setStatsLoading] = useState(false);

    // Load data
    useEffect(() => {
        if (!userId) return;
        loadFridge();
        loadStats();
    }, [userId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function loadFridge() {
        setFridgeLoading(true);
        try { setFridgeItems(await getFridgeItems(userId)); } catch (e) { console.error(e); }
        setFridgeLoading(false);
    }

    async function loadStats() {
        setStatsLoading(true);
        try { setWasteStats(await getWasteStats(userId)); } catch (e) { console.error(e); }
        setStatsLoading(false);
    }

    // ── Chat with Gemini ──
    async function sendMessage(text, photoBase64 = null) {
        if (!text && !photoBase64) return;
        const userMsg = { role: 'user', text: text || '📸 [Photo sent]', photo: photoBase64, time: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setChatPhoto(null);
        setChatLoading(true);

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const parts = [];

            // Build conversation context
            const contextText = `${SYSTEM_PROMPT}\n\nConversation so far:\n${chatHistory.current.map(m => `${m.role}: ${m.text}`).join('\n')}\n\nUser: ${text || 'I sent you a photo of my food. What do you see and what can I make?'}`;
            parts.push(contextText);

            if (photoBase64) {
                const base64Data = photoBase64.split(',')[1];
                parts.push({ inlineData: { data: base64Data, mimeType: 'image/jpeg' } });
            }

            const result = await model.generateContent(parts);
            const aiText = result.response.text();

            chatHistory.current.push({ role: 'User', text: text || '[Photo]' });
            chatHistory.current.push({ role: 'Chef', text: aiText });
            if (chatHistory.current.length > 20) chatHistory.current = chatHistory.current.slice(-16);

            setMessages(prev => [...prev, { role: 'ai', text: aiText, time: new Date() }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: '😅 Sorry, I had trouble thinking. Please try again!', time: new Date() }]);
        }
        setChatLoading(false);
    }

    function handleChatPhoto(e) {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setChatPhoto(ev.target.result);
            reader.readAsDataURL(file);
        }
    }

    function handleChipAction(action) {
        switch (action) {
            case 'scan':
                setChatPhoto(null);
                chatFileRef.current?.click();
                break;
            case 'tips':
                sendMessage('Give me storage and preservation tips for common Indian kitchen items like rice, dal, vegetables, milk, and bread. Be specific about temperatures and durations.');
                break;
            case 'mealplan': {
                const items = fridgeItems.filter(f => f.status === 'active').map(f => f.name).join(', ');
                sendMessage(items
                    ? `I have these items in my fridge: ${items}. Create a 3-day Indian meal plan (breakfast, lunch, dinner) that uses ALL of these ingredients with zero waste. Include prep times.`
                    : 'I need a 3-day zero-waste Indian meal plan for a family of 4. Suggest what to buy and how to use every ingredient across all meals. Include prep times.');
                break;
            }
            case 'grocery': {
                const wasted = wasteStats.filter(w => w.action === 'wasted').map(w => w.itemName);
                sendMessage(wasted.length
                    ? `I\'ve been wasting these items recently: ${wasted.join(', ')}. Give me smart grocery shopping tips to reduce waste. Suggest portion sizes for an Indian family of 4.`
                    : 'Give me smart grocery shopping tips to reduce food waste in an Indian household. Include tips for vegetables, fruits, dairy, and grains. Suggest portion sizes for a family of 4.');
                break;
            }
            case 'nutrition':
                sendMessage('Based on typical Indian home cooking, what are common nutritional imbalances? Suggest easy recipes to balance carbs, protein, and vitamins. Focus on practical everyday Indian dishes.');
                break;
        }
        setActiveView('chat');
    }

    // ── Fridge Scanner ──
    async function scanForFridge(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setScanLoading(true);
        try {
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const base64Data = ev.target.result.split(',')[1];
                const imagePart = { inlineData: { data: base64Data, mimeType: 'image/jpeg' } };
                const prompt = `You are a food scanner for a fridge tracker app. Analyze this food image and return ONLY a valid JSON array (no markdown backticks). For EACH food item visible, return:
                [
                    { "name": "Tomatoes", "emoji": "🍅", "category": "vegetable", "estimatedExpiryDays": 5, "quantity": "500g", "preservationTip": "Store at room temperature away from direct sunlight. Refrigerate only if very ripe." },
                    { "name": "Milk", "emoji": "🥛", "category": "dairy", "estimatedExpiryDays": 3, "quantity": "1L", "preservationTip": "Keep refrigerated at 4°C. Boil before use if close to expiry." }
                ]
                Categories: vegetable, fruit, dairy, grain, protein, packaged, cooked, other.
                Be accurate with expiry estimates for Indian climate (warm, humid).`;
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const result = await model.generateContent([prompt, imagePart]);
                const text = result.response.text();
                const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const items = JSON.parse(clean);

                for (const item of items) {
                    const expDate = new Date();
                    expDate.setDate(expDate.getDate() + (item.estimatedExpiryDays || 7));
                    await saveFridgeItem(userId, {
                        name: item.name,
                        emoji: item.emoji || '🍽️',
                        category: item.category || 'other',
                        quantity: item.quantity || '',
                        expiryDate: expDate.toISOString().split('T')[0],
                        preservationTip: item.preservationTip || '',
                    });
                }
                await loadFridge();
                setScanMode(false);
                setScanLoading(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error(err);
            setScanLoading(false);
        }
    }

    async function handleUsedItem(item) {
        await deleteFridgeItem(userId, item.id);
        await saveWasteLog(userId, { itemName: item.name, action: 'used', weight: item.quantity, co2Saved: 0.5 });
        await loadFridge();
        await loadStats();
    }

    async function handleWastedItem(item) {
        await deleteFridgeItem(userId, item.id);
        await saveWasteLog(userId, { itemName: item.name, action: 'wasted', weight: item.quantity, co2Saved: 0 });
        await loadFridge();
        await loadStats();
    }

    // ── Stats calculations ──
    const totalSaved = wasteStats.filter(w => w.action === 'used').length;
    const totalWasted = wasteStats.filter(w => w.action === 'wasted').length;
    const co2Saved = wasteStats.filter(w => w.action === 'used').reduce((sum, w) => sum + (w.co2Saved || 0.5), 0);
    const weekLogs = wasteStats.filter(w => {
        const d = new Date(w.createdAt);
        const now = new Date();
        return (now - d) < 7 * 24 * 60 * 60 * 1000;
    });
    const weekSaved = weekLogs.filter(w => w.action === 'used').length;
    const streak = (() => {
        let count = 0;
        const sorted = [...wasteStats].filter(w => w.action === 'used').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (!sorted.length) return 0;
        let lastDate = new Date();
        lastDate.setHours(0, 0, 0, 0);
        for (const log of sorted) {
            const logDate = new Date(log.createdAt);
            logDate.setHours(0, 0, 0, 0);
            const diff = Math.floor((lastDate - logDate) / (1000 * 60 * 60 * 24));
            if (diff <= 1) { count++; lastDate = logDate; }
            else break;
        }
        return count;
    })();

    const expiringToday = fridgeItems.filter(f => f.status === 'active' && daysUntil(f.expiryDate) <= 1).length;

    // ── Render ──
    if (!expanded) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ marginTop: 16 }}
            >
                <div className="section-header">
                    <span className="section-title">Zero Waste Chef</span>
                    <span className="badge badge-blue" style={{ fontSize: '0.58rem' }}><Sparkles size={8} /> AI-Powered</span>
                </div>
                <div className="card" style={{
                    padding: 20,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(236,72,153,0.06))',
                    border: '1px solid rgba(99,102,241,0.2)',
                    cursor: 'pointer'
                }} onClick={() => setExpanded(true)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                            👨‍🍳
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Zero Waste Chef</p>
                            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                                AI recipes • Fridge tracker • Meal planner
                            </p>
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
                            <span style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 600 }}>
                                {expiringToday} item{expiringToday > 1 ? 's' : ''} expiring today!
                            </span>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16 }}>
            <div className="section-header">
                <span className="section-title" style={{ cursor: 'pointer' }} onClick={() => { setExpanded(false); setActiveView('main'); }}>
                    ← Zero Waste Chef
                </span>
                <span className="badge badge-blue" style={{ fontSize: '0.58rem' }}><Sparkles size={8} /> Gemini AI</span>
            </div>

            {/* Nav Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
                {[
                    { id: 'main', label: '🏠 Home' },
                    { id: 'chat', label: '👨‍🍳 Chef AI' },
                    { id: 'fridge', label: '🧊 My Fridge' },
                    { id: 'scoreboard', label: '🏆 Score' },
                ].map(t => (
                    <button key={t.id} className={`tab-pill ${activeView === t.id ? 'active' : ''}`} onClick={() => setActiveView(t.id)} style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ═══ MAIN VIEW ═══ */}
            {activeView === 'main' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Quick Actions */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {quickChips.map((chip, i) => (
                            <motion.button key={i} className="btn btn-sm btn-secondary" style={{ fontSize: '0.7rem' }} onClick={() => handleChipAction(chip.action)} whileTap={{ scale: 0.95 }}>
                                {chip.label}
                            </motion.button>
                        ))}
                    </div>

                    {/* Expiring Soon Alert */}
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
                                        onClick={() => { sendMessage(`I have ${item.name} (${item.quantity}) that's expiring in ${daysUntil(item.expiryDate)} days. Give me quick Indian recipes to use it. Also give a preservation tip if I can't cook right now.`); setActiveView('chat'); }}>
                                        🍳 Recipe
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Scoreboard Summary */}
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

                    {/* Tip of the Day */}
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
                                        'Freeze grated ginger & garlic in ice cube trays — always ready to cook! 🧄',
                                        'Overripe tomatoes? Perfect for making chutney or rasam 🍅',
                                        'Store onions & potatoes separately — together they spoil faster 🧅'][new Date().getDay()]}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ CHEF AI CHAT ═══ */}
            {activeView === 'chat' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {/* Messages */}
                    <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 8 }}>
                        {messages.map((msg, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                                style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '85%',
                                    padding: '10px 14px',
                                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                    background: msg.role === 'user' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)'}`,
                                }}>
                                    {msg.photo && <img src={msg.photo} alt="food" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 6 }} />}
                                    <p style={{ fontSize: '0.78rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
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
                            <button key={i} className="tab-pill" style={{ fontSize: '0.62rem', whiteSpace: 'nowrap', padding: '4px 8px' }} onClick={() => handleChipAction(chip.action)}>
                                {chip.label}
                            </button>
                        ))}
                    </div>

                    {/* Photo Preview */}
                    {chatPhoto && (
                        <div style={{ position: 'relative', marginBottom: 6 }}>
                            <img src={chatPhoto} alt="preview" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }} />
                            <button onClick={() => setChatPhoto(null)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                                <X size={10} />
                            </button>
                        </div>
                    )}

                    {/* Input Bar */}
                    <input type="file" accept="image/*" capture="environment" ref={chatFileRef} onChange={handleChatPhoto} style={{ display: 'none' }} />
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button onClick={() => chatFileRef.current?.click()} style={{ background: 'rgba(99,102,241,0.1)', border: 'none', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                            <Camera size={16} color="#a78bfa" />
                        </button>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input, chatPhoto); } }}
                            placeholder="Ask about any food..."
                            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem', color: '#e2e8f0', outline: 'none' }}
                        />
                        <button onClick={() => sendMessage(input, chatPhoto)} disabled={chatLoading || (!input && !chatPhoto)}
                            style={{ background: (input || chatPhoto) ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', border: 'none', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                            <Send size={16} color={(input || chatPhoto) ? '#a78bfa' : '#475569'} />
                        </button>
                    </div>
                </div>
            )}

            {/* ═══ MY FRIDGE ═══ */}
            {activeView === 'fridge' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Add Items */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input type="file" accept="image/*" capture="environment" ref={scanFileRef} onChange={scanForFridge} style={{ display: 'none' }} />
                        <button className="btn btn-sm btn-primary" style={{ flex: 1, fontSize: '0.75rem' }} onClick={() => scanFileRef.current?.click()} disabled={scanLoading}>
                            {scanLoading ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Scanning...</> : <><Camera size={12} /> Scan Food to Add</>}
                        </button>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>

                    {/* Fridge Items */}
                    {fridgeLoading ? (
                        <div style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>
                            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                            <p style={{ fontSize: '0.82rem', marginTop: 8 }}>Loading your fridge...</p>
                        </div>
                    ) : fridgeItems.filter(f => f.status === 'active').length === 0 ? (
                        <div className="card card-sm" style={{ textAlign: 'center', padding: 30 }}>
                            <p style={{ fontSize: '1.5rem', marginBottom: 8 }}>🧊</p>
                            <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>Fridge is empty!</p>
                            <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>Scan food items to start tracking expiry dates</p>
                        </div>
                    ) : (
                        <>
                            {/* Expiring Items */}
                            {fridgeItems.filter(f => f.status === 'active' && daysUntil(f.expiryDate) <= 3).length > 0 && (
                                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f59e0b' }}>⚠️ Expiring Soon</p>
                            )}
                            {fridgeItems.filter(f => f.status === 'active').map((item, i) => {
                                const days = daysUntil(item.expiryDate);
                                const color = expiryColor(days);
                                return (
                                    <motion.div key={item.id} className="card card-sm" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                        style={{ borderLeftWidth: 3, borderLeftColor: color, padding: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ fontSize: '1.3rem' }}>{item.emoji}</span>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: 600, fontSize: '0.82rem' }}>{item.name}</p>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
                                                    <span style={{ fontSize: '0.62rem', color: '#64748b' }}>{item.quantity}</span>
                                                    <span style={{ fontSize: '0.62rem', fontWeight: 600, color }}>{expiryLabel(days)}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button onClick={() => handleUsedItem(item)} title="Used it" style={{ background: 'rgba(16,185,129,0.1)', border: 'none', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                    <span style={{ fontSize: '0.7rem' }}>✅</span>
                                                </button>
                                                <button onClick={() => handleWastedItem(item)} title="Wasted it" style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                    <span style={{ fontSize: '0.7rem' }}>🗑️</span>
                                                </button>
                                                <button onClick={() => { sendMessage(`I have ${item.name} (${item.quantity}) expiring in ${days} days. Give me a quick Indian recipe and preservation tip.`); setActiveView('chat'); }} title="Get recipe"
                                                    style={{ background: 'rgba(99,102,241,0.1)', border: 'none', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                    <span style={{ fontSize: '0.7rem' }}>🍳</span>
                                                </button>
                                            </div>
                                        </div>
                                        {item.preservationTip && (
                                            <p style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: 6, paddingLeft: 36, fontStyle: 'italic' }}>💡 {item.preservationTip}</p>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </>
                    )}
                </div>
            )}

            {/* ═══ SCOREBOARD ═══ */}
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

                    {/* This Week */}
                    <div className="card card-sm" style={{ padding: 14 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>📅 This Week</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ flex: 1, textAlign: 'center', padding: 10, background: 'rgba(16,185,129,0.08)', borderRadius: 8 }}>
                                <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#34d399' }}>{weekSaved}</p>
                                <p style={{ fontSize: '0.6rem', color: '#64748b' }}>Items Used</p>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center', padding: 10, background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>
                                <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#ef4444' }}>{weekLogs.filter(w => w.action === 'wasted').length}</p>
                                <p style={{ fontSize: '0.6rem', color: '#64748b' }}>Wasted</p>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center', padding: 10, background: 'rgba(99,102,241,0.08)', borderRadius: 8 }}>
                                <p style={{ fontWeight: 800, fontSize: '1.2rem', color: '#a78bfa' }}>{weekSaved > 0 ? Math.round((weekSaved / (weekSaved + weekLogs.filter(w => w.action === 'wasted').length)) * 100) : 0}%</p>
                                <p style={{ fontSize: '0.6rem', color: '#64748b' }}>Save Rate</p>
                            </div>
                        </div>
                    </div>

                    {/* Waste Pattern */}
                    {totalWasted > 0 && (
                        <div className="card card-sm" style={{ padding: 14, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}>
                            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f87171', marginBottom: 6 }}>📊 Waste Patterns</p>
                            <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                Most wasted: <strong style={{ color: '#e2e8f0' }}>{wasteStats.filter(w => w.action === 'wasted').map(w => w.itemName).reduce((acc, name) => { acc[name] = (acc[name] || 0) + 1; return acc; }, {})[Object.keys(wasteStats.filter(w => w.action === 'wasted').map(w => w.itemName).reduce((acc, name) => { acc[name] = (acc[name] || 0) + 1; return acc; }, {})).sort((a, b) => wasteStats.filter(w => w.action === 'wasted').map(w => w.itemName).reduce((acc, name) => { acc[name] = (acc[name] || 0) + 1; return acc; }, {})[b] - wasteStats.filter(w => w.action === 'wasted').map(w => w.itemName).reduce((acc, name) => { acc[name] = (acc[name] || 0) + 1; return acc; }, {})[a])[0]] ? Object.keys(wasteStats.filter(w => w.action === 'wasted').map(w => w.itemName).reduce((acc, name) => { acc[name] = (acc[name] || 0) + 1; return acc; }, {})).sort((a, b) => wasteStats.filter(w => w.action === 'wasted').map(w => w.itemName).reduce((acc, name) => { acc[name] = (acc[name] || 0) + 1; return acc; }, {})[b] - wasteStats.filter(w => w.action === 'wasted').map(w => w.itemName).reduce((acc, name) => { acc[name] = (acc[name] || 0) + 1; return acc; }, {})[a])[0] : 'None'}</strong>
                            </p>
                            <button className="btn btn-sm" style={{ marginTop: 8, fontSize: '0.68rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'none', width: '100%' }}
                                onClick={() => handleChipAction('grocery')}>
                                🛒 Get Smart Grocery Tips
                            </button>
                        </div>
                    )}

                    {/* Recent Activity */}
                    {wasteStats.length > 0 && (
                        <div className="card card-sm" style={{ padding: 14 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>📜 Recent Activity</p>
                            {wasteStats.slice(0, 8).map((log, i) => (
                                <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                    <span style={{ fontSize: '0.9rem' }}>{log.action === 'used' ? '✅' : '🗑️'}</span>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.72rem', fontWeight: 500 }}>{log.itemName}</p>
                                    </div>
                                    <span style={{ fontSize: '0.6rem', color: '#64748b' }}>
                                        {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}
