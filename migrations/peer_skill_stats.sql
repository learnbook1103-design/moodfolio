-- Migration: Add peer skill statistics for tech stack comparison
-- This enables comparing user skills with peers of the same experience level

-- 1. Create peer_skill_stats table
CREATE TABLE IF NOT EXISTS peer_skill_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Grouping dimensions
  job_type VARCHAR(50) NOT NULL,
  years_experience INTEGER NOT NULL,
  
  -- Aggregated statistics
  skill_name VARCHAR(100) NOT NULL,
  user_count INTEGER DEFAULT 0, -- Number of users with this skill
  total_users INTEGER DEFAULT 0, -- Total users in this cohort
  adoption_rate FLOAT DEFAULT 0.0, -- Percentage of users with this skill
  
  -- Metadata
  last_updated TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_job_type CHECK (job_type IN ('developer', 'designer', 'marketer', 'service')),
  CONSTRAINT valid_years CHECK (years_experience >= 0 AND years_experience <= 30),
  CONSTRAINT valid_adoption CHECK (adoption_rate >= 0.0 AND adoption_rate <= 1.0),
  
  -- Unique constraint: one stat per skill/job/years combination
  UNIQUE(job_type, years_experience, skill_name)
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_peer_stats_lookup 
  ON peer_skill_stats(job_type, years_experience, adoption_rate DESC);

CREATE INDEX IF NOT EXISTS idx_peer_stats_skill 
  ON peer_skill_stats(skill_name);

CREATE INDEX IF NOT EXISTS idx_peer_stats_updated 
  ON peer_skill_stats(last_updated DESC);

-- 3. Drop old function if exists
DROP FUNCTION IF EXISTS refresh_peer_skill_stats();

-- 4. Create function to refresh peer statistics (handles text[] arrays)
CREATE OR REPLACE FUNCTION refresh_peer_skill_stats()
RETURNS void AS $$
BEGIN
  -- Clear old stats
  TRUNCATE TABLE peer_skill_stats;
  
  -- Aggregate skills from user_profiles
  -- This version handles text[] array type (PostgreSQL native arrays)
  INSERT INTO peer_skill_stats (job_type, years_experience, skill_name, user_count, total_users, adoption_rate)
  SELECT 
    up.job_type,
    up.years_experience,
    skill,
    COUNT(DISTINCT up.id) as user_count,
    (SELECT COUNT(*) FROM user_profiles WHERE job_type = up.job_type AND years_experience = up.years_experience) as total_users,
    COUNT(DISTINCT up.id)::FLOAT / NULLIF((SELECT COUNT(*) FROM user_profiles WHERE job_type = up.job_type AND years_experience = up.years_experience), 0) as adoption_rate
  FROM user_profiles up
  CROSS JOIN LATERAL unnest(up.skills) as skill
  WHERE up.job_type IS NOT NULL 
    AND up.years_experience IS NOT NULL
    AND up.skills IS NOT NULL
    AND array_length(up.skills, 1) > 0
  GROUP BY up.job_type, up.years_experience, skill
  HAVING COUNT(DISTINCT up.id) > 0;
  
  RAISE NOTICE 'Peer skill statistics refreshed successfully';
END;
$$ LANGUAGE plpgsql;

-- 5. Create view for easy querying
CREATE OR REPLACE VIEW peer_skill_summary AS
SELECT 
  job_type,
  years_experience,
  total_users,
  COUNT(DISTINCT skill_name) as unique_skills,
  AVG(adoption_rate) as avg_adoption_rate,
  MAX(last_updated) as last_updated
FROM peer_skill_stats
GROUP BY job_type, years_experience, total_users
ORDER BY job_type, years_experience;

-- 6. Enable RLS
ALTER TABLE peer_skill_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access on peer_skill_stats" ON peer_skill_stats;
DROP POLICY IF EXISTS "Allow service role to manage peer_skill_stats" ON peer_skill_stats;

-- Allow public read access (aggregated data is anonymous)
CREATE POLICY "Allow public read access on peer_skill_stats"
  ON peer_skill_stats FOR SELECT
  USING (true);

-- Only service role can modify
CREATE POLICY "Allow service role to manage peer_skill_stats"
  ON peer_skill_stats FOR ALL
  USING (auth.role() = 'service_role');

-- 7. Initial data load (optional - run manually if needed)
-- SELECT refresh_peer_skill_stats();

-- Completion message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Peer Skill Stats Migration Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 Created table: peer_skill_stats';
  RAISE NOTICE '🔍 Created indexes for performance';
  RAISE NOTICE '🔄 Created refresh function (text[] compatible)';
  RAISE NOTICE '👁️ Created summary view';
  RAISE NOTICE '🔒 Enabled RLS policies';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Next steps:';
  RAISE NOTICE '  1. Ensure user_profiles has required columns:';
  RAISE NOTICE '     - job_type (VARCHAR)';
  RAISE NOTICE '     - years_experience (INTEGER)';
  RAISE NOTICE '     - skills (text[] array)';
  RAISE NOTICE '  2. Run: SELECT refresh_peer_skill_stats();';
  RAISE NOTICE '  3. Set up cron job for periodic refresh';
  RAISE NOTICE '========================================';
END $$;
