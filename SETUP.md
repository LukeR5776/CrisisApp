# CrisisApp - Setup & Run Guide

## Prerequisites

Make sure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Xcode (for iOS testing)
- Xcode Command Line Tools
- Supabase account (for backend services)

## Initial Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory (or set environment variables):
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase dashboard: **Settings** → **API**

### 3. Database Setup

Run the database migrations in your Supabase SQL Editor:

1. Navigate to your Supabase dashboard
2. Go to **SQL Editor**
3. Run `supabase/storage-setup.sql` to create storage buckets
4. Run `supabase/crisis-families-migration.sql` to create tables

See `UPLOAD_GUIDE.md` for detailed instructions.

### 4. Add Crisis Families Content (Optional)

To populate the app with demo content:
1. Upload videos and images to Supabase Storage
2. Use the helper script to add families:
   ```bash
   npx ts-node scripts/addFamily.ts scripts/example-family.json
   ```

See `UPLOAD_GUIDE.md` for complete instructions.

## Running the App

### Start Development Server
```bash
npm start
```

### Run on iOS Simulator
```bash
npm run ios
```

Or press `i` in the terminal after running `npm start`

### Run on Android Emulator
```bash
npm run android
```

Or press `a` in the terminal after running `npm start`

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

### Authentication Screens

#### 1. Sign In/Sign Up (`app/index.tsx`)
- Email and password authentication (LIVE with Supabase)
- Toggle between sign-in and sign-up modes
- Password strength validation on sign-up
- Rate limiting (5 attempts, 15-min lockout)
- Google OAuth button (placeholder - coming soon)
- Apple Sign In button (placeholder - coming soon)
- "Forgot password?" link to password reset

#### 2. Email Verification (`app/verify-email.tsx`)
- Required for new accounts before app access
- Shows user's email address
- Resend verification email option
- Sign-out option to change email
- Clear troubleshooting instructions

#### 3. Password Reset (`app/reset-password.tsx`)
- Email input for reset request
- Sends password reset link via Supabase
- Instructions for checking email

#### 4. Update Password (`app/update-password.tsx`)
- New password entry with strength validation
- Accessed via password reset email link
- Updates password in Supabase Auth

### Main App Screens (Protected - Requires Authentication)

#### 5. Home Dashboard (`app/(tabs)/home.tsx`)
- Instagram-style feed with posts (mock data)
- Quick stats (streak, points, level)
- Notification button in header
- Like, comment, share actions on posts

#### 6. Stories/Explore (`app/(tabs)/stories.tsx`)
- Grid view of crisis families (LIVE - fetches from Supabase)
- 2-column layout with family cards
- Shows profile image, name, location, situation
- Tappable cards navigate to full family profile
- Loading/error/empty states

#### 7. Support/Reels (`app/(tabs)/support.tsx`)
- Vertical scrolling video feed (LIVE - fetches from Supabase)
- Full-screen video playback with real videos from Storage
- Auto-play when in view
- "Share Story" and "Donate Now" buttons
- Family info overlay at bottom
- Loading/error/empty states

#### 8. Profile (`app/(tabs)/profile.tsx`)
- Supporter profile with real user data (LIVE)
- Display name, email, role
- Stats (points, donations, level, streak)
- Donation history (mock data)
- Recent posts grid (mock data)
- Sign-out button

#### 9. Notifications (`app/(tabs)/notifications.tsx`)
- List of notifications (mock data)
- Unread indicators
- "Mark all read" button

#### 10. Family Profile (`app/family/[id].tsx`)
- Crisis family details (LIVE - fetches from Supabase by ID)
- Cover and profile images from Supabase Storage
- Full story text (2-3 paragraphs)
- Journey and situation overview
- Needs list with icons
- Fundraising progress bar with current/goal amounts
- "Donate Now" opens external fundraising link
- Loading/error states

## Navigation Flow

```
App Launch
    ↓
_layout.tsx (Root - Auth Controller)
    ↓
Check Session
    ↓
├─ No Session or Unverified
│  └─ index.tsx (Sign In/Sign Up)
│      ├─ Sign up → verify-email.tsx
│      └─ Forgot password → reset-password.tsx → update-password.tsx
│
└─ Authenticated & Verified
   └─ (tabs)/_layout.tsx (Protected Tab Navigator)
       ├── home.tsx (Home feed)
       ├── stories.tsx (Explore) → family/[id].tsx (Family profile)
       ├── support.tsx (Reels)
       ├── notifications.tsx
       └── profile.tsx (with sign-out)
```

## Data Sources

