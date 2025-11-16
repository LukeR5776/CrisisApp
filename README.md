# CrisisApp

A cross-platform social impact mobile application connecting families in crisis with a global community of supporters.

## Mission

CrisisApp provides a platform for families facing humanitarian crises (war, displacement, climate disasters, political persecution) to share their stories and receive direct support from a compassionate global community. Through engaging social media-style content delivery, we bridge the gap between those in need and those who want to help.

## Overview

CrisisApp combines storytelling, social engagement, and fundraising to amplify the voices of crisis-affected families while making it easy for supporters to discover, connect with, and assist those in need.

### For Crisis Families
- Create verified profiles with video, photos, and personal narratives
- Share their journey and current situation
- List specific needs and link to fundraising campaigns
- Connect directly with supporters (future feature)

### For Supporting Users
- Discover families through Instagram-style explore feed
- Engage with short-form video content (Reels-style endless scroll)
- Make small donations through integrated external platforms
- Share profiles to amplify reach on social media
- Earn points, levels, and recognition for contributions
- View leaderboards and earn badges for support activities

## Technical Stack

### Core Framework
- **React Native** - Cross-platform mobile development
- **Expo** - Managed workflow and development tooling
- **Expo Router** - File-based navigation system

### Backend & Data ✨ LIVE
- **Supabase Auth** - User authentication and authorization (IMPLEMENTED)
- **Supabase PostgreSQL** - Primary database with profiles and crisis_families tables (LIVE)
- **Supabase Storage** - Media file hosting for videos and images (LIVE)
- **AsyncStorage** - Persistent session storage (LIVE)

### State Management ✨ LIVE
- **Zustand** - Authentication state management (IMPLEMENTED)
- Future: Content data state management

### Payment & Fundraising
- **External Integration** - GoFundMe and similar platforms (MVP)
- Donations processed through verified external fundraising sites

### Platform Targets
- iOS (primary testing via Xcode simulator)
- Android
- Simultaneous deployment to both platforms

## Core Features

### MVP (Phase 1) - Current Status

#### ✅ Completed (Live & Tested)
- **Real Supabase Authentication System**
  - Email/password sign-up with password strength validation
  - Email/password sign-in with rate limiting (5 attempts, 15-min lockout)
  - Email verification requirement before app access
  - Password reset flow
  - Secure session management with persistent login
  - Profile creation in PostgreSQL database
- **Real Crisis Families Content System** ✨ OPERATIONAL
  - PostgreSQL database table for crisis families (2 families imported)
  - Supabase Storage buckets for videos and images (LIVE)
  - Family data service layer with TypeScript types
  - Stories screen fetches families from database
  - Support/Reels screen fetches families with videos
  - Family profile screen with expandable stories
  - Helper script for adding families to database
  - Complete upload workflow documentation
  - **Database contains real family data**:
    - The Millican Family (Chickamauga, GA)
    - The Hewitt Family (Trelawny, Jamaica)
- **User interface screens**
  - Sign In/Sign Up screen with real authentication
  - Email verification screen
  - Password reset screens
  - Home dashboard (Instagram-style feed with user stats)
  - Explore/Stories page (grid of real families from database)
  - Support/Reels screen (TikTok-style vertical video scroll with real videos)
  - Supporter profile (real user data display)
  - Crisis family profile pages (fetches from database)
  - Notifications screen
  - Protected tab navigation

#### 🚧 In Progress (Using Mock Data)
- Posts/feed content (home screen uses mock data)
- Donation tracking and point system (data structure ready)
- User levels and badges (display logic implemented)
- External fundraising link integration (links work, tracking pending)

#### 📋 Not Yet Started
- Social sharing to external platforms
- Public leaderboards
- Manual content moderation by admins
- Report system for inappropriate content
- Profile verification through external platforms

### Future Features (Post-MVP)
- Direct messaging between supporters and families
- In-app chat moderation
- Advanced content moderation (AI/ML)
- Reward lotteries and awards for top supporters
- Enhanced verification processes
- Community features and group support
- Push notifications for updates from followed families

## Gamification System

### Point Earning Activities
- **Donations** - Primary point driver (weighted heavily)
- **Sharing** - Small points for external shares
- **Daily Login** - Engagement bonus points

