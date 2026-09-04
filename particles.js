// Particle Systems & Math Utilities

export class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.petals = [];
    this.sparkles = [];
    this.hitParticles = [];
    this.smokeParticles = [];
    this.giftBurstParticles = [];
    this.treeHearts = [];
  }

  // Scene 1: Initialize Floating Flower Petals
  initPetals(count = 35) {
    this.petals = [];
    for (let i = 0; i < count; i++) {
      this.petals.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 8 + 6,
        speedY: Math.random() * 0.8 + 0.4,
        speedX: Math.random() * 0.5 - 0.25,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.03 + 0.01,
        color: ['#ffb7c5', '#ff9eaa', '#ffd1dc', '#fff0f3'][Math.floor(Math.random() * 4)],
        opacity: Math.random() * 0.6 + 0.3
      });
    }
  }

  // Scene 1: Initialize Magic Dust Sparkles
  initSparkles(count = 45) {
    this.sparkles = [];
    for (let i = 0; i < count; i++) {
      this.sparkles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 3 + 1,
        alpha: Math.random(),
        pulseSpeed: Math.random() * 0.04 + 0.01,
        color: ['#ffffff', '#ffd700', '#ff85ad'][Math.floor(Math.random() * 3)]
      });
    }
  }

  updateAndRenderBackground(deltaTime) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Render Sparkles
    for (let s of this.sparkles) {
      s.alpha += s.pulseSpeed;
      if (s.alpha > 1 || s.alpha < 0) s.pulseSpeed = -s.pulseSpeed;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();

      // Soft glow aura around sparkles
      ctx.shadowBlur = 8;
      ctx.shadowColor = s.color;
      ctx.fill();
      ctx.restore();
    }

    // Render & Update Petals
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

      // Draw Rose Petal shape
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
        color: ['#ff3366', '#ff5e8e', '#ffd700', '#ffffff'][Math.floor(Math.random() * 4)],
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
      p.vy += 0.15; // Soft gravity
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

      // Draw Mini Heart Particle
      drawHeartShape(ctx, 0, 0, p.size);
      ctx.restore();
    }
  }

  // Scene 2: Soft Smoke rising from candle
  addSmokeParticle(x, y) {
    for (let i = 0; i < 4; i++) {
      this.smokeParticles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y,
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
      ctx.fillStyle = 'rgba(230, 220, 225, 0.6)';
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
        color: ['#ffd700', '#ff85ad', '#ffffff', '#ffb7c5'][Math.floor(Math.random() * 4)]
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
    const canopyScale = Math.min(this.canvas.width, this.canvas.height) * 0.022;

    for (let i = 0; i < count; i++) {
      // Heart parametric curve equation:
      // t from 0 to 2PI
      const t = Math.random() * Math.PI * 2;
      
      // Heart envelope math
      let hx = 16 * Math.pow(Math.sin(t), 3);
      let hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

      // Add volumetric foliage scatter inside heart envelope
      const rRatio = Math.sqrt(Math.random()); // Solid volume distribution
      hx *= rRatio;
      hy *= rRatio;

      const targetX = centerX + hx * canopyScale;
      const targetY = centerY + hy * canopyScale - 60; // Offset canopy above trunk

      // Random starting positions offscreen (flying in from all directions)
      const startAngle = Math.random() * Math.PI * 2;
      const startDist = Math.max(this.canvas.width, this.canvas.height) * (0.8 + Math.random() * 0.6);
      const startX = centerX + Math.cos(startAngle) * startDist;
      const startY = centerY + Math.sin(startAngle) * startDist;

      this.treeHearts.push({
        startX: startX,
        startY: startY,
        currentX: startX,
        currentY: startY,
        targetX: targetX,
        targetY: targetY,
        size: Math.random() * 10 + 6,
        color: ['#ff5e8e', '#ff85ad', '#ffa07a', '#ffd700', '#e0386b', '#ffb7c5'][Math.floor(Math.random() * 6)],
        progress: 0,
        speed: Math.random() * 0.015 + 0.008,
        delay: Math.random() * 1.5, // Staggered flight entry
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
        
        // Quadratic ease-out lerp
        const ease = 1 - Math.pow(1 - p.progress, 3);
        p.currentX = p.startX + (p.targetX - p.startX) * ease;
        p.currentY = p.startY + (p.targetY - p.startY) * ease;
      } else {
        // Subtle ambient floating leaf movement once assembled
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
}

// Utility to draw a smooth 2D Heart Path
export function drawHeartShape(ctx, x, y, size) {
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
