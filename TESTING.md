# NiHao V2 — Testing Checklist

## Build
- [ ] `npm install` then `npm run build` passes with no TypeScript errors

## Core routes
- [ ] `/` loads
- [ ] `/courses` loads, shows the real lesson count for the level (45)
- [ ] Lesson 1 opens from Courses
- [ ] Lesson 45 opens (navigate or direct URL)
- [ ] Direct refresh on a lesson URL works (SPA fallback)
- [ ] `/admin` opens for an admin user; Overview / Lessons / Vocabulary / Exercises / Upload PDF / Settings all present

## Lesson flow
- [ ] Previous / Next buttons move through lessons by order_num
- [ ] "Complete Lesson" while logged OUT → goes to next lesson, no crash
- [ ] "Complete Lesson" while logged IN → row in `user_progress` with status=completed, completion_percentage=100, fresh last_accessed_at/updated_at
- [ ] "Back to Courses" works
- [ ] Tabs: Vocabulary / Sentences / Flashcards / Writing / Listening / Quiz all render

## Features
- [ ] Audio buttons speak Chinese (TTS) in vocab, sentences, flashcards, daily path
- [ ] Quiz tab: answer all questions, score saves to `quiz_results` when logged in
- [ ] Writing: paper canvas with grid, character above, selector works, ink color toggles, Clear resets, Next cycles, Check gives "Good practice"/"Try writing first"
- [ ] Flashcards: flip reveals pinyin/Arabic/English; "I know it" shrinks queue; "Review again" requeues; deck-complete screen; restart
- [ ] Listening: audio plays, picking right/wrong colors options, final score, practice again
- [ ] Pronunciation: words/sentences toggle; on Chrome/Edge records and scores; on unsupported browser shows fallback note and does not crash
- [ ] Daily Path: 5 words → 3 sentences → quick quiz → done screen; works logged out
- [ ] Review Mistakes (logged in): lists lessons with best score < 70%, links back to lesson; empty/“all good” states render

## Dashboard
- [ ] Completed/Total lessons correct
- [ ] XP = completed×10 + passed quizzes×20
- [ ] Overall progress bar matches completed/total
- [ ] Daily Practice card → /daily
- [ ] Certificate card: shows remaining lessons, or unlocked when all complete
- [ ] Recent quiz results list correct

## Courses (logged in)
- [ ] Level card shows progress %
- [ ] Button reads "Continue" and opens the first incomplete lesson

## Certificate
- [ ] Locked state shows progress + remaining count when lessons incomplete
- [ ] Earned state appears when all lessons completed; print works

## Mobile
- [ ] Header menu, lesson tabs, writing canvas (touch), flashcards, daily path usable at 375px width

## Language
- [ ] AR/EN switch translates new V2 sections (flashcards, daily, review, lesson action bar)
