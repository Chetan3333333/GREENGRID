import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Home, ScanLine, Wallet, User } from 'lucide-react-native';
import { colors } from '../../constants/theme';

function TabIcon({ icon: Icon, label, focused }) {
    return (
        <View style={styles.tabItem}>
            <Icon
                size={22}
                color={focused ? colors.green : colors.textDark}
                strokeWidth={focused ? 2.5 : 1.8}
            />
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                {label}
            </Text>
            {focused && <View style={styles.dot} />}
        </View>
    );
}

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon={Home} label="Home" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon={ScanLine} label="Scan" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="wallet"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon={Wallet} label="Wallet" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon={User} label="Profile" focused={focused} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: 'rgba(10,15,26,0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
        height: 70,
        paddingBottom: 8,
        paddingTop: 8,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: colors.textDark,
    },
    tabLabelActive: {
        color: colors.green,
        fontWeight: '700',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.green,
        marginTop: 1,
    },
});
