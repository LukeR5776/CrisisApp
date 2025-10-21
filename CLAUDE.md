# Claude Context - CrisisApp Project

## Project Overview

**CrisisApp** is a cross-platform React Native mobile application that connects families in humanitarian crises (war, displacement, climate disasters, political persecution) with a global community of supporters. The app combines storytelling, social engagement, and fundraising to amplify the voices of crisis-affected families.

### Mission
Provide a platform for crisis families to share their stories and receive direct support through a compassionate global community using engaging social media-style content delivery.

## Current Status: MVP Phase 1

All core screens have been built and are interactive. The app uses mock data and placeholder authentication. Ready for testing on iOS/Android simulators.

### Completed Features ✅
- Sign In screen (email input + OAuth placeholders)
- Home dashboard (Instagram-style feed with user stats)
- Stories/Explore page (grid of featured families)
- Support/Reels screen (TikTok-style vertical video scroll)
- Supporter profile (donation history, stats, badges)
- Crisis family profile (view-only fundraising details)
- Notifications screen
- Bottom tab navigation (persistent across all screens)
- Mock data structure (families, posts, donations, user stats)
- TypeScript type definitions
- Git repository connected to GitHub

### Not Yet Implemented 🚧
- Real authentication (Supabase Auth)
- Backend integration (Supabase PostgreSQL)
- Actual video upload/processing
- Real donation processing
- Points/gamification logic
- Content moderation tools
- Social media sharing
- Push notifications

## Technical Stack

### Core
- **React Native** - Cross-platform mobile development
- **Expo** (v52) - Managed workflow and tooling
- **Expo Router** (v6) - File-based navigation
- **TypeScript** - Type safety throughout

### Planned Backend (Not Implemented Yet)
- **Supabase Auth** - User authentication
- **Supabase PostgreSQL** - Database
- **Supabase Storage** - Media hosting
- **Zustand** - State management (installed but not used yet)

### Key Dependencies
- `expo-av` - Video playback
- `react-navigation/native` - Navigation
- `react-native-safe-area-context` - Safe area handling
- `react-native-screens` - Native screen optimization

## Project Structure

```
/CrisisApp
├── /app                          # Expo Router pages
│   ├── /(tabs)                  # Tab navigation group
│   │   ├── _layout.tsx         # Tab bar configuration
│   │   ├── home.tsx            # Home feed with posts and stats
│   │   ├── stories.tsx         # Explore/Stories grid
│   │   ├── support.tsx         # Reels-style video scroll
│   │   ├── notifications.tsx   # Notifications screen
│   │   └── profile.tsx         # Supporter profile
│   ├── /family/[id].tsx        # Dynamic family profile route
│   ├── _layout.tsx             # Root layout
│   └── index.tsx               # Sign In screen (entry point)
├── /data
│   └── mockData.ts             # All mock data (families, posts, donations)
├── /types
│   └── index.ts                # TypeScript type definitions
├── README.md                    # Project documentation
├── SETUP.md                     # Setup and run instructions
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
└── tsconfig.json               # TypeScript config
```

## Key Architecture Decisions

### Navigation
- **Expo Router** file-based routing (routes match file structure)
- Bottom tabs defined in `app/(tabs)/_layout.tsx`
- Dynamic routes use `[id]` syntax (e.g., `family/[id].tsx`)
- Sign in screen is the index route, tabs are protected behind it

### Data Flow (Current MVP)
1. All data is imported from `data/mockData.ts`
2. Components render mock data directly
3. No state management needed yet (Zustand installed for future)
4. Navigation uses `useRouter()` from expo-router

### User Types
- **Supporters**: Can view content, donate (external links), earn points/badges
- **Crisis Families**: Can create profiles, share stories (view-only in supporter perspective)
- Current implementation only shows supporter perspective

### External Dependencies
- **Fundraising**: Links to external platforms (GoFundMe, etc.) - no in-app payment processing
- **Videos**: Sample videos from Google's test library
- **Images**: Placeholder images (placeholder.com)

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

### Navigation Flow
```
index.tsx (Sign In)
    ↓ (any email input proceeds)
(tabs)/_layout.tsx (Tab Navigator)
    ├── home.tsx
    ├── stories.tsx → family/[id].tsx (tap family card)
    ├── support.tsx
    ├── notifications.tsx
    └── profile.tsx
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
