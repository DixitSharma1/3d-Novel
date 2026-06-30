// =========================================
// MAIN.JS
// Application flow — extracted verbatim from
// the previous inline <script> block: mobile
// particle canvas, preloader, the royal letter
// opening cinematic, and the question/story flow.
// Behavior, timing, and DOM ids are unchanged.
// =========================================
(function () {
  // ============================================
  // MOBILE BLOCK — PARTICLE CANVAS
  // ============================================
  (function () {
    const mCanvas = document.getElementById('mobile-particles');
    if (!mCanvas) return;
    const mCtx = mCanvas.getContext('2d');
    mCanvas.width = window.innerWidth;
    mCanvas.height = window.innerHeight;
    const mParts = Array.from({ length: 40 }, () => ({
      x: Math.random() * mCanvas.width,
      y: Math.random() * mCanvas.height,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.4 + 0.1
    }));
    function mAnimate() {
      mCtx.clearRect(0, 0, mCanvas.width, mCanvas.height);
      mParts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > mCanvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > mCanvas.height) p.vy *= -1;
        mCtx.beginPath();
        mCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        mCtx.fillStyle = `rgba(229,193,88,${p.o})`;
        mCtx.fill();
      });
    }
    if (window.PerfCore) window.PerfCore.registerLoop(mAnimate);
    else (function loop() { mAnimate(); requestAnimationFrame(loop); })();
  })();

  // ============================================
  // PRELOADER SYSTEM
  // ============================================
  const MESSAGES = [
    'Gathering Memories...',
    'Loading Emotions...',
    'Opening Untold Feelings...',
    'Preparing Something Special...',
    'Setting the Mood...'
  ];

  let msgIdx = 0;
  const preloaderMsg = document.getElementById('preloader-msg');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderPct = document.getElementById('preloader-percent');
  let loadProgress = 0;

  // Rotating messages
  const msgInterval = setInterval(() => {
    msgIdx = (msgIdx + 1) % MESSAGES.length;
    preloaderMsg.style.opacity = '0';
    setTimeout(() => {
      preloaderMsg.textContent = MESSAGES[msgIdx];
      preloaderMsg.style.opacity = '1';
    }, 300);
  }, 1800);

  // Preloader particles
  (function () {
    const pCanvas = document.createElement('canvas');
    const pContainer = document.getElementById('preloader-particles');
    pCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    pContainer.appendChild(pCanvas);
    const pCtx = pCanvas.getContext('2d');
    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;
    const pParts = Array.from({ length: Math.round(60 * (window.PerfCore ? window.PerfCore.particleScale : 1)) }, () => ({
      x: Math.random() * pCanvas.width,
      y: Math.random() * pCanvas.height,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      o: Math.random() * 0.35 + 0.05
    }));
    let pRunning = true;
    let pLoop = null;
    function pAnimate() {
      if (!pRunning) return;
      pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
      pParts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > pCanvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > pCanvas.height) p.vy *= -1;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        pCtx.fillStyle = `rgba(229,193,88,${p.o})`;
        pCtx.fill();
      });
    }
    if (window.PerfCore) pLoop = window.PerfCore.registerLoop(pAnimate);
    else (function loop() { pAnimate(); if (pRunning) requestAnimationFrame(loop); })();
    window.stopPreloaderParticles = () => { pRunning = false; if (pLoop) pLoop.stop(); };
  })();

  function setProgress(pct) {
    loadProgress = pct;
    preloaderBar.style.width = pct + '%';
    preloaderPct.textContent = Math.floor(pct) + '%';
  }

  function completePreloader() {
    clearInterval(msgInterval);
    setProgress(100);
    preloaderMsg.textContent = 'Ready ✦';
    setTimeout(() => {
      window.stopPreloaderParticles && window.stopPreloaderParticles();
      const preloader = document.getElementById('preloader');
      preloader.style.transition = 'opacity 1s ease';
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
        // Show audio modal
        document.getElementById('audio-modal').style.display = 'flex';
      }, 1000);
    }, 600);
  }

  // Real asset list — every asset the experience actually needs before
  // the first scene is allowed to render. Progress below is driven by
  // these assets actually finishing, not a fake timer.
  const ASSET_IMAGES = [
    'assets/images/heart.webp',
    'assets/images/bridge-bg.webp',
    'assets/images/paper-texture.webp'
  ];
  const ASSET_AUDIO_IDS = ['rain-audio', 'piano-audio', 'thunder-audio', 'lightning-audio'];

  function preloadImage(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve; // never block the experience on a missing asset
      img.src = src;
    });
  }

  function preloadAudioEl(id) {
    return new Promise(resolve => {
      const el = document.getElementById(id);
      if (!el) return resolve();
      if (el.readyState >= 3) return resolve();
      el.addEventListener('canplaythrough', resolve, { once: true });
      el.addEventListener('error', resolve, { once: true });
      // Safety timeout — slow/odd networks shouldn't hang the preloader forever
      setTimeout(resolve, 8000);
      el.load();
    });
  }

  function preloadFonts() {
    if (!document.fonts || !document.fonts.ready) return Promise.resolve();
    return Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 4000))]);
  }

  const realAssetTasks = [
    ...ASSET_IMAGES.map(preloadImage),
    ...ASSET_AUDIO_IDS.map(preloadAudioEl),
    preloadFonts()
  ];
  let realAssetsLoaded = 0;
  const realAssetsTotal = realAssetTasks.length;
  realAssetTasks.forEach(p => p.then(() => { realAssetsLoaded++; }));
  const allAssetsReady = Promise.all(realAssetTasks);

  // ---- Slow connection notice ----
  // On detected slow-2g / 2g / save-data connections, show a calm cinematic
  // message and make sure every asset is actually fully loaded before
  // letting the story begin, rather than starting and stuttering through it.
  const slowNoticeEl = document.getElementById('preloader-msg');
  if (window.PerfCore && window.PerfCore.slowNet && slowNoticeEl) {
    slowNoticeEl.textContent = 'Your connection appears slow. Preparing your experience...';
  }
  // Progress is now driven by real asset completion (realAssetsLoaded /
  // realAssetsTotal) rather than a fixed fake timer. We poll lightly
  // (every 80ms — cheap, not a hot loop) and ease the displayed bar toward
  // the real value so it still feels smooth instead of jumping in chunks.
  let displayed = 0;
  const minDisplayMs = 1200; // keep the cinematic feel even on fast connections
  const startTime = performance.now();
  let pollTimer = null;

  function pollProgress() {
    const realPct = (realAssetsLoaded / realAssetsTotal) * 100;
    displayed += (realPct - displayed) * 0.18;
    setProgress(Math.min(99, displayed));
  }

  function finishWhenReady() {
    allAssetsReady.then(() => {
      const elapsed = performance.now() - startTime;
      const wait = Math.max(0, minDisplayMs - elapsed);
      setTimeout(() => {
        clearInterval(pollTimer);
        completePreloader();
      }, wait);
    });
  }

  // Start loading after DOM+fonts ready
  document.fonts.ready.then(() => {
    setTimeout(() => {
      pollTimer = setInterval(pollProgress, 80);
      finishWhenReady();
    }, 200);
  });

  // ============================================
  // CINEMATIC ROYAL LETTER OPENING
  // ============================================
  const openingCanvas = document.getElementById('opening-canvas');
  const oCtx = openingCanvas.getContext('2d');
  let openingParticles = [];
  let openingRunning = false;

  function resizeOpeningCanvas() {
    openingCanvas.width = window.innerWidth;
    openingCanvas.height = window.innerHeight;
  }
  resizeOpeningCanvas();
  window.addEventListener('resize', resizeOpeningCanvas);

  function spawnOpeningParticle(burst = false) {
    const cx = openingCanvas.width / 2;
    const cy = openingCanvas.height / 2;
    const angle = Math.random() * Math.PI * 2;
    const speed = burst ? (Math.random() * 8 + 3) : (Math.random() * 1.5 + 0.3);
    const dist = burst ? 0 : (Math.random() * 250 + 50);
    openingParticles.push({
      x: burst ? cx : cx + Math.cos(angle) * dist * Math.random(),
      y: burst ? cy : cy + Math.sin(angle) * dist * Math.random(),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (burst ? 2 : 0),
      r: Math.random() * (burst ? 3 : 1.5) + 0.5,
      o: burst ? 0.9 : (Math.random() * 0.5 + 0.1),
      life: 1,
      decay: Math.random() * 0.015 + (burst ? 0.02 : 0.004)
    });
  }

  function animateOpeningCanvas() {
    if (!openingRunning) return;
    if (window.PerfCore && window.PerfCore.hidden) {
      requestAnimationFrame(animateOpeningCanvas);
      return;
    }
    oCtx.clearRect(0, 0, openingCanvas.width, openingCanvas.height);
    openingParticles = openingParticles.filter(p => p.life > 0);

    // Ambient spawn — scaled so weak devices aren't overwhelmed
    const _ambientChance = window.PerfCore ? (window.PerfCore.veryLowEnd ? 0.1 : window.PerfCore.lowEnd ? 0.2 : 0.35) : 0.35;
    if (Math.random() < _ambientChance) spawnOpeningParticle(false);

    openingParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy -= 0.04; // float up
      p.life -= p.decay;
      oCtx.beginPath();
      oCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      oCtx.fillStyle = `rgba(229,193,88,${p.o * p.life})`;
      oCtx.fill();
    });

    requestAnimationFrame(animateOpeningCanvas);
  }

  function runRoyalOpening(onComplete) {
    const letterOpening = document.getElementById('letter-opening');
    const stageSeal = document.getElementById('stage-seal');
    const stageQuote = document.getElementById('stage-quote');
    const paperTop = document.getElementById('paper-top');
    const paperBottom = document.getElementById('paper-bottom');
    const goldenBurst = document.getElementById('golden-burst');

    letterOpening.style.display = 'block';
    letterOpening.style.opacity = '1';
    openingRunning = true;
    animateOpeningCanvas();

    // Piano ducks the instant the sequence starts — no waiting around.
    if (window.AudioManager.audioEnabled) {
      window.AudioManager.fadeVolume(window.AudioManager.pianoAudio, window.AudioManager.pianoAudio.volume * 0.5, 500);
    }

    const tl = gsap.timeline({
      onComplete: () => {
        openingRunning = false;
        if (window.AudioManager.audioEnabled) window.AudioManager.applyVolumes();
        document.getElementById('letter-container').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Show floating quotes now that the letter is open.
        // Quotes start at opacity:0 via CSS (display:none removed from HTML)
        // so they are always present in the DOM and this reveal is reliable
        // even if the GSAP CDN was slow to arrive.
        document.querySelectorAll('.hidden-quote').forEach((el, i) => {
          const delayMs = i * 400;
          if (typeof gsap !== 'undefined') {
            // GSAP path — smooth ease with floating animation after
            gsap.to(el, {
              opacity: 1, duration: 1.5, delay: i * 0.4, ease: 'power2.out',
              onComplete: () => { el.style.animation = 'floatingQuotes 10s ease-in-out infinite'; }
            });
          } else {
            // CSS fallback — no GSAP dependency
            el.style.transition = `opacity 1.5s ease ${delayMs}ms`;
            // rAF ensures the transition actually fires (not skipped as a no-op)
            requestAnimationFrame(() => {
              el.style.opacity = '1';
              setTimeout(() => {
                el.style.transition = '';
                el.style.animation = 'floatingQuotes 10s ease-in-out infinite';
              }, 1500 + delayMs);
            });
          }
        });
        onComplete && onComplete();
      }
    });

    // Stage 2-3: Seal appears — fires immediately, no dead air before it.
    tl.to(stageSeal, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0)
      .from(stageSeal.querySelector('.royal-seal'), { scale: 0, duration: 0.9, ease: 'back.out(1.7)' }, 0);

    // Stage 4: Seal crack + golden burst
    tl.call(() => {
      const burstCount = Math.round(50 * (window.PerfCore ? window.PerfCore.particleScale : 1));
      for (let i = 0; i < burstCount; i++) setTimeout(() => spawnOpeningParticle(true), i * 12);
      goldenBurst.style.opacity = '0';
    }, null, 1.8)
      .to(stageSeal.querySelector('.royal-seal'), { scale: 1.3, opacity: 0, duration: 0.5, ease: 'power4.in' }, 1.8)
      .to(stageSeal, { opacity: 0, duration: 0.6 }, 2.1)
      .to(goldenBurst, { opacity: 1, scale: 2, duration: 0.7, ease: 'power2.out' }, 1.8)
      .to(goldenBurst, { opacity: 0, scale: 3, duration: 1, ease: 'power2.in' }, 2.5);

    // Stage 5-6: Emotional quote appears — extended window for typewriter lines
    tl.to(stageQuote, { opacity: 1, duration: 1.1, ease: 'power2.out' }, 2.7)
      .from(stageQuote.querySelector('#opening-typewriter-block'), { y: 30, duration: 1.1, ease: 'power3.out' }, 2.7)
      // Fire typewriter event once the stage is fully visible
      .call(() => { document.dispatchEvent(new CustomEvent('openingQuoteStart')); }, null, 3.0);

    // Stage 7: Paper panels — delayed to give typewriter time (3 lines × ~1.8s each ≈ 5.4s + pause)
    // Quote visible: 2.7s → 8.6s  (5.9s window — enough for all 3 lines at ~40ms/char)
    tl.to(stageQuote, { opacity: 0, duration: 0.7 }, 8.6)
      .to(paperTop,    { y: '0%', duration: 0.9, ease: 'power4.inOut' }, 9.2)
      .to(paperBottom, { y: '0%', duration: 0.9, ease: 'power4.inOut' }, 9.2)
      .to(goldenBurst, { opacity: 0.6, scale: 1.5, duration: 1.5, ease: 'power2.out' }, 9.2)
      .to(paperTop,    { y: '-100%', duration: 1.2, ease: 'power4.inOut' }, 10.4)
      .to(paperBottom, { y: '100%',  duration: 1.2, ease: 'power4.inOut' }, 10.4);

    // Stage 8: Complete — enter letter (shifted to match extended timeline)
    tl.to(letterOpening, { opacity: 0, duration: 1, ease: 'power2.in' }, 11.8)
      .call(() => { letterOpening.style.display = 'none'; }, null, 12.8);
  }

  // ============================================
  // MAIN FLOW
  // ============================================
  const startBtn = document.getElementById('start-btn');
  const intro = document.getElementById('intro');
  const questionSection = document.getElementById('questions-section');
  const friendMode = document.getElementById('friend-mode'); // used by proposal.js via window scope
  const q1 = document.getElementById('q1');
  const q2 = document.getElementById('q2');
  const q3 = document.getElementById('q3');

  function showQuestion(step) {
    [q1, q2, q3].forEach(q => q?.classList.remove('active'));
    const t = document.getElementById(`q${step}`);
    if (t) {
      t.style.opacity = '0';
      t.classList.add('active');
      gsap.to(t, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
      gsap.from(t, { y: 20, duration: 0.6, ease: 'power3.out' });
    }
  }

  startBtn?.addEventListener('click', () => {
    gsap.to(intro, { opacity: 0, duration: 0.8, onComplete: () => {
      intro.style.display = 'none';
      questionSection.style.display = 'flex';
      showQuestion(1);
    }});
  });

  // ─── SEND EVERY ANSWER TO MAIL (FormSubmit AJAX) ────────────────────
  // Previously only the final proposal YES/NO buttons emailed anything.
  // q1/q2/q3 just showed a "sent" toast without actually sending.
  // This fixes that so every step's answer is emailed too.
  function sendToMail(question, answer) {
    const data = new FormData();
    data.append('_subject', `Novel Response: ${question}`);
    data.append('_captcha', 'false');
    data.append('_template', 'table');
    data.append('question', question);
    data.append('answer', answer);
    data.append('timestamp', nowIST());

    fetch('https://formsubmit.co/ajax/dixitkhanda@gmail.com', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: data
    }).then(res => res.json())
      .then(json => {
        if (json && json.success === 'true') {
          console.log(`[Novel] "${question}" answer emailed successfully.`);
        }
      })
      .catch(e => {
        // Silent — experience never blocks on network
        console.warn(`[Novel] Failed to email "${question}" answer:`, e);
      });
  }

  // ─── FLOW TOAST (visible on every question answer) ─────────────────
  function showFlowToast(msg, duration) {
    const t = document.createElement('div');
    t.className = 'submission-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => {
      t.classList.add('show');
      setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 600);
      }, duration || 3000);
    });
  }

  q1?.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      sendToMail('Do you trust me?', btn.textContent.trim());
      showFlowToast('✦ Entering the next world of the novel...');
      showQuestion(2);
    });
  });

  q2?.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('not-now-trigger')) {
        sendToMail('Should I show you something personal?', btn.textContent.trim());
        showFlowToast('✦Okay🥺');
        openNotNowPage();
        return;
      }
      sendToMail('Should I show you something personal?', btn.textContent.trim());
      showFlowToast('✦ You\'re entering the novel now...');
      showQuestion(3);
    });
  });

  // ─── TIMESTAMP HELPER ──────────────────────────────────────────────
  function nowIST() {
    return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  }

  // ─── NOT-NOW PAGE: EARTHQUAKE + TSUNAMI EFFECT ─────────────────────
  function openNotNowPage() {
    const notNowPage = document.getElementById('not-now-page');
    if (!notNowPage) return;

    gsap.to(questionSection, { opacity: 0, duration: 0.6, onComplete: () => {
      questionSection.style.display = 'none';
      notNowPage.style.display = 'block';
      gsap.from('#not-now-content', { opacity: 0, y: 30, duration: 0.9, ease: 'power2.out' });
      setTimeout(() => startEarthquake(), 2200);
    }});
  }

  function startEarthquake() {
    const page   = document.getElementById('not-now-page');
    const canvas = document.getElementById('not-now-canvas');
    const content = document.getElementById('not-now-content');
    const final  = document.getElementById('not-now-final');
    if (!page || !canvas) return;

    // ── Canvas setup ──────────────────────────────────────────────────
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    // Debris particles for tsunami
    const debris = [];
    function spawnDebris(count, fromBottom) {
      for (let i = 0; i < count; i++) {
        debris.push({
          x: Math.random() * canvas.width,
          y: fromBottom ? canvas.height + Math.random() * 100 : Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 6,
          vy: fromBottom ? -(4 + Math.random() * 8) : (Math.random() - 0.5) * 3,
          size: 2 + Math.random() * 6,
          life: 1,
          decay: 0.006 + Math.random() * 0.012,
          color: Math.random() < 0.5
            ? `rgba(60,100,180,${0.4 + Math.random() * 0.4})`
            : `rgba(229,193,88,${0.2 + Math.random() * 0.3})`
        });
      }
    }

    // Wave state
    let waveY  = canvas.height + 80;
    let waveSpeed = 0;
    let waveActive = false;
    let shakeIntensity = 0;
    let running = true;

    function loop() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw tsunami wave
      if (waveActive) {
        waveY -= waveSpeed;
        waveSpeed = Math.min(waveSpeed + 0.4, 18);

        // Wave body gradient
        const grad = ctx.createLinearGradient(0, waveY, 0, canvas.height);
        grad.addColorStop(0, 'rgba(30,70,160,0.75)');
        grad.addColorStop(0.3, 'rgba(20,50,130,0.6)');
        grad.addColorStop(1, 'rgba(10,20,80,0.4)');
        ctx.fillStyle = grad;

        // Irregular wave top
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(0, waveY + 40);
        const segments = 12;
        const segW = canvas.width / segments;
        for (let i = 0; i <= segments; i++) {
          const nx = i * segW;
          const ny = waveY + Math.sin(i * 0.8 + Date.now() * 0.003) * 30
                           + Math.cos(i * 1.3 + Date.now() * 0.002) * 20;
          ctx.lineTo(nx, ny);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Foam crest
        ctx.strokeStyle = 'rgba(200,220,255,0.35)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
          const nx = i * segW;
          const ny = waveY + Math.sin(i * 0.8 + Date.now() * 0.003) * 30
                           + Math.cos(i * 1.3 + Date.now() * 0.002) * 20;
          i === 0 ? ctx.moveTo(nx, ny) : ctx.lineTo(nx, ny);
        }
        ctx.stroke();

        spawnDebris(3, true);
      }

      // Debris particles
      for (let i = debris.length - 1; i >= 0; i--) {
        const p = debris[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.05;
        p.life -= p.decay;
        if (p.life <= 0) { debris.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.life * 0.9);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Screen shake — apply transform to content
      if (shakeIntensity > 0.5) {
        const sx = (Math.random() - 0.5) * shakeIntensity * 2;
        const sy = (Math.random() - 0.5) * shakeIntensity * 2;
        if (content) content.style.transform = `translate(${sx}px,${sy}px)`;
        shakeIntensity *= 0.93;
      } else {
        if (content) content.style.transform = '';
      }

      requestAnimationFrame(loop);
    }
    loop();

    // ── TIMELINE ─────────────────────────────────────────────────────
    // Phase 1: light rumble
    shakeIntensity = 6;
    spawnDebris(15, false);

    // Phase 2: heavy shake
    setTimeout(() => {
      shakeIntensity = 18;
      spawnDebris(30, false);
    }, 600);

    // Phase 3: tsunami wave rises
    setTimeout(() => {
      shakeIntensity = 12;
      waveActive = true;
      spawnDebris(40, true);
    }, 1200);

    // Phase 4: content fades as wave covers screen
    setTimeout(() => {
      if (content) {
        gsap.to(content, { opacity: 0, duration: 1.2, ease: 'power2.in' });
      }
    }, 2000);

    // Phase 5: wave covers everything — final message appears
    setTimeout(() => {
      running = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Dark ocean fill
      ctx.fillStyle = 'rgba(10,20,60,0.92)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (content) {
        content.style.transform = '';
        content.style.opacity = '1';
        // Hide early text, show final message
        ['not-now-emoji','not-now-title','not-now-text1','not-now-text2'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = 'none';
        });
        if (final) final.style.opacity = '1';
      }
    }, 3600);
  }



  q3?.querySelector('.final-open')?.addEventListener('click', () => {
    sendToMail('Promise you won\'t judge me too quickly?', 'Promise');
    showFlowToast('✦ The story begins...');
    runRoyalOpening();
    gsap.to(questionSection, { opacity: 0, duration: 0.6, onComplete: () => {
      questionSection.style.display = 'none';
    }});
  });

  q3?.querySelector('.go-back')?.addEventListener('click', () => {
    sendToMail('Promise you won\'t judge me too quickly?', 'I want to rethink…');
    showFlowToast('✦ Take your time...');
    showQuestion(2);
  });

  // ============================================
  // PUBLIC API (kept minimal — nothing outside
  // this file currently needs to reach into it)
  // ============================================
  window.App = {
    runRoyalOpening,
    showQuestion
  };
})();
