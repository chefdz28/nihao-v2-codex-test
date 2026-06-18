-- ============================================================
-- NiHao V3.9 — Teacher Dashboard (Phase 1: role + link + reports)
-- ============================================================
-- Adds a 'teacher' role, a teacher↔student link table, and safe RPCs so a
-- teacher can see ONLY their own linked students' progress — without exposing
-- auth.users to normal users and WITHOUT a service_role key in the frontend.
--
-- Security model (mirrors the V3.4.2 admin RPCs):
--   * Every function is SECURITY DEFINER but FIRST verifies the caller.
--   * A teacher only ever sees rows for students linked to THEM (teacher_id =
--     auth.uid()). Admins are allowed too.
--   * Functions granted to `authenticated` only (never anon, never service_role).
--   * Only safe fields are returned (no password hashes, tokens, IPs).
--
-- Idempotent: safe to run more than once.
-- ============================================================

-- ------------------------------------------------------------
-- 0) Role: the app already uses public.user_roles(user_id, role). We simply
--    start storing role = 'teacher' there. No schema change needed, but make
--    sure the table + RLS exist (no-op if already present).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users may read their own roles (used by the app to know if you're a teacher).
DROP POLICY IF EXISTS user_roles_self_read ON public.user_roles;
CREATE POLICY user_roles_self_read ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ------------------------------------------------------------
-- 1) Link table: which student belongs to which teacher.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teacher_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_teacher_students_teacher ON public.teacher_students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_students_student ON public.teacher_students(student_id);
ALTER TABLE public.teacher_students ENABLE ROW LEVEL SECURITY;

-- A teacher can see/insert/delete only their OWN links; a student can see links
-- pointing to them (so they know who their teacher is). No service_role needed.
DROP POLICY IF EXISTS teacher_students_teacher_all ON public.teacher_students;
CREATE POLICY teacher_students_teacher_all ON public.teacher_students
  FOR ALL TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS teacher_students_student_read ON public.teacher_students;
CREATE POLICY teacher_students_student_read ON public.teacher_students
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- ------------------------------------------------------------
-- Helpers
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_teacher_caller()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('teacher', 'admin')
  );
$$;

-- ------------------------------------------------------------
-- 2) Become a teacher: lets a signed-in user grant THEMSELVES the teacher role
--    (chosen at sign-up). Safe: only ever affects the caller's own row.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_my_role_teacher()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'teacher')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- ------------------------------------------------------------
-- 3) Link a student to me (the calling teacher) by their email. Returns a
--    short status string. Never reveals whether an email exists beyond linking.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.teacher_add_student(student_email text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  sid uuid;
BEGIN
  IF NOT public.is_teacher_caller() THEN RETURN 'not_teacher'; END IF;
  SELECT id INTO sid FROM auth.users WHERE lower(email) = lower(trim(student_email)) LIMIT 1;
  IF sid IS NULL THEN RETURN 'not_found'; END IF;
  IF sid = auth.uid() THEN RETURN 'self'; END IF;
  INSERT INTO public.teacher_students (teacher_id, student_id)
  VALUES (auth.uid(), sid)
  ON CONFLICT (teacher_id, student_id) DO NOTHING;
  RETURN 'linked';
END;
$$;

-- ------------------------------------------------------------
-- 4) Remove a linked student (only my own link).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.teacher_remove_student(p_student_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_teacher_caller() THEN RETURN; END IF;
  DELETE FROM public.teacher_students
  WHERE teacher_id = auth.uid() AND student_id = p_student_id;
END;
$$;

-- ------------------------------------------------------------
-- 5) List my students + a progress summary (one row per linked student).
--    Returns only safe fields. Teacher sees only their own students.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_teacher_students()
RETURNS TABLE (
  student_id uuid,
  email text,
  display_name text,
  linked_at timestamptz,
  last_activity timestamptz,
  lessons_done bigint,
  quiz_done bigint,
  story_done bigint,
  daily_done bigint,
  total_done bigint,
  latest_content text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_teacher_caller() THEN RETURN; END IF;
  RETURN QUERY
  SELECT
    ts.student_id,
    u.email::text,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))::text AS display_name,
    ts.created_at AS linked_at,
    MAX(sp.completed_at) AS last_activity,
    COUNT(*) FILTER (WHERE sp.content_type = 'lesson') AS lessons_done,
    COUNT(*) FILTER (WHERE sp.content_type = 'quiz') AS quiz_done,
    COUNT(*) FILTER (WHERE sp.content_type = 'story') AS story_done,
    COUNT(*) FILTER (WHERE sp.content_type = 'daily') AS daily_done,
    COUNT(sp.*) AS total_done,
    (ARRAY_AGG(sp.content_slug ORDER BY sp.completed_at DESC) FILTER (WHERE sp.content_slug IS NOT NULL))[1] AS latest_content
  FROM public.teacher_students ts
  JOIN auth.users u ON u.id = ts.student_id
  LEFT JOIN public.student_progress sp ON sp.user_id = ts.student_id
  WHERE ts.teacher_id = auth.uid()
  GROUP BY ts.student_id, u.email, u.raw_user_meta_data, ts.created_at
  ORDER BY MAX(sp.completed_at) DESC NULLS LAST;
END;
$$;

-- ------------------------------------------------------------
-- 6) Detailed progress rows for ONE of my students (safe fields only).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_teacher_student_progress(p_student_id uuid, limit_n int DEFAULT 100)
RETURNS TABLE (
  content_type text,
  content_slug text,
  status text,
  score int,
  completed_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_teacher_caller() THEN RETURN; END IF;
  -- ensure the student is actually linked to THIS teacher
  IF NOT EXISTS (
    SELECT 1 FROM public.teacher_students
    WHERE teacher_id = auth.uid() AND student_id = p_student_id
  ) THEN RETURN; END IF;
  RETURN QUERY
  SELECT sp.content_type, sp.content_slug, sp.status, sp.score, sp.completed_at
  FROM public.student_progress sp
  WHERE sp.user_id = p_student_id
  ORDER BY sp.completed_at DESC NULLS LAST
  LIMIT GREATEST(1, LEAST(limit_n, 500));
END;
$$;

-- ------------------------------------------------------------
-- Grants: authenticated only (never anon / service_role in frontend).
-- ------------------------------------------------------------
REVOKE ALL ON FUNCTION public.is_teacher_caller() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_my_role_teacher() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.teacher_add_student(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.teacher_remove_student(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_teacher_students() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_teacher_student_progress(uuid, int) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.set_my_role_teacher() TO authenticated;
GRANT EXECUTE ON FUNCTION public.teacher_add_student(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.teacher_remove_student(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_teacher_students() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_teacher_student_progress(uuid, int) TO authenticated;
