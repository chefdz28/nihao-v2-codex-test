-- ============================================================
-- NiHao V3.15 — Referral system ("invite a friend")
-- ============================================================
-- Each user gets a unique short referral code. When a new user signs up with a
-- code, we record the referral and grant both sides a reward (coins on
-- user_profiles, which already exists from the flashcard game). Fully
-- deterministic, no API, no secrets. RLS + SECURITY DEFINER RPCs, caller-scoped,
-- authenticated only. Idempotent.
-- ============================================================

-- ------------------------------------------------------------
-- 1) referral_codes: one stable code per user.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referral_codes (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- A user can read their own code. (Lookups by code happen via SECURITY DEFINER
-- RPC, so no broad read policy is needed.)
DROP POLICY IF EXISTS referral_codes_self_read ON public.referral_codes;
CREATE POLICY referral_codes_self_read ON public.referral_codes
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ------------------------------------------------------------
-- 2) referrals: who invited whom (one row per referred user).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  rewarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (referred_id)            -- a user can only be referred once
);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- A user can see referrals they made, or the one pointing to them.
DROP POLICY IF EXISTS referrals_referrer_read ON public.referrals;
CREATE POLICY referrals_referrer_read ON public.referrals
  FOR SELECT TO authenticated
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

-- ------------------------------------------------------------
-- Helper: generate a short, readable, unique code (NH-XXXX).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.gen_referral_code()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- no confusing 0/O/1/I/L
  candidate text;
  i int;
  exists_already boolean;
BEGIN
  LOOP
    candidate := 'NH-';
    FOR i IN 1..5 LOOP
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    SELECT EXISTS(SELECT 1 FROM public.referral_codes WHERE code = candidate) INTO exists_already;
    EXIT WHEN NOT exists_already;
  END LOOP;
  RETURN candidate;
END;
$$;

-- ------------------------------------------------------------
-- 3) get_my_referral_code: returns the caller's code, creating it on first call.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_referral_code()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  c text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  SELECT code INTO c FROM public.referral_codes WHERE user_id = auth.uid();
  IF c IS NULL THEN
    c := public.gen_referral_code();
    INSERT INTO public.referral_codes (user_id, code) VALUES (auth.uid(), c)
    ON CONFLICT (user_id) DO NOTHING;
    SELECT code INTO c FROM public.referral_codes WHERE user_id = auth.uid();
  END IF;
  RETURN c;
END;
$$;

-- ------------------------------------------------------------
-- 4) redeem_referral: called by a NEWLY signed-up user with the code they used.
--    Records the referral and grants both sides coins (once). Self-referral and
--    double-redeem are blocked.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.redeem_referral(p_code text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ref_id uuid;
  reward int := 50;   -- coins granted to each side
BEGIN
  IF auth.uid() IS NULL THEN RETURN 'no_auth'; END IF;
  IF coalesce(trim(p_code), '') = '' THEN RETURN 'no_code'; END IF;

  SELECT user_id INTO ref_id FROM public.referral_codes WHERE code = upper(trim(p_code));
  IF ref_id IS NULL THEN RETURN 'bad_code'; END IF;
  IF ref_id = auth.uid() THEN RETURN 'self'; END IF;

  -- already referred?
  IF EXISTS (SELECT 1 FROM public.referrals WHERE referred_id = auth.uid()) THEN
    RETURN 'already';
  END IF;

  INSERT INTO public.referrals (referrer_id, referred_id, code, rewarded)
  VALUES (ref_id, auth.uid(), upper(trim(p_code)), true);

  -- grant coins to both sides (create profile row if missing)
  INSERT INTO public.user_profiles (id, coins) VALUES (auth.uid(), reward)
  ON CONFLICT (id) DO UPDATE SET coins = public.user_profiles.coins + reward, updated_at = now();

  INSERT INTO public.user_profiles (id, coins) VALUES (ref_id, reward)
  ON CONFLICT (id) DO UPDATE SET coins = public.user_profiles.coins + reward, updated_at = now();

  RETURN 'redeemed';
END;
$$;

-- ------------------------------------------------------------
-- 5) get_my_referral_stats: how many friends the caller invited + coins earned.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_referral_stats()
RETURNS TABLE (invited_count bigint, coins_from_referrals bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  RETURN QUERY
  SELECT
    COUNT(*)::bigint AS invited_count,
    (COUNT(*) FILTER (WHERE rewarded) * 50)::bigint AS coins_from_referrals
  FROM public.referrals
  WHERE referrer_id = auth.uid();
END;
$$;

-- ------------------------------------------------------------
-- Grants: authenticated only.
-- ------------------------------------------------------------
REVOKE ALL ON FUNCTION public.gen_referral_code() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_my_referral_code() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.redeem_referral(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_my_referral_stats() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_my_referral_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_referral(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_referral_stats() TO authenticated;
