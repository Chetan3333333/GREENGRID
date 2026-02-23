import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Bot, User, Sparkles, HelpCircle, Package,
    ChevronRight, RotateCcw, Leaf, Shield, Zap
} from 'lucide-react';

/* ─── AI Knowledge Base ─── */
const productDB = {
    phone: { name: 'Smartphone', hazard: 'Medium', materials: 'Lithium, Copper, Gold trace, Rare earth', condition: 'Non-functional', recoveryValue: '₹400 – ₹800', grade: 'B+', co2: '2.1kg', route: 'Material Exchange (Bidding)', tip: 'Remove SIM/SD cards before recycling. Battery must be handled separately by certified recyclers.' },
    laptop: { name: 'Laptop', hazard: 'Medium', materials: 'Copper, Gold, Silver, Palladium, Aluminium', condition: 'Partially functional', recoveryValue: '₹800 – ₹2,500', grade: 'A', co2: '4.8kg', route: 'Material Exchange (Bidding)', tip: 'Wipe personal data before submission. PCB has the highest recovery value.' },
    motherboard: { name: 'Motherboard / PCB', hazard: 'Low', materials: 'Gold pins, Copper traces, Silver, Tin', condition: 'Non-functional', recoveryValue: '₹600 – ₹1,400', grade: 'A+', co2: '3.2kg', route: 'Material Exchange (Premium)', tip: 'PCBs contain precious metals — never discard in general waste.' },
    battery: { name: 'Li-ion Battery', hazard: '⚠️ High', materials: 'Lithium, Cobalt, Nickel, Manganese', condition: 'End-of-life', recoveryValue: '₹100 – ₹300', grade: 'C (Hazardous)', co2: '5.6kg', route: 'Certified Hazardous Recycling Only', tip: 'NEVER puncture or incinerate. Must be handled by certified e-waste recyclers only.' },
    plastic: { name: 'PET Plastic', hazard: 'Low', materials: 'Polyethylene Terephthalate', condition: 'Recyclable', recoveryValue: '₹50 – ₹80/kg', grade: 'A', co2: '1.5kg/kg', route: 'Material Exchange or Recycling Center', tip: 'Clean and remove labels for better grading. Separate by color if possible.' },
    newspaper: { name: 'Newspaper / Paper', hazard: 'None', materials: 'Cellulose fiber, Ink', condition: 'Recyclable', recoveryValue: '₹15 – ₹25/kg', grade: 'B+', co2: '0.9kg/kg', route: 'Material Exchange or Direct Recycler', tip: 'Keep dry and bundle neatly. Wet paper loses Grade and value.' },
    glass: { name: 'Glass Bottles', hazard: 'Low (sharp)', materials: 'Silica, Soda ash, Limestone', condition: 'Recyclable', recoveryValue: '₹8 – ₹15/kg', grade: 'A', co2: '0.6kg/kg', route: 'Recycling Center', tip: 'Separate by color (clear/green/amber) for better pricing.' },
    aluminium: { name: 'Aluminium Cans', hazard: 'None', materials: 'Aluminium alloy', condition: 'Recyclable', recoveryValue: '₹80 – ₹120/kg', grade: 'A+', co2: '8.0kg/kg', route: 'Material Exchange (High demand)', tip: 'Aluminium is infinitely recyclable. Crush cans to save space.' },
    clothes: { name: 'Textile / Clothes', hazard: 'None', materials: 'Cotton, Polyester, Nylon', condition: 'Reusable / Recyclable', recoveryValue: '₹10 – ₹40/kg', grade: 'B', co2: '1.2kg/kg', route: 'Donate (if usable) or Textile Recycler', tip: 'Functional clothes should be donated to NGOs for maximum social impact.' },
    ewaste: { name: 'General E-Waste', hazard: 'Medium', materials: 'Mixed metals, Plastics, Glass', condition: 'End-of-life', recoveryValue: '₹200 – ₹1,000', grade: 'B', co2: '3.5kg', route: 'Material Exchange or Certified Pickup', tip: 'Use GreenGrid AI Scanner for detailed material breakdown and best routing.' },
};

