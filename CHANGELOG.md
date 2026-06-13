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
