-- ============================================================
-- NiHao V2.7A — Admin Content Draft Manager (MVP)
-- ============================================================
-- Two admin-only tables for managing SEO article DRAFTS.
-- These are NOT public: no anon read, no public routes, not in sitemap.
-- Public SEO pages remain 100% static and untouched by this migration.
--
-- Admin detection reuses the existing `user_roles` table pattern:
--   a user is admin if EXISTS a row in user_roles with role = 'admin'.
--
-- Safe to run multiple times (guards with IF NOT EXISTS).
-- Requires the pgcrypto extension for gen_random_uuid() (standard on Supabase).
-- ============================================================

-- ---------- Table A: admin_content_drafts ----------
CREATE TABLE IF NOT EXISTS admin_content_drafts (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               text UNIQUE NOT NULL,
  title_ar           text NOT NULL,
  meta_title_ar      text,
  meta_description_ar text,
  target_keyword     text,
  secondary_keywords text[],
  category           text,
  content_markdown   text,
  content_json       jsonb,
  faq_json           jsonb,
  internal_links_json jsonb,
  status             text NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft', 'review', 'ready', 'archived')),
  notes              text,
  last_updated       date,
  created_by         uuid,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_drafts_status  ON admin_content_drafts(status);
CREATE INDEX IF NOT EXISTS idx_admin_drafts_keyword ON admin_content_drafts(target_keyword);

-- keep updated_at fresh
CREATE OR REPLACE FUNCTION set_admin_drafts_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_admin_drafts_updated_at ON admin_content_drafts;
CREATE TRIGGER trg_admin_drafts_updated_at
  BEFORE UPDATE ON admin_content_drafts
  FOR EACH ROW EXECUTE FUNCTION set_admin_drafts_updated_at();

-- ---------- Table B: admin_content_audit_log ----------
CREATE TABLE IF NOT EXISTS admin_content_audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id    uuid REFERENCES admin_content_drafts(id) ON DELETE SET NULL,
  action      text NOT NULL,
  details     jsonb,
  created_by  uuid,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_draft ON admin_content_audit_log(draft_id);

-- ============================================================
-- Row Level Security — ADMIN ONLY, NO PUBLIC ACCESS
-- ============================================================
ALTER TABLE admin_content_drafts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_content_audit_log ENABLE ROW LEVEL SECURITY;

-- Helper predicate: the current user has the 'admin' role.
--   EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
-- This matches the existing grammar-admin-write.sql convention.

DO $$
BEGIN
  -- drafts: admins full access (select/insert/update/delete); nobody else.
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_content_drafts' AND policyname='Admins manage content drafts') THEN
    CREATE POLICY "Admins manage content drafts" ON admin_content_drafts
      FOR ALL
      USING      (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
      WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
  END IF;

  -- audit log: admins read.
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_content_audit_log' AND policyname='Admins read audit log') THEN
    CREATE POLICY "Admins read audit log" ON admin_content_audit_log
      FOR SELECT
      USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
  END IF;

  -- audit log: admins insert (writes happen through the app on draft actions).
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_content_audit_log' AND policyname='Admins insert audit log') THEN
    CREATE POLICY "Admins insert audit log" ON admin_content_audit_log
      FOR INSERT
      WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
  END IF;
END $$;

-- ============================================================
-- MANUAL ADJUSTMENT NOTE
-- ============================================================
-- If your project does NOT use a `user_roles(user_id, role)` table, replace the
-- USING/WITH CHECK predicates above with your own admin check, e.g.:
--   USING (auth.jwt() ->> 'role' = 'admin')
-- or a profiles.is_admin boolean:
--   USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin))
-- The application also guards the route client-side via AdminRoute (isAdmin),
-- but RLS is the real security boundary — do not rely on the client alone.
-- ============================================================
