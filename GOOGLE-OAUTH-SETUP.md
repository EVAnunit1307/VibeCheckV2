# Google OAuth Setup Guide

## Overview
VibeCheck now supports Google OAuth sign-in alongside phone authentication. Users can sign in with their Google account on both web and mobile.

## Supabase Configuration

### 1. Enable Google Provider in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list and click to enable it

### 2. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client IDs**
5. Configure the OAuth consent screen if prompted
6. Select **Web application** as the application type
7. Add these **Authorized redirect URIs**:
   - `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`
   - `http://localhost:8081` (for local development)
   - Your production domain when deployed

### 3. Configure Supabase with Google Credentials

1. Copy the **Client ID** and **Client Secret** from Google Cloud Console
2. In Supabase Dashboard → **Authentication** → **Providers** → **Google**:
   - Paste your **Client ID**
   - Paste your **Client Secret**
   - Click **Save**

### 4. Update Database Schema

Run this SQL in your Supabase SQL Editor to support OAuth users:

```sql
-- Update profiles table to support OAuth
ALTER TABLE profiles
  ALTER COLUMN phone_number DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
```

## How It Works

### Web
- Click "Continue with Google"
- Redirected to Google sign-in page
- Google authenticates and redirects back
- Profile automatically created if first sign-in

### Mobile (iOS/Android)
- Click "Continue with Google"
- Opens in-app browser for Google sign-in
- Deep link redirects back to app
- Session established automatically

## User Profile Creation

When a user signs in with Google for the first time:
- Profile is auto-created in the `profiles` table
- Full name extracted from Google account
- Email stored from Google account
- Avatar URL saved from Google profile picture
- Username generated from email (before @)
- Commitment score initialized to 100

## Testing

### Test on Web:
1. Run `npx expo start --web`
2. Navigate to the auth page
3. Click "Continue with Google"
4. Sign in with a test Google account

### Test on Mobile:
1. Run `npx expo start`
2. Open on device/simulator
3. Navigate to auth page
4. Click "Continue with Google"
5. Complete Google sign-in in the browser

## Troubleshooting

### Error: "Invalid OAuth callback URL"
- Ensure you've added the correct redirect URI in Google Cloud Console
- Format: `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`

### Error: "Profile creation failed"
- Check that your database schema includes optional `phone_number`
- Verify the SQL migration was run successfully

### Error: "Browser not opening on mobile"
- Check that `expo-web-browser` is installed
- Verify app.json has the correct scheme configured

## Security Notes

- Never commit Google Client Secret to version control
- Store credentials in Supabase Dashboard only
- Use environment variables for any client-side configuration
- Implement rate limiting for auth endpoints in production

## Next Steps

- Test the Google sign-in flow
- Verify profile creation works correctly
- Check that existing features work with OAuth users
- Add error handling for edge cases
