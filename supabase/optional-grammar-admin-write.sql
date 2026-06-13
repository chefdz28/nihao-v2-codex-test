-- ============================================================
-- OPTIONAL — Admin write access for grammar tables (V2.0.5)
-- ============================================================
-- Run AFTER optional-grammar.sql. Gives users with the 'admin' role
-- (user_roles table) insert/update/delete on grammar_points and
-- grammar_exercises, so the Admin → Grammar tab can save changes.
-- Without this file: the tab loads read-only and shows a clear notice
-- when a write is attempted. Learner features are unaffected.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='grammar_points' AND policyname='Admins write grammar points') THEN
    CREATE POLICY "Admins write grammar points" ON grammar_points
      FOR ALL
      USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
      WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='grammar_exercises' AND policyname='Admins write grammar exercises') THEN
    CREATE POLICY "Admins write grammar exercises" ON grammar_exercises
      FOR ALL
      USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))
      WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'));
  END IF;
END $$;
