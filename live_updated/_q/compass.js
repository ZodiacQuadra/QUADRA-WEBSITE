// The Compass — chat interface for the local copy. The live Compass AI service is not connected:
// answers are passages taken word for word from this site's own pages (search index built by build_live_copy.js),
// with links to the pages they come from. Nothing is sent anywhere.
(function () {
  var C = window.Q_COMPASS;
  if (!C) return;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ICON = C.icon || ""; // the live Compass star, passed in by build_live_copy.js
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  // ---------- search over the site's content ----------
  var STOP = new Set("a an the and or of to for in on with by how what why when where which who can could does do did is are was were be been our we us you your me my i show tell about from into at as it its this that these those quadra help helps get more any some there their them".split(" "));
  var SYN = {
    cost: ["finops", "spend", "optimization", "optimisation", "savings", "budget"], control: ["governance", "visibility"],
    ai: ["genai", "generative", "agentic", "intelligence", "machine", "learning", "models"], pilot: ["production", "scale", "prototype"],
    production: ["pilot", "scale", "operations"], security: ["secure", "cybersecurity", "threat", "protection", "defence", "defense", "zero", "trust"],
    people: ["workforce", "employees", "teams", "users"], workplace: ["workforce", "work", "collaboration", "workspace", "microsoft", "365"],
    life: ["pharma", "pharmaceutical", "biotech", "healthcare", "sciences"], science: ["pharma", "pharmaceutical", "biotech", "life"],
    cloud: ["azure", "aws", "google", "hybrid", "migration"], data: ["analytics", "databases", "database", "insights"], prem: ["premises", "hybrid", "datacenter"],
  };
  var stem = function (w) { return w.length > 4 ? w.replace(/ies$/, "y").replace(/(ing|ed|es|s)$/, "") : w; };
  var words = function (s) { return String(s).toLowerCase().replace(/[’']/g, "").split(/[^a-z0-9]+/).filter(Boolean); };
  var terms = function (s) { return words(s).filter(function (w) { return !STOP.has(w) && w.length > 1; }).map(stem); };

  var index = null, loading = null;
  // the search index, fetched once; a stalled or failed download is retried once and never leaves the chat waiting
  // (after 12 s per attempt the question gets the fallback answer, and the next question tries again)
  function fetchIndex(attempt) {
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 12000);
    return fetch(C.index, ctl ? { signal: ctl.signal } : undefined)
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (data) { clearTimeout(timer); return data; }, function (err) { clearTimeout(timer); if (attempt < 1) return fetchIndex(attempt + 1); throw err; });
  }
  function loadIndex() {
    if (loading) return loading;
    loading = fetchIndex(0).then(function (data) {
      var passages = [], df = {};
      data.docs.forEach(function (d, di) {
        d.x.forEach(function (pair, pos) {
          var toks = terms(pair[0] + " " + pair[1] + (d.tag ? " " + d.tag : ""));
          var tf = {};
          toks.forEach(function (t) { tf[t] = (tf[t] || 0) + 1; });
          Object.keys(tf).forEach(function (t) { df[t] = (df[t] || 0) + 1; });
          passages.push({ doc: di, pos: pos, head: pair[0], headTerms: new Set(terms(pair[0])), text: pair[1], tf: tf, list: /^[^.]{0,40}:\s/.test(pair[1]) });
        });
      });
      index = { docs: data.docs, passages: passages, df: df, n: passages.length, titleTerms: data.docs.map(function (d) { return new Set(terms(d.t + " " + (d.tag || ""))); }) };
      return index;
    }, function (err) { loading = null; throw err; });
    return loading;
  }
  function search(q) {
    var base = terms(q), weighted = {};
    base.forEach(function (t) { weighted[t] = 1; (SYN[t] || []).forEach(function (s) { s = stem(s); if (!weighted[s]) weighted[s] = 0.5; }); });
    var qt = Object.keys(weighted);
    if (!qt.length) return [];
    var wantsCases = /\b(work|case|cases|customers?|examples?|stories|story|projects?)\b/i.test(q);
    var best = {};
    index.passages.forEach(function (p) {
      var s = 0;
      qt.forEach(function (t) { var f = p.tf[t]; if (f) s += weighted[t] * (1 + Math.log(f)) * Math.log(1 + index.n / index.df[t]); });
      if (!s) return;
      var d = index.docs[p.doc];
      qt.forEach(function (t) { if (index.titleTerms[p.doc].has(t)) s += 1.5 * weighted[t]; if (p.headTerms.has(t)) s += 0.8 * weighted[t]; });
      if (p.pos < 2) s *= 1.4; // a page's own introduction answers "what do you offer" best
      if (p.list) s *= 0.6; // "Databases: SQL Server, …" style detail lines make poor answers
      // case studies answer "show me your work" questions; otherwise service pages come first
      s *= d.k === "case" ? (wantsCases ? 1.35 : 0.7) : 1;
      if (HUBS.test(d.u)) s *= 0.85; // overview pages repeat the summaries of the pages they link to
      if (!best[p.doc] || best[p.doc].score < s) best[p.doc] = { score: s, p: p };
    });
    return Object.keys(best).map(function (k) { return { doc: index.docs[k], score: best[k].score, p: best[k].p }; }).sort(function (a, b) { return b.score - a.score; });
  }
  var HUBS = /^\/(solutions|technology|why-quadra)?$/;
  // the sentences of a passage that carry the most of the question's words (a sentence ends at . ! ? followed by a space,
  // so figures such as "₹1.7 crores" stay whole)
  function excerpt(text, q, max) {
    var qt = new Set(terms(q));
    var sents = String(text).split(/(?<=[.!?])\s+(?=[A-Z0-9“"(₹$])/);
    var scored = sents.map(function (s, i) { var hit = 0; terms(s).forEach(function (t) { if (qt.has(t)) hit++; }); return { s: s.trim(), i: i, hit: hit }; });
    var pick = scored.slice().sort(function (a, b) { return b.hit - a.hit || a.i - b.i; }).slice(0, max).sort(function (a, b) { return a.i - b.i; });
    return { text: pick.map(function (x) { return x.s; }).join(" "), hits: pick.reduce(function (n, x) { return n + x.hit; }, 0) };
  }
  function answer(q) {
    var hits = search(q);
    if (!hits.length || hits[0].score < 2) return null;
    var top = hits[0], first = excerpt(top.p.text, q, 2), parts = [first.text];
    var second = hits[1];
    if (second && second.score > top.score * 0.8 && second.doc.u !== top.doc.u && second.doc.k === top.doc.k) {
      var more = excerpt(second.p.text, q, 1);
      var norm = function (s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); };
      // add it only when it says something new and relevant
      if (more.hits >= 3 && norm(first.text).indexOf(norm(more.text)) < 0) parts.push(more.text);
    }
    var sources = [], seen = new Set();
    hits.slice(0, 8).forEach(function (h, i) {
      if (sources.length >= 3 || seen.has(h.doc.u) || h.score < top.score * 0.55) return;
      if (i > 0 && HUBS.test(h.doc.u)) return; // overview pages only when they are the best answer
      seen.add(h.doc.u); sources.push(h.doc);
    });
    return { text: parts.join(" "), sources: sources };
  }

  // ---------- the /home-v2 prompt input ----------
  // The chat box becomes a pill that springs open when you click or type: the text area grows with what you write
  // (soft fades when it scrolls), the round button turns between microphone (empty), send (text) and stop (listening),
  // and speaking a question fills it in, with live level bars. Enter sends, Shift+Enter is a new line, Esc closes it
  // when empty. Voice uses the browser's own speech recognition; where that is missing, the microphone is not offered.
  var FANCY = !!document.querySelector("[data-q-v2]");
  var ARROW_I = '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var MIC_I = '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect x="5" y="1" width="4" height="7" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M2.75 6.5V7a4.25 4.25 0 0 0 8.5 0v-.5M7 11.25V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  var STOP_I = '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="currentColor"/></svg>';
  function promptInput(form, input, send, ask, isBusy) {
    var Rec = window.SpeechRecognition || window.webkitSpeechRecognition, voice = !!Rec;
    form.classList.add("q-pi");
    var ph = document.createElement("button");
    ph.type = "button"; ph.className = "q-pi-ph"; ph.textContent = input.getAttribute("placeholder") || "Ask anything";
    ph.setAttribute("aria-label", "Open the question box");
    var fadeTop = document.createElement("div"), fadeBot = document.createElement("div");
    fadeTop.className = "q-pi-fade q-pi-top"; fadeBot.className = "q-pi-fade q-pi-bot";
    var bar = document.createElement("div");
    bar.className = "q-pi-bar";
    bar.innerHTML = '<span class="q-pi-hint">Enter to send · Shift + Enter for a new line</span>';
    var wave = document.createElement("div");
    wave.className = "q-pi-wave"; wave.setAttribute("aria-hidden", "true");
    wave.innerHTML = "<i></i><i></i><i></i><i></i><i></i>";
    var bars = [].slice.call(wave.children);
    send.innerHTML = '<span class="q-pi-i q-pi-up">' + ARROW_I + '</span><span class="q-pi-i q-pi-mic">' + MIC_I + '</span><span class="q-pi-i q-pi-stop">' + STOP_I + '</span><span class="q-pi-i q-pi-star">' + ICON + "</span>"; // the star shows during the opening only (q.css)
    form.insertBefore(ph, input);
    form.appendChild(fadeTop); form.appendChild(fadeBot); form.appendChild(bar); form.appendChild(wave);
    var rec = null, stream = null, actx = null, raf = 0, idle = 0, base = "";
    function fades() {
      var top = input.scrollTop, rest = input.scrollHeight - input.clientHeight - top;
      fadeTop.style.opacity = Math.min(top / 20, 1);
      fadeBot.style.opacity = Math.min(Math.max(rest - 16, 0) / 10, 1);
    }
    function sync() {
      var has = !!input.value.trim(), listening = !!rec;
      if (has && !form.classList.contains("is-open")) open(false);
      input.style.height = "0px";
      var h = Math.max(56, Math.min(input.scrollHeight, 160));
      input.style.height = h + "px";
      input.style.overflowY = input.scrollHeight > 160 ? "auto" : "hidden";
      form.style.setProperty("--pi-h", h + 44 + "px");
      form.classList.toggle("has-value", has);
      form.classList.toggle("is-rec", listening);
      var mode = listening ? "stop" : has || !voice ? "up" : "mic";
      form.setAttribute("data-mode", mode);
      send.disabled = isBusy() || (mode === "up" && !has);
      send.setAttribute("aria-label", mode === "stop" ? "Stop listening" : mode === "mic" ? "Ask by voice" : "Send question");
      send.title = send.getAttribute("aria-label");
      setTimeout(fades, 0);
    }
    function open(focus) {
      form.classList.add("is-open");
      if (focus) setTimeout(function () { input.focus(); var n = input.value.length; input.setSelectionRange(n, n); }, 60);
    }
    function close() { if (!input.value.trim() && !rec) form.classList.remove("is-open"); }
    function stopVoice() {
      if (rec) { var r = rec; rec = null; try { r.stop(); } catch (e) {} }
      if (raf) cancelAnimationFrame(raf); raf = 0;
      if (idle) clearInterval(idle); idle = 0;
      if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null;
      if (actx) { try { actx.close(); } catch (e) {} } actx = null;
      bars.forEach(function (b) { b.style.height = ""; });
      sync();
    }
    function startVoice() {
      if (!voice || rec) return;
      open(false);
      base = input.value.trim();
      rec = new Rec();
      rec.continuous = true; rec.interimResults = true; rec.lang = document.documentElement.lang || "en-IN";
      rec.onresult = function (e) {
        var fin = "", mid = "";
        for (var i = e.resultIndex; i < e.results.length; i++) { if (e.results[i].isFinal) fin += e.results[i][0].transcript; else mid += e.results[i][0].transcript; }
        if (fin) base = (base ? base + " " : "") + fin.trim();
        input.value = (base + (mid ? " " + mid : "")).trim();
        sync(); input.scrollTop = input.scrollHeight;
      };
      rec.onerror = rec.onend = function () { if (rec) stopVoice(); };
      try { rec.start(); } catch (e) { rec = null; return sync(); }
      // live level bars from the microphone; if it cannot be read, a gentle pulse shows it is listening
      var levels = function (vals) { bars.forEach(function (b, i) { b.style.height = Math.max(4, vals[i] * 24) + "px"; }); };
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
          if (!rec) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
          stream = s;
          var AC = window.AudioContext || window.webkitAudioContext; actx = new AC();
          var an = actx.createAnalyser(); an.fftSize = 64; actx.createMediaStreamSource(s).connect(an);
          var data = new Uint8Array(an.frequencyBinCount), step = Math.floor(data.length / 5);
          (function tick() {
            an.getByteFrequencyData(data);
            var v = [0, 0, 0, 0, 0];
            for (var i = 0; i < 5; i++) { for (var j = 0; j < step; j++) v[i] += data[i * step + j]; v[i] = v[i] / step / 255; }
            levels(v); raf = requestAnimationFrame(tick);
          })();
        }, function () { idle = setInterval(function () { levels([0, 0, 0, 0, 0].map(function () { return 0.15 + Math.random() * 0.35; })); }, 140); });
      }
      sync();
    }
    ph.addEventListener("click", function () { open(true); });
    input.addEventListener("focus", function () { open(false); });
    input.addEventListener("scroll", fades);
    input.addEventListener("keydown", function (e) { if (e.key === "Escape" && !input.value.trim()) { close(); ph.focus(); } });
    form.addEventListener("focusout", function (e) { if (!form.contains(e.relatedTarget)) setTimeout(close, 0); });
    form.addEventListener("mousedown", function (e) { if (form.classList.contains("is-open") && e.target !== input && !e.target.closest("button")) { e.preventDefault(); input.focus(); } });
    send.addEventListener("click", function (e) {
      var mode = form.getAttribute("data-mode");
      if (mode === "stop") { e.preventDefault(); stopVoice(); input.focus(); }
      else if (mode === "mic") { e.preventDefault(); startVoice(); }
    });
    // while the box is closed, its placeholder cycles through the suggested questions
    var examples = [ph.textContent].concat(C.starters || []), ex = 0;
    if (!reduce && examples.length > 1) setInterval(function () {
      if (form.classList.contains("is-open") || document.hidden) return;
      ph.classList.add("is-swapping");
      setTimeout(function () { ex = (ex + 1) % examples.length; ph.textContent = examples[ex]; ph.classList.remove("is-swapping"); }, 320);
    }, 3600);
    sync();
    return { sync: sync, sent: function () { stopVoice(); input.value = ""; sync(); form.classList.remove("is-open"); } };
  }

  // /home-v2: each suggested question gets its topic's icon
  function topicIcons(scope) {
    var I = C.topicIcons || {};
    [].slice.call(scope.querySelectorAll(".q-starter")).forEach(function (b) {
      if (b.querySelector(".q-st-ico")) return;
      var t = b.textContent, k = /secur/i.test(t) ? "security" : /people|workplace|employee/i.test(t) ? "people" : /\bAI\b|pilot|data/i.test(t) ? "ai" : /cost|cloud|migrat/i.test(t) ? "cloud" : "work";
      if (!I[k]) return;
      var i = document.createElement("span"); i.className = "q-st-ico"; i.innerHTML = I[k];
      b.insertBefore(i, b.firstChild);
    });
  }

  // /home-v2 pop-up: a short status under the name, topic chips above the question box (each asks its full
  // question), and quick buttons under it (Solutions, Customers, Architect)
  function shortTopic(q) {
    return /cost/i.test(q) ? "Cloud costs" : /pilot|\bAI\b/i.test(q) ? "AI in production" : /secur/i.test(q) ? "Security" : /people|workplace/i.test(q) ? "Workplace" : /life science/i.test(q) ? "Life sciences" : q.split(" ").slice(0, 3).join(" ");
  }
  function popTouches(root, form, ask) {
    root.classList.add("q-pop-v2");
    // the pop-up's mark is a compass (it is The Compass), drawn in a thin ring, instead of the star badge
    var mark = root.querySelector(".q-chat-avatar");
    if (mark) mark.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="m15.8 8.2-1.9 5.1a1 1 0 0 1-.6.6l-5.1 1.9 1.9-5.1a1 1 0 0 1 .6-.6z"/></svg>';
    var status = root.querySelector(".q-chat-status");
    if (status) status.innerHTML = "<i></i>Answers from Quadra\u2019s pages";
    var topics = document.createElement("div");
    topics.className = "q-topics";
    topics.setAttribute("aria-label", C.starterLabel || "Try a question");
    topics.innerHTML = (C.starters || []).map(function (q) { return '<button type="button" class="q-topic" title="' + esc(q) + '" data-q="' + esc(q) + '">' + esc(shortTopic(q)) + "</button>"; }).join("");
    topics.addEventListener("click", function (e) { var b = e.target.closest(".q-topic"); if (b) ask(b.getAttribute("data-q")); });
    form.parentNode.insertBefore(topics, form);
    if (C.quick && C.quick.length) {
      var quick = document.createElement("div");
      quick.className = "q-quick";
      quick.innerHTML = C.quick.map(function (x) { return '<a href="' + esc(x.href) + '">' + x.icon + "<span>" + esc(x.label) + "</span></a>"; }).join("");
      form.parentNode.insertBefore(quick, form.nextSibling);
    }
  }

  // ---------- chat interface ----------
  function setup(root) {
    var log = root.querySelector(".q-chat-log"), form = root.querySelector(".q-chat-form"), input = form.querySelector("textarea"), send = form.querySelector(".q-chat-send");
    if (FANCY) topicIcons(log);
    var welcome = log.innerHTML, busy = false, pi = null, asked = [];
    var scroll = function () { log.scrollTop = log.scrollHeight; };
    function autosize() { if (pi) return pi.sync(); input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 140) + "px"; send.disabled = busy || !input.value.trim(); }
    function bot(html) {
      var el = document.createElement("div");
      el.className = "q-msg q-bot";
      el.innerHTML = '<span class="q-msg-av">' + ICON + '</span><div class="q-bubble">' + html + "</div>";
      log.appendChild(el); scroll();
      return el.querySelector(".q-bubble");
    }
    function stream(target, text, done) {
      var w = text.split(" "), i = 0;
      if (reduce) { target.textContent = text; return done(); }
      (function step() {
        i = Math.min(w.length, i + 2);
        target.textContent = w.slice(0, i).join(" ");
        scroll();
        if (i < w.length) setTimeout(step, 28); else done();
      })();
    }
    function tools(bubble, text) {
      var bar = document.createElement("div");
      bar.className = "q-msg-tools";
      bar.innerHTML = '<button type="button" data-a="copy" title="Copy answer" aria-label="Copy answer"><svg viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M5 15V5a1 1 0 0 1 1-1h10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></button>' +
        '<button type="button" data-a="up" title="Helpful" aria-label="Helpful" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none"><path d="M7 11v9H4v-9h3Zm0 0 4-7a2 2 0 0 1 3 2l-1 4h5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 16.8 20H7" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg></button>' +
        '<button type="button" data-a="down" title="Not helpful" aria-label="Not helpful" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" style="transform:rotate(180deg)"><path d="M7 11v9H4v-9h3Zm0 0 4-7a2 2 0 0 1 3 2l-1 4h5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 16.8 20H7" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg></button><span class="q-tool-note" aria-live="polite"></span>';
      bar.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        var note = bar.querySelector(".q-tool-note");
        if (b.dataset.a === "copy") { try { navigator.clipboard.writeText(text); note.textContent = "Copied"; } catch (err) { note.textContent = ""; } setTimeout(function () { note.textContent = ""; }, 1500); return; }
        bar.querySelectorAll('[data-a="up"],[data-a="down"]').forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        note.textContent = "Thanks for the feedback";
      });
      bubble.appendChild(bar);
    }
    // two more suggested questions, ones not asked yet
    function followUps(bubble) {
      var next = (C.starters || []).filter(function (x) { return asked.indexOf(x) < 0; }).slice(0, 2);
      if (!next.length) return;
      var box = document.createElement("div");
      box.className = "q-follow";
      box.innerHTML = '<span class="q-msg-label">Ask next</span><div class="q-starter-list">' + next.map(function (x) { return '<button type="button" class="q-starter">' + esc(x) + "</button>"; }).join("") + "</div>";
      topicIcons(box); bubble.appendChild(box); scroll();
    }
    function ask(q) {
      q = String(q || "").trim();
      if (!q || busy) return;
      busy = true;
      asked.push(q); root.classList.add("is-thinking");
      var starters = log.querySelector(".q-starter-block");
      if (starters) starters.remove();
      var me = document.createElement("div");
      me.className = "q-msg q-me";
      me.innerHTML = '<div class="q-bubble">' + esc(q) + "</div>";
      log.appendChild(me);
      input.value = ""; if (pi) pi.sent(); else autosize();
      var thinking = bot('<span class="q-typing" aria-label="' + esc(C.loading) + '"><i></i><i></i><i></i></span><span class="q-typing-text">' + esc(C.loading) + "</span>");
      var started = Date.now();
      loadIndex().then(function () {
        var a = answer(q), wait = Math.max(0, 900 - (Date.now() - started));
        if (FANCY && a && a.sources.length) {
          var tt = thinking.querySelector(".q-typing-text");
          if (tt) tt.textContent = "Reading " + a.sources.map(function (d) { return d.t; }).join(", ") + "…";
          wait = Math.max(wait, 850);
        }
        setTimeout(function () {
          thinking.innerHTML = "";
          if (!a) {
            thinking.innerHTML = "<p></p>";
            stream(thinking.querySelector("p"), C.fallback, function () {
              var acts = document.createElement("div");
              acts.className = "q-msg-actions";
              acts.innerHTML = (C.actions || []).map(function (x, i) { return '<a class="q-chip-btn' + (i ? "" : " q-primary") + '" href="' + esc(x.href) + '">' + esc(x.label) + "</a>"; }).join("");
              thinking.appendChild(acts); tools(thinking, C.fallback); if (FANCY) followUps(thinking); busy = false; root.classList.remove("is-thinking"); autosize(); scroll();
            });
            return;
          }
          thinking.innerHTML = '<span class="q-msg-label">' + esc(C.answerLabel) + "</span><p></p>";
          stream(thinking.querySelector("p"), a.text, function () {
            // the answer names one of Quadra's platforms: show its real logo, linked to its page
            var named = (C.products || []).filter(function (pr) { return new RegExp("\\b" + pr.name + "\\b").test(a.text + " " + a.sources.map(function (d) { return d.t; }).join(" ")); });
            if (named.length) {
              var marks = document.createElement("div");
              marks.className = "q-logos q-msg-logos";
              marks.innerHTML = named.map(function (pr) { return pr.html; }).join("");
              thinking.appendChild(marks);
            }
            var src = document.createElement("div");
            src.className = "q-sources";
            src.innerHTML = '<span class="q-msg-label">' + esc(C.sourceLabel) + "</span>" + a.sources.map(function (d, i) {
              return '<a class="q-source" href="' + esc(d.u) + '"><span class="q-source-n">' + (i + 1) + '</span><span class="q-source-t"><b>' + esc(d.t) + "</b><small>" + esc(d.k === "case" ? "Case study" + (d.tag ? " · " + d.tag : "") : d.u) + '</small></span><span class="q-source-go">↗</span></a>';
            }).join("");
            thinking.appendChild(src); tools(thinking, a.text); if (FANCY) followUps(thinking); busy = false; root.classList.remove("is-thinking"); autosize(); scroll();
          });
        }, wait);
      }).catch(function () {
        thinking.innerHTML = "<p>" + esc(C.fallback) + "</p>"; busy = false; root.classList.remove("is-thinking"); autosize();
      });
    }
    var inlineChat = root.getAttribute("data-q-chat") === "inline";
    if (FANCY && inlineChat) pi = promptInput(form, input, send, ask, function () { return busy; });
    if (FANCY && !inlineChat) popTouches(root, form, ask);
    // /home-v2: the inline Compass is a medium-sized chat that builds itself when it scrolls into view: an orange circle
    // with the Compass star pops in, the star turns into the microphone, the circle stretches into the question box,
    // then the chat window grows around it (q.css .q-ci stages). Once only; skipped for reduced motion.
    if (FANCY && root.getAttribute("data-q-chat") === "inline") {
      root.classList.add("q-medium");
      if (!reduce && "IntersectionObserver" in window) {
        root.classList.add("q-ci");
        var steps = [[0, "q-ci-1"], [750, "q-ci-2"], [1350, "q-ci-3"], [2050, "q-ci-4"]];
        var seen = new IntersectionObserver(function (en) {
          if (!en[0].isIntersecting) return;
          seen.disconnect();
          steps.forEach(function (s) { setTimeout(function () { root.classList.add(s[1]); }, s[0]); });
          setTimeout(function () { root.classList.remove("q-ci", "q-ci-1", "q-ci-2", "q-ci-3", "q-ci-4"); }, 3300);
        }, { rootMargin: "0px 0px -25% 0px" });
        seen.observe(root.parentNode); // the space reserved for the finished chat (q.css), not the small starting circle
      }
    }
    form.addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); });
    input.addEventListener("input", autosize);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input.value); } });
    log.addEventListener("click", function (e) { var s = e.target.closest(".q-starter"); if (s) ask(s.textContent); });
    root.querySelector(".q-chat-new").addEventListener("click", function () { if (busy) return; log.innerHTML = welcome; input.focus(); });
    autosize();
    return { ask: ask, focus: function () { input.focus(); } };
  }

  var chats = {};
  document.querySelectorAll("[data-q-chat]").forEach(function (el) { chats[el.getAttribute("data-q-chat")] = setup(el); });

  // floating launcher → popover chat (on the homepage it opens the chat in the page instead)
  var launch = document.querySelector(".q-launch"), pop = document.querySelector(".q-chat-pop");
  function openPop(on) {
    if (!pop) return;
    pop.hidden = !on;
    launch.classList.toggle("q-hide", on);
    if (on) { loadIndex(); setTimeout(function () { chats.pop && chats.pop.focus(); }, 50); }
  }
  if (launch && FANCY) {
    launch.classList.add("q-launch-v2");
    var label = launch.querySelector("span:not(.q-launch-orb)");
    if (label) { label.className = "q-launch-label"; label.textContent = "Ask The Compass"; }
    launch.setAttribute("aria-label", "Ask The Compass");
    var hello = document.createElement("span");
    hello.className = "q-hello"; hello.setAttribute("aria-hidden", "true"); hello.textContent = "Hello!";
    launch.appendChild(hello);
    if (!reduce) setTimeout(function () {
      if (!pop || !pop.hidden) return;
      launch.classList.add("is-hello");
      setTimeout(function () { launch.classList.remove("is-hello"); }, 4800);
    }, 6500);
  }
  if (launch) launch.addEventListener("click", function () {
    launch.classList.remove("is-hello");
    if (FANCY) { openPop(true); return; }
    var inline = document.querySelector('[data-q-chat="inline"]');
    if (inline && inline.getBoundingClientRect().height) { inline.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); chats.inline.focus(); loadIndex(); return; }
    openPop(true);
  });
  if (pop) {
    pop.querySelector(".q-chat-close").addEventListener("click", function () { openPop(false); launch.focus(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !pop.hidden) openPop(false); });
  }
})();
