-- Migration: add management metadata columns to whiteboards table
-- Purpose: support dashboard tabs (recent, favorites, created by me) and plan limits

BEGIN;

-- Add missing columns if they do not exist yet
ALTER TABLE whiteboards
  ADD COLUMN IF NOT EXISTS whiteboard_type TEXT DEFAULT 'tasks'::TEXT,
  ADD COLUMN IF NOT EXISTS team_id UUID NULL,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'::TEXT,
  ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ DEFAULT now();

-- Indexes to optimize filtering/sorting in dashboard
CREATE INDEX IF NOT EXISTS idx_whiteboards_status ON whiteboards(status);
CREATE INDEX IF NOT EXISTS idx_whiteboards_last_accessed_at ON whiteboards(last_accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_whiteboards_type ON whiteboards(whiteboard_type);

-- Optional foreign key to teams table (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'teams'
  ) THEN
    ALTER TABLE whiteboards
      ADD CONSTRAINT whiteboards_team_id_fkey
      FOREIGN KEY (team_id)
      REFERENCES teams(id)
      ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
