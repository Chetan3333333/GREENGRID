import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Recycle, Package, ChevronRight, Truck, MapPin, Gavel,
    TrendingUp, Shield, Star, Timer
} from 'lucide-react';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: d, duration: 0.4 },
});

const materials = [
    { id: 'plastic', label: 'Plastic', emoji: '🧴', color: '#3b82f6', tip: 'Clean and separate by type', grade: 'A', recovery: '₹50–₹80/kg' },
    { id: 'paper', label: 'Paper', emoji: '📦', color: '#10b981', tip: 'Keep dry and flatten', grade: 'B+', recovery: '₹15–₹25/kg' },
    { id: 'glass', label: 'Glass', emoji: '🫙', color: '#f59e0b', tip: 'Separate by color if possible', grade: 'A', recovery: '₹8–₹15/kg' },
    { id: 'metal', label: 'Metal', emoji: '🥫', color: '#ef4444', tip: 'Rinse cans before recycling', grade: 'A+', recovery: '₹40–₹120/kg' },
    { id: 'liquid', label: 'Liquid', emoji: '💧', color: '#8b5cf6', tip: 'Never pour down drains', grade: 'C', recovery: 'N/A' },
];

const centers = [
    { name: 'EcoRecycle Hub', dist: '1.8 km', accepts: 'All materials', hours: '8am - 7pm' },
    { name: 'GreenCycle Center', dist: '3.2 km', accepts: 'Plastic, Metal, Paper', hours: '9am - 6pm' },
    { name: 'CityWaste Solutions', dist: '4.5 km', accepts: 'Glass, E-waste, Metal', hours: '7am - 8pm' },
];

const recyclableBids = [
    {
        id: 1, item: '📰 Newspaper Bundle (25kg)', category: 'Paper & Cardboard',
        materials: 'Recycled pulp', aiValue: '₹375 – ₹625',
        bids: [
            { merchant: 'PaperCycle India', rating: 4.8, bid: 580, pickup: '2 hours', method: 'De-inking & pulp recycling', verified: true },
            { merchant: 'GreenPulp Mills', rating: 4.6, bid: 520, pickup: '4 hours', method: 'Direct repulping', verified: true },
            { merchant: 'EcoFiber Solutions', rating: 4.5, bid: 490, pickup: 'Next day', method: 'Fiber recovery', verified: true },
        ],
    },
    {
        id: 2, item: '🧴 PET Plastic Bottles (8kg)', category: 'Plastic',
        materials: 'PET Grade A', aiValue: '₹400 – ₹640',
        bids: [
            { merchant: 'PlastRecycle Pro', rating: 4.9, bid: 600, pickup: '3 hours', method: 'Pelletization & extrusion', verified: true },
            { merchant: 'ReNew Plastics', rating: 4.7, bid: 560, pickup: '5 hours', method: 'Chemical recycling', verified: true },
        ],
    },
    {
        id: 3, item: '🥫 Aluminium Cans (5kg)', category: 'Metal',
        materials: 'Aluminium alloy', aiValue: '₹500 – ₹600',
        bids: [
            { merchant: 'MetalRecover Pro', rating: 4.7, bid: 570, pickup: '2 hours', method: 'Smelting & re-alloying', verified: true },
            { merchant: 'CircularMetal Works', rating: 4.4, bid: 530, pickup: '6 hours', method: 'Shredding & remelting', verified: true },
            { merchant: 'GreenMetal Hub', rating: 4.6, bid: 550, pickup: '4 hours', method: 'Clean melt process', verified: true },
        ],
    },
    {
        id: 4, item: '🫙 Glass Bottles (12kg)', category: 'Glass',
        materials: 'Clear & amber glass', aiValue: '₹96 – ₹180',
        bids: [
            { merchant: 'GlassRenew India', rating: 4.5, bid: 160, pickup: '4 hours', method: 'Crushing & re-furnacing', verified: true },
            { merchant: 'EcoCullet Mills', rating: 4.3, bid: 140, pickup: 'Next day', method: 'Cullet preparation', verified: true },
        ],
    },
];

