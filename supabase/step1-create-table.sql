-- =====================================================
-- STEP 1: Create Table and Indexes
-- =====================================================
-- Copy and run this entire block first

-- Create the saved_content table
CREATE TABLE IF NOT EXISTS saved_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_key UNIQUE (user_id, key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_saved_content_user_id ON saved_content(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_content_created_at ON saved_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_content_key ON saved_content(key);
CREATE INDEX IF NOT EXISTS idx_saved_content_value ON saved_content USING GIN (value);
