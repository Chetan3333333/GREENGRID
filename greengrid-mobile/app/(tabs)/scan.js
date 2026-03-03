import { useState, useRef, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ScanLine, Camera, Upload, Zap, CheckCircle,
    Recycle, DollarSign, Leaf
} from 'lucide-react-native';
import { colors } from '../../constants/theme';
import GlassCard from '../../components/GlassCard';
import Badge from '../../components/Badge';
import { FadeInUpView, FadeInView } from '../../components/AnimatedHelpers';

export default function ScanPage() {
    const insets = useSafeAreaInsets();
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);

    const startScan = () => {
        setScanning(true);
        setResult(null);
        setTimeout(() => {
            setScanning(false);
            setResult({
                item: 'Smartphone (Samsung Galaxy)',
                condition: 'Non-functional',
                hazard: 'Medium',
                materials: [
                    { name: 'Copper', pct: '35%', value: '₹120' },
                    { name: 'Lithium', pct: '15%', value: '₹80' },
                    { name: 'Gold trace', pct: '2%', value: '₹200' },
                    { name: 'Plastic casing', pct: '40%', value: '₹30' },
                ],
                totalValue: '₹430 – ₹680',
                co2: '2.1 kg',
                route: 'Material Exchange (Bidding)',
            });
        }, 3000);
    };

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top + 8 }]} showsVerticalScrollIndicator={false}>
            <FadeInUpView>
                <Text style={s.title}>AI Material Scanner</Text>
                <Text style={s.desc}>Evaluate any item for recovery potential</Text>
            </FadeInUpView>

            {!result && (
                <FadeInUpView delay={100} style={{ marginTop: 16 }}>
                    <GlassCard style={s.scanCard}>
                        <View style={s.scanFrame}>
                            {scanning ? (
                                <FadeInView>
                                    <View style={{ alignItems: 'center' }}>
                                        <Zap size={40} color={colors.green} />
                                        <Text style={s.scanText}>Analyzing materials...</Text>
                                        <View style={s.progressBar}>
                                            <View style={s.progressFill} />
                                        </View>
                                    </View>
                                </FadeInView>
                            ) : (
                                <View style={{ alignItems: 'center' }}>
                                    <ScanLine size={48} color={colors.textDark} />
                                    <Text style={s.scanPlaceholder}>Tap to scan an item</Text>
                                </View>
                            )}
                        </View>
                        {!scanning && (
                            <View style={s.scanBtns}>
                                <TouchableOpacity style={[s.scanBtn, s.scanBtnPrimary]} onPress={startScan}>
                                    <Camera size={18} color="#fff" />
                                    <Text style={s.scanBtnText}>Scan with Camera</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={s.scanBtn} onPress={startScan}>
                                    <Upload size={18} color={colors.textSecondary} />
                                    <Text style={[s.scanBtnText, { color: colors.textSecondary }]}>Upload Image</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </GlassCard>
                </FadeInUpView>
            )}

            {result && (
                <FadeInUpView style={{ marginTop: 16 }}>
                    <GlassCard green>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <CheckCircle size={20} color={colors.green} />
                            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Analysis Complete</Text>
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>{result.item}</Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                            <Badge gold>⚠️ {result.hazard}</Badge>
                            <Badge blue>{result.condition}</Badge>
                        </View>
                    </GlassCard>

                    <GlassCard small style={{ marginTop: 10 }}>
                        <Text style={s.sectionLabel}>Material Breakdown</Text>
                        {result.materials.map((m, i) => (
                            <View key={i} style={s.matRow}>
                                <Text style={{ flex: 1, fontSize: 13, color: colors.text }}>{m.name}</Text>
                                <Text style={{ fontSize: 12, color: colors.textSecondary, width: 40 }}>{m.pct}</Text>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.green }}>{m.value}</Text>
                            </View>
                        ))}
                    </GlassCard>

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                        <GlassCard small style={{ flex: 1 }}>
                            <DollarSign size={16} color={colors.green} />
                            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.green, marginTop: 4 }}>{result.totalValue}</Text>
                            <Text style={{ fontSize: 10, color: colors.textMuted }}>Recovery Value</Text>
                        </GlassCard>
                        <GlassCard small style={{ flex: 1 }}>
                            <Leaf size={16} color={colors.blue} />
                            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.blue, marginTop: 4 }}>{result.co2}</Text>
                            <Text style={{ fontSize: 10, color: colors.textMuted }}>CO₂ Saved</Text>
                        </GlassCard>
                    </View>

                    <GlassCard blue small style={{ marginTop: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Recycle size={16} color={colors.blue} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Recommended Route</Text>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{result.route}</Text>
                            </View>
                        </View>
                    </GlassCard>

                    <TouchableOpacity style={s.resetBtn} onPress={() => setResult(null)}>
                        <Text style={s.resetText}>Scan Another Item</Text>
                    </TouchableOpacity>
                </FadeInUpView>
            )}

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16 },
    title: { fontSize: 22, fontWeight: '800', color: colors.text },
    desc: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
    sectionLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 10 },
    scanCard: { alignItems: 'center' },
    scanFrame: { width: '100%', height: 200, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
    scanText: { fontSize: 14, color: colors.green, fontWeight: '600', marginTop: 12 },
    scanPlaceholder: { fontSize: 13, color: colors.textMuted, marginTop: 12 },
    progressBar: { width: 160, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.06)', marginTop: 12 },
    progressFill: { width: '70%', height: 4, borderRadius: 2, backgroundColor: colors.green },
    scanBtns: { width: '100%', gap: 10, marginTop: 16 },
    scanBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    scanBtnPrimary: { backgroundColor: colors.green, borderColor: colors.green },
    scanBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
    matRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
    resetBtn: { marginTop: 16, paddingVertical: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
    resetText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
});
