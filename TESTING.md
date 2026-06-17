# V3.8.2 exact-meaning filter checks
- [ ] "ايش معنى كلمة قط" → only 猫 card (no 火车/火车站/件/才)
- [ ] "قط" → only 猫
- [ ] "ما معنى 你好" → only 你好
- [ ] "كيف أقول شكرا بالصيني" → only 谢谢
- [ ] "معنى كلمة ماء" → only 水
- [ ] "كلمات HSK1 عن الأكل" → 3–5 food words
- [ ] "كلمات HSK2 عن الوقت" → 3–5 time words
- [ ] "أعطني كلمات اليوم" → daily plan; "اختبرني HSK1" → quiz
- [ ] index 463KB, AiTeacher chunk ~28KB, deps unchanged, build passes
# V3.8.1 intent priority checks (manual)
- [ ] "ايش معنى كلمة قط" → 猫 māo قطة (knowledge search, NOT a daily plan)
- [ ] "ما معنى 你好" → 你好 result
- [ ] "كيف أقول شكرا بالصيني" → 谢谢 result
- [ ] "معنى كلمة ماء" → water word result
- [ ] "قط" (single word) → 猫 result
- [ ] "كلمات HSK1 عن الأكل" → topic search (food words)
- [ ] "أعطني كلمات اليوم" → daily plan (unchanged)
- [ ] "اختبرني HSK1" → quiz (unchanged)
- [ ] index 463KB, AiTeacher chunk ~26KB, deps unchanged, build passes
# V3.8 AI Teacher knowledge search checks
- [ ] /ai-teacher opens (chat)
- [ ] "معنى 你好" → teacher explains + word card linking to /dictionary/...
- [ ] "كيف أقول شكرا بالصيني" → 谢谢 card
- [ ] "كلمات HSK1 عن الأكل" → food word cards; "كلمات HSK2 عن الوقت" → time words
- [ ] "اشرح لي 的" → grammar/word result
- [ ] "اختبرني HSK1" / "أعطني خطة اليوم" → still quiz/plan (existing logic)
- [ ] No match → fallback message + chips
- [ ] Result links navigate; mobile RTL, no overflow, auto-scroll
- [ ] GA4 ai_teacher_knowledge_search + result_click fire (no PII)
- [ ] index 463KB (unchanged), engine in lazy chunk not main; deps unchanged; build passes
# V3.7.1 AI Teacher chat checks
- [ ] /ai-teacher shows a chat (header + teacher bubble + input), not a form
- [ ] Level chips switch level; suggested prompt chips send messages
- [ ] Typing "اختبرني HSK1" → student bubble + teacher quiz card inside chat
- [ ] "أعطني 3 كلمات جديدة" → mini lesson card; "اشرح لي pinyin" → explanation + links
- [ ] Quiz completion shows score; logged-in saves ai-teacher-quiz-<level>
- [ ] Mobile RTL: input sticky, no overflow; auto-scrolls to newest
- [ ] GA4: ai_teacher_chat_message + ai_teacher_prompt_clicked fire (no PII)
- [ ] No API/secrets; index ~463KB; deps unchanged; build passes
- [ ] V3.7 engine + DailyGoalCard + admin + GA head tag intact
# V3.7 AI Teacher checks
- [ ] /ai-teacher loads; hero + level/goal selectors render (RTL, mobile OK)
- [ ] Beginner + Daily words → generate → plan + 3 words + 3-Q quiz appear
- [ ] Quiz gives instant feedback; score shows; recommended links navigate
- [ ] Logged-in: completing quiz saves ai-teacher-mini-quiz (fail-silent if not)
- [ ] /admin/quiz-results shows AI Teacher activity with Arabic labels
- [ ] Pinyin: Beginner/HSK1/HSK2 show, HSK3 hidden by default; toggle works
- [ ] GA4: ai_teacher_open / plan_generated / quiz_completed / recommended_link_click (no PII)
- [ ] sitemap has /ai-teacher, no /admin; GA head tag in index.html
- [ ] /hsk-tests, /daily DailyGoalCard, /admin/data, footer ScrollToTop all still work
- [ ] index ~463KB; deps unchanged; build passes
# V3.6 unified release checks
- [ ] Footer link while scrolled → new page opens at top (ScrollToTop)
- [ ] /hsk-tests Course JSON-LD; sims Quiz+Breadcrumb JSON-LD; HskToolsNav on tools
- [ ] 3 new articles live; sitemap 701, 0 private
- [ ] Logged-in HSK sim result syncs → appears in /admin/quiz-results (محاكاة HSK)
- [ ] DailyGoalCard ring on /daily and /dashboard; goal adjustable
- [ ] All V3.4.2 admin pages + RPCs intact; GA4 head tag intact
- [ ] index ~462KB; deps unchanged; build passes
# V3.4.2 admin data visibility checks
- [ ] Admin can open /admin/data, /admin/students, /admin/progress, /admin/quiz-results, /admin/leads
- [ ] Non-admin + logged-out are redirected (AdminRoute) and RPCs return no rows
- [ ] Students show email/name/provider/role/activity; search/filter/sort work
- [ ] Progress shows rows + summary; filters work
- [ ] Leads show + CSV export works (no external lib)
- [ ] Quiz Results explains HSK local-only honestly (no fake data)
- [ ] No admin routes in sitemap; no service_role key; no secrets in package
- [ ] GA4 admin events carry no PII; /admin excluded
- [ ] Migration creates 5 admin-checked RPCs; build passes; index ~461KB
# V3.4.1 GA4 head tag + sim pinyin checks
- [ ] dist/index.html has static gtag src with the real ID; send_page_view:false
- [ ] Google "Test your website" detects the tag; Realtime still works
- [ ] No duplicate page_view (head false + SPA manual); /admin excluded
- [ ] HSK1 options show pinyin by default (你好 nǐ hǎo); HSK2 too
- [ ] HSK3 options hide pinyin by default; toggle ON reveals it
- [ ] Clear nihao:pinyin-mode → HSK1/2 show, HSK3 hide
- [ ] pinyin_toggle GA4 event on change (no PII)
- [ ] index ~460KB; deps unchanged; V3.4/V3.3/V3.2 preserved; build passes
# V3.4 auth gate + google + pinyin checks
- [ ] Google button on /login and /register; email/password still works
- [ ] (after enabling provider in Supabase) Google sign-in redirects + returns
- [ ] Guest clicking Start on HSK1/2/3 sims → AuthGate (intro stays visible)
- [ ] After login, returns to the test route (not always /dashboard)
- [ ] HSK3 flashcards: 5-card guest preview then gate
- [ ] Pinyin auto: HSK1 show, HSK2 show, HSK3 hide; toggle switches show/hide/auto
- [ ] Pinyin preference persists (localStorage) across reloads
- [ ] GA4: auth_gate_view, google_login_click, test_login_required, pinyin_toggle (no PII)
- [ ] No http://cnihao anywhere; canonical https; sitemap/robots/llms unchanged
- [ ] index ~459KB; deps unchanged; V2.9E/V3.0A/V3.2/V3.3 preserved; build passes
# V3.3 HSK agent expansion checks
- [ ] /flashcards/hsk3 — reveal + 4-button SRS; progress persists; +XP; GA4 review event
- [ ] /hsk2-simulation — 36 Qs, 20-min timer, 60% pass, mistakes→notebook(hsk2)
- [ ] /hsk-tests — 3 level cards; in Header; GA4 page_view + card_click
- [ ] /worksheets/hsk3 — generate + print; matching + quiz; GA4 generate/print
- [ ] /writing-practice — stroke order (hanzi-writer) + printable grid; GA4 events
- [ ] 5 HSK3 articles live at /blog/<slug> with internal links
- [ ] No question overlap across HSK1/HSK2/HSK3 sims
- [ ] index ~457KB; HSK data lazy (not on homepage); deps unchanged
- [ ] V2.9D/E + V3.0A + V3.2 preserved; sitemap 698, 0 private; build passes
# V3.2 HSK3 exercises & test checks
- [ ] /hsk3-simulation runs: 40 questions (20 listening + 20 reading), 25-min timer
- [ ] Score + pass/fail (60%); wrong answers go to Mistake Notebook (hsk3)
- [ ] +40 XP once per day; results saved separately from HSK1
- [ ] HSK1 sim still works and keeps its own results (backward compatible)
- [ ] HSK3 sim in Header nav + Practice hub; has its own SEO title/desc
- [ ] Dictionary HSK3 filter shows a CTA to the HSK3 test
- [ ] No duplicate questions between HSK1 and HSK3 sims
- [ ] sitemap has /hsk3-simulation, 0 admin/draft; build passes; deps unchanged
# V3.1 dictionary expansion checks
- [ ] /dictionary shows HSK1 / HSK2 / HSK3 filter buttons
- [ ] HSK3 filter shows 234 HSK3 words
- [ ] Dictionary total = 586 words, 0 duplicate slugs
- [ ] HSK3 word pages render with "HSK3" badge (e.g. /dictionary/huanjing, /dictionary/wenhua)
- [ ] New words have original Arabic + example sentences
- [ ] sitemap has 586 word pages, 0 admin/draft
- [ ] V3.0A share/lead + GA4 + progress all still work
- [ ] Index JS ~453KB (words in lazy chunk); build passes; no new deps
# V3.0A social share + lead capture checks
- [ ] Run 20260615_email_leads.sql in Supabase (table + RLS)
- [ ] Homepage banner + footer show the email box with consent checkbox
- [ ] Subscribe with consent → row in email_leads; without consent → blocked
- [ ] Duplicate email → friendly "already subscribed"
- [ ] Email is NEVER sent to GA4 (only newsletter_signup source)
- [ ] Share buttons on stories/dialogues/words/daily (native + WhatsApp/FB/X/copy)
- [ ] Copy link works; share fires GA4 share event (method only)
- [ ] No external SDK loaded; index JS ~453KB
- [ ] V2.9B–E features preserved; video 548KB; no root images/videos
- [ ] sitemap/robots/llms unchanged; /admin not tracked; build passes
# V2.9E hero/LCP checks
- [ ] Homepage looks identical (canvas hero, h1, black/red, fonts)
- [ ] h1 headline paints immediately (no 0.5s delay) → better LCP
- [ ] hero-illustration.webp (141KB) + hero-illustration-mobile.webp (62KB) exist
- [ ] unused 2.3MB hero-illustration.png removed; not in dist
- [ ] how-it-works WebP (4) still exist; video 548KB
- [ ] GA4 files present; /admin not tracked; GA non-blocking
- [ ] Progress features + dashboard intact; index JS ~449KB
- [ ] sitemap/robots/llms unchanged; build passes
# V2.9D GA4-on-V2.9C checks
- [ ] Base is V2.9C (6c5dc07): 12 WebP present, video 548KB, index ~449KB
- [ ] Set VITE_GA_MEASUREMENT_ID in production env; dev sends nothing
- [ ] Page views fire once per route change; /admin* excluded
- [ ] Events: start_lesson, complete_*, dictionary_word_view
- [ ] No PII; no GTM; no duplicate GA script in index.html
- [ ] Progress features + dashboard XP fix still work
- [ ] Build passes; no .env/dist/node_modules/.git in zip
# V2.9C checks (mobile performance, progress preserved)
- [ ] Homepage visually identical (dark/red, fonts, glass, layout)
- [ ] Homepage media ~1.2MB (was ~11.6MB); images WebP; video 548KB
- [ ] Main index JS ~448KB (was 731KB); gzip ~129KB
- [ ] Lazy pages (Courses/Lesson/Practice/Dashboard/Dictionary) load fine
- [ ] Mobile blur lighter; desktop unchanged; menu still solid
- [ ] Complete one dialogue → dashboard shows dialogues=1, XP=15 everywhere, Arabic recent label
- [ ] All feature files present; voice local-only (no storage)
- [ ] sitemap/robots/llms unchanged; /daily in; /dashboard out; 0 admin/draft
- [ ] Build passes on Node 18; no new dependencies

