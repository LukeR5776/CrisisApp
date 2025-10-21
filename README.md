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

### Backend & Data
- **Supabase Auth** - User authentication and authorization
- **Supabase PostgreSQL** - Primary database
- **Supabase Storage** - Media file hosting (videos, photos)

### State Management
- **Zustand** - Lightweight state management solution

### Payment & Fundraising
- **External Integration** - GoFundMe and similar platforms (MVP)
- Donations processed through verified external fundraising sites

### Platform Targets
- iOS (primary testing via Xcode simulator)
- Android
- Simultaneous deployment to both platforms

## Core Features

### MVP (Phase 1)
- ✅ User authentication (crisis families + supporters)
- ✅ Crisis family profile creation (video, photos, description, needs list)
- ✅ Explore feed (Instagram-style grid/feed layout)
- ✅ Short-form video scroll (Reels-style endless scroll)
- ✅ External fundraising link integration
- ✅ Donation tracking and point system
- ✅ Social sharing to external platforms
- ✅ User levels and badges
- ✅ Public leaderboards
- ✅ Manual content moderation by admins
- ✅ Report system for inappropriate content
- ✅ Profile verification through external platforms

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

## Database Schema (Preliminary)

### Users
- Supporter accounts
- Crisis family accounts
- Role-based permissions
- Profile data and statistics

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
