-- ============================================================
-- NiHao V3.0A — Email Lead Capture
-- ============================================================
-- Stores ONLY a marketing email + minimal non-personal context. No name, no
-- phone, no age, no user_id, no other PII. Data stays in Supabase so it can be
-- exported later. RLS:
--   * anonymous/public may INSERT only when consent = true
--   * NO public SELECT (the list is never readable by visitors)
--   * admins (existing user_roles pattern) may read the list
-- Safe to run multiple times (IF NOT EXISTS guards).
-- ============================================================

CREATE TABLE IF NOT EXISTS email_leads (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email        text NOT NULL,
  source_path  text,            -- which page the signup came from (e.g. '/daily')
  source_type  text,            -- 'homepage' | 'footer' | 'daily' | ...
  consent      boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_leads_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_email_leads_created ON email_leads(created_at);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE email_leads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- anon + authenticated may INSERT a lead ONLY with consent = true.
  -- (No USING clause — INSERT policies use WITH CHECK only.)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='email_leads' AND policyname='Anyone can subscribe with consent') THEN
    CREATE POLICY "Anyone can subscribe with consent" ON email_leads
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (consent = true);
  END IF;

  -- Admins (existing user_roles pattern) can read the list. No other SELECT
  -- policy exists, so the public can never read leads.
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='email_leads' AND policyname='Admins read leads') THEN
    CREATE POLICY "Admins read leads" ON email_leads
      FOR SELECT
      TO authenticated
      USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
  END IF;
END $$;

-- ============================================================
-- NOTE: email is the only personal field. No name/phone/age/user_id is stored.
-- The email is never sent to analytics (GA4 receives no PII).
-- ============================================================
