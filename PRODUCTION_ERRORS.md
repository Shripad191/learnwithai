# Supabase Production Errors - Troubleshooting Guide

This document covers common Supabase-related errors you may encounter in production and how to handle them.

---

## 1. Authentication Errors

### Error: "User not authenticated" / "JWT expired"

**Cause**: User session has expired or user is not logged in.

**Solutions**:
- Implement automatic token refresh (already configured in `lib/supabase.ts`)
- Add session persistence checks
- Redirect to login page when session expires

**Prevention**:
```typescript
// Check session before critical operations
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
    // Redirect to login or show error
}
```

### Error: "Invalid JWT" / "PGRST301"

**Cause**: Malformed or tampered JWT token.

**Solutions**:
- Clear browser localStorage and cookies
- Force user to re-authenticate
- Check if `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct in production

---

## 2. Row Level Security (RLS) Errors

### Error: "new row violates row-level security policy"

**Cause**: RLS policies prevent the user from inserting/updating data.

**Common Scenarios**:
- User ID mismatch between `auth.uid()` and `user_id` column
- User not authenticated when trying to insert
- Policy conditions not met

**Solutions**:
1. Verify user is authenticated before save operations
2. Check RLS policies in Supabase dashboard
3. Ensure `user_id` is set correctly in insert/update operations

**Debug Query** (run in Supabase SQL Editor):
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'saved_content';

-- View policies
SELECT * FROM pg_policies 
WHERE tablename = 'saved_content';
```

### Error: "permission denied for table saved_content"

**Cause**: RLS is enabled but no policies allow the operation.

**Solutions**:
- Re-run the RLS setup SQL (`supabase/step3-enable-rls.sql`)
- Verify policies exist for SELECT, INSERT, UPDATE, DELETE
- Check that `auth.uid()` returns a valid user ID

---

## 3. Database Connection Errors

### Error: "Failed to fetch" / Network errors

**Cause**: Network connectivity issues or Supabase service down.

**Solutions**:
- Implement retry logic (already in `lib/storage-errors.ts`)
- Show user-friendly error messages
- Check Supabase status page: https://status.supabase.com

**Already Implemented**:
```typescript
// Automatic retry with exponential backoff
await retryWithBackoff(async () => {
    // Database operation
}, 3, 1000);
```

### Error: "Too many connections"

**Cause**: Connection pool exhausted (rare in serverless, but possible).

**Solutions**:
- Upgrade Supabase plan for more connections
- Implement connection pooling (Supabase handles this automatically)
- Check for connection leaks in your code

---

## 4. Rate Limiting & Quota Errors

### Error: "Rate limit exceeded"

**Cause**: Too many requests in a short time period.

**Solutions**:
- Implement client-side rate limiting
- Add debouncing to save operations
- Cache frequently accessed data
- Upgrade Supabase plan

**Prevention**:
```typescript
// Debounce save operations
const debouncedSave = debounce(handleSave, 1000);
```

### Error: "Storage quota exceeded"

**Cause**: Database storage limit reached.

**Solutions**:
- Delete old/unused content
- Implement data archival strategy
- Upgrade Supabase plan
- Compress large JSONB data

---

## 5. Data Integrity Errors

### Error: "duplicate key value violates unique constraint"

**Cause**: Trying to insert a row with a key that already exists.

**Scenario**: `unique_user_key` constraint on `(user_id, key)` pair.

**Solutions**:
- Use `upsert()` instead of `insert()` (already implemented)
- Generate unique keys properly
- Handle conflicts gracefully

**Already Handled**:
```typescript
// Using upsert to handle duplicates
await supabase
    .from('saved_content')
    .upsert({ user_id, key, value })
    .select()
    .single();
```

### Error: "value too long for type character varying"

**Cause**: Data exceeds column size limits.

**Solutions**:
- Validate data size before saving
- Truncate long strings
- Use TEXT type instead of VARCHAR

---

## 6. JSONB-Related Errors

### Error: "invalid input syntax for type json"

**Cause**: Malformed JSON data being saved.

**Solutions**:
- Validate JSON before saving
- Use TypeScript types to ensure correct structure
- Add JSON schema validation

**Prevention**:
```typescript
// Validate before saving
try {
    JSON.stringify(content);
} catch (error) {
    throw new Error('Invalid JSON data');
}
```

### Error: "JSONB path error"

**Cause**: Querying non-existent JSONB paths.

**Solutions**:
- Ensure JSONB structure is consistent
- Use null-safe operators in queries
- Validate data structure on save

