import { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile,
} from 'firebase/auth';
import { ref, set, get, serverTimestamp } from 'firebase/database';
import { auth, googleProvider, database } from '../firebase';

const AuthContext = createContext(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Create user document in Realtime Database
    async function createUserDocument(user, extraData = {}) {
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            const userData = {
                name: user.displayName || extraData.name || '',
                email: user.email,
                role: extraData.role || 'individual',
                greenCoins: 0,
                greenScore: 0,
                itemsRecycled: 0,
                co2Reduced: 0,
                donations: 0,
                joinedAt: new Date().toISOString(),
                photoURL: user.photoURL || null,
            };
            await set(userRef, userData);
            return userData;
        }
        return snapshot.val();
    }

    // Fetch user profile from Realtime Database
    // If profile doesn't exist (old account), auto-create it
    async function fetchUserProfile(uid) {
        const userRef = ref(database, `users/${uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            setUserProfile({ id: uid, ...snapshot.val() });
        } else if (auth.currentUser) {
            // Old account — create profile now
            const newProfile = await createUserDocument(auth.currentUser);
            setUserProfile({ id: uid, ...newProfile });
        }
    }

    // Register with email and password
    async function register(email, password, name, role = 'individual') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        await createUserDocument(result.user, { name, role });
        await fetchUserProfile(result.user.uid);
        return result.user;
    }

    // Login with email and password
    async function login(email, password) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await fetchUserProfile(result.user.uid);
        return result.user;
    }

    // Login with Google
    async function loginWithGoogle() {
        const result = await signInWithPopup(auth, googleProvider);
        await createUserDocument(result.user);
        await fetchUserProfile(result.user.uid);
        return result.user;
    }

    // Logout
    async function logout() {
        setUserProfile(null);
        return signOut(auth);
    }

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await fetchUserProfile(user.uid);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfile,
        loading,
        register,
        login,
        loginWithGoogle,
        logout,
        fetchUserProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
