// Rewrite rules for the offline copy of the live website (used by mirror_live.js and serve_site.js).
// Files from Framer's public file servers point at the local copy; anything that would send data out
// (forms, email, analytics, the AI chat backend) or open Framer's editor is disconnected.
"use strict";

// Hosts whose files are saved inside the copy under /_mirror/<host>/...
const MIRROR_PREFIXES = ["framerusercontent.com/", "fonts.gstatic.com/", "app.framerstatic.com/", "framer.com/m/"];
// Endpoints that send data or contact Framer's editor: requests go to /_blocked/ and fail quietly.
const BLOCK_PREFIXES = [
  "api.framer.com",
  "events.framer.com",
  "us.i.posthog.com",
  "us-assets.i.posthog.com",
  "www.googletagmanager.com",
  "www.google-analytics.com",
  "api.emailjs.com",
  "cdn.jsdelivr.net/npm/@emailjs",
  "compasswebchatai.azurewebsites.net",
];
// Framer's editor bar is replaced by an empty component.
const EDITOR_BAR = "https://framer.com/edit/init.mjs";
const EDITOR_STUB = "data:text/javascript,export const createEditorBar=()=>()=>null;";

const replaceAll = (text, from, to) => text.split(from).join(to);

function rewrite(text, origin, { links = true } = {}) {
  const esc = (s) => s.replace(/\//g, "\\/");
  text = replaceAll(text, EDITOR_BAR, EDITOR_STUB);
  for (const p of MIRROR_PREFIXES) {
    text = replaceAll(text, `https://${p}`, `${origin}/_mirror/${p}`);
    text = replaceAll(text, esc(`https://${p}`), esc(`${origin}/_mirror/${p}`));
  }
  for (const p of BLOCK_PREFIXES) {
    text = replaceAll(text, `https://${p}`, `${origin}/_blocked/${p}`);
    text = replaceAll(text, esc(`https://${p}`), esc(`${origin}/_blocked/${p}`));
  }
  if (links) text = replaceAll(text, "https://www.quadrasystems.net", origin); // keep in-script links inside the copy
  return text;
}

// Hosts the local server may fetch a missing file from (once, read-only).
const FILL_HOSTS = new Set(["framerusercontent.com", "fonts.gstatic.com", "app.framerstatic.com", "framer.com"]);

module.exports = { rewrite, FILL_HOSTS, MIRROR_PREFIXES };
