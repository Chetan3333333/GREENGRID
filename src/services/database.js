/**
 * database.js — The "toolbox" for all database operations
 * 
 * Think of this file as a waiter in a restaurant:
 * - Pages (customers) tell the waiter what they want
 * - The waiter (this file) goes to the kitchen (Firebase database)
 * - Gets the data and brings it back
 * 
 * Every page uses functions from this file instead of
 * talking to Firebase directly.
 */

import { ref, push, set, get, update, query, orderByChild, equalTo, onValue, off } from 'firebase/database';
import { database } from '../firebase';

// ============================================
// 📦 ITEMS — Save & retrieve scanned items
// ============================================

/**
 * Save a scanned item to the database
 * Called after AI finishes analyzing an image
 */
export async function saveItem(userId, itemData) {
    const itemsRef = ref(database, 'items');
    const newItemRef = push(itemsRef);
    const item = {
        userId,
        title: itemData.title || 'Unknown Item',
        category: itemData.category || 'general',
        aiAnalysis: {
            condition: itemData.condition || '',
            hazard: itemData.hazard || 'None',
            recoveryValue: itemData.recoveryValue || null,
            conditionPct: itemData.conditionPct || 0,
            materials: itemData.materials || null,
            detail: itemData.detail || '',
            route: itemData.route || 'bidding',
            routeLabel: itemData.routeLabel || '',
            icon: itemData.icon || '📦',
            coins: itemData.coins || '+0',
            color: itemData.color || '#10b981',
        },
        status: 'scanned', // scanned → listed → bidding → sold → completed
        createdAt: new Date().toISOString(),
    };
    await set(newItemRef, item);

    // Award coins for scanning
    const coinsEarned = parseInt(itemData.coins?.replace('+', '') || '0');
    if (coinsEarned > 0) {
        await addTransaction(userId, {
            type: 'earn',
            coins: coinsEarned,
            reason: `Scanned: ${item.title}`,
            emoji: itemData.icon || '📦',
        });
        await updateUserStats(userId, { greenCoins: coinsEarned, itemsRecycled: 1 });
    }

    return { id: newItemRef.key, ...item };
}

/**
 * Get all items for a specific user
 */
export async function getUserItems(userId) {
    const itemsRef = ref(database, 'items');
    const snapshot = await get(itemsRef);
    if (!snapshot.exists()) return [];

    const items = [];
    snapshot.forEach((child) => {
        const item = child.val();
        if (item.userId === userId) {
            items.push({ id: child.key, ...item });
        }
    });
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Get all listed items (for marketplace — items from ALL users)
 */
export async function getListedItems() {
    const itemsRef = ref(database, 'items');
    const snapshot = await get(itemsRef);
    if (!snapshot.exists()) return [];

    const items = [];
    snapshot.forEach((child) => {
        const item = child.val();
        items.push({ id: child.key, ...item });
    });
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Update item status (e.g., scanned → listed → sold)
 */
export async function updateItemStatus(itemId, newStatus) {
    const itemRef = ref(database, `items/${itemId}`);
    await update(itemRef, { status: newStatus, updatedAt: new Date().toISOString() });
}

// ============================================
// 💰 TRANSACTIONS — Track all money/coin movements
// ============================================

/**
 * Add a new transaction record
 */
export async function addTransaction(userId, txData) {
    const txRef = ref(database, 'transactions');
    const newTxRef = push(txRef);
    const transaction = {
        userId,
        type: txData.type || 'earn', // earn, spend, exchange
        coins: txData.coins || 0,
        amount: txData.amount || null, // ₹ amount if applicable
        reason: txData.reason || '',
        emoji: txData.emoji || '🪙',
        createdAt: new Date().toISOString(),
    };
    await set(newTxRef, transaction);
    return { id: newTxRef.key, ...transaction };
}

/**
 * Get all transactions for a specific user
 */
export async function getUserTransactions(userId) {
    const txRef = ref(database, 'transactions');
    const snapshot = await get(txRef);
    if (!snapshot.exists()) return [];

    const transactions = [];
    snapshot.forEach((child) => {
        const tx = child.val();
        if (tx.userId === userId) {
            transactions.push({ id: child.key, ...tx });
        }
    });
    return transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ============================================
// 👤 USER STATS — Update user profile data
// ============================================

/**
 * Update user stats incrementally
 * e.g., updateUserStats(userId, { greenCoins: 50, itemsRecycled: 1 })
 * This ADDS to existing values, doesn't replace them
 */
export async function updateUserStats(userId, increments) {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);

    // If user profile doesn't exist, create a minimal one first
    const current = snapshot.exists() ? snapshot.val() : { greenCoins: 0, itemsRecycled: 0, co2Reduced: 0, donations: 0, greenScore: 0 };

    const updates = {};

    if (increments.greenCoins) {
        updates.greenCoins = (current.greenCoins || 0) + increments.greenCoins;
    }
    if (increments.itemsRecycled) {
        updates.itemsRecycled = (current.itemsRecycled || 0) + increments.itemsRecycled;
    }
    if (increments.co2Reduced) {
        updates.co2Reduced = (current.co2Reduced || 0) + increments.co2Reduced;
    }
    if (increments.donations) {
        updates.donations = (current.donations || 0) + increments.donations;
    }
    if (increments.greenScore !== undefined) {
        updates.greenScore = increments.greenScore;
    }

    await update(userRef, updates);
}

/**
 * Get user profile data
 */
export async function getUserProfile(userId) {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        return { id: userId, ...snapshot.val() };
    }
    return null;
}

/**
 * Calculate green score from user activity
 * Score = items recycled * 5 + donations * 10 + coins / 100
 * Max 900
 */
export function calculateGreenScore(userProfile) {
    if (!userProfile) return 0;
    const items = userProfile.itemsRecycled || 0;
    const donations = userProfile.donations || 0;
    const coins = userProfile.greenCoins || 0;
    const rawScore = (items * 15) + (donations * 25) + (coins / 10);
    return Math.min(900, Math.round(rawScore));
}

// ============================================
// 🍎 DONATIONS — Save food donation records
// ============================================

/**
 * Save a food donation record
 */
export async function saveDonation(userId, donationData) {
    const donRef = ref(database, 'donations');
    const newRef = push(donRef);
    const donation = {
        userId,
        foodType: donationData.foodType || '',
        quantity: donationData.quantity || '',
        expiry: donationData.expiry || '',
        photoURL: donationData.photoURL || null,
        notes: donationData.notes || [],
        ngoName: donationData.ngoName || '',
        pickupMode: donationData.pickupMode || 'pickup',
        address: donationData.address || '',
        timeSlot: donationData.timeSlot || '',
        status: 'submitted',
        createdAt: new Date().toISOString(),
    };
    await set(newRef, donation);
    return { id: newRef.key, ...donation };
}

// ============================================
// 🔄 REAL-TIME LISTENERS — For live updates
// ============================================

/**
 * Listen for changes to user profile (real-time)
 * Returns an unsubscribe function
 */
export function listenToUserProfile(userId, callback) {
    const userRef = ref(database, `users/${userId}`);
    onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
            callback({ id: userId, ...snapshot.val() });
        }
    });
    return () => off(userRef);
}

/**
 * Listen for new items (real-time, for marketplace)
 * Returns an unsubscribe function
 */
export function listenToItems(callback) {
    const itemsRef = ref(database, 'items');
    onValue(itemsRef, (snapshot) => {
        const items = [];
        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                items.push({ id: child.key, ...child.val() });
            });
        }
        callback(items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    });
    return () => off(itemsRef);
}
