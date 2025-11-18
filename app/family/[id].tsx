/**
 * Crisis Family Profile Screen (View-Only)
 * Detailed profile of a crisis family with their story, needs, and fundraising info
 */

import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Linking, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Video, ResizeMode } from 'expo-av';
import { fetchFamilyById } from '../../lib/familiesService';
import type { CrisisFamily } from '../../types';

export default function FamilyProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [family, setFamily] = useState<CrisisFamily | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);

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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Journey of {family.name}</Text>
            {family.story.length > 150 && (
              <TouchableOpacity onPress={() => setStoryExpanded(!storyExpanded)}>
                <Text style={styles.readMore}>
                  {storyExpanded ? 'Read less ‹' : 'Read more ›'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.familyStory}>
            {storyExpanded || family.story.length <= 150
              ? family.story
              : `${family.story.substring(0, 150)}...`}
          </Text>
        </View>

        {/* Video Gallery - only show if family has videos */}
        {family.videoUrl && family.videoUrl.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Video Stories ({family.videoUrl.length})
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.videoGallery}
            >
              {family.videoUrl.map((videoUrl, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.videoThumbnail}
                  onPress={() => setSelectedVideo(videoUrl)}
                  activeOpacity={0.9}
                >
                  {/* Video component with poster as thumbnail */}
                  <Video
                    source={{ uri: videoUrl }}
                    style={styles.videoPreview}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={false}
                    isMuted={true}
                  />

                  {/* Play icon overlay */}
                  <View style={styles.playOverlay}>
                    <Text style={styles.playIcon}>▶</Text>
                  </View>

                  {/* Video number badge */}
                  <View style={styles.videoBadge}>
                    <Text style={styles.videoBadgeText}>Video {index + 1}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Situation Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Situation Overview</Text>
          <Text style={styles.situationText}>
            {family.situation}
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

      {/* Video Player Modal */}
      <Modal
        visible={selectedVideo !== null}
        animationType="fade"
        transparent={false}
        onRequestClose={() => {
          setSelectedVideo(null);
          videoRef.current?.pauseAsync();
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setSelectedVideo(null);
                videoRef.current?.pauseAsync();
              }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Video
            ref={videoRef}
            source={{ uri: selectedVideo || '' }}
            style={styles.fullscreenVideo}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={true}
            isLooping={false}
            useNativeControls={true}
          />
        </SafeAreaView>
      </Modal>
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
  videoGallery: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 10,
  },
  videoThumbnail: {
    width: 120,
    height: 213, // 9:16 portrait aspect ratio (120 × 1.775)
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playIcon: {
    fontSize: 40,
    color: '#fff',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  videoBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
  },
  fullscreenVideo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
