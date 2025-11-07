/**
 * Crisis Family Profile Screen (View-Only)
 * Detailed profile of a crisis family with their story, needs, and fundraising info
 */

import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { fetchFamilyById } from '../../lib/familiesService';
import type { CrisisFamily } from '../../types';

export default function FamilyProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [family, setFamily] = useState<CrisisFamily | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch family from Supabase when ID changes
  useEffect(() => {
    if (typeof id === 'string') {
      loadFamily(id);
    }
  }, [id]);

  const loadFamily = async (familyId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFamilyById(familyId);
      setFamily(data);
    } catch (err) {
      console.error('Error loading family:', err);
      setError('Failed to load family profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fundraising Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066FF" />
          <Text style={styles.loadingText}>Loading family profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !family) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fundraising Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {error || 'Family not found'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => typeof id === 'string' && loadFamily(id)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate fundraising progress
  const progress = (family.fundraisingCurrent / family.fundraisingGoal) * 100;

  // Handle external fundraising link
  const handleDonateNow = () => {
    Linking.openURL(family.fundraisingLink);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fundraising Profile</Text>
        <TouchableOpacity>
          <Text style={styles.menuButton}>⋯</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Family Header */}
        <View style={styles.familyHeader}>
          <Image
            source={{ uri: family.profileImage }}
            style={styles.familyImage}
          />
          <Text style={styles.familyName}>{family.name}</Text>
          <Text style={styles.familyLocation}>{family.location}</Text>
        </View>

        {/* Journey Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Journey of {family.name}</Text>
          <Text style={styles.familyStory}>{family.story}</Text>
        </View>

        {/* Family Story (Extended) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Family Story</Text>
            <TouchableOpacity>
              <Text style={styles.readMore}>Read More ›</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.storyTitle}>Our Journey</Text>
          <Text style={styles.storyText}>
            {family.story} We are grateful for any support as we navigate this difficult time and work towards rebuilding our lives.
          </Text>
        </View>

        {/* Situation Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Situation Overview</Text>
          <Text style={styles.situationText}>
            Living in a refugee camp with limited access to food, water, and medical care.
          </Text>
        </View>

        {/* What We Need */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>What We Need</Text>
            <TouchableOpacity style={styles.donateNowButton} onPress={handleDonateNow}>
              <Text style={styles.donateNowText}>Donate now ›</Text>
            </TouchableOpacity>
          </View>

          {family.needs.map((need) => (
            <View key={need.id} style={styles.needCard}>
              <View style={styles.needIcon}>
                <Text style={styles.needIconText}>{need.icon}</Text>
              </View>
              <View style={styles.needContent}>
                <Text style={styles.needTitle}>{need.title}</Text>
                <Text style={styles.needDescription}>{need.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareButtonText}>Share Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.connectButton}>
            <Text style={styles.connectButtonText}>Connect with Family</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.donateButton} onPress={handleDonateNow}>
            <Text style={styles.donateButtonText}>Donate Now</Text>
          </TouchableOpacity>
        </View>

        {/* Fundraising Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Fundraising Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.fundraisingStats}>
            <View>
              <Text style={styles.fundingAmount}>
                ${family.fundraisingCurrent.toLocaleString()}
              </Text>
              <Text style={styles.fundingLabel}>raised</Text>
            </View>
            <View style={styles.fundingGoal}>
              <Text style={styles.fundingAmount}>
                ${family.fundraisingGoal.toLocaleString()}
              </Text>
              <Text style={styles.fundingLabel}>goal</Text>
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
  menuButton: {
    fontSize: 24,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  familyHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  familyImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  familyName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  familyLocation: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  readMore: {
    fontSize: 14,
    color: '#0066FF',
    fontWeight: '500',
  },
  familyStory: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  storyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  situationText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  donateNowButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#000',
    borderRadius: 20,
  },
  donateNowText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  needCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  needIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  needIconText: {
    fontSize: 24,
  },
  needContent: {
    flex: 1,
  },
  needTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  needDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  shareButton: {
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  connectButton: {
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  donateButton: {
    paddingVertical: 14,
    backgroundColor: '#000',
    borderRadius: 8,
    alignItems: 'center',
  },
  donateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066FF',
  },
  fundraisingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fundingAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0066FF',
  },
  fundingLabel: {
    fontSize: 12,
    color: '#666',
  },
  fundingGoal: {
    alignItems: 'flex-end',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0066FF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
