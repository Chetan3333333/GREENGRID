import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Heart, Recycle, Gavel, Coins, Loader2, Filter,
    ArrowLeft, ChevronRight, Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserTransactions, getUserDonations } from '../services/database';
import { useNavigate } from 'react-router-dom';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: d, duration: 0.4 },
});

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

export default function ActivityPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('all');
    const [transactions, setTransactions] = useState([]);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        setLoading(true);
        Promise.all([
            getUserTransactions(currentUser.uid),
            getUserDonations(currentUser.uid),
        ]).then(([txs, dons]) => {
            setTransactions(txs);
            setDonations(dons);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [currentUser]);

    // Merge & sort all activity
    const allActivity = [
        ...transactions.map(tx => ({
            id: tx.id,
            type: 'transaction',
            subType: tx.type,
            title: tx.reason,
            emoji: tx.emoji || '🪙',
            coins: tx.coins,
            createdAt: tx.createdAt,
            category: tx.reason?.includes('Bid accepted') ? 'bid' : tx.reason?.includes('donated') || tx.reason?.includes('delivered') ? 'donation' : tx.reason?.includes('Scanned') ? 'recycling' : 'other',
        })),
        ...donations.map(don => ({
            id: don.id,
            type: 'donation',
            subType: don.status,
            title: `${don.foodType || 'Food'} → ${don.ngoName}`,
            emoji: '🍎',
            coins: don.status === 'delivered' ? 150 : 0,
            createdAt: don.createdAt,
            category: 'donation',
            status: don.status,
            quantity: don.quantity,
        })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const filtered = tab === 'all' ? allActivity
        : allActivity.filter(a => a.category === tab);

    // Stats
    const totalDonations = donations.length;
    const pendingDonations = donations.filter(d => d.status !== 'delivered').length;
    const completedDonations = donations.filter(d => d.status === 'delivered').length;
    const bidCount = transactions.filter(t => t.reason?.includes('Bid accepted')).length;
    const recycleCount = transactions.filter(t => t.reason?.includes('Scanned')).length;

    return (
        <div className="page-container">
            <motion.div {...fadeUp(0)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>My Activity</h2>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>All your donations, recycling, and deals</p>
                    </div>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <motion.div {...fadeUp(0.1)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 16 }}>
                {[
                    { val: totalDonations, label: 'Donations', color: '#ec4899', emoji: '❤️' },
                    { val: bidCount, label: 'Bid Deals', color: '#3b82f6', emoji: '⚡' },
                    { val: recycleCount, label: 'Recycled', color: '#10b981', emoji: '♻️' },
                ].map((stat, i) => (
                    <div key={i} className="card card-sm" style={{ textAlign: 'center', padding: 14 }}>
                        <p style={{ fontSize: '1rem' }}>{stat.emoji}</p>
                        <p style={{ fontWeight: 800, fontSize: '1.15rem', color: stat.color }}>{stat.val}</p>
                        <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>{stat.label}</p>
                    </div>
                ))}
            </motion.div>

            {/* Pending Alert */}
            {pendingDonations > 0 && (
                <motion.div {...fadeUp(0.15)} className="card card-sm" style={{ marginTop: 12, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.2rem' }}>🕐</span>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f59e0b' }}>{pendingDonations} Pending Donation{pendingDonations > 1 ? 's' : ''}</p>
                        <p style={{ fontSize: '0.7rem', color: '#64748b' }}>+{pendingDonations * 150} GreenCoins awaiting delivery</p>
                    </div>
                    <button className="btn btn-sm btn-secondary" style={{ fontSize: '0.7rem' }} onClick={() => navigate('/food')}>
                        Track
                    </button>
                </motion.div>
            )}

            {/* Filter Tabs */}
            <motion.div {...fadeUp(0.2)} style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginTop: 16, marginBottom: 14 }}>
                {[
                    { id: 'all', label: 'All' },
                    { id: 'donation', label: '❤️ Donations' },
                    { id: 'bid', label: '⚡ Bids' },
                    { id: 'recycling', label: '♻️ Recycling' },
                    { id: 'other', label: '🪙 Other' },
                ].map(t => (
                    <button key={t.id} className={`tab-pill ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
                ))}
            </motion.div>

            {/* Activity List */}
            <motion.div {...fadeUp(0.25)}>
                <div className="section-header">
                    <span className="section-title">Activity Log</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{filtered.length} items</span>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                        <p style={{ marginTop: 8, fontSize: '0.85rem' }}>Loading activity...</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                        <p style={{ fontSize: '1.5rem', marginBottom: 8 }}>📋</p>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>No activity yet</p>
                        <p style={{ fontSize: '0.78rem', marginTop: 4 }}>Start scanning, donating, or trading to build your history!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {filtered.map((item, i) => (
                            <motion.div
                                key={`${item.type}-${item.id}`}
                                className="list-item"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                            >
                                <span style={{ fontSize: '1.4rem' }}>{item.emoji}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 500, fontSize: '0.82rem' }}>{item.title}</p>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
                                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{timeAgo(item.createdAt)}</span>
                                        {item.type === 'donation' && (
                                            <span className={`badge ${item.status === 'delivered' ? 'badge-green' : 'badge-gold'}`} style={{ fontSize: '0.55rem' }}>
                                                {item.status === 'delivered' ? '✅ Delivered' : `🕐 ${item.status}`}
                                            </span>
                                        )}
                                        {item.category === 'bid' && <span className="badge badge-blue" style={{ fontSize: '0.55rem' }}>⚡ Bid</span>}
                                        {item.category === 'recycling' && <span className="badge badge-green" style={{ fontSize: '0.55rem' }}>♻️ Scan</span>}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    {item.coins > 0 ? (
                                        <span style={{ fontWeight: 700, fontSize: '0.82rem', color: item.subType === 'spend' ? '#f59e0b' : '#34d399' }}>
                                            {item.subType === 'spend' ? '-' : '+'}{item.coins} 🪙
                                        </span>
                                    ) : item.type === 'donation' && item.status !== 'delivered' ? (
                                        <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 600 }}>+150 pending</span>
                                    ) : null}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
