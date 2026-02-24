# Database Setup Instructions

## Prerequisites

- A Supabase project (created during authentication setup)
- Access to Supabase SQL Editor

## Step 1: Run Database Setup SQL

The setup is split into 4 steps to avoid SQL parsing issues. Run each step in order:

### Step 1: Create Table and Indexes

1. Go to your Supabase dashboard at [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase/step1-create-table.sql`
6. Paste into the SQL Editor
7. Click **Run** or press `Ctrl+Enter`
8. ✅ You should see "Success. No rows returned"

### Step 2: Create Trigger Function

1. Click **New Query** (or clear the previous query)
2. Copy the entire contents of `supabase/step2-create-trigger.sql`
3. Paste and **Run**
4. ✅ You should see "Success. No rows returned"

### Step 3: Enable RLS and Create Policies

1. Click **New Query**
2. Copy the entire contents of `supabase/step3-enable-rls.sql`
3. Paste and **Run**
4. ✅ You should see "Success. No rows returned"

### Step 4: Verify Setup (Optional but Recommended)

1. Click **New Query**
2. Copy the entire contents of `supabase/step4-verify.sql`
3. Run each query separately to verify:
   - Table has 6 columns
   - 4-5 indexes exist
   - RLS is enabled (rowsecurity = true)
   - 4 policies exist

## Step 2: Verify Setup

Run these verification queries in the SQL Editor:

### Check Table Structure
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'saved_content';
```

Expected output: 6 columns (id, user_id, key, value, created_at, updated_at)

### Check Indexes
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'saved_content';
```

Expected output: 4-5 indexes

### Check RLS Policies
```sql
SELECT policyname, permissive, cmd
FROM pg_policies
WHERE tablename = 'saved_content';
```

Expected output: 4 policies (SELECT, INSERT, UPDATE, DELETE)

## Step 3: Test Database Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Sign in to the application

3. Generate some content (summary, quiz, etc.)

4. Click "Save"

5. Verify in Supabase dashboard:
   - Go to **Table Editor**
   - Select `saved_content` table
   - You should see your saved item

## Step 4: Test RLS Policies

1. Try to view the `saved_content` table while signed out
   - You should see no data (RLS is working)

2. Sign in with a different user
   - You should only see that user's data

## Troubleshooting

### Error: "relation 'saved_content' does not exist"
- **Solution**: Run the database setup SQL script

### Error: "permission denied for table saved_content"
- **Solution**: Check that RLS policies are enabled and created correctly

### Error: "new row violates row-level security policy"
- **Solution**: Ensure user is authenticated and `auth.uid()` returns a valid user ID

### Data not appearing after save
- **Solution**: 
  1. Check browser console for errors
  2. Verify RLS policies allow INSERT for authenticated users
  3. Check that `user_id` matches `auth.uid()`

### Migration not working
- **Solution**:
  1. Check browser console for errors
  2. Verify user is authenticated
  3. Check that localStorage has data to migrate
  4. Try manual migration by clicking "Migrate My Data" again

## Production Deployment

Before deploying to production:

1. ✅ Verify database setup is complete
2. ✅ Test all CRUD operations
3. ✅ Test RLS policies with multiple users
4. ✅ Test migration flow with sample data
5. ✅ Set up database backups in Supabase
6. ✅ Monitor database performance
7. ✅ Set up error tracking (optional but recommended)

## Database Maintenance

### Backup
Supabase automatically backs up your database. You can also create manual backups:
- Go to **Database** → **Backups** in Supabase dashboard

### Monitor Performance
- Go to **Database** → **Query Performance** to see slow queries
- Check indexes are being used effectively

### Clean Up Old Data (Optional)
If you want to delete old content:

```sql
-- Delete content older than 6 months
DELETE FROM saved_content
WHERE created_at < NOW() - INTERVAL '6 months';
```

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
