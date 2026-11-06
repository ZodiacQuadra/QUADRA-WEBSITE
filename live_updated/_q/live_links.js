// Framer's client router and nested-link scripts intercept same-origin clicks. Force a real navigation for
// content-pack UI (menus, hero CTAs, cards) and any route listed in window.Q_REBUILT.
(function () {
  var rebuilt = new Set(window.Q_REBUILT || []);
  var CONTACT = "/contact-us";

  function pathOf(url) {
    return decodeURI(url.pathname).replace(/\/+$/, "") || "/";
  }

  function go(e, url) {
    e.preventDefault();
    e.stopImmediatePropagation();
    location.assign(url.pathname + url.search + url.hash);
  }

  function isContentLink(a) {
    if (a.classList.contains("q-btn") || a.classList.contains("q-card") || a.classList.contains("q-chip")) return true;
    if (a.hasAttribute("data-q-content-link")) return true;
    if (a.closest(".q-menu, .q-mobile, .q-wrap, .q-wrap-end, .q-hero-actions, .q-actions, .q-cta-card")) return true;
    if (a.closest("[data-q-hero]")) return true;
    return false;
  }

  // Buttons the live site renders without a link ("Read Post" on the blog lists; Framer draws them again in the
  // browser, so a link added to the page HTML is lost): send the click to the post its own card links to.
  var POST = /^\.?\/?(foundersblog|blogs|newsroom|pressrelease)\/./;
  function deadLinkTarget(a) {
    if (!/^(read post\s*)+$/i.test((a.textContent || "").replace(/\s+/g, " ").trim())) return null;
    for (var x = a.parentElement, d = 0; x && d < 6; x = x.parentElement, d++) {
      var seen = {}, list = [];
      [].forEach.call(x.querySelectorAll("a[href]"), function (l) { var h = l.getAttribute("href"); if (POST.test(h.replace(/^\.\//, "")) && !seen[h]) { seen[h] = 1; list.push(h); } });
      if (list.length === 1) return list[0];
      if (list.length > 1) return null;
    }
    return null;
  }

  document.addEventListener("mouseover", function (e) {
    var d = e.target && e.target.closest ? e.target.closest("a:not([href])") : null;
    if (d && !d.style.cursor && deadLinkTarget(d)) d.style.cursor = "pointer";
  });

  window.addEventListener(
    "click",
    function (e) {
      var dead = e.target && e.target.closest ? e.target.closest("a:not([href])") : null;
      if (dead && e.button === 0) {
        var to = deadLinkTarget(dead);
        if (to) { e.preventDefault(); e.stopImmediatePropagation(); location.assign(new URL(to, location.href).pathname); return; }
      }
      var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      if (a.closest(".q-chat")) return;

      var href = a.getAttribute("href");
      if (!href || href === "#") return;

      var url;
      try {
        url = new URL(href, location.href);
      } catch (err) {
        return;
      }
      if (url.origin !== location.origin) return;

      var dest = pathOf(url);
      var here = pathOf(new URL(location.href));
      if (dest === here && !url.hash) return;

      if (isContentLink(a) || rebuilt.has(dest) || dest === CONTACT) go(e, url);
    },
    true
  );
})();
