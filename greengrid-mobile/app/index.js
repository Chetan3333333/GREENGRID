import { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../constants/theme';

export default function SplashPage() {
    const router = useRouter();
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
        ]).start();

        const timer = setTimeout(() => router.replace('/(tabs)'), 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={s.container}>
            <Animated.View style={{ opacity, transform: [{ scale }], alignItems: 'center' }}>
                <Text style={s.emoji}>🌿</Text>
                <Text style={s.title}>GreenGrid</Text>
                <Text style={s.sub}>Smart Recycling Exchange</Text>
            </Animated.View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
    emoji: { fontSize: 56 },
    title: { fontSize: 36, fontWeight: '800', color: colors.text, marginTop: 12 },
    sub: { fontSize: 14, color: colors.textSecondary, marginTop: 6, letterSpacing: 2 },
});
