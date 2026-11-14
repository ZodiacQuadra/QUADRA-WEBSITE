// Interactions for rebuilt pages in the updated live copy: theme toggle, navigation panels, phone menu, reveal.
// Uses the same localStorage key ("theme": "Dark"/"Light") as the live site, so the choice carries across pages.
(function () {
  var root = document.documentElement;
  var nav = document.querySelectorAll("nav");

  // Theme: the live nav's moon link (href="#") toggles dark/light
  nav.forEach(function (n) {
    n.querySelectorAll('a[href="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var next = root.getAttribute("data-q-theme") === "light" ? "dark" : "light";
        root.setAttribute("data-q-theme", next);
        try { localStorage.setItem("theme", next === "light" ? "Light" : "Dark"); } catch (err) {}
      });
    });
  });

  // Desktop panels: open from the live nav items that have dropdowns
  var panels = {};
  document.querySelectorAll(".q-menu").forEach(function (p) { panels[p.getAttribute("data-q-label")] = p; });
  var openPanel = null, closeTimer = null;
  function place(panel, anchor) {
    var shell = anchor.closest("nav") || anchor;
    panel.style.top = shell.getBoundingClientRect().bottom + 8 + "px";
  }
  function open(panel, anchor) {
    clearTimeout(closeTimer);
    if (openPanel && openPanel !== panel) openPanel.classList.remove("q-open");
    place(panel, anchor);
    panel.classList.add("q-open");
    openPanel = panel;
  }
  function close() { if (openPanel) openPanel.classList.remove("q-open"); openPanel = null; }
  function later() { clearTimeout(closeTimer); closeTimer = setTimeout(close, 220); }
  document.querySelectorAll('nav a[data-framer-name="Menu Item Dropdown"], nav a[data-framer-name="Menu Item Simple"]').forEach(function (a) {
    var label = (a.textContent || "").trim();
    var panel = panels[label];
    if (!panel) { a.addEventListener("mouseenter", later); return; }
    a.addEventListener("mouseenter", function () { open(panel, a); });
    a.addEventListener("mouseleave", later);
    a.addEventListener("click", function (e) { if (openPanel !== panel) { e.preventDefault(); open(panel, a); } });
  });
  Object.keys(panels).forEach(function (k) {
    panels[k].addEventListener("mouseenter", function () { clearTimeout(closeTimer); });
    panels[k].addEventListener("mouseleave", later);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { close(); setMobile(false); } });
  document.addEventListener("click", function (e) { if (openPanel && !openPanel.contains(e.target) && !e.target.closest("nav")) close(); });
  window.addEventListener("scroll", function () { if (openPanel) close(); }, { passive: true });

  // Phone menu: the live hamburger opens the full navigation
  var mobile = document.querySelector(".q-mobile");
  function setMobile(on) { if (mobile) mobile.classList.toggle("q-open", on); document.body.style.overflow = on ? "hidden" : ""; }
  document.querySelectorAll('[data-framer-name="Mobile Menu"]').forEach(function (m) {
    m.style.cursor = "pointer";
    m.addEventListener("click", function (e) { e.preventDefault(); setMobile(true); });
  });
  if (mobile) mobile.querySelector(".q-mobile-close").addEventListener("click", function () { setMobile(false); });

  // Rebuilt heroes: the live hero boxes were sized for the old, shorter copy. Let them grow with the new text, keep a
  // steady eyebrow → title → intro → buttons rhythm, and lay a soft scrim behind text that sits on a photo.
  var touched = [];
  function setStyle(el, prop, val) {
    if (prop.indexOf("--") === 0) { touched.push([el, prop, el.style.getPropertyValue(prop), 1]); el.style.setProperty(prop, val); return; }
    touched.push([el, prop, el.style[prop]]); el.style[prop] = val;
  }
  function shown(el) { return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden"; }
  function lca(a, b) { var s = []; for (var x = a; x; x = x.parentElement) s.push(x); for (var y = b; y; y = y.parentElement) if (s.indexOf(y) >= 0) return y; return null; }
  // the child of `anc` that holds `n`, stepping through Framer's display:contents wrappers (margins don't apply to them)
  function childOn(anc, n) {
    var x = n;
    while (x && x.parentElement !== anc) x = x.parentElement;
    while (x && x !== n && getComputedStyle(x).display === "contents") { var y = n; while (y.parentElement !== x) y = y.parentElement; x = y; }
    return x;
  }
  function fitHero() {
    while (touched.length) { var t = touched.pop(); if (t[3]) t[0].style.setProperty(t[1], t[2]); else t[0].style[t[1]] = t[2]; }
    var phone = innerWidth < 810, gaps = phone ? [14, 10, 16, 22] : [18, 14, 20, 28];
    document.querySelectorAll("[data-q-hero]").forEach(function (hero) {
      if (!shown(hero)) return;
      var pick = function (sel) { return [].slice.call(hero.querySelectorAll(sel)).filter(shown)[0] || null; };
      // the pack's label above the title, when only another breakpoint's copy of the hero has a slot for it, is
      // repeated in the copy showing now (directly above the title, in its alignment)
      [].slice.call(hero.querySelectorAll("[data-q-eyebrow][data-q-copy]")).forEach(function (x) { x.remove(); });
      var ebSrc = hero.querySelector("[data-q-kicker]"), shownTitle = pick("[data-q-title]");
      if (ebSrc && shownTitle && !pick("[data-q-eyebrow]")) {
        var ec = ebSrc.cloneNode(true); ec.setAttribute("data-q-copy", "");
        ec.style.setProperty("--framer-text-alignment", getComputedStyle(shownTitle).textAlign);
        ec.style.textAlign = getComputedStyle(shownTitle).textAlign; ec.style.marginLeft = ""; ec.style.maxWidth = "";
        shownTitle.parentNode.insertBefore(ec, shownTitle);
      }
      // a product logo placed in one breakpoint's copy of the hero is repeated in the copy showing now
      [].slice.call(hero.querySelectorAll(".q-hero-logos[data-q-copy]")).forEach(function (x) { x.remove(); });
      var logoSrc = hero.querySelector(".q-hero-logos");
      if (logoSrc && !pick(".q-hero-logos")) {
        var at = pick("[data-q-eyebrow]") || pick("[data-q-title]");
        if (at) { var cp = logoSrc.cloneNode(true); cp.setAttribute("data-q-copy", ""); at.parentNode.insertBefore(cp, at); }
      }
      var eyebrow = pick("[data-q-eyebrow]"), title = pick("[data-q-title]"), intro = pick("[data-q-intro]"), logos = pick(".q-hero-logos");
      if (intro) intro.classList.remove("q-long");
      // the pack's label lines up with the title (some live phone slots are left-aligned under a centred title)
      if (eyebrow && title && eyebrow.hasAttribute("data-q-kicker")) {
        var ta = getComputedStyle(title).textAlign;
        if (getComputedStyle(eyebrow).textAlign !== ta) { setStyle(eyebrow, "--framer-text-alignment", ta); setStyle(eyebrow, "textAlign", ta); }
      }
      // a product logo above the copy follows the title's alignment
      if (logos && title && getComputedStyle(title).textAlign !== "center") setStyle(logos, "justifyContent", "flex-start");
      var last = intro || title;
      var actions = pick(".q-hero-actions") || (last ? [].slice.call(hero.querySelectorAll("a")).filter(function (a) { return shown(a) && a.querySelector("p") && last.compareDocumentPosition(a) & 4; })[0] || null : null);
      var heroH = hero.getBoundingClientRect().height;
      // text boxes stay inside the side gutters (some live phone title boxes are wider than the screen)
      var vw = document.documentElement.clientWidth, gut = phone ? 20 : 32;
      var parts = [actions, intro, title, eyebrow].filter(Boolean);
      var out = function (n) { var r = n.getBoundingClientRect(); return r.left < gut - 1 || r.right > vw - gut + 1; };
      if (parts.some(out)) {
        // 1. the column holding the copy gets the gutter as padding when it runs edge to edge
        var col = parts.reduce(function (a, b) { return a === b ? a : lca(a, b); });
        if (col && col !== hero && col.getBoundingClientRect().width > vw - 2 * gut) {
          setStyle(col, "paddingLeft", gut + "px"); setStyle(col, "paddingRight", gut + "px"); setStyle(col, "boxSizing", "border-box");
        }
        // 2. nothing wider than the space between the gutters; an over-long button label wraps inside the pill
        parts.forEach(function (n) {
          if (n === actions && n.tagName === "A" && out(n)) {
            var label = n.querySelector("p");
            if (label) { setStyle(label, "whiteSpace", "normal"); setStyle(label, "--framer-text-alignment", "center"); setStyle(label, "textAlign", "center"); }
            setStyle(n, "height", "auto");
          }
          if (n.getBoundingClientRect().width > vw - 2 * gut + 1) setStyle(n, "maxWidth", vw - 2 * gut + "px");
        });
        // 3. anything still outside moves in (centred text centres; the rest shifts by the overflow)
        parts.forEach(function (n) {
          if (!out(n)) return;
          if (getComputedStyle(n).textAlign === "center" && n !== actions) { setStyle(n, "marginLeft", "auto"); setStyle(n, "marginRight", "auto"); return; }
          var r = n.getBoundingClientRect(), shift = Math.min(Math.max(r.left, gut), vw - gut - r.width) - r.left;
          setStyle(n, "marginLeft", (parseFloat(getComputedStyle(n).marginLeft) || 0) + shift + "px");
        });
      }
      // an unusually long title steps down one size rather than running to 3+ lines (4+ on a phone)
      if (title) {
        var cs = getComputedStyle(title), fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight) || fs * 1.1;
        if (Math.round(title.getBoundingClientRect().height / lh) > (phone ? 3 : 2)) { setStyle(title, "--framer-font-size", Math.round(fs * 0.82) + "px"); setStyle(title, "fontSize", Math.round(fs * 0.82) + "px"); }
      }
      // a readable measure for the longer intro copy (about 75 characters a line)
      if (intro && intro.getBoundingClientRect().width > 660) {
        setStyle(intro, "maxWidth", "640px");
        if (getComputedStyle(intro).textAlign === "center") { setStyle(intro, "marginLeft", "auto"); setStyle(intro, "marginRight", "auto"); }
      }
      [logos, eyebrow, title, intro].forEach(function (n) {
        if (!n) return;
        for (var a = n.parentElement; a && a !== hero; a = a.parentElement) {
          if (getComputedStyle(a).display === "contents") continue;
          var r = a.getBoundingClientRect(), b = n.getBoundingClientRect();
          if (b.top < r.top - 1 || b.bottom > r.bottom + 1) { setStyle(a, "height", "auto"); setStyle(a, "minHeight", "0"); }
        }
      });
      // minimum gap before each piece that is present: after the logo row, then before the title, intro, buttons
      var seq = [logos, eyebrow, title, intro, actions].filter(Boolean);
      var gapBefore = function (q, p) { return p === logos ? gaps[0] : q === title ? gaps[1] : q === intro ? gaps[2] : gaps[3]; };
      for (var i = 1; i < seq.length; i++) {
        var p = seq[i - 1], q = seq[i];
        var need = gapBefore(q, p) - (q.getBoundingClientRect().top - p.getBoundingClientRect().bottom);
        var c = need > 1 ? childOn(lca(p, q), q) : null;
        if (c) setStyle(c, "marginTop", (parseFloat(getComputedStyle(c).marginTop) || 0) + need + "px");
      }
      // an intro longer than 6 lines (at its final width) can't be balanced: let it avoid a lone last word instead
      if (intro) {
        // widths of the rendered lines, top to bottom
        var lineWidths = function () {
          var rg = document.createRange(), byTop = {};
          rg.selectNodeContents(intro);
          [].forEach.call(rg.getClientRects(), function (r) { if (r.width > 1) { var t = Math.round(r.top); byTop[t] = (byTop[t] || 0) + r.width; } });
          return Object.keys(byTop).sort(function (a, b) { return a - b; }).map(function (t) { return byTop[t]; });
        };
        var lw = lineWidths();
        if (lw.length > 6) {
          // balance it by hand: step in from the full width until the last line is at least 60% of the longest
          intro.classList.add("q-long");
          var orig = intro.style.maxWidth, full = intro.getBoundingClientRect().width, best = null;
          for (var w = full; w >= full * 0.8; w -= 6) {
            intro.style.maxWidth = w + "px";
            var ls = lineWidths();
            if (ls.length === lw.length && ls[ls.length - 1] >= 0.6 * Math.max.apply(null, ls)) { best = w; break; }
          }
          intro.style.maxWidth = orig;
          if (best && best < full) {
            setStyle(intro, "maxWidth", Math.ceil(best) + "px");
            if (getComputedStyle(intro).textAlign === "center") { setStyle(intro, "marginLeft", "auto"); setStyle(intro, "marginRight", "auto"); }
          }
        }
      }
      // hero buttons stacked on a narrow screen: one shared width and a tight 12px gap between them
      var btns = [].slice.call(hero.querySelectorAll(".q-hero-actions .q-btn, a")).filter(function (a) { return shown(a) && (a.classList.contains("q-btn") || a.querySelector("p")) && (!last || last.compareDocumentPosition(a) & 4); });
      if (btns.length > 1 && btns[1].getBoundingClientRect().top >= btns[0].getBoundingClientRect().bottom - 2) {
        var bw = Math.max.apply(null, btns.map(function (a) { return a.getBoundingClientRect().width; }));
        btns.forEach(function (a) { setStyle(a, "minWidth", Math.ceil(bw) + "px"); setStyle(a, "justifyContent", "center"); });
        for (var j = 1; j < btns.length; j++) {
          var extra = btns[j].getBoundingClientRect().top - btns[j - 1].getBoundingClientRect().bottom - 12;
          var wrap = extra > 1 ? childOn(lca(btns[j - 1], btns[j]), btns[j]) : null;
          if (wrap) setStyle(wrap, "marginTop", (parseFloat(getComputedStyle(wrap).marginTop) || 0) - extra + "px");
        }
      }
      // Framer hero art often stacks a full-size layer above the CTA; disable hit-testing on blockers.
      function unblockClicks(target) {
        if (!target || !shown(target)) return;
        setStyle(target, "position", "relative");
        setStyle(target, "zIndex", "30");
        var r = target.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        for (var g = 0; g < 24; g++) {
          var top = document.elementFromPoint(cx, cy);
          if (!top || top === target || target.contains(top)) break;
          if (!hero.contains(top)) break;
          if (top.closest && top.closest("a, button, input, textarea, select")) break;
          setStyle(top, "pointerEvents", "none");
        }
      }
      if (actions) unblockClicks(actions);
      btns.forEach(unblockClicks);
      // the grown text must not spill out of a fixed-height hero
      var end = (actions || last || hero).getBoundingClientRect().bottom, hb = hero.getBoundingClientRect().bottom;
      if (end > hb - 24) { setStyle(hero, "height", "auto"); setStyle(hero, "minHeight", heroH + "px"); }
      var hr = hero.getBoundingClientRect();
      var photo = [].slice.call(hero.querySelectorAll("img, video")).some(function (m) { var r = m.getBoundingClientRect(); return shown(m) && r.width * r.height > 0.5 * hr.width * hr.height; });
      hero.classList.toggle("q-photo-hero", photo);
      [].slice.call(hero.querySelectorAll(".q-hero-text")).forEach(function (x) { x.classList.remove("q-hero-text"); });
      var box = title && intro ? lca(title, intro) : title && title.parentElement;
      if (box && box !== hero) { box.classList.add("q-hero-text"); if (getComputedStyle(box).position === "static") setStyle(box, "position", "relative"); }
    });
    // EB Garamond's g, y, p, q paint past a 1.1 line box. Framer's gradient titles
    // (data-text-fill) are that full height, inside a wrapper exactly as tall as the
    // line with overflow hidden, so the tail is cut off. Let it paint when the clip
    // edge sits on the text. A tall card or section that merely contains the heading is left alone.
    document.querySelectorAll("[data-text-fill], h1, h2, h3").forEach(function (el) {
      if (!shown(el)) return;
      var box = el.getBoundingClientRect();
      if (box.height < 2) return;
      var inkBottom = box.bottom;
      [].forEach.call(el.querySelectorAll("[data-text-fill]"), function (s) {
        if (shown(s)) inkBottom = Math.max(inkBottom, s.getBoundingClientRect().bottom);
      });
      if (!el.hasAttribute("data-text-fill")) {
        var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize) || 0, lh = parseFloat(cs.lineHeight) || fs;
        if (fs && lh < fs * 1.2 && /[gjpqy]/i.test(el.textContent || "")) inkBottom = Math.max(inkBottom, box.bottom + fs * 0.1);
      }
      if (inkBottom < box.bottom + 0.6) return;
      for (var a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        var st = getComputedStyle(a);
        if (st.display === "contents") continue;
        var oy = st.overflowY;
        if (oy !== "hidden" && oy !== "clip") continue;
        var r = a.getBoundingClientRect();
        if (inkBottom > r.bottom - 0.5 && r.bottom - box.bottom < 14) setStyle(a, "overflow", "visible");
      }
    });
  }
  var fitQueued = 0;
  // a short timer rather than requestAnimationFrame: it still runs in a background tab (e.g. a rotated, unfocused one)
  function queueFit() { clearTimeout(fitQueued); fitQueued = setTimeout(function () { fitQueued = 0; fitHero(); }, 60); }
  fitHero();
  addEventListener("resize", queueFit);
  addEventListener("load", queueFit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueFit);

  // Live card effects (recognition card): Framer draws a starfield and a cobe globe with its script.
  // Draw them here: the globe runs the live site's own cobe code with the live settings.
  // Framer pre-renders an empty canvas for each: the globe's sits in a square, round-masked wrapper.
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isGlobe = function (cv) { return /aspect-ratio:\s*1\s*\/\s*1/.test(cv.parentElement.getAttribute("style") || ""); };
  function stars(cv) {
    var ctx = cv.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1), pts = [];
    function size() {
      var r = cv.getBoundingClientRect();
      cv.width = r.width * dpr; cv.height = r.height * dpr; pts = [];
      for (var i = 0, n = Math.round((r.width * r.height) / 2600); i < n; i++) pts.push({ x: Math.random(), y: Math.random(), r: (Math.random() * 1.1 + 0.4) * dpr, p: Math.random() * 6.28, s: 0.4 + Math.random() * 1.2 });
    }
    function frame(t) {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = "#fff";
      for (var i = 0; i < pts.length; i++) {
        var q = pts[i];
        ctx.globalAlpha = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(q.p + t * 0.0012 * q.s));
        ctx.beginPath();
        ctx.arc(q.x * cv.width, (q.y * cv.height + (reduce ? 0 : t * 0.004 * q.s)) % cv.height, q.r, 0, 6.283);
        ctx.fill();
      }
      if (!reduce) requestAnimationFrame(frame);
    }
    size(); addEventListener("resize", size); requestAnimationFrame(frame);
  }
  // /home-v2: a large globe drawn in fine text characters, zoomed on India (window.Q_ASCII_GLOBE is the live globe's
  // world map; a detailed coastline around India keeps the zoomed view crisp; land and sea only, no borders).
  // Every cell holds a character: the sea dim, the land bright with a terrain texture, the coasts crisp. Characters
  // come from a pre-drawn glyph sheet and are cached between frames. India faces us with a slight sway; it can be
  // dragged and springs back. the Quadra wordmark is written over north India; Quadra's branches (the live contact page's offices) are orange characters with their
  // names beside them. It pauses off screen and stands still for reduced motion.
  function asciiGlobe(cv) {
    var img = new Image();
    img.onload = function () {
      // --- the surface: a 512x256 brightness texture built from the land map ---
      var mw = img.width, mh = img.height, mc = document.createElement("canvas");
      mc.width = mw; mc.height = mh;
      var mcx = mc.getContext("2d", { willReadFrequently: true });
      mcx.drawImage(img, 0, 0);
      var px = mcx.getImageData(0, 0, mw, mh).data, mask = new Float32Array(mw * mh);
      for (var i = 0; i < mw * mh; i++) mask[i] = px[i * 4] > 127 ? 1 : 0;
      var TW = 512, TH = 256, tex = new Float32Array(TW * TH);
      var maskAt = function (u, v) { // bilinear, wrapping east-west
        var x = u * mw - 0.5, y = Math.max(0, Math.min(mh - 1.001, v * mh - 0.5)), x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
        var a = mask[y0 * mw + ((x0 % mw) + mw) % mw], b = mask[y0 * mw + ((x0 + 1) % mw + mw) % mw];
        var c = mask[(y0 + 1) * mw + ((x0 % mw) + mw) % mw], d = mask[(y0 + 1) * mw + ((x0 + 1) % mw + mw) % mw];
        return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
      };
      var hash = function (x, y) { var h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return h - Math.floor(h); };
      var vnoise = function (x, y, period) { // value noise that wraps east-west
        var x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
        var a = hash(x0 % period, y0), b = hash((x0 + 1) % period, y0), c = hash(x0 % period, y0 + 1), d = hash((x0 + 1) % period, y0 + 1);
        return (a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy;
      };
      for (var ty = 0; ty < TH; ty++) for (var tx = 0; tx < TW; tx++) {
        var u = (tx + 0.5) / TW, v = (ty + 0.5) / TH, lat = (0.5 - v) * 180;
        var f = 0, amp = 0.5, fr = 8;
        for (var o = 0; o < 4; o++) { f += amp * vnoise(u * fr, v * fr * 0.5, fr); amp *= 0.5; fr *= 2; }
        var m = maskAt(u, v), landish = Math.max(0, Math.min(1, (m - 0.35) / 0.3)), coastline = 1 - Math.abs(m - 0.5) * 2;
        var sea = 0.06 + 0.07 * f, ground = 0.58 + 0.38 * f + 0.1 * Math.max(0, coastline);
        var val = sea * (1 - landish) + ground * landish;
        if (Math.abs(lat) > 74) val = Math.max(val, (0.4 + 0.3 * f) * Math.min(1, (Math.abs(lat) - 74) / 6)); // polar ice
        tex[ty * TW + tx] = Math.min(1, val);
      }
      // --- a detailed coastline around India (land and sea only, no borders), so the zoomed view stays crisp.
      // [lon, lat] points; the mainland polygon closes along the top of the region. ---
      var RG = { lon0: 58, lon1: 100, lat0: 2, lat1: 40, px: 20 }; // 20 px per degree
      var MAIN = [[58, 25.6], [58.8, 25.5], [60.6, 25.3], [61.6, 25.1], [62.5, 25.2], [64, 25.3], [65.5, 25.4], [66.6, 25.4], [67, 24.8], [67.4, 24], [68.2, 23.7],
        [68.6, 23.3], [69.2, 22.9], [70.3, 22.95], [70.1, 22.5], [69.1, 22.3], [69.6, 21.6], [70.4, 21], [71, 20.75], [71.8, 20.95], [72.2, 21.5], [72.6, 22.2],
        [72.6, 21.6], [72.8, 21.1], [72.85, 20.3], [72.8, 19], [73, 18.2], [73.3, 17], [73.6, 16], [73.8, 15.4], [74.1, 14.7], [74.5, 13.8], [74.85, 12.9],
        [75.3, 12], [75.8, 11.2], [76.25, 9.95], [76.6, 9], [76.95, 8.45], [77.55, 8.07], [78.15, 8.8], [78.4, 9.1], [79.3, 9.3], [79.3, 10.3], [79.85, 10.3],
        [79.85, 10.8], [79.85, 11.9], [80.15, 12.6], [80.3, 13.1], [80.25, 13.8], [80.1, 14.6], [80.15, 15.3], [81, 15.75], [81.4, 16.3], [82.3, 16.6],
        [82.3, 17], [83.3, 17.7], [84.2, 18.3], [84.8, 19.1], [85.3, 19.5], [85.85, 19.8], [86.4, 20], [86.75, 20.4], [86.95, 21], [87.1, 21.6], [87.9, 21.8],
        [88.6, 21.6], [89.1, 21.7], [89.6, 21.8], [90.3, 21.9], [90.6, 22.5], [91, 22.6], [91.5, 22.5], [91.8, 22.2], [92, 21.4], [92.3, 20.7], [92.9, 20.1],
        [93.5, 19.4], [94.2, 18.6], [94.5, 17.5], [94.3, 16.4], [94.6, 15.9], [95.4, 15.8], [96.4, 16.5], [97.2, 16.9], [97.6, 16.4], [97.8, 15], [98.2, 13.5],
        [98.5, 12], [98.7, 10.5], [98.5, 9], [98.3, 8.2], [98.7, 7.9], [100, 6.8], [100, 40], [58, 40]];
      var LANKA = [[79.85, 9.8], [80.3, 9.8], [80.9, 9], [81.3, 8.5], [81.9, 7.4], [81.8, 6.6], [81.2, 6.15], [80.6, 5.95], [80.1, 6.2], [79.85, 6.9], [79.8, 7.8], [79.9, 8.6]];
      var RWd = (RG.lon1 - RG.lon0) * RG.px, RHd = (RG.lat1 - RG.lat0) * RG.px, rc = document.createElement("canvas");
      rc.width = RWd; rc.height = RHd;
      var rx = rc.getContext("2d", { willReadFrequently: true });
      rx.fillStyle = "#000"; rx.fillRect(0, 0, RWd, RHd);
      rx.filter = "blur(1.5px)"; rx.fillStyle = "#fff";
      [MAIN, LANKA].forEach(function (poly) {
        rx.beginPath();
        poly.forEach(function (p, n) { var X = (p[0] - RG.lon0) * RG.px, Y = (RG.lat1 - p[1]) * RG.px; if (n) rx.lineTo(X, Y); else rx.moveTo(X, Y); });
        rx.closePath(); rx.fill();
      });
      var rpx = rx.getImageData(0, 0, RWd, RHd).data, rtex = new Float32Array(RWd * RHd);
      for (var ry = 0; ry < RHd; ry++) for (var rxx = 0; rxx < RWd; rxx++) {
        var lon = RG.lon0 + (rxx + 0.5) / RG.px, la2 = RG.lat1 - (ry + 0.5) / RG.px, uu = (lon + 180) / 360, vv2 = (90 - la2) / 180;
        var fn = 0, am = 0.5, fq = 8;
        for (var oo = 0; oo < 5; oo++) { fn += am * vnoise(uu * fq, vv2 * fq * 0.5, fq); am *= 0.5; fq *= 2; }
        var mm = rpx[(ry * RWd + rxx) * 4] / 255, ld = Math.max(0, Math.min(1, (mm - 0.3) / 0.4)), cl = 1 - Math.abs(mm - 0.5) * 2;
        rtex[ry * RWd + rxx] = Math.min(1, (0.06 + 0.07 * fn) * (1 - ld) + (0.58 + 0.38 * fn + 0.14 * Math.max(0, cl)) * ld);
      }
      // --- "Quadra" (the wordmark, in EB Garamond) written on the globe over north India, above the branches:
      // 2 = letter, 1 = the soft dark band behind the word (the land there is dimmed so the letters read cleanly).
      // Drawn in map coordinates (so it turns with the globe), stretched a little north-south against the globe's tilt. ---
      var qm = new Uint8Array(RWd * RHd), qband = new Float32Array(RWd * RHd);
      var wordmark = function () {
        var wc = document.createElement("canvas");
        wc.width = RWd; wc.height = RHd;
        var w = wc.getContext("2d", { willReadFrequently: true }), WX = (79 - RG.lon0) * RG.px, WY = (RG.lat1 - 29.2) * RG.px;
        w.translate(WX, WY); w.scale(1, 1.18);
        w.font = "600 168px \"EB Garamond\", Garamond, Georgia, serif"; // the Quadra wordmark's serif
        if ("letterSpacing" in w) w.letterSpacing = "2px";
        w.textAlign = "center"; w.textBaseline = "middle";
        var tw = w.measureText("Quadra").width;
        // the band: a soft-edged dark plate a little larger than the word
        w.filter = "blur(26px)"; w.fillStyle = "#fff";
        w.fillRect(-tw / 2 - 40, -82, tw + 80, 150);
        var band = w.getImageData(0, 0, RWd, RHd).data;
        w.filter = "none";
        w.setTransform(1, 0, 0, 1, 0, 0); w.clearRect(0, 0, RWd, RHd);
        w.translate(WX, WY); w.scale(1, 1.18);
        w.fillStyle = "#fff"; w.fillText("Quadra", 0, 0);
        var t = w.getImageData(0, 0, RWd, RHd).data;
        for (var n = 0; n < RWd * RHd; n++) { qm[n] = t[n * 4 + 3] > 110 ? 2 : 0; qband[n] = band[n * 4 + 3] / 255; }
        lastLayer = -1e9; regDirty = true; // redraw the characters with it
      };
      wordmark();
      if (document.fonts && document.fonts.load) document.fonts.load("600 168px \"EB Garamond\"").then(wordmark, function () {});
      // --- drawing: an own canvas over the section, from just above the text down; the framer canvas is not used ---
      var sec = cv.closest("[data-q-live]");
      var out = document.createElement("canvas");
      out.setAttribute("aria-hidden", "true");
      out.className = "q-v2-globe-canvas";
      sec.appendChild(out);
      // (13 Nov) the branch names on their own canvas above the globe, outside its bottom fade, so a city low on the
      // map (Kochi) keeps a fully visible label
      var labs = document.createElement("canvas");
      labs.setAttribute("aria-hidden", "true");
      labs.className = "q-v2-globe-labels";
      sec.appendChild(labs);
      var lx = labs.getContext("2d");
      cv.style.visibility = "hidden";
      var ctx = out.getContext("2d"), layer = document.createElement("canvas"), lctx = layer.getContext("2d");
      // (14 Nov) the characters are drawn into layer2 a slice at a time (job), then swapped in
      var layer2 = document.createElement("canvas"), l2ctx = layer2.getContext("2d"), job = null;
      // (14 Nov) WebGL 2 when available (glSetup): the whole globe is drawn by the graphics card every frame
      var gl = null, glp = null, glU = {}, glT = {}, regDirty = true;
      var RAMP = " .:-=+*#%@", LEVELS = 12, OLEVELS = 6, atlas = null, gw = 0, gh = 0;
      var cells = [], S = 0, R = 0, dpr = 1, fs = 7, last = 0, lastLayer = 0, layerPhi = 99, layerTilt = 99, visible = true;
      var offX = 0, offY = 0, VW = 0, VH = 0;
      var D = Math.PI / 180, INDIA = 79 * D, TILT = -0.7; // India faces us; TILT is set in layout so India sits mid-strip
      var phi = INDIA, vel = 0, tilt = TILT, drag = null, t0 = performance.now();
      // Quadra's branches (offices on the live contact page); dx: label to the left (-1) or right (1) of the place
      var BRANCHES = [
        { name: "Mumbai", lat: 19.08, lon: 72.88, dx: -1 }, { name: "Pune", lat: 18.52, lon: 73.86, dx: 1 },
        { name: "Hyderabad", lat: 17.39, lon: 78.49, dx: 1 }, { name: "Bengaluru", lat: 12.97, lon: 77.59, dx: -1 },
        { name: "Chennai", lat: 13.08, lon: 80.27, dx: 1 }, { name: "Coimbatore", lat: 11.02, lon: 76.96, dx: 1 },
        { name: "Kochi", lat: 9.93, lon: 76.27, dx: -1 },
      ];
      BRANCHES.forEach(function (B) { var la = B.lat * D, lo = B.lon * D; B.v = [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)]; });
      var NEAR = Math.cos(0.42 * D); // how far from a branch the characters turn orange
      var IC = [Math.cos(21 * D) * Math.sin(79 * D), Math.sin(21 * D), Math.cos(21 * D) * Math.cos(79 * D)], F0 = Math.cos(40 * D), F1 = Math.cos(15 * D); // India's centre; the focus fades from 15° to 40° away
      var Lx = -0.3, Ly = 0.35, Lz = 0.89, Ln = Math.hypot(Lx, Ly, Lz); Lx /= Ln; Ly /= Ln; Lz /= Ln;
      function buildAtlas(cw, ch) {
        gw = Math.ceil(cw * dpr); gh = Math.ceil(ch * dpr);
        atlas = document.createElement("canvas");
        atlas.width = gw * RAMP.length; atlas.height = gh * (LEVELS + OLEVELS);
        var a = atlas.getContext("2d");
        a.font = "600 " + (fs * dpr).toFixed(1) + "px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
        a.textAlign = "center"; a.textBaseline = "middle";
        for (var l = 0; l < LEVELS + OLEVELS; l++) {
          if (l < LEVELS) a.fillStyle = "rgba(240, 236, 230, " + (0.12 + (0.88 * l) / (LEVELS - 1)).toFixed(3) + ")";
          else { var o = (l - LEVELS) / (OLEVELS - 1); a.fillStyle = o < 0.5 ? "rgba(242, 97, 2, " + (0.55 + o * 0.9).toFixed(3) + ")" : "rgb(255, " + Math.round(120 + (o - 0.5) * 110) + ", " + Math.round(40 + (o - 0.5) * 120) + ")"; }
          for (var g = 1; g < RAMP.length; g++) a.fillText(RAMP.charAt(g), g * gw + gw / 2, l * gh + gh / 2);
        }
      }
      function layout() {
        var sr = sec.getBoundingClientRect(), content = sec.querySelector("[data-framer-name='Content']");
        // the globe starts below the text and button (offsetTop: the layout position, not moved by the heading's
        // entrance animation)
        var top = content && content.offsetParent === sec ? content.offsetTop + content.offsetHeight + Math.max(28, sr.width * 0.03) : sr.height * 0.45;
        dpr = Math.min(2, window.devicePixelRatio || 1);
        fs = Math.max(5.5, Math.min(7.5, sr.width / 200));
        // a large globe: India fills the view, its curved top still in sight
        R = sr.width < 700 ? sr.width * 1.8 : Math.min(1300, sr.width * 0.78);
        S = 2 * (R + fs);
        VW = Math.round(sr.width); VH = Math.max(1, Math.round(sr.height - top));
        // the globe's square sits centred, its top at the strip's top; offX/offY: square → strip
        offX = (S - VW) / 2; offY = 0;
        // lean the globe so India (20°N) faces us at a gentle angle (so it is not foreshortened)
        TILT = 20 * D - Math.asin(0.76);
        var st = out.style;
        st.position = "absolute"; st.pointerEvents = "none"; st.zIndex = "2";
        st.left = "0px"; st.top = Math.round(top) + "px"; st.width = VW + "px"; st.height = VH + "px";
        var fadeFrom = Math.max(0, VH - Math.min(80, VH * 0.16));
        st.webkitMaskImage = st.maskImage = "linear-gradient(to bottom, #000 0, #000 " + fadeFrom + "px, transparent " + VH + "px)";
        out.width = layer.width = Math.round(VW * dpr); out.height = layer.height = Math.round(VH * dpr);
        var ls = labs.style;
        ls.position = "absolute"; ls.pointerEvents = "none"; ls.zIndex = "3";
        ls.left = "0px"; ls.top = st.top; ls.width = st.width; ls.height = st.height;
        labs.width = out.width; labs.height = out.height;
        var cw = fs * 0.6, ch = fs * 0.98;
        buildAtlas(cw, ch);
        cells = [];
        var c0 = Math.floor(offX / cw), c1 = Math.ceil((offX + VW) / cw), r1 = Math.ceil(VH / ch);
        for (var r = 0; r < r1; r++) for (var c = c0; c < c1; c++) {
          var x = (c + 0.5) * cw, y = (r + 0.5) * ch, nx = (x - S / 2) / R, ny = (S / 2 - y) / R, d = nx * nx + ny * ny;
          if (d > 1) continue;
          var nz = Math.sqrt(1 - d), lam = Math.max(0, nx * Lx + ny * Ly + nz * Lz);
          cells.push({ dx: Math.round((x - offX - cw / 2) * dpr), dy: Math.round((y - offY - ch / 2) * dpr), nx: nx, ny: ny, nz: nz, shade: 0.45 + 0.55 * lam });
        }
        tilt = TILT; layerPhi = 99; job = null;
        if (gl) glAfterLayout();
      }
      // the characters (orange at the branches), into the cached layer
      function renderLayer(now) {
        if (layer2.width !== layer.width || layer2.height !== layer.height) { layer2.width = layer.width; layer2.height = layer.height; }
        l2ctx.setTransform(1, 0, 0, 1, 0, 0);
        l2ctx.clearRect(0, 0, layer2.width, layer2.height);
        var cx = (S / 2 - offX) * dpr, cy = (S / 2 - offY) * dpr;
        var atm = l2ctx.createRadialGradient(cx, cy, R * dpr * 0.97, cx, cy, R * dpr * 1.03);
        atm.addColorStop(0, "rgba(255, 236, 222, 0)"); atm.addColorStop(0.5, "rgba(255, 226, 205, 0.1)"); atm.addColorStop(1, "rgba(255, 236, 222, 0)");
        l2ctx.fillStyle = atm; l2ctx.beginPath(); l2ctx.arc(cx, cy, R * dpr * 1.03, 0, 6.283); l2ctx.fill();
        job = { i: 0, phi: phi, tilt: tilt, now: now, cp: Math.cos(phi), sp: Math.sin(phi), ct: Math.cos(tilt), st: Math.sin(tilt), pulse: 0.85 + 0.15 * Math.sin(now / 700) };
      }
      // continue the redraw for about `budget` ms, then hand back; the finished picture replaces the shown one
      function stepLayer(budget) {
        if (!job) return;
        var j = job, until = performance.now() + budget, cp = j.cp, sp = j.sp, ct = j.ct, st = j.st, pulse = j.pulse, nb = BRANCHES.length;
        for (var i = j.i; i < cells.length; i++) {
          if (!(i & 255) && i > j.i && performance.now() > until) { j.i = i; return; }
          var k = cells[i];
          var qy = k.ny * ct + k.nz * st, qz = -k.ny * st + k.nz * ct; // undo the tilt
          var wx = k.nx * cp + qz * sp, wz = -k.nx * sp + qz * cp; // undo the turn
          var near = 0;
          for (var b = 0; b < nb; b++) { var v = BRANCHES[b].v, dd = wx * v[0] + qy * v[1] + wz * v[2]; if (dd > NEAR) near = Math.max(near, (dd - NEAR) / (1 - NEAR)); }
          if (near > 0) { // a branch: orange characters, densest and brightest at the city
            var o = Math.min(1, Math.sqrt(near) * pulse);
            l2ctx.drawImage(atlas, Math.min(RAMP.length - 1, 4 + Math.round(o * 5)) * gw, (LEVELS + Math.min(OLEVELS - 1, Math.round(o * (OLEVELS - 1)))) * gh, gw, gh, k.dx, k.dy, gw, gh);
            continue;
          }
          var lonD = Math.atan2(wx, wz) / D, latD = Math.asin(qy > 1 ? 1 : qy < -1 ? -1 : qy) / D, val;
          var qv = 0, qb = 0;
          if (lonD >= RG.lon0 && lonD < RG.lon1 && latD > RG.lat0 && latD <= RG.lat1) {
            var ri = Math.min(RHd - 1, ((RG.lat1 - latD) * RG.px) | 0) * RWd + Math.min(RWd - 1, ((lonD - RG.lon0) * RG.px) | 0);
            val = rtex[ri]; qv = qm[ri]; qb = qband[ri];
            if (qv === 2) { // a letter of the wordmark: bright, lighter characters (* and #)
              l2ctx.drawImage(atlas, (6 + (i & 1)) * gw, (LEVELS - 1) * gh, gw, gh, k.dx, k.dy, gw, gh);
              continue;
            }
          } else {
            val = tex[Math.min(TH - 1, ((90 - latD) / 180 * TH) | 0) * TW + Math.min(TW - 1, ((lonD + 180) / 360 * TW) | 0)];
          }
          var fc = (wx * IC[0] + qy * IC[1] + wz * IC[2] - F0) / (F1 - F0); fc = fc < 0 ? 0 : fc > 1 ? 1 : fc * fc * (3 - 2 * fc);
          val *= k.shade * (0.3 + 0.7 * fc) * (1 - 0.8 * qb); // India in focus, the rest dimmer; a dark band behind the wordmark
          var g = Math.min(RAMP.length - 1, 1 + ((val * (RAMP.length - 1)) | 0)), l = Math.min(LEVELS - 1, (val * LEVELS * 1.05) | 0);
          l2ctx.drawImage(atlas, g * gw, l * gh, gw, gh, k.dx, k.dy, gw, gh);
        }
        var t = layer; layer = layer2; layer2 = t; var tc = lctx; lctx = l2ctx; l2ctx = tc;
        layerPhi = j.phi; layerTilt = j.tilt; lastLayer = j.now; job = null;
      }

      // ---- (14 Nov) the globe on the graphics card ----
      function glSetup() {
        if (!window.WebGL2RenderingContext || /[?&]q-globe=2d\b/.test(location.search)) return;
        try {
          var c = document.createElement("canvas"), g = c.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
          if (!g) return;
          var VS = "#version 300 es\nvoid main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.0-1.0,0.0,1.0);}";
          var FS = "#version 300 es\nprecision highp float;precision highp int;\n" +
            "uniform sampler2D uTex,uReg,uAtlas;uniform vec2 uView;uniform float uDpr,uCw,uCh,uOffX,uS,uR,uPulse,uNear,uF0,uF1,uRGpx;" +
            "uniform int uGw,uGh;uniform vec4 uRot,uRG;uniform vec3 uBr[7],uIC,uL;out vec4 o;const float D=0.017453292519943295;" +
            "vec4 glyph(int gi,int li,ivec2 lp){if(lp.x<0||lp.y<0||lp.x>=uGw||lp.y>=uGh)return vec4(0.0);return texelFetch(uAtlas,ivec2(gi*uGw+lp.x,li*uGh+lp.y),0);}" +
            "void main(){vec2 p=floor(vec2(gl_FragCoord.x,uView.y-gl_FragCoord.y));vec2 q=(p+0.5)/uDpr;" +
            "vec2 cen=vec2(uS*0.5-uOffX,uS*0.5);float t=(length(q-cen)-0.97*uR)/(0.06*uR);vec4 atm=vec4(0.0);" +
            "if(t>=0.0&&t<=1.0){float a=t<0.5?t*0.2:(1.0-t)*0.2;vec3 col=mix(vec3(1.0,0.925,0.871),vec3(1.0,0.886,0.804),1.0-abs(t*2.0-1.0));atm=vec4(col*a,a);}" +
            "float c=floor((q.x+uOffX)/uCw),r=floor(q.y/uCh);" +
            "ivec2 lp=ivec2(p)-ivec2(int(floor((c*uCw-uOffX)*uDpr+0.5)),int(floor(r*uCh*uDpr+0.5)));" +
            "float nx=((c+0.5)*uCw-uS*0.5)/uR,ny=(uS*0.5-(r+0.5)*uCh)/uR,d=nx*nx+ny*ny;if(d>1.0){o=atm;return;}" +
            "float nz=sqrt(1.0-d),sh=0.45+0.55*max(0.0,nx*uL.x+ny*uL.y+nz*uL.z);" +
            "float cp=uRot.x,sp=uRot.y,ct=uRot.z,st=uRot.w;float qy=ny*ct+nz*st,qz=-ny*st+nz*ct,wx=nx*cp+qz*sp,wz=-nx*sp+qz*cp;" +
            "float nr=0.0;for(int b=0;b<7;b++){float dd=wx*uBr[b].x+qy*uBr[b].y+wz*uBr[b].z;if(dd>uNear)nr=max(nr,(dd-uNear)/(1.0-uNear));}" +
            "vec4 g;if(nr>0.0){float oo=min(1.0,sqrt(nr)*uPulse);g=glyph(min(9,4+int(floor(oo*5.0+0.5))),12+min(5,int(floor(oo*5.0+0.5))),lp);}" +
            "else{float lonD=atan(wx,wz)/D,latD=asin(clamp(qy,-1.0,1.0))/D,val,qb=0.0;bool word=false;" +
            "if(lonD>=uRG.x&&lonD<uRG.y&&latD>uRG.z&&latD<=uRG.w){ivec2 rs=textureSize(uReg,0);" +
            "vec3 rg=texelFetch(uReg,ivec2(min(rs.x-1,int((lonD-uRG.x)*uRGpx)),min(rs.y-1,int((uRG.w-latD)*uRGpx))),0).rgb;val=rg.r;qb=rg.b;word=rg.g>0.5;}" +
            "else{ivec2 ts=textureSize(uTex,0);val=texelFetch(uTex,ivec2(min(ts.x-1,int((lonD+180.0)/360.0*float(ts.x))),min(ts.y-1,int((90.0-latD)/180.0*float(ts.y)))),0).r;}" +
            "if(word){g=glyph(6+(int(c+r)&1),11,lp);}else{" +
            "float fc=clamp((wx*uIC.x+qy*uIC.y+wz*uIC.z-uF0)/(uF1-uF0),0.0,1.0);fc=fc*fc*(3.0-2.0*fc);val*=sh*(0.3+0.7*fc)*(1.0-0.8*qb);" +
            "g=glyph(min(9,1+int(val*9.0)),min(11,int(val*12.6)),lp);}}" +
            "o=g+atm*(1.0-g.a);}";
          var sh = function (type, src) { var x = g.createShader(type); g.shaderSource(x, src); g.compileShader(x); if (!g.getShaderParameter(x, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(x)); return x; };
          var prog = g.createProgram();
          g.attachShader(prog, sh(g.VERTEX_SHADER, VS)); g.attachShader(prog, sh(g.FRAGMENT_SHADER, FS)); g.linkProgram(prog);
          if (!g.getProgramParameter(prog, g.LINK_STATUS)) throw new Error(g.getProgramInfoLog(prog));
          g.useProgram(prog);
          ["uTex", "uReg", "uAtlas", "uView", "uDpr", "uCw", "uCh", "uOffX", "uS", "uR", "uPulse", "uNear", "uF0", "uF1", "uRGpx", "uGw", "uGh", "uRot", "uRG", "uBr", "uIC", "uL"].forEach(function (n) { glU[n] = g.getUniformLocation(prog, n); });
          var mk = function (unit) { var x = g.createTexture(); g.activeTexture(g.TEXTURE0 + unit); g.bindTexture(g.TEXTURE_2D, x); [g.TEXTURE_MIN_FILTER, g.TEXTURE_MAG_FILTER].forEach(function (k) { g.texParameteri(g.TEXTURE_2D, k, g.NEAREST); }); [g.TEXTURE_WRAP_S, g.TEXTURE_WRAP_T].forEach(function (k) { g.texParameteri(g.TEXTURE_2D, k, g.CLAMP_TO_EDGE); }); return x; };
          glT.tex = mk(0); glT.reg = mk(1); glT.atlas = mk(2);
          g.pixelStorei(g.UNPACK_ALIGNMENT, 1);
          // the world texture, once
          var tb = new Uint8Array(TW * TH); for (var i = 0; i < tb.length; i++) tb[i] = Math.round(Math.min(1, tex[i]) * 255);
          g.activeTexture(g.TEXTURE0); g.texImage2D(g.TEXTURE_2D, 0, g.R8, TW, TH, 0, g.RED, g.UNSIGNED_BYTE, tb);
          g.uniform1i(glU.uTex, 0); g.uniform1i(glU.uReg, 1); g.uniform1i(glU.uAtlas, 2);
          var br = []; BRANCHES.forEach(function (B) { br.push(B.v[0], B.v[1], B.v[2]); });
          g.uniform3fv(glU.uBr, br); g.uniform1f(glU.uNear, NEAR); g.uniform3f(glU.uIC, IC[0], IC[1], IC[2]);
          g.uniform1f(glU.uF0, F0); g.uniform1f(glU.uF1, F1); g.uniform3f(glU.uL, Lx, Ly, Lz);
          g.uniform4f(glU.uRG, RG.lon0, RG.lon1, RG.lat0, RG.lat1); g.uniform1f(glU.uRGpx, RG.px);
          g.clearColor(0, 0, 0, 0);
          // the GL canvas takes the place of the 2D one
          c.setAttribute("aria-hidden", "true"); c.className = out.className;
          out.replaceWith(c); out = c; gl = g; glp = prog;
          c.addEventListener("webglcontextlost", function (e) { e.preventDefault(); gl = null; }, false);
        } catch (err) { gl = null; if (window.console) console.warn("Globe: WebGL unavailable, using canvas", err); }
      }
      function glAfterLayout() {
        var g = gl;
        g.activeTexture(g.TEXTURE2);
        g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, atlas);
        g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        g.viewport(0, 0, out.width, out.height);
        g.uniform2f(glU.uView, out.width, out.height); g.uniform1f(glU.uDpr, dpr);
        g.uniform1f(glU.uCw, fs * 0.6); g.uniform1f(glU.uCh, fs * 0.98); g.uniform1f(glU.uOffX, offX);
        g.uniform1f(glU.uS, S); g.uniform1f(glU.uR, R); g.uniform1i(glU.uGw, gw); g.uniform1i(glU.uGh, gh);
        // the canvas path's back layers are not needed
        layer.width = layer.height = layer2.width = layer2.height = 1;
      }
      function glRender(now) {
        var g = gl;
        if (regDirty) {
          regDirty = false;
          var rb = new Uint8Array(RWd * RHd * 3);
          for (var i = 0, n = RWd * RHd; i < n; i++) { rb[i * 3] = Math.round(Math.min(1, rtex[i]) * 255); rb[i * 3 + 1] = qm[i] === 2 ? 255 : 0; rb[i * 3 + 2] = Math.round(qband[i] * 255); }
          g.activeTexture(g.TEXTURE1); g.texImage2D(g.TEXTURE_2D, 0, g.RGB8, RWd, RHd, 0, g.RGB, g.UNSIGNED_BYTE, rb);
        }
        g.uniform4f(glU.uRot, Math.cos(phi), Math.sin(phi), Math.cos(tilt), Math.sin(tilt));
        g.uniform1f(glU.uPulse, 0.85 + 0.15 * Math.sin(now / 700));
        g.clear(g.COLOR_BUFFER_BIT);
        g.drawArrays(g.TRIANGLES, 0, 3);
      }
      // where India's centre sits on screen for a turn p and tilt t: the shown picture is shifted by the difference
      function spot(p, t) {
        var tx2 = IC[0] * Math.cos(p) - IC[2] * Math.sin(p), tz2 = IC[0] * Math.sin(p) + IC[2] * Math.cos(p);
        return [tx2 * R, -(IC[1] * Math.cos(t) - tz2 * Math.sin(t)) * R];
      }
      function draw(now) {
        if (gl) glRender(now); else {
        if (!job && (layerPhi === 99 || Math.abs(phi - layerPhi) > (drag ? 0.004 : 0.01) || Math.abs(tilt - layerTilt) > 0.003 || now - lastLayer > 1000)) renderLayer(now);
        stepLayer(reduce ? 1e9 : 7); // without the animation loop (reduced motion) it is drawn at once
        // a globe section hidden at this screen size has nothing to draw into (11 Nov: this threw on every frame)
        if (!layer.width || !layer.height) return;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, out.width, out.height);
        if (layerPhi !== 99) { var pa = spot(phi, tilt), pb = spot(layerPhi, layerTilt); ctx.drawImage(layer, Math.round((pa[0] - pb[0]) * dpr), Math.round((pa[1] - pb[1]) * dpr)); }
        }
        // each branch's name right beside it, on a small dark backing (on the label canvas: never faded)
        var cp = Math.cos(phi), sp = Math.sin(phi), ct = Math.cos(tilt), st = Math.sin(tilt);
        lx.setTransform(1, 0, 0, 1, 0, 0);
        lx.clearRect(0, 0, labs.width, labs.height);
        lx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var lf = Math.max(11, Math.min(13, VW / 110));
        lx.font = "600 " + lf.toFixed(1) + "px Raleway, \"Helvetica Neue\", Arial, sans-serif";
        lx.textBaseline = "middle";
        for (var bi = 0; bi < BRANCHES.length; bi++) {
          var B = BRANCHES[bi], v = B.v, tx2 = v[0] * cp - v[2] * sp, tz2 = v[0] * sp + v[2] * cp, vy = v[1] * ct - tz2 * st, vz = v[1] * st + tz2 * ct;
          if (vz < 0.1) continue;
          var x = S / 2 + tx2 * R - offX, y = S / 2 - vy * R - offY, w = lx.measureText(B.name).width, pad = 7, gap = Math.max(12, R * 0.0075 * 1.2);
          var side = B.dx;
          if (side < 0 && x - gap - w - pad * 2 < 4) side = 1;
          if (side > 0 && x + gap + w + pad * 2 > VW - 4) side = -1;
          // keep the whole label inside the strip, even for a city right at its bottom edge
          y = Math.min(y, VH - lf * 0.9 - 4);
          var bx = side < 0 ? x - gap - w - pad * 2 : x + gap, by = y - lf * 0.9;
          lx.fillStyle = "rgba(8, 8, 10, 0.8)";
          lx.beginPath(); if (lx.roundRect) lx.roundRect(bx, by, w + pad * 2, lf * 1.8, 5); else lx.rect(bx, by, w + pad * 2, lf * 1.8); lx.fill();
          lx.strokeStyle = "rgba(242, 97, 2, 0.45)"; lx.lineWidth = 1; lx.stroke();
          lx.textAlign = "left"; lx.fillStyle = "#fff";
          lx.fillText(B.name, bx + pad, y + 0.5);
        }
      }
      function frame(t) {
        if (visible && !document.hidden && t - last > (gl ? 15 : 33)) {
          last = t;
          // back toward India with a slight sway (a damped spring), unless it is being dragged
          if (!drag) {
            // scrolling in turns it toward India (window.Q_GLOBE_SCROLL: 0 = turned away, 1 = facing India; home_v2_scroll.js)
            var sc = typeof window.Q_GLOBE_SCROLL === "number" ? window.Q_GLOBE_SCROLL : 1, ez = 1 - Math.pow(1 - sc, 3);
            var aim = INDIA + 0.012 * Math.sin((t - t0) / 3800) - (1 - ez) * 1.15;
            vel = vel * 0.8 + (aim - phi) * (sc < 1 ? 0.05 : 0.012); phi += vel; tilt += (TILT - tilt) * 0.04;
          }
          draw(t);
        }
        requestAnimationFrame(frame);
      }
      // drag to turn (and tilt a little); it springs back to India after
      if (!reduce) {
        sec.style.touchAction = "pan-y";
        // on the globe: inside its circle and in the part of the strip that is not faded out
        var onGlobe = function (e) {
          var r = out.getBoundingClientRect(), y = e.clientY - r.top;
          if (e.clientX < r.left || e.clientX > r.right || y < 0 || y > Math.max(0, VH - Math.min(80, VH * 0.16))) return false;
          var gx = e.clientX - r.left + offX - S / 2, gy = y + offY - S / 2;
          return gx * gx + gy * gy <= R * R;
        };
        sec.addEventListener("pointermove", function (e) { if (!drag) sec.style.cursor = onGlobe(e) && !e.target.closest("a, button") ? "grab" : ""; });
        sec.addEventListener("pointerdown", function (e) {
          if (e.target.closest("a, button") || !onGlobe(e)) return;
          drag = { x: e.clientX, y: e.clientY, t: performance.now() };
          vel = 0; sec.style.cursor = "grabbing";
        });
        addEventListener("pointermove", function (e) {
          if (!drag) return;
          var now = performance.now(), dx = e.clientX - drag.x, dy = e.clientY - drag.y, kk = 1 / R;
          phi -= dx * kk; tilt = Math.max(TILT - 0.25, Math.min(TILT + 0.25, tilt + dy * kk));
          vel = (-dx * kk) / Math.max(1, (now - drag.t) / 33);
          drag = { x: e.clientX, y: e.clientY, t: now };
        });
        addEventListener("pointerup", function () { if (drag) { drag = null; sec.style.cursor = ""; } });
        addEventListener("pointercancel", function () { drag = null; });
      }
      glSetup();
      layout(); draw(performance.now());
      var relayout = function () { layout(); draw(performance.now()); };
      addEventListener("resize", relayout);
      if ("ResizeObserver" in window) new ResizeObserver(relayout).observe(sec);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
      if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(sec);
      if (!reduce) requestAnimationFrame(frame);
    };
    img.src = window.Q_ASCII_GLOBE;
  }
  function globe(cv) {
    if (window.Q_ASCII_GLOBE) { asciiGlobe(cv); return; }
    if (!window.Q_GLOBE) return;
    import(window.Q_GLOBE).then(function (G) {
      G.i();
      if (typeof G.r !== "function") return;
      var size = cv.getBoundingClientRect().width, dpr = Math.min(2, window.devicePixelRatio || 1), phi = 0;
      cv.width = Math.round(size * dpr); // cobe draws at the canvas's own pixel size
      cv.height = Math.round(size * dpr);
      G.r(cv, {
        devicePixelRatio: dpr, width: size * dpr, height: size * dpr, phi: 0, theta: 0.3, dark: 1, diffuse: 3,
        mapSamples: 26154, mapBrightness: 12, baseColor: [105 / 255, 105 / 255, 105 / 255], markerColor: [1, 1, 1], glowColor: [84 / 255, 84 / 255, 84 / 255],
        markers: [{ location: [52.3676, 4.9041], size: 0.1 }], scale: 1, offset: [0, 0],
        onRender: function (s) { s.phi = phi; if (!reduce) phi += 0.0015; },
      });
    }).catch(function () {});
  }
  function effects() {
    document.querySelectorAll("[data-q-live]").forEach(function (sec) {
      if (getComputedStyle(sec).display === "none") return;
      sec.querySelectorAll("canvas").forEach(function (cv) {
        if (cv.__q || cv.getBoundingClientRect().width < 50) return;
        cv.__q = 1;
        if (isGlobe(cv)) globe(cv); else stars(cv);
      });
    });
  }
  effects(); addEventListener("resize", effects);

  // "Connected expertise" diagram: a curved connector from the hub's rim to each related page (wide screens; on
  // phones the CSS draws a tree instead). A connector lights up while its page is hovered or focused.
  var SVGNS = "http://www.w3.org/2000/svg";
  function drawMaps() {
    document.querySelectorAll("[data-q-map]").forEach(function (map) {
      var svg = map.querySelector(".q-map-lines"), hub = map.querySelector(".q-map-hub");
      if (!svg || !hub) return;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      if (getComputedStyle(svg).display === "none") return;
      var m = map.getBoundingClientRect(), h = hub.getBoundingClientRect();
      if (!m.width || !h.width) return;
      var hx = h.left + h.width / 2 - m.left, hy = h.top + h.height / 2 - m.top, r = h.width / 2;
      svg.setAttribute("viewBox", "0 0 " + m.width + " " + m.height);
      [].forEach.call(map.querySelectorAll("a.q-node, a.q-chip"), function (a) {
        var b = a.getBoundingClientRect(), onLeft = !!a.closest(".q-map-left");
        var ex = (onLeft ? b.right : b.left) - m.left, ey = b.top + b.height / 2 - m.top;
        var ang = Math.atan2(ey - hy, ex - hx), sx = hx + Math.cos(ang) * (r + 4), sy = hy + Math.sin(ang) * (r + 4);
        var dx = (ex - sx) * 0.55;
        var g = document.createElementNS(SVGNS, "g"), path = document.createElementNS(SVGNS, "path"), dot = document.createElementNS(SVGNS, "circle");
        path.setAttribute("d", "M" + sx + " " + sy + " C" + (sx + dx) + " " + sy + " " + (ex - dx) + " " + ey + " " + ex + " " + ey);
        dot.setAttribute("cx", ex); dot.setAttribute("cy", ey); dot.setAttribute("r", 2.5);
        g.appendChild(path); g.appendChild(dot); svg.appendChild(g);
        a.__qLine = g;
        if (!a.__qLineEvents) {
          a.__qLineEvents = true;
          var on = function () { if (a.__qLine) a.__qLine.classList.add("q-on"); }, off = function () { if (a.__qLine) a.__qLine.classList.remove("q-on"); };
          a.addEventListener("mouseenter", on); a.addEventListener("mouseleave", off); a.addEventListener("focus", on); a.addEventListener("blur", off);
        }
      });
    });
  }
  if (document.querySelector("[data-q-map]")) {
    var mapTimer;
    var redraw = function () { clearTimeout(mapTimer); mapTimer = setTimeout(drawMaps, 60); };
    drawMaps(); addEventListener("load", redraw); addEventListener("resize", redraw);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);
    if (window.ResizeObserver) document.querySelectorAll("[data-q-map]").forEach(function (m) { new ResizeObserver(redraw).observe(m); });
  }

  // Happy Customers: search, industry and business-priority filters over the case library (all in the page; the
  // cards carry data-industry / data-priorities / data-search). Shows 24 at a time with "Load more".
  var filters = document.querySelector("[data-q-filters]"), grid = document.querySelector("[data-q-cases]");
  if (filters && grid) {
    var cases = [].slice.call(grid.children), step = +grid.getAttribute("data-page") || 24, limit = step;
    var fSearch = filters.querySelector(".q-f-search"), fInd = filters.querySelector(".q-f-industry"), fPri = filters.querySelector(".q-f-priority");
    var count = document.querySelector("[data-q-count]"), empty = document.querySelector(".q-cases-empty"), more = document.querySelector(".q-cases-more");
    var apply = function () {
      var words = fSearch.value.toLowerCase().split(/\s+/).filter(Boolean), ind = fInd.value, pri = fPri.value;
      var hits = cases.filter(function (c) {
        if (ind && c.getAttribute("data-industry") !== ind) return false;
        if (pri && (c.getAttribute("data-priorities") || "").split("|").indexOf(pri) < 0) return false;
        var text = c.getAttribute("data-search") || "";
        return words.every(function (w) { return text.indexOf(w) >= 0; });
      });
      cases.forEach(function (c) { c.hidden = true; });
      hits.slice(0, limit).forEach(function (c) { c.hidden = false; });
      if (count) count.textContent = count.getAttribute(hits.length === 1 ? "data-one" : "data-many").replace("{count}", hits.length);
      if (empty) empty.hidden = hits.length > 0;
      if (more) more.hidden = hits.length <= limit;
    };
    var restart = function () { limit = step; apply(); };
    var reset = function () { fSearch.value = ""; fInd.value = ""; fPri.value = ""; restart(); };
    var typing;
    fSearch.addEventListener("input", function () { clearTimeout(typing); typing = setTimeout(restart, 120); });
    fInd.addEventListener("change", restart);
    fPri.addEventListener("change", restart);
    filters.querySelector(".q-f-clear").addEventListener("click", reset);
    if (empty) empty.querySelector(".q-f-reset").addEventListener("click", reset);
    if (more) more.querySelector(".q-f-more").addEventListener("click", function () { limit += step; apply(); });
    // a link can open the library already searched or filtered: /happy?q=managed, ?industry=…, ?priority=…
    try {
      var qs = new URLSearchParams(location.search);
      if (qs.get("q")) fSearch.value = qs.get("q");
      if (qs.get("industry")) fInd.value = qs.get("industry");
      if (qs.get("priority")) fPri.value = qs.get("priority");
    } catch (err) {}
    apply();
  }

  // Top bar (every page, as on the homepage): it blends into the hero; once the page is scrolled, a soft
  // see-through backing keeps it readable
  var navScroll = function () { document.documentElement.classList.toggle("q-v2-scrolled", window.scrollY > 60); };
  navScroll(); addEventListener("scroll", navScroll, { passive: true });

  // /home-v2 hero: the spotlight follows a mouse pointer, easing after it, and drifts back to the top left when the
  // pointer leaves (desktop pointers only). Grid blocks pop out inside the light: around the pointer while it moves,
  // and now and then where the light rests. Reduced motion: the light stays put and nothing pops.
  var light = document.querySelector(".q-v2-light i"), reveal = document.querySelector(".q-v2-reveal");
  if (light && reveal && window.matchMedia && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var hero = light.closest("[data-q-v2]"), tx = 0, ty = 0, x = 0, y = 0, raf = 0, lastPop = 0, lastMove = 0, onScreen = true, live = {};
    var centre = function () { return { x: light.offsetLeft + light.offsetWidth / 2 + x, y: light.offsetTop + light.offsetHeight / 2 + y }; };
    var cellSize = function () { return parseFloat(getComputedStyle(hero).getPropertyValue("--cell")) || 96; };
    // one block rises out of the grid near (px, py), hero coordinates; spread is in cells
    var pop = function (px, py, spread) {
      var cell = cellSize(), rows = Math.floor(hero.offsetHeight / cell) - 1;
      var c = Math.floor((px - hero.offsetWidth / 2) / cell) + Math.round((Math.random() + Math.random() - 1) * spread);
      var r = Math.floor(py / cell) + Math.round((Math.random() + Math.random() - 1) * spread);
      if (r < 1 || r > rows || live[c + ":" + r]) return;
      var key = c + ":" + r, b = document.createElement("i");
      live[key] = 1;
      b.className = "q-v2-pop";
      b.style.setProperty("--c", c);
      b.style.setProperty("--r", r);
      reveal.appendChild(b);
      b.addEventListener("animationend", function () { b.remove(); delete live[key]; });
    };
    var step = function () {
      x += (tx - x) * 0.11; y += (ty - y) * 0.11;
      light.style.setProperty("--dx", x.toFixed(1) + "px");
      light.style.setProperty("--dy", y.toFixed(1) + "px");
      var m = centre(); // the grid reveal follows the light centre
      hero.style.setProperty("--mx", m.x.toFixed(1) + "px");
      hero.style.setProperty("--my", m.y.toFixed(1) + "px");
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(step) : 0;
    };
    var go = function () { if (!raf) raf = requestAnimationFrame(step); };
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect(), now = Date.now();
        tx = e.clientX - r.left - (light.offsetLeft + light.offsetWidth / 2);
        ty = e.clientY - r.top - (light.offsetTop + light.offsetHeight / 2);
        lastMove = now;
        if (now - lastPop > 90) { lastPop = now; pop(e.clientX - r.left, e.clientY - r.top, 1.6); }
        go();
      });
      hero.addEventListener("pointerleave", function () { tx = 0; ty = 0; go(); });
    }
    // where the light rests, a block rises now and then (also on touch screens)
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { onScreen = en[0].isIntersecting; }).observe(hero);
    setInterval(function () {
      if (!onScreen || document.hidden || Date.now() - lastMove < 1200) return;
      var m = centre();
      pop(m.x, m.y, 2.2);
    }, 700);
  }

  // Reveal on scroll (the page head hides .q-reveal only while this runs; see q.css)
  window.Q_REVEAL = true;
  var items = document.querySelectorAll(".q-reveal");
  if (!("IntersectionObserver" in window)) { items.forEach(function (i) { i.classList.add("q-in"); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("q-in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  items.forEach(function (i) { io.observe(i); });
})();
