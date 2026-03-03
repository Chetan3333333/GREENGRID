import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Leaf, Cpu, Recycle, Apple, TrendingUp, Award, Coins,
    ScanLine, ChevronRight, Bot
} from 'lucide-react-native';
import { colors } from '../../constants/theme';
import GlassCard from '../../components/GlassCard';
import Badge from '../../components/Badge';
import { FadeInUpView } from '../../components/AnimatedHelpers';

const categories = [
    { label: 'Electronics', icon: Cpu, color: '#3b82f6', emoji: '📱', route: '/electronics' },
    { label: 'Recyclables', icon: Recycle, color: '#10b981', emoji: '♻️', route: '/recyclables' },
    { label: 'Food Rescue', icon: Apple, color: '#f59e0b', emoji: '🍎', route: '/food' },
    { label: 'Marketplace', icon: Award, color: '#8b5cf6', emoji: '🛍️', route: '/marketplace' },
];

const quickActions = [
    { label: 'Credit Score', emoji: '📊', route: '/credit-score' },
    { label: 'Eco Shop', emoji: '🛒', route: '/marketplace' },
    { label: 'Live Bids', emoji: '🔥', route: '/bidding' },
];

const recentActivity = [
    { label: 'Smartphone submitted', detail: '₹520 bid accepted', emoji: '📱', time: '2h ago' },
    { label: 'PET Plastic recycled', detail: '+190 GreenCoins', emoji: '♻️', time: '3d ago' },
    { label: 'Food donated', detail: '+120 GreenCoins', emoji: '🍎', time: '4d ago' },
];

export default function HomePage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top + 8 }]} showsVerticalScrollIndicator={false}>
            {/* Greeting */}
            <FadeInUpView>
                <Text style={s.greeting}>Hello, Green Hero! 🌿</Text>
                <Text style={s.subGreet}>Make an impact today</Text>
            </FadeInUpView>

            {/* Stats Row */}
            <FadeInUpView delay={100} style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <GlassCard small style={{ flex: 1 }}>
                    <Coins size={16} color={colors.gold} />
                    <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 4 }}>2,450</Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>GreenCoins</Text>
                </GlassCard>
                <GlassCard small style={{ flex: 1 }}>
                    <TrendingUp size={16} color={colors.green} />
                    <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 4 }}>127</Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>Items Saved</Text>
                </GlassCard>
                <GlassCard small style={{ flex: 1 }}>
                    <Award size={16} color={colors.blue} />
                    <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 4 }}>760</Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>Green Score</Text>
                </GlassCard>
            </FadeInUpView>

            {/* AI Evaluator CTA */}
            <FadeInUpView delay={150}>
                <TouchableOpacity onPress={() => router.push('/(tabs)/scan')}>
                    <GlassCard green>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={s.ctaIcon}><ScanLine size={24} color={colors.green} /></View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>AI Material Evaluator</Text>
                                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Scan any item for instant valuation</Text>
                            </View>
                            <ChevronRight size={16} color={colors.textDark} />
                        </View>
                    </GlassCard>
                </TouchableOpacity>
            </FadeInUpView>

            {/* Categories */}
            <FadeInUpView delay={200} style={{ marginTop: 16 }}>
                <Text style={s.sectionTitle}>Categories</Text>
                <View style={s.catGrid}>
                    {categories.map((cat, i) => (
                        <TouchableOpacity key={i} style={{ width: '48%' }} onPress={() => router.push(cat.route)}>
                            <GlassCard small style={{ alignItems: 'center', paddingVertical: 18 }}>
                                <Text style={{ fontSize: 28 }}>{cat.emoji}</Text>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 8 }}>{cat.label}</Text>
                            </GlassCard>
                        </TouchableOpacity>
                    ))}
                </View>
            </FadeInUpView>

            {/* AI Chatbot CTA */}
            <FadeInUpView delay={250}>
                <TouchableOpacity onPress={() => router.push('/chatbot')}>
                    <GlassCard blue>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={[s.ctaIcon, { backgroundColor: colors.blueBg }]}>
                                <Bot size={24} color={colors.blue} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>AI Chatbot</Text>
                                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Test products or ask questions</Text>
                            </View>
                            <ChevronRight size={16} color={colors.textDark} />
                        </View>
                    </GlassCard>
                </TouchableOpacity>
            </FadeInUpView>

            {/* Quick Actions */}
            <FadeInUpView delay={300} style={{ marginTop: 16 }}>
                <Text style={s.sectionTitle}>Quick Actions</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {quickActions.map((qa, i) => (
                        <TouchableOpacity key={i} style={{ flex: 1 }} onPress={() => router.push(qa.route)}>
                            <GlassCard small style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 22 }}>{qa.emoji}</Text>
                                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.text, marginTop: 6 }}>{qa.label}</Text>
                            </GlassCard>
                        </TouchableOpacity>
                    ))}
                </View>
            </FadeInUpView>

            {/* Recent Activity */}
            <FadeInUpView delay={350} style={{ marginTop: 16 }}>
                <Text style={s.sectionTitle}>Recent Activity</Text>
                {recentActivity.map((act, i) => (
                    <GlassCard small key={i} style={{ marginBottom: 8 }}>
                        <View style={s.actRow}>
                            <Text style={{ fontSize: 22 }}>{act.emoji}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{act.label}</Text>
                                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>{act.detail}</Text>
                            </View>
                            <Text style={{ fontSize: 10, color: colors.textDark }}>{act.time}</Text>
                        </View>
                    </GlassCard>
                ))}
            </FadeInUpView>

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16 },
    greeting: { fontSize: 22, fontWeight: '800', color: colors.text },
    subGreet: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
    ctaIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.greenBg, alignItems: 'center', justifyContent: 'center' },
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    actRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
