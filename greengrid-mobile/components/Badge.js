import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';

export default function Badge({ children, green, gold, blue, purple, red, style }) {
    const color = green ? colors.green
        : gold ? colors.gold
            : blue ? colors.blue
                : purple ? colors.purple
                    : red ? colors.red
                        : colors.textSecondary;

    const bg = green ? colors.greenBg
        : gold ? colors.goldBg
            : blue ? colors.blueBg
                : purple ? colors.purpleBg
                    : red ? 'rgba(239,68,68,0.1)'
                        : colors.card;

    const border = green ? colors.greenBorder
        : gold ? colors.goldBorder
            : blue ? colors.blueBorder
                : purple ? 'rgba(139,92,246,0.2)'
                    : red ? 'rgba(239,68,68,0.2)'
                        : colors.cardBorder;

    return (
        <View style={[styles.badge, { backgroundColor: bg, borderColor: border }, style]}>
            <Text style={[styles.text, { color }]}>{children}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 11,
        fontWeight: '600',
    },
});
