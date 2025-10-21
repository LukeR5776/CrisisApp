/**
 * Support Screen (Short-Form Scroll)
 * TikTok/Reels-style vertical video scrolling
 */

import { View, Text, Dimensions, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import { useState } from 'react';
import { mockFamilies } from '../../data/mockData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Filter families that have video content
const videoPosts = mockFamilies.filter(family => family.videoUrl);

export default function SupportScreen() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Handle video scroll to track which video should be playing
  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  };

  // Render each video post
  const renderVideoPost = ({ item, index }: { item: typeof videoPosts[0]; index: number }) => {
    const isActive = index === activeIndex;

    return (
      <View style={styles.videoContainer}>
        {/* Video Player */}
        <View style={styles.videoWrapper}>
          {item.videoUrl ? (
            <Video
              source={{ uri: item.videoUrl }}
              style={styles.video}
              resizeMode={ResizeMode.COVER}
              shouldPlay={isActive}
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
          <Text style={styles.familyName}>{item.name}</Text>
          <Text style={styles.familyLocation}>{item.location}</Text>
          <Text style={styles.familyStory} numberOfLines={2}>
            {item.story}
          </Text>
          <View style={styles.hashtags}>
            {item.tags.map((tag, i) => (
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

      {/* Vertical Scrolling Video Feed */}
      <FlatList
        data={videoPosts.length > 0 ? videoPosts : mockFamilies.slice(0, 3)}
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
});
