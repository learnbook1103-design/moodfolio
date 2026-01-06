-- Migration: Add peer comparison required columns to user_profiles
-- This adds job_type and years_experience columns needed for peer skill comparison

-- 1. Add job_type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'job_type'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN job_type VARCHAR(50);
    RAISE NOTICE 'Added job_type column to user_profiles';
  ELSE
    RAISE NOTICE 'job_type column already exists';
  END IF;
END $$;

-- 2. Add years_experience column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'years_experience'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN years_experience INTEGER;
    RAISE NOTICE 'Added years_experience column to user_profiles';
  ELSE
    RAISE NOTICE 'years_experience column already exists';
  END IF;
END $$;

-- 3. Migrate existing data from default_job to job_type
UPDATE user_profiles 
SET job_type = default_job 
WHERE job_type IS NULL AND default_job IS NOT NULL;

-- 4. Set default values for NULL years_experience
UPDATE user_profiles 
SET years_experience = 3 
WHERE years_experience IS NULL;

-- 5. Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_job_years 
  ON user_profiles(job_type, years_experience);

-- Verification
DO $$
DECLARE
  total_users INTEGER;
  users_with_job_type INTEGER;
  users_with_years INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM user_profiles;
  SELECT COUNT(*) INTO users_with_job_type FROM user_profiles WHERE job_type IS NOT NULL;
  SELECT COUNT(*) INTO users_with_years FROM user_profiles WHERE years_experience IS NOT NULL;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ user_profiles Migration Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total users: %', total_users;
  RAISE NOTICE 'Users with job_type: %', users_with_job_type;
  RAISE NOTICE 'Users with years_experience: %', users_with_years;
  RAISE NOTICE '';
  RAISE NOTICE '📊 Column status:';
  RAISE NOTICE '  - job_type: Added/Updated';
  RAISE NOTICE '  - years_experience: Added/Updated';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Next steps:';
  RAISE NOTICE '  1. New users will automatically populate these fields';
  RAISE NOTICE '  2. Run: SELECT refresh_peer_skill_stats();';
  RAISE NOTICE '========================================';
END $$;
