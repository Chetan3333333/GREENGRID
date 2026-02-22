import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Cpu, Heart, Gavel, Recycle, ChevronRight, Star, MapPin, Shield,
    TrendingUp, Package, ArrowRight, Coins
} from 'lucide-react';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: d, duration: 0.4 },
});

const actions = [
    { id: 'donate', label: 'Donate for Reuse', icon: Heart, desc: 'Give functional devices to NGOs & schools', color: '#10b981', coins: '+200 🪙', route: 'donate' },
    { id: 'exchange', label: 'Post to Material Exchange', icon: Gavel, desc: 'Let certified recyclers bid for recovery value', color: '#f59e0b', coins: 'Earn ₹', route: 'bidding' },
    { id: 'recycle', label: 'Certified Recycling', icon: Recycle, desc: 'Schedule free pickup by recycling center', color: '#3b82f6', coins: '+80 🪙', route: 'recycle' },
];

const ngosList = [
    { name: 'Digital Empowerment Foundation', type: 'Education', items: 'Laptops, Tablets' },
    { name: 'Pratham Education Foundation', type: 'Schools', items: 'Computers, Phones' },
    { name: 'Teach For India', type: 'Classrooms', items: 'Projectors, Laptops' },
];

const recoveryExamples = [
    { item: 'Smartphone', value: '₹350–₹580', materials: 'Cu, Au, Li' },
    { item: 'Laptop', value: '₹800–₹1,400', materials: 'Cu, Al, Pd' },
    { item: 'PCB Board', value: '₹200–₹450', materials: 'Au, Ag, Cu' },
];

export default function ElectronicsPage() {
    const [selected, setSelected] = useState(null);
    const navigate = useNavigate();

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

            {/* Exchange Section */}
            {selected === 'exchange' && (
                <motion.div {...fadeUp(0.1)} style={{ marginTop: 20 }}>
                    <div className="section-header">
                        <span className="section-title">Recovery Value Estimates</span>
                        <span className="badge badge-gold"><TrendingUp size={10} /> AI Valued</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {recoveryExamples.map((ex, i) => (
                            <div key={i} className="list-item">
                                <Package size={16} color="#f59e0b" />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{ex.item}</p>
                                    <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Recoverable: {ex.materials}</p>
                                </div>
                                <span style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.85rem' }}>{ex.value}</span>
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 16 }} onClick={() => navigate('/bidding')}>
                        <Gavel size={16} /> Post to Material Exchange
                    </button>
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
                            <motion.div key={i} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} whileTap={{ scale: 0.98 }}>
                                <div style={{ ...s.merchIcon, background: 'rgba(16,185,129,0.1)' }}>
                                    <Heart size={20} color="#10b981" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ngo.name}</p>
                                    <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{ngo.type} · Accepts {ngo.items}</p>
                                </div>
                                <ChevronRight size={16} color="#475569" />
                            </motion.div>
                        ))}
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
                        <button className="btn btn-primary" style={{ marginTop: 16 }}>
                            Schedule Free Pickup <ChevronRight size={14} />
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
};
