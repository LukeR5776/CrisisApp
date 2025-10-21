/**
 * Stories/Explore Screen
 * Grid view of featured crisis families with filtering
 */

import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { mockFamilies } from '../../data/mockData';
import type { CrisisFamily } from '../../types';

export default function StoriesScreen() {
  const router = useRouter();

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
      <View style={styles.filterTabs}>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabIcon}>🔍</Text>
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabIcon}>📤</Text>
          <Text style={styles.tabText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabText}>Profile</Text>
        </TouchableOpacity>
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
        <TouchableOpacity>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stories (Explore page)</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.icon}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.icon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.icon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Infinite Scrolling Grid of All Families */}
      <FlatList
        data={mockFamilies}
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
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
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
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabText: {
    fontSize: 14,
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
});
