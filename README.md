# Sarra Saifee — Architecture Portfolio

A cinematic, editorial architecture & visualization portfolio. Built as a
one-shot production foundation: a restrained, image-led presentation layer
with scroll-driven motion, a data-driven project system, and a lightweight
generative placeholder-imagery engine (no heavy assets shipped).

## Project Overview
- **Name**: Sarra Saifee — Architecture · Interior · Visualization
- **Goal**: Original "cinematic architectural editorial portfolio" — the calm,
  typographic restraint of an architectural studio site combined with
  immersive, scroll-driven progressive reveals. Not a card-grid template.
- **Concept**: On load it reads as an architect's portfolio; on scroll you feel
  you are moving through the work; opening a project feels like a designed
  experience.

## Currently Completed Features
- **Cinematic homepage** — image-led hero (identity + disciplines, no hero
  paragraphs), an editorial statement section, and featured work presented as
  asymmetric editorial rows (large index numbers, metadata, clip-reveal media)
  rather than a generic card grid.
- **Scroll experience** — native browser scroll (no hijacking) with:
  - hero forward-drift (scale + brightness) and title fade on scroll,
  - `[data-reveal]` opacity + vertical reveals,
  - `[data-clip]` clip-path (mask) image reveals,
  - line-by-line title reveals (`.line > span`),
  - restrained rAF parallax (`[data-parallax]`).
- **Work index** with elegant, URL-synced filtering across two dimensions —
  discipline (Architecture / Interior) and track (Academic / Professional) —
  plus ALL.
- **Data-driven project detail pages** — hero, specs (year / location /
  category / discipline), statement, editorial gallery with variable spans
  (`full` / `wide` / `half` / `third`), fullscreen lightbox, and wraparound
  prev/next navigation.
- **About page** — editorial architect profile: lead, body, image band,
  capabilities columns, focus chips, software chips, and a timeline.
- **Contact page** — large editorial email + Studio / Direct / Elsewhere
  columns (minimal, not a SaaS form).
- **Navigation** — fixed desktop nav (hide-on-scroll, `mix-blend-mode` for
  legibility over imagery) and a separate full-screen mobile overlay menu
  (designed intentionally, not a shrunk navbar).
- **Generative imagery system** — deterministic inline-SVG architectural
  renders (FNV hash + mulberry32 PRNG + warm/cool palettes, horizon, light
  source, volumes/mullions). Lazy via IntersectionObserver; eager only for the
  critical hero; aspect-ratio containers prevent layout shift.
- **Accessibility** — semantic structure, global `:focus-visible` outline,
  alt/`aria-label` on imagery, readable contrast, and a full
  `prefers-reduced-motion` override (movement replaced with simple opacity).
- **Responsive** — desktop and mobile treated as two intentional experiences.

## Functional Entry URIs
| Path | Description | Params |
| --- | --- | --- |
| `/` | Homepage — hero, statement, featured work | — |
| `/work` | Work index with filtering | `?discipline=architecture\|interior`, `?track=academic\|professional` (URL-synced) |
| `/work/:slug` | Project detail page | `slug` — one of the project slugs below |
| `/about` | Architect profile | — |
| `/contact` | Contact | — |
| `/static/*` | Static assets (`style.css`, `app.js`) | — |

**Project slugs**: `meridian-house`, `atrium-gallery`, `quarry-pavilion`,
`linden-apartment`, `north-reading-room`, `coastal-school`, `terrazzo-cafe`,
`ridge-observatory`.

## Data Architecture
- **Single sources of truth**:
  - `src/data/projects.ts` — 8 dummy projects spanning
    Architecture/Interior × Academic/Professional with varied gallery counts.
  - `src/data/site.ts` — identity, nav, and About content.
- **Project model fields**: `id`, `slug`, `title`, `subtitle?`, `year`,
  `discipline` (`architecture`|`interior`), `track` (`academic`|`professional`),
  `category`, `location`, `description`, `statement?`, `facts?`, `coverImage`,
  `gallery` (each `{ src, alt, span?, ratio?, caption? }`), `featured`, `order`,
  `tone`.
- **Selectors**: `allProjects()`, `featuredProjects()`, `projectBySlug()`,
  `adjacentProjects()`, `filterProjects({ discipline, track })`.
- **Imagery**: no binary assets stored — images are generated client-side from
  a `/img/<seed>/<variant>` convention resolved by `public/static/app.js`.
  To use real photography later, swap the `Ph` component to render `<img>` with
  `srcset` + `loading="lazy"` and keep the same aspect-ratio containers.
- **Storage services**: none required for this presentation-only foundation.
  A future authenticated project-management CMS can layer on Cloudflare D1
  (the data model already mirrors a table schema).

## User Guide
1. Land on the homepage and scroll — the hero drifts, and featured projects
   reveal as you move down the page.
