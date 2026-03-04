import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Cpu, Heart, Gavel, Recycle, ChevronRight, Star, MapPin, Shield,
    TrendingUp, Package, Timer, Truck, CheckCircle, Coins, X, Handshake, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addTransaction, updateUserStats } from '../services/database';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: d, duration: 0.4 },
});

const actions = [
    { id: 'donate', label: 'Donate for Reuse', icon: Heart, desc: 'Give functional devices to NGOs & schools', color: '#10b981', coins: '+200 🪙' },
    { id: 'exchange', label: 'Smart Bidding', icon: Gavel, desc: 'Multiple certified recyclers bid — best price wins', color: '#f59e0b', coins: 'Earn ₹' },
    { id: 'direct', label: 'Smart Deal Mode', icon: Handshake, desc: 'One-to-one verified merchant offer & negotiation', color: '#8b5cf6', coins: 'Earn ₹' },
    { id: 'recycle', label: 'Certified Recycling', icon: Recycle, desc: 'Schedule free pickup by recycling center', color: '#3b82f6', coins: '+80 🪙' },
];

const ngosList = [
    { name: 'Digital Empowerment Foundation', type: 'Education', items: 'Laptops, Tablets' },
    { name: 'Pratham Education Foundation', type: 'Schools', items: 'Computers, Phones' },
    { name: 'Teach For India', type: 'Classrooms', items: 'Projectors, Laptops' },
];

const ewasteBids = [
    {
        id: 1, item: '💻 Laptop Motherboard (450g)', category: 'PCB & Components',
        materials: 'Gold, Silver, Copper, Palladium', aiValue: '₹800 – ₹1,400',
        bids: [
            { merchant: 'GreenTech Recyclers', rating: 4.9, bid: 1250, pickup: '2 hours', method: 'Certified smelting', verified: true },
            { merchant: 'EcoCircuit Solutions', rating: 4.7, bid: 1180, pickup: '4 hours', method: 'Component-level recovery', verified: true },
            { merchant: 'UrbanMine Tech', rating: 4.8, bid: 1320, pickup: '3 hours', method: 'Pyrometallurgy', verified: true },
        ],
    },
    {
        id: 2, item: '📱 Smartphones x3 (Non-functional)', category: 'Mobile Devices',
        materials: 'Copper, Lithium, Gold trace', aiValue: '₹600 – ₹950',
        bids: [
            { merchant: 'ReNew Materials Hub', rating: 4.6, bid: 880, pickup: 'Next day', method: 'Hydrometallurgical extraction', verified: true },
            { merchant: 'CircularTech India', rating: 4.5, bid: 820, pickup: '5 hours', method: 'Mechanical recovery', verified: true },
        ],
    },
    {
        id: 3, item: '🖥️ Desktop CPU + RAM Sticks', category: 'Computer Parts',
        materials: 'Gold pins, Copper, Aluminium', aiValue: '₹400 – ₹700',
        bids: [
            { merchant: 'GreenTech Recyclers', rating: 4.9, bid: 650, pickup: '2 hours', method: 'Precious metal recovery', verified: true },
            { merchant: 'MetalRecover Pro', rating: 4.4, bid: 580, pickup: '6 hours', method: 'Acid-free extraction', verified: true },
        ],
    },
];

