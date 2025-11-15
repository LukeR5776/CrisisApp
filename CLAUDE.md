# Claude Context - CrisisApp Project

## Project Overview

**CrisisApp** is a cross-platform React Native mobile application that connects families in humanitarian crises (war, displacement, climate disasters, political persecution) with a global community of supporters. The app combines storytelling, social engagement, and fundraising to amplify the voices of crisis-affected families.

### Mission
Provide a platform for crisis families to share their stories and receive direct support through a compassionate global community using engaging social media-style content delivery.

## Current Status: MVP Phase 2 - Real Content System Complete & Operational

All core screens have been built and are interactive. **Real authentication AND real crisis family content via Supabase is now fully implemented and operational.** The app uses real data for both auth and family profiles. **Database now contains 2 families with real media from Supabase Storage.** Ready for demo on iOS/Android simulators.

### Current Database Content
- **Family 1**: The Millican Family (Chickamauga, GA) - House fire recovery
- **Family 2**: The Hewitt Family (Trelawny, Jamaica) - Hurricane Melissa farm damage

### Completed Features ✅
- **Real Supabase Authentication System** ✅
  - Email/password sign-up with password strength validation
  - Email/password sign-in with rate limiting (5 attempts, 15-min lockout)
  - Email verification flow with resend capability
  - Password reset functionality
  - Secure session management with AsyncStorage
  - Profile creation and management in PostgreSQL
  - Zustand state management for auth state
- **Real Crisis Families Content System** ✨ OPERATIONAL
  - PostgreSQL database table for crisis families (LIVE with 2 families)
  - Supabase Storage buckets for videos and images (LIVE)
  - Family data service layer with TypeScript types
  - Stories screen fetches families from database
  - Support/Reels screen fetches families with videos
  - Family profile screen fetches by ID from database with expandable story
  - Helper script for adding families to database
  - Complete upload workflow documentation
  - **Imported families**:
    - The Millican Family (Chickamauga, GA) - ID: c53bded3-976d-4f03-beee-001fb1057a19
    - The Hewitt Family (Trelawny, Jamaica) - ID: e35506e3-0e99-40d0-8d66-326914817bab
- Sign In/Sign Up screen (real authentication + OAuth placeholders)
- Email verification screen with status checking
- Password reset and update screens
- Home dashboard (Instagram-style feed with user stats)
- Stories/Explore page (grid of real families from database)
- Support/Reels screen (TikTok-style vertical video scroll with real videos)
- Supporter profile (real user data, placeholder donations/posts)
- Crisis family profile (view-only fundraising details from database)
- Notifications screen
- Bottom tab navigation (persistent across all screens, protected by auth)
- TypeScript type definitions
- Git repository connected to GitHub

### Not Yet Implemented 🚧
- Posts/feed content (home screen still uses mock data)
- User-generated content (donations tracking, comments, likes)
- Actual video upload from mobile app
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
- **Supabase PostgreSQL** - Database with profiles and crisis_families tables (LIVE)
- **Supabase Storage** - Media hosting for videos and images (LIVE)
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
│   │   ├── stories.tsx         # Explore/Stories grid (fetches from Supabase)
│   │   ├── support.tsx         # Reels-style video scroll (fetches from Supabase)
│   │   ├── notifications.tsx   # Notifications screen
│   │   └── profile.tsx         # Supporter profile (real auth data)
│   ├── /family/[id].tsx        # Dynamic family profile route (fetches from Supabase)
│   ├── _layout.tsx             # Root layout (auth navigation controller)
│   ├── index.tsx               # Sign In/Sign Up screen (entry point)
│   ├── verify-email.tsx        # Email verification pending screen
│   ├── reset-password.tsx      # Password reset request screen
│   └── update-password.tsx     # New password entry screen
├── /lib                          # Utility libraries
│   ├── supabase.ts             # Supabase client configuration
│   ├── passwordValidator.ts    # Password strength checking
│   ├── rateLimiter.ts          # Login rate limiting logic
│   └── familiesService.ts      # Crisis families data service ✨ NEW
├── /store                        # State management
│   └── authStore.ts            # Zustand auth store
├── /data
│   └── mockData.ts             # Mock data (posts, donations - families deprecated)
├── /types
│   └── index.ts                # TypeScript type definitions
├── /supabase                     # Database migrations ✨ NEW
│   ├── storage-setup.sql       # Storage buckets configuration
│   └── crisis-families-migration.sql  # Crisis families table schema
├── /scripts                      # Helper scripts ✨ NEW
│   ├── addFamily.ts            # Add families to database
│   ├── example-family.json     # Example family data template
│   └── README.md               # Scripts documentation
├── README.md                    # Project documentation
├── SETUP.md                     # Setup and run instructions
├── UPLOAD_GUIDE.md              # Video & profile upload guide ✨ NEW
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

