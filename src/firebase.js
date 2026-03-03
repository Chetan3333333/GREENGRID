import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAJ5A_6TIjHAwq8wYkQUVTvL8moXwfQI6Q",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "greengrid-e46fb.firebaseapp.com",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://greengrid-e46fb-default-rtdb.firebaseio.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "greengrid-e46fb",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "greengrid-e46fb.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "359316899557",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:359316899557:web:4d27f18baad445aaffb60c",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-YTJHBJ26E5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const database = getDatabase(app);
export const storage = getStorage(app);
export default app;