### Rewards & Recognition
- Level progression system
- Achievement badges
- Public leaderboard rankings
- Profile badges for top supporters
- Future: Prize lotteries and awards

## Content Moderation Strategy (MVP)

### Verification
- Crisis families verified through external platforms (GoFundMe, etc.)
- Manual approval process for new family profiles
- Link verification to external fundraising campaigns

### Moderation
- User report system for flagging inappropriate content
- Manual review by platform moderators
- No user comments on videos (reduces moderation burden)
- Removal policy for verified families posting inappropriate content

### Safety Features
- Report button on all family profiles and content
- Manual moderator queue for reviewing reports
- Account suspension/removal capabilities

## Security Features ✨ NEW

### Password Security
- **Strong password requirements** enforced during sign-up:
  - Minimum 8 characters
  - Must contain uppercase and lowercase letters
  - Must contain at least one number
  - Must contain at least one special character
  - Cannot be in common password list (top 100)
- **Real-time strength indicator** with color-coded visual feedback
- **Interactive requirements checklist** shows progress during entry
- Passwords securely hashed by Supabase Auth

### Account Protection
- **Rate limiting** on login attempts:
  - Maximum 5 failed attempts allowed
  - 15-minute account lockout after threshold exceeded
  - Countdown timer displayed during lockout period
  - Automatic reset after successful login
- **Email verification** required before app access:
  - Verification email sent automatically on sign-up
  - Blocks access to protected screens until verified
  - Resend verification option available
  - Clear instructions and troubleshooting guidance

### Session Security
- **Persistent secure sessions** using AsyncStorage
- **Automatic token refresh** via Supabase
- **Session survives app restarts** for user convenience
- **Immediate session clearing** on sign-out
- Protected routes redirect to login when session invalid

### Data Protection
- All authentication handled by **Supabase Auth** (industry-standard)
- User profiles stored in **PostgreSQL** with row-level security
- API keys kept in source control (anon key only - safe for client-side)
- No sensitive user data displayed in logs

## Database Schema (Implemented)

### Users (Supabase Auth)
- Managed by Supabase Auth service
- Email/password authentication
- Email verification tracking
- Session management
- Password reset functionality

### Profiles Table (PostgreSQL) ✨ LIVE
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'supporter',
  avatar_url TEXT,
  bio TEXT,
  points_earned INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_donations NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
- Automatically created on user sign-up
- Stores user display name and role (supporter/crisis_family)
- Tracks gamification stats (points, level, streak)
- Avatar and bio fields for future profile customization

### Crisis Families Table (PostgreSQL) ✨ LIVE
```sql
CREATE TABLE crisis_families (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  situation TEXT NOT NULL,
  story TEXT NOT NULL,
  profile_image_url TEXT NOT NULL,
  cover_image_url TEXT,
  video_url TEXT[],
  fundraising_link TEXT NOT NULL,
  fundraising_goal NUMERIC NOT NULL,
  fundraising_current NUMERIC NOT NULL,
  verified BOOLEAN DEFAULT true,
  tags TEXT[] NOT NULL,
  needs JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
- Stores crisis family profiles and stories
- Links to media files in Supabase Storage
- **Supports multiple videos per family** (video_url is an array)
- Includes fundraising progress and goals
- Needs field stores structured data (icon, title, description)
- Row Level Security (RLS) policies for access control
- Public read access, authenticated family write access

### Engagement Tracking
- Donation events (external confirmation)
- Share events
- Daily login tracking
- Point calculations and level progression

### Moderation
- Report submissions
- Moderator actions log
- Content status tracking

## Project Structure

```
/CrisisApp
├── /app                           # Expo Router pages
│   ├── /(tabs)                   # Tab navigation screens
│   │   ├── home.tsx             # Home feed
│   │   ├── stories.tsx          # Explore/Stories (real families)
│   │   ├── support.tsx          # Reels-style videos (real videos)
│   │   ├── notifications.tsx    # Notifications
│   │   └── profile.tsx          # Supporter profile
│   ├── /family/[id].tsx         # Crisis family profile (dynamic route)
│   ├── _layout.tsx              # Root layout (auth controller)
│   ├── index.tsx                # Sign In/Sign Up screen
│   ├── verify-email.tsx         # Email verification screen
│   ├── reset-password.tsx       # Password reset request
│   └── update-password.tsx      # New password entry
├── /lib                           # Utility libraries
│   ├── supabase.ts              # Supabase client configuration
│   ├── passwordValidator.ts     # Password strength checking
│   ├── rateLimiter.ts           # Login rate limiting logic
│   └── familiesService.ts       # Crisis families data service
├── /store                         # Zustand state stores
│   └── authStore.ts             # Authentication state
├── /data                          # Mock data
│   └── mockData.ts              # Posts, donations (families deprecated)
├── /types                         # TypeScript type definitions
│   └── index.ts                 # Type definitions
├── /supabase                      # Database migrations
│   ├── storage-setup.sql        # Storage buckets configuration
│   └── crisis-families-migration.sql  # Crisis families table
├── /scripts                       # Helper scripts
│   ├── addFamily.ts             # Add families to database
│   ├── example-family.json      # Example family data template
│   └── README.md                # Scripts documentation
├── /assets                        # Images, fonts, etc.
├── README.md                      # Project documentation
├── SETUP.md                       # Setup and run instructions
├── UPLOAD_GUIDE.md                # Video & profile upload guide
├── CLAUDE.md                      # Claude Code context
└── AUTH_TESTING.md                # Authentication testing guide
```

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Xcode) for iOS testing
- Android Emulator (optional) for Android testing
- Supabase account and project

### Environment Variables
Create a `.env` file in the root directory:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation
```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

