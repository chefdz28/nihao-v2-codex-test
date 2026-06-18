-- ============================================================
-- NiHao V3.10 — Teacher Dashboard (Phase 2+3: assignments + feedback/points)
-- ============================================================
-- Builds on 20260617_teacher_dashboard.sql (teacher_students link + role).
--   * assignments: a teacher assigns a lesson/sim/words task to a linked student.
--   * teacher_feedback: a teacher grants points + a note to a linked student.
-- Security: same model as phase 1 — RLS + SECURITY DEFINER RPCs that verify the
-- caller and scope every row to teacher_id = auth.uid(); a student only ever sees
-- rows addressed to them. authenticated only; never anon / service_role.
-- Idempotent: safe to run more than once. Requires phase-1 migration first.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Assignments: teacher → student tasks.
--    content_type: 'lesson' | 'sim' | 'words' | 'custom'
--    content_ref:  a route or slug the student can open (e.g. '/hsk1-simulation')
--    status:       'assigned' | 'done'  (student marks done; teacher can too)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content_type text NOT NULL DEFAULT 'custom',
  content_ref text,
  note text,
  due_date date,
  status text NOT NULL DEFAULT 'assigned',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher ON public.assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_student ON public.assignments(student_id);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Teacher manages only their own assignments.
DROP POLICY IF EXISTS assignments_teacher_all ON public.assignments;
CREATE POLICY assignments_teacher_all ON public.assignments
  FOR ALL TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- Student can read assignments addressed to them, and may UPDATE (to mark done).
DROP POLICY IF EXISTS assignments_student_read ON public.assignments;
CREATE POLICY assignments_student_read ON public.assignments
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS assignments_student_update ON public.assignments;
CREATE POLICY assignments_student_update ON public.assignments
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- ------------------------------------------------------------
-- 2) Feedback / points: teacher → student.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teacher_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points int NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_feedback_teacher ON public.teacher_feedback(teacher_id);
CREATE INDEX IF NOT EXISTS idx_feedback_student ON public.teacher_feedback(student_id);
ALTER TABLE public.teacher_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS feedback_teacher_all ON public.teacher_feedback;
CREATE POLICY feedback_teacher_all ON public.teacher_feedback
  FOR ALL TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

DROP POLICY IF EXISTS feedback_student_read ON public.teacher_feedback;
CREATE POLICY feedback_student_read ON public.teacher_feedback
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- ============================================================
-- RPCs (all SECURITY DEFINER, caller-verified, own-rows only)
-- ============================================================

-- helper: is the given student linked to the calling teacher?
CREATE OR REPLACE FUNCTION public.is_my_student(p_student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teacher_students
    WHERE teacher_id = auth.uid() AND student_id = p_student_id
  );
$$;

-- ---- assignments: teacher creates one for a linked student ----
CREATE OR REPLACE FUNCTION public.teacher_create_assignment(
  p_student_id uuid, p_title text, p_content_type text DEFAULT 'custom',
  p_content_ref text DEFAULT NULL, p_note text DEFAULT NULL, p_due date DEFAULT NULL
)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_teacher_caller() THEN RETURN 'not_teacher'; END IF;
  IF NOT public.is_my_student(p_student_id) THEN RETURN 'not_linked'; END IF;
  IF coalesce(trim(p_title), '') = '' THEN RETURN 'no_title'; END IF;
  INSERT INTO public.assignments (teacher_id, student_id, title, content_type, content_ref, note, due_date)
  VALUES (auth.uid(), p_student_id, trim(p_title), coalesce(p_content_type, 'custom'), p_content_ref, p_note, p_due);
  RETURN 'created';
END;
$$;