# V2.9B.1 checks (dashboard XP consistency)
- [ ] After completing one dialogue, top XP badge AND stats card both show 15 XP
- [ ] No card shows 0 XP when progress exists
- [ ] Completed dialogues count = 1
- [ ] Recent activity shows "حوار: في المطار — الوصول إلى الصين" (not raw slug)
- [ ] Recent activity links to /dialogues/airport-arrival
- [ ] Guest (logged-out) XP still works via localStorage
- [ ] /daily, /dialogues/:slug, /stories, /dashboard all still work
- [ ] No schema change, no voice storage; build passes

# V2.9B additions
- [ ] Run 20260614_student_progress.sql in Supabase (table + RLS + trigger)
- [ ] Logged in: mark a story/dialogue/daily complete → persists across reloads
- [ ] Guest: mark complete works (localStorage) + "سجّل الدخول لحفظ تقدمك" shows
- [ ] /dashboard shows XP, counts, recent activity, continue-learning
- [ ] Empty state: "ابدأ أول درس أو حوار ليظهر تقدمك هنا."
- [ ] /daily has 5 words + 3 sentences + voice practice + mini quiz + mark complete
- [ ] /daily has Arabic <title>/meta; appears in sitemap
- [ ] XP: lesson 10 / story 15 / dialogue 15 / quiz 10 / daily 20
- [ ] No voice upload anywhere; no voice_submissions table
- [ ] sitemap has 0 admin/draft/practice; /dashboard not indexed
- [ ] Lessons, admin drafts, dictionary, dialogues, stories all still work
- [ ] Build passes on Node 18; no new dependencies

