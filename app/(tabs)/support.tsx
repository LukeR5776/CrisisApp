/**
 * Support Screen (Short-Form Scroll)
 * TikTok/Reels-style vertical video scrolling
 */

import { View, Text, Dimensions, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchFamiliesWithVideos } from '../../lib/familiesService';
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

      setVideoPosts(allVideos);
    } catch (err) {
      console.error('Error loading videos:', err);
      setError('Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
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

        {/* Top Action Buttons */}
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.topActionButton}>
            <Text style={styles.topActionText}>Share Story</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.topActionButton, styles.donateButton]}>
            <Text style={[styles.topActionText, styles.donateButtonText]}>Donate Now</Text>
          </TouchableOpacity>
        </View>

        {/* Side Actions (Right side) */}
        <View style={styles.sideActions}>
          <TouchableOpacity style={styles.sideActionButton}>
            <Text style={styles.sideActionIcon}>❤️</Text>
            <Text style={styles.sideActionText}>Like</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sideActionButton}>
            <Text style={styles.sideActionIcon}>💬</Text>
            <Text style={styles.sideActionText}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sideActionButton}>
            <Text style={styles.sideActionIcon}>🔗</Text>
            <Text style={styles.sideActionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sideActionButton}>
            <Text style={styles.sideActionIcon}>🔔</Text>
            <Text style={styles.sideActionText}>Notify</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sideActionButton}>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support (Reels-like Scrolling)</Text>
        <View style={{ width: 32 }} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  backButton: {
    fontSize: 32,
    fontWeight: '300',
    color: '#fff',
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
  topActions: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  topActionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  topActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  donateButton: {
    backgroundColor: '#000',
  },
  donateButtonText: {
    color: '#fff',
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
