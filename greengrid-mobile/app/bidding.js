import { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flame, Clock, TrendingUp, CheckCircle, Users } from 'lucide-react-native';
import { colors } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import Badge from '../components/Badge';
import ScreenHeader from '../components/ScreenHeader';
import { FadeInUpView, FadeInView } from '../components/AnimatedHelpers';

const initialBids = [
    { name: 'TechRecycle Hub', amount: 520, time: 3 },
    { name: 'GreenTech Solutions', amount: 480, time: 5 },
    { name: 'EcoTech Recovery', amount: 450, time: 8 },
];

export default function BiddingPage() {
    const insets = useSafeAreaInsets();
    const [bids, setBids] = useState(initialBids);
    const [timeLeft, setTimeLeft] = useState(120);
    const [accepted, setAccepted] = useState(false);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Pulse animation for the LIVE badge
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 600, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            ])
        );
        pulse.start();

        // Countdown
        const interval = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) { clearInterval(interval); return 0; }
                return t - 1;
            });
        }, 1000);

        // Simulated new bids
        const bidTimer = setTimeout(() => {
            setBids((prev) => [...prev, { name: 'RecycleMax', amount: 560, time: 1 }].sort((a, b) => b.amount - a.amount));
        }, 5000);

        return () => { pulse.stop(); clearInterval(interval); clearTimeout(bidTimer); };
    }, []);

    const accept = (bid) => setAccepted(true);
    const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const secs = String(timeLeft % 60).padStart(2, '0');

    if (accepted) {
        return (
            <View style={[s.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
                <ScreenHeader title="" />
                <FadeInUpView style={{ alignItems: 'center' }}>
                    <CheckCircle size={64} color={colors.green} />
                    <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 16 }}>Bid Accepted!</Text>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>Merchant will arrange pickup within 24h</Text>
                </FadeInUpView>
            </View>
        );
    }

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
            <ScreenHeader title="Live Bidding" subtitle="Merchants compete for your items" />

            <FadeInUpView style={{ marginTop: 16 }}>
                <GlassCard green>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <View style={s.liveBadge}>
                                <Flame size={14} color="#fff" />
                                <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>LIVE</Text>
                            </View>
                        </Animated.View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Bidding on: Smartphone</Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                                <Badge gold>📱 Samsung Galaxy</Badge>
                                <Badge blue>💎 Non-functional</Badge>
                            </View>
                        </View>
                    </View>
                </GlassCard>
            </FadeInUpView>

            <FadeInUpView delay={100} style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <GlassCard small style={{ flex: 1, alignItems: 'center' }}>
                    <Clock size={16} color={colors.gold} />
                    <Text style={{ fontSize: 22, fontWeight: '800', color: colors.gold, marginTop: 4, fontFamily: 'monospace' }}>{mins}:{secs}</Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>Time Left</Text>
                </GlassCard>
                <GlassCard small style={{ flex: 1, alignItems: 'center' }}>
                    <Users size={16} color={colors.blue} />
                    <Text style={{ fontSize: 22, fontWeight: '800', color: colors.blue, marginTop: 4 }}>{bids.length}</Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>Merchants</Text>
                </GlassCard>
                <GlassCard small style={{ flex: 1, alignItems: 'center' }}>
                    <TrendingUp size={16} color={colors.green} />
                    <Text style={{ fontSize: 22, fontWeight: '800', color: colors.green, marginTop: 4 }}>₹{Math.max(...bids.map(b => b.amount))}</Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>Top Bid</Text>
                </GlassCard>
            </FadeInUpView>

            <FadeInUpView delay={200} style={{ marginTop: 16 }}>
                <Text style={s.sectionTitle}>Current Bids</Text>
                {bids.map((bid, i) => (
                    <GlassCard small key={i} style={{ marginBottom: 8, borderColor: i === 0 ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)' }}>
                        <View style={s.bidRow}>
                            <View style={[s.rank, i === 0 && { backgroundColor: colors.greenBg }]}>
                                <Text style={{ fontSize: 12, fontWeight: '800', color: i === 0 ? colors.green : colors.textMuted }}>#{i + 1}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{bid.name}</Text>
                                <Text style={{ fontSize: 11, color: colors.textMuted }}>{bid.time}m ago</Text>
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: '800', color: i === 0 ? colors.green : colors.text, marginRight: 12 }}>₹{bid.amount}</Text>
                            <TouchableOpacity style={[s.acceptBtn, i === 0 && s.acceptBtnGreen]} onPress={() => accept(bid)}>
                                <Text style={s.acceptText}>Accept</Text>
                            </TouchableOpacity>
                        </View>
                    </GlassCard>
                ))}
            </FadeInUpView>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
    liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
    bidRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    rank: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' },
    acceptBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    acceptBtnGreen: { backgroundColor: colors.green, borderColor: colors.green },
    acceptText: { fontSize: 12, fontWeight: '700', color: '#fff' },
});
