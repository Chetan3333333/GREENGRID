import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wallet, TrendingUp, ArrowUpRight, ShoppingBag, Gift, Coins } from 'lucide-react-native';
import { colors } from '../../constants/theme';
import GlassCard from '../../components/GlassCard';
import Badge from '../../components/Badge';
import { FadeInUpView } from '../../components/AnimatedHelpers';

const transactions = [
    { id: 1, label: 'Bid Accepted — Smartphone', amount: '+₹520', type: 'earn', emoji: '🏭', time: '2h ago' },
    { id: 2, label: 'Eco Shop Purchase', amount: '-150 🪙', type: 'spend', emoji: '🛍️', time: '1d ago' },
    { id: 3, label: 'PET Plastic Exchange', amount: '+₹190', type: 'earn', emoji: '♻️', time: '3d ago' },
    { id: 4, label: 'Donated Food — Bonus', amount: '+120 🪙', type: 'earn', emoji: '🍎', time: '4d ago' },
    { id: 5, label: 'PCB Recovery Sale', amount: '+₹1,250', type: 'earn', emoji: '💻', time: '1w ago' },
    { id: 6, label: 'Newspaper Bundle', amount: '+₹85', type: 'earn', emoji: '📰', time: '1w ago' },
];

const filters = ['All', 'Earned', 'Spent', 'Exchange'];

export default function WalletPage() {
    const insets = useSafeAreaInsets();
    const [activeFilter, setActiveFilter] = useState('All');

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top + 8 }]} showsVerticalScrollIndicator={false}>
            <FadeInUpView>
                <Text style={s.title}>GreenCoins Wallet</Text>
                <Text style={s.desc}>Earn from recycling, spend on sustainable goods</Text>
            </FadeInUpView>

            <FadeInUpView delay={100} style={{ marginTop: 16 }}>
                <GlassCard green>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <Coins size={20} color={colors.gold} />
                        <Text style={{ fontSize: 13, color: colors.textSecondary }}>GreenCoin Balance</Text>
                    </View>
                    <Text style={{ fontSize: 32, fontWeight: '800', color: colors.text }}>2,450 🪙</Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>≈ ₹245 redeemable value</Text>
                </GlassCard>
            </FadeInUpView>

            <FadeInUpView delay={150} style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <GlassCard small style={{ flex: 1 }}>
                    <ArrowUpRight size={16} color={colors.green} />
                    <Text style={{ fontSize: 18, fontWeight: '800', color: colors.green, marginTop: 4 }}>₹2,045</Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>Total Earned</Text>
                </GlassCard>
                <GlassCard small style={{ flex: 1 }}>
                    <ArrowUpRight size={16} color={colors.gold} />
                    <Text style={{ fontSize: 18, fontWeight: '800', color: colors.gold, marginTop: 4 }}>₹1,960</Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>Exchange Earnings</Text>
                </GlassCard>
            </FadeInUpView>

            <FadeInUpView delay={200} style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.greenBg, borderColor: colors.greenBorder }]}>
                    <Gift size={18} color={colors.green} />
                    <Text style={[s.actionText, { color: colors.green }]}>Redeem</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.blueBg, borderColor: colors.blueBorder }]}>
                    <ShoppingBag size={18} color={colors.blue} />
                    <Text style={[s.actionText, { color: colors.blue }]}>Eco Shop</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.goldBg, borderColor: colors.goldBorder }]}>
                    <TrendingUp size={18} color={colors.gold} />
                    <Text style={[s.actionText, { color: colors.gold }]}>History</Text>
                </TouchableOpacity>
            </FadeInUpView>

            <FadeInUpView delay={250} style={{ marginTop: 20 }}>
                <Text style={s.sectionTitle}>Transactions</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    {filters.map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[s.filterPill, activeFilter === f && s.filterActive]}
                            onPress={() => setActiveFilter(f)}
                        >
                            <Text style={[s.filterText, activeFilter === f && s.filterTextActive]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {transactions.map((tx) => (
                    <GlassCard small key={tx.id} style={{ marginBottom: 8 }}>
                        <View style={s.txRow}>
                            <Text style={{ fontSize: 22 }}>{tx.emoji}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{tx.label}</Text>
                                <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>{tx.time}</Text>
                            </View>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: tx.type === 'earn' ? colors.green : colors.red }}>{tx.amount}</Text>
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
    title: { fontSize: 22, fontWeight: '800', color: colors.text },
    desc: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 8 },
    actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14, borderWidth: 1, gap: 6 },
    actionText: { fontSize: 12, fontWeight: '600' },
    filterPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder },
    filterActive: { backgroundColor: colors.greenBg, borderColor: colors.greenBorder },
    filterText: { fontSize: 12, fontWeight: '500', color: colors.textMuted },
    filterTextActive: { color: colors.green, fontWeight: '700' },
    txRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
