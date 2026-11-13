// Awards & Recognition: one trophy travels down the page as it scrolls (styles in awards_fly.css; Awards page only).
// Stops: the stage ([data-q-aw-from]) → the 2026 winner card ([data-q-aw-to]) → the "Winner and Finalists" panel
// ([data-q-aw-to2]); scrolling back retraces them. Techniques from scroll-travel product sites:
//  - scrubbed by scroll with inertia: the scroll position sets where the trophy should be, the drawn trophy eases
//    toward it (a fast scroll still shows the whole journey);
//  - a turntable on the stage: the trophy turns as scrolling begins, then lifts off from that angle;
//  - a curved (cubic Bézier) path between stops, swinging to alternating sides, with a slight swell toward the viewer
//    mid-flight, two full turns and a little tilt;
//  - real volume: stacked copies of the trophy give it an edge when it is side-on; a highlight sweeps with the turn;
//  - a faint motion trail and gold sparkles; on arrival the real trophy settles and its card glows briefly.
// Every stop is measured on every frame, so landings are exact even while cards are still sliding in.
(function () {
  "use strict";
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var stops = [document.querySelector("[data-q-aw-from]"), document.querySelector("[data-q-aw-to]"), document.querySelector("[data-q-aw-to2]")].filter(Boolean);
  if (stops.length < 2) return;
  var d = document.documentElement, src = stops[0].currentSrc || stops[0].src;

  // ---- the travelling trophy ----
  var layer = document.createElement("div");
  layer.className = "q-aw-flight"; layer.setAttribute("aria-hidden", "true");
  var fly = document.createElement("div"); fly.className = "q-aw-fly";
  var body = document.createElement("div"); body.className = "q-aw-body";
  var LAYERS = 9, slabs = [];
  for (var i = 0; i < LAYERS; i++) {
    var im = document.createElement("img");
    im.src = src; im.alt = ""; im.decoding = "async";
    if (i > 0 && i < LAYERS - 1) im.className = "q-aw-edge";
    body.appendChild(im); slabs.push(im);
  }
  var sheen = document.createElement("div"); sheen.className = "q-aw-sheen"; sheen.style.setProperty("--src", "url(" + src + ")");
  body.appendChild(sheen);
  fly.appendChild(body);
  var ghosts = [0, 1].map(function () { var g = document.createElement("img"); g.className = "q-aw-ghost"; g.src = src; g.alt = ""; layer.appendChild(g); return g; });
  layer.appendChild(fly);
  document.body.appendChild(layer);

  var shown = null, raf = 0, hidden = [], restAt = 0, wasFlying = false, history = [], frameNo = 0, sparks = 0;
  var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }; // ease-in-out
  var clamp = function (v) { return Math.min(1, Math.max(0, v)); };
  var bez = function (a, b, c, e, t) { var u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * e; };
  // drawn box in page coordinates: the element's own size (not its turned or settling outline) around its on-screen
  // centre; object-fit: contain keeps the image's aspect ratio
  function box(img) {
    var r = img.getBoundingClientRect(), ar = (img.naturalWidth || 256) / (img.naturalHeight || 640);
    var w = img.offsetWidth || r.width, h = img.offsetHeight || r.height;
    if (!w || !h) return null;
    var cx = r.left + r.width / 2 + scrollX, cy = r.top + r.height / 2 + scrollY;
    if (w / h > ar) w = h * ar; else h = w / ar;
    return { x: cx - w / 2, y: cy - h / 2, w: w, h: h };
  }
  function hide(list) { // hide exactly these real trophies (the two ends of the flight in progress)
    if (list.length === hidden.length && list.every(function (x, k) { return x === hidden[k]; })) return;
    hidden.forEach(function (el) { el.style.visibility = ""; });
    list.forEach(function (el) { el.style.visibility = "hidden"; });
    hidden = list;
  }
  function arrive(k) { // the real trophy settles; its card glows
    var t = stops[k], card = t.closest(".q-card");
    [[t, "q-aw-settle"], [card, "q-aw-glow"]].forEach(function (pair) {
      if (!pair[0]) return;
      pair[0].classList.remove(pair[1]); void pair[0].offsetWidth; pair[0].classList.add(pair[1]);
      setTimeout(function () { pair[0].classList.remove(pair[1]); }, 950);
    });
  }
  function spark(x, y) {
    if (sparks > 28) return;
    var s = document.createElement("i");
    s.className = "q-aw-spark";
    s.style.cssText = "--x:" + x.toFixed(0) + "px;--y:" + y.toFixed(0) + "px;--dx:" + (Math.random() * 60 - 30).toFixed(0) + "px;--dy:" + (Math.random() * 40 + 12).toFixed(0) + "px";
    sparks++;
    s.addEventListener("animationend", function () { s.remove(); sparks--; });
    layer.appendChild(s);
  }

  function frame() {
    raf = 0; frameNo++;
    var boxes = stops.map(box);
    if (boxes.some(function (b) { return !b; })) return;
    var vh = innerHeight, vw = innerWidth;
    // scroll range of each flight: leave when the trophy's middle passes 40% of the screen (the stage: its top passes
    // 18%), land when the next trophy's middle sits at 58%
    var target = 0, starts = [];
    for (var k = 0; k < boxes.length - 1; k++) {
      var A = boxes[k], B = boxes[k + 1];
      var s0 = k === 0 ? A.y - vh * 0.18 : A.y + A.h / 2 - vh * 0.4;
      var s1 = Math.max(s0 + 1, B.y + B.h / 2 - vh * 0.58);
      starts.push(s0);
      if (scrollY >= s1) { target = k + 1; continue; }
      if (scrollY > s0) target = k + (scrollY - s0) / (s1 - s0);
      break;
    }
    if (shown === null) shown = target;
    var before = shown;
    shown += (target - shown) * 0.14;                        // scrub with inertia
    if (Math.abs(target - shown) < 0.002) shown = target;

    // turntable on the stage: the trophy turns from -16° to +16° over the last stretch before it lifts off
    var turnFrom = starts[0] - vh * 0.6;
    var yaw = -16 + 32 * clamp((scrollY - turnFrom) / (vh * 0.6));
    stops[0].style.transform = "rotateY(" + yaw.toFixed(1) + "deg)";

    var seg = Math.min(boxes.length - 2, Math.floor(shown)), p = shown - seg;
    if (p <= 0.0005 || p >= 0.9995) {                        // at rest: the real trophy shows
      var at = p >= 0.9995 ? seg + 1 : seg;
      if (wasFlying && at !== restAt) arrive(at);
      restAt = at; wasFlying = false;
      layer.style.visibility = "hidden";
      ghosts.forEach(function (g) { g.style.opacity = 0; });
      history.length = 0;
      hide([]);
    } else {
      wasFlying = true;
      layer.style.visibility = "visible";
      hide([stops[seg], stops[seg + 1]]);
      var a = boxes[seg], b = boxes[seg + 1], e = ease(p), arc = Math.sin(p * Math.PI), side = seg % 2 ? -1 : 1;
      // curved path between the trophies' centres (control points swing out to one side)
      var ax = a.x + a.w / 2, ay = a.y + a.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2, dy = by - ay;
      var off = side * Math.min(240, vw * 0.2);
      var cx = bez(ax, ax + off, bx + off * 0.8, bx, e) - scrollX, cy = bez(ay, ay + dy * 0.25, by - dy * 0.3, by, e) - scrollY;
      var swell = 1 + 0.1 * arc;
      var w = (a.w + (b.w - a.w) * e) * swell, h = (a.h + (b.h - a.h) * e) * swell;
      var sx = w / a.w, sy = h / a.h;
      fly.style.width = a.w + "px"; fly.style.height = a.h + "px";
      var place = "translate3d(" + (cx - w / 2).toFixed(1) + "px," + (cy - h / 2).toFixed(1) + "px,0) scale(" + sx.toFixed(4) + "," + sy.toFixed(4) + ")";
      fly.style.transform = place;
      // the turn: from the turntable's angle (first flight) or face-on, two full turns, with a lift and a lean
      var startYaw = seg === 0 ? 16 : 0, rot = startYaw + e * (720 - startYaw);
      body.style.transform = "rotateY(" + rot.toFixed(1) + "deg) rotateX(" + (arc * 10).toFixed(1) + "deg) rotateZ(" + (side * arc * -7).toFixed(1) + "deg)";
      var depth = a.w * 0.07;                                   // the trophy's thickness
      slabs.forEach(function (im, n) { im.style.transform = "translateZ(" + (((n / (LAYERS - 1)) - 0.5) * depth).toFixed(2) + "px)"; });
      var rad = rot * Math.PI / 180;
      sheen.style.setProperty("--sx", (50 + 70 * Math.sin(rad)).toFixed(1) + "%");
      sheen.style.opacity = (0.35 + 0.65 * Math.abs(Math.cos(rad)) * arc).toFixed(2);
      fly.style.filter = "drop-shadow(0 " + (18 + arc * 18).toFixed(0) + "px " + (22 + arc * 16).toFixed(0) + "px rgba(60,40,0," + (0.3 - arc * 0.08).toFixed(2) + ")) brightness(" + (1 + arc * 0.3).toFixed(2) + ") saturate(" + (1 + arc * 0.25).toFixed(2) + ")";
      // motion trail: the trophy as it was a few frames ago
      var moving = Math.abs(shown - before) > 0.0015;
      history.unshift({ place: place, w: a.w, h: a.h });
      if (history.length > 10) history.pop();
      ghosts.forEach(function (g, n) {
        var past = history[n === 0 ? 4 : 9];
        if (!past || !moving) { g.style.opacity = 0; return; }
        g.style.width = past.w + "px"; g.style.height = past.h + "px";
        g.style.transform = past.place;
        g.style.opacity = ((n === 0 ? 0.22 : 0.11) * arc).toFixed(3);
      });
      if (moving && frameNo % 2 === 0 && arc > 0.15) spark(cx + (Math.random() - 0.5) * w * 0.5, cy + (Math.random() - 0.2) * h * 0.4);
    }
    if (shown !== target) raf = requestAnimationFrame(frame);  // keep easing until it reaches the scroll position
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  addEventListener("scroll", kick, { passive: true });
  addEventListener("resize", kick);
  addEventListener("load", kick);
  stops.forEach(function (s) { s.addEventListener("load", kick); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(kick);
  kick();
})();
