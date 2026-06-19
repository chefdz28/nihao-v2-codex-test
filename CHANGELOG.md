# NiHao V3.15.1 — Fix: "تعلّم بطريقة ممتعة" cards now clickable

Base: GitHub main e52f9b9 (V3.15 brand illustrations). Patch fix only.

## Problem
The 4 image cards in the new "تعلّم بطريقة ممتعة" strip on the homepage showed
correctly but were not clickable / did not navigate.

## Cause
The <Link> wrapping each card lacked `display:block`. A react-router <Link>
renders an <a> which is inline by default; with block-level children (the
aspect-square image div) and overflow-hidden, the inline anchor's clickable area
collapsed. The working feature cards (FeaturesSection) use `block cursor-pointer` —
the new strip did not.

## Fix (src/pages/Home.tsx, FunWaysSection only)
- Added `block cursor-pointer` to each card's <Link> className.
- Added GA4 `funways_click` event (route) so card usage is now tracked, matching
  the existing homepage_feature_click pattern.

No other changes. All V3.15 images, all features, all routes untouched. No
migration, no API, no deps change. index JS 472 KB. Build passes.

## If still not clickable after deploy
Then it's a Cloudflare cache issue, not code — purge the cache for cnihao.com
(or wait for TTL). The HTML/JS bundle hash changes each deploy, so a hard refresh
usually suffices.

---

# NiHao V3.15 — Brand illustrations integration

Base: GitHub main 53a4bee (V3.14). Integrates 9 new brand illustrations across the
site, converted to optimized WebP and connected to the right pages — without
changing the black/red identity or removing any feature. No new migration, no API,
no new deps.

## Images (all in public/images/, WebP q82, 1024x1024, 22-59 KB each)
- hero-main.webp — Arab student + panda (homepage hero)
- feature-journey.webp — red mountain path (FunWays: journey)
- feature-writing.webp — red book + brush (FunWays: writing)
- mascot-panda.webp — panda with scarf (dashboard welcome)
- feature-flashcards.webp — lantern + character cards (game result screen + FunWays)
- banner-motivation.webp — silhouette + red sun (dashboard motivational banner)
- feature-calligraphy.webp — 汉 calligraphy (writing-practice banner)
- feature-progress.webp — app stats screen (FunWays: progress)
- bg-temple.webp — temple + bridge (About hero background)

## Integration
- Home hero (src/pages/Home.tsx): hero-main as a floating illustration opposite the
  text, loading="eager", width/height set, hidden on small screens so it never
  crowds the headline. The animated canvas and the 9 clickable feature cards
  (V3.8.3) are untouched.
- New "تعلّم بطريقة ممتعة" strip (FunWaysSection) after the features section: 4
  image cards linking to /courses, /games/flashcard, /writing-practice, /dashboard.
- Dashboard (src/pages/Dashboard.tsx): mascot-panda beside the welcome heading +
  a slim banner-motivation strip above the progress dashboard. StudentProgressDashboard
  and all real data untouched.
- Flashcard game (src/pages/games/FlashcardPage.tsx): feature-flashcards on the
  result screen (replaced the small trophy icon). Mechanics unchanged (4 Arabic
  choices, instant feedback, XP/coins, audio, Supabase).
- About (src/pages/About.tsx): bg-temple as a faded banner background behind the
  hero, masked so text stays readable.
- Writing practice (src/pages/WritingPractice.tsx): feature-calligraphy banner
  under the intro (hidden on print). Tool unchanged.

## Performance / accessibility
- Only hero-main is loading="eager"; every other image is loading="lazy" with
  width/height to avoid layout shift.
