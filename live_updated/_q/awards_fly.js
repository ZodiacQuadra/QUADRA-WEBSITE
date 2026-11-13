// Awards & Recognition: the stage trophy flies down to the winner card's trophy as the page scrolls (see
// awards_fly.css). A fixed copy is placed from the two real trophies' positions every frame the page scrolls:
// position and size are eased between them, it spins two turns on its upright axis, and a gold shine peaks mid-flight.
// At the start the stage trophy shows; at the end the card's own trophy shows (so its hover effect still works).
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

  var A, B, s0, s1, ticking = false;
  // ease-in-out for movement on screen (cubic-bezier(.77,0,.175,1) shape, as a smooth function of scroll progress)
  var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  // a trophy's drawn box in page coordinates (object-fit: contain keeps the image's own aspect ratio)
  function box(img) {
    var r = img.getBoundingClientRect(), ar = (img.naturalWidth || 256) / (img.naturalHeight || 640);
    var w = r.width, h = r.height;
    if (w / h > ar) { var nw = h * ar; return { x: r.left + (w - nw) / 2 + scrollX, y: r.top + scrollY, w: nw, h: h }; }
    var nh = w / ar; return { x: r.left + scrollX, y: r.top + (h - nh) / 2 + scrollY, w: w, h: nh };
  }
  function measure() {
    d.classList.remove("q-aw-flying");
    A = box(from); B = box(to);
    var vh = window.innerHeight;
    s0 = Math.max(0, A.y - vh * 0.18);                 // the flight begins as the stage trophy starts to leave
    s1 = Math.max(s0 + 1, B.y + B.h / 2 - vh * 0.58);  // and lands when the card trophy sits a little below centre
    draw();
  }
  function draw() {
    ticking = false;
    var p = Math.min(1, Math.max(0, (scrollY - s0) / (s1 - s0))), e = ease(p);
    d.classList.toggle("q-aw-home", p <= 0);
    d.classList.toggle("q-aw-landed", p >= 1);
    d.classList.toggle("q-aw-flying", p > 0 && p < 1);
    if (p <= 0 || p >= 1) return;
    var x = lerp(A.x, B.x, e) - scrollX, y = lerp(A.y, B.y, e) - scrollY;
    var w = lerp(A.w, B.w, e), h = lerp(A.h, B.h, e);
    var arc = Math.sin(p * Math.PI);                 // 0 at both ends, 1 mid-flight
    fly.style.width = A.w + "px"; fly.style.height = A.h + "px";
    fly.style.transform = "translate3d(" + (x + arc * Math.min(160, innerWidth * 0.12)).toFixed(1) + "px," + y.toFixed(1) + "px,0) scale(" + (w / A.w).toFixed(4) + "," + (h / A.h).toFixed(4) + ") translateX(" + (A.w / 2).toFixed(1) + "px) rotateY(" + (e * 720).toFixed(1) + "deg) rotateZ(" + (arc * -8).toFixed(2) + "deg) translateX(" + (-A.w / 2).toFixed(1) + "px)";
    fly.style.filter = "drop-shadow(0 " + (18 + arc * 16).toFixed(0) + "px " + (22 + arc * 14).toFixed(0) + "px rgba(60,40,0," + (0.3 - arc * 0.08).toFixed(2) + ")) brightness(" + (1 + arc * 0.35).toFixed(2) + ") saturate(" + (1 + arc * 0.25).toFixed(2) + ")";
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }

  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", function () { requestAnimationFrame(measure); });
  addEventListener("load", measure);
  if (to.complete) measure(); else to.addEventListener("load", measure, { once: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  // cards reveal and settle after load (q-reveal); measure again once they have
  setTimeout(measure, 1200); setTimeout(measure, 3000);
})();
