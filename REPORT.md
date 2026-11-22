# Phase 1 Report — Vriksh Seva Samiti website

**Date:** 23 Nov 2026 · **Status:** Phase 1 complete. Stopped here and waiting for Phase 2 (Supabase + admin panel).

## What was built

- **10 routes**, all statically pre-rendered: Home, About Us, How It Works, Our Work, Gallery, Leaderboard,
  Get Involved / Donate Waste, Contact, Privacy, and a custom 404. Also `sitemap.xml`, `robots.txt`, app icons and a share image for WhatsApp/social previews.
- **Look and feel kept from the approved demo** (`docs/demo-reference.html`): green palette from the logo, rounded cards,
  Baloo 2 + Mukta fonts, live tree counter card, and the same section order (hero → impact → about → workflow → … → CTA → footer).
- **Language:** `<html lang="mr">`. Every English heading, nav label and eyebrow is marked `lang="en"`. All other text is Marathi.
- **Home** has every section from the brief: hero with live tree counter, impact numbers (trees planted, trees surviving, kg waste collected, donors),
  about preview, 5-step workflow, one featured video, latest 3 plantings, leaderboard top 5, current campaign, call to action, footer.
- **Video:** one framed section on Home with a poster, a big play button and a pulse ring. Sound plays only when the visitor taps play; it never autoplays with sound.
  Nothing downloads before the tap (`preload="none"`; checked: 0 MP4 requests before tap on a phone). A silent looping preview runs only on wide screens with a good connection.
  It pauses when scrolled away. A text summary sits under the video. Portrait videos are supported (`orientation: "portrait"`).
- **Gallery:** grid with a category filter, and a full-screen viewer with swipe (left/right; swipe down closes), arrow keys, Esc, a focus trap,
  focus returned to the photo on close, and captions with place and date. Images are lazy-loaded and optimised by `next/image` (WebP/AVIF, responsive sizes).
- **Leaderboard:** shows only name, type and trees. Filters (सर्व / शाळा / महाविद्यालये / व्यक्ती / संस्था), search that matches Marathi names
  and their English spelling, rows that animate to their new place when the filter changes, growing bars, medals for the top 3 plus a podium,
  shared ranks on ties (1, 2, 2, 4). A searched name keeps its real rank.
- **Animations:** scroll reveals, count-ups, hover lift, growing bars, a line-drawing motif, floating leaves. All are CSS/transform based and use one shared observer.
  *Reduce motion* turns them off. Text is always real HTML, and above-the-fold content is never hidden behind JavaScript.
- **No visitor login anywhere. No money amounts anywhere** on the public site (checked automatically on every page).
- **Content in one file:** `src/data/site.ts`, behind `src/lib/content.ts`, so Phase 2 only swaps those functions for Supabase queries.
  Each data block is typed and commented with its future table name.
- **Extra (no backend needed):** a "Request a Pickup" form on Get Involved. It builds a pre-filled WhatsApp message and stores nothing,
  which matches how the Samiti already works on WhatsApp.

## Checks run

| Check | Result |
| --- | --- |
| `npm run build` | ✅ passes, all 15 outputs static (○) |
| `npm run lint` | ✅ 0 problems |
| `npm run typecheck` | ✅ 0 errors |
| Screenshots of every page at 390 px (phone) and 1440 px (desktop) | ✅ no horizontal overflow, no console errors |
| Interaction tests in real Chrome (playwright-core, not added to the project) | ✅ 26 of 27 passed. The 1 "fail" was my test flagging the Privacy heading “No Login, No Accounts”, which is correct content. Covered: video tap plays with sound and pauses off-screen; no MP4 before tap on phone; muted preview on desktop; reduce motion shows final numbers and no preview; no-JS shows all content and real numbers; gallery opens, swipes, arrow keys, Esc, focus return, filter; leaderboard filters, English search, tie ranks, no money; mobile menu opens, navigates, closes, marks the active page |
| Lighthouse (mobile, local) | Accessibility **100**, Best Practices **100**, SEO **100** on all pages tested. Performance **~53**, CLS **0** — see note below |

