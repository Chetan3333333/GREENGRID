import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, Upload, Apple, Cpu, Recycle, CheckCircle, ArrowRight,
    Loader2, Sparkles, X, AlertTriangle, TrendingUp, Shield, Gavel, Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from '../contexts/AuthContext';
import { saveItem } from '../services/database';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

const categories = [
    { id: 'food', label: 'Food / Organic', icon: Apple, color: '#10b981' },
    { id: 'electronics', label: 'Electronics / E-Waste', icon: Cpu, color: '#3b82f6' },
    { id: 'recyclable', label: 'Recyclable Material', icon: Recycle, color: '#f59e0b' },
];

const analyzeSteps = [
    'Scanning material composition...',
    'Evaluating condition & hazard level...',
    'Calculating recoverable value...',
    'Finding certified recyclers...',
];

export default function ScanPage() {
    const navigate = useNavigate();
    const { currentUser, fetchUserProfile } = useAuth();
    const [step, setStep] = useState('upload'); // upload, analyzing, result
    const [selectedCat, setSelectedCat] = useState(null);
    const [hasImage, setHasImage] = useState(false);
    const [analyzeStep, setAnalyzeStep] = useState(0);
    const [aiResult, setAiResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [savedItem, setSavedItem] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Camera state
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [capturedImageUrl, setCapturedImageUrl] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    // Stop camera stream safely
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    // Auto-cleanup on unmount
    useEffect(() => {
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access the camera. Please ensure you have granted permissions.");
            setIsCameraOpen(false);
        }
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);
            const imageUrl = canvasRef.current.toDataURL('image/jpeg');

            setCapturedImageUrl(imageUrl);
            setHasImage(true);
            stopCamera();
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Read file as base64 for the API
            const reader = new FileReader();
            reader.onloadend = () => {
                setCapturedImageUrl(reader.result);
                setHasImage(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!capturedImageUrl) return;

        setStep('analyzing');
        setAnalyzeStep(0);
        setErrorMsg('');

        // Start fake progress while API is calling
        const interval = setInterval(() => {
            setAnalyzeStep(prev => {
                if (prev >= 3) return prev;
                return prev + 1;
            });
        }, 1500);

        try {
            // 1. Prepare Image for Gemini
            // Remove the data:image/jpeg;base64, prefix
            const base64Data = capturedImageUrl.split(',')[1];

            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg"
                },
            };

            // 2. Prepare the AI Prompt
            const prompt = `You are an expert waste sorting and recycling AI for GreenGrid. 
            Analyze the attached image and return ONLY a valid JSON object with the following structure exactly. Do not use markdown backticks around the json.
            {
                "title": "Short descriptive title of what is, e.g. 'Broken Smartphone' or 'Fresh Bananas'",
                "condition": "Condition state, e.g. 'Damaged - Non-repairable' or 'Good - Edible'",
                "hazard": "Hazard level, e.g. 'None' or 'Low (Li-ion battery)'",
                "recoveryValue": "Estimated price in rupees, e.g. '₹350 – ₹580' or null if none",
                "route": "Must be exactly 'donate' or 'bidding'. Use donate for fresh food, bidding for electronics/plastics/scrap",
                "routeLabel": "Action button text, e.g. 'Post to Material Exchange' or 'Donate to NGO'",
                "icon": "One single emoji representing it, e.g. '📱' or '🥬'",
                "coins": "GreenCoins reward like '+200'",
                "color": "Hex color code to use. Use #3b82f6 for electronics, #10b981 for food, #f59e0b for recyclable plastics",
                "detail": "2-3 sentences explaining exactly what this is and why it was routed this way.",
                "conditionPct": Number from 0 to 100 representing condition (0=destroyed, 100=perfect),
                "materials": [Array of objects like {"name": "Copper", "weight": "12g", "value": "₹85"}. Can be null for food.]
            }`;

            // 3. Call the Gemini API
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent([prompt, imagePart]);
            const responseText = result.response.text();

            // Clean up the response if it has backticks
            let cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedResult = JSON.parse(cleanJson);

            clearInterval(interval);
            setAnalyzeStep(4);
            setAiResult(parsedResult);

            // Save item to database
            if (currentUser) {
                setIsSaving(true);
                try {
                    const saved = await saveItem(currentUser.uid, {
                        ...parsedResult,
                        category: selectedCat,
                    });
                    setSavedItem(saved);
                    // Refresh user profile to get updated coins
                    await fetchUserProfile(currentUser.uid);
                } catch (saveErr) {
                    console.error('Failed to save item:', saveErr);
                }
                setIsSaving(false);
            }

            // Short delay to show 100% completion before switching cards
            setTimeout(() => {
                setStep('result');
            }, 600);

        } catch (error) {
            console.error("AI Analysis Failed:", error);
            clearInterval(interval);
            setErrorMsg('AI Analysis failed. Please check your API key or try another image.');
            setStep('upload');
        }
    };

    const reset = () => {
        setStep('upload');
        setSelectedCat(null);
        setHasImage(false);
        setCapturedImageUrl(null);
        setAiResult(null);
        setErrorMsg('');
        setSavedItem(null);
        setIsSaving(false);
    };

    return (
        <div className="page-container">
            <AnimatePresence mode="wait">
                {/* UPLOAD & CAMERA STEP */}
                {step === 'upload' && (
                    <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <h2 style={s.pageTitle}>AI Material Evaluator</h2>
                        <p style={s.pageDesc}>Scan or upload a required material for value assessment</p>

                        {errorMsg && (
                            <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, color: '#f87171', fontSize: '0.85rem', marginTop: 16 }}>
                                {errorMsg}
                            </div>
                        )}

                        {!isCameraOpen && !hasImage && (
                            <div className="upload-zone" style={{ marginTop: 20, marginBottom: 20 }}>
                                <div style={s.uploadIcon}>
                                    <Camera size={32} color="#10b981" />
                                </div>
                                <p style={{ fontWeight: 600, color: '#cbd5e1' }}>Scan Your Material</p>
                                <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 12 }}>Tap camera to live scan, or upload an image</p>
                                <div style={s.uploadBtns}>
                                    <button className="btn btn-sm btn-primary" onClick={startCamera}>
                                        <Camera size={16} /> Open Camera
                                    </button>
                                    <button className="btn btn-sm btn-secondary" onClick={() => fileInputRef.current?.click()}>
                                        <Upload size={16} /> Gallery
                                    </button>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileUpload}
                                    />
                                </div>
                            </div>
                        )}

                        {isCameraOpen && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={s.cameraContainer}>
                                <video ref={videoRef} autoPlay playsInline style={s.videoStyle} />
                                <canvas ref={canvasRef} style={{ display: 'none' }} />
                                <div style={s.cameraControls}>
                                    <button className="btn btn-secondary" onClick={stopCamera}>Cancel</button>
                                    <button className="btn btn-primary" onClick={captureImage} style={s.captureBtn}>
                                        <Camera size={20} /> Capture
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {hasImage && !isCameraOpen && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <div style={s.previewContainer}>
                                    <img src={capturedImageUrl} alt="Scanned Material" style={s.previewImage} />
                                    <button className="btn btn-sm btn-secondary" style={s.retakeBtn} onClick={reset}>
                                        <X size={14} /> Retake
                                    </button>
                                </div>

                                <p style={{ fontWeight: 600, marginBottom: 10, marginTop: 20 }}>Select Category to Analyze</p>
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
                                        style={{ width: '100%', marginTop: 24 }}
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
                        <div style={s.analyzingImageWrap}>
                            <img src={capturedImageUrl} alt="Analyzing" style={s.analyzingImage} />
                            <motion.div
                                style={s.scannerLine}
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            />
                        </div>
                        <h3 style={{ fontWeight: 700, marginTop: 24 }}>AI Evaluating Material...</h3>
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                            {analyzeSteps.map((text, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0.3 }}
                                    animate={{ opacity: analyzeStep >= i ? 1 : 0.3 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}
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
                    </motion.div>
                )}

                {/* RESULT STEP */}
                {step === 'result' && aiResult && (
                    <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 style={s.pageTitle}>AI Evaluation Report</h2>
                            <button className="btn btn-sm btn-secondary" onClick={reset}><X size={14} /> New Scan</button>
                        </div>

                        {/* Main Result Card */}
                        <div className="card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
                            <div style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                                <img src={capturedImageUrl} alt="Scanned" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: aiResult.color }}>{aiResult.icon} {aiResult.title}</h3>
                                <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 6, lineHeight: 1.4 }}>{aiResult.detail}</p>
                            </div>
                        </div>

                        {/* Evaluation Metrics */}
                        <div className="grid-2" style={{ marginTop: 12 }}>
                            <div className="card card-sm">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <Shield size={14} color="#10b981" />
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Condition</span>
                                </div>
                                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{aiResult.condition}</p>
                                <div className="progress-bar" style={{ marginTop: 8 }}>
                                    <motion.div
                                        className="progress-fill"
                                        style={{ background: aiResult.conditionPct > 60 ? '#10b981' : aiResult.conditionPct > 30 ? '#f59e0b' : '#ef4444' }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${aiResult.conditionPct}%` }}
                                        transition={{ duration: 1, delay: 0.3 }}
                                    />
                                </div>
                            </div>
                            <div className="card card-sm">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <AlertTriangle size={14} color={aiResult.hazard === 'None' ? '#10b981' : '#f59e0b'} />
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Hazard Level</span>
                                </div>
                                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{aiResult.hazard}</p>
                            </div>
                        </div>

                        {/* Recovery Value */}
                        {aiResult.recoveryValue && (
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
                                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#60a5fa' }}>{aiResult.recoveryValue}</span>
                                </div>
                                {aiResult.materials && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {aiResult.materials.map((mat, i) => (
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
                                background: aiResult.route === 'bidding' ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.06)',
                                border: `1px solid ${aiResult.route === 'bidding' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`,
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <Sparkles size={16} color={aiResult.route === 'bidding' ? '#f59e0b' : '#10b981'} />
                                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Routing Decision</span>
                            </div>
                            {aiResult.route === 'bidding' ? (
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
                                <p style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                    {savedItem ? '✅ Saved & credited to your wallet!' : isSaving ? 'Saving to your wallet...' : 'Earned for responsible disposal'}
                                </p>
                            </div>
                            <span className="badge badge-gold">{aiResult.coins}</span>
                        </div>

                        {/* Action Button */}
                        <button
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: 20 }}
                            onClick={() => {
                                if (aiResult.route === 'bidding') navigate('/bidding');
                                else if (selectedCat === 'food') navigate('/food');
                                else if (selectedCat === 'electronics') navigate('/electronics');
                                else navigate('/recyclables');
                            }}
                        >
                            {aiResult.route === 'bidding' ? (
                                <><Gavel size={16} /> {aiResult.routeLabel}</>
                            ) : (
                                <><ArrowRight size={16} /> {aiResult.routeLabel}</>
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
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    uploadBtns: { display: 'flex', gap: 10, marginTop: 8 },

    // Camera Styles
    cameraContainer: {
        width: '100%',
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
        background: '#000',
        position: 'relative',
    },
    videoStyle: {
        width: '100%',
        height: 'auto',
        aspectRatio: '4/3',
        objectFit: 'cover',
        display: 'block',
    },
    cameraControls: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
        paddingHorizontal: 20,
    },
    captureBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 24px',
        background: '#10b981',
        fontWeight: 600,
        borderRadius: 999,
        border: 'none',
        color: '#fff',
        cursor: 'pointer'
    },

    // Preview Styles
    previewContainer: {
        width: '100%',
        height: 240,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid rgba(255,255,255,0.1)'
    },
    previewImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    retakeBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
        background: 'rgba(15,23,38,0.8)',
        backdropFilter: 'blur(4px)'
    },

    // Analyzing View
    analyzingWrap: {
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', minHeight: '60vh',
    },
    analyzingImageWrap: {
        width: 140,
        height: 140,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        border: '2px solid rgba(16,185,129,0.4)'
    },
    analyzingImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: 0.8
    },
    scannerLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 3,
        background: '#10b981',
        boxShadow: '0 0 10px #10b981'
    }
};

