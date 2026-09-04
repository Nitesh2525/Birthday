// Real-Time Microphone Blow Detection using Web Audio API

class BlowDetector {
  constructor() {
    this.mediaStream = null;
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.isListening = false;
    this.onBlowCallback = null;
    this.onPermissionDeniedCallback = null;
    this.lastBlowTime = 0;
    this.blowCooldownMs = 800; // Prevent duplicate triggers per blow
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
          noiseSuppression: false, // Keep wind blowing noise detectable!
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

    // Wind blowing into microphone creates high energy in low frequencies (100Hz - 500Hz)
    // Bin index calculation: sampleRate / fftSize = bin size (e.g. 44100 / 256 = 172Hz per bin)
    let lowFreqSum = 0;
    let highFreqSum = 0;

    // Bins 1 to 4: Low frequency noise (wind blow range ~100Hz - 600Hz)
    for (let i = 1; i <= 4; i++) {
      lowFreqSum += this.dataArray[i];
    }
    const lowFreqAvg = lowFreqSum / 4;

    // Bins 8 to 20: Higher frequency range (voices, whistles)
    for (let i = 8; i <= 20; i++) {
      highFreqSum += this.dataArray[i];
    }
    const highFreqAvg = highFreqSum / 13;

    const now = Date.now();

    // Blow detection threshold logic:
    // Low frequency average must be high (> 120), and higher than voice high-freq average to avoid speech false positives
    if (lowFreqAvg > 125 && (lowFreqAvg - highFreqAvg) > 25) {
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
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const blowDetector = new BlowDetector();
