import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Heart, ShoppingBag, Recycle, ChevronRight, Star, MapPin, Shield } from 'lucide-react';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: d, duration: 0.4 },
});

const actions = [
    { id: 'donate', label: 'Donate', icon: Heart, desc: 'Give to NGOs & schools', color: '#10b981', coins: '+200' },
    { id: 'sell', label: 'Sell', icon: ShoppingBag, desc: 'Sell to verified merchants', color: '#3b82f6', coins: '+150' },
    { id: 'recycle', label: 'Recycle', icon: Recycle, desc: 'Certified recycling', color: '#f59e0b', coins: '+80' },
];

const merchants = [
    { name: 'GreenTech Solutions', rating: 4.8, reviews: 234, loc: 'Mumbai', verified: true, speciality: 'Smartphones, Laptops' },
    { name: 'EcoCircuit Hub', rating: 4.6, reviews: 189, loc: 'Delhi', verified: true, speciality: 'PCBs, Components' },
    { name: 'ReNew Electronics', rating: 4.5, reviews: 156, loc: 'Bangalore', verified: true, speciality: 'Appliances, Gadgets' },
];

const ngosList = [
    { name: 'Digital Empowerment Foundation', type: 'Education', items: 'Laptops, Tablets' },
    { name: 'Pratham Education Foundation', type: 'Schools', items: 'Computers, Phones' },
    { name: 'Teach For India', type: 'Classrooms', items: 'Projectors, Laptops' },
];

export default function ElectronicsPage() {
    const [selected, setSelected] = useState(null);

    return (
        <div className="page-container">
            <motion.div {...fadeUp(0)}>
                <h2 style={s.title}>E-Waste & Electronics</h2>
                <p style={s.desc}>AI-guided decisions for reusable electronics</p>
            </motion.div>

            {/* Decision Cards */}
            <motion.div {...fadeUp(0.1)}>
                <div className="section-header">
                    <span className="section-title">Choose Action</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {actions.map((act) => (
                        <motion.div
                            key={act.id}
                            className="card card-sm"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 14,
                                cursor: 'pointer',
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
                            <span className="badge" style={{ background: `${act.color}15`, color: act.color, border: `1px solid ${act.color}30` }}>
                                {act.coins} 🪙
                            </span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Conditional Content */}
            {selected === 'sell' && (
                <motion.div {...fadeUp(0.1)} style={{ marginTop: 20 }}>
                    <div className="section-header">
                        <span className="section-title">Verified Merchants</span>
                        <span className="badge badge-green"><Shield size={10} /> Verified</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {merchants.map((m, i) => (
                            <motion.div key={i} className="card card-sm" style={{ cursor: 'pointer' }} whileTap={{ scale: 0.98 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                    <div style={s.merchIcon}>
                                        <ShoppingBag size={20} color="#3b82f6" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.name}</p>
                                            {m.verified && <Shield size={13} color="#10b981" />}
                                        </div>
                                        <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{m.speciality}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingLeft: 54 }}>
                                    <div style={s.merchDetail}><Star size={12} color="#f59e0b" fill="#f59e0b" /> {m.rating} ({m.reviews})</div>
                                    <div style={s.merchDetail}><MapPin size={12} color="#64748b" /> {m.loc}</div>
                                </div>
                                <button className="btn btn-sm" style={{ width: '100%', marginTop: 12, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                                    Request Pickup <ChevronRight size={14} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {selected === 'donate' && (
                <motion.div {...fadeUp(0.1)} style={{ marginTop: 20 }}>
                    <div className="section-header">
                        <span className="section-title">NGOs & Schools</span>
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

            {selected === 'recycle' && (
                <motion.div {...fadeUp(0.1)} style={{ marginTop: 20 }}>
                    <div className="card" style={{ textAlign: 'center', padding: 28 }}>
                        <span style={{ fontSize: '3rem' }}>🏭</span>
                        <h3 style={{ fontWeight: 700, marginTop: 12 }}>Certified Recycling</h3>
                        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 8, lineHeight: 1.5 }}>
                            Your e-waste will be processed by certified recycling facilities. Schedule a free pickup or drop off at the nearest collection point.
                        </p>
                        <button className="btn btn-primary" style={{ marginTop: 16 }}>
                            Schedule Pickup <ChevronRight size={14} />
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
        width: 42,
        height: 42,
        borderRadius: 12,
        background: 'rgba(59,130,246,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    merchDetail: { display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#94a3b8' },
};
