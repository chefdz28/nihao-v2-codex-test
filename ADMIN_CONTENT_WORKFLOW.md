# NiHao — Admin Content Workflow (V2.7A)

This document explains the admin-only **Content Draft Manager** introduced in
V2.7A, and why drafts are deliberately kept out of the public site for now.

## Why drafts are NOT public yet

V2.7A is a content-management MVP. The goal is to let the owner draft, organize
and review SEO articles **without editing code** — while the live SEO foundation
(static pages, sitemap, robots, llms, JSON-LD) stays exactly as it is.

Drafts are intentionally invisible to the public:

- No public route renders a draft (the manager lives only at
  `/admin/content-drafts`, behind the admin guard).
- Drafts are **not** added to `sitemap.xml`.
- Drafts are **not** listed in `llms.txt`.
- Drafts are **not** shown in `/blog`, `/study-in-china`, `/answers`, or to
  students anywhere.
- Database access is locked by RLS to admin users only (no anon read).

This protects the SEO we've already built: nothing changes for crawlers or
students until a draft is *deliberately* converted into a static article.

## Draft lifecycle

```
draft → review → ready → (manual conversion to static article) → archived
```

- **draft** — work in progress.
- **review** — content written, awaiting a quality/accuracy pass.
- **ready** — passes the SEO checklist; safe to convert to a static page.
- **archived** — kept for reference, hidden from the active list filter.

## How to create a draft

1. Sign in as an admin and open **Admin → Content Drafts · مسودات المحتوى**
   (or go to `/admin/content-drafts`).
2. Click **مسودة جديدة** (New draft).
3. Fill in at least the **title** and **slug** (both required). Add the target
   keyword, meta title/description, markdown body, FAQ JSON, and internal links.
4. Click **حفظ** (Save). The draft is stored in Supabase
   (`admin_content_drafts`) — or in this browser's localStorage if the Supabase
   tables aren't set up yet (a yellow banner tells you when that happens).

## How to mark a draft ready

1. Open the draft and watch the **فحص SEO** (SEO checklist) panel:
   - slug exists, title exists, meta description exists, target keyword exists,
     content length ≥ ~300 words, FAQ present, **≥ 3 internal links**, status.
2. When the content checks pass, set **الحالة** (status) to **جاهز** (ready).
3. The panel shows **"جاهز للتحويل لمقال ثابت"** when a draft is ready to convert.

## How to export JSON / Markdown

In the editor's **تصدير** (Export) panel:

- **نسخ JSON** copies a clean JSON object (slug, title, meta, keyword, FAQ,
  internal links, status, last_updated).
- **نسخ Markdown** copies a front-matter + Markdown document.

Use these exports to convert a *ready* draft into a static SEO article (the same
way V2.6 articles are authored), then add the new route to `sitemap.xml` and
internal links. This keeps the public site static and safe.

## Database (Supabase)

Run the migration: `supabase/migrations/20260613_admin_content_drafts.sql`.
It creates two tables — `admin_content_drafts` and `admin_content_audit_log` —
with **RLS allowing admin users only** (reusing the existing
`user_roles(role='admin')` pattern). If your project uses a different admin
mechanism, adjust the RLS predicates as documented at the bottom of the SQL file.

Until the migration runs (or if RLS denies access), the manager automatically
falls back to **browser localStorage** so you can still draft offline. Cloud
sync resumes once the tables exist and you're signed in as an admin.

## Future: V2.7B — safe publishing (planned, NOT in V2.7A)

V2.7B will add an opt-in, gradual path from "ready" drafts to live pages while
preserving SEO:

1. A **convert** action that turns a ready draft into a served article via a
   Supabase-first read with **static fallback** (per Kimi's hybrid recommendation).
2. Public routes try Supabase first, fall back to the existing static data if a
   row is missing or the network fails — so the static SEO foundation always
   remains the safety net.
3. On publish: the new URL is added to `sitemap.xml` and (optionally) `llms.txt`,
   and internal links are wired from `/blog` and `/study-in-china`.
4. The `admin_content_audit_log` records every create/update/status-change/
   publish for traceability.

No AI APIs, no paid APIs, and no SQL required for the *public* site — the static
pages keep working with zero database dependency.
