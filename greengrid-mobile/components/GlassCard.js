import { View, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';

export default function GlassCard({ children, style, small, green, gold, blue, purple }) {
    const borderColor = green ? colors.greenBorder
        : gold ? colors.goldBorder
            : blue ? colors.blueBorder
                : purple ? 'rgba(139,92,246,0.15)'
                    : colors.cardBorder;

    const bg = green ? colors.greenBg
        : gold ? colors.goldBg
            : blue ? colors.blueBg
                : purple ? colors.purpleBg
                    : colors.card;

    return (
        <View style={[
            styles.card,
            small && styles.small,
            { borderColor, backgroundColor: bg },
            style,
        ]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: radius.lg,
        borderWidth: 1,
        padding: spacing.lg,
    },
    small: {
        padding: spacing.md,
    },
});
