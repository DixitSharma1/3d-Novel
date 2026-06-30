// =========================================
// SCENES.JS
// Scroll-driven scene system — extracted
// verbatim from the previous inline <script>
// block: word-by-word reveal, ambient dust/
// shards, 3D tilt, scroll reveal, GSAP scene
// animations, parallax, floating quotes, and
// active-scene detection. Behavior, timing,
// and DOM ids are unchanged.
// =========================================
(function () {
  // ============================================
  // WORD-BY-WORD REVEAL (highlight quote)
  // ============================================
  document.querySelectorAll('[data-word-reveal]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map((w, i) => `<span class="word-reveal" style="--d:${(i * 0.07).toFixed(2)}s">${w}</span>`)
      .join(' ');
  });

  const wordRevealTargets = document.querySelectorAll('[data-word-reveal]');

  function revealWordsOnScroll() {
    const trigger = window.innerHeight * 0.8;
    wordRevealTargets.forEach(el => {
      if (el.getBoundingClientRect().top < trigger) {
        el.querySelectorAll('.word-reveal').forEach(w => w.classList.add('active'));
      }
    });
  }

  if (window.PerfCore) window.PerfCore.onScroll(revealWordsOnScroll);
  else window.addEventListener('scroll', revealWordsOnScroll, { passive: true });
  revealWordsOnScroll();

  // ============================================
  // AMBIENT SCENE DUST (per-scene floating motes)
  // ============================================
  document.querySelectorAll('.scene-dust').forEach(container => {
    const count = 10 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const mote = document.createElement('span');
      const startLeft = Math.random() * 100;
      const duration = 8 + Math.random() * 10;
      const delay = Math.random() * duration;
      const drift = (Math.random() * 1.4 + 0.4).toFixed(2);
      mote.style.left = startLeft + '%';
      mote.style.top = (60 + Math.random() * 40) + '%';
      mote.style.opacity = (Math.random() * 0.4 + 0.15).toFixed(2);
      mote.style.animationDuration = duration + 's';
      mote.style.animationDelay = '-' + delay + 's';
      mote.style.transform = `scale(${drift})`;
      container.appendChild(mote);
    }
  });

  // ============================================
  // AMBIENT GOLD SHARDS (3D depth layer — these
  // travel through translateZ space, not just X/Y,
  // so they pass "near" and "far" the viewer)
  // ============================================
  document.querySelectorAll('.scene-shards').forEach(container => {
    const count = 6 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      const shard = document.createElement('span');
      const duration = 9 + Math.random() * 8;
      const delay = Math.random() * duration;
      const size = (Math.random() * 6 + 4).toFixed(1);
      shard.style.left = (Math.random() * 100) + '%';
      shard.style.top = (Math.random() * 100) + '%';
      shard.style.width = size + 'px';
      shard.style.height = size + 'px';
      shard.style.animationDuration = duration + 's';
      shard.style.animationDelay = '-' + delay + 's';
      container.appendChild(shard);
    }
  });

  // ============================================
  // 3D MOUSE TILT (desktop only — cards lean
  // gently toward the cursor like glass panels
  // catching the light). Uses gsap.quickTo so it
  // composes correctly with the scroll-triggered
  // 3D transforms on the same elements, instead
  // of fighting over inline transform styles.
  // ============================================
  if (window.matchMedia('(pointer: fine)').matches && typeof gsap !== 'undefined') {
    document.querySelectorAll('.tilt-3d').forEach(card => {
      const setRX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power2.out' });
      const setRY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power2.out' });
      const parentScene = card.closest('.scene');

      card.addEventListener('mousemove', (e) => {
        // Skip while this card's own entrance animation is still likely
        // running, so the mouse-tilt quickTo doesn't fight the scroll
        // entrance tween over the same rotationX/rotationY properties.
        if (parentScene && !parentScene.classList.contains('active-scene')) return;

        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        setRX(py * -6);
        setRY(px * 6);
      });

      card.addEventListener('mouseleave', () => {
        setRX(0);
        setRY(0);
      });
    });
  }

  // ============================================
  // SCROLL REVEAL
  // ============================================
  const reveals = document.querySelectorAll('.reveal');

  function revealOnScroll() {
    const trigger = window.innerHeight * 0.85;
    reveals.forEach(item => {
      if (item.getBoundingClientRect().top < trigger) item.classList.add('active');
    });
  }

  if (window.PerfCore) window.PerfCore.onScroll(revealOnScroll);
  else window.addEventListener('scroll', revealOnScroll, { passive: true });
  revealOnScroll();

  // ============================================
  // GSAP ANIMATIONS (after load)
  // ============================================
  window.addEventListener('load', () => {
    if (typeof gsap === 'undefined') return;

    gsap.from('#title', { y: 80, opacity: 0, duration: 1.8, ease: 'power4.out' });
    gsap.from('.intro-subtitle', { y: 40, opacity: 0, duration: 1.5, delay: 0.4, ease: 'power3.out' });
    gsap.from('#start-btn', { scale: 0.7, opacity: 0, duration: 1.2, delay: 0.8, ease: 'back.out(1.7)' });
    gsap.from('.question-box', { y: 60, opacity: 0, duration: 1.5, ease: 'power3.out' });

    // ---- Every scene card rises out of 3D space toward the viewer ----
    // rotationX makes it feel like a panel tilting up off a table, the
    // z pulls it from "far away" to "right in front of you".
    document.querySelectorAll('.scene:not(.highlight-section) .scene-content').forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 82%' },
        rotationX: -22,
        rotationY: i % 2 === 0 ? 8 : -8,
        z: -260,
        opacity: 0,
        duration: 1.6,
        ease: 'power3.out'
      });

      // Continuous subtle 3D sway while the card is on screen — uses x/
      // rotationZ, which the entrance tween above never touches, so the
      // two never fight over the same property mid-animation.
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        },
        x: i % 2 === 0 ? 14 : -14,
        rotationZ: i % 2 === 0 ? 0.6 : -0.6,
        ease: 'none'
      });
    });

    if (document.querySelector('.scene-title')) {
      gsap.from('.scene-title', {
        scrollTrigger: { trigger: '.scene-title', start: 'top 80%' },
        rotationX: -35, z: -120, y: 60, opacity: 0,
        duration: 1.6, ease: 'power4.out', transformOrigin: '50% 100%'
      });
    }

    gsap.from('.date-badge', {
      scrollTrigger: { trigger: '.date-badge', start: 'top 85%' },
      y: 24, z: -80, opacity: 0, duration: 1, ease: 'power3.out'
    });

    // Flowers spin in out of 3D depth rather than just popping in, then
    // settle into a perpetual gentle 3D bob — all owned by GSAP so there's
    // no competing CSS @keyframes animation on the same transform.
    document.querySelectorAll('.flower-text').forEach(flower => {
      gsap.from(flower, {
        scrollTrigger: { trigger: flower, start: 'top 82%' },
        rotationY: 180, scale: 0.3, z: -200, opacity: 0,
        duration: 1.6, ease: 'back.out(1.4)',
        onComplete: () => {
          gsap.to(flower, {
            y: -10, rotationZ: 3, z: 20,
            duration: 3.2, ease: 'sine.inOut',
            repeat: -1, yoyo: true
          });
        }
      });
    });

    // Highlight quote unfolds like a page lifting off the surface
    gsap.from('.highlight-text', {
      scrollTrigger: { trigger: '.highlight-text', start: 'top 78%' },
      rotationX: 90, z: -300, opacity: 0,
      duration: 1.8, ease: 'power3.out', transformOrigin: '50% 0%'
    });

    // Heart arrives from deep in 3D space with a full spin, then settles
    // into a slow, perpetual 3D float/wobble — GSAP owns its transform
    // for the whole lifecycle so it never fights a CSS @keyframes rule.
    const heartImg = document.querySelector('.heart-image');
    if (heartImg) {
      gsap.from(heartImg, {
        scrollTrigger: { trigger: heartImg, start: 'top 85%' },
        rotationY: 540, scale: 0.2, z: -400, opacity: 0,
        duration: 2.2, ease: 'power3.out',
        onComplete: () => {
          gsap.to(heartImg, {
            y: -14, z: 40, rotationY: 8, rotationX: 3,
            duration: 4.5, ease: 'sine.inOut',
            repeat: -1, yoyo: true
          });
        }
      });
    }

    if (document.querySelector('.final-quote')) {
      gsap.from('.final-quote', {
        scrollTrigger: { trigger: '.final-quote', start: 'top 85%' },
        y: 40, z: -100, opacity: 0, duration: 1.4, ease: 'power3.out'
      });
    }
  });

  // ============================================
  // PARALLAX
  // (targets dedicated wrapper divs, not the
  // CSS-animated elements themselves, so the
  // scroll-driven offset never overwrites their
  // own orbFloat/heartGlow keyframe animations)
  // ============================================
  function parallaxOnScroll() {
    const scrollY = window.scrollY;
    const orbWrap = document.querySelector('.gold-orb-parallax');
    if (orbWrap) orbWrap.style.transform = `translateY(${scrollY * 0.08}px)`;
    const heartGlowWrap = document.querySelector('.heart-glow-parallax');
    if (heartGlowWrap) heartGlowWrap.style.transform = `translateY(${scrollY * -0.03}px)`;
  }
  if (window.PerfCore) window.PerfCore.onScroll(parallaxOnScroll);
  else window.addEventListener('scroll', parallaxOnScroll, { passive: true });

  // ============================================
  // FLOATING QUOTES
  // ============================================
  document.querySelectorAll('.hidden-quote').forEach((quote, i) => {
    setInterval(() => {
      const rx = Math.random() * 10 - 5;
      const ry = Math.random() * 10 - 5;
      quote.style.transform = `translate(${rx}px, ${ry}px)`;
    }, 3000 + i * 1000);
  });

  // ============================================
  // SCENE DETECTION
  // ============================================
  const scenes = document.querySelectorAll('.scene');
  function detectActiveScene() {
    const scrollPos = window.scrollY + window.innerHeight / 2;
    scenes.forEach(scene => {
      const top = scene.offsetTop;
      const height = scene.offsetHeight;
      if (scrollPos > top && scrollPos < top + height) {
        scene.classList.add('active-scene');
      } else {
        scene.classList.remove('active-scene');
      }
    });
  }
  if (window.PerfCore) window.PerfCore.onScroll(detectActiveScene);
  else window.addEventListener('scroll', detectActiveScene, { passive: true });

  // ============================================
  // PUBLIC API
  // ============================================
  window.SceneManager = {
    revealOnScroll,
    revealWordsOnScroll
  };
})();
