/* ============================================================
   StepPlayer — declarative step-through SVG animation engine.
   Zero dependencies. CSS transitions do the motion; the engine
   only flips classes/attributes/transforms per step.

   USAGE
   -----
   new StepPlayer({
     svg: '#fig-x svg',            // selector or SVGElement (required)
     caption: '#fig-x-cap',        // selector/element; auto-created if omitted
     autoplayMs: 2600,             // default hold per step in play mode
     loop: false,
     steps: [
       {
         caption: "Narration for this step (can contain <b>html</b>).",
         show: ['#id1', '#id2'],   // remove .sp-hide  (fade in)
         hide: ['#id3'],           // add .sp-hide     (fade out)
         addClass:    { '#id': 'sv-hl' },
         removeClass: { '#id': 'sv-hl' },
         attrs: { '#id': { textContent: '0.82', x: 40 } },
         move:  { '#id': [dx, dy] },   // translate from authored position
         holdMs: 3200              // optional per-step autoplay override
       }, ...
     ]
   });

   AUTHORING CONVENTIONS (keep every figure consistent)
   ----------------------------------------------------
   - Elements that appear later start with class "sp-hide".
   - viewBox: 640x360-ish for wide figures, 400x400 for square.
   - id prefixes: tok- (tokens), vec- (vectors), mat- (matrices),
     attn- (attention), lbl- (labels), stp- (step-specific).
   - Palette classes from site.css: .sv-a .sv-b .sv-c .sv-dim .sv-ink
   - Captions: <= 2 sentences, written as narration.
   - TEXT SCALE: minimum font-size 17 viewBox-units on a 640-wide
     viewBox (renders ~10px on a 375px phone). Primary labels 19-21,
     headings 22-24. Never go below 17 — mobile readability rule.

   The engine precomputes the cumulative state of every touched
   element at every step, so prev/scrub jump instantly and
   deterministically to any step.
   ============================================================ */
