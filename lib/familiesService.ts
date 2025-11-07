/**
 * Families Service - Supabase data layer for crisis families
 *
 * This service handles all interactions with the crisis_families table in Supabase.
 * It transforms database rows (snake_case) to TypeScript interfaces (camelCase).
 */

import { supabase } from './supabase';
import { CrisisFamily, Need } from '../types';

/**
 * Database row type (matches Supabase schema with snake_case)
 */
interface CrisisFamilyRow {
  id: string;
  name: string;
  location: string;
  situation: string;
  story: string;
  profile_image_url: string;
  cover_image_url: string | null;
  video_url: string | null;
  fundraising_link: string;
  fundraising_goal: number;
  fundraising_current: number;
  verified: boolean;
  tags: string[];
  needs: Need[];
  created_at: string;
  updated_at: string;
}

/**
 * Transform database row to CrisisFamily interface
 */
function transformDbRowToFamily(row: CrisisFamilyRow): CrisisFamily {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    situation: row.situation,
    story: row.story,
    profileImage: row.profile_image_url,
    coverImage: row.cover_image_url || undefined,
    videoUrl: row.video_url || undefined,
    fundraisingLink: row.fundraising_link,
    fundraisingGoal: Number(row.fundraising_goal),
    fundraisingCurrent: Number(row.fundraising_current),
    verified: row.verified,
    tags: row.tags,
    needs: row.needs,
    createdAt: row.created_at,
  };
}

/**
 * Fetch all crisis families from Supabase
 *
 * @param options - Optional query parameters
 * @param options.limit - Maximum number of families to return
 * @param options.verified - Filter by verification status
 * @param options.orderBy - Field to order by (default: created_at)
 * @param options.ascending - Sort order (default: false for newest first)
 * @returns Array of crisis families
 */
export async function fetchAllFamilies(options?: {
  limit?: number;
  verified?: boolean;
  orderBy?: 'created_at' | 'name' | 'fundraising_current';
  ascending?: boolean;
}): Promise<CrisisFamily[]> {
  try {
    let query = supabase
      .from('crisis_families')
      .select('*');

    // Apply filters
    if (options?.verified !== undefined) {
      query = query.eq('verified', options.verified);
    }

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
      console.error('Error fetching families:', error);
      throw new Error(`Failed to fetch families: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    // Transform database rows to CrisisFamily objects
    return data.map(transformDbRowToFamily);
  } catch (error) {
    console.error('Error in fetchAllFamilies:', error);
    throw error;
  }
}

/**
 * Fetch a single crisis family by ID
 *
 * @param id - UUID of the family to fetch
 * @returns Crisis family object or null if not found
 */
export async function fetchFamilyById(id: string): Promise<CrisisFamily | null> {
  try {
    const { data, error } = await supabase
      .from('crisis_families')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Error fetching family:', error);
      throw new Error(`Failed to fetch family: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return transformDbRowToFamily(data);
  } catch (error) {
    console.error('Error in fetchFamilyById:', error);
    throw error;
  }
}

/**
 * Fetch families with videos (for reels/support screen)
 *
 * @param options - Optional query parameters
 * @param options.limit - Maximum number of families to return
 * @returns Array of crisis families that have video URLs
 */
export async function fetchFamiliesWithVideos(options?: {
  limit?: number;
}): Promise<CrisisFamily[]> {
  try {
    let query = supabase
      .from('crisis_families')
      .select('*')
      .not('video_url', 'is', null)
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching families with videos:', error);
      throw new Error(`Failed to fetch families with videos: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    return data.map(transformDbRowToFamily);
  } catch (error) {
    console.error('Error in fetchFamiliesWithVideos:', error);
    throw error;
  }
}

/**
 * Search families by tags, name, or location
 *
 * @param searchTerm - Search term to match against tags, name, or location
 * @returns Array of matching crisis families
 */
export async function searchFamilies(searchTerm: string): Promise<CrisisFamily[]> {
  try {
    const { data, error } = await supabase
      .from('crisis_families')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching families:', error);
      throw new Error(`Failed to search families: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    return data.map(transformDbRowToFamily);
  } catch (error) {
    console.error('Error in searchFamilies:', error);
    throw error;
  }
}

/**
 * Get total count of crisis families
 *
 * @param verified - Optional filter by verification status
 * @returns Total count of families
 */
export async function getFamiliesCount(verified?: boolean): Promise<number> {
  try {
    let query = supabase
      .from('crisis_families')
      .select('*', { count: 'exact', head: true });

    if (verified !== undefined) {
      query = query.eq('verified', verified);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error getting families count:', error);
      throw new Error(`Failed to get families count: ${error.message}`);
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getFamiliesCount:', error);
    throw error;
  }
}
