/**
 * Notifications Screen
 * Shows user notifications and activity updates
 */

import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

export default function NotificationsScreen() {
  // Mock notifications data - updated to reflect current app state
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'donation',
      message: 'Your donation to The Millican Family was successful!',
      time: '2 hours ago',
      unread: true,
    },
    {
      id: '2',
      type: 'update',
      message: 'The Hewitt Family posted a new update',
      time: '5 hours ago',
      unread: true,
    },
    {
      id: '3',
      type: 'milestone',
      message: 'You reached Level 5! 🎉',
      time: '1 day ago',
      unread: false,
    },
    {
      id: '4',
      type: 'donation',
      message: 'Your donation to The Zyad Family was successful!',
      time: '3 days ago',
      unread: false,
    },
    {
      id: '5',
      type: 'update',
      message: 'Mohammed and Omar posted a new update',
      time: '5 days ago',
      unread: false,
    },
  ]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, unread: false })));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markAllRead}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              notification.unread && styles.unreadCard,
            ]}
          >
            <View style={styles.notificationIcon}>
              <Text style={styles.iconText}>
                {notification.type === 'donation' && '💰'}
                {notification.type === 'badge' && '🏆'}
                {notification.type === 'update' && '📢'}
                {notification.type === 'milestone' && '⭐'}
              </Text>
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationMessage}>
                {notification.message}
              </Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
            {notification.unread && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}

        {/* Empty state if no notifications */}
        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>
              You'll see updates about your donations and activity here
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  markAllRead: {
    fontSize: 14,
    color: '#0066FF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  unreadCard: {
    backgroundColor: '#f8f9ff',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0066FF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 48,
  },
});
