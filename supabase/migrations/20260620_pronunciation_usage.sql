-- ============================================================
-- NiHao V3.16 — Pronunciation trainer (Groq Whisper) daily usage limit
-- ============================================================
-- Protects the Groq usage: each user can submit a limited number of
-- pronunciation attempts per day. The Edge Function calls
-- pronunciation_bump_usage which atomically increments today's counter.
-- RLS + SECURITY DEFINER, caller-scoped, authenticated only. Idempotent.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.pronunciation_usage (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT current_date,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
ALTER TABLE public.pronunciation_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pronunciation_usage_self_read ON public.pronunciation_usage;
CREATE POLICY pronunciation_usage_self_read ON public.pronunciation_usage
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.pronunciation_bump_usage()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_count integer;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  INSERT INTO public.pronunciation_usage (user_id, day, count)
  VALUES (auth.uid(), current_date, 1)
  ON CONFLICT (user_id, day)
  DO UPDATE SET count = public.pronunciation_usage.count + 1
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.pronunciation_usage_today()
RETURNS integer LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  c integer;
BEGIN
  IF auth.uid() IS NULL THEN RETURN 0; END IF;
  SELECT count INTO c FROM public.pronunciation_usage
  WHERE user_id = auth.uid() AND day = current_date;
  RETURN COALESCE(c, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.pronunciation_bump_usage() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.pronunciation_usage_today() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pronunciation_bump_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.pronunciation_usage_today() TO authenticated;
