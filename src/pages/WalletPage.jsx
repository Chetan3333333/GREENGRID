import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet, TrendingUp, TrendingDown, Coins, Gift,
    ChevronRight, ArrowUpRight, ArrowDownLeft, Gavel, Leaf, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserTransactions } from '../services/database';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: d, duration: 0.4 },
});

const redeemOptions = [
    { name: 'Solar Charger', coins: 300, emoji: '🔋' },
    { name: 'Eco Tote Bag', coins: 100, emoji: '🛍️' },
    { name: 'Plant Kit', coins: 150, emoji: '🌱' },
    { name: 'Bamboo Bottle', coins: 200, emoji: '🍶' },
];

function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 604800)}w ago`;
}

export default function WalletPage() {
    const { currentUser, userProfile } = useAuth();
    const [filter, setFilter] = useState('all');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const greenCoins = userProfile?.greenCoins ?? 0;

    // Fetch transactions from database
    useEffect(() => {
        async function loadTransactions() {
            if (!currentUser) return;
            setLoading(true);
            try {
                const txs = await getUserTransactions(currentUser.uid);
                setTransactions(txs);
            } catch (err) {
                console.error('Failed to load transactions:', err);
            }
            setLoading(false);
        }
        loadTransactions();
    }, [currentUser]);

    // Calculate stats from real transactions
    const earned30d = transactions
        .filter(t => t.type === 'earn' && new Date(t.createdAt) > new Date(Date.now() - 30 * 86400000))
        .reduce((sum, t) => sum + (t.coins || 0), 0);

    const spent30d = transactions
        .filter(t => t.type === 'spend' && new Date(t.createdAt) > new Date(Date.now() - 30 * 86400000))
        .reduce((sum, t) => sum + Math.abs(t.coins || 0), 0);

    const exchangeTotal = transactions
        .filter(t => t.type === 'exchange')
        .reduce((sum, t) => sum + (t.coins || 0), 0);

    const exchangeCount = transactions.filter(t => t.type === 'exchange').length;

    const filtered = filter === 'all'
        ? transactions
        : transactions.filter(t => t.type === filter);

    return (
        <div className="page-container">
            {/* Balance Card */}
            <motion.div
                {...fadeUp(0)}
                className="card"
                style={s.balanceCard}
            >
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Balance</p>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                        <span className="gradient-text" style={{ fontSize: '2.4rem', fontWeight: 900 }}>
                            {greenCoins.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>GreenCoins</span>
                    </div>
                </motion.div>
                <div style={s.statsRow}>
                    <div style={s.miniStat}>
                        <ArrowUpRight size={14} color="#10b981" />
                        <div>
                            <p style={{ fontWeight: 700, color: '#10b981' }}>+{earned30d}</p>
                            <p style={{ fontSize: '0.65rem', color: '#64748b' }}>Earned (30d)</p>
                        </div>
                    </div>
                    <div style={s.miniStat}>
                        <ArrowDownLeft size={14} color="#f59e0b" />
                        <div>
                            <p style={{ fontWeight: 700, color: '#f59e0b' }}>-{spent30d}</p>
                            <p style={{ fontSize: '0.65rem', color: '#64748b' }}>Spent (30d)</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Exchange Earnings */}
            <motion.div
                {...fadeUp(0.1)}
                className="card card-sm"
                style={{ marginBottom: 16, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <Gavel size={16} color="#10b981" />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Exchange Earnings</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                    {[
                        { val: `${exchangeTotal}`, label: 'Coins Earned', color: '#10b981' },
                        { val: `${exchangeCount}`, label: 'Exchanges', color: '#3b82f6' },
                        { val: `${transactions.length}`, label: 'Total Txns', color: '#fbbf24' },
                    ].map((stat, i) => (
                        <div key={i}>
                            <span style={{ fontWeight: 800, fontSize: '1rem', color: stat.color }}>{stat.val}</span>
                            <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div {...fadeUp(0.15)} style={s.filterRow}>
                {[
                    { id: 'all', label: 'All' },
                    { id: 'exchange', label: '💰 Exchange' },
                    { id: 'earn', label: '🪙 Earned' },
                    { id: 'spend', label: '🛒 Spent' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-pill ${filter === tab.id ? 'active' : ''}`}
                        onClick={() => setFilter(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </motion.div>

            {/* Transactions */}
            <motion.div {...fadeUp(0.2)}>
                <div className="section-header">
                    <span className="section-title">Transaction History</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{filtered.length} items</span>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                        <p style={{ marginTop: 8, fontSize: '0.85rem' }}>Loading transactions...</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                        <p style={{ fontSize: '1.5rem', marginBottom: 8 }}>🪙</p>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No transactions yet</p>
                        <p style={{ fontSize: '0.78rem', marginTop: 4 }}>Scan an item to start earning GreenCoins!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {filtered.map((tx, i) => (
                            <motion.div
                                key={tx.id}
                                className="list-item"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                            >
                                <span style={{ fontSize: '1.5rem' }}>{tx.emoji || '🪙'}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 500, fontSize: '0.85rem' }}>{tx.reason}</p>
                                    <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>{timeAgo(tx.createdAt)}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    {tx.amount && (
                                        <p style={{ fontWeight: 700, color: '#10b981', fontSize: '0.88rem' }}>{tx.amount}</p>
                                    )}
                                    <p style={{
                                        fontWeight: 600,
                                        fontSize: tx.amount ? '0.7rem' : '0.85rem',
                                        color: tx.type === 'spend' ? '#f59e0b' : '#34d399',
                                    }}>
                                        {tx.type === 'spend' ? `-${Math.abs(tx.coins)}` : `+${tx.coins}`} 🪙
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Redeem Section */}
            <motion.div {...fadeUp(0.3)} style={{ marginTop: 20 }}>
                <div className="section-header">
                    <span className="section-title">Redeem GreenCoins</span>
                    <span className="section-link">View all</span>
                </div>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                    {redeemOptions.map((item, i) => (
                        <motion.div
                            key={i}
                            className="card card-sm"
                            style={s.redeemCard}
                            whileTap={{ scale: 0.96 }}
                        >
                            <span style={{ fontSize: '2rem' }}>{item.emoji}</span>
                            <p style={{ fontWeight: 600, fontSize: '0.78rem', marginTop: 6 }}>{item.name}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 6 }}>
                                <Coins size={12} color="#f59e0b" />
                                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fbbf24' }}>{item.coins}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

const s = {
    balanceCard: {
        textAlign: 'center',
        marginBottom: 16,
        background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.04))',
        border: '1px solid rgba(16,185,129,0.15)',
        padding: 24,
    },
    statsRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: 30,
        marginTop: 16,
        paddingTop: 12,
        borderTop: '1px solid rgba(255,255,255,0.06)',
    },
    miniStat: { display: 'flex', alignItems: 'center', gap: 6 },
    filterRow: {
        display: 'flex', gap: 6, overflowX: 'auto',
        paddingBottom: 4, marginBottom: 16,
    },
    redeemCard: {
        minWidth: 110, display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center', padding: 16,
        cursor: 'pointer',
    },
};
