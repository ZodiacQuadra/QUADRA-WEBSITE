# Quadra Website

The Quadra website (quadrasystems.net) with the new content applied: a self-contained copy of the live site in which
the content-pack pages are rebuilt in the live design with the new copy, the homepage design and top bar are used
site-wide, and the v0.6 content pack is applied in full (apart from the homepage, kept as approved).

- **Run locally:** http://localhost:8081 (see *Start the site*)
- **Staging:** https://quadrawebsite.vercel.app, deployed automatically from the `main` branch
- **Repository:** https://github.com/ZodiacQuadra/QUADRA-WEBSITE

Nothing here connects to or changes the Framer project or the live quadrasystems.net site.

## Start the site

Double-click `start-site.cmd`, or run this from this folder:

```bash
node server/serve_site.js 8081 ../live_updated
```

Then open http://localhost:8081. It needs Node.js 18 or newer and nothing else (no install step). Keep port 8081:
the pages load their scripts, fonts and images from `http://localhost:8081/_mirror/...`.

## What is in this folder

| Path | What it is |
| --- | --- |
| `live_updated/` | The website: every page, plus the shared files the pages load (`_q/`, `_mirror/`). |
| `server/` | `serve_site.js` (the local server) and its two helpers; `folders.json` (which folder holds each page address); `build_deploy.js` (the Vercel build). |
| `vercel.json` | Vercel settings: runs `server/build_deploy.js` and publishes `dist/`. |
| `build-notes/` | Build records: `routes.json` (the 70 rebuilt pages) and `mirror-info.json` (when the live site was copied). Not used by the site. |
| `start-site.cmd` | Starts the site with one double-click. |
| `Site_Routes.md` | Every page under Solutions, Technology Practices and Why Quadra, in menu order, with its address. |
| `V0.6_vs_live_updated_report.md`, `V0.6_Missing_By_Page.md`, `V0.7_vs_live_updated_report.md` | Content checks of the site against the v0.6 and v0.7 review packs (6 Nov 2026, before the v0.6 update was applied; see *Content status*). |

## Inside `live_updated/`

Pages are filed by the site menu, one numbered folder per menu, with each menu's inner pages inside it. Every folder
holds an `index.html` (the page) and folders for the pages under it. 307 pages in all.

| Folder | Menu | What is inside | Page address |
| --- | --- | --- | --- |
| `01-home/` | Home | `index.html` (homepage), `404.html` | `/` |
| `02-solutions/` | Solutions | The four business priorities, `platforms-ip/` (Intellient, BluForge, IntelliLink, MaxIT, Thankz), `assessments/` | `/solutions/…`, `/assessments` |
| `03-technology-practices/` | Technology Practices | `microsoft/` (Azure, Modern Work, Security with BluForge Security Operations), `aws/`, `google-cloud/` (with the Security Health Check), `cyber-security/`, `hybrid-cloud/`, `enterprise-ai-engineering/`, `microsites/` | `/technology/…` |
| `04-why-quadra/` | Why Quadra | Our story, how we partner, people, partners, Centre of Excellence, `awards/`, `legacy-wall/` | `/why-quadra/…`, `/awards`, `/legacy-wall` |
| `05-happy-customers/` | Happy Customers | The case study library (`index.html`) and one folder per case study (93) | `/happy/…` |
| `06-insights/` | Insights | `foundersblog/`, `blogs/`, `newsroom/`, `pressrelease/`, `edm/`, `older-posts/` (35 older blog posts with Framer page IDs as their address) | `/foundersblog/…`, `/blogs/…`, `/newsroom/…`, `/AT8_Kd26M` … |
| `07-contact-us/` | Talk to an Architect button | The contact page and its `thankyou/` page | `/contact-us`, `/thankyou` |
| `08-footer-pages/` | Footer | `careers/`, `join-quadra/`, `ai-careerguide/`, `privacy/`, `terms/` | `/careers` … |
| `09-events/` | Event pages | Agentic AI (with Chennai), Secure the Future, Zscaler Lunch & Learn | `/from-builders-to-autonomy-agentic-ai` … |
| `10-other-pages/` | Not in the menu | `2026/`, `social/`, `logos/`, `llms-txt/` | `/2026` … |
| `_q/` | Shared | The site's own files: styles (`q.css`, `v2_pages.css` homepage design on inner pages, `topbar.css`), scripts (`q.js`, `topbar.js`, `live_links.js`, `home_v2_scroll.js`), The Compass (`compass.js`, `compass-index.json`) and product logos | `/_q/…` |
| `_mirror/` | Shared | Images, videos, fonts and Framer scripts copied from the live site | `/_mirror/…` |

