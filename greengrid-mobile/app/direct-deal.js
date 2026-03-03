import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, ChevronRight, Star, DollarSign } from 'lucide-react-native';
import { colors } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import Badge from '../components/Badge';
import ScreenHeader from '../components/ScreenHeader';
import { FadeInUpView } from '../components/AnimatedHelpers';

const merchants = [
    { name: 'TechRecycle Hub', offer: 520, rating: 4.8, emoji: '🏭' },
    { name: 'GreenTech Solutions', offer: 480, rating: 4.6, emoji: '🔧' },
    { name: 'EcoTech Recovery', offer: 450, rating: 4.7, emoji: '♻️' },
];

export default function DirectDealPage() {
    const insets = useSafeAreaInsets();
    const [step, setStep] = useState(0); // 0=list, 1=negotiate, 2=done
    const [selected, setSelected] = useState(null);
    const [counter, setCounter] = useState('');

    const pick = (m) => { setSelected(m); setStep(1); setCounter(String(m.offer + 50)); };
    const confirm = () => { setStep(2); setTimeout(() => setStep(0), 3000); };

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
            <ScreenHeader title="Direct Deal" subtitle="Negotiate one-on-one with a merchant" />

            {step === 0 && (
                <FadeInUpView style={{ marginTop: 16 }}>
                    <Text style={s.sectionTitle}>Available Merchants</Text>
                    {merchants.map((m, i) => (
                        <TouchableOpacity key={i} onPress={() => pick(m)}>
                            <GlassCard small style={{ marginBottom: 10 }}>
                                <View style={s.row}>
                                    <Text style={{ fontSize: 28 }}>{m.emoji}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{m.name}</Text>
                                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                                            <Badge gold>⭐ {m.rating}</Badge>
                                            <Badge green>₹{m.offer}</Badge>
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
                    <GlassCard green style={{ marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={{ fontSize: 28 }}>{selected.emoji}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{selected.name}</Text>
                                <Text style={{ fontSize: 12, color: colors.textSecondary }}>⭐ {selected.rating} rating</Text>
                            </View>
                        </View>
                    </GlassCard>

                    <GlassCard small>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>Merchant's Offer</Text>
                        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.green }}>₹{selected.offer}</Text>
                    </GlassCard>

                    <GlassCard small style={{ marginTop: 10 }}>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>Your Counter Offer</Text>
                        <View style={s.inputRow}>
                            <DollarSign size={18} color={colors.gold} />
                            <TextInput
                                style={s.input}
                                value={counter}
                                onChangeText={setCounter}
                                keyboardType="numeric"
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>
                    </GlassCard>

                    <TouchableOpacity style={s.confirmBtn} onPress={confirm}>
                        <Text style={s.confirmText}>Send Counter Offer</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={s.acceptBtn} onPress={confirm}>
                        <Text style={s.acceptText}>Accept ₹{selected.offer}</Text>
                    </TouchableOpacity>
                </FadeInUpView>
            )}

            {step === 2 && (
                <FadeInUpView style={{ marginTop: 32, alignItems: 'center' }}>
                    <CheckCircle size={56} color={colors.green} />
                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 12 }}>Deal Confirmed!</Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 6, textAlign: 'center' }}>Merchant will arrange pickup soon</Text>
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
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    input: { flex: 1, fontSize: 22, fontWeight: '700', color: colors.text, paddingVertical: 12 },
    confirmBtn: { marginTop: 16, paddingVertical: 16, borderRadius: 14, backgroundColor: colors.green, alignItems: 'center' },
    confirmText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    acceptBtn: { marginTop: 10, paddingVertical: 14, borderRadius: 14, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.greenBorder, alignItems: 'center' },
    acceptText: { fontSize: 14, fontWeight: '600', color: colors.green },
});
