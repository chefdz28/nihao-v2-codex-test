-- ============================================================
-- PDF Processing Migration - Incremental update
-- Run this in Supabase SQL Editor after the main migration
-- ============================================================

-- Ensure extraction_status column exists with proper constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pdf_uploads' AND column_name = 'extraction_status'
  ) THEN
    ALTER TABLE pdf_uploads ADD COLUMN extraction_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- Ensure extracted_data column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pdf_uploads' AND column_name = 'extracted_data'
  ) THEN
    ALTER TABLE pdf_uploads ADD COLUMN extracted_data JSONB;
  END IF;
END $$;

-- Ensure status constraint allows all required values
-- First check if the constraint already exists
DO $$
BEGIN
  -- Check if there's an existing constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'pdf_uploads' AND constraint_name LIKE '%extraction_status%'
  ) THEN
    -- Drop existing constraint to recreate with correct values
    ALTER TABLE pdf_uploads DROP CONSTRAINT pdf_uploads_extraction_status_check;
  END IF;
  
  -- Add the check constraint
  ALTER TABLE pdf_uploads
    ADD CONSTRAINT pdf_uploads_extraction_status_check
    CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed'));
EXCEPTION
  WHEN others THEN
    -- Constraint may not exist, that's ok
    NULL;
END $$;

-- Ensure lessons.status allows 'draft' and 'published'
DO $$
BEGIN
  -- Drop existing constraint if it doesn't have 'draft'
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'lessons' AND constraint_name LIKE '%status%'
  ) THEN
    ALTER TABLE lessons DROP CONSTRAINT lessons_status_check;
  END IF;
  
  ALTER TABLE lessons
    ADD CONSTRAINT lessons_status_check
    CHECK (status IN ('draft', 'published'));
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pdf_uploads_status ON pdf_uploads(extraction_status);
CREATE INDEX IF NOT EXISTS idx_pdf_uploads_created ON pdf_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_lessons_level_order ON lessons(level_id, order_num);

-- Add comments for documentation
COMMENT ON COLUMN pdf_uploads.extraction_status IS 'Processing status: pending, processing, completed, or failed';
COMMENT ON COLUMN pdf_uploads.extracted_data IS 'JSON with extraction results: generated counts, processing notes, errors';

-- ============================================================
-- Note: The is_admin() function should already exist from
-- the main migration. If not, create it here:
-- ============================================================

-- Create is_admin function if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = user_uuid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