- Images served from /images/*.webp (public), NOT imported into JS — the main
  bundle is unaffected by image weight. index JS = 472 KB (+2 KB, just the new
  FunWays JSX). Total added image weight ≈ 343 KB across 9 files, all lazy except
  the hero.
- Meaningful images have Arabic alt text; decorative ones use alt="" / aria-hidden.

## Preserved (verified present)
Flashcard game (redesigned), Student Progress Dashboard (V3.14), teacher
assignments/feedback (V3.10), Teacher Dashboard (V3.9), AI Teacher, admin, Google
login, GA4, smart pinyin, all 8 migrations. No migration added. Deps unchanged.

## Build
`VITE_GA_MEASUREMENT_ID=G-P3BWZQ6KFM npm install && npm run build` → passes on
Node 18. Routes verified to still build: /, /dashboard, /games/flashcard, /about,
/writing-practice, /practice, /teacher-dashboard, /ai-teacher.

---

# NiHao V3.14 — Student progress dashboard (streak, vocab, activity, level)

Base: GitHub main 2894a10 (V3.13). Adds a visual progress panel to the student
dashboard so learners SEE their momentum — the single biggest driver of retention
in language apps. Built entirely on existing student_progress data: NO new
migration, NO API, NO paid services, fully deterministic. All V3.13 features
(redesigned flashcard game, teacher assignments) preserved.

## Why this
The site already has rich content and records every completion in
student_progress, but learners had no single place to feel their progress. This
turns that existing (previously invisible) data into motivation.

## What it adds (src/components/StudentProgressDashboard.tsx)
Mounted on /dashboard between the stats panel and the daily-goal ring. Renders
nothing for brand-new users (no completed activity yet), so it never clutters an
empty dashboard. Four parts:
1. Weekly streak bar — 7 day circles (Sun→Sat) with checkmarks for active days,
   plus the current consecutive-day streak (reuses computeStreak from
   src/lib/learning.ts).
2. Active vocabulary estimate — a deterministic "~N words" from completed
   lessons/daily/quizzes/stories/dialogues (fixed words-per-type weights; no AI).
3. Level estimate — مبتدئ → A1 أساسيات → A1 متقدّم → HSK1 جاهز, with a progress
   bar toward the next tier, derived from the vocab estimate.
4. 14-day activity chart — a small bar per day showing how many items were
   completed, so streaks and gaps are visible at a glance.

## Data / cost
- Reads via the existing getProgress() (src/lib/studentProgress.ts) — the same
  student_progress table already used by ProgressPanel. No new table, no RPC, no
  network beyond what the dashboard already does.
- Deterministic math only. No AI, no secrets, no paid services.

## Files
- NEW: src/components/StudentProgressDashboard.tsx
- EDIT: src/pages/Dashboard.tsx (mount the panel), package.json
- PRESERVED: flashcard game (V3.13), teacher assignments (V3.10), teacher
  dashboard (V3.9), AI Teacher, admin — all untouched.

## Build
`VITE_GA_MEASUREMENT_ID=G-P3BWZQ6KFM npm install && npm run build` → passes on
Node 18. index JS = 470 KB (unchanged; the panel is small and on the already-lazy
Dashboard chunk). Deps unchanged. No new migration (still 8). Logic verified
(streak/vocab/level) against sample data.

## Note on the vocab/level numbers
These are intentionally simple, encouraging estimates (words-per-activity ×
completions), not exact counts — designed to motivate, clearly shown as "~". Easy
to tune the weights later, or to wire in real flashcard/game word coverage if you
want exactness.

## Future hooks (not in this release)
- Fold flashcard game sessions into the streak/vocab once you want the game to
  visibly feed progress.
- Add a small "best streak" record and per-skill breakdown.

---

# NiHao V3.13 — Flashcard game redesigned (multiple-choice, beginner-friendly)

Base: V3.12 (assignments + game restored). This release REPLACES the original
self-assessment flashcard mechanic with a real multiple-choice quiz that is far
better suited to absolute beginners, and re-themes it to the NiHao black/red
identity. The teacher assignments feature (V3.10) is untouched and still present.

## Why the change
The old game asked the learner to self-grade ("أعرفها / ما أعرفها" then "صح /
خطأ"). For Arabic beginners this had two problems: (1) no real challenge or
feedback — you judge yourself and can collect XP without learning; (2) it felt
punishing — every "ما أعرفها" cost a life, which is normal for a beginner who
doesn't know the words yet, so the first session felt like failure. It also used
a light gray theme that clashed with the site.

## New mechanic (src/pages/games/FlashcardPage.tsx + src/hooks/useFlashcardGame.ts)
- A Chinese character (+ pinyin + a tap-to-hear button; it also auto-plays) is
  shown with FOUR Arabic options. Tap one →
  - correct: option turns green with a check, +10 XP (+5 every 3rd in a combo),
    +1 coin; a "صحيح!" line appears.
  - wrong: your option turns red, the correct one turns green, and the correct
    Arabic is shown — immediate, clear feedback (the real teaching moment).
- Then a "التالي" button (or "إنهاء الجلسة" on the last one). 10 questions/session.
- NO lives / no game-over: beginners are never punished out of a session. Combo
  resets on a wrong answer but you always continue.
- Distractors are pulled from other cards, preferring the SAME category, so wrong
  options are believable but never duplicate the answer (verified: every question
  has 4 unique options and the correct answer is always present).
- Result screen (themed): XP, coins, accuracy with correct/total, best combo, and
  "جلسة جديدة".

## Theming
Rebuilt with NiHao tokens (liquid-glass cards, #FF3333 red, black bg, font-display
/ font-arabic, RTL). The old gray pages and the four old subcomponents
(Flashcard/GameHUD/ProgressBar/ResultScreen) were removed — the page is now
self-contained.

## Data / SRS / cost — unchanged & safe
- Still reads the flashcards table (hsk_level = 1), still records
  user_card_progress via the existing SRS (useSRS), still writes game_sessions and
  upserts user_profiles XP/coins. The SRS now also surfaces which cards to study;
  the full card list feeds the distractor pool.
- TTS remains window.speechSynthesis (zh-CN) only — no paid API, no secrets.
- The two flashcard migrations are unchanged; if you already ran them, nothing new
  to run. Tables and RLS are identical.

## What's removed vs V3.12
- src/components/games/flashcard/{Flashcard,GameHUD,ProgressBar,ResultScreen}.tsx
  (logic folded into the new page).
- Unused GameState/GameAction/DailyMission types trimmed from types/flashcard.ts.

## Verification
- Build passes on Node 18; index JS = 470 KB (unchanged). The game is a lazy
  ~14 KB chunk (smaller than before). Lint clean on all game files.
- Both features confirmed present: redesigned FlashcardPage + TeacherStudentManage
  + StudentAssignmentsCard. Deps unchanged. /games/flashcard stays out of sitemap.
- GA4: flashcard_game_view, flashcard_game_complete (xp, accuracy, maxCombo).

## Deploy
Built on the current main, so safe with rsync --delete. No new SQL needed if the
flashcard + teacher migrations were already run.

---

# NiHao V3.12 — Restore teacher assignments (V3.10) alongside the flashcard game

Base: GitHub main d333e04 (V3.11). This is a RECOVERY release. When V3.11 (built
on V3.9) was deployed with `rsync --delete`, it removed the V3.10 assignments
files that had been pushed in between (ff7a24f). The Supabase tables were never
touched — only the frontend files were deleted from the live site. V3.12 restores
all of V3.10 on top of the current V3.11 main, so the site has BOTH the teacher
assignments/feedback feature AND the flashcard game.

## What it restores (V3.10, on top of V3.11)
- src/components/TeacherStudentManage.tsx — teacher's assign-tasks + grant-points
  panel inside the student drawer on /teacher-dashboard.
- src/components/StudentAssignmentsCard.tsx — "واجباتي من المعلّم" card on the
  student dashboard (assignments + points; renders nothing if empty).
- src/lib/teacherData.ts — re-adds the assignment/feedback RPC wrappers + types on
  top of the V3.9 base.
- src/pages/TeacherDashboard.tsx — re-adds <TeacherStudentManage/> in the drawer.
- src/pages/Dashboard.tsx — re-adds <StudentAssignmentsCard/> before ProgressPanel.
- supabase/migrations/20260619_teacher_assignments_feedback.sql — restored (the
  tables already exist in Supabase if you ran it before; the migration is
  idempotent, so re-running is safe/no-op).

## What stays from V3.11
The flashcard game (/games/flashcard), its two migrations, the 3D-flip CSS, the
nav link, and Seo entry are all unchanged.

## Verification
- Build passes on Node 18; index JS = 470 KB (unchanged). Lint clean on all merged
  files (only the pre-existing AuthContext/Header warnings remain).
- Both feature sets confirmed present: TeacherStudentManage + StudentAssignmentsCard
  (assignments) and FlashcardPage (game).
- GA4 events present for both: teacher_create_assignment, teacher_give_feedback,
  student_complete_assignment, flashcard_game_view, flashcard_game_complete.
- Deps unchanged. /teacher-dashboard and /games/flashcard both stay out of the
  sitemap.

## No new SQL needed if you already ran everything
If you previously ran 20260617 (teacher dashboard), 20260619_teacher_assignments_
feedback, 20260619_flashcard_game, and 20260619_flashcard_seed, you do NOT need to
run anything new — V3.12 is a pure frontend restore. If any of those were not run,
run them now (all idempotent).

## How to avoid this in future
Always build each release on the LATEST pushed main. Because deploys use
`rsync --delete`, any file not present in the package gets removed from the live
site — so a package built on an older commit silently deletes newer files. V3.12
is built on d333e04 (the current main), so it is safe.

---

# NiHao V3.11 — Flashcard Blitz game (/games/flashcard)

Base: GitHub main 2344e33 (V3.9). Adds a fast HSK1 flashcard game (Anki+Duolingo
style): a 3D-flip card shows the Chinese character; the student taps أعرفها /
ما أعرفها, then confirms صح / خطأ, earning XP + coins + combos across a 10-card
session, ending on a result screen (XP, coins, accuracy, best combo). Pronunciation
uses the free Web Speech API (zh-CN) — no paid API, no secrets. The route is
auth-gated and a lazy chunk. All existing features preserved.

NOTE: this release is built on V3.9 main; it does not contain the still-unpushed
V3.10 (assignments). Deploy order is up to you — see "Deploy ordering" below.

## ⚠️ Requires two SQL files (run in Supabase, in order)
1. supabase/migrations/20260619_flashcard_game.sql — tables + RLS. IMPORTANT:
   NiHao has no pre-existing user_profiles table, so this migration CREATES a
   lightweight public.user_profiles (id + total_xp/coins/lives/streak/level) with
   RLS, plus flashcards, user_card_progress, game_sessions. (The original game
   pack assumed user_profiles already existed and referenced daily_missions /
   user_badges — those unused tables were dropped to keep NiHao lean.)
2. supabase/migrations/20260619_flashcard_seed.sql — 50 HSK1 words. The game reads
   flashcards WHERE hsk_level = 1, so the seed is REQUIRED for content to appear.

Until both run, the game page loads but shows "لا توجد بطاقات متاحة".

## What it adds
- Game files (copied from the provided pack, adapted for NiHao):
  src/types/flashcard.ts, src/hooks/useSRS.ts, src/hooks/useFlashcardGame.ts,
  src/components/games/flashcard/{ProgressBar,GameHUD,Flashcard,ResultScreen}.tsx,
  src/pages/games/FlashcardPage.tsx.
- Route: /games/flashcard (lazy, ProtectedRoute — the game needs a signed-in user
  for Supabase progress). FlashcardPage is a named export, loaded via
  lazy(() => import(...).then(m => ({ default: m.FlashcardPage }))).
- 3D-flip CSS added to src/index.css (.perspective-1000 / .transform-style-3d /
  .backface-hidden / .rotate-y-180).
- Nav: "لعبة البطاقات" link in the Training → المراجعة group (Gamepad2 icon) +
  i18n nav.flashcardGame (AR + EN). Seo meta for the route.

## Fixes applied during integration (vs the raw pack)
- user_profiles save changed from update-only (which silently saved nothing for
  users with no profile row) to read-then-upsert(onConflict:id), so XP/coins/lives
  persist on first play.
- .single() → .maybeSingle() on the profile read (no row is not an error).
- Removed two unused symbols (GameHUD `streak`, useFlashcardGame `Flashcard`
  import) so the strict build passes.

## Security / cost
- All game tables RLS-protected, scoped to auth.uid(); flashcards are public-read.
  authenticated only — no service_role, no secrets in the frontend.
- TTS is window.speechSynthesis (zh-CN) only — no network, no paid API.

## GA4 (no PII)
flashcard_game_view, flashcard_game_complete (params: xp, accuracy, maxCombo).
All existing events kept.

## Build
`VITE_GA_MEASUREMENT_ID=G-P3BWZQ6KFM npm install && npm run build` → passes on
Node 18. index JS = 470 KB (+2 KB for nav/i18n/Seo). The game is a lazy ~17 KB
chunk. Deps unchanged (lucide-react was already installed). /games/flashcard is
NOT in the sitemap (auth-gated).

## Deploy ordering (your call)
- This package is V3.9 + the game. If you deploy it as-is, run the two flashcard
  SQL files. V3.10 (assignments) remains a separate unpushed package.
- If you prefer V3.10 first: deploy V3.10 (run its SQL), then I can rebase the
  game onto that main and re-package — tell me and I'll do it.

## Design note
The game keeps its own light Tailwind styling (bg-gray-50) from the pack rather
than NiHao's black/red theme, per the "don't change the design" instruction. If
you want it re-themed to match NiHao, that's a quick follow-up.

## Known limitations
- HSK1 only (the seed is HSK1; the loader filters hsk_level = 1).
- "Lives recover every 30 min" is represented in state/UI; there's no server-side
  cron — lives reset per session load.

---

# NiHao V3.9 — Teacher Dashboard (Phase 1: role + students + reports)

Base: GitHub main 5281189 (V3.8.3). Adds the first phase of the Teacher
Dashboard: a role choice at sign-up (طالب / معلّم), a teacher role, a
teacher↔student link, and a /teacher-dashboard where a teacher links their own
students and tracks each student's progress. Safe Supabase model (RLS + RPCs, no
service_role in the frontend). No paid AI, no secrets. All V3.8.x features
preserved.

## ⚠️ Requires a migration
Run supabase/migrations/20260617_teacher_dashboard.sql in Supabase BEFORE/at
deploy. It is idempotent. Until it runs, the teacher pages simply show no data
(fail-silent).

## What it adds
1. Sign-up role choice (src/pages/Register.tsx): 🎓 طالب / 👨‍🏫 معلّم. Choosing
   معلّم grants the 'teacher' role via the set_my_role_teacher RPC (immediately if
   a session exists, otherwise on first sign-in via signup_role metadata).
2. Auth (src/contexts/AuthContext.tsx): AuthUser.role is now
   'admin' | 'teacher' | 'student', plus isTeacher. signUp(email, pw, name,
   asTeacher?) and signIn honor the teacher choice. No role escalation: the RPC
   only ever sets the CALLER's own row to 'teacher'.
3. /teacher-dashboard (src/pages/TeacherDashboard.tsx, lazy, protected): add a
   student by email, see each linked student's progress summary (total / quizzes
   / lessons), open a per-student activity drawer, remove a link, export CSV.
   Students who aren't teachers see a friendly "this is for teachers" message.
4. teacherData.ts: typed wrappers over the RPCs + pure-JS CSV (no new deps).
5. Nav: a "لوحة المعلّم" link in the header (desktop + mobile) and a CTA card on
   the dashboard — shown only to teachers/admins.

## Security model (mirrors the V3.4.2 admin RPCs)
- supabase/migrations/20260617_teacher_dashboard.sql:
  * teacher_students(teacher_id, student_id) link table with RLS — a teacher can
    only see/insert/delete their OWN links; a student can read links pointing to
    them.
  * RPCs are SECURITY DEFINER but each FIRST checks is_teacher_caller(), and
    every query is scoped to teacher_id = auth.uid(). get_teacher_student_progress
    additionally verifies the student is linked to the caller.
  * Granted to `authenticated` only — never anon, never service_role. Only safe
    fields returned (email, display name, progress counts) — no auth internals.

## GA4 (no PII)
teacher_dashboard_view, teacher_add_student (param: result), teacher_view_student,
teacher_remove_student, teacher_export_csv (param: count). All existing events
kept.

## Files
- NEW: supabase/migrations/20260617_teacher_dashboard.sql, src/lib/teacherData.ts,
  src/pages/TeacherDashboard.tsx
- EDIT: src/contexts/AuthContext.tsx (teacher role + isTeacher + signUp role),
  src/pages/Register.tsx (role selector), src/App.tsx (lazy protected route),
  src/components/Header.tsx (teacher nav link), src/pages/Dashboard.tsx (CTA card),
  src/components/Seo.tsx (meta), package.json
- PRESERVED: AI Teacher + V3.8.2 filter + V3.8.3 nav, admin pages + RPCs,
  ScrollToTop, GA4 head tag, Google login, smart pinyin, all routes.

## Build
`VITE_GA_MEASUREMENT_ID=G-P3BWZQ6KFM npm install && npm run build` → passes on
Node 18. index JS = 468 KB (was 466 KB; +2 KB for auth/nav). TeacherDashboard is
a lazy 11 KB chunk. Deps unchanged. /teacher-dashboard is NOT in the sitemap
(private).

## Next phases (planned)
- Phase 2 (assignments): assignments table + RPCs; teacher assigns a lesson/sim to
  a student; student sees assignments on their dashboard.
- Phase 3 (feedback/points): teacher_feedback table; teacher grants points + a
  note; student sees it. Same RLS+RPC pattern.

## Known limitations
- A teacher links students by an email that already has a NiHao account (the RPC
  returns not_found otherwise) — no invite emails are sent (no email service).
- Pre-existing AuthContext react-refresh lint warning remains (useAuth +
  AuthProvider in one file) — not introduced here.

---

# NiHao V3.8.3 — Navigation Cleanup + Clickable Feature Cards

Base: GitHub main 33b814d (V3.8.2). Makes every homepage feature card clickable,
reorganizes the Training dropdown into grouped sections, and turns /practice into
a sectioned tools hub. No redesign, no API, no migration, no new deps. All
V3.8.2 and earlier features preserved.

## Part 1 — Homepage feature cards now clickable (src/pages/Home.tsx)
Each of the 9 feature cards is now wrapped in <Link> (cursor-pointer,
focus-visible ring, aria-label, GA4). Route mapping:
- دروس تفاعلية → /courses
- النطق الصوتي → /pronunciation
- التعلم المرئي → /vocabulary
- تمرين الكتابة → /writing-practice
- تمارين الاستماع → /dialogues
- اختبارات → /hsk-tests
- ذكاء النطق → /pronunciation
- تتبع التقدم → /dashboard
- الشهادات → /certificates
Same visual design kept; cards stack fine on mobile.

## Part 2 — Training dropdown grouped (src/components/Header.tsx)
The old flat 21-item list is now 6 labeled groups in a multi-column popover
(desktop) and labeled sections (mobile), ending with a "كل أدوات التدريب" →
/practice link:
- البداية: المعلم الذكي, اليومي, المسار, المهام
- المهارات: البينين, النغمات, النطق, الكتابة, الإملاء
- الاختبارات: اختبارات HSK, محاكاة HSK1/2/3, اختبار المستوى
- المراجعة: المراجعة, دفتر الأخطاء, البطاقات, بطاقات HSK3, أوراق العمل
- المحتوى: القاموس, الحوارات, القصص, الأساسيات
- أدوات المعلم: حزمة المعلم, التقرير, الشهادات
The desktop popover is width-capped (max-w-[92vw]) so it never overflows on
mobile/tablet.

## Part 3 — /practice as the full tools hub (src/pages/Practice.tsx)
The quick-tools grid is now grouped into clear sections: ابدأ هنا / مهارات اللغة
/ اختبارات HSK / مراجعة وتقدم / محتوى وقاموس / أدوات المعلم. Every card is a Link
with aria-label + focus ring + GA4. The existing writing/listening/flashcards
modules below are untouched.

## Part 4 — Route validation
Every link used in Header / Home / Practice was checked against App.tsx — all
resolve to existing routes (no broken links). Note: /teacher-tools has no real
page (TeacherTools.tsx only exports the print/dictation widgets used by
/flashcards-print and /dictation), so per the "no fake links" rule it is NOT
linked; teacher tools route to /teacher (the lesson-pack page) and
/flashcards-print instead.

## Part 5 — GA4 (no PII)
Added: homepage_feature_click, training_menu_click, practice_tool_click (param:
route only). All existing events kept.

## Files
- EDIT: src/pages/Home.tsx (clickable feature cards + GA4 import)
- EDIT: src/components/Header.tsx (grouped Training menu desktop + mobile + GA4)
- EDIT: src/pages/Practice.tsx (sectioned tools hub + GA4)
- EDIT: src/i18n/index.tsx (added nav.flashcardsHsk3 AR+EN)
- EDIT: package.json
- PRESERVED: AI Teacher + V3.8.2 exact-meaning filter, ScrollToTop, admin, GA4
  head tag, Google login, smart pinyin, all routes.

## Build
`VITE_GA_MEASUREMENT_ID=G-P3BWZQ6KFM npm install && npm run build` → passes on
Node 18. index JS = 466 KB (was 463 KB; +3 KB for the grouped nav data). Deps
unchanged.

## Notes
- One pre-existing lint warning remains in Header.tsx (setState in the
  route-change effect that closes the mobile menu) — not introduced here.
- Black/red premium identity unchanged.

---

# NiHao V3.8.2 — AI Teacher Exact Meaning Result Filter

Base: GitHub main 22e88d3 (V3.8.1). For direct meaning/translation questions the
AI Teacher now shows ONLY the strongest result instead of a list of loosely
related cards. Topic searches still show 3–5 cards. No API, no secrets, no
migration.

## The problem
"ايش معنى كلمة قط" answered correctly ("قط … 猫 … قطة") but ALSO showed unrelated
cards (火车 قطار, 火车站, 件, 才) because every candidate shared the base score and
the chars/gloss partially overlapped. Confusing for a direct lookup.

## The fix (src/lib/aiTeacherKnowledge.ts)
Two new exported helpers:
- isDirectMeaningQuery(raw): true for معنى / ما معنى / ايش معنى / وش معنى / ماذا
  يعني / ترجمة / كيف أقول / بالصيني (and EN: meaning / what does / translate / how
  do I say / how to say), or a single bare token. Topic searches ("كلمات … عن …")
  return false.
- filterKnowledgeResultsForIntent(raw, target, results): for direct-meaning intent
  it re-ranks by exactness — exact Chinese match, exact pinyin match, and an
  Arabic-gloss closeness score (so "قطة" beats "قطار"/"محطة القطار" for target
  "قط") — then returns just the top card. A 2nd card is added ONLY when both the
  top and the second are EXACT matches of the same type (a real synonym pair),
  never a partial/loosely-related word. For topic/other intent it returns all
  results (still capped at 5 by the caller).

The chat (src/components/AiTeacherChat.tsx) runs searchKnowledge() then
filterKnowledgeResultsForIntent() before rendering the cards.

## Verified
- ايش معنى كلمة قط → only 猫 (قطة) ✓ (no 火车/火车站/件/才)
- قط → only 猫 ✓
- ما معنى 你好 → only 你好 ✓
- كيف أقول شكرا بالصيني → only 谢谢 ✓
- معنى كلمة ماء → only 水 ✓
- كلمات HSK1 عن الأكل → 5 food words ✓ (multiple)
- كلمات HSK2 عن الوقت → 5 time words ✓ (multiple)
- أعطني كلمات اليوم → daily plan (unchanged) ✓
- اختبرني HSK1 → quiz (unchanged) ✓

## Files
- EDIT: src/lib/aiTeacherKnowledge.ts (isDirectMeaningQuery +
  filterKnowledgeResultsForIntent), src/components/AiTeacherChat.tsx (apply
  filter), package.json.
- PRESERVED: chat UI, plan/quiz logic, detectIntent + extractKnowledgeQuery,
  GA4, admin, Google login, smart pinyin, HSK tools.

## GA4 / build
GA4 events unchanged (no PII). Build passes on Node 18. index JS = 463 KB
(unchanged). AiTeacher lazy chunk ≈ 28 KB. Deps unchanged.

## Next phase (planned) — V3.9 "AI Teacher answer card + examples"
A focused follow-up to make direct answers richer WITHOUT any API:
1. Word answer card upgrade: show the dictionary example sentence(s) for the
   matched word (zh + pinyin + Arabic) under the card, with a TTS play button,
   reusing existing dictionary example data.
2. "كلمات قريبة" row: 2–3 related words from the word's existing `related` slugs
   (already in dictionaryCore) shown as small chips below the exact answer — this
   keeps the single-card focus while still letting the learner explore.
3. Grammar answer: when the top match is a grammar point, render its pattern +
   short Arabic explanation + one example, linking to the lesson.
4. "هل تقصد؟" disambiguation: when the top two are both partial (no exact match),
   show a one-line "هل تقصد: X أو Y؟" chip row instead of guessing.
All deterministic, local data only; the AiTeacher chunk stays lazy.

---

# NiHao V3.8.1 — AI Teacher Intent Priority Fix

Base: GitHub main c9d3b05 (V3.8). Fixes the AI Teacher routing so direct
meaning/search questions go to the local knowledge search BEFORE plan/quiz/words
generation. Still NO API, no secrets, no migration. Everything from V3.8 and
earlier preserved.

## The bug
"ايش معنى كلمة قط" returned a daily-words PLAN instead of the meaning of قط,
because the word "كلمة" matched the daily-words intent. (A bare "قط" already
worked.)

## The fix (src/lib/aiTeacher.ts)
1. New high-priority 'search' action in detectIntent(), evaluated BEFORE
   plan/quiz/words. It triggers on:
   - meaning/translation phrases: معنى / ما معنى / ايش معنى / وش معنى / ماذا يعني
     / ترجمة / كيف أقول / بالصيني / معناها — and English meaning / what does /
     translate / how do I say / how to say.
   - any message containing Chinese characters (unless it's clearly a quiz/plan).
   - a single short token ("قط", "شكرا", "你好", "mao").
   - topic word searches like "كلمات HSK1 عن الأكل" (كلمات + عن/about).
2. Daily-words intent now triggers ONLY for clear plural/today patterns
   (أعطني كلمات / كلمات اليوم / كلمات جديدة / 3 كلمات / words today / new words),
   never for a bare "كلمة". So meaning wins over daily words.
3. New helper extractKnowledgeQuery(raw): strips filler ("ايش معنى كلمة قط" →
   "قط", "كيف أقول شكرا بالصيني" → "شكرا", "ما معنى 你好" → "你好",
   "اشرح لي 的" → "的"); Chinese substring always wins.

## Chat behavior (src/components/AiTeacherChat.tsx)
- The new 'search' action (and the existing 'help' fallback) both run the
  knowledge search on the extracted query.
- Strong word match → a direct natural answer:
  "قط بالصينية هي 猫، وتُنطق māo، ومعناها «قطة»." + a result card (Chinese /
  pinyin / Arabic / HSK badge / link).
- No match → the deterministic fallback message + chips (unchanged).
- Plan/quiz/pinyin/writing/review commands are unchanged: "أعطني كلمات اليوم"
  still returns the daily plan; "اختبرني HSK1" still returns the quiz.

## Intent verification (all pass)
ايش معنى كلمة قط → search ✓ · ما معنى 你好 → search ✓ · كيف أقول شكرا بالصيني →
search ✓ · معنى كلمة ماء → search ✓ · قط → search ✓ · كلمات HSK1 عن الأكل →
search ✓ · أعطني كلمات اليوم → words (plan) ✓ · اختبرني HSK1 → quiz ✓ ·
أعطني خطة اليوم → plan ✓ · اشرح لي pinyin → pinyin ✓ · 你好 → search ✓.

## GA4 (unchanged, no PII)
ai_teacher_knowledge_search, ai_teacher_knowledge_result_click,
ai_teacher_chat_message, ai_teacher_plan_generated, ai_teacher_quiz_completed,
ai_teacher_prompt_clicked.

## Files
- EDIT: src/lib/aiTeacher.ts (detectIntent priority + 'search' action +
  extractKnowledgeQuery), src/components/AiTeacherChat.tsx (handle 'search' +
  extracted query + direct answer), package.json.
- PRESERVED: aiTeacherKnowledge.ts, chat UI, plan/quiz logic, admin, GA4,
  Google login, smart pinyin, HSK tools.

## Build
`VITE_GA_MEASUREMENT_ID=G-P3BWZQ6KFM npm install && npm run build` → passes on
Node 18. index JS = 463 KB (unchanged). AiTeacher lazy chunk ≈ 26 KB. Deps
unchanged.

---

# NiHao V3.8 — AI Teacher Knowledge Search (Local RAG)

Base: GitHub main 317bc42 (V3.7.1). Upgrades the AI Teacher chat to SEARCH
NiHao's own learning data and answer from it — still NO paid AI API, no OpenAI,
no secrets, no Edge Function, no migration. All V3.7.1 + earlier features
preserved (chat UI, deterministic plan/quiz, fallback).

## What's new: a local knowledge engine
NEW src/lib/aiTeacherKnowledge.ts — indexes and searches the existing local data
(dictionary HSK1/2/3, grammar fallback, articles + SEO articles, stories). Pure
local logic: it normalizes the query (strips pinyin tone marks + Arabic
diacritics, normalizes alef/ya/ta-marbuta), pulls any Chinese substring, detects
an HSK level constraint, and scores each source. searchKnowledge(query, limit)
returns the top 3–5 results, each with: type (word/grammar/article/story),
title, chinese, pinyin, arabic, english, hsk, route, and a relevance score.

Topic queries work without a tagging system: a small Arabic synonym map expands
topics like "الأكل" / "الوقت" / "السفر" and matches them against each word's
Arabic gloss. Filler words ("كيف أقول … بالصيني") are stripped so the key term
still matches (e.g. "كيف أقول شكرا بالصيني" → 谢谢).

## Chat integration
When a message isn't a plan/quiz/pinyin/writing command, the chat now:
1. Calls searchKnowledge(text).
2. If results found → a teacher bubble (e.g. "你好 (nǐ hǎo) تعني «مرحباً». إليك
   التفاصيل وكلمات قريبة:") plus a new knowledgeResults card list inside the
   chat. Each card shows hanzi + pinyin (respecting smart pinyin) + Arabic + HSK
   badge + type badge, and links to the dictionary word / lesson / article /
   story when a route exists ("افتح →").
3. If nothing matches → the deterministic fallback is kept: "لم أجد نتيجة دقيقة
   في بيانات NiHao، لكن أقدر أساعدك بهذه الخيارات:" + prompt chips (خطة اليوم /
   اختبار HSK / القاموس / تدريب الكتابة / البينين).

Plan/quiz/pinyin/tones/writing commands still use the existing V3.7/V3.7.1 logic
unchanged (e.g. "أريد اختبار HSK2" → HSK2 quiz; "أعطني خطة اليوم" → plan).

New message type: knowledgeResults (alongside text / plan / quiz / links).

## Bundle size (kept off the main bundle)
The knowledge engine is imported only by AiTeacherChat, which is on the lazy
/ai-teacher route, so the main index bundle is UNCHANGED at 463 KB. The lazy
AiTeacher chunk grew from ~12 KB to ~22 KB gzip 8.4 KB — acceptable and only
loaded when the page is opened. (Verified the engine is NOT in index-*.js.)

## GA4 (no PII)
Kept: ai_teacher_open, ai_teacher_plan_generated, ai_teacher_quiz_completed,
ai_teacher_prompt_clicked, ai_teacher_chat_message. Added:
ai_teacher_knowledge_search (param: hits count) and
ai_teacher_knowledge_result_click (param: result type). No personal data.

## Progress sync
Unchanged: ai-teacher-plan-<level> on plan, ai-teacher-quiz-<level> on quiz
(logged-in, fail-silent). We intentionally do NOT sync every search to avoid
spamming student_progress.

## Files
- NEW: src/lib/aiTeacherKnowledge.ts
- EDIT: src/components/AiTeacherChat.tsx (search + knowledgeResults card + improved
  fallback), package.json
- PRESERVED: src/lib/aiTeacher.ts (detectIntent + engine), AiTeacherPlanCard,
  AiTeacherMiniQuiz, AiTeacherAgent, AiTeacher.tsx, HskToolsNav, AdminQuizResults.

## Examples verified
معنى 你好 → 你好; كيف أقول شكرا بالصيني → 谢谢; كلمات HSK1 عن الأكل → food words;
كلمات HSK2 عن الوقت → 时间…; اشرح لي 的 → 的; أعطني جملة عن السفر → 护照/飞机.
All 6 return results; plan/quiz commands still generate plans/quizzes.

## Preserved (verified)
Chat UI; deterministic plan/quiz + fallback; V3.6 DailyGoalCard + ScrollToTop +
HSK sync; V3.4.2 admin + RPC migration; GA4 head tag; Google auth; smart pinyin;
HSK tools; sitemap/llms /ai-teacher unchanged.

## Build
`VITE_GA_MEASUREMENT_ID=G-P3BWZQ6KFM npm install && npm run build` → passes on
Node 18. index JS = 463 KB (unchanged). AiTeacher lazy chunk ≈ 22 KB. Deps
unchanged.

## Known limitations
- Keyword/score search, not a language model: very free-form or out-of-data
  questions fall back to the helpful chips. Topic coverage depends on the Arabic
  synonym map (extendable). A real AI answer can come later via a Supabase Edge
  Function (paid tier).
- Searches aren't synced to student_progress (by design).

---

# NiHao V3.7.1 — AI Teacher Chat UI

Base: GitHub main e19fcee (V3.7). Converts /ai-teacher from a form/plan generator
into a chat-style conversation, keeping the SAME deterministic engine — NO API,
no OpenAI, no secrets, no Edge Function, no migration. All V3.7 + earlier
features preserved.

## What changed
/ai-teacher now looks and behaves like a chat with the teacher:
- A chat header (avatar + "المعلم الذكي" + status "جاهز لمساعدتك في تعلّم الصينية").
- An opening teacher bubble welcoming the student.
- Level quick-chips (مبتدئ / HSK1 / HSK2 / HSK3) shown compactly above the thread
  instead of a big static form.
- A chat input at the bottom (RTL): placeholder "اسأل المعلم الذكي… مثال: أعطني
  كلمات HSK1 اليوم".
- Suggested prompt chips: أعطني خطة اليوم / اختبرني HSK1 / اشرح لي pinyin / أعطني
  3 كلمات جديدة / دربني على النغمات / راجع أخطائي.
- Typing or tapping a chip appends a student bubble, then the teacher replies with
  a bubble and (where relevant) a plan card or a mini-quiz card INSIDE the
  conversation.

## How replies are generated (still deterministic, no API)
- NEW src/lib/aiTeacher.ts → detectIntent(text): pure keyword matching (Arabic +
  English) → { level?, goal?, action }. Examples: "اختبرني HSK1" → quiz+hsk1;
  "اشرح لي pinyin" → pinyin; "أعطني 3 كلمات جديدة" → words; "راجع أخطائي" → review.
- The chat maps the intent to an existing generateTeacherPlan(level, goal) call
  and renders the right card:
  - words/plan → AiTeacherPlanCard (3-word mini lesson + steps + links)
  - quiz/review → AiTeacherMiniQuiz (instant feedback)
  - pinyin/tones/writing → a short Arabic explanation + links to /pinyin, /tones,
    /writing-practice, etc.
  - anything unsupported → a helpful "choose one" reply with tool links.

## Progress sync (unchanged behavior, fail-silent for guests)
- On plan generation: markCompleted('quiz', 'ai-teacher-plan-<level>').
- On quiz completion: markCompleted('quiz', 'ai-teacher-quiz-<level>', score).
- Guests are never blocked; saving is skipped/failed silently. These still appear
  in the admin Quiz Results page.

## GA4 events (no PII)
ai_teacher_open, ai_teacher_plan_generated, ai_teacher_quiz_completed,
ai_teacher_prompt_clicked, and new ai_teacher_chat_message. Params carry only
level/goal/score — never personal data.

## Files
- NEW: src/components/AiTeacherChat.tsx
- EDIT: src/lib/aiTeacher.ts (detectIntent + TeacherIntent/TeacherAction),
  src/pages/AiTeacher.tsx (renders AiTeacherChat; slimmer hero), package.json
- PRESERVED (not removed): src/components/AiTeacherAgent.tsx, AiTeacherPlanCard.tsx,
  AiTeacherMiniQuiz.tsx (reused by the chat), HskToolsNav.tsx, AdminQuizResults.tsx.

## Mobile / RTL / a11y
- Flex column chat; input is sticky at the bottom; no horizontal overflow; bubbles
  cap at ~85-92% width. Semantic buttons, aria-label on input/send, aria-pressed
  on level chips. Auto-scrolls to the newest message.

## SEO
/ai-teacher title/description, sitemap, and llms.txt unchanged.

## Preserved (verified)
V3.7 engine + page; V3.6 DailyGoalCard + ScrollToTop + HSK sync; V3.4.2 admin data
+ RPC migration; V3.4.1 GA4 head tag + simPinyin; V3.4 Google auth + AuthGate +
PinyinToggle; V3.3 HSK tools; V3.2 HSK3; social + lead; performance. GA head tag
intact.

## Build
`VITE_GA_MEASUREMENT_ID=G-P3BWZQ6KFM npm install && npm run build` → passes on
Node 18. index JS = 463KB (the chat is a lazy chunk; size unchanged). Deps
unchanged.

## Confirmations
- No API / no secrets added: YES (deterministic keyword logic only).
- /ai-teacher now appears as a chat: YES.
- Quick chips + suggested prompts work: YES.
- Typed messages work (Enter or send button): YES.
- Plan and quiz appear inside the chat as teacher cards: YES.
- Build passes: YES.

## Known limitations
- Intent detection is keyword-based, not a language model; very free-form
  questions fall back to a helpful "choose one" reply. (A real AI chat can come
  later via a Supabase Edge Function, as a paid-tier feature.)
- Chat history is in-memory only (not stored in Supabase), per spec.

---

# NiHao V3.7 — AI Teacher Agent (deterministic, no paid AI API)

Base: GitHub main 9e55f7b (V3.6). Adds a public "AI Teacher" experience at
/ai-teacher built ENTIRELY from existing NiHao data — NO paid AI API, no OpenAI
key, no backend secrets, no new dependency, no migration. All V3.6 features
preserved.

## How it works (deterministic "AI-like" teacher)
The student picks a level (Beginner / HSK1 / HSK2 / HSK3) and a goal (daily words
/ HSK test / pinyin / writing / review), then taps "ابدأ خطة اليوم". The engine
src/lib/aiTeacher.ts → generateTeacherPlan({ level, goal, date }) returns a plan:
title, recommendedMinutes, steps[], a 3-word mini lesson (hanzi + pinyin + Arabic
+ example), a 3-question multiple-choice quiz with instant feedback, and
recommended internal routes. All content is selected/arranged from the existing
dictionary, the HSK1/2/3 simulation banks, and lesson vocab — it ROTATES per day
(deterministic day index) so it feels fresh without randomness or an API. A later
V3.8 can swap in a real AI via a Supabase Edge Function without changing the UI.

- Uses paid AI API? NO. 100% deterministic local logic over existing data.
- For 'hsk_test'/'review' goals the quiz pulls real reading questions from the sim
  banks; otherwise it builds "meaning of X" questions from the lesson words with
  distractors. Verified: all 20 level×goal combos produce 3 words + 3 quiz, and
  every quiz answer is among its choices.

## Files created
- src/lib/aiTeacher.ts — the deterministic engine (types + generateTeacherPlan)
- src/components/AiTeacherAgent.tsx — level/goal selectors, generate, quiz wiring
- src/components/AiTeacherPlanCard.tsx — plan (steps + mini lesson + links)
- src/components/AiTeacherMiniQuiz.tsx — 3-Q quiz with instant feedback
- src/pages/AiTeacher.tsx — hero + agent + JSON-LD + Seo + HskToolsNav

## Files modified
- src/App.tsx — lazy route /ai-teacher
- src/components/Header.tsx — AI Teacher link in the Practice dropdown (+ i18n key nav.aiTeacher)
- src/components/Footer.tsx — AI Teacher in the learning links
- src/components/HskToolsNav.tsx — AI Teacher cross-link
- src/components/Seo.tsx — /ai-teacher AR/EN title + description
- src/pages/AdminQuizResults.tsx — friendly labels for ai-teacher-daily-plan / ai-teacher-mini-quiz
- src/i18n/index.tsx — nav.aiTeacher (AR + EN)
- public/sitemap.xml — adds https://cnihao.com/ai-teacher (702 URLs, 0 private)
- public/llms.txt — lists the AI Teacher route
- package.json

## Progress saving (logged-in only, fail-silent)
On generating a plan and on completing the mini quiz, logged-in users get a
record via the existing studentProgress.markCompleted('quiz',
'ai-teacher-daily-plan' | 'ai-teacher-mini-quiz', score?) — using the existing
student_progress table, NO new migration. Guests are never blocked; saving is
skipped for them and any failure is swallowed so the UI keeps working.

## Admin visibility
Because the activities are 'quiz' rows in student_progress, they appear in the
V3.4.2 admin pages. /admin/quiz-results shows them with clear Arabic labels
(خطة المعلم الذكي / اختبار المعلم الذكي).

## GA4 events (no PII)
ai_teacher_open, ai_teacher_plan_generated, ai_teacher_quiz_completed,
ai_teacher_recommended_link_click. Params carry only level/goal/score/href —
never email/name/user id. /admin stays excluded.

## SEO / structured data
- Seo.tsx: AR title "المعلم الذكي لتعلم الصينية | خطة يومية واختبار سريع | NiHao",
  AR description as specified, EN fallback "AI Chinese Teacher for Arabic Speakers
  | NiHao".
- LearningResource + BreadcrumbList JSON-LD (no fake reviews/ratings).
- sitemap + llms.txt updated. No admin routes added.

## Pinyin / auth / mobile / a11y
- Respects smart pinyin mode via usePinyinMode + PinyinToggle (Beginner/HSK1/HSK2
  show, HSK3 hide by default, toggle available).
- Public page; saving requires login; shows a login CTA when logged out.
- Mobile-first RTL: stacking cards, large buttons, no horizontal overflow.
- Semantic, keyboard-clickable buttons; aria-pressed on selectors; readable text.

## Preserved (verified)
V3.6 DailyGoalCard + ScrollToTop + HskToolsNav + HSK result sync + SEO articles;
V3.4.2 admin data pages + RPC migration; V3.4.1 GA4 head tag + simPinyin; V3.4
Google auth + AuthGate + PinyinToggle; V3.3 HSK tools; V3.2 HSK3; V3.0A social +
lead; V2.9E performance (hero webp, video 548KB). GA4 head tag intact.

## Build
`VITE_GA_MEASUREMENT_ID=G-P3BWZQ6KFM npm install && npm run build` → passes on
Node 18. index JS = 463KB (V3.6 was 462KB; the AI Teacher is a lazy chunk). Deps
unchanged.

## Known limitations
- Deterministic, not a real language model: it arranges existing content rather
  than generating new explanations. (V3.8 can add real AI via an Edge Function.)
- HSK1 lesson words have no example sentences in the data, so a simple
  "这是 X。" example is shown for those; HSK2/HSK3 use real examples.
- Saved activity is per logged-in account; guests aren't saved by design.

---

# NiHao V3.6 — Unified Release: SEO + Internal Linking + Progress Sync + Growth

Base: GitHub main 48c128f (V3.4.2 admin data visibility). This release UNIFIES
the previously separate V3.5 (SEO/linking/sync) and V3.4.3 (scroll-to-top) work
on top of the latest admin base, integrates HSK result sync WITH the admin panel,
and adds growth features — so everything ships in ONE update. No redesign, no new
dependencies, no new Supabase table/migration. All prior features preserved.

## Folded in: V3.4.3 — scroll to top on route change
- src/components/ScrollToTop.tsx mounted next to AnalyticsTracker. On pathname
  change it scrolls to top (footer links etc. now open pages at the top); hash-
  only navigation is ignored.

## Folded in: V3.5 — SEO indexing, internal linking, progress sync
- Structured data: new quizLd + courseLd builders; JsonLd + BreadcrumbList wired
  into /hsk-tests (Course) and the HSK1/2/3 simulations (Quiz).
- Internal linking: src/components/HskToolsNav.tsx cross-links every HSK tool;
  added to the sim result screens and the flashcards/worksheet/writing pages.
- SEO articles: 3 new (hsk2-mock-test, hsk1-mock-test, free-chinese-flashcards)
  → 18 total, live at /blog/<slug>. sitemap regenerated to 701 URLs, 0 private.
- SEARCH_CONSOLE_CHECKLIST.md included.
- Progress sync: finishing an HSK1/2/3 simulation now also records
  markCompleted('quiz', 'hskN-sim', score) to the existing student_progress
  table, so logged-in users' HSK results sync across devices.

## NEW integration bonus: HSK results now show in the admin panel
Because HSK results sync to student_progress (above), the V3.4.2 admin Quiz
Results page (/admin/quiz-results) now displays them with friendly labels
(محاكاة HSK1/2/3). The old "local-only, future TODO" note is replaced with an
accurate note: results sync for logged-in users; guests stay local. This closes
the loop the two branches each half-built.

## NEW growth feature: Daily XP goal ring
- src/components/DailyGoalCard.tsx — a daily XP goal with an SVG progress ring,
  encouraging a daily-return habit. 100% local (reuses the existing XP system, no
  new table), goal is adjustable (20/30/50/80). Added to the Daily page and the
  Dashboard. (Streaks already existed via computeStreak and are unchanged.)

## Preserved (verified)
V3.4.2 admin data pages + adminData lib + admin RPC migration; V3.4.1 GA4 head
tag + analytics + simPinyin; V3.4 Google auth + AuthGate + PinyinToggle +
usePinyinMode + useTestGate; V3.3 HSK tools; V3.2 HSK3; V3.0A social + lead
capture; V2.9E performance (hero webp, video 548KB). GA4 head tag intact,
AnalyticsTracker + ScrollToTop both mounted.

## Changed / new files
- NEW: src/components/ScrollToTop.tsx, src/components/HskToolsNav.tsx,
  src/components/DailyGoalCard.tsx, src/data/hskSeoV35.ts,
  SEARCH_CONSOLE_CHECKLIST.md
- EDIT: src/App.tsx (ScrollToTop), src/lib/structuredData.ts (quizLd + courseLd),
  src/data/seoSprint1b.ts (merge articles), src/pages/HskTests.tsx +
  Hsk1/2/3Simulation.tsx (JSON-LD + HskToolsNav + HSK result sync),
  src/pages/Hsk3Flashcards.tsx + Hsk3Worksheet.tsx + WritingPractice.tsx
  (HskToolsNav), src/pages/AdminQuizResults.tsx (show synced HSK results),
  src/pages/Daily.tsx + Dashboard.tsx (DailyGoalCard), public/sitemap.xml,
  package.json

## Build
`VITE_GA_MEASUREMENT_ID=G-P3BWZQ6KFM npm install && npm run build` → passes on
Node 18. index JS = 462KB. Deps unchanged. No new migration (HSK sync uses the
existing student_progress table; admin RPCs come from V3.4.2's migration which
must already be run).

## Known limitations
- Flashcard SRS is still local-only (HSK sim results now sync; SRS can follow the
  same pattern later).
- The daily goal "earned today" resets at local midnight per device (localStorage).
- Indexing is gradual (days–weeks); this release does the structural SEO work.

---

# NiHao V3.4.2 — Complete Admin Data Visibility

Base: GitHub main b0f79c2 (V3.4.1). Adds an admin-only data visibility layer. No
redesign, no service_role key in the frontend, no secrets in client code. All
V3.4.1 / V3.4 / V3.3 / V3.2 / V3.0A / V2.9E features preserved.

## New admin routes (all AdminRoute-gated, admin role required)
- /admin/data — Data Center hub (overview counts + section cards)
- /admin/students — student directory (email, name, provider, role, activity)
- /admin/progress — student_progress viewer (filters + summary)
- /admin/quiz-results — server-side quiz results + honest note about local-only HSK
- /admin/leads — email/newsletter leads with CSV export
(/admin/content-drafts unchanged)

## Supabase data sources + security (migration added)
NEW migration: supabase/migrations/20260616_admin_data_visibility.sql. It creates
admin-only RPCs, each SECURITY DEFINER but gated by an `is_admin_caller()` check
(EXISTS in user_roles with role='admin') as the FIRST statement — non-admins get
zero rows. Granted to `authenticated` only, never anon. No service_role key.
- get_admin_students() — joins auth.users (email, display_name from metadata,
  provider from app metadata) + user_roles + a student_progress activity summary.
- get_admin_progress(limit_n) — student_progress rows + the user's email.
- get_admin_email_leads() — email_leads rows (table also already had an admin
  SELECT RLS policy).
- get_admin_overview() — counts: students, admins, leads, progress, completions
  today, drafts.
Only safe fields are returned (user_id, email, display_name, role, created_at,
activity counts). NEVER returned: password hashes, provider/refresh tokens,
metadata secrets, IPs, or auth internals. auth.users is never exposed to normal
users — only through these admin-checked RPCs.

src/lib/adminData.ts wraps the RPCs (fetchAdminStudents/Progress/Leads/Overview)
and provides toCsv()/downloadCsv() (no external library).

## What the admin can see
Registered users (via user_roles) with email + display name + provider (google/
email) + role + joined date + last activity + per-type completion counts +
latest content; all student_progress rows; email leads; content drafts; overview
counts.

## What's NOT available (and why)
HSK1/HSK2/HSK3 simulation results are stored in each learner's browser
localStorage (this V3.4.1 base does not sync them), so they cannot be shown
across devices. The Quiz Results page states this clearly and does NOT fake data;
it shows server-side 'quiz' progress rows and flags a future TODO to sync HSK
results to Supabase. (No new quiz table was added — not necessary.)

## Admin UI / navigation
Admin.tsx gained a row of clickable cards (Data Center, Students, Progress, Quiz
Results, Leads, Drafts) in the existing black/red style. Each admin data page
links back to the Data Center.

## CSV export
Students, Progress, and Leads pages each have a CSV export button implemented
with a pure-JS Blob download — no external library. Export respects the current
search/filters.

## GA4 (no PII)
New safe events: admin_data_view, admin_students_view, admin_leads_view,
admin_progress_view, admin_export_csv. Params only carry section/count/filter_type
— never email/name/user_id/answers. /admin stays excluded from tracking.

## SEO / sitemap safety
No admin routes in sitemap.xml (verified: /admin, /admin/data, /admin/students,
/admin/leads, /admin/progress, /admin/quiz-results, /admin/content-drafts,
/dashboard, /profile all absent). robots.txt / llms.txt unchanged.

## Preserved (verified)
V3.4.1 GA4 head tag (index.html) + analytics.ts + simPinyin; V3.4 Google auth +
AuthGate + GoogleSignInButton + PinyinToggle + usePinyinMode + useTestGate; V3.3
HSK tools; V3.2 HSK3; V3.0A social + lead capture; V2.9E performance (hero webp,
video 548KB).

## Changed / new files
- NEW: supabase/migrations/20260616_admin_data_visibility.sql, src/lib/adminData.ts,
  src/pages/AdminDataCenter.tsx, AdminStudents.tsx, AdminProgress.tsx,
  AdminLeads.tsx, AdminQuizResults.tsx
- EDIT: src/App.tsx (5 admin routes), src/pages/Admin.tsx (nav cards), package.json

## Build
`VITE_GA_MEASUREMENT_ID=G-P3BWZQ6KFM npm install && npm run build` → passes on
Node 18. index JS = 461KB (admin pages are lazy chunks). Deps unchanged.

## Manual step (one-time)
Run the new migration in Supabase SQL editor:
supabase/migrations/20260616_admin_data_visibility.sql (creates the admin RPCs).

## Known limitations
- HSK simulation results are local-only on this base (see above) — sync is a
  future task.
- "active/inactive" is approximated by last_activity; there's no separate session
  table.
- The admin pages depend on the migration being run; before that, the data pages
  show a friendly "couldn't load / are you admin?" message.

---

# NiHao V3.4.1 — GA4 Head Tag Compatibility + HSK Simulation Pinyin Fix

Base: GitHub main f67eb71 (V3.4). Two fixes in one build. No redesign, no new
dependencies, no GTM, no migration. All V3.4 (Google auth, AuthGate, smart
pinyin), V3.3, V3.2, V3.0A, V2.9E features preserved.

## FIX A — GA4 detectable by Google's tag tester
**Reason:** GA4 was injected dynamically from React, so Google's "Test your
website" installer (which reads the initial HTML/head) couldn't detect it, even
though the tag was present in the built JS and returned 200.

**Exact index.html implementation (head):**
- A static, detectable async script:
  `<script async src="https://www.googletagmanager.com/gtag/js?id=%VITE_GA_MEASUREMENT_ID%"></script>`
- Followed by a guarded inline config that initializes dataLayer + gtag, calls
  `gtag('js', new Date())` and `gtag('config', id, { send_page_view: false,
  anonymize_ip: true })`. The guard skips config if the env var wasn't replaced
  (e.g. a build without the var), so no broken request.
- The Measurement ID comes from the Vite env var `%VITE_GA_MEASUREMENT_ID%`
  (replaced at build time). No hardcoded ID/secret.

**src/lib/analytics.ts (idempotent):** initAnalytics() now detects the head tag
(`typeof window.gtag === 'function'`) and, if present, does NOTHING extra — no
duplicate script, no duplicate config. If the head tag is missing it falls back
to the old dynamic injection once. initAnalytics() runs at most once.

**No duplicate page views:** the head tag uses `send_page_view: false`, so the
static tag sends no automatic page views; AnalyticsTracker.tsx still sends manual
page_view on each route change. Admin exclusion unchanged
(`path.startsWith('/admin')`). No PII.

## FIX B — Pinyin now shows under HSK simulation options
**Reason:** simulation `options` are plain `string[]` (e.g. `['你好','再见',
'谢谢']`) with NO per-option pinyin — only the question had a single `pinyin`
field. So Chinese options rendered bare. Smart pinyin mode controlled a review
line, not the options a learner actually reads.

**Fix:**
- src/lib/simPinyin.ts — builds a Chinese→pinyin map from the sim datasets
  themselves (each question pairs its spoken/correct Chinese with pinyin) plus a
  seed of common HSK1/HSK2 words, so options get pinyin without hand-editing
  every option. `isChineseText()` ensures pinyin shows ONLY under Han-character
  options (numbers / Arabic glosses / pinyin-string options are left as-is).
  Coverage verified: 0 Chinese options missing pinyin in HSK1 and HSK2.
- src/components/PinyinAnswerOption.tsx — renders the option with pinyin in
  smaller muted text below, only when smart-pinyin says visible.
- Wired into HSK1/HSK2/HSK3 answer options AND the big question prompt (with
  `q.pinyin`), gated by `pinyinIsVisible(level)`.

**Smart pinyin preserved (fresh localStorage / auto):** HSK1 show, HSK2 show,
HSK3 hide. The PinyinToggle (إظهار/إخفاء/الوضع الذكي) on each simulation switches
show/hide/auto and persists in `nihao:pinyin-mode`; turning it ON in HSK3 reveals
pinyin. GA4 `pinyin_toggle` fires on change (mode + hsk_level, no PII).

## Preserved (verified)
V3.4 Google auth + AuthGate + GoogleSignInButton + PinyinToggle + usePinyinMode +
useTestGate; V3.3 HSK tools; V3.2 HSK3; V3.0A social + lead; V2.9E performance;
the GA4 helper; sitemap/robots/llms (all unchanged).

## Changed / new files
- NEW: src/lib/simPinyin.ts, src/components/PinyinAnswerOption.tsx
- EDIT: index.html (GA4 head tag), src/lib/analytics.ts (idempotent + reuse head
  tag), src/pages/Hsk1Simulation.tsx + Hsk2Simulation.tsx + Hsk3Simulation.tsx
  (option + prompt pinyin), package.json

## Build
`VITE_GA_MEASUREMENT_ID=G-P3BWZQ6KFM npm install && npm run build` → passes on
Node 18. index JS = 460KB (V3.4 was 459KB; +1KB). No .env/dist/node_modules/.git.
Deps unchanged.

## Routes tested (build-verified)
/, /hsk1-simulation, /hsk2-simulation, /hsk3-simulation, /hsk-tests,
/flashcards/hsk3, /dictionary, /login, /register, /admin/content-drafts (still
excluded from GA), /sitemap.xml.

## Known limitations
- Google's tag tester needs the production build (with the env var set) deployed;
  a build without VITE_GA_MEASUREMENT_ID intentionally skips the tag.
- Pinyin for a few scrambled grammar-distractor options is approximate (reading
  pinyin of a deliberately wrong word order) — acceptable for practice.
- Pinyin preference is per-device (localStorage).

---

# NiHao V3.4 — Login Gate, Google Auth, and Smart Pinyin Mode

Base: GitHub main 86de109 (V3.3). No redesign, no new dependencies, no Google
SDK, no payment/premium, no voice storage, no new Supabase tables/migration. All
V2.9E/V3.0A/V3.2/V3.3 features preserved.

## Part 1 — Google login (Supabase OAuth)
- src/contexts/AuthContext.tsx: added signInWithGoogle() using
  supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo:
  window.location.origin + '/dashboard' } }). No secrets/keys in the frontend.
  Email/password login unchanged.
- src/components/GoogleSignInButton.tsx: reusable "Continue with Google /
  تسجيل الدخول بواسطة Google" button (inline SVG logo, no SDK) with loading +
  error states. Added to /login and /register with an "or / أو" divider.
- GA4: google_login_click.

### Supabase setup needed to ENABLE Google login
In the Supabase dashboard: Authentication → Providers → Google → enable, then add
the Google OAuth Client ID + Secret there (created in Google Cloud Console, with
the Supabase callback URL as an authorized redirect URI). Nothing else is needed
in the app; no keys go in the frontend.

## Part 2 — Login gate for tests
- src/components/AuthGate.tsx + src/hooks/useTestGate.ts: a friendly, premium
  gate shown only when a guest triggers a gated action (never a redirect on page
  load — SEO/intro content stays visible). Buttons: Continue with Google, Login
  with Email, Sign up, and an optional "continue as guest".
- Gated: the Start button on HSK1/HSK2/HSK3 simulations (the intro screen is
  still public; clicking Start requires login). HSK3 flashcards give guests a
  5-card preview, then gate continued SRS review.
- Public stays public: /, /dictionary, /stories, /dialogues, /blog,
  /study-in-china, SEO pages, and /worksheets/hsk3 (printable).
- After login the user returns to the intended route: gate passes
  location.state.from, and AuthRoute now honors it instead of always going to
  /dashboard.
- GA4: auth_gate_view, test_login_required.

## Part 3 — Smart pinyin mode
- src/lib/pinyinMode.ts + src/hooks/usePinyinMode.ts + src/components/
  PinyinToggle.tsx: preference persisted in localStorage 'nihao:pinyin-mode'
  with values show | hide | auto (default auto). Auto = HSK1 show, HSK2 show,
  HSK3 hide. Pinyin is NEVER removed from the data — only its visibility.
- Applied to: HSK3 flashcards, the HSK1/HSK2/HSK3 simulation review pinyin, and
  the dictionary browse grid (per-word HSK level). A visible toggle (إظهار
  البينين / إخفاء البينين / الوضع الذكي) is shown on each. Writing practice keeps
  pinyin always (it teaches writing).
- GA4: pinyin_toggle { mode, hsk_level }.

## Part 4 — HTTPS / canonical safety
- Audited the whole codebase: ZERO http://cnihao.com or http://www.cnihao.com
  references. Canonical (Seo.tsx) uses https://cnihao.com; sitemap/robots/llms
  all https. No Cloudflare/.htaccess changes in code (per spec). The "Not Secure"
  on http:// is a server/Cloudflare redirect concern, handled outside the app.

## New GA4 events (all via existing helper, /admin excluded, no PII)
auth_gate_view, google_login_click, test_login_required, pinyin_toggle.

## Supabase / database
No new tables, no migration. student_progress / email_leads / content_drafts
untouched. Existing Supabase Auth only.

## Performance
- index JS = 459KB (V3.3 was 457KB; +2KB for the small auth/pinyin components).
- AuthGate, PinyinToggle, GoogleSignInButton are lightweight; no Google SDK; OAuth
  handled by Supabase. Lazy routes preserved. No HSK datasets on the homepage.
- No new dependencies; deps unchanged.

## Preserved (verified)
hero webp + mobile webp, video 548KB, no root images/videos; analytics +
AnalyticsTracker; SocialShareButtons + LeadCaptureBox + emailLeads; studentProgress
+ MarkComplete + ProgressPanel + Daily + Dashboard; HSK1/2/3 sims + HskTests +
Hsk3Flashcards + Hsk3Worksheet + WritingPractice; sitemap (698, unchanged) +
robots + llms (unchanged).

## Changed / new files
- NEW: src/components/GoogleSignInButton.tsx, src/components/AuthGate.tsx,
  src/components/PinyinToggle.tsx, src/hooks/useTestGate.ts,
  src/hooks/usePinyinMode.ts, src/lib/pinyinMode.ts
- EDIT: src/contexts/AuthContext.tsx (signInWithGoogle), src/pages/Login.tsx +
  src/pages/Register.tsx (Google button + divider), src/pages/Hsk1Simulation.tsx
  + Hsk2Simulation.tsx + Hsk3Simulation.tsx (gate + pinyin toggle),
  src/pages/Hsk3Flashcards.tsx (gate + pinyin), src/pages/Dictionary.tsx (pinyin
  toggle), src/App.tsx (AuthRoute honors intended route), src/i18n/index.tsx
  (auth.or), package.json

## Build
npm install && npm run build → passes on Node 18. No .env/dist/node_modules/.git.

## Known limitations
- Google login WON'T work until the provider is enabled in the Supabase dashboard
  (Part 1 setup above). Until then the button shows a friendly error.
- The gate is client-side UX (saving/XP require login); it is not a server-side
  content lock — public pages and SEO remain fully crawlable by design.
- Pinyin preference and the 5-card guest flashcard preview are per-device
  (localStorage), not synced across devices.
- The http:// "Not Secure" must be fixed at the server/Cloudflare redirect level
  (force HTTPS), which is intentionally outside the app code.

---

# NiHao V3.3 — HSK Learning Agent Expansion

Base: GitHub main 526f8f2 (V3.2). Six growth layers added, all original content,
no redesign, no new dependencies, no external SDK, no paid/premium, no voice
storage, no Supabase migration. Every new route is lazy-loaded. All V2.9D/E,
V3.0A, V3.2 features preserved.

## 1) HSK3 flashcards with SRS — /flashcards/hsk3
- src/lib/srs4.ts — a lightweight 4-button SRS (Again/Hard/Good/Easy) in
  localStorage, independent of the existing binary srs.ts (nothing existing
  changes). Per-deck store, no database, no PII.
- src/pages/Hsk3Flashcards.tsx — character + pinyin + Arabic + example, reveal
  then rate; due-card queue; +5 XP every 10 reviews (existing gamification).
  GA4: hsk3_flashcard_review { rating, hsk_level: 3 } — no PII.

## 2) HSK2 simulation — /hsk2-simulation
- src/data/hsk2sim.ts — 36 ORIGINAL questions (18 listening + 18 reading), mixed
  types (multiple choice, meaning match, pinyin recognition, sentence
  completion, listening-style prompts). Verified ZERO overlap with HSK1 and HSK3.
- src/pages/Hsk2Simulation.tsx — same proven timed flow; 20-min timer, 60% pass,
  results saved per-level, wrong answers → Mistake Notebook (source 'hsk2'),
  +35 XP/day. GA4: hsk2_sim_start, hsk2_sim_complete.

## 3) Unified HSK tests page — /hsk-tests
- src/pages/HskTests.tsx — one hub with cards for HSK1/HSK2/HSK3 (level, time,
  question count, difficulty, Start button, Arabic explanation). Now the single
  Header entry (replaces the direct HSK3 link to avoid crowding). GA4:
  hsk_tests_page_view, hsk_test_card_click { hsk_level }.

## 4) HSK3 worksheet generator — /worksheets/hsk3
- src/pages/Hsk3Worksheet.tsx — printable HSK3 sheet from the HSK3 dictionary:
  vocabulary + writing lines, a matching section, and a short quiz. Regenerate
  for a fresh sheet; CSS print styles, NO PDF dependency. GA4: worksheet_generate,
  worksheet_print.

## 5) Character writing / stroke practice — /writing-practice
- src/data/writingChars.ts — 30 high-value HSK1–HSK3 characters (original Arabic
  + stroke counts; no book scans).
- src/pages/WritingPractice.tsx — animated stroke order via the EXISTING
  StrokeOrderPlayer (hanzi-writer, already a dependency), pinyin, Arabic, stroke
  count, a printable 田字格 practice grid, "write 3 times" prompt. GA4:
  writing_practice_start, writing_character_view.

## 6) HSK3 SEO content (5 Arabic articles)
- src/data/hsk3Seo.ts — original Arabic-first articles: كلمات HSK3 بالعربي /
  اختبار HSK3 التجريبي / كيف تستعد لاختبار HSK3 / الفرق بين HSK1 وHSK2 وHSK3 /
  أهم كلمات HSK3 بعد HSK2. Merged into seoSprint1All, so each is live at
  /blog/<slug> with the existing SEO article view + JSON-LD. Internal links to
  /hsk3-simulation, /hsk2-simulation, /hsk-tests, /dictionary, /flashcards/hsk3.

## Navigation / UX
- Practice hub: added HSK2 sim, HSK tests, HSK3 flashcards, HSK3 worksheet,
  writing practice.
- Header: single "HSK Tests" entry (not crowded).
- Dictionary: existing HSK3 → test CTA preserved.
- Seo.tsx: AR/EN title + description for all 5 new public routes.

## New GA4 events (all via the existing helper, /admin excluded, no PII)
hsk3_flashcard_review, hsk2_sim_start, hsk2_sim_complete, hsk_tests_page_view,
hsk_test_card_click, writing_practice_start, writing_character_view,
worksheet_generate, worksheet_print.

## Supabase
No new tables, no migration. SRS uses localStorage; HSK results use the existing
per-level localStorage pattern.

## Performance
- index JS = 457KB (V3.2 was 454KB; +3KB — all new pages/data are lazy chunks).
- Largest new chunks: Hsk2Simulation ~13KB, WritingPractice ~7KB, Hsk3Flashcards
  ~6KB, Hsk3Worksheet ~5KB, HskTests ~4KB. HSK3 dictionary data stays in the
  lazy dictionaryCore chunk — NOT on the homepage (verified).
- No new dependencies; deps unchanged.

## Preserved (verified)
hero webp + mobile webp, video 548KB, no root images/videos; analytics +
AnalyticsTracker; SocialShareButtons + LeadCaptureBox + emailLeads +
20260615_email_leads.sql; studentProgress + MarkComplete + ProgressPanel + Daily
+ Dashboard + XP; Hsk3Simulation + hsk3sim + dictionaryHsk3; sitemap/robots/llms.

## Sitemap
Regenerated → 698 URLs. New public entries: /hsk2-simulation, /hsk-tests,
/flashcards/hsk3, /worksheets/hsk3, /writing-practice + 5 HSK3 articles. 0
admin/dashboard/profile/draft/practice routes.

## Build
npm install && npm run build → passes on Node 18. No .env/dist/node_modules/.git.

## Known limitations
- Flashcard SRS and HSK results are local to the browser/device (localStorage);
  they don't sync across devices (by design — no new DB).
- Stroke-order animation needs network access (hanzi-writer fetches character
  data from its CDN at runtime); offline it falls back to a friendly note.
- HSK3 worksheet/writing rely on the browser print dialog (no server PDF).

---

# NiHao V3.2 — HSK3 Exercises & Test + Combined Release

Base: latest work (V3.0A + V3.1 stacked on GitHub main 88056d7). This is the
COMBINED release to publish in one go. It contains, in order:
- V3.0A: Social sharing buttons + email lead capture (Supabase email_leads).
- V3.1: Dictionary expansion — HSK2 completion + HSK3 (254 → 586 words).
- V3.2: HSK3 practice exercises & simulation test (this release's new work).
All original content. No redesign, no new dependencies, no external SDK, no paid
APIs, no voice storage. All V2.9B–V3.1 features preserved.

## V3.2 — HSK3 exercises & test (new)
### HSK3 practice simulation (/hsk3-simulation)
- src/data/hsk3sim.ts — 40 ORIGINAL questions in HSK3 style (20 listening via
  TTS + 20 reading), built around the HSK2/HSK3 vocabulary already in the
  dictionary. Verified ZERO overlap with the HSK1 simulation questions, so no
  duplication. Pass mark 60%, 25-minute timer.
- src/pages/Hsk3Simulation.tsx — same proven flow as the HSK1 sim: timed test,
  per-question navigation, audio replay, score + pass/fail, answer review, wrong
  answers pushed to the Mistake Notebook (source 'hsk3'), +40 XP once/day
  (higher than HSK1's +30 because HSK3 is harder). Clearly labelled a PRACTICE
  simulation, not an official exam.
- src/lib/hskResults.ts — generalized to store results per level
  (loadHskResultsByLevel / saveHskResultByLevel). HSK1 stays backward compatible
  (same nihao_hsk1_results key + original loadHskResults/saveHskResult helpers).
- src/lib/mistakes.ts — MistakeSource now includes 'hsk3'.

### Discoverability & addictive loop
- Added to the Practice hub, the Header nav, and the sitemap (priority 0.8).
- Seo.tsx gives /hsk3-simulation its own AR/EN title + description.
- Dictionary: when the HSK1 or HSK3 filter is active, a contextual CTA invites
  the learner to jump straight from browsing that level's words to its practice
  test — closing the browse → test → mistakes → retry loop.

## Preserved (verified)
- V3.1 dictionary: 586 words (HSK1 192 / HSK2 160 / HSK3 234), 0 duplicate slugs.
- V3.0A: SocialShareButtons, LeadCaptureBox, emailLeads + the email_leads
  migration.
- GA4 (analytics, /admin excluded), V2.9C/E (hero webp, how-it-works webp, video
  548KB, no root images/videos), V2.9B/B.1 (progress, XP, dashboard, daily).
- Index JS = 454KB (HSK3 sim is a lazy route chunk, not on the homepage).
- robots.txt / llms.txt unchanged. Deps unchanged.

## Changed / new files
- NEW: src/data/hsk3sim.ts, src/pages/Hsk3Simulation.tsx
- EDIT: src/lib/hskResults.ts (level-aware), src/lib/mistakes.ts (+hsk3 source),
  src/App.tsx (route), src/pages/Practice.tsx (hub card), src/components/Header.tsx
  (nav), src/components/Seo.tsx (meta), src/pages/Dictionary.tsx (CTA),
  src/i18n/index.tsx (nav.hsk3 AR+EN), public/sitemap.xml, package.json
- (Already included from V3.0A/V3.1: share + lead capture + HSK2/HSK3 dictionary.)

## Manual Supabase step (one-time, from V3.0A)
Run supabase/migrations/20260615_email_leads.sql alongside the earlier
admin_content_drafts and student_progress migrations.

## Build
npm install && npm run build → passes on Node 18. No .env/dist/node_modules/.git.

---

# NiHao V3.1 — Dictionary Expansion (HSK2 completion + HSK3)

Base: latest work (V3.0A on GitHub main 88056d7). Original content only. The HSK
word LISTS are the official government/Hanban standard (a public standard, not
copyrightable); every Arabic translation and example sentence here is ORIGINAL
content written for NiHao — nothing is copied from any textbook or publisher.
No redesign, no new dependencies, no schema change, no voice storage. All
V2.9B–V3.0A features preserved.

## What's new
### Dictionary grew 254 → 586 words (0 duplicate slugs)
- HSK1: 192 (unchanged)
- HSK2: 62 → 160 (added the rest of the official HSK2 list)
- HSK3: 0 → 234 (new level)
New data files:
- src/data/dictionaryHsk2Extra.ts — HSK2 completion batch (original examples).
- src/data/dictionaryHsk3.ts — HSK3 batch (original examples).
Both are wired into dictionaryCore and deduped by Chinese char + tone-stripped
pinyin, so there are no duplicates with existing words. (Two characters appear
twice on purpose — 还 huán/hái and 长 cháng/zhǎng — different readings/meanings,
different slugs.)

### HSK3 filter in the dictionary
- The DictWord type now allows hsk 1 | 2 | 3.
- src/pages/Dictionary.tsx gained an HSK3 filter button (الكل / HSK1 / HSK2 /
  HSK3). Word pages show the correct "HSK3" badge automatically.

### Every new word gets its own page + SEO
- 586 /dictionary/:slug pages now exist (was 254). Each new HSK2/HSK3 word has a
  Chinese–Arabic page with pinyin, an original example, category, HSK badge, and
  cross-links (appears-in dialogues/stories/lessons via the existing system).
- sitemap.xml regenerated → 687 URLs (+586 dictionary word pages). 0 admin/draft/
  practice routes.

## Copyright note
The uploaded textbook PDFs (© New Concept Mandarin) were NOT copied. They were
only a sanity check that a given word belongs to a given HSK level. HSK level
membership comes from the official public HSK standard; all content here is
original.

## Preserved (verified)
V3.0A (SocialShareButtons, LeadCaptureBox, emailLeads + migration), GA4
(analytics, /admin excluded), V2.9C/E (hero webp, how-it-works webp, video 548KB,
no root images/videos), V2.9B/B.1 (progress, XP, dashboard, daily). Index JS =
453KB (the 586 words live in the lazy dictionaryCore chunk ~77KB, not on the
homepage). robots.txt/llms.txt unchanged. Deps unchanged.

## Changed / new files
- NEW: src/data/dictionaryHsk2Extra.ts, src/data/dictionaryHsk3.ts
- EDIT: src/data/dictionaryCore.ts (type hsk 1|2|3 + wire batches),
  src/pages/Dictionary.tsx (HSK3 filter), public/sitemap.xml, package.json

## Build
npm install && npm run build → passes on Node 18. No .env/dist/node_modules/.git
in the package.

---

# NiHao V3.0A — Social Sharing + Email Lead Capture

Base: GitHub main 88056d7 (V2.9E, v2.9.4) — fresh clone, not local folders. First
growth phase. No redesign — only two new components, a Supabase migration, and
safe GA4 events. No new dependencies, no external SDKs, no paid APIs, no voice
storage. All V2.9B–V2.9E work preserved.

## Email lead capture (Supabase only)
- New migration supabase/migrations/20260615_email_leads.sql creates email_leads
  with ONLY: email, source_path, source_type, consent, created_at (UNIQUE email).
  No name/phone/age/user_id — no extra PII. RLS:
  * anon + authenticated may INSERT only when consent = true,
  * NO public SELECT (visitors can never read the list),
  * admins (existing user_roles pattern) may read it.
- src/lib/emailLeads.ts — subscribeEmail() (insert-only, validates email, maps
  unique-violation to a friendly "already subscribed").
- src/components/LeadCaptureBox.tsx — "كلمة كل يوم في بريدك" with an email field
  and a required consent checkbox. Shown on the homepage (banner before the CTA)
  and in the footer (so it appears after content site-wide). On success it fires
  a GA4 newsletter_signup event with source only — the email is NEVER sent to GA4.

## Social sharing (lightweight, no SDK)
- src/components/SocialShareButtons.tsx — uses navigator.share when available,
  else WhatsApp / Facebook / X / copy-link via plain URLs. No Facebook SDK, no
  Twitter SDK, no heavy libraries. Fires a safe GA4 share event (method + path).
- Added to: story pages (after the quiz), dialogue pages (/dialogues/:slug),
  dictionary word pages (/dictionary/:slug), and the daily practice done step.

## GA4 events (safe, no PII)
- newsletter_signup { source_type, source_path } — no email.
- share { method, source_path }.
Both go through the existing analytics helper, so they stay production-only and
are skipped on /admin.

## Preserved (verified)
- V2.9E: hero-illustration.webp + mobile webp; old PNG still absent.
- V2.9D: analytics.ts / AnalyticsTracker.tsx / analytics.d.ts; /admin not tracked.
- V2.9C: 4 how-it-works WebP; video-classroom.mp4 = 548KB; no root images/ or
  videos/ duplicates.
- V2.9B/B.1: studentProgress.ts, MarkComplete.tsx, ProgressPanel.tsx, Dashboard,
  Daily, the student_progress migration, XP system.
- SEO: sitemap.xml, robots.txt, llms.txt unchanged; /daily in; no admin/draft.
- Index JS: 453KB (V2.9E was 449KB; +4KB for the two small components, no heavy
  deps). Deps unchanged.

## Manual Supabase step (one-time)
Run supabase/migrations/20260615_email_leads.sql in the Supabase SQL editor
(alongside the earlier admin_content_drafts and student_progress migrations).

## Changed / new files
- NEW: supabase/migrations/20260615_email_leads.sql, src/lib/emailLeads.ts,
  src/components/LeadCaptureBox.tsx, src/components/SocialShareButtons.tsx
- EDIT: src/pages/Home.tsx (lead banner), src/components/Footer.tsx (lead box),
  src/pages/Stories.tsx, src/pages/StudentDialogues.tsx,
  src/pages/DictionaryWord.tsx, src/pages/Daily.tsx (share buttons), package.json

## Build
npm install && npm run build → passes on Node 18. No .env/dist/node_modules/.git
in the package.

---

# NiHao V2.9E — Homepage Hero / LCP Optimization

Base: GitHub main 4dd9fc8 (V2.9D, GA4 on V2.9C). No redesign, no font/visual
change, no new dependencies, no schema change. GA4, V2.9C performance, and
V2.9B/B.1 progress features all preserved.

## What the LCP element actually is
Inspecting Home.tsx: the hero (HeroSection) uses a WebGL <canvas> background plus
a large animated <h1> headline. The LCP element is that <h1> text — NOT an image.
public/images/hero-illustration.png (2.3MB) was referenced NOWHERE in the source
(checked src, CSS, index.html, manifest), so it was never the live hero; it was
dead weight that Vite still copied into the build.

## Fixes
1. LCP text paint: the <h1> was wrapped in a motion.div with `delay: 0.5s` and
   `opacity: 0` initial, so the LCP text couldn't paint for ~500ms+. Reduced to
   `delay: 0` (duration 0.6s) so the headline paints immediately. Also reduced
   the above-the-fold subtitle (1s→0.15s), buttons (1.2s→0.25s), and trust row
   (1.5s→0.35s) delays. The staggered entrance feel is kept; nothing else
   changes visually.
2. Removed the unused 2.3MB hero-illustration.png so it's no longer shipped/
   copied to dist (it was never used as the hero). 
3. Created optimized hero images for any future use / per checklist:
   - public/images/hero-illustration.webp — 141KB (was 2.3MB PNG, -94%)
   - public/images/hero-illustration-mobile.webp — 62KB
4. Hero video already preload="none" and not above-the-fold blocking (kept). The
   WebGL canvas initializes in a useEffect (after first paint), so it doesn't
   block FCP. GA4 stays async/dynamic and never blocks first paint.

## Hero image before/after
- hero-illustration.png: ~2,263KB → removed from the live build.
- hero-illustration.webp: 141KB (desktop), hero-illustration-mobile.webp: 62KB.
- Mobile hero image: yes, a smaller mobile WebP was added.

## Preserved (verified)
- GA4: analytics.ts, AnalyticsTracker.tsx, analytics.d.ts present; /admin still
  excluded; VITE_GA_MEASUREMENT_ID still used; non-blocking.
- V2.9C: 4 how-it-works WebP present; video-classroom.mp4 = 548KB; lazy routes +
  manualChunks intact. Index JS = 449KB (V2.9D was ~449KB — no regression).
- V2.9B/B.1: studentProgress.ts, MarkComplete.tsx, ProgressPanel.tsx,
  Dashboard.tsx, Daily.tsx all present; XP system intact.
- SEO: sitemap.xml, robots.txt, llms.txt unchanged.

## Index JS after build
449KB (unchanged from V2.9D — this pass was animation timing + images, not JS).

## Changed files
- src/pages/Home.tsx (hero above-the-fold animation delays reduced)
- public/images/hero-illustration.webp (new), hero-illustration-mobile.webp (new)
- removed public/images/hero-illustration.png (unused 2.3MB)
- package.json (2.9.4)

## Build
npm install && npm run build → passes on Node 18. No .env/dist/node_modules/.git
in the package.

---

# NiHao V2.9D — GA4 Analytics on top of V2.9C

Base: GitHub main 6c5dc07 (V2.9C, v2.9.3) — the latest commit WITH the mobile
performance work. This rebuilds GA4 on the correct base (the earlier GA4 package
was built on V2.9B.1 and is superseded). All V2.9C performance optimizations and
V2.9B/B.1 progress features are preserved. One GA4 tag only — no GTM, no new
dependencies, no redesign, no schema change, no voice storage.

## V2.9C performance preserved (verified)
- 12 WebP images present (how-it-works-1..4, lesson-activities/chinese-basics/
  colors/family/food/greetings/numbers/school).
- src/pages/Home.tsx references WebP; src/data/courses.ts keeps WebP refs.
- public/videos/video-classroom.mp4 stays compressed (548KB, not 4.5MB).
- Main index JS: 449KB (V2.9C was 448KB; GA4 adds ~1KB — no regression, nowhere
  near the old ~690KB). V2.9C lazy routes + manualChunks intact.

## V2.9B/B.1 progress preserved
studentProgress.ts, MarkComplete.tsx, ProgressPanel.tsx, the student_progress
migration, Daily.tsx, Dashboard.tsx all present; the dashboard XP-consistency fix
(stats card reads summary.xp) is intact. XP system, /daily, /dashboard unchanged.

## GA4 — how it was added
- src/lib/analytics.ts — initAnalytics(), trackPageView(path), trackEvent(name,
  params). Dynamically injects the async gtag.js (never blocks first paint),
  configures with send_page_view:false + anonymize_ip, guarded against double
  init.
- src/components/AnalyticsTracker.tsx — mounted once in App (inside Router);
  inits GA and sends a MANUAL page_view on each route change (path only). No
  double counting.
- src/types/analytics.d.ts — window.gtag / window.dataLayer types.
- .env.example — documents VITE_GA_MEASUREMENT_ID.

## GA4 — privacy & safety
- Runs only when import.meta.env.PROD AND VITE_GA_MEASUREMENT_ID are set (dev =
  no GA). ID is not hardcoded.
- Any path starting with /admin is excluded (no page views/events).
- No PII: only page path/title + content slugs/types. No email/name/user id/
  progress details/voice/answers. anonymize_ip on.
- No GTM. index.html has zero GA code (injected once) → no duplicate scripts.

## Events (minimal, safe)
start_lesson, complete_lesson, complete_dialogue, complete_daily, complete_story,
dictionary_word_view — slugs/types only.

## Changed/new files
- NEW: src/lib/analytics.ts, src/components/AnalyticsTracker.tsx,
  src/types/analytics.d.ts, .env.example
- EDIT: src/App.tsx (mount tracker), src/components/MarkComplete.tsx (completion
  events), src/pages/DictionaryWord.tsx (word view), src/pages/Lesson.tsx
  (start_lesson)

## Build & SEO
npm install && npm run build → passes on Node 18. sitemap/robots/llms unchanged.
No .env / node_modules / dist / .git in the package.

---

# NiHao V2.9C — Mobile Performance (built on latest main, progress preserved)

Started from the latest GitHub main commit 4fa42b3 (V2.9B.1, v2.9.2) — NOT from
any older base. All V2.9B/V2.9B.1 progress features are preserved. Performance-
only pass: no redesign, no new features, no schema change, no new dependencies,
no voice storage. Preserved: Vite 5.4.21, plugin-react 4.7.0, router 6.30.1,
supabase-js 2.46.0, Node >=18.20.8.

## Scope 1 — Homepage audit
Home, Header, Layout, Footer import no heavy data (only the small courses list).
No accidental dictionary/dialogues/stories/study-in-china/admin imports on the
homepage path. The weight was (a) images/video and (b) several non-homepage
pages bundled eagerly.

## Scope 2 — Image optimization (the ~6MB savings)
- 4 how-it-works illustrations: PNG → WebP, resized to 3x their 120px display
  size. 5,718KB → 120KB (saved ~5.6MB).
- 7 homepage level images: JPG → WebP. 536KB → 141KB.
- Hero video recompressed with ffmpeg (1280x720 kept, CRF 30, muted/no audio,
  +faststart): 4.5MB → 548KB (-88%). Same filename. Added preload="none" + WebP
  poster.
- Added loading="lazy", decoding="async", width/height to homepage images.
- Originals kept in the repo (used elsewhere / per spec).
- Homepage media payload: ~11.6MB → ~1.2MB (about -90%).

## Scope 3 — JS / main-thread reduction
- Kept V2.9A lazy loading + manualChunks (react-vendor / motion / supabase).
- Moved 5 non-homepage pages that were still eager (Courses, Lesson, Practice,
  Dashboard, Dictionary) to React.lazy. Home, Login, Register stay eager.
- Main index JS: 731KB → 448KB (-39%). Gzipped: 208KB → 129KB (-38%).
- Largest chunks after: index 448KB, motion 127KB, supabase 103KB, StudyInChina
  66KB, studentDialogues 60KB. No tiny over-splitting; warning not suppressed.

## Scope 4 — CSS / animations
- prefers-reduced-motion already present (kept).
- Added MOBILE-ONLY backdrop-blur reduction (20/30px → 10/14px under 768px) to
  cut GPU compositing cost / TBT. Desktop unchanged. Mobile menu stays solid.

## Scope 5 — Fonts
- Already non-render-blocking (media=print → onload all) with trimmed weights
  from V2.9A; kept as-is. CJK (Noto Serif SC) is genuinely used on the homepage
  (Chinese word previews + decorative characters), loaded non-blocking with
  display=swap, so no change needed. No huge CJK self-hosting attempted.

## Scope 6 — Server recommendations (RunCloud / Cloudflare)
- Cache /assets/* for 1 year (immutable); /images/* ~1 month.
- Enable Brotli. Do not cache HTML aggressively.
- IMPORTANT (from an earlier curl test): the live server returned /assets/*.js
  with content-type text/html and cache-control no-store, and TTFB ~3.9s. Ensure
  nginx serves assets with `try_files $uri =404`, correct MIME types, long cache
  + brotli_static, and investigate the high TTFB. Code can't fix server config.
- Do not rely on Cloudflare to fix oversized images (already optimized here).

## Scope 7 — SEO safety
sitemap.xml, robots.txt, llms.txt byte-identical to main. /daily present;
/dashboard NOT indexed; 0 admin/draft/practice routes; 28 study-in-china pages
intact. Structured data untouched.

## Scope 8 — Feature preservation
All present and working: studentProgress.ts, MarkComplete.tsx, ProgressPanel.tsx,
20260614_student_progress.sql, Daily.tsx, Dashboard.tsx, StudentDialogues.tsx,
DictionaryWord.tsx, VoicePractice.tsx. Voice stays local-only (no Storage, no
voice_submissions, no upload).

## Changed files
- src/pages/Home.tsx (WebP refs + lazy/dims + video preload)
- src/data/courses.ts (level images → WebP)
- src/App.tsx (5 more pages lazy)
- src/index.css (mobile blur reduction)
- public/images/*.webp (new optimized), public/videos/video-classroom.mp4 (recompressed)
- package.json (2.9.3)

## Routes tested
/ /daily /dashboard /dialogues /dialogues/airport-arrival /stories /dictionary
/dictionary/huzhao /study-in-china /admin/content-drafts /sitemap.xml /llms.txt

---

# NiHao V2.9B.1 — Dashboard Progress Consistency Fix

Base: V2.9B (v2.9.1). Bug-fix only. No redesign, no new features, no schema
change, no new dependencies, no voice storage.

## The bug
The dashboard had TWO different XP sources:
- The new V2.9B ProgressPanel read XP from getSummary() → correctly showed 15 XP
  after one dialogue.
- The old stats card computed `calculateXP(progress, quizResults) + getXP()`
  (Supabase lesson progress + the old local gamification ledger), which knew
  nothing about the new student_progress dialogues → showed 0 XP.

## The fix
- Dashboard.tsx now loads the V2.9B progress summary (getSummary()) into state
  and the stats XP card reads `summary.xp` — the SAME source ProgressPanel uses.
  Removed the now-unused calculateXP/getXP XP computation. So after completing one
  dialogue, every XP card shows 15 XP.
- XP formula unchanged: lesson 10, story 15, dialogue 15, daily 20.
- getSummary() already works for guests (localStorage fallback), so the
  logged-out path is preserved.
- Recent activity and the completed-dialogue count are untouched and still work.

## Nicer activity labels
Recent activity used to show the raw slug ("airport-arrival : حوار"). It now
resolves to a readable Arabic label:
- dialogue → "حوار: <title_ar>" e.g. "حوار: في المطار — الوصول إلى الصين"
- story → "قصة: <title_ar>"
- daily → "تدريب يومي: <date>"
Recent-activity links now also point to the specific item
(/dialogues/<slug>, /stories/<slug>).

## Safety
Dark/red layout, fonts, and visual style unchanged. /daily, /dialogues/:slug,
/stories, /dashboard all still work. No Supabase schema change. No voice storage.
sitemap/robots/llms unchanged; 0 admin/draft routes. Build passes on Node 18.

## Changed files
- src/pages/Dashboard.tsx (XP card now reads the unified summary)
- src/components/ProgressPanel.tsx (nice Arabic activity labels + specific links)
- package.json (version 2.9.2)

## Test cases
1. Complete /dialogues/airport-arrival (علّم كمكتمل).
2. Open /dashboard.
3. Completed dialogues = 1.
4. XP = 15 in BOTH the top badge and the stats card.
5. Recent activity shows "حوار: في المطار — الوصول إلى الصين" and links to the dialogue.

---

# NiHao V2.9B — Student Progress + Dashboard + Daily Practice + Light XP

Base: local V2.9A source (GitHub main was at V2.8C; the V2.8C + V2.9A + V2.9B
chain ships together — deploy combined, then run the new migration once). Second
half of the V2.9 plan — the learning-experience layer. Preserved: Vite 5.4.21,
plugin-react 4.7.0, router 6.30.1, supabase-js 2.46.0, Node >=18.20.8. No new
dependencies. No voice storage.

## Scope 1 — Student progress system
- New migration supabase/migrations/20260614_student_progress.sql creates the
  student_progress table (id, user_id, content_type, content_slug, status, score,
  completed_at, created_at, updated_at), a UNIQUE(user_id, content_type,
  content_slug) constraint, indexes, and an updated_at trigger. RLS: students
  manage only their own rows; admins can read all via the existing user_roles
  pattern. The public site/SEO do NOT depend on this table.
- New src/lib/studentProgress.ts: getProgress(), markCompleted(),
  unmarkCompleted(), isCompleted(), getRecentActivity(), getSummary(). Uses
  Supabase when logged in, else a localStorage fallback for guests. XP map lives
  here (lesson 10, story 15, dialogue 15, quiz 10, daily 20).

## Scope 2 — Mark-complete buttons
- New src/components/MarkComplete.tsx: "علّم كمكتمل" / "تم إكماله" /
  "إلغاء الإكمال", with a "سجّل الدخول لحفظ تقدمك" prompt for guests.
- Wired into story pages (on quiz finish, type=story) and dialogue pages
  (type=dialogue). Lessons were intentionally NOT modified: the Lesson page
  already has its own Supabase completion + XP flow, so adding a second tracker
  there would risk double-counting. The dashboard still reflects lessons via the
  existing system.

## Scope 3 — Dashboard improvements
- New src/components/ProgressPanel.tsx at the top of /dashboard: total XP,
  continue-learning / suggested next step, completed counts (lessons, stories,
  dialogues, daily) as cards, and recent activity. Empty state:
  "ابدأ أول درس أو حوار ليظهر تقدمك هنا." Mobile-first, Arabic-first.

## Scope 4 — Daily practice (/daily)
- The existing /daily page (5 words + 3 sentences + mini quiz) gained: a local
  speaking-practice task using the shared VoicePractice component, and a
  MarkComplete (type=daily, slug = today's date) on the done step. Arabic SEO
  title + meta added. /daily added to the sitemap (public, priority 0.8).

## Scope 5 — Light XP
- XP computed from progress (lesson 10 / story 15 / dialogue 15 / quiz 10 /
  daily 20) and shown on the dashboard. No streaks, no leaderboards, no badges.

## Scope 6 — Voice policy
- Voice stays LOCAL ONLY (record / stop / play / retry). No Supabase Storage, no
  voice_submissions table. The migration explicitly stores no audio.

## Scope 7 — SEO safety
- sitemap.xml: /daily added; 0 admin, draft, or /dialogues-practice routes;
  /dashboard NOT indexed (private). robots.txt and llms.txt unchanged. No SEO
  pages removed.

## Manual Supabase step (one-time)
Run supabase/migrations/20260614_student_progress.sql in the Supabase SQL editor
(in addition to the earlier 20260613_admin_content_drafts.sql). Requires the
existing user_roles table for the admin read policy.

## Routes to test
/ · /dashboard (progress panel) · /daily (voice + mark complete) · /stories
(mark complete after quiz) · /dialogues/airport-arrival (mark complete) ·
/dictionary/huzhao · /admin/content-drafts · /sitemap.xml · /llms.txt

---

# NiHao V2.9A — Mobile Performance + Mobile Menu Fix

Base: local V2.8C source (GitHub main was at V2.8B; V2.8C + this ship together).
First half of the V2.9 plan — the urgent pre-marketing fixes (Parts 1, 2, 7).
The student-experience features (progress, dashboard, daily, XP — Parts 3-6)
follow in V2.9B so each can be tested independently. Preserved: Vite 5.4.21,
plugin-react 4.7.0, router 6.30.1, supabase-js 2.46.0, Node >=18.20.8. No SQL,
no paid/AI APIs, no new dependencies, no service worker, no SSR.

## Part 1 — Mobile performance
- Converted 19 more secondary pages to React.lazy (Quiz, Vocabulary,
  Pronunciation, Results, Certificate, About, Contact, FAQ, Flashcards,
  Essentials, ToneTrainer, NumberTrainer, Dialogues, PathMap, PlacementTest,
  Profile, Review, Daily, Pinyin). Home, Login, Register, Dashboard stay eager
  for fast core nav. Route URLs unchanged.
- Added build.rollupOptions.manualChunks to split vendor libs into cacheable
  chunks: react-vendor (34KB), motion (127KB), supabase (103KB).
- Main index chunk: 1.1MB → 665KB (about -40%). The "chunk > 500KB" warning is
  resolved.
- Arabic Suspense fallback: "جاري التحميل..." with a spinner.
- Fonts: reduced to the weights actually used and loaded non-render-blocking
  (media="print" → onload media="all", with a <noscript> fallback) so they no
  longer block first paint. This matters for the very slow mobile FCP/LCP.

NOTE: code changes cut JS dramatically, but the live 70s FCP/87s LCP also point
to a SERVER issue. On RunCloud, enable gzip/brotli compression and cache headers
for /assets, and confirm a healthy TTFB — that's required alongside this build
to reach good Core Web Vitals.

## Part 2 — Mobile menu fix
- Mobile menu is now a SOLID #0A0A0A panel with border + shadow (was
  transparent liquid-glass), much clearer to read.
- Menu closes automatically after tapping any link/button.
- Larger tap targets (py-2 → py-3) and lighter text for contrast.
- Header bar made more solid (0.92/0.97 opacity) so it stays clear on scroll.
- Desktop nav unchanged; RTL preserved; routing unaffected.

## Part 7 — SEO safety
sitemap.xml, robots.txt, llms.txt unchanged from V2.8C. No admin, draft, or
/dialogues-practice routes in the sitemap (verified 0).

## Safety
All existing routes and features intact (admin, dictionary, dialogues, stories,
voice practice, study-in-china). No voice storage added. Build passes on Node 18.
No new dependencies.

## Routes to test
/ (fast first paint) · /dictionary · /dictionary/huzhao · /dialogues ·
/dialogues/airport-arrival · /stories · /admin/content-drafts. On mobile: open
the menu (solid, readable), tap a link (menu closes).

---

# NiHao V2.8C — Story↔Dictionary Linking + Unified Voice Practice

Base: GitHub main b509fec (V2.8B, v2.8.1). Third layer of V2.8. Links story
vocabulary to dictionary word pages, expands word-usage cross-links to include
lessons, and introduces ONE shared voice-practice component used by both stories
and dialogues. Preserved: Vite 5.4.21, plugin-react 4.7.0, router 6.30.1,
supabase-js 2.46.0, Node >=18.20.8. No SQL changes, no paid/AI APIs, no new deps.

## Scope 1 — Story → dictionary linking
- Story vocab cards on /stories/:id now link to /dictionary/<slug> when the word
  exists (audio-play fallback otherwise). Uses dictionaryCore's wordSlug so slugs
  match exactly.
- Added a small, documented batch of 8 story words that appeared in stories but
  weren't in the dictionary (起床, 饭馆, 服务员, 饭店, 到, 星期六, 公园, 每天) →
  src/data/dictionaryStoryWords.ts, wired into dictionaryCore. Deduped by Chinese
  char + tone-stripped pinyin. Dictionary: 247 → 254 words, 0 duplicate slugs.
  Story-vocab → dictionary linkage: 32/40 → 39/40.

## Scope 2 — Word-usage expansion
- src/lib/wordUsages.ts now also returns LESSONS that teach a word (matched on
  lesson vocabulary), deep-linking to /courses/<stage>/<lessonId> via the stage
  range map. Word pages now show "appears in": dialogues, stories, AND lessons.
- Verified: /dictionary/huzhao → airport/registration/bank/SIM dialogues;
  story words (e.g. 起床) → their story + the lesson that teaches them.
- DictionaryWord.tsx renders a lesson icon (GraduationCap) for lesson links.

## Scope 3 — Unified voice practice (local-only)
- New src/components/VoicePractice.tsx wraps the existing mobile-safe
  useVoiceRecorder hook (iOS MIME detection). LOCAL ONLY: record → stop → play
  back → retry. No Supabase, no upload, no storage.
- Buttons (Arabic): "سجّل صوتك" / "أوقف التسجيل" / "استمع إلى تسجيلك" /
  "أعد المحاولة", plus the playback-failure message and the HTTPS/mic helper text.
- Used on dialogue pages (/dialogues/:slug) under "تدرّب على النطق".
- Stories.tsx refactored to use the SAME component; the story "Play all" listening
  mode (speechSynthesis) is kept separate and UNTOUCHED.

## Scope 4 — SEO
- sitemap.xml regenerated → 354 URLs (+254 word pages, +15 dialogue pages). NO
  admin, draft, or /dialogues-practice routes (verified 0).
- robots.txt and llms.txt unchanged. BreadcrumbList/DefinedTerm JSON-LD unchanged
  and safe.

## Safety
V2.8B dialogues, admin/content-drafts (AdminContentDrafts.tsx + adminDrafts.ts
byte-identical), and the voice recorder hook (useVoiceRecorder.ts byte-identical)
are all intact. Story speechSynthesis audio untouched. Build passes on Node 18.
No new dependencies.

## Sample test URLs
/stories · /stories/school-day (vocab cards now link to dictionary) · /dialogues ·
/dialogues/airport-arrival (voice practice + vocab links) · /dictionary/huzhao
(appears-in dialogues) · /dictionary/qichuang (story word, appears-in story+lesson).

---

# NiHao V2.8B — Student Dialogues System + Dictionary Cross-Links

Base: local V2.8A source. Second layer of V2.8 ("dialogues + linking"), built on
top of the V2.8A dictionary. Merges the uploaded "NiHao Dialogues Batch 1" (12
dialogues) PLUS 3 authored dialogues, and links every dialogue word to its
/dictionary/:slug page. Preserved: Vite 5.4.21, plugin-react 4.7.0, router
6.30.1, supabase-js 2.46.0, Node >=18.20.8. No SQL for the public site, no
paid/AI APIs, no new dependencies.

## What's new
### 15 student dialogues (12 from the pack + 3 authored)
src/data/studentDialogues.ts — airport, taxi, university registration, dorm
check-in, meeting a classmate, cafeteria, restaurant, supermarket, bank account,
SIM card, hospital, homework (the 12 pack dialogues), plus authored: library
book borrowing, asking directions, buying coffee. 167 total turns, AR/EN/ZH +
pinyin, HSK1–HSK2, with per-dialogue vocab lists and disclaimers where relevant
(registration, bank, hospital). Speaker mapping: the Arab student = speaker B
(highlighted), the other person = A.

### Dialogue pages (/dialogues/:slug) + hub (/dialogues)
src/pages/StudentDialogues.tsx — the hub lists all 15 with an HSK filter; each
/dialogues/:slug page renders the conversation (tappable audio per line),
disclaimer, and a vocabulary section where each word links to its dictionary
page. Emits BreadcrumbList JSON-LD and sets its own SEO title + meta description.
The previous interactive A/B dialogues are preserved at /dialogues-practice
(nothing removed).

### Dictionary grew via dialogue vocab (no duplicates)
src/data/dictionaryDialogueWords.ts — 77 unique new words pulled from the
dialogue vocab (passport, visa, dormitory, bank card, prescription...) added to
the canonical dictionary. Deduped by Chinese char + tone-stripped pinyin, so no
duplicates with HSK1/HSK2. Dictionary: 172 → 247 words, 0 duplicate slugs.
Dialogue-vocab → dictionary linkage went from 64/148 to 147/148.

### Cross-linking web (the "reference" goal)
src/lib/wordUsages.ts now also scans the student dialogues, so a word page's
"appears in" section links to the specific dialogues that use it (e.g. 护照 →
airport, registration, bank, SIM dialogues). Dialogue ⇄ dictionary is now
bidirectional.

## SEO
- sitemap.xml → 347 URLs: +247 dictionary word pages, +15 dialogue pages.
  NO admin, draft, or /dialogues-practice routes (verified 0).
- llms.txt notes the student-situation dialogues.
- BreadcrumbList JSON-LD on dialogue pages; DefinedTerm on word pages (V2.8A).
- robots.txt unchanged.

## Safety
Existing /dictionary (with V2.8A filters), lessons, stories, admin drafts, and
the mobile voice recorder all intact. The old interactive dialogues are kept at
/dialogues-practice. Build passes on Node 18. No new dependencies.

## Sample test URLs
/dialogues (hub) · /dialogues/airport-arrival · /dialogues/university-registration ·
/dialogues/bank-account · /dialogues/hospital-visit · /dialogues/buying-coffee.
Word page cross-links: /dictionary/huzhao (护照, "appears in" airport/bank/...).

---

# NiHao V2.8A — Dictionary Expansion + Individual Word Pages

Base: local V2.7.3 source (GitHub main was at V2.6; the V2.7A chain + V2.8A ship
together — deploy combined, run the admin migration once, then push). First
layer of V2.8 ("the reference layer"). Stories/dialogues will link INTO these
word pages in a later layer (V2.8B/C). Preserved: Vite 5.4.21, plugin-react
4.7.0, router 6.30.1, supabase-js 2.46.0, Node >=18.20.8, any-client + BUCKETS,
noImplicitAny:false. No SQL required for the public site, no paid/AI APIs, no new
dependencies.

## Dictionary page system
New canonical, in-code dictionary so every word page is always indexable
(independent of Supabase):
- src/data/dictionaryCore.ts — builds a de-duplicated DictWord[] from the
  existing HSK1 data + an HSK2 batch. Provides stripTones(), wordSlug() (tone-
  stripped pinyin → url-safe slug, hanzi-codepoint fallback), category inference
  (Arabic labels), related-word linking (same category), and exports
  dictionaryWords, wordBySlug(), dictionaryCategories, dictionarySlugs.
- src/data/dictionaryHsk2.ts — a clean initial HSK2 batch (20 words) with
  examples. Kept small on purpose to avoid overloading the release.
- src/pages/DictionaryWord.tsx — the /dictionary/:slug page: Chinese character,
  pinyin (PinyinText, with audio), Arabic meaning, English (if available),
  category, HSK level badge, example sentences (zh + pinyin + Arabic, tappable
  audio), related words (linked), and "appears in" cross-links to stories/
  dialogues that use the word. Sets its own SEO <title> + meta description and
  emits DefinedTerm + BreadcrumbList JSON-LD.
- src/lib/wordUsages.ts — finds stories/dialogues containing a word (static
  lookups, no network) for the cross-links.

## Dictionary list page (/dictionary)
- Search (zh / pinyin tone-insensitive / Arabic / English).
- Filter by HSK level (All / HSK1 / HSK2).
- Filter by category (Arabic labels).
- Clean browse grid of cards, each linking to /dictionary/<slug>.
- Existing Supabase fetch + fallback, Word-of-the-Day and saved words preserved.

## Duplication protection + slugs
- Dedup key = Chinese characters + tone-stripped pinyin; duplicates are dropped
  at build time (227 raw HSK1 items → 152 unique words).
- Slugs are url-safe and made unique; homophone collisions get a -2/-3 suffix.
- Verified: 172 words total (152 HSK1 + 20 HSK2), 0 duplicate slugs.

## SEO
- sitemap.xml regenerated → 257 URLs, including all 172 /dictionary/<slug> word
  pages (priority 0.6). NO admin or draft routes (verified 0).
- /dictionary list links internally to every word page.
- robots.txt unchanged; llms.txt notes the dictionary word-page section.
- DefinedTerm + BreadcrumbList JSON-LD on each word page.

## Safety
Existing dictionary search/WOTD/saved words, lessons, stories, admin drafts and
the mobile voice recorder are all intact (Stories.tsx byte-identical to V2.7.3).
Build passes on Node 18. No new dependencies.

## Sample test URLs
/dictionary/ni · /dictionary/hao · /dictionary/xiexie · /dictionary/xuexiao ·
/dictionary/zhidao (HSK2) · /dictionary/shijian (HSK2). List + filters: /dictionary

---

# NiHao V2.7.3 — Combined Package (V2.7A + V2.7A.1 + V2.7A.2 + V2.7A.3)

This single package merges the full admin-content + mobile-voice work, because
GitHub main was still at V2.6 and the intermediate releases were not pushed
individually. Deploy this one package (and run the migration once) to get
everything. Version: 2.7.3. Node 18 compatible. No paid/AI APIs. No new
dependencies. Public SEO routes, sitemap.xml, robots.txt, llms.txt and story
audio all UNCHANGED.

Included:
- V2.7A  — Admin Content Draft Manager (admin-only drafts, RLS, migration).
- V2.7A.1 — Admin draft preview polish (dependency-free Markdown rendering).
- V2.7A.2 — FAQ/internal-links JSON parser compatibility + path normalization.
- V2.7A.3 — Mobile user voice-recording playback fix (iOS MediaRecorder MIME).

Per-release detail follows below.

---

# NiHao V2.7A.3 — Mobile Voice Recording Fix

Base: local V2.7A.2 source. Focused hotfix for the story "shadowing" feature's
USER voice recording on mobile. Story audio (speechSynthesis) UNCHANGED. Public
SEO routes, sitemap.xml, robots.txt, llms.txt, DB schema all UNCHANGED. No AI,
no paid APIs, no new dependencies. Node 18 compatible.

## Root cause (iPhone MediaRecorder MIME)
The old code did `new MediaRecorder(stream)` then built the Blob with a
hard-coded `{ type: 'audio/webm' }`. iOS Safari cannot record or play
audio/webm — it records audio/mp4 — so the recorded Blob had a type the browser
could not decode, and playback silently failed. On desktop Chrome it happened to
work because Chrome records webm, which masked the bug.

## The fix
New hook src/hooks/useVoiceRecorder.ts:
- Picks a supported MIME via MediaRecorder.isTypeSupported, in order:
  audio/webm;codecs=opus -> audio/webm -> audio/mp4 -> audio/mpeg -> (no
  mimeType, browser default). On iOS/Safari this resolves to audio/mp4 instead
  of forcing webm.
- Builds the final Blob with the type the recorder ACTUALLY used
  (mimeRef || rec.mimeType), so the object URL is always decodable.
- Explicit state machine: idle -> requesting -> recording -> processing ->
  ready -> error. Recording starts only after the user taps "سجّل صوتك".
- On stop: stops all microphone tracks, collects chunks, builds the Blob,
  creates an object URL, and exposes it for playback. Revokes old URLs.
- Clear Arabic error messages by getUserMedia error name:
  - NotFound -> "لم يتم العثور على ميكروفون."
  - NotAllowed/Security -> "تم رفض إذن الميكروفون. فعّل الميكروفون من إعدادات المتصفح."
  - unsupported recorder -> "متصفحك لا يدعم تسجيل الصوت بهذه الصيغة."
  - empty/other -> "تعذر تشغيل التسجيل. جرّب تحديث الصفحة."

## Stories.tsx (shadowing UI only)
- Uses the hook instead of inline MediaRecorder logic.
- New explicit "استمع إلى تسجيلك" (Listen to your recording) button that calls
  audio.play() and catches failures.
- If playback fails: "تم التسجيل، لكن المتصفح لم يستطع تشغيل التسجيل. جرّب Safari
  أو Chrome محدث."
- Record button shows requesting/processing states and is disabled during them.
- The recorder section is hidden entirely when MediaRecorder/getUserMedia are
  unsupported (no broken audio player).
- Persistent helper text: "إذا لم يعمل التسجيل، تأكد من السماح للميكروفون وفتح
  الموقع عبر HTTPS."
- No pronunciation scoring is attempted; the minimum success (record + play
  back) is never blocked.

## i18n
Added stories.playRec, stories.requesting, stories.processing (AR + EN).

## SEO safety (verified)
sitemap.xml, robots.txt, llms.txt byte-for-byte UNCHANGED. Story audio
(speechSynthesis) untouched. Public routes unchanged.

---

# NiHao V2.7A.2 — Admin Preview JSON Compatibility Fix

Base: local V2.7A.1 source (GitHub main was still V2.6; V2.7A/.1 not yet pushed,
so this package contains V2.7A + V2.7A.1 + this fix — deploy combined, or push
the earlier ones first). Admin-only preview hotfix. PUBLIC SITE, SEO,
sitemap.xml, robots.txt, llms.txt and DB schema all UNCHANGED. No AI, no paid
APIs, no new dependencies.

## Root cause
The preview read draft.faq_json[i].q / .a and internal_links_json[i].path /
.label directly. Drafts authored with alternate key names (question/answer,
title/body, url/href/text) — or JSONB columns that arrive as JSON strings —
therefore rendered as EMPTY cards / empty link sections.

## Fix — tolerant parsers (src/lib/adminDrafts.ts)
- coerceToArray(): accepts an array, a single object, or a JSON string needing
  JSON.parse; returns a clear Arabic error for invalid/unsupported JSON.
- parseFaq(): recognizes {q,a} | {question,answer} | {title,body} (+ Q/A/text).
  Items with no recognized keys are marked unsupported and carry their raw keys.
- parseLinks(): recognizes {label,path} | {label,url} | {text,href} (+ to/link/
  title/name). Detects external URLs; normalizes internal paths.
- normalizeLinkPath(): now also strips a trailing slash, so "pinyin/" -> "/pinyin"
  (was "/pinyin/"). "pinyin"->"/pinyin", "/pinyin"->"/pinyin", deep paths like
  "/blog/study-in-china-saudis" kept, external https:// unchanged.
- canonicalFaq()/canonicalLinks(): emit canonical {q,a} / {label,path} for export
  and the SEO checklist counts.

## Preview (src/pages/AdminContentDrafts.tsx)
- FAQ cards now show question + answer for every supported shape; empty fields
  show "(سؤال/إجابة فارغة)". Unsupported items show "FAQ item has unsupported
  keys" + a small admin-only debug line listing the raw keys. Invalid JSON shows
  a clear warning.
- Internal links render clickable: internal via react-router <Link> in the same
  tab, external via <a target="_blank" rel="noopener noreferrer">. Normalized
  path shown beside the label.
- Markdown preview (AdminMarkdown) renders #/##/### headings, paragraphs, bullet
  and numbered lists, **bold**, [text](/path) links (clickable), and line breaks,
  in RTL.

## Export normalization (requirement 7)
Copy JSON now emits normalized FAQ as [{ "q", "a" }] and internal links as
[{ "label", "path" }]. Copy Markdown and Copy static-article format also run
through the tolerant parsers, so exports are consistent regardless of input shape.

## Verified with the spec's exact inputs
- FAQ ({q,a} + {question,answer}) → both questions and answers display.
- Links ({label,path:"pinyin/"}, {label,url:"/tones"}, {text,href:"courses"}) →
  /pinyin, /tones, /courses.

## SEO safety (verified)
sitemap.xml, robots.txt, llms.txt byte-for-byte UNCHANGED. No draft URLs. No
public draft route. /admin/content-drafts stays behind AdminRoute. DB schema
unchanged.

---

# NiHao V2.7A.1 — Admin Draft Preview Polish

Base: local V2.7A source (GitHub main was still V2.6 at build time — V2.7A not
yet pushed — so this package contains V2.7A + this polish; deploy V2.7A then
push, or deploy this combined package). Admin-only preview fix. PUBLIC SITE,
SEO, sitemap, robots, llms, database schema all UNCHANGED. No AI, no paid APIs.

## What changed (admin draft preview only)
- New src/components/AdminMarkdown.tsx: dependency-free Markdown renderer for the
  admin preview — ## / ### headings, paragraphs, bullet lists (-, *), numbered
  lists (1.), **bold**, and [text](url) inline links. (## no longer shows as raw
  text.)
- DraftPreview now renders the markdown body via AdminMarkdown instead of raw
  whitespace-pre-wrap.
- FAQ preview shows clean question/answer cards with س:/ج: labels.
- Internal links render as clickable admin-preview links (react-router <Link>),
  using normalized paths.
- normalizeLinkPath() in adminDrafts.ts: "pinyin" -> "/pinyin", "tones" ->
  "/tones", "courses" -> "/courses", "dictionary" -> "/dictionary",
  "study-in-china" -> "/study-in-china"; deeper paths (study-in-china/...) kept;
  already-prefixed and external https:// URLs left as-is. Applied in the preview
  AND in the Markdown export.
- Export section in preview: Copy Markdown, Copy JSON, and Copy static-article
  format (draftToStaticArticle() emits a V2.6 SeoArticle-shaped object ready to
  paste into src/data for later static publishing).

## SEO safety (verified)
sitemap.xml, robots.txt, llms.txt byte-for-byte UNCHANGED. No draft URLs
anywhere. /admin/content-drafts remains behind AdminRoute. Database schema
unchanged. Public routes untouched.

---

# NiHao V2.7A — Admin Content Draft Manager (MVP)

Base: GitHub main 96e1c62 (V2.6 — confirmed deployed/pushed). Admin-only content
management; PUBLIC SITE UNCHANGED. Preserved: Vite 5.4.21, plugin-react 4.7.0,
router 6.30.1, supabase-js 2.46.0, Node >=18.20.8, any-client + BUCKETS,
noImplicitAny:false, all V2.6 public routes, sitemap/robots/llms, all static SEO
articles, Study-in-China, AEO answers. No SQL required for the public site, no
paid/AI APIs.

## Supabase schema (migration: supabase/migrations/20260613_admin_content_drafts.sql)
- admin_content_drafts: id, slug (unique), title_ar, meta_title_ar,
  meta_description_ar, target_keyword, secondary_keywords text[], category,
  content_markdown, content_json jsonb, faq_json jsonb, internal_links_json
  jsonb, status (draft|review|ready|archived, CHECK), notes, last_updated,
  created_by, created_at, updated_at (+ updated_at trigger, status/keyword indexes).
- admin_content_audit_log: id, draft_id (FK ON DELETE SET NULL), action, details
  jsonb, created_by, created_at.

## RLS summary
Both tables: RLS enabled, NO public/anon access. Admin-only via the existing
pattern EXISTS(SELECT 1 FROM user_roles ur WHERE ur.user_id=auth.uid() AND
ur.role='admin'): admins FOR ALL on drafts; admins SELECT + INSERT on the audit
log. The SQL documents how to swap the predicate if a project uses a different
admin mechanism.

## Admin feature summary
- New admin-only route /admin/content-drafts (behind AdminRoute / isAdmin).
- Link added to the Admin sidebar ("Content Drafts · مسودات المحتوى"). NOT in
  public navigation.
- List: search (title/keyword/slug), filter by status, inline status switch,
  edit, delete, archive; shows keyword, slug, category, updated date.
- Editor: Arabic title, slug, target keyword, secondary keywords, meta title,
  meta description, category, markdown body, FAQ JSON, internal links JSON,
  notes, status. Plain textareas (no heavy rich-text editor).
- Preview: admin-only render (SEO snippet, title, markdown, FAQ, internal links)
  with a clear "not published / not indexed" banner.
- SEO checklist: slug, title, meta description, target keyword, content length
  (≥300 words), FAQ present, ≥3 internal links, status, ready-to-convert.
- Export: copy as JSON and copy as Markdown (front-matter) for later conversion.
- Service (src/lib/adminDrafts.ts) talks to Supabase, with localStorage fallback
  + a clear banner when the tables/RLS aren't ready, so drafting works offline.

## SEO safety summary (verified)
Drafts in sitemap.xml: 0. Drafts in llms.txt: 0. No public /drafts route. /blog,
/study-in-china, /answers do not import or render drafts. The public site,
sitemap, robots and llms are byte-for-byte unchanged. RLS blocks anon reads even
if a URL were guessed.

## Docs
- ADMIN_CONTENT_WORKFLOW.md added (lifecycle, create/ready/export, why drafts
  aren't public, V2.7B safe-publishing plan).

---

# NiHao V2.6 — Keyword-Based SEO Expansion Sprint 1

Base: GitHub main e8b6095 (V2.5 — confirmed deployed/pushed). Built from Kimi's
Arabic SEO keyword research (P0 low-competition, high-intent clusters: Gulf
students, medicine/nursing, scholarships, visa, costs, Chinese before travel).
Preserved: Vite 5.4.21, plugin-react 4.7.0, router 6.30.1, supabase-js 2.46.0,
Node >=18.20.8, any-client + BUCKETS, noImplicitAny:false, V2.5
sitemap/robots/llms/SEO/JSON-LD system, all routes. No SQL, no paid/AI APIs.

## New routes (10, all under /blog/:slug)
study-in-china-saudis, csc-scholarship-guide-arabs, cost-medical-study-china,
chinese-phrases-for-students, china-student-visa-guide, study-in-china-omanis,
study-in-china-costs-2025, chinese-tones-for-arabs, study-in-china-emiratis,
nursing-study-china-guide.

## Keyword mapping
- study-in-china-saudis -> الدراسة في الصين للسعوديين
- csc-scholarship-guide-arabs -> منحة CSC للطلاب العرب
- cost-medical-study-china -> تكلفة دراسة الطب في الصين
- chinese-phrases-for-students -> جمل صينية يحتاجها الطالب في الصين
- china-student-visa-guide -> فيزا الدراسة في الصين
- study-in-china-omanis -> الدراسة في الصين للعمانيين
- study-in-china-costs-2025 -> تكلفة الدراسة والمعيشة في الصين
- chinese-tones-for-arabs -> نغمات اللغة الصينية للمبتدئين
- study-in-china-emiratis -> الدراسة في الصين للإماراتيين
- nursing-study-china-guide -> دراسة التمريض في الصين

## Architecture
New flexible SEO-article system (src/data/seoSprint1.ts + seoSprint1b.ts) with
content blocks (p / h2 / h3 / list / costTable / phraseTable / note) rendered by
src/pages/SeoArticleView.tsx, wired into /blog/:slug via Article.tsx (sprint
dataset checked first, falls back to original articles). Each page: Arabic-first,
SEO title + meta + H1, H2/H3 structure, highlighted direct answer near the top,
FAQ, internal links, last-updated date, educational disclaimer. The phrase
article uses PinyinText + audio (8 groups, 50 phrases). Cost articles use
estimated-range tables only — NO invented fixed fees/deadlines — each with a
"varies by university/city/year, verify official sources" caution.

## Structured data (reuses V2.5 system)
Every sprint page emits Article + FAQPage + BreadcrumbList JSON-LD. No fake
ratings, reviews, authors or prices.

## Internal linking
/blog gains a featured grid of all 10 above the existing articles;
/study-in-china hub gains a featured grid of the study/cost/scholarship/visa/
medical/nursing guides; each article links into /study-in-china, /pinyin,
/tones, /courses, /dictionary, /answers and related sub-pages + related cards.

## sitemap.xml
Regenerated -> 85 URLs (10 new /blog routes at priority 0.85).

## llms.txt
Added a "High-value guides" section listing all 10 new pages for AI crawlers.

---

# NiHao V2.5 — AI Search Visibility, Answer Engine Optimization & Structured Data

Base: GitHub main 90940fb (V2.4 — confirmed deployed/pushed; V2.3 SEO + V2.4
study-in-china all present). Preserved: Vite 5.4.21, plugin-react 4.7.0, router
6.30.1, supabase-js 2.46.0, Node >=18.20.8, any-client + BUCKETS,
noImplicitAny:false, V2.4 sitemap/robots/SEO system, all routes. No SQL, no
paid/AI APIs.

## New routes
/answers (hub) + 10 /answers/<slug> + /best-chinese-learning-site-arabic

## Answer Hub (/answers)
"أسئلة وأجوبة عن تعلم الصينية والدراسة في الصين" — 6 categories (تعلم الصينية
من الصفر، البينين والنغمات، الدراسة في الصين، الطلاب العرب والخليجيون،
التكاليف والمنح، أدوات NiHao) with a filterable card grid.

## 10 Answer pages (AEO-structured)
best-arabic-site-to-learn-chinese, how-to-start-learning-chinese,
is-chinese-hard-for-arabs, what-is-pinyin, how-to-learn-chinese-tones,
how-long-to-learn-basic-chinese, best-way-to-learn-chinese-before-china,
do-i-need-chinese-to-study-in-china, chinese-or-english-study-in-china,
study-in-china-for-gulf-students. Each page: a highlighted DIRECT answer in the
first 2–3 sentences (built for AI extraction), short explanation, practical
checklist, FAQ, internal links to relevant NiHao pages, an editorial "not
official advice" note + last-updated date, and a verify-official-sources
reminder on study/visa questions. Honest wording throughout — no "officially
the best", no invented official data.

## Best-site landing (/best-chinese-learning-site-arabic)
Criteria-based, honest "how to choose" page: 7 selection criteria (Arabic
explanation, Pinyin visibility, tones practice, beginner lessons, daily
practice, dictionary/stories, study-in-China prep), how NiHao covers each, and
links to /pinyin /tones /courses /dictionary /stories /study-in-china. States
plainly that NiHao does not claim to be "officially the best".

## Structured data (JSON-LD)
New src/components/JsonLd.tsx (injects/cleans <script type="application/ld+json">)
+ src/lib/structuredData.ts builders. Applied:
- Organization + WebSite — site-wide via Seo.tsx (every page).
- FAQPage — /answers (all questions), each answer page, and the best-site page.
- Article — each answer page + best-site page (with dateModified).
- BreadcrumbList — answer pages + best-site page.
- LearningResource — /courses and /pinyin (free, beginner, teaches Mandarin).
All structured data matches visible content. NO fake ratings, reviews, author
credentials or prices (verified by automated check).

## llms.txt
New public/llms.txt: site name, domain, AR/EN description, honest positioning,
key sections (/pinyin /tones /courses /dictionary /stories /study-in-china
/answers /best-chinese-learning-site-arabic), and a crawl note allowing
summary + citation with attribution.

## robots.txt
Keeps User-agent: * / Allow: /. Adds EXPLICIT allow blocks for OAI-SearchBot,
ChatGPT-User, GPTBot, PerplexityBot, Google-Extended, Bingbot, Googlebot, plus
the Sitemap line. Nothing is blocked.

## sitemap.xml
Regenerated → 75 URLs: 25 core/tool (now incl. /answers + /best-chinese-
learning-site-arabic) + 10 blog + 10 stories + 20 study-in-china + 10 answers.

## Internal links + authority signals
/answers and /best-site linked from: homepage promo block, /blog cards,
study-in-china hub cross-links, and the footer. Top nav not crowded. Editorial
"educational content, not official university/legal advice" notes + last-updated
dates on answer pages and the best-site page. ~2 new i18n keys (AR+EN), audit 0
missing.

---

# NiHao V2.4 — "Study in China" Arabic SEO Content Hub

BASE NOTE: built on the LOCAL V2.3 source. GitHub main was still V2.2.1
(c64aa99) at build time — V2.3 had NOT been pushed — and this hub depends on
V2.3's Seo.tsx + sitemap.xml. So this package contains V2.3 + V2.4 together.
DEPLOY ORDER: deploy/push V2.3 first, then this. Preserved: Vite 5.4.21,
plugin-react 4.7.0, router 6.30.1, supabase-js 2.46.0, Node >=18.20.8,
any-client + BUCKETS, noImplicitAny:false, all routes/lessons, PinyinText,
gamification, stories, certificates, worksheets, teacher pack, V2.3 SEO. No
SQL, no paid/AI APIs.

## New routes
/study-in-china (hub) + 20 article routes /study-in-china/<slug>

## Hub (/study-in-china)
Arabic content hub "الدراسة في الصين للطلاب العرب" for ALL Arab students (Gulf,
North Africa, Egypt, Sudan, Iraq, Jordan, Palestine, Yemen, Syria, Lebanon).
General Arabic tone (not Maghrebi-only). 8 overview sections (why study in
China, who it's for, after high school/bac, Chinese-vs-English, documents,
costs, scholarships, student visa), a best-student-cities grid (8 cities with
their provinces), the traveler phrasebook (10 phrases with audio + PinyinText),
internal NiHao learning links (/pinyin /tones /numbers /essentials /dialogues
/dictionary /courses /stories), and three article groups. A verify-official-
sources disclaimer appears on the hub and every article.

## Articles (20 total)
9 general: how-to-apply-after-high-school, requirements-for-arab-students,
costs-tuition-living, best-student-cities, chinese-or-english-programs,
scholarships, student-visa-x1-x2, medical-engineering-business,
before-travel-checklist.
8 regional: gulf-students-guide, oman-students-guide, saudi-students-guide,
uae-qatar-kuwait-bahrain-guide, algerian-students-guide,
morocco-tunisia-students-guide, egyptian-students-guide,
iraq-jordan-sudan-students-guide.
3 BONUS (your requests): university-guide-by-province (universities by
province/climate/cost), universities-chinese-only (Chinese-taught programs +
HSK + the preparatory language year), useful-apps-in-china (WeChat, Alipay,
Baidu/Amap Maps, Didi, Pleco, Meituan/Ele.me + how to rent a house safely).
Each article: SEO title, meta description, Arabic intro, sections, practical
steps, documents checklist, common mistakes, traveler phrasebook, internal
learning links, FAQ, related articles, and the disclaimer. Verified: 20 unique
slugs, 0 missing required fields, 0 broken related links, all 17 spec routes
present.

## No-promises compliance
No guaranteed admission/scholarship/visa, no invented deadlines or fixed fees,
no "one process fits all", explicit "varies by university/city/program/year"
language, and a mandatory caution to verify via the official university site,
the Chinese embassy/consulate in the student's country, and official
scholarship portals.

## Navigation
Prominent hub card on /blog, a Study-in-China link in the footer
(nav.studyInChina, AR "الدراسة في الصين"), and a safe homepage promo section.
Top nav not crowded. ~1 new i18n key (AR+EN), full audit 0 missing.

## SEO
/study-in-china added to Seo.tsx (AR+EN title/description); articles set their
own document.title. sitemap.xml regenerated → 63 URLs (23 core/tool + 10 blog
+ 10 stories + 20 study-in-china). robots.txt unchanged (already allows all).

---

# NiHao V2.3 — SEO Indexing, Sitemap & Product Polish

Base: GitHub main c64aa99 (V2.2.1 — confirmed deployed/pushed). Preserved:
Vite 5.4.21, plugin-react 4.7.0, router 6.30.1, supabase-js 2.46.0, Node
>=18.20.8, any-client + BUCKETS, noImplicitAny:false, all routes/lessons,
PinyinText, gamification, stories, certificates, worksheets, teacher pack.
No SQL, no paid/AI APIs.

## SEO indexing foundation
- public/robots.txt: `User-agent: * / Allow: /` + Sitemap line for cnihao.com.
- public/sitemap.xml: 42 URLs (22 core/tool routes + 10 blog articles + 10
  story details). Lesson URLs use Supabase UUID levelId/lessonId and are NOT
  safely enumerable at build time, so only /courses is included (no broken
  URLs), with lessons reachable via internal links — exactly as the spec allows.
- public/site.webmanifest (name, theme color #FF3333, icons, standalone).
- index.html: og:url, og:image, twitter:card, canonical, manifest link,
  theme-color.
- New src/components/Seo.tsx: route-based document.title + meta description +
  OG tags + canonical updater (no react-helmet needed). Arabic/English titles
  & descriptions for 22 routes (Home, Courses, Pinyin, Numbers, Stories, etc.,
  using the exact copy from the brief). Sets <html lang>. Dynamic story/article
  pages set their own document.title and are skipped to avoid overwrites.

## Performance
- React.lazy + Suspense for 13 heavy/secondary pages (Blog, Admin, Worksheet,
  Certificates, Mistakes, Teacher, Present, Hsk1Simulation, Report, Stories,
  StoryReader, Article/WorksheetsIndex, TeacherTools, FlashcardsPrint,
  Dictation). Main bundle 1,133 KB → 986 KB (~147 KB moved into on-demand
  chunks; gzip 330 → 293 KB). No package upgrades.

## Stories polish
- StoryReader sets an SEO document.title; story cards show reading time.

## Translation cleanup (Arabic mode)
- Raw-key audit: every t('...') across all pages/components now resolves in
  both locales (was: Vocabulary used 3 undefined keys → fixed).
- Hardcoded English replaced with i18n keys: Lesson empty-states (no vocab /
  no sentences / no quiz) and Dashboard "no quiz results". Added EN+AR keys.

## Pinyin visibility audit
- Lesson vocab-table pinyin and sentence pinyin were plain gray text →
  switched to PinyinText (red, dir=ltr, bidi-isolated, ≥text-sm) so tone marks
  never clip and RTL never reorders them. All other learner pages already use
  PinyinText (verified across 16 pages).

## Content quality audit (safe fixes only)
- 0 duplicate article slugs (10), 0 duplicate story ids (10), 0 broken story
  quiz answer keys, 0 empty pinyin except the 1 intentional "silence" mistake
  case. No data fixes needed.

## Docs
- New ROADMAP.md documents the future AI Content Studio (backend/Edge Function,
  no frontend keys, draft→review→approve, Paddoo image pipeline, mandatory
  human review) — documentation only, no AI code in V2.3.

---

# NiHao V2.2.1 — Teacher, Review & Classroom Pack

BASE NOTE: built on top of the completed LOCAL V2.2 source (NOT GitHub main,
which was still at V2.1/bf802e9 at build time). This package therefore contains
V2.2 + V2.2.1 together. Deploy this, then push to GitHub as the new main.
Preserved: Vite 5.4.21, plugin-react 4.7.0, router 6.30.1, supabase-js 2.46.0,
Node >=18.20.8, any-client + BUCKETS, noImplicitAny:false, all V2.1 + V2.2
routes/features, no SQL, no paid/AI APIs.

## New routes (7)
/mistakes · /teacher · /present/:lessonId · /flashcards-print · /dictation ·
/hsk1-simulation · /report

## 1) Automatic Mistake Notebook (/mistakes)
src/lib/mistakes.ts (localStorage nihao_mistakes, max 300, dedup by question
hash; repeats reset "mastered"). INTEGRATION COVERAGE — wrong answers are
recorded automatically from: lesson quizzes (Quiz.tsx), story quizzes,
placement test, grammar exercises (GrammarExerciseCard), and the HSK1
simulation. Each entry: source, question, your/correct answers, Chinese,
PinyinText pinyin, AR/EN explanation when available, related link, date,
review count, mastered state. Page: source filters, review-to-reveal (+2 XP
daily-scoped per mistake), mark mastered / un-master, clear mastered. Linked
from Dashboard card and Practice hub.

## 2) Teacher Lesson Pack (/teacher)
Lesson selector → one printable pack: vocabulary table (zh/pinyin/AR/EN),
example sentences, grammar points (DB-or-fallback via grammarService),
exercises (fill-blank, match zh↔pinyin, writing boxes), mini quiz, dictation
list, and 9 cut-out flashcards — with the same Show/Print Answer Key mode as
worksheets and page breaks for clean printing. Quick links to Presentation
Mode, flashcards print and dictation.

## 3) Presentation Mode (/present/:lessonId)
Fullscreen classroom slides: intro → 10 vocab cards → 5 sentence cards →
3 grammar cards → quick-quiz slide. Huge Chinese, PinyinText, Arabic +
English, audio button per slide, prev/next buttons + keyboard arrows/space,
progress bar. Opens from the lesson action bar and /teacher. Designed to feel
like a video lesson (large text, audio, clean transitions) so it can later be
screen-recorded into short lesson videos.

## 4) Printable Flashcards (/flashcards-print)
Lesson + count (6–18) + two modes: cut-out cards (dashed cut lines, all info
one side) and front/back (page 1 fronts, page 2 mirrored backs for
double-sided printing). Linked from /teacher with the lesson preselected.

## 5) Dictation Mode (/dictation) — 听写
Lesson selector, words/sentences modes, big play button + turtle slow-speed
button (SpeechSynthesis rate 0.55), write-on-paper instruction, reveal/hide
answer (Chinese + PinyinText + AR/EN), next. No speech API.

## 6) HSK1 Practice Simulation (/hsk1-simulation)
Clearly labeled "محاكاة تدريبية لاختبار HSK1 — NOT official". 40 original
questions (20 listening via TTS + 20 reading), verified programmatically
(0 broken answer keys). 25-minute countdown, free navigation + change answers,
submit, pass mark 60%, full answer review, results saved to
nihao_hsk1_results (last 20), wrong answers flow into the Mistake Notebook,
+30 XP once per day.

## 7) Student Progress Report (/report)
Printable report: completed lessons, XP, streak, avg score, per-stage progress
bars, badges, earned certificates, placement result, last HSK simulation,
mistake summary (total/mastered/open), top-5 weak lessons (<70% quizzes), and
rule-based recommended next steps. Student-name field + print CSS.

## 8) Video / classroom media layer (free only)
A) Lesson video placeholder card in every lesson ("فيديو الدرس قريباً" — never
   breaks the lesson).
B) Story Listening Mode: "Play full story" reads sentences sequentially
   (browser TTS, rate 0.85), highlights the current sentence, pause/resume.
C) Shadowing: record yourself in the story reader (MediaRecorder), replay your
   own voice next to the TTS for self-comparison. No scoring, no API, nothing
   uploaded — recording lives only in the page session.
D) Presentation Mode doubles as the slide/video-feel classroom layer (see #3).
E) PADDOO INTEGRATION (FUTURE PLAN — documented only, no code):
   NiHao admin creates a row in a `content_requests` table (Supabase) →
   a Paddoo n8n workflow picks it up (webhook/polling) → builds the prompt →
   Nano Banana / GPT Image generates the lesson/story/blog visual →
   uploads to Supabase Storage or Cloudinary → updates the request row →
   NiHao admin reviews and attaches it. Apply the Recipe-Brief-Lock pattern to
   keep lesson vocabulary consistent across generated assets. Target: V2.3.

## Navigation
Practice dropdown + hub now include Mistake Notebook, HSK1 Simulation, Teacher
Pack, Dictation, Progress Report (+ Print Flashcards card in the hub — 23 tool
cards total). Footer adds Teacher. ~95 new EN+AR i18n keys, verified 0 missing.

---

# NiHao V2.2 — Stories, Certificates, Worksheets & SEO Foundation

Base: GitHub main bf802e9 (V2.1 RunCloud-tested). Preserved: Vite 5.4.21,
plugin-react 4.7.0, router 6.30.1, supabase-js 2.46.0, Node >=18.20.8,
any-client + BUCKETS, noImplicitAny:false, all routes, no SQL, no APIs.

## New routes
/stories · /stories/:storyId · /certificates · /worksheets · /blog/:slug

## 1) Beginner Short Stories (/stories)
10 original HSK1-level stories — 100 sentences, 51 quiz questions, all data
verified programmatically (0 empty fields, 0 broken answer keys):
我是学生 (أنا طالب) · 我的家 (عائلتي) · 我的一天 (يومي في المدرسة) · 在饭馆
(في المطعم) · 我想喝茶 (أريد شرب الشاي) · 在商店 (في السوق) · 我坐出租车
(أذهب بالتاكسي) · 今天是星期六 (اليوم هو السبت) · 我的中国朋友 (عندي صديق
صيني) · 我每天学汉语 (أتعلم الصينية كل يوم).
Reader: every sentence = Chinese + PinyinText + Arabic + English + TTS audio;
pinyin show/hide toggle; "words used" gallery with audio; related-lesson links;
5-question quiz with local score and +15 XP (anti-duplicate via gamification).

## 2) Certificates per level (/certificates)
6 stage cards with locked → ready → earned states. Final tests (local, 10
questions each) for Level 0 (Pinyin & Tones — always available) and Level 1
(HSK1 Basics — unlocks at 50% of stage lessons completed); Levels 2–5 show
"final test coming soon". Pass = 70%; earned certs persist in localStorage with
score + date, award +50 XP, and open a printable certificate preview (white,
gold-bordered, student name input, level AR+EN, score, date, print CSS).
Existing /certificate route untouched.

## 3) Worksheets V2 (/worksheets + upgraded /worksheet/:lessonId)
New index page listing every lesson. Each sheet now has 8 sections: writing
boxes, sentence translation, matching, fill-in-the-blank, match Chinese↔Pinyin,
match Pinyin↔Arabic, sentence ordering, mini quiz — plus a Show/Print Answer
Key mode (answers in red, deterministic, printable separately). Browser print
only, no PDF library.

## 4) SEO foundation (/blog + /blog/:slug)
10 original Arabic articles written manually (no API): learn-chinese-from-zero,
what-is-pinyin, chinese-tones-for-arabs, top-100-chinese-words,
chinese-numbers-1-100, days-months-chinese, memorize-hanzi-easily,
ni-vs-nin-difference, hsk1-preparation, best-daily-method. Each: SEO title,
slug, meta description, 4–5 sections, 3-question FAQ, internal links
(/pinyin /tones /numbers /courses /dictionary /stories /essentials
/placement-test), related articles, document.title set per page. The /blog page
gains an Arabic articles grid above the existing posts.

## 5) Homepage
New Today's Word (deterministic, from built-in vocab — zero network) + Latest
Stories section after Start Here.

## 6) Dictionary
Save-word star (localStorage) with a "كلماتي المحفوظة" gallery.

## 7) Navigation
Practice dropdown + footer + practice-hub cards now include Stories,
Worksheets, Certificates (16 tool cards total). ~110 new EN+AR i18n keys,
verified complete (0 missing).

---

# NiHao V2.1 — Levels, Missions & Engagement System

Base: GitHub main 26667c8 (V2.0.6 RunCloud-tested). All preserved: Vite 5.4.21,
plugin-react 4.7.0, router 6.30.1, supabase-js 2.46.0, Node >=18.20.8, any-client
+ BUCKETS, noImplicitAny:false, all routes, no SQL required, no paid/AI APIs.

## Lesson quality audit (V2.1 §1) — performed BEFORE feature work
Checked programmatically: 310+ pinyin values across all fallback data files
(hsk1-full, hsk1-lessons, grammarFallback 1+2, hanziMemory, hanziExtra, page data);
75 fallback quiz questions (correctOptionId ∈ options); 32 grammar MCQs (correct ∈
options); 16 word-order banks (permutation-composable); duplicate titles; empty
AR/EN translations. RESULT: 0 empty pinyin, 0 missing tone marks, 0 broken answer
keys, 0 uncomposable sentence builders, 0 empty translations, 0 duplicate titles.
The V2.0.6 PinyinText layer already guarantees visible LTR pinyin under every
learner-facing Chinese string. Live-DB content is covered by the same render
guarantees; DB rows are editable from Admin. No content fixes were needed — the
audit is clean (full numbers in the release notes).

## Pinyin-first journey
- New StartHere component (5 steps: Pinyin → Tones → Essentials → Lesson 1 → Path)
  with "ابدأ بتعلم البينين" CTA — shown on Home (new section), Courses, Practice,
  and Dashboard when the student has no progress.

## /courses upgrade
- Keeps the existing course card, adds: StartHere block, a 6-stage journey strip
  (Level 0 Pinyin & Tones [tools] + 5 lesson stages with progress % and "next
  lesson" buttons and final-test placeholders), and a full grid of ALL 45 lessons:
  number, Chinese title + PinyinText (lessons 1–15 enrichment map), AR/EN titles,
  completed/review states, Start/Continue/Review buttons, search (zh/pinyin/AR/EN,
  tone-insensitive) and filters (الكل/المكتملة/القادمة/المراجعة — review uses
  <70% quiz scores). Supabase failure → built-in HSK1 fallback cards still render.

## Levels structure (src/data/levels.ts)
- 6 visual stages mapped purely by order_num (1–9, 10–18, 19–27, 28–36, 37–45);
  lesson IDs/routes untouched. Shown on /courses and /path (stage headers along
  the path + Level 0 tools block + per-stage final-test placeholder).

## Engagement system (src/lib/gamification.ts — all localStorage, private-mode safe)
- XP ledger with anti-duplicate action ids; rewards per spec (lesson 20, quiz 10
  +15 perfect, flashcard 5, mission 25, tone/number 10, dialogue 15, pinyin 10).
  Wired into: lesson completion, quiz finish, flashcards, tone/number/dialogue
  trainers, writing pad, grammar exercises, pinyin practice. Dashboard XP =
  server-derived XP + local XP.
- Today's Plan on Dashboard: beginner plan (Pinyin→Tones→Numbers→Lesson 1) or
  progress plan (continue lesson, tones, due cards, grammar, dialogue) — Go/Done
  buttons, +10 XP each, daily reset.
- Daily Missions (8, auto-tracked from activity stats, claim +25 XP, midnight
  local reset): 5 words, 10 cards, 1 lesson, tone round, number round, dialogue,
  3 characters, Pinyin study (beginners). Shown on Dashboard and /missions.
- /achievements: 12 badges (First Lesson, Pinyin Beginner, Tone Starter/Master I,
  50/100 Words, 7-Day Streak, Grammar Starter, Hanzi Writer, Dialogue Beginner,
  Numbers Master, HSK1 Explorer) with locked/unlocked states.
- /placement-test: 20 fixed local questions (pinyin, tones, greetings, numbers,
  word order, grammar, 2 listening) → recommendation (Pinyin / tones / Lesson 1 /
  essentials / jump ahead) saved locally; linked from Home.
- /dictionary: searches the full vocabulary (DB-first, HSK1 fallback) by Chinese,
  Pinyin (tone-insensitive), Arabic, English; deterministic Word of the Day with
  audio + example sentence + quick-quiz link.

## Navigation
- Practice dropdown + mobile menu + footer now include المهام، القاموس،
  الإنجازات، اختبار المستوى. /practice hub: StartHere + 13 tool cards.

## i18n
- ~120 new EN+AR keys; verified programmatically: every key used by new pages
  exists in both locales (0 missing).

---

# NiHao V2.0.6 — Navigation + Pinyin Visibility Fix

Base: GitHub main cf3d0a8 (V2.0.5 RunCloud-tested). All preserved versions intact:
Vite 5.4.21, plugin-react 4.7.0, react-router-dom 6.30.1, supabase-js 2.46.0,
Node >=18.20.8, any-client + BUCKETS, noImplicitAny:false, no static folders, no SQL.

## A) Navigation
- Desktop nav now: Home · Courses · Pinyin · Essentials · **Practice ▾** · About · Blog · Contact (AR: الرئيسية · الدورات · البينين · الأساسيات · التدريب · عن المنصة · المدونة · تواصل معنا).
- Practice dropdown: Tone Trainer /tones, Number Trainer /numbers, Dialogues /dialogues, Learning Path /path, Pronunciation /pronunciation, Review /review, Daily /daily — click-to-open, closes on route change, RTL-aware (start-aligned panel).
- Mobile menu mirrors the same structure (primary links → Practice group → extra tools: Practice hub, Vocabulary, Flashcards).
- Footer "Learning" column now links Pinyin, Essentials, Tone Trainer, Number Trainer, Dialogues, Learning Path (plus the previous links).

## B) PinyinText component (RTL-proof pinyin everywhere)
- New `src/components/PinyinText.tsx`: always `dir="ltr"` + `unicode-bidi: isolate` +
  `lang="zh-Latn"`, block display, ≥ text-sm (sm/base/lg), accent red, leading-relaxed
  (no clipped tone marks), whitespace-normal. `inline` and `muted` variants.
- Applied in: grammar examples, grammar common mistakes (wrong+right), grammar exercise
  correct answers, sentence-builder results/reveals, Type-Pinyin answers, Essentials item
  cards (numbers/days/months) + examples + families + confusables, Pinyin page examples,
  Dialogues history + choices, ToneTrainer reveal, NumberTrainer results, Character Memory
  cards (incl. the WritingPad memory area). Tiny text-[11px]/text-xs pinyin is gone.

## C) Pinyin content audit
- Programmatic audit of 310 pinyin values across 12 files: tone-mark presence verified;
  all 9 dialogue placeholder turns filled with their correct replies; 0 empty pinyin
  fields remain (the single intentional empty — the "said nothing" mistake — renders
  nothing by design via PinyinText's null-on-empty).

## D) Dashboard translation cleanup
- Added/normalized keys: dashboard.subtitle (تابع رحلتك في تعلم الصينية), avgScore
  (متوسط النتيجة), streak (سلسلة الأيام الحالية), continueLearning (تابع التعلم),
  pickUp (أكمل من حيث توقفت), resume (متابعة), recentQuiz, lessonProgress,
  areasToPractice, quickLinks. All hardcoded English strings in Dashboard replaced
  with t() calls; loading text localized. No raw keys render anywhere.

## E) Practice hub quick access
- /practice now opens with a 9-card grid linking Pinyin, Essentials, Tone Trainer,
  Number Trainer, Dialogues, Learning Path, Pronunciation, Review, Daily Practice.

---

# NiHao V2.0.5 — Character Studio + Games + Smart Learning

Base: V2.0.4 (built on GitHub main a19f456). All RunCloud fixes preserved.
Includes everything from V2.0.4 (this package was never deployed separately).

## شكل الحروف — Character upgrades
1. **Stroke Order Studio (hanzi-writer 3.7.3, MIT)** — watch any character drawn
   stroke by stroke, then "Try it": draw each stroke yourself with real stroke-order
   validation and hints after 2 misses. Available as a new "Stroke order" mode inside
   Writing Practice (per selected character) and as a studio on /essentials → Character
   memory. Character data loads from the jsDelivr CDN at runtime; offline shows a
   friendly note (never crashes).
2. **Colored component breakdowns** — 好 = 女(pink)+子(blue), 明 = 日+月, 妈/吗/们 —
   rendered inside Character Memory cards with per-part meanings (EN/AR).
3. **Pictograph evolution** — original hand-drawn SVGs (sun→日, moon→月, mountain→山,
   person→人, mouth→口, tree→木, water→水, fire→火) shown as "ancient drawing → modern
   character" in the memory cards.
4. **Confusable characters** — 6 pairs (人/入, 己/已, 土/士, 末/未, 大/太, 日/目) with
   memorable distinguishing tips EN/AR, on /essentials.
5. **Character families** — 木→林→森, 日+月=明, 人→从→众, 口+门=问 with audio per step.
6. **Grid toggle in Writing Practice** — 米字格 / 田字格 / none.

## Games & engagement
7. **Real streak** — Dashboard streak is now computed from existing activity
   timestamps (user_progress + quiz_results). No new tables; placeholder removed.
8. **Spaced repetition (SRS) flashcards** — "I know it" schedules the card for
   1→3→7→14→30 days; "Review again" brings it back tomorrow. Decks open with today's
   due cards. Stored in localStorage (private-mode safe; silently degrades).
9. **/tones — Tone Trainer** — TTS speaks a word (20-word pool, 5 per tone), pick
   tone 1–4; score + in-game streak + best streak.
