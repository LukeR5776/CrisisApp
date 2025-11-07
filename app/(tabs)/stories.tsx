/**
 * Stories/Explore Screen
 * Grid view of featured crisis families with filtering
 */

import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { fetchAllFamilies } from '../../lib/familiesService';
import type { CrisisFamily } from '../../types';

export default function StoriesScreen() {
  const router = useRouter();
  const [families, setFamilies] = useState<CrisisFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch families from Supabase on mount
  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllFamilies();
      setFamilies(data);
    } catch (err) {
      console.error('Error loading families:', err);
      setError('Failed to load families. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to family profile
  const handleFamilyPress = (familyId: string) => {
    router.push(`/family/${familyId}`);
  };

  // Render each family card
  const renderFamilyCard = ({ item }: { item: CrisisFamily }) => (
    <TouchableOpacity
      style={styles.familyCard}
      onPress={() => handleFamilyPress(item.id)}
    >
      <Image
        source={{ uri: item.coverImage }}
        style={styles.familyCardImage}
      />
      <View style={styles.familyCardContent}>
        <Text style={styles.familyCardTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.familyCardSubtitle} numberOfLines={1}>
          {item.location}
        </Text>
        <Text style={styles.familyCardCrisis} numberOfLines={2}>
          {item.situation}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Header component for FlatList
  const ListHeaderComponent = () => (
    <>
      {/* Filter Tabs */}
      <View style={styles.filterTabsContainer}>
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => router.push('/home')}
          >
            <Text style={styles.tabIcon}>🏠</Text>
            <Text style={styles.tabText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.tabIcon}>👤</Text>
            <Text style={styles.tabText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Support Families Section Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Support Families</Text>
          <Text style={styles.sectionSubtitle}>Discover How You Can Help</Text>
        </View>
        <View style={styles.supportButtons}>
          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportButtonText}>Support Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stories (Explore page)</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.icon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066FF" />
          <Text style={styles.loadingText}>Loading families...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadFamilies}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty State */}
      {!loading && !error && families.length === 0 && (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No families yet</Text>
          <Text style={styles.emptySubtext}>Check back soon for stories to support</Text>
        </View>
      )}

      {/* Infinite Scrolling Grid of All Families */}
      {!loading && !error && families.length > 0 && (
        <FlatList
          data={families}
          renderItem={renderFamilyCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={ListHeaderComponent}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            // This is where you would load more data in a real app
            console.log('End of list reached - load more families');
          }}
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
    fontSize: 16,
    fontWeight: '600',
  },
  iconButton: {
    padding: 4,
  },
  icon: {
    fontSize: 20,
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  filterTabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  filterTabs: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabIcon: {
    fontSize: 18,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  supportButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  supportButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#000',
    borderRadius: 16,
  },
  supportButtonText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  familyCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  familyCardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#e0e0e0',
  },
  familyCardContent: {
    padding: 12,
  },
  familyCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  familyCardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
    color: '#666',
  },
  familyCardCrisis: {
    fontSize: 11,
    color: '#666',
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
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