# V2.9A additions
- [ ] Homepage loads fast; main JS chunk ~665KB (was 1.1MB)
- [ ] Lazy pages load with "جاري التحميل..." fallback
- [ ] Vendor chunks (react-vendor/motion/supabase) load separately
- [ ] Fonts don't block first paint (print→all swap)
- [ ] Mobile menu is SOLID (not transparent), readable, with shadow/border
- [ ] Mobile menu closes after tapping a link
- [ ] Header stays clear on scroll; desktop nav unchanged; RTL works
- [ ] All routes still work; sitemap has 0 admin/draft/practice
- [ ] Build passes on Node 18; no new dependencies
- [ ] (Server) gzip/brotli + cache headers enabled on RunCloud

# V2.8C additions
- [ ] /stories/:id vocab cards link to /dictionary/:slug when the word exists
- [ ] Dictionary grew to 254 words (8 story words added), 0 duplicates
- [ ] Word pages show "appears in" dialogues + stories + lessons
- [ ] /dictionary/huzhao shows related dialogues; /dictionary/qichuang shows its story + lesson
- [ ] /dialogues/:slug has "تدرّب على النطق" voice practice (record/stop/play/retry)
- [ ] Story page still has "Play all" (speechSynthesis) AND the shared voice practice
- [ ] Voice recording works on iPhone Safari/Chrome (MIME detection); local-only, no upload
- [ ] "سجّل صوتك" / "استمع إلى تسجيلك" / "أعد المحاولة" all present
- [ ] sitemap has 0 admin/draft/dialogues-practice; robots/llms unchanged
- [ ] V2.8B dialogues, admin drafts, story audio all still work
- [ ] Build passes on Node 18; no new dependencies

