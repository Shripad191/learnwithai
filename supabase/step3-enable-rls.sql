-- =====================================================
-- STEP 3: Enable RLS and Create Policies
-- =====================================================
-- Copy and run this entire block third

-- Enable Row Level Security
ALTER TABLE saved_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if re-running)
DROP POLICY IF EXISTS "Users can view own content" ON saved_content;
DROP POLICY IF EXISTS "Users can insert own content" ON saved_content;
DROP POLICY IF EXISTS "Users can update own content" ON saved_content;
DROP POLICY IF EXISTS "Users can delete own content" ON saved_content;

-- Create SELECT policy
CREATE POLICY "Users can view own content"
  ON saved_content
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create INSERT policy
CREATE POLICY "Users can insert own content"
  ON saved_content
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create UPDATE policy
CREATE POLICY "Users can update own content"
  ON saved_content
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create DELETE policy
CREATE POLICY "Users can delete own content"
  ON saved_content
  FOR DELETE
  USING (auth.uid() = user_id);
