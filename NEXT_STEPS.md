# Next Steps: Home Feed Refactor (IN PROGRESS)

## Current Status: Foundation Complete ✅

This session completed the foundational infrastructure for the Instagram-style home feed with real backend data. The next session needs to complete the UI implementation.

---

## What Was Completed This Session

### 1. ✅ Database Schema (`supabase/engagement-system.sql`)
- Created `post_engagements` table for tracking likes and shares
- Created `engagement_counts` materialized view for fast queries
- Added RLS policies for authenticated users
- Created helper functions:
  - `get_family_engagement_counts(uuid)` - Get counts for a family
  - `user_has_liked(uuid, uuid)` - Check if user liked
  - `refresh_engagement_counts()` - Refresh materialized view

**ACTION REQUIRED:** Run this SQL file in Supabase dashboard before continuing

### 2. ✅ Engagement Service (`lib/engagementService.ts`)
Complete TypeScript service for engagement tracking:
- `hasUserLiked(familyId)` - Check if current user liked a post
- `toggleLike(familyId)` - Like/unlike a post (optimistic updates)
- `recordShare(familyId)` - Record when user shares
- `getEngagementCounts(familyId)` - Get like/share counts for one family
- `getBatchEngagementCounts(familyIds[])` - Efficient batch fetching
- `getBatchLikeStates(familyIds[])` - Check liked state for multiple posts
- `refreshEngagementCounts()` - Refresh materialized view

### 3. ✅ Families Service Update (`lib/familiesService.ts`)
Added pagination support to `fetchAllFamilies()`:
- New `offset` parameter for pagination
- Uses Supabase `.range(from, to)` for efficient queries
- Ready for infinite scroll implementation

**Updated signature:**
```typescript
fetchAllFamilies(options?: {
  limit?: number;
  offset?: number;  // NEW
  verified?: boolean;
  orderBy?: 'created_at' | 'name' | 'fundraising_current';
  ascending?: boolean;
})
```

### 4. ✅ TypeScript Types Update (`types/index.ts`)
Added engagement-related interfaces:
- `Engagement` - Individual engagement record
- `EngagementCounts` - Likes/shares count structure
- Updated `Post` interface with `liked: boolean` field

---

## What Needs To Be Done Next

### HIGH PRIORITY: Complete Home Feed Refactor

The `app/(tabs)/home.tsx` file needs a complete rewrite. Here's the exact implementation plan:

---

## Step-by-Step Implementation Guide

### STEP 1: Update Imports in home.tsx

```typescript
import { View, Text, FlatList, Image, TouchableOpacity,
         StyleSheet, RefreshControl, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { Video, ResizeMode } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { fetchAllFamilies } from '../../lib/familiesService';
import { toggleLike, getBatchEngagementCounts, getBatchLikeStates } from '../../lib/engagementService';
import type { CrisisFamily, Post } from '../../types';
import { mockUserStats } from '../../data/mockData'; // Keep for stats
```

### STEP 2: Add State Management

```typescript
export default function HomeScreen() {
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
```

### STEP 3: Create Family-to-Post Transformation Function

```typescript
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
    mediaUrl: family.coverImage || family.profileImage,
    caption: family.story.substring(0, 200) + (family.story.length > 200 ? '...' : ''),
    hashtags: family.tags,
    likes: likesCount,
    shares: sharesCount,
    liked: liked,
    createdAt: family.createdAt,
  };
}
```

### STEP 4: Implement Load Posts Function with Pagination

```typescript
/**
 * Load posts from Supabase with pagination
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

    // Fetch families from Supabase
    const families = await fetchAllFamilies({
      limit: LIMIT,
      offset: isLoadingMore ? offset : 0,
      orderBy: 'created_at',
      ascending: false, // Newest first
    });

    // Fetch engagement data in batch
    const familyIds = families.map(f => f.id);
    const [countsMap, likeStatesMap] = await Promise.all([
      getBatchEngagementCounts(familyIds),
      getBatchLikeStates(familyIds),
    ]);

    // Transform to posts with engagement data
    const newPosts = families.map(family =>
      familyToPost(
        family,
        countsMap.get(family.id)?.likesCount || 0,
        countsMap.get(family.id)?.sharesCount || 0,
        likeStatesMap.get(family.id) || false
      )
    );

    // Update state
    if (isLoadingMore) {
      setPosts(prev => [...prev, ...newPosts]);
      setOffset(prev => prev + LIMIT);
    } else {
      setPosts(newPosts);
      setOffset(LIMIT);
    }

    // Check if more data available
    setHasMore(families.length === LIMIT);

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
```

