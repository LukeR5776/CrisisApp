/**
 * Home Dashboard Screen
 * Instagram-style feed with posts and quick stats
 */

import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockPosts, mockUserStats } from '../../data/mockData';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Notifications */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CrisisApp</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats Section */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Impact</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockUserStats.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak 🔥</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockUserStats.pointsEarned}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Lvl {mockUserStats.level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>
        </View>

        {/* Feed Section */}
        <View style={styles.feedSection}>
          <Text style={styles.sectionTitle}>Latest Stories</Text>

          {mockPosts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              {/* Post Header */}
              <View style={styles.postHeader}>
                <Image
                  source={{ uri: post.familyImage }}
                  style={styles.postAuthorImage}
                />
                <View style={styles.postHeaderInfo}>
                  <Text style={styles.postAuthorName}>{post.familyName}</Text>
                  <Text style={styles.postDate}>{post.createdAt}</Text>
                </View>
              </View>

              {/* Post Media */}
              <Image
                source={{ uri: post.mediaUrl }}
                style={styles.postMedia}
                resizeMode="cover"
              />

              {/* Post Actions */}
              <View style={styles.postActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>❤️</Text>
                  <Text style={styles.actionCount}>{post.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>💬</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>🔗</Text>
                  <Text style={styles.actionCount}>{post.shares}</Text>
                </TouchableOpacity>
              </View>

              {/* Post Caption */}
              <View style={styles.postCaption}>
                <Text style={styles.captionText}>
                  <Text style={styles.captionAuthor}>{post.familyName}</Text>
                  {' '}{post.caption}
                </Text>
              </View>
            </View>
          ))}
        </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  notificationButton: {
    padding: 8,
  },
  notificationIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: '#f8f9fa',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0066FF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  feedSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postCard: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postAuthorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postHeaderInfo: {
    flex: 1,
  },
  postAuthorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  postDate: {
    fontSize: 12,
    color: '#666',
  },
  postMedia: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  postActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionCount: {
    fontSize: 14,
    color: '#666',
  },
  postCaption: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  captionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  captionAuthor: {
    fontWeight: '600',
  },
});
