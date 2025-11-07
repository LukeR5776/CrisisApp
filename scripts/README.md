# Scripts Directory

This directory contains helper scripts for managing CrisisApp data.

## Available Scripts

### `addFamily.ts`

Add crisis family profiles to the Supabase database.

**Usage:**
```bash
# Install dependencies first
npm install

# Run with a JSON file
npm run add-family my-family.json

# Or use npx directly
npx ts-node scripts/addFamily.ts my-family.json

# Show help and example
npx ts-node scripts/addFamily.ts --help
```

**Example JSON:**

See `example-family.json` in this directory for a complete template.

## Setup Requirements

Before running these scripts:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables:**

   Create a `.env` file in the project root:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Run database migrations:**

   Execute the SQL files in `supabase/` directory via your Supabase dashboard:
   - `storage-setup.sql` - Creates storage buckets
   - `crisis-families-migration.sql` - Creates database table

## Workflow

1. Upload media (videos/images) to Supabase Storage
2. Get the public URLs for your media files
3. Create a JSON file with family data (use `example-family.json` as template)
4. Run `npm run add-family your-file.json`
5. Verify in the app!

## Full Documentation

See `UPLOAD_GUIDE.md` in the project root for complete step-by-step instructions.