### STEP 5: Implement Like Handler with Optimistic Updates

```typescript
/**
 * Handle like button press
 * Uses optimistic updates for instant UI feedback
 */
const handleLike = async (post: Post) => {
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
```

### STEP 6: Implement Share Handler

```typescript
/**
 * Handle share button press
 * Opens native share sheet
 */
const handleShare = async (post: Post) => {
  try {
    await Share.share({
      message: `Check out ${post.familyName}'s story on CrisisApp!\n\n${post.caption}`,
      title: `Support ${post.familyName}`,
    });

    // Record share in database (don't await - fire and forget)
    recordShare(post.familyId).catch(console.error);

    // Optimistic update
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === post.id ? { ...p, shares: p.shares + 1 } : p
      )
    );
  } catch (error) {
    console.error('Error sharing:', error);
  }
};
```

### STEP 7: Create Post Card Render Component

```typescript
/**
 * Render individual post card
 * Handles both photos and videos with auto-play
 */
const renderPost = ({ item: post, index }: { item: Post; index: number }) => {
  const isActive = index === activeIndex;
  const shouldPlayVideo = isActive && isScreenFocused && post.type === 'video';

  return (
    <View style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <Image source={{ uri: post.familyImage }} style={styles.profileImage} />
        <View style={styles.headerInfo}>
          <Text style={styles.familyName}>{post.familyName}</Text>
          <Text style={styles.timestamp}>
            {new Date(post.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Media (Image or Video) */}
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
```

### STEP 8: Create Stats Header Component

```typescript
/**
 * Stats section at top of feed
 * Keep using mock data for now
 */
const StatsHeader = () => (
  <View style={styles.statsSection}>
    <Text style={styles.statsTitle}>Your Impact</Text>
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{mockUserStats.pointsEarned}</Text>
        <Text style={styles.statLabel}>Points</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{mockUserStats.currentStreak}</Text>
        <Text style={styles.statLabel}>Day Streak</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{mockUserStats.level}</Text>
        <Text style={styles.statLabel}>Level</Text>
      </View>
    </View>
  </View>
);
```

### STEP 9: Implement FlatList with All States

```typescript
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CrisisApp</Text>
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
};
```

### STEP 10: Add Styles

Keep existing styles and add new ones for the FlatList structure. Key styles needed:
- `postCard` - Container for each post
- `postHeader` - Profile image and name
- `mediaContainer` - Video/photo container
- `actions` - Like/comment/share buttons
- `centerContainer` - Loading/error/empty states
- Update existing styles to work with FlatList

---

## Testing Checklist

After implementation, test:
- [ ] Initial load shows 10 posts
- [ ] Pull-to-refresh works
- [ ] Scroll to bottom loads more posts
- [ ] Like button works (heart fills, count updates)
- [ ] Unlike works (reverts state)
- [ ] Share opens native sheet
- [ ] Videos auto-play when scrolled into view
- [ ] Videos pause when scrolling away
- [ ] Videos pause when switching tabs
- [ ] Videos resume when returning to tab
- [ ] Error handling works (try airplane mode)
- [ ] Empty state shows for new users

---

## Important Notes

1. **Database Setup Required**: Run `engagement-system.sql` in Supabase BEFORE testing
2. **Video URLs**: Only families with `videoUrl` array will show as video posts
3. **Engagement Counts**: Will start at 0 for all posts initially
4. **User Stats**: Still using mock data (separate feature)
5. **Comments**: Comment button doesn't do anything yet (future feature)

---

## Current File Locations

- Database schema: `supabase/engagement-system.sql` ✅
- Engagement service: `lib/engagementService.ts` ✅
- Updated families service: `lib/familiesService.ts` ✅
- Updated types: `types/index.ts` ✅
- **NEEDS WORK**: `app/(tabs)/home.tsx` ❌

---

## Session Handoff Complete

**Status**: Foundation complete, ready for UI implementation
**Next Action**: Implement home.tsx following the step-by-step guide above
**Estimated Time**: 30-45 minutes
**Files to Modify**: 1 file (`app/(tabs)/home.tsx`)

All supporting infrastructure is in place and committed. The next session just needs to implement the UI layer.
