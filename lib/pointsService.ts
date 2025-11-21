/**
 * Points Service
 * Manages user points awarding and profile updates
 */

import { supabase } from './supabase';
import { useAuthStore } from '../store/authStore';

export const POINTS_CONFIG = {
  LIKE: 1,
  SHARE: 2,
} as const;

/**
 * Award points to the current user
 * @param points - Number of points to award
 * @returns Success status
 */
export async function awardPoints(points: number): Promise<boolean> {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.id) {
      console.error('No user logged in');
      return false;
    }

    const currentPoints = user.profile?.points_earned || 0;
    const newPoints = currentPoints + points;

    // Update points in database
    const { error } = await supabase
      .from('profiles')
      .update({ points_earned: newPoints })
      .eq('id', user.id);

    if (error) {
      console.error('Error awarding points:', error);
      return false;
    }

    // Refresh profile in auth store
    await useAuthStore.getState().refreshProfile();

    return true;
  } catch (error) {
    console.error('Error in awardPoints:', error);
    return false;
  }
}

/**
 * Award points for liking content
 */
export async function awardLikePoints(): Promise<boolean> {
  return awardPoints(POINTS_CONFIG.LIKE);
}

/**
 * Deduct points for unliking content (silent, no UI feedback)
 */
export async function deductLikePoints(): Promise<boolean> {
  return awardPoints(-POINTS_CONFIG.LIKE);
}

/**
 * Award points for sharing content
 */
export async function awardSharePoints(): Promise<boolean> {
  return awardPoints(POINTS_CONFIG.SHARE);
}
