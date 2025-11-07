-- =====================================================
-- Crisis Families Table Migration for CrisisApp
-- =====================================================
-- Run this in your Supabase SQL Editor to create the crisis_families table

-- Create crisis_families table
CREATE TABLE IF NOT EXISTS public.crisis_families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  situation TEXT NOT NULL,
  story TEXT NOT NULL,
  profile_image_url TEXT NOT NULL,
  cover_image_url TEXT,
  video_url TEXT,
  fundraising_link TEXT NOT NULL,
  fundraising_goal NUMERIC NOT NULL DEFAULT 0,
  fundraising_current NUMERIC NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] NOT NULL DEFAULT '{}',
  needs JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS crisis_families_created_at_idx ON public.crisis_families(created_at DESC);

-- Create index on verified status for filtering
CREATE INDEX IF NOT EXISTS crisis_families_verified_idx ON public.crisis_families(verified);

-- Create index on tags for searching
CREATE INDEX IF NOT EXISTS crisis_families_tags_idx ON public.crisis_families USING GIN(tags);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on crisis_families table
ALTER TABLE public.crisis_families ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to all crisis families
-- (Anyone can view family profiles, even if not authenticated)
CREATE POLICY "Public read access to crisis families"
ON public.crisis_families
FOR SELECT
TO public
USING (true);

-- Policy: Allow authenticated users with 'family' role to insert their own profile
CREATE POLICY "Crisis families can insert their own profile"
ON public.crisis_families
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'family'
  )
);

-- Policy: Allow authenticated users with 'family' role to update their own profile
CREATE POLICY "Crisis families can update their own profile"
ON public.crisis_families
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'family'
  )
);

-- Policy: Allow authenticated users with 'family' role to delete their own profile
CREATE POLICY "Crisis families can delete their own profile"
ON public.crisis_families
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'family'
  )
);

-- =====================================================
-- Trigger to automatically update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.crisis_families
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- Helper function to validate needs JSONB structure
-- =====================================================

CREATE OR REPLACE FUNCTION public.validate_needs_structure()
RETURNS TRIGGER AS $$
DECLARE
  need JSONB;
BEGIN
  -- Ensure needs is an array
  IF jsonb_typeof(NEW.needs) != 'array' THEN
    RAISE EXCEPTION 'needs must be a JSON array';
  END IF;

  -- Validate each need has required fields
  FOR need IN SELECT * FROM jsonb_array_elements(NEW.needs)
  LOOP
    IF NOT (need ? 'id' AND need ? 'icon' AND need ? 'title' AND need ? 'description') THEN
      RAISE EXCEPTION 'Each need must have id, icon, title, and description fields';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_needs
BEFORE INSERT OR UPDATE ON public.crisis_families
FOR EACH ROW
EXECUTE FUNCTION public.validate_needs_structure();

-- =====================================================
-- Verify Setup
-- =====================================================

-- Check that table was created
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'crisis_families'
ORDER BY ordinal_position;

-- Check that indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'crisis_families'
AND schemaname = 'public';

-- Check that RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'crisis_families'
AND schemaname = 'public';

-- Check that policies were created
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'crisis_families'
AND schemaname = 'public';
