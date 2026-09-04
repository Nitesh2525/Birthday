// Scene 1: Welcome - Floating Petals, Glowing 3D Heart, Bow & Arrow Physics

import { drawHeartShape } from '../utils/particles.js';
import { audioManager } from '../audio/audioManager.js';

export class Scene1Welcome {
  constructor(canvas, particleSystem, onComplete) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = particleSystem;
    this.onComplete = onComplete;

    // Heart Target Properties
    this.heartX = canvas.width / 2;
    this.heartY = canvas.height * 0.38;
    this.heartRadius = 65;
    this.heartPulse = 0;

    // Bow & Arrow Physics & Coordinates
    this.bowX = Math.max(100, canvas.width * 0.15);
    this.bowY = canvas.height - 150;
    this.bowRadius = 75;

    this.isDragging = false;
    this.dragX = this.bowX;
    this.dragY = this.bowY;
    this.pullDistance = 0;
    this.maxPull = 120;

    // Flying Arrow State
    this.arrow = null; // { x, y, vx, vy, rotation, active, hit }
    this.isCompleted = false;

    // Event Bindings
    this.boundPointerDown = this.handlePointerDown.bind(this);
    this.boundPointerMove = this.handlePointerMove.bind(this);
    this.boundPointerUp = this.handlePointerUp.bind(this);

