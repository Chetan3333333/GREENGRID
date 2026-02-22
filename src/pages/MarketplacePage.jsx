import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag, Search, Coins, Star, Leaf, Gavel,
    TrendingUp, Shield, Package, ChevronRight, Timer
} from 'lucide-react';

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

const exchangeListings = [
    { item: '📱 Smartphone (E-Waste)', bids: 5, highest: '₹550', time: '18 min', seller: 'Rahul M.' },
    { item: '🧴 PET Plastic 3kg', bids: 3, highest: '₹190', time: '42 min', seller: 'Priya S.' },
    { item: '💻 Laptop Motherboard', bids: 7, highest: '₹1,200', time: '8 min', seller: 'Ankit K.' },
    { item: '🥫 Aluminium Cans 5kg', bids: 4, highest: '₹320', time: '55 min', seller: 'Neha R.' },
    { item: '📦 Cardboard Bales 10kg', bids: 2, highest: '₹180', time: '1h 20m', seller: 'Vikram P.' },
];

export default function MarketplacePage() {
    const [tab, setTab] = useState('exchange');
    const [selectedCat, setSelectedCat] = useState('All');
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

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

            {/* Material Exchange Tab */}
            {tab === 'exchange' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Stat Banner */}
                    <div className="card card-sm" style={{ marginBottom: 14, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                            {[
                                { val: '23', label: 'Active Listings' },
                                { val: '87', label: 'Bids Today' },
                                { val: '₹12.4K', label: 'Recovered Today' },
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {exchangeListings.map((listing, i) => (
                            <motion.div
                                key={i}
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
                                        <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{listing.item}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{listing.bids} bids</span>
                                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>by {listing.seller}</span>
                                            <span style={{ fontSize: '0.7rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <Timer size={10} /> {listing.time}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 800, color: '#10b981', fontSize: '1rem' }}>{listing.highest}</p>
                                        <p style={{ fontSize: '0.6rem', color: '#64748b' }}>highest bid</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 16 }} onClick={() => navigate('/scan')}>
                        <Package size={16} /> List Your Material
                    </button>
                </motion.div>
            )}

            {/* Eco Shop Tab */}
            {tab === 'shop' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Balance Banner */}
                    <div className="card card-sm" style={s.balanceBanner}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Coins size={18} color="#f59e0b" />
                            <span style={{ fontWeight: 700, color: '#fbbf24' }}>2,450</span>
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