10. **/numbers — Number Trainer** — endless 0–100 generation with three modes:
    pick the Chinese, type the pinyin (tone-aware checking), listen & choose.
11. **/path — Learning Path map** — Duolingo-style vertical path: green completed
    nodes, pulsing red current node, every lesson clickable; level selector;
    Continue button.
12. **/dialogues — Interactive conversations** — restaurant 🍜, taxi 🚕, clothes
    shop 🛍️: the app speaks A's lines, you play B and pick the natural reply;
    chat history builds visually; perfect-run tracking.
13. **Printable worksheets** — /worksheet/:lessonId renders a white print-ready
    sheet (writing boxes per vocab word, sentence translation lines, matching),
    with a Print button; linked from every lesson's action bar.
14. **Admin → Grammar tab** — list/add/delete grammar points and exercises in the
    optional grammar tables. Graceful states: tables missing → points to
    optional-grammar.sql; writes blocked → points to the NEW
    supabase/optional-grammar-admin-write.sql (admin-role RLS write policies).
    Learner fallback content unaffected either way.

## Data model
- Only dependency added: hanzi-writer (MIT, Node-version agnostic, browser-side).
- No required SQL. One new OPTIONAL file: optional-grammar-admin-write.sql.
- SRS uses localStorage only.

---

# NiHao V2.0.4 — Pinyin + Grammar Exercises + Character Memory