---

## 7. Migration & Schema Errors

### Error: "relation 'saved_content' does not exist"

**Cause**: Database table not created.

**Solutions**:
- Run database setup SQL scripts in order:
  1. `supabase/step1-create-table.sql`
  2. `supabase/step2-create-trigger.sql`
  3. `supabase/step3-enable-rls.sql`
- Verify in Supabase Table Editor

### Error: "column does not exist"

**Cause**: Schema mismatch between code and database.

**Solutions**:
- Verify database schema matches code expectations
- Run migrations in correct order
- Check for typos in column names

---

## 8. Environment Variable Errors

### Error: "Missing Supabase environment variables"

**Cause**: `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` not set.

**Solutions**:
1. Verify `.env.local` file exists in production
2. Set environment variables in deployment platform:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
3. Restart deployment after adding variables

**Check**:
```typescript
// Already implemented in lib/supabase.ts
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables...');
}
```

---

## 9. CORS & Security Errors

### Error: "CORS policy blocked"

**Cause**: Supabase URL not in allowed origins.

**Solutions**:
- Add production domain to Supabase URL Configuration
- Go to: Supabase Dashboard → Authentication → URL Configuration
- Add: `https://yourdomain.com`

### Error: "Invalid API key"

**Cause**: Using wrong API key or key leaked/rotated.

**Solutions**:
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Regenerate keys if compromised
- Update environment variables

---

## 10. Performance Issues

### Slow Queries

**Symptoms**: Operations taking too long, timeouts.

**Solutions**:
- Add indexes (already done in `step1-create-table.sql`)
- Optimize JSONB queries
- Use pagination for large datasets
- Enable query performance monitoring in Supabase

**Check Indexes**:
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'saved_content';
```

### Large Payload Errors

**Cause**: Response size exceeds limits.

**Solutions**:
- Implement pagination (already in `getAllContent`)
- Limit JSONB data size
- Use `select()` to fetch only needed columns

---

## Monitoring & Debugging

### Enable Logging

Add comprehensive logging to track errors:

```typescript
// In production, send to logging service
console.error('[Supabase Error]', {
    operation: 'saveContent',
    error: error.message,
    timestamp: new Date().toISOString(),
    userId: user?.id,
});
```

### Supabase Dashboard Monitoring

1. **Database → Query Performance**: Check slow queries
2. **Database → Logs**: View real-time database logs
3. **Auth → Users**: Monitor authentication issues
4. **Settings → API**: Check API usage and limits

### Error Tracking Services

Consider integrating:
- **Sentry**: Error tracking and monitoring
- **LogRocket**: Session replay and error tracking
- **Datadog**: Full-stack monitoring

---

## Production Checklist

Before deploying to production:

- [ ] All database migrations run successfully
- [ ] RLS policies tested with multiple users
- [ ] Environment variables set correctly
- [ ] Production domain added to Supabase URL Configuration
- [ ] Error handling implemented for all database operations
- [ ] Rate limiting and retry logic in place
- [ ] Monitoring and logging configured
- [ ] Database backups enabled
- [ ] API keys secured (not in client-side code)
- [ ] Test authentication flow end-to-end
- [ ] Verify save/load functionality for all content types
- [ ] Check Supabase plan limits vs expected usage

---

## Emergency Procedures

### If Database is Down

1. Check Supabase status: https://status.supabase.com
2. Enable maintenance mode in your app
3. Show user-friendly error message
4. Queue operations for retry when service resumes

### If Data is Corrupted

1. Restore from Supabase backup
2. Go to: Database → Backups
3. Select restore point
4. Verify data integrity after restore

### If API Keys are Compromised

1. Rotate keys immediately in Supabase dashboard
2. Update environment variables in all deployments
3. Force all users to re-authenticate
4. Review access logs for suspicious activity

---

## Support Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **Status Page**: https://status.supabase.com
- **GitHub Issues**: https://github.com/supabase/supabase/issues

---

## Quick Error Reference

| Error Code | Meaning | Quick Fix |
|------------|---------|-----------|
| PGRST301 | JWT expired | Re-authenticate user |
| PGRST116 | Row not found | Check if data exists |
| 23505 | Unique violation | Use upsert or check for duplicates |
| 42501 | Permission denied | Check RLS policies |
| 42P01 | Table doesn't exist | Run database setup SQL |
| 08006 | Connection failure | Check network, retry |

---

**Remember**: Most errors are preventable with proper error handling, validation, and testing. The code already implements many best practices including retry logic, error types, and user-friendly messages.