### Data Flow (Current MVP) ✨ UPDATED
1. **Authentication data** - Real Supabase Auth + PostgreSQL profiles
2. **Crisis families data** - Real Supabase PostgreSQL crisis_families table ✨ NEW
3. **Videos & images** - Real Supabase Storage (family-videos, family-images buckets) ✨ NEW
4. **Posts/donations data** - Still uses `data/mockData.ts` (home feed not yet connected)
5. **State management** - Zustand for auth state, React useState/useEffect for families data
6. **Data fetching** - familiesService.ts provides type-safe Supabase queries
7. Navigation uses `useRouter()` from expo-router
8. All family-related screens fetch real data from database

### User Types
- **Supporters**: Can view content, donate (external links), earn points/badges
- **Crisis Families**: Can create profiles, share stories (view-only in supporter perspective)
- Current implementation only shows supporter perspective

### External Dependencies
- **Fundraising**: Links to external platforms (GoFundMe, etc.) - no in-app payment processing
- **Videos**: Uploaded to Supabase Storage (manually via dashboard) ✨ UPDATED
- **Images**: Uploaded to Supabase Storage (manually via dashboard) ✨ UPDATED

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

#### crisis_families table (PostgreSQL) ✨ NEW
```sql
- id: uuid (primary key, auto-generated)
- name: text (family name)
- location: text (current location)
- situation: text (brief crisis description)
- story: text (full story, 2-3 paragraphs)
- profile_image_url: text (square profile photo from Storage)
- cover_image_url: text (landscape cover photo from Storage, nullable)
- video_url: text (video story from Storage, nullable)
- fundraising_link: text (external GoFundMe/etc. link)
- fundraising_goal: numeric (target amount in USD)
- fundraising_current: numeric (amount raised so far)
- verified: boolean (verification status)
- tags: text[] (hashtags array)
- needs: jsonb (array of need objects with id, icon, title, description)
- created_at: timestamp
- updated_at: timestamp
```

**Row Level Security (RLS) Policies:**
- Public read access (anyone can view families)
- Authenticated users with 'family' role can insert their own profile
- Authenticated users with 'family' role can update/delete their own profile

## Crisis Families Content System ✨ NEW

### Overview
Crisis families are now stored in Supabase and fetched dynamically by the app. Videos and images are hosted in Supabase Storage buckets. This system is production-ready and supports real content for demos.

### Supabase Storage Buckets

#### family-videos bucket
- Stores video files (MP4 recommended)
- Public read access
- Authenticated write/update/delete
- Used by Support/Reels screen for vertical video scrolling

#### family-images bucket
- Stores profile and cover images (JPEG/PNG)
- Public read access
- Authenticated write/update/delete
- Used by Stories grid and family profile screens

### Data Service Layer (`lib/familiesService.ts`)

Provides type-safe functions for fetching family data:

#### `fetchAllFamilies(options?)`
- Fetches all crisis families from database
- Optional filters: limit, verified status, ordering
- Returns: `Promise<CrisisFamily[]>`
- Used by: Stories screen

