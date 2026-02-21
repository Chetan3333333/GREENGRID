import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, SlidersHorizontal, Coins, Star, Leaf } from 'lucide-react';

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

export default function MarketplacePage() {
    const [selectedCat, setSelectedCat] = useState('All');
    const [search, setSearch] = useState('');

    const filtered = products.filter(p => {
        if (selectedCat !== 'All' && p.cat !== selectedCat) return false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="page-container">
            <motion.div {...fadeUp(0)}>
                <h2 style={s.title}>Eco Marketplace</h2>
                <p style={s.desc}>Spend your GreenCoins on sustainable products</p>
            </motion.div>

            {/* Balance Banner */}
            <motion.div {...fadeUp(0.05)} className="card card-sm" style={s.balanceBanner}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Coins size={18} color="#f59e0b" />
                    <span style={{ fontWeight: 700, color: '#fbbf24' }}>2,450</span>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>GreenCoins available</span>
                </div>
            </motion.div>

            {/* Search */}
            <motion.div {...fadeUp(0.1)} style={s.searchWrap}>
                <Search size={16} color="#64748b" />
                <input
                    type="text"
                    placeholder="Search eco products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={s.searchInput}
                />
            </motion.div>

            {/* Category Pills */}
            <motion.div {...fadeUp(0.15)} style={s.catScroll}>
                {cats.map((cat) => (
                    <button
                        key={cat}
                        className={`tab-pill ${selectedCat === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCat(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </motion.div>

            {/* Products Grid */}
            <motion.div {...fadeUp(0.2)}>
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
        </div>
    );
}

const s = {
    title: { fontSize: '1.4rem', fontWeight: 800 },
    desc: { fontSize: '0.85rem', color: '#94a3b8', marginTop: 4, marginBottom: 12 },
    balanceBanner: {
        marginBottom: 14,
        background: 'rgba(245,158,11,0.06)',
        border: '1px solid rgba(245,158,11,0.15)',
    },
    searchWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        background: 'none',
        border: 'none',
        outline: 'none',
        color: '#f1f5f9',
        fontSize: '0.85rem',
        fontFamily: 'inherit',
    },
    catScroll: {
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        paddingBottom: 4,
        marginBottom: 16,
    },
};
