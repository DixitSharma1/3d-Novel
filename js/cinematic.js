// ============================================
// PREMIUM CINEMATIC ENHANCEMENT ENGINE
// ============================================

(function() {
  'use strict';

  // ============================================
  // 1. FLOATING PARTICLES SYSTEM
  // ============================================
  
  class ParticleSystem {
    constructor() {
      this.particles = [];
      this.container = document.querySelector('.particle-container') || this.createContainer();
      this.particleTypes = {
        heart: { emoji: '❤️', count: 15, class: 'heart-particle' },
        dust: { emoji: null, count: 30, class: 'dust-particle' },
        star: { emoji: null, count: 20, class: 'star-particle' },
        firefly: { emoji: null, count: 10, class: 'firefly-particle' }
      };
    }

    createContainer() {
      const container = document.createElement('div');
      container.className = 'particle-container';
      document.body.insertBefore(container, document.body.firstChild);
      return container;
    }

    createParticle(type = 'dust', x = null, y = null) {
      const typeConfig = this.particleTypes[type] || this.particleTypes.dust;
      const particle = document.createElement('div');
      particle.className = `floating-particle ${typeConfig.class}`;
      
      if (typeConfig.emoji) {
        particle.textContent = typeConfig.emoji;
      }

      const posX = x !== null ? x : Math.random() * window.innerWidth;
      const posY = y !== null ? y : Math.random() * window.innerHeight;
      const driftX = (Math.random() - 0.5) * 200;
      const delay = Math.random() * 5;

      particle.style.left = posX + 'px';
      particle.style.top = posY + 'px';
      particle.style.setProperty('--drift-x', driftX + 'px');
      particle.style.animationDelay = delay + 's';

      this.container.appendChild(particle);
      this.particles.push(particle);

      // Auto cleanup
      setTimeout(() => {
        particle.remove();
        this.particles = this.particles.filter(p => p !== particle);
      }, 15000);

      return particle;
    }

    burstParticles(type = 'heart', count = 30, centerX = null, centerY = null) {
      const x = centerX || window.innerWidth / 2;
      const y = centerY || window.innerHeight / 2;

      for (let i = 0; i < count; i++) {
        // 60 ms between each DOM insertion (was 30 ms) — halves the write
        // rate, keeping DOM mutations spread across frames rather than
        // stacking multiple insertions per frame and causing a layout spike.
        setTimeout(() => {
          this.createParticle(type, x, y);
        }, i * 60);
      }
    }

    startContinuousFlow(type = 'dust', count = 3, interval = 1000) {
      const flowInterval = setInterval(() => {
        for (let i = 0; i < count; i++) {
          this.createParticle(type);
        }
      }, interval);

      return flowInterval;
    }
  }

  // ============================================
  // 2. TEXT ANIMATION SYSTEM
  // ============================================

  class TextAnimator {
    static typewriter(element, text, speed = 50) {
      return new Promise((resolve) => {
        element.innerHTML = '';
        let index = 0;

        const type = () => {
          if (index < text.length) {
            element.textContent += text[index];
            index++;
            setTimeout(type, speed);
          } else {
            resolve();
          }
        };

        type();
      });
    }

    static characterReveal(element) {
      const text = element.textContent;
      element.innerHTML = '';

      text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'char-reveal';
        span.textContent = char;
        span.style.animationDelay = (i * 0.03) + 's';
        element.appendChild(span);
      });
    }

    static wordStagger(element) {
      const words = element.textContent.split(' ');
      element.innerHTML = '';

      words.forEach((word, i) => {
        const span = document.createElement('span');
        span.className = 'word-fade-up';
        span.textContent = word + ' ';
        span.style.animationDelay = (i * 0.1) + 's';
        element.appendChild(span);
      });
    }

    static staggeredFadeIn(element) {
      const text = element.textContent;
      const words = text.split(' ');
      
      element.innerHTML = words
        .map((word, i) => `<span style="--delay: ${i * 0.07}s">${word}</span>`)
        .join(' ');
      
      element.classList.add('stagger-text');
    }
  }

  // ============================================
  // 3. SCROLL PARALLAX ENGINE
  // ============================================

  class ScrollParallax {
    constructor() {
      this.elements = [];
      this.init();
    }

    init() {
      // Add parallax to all scene sections
      document.querySelectorAll('.scene').forEach((el, i) => {
        el.style.perspective = '1000px';
        this.elements.push({
          element: el,
          depth: 0.3 + (i * 0.05),
          originalY: 0
        });
      });

      if (window.PerfCore) window.PerfCore.onScroll(() => this.update());
      else window.addEventListener('scroll', () => this.update(), { passive: true });
    }

    update() {
      const scrollY = window.scrollY;

      this.elements.forEach(item => {
        const offset = scrollY * item.depth;
        item.element.style.transform = `translateY(${offset * -0.1}px)`;
      });
    }
  }

  // ============================================
  // 4. 3D DEPTH SYSTEM
  // ============================================

  class Depth3D {
    constructor() {
      this.init();
    }

    init() {
      // Enable 3D transforms for scene cards
      document.querySelectorAll('.scene-content').forEach(el => {
        el.addEventListener('mouseenter', () => this.activate3D(el));
        el.addEventListener('mouseleave', () => this.reset3D(el));
      });
    }

    activate3D(element) {
      if (window.matchMedia('(pointer: fine)').matches) {
        element.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        element.style.transform = `perspective(1000px) rotateY(-2deg) rotateX(2deg) translateZ(20px)`;
      }
    }

    reset3D(element) {
      element.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)`;
    }
  }

  // ============================================
  // 5. CINEMATIC TRANSITIONS
  // ============================================

  class CinematicTransition {
    static fadeToBlack(duration = 1500) {
      return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'fade-through-black';
        overlay.style.animationDuration = duration + 'ms';
        document.body.appendChild(overlay);

        setTimeout(() => {
          overlay.remove();
          resolve();
        }, duration);
      });
    }

    static slideIn(element, duration = 800, direction = 'up') {
      const directions = {
        up: { from: '100px', to: '0px' },
        down: { from: '-100px', to: '0px' },
        left: { from: '100px', to: '0px' },
        right: { from: '-100px', to: '0px' }
      };

      const dir = directions[direction] || directions.up;

      if (typeof gsap !== 'undefined') {
        return gsap.fromTo(element, 
          { 
            opacity: 0, 
            y: parseInt(dir.from),
            filter: 'blur(10px)'
          },
          { 
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: duration / 1000,
            ease: 'power3.out'
          }
        );
      }
    }
  }

  // ============================================
  // 6. MUSIC-REACTIVE SYSTEM
  // ============================================

  class MusicReactive {
    constructor() {
      this.audioContext = null;
      this.analyser = null;
      this.dataArray = null;
      this.sourceNode = null;
      this.supported = !!(window.AudioContext || window.webkitAudioContext);
      this.connected = false;       // true once a MediaElementSource exists for this element
      this.loopHandle = null;
      this.reactiveElements = document.querySelectorAll('.music-reactive');
      this.init();
    }

    init() {
      // Nothing to react to, and/or the browser has no Web Audio API at
      // all — bail out quietly. The cinematic experience runs fine
      // without this purely decorative layer.
      if (!this.reactiveElements.length || !this.supported) return;

      const audioElement = document.getElementById('piano-audio');
      if (!audioElement) return;

      // The element can play/pause/replay many times over the story
      // (mute, tab-hide ducking, preset switches). Only ever attempt the
      // Web Audio graph once per element — repeat 'play' events must not
      // try to create a second MediaElementSource, which throws.
      audioElement.addEventListener('play', () => {
        if (!this.connected) {
          this.setupAudioContext(audioElement);
        } else if (this.audioContext && this.audioContext.state === 'suspended') {
          // Autoplay-policy or tab-throttling can suspend an existing
          // context; resuming inside this user/script-driven 'play'
          // handler is safe and requires no extra gesture.
          this.audioContext.resume().catch(() => {});
        }
      });
    }

    setupAudioContext(audioElement) {
      if (this.connected) return; // belt-and-suspenders against re-entry

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      try {
        const audioCtx = new AudioContextClass();

        // Feature-detect before calling — some older/embedded WebViews
        // expose AudioContext but not every node-creation method.
        if (typeof audioCtx.createMediaElementSource !== 'function' ||
            typeof audioCtx.createAnalyser !== 'function') {
          audioCtx.close && audioCtx.close();
          return; // graceful no-op, no thrown error, no console noise
        }

        // createMediaElementSource (NOT createMediaElementAudioSource,
        // which is not — and has never been — a real Web Audio API
        // method) permanently routes the element's output through this
        // context. It can only be called once per <audio> element for
        // its lifetime; calling it again throws InvalidStateError, which
        // is exactly why `connected` is checked/set before anything else.
        const source = audioCtx.createMediaElementSource(audioElement);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64; // small FFT — this is a decorative beat-pulse, not a visualizer

        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        this.audioContext = audioCtx;
        this.analyser = analyser;
        this.sourceNode = source;
        this.dataArray = new Uint8Array(analyser.frequencyBinCount);
        this.connected = true;

        // Most browsers create AudioContext in a 'suspended' state until
        // a user gesture. We're inside a 'play' event handler (itself
        // gesture-driven, directly or via the audio engine's unlock
        // flow), so resume() here is allowed and reliable. IMPORTANT:
        // createMediaElementSource reroutes the element's entire audio
        // output through this graph — if the context never resumes, the
        // piano track would go silent, not just lose the beat effect. We
        // guard against that explicitly below.
        if (audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
          setTimeout(() => {
            if (audioCtx.state === 'suspended') {
              // Resume never succeeded — bypass the analyser entirely so
              // the music itself is never silenced by a decorative
              // visual effect. Reactivity simply won't run.
              try {
                analyser.disconnect();
                source.disconnect();
                source.connect(audioCtx.destination);
              } catch (_) {}
              this.analyser = null;
            }
          }, 1500);
        }

        this.startReactivity();
      } catch (e) {
        // Any failure here (unsupported browser, restrictive permissions
        // policy, etc.) degrades silently — the story keeps running
        // without the beat-pulse effect. Logged at debug level only, so
        // production consoles stay clean.
        if (window.PerfCore === undefined || !window.PerfCore.lowEnd) {
          console.debug('[MusicReactive] Web Audio analysis unavailable, skipping beat effect:', e.message);
        }
      }
    }

    startReactivity() {
      if (this.loopHandle) return;
      const animate = () => {
        // Stop the loop outright if the context was ever torn down —
        // prevents a dangling rAF chain from outliving its data.
        if (!this.analyser || !this.audioContext) {
          this.loopHandle = null;
          return;
        }
        // No point sampling/painting while the tab is hidden.
        if (!(window.PerfCore && window.PerfCore.hidden)) {
          this.analyser.getByteFrequencyData(this.dataArray);
          let sum = 0;
          for (let i = 0; i < this.dataArray.length; i++) sum += this.dataArray[i];
          const normalized = (sum / this.dataArray.length) / 255;

          if (normalized > 0.3) {
            this.reactiveElements.forEach(el => {
              el.classList.add('beat');
              clearTimeout(el._beatTimer);
              el._beatTimer = setTimeout(() => el.classList.remove('beat'), 100);
            });
          }
        }
        this.loopHandle = requestAnimationFrame(animate);
      };
      this.loopHandle = requestAnimationFrame(animate);
    }

    destroy() {
      if (this.loopHandle) cancelAnimationFrame(this.loopHandle);
      this.loopHandle = null;
      if (this.audioContext) {
        this.audioContext.close().catch(() => {});
      }
      this.audioContext = null;
      this.analyser = null;
    }
  }

  // ============================================
  // 7. FINALE GRAND SEQUENCE
  // ============================================

  class FinaleSequence {
    constructor() {
      this.finaleSection = document.getElementById('finale');
      this.particleSystem = new ParticleSystem();
    }

    async play() {
      // Ensure finale section has the enhanced structure
      this.enhanceFinaleHTML();
      
      // Start particle effects
      this.startHeartConvergence();
      
      // Animate text
      this.animateFinalMessage();
      
      // Signature reveal
      this.revealSignature();
      
      // Continuous particle flow
      this.startParticleFlow();
    }

    enhanceFinaleHTML() {
      if (this.finaleSection.querySelector('.heart-convergence')) return;

      const convergence = document.createElement('div');
      convergence.className = 'heart-convergence';
      convergence.id = 'heart-convergence-zone';
      this.finaleSection.insertBefore(convergence, this.finaleSection.firstChild);
    }

    startHeartConvergence() {
      const convergenceZone = document.getElementById('heart-convergence-zone');
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // Scale burst size to device capability.
      // Full:    5 bursts × 18 = 90 DOM nodes
      // LowEnd:  3 bursts × 8  = 24 DOM nodes
      // VeryLow: skip entirely — hearts still visible via CSS
      const perf       = window.PerfCore;
      const veryLow    = perf && perf.veryLowEnd;
      const low        = perf && perf.lowEnd;
      const burstCount = veryLow ? 0 : low ? 3 : 5;
      const perBurst   = veryLow ? 0 : low ? 8 : 18;

      for (let i = 0; i < burstCount; i++) {
        // Spread bursts 600 ms apart (was 400 ms) so DOM insertions
        // don't all compete with the scroll-entry reflow.
        setTimeout(() => {
          this.particleSystem.burstParticles('heart', perBurst, centerX, centerY);
        }, i * 600);
      }
    }

    animateFinalMessage() {
      const finalQuote = this.finaleSection.querySelector('.final-quote');
      if (finalQuote && typeof TextAnimator !== 'undefined') {
        finalQuote.classList.add('emotional-quote');
        const text = finalQuote.textContent;
        TextAnimator.characterReveal(finalQuote);
      }
    }

    revealSignature() {
      const signature = this.finaleSection.querySelector('.signature');
      if (signature) {
        signature.classList.add('signature-enhanced');
      }
    }

    startParticleFlow() {
      // Skip continuous flow entirely on very-low-end hardware — the burst
      // above is already omitted, so no particles run at all on those devices.
      const perf    = window.PerfCore;
      const veryLow = perf && perf.veryLowEnd;
      const low     = perf && perf.lowEnd;
      if (veryLow) return;

      // On low-end devices: fewer particles, longer intervals
      const heartCount = low ? 1 : 2;
      const dustCount  = low ? 1 : 3;
      const starCount  = 1;

      this._flowIntervals = [
        this.particleSystem.startContinuousFlow('heart', heartCount, low ? 1400 : 800),
        this.particleSystem.startContinuousFlow('dust',  dustCount,  low ? 2000 : 1200),
        this.particleSystem.startContinuousFlow('star',  starCount,  low ? 2500 : 1500),
      ];
    }
  }

  // ============================================
  // 8. SCROLL-TRIGGERED ANIMATIONS
  // ============================================

  class ScrollTriggerAnimations {
    constructor() {
      this.init();
    }

    init() {
      if (typeof ScrollTrigger === 'undefined') return;

      // Animate scene cards on scroll
      document.querySelectorAll('.scene').forEach((scene, index) => {
        const animations = [
          'fade-scale-entry',
          'slide-blur-entry',
          'rotate-reveal-entry',
          'depth-zoom-entry',
          'float-entry'
        ];

        const animation = animations[index % animations.length];
        scene.classList.add(animation);

        ScrollTrigger.create({
          trigger: scene,
          start: 'top 80%',
          onEnter: () => {
            scene.classList.add('active-scene');
          }
        });
      });
    }
  }

  // ============================================
  // 9. BACKGROUND EFFECTS
  // ============================================

  class BackgroundEffects {
    constructor() {
      this.init();
    }

    init() {
      this.createAnimatedBackground();
      this.addGlowSpheres();
      this.addLightRays();
    }

    createAnimatedBackground() {
      const container = document.querySelector('body');
      if (!container.querySelector('.parallax-bg')) {
        const bg = document.createElement('div');
        bg.className = 'parallax-bg';
        
        bg.innerHTML = `
          <div class="parallax-layer bg-1"></div>
          <div class="parallax-layer bg-2"></div>
          <div class="parallax-layer bg-3"></div>
        `;

        container.insertBefore(bg, container.firstChild);
      }
    }

    addGlowSpheres() {
      const finale = document.getElementById('finale');
      if (!finale || finale.querySelector('.glow-sphere')) return;

      const glows = [
        { size: '400px', top: '10%', left: '20%', class: 'glow-primary' },
        { size: '300px', top: '60%', right: '15%', class: 'glow-secondary' },
        { size: '350px', bottom: '20%', left: '10%', class: 'glow-primary' }
      ];

      glows.forEach(glow => {
        const sphere = document.createElement('div');
        sphere.className = `glow-sphere ${glow.class}`;
        sphere.style.width = glow.size;
        sphere.style.height = glow.size;
        sphere.style.top = glow.top || 'auto';
        sphere.style.bottom = glow.bottom || 'auto';
        sphere.style.left = glow.left || 'auto';
        sphere.style.right = glow.right || 'auto';
        finale.appendChild(sphere);
      });
    }

    addLightRays() {
      const finale = document.getElementById('finale');
      if (!finale || finale.querySelector('.light-ray')) return;

      const rays = [
        { class: 'ray-1', rotate: '-15deg' },
        { class: 'ray-2', rotate: '15deg' }
      ];

      rays.forEach(ray => {
        const rayEl = document.createElement('div');
        rayEl.className = `light-ray ${ray.class}`;
        rayEl.style.setProperty('--ray-rotate', ray.rotate);
        finale.appendChild(rayEl);
      });
    }
  }

  // ============================================
  // 10. MICRO INTERACTIONS
  // ============================================

  class MicroInteractions {
    constructor() {
      this.init();
    }

    init() {
      this.setupButtonInteractions();
      this.setupElementHovers();
    }

    setupButtonInteractions() {
      document.querySelectorAll('button').forEach(btn => {
        btn.classList.add('magnetic-button', 'interactive-element');
        
        btn.addEventListener('click', (e) => {
          this.createRipple(e, btn);
        });

        btn.addEventListener('mouseenter', () => {
          if (window.matchMedia('(pointer: fine)').matches) {
            btn.style.transform = 'translateY(-3px) scale(1.05)';
          }
        });

        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'translateY(0) scale(1)';
        });
      });
    }

    setupElementHovers() {
      document.querySelectorAll('.scene-title, .flower-text').forEach(el => {
        el.classList.add('interactive-element', 'pulse-glow');
      });
    }

    createRipple(event, element) {
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';

      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      ripple.style.width = size + 'px';
      ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';

      element.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    }
  }

  // ============================================
  // 11. INITIALIZE ALL SYSTEMS
  // ============================================

  function initCinematicEnhancer() {
    // Wait for GSAP if available
    const waitForGSAP = () => {
      if (typeof gsap !== 'undefined') {
        // Register ScrollTrigger if available
        if (typeof ScrollTrigger !== 'undefined') {
          gsap.registerPlugin(ScrollTrigger);
        }

        // Initialize all systems
        const particles = new ParticleSystem();
        window.particleSystem = particles;

        new ScrollParallax();
        new Depth3D();
        new ScrollTriggerAnimations();
        new BackgroundEffects();
        new MicroInteractions();
        new MusicReactive();

        // Setup finale sequence when user reaches it
        function checkFinaleScroll() {
          const finale = document.getElementById('finale');
          if (finale && finale.getBoundingClientRect().top < window.innerHeight) {
            if (!finale.classList.contains('cinematic-initiated')) {
              finale.classList.add('cinematic-initiated');
              const finaleSeq = new FinaleSequence();
              finaleSeq.play();
            }
          }
        }
        if (window.PerfCore) window.PerfCore.onScroll(checkFinaleScroll);
        else window.addEventListener('scroll', checkFinaleScroll, { passive: true });
      } else {
        setTimeout(waitForGSAP, 100);
      }
    };

    waitForGSAP();
  }

  // ============================================
  // 12. ENHANCED FINALE ON DEMAND
  // ============================================

  window.enhanceFinale = function() {
    const finale = new FinaleSequence();
    finale.play();
  };

  window.burstHearts = function(count = 50) {
    if (window.particleSystem) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      window.particleSystem.burstParticles('heart', count, centerX, centerY);
    }
  };

  window.createParticles = function(type = 'dust', count = 20) {
    if (window.particleSystem) {
      for (let i = 0; i < count; i++) {
        window.particleSystem.createParticle(type);
      }
    }
  };

  // ============================================
  // 13. INITIALIZE ON DOM READY
  // ============================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCinematicEnhancer);
  } else {
    initCinematicEnhancer();
  }

  // Export for global use
  window.TextAnimator = TextAnimator;
  window.CinematicTransition = CinematicTransition;

})();