### Real Data (Supabase) ✅
- **User authentication** - Supabase Auth
- **User profiles** - PostgreSQL `profiles` table
- **Crisis families** - PostgreSQL `crisis_families` table
- **Videos** - Supabase Storage `family-videos` bucket
- **Images** - Supabase Storage `family-images` bucket

### Mock Data (Still Using) 🚧
Located in `data/mockData.ts`:
- Posts for home feed
- Donation history
- User stats and badges (points, level, streak)
- Notifications

## Key Features Implemented

### ✅ Completed
- File-based routing with Expo Router
- Bottom tab navigation with auth protection
- Dynamic routing for family profiles
- **Real Supabase authentication** (email/password, verification, password reset)
- **Real crisis families from database** (Stories and Reels screens)
- **Real video playback** from Supabase Storage
- **Real user profiles** from PostgreSQL
- Password strength validation and rate limiting
- Video playback with expo-av
- TypeScript types for all data models
- Responsive layouts matching wireframes
- Loading states and error handling for data fetching
- Session persistence across app restarts

### 🚧 In Progress
- Posts/donations tracking (using mock data)
- Points/gamification system (using mock data)
- User-generated content (comments, likes)

### 📋 Next Steps

#### Backend Integration
- [ ] Replace home feed mock data with real posts from database
- [ ] Implement real donation tracking
- [ ] Connect points/gamification to user actions
- [ ] Add posts table and API

#### Authentication
- [ ] Add Google OAuth flow
- [ ] Add Apple Sign In flow
- [ ] Add two-factor authentication (optional)

#### Features
- [ ] User-generated content (comments, likes, shares)
- [ ] Real-time donation tracking with webhooks
- [ ] Social media sharing integration
- [ ] Push notifications for updates
- [ ] Content moderation tools for admins
- [ ] Family profile editing for crisis families

#### Polish
- [ ] Replace emoji icons with icon library (Ionicons)
- [ ] Add animations/transitions
- [ ] Optimize video loading and streaming
- [ ] Improve placeholder images
- [ ] Add accessibility features
- [ ] Performance optimization

## Testing

### Authentication Testing
1. **Sign up flow**:
   - Enter display name, email, and password
   - Password must meet strength requirements
   - Should redirect to email verification screen
   - Check email for verification link
   - Click link to verify and access app

2. **Sign in flow**:
   - Enter email and password
   - Max 5 attempts before 15-minute lockout
   - Should redirect to home screen if verified
   - Session persists after app restart

3. **Password reset**:
   - Click "Forgot password?" on sign-in
   - Enter email and request reset
   - Check email for reset link
   - Click link and enter new password

### App Features Testing
1. **Crisis families** (real data from Supabase):
   - Navigate to Stories tab - see grid of families
   - Tap family card to view full profile
   - Navigate to Support tab - scroll through videos
   - Videos should auto-play and stream from Storage

2. **Navigation**:
   - Switch between all tabs
   - Tap family cards to view profiles
   - Use back button to return
   - Bottom tabs should be accessible from all screens

3. **Profile**:
   - View your real user data (name, email, role)
   - See stats (points, donations, level - mock data)
   - Sign out and return to sign-in screen

4. **Donations**:
   - Tap "Donate Now" on family profiles
   - Should open external GoFundMe link in browser

## Notes

- **Real data**: Authentication, user profiles, crisis families, videos/images
- **Mock data**: Home feed posts, donation tracking, notifications
- Videos stream from Supabase Storage (real files if you've uploaded them)
- Images load from Supabase Storage (real files if you've uploaded them)
- "Donate Now" opens external URLs (fundraising platforms)
- Session persists across app restarts via AsyncStorage

## Troubleshooting

### "Error initializing auth"
- Check Supabase URL and anon key in `.env`
- Verify Supabase project is accessible
- Check internet connection

### "No families showing"
- Verify database migrations were run
- Check that families were added to database
- Look for errors in app console logs

### "Videos not playing"
- Check that video URLs are correct in database
- Verify videos were uploaded to Supabase Storage
- Check that storage buckets have public read access

### "Email verification not working"
- Check email spam folder
- Verify email confirmation is enabled in Supabase Auth settings
- Check redirect URLs are configured in Supabase

## Additional Documentation

- **README.md** - Project overview and mission
- **UPLOAD_GUIDE.md** - How to add crisis families content
- **AUTH_TESTING.md** - Detailed authentication testing guide
- **SUPABASE_SETUP.md** - Supabase configuration guide
- **CLAUDE.md** - Complete project context for Claude Code
