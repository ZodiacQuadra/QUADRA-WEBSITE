// Assemble the site as plain static files in ./dist for static hosting (Vercel runs this as its build command; see
// vercel.json). Usage, from the project folder: node server/build_deploy.js
//
// Locally, serve_site.js reads pages from the menu folders in live_updated/ (server/folders.json maps each address to
// its folder) and every page and script points at http://localhost:8081. Here each file is written to its public
// address instead (05-happy-customers/x/ becomes happy/x/, 01-home/index.html becomes index.html …) and those
// addresses become root-relative, so the site works on any domain. Images, videos and Framer's fonts (about 1.1 GB)
// are not copied: their addresses point straight at the public CDNs they were copied from (framerusercontent.com,
// fonts.gstatic.com), so the deployment holds only pages and scripts. live_updated/ is only read.
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE = path.join(ROOT, "live_updated");
const OUT = path.join(ROOT, "dist");
const FOLDERS = JSON.parse(fs.readFileSync(path.join(__dirname, "folders.json"), "utf8"));
// (Framer's icon modules are named like "CaretDown.js@0.0.57": scripts too, with addresses to rewrite)
const TEXT = /\.(html|js|mjs|css|json|svg|xml|txt)$|\.m?js@[\d.]+$/i;
const SCRIPT = /\.m?js$|\.m?js@[\d.]+$/i;

if (!fs.existsSync(path.join(SITE, FOLDERS["index.html"]))) {
  console.error("live_updated/ is missing its homepage (" + FOLDERS["index.html"] + ").");
  process.exit(1);
}

// folder → public address: the longest folder that contains the file decides (02-solutions/assessments/… before 02-solutions/…)
const BY_FOLDER = Object.entries(FOLDERS).map(([address, folder]) => ({ address, folder })).sort((a, b) => b.folder.length - a.folder.length);
function publicPath(rel) {
  for (const { address, folder } of BY_FOLDER) {
    if (rel === folder) return address;
    if (rel.startsWith(folder + "/")) return address + rel.slice(folder.length);
  }
  return rel; // _q/, _mirror/ and anything else keep their place
}

// media served by the public CDNs instead of being copied (the folders are skipped, the addresses rewritten)
const CDN = [
  ["/_mirror/framerusercontent.com/images/", "https://framerusercontent.com/images/"],
  ["/_mirror/framerusercontent.com/assets/", "https://framerusercontent.com/assets/"],
  ["/_mirror/fonts.gstatic.com/", "https://fonts.gstatic.com/"],
];
const SKIP_DIRS = CDN.map(([local]) => local.slice(1, -1)); // "_mirror/framerusercontent.com/images" …
let cdnRefs = 0;
function rewrite(text, isScript) {
  for (const [local, cdn] of CDN) {
    const parts = text.split("http://localhost:8081" + local);
    if (parts.length > 1) { cdnRefs += parts.length - 1; text = parts.join(cdn); }
  }
  // Framer's scripts resolve files against full addresses (new URL("./x.framercms", `http://localhost:8081/...`)):
  // in scripts, a template string that starts with the old origin starts with the page's own origin instead
  if (isScript) text = text.replace(/`http:\/\/localhost:8081/g, "`${globalThis.location.origin}");
  return text.split("http://localhost:8081").join("");
}

let files = 0, rewritten = 0;
const seen = new Map();
function copyTree(rel) {
  for (const entry of fs.readdirSync(path.join(SITE, rel), { withFileTypes: true })) {
    const r = rel ? rel + "/" + entry.name : entry.name;
    if (entry.isDirectory()) { if (!SKIP_DIRS.includes(r)) copyTree(r); continue; }
    if (/\.part-|\.tmp$/.test(entry.name)) continue;
    // Framer's CMS data is read in slices (?range=a-b,c-d), which a static host can't answer: leaving these files out
    // lets vercel.json pass those requests to Framer's public CDN, which serves the slices
    if (/\.framercms$/i.test(entry.name)) continue;
    const pub = publicPath(r);
    if (seen.has(pub)) { console.error(`Two files would publish at /${pub}: ${seen.get(pub)} and ${r}`); process.exit(1); }
    seen.set(pub, r);
    const s = path.join(SITE, ...r.split("/")), d = path.join(OUT, ...pub.split("/"));
    fs.mkdirSync(path.dirname(d), { recursive: true });
    if (TEXT.test(entry.name)) {
      const before = fs.readFileSync(s, "utf8");
      const after = rewrite(before, SCRIPT.test(entry.name));
      fs.writeFileSync(d, after);
      if (after !== before) rewritten++;
    } else {
      fs.copyFileSync(s, d);
    }
    files++;
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
copyTree("");
// Disconnected scripts (/_blocked/…) get the same harmless stand-in serve_site.js answers with, so pages load without
// a console error and still send nothing
const { BLOCKED_SCRIPTS, blockedStub } = require("./serve_site_stubs");
for (const p of BLOCKED_SCRIPTS) {
  const f = path.join(OUT, "_blocked", ...p.split("/"));
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, blockedStub(p));
}
console.log(JSON.stringify({ out: OUT, files, rewrittenTextFiles: rewritten, mediaAddressesToCdn: cdnRefs }, null, 1));
