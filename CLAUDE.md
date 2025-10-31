# Claude Context - CrisisApp Project

## Project Overview

**CrisisApp** is a cross-platform React Native mobile application that connects families in humanitarian crises (war, displacement, climate disasters, political persecution) with a global community of supporters. The app combines storytelling, social engagement, and fundraising to amplify the voices of crisis-affected families.

### Mission
Provide a platform for crisis families to share their stories and receive direct support through a compassionate global community using engaging social media-style content delivery.

## Current Status: MVP Phase 1 - Authentication Complete

All core screens have been built and are interactive. **Real authentication via Supabase is now fully implemented and tested.** The app uses a mix of real auth data and mock content data. Ready for testing on iOS/Android simulators.

### Completed Features ✅
- **Real Supabase Authentication System** ✨ NEW
  - Email/password sign-up with password strength validation
  - Email/password sign-in with rate limiting (5 attempts, 15-min lockout)
  - Email verification flow with resend capability
  - Password reset functionality
  - Secure session management with AsyncStorage
  - Profile creation and management in PostgreSQL
  - Zustand state management for auth state
- Sign In/Sign Up screen (real authentication + OAuth placeholders)
- Email verification screen with status checking
- Password reset and update screens
- Home dashboard (Instagram-style feed with user stats)
- Stories/Explore page (grid of featured families)
- Support/Reels screen (TikTok-style vertical video scroll)
- Supporter profile (real user data, placeholder donations/posts)
- Crisis family profile (view-only fundraising details)
- Notifications screen
- Bottom tab navigation (persistent across all screens, protected by auth)
- Mock data structure (families, posts, donations, user stats)
- TypeScript type definitions
- Git repository connected to GitHub

### Not Yet Implemented 🚧
- Backend integration for content (posts, families, donations)
- Actual video upload/processing
- Real donation processing and tracking
- Points/gamification logic implementation
- Content moderation tools
- Social media sharing
- Push notifications

## Technical Stack

### Core
- **React Native** - Cross-platform mobile development
- **Expo** (v52) - Managed workflow and tooling
- **Expo Router** (v6) - File-based navigation
- **TypeScript** - Type safety throughout

### Backend (Now Implemented) ✨
- **Supabase Auth** - User authentication (LIVE)
- **Supabase PostgreSQL** - Database with profiles table (LIVE)
- **Supabase Storage** - Media hosting (configured, not yet used)
- **Zustand** - State management for auth (LIVE)
- **AsyncStorage** - Secure session persistence (LIVE)

### Key Dependencies
- `@supabase/supabase-js` - Supabase client SDK
- `@react-native-async-storage/async-storage` - Session storage
- `zustand` - State management
- `expo-av` - Video playback
- `react-navigation/native` - Navigation
- `react-native-safe-area-context` - Safe area handling
- `react-native-screens` - Native screen optimization

## Project Structure

```
/CrisisApp
├── /app                          # Expo Router pages
│   ├── /(tabs)                  # Tab navigation group (auth-protected)
│   │   ├── _layout.tsx         # Tab bar configuration
│   │   ├── home.tsx            # Home feed with posts and stats
│   │   ├── stories.tsx         # Explore/Stories grid
│   │   ├── support.tsx         # Reels-style video scroll
│   │   ├── notifications.tsx   # Notifications screen
│   │   └── profile.tsx         # Supporter profile (real auth data)
│   ├── /family/[id].tsx        # Dynamic family profile route
│   ├── _layout.tsx             # Root layout (auth navigation controller)
│   ├── index.tsx               # Sign In/Sign Up screen (entry point)
│   ├── verify-email.tsx        # Email verification pending screen
│   ├── reset-password.tsx      # Password reset request screen
│   └── update-password.tsx     # New password entry screen
├── /lib                          # Utility libraries ✨ NEW
│   ├── supabase.ts             # Supabase client configuration
│   ├── passwordValidator.ts    # Password strength checking
│   └── rateLimiter.ts          # Login rate limiting logic
├── /store                        # State management ✨ NEW
│   └── authStore.ts            # Zustand auth store
├── /data
│   └── mockData.ts             # Mock content data (families, posts, donations)
├── /types
│   └── index.ts                # TypeScript type definitions (including auth types)
├── README.md                    # Project documentation
├── SETUP.md                     # Setup and run instructions
├── CLAUDE.md                    # This file - Claude Code context
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
└── tsconfig.json               # TypeScript config
```

## Key Architecture Decisions

### Navigation ✨ UPDATED
- **Expo Router** file-based routing (routes match file structure)
- **Root Layout** (`app/_layout.tsx`) - Central auth navigation controller
  - Manages all authentication-based redirects
  - Checks email verification status
  - Single source of truth for routing decisions
  - Shows loading screen while auth initializes
