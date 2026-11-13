// Awards & Recognition: the stage trophy flies down to the winner card's trophy as the page scrolls (see
// awards_fly.css). A fixed copy of the trophy is drawn between the two real trophies:
//  - both trophies are measured on every frame, so the landing is exact even while the card is still sliding in;
//  - the scroll position sets where the flight should be, and the drawn flight eases toward it, so a fast scroll or a
//    jump still shows the whole flight (and scrolling back reverses it);
//  - it spins two turns on its upright axis, arcs slightly sideways, and a gold shine peaks mid-flight.
// At rest at the start the stage trophy shows; at rest at the end the card's own trophy shows (its hover still works).
(function () {
  "use strict";
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var from = document.querySelector("[data-q-aw-from]"), to = document.querySelector("[data-q-aw-to]");
  if (!from || !to) return;
  var d = document.documentElement;
  var layer = document.createElement("div");
  layer.className = "q-aw-flight"; layer.setAttribute("aria-hidden", "true");
  var fly = document.createElement("img");
  fly.className = "q-aw-fly"; fly.alt = ""; fly.src = from.currentSrc || from.src; fly.decoding = "async";
  layer.appendChild(fly);
  document.body.appendChild(layer);

  var shown = null, raf = 0, state = "";
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
  function setState(s) {
    if (s === state) return;
    state = s;
    d.classList.toggle("q-aw-home", s === "home");
    d.classList.toggle("q-aw-landed", s === "landed");
    d.classList.toggle("q-aw-flying", s === "flying");
  }
  function frame() {
    raf = 0;
    var A = box(from), B = box(to);
    if (!A || !B) return;
    var vh = window.innerHeight;
    var s0 = Math.max(0, A.y - vh * 0.18);                 // the flight begins as the stage trophy starts to leave
    var s1 = Math.max(s0 + 1, B.y + B.h / 2 - vh * 0.58);  // and lands when the card trophy sits a little below centre
    var target = Math.min(1, Math.max(0, (scrollY - s0) / (s1 - s0)));
    if (shown === null) shown = target;                      // first frame: start where the page already is
    shown += (target - shown) * 0.16;                        // ease toward the scroll position
    if (Math.abs(target - shown) < 0.002) shown = target;
    if (shown <= 0) setState("home");
    else if (shown >= 1) setState("landed");
    else {
      setState("flying");
      var e = ease(shown), arc = Math.sin(shown * Math.PI); // arc: 0 at both ends, 1 mid-flight
      var x = lerp(A.x, B.x, e) - scrollX, y = lerp(A.y, B.y, e) - scrollY;
      var w = lerp(A.w, B.w, e), h = lerp(A.h, B.h, e);
      fly.style.width = A.w + "px"; fly.style.height = A.h + "px";
      fly.style.transform = "translate3d(" + (x + arc * Math.min(160, innerWidth * 0.12)).toFixed(1) + "px," + y.toFixed(1) + "px,0) scale(" + (w / A.w).toFixed(4) + "," + (h / A.h).toFixed(4) + ") translateX(" + (A.w / 2).toFixed(1) + "px) rotateY(" + (e * 720).toFixed(1) + "deg) rotateZ(" + (arc * -8).toFixed(2) + "deg) translateX(" + (-A.w / 2).toFixed(1) + "px)";
      fly.style.filter = "drop-shadow(0 " + (18 + arc * 16).toFixed(0) + "px " + (22 + arc * 14).toFixed(0) + "px rgba(60,40,0," + (0.3 - arc * 0.08).toFixed(2) + ")) brightness(" + (1 + arc * 0.35).toFixed(2) + ") saturate(" + (1 + arc * 0.25).toFixed(2) + ")";
    }
    if (shown !== target) raf = requestAnimationFrame(frame); // keep easing until it reaches the scroll position
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  addEventListener("scroll", kick, { passive: true });
  addEventListener("resize", kick);
  addEventListener("load", kick);
  to.addEventListener("load", kick);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(kick);
  kick();
})();
