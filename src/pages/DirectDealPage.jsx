import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Shield, Star, MapPin, Truck, CheckCircle, ChevronRight,
    ArrowRight, Coins, X, MessageSquare, Eye, TrendingUp,
    ArrowUpDown, Handshake, Package
} from 'lucide-react';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: d, duration: 0.4 },
});

const merchants = [
    {
        id: 1, name: 'GreenTech Recyclers', rating: 4.9, reviews: 312,
        verified: true, location: 'Mumbai', speciality: 'E-Waste Specialist',
        response: '< 15 min', deals: 89, pickedUp: '2.4T',
    },
    {
        id: 2, name: 'EcoCircuit Solutions', rating: 4.7, reviews: 245,
        verified: true, location: 'Pune', speciality: 'PCB & Component Recovery',
        response: '< 30 min', deals: 67, pickedUp: '1.8T',
    },
    {
        id: 3, name: 'ReNew Materials Hub', rating: 4.6, reviews: 189,
        verified: true, location: 'Delhi', speciality: 'Precious Metal Recovery',
        response: '< 1 hour', deals: 45, pickedUp: '1.2T',
    },
    {
        id: 4, name: 'PlastRecycle Pro', rating: 4.9, reviews: 278,
        verified: true, location: 'Bangalore', speciality: 'Plastic Pellet Manufacturing',
        response: '< 20 min', deals: 112, pickedUp: '3.1T',
    },
    {
        id: 5, name: 'CircularTech India', rating: 4.5, reviews: 156,
        verified: true, location: 'Hyderabad', speciality: 'Battery & Metal Recovery',
        response: '< 45 min', deals: 34, pickedUp: '0.9T',
    },
];

