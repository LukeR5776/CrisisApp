/**
 * Posts Service - Supabase data layer for family text posts
 *
 * This service handles all interactions with the family_posts table in Supabase.
 * It transforms database rows (snake_case) to TypeScript interfaces (camelCase).
 */

import { supabase } from './supabase';
import { FamilyPost } from '../types';

/**
 * Database row type (matches Supabase schema with snake_case)
 */
interface FamilyPostRow {
  id: string;
  family_id: string;
  content: string;
  hashtags: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Transform database row to FamilyPost interface
 */
function transformDbRowToPost(row: FamilyPostRow): FamilyPost {
  return {
    id: row.id,
    familyId: row.family_id,
    content: row.content,
    hashtags: row.hashtags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Fetch all text posts from all families
 *
 * @param options - Optional query parameters
 * @param options.limit - Maximum number of posts to return
 * @param options.offset - Number of posts to skip (for pagination)
 * @param options.orderBy - Field to order by (default: created_at)
 * @param options.ascending - Sort order (default: false for newest first)
 * @returns Array of family posts
 */
export async function fetchAllPosts(options?: {
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'updated_at';
  ascending?: boolean;
}): Promise<FamilyPost[]> {
  try {
    let query = supabase
      .from('family_posts')
      .select('*');

    // Apply ordering
    const orderBy = options?.orderBy || 'created_at';
    const ascending = options?.ascending || false;
    query = query.order(orderBy, { ascending });

    // Apply pagination (limit and offset)
    if (options?.limit) {
      const from = options?.offset || 0;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    // Transform database rows to FamilyPost objects
    return data.map(transformDbRowToPost);
  } catch (error) {
    console.error('Error in fetchAllPosts:', error);
    throw error;
  }
}

/**
 * Fetch text posts for a specific family
 *
 * @param familyId - UUID of the family
 * @param options - Optional query parameters
 * @param options.limit - Maximum number of posts to return
 * @param options.orderBy - Field to order by (default: created_at)
 * @param options.ascending - Sort order (default: false for newest first)
 * @returns Array of family posts
 */
export async function fetchPostsByFamily(
  familyId: string,
  options?: {
    limit?: number;
    orderBy?: 'created_at' | 'updated_at';
    ascending?: boolean;
  }
): Promise<FamilyPost[]> {
  try {
    let query = supabase
      .from('family_posts')
      .select('*')
      .eq('family_id', familyId);

    // Apply ordering
    const orderBy = options?.orderBy || 'created_at';
    const ascending = options?.ascending || false;
    query = query.order(orderBy, { ascending });

    // Apply limit
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts by family:', error);
      throw new Error(`Failed to fetch posts for family: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    return data.map(transformDbRowToPost);
  } catch (error) {
    console.error('Error in fetchPostsByFamily:', error);
    throw error;
  }
}

/**
 * Fetch a single post by ID
 *
 * @param id - UUID of the post to fetch
 * @returns Family post object or null if not found
 */
export async function fetchPostById(id: string): Promise<FamilyPost | null> {
  try {
    const { data, error } = await supabase
      .from('family_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Error fetching post:', error);
      throw new Error(`Failed to fetch post: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return transformDbRowToPost(data);
  } catch (error) {
    console.error('Error in fetchPostById:', error);
    throw error;
  }
}

/**
 * Get total count of posts
 *
 * @param familyId - Optional filter by family ID
 * @returns Total count of posts
 */
export async function getPostsCount(familyId?: string): Promise<number> {
  try {
    let query = supabase
      .from('family_posts')
      .select('*', { count: 'exact', head: true });

    if (familyId) {
      query = query.eq('family_id', familyId);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error getting posts count:', error);
      throw new Error(`Failed to get posts count: ${error.message}`);
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getPostsCount:', error);
    throw error;
  }
}
