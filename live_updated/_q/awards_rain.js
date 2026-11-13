// Awards & Recognition: drops a one-off shower of gold award pieces as the page opens (styles in awards_rain.css).
// Skipped for reduced motion and for #q-still (screenshots). window.qAwardsRain() plays it again.
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  // award shapes, drawn in a 24-unit box and filled with the page's gold
  var SHAPES = {
    trophy: '<path d="M7 3h10v3a5 5 0 0 1-10 0V3Z"/><path d="M7 4H4v1.5A3.5 3.5 0 0 0 7.5 9M17 4h3v1.5A3.5 3.5 0 0 1 16.5 9" fill="none" stroke="url(#q-rain-g)" stroke-width="1.6"/><path d="M10.5 11h3v3.5h-3z"/><path d="M8 15h8l1 3H7l1-3Z"/><path d="M6 18h12v2.5H6z"/>',
    medal: '<path d="M7 2h4l2 6H9L7 2Zm10 0h-4l-2 6h4l2-6Z" opacity=".85"/><circle cx="12" cy="15" r="6.2"/><path d="m12 11.6 1.05 2.12 2.34.34-1.7 1.65.4 2.33L12 16.94l-2.09 1.1.4-2.33-1.7-1.65 2.34-.34L12 11.6Z" fill="#fffaf0" opacity=".9"/>',
    star: '<path d="m12 2 2.9 6.26 6.85.79-5.08 4.66 1.38 6.76L12 17.07l-6.05 3.4 1.38-6.76L2.25 9.05l6.85-.79L12 2Z"/>',
    sparkle: '<path d="M12 2c.6 4.8 2.2 6.9 7 7.9-4.8 1-6.4 3.1-7 7.9-.6-4.8-2.2-6.9-7-7.9 4.8-1 6.4-3.1 7-7.9Z"/>'
  };
  var MIX = [["foil", 0.42], ["star", 0.18], ["sparkle", 0.14], ["medal", 0.13], ["trophy", 0.13]];
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  function pick() { var r = Math.random(), acc = 0; for (var i = 0; i < MIX.length; i++) { acc += MIX[i][1]; if (r <= acc) return MIX[i][0]; } return "foil"; }

  function rain() {
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var old = document.querySelector(".q-rain"); if (old) old.remove();
    var box = document.createElement("div");
    box.className = "q-rain"; box.setAttribute("aria-hidden", "true");
    box.innerHTML = '<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="q-rain-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f5e4b4"/><stop offset=".35" stop-color="#E6C766"/><stop offset=".7" stop-color="#C9A227"/><stop offset="1" stop-color="#A87B22"/></linearGradient></defs></svg>';
    var n = window.innerWidth < 700 ? 36 : 70, longest = 0, html = "";
    for (var i = 0; i < n; i++) {
      var kind = pick(), d = rnd(0, 1.8), t = rnd(2.8, 4.6), w, h;
      if (kind === "foil") { w = rnd(7, 11); h = rnd(12, 18); }
      else if (kind === "sparkle") { w = h = rnd(10, 16); }
      else { w = h = rnd(16, 28); }
      longest = Math.max(longest, d + t);
      var r0 = rnd(-40, 40), r1 = r0 + rnd(-220, 220) * (kind === "foil" ? 1.6 : 0.6);
      var style = "--x:" + rnd(-2, 99).toFixed(1) + "vw;--w:" + w.toFixed(1) + "px;--h:" + h.toFixed(1) + "px;--d:" + d.toFixed(2) + "s;--t:" + t.toFixed(2) + "s;--r0:" + r0.toFixed(0) + "deg;--r1:" + r1.toFixed(0) + "deg;--a:" + rnd(8, 34).toFixed(0) + "px;--sd:" + rnd(1.1, 2.1).toFixed(2) + "s";
      var inner = kind === "foil"
        ? '<i class="q-rain-foil' + (Math.random() < 0.35 ? " q-rain-dark" : "") + '" style="--fd:' + rnd(0.8, 1.6).toFixed(2) + 's"></i>'
        : '<svg viewBox="0 0 24 24" fill="url(#q-rain-g)">' + SHAPES[kind] + "</svg>";
      html += '<span class="q-rain-p" style="' + style + '"><span class="q-rain-s">' + inner + "</span></span>";
    }
    box.insertAdjacentHTML("beforeend", html);
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, (longest + 0.3) * 1000);
  }

  window.qAwardsRain = rain;
  if (location.hash === "#q-still") return;
  var start = function () { setTimeout(rain, 350); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
