-- Seed Engagement Data for Demo
-- Run this script in Supabase SQL Editor to populate engagement counts
--
-- This will create random engagement (likes and shares) for all crisis families
-- Range: 50-500 likes, 10-100 shares per family
--
-- NOTE: This script temporarily removes the foreign key constraint to allow
-- fake user IDs for demo purposes. The constraint is re-added with NOT VALID
-- flag to skip validation of existing rows.

-- Step 1: Temporarily disable RLS for seeding
ALTER TABLE post_engagements DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop the foreign key constraint temporarily
-- This allows us to insert fake user_id values that don't exist in auth.users
ALTER TABLE post_engagements DROP CONSTRAINT IF EXISTS post_engagements_user_id_fkey;

-- Step 3: Insert random engagement records for each family
DO $$
DECLARE
  family_record RECORD;
  likes_count INT;
  shares_count INT;
  fake_user_id UUID;
  i INT;
BEGIN
  -- Loop through all crisis families
  FOR family_record IN SELECT id, name FROM crisis_families LOOP
    -- Generate random counts
    likes_count := floor(random() * (500 - 50 + 1) + 50)::INT;
    shares_count := floor(random() * (100 - 10 + 1) + 10)::INT;

    RAISE NOTICE 'Seeding % with % likes and % shares', family_record.name, likes_count, shares_count;

    -- Insert like records with unique fake user IDs
    FOR i IN 1..likes_count LOOP
      fake_user_id := gen_random_uuid();
      INSERT INTO post_engagements (user_id, family_id, engagement_type)
      VALUES (fake_user_id, family_record.id, 'like');
    END LOOP;

    -- Insert share records with unique fake user IDs
    FOR i IN 1..shares_count LOOP
      fake_user_id := gen_random_uuid();
      INSERT INTO post_engagements (user_id, family_id, engagement_type)
      VALUES (fake_user_id, family_record.id, 'share');
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Seeding complete!';
END $$;

-- Step 4: Re-add the foreign key constraint with NOT VALID flag
-- NOT VALID means: enforce constraint on NEW inserts, but don't validate EXISTING rows
-- This allows our fake user IDs to remain while ensuring future real engagements are valid
ALTER TABLE post_engagements
  ADD CONSTRAINT post_engagements_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
  ON DELETE CASCADE
  NOT VALID;

-- Step 5: Re-enable RLS
ALTER TABLE post_engagements ENABLE ROW LEVEL SECURITY;

-- Step 6: Refresh the materialized view to update counts
SELECT refresh_engagement_counts();

-- Step 7: Verify results
SELECT
  cf.name as family_name,
  COALESCE(ec.likes_count, 0) as likes,
  COALESCE(ec.shares_count, 0) as shares,
  COALESCE(ec.total_engagements, 0) as total
FROM crisis_families cf
LEFT JOIN engagement_counts ec ON cf.id = ec.family_id
ORDER BY cf.name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Engagement seeding complete! All families now have realistic engagement counts.';
END $$;