2. Go to **Work** to browse all projects; use the filter buttons
   (All / Architecture / Interior / Academic / Professional). The active filter
   is reflected in the URL and is shareable.
3. Click any project to open its detail page — read the specs and statement,
   scroll the editorial gallery, click any image for the fullscreen lightbox,
   and use prev/next to move between projects.
4. **About** and **Contact** provide the profile and (dummy) contact details.

## Tech Stack
- **Framework**: Hono + `hono/jsx-renderer` (server-rendered JSX)
- **Build**: Vite + `@hono/vite-build/cloudflare-pages`
- **Runtime target**: Cloudflare Pages (`dist/_worker.js`)
- **Motion**: progressive-enhancement vanilla JS (IntersectionObserver + rAF),
  no external animation library
- **Type**: Fraunces (display) + Space Grotesk (sans), fluid `clamp()` scale

## Local Development
```bash
npm run build                 # build to dist/
pm2 start ecosystem.config.cjs # serve via wrangler pages dev on :3000
curl http://localhost:3000     # verify
```

## Deployment
- **Platform**: Cloudflare Pages
- **Status**: ✅ Runs locally (PM2 + wrangler pages dev). Not yet deployed to
  Cloudflare or pushed to GitHub (awaiting user confirmation).
- **Deploy**: `npm run deploy` (BYOK) once a Cloudflare account/token is set.

## Features Not Yet Implemented
- Real photographic imagery (generative SVG placeholders are in place).
- Authenticated project management / CMS (data layer is CMS-ready).
- Contact form submission backend (contact is intentionally info-only).
- Sitemap / structured-data SEO enhancements.

## Recommended Next Steps
1. Replace generative placeholders with real renders via the `Ph` component
   (responsive `<img srcset>` + AVIF/WebP), keeping aspect-ratio containers.
2. Edit `src/data/projects.ts` to add/reorder real projects (change `order`,
   `featured`, gallery `span`s).
3. Deploy to Cloudflare Pages and/or push to GitHub.
4. (Optional) Add a D1-backed admin route for authenticated project editing.

_Last updated: 2026-08-25_

## Cinematic Elevation (2026-08-25)
Systematic art-direction pass on the existing portfolio (not a rebuild):
- **Hero**: art-directed opening, name shown once (nav only), coordinate strip, "Architecture as a study of light." with masked reveals + scroll-driven scale/darken/fade drift.
- **Selected Work**: cinematic `.scene` sequence — alternating sides, oversized ghost project numbers, independent number/title(masked)/metadata reveals, per-scene image scale-on-scroll, clip-path frame transitions.
- **Signature interaction**: pinned horizontal "index" (desktop sticky + translateX pan; mobile scroll-snap fallback; respects prefers-reduced-motion).
- **Graphic language**: `.marker`/`.mono`/`.rule`/`.dimline` utilities, section markers, coordinate strips (used sparingly).
- **About**: editorial composition (statement, band image, discipline prose, capability index, timeline) with generic placeholder content.
- **Contact**: minimal "Let's talk about a project." + editorial link rows.
- **Footer**: restrained editorial (name, disciplines, ©, social, back-to-top).
- **Project detail**: "← Back to Projects" near top + elegant Previous/Next with project numbers.
- **QA verified**: 0 horizontal overflow and 0 console errors across all pages at desktop (1440×900) and mobile (390×844).

## Precision Alignment & Spacing Pass (2026-08-25)
Targeted, in-place refinement of the approved design (CSS-only — no markup, motion, palette, or concept changes):
- **Homepage top metadata strip** (`.hero__strip`): lowered clearance so it no longer collides with the two-line nav brand; on mobile the duplicate tagline span is hidden (it repeats the nav subtitle), keeping the location coordinate + portfolio year.
- **Featured `.scene` ghost numbers (02, 04, all scenes)**: the oversized project number now sits on the *image* side behind the opaque media (desktop) and in a reserved band above the media (mobile). It stays large and part of the composition but never overlaps the title/metadata/button column.
- **Index / "SCROLL →" row** (`.index__head`): proper flex sizing inside the `.wrap` container with `white-space:nowrap` on the hint and vertical `padding-block`, so "SCROLL →" never clips at the viewport edge and the row has breathing room from the section boundary at all widths.
- **Contact**: top-anchored (was vertically centered, which tucked the "CONTACT" marker under the fixed nav) with a consistent two-column link grid (label / value + rules) collapsing to one column on narrow mobile.
- **About**: approach text steps down to `--step-1` inside the 3-column grid to avoid tall/narrow wrapping; capability and timeline columns share a consistent grid; comfortable readable paragraph widths.
- **Re-QA verified**: 0 horizontal overflow and 0 console errors across **desktop (1440×900), laptop (1280×800), tablet (768×1024), and mobile (390×844)**; each fix visually confirmed (no navbar-text overlap, no ghost-number collision on projects 02/04, clean About + Contact alignment, mobile intact, overall design unchanged).
