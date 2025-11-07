# CrisisApp - Video Upload & Family Profile Guide

This guide walks you through uploading videos and creating crisis family profiles that will appear in your app.

## Overview

The system works in 3 steps:
1. **Setup**: Run database migrations to create tables and storage buckets
2. **Upload Media**: Upload videos and images to Supabase Storage
3. **Create Profiles**: Use the helper script to add family data to the database

---

## Step 1: Setup Database & Storage

### 1.1 Run Storage Setup Migration

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `supabase/storage-setup.sql`
6. Paste into the SQL editor and click **Run**
7. You should see a success message and bucket verification results

### 1.2 Run Database Migration

1. In the **SQL Editor**, create another new query
2. Copy the contents of `supabase/crisis-families-migration.sql`
3. Paste and click **Run**
4. You should see table creation confirmation and policy setup results

### 1.3 Verify Setup

Run this query in the SQL Editor to verify everything is set up:

```sql
-- Check buckets
SELECT id, name, public FROM storage.buckets;

-- Check table
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'crisis_families';
```

You should see:
- Two buckets: `family-videos` and `family-images`
- One table: `crisis_families`

---

## Step 2: Upload Videos & Images to Supabase Storage

### 2.1 Upload Videos

1. In Supabase dashboard, click **Storage** in the left sidebar
2. Click the `family-videos` bucket
3. Click **Upload File**
4. Select your video file (recommended: MP4 format, under 100MB)
5. Once uploaded, click the video file in the list
6. Click **Copy URL** to get the public URL
7. Save this URL - you'll need it for the profile JSON

**Video Best Practices:**
- Format: MP4 (H.264 codec)
- Resolution: 1080x1920 (vertical/portrait) or 1920x1080 (horizontal)
- Duration: 30 seconds to 2 minutes
- Size: Under 50MB for best mobile performance
- Compression: Use HandBrake or similar to compress if needed

### 2.2 Upload Images

1. In **Storage**, click the `family-images` bucket
2. Upload profile image (recommended: square, 500x500px minimum)
3. Upload cover image (recommended: 16:9 ratio, 1200x675px minimum)
4. Copy the public URLs for both images
5. Save these URLs for the profile JSON

**Image Best Practices:**
- Profile image: Square (1:1 ratio), JPEG or PNG
- Cover image: Landscape (16:9 ratio), JPEG or PNG
- Size: Under 2MB each
- Quality: Use compression tools like TinyPNG if needed

### 2.3 Get Your Storage URLs

Your media URLs will look like this:
```
https://[your-project-id].supabase.co/storage/v1/object/public/family-videos/video-name.mp4
https://[your-project-id].supabase.co/storage/v1/object/public/family-images/profile.jpg
https://[your-project-id].supabase.co/storage/v1/object/public/family-images/cover.jpg
```

---

## Step 3: Create Family Profiles

### 3.1 Prepare Your Family Data

1. Copy `scripts/example-family.json` to a new file (e.g., `my-family.json`)
2. Edit the JSON file with your family's information:

```json
{
  "name": "Your Family Name",
  "location": "City, Country",
  "situation": "Brief crisis description",
  "story": "Full story (2-3 paragraphs)",
  "profile_image_url": "https://[your-supabase-url]/storage/v1/object/public/family-images/profile.jpg",
  "cover_image_url": "https://[your-supabase-url]/storage/v1/object/public/family-images/cover.jpg",
  "video_url": "https://[your-supabase-url]/storage/v1/object/public/family-videos/video.mp4",
  "fundraising_link": "https://gofundme.com/your-campaign",
  "fundraising_goal": 10000,
  "fundraising_current": 2500,
  "verified": true,
  "tags": ["#YourTag1", "#YourTag2", "#YourTag3"],
  "needs": [
    {
      "id": "1",
      "icon": "🍲",
      "title": "Food",
      "description": "Basic nutrition needs"
    }
  ]
}
```

### 3.2 Run the Helper Script

In your terminal, from the project root:

```bash
npx ts-node scripts/addFamily.ts my-family.json
```

You should see output like:
```
🌍 CrisisApp - Add Family Helper
=================================

📝 Adding family to database...
   Name: Your Family Name
   Location: City, Country

✅ Family added successfully!
   ID: abc123-def456-ghi789
   Name: Your Family Name
   Location: City, Country
   Video: https://...
   Fundraising: $2500 / $10000
   ...
```

### 3.3 Verify in App

1. Run your app: `npm run ios` or `npm run android`
2. Navigate to the Stories/Explore tab
3. You should see your family in the grid
4. Tap the card to view the full profile
5. Go to the Support/Reels tab to see the video

---

## Step 4: Add More Families

Repeat Step 2 and Step 3 for each family you want to add:

