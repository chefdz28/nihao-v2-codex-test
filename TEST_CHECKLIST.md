# NiHao Supabase MVP - Test Checklist

## Pre-Test Setup
- [ ] Run `supabase/migration.sql` in Supabase SQL Editor
- [ ] Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`
- [ ] Create admin account via SQL: `INSERT INTO user_roles (user_id, role) SELECT id, 'admin' FROM auth.users WHERE email = 'YOUR_EMAIL'`
- [ ] Seed at least one level and lesson via admin panel

## Authentication Tests
- [ ] Register new student account at `/register`
- [ ] Check email confirmation (if enabled) or auto-login
- [ ] Login at `/login` with valid credentials
- [ ] Login with invalid credentials shows error
- [ ] Logout from header clears session
- [ ] Authenticated user redirected from `/login` to `/dashboard`
- [ ] Unauthenticated user redirected from `/dashboard` to `/login`
- [ ] Unauthenticated user redirected from `/admin` to `/dashboard`

## Student Dashboard (`/dashboard`)
- [ ] Shows welcome message with user's name
- [ ] Displays lesson completion count
- [ ] Shows average quiz score
- [ ] Shows streak (static for MVP)
- [ ] Shows "Continue Learning" with next lesson
- [ ] Lists recent quiz results
- [ ] Shows lesson progress bars
- [ ] Shows achievements
- [ ] Shows weak areas to practice

## Courses (`/courses`)
- [ ] Loads levels from Supabase
- [ ] Shows lesson count per level
- [ ] "Start Learning" button links to first lesson
- [ ] Premium levels show lock badge

## Lesson Page (`/courses/:levelId/:lessonId`)
- [ ] Loads lesson data from Supabase
- [ ] Shows title (EN + AR)
- [ ] Shows vocabulary table with audio buttons
- [ ] Shows example sentences with audio
- [ ] Writing practice canvas works
- [ ] Quiz questions load from Supabase
- [ ] Quiz score saves to `quiz_results` table
- [ ] Quiz progress saves to `user_progress` table
- [ ] Passing score (70%+) marks lesson as completed

## Vocabulary (`/vocabulary`)
- [ ] Loads all vocabulary from Supabase
- [ ] Search filters by Chinese, Pinyin, Arabic, English
- [ ] Audio button works on each card

## Pronunciation (`/pronunciation`)
- [ ] Loads vocabulary from Supabase
- [ ] Previous/Next navigation works
- [ ] Listen button speaks Chinese
- [ ] Record button activates (or simulates)
- [ ] Score displays after recording
- [ ] Result saves to `pronunciation_results` table

## Quiz (`/quiz/:levelId`)
- [ ] Loads questions from Supabase
- [ ] Progress bar updates
- [ ] Correct/incorrect feedback shows
- [ ] Final score displays
- [ ] Result saves to `quiz_results`
- [ ] `user_progress` updates after quiz

## Admin Panel (`/admin`)
- [ ] Only accessible by admin users
- [ ] **Overview tab**: Shows stats (lessons, vocab, students, results)
- [ ] **Lessons tab**: Lists lessons by level
- [ ] Can add new lesson
- [ ] Can edit lesson (title, objective, status, etc.)
- [ ] Can delete lesson
- [ ] **Vocabulary tab**: Lists all words
- [ ] Can add new word
- [ ] Can edit word
- [ ] Can delete word
- [ ] Search filters vocabulary
- [ ] **Exercises tab**: Lists quiz questions per lesson
- [ ] Can add new quiz question
- [ ] Can delete quiz question
- [ ] **Upload tab**: Can upload PDF files
- [ ] **Settings tab**: Shows platform info
- [ ] Can export data as JSON

## Profile (`/profile`)
- [ ] Shows user info (name, email, role)
- [ ] Can update full name
- [ ] Shows quiz count, avg score, completed lessons

## Results (`/results`)
- [ ] Shows quiz history with scores
- [ ] Shows pronunciation history
- [ ] Shows stats cards

## Security
- [ ] Student cannot access `/admin`
- [ ] Student can only see published lessons
- [ ] Student can only see own quiz results
- [ ] Student can only see own progress
- [ ] Admin can see all data
- [ ] API requests without auth token are rejected for protected routes

---

## PDF Processing Tests (NEW)

### Pre-requisites
- [ ] Edge Function `process-pdf` is deployed to Supabase
- [ ] `SUPABASE_SERVICE_ROLE_KEY` secret is set in Edge Function settings
- [ ] `SUPABASE_URL` secret is set in Edge Function settings
- [ ] Migration `20240612_pdf_processing.sql` has been run

### Upload PDF
- [ ] Navigate to Admin → Upload PDF tab
- [ ] Drag and drop a PDF file onto the upload zone
- [ ] OR click to browse and select a PDF file
- [ ] Selected file shows filename and size
- [ ] Click "Upload" button uploads the PDF
- [ ] Upload success message appears
- [ ] PDF appears in the "Uploaded PDFs" list with `pending` status

### Process PDF Button
- [ ] "Process PDF" button appears next to PDFs with `pending` status
- [ ] "Process PDF" button appears next to PDFs with `failed` status
- [ ] Button does NOT appear for PDFs with `processing` status
- [ ] Clicking "Process PDF" starts processing (button shows spinner)
- [ ] Status changes from `pending` → `processing` → `completed`
- [ ] Processing completes within 2 minutes for a standard HSK 1 PDF

### Processing Results
- [ ] Click the eye icon to expand PDF details
- [ ] Details show generated counts: lessons, vocabulary, sentences, questions
- [ ] Details show detected HSK level
- [ ] Processing notes list each created lesson with vocab/sentence counts
- [ ] All generated lessons appear in Admin → Lessons tab with `draft` status
- [ ] Generated vocabulary appears in Admin → Vocabulary tab
- [ ] Generated quiz questions appear in Admin → Exercises tab

### Draft Content Review
- [ ] Go to Admin → Lessons tab
- [ ] Verify new lessons have `draft` status badge (orange)
- [ ] Verify lessons have bilingual titles (English + Arabic)
- [ ] Verify lessons have objectives in both languages
- [ ] Go to Admin → Vocabulary tab
- [ ] Verify vocabulary has Chinese, Pinyin, Arabic, English
- [ ] Go to Admin → Exercises tab
- [ ] Verify quiz questions have multiple choice options
- [ ] Verify correct answer is marked

### Publish Draft Content
- [ ] Click Edit on a draft lesson
- [ ] Change status from `draft` to `published`
- [ ] Save changes
- [ ] Verify students can now see the published lesson

### Error Handling
- [ ] If processing fails, status changes to `failed`
- [ ] Error details visible in expanded PDF details
- [ ] "Process PDF" button available to retry failed processing

### Re-processing
- [ ] "Re-process" button appears for completed PDFs
- [ ] Clicking re-process generates additional content
- [ ] Existing lessons are not duplicated (same order_num check)
