# NiHao V2 — Deployment Guide (Apache / shared hosting)

## 0. One-time check — restore the Vite source index.html
If a previous deploy copied the **built** `index.html` over the project root, the root
`index.html` will reference `/assets/index-*.js`. The source file must instead contain:

```html
<script type="module" src="/src/main.tsx"></script>
```

This ZIP already ships the correct source `index.html`. If you ever need to restore it
manually, take it from this ZIP (or from git) **before** building.

## 1. Environment
Create `.env` locally (never commit it):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

Only the anon key is used. No service_role key anywhere.

## 2. Build

```bash
npm install
npm run build
```

`dist/` now contains the production site. Vite `base` stays `'/'`.

## 3. Upload to the server (safe order)

```bash
# from the project root on the server (or after uploading dist/)
cp -a dist/. .          # copy built files over the web root
cp index.html 404.html  # SPA fallback for hosts that serve 404.html
```

Do **not** delete the existing `assets/` folder unless you are replacing it in the same
step — old HTML may still reference old hashed files for users with cached pages.
`cp -a dist/. .` adds the new hashed assets alongside the old ones safely; clean very old
hashes only occasionally.

## 4. .htaccess (SPA direct-URL refresh)
Keep this `.htaccess` in the web root (already included):

```apache
DirectoryIndex index.html

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  RewriteRule . /index.html [L]
</IfModule>

ErrorDocument 404 /index.html
```

This makes direct refresh work on routes like `/courses/<levelId>/<lessonId>`,
`/dashboard`, `/admin`, `/daily`, `/review`, `/flashcards`.

## 5. Post-deploy smoke test
Open: `/` → `/courses` → any lesson → refresh the lesson URL directly → `/daily` →
`/flashcards` → `/dashboard` (logged in) → `/admin` (admin user). See TESTING.md.

## 6. Rollback
Keep the previous `index.html` + `assets/` until the new deploy is verified; restoring
them reverts the frontend instantly. The database is untouched by this release.
