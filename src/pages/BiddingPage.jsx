import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Gavel, Shield, Star, MapPin, Clock, ChevronRight,
    CheckCircle, TrendingUp, Truck, Phone, ArrowRight,
    Timer, Package, Coins, X, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: d, duration: 0.4 },
});

const materialListing = {
    title: 'Smartphone (Non-functional)',
    category: 'E-Waste',
    weight: '180g',
    aiValue: '₹350 – ₹580',
    materials: 'Copper, Gold trace, Lithium, ABS Plastic',
    emoji: '📱',
    postedTime: 'Just now',
};

const initialBids = [
    {
        id: 1, merchant: 'GreenTech Recyclers', rating: 4.9, reviews: 312,
        verified: true, location: 'Mumbai', bid: 520, pickup: '2 hours',
        method: 'Certified smelting & material recovery',
        speciality: 'E-Waste Specialist',
    },
    {
        id: 2, merchant: 'EcoCircuit Solutions', rating: 4.7, reviews: 245,
        verified: true, location: 'Pune', bid: 480, pickup: '4 hours',
        method: 'Component-level recovery',
        speciality: 'PCB & Component Recovery',
    },
    {
        id: 3, merchant: 'ReNew Materials Hub', rating: 4.6, reviews: 189,
        verified: true, location: 'Delhi', bid: 445, pickup: 'Next day',
        method: 'Hydrometallurgical extraction',
        speciality: 'Precious Metal Recovery',
    },
];

const newBids = [
    {
        id: 4, merchant: 'UrbanMine Technologies', rating: 4.8, reviews: 278,
        verified: true, location: 'Bangalore', bid: 550, pickup: '3 hours',
        method: 'Advanced pyrometallurgy',
        speciality: 'Smart Device Recycling',
    },
    {
        id: 5, merchant: 'CircularTech India', rating: 4.5, reviews: 156,
        verified: true, location: 'Hyderabad', bid: 490, pickup: '5 hours',
        method: 'Mechanical + chemical recovery',
        speciality: 'Battery & Metal Recovery',
    },
];

