// =====================================================
// PROPOSAL.JS  — v2
// Fixes:
//   1. Opening quote typewriter (line-by-line)
//   2. Highlight text word-reveal visibility
//   3. Proposal card typewriter with reveal-on-scroll
//   4. FormSubmit AJAX to dixitkhanda@gmail.com
//   5. YES scene + NO→friend-mode transition
// =====================================================
(function () {
  'use strict';

  // =====================================================
  // 1. SCROLL PROGRESS RIBBON
  // =====================================================
  const ribbon = document.createElement('div');
  ribbon.className = 'scroll-ribbon';
  document.body.appendChild(ribbon);

  const _updateRibbon = (scrollY) => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    ribbon.style.width = (docH > 0 ? (scrollY / docH) * 100 : 0) + '%';
  };
  if (window.PerfCore) window.PerfCore.onScroll(_updateRibbon);
  else window.addEventListener('scroll', () => _updateRibbon(window.scrollY), { passive: true });

  // =====================================================
  // 2. LETTERBOX BARS
  // =====================================================
  const lbBars = document.createElement('div');
  lbBars.className = 'letterbox-bars';
  lbBars.innerHTML = '<div class="letterbox-top"></div><div class="letterbox-bottom"></div>';
  document.body.appendChild(lbBars);

  function showLetterbox(ms) {
    lbBars.classList.add('active');
    setTimeout(() => lbBars.classList.remove('active'), ms || 1400);
  }

  // =====================================================
  // 3. CHAPTER MEMORY ORBS
  // =====================================================
  const chapterOrbs = [
    { sel: '.ch1-identity', orbs: ['rgba(120,160,200,0.25)', 'rgba(80,120,180,0.15)'] },
    { sel: '.ch2-identity', orbs: ['rgba(60,100,160,0.3)', 'rgba(100,140,200,0.2)', 'rgba(40,80,140,0.15)'] },
    { sel: '.ch3-identity', orbs: ['rgba(180,140,80,0.2)', 'rgba(229,193,88,0.15)'] },
    { sel: '.ch4-identity', orbs: ['rgba(255,77,109,0.25)', 'rgba(255,120,150,0.15)'] },
    { sel: '.ch5-identity', orbs: ['rgba(229,193,88,0.25)', 'rgba(255,220,100,0.15)'] },
    { sel: '.ch6-identity', orbs: ['rgba(100,180,120,0.2)', 'rgba(80,160,100,0.12)'] },
    { sel: '.ch7-identity', orbs: ['rgba(160,100,60,0.2)', 'rgba(180,120,50,0.12)'] },
    { sel: '.ch8-identity', orbs: ['rgba(255,100,130,0.25)', 'rgba(255,77,109,0.2)', 'rgba(229,193,88,0.12)'] },
    { sel: '.ch9-identity', orbs: ['rgba(229,193,88,0.3)', 'rgba(255,100,130,0.2)', 'rgba(200,160,60,0.15)'] },
  ];

  chapterOrbs.forEach(({ sel, orbs }) => {
    document.querySelectorAll(sel).forEach(section => {
      orbs.forEach((c, i) => {
        const orb = document.createElement('div');
        orb.className = 'memory-orb';
        orb.style.cssText = [
          `width:${80 + i * 40}px`, `height:${80 + i * 40}px`,
          `background:radial-gradient(circle,${c},transparent 70%)`,
          `left:${10 + Math.random() * 70}%`, `top:${10 + Math.random() * 70}%`,
          `animation-delay:${i * 3}s`, `animation-duration:${12 + i * 4}s`,
          `--mx:${(Math.random() - 0.5) * 80}px`, `--my:${(Math.random() - 0.5) * 60}px`
        ].join(';');
        section.appendChild(orb);
      });
    });
  });

  // =====================================================
  // 4. FLOATING MEMORY WORDS
  // =====================================================
  const MEMORY_WORDS = ['Bridge','Awaaz','Baarish','Yaadein','Smile','January',
                         'Promise','Khwaab','Pyaar','Chapter','Forever','Yadein'];

  document.querySelectorAll('.chapter-header').forEach(section => {
    for (let i = 0; i < 5; i++) {
      const w = document.createElement('div');
      w.className = 'memory-word';
      w.textContent = MEMORY_WORDS[Math.floor(Math.random() * MEMORY_WORDS.length)];
      const size = (0.5 + Math.random() * 0.5).toFixed(2);
      w.style.cssText = [
        `font-size:${size}rem`, `left:${5 + Math.random() * 85}%`,
        `top:${5 + Math.random() * 85}%`, `--dur:${18 + Math.random() * 12}s`,
        `--delay:-${(Math.random() * 15).toFixed(1)}s`,
        `--rot:${((Math.random() - 0.5) * 20).toFixed(1)}deg`,
        `--dx:${((Math.random() - 0.5) * 60).toFixed(0)}px`,
        `--dy:${((Math.random() - 0.5) * 40).toFixed(0)}px`,
        `--opa:${(0.05 + Math.random() * 0.08).toFixed(3)}`,
        'font-style:italic', 'z-index:0', 'position:absolute', 'pointer-events:none'
      ].join(';');
      section.appendChild(w);
    }
  });

  // =====================================================
  // 5. CHAPTER PARALLAX ROMAN NUMERAL BACKGROUNDS
  // =====================================================
  // Roman numeral parallax — ONE consolidated scroll handler instead of 9
  const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX'];
  const _romanEls = [];
  const _romanHeaders = [];
  document.querySelectorAll('.chapter-header').forEach((header, i) => {
    const numEl = document.createElement('div');
    numEl.className = 'chapter-number-large';
    numEl.textContent = ROMAN[i] || String(i + 1);
    header.appendChild(numEl);
    _romanEls.push(numEl);
    _romanHeaders.push(header);
  });

  const _updateParallax = () => {
    const vh = window.innerHeight;
    _romanHeaders.forEach((header, i) => {
      const rect = header.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const p = 1 - (rect.top / vh);
      _romanEls[i].style.transform = `translate(-50%, calc(-50% + ${p * 30}px))`;
    });
  };
  if (window.PerfCore) window.PerfCore.onScroll(_updateParallax);
  else window.addEventListener('scroll', _updateParallax, { passive: true });

  // =====================================================
  // 6. OPENING QUOTE — TYPEWRITER LINE BY LINE
  //    Hooked onto the GSAP timeline via a custom event
  //    dispatched from main.js's runRoyalOpening call.
  // =====================================================
  const OTW_LINES = [
    { id: 'otw-1', text: 'Kuch kahaniyan likhi nahi jaatein.' },
    { id: 'otw-2', text: 'Woh bas ho jaati hain.' },
    { id: 'otw-3', text: 'Yeh bhi kuch aisi hi kahani hai.' }
  ];

  // Cursor element shared across lines
  let otwCursor = null;

  function typeOpeningLine(lineIndex, onDone) {
    if (lineIndex >= OTW_LINES.length) { onDone && onDone(); return; }
    const { id, text } = OTW_LINES[lineIndex];
    const el = document.getElementById(id);
    if (!el) { typeOpeningLine(lineIndex + 1, onDone); return; }

    // Move cursor into this line
    if (!otwCursor) {
      otwCursor = document.createElement('span');
      otwCursor.className = 'opening-tw-cursor-inline';
    }
    el.appendChild(otwCursor);

    let i = 0;
    const speed = 38; // ms per character — feels intentional, not rushed

    function tick() {
      if (i < text.length) {
        // Insert before cursor
        el.insertBefore(document.createTextNode(text[i]), otwCursor);
        i++;
        setTimeout(tick, speed + Math.random() * 18);
      } else {
        // Pause at end of line, then move on
        setTimeout(() => typeOpeningLine(lineIndex + 1, onDone), 520);
      }
    }
    tick();
  }

  // Listen for the custom event fired from main.js when stage-quote becomes visible
  document.addEventListener('openingQuoteStart', () => {
    typeOpeningLine(0, () => {
      // Hide cursor after all lines typed
      if (otwCursor) {
        otwCursor.style.animation = 'none';
        otwCursor.style.opacity = '0';
      }
    });
  });

  // (openingQuoteStart event is now fired directly from main.js GSAP timeline at t=3.0s)

  // =====================================================
  // 8. PROPOSAL TYPEWRITER — fires when #proposal-card
  //    scrolls into view (IntersectionObserver)
  // =====================================================
  const PROPOSAL_TEXT = 'Would you like to write the next chapter with me?';
  const proposalTwText  = document.getElementById('proposal-tw-text');
  const proposalTwCursor = document.getElementById('proposal-tw-cursor');
  const proposalTwHeart  = document.getElementById('proposal-tw-heart');
  const proposalButtons  = document.getElementById('proposal-buttons');
  const proposalDivider  = document.getElementById('proposal-divider');
  const proposalSig      = document.getElementById('proposal-signature');
  const proposalCard     = document.getElementById('proposal-card');

  let proposalTyped = false;

  function typeProposalText() {
    if (proposalTyped || !proposalTwText) return;
    proposalTyped = true;

    let i = 0;
    // Slower, deliberate pace — this is the emotional climax
    const baseSpeed = 55;

    function tick() {
      if (i < PROPOSAL_TEXT.length) {
        proposalTwText.textContent += PROPOSAL_TEXT[i];
        i++;
        // Natural micro-pauses at punctuation
        const ch = PROPOSAL_TEXT[i - 1];
        const pause = (ch === ',' || ch === '?' || ch === '!') ? baseSpeed * 6
                    : (ch === ' ' && Math.random() < 0.12) ? baseSpeed * 3
                    : baseSpeed + Math.random() * 25;
        setTimeout(tick, pause);
      } else {
        // Typing done — reveal heart emoji, hide cursor, show buttons
        if (proposalTwCursor) proposalTwCursor.classList.add('done');

        setTimeout(() => {
          // Heart pops in
          if (proposalTwHeart) {
            proposalTwHeart.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
            proposalTwHeart.style.transform  = 'scale(0.5)';
            requestAnimationFrame(() => {
              proposalTwHeart.style.opacity   = '1';
              proposalTwHeart.style.transform = 'scale(1)';
            });
          }
        }, 300);

        setTimeout(() => {
          // Divider slides in
          if (proposalDivider) {
            proposalDivider.style.transition = 'opacity 0.8s ease';
            proposalDivider.style.opacity = '1';
          }
        }, 700);

        setTimeout(() => {
          // Buttons rise up
          if (proposalButtons) {
            proposalButtons.style.opacity = '1';
            proposalButtons.style.transform = 'translateY(0)';
          }
          // Signature fades in
          if (proposalSig) proposalSig.style.opacity = '1';
        }, 1100);
      }
    }

    // Small initial delay for dramatic effect
    setTimeout(tick, 600);
  }

  if (proposalCard && typeof IntersectionObserver !== 'undefined') {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        obs.disconnect();
        typeProposalText();
      }
    }, { threshold: 0.45 });
    obs.observe(proposalCard);
  } else if (proposalCard) {
    // Fallback: type immediately
    setTimeout(typeProposalText, 400);
  }

  // =====================================================
  // 9. TOAST NOTIFICATION
  // =====================================================
  function showToast(msg, duration) {
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

  // =====================================================
  // 10. FORMSUBMIT AJAX — dixitkhanda@gmail.com
  // =====================================================
  async function submitAnswer(answer) {
    const form = document.getElementById('proposal-form');
    if (!form) return;

    document.getElementById('form-answer').value    = answer;
    document.getElementById('form-subject').value   = `Novel Response: ${answer}`;
    document.getElementById('form-timestamp').value = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const data = new FormData(form);
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data
      });
      const json = await res.json();
      if (json && json.success === 'true') {
        console.log('[Novel] Form submitted successfully.');
      }
    } catch (e) {
      // Silent — experience never blocks on network
      console.warn('[Novel] Form submit failed (network):', e);
    }
  }

  // =====================================================
  // 11. YES SCENE — heart particle canvas
  // =====================================================
  function launchYesScene() {
    const scene = document.getElementById('yes-scene');
    if (!scene) return;
    scene.classList.add('active');
    document.body.style.overflow = 'hidden';

    const canvas = scene.querySelector('.yes-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    const EMOJIS = ['❤️','💛','🌸','✨','💕','🌺','💖'];
    const particles = [];
    // Scale particle burst to device capability — keeps the scene beautiful
    // on strong devices and smooth on low-end ones.
    const _perfScale = window.PerfCore ? window.PerfCore.particleScale : 1;
    const BURST_COUNT   = Math.round(28 * _perfScale);  // was 70 — too heavy
    const AMBIENT_CHANCE = 0.12 * _perfScale;            // was 0.4

    function spawn(burst) {
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const angle = Math.random() * Math.PI * 2;
      const speed = burst ? 4 + Math.random() * 9 : 0.6 + Math.random() * 2;
      particles.push({
        x: burst ? cx : Math.random() * canvas.width,
        y: burst ? cy : canvas.height + 20,
        vx: Math.cos(angle) * speed,
        vy: burst ? Math.sin(angle) * speed - 2.5 : -(1.2 + Math.random() * 2.8),
        size: burst ? 18 + Math.random() * 24 : 12 + Math.random() * 18,
        life: 1,
        decay: 0.005 + Math.random() * (burst ? 0.018 : 0.007),
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.07,
        drift: (Math.random() - 0.5) * 0.6
      });
    }

    // Burst on open
    for (let i = 0; i < BURST_COUNT; i++) setTimeout(() => spawn(true), i * 35);

    let running = true;
    let raf;
    function loop() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (Math.random() < AMBIENT_CHANCE) spawn(false);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x  += p.vx + p.drift;
        p.y  += p.vy;
        p.vy -= 0.025;
        p.rot += p.rotV;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life * 0.95);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      }
      raf = requestAnimationFrame(loop);
    }
    loop();

    scene.querySelector('.yes-close-btn')?.addEventListener('click', () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      scene.style.transition = 'opacity 0.8s ease';
      scene.style.opacity = '0';
      setTimeout(() => {
        scene.classList.remove('active');
        scene.style.opacity = '';
        document.body.style.overflow = '';
      }, 800);
    }, { once: true });
  }

  // =====================================================
  // 12. FRIEND MODE TRANSITION (NO path)
  // =====================================================
  function openFriendModeFromProposal() {
    showLetterbox(1800);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const main = document.getElementById('letter-container');
    const friend = document.getElementById('friend-mode');
    if (!friend) return;

    setTimeout(() => {
      if (main) {
        main.style.transition = 'opacity 0.9s ease';
        main.style.opacity = '0';
        setTimeout(() => {
          main.style.display = 'none';
          revealFriendMode(friend);
        }, 900);
      } else {
        revealFriendMode(friend);
      }
    }, 700);
  }

  function revealFriendMode(friend) {
    friend.style.display = 'flex';
    friend.style.opacity = '0';
    requestAnimationFrame(() => {
      friend.style.transition = 'opacity 1.2s ease';
      friend.style.opacity = '1';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Animate children in staggered
      friend.querySelectorAll('.friend-highlight-item').forEach((item, i) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = `opacity 0.6s ease ${0.4 + i * 0.15}s, transform 0.6s ease ${0.4 + i * 0.15}s`;
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateX(0)';
        }, 100 + i * 20);
      });
    });
  }

  // =====================================================
  // 13. BUTTON RIPPLE
  // =====================================================
  function addRipple(btn, e) {
    const rect = btn.getBoundingClientRect();
    const r = document.createElement('span');
    r.className = 'btn-ripple';
    const sz = Math.max(rect.width, rect.height);
    r.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - rect.left - sz / 2}px;top:${e.clientY - rect.top - sz / 2}px;`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 700);
  }

  // =====================================================
  // 14. YES / NO BUTTON HANDLERS
  // =====================================================
  const yesBtn = document.getElementById('proposal-yes-btn');
  const noBtn  = document.getElementById('proposal-no-btn');

  function lockButtons() {
    if (yesBtn) yesBtn.disabled = true;
    if (noBtn)  noBtn.disabled  = true;
  }

  if (yesBtn) {
    yesBtn.addEventListener('click', async (e) => {
      addRipple(yesBtn, e);
      lockButtons();
      showToast('✦❣️🥹😍🌹💘🌹');
      // Fire AJAX non-blocking
      submitAnswer('YES ❤️ — She said YES!');
      // Delay scene launch: give the browser one full rAF cycle after the
      // ripple + toast paint so the JS-heavy particle canvas doesn't steal
      // frames from the click animation on slow devices.
      setTimeout(() => requestAnimationFrame(() => launchYesScene()), 480);
    });
  }

  if (noBtn) {
    noBtn.addEventListener('click', async (e) => {
      addRipple(noBtn, e);
      lockButtons();
      showToast('✦💔🥺😔');
      submitAnswer('NO 🌸 — She chose friendship.');
      setTimeout(() => requestAnimationFrame(() => openFriendModeFromProposal()), 560);
    });
  }

  // =====================================================
  // 15. INLINE TYPEWRITER for scene lines that have
  //     the class .typewriter-moment (mid-novel lines)
  // =====================================================
  document.querySelectorAll('.typewriter-moment').forEach(el => {
    const full = el.textContent.trim();
    el.textContent = '';
    let started = false;

    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        obs.disconnect();
        let i = 0;
        const cursor = document.createElement('span');
        cursor.className = 'opening-tw-cursor-inline';
        el.appendChild(cursor);
        function tick() {
          if (i < full.length) {
            el.insertBefore(document.createTextNode(full[i]), cursor);
            i++;
            setTimeout(tick, 40 + Math.random() * 22);
          } else {
            cursor.style.animation = 'none';
            cursor.style.opacity = '0';
          }
        }
        setTimeout(tick, 250);
      }
    }, { threshold: 0.7 });
    obs.observe(el);
  });

  // =====================================================
  // 16. LENS FLARE on chapter headers
  // =====================================================
  if (typeof IntersectionObserver !== 'undefined' && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.chapter-header').forEach(h => {
      new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) triggerLensFlare();
      }, { threshold: 0.4 }).observe(h);
    });
  }

  function triggerLensFlare() {
    const flare = document.createElement('div');
    flare.className = 'lens-flare active';
    flare.style.cssText = `left:${20 + Math.random() * 60}%;top:${20 + Math.random() * 60}%;position:fixed;pointer-events:none;z-index:997;`;
    [80, 40, 20, 10].forEach((s, i) => {
      const d = document.createElement('div');
      d.className = 'flare-dot';
      d.style.cssText = `width:${s}px;height:${s}px;position:absolute;top:50%;left:50%;margin:-${s/2}px 0 0 -${s/2}px;animation-delay:${i * 0.05}s;filter:blur(${i + 2}px);`;
      flare.appendChild(d);
    });
    document.body.appendChild(flare);
    setTimeout(() => { flare.style.transition='opacity 0.4s'; flare.style.opacity='0'; setTimeout(() => flare.remove(), 400); }, 350);
  }

})();
