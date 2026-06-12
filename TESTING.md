# NiHao V2 — Testing Checklist

## Automated checks run for this cleanup
- [ ] `npm install` must be repeated on RunCloud/CI with normal npm registry access; this workspace registry proxy returned 403 and the stale Vite 7 lockfile content was replaced so a clean Node 18 lockfile can be hydrated.
- [x] `npm run build` completed successfully with Vite 5.4.21 and no TypeScript errors.
- [x] Generated `dist/index.html` uses root-relative `/assets/...` links.
- [x] `vite.config.ts` keeps `base: '/'`.
- [x] Frontend Supabase client reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` only.
- [x] No `.env` files were present in the repository workspace during verification.
- [x] No `node_modules/`, `dist/`, `.env`, or secrets are intended to be committed.

## Node/runtime compatibility
- [x] `package.json` now targets **Node.js >= 18.20.8** and **npm >= 9** for RunCloud.
- [x] Vite is pinned to `vite@5.4.21`, whose package engine supports Node 18.
- [x] React plugin is pinned to `@vitejs/plugin-react@4.7.0`, whose package engine supports Node 18.
- [x] React Router is pinned to `react-router@6.30.1` / `react-router-dom@6.30.1`, avoiding the Node 20-only v7 package engines.
- [x] Supabase JS is pinned to `@supabase/supabase-js@2.46.0`, avoiding the Node 20-only 2.108.x package engine.
- [ ] Run the final smoke build directly on RunCloud Node 18.20.8 before production upload.

## Core routes
- [ ] `/` loads.
- [ ] `/courses` loads and shows the real lesson count for the level (45 existing lessons in Supabase).
- [ ] `/dashboard` redirects logged-out users to login and loads for authenticated users.
- [ ] `/admin` redirects non-admin users and loads for admin users.
- [ ] `/flashcards` loads Supabase lesson vocabulary.
- [ ] `/daily` loads a daily path from Supabase content and works logged out.
- [ ] `/review` requires login and lists low-score lessons for authenticated users.
- [ ] `/practice` compiles and loads practice modules.
- [ ] `/pronunciation` compiles and handles supported/unsupported browsers.
- [ ] `/certificate` requires login and compiles.
- [ ] `/courses/:levelId/:lessonId` loads a lesson from Supabase.
- [ ] Direct refresh on a lesson URL works with the Apache `.htaccess` fallback.

## Lesson flow
- [ ] Previous Lesson moves to the prior lesson by `order_num` and is disabled on the first lesson.
- [ ] Next Lesson moves to the next lesson by `order_num` and is disabled on the final lesson.
- [ ] Complete Lesson while logged out goes to the next lesson or Courses and does not crash.
- [ ] Complete Lesson while logged in upserts `user_progress` with `status=completed`, `completion_percentage=100`, `last_accessed_at`, and `updated_at`.
- [ ] Back to Courses works.
- [ ] Tabs render: Vocabulary / Sentences / Flashcards / Writing / Listening / Quiz.

## Supabase/content checks
- [ ] Lessons load from the `lessons` table, not from hardcoded lesson-only data.
- [ ] Vocabulary loads from the `vocabulary` table.
- [ ] Sentences load from the `sentences` table.
- [ ] Quiz questions load from the `quiz_questions` table.
- [ ] Quiz results save to `quiz_results` when logged in.
- [ ] User progress saves to `user_progress` when logged in.
- [ ] Frontend never references a Supabase `service_role` key.
- [ ] `pronunciation_results` is optional; missing-table reads/writes do not break pronunciation or results pages.

## Features
- [ ] Audio buttons speak Chinese (TTS) in vocab, sentences, flashcards, daily path.
- [ ] Quiz tab: answer all questions; score saves to `quiz_results` when logged in.
- [ ] Writing: paper canvas with grid, character above, selector works, ink color toggles, Clear resets, Next cycles, Check gives feedback.
- [ ] Flashcards: flip reveals pinyin/Arabic/English; "I know it" shrinks queue; "Review again" requeues; deck-complete screen; restart.
- [ ] Listening: audio plays, right/wrong answers color options, final score, practice again.
- [ ] Pronunciation: words/sentences toggle; Chrome/Edge records and scores; unsupported browsers show fallback and do not crash.
- [ ] Daily Path: 5 words → 3 sentences → quick quiz → done screen; works logged out.
- [ ] Review Mistakes: lists lessons with best score below 70%, links back to lessons, empty state renders.

## Dashboard
- [ ] Completed/Total lessons correct.
- [ ] XP = completed lessons × 10 + passed quizzes × 20.
- [ ] Overall progress bar matches completed/total.
- [ ] Daily Practice card links to `/daily`.
- [ ] Certificate card shows remaining lessons or unlocked state.
- [ ] Recent quiz results list correct.

## Courses (logged in)
- [ ] Level card shows progress percentage.
- [ ] Button reads "Continue" and opens the first incomplete lesson.

## Certificate
- [ ] Locked state shows progress and remaining count when lessons are incomplete.
- [ ] Earned state appears when all lessons are completed; print works.

## Mobile
- [ ] Header menu, lesson tabs, writing canvas touch input, flashcards, and daily path are usable at 375px width.

## Language
- [ ] AR/EN switch translates V2 sections: flashcards, daily, review, lesson action bar.