    this.attachEvents();
  }

  resize(width, height) {
    this.heartX = width / 2;
    this.heartY = height * 0.38;
    this.bowX = Math.max(100, width * 0.15);
    this.bowY = height - 150;
    if (!this.isDragging && (!this.arrow || !this.arrow.active)) {
      this.dragX = this.bowX;
      this.dragY = this.bowY;
    }
  }

  attachEvents() {
    this.canvas.addEventListener('pointerdown', this.boundPointerDown);
    window.addEventListener('pointermove', this.boundPointerMove);
    window.addEventListener('pointerup', this.boundPointerUp);
  }

  detachEvents() {
    this.canvas.removeEventListener('pointerdown', this.boundPointerDown);
    window.removeEventListener('pointermove', this.boundPointerMove);
    window.removeEventListener('pointerup', this.boundPointerUp);
  }

  handlePointerDown(e) {
    if (this.isCompleted || (this.arrow && this.arrow.active)) return;

    const rect = this.canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Check distance to bowstring nock area
    const distToBow = Math.hypot(px - this.bowX, py - this.bowY);
    if (distToBow < 100) {
      this.isDragging = true;
      this.dragX = px;
      this.dragY = py;
      audioManager.resumeContext();
      audioManager.startBackgroundMusic();
    }
  }

  handlePointerMove(e) {
    if (!this.isDragging) return;

    const rect = this.canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Calculate displacement vector from bow center
    const dx = px - this.bowX;
    const dy = py - this.bowY;
    const dist = Math.hypot(dx, dy);

    // Limit maximum pull distance
    this.pullDistance = Math.min(dist, this.maxPull);

    if (dist > 0) {
      const angle = Math.atan2(dy, dx);
      this.dragX = this.bowX + Math.cos(angle) * this.pullDistance;
      this.dragY = this.bowY + Math.sin(angle) * this.pullDistance;
    }

    // Play subtle tension sound on pull
    audioManager.playBowPull(this.pullDistance / this.maxPull);
  }

  handlePointerUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;

    // Calculate launch velocity vector opposite to pull direction
    const dx = this.bowX - this.dragX;
    const dy = this.bowY - this.dragY;
    const speedRatio = this.pullDistance / this.maxPull;

    if (speedRatio > 0.15) {
      // Launch Arrow with kinematic velocity
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

    // Reset drag position
    this.dragX = this.bowX;
    this.dragY = this.bowY;
    this.pullDistance = 0;
  }

  updateAndRender() {
    const ctx = this.ctx;
    this.heartPulse += 0.04;

    // 1. Draw Glowing 3D Heart Target
    ctx.save();
    const pulseScale = 1 + Math.sin(this.heartPulse) * 0.04;
    ctx.translate(this.heartX, this.heartY);
    ctx.scale(pulseScale, pulseScale);

    // Radial Glow Aura
    const glowGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 120);
    glowGrad.addColorStop(0, 'rgba(255, 133, 173, 0.6)');
    glowGrad.addColorStop(0.6, 'rgba(255, 94, 142, 0.2)');
    glowGrad.addColorStop(1, 'rgba(255, 94, 142, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 120, 0, Math.PI * 2);
    ctx.fill();

    // 3D Heart Body with Shader-like Gradient
    const heartGrad = ctx.createLinearGradient(-40, -40, 40, 40);
    heartGrad.addColorStop(0, '#ff85ad');
    heartGrad.addColorStop(0.5, '#ff3366');
    heartGrad.addColorStop(1, '#990033');

    ctx.fillStyle = heartGrad;
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#ff5e8e';

    drawHeartShape(ctx, 0, -45, 90);
    ctx.restore();

    // 2. Draw Realistic Wooden Bow
    this.drawBow(ctx);

    // 3. Draw Trajectory Preview when dragging
    if (this.isDragging && this.pullDistance > 20) {
      this.drawTrajectoryPreview(ctx);
    }

    // 4. Update & Render Flying Arrow Physics
    if (this.arrow && this.arrow.active) {
      this.updateArrowPhysics(ctx);
    }

    // Render hit burst particles
    this.particles.updateAndRenderHitParticles();
  }

  drawBow(ctx) {
    ctx.save();
    ctx.translate(this.bowX, this.bowY);

    // Aim angle toward drag or default toward center heart
    let aimAngle = Math.atan2(this.heartY - this.bowY, this.heartX - this.bowX);
    if (this.isDragging) {
      aimAngle = Math.atan2(this.bowY - this.dragY, this.bowX - this.dragX);
    }

    ctx.rotate(aimAngle);

    // Curved Wooden Bow Limb (Layered wood texture gradient)
    const bowGrad = ctx.createLinearGradient(-this.bowRadius, 0, this.bowRadius, 0);
    bowGrad.addColorStop(0, '#5c3a21');
    bowGrad.addColorStop(0.5, '#8b5a2b');
    bowGrad.addColorStop(1, '#5c3a21');

    ctx.strokeStyle = bowGrad;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';

    // Flex bow arc based on pull distance
    const flexOffset = this.isDragging ? (this.pullDistance / this.maxPull) * 15 : 0;

    ctx.beginPath();
    ctx.arc(0, 0, this.bowRadius - flexOffset, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    // Wooden Limb Accents (Gold metallic tips)
    ctx.fillStyle = '#ffd700';
    const tipTopX = Math.cos(-Math.PI * 0.4) * (this.bowRadius - flexOffset);
    const tipTopY = Math.sin(-Math.PI * 0.4) * (this.bowRadius - flexOffset);
    ctx.beginPath();
    ctx.arc(tipTopX, tipTopY, 6, 0, Math.PI * 2);
    ctx.arc(tipTopX, -tipTopY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Elastic Bowstring
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ffffff';

    const nockX = this.isDragging ? -this.pullDistance : 0;
    const nockY = 0;

    ctx.beginPath();
    ctx.moveTo(tipTopX, tipTopY);
    ctx.lineTo(nockX, nockY);
    ctx.lineTo(tipTopX, -tipTopY);
    ctx.stroke();

    // Nocked Heart-Arrow (if not yet launched)
    if (!this.arrow || !this.arrow.active) {
      this.drawArrowShape(ctx, nockX, nockY, 0, 70);
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
    ctx.strokeStyle = 'rgba(255, 133, 173, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);

    ctx.beginPath();
    ctx.moveTo(simX, simY);

    for (let i = 0; i < 25; i++) {
      simX += simVx;
      simY += simVy;
      simVy += 0.35; // Gravity
      ctx.lineTo(simX, simY);
    }

    ctx.stroke();
    ctx.restore();
  }

  updateArrowPhysics(ctx) {
    const arr = this.arrow;
    arr.x += arr.vx;
    arr.y += arr.vy;
    arr.vy += 0.35; // Gravity acceleration
    arr.rotation = Math.atan2(arr.vy, arr.vx);

    // Collision Detection with Central Glowing Heart
    const distToHeart = Math.hypot(arr.x - this.heartX, arr.y - this.heartY);

    if (distToHeart < this.heartRadius && !arr.hit) {
      arr.hit = true;
      arr.active = false;
      this.isCompleted = true;

      // Trigger hit FX
      this.particles.triggerHeartHitExplosion(this.heartX, this.heartY);
      audioManager.playHeartHit();

      // Transition to Scene 2 after delay
      setTimeout(() => {
        if (this.onComplete) this.onComplete();
      }, 1200);
    }

    // Screen Boundary Reset if missed target
    if (arr.x > this.canvas.width + 100 || arr.y > this.canvas.height + 100 || arr.x < -100) {
      arr.active = false;
    }

    // Render Flying Arrow
    ctx.save();
    ctx.translate(arr.x, arr.y);
    ctx.rotate(arr.rotation);
    this.drawArrowShape(ctx, 0, 0, 0, 70);
    ctx.restore();
  }

  drawArrowShape(ctx, x, y, rotation, length) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Wooden Shaft
    ctx.strokeStyle = '#d4a373';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);
    ctx.stroke();

    // Heart Arrowhead (Pink glowing heart tip)
    ctx.fillStyle = '#ff3366';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff5e8e';
    ctx.save();
    ctx.translate(length + 6, -10);
    drawHeartShape(ctx, 0, 0, 20);
    ctx.restore();

    // Fletching Feathers (Golden accent feathers)
    ctx.fillStyle = '#ffd700';
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
}
