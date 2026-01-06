-- Simple Migration: Prepare database for array-based projects
-- This only adds necessary columns; data conversion happens in application code

-- Step 1: Add projects column to user_profiles if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]'::jsonb;

-- Step 2: Initialize empty projects array for existing users
UPDATE user_profiles
SET projects = '[]'::jsonb
WHERE projects IS NULL OR projects = 'null'::jsonb;

-- Step 3: Add featured_project_ids column to portfolios if it doesn't exist
-- (This was already in add_featured_projects.sql but we include it here for completeness)
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS featured_project_ids INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- Step 4: Initialize empty featured_project_ids for existing portfolios
UPDATE portfolios
SET featured_project_ids = ARRAY[]::INTEGER[]
WHERE featured_project_ids IS NULL;

-- Step 5: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_portfolios_featured_projects 
ON portfolios USING GIN (featured_project_ids);

-- Verification and completion message
DO $$
DECLARE
  profile_count INTEGER;
  portfolio_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM user_profiles;
  SELECT COUNT(*) INTO portfolio_count FROM portfolios;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Migration Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Updated % user profiles', profile_count;
  RAISE NOTICE 'Updated % portfolios', portfolio_count;
  RAISE NOTICE '';
  RAISE NOTICE '📊 Changes made:';
  RAISE NOTICE '  - Added projects column to user_profiles';
  RAISE NOTICE '  - Added featured_project_ids to portfolios';
  RAISE NOTICE '  - Created performance indexes';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Next steps:';
  RAISE NOTICE '  - Application code will handle data conversion';
  RAISE NOTICE '  - Old project fields will be migrated on first edit';
  RAISE NOTICE '========================================';
END $$;
