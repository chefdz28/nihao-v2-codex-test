# NiHao V2 — Deployment Guide (Apache / shared hosting)

## Status for this release
- **Do not deploy automatically from this cleanup branch.** Build locally or on the server, then upload only after manual verification.
- The current dependency set is pinned for deterministic installs and supports **Node.js >= 18.20.8** and **npm >= 9** for the RunCloud build server. This release uses Vite 5.4.21 and React Router 6.30.1 instead of the Node 20-only Vite 7 / React Router 7 toolchain.
- Vite `base` must remain `'/'`; the production build emits root-relative `/assets/...` links for Apache/RunCloud web roots.

## 0. One-time check — restore the Vite source index.html
If a previous deploy copied the **built** `index.html` over the project root, the root
`index.html` will reference `/assets/index-*.js`. The source file must instead contain:

```html
<script type="module" src="/src/main.tsx"></script>
```

This repository ships the correct source `index.html`. If you ever need to restore it
manually, take it from git **before** building.

## 1. Environment
Create `.env` locally or configure these variables in your hosting control panel (never commit `.env`):

```bash
VITE_SUPABASE_URL=https://jlzvscttscattggufkyk.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-SUPABASE-ANON-PUBLIC-KEY
```

Frontend code must use only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
Do **not** place a Supabase `service_role` key in Vite variables, frontend source, `dist/`, or any committed file.
Server-side Supabase Edge Function secrets, if used, must stay in Supabase function secrets only.

## 2. Build
Use Node 18.20.8+ on the build machine:

```bash
node -v
npm -v
npm install
npm run build
```

`dist/` now contains the production site. Do not commit or upload `node_modules/`, `.env`, `.git`, or source maps/secrets.

This source package intentionally does not rely on the stale Vite 7 lockfile content from earlier reviews. `npm install` on RunCloud/CI should hydrate `package-lock.json` from the pinned Node 18-compatible versions before the test build.

## 3. Upload to RunCloud / Apache (safe order)
Upload the contents of `dist/` into the web root; do not upload the repository root as-is.

```bash
# from the project root on the server, after building
cp -a dist/. /path/to/webroot/
```

Do **not** delete the existing `assets/` folder unless you are replacing it in the same step — old HTML may still reference old hashed files for users with cached pages. `cp -a dist/.` adds the new hashed assets alongside old ones safely; clean very old hashes only after the new deploy is verified.

## 4. .htaccess (SPA direct-URL refresh)
Keep this `.htaccess` in the web root for RunCloud/Apache:

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

This makes direct refresh work on SPA routes like `/courses/<levelId>/<lessonId>`, `/dashboard`, `/admin`, `/daily`, `/review`, and `/flashcards`.

## 5. Post-deploy smoke test
Open these paths after upload:

1. `/`
2. `/courses`
3. `/courses/de600ba8-f7e1-4805-9e7c-58c6437c5ae0/<lesson-id>` and refresh directly
4. `/flashcards`
5. `/daily`
6. `/review`
7. `/practice`
8. `/pronunciation`
9. `/certificate` while logged in
10. `/dashboard` while logged in
11. `/admin` with an admin user

Also verify a logged-out lesson completion does not crash, and a logged-in completion writes a `user_progress` row.

## 6. Rollback
Keep the previous `index.html` and `assets/` until the new deploy is verified. Restoring them reverts the frontend instantly. The database is untouched by this release.


## 7. RunCloud test-app command sequence
Use these commands for the test app only; do not deploy to production from this review:

```bash
cd /home/runcloud/webapps/nihao-v2-test
node -v
npm -v
npm install
npm run build
cp -a dist/. /home/runcloud/webapps/nihao-v2-test/
```

After copying, keep the Apache `.htaccess` fallback in the web root and smoke-test the routes listed above.
