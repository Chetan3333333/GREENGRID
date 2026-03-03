export const colors = {
    bg: '#0a0f1a',
    bgLight: '#0f1726',
    card: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.06)',
    green: '#10b981',
    greenDark: '#059669',
    greenLight: '#34d399',
    greenBg: 'rgba(16,185,129,0.08)',
    greenBorder: 'rgba(16,185,129,0.15)',
    gold: '#f59e0b',
    goldBg: 'rgba(245,158,11,0.1)',
    goldBorder: 'rgba(245,158,11,0.2)',
    blue: '#3b82f6',
    blueBg: 'rgba(59,130,246,0.08)',
    blueBorder: 'rgba(59,130,246,0.15)',
    purple: '#8b5cf6',
    purpleBg: 'rgba(139,92,246,0.08)',
    red: '#ef4444',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    textDark: '#475569',
    white: '#ffffff',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
};

export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
};

export const fonts = {
    regular: { fontWeight: '400' },
    medium: { fontWeight: '500' },
    semibold: { fontWeight: '600' },
    bold: { fontWeight: '700' },
    extrabold: { fontWeight: '800' },
};

export const cardStyle = {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
};

export const cardSmStyle = {
    ...cardStyle,
    padding: spacing.md,
};

export const badgeStyle = {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    fontSize: 11,
    fontWeight: '600',
};

export const badgeGreen = {
    ...badgeStyle,
    backgroundColor: colors.greenBg,
    borderWidth: 1,
    borderColor: colors.greenBorder,
    color: colors.green,
};

export const badgeGold = {
    ...badgeStyle,
    backgroundColor: colors.goldBg,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    color: colors.gold,
};
