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
- **Supabase PostgreSQL** - Primary database with profiles table (LIVE)
- **Supabase Storage** - Media file hosting (configured, not yet used)
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
- **User interface screens**
  - Sign In/Sign Up screen with real authentication
  - Email verification screen
  - Password reset screens
  - Home dashboard (Instagram-style feed with user stats)
  - Explore/Stories page (grid of featured families)
  - Support/Reels screen (TikTok-style vertical video scroll)
  - Supporter profile (real user data display)
  - Crisis family profile pages
  - Notifications screen
  - Protected tab navigation

#### 🚧 In Progress (Using Mock Data)
- Crisis family profile creation (UI complete, backend integration pending)
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

### Family Profiles
- Story content (text, video URLs, photo URLs)
- Needs list
- External fundraising links
- Verification status
- View/engagement metrics

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
├── /app                    # Expo Router pages
│   ├── (tabs)             # Tab navigation
│   ├── (auth)             # Authentication flows
│   └── profile/           # Profile screens
├── /components            # Reusable UI components
├── /hooks                 # Custom React hooks
├── /store                 # Zustand state stores
├── /lib                   # Utility functions and configs
│   ├── supabase.ts       # Supabase client setup
│   └── constants.ts      # App constants
├── /types                 # TypeScript type definitions
├── /assets                # Images, fonts, etc.
└── /services              # API and external integrations
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

- Secure authentication via Supabase Auth
- Row-level security policies in PostgreSQL
- Sensitive data encrypted at rest
- HTTPS for all network communications
- Privacy controls for user data
- Compliance with fundraising regulations (delegated to external platforms)

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
