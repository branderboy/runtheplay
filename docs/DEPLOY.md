# Deploy to Vercel (+ Neon storage)

The app runs on the seed data with **no database required**, so you can go live
first and add storage when you want form submissions to persist.

## 1. Connect the repo (~2 min → live URL)

1. Go to vercel.com → **Add New… → Project** → import `branderboy/runtheplay`.
2. Vercel auto-detects Next.js — no build config needed. Click **Deploy**.
3. Set one env var (Project → Settings → Environment Variables):
   - `NEXT_PUBLIC_SITE_URL` = your Vercel URL (e.g. `https://runtheplay.vercel.app`) — used for canonical URLs, sitemap, and OG tags.

That's a live site on the seed data: directory, planner, charts, plays, profiles.

## 2. Add storage (Neon Postgres) — turns on data capture

1. Vercel → your project → **Storage → Create Database → Neon (Postgres)**.
2. Vercel injects `DATABASE_URL` (and pooled variants) into the project's env
   automatically. (If the var is named differently, add `DATABASE_URL`
   referencing the pooled connection string.)
3. Run the migrations against it once, from your machine:
   ```bash
   # DATABASE_URL = the Neon pooled connection string from Vercel
   DATABASE_URL="postgresql://…neon.tech/…?sslmode=require" npm run db:migrate
   DATABASE_URL="postgresql://…" npm run db:seed     # load the 66 shows into the DB
   ```
4. Redeploy (or just push). Now, with `DATABASE_URL` present in production:
   - **Contact inquiries** save to the `inquiries` table.
   - **Profile claims** save to `claims` (with auto-verify vs. manual-review status).
   - **Newsletter signups** save to `newsletter_subscribers` + `newsletter_edition_subscriptions`.

   Without `DATABASE_URL` (local/preview) the same forms still work and log to
   `.data/*.jsonl` — no crashes either way.

## 3. Cover art (automatic)

`.github/workflows/artwork.yml` runs on every push and commits real Spotify
cover art to `data/seed/artwork.json`. Vercel redeploys on that commit, so the
covers go live without any manual step.

## 4. Optional next wiring

- **Email (Resend):** add `RESEND_API_KEY`; the `// TODO: send via Resend`
  spots in `lib/actions.ts` are where double-opt-in confirmation and inquiry
  routing send.
- **Flip the directory to DB-backed:** the file-backed reader in
  `lib/data/podcasts.ts` can be swapped for Drizzle queries once the DB is
  seeded — the rest of the app is unaffected.

## Env var reference

| Var | Needed for | Where |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | canonical URLs, sitemap, OG | Vercel env |
| `DATABASE_URL` | persisting inquiries/claims/subscribers | Vercel Storage (Neon) |
| `SPOTIFY_CLIENT_ID` / `_SECRET` | optional artwork API fallback | GitHub repo secrets |
| `RESEND_API_KEY` | outbound email (future) | Vercel env |
