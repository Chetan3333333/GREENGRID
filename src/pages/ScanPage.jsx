import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, Upload, Apple, Cpu, Recycle, CheckCircle, ArrowRight,
    Loader2, Sparkles, X, AlertTriangle, TrendingUp, Shield, Gavel
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = [
    { id: 'food', label: 'Food / Organic', icon: Apple, color: '#10b981' },
    { id: 'electronics', label: 'Electronics / E-Waste', icon: Cpu, color: '#3b82f6' },
    { id: 'recyclable', label: 'Recyclable Material', icon: Recycle, color: '#f59e0b' },
];

const evaluations = {
    food: {
        title: 'Fresh Vegetables Detected',
        condition: 'Good — Edible',
        hazard: 'None',
        recoveryValue: null,
        route: 'donate',
        routeLabel: 'Donate to NGO',
        icon: '🥬',
        coins: '+150',
        color: '#10b981',
        detail: 'These vegetables are fresh and suitable for immediate distribution. We found 3 NGOs within 5km that accept food donations.',
        conditionPct: 85,
    },
    electronics: {
        title: 'Smartphone (Non-functional)',
        condition: 'Damaged — Non-repairable',
        hazard: 'Low (Li-ion battery)',
        recoveryValue: '₹350 – ₹580',
        route: 'bidding',
        routeLabel: 'Post to Material Exchange',
        icon: '📱',
        coins: '+200',
        color: '#3b82f6',
        detail: 'This device has a damaged motherboard but contains recoverable materials: copper, gold trace, lithium. Certified recyclers can extract value.',
        conditionPct: 25,
        materials: [
            { name: 'Copper', weight: '12g', value: '₹85' },
            { name: 'Gold (trace)', weight: '0.3g', value: '₹180' },
            { name: 'Lithium', weight: '8g', value: '₹65' },
            { name: 'Plastic (ABS)', weight: '45g', value: '₹15' },
        ],
    },
    recyclable: {
        title: 'PET Plastic Bottles (Grade A)',
        condition: 'Recyclable — High Grade',
        hazard: 'None',
        recoveryValue: '₹120 – ₹200',
        route: 'bidding',
        routeLabel: 'Post to Material Exchange',
        icon: '🧴',
        coins: '+80',
        color: '#f59e0b',
        detail: 'High-grade PET plastic detected. This material is in demand by certified recyclers for pellet manufacturing.',
        conditionPct: 90,
        materials: [
            { name: 'PET Plastic', weight: '2.5kg', value: '₹150' },
            { name: 'Label residue', weight: '50g', value: '₹5' },
        ],
    },
};

const analyzeSteps = [
    'Scanning material composition...',
    'Evaluating condition & hazard level...',
    'Calculating recoverable value...',
    'Finding certified recyclers...',
];

