-- Engagement System for CrisisApp
-- Tracks likes and shares on family profiles displayed as posts

-- ============================================================================
-- POST ENGAGEMENTS TABLE
-- ============================================================================
-- Stores individual engagement actions (likes and shares)
-- Each row represents one user's engagement with one family

CREATE TABLE IF NOT EXISTS public.post_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES public.crisis_families(id) ON DELETE CASCADE,
  engagement_type TEXT NOT NULL CHECK (engagement_type IN ('like', 'share')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate engagements (user can only like/share once per family)
  UNIQUE(user_id, family_id, engagement_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_engagements_user_id
  ON public.post_engagements(user_id);

CREATE INDEX IF NOT EXISTS idx_post_engagements_family_id
  ON public.post_engagements(family_id);

CREATE INDEX IF NOT EXISTS idx_post_engagements_type
  ON public.post_engagements(engagement_type);

-- ============================================================================
-- ENGAGEMENT COUNTS VIEW
-- ============================================================================
-- Materialized view for fast engagement count queries
-- Aggregates likes and shares per family

CREATE MATERIALIZED VIEW IF NOT EXISTS public.engagement_counts AS
SELECT
  family_id,
  COUNT(CASE WHEN engagement_type = 'like' THEN 1 END) AS likes_count,
  COUNT(CASE WHEN engagement_type = 'share' THEN 1 END) AS shares_count,
  COUNT(*) AS total_engagements
FROM public.post_engagements
GROUP BY family_id;

-- Index on family_id for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_engagement_counts_family_id
  ON public.engagement_counts(family_id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_engagement_counts()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.engagement_counts;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on post_engagements table
ALTER TABLE public.post_engagements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all engagements (for count aggregation)
CREATE POLICY "Anyone can view engagements"
  ON public.post_engagements
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can insert their own engagements
CREATE POLICY "Users can create their own engagements"
  ON public.post_engagements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own engagements (unlike/unshare)
CREATE POLICY "Users can delete their own engagements"
  ON public.post_engagements
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get engagement counts for a specific family
CREATE OR REPLACE FUNCTION get_family_engagement_counts(target_family_id UUID)
RETURNS TABLE(likes_count BIGINT, shares_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(ec.likes_count, 0) AS likes_count,
    COALESCE(ec.shares_count, 0) AS shares_count
  FROM public.engagement_counts ec
  WHERE ec.family_id = target_family_id
  UNION ALL
  -- If not in materialized view yet, calculate directly
  SELECT
    COUNT(CASE WHEN engagement_type = 'like' THEN 1 END)::BIGINT AS likes_count,
    COUNT(CASE WHEN engagement_type = 'share' THEN 1 END)::BIGINT AS shares_count
  FROM public.post_engagements
  WHERE family_id = target_family_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has liked a family
CREATE OR REPLACE FUNCTION user_has_liked(target_family_id UUID, target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.post_engagements
    WHERE family_id = target_family_id
      AND user_id = target_user_id
      AND engagement_type = 'like'
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA REFRESH
-- ============================================================================

-- Refresh the materialized view to populate initial data
SELECT refresh_engagement_counts();

-- ============================================================================
-- NOTES FOR IMPLEMENTATION
-- ============================================================================

-- To toggle a like:
-- 1. Check if engagement exists: SELECT user_has_liked(family_id, user_id)
-- 2. If exists: DELETE FROM post_engagements WHERE ...
-- 3. If not exists: INSERT INTO post_engagements ...
-- 4. Optionally refresh counts: SELECT refresh_engagement_counts()

-- To record a share:
-- INSERT INTO post_engagements (user_id, family_id, engagement_type)
-- VALUES (user_id, family_id, 'share')
-- ON CONFLICT (user_id, family_id, engagement_type) DO NOTHING

-- To get counts for multiple families:
-- SELECT family_id, likes_count, shares_count
-- FROM engagement_counts
-- WHERE family_id = ANY(ARRAY[id1, id2, id3, ...])

-- Refresh counts periodically (e.g., every 5 minutes) with cron job or manually
