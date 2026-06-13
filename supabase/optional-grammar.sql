-- ============================================================
-- OPTIONAL migration — Grammar & Sentence Builder (V2.0.3)
-- ============================================================
-- The frontend works WITHOUT these tables: lessons 1–15 ship with built-in
-- fallback grammar content, and lessons without rows show a friendly empty
-- state. Install this only when you want to manage grammar from the database
-- (and later from the Admin panel). Safe + idempotent.

CREATE TABLE IF NOT EXISTS grammar_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  order_num INTEGER NOT NULL DEFAULT 1,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  pattern TEXT NOT NULL,
  explanation_en TEXT NOT NULL,
  explanation_ar TEXT NOT NULL,
  usage_en TEXT NOT NULL DEFAULT '',
  usage_ar TEXT NOT NULL DEFAULT '',
  formal_note_en TEXT,
  formal_note_ar TEXT,
  examples JSONB NOT NULL DEFAULT '[]',          -- [{chinese,pinyin,arabic,english}]
  common_mistakes JSONB NOT NULL DEFAULT '[]',   -- [{wrong,right,note_en,note_ar}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lesson_id, order_num)
);

CREATE TABLE IF NOT EXISTS grammar_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grammar_point_id UUID REFERENCES grammar_points(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  order_num INTEGER NOT NULL DEFAULT 1,
  type TEXT NOT NULL CHECK (type IN (
    'fill_blank','word_order','formal_casual',
    'transform_question','transform_negative','dialogue','context_choice'
  )),
  prompt_en TEXT NOT NULL,
  prompt_ar TEXT NOT NULL,
  chinese TEXT,
  words JSONB,            -- ["我","是","学生","。"] for word_order
  options JSONB,          -- ["是","在","有"] for choice types
  correct TEXT NOT NULL,  -- correct option, or full sentence for word_order
  explanation_en TEXT,
  explanation_ar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grammar_points_lesson ON grammar_points(lesson_id);
CREATE INDEX IF NOT EXISTS idx_grammar_exercises_lesson ON grammar_exercises(lesson_id);

-- RLS: public read (same model as lessons/vocabulary); writes stay locked.
ALTER TABLE grammar_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_exercises ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='grammar_points' AND policyname='Public read grammar points') THEN
    CREATE POLICY "Public read grammar points" ON grammar_points FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='grammar_exercises' AND policyname='Public read grammar exercises') THEN
    CREATE POLICY "Public read grammar exercises" ON grammar_exercises FOR SELECT USING (true);
  END IF;
END $$;

-- Writes: intentionally no anon/auth write policies yet. Manage rows via the
-- Supabase SQL editor / dashboard until the Admin Grammar section ships
-- (planned V2.0.4). Example insert:
--
-- INSERT INTO grammar_points (lesson_id, order_num, title_en, title_ar, pattern,
--   explanation_en, explanation_ar, usage_en, usage_ar, examples, common_mistakes)
-- VALUES ('<lesson-uuid>', 1, 'A 是 B', 'A 是 B', 'A + 是 + B',
--   '...', '...', '...', '...',
--   '[{"chinese":"我是老师。","pinyin":"wǒ shì lǎoshī.","arabic":"أنا معلم.","english":"I am a teacher."}]',
--   '[]');
