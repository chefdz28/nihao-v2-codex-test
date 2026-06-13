# V2.6 additions
- [ ] All 10 new /blog/<slug> routes render the rich SEO article (direct answer, blocks, FAQ, links, disclaimer, updated date)
- [ ] chinese-phrases-for-students shows 8 phrase groups with PinyinText + audio
- [ ] Cost articles show estimated-range tables (no fixed fees) + verify-sources note
- [ ] Article + FAQPage + BreadcrumbList JSON-LD present on each
- [ ] /blog features all 10 in the new guides grid; existing articles still below
- [ ] /study-in-china hub shows the new featured guides grid
- [ ] sitemap.xml includes all 10 new URLs (85 total)
- [ ] llms.txt lists the 10 high-value pages
- [ ] Existing /blog articles still open; all V2.5/V2.4/V2.3 routes still work
- [ ] Build on Node 18; no SQL; no APIs; no package upgrades

# V2.5 additions
- [ ] /answers renders with category filter; all 10 answer cards open
- [ ] Each /answers/<slug> shows highlighted direct answer + checklist + FAQ + links + updated date
- [ ] /best-chinese-learning-site-arabic shows 7 criteria + honest NiHao positioning
- [ ] View source / inspector: JSON-LD present — Organization + WebSite site-wide; FAQPage/Article/BreadcrumbList on answer & best pages; LearningResource on /courses and /pinyin
- [ ] JSON-LD contains NO fake ratings/reviews/prices/authors
- [ ] /llms.txt served after deploy (present in dist/)
- [ ] /robots.txt allows all + lists AI crawlers + Sitemap line
- [ ] /sitemap.xml includes /answers, all 10 answer routes, /best-chinese-learning-site-arabic (75 URLs)
- [ ] Homepage, blog, study-in-china hub, footer all link to /answers and /best-site
- [ ] All V2.4/V2.3/V2.2.x/V2.1 routes still work; build on Node 18; no SQL; no APIs

# V2.4 additions
- [ ] /study-in-china renders: 8 sections, cities grid, phrasebook (audio), learn links, 3 article groups, disclaimer
- [ ] All 20 /study-in-china/<slug> routes open and show intro/sections/steps/docs/mistakes/phrasebook/FAQ/related/disclaimer
- [ ] Bonus articles work: university-guide-by-province, universities-chinese-only, useful-apps-in-china
- [ ] Internal learning links (/pinyin /tones /numbers /essentials /dialogues /dictionary /courses /stories) all navigate
- [ ] Phrasebook audio plays; Pinyin uses PinyinText (red, RTL-safe)
- [ ] Blog hub card + footer link + homepage promo all reach /study-in-china
- [ ] sitemap.xml (after deploy) lists /study-in-china and all 20 article routes
- [ ] No promises of admission/scholarship/visa; disclaimer present on hub + every article
- [ ] All V2.3/V2.2.1/V2.2/V2.1 routes still work; build on Node 18; no SQL; no APIs

# V2.3 additions
- [ ] After build/deploy: /robots.txt and /sitemap.xml are served (present in dist/)
- [ ] Page title + meta description change per route (check Home, /pinyin, /numbers, /stories)
- [ ] Title switches language when toggling AR/EN
- [ ] Story detail + article pages set their own <title>
- [ ] Lesson vocab/sentence Pinyin is red and not clipped in Arabic RTL
- [ ] No raw translation keys anywhere in Arabic mode (Vocabulary, Lesson empty states, Dashboard)
- [ ] Lazy pages still load correctly: Blog, Admin, Stories, Certificates, Worksheets, Teacher, Dictation, Report, HSK Simulation
- [ ] All V2.2.1 + V2.2 + V2.1 routes still work; lesson 1 and lesson 16 open
- [ ] Build passes on Node 18; no package upgrades; no SQL; no API keys

# V2.2.1 additions
- [ ] /mistakes: empty state OK; answer a story/quiz question wrong → appears with filter, reveal (+2 XP), mastered, clear
- [ ] /teacher: pick lesson → pack renders all 7 sections; answer key turns red; print is clean with page breaks
- [ ] /present/<lessonId>: slides advance with buttons AND keyboard arrows; audio plays; quiz slide works; X exits to the lesson
- [ ] /flashcards-print: cut mode + front/back mode both print correctly
- [ ] /dictation: play + slow turtle speeds differ; reveal shows zh+pinyin+AR; next cycles
- [ ] /hsk1-simulation: disclaimer shown; timer counts down; back/next navigation; submit → score, review list, +30 XP; wrong answers appear in /mistakes
- [ ] /report: stats, stage bars, badges, certs, placement, HSK, mistakes, weak lessons, next steps; prints cleanly
- [ ] Story page: Play full story highlights sentences; pause works; record/replay your voice works (mic permission)
- [ ] Lesson page: Presentation Mode button + video placeholder card visible; lesson unaffected
- [ ] All V2.2 routes still work (/stories /certificates /worksheets /blog/<slug>)
- [ ] Arabic UI complete; build on Node 18; no SQL; no APIs

