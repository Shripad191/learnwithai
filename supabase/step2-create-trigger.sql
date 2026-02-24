-- =====================================================
-- STEP 2: Create Trigger Function
-- =====================================================
-- Copy and run this entire block second

-- Create function for updating timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_saved_content_updated_at ON saved_content;

-- Create the trigger
CREATE TRIGGER update_saved_content_updated_at
  BEFORE UPDATE ON saved_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
