import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Leaf, Sprout, Home, Truck, MapPin, Clock, ChevronRight, ArrowRight, ArrowLeft,
    CheckCircle, Plus, X, Loader2, Camera, RotateCcw, Calendar, AlertTriangle, Info
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveCompostEntry, getCompostEntries, updateCompostStatus, addTransaction, updateUserStats } from '../services/database';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// ── Waste Categories ──
const wasteCategories = [
    { id: 'fruit_peels', label: 'Fruit Peels', emoji: '🍌', type: 'green', desc: 'Banana, apple, orange peels' },
    { id: 'veggie_scraps', label: 'Veggie Scraps', emoji: '🥕', type: 'green', desc: 'Onion skins, potato peels, ends' },
    { id: 'coffee_tea', label: 'Coffee & Tea', emoji: '☕', type: 'green', desc: 'Grounds, tea leaves, used filters' },
    { id: 'eggshells', label: 'Eggshells', emoji: '🥚', type: 'green', desc: 'Crushed eggshells' },
    { id: 'stale_food', label: 'Stale Bread/Rice', emoji: '🍞', type: 'green', desc: 'Old bread, stale rice, roti' },
    { id: 'dry_leaves', label: 'Dry Leaves', emoji: '🍂', type: 'brown', desc: 'Garden leaves, dried plants' },
    { id: 'cardboard', label: 'Cardboard/Paper', emoji: '📦', type: 'brown', desc: 'Newspaper, egg cartons, boxes' },
    { id: 'coconut', label: 'Coconut Shells', emoji: '🥥', type: 'brown', desc: 'Shells, husks, coir' },
    { id: 'sawdust', label: 'Sawdust/Wood', emoji: '🪵', type: 'brown', desc: 'Sawdust, small wood chips' },
    { id: 'garden_waste', label: 'Garden Waste', emoji: '🌿', type: 'green', desc: 'Grass clippings, small weeds' },
];

const rejectItems = [
    { label: 'Meat & Fish', emoji: '🥩', reason: 'Attracts pests & produces bad odor' },
    { label: 'Dairy Products', emoji: '🧀', reason: 'Creates foul smell & attracts flies' },
    { label: 'Oily/Greasy Food', emoji: '🍳', reason: 'Slows decomposition, attracts pests' },
    { label: 'Diseased Plants', emoji: '🌿', reason: 'Can spread disease to compost' },
    { label: 'Plastic/Metal', emoji: '🥤', reason: 'Non-biodegradable — recycle instead' },
    { label: 'Pet Waste', emoji: '🐕', reason: 'Contains harmful pathogens' },
];

// ── Composting Methods ──
const compostMethods = [
    {
        id: 'home', label: '🏠 Home Composting', icon: Home, color: '#10b981',
        desc: 'Compost in your balcony or garden', time: '4-8 weeks',
        details: 'Best for: People with a balcony, terrace, or garden. Use a bucket, pot, or bin.'
    },
    {
        id: 'community', label: '🌿 Community Garden', icon: Sprout, color: '#3b82f6',
        desc: 'Drop off at a local composting center', time: '2-4 weeks',
        details: 'Best for: Apartment dwellers with no space. Nearby gardens accept organic waste.'
    },
    {
        id: 'commercial', label: '🏭 Commercial Pickup', icon: Truck, color: '#f59e0b',
        desc: 'Schedule pickup by a composting company', time: '1-2 weeks',
        details: 'Best for: Restaurants, hostels, bulk waste. Companies collect & process.'
    },
];

// ── Community Gardens / Facilities (mock data) ──
const facilities = [
    { name: 'Green Earth Community Garden', dist: '1.2 km', type: 'community', rating: 4.7, reviews: 89, capacity: 'Open', timing: '7am - 6pm', phone: '+91-9876543210' },
    { name: 'DLF Urban Farm', dist: '2.8 km', type: 'community', rating: 4.5, reviews: 56, capacity: 'Open', timing: '8am - 5pm', phone: '+91-8765432109' },
    { name: 'EcoRecycle Solutions', dist: '1.5 km', type: 'commercial', rating: 4.9, reviews: 234, capacity: 'Open', timing: '24/7', phone: '+91-7654321098' },
    { name: 'BioGreen Composters', dist: '3.1 km', type: 'commercial', rating: 4.6, reviews: 167, capacity: 'Open', timing: '6am - 8pm', phone: '+91-6543210987' },
    { name: 'Miyawaki Forest Project', dist: '4.0 km', type: 'community', rating: 4.8, reviews: 45, capacity: 'Limited', timing: '9am - 4pm', phone: '+91-5432109876' },
];