1. Upload videos and images to Supabase Storage
2. Create a new JSON file with the family data
3. Run `npx ts-node scripts/addFamily.ts <your-file.json>`

---

## Quick Reference: Field Descriptions

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `name` | Yes | Family name | "The Johnson Family" |
| `location` | Yes | Current location | "Aleppo, Syria" |
| `situation` | Yes | Brief crisis summary | "Displaced by war" |
| `story` | Yes | Full story (2-3 paragraphs) | "We fled our home..." |
| `profile_image_url` | Yes | Square profile photo URL | https://... |
| `cover_image_url` | No | Landscape cover photo URL | https://... |
| `video_url` | No | Video story URL (for Reels) | https://... |
| `fundraising_link` | Yes | External fundraising URL | https://gofundme.com/... |
| `fundraising_goal` | Yes | Target amount (USD) | 15000 |
| `fundraising_current` | Yes | Amount raised so far (USD) | 5800 |
| `verified` | No | Verification status (true/false) | true |
| `tags` | Yes | Hashtags (array of strings) | ["#Syria", "#Hope"] |
| `needs` | Yes | Array of need objects | See example above |

### Need Object Structure

Each need must have:
- `id`: Unique ID (use "1", "2", "3", etc.)
- `icon`: Emoji representing the need (🍲, 🏥, 📚, 🏠, etc.)
- `title`: Short title (1-4 words)
- `description`: Brief description (5-10 words)

---

## Troubleshooting

### "Table does not exist" Error

**Problem:** The crisis_families table hasn't been created.

**Solution:** Run the database migration from `supabase/crisis-families-migration.sql` in your Supabase SQL Editor.

### "Bucket does not exist" Error

**Problem:** Storage buckets haven't been created.

**Solution:** Run the storage setup from `supabase/storage-setup.sql` in your Supabase SQL Editor.

### "Row Level Security policy violation" Error

**Problem:** RLS policies are blocking the insert.

**Solution:**
- Make sure you're authenticated in Supabase (policies allow authenticated users)
- Or temporarily disable RLS on the table (not recommended for production)

### Videos Not Playing in App

**Possible Causes:**
1. Video URL is incorrect - check the URL in Supabase Storage
2. Video format not supported - use MP4 with H.264 codec
3. File is too large - compress to under 50MB
4. Bucket is not public - check bucket settings in Supabase

### Images Not Showing

**Possible Causes:**
1. Image URL is incorrect - verify the URL works in a browser
2. Bucket is not public - check bucket settings
3. RLS policies blocking access - verify storage policies

### Family Not Appearing in App

**Checklist:**
1. Verify family was added: Check Supabase Table Editor
2. Check app is fetching from Supabase (not mock data)
3. Reload the app completely
4. Check for console errors in the app logs

---

## Tips for Demo Content

### Using AI to Generate Profiles

You can use AI tools (ChatGPT, Claude, etc.) to generate realistic family profiles:

**Prompt example:**
```
Generate a realistic crisis family profile for a CrisisApp demo. Include:
- Family name
- Location (real crisis region)
- Crisis situation (war/climate/persecution)
- Compelling story (2-3 paragraphs)
- 4-5 specific needs with descriptions
- Appropriate hashtags

Make it realistic and respectful.
```

Then format the output into the JSON structure.

### Creating Mock Videos

For demo purposes, you can:
1. Record short vertical videos on your phone
2. Use free stock video sites (Pexels, Pixabay) - filter for "portrait" or "vertical"
3. Create simple video messages explaining the demo
4. Use AI video generation tools (D-ID, Synthesia)

### Finding GoFundMe Links

For the demo:
1. Use placeholder links: `https://gofundme.com/family-name`
2. Or link to real humanitarian campaigns (with permission)
3. Or create test campaigns on fundraising platforms

---

## Environment Variables

Make sure your `.env` file (or environment) has:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

These are needed for:
- The helper script to insert data
- The app to fetch data

Get these from your Supabase dashboard: **Settings** → **API**

---

## Next Steps

After adding several families:

1. **Test the app thoroughly**
   - Browse the Stories grid
   - Watch videos in the Support/Reels feed
   - View full family profiles
   - Test external fundraising links

2. **Iterate on content**
   - Adjust stories for maximum impact
   - Optimize video compression
   - Test on different devices

3. **Prepare for production**
   - Set up content moderation
   - Implement real donation tracking
   - Add analytics

---

## Support

If you encounter issues:

1. Check the Supabase logs: **Logs** → **API** in dashboard
2. Check app console logs: `npx expo start` output
3. Verify environment variables are set correctly
4. Review TypeScript errors: `npx tsc --noEmit`

For questions about the system architecture, see:
- `CLAUDE.md` - Full project context
- `README.md` - Project overview
- `SETUP.md` - Initial setup guide

---

**Happy uploading! 🌍**
