-- =====================================================
-- Supabase Migration: Add Enhanced Project Fields
-- =====================================================
-- Description: Adds new columns to the projects table to support
--              enhanced project information for recruiter visibility
-- Date: 2025-12-31
-- =====================================================

-- Add new columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS tech_stack TEXT,
ADD COLUMN IF NOT EXISTS team_size TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS live_url TEXT,
ADD COLUMN IF NOT EXISTS achievements TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN projects.role IS 'User role in the project (e.g., Frontend Developer, Full Stack)';
COMMENT ON COLUMN projects.tech_stack IS 'Technologies used in the project (comma-separated)';
COMMENT ON COLUMN projects.team_size IS 'Team size or individual project indicator (e.g., 4명, 개인)';
COMMENT ON COLUMN projects.github_url IS 'GitHub repository URL';
COMMENT ON COLUMN projects.live_url IS 'Live deployment/demo URL';
COMMENT ON COLUMN projects.achievements IS 'Key achievements and results from the project';

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'projects'
AND column_name IN ('role', 'tech_stack', 'team_size', 'github_url', 'live_url', 'achievements')
ORDER BY ordinal_position;
