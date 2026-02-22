import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft } from 'lucide-react';

const backPages = ['/food', '/electronics', '/recyclables', '/marketplace', '/bidding'];

export default function Header({ title }) {
    const navigate = useNavigate();
    const showBack = backPages.includes(location.pathname);

    return (
        <header style={styles.header}>
            <div style={styles.inner}>
                <div style={styles.left}>
                    {showBack ? (
                        <button style={styles.backBtn} onClick={() => navigate(-1)}>
                            <ChevronLeft size={22} />
                        </button>
                    ) : (
                        <div style={styles.logo}>
                            <span style={styles.logoIcon}>♻️</span>
                        </div>
                    )}
                    <h1 style={styles.title}>{title}</h1>
                </div>
                <button style={styles.bellBtn} onClick={() => { }}>
                    <Bell size={20} />
                    <span style={styles.dot} />
                </button>
            </div>
        </header>
    );
}

const styles = {
    header: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 'var(--header-height)',
        background: 'rgba(10,15,26,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    inner: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: 480,
        margin: '0 auto',
        height: '100%',
        padding: '0 16px',
    },
    left: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
    },
    logo: {
        fontSize: '1.4rem',
        lineHeight: 1,
    },
    logoIcon: {},
    title: {
        fontSize: '1.15rem',
        fontWeight: 700,
        color: '#f1f5f9',
    },
    backBtn: {
        width: 34,
        height: 34,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        background: 'rgba(255,255,255,0.05)',
    },
    bellBtn: {
        position: 'relative',
        width: 38,
        height: 38,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        background: 'rgba(255,255,255,0.05)',
    },
    dot: {
        position: 'absolute',
        top: 8,
        right: 9,
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: '#10b981',
        border: '2px solid #0a0f1a',
    },
};