## Design Philosophy

### User Experience
- **Familiar Patterns**: Leverage Instagram/TikTok-style UX for immediate user comfort
- **Low Friction**: Minimize barriers to both sharing stories and providing support
- **Emotional Connection**: Design for storytelling and authentic human connection
- **Transparency**: Clear visibility into where support goes and impact metrics

### Technical Approach
- **Start Simple**: MVP focuses on core value proposition
- **External Dependencies**: Leverage proven platforms (GoFundMe) for trust and compliance
- **Scalable Foundation**: Architecture supports future feature expansion
- **Cross-Platform First**: Equal experience on iOS and Android

## Security & Privacy Considerations

### Authentication Security
- **Supabase Auth** - Industry-standard authentication with JWT tokens
- **Password Requirements** - Enforced strong passwords:
  - Minimum 8 characters
  - Must include uppercase, lowercase, numbers, special characters
  - Protection against common passwords (top 100 blocked)
- **Rate Limiting** - Client-side protection against brute force:
  - Maximum 5 failed login attempts
  - 15-minute lockout after threshold exceeded
  - Automatic reset after successful login
- **Email Verification** - Required for all new accounts
- **Session Security** - Persistent sessions with automatic token refresh

### Data Security
- **Row Level Security (RLS)** - PostgreSQL policies on all tables
- **Encrypted storage** - Sensitive data encrypted at rest
- **HTTPS only** - All network communications secured
- **Secure session storage** - AsyncStorage with device-level encryption
- **Privacy controls** - User data access controls

### Compliance
- Fundraising regulations delegated to external platforms (GoFundMe, etc.)
- Clear data privacy policies (to be implemented)
- User content moderation systems (manual review)

## Success Metrics

### Family Impact
- Number of verified families onboarded
- Total funds raised (tracked via external platforms)
- Story views and engagement rates

### Community Engagement
- Active monthly users
- Donation conversion rate
- Share rate to external platforms
- Daily active users
- Average session time

### Platform Health
- Reported content vs. total content ratio
- Moderator response time
- Account verification time
- App crash rate and performance metrics

## Roadmap

### Phase 1: MVP (Current)
- Core platform features
- Basic engagement and gamification
- External fundraising integration
- Manual moderation

### Phase 2: Enhanced Engagement
- Direct messaging
- Push notifications
- Advanced gamification (lotteries, awards)
- Improved content discovery algorithms

### Phase 3: Scale & Trust
- In-platform donation processing
- Advanced verification systems
- AI-assisted moderation
- Community features
- Analytics dashboard for families

## Contributing

This is currently a private project. Development guidelines and contribution processes will be established as the project evolves.

## License

Proprietary - All rights reserved

---

**Built with compassion to amplify voices and mobilize global support for families in crisis.**
