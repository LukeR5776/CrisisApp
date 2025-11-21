/**
 * Support Screen (Short-Form Scroll)
 * TikTok/Reels-style vertical video scrolling
 */

import { View, Text, Dimensions, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { fetchFamiliesWithVideos } from '../../lib/familiesService';
import { toggleLike, getBatchEngagementCounts, getBatchLikeStates, recordShare } from '../../lib/engagementService';
import { awardLikePoints, deductLikePoints, awardSharePoints } from '../../lib/pointsService';
import { PointsToast } from '../../components/PointsToast';
import type { CrisisFamily } from '../../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Individual video item with family metadata
 * Supports multiple videos per family by flattening the array
 */
interface VideoItem {
  id: string;
  url: string;
  familyId: string;
  familyName: string;
  familyLocation: string;
  familyStory: string;
  familyTags: string[];
  profileImage: string;
}

export default function SupportScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoPosts, setVideoPosts] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [videoLikes, setVideoLikes] = useState<Map<string, { liked: boolean; count: number }>>(new Map());

  // Points toast state
  const [showPointsToast, setShowPointsToast] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  const router = useRouter();

  // Pause videos when navigating away from this tab
  useFocusEffect(() => {
    setIsScreenFocused(true);
    return () => {
      setIsScreenFocused(false);
    };
  });

  // Fetch families with videos from Supabase on mount
  useEffect(() => {
    loadVideos();
  }, []);

  /**
   * Fisher-Yates shuffle algorithm
   * Randomizes array order for varied video display
   */
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFamiliesWithVideos();

      // Flatten video arrays - each family can have multiple videos
      // Transform into individual video items with family metadata
      const allVideos: VideoItem[] = data.flatMap(family =>
        (family.videoUrl || []).map((url, index) => ({
          id: `${family.id}-${index}`,
          url,
          familyId: family.id,
          familyName: family.name,
          familyLocation: family.location,
          familyStory: family.story,
          familyTags: family.tags,
          profileImage: family.profileImage,
        }))
      );

      // Shuffle videos for variety (families won't appear in order)
      const shuffledVideos = shuffleArray(allVideos);
      setVideoPosts(shuffledVideos);

      // Fetch engagement data for all videos
      const familyIds = data.map(f => f.id);
      const [countsMap, likeStatesMap] = await Promise.all([
        getBatchEngagementCounts(familyIds),
        getBatchLikeStates(familyIds),
      ]);

      // Build videoLikes map
      const likesMap = new Map<string, { liked: boolean; count: number }>();
      familyIds.forEach(familyId => {
        likesMap.set(familyId, {
          liked: likeStatesMap.get(familyId) || false,
          count: countsMap.get(familyId)?.likesCount || 0,
        });
      });
      setVideoLikes(likesMap);
    } catch (err) {
      console.error('Error loading videos:', err);
      setError('Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle like button press
   * Uses optimistic updates for instant UI feedback
   * Awards 1 point for new likes, deducts 1 point for unlikes (silent)
   */
  const handleLike = async (item: VideoItem) => {
    const currentState = videoLikes.get(item.familyId) || { liked: false, count: 0 };
    const wasLiked = currentState.liked;

    // Optimistic update
    const newLikesMap = new Map(videoLikes);
    newLikesMap.set(item.familyId, {
      liked: !currentState.liked,
      count: currentState.liked ? currentState.count - 1 : currentState.count + 1,
    });
    setVideoLikes(newLikesMap);

    // Make API call
    try {
      await toggleLike(item.familyId);

      // Award points for new likes, deduct for unlikes
      if (!wasLiked) {
        // New like - award point with toast
        const success = await awardLikePoints();
        if (success) {
          setPointsEarned(1);
          setShowPointsToast(true);
        }
      } else {
        // Unlike - silently deduct point (no toast)
        await deductLikePoints();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      const revertMap = new Map(videoLikes);
      revertMap.set(item.familyId, currentState);
      setVideoLikes(revertMap);
    }
  };

  /**
   * Handle share button press
   * Opens native share sheet
   * Awards 2 points for sharing
   */
  const handleShare = async (item: VideoItem) => {
    try {
      const result = await Share.share({
        message: `Check out ${item.familyName}'s story on Agape!\n\n${item.familyStory.substring(0, 150)}...`,
        title: `Support ${item.familyName}`,
      });

      // Only award points if user actually shared (not dismissed)
      if (result.action === Share.sharedAction) {
        // Record share in database (don't await - fire and forget)
        recordShare(item.familyId).catch(console.error);

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

  // Handle video scroll to track which video should be playing
  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  };

  // Render each video post
  const renderVideoPost = ({ item, index }: { item: VideoItem; index: number }) => {
    const isActive = index === activeIndex;

    return (
      <View style={styles.videoContainer}>
        {/* Video Player */}
        <View style={styles.videoWrapper}>
          {item.url ? (
            <Video
              source={{ uri: item.url }}
              style={styles.video}
              resizeMode={ResizeMode.COVER}
              shouldPlay={isActive && isScreenFocused}
              isLooping
              isMuted={false}
            />
          ) : (
            <View style={styles.videoPlaceholder}>
              <Text style={styles.placeholderText}>Video Content</Text>
            </View>
          )}
        </View>

        {/* Side Actions (Right side) */}
        <View style={styles.sideActions}>
          <TouchableOpacity
            style={styles.sideActionButton}
            onPress={() => handleLike(item)}
          >
            <Text style={styles.sideActionIcon}>
              {videoLikes.get(item.familyId)?.liked ? '❤️' : '🤍'}
            </Text>
            <Text style={styles.sideActionText}>
              {videoLikes.get(item.familyId)?.count || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sideActionButton}>
            <Text style={styles.sideActionIcon}>💬</Text>
            <Text style={styles.sideActionText}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sideActionButton}
            onPress={() => handleShare(item)}
          >
            <Text style={styles.sideActionIcon}>🔗</Text>
            <Text style={styles.sideActionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sideActionButton}
            onPress={() => router.push(`/family/${item.familyId}`)}
          >
            <Text style={styles.sideActionIcon}>👤</Text>
            <Text style={styles.sideActionText}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <Text style={styles.familyName}>{item.familyName}</Text>
          <Text style={styles.familyLocation}>{item.familyLocation}</Text>
          <Text style={styles.familyStory} numberOfLines={2}>
            {item.familyStory}
          </Text>
          <View style={styles.hashtags}>
            {item.familyTags.map((tag, i) => (
              <Text key={i} style={styles.hashtag}>{tag}</Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Points Toast Overlay */}
      <PointsToast
        points={pointsEarned}
        visible={showPointsToast}
        onComplete={() => setShowPointsToast(false)}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Support</Text>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadVideos}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty State */}
      {!loading && !error && videoPosts.length === 0 && (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No videos yet</Text>
          <Text style={styles.emptySubtext}>Check back soon for family stories</Text>
        </View>
      )}

      {/* Vertical Scrolling Video Feed */}
      {!loading && !error && videoPosts.length > 0 && (
        <FlatList
          data={videoPosts}
          renderItem={renderVideoPost}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={SCREEN_HEIGHT - 80} // Subtract tab bar height
          snapToAlignment="start"
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50,
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  videoContainer: {
    height: SCREEN_HEIGHT - 80, // Full screen minus tab bar
    width: '100%',
    position: 'relative',
  },
  videoWrapper: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  placeholderText: {
    color: '#666',
    fontSize: 18,
  },
  sideActions: {
    position: 'absolute',
    right: 12,
    bottom: 120,
    gap: 20,
  },
  sideActionButton: {
    alignItems: 'center',
  },
  sideActionIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  sideActionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 80,
  },
  familyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  familyLocation: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  familyStory: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: 8,
  },
  hashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hashtag: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
    color: '#fff',
  },
  errorText: {
    fontSize: 14,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
});
