// Awards & Recognition: one trophy travels down the page as it scrolls (see awards_fly.css). It starts on the stage
// ([data-q-aw-from]), flies to the trophy in the 2026 winner card ([data-q-aw-to]), and on further scrolling flies on to
// the trophy in the "Winner and Finalists" panel ([data-q-aw-to2]). Scrolling back retraces the flights.
//  - every stop is measured on every frame, so each landing is exact even while cards are still sliding in;
//  - the scroll position sets where the trophy should be, and the drawn trophy eases toward it, so a fast scroll or
//    a jump still shows the whole flight;
//  - in flight it shrinks or grows to the next trophy's size, spins two turns on its upright axis, arcs sideways
//    (alternating sides per flight) and a gold shine peaks mid-flight.
// At rest, the real trophy at that stop shows (so the cards' hover effects still work).
(function () {
  "use strict";
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var stops = [document.querySelector("[data-q-aw-from]"), document.querySelector("[data-q-aw-to]"), document.querySelector("[data-q-aw-to2]")].filter(Boolean);
  if (stops.length < 2) return;
  var d = document.documentElement;
  var layer = document.createElement("div");
  layer.className = "q-aw-flight"; layer.setAttribute("aria-hidden", "true");
  var fly = document.createElement("img");
  fly.className = "q-aw-fly"; fly.alt = ""; fly.src = stops[0].currentSrc || stops[0].src; fly.decoding = "async";
  layer.appendChild(fly);
  document.body.appendChild(layer);

  var shown = null, raf = 0, hidden = [];
  var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }; // ease-in-out
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  // a trophy's drawn box in page coordinates (object-fit: contain keeps the image's own aspect ratio)
  function box(img) {
    var r = img.getBoundingClientRect(), ar = (img.naturalWidth || 256) / (img.naturalHeight || 640);
    var w = r.width, h = r.height;
    if (!w || !h) return null;
    if (w / h > ar) { var nw = h * ar; return { x: r.left + (w - nw) / 2 + scrollX, y: r.top + scrollY, w: nw, h: h }; }
    var nh = w / ar; return { x: r.left + scrollX, y: r.top + (h - nh) / 2 + scrollY, w: w, h: nh };
  }
  // hide exactly these real trophies (the two ends of the flight in progress), show the rest
  function hide(list) {
    if (list.length === hidden.length && list.every(function (x, i) { return x === hidden[i]; })) return;
    hidden.forEach(function (el) { el.style.visibility = ""; });
    list.forEach(function (el) { el.style.visibility = "hidden"; });
    hidden = list;
  }
  function frame() {
    raf = 0;
    var boxes = stops.map(box);
    if (boxes.some(function (b) { return !b; })) return;
    var vh = window.innerHeight;
    // scroll range of each flight: leave when the trophy's middle passes 40% of the screen (the stage: when its top
    // passes 18%), land when the next trophy's middle sits at 58%
    var target = 0;
    for (var k = 0; k < boxes.length - 1; k++) {
      var A = boxes[k], B = boxes[k + 1];
      var s0 = k === 0 ? A.y - vh * 0.18 : A.y + A.h / 2 - vh * 0.4;
      var s1 = Math.max(s0 + 1, B.y + B.h / 2 - vh * 0.58);
      if (scrollY >= s1) { target = k + 1; continue; }
      if (scrollY > s0) target = k + (scrollY - s0) / (s1 - s0);
      break;
    }
    if (shown === null) shown = target;                      // first frame: start where the page already is
    shown += (target - shown) * 0.16;                        // ease toward the scroll position
    if (Math.abs(target - shown) < 0.002) shown = target;

    var seg = Math.min(boxes.length - 2, Math.floor(shown)), p = shown - seg;
    if (p <= 0.0005 || p >= 0.9995) {                        // at rest on a stop: the real trophy shows
      d.classList.remove("q-aw-flying");
      layer.style.visibility = "hidden";
      hide([]);
    } else {
      d.classList.add("q-aw-flying");
      layer.style.visibility = "visible";
      hide([stops[seg], stops[seg + 1]]);
      var A2 = boxes[seg], B2 = boxes[seg + 1], e = ease(p), arc = Math.sin(p * Math.PI), side = seg % 2 ? -1 : 1;
      var x = lerp(A2.x, B2.x, e) - scrollX, y = lerp(A2.y, B2.y, e) - scrollY;
      var w = lerp(A2.w, B2.w, e), h = lerp(A2.h, B2.h, e);
      fly.style.width = A2.w + "px"; fly.style.height = A2.h + "px";
      fly.style.transform = "translate3d(" + (x + side * arc * Math.min(160, innerWidth * 0.12)).toFixed(1) + "px," + y.toFixed(1) + "px,0) scale(" + (w / A2.w).toFixed(4) + "," + (h / A2.h).toFixed(4) + ") translateX(" + (A2.w / 2).toFixed(1) + "px) rotateY(" + (e * 720).toFixed(1) + "deg) rotateZ(" + (side * arc * -8).toFixed(2) + "deg) translateX(" + (-A2.w / 2).toFixed(1) + "px)";
      fly.style.filter = "drop-shadow(0 " + (18 + arc * 16).toFixed(0) + "px " + (22 + arc * 14).toFixed(0) + "px rgba(60,40,0," + (0.3 - arc * 0.08).toFixed(2) + ")) brightness(" + (1 + arc * 0.35).toFixed(2) + ") saturate(" + (1 + arc * 0.25).toFixed(2) + ")";
    }
    if (shown !== target) raf = requestAnimationFrame(frame); // keep easing until it reaches the scroll position
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  addEventListener("scroll", kick, { passive: true });
  addEventListener("resize", kick);
  addEventListener("load", kick);
  stops.forEach(function (s) { s.addEventListener("load", kick); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(kick);
  kick();
})();
