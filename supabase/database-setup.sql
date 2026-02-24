-- =====================================================
-- SeekhoWithAI - Supabase Database Setup
-- =====================================================
-- This script creates the saved_content table with RLS policies
-- Run this in your Supabase SQL Editor before deploying the app
-- =====================================================

-- Create the saved_content table
CREATE TABLE IF NOT EXISTS saved_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Composite unique constraint: one key per user
  CONSTRAINT unique_user_key UNIQUE (user_id, key)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Index on user_id for fast user-specific queries
CREATE INDEX IF NOT EXISTS idx_saved_content_user_id 
  ON saved_content(user_id);

-- Index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_saved_content_created_at 
  ON saved_content(created_at DESC);

-- Index on key for fast key lookups
CREATE INDEX IF NOT EXISTS idx_saved_content_key 
  ON saved_content(key);

-- GIN index for JSONB queries (enables fast searches within JSON data)
CREATE INDEX IF NOT EXISTS idx_saved_content_value 
  ON saved_content USING GIN (value);

-- =====================================================
-- Trigger for Automatic updated_at Timestamp
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_saved_content_updated_at ON saved_content;

-- Create trigger
CREATE TRIGGER update_saved_content_updated_at
  BEFORE UPDATE ON saved_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on the table
ALTER TABLE saved_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running script)
DROP POLICY IF EXISTS "Users can view own content" ON saved_content;
DROP POLICY IF EXISTS "Users can insert own content" ON saved_content;
DROP POLICY IF EXISTS "Users can update own content" ON saved_content;
DROP POLICY IF EXISTS "Users can delete own content" ON saved_content;

-- Policy: Users can only SELECT their own data
CREATE POLICY "Users can view own content"
  ON saved_content
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only INSERT their own data
CREATE POLICY "Users can insert own content"
  ON saved_content
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own data
CREATE POLICY "Users can update own content"
  ON saved_content
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own data
CREATE POLICY "Users can delete own content"
  ON saved_content
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these to verify the setup:

-- Check table structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'saved_content';

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'saved_content';

-- Check RLS policies
-- SELECT policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'saved_content';

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================
-- Uncomment to insert sample data for testing:

-- INSERT INTO saved_content (user_id, key, value)
-- VALUES (
--   auth.uid(),
--   'summary_test_001',
--   '{
--     "type": "summary",
--     "metadata": {
--       "chapterName": "Test Chapter",
--       "classLevel": 5,
--       "subject": "Science",
--       "timestamp": 1703318400000
--     },
--     "data": {
--       "summary": "Test summary content",
--       "mindMap": {}
--     }
--   }'::jsonb
-- );

-- =====================================================
-- Cleanup (Optional - use with caution)
-- =====================================================
-- Uncomment to drop the table and start fresh:

-- DROP TABLE IF EXISTS saved_content CASCADE;
