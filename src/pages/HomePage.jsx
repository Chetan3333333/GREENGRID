import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Apple, Cpu, Recycle, Coins, TrendingUp,
    ChevronRight, Leaf, ArrowRight, Sparkles
} from 'lucide-react';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: d, duration: 0.4 },
});

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            {/* Greeting */}
            <motion.div {...fadeUp(0)} style={s.greeting}>
                <p style={s.hello}>Hello, <span style={s.name}>Green Hero</span> 🌿</p>
                <p style={s.subtitle}>What would you like to responsibly manage today?</p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div {...fadeUp(0.1)} style={s.statsRow}>
                <div className="card card-sm" style={s.statCard}>
                    <div style={{ ...s.statIcon, background: 'rgba(16,185,129,0.15)' }}>
                        <Coins size={18} color="#10b981" />
                    </div>
                    <div>
                        <div className="stat-value gradient-text" style={{ fontSize: '1.3rem' }}>2,450</div>
                        <div className="stat-label">GreenCoins</div>
                    </div>
                </div>
                <div className="card card-sm" style={s.statCard}>
                    <div style={{ ...s.statIcon, background: 'rgba(245,158,11,0.15)' }}>
                        <TrendingUp size={18} color="#f59e0b" />
                    </div>
                    <div>
                        <div className="stat-value gradient-gold-text" style={{ fontSize: '1.3rem' }}>782</div>
                        <div className="stat-label">Green Score</div>
                    </div>
                </div>
            </motion.div>

            {/* AI Scan CTA */}
            <motion.div
                {...fadeUp(0.2)}
                className="card"
                style={s.scanCta}
                onClick={() => navigate('/scan')}
            >
                <div style={s.scanLeft}>
                    <div style={s.scanIcon}>
                        <Sparkles size={24} color="#fff" />
                    </div>
                    <div>
                        <h3 style={s.scanTitle}>AI Resource Scanner</h3>
                        <p style={s.scanDesc}>Upload an item for AI evaluation</p>
                    </div>
                </div>
                <ArrowRight size={20} color="#10b981" />
            </motion.div>

            {/* Categories */}
            <motion.div {...fadeUp(0.3)}>
                <div className="section-header">
                    <span className="section-title">Resource Categories</span>
                </div>
                <div style={s.categories}>
                    {[
                        { icon: Apple, label: 'Food &\nOrganics', color: '#10b981', bg: 'rgba(16,185,129,0.12)', to: '/food' },
                        { icon: Cpu, label: 'Electronics\n& E-Waste', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', to: '/electronics' },
                        { icon: Recycle, label: 'Recyclable\nMaterials', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', to: '/recyclables' },
                    ].map((cat, i) => (
                        <motion.div
                            key={cat.label}
                            className="card card-sm"
                            style={s.catCard}
                            onClick={() => navigate(cat.to)}
                            whileTap={{ scale: 0.96 }}
                        >
                            <div style={{ ...s.catIcon, background: cat.bg }}>
                                <cat.icon size={26} color={cat.color} />
                            </div>
                            <p style={s.catLabel}>{cat.label}</p>
                            <ChevronRight size={16} color="#475569" style={{ marginTop: 6 }} />
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div {...fadeUp(0.4)}>
                <div className="section-header" style={{ marginTop: 8 }}>
                    <span className="section-title">Quick Actions</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                        { icon: Coins, label: 'GreenCoins Wallet', desc: 'Earn & spend eco rewards', to: '/wallet', color: '#f59e0b' },
                        { icon: TrendingUp, label: 'Green Credit Score', desc: 'Track your sustainability rating', to: '/credit-score', color: '#10b981' },
                        { icon: Leaf, label: 'Eco Marketplace', desc: 'Shop with GreenCoins', to: '/marketplace', color: '#34d399' },
                    ].map((item) => (
                        <motion.div
                            key={item.label}
                            className="list-item"
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(item.to)}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="icon-circle-sm" style={{ background: `${item.color}18` }}>
                                <item.icon size={18} color={item.color} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.desc}</div>
                            </div>
                            <ChevronRight size={16} color="#475569" />
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div {...fadeUp(0.5)}>
                <div className="section-header" style={{ marginTop: 8 }}>
                    <span className="section-title">Recent Activity</span>
                    <span className="section-link">View all</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                        { emoji: '🍎', text: 'Donated 5kg food to Care NGO', coins: '+120', time: '2h ago' },
                        { emoji: '📱', text: 'Sold old laptop to GreenMerch', coins: '+85', time: '1d ago' },
                        { emoji: '♻️', text: 'Recycled 3kg plastic bottles', coins: '+45', time: '3d ago' },
                    ].map((act, i) => (
                        <div key={i} className="list-item" style={{ opacity: 1 - i * 0.15 }}>
                            <span style={{ fontSize: '1.5rem' }}>{act.emoji}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{act.text}</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{act.time}</div>
                            </div>
                            <span className="badge badge-green">{act.coins} 🪙</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

const s = {
    greeting: { marginBottom: 18 },
    hello: { fontSize: '1.4rem', fontWeight: 700 },
    name: { color: '#34d399' },
    subtitle: { fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 },
    statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 },
    statCard: { display: 'flex', alignItems: 'center', gap: 12 },
    statIcon: { width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    scanCta: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        cursor: 'pointer',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.06))',
        border: '1px solid rgba(16,185,129,0.2)',
    },
    scanLeft: { display: 'flex', alignItems: 'center', gap: 14 },
    scanIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        background: 'linear-gradient(135deg, #10b981, #059669)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanTitle: { fontWeight: 700, fontSize: '1rem' },
    scanDesc: { fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 },
    categories: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 10 },
    catCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        textAlign: 'center',
        cursor: 'pointer',
        padding: 16,
    },
    catIcon: { width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    catLabel: { fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'pre-line', lineHeight: 1.3, color: '#cbd5e1' },
};
