-- Migration: Add featured_project_ids to portfolios table
-- This enables each portfolio to select 6 featured projects from the global project pool

ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS featured_project_ids INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- Add comment for documentation
COMMENT ON COLUMN portfolios.featured_project_ids IS 'Array of project indices (0-based) from user_profile.projects to display in this portfolio. Max 6 projects.';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_portfolios_featured_projects ON portfolios USING GIN (featured_project_ids);

-- Verification query
DO $$
BEGIN
  RAISE NOTICE '✅ Migration complete: featured_project_ids column added to portfolios table';
  RAISE NOTICE '📊 Portfolios can now select up to 6 featured projects from global project pool';
END $$;
