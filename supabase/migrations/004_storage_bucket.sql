-- =====================================================
-- Migration 004: Storage Bucket Configuration
-- Description: Creates Supabase Storage bucket for onboarding documents with RLS policies
-- Dependencies: 003_onboarding_schema.sql
-- =====================================================

-- =====================================================
-- Create Storage Bucket: onboarding-docs
-- Description: Stores documents uploaded during onboarding (RNC, cédula, etc.)
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'onboarding-docs',
  'onboarding-docs',
  FALSE,                              -- Private bucket (not publicly accessible)
  10485760,                           -- 10MB limit per file
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Row Level Security (RLS) Policies for Storage
-- =====================================================

DO $$
BEGIN
  -- Policy: Users can upload their own onboarding documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND schemaname = 'storage'
    AND policyname = 'Users can upload their own onboarding docs'
  ) THEN
    CREATE POLICY "Users can upload their own onboarding docs"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'onboarding-docs' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- Policy: Users can view their own onboarding documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND schemaname = 'storage'
    AND policyname = 'Users can view their own onboarding docs'
  ) THEN
    CREATE POLICY "Users can view their own onboarding docs"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'onboarding-docs' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- Policy: Users can update their own onboarding documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND schemaname = 'storage'
    AND policyname = 'Users can update their own onboarding docs'
  ) THEN
    CREATE POLICY "Users can update their own onboarding docs"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'onboarding-docs' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  -- Policy: Users can delete their own onboarding documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND schemaname = 'storage'
    AND policyname = 'Users can delete their own onboarding docs'
  ) THEN
    CREATE POLICY "Users can delete their own onboarding docs"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'onboarding-docs' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Note: Admin policies will be added in a separate migration after users table is confirmed to exist
