/**
 * Stories/Explore Screen
 * Grid view of featured crisis families with filtering
 */

import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { mockFamilies } from '../../data/mockData';

export default function StoriesScreen() {
  const router = useRouter();

  // Navigate to family profile
  const handleFamilyPress = (familyId: string) => {
    router.push(`/family/${familyId}`);
  };

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        {/* Featured Family Stories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Featured Family Stories</Text>
              <Text style={styles.sectionSubtitle}>Scroll through their journeys</Text>
            </View>
            <TouchableOpacity style={styles.seeMoreButton}>
              <Text style={styles.seeMoreText}>See More ›</Text>
            </TouchableOpacity>
          </View>

          {/* Featured Families Grid (2 columns) */}
          <View style={styles.familyGrid}>
            {mockFamilies.slice(0, 2).map((family) => (
              <TouchableOpacity
                key={family.id}
                style={styles.familyCard}
                onPress={() => handleFamilyPress(family.id)}
              >
                <Image
                  source={{ uri: family.coverImage }}
                  style={styles.familyCardImage}
                />
                <View style={styles.familyCardContent}>
                  <Text style={styles.familyCardTitle} numberOfLines={2}>
                    A photo of the {family.name}
                  </Text>
                  <Text style={styles.familyCardDescription} numberOfLines={2}>
                    {family.story}
                  </Text>
                  <Text style={styles.familyCardTag}>{family.tags[0]}</Text>
                  <Text style={styles.familyCardAuthor}>{family.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Support Families Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Support Families</Text>
              <Text style={styles.sectionSubtitle}>Discover How You Can Help</Text>
            </View>
            <View style={styles.supportButtons}>
              <TouchableOpacity style={styles.supportButton}>
                <Text style={styles.supportButtonText}>Support Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.supportButton}>
                <Text style={styles.supportButtonText}>Support Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Support Families Grid (2 columns) */}
          <View style={styles.familyGrid}>
            {mockFamilies.slice(2, 4).map((family) => (
              <TouchableOpacity
                key={family.id}
                style={styles.familyCard}
                onPress={() => handleFamilyPress(family.id)}
              >
                <Image
                  source={{ uri: family.coverImage }}
                  style={styles.familyCardImage}
                />
                <View style={styles.familyCardContent}>
                  <Text style={styles.familyCardTitle} numberOfLines={2}>
                    Photo of {family.name}
                  </Text>
                  <Text style={styles.familyCardSubtitle}>{family.name}</Text>
                  <Text style={styles.familyCardCrisis}>{family.situation}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional scrollable content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Families</Text>
          {mockFamilies.map((family) => (
            <TouchableOpacity
              key={family.id}
              style={styles.listItem}
              onPress={() => handleFamilyPress(family.id)}
            >
              <Image
                source={{ uri: family.profileImage }}
                style={styles.listItemImage}
              />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{family.name}</Text>
                <Text style={styles.listItemSubtitle}>{family.location}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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
  seeMoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
  },
  seeMoreText: {
    fontSize: 12,
    fontWeight: '500',
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
  familyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  familyCardDescription: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
  },
  familyCardTag: {
    fontSize: 10,
    color: '#0066FF',
    marginBottom: 2,
  },
  familyCardAuthor: {
    fontSize: 10,
    color: '#999',
  },
  familyCardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  familyCardCrisis: {
    fontSize: 11,
    color: '#666',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 12,
    color: '#666',
  },
});
