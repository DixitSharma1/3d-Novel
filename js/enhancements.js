// =========================================================
// ENHANCEMENTS.JS
// Extra emotional & visual features added on top of the
// existing novel — zero changes to any existing code.
// All features are self-contained and additive only.
// =========================================================
(function () {
  'use strict';

  // =========================================================
  // 1. AMBIENT BACKGROUND COLOR SHIFT PER CHAPTER
  //    As Lalli scrolls, the page mood transforms:
  //    cold blue isolation → warm gold discovery → rose love
  // =========================================================
  const CHAPTER_COLORS = [
    { r: 8,  g: 7,  b: 5  },   // before ch1: pure dark
    { r: 6,  g: 9,  b: 14 },   // ch1: cold blue isolation
    { r: 4,  g: 8,  b: 18 },   // ch2: deep rain blue
    { r: 10, g: 9,  b: 6  },   // ch3: amber mystery
    { r: 14, g: 6,  b: 8  },   // ch4: heartbeat crimson
    { r: 12, g: 10, b: 4  },   // ch5: golden revelation
    { r: 6,  g: 10, b: 7  },   // ch6: sage friendship
    { r: 10, g: 7,  b: 5  },   // ch7: amber regret
    { r: 14, g: 6,  b: 8  },   // ch8: rose romance
    { r: 12, g: 9,  b: 3  },   // ch9: climax gold
  ];

  let currentBgColor = { r: 8, g: 7, b: 5 };
  let targetBgColor  = { r: 8, g: 7, b: 5 };
  let bgRafId = null;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animateBg() {
    const dr = Math.abs(currentBgColor.r - targetBgColor.r);
    const dg = Math.abs(currentBgColor.g - targetBgColor.g);
    const db = Math.abs(currentBgColor.b - targetBgColor.b);
    if (dr < 0.05 && dg < 0.05 && db < 0.05) { bgRafId = null; return; }
    currentBgColor.r = lerp(currentBgColor.r, targetBgColor.r, 0.015);
    currentBgColor.g = lerp(currentBgColor.g, targetBgColor.g, 0.015);
    currentBgColor.b = lerp(currentBgColor.b, targetBgColor.b, 0.015);
    document.documentElement.style.setProperty(
      '--bg',
      `rgb(${Math.round(currentBgColor.r)},${Math.round(currentBgColor.g)},${Math.round(currentBgColor.b)})`
    );
    document.body.style.backgroundColor =
      `rgb(${Math.round(currentBgColor.r)},${Math.round(currentBgColor.g)},${Math.round(currentBgColor.b)})`;
    bgRafId = requestAnimationFrame(animateBg);
  }

  function setChapterBg(idx) {
    const c = CHAPTER_COLORS[Math.min(idx, CHAPTER_COLORS.length - 1)];
    if (c.r === targetBgColor.r && c.g === targetBgColor.g && c.b === targetBgColor.b) return;
    targetBgColor = { ...c };
    if (!bgRafId) bgRafId = requestAnimationFrame(animateBg);
  }

  // Watch which chapter header is in view
  const chapterHeaders = document.querySelectorAll('.chapter-header');
  if (typeof IntersectionObserver !== 'undefined') {
    chapterHeaders.forEach((header, i) => {
      new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) setChapterBg(i + 1);
      }, { threshold: 0.3 }).observe(header);
    });
  }


  // =========================================================
  // 2. CONSTELLATION CHAPTER TRACKER
  //    9 glowing stars at top — one per chapter — light up
  //    as she reads. Shows her "you are here" in the story.
  // =========================================================
  const constellationBar = document.createElement('div');
  constellationBar.id = 'constellation-bar';
  constellationBar.innerHTML = Array.from({ length: 9 }, (_, i) =>
    `<div class="const-star" data-ch="${i}" title="Chapter ${['I','II','III','IV','V','VI','VII','VIII','IX'][i]}">
      <div class="const-dot"></div>
      <div class="const-label">${['I','II','III','IV','V','VI','VII','VIII','IX'][i]}</div>
    </div>`
  ).join('<div class="const-line"></div>');
  document.body.appendChild(constellationBar);

  let highestChapter = -1;

  // Make each star a chapter-jump button — smooth scroll to that chapter.
  // This replaces the ∇ / ^ buttons feel with precise, tap-friendly targets.
  document.querySelectorAll('.const-star').forEach((star, i) => {
    star.style.cursor = 'pointer';
    star.setAttribute('role', 'button');
    star.setAttribute('tabindex', '0');
    star.setAttribute('aria-label', `Jump to Chapter ${['I','II','III','IV','V','VI','VII','VIII','IX'][i]}`);
    const header = chapterHeaders[i];
    if (header) {
      const jump = () => {
        const y = header.getBoundingClientRect().top + window.scrollY - 40;
        window.scrollTo({ top: y, behavior: 'smooth' });
      };
      star.addEventListener('click', jump);
      star.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') jump(); });
    }
  });

  function activateConstellationStar(idx) {
    if (idx <= highestChapter) return;
    highestChapter = idx;
    // Light up all stars up to and including idx
    document.querySelectorAll('.const-star').forEach((star, i) => {
      if (i <= idx) {
        star.classList.add('active');
        if (i === idx) star.classList.add('current');
        else star.classList.remove('current');
      }
    });
  }

  if (typeof IntersectionObserver !== 'undefined') {
    chapterHeaders.forEach((header, i) => {
      new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) activateConstellationStar(i);
      }, { threshold: 0.2 }).observe(header);
    });
  }


  // =========================================================
  // 3. LOVE METER — "You've read X% of his heart"
  //    A beautiful golden radial meter on the left side
  //    that fills as she scrolls through the novel
  // =========================================================
  const loveMeter = document.createElement('div');
  loveMeter.id = 'love-meter';
  loveMeter.innerHTML = `
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(229,193,88,0.08)" stroke-width="2"/>
      <circle id="love-meter-arc" cx="26" cy="26" r="22" fill="none"
              stroke="rgba(229,193,88,0.7)" stroke-width="2"
              stroke-dasharray="138.2" stroke-dashoffset="138.2"
              stroke-linecap="round"
              transform="rotate(-90 26 26)"/>
      <text id="love-meter-pct" x="26" y="30" text-anchor="middle"
            font-family="Cormorant Garamond,serif" font-size="10"
            fill="rgba(229,193,88,0.7)">0%</text>
    </svg>
    <div id="love-meter-label">of his heart</div>
  `;
  document.body.appendChild(loveMeter);

  const loveArc = document.getElementById('love-meter-arc');
  const lovePct = document.getElementById('love-meter-pct');
  const CIRCUMFERENCE = 138.2;
  let lastPct = 0;
  let loveMeterVisible = false;

  function updateLoveMeter() {
    const scrollTop = window.scrollY;
    const letterContainer = document.getElementById('letter-container');
    if (!letterContainer || letterContainer.style.display === 'none') return;

    if (!loveMeterVisible) {
      loveMeter.classList.add('visible');
      loveMeterVisible = true;
    }

    const containerTop = letterContainer.offsetTop;
    const containerH = letterContainer.scrollHeight;
    const pct = Math.min(100, Math.max(0, ((scrollTop - containerTop) / (containerH - window.innerHeight)) * 100));
    if (Math.abs(pct - lastPct) < 0.3) return;
    lastPct = pct;

    const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
    if (loveArc) loveArc.style.strokeDashoffset = offset;
    if (lovePct) lovePct.textContent = Math.round(pct) + '%';

    // Color shifts from gold → rose as she nears the end
    if (pct > 80) {
      const t = (pct - 80) / 20;
      const r = Math.round(229 + (255 - 229) * t);
      const g = Math.round(193 + (77 - 193) * t);
      const b = Math.round(88 + (109 - 88) * t);
      if (loveArc) loveArc.style.stroke = `rgba(${r},${g},${b},0.85)`;
      if (lovePct) lovePct.style.fill = `rgba(${r},${g},${b},0.85)`;
    }
  }

  // Use PerfCore central scroll dispatcher instead of raw listener
  if (window.PerfCore) window.PerfCore.onScroll(updateLoveMeter);
  else window.addEventListener('scroll', updateLoveMeter, { passive: true });


  // =========================================================
  // 4. STARFIELD CANVAS — slow drifting stars behind novel
  //    Beautiful, subtle. Never distracts, always adds depth.
  // =========================================================
  const starCanvas = document.createElement('canvas');
  starCanvas.id = 'starfield-canvas';
  starCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.5;';
  document.body.insertBefore(starCanvas, document.body.firstChild);

  const sCtx = starCanvas.getContext('2d');
  function resizeStarCanvas() {
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
  }
  resizeStarCanvas();
  window.addEventListener('resize', resizeStarCanvas, { passive: true });

  const STAR_COUNT = Math.round(120 * (window.PerfCore ? window.PerfCore.particleScale : 1));
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 0.9 + 0.1,
    o: Math.random() * 0.5 + 0.05,
    speed: Math.random() * 0.12 + 0.01,
    twinklePhase: Math.random() * Math.PI * 2,
    twinkleSpeed: Math.random() * 0.015 + 0.003
  }));

  // Throttle frame: ultraLow=every 4th, low=every 2nd, others every frame
  const P = window.PerfCore;
  const _starThrottle = (P && P.ultraLow) ? 4 : (P && P.lowEnd) ? 2 : 1;
  let _starFrame = 0;

  // Stars use PerfCore master loop — auto-pauses on scroll & tab-hidden
  function renderStars(now, scrollActive) {
    _starFrame = (_starFrame + 1) % _starThrottle;
    if (_starFrame !== 0) return;
    if (scrollActive) return; // freeze canvas draw during scroll
    sCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    stars.forEach(s => {
      s.twinklePhase += s.twinkleSpeed;
      s.y -= s.speed;
      if (s.y < -2) { s.y = starCanvas.height + 2; s.x = Math.random() * starCanvas.width; }
      const alpha = s.o * (0.5 + 0.5 * Math.sin(s.twinklePhase));
      sCtx.beginPath();
      sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      sCtx.fillStyle = `rgba(229,193,88,${alpha})`;
      sCtx.fill();
    });
  }

  if (P && P.registerLoop) {
    P.registerLoop(renderStars);
  } else {
    (function loop() { renderStars(0, false); requestAnimationFrame(loop); })();
  }


  // =========================================================
  // 5. HEARTBEAT SCREEN PULSE
  //    When Ch8 "More Than Friendship" header enters view,
  //    the screen does 3 gentle heartbeat pulses — like the
  //    protagonist's actual heartbeat speeding up
  // =========================================================
  const heartbeatOverlay = document.createElement('div');
  heartbeatOverlay.id = 'heartbeat-overlay';
  document.body.appendChild(heartbeatOverlay);

  let heartbeatFired = false;

  function fireHeartbeat() {
    if (heartbeatFired) return;
    heartbeatFired = true;

    // 3 beats: quick-quick-pause, like a real nervous heartbeat
    const beats = [0, 260, 500];
    beats.forEach(delay => {
      setTimeout(() => {
        heartbeatOverlay.style.transition = 'none';
        heartbeatOverlay.style.opacity = '0.06';
        setTimeout(() => {
          heartbeatOverlay.style.transition = 'opacity 0.35s ease-out';
          heartbeatOverlay.style.opacity = '0';
        }, 80);
      }, delay);
    });
  }

  const ch8Header = document.querySelector('.ch8-identity.chapter-header');
  if (ch8Header && typeof IntersectionObserver !== 'undefined') {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) fireHeartbeat();
    }, { threshold: 0.4 }).observe(ch8Header);
  }


  // =========================================================
  // 6. FALLING PETALS at the FINALE
  //    When Lalli scrolls to the proposal section,
  //    soft golden/rose petals drift down from the top
  // =========================================================
  const petalsCanvas = document.createElement('canvas');
  petalsCanvas.id = 'petals-canvas';
  petalsCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;opacity:0;transition:opacity 1.5s ease;';
  document.body.appendChild(petalsCanvas);

  const pCtx = petalsCanvas.getContext('2d');
  function resizePetals() { petalsCanvas.width = window.innerWidth; petalsCanvas.height = window.innerHeight; }
  resizePetals();
  window.addEventListener('resize', resizePetals, { passive: true });

  const petals = [];
  let petalsActive = false;
  let petalsRaf = null;

  const PETAL_SHAPES = ['🌸','🌺','✨','💛','🌼'];

  function spawnPetal() {
    petals.push({
      x: Math.random() * petalsCanvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 0.8,
      vy: 0.6 + Math.random() * 1.2,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.03,
      size: 10 + Math.random() * 14,
      life: 1,
      decay: 0.0015 + Math.random() * 0.001,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.01 + Math.random() * 0.02,
      emoji: PETAL_SHAPES[Math.floor(Math.random() * PETAL_SHAPES.length)]
    });
  }

  function animatePetals() {
    if (!petalsActive) { petalsRaf = null; return; }
    pCtx.clearRect(0, 0, petalsCanvas.width, petalsCanvas.height);

    if (Math.random() < 0.25) spawnPetal();

    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.sway += p.swaySpeed;
      p.x += p.vx + Math.sin(p.sway) * 0.4;
      p.y += p.vy;
      p.rot += p.rotV;
      p.life -= p.decay;
      if (p.y > petalsCanvas.height + 20 || p.life <= 0) { petals.splice(i, 1); continue; }

      pCtx.save();
      pCtx.globalAlpha = Math.max(0, p.life * 0.9);
      pCtx.translate(p.x, p.y);
      pCtx.rotate(p.rot);
      pCtx.font = `${p.size}px serif`;
      pCtx.textAlign = 'center';
      pCtx.textBaseline = 'middle';
      pCtx.fillText(p.emoji, 0, 0);
      pCtx.restore();
    }
    petalsRaf = requestAnimationFrame(animatePetals);
  }

  function startPetals() {
    if (petalsActive) return;
    petalsActive = true;
    petalsCanvas.style.opacity = '1';
    // Initial burst
    for (let i = 0; i < 15; i++) {
      setTimeout(spawnPetal, i * 80);
    }
    animatePetals();
    // Stop spawning after 12s, let existing ones drift away
    setTimeout(() => { petalsActive = false; }, 18000);
  }

  const finaleSection = document.getElementById('finale');
  if (finaleSection && typeof IntersectionObserver !== 'undefined') {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) startPetals();
    }, { threshold: 0.1 }).observe(finaleSection);
  }


  // =========================================================
  // 7. LALLI'S NAME IN GOLDEN INK — animated SVG calligraphy
  //    Appears just before the proposal card — her name
  //    "writes itself" on screen in glowing gold ink
  // =========================================================
  const nameRevealSection = document.createElement('section');
  nameRevealSection.id = 'lalli-name-reveal';
  nameRevealSection.className = 'scene ch9-identity';
  nameRevealSection.style.cssText = 'min-height:50vh;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;';
  nameRevealSection.innerHTML = `
    <div style="text-align:center;position:relative;z-index:2;">
      <div id="lalli-name-svg-wrap" style="opacity:0;transition:opacity 1.2s ease;">
        <svg id="lalli-name-svg" width="600" height="160" viewBox="0 0 600 160" style="max-width:90vw;overflow:visible;">
          <defs>
            <filter id="ink-glow">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <text id="lalli-name-text"
                x="300" y="120"
                text-anchor="middle"
                font-family="Cormorant Garamond, serif"
                font-size="96"
                font-weight="300"
                font-style="italic"
                fill="none"
                stroke="rgba(229,193,88,0.9)"
                stroke-width="0.8"
                filter="url(#ink-glow)"
                letter-spacing="6">Lalli</text>
        </svg>
        <p style="font-family:'Cormorant Garamond',serif;font-size:0.85rem;color:rgba(229,193,88,0.35);letter-spacing:6px;text-transform:uppercase;margin-top:0.5rem;">This story was always yours.</p>
      </div>
    </div>
  `;

  // Insert before finale
  if (finaleSection) {
    finaleSection.parentNode.insertBefore(nameRevealSection, finaleSection);
  }

  // Animate the SVG text stroke drawing
  let lalliNameAnimated = false;

  function animateLalliName() {
    if (lalliNameAnimated) return;
    lalliNameAnimated = true;

    const wrap = document.getElementById('lalli-name-svg-wrap');
    const textEl = document.getElementById('lalli-name-text');
    if (!wrap || !textEl) return;

    wrap.style.opacity = '1';

    // Get path length and animate stroke-dashoffset
    const length = textEl.getTotalLength ? textEl.getTotalLength() : 800;
    textEl.style.strokeDasharray = length;
    textEl.style.strokeDashoffset = length;
    textEl.style.transition = 'stroke-dashoffset 2.8s cubic-bezier(0.4,0,0.2,1), fill 1.2s ease 2s';

    requestAnimationFrame(() => {
      textEl.style.strokeDashoffset = '0';
      // After stroke draws, fill with golden glow
      setTimeout(() => {
        textEl.style.fill = 'rgba(229,193,88,0.15)';
      }, 2200);
    });
  }

  if (typeof IntersectionObserver !== 'undefined') {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) animateLalliName();
    }, { threshold: 0.4 }).observe(nameRevealSection);
  }


  // =========================================================
  // 8. INK DROP CHAPTER TRANSITIONS
  //    A brief ink-bloom effect when each chapter header
  //    fully enters the viewport
  // =========================================================
  const inkOverlay = document.createElement('canvas');
  inkOverlay.id = 'ink-overlay';
  inkOverlay.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:996;opacity:0;';
  document.body.appendChild(inkOverlay);

  const inkCtx = inkOverlay.getContext('2d');
  function resizeInk() { inkOverlay.width = window.innerWidth; inkOverlay.height = window.innerHeight; }
  resizeInk();
  window.addEventListener('resize', resizeInk, { passive: true });

  let inkAnimating = false;

  function playInkDrop(color) {
    if (inkAnimating) return;
    inkAnimating = true;

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const maxR = Math.hypot(cx, cy) * 1.1;
    let r = 0;
    let phase = 'expand'; // expand → hold → shrink
    const expandSpeed = maxR / 18;
    const shrinkSpeed = maxR / 14;
    inkOverlay.style.opacity = '1';

    function drawInk() {
      inkCtx.clearRect(0, 0, inkOverlay.width, inkOverlay.height);
      if (phase === 'expand') {
        r += expandSpeed;
        if (r >= maxR) { r = maxR; phase = 'shrink'; }
      } else {
        r -= shrinkSpeed;
        if (r <= 0) {
          r = 0;
          inkCtx.clearRect(0, 0, inkOverlay.width, inkOverlay.height);
          inkOverlay.style.opacity = '0';
          inkAnimating = false;
          return;
        }
      }
      const grad = inkCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, color.replace(')', ',0.22)').replace('rgb', 'rgba'));
      grad.addColorStop(0.6, color.replace(')', ',0.08)').replace('rgb', 'rgba'));
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      inkCtx.beginPath();
      inkCtx.arc(cx, cy, r, 0, Math.PI * 2);
      inkCtx.fillStyle = grad;
      inkCtx.fill();
      requestAnimationFrame(drawInk);
    }
    drawInk();
  }

  const INK_COLORS = [
    'rgb(120,160,200)', 'rgb(60,100,160)', 'rgb(180,140,80)',
    'rgb(200,60,80)',   'rgb(229,193,88)', 'rgb(100,180,120)',
    'rgb(160,100,60)',  'rgb(220,80,110)', 'rgb(229,193,88)'
  ];

  if (typeof IntersectionObserver !== 'undefined') {
    chapterHeaders.forEach((header, i) => {
      let fired = false;
      new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !fired) {
          fired = true;
          setTimeout(() => playInkDrop(INK_COLORS[i] || 'rgb(229,193,88)'), 200);
        }
      }, { threshold: 0.6 }).observe(header);
    });
  }


  // =========================================================
  // 9. EASTER EGG — Secret message for Lalli
  //    If she clicks the scroll progress ribbon 3 times,
  //    a hidden personal message blooms on screen
  // =========================================================
  let ribbonClicks = 0;
  let ribbonClickTimer = null;

  const ribbon = document.querySelector('.scroll-ribbon');
  if (ribbon) {
    ribbon.style.cursor = 'pointer';
    ribbon.addEventListener('click', () => {
      ribbonClicks++;
      clearTimeout(ribbonClickTimer);
      ribbonClickTimer = setTimeout(() => { ribbonClicks = 0; }, 2000);
      if (ribbonClicks >= 3) {
        ribbonClicks = 0;
        showSecretMessage();
      }
    });
  }

  function showSecretMessage() {
    const existing = document.getElementById('secret-message');
    if (existing) { existing.remove(); return; }

    const msg = document.createElement('div');
    msg.id = 'secret-message';
    msg.innerHTML = `
      <div id="secret-inner">
        <div style="font-size:1.8rem;margin-bottom:1.2rem;">🔐</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:rgba(229,193,88,0.5);letter-spacing:4px;text-transform:uppercase;margin-bottom:1.4rem;">For Your Eyes Only</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:300;color:#E5C158;line-height:2;font-style:italic;max-width:460px;margin:0 auto 1.5rem;">
          "Tumne yeh cheez dhundh li —<br>
          iska matlab tum seriously pad rahi ho. ❤️<br><br>
          Shukriya. Sach mein."
        </div>
        <div style="width:40px;height:1px;background:rgba(229,193,88,0.3);margin:0 auto 1.4rem;"></div>
        <div style="font-size:0.78rem;color:rgba(255,255,255,0.25);letter-spacing:2px;">— click anywhere to close</div>
      </div>
    `;
    document.body.appendChild(msg);
    requestAnimationFrame(() => msg.classList.add('active'));
    msg.addEventListener('click', () => {
      msg.style.opacity = '0';
      setTimeout(() => msg.remove(), 500);
    });
  }


  // =========================================================
  // 10. READING MOOD INDICATOR
  //     A small pill at the bottom-left that shows the
  //     emotional mood of the current chapter
  // =========================================================
  const moodPill = document.createElement('div');
  moodPill.id = 'mood-pill';
  moodPill.innerHTML = '<span id="mood-emoji">📖</span><span id="mood-text">Begin</span>';
  document.body.appendChild(moodPill);

  const CHAPTER_MOODS = [
    { emoji: '🌑', text: 'Alone' },
    { emoji: '🌧', text: 'The Rain' },
    { emoji: '👂', text: 'A Voice' },
    { emoji: '📩', text: 'Surprise' },
    { emoji: '✨', text: 'Realisation' },
    { emoji: '🤝', text: 'Friendship' },
    { emoji: '💭', text: 'Silence' },
    { emoji: '❤️', text: 'Feeling' },
    { emoji: '💌', text: 'Confession' },
  ];

  let currentMood = -1;

  if (typeof IntersectionObserver !== 'undefined') {
    chapterHeaders.forEach((header, i) => {
      new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && i !== currentMood) {
          currentMood = i;
          const m = CHAPTER_MOODS[i];
          if (!m) return;
          moodPill.classList.add('changing');
          setTimeout(() => {
            document.getElementById('mood-emoji').textContent = m.emoji;
            document.getElementById('mood-text').textContent = m.text;
            moodPill.classList.remove('changing');
          }, 250);
        }
      }, { threshold: 0.3 }).observe(header);
    });
  }


  // =========================================================
  // 11. SCROLL-TO-TOP — elegant golden feather button
  //     appears after she's scrolled through >30% of novel
  // =========================================================
  const scrollTopBtn = document.createElement('button');
  scrollTopBtn.id = 'scroll-top-btn';
  scrollTopBtn.innerHTML = '✦';
  scrollTopBtn.title = 'Back to the beginning';
  document.body.appendChild(scrollTopBtn);

  const _updateScrollBtn = (scrollY) => {
    const pct = scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    scrollTopBtn.classList.toggle('visible', pct > 0.3);
  };
  if (window.PerfCore) window.PerfCore.onScroll(_updateScrollBtn);
  else window.addEventListener('scroll', () => _updateScrollBtn(window.scrollY), { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  // =========================================================
  // 12. CHAPTER ENTRY WHISPER — a fleeting poetic line
  //     that fades in then out at each chapter start
  // =========================================================
  const CHAPTER_WHISPERS = [
    'Kuch shuru hone se pehle...',
    'Baarish ki pehli bund ki tarah...',
    'Awaaz pehle milti hai, chehra baad mein...',
    'Jo nahi sochte, woh ho jaata hai...',
    'Teen alag si yaadein. Ek hi insaan.',
    'Dosti waqt maangti hai. Hamesha.',
    'Jo keh nahi paaye, woh bhi kuch kehte hain...',
    'Kab hua pata hi nahi chala...',
    'Koi perfect waqt nahi hota...',
  ];

  const whisperEl = document.createElement('div');
  whisperEl.id = 'chapter-whisper';
  document.body.appendChild(whisperEl);

  if (typeof IntersectionObserver !== 'undefined') {
    chapterHeaders.forEach((header, i) => {
      let whisperFired = false;
      new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !whisperFired) {
          whisperFired = true;
          const text = CHAPTER_WHISPERS[i];
          if (!text) return;
          whisperEl.textContent = text;
          whisperEl.classList.add('show');
          setTimeout(() => whisperEl.classList.remove('show'), 2800);
        }
      }, { threshold: 0.5 }).observe(header);
    });
  }

})();
