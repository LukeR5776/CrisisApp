/**
 * Mock data for development and testing
 * This data can be easily replaced with real Supabase queries later
 */

import { CrisisFamily, Post, Donation, SupporterProfile, UserStats, Badge } from '../types';

// Mock Crisis Families
export const mockFamilies: CrisisFamily[] = [
  {
    id: '1',
    name: 'The Johnson Family',
    location: 'Fleeing War in Syria',
    situation: 'Displaced by conflict',
    story: 'We had to leave our home to escape the war. Your support means everything to our family as we seek safety and hope for a better future.',
    profileImage: 'https://via.placeholder.com/150',
    coverImage: 'https://via.placeholder.com/400x200',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    fundraisingLink: 'https://gofundme.com/johnson-family',
    fundraisingGoal: 50000,
    fundraisingCurrent: 12000,
    verified: true,
    tags: ['#FamilyStory', '#Syria', '#Hope'],
    needs: [
      { id: '1', icon: '🍲', title: 'Emergency Supplies', description: 'Food, clothing, and hygiene products' },
      { id: '2', icon: '💰', title: 'Financial Support', description: 'Assistance for housing and medical needs' },
      { id: '3', icon: '🏥', title: 'Healthcare Services', description: 'Access to medical treatment and counseling' },
    ],
    createdAt: '2025-09-15',
  },
  {
    id: '2',
    name: 'The Chen Family',
    location: 'Displaced by Flooding',
    situation: 'Climate refugees',
    story: 'Displaced by flooding, we are hopeful for a better future with your help and support.',
    profileImage: 'https://via.placeholder.com/150',
    coverImage: 'https://via.placeholder.com/400x200',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    fundraisingLink: 'https://gofundme.com/chen-family',
    fundraisingGoal: 30000,
    fundraisingCurrent: 8500,
    verified: true,
    tags: ['#ClimateRefugee', '#Hope'],
    needs: [
      { id: '1', icon: '🏠', title: 'Temporary Housing', description: 'Safe shelter while rebuilding' },
      { id: '2', icon: '🍲', title: 'Emergency Supplies', description: 'Food and basic necessities' },
    ],
    createdAt: '2025-10-01',
  },
  {
    id: '3',
    name: 'The Martinez Family',
    location: 'Political Refugees from Venezuela',
    situation: 'Political persecution',
    story: 'Seeking asylum and safety from political persecution. We dream of a peaceful life for our children.',
    profileImage: 'https://via.placeholder.com/150',
    coverImage: 'https://via.placeholder.com/400x200',
    fundraisingLink: 'https://gofundme.com/martinez-family',
    fundraisingGoal: 40000,
    fundraisingCurrent: 15000,
    verified: true,
    tags: ['#Refugee', '#Venezuela', '#Safety'],
    needs: [
      { id: '1', icon: '⚖️', title: 'Legal Assistance', description: 'Help with asylum process' },
      { id: '2', icon: '🏠', title: 'Housing', description: 'Secure temporary shelter' },
      { id: '3', icon: '👨‍👩‍👧', title: 'Family Support', description: 'Resources for children and education' },
    ],
    createdAt: '2025-08-20',
  },
  {
    id: '4',
    name: 'The Ahmed Family',
    location: 'Fleeing War in Gaza',
    situation: 'War survivors',
    story: 'Our home was destroyed in the conflict. We are grateful for any support as we rebuild our lives.',
    profileImage: 'https://via.placeholder.com/150',
    coverImage: 'https://via.placeholder.com/400x200',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    fundraisingLink: 'https://gofundme.com/ahmed-family',
    fundraisingGoal: 60000,
    fundraisingCurrent: 25000,
    verified: true,
    tags: ['#Gaza', '#Peace', '#Hope'],
    needs: [
      { id: '1', icon: '🏥', title: 'Medical Care', description: 'Treatment for injuries' },
      { id: '2', icon: '🍲', title: 'Food & Water', description: 'Basic survival needs' },
      { id: '3', icon: '🏠', title: 'Shelter', description: 'Safe place to live' },
    ],
    createdAt: '2025-07-10',
  },
];

// Mock Posts for Home Feed
export const mockPosts: Post[] = [
  {
    id: 'p1',
    familyId: '1',
    familyName: 'The Johnson Family',
    familyImage: 'https://via.placeholder.com/50',
    type: 'photo',
    mediaUrl: 'https://via.placeholder.com/400x300',
    caption: 'Happy to support those in need! #Support #Family',
    hashtags: ['#Support', '#Family'],
    likes: 234,
    shares: 45,
    createdAt: '2025-10-20',
  },
  {
    id: 'p2',
    familyId: '2',
    familyName: 'The Chen Family',
    familyImage: 'https://via.placeholder.com/50',
    type: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    caption: 'Every little bit helps! #Donations #GoodDeeds',
    hashtags: ['#Donations', '#GoodDeeds'],
    likes: 567,
    shares: 123,
    createdAt: '2025-10-19',
  },
  {
    id: 'p3',
    familyId: '4',
    familyName: 'The Ahmed Family',
    familyImage: 'https://via.placeholder.com/50',
    type: 'photo',
    mediaUrl: 'https://via.placeholder.com/400x300',
    caption: 'Thank you for your kindness! #Gratitude',
    hashtags: ['#Gratitude'],
    likes: 891,
    shares: 234,
    createdAt: '2025-10-18',
  },
];

// Mock User Stats and Profile
export const mockBadges: Badge[] = [
  {
    id: 'b1',
    name: 'First Donation',
    icon: '🎖️',
    description: 'Made your first donation',
    earnedAt: '2025-09-01',
  },
  {
    id: 'b2',
    name: 'Generous Giver',
    icon: '💝',
    description: 'Donated over $1000',
    earnedAt: '2025-09-15',
  },
  {
    id: 'b3',
    name: 'Social Butterfly',
    icon: '🦋',
    description: 'Shared 10 family profiles',
    earnedAt: '2025-10-01',
  },
];

export const mockUserStats: UserStats = {
  pointsEarned: 350,
  totalDonations: 1000,
  level: 5,
  currentStreak: 7,
  badges: mockBadges,
};

export const mockDonationHistory: Donation[] = [
  {
    id: 'd1',
    familyId: '1',
    familyName: 'The Johnson Family',
    familyImage: 'https://via.placeholder.com/50',
    amount: 200,
    date: '2025-10-15',
    pointsEarned: 100,
  },
  {
    id: 'd2',
    familyId: '2',
    familyName: 'The Chen Family',
    familyImage: 'https://via.placeholder.com/50',
    amount: 300,
    date: '2025-10-10',
    pointsEarned: 150,
  },
];

export const mockUserProfile: SupporterProfile = {
  id: 'user1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  profileImage: 'https://via.placeholder.com/100',
  stats: mockUserStats,
  donationHistory: mockDonationHistory,
  recentPosts: mockPosts.slice(0, 2),
};
