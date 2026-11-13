// /home-v2 only: scroll animations with GSAP + ScrollTrigger (loaded from cdnjs on that page alone).
// Triggers are created top to bottom; only transform and opacity animate; cards use ScrollTrigger.batch; scrubbed
// effects never mix with toggleActions. Reduced motion: nothing here runs and the page's own reveal (q.js) applies.

// the architecture stack ("Depth where it matters"): one soft light follows the cursor across all its parts, each
// part told where the cursor is relative to itself (no GSAP needed, so it also works with reduced motion)
(function () {
  var stack = document.querySelector(".q-stack");
  if (!stack || !window.matchMedia || !matchMedia("(hover: hover)").matches) return;
  var parts = [].slice.call(stack.querySelectorAll(".q-layer")), raf = 0, px = 0, py = 0;
  function paint() {
    raf = 0;
    parts.forEach(function (el) { var r = el.getBoundingClientRect(); el.style.setProperty("--mx", (px - r.left) + "px"); el.style.setProperty("--my", (py - r.top) + "px"); });
  }
  stack.addEventListener("pointermove", function (e) { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(paint); });
  stack.addEventListener("pointerleave", function () { parts.forEach(function (el) { el.style.removeProperty("--mx"); el.style.removeProperty("--my"); }); });
})();

