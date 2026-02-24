# Supabase Setup Guide

This guide will walk you through setting up Supabase authentication for the SeekhoWithAI application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- A Google Cloud Platform account (for Google OAuth)

## Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in the project details:
   - **Name**: SeekhoWithAI (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (this may take a few minutes)

## Step 2: Get Your Supabase Credentials

1. Once your project is ready, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (a long JWT token)
3. Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Configure Email Authentication

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Find **Email** in the list of providers
3. Ensure it's **enabled** (it should be by default)
4. Configure email settings:
   - **Enable email confirmations**: ✅ (recommended)
   - **Secure email change**: ✅ (recommended)
5. Customize email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize the "Confirm signup" template if desired

## Step 4: Set Up Google OAuth

### 4.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: **SeekhoWithAI**
   - User support email: Your email
   - Developer contact: Your email
6. For Application type, select **Web application**
7. Add authorized redirect URIs:
   ```
   https://xxxxx.supabase.co/auth/v1/callback
   ```
   (Replace `xxxxx` with your Supabase project reference)
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

### 4.2 Configure Google Provider in Supabase

1. Go back to your Supabase dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Toggle it to **Enabled**
5. Paste your **Client ID** and **Client Secret**
6. Click **Save**

## Step 5: Configure Redirect URLs

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Add your site URLs:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add the following:
     ```
     http://localhost:3000/auth/callback
     http://localhost:3000
     ```
3. For production, add your production URLs as well:
   ```
   https://yourdomain.com/auth/callback
   https://yourdomain.com
   ```

## Step 6: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. You should be redirected to the authentication page

4. Test both authentication methods:
   - **Email/Password**: Sign up with a test email
   - **Google OAuth**: Click "Continue with Google"

5. Check your email for the verification link (for email/password signup)

## Troubleshooting

### Email verification not working
- Check your spam folder
- Verify that email confirmations are enabled in Supabase
- Check the email templates in Supabase dashboard

### Google OAuth not working
- Verify your redirect URIs are correctly configured in both Google Cloud Console and Supabase
- Make sure the Google provider is enabled in Supabase
- Check that your Client ID and Secret are correct

### "Invalid redirect URL" error
- Ensure your redirect URLs are added to both:
  - Supabase URL Configuration
  - Google Cloud Console authorized redirect URIs

### Session not persisting
- Clear your browser's localStorage and cookies
- Verify that your Supabase URL and anon key are correct in `.env.local`
- Restart your development server after changing environment variables

## Production Deployment

When deploying to production:

1. Update your `.env.local` or production environment variables with the same Supabase credentials
2. Add your production domain to:
   - Supabase URL Configuration (Site URL and Redirect URLs)
   - Google Cloud Console authorized redirect URIs
3. Consider enabling additional security features in Supabase:
   - Rate limiting
   - CAPTCHA for signup
   - Email link validity duration

## Security Best Practices

- Never commit your `.env.local` file to version control
- Use Row Level Security (RLS) policies in Supabase if storing data in the database
- Regularly rotate your API keys
- Monitor authentication logs in Supabase dashboard
- Enable MFA (Multi-Factor Authentication) for admin accounts

## Next Steps

- **Set up database for content storage**: See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for instructions
- Explore Supabase database features for cloud storage of user data
- Set up Row Level Security policies (already done if you followed DATABASE_SETUP.md)
- Configure custom email templates
- Add password reset functionality
- Implement social login with other providers (GitHub, Facebook, etc.)

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