# V2.8B additions
- [ ] /dialogues hub lists 15 dialogues with HSK filter
- [ ] /dialogues/airport-arrival etc. render conversation with per-line audio
- [ ] Dialogue vocab words link to /dictionary/:slug pages
- [ ] Disclaimers show on registration/bank/hospital dialogues
- [ ] Word page "appears in" links to the dialogues using that word (e.g. /dictionary/huzhao)
- [ ] Dictionary now 247 words (172 + 77 from dialogues), 0 duplicates
- [ ] Old interactive dialogues still work at /dialogues-practice
- [ ] sitemap has 15 dialogue + 247 word pages, 0 admin/draft/practice
- [ ] Lessons, stories, admin, voice recorder all still work
- [ ] Build passes on Node 18; no new dependencies

# V2.8A additions
- [ ] /dictionary/ni, /dictionary/xiexie, /dictionary/zhidao render full word pages
- [ ] Word page shows char, pinyin+audio, Arabic, English, category, HSK badge, examples, related, "appears in"
- [ ] DefinedTerm + BreadcrumbList JSON-LD present on word pages (Rich Results Test)
- [ ] /dictionary has HSK filter (All/HSK1/HSK2) + category filter + search; cards link to word pages
- [ ] Existing /dictionary search, Word-of-the-Day, saved words still work
- [ ] sitemap.xml has 172 /dictionary/<slug> URLs and 0 admin/draft URLs
- [ ] No duplicate words (你 appears once); slugs unique
- [ ] Lessons, stories, admin drafts, mobile voice recorder all still work
- [ ] Build passes on Node 18; no new dependencies