#### `fetchFamilyById(id)`
- Fetches single family by UUID
- Returns: `Promise<CrisisFamily | null>`
- Used by: Family profile screen

#### `fetchFamiliesWithVideos(options?)`
- Fetches only families that have video_url
- Optional limit parameter
- Returns: `Promise<CrisisFamily[]>`
- Used by: Support/Reels screen

#### `searchFamilies(searchTerm)`
- Search families by name, location, or tags
- Returns: `Promise<CrisisFamily[]>`
- Used by: (Future search feature)

#### `getFamiliesCount(verified?)`
- Get total count of families
- Optional filter by verification status
- Returns: `Promise<number>`
- Used by: (Future analytics)

**Data Transformation:**
- Service layer transforms snake_case database fields to camelCase TypeScript
- Validates data against CrisisFamily interface
- Handles errors gracefully with console logging

### Screen Implementation

#### Stories Screen (`app/(tabs)/stories.tsx`)
- Fetches all families on mount using `fetchAllFamilies()`
- Displays in 2-column grid with FlatList
- Shows loading spinner during fetch
- Error state with retry button
- Empty state for no families
- Real-time data from database (no mock data)

#### Support/Reels Screen (`app/(tabs)/support.tsx`)
- Fetches families with videos using `fetchFamiliesWithVideos()`
- Displays in vertical scroll with video auto-play
- Loading/error/empty states
- Videos stream from Supabase Storage
- Full-screen TikTok/Reels style

#### Family Profile Screen (`app/family/[id].tsx`)
- Fetches single family by ID using `fetchFamilyById()`
- Shows loading spinner while fetching
- Error state if family not found
- Displays full profile with story, needs, fundraising progress
- "Donate Now" opens external fundraising link

### Content Upload Workflow (How to Add More Families)

**Complete process for adding families to the database:**

#### Prerequisites Setup (One-time)
1. **Database Setup** (COMPLETED):
   - ✅ crisis_families table exists in Supabase PostgreSQL
   - ✅ Storage buckets (family-videos, family-images) exist
   - ✅ RLS policy added: "Allow inserts for development" (permits anon inserts)

2. **Environment Variables** (Required for script):
   - Supabase URL: https://zlthbhzfnozzrkvjxxuz.supabase.co
   - Anon Key: (stored in lib/supabase.ts)

#### Import Workflow (Repeat for each family)

**Step 1: Upload Media to Supabase Storage**
1. Go to Supabase dashboard → Storage
2. Upload profile image to `family-images` bucket (required)
3. Upload cover image to `family-images` bucket (optional)
4. Upload video to `family-videos` bucket (optional)
5. Copy public URLs for all uploaded files

**Step 2: Create Family JSON**
1. Copy `scripts/example-family.json` or `scripts/family-1.json` as template
2. Create new file: `scripts/family-N.json` (where N = next number)
3. Fill in all fields:
   - name, location, situation, story (required)
   - profile_image_url (required - from Supabase Storage)
   - cover_image_url, video_url (optional - from Supabase Storage or empty string)
   - fundraising_link, fundraising_goal, fundraising_current (required)
   - verified: true/false
   - tags: array of hashtags
   - needs: array of need objects (id, icon, title, description)

**Step 3: Run Import Script**
```bash
EXPO_PUBLIC_SUPABASE_URL="https://zlthbhzfnozzrkvjxxuz.supabase.co" \
EXPO_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsdGhiaHpmbm96enJrdmp4eHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjM5MTMsImV4cCI6MjA3Njg5OTkxM30.63gt13cF4FaBjF_Jri9sniFjSfUKGkuozunkJf_U5I8" \
npx ts-node scripts/addFamily.ts scripts/family-N.json
```

**Expected Output:**
```
✅ Family added successfully!
   ID: [uuid]
   Name: [Family Name]
   Location: [Location]
   Fundraising: $X / $Y
   ...
```

