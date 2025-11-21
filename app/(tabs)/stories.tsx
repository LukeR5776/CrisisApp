/**
 * Stories/Explore Screen
 * Grid view of featured crisis families with filtering
 */

import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { fetchAllFamilies } from '../../lib/familiesService';
import type { CrisisFamily } from '../../types';

type LocationFilter = 'All' | 'US' | 'Palestine' | 'Jamaica';

export default function StoriesScreen() {
  const router = useRouter();
  const [allFamilies, setAllFamilies] = useState<CrisisFamily[]>([]);
  const [families, setFamilies] = useState<CrisisFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('All');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Fetch families from Supabase on mount
  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllFamilies();
      setAllFamilies(data);
      setFamilies(data);
    } catch (err) {
      console.error('Error loading families:', err);
      setError('Failed to load families. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter families when location filter changes
  useEffect(() => {
    if (locationFilter === 'All') {
      setFamilies(allFamilies);
    } else {
      const filtered = allFamilies.filter(family => {
        const location = family.location.toLowerCase();
        switch (locationFilter) {
          case 'US':
            return location.includes('united states') || location.includes('us') ||
                   location.includes('usa') || location.includes('georgia') ||
                   location.includes('california') || location.includes('texas') ||
                   location.includes('florida') || location.includes('new york');
          case 'Palestine':
            return location.includes('palestine') || location.includes('gaza') ||
                   location.includes('west bank');
          case 'Jamaica':
            return location.includes('jamaica');
          default:
            return true;
        }
      });
      setFamilies(filtered);
    }
  }, [locationFilter, allFamilies]);

  const handleFilterSelect = (filter: LocationFilter) => {
    setLocationFilter(filter);
    setShowFilterModal(false);
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
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.icon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Location Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Location</Text>

            <TouchableOpacity
              style={[styles.filterOption, locationFilter === 'All' && styles.filterOptionActive]}
              onPress={() => handleFilterSelect('All')}
            >
              <Text style={[styles.filterOptionText, locationFilter === 'All' && styles.filterOptionTextActive]}>
                All Locations
              </Text>
              {locationFilter === 'All' && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterOption, locationFilter === 'US' && styles.filterOptionActive]}
              onPress={() => handleFilterSelect('US')}
            >
              <Text style={[styles.filterOptionText, locationFilter === 'US' && styles.filterOptionTextActive]}>
                United States
              </Text>
              {locationFilter === 'US' && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterOption, locationFilter === 'Palestine' && styles.filterOptionActive]}
              onPress={() => handleFilterSelect('Palestine')}
            >
              <Text style={[styles.filterOptionText, locationFilter === 'Palestine' && styles.filterOptionTextActive]}>
                Palestine
              </Text>
              {locationFilter === 'Palestine' && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterOption, locationFilter === 'Jamaica' && styles.filterOptionActive]}
              onPress={() => handleFilterSelect('Jamaica')}
            >
              <Text style={[styles.filterOptionText, locationFilter === 'Jamaica' && styles.filterOptionTextActive]}>
                Jamaica
              </Text>
              {locationFilter === 'Jamaica' && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  filterOptionActive: {
    backgroundColor: '#E6F0FF',
    borderWidth: 2,
    borderColor: '#0066FF',
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  filterOptionTextActive: {
    color: '#0066FF',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: '#0066FF',
    fontWeight: '700',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});