Base: GitHub main (chefdz28/nihao-v2-codex-test, commit a19f456 — the V2.0.3
RunCloud-tested release). All base fixes preserved: Vite 5.4.21,
@vitejs/plugin-react 4.7.0, react-router-dom 6.30.1, @supabase/supabase-js 2.46.0,
Node >=18.20.8, any-typed supabase client + BUCKETS, noImplicitAny:false,
no static route folders, route /courses/:levelId/:lessonId.

## 1. Pinyin everywhere in Grammar
- Every grammar example already carried pinyin; now **common mistakes** show pinyin
  under both the wrong and the right version (19 pairs added), and **all 46
  exercises** display the pinyin of the correct (full) answer after answering
  (fill-blank answers show the completed sentence's pinyin, e.g. 是 → Wǒ shì xuésheng.).
- **Show / Hide Pinyin toggle** at the top of the Grammar tab — default ON for
  beginners; hides example/mistake/answer pinyin when off.

## 2. New /pinyin learning page
- What Pinyin is, initials (with tap-to-hear demo words), finals, the 4 tones +
  neutral tone with tone-mark cards (mā má mǎ mà / ma) and audio, how tone changes
  meaning, pronunciation examples (nǐ hǎo, xièxie, zài jiàn, wǒ shì xuésheng),
  common beginner mistakes (English-letter readings, ignored tones, ü vs u) —
  all Arabic + English. Linked from the main navigation.

## 3. Pinyin exercises (local checking, no API)
- New exercise types: choose_pinyin, tone_choice, **type_pinyin** (typed answers),
  match_zh_pinyin, match_pinyin_meaning.
- New `src/lib/pinyin.ts` checker: case-insensitive, spaces/punctuation ignored,
  exact tone marks = correct, right letters with wrong/missing tones = "almost —
  check your tone marks" teaching feedback. (Numeric tones like ni3hao3 are a
  documented later option.)
