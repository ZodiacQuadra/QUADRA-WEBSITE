// Homepage opening film (announce21.css): times the exit and hands over to the homepage's own opening.
// Skip: the "Skip intro" button, Esc, or a click anywhere outside the link. #q-still in the address skips it.
(function () {
  "use strict";
  var d = document.documentElement, el = document.getElementById("q-ann");
  if (!el) return;
  if (location.hash === "#q-still") { el.remove(); return; }
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var skip = el.querySelector(".q-ann-skip"), done = false, timer;

  // replay the homepage's own opening (q.css html.q-v2-intro / q-v2-go) so it plays as the curtain lifts
  function replayHome() {
    if (reduce) return;
    d.classList.remove("q-v2-go");
    d.classList.add("q-v2-intro");
    void d.offsetWidth; // restart the CSS animations
    d.classList.add("q-v2-go");
    setTimeout(function () { d.classList.remove("q-v2-intro", "q-v2-go"); }, 4600);
  }
  function onKey(e) { if (e.key === "Escape") exit(); }
  function exit() {
    if (done) return;
    done = true;
    clearTimeout(timer);
    document.removeEventListener("keydown", onKey);
    var hadFocus = el.contains(document.activeElement);
    el.classList.add("is-out");
    replayHome();
    if (hadFocus) { var first = document.querySelector("nav a[href]"); if (first) first.focus({ preventScroll: true }); }
    setTimeout(function () { el.remove(); }, reduce ? 450 : 950);
  }

  timer = setTimeout(exit, reduce ? 2200 : 4400);
  document.addEventListener("keydown", onKey);
  if (skip) skip.addEventListener("click", function (e) { e.stopPropagation(); exit(); });
  el.addEventListener("click", function (e) { if (!e.target.closest("a")) exit(); });
})();