export default function ElectronicsPage() {
    const [selected, setSelected] = useState(null);
    const [expandedBid, setExpandedBid] = useState(null);
    const navigate = useNavigate();
    const { currentUser, fetchUserProfile } = useAuth();
    const [actionLoading, setActionLoading] = useState(null);
    const [actionDone, setActionDone] = useState([]);

    async function handleAction(label, coins, emoji, index) {
        if (!currentUser || actionLoading !== null) return;
        setActionLoading(index);
        try {
            await addTransaction(currentUser.uid, {
                type: 'earn', coins, reason: label, emoji,
            });
            const updates = { greenCoins: coins, itemsRecycled: 1 };
            if (emoji === '💻') updates.donations = 1;
            await updateUserStats(currentUser.uid, updates);
            await fetchUserProfile(currentUser.uid);
            setActionDone(prev => [...prev, index]);
        } catch (err) { console.error(err); }
        setActionLoading(null);
    }

    return (
        <div className="page-container">
            <motion.div {...fadeUp(0)}>
                <h2 style={s.title}>E-Waste & Electronics</h2>
                <p style={s.desc}>AI-guided decisions for electronic material recovery</p>
            </motion.div>

            {/* AI Decision Info */}
            <motion.div {...fadeUp(0.1)} className="card card-sm" style={{ marginBottom: 16, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.3rem' }}>🧠</span>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>AI Intelligent Routing</p>
                        <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                            ✅ Functional → Donate/Reuse &nbsp;&nbsp; ♻️ Non-functional → Material Exchange
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Action Cards */}
            <motion.div {...fadeUp(0.15)}>
                <div className="section-header">
                    <span className="section-title">Choose Action</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {actions.map((act) => (
                        <motion.div
                            key={act.id}
                            className="card card-sm"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                                borderColor: selected === act.id ? act.color : undefined,
                                background: selected === act.id ? `${act.color}08` : undefined,
                            }}
                            onClick={() => setSelected(act.id)}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="icon-circle" style={{ background: `${act.color}15` }}>
                                <act.icon size={22} color={act.color} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 600 }}>{act.label}</p>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{act.desc}</p>
                            </div>
                            <span className="badge" style={{ background: `${act.color}15`, color: act.color, border: `1px solid ${act.color}30`, fontSize: '0.68rem' }}>
                                {act.coins}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* E-Waste Merchant Bidding */}
            {selected === 'exchange' && (
                <motion.div {...fadeUp(0.1)} style={{ marginTop: 20 }}>
                    <div className="section-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="section-title">E-Waste Merchant Bids</span>
                            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {ewasteBids.map((listing) => {
                            const highestBid = Math.max(...listing.bids.map(b => b.bid));
                            const isExpanded = expandedBid === listing.id;

                            return (
                                <motion.div
                                    key={listing.id}
                                    className="card"
                                    layout
                                    style={{ overflow: 'hidden' }}
                                >
                                    {/* Listing Header */}
                                    <div
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setExpandedBid(isExpanded ? null : listing.id)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <div>
                                                <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{listing.item}</p>
                                                <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{listing.materials}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontWeight: 800, color: '#10b981', fontSize: '1.1rem' }}>₹{highestBid}</span>
                                                <p style={{ fontSize: '0.6rem', color: '#64748b' }}>highest bid</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <span className="badge badge-blue">{listing.category}</span>
                                            <span className="badge badge-gold">AI: {listing.aiValue}</span>
                                            <span className="badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.6rem' }}>
                                                {listing.bids.length} bids
                                            </span>
                                        </div>
                                    </div>

                                    {/* Expanded Bids */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                style={{ marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}
                                            >
                                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 10 }}>Certified Recycler Bids:</p>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                    {listing.bids.sort((a, b) => b.bid - a.bid).map((bid, i) => (
                                                        <div key={i} style={s.bidRow}>
                                                            <div style={s.merchAvatar}>{bid.merchant.charAt(0)}</div>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{bid.merchant}</span>
                                                                    {bid.verified && <Shield size={12} color="#10b981" />}
                                                                </div>
                                                                <div style={{ display: 'flex', gap: 10, marginTop: 3 }}>
                                                                    <span style={s.bidDetail}><Star size={10} color="#f59e0b" fill="#f59e0b" /> {bid.rating}</span>
                                                                    <span style={s.bidDetail}><Truck size={10} /> {bid.pickup}</span>
                                                                </div>
                                                                <p style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 3 }}>{bid.method}</p>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <p style={{ fontWeight: 800, fontSize: '1.05rem', color: i === 0 ? '#10b981' : '#f1f5f9' }}>₹{bid.bid}</p>
                                                                {i === 0 && <span style={{ fontSize: '0.55rem', color: '#10b981', fontWeight: 600 }}>HIGHEST</span>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    style={{ width: '100%', marginTop: 12 }}
                                                    onClick={() => navigate('/bidding')}
                                                >
                                                    <Gavel size={14} /> Accept Best Bid (₹{highestBid})
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Donate Section */}
            {selected === 'donate' && (
                <motion.div {...fadeUp(0.1)} style={{ marginTop: 20 }}>
                    <div className="section-header">
                        <span className="section-title">NGOs & Schools</span>
                        <span className="badge badge-green"><Shield size={10} /> Verified</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {ngosList.map((ngo, i) => (
                            <motion.div key={i} className="card card-sm" style={{ cursor: 'default' }} whileTap={{ scale: 0.99 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ ...s.merchIcon, background: 'rgba(16,185,129,0.1)' }}>
                                        {actionDone.includes(`d${i}`) ? <CheckCircle size={20} color="#10b981" /> : actionLoading === `d${i}` ? <Loader2 size={20} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} /> : <Heart size={20} color="#10b981" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ngo.name}</p>
                                        <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{ngo.type} · Accepts {ngo.items}</p>
                                    </div>
                                    {actionDone.includes(`d${i}`) ? (
                                        <span className="badge badge-green">+200 🪙</span>
                                    ) : (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            style={{ whiteSpace: 'nowrap' }}
                                            onClick={(e) => { e.stopPropagation(); handleAction(`Donated device to ${ngo.name}`, 200, '💻', `d${i}`); }}
                                            disabled={actionLoading !== null}
                                        >
                                            {actionLoading === `d${i}` ? 'Saving...' : 'Donate'}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        {actionLoading && <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>}
                    </div>
                </motion.div>
            )}

            {/* Recycle Section */}
            {selected === 'recycle' && (
                <motion.div {...fadeUp(0.1)} style={{ marginTop: 20 }}>
                    <div className="card" style={{ textAlign: 'center', padding: 28 }}>
                        <span style={{ fontSize: '3rem' }}>🏭</span>
                        <h3 style={{ fontWeight: 700, marginTop: 12 }}>Certified E-Waste Recycling</h3>
                        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 8, lineHeight: 1.5 }}>
                            Your e-waste will be processed by certified facilities ensuring zero landfill disposal. All hazardous materials handled safely.
                        </p>
                        <button className="btn btn-primary" style={{ marginTop: 16 }}
                            onClick={() => !actionDone.includes('recycle') && handleAction('Scheduled e-waste recycling pickup', 80, '♻️', 'recycle')}
                            disabled={actionDone.includes('recycle')}
                        >
                            {actionDone.includes('recycle') ? <><CheckCircle size={14} /> Scheduled ✅</> : <>Schedule Free Pickup <ChevronRight size={14} /></>}
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Direct Deal Section */}
            {selected === 'direct' && (
                <motion.div {...fadeUp(0.1)} style={{ marginTop: 20 }}>
                    <div className="card" style={{ textAlign: 'center', padding: 28 }}>
                        <span style={{ fontSize: '3rem' }}>🤝</span>
                        <h3 style={{ fontWeight: 700, marginTop: 12 }}>Verified Merchant Offer</h3>
                        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 8, lineHeight: 1.5 }}>
                            Select a certified e-waste recycler and negotiate a fair price directly. Structured offer system — no free chatting.
                        </p>
                        <div className="card card-sm" style={{ marginTop: 14, textAlign: 'left', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
                            <p style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 8 }}>How it works:</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {[
                                    '1. Pick a verified e-waste merchant',
                                    '2. Merchant evaluates & sends price offer',
                                    '3. Accept, Counter Offer, or Request Inspection',
                                    '4. Agreement confirmed → Doorstep pickup',
                                ].map((step, i) => (
                                    <p key={i} style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{step}</p>
                                ))}
                            </div>
                        </div>
                        <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }} onClick={() => navigate('/direct-deal')}>
                            <Handshake size={16} /> Start Smart Deal
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

const s = {
    title: { fontSize: '1.4rem', fontWeight: 800 },
    desc: { fontSize: '0.85rem', color: '#94a3b8', marginTop: 4, marginBottom: 16 },
    merchIcon: {
        width: 42, height: 42, borderRadius: 12,
        background: 'rgba(59,130,246,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    merchAvatar: {
        width: 36, height: 36, borderRadius: 10,
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: '0.85rem', color: '#fff',
    },
    bidRow: {
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
    },
    bidDetail: {
        display: 'flex', alignItems: 'center', gap: 3,
        fontSize: '0.7rem', color: '#94a3b8',
    },
};
