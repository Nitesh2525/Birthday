// Scene 4: Organic Tree Growth, Assembling Heart Tree Canopy & Elegant Typography

import { audioManager } from '../audio/audioManager.js';

export class Scene4HeartTree {
  constructor(canvas, particleSystem) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = particleSystem;

    // Tree Coordinates
    this.centerX = canvas.width / 2;
    this.groundY = canvas.height;
    this.canopyCenterY = canvas.height * 0.42;

    // Growth Timeline & Animations
    this.startTime = Date.now();
    this.trunkGrowthProgress = 0; // 0 to 1

    // Initialize 450+ Heart Canopy Particles
    this.particles.initHeartTreeCanopy(this.centerX, this.canopyCenterY, 480);

    // Trigger Typography Animations in HTML overlay
    this.triggerTypographySequence();

    // Sound FX
    audioManager.playHeartHit();

    // Click interactive heart bursts
    this.boundClick = this.handleCanvasClick.bind(this);
    this.canvas.addEventListener('click', this.boundClick);
  }

  resize(width, height) {
    this.centerX = width / 2;
    this.groundY = height;
    this.canopyCenterY = height * 0.42;
  }

  triggerTypographySequence() {
    const l1 = document.getElementById('typographyLine1');
    const l2 = document.getElementById('typographyLine2');
    const l3 = document.getElementById('typographyLine3');

    // Staggered reveal
    setTimeout(() => { if (l1) l1.classList.add('show'); }, 1200);
    setTimeout(() => { if (l2) l2.classList.add('show'); }, 2200);
    setTimeout(() => { if (l3) l3.classList.add('show'); }, 3400);
  }

  handleCanvasClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Interactive Heart Burst on Click
    this.particles.triggerHeartHitExplosion(px, py);
    audioManager.playBowPull(0.5);
  }

  updateAndRender() {
    const ctx = this.ctx;
    const elapsedSeconds = (Date.now() - this.startTime) / 1000;

    // 1. Render Romantic Dusk Sky Gradient Background
    ctx.save();
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    bgGrad.addColorStop(0, '#1c0f16');
    bgGrad.addColorStop(0.5, '#361824');
    bgGrad.addColorStop(1, '#180a11');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();

    // 2. Animate & Render Dark Curved Tree Trunk Growth
    if (this.trunkGrowthProgress < 1) {
      this.trunkGrowthProgress += 0.015;
      if (this.trunkGrowthProgress > 1) this.trunkGrowthProgress = 1;
    }
    this.drawCurvedTreeTrunk(ctx, this.trunkGrowthProgress);

    // 3. Update & Render Assembling Heart Canopy Particles
    this.particles.updateAndRenderHeartTree(elapsedSeconds);

    // 4. Render On-Click Heart Explosion Bursts
    this.particles.updateAndRenderHitParticles();
  }

  drawCurvedTreeTrunk(ctx, progress) {
    ctx.save();

    const startX = this.centerX;
    const startY = this.groundY;
    const endX = this.centerX;
    const endY = this.canopyCenterY + 40;

    // Curved Bezier Trunk Paths (Organic wood gradient)
    const trunkGrad = ctx.createLinearGradient(startX - 40, 0, startX + 40, 0);
    trunkGrad.addColorStop(0, '#211018');
    trunkGrad.addColorStop(0.5, '#40232e');
    trunkGrad.addColorStop(1, '#1a0b12');

    ctx.strokeStyle = trunkGrad;
    ctx.lineCap = 'round';

    // Main Trunk Base
    const maxThickness = Math.min(this.canvas.width * 0.06, 42);
    ctx.lineWidth = maxThickness;

    ctx.beginPath();
    ctx.moveTo(startX, startY);

    // Curved Bezier Control Points
    const cp1x = startX - 35;
    const cp1y = startY - (startY - endY) * 0.4 * progress;
    const cp2x = startX + 25;
    const cp2y = startY - (startY - endY) * 0.7 * progress;
    const currentEndY = startY - (startY - endY) * progress;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, currentEndY);
    ctx.stroke();

    // Branching Tendrils Support (if trunk grown > 50%)
    if (progress > 0.5) {
      const branchProgress = (progress - 0.5) * 2;
      ctx.lineWidth = maxThickness * 0.4;

      // Left Branch
      ctx.beginPath();
      ctx.moveTo(endX, currentEndY + 20);
      ctx.quadraticCurveTo(endX - 70, currentEndY - 30, endX - 110 * branchProgress, currentEndY - 60 * branchProgress);
      ctx.stroke();

      // Right Branch
      ctx.beginPath();
      ctx.moveTo(endX, currentEndY + 30);
      ctx.quadraticCurveTo(endX + 70, currentEndY - 20, endX + 110 * branchProgress, currentEndY - 50 * branchProgress);
      ctx.stroke();
    }

    ctx.restore();
  }

  destroy() {
    this.canvas.removeEventListener('click', this.boundClick);
  }
}