-- ---- assignments: teacher deletes own ----
CREATE OR REPLACE FUNCTION public.teacher_delete_assignment(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_teacher_caller() THEN RETURN; END IF;
  DELETE FROM public.assignments WHERE id = p_id AND teacher_id = auth.uid();
END;
$$;

-- ---- assignments: teacher lists assignments for one of their students ----
CREATE OR REPLACE FUNCTION public.get_student_assignments(p_student_id uuid)
RETURNS TABLE (
  id uuid, title text, content_type text, content_ref text, note text,
  due_date date, status text, created_at timestamptz, completed_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_teacher_caller() THEN RETURN; END IF;
  IF NOT public.is_my_student(p_student_id) THEN RETURN; END IF;
  RETURN QUERY
  SELECT a.id, a.title, a.content_type, a.content_ref, a.note, a.due_date, a.status, a.created_at, a.completed_at
  FROM public.assignments a
  WHERE a.teacher_id = auth.uid() AND a.student_id = p_student_id
  ORDER BY a.created_at DESC;
END;
$$;

-- ---- assignments: the STUDENT lists their own assignments ----
CREATE OR REPLACE FUNCTION public.get_my_assignments()
RETURNS TABLE (
  id uuid, title text, content_type text, content_ref text, note text,
  due_date date, status text, created_at timestamptz, teacher_name text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  RETURN QUERY
  SELECT a.id, a.title, a.content_type, a.content_ref, a.note, a.due_date, a.status, a.created_at,
         COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))::text AS teacher_name
  FROM public.assignments a
  JOIN auth.users u ON u.id = a.teacher_id
  WHERE a.student_id = auth.uid()
  ORDER BY (a.status = 'done'), a.created_at DESC;
END;
$$;

-- ---- assignments: the STUDENT marks one done ----
CREATE OR REPLACE FUNCTION public.student_complete_assignment(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.assignments
  SET status = 'done', completed_at = now()
  WHERE id = p_id AND student_id = auth.uid();
END;
$$;

-- ---- feedback: teacher grants points + note to a linked student ----
CREATE OR REPLACE FUNCTION public.teacher_give_feedback(p_student_id uuid, p_points int, p_note text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_teacher_caller() THEN RETURN 'not_teacher'; END IF;
  IF NOT public.is_my_student(p_student_id) THEN RETURN 'not_linked'; END IF;
  INSERT INTO public.teacher_feedback (teacher_id, student_id, points, note)
  VALUES (auth.uid(), p_student_id, coalesce(p_points, 0), p_note);
  RETURN 'saved';
END;
$$;

-- ---- feedback: teacher views feedback they gave a student ----
CREATE OR REPLACE FUNCTION public.get_student_feedback(p_student_id uuid)
RETURNS TABLE (id uuid, points int, note text, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_teacher_caller() THEN RETURN; END IF;
  IF NOT public.is_my_student(p_student_id) THEN RETURN; END IF;
  RETURN QUERY
  SELECT f.id, f.points, f.note, f.created_at
  FROM public.teacher_feedback f
  WHERE f.teacher_id = auth.uid() AND f.student_id = p_student_id
  ORDER BY f.created_at DESC;
END;
$$;

-- ---- feedback: the STUDENT views feedback addressed to them + total points ----
CREATE OR REPLACE FUNCTION public.get_my_feedback()
RETURNS TABLE (id uuid, points int, note text, created_at timestamptz, teacher_name text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  RETURN QUERY
  SELECT f.id, f.points, f.note, f.created_at,
         COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))::text AS teacher_name
  FROM public.teacher_feedback f
  JOIN auth.users u ON u.id = f.teacher_id
  WHERE f.student_id = auth.uid()
  ORDER BY f.created_at DESC;
END;
$$;

-- ------------------------------------------------------------
-- Grants: authenticated only.
-- ------------------------------------------------------------
REVOKE ALL ON FUNCTION public.is_my_student(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.teacher_create_assignment(uuid, text, text, text, text, date) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.teacher_delete_assignment(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_student_assignments(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_my_assignments() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.student_complete_assignment(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.teacher_give_feedback(uuid, int, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_student_feedback(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_my_feedback() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.teacher_create_assignment(uuid, text, text, text, text, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.teacher_delete_assignment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_assignments(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_assignments() TO authenticated;
GRANT EXECUTE ON FUNCTION public.student_complete_assignment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.teacher_give_feedback(uuid, int, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_feedback(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_feedback() TO authenticated;
