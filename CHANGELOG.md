# NiHao V2 — Changelog

## V2.0.2 (2026-06-12)

### Changed
- Set `package.json` version to `2.0.2` and kept engines at Node.js >= 18.20.8 / npm >= 9 for the RunCloud test target.
- Replaced the stale `package-lock.json` content because it still contained Vite 7, React Router 7, Supabase JS 2.108.x, and other Node 20-only package entries from the previous toolchain. Run `npm install` on RunCloud/CI with normal npm registry access to hydrate the clean Node 18 lockfile from the pinned package versions.
- Made optional `pronunciation_results` reads and writes failure-safe so the app continues working when that optional table is not installed.

### Verified
- `npm run build` completed successfully with the Vite 5.4.21 package installed in this workspace.
- `npm install` was attempted, but this workspace registry proxy returned 403 for npm registry requests; repeat it on RunCloud/CI to regenerate the lockfile before test deployment.

## V2.0.1 (2026-06-12)

### Changed
- Downgraded the frontend build toolchain for RunCloud Node 18.20.8 compatibility: `vite@5.4.21`, `@vitejs/plugin-react@4.7.0`, `react-router@6.30.1`, `react-router-dom@6.30.1`, and `@supabase/supabase-js@2.46.0`.
- Removed `kimi-plugin-inspect-react` because it peers against Vite 7 and would keep the app tied to the Node 20-only toolchain.
- Updated `package.json` engines to Node.js >= 18.20.8 and npm >= 9 for the RunCloud build server.
- Expanded deployment documentation for RunCloud/Apache SPA fallback, Supabase environment variables, asset upload order, and no-secrets handling.
- Expanded testing documentation with route, lesson-flow, Supabase, SPA, and Node 18 compatibility checks.

### Verified
- `npm run build` completed successfully with Vite 5.4.21 and no TypeScript errors.
- `npm install` should be run on RunCloud/CI with normal npm registry access to refresh Node 18 packages; this workspace registry proxy returned 403 for uncached downgraded packages.
- `dist/index.html` uses root-relative `/assets/...` links while Vite `base` remains `/`.
- Frontend Supabase client uses only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Known risks
- The compatibility fix was built in this workspace with Node 24 because Node 18.20.8 is not installed here; package engines and selected toolchain versions are set for the RunCloud Node 18.20.8 build test.
- Live logged-in `user_progress` writes still require a real authenticated Supabase session to verify end-to-end.

## V2.0.0 (2026-06-12)

### Added
- **Complete lesson flow**: single clean action bar in every lesson with Previous Lesson / Next Lesson / Complete Lesson / Back to Courses, driven by `order_num`. Complete saves `user_progress` (status=completed, completion_percentage=100, last_accessed_at, updated_at) when logged in, and simply navigates to the next lesson when logged out — no crash either way. The old duplicated floating bottom bar was removed.
- **Flashcards** (`/flashcards` page + a Flashcards tab inside every lesson): Chinese front, tap to reveal pinyin + Arabic + English, audio button, "I know it" / "Review again" queue logic, deck-complete screen. New shared component `src/components/FlashcardDeck.tsx`.
- **Listening practice** (tab inside every lesson + Practice hub): plays Chinese TTS, learner picks the correct meaning (EN/AR shown by UI language), local scoring, restart. New shared component `src/components/ListeningPractice.tsx`.
- **Writing practice V2**: light paper-style canvas with 田字格 guide grid, faint trace character, selected character + pinyin/Arabic/English shown above, character selector from lesson vocabulary, red/dark ink picker, Clear / Check / Next character, simple "Good practice / Try writing first" scoring, mobile touch support. New shared component `src/components/WritingPad.tsx` (replaces the black canvas in both Lesson and Practice).
- **Daily Path** (`/daily`): 5 words → 3 sentences → quick 3-question quiz from the user's first incomplete lesson (first lesson when logged out), with step indicator and completion screen.
- **Review Mistakes** (`/review`, login required): lists lessons whose best quiz score is below 70% (from `quiz_results`) with attempts count and a "Practice again" link back to the lesson.
- **XP system (frontend)**: completed lesson = 10 XP, passed quiz = 20 XP, pronunciation practice = 5 XP (`src/lib/learning.ts`), shown on the Dashboard.
- **Dashboard V2**: completed/total lessons, XP points, average quiz score, streak placeholder, overall progress bar with current lesson, Daily Practice card, Certificate progress card (remaining lessons or unlocked state), Review Mistakes card — all in addition to the existing Continue Learning, Recent Quiz Results and Lesson Progress sections.
- **Certificate V2**: fully dynamic — unlocked when *all* lessons are completed (no hardcoded count); locked state shows progress bar and exact remaining lessons; print/share actions.
- **Pronunciation V2**: Words / Sentences source toggle; honest fallback message for unsupported browsers (no more simulated fake scores); still zh-CN Web Speech Recognition with Excellent/Good/Try again rating; never crashes.
- **Courses V2**: per-level progress bar for logged-in users; Start button becomes "Continue" and targets the first incomplete lesson; level title/description follow the UI language.
- New shared logic in `src/lib/learning.ts` (XP, first-incomplete-lesson, level progress %, low-score lessons, shuffle).
- ~90 new EN + AR i18n keys for all V2 features.
- 45 lesson images included under `public/images/lessons/`.

### Changed
- `Practice` page now loads real Supabase lesson content with a lesson selector (previously static demo data) and reuses the shared Writing/Listening/Flashcards modules.
- `Quiz` page option rendering tolerates both `text` and `textEn` option formats.
- `QuizOption` type now models `text` / `textEn` / `textAr`; `LessonRow` type now includes the production `explanation_en/explanation_ar/image_url` columns (removed `as any` casts).
- `package-lock.json` regenerated against the public npm registry (the previous lock pinned a mirror registry that fails outside that network).
- Root `index.html` restored to the Vite **source** entry (it had been overwritten by a built file, which breaks `npm run build` output).

### Unchanged / protected
- Admin panel, PDF upload, Supabase Auth, anon-key client setup, AR/EN UI, TTS audio, all 45 lessons, all existing routes.
- **No SQL migrations required** — V2 uses only the existing tables and columns.

### Known pre-existing lint warnings
- Some strict `react-hooks` lint errors exist in untouched legacy files (Header, AuthContext, ui/*). They do not affect `npm run build`.