export default function BiddingPage() {
    const navigate = useNavigate();
    const [bids, setBids] = useState(initialBids);
    const [accepted, setAccepted] = useState(null);
    const [timeLeft, setTimeLeft] = useState(1800); // 30 min in seconds
    const [showConfirm, setShowConfirm] = useState(null);

    // Simulate new bids arriving
    useEffect(() => {
        const t1 = setTimeout(() => {
            setBids(prev => [newBids[0], ...prev].sort((a, b) => b.bid - a.bid));
        }, 5000);
        const t2 = setTimeout(() => {
            setBids(prev => [newBids[1], ...prev].sort((a, b) => b.bid - a.bid));
        }, 12000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    // Timer countdown
    useEffect(() => {
        if (accepted) return;
        const interval = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
        return () => clearInterval(interval);
    }, [accepted]);

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    const highestBid = bids.length ? Math.max(...bids.map(b => b.bid)) : 0;

    const handleAccept = (bid) => {
        setAccepted(bid);
        setShowConfirm(null);
    };

    if (accepted) {
        return (
            <div className="page-container">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        style={s.successCircle}
                    >
                        <CheckCircle size={48} color="#10b981" />
                    </motion.div>
                    <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginTop: 20 }}>Bid Accepted!</h2>
                    <p style={{ color: '#94a3b8', marginTop: 8, fontSize: '0.9rem' }}>
                        Your material has been claimed by a certified recycler
                    </p>

                    <div className="card" style={{ marginTop: 24, textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={s.merchAvatar}>{accepted.merchant.charAt(0)}</div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <p style={{ fontWeight: 700 }}>{accepted.merchant}</p>
                                    <Shield size={14} color="#10b981" />
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{accepted.speciality}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { icon: Coins, label: 'Amount', value: `₹${accepted.bid}`, color: '#10b981' },
                                { icon: Truck, label: 'Pickup', value: accepted.pickup, color: '#3b82f6' },
                                { icon: Shield, label: 'Method', value: accepted.method, color: '#f59e0b' },
                            ].map((item, i) => (
                                <div key={i} style={s.confirmRow}>
                                    <item.icon size={16} color={item.color} />
                                    <span style={{ fontSize: '0.78rem', color: '#64748b', width: 60 }}>{item.label}</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card card-sm" style={{ marginTop: 12, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.3rem' }}>🪙</span>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                            <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>₹{accepted.bid} + 200 GreenCoins</p>
                            <p style={{ fontSize: '0.72rem', color: '#64748b' }}>Credited to your wallet on pickup</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/wallet')}>
                            <Coins size={16} /> Wallet
                        </button>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/home')}>
                            <ArrowRight size={16} /> Home
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Header */}
            <motion.div {...fadeUp(0)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={s.pageTitle}>Material Exchange</h2>
                    <p style={s.pageDesc}>Certified recyclers are bidding</p>
                </div>
                <div style={s.timerBadge}>
                    <Timer size={13} />
                    <span>{formatTime(timeLeft)}</span>
                </div>
            </motion.div>

            {/* Material Listing */}
            <motion.div {...fadeUp(0.1)} className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={s.listingEmoji}>
                        <span style={{ fontSize: '2rem' }}>{materialListing.emoji}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{materialListing.title}</h3>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{materialListing.materials}</p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                            <span className="badge badge-blue">{materialListing.category}</span>
                            <span className="badge badge-gold">AI Value: {materialListing.aiValue}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Live Bids */}
            <motion.div {...fadeUp(0.2)}>
                <div className="section-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="section-title">Live Bids</span>
                        <motion.div
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            style={s.liveDot}
                        />
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{bids.length} merchants</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <AnimatePresence>
                        {bids.map((bid, i) => (
                            <motion.div
                                key={bid.id}
                                className="card card-sm"
                                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                layout
                                style={{ position: 'relative', overflow: 'visible' }}
                            >
                                {bid.bid === highestBid && (
                                    <div style={s.highestTag}>
                                        <TrendingUp size={10} /> Highest
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                    <div style={s.merchAvatar}>{bid.merchant.charAt(0)}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{bid.merchant}</span>
                                            {bid.verified && <Shield size={13} color="#10b981" />}
                                        </div>
                                        <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>{bid.speciality}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 800, fontSize: '1.2rem', color: bid.bid === highestBid ? '#10b981' : '#f1f5f9' }}>
                                            ₹{bid.bid}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 12, marginBottom: 10, paddingLeft: 52 }}>
                                    <span style={s.bidDetail}><Star size={11} color="#f59e0b" fill="#f59e0b" /> {bid.rating} ({bid.reviews})</span>
                                    <span style={s.bidDetail}><MapPin size={11} /> {bid.location}</span>
                                    <span style={s.bidDetail}><Truck size={11} /> {bid.pickup}</span>
                                </div>

                                <div style={{ paddingLeft: 52, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                    <Shield size={11} color="#64748b" />
                                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{bid.method}</span>
                                </div>

                                {showConfirm === bid.id ? (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        style={{ padding: '12px', background: 'rgba(16,185,129,0.06)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.15)', marginTop: 4 }}
                                    >
                                        <p style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>Accept ₹{bid.bid} from {bid.merchant}?</p>
                                        <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 12 }}>Pickup: {bid.pickup} · Method: {bid.method}</p>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => setShowConfirm(null)}>
                                                <X size={13} /> Cancel
                                            </button>
                                            <button className="btn btn-sm btn-primary" style={{ flex: 1 }} onClick={() => handleAccept(bid)}>
                                                <CheckCircle size={13} /> Confirm
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <button
                                        className="btn btn-sm"
                                        style={{
                                            width: '100%',
                                            background: bid.bid === highestBid ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
                                            color: bid.bid === highestBid ? '#fff' : '#94a3b8',
                                            border: bid.bid === highestBid ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                        }}
                                        onClick={() => setShowConfirm(bid.id)}
                                    >
                                        Accept Bid <ChevronRight size={14} />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* How It Works */}
            <motion.div {...fadeUp(0.3)} style={{ marginTop: 20 }}>
                <div className="section-header">
                    <span className="section-title">How It Works</span>
                </div>
                <div className="card card-sm" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                        { step: '1', text: 'Certified recyclers bid for your material', icon: Gavel, color: '#f59e0b' },
                        { step: '2', text: 'Compare bids transparently', icon: TrendingUp, color: '#3b82f6' },
                        { step: '3', text: 'Accept best offer → doorstep pickup', icon: Truck, color: '#10b981' },
                        { step: '4', text: 'Payment credited to your wallet', icon: Coins, color: '#fbbf24' },
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ ...s.stepCircle, background: `${item.color}18`, color: item.color }}>
                                {item.step}
                            </div>
                            <item.icon size={16} color={item.color} />
                            <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{item.text}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

const s = {
    pageTitle: { fontSize: '1.4rem', fontWeight: 800 },
    pageDesc: { fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 },
    timerBadge: {
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '6px 12px', borderRadius: 20,
        background: 'rgba(245,158,11,0.12)', color: '#fbbf24',
        fontSize: '0.82rem', fontWeight: 700,
        border: '1px solid rgba(245,158,11,0.25)',
    },
    listingEmoji: {
        width: 56, height: 56, borderRadius: 16,
        background: 'rgba(59,130,246,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    liveDot: {
        width: 8, height: 8, borderRadius: '50%', background: '#ef4444',
    },
    merchAvatar: {
        width: 40, height: 40, borderRadius: 12,
        background: 'linear-gradient(135deg, #10b981, #059669)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: '1rem', color: '#fff',
    },
    highestTag: {
        position: 'absolute', top: -8, right: 12,
        padding: '3px 10px', borderRadius: 12,
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: '#fff', fontSize: '0.65rem', fontWeight: 700,
        display: 'flex', alignItems: 'center', gap: 3,
    },
    bidDetail: {
        display: 'flex', alignItems: 'center', gap: 3,
        fontSize: '0.72rem', color: '#94a3b8',
    },
    confirmRow: {
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
    },
    successCircle: {
        width: 88, height: 88, borderRadius: '50%',
        background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '20px auto 0',
    },
    stepCircle: {
        width: 28, height: 28, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: 800,
    },
};
