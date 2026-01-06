-- =====================================================
-- Migration: Add AI Docent Answers to User Profiles
-- =====================================================
-- Description: Adds a chat_answers column to store generated
--              answers for recruiters.
-- =====================================================

-- Add chat_answers column as JSONB
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS chat_answers JSONB DEFAULT '{"best_project": "", "role_contribution": "", "core_skills": ""}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.chat_answers IS 'AI-generated answers for recruiter questions (Docent Mumu feature)';

-- Verify column existence
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name = 'chat_answers';
