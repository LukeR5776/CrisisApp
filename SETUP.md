# CrisisApp - Setup & Run Guide

## Prerequisites

Make sure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Xcode (for iOS testing)
- Xcode Command Line Tools

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npm start
```

3. Run on iOS simulator:
```bash
npm run ios
```

Or press `i` in the terminal after running `npm start`

## Project Structure

```
/CrisisApp
├── /app                           # Expo Router pages
│   ├── /(tabs)                   # Tab navigation screens
│   │   ├── home.tsx             # Home feed with posts and stats
│   │   ├── stories.tsx          # Explore/Stories grid
│   │   ├── support.tsx          # Reels-style video scroll
│   │   ├── notifications.tsx    # Notifications screen
│   │   └── profile.tsx          # Supporter profile
│   ├── /family/[id].tsx         # Crisis family profile (view-only)
│   ├── _layout.tsx              # Root layout
│   └── index.tsx                # Sign In screen
├── /data                         # Mock data
│   └── mockData.ts              # Sample families, posts, donations
├── /types                        # TypeScript definitions
│   └── index.ts                 # Type definitions
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config
```

## Screens Overview

### 1. Sign In (`app/index.tsx`)
- Email input field
- Google OAuth button (placeholder)
- Apple Sign In button (placeholder)
- Currently navigates to main app without actual authentication

### 2. Home Dashboard (`app/(tabs)/home.tsx`)
- Instagram-style feed with posts
- Quick stats (streak, points, level)
- Notification button in header
- Like, comment, share actions on posts

### 3. Stories/Explore (`app/(tabs)/stories.tsx`)
- Grid view of featured crisis families
- Filter tabs (Home, Send, Profile)
- "See More" buttons (UI only)
- Tappable family cards navigate to full profile

### 4. Support/Reels (`app/(tabs)/support.tsx`)
- Vertical scrolling video feed
- Full-screen video playback
- "Share Story" and "Donate Now" buttons
- Side actions (like, comment, share, notifications, profile)
- Family info overlay at bottom

### 5. Profile (`app/(tabs)/profile.tsx`)
- Supporter profile with stats
- Donation history
- Recent posts grid
- Share, Invite, and Donate Again buttons

### 6. Notifications (`app/(tabs)/notifications.tsx`)
- List of notifications (donations, badges, updates)
- Unread indicators
- "Mark all read" button

### 7. Family Profile (`app/family/[id].tsx`)
- Crisis family details
- Journey story
- Situation overview
- Needs list with icons
- Fundraising progress bar
- Share Profile, Connect, and Donate Now buttons
- Opens external fundraising link

## Navigation Flow

```
Sign In Screen (index.tsx)
    ↓
Tab Navigation (_layout.tsx)
    ├── Home (home.tsx)
    ├── Stories (stories.tsx) → Family Profile ([id].tsx)
    ├── Support (support.tsx)
    ├── Notifications (notifications.tsx)
    └── Profile (profile.tsx)
```

## Mock Data

All data is currently hardcoded in `data/mockData.ts`:
- 4 crisis families with different situations
- Sample posts for the home feed
- Donation history
- User stats and badges

## Key Features Implemented

✅ File-based routing with Expo Router
✅ Bottom tab navigation (persists across screens)
✅ Dynamic routing for family profiles
✅ Video playback setup with expo-av
✅ TypeScript types for all data models
✅ Responsive layouts that match wireframes
✅ Interactive navigation between screens
✅ Mock data structure ready for Supabase integration

## TODO: Next Steps

### Backend Integration
- [ ] Set up Supabase project
- [ ] Create database tables (users, families, posts, donations)
- [ ] Implement Supabase Auth for real login
- [ ] Replace mock data with Supabase queries
- [ ] Set up Supabase Storage for media files

### Authentication
- [ ] Implement email/password authentication
- [ ] Add Google OAuth flow
- [ ] Add Apple Sign In flow
- [ ] Create user registration flow
- [ ] Add role-based access (supporter vs. family)

### Features
- [ ] Implement actual video upload/playback
- [ ] Add real-time donation tracking
- [ ] Implement points/gamification system
- [ ] Add external fundraising link validation
- [ ] Create family verification workflow
- [ ] Add content moderation tools
- [ ] Implement sharing to social media
- [ ] Add push notifications

### Polish
- [ ] Replace emoji icons with proper icon library
- [ ] Add loading states
- [ ] Add error handling
- [ ] Improve placeholder images
- [ ] Add animations/transitions
- [ ] Optimize performance
- [ ] Add accessibility features

## Testing

Currently, you can test:
1. Sign in flow (enter any email to proceed)
2. Navigate between all tabs
3. Tap on family cards to view full profiles
4. Scroll through video feed
5. View donation history
6. Check notifications

## Notes

- The "Donate Now" buttons will attempt to open external URLs (GoFundMe placeholders)
- Videos use sample URLs from Google's test video library
- All images use placeholder.com for now
- Authentication is bypassed - any email input will work
- No backend calls are made yet - everything is client-side

## Support

For issues or questions about the codebase, refer to the main README.md or check the inline code comments.