export default function RecyclablesPage() {
    const [selected, setSelected] = useState(null);
    const [expandedBid, setExpandedBid] = useState(null);
    const navigate = useNavigate();
    const mat = materials.find(m => m.id === selected);

    return (
        <div className="page-container">
            <motion.div {...fadeUp(0)}>
                <h2 style={s.title}>Recyclable Materials</h2>
                <p style={s.desc}>Identify, grade, and route materials for recovery</p>
            </motion.div>

            {/* Material Grid */}
            <motion.div {...fadeUp(0.1)}>
                <div className="section-header">
                    <span className="section-title">Select Material Type</span>
                </div>
                <div style={s.matGrid}>
                    {materials.map((m) => (
                        <motion.div
                            key={m.id}
                            className="card card-sm"
                            style={{
                                ...s.matCard,
                                borderColor: selected === m.id ? m.color : undefined,
                                background: selected === m.id ? `${m.color}0a` : undefined,
                            }}
                            onClick={() => setSelected(m.id)}
                            whileTap={{ scale: 0.96 }}
                        >
                            <span style={{ fontSize: '1.8rem' }}>{m.emoji}</span>
                            <p style={{ fontWeight: 600, fontSize: '0.8rem', marginTop: 6 }}>{m.label}</p>
                            <span className="badge" style={{ marginTop: 4, background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}30`, fontSize: '0.6rem' }}>
                                Grade {m.grade}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {selected && mat && (
                <motion.div {...fadeUp(0)}>
                    {/* Material Info */}
                    <div className="grid-2" style={{ marginBottom: 14 }}>
                        <div className="card card-sm">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                <Shield size={14} color={mat.color} />
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Material Grade</span>
                            </div>
                            <p style={{ fontWeight: 700, fontSize: '1.1rem', color: mat.color }}>Grade {mat.grade}</p>
                        </div>
                        <div className="card card-sm">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                <TrendingUp size={14} color="#f59e0b" />
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Recovery Value</span>
                            </div>
                            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fbbf24' }}>{mat.recovery}</p>
                        </div>
                    </div>

                    {/* Tip */}
                    <div className="card card-sm" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <span style={{ fontSize: '1.2rem' }}>💡</span>
                        <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                            <strong style={{ color: '#10b981' }}>Tip:</strong> {mat.tip}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="section-header">
                        <span className="section-title">Available Actions</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                            { label: 'Post to Material Exchange', desc: 'Let certified recyclers bid for your material', icon: '⚡', coins: 'Earn ₹', primary: true },
                            { label: 'Donate for Reuse', desc: 'Give to craft groups or workshops', icon: '🎨', coins: '+60 🪙', primary: false },
                            { label: 'Drop at Recycling Center', desc: 'Find nearest certified center', icon: '🏭', coins: '+30 🪙', primary: false },
                        ].map((act, i) => (
                            <motion.div
                                key={i}
                                className="list-item"
                                style={{ cursor: 'pointer' }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span style={{ fontSize: '1.4rem' }}>{act.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{act.label}</p>
                                    <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{act.desc}</p>
                                </div>
                                <span className={`badge ${act.primary ? 'badge-gold' : 'badge-green'}`}>{act.coins}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Recyclable Merchant Bidding */}
            <motion.div {...fadeUp(0.25)} style={{ marginTop: 20 }}>
                <div className="section-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="section-title">Recycler Merchant Bids</span>
                        <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {recyclableBids.map((listing) => {
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
                                        <span className="badge badge-green">{listing.category}</span>
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

            {/* Nearby Centers */}
            <motion.div {...fadeUp(0.3)} style={{ marginTop: 20 }}>
                <div className="section-header">
                    <span className="section-title">Recycling Centers</span>
                    <span className="badge badge-green"><MapPin size={10} /> Nearby</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {centers.map((c, i) => (
                        <motion.div key={i} className="card card-sm" style={{ cursor: 'pointer' }} whileTap={{ scale: 0.98 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={s.centerIcon}>
                                    <Truck size={20} color="#f59e0b" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</p>
                                    <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{c.accepts}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span className="badge badge-gold">{c.dist}</span>
                                    <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 4 }}>{c.hours}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

const s = {
    title: { fontSize: '1.4rem', fontWeight: 800 },
    desc: { fontSize: '0.85rem', color: '#94a3b8', marginTop: 4, marginBottom: 16 },
    matGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 },
    matCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16, cursor: 'pointer', textAlign: 'center' },
    centerIcon: {
        width: 42, height: 42, borderRadius: 12,
        background: 'rgba(245,158,11,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    merchAvatar: {
        width: 36, height: 36, borderRadius: 10,
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
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
