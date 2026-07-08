-- ============================================================
-- NiHao V3.16 — AI Teacher (Cohere) daily usage rate limit
-- ============================================================
-- Protects the Cohere bill: each user can call the Cohere-backed AI Teacher a
-- limited number of times per day. The Edge Function calls ai_teacher_bump_usage
-- which atomically increments today's counter and returns the new value.
-- RLS + SECURITY DEFINER, caller-scoped, authenticated only. Idempotent.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_teacher_usage (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT current_date,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
ALTER TABLE public.ai_teacher_usage ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage (e.g. to show "remaining today").
DROP POLICY IF EXISTS ai_teacher_usage_self_read ON public.ai_teacher_usage;
CREATE POLICY ai_teacher_usage_self_read ON public.ai_teacher_usage
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ------------------------------------------------------------
-- ai_teacher_bump_usage: atomically +1 today's counter, return new count.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ai_teacher_bump_usage()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_count integer;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  INSERT INTO public.ai_teacher_usage (user_id, day, count)
  VALUES (auth.uid(), current_date, 1)
  ON CONFLICT (user_id, day)
  DO UPDATE SET count = public.ai_teacher_usage.count + 1
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$;

-- ------------------------------------------------------------
-- ai_teacher_usage_today: read-only helper for the frontend (remaining calls).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ai_teacher_usage_today()
RETURNS integer LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  c integer;
BEGIN
  IF auth.uid() IS NULL THEN RETURN 0; END IF;
  SELECT count INTO c FROM public.ai_teacher_usage
  WHERE user_id = auth.uid() AND day = current_date;
  RETURN COALESCE(c, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.ai_teacher_bump_usage() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.ai_teacher_usage_today() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ai_teacher_bump_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ai_teacher_usage_today() TO authenticated;
