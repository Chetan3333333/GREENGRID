import { useState, useRef, useEffect } from 'react';
import {
    ScrollView, View, Text, TouchableOpacity, TextInput,
    StyleSheet, KeyboardAvoidingView, Platform, Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bot, Send, User, Sparkles, HelpCircle } from 'lucide-react-native';
import { colors } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import ScreenHeader from '../components/ScreenHeader';
import { FadeInUpView, FadeInView } from '../components/AnimatedHelpers';

const quickSuggestions = {
    test: ['How sustainable is this laptop?', 'Is this phone eco-friendly?', 'Rate this product\'s recyclability'],
    ask: ['How to recycle e-waste?', 'What is green credit score?', 'Tips for reducing waste'],
};

const botReplies = {
    test: [
        "🔍 Analyzing product sustainability...\n\n📱 **Sustainability Score: 7.2/10**\n\n✅ Recyclable aluminum body\n✅ 85% recyclable components\n⚠️ Lithium battery requires special disposal\n\n💡 *Recommendation: Trade-in through GreenGrid for maximum value recovery!*",
        "🌿 **Eco Analysis Complete**\n\nThis product contains:\n• 40% recyclable metals\n• 35% recyclable plastics\n• 15% rare earth elements\n• 10% non-recyclable\n\n♻️ **Recovery potential: ₹430–680**\n🪙 **Bonus: +45 GreenCoins**",
    ],
    ask: [
        "Great question! 🌱\n\n**E-waste Recycling Steps:**\n1. Use our AI Scanner to identify materials\n2. Choose between Bidding or Direct Deal\n3. Get paid in ₹ or GreenCoins\n4. Earn Green Credit Score points!\n\n💡 *Never throw electronics in regular trash — they contain valuable recoverable materials!*",
        "📊 **Green Credit Score** measures your environmental impact:\n\n• Recycling activity (40%)\n• Carbon footprint reduction (25%)\n• Community engagement (20%)\n• Consistency (15%)\n\n🎯 Score above 750 unlocks premium rewards and merchant priority!",
    ],
};

export default function ChatbotPage() {
    const insets = useSafeAreaInsets();
    const scrollRef = useRef(null);
    const [mode, setMode] = useState('test');
    const [messages, setMessages] = useState([
        { from: 'bot', text: "Hi! I'm EcoBot 🤖🌿\n\nI can help you test product sustainability or answer recycling questions. What would you like to do?" },
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);

    const sendMessage = (text) => {
        const msg = text || input.trim();
        if (!msg) return;
        setMessages((prev) => [...prev, { from: 'user', text: msg }]);
        setInput('');
        setTyping(true);

        setTimeout(() => {
            setTyping(false);
            const replies = botReplies[mode];
            const reply = replies[Math.floor(Math.random() * replies.length)];
            setMessages((prev) => [...prev, { from: 'bot', text: reply }]);
        }, 1500);
    };

    useEffect(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
    }, [messages, typing]);

    return (
        <KeyboardAvoidingView
            style={[s.container, { paddingTop: insets.top }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <ScreenHeader title="AI EcoBot" subtitle="Your sustainability assistant" />

            {/* Mode Tabs */}
            <View style={s.modeTabs}>
                <TouchableOpacity style={[s.tab, mode === 'test' && s.tabActive]} onPress={() => setMode('test')}>
                    <Sparkles size={14} color={mode === 'test' ? colors.green : colors.textMuted} />
                    <Text style={[s.tabText, mode === 'test' && s.tabTextActive]}>Product Test</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.tab, mode === 'ask' && s.tabActive]} onPress={() => setMode('ask')}>
                    <HelpCircle size={14} color={mode === 'ask' ? colors.blue : colors.textMuted} />
                    <Text style={[s.tabText, mode === 'ask' && s.tabTextActive]}>Ask Doubts</Text>
                </TouchableOpacity>
            </View>

            {/* Chat */}
            <ScrollView ref={scrollRef} style={s.chat} showsVerticalScrollIndicator={false}>
                {messages.map((msg, i) => (
                    <View key={i} style={[s.bubble, msg.from === 'user' ? s.userBubble : s.botBubble]}>
                        {msg.from === 'bot' && (
                            <View style={s.botAvatar}><Bot size={14} color={colors.green} /></View>
                        )}
                        <View style={[s.bubbleContent, msg.from === 'user' ? s.userContent : s.botContent]}>
                            <Text style={[s.msgText, msg.from === 'user' && { color: '#fff' }]}>{msg.text}</Text>
                        </View>
                        {msg.from === 'user' && (
                            <View style={s.userAvatar}><User size={14} color={colors.blue} /></View>
                        )}
                    </View>
                ))}

                {typing && (
                    <FadeInView>
                        <View style={[s.bubble, s.botBubble]}>
                            <View style={s.botAvatar}><Bot size={14} color={colors.green} /></View>
                            <View style={s.botContent}>
                                <Text style={s.typingDots}>●  ●  ●</Text>
                            </View>
                        </View>
                    </FadeInView>
                )}

                {/* Quick Suggestions */}
                {messages.length <= 2 && (
                    <FadeInUpView delay={300}>
                        <View style={s.suggestRow}>
                            {quickSuggestions[mode].map((q, i) => (
                                <TouchableOpacity key={i} style={s.suggestPill} onPress={() => sendMessage(q)}>
                                    <Text style={s.suggestText}>{q}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </FadeInUpView>
                )}
                <View style={{ height: 10 }} />
            </ScrollView>

            {/* Input */}
            <View style={[s.inputBar, { paddingBottom: insets.bottom + 8 }]}>
                <TextInput
                    style={s.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder={mode === 'test' ? 'Describe a product to test...' : 'Ask a question...'}
                    placeholderTextColor={colors.textMuted}
                    returnKeyType="send"
                    onSubmitEditing={() => sendMessage()}
                />
                <TouchableOpacity style={s.sendBtn} onPress={() => sendMessage()}>
                    <Send size={18} color={input.trim() ? colors.green : colors.textMuted} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16 },
    modeTabs: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 8 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder },
    tabActive: { backgroundColor: colors.greenBg, borderColor: colors.greenBorder },
    tabText: { fontSize: 13, fontWeight: '500', color: colors.textMuted },
    tabTextActive: { color: colors.green, fontWeight: '700' },
    chat: { flex: 1 },
    bubble: { flexDirection: 'row', marginBottom: 12, gap: 8 },
    botBubble: { justifyContent: 'flex-start' },
    userBubble: { justifyContent: 'flex-end' },
    botAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.greenBg, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
    userAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.blueBg, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
    bubbleContent: { maxWidth: '75%', borderRadius: 16, padding: 12 },
    botContent: { backgroundColor: colors.card, borderTopLeftRadius: 4 },
    userContent: { backgroundColor: colors.green, borderTopRightRadius: 4 },
    msgText: { fontSize: 13, color: colors.text, lineHeight: 20 },
    typingDots: { fontSize: 14, color: colors.textMuted, letterSpacing: 2 },
    suggestRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    suggestPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder },
    suggestText: { fontSize: 12, color: colors.textSecondary },
    inputBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8 },
    input: { flex: 1, backgroundColor: colors.card, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: colors.text, borderWidth: 1, borderColor: colors.cardBorder },
    sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.cardBorder },
});
