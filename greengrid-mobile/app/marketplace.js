import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingBag, Coins, Star } from 'lucide-react-native';
import { colors } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import ScreenHeader from '../components/ScreenHeader';
import { FadeInUpView } from '../components/AnimatedHelpers';

const categories = ['All', 'Home', 'Fashion', 'Garden', 'Tech'];
const products = [
    { name: 'Bamboo Toothbrush Set', price: 80, rating: 4.8, emoji: '🪥', cat: 'Home' },
    { name: 'Recycled Tote Bag', price: 120, rating: 4.6, emoji: '👜', cat: 'Fashion' },
    { name: 'Compost Bin Starter', price: 250, rating: 4.7, emoji: '🌱', cat: 'Garden' },
    { name: 'Solar Phone Charger', price: 450, rating: 4.9, emoji: '🔋', cat: 'Tech' },
    { name: 'Beeswax Wraps', price: 60, rating: 4.5, emoji: '🐝', cat: 'Home' },
    { name: 'Eco Water Bottle', price: 180, rating: 4.8, emoji: '💧', cat: 'Home' },
];

export default function MarketplacePage() {
    const insets = useSafeAreaInsets();
    const [activeCat, setActiveCat] = useState('All');
    const [balance, setBalance] = useState(2450);
    const filtered = activeCat === 'All' ? products : products.filter(p => p.cat === activeCat);

    const buy = (p) => {
        if (balance < p.price) { Alert.alert('Insufficient Balance'); return; }
        Alert.alert('Purchased!', `${p.name} for ${p.price} 🪙`, [
            { text: 'OK', onPress: () => setBalance(b => b - p.price) },
        ]);
    };

    return (
        <ScrollView style={[s.c, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
            <ScreenHeader title="Eco Marketplace" subtitle="Spend GreenCoins on sustainable products" />
            <FadeInUpView style={{ marginTop: 16 }}>
                <GlassCard green style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Coins size={20} color={colors.gold} />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Your Balance</Text>
                            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>{balance.toLocaleString()} 🪙</Text>
                        </View>
                    </View>
                </GlassCard>
            </FadeInUpView>
            <FadeInUpView delay={100}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        {categories.map(cat => (
                            <TouchableOpacity key={cat} style={[s.pill, activeCat === cat && s.pillA]} onPress={() => setActiveCat(cat)}>
                                <Text style={[s.pillT, activeCat === cat && s.pillTA]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </FadeInUpView>
            <FadeInUpView delay={200}>
                <View style={s.grid}>
                    {filtered.map((p, i) => (
                        <View key={i} style={{ width: '48%' }}>
                            <GlassCard small style={{ alignItems: 'center', paddingVertical: 16 }}>
                                <Text style={{ fontSize: 36 }}>{p.emoji}</Text>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 8, textAlign: 'center' }} numberOfLines={2}>{p.name}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                                    <Star size={12} color={colors.gold} fill={colors.gold} />
                                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>{p.rating}</Text>
                                </View>
                                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.green, marginTop: 6 }}>{p.price} 🪙</Text>
                                <TouchableOpacity style={s.buy} onPress={() => buy(p)}>
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Purchase</Text>
                                </TouchableOpacity>
                            </GlassCard>
                        </View>
                    ))}
                </View>
            </FadeInUpView>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    c: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder },
    pillA: { backgroundColor: colors.greenBg, borderColor: colors.greenBorder },
    pillT: { fontSize: 13, fontWeight: '500', color: colors.textMuted },
    pillTA: { color: colors.green, fontWeight: '700' },
    buy: { marginTop: 10, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.green },
});