**About the Performance number:** Lighthouse is run with simulated slow 4G and a slowed-down CPU, and this test machine paints slowly
in headless mode: even a bare one-line HTML page took 400–700 ms to first paint here. The site's own costs are small. About 150 KB of JavaScript.
Every page is static HTML. Nothing above the fold waits for JavaScript (I fixed that during testing: it was the main LCP problem).
The biggest download is the web fonts (~380 KB for Baloo 2 + Mukta in Latin and Devanagari, already trimmed from ~480 KB).
**Please measure again with PageSpeed Insights after the Netlify deploy.** If mobile LCP is still high there, the next step is `display: "optional"` on the fonts.
That makes first-time visitors on slow networks see the phone's own Marathi font instead of waiting for Baloo/Mukta. I left it on `swap` so the approved look shows.

## Placeholders — everything that must be replaced

All of these are marked in the code (`isSample` / `isPlaceholder` / `// PLACEHOLDER` / `// SAMPLE`) and on the site with a yellow **“नमुना”** note.

### Images (21 files, all labelled "PLACEHOLDER" on the image itself)
| File(s) | Used on |
| --- | --- |
| `public/images/placeholders/gallery-01.jpg` … `gallery-12.jpg` | Gallery (12 photos, with sample captions, places and dates) |
| `public/images/placeholders/planting-01.jpg` … `planting-06.jpg` | Our Work + Home "Latest Plantings" |
| `public/images/placeholders/video-poster.jpg` | Featured video poster |
| `public/images/placeholders/about-team.jpg` | About Us story section |
| `public/images/placeholders/collection-drive.jpg` | How It Works "What We Accept" |

The logo (`public/logo.png`), icons and share image (`public/og-image.jpg`) are made from the **real logo**. They are not placeholders.

### Video
| Item | Value now |
| --- | --- |
| `public/media/featured-video-placeholder.mp4` | 20 s test clip that says "PLACEHOLDER VIDEO", with a test tone so you can hear that sound works (235 KB) |
| `featuredVideo.captionMr`, `transcriptMr`, `titleEn`, `durationSec` | Sample text; replace when the real video arrives |

### Numbers (all sample, from the approved demo)
| Item | Sample value |
| --- | --- |
| Trees planted / surviving | 1,250 / 1,080 |
| Kg waste collected | 18,400 |
| Donors | 640 |
| Next milestone on the hero counter | 2,000 trees |
| "Last updated" date | 20 Nov 2026 |
| Current campaign (वर्ष २ रे) | 635 of 1,000 trees, 6 Jun 2026 – 19 Feb 2027. The campaign text is from the demo; the dates and target are my assumptions (Shivrajyabhishek Din to Shivjayanti) |
| 6 plantings | Titles, places, dates, tree counts, surviving counts, species, partners, care notes |
| 22 leaderboard entries | 5 schools, 4 colleges, 4 organisations, 9 individuals. The names are made up to look realistic; they are not real donors. Includes one tie (12 trees) to show shared ranks |

### Contact details (shown with a "नमुना" note until `contact.isPlaceholder = false`)
| Item | Placeholder |
| --- | --- |
| Phone | `+91 00000 00000` |
| WhatsApp | `910000000000` (also used by the pickup-request form) |
| Email | `contact@example.org` |
| Address | "सिंदी (मेघे), वर्धा, महाराष्ट्र — पूर्ण पत्ता लवकरच" |
| Collection hours | "दर रविवारी, सकाळी ८ ते ११" |
| Map link | Google Maps search for "Sindi Meghe Wardha" |
| Website URL | `https://vriksh-seva-samiti.netlify.app` (`site.siteUrl`), used for the sitemap, robots and share previews |

### Content I wrote that the Samiti should confirm
- The **"Please don't give"** list (wet/food waste, wet or oily paper, medical waste) and "plastic: clean and dry".
- The extra details per workflow step on How It Works (e.g. "sold to authorised scrap dealers", "tanker/drip watering").
- FAQ answers on Contact (e.g. "home pickup for more than about 25 kg").
- Privacy policy statements (e.g. "children's photos only with the school's permission").
- About Us story text, and the "Our Team" section (shows "coming soon": no team names or photos yet).

## Changes from the demo (on purpose)
- **Removed login, "My Trees" profile and "Register" step.** The brief says no visitor login. Workflow step 1 is now "Collect".
- **Removed "now across all of Maharashtra" / "Growing Across Maharashtra".** The brief says the work is in Wardha city.
- **Separate "Current Campaign" section** (in the demo it was inside About), as the brief lists it separately.
- Added the video, latest plantings and leaderboard top-5 sections required by the brief.

