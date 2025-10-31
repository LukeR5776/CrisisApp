/**
 * Supporter Profile Screen
 * Shows user stats, donation history, and recent posts
 */

import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const profile = user?.profile;

  // Safely get donation history (empty array if not available)
  const donationHistory: any[] = [];

  // Safely get recent posts (empty array if not available)
  const recentPosts: any[] = [];

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleSignOut}>
          <Text style={styles.icon}>🚪</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: profile?.avatar_url || 'https://via.placeholder.com/100' }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{profile?.display_name || user?.email}</Text>
          <Text style={styles.profileType}>
            {profile?.role === 'supporter' ? 'Supporter' : 'Crisis Family'}
          </Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>

        {/* Your Contributions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Contributions</Text>
            <Text style={styles.sectionSubtitle}>Current Stats</Text>
          </View>
          <TouchableOpacity style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>View Details ›</Text>
          </TouchableOpacity>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Points Earned</Text>
              <Text style={styles.statValue}>{profile?.points_earned || 0}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Donations</Text>
              <Text style={styles.statValue}>${profile?.total_donations || 0}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Level</Text>
              <Text style={styles.statValue}>{profile?.level || 1}</Text>
            </View>
          </View>
        </View>

        {/* Donation History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Donation History</Text>
            <Text style={styles.sectionSubtitle}>Your Support Contributions</Text>
          </View>
          {donationHistory.length > 0 && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>See All ›</Text>
            </TouchableOpacity>
          )}

          {donationHistory.length > 0 ? (
            donationHistory.map((donation) => (
              <View key={donation.id} style={styles.donationCard}>
                <Image
                  source={{ uri: donation.familyImage }}
                  style={styles.donationFamilyImage}
                />
                <View style={styles.donationInfo}>
                  <Text style={styles.donationFamily}>
                    Donation to {donation.familyName}
                  </Text>
                  <Text style={styles.donationAmount}>${donation.amount}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>💝</Text>
              <Text style={styles.emptyStateTitle}>No donations yet</Text>
              <Text style={styles.emptyStateText}>
                Start supporting families in need to see your donation history here
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Share Your Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Invite Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.donateButton]}>
            <Text style={[styles.actionButtonText, styles.donateButtonText]}>
              Donate Again
            </Text>
          </TouchableOpacity>
        </View>

        {/* Your Recent Posts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Recent Posts</Text>
            <Text style={styles.sectionSubtitle}>Keep Spreading the Word</Text>
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>See All ›</Text>
          </TouchableOpacity>

          {/* Placeholder posts */}
          <View style={styles.postsGrid}>
            <View style={styles.postCard}>
              <View style={styles.postPlaceholder}>
                <Text style={styles.postPlaceholderText}>
                  Happy to support those in need!
                </Text>
              </View>
              <View style={styles.postInfo}>
                <Text style={styles.postInfoText}>#Support</Text>
                <Text style={styles.postInfoName}>John Doe</Text>
              </View>
            </View>
            <View style={styles.postCard}>
              <View style={styles.postPlaceholder}>
                <Text style={styles.postPlaceholderText}>
                  Every little bit helps!
                </Text>
              </View>
              <View style={styles.postInfo}>
                <Text style={styles.postInfoText}>#Donations</Text>
                <Text style={styles.postInfoName}>John Doe</Text>
              </View>
            </View>
          </View>
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
  backButton: {
    fontSize: 32,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  viewDetailsButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    marginBottom: 16,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewAllButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0066FF',
  },
  donationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  donationFamilyImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  donationInfo: {
    flex: 1,
  },
  donationFamily: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  donationAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0066FF',
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  donateButton: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  donateButtonText: {
    color: '#fff',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  postsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  postCard: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  postImage: {
    width: '100%',
    height: 150,
  },
  postOverlay: {
    padding: 12,
  },
  postCaption: {
    fontSize: 12,
    marginBottom: 8,
  },
  postAuthor: {
    flexDirection: 'row',
    gap: 4,
  },
  postAuthorText: {
    fontSize: 10,
    color: '#0066FF',
  },
  postPlaceholder: {
    height: 150,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  postPlaceholderText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  postInfo: {
    padding: 12,
  },
  postInfoText: {
    fontSize: 10,
    color: '#0066FF',
    marginBottom: 4,
  },
  postInfoName: {
    fontSize: 10,
    color: '#999',
  },
});
