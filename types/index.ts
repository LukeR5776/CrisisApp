/**
 * Core TypeScript type definitions for CrisisApp
 */

export interface CrisisFamily {
  id: string;
  name: string;
  location: string;
  situation: string;
  story: string;
  profileImage: string;
  coverImage?: string;
  videoUrl?: string[]; // Array of video URLs - supports multiple videos per family
  fundraisingLink: string;
  fundraisingGoal: number;
  fundraisingCurrent: number;
  verified: boolean;
  tags: string[];
  needs: Need[];
  createdAt: string;
}

export interface Need {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface Post {
  id: string;
  familyId: string;
  familyName: string;
  familyImage: string;
  type: 'photo' | 'video';
  mediaUrl: string;
  caption: string;
  hashtags: string[];
  likes: number;
  shares: number;
  createdAt: string;
}

export interface Donation {
  id: string;
  familyId: string;
  familyName: string;
  familyImage: string;
  amount: number;
  date: string;
  pointsEarned: number;
}

export interface UserStats {
  pointsEarned: number;
  totalDonations: number;
  level: number;
  currentStreak: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
}

export interface SupporterProfile {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  stats: UserStats;
  donationHistory: Donation[];
  recentPosts: Post[];
}

// Auth & Database Types
export interface Profile {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  role: 'supporter' | 'family';
  points_earned: number;
  current_streak: number;
  level: number;
  total_donations: number;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile | null;
}