// Happy Customers stories as an open book: each story is a double page; the others stack folded at the sides. Turning
// tweens a position through every spread in between, so the pages riffle; drag or swipe turns them by hand (a flick
// carries on), arrow keys and the buttons turn one, a sideways trackpad swipe turns one. Autoplay every 5 seconds pauses
// on hover or focus, off screen and in a hidden tab, and stops for good once someone turns a page themself. With reduced
// motion the book jumps instead of turning and does not autoplay. The story text under the book follows the spread.
(function () {
  var box = document.querySelector(".q-journal");
  if (!box) return;
  var stage = box.querySelector(".q-jr-stage");
  var items = [].slice.call(box.querySelectorAll(".q-jr-item"));
  var pages = items.map(function (it) { return [].slice.call(it.querySelectorAll(".q-jr-page")); });
  var slides = [].slice.call(box.querySelectorAll(".q-story"));
  var count = box.querySelector(".q-stories-count b");
  var n = items.length, still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var OPEN = 5, SIDE = 80, FOLD = 174; // the open spread's slight V; a stacked page turned in; a page folded shut
  var clamp = function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; };
  var easeInOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var W = 0, pos = 0, target = 0, tween = null, raf = 0, drag = null, touched = false, seen = false, hover = false, timer = 0;

  // the spread width for the stage, leaving room for the stacks; taller pages on a portrait phone
  function aspect(sw, sh) { return sw < 640 && sh > sw ? 0.86 : 1.25; }
  function spreadW(sw, sh) { return sw <= 0 || sh <= 0 ? 0 : Math.round(Math.min(sw * (sw < 640 ? 0.84 : 0.56), sh * 0.9 * aspect(sw, sh), 900)); }
  // where spread p steps from the centre sits: 0 open in the middle, ±1 the first page of each stack, further ones out and back
  function pose(p, w) {
    var d = Math.abs(p), a = d < 1 ? d : 1, s = p < 0 ? -1 : 1, out = d > 1 ? d - 1 : 0, fold = a * a;
    var left = p > 0 ? OPEN + (FOLD - OPEN) * fold : OPEN + (SIDE - OPEN) * a;
    var right = p < 0 ? -(OPEN + (FOLD - OPEN) * fold) : -(OPEN + (SIDE - OPEN) * a);
    var shade = function (deg) { return clamp((Math.abs(deg) - OPEN) / 95, 0, 0.62); };
    return { x: s * (a * (w * 0.53) + out * w * 0.055), z: -(a * w * 0.42 + out * w * 0.06), left: left, right: right, sl: shade(left), sr: shade(right), op: clamp(7.2 - d, 0, 1), hidden: d > 7.2 };
  }
  function paint() {
    if (!W) return;
    for (var i = 0; i < n; i++) {
      var q = pose(i - pos, W), el = items[i];
      if (q.hidden) { el.style.visibility = "hidden"; continue; }
      el.style.visibility = "visible";
      el.style.opacity = q.op;
      el.style.transform = "translate3d(" + q.x.toFixed(2) + "px,0," + q.z.toFixed(2) + "px)";
      pages[i][0].style.transform = "rotateY(" + q.left.toFixed(2) + "deg)";
      pages[i][0].style.setProperty("--s", q.sl.toFixed(3));
      pages[i][1].style.transform = "rotateY(" + q.right.toFixed(2) + "deg)";
      pages[i][1].style.setProperty("--s", q.sr.toFixed(3));
    }
  }
  function frame(t) {
    raf = 0;
    if (tween) {
      var k = tween.dur > 0 ? clamp((t - tween.t0) / tween.dur, 0, 1) : 1;
      pos = tween.from + (tween.to - tween.from) * tween.ease(k);
      if (k >= 1) tween = null;
    }
    paint();
    if (tween) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  function show(k) {
    slides.forEach(function (s, j) {
      var on = j === k, was = s.classList.contains("is-active");
      if (was && !on) { s.classList.add("is-leaving"); setTimeout(function () { s.classList.remove("is-leaving"); }, 320); }
      s.classList.toggle("is-active", on);
      s.removeAttribute("hidden");
      if (on) s.removeAttribute("aria-hidden"); else s.setAttribute("aria-hidden", "true");
    });
    if (count) count.textContent = String(k + 1).padStart(2, "0");
  }
  function go(to, ease) {
    var next = clamp(to, 0, n - 1);
    if (next !== target) { target = next; show(next); }
    var steps = Math.abs(next - pos);
    tween = { from: pos, to: next, t0: performance.now(), dur: still || steps <= 0 ? 0 : Math.round(560 * Math.sqrt(Math.min(steps, 12))), ease: ease || easeInOut };
    kick();
    restart();
  }
  // a reader's own turn: autoplay stops for good
  function byHand() { if (!touched) { touched = true; box.classList.add("is-stopped"); } }
  function restart() {
    clearTimeout(timer);
    box.classList.remove("is-playing");
    if (still || touched || !seen || hover || document.hidden || drag) return;
    void box.offsetWidth; // restart the line's animation
    box.classList.add("is-playing");
    timer = setTimeout(function () { go(target >= n - 1 ? 0 : target + 1); }, 5000);
  }
  function pause(on) { hover = on; box.classList.toggle("is-paused", on); if (on) clearTimeout(timer); else restart(); }

  // measure once per resize; the frame loop only reads the cache
  function measure() {
    var sw = stage.clientWidth, sh = stage.clientHeight;
    W = spreadW(sw, sh);
    box.style.setProperty("--jw", W + "px");
    box.style.setProperty("--jh", Math.round(W / aspect(sw, sh)) + "px");
    paint();
  }
  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(stage);
  measure();
  show(0);

  box.querySelector(".q-stories-prev").addEventListener("click", function () { byHand(); go(target <= 0 ? n - 1 : target - 1); });
  box.querySelector(".q-stories-next").addEventListener("click", function () { byHand(); go(target >= n - 1 ? 0 : target + 1); });
  box.addEventListener("keydown", function (e) {
    var map = { ArrowRight: 1, ArrowLeft: -1, PageDown: 1, PageUp: -1 };
    if (e.key in map) go(target + map[e.key]);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(n - 1);
    else return;
    e.preventDefault();
    byHand();
  });
  box.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") pause(true); });
  box.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") pause(false); });
  box.addEventListener("focusin", function () { pause(true); });
  box.addEventListener("focusout", function (e) { if (!box.contains(e.relatedTarget)) pause(false); });

  // drag: the book follows the pointer; letting go settles on the nearest spread, nudged by the flick. A tap on a
  // stacked spread turns to it.
  stage.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    tween = null;
    drag = { id: e.pointerId, x: e.clientX, from: pos, lastX: e.clientX, lastT: e.timeStamp, v: 0, moved: false };
  });
  stage.addEventListener("pointermove", function (e) {
    var d = drag;
    if (!d || d.id !== e.pointerId || !W) return;
    var dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) { d.moved = true; byHand(); stage.classList.add("is-dragging"); stage.setPointerCapture(e.pointerId); }
    if (!d.moved) return;
    var dt = Math.max(1, e.timeStamp - d.lastT);
    d.v = d.v * 0.6 + (-(e.clientX - d.lastX) / (W * 0.42) / (dt / 1000)) * 0.4;
    d.lastX = e.clientX; d.lastT = e.timeStamp;
    pos = clamp(d.from - dx / (W * 0.42), -0.3, n - 0.7);
    kick();
  });
  function up(e) {
    var d = drag;
    if (!d || d.id !== e.pointerId) return;
    drag = null;
    stage.classList.remove("is-dragging");
    if (d.moved) { go(clamp(Math.round(pos + clamp(d.v * 0.18, -1.5, 1.5)), 0, n - 1), easeOut); return; }
    var hit = e.target.closest && e.target.closest("[data-i]");
    if (hit && +hit.getAttribute("data-i") !== target) { byHand(); go(+hit.getAttribute("data-i")); } else go(target);
  }
  stage.addEventListener("pointerup", up);
  stage.addEventListener("pointercancel", up);
  // a sideways trackpad swipe turns one spread; a vertical wheel still scrolls the page
  var acc = 0, at = 0;
  stage.addEventListener("wheel", function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    acc += e.deltaX;
    if (Math.abs(acc) < 40 || e.timeStamp - at < 320) return;
    at = e.timeStamp; byHand();
    go(target + (acc > 0 ? 1 : -1));
    acc = 0;
  }, { passive: true });

  document.addEventListener("visibilitychange", restart);
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; restart(); }, { threshold: 0.35 }).observe(box);
  else { seen = true; restart(); }
})();
// /stories