(function () {
  "use strict";

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, ctx) {
    if (typeof sel === "string") return (ctx || document).querySelector(sel);
    return sel;
  }

  function StepPlayer(opts) {
    if (!(this instanceof StepPlayer)) return new StepPlayer(opts);
    var self = this;

    this.svg = $(opts.svg);
    if (!this.svg) { console.warn("StepPlayer: svg not found", opts.svg); return; }
    this.figure = this.svg.closest("figure") || this.svg.parentNode;
    this.steps = opts.steps || [];
    this.autoplayMs = opts.autoplayMs || 4000;
    this.loop = !!opts.loop;
    this.idx = -1;             /* -1 = pristine authored state, shown as step 0 */
    this.playing = false;
    this.timer = null;

    /* caption element */
    this.captionEl = opts.caption ? $(opts.caption) : null;
    if (!this.captionEl) {
      this.captionEl = document.createElement("p");
      this.captionEl.className = "sp-caption";
      this.svg.insertAdjacentElement("afterend", this.captionEl);
    }

    /* -------- collect touched elements & their base state -------- */
    var touched = {};   /* sel -> element */
    this.steps.forEach(function (st) {
      ["show", "hide"].forEach(function (k) {
        (st[k] || []).forEach(function (sel) { touched[sel] = true; });
      });
      ["addClass", "removeClass", "attrs", "move"].forEach(function (k) {
        Object.keys(st[k] || {}).forEach(function (sel) { touched[sel] = true; });
      });
    });

    this.els = {};
    this.base = {};
    Object.keys(touched).forEach(function (sel) {
      var elList = self.svg.querySelectorAll(sel);
      if (!elList.length) { console.warn("StepPlayer: no match for", sel); return; }
      self.els[sel] = Array.prototype.slice.call(elList);
      self.base[sel] = self.els[sel].map(function (el) {
        return {
          className: el.getAttribute("class") || "",
          transform: el.getAttribute("transform") || "",
          text: el.textContent,
          attrs: {}
        };
      });
    });

    /* -------- precompute cumulative resolved state per step -------- */
    /* state[i][sel] = {hidden, classes(Set extra), removed(Set), attrs{}, text, move[dx,dy]} */
    this.states = [];
    var running = {};
    Object.keys(this.els).forEach(function (sel) {
      var hasHide = (self.base[sel][0].className.indexOf("sp-hide") !== -1);
      running[sel] = { hidden: hasHide, add: {}, remove: {}, attrs: {}, text: null, move: null };
    });
    function snapshot() {
      var s = {};
      Object.keys(running).forEach(function (sel) {
        var r = running[sel];
        s[sel] = {
          hidden: r.hidden,
          add: Object.assign({}, r.add),
          remove: Object.assign({}, r.remove),
          attrs: Object.assign({}, r.attrs),
          text: r.text,
          move: r.move ? r.move.slice() : null
        };
      });
      return s;
    }
    this.pristine = snapshot();
    this.steps.forEach(function (st) {
      (st.show || []).forEach(function (sel) { if (running[sel]) running[sel].hidden = false; });
      (st.hide || []).forEach(function (sel) { if (running[sel]) running[sel].hidden = true; });
      Object.keys(st.addClass || {}).forEach(function (sel) {
        if (!running[sel]) return;
        String(st.addClass[sel]).split(/\s+/).forEach(function (c) {
          running[sel].add[c] = true; delete running[sel].remove[c];
        });
      });
      Object.keys(st.removeClass || {}).forEach(function (sel) {
        if (!running[sel]) return;
        String(st.removeClass[sel]).split(/\s+/).forEach(function (c) {
          running[sel].remove[c] = true; delete running[sel].add[c];
        });
      });
      Object.keys(st.attrs || {}).forEach(function (sel) {
        if (!running[sel]) return;
        var a = st.attrs[sel];
        Object.keys(a).forEach(function (name) {
          if (name === "textContent") running[sel].text = a[name];
          else running[sel].attrs[name] = a[name];
        });
      });
      Object.keys(st.move || {}).forEach(function (sel) {
        if (!running[sel]) return;
        running[sel].move = st.move[sel];
      });
      self.states.push(snapshot());
    });

    /* record base values for every attr name / text ever set, so
       backward scrubbing restores the authored state exactly */
    this.everAttrs = {};   /* sel -> [attrName,...] */
    this.everText = {};    /* sel -> true           */
    Object.keys(this.els).forEach(function (sel) {
      var names = {};
      self.states.forEach(function (s) {
        if (!s[sel]) return;
        Object.keys(s[sel].attrs).forEach(function (n) { names[n] = true; });
        if (s[sel].text != null) self.everText[sel] = true;
      });
      self.everAttrs[sel] = Object.keys(names);
      self.base[sel].forEach(function (b, i) {
        self.everAttrs[sel].forEach(function (n) {
          b.attrs[n] = self.els[sel][i].getAttribute(n);
        });
      });
    });

    this._buildControls(opts.controls !== false);
    this._bindGestures();
    this._observeVisibility();
    this.goTo(0, true);
  }

  StepPlayer.prototype._apply = function (state) {
    var self = this;
    Object.keys(this.els).forEach(function (sel) {
      var st = state[sel];
      if (!st) return;
      self.els[sel].forEach(function (el, i) {
        var b = self.base[sel][i];
        /* class list = base classes minus sp-hide decision, minus removed, plus added */
        var classes = b.className.split(/\s+/).filter(function (c) { return c && c !== "sp-hide"; });
        classes = classes.filter(function (c) { return !st.remove[c]; });
        Object.keys(st.add).forEach(function (c) { if (classes.indexOf(c) === -1) classes.push(c); });
        if (st.hidden) classes.push("sp-hide");
        el.setAttribute("class", classes.join(" "));
        /* attrs: apply step value, or restore authored value for any
           attr that some other step touches */
        (self.everAttrs[sel] || []).forEach(function (name) {
          var v = st.attrs[name] !== undefined ? st.attrs[name] : b.attrs[name];
          if (v == null) el.removeAttribute(name);
          else el.setAttribute(name, v);
        });
        if (st.text != null) el.textContent = st.text;
        else if (self.everText[sel]) el.textContent = b.text;
        /* transform */
        if (st.move) {
          var t = b.transform ? b.transform + " " : "";
          el.setAttribute("transform", t + "translate(" + st.move[0] + "," + st.move[1] + ")");
        } else if (b.transform) {
          el.setAttribute("transform", b.transform);
        } else {
          el.removeAttribute("transform");
        }
      });
    });
  };

  StepPlayer.prototype.goTo = function (i, instant) {
    if (!this.steps.length) return;
    i = Math.max(0, Math.min(i, this.steps.length - 1));
    this.idx = i;
    if (instant || REDUCED) {
      this.svg.classList.add("no-trans");
      this._apply(this.states[i]);
      /* force reflow, then re-enable transitions */
      void this.svg.getBoundingClientRect();
      this.svg.classList.remove("no-trans");
    } else {
      this._apply(this.states[i]);
    }
    var st = this.steps[i];
    if (this.captionEl) {
      this.captionEl.innerHTML = "<b>" + (i + 1) + ".</b> " + (st.caption || "");
    }
    this._syncControls();
  };

  StepPlayer.prototype.next = function () {
    if (this.idx < this.steps.length - 1) { this.goTo(this.idx + 1); return true; }
    if (this.loop && this.playing) { this.goTo(0); return true; }
    return false;
  };
  StepPlayer.prototype.prev = function () { this.goTo(this.idx - 1); };

  StepPlayer.prototype.play = function () {
    if (this.playing) return;
    this.playing = true;
    if (this.idx >= this.steps.length - 1 && !this.loop) this.goTo(0);
    this._tick();
    this._syncControls();
  };
  StepPlayer.prototype.pause = function () {
    this.playing = false;
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    this._syncControls();
  };
  StepPlayer.prototype._tick = function () {
    var self = this;
    if (!this.playing) return;
    var hold = (this.steps[this.idx] && this.steps[this.idx].holdMs) || this.autoplayMs;
    this.timer = setTimeout(function () {
      if (!self.playing) return;
      if (!self.next()) self.pause();
      else self._tick();
    }, hold);
  };

  StepPlayer.prototype.destroy = function () {
    this.pause();
    if (this.controlsEl && this.controlsEl.parentNode) this.controlsEl.parentNode.removeChild(this.controlsEl);
  };

  /* -------- controls -------- */
  StepPlayer.prototype._buildControls = function (enabled) {
    if (!enabled) return;
    var self = this;
    var wrap = document.createElement("div");
    wrap.className = "sp-controls";
    wrap.innerHTML =
      '<button type="button" class="sp-prev" aria-label="Previous step">&#9198;</button>' +
      '<button type="button" class="sp-play" aria-label="Play">&#9654;</button>' +
      '<button type="button" class="sp-next" aria-label="Next step">&#9197;</button>' +
      '<input type="range" min="0" max="' + (this.steps.length - 1) + '" value="0" step="1" aria-label="Step">' +
      '<span class="sp-count">1/' + this.steps.length + "</span>";
    (this.captionEl || this.svg).insertAdjacentElement("afterend", wrap);
    this.controlsEl = wrap;
    this.btnPlay = wrap.querySelector(".sp-play");
    this.range = wrap.querySelector("input");
    this.countEl = wrap.querySelector(".sp-count");

    wrap.querySelector(".sp-prev").addEventListener("click", function () { self.pause(); self.prev(); });
    wrap.querySelector(".sp-next").addEventListener("click", function () { self.pause(); self.next(); });
    this.btnPlay.addEventListener("click", function () {
      if (self.playing) self.pause(); else self.play();
    });
    this.range.addEventListener("input", function () {
      /* read the value BEFORE pause(): pause syncs the range back to idx */
      var v = parseInt(self.range.value, 10);
      self.pause();
      self.goTo(v, true);
    });
  };

  StepPlayer.prototype._syncControls = function () {
    if (!this.controlsEl) return;
    if (this.range) this.range.value = String(this.idx);
    if (this.countEl) this.countEl.textContent = (this.idx + 1) + "/" + this.steps.length;
    if (this.btnPlay) {
      this.btnPlay.innerHTML = this.playing ? "&#9646;&#9646;" : "&#9654;";
      this.btnPlay.setAttribute("aria-label", this.playing ? "Pause" : "Play");
    }
  };

  /* -------- swipe gestures on the SVG -------- */
  StepPlayer.prototype._bindGestures = function () {
    var self = this, x0 = null, y0 = null;
    this.svg.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) return;
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    this.svg.addEventListener("touchend", function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0;
      var dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        self.pause();
        if (dx < 0) self.next(); else self.prev();
      }
    }, { passive: true });
  };

  /* -------- pause playback when scrolled out of view -------- */
  StepPlayer.prototype._observeVisibility = function () {
    var self = this;
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting && self.playing) self.pause();
      });
    }, { threshold: 0.15 });
    io.observe(this.svg);
  };

  window.StepPlayer = StepPlayer;
})();
