# Vriksh Seva Samiti — Website

Website for **वृक्ष सेवा समिती, सिंदी (मेघे), वर्धा**: an NGO that collects waste paper and scrap from schools,
colleges and local people, sells it, and uses the money to plant trees across Wardha city and care for them until they grow.

- **Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4
- **Language:** main headings in English (`lang="en"`), all other text in Marathi (page is `lang="mr"`)
- **Hosting:** Netlify (config in `netlify.toml`)
- **Data:** Supabase (Postgres + Auth + Storage), edited in the admin panel at `/admin` — see **[Phase 2 setup](#phase-2-setup)**

See **[REPORT.md](REPORT.md)** for what was built in each phase and the list of placeholders.

---

## Run it locally

You need **Node.js 20.9 or newer** (tested with Node 26) and npm.

```bash
npm install        # first time only
npm run dev        # development server → http://localhost:3000
```

Production build (the same thing Netlify runs):

```bash
npm run build
npm run start      # serves the production build → http://localhost:3000
```

Checks:

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript, no output = OK
```

## Pages

| Route | Page |
| --- | --- |
| `/` | Home: live tree counter, impact numbers, about preview, workflow, featured video, latest plantings, top-5 leaderboard, current campaign, call to action |
| `/about` | About Us |
| `/how-it-works` | 5-step waste-to-tree workflow + what we accept |
| `/our-work` | Plantings showcase (grouped by year, survival per planting) |
| `/gallery` | Photo grid with category filter and full-screen viewer (swipe on phones, arrow keys, Esc) |
| `/leaderboard` | Ranked by trees planted · filters · search (Marathi or English spelling) · animated re-ranking · medals for top 3 |
| `/get-involved` | Donate waste: what we accept, 3 ways to give, WhatsApp pickup request, volunteer |
| `/contact` | Phone, WhatsApp, email, address, FAQ |
| `/privacy` | Privacy policy |
| any unknown URL | Custom 404 |

There is **no visitor login** anywhere, and the public site **never shows money amounts** — only trees, kg and people.

## Where the content lives

**All content is in one file: [`src/data/site.ts`](src/data/site.ts).**
Edit text, numbers, plantings, gallery photos, leaderboard names, the campaign, the video and contact details there.

- Pages never import that file directly; they call the functions in [`src/lib/content.ts`](src/lib/content.ts).
  In Phase 2 only those functions change (to Supabase queries). Each block in `site.ts` is commented with the table it will become.
- `isSample: true` / `isPlaceholder: true` mark data that is not real yet. The site shows a small yellow **“नमुना”** note next to it.
- When all real data is in, set `site.showSampleNotes = false` to hide the general sample notes.
  (Notes on placeholder contact details stay until `contact.isPlaceholder` is set to `false`.)
- Dates are `YYYY-MM-DD`; numbers are plain numbers. The site formats them as Marathi (`७ जुलै २०२६`, `१,२५०`).

### Replacing placeholder media

| What | Where | Notes |
| --- | --- | --- |
| Photos | `public/images/placeholders/*.jpg` | Put real photos in `public/images/` and update `src`, `width`, `height`, `alt` in `site.ts`. Any size works; Next.js resizes and serves WebP/AVIF automatically. |
| Featured video | `public/media/featured-video-placeholder.mp4` | Replace with the real MP4 (20–25 s, H.264 + AAC, ≤ 15 MB). Update `featuredVideo` in `site.ts` (`src`, `durationSec`, `orientation`, `captionMr`, `transcriptMr`, `isPlaceholder: false`). Use `orientation: "portrait"` for a vertical phone video. |
| Video poster | `public/images/placeholders/video-poster.jpg` | Use a frame from the real video, same shape as the video. |
| Logo | `public/logo.png` | Also used to generate `src/app/icon.png`, `src/app/apple-icon.png` and `public/og-image.jpg`. |

`npm run placeholders` regenerates the placeholder images, share image and icons (`scripts/generate-placeholders.mjs`).

## Project structure

```
src/
  app/
    (site)/             public pages (page.tsx per page) sharing the header/footer
    admin/              admin panel: login/ and (panel)/ (dashboard, donors, contributions, …)
    layout.tsx, not-found.tsx, sitemap.ts, robots.ts, icons
  components/           UI components (Header, Footer, FeaturedVideo, Gallery, Leaderboard, …)
    home/               Home-only sections
    admin/              admin forms, uploader, navigation
  data/site.ts          built-in fallback content (Phase 1 placeholders)
  lib/
    content.ts          public data layer: reads Supabase public_* views, falls back to data/site.ts
    page-text.ts        list of editable page texts with their original (default) wording
    supabase/           Supabase clients (public/anonymous, signed-in server, browser)
    admin/              admin auth check, form validation, uploads (browser compression)
  proxy.ts              guards /admin (session refresh, redirect to login, noindex headers)
supabase/migrations/    SQL files 0001–0007 (run in order)
tests/                  security tests (no Supabase needed)
scripts/                create-admin.mjs, check-live-security.mjs
    format.ts           Marathi digits, Indian number grouping, Marathi dates
    leaderboard.ts      ranking (shared ranks on ties), filters, search
    nav.ts              menu items
public/
  logo.png, og-image.jpg, images/placeholders/, media/
docs/demo-reference.html  the client-approved demo (design reference)
```

## How things work

- **Animations** are CSS-first and light: scroll reveals (one shared `IntersectionObserver`), count-up numbers,
  hover lift, growing bars, floating leaves. With *reduce motion* turned on, everything is shown immediately without movement.
  All text is real HTML in the server response (works without JavaScript; numbers are the real values for search engines and screen readers).
  Content above the fold is never hidden, so it never waits for JavaScript.
- **Video:** `preload="none"` — no video bytes download until the visitor taps play. Sound starts only on tap; it never autoplays with sound.
  On wide screens with a good connection (not on phones, not with Data Saver or reduce motion), a silent looping preview plays behind the play button.
  It pauses when scrolled out of view. A text summary is available below the video.
- **Pickup request** (Get Involved) has no backend: it builds a pre-filled WhatsApp message and opens WhatsApp. Nothing is stored.

## Deploy to Netlify

1. Push this repository to GitHub/GitLab.
2. In Netlify: **Add new site → Import an existing project** → pick the repo.
   Netlify detects Next.js; build command `npm run build` and the Next.js runtime are set up automatically (`netlify.toml` is included).
3. Add the environment variables listed in [Phase 2 setup → step 4](#4-environment-variables) and deploy again.
   `NEXT_PUBLIC_SITE_URL` is the live address; it is used for share previews, the sitemap and `robots.txt`.

## Phase 2 setup

The website works without Supabase: it shows the Phase 1 sample content. Once the steps below are done, it shows real
data from the database. If the database is empty or cannot be reached, each section falls back to the sample content.

### 1. Run the SQL files (in this order)

Supabase dashboard → your project → **SQL Editor** → **New query**. Paste each file, press **Run**, then do the next one:

| # | File | What it creates |
|---|------|-----------------|
| 1 | `supabase/migrations/0001_admins_and_helpers.sql` | `admin_users` list, `is_admin()` check, locked-down default rights |
| 2 | `supabase/migrations/0002_donors_and_contributions.sql` | donors, contributions (with the private amount), automatic donor totals |
| 3 | `supabase/migrations/0003_plantings.sql` | plantings, their photos, linked donors, survival checks |
| 4 | `supabase/migrations/0004_gallery_video_campaigns.sql` | gallery photos, featured video, campaigns |
| 5 | `supabase/migrations/0005_site_stats_and_content.sql` | site numbers (auto + override), page texts and contact details |
| 6 | `supabase/migrations/0006_security_and_public_views.sql` | Row Level Security on every table, the safe `public_*` views |
| 7 | `supabase/migrations/0007_storage.sql` | the public `public-media` bucket (15 MB, JPG/PNG/WebP/MP4); only admins can upload |

All files can be run again safely. If you use the Supabase CLI instead: `supabase link` then `supabase db push`.

### 2. Turn off public sign-up

**Authentication → Sign In / Providers**: switch **off** "Allow new users to sign up". Keep the **Email** provider on.
Nobody can create an account; admins are added only by you (step 3).

### 3. Create the admin account(s)

Put the keys in `.env.local` (step 4) and run on your own computer:

```bash
npm run admin:create -- you@example.com
```

It asks for a password (or makes one and prints it), creates the account and adds it to `admin_users`.
Run it again with another email to add a Samiti member. Running it for an existing account only makes it an admin.

Without the script: **Authentication → Users → Add user** (tick *Auto Confirm User*), then in the SQL Editor:

```sql
insert into public.admin_users (user_id, email)
select id, email from auth.users where email = 'you@example.com';
```

To remove an admin: `delete from public.admin_users where email = 'them@example.com';`
(and delete the user under Authentication → Users). Then sign in at **`/admin`**.

### 4. Environment variables

Find them in **Project Settings → API Keys** (and **Data API** for the URL). Copy `.env.example` to `.env.local`.

| Variable | `.env.local` (your computer) | Netlify | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | ✅ | starts with `sb_publishable_`. Safe in the browser: it has only a visitor's rights |
| `NEXT_PUBLIC_SITE_URL` | ✅ | ✅ | the live address, no trailing slash |
| `SUPABASE_SECRET_KEY` | ✅ only for `admin:create` | ❌ **never** | starts with `sb_secret_`. Bypasses all rules. Never commit it, never prefix it with `NEXT_PUBLIC_` |

Netlify: **Site configuration → Environment variables → Add a variable**, then **Deploys → Trigger deploy**.
The website itself never uses the secret key. Admins sign in with their own account, and the database rules check that they are in `admin_users`.

### 5. Test it

```bash
npm run test:security   # no Supabase needed: runs the real SQL in an in-memory Postgres, plus code checks
npm run test:live       # after steps 1–4: checks your real project with the publishable key
npm test                # everything in tests/
```

`test:security` proves, among other things, that an anonymous visitor cannot read `amount_rs` (not from the table,
any view, any function, the API description or GraphQL), cannot see hidden donors or draft plantings, and cannot upload
or change anything. It also checks that public code never reads amounts and that built pages contain none.

`test:live` does the same denials against your real project. Run it after every change to the SQL.

By hand: open `/admin` in a private window. It must send you to the login page. Then view the source of `/leaderboard`:
it shows only names, types and tree counts.

### How it works

- **Privacy:** amounts are stored only in `contributions.amount_rs`. Visitors (the `anon` role) have no rights on that
  table at all. Public pages read only the `public_*` views and `site_stats_public()`, which return totals without amounts.
  The admin dashboard and contribution screens are the only places amounts appear.
- **Admin access:** three checks. `src/proxy.ts` sends signed-out visitors to the login page. Every admin page and save
  checks `admin_users`. The database's Row Level Security allows writes only when `is_admin()` is true. `/admin` is
  `noindex`, disallowed in `robots.txt`, and sent with `Cache-Control: no-store`.
- **Live updates without rebuilds:** public data is cached with the tag `site` (`"use cache"` + `cacheLife("minutes")`).
  Every admin save calls `updateTag("site")`, so the next visit shows the change. Even without that, cached data
  refreshes at most a minute later.
- **Uploads:** photos are resized in the browser (longest side 2000 px, WebP), then uploaded straight to the
  `public-media` bucket with the admin's own session. The video is checked in the browser (MP4, ≤ 15 MB, ≤ 25 s) and
  is not re-encoded, so compress it before uploading if needed. Removed or replaced photos and videos are deleted from Storage.
- **Leaderboard:** adding, changing or deleting a contribution updates the donor's trees and kg automatically (database trigger).
  Untick "Show on public leaderboard" (or use **Leaderboard → Hide**) to keep a donor's name off the site.