## Housekeeping
- `demo-reference.html.html` was moved to `docs/demo-reference.html`, and `logo.png` to `public/logo.png`.
- Git: one commit per page (plus scaffold, design system and fixes). The repo uses a local git identity set for this project only.
- `AGENTS.md` comes from `create-next-app` (Next.js writes it back on `next dev`). It is kept on purpose.

## Ready for Phase 2
Done — see the Phase 2 report below.

---

# Phase 2 Report — Supabase database and admin panel

## What was built
- **Database** (`supabase/migrations/0001–0007`): donors, contributions (private `amount_rs`), plantings with photos,
  linked donors and survival checks, gallery, featured video, campaigns, site numbers with per-number override,
  page texts and contact details. Row Level Security is on for every table. A public Storage bucket accepts uploads from admins only.
- **Privacy:** visitors can read only the `public_*` views and `site_stats_public()`. None of them contain amounts.
  The leaderboard view returns name, type and trees only, and only for visible donors with trees.
- **Admin panel** at `/admin` (works on phones): email + password sign-in for listed admins only (no sign-up).
  It has 10 screens:
  - Dashboard: totals, including the ₹ total for admins, and recent entries.
  - Contributions: can create a new donor while adding an entry.
  - Donors.
  - Leaderboard preview with Hide/Show.
  - Plantings: multi-photo upload, map location, linked donors, survival checks.
  - Gallery: multi-upload, reorder, Show on Home.
  - Video: MP4 plus poster.
  - Campaigns: one active at a time.
  - Site numbers.
  - Page texts and contact details.
- **Website connected:** every placeholder source now reads the database. If the database is empty, fails or is not
  configured, each section shows its Phase 1 placeholder, and each page text falls back to the original wording.
  Saving in the admin refreshes the site immediately (`updateTag`). Otherwise the site refreshes within a minute, with no rebuild.

## Checks run
- `tsc --noEmit`, `npm run lint`: clean.
- `npm run build`: passes. Public pages are prerendered (refresh every 1 min). Admin pages prerender only a loading shell; their data is streamed per request.
- `npm test`: **23/23 pass**.
  - 19 database tests: the real SQL files run twice in an in-memory Postgres that copies Supabase's roles and default rights.
    They cover anon access to amounts, hidden data, writes and uploads, a signed-in non-admin, and admin behaviour (triggers, overrides, limits).
  - 4 code checks: public code never reads amounts or imports admin code; built pages contain no amounts.
- **Not run here:** `npm run test:live` and a click-through of the admin with real data. There are no project keys on this machine.
  Run both after setup (README → Phase 2 setup, step 5). The SQL was tested on a Supabase-like Postgres, not on Supabase itself.

## Decisions and changes (please confirm)
- **Home photo strip:** a new Home section, shown only when gallery photos are marked "Show on Home". With none marked, Home looks exactly as in Phase 1.
- **Planting cards** now show multiple photos (swipe), a "नकाशा" map link when a location is set, and a "सहभाग:" partner line.
- **Campaign section:** hidden when there is real data but no active campaign. The sample campaign shows only while the database is empty.
- **Video:** checked in the browser (MP4, ≤ 15 MB, ≤ 25 s) but not re-encoded. A poster is captured from the video automatically.
- **Page texts:** text left unchanged from the original is not stored, so empty means "original wording".
- **Netlify:** needs only the URL, the publishable key and the site URL. The secret key stays on your computer for `admin:create`.

## Known limits
- A photo or video uploaded and then not saved (the admin closes the page) stays in Storage unused. A replaced page-text photo is not deleted either. Both are harmless; clean up in Storage if wanted.
- After the first Netlify deploy, check that an admin save shows up on the live site straight away. If Netlify ignores the cache tag, changes still appear within a minute.
- The leaderboard lists donors with at least one tree; donors with only kg recorded appear once trees are added.

## Commits
Database & tests · public site connected (with fallbacks) · admin sign-in, dashboard, donors, contributions, leaderboard ·
plantings & uploads · gallery & video · campaigns, numbers & page texts · setup guide & code privacy tests.
