-- Migration: Support OAuth Authentication
-- Description: Update profiles table to support Google OAuth users
-- Date: 2026-02-04

-- Make phone_number optional for OAuth users
ALTER TABLE profiles
  ALTER COLUMN phone_number DROP NOT NULL;

-- Add email and avatar_url columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Add unique constraint on email (optional, but recommended)
-- ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- Update RLS policies if needed
-- Example: Allow users to read their own profile
-- CREATE POLICY "Users can view own profile"
--   ON profiles FOR SELECT
--   USING (auth.uid() = id);
