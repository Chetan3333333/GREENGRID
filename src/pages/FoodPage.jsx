import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Apple, Heart, Sprout, MapPin, ChevronRight, Phone, Clock, Truck, CheckCircle,
    Loader2, Camera, ArrowLeft, ArrowRight, Star, Copy, Share2, Home, RotateCcw,
    Upload, X, Leaf, Package, UtensilsCrossed, Egg, Sparkles, Zap, BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addTransaction, updateUserStats, saveDonation, getUserDonations, updateDonationStatus } from '../services/database';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ZeroWasteChef from '../components/ZeroWasteChef';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: d, duration: 0.4 },
});

// ── Data ──
const foodTypes = [
    { id: 'cooked', label: 'Cooked Meals', emoji: '🍱', desc: 'Rice, curry, rotis, etc.' },
    { id: 'raw', label: 'Raw Groceries', emoji: '🥕', desc: 'Vegetables, pulses, grains' },
    { id: 'packaged', label: 'Packaged Food', emoji: '📦', desc: 'Sealed items with expiry' },
    { id: 'fruits', label: 'Fruits & Veggies', emoji: '🍎', desc: 'Fresh produce' },
];

const dietaryTags = ['Vegetarian', 'Non-Veg', 'Vegan', 'Contains Nuts', 'Gluten-Free', 'Needs Refrigeration', 'No Preservatives'];

const ngos = [
    { name: 'Akshaya Patra Foundation', dist: '2.3 km', accepts: ['cooked', 'raw'], phone: '+91-9876543210', timing: '8am - 8pm', rating: 4.8, reviews: 342, need: 'high', served: '1.2M+', desc: 'Mid-day meal program for school children' },
    { name: 'Robin Hood Army', dist: '3.8 km', accepts: ['cooked', 'fruits'], phone: '+91-9123456789', timing: '9am - 6pm', rating: 4.7, reviews: 218, need: 'medium', served: '50K+', desc: 'Volunteer-driven surplus food distribution' },
    { name: 'Feeding India', dist: '5.1 km', accepts: ['packaged', 'raw', 'fruits'], phone: '+91-9988776655', timing: '7am - 9pm', rating: 4.9, reviews: 567, need: 'high', served: '800K+', desc: 'Zero hunger mission across India' },
    { name: 'Goonj Foundation', dist: '6.5 km', accepts: ['raw', 'packaged'], phone: '+91-8877665544', timing: '10am - 5pm', rating: 4.6, reviews: 189, need: 'low', served: '300K+', desc: 'Rural food aid and material support' },
    { name: 'No Food Waste', dist: '1.8 km', accepts: ['cooked', 'fruits', 'raw'], phone: '+91-7766554433', timing: '6am - 10pm', rating: 4.5, reviews: 145, need: 'high', served: '200K+', desc: 'Immediate surplus food rescue network' },
];

const timeSlots = [
    { label: 'Today 10 AM – 12 PM', value: 'today_10_12' },
    { label: 'Today 2 PM – 4 PM', value: 'today_14_16' },
    { label: 'Today 5 PM – 7 PM', value: 'today_17_19' },
    { label: 'Tomorrow 8 AM – 10 AM', value: 'tmrw_08_10' },
    { label: 'Tomorrow 11 AM – 1 PM', value: 'tmrw_11_13' },
    { label: 'Tomorrow 3 PM – 5 PM', value: 'tmrw_15_17' },
];

const trackingStages = [
    { key: 'submitted', label: 'Submitted', emoji: '📋', msg: 'Donation request submitted' },
    { key: 'ngo_notified', label: 'NGO Notified', emoji: '🔔', msg: 'NGO has been notified' },
    { key: 'pickup_scheduled', label: 'Pickup Scheduled', emoji: '🚗', msg: 'Volunteer assigned for pickup' },
    { key: 'collected', label: 'Collected', emoji: '📦', msg: 'Food collected from your location' },
    { key: 'delivered', label: 'Delivered', emoji: '✅', msg: 'Delivered to NGO successfully' },
];

const compostOptions = [
    { name: 'Community Garden Program', desc: 'Donate compost to local gardens', icon: Sprout, color: '#10b981' },
    { name: 'Urban Farm Network', desc: 'Sell to urban farmers', icon: Truck, color: '#f59e0b' },
    { name: 'Home Composting Kit', desc: 'Start composting at home', icon: Apple, color: '#34d399' },
];