// Perspectives coverflow: a fractional position is the one source of truth; every frame poses each cover from its
// distance to it (slide out, recede, tilt, fade), written straight to the DOM. Tilt and recession ease off with
// distance so far covers stay readable. Drag carries a flick (two covers at most); the arrow keys, buttons and dots
// bring a cover to the centre; a tap on a side cover centres it, a tap on the centre cover opens the post.
(function () {
  var box = document.querySelector(".q-cf");
  if (!box) return;
  var frame = box.querySelector(".q-cf-frame");
  var cards = [].slice.call(box.querySelectorAll(".q-cf-card"));
  var caps = [].slice.call(box.querySelectorAll(".q-cf-caption .q-story"));
  var dots = [].slice.call(box.querySelectorAll(".q-cf-dot"));
  var n = cards.length, still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ROTATE = 44, DEPTH = 0.6, FALLOFF = 0.56, FADE = 0.1, GAP = 0.05;
  var start = +box.getAttribute("data-start") || 0;
  var pos = start, target = start, W = 0, raf = 0, drag = null, selected = start, moved = false;
  // A loop (11 Nov): the position runs on without limit and each cover sits at its nearest place around it, so there is
  // always a cover on both sides and "next" after the last post brings the first one in from the right. A cover fades
  // out as it reaches the far edge (half the covers away), so it never visibly jumps from one side to the other.
  var clamp = function (v) { return v; };
  var mod = function (k) { return ((k % n) + n) % n; };
  var toward = function (j) { var cur = Math.round(target), d = mod(j - cur); if (d > n / 2) d -= n; return cur + d; };
  var EDGE = n / 2;
  // Tilt and recession by distance from the centre. Rounded off right at the centre (12 Nov), so a cover gliding
  // through turns smoothly instead of snapping; unchanged at one cover away and beyond.
  var SOFT = 0.25, NORM = Math.pow(Math.sqrt(1 + SOFT * SOFT) - SOFT, FALLOFF);
  var rampOf = function (d) { return Math.pow(Math.sqrt(d * d + SOFT * SOFT) - SOFT, FALLOFF) / NORM; };

  function paint() {
    if (!W) return;
    var pitch = W * (1 + GAP);
    cards.forEach(function (c, i) {
      var off = mod(i - pos); if (off > EDGE) off -= n;
      var d = Math.abs(off), ramp = rampOf(d);
      var tilt = Math.min(ROTATE * ramp, 82) * Math.sign(off);
      c.style.transform = "translateX(calc(-50% + " + (off * pitch).toFixed(2) + "px)) translateZ(" + (-DEPTH * W * ramp).toFixed(2) + "px) rotateY(" + (-tilt).toFixed(2) + "deg)";
      var o = 1 - FADE * d;
      if (d > EDGE - 0.5) o *= Math.max(0, (EDGE - d) / 0.5);
      c.style.opacity = Math.max(0, o);
      c.style.zIndex = 100 - Math.round(d);
    });
  }
  function select(k) {
    k = mod(k);
    if (k === selected) return;
    var old = caps[selected];
    if (old) { old.classList.remove("is-active"); old.classList.add("is-leaving"); old.setAttribute("aria-hidden", "true"); setTimeout(function () { old.classList.remove("is-leaving"); }, 320); }
    selected = k;
    caps[k].classList.add("is-active");
    caps[k].removeAttribute("aria-hidden");
    dots.forEach(function (d, j) { if (j === k) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
  }
  // an exponential ease-out towards the target (no overshoot)
  function settle(to) {
    cancelAnimationFrame(raf);
    target = clamp(to);
    select(Math.round(target));
    if (still) { pos = target; paint(); return; }
    (function step() {
      var rem = target - pos;
      if (Math.abs(rem) < 0.0004) { pos = target; paint(); raf = 0; return; }
      pos += rem * 0.16;
      paint();
      raf = requestAnimationFrame(step);
    })();
  }
  function nudge(by) { settle(Math.round(target) + by); }

  function measure() { W = cards[0] ? cards[0].offsetWidth : 0; paint(); }
  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(frame);
  measure();

  // Continuous glide (12 Nov): the covers drift slowly and loop for ever. It holds still while the visitor is using it
  // (pressing, dragging, keyboard focus inside) and for a few seconds after any arrow, dot or cover is used; it also
  // stops off screen, in a hidden tab, and never runs for visitors who ask for reduced motion.
  // pace: one post every 4 s (12 Nov, was 5.5 s); it eases up to that speed after any pause instead of starting at once
  var SPEED = 1 / 4, vel = 0, quietUntil = 0, onScreen = true, lastT = 0;
  var hush = function () { quietUntil = Date.now() + 6000; };
  if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { onScreen = en[0].isIntersecting; }, { threshold: 0.2 }).observe(box);
  ["pointerdown", "keydown"].forEach(function (ev) { box.addEventListener(ev, hush, true); });
  box.addEventListener("click", hush, true);
  function glide(t) {
    requestAnimationFrame(glide);
    var dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0;
    lastT = t;
    if (still || drag || raf || !W || !onScreen || document.hidden || Date.now() < quietUntil || box.contains(document.activeElement)) { vel = 0; return; }
    vel += (SPEED - vel) * Math.min(1, dt * 1.5);
    pos += vel * dt; target = pos;
    select(Math.round(pos));
    paint();
  }
  requestAnimationFrame(glide);

  box.querySelector(".q-cf-prev").addEventListener("click", function () { nudge(-1); });
  box.querySelector(".q-cf-next").addEventListener("click", function () { nudge(1); });
  dots.forEach(function (d, j) { d.addEventListener("click", function () { settle(toward(j)); }); });
  frame.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { e.preventDefault(); nudge(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); nudge(1); }
  });
  frame.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    cancelAnimationFrame(raf); raf = 0;
    target = pos; moved = false;
    drag = { id: e.pointerId, x: e.clientX, pos: pos, v: 0, t: performance.now() };
  });
  frame.addEventListener("pointermove", function (e) {
    var d = drag;
    if (!d || d.id !== e.pointerId || !W) return;
    if (!moved && Math.abs(e.clientX - d.x) > 6) { moved = true; frame.setPointerCapture(e.pointerId); frame.classList.add("is-dragging"); }
    if (!moved) return;
    var now = performance.now(), prev = pos;
    pos = clamp(d.pos - (e.clientX - d.x) / (W * (1 + GAP)));
    d.v = ((pos - prev) / Math.max(now - d.t, 1)) * 1000; // covers per second, for the throw
    d.t = now;
    select(Math.round(pos));
    paint();
  });
  function end(e) {
    var d = drag;
    if (!d || d.id !== e.pointerId) return;
    drag = null;
    frame.classList.remove("is-dragging");
    if (moved) settle(Math.round(pos + Math.max(-2, Math.min(2, d.v * 0.18))));
  }
  frame.addEventListener("pointerup", end);
  frame.addEventListener("pointercancel", end);
  // a drag never opens a post; a tap on a side cover centres it, a tap on the centre cover opens its post
  cards.forEach(function (c, i) {
    c.style.cursor = "pointer";
    c.addEventListener("click", function () {
      if (moved) { moved = false; return; }
      if (i !== mod(Math.round(target))) settle(toward(i));
      else if (c.getAttribute("data-href")) location.href = c.getAttribute("data-href");
    });
  });
})();
// /coverflow

