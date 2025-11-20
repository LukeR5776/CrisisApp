/**
 * Engagement Service - Likes and Shares tracking
 *
 * This service handles all interactions with the post_engagements table in Supabase.
 * Supports likes, shares, and engagement count queries.
 */

import { supabase } from './supabase';

/**
 * Engagement counts for a family/post
 */
export interface EngagementCounts {
  likesCount: number;
  sharesCount: number;
}

/**
 * Check if current user has liked a specific family/post
 *
 * @param familyId - UUID of the family
 * @returns true if user has liked, false otherwise
 */
export async function hasUserLiked(familyId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('post_engagements')
      .select('id')
      .eq('family_id', familyId)
      .eq('user_id', user.id)
      .eq('engagement_type', 'like')
      .maybeSingle();

    if (error) throw error;
    return data !== null;
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
}

/**
 * Toggle like on a family/post
 * If user has liked, removes like. If not, adds like.
 *
 * @param familyId - UUID of the family
 * @returns new like state (true if now liked, false if unliked)
 */
export async function toggleLike(familyId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if already liked
    const isLiked = await hasUserLiked(familyId);

    if (isLiked) {
      // Unlike: Delete the engagement
      const { error } = await supabase
        .from('post_engagements')
        .delete()
        .eq('family_id', familyId)
        .eq('user_id', user.id)
        .eq('engagement_type', 'like');

      if (error) throw error;
      return false; // Now unliked
    } else {
      // Like: Insert new engagement
      const { error } = await supabase
        .from('post_engagements')
        .insert({
          family_id: familyId,
          user_id: user.id,
          engagement_type: 'like',
        });

      if (error) throw error;
      return true; // Now liked
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
}

/**
 * Record a share action
 * Shares can be recorded multiple times (unlike likes)
 *
 * @param familyId - UUID of the family
 */
export async function recordShare(familyId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('post_engagements')
      .insert({
        family_id: familyId,
        user_id: user.id,
        engagement_type: 'share',
      });

    // Ignore unique constraint violations (user already shared)
    if (error && error.code !== '23505') {
      throw error;
    }
  } catch (error) {
    console.error('Error recording share:', error);
    throw error;
  }
}

/**
 * Get engagement counts for a single family
 *
 * @param familyId - UUID of the family
 * @returns engagement counts (likes and shares)
 */
export async function getEngagementCounts(familyId: string): Promise<EngagementCounts> {
  try {
    const { data, error } = await supabase
      .from('engagement_counts')
      .select('likes_count, shares_count')
      .eq('family_id', familyId)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      return {
        likesCount: data.likes_count || 0,
        sharesCount: data.shares_count || 0,
      };
    }

    // If not in materialized view yet, calculate directly
    const { data: engagements, error: countError } = await supabase
      .from('post_engagements')
      .select('engagement_type')
      .eq('family_id', familyId);

    if (countError) throw countError;

    const likesCount = engagements?.filter(e => e.engagement_type === 'like').length || 0;
    const sharesCount = engagements?.filter(e => e.engagement_type === 'share').length || 0;

    return { likesCount, sharesCount };
  } catch (error) {
    console.error('Error getting engagement counts:', error);
    return { likesCount: 0, sharesCount: 0 };
  }
}

/**
 * Get engagement counts for multiple families (batch)
 * More efficient than calling getEngagementCounts() multiple times
 *
 * @param familyIds - Array of family UUIDs
 * @returns Map of family ID to engagement counts
 */
export async function getBatchEngagementCounts(
  familyIds: string[]
): Promise<Map<string, EngagementCounts>> {
  try {
    const { data, error } = await supabase
      .from('engagement_counts')
      .select('family_id, likes_count, shares_count')
      .in('family_id', familyIds);

    if (error) throw error;

    const countsMap = new Map<string, EngagementCounts>();

    // Add counts from materialized view
    data?.forEach(row => {
      countsMap.set(row.family_id, {
        likesCount: row.likes_count || 0,
        sharesCount: row.shares_count || 0,
      });
    });

    // For families not in materialized view, set default counts
    familyIds.forEach(id => {
      if (!countsMap.has(id)) {
        countsMap.set(id, { likesCount: 0, sharesCount: 0 });
      }
    });

    return countsMap;
  } catch (error) {
    console.error('Error getting batch engagement counts:', error);
    // Return default counts for all families
    return new Map(familyIds.map(id => [id, { likesCount: 0, sharesCount: 0 }]));
  }
}

/**
 * Get engagement states for multiple families for current user
 * Checks which families the user has liked
 *
 * @param familyIds - Array of family UUIDs
 * @returns Map of family ID to liked state (true if liked)
 */
export async function getBatchLikeStates(
  familyIds: string[]
): Promise<Map<string, boolean>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Map(familyIds.map(id => [id, false]));
    }

    const { data, error } = await supabase
      .from('post_engagements')
      .select('family_id')
      .eq('user_id', user.id)
      .eq('engagement_type', 'like')
      .in('family_id', familyIds);

    if (error) throw error;

    const likedSet = new Set(data?.map(row => row.family_id) || []);
    return new Map(familyIds.map(id => [id, likedSet.has(id)]));
  } catch (error) {
    console.error('Error getting batch like states:', error);
    return new Map(familyIds.map(id => [id, false]));
  }
}

/**
 * Refresh the engagement counts materialized view
 * Call this periodically or after bulk operations
 */
export async function refreshEngagementCounts(): Promise<void> {
  try {
    const { error } = await supabase.rpc('refresh_engagement_counts');
    if (error) throw error;
  } catch (error) {
    console.error('Error refreshing engagement counts:', error);
  }
}
