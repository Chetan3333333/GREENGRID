import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Award, TrendingUp, Recycle, Leaf, Heart, Zap } from 'lucide-react-native';
import { colors } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import Badge from '../components/Badge';
import ScreenHeader from '../components/ScreenHeader';
import { FadeInUpView } from '../components/AnimatedHelpers';

const categories = [
    { label: 'Recycling Activity', score: 310, max: 400, pct: 78, icon: Recycle, color: '#10b981' },
    { label: 'Carbon Reduction', score: 195, max: 250, pct: 78, icon: Leaf, color: '#3b82f6' },
    { label: 'Community', score: 145, max: 200, pct: 73, icon: Heart, color: '#ec4899' },
    { label: 'Consistency', score: 110, max: 150, pct: 73, icon: Zap, color: '#f59e0b' },
];

const rewards = [
    { label: 'Priority Bidding Access', min: 600, emoji: '🔥' },
    { label: 'Premium Merchant Deals', min: 700, emoji: '💎' },
    { label: 'Bonus GreenCoins (2x)', min: 800, emoji: '🪙' },
    { label: 'Exclusive Eco Products', min: 900, emoji: '🌟' },
];

export default function CreditScorePage() {
    const insets = useSafeAreaInsets();
    const score = 760;

    return (
        <ScrollView style={[s.c, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
            <ScreenHeader title="Green Credit Score" subtitle="Your environmental impact rating" />

            <FadeInUpView style={{ marginTop: 16 }}>
                <GlassCard green style={{ alignItems: 'center', paddingVertical: 24 }}>
                    <Award size={32} color={colors.green} />
                    <Text style={{ fontSize: 48, fontWeight: '800', color: colors.text, marginTop: 8 }}>{score}</Text>
                    <Badge green>🌿 Excellent</Badge>
                    <View style={s.bar}>
                        <View style={[s.fill, { width: `${(score / 1000) * 100}%` }]} />
                    </View>
                    <View style={s.barLabels}>
                        <Text style={s.barLabel}>0</Text>
                        <Text style={s.barLabel}>500</Text>
                        <Text style={s.barLabel}>1000</Text>
                    </View>
                </GlassCard>
            </FadeInUpView>

            <FadeInUpView delay={100} style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <GlassCard small style={{ flex: 1, alignItems: 'center' }}>
                    <TrendingUp size={16} color={colors.green} />
                    <Text style={{ fontSize: 16, fontWeight: '800', color: colors.green, marginTop: 4 }}>+42</Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>This Month</Text>
                </GlassCard>
                <GlassCard small style={{ flex: 1, alignItems: 'center' }}>
                    <Award size={16} color={colors.gold} />
                    <Text style={{ fontSize: 16, fontWeight: '800', color: colors.gold, marginTop: 4 }}>Top 15%</Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>Ranking</Text>
                </GlassCard>
            </FadeInUpView>

            <FadeInUpView delay={200} style={{ marginTop: 20 }}>
                <Text style={s.section}>Score Breakdown</Text>
                {categories.map((cat, i) => (
                    <GlassCard small key={i} style={{ marginBottom: 8 }}>
                        <View style={s.catRow}>
                            <View style={[s.iconC, { backgroundColor: `${cat.color}18` }]}>
                                <cat.icon size={16} color={cat.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={s.catHeader}>
                                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{cat.label}</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: cat.color }}>{cat.score}/{cat.max}</Text>
                                </View>
                                <View style={s.catBar}>
                                    <View style={[s.catFill, { width: `${cat.pct}%`, backgroundColor: cat.color }]} />
                                </View>
                            </View>
                        </View>
                    </GlassCard>
                ))}
            </FadeInUpView>

            <FadeInUpView delay={300} style={{ marginTop: 16 }}>
                <Text style={s.section}>Reward Unlocks</Text>
                {rewards.map((r, i) => {
                    const unlocked = score >= r.min;
                    return (
                        <GlassCard small key={i} style={{ marginBottom: 6, opacity: unlocked ? 1 : 0.5 }}>
                            <View style={s.catRow}>
                                <Text style={{ fontSize: 22 }}>{r.emoji}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{r.label}</Text>
                                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Requires {r.min}+ score</Text>
                                </View>
                                {unlocked && <Badge green>✓ Unlocked</Badge>}
                            </View>
                        </GlassCard>
                    );
                })}
            </FadeInUpView>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    c: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16 },
    section: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
    bar: { width: '90%', height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)', marginTop: 16 },
    fill: { height: 8, borderRadius: 4, backgroundColor: colors.green },
    barLabels: { width: '90%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    barLabel: { fontSize: 10, color: colors.textMuted },
    catRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    catHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    iconC: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    catBar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', marginTop: 6 },
    catFill: { height: 6, borderRadius: 3 },
});
