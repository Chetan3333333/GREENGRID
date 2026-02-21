import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    User, Award, Coins, Recycle, Settings, ChevronRight,
    Bell, Moon, LogOut, HelpCircle, Heart, Shield, TrendingUp
} from 'lucide-react';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: d, duration: 0.4 },
});

const impactStats = [
    { label: 'Items Saved', value: '127', icon: Recycle, color: '#10b981' },
    { label: 'CO₂ Reduced', value: '48kg', icon: TrendingUp, color: '#3b82f6' },
    { label: 'Donations', value: '34', icon: Heart, color: '#ec4899' },
];

const menuItems = [
    { label: 'Notification Settings', icon: Bell, color: '#3b82f6' },
    { label: 'Dark Mode', icon: Moon, color: '#8b5cf6', toggle: true },
    { label: 'Help & Support', icon: HelpCircle, color: '#f59e0b' },
    { label: 'Privacy & Security', icon: Shield, color: '#10b981' },
    { label: 'App Settings', icon: Settings, color: '#64748b' },
];

export default function ProfilePage() {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            {/* Profile Header */}
            <motion.div {...fadeUp(0)} className="card" style={s.profileCard}>
                <div style={s.avatarRow}>
                    <div style={s.avatar}>
                        <User size={32} color="#10b981" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: 700, fontSize: '1.15rem' }}>Green Hero</h3>
                        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>Eco Champion · Member since Jan 2025</p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <span className="badge badge-green">🌿 Level 7</span>
                            <span className="badge badge-gold">🪙 2,450</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Impact Summary */}
            <motion.div {...fadeUp(0.1)}>
                <div className="section-header">
                    <span className="section-title">Your Impact</span>
                </div>
                <div className="grid-3">
                    {impactStats.map((stat, i) => (
                        <motion.div key={i} className="card card-sm" style={{ textAlign: 'center', padding: 14 }}>
                            <stat.icon size={20} color={stat.color} />
                            <p style={{ fontWeight: 800, fontSize: '1.2rem', marginTop: 6 }}>{stat.value}</p>
                            <p style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div {...fadeUp(0.2)} style={{ marginTop: 20 }}>
                <div className="section-header">
                    <span className="section-title">Quick Access</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                        { label: 'GreenCoins Wallet', icon: Coins, color: '#f59e0b', to: '/wallet' },
                        { label: 'Green Credit Score', icon: Award, color: '#10b981', to: '/credit-score' },
                        { label: 'Eco Marketplace', icon: Recycle, color: '#3b82f6', to: '/marketplace' },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            className="list-item"
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(item.to)}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="icon-circle-sm" style={{ background: `${item.color}18` }}>
                                <item.icon size={18} color={item.color} />
                            </div>
                            <span style={{ flex: 1, fontWeight: 500, fontSize: '0.9rem' }}>{item.label}</span>
                            <ChevronRight size={16} color="#475569" />
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Settings Menu */}
            <motion.div {...fadeUp(0.3)} style={{ marginTop: 20 }}>
                <div className="section-header">
                    <span className="section-title">Settings</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {menuItems.map((item, i) => (
                        <div key={i} className="list-item" style={{ cursor: 'pointer' }}>
                            <div className="icon-circle-sm" style={{ background: `${item.color}18` }}>
                                <item.icon size={16} color={item.color} />
                            </div>
                            <span style={{ flex: 1, fontWeight: 500, fontSize: '0.85rem' }}>{item.label}</span>
                            {item.toggle ? (
                                <div style={s.toggleOn}>
                                    <div style={s.toggleDot} />
                                </div>
                            ) : (
                                <ChevronRight size={14} color="#475569" />
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Logout */}
            <motion.div {...fadeUp(0.4)} style={{ marginTop: 20, marginBottom: 20 }}>
                <button className="btn btn-secondary" style={{ width: '100%', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                    <LogOut size={16} /> Sign Out
                </button>
            </motion.div>

            {/* Version */}
            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#475569', paddingBottom: 10 }}>
                GreenGrid v1.0.0 · Made with 💚
            </p>
        </div>
    );
}

const s = {
    profileCard: {
        marginBottom: 20,
        background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.04))',
        border: '1px solid rgba(16,185,129,0.15)',
    },
    avatarRow: { display: 'flex', alignItems: 'center', gap: 16 },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'rgba(16,185,129,0.12)',
        border: '2px solid rgba(16,185,129,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleOn: {
        width: 40,
        height: 22,
        borderRadius: 11,
        background: '#10b981',
        padding: 2,
        display: 'flex',
        justifyContent: 'flex-end',
    },
    toggleDot: {
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: '#fff',
    },
};
