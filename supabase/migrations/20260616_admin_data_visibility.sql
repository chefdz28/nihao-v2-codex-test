-- ============================================================
-- NiHao V3.4.2 — Admin Data Visibility (safe, admin-only RPCs)
-- ============================================================
-- Goal: let admins read platform data (students, progress, leads, overview)
-- WITHOUT exposing auth.users to normal users and WITHOUT a service_role key in
-- the frontend.
--
-- Security model:
--   * Each function is SECURITY DEFINER (runs with the function owner's rights so
--     it can read auth.users), but the FIRST thing every function does is verify
--     the CALLER is an admin via user_roles. Non-admins get zero rows / denied.
--   * Functions are granted to `authenticated` only (never anon).
--   * Only safe fields are returned: user_id, email, display_name, role,
--     created_at, and activity counts. No password hashes, tokens, IPs, or auth
--     internals are ever returned.
--
-- Idempotent: safe to run more than once.
-- ============================================================

-- Helper: is the current caller an admin?
CREATE OR REPLACE FUNCTION public.is_admin_caller()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  );
$$;

-- ------------------------------------------------------------
-- 1) Admin students: one row per user_role member, with email
--    (from auth.users) + a progress activity summary.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_admin_students()
RETURNS TABLE (
  user_id uuid,
  email text,
  display_name text,
  provider text,
  role text,
  joined_at timestamptz,
  last_activity timestamptz,
  lessons_done bigint,
  dialogues_done bigint,
  stories_done bigint,
  daily_done bigint,
  quiz_done bigint,
  total_done bigint,
  latest_content text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_caller() THEN
    RETURN; -- non-admins get no rows
  END IF;

  RETURN QUERY
  SELECT
    ur.user_id,
    au.email::text,
    COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name')::text AS display_name,
    COALESCE(au.raw_app_meta_data->>'provider', 'email')::text AS provider,
    ur.role::text,
    au.created_at AS joined_at,
    (SELECT max(sp.updated_at) FROM public.student_progress sp WHERE sp.user_id = ur.user_id) AS last_activity,
    (SELECT count(*) FROM public.student_progress sp WHERE sp.user_id = ur.user_id AND sp.content_type = 'lesson')   AS lessons_done,
    (SELECT count(*) FROM public.student_progress sp WHERE sp.user_id = ur.user_id AND sp.content_type = 'dialogue') AS dialogues_done,
    (SELECT count(*) FROM public.student_progress sp WHERE sp.user_id = ur.user_id AND sp.content_type = 'story')    AS stories_done,
    (SELECT count(*) FROM public.student_progress sp WHERE sp.user_id = ur.user_id AND sp.content_type = 'daily')    AS daily_done,
    (SELECT count(*) FROM public.student_progress sp WHERE sp.user_id = ur.user_id AND sp.content_type = 'quiz')     AS quiz_done,
    (SELECT count(*) FROM public.student_progress sp WHERE sp.user_id = ur.user_id) AS total_done,
    (SELECT sp.content_slug FROM public.student_progress sp WHERE sp.user_id = ur.user_id ORDER BY sp.updated_at DESC LIMIT 1) AS latest_content
  FROM public.user_roles ur
  LEFT JOIN auth.users au ON au.id = ur.user_id
  ORDER BY au.created_at DESC NULLS LAST;
END;
$$;

-- ------------------------------------------------------------
-- 2) Admin progress: student_progress rows + the user's email.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_admin_progress(limit_n integer DEFAULT 500)
RETURNS TABLE (
  user_id uuid,
  email text,
  content_type text,
  content_slug text,
  status text,
  score numeric,
  completed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_caller() THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    sp.user_id,
    au.email::text,
    sp.content_type,
    sp.content_slug,
    sp.status,
    sp.score,
    sp.completed_at,
    sp.created_at,
    sp.updated_at
  FROM public.student_progress sp
  LEFT JOIN auth.users au ON au.id = sp.user_id
  ORDER BY sp.updated_at DESC
  LIMIT GREATEST(1, LEAST(limit_n, 2000));
END;
$$;

-- ------------------------------------------------------------
-- 3) Admin email leads. (email_leads already has an admin SELECT
--    RLS policy, but we expose a function too for a consistent API.)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_admin_email_leads()
RETURNS TABLE (
  email text,
  source_path text,
  source_type text,
  consent boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_caller() THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT el.email, el.source_path, el.source_type, el.consent, el.created_at
  FROM public.email_leads el
  ORDER BY el.created_at DESC;
END;
$$;

-- ------------------------------------------------------------
-- 4) Admin overview: high-level counts for the dashboard.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_admin_overview()
RETURNS TABLE (
  total_students bigint,
  total_admins bigint,
  total_leads bigint,
  total_progress bigint,
  completions_today bigint,
  total_drafts bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_caller() THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    (SELECT count(*) FROM public.user_roles WHERE role = 'student'),
    (SELECT count(*) FROM public.user_roles WHERE role = 'admin'),
    (SELECT count(*) FROM public.email_leads),
    (SELECT count(*) FROM public.student_progress),
    (SELECT count(*) FROM public.student_progress WHERE completed_at::date = now()::date),
    (SELECT count(*) FROM public.content_drafts);
END;
$$;

-- ------------------------------------------------------------
-- Permissions: authenticated users may CALL the functions (the
-- admin check inside each function is the real gate). Never anon.
-- ------------------------------------------------------------
REVOKE ALL ON FUNCTION public.is_admin_caller()        FROM public, anon;
REVOKE ALL ON FUNCTION public.get_admin_students()      FROM public, anon;
REVOKE ALL ON FUNCTION public.get_admin_progress(integer) FROM public, anon;
REVOKE ALL ON FUNCTION public.get_admin_email_leads()   FROM public, anon;
REVOKE ALL ON FUNCTION public.get_admin_overview()      FROM public, anon;

GRANT EXECUTE ON FUNCTION public.get_admin_students()        TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_progress(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_email_leads()     TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_overview()        TO authenticated;
-- is_admin_caller is a helper used internally by the others; allow execute too.
GRANT EXECUTE ON FUNCTION public.is_admin_caller()           TO authenticated;
