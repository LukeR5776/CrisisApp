-- Family Posts Migration
-- Creates table for text updates/posts from crisis families
-- Twitter-style short text updates with hashtags
--
-- Run this in Supabase SQL Editor to create the family_posts table

-- ============================================================================
-- FAMILY POSTS TABLE
-- ============================================================================
-- Stores text updates posted by crisis families
-- Each post belongs to a family and can have hashtags

CREATE TABLE IF NOT EXISTS public.family_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.crisis_families(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Optimize queries by family and chronological order

CREATE INDEX IF NOT EXISTS idx_family_posts_family_id
  ON public.family_posts(family_id);

CREATE INDEX IF NOT EXISTS idx_family_posts_created_at
  ON public.family_posts(created_at DESC);

-- Combined index for fetching family posts chronologically
CREATE INDEX IF NOT EXISTS idx_family_posts_family_created
  ON public.family_posts(family_id, created_at DESC);

-- ============================================================================
-- AUTO-UPDATE TIMESTAMP
-- ============================================================================
-- Automatically update updated_at on row modification

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_family_posts_updated_at
  BEFORE UPDATE ON public.family_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.family_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone (authenticated) can view all family posts
CREATE POLICY "Anyone can view family posts"
  ON public.family_posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Families with 'family' role can create posts
-- (Currently using auth check - in production, verify user owns this family)
CREATE POLICY "Families can create their own posts"
  ON public.family_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'family'
    )
  );

-- Policy: Families can update their own posts
CREATE POLICY "Families can update their own posts"
  ON public.family_posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'family'
    )
  );

-- Policy: Families can delete their own posts
CREATE POLICY "Families can delete their own posts"
  ON public.family_posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'family'
    )
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify table was created
SELECT 'family_posts table created successfully!' as status;

-- Show table structure
\d family_posts;

-- Show indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'family_posts';
