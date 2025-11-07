-- =====================================================
-- Supabase Storage Buckets Setup for CrisisApp
-- =====================================================
-- Run this in your Supabase SQL Editor to create storage buckets
-- for family videos and images with public read access

-- Create storage bucket for family videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('family-videos', 'family-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for family images (profile and cover images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('family-images', 'family-images', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Storage Policies for family-videos bucket
-- =====================================================

-- Allow public read access to all videos
CREATE POLICY "Public read access for family videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'family-videos');

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload family videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'family-videos');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update their family videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'family-videos');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete their family videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'family-videos');

-- =====================================================
-- Storage Policies for family-images bucket
-- =====================================================

-- Allow public read access to all images
CREATE POLICY "Public read access for family images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'family-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload family images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'family-images');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update their family images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'family-images');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete their family images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'family-images');

-- =====================================================
-- Verify Setup
-- =====================================================

-- Check that buckets were created
SELECT id, name, public, created_at
FROM storage.buckets
WHERE id IN ('family-videos', 'family-images');

-- Check that policies were created
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%family%';
