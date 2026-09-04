// Scene 2: Birthday Cake & 5 Glowing Candles with Microphone Blow Detection

import { blowDetector } from '../audio/blowDetector.js';
import { audioManager } from '../audio/audioManager.js';

export class Scene2Candles {
  constructor(canvas, particleSystem, onComplete) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = particleSystem;
    this.onComplete = onComplete;

    // Cake & Candle Coordinates
    this.cakeX = canvas.width / 2;
    this.cakeY = canvas.height * 0.62;
    this.cakeWidth = Math.min(canvas.width * 0.6, 340);

    // 5 Glowing Candles State
    this.candles = [];
    this.candlesLitCount = 5;
    this.flameFlickerPhase = 0;
    this.isCompleted = false;

    this.initCandles();
    this.setupMicrophone();
    this.setupFallbackUI();
  }

  resize(width, height) {
    this.cakeX = width / 2;
    this.cakeY = height * 0.62;
    this.cakeWidth = Math.min(width * 0.6, 340);
    this.repositionCandles();
  }

  initCandles() {
    this.candles = [];
    const candleSpacing = this.cakeWidth / 6;
    const startX = this.cakeX - this.cakeWidth / 2 + candleSpacing;

    for (let i = 0; i < 5; i++) {
      this.candles.push({
        id: i,
        x: startX + i * candleSpacing,
        y: this.cakeY - 95,
        height: 60,
        width: 14,
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
      this.candles[i].x = startX + i * candleSpacing;
      this.candles[i].y = this.cakeY - 95;
    }
  }

  setupMicrophone() {
    const statusText = document.getElementById('micStatusText');
    const hintText = document.getElementById('micHintText');

    blowDetector.startListening(
      () => {
        // Microphone blow event callback!
        this.extinguishOneCandle();
      },
      (err) => {
        // Permission denied or mic unsupported callback
        if (statusText) statusText.innerText = "Mic Denied";
        if (hintText) hintText.innerText = "Use the 'Tap to Blow' button below 🌬️";
      }
    );
  }

  setupFallbackUI() {
    const fallbackBtn = document.getElementById('blowFallbackBtn');
    if (fallbackBtn) {
      fallbackBtn.onclick = () => {
        audioManager.resumeContext();
        this.extinguishOneCandle();
      };
    }
  }

  extinguishOneCandle() {
    if (this.candlesLitCount <= 0 || this.isCompleted) return;

    // Find the rightmost lit candle
    for (let i = this.candles.length - 1; i >= 0; i--) {
      if (this.candles[i].isLit) {
        this.candles[i].isLit = false;
        this.candlesLitCount--;

        // Trigger Smoke Particles & Extinguish Sound
        this.particles.addSmokeParticle(this.candles[i].x, this.candles[i].y - this.candles[i].height);
        audioManager.playCandleExtinguish();
        audioManager.duckMusic(1500);

        // Update UI Counter Badge
        const counterEl = document.getElementById('candleCountText');
        if (counterEl) {
          counterEl.innerText = `${this.candlesLitCount} / 5 Candles Glowing`;
        }

        break;
      }
    }

    // All Candles Extinguished!
    if (this.candlesLitCount === 0 && !this.isCompleted) {
      this.isCompleted = true;
      blowDetector.stopListening();

      const counterEl = document.getElementById('candleCountText');
      if (counterEl) {
        counterEl.innerText = `✨ Wish Granted! ✨`;
      }

      // Delay transition to Scene 3
      setTimeout(() => {
        if (this.onComplete) this.onComplete();
      }, 1500);
    }
  }

  updateAndRender() {
    const ctx = this.ctx;
    this.flameFlickerPhase += 0.1;

    // 1. Draw Birthday Cake
    this.drawCake(ctx);

    // 2. Draw 5 Candles & Flames
    for (let candle of this.candles) {
      this.drawCandle(ctx, candle);
    }

    // 3. Render Smoke Particles
    this.particles.updateAndRenderSmoke();
  }

  drawCake(ctx) {
    ctx.save();
    ctx.translate(this.cakeX, this.cakeY);

    const w = this.cakeWidth;

    // Cake Bottom Tier (Pastel Pink Frosting with Pearl Accents)
    const baseGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    baseGrad.addColorStop(0, '#ffb7c5');
    baseGrad.addColorStop(0.5, '#ffd1dc');
    baseGrad.addColorStop(1, '#ffb7c5');

    ctx.fillStyle = baseGrad;
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(255, 94, 142, 0.3)';

    // Rounded Cake Base
    ctx.beginPath();
    ctx.roundRect(-w / 2, 0, w, 75, [0, 0, 16, 16]);
    ctx.fill();

    // Cake Top Layer Frosting Drips
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0);
    for (let x = -w / 2; x <= w / 2; x += w / 10) {
      ctx.quadraticCurveTo(x + w / 20, 18, x + w / 10, 0);
    }
    ctx.lineTo(w / 2, 20);
    ctx.lineTo(-w / 2, 20);
    ctx.closePath();
    ctx.fill();

    // Decorative Strawberries / Cherries on Cake Edge
    ctx.fillStyle = '#e0386b';
    for (let i = 0; i <= 6; i++) {
      const cx = -w / 2 + (i * w) / 6;
      ctx.beginPath();
      ctx.arc(cx, -4, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawCandle(ctx, candle) {
    ctx.save();
    ctx.translate(candle.x, candle.y);

    // Candle Wax Body (Pastel Stripes)
    const waxGrad = ctx.createLinearGradient(-candle.width / 2, 0, candle.width / 2, 0);
    waxGrad.addColorStop(0, '#ffe5ec');
    waxGrad.addColorStop(0.5, '#ffffff');
    waxGrad.addColorStop(1, '#ffb7c5');

    ctx.fillStyle = waxGrad;
    ctx.beginPath();
    ctx.roundRect(-candle.width / 2, -candle.height, candle.width, candle.height, [4, 4, 0, 0]);
    ctx.fill();

    // Candle Wick
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -candle.height);
    ctx.lineTo(0, -candle.height - 10);
    ctx.stroke();

    // Candle Flame (if lit)
    if (candle.isLit) {
      const flicker = Math.sin(this.flameFlickerPhase + candle.flickerOffset) * 2;
      const flameHeight = 26 + flicker;
      const flameY = -candle.height - 12;

      // Outer Flame Glow Aura
      const glow = ctx.createRadialGradient(0, flameY - flameHeight / 2, 2, 0, flameY - flameHeight / 2, 40);
      glow.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
      glow.addColorStop(0.5, 'rgba(255, 133, 0, 0.3)');
      glow.addColorStop(1, 'rgba(255, 133, 0, 0)');

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, flameY - flameHeight / 2, 40, 0, Math.PI * 2);
      ctx.fill();

      // Outer Tear-Drop Flame (Gold / Orange)
      ctx.fillStyle = '#ff9900';
      ctx.beginPath();
      ctx.moveTo(0, flameY);
      ctx.bezierCurveTo(-10, flameY - 8, -8, flameY - flameHeight, 0, flameY - flameHeight - 6);
      ctx.bezierCurveTo(8, flameY - flameHeight, 10, flameY - 8, 0, flameY);
      ctx.fill();

      // Inner Core Flame (Bright Yellow / White)
      ctx.fillStyle = '#ffffcc';
      ctx.beginPath();
      ctx.moveTo(0, flameY);
      ctx.bezierCurveTo(-5, flameY - 5, -4, flameY - flameHeight + 8, 0, flameY - flameHeight + 2);
      ctx.bezierCurveTo(4, flameY - flameHeight + 8, 5, flameY - 5, 0, flameY);
      ctx.fill();
    }

    ctx.restore();
  }

  destroy() {
    blowDetector.stopListening();
  }
}