const faqDB = [
    { q: 'what is greengrid', a: 'GreenGrid is an AI-Powered Smart Recycling Exchange. We help you evaluate waste materials, connect with certified recyclers through competitive bidding, and earn rewards for responsible recycling. Think of it as a circular economy platform — not a marketplace like OLX.' },
    { q: 'how does bidding work', a: 'When you post material to our exchange:\n\n1️⃣ AI evaluates your material (condition, hazard, recovery value)\n2️⃣ Certified recyclers place competitive bids\n3️⃣ You accept the best bid\n4️⃣ Free doorstep pickup is scheduled\n5️⃣ Payment credited to your wallet\n\nAll merchants are verified — no unregulated buyers.' },
    { q: 'how do i earn', a: 'You can earn in two ways:\n\n💰 **Cash (₹)** — From accepted bids on Material Exchange\n🪙 **GreenCoins** — From donations, recycling, and eco actions\n\nGreenCoins can be redeemed in our Eco Shop for sustainable products.' },
    { q: 'what is smart deal', a: 'Smart Deal Mode is a one-to-one Direct Recovery Agreement. Instead of open bidding, you:\n\n1. Select a verified merchant\n2. Receive a price offer\n3. Accept, Counter-offer, or Request Inspection\n4. Confirm → Pickup → Payment\n\nIdeal for quick sales or bulk deals.' },
    { q: 'how is this different from olx', a: 'Great question! Key differences:\n\n| | OLX | GreenGrid |\n|---|---|---|\n| Parties | Consumer ↔ Consumer | Waste owner ↔ Certified Recyclers |\n| Items | Usable products | End-of-life materials |\n| Goal | Resale | Resource Recovery |\n| AI | None | Material evaluation + routing |\n| Safety | Self-managed | Verified merchants only |' },
    { q: 'what is green score', a: 'Your Green Credit Score (0–900) measures your sustainability impact. It increases when you:\n\n✅ Recycle materials responsibly\n✅ Donate to NGOs\n✅ Use the Material Exchange\n✅ Reduce CO₂ footprint\n\nHigher scores unlock better rewards and merchant access.' },
    { q: 'is it safe', a: 'Absolutely! GreenGrid ensures safety through:\n\n🛡️ All merchants are certified and verified\n🔒 Structured transactions — no free chatting\n📋 AI hazard detection for dangerous materials\n🚛 Insured doorstep pickup\n💳 Secure wallet payments' },
    { q: 'what materials can i recycle', a: 'GreenGrid accepts:\n\n📱 Electronics & E-Waste (phones, laptops, PCBs)\n🧴 Plastics (PET, HDPE, PP)\n📦 Paper & Cardboard\n🥫 Metals (aluminium, copper, steel)\n🫙 Glass\n👕 Textiles\n🔋 Batteries (certified handling)\n🍎 Food waste (composting)\n\nUse our AI Scanner for detailed analysis!' },
];

function matchProduct(text) {
    const lower = text.toLowerCase();
    for (const [key, val] of Object.entries(productDB)) {
        if (lower.includes(key)) return val;
    }
    if (lower.includes('mobile') || lower.includes('iphone') || lower.includes('samsung')) return productDB.phone;
    if (lower.includes('computer') || lower.includes('pc') || lower.includes('macbook')) return productDB.laptop;
    if (lower.includes('pcb') || lower.includes('circuit')) return productDB.motherboard;
    if (lower.includes('bottle') && lower.includes('glass')) return productDB.glass;
    if (lower.includes('bottle') || lower.includes('pet')) return productDB.plastic;
    if (lower.includes('can') || lower.includes('metal') || lower.includes('steel')) return productDB.aluminium;
    if (lower.includes('paper') || lower.includes('cardboard') || lower.includes('news')) return productDB.newspaper;
    if (lower.includes('cloth') || lower.includes('shirt') || lower.includes('textile') || lower.includes('fabric')) return productDB.clothes;
    if (lower.includes('electronic') || lower.includes('device') || lower.includes('gadget')) return productDB.ewaste;
    return null;
}

