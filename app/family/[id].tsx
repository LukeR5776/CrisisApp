/**
 * Crisis Family Profile Screen (View-Only)
 * Detailed profile of a crisis family with their story, needs, and fundraising info
 */

import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Video, ResizeMode } from 'expo-av';
import * as WebBrowser from 'expo-web-browser';
import { fetchFamilyById } from '../../lib/familiesService';
import { fetchPostsByFamily } from '../../lib/postsService';
import { recordShare } from '../../lib/engagementService';
import { awardSharePoints } from '../../lib/pointsService';
import { PointsToast } from '../../components/PointsToast';
import type { CrisisFamily, FamilyPost } from '../../types';

export default function FamilyProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [family, setFamily] = useState<CrisisFamily | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'videos' | 'updates'>('videos');
  const [textPosts, setTextPosts] = useState<FamilyPost[]>([]);
  const videoRef = useRef<Video>(null);

  // Points toast state
  const [showPointsToast, setShowPointsToast] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

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

      // Fetch both family data and text posts in parallel
      const [familyData, postsData] = await Promise.all([
        fetchFamilyById(familyId),
        fetchPostsByFamily(familyId)
      ]);

      setFamily(familyData);
      setTextPosts(postsData);
    } catch (err) {
      console.error('Error loading family:', err);
      setError('Failed to load family profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle share button press
   * Opens native share sheet
   * Awards 2 points for sharing
   */
  const handleShare = async () => {
    if (!family) return;

    try {
      const result = await Share.share({
        message: `Check out ${family.name}'s profile on Agape!\n\n${family.story.substring(0, 150)}...\n\nSupport them at: ${family.fundraisingLink}`,
        title: `Support ${family.name}`,
      });

      // Only award points if user actually shared (not dismissed)
      if (result.action === Share.sharedAction) {
        // Record share in database (don't await - fire and forget)
        recordShare(family.id).catch(console.error);

        // Award points for sharing
        const success = await awardSharePoints();
        if (success) {
          setPointsEarned(2);
          setShowPointsToast(true);
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
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
  const handleDonateNow = async () => {
    if (!family) return;

    try {
      // Pause video if playing to prevent memory issues
      if (selectedVideo && videoRef.current) {
        await videoRef.current.pauseAsync();
      }

      // Open in-app browser (much better lifecycle management)
      const result = await WebBrowser.openBrowserAsync(family.fundraisingLink, {
        dismissButtonStyle: 'done',
        readerMode: false,
        controlsColor: '#0066FF',
        toolbarColor: '#ffffff',
      });

      // User returned from browser - app state is preserved
      console.log('Browser closed:', result.type);

      // Optionally resume video if it was playing
      // (not resuming by default as user likely didn't want it playing)

    } catch (error) {
      console.error('Error opening fundraising link:', error);
      Alert.alert(
        'Error',
        'Failed to open the fundraising page. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Points Toast Overlay */}
      <PointsToast
        points={pointsEarned}
        visible={showPointsToast}
        onComplete={() => setShowPointsToast(false)}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fundraising Profile</Text>
        <View style={{ width: 24 }} />
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

        {/* Tabs: Videos | Updates */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
            onPress={() => setActiveTab('videos')}
          >
            <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
              Videos ({family.videoUrl?.length || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'updates' && styles.activeTab]}
            onPress={() => setActiveTab('updates')}
          >
            <Text style={[styles.tabText, activeTab === 'updates' && styles.activeTabText]}>
              Updates ({textPosts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Videos Tab */}
        {activeTab === 'videos' && family.videoUrl && family.videoUrl.length > 0 && (
          <View style={styles.section}>
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

        {/* Videos Tab - Empty State */}
        {activeTab === 'videos' && (!family.videoUrl || family.videoUrl.length === 0) && (
          <View style={styles.section}>
            <Text style={styles.emptyText}>No videos yet</Text>
          </View>
        )}

        {/* Updates Tab */}
        {activeTab === 'updates' && (
          <View style={styles.section}>
            {textPosts.length === 0 ? (
              <Text style={styles.emptyText}>No updates yet</Text>
            ) : (
              textPosts.map(post => (
                <View key={post.id} style={styles.updateCard}>
                  <Text style={styles.updateContent}>{post.content}</Text>
                  <View style={styles.updateMeta}>
                    <Text style={styles.updateDate}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Text>
                    <View style={styles.updateHashtags}>
                      {post.hashtags.map((tag, i) => (
                        <Text key={i} style={styles.hashtag}>{tag}</Text>
                      ))}
                    </View>
                  </View>
                </View>
              ))
            )}
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
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>Share Profile</Text>
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
        <View style={styles.modalContainer}>
          <SafeAreaView style={styles.modalSafeArea}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setSelectedVideo(null);
                videoRef.current?.pauseAsync();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </SafeAreaView>

          <Video
            ref={videoRef}
            source={{ uri: selectedVideo || '' }}
            style={styles.fullscreenVideo}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={true}
            isLooping={false}
            useNativeControls={true}
          />
        </View>
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
  modalSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 1000,
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
    zIndex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0066FF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0066FF',
    fontWeight: '600',
  },
  updateCard: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
  },
  updateContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  updateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updateDate: {
    fontSize: 12,
    color: '#666',
  },
  updateHashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hashtag: {
    fontSize: 12,
    color: '#0066FF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
});