const pickupSlots = [
    'Today 10 AM – 12 PM', 'Today 2 PM – 4 PM', 'Today 5 PM – 7 PM',
    'Tomorrow 8 AM – 10 AM', 'Tomorrow 11 AM – 1 PM', 'Tomorrow 3 PM – 5 PM',
];

const compostTrackingStages = [
    { key: 'submitted', label: 'Submitted', emoji: '📋', msg: 'Compost request submitted' },
    { key: 'collected', label: 'Collected', emoji: '📦', msg: 'Waste collected / dropped off' },
    { key: 'processing', label: 'Processing', emoji: '🔄', msg: 'Decomposition in progress' },
    { key: 'maturing', label: 'Maturing', emoji: '🌱', msg: 'Compost is maturing' },
    { key: 'ready', label: 'Ready!', emoji: '✅', msg: 'Compost is ready to use!' },
];

// ── Composting Tips per method ──
const homeTips = [
    { step: 1, title: 'Start with Browns', desc: 'Layer 5cm of dry leaves or shredded newspaper at the bottom', emoji: '🍂' },
    { step: 2, title: 'Add Greens', desc: 'Put your kitchen scraps (fruit peels, veggie waste) on top', emoji: '🥬' },
    { step: 3, title: 'Sprinkle Soil', desc: 'Add a thin layer of garden soil — introduces microorganisms', emoji: '🪴' },
    { step: 4, title: 'Repeat Layers', desc: 'Keep alternating: Brown → Green → Soil → Brown → Green', emoji: '📚' },
    { step: 5, title: 'Moisten', desc: 'Spray water until it feels like a wrung-out sponge', emoji: '💧' },
    { step: 6, title: 'Cover & Wait', desc: 'Close lid, turn every 3-5 days. Ready in 4-8 weeks!', emoji: '⏳' },
];

const troubleshooting = [
    { problem: 'Bad smell 🤢', fix: 'Add more browns (dry leaves, cardboard)', icon: '🍂' },
    { problem: 'Attracting insects 🐜', fix: 'Bury greens under browns, add lime', icon: '🧱' },
    { problem: 'Too slow 🐌', fix: 'Chop waste smaller, add more greens, turn more often', icon: '✂️' },
    { problem: 'Too wet 💧', fix: 'Add cardboard/newspaper, stop watering', icon: '📰' },
    { problem: 'Too dry 🏜️', fix: 'Spray water, add fresh green waste', icon: '💧' },
];

function fadeUp(d = 0) {
    return { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.3 } };
}

