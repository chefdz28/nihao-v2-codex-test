-- ============================================================
-- NiHao V2.9B — Student Progress System
-- ============================================================
-- Tracks completed learning content per logged-in student. RLS: a student only
-- sees/edits their own rows; admins (existing user_roles pattern) can read all.
-- Public site and SEO do NOT depend on this table — it's purely per-user state.
-- Safe to run multiple times (IF NOT EXISTS guards).
-- ============================================================

CREATE TABLE IF NOT EXISTS student_progress (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL,
  content_type  text NOT NULL,        -- 'lesson' | 'story' | 'dialogue' | 'quiz' | 'daily'
  content_slug  text NOT NULL,        -- e.g. 'airport-arrival', 'school-day', '2026-06-14'
  status        text NOT NULL DEFAULT 'completed',
  score         numeric,              -- nullable (quiz score, etc.)
  completed_at  timestamptz DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_progress_unique UNIQUE (user_id, content_type, content_slug)
);

CREATE INDEX IF NOT EXISTS idx_student_progress_user ON student_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_user_type ON student_progress(user_id, content_type);

-- keep updated_at fresh
CREATE OR REPLACE FUNCTION set_student_progress_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_student_progress_updated_at ON student_progress;
CREATE TRIGGER trg_student_progress_updated_at
  BEFORE UPDATE ON student_progress
  FOR EACH ROW EXECUTE FUNCTION set_student_progress_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- a student manages only their own rows (select/insert/update/delete)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_progress' AND policyname='Students manage own progress') THEN
    CREATE POLICY "Students manage own progress" ON student_progress
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- admins can read all rows (existing user_roles pattern)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='student_progress' AND policyname='Admins read all progress') THEN
    CREATE POLICY "Admins read all progress" ON student_progress
      FOR SELECT
      USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
  END IF;
END $$;

-- ============================================================
-- NOTE: No voice/audio storage is created here. Voice practice stays local-only
-- (record / stop / play / retry) per the V2.9 voice policy.
-- ============================================================
