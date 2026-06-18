-- ============================================================
-- NiHao V3.11 — Flashcard Blitz game (cards + SRS + sessions + profile stats)
-- ============================================================
-- Adapted for NiHao: this project has NO pre-existing user_profiles table, so we
-- CREATE a lightweight one here (id + game stats) with RLS instead of assuming
-- it exists. All tables are RLS-protected and scoped to auth.uid(). No
-- service_role, no secrets. Idempotent.
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0) Lightweight per-user game profile (XP / coins / lives / streak / level).
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp integer DEFAULT 0,
  coins integer DEFAULT 0,
  lives integer DEFAULT 5,
  streak_days integer DEFAULT 0,
  last_streak_date date,
  current_level integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_profiles_select_own ON public.user_profiles;
CREATE POLICY user_profiles_select_own ON public.user_profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS user_profiles_insert_own ON public.user_profiles;
CREATE POLICY user_profiles_insert_own ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS user_profiles_update_own ON public.user_profiles;
CREATE POLICY user_profiles_update_own ON public.user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 1) Flashcards (public read).
CREATE TABLE IF NOT EXISTS public.flashcards (
  id SERIAL PRIMARY KEY,
  chinese TEXT NOT NULL,
  pinyin TEXT NOT NULL,
  arabic TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  hsk_level INTEGER DEFAULT 1,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS flashcards_select_all ON public.flashcards;
CREATE POLICY flashcards_select_all ON public.flashcards FOR SELECT USING (true);

-- 2) Per-user card SRS progress.
CREATE TABLE IF NOT EXISTS public.user_card_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id INTEGER NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  familiarity INTEGER DEFAULT 0 CHECK (familiarity BETWEEN 0 AND 5),
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  next_review TIMESTAMPTZ,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);
ALTER TABLE public.user_card_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ucp_select_own ON public.user_card_progress;
CREATE POLICY ucp_select_own ON public.user_card_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS ucp_insert_own ON public.user_card_progress;
CREATE POLICY ucp_insert_own ON public.user_card_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS ucp_update_own ON public.user_card_progress;
CREATE POLICY ucp_update_own ON public.user_card_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 3) Game sessions.
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  cards_played INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  wrong_answers INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  max_combo INTEGER DEFAULT 0
);
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS gs_select_own ON public.game_sessions;
CREATE POLICY gs_select_own ON public.game_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS gs_insert_own ON public.game_sessions;
CREATE POLICY gs_insert_own ON public.game_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS gs_update_own ON public.game_sessions;
CREATE POLICY gs_update_own ON public.game_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ucp_user_id ON public.user_card_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_ucp_next_review ON public.user_card_progress(next_review);
CREATE INDEX IF NOT EXISTS idx_gs_user_id ON public.game_sessions(user_id);