- New components: `TypePinyinExercise` (incl. listen-and-type mode via existing TTS)
  and `MatchingExercise` (tap-to-match pairs).
- New-type exercises added inside grammar lessons 1, 2 and 4 (match Chinese↔Pinyin,
  match Pinyin↔meaning, type the Pinyin) — total fallback exercises now 49.

## 4. New /essentials page (textbook modules)
- Numbers 0–100 (building rule + 17 key numbers), Days of the week (星期+number rule,
  Sunday exception), Months (number+月), Dates (year→month→day, 今天是六月十二号),
  Asking age (几岁 / 多大 / 您多大年纪), Asking price (多少钱, 块/元) — each with rule
  explanation EN/AR, tappable audio items, examples, and mini exercises (MCQ,
  word order, matching, type-the-pinyin).

## 5. Character Memory (ذاكرة الحروف)
- New `src/data/hanziMemory.ts`: 12 starter characters (人口日月木好大小山水火门) with
  pinyin, meanings, original beginner-friendly memory stories (written for NiHao —
  no copyrighted text), component/radical notes where useful, stroke hints, example
  word + sentence (all with pinyin + AR + EN). The 好 composition is described
  neutrally as a historical character design.
- New `CharacterMemoryCard` component shown in two places: a gallery tab on
  /essentials, and automatically inside Writing Practice under the canvas when the
  selected character has a memory entry.

