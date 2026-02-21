import { useState } from 'react';
import { motion } from 'framer-motion';
import { Apple, Heart, Sprout, MapPin, ChevronRight, Phone, Clock, Truck } from 'lucide-react';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: d, duration: 0.4 },
});

const ngos = [
    { name: 'Akshaya Patra Foundation', dist: '2.3 km', items: 'Cooked food, Grains', phone: '+91-9876543210', timing: '8am - 8pm' },
    { name: 'Robin Hood Army', dist: '3.8 km', items: 'Fresh food, Fruits', phone: '+91-9123456789', timing: '9am - 6pm' },
    { name: 'Feeding India', dist: '5.1 km', items: 'Packaged food, Dry items', phone: '+91-9988776655', timing: '7am - 9pm' },
];

const compostOptions = [
    { name: 'Community Garden Program', desc: 'Donate compost to local gardens', icon: Sprout, color: '#10b981' },
    { name: 'Urban Farm Network', desc: 'Sell to urban farmers', icon: Truck, color: '#f59e0b' },
    { name: 'Home Composting Kit', desc: 'Start composting at home', icon: Apple, color: '#34d399' },
];

export default function FoodPage() {
    const [tab, setTab] = useState('edible');

    return (
        <div className="page-container">
            <motion.div {...fadeUp(0)}>
                <h2 style={s.title}>Food & Organic Resources</h2>
                <p style={s.desc}>AI-guided decisions for consumable and organic items</p>
            </motion.div>

            {/* Decision Banner */}
            <motion.div {...fadeUp(0.1)} className="card" style={s.banner}>
                <div style={s.bannerIcon}>🧠</div>
                <div>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Decision Engine</p>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                        Items are evaluated for freshness, edibility & safety before routing
                    </p>
                </div>
            </motion.div>

            {/* Tabs */}
            <motion.div {...fadeUp(0.15)} className="tab-pills" style={{ marginBottom: 18 }}>
                <button className={`tab-pill ${tab === 'edible' ? 'active' : ''}`} onClick={() => setTab('edible')}>
                    🍎 Edible Food
                </button>
                <button className={`tab-pill ${tab === 'compost' ? 'active' : ''}`} onClick={() => setTab('compost')}>
                    🌱 Compost
                </button>
            </motion.div>

            {tab === 'edible' ? (
                <>
                    {/* NGO Section */}
                    <motion.div {...fadeUp(0.2)}>
                        <div className="section-header">
                            <span className="section-title">Nearby NGOs</span>
                            <span className="badge badge-green"><MapPin size={10} /> Your Area</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {ngos.map((ngo, i) => (
                                <motion.div key={i} className="card card-sm" style={s.ngoCard} whileTap={{ scale: 0.98 }}>
                                    <div style={s.ngoTop}>
                                        <div style={s.ngoIcon}>
                                            <Heart size={20} color="#10b981" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ngo.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{ngo.items}</p>
                                        </div>
                                        <span className="badge badge-green">{ngo.dist}</span>
                                    </div>
                                    <div style={s.ngoBottom}>
                                        <div style={s.ngoDetail}><Phone size={12} color="#64748b" /> {ngo.phone}</div>
                                        <div style={s.ngoDetail}><Clock size={12} color="#64748b" /> {ngo.timing}</div>
                                    </div>
                                    <button className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: 10 }}>
                                        Donate Now <ChevronRight size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div {...fadeUp(0.3)} className="card" style={{ marginTop: 16, textAlign: 'center', padding: 24 }}>
                        <span style={{ fontSize: '2rem' }}>🪙</span>
                        <p style={{ fontWeight: 700, marginTop: 8 }}>Earn +150 GreenCoins</p>
                        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>
                            Donating edible food earns the highest rewards!
                        </p>
                    </motion.div>
                </>
            ) : (
                /* Compost Tab */
                <motion.div {...fadeUp(0.2)}>
                    <div className="section-header">
                        <span className="section-title">Composting Options</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {compostOptions.map((opt, i) => (
                            <motion.div key={i} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} whileTap={{ scale: 0.98 }}>
                                <div className="icon-circle" style={{ background: `${opt.color}15` }}>
                                    <opt.icon size={22} color={opt.color} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{opt.name}</p>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{opt.desc}</p>
                                </div>
                                <ChevronRight size={16} color="#475569" />
                            </motion.div>
                        ))}
                    </div>

                    <div className="card" style={{ marginTop: 16, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: '1.5rem' }}>♻️</span>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Compost Impact</p>
                                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                                    Composting reduces methane emissions and enriches soil
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

const s = {
    title: { fontSize: '1.4rem', fontWeight: 800 },
    desc: { fontSize: '0.85rem', color: '#94a3b8', marginTop: 4, marginBottom: 16 },
    banner: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 16,
        background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.04))',
        border: '1px solid rgba(16,185,129,0.15)',
    },
    bannerIcon: { fontSize: '1.8rem' },
    ngoCard: { cursor: 'pointer' },
    ngoTop: { display: 'flex', alignItems: 'center', gap: 12 },
    ngoIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        background: 'rgba(16,185,129,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ngoBottom: { display: 'flex', gap: 16, marginTop: 10, paddingLeft: 54 },
    ngoDetail: { display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#64748b' },
};
