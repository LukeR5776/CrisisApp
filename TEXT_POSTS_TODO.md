# Text Posts Implementation - Remaining Tasks

## ✅ COMPLETED

### Files Created:
1. `supabase/family-posts-migration.sql` - Database schema for family_posts table
2. `scripts/textPosts.json` - 14 realistic posts (2 per family)
3. `scripts/importTextPosts.ts` - Import script for posts
4. `lib/postsService.ts` - Service with fetchAllPosts(), fetchPostsByFamily()

### Files Modified:
1. `types/index.ts` - Post interface supports 'text' type, added FamilyPost interface

---

## 🚧 REMAINING WORK

### USER ACTIONS REQUIRED FIRST:
```bash
# 1. Run in Supabase SQL Editor:
supabase/family-posts-migration.sql

# 2. Import posts:
EXPO_PUBLIC_SUPABASE_URL="https://zlthbhzfnozzrkvjxxuz.supabase.co" \
EXPO_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsdGhiaHpmbm96enJrdmp4eHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjM5MTMsImV4cCI6MjA3Njg5OTkxM30.63gt13cF4FaBjF_Jri9sniFjSfUKGkuozunkJf_U5I8" \
npx ts-node scripts/importTextPosts.ts
```

---

## CODE CHANGES NEEDED

### 1. Home Feed: `app/(tabs)/home.tsx`

**Add imports:**
```typescript
import { fetchAllPosts } from '../../lib/postsService';
import { fetchFamilyById } from '../../lib/familiesService';
import type { FamilyPost } from '../../types';
```

**Modify loadPosts() function (around line 80):**
```typescript
// Fetch both families and text posts
const [families, textPosts] = await Promise.all([
  fetchAllFamilies({
    limit: Math.ceil(LIMIT / 2),
    offset: isLoadingMore ? offset : 0,
    orderBy: 'created_at',
    ascending: false,
  }),
  fetchAllPosts({
    limit: Math.ceil(LIMIT / 2),
    offset: isLoadingMore ? offset : 0,
  })
]);

// Get family data for text posts (need profile images/names)
const textPostFamilyIds = [...new Set(textPosts.map(p => p.familyId))];
const textPostFamilies = await Promise.all(
  textPostFamilyIds.map(id => fetchFamilyById(id))
);
const familiesMap = new Map(textPostFamilies.filter(f => f).map(f => [f!.id, f!]));

// Transform families to posts
const familyPosts = families.map(family => familyToPost(family, ...));

// Transform text posts to Post interface
const textPostsAsPosts = textPosts.map(post => {
  const family = familiesMap.get(post.familyId);
  if (!family) return null;
  return textPostToPost(post, family,
    countsMap.get(post.familyId)?.likesCount || 0,
    countsMap.get(post.familyId)?.sharesCount || 0,
    likeStatesMap.get(post.familyId) || false
  );
}).filter(p => p !== null);

// Merge and sort chronologically
const allPosts = [...familyPosts, ...textPostsAsPosts]
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

setPosts(isLoadingMore ? prev => [...prev, ...allPosts] : allPosts);
```

**Add textPostToPost function (after familyToPost):**
```typescript
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
```

**Update renderPost() - Add before photo/video rendering:**
```typescript
const renderPost = ({ item: post, index }: { item: Post; index: number }) => {
  // Text post rendering
  if (post.type === 'text') {
    return (
      <View style={styles.postCard}>
        {/* Header - same as photo/video */}
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

        {/* Text Content (no media) */}
        <View style={styles.textContent}>
          <Text style={styles.textPostContent}>{post.content}</Text>
        </View>

        {/* Actions - same as photo/video */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(post)}>
            <Text style={styles.actionIcon}>{post.liked ? '❤️' : '🤍'}</Text>
            <Text style={styles.actionText}>{post.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(post)}>
            <Text style={styles.actionIcon}>🔗</Text>
            <Text style={styles.actionText}>{post.shares}</Text>
          </TouchableOpacity>
        </View>

        {/* Hashtags */}
        <View style={styles.caption}>
          <View style={styles.hashtags}>
            {post.hashtags.map((tag, i) => (
              <Text key={i} style={styles.hashtag}>{tag}</Text>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // Existing photo/video rendering...
```

**Add styles:**
```typescript
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
```

---

### 2. Family Profile: `app/family/[id].tsx`

**Add imports:**
```typescript
import { fetchPostsByFamily } from '../../lib/postsService';
import type { FamilyPost } from '../../types';
```

**Add state (after existing useState calls):**
```typescript
const [activeTab, setActiveTab] = useState<'videos' | 'updates'>('videos');
const [textPosts, setTextPosts] = useState<FamilyPost[]>([]);
```

**Update loadFamily() to fetch posts:**
```typescript
const [familyData, postsData] = await Promise.all([
  fetchFamilyById(familyId),
  fetchPostsByFamily(familyId)
]);
setFamily(familyData);
setTextPosts(postsData);
```

**Replace video gallery section (around line 163) with tabs:**
```typescript
{/* Tabs */}
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
    {/* Existing video gallery code (lines 166-202) */}
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
```

**Add styles:**
```typescript
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
emptyText: {
  textAlign: 'center',
  color: '#999',
  fontSize: 14,
  paddingVertical: 20,
},
```

---

## TESTING CHECKLIST
- [ ] Text posts appear in home feed mixed with family posts
- [ ] Posts sorted chronologically (newest first)
- [ ] Text posts show correct family name/image
- [ ] Like button works on text posts
- [ ] Share button works on text posts
- [ ] Profile tabs switch between Videos and Updates
- [ ] Updates tab shows text posts for that family
- [ ] Empty state shown if no text posts