## 6. Data model
- 100% frontend data — **no new database tables required** and no SQL needed for
  any V2.0.4 feature. Existing optional grammar tables keep working as before.

## Unchanged
- All V2.0.3 features (grammar tab, sentence builder, fallback lessons 1–15),
  all 7 lesson tabs, Admin, routes, Supabase usage, deployment layout.

---

# NiHao V2.0.3 — Grammar & Sentence Builder (RunCloud base)

Base: GitHub main (chefdz28/nihao-v2-codex-test, commit 40f7ccd — the RunCloud-tested
V2.0.2 source). Only the grammar layer was added; every base fix is preserved:
Vite 5.4.21, @vitejs/plugin-react 4.7.0, react-router-dom 6.30.1,
@supabase/supabase-js 2.46.0, Node >=18.20.8, any-typed supabase client with BUCKETS,
tsconfig noImplicitAny:false, no old static route folders.

## Added (V2.0.3)
- Grammar tab (القواعد) in every lesson — 7th tab after Sentences; existing
  Vocabulary / Sentences / Flashcards / Writing / Listening / Quiz untouched.
- Grammar points: title EN/AR, Chinese pattern, bilingual explanation, when-to-use,
  formal-vs-casual notes, TTS examples (zh + pinyin + AR + EN), common mistakes.
