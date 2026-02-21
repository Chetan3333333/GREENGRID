import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, ArrowUpRight, ArrowDownLeft, TrendingUp, Gift, ShoppingBag, ChevronRight } from 'lucide-react';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: d, duration: 0.4 },
});

const transactions = [
    { type: 'earn', label: 'Food Donation – Care NGO', coins: '+150', date: 'Today, 2:30 PM', emoji: '🍎' },
    { type: 'earn', label: 'Laptop Sold – GreenTech', coins: '+200', date: 'Yesterday, 4:15 PM', emoji: '💻' },
    { type: 'spend', label: 'Purchased Compost Pack', coins: '-80', date: 'Feb 18, 11:00 AM', emoji: '🌱' },
    { type: 'earn', label: 'Plastic Recycling', coins: '+45', date: 'Feb 17, 9:30 AM', emoji: '♻️' },
    { type: 'earn', label: 'E-waste to Recycler', coins: '+80', date: 'Feb 15, 3:00 PM', emoji: '🔋' },
    { type: 'spend', label: 'Eco Bag @ Marketplace', coins: '-120', date: 'Feb 14, 1:20 PM', emoji: '🛍️' },
];

const redeemOptions = [
    { label: 'Refurbished Products', desc: 'Electronics at 70% off', icon: '📱', coins: 'From 300' },
    { label: 'Organic Compost', desc: 'Premium compost bags', icon: '🌿', coins: 'From 80' },
    { label: 'Eco Product Discounts', desc: 'Up to 50% off eco products', icon: '🏷️', coins: 'From 50' },
    { label: 'Community Benefits', desc: 'Plant a tree in your name', icon: '🌳', coins: 'From 200' },
];

export default function WalletPage() {
    const [tab, setTab] = useState('history');

    return (
        <div className="page-container">
            {/* Balance Card */}
            <motion.div {...fadeUp(0)} className="card" style={s.balanceCard}>
                <div style={s.balanceTop}>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Total Balance</p>
                        <div style={s.balanceRow}>
                            <span style={s.balanceValue}>2,450</span>
                            <span style={{ fontSize: '1.2rem' }}>🪙</span>
                        </div>
                    </div>
                    <div style={s.coinIcon}>
                        <Coins size={28} color="#f59e0b" />
                    </div>
                </div>
                <div style={s.balanceStats}>
                    <div style={s.statItem}>
                        <ArrowUpRight size={14} color="#10b981" />
                        <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>+475</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>This month</span>
                    </div>
                    <div style={s.statItem}>
                        <ArrowDownLeft size={14} color="#f87171" />
                        <span style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>-200</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Spent</span>
                    </div>
                    <div style={s.statItem}>
                        <TrendingUp size={14} color="#f59e0b" />
                        <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600 }}>12%</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Growth</span>
                    </div>
                </div>
            </motion.div>

            {/* Earning Tips */}
            <motion.div {...fadeUp(0.1)} className="card card-sm" style={{ marginBottom: 18, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.3rem' }}>💡</span>
                    <div>
                        <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>Earn More GreenCoins</p>
                        <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>Donating food earns the highest rewards – up to 150 coins per donation!</p>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <motion.div {...fadeUp(0.15)} className="tab-pills" style={{ marginBottom: 16 }}>
                <button className={`tab-pill ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
                    📋 History
                </button>
                <button className={`tab-pill ${tab === 'redeem' ? 'active' : ''}`} onClick={() => setTab('redeem')}>
                    🎁 Redeem
                </button>
            </motion.div>

            {tab === 'history' ? (
                <motion.div {...fadeUp(0.2)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {transactions.map((tx, i) => (
                            <motion.div
                                key={i}
                                className="list-item"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <span style={{ fontSize: '1.4rem' }}>{tx.emoji}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 500, fontSize: '0.85rem' }}>{tx.label}</p>
                                    <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>{tx.date}</p>
                                </div>
                                <span style={{
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    color: tx.type === 'earn' ? '#10b981' : '#f87171',
                                }}>
                                    {tx.coins}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            ) : (
                <motion.div {...fadeUp(0.2)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {redeemOptions.map((opt, i) => (
                            <motion.div
                                key={i}
                                className="card card-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span style={{ fontSize: '1.6rem' }}>{opt.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{opt.label}</p>
                                    <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{opt.desc}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span className="badge badge-gold">{opt.coins} 🪙</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

const s = {
    balanceCard: {
        background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.05))',
        border: '1px solid rgba(245,158,11,0.2)',
        marginBottom: 16,
    },
    balanceTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    balanceRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 },
    balanceValue: {
        fontSize: '2.2rem',
        fontWeight: 900,
        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    coinIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        background: 'rgba(245,158,11,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    balanceStats: {
        display: 'flex',
        gap: 20,
        marginTop: 18,
        paddingTop: 14,
        borderTop: '1px solid rgba(255,255,255,0.06)',
    },
    statItem: { display: 'flex', alignItems: 'center', gap: 4 },
};
