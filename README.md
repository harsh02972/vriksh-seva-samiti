# Vriksh Seva Samiti — Website (Phase 1)

Website for **वृक्ष सेवा समिती, सिंदी (मेघे), वर्धा**: an NGO that collects waste paper and scrap from schools,
colleges and local people, sells it, and uses the money to plant trees across Wardha city and care for them until they grow.

- **Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4
- **Language:** main headings in English (`lang="en"`), all other text in Marathi (page is `lang="mr"`)
- **Hosting:** Netlify (config in `netlify.toml`)
- **Phase 2 (not built yet):** Supabase database and an admin panel

See **[REPORT.md](REPORT.md)** for what was built and the full list of placeholders.

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
  app/                  one folder per page (page.tsx), layout, 404, sitemap, robots, icons
  components/           UI components (Header, Footer, FeaturedVideo, Gallery, Leaderboard, …)
    home/               Home-only sections
  data/site.ts          ← ALL CONTENT
  lib/
    content.ts          content access layer (swap to Supabase in Phase 2)
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
3. After the first deploy, put the real domain in `site.siteUrl` (`src/data/site.ts`). It is used for share previews, the sitemap and `robots.txt`.

## Phase 2 (next)

- Supabase tables matching the types in `src/data/site.ts`; replace the functions in `src/lib/content.ts`.
- Admin panel (login for admins only) to add plantings, photos, leaderboard entries, update numbers and upload the video (MP4 ≤ 15 MB).
- Add the Supabase Storage host to `images.remotePatterns` in `next.config.ts`.
