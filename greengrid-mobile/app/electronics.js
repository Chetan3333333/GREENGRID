import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Cpu, Wrench, DollarSign, Building, CheckCircle, Users, Star, ChevronRight } from 'lucide-react-native';
import { colors } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import Badge from '../components/Badge';
import ScreenHeader from '../components/ScreenHeader';
import { FadeInUpView } from '../components/AnimatedHelpers';

const devices = [
    { name: 'Smartphone', emoji: '📱', value: '₹400–700', condition: 'Non-functional' },
    { name: 'Laptop', emoji: '💻', value: '₹800–2,000', condition: 'Damaged' },
    { name: 'Tablet', emoji: '📲', value: '₹350–600', condition: 'Dead battery' },
    { name: 'Monitor', emoji: '🖥️', value: '₹200–500', condition: 'Broken screen' },
];

const actions = [
    { id: 'bid', label: 'Live Bidding', desc: 'Let merchants compete', emoji: '🔥', route: '/bidding' },
    { id: 'deal', label: 'Direct Deal', desc: 'Negotiate directly', emoji: '🤝', route: '/direct-deal' },
    { id: 'pickup', label: 'Free Pickup', desc: 'Scheduled collection', emoji: '🚚' },
    { id: 'drop', label: 'Drop-Off', desc: 'Nearby center', emoji: '📍' },
];

const merchants = [
    { name: 'TechRecycle Hub', rating: 4.8, deals: 342, specialty: 'Smartphones' },
    { name: 'GreenTech Solutions', rating: 4.6, deals: 287, specialty: 'Laptops' },
    { name: 'EcoTech Recovery', rating: 4.7, deals: 198, specialty: 'Components' },
];

export default function ElectronicsPage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [step, setStep] = useState(0); // 0=devices, 1=actions, 2=merchants, 3=done
    const [selected, setSelected] = useState(null);

    const pickDevice = (dev) => { setSelected(dev); setStep(1); };
    const pickAction = (act) => {
        if (act.route) { router.push(act.route); return; }
        setStep(2);
    };
    const confirm = () => { setStep(3); setTimeout(() => setStep(0), 3000); };

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
            <ScreenHeader title="Electronics Recycling" subtitle="Recover value from e-waste" />

            {step === 0 && (
                <FadeInUpView style={{ marginTop: 16 }}>
                    <Text style={s.sectionTitle}>Select Device</Text>
                    {devices.map((dev, i) => (
                        <TouchableOpacity key={i} onPress={() => pickDevice(dev)}>
                            <GlassCard small style={{ marginBottom: 8 }}>
                                <View style={s.row}>
                                    <Text style={{ fontSize: 28 }}>{dev.emoji}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{dev.name}</Text>
                                        <Text style={{ fontSize: 12, color: colors.textSecondary }}>{dev.condition}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.green }}>{dev.value}</Text>
                                        <Text style={{ fontSize: 10, color: colors.textMuted }}>est. value</Text>
                                    </View>
                                </View>
                            </GlassCard>
                        </TouchableOpacity>
                    ))}
                </FadeInUpView>
            )}

            {step === 1 && selected && (
                <FadeInUpView style={{ marginTop: 16 }}>
                    <GlassCard green style={{ marginBottom: 16 }}>
                        <Text style={{ fontSize: 28, alignSelf: 'center' }}>{selected.emoji}</Text>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center', marginTop: 6 }}>{selected.name}</Text>
                        <Text style={{ fontSize: 13, color: colors.green, textAlign: 'center', marginTop: 2 }}>{selected.value}</Text>
                    </GlassCard>
                    <Text style={s.sectionTitle}>Choose Action</Text>
                    <View style={s.actionGrid}>
                        {actions.map((act, i) => (
                            <TouchableOpacity key={i} style={{ width: '48%' }} onPress={() => pickAction(act)}>
                                <GlassCard small style={{ alignItems: 'center', paddingVertical: 20 }}>
                                    <Text style={{ fontSize: 28 }}>{act.emoji}</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginTop: 8 }}>{act.label}</Text>
                                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{act.desc}</Text>
                                </GlassCard>
                            </TouchableOpacity>
                        ))}
                    </View>
                </FadeInUpView>
            )}

            {step === 2 && (
                <FadeInUpView style={{ marginTop: 16 }}>
                    <Text style={s.sectionTitle}>Available Merchants</Text>
                    {merchants.map((m, i) => (
                        <TouchableOpacity key={i} onPress={confirm}>
                            <GlassCard small style={{ marginBottom: 8 }}>
                                <View style={s.row}>
                                    <View style={s.merchantIcon}><Building size={20} color={colors.blue} /></View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{m.name}</Text>
                                        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                                            <Badge gold>⭐ {m.rating}</Badge>
                                            <Badge blue>{m.deals} deals</Badge>
                                        </View>
                                    </View>
                                    <ChevronRight size={16} color={colors.textDark} />
                                </View>
                            </GlassCard>
                        </TouchableOpacity>
                    ))}
                </FadeInUpView>
            )}

            {step === 3 && (
                <FadeInUpView style={{ marginTop: 32, alignItems: 'center' }}>
                    <CheckCircle size={56} color={colors.green} />
                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 12 }}>Submitted!</Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 6 }}>You'll receive offers shortly</Text>
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
    actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    merchantIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.blueBg, alignItems: 'center', justifyContent: 'center' },
});
