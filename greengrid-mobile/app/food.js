import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Apple, Heart, CheckCircle, ChevronRight } from 'lucide-react-native';
import { colors } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import Badge from '../components/Badge';
import ScreenHeader from '../components/ScreenHeader';
import { FadeInUpView } from '../components/AnimatedHelpers';

const foodItems = [
    { name: 'Cooked Rice (2kg)', emoji: '🍚', exp: '6h remaining', servings: 8 },
    { name: 'Fresh Vegetables', emoji: '🥦', exp: '12h remaining', servings: 4 },
    { name: 'Bread & Pastries', emoji: '🍞', exp: '8h remaining', servings: 6 },
    { name: 'Fruit Pack', emoji: '🍎', exp: '10h remaining', servings: 5 },
];

const ngos = [
    { name: 'FoodShare Foundation', emoji: '🏥', dist: '2.3 km', rating: 4.9 },
    { name: 'Annapurna Trust', emoji: '🍲', dist: '3.1 km', rating: 4.7 },
    { name: 'Second Harvest', emoji: '🌾', dist: '4.5 km', rating: 4.8 },
];

export default function FoodPage() {
    const insets = useSafeAreaInsets();
    const [step, setStep] = useState(0);
    const [selected, setSelected] = useState(null);

    const pickFood = (f) => { setSelected(f); setStep(1); };
    const donate = () => { setStep(2); setTimeout(() => setStep(0), 3000); };

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
            <ScreenHeader title="Food Rescue" subtitle="Donate surplus food to those in need" />

            {step === 0 && (
                <FadeInUpView style={{ marginTop: 16 }}>
                    <GlassCard green style={{ marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Heart size={20} color={colors.green} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>You've helped feed 142 people!</Text>
                                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>+340 GreenCoins from donations</Text>
                            </View>
                        </View>
                    </GlassCard>

                    <Text style={s.sectionTitle}>What would you like to donate?</Text>
                    {foodItems.map((f, i) => (
                        <TouchableOpacity key={i} onPress={() => pickFood(f)}>
                            <GlassCard small style={{ marginBottom: 8 }}>
                                <View style={s.row}>
                                    <Text style={{ fontSize: 28 }}>{f.emoji}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{f.name}</Text>
                                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                                            <Badge gold>⏰ {f.exp}</Badge>
                                            <Badge green>🍽️ {f.servings} servings</Badge>
                                        </View>
                                    </View>
                                    <ChevronRight size={16} color={colors.textDark} />
                                </View>
                            </GlassCard>
                        </TouchableOpacity>
                    ))}
                </FadeInUpView>
            )}

            {step === 1 && selected && (
                <FadeInUpView style={{ marginTop: 16 }}>
                    <GlassCard green style={{ alignItems: 'center', marginBottom: 16 }}>
                        <Text style={{ fontSize: 36 }}>{selected.emoji}</Text>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 6 }}>{selected.name}</Text>
                        <Text style={{ fontSize: 13, color: colors.green, marginTop: 2 }}>{selected.servings} servings · +120 🪙</Text>
                    </GlassCard>
                    <Text style={s.sectionTitle}>Select a Partner NGO</Text>
                    {ngos.map((ngo, i) => (
                        <TouchableOpacity key={i} onPress={donate}>
                            <GlassCard small style={{ marginBottom: 8 }}>
                                <View style={s.row}>
                                    <Text style={{ fontSize: 28 }}>{ngo.emoji}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{ngo.name}</Text>
                                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                                            <Badge gold>⭐ {ngo.rating}</Badge>
                                            <Badge blue>📍 {ngo.dist}</Badge>
                                        </View>
                                    </View>
                                    <ChevronRight size={16} color={colors.textDark} />
                                </View>
                            </GlassCard>
                        </TouchableOpacity>
                    ))}
                </FadeInUpView>
            )}

            {step === 2 && (
                <FadeInUpView style={{ marginTop: 32, alignItems: 'center' }}>
                    <CheckCircle size={56} color={colors.green} />
                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 12 }}>Donation Confirmed!</Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 6, textAlign: 'center' }}>+120 GreenCoins earned 🎉</Text>
                </FadeInUpView>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
