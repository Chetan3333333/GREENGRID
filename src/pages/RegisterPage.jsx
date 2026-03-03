import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
    Mail, Lock, Eye, EyeOff, User, Leaf, ArrowRight,
    AlertCircle, Recycle, Building2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const fadeUp = (d = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: d, duration: 0.4 },
});

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register, loginWithGoogle } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('individual');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword) return setError('Please fill in all fields');
        if (password.length < 6) return setError('Password must be at least 6 characters');
        if (password !== confirmPassword) return setError('Passwords do not match');

        setError('');
        setLoading(true);
        try {
            await register(email, password, name, role);
            navigate('/home');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') setError('An account with this email already exists');
            else if (err.code === 'auth/invalid-email') setError('Invalid email address');
            else if (err.code === 'auth/weak-password') setError('Password is too weak');
            else setError('Registration failed. Please try again.');
        }
        setLoading(false);
    }

    async function handleGoogleSignUp() {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
            navigate('/home');
        } catch (err) {
            if (err.code === 'auth/popup-closed-by-user') setError('Google sign-in was cancelled');
            else setError('Google sign-in failed. Please try again.');
        }
        setLoading(false);
    }

    return (
        <div className="page-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 30, paddingBottom: 40 }}>
            {/* Header */}
            <motion.div {...fadeUp(0)} style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={s.logoCircle}>
                    <Leaf size={32} color="#10b981" />
                </div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginTop: 14 }}>
                    Join <span className="gradient-text">GreenGrid</span>
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: 4 }}>
                    Start your sustainability journey
                </p>
            </motion.div>

            {/* Error */}
            {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={s.errorBox}>
                    <AlertCircle size={16} /> <span>{error}</span>
                </motion.div>
            )}

            {/* Role Selection */}
            <motion.div {...fadeUp(0.05)} style={{ marginBottom: 18 }}>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>I am a...</p>
                <div style={{ display: 'flex', gap: 10 }}>
                    {[
                        { id: 'individual', label: 'Individual', desc: 'I want to recycle', icon: Recycle, emoji: '🧑' },
                        { id: 'merchant', label: 'Merchant', desc: 'I buy recyclables', icon: Building2, emoji: '🏭' },
                    ].map((r) => (
                        <motion.button
                            key={r.id}
                            type="button"
                            onClick={() => setRole(r.id)}
                            whileTap={{ scale: 0.96 }}
                            style={{
                                ...s.roleCard,
                                borderColor: role === r.id ? '#10b981' : 'rgba(255,255,255,0.08)',
                                background: role === r.id ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)',
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{r.emoji}</span>
                            <p style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: 6 }}>{r.label}</p>
                            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>{r.desc}</p>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Form */}
            <motion.form {...fadeUp(0.1)} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={s.inputGroup}>
                    <User size={18} color="#64748b" style={s.inputIcon} />
                    <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} style={s.input} autoComplete="name" />
                </div>

                <div style={s.inputGroup}>
                    <Mail size={18} color="#64748b" style={s.inputIcon} />
                    <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={s.input} autoComplete="email" />
                </div>

                <div style={s.inputGroup}>
                    <Lock size={18} color="#64748b" style={s.inputIcon} />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password (min 6 chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={s.input}
                        autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                        {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                    </button>
                </div>

                <div style={s.inputGroup}>
                    <Lock size={18} color="#64748b" style={s.inputIcon} />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={s.input}
                        autoComplete="new-password"
                    />
                </div>

                <motion.button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700, marginTop: 6 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={loading}
                >
                    {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <div style={s.spinner} /> Creating account...
                        </span>
                    ) : (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            Create Account <ArrowRight size={18} />
                        </span>
                    )}
                </motion.button>
            </motion.form>

            {/* Divider */}
            <motion.div {...fadeUp(0.2)} style={s.divider}>
                <div style={s.dividerLine} />
                <span style={{ color: '#64748b', fontSize: '0.78rem', padding: '0 12px' }}>or</span>
                <div style={s.dividerLine} />
            </motion.div>

            {/* Google */}
            <motion.button {...fadeUp(0.25)} onClick={handleGoogleSignUp} style={s.googleBtn} whileTap={{ scale: 0.97 }} disabled={loading}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
            </motion.button>

            {/* Login Link */}
            <motion.div {...fadeUp(0.3)} style={{ textAlign: 'center', marginTop: 24 }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
                        Sign In
                    </Link>
                </span>
            </motion.div>
        </div>
    );
}

const s = {
    logoCircle: {
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(16,185,129,0.1)',
        border: '2px solid rgba(16,185,129,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto',
    },
    errorBox: {
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 16px', borderRadius: 12,
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.25)',
        color: '#ef4444', fontSize: '0.82rem',
        marginBottom: 14,
    },
    roleCard: {
        flex: 1, padding: '16px 10px', borderRadius: 14,
        border: '1.5px solid', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        fontFamily: 'inherit', color: '#f1f5f9',
        transition: 'all 0.2s',
    },
    inputGroup: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: 14,
        pointerEvents: 'none',
    },
    input: {
        width: '100%',
        padding: '13px 14px 13px 44px',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.04)',
        color: '#f1f5f9',
        fontSize: '0.9rem',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    eyeBtn: {
        position: 'absolute',
        right: 12,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 4,
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        margin: '20px 0',
    },
    dividerLine: {
        flex: 1, height: 1,
        background: 'rgba(255,255,255,0.06)',
    },
    googleBtn: {
        width: '100%', padding: '13px',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.04)',
        color: '#f1f5f9', fontSize: '0.9rem',
        fontWeight: 600, fontFamily: 'inherit',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 10,
        transition: 'background 0.2s',
    },
    spinner: {
        width: 18, height: 18,
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
    },
};
