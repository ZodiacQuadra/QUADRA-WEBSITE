// Serve a local site folder. Usage: node serve_site.js [port] [folder]
//   node serve_site.js                     → ./site on 8080 (the local build)
//   node serve_site.js 8081 live_mirror    → the offline copy of the live website
// For the offline copy, a file the live site's scripts ask for that was not downloaded yet is fetched once
// from the public file server (read-only), saved into the copy, and served. Disconnected endpoints return 404.
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const { rewrite, FILL_HOSTS } = require("./mirror_rewrite");
const { blockedStub } = require("./serve_site_stubs");

const PORT = Number(process.argv[2] || process.env.PORT || 8080);
// One folder, or several separated by commas: the first folder that has a file wins (an overlay).
const ROOTS = String(process.argv[3] || "site").split(",").map((r) => path.resolve(__dirname, r.trim()));
const ROOT = ROOTS[0];
const MIRROR_ROOT = ROOTS.find((r) => fs.existsSync(path.join(r, "_mirror"))) || ROOT; // where downloaded files live
// Pages are filed in numbered folders that follow the site menu (folders.json maps each address's first part to its
// folder: /happy/x is read from 05-happy-customers/x). The addresses themselves do not change.
const FOLDERS = fs.existsSync(path.join(__dirname, "folders.json")) ? JSON.parse(fs.readFileSync(path.join(__dirname, "folders.json"), "utf8")) : {};
function onDisk(urlPath) {
  if (urlPath === "/") urlPath = "/index.html";
  const m = urlPath.match(/^\/([^/]+)(.*)$/);
  return m && FOLDERS[m[1]] ? "/" + FOLDERS[m[1]] + m[2] : urlPath;
}
if (!fs.existsSync(path.join(ROOT, onDisk("/index.html")))) {
  console.error(`No site found in ${ROOT} — build or download it first (node build_site.js / node mirror_live.js / node build_live_copy.js).`);
  process.exit(1);
}
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".gif": "image/gif", ".avif": "image/avif", ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".otf": "font/otf",
  ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime", ".pdf": "application/pdf", ".wasm": "application/wasm",
};
// Framer icon modules are named like "CaretDown.js@0.0.57"
const typeOf = (file) => (/\.m?js@[\d.]+$/.test(file) ? TYPES[".js"] : TYPES[path.extname(file).toLowerCase()] || "application/octet-stream");

// Byte ranges are honoured: Framer loads its CMS data (.framercms) in parts with Range requests, as a CDN allows.
function send(res, status, file, range) {
  fs.stat(file, (err, st) => {
    if (err) { res.writeHead(500); return res.end("Server error"); }
    const head = { "Content-Type": typeOf(file), "Cache-Control": "no-cache", "Access-Control-Allow-Origin": "*", "Accept-Ranges": "bytes" };
    const m = status === 200 && /^bytes=(\d*)-(\d*)$/.exec(range || "");
    if (m && (m[1] || m[2])) {
      let start = m[1] ? +m[1] : Math.max(0, st.size - +m[2]);
      let end = m[1] && m[2] ? Math.min(+m[2], st.size - 1) : st.size - 1;
      if (start > end || start >= st.size) { res.writeHead(416, { "Content-Range": `bytes */${st.size}` }); return res.end(); }
      res.writeHead(206, { ...head, "Content-Range": `bytes ${start}-${end}/${st.size}`, "Content-Length": end - start + 1 });
      return fs.createReadStream(file, { start, end }).pipe(res);
    }
    res.writeHead(status, { ...head, "Content-Length": st.size });
    fs.createReadStream(file).pipe(res);
  });
}
const PAGE_404 = path.join(ROOT, onDisk("/404.html"));
const notFound = (res) => (fs.existsSync(PAGE_404) ? send(res, 404, PAGE_404) : (res.writeHead(404), res.end("Not found")));

// Download a file into the copy once, however many requests ask for it at the same time (a page asks for the same
// image size from several places). It is written under a temporary name and then renamed, so a request never
// streams a file that is still being written.
const inflight = new Map();
function fetchOnce(file, url, transform) {
  if (!inflight.has(file)) {
    const job = (async () => {
      const r = await fetch(url);
      if (!r.ok) throw new Error("HTTP " + r.status);
      let buf = Buffer.from(await r.arrayBuffer());
      if (transform) buf = transform(buf, r);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const tmp = `${file}.part-${process.pid}-${Date.now()}`;
      fs.writeFileSync(tmp, buf);
      try { fs.renameSync(tmp, file); } catch (e) { fs.rmSync(tmp, { force: true }); if (!fs.existsSync(file)) throw e; }
    })();
    inflight.set(file, job.finally(() => inflight.delete(file)));
  }
  return inflight.get(file);
}

