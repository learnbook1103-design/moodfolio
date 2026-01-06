-- First, let's inspect the user_profiles table structure
-- Run this query first to see what columns exist:

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- This will show us the actual structure so we can write the correct migration