- 7 exercise types incl. tap-to-build Sentence Builder: fill_blank, word_order,
  formal_casual, transform_question, transform_negative, dialogue, context_choice —
  instant feedback + local score (no new progress tables).
- Built-in fallback grammar for lessons 1–15 (19 points / 46 bilingual exercises):
  你/您, 你好/您好, 谢谢→不客气, 什么/谁/哪儿/几/多少, 的, A是B, 不, 吗, 会,
  time order + dates, 想, 在, 请, 有/没有, telling time, 很+adj, 也/都,
  measure words 个/本/杯/件, serial verbs 坐…去.
- DB-first service `src/lib/grammarService.ts`: reads optional grammar_points /
  grammar_exercises; missing/empty tables silently fall back; lessons without
  grammar show a friendly empty state. Nothing crashes without the migration.
- Optional idempotent migration `supabase/optional-grammar.sql` (public-read RLS,
  writes locked until the Admin grammar section ships — planned V2.0.4).
- New files: src/types/grammar.ts, src/data/grammarFallback.ts + grammarFallback2.ts,
  src/lib/grammarService.ts, src/components/{GrammarExplanation,GrammarExerciseCard,
  SentenceBuilderExercise,GrammarSection}.tsx. ~30 EN+AR i18n keys. Mobile-friendly.

---

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