// ── Component ──
export default function FoodPage() {
    const [tab, setTab] = useState('edible');
    const { currentUser, fetchUserProfile } = useAuth();
    const navigate = useNavigate();

    // Wizard state
    const [step, setStep] = useState(0); // 0 = landing, 1-6 = steps
    const [loading, setLoading] = useState(false);
    const [myDonations, setMyDonations] = useState([]);
    const [donationsLoading, setDonationsLoading] = useState(false);
    const [lastDonationId, setLastDonationId] = useState(null);

    // AI state
    const [aiAnalyzing, setAiAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [aiError, setAiError] = useState('');
    const [recipeMode, setRecipeMode] = useState(false);
    const [recipeResult, setRecipeResult] = useState(null);
    const [recipeLoading, setRecipeLoading] = useState(false);
    const [recipePhoto, setRecipePhoto] = useState(null);
    const recipeFileRef = useRef(null);

    // Step 1 — Food details
    const [foodType, setFoodType] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [quantityUnit, setQuantityUnit] = useState('servings');
    const [expiry, setExpiry] = useState('today');
    const [photoPreview, setPhotoPreview] = useState(null);
    const [tags, setTags] = useState([]);
    const fileRef = useRef(null);

    // Step 2 — NGO
    const [selectedNgo, setSelectedNgo] = useState(null);

    // Step 3 — Pickup
    const [pickupMode, setPickupMode] = useState('pickup');
    const [address, setAddress] = useState('');
    const [timeSlot, setTimeSlot] = useState(null);

    // Step 5 — Tracking
    const [trackIdx, setTrackIdx] = useState(0);

    // Load donations when on My Donations tab
    useEffect(() => {
        if (tab !== 'mydonations' || !currentUser) return;
        setDonationsLoading(true);
        getUserDonations(currentUser.uid).then(d => { setMyDonations(d); setDonationsLoading(false); }).catch(() => setDonationsLoading(false));
    }, [tab, currentUser]);

    // Simulate tracking progression
    useEffect(() => {
        if (step !== 5) return;
        const timers = [2000, 4000, 6000, 8000];
        const ids = timers.map((ms, i) =>
            setTimeout(() => setTrackIdx(i + 1), ms)
        );
        const final = setTimeout(() => handleDeliveryComplete(), 10000);
        return () => { ids.forEach(clearTimeout); clearTimeout(final); };
    }, [step]);

    // Filter NGOs by selected food type
    const filteredNgos = foodType
        ? ngos.filter(n => n.accepts.includes(foodType))
        : ngos;

    const ngoData = selectedNgo !== null ? filteredNgos[selectedNgo] : null;

    // Photo handler — triggers AI analysis
    function handlePhoto(e) {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPhotoPreview(ev.target.result);
                analyzeWithAI(ev.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    function toggleTag(tag) {
        setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    }

    // AI Photo Analysis — auto-fills form fields
    async function analyzeWithAI(imageBase64) {
        setAiAnalyzing(true);
        setAiError('');
        setAiResult(null);
        try {
            const base64Data = imageBase64.split(',')[1];
            const imagePart = { inlineData: { data: base64Data, mimeType: 'image/jpeg' } };
            const prompt = `You are an AI food analyzer for a food donation app. Analyze this food image and return ONLY a valid JSON object (no markdown backticks). Be accurate and practical.
            {
                "foodType": "cooked" or "raw" or "packaged" or "fruits" (pick the best match),
                "itemsDetected": ["Rice", "Dal", "Sabzi"] (list of food items you can see),
                "estimatedServings": 8 (number, your best estimate of how many people this can feed),
                "estimatedWeight": "2.5 kg" (rough weight estimate),
                "freshness": "Prepared today" or "Yesterday" or "Expires in 2 days" or "Expires in a week" (pick best match based on appearance),
                "freshnessNote": "Food looks freshly prepared with visible steam" (1 sentence explaining your freshness assessment),
                "dietaryTags": ["Vegetarian"] (pick from: Vegetarian, Non-Veg, Vegan, Contains Nuts, Gluten-Free, Needs Refrigeration, No Preservatives),
                "safeForDonation": true or false,
                "safetyNote": "This food appears fresh and safe for donation" (1 sentence)
            }`;
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const result = await model.generateContent([prompt, imagePart]);
            const text = result.response.text();
            const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(clean);
            setAiResult(parsed);
            // Auto-fill form fields
            if (parsed.foodType) setFoodType(parsed.foodType);
            if (parsed.estimatedServings) { setQuantity(parsed.estimatedServings); setQuantityUnit('servings'); }
            if (parsed.freshness) setExpiry(parsed.freshness);
            if (parsed.dietaryTags?.length) setTags(parsed.dietaryTags);
        } catch (err) {
            console.error('AI analysis failed:', err);
            setAiError('AI analysis failed. Please fill in manually.');
        }
        setAiAnalyzing(false);
    }

    // AI Recipe Suggestion
    async function getRecipeSuggestions(imageBase64) {
        setRecipeLoading(true);
        setRecipeResult(null);
        try {
            const base64Data = imageBase64.split(',')[1];
            const imagePart = { inlineData: { data: base64Data, mimeType: 'image/jpeg' } };
            const prompt = `You are a helpful chef AI. Look at this food image and suggest 3 quick recipes to use it before it goes to waste. Return ONLY a valid JSON array (no markdown backticks):
            [
                { "name": "Banana Bread", "emoji": "\ud83c\udf5e", "time": "30 min", "difficulty": "Easy", "ingredients": "flour, sugar, eggs", "steps": "1. Mash bananas. 2. Mix ingredients. 3. Bake at 180°C for 30 mins." },
                { "name": "Smoothie", "emoji": "\ud83e\udd64", "time": "5 min", "difficulty": "Easy", "ingredients": "milk, honey, ice", "steps": "1. Blend all ingredients. 2. Serve cold." },
                { "name": "Pancakes", "emoji": "\ud83e\udd5e", "time": "15 min", "difficulty": "Easy", "ingredients": "flour, milk, butter", "steps": "1. Mix batter. 2. Cook on pan. 3. Serve with syrup." }
            ]`;
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const result = await model.generateContent([prompt, imagePart]);
            const text = result.response.text();
            const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
            setRecipeResult(JSON.parse(clean));
        } catch (err) {
            console.error('Recipe AI failed:', err);
            setRecipeResult([{ name: 'Could not analyze', emoji: '❓', time: '-', difficulty: '-', ingredients: '-', steps: 'Please try again with a clearer photo.' }]);
        }
        setRecipeLoading(false);
    }

    function handleRecipePhoto(e) {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setRecipePhoto(ev.target.result);
                getRecipeSuggestions(ev.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    // Smart NGO scoring
    function getNgoScore(ngo) {
        let score = 0;
        if (ngo.need === 'high') score += 40;
        else if (ngo.need === 'medium') score += 20;
        else score += 5;
        score += ngo.rating * 8;
        const dist = parseFloat(ngo.dist);
        score += Math.max(0, 30 - dist * 5);
        if (foodType && ngo.accepts.includes(foodType)) score += 15;
        return Math.round(score);
    }

    // After tracking completes — award coins
    async function handleDeliveryComplete() {
        if (!currentUser) { setStep(6); return; }
        try {
            await addTransaction(currentUser.uid, {
                type: 'earn', coins: 150,
                reason: `Food delivered to ${ngoData?.name}`,
                emoji: '🍎',
            });
            await updateUserStats(currentUser.uid, { greenCoins: 150, donations: 1, co2Reduced: 2 });
            if (lastDonationId) await updateDonationStatus(lastDonationId, 'delivered');
            await fetchUserProfile(currentUser.uid);
        } catch (err) { console.error(err); }
        setStep(6);
    }

    // Submit donation — save but DON'T award coins yet
    async function handleConfirm() {
        if (!currentUser) return;
        setLoading(true);
        try {
            const result = await saveDonation(currentUser.uid, {
                foodType,
                quantity: `${quantity} ${quantityUnit}`,
                expiry,
                photoURL: photoPreview,
                notes: tags,
                ngoName: ngoData?.name || '',
                pickupMode,
                address,
                timeSlot: timeSlots.find(t => t.value === timeSlot)?.label || '',
            });
            setLastDonationId(result.id);
            setStep(5);
            setTrackIdx(0);
        } catch (err) { console.error(err); }
        setLoading(false);
    }

    function resetAll() {
        setStep(0); setFoodType(null); setQuantity(1); setQuantityUnit('servings');
        setExpiry('today'); setPhotoPreview(null); setTags([]); setSelectedNgo(null);
        setPickupMode('pickup'); setAddress(''); setTimeSlot(null); setTrackIdx(0);
    }

    const foodLabel = foodTypes.find(f => f.id === foodType)?.label || '';
    const foodEmoji = foodTypes.find(f => f.id === foodType)?.emoji || '🍎';

    // ═══════════════════════════════════════════
    // STEP 5 — Live Tracking
    // ═══════════════════════════════════════════
    if (step === 5) return (
        <div className="page-container">
            <motion.div {...fadeUp(0)}>
                <h2 style={s.title}>Tracking Donation</h2>
                <p style={s.desc}>Your food is on its way to {ngoData?.name}</p>
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {trackingStages.map((stage, i) => {
                        const done = i <= trackIdx;
                        const current = i === trackIdx;
                        return (
                            <div key={stage.key} style={{ display: 'flex', gap: 14, minHeight: i < trackingStages.length - 1 ? 70 : 'auto' }}>
                                {/* Vertical line + dot */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32 }}>
                                    <motion.div
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        transition={{ delay: i * 0.15, type: 'spring' }}
                                        style={{
                                            width: 32, height: 32, borderRadius: '50%',
                                            background: done ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.06)',
                                            border: done ? 'none' : '2px solid rgba(255,255,255,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.9rem', position: 'relative',
                                        }}
                                    >
                                        {done ? stage.emoji : <span style={{ color: '#475569', fontSize: '0.7rem' }}>{i + 1}</span>}
                                        {current && (
                                            <motion.div
                                                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                                style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '2px solid #10b981' }}
                                            />
                                        )}
                                    </motion.div>
                                    {i < trackingStages.length - 1 && (
                                        <div style={{ width: 2, flex: 1, background: done ? '#10b981' : 'rgba(255,255,255,0.06)', transition: 'background 0.5s' }} />
                                    )}
                                </div>
                                {/* Label */}
                                <div style={{ paddingTop: 4 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.88rem', color: done ? '#f1f5f9' : '#64748b' }}>{stage.label}</p>
                                    <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                                        {done ? stage.msg : 'Pending...'}
                                    </p>
                                    {done && <p style={{ fontSize: '0.6rem', color: '#475569', marginTop: 2 }}>
                                        {new Date(Date.now() - (trackingStages.length - i) * 120000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            <motion.div {...fadeUp(0.2)} className="card card-sm" style={{ marginTop: 16, textAlign: 'center', padding: 20 }}>
                <Loader2 size={20} color="#10b981" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                <p style={{ fontSize: '0.82rem', fontWeight: 600, marginTop: 8 }}>Processing donation...</p>
                <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>Reward will be credited once delivered</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </motion.div>
        </div>
    );

    // ═══════════════════════════════════════════
    // STEP 6 — Completion & Reward
    // ═══════════════════════════════════════════
    if (step === 6) {
        const impactServings = quantity * (quantityUnit === 'kg' ? 4 : quantityUnit === 'packets' ? 2 : 1);
        const shareText = `🍎 I just donated ${quantity} ${quantityUnit} of food to ${ngoData?.name} through GreenGrid! Fed ~${impactServings} people and earned 150 GreenCoins 🪙 #GreenGrid #ZeroHunger`;

        return (
            <div className="page-container">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
                    {/* Success Circle */}
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        style={s.successCircle}
                    >
                        <CheckCircle size={48} color="#10b981" />
                    </motion.div>

                    <motion.h2 {...fadeUp(0.3)} style={{ fontWeight: 800, fontSize: '1.5rem', marginTop: 20 }}>
                        Donation Complete! 🎉
                    </motion.h2>
                    <motion.p {...fadeUp(0.4)} style={{ color: '#94a3b8', marginTop: 8, fontSize: '0.9rem' }}>
                        Your food has been delivered to {ngoData?.name}
                    </motion.p>
                </motion.div>

                {/* Impact Card */}
                <motion.div {...fadeUp(0.5)} className="card" style={{ marginTop: 24, textAlign: 'center' }}>
                    <p style={{ fontSize: '2.5rem', marginBottom: 8 }}>🍽️</p>
                    <p style={{ fontWeight: 800, fontSize: '1.3rem' }}>You helped feed ~{impactServings} people today!</p>
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 6 }}>Every meal counts towards a hunger-free world</p>

                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {[
                            { val: '+150', label: 'GreenCoins', color: '#10b981', emoji: '🪙' },
                            { val: '2.3 kg', label: 'CO₂ Saved', color: '#3b82f6', emoji: '🌍' },
                            { val: `${impactServings}`, label: 'People Fed', color: '#f59e0b', emoji: '🍽️' },
                        ].map((stat, i) => (
                            <motion.div key={i} {...fadeUp(0.6 + i * 0.1)}>
                                <p style={{ fontSize: '1.2rem' }}>{stat.emoji}</p>
                                <p style={{ fontWeight: 800, fontSize: '1.1rem', color: stat.color }}>{stat.val}</p>
                                <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Share Button */}
                <motion.div {...fadeUp(0.8)} style={{ marginTop: 16 }}>
                    <button
                        className="btn btn-sm"
                        style={{ width: '100%', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}
                        onClick={() => { navigator.clipboard.writeText(shareText); }}
                    >
                        <Share2 size={14} /> Share Impact (Copy to Clipboard)
                    </button>
                </motion.div>

                {/* Action Buttons */}
                <motion.div {...fadeUp(0.9)} style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={resetAll}>
                        <RotateCcw size={14} /> Donate Again
                    </button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/home')}>
                        <Home size={14} /> Home
                    </button>
                </motion.div>
            </div>
        );
    }

    // ═══════════════════════════════════════════
    // MAIN PAGE — Landing + Steps 1-4
    // ═══════════════════════════════════════════
    return (
        <div className="page-container">
            <motion.div {...fadeUp(0)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    {step > 0 && (
                        <button onClick={() => setStep(s => s - 1)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}>
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div>
                        <h2 style={s.title}>Food & Organic Resources</h2>
                        <p style={s.desc}>
                            {step === 0 ? 'AI-guided decisions for consumable and organic items' :
                                `Step ${step} of 4 — ${['', 'Food Details', 'Choose NGO', 'Schedule Pickup', 'Review & Confirm'][step]}`}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Progress Bar (Steps 1-4) */}
            {step > 0 && step <= 4 && (
                <motion.div {...fadeUp(0.05)} style={s.progressBar}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? '#10b981' : 'rgba(255,255,255,0.06)', transition: 'background 0.3s' }} />
                    ))}
                </motion.div>
            )}

            {/* ── STEP 0: Landing ── */}
            {step === 0 && (
                <>
                    {/* AI Banner */}
                    <motion.div {...fadeUp(0.1)} className="card" style={s.banner}>
                        <div style={s.bannerIcon}>🧠</div>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Decision Engine</p>
                            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                                Items are evaluated for freshness, edibility & safety before routing
                            </p>
                        </div>
                    </motion.div>

                    {/* Tabs */}
                    <motion.div {...fadeUp(0.15)} className="tab-pills" style={{ marginBottom: 18 }}>
                        <button className={`tab-pill ${tab === 'edible' ? 'active' : ''}`} onClick={() => setTab('edible')}>🍎 Edible Food</button>
                        <button className={`tab-pill ${tab === 'compost' ? 'active' : ''}`} onClick={() => setTab('compost')}>🌱 Compost</button>
                        <button className={`tab-pill ${tab === 'mydonations' ? 'active' : ''}`} onClick={() => setTab('mydonations')}>📋 My Donations</button>
                    </motion.div>

                    {tab === 'edible' ? (
                        <>
                            {/* Start Donation CTA */}
                            <motion.div {...fadeUp(0.2)} className="card" style={{ textAlign: 'center', padding: 28, background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.04))', border: '1px solid rgba(16,185,129,0.2)' }}>
                                <span style={{ fontSize: '3rem' }}>🍎</span>
                                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: 12 }}>Donate Food & Earn Rewards</h3>
                                <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 8, lineHeight: 1.5 }}>
                                    Fill in food details, choose an NGO, schedule pickup, and track your donation in real-time
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
                                    {[
                                        { val: '+150', label: 'GreenCoins', emoji: '🪙' },
                                        { val: '5 NGOs', label: 'Partners', emoji: '🏢' },
                                        { val: '~2 kg', label: 'CO₂ Saved', emoji: '🌍' },
                                    ].map((s, i) => (
                                        <div key={i} style={{ textAlign: 'center' }}>
                                            <p style={{ fontSize: '1rem' }}>{s.emoji}</p>
                                            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10b981' }}>{s.val}</p>
                                            <p style={{ fontSize: '0.6rem', color: '#64748b' }}>{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={() => setStep(1)}>
                                    Start Donation <ArrowRight size={16} />
                                </button>
                            </motion.div>

                            {/* How it works */}
                            <motion.div {...fadeUp(0.3)} style={{ marginTop: 16 }}>
                                <div className="section-header"><span className="section-title">How It Works</span></div>
                                <div className="card card-sm" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {[
                                        { step: '1', text: 'Describe your food items & upload photo', color: '#3b82f6' },
                                        { step: '2', text: 'Choose a verified NGO partner', color: '#10b981' },
                                        { step: '3', text: 'Schedule pickup or drop-off', color: '#f59e0b' },
                                        { step: '4', text: 'Confirm & track in real-time', color: '#ef4444' },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${item.color}18`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>{item.step}</div>
                                            <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                            {/* Zero Waste Chef */}
                            {currentUser && <ZeroWasteChef userId={currentUser.uid} onDonate={() => setStep(1)} />}
                        </>
                    ) : tab === 'compost' ? (
                        /* Compost Tab — unchanged */
                        <motion.div {...fadeUp(0.2)}>
                            <div className="section-header"><span className="section-title">Composting Options</span></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {compostOptions.map((opt, i) => (
                                    <motion.div key={i} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} whileTap={{ scale: 0.98 }}>
                                        <div className="icon-circle" style={{ background: `${opt.color}15` }}>
                                            <opt.icon size={22} color={opt.color} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{opt.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{opt.desc}</p>
                                        </div>
                                        <ChevronRight size={16} color="#475569" />
                                    </motion.div>
                                ))}
                            </div>
                            <div className="card" style={{ marginTop: 16, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: '1.5rem' }}>♻️</span>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Compost Impact</p>
                                        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>Composting reduces methane emissions and enriches soil</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* My Donations Tab */
                        <motion.div {...fadeUp(0.2)}>
                            <div className="section-header">
                                <span className="section-title">Your Donations</span>
                                <span className="badge badge-green">{myDonations.length} total</span>
                            </div>

                            {donationsLoading ? (
                                <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                                    <p style={{ marginTop: 8, fontSize: '0.85rem' }}>Loading donations...</p>
                                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                </div>
                            ) : myDonations.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                                    <p style={{ fontSize: '2rem', marginBottom: 8 }}>🍎</p>
                                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>No donations yet</p>
                                    <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>Start donating to see your history here!</p>
                                    <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => { setTab('edible'); setStep(1); }}>
                                        Start First Donation <ArrowRight size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {/* Active / Pending */}
                                    {myDonations.filter(d => d.status !== 'delivered').length > 0 && (
                                        <>
                                            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f59e0b', marginBottom: 2 }}>🔔 Active / Pending</p>
                                            {myDonations.filter(d => d.status !== 'delivered').map((don) => (
                                                <motion.div key={don.id} className="card card-sm" style={{ borderLeftWidth: 3, borderLeftColor: '#f59e0b' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <span style={{ fontSize: '1.5rem' }}>{foodTypes.find(f => f.id === don.foodType)?.emoji || '🍎'}</span>
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{foodTypes.find(f => f.id === don.foodType)?.label || don.foodType}</p>
                                                            <p style={{ fontSize: '0.72rem', color: '#64748b' }}>{don.quantity} · {don.ngoName}</p>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <span className="badge badge-gold" style={{ fontSize: '0.6rem' }}>
                                                                {don.status === 'submitted' ? '📋 Submitted' : don.status === 'ngo_notified' ? '🔔 Notified' : don.status === 'pickup_scheduled' ? '🚗 Pickup' : don.status === 'collected' ? '📦 Collected' : don.status}
                                                            </span>
                                                            <p style={{ fontSize: '0.6rem', color: '#f59e0b', marginTop: 3 }}>🕐 +150 pending</p>
                                                        </div>
                                                    </div>
                                                    <p style={{ fontSize: '0.65rem', color: '#475569', marginTop: 6 }}>
                                                        {new Date(don.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        {don.pickupMode === 'pickup' ? ' · 🚗 Pickup' : ' · 📍 Drop-off'}
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </>
                                    )}

                                    {/* Completed */}
                                    {myDonations.filter(d => d.status === 'delivered').length > 0 && (
                                        <>
                                            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#10b981', marginTop: 8, marginBottom: 2 }}>✅ Completed</p>
                                            {myDonations.filter(d => d.status === 'delivered').map((don) => (
                                                <motion.div key={don.id} className="card card-sm" style={{ borderLeftWidth: 3, borderLeftColor: '#10b981', opacity: 0.85 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <span style={{ fontSize: '1.5rem' }}>{foodTypes.find(f => f.id === don.foodType)?.emoji || '🍎'}</span>
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{foodTypes.find(f => f.id === don.foodType)?.label || don.foodType}</p>
                                                            <p style={{ fontSize: '0.72rem', color: '#64748b' }}>{don.quantity} · {don.ngoName}</p>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>✅ Delivered</span>
                                                            <p style={{ fontSize: '0.6rem', color: '#10b981', marginTop: 3 }}>+150 🪙 earned</p>
                                                        </div>
                                                    </div>
                                                    <p style={{ fontSize: '0.65rem', color: '#475569', marginTop: 6 }}>
                                                        {new Date(don.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </>
            )}

            {/* ── STEP 1: Food Details ── */}
            {step === 1 && (
                <motion.div {...fadeUp(0.1)}>
                    {/* Food Type */}
                    <div className="section-header"><span className="section-title">What are you donating?</span></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {foodTypes.map(ft => (
                            <motion.div
                                key={ft.id}
                                className="card card-sm"
                                style={{ textAlign: 'center', cursor: 'pointer', padding: 16, borderColor: foodType === ft.id ? '#10b981' : undefined, background: foodType === ft.id ? 'rgba(16,185,129,0.08)' : undefined }}
                                onClick={() => setFoodType(ft.id)}
                                whileTap={{ scale: 0.96 }}
                            >
                                <p style={{ fontSize: '1.8rem' }}>{ft.emoji}</p>
                                <p style={{ fontWeight: 600, fontSize: '0.82rem', marginTop: 6 }}>{ft.label}</p>
                                <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>{ft.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quantity */}
                    <div className="section-header" style={{ marginTop: 20 }}><span className="section-title">How much?</span></div>
                    <div className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: 36, padding: 0 }}>−</button>
                        <span style={{ fontWeight: 800, fontSize: '1.3rem', minWidth: 40, textAlign: 'center' }}>{quantity}</span>
                        <button className="btn btn-sm btn-secondary" onClick={() => setQuantity(q => q + 1)} style={{ width: 36, padding: 0 }}>+</button>
                        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                            {['servings', 'kg', 'packets'].map(u => (
                                <button key={u} className={`tab-pill ${quantityUnit === u ? 'active' : ''}`} onClick={() => setQuantityUnit(u)} style={{ fontSize: '0.7rem', padding: '4px 10px' }}>{u}</button>
                            ))}
                        </div>
                    </div>

                    {/* Freshness */}
                    <div className="section-header" style={{ marginTop: 20 }}><span className="section-title">Freshness</span></div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {['Prepared today', 'Yesterday', 'Expires in 2 days', 'Expires in a week'].map(opt => (
                            <button key={opt} className={`tab-pill ${expiry === opt ? 'active' : ''}`} onClick={() => setExpiry(opt)} style={{ fontSize: '0.72rem' }}>{opt}</button>
                        ))}
                    </div>

                    {/* Photo Upload + AI Auto-Fill */}
                    <div className="section-header" style={{ marginTop: 20 }}>
                        <span className="section-title">Photo (AI Auto-Fill)</span>
                        <span className="badge badge-blue" style={{ fontSize: '0.58rem' }}><Sparkles size={8} /> AI-Powered</span>
                    </div>
                    <input type="file" accept="image/*" capture="environment" ref={fileRef} onChange={handlePhoto} style={{ display: 'none' }} />
                    {photoPreview ? (
                        <div style={{ position: 'relative' }}>
                            <img src={photoPreview} alt="food" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }} />
                            <button onClick={() => { setPhotoPreview(null); setAiResult(null); setAiError(''); }} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <motion.div
                            className="card card-sm"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 28, cursor: 'pointer', border: '2px dashed rgba(255,255,255,0.1)' }}
                            onClick={() => fileRef.current?.click()}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Camera size={20} color="#64748b" />
                            <div style={{ textAlign: 'center' }}>
                                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Take photo for AI Auto-Fill</span>
                                <p style={{ fontSize: '0.65rem', color: '#475569', marginTop: 2 }}>AI will detect food type, quantity & freshness</p>
                            </div>
                        </motion.div>
                    )}

                    {/* AI Analysis Result */}
                    {aiAnalyzing && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card card-sm" style={{ marginTop: 10, textAlign: 'center', padding: 20, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                            <Loader2 size={20} color="#3b82f6" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                            <p style={{ fontSize: '0.82rem', fontWeight: 600, marginTop: 8, color: '#60a5fa' }}>AI is analyzing your food...</p>
                            <p style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 4 }}>Detecting items, quantity, and freshness</p>
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </motion.div>
                    )}
                    {aiError && (
                        <div className="card card-sm" style={{ marginTop: 10, padding: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                            <p style={{ fontSize: '0.78rem', color: '#f87171' }}>⚠️ {aiError}</p>
                        </div>
                    )}
                    {aiResult && !aiAnalyzing && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card card-sm" style={{ marginTop: 10, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', padding: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <Sparkles size={14} color="#10b981" />
                                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10b981' }}>AI Analysis Complete</span>
                                <span className="badge badge-green" style={{ marginLeft: 'auto', fontSize: '0.55rem' }}>
                                    {aiResult.safeForDonation ? '✅ Safe' : '⚠️ Caution'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                                {aiResult.itemsDetected?.map((item, i) => (
                                    <span key={i} className="badge badge-blue" style={{ fontSize: '0.6rem' }}>{item}</span>
                                ))}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.72rem' }}>
                                <div><span style={{ color: '#64748b' }}>Servings: </span><strong>{aiResult.estimatedServings}</strong></div>
                                <div><span style={{ color: '#64748b' }}>Weight: </span><strong>{aiResult.estimatedWeight}</strong></div>
                                <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#64748b' }}>Freshness: </span><strong>{aiResult.freshness}</strong></div>
                            </div>
                            <p style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 8, fontStyle: 'italic' }}>{aiResult.freshnessNote}</p>
                            <p style={{ fontSize: '0.6rem', color: '#475569', marginTop: 6 }}>✨ Form auto-filled! You can edit any field above.</p>
                        </motion.div>
                    )}

                    {/* Dietary Tags */}
                    <div className="section-header" style={{ marginTop: 20 }}><span className="section-title">Special Notes</span></div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {dietaryTags.map(tag => (
                            <button key={tag} className={`tab-pill ${tags.includes(tag) ? 'active' : ''}`} onClick={() => toggleTag(tag)} style={{ fontSize: '0.7rem' }}>{tag}</button>
                        ))}
                    </div>

                    {/* Next */}
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: 24 }} onClick={() => setStep(2)} disabled={!foodType}>
                        Next: Choose NGO <ArrowRight size={16} />
                    </button>
                </motion.div>
            )}

            {/* ── STEP 2: Choose NGO ── */}
            {step === 2 && (
                <motion.div {...fadeUp(0.1)}>
                    <div className="section-header">
                        <span className="section-title">Verified NGO Partners</span>
                        <span className="badge badge-green"><MapPin size={10} /> Nearby</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[...filteredNgos].sort((a, b) => getNgoScore(b) - getNgoScore(a)).map((ngo, i) => {
                            const score = getNgoScore(ngo);
                            const isBestMatch = i === 0;
                            return (
                                <motion.div
                                    key={i}
                                    className="card card-sm"
                                    style={{ cursor: 'pointer', borderColor: selectedNgo === filteredNgos.indexOf(ngo) ? '#10b981' : isBestMatch ? 'rgba(99,102,241,0.3)' : undefined, background: selectedNgo === filteredNgos.indexOf(ngo) ? 'rgba(16,185,129,0.06)' : isBestMatch ? 'rgba(99,102,241,0.04)' : undefined }}
                                    onClick={() => setSelectedNgo(filteredNgos.indexOf(ngo))}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isBestMatch && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, padding: '4px 10px', background: 'rgba(99,102,241,0.1)', borderRadius: 6, width: 'fit-content' }}>
                                            <Sparkles size={10} color="#a78bfa" />
                                            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#a78bfa' }}>⭐ AI Best Match</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                        <div style={s.ngoIcon}><Heart size={18} color="#10b981" /></div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ngo.name}</p>
                                            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 1 }}>{ngo.desc}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span className={`badge ${ngo.need === 'high' ? 'badge-gold' : ngo.need === 'medium' ? 'badge-blue' : 'badge-green'}`} style={{ fontSize: '0.6rem' }}>
                                                {ngo.need === 'high' ? '🔴 High Need' : ngo.need === 'medium' ? '🟡 Medium' : '🟢 Low'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, paddingLeft: 50, flexWrap: 'wrap' }}>
                                        <span style={s.ngoStat}><Star size={10} color="#f59e0b" fill="#f59e0b" /> {ngo.rating} ({ngo.reviews})</span>
                                        <span style={s.ngoStat}><MapPin size={10} /> {ngo.dist}</span>
                                        <span style={s.ngoStat}><Clock size={10} /> {ngo.timing}</span>
                                        <span style={s.ngoStat}><Heart size={10} color="#ef4444" /> {ngo.served} served</span>
                                    </div>
                                    {selectedNgo === filteredNgos.indexOf(ngo) && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingLeft: 50, marginTop: 8 }}>
                                            <span style={s.ngoStat}><Phone size={10} /> {ngo.phone}</span>
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={() => setStep(3)} disabled={selectedNgo === null}>
                        Next: Schedule Pickup <ArrowRight size={16} />
                    </button>
                </motion.div>
            )}

            {/* ── STEP 3: Schedule Pickup ── */}
            {step === 3 && (
                <motion.div {...fadeUp(0.1)}>
                    {/* Toggle */}
                    <div className="section-header"><span className="section-title">Collection Method</span></div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                        {[
                            { id: 'pickup', label: '🚗 Pickup at My Location', desc: 'Volunteer comes to you' },
                            { id: 'dropoff', label: '📍 Drop-off at Center', desc: 'You deliver to NGO' },
                        ].map(opt => (
                            <motion.div
                                key={opt.id}
                                className="card card-sm"
                                style={{ flex: 1, cursor: 'pointer', textAlign: 'center', padding: 16, borderColor: pickupMode === opt.id ? '#10b981' : undefined, background: pickupMode === opt.id ? 'rgba(16,185,129,0.08)' : undefined }}
                                onClick={() => setPickupMode(opt.id)}
                                whileTap={{ scale: 0.97 }}
                            >
                                <p style={{ fontSize: '1.2rem' }}>{opt.label.split(' ')[0]}</p>
                                <p style={{ fontWeight: 600, fontSize: '0.8rem', marginTop: 6 }}>{opt.label.slice(2)}</p>
                                <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>{opt.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {pickupMode === 'pickup' ? (
                        <>
                            {/* Address */}
                            <div className="section-header"><span className="section-title">Pickup Address</span></div>
                            <div className="card card-sm">
                                <textarea
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    placeholder="Enter your full address for pickup..."
                                    rows={3}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 12, color: '#f1f5f9', fontSize: '0.85rem', resize: 'none', fontFamily: 'inherit' }}
                                />
                            </div>

                            {/* Time Slots */}
                            <div className="section-header" style={{ marginTop: 16 }}><span className="section-title">Choose Time Slot</span></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {timeSlots.map(ts => (
                                    <motion.div
                                        key={ts.value}
                                        className="card card-sm"
                                        style={{ cursor: 'pointer', textAlign: 'center', padding: 12, borderColor: timeSlot === ts.value ? '#10b981' : undefined, background: timeSlot === ts.value ? 'rgba(16,185,129,0.08)' : undefined }}
                                        onClick={() => setTimeSlot(ts.value)}
                                        whileTap={{ scale: 0.96 }}
                                    >
                                        <Clock size={14} color={timeSlot === ts.value ? '#10b981' : '#64748b'} style={{ margin: '0 auto 4px' }} />
                                        <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>{ts.label}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    ) : (
                        /* Drop-off info */
                        <div className="card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                                <MapPin size={20} color="#10b981" />
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{ngoData?.name}</p>
                                    <p style={{ fontSize: '0.72rem', color: '#64748b' }}>{ngoData?.dist} away</p>
                                </div>
                            </div>
                            <div className="card card-sm" style={{ background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <MapPin size={14} color="#64748b" />
                                <p style={{ fontSize: '0.82rem', color: '#94a3b8', flex: 1 }}>
                                    Main Road, Near City Center, {ngoData?.dist}
                                </p>
                                <button
                                    className="btn btn-sm btn-secondary"
                                    style={{ fontSize: '0.7rem' }}
                                    onClick={() => navigator.clipboard.writeText(`${ngoData?.name} - Main Road, Near City Center`)}
                                >
                                    <Copy size={12} /> Copy
                                </button>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={12} /> Drop-off hours: {ngoData?.timing}
                            </p>
                        </div>
                    )}

                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: 20 }}
                        onClick={() => setStep(4)}
                        disabled={pickupMode === 'pickup' && (!address || !timeSlot)}
                    >
                        Next: Review & Confirm <ArrowRight size={16} />
                    </button>
                </motion.div>
            )}

            {/* ── STEP 4: Review & Confirm ── */}
            {step === 4 && (
                <motion.div {...fadeUp(0.1)}>
                    <div className="section-header"><span className="section-title">Review Your Donation</span></div>

                    <div className="card" style={{ padding: 20 }}>
                        {/* Food details */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            {photoPreview ? (
                                <img src={photoPreview} alt="food" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 12 }} />
                            ) : (
                                <div style={{ width: 60, height: 60, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>{foodEmoji}</div>
                            )}
                            <div>
                                <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{foodLabel}</p>
                                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>{quantity} {quantityUnit} · {expiry}</p>
                                {tags.length > 0 && (
                                    <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                                        {tags.map(t => <span key={t} className="badge badge-blue" style={{ fontSize: '0.55rem' }}>{t}</span>)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* NGO */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={s.ngoIcon}><Heart size={16} color="#10b981" /></div>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{ngoData?.name}</p>
                                <p style={{ fontSize: '0.72rem', color: '#64748b' }}>{ngoData?.dist} · ⭐ {ngoData?.rating}</p>
                            </div>
                        </div>

                        {/* Pickup details */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            {pickupMode === 'pickup' ? <Truck size={18} color="#3b82f6" /> : <MapPin size={18} color="#3b82f6" />}
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{pickupMode === 'pickup' ? 'Pickup' : 'Drop-off'}</p>
                                <p style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                    {pickupMode === 'pickup' ? `${timeSlots.find(t => t.value === timeSlot)?.label} · ${address.slice(0, 40)}...` : `At NGO center · ${ngoData?.timing}`}
                                </p>
                            </div>
                        </div>

                        {/* Reward estimate */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(16,185,129,0.06)', borderRadius: 10, padding: 14 }}>
                            <span style={{ fontSize: '1.3rem' }}>🪙</span>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#10b981' }}>+150 GreenCoins</p>
                                <p style={{ fontSize: '0.68rem', color: '#64748b' }}>Credited after delivery confirmation</p>
                            </div>
                        </div>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} onClick={handleConfirm} disabled={loading}>
                        {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : <>Confirm Donation <CheckCircle size={16} /></>}
                    </button>
                    {loading && <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>}
                </motion.div>
            )}
        </div>
    );
}

const s = {
    title: { fontSize: '1.4rem', fontWeight: 800 },
    desc: { fontSize: '0.85rem', color: '#94a3b8', marginTop: 4, marginBottom: 16 },
    banner: {
        display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16,
        background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.04))',
        border: '1px solid rgba(16,185,129,0.15)',
    },
    bannerIcon: { fontSize: '1.8rem' },
    progressBar: { display: 'flex', gap: 4, marginBottom: 20 },
    ngoIcon: {
        width: 38, height: 38, borderRadius: 10, background: 'rgba(16,185,129,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    ngoStat: { display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.7rem', color: '#94a3b8' },
    successCircle: {
        width: 88, height: 88, borderRadius: '50%',
        background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '20px auto 0',
    },
};
