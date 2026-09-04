// Scene 3: Surprise Luxury Pink Gift Box, Bounce Animation, Love Letter & Crystal

import { audioManager } from '../audio/audioManager.js';

export class Scene3Gift {
  constructor(canvas, particleSystem, onComplete) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = particleSystem;
    this.onComplete = onComplete;

    // Gift Box Coordinates & Dimensions
    this.boxX = canvas.width / 2;
    this.boxY = canvas.height * 0.58;
    this.boxSize = Math.min(canvas.width * 0.45, 200);

    // Animation Timings & States
    this.state = 'shaking'; // 'shaking' -> 'bursting' -> 'opened'
    this.shakeTime = 0;
    this.lidOffsetY = 0;
    this.lidBounceVelocity = 0;
    this.crystalFloatPhase = 0;

    // Butterflies & Floating Petals inside box
    this.butterflies = [];
    this.initButterflies();

    // Event Bindings
    this.boundClick = this.handleClick.bind(this);
    this.canvas.addEventListener('click', this.boundClick);

    this.startSequence();
  }

  resize(width, height) {
    this.boxX = width / 2;
    this.boxY = height * 0.58;
    this.boxSize = Math.min(width * 0.45, 200);
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
        color: ['#ff85ad', '#ffd700', '#ffb7c5'][Math.floor(Math.random() * 3)]
      });
    }
  }

  startSequence() {
    // 2-second gentle shake animation sequence
    const shakeInterval = setInterval(() => {
      this.shakeTime += 0.05;
      if (this.shakeTime >= 2.0) {
        clearInterval(shakeInterval);
        this.openGiftBox();
      }
    }, 50);
  }

  handleClick(e) {
    if (this.state === 'shaking') {
      this.openGiftBox();
    }
  }

  openGiftBox() {
    if (this.state === 'opened') return;
    this.state = 'opened';

    // Trigger Golden Particle Burst & Sound FX
    this.particles.triggerGiftBurst(this.boxX, this.boxY - 40);
    audioManager.playBoxPop();

    // Open Love Letter Modal after lid pop
    setTimeout(() => {
      const modal = document.getElementById('loveLetterModal');
      if (modal) {
        modal.classList.add('open');
      }
    }, 800);

    // Setup "Proceed to Tree" button handler inside modal
    const proceedBtn = document.getElementById('proceedToTreeBtn');
    const closeBtn = document.getElementById('closeLetterBtn');

    if (proceedBtn) {
      proceedBtn.onclick = () => {
        const modal = document.getElementById('loveLetterModal');
        if (modal) modal.classList.remove('open');
        if (this.onComplete) this.onComplete();
      };
    }

    if (closeBtn) {
      closeBtn.onclick = () => {
        const modal = document.getElementById('loveLetterModal');
        if (modal) modal.classList.remove('open');
        if (this.onComplete) this.onComplete();
      };
    }
  }

  updateAndRender() {
    const ctx = this.ctx;
    this.crystalFloatPhase += 0.03;

    // 1. Render Dark Moody Room Dimming Overlay
    ctx.save();
    const darkGrad = ctx.createRadialGradient(
      this.boxX, this.boxY, 100,
      this.boxX, this.boxY, Math.max(this.canvas.width, this.canvas.height) * 0.8
    );
    darkGrad.addColorStop(0, 'rgba(35, 18, 25, 0.4)');
    darkGrad.addColorStop(1, 'rgba(15, 8, 12, 0.85)');
    ctx.fillStyle = darkGrad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();

    // 2. Render Floating Crystal & Butterflies if Opened
    if (this.state === 'opened') {
      this.drawGlowingCrystal(ctx);
      this.updateAndRenderButterflies(ctx);
    }

    // 3. Render Luxury Pink Gift Box & Lid
    this.drawGiftBox(ctx);

    // 4. Render Golden Burst Particles
    this.particles.updateAndRenderGiftBurst();
  }

  drawGiftBox(ctx) {
    ctx.save();
    ctx.translate(this.boxX, this.boxY);

    // Apply shake offset during 'shaking' state
    if (this.state === 'shaking') {
      const shakeX = Math.sin(this.shakeTime * 30) * 4;
      ctx.translate(shakeX, 0);
    }

    const s = this.boxSize;

    // Box Body (Luxury Pink Satin Gradient)
    const boxGrad = ctx.createLinearGradient(-s / 2, 0, s / 2, 0);
    boxGrad.addColorStop(0, '#ff5e8e');
    boxGrad.addColorStop(0.5, '#ff85ad');
    boxGrad.addColorStop(1, '#e0386b');

    ctx.fillStyle = boxGrad;
    ctx.shadowBlur = 30;
    ctx.shadowColor = 'rgba(255, 94, 142, 0.5)';

    // Rounded Box Base
    ctx.beginPath();
    ctx.roundRect(-s / 2, -s * 0.4, s, s * 0.8, 16);
    ctx.fill();

    // Vertical Golden Metallic Ribbon
    const goldGrad = ctx.createLinearGradient(-15, 0, 15, 0);
    goldGrad.addColorStop(0, '#ffd700');
    goldGrad.addColorStop(0.5, '#fff0aa');
    goldGrad.addColorStop(1, '#cca100');

    ctx.fillStyle = goldGrad;
    ctx.fillRect(-18, -s * 0.4, 36, s * 0.8);

    // Box Lid (with Spring Bounce Pop Animation)
    if (this.state === 'opened') {
      this.lidOffsetY += ( -140 - this.lidOffsetY ) * 0.12; // Easing upward pop
    }

    ctx.save();
    ctx.translate(0, -s * 0.4 + this.lidOffsetY);

    // Lid Shadow & Body
    ctx.fillStyle = boxGrad;
    ctx.beginPath();
    ctx.roundRect(-s * 0.55, -28, s * 1.1, 32, 8);
    ctx.fill();

    // Lid Ribbon Cross
    ctx.fillStyle = goldGrad;
    ctx.fillRect(-18, -28, 36, 32);

    // Top Satin Golden Bow Knot
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
    const cy = this.boxY - 180 + floatY;

    ctx.save();
    ctx.translate(cx, cy);

    // Radiant Crystal Light Rays
    const aura = ctx.createRadialGradient(0, 0, 5, 0, 0, 60);
    aura.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
    aura.addColorStop(0.6, 'rgba(255, 133, 173, 0.4)');
    aura.addColorStop(1, 'rgba(255, 133, 173, 0)');

    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.fill();

    // Faceted Heart Crystal Core
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ffd700';

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
    for (let b of this.butterflies) {
      b.x += b.vx;
      b.y += b.vy;
      b.wingAngle += b.wingSpeed;

      // Flutter boundary check
      if (b.y < 50 || Math.abs(b.x - this.boxX) > 200) {
        b.vy = -b.vy * 0.5;
        b.vx = -b.vx;
      }

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.fillStyle = b.color;
      ctx.globalAlpha = 0.85;

      const wingScale = Math.sin(b.wingAngle);

      // Left & Right Butterfly Wings
      ctx.beginPath();
      ctx.ellipse(-8 * wingScale, 0, 10 * Math.abs(wingScale), 14, Math.PI / 4, 0, Math.PI * 2);
      ctx.ellipse(8 * wingScale, 0, 10 * Math.abs(wingScale), 14, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  destroy() {
    this.canvas.removeEventListener('click', this.boundClick);
  }
}