- **Tab Layout** (`app/(tabs)/_layout.tsx`) - Protected tab navigation
  - Only renders if user is authenticated
  - Returns null for unauthenticated users (no navigation loops)
  - Bottom tabs with Home, Stories, Support, Notifications, Profile
- Dynamic routes use `[id]` syntax (e.g., `family/[id].tsx`)
- Sign in screen is the index route
- Email verification screen blocks access to tabs until verified

### Authentication Flow
1. App starts → Root layout initializes auth state
2. Checks Supabase session from AsyncStorage
3. If session exists → fetch user profile from PostgreSQL
4. Route user based on state:
   - No user → redirect to sign-in (`/`)
   - User but unverified → redirect to verify-email (`/verify-email`)
   - User and verified → allow access to tabs (`/(tabs)/home`)
5. Auth state changes trigger navigation automatically
6. onAuthStateChange listener keeps state synchronized

### Data Flow (Current MVP)
1. **Authentication data** - Real Supabase Auth + PostgreSQL profiles
2. **Content data** - Still uses `data/mockData.ts` (families, posts, donations)
3. **State management** - Zustand for auth state, direct imports for mock data
4. Navigation uses `useRouter()` from expo-router
5. Profile screen shows real user data, placeholder donation/post data

### User Types
- **Supporters**: Can view content, donate (external links), earn points/badges
- **Crisis Families**: Can create profiles, share stories (view-only in supporter perspective)
- Current implementation only shows supporter perspective

### External Dependencies
- **Fundraising**: Links to external platforms (GoFundMe, etc.) - no in-app payment processing
- **Videos**: Sample videos from Google's test library
- **Images**: Placeholder images (placeholder.com)

## Authentication System ✨ NEW

### Security Features Implemented

#### Password Validation (`lib/passwordValidator.ts`)
- **Minimum 8 characters** required for sign-up
- **Strength scoring** (0-4 scale):
  - Weak (0-1): Red indicator
  - Fair (2): Orange indicator
  - Good (3): Yellow indicator
  - Strong (4): Green indicator
