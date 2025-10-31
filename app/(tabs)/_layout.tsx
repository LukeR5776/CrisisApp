/**
 * Tab Navigation Layout
 * Bottom navigation bar with Home, Stories, Support, Notifications, Profile
 */

import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/authStore';

// Simple icon component using emojis for now
// TODO: Replace with proper icon library (e.g., expo-vector-icons)
function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return (
    <View style={styles.iconContainer}>
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
    </View>
  );
}

export default function TabLayout() {
  const { user, initialized } = useAuthStore();

  // Don't render tabs until we know the auth state
  // Note: Root layout handles all navigation redirects
  if (!initialized || !user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#0066FF',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stories"
        options={{
          title: 'Stories',
          tabBarIcon: ({ color }) => <TabIcon emoji="📖" color={color} />,
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Support',
          tabBarIcon: ({ color }) => <TabIcon emoji="💙" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <TabIcon emoji="🔔" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
