// =========================================
// AUDIO.JS
// Premium Audio Engine — extracted verbatim
// from the previous inline <script> block in
// index.html. Behavior, timing, fade curves,
// and DOM ids are unchanged.
//
// Exposes:
//   window.AudioManager        (new — only used by main.js
//                                for the royal-opening piano duck)
//   window.stormAudioControl   (unchanged contract, read by rain.js)
//   window.playStormEffect     (unchanged contract, called by rain.js)
// =========================================
(function () {
  // ============================================
  // PREMIUM AUDIO ENGINE
  // ============================================
  const rainAudio = document.getElementById('rain-audio');
  const pianoAudio = document.getElementById('piano-audio');
  const thunderAudio = document.getElementById('thunder-audio');
  const lightningAudio = document.getElementById('lightning-audio');
  const allAudioEls = [rainAudio, pianoAudio, thunderAudio, lightningAudio];

  // Default volumes (as 0-1)
  const DEFAULTS = {
    master: 1.0,
    rain: 0.15,
    piano: 0.35,
    thunder: 0.10,
    lightning: 0.08
  };

  let currentMix = { ...DEFAULTS };
  let masterMuted = false;
  let audioEnabled = false;   // true once the user has actually opted in to sound
  let audioUnlocked = false;  // true once the browser has granted a playback gesture
  let ambienceStarted = false;
  let audioReady = false;     // true once all four tracks have buffered enough to
                               // play without stuttering — preload is started
                               // immediately below and tracked via canplaythrough;
                               // by the time the first thunder strike fires
                               // (10s+ into the story) this is reliably true.
  const readyState = { rain: false, piano: false, thunder: false, lightning: false };

  rainAudio.volume = 0;
  pianoAudio.volume = 0;
  thunderAudio.volume = 0;
  lightningAudio.volume = 0;
  rainAudio.loop = true;
  pianoAudio.loop = true;

  // ---- Preload tracking, so thunder/lightning never stutter on first play ----
  function markReady(key) {
    if (readyState[key]) return;
    readyState[key] = true;
    if (Object.values(readyState).every(Boolean)) audioReady = true;
  }

  [
    ['rain', rainAudio],
    ['piano', pianoAudio],
    ['thunder', thunderAudio],
    ['lightning', lightningAudio]
  ].forEach(([key, el]) => {
    if (el.readyState >= 3) markReady(key); // already buffered enough
    el.addEventListener('canplaythrough', () => markReady(key), { once: true });
    el.addEventListener('error', () => markReady(key), { once: true }); // don't block forever
    el.load();
  });

  function fadeVolume(audio, target, duration = 1000) {
    if (!audio) return;
    if (audio._fadeTimer) clearInterval(audio._fadeTimer);
    const start = audio.volume;
    const steps = 40;
    const stepTime = Math.max(10, duration / steps);
    let current = 0;
    audio._fadeTimer = setInterval(() => {
      current++;
      let v = start + (target - start) * (current / steps);
      v = Math.max(0, Math.min(1, v));
      audio.volume = v;
      if (current >= steps) {
        clearInterval(audio._fadeTimer);
        audio._fadeTimer = null;
      }
    }, stepTime);
  }

  function safePlay(audio) {
    if (!audio || !audioEnabled) return;
    const p = audio.play();
    if (p !== undefined) p.catch(() => {});
  }

  function safePause(audio) {
    if (!audio) return;
    audio.pause();
  }

  // ---- One-time, user-gesture-based unlock that primes ALL four tracks. ----
  // Safe to call multiple times: only does real work the first time per element,
  // and is re-armed if the browser later revokes the unlock (e.g. autoplay policy changes).
  function unlockAudioElement(audio) {
    if (!audio || audio._unlocked) return Promise.resolve();
    const wasMuted = audio.muted;
    audio.muted = true;
    const p = audio.play();
    if (p === undefined) {
      audio.muted = wasMuted;
      return Promise.resolve();
    }
    return p.then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = wasMuted;
      audio._unlocked = true;
    }).catch(() => {
      // Unlock failed (no real gesture yet) — leave muted state as-is so a
      // later attempt within a genuine click handler can retry cleanly.
      audio.muted = wasMuted;
    });
  }

  function unlockAllAudio() {
    return Promise.all(allAudioEls.map(unlockAudioElement));
  }

  function startAmbience() {
    if (ambienceStarted) return;
    ambienceStarted = true;
    rainAudio.volume = 0;
    safePlay(rainAudio);
    fadeVolume(rainAudio, currentMix.rain * currentMix.master, 3000);

    setTimeout(() => {
      pianoAudio.volume = 0;
      safePlay(pianoAudio);
      fadeVolume(pianoAudio, currentMix.piano * currentMix.master, 4000);
    }, 1200);
  }

  function cinematicDuck() {
    const target = currentMix.piano * currentMix.master;
    fadeVolume(pianoAudio, target * 0.4, 300);
    setTimeout(() => fadeVolume(pianoAudio, target, 1800), 1800);
  }

  // Called any time the user grants audio — whether at startup or later from
  // the dashboard. Always safe to call again; it no-ops what's already done.
  function enableAudio() {
    audioEnabled = true;
    unlockAllAudio().then(() => {
      audioUnlocked = true;
      startAmbience();
      applyVolumes();
    });
  }

  function disableAudioRow() {
    const row = document.getElementById('audio-enable-row');
    const panel = document.getElementById('audio-panel');
    row.classList.remove('visible');
    panel.classList.remove('audio-disabled');
  }

  function showEnableAudioRow() {
    const row = document.getElementById('audio-enable-row');
    const panel = document.getElementById('audio-panel');
    row.classList.add('visible');
    panel.classList.add('audio-disabled');
  }

  // ============================================
  // STARTUP AUDIO PERMISSION MODAL
  // ============================================
  const audioModal = document.getElementById('audio-modal');
  const experienceModal = document.getElementById('experience-modal');

  function closeAudioModal() {
    audioModal.style.opacity = '0';
    audioModal.style.transition = 'opacity 0.5s ease';
    setTimeout(() => { audioModal.style.display = 'none'; }, 500);
  }

  function openExperienceModal() {
    experienceModal.style.display = 'flex';
    requestAnimationFrame(() => experienceModal.classList.add('visible'));
  }

  function closeExperienceModal() {
    experienceModal.classList.remove('visible');
    setTimeout(() => { experienceModal.style.display = 'none'; }, 500);
  }

  document.getElementById('modal-audio-yes').addEventListener('click', () => {
    closeAudioModal();
    enableAudio();
    setTimeout(openExperienceModal, 500);
  });

  document.getElementById('modal-audio-no').addEventListener('click', () => {
    audioEnabled = false;
    closeAudioModal();
    showEnableAudioRow();
  });

  // ============================================
  // AUDIO EXPERIENCE SETUP MODAL
  // ============================================
  let selectedPreset = 'romantic';

  document.querySelectorAll('.experience-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.experience-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedPreset = card.dataset.preset;
      document.getElementById('experience-custom-panel').classList.remove('open');
    });
  });

  document.getElementById('experience-custom-toggle').addEventListener('click', () => {
    document.querySelectorAll('.experience-card').forEach(c => c.classList.remove('selected'));
    selectedPreset = 'custom';
    document.getElementById('experience-custom-panel').classList.add('open');
  });

  ['rain', 'piano', 'thunder', 'lightning'].forEach(key => {
    document.getElementById(`custom-${key}`).addEventListener('input', function () {
      if (selectedPreset !== 'custom') return;
      currentMix[key] = this.value / 100;
    });
  });

  document.getElementById('experience-enter-btn').addEventListener('click', () => {
    applyPreset(selectedPreset === 'custom' ? null : selectedPreset, false);
    if (selectedPreset === 'custom') {
      currentMix.rain = document.getElementById('custom-rain').value / 100;
      currentMix.piano = document.getElementById('custom-piano').value / 100;
      currentMix.thunder = document.getElementById('custom-thunder').value / 100;
      currentMix.lightning = document.getElementById('custom-lightning').value / 100;
      syncDashboardSliders();
      applyVolumes();
    }
    closeExperienceModal();
  });

  // ============================================
  // AUDIO DASHBOARD
  // ============================================
  const audioToggle = document.getElementById('audio-toggle');
  const audioPanel = document.getElementById('audio-panel');

  audioToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    audioPanel.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.audio-controller')) {
      audioPanel.classList.remove('open');
    }
  });

  // "Enable Audio" — lets someone who declined at startup turn sound on later,
  // from anywhere in the story, without a page refresh.
  document.getElementById('audio-enable-btn').addEventListener('click', () => {
    enableAudio();
    disableAudioRow();
  });

  // Sliders
  function applyVolumes() {
    if (!audioEnabled || masterMuted) return;
    fadeVolume(rainAudio, currentMix.rain * currentMix.master, 400);
    fadeVolume(pianoAudio, currentMix.piano * currentMix.master, 400);
    thunderAudio.volume = Math.min(1, currentMix.thunder * currentMix.master);
    lightningAudio.volume = Math.min(1, currentMix.lightning * currentMix.master);
  }

  document.getElementById('master-vol').addEventListener('input', function () {
    currentMix.master = this.value / 100;
    applyVolumes();
  });

  document.getElementById('rain-vol').addEventListener('input', function () {
    currentMix.rain = this.value / 100;
    applyVolumes();
  });

  document.getElementById('piano-vol').addEventListener('input', function () {
    currentMix.piano = this.value / 100;
    applyVolumes();
  });

  document.getElementById('thunder-vol').addEventListener('input', function () {
    currentMix.thunder = this.value / 100;
    applyVolumes();
  });

  document.getElementById('lightning-vol').addEventListener('input', function () {
    currentMix.lightning = this.value / 100;
    applyVolumes();
  });

  // Presets — shared between the startup Experience modal and the dashboard
  const PRESETS = {
    romantic: { rain: 0.05, piano: 0.55, thunder: 0.03, lightning: 0.02 },
    rainy: { rain: 0.45, piano: 0.15, thunder: 0.08, lightning: 0.05 },
    stormy: { rain: 0.35, piano: 0.10, thunder: 0.30, lightning: 0.20 },
    cinematic: { rain: 0.15, piano: 0.35, thunder: 0.10, lightning: 0.08 }
  };

  function syncDashboardSliders() {
    document.getElementById('rain-vol').value = currentMix.rain * 100;
    document.getElementById('piano-vol').value = currentMix.piano * 100;
    document.getElementById('thunder-vol').value = currentMix.thunder * 100;
    document.getElementById('lightning-vol').value = currentMix.lightning * 100;
  }

  function applyPreset(name, animateUi = true) {
    const preset = name ? PRESETS[name] : null;
    if (preset) {
      currentMix.rain = preset.rain;
      currentMix.piano = preset.piano;
      currentMix.thunder = preset.thunder;
      currentMix.lightning = preset.lightning;
      syncDashboardSliders();
    }
    if (audioEnabled) applyVolumes();

    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    if (name) {
      const btn = document.querySelector(`.preset-btn[data-preset="${name}"]`);
      if (btn) btn.classList.add('active');
    }
  }

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      applyPreset(this.dataset.preset);
    });
  });

  // Mute / Restore
  document.getElementById('mute-all-btn').addEventListener('click', () => {
    masterMuted = true;
    fadeVolume(rainAudio, 0, 800);
    fadeVolume(pianoAudio, 0, 800);
    thunderAudio.volume = 0;
    lightningAudio.volume = 0;
  });

  document.getElementById('restore-btn').addEventListener('click', () => {
    masterMuted = false;
    document.getElementById('master-vol').value = 100;
    currentMix = { ...DEFAULTS };
    syncDashboardSliders();
    applyVolumes();

    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-preset="cinematic"]').classList.add('active');
  });

  // Tab visibility
  document.addEventListener('visibilitychange', () => {
    if (!audioEnabled) return;
    if (document.hidden) {
      rainAudio.volume = Math.min(rainAudio.volume, 0.08);
      pianoAudio.volume = Math.min(pianoAudio.volume, 0.05);
    } else {
      applyVolumes();
    }
  });

  // playStormEffect — called by rain.js for thunder+lightning sync.
  // Guards against overlapping plays and avoids any currentTime reset while
  // a clip is already mid-playback, which is what caused the audible "cut".
  window.playStormEffect = function () {
    if (!audioEnabled || masterMuted) return;

    const sc = window.stormAudioControl;
    if (!sc) return;

    if (sc.thunderEnabled() && thunderAudio.paused) {
      thunderAudio.currentTime = 0;
      thunderAudio.volume = Math.min(1, currentMix.thunder * currentMix.master);
      const tp = thunderAudio.play();
      if (tp !== undefined) tp.catch(() => {});
    }

    // Lightning sound after brief delay (visual sync)
    setTimeout(() => {
      if (sc.lightningEnabled() && lightningAudio.paused) {
        lightningAudio.currentTime = 0;
        lightningAudio.volume = Math.min(1, currentMix.lightning * currentMix.master);
        const lp = lightningAudio.play();
        if (lp !== undefined) lp.catch(() => {});
      }
      sc.cinematicDuck && sc.cinematicDuck();
    }, 1000);
  };

  // Expose for rain.js
  window.stormAudioControl = {
    thunderEnabled: () => audioEnabled && !masterMuted && currentMix.thunder > 0,
    lightningEnabled: () => audioEnabled && !masterMuted && currentMix.lightning > 0,
    getThunderVol: () => currentMix.thunder * currentMix.master,
    getLightningVol: () => currentMix.lightning * currentMix.master,
    cinematicDuck
  };

  // ============================================
  // PUBLIC API — used only by main.js, for the
  // royal-opening sequence's piano duck/restore.
  // Same functions, same closure, just reachable
  // from outside this file now that it's modular.
  // ============================================
  window.AudioManager = {
    fadeVolume,
    applyVolumes,
    get pianoAudio() { return pianoAudio; },
    get audioEnabled() { return audioEnabled; }
  };
})();
