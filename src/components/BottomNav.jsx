import { NavLink } from 'react-router-dom';
import { Home, ScanLine, Wallet, Award, User } from 'lucide-react';

const tabs = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/scan', icon: ScanLine, label: 'Scan', center: true },
    { to: '/credit-score', icon: Award, label: 'Score' },
    { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
    return (
        <nav style={styles.nav}>
            <div style={styles.inner}>
                {tabs.map(({ to, icon: Icon, label, center }) => (
                    <NavLink
                        key={to}
                        to={to}
                        style={({ isActive }) => ({
                            ...styles.tab,
                            ...(center ? styles.centerTab : {}),
                            color: isActive
                                ? center ? '#fff' : '#10b981'
                                : '#64748b',
                        })}
                    >
                        {center ? (
                            <div style={styles.scanBtn}>
                                <Icon size={26} />
                            </div>
                        ) : (
                            <>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                                <span style={styles.label}>{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}

function isActive(path) { return false; } // unused, NavLink handles it

const styles = {
    nav: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(10, 15, 26, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        height: 'var(--nav-height)',
    },
    inner: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        maxWidth: 480,
        margin: '0 auto',
        height: '100%',
        padding: '0 8px',
    },
    tab: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        flex: 1,
        paddingTop: 6,
        transition: 'color 0.2s',
        textDecoration: 'none',
    },
    centerTab: {
        marginTop: -20,
    },
    scanBtn: {
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
        color: '#fff',
    },
    label: {
        fontSize: '0.65rem',
        fontWeight: 500,
    },
};
