import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Heart, Shield, Leaf, TrendingUp, ChevronRight, Star, Zap, Recycle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { calculateGreenScore, getUserItems, getUserTransactions } from '../services/database';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: d, duration: 0.4 },
});

const benefits = [
    { label: 'Increased GreenCoin Rewards', desc: '2x multiplier active', icon: Zap, color: '#f59e0b' },
    { label: 'Priority Pickups', desc: 'Fast-track collection', icon: Star, color: '#10b981' },
    { label: 'Trust Badge', desc: 'Verified eco contributor', icon: Shield, color: '#3b82f6' },
    { label: 'NGO Preference', desc: 'Premium donor status', icon: Heart, color: '#ec4899' },
];

export default function CreditScorePage() {
    const { currentUser, userProfile } = useAuth();
    const [stats, setStats] = useState({ items: 0, donations: 0, transactions: 0 });

    // Calculate score from real data
    const score = calculateGreenScore(userProfile);
    const maxScore = 900;
    const pct = Math.min((score / maxScore) * 100, 100);
    const circumference = 2 * Math.PI * 72;
    const offset = circumference - (pct / 100) * circumference;

    const scoreLabel = score >= 700 ? 'Excellent' : score >= 500 ? 'Great' : score >= 300 ? 'Good' : score >= 100 ? 'Building' : 'Starter';

    // Load stats for breakdown
    useEffect(() => {
        async function loadStats() {
            if (!currentUser) return;
            try {
                const [items, txs] = await Promise.all([
                    getUserItems(currentUser.uid),
                    getUserTransactions(currentUser.uid),
                ]);
                setStats({
                    items: items.length,
                    donations: userProfile?.donations || 0,
                    transactions: txs.length,
                });
            } catch (err) {
                console.error('Failed to load stats:', err);
            }
        }
        loadStats();
    }, [currentUser, userProfile]);

    // Dynamic breakdown based on real activity
    const itemsRecycled = userProfile?.itemsRecycled || 0;
    const donations = userProfile?.donations || 0;
    const greenCoins = userProfile?.greenCoins || 0;

    const breakdown = [
        { label: 'Recycling Activity', value: Math.min(100, itemsRecycled * 10), color: '#10b981', icon: Recycle },
        { label: 'Donation Impact', value: Math.min(100, donations * 15), color: '#3b82f6', icon: Heart },
        { label: 'Coin Earnings', value: Math.min(100, Math.round(greenCoins / 5)), color: '#f59e0b', icon: TrendingUp },
        { label: 'Consistency', value: Math.min(100, stats.transactions * 8), color: '#8b5cf6', icon: Shield },
    ];

    // Dynamic badges based on real achievements
    const badges = [];
    if (itemsRecycled >= 1) badges.push({ label: 'First Scan', emoji: '📱', desc: 'Scanned your first item' });
    if (itemsRecycled >= 5) badges.push({ label: 'Eco Starter', emoji: '🌿', desc: '5+ items recycled' });
    if (itemsRecycled >= 10) badges.push({ label: 'Green Champion', emoji: '♻️', desc: '10+ items recycled' });
    if (greenCoins >= 100) badges.push({ label: 'Coin Collector', emoji: '🪙', desc: '100+ GreenCoins earned' });
    if (greenCoins >= 500) badges.push({ label: 'Eco Investor', emoji: '💎', desc: '500+ GreenCoins earned' });
    if (donations >= 1) badges.push({ label: 'Food Guardian', emoji: '🍎', desc: 'First food donation' });

    // Show placeholder badges if user hasn't earned any yet
    if (badges.length === 0) {
        badges.push(
            { label: 'First Scan', emoji: '📱', desc: 'Scan your first item', locked: true },
            { label: 'Eco Starter', emoji: '🌿', desc: 'Recycle 5 items', locked: true },
            { label: 'Coin Collector', emoji: '🪙', desc: 'Earn 100 GreenCoins', locked: true },
            { label: 'Food Guardian', emoji: '🍎', desc: 'Make a food donation', locked: true },
        );
    }

    return (
        <div className="page-container">
            <motion.div {...fadeUp(0)}>
                <h2 style={s.title}>Green Credit Score</h2>
                <p style={s.desc}>Your sustainability reputation</p>
            </motion.div>

            {/* Score Ring */}
            <motion.div {...fadeUp(0.1)} style={s.ringWrap}>
                <div className="score-ring">
                    <svg width="180" height="180" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                        <motion.circle
                            cx="80" cy="80" r="72" fill="none"
                            stroke="url(#scoreGrad)" strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: offset }}
                            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                        />
                        <defs>
                            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="50%" stopColor="#34d399" />
                                <stop offset="100%" stopColor="#f59e0b" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="score-ring-value">
                        <motion.span
                            style={s.scoreNum}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {score}
                        </motion.span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>/ {maxScore}</span>
                        <span className="badge badge-green" style={{ marginTop: 4 }}>{scoreLabel}</span>
                    </div>
                </div>
            </motion.div>

            {/* Activity Stats */}
            <motion.div {...fadeUp(0.15)} className="card card-sm" style={{ marginBottom: 16, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                    {[
                        { val: itemsRecycled, label: 'Items Recycled', color: '#10b981' },
                        { val: greenCoins, label: 'GreenCoins', color: '#fbbf24' },
                        { val: stats.transactions, label: 'Transactions', color: '#3b82f6' },
                    ].map((stat, i) => (
                        <div key={i}>
                            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: stat.color }}>{stat.val}</span>
                            <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Breakdown */}
            <motion.div {...fadeUp(0.2)}>
                <div className="section-header">
                    <span className="section-title">Score Breakdown</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {breakdown.map((item, i) => (
                        <div key={i} style={s.breakdownItem}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                <item.icon size={16} color={item.color} />
                                <span style={{ fontWeight: 500, fontSize: '0.85rem', flex: 1 }}>{item.label}</span>
                                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: item.color }}>{item.value}%</span>
                            </div>
                            <div className="progress-bar">
                                <motion.div
                                    className="progress-fill"
                                    style={{ background: item.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.value}%` }}
                                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Badges */}
            <motion.div {...fadeUp(0.3)} style={{ marginTop: 20 }}>
                <div className="section-header">
                    <span className="section-title">Badges</span>
                    <span className="section-link">{badges.filter(b => !b.locked).length} Earned</span>
                </div>
                <div className="grid-2">
                    {badges.map((badge, i) => (
                        <motion.div
                            key={i}
                            className="card card-sm"
                            style={{ textAlign: 'center', padding: 16, opacity: badge.locked ? 0.4 : 1 }}
                            whileTap={{ scale: 0.96 }}
                        >
                            <span style={{ fontSize: '1.8rem' }}>{badge.emoji}</span>
                            <p style={{ fontWeight: 600, fontSize: '0.8rem', marginTop: 6 }}>{badge.label}</p>
                            <p style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>
                                {badge.locked ? `🔒 ${badge.desc}` : badge.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Benefits */}
            <motion.div {...fadeUp(0.4)} style={{ marginTop: 20 }}>
                <div className="section-header">
                    <span className="section-title">Active Benefits</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {benefits.map((b, i) => (
                        <div key={i} className="list-item">
                            <div className="icon-circle-sm" style={{ background: `${b.color}18` }}>
                                <b.icon size={16} color={b.color} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 500, fontSize: '0.85rem' }}>{b.label}</p>
                                <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 1 }}>{b.desc}</p>
                            </div>
                            <ChevronRight size={14} color="#475569" />
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

const s = {
    title: { fontSize: '1.4rem', fontWeight: 800 },
    desc: { fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 },
    ringWrap: { display: 'flex', justifyContent: 'center', margin: '20px 0' },
    scoreNum: {
        fontSize: '2.4rem',
        fontWeight: 900,
        background: 'linear-gradient(135deg, #34d399, #10b981)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    breakdownItem: {},
};
