# NiHao V2 — Changelog

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
