/* ============================================================
   site.js — injects all shared chrome from window.SITE_MANIFEST:
   sticky header (hamburger + breadcrumb + progress bar),
   slide-in TOC drawer, prev/next pager, read-progress tracking.
   Pages only need: <body data-page="module-dir/page-slug">.
   Root pages (index/glossary) have no data-page and get no pager.
   ============================================================ */
(function () {
  "use strict";
  var M = window.SITE_MANIFEST;
  if (!M) return;

  var READ_KEY = "cbml-read";

  function readSet() {
    try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]")); }
    catch (e) { return new Set(); }
  }
  function saveRead(set) {
    try { localStorage.setItem(READ_KEY, JSON.stringify(Array.from(set))); } catch (e) {}
  }

  /* Flat ordered list of published pages: [{id, module, page, href(fromRoot)}] */
  var flat = [];
  M.modules.forEach(function (mod) {
    mod.pages.forEach(function (p) {
      flat.push({
        id: mod.slug + "/" + p.slug,
        mod: mod,
        page: p,
        coming: !!mod.coming,
        hrefFromRoot: mod.slug + "/" + p.slug + ".html"
      });
    });
  });

  var pageId = document.body.dataset.page || null;
  var isContentPage = !!pageId;
  /* Content pages live at depth 1 → root prefix is "../" */
  var root = isContentPage ? "../" : "";

  var currentIdx = -1;
  if (isContentPage) {
    for (var i = 0; i < flat.length; i++) {
      if (flat[i].id === pageId) { currentIdx = i; break; }
    }
  }

  /* Mark current page as read */
  var read = readSet();
  if (isContentPage && currentIdx >= 0) {
    read.add(pageId);
    saveRead(read);
  }

  var published = flat.filter(function (e) { return !e.coming; });

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ---------- header ---------- */
  var header = el("header", "site-header");
  var bar = el("div", "bar");
  var menuBtn = el("button", "menu-btn", "&#9776;");
  menuBtn.setAttribute("aria-label", "Open table of contents");
  bar.appendChild(menuBtn);

  var crumbHtml = '<a href="' + root + 'index.html"><span class="site-name">' + esc(M.title) + "</span></a>";
  if (isContentPage && currentIdx >= 0) {
    var cur = flat[currentIdx];
    crumbHtml += " · " + esc(cur.mod.num) + " " + esc(cur.mod.title);
  }
  bar.appendChild(el("div", "crumb", crumbHtml));
  header.appendChild(bar);

  var track = el("div", "progress-track");
  var fill = el("div", "progress-fill");
  track.appendChild(fill);
  header.appendChild(track);
  document.body.insertBefore(header, document.body.firstChild);

  if (isContentPage && currentIdx >= 0) {
    var pos = published.findIndex(function (e) { return e.id === pageId; });
    if (pos >= 0) fill.style.width = (((pos + 1) / published.length) * 100).toFixed(1) + "%";
  }

  /* ---------- TOC drawer ---------- */
  var overlay = el("div", "toc-overlay");
  var drawer = el("nav", "toc-drawer");
  drawer.setAttribute("aria-label", "Table of contents");

  var tocTitle = el("div", "toc-title",
    '<span>' + esc(M.title) + '</span>');
  var closeBtn = el("button", "toc-close", "&#10005;");
  closeBtn.setAttribute("aria-label", "Close table of contents");
  tocTitle.appendChild(closeBtn);
  drawer.appendChild(tocTitle);

  M.modules.forEach(function (mod) {
    var box = el("div", "toc-module" + (mod.coming ? " coming" : ""));
    var done = mod.pages.filter(function (p) { return read.has(mod.slug + "/" + p.slug); }).length;
    var headHtml = esc(mod.num) + " · " + esc(mod.title);
    if (mod.coming) {
      headHtml += ' <span class="soon-tag">coming soon</span>';
    } else if (done > 0) {
      headHtml += ' <span class="mod-pct">' + done + "/" + mod.pages.length + "</span>";
    }
    box.appendChild(el("div", "mod-head", headHtml));
    mod.pages.forEach(function (p) {
      var id = mod.slug + "/" + p.slug;
      var a = el("a", "toc-page" + (id === pageId ? " current" : "") + (mod.coming ? " coming-page" : ""));
      a.href = root + mod.slug + "/" + p.slug + ".html";
      var tick = read.has(id) && !mod.coming ? "✓" : "";
      a.innerHTML = '<span class="tick">' + tick + "</span><span>" + esc(p.title) + "</span>";
      box.appendChild(a);
    });
    drawer.appendChild(box);
  });

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);
  document.body.classList.add("has-toc");

  function openToc() { document.body.classList.add("toc-open"); }
  function closeToc() { document.body.classList.remove("toc-open"); }
  menuBtn.addEventListener("click", openToc);
  closeBtn.addEventListener("click", closeToc);
  overlay.addEventListener("click", closeToc);

  /* ---------- prev / next pager ---------- */
  if (isContentPage && currentIdx >= 0) {
    var main = document.getElementById("content") || document.body;
    var pager = el("div", "pager");

    var prevEntry = null, nextEntry = null;
    for (var a2 = currentIdx - 1; a2 >= 0; a2--) { if (!flat[a2].coming) { prevEntry = flat[a2]; break; } }
    for (var b2 = currentIdx + 1; b2 < flat.length; b2++) { if (!flat[b2].coming) { nextEntry = flat[b2]; break; } }

    if (prevEntry) {
      var pa = el("a", "prev",
        '<span class="dir">&#8592; Previous</span><br><span class="dest">' + esc(prevEntry.page.title) + "</span>");
      pa.href = root + prevEntry.hrefFromRoot;
      pager.appendChild(pa);
    }
    if (nextEntry) {
      var na = el("a", "next",
        '<span class="dir">Next &#8594;</span><br><span class="dest">' + esc(nextEntry.page.title) + "</span>");
      na.href = root + nextEntry.hrefFromRoot;
      pager.appendChild(na);
    } else if (isContentPage) {
      var ha = el("a", "next",
        '<span class="dir">You\'re at the frontier</span><br><span class="dest">Back to the course map</span>');
      ha.href = root + "index.html";
      pager.appendChild(ha);
    }
    main.appendChild(pager);
  }

  /* ---------- index page helpers ---------- */
  /* index.html marks an element with id="continue-slot"; we fill it. */
  var slot = document.getElementById("continue-slot");
  if (slot) {
    var target = null;
    for (var k = 0; k < published.length; k++) {
      if (!read.has(published[k].id)) { target = published[k]; break; }
    }
    var started = read.size > 0;
    if (!target) {
      slot.innerHTML = '<a class="continue-btn" href="' + published[0].hrefFromRoot + '">Re-read from the start</a>';
    } else {
      slot.innerHTML = '<a class="continue-btn" href="' + target.hrefFromRoot + '">' +
        (started ? "Continue &#8594; " : "Start &#8594; ") + esc(target.page.title) + "</a>";
    }
  }
  /* per-module progress labels on index: <span data-mod-progress="00-orientation"> */
  document.querySelectorAll("[data-mod-progress]").forEach(function (n) {
    var slug = n.getAttribute("data-mod-progress");
    var mod = M.modules.find(function (m) { return m.slug === slug; });
    if (!mod || mod.coming) return;
    var done = mod.pages.filter(function (p) { return read.has(mod.slug + "/" + p.slug); }).length;
    if (done > 0) n.textContent = done + "/" + mod.pages.length + " read";
  });
})();