**Step 4: Verify in App**
1. Reload app (Metro should auto-reload)
2. Check Stories grid - new family should appear
3. Tap family card to view profile
4. If family has video, check Support/Reels tab

**Step 5: Update Documentation & Commit**
1. Update CLAUDE.md "Current Database Content" section with new family
2. Update README.md family count
3. Commit family-N.json and documentation updates
4. Push to GitHub

**See `UPLOAD_GUIDE.md` for detailed step-by-step instructions.**

#### Troubleshooting
- **"Table not found" error**: Supabase API schema cache needs reload (Settings → API → Reload schema)
- **"RLS policy violation" error**: Run SQL to add permissive policy (see setup notes)
- **Images not loading**: Verify bucket is public and URLs are correct
- **Video not playing**: Check format (MP4 H.264) and file size (<50MB)

### Helper Script (`scripts/addFamily.ts`)

Node.js/TypeScript script for easily adding families to database:

**Features:**
- Validates JSON structure before inserting
- Checks required fields (name, location, story, etc.)
- Validates needs array structure
- Inserts into Supabase crisis_families table
- Returns family ID and confirmation
- Shows helpful error messages

**Usage:**
```bash
# Show help and example JSON structure
npx ts-node scripts/addFamily.ts --help

# Add a family from JSON file
npx ts-node scripts/addFamily.ts path/to/family.json

# Or use npm script
npm run add-family family.json
```

**Requirements:**
- Environment variables set (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY)
- Valid JSON file with all required fields
- ts-node and @types/node installed (dev dependencies)

### Database Migrations

#### Storage Setup (`supabase/storage-setup.sql`)
Run this in Supabase SQL Editor to:
- Create `family-videos` and `family-images` buckets
- Set up public read access policies
- Allow authenticated users to upload/update/delete

#### Crisis Families Table (`supabase/crisis-families-migration.sql`)
Run this in Supabase SQL Editor to:
- Create `crisis_families` table with full schema
- Set up RLS policies (public read, authenticated family write)
- Create indexes on created_at, verified, tags
- Add triggers for updated_at auto-update
- Add validation function for needs JSONB structure

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

## Mock Data Structure (Deprecated) ✨ UPDATED

Located in `data/mockData.ts`:

**Note:** Crisis families data is now deprecated in mock data. Families are fetched from Supabase database instead.

```typescript
// DEPRECATED: Crisis families (now fetched from Supabase)
// Previously had 50+ mock families - no longer used

// Posts for home feed (still mock):
- Family attribution
- Media (photo/video)
- Caption and hashtags
- Likes and shares count

// User profile stats (still mock):
- Stats (points, donations, level, streak)
- Badges (achievements)
- Donation history
- Recent posts
```

**What's Real vs Mock:**
- ✅ **Real**: Crisis families, videos, images (Supabase)
- ✅ **Real**: User authentication and profiles (Supabase)
- ❌ **Mock**: Posts for home feed (mockData.ts)
- ❌ **Mock**: User stats and badges (mockData.ts)
- ❌ **Mock**: Donation tracking (mockData.ts)

## Important Implementation Notes ✨ UPDATED

### Video Scroll Screen (`app/(tabs)/support.tsx`)
- Fetches families with videos from Supabase on mount
- Uses `FlatList` with `pagingEnabled` for vertical scroll
- Video auto-plays when in view (tracked by index)
- Videos stream from Supabase Storage buckets
- Overlays for actions (share, donate, like, comment)
- Family info at bottom with semi-transparent background
- Loading/error/empty states for better UX

### Family Profile Screen (`app/family/[id].tsx`)
- Accessed via dynamic route: `/family/[id]`
- Uses `useLocalSearchParams()` to get ID
- Fetches family from Supabase database by ID (not mock data)
- Shows loading spinner while fetching
- Error handling if family not found
- "Donate Now" opens external URL with `Linking.openURL()`

