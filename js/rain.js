// =========================================
// RAIN.JS  — v3
// Uses PerfCore.registerLoop() — shares the
// single master rAF and auto-pauses when
// scrollActive is true (0 canvas work during
// scroll = no jank). Drops are still moving
// behind the scenes; when scroll stops they
// instantly appear at correct positions.
// =========================================

const rainCanvas      = document.getElementById('rain-canvas');
const ctx             = rainCanvas.getContext('2d', { alpha: true, desynchronized: true });
const lightningCanvas = document.getElementById('lightning-canvas');
const lctx            = lightningCanvas.getContext('2d', { alpha: true });

// ── Canvas resize ─────────────────────────────────────────────────────────
function resizeCanvases() {
  rainCanvas.width      = window.innerWidth;
  rainCanvas.height     = window.innerHeight;
  lightningCanvas.width = window.innerWidth;
  lightningCanvas.height= window.innerHeight;
}
resizeCanvases();
window.addEventListener('resize', resizeCanvases, { passive: true });

// ── Rain drops ────────────────────────────────────────────────────────────
const P = window.PerfCore;

// Drop count: ultra-low gets 40, low 100, mid 200, full 400
const rainCount = Math.round(400 * (P ? P.rainScale : 0.5));

const rainDrops = Array.from({ length: rainCount }, () => ({
  x:       Math.random() * window.innerWidth,
  y:       Math.random() * window.innerHeight,
  length:  Math.random() * 20 + 10,
  speed:   Math.random() * 5  + 4,
  opacity: Math.random() * 0.18 + 0.04
}));

// ── Render function (called by master loop) ────────────────────────────────
// scrollActive flag: when true we SKIP drawing (saves ~4ms/frame on weak GPU)
// but still advance drop positions so they're correct when we resume.
function renderRain(now, scrollActive) {
  const W = rainCanvas.width;
  const H = rainCanvas.height;

  // Always advance physics (cheap, CPU-only, <0.1ms)
  rainDrops.forEach(d => {
    d.y += d.speed;
    d.x -= 0.7;
    if (d.y > H)        { d.y = -35; d.x = Math.random() * W; }
    if (d.x < -50)      { d.x = W + 50; }
  });

  // Only draw when scroll is idle — this is what fixes the scroll lag
  if (scrollActive) return;

  ctx.clearRect(0, 0, W, H);
  rainDrops.forEach(d => {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255,255,255,${d.opacity})`;
    ctx.lineWidth   = 1;
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x - 2, d.y + d.length);
    ctx.stroke();
  });
}

// Register with the master loop
if (P && P.registerLoop) {
  P.registerLoop(renderRain);
} else {
  // Fallback if perf-core failed to load
  (function fallback() {
    renderRain(0, false);
    requestAnimationFrame(fallback);
  })();
}

// ── Lightning ─────────────────────────────────────────────────────────────
// Unchanged from original — runs on its own setTimeout schedule,
// not part of the rAF loop (it's infrequent and GPU-side anyway)

function drawLightningBranch(startX, startY, endX, endY, thickness = 3, glow = 45) {
  let x = startX, y = startY;
  lctx.beginPath();
  lctx.moveTo(x, y);
  const segments = (P && P.ultraLow) ? 22 : 42;
  for (let i = 0; i < segments; i++) {
    x += (endX - startX) / segments + (Math.random() - 0.5) * 40;
    y += (endY - startY) / segments + (Math.random() - 0.5) * 24;
    lctx.lineTo(x, y);
    if (Math.random() < 0.2) {
      let bx = x, by = y;
      lctx.moveTo(bx, by);
      for (let j = 0; j < 4; j++) { bx += (Math.random() - 0.5) * 50; by += Math.random() * 28; lctx.lineTo(bx, by); }
      lctx.moveTo(x, y);
    }
  }
  lctx.strokeStyle = 'rgba(255,255,255,1)';
  lctx.lineWidth   = thickness;
  lctx.shadowBlur  = glow;
  lctx.shadowColor = '#b5e2ff';
  lctx.stroke();
  lctx.strokeStyle = 'rgba(120,200,255,0.35)';
  lctx.lineWidth   = thickness + 5;
  lctx.stroke();
}

function cinematicFlash() {
  if (typeof gsap === 'undefined') return;
  gsap.to('body', { background: '#4b4b4b', duration: 0.05, repeat: 2, yoyo: true,
    onComplete: () => gsap.to('body', { background: '#080705', duration: 0.45 }) });
}

const LIGHTNING_TYPES = 5;
let lightningQueue = [];
function generateQueue() {
  lightningQueue = Array.from({ length: LIGHTNING_TYPES }, (_, i) => i);
  for (let i = lightningQueue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lightningQueue[i], lightningQueue[j]] = [lightningQueue[j], lightningQueue[i]];
  }
}
generateQueue();

let lightningBusy = false;
function createLightningSpike() {
  if (lightningBusy) return;
  lightningBusy = true;
  lctx.clearRect(0, 0, lightningCanvas.width, lightningCanvas.height);
  lightningCanvas.style.display  = 'block';
  lightningCanvas.style.opacity  = '1';

  let type = lightningQueue.shift();
  if (type === undefined) { generateQueue(); type = lightningQueue.shift(); }

  const w = lightningCanvas.width, h = lightningCanvas.height;
  if      (type === 0) drawLightningBranch(w*0.2, -20, w*0.5,  h*0.45);
  else if (type === 1) drawLightningBranch(w*0.8, -20, w*0.35, h*0.4);
  else if (type === 2) drawLightningBranch(w*0.5, -20, w*0.15, h*0.75, 3.4, 55);
  else if (type === 3) drawLightningBranch(w*0.1, -20, w*0.88, h*0.82, 3.6, 58);
  else                 drawLightningBranch(Math.random()*w, -20, Math.random()*w, h*0.55, 2.6, 35);

  // Skip mini-sparks on ultra-low devices
  if (!(P && P.ultraLow)) {
    const extra = Math.floor(Math.random() * 3);
    for (let i = 0; i < extra; i++) drawLightningBranch(Math.random()*w, -20, Math.random()*w, h*0.35, 1.2, 18);
  }

  cinematicFlash();
  if (typeof gsap !== 'undefined') {
    gsap.fromTo(lightningCanvas,
      { opacity: 1 },
      { opacity: 0.15, duration: 0.06, repeat: 2, yoyo: true,
        onComplete: () => gsap.to(lightningCanvas, { opacity: 0, duration: 0.20, ease: 'power2.out',
          onComplete: () => { lctx.clearRect(0, 0, w, h); lightningCanvas.style.opacity = '1'; lightningBusy = false; }
        })
      }
    );
  } else {
    setTimeout(() => { lctx.clearRect(0, 0, w, h); lightningBusy = false; }, 600);
  }
}

function thunderThenLightning(firstTime = false) {
  const delay = firstTime ? 10000 : 10000 + Math.random() * 4000;
  setTimeout(() => {
    if (typeof playStormEffect === 'function') playStormEffect();
    setTimeout(createLightningSpike, 1000);
    thunderThenLightning();
  }, delay);
}
thunderThenLightning(true);

// Tab visibility — delegate to PerfCore master loop
// (master loop already stops all registered loops when hidden)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (typeof gsap !== 'undefined') gsap.globalTimeline.pause();
  } else {
    if (typeof gsap !== 'undefined') gsap.globalTimeline.resume();
  }
});