// Framer's CMS data (.framercms) is read in slices: ?range=a-b,c-d asks for those byte ranges, joined, as Framer's
// CDN answers it. Without this the CMS-driven parts of live pages fail ("Unexpected response length").
function sendSlices(res, file, query) {
  const spec = decodeURIComponent((query.split("&").find((q) => q.startsWith("range=")) || "").slice(6));
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(500); return res.end("Server error"); }
    const parts = [];
    for (const r of spec.split(",")) {
      const m = /^(\d+)-(\d+)$/.exec(r.trim());
      if (!m || +m[1] > +m[2] || +m[2] >= buf.length) { res.writeHead(416); return res.end("Bad range"); }
      parts.push(buf.subarray(+m[1], +m[2] + 1));
    }
    const out = Buffer.concat(parts);
    res.writeHead(200, { "Content-Type": "application/octet-stream", "Content-Length": out.length, "Cache-Control": "no-cache", "Access-Control-Allow-Origin": "*" });
    res.end(out);
  });
}

// Offline copy: fetch a missing file once from its public file server and keep it.
async function fillMissing(urlPath, file, res) {
  const [, , host, ...rest] = urlPath.split("/"); // /_mirror/<host>/...
  if (!FILL_HOSTS.has(host)) return notFound(res);
  try {
    await fetchOnce(file, `https://${host}/${encodeURI(rest.join("/"))}`, (buf, r) =>
      /\.(mjs|js|css|json)$/.test(file) || /javascript|css|json/.test(r.headers.get("content-type") || "") ? Buffer.from(rewrite(buf.toString("utf8"), `http://localhost:${PORT}`)) : buf);
    console.log(`filled from ${host}: ${urlPath}`);
    send(res, 200, file);
  } catch (e) {
    console.log(`missing (${e.message}): ${urlPath}`);
    notFound(res);
  }
}

// First folder with a matching file (or folder index) wins.
function resolve(urlPath) {
  urlPath = onDisk(urlPath);
  for (const r of ROOTS) {
    const file = path.join(r, path.normalize(urlPath));
    if (!file.startsWith(r)) return { forbidden: true };
    try {
      const st = fs.statSync(file);
      if (st.isFile()) return { file };
      if (st.isDirectory() && fs.existsSync(path.join(file, "index.html"))) return { file: path.join(file, "index.html") };
    } catch {}
    if (fs.existsSync(file + ".html")) return { file: file + ".html" }; // Framer-style paths without a trailing slash
  }
  return {};
}

// Framer asks for smaller image sizes (?scale-down-to=1024 / ?width=...). Keep each size beside the original:
// fetched once from Framer's public image server, then served locally. Offline, the original is used.
const SIZE_Q = /^(scale-down-to|width|height|lossless)=/;
async function sizedImage(urlPath, query, res) {
  const original = path.join(MIRROR_ROOT, path.normalize(urlPath));
  const ext = path.extname(original);
  const tag = query.split("&").filter((q) => SIZE_Q.test(q)).sort().join("_").replace(/[^\w-]/g, "-");
  const variant = original.slice(0, original.length - ext.length) + "." + tag + ext;
  if (fs.existsSync(variant)) return send(res, 200, variant);
  try {
    await fetchOnce(variant, `https://framerusercontent.com${urlPath.replace("/_mirror/framerusercontent.com", "")}?${query}`);
    send(res, 200, variant);
  } catch {
    if (fs.existsSync(original)) send(res, 200, original);
    else fillMissing(urlPath, original, res);
  }
}

const server = http.createServer((req, res) => {
  let urlPath;
  try { urlPath = decodeURIComponent(req.url.split("?")[0].split("#")[0]); } catch { res.writeHead(400); return res.end("Bad request"); }
  if (urlPath.startsWith("/_blocked/")) {
    // a disconnected script gets a harmless stand-in (no console error); other disconnected endpoints answer 404
    if (/\.m?js$/.test(urlPath)) { res.writeHead(200, { "Content-Type": TYPES[".js"], "Cache-Control": "no-cache" }); return res.end(blockedStub(urlPath)); }
    res.writeHead(404); return res.end("Disconnected in the local copy");
  }
  const query = (req.url.split("#")[0].split("?")[1] || "");
  if (urlPath.startsWith("/_mirror/framerusercontent.com/images/") && query.split("&").some((q) => SIZE_Q.test(q))) return sizedImage(urlPath, query, res);
  const found = resolve(urlPath);
  if (found.forbidden) { res.writeHead(403); return res.end("Forbidden"); }
  if (found.file && /\.framercms$/i.test(found.file) && /(^|&)range=/.test(query)) return sendSlices(res, found.file, query);
  if (found.file) return send(res, 200, found.file, req.headers.range);
  if (urlPath.startsWith("/_mirror/")) return fillMissing(urlPath, path.join(MIRROR_ROOT, path.normalize(urlPath)), res);
  notFound(res);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use — the site may already be running at http://localhost:${PORT}.`);
    console.error(`Stop the other server, or pick another port: node serve_site.js ${PORT + 1}`);
  } else {
    console.error("Server error:", err.message);
  }
  process.exit(1);
});
server.listen(PORT, () => console.log(`Serving ${ROOTS.map((r) => path.relative(__dirname, r) || ".").join(" + ")} at http://localhost:${PORT}  (Ctrl+C to stop)`));
