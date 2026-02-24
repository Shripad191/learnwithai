-- =====================================================
-- STEP 4: Verify Setup (Optional)
-- =====================================================
-- Run these queries to verify everything is set up correctly

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'saved_content'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'saved_content';

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'saved_content';

-- Check RLS policies
SELECT policyname, permissive, cmd
FROM pg_policies
WHERE tablename = 'saved_content';
