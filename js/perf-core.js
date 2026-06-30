// =========================================
// PERF-CORE.JS  — v3 COMPLETE REWRITE
// Central performance hub. Loaded FIRST.
// 
// Solves:
//  • All scroll listeners consolidated into ONE
//    passive listener + single rAF flush. No module
//    may add its own scroll listener — use PerfCore.onScroll()
//  • Canvas animation budget: rain + stars share a
//    single rAF loop, not two competing ones
//  • Device tiers: ultraLow / low / mid / full
//    ultraLow = 5-6 year old laptop / very old phone
//  • Tab-hidden: all loops fully stop (0 CPU/GPU)
//  • Scroll-active flag: canvases pause draw calls
//    while user is scrolling, resume after idle
// =========================================
(function () {
  'use strict';

  const nav  = navigator;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

  // ── Browser detection ─────────────────────────────────────────────────────
  const ua = (nav.userAgent || '').toLowerCase();
  const isSafari  = ua.includes('safari') && !ua.includes('chrome') && !ua.includes('android');
  const isKiwi    = ua.includes('kiwi');
  // Browsers that cannot reliably expose hardwareConcurrency / deviceMemory
  const limitedSysInfo = isSafari || isKiwi ||
    (nav.hardwareConcurrency === undefined && nav.deviceMemory === undefined);

  // ── Device tiers ──────────────────────────────────────────────────────────
  // If browser gives real values → use them exactly.
  // If browser hides them (Safari/Kiwi/unknown) → assume mid-range (4 cores, 4GB)
  // so everything runs at ~60-70% capacity: smooth but not stripped.
  const cores = nav.hardwareConcurrency || (limitedSysInfo ? 4 : 2);
  const mem   = nav.deviceMemory        || (limitedSysInfo ? 4 : 2);

  // ultraLow = ancient hardware (2 cores, ≤1GB RAM, old netbook, 5yr laptop)
  // low      = modest (4 cores, ≤2GB)
  // mid      = average (4-6 cores, 4GB)
  // full     = modern (8+ cores, 8GB+)
  const ultraLow = cores <= 2 || mem <= 1;
  const lowEnd   = ultraLow || cores <= 4 || mem <= 2;
  const midEnd   = !lowEnd  && (cores <= 6 || mem <= 4);
  const fullEnd  = !lowEnd  && !midEnd;

  // Particle scale per tier
  // limitedSysInfo browsers cap at 0.65× their tier — smooth without killing effects
  const _particleBase = ultraLow ? 0.12 : lowEnd ? 0.3 : midEnd ? 0.6 : 1.0;
  const particleScale = limitedSysInfo ? Math.min(_particleBase, _particleBase * 0.65) : _particleBase;

  // Rain drop count per tier
  const _rainBase = ultraLow ? 0.1 : lowEnd ? 0.25 : midEnd ? 0.5 : 1.0;
  const rainScale = limitedSysInfo ? Math.min(_rainBase, _rainBase * 0.65) : _rainBase;

  // Target frame interval (ms): ultraLow ~20fps, low ~30fps, limitedSysInfo ~50fps, rest 60fps
  const frameInterval = ultraLow ? 50 : lowEnd ? 33 : limitedSysInfo ? 20 : 0;

  // ── Network ────────────────────────────────────────────────────────────────
  function computeSlowNet() {
    if (!conn) return false;
    if (conn.saveData) return true;
    return ['slow-2g', '2g'].includes(conn.effectiveType) || conn.downlink < 1.5;
  }

  // ── Runtime state ─────────────────────────────────────────────────────────
  let hidden        = document.hidden;
  let scrollActive  = false;  // true while finger/wheel is moving
  let _scrollTimer  = null;
  const SCROLL_IDLE = ultraLow ? 200 : lowEnd ? 150 : 80; // ms after last scroll event

  // ── Single consolidated scroll listener ───────────────────────────────────
  // ALL modules must subscribe via PerfCore.onScroll(fn).
  // Nobody else adds window.addEventListener('scroll', ...) after this file loads.
  const _scrollSubs = [];
  let   _scrollTick = false;
  let   _lastScrollY = window.scrollY;

  function _flushScroll() {
    _scrollTick = false;
    _lastScrollY = window.scrollY;
    for (let i = 0; i < _scrollSubs.length; i++) _scrollSubs[i](_lastScrollY);
  }

  window.addEventListener('scroll', () => {
    // Mark scroll active, reset idle timer
    scrollActive = true;
    clearTimeout(_scrollTimer);
    _scrollTimer = setTimeout(() => { scrollActive = false; }, SCROLL_IDLE);

    // Batch-flush subscribers once per frame
    if (!_scrollTick) {
      _scrollTick = true;
      requestAnimationFrame(_flushScroll);
    }
  }, { passive: true });

  // ── Shared rAF master loop ─────────────────────────────────────────────────
  // One loop runs everything. Modules register render functions.
  // The loop respects frameInterval throttling and fully stops when hidden.
  const _loops = [];
  let   _masterHandle = null;
  let   _lastFrameTime = 0;

  function _masterTick(now) {
    if (hidden) { _masterHandle = null; return; }

    // Throttle for ultraLow/low devices
    if (frameInterval > 0 && now - _lastFrameTime < frameInterval) {
      _masterHandle = requestAnimationFrame(_masterTick);
      return;
    }
    _lastFrameTime = now;

    for (let i = 0; i < _loops.length; i++) {
      const loop = _loops[i];
      if (!loop.paused) loop.fn(now, scrollActive);
    }
    _masterHandle = requestAnimationFrame(_masterTick);
  }

  function _startMaster() {
    if (!_masterHandle) _masterHandle = requestAnimationFrame(_masterTick);
  }

  // ── Visibility handling ────────────────────────────────────────────────────
  document.addEventListener('visibilitychange', () => {
    hidden = document.hidden;
    if (!hidden) _startMaster();
  });

  // ── Public API ─────────────────────────────────────────────────────────────
  const PerfCore = {
    // Device info
    ultraLow, lowEnd, midEnd, fullEnd,
    slowNet: computeSlowNet(),
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    limitedSysInfo,   // true on Safari / Kiwi / browsers that hide hardware info

    // Scales
    particleScale,
    rainScale,

    // Legacy compat (used in rain.js, enhancements.js etc.)
    veryLowEnd: ultraLow,
    hidden: false,  // live proxy below

    // Register a scroll callback (replaces window.addEventListener('scroll'))
    // fn receives (scrollY) on each rAF-batched scroll event
    onScroll(fn) { _scrollSubs.push(fn); },

    // Register a render loop function
    // fn(now, scrollActive) — called every rAF tick (respecting frameInterval)
    // Returns a handle with .pause() / .resume() / .stop()
    registerLoop(fn) {
      const entry = { fn, paused: false };
      _loops.push(entry);
      _startMaster();
      return {
        pause()  { entry.paused = true;  },
        resume() { entry.paused = false; _startMaster(); },
        stop()   { const idx = _loops.indexOf(entry); if (idx >= 0) _loops.splice(idx, 1); }
      };
    },

    // One-shot: run fn on the next rAF after scroll has been idle
    afterScrollIdle(fn) {
      if (!scrollActive) { requestAnimationFrame(fn); return; }
      const check = () => {
        if (!scrollActive) { requestAnimationFrame(fn); }
        else _scrollSubs.push(function once(y) {
          const idx = _scrollSubs.indexOf(once);
          if (idx >= 0) _scrollSubs.splice(idx, 1);
          PerfCore.afterScrollIdle(fn);
        });
      };
      setTimeout(check, SCROLL_IDLE + 16);
    }
  };

  // Live proxy for PerfCore.hidden (for old code that reads it directly)
  Object.defineProperty(PerfCore, 'hidden', {
    get() { return hidden; },
    enumerable: true
  });

  // Set html classes for CSS tier targeting
  const html = document.documentElement;
  html.classList.toggle('perf-ultra-low',     ultraLow);
  html.classList.toggle('perf-low-end',       lowEnd);
  html.classList.toggle('perf-mid-end',       midEnd);
  html.classList.toggle('perf-full-end',      fullEnd);
  html.classList.toggle('perf-very-low-end',  ultraLow); // legacy compat
  html.classList.toggle('perf-limited-browser', limitedSysInfo); // Safari/Kiwi/unknown

  // Update net on change
  if (conn && conn.addEventListener) {
    conn.addEventListener('change', () => { PerfCore.slowNet = computeSlowNet(); });
  }

  _startMaster();
  window.PerfCore = PerfCore;
})();