# V2.7A.3 additions
- [ ] Story audio (Play all / sentence speakers) still works
- [ ] Microphone permission prompt appears only AFTER tapping "سجّل صوتك"
- [ ] iPhone Safari: record then tap "استمع إلى تسجيلك" — playback works (audio/mp4)
- [ ] iPhone Chrome + Android Chrome: record + playback works
- [ ] No generic "Error" — only clear Arabic messages
- [ ] If mic denied: "تم رفض إذن الميكروفون…" shown; feature not broken
- [ ] If playback fails: "تم التسجيل، لكن المتصفح لم يستطع تشغيل التسجيل…" shown
- [ ] Helper text about HTTPS + mic permission is visible
- [ ] No broken audio player when MediaRecorder unsupported
- [ ] npm run build passes on Node 18

# V2.7A.2 additions
- [ ] FAQ preview renders {q,a}, {question,answer}, {title,body} shapes; empty fields labelled
- [ ] FAQ JSON pasted as a string still renders; invalid JSON shows a warning
- [ ] Unsupported FAQ item shows "FAQ item has unsupported keys" + raw keys (admin debug)
- [ ] Internal links render {label,path}, {label,url}, {text,href}; clickable
- [ ] pinyin/ -> /pinyin, /tones -> /tones, courses -> /courses; deep & external paths preserved
- [ ] External links open in a new tab; internal use same-tab router links
- [ ] Markdown [text](/path) links are clickable; headings/lists/bold render in RTL
- [ ] Copy JSON emits normalized FAQ [{q,a}] and links [{label,path}]
- [ ] /admin/content-drafts works; drafts NOT in sitemap/llms; public site unchanged
- [ ] npm run build passes on Node 18

# V2.7A.1 additions
- [ ] Draft preview renders ## / ### as headings, not raw text
- [ ] Bullet and numbered lists render as lists; **bold** and [links](url) inline work
- [ ] FAQ preview shows clean Q/A cards
- [ ] Internal links are clickable; bare "pinyin" shows as /pinyin (normalized)
- [ ] Preview export: Copy Markdown / Copy JSON / Copy static-article format all work
- [ ] /admin/content-drafts still works; drafts NOT in sitemap; public site unchanged
- [ ] npm run build passes on Node 18

# V2.7A additions
- [ ] /admin still works for admins; non-admins redirected
- [ ] /admin/content-drafts works for admins (link in Admin sidebar)
- [ ] Create draft (title + slug required); edit; status switch; delete/archive; search; filter
- [ ] SEO checklist updates live; export JSON + export Markdown copy correctly
- [ ] Preview shows admin-only banner and SEO snippet; not indexable
- [ ] If Supabase tables absent: yellow fallback banner + localStorage drafting works
- [ ] After running migration: drafts persist in Supabase; non-admins cannot read (RLS)
- [ ] sitemap.xml has NO draft URLs; llms.txt unchanged; robots.txt still allows crawling
- [ ] /blog, /study-in-china, /answers unchanged; no public draft routes
- [ ] Build succeeds on Node 18; no .env/secrets committed

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