// link names: the top bar's logo link and the footer's social icons carry only pictures, so screen readers had
// nothing to announce; each gets a name (nothing visible changes)
(function () {
  var names = { "Quadra Logo": "Quadra home", X: "Quadra on X", facebook: "Quadra on Facebook", linkedin: "Quadra on LinkedIn", instagram: "Quadra on Instagram", youtube: "Quadra on YouTube" };
  [].forEach.call(document.querySelectorAll("a[data-framer-name]"), function (el) {
    var n = names[el.getAttribute("data-framer-name")];
    if (n && !el.getAttribute("aria-label") && !el.textContent.trim()) el.setAttribute("aria-label", n);
  });
})();
// /link names

(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  var root = document.documentElement;
  root.classList.add("q-gsap"); // q.css: the page's own reveal steps aside (no CSS transitions fighting GSAP)
  var $$ = function (sel, el) { return [].slice.call((el || document).querySelectorAll(sel)); };
  // the page's own reveal hides .q-reveal until q.js shows it: show them all now, GSAP sets its own start states
  $$(".q-reveal").forEach(function (el) { el.classList.add("q-in"); });

  // wrap each word of a heading in a clipping span, keeping its inline markup (colour spans, line breaks)
  function words(el) {
    if (!el || el.__qw) return el ? el.__qw : [];
    var out = [], walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (t) {
      var parts = t.nodeValue.split(/(\s+)/), frag = document.createDocumentFragment();
      parts.forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
        var w = document.createElement("span"), i = document.createElement("span");
        w.className = "q-w"; i.className = "q-wi"; i.textContent = p;
        w.appendChild(i); frag.appendChild(w); out.push(i);
      });
      t.parentNode.replaceChild(frag, t);
    });
    el.__qw = out;
    return out;
  }
  var rise = { yPercent: 110, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.06 };
  // once: play the first time it is reached and stay (no reverse when scrolling back above it)
  function riseIn(targets, trigger, start, once) {
    if (!targets.length) return;
    gsap.from(targets, Object.assign({}, rise, { scrollTrigger: { trigger: trigger, start: start || "top 85%", toggleActions: once ? "play none none none" : "play none none reverse", once: !!once } }));
  }
  function fadeUp(targets, trigger, opts) {
    if (!targets || (targets.length !== undefined && !targets.length)) return;
    gsap.from(targets, Object.assign({ y: 36, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: trigger, start: "top 86%", toggleActions: "play none none reverse" } }, opts || {}));
  }

  // 1. hero: as it scrolls away the text drifts up and fades; the grid and light move slower behind it (depth)
  var hero = document.querySelector("[data-q-v2]");
  if (hero) {
    var col = [].slice.call(hero.children).filter(function (c) { return c.querySelector && c.querySelector("h1"); })[0];
    var heroST = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
    // explicit start values: the opening sequence (q.css) still holds the light at opacity 0 when these are created,
    // and a plain .to() would take that 0 as its start, so the light vanished once the opening ended
    if (col) gsap.fromTo(col, { yPercent: 0, opacity: 1 }, { yPercent: -14, opacity: 0.15, ease: "none", scrollTrigger: heroST });
    gsap.to(hero.querySelector(".q-v2-grid"), { y: 140, ease: "none", scrollTrigger: Object.assign({}, heroST) });
    gsap.fromTo(hero.querySelector(".q-v2-light"), { y: 0, opacity: 1 }, { y: 200, opacity: 0.4, ease: "none", scrollTrigger: Object.assign({}, heroST) });
  }

  // 2. recognition: the heading rises word by word; the globe rises into place and turns toward India as it arrives
  var globeSec = document.querySelector("[data-q-v2-globe]:not([hidden])");
  $$("[data-q-v2-globe]").forEach(function (s) { if (s.offsetParent) globeSec = s; });
  if (globeSec) {
    $$("h2", globeSec).forEach(function (h) { if (h.offsetParent) riseIn(words(h), h, "top 88%"); });
    var pill = $$("[data-framer-name='Content'] > *", globeSec).filter(function (e) { return e.offsetParent && !e.querySelector("h2"); });
    fadeUp(pill, globeSec, { scrollTrigger: { trigger: globeSec, start: "top 80%", toggleActions: "play none none reverse" } });
    window.Q_GLOBE_SCROLL = 0; // q.js: 0 = turned away, 1 = facing India
    ST.create({ trigger: globeSec, start: "top bottom", end: "top 15%", onUpdate: function (self) { window.Q_GLOBE_SCROLL = self.progress; }, onRefresh: function (self) { window.Q_GLOBE_SCROLL = self.progress; } });
    (function waitForGlobe(n) { // q.js draws the globe on its own canvas once its map has loaded
      var cv = globeSec.querySelector("canvas.q-v2-globe-canvas");
      if (!cv) { if (n < 60) setTimeout(function () { waitForGlobe(n + 1); }, 100); return; }
      // the branch names (their own canvas, 13 Nov) rise with the globe
      var lb = globeSec.querySelector("canvas.q-v2-globe-labels");
      gsap.fromTo(lb ? [cv, lb] : cv, { y: 160, opacity: 0.2 }, { y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: globeSec, start: "top bottom", end: "top 20%", scrub: 0.6 } });
      ST.refresh();
    })(0);
  }

  // 3. partner recognition (the live logo section): heading words, then its logos one after another (they are SVGs)
  $$("[data-q-live]").forEach(function (s) {
    if (s === globeSec || !s.offsetParent || s.hasAttribute("data-q-v2-globe")) return;
    $$("h1, h2, h3", s).forEach(function (h) { if (h.offsetParent) riseIn(words(h), h); });
    fadeUp($$("img, .svgContainer", s).filter(function (i) { return i.offsetParent; }), s, { stagger: 0.12, scrollTrigger: { trigger: s, start: "top 75%", toggleActions: "play none none reverse" } });
  });

  // the new sections, top to bottom
  var sections = $$(".q-wrap > .q-section");
  sections.forEach(function (sec) {
    var head = sec.querySelector(".q-head"), h2 = head && head.querySelector(".q-h2");
    var isStatement = head && head.querySelector(".q-lede") && !sec.querySelector(".q-grid, .q-chips, .q-stories, .q-cf, .q-compass-stage, .q-cta-card, .q-panel");
    if (isStatement) {
      // 4. the one-line statement ("One Architect…") lights up word by word as you scroll through it
      var ws = words(h2).concat(words(head.querySelector(".q-lede")));
      // finishes as the statement reaches the middle of the screen, so it is fully lit while it is being read
      gsap.fromTo(ws, { opacity: 0.14 }, { opacity: 1, ease: "none", stagger: 0.05, scrollTrigger: { trigger: sec, start: "top 80%", end: "center 50%", scrub: 0.5 } });
      fadeUp($$(".q-actions > *", sec), sec, { scrollTrigger: { trigger: sec, start: "top 40%", toggleActions: "play none none reverse" } });
      // the blueprint scene: the grid fades in, the threads and the path draw themselves in, the stage rings pop
      // in one after another, the labels settle, then the point of light starts along the path (once)
      var art = sec.querySelector(".q-arch-art");
      if (art) {
        var draws = $$(".q-arch-draw", art);
        draws.forEach(function (pth) { var L = pth.getTotalLength(); pth.style.strokeDasharray = L; pth.style.strokeDashoffset = L; });
        var atl = gsap.timeline({ scrollTrigger: { trigger: art, start: "top 82%", once: true }, onComplete: function () { art.classList.add("is-drawn"); } });
        atl.from($$(".q-bp-grid", art), { opacity: 0, duration: 1, ease: "power2.out" })
          .to(draws, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", stagger: 0.1 }, 0.2)
          .from($$(".q-bp-node", art), { scale: 0, transformOrigin: "50% 50%", duration: 0.6, ease: "back.out(2)", stagger: 0.22 }, 0.7)
          .from($$(".q-bp-pill, .q-bp-stage", art), { opacity: 0, y: 8, duration: 0.6, ease: "power2.out", stagger: 0.06 }, 0.9);
      }
      return;
    }
    if (head) {
      // 5. section headings: words rise; the kicker and lede follow. The Compass section plays its heading once only,
      //    with its chat opening (compass.js), the first time it is reached.
      var once = !!sec.querySelector(".q-compass-stage");
      riseIn(words(h2), head, null, once);
      fadeUp([].slice.call(head.children).filter(function (c) { return c !== h2; }), head, once ? { delay: 0.15, scrollTrigger: { trigger: head, start: "top 86%", toggleActions: "play none none none", once: true } } : { delay: 0.15 });
    }
    // 6. the expertise chips pop in one after another
    var chips = $$(".q-chip", sec);
    if (chips.length) gsap.from(chips, { scale: 0.86, opacity: 0, duration: 0.6, ease: "back.out(1.6)", stagger: 0.05, scrollTrigger: { trigger: sec.querySelector(".q-chips"), start: "top 88%", toggleActions: "play none none reverse" } });
    // 6d. the coverflow: the row of covers rises into place as a whole (the covers are posed by its own script), then
    //     the caption follows (once)
    var flow = sec.querySelector(".q-cf");
    if (flow) {
      gsap.timeline({ scrollTrigger: { trigger: flow, start: "top 80%", once: true } })
        .from(flow.querySelector(".q-cf-wrap"), { opacity: 0, y: 60, duration: 1, ease: "power3.out", clearProps: "opacity,transform" })
        .from(flow.querySelector(".q-cf-caption"), { opacity: 0, y: 24, duration: 0.7, ease: "power3.out", clearProps: "opacity,transform" }, 0.35);
    }
    // 6c. the story stack: the book rises into place as a whole (its pages are posed by the book's own script), then the
    //     story text and buttons rise (once)
    var stories = sec.querySelector(".q-stories");
    if (stories) {
      gsap.timeline({ scrollTrigger: { trigger: stories, start: "top 80%", once: true } })
        .from(stories.querySelector(".q-jr-stage"), { opacity: 0, y: 60, duration: 1, ease: "power3.out", clearProps: "opacity,transform" })
        .from(stories.querySelector(".q-stories-copy"), { opacity: 0, y: 24, duration: 0.7, ease: "power3.out", clearProps: "opacity,transform" }, 0.35);
    }
    // 6b. the architecture stack builds itself from the foundation up: the layers rise in from the bottom one,
    //     the Cybersecurity column grows down beside them, then the operations base settles in (once)
    var stack = sec.querySelector(".q-stack");
    if (stack) {
      var layers = $$(".q-layer-l1, .q-layer-l2, .q-layer-l3, .q-layer-l4", stack).reverse();
      var stl = gsap.timeline({ scrollTrigger: { trigger: stack, start: "top 80%", once: true } });
      stl.from(layers, { opacity: 0, y: 34, duration: 0.7, ease: "power3.out", stagger: 0.12 })
        .from(stack.querySelector(".q-layer-sec"), { opacity: 0, clipPath: "inset(0 0 100% 0 round 18px)", duration: 0.9, ease: "power2.inOut" }, 0.25)
        .from(stack.querySelector(".q-layer-ops"), { opacity: 0, y: 24, duration: 0.7, ease: "power3.out" }, 0.55)
        .set(stack.querySelector(".q-layer-sec"), { clearProps: "clipPath" });
    }
    // 7. the call to action grows into place
    var cta = sec.querySelector(".q-cta-card");
    if (cta) {
      gsap.fromTo(cta, { scale: 0.9, opacity: 0.35 }, { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: cta, start: "top bottom", end: "top 55%", scrub: 0.6 } });
      riseIn(words(cta.querySelector(".q-h2")), cta, "top 75%");
    }
    // the newsletter panel comes up as one piece (the Compass builds itself: compass.js)
    fadeUp($$(".q-panel", sec), sec, { y: 50 });
    // section buttons
    fadeUp($$(":scope > .q-container > .q-actions > *", sec), sec.querySelector(":scope > .q-container > .q-actions") || sec, { scrollTrigger: { trigger: sec.querySelector(":scope > .q-container > .q-actions") || sec, start: "top 92%", toggleActions: "play none none reverse" } });
  });

  // 8. cards rise in, row by row, as they arrive
  var cards = $$(".q-wrap .q-card, .q-wrap .q-notch-card");
  if (cards.length) {
    gsap.set(cards, { opacity: 0, y: 50 });
    ST.batch(cards, {
      start: "top 90%", interval: 0.12, batchMax: 3,
      onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, overwrite: true }); },
      onLeaveBack: function (b) { gsap.to(b, { opacity: 0, y: 50, duration: 0.4, overwrite: true }); },
    });
  }
  // 9. the perspective images drift slightly inside their own clipping frame as the page moves (the frame keeps the
  //    enlarged image off the card's text and inside the page width)
  $$(".q-wrap .q-card.q-cover img").forEach(function (img) {
    var frame = document.createElement("span");
    frame.className = "q-cover-frame";
    img.parentNode.insertBefore(frame, img);
    frame.appendChild(img);
    gsap.fromTo(img, { yPercent: -6, scale: 1.14 }, { yPercent: 6, scale: 1.14, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true } });
  });

  // positions change once fonts, images and the globe settle
  var refresh = function () { ST.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  addEventListener("load", refresh);
  setTimeout(refresh, 1800);
})();