export default function DirectDealPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState('select'); // select | offer | counter | accepted
    const [selectedMerchant, setSelectedMerchant] = useState(null);
    const [merchantOffer, setMerchantOffer] = useState(null);
    const [counterAmount, setCounterAmount] = useState('');
    const [finalDeal, setFinalDeal] = useState(null);

    const handleSelectMerchant = (merchant) => {
        setSelectedMerchant(merchant);
        setStep('waiting');
        // Simulate merchant responding with an offer
        setTimeout(() => {
            const offer = Math.floor(Math.random() * 200) + 400;
            setMerchantOffer(offer);
            setStep('offer');
        }, 2000);
    };

    const handleAcceptOffer = () => {
        setFinalDeal({ amount: merchantOffer, type: 'accepted' });
        setStep('accepted');
    };

    const handleCounter = () => {
        if (!counterAmount || isNaN(counterAmount)) return;
        setStep('counter-waiting');
        // Simulate merchant responding to counter
        setTimeout(() => {
            const middle = Math.floor((parseInt(counterAmount) + merchantOffer) / 2);
            setMerchantOffer(middle);
            setStep('offer');
        }, 2500);
    };

    const handleRequestInspection = () => {
        setStep('inspection');
        setTimeout(() => {
            const inspectedOffer = merchantOffer + Math.floor(Math.random() * 100) + 50;
            setMerchantOffer(inspectedOffer);
            setStep('offer');
        }, 3000);
    };

    // ACCEPTED SCREEN
    if (step === 'accepted' && selectedMerchant) {
        return (
            <div className="page-container">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        style={s.successCircle}
                    >
                        <Handshake size={48} color="#10b981" />
                    </motion.div>
                    <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginTop: 20 }}>Deal Confirmed!</h2>
                    <p style={{ color: '#94a3b8', marginTop: 8, fontSize: '0.9rem' }}>
                        Direct Recovery Agreement established
                    </p>

                    <div className="card" style={{ marginTop: 24, textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={s.merchAvatar}>{selectedMerchant.name.charAt(0)}</div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <p style={{ fontWeight: 700 }}>{selectedMerchant.name}</p>
                                    <Shield size={14} color="#10b981" />
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{selectedMerchant.speciality}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { icon: Coins, label: 'Agreed Price', value: `₹${merchantOffer}`, color: '#10b981' },
                                { icon: Truck, label: 'Pickup', value: 'Within 24 hours', color: '#3b82f6' },
                                { icon: Shield, label: 'Agreement', value: 'Verified & Binding', color: '#f59e0b' },
                            ].map((item, i) => (
                                <div key={i} style={s.confirmRow}>
                                    <item.icon size={16} color={item.color} />
                                    <span style={{ fontSize: '0.78rem', color: '#64748b', width: 75 }}>{item.label}</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card card-sm" style={{ marginTop: 12, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.3rem' }}>🪙</span>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                            <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>₹{merchantOffer} + 150 GreenCoins</p>
                            <p style={{ fontSize: '0.72rem', color: '#64748b' }}>Credited to wallet on pickup</p>
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
            <motion.div {...fadeUp(0)}>
                <h2 style={s.pageTitle}>Smart Deal Mode</h2>
                <p style={s.pageDesc}>Direct Recovery Agreement with verified merchants</p>
            </motion.div>

            {/* How It Works */}
            <motion.div {...fadeUp(0.05)} className="card card-sm" style={{ marginBottom: 16, background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)' }}>
                <div style={{ display: 'flex', gap: 14 }}>
                    {[
                        { step: '1', label: 'Select Merchant', color: '#3b82f6' },
                        { step: '2', label: 'Receive Offer', color: '#f59e0b' },
                        { step: '3', label: 'Accept / Counter', color: '#10b981' },
                    ].map((s, i) => (
                        <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${s.color}18`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '0.75rem', fontWeight: 800 }}>
                                {s.step}
                            </div>
                            <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 4 }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* STEP: Select Merchant */}
            {step === 'select' && (
                <motion.div {...fadeUp(0.1)}>
                    <div className="section-header">
                        <span className="section-title">Verified Merchants</span>
                        <span className="badge badge-green"><Shield size={10} /> All Certified</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {merchants.map((m, i) => (
                            <motion.div
                                key={m.id}
                                className="card card-sm"
                                style={{ cursor: 'pointer' }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelectMerchant(m)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={s.merchAvatar}>{m.name.charAt(0)}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{m.name}</span>
                                            {m.verified && <Shield size={13} color="#10b981" />}
                                        </div>
                                        <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 1 }}>{m.speciality}</p>
                                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                            <span style={s.detail}><Star size={10} color="#f59e0b" fill="#f59e0b" /> {m.rating} ({m.reviews})</span>
                                            <span style={s.detail}><MapPin size={10} /> {m.location}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Response</p>
                                        <p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#10b981' }}>{m.response}</p>
                                        <p style={{ fontSize: '0.6rem', color: '#64748b', marginTop: 2 }}>{m.deals} deals</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* STEP: Waiting for Merchant Offer */}
            {(step === 'waiting' || step === 'counter-waiting' || step === 'inspection') && selectedMerchant && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.waitingWrap}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                        style={{ display: 'flex' }}
                    >
                        <MessageSquare size={44} color="#3b82f6" />
                    </motion.div>
                    <h3 style={{ fontWeight: 700, marginTop: 18, fontSize: '1.1rem' }}>
                        {step === 'inspection' ? 'Inspection in Progress...' :
                            step === 'counter-waiting' ? 'Reviewing Counter Offer...' :
                                'Waiting for Merchant Response...'}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 4 }}>
                        {selectedMerchant.name} is {step === 'inspection' ? 'inspecting your material' : 'evaluating your material'}
                    </p>
                    <div className="progress-bar" style={{ width: '70%', marginTop: 20 }}>
                        <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: step === 'inspection' ? 2.8 : 1.8 }} />
                    </div>
                </motion.div>
            )}

            {/* STEP: Merchant Offer Received */}
            {step === 'offer' && selectedMerchant && merchantOffer && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Offer Card */}
                    <div className="card" style={{ textAlign: 'center', padding: 24, marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                            <div style={{ ...s.merchAvatar, width: 32, height: 32, fontSize: '0.75rem' }}>{selectedMerchant.name.charAt(0)}</div>
                            <span style={{ fontWeight: 600 }}>{selectedMerchant.name}</span>
                            <Shield size={14} color="#10b981" />
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 12 }}>Merchant Offer</p>
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                        >
                            <span style={{ fontSize: '2.8rem', fontWeight: 900, color: '#10b981' }}>₹{merchantOffer}</span>
                        </motion.div>
                        <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 8 }}>
                            Based on material analysis • Includes doorstep pickup
                        </p>
                    </div>

                    {/* Structured Actions — No free chat */}
                    <div className="section-header">
                        <span className="section-title">Your Response</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {/* Accept Offer */}
                        <motion.button
                            className="btn btn-lg"
                            style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleAcceptOffer}
                        >
                            <CheckCircle size={18} /> Accept Offer — ₹{merchantOffer}
                        </motion.button>

                        {/* Counter Offer */}
                        <div className="card card-sm" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.15)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <ArrowUpDown size={16} color="#f59e0b" />
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Counter Offer</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <div style={s.counterInputWrap}>
                                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>₹</span>
                                    <input
                                        type="number"
                                        value={counterAmount}
                                        onChange={(e) => setCounterAmount(e.target.value)}
                                        placeholder="Your price"
                                        style={s.counterInput}
                                    />
                                </div>
                                <button
                                    className="btn btn-sm"
                                    style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', whiteSpace: 'nowrap' }}
                                    onClick={handleCounter}
                                >
                                    Send Counter
                                </button>
                            </div>
                        </div>

                        {/* Request Inspection */}
                        <motion.button
                            className="btn btn-lg btn-secondary"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleRequestInspection}
                        >
                            <Eye size={18} /> Request Physical Inspection
                        </motion.button>
                    </div>

                    {/* Change Merchant */}
                    <button
                        className="btn btn-sm btn-secondary"
                        style={{ width: '100%', marginTop: 14, opacity: 0.6 }}
                        onClick={() => { setStep('select'); setSelectedMerchant(null); setMerchantOffer(null); setCounterAmount(''); }}
                    >
                        <X size={14} /> Choose Different Merchant
                    </button>
                </motion.div>
            )}
        </div>
    );
}

const s = {
    pageTitle: { fontSize: '1.4rem', fontWeight: 800 },
    pageDesc: { fontSize: '0.85rem', color: '#94a3b8', marginTop: 4, marginBottom: 16 },
    merchAvatar: {
        width: 40, height: 40, borderRadius: 12,
        background: 'linear-gradient(135deg, #10b981, #059669)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: '1rem', color: '#fff',
    },
    detail: {
        display: 'flex', alignItems: 'center', gap: 3,
        fontSize: '0.7rem', color: '#94a3b8',
    },
    waitingWrap: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '40vh', textAlign: 'center',
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
    counterInputWrap: {
        flex: 1, display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 12px', background: 'rgba(255,255,255,0.04)',
        borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
    },
    counterInput: {
        flex: 1, background: 'none', border: 'none', outline: 'none',
        color: '#f1f5f9', fontSize: '0.9rem', fontFamily: 'inherit',
    },
};