function matchFAQ(text) {
    const lower = text.toLowerCase();
    let best = null, bestScore = 0;
    for (const faq of faqDB) {
        const words = faq.q.split(' ');
        let score = 0;
        for (const w of words) {
            if (lower.includes(w)) score++;
        }
        if (score > bestScore) { bestScore = score; best = faq; }
    }
    return bestScore >= 2 ? best : null;
}

function formatProductResult(p) {
    return `🧪 **AI Material Analysis: ${p.name}**\n\n` +
        `📊 **Condition:** ${p.condition}\n` +
        `⚠️ **Hazard Level:** ${p.hazard}\n` +
        `🔬 **Materials:** ${p.materials}\n` +
        `💰 **Recovery Value:** ${p.recoveryValue}\n` +
        `📈 **Grade:** ${p.grade}\n` +
        `🌍 **CO₂ Impact:** ${p.co2} saved\n` +
        `🚀 **Recommended Route:** ${p.route}\n\n` +
        `💡 **Tip:** ${p.tip}`;
}

/* ─── Quick Suggestions ─── */
const productSuggestions = [
    '📱 Test my old phone',
    '💻 Evaluate a laptop',
    '🔋 Is my battery safe?',
    '🧴 PET plastic value?',
    '📰 How much for newspaper?',
    '🥫 Aluminium can price?',
];

const doubtSuggestions = [
    '❓ What is GreenGrid?',
    '💰 How do I earn?',
    '🤝 How does bidding work?',
    '🆚 How is this different from OLX?',
    '🛡️ Is it safe?',
    '♻️ What can I recycle?',
];

/* ─── Component ─── */
export default function ChatbotPage() {
    const [mode, setMode] = useState('product'); // 'product' | 'doubt'
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const chatRef = useRef(null);

    useEffect(() => {
        // Welcome message on mode switch
        const welcome = mode === 'product'
            ? { from: 'bot', text: '🧪 **Product Testing Mode**\n\nTell me what material or product you have, and I\'ll run an AI analysis — hazard level, recovery value, grade, and best routing.\n\nTry: "Test my old phone" or "What\'s a motherboard worth?"' }
            : { from: 'bot', text: '💬 **Ask Me Anything**\n\nI can answer questions about GreenGrid, recycling, bidding, earning rewards, safety, and more.\n\nTry: "How does bidding work?" or "What is Green Score?"' };
        setMessages([welcome]);
    }, [mode]);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages, typing]);

    const handleSend = (text) => {
        const msg = text || input.trim();
        if (!msg) return;
        setInput('');

        const userMsg = { from: 'user', text: msg };
        setMessages(prev => [...prev, userMsg]);
        setTyping(true);

        setTimeout(() => {
            let reply;
            if (mode === 'product') {
                const product = matchProduct(msg);
                if (product) {
                    reply = { from: 'bot', text: formatProductResult(product), isResult: true };
                } else {
                    reply = { from: 'bot', text: '🤔 I couldn\'t identify that product. Try mentioning specific items like:\n\n• Phone, Laptop, Motherboard\n• Battery, Plastic, Newspaper\n• Glass, Aluminium, Clothes\n\nOr describe what material it\'s made of!' };
                }
            } else {
                const faq = matchFAQ(msg);
                if (faq) {
                    reply = { from: 'bot', text: faq.a };
                } else {
                    reply = { from: 'bot', text: '🤔 I\'m not sure about that one. Here are topics I can help with:\n\n• How GreenGrid works\n• Bidding & Smart Deal Mode\n• Earning GreenCoins & Cash\n• Safety & Verification\n• Supported materials\n• Green Credit Score\n\nTry asking about any of these!' };
                }
            }
            setTyping(false);
            setMessages(prev => [...prev, reply]);
        }, 1200 + Math.random() * 800);
    };

    const suggestions = mode === 'product' ? productSuggestions : doubtSuggestions;

    return (
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)', padding: '16px 16px 8px' }}>

            {/* Mode Tabs */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={s.tabRow}>
                <button
                    className={`tab-pill ${mode === 'product' ? 'active' : ''}`}
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setMode('product')}
                >
                    <Package size={14} /> Product Test
                </button>
                <button
                    className={`tab-pill ${mode === 'doubt' ? 'active' : ''}`}
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setMode('doubt')}
                >
                    <HelpCircle size={14} /> Ask Doubts
                </button>
            </motion.div>

            {/* Chat Messages */}
            <div ref={chatRef} style={s.chatArea}>
                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}
                        >
                            {msg.from === 'bot' && (
                                <div style={s.botIcon}>
                                    <Bot size={14} color="#10b981" />
                                </div>
                            )}
                            <div style={{
                                ...s.bubble,
                                ...(msg.from === 'user' ? s.userBubble : s.botBubble),
                                ...(msg.isResult ? s.resultBubble : {}),
                            }}>
                                {msg.text.split('\n').map((line, j) => {
                                    let rendered = line
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/\|(.*?)\|/g, '<span style="color:#94a3b8">|$1|</span>');
                                    return <p key={j} style={{ margin: line === '' ? 6 : 2 }} dangerouslySetInnerHTML={{ __html: rendered }} />;
                                })}
                            </div>
                            {msg.from === 'user' && (
                                <div style={s.userIcon}>
                                    <User size={14} color="#3b82f6" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {typing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}
                    >
                        <div style={s.botIcon}>
                            <Bot size={14} color="#10b981" />
                        </div>
                        <div style={{ ...s.bubble, ...s.botBubble, display: 'flex', gap: 4, padding: '12px 18px' }}>
                            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} style={s.dot} />
                            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} style={s.dot} />
                            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} style={s.dot} />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={s.suggestRow}>
                    {suggestions.map((sug, i) => (
                        <motion.button
                            key={i}
                            className="tab-pill"
                            style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                            onClick={() => handleSend(sug)}
                            whileTap={{ scale: 0.95 }}
                        >
                            {sug}
                        </motion.button>
                    ))}
                </motion.div>
            )}

            {/* Input Bar */}
            <div style={s.inputBar}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={mode === 'product' ? 'Describe your product or material...' : 'Ask any question about GreenGrid...'}
                    style={s.input}
                />
                <motion.button
                    style={s.sendBtn}
                    onClick={() => handleSend()}
                    whileTap={{ scale: 0.9 }}
                    disabled={!input.trim()}
                >
                    <Send size={18} color={input.trim() ? '#10b981' : '#475569'} />
                </motion.button>
            </div>
        </div>
    );
}