export default function CompostWizard({ userId }) {
    const [step, setStep] = useState(0); // 0=landing, 1-6=steps
    const [loading, setLoading] = useState(false);

    // Step 1 — Waste selection
    const [selectedWaste, setSelectedWaste] = useState([]);
    const [quantity, setQuantity] = useState('');
    const [wastePhoto, setWastePhoto] = useState(null);
    const [aiScanResult, setAiScanResult] = useState(null);
    const [scanLoading, setScanLoading] = useState(false);
    const photoRef = useRef(null);

    // Step 2 — Method
    const [method, setMethod] = useState(null);

    // Step 3 — Schedule
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [address, setAddress] = useState('');

    // Step 5 — Tracking
    const [trackIdx, setTrackIdx] = useState(0);
    const [lastEntryId, setLastEntryId] = useState(null);

    // My compost entries
    const [myEntries, setMyEntries] = useState([]);

    // Load entries
    useEffect(() => {
        if (!userId) return;
        getCompostEntries(userId).then(setMyEntries).catch(() => { });
    }, [userId, step]);

    // Tracking simulation
    useEffect(() => {
        if (step !== 5) return;
        const timers = [2000, 4000, 6000, 8000];
        const ids = timers.map((ms, i) => setTimeout(() => setTrackIdx(i + 1), ms));
        const final = setTimeout(() => handleComplete(), 10000);
        return () => { ids.forEach(clearTimeout); clearTimeout(final); };
    }, [step]);

    // Toggle waste selection
    function toggleWaste(id) {
        setSelectedWaste(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);
    }

    // AI scan photo
    async function handlePhotoScan(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setScanLoading(true);
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const base64 = ev.target.result;
            setWastePhoto(base64);
            try {
                const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
                const prompt = `Analyze this photo of waste/food scraps. For each item you see, classify it as:
                - "green" (nitrogen-rich: fresh peels, veggie scraps, coffee grounds)
                - "brown" (carbon-rich: dry leaves, cardboard, paper)
                - "reject" (NOT compostable: meat, dairy, plastic, metal)
                Respond in JSON array format: [{"name": "item", "type": "green|brown|reject", "emoji": "🍌"}]`;
                const imagePart = { inlineData: { data: base64.split(',')[1], mimeType: 'image/jpeg' } };
                const result = await model.generateContent([prompt, imagePart]);
                const text = result.response.text();
                const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
                setAiScanResult(JSON.parse(clean));
            } catch (err) {
                console.error('AI scan error:', err);
                setAiScanResult(null);
            }
            setScanLoading(false);
        };
        reader.readAsDataURL(file);
    }

    // Get counts
    const greenCount = selectedWaste.filter(id => wasteCategories.find(w => w.id === id)?.type === 'green').length;
    const brownCount = selectedWaste.filter(id => wasteCategories.find(w => w.id === id)?.type === 'brown').length;

    // Get relevant facilities
    const relevantFacilities = method ? facilities.filter(f => method === 'home' ? false : f.type === method) : [];

    // Confirm & save
    async function handleConfirm() {
        setLoading(true);
        try {
            const entryId = await saveCompostEntry(userId, {
                wasteItems: selectedWaste,
                quantity: quantity || '1 bag',
                method,
                facility: selectedFacility !== null ? relevantFacilities[selectedFacility]?.name : 'Home',
                timeSlot: method === 'home' ? 'Self-managed' : (selectedSlot !== null ? pickupSlots[selectedSlot] : ''),
                address: method === 'home' ? 'Home' : address,
                greenCount, brownCount,
            });
            setLastEntryId(entryId);
            await addTransaction(userId, { type: 'earned', amount: 100, description: 'Compost submission reward', category: 'compost' });
            await updateUserStats(userId, { greenCoins: 100, co2Saved: 1.8, itemsRecycled: 1 });
            setStep(5);
        } catch (err) {
            console.error('Save error:', err);
        }
        setLoading(false);
    }

    // Complete
    async function handleComplete() {
        setStep(6);
    }

    // Reset
    function resetAll() {
        setStep(0); setSelectedWaste([]); setQuantity(''); setWastePhoto(null);
        setAiScanResult(null); setMethod(null); setSelectedFacility(null);
        setSelectedSlot(null); setAddress(''); setTrackIdx(0); setLastEntryId(null);
    }

    // ═══ STEP 5: TRACKING ═══
    if (step === 5) return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <motion.div {...fadeUp(0)}>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>🔄 Tracking Compost</h3>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>
                    {method === 'home' ? 'Your home composting journey' : `Sent to ${relevantFacilities[selectedFacility]?.name || 'facility'}`}
                </p>
            </motion.div>
            <motion.div {...fadeUp(0.1)} className="card" style={{ padding: 20 }}>
                {compostTrackingStages.map((stage, i) => {
                    const done = i <= trackIdx;
                    const current = i === trackIdx;
                    return (
                        <div key={stage.key} style={{ display: 'flex', gap: 14, minHeight: i < compostTrackingStages.length - 1 ? 56 : 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32 }}>
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.15, type: 'spring' }}
                                    style={{
                                        width: 32, height: 32, borderRadius: '50%', background: done ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.06)',
                                        border: done ? 'none' : '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', position: 'relative'
                                    }}>
                                    {done ? stage.emoji : <span style={{ color: '#475569', fontSize: '0.7rem' }}>{i + 1}</span>}
                                    {current && <motion.div animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }} transition={{ repeat: Infinity, duration: 1.5 }}
                                        style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '2px solid #10b981' }} />}
                                </motion.div>
                                {i < compostTrackingStages.length - 1 && <div style={{ width: 2, flex: 1, background: done ? '#10b981' : 'rgba(255,255,255,0.06)' }} />}
                            </div>
                            <div style={{ paddingBottom: 16 }}>
                                <p style={{ fontWeight: 600, fontSize: '0.85rem', color: done ? '#e2e8f0' : '#475569' }}>{stage.label}</p>
                                <p style={{ fontSize: '0.72rem', color: done ? '#94a3b8' : '#334155' }}>{stage.msg}</p>
                            </div>
                        </div>
                    );
                })}
            </motion.div>
        </div>
    );

    // ═══ STEP 6: COMPLETION ═══
    if (step === 6) return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <motion.div {...fadeUp(0)} className="card" style={{ textAlign: 'center', padding: 28 }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                    style={{
                        width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2.5rem'
                    }}>
                    🌱
                </motion.div>
                <h3 style={{ fontWeight: 800, fontSize: '1.3rem' }}>Composting Started! 🎉</h3>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 8 }}>
                    {method === 'home' ? 'Your home composting journey has begun!' : 'Your waste has been sent for processing!'}
                </p>
            </motion.div>

            {/* Impact Stats */}
            <motion.div {...fadeUp(0.2)} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    {[
                        { val: '+100', label: 'GreenCoins', color: '#10b981', emoji: '🪙' },
                        { val: '1.8 kg', label: 'CO₂ Prevented', color: '#3b82f6', emoji: '🌍' },
                        { val: quantity || '1 bag', label: 'Composted', color: '#f59e0b', emoji: '♻️' },
                    ].map((stat, i) => (
                        <motion.div key={i} {...fadeUp(0.3 + i * 0.1)} style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '1.2rem' }}>{stat.emoji}</p>
                            <p style={{ fontWeight: 800, fontSize: '1.1rem', color: stat.color }}>{stat.val}</p>
                            <p style={{ fontSize: '0.62rem', color: '#64748b', marginTop: 2 }}>{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Home composting tips */}
            {method === 'home' && (
                <motion.div {...fadeUp(0.5)} className="card card-sm" style={{ padding: 14 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>⏰ Your Composting Schedule</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[
                            { day: 'Every 3-5 days', task: '🔄 Turn/mix your compost', color: '#3b82f6' },
                            { day: 'Weekly', task: '💧 Check moisture (wrung-out sponge feel)', color: '#10b981' },
                            { day: 'Week 4-6', task: '🌡️ Should be warm inside = good!', color: '#f59e0b' },
                            { day: 'Week 6-8', task: '✅ Dark, crumbly & earthy smell = READY!', color: '#10b981' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: item.color, minWidth: 80 }}>{item.day}</span>
                                <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>{item.task}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div {...fadeUp(0.6)} style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={resetAll}>
                    <RotateCcw size={14} /> Compost More
                </button>
            </motion.div>
        </div>
    );

    // ═══ MAIN: LANDING + STEPS 1-4 ═══
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Header with back button */}
            {step > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => setStep(s => s - 1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>Step {step} of 4</p>
                        <p style={{ fontSize: '0.65rem', color: '#64748b' }}>
                            {['', 'Waste Classification', 'Choose Method', 'Schedule / Setup', 'Review & Confirm'][step]}
                        </p>
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            {step > 0 && step <= 4 && (
                <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? '#10b981' : 'rgba(255,255,255,0.06)', transition: 'background 0.3s' }} />
                    ))}
                </div>
            )}

            {/* ── STEP 0: LANDING ── */}
            {step === 0 && (
                <>
                    {/* CTA Card */}
                    <motion.div {...fadeUp(0.1)} className="card" style={{ textAlign: 'center', padding: 24, background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(52,211,153,0.04))', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <span style={{ fontSize: '2.5rem' }}>🌱</span>
                        <h3 style={{ fontWeight: 800, fontSize: '1.05rem', marginTop: 10 }}>Start Composting & Earn Rewards</h3>
                        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 6, lineHeight: 1.5 }}>
                            Classify waste, choose your method, and track the composting process — all AI-guided
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 14 }}>
                            {[
                                { val: '+100', label: 'GreenCoins', emoji: '🪙' },
                                { val: '1.8 kg', label: 'CO₂ Prevented', emoji: '🌍' },
                                { val: '3 Ways', label: 'To Compost', emoji: '♻️' },
                            ].map((s, i) => (
                                <div key={i} style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.9rem' }}>{s.emoji}</p>
                                    <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#10b981' }}>{s.val}</p>
                                    <p style={{ fontSize: '0.55rem', color: '#64748b' }}>{s.label}</p>
                                </div>
                            ))}
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={() => setStep(1)}>
                            Start Composting <ArrowRight size={16} />
                        </button>
                    </motion.div>

                    {/* How it works */}
                    <motion.div {...fadeUp(0.2)}>
                        <div className="section-header"><span className="section-title">How It Works</span></div>
                        <div className="card card-sm" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { step: '1', text: 'Classify waste — Green, Brown, or Reject', color: '#10b981' },
                                { step: '2', text: 'Choose method — Home, Community, or Pickup', color: '#3b82f6' },
                                { step: '3', text: 'Schedule drop-off or setup at home', color: '#f59e0b' },
                                { step: '4', text: 'Track progress & earn GreenCoins', color: '#ef4444' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${item.color}18`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>{item.step}</div>
                                    <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* My Compost History */}
                    {myEntries.length > 0 && (
                        <motion.div {...fadeUp(0.3)}>
                            <div className="section-header"><span className="section-title">My Compost History</span></div>
                            {myEntries.slice(0, 5).map((entry, i) => (
                                <div key={entry.id} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                    <span style={{ fontSize: '1.2rem' }}>🌱</span>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.78rem' }}>{entry.method === 'home' ? 'Home Composting' : entry.facility}</p>
                                        <p style={{ fontSize: '0.62rem', color: '#64748b' }}>{entry.quantity} • {new Date(entry.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                                    </div>
                                    <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: 8, background: entry.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)', color: entry.status === 'active' ? '#34d399' : '#a78bfa' }}>
                                        {entry.status === 'active' ? '🔄 Active' : '✅ Done'}
                                    </span>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </>
            )}

            {/* ── STEP 1: WASTE CLASSIFICATION ── */}
            {step === 1 && (
                <>
                    <motion.div {...fadeUp(0.05)} className="card card-sm" style={{ padding: 12, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 4 }}>🔑 Golden Rule</p>
                        <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Mix <strong style={{ color: '#10b981' }}>3 parts Brown (🟤)</strong> with <strong style={{ color: '#34d399' }}>1 part Green (🟢)</strong> for best results</p>
                    </motion.div>

                    {/* AI Photo Scan */}
                    <motion.div {...fadeUp(0.1)} style={{ display: 'flex', gap: 8 }}>
                        <input type="file" accept="image/*" capture="environment" ref={photoRef} onChange={handlePhotoScan} style={{ display: 'none' }} />
                        <button className="btn btn-sm" style={{ flex: 1, fontSize: '0.72rem', background: 'rgba(99,102,241,0.1)', color: '#a78bfa', border: '1px solid rgba(99,102,241,0.2)' }}
                            onClick={() => photoRef.current?.click()} disabled={scanLoading}>
                            {scanLoading ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Scanning...</> : <><Camera size={14} /> 📸 AI Classify</>}
                        </button>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </motion.div>

                    {/* AI Scan Results */}
                    {aiScanResult && (
                        <motion.div {...fadeUp(0)} className="card card-sm" style={{ padding: 12 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.78rem', marginBottom: 6 }}>🧠 AI Detected:</p>
                            {aiScanResult.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
                                    <span>{item.emoji}</span>
                                    <span style={{ flex: 1, fontSize: '0.72rem' }}>{item.name}</span>
                                    <span style={{
                                        fontSize: '0.58rem', padding: '2px 6px', borderRadius: 4,
                                        background: item.type === 'green' ? 'rgba(16,185,129,0.1)' : item.type === 'brown' ? 'rgba(161,98,7,0.1)' : 'rgba(239,68,68,0.1)',
                                        color: item.type === 'green' ? '#34d399' : item.type === 'brown' ? '#d97706' : '#ef4444'
                                    }}>
                                        {item.type === 'green' ? '🟢 Green' : item.type === 'brown' ? '🟤 Brown' : '❌ Reject'}
                                    </span>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* Manual Selection — Green (Nitrogen) */}
                    <motion.div {...fadeUp(0.15)}>
                        <p style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 6 }}>🟢 Green Waste (Nitrogen-rich)</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {wasteCategories.filter(w => w.type === 'green').map(w => (
                                <div key={w.id} className="card card-sm" onClick={() => toggleWaste(w.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px',
                                        border: selectedWaste.includes(w.id) ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.06)',
                                        background: selectedWaste.includes(w.id) ? 'rgba(16,185,129,0.06)' : undefined
                                    }}>
                                    <span style={{ fontSize: '1.2rem' }}>{w.emoji}</span>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.78rem' }}>{w.label}</p>
                                        <p style={{ fontSize: '0.6rem', color: '#64748b' }}>{w.desc}</p>
                                    </div>
                                    {selectedWaste.includes(w.id) && <CheckCircle size={16} color="#10b981" />}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Manual Selection — Brown (Carbon) */}
                    <motion.div {...fadeUp(0.2)}>
                        <p style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 6, marginTop: 8 }}>🟤 Brown Waste (Carbon-rich)</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {wasteCategories.filter(w => w.type === 'brown').map(w => (
                                <div key={w.id} className="card card-sm" onClick={() => toggleWaste(w.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px',
                                        border: selectedWaste.includes(w.id) ? '1px solid rgba(161,98,7,0.4)' : '1px solid rgba(255,255,255,0.06)',
                                        background: selectedWaste.includes(w.id) ? 'rgba(161,98,7,0.06)' : undefined
                                    }}>
                                    <span style={{ fontSize: '1.2rem' }}>{w.emoji}</span>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.78rem' }}>{w.label}</p>
                                        <p style={{ fontSize: '0.6rem', color: '#64748b' }}>{w.desc}</p>
                                    </div>
                                    {selectedWaste.includes(w.id) && <CheckCircle size={16} color="#d97706" />}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Reject Warning */}
                    <motion.div {...fadeUp(0.25)} className="card card-sm" style={{ padding: 12, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.78rem', color: '#f87171', marginBottom: 6 }}>❌ Do NOT Compost These</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {rejectItems.map((r, i) => (
                                <span key={i} style={{ fontSize: '0.6rem', padding: '3px 8px', borderRadius: 6, background: 'rgba(239,68,68,0.06)', color: '#fca5a5' }}>
                                    {r.emoji} {r.label}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quantity */}
                    <motion.div {...fadeUp(0.3)}>
                        <p style={{ fontWeight: 600, fontSize: '0.78rem', marginBottom: 6 }}>📏 Quantity</p>
                        <input value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g., 2 bags, 5 kg"
                            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', color: '#e2e8f0', outline: 'none', boxSizing: 'border-box' }} />
                    </motion.div>

                    {/* Summary bar */}
                    {selectedWaste.length > 0 && (
                        <motion.div {...fadeUp(0)} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', borderRadius: 10, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
                            <span style={{ fontSize: '0.68rem', color: '#10b981' }}>🟢 {greenCount} Green</span>
                            <span style={{ fontSize: '0.68rem', color: '#d97706' }}>🟤 {brownCount} Brown</span>
                            {brownCount > 0 && greenCount > 0 && (
                                <span style={{ fontSize: '0.6rem', color: brownCount >= greenCount * 2 ? '#34d399' : '#f59e0b', marginLeft: 'auto' }}>
                                    {brownCount >= greenCount * 2 ? '✅ Good ratio!' : '⚠️ Add more browns'}
                                </span>
                            )}
                        </motion.div>
                    )}

                    {/* Next Button */}
                    <button className="btn btn-primary" style={{ width: '100%' }} disabled={selectedWaste.length === 0} onClick={() => setStep(2)}>
                        Next: Choose Method <ArrowRight size={16} />
                    </button>
                </>
            )}

            {/* ── STEP 2: CHOOSE METHOD ── */}
            {step === 2 && (
                <>
                    <motion.div {...fadeUp(0.05)}>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 10 }}>How do you want to compost?</p>
                    </motion.div>
                    {compostMethods.map((m, i) => (
                        <motion.div key={m.id} {...fadeUp(0.1 + i * 0.05)} className="card" onClick={() => setMethod(m.id)}
                            style={{
                                cursor: 'pointer', padding: 16,
                                border: method === m.id ? `1px solid ${m.color}60` : '1px solid rgba(255,255,255,0.06)',
                                background: method === m.id ? `${m.color}10` : undefined
                            }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${m.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <m.icon size={20} color={m.color} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 700, fontSize: '0.88rem' }}>{m.label}</p>
                                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>{m.desc}</p>
                                    <p style={{ fontSize: '0.6rem', color: '#64748b', marginTop: 2 }}>⏱️ {m.time}</p>
                                </div>
                                {method === m.id && <CheckCircle size={18} color={m.color} />}
                            </div>
                            {method === m.id && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                                    💡 {m.details}
                                </motion.p>
                            )}
                        </motion.div>
                    ))}
                    <button className="btn btn-primary" style={{ width: '100%' }} disabled={!method} onClick={() => setStep(3)}>
                        Next: {method === 'home' ? 'Setup Guide' : 'Schedule'} <ArrowRight size={16} />
                    </button>
                </>
            )}

            {/* ── STEP 3: SCHEDULE / SETUP ── */}
            {step === 3 && (
                <>
                    {method === 'home' ? (
                        /* HOME COMPOSTING GUIDE */
                        <>
                            <motion.div {...fadeUp(0.05)} className="card" style={{ padding: 16, background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.04))', border: '1px solid rgba(16,185,129,0.15)' }}>
                                <p style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: 12 }}>🏠 Home Composting Setup Guide</p>
                                {homeTips.map((tip, i) => (
                                    <motion.div key={i} {...fadeUp(0.1 + i * 0.05)} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>
                                            {tip.emoji}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: '0.78rem' }}>{tip.title}</p>
                                            <p style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>{tip.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Troubleshooting */}
                            <motion.div {...fadeUp(0.4)} className="card card-sm" style={{ padding: 14 }}>
                                <p style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 8 }}>🔧 Troubleshooting</p>
                                {troubleshooting.map((t, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                        <span style={{ fontSize: '0.85rem' }}>{t.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.7rem', fontWeight: 600 }}>{t.problem}</p>
                                            <p style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{t.fix}</p>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </>
                    ) : (
                        /* COMMUNITY / COMMERCIAL — Pick facility & schedule */
                        <>
                            <motion.div {...fadeUp(0.05)}>
                                <p style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 8 }}>
                                    {method === 'community' ? '🌿 Choose a Community Garden' : '🏭 Choose a Composting Service'}
                                </p>
                            </motion.div>
                            {relevantFacilities.map((f, i) => (
                                <motion.div key={i} {...fadeUp(0.1 + i * 0.05)} className="card card-sm" onClick={() => setSelectedFacility(i)}
                                    style={{
                                        cursor: 'pointer', padding: 14,
                                        border: selectedFacility === i ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.06)',
                                        background: selectedFacility === i ? 'rgba(16,185,129,0.06)' : undefined
                                    }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                            {method === 'community' ? '🌿' : '🏭'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, fontSize: '0.82rem' }}>{f.name}</p>
                                            <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                                                <span style={{ fontSize: '0.6rem', color: '#64748b' }}>📍 {f.dist}</span>
                                                <span style={{ fontSize: '0.6rem', color: '#f59e0b' }}>⭐ {f.rating}</span>
                                                <span style={{ fontSize: '0.6rem', color: '#64748b' }}>🕐 {f.timing}</span>
                                            </div>
                                        </div>
                                        {selectedFacility === i && <CheckCircle size={16} color="#10b981" />}
                                    </div>
                                </motion.div>
                            ))}

                            {selectedFacility !== null && (
                                <>
                                    {/* Time Slot */}
                                    <motion.div {...fadeUp(0.2)}>
                                        <p style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 6, marginTop: 8 }}>
                                            {method === 'community' ? '📅 Drop-off Time' : '📅 Pickup Time'}
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {pickupSlots.map((slot, i) => (
                                                <button key={i} onClick={() => setSelectedSlot(i)}
                                                    style={{
                                                        padding: '6px 12px', fontSize: '0.68rem', borderRadius: 8, cursor: 'pointer',
                                                        border: selectedSlot === i ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.06)',
                                                        background: selectedSlot === i ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)',
                                                        color: selectedSlot === i ? '#34d399' : '#94a3b8'
                                                    }}>
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* Address (for commercial pickup) */}
                                    {method === 'commercial' && (
                                        <motion.div {...fadeUp(0.25)}>
                                            <p style={{ fontWeight: 600, fontSize: '0.78rem', marginBottom: 6 }}>📍 Pickup Address</p>
                                            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter your full address"
                                                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', color: '#e2e8f0', outline: 'none', boxSizing: 'border-box' }} />
                                        </motion.div>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    <button className="btn btn-primary" style={{ width: '100%' }}
                        disabled={method !== 'home' && (selectedFacility === null || selectedSlot === null || (method === 'commercial' && !address.trim()))}
                        onClick={() => setStep(4)}>
                        Next: Review & Confirm <ArrowRight size={16} />
                    </button>
                </>
            )}

            {/* ── STEP 4: REVIEW & CONFIRM ── */}
            {step === 4 && (
                <>
                    <motion.div {...fadeUp(0.05)}>
                        <p style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 10 }}>📋 Review Your Composting Details</p>
                    </motion.div>

                    <motion.div {...fadeUp(0.1)} className="card" style={{ padding: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* Waste Summary */}
                            <div>
                                <p style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Waste Items</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                                    {selectedWaste.map(id => {
                                        const w = wasteCategories.find(c => c.id === id);
                                        return w && <span key={id} style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: 6, background: w.type === 'green' ? 'rgba(16,185,129,0.1)' : 'rgba(161,98,7,0.1)', color: w.type === 'green' ? '#34d399' : '#d97706' }}>
                                            {w.emoji} {w.label}
                                        </span>;
                                    })}
                                </div>
                            </div>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                                <p style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Quantity</p>
                                <p style={{ fontSize: '0.82rem', marginTop: 2 }}>{quantity || '1 bag'}</p>
                            </div>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                                <p style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Method</p>
                                <p style={{ fontSize: '0.82rem', marginTop: 2 }}>{compostMethods.find(m => m.id === method)?.label}</p>
                            </div>
                            {method !== 'home' && selectedFacility !== null && (
                                <>
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                                        <p style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Facility</p>
                                        <p style={{ fontSize: '0.82rem', marginTop: 2 }}>{relevantFacilities[selectedFacility]?.name}</p>
                                    </div>
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                                        <p style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Time Slot</p>
                                        <p style={{ fontSize: '0.82rem', marginTop: 2 }}>{selectedSlot !== null ? pickupSlots[selectedSlot] : '-'}</p>
                                    </div>
                                    {address && (
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                                            <p style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Address</p>
                                            <p style={{ fontSize: '0.82rem', marginTop: 2 }}>{address}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* Reward Preview */}
                    <motion.div {...fadeUp(0.2)} className="card card-sm" style={{ padding: 12, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                            <div style={{ textAlign: 'center' }}><p style={{ fontSize: '0.9rem' }}>🪙</p><p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#10b981' }}>+100</p><p style={{ fontSize: '0.55rem', color: '#64748b' }}>GreenCoins</p></div>
                            <div style={{ textAlign: 'center' }}><p style={{ fontSize: '0.9rem' }}>🌍</p><p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#3b82f6' }}>1.8 kg</p><p style={{ fontSize: '0.55rem', color: '#64748b' }}>CO₂ Prevented</p></div>
                            <div style={{ textAlign: 'center' }}><p style={{ fontSize: '0.9rem' }}>♻️</p><p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#f59e0b' }}>+1</p><p style={{ fontSize: '0.55rem', color: '#64748b' }}>Items Composted</p></div>
                        </div>
                    </motion.div>

                    {/* Confirm Button */}
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleConfirm} disabled={loading}>
                        {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : <>✅ Confirm & Start Composting</>}
                    </button>
                </>
            )}
        </div>
    );
}
