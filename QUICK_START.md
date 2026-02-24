# Quick Start Guide

## Before You Start

Make sure you have completed the Supabase setup:

1. ✅ Created a Supabase project
2. ✅ Added credentials to `.env.local`
3. ✅ **Run the database setup SQL** (see below)

## Database Setup (REQUIRED)

**The save button will not work until you complete this step!**

### Run These SQL Scripts in Order:

1. Open your Supabase dashboard → SQL Editor
2. Run each file in order:

   **Step 1:** `supabase/step1-create-table.sql`  
   **Step 2:** `supabase/step2-create-trigger.sql`  
   **Step 3:** `supabase/step3-enable-rls.sql`  
   **Step 4:** `supabase/step4-verify.sql` (optional verification)

Each step should show "Success. No rows returned"

### Full Instructions

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions.

## Common Issues

### "Save button not working"
- **Cause**: Database table not created
- **Solution**: Run the 3 SQL setup scripts above

### "User not authenticated"
- **Cause**: Not signed in
- **Solution**: Sign in to the application first

### "Failed to save content"
- **Cause**: Database connection issue
- **Solution**: Check your `.env.local` has correct Supabase credentials

## Testing the Save Feature

1. Sign in to the application
2. Generate a summary or mind map
3. Click the "Save" button
4. You should see a success message
5. Click "Load Saved" to verify it was saved

## Need Help?

- Check browser console (F12) for detailed errors
- Verify database setup in Supabase Table Editor
- See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for troubleshooting
