-- Add avatar_url column to groups table
-- Run this in Supabase SQL Editor to add group photo support

ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN groups.avatar_url IS 'URL or URI of the group avatar/photo';
