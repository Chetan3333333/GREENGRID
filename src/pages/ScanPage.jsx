import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Apple, Cpu, Recycle, CheckCircle, ArrowRight, Loader2, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = [
    { id: 'food', label: 'Food / Organic', icon: Apple, color: '#10b981' },
    { id: 'electronics', label: 'Electronics', icon: Cpu, color: '#3b82f6' },
    { id: 'recyclable', label: 'Recyclable', icon: Recycle, color: '#f59e0b' },
];

const results = {
    food: {
        title: 'Fresh Vegetables Detected',
        status: 'Edible – Safe for Donation',
        action: 'Connect to nearest NGO',
        icon: '🥬',
        coins: '+150',
        color: '#10b981',
        detail: 'These vegetables are fresh and suitable for immediate distribution. We found 3 NGOs within 5km.',
    },
    electronics: {
        title: 'Smartphone (Working)',
        status: 'Functional – Suitable for Resale',
        action: 'List on Verified Marketplace',
        icon: '📱',
        coins: '+200',
        color: '#3b82f6',
        detail: 'This device is in working condition with minor wear. Estimated resale value: ₹3,500.',
    },
    recyclable: {
        title: 'PET Plastic Bottles',
        status: 'Recyclable – Grade A Material',
        action: 'Route to Recycling Center',
        icon: '🧴',
        coins: '+80',
        color: '#f59e0b',
        detail: 'High-grade PET plastic detected. 2 certified recycling centers are available nearby.',
    },
};

export default function ScanPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState('upload'); // upload | category | analyzing | result
    const [selectedCat, setSelectedCat] = useState(null);
    const [hasImage, setHasImage] = useState(false);

    const handleUpload = () => {
        setHasImage(true);
    };

    const handleAnalyze = () => {
        setStep('analyzing');
        setTimeout(() => setStep('result'), 2500);
    };

    const reset = () => {
        setStep('upload');
        setSelectedCat(null);
        setHasImage(false);
    };

    const result = results[selectedCat];

    return (
        <div className="page-container">
            <AnimatePresence mode="wait">
                {step === 'upload' && (
                    <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <h2 style={s.pageTitle}>Scan Your Resource</h2>
                        <p style={s.pageDesc}>Let AI evaluate the best action for your item</p>

                        <div className="upload-zone" onClick={handleUpload} style={{ marginTop: 20, marginBottom: 20 }}>
                            {hasImage ? (
                                <div style={s.previewBox}>
                                    <div style={s.previewPlaceholder}>
                                        <CheckCircle size={40} color="#10b981" />
                                        <p style={{ color: '#10b981', fontWeight: 600, marginTop: 8 }}>Image Selected</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={s.uploadIcon}>
                                        <Camera size={32} color="#10b981" />
                                    </div>
                                    <p style={{ fontWeight: 600, color: '#cbd5e1' }}>Take a Photo or Upload</p>
                                    <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Tap to capture or browse files</p>
                                    <div style={s.uploadBtns}>
                                        <button className="btn btn-sm btn-secondary"><Camera size={14} /> Camera</button>
                                        <button className="btn btn-sm btn-secondary"><Upload size={14} /> Gallery</button>
                                    </div>
                                </>
                            )}
                        </div>

                        {hasImage && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <p style={{ fontWeight: 600, marginBottom: 10 }}>Select Category</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {categories.map((cat) => (
                                        <motion.div
                                            key={cat.id}
                                            className="list-item"
                                            style={{
                                                cursor: 'pointer',
                                                borderColor: selectedCat === cat.id ? cat.color : undefined,
                                                background: selectedCat === cat.id ? `${cat.color}12` : undefined,
                                            }}
                                            onClick={() => setSelectedCat(cat.id)}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="icon-circle-sm" style={{ background: `${cat.color}18` }}>
                                                <cat.icon size={18} color={cat.color} />
                                            </div>
                                            <span style={{ flex: 1, fontWeight: 500 }}>{cat.label}</span>
                                            {selectedCat === cat.id && <CheckCircle size={18} color={cat.color} />}
                                        </motion.div>
                                    ))}
                                </div>

                                {selectedCat && (
                                    <motion.button
                                        className="btn btn-primary btn-lg"
                                        style={{ width: '100%', marginTop: 18 }}
                                        onClick={handleAnalyze}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <Sparkles size={18} /> Analyze with AI
                                    </motion.button>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {step === 'analyzing' && (
                    <motion.div
                        key="analyzing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={s.analyzingWrap}
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                            style={s.spinnerWrap}
                        >
                            <Loader2 size={48} color="#10b981" />
                        </motion.div>
                        <h3 style={{ fontWeight: 700, marginTop: 20 }}>AI is Analyzing...</h3>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 6 }}>Evaluating safety, usability & impact</p>
                        <div className="progress-bar" style={{ width: '80%', marginTop: 24 }}>
                            <motion.div
                                className="progress-fill"
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 2.2 }}
                            />
                        </div>
                    </motion.div>
                )}

                {step === 'result' && result && (
                    <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 style={s.pageTitle}>AI Decision</h2>
                            <button className="btn btn-sm btn-secondary" onClick={reset}><X size={14} /> New Scan</button>
                        </div>

                        <div className="card" style={{ textAlign: 'center', padding: 28 }}>
                            <span style={{ fontSize: '3rem' }}>{result.icon}</span>
                            <h3 style={{ fontWeight: 700, marginTop: 12, fontSize: '1.1rem' }}>{result.title}</h3>
                            <div className="badge badge-green" style={{ marginTop: 10 }}>
                                <CheckCircle size={12} /> {result.status}
                            </div>
                            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 14, lineHeight: 1.5 }}>{result.detail}</p>
                        </div>

                        <div className="card" style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: `${result.color}0a`, borderColor: `${result.color}30` }}>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Recommended Action</p>
                                <p style={{ fontSize: '0.82rem', color: result.color, marginTop: 2 }}>{result.action}</p>
                            </div>
                            <ArrowRight size={20} color={result.color} />
                        </div>

                        <div className="card" style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                🪙
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Reward Earned</p>
                                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>GreenCoins will be credited</p>
                            </div>
                            <span className="badge badge-gold">{result.coins}</span>
                        </div>

                        <button
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: 18 }}
                            onClick={() => navigate(selectedCat === 'food' ? '/food' : selectedCat === 'electronics' ? '/electronics' : '/recyclables')}
                        >
                            Proceed <ArrowRight size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const s = {
    pageTitle: { fontSize: '1.4rem', fontWeight: 800 },
    pageDesc: { fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 },
    uploadIcon: {
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'rgba(16,185,129,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    uploadBtns: { display: 'flex', gap: 10, marginTop: 8 },
    previewBox: { width: '100%', display: 'flex', justifyContent: 'center' },
    previewPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 16,
        background: 'rgba(16,185,129,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    analyzingWrap: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
    },
    spinnerWrap: { display: 'flex' },
};
