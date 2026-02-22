import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function SplashPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => navigate('/home', { replace: true }), 2800);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div style={styles.wrapper}>
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={styles.logoContainer}
            >
                <div style={styles.logoRing}>
                    <span style={styles.logoEmoji}>♻️</span>
                </div>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={styles.title}
            >
                GreenGrid
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                style={styles.tagline}
            >
                Smart Recycling Exchange
            </motion.p>

            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 1.2, ease: 'easeInOut' }}
                style={styles.loadingBar}
            >
                <div style={styles.loadingFill} />
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1.5 }}
                style={styles.sub}
            >
                AI-Powered Circular Material Recovery
            </motion.p>
        </div>
    );
}

const styles = {
    wrapper: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: 24,
        gap: 16,
        position: 'relative',
        overflow: 'hidden',
    },
    logoContainer: {
        marginBottom: 8,
    },
    logoRing: {
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))',
        border: '2px solid rgba(16,185,129,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 60px rgba(16,185,129,0.2)',
    },
    logoEmoji: {
        fontSize: '3rem',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 900,
        background: 'linear-gradient(135deg, #34d399, #10b981, #059669)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-1px',
    },
    tagline: {
        fontSize: '0.95rem',
        color: '#94a3b8',
        fontWeight: 400,
        textAlign: 'center',
    },
    loadingBar: {
        width: 160,
        height: 3,
        borderRadius: 99,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.06)',
        marginTop: 20,
        transformOrigin: 'left',
    },
    loadingFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #10b981, #34d399)',
        borderRadius: 99,
    },
    sub: {
        fontSize: '0.75rem',
        color: '#64748b',
        marginTop: 4,
    },
};
