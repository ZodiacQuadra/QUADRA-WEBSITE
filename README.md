# Quadra Website

The Quadra website with the new content applied, ready to run on your computer at http://localhost:8081.

## Start the site

Double-click `start-site.cmd`, or run this from this folder:

```bash
node server/serve_site.js 8081 ../live_updated
```

Then open http://localhost:8081. It needs Node.js 18 or newer and nothing else. Keep port 8081: the pages load their
scripts, fonts and images from `http://localhost:8081/_mirror/...`.

## What is in this folder

| Folder | What it is |
| --- | --- |
| `live_updated/` | The website. Each folder is a page address: `technology/aws/` is http://localhost:8081/technology/aws. |
| `server/` | The small local server that runs the site (`serve_site.js` and its two helpers), and `folders.json`, which tells it which folder holds each page address. |
| `build-notes/` | Records from when the site was built: `routes.json` (which pages carry the new content) and `mirror-info.json` (when the live site was copied). Not used by the site. |
| `start-site.cmd` | Starts the site with one double-click. |

## Inside `live_updated/`

Pages are filed by the site menu, one numbered folder per menu, with each menu's inner pages inside it. Every folder
holds an `index.html` (the page) and folders for the pages under it.

| Folder | Menu | What is inside | Page address |
| --- | --- | --- | --- |
| `01-home/` | Home | `index.html` (homepage), `home-v2/` (homepage working copy, hidden), `404.html` | `/`, `/home-v2` |
| `02-solutions/` | Solutions | The four business priorities, `platforms-ip/` (with Intellient), `assessments/` | `/solutions/…`, `/assessments` |
| `03-technology-practices/` | Technology Practices | `microsoft/` (Azure, Modern Work, Security), `aws/`, `google-cloud/` (with the Security Health Check), `cyber-security/`, `hybrid-cloud/`, `enterprise-ai-engineering/`, `microsites/` | `/technology/…` |
| `04-why-quadra/` | Why Quadra | Our story, how we partner, people, partners, Centre of Excellence, `awards/`, `legacy-wall/` | `/why-quadra/…`, `/awards`, `/legacy-wall` |
| `05-happy-customers/` | Happy Customers | The case study library (`index.html`) and one folder per case study | `/happy/…` |
| `06-insights/` | Insights | `foundersblog/`, `blogs/`, `newsroom/`, `pressrelease/`, `edm/`, `older-posts/` (35 older blog posts with Framer page IDs as their address) | `/foundersblog/…`, `/blogs/…`, `/newsroom/…`, `/AT8_Kd26M` … |
| `07-contact-us/` | Talk to an Architect button | The contact page and its `thankyou/` page | `/contact-us`, `/thankyou` |
| `08-footer-pages/` | Footer | `careers/`, `join-quadra/`, `ai-careerguide/`, `privacy/`, `terms/` | `/careers` … |
| `09-events/` | Event pages | Agentic AI (with Chennai), Secure the Future, Zscaler Lunch & Learn | `/from-builders-to-autonomy-agentic-ai` … |
| `10-other-pages/` | Not in the menu | `2026/`, `social/`, `logos/`, `llms-txt/` | `/2026` … |
| `_q/` | Shared | What the new pages add: styles (`q.css`), scripts (`q.js`, `live_links.js`, `home_v2_scroll.js`), The Compass (`compass.js`, `compass-index.json`) and product logos | `/_q/…` |
| `_mirror/` | Shared | Images, videos, fonts and Framer scripts copied from the live site | `/_mirror/…` |

The page addresses did not change: `server/folders.json` maps each address to its folder (`/happy/x` is read from
`05-happy-customers/x`). If you rename or move a numbered folder, change its entry in `folders.json` to match. Keep
`_q/` and `_mirror/` where they are: the pages load them by address.

## Notes

- The Compass answers from this site's own pages and sends nothing anywhere. Analytics, Framer forms and the live
  Compass service are disconnected; the contact form and newsletter are previews.
- The content files and build scripts that produced `live_updated/` are in the git history (commit `5826a42`).
