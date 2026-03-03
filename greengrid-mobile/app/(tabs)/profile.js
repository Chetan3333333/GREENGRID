import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Ellipse, Circle } from 'react-native-svg';
import {
    Award, Coins, Recycle, Settings, ChevronRight,
    Bell, Moon, LogOut, HelpCircle, Heart, Shield, TrendingUp
} from 'lucide-react-native';
import { colors } from '../../constants/theme';
import GlassCard from '../../components/GlassCard';
import Badge from '../../components/Badge';
import { FadeInUpView } from '../../components/AnimatedHelpers';

const impactStats = [
    { label: 'Items Saved', value: '127', icon: Recycle, color: '#10b981' },
    { label: 'CO₂ Reduced', value: '48kg', icon: TrendingUp, color: '#3b82f6' },
    { label: 'Donations', value: '34', icon: Heart, color: '#ec4899' },
];

const menuItems = [
    { label: 'Notification Settings', icon: Bell, color: '#3b82f6' },
    { label: 'Dark Mode', icon: Moon, color: '#8b5cf6', toggle: true },
    { label: 'Help & Support', icon: HelpCircle, color: '#f59e0b' },
    { label: 'Privacy & Security', icon: Shield, color: '#10b981' },
    { label: 'App Settings', icon: Settings, color: '#64748b' },
];

function TreeAvatar() {
    return (
        <View style={s.avatar}>
            <Svg width={40} height={40} viewBox="0 0 100 100">
                <Rect x="44" y="55" width="12" height="28" rx="3" fill="#7c5c3c" />
                <Rect x="46" y="57" width="4" height="24" rx="2" fill="#9a7b5a" opacity="0.5" />
                <Ellipse cx="50" cy="42" rx="28" ry="24" fill="#059669" />
                <Ellipse cx="50" cy="38" rx="24" ry="20" fill="#10b981" />
                <Ellipse cx="50" cy="34" rx="18" ry="16" fill="#34d399" />
                <Ellipse cx="50" cy="30" rx="12" ry="11" fill="#6ee7b7" />
                <Circle cx="38" cy="36" r="3" fill="#a7f3d0" opacity="0.6" />
                <Circle cx="55" cy="28" r="2" fill="#a7f3d0" opacity="0.5" />
                <Circle cx="45" cy="44" r="2.5" fill="#a7f3d0" opacity="0.4" />
                <Ellipse cx="50" cy="84" rx="22" ry="4" fill="#064e3b" opacity="0.3" />
            </Svg>
        </View>
    );
}

export default function ProfilePage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top + 8 }]} showsVerticalScrollIndicator={false}>
            <FadeInUpView>
                <GlassCard green>
                    <View style={s.profileRow}>
                        <TreeAvatar />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Green Hero</Text>
                            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>Eco Champion · Member since Jan 2025</Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                                <Badge green>🌿 Level 7</Badge>
                                <Badge gold>🪙 2,450</Badge>
                            </View>
                        </View>
                    </View>
                </GlassCard>
            </FadeInUpView>

            <FadeInUpView delay={100} style={{ marginTop: 16 }}>
                <Text style={s.sectionTitle}>Your Impact</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {impactStats.map((st, i) => (
                        <GlassCard small key={i} style={{ flex: 1, alignItems: 'center', padding: 14 }}>
                            <st.icon size={20} color={st.color} />
                            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 6 }}>{st.value}</Text>
                            <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>{st.label}</Text>
                        </GlassCard>
                    ))}
                </View>
            </FadeInUpView>

            <FadeInUpView delay={200} style={{ marginTop: 20 }}>
                <Text style={s.sectionTitle}>Quick Access</Text>
                {[
                    { label: 'GreenCoins Wallet', icon: Coins, color: '#f59e0b', to: '/(tabs)/wallet' },
                    { label: 'Green Credit Score', icon: Award, color: '#10b981', to: '/credit-score' },
                    { label: 'Eco Marketplace', icon: Recycle, color: '#3b82f6', to: '/marketplace' },
                ].map((item, i) => (
                    <TouchableOpacity key={i} onPress={() => router.push(item.to)} style={{ marginBottom: 8 }}>
                        <GlassCard small>
                            <View style={s.listItem}>
                                <View style={[s.iconCircle, { backgroundColor: `${item.color}18` }]}>
                                    <item.icon size={18} color={item.color} />
                                </View>
                                <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: colors.text }}>{item.label}</Text>
                                <ChevronRight size={14} color={colors.textDark} />
                            </View>
                        </GlassCard>
                    </TouchableOpacity>
                ))}
            </FadeInUpView>

            <FadeInUpView delay={300} style={{ marginTop: 16 }}>
                <Text style={s.sectionTitle}>Settings</Text>
                {menuItems.map((item, i) => (
                    <GlassCard small key={i} style={{ marginBottom: 6 }}>
                        <View style={s.listItem}>
                            <View style={[s.iconCircle, { backgroundColor: `${item.color}18` }]}>
                                <item.icon size={16} color={item.color} />
                            </View>
                            <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: colors.text }}>{item.label}</Text>
                            {item.toggle ? (
                                <View style={s.toggleOn}><View style={s.toggleDot} /></View>
                            ) : (
                                <ChevronRight size={14} color={colors.textDark} />
                            )}
                        </View>
                    </GlassCard>
                ))}
            </FadeInUpView>

            <FadeInUpView delay={400} style={{ marginTop: 16 }}>
                <TouchableOpacity style={s.logoutBtn}>
                    <LogOut size={16} color={colors.red} />
                    <Text style={s.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </FadeInUpView>

            <Text style={s.version}>GreenGrid v1.0.0 · Made with 💚</Text>
            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
    profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 2, borderColor: 'rgba(16,185,129,0.3)', alignItems: 'center', justifyContent: 'center' },
    listItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconCircle: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    toggleOn: { width: 40, height: 22, borderRadius: 11, backgroundColor: colors.green, padding: 2, justifyContent: 'center', alignItems: 'flex-end' },
    toggleDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff' },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
    logoutText: { fontSize: 14, fontWeight: '600', color: colors.red },
    version: { textAlign: 'center', fontSize: 11, color: colors.textDark, marginTop: 16 },
});
