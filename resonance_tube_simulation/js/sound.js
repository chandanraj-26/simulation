/**
 * SoundEngine - Pure Web Audio API Acoustic Synthesizer for Resonance Tube
 * Dynamically synthesizes the pure tuning fork vibration and booming acoustic resonance.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;

    this.forkOsc = null;
    this.forkGain = null;
    this.resGain = null;
    this.activeFreq = 512;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.forkGain) {
      this.forkGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return this.enabled;
  }

  // Strike the tuning fork with rubber mallet
  strikeFork(freq) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    this.activeFreq = freq;
    const now = this.ctx.currentTime;

    // Stop previous if active
    if (this.forkOsc) {
      try {
        this.forkOsc.stop(now);
      } catch (e) {}
    }

    // Pure Sine Wave for Tuning Fork
    this.forkOsc = this.ctx.createOscillator();
    this.forkGain = this.ctx.createGain();
    this.resGain = this.ctx.createGain();

    this.forkOsc.type = 'sine';
    this.forkOsc.frequency.setValueAtTime(freq, now);

    // Initial sharp mallet strike impulse
    this.forkGain.gain.setValueAtTime(0.25, now);
    // Sustained ringing decay over 8 seconds
    this.forkGain.gain.exponentialRampToValueAtTime(0.005, now + 8.0);

    // Acoustic Resonance multiplier
    this.resGain.gain.setValueAtTime(1.0, now);

    this.forkOsc.connect(this.forkGain);
    this.forkGain.connect(this.resGain);
    this.resGain.connect(this.ctx.destination);

    this.forkOsc.start(now);
    this.forkOsc.stop(now + 8.2);
  }

  // Update acoustic resonance amplification factor based on air column length
  setResonanceFactor(factor) {
    if (!this.enabled || !this.resGain || !this.ctx) return;
    // factor ranges from 1.0 (off-resonance) to 5.0 (perfect acoustic peak)
    const targetGain = 1.0 + factor * 4.0;
    this.resGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.015);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.025);
  }

  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  }

  playError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.16);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }
}

export const sound = new SoundEngine();
