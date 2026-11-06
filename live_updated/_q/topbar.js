// The site's top bar on pages copied from the live site (markup placed by the build, styles in topbar.css):
// menu panels, phone menu, theme switch and the see-through backing once the page is scrolled.
(function () {
  var root = document.documentElement;
  var bar = document.querySelector(".q-tb");
  if (!bar) return;

  // Theme: the page's own Framer theme switch (hidden with the old nav, still mounted) does the work; the bar
  // follows the body class it sets. Without it, store the choice and reload.
  function sync() {
    var b = document.body.classList;
    if (b.contains("pix-is-light")) root.setAttribute("data-q-theme", "light");
    else if (b.contains("pix-is-dark")) root.setAttribute("data-q-theme", "dark");
  }
  sync();
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  bar.querySelectorAll('a[aria-label="Theme switch"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var next = root.getAttribute("data-q-theme") === "light" ? "dark" : "light";
      var own = document.querySelector('#main a[aria-label="Theme switch"]');
      if (own) { own.click(); root.setAttribute("data-q-theme", next); return; }
      try { localStorage.setItem("theme", next === "light" ? "Light" : "Dark"); } catch (err) {}
      location.reload();
    });
  });

  // Scrolled: soft backing behind the bar
  var onScroll = function () { root.classList.toggle("q-v2-scrolled", window.scrollY > 60); };
  onScroll(); addEventListener("scroll", onScroll, { passive: true });

  // Desktop panels, opened from the bar's menu items
  var panels = {};
  document.querySelectorAll(".q-menu").forEach(function (p) { panels[p.getAttribute("data-q-label")] = p; });
  var openPanel = null, closeTimer = null;
  function open(panel, anchor) {
    clearTimeout(closeTimer);
    if (openPanel && openPanel !== panel) openPanel.classList.remove("q-open");
    panel.style.top = (anchor.closest("nav") || anchor).getBoundingClientRect().bottom + 8 + "px";
    panel.classList.add("q-open");
    openPanel = panel;
  }
  function close() { if (openPanel) openPanel.classList.remove("q-open"); openPanel = null; }
  function later() { clearTimeout(closeTimer); closeTimer = setTimeout(close, 220); }
  bar.querySelectorAll('a[data-framer-name="Menu Item Dropdown"], a[data-framer-name="Menu Item Simple"]').forEach(function (a) {
    var panel = panels[(a.textContent || "").trim()];
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
  document.addEventListener("click", function (e) { if (openPanel && !openPanel.contains(e.target) && !bar.contains(e.target)) close(); });
  addEventListener("scroll", function () { if (openPanel) close(); }, { passive: true });

  // Phone menu: the bar's hamburger opens the full navigation
  var mobile = document.querySelector(".q-mobile");
  function setMobile(on) { if (mobile) mobile.classList.toggle("q-open", on); document.body.style.overflow = on ? "hidden" : ""; }
  bar.querySelectorAll('[data-framer-name="Mobile Menu"]').forEach(function (m) {
    m.setAttribute("role", "button"); m.setAttribute("aria-label", "Open menu");
    m.addEventListener("click", function (e) { e.preventDefault(); setMobile(true); });
    m.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMobile(true); } });
  });
  if (mobile) mobile.querySelector(".q-mobile-close").addEventListener("click", function () { setMobile(false); });
})();
