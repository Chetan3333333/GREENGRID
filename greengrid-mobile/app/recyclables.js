import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Recycle, CheckCircle, ChevronRight } from 'lucide-react-native';
import { colors } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import Badge from '../components/Badge';
import ScreenHeader from '../components/ScreenHeader';
import { FadeInUpView } from '../components/AnimatedHelpers';

const materials = [
    { name: 'PET Plastic', emoji: '🧴', rate: '₹22/kg', coins: '+45 🪙' },
    { name: 'Newspaper', emoji: '📰', rate: '₹14/kg', coins: '+25 🪙' },
    { name: 'Glass Bottles', emoji: '🍾', rate: '₹8/kg', coins: '+30 🪙' },
    { name: 'Cardboard', emoji: '📦', rate: '₹10/kg', coins: '+20 🪙' },
    { name: 'Aluminum Cans', emoji: '🥫', rate: '₹85/kg', coins: '+55 🪙' },
    { name: 'Copper Wire', emoji: '🔌', rate: '₹420/kg', coins: '+80 🪙' },
];

const sellModes = [
    { id: 'bid', label: 'Live Bidding', desc: 'Merchants compete for your materials', emoji: '🔥', route: '/bidding' },
    { id: 'deal', label: 'Direct Deal', desc: 'Negotiate directly with a buyer', emoji: '🤝', route: '/direct-deal' },
    { id: 'pickup', label: 'Pickup', desc: 'Schedule a free home pickup', emoji: '🚚' },
];

export default function RecyclablesPage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [step, setStep] = useState(0);
    const [selected, setSelected] = useState(null);

    const pick = (mat) => { setSelected(mat); setStep(1); };
    const pickMode = (mode) => {
        if (mode.route) { router.push(mode.route); return; }
        setStep(2);
        setTimeout(() => setStep(0), 3000);
    };

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
            <ScreenHeader title="Recyclable Materials" subtitle="Turn waste into value" />

            {step === 0 && (
                <FadeInUpView style={{ marginTop: 16 }}>
                    <Text style={s.sectionTitle}>Select Material</Text>
                    {materials.map((m, i) => (
                        <TouchableOpacity key={i} onPress={() => pick(m)}>
                            <GlassCard small style={{ marginBottom: 8 }}>
                                <View style={s.row}>
                                    <Text style={{ fontSize: 26 }}>{m.emoji}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{m.name}</Text>
                                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                                            <Badge green>{m.rate}</Badge>
                                            <Badge gold>{m.coins}</Badge>
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
                        <Text style={{ fontSize: 14, color: colors.green, marginTop: 2 }}>{selected.rate}</Text>
                    </GlassCard>
                    <Text style={s.sectionTitle}>How would you like to sell?</Text>
                    {sellModes.map((mode, i) => (
                        <TouchableOpacity key={i} onPress={() => pickMode(mode)}>
                            <GlassCard small style={{ marginBottom: 8 }}>
                                <View style={s.row}>
                                    <Text style={{ fontSize: 26 }}>{mode.emoji}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{mode.label}</Text>
                                        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{mode.desc}</Text>
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
                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 12 }}>Pickup Scheduled!</Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 6, textAlign: 'center' }}>Our partner will collect within 24h</Text>
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