export default function ScanPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState('upload');
    const [selectedCat, setSelectedCat] = useState(null);
    const [hasImage, setHasImage] = useState(false);
    const [analyzeStep, setAnalyzeStep] = useState(0);

    const handleUpload = () => setHasImage(true);

    const handleAnalyze = () => {
        setStep('analyzing');
        setAnalyzeStep(0);
        const interval = setInterval(() => {
            setAnalyzeStep(prev => {
                if (prev >= 3) { clearInterval(interval); return prev; }
                return prev + 1;
            });
        }, 700);
        setTimeout(() => { clearInterval(interval); setStep('result'); }, 3200);
    };

    const reset = () => { setStep('upload'); setSelectedCat(null); setHasImage(false); };

    const result = evaluations[selectedCat];

    return (
        <div className="page-container">
            <AnimatePresence mode="wait">
                {/* UPLOAD STEP */}
                {step === 'upload' && (
                    <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <h2 style={s.pageTitle}>AI Material Evaluator</h2>
                        <p style={s.pageDesc}>Upload a resource for AI condition & value assessment</p>

                        <div className="upload-zone" onClick={handleUpload} style={{ marginTop: 20, marginBottom: 20 }}>
                            {hasImage ? (
                                <div style={s.previewBox}>
                                    <div style={s.previewPlaceholder}>
                                        <CheckCircle size={40} color="#10b981" />
                                        <p style={{ color: '#10b981', fontWeight: 600, marginTop: 8 }}>Image Captured</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={s.uploadIcon}>
                                        <Camera size={32} color="#10b981" />
                                    </div>
                                    <p style={{ fontWeight: 600, color: '#cbd5e1' }}>Scan Your Material</p>
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
                                <p style={{ fontWeight: 600, marginBottom: 10 }}>Material Category</p>
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
                                        <Sparkles size={18} /> Evaluate with AI
                                    </motion.button>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* ANALYZING STEP */}
                {step === 'analyzing' && (
                    <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={s.analyzingWrap}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                            style={s.spinnerWrap}
                        >
                            <Loader2 size={48} color="#10b981" />
                        </motion.div>
                        <h3 style={{ fontWeight: 700, marginTop: 20 }}>AI Evaluating Material...</h3>
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, width: '80%' }}>
                            {analyzeSteps.map((text, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0.3 }}
                                    animate={{ opacity: analyzeStep >= i ? 1 : 0.3 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}
                                >
                                    {analyzeStep >= i ? (
                                        <CheckCircle size={14} color="#10b981" />
                                    ) : (
                                        <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #334155' }} />
                                    )}
                                    <span style={{ color: analyzeStep >= i ? '#cbd5e1' : '#475569' }}>{text}</span>
                                </motion.div>
                            ))}
                        </div>
                        <div className="progress-bar" style={{ width: '80%', marginTop: 20 }}>
                            <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2.8 }} />
                        </div>
                    </motion.div>
                )}

                {/* RESULT STEP */}
                {step === 'result' && result && (
                    <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 style={s.pageTitle}>AI Evaluation Report</h2>
                            <button className="btn btn-sm btn-secondary" onClick={reset}><X size={14} /> New Scan</button>
                        </div>

                        {/* Main Result Card */}
                        <div className="card" style={{ textAlign: 'center', padding: 28 }}>
                            <span style={{ fontSize: '3rem' }}>{result.icon}</span>
                            <h3 style={{ fontWeight: 700, marginTop: 12, fontSize: '1.1rem' }}>{result.title}</h3>
                            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 8, lineHeight: 1.5 }}>{result.detail}</p>
                        </div>

                        {/* Evaluation Metrics */}
                        <div className="grid-2" style={{ marginTop: 12 }}>
                            <div className="card card-sm">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <Shield size={14} color="#10b981" />
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Condition</span>
                                </div>
                                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{result.condition}</p>
                                <div className="progress-bar" style={{ marginTop: 8 }}>
                                    <motion.div
                                        className="progress-fill"
                                        style={{ background: result.conditionPct > 60 ? '#10b981' : result.conditionPct > 30 ? '#f59e0b' : '#ef4444' }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${result.conditionPct}%` }}
                                        transition={{ duration: 1, delay: 0.3 }}
                                    />
                                </div>
                            </div>
                            <div className="card card-sm">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <AlertTriangle size={14} color={result.hazard === 'None' ? '#10b981' : '#f59e0b'} />
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Hazard Level</span>
                                </div>
                                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{result.hazard}</p>
                            </div>
                        </div>

                        {/* Recovery Value */}
                        {result.recoveryValue && (
                            <motion.div
                                className="card"
                                style={{ marginTop: 12, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <TrendingUp size={18} color="#3b82f6" />
                                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Estimated Recovery Value</span>
                                    </div>
                                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#60a5fa' }}>{result.recoveryValue}</span>
                                </div>
                                {result.materials && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {result.materials.map((mat, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '6px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                                <span style={{ color: '#94a3b8' }}>{mat.name}</span>
                                                <div style={{ display: 'flex', gap: 16 }}>
                                                    <span style={{ color: '#64748b' }}>{mat.weight}</span>
                                                    <span style={{ color: '#60a5fa', fontWeight: 600 }}>{mat.value}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Intelligent Routing Decision */}
                        <motion.div
                            className="card"
                            style={{
                                marginTop: 12,
                                background: result.route === 'bidding' ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.06)',
                                border: `1px solid ${result.route === 'bidding' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`,
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <Sparkles size={16} color={result.route === 'bidding' ? '#f59e0b' : '#10b981'} />
                                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Routing Decision</span>
                            </div>
                            {result.route === 'bidding' ? (
                                <p style={{ fontSize: '0.82rem', color: '#fbbf24', lineHeight: 1.5 }}>
                                    ♻️ <strong>Non-reusable material detected.</strong> Activating Recycling Marketplace — certified recyclers will bid for recovery value.
                                </p>
                            ) : (
                                <p style={{ fontSize: '0.82rem', color: '#34d399', lineHeight: 1.5 }}>
                                    ✅ <strong>Reusable material detected.</strong> Routing to donation pathway — connect with nearby NGOs for immediate impact.
                                </p>
                            )}
                        </motion.div>

                        {/* Reward */}
                        <div className="card card-sm" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🪙</div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>GreenCoins Reward</p>
                                <p style={{ fontSize: '0.72rem', color: '#64748b' }}>Earned for responsible disposal</p>
                            </div>
                            <span className="badge badge-gold">{result.coins}</span>
                        </div>

                        {/* Action Button */}
                        <button
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: 18 }}
                            onClick={() => {
                                if (result.route === 'bidding') navigate('/bidding');
                                else if (selectedCat === 'food') navigate('/food');
                                else if (selectedCat === 'electronics') navigate('/electronics');
                                else navigate('/recyclables');
                            }}
                        >
                            {result.route === 'bidding' ? (
                                <><Gavel size={16} /> {result.routeLabel}</>
                            ) : (
                                <><ArrowRight size={16} /> {result.routeLabel}</>
                            )}
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
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(16,185,129,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4,
    },
    uploadBtns: { display: 'flex', gap: 10, marginTop: 8 },
    previewBox: { width: '100%', display: 'flex', justifyContent: 'center' },
    previewPlaceholder: {
        width: 120, height: 120, borderRadius: 16,
        background: 'rgba(16,185,129,0.08)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    },
    analyzingWrap: {
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', minHeight: '60vh',
    },
    spinnerWrap: { display: 'flex' },
};
