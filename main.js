// Main Application Controller & Scene Orchestrator

import { ParticleSystem } from './utils/particles.js';
import { audioManager } from './audio/audioManager.js';
import { Scene1Welcome } from './components/scene1_welcome.js';
import { Scene2Candles } from './components/scene2_candles.js';
import { Scene3Gift } from './components/scene3_gift.js';
import { Scene4HeartTree } from './components/scene4_heartTree.js';

class App {
  constructor() {
    this.canvas = document.getElementById('mainCanvas');
    this.ctx = this.canvas.getContext('2d');
    
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

    window.addEventListener('resize', () => this.handleResize());
  }

  initCanvasSize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  handleResize() {
    this.initCanvasSize();
    if (this.particleSystem) {
      this.particleSystem.initPetals(35);
      this.particleSystem.initSparkles(45);
    }
    if (this.currentSceneInstance && this.currentSceneInstance.resize) {
      this.currentSceneInstance.resize(this.canvas.width, this.canvas.height);
    }
  }

  initParticleSystem() {
    this.particleSystem = new ParticleSystem(this.canvas);
    this.particleSystem.initPetals(35);
    this.particleSystem.initSparkles(45);
  }

  setupGlobalControls() {
    // Music Toggle Button
    const musicBtn = document.getElementById('musicToggleBtn');
    const musicStatusText = document.getElementById('musicStatusText');
    if (musicBtn) {
      musicBtn.onclick = () => {
        const isPlaying = audioManager.toggleMusic();
        if (musicStatusText) {
          musicStatusText.innerText = isPlaying ? 'Music On' : 'Muted';
        }
      };
    }

    // Restart Button
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
      restartBtn.onclick = () => {
        this.resetExperience();
      };
    }

    // Replay All Button in Scene 4
    const replayAllBtn = document.getElementById('replayAllBtn');
    if (replayAllBtn) {
      replayAllBtn.onclick = () => {
        this.resetExperience();
      };
    }
  }

  resetExperience() {
    // Reset typography classes
    ['typographyLine1', 'typographyLine2', 'typographyLine3'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('show');
    });

    // Reset love letter modal
    const modal = document.getElementById('loveLetterModal');
    if (modal) modal.classList.remove('open');

    // Reload Scene 1
    this.loadScene(1);
  }

  loadScene(sceneNumber) {
    // Cleanup previous scene instance
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
          overlay.classList.add('active');
        } else {
          overlay.classList.remove('active');
        }
      }
    }
  }

  loop() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render background particle layer (petals & sparkles)
    if (this.currentSceneIndex === 1 || this.currentSceneIndex === 2) {
      this.particleSystem.updateAndRenderBackground();
    }

    // Render current active scene graphics & physics
    if (this.currentSceneInstance && this.currentSceneInstance.updateAndRender) {
      this.currentSceneInstance.updateAndRender();
    }

    requestAnimationFrame(this.runLoop);
  }
}

// Initialize App when DOM ready
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
