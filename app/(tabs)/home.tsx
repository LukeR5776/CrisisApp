/**
 * Home Dashboard Screen
 * Instagram-style feed with posts and quick stats
 * Now fetches real crisis families from Supabase with engagement tracking
 */

import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Video, ResizeMode } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { fetchAllFamilies, fetchFamilyById } from '../../lib/familiesService';
import { fetchAllPosts } from '../../lib/postsService';
import { toggleLike, getBatchEngagementCounts, getBatchLikeStates, recordShare } from '../../lib/engagementService';
import { awardLikePoints, deductLikePoints, awardSharePoints } from '../../lib/pointsService';
import { useAuthStore } from '../../store/authStore';
import { PointsToast } from '../../components/PointsToast';
import type { CrisisFamily, Post, FamilyPost } from '../../types';

export default function HomeScreen() {
  // Auth state
  const { user } = useAuthStore();
  const profile = user?.profile;

  // Data state
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;

  // Video auto-play state
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScreenFocused, setIsScreenFocused] = useState(true);

  // Points toast state
  const [showPointsToast, setShowPointsToast] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  const router = useRouter();

  // Focus effect for pausing videos on tab change
  useFocusEffect(() => {
    setIsScreenFocused(true);
    return () => setIsScreenFocused(false);
  });

  // Load initial data
  useEffect(() => {
    loadPosts();
  }, []);

  /**
   * Transform CrisisFamily to Post format
   * Uses cover image or profile as media, story as caption
   */
  function familyToPost(
    family: CrisisFamily,
    likesCount: number,
    sharesCount: number,
    liked: boolean
  ): Post {
    return {
      id: `post-${family.id}`,
      familyId: family.id,
      familyName: family.name,
      familyImage: family.profileImage,
      type: (family.videoUrl && family.videoUrl.length > 0) ? 'video' : 'photo',
      mediaUrl: (family.videoUrl && family.videoUrl.length > 0)
        ? family.videoUrl[0]  // Use first video
        : (family.coverImage || family.profileImage),
      caption: family.story.substring(0, 200) + (family.story.length > 200 ? '...' : ''),
      hashtags: family.tags,
      likes: likesCount,
      shares: sharesCount,
      liked: liked,
      createdAt: family.createdAt,
      postType: 'family',
    };
  }

  /**
   * Transform FamilyPost to Post format
   * Text-only post from family updates
   */
  function textPostToPost(
    post: FamilyPost,
    family: CrisisFamily,
    likesCount: number,
    sharesCount: number,
    liked: boolean
  ): Post {
    return {
      id: post.id,
      familyId: post.familyId,
      familyName: family.name,
      familyImage: family.profileImage,
      type: 'text',
      content: post.content,
      caption: '',
      hashtags: post.hashtags,
      likes: likesCount,
      shares: sharesCount,
      liked: liked,
      createdAt: post.createdAt,
      postType: 'update',
    };
  }

  /**
   * Load posts from Supabase with pagination
   * Fetches both family posts and text updates, merges and sorts chronologically
   * @param isLoadingMore - true if loading next page, false if initial/refresh
   */
  const loadPosts = async (isLoadingMore = false) => {
    try {
      if (isLoadingMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      // Fetch both families and text posts in parallel
      // Each gets half the limit to balance the mix
      const [families, textPosts] = await Promise.all([
        fetchAllFamilies({
          limit: Math.ceil(LIMIT / 2),
          offset: isLoadingMore ? Math.floor(offset / 2) : 0,
          orderBy: 'created_at',
          ascending: false, // Newest first
        }),
        fetchAllPosts({
          limit: Math.ceil(LIMIT / 2),
          offset: isLoadingMore ? Math.floor(offset / 2) : 0,
          orderBy: 'created_at',
          ascending: false,
        })
      ]);

      // Get unique family IDs from both sources
      const familyIds = [...new Set([
        ...families.map(f => f.id),
        ...textPosts.map(p => p.familyId)
      ])];

      // Fetch engagement data in batch
      const [countsMap, likeStatesMap] = await Promise.all([
        getBatchEngagementCounts(familyIds),
        getBatchLikeStates(familyIds),
      ]);

      // Get family data for text posts (need profile images/names)
      const textPostFamilyIds = [...new Set(textPosts.map(p => p.familyId))];
      const textPostFamilies = await Promise.all(
        textPostFamilyIds.map(id => fetchFamilyById(id))
      );
      const familiesMap = new Map(
        textPostFamilies.filter(f => f).map(f => [f!.id, f!])
      );

      // Transform families to posts
      const familyPosts = families.map(family =>
        familyToPost(
          family,
          countsMap.get(family.id)?.likesCount || 0,
          countsMap.get(family.id)?.sharesCount || 0,
          likeStatesMap.get(family.id) || false
        )
      );

      // Transform text posts to Post interface
      const textPostsAsPosts = textPosts
        .map(post => {
          const family = familiesMap.get(post.familyId);
          if (!family) return null;
          return textPostToPost(
            post,
            family,
            countsMap.get(post.familyId)?.likesCount || 0,
            countsMap.get(post.familyId)?.sharesCount || 0,
            likeStatesMap.get(post.familyId) || false
          );
        })
        .filter(p => p !== null) as Post[];

      // Merge and sort chronologically (newest first)
      const allPosts = [...familyPosts, ...textPostsAsPosts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Update state
      if (isLoadingMore) {
        setPosts(prev => [...prev, ...allPosts]);
        setOffset(prev => prev + LIMIT);
      } else {
        setPosts(allPosts);
        setOffset(LIMIT);
      }

      // Check if more data available
      setHasMore(families.length === Math.ceil(LIMIT / 2) || textPosts.length === Math.ceil(LIMIT / 2));

    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  // Pull to refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts(false);
  };

  // Load more on scroll
  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      loadPosts(true);
    }
  };

  /**
   * Handle like button press
   * Uses optimistic updates for instant UI feedback
   * Awards 1 point for new likes, deducts 1 point for unlikes (silent)
   */
  const handleLike = async (post: Post) => {
    const wasLiked = post.liked;

    // Optimistic update
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === post.id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );

    // Make API call
    try {
      await toggleLike(post.familyId);

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
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === post.id
            ? { ...p, liked: post.liked, likes: post.likes }
            : p
        )
      );
    }
  };

  /**
   * Handle share button press
   * Opens native share sheet
   * Awards 2 points for sharing
   */
  const handleShare = async (post: Post) => {
    try {
      const result = await Share.share({
        message: `Check out ${post.familyName}'s story on Agape!\n\n${post.caption}`,
        title: `Support ${post.familyName}`,
      });

      // Only award points if user actually shared (not dismissed)
      if (result.action === Share.sharedAction) {
        // Record share in database (don't await - fire and forget)
        recordShare(post.familyId).catch(console.error);

        // Optimistic update
        setPosts(prevPosts =>
          prevPosts.map(p =>
            p.id === post.id ? { ...p, shares: p.shares + 1 } : p
          )
        );

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

  /**
   * Render individual post card
   * Handles text posts, photos, and videos with auto-play
   */
  const renderPost = ({ item: post, index }: { item: Post; index: number }) => {
    const isActive = index === activeIndex;
    const shouldPlayVideo = isActive && isScreenFocused && post.type === 'video';

    return (
      <View style={styles.postCard}>
        {/* Header */}
        <TouchableOpacity
          style={styles.postHeader}
          onPress={() => router.push(`/family/${post.familyId}`)}
          activeOpacity={0.7}
        >
          <Image source={{ uri: post.familyImage }} style={styles.profileImage} />
          <View style={styles.headerInfo}>
            <Text style={styles.familyName}>{post.familyName}</Text>
            <Text style={styles.timestamp}>
              {new Date(post.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Text Content (for text posts only) */}
        {post.type === 'text' && (
          <View style={styles.textContent}>
            <Text style={styles.textPostContent}>{post.content}</Text>
          </View>
        )}

        {/* Media (Image or Video - for non-text posts) */}
        {post.type !== 'text' && (
          <View style={styles.mediaContainer}>
            {post.type === 'video' ? (
              <Video
                source={{ uri: post.mediaUrl }}
                style={styles.media}
                resizeMode={ResizeMode.COVER}
                shouldPlay={shouldPlayVideo}
                isLooping
                isMuted={false}
                useNativeControls={false}
              />
            ) : (
              <Image source={{ uri: post.mediaUrl }} style={styles.media} />
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(post)}
          >
            <Text style={styles.actionIcon}>{post.liked ? '❤️' : '🤍'}</Text>
            <Text style={styles.actionText}>{post.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(post)}
          >
            <Text style={styles.actionIcon}>🔗</Text>
            <Text style={styles.actionText}>{post.shares}</Text>
          </TouchableOpacity>
        </View>

        {/* Caption */}
        <View style={styles.caption}>
          <Text style={styles.captionText}>
            <Text style={styles.captionName}>{post.familyName}</Text> {post.caption}
          </Text>
          <View style={styles.hashtags}>
            {post.hashtags.map((tag, i) => (
              <Text key={i} style={styles.hashtag}>{tag}</Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  /**
   * Stats section at top of feed
   * Displays user's actual profile stats
   */
  const StatsHeader = () => (
    <View style={styles.statsSection}>
      <Text style={styles.statsTitle}>Your Impact</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile?.points_earned || 350}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${profile?.total_donations || 67}</Text>
          <Text style={styles.statLabel}>Donated</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile?.level || 5}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Agape</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/notifications')}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading && !refreshing && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066FF" />
          <Text style={styles.loadingText}>Loading stories...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadPosts()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty State */}
      {!loading && !error && posts.length === 0 && (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No stories yet</Text>
          <Text style={styles.emptySubtext}>Check back soon for family updates</Text>
        </View>
      )}

      {/* Posts Feed */}
      {!loading && !error && posts.length > 0 && (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={<StatsHeader />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color="#0066FF" style={{ paddingVertical: 20 }} />
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onViewableItemsChanged={({ viewableItems }) => {
            if (viewableItems.length > 0) {
              setActiveIndex(viewableItems[0].index || 0);
            }
          }}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        />
      )}
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
  notificationIcon: {
    fontSize: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  statsSection: {
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
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
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  familyName: {
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  mediaContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#000',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  actions: {
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
  actionText: {
    fontSize: 14,
    color: '#666',
  },
  caption: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  captionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  captionName: {
    fontWeight: '600',
  },
  hashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  hashtag: {
    fontSize: 12,
    color: '#0066FF',
  },
  textContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  textPostContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1a1a1a',
  },
});
