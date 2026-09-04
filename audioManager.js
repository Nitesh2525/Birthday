// High-Quality Web Audio API Synthesizer & Sound FX Manager

class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isPlayingMusic = false;
    this.masterGain = null;
    this.bgMusicGain = null;
    this.sfxGain = null;
    this.musicTimer = null;
    this.currentNoteIndex = 0;

    // Romantic ambient melody note frequencies (in Hz)
    // C Major / A Minor gentle lullaby sequence
    this.melodyNotes = [
      261.63, 329.63, 392.00, 523.25, // C E G C
      220.00, 261.63, 329.63, 440.00, // A C E A
      174.61, 220.00, 261.63, 349.23, // F A C F
      196.00, 246.94, 293.66, 392.00  // G B D G
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
    if (this.ctx && this.ctx.state === 'suspended') {
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

    // Create soft sine oscillator for ambient melody
    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Envelope: soft attack and long gentle decay
    const now = this.ctx.currentTime;
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.08, now + 0.4);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

    osc.connect(noteGain);
    noteGain.connect(this.bgMusicGain);

    osc.start(now);
    osc.stop(now + 2.8);

    // Schedule next note with gentle rhythm
    const delay = (this.currentNoteIndex % 4 === 0) ? 1400 : 700;
    this.musicTimer = setTimeout(() => {
      this.playNextMelodyNote();
    }, delay);
  }

  // Audio Ducking effect during candle blow
  duckMusic(durationMs = 1500) {
    if (!this.ctx || !this.bgMusicGain) return;
    const now = this.ctx.currentTime;
    const currentVol = this.bgMusicGain.gain.value;

    // Smoothly lower music volume to 25%
    this.bgMusicGain.gain.cancelScheduledValues(now);
    this.bgMusicGain.gain.linearRampToValueAtTime(0.03, now + 0.2);

    // Restore music volume after blow finishes
    this.bgMusicGain.gain.linearRampToValueAtTime(0.12, now + (durationMs / 1000));
  }

  // SOUND EFFECTS SYNTHESIZERS

  // Bow string tension pull sound
  playBowPull(tensionRatio = 0.5) {
    this.resumeContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
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

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Target Heart hit chime sparkle
  playHeartHit() {
    this.resumeContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

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

    // Filtered noise for puff of wind/smoke
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

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

    // Low pop thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);

    // High golden sparkle
    const sparkleNotes = [880, 1174.66, 1396.91, 1760];
    sparkleNotes.forEach((freq, idx) => {
      const sOsc = this.ctx.createOscillator();
      const sGain = this.ctx.createGain();
      const stime = now + 0.05 + idx * 0.05;

      sOsc.type = 'triangle';
      sOsc.frequency.setValueAtTime(freq, stime);

      sGain.gain.setValueAtTime(0, stime);
      sGain.gain.linearRampToValueAtTime(0.08, stime + 0.02);
      sGain.gain.exponentialRampToValueAtTime(0.001, stime + 0.6);

      sOsc.connect(sGain);
      sGain.connect(this.sfxGain);

      sOsc.start(stime);
      sOsc.stop(stime + 0.6);
    });
  }
}

export const audioManager = new AudioManager();
