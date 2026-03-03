import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag, Search, Coins, Star, Leaf, Gavel,
    TrendingUp, Shield, Package, ChevronRight, Timer, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { listenToItems } from '../services/database';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: d, duration: 0.4 },
});

const cats = ['All', 'Electronics', 'Garden', 'Eco Products', 'Compost'];

const products = [
    { name: 'Refurbished Phone', price: 450, rating: 4.5, cat: 'Electronics', emoji: '📱', tag: 'Hot Deal' },
    { name: 'Organic Compost', price: 80, rating: 4.8, cat: 'Compost', emoji: '🌱', tag: 'Popular' },
    { name: 'Bamboo Cutlery Set', price: 120, rating: 4.7, cat: 'Eco Products', emoji: '🍴', tag: 'New' },
    { name: 'Solar Power Bank', price: 350, rating: 4.6, cat: 'Electronics', emoji: '🔋', tag: null },
    { name: 'Herb Growing Kit', price: 150, rating: 4.9, cat: 'Garden', emoji: '🌿', tag: 'Best Seller' },
    { name: 'Recycled Notebook', price: 45, rating: 4.3, cat: 'Eco Products', emoji: '📓', tag: null },
    { name: 'Refurbished Tablet', price: 600, rating: 4.4, cat: 'Electronics', emoji: '💻', tag: null },
    { name: 'Organic Seeds Pack', price: 65, rating: 4.7, cat: 'Garden', emoji: '🌰', tag: 'New' },
];

function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function MarketplacePage() {
    const [tab, setTab] = useState('exchange');
    const [selectedCat, setSelectedCat] = useState('All');
    const [search, setSearch] = useState('');
    const [liveItems, setLiveItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { userProfile } = useAuth();

    const greenCoins = userProfile?.greenCoins ?? 0;

    // Listen for real-time items from the database
    useEffect(() => {
        setLoading(true);
        const unsubscribe = listenToItems((items) => {
            setLiveItems(items);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const filtered = products.filter(p => {
        if (selectedCat !== 'All' && p.cat !== selectedCat) return false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="page-container">
            <motion.div {...fadeUp(0)}>
                <h2 style={s.title}>Circular Material Exchange</h2>
                <p style={s.desc}>Trade, bid, and shop in the circular economy</p>
            </motion.div>

            {/* Tab Switcher */}
            <motion.div {...fadeUp(0.05)} style={s.tabRow}>
                <button
                    className={`tab-pill ${tab === 'exchange' ? 'active' : ''}`}
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setTab('exchange')}
                >
                    <Gavel size={14} /> Material Exchange
                </button>
                <button
                    className={`tab-pill ${tab === 'shop' ? 'active' : ''}`}
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setTab('shop')}
                >
                    <ShoppingBag size={14} /> Eco Shop
                </button>
            </motion.div>

            {/* Material Exchange Tab — NOW WITH REAL DATA */}
            {tab === 'exchange' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Stat Banner */}
                    <div className="card card-sm" style={{ marginBottom: 14, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                            {[
                                { val: String(liveItems.length), label: 'Total Listings' },
                                { val: String(liveItems.filter(i => i.status === 'scanned').length), label: 'New Scans' },
                                { val: String(liveItems.filter(i => i.aiAnalysis?.route === 'bidding').length), label: 'For Bidding' },
                            ].map((stat, i) => (
                                <div key={i}>
                                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fbbf24' }}>{stat.val}</span>
                                    <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live Listings */}
                    <div className="section-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="section-title">Live Listings</span>
                            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                            <p style={{ marginTop: 8, fontSize: '0.85rem' }}>Loading listings...</p>
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : liveItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                            <p style={{ fontSize: '2rem', marginBottom: 8 }}>📦</p>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No listings yet</p>
                            <p style={{ fontSize: '0.78rem', marginTop: 4 }}>Scan an item to create the first listing!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {liveItems.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    className="card card-sm"
                                    style={{ cursor: 'pointer' }}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => navigate('/bidding')}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                                                {item.aiAnalysis?.icon || '📦'} {item.title}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                                                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                    {item.category || 'general'}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    padding: '2px 6px',
                                                    borderRadius: 4,
                                                    background: item.status === 'scanned' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                                    color: item.status === 'scanned' ? '#10b981' : '#f59e0b',
                                                }}>
                                                    {item.status}
                                                </span>
                                                <span style={{ fontSize: '0.7rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                    <Timer size={10} /> {timeAgo(item.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            {item.aiAnalysis?.recoveryValue && (
                                                <p style={{ fontWeight: 800, color: '#10b981', fontSize: '0.9rem' }}>
                                                    {item.aiAnalysis.recoveryValue}
                                                </p>
                                            )}
                                            <p style={{ fontSize: '0.6rem', color: '#64748b' }}>
                                                {item.aiAnalysis?.route === 'bidding' ? 'for bidding' : 'for donation'}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 16 }} onClick={() => navigate('/scan')}>
                        <Package size={16} /> List Your Material
                    </button>
                </motion.div>
            )}

            {/* Eco Shop Tab — Static products (will connect later) */}
            {tab === 'shop' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Balance Banner */}
                    <div className="card card-sm" style={s.balanceBanner}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Coins size={18} color="#f59e0b" />
                            <span style={{ fontWeight: 700, color: '#fbbf24' }}>{greenCoins.toLocaleString()}</span>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>GreenCoins available</span>
                        </div>
                    </div>

                    {/* Search */}
                    <div style={s.searchWrap}>
                        <Search size={16} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Search eco products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={s.searchInput}
                        />
                    </div>

                    {/* Category Pills */}
                    <div style={s.catScroll}>
                        {cats.map((cat) => (
                            <button
                                key={cat}
                                className={`tab-pill ${selectedCat === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCat(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Products Grid */}
                    <div className="section-header">
                        <span className="section-title">{filtered.length} Products</span>
                    </div>
                    <div className="grid-2">
                        {filtered.map((p, i) => (
                            <motion.div
                                key={i}
                                className="product-card"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                whileTap={{ scale: 0.97 }}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="product-image">
                                    <span style={{ fontSize: '2.5rem' }}>{p.emoji}</span>
                                </div>
                                <div className="product-info">
                                    {p.tag && (
                                        <span className="badge badge-green" style={{ marginBottom: 6, fontSize: '0.6rem' }}>{p.tag}</span>
                                    )}
                                    <p style={{ fontWeight: 600, fontSize: '0.82rem', lineHeight: 1.3 }}>{p.name}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Coins size={13} color="#f59e0b" />
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fbbf24' }}>{p.price}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Star size={11} color="#f59e0b" fill="#f59e0b" />
                                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{p.rating}</span>
                                        </div>
                                    </div>
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
    title: { fontSize: '1.4rem', fontWeight: 800 },
    desc: { fontSize: '0.85rem', color: '#94a3b8', marginTop: 4, marginBottom: 12 },
    tabRow: { display: 'flex', gap: 8, marginBottom: 16 },
    balanceBanner: {
        marginBottom: 14,
        background: 'rgba(245,158,11,0.06)',
        border: '1px solid rgba(245,158,11,0.15)',
    },
    searchWrap: {
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
        borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: 12,
    },
    searchInput: {
        flex: 1, background: 'none', border: 'none', outline: 'none',
        color: '#f1f5f9', fontSize: '0.85rem', fontFamily: 'inherit',
    },
    catScroll: {
        display: 'flex', gap: 6, overflowX: 'auto',
        paddingBottom: 4, marginBottom: 16,
    },
};
