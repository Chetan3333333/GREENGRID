import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * A drop-in replacement for reanimated's entering animations.
 * Returns an Animated.Value for opacity and translateY that auto-animates on mount.
 */
export function useFadeInUp(delay = 0, duration = 400) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(18)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: 0, duration, useNativeDriver: true }),
            ]).start();
        }, delay);
        return () => clearTimeout(timer);
    }, []);

    return { opacity, transform: [{ translateY }] };
}

export function useFadeIn(delay = 0, duration = 300) {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }).start();
        }, delay);
        return () => clearTimeout(timer);
    }, []);

    return { opacity };
}

/**
 * Convenience component — wraps children with fade-in-up animation.
 */
export function FadeInUpView({ delay = 0, duration = 400, style, children }) {
    const anim = useFadeInUp(delay, duration);
    return <Animated.View style={[anim, style]}>{children}</Animated.View>;
}

export function FadeInView({ delay = 0, duration = 300, style, children }) {
    const anim = useFadeIn(delay, duration);
    return <Animated.View style={[anim, style]}>{children}</Animated.View>;
}