The page addresses did not change: `server/folders.json` maps each address to its folder (`/happy/x` is read from
`05-happy-customers/x`). If you rename or move a numbered folder, change its entry in `folders.json` to match. Keep
`_q/` and `_mirror/` where they are: the pages load them by address.

## Two kinds of pages

- **Rebuilt pages (70):** every page of the content pack (Solutions, Technology Practices, Why Quadra, Assessments,
  Contact, Happy Customers index, homepage). They carry the new copy in the live design, load `_q/q.css` and
  `_q/q.js`, and (all but the homepage and Happy Customers) the homepage design via `_q/v2_pages.css`.
- **Live-site pages (237):** case studies, blogs, newsroom, events, careers, privacy, AWS microsites and similar,
  kept exactly as on the live site. Their only change is the new top bar (`_q/topbar.css`, `_q/topbar.js`, inserted
  between `<!--q-topbar-->` markers); `/llms-txt` has no menu, so it has none.

## Content status (11 November 2026)

- **v0.6 content pack:** applied. Every v0.6 sentence is on the site except the homepage (kept as approved, the
  former /home-v2 design) and the People placeholder note. This includes the new BluForge Security Operations page
  (`/technology/microsoft/security/bluforge-security-operations`), the v0.6 IntelliCloud Integration and Microsoft
  Workplace & Hybrid Managed Services pages, the Microsoft Security and Modern Workplace updates, the two Microsoft
  menu links, and the Hybrid Cloud specialist cards (Microsoft Security, Enterprise Cybersecurity, Enterprise AI
  Governance; change request #17).
- **Site additions beyond the pack (kept):** partner credentials on the practice pages, the Azure lifecycle band,
  Google Cloud proof points, the Assessments page, the Google Cloud Security Health Check, and original live
  sections (customer stories, logo strips, awards list, offices).
- **Open points:** some v0.6 wording reads like internal review notes (e.g. "…remains with the Microsoft practice",
  the Recognition review-gate line); the claims flagged in the v0.7 pack (partner credentials, free-offer wording,
  anonymised figures) still need owner confirmation.

## Changes after the handover (11 November 2026)

Merged in #1 and #2. The homepage now matches the Framer trial homepage.

- **Homepage** (`01-home/index.html`, `_q/home_refresh.css`, `_q/home_refresh.js`):
  - "Where will your ambition take you?" is a priority switcher with four illustrations.
  - "Happy Customers" is four equal story cards.
  - A "What can we do for you?" banner after Top Tier asks The Compass.
  - Anthropic, VMware by Broadcom and Citrix are in Top Tier.
  - The Perspectives carousel loops and moves on by itself.
  - The dark-theme hero glow is softer.
  - The inline Compass section and "Stay in the conversation" are removed.
- **Menu, on every page:**
  - The "… overview" links are folded into the column headings.
  - Sub-pages hang off their parent page on a thin guide line.
  - Microsoft 365 & Workplace lists Microsoft 365 Migration, IntelliCloud Integration and Managed Services | Max-IT.
  - Google Cloud's managed services entry reads "Managed Services | Max-IT".
- **Fixes:**
  - The phone menu's links are styled on the rebuilt pages.
  - The globe no longer errors when its section is hidden.
  - 22 new pages carry their own canonical address and `og:url` instead of their parent page's.

## Deploy (Vercel)

Every push to `main` deploys to https://quadrawebsite.vercel.app. Vercel runs `node server/build_deploy.js`, which
writes each page to its public address in `dist/`, makes the `localhost:8081` addresses root-relative and points
images, videos and fonts at the public CDNs they came from, so a deployment is about 170 MB. To check a build locally:

```bash
node server/build_deploy.js
```

then serve `dist/` with any static server.

## Editing content

The site is static HTML: change text directly in the page's `index.html` under `live_updated/`. The tools that
generated the rebuilt pages from the content pack (`content.json`, `build_live_copy.js`, `site_src/`,
`live_extract/`) are not part of this folder. They are kept only in the original working copy's local git branch
`backup/old-history` (commit `5826a42`), not on GitHub.

## Notes

- The Compass answers from this site's own pages and sends nothing anywhere. Analytics, Framer forms and the live
  Compass service are disconnected; the contact form and newsletter are previews.
- Light and dark themes follow the site's theme switch (stored as `theme` in the browser's local storage).
- Adding `#q-still` to a page address skips the opening animation (used for screenshots).