# V2.2 additions
- [ ] /stories lists 10 stories; reader shows pinyin under every sentence; audio plays; toggle hides pinyin
- [ ] Story quiz scores locally; finishing awards +15 XP once
- [ ] /certificates: Level 0 ready immediately; Level 0 test pass (>=70%) → earned + printable preview
- [ ] Certificate print: name input appears on sheet; clean print output
- [ ] Level 1 locked until half its lessons done; Levels 2–5 show coming soon
- [ ] /worksheets lists lessons; sheet shows 8 sections; answer key toggle turns answers red; both print cleanly
- [ ] /blog shows Arabic articles grid; /blog/<slug> renders sections + FAQ + internal links + related
- [ ] Home shows Today's Word + Latest Stories
- [ ] Dictionary star saves words; saved gallery appears
- [ ] All V2.1 pages still work (missions, achievements, placement, dictionary, path, courses 45 lessons)
- [ ] Arabic UI: no raw keys; build passes Node 18; no SQL

# V2.1 additions
- [ ] /courses: StartHere block, 6 stage cards with %, all 45 lessons grid, search + 4 filters work
- [ ] Lesson 1 and Lesson 16 open from the grid
- [ ] Home shows Start Here + placement test link
- [ ] Dashboard: Today's Plan + Daily Missions; StartHere when no progress; XP includes local XP
- [ ] /missions: progress bars fill from real activity; Claim adds XP; resets next day
- [ ] /achievements: badges unlock from activity (e.g. finish a tone round → Tone Starter)
- [ ] /placement-test: 20 questions, audio questions play, recommendation shown and saved
- [ ] /dictionary: search by zh/pinyin/AR/EN; Word of the Day with audio + example
- [ ] /path: Level 0 tools block, stage headers, final-test placeholders
- [ ] /practice: StartHere + 13 cards
- [ ] XP awarded once only (repeat same lesson completion → no duplicate XP)
- [ ] Arabic UI: no raw keys anywhere on learner pages
- [ ] Build passes on Node 18; no SQL, no API keys

# V2.0.6 additions
- [ ] Desktop nav shows Pinyin + Essentials + Practice dropdown; dropdown opens/closes, links work
- [ ] Arabic UI: nav labels in Arabic, dropdown aligns correctly in RTL
- [ ] Mobile menu lists primary links, Practice group, and extra tools
- [ ] Footer Learning column includes the 6 new links
- [ ] Pinyin renders clearly (≥ text-sm) under: grammar examples, mistakes, exercise answers, sentence-builder results, essentials cards, dialogues, memory cards
- [ ] Switch to Arabic: pinyin stays LTR, unclipped, correctly ordered
- [ ] Dashboard shows translated subtitle/labels — no raw keys like dashboard.subtitle
- [ ] /practice shows the quick-access card grid; every card navigates
- [ ] Build passes; no SQL needed; versions unchanged

# V2.0.5 additions
- [ ] Writing tab: "Stroke order" mode animates the character; "Try it" validates drawn strokes
- [ ] Writing tab: grid toggle 米/田/none changes the canvas guides
- [ ] Character memory cards show colored components (好, 明, 妈...) and evolution drawings (日, 山...)
- [ ] /essentials → Character memory: stroke studio, families (木→林→森), confusables (人/入)
- [ ] Dashboard streak shows a real number after activity on consecutive days
- [ ] Flashcards: "Due today" counter; known cards disappear from tomorrow's deck (localStorage)
- [ ] /tones: audio plays, tone picking scores, streak counts
- [ ] /numbers: all three modes work; typed pinyin tone-checking works
- [ ] /path: completed lessons green, current pulses, links open lessons
- [ ] /dialogues: all 3 scenarios complete; wrong replies flash, correct advance with audio
- [ ] /worksheet/:lessonId: white sheet renders; Print produces a clean page
- [ ] Lesson action bar has the Print worksheet button
- [ ] Admin → Grammar: lists rows; without write SQL shows the RLS notice on save
- [ ] Offline note appears in stroke studio when CDN unreachable (no crash)

# V2.0.4 additions
- [ ] Grammar tab: pinyin under examples, mistakes (wrong + right), and correct answers after answering
- [ ] Show/Hide Pinyin toggle works; default is Show
- [ ] /pinyin loads: tone cards play audio, initials tap-to-hear, exercises check answers
- [ ] Type-pinyin: "ni hao" → almost (tones); "nǐ hǎo" → correct; case/spacing ignored
- [ ] Listen-and-type plays TTS and checks typed pinyin
- [ ] Matching exercises lock correct pairs green, count mistakes
- [ ] /essentials loads: numbers/days/months/dates/age/price modules + character memory gallery
- [ ] Writing practice shows "Remember the Character" card for known characters (e.g. 人, 好, 大)
- [ ] Nav shows Pinyin + Essentials links (AR labels in Arabic)
- [ ] Existing: lesson tabs, sentence builder, quiz, pronunciation, writing all still work
- [ ] No static route folders; npm run build passes on Node 18 setup

# V2.0.3 Grammar additions
- [ ] Lesson page shows 7 tabs; Grammar (القواعد) after Sentences
- [ ] Lessons 1–15: grammar points render (pattern, EN/AR explanations, examples with audio, mistakes)
- [ ] All 7 exercise types give instant feedback; Sentence Builder chips build/check/reset/reveal
- [ ] Lessons 16+: friendly empty state, no crash (no grammar tables installed)
- [ ] With optional-grammar.sql + rows: DB content replaces fallback
- [ ] AR/EN switch translates the grammar tab
- [ ] Existing tabs still work: Vocabulary, Sentences, Flashcards, Writing, Listening, Quiz

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
