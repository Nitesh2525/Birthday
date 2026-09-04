(() => {
  // src/utils/particles.js
  var ParticleSystem = class {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.width = canvas.logicalWidth || canvas.width;
      this.height = canvas.logicalHeight || canvas.height;
      this.petals = [];
      this.sparkles = [];
      this.hitParticles = [];
      this.smokeParticles = [];
      this.giftBurstParticles = [];
      this.treeHearts = [];
    }
    resize(width, height) {
      this.width = width;
      this.height = height;
      this.initPetals(35);
      this.initSparkles(45);
    }
    // Scene 1: Initialize Floating Flower Petals
    initPetals(count = 35) {
      this.petals = [];
      for (let i = 0; i < count; i++) {
        this.petals.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          size: Math.random() * 8 + 6,
          speedY: Math.random() * 0.8 + 0.4,
          speedX: Math.random() * 0.5 - 0.25,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.03 + 0.01,
          color: ["#ffb7c5", "#ff9eaa", "#ffd1dc", "#fff0f3"][Math.floor(Math.random() * 4)],
          opacity: Math.random() * 0.6 + 0.3
        });
      }
    }
    // Scene 1: Initialize Magic Dust Sparkles
    initSparkles(count = 45) {
      this.sparkles = [];
      for (let i = 0; i < count; i++) {
        this.sparkles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          size: Math.random() * 3 + 1,
          alpha: Math.random(),
          pulseSpeed: Math.random() * 0.04 + 0.01,
          color: ["#ffffff", "#ffd700", "#ff85ad"][Math.floor(Math.random() * 3)]
        });
      }
    }
    updateAndRenderBackground() {
      const ctx = this.ctx;
      const width = this.width;
      const height = this.height;
      for (let s of this.sparkles) {
        s.alpha += s.pulseSpeed;
        if (s.alpha > 1 || s.alpha < 0) s.pulseSpeed = -s.pulseSpeed;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 8;
        ctx.shadowColor = s.color;
        ctx.fill();
        ctx.restore();
      }
      for (let p of this.petals) {
        p.y += p.speedY;
        p.wobble += p.wobbleSpeed;
        p.x += p.speedX + Math.sin(p.wobble) * 0.4;
        p.rotation += p.rotSpeed;
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(p.size, -p.size, p.size * 1.5, p.size, 0, p.size * 1.5);
        ctx.bezierCurveTo(-p.size * 1.5, p.size, -p.size, -p.size, 0, 0);
        ctx.fill();
        ctx.restore();
      }
    }
    // Scene 1: Heart Explosion Burst on Arrow Hit
    triggerHeartHitExplosion(centerX, centerY) {
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        this.hitParticles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 12 + 6,
          alpha: 1,
          decay: Math.random() * 0.025 + 0.015,
          color: ["#ff3366", "#ff5e8e", "#ffd700", "#ffffff"][Math.floor(Math.random() * 4)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.1
        });
      }
    }
    updateAndRenderHitParticles() {
      const ctx = this.ctx;
      for (let i = this.hitParticles.length - 1; i >= 0; i--) {
        const p = this.hitParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.alpha -= p.decay;
        p.rotation += p.rotSpeed;
        if (p.alpha <= 0) {
          this.hitParticles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        drawHeartShape(ctx, 0, 0, p.size);
        ctx.restore();
      }
    }
    // Scene 2: Soft Smoke rising from candle
    addSmokeParticle(x, y) {
      for (let i = 0; i < 4; i++) {
        this.smokeParticles.push({
          x: x + (Math.random() - 0.5) * 6,
          y,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -(Math.random() * 1.5 + 1),
          radius: Math.random() * 4 + 3,
          maxRadius: Math.random() * 15 + 10,
          alpha: 0.7,
          decay: Math.random() * 0.015 + 0.01
        });
      }
    }
    updateAndRenderSmoke() {
      const ctx = this.ctx;
      for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
        const p = this.smokeParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.radius += (p.maxRadius - p.radius) * 0.03;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          this.smokeParticles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = "rgba(230, 220, 225, 0.6)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    // Scene 3: Gift Box Golden Particle Burst
    triggerGiftBurst(centerX, centerY) {
      for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 4;
        this.giftBurstParticles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          size: Math.random() * 6 + 3,
          alpha: 1,
          decay: Math.random() * 0.02 + 0.01,
          color: ["#ffd700", "#ff85ad", "#ffffff", "#ffb7c5"][Math.floor(Math.random() * 4)]
        });
      }
    }
    updateAndRenderGiftBurst() {
      const ctx = this.ctx;
      for (let i = this.giftBurstParticles.length - 1; i >= 0; i--) {
        const p = this.giftBurstParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          this.giftBurstParticles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    // Scene 4: Initialize Heart Tree Particles assembling into Canopy
    initHeartTreeCanopy(centerX, centerY, count = 450) {
      this.treeHearts = [];
      const canopyScale = Math.min(this.width, this.height) * 0.022;
      for (let i = 0; i < count; i++) {
        const t = Math.random() * Math.PI * 2;
        let hx = 16 * Math.pow(Math.sin(t), 3);
        let hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const rRatio = Math.sqrt(Math.random());
        hx *= rRatio;
        hy *= rRatio;
        const targetX = centerX + hx * canopyScale;
        const targetY = centerY + hy * canopyScale - canopyScale * 2.5;
        const startAngle = Math.random() * Math.PI * 2;
        const startDist = Math.max(this.width, this.height) * (0.8 + Math.random() * 0.6);
        const startX = centerX + Math.cos(startAngle) * startDist;
        const startY = centerY + Math.sin(startAngle) * startDist;
        this.treeHearts.push({
          startX,
          startY,
          currentX: startX,
          currentY: startY,
          targetX,
          targetY,
          size: Math.random() * 8 + 5,
          color: ["#ff5e8e", "#ff85ad", "#ffa07a", "#ffd700", "#e0386b", "#ffb7c5"][Math.floor(Math.random() * 6)],
          progress: 0,
          speed: Math.random() * 0.015 + 8e-3,
          delay: Math.random() * 1.5,
          wobblePhase: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI * 2
        });
      }
    }
    updateAndRenderHeartTree(elapsedSeconds) {
      const ctx = this.ctx;
      for (let p of this.treeHearts) {
        if (elapsedSeconds < p.delay) continue;
        if (p.progress < 1) {
          p.progress += p.speed;
          if (p.progress > 1) p.progress = 1;
          const ease = 1 - Math.pow(1 - p.progress, 3);
          p.currentX = p.startX + (p.targetX - p.startX) * ease;
          p.currentY = p.startY + (p.targetY - p.startY) * ease;
        } else {
          p.wobblePhase += 0.03;
          p.currentX = p.targetX + Math.sin(p.wobblePhase) * 2;
          p.currentY = p.targetY + Math.cos(p.wobblePhase * 0.7) * 2;
        }
        ctx.save();
        ctx.translate(p.currentX, p.currentY);
        ctx.rotate(p.rotation + Math.sin(p.wobblePhase || 0) * 0.1);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        drawHeartShape(ctx, 0, 0, p.size);
        ctx.restore();
      }
    }
  };
  function drawHeartShape(ctx, x, y, size) {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + size, x, y + size);
    ctx.bezierCurveTo(x, y + size, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
    ctx.fill();
  }

  // src/audio/audioManager.js
  var AudioManager = class {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
      this.isPlayingMusic = false;
      this.masterGain = null;
      this.bgMusicGain = null;
      this.sfxGain = null;
      this.musicTimer = null;
      this.currentNoteIndex = 0;
      this.melodyNotes = [
        261.63,
        329.63,
        392,
        523.25,
        // C E G C
        220,
        261.63,
        329.63,
        440,
        // A C E A
        174.61,
        220,
        261.63,
        349.23,
        // F A C F
        196,
        246.94,
        293.66,
        392
        // G B D G
      ];
    }
    init() {
      if (this.ctx) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.bgMusicGain = this.ctx.createGain();
        this.bgMusicGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        this.bgMusicGain.connect(this.masterGain);
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
      } catch (e) {
        console.warn("Web Audio API not supported on this device.", e);
      }
    }
    resumeContext() {
      this.init();
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }
    startBackgroundMusic() {
      this.resumeContext();
      if (this.isPlayingMusic || !this.ctx) return;
      this.isPlayingMusic = true;
      this.playNextMelodyNote();
    }
    stopBackgroundMusic() {
      this.isPlayingMusic = false;
      if (this.musicTimer) {
        clearTimeout(this.musicTimer);
        this.musicTimer = null;
      }
    }
    toggleMusic() {
      this.isMuted = !this.isMuted;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
      }
      return !this.isMuted;
    }
    playNextMelodyNote() {
      if (!this.isPlayingMusic || !this.ctx) return;
      const freq = this.melodyNotes[this.currentNoteIndex];
      this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melodyNotes.length;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      const now = this.ctx.currentTime;
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.08, now + 0.4);
      noteGain.gain.exponentialRampToValueAtTime(1e-3, now + 2.8);
      osc.connect(noteGain);
      noteGain.connect(this.bgMusicGain);
      osc.start(now);
      osc.stop(now + 2.8);
      const delay = this.currentNoteIndex % 4 === 0 ? 1400 : 700;
      this.musicTimer = setTimeout(() => {
        this.playNextMelodyNote();
      }, delay);
    }
    // Audio Ducking effect during candle blow
    duckMusic(durationMs = 1500) {
      if (!this.ctx || !this.bgMusicGain) return;
      const now = this.ctx.currentTime;
      const currentVol = this.bgMusicGain.gain.value;
      this.bgMusicGain.gain.cancelScheduledValues(now);
      this.bgMusicGain.gain.linearRampToValueAtTime(0.03, now + 0.2);
      this.bgMusicGain.gain.linearRampToValueAtTime(0.12, now + durationMs / 1e3);
    }
    // SOUND EFFECTS SYNTHESIZERS
    // Bow string tension pull sound
    playBowPull(tensionRatio = 0.5) {
      this.resumeContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(120 + tensionRatio * 150, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.05 * tensionRatio, now + 0.05);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.08);
    }
    // Arrow shoot twang sound
    playArrowRelease() {
      this.resumeContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = "sine";
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.15);
    }
    // Target Heart hit chime sparkle
    playHeartHit() {
      this.resumeContext();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + idx * 0.06;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.8);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.8);
      });
    }
    // Candle Extinguish sound effect
    playCandleExtinguish() {
      this.resumeContext();
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * 0.2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 400;
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.2);
      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      whiteNoise.start(now);
    }
    // Gift Box Lid Pop sound effect
    playBoxPop() {
      this.resumeContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.2);
      const sparkleNotes = [880, 1174.66, 1396.91, 1760];
      sparkleNotes.forEach((freq, idx) => {
        const sOsc = this.ctx.createOscillator();
        const sGain = this.ctx.createGain();
        const stime = now + 0.05 + idx * 0.05;
        sOsc.type = "triangle";
        sOsc.frequency.setValueAtTime(freq, stime);
        sGain.gain.setValueAtTime(0, stime);
        sGain.gain.linearRampToValueAtTime(0.08, stime + 0.02);
        sGain.gain.exponentialRampToValueAtTime(1e-3, stime + 0.6);
        sOsc.connect(sGain);
        sGain.connect(this.sfxGain);
        sOsc.start(stime);
        sOsc.stop(stime + 0.6);
      });
    }
  };
  var audioManager = new AudioManager();

  // src/components/scene1_welcome.js
  var Scene1Welcome = class {
    constructor(canvas, particleSystem, onComplete) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.particles = particleSystem;
      this.onComplete = onComplete;
      this.isDragging = false;
      this.pullDistance = 0;
      this.arrow = null;
      this.isCompleted = false;
      this.heartPulse = 0;
      const width = canvas.logicalWidth || canvas.width;
      const height = canvas.logicalHeight || canvas.height;
      this.resize(width, height);
      this.boundPointerDown = this.handlePointerDown.bind(this);
      this.boundPointerMove = this.handlePointerMove.bind(this);
      this.boundPointerUp = this.handlePointerUp.bind(this);
      this.attachEvents();
    }
    resize(width, height) {
      const isPortraitMobile = width < 600 || width < height * 0.85;
      this.isPortraitMobile = isPortraitMobile;
      this.heartX = width / 2;
      this.heartY = isPortraitMobile ? height * 0.4 : height * 0.38;
      this.heartRadius = Math.max(48, Math.min(75, Math.min(width, height) * 0.11));
      this.bowRadius = Math.max(48, Math.min(70, Math.min(width, height) * 0.11));
      this.maxPull = this.bowRadius * 1.4;
      if (isPortraitMobile) {
        this.bowX = width / 2;
        this.bowY = height * 0.68;
      } else {
        this.bowX = Math.max(120, width * 0.18);
        this.bowY = height - Math.max(140, height * 0.22);
      }
      if (!this.isDragging && (!this.arrow || !this.arrow.active)) {
        this.dragX = this.bowX;
        this.dragY = this.bowY;
      }
    }
    attachEvents() {
      this.canvas.addEventListener("pointerdown", this.boundPointerDown);
      window.addEventListener("pointermove", this.boundPointerMove);
      window.addEventListener("pointerup", this.boundPointerUp);
    }
    detachEvents() {
      this.canvas.removeEventListener("pointerdown", this.boundPointerDown);
      window.removeEventListener("pointermove", this.boundPointerMove);
      window.removeEventListener("pointerup", this.boundPointerUp);
    }
    handlePointerDown(e) {
      if (this.isCompleted || this.arrow && this.arrow.active) return;
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const distToBow = Math.hypot(px - this.bowX, py - this.bowY);
      if (distToBow < Math.max(90, this.bowRadius * 1.4)) {
        this.isDragging = true;
        this.dragX = px;
        this.dragY = py;
        audioManager.resumeContext();
        audioManager.startBackgroundMusic();
        const pill = document.getElementById("bowInstruction");
        if (pill) pill.classList.add("hidden");
      }
    }
    handlePointerMove(e) {
      if (!this.isDragging) return;
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const dx = px - this.bowX;
      const dy = py - this.bowY;
      const dist = Math.hypot(dx, dy);
      this.pullDistance = Math.min(dist, this.maxPull);
      if (dist > 0) {
        const angle = Math.atan2(dy, dx);
        this.dragX = this.bowX + Math.cos(angle) * this.pullDistance;
        this.dragY = this.bowY + Math.sin(angle) * this.pullDistance;
      }
      audioManager.playBowPull(this.pullDistance / this.maxPull);
    }
    handlePointerUp(e) {
      if (!this.isDragging) return;
      this.isDragging = false;
      const pill = document.getElementById("bowInstruction");
      if (pill && !this.isCompleted) pill.classList.remove("hidden");
      const dx = this.bowX - this.dragX;
      const dy = this.bowY - this.dragY;
      const speedRatio = this.pullDistance / this.maxPull;
      if (speedRatio > 0.15) {
        const power = speedRatio * 28 + 5;
        const angle = Math.atan2(dy, dx);
        this.arrow = {
          x: this.bowX,
          y: this.bowY,
          vx: Math.cos(angle) * power,
          vy: Math.sin(angle) * power,
          rotation: angle,
          active: true,
          hit: false
        };
        audioManager.playArrowRelease();
      }
      this.dragX = this.bowX;
      this.dragY = this.bowY;
      this.pullDistance = 0;
    }
    updateAndRender() {
      const ctx = this.ctx;
      this.heartPulse += 0.04;
      ctx.save();
      const pulseScale = (1 + Math.sin(this.heartPulse) * 0.04) * (this.heartRadius / 65);
      ctx.translate(this.heartX, this.heartY);
      ctx.scale(pulseScale, pulseScale);
      const auraRadius = this.isPortraitMobile ? 75 : 110;
      const glowGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, auraRadius);
      glowGrad.addColorStop(0, "rgba(255, 133, 173, 0.55)");
      glowGrad.addColorStop(0.6, "rgba(255, 94, 142, 0.18)");
      glowGrad.addColorStop(1, "rgba(255, 94, 142, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
      ctx.fill();
      const heartGrad = ctx.createLinearGradient(-40, -40, 40, 40);
      heartGrad.addColorStop(0, "#ff85ad");
      heartGrad.addColorStop(0.5, "#ff3366");
      heartGrad.addColorStop(1, "#990033");
      ctx.fillStyle = heartGrad;
      ctx.shadowBlur = 25;
      ctx.shadowColor = "#ff5e8e";
      drawHeartShape(ctx, 0, -45, 90);
      ctx.restore();
      this.drawBow(ctx);
      if (this.isDragging && this.pullDistance > 20) {
        this.drawTrajectoryPreview(ctx);
      }
      if (this.arrow && this.arrow.active) {
        this.updateArrowPhysics(ctx);
      }
      this.particles.updateAndRenderHitParticles();
    }
    drawBow(ctx) {
      ctx.save();
      ctx.translate(this.bowX, this.bowY);
      let aimAngle = Math.atan2(this.heartY - this.bowY, this.heartX - this.bowX);
      if (this.isDragging) {
        aimAngle = Math.atan2(this.bowY - this.dragY, this.bowX - this.dragX);
      }
      ctx.rotate(aimAngle);
      const bowGrad = ctx.createLinearGradient(-this.bowRadius, 0, this.bowRadius, 0);
      bowGrad.addColorStop(0, "#5c3a21");
      bowGrad.addColorStop(0.5, "#8b5a2b");
      bowGrad.addColorStop(1, "#5c3a21");
      ctx.strokeStyle = bowGrad;
      ctx.lineWidth = Math.max(6, this.bowRadius * 0.13);
      ctx.lineCap = "round";
      const flexOffset = this.isDragging ? this.pullDistance / this.maxPull * 15 : 0;
      ctx.beginPath();
      ctx.arc(0, 0, this.bowRadius - flexOffset, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
      ctx.fillStyle = "#ffd700";
      const tipTopX = Math.cos(-Math.PI * 0.4) * (this.bowRadius - flexOffset);
      const tipTopY = Math.sin(-Math.PI * 0.4) * (this.bowRadius - flexOffset);
      ctx.beginPath();
      ctx.arc(tipTopX, tipTopY, 5, 0, Math.PI * 2);
      ctx.arc(tipTopX, -tipTopY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 4;
      ctx.shadowColor = "#ffffff";
      const nockX = this.isDragging ? -this.pullDistance : 0;
      const nockY = 0;
      ctx.beginPath();
      ctx.moveTo(tipTopX, tipTopY);
      ctx.lineTo(nockX, nockY);
      ctx.lineTo(tipTopX, -tipTopY);
      ctx.stroke();
      if (!this.arrow || !this.arrow.active) {
        this.drawArrowShape(ctx, nockX, nockY, 0, this.bowRadius * 0.95);
      }
      ctx.restore();
    }
    drawTrajectoryPreview(ctx) {
      const dx = this.bowX - this.dragX;
      const dy = this.bowY - this.dragY;
      const speedRatio = this.pullDistance / this.maxPull;
      const power = speedRatio * 28 + 5;
      const angle = Math.atan2(dy, dx);
      let simX = this.bowX;
      let simY = this.bowY;
      let simVx = Math.cos(angle) * power;
      let simVy = Math.sin(angle) * power;
      ctx.save();
      ctx.strokeStyle = "rgba(255, 133, 173, 0.6)";
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(simX, simY);
      for (let i = 0; i < 25; i++) {
        simX += simVx;
        simY += simVy;
        simVy += 0.35;
        ctx.lineTo(simX, simY);
      }
      ctx.stroke();
      ctx.restore();
    }
    updateArrowPhysics(ctx) {
      const arr = this.arrow;
      arr.x += arr.vx;
      arr.y += arr.vy;
      arr.vy += 0.35;
      arr.rotation = Math.atan2(arr.vy, arr.vx);
      const distToHeart = Math.hypot(arr.x - this.heartX, arr.y - this.heartY);
      if (distToHeart < this.heartRadius && !arr.hit) {
        arr.hit = true;
        arr.active = false;
        this.isCompleted = true;
        const pill = document.getElementById("bowInstruction");
        if (pill) pill.classList.add("hidden");
        this.particles.triggerHeartHitExplosion(this.heartX, this.heartY);
        audioManager.playHeartHit();
        setTimeout(() => {
          if (this.onComplete) this.onComplete();
        }, 1200);
      }
      const boundW = this.canvas.logicalWidth || this.canvas.width;
      const boundH = this.canvas.logicalHeight || this.canvas.height;
      if (arr.x > boundW + 100 || arr.y > boundH + 100 || arr.x < -100) {
        arr.active = false;
      }
      ctx.save();
      ctx.translate(arr.x, arr.y);
      ctx.rotate(arr.rotation);
      this.drawArrowShape(ctx, 0, 0, 0, this.bowRadius * 0.95);
      ctx.restore();
    }
    drawArrowShape(ctx, x, y, rotation, length) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.strokeStyle = "#d4a373";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(length, 0);
      ctx.stroke();
      ctx.fillStyle = "#ff3366";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ff5e8e";
      ctx.save();
      ctx.translate(length + 6, -10);
      drawHeartShape(ctx, 0, 0, 20);
      ctx.restore();
      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-12, -8);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-12, 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    destroy() {
      this.detachEvents();
    }
  };

  // src/audio/blowDetector.js
  var BlowDetector = class {
    constructor() {
      this.mediaStream = null;
      this.audioContext = null;
      this.analyser = null;
      this.dataArray = null;
      this.isListening = false;
      this.onBlowCallback = null;
      this.onPermissionDeniedCallback = null;
      this.lastBlowTime = 0;
      this.blowCooldownMs = 800;
      this.animFrameId = null;
    }
    async startListening(onBlow, onPermissionDenied) {
      this.onBlowCallback = onBlow;
      this.onPermissionDeniedCallback = onPermissionDenied;
      if (this.isListening) return;
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: false,
            // Keep wind blowing noise detectable!
            autoGainControl: false
          }
        });
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContextClass();
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.3;
        source.connect(this.analyser);
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.isListening = true;
        this.analyzeAudio();
      } catch (err) {
        console.warn("Microphone access denied or unequipped:", err);
        this.isListening = false;
        if (this.onPermissionDeniedCallback) {
          this.onPermissionDeniedCallback(err);
        }
      }
    }
    analyzeAudio() {
      if (!this.isListening || !this.analyser) return;
      this.analyser.getByteFrequencyData(this.dataArray);
      let lowFreqSum = 0;
      let highFreqSum = 0;
      for (let i = 1; i <= 4; i++) {
        lowFreqSum += this.dataArray[i];
      }
      const lowFreqAvg = lowFreqSum / 4;
      for (let i = 8; i <= 20; i++) {
        highFreqSum += this.dataArray[i];
      }
      const highFreqAvg = highFreqSum / 13;
      const now = Date.now();
      if (lowFreqAvg > 125 && lowFreqAvg - highFreqAvg > 25) {
        if (now - this.lastBlowTime > this.blowCooldownMs) {
          this.lastBlowTime = now;
          if (this.onBlowCallback) {
            this.onBlowCallback();
          }
        }
      }
      this.animFrameId = requestAnimationFrame(() => this.analyzeAudio());
    }
    stopListening() {
      this.isListening = false;
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
      }
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => track.stop());
        this.mediaStream = null;
      }
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
    }
  };
  var blowDetector = new BlowDetector();

  // src/components/scene2_candles.js
  var Scene2Candles = class {
    constructor(canvas, particleSystem, onComplete) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.particles = particleSystem;
      this.onComplete = onComplete;
      this.candles = [];
      this.candlesLitCount = 5;
      this.flameFlickerPhase = 0;
      this.isCompleted = false;
      const width = canvas.logicalWidth || canvas.width;
      const height = canvas.logicalHeight || canvas.height;
      this.resize(width, height);
      this.initCandles();
      this.setupMicrophone();
      this.setupFallbackUI();
    }
    resize(width, height) {
      const isSmallPhone = width < 480;
      const isLandscapeShort = height < 550;
      this.cakeX = width / 2;
      this.cakeY = isLandscapeShort ? height * 0.68 : isSmallPhone ? height * 0.58 : height * 0.6;
      this.cakeWidth = Math.min(width * 0.8, 340);
      this.cakeWidth = Math.max(220, this.cakeWidth);
      this.candleHeight = Math.max(45, Math.min(60, height * 0.08));
      this.candleWidth = Math.max(12, Math.min(16, width * 0.035));
      if (this.candles && this.candles.length > 0) {
        this.repositionCandles();
      }
    }
    initCandles() {
      this.candles = [];
      const candleSpacing = this.cakeWidth / 6;
      const startX = this.cakeX - this.cakeWidth / 2 + candleSpacing;
      for (let i = 0; i < 5; i++) {
        this.candles.push({
          id: i,
          x: startX + i * candleSpacing,
          y: this.cakeY,
          height: this.candleHeight || 55,
          width: this.candleWidth || 14,
          isLit: true,
          flickerOffset: Math.random() * Math.PI * 2,
          smokeTriggered: false
        });
      }
      this.candlesLitCount = 5;
    }
    repositionCandles() {
      const candleSpacing = this.cakeWidth / 6;
      const startX = this.cakeX - this.cakeWidth / 2 + candleSpacing;
      for (let i = 0; i < 5; i++) {
        if (this.candles[i]) {
          this.candles[i].x = startX + i * candleSpacing;
          this.candles[i].y = this.cakeY;
          this.candles[i].height = this.candleHeight || 55;
          this.candles[i].width = this.candleWidth || 14;
        }
      }
    }
    setupMicrophone() {
      const statusText = document.getElementById("micStatusText");
      const hintText = document.getElementById("micHintText");
      blowDetector.startListening(
        () => {
          this.extinguishOneCandle();
        },
        (err) => {
          if (statusText) statusText.innerText = "Mic Denied";
          if (hintText) hintText.innerText = "Use the 'Tap to Blow' button below \u{1F32C}\uFE0F";
        }
      );
    }
    setupFallbackUI() {
      const fallbackBtn = document.getElementById("blowFallbackBtn");
      if (fallbackBtn) {
        fallbackBtn.onclick = () => {
          audioManager.resumeContext();
          this.extinguishOneCandle();
        };
      }
    }
    extinguishOneCandle() {
      if (this.candlesLitCount <= 0 || this.isCompleted) return;
      for (let i = this.candles.length - 1; i >= 0; i--) {
        if (this.candles[i].isLit) {
          this.candles[i].isLit = false;
          this.candlesLitCount--;
          this.particles.addSmokeParticle(this.candles[i].x, this.candles[i].y - this.candles[i].height);
          audioManager.playCandleExtinguish();
          audioManager.duckMusic(1500);
          const counterEl = document.getElementById("candleCountText");
          if (counterEl) {
            counterEl.innerText = `${this.candlesLitCount} / 5 Candles Glowing`;
          }
          break;
        }
      }
      if (this.candlesLitCount === 0 && !this.isCompleted) {
        this.isCompleted = true;
        blowDetector.stopListening();
        const counterEl = document.getElementById("candleCountText");
        if (counterEl) {
          counterEl.innerText = `\u2728 Wish Granted! \u2728`;
        }
        setTimeout(() => {
          if (this.onComplete) this.onComplete();
        }, 1500);
      }
    }
    updateAndRender() {
      const ctx = this.ctx;
      this.flameFlickerPhase += 0.1;
      this.drawCake(ctx);
      for (let candle of this.candles) {
        this.drawCandle(ctx, candle);
      }
      this.particles.updateAndRenderSmoke();
    }
    drawCake(ctx) {
      ctx.save();
      ctx.translate(this.cakeX, this.cakeY);
      const w = this.cakeWidth;
      const baseGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
      baseGrad.addColorStop(0, "#ffb7c5");
      baseGrad.addColorStop(0.5, "#ffd1dc");
      baseGrad.addColorStop(1, "#ffb7c5");
      ctx.fillStyle = baseGrad;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(255, 94, 142, 0.3)";
      ctx.beginPath();
      ctx.roundRect(-w / 2, 0, w, 75, [0, 0, 16, 16]);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      for (let x = -w / 2; x <= w / 2; x += w / 10) {
        ctx.quadraticCurveTo(x + w / 20, 18, x + w / 10, 0);
      }
      ctx.lineTo(w / 2, 20);
      ctx.lineTo(-w / 2, 20);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#e0386b";
      for (let i = 0; i <= 6; i++) {
        const cx = -w / 2 + i * w / 6;
        ctx.beginPath();
        ctx.arc(cx, -4, 9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    drawCandle(ctx, candle) {
      ctx.save();
      ctx.translate(candle.x, candle.y);
      const waxGrad = ctx.createLinearGradient(-candle.width / 2, 0, candle.width / 2, 0);
      waxGrad.addColorStop(0, "#ffe5ec");
      waxGrad.addColorStop(0.5, "#ffffff");
      waxGrad.addColorStop(1, "#ffb7c5");
      ctx.fillStyle = waxGrad;
      ctx.beginPath();
      ctx.roundRect(-candle.width / 2, -candle.height, candle.width, candle.height, [4, 4, 0, 0]);
      ctx.fill();
      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -candle.height);
      ctx.lineTo(0, -candle.height - 10);
      ctx.stroke();
      if (candle.isLit) {
        const flicker = Math.sin(this.flameFlickerPhase + candle.flickerOffset) * 2;
        const flameHeight = 24 + flicker;
        const flameY = -candle.height - 10;
        const glow = ctx.createRadialGradient(0, flameY - flameHeight / 2, 2, 0, flameY - flameHeight / 2, 35);
        glow.addColorStop(0, "rgba(255, 215, 0, 0.8)");
        glow.addColorStop(0.5, "rgba(255, 133, 0, 0.3)");
        glow.addColorStop(1, "rgba(255, 133, 0, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, flameY - flameHeight / 2, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff9900";
        ctx.beginPath();
        ctx.moveTo(0, flameY);
        ctx.bezierCurveTo(-9, flameY - 7, -7, flameY - flameHeight, 0, flameY - flameHeight - 5);
        ctx.bezierCurveTo(7, flameY - flameHeight, 9, flameY - 7, 0, flameY);
        ctx.fill();
        ctx.fillStyle = "#ffffcc";
        ctx.beginPath();
        ctx.moveTo(0, flameY);
        ctx.bezierCurveTo(-4, flameY - 4, -3, flameY - flameHeight + 7, 0, flameY - flameHeight + 2);
        ctx.bezierCurveTo(3, flameY - flameHeight + 7, 4, flameY - 4, 0, flameY);
        ctx.fill();
      }
      ctx.restore();
    }
    destroy() {
      blowDetector.stopListening();
    }
  };

  // src/components/scene3_gift.js
  var Scene3Gift = class {
    constructor(canvas, particleSystem, onComplete) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.particles = particleSystem;
      this.onComplete = onComplete;
      this.state = "shaking";
      this.shakeTime = 0;
      this.lidOffsetY = 0;
      this.lidBounceVelocity = 0;
      this.crystalFloatPhase = 0;
      const width = canvas.logicalWidth || canvas.width;
      const height = canvas.logicalHeight || canvas.height;
      this.resize(width, height);
      this.butterflies = [];
      this.initButterflies();
      this.boundClick = this.handleClick.bind(this);
      this.canvas.addEventListener("click", this.boundClick);
      this.startSequence();
    }
    resize(width, height) {
      const isSmallPhone = width < 480;
      this.boxX = width / 2;
      this.boxY = isSmallPhone ? height * 0.54 : height * 0.58;
      this.boxSize = Math.min(width * 0.45, 200);
      this.boxSize = Math.max(130, this.boxSize);
    }
    initButterflies() {
      this.butterflies = [];
      for (let i = 0; i < 6; i++) {
        this.butterflies.push({
          x: this.boxX,
          y: this.boxY - 40,
          vx: (Math.random() - 0.5) * 3,
          vy: -(Math.random() * 2 + 1),
          wingAngle: 0,
          wingSpeed: Math.random() * 0.15 + 0.1,
          color: ["#ff85ad", "#ffd700", "#ffb7c5"][Math.floor(Math.random() * 3)]
        });
      }
    }
    startSequence() {
      const shakeInterval = setInterval(() => {
        this.shakeTime += 0.05;
        if (this.shakeTime >= 2) {
          clearInterval(shakeInterval);
          this.openGiftBox();
        }
      }, 50);
    }
    handleClick(e) {
      if (this.state === "shaking") {
        this.openGiftBox();
      }
    }
    openGiftBox() {
      if (this.state === "opened") return;
      this.state = "opened";
      this.particles.triggerGiftBurst(this.boxX, this.boxY - 40);
      audioManager.playBoxPop();
      setTimeout(() => {
        const modal = document.getElementById("loveLetterModal");
        if (modal) {
          modal.classList.add("open");
        }
      }, 800);
      const proceedBtn = document.getElementById("proceedToTreeBtn");
      const closeBtn = document.getElementById("closeLetterBtn");
      if (proceedBtn) {
        proceedBtn.onclick = () => {
          const modal = document.getElementById("loveLetterModal");
          if (modal) modal.classList.remove("open");
          if (this.onComplete) this.onComplete();
        };
      }
      if (closeBtn) {
        closeBtn.onclick = () => {
          const modal = document.getElementById("loveLetterModal");
          if (modal) modal.classList.remove("open");
          if (this.onComplete) this.onComplete();
        };
      }
    }
    updateAndRender() {
      const ctx = this.ctx;
      this.crystalFloatPhase += 0.03;
      const width = this.canvas.logicalWidth || this.canvas.width;
      const height = this.canvas.logicalHeight || this.canvas.height;
      ctx.save();
      const darkGrad = ctx.createRadialGradient(
        this.boxX,
        this.boxY,
        100,
        this.boxX,
        this.boxY,
        Math.max(width, height) * 0.8
      );
      darkGrad.addColorStop(0, "rgba(35, 18, 25, 0.4)");
      darkGrad.addColorStop(1, "rgba(15, 8, 12, 0.85)");
      ctx.fillStyle = darkGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      if (this.state === "opened") {
        this.drawGlowingCrystal(ctx);
        this.updateAndRenderButterflies(ctx);
      }
      this.drawGiftBox(ctx);
      this.particles.updateAndRenderGiftBurst();
    }
    drawGiftBox(ctx) {
      ctx.save();
      ctx.translate(this.boxX, this.boxY);
      if (this.state === "shaking") {
        const shakeX = Math.sin(this.shakeTime * 30) * 4;
        ctx.translate(shakeX, 0);
      }
      const s = this.boxSize;
      const boxGrad = ctx.createLinearGradient(-s / 2, 0, s / 2, 0);
      boxGrad.addColorStop(0, "#ff5e8e");
      boxGrad.addColorStop(0.5, "#ff85ad");
      boxGrad.addColorStop(1, "#e0386b");
      ctx.fillStyle = boxGrad;
      ctx.shadowBlur = 30;
      ctx.shadowColor = "rgba(255, 94, 142, 0.5)";
      ctx.beginPath();
      ctx.roundRect(-s / 2, -s * 0.4, s, s * 0.8, 16);
      ctx.fill();
      const goldGrad = ctx.createLinearGradient(-15, 0, 15, 0);
      goldGrad.addColorStop(0, "#ffd700");
      goldGrad.addColorStop(0.5, "#fff0aa");
      goldGrad.addColorStop(1, "#cca100");
      ctx.fillStyle = goldGrad;
      ctx.fillRect(-18, -s * 0.4, 36, s * 0.8);
      if (this.state === "opened") {
        this.lidOffsetY += (-140 - this.lidOffsetY) * 0.12;
      }
      ctx.save();
      ctx.translate(0, -s * 0.4 + this.lidOffsetY);
      ctx.fillStyle = boxGrad;
      ctx.beginPath();
      ctx.roundRect(-s * 0.55, -28, s * 1.1, 32, 8);
      ctx.fill();
      ctx.fillStyle = goldGrad;
      ctx.fillRect(-18, -28, 36, 32);
      ctx.beginPath();
      ctx.ellipse(-20, -38, 22, 12, -Math.PI / 6, 0, Math.PI * 2);
      ctx.ellipse(20, -38, 22, 12, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -34, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();
    }
    drawGlowingCrystal(ctx) {
      const floatY = Math.sin(this.crystalFloatPhase) * 12;
      const cx = this.boxX;
      const cy = this.boxY - this.boxSize * 0.9 + floatY;
      ctx.save();
      ctx.translate(cx, cy);
      const aura = ctx.createRadialGradient(0, 0, 5, 0, 0, 60);
      aura.addColorStop(0, "rgba(255, 215, 0, 0.8)");
      aura.addColorStop(0.6, "rgba(255, 133, 173, 0.4)");
      aura.addColorStop(1, "rgba(255, 133, 173, 0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#ffd700";
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(18, 0);
      ctx.lineTo(0, 24);
      ctx.lineTo(-18, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    updateAndRenderButterflies(ctx) {
      const width = this.canvas.logicalWidth || this.canvas.width;
      for (let b of this.butterflies) {
        b.x += b.vx;
        b.y += b.vy;
        b.wingAngle += b.wingSpeed;
        if (b.y < 50 || Math.abs(b.x - this.boxX) > width * 0.4) {
          b.vy = -b.vy * 0.5;
          b.vx = -b.vx;
        }
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.fillStyle = b.color;
        ctx.globalAlpha = 0.85;
        const wingScale = Math.sin(b.wingAngle);
        ctx.beginPath();
        ctx.ellipse(-8 * wingScale, 0, 10 * Math.abs(wingScale), 14, Math.PI / 4, 0, Math.PI * 2);
        ctx.ellipse(8 * wingScale, 0, 10 * Math.abs(wingScale), 14, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    destroy() {
      this.canvas.removeEventListener("click", this.boundClick);
    }
  };

  // src/components/scene4_heartTree.js
  var Scene4HeartTree = class {
    constructor(canvas, particleSystem) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.particles = particleSystem;
      const width = canvas.logicalWidth || canvas.width;
      const height = canvas.logicalHeight || canvas.height;
      this.resize(width, height);
      this.startTime = Date.now();
      this.trunkGrowthProgress = 0;
      this.particles.initHeartTreeCanopy(this.centerX, this.canopyCenterY, 480);
      this.triggerTypographySequence();
      audioManager.playHeartHit();
      this.boundClick = this.handleCanvasClick.bind(this);
      this.canvas.addEventListener("click", this.boundClick);
    }
    resize(width, height) {
      const isSmallPhone = width < 480;
      const isLandscapeShort = height < 550;
      this.centerX = width / 2;
      this.groundY = height;
      this.canopyCenterY = isLandscapeShort ? height * 0.45 : isSmallPhone ? height * 0.38 : height * 0.42;
    }
    triggerTypographySequence() {
      const l1 = document.getElementById("typographyLine1");
      const l2 = document.getElementById("typographyLine2");
      const l3 = document.getElementById("typographyLine3");
      setTimeout(() => {
        if (l1) l1.classList.add("show");
      }, 1200);
      setTimeout(() => {
        if (l2) l2.classList.add("show");
      }, 2200);
      setTimeout(() => {
        if (l3) l3.classList.add("show");
      }, 3400);
    }
    handleCanvasClick(e) {
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      this.particles.triggerHeartHitExplosion(px, py);
      audioManager.playBowPull(0.5);
    }
    updateAndRender() {
      const ctx = this.ctx;
      const elapsedSeconds = (Date.now() - this.startTime) / 1e3;
      const width = this.canvas.logicalWidth || this.canvas.width;
      const height = this.canvas.logicalHeight || this.canvas.height;
      ctx.save();
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "#1c0f16");
      bgGrad.addColorStop(0.5, "#361824");
      bgGrad.addColorStop(1, "#180a11");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      if (this.trunkGrowthProgress < 1) {
        this.trunkGrowthProgress += 0.015;
        if (this.trunkGrowthProgress > 1) this.trunkGrowthProgress = 1;
      }
      this.drawCurvedTreeTrunk(ctx, this.trunkGrowthProgress, width, height);
      this.particles.updateAndRenderHeartTree(elapsedSeconds);
      this.particles.updateAndRenderHitParticles();
    }
    drawCurvedTreeTrunk(ctx, progress, width, height) {
      ctx.save();
      const startX = this.centerX;
      const startY = this.groundY;
      const endX = this.centerX;
      const endY = this.canopyCenterY + 40;
      const trunkGrad = ctx.createLinearGradient(startX - 40, 0, startX + 40, 0);
      trunkGrad.addColorStop(0, "#211018");
      trunkGrad.addColorStop(0.5, "#40232e");
      trunkGrad.addColorStop(1, "#1a0b12");
      ctx.strokeStyle = trunkGrad;
      ctx.lineCap = "round";
      const maxThickness = Math.max(20, Math.min(width * 0.07, 42));
      ctx.lineWidth = maxThickness;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      const cp1x = startX - width * 0.05;
      const cp1y = startY - (startY - endY) * 0.4 * progress;
      const cp2x = startX + width * 0.03;
      const cp2y = startY - (startY - endY) * 0.7 * progress;
      const currentEndY = startY - (startY - endY) * progress;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, currentEndY);
      ctx.stroke();
      if (progress > 0.5) {
        const branchProgress = (progress - 0.5) * 2;
        ctx.lineWidth = maxThickness * 0.45;
        const branchSpread = Math.min(width * 0.18, 110);
        ctx.beginPath();
        ctx.moveTo(endX, currentEndY + 20);
        ctx.quadraticCurveTo(endX - branchSpread * 0.6, currentEndY - 30, endX - branchSpread * branchProgress, currentEndY - 60 * branchProgress);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(endX, currentEndY + 30);
        ctx.quadraticCurveTo(endX + branchSpread * 0.6, currentEndY - 20, endX + branchSpread * branchProgress, currentEndY - 50 * branchProgress);
        ctx.stroke();
      }
      ctx.restore();
    }
    destroy() {
      this.canvas.removeEventListener("click", this.boundClick);
    }
  };

  // src/main.js
  var App = class {
    constructor() {
      this.canvas = document.getElementById("mainCanvas");
      this.ctx = this.canvas.getContext("2d");
      this.currentSceneIndex = 1;
      this.currentSceneInstance = null;
      this.particleSystem = null;
      this.animFrameId = null;
      this.initCanvasSize();
      this.initParticleSystem();
      this.setupGlobalControls();
      this.loadScene(1);
      this.runLoop = this.loop.bind(this);
      requestAnimationFrame(this.runLoop);
      window.addEventListener("resize", () => this.handleResize());
      window.addEventListener("orientationchange", () => {
        setTimeout(() => this.handleResize(), 150);
      });
    }
    initCanvasSize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;
      this.dpr = dpr;
      this.displayWidth = displayWidth;
      this.displayHeight = displayHeight;
      this.canvas.width = Math.round(displayWidth * dpr);
      this.canvas.height = Math.round(displayHeight * dpr);
      this.canvas.style.width = `${displayWidth}px`;
      this.canvas.style.height = `${displayHeight}px`;
      this.canvas.logicalWidth = displayWidth;
      this.canvas.logicalHeight = displayHeight;
      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);
    }
    handleResize() {
      this.initCanvasSize();
      if (this.particleSystem) {
        this.particleSystem.resize(this.displayWidth, this.displayHeight);
      }
      if (this.currentSceneInstance && this.currentSceneInstance.resize) {
        this.currentSceneInstance.resize(this.displayWidth, this.displayHeight);
      }
    }
    initParticleSystem() {
      this.particleSystem = new ParticleSystem(this.canvas);
      this.particleSystem.initPetals(35);
      this.particleSystem.initSparkles(45);
    }
    setupGlobalControls() {
      const musicBtn = document.getElementById("musicToggleBtn");
      const musicStatusText = document.getElementById("musicStatusText");
      if (musicBtn) {
        musicBtn.onclick = () => {
          const isPlaying = audioManager.toggleMusic();
          if (musicStatusText) {
            musicStatusText.innerText = isPlaying ? "Music On" : "Muted";
          }
        };
      }
      const restartBtn = document.getElementById("restartBtn");
      if (restartBtn) {
        restartBtn.onclick = () => {
          this.resetExperience();
        };
      }
      const replayAllBtn = document.getElementById("replayAllBtn");
      if (replayAllBtn) {
        replayAllBtn.onclick = () => {
          this.resetExperience();
        };
      }
    }
    resetExperience() {
      ["typographyLine1", "typographyLine2", "typographyLine3"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.classList.remove("show");
      });
      const modal = document.getElementById("loveLetterModal");
      if (modal) modal.classList.remove("open");
      this.loadScene(1);
    }
    loadScene(sceneNumber) {
      if (this.currentSceneInstance && this.currentSceneInstance.destroy) {
        this.currentSceneInstance.destroy();
      }
      this.currentSceneIndex = sceneNumber;
      this.updateUIOverlays(sceneNumber);
      switch (sceneNumber) {
        case 1:
          this.currentSceneInstance = new Scene1Welcome(
            this.canvas,
            this.particleSystem,
            () => this.loadScene(2)
          );
          break;
        case 2:
          this.currentSceneInstance = new Scene2Candles(
            this.canvas,
            this.particleSystem,
            () => this.loadScene(3)
          );
          break;
        case 3:
          this.currentSceneInstance = new Scene3Gift(
            this.canvas,
            this.particleSystem,
            () => this.loadScene(4)
          );
          break;
        case 4:
          this.currentSceneInstance = new Scene4HeartTree(
            this.canvas,
            this.particleSystem
          );
          break;
      }
    }
    updateUIOverlays(activeSceneNumber) {
      for (let i = 1; i <= 4; i++) {
        const overlay = document.getElementById(`scene${i}UI`);
        if (overlay) {
          if (i === activeSceneNumber) {
            overlay.classList.add("active");
          } else {
            overlay.classList.remove("active");
          }
        }
      }
    }
    loop() {
      this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
      if (this.currentSceneIndex === 1 || this.currentSceneIndex === 2) {
        this.particleSystem.updateAndRenderBackground();
      }
      if (this.currentSceneInstance && this.currentSceneInstance.updateAndRender) {
        this.currentSceneInstance.updateAndRender();
      }
      requestAnimationFrame(this.runLoop);
    }
  };
  window.addEventListener("DOMContentLoaded", () => {
    new App();
  });
})();