### Stories/Explore Screen (`app/(tabs)/stories.tsx`)
- Fetches all families from Supabase on mount
- 2-column grid layout with FlatList
- Loading/error/empty states
- Real-time data from database

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
2. Fetch data from Supabase using service layer functions (e.g., `familiesService.ts`)
3. Follow existing screen structure (SafeAreaView, header, ScrollView)
4. Add loading/error/empty states for better UX
5. Add TypeScript types if new data structures needed
6. Update navigation in `_layout.tsx` if adding to tabs

### Adding Crisis Family Content
1. **Upload media**: Upload videos/images to Supabase Storage via dashboard
2. **Get URLs**: Copy public URLs for uploaded files
3. **Create JSON**: Use `scripts/example-family.json` as template
4. **Run script**: `npm run add-family your-family.json`
5. **Verify**: Reload app and check Stories/Reels screens
6. **See `UPLOAD_GUIDE.md` for detailed instructions**

### Integrating Real Backend (DONE for Families) ✨
1. ✅ Supabase client created in `lib/supabase.ts`
2. ✅ Crisis families use Supabase queries via `familiesService.ts`
3. ✅ Loading states and error handling implemented
4. ✅ Authentication flow fully implemented
5. ✅ Environment variables configured
6. 🚧 Posts/donations still use mock data (future work)

### Styling Changes
1. Follow existing StyleSheet patterns
2. Use consistent colors (primary: #0066FF, black buttons)
3. Match spacing and sizing to wireframes
4. Test on both iOS and Android if possible

## User Workflow Expectations ✨ UPDATED

### Setup Flow (First Time)
1. Run database migrations in Supabase (see `supabase/` directory)
2. Upload videos and images to Supabase Storage
3. Add family profiles using helper script (see `UPLOAD_GUIDE.md`)
4. Run: `npm install` → `npm run ios`

### Testing Flow
The app should:
1. Open to Sign In screen
2. Require email verification for new accounts
3. Navigate to Home tab after verified sign-in
4. Fetch real crisis families from Supabase
5. Display families in Stories grid (if families exist in database)
6. Play real videos from Supabase Storage in Support/Reels screen
7. Allow tapping family cards to view full profiles
8. Show loading/error states during data fetching
9. Open external fundraising links when "Donate Now" is tapped

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
- `UPLOAD_GUIDE.md` - Video and profile upload instructions ✨ NEW
- `lib/familiesService.ts` - Crisis families data layer ✨ NEW
- `supabase/crisis-families-migration.sql` - Database schema ✨ NEW
- `supabase/storage-setup.sql` - Storage buckets setup ✨ NEW
- `scripts/addFamily.ts` - Helper script for adding families ✨ NEW
- `scripts/example-family.json` - Family data template ✨ NEW
- `data/mockData.ts` - Mock data (posts, donations only - families deprecated)
- `types/index.ts` - TypeScript definitions
- `app/(tabs)/_layout.tsx` - Tab navigation setup
- `lib/supabase.ts` - Supabase client configuration
- `store/authStore.ts` - Auth state management

## Contact & Collaboration

This is Luke's project. Always:
1. Respect his vision and design choices
2. Ask questions when requirements are unclear
3. Propose solutions but let him make final decisions
4. Keep him informed of any architectural decisions
5. Commit regularly so he can track progress

---

**Last Updated**: MVP Phase 2 - Two Families Imported, Comprehensive Workflow Documentation
**Current Version**: v2.2.0
**Major Changes**:
- Second family imported (The Hewitt Family from Jamaica)
- Comprehensive import workflow documentation added
- Family profile improvements (expandable stories, real situation data)
- Complete troubleshooting guide for future imports
**Database Status**: 2 families operational with real Supabase Storage media
**Claude Model**: Sonnet 4.5 (claude-sonnet-4-5-20250929)
