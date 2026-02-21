import { useState } from 'react';
import { motion } from 'framer-motion';
import { Recycle, Package, Droplets, Newspaper, Wine, ChevronRight, Truck, MapPin, ArrowRight } from 'lucide-react';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: d, duration: 0.4 },
});

const materials = [
    { id: 'plastic', label: 'Plastic', icon: Package, emoji: '🧴', color: '#3b82f6', tip: 'Clean and separate by type' },
    { id: 'paper', label: 'Paper & Cardboard', icon: Newspaper, emoji: '📦', color: '#10b981', tip: 'Keep dry and flatten' },
    { id: 'glass', label: 'Glass', icon: Wine, emoji: '🫙', color: '#f59e0b', tip: 'Separate by color if possible' },
    { id: 'metal', label: 'Metal & Cans', icon: Recycle, emoji: '🥫', color: '#ef4444', tip: 'Rinse cans before recycling' },
    { id: 'liquid', label: 'Liquid Waste', icon: Droplets, emoji: '💧', color: '#8b5cf6', tip: 'Never pour down drains' },
];

const centers = [
    { name: 'EcoRecycle Hub', dist: '1.8 km', accepts: 'All materials', hours: '8am - 7pm' },
    { name: 'GreenCycle Center', dist: '3.2 km', accepts: 'Plastic, Metal, Paper', hours: '9am - 6pm' },
    { name: 'CityWaste Solutions', dist: '4.5 km', accepts: 'Glass, E-waste, Metal', hours: '7am - 8pm' },
];

export default function RecyclablesPage() {
    const [selected, setSelected] = useState(null);

    return (
        <div className="page-container">
            <motion.div {...fadeUp(0)}>
                <h2 style={s.title}>Recyclable Materials</h2>
                <p style={s.desc}>Identify materials and route them responsibly</p>
            </motion.div>

            {/* Material Grid */}
            <motion.div {...fadeUp(0.1)}>
                <div className="section-header">
                    <span className="section-title">Select Material Type</span>
                </div>
                <div style={s.matGrid}>
                    {materials.map((mat) => (
                        <motion.div
                            key={mat.id}
                            className="card card-sm"
                            style={{
                                ...s.matCard,
                                borderColor: selected === mat.id ? mat.color : undefined,
                                background: selected === mat.id ? `${mat.color}0a` : undefined,
                            }}
                            onClick={() => setSelected(mat.id)}
                            whileTap={{ scale: 0.96 }}
                        >
                            <span style={{ fontSize: '1.8rem' }}>{mat.emoji}</span>
                            <p style={{ fontWeight: 600, fontSize: '0.8rem', marginTop: 6 }}>{mat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {selected && (
                <motion.div {...fadeUp(0)}>
                    {/* Tip */}
                    <div className="card card-sm" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <span style={{ fontSize: '1.2rem' }}>💡</span>
                        <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                            <strong style={{ color: '#10b981' }}>Tip:</strong> {materials.find(m => m.id === selected)?.tip}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="section-header">
                        <span className="section-title">Available Actions</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                            { label: 'Donate for Reuse', desc: 'Give to craft groups or workshops', icon: '🎨', coins: '+60' },
                            { label: 'Sell to Recyclers', desc: 'Get wallet credit from certified buyers', icon: '💰', coins: '+45' },
                            { label: 'Drop at Recycling Center', desc: 'Find nearest certified center', icon: '🏭', coins: '+30' },
                        ].map((act, i) => (
                            <motion.div key={i} className="list-item" style={{ cursor: 'pointer' }} whileTap={{ scale: 0.98 }}>
                                <span style={{ fontSize: '1.4rem' }}>{act.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{act.label}</p>
                                    <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{act.desc}</p>
                                </div>
                                <span className="badge badge-green">{act.coins} 🪙</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Nearby Centers */}
            <motion.div {...fadeUp(0.2)} style={{ marginTop: 20 }}>
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
    matCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 16,
        cursor: 'pointer',
        textAlign: 'center',
    },
    centerIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        background: 'rgba(245,158,11,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
};
