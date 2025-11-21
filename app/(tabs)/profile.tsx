/**
 * Supporter Profile Screen
 * Shows user stats, donation history, and recent posts
 */

import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const profile = user?.profile;

  // Mock donation history totaling $67
  const donationHistory = [
    {
      id: '1',
      familyName: 'The Millican Family',
      familyImage: 'https://zlthbhzfnozzrkvjxxuz.supabase.co/storage/v1/object/public/family-images/millican-profile.jpg',
      amount: 25,
      date: '2024-11-15',
      pointsEarned: 250,
    },
    {
      id: '2',
      familyName: 'The Hewitt Family',
      familyImage: 'https://zlthbhzfnozzrkvjxxuz.supabase.co/storage/v1/object/public/family-images/hewitt-profile.jpg',
      amount: 20,
      date: '2024-11-10',
      pointsEarned: 200,
    },
    {
      id: '3',
      familyName: 'Mohammed and Omar',
      familyImage: 'https://via.placeholder.com/100',
      amount: 15,
      date: '2024-11-05',
      pointsEarned: 150,
    },
    {
      id: '4',
      familyName: 'The Zyad Family',
      familyImage: 'https://via.placeholder.com/100',
      amount: 7,
      date: '2024-11-01',
      pointsEarned: 70,
    },
  ];

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

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out my supporter profile on Agape! I've donated $${profile?.total_donations || 67} to families in need. Join me in making a difference!`,
        title: 'My Agape Profile',
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  const handleKeepSupporting = () => {
    router.push('/(tabs)/stories');
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

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Points Earned</Text>
              <Text style={styles.statValue}>{profile?.points_earned || 350}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Donations</Text>
              <Text style={styles.statValue}>${profile?.total_donations || 67}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Level</Text>
              <Text style={styles.statValue}>{profile?.level || 5}</Text>
            </View>
          </View>
        </View>

        {/* Donation History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Donation History</Text>
            <Text style={styles.sectionSubtitle}>Your Support Contributions</Text>
          </View>

          {donationHistory.map((donation) => (
            <View key={donation.id} style={styles.donationCard}>
              <Image
                source={{ uri: donation.familyImage }}
                style={styles.donationFamilyImage}
              />
              <View style={styles.donationInfo}>
                <Text style={styles.donationFamily}>
                  {donation.familyName}
                </Text>
                <Text style={styles.donationDate}>
                  {new Date(donation.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
              <Text style={styles.donationAmount}>${donation.amount}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShareProfile}>
            <Text style={styles.actionButtonText}>Share Your Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.donateButton]} onPress={handleKeepSupporting}>
            <Text style={[styles.actionButtonText, styles.donateButtonText]}>
              Keep Supporting
            </Text>
          </TouchableOpacity>
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
  donationDate: {
    fontSize: 12,
    color: '#666',
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
});
