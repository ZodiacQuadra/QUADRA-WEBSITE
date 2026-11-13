// Awards & Recognition — section upgrades (styles in awards_plus.css; Awards page only):
// reveals for the stage, the finalist rosette and the Sophos tally; numbers that count up once when seen; partner
// cards that lean toward the pointer; the faint "Thank you" drifting with the scroll; a thin reading-progress line.
// Reduced motion (or #q-still): everything is shown in place and nothing moves.
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  var still = (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) || location.hash === "#q-still";
  if (still) return;
  root.classList.add("q-awp");

  // ---- reveals and counting ----
  var counters = [].slice.call(d.querySelectorAll("[data-q-count]"));
  counters.forEach(function (el) { el.textContent = "0"; });
  function count(el) {
    if (el._done) return; el._done = true;
    var to = +el.getAttribute("data-q-count"), t0 = 0, dur = 1300 + Math.min(to, 30) * 20;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(to * e));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var watch = [].slice.call(d.querySelectorAll(".q-aw-show, .q-aw-fin, .q-aw-tally"));
  function show(el) {
    el.classList.add(el.classList.contains("q-aw-show") ? "q-aw-in" : "q-aw-on");
    [].forEach.call(el.querySelectorAll("[data-q-count]"), count);
    if (el.hasAttribute("data-q-count")) count(el);
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.25 });
    watch.forEach(function (el) { io.observe(el); });
  } else {
    watch.forEach(show);
  }

  // ---- partner cards lean toward the pointer ----
  if (window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    [].forEach.call(d.querySelectorAll(".q-aw-partners .q-card"), function (c) {
      c.classList.add("q-aw-tilt");
      c.addEventListener("pointermove", function (ev) {
        var r = c.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
        c.style.setProperty("--ry", (x * 6).toFixed(2) + "deg");
        c.style.setProperty("--rx", (-y * 6).toFixed(2) + "deg");
      });
      c.addEventListener("pointerleave", function () { c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); });
    });
  }

  // ---- scroll-linked: reading progress and the drifting "Thank you" ----
  var bar = d.createElement("div");
  bar.className = "q-aw-progress"; bar.setAttribute("aria-hidden", "true");
  d.body.appendChild(bar);
  var thanks = d.querySelector(".q-aw-thanks"), word = thanks && thanks.querySelector(".q-aw-thanks-word");
  var raf = 0;
  function frame() {
    raf = 0;
    var max = root.scrollHeight - innerHeight;
    bar.style.setProperty("--p", max > 0 ? Math.min(1, Math.max(0, scrollY / max)).toFixed(4) : 0);
    if (word) {
      var r = thanks.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        var p = (innerHeight - r.top) / (innerHeight + r.height); // 0 as it enters, 1 as it leaves
        word.style.setProperty("--tx", ((0.5 - p) * innerWidth * 0.18).toFixed(1) + "px");
      }
    }
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  addEventListener("scroll", kick, { passive: true });
  addEventListener("resize", kick);
  kick();
})();