- **Real-time requirements checking**:
  - Uppercase letter (A-Z)
  - Lowercase letter (a-z)
  - Number (0-9)
  - Special character (!@#$%^&*(),.?":{}|<>)
  - Not in common password list (top 100 most common)
- Visual strength bar shows during password entry
- Requirements checklist with green checkmarks

#### Rate Limiting (`lib/rateLimiter.ts`)
- **5 failed login attempts** allowed
- **15-minute lockout** after exceeding limit
- Uses AsyncStorage to persist attempt data
- Shows remaining attempts after each failure
- Countdown timer displays during lockout
- Auto-resets after successful login
- Prevents brute-force attacks

#### Email Verification
- Required for all new accounts
- Verification email sent automatically on sign-up
- Blocks access to app tabs until verified
- Resend verification email functionality
- Clear instructions and troubleshooting tips
- Sign-out option if wrong email used

#### Session Management
- Persistent sessions via AsyncStorage
- Auto-refresh tokens (Supabase built-in)
- Session survives app restarts
- Secure storage of credentials
- Automatic cleanup on sign-out

### Authentication Screens

#### Sign In/Sign Up (`app/index.tsx`)
- Toggle between sign-in and sign-up modes
- Email and password inputs
- Display name field (sign-up only)
- Password strength indicator (sign-up only)
- Real-time validation feedback
- Rate limit warnings
- Lockout screen with countdown
- OAuth placeholders (Google, Apple - coming soon)
- "Forgot password?" link
- Terms of Service and Privacy Policy text

#### Email Verification (`app/verify-email.tsx`)
- Large email icon for visual clarity
- Shows user's email address
- Clear verification instructions
- Troubleshooting tips (check spam, wait, etc.)
- "Resend verification email" button
- Success/error feedback on resend
- Sign-out option to change email

#### Password Reset (`app/reset-password.tsx`)
- Email input for reset request
- Sends password reset link via Supabase
- Clear instructions for checking email
- Link to return to sign-in

#### Update Password (`app/update-password.tsx`)
- New password entry (with validation)
- Confirm password field
- Same strength requirements as sign-up
- Updates password in Supabase
- Redirects to home on success

### Authentication Store (`store/authStore.ts`)
- **Zustand** state management
- **State properties**:
  - `user`: Current user object with profile
  - `session`: Supabase session
  - `loading`: Loading state for async operations
  - `initialized`: Whether auth has been initialized
- **Actions**:
  - `initialize()`: Load session on app start
  - `signIn(email, password)`: Authenticate user
  - `signUp(email, password, displayName)`: Create account
  - `signOut()`: Clear session and redirect
  - `refreshProfile()`: Reload user profile data
  - `resendVerificationEmail(email)`: Send new verification
  - `isEmailVerified()`: Check verification status
- **Auth state listener**: Syncs state on session changes
- **Profile creation**: Automatic on sign-up with default values

### Supabase Configuration (`lib/supabase.ts`)
- Connected to production Supabase instance
- AsyncStorage for session persistence
- Auto-refresh tokens enabled
- Persistent sessions enabled
- URL detection disabled (mobile app)

### Database Schema

#### profiles table (PostgreSQL)
```sql
- id: uuid (primary key, references auth.users)
- display_name: text
- role: text ('supporter' or 'crisis_family')
- avatar_url: text (nullable)
- bio: text (nullable)
- points_earned: integer (default 0)
- current_streak: integer (default 0)
- level: integer (default 1)
- total_donations: numeric (default 0)
- created_at: timestamp
- updated_at: timestamp
```

### Navigation Protection

#### Root Layout (`app/_layout.tsx`)
- Initializes auth on app load
- Shows loading screen during initialization
- Routes users based on auth state:
  - Not authenticated → `/` (sign-in)
  - Authenticated but unverified → `/verify-email`
  - Authenticated and verified → `/(tabs)/home`
- Single source of truth for navigation
- Prevents navigation race conditions

#### Tab Layout (`app/(tabs)/_layout.tsx`)
- Returns `null` if not authenticated (blocks rendering)
- Only shows tabs for verified users
- No redundant navigation logic
- Relies on root layout for redirects

## Mock Data Structure

Located in `data/mockData.ts`:

```typescript
// 4 crisis families with:
- Basic info (name, location, situation)
- Story text
- Profile/cover images
- Video URLs (sample)
- Fundraising links and goals
- Needs list (Emergency Supplies, Financial Support, etc.)
- Verification status
- Tags

// Posts for home feed with:
- Family attribution
- Media (photo/video)
- Caption and hashtags
- Likes and shares count

// User profile with:
- Stats (points, donations, level, streak)
- Badges (achievements)
- Donation history
- Recent posts
```

## Important Implementation Notes

### Video Scroll Screen (`app/(tabs)/support.tsx`)
- Uses `FlatList` with `pagingEnabled` for vertical scroll
- Video auto-plays when in view (tracked by index)
- Overlays for actions (share, donate, like, comment)
- Family info at bottom with semi-transparent background

### Family Profile Screen (`app/family/[id].tsx`)
- Accessed via dynamic route: `/family/[id]`
- Uses `useLocalSearchParams()` to get ID
- Finds family from mock data by ID
- "Donate Now" opens external URL with `Linking.openURL()`

### Navigation Flow ✨ UPDATED
```
_layout.tsx (Root - Auth Controller)
    │
    ├─→ Not authenticated
    │   └─→ index.tsx (Sign In/Sign Up)
    │       ├─→ Sign up success → verify-email.tsx
    │       └─→ Sign in success → check verification
    │
    ├─→ Authenticated but unverified email
    │   └─→ verify-email.tsx
    │       ├─→ Resend verification email
    │       ├─→ Sign out
    │       └─→ After verification → (tabs)/home
    │
    ├─→ Forgot password flow
    │   └─→ reset-password.tsx
    │       └─→ update-password.tsx → back to sign-in
    │
    └─→ Authenticated AND verified
        └─→ (tabs)/_layout.tsx (Tab Navigator)
            ├── home.tsx
            ├── stories.tsx → family/[id].tsx (tap family card)
            ├── support.tsx
            ├── notifications.tsx
            └── profile.tsx (shows real user data)
                └─→ Sign out → back to index.tsx
```

### Styling Approach
- All styles use StyleSheet.create()
- Colors: Primary blue (#0066FF), black buttons, gray backgrounds
- Follows wireframe designs closely
- Uses emoji icons temporarily (should be replaced with proper icon library)

## Git & GitHub Protocol

**Repository**: https://github.com/LukeR5776/CrisisApp

### Commit Message Format
```
<Brief summary>

<Detailed description of changes>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### When to Commit
- After completing significant features
- After fixing bugs or refactoring
- Before switching to a new major task
- Always push to GitHub after committing

### Current Branch
- `main` - primary development branch

## Claude's Best Practices for This Project

### Before Making Changes
1. **Understand the request fully** - Ask clarifying questions if instructions are ambiguous
2. **Check existing code** - Read relevant files before editing to understand patterns
3. **Review wireframes** - User has Figma designs; reference them for UI work
4. **Consider MVP scope** - Focus on core functionality over polish

### While Coding
1. **Keep code clean and readable**
   - Use descriptive variable names
   - Add comments for complex logic
   - Follow existing code style and patterns

2. **Maintain consistency**
   - Match styling approach (StyleSheet patterns)
   - Use same component structure across screens
   - Follow TypeScript types strictly

3. **Think ahead for integration**
   - Write code that can easily swap mock data for Supabase queries
   - Structure components to accept props from future state management
   - Keep business logic separate from UI

4. **Remove dead code**
   - Delete unused imports
   - Remove commented-out code
   - Clean up console.logs

### After Making Changes
1. **Test TypeScript compilation**: `npx tsc --noEmit`
2. **Stage and commit changes**: `git add -A && git commit`
3. **Push to GitHub**: `git push`
4. **Update documentation** if architecture changes

### When Stuck or Unclear
1. **Ask the user questions** - Better to clarify than guess
2. **Propose multiple approaches** - Let user choose direction
3. **Check documentation** - Refer to Expo/React Native docs
4. **Review existing code** - Look at similar implementations

## Common Tasks & How to Handle Them

### Adding a New Screen
1. Create file in appropriate location (`app/` or `app/(tabs)/`)
2. Import and use mock data from `data/mockData.ts`
3. Follow existing screen structure (SafeAreaView, header, ScrollView)
4. Add TypeScript types if new data structures needed
5. Update navigation in `_layout.tsx` if adding to tabs

### Modifying Mock Data
1. Edit `data/mockData.ts`
2. Ensure TypeScript types in `types/index.ts` match
3. Update multiple files if changing data structure (home, stories, etc.)

### Integrating Real Backend (Future)
1. Create Supabase client in `lib/supabase.ts`
2. Replace mock data imports with Supabase queries
3. Add loading states and error handling
4. Implement authentication flow
5. Set up environment variables for API keys

### Styling Changes
1. Follow existing StyleSheet patterns
2. Use consistent colors (primary: #0066FF, black buttons)
3. Match spacing and sizing to wireframes
4. Test on both iOS and Android if possible

## User Workflow Expectations

### Testing Flow
User will run: `npm install` → `npm run ios`

The app should:
1. Open to Sign In screen
2. Accept any email input (no validation)
3. Navigate to Home tab on "Continue"
4. Allow navigation between all tabs
5. Allow tapping family cards to view profiles
6. Play videos in Support/Reels screen
7. Open external links for "Donate Now" buttons

### Design Reference
User has Figma wireframes showing:
- Exact layout of each screen
- Button placements and text
- Grid layouts for family cards
- Video player UI with overlays
- Stats and profile sections

Match these as closely as possible.

## Next Development Phases

### Immediate Next Steps
1. Set up Supabase project
2. Implement real authentication
3. Create database schema
4. Replace mock data with real queries
5. Add loading/error states

### Phase 2 Features
- Direct messaging (one-on-one)
- Push notifications
- Advanced gamification (lotteries, awards)
- Content discovery algorithms

### Phase 3 Features
- In-app donation processing
- Advanced verification systems
- AI-assisted content moderation
- Community features
- Analytics dashboard

## Important Reminders

### What NOT to Do
- ❌ Don't create new documentation files proactively (only when asked)
- ❌ Don't add emojis unless user requests them
- ❌ Don't implement features beyond MVP scope without asking
- ❌ Don't use bash for file operations (use Read, Write, Edit tools)
- ❌ Don't guess at user requirements - ask questions

### What TO Do
- ✅ Always commit and push changes to GitHub
- ✅ Keep code optimized and remove dead code
- ✅ Ask clarifying questions when instructions are unclear
- ✅ Follow existing patterns and conventions
- ✅ Write clean, commented code
- ✅ Test TypeScript compilation before committing
- ✅ Think about future backend integration

## Key Files to Reference

- `SETUP.md` - Setup instructions and project overview
- `README.md` - Mission, features, technical stack, roadmap
- `data/mockData.ts` - All sample data
- `types/index.ts` - TypeScript definitions
- `app/(tabs)/_layout.tsx` - Tab navigation setup

## Contact & Collaboration

This is Luke's project. Always:
1. Respect his vision and design choices
2. Ask questions when requirements are unclear
3. Propose solutions but let him make final decisions
4. Keep him informed of any architectural decisions
5. Commit regularly so he can track progress

---

**Last Updated**: Initial creation after MVP Phase 1 completion
**Current Version**: v1.0.0
**Claude Model**: Sonnet 4.5 (claude-sonnet-4-5-20250929)