const s = {
    tabRow: { display: 'flex', gap: 8, marginBottom: 12 },
    chatArea: {
        flex: 1, overflowY: 'auto', paddingRight: 4,
        scrollBehavior: 'smooth',
    },
    bubble: {
        maxWidth: '80%', padding: '10px 14px',
        borderRadius: 16, fontSize: '0.82rem', lineHeight: 1.55,
        wordBreak: 'break-word',
    },
    userBubble: {
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: '#fff', borderBottomRightRadius: 4,
    },
    botBubble: {
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#e2e8f0', borderBottomLeftRadius: 4,
    },
    resultBubble: {
        background: 'rgba(16,185,129,0.06)',
        border: '1px solid rgba(16,185,129,0.15)',
    },
    botIcon: {
        width: 28, height: 28, borderRadius: '50%',
        background: 'rgba(16,185,129,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginRight: 6, marginTop: 2,
    },
    userIcon: {
        width: 28, height: 28, borderRadius: '50%',
        background: 'rgba(59,130,246,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginLeft: 6, marginTop: 2,
    },
    dot: {
        width: 6, height: 6, borderRadius: '50%',
        background: '#10b981',
    },
    suggestRow: {
        display: 'flex', gap: 6, overflowX: 'auto',
        paddingBottom: 8, marginBottom: 4,
    },
    inputBar: {
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
    },
    input: {
        flex: 1, background: 'none', border: 'none', outline: 'none',
        color: '#f1f5f9', fontSize: '0.88rem', fontFamily: 'inherit',
    },
    sendBtn: {
        width: 40, height: 40, borderRadius: '50%',
        background: 'rgba(16,185,129,0.1)', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
    },
};
