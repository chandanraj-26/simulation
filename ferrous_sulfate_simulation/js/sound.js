/**
 * Thermal Decomposition of Ferrous Sulfate — Procedural Web Audio Engine
 * Zero external audio files; synthesizes flame hissing, crystal dehydration crackle,
 * steam condensation, wafting whoosh, and quest complete fanfare.
 */

class ReactionSound {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.flameNoiseNode = null;
    this.flameGainNode = null;
    this.flameFilterNode = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch (e) {
      console.warn('Web Audio API not supported on this platform.');
    }
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.flameGainNode) {
      this.flameGainNode.gain.setValueAtTime(0, this.ctx ? this.ctx.currentTime : 0);
    }
    return this.enabled;
  }

  playClick() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  updateFlameSound(flameLevel) {
    if (!this.enabled) {
      if (this.flameGainNode) this.flameGainNode.gain.setValueAtTime(0, this.ctx ? this.ctx.currentTime : 0);
      return;
    }
    this.ensureContext();
    if (!this.ctx) return;

    if (flameLevel <= 0) {
      if (this.flameGainNode) {
        this.flameGainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      }
      return;
    }

    if (!this.flameNoiseNode) {
      // Create white noise buffer
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.flameNoiseNode = this.ctx.createBufferSource();
      this.flameNoiseNode.buffer = noiseBuffer;
      this.flameNoiseNode.loop = true;

      this.flameFilterNode = this.ctx.createBiquadFilter();
      this.flameFilterNode.type = 'lowpass';
      this.flameFilterNode.frequency.setValueAtTime(600, this.ctx.currentTime);

      this.flameGainNode = this.ctx.createGain();
      this.flameGainNode.gain.setValueAtTime(0, this.ctx.currentTime);

      this.flameNoiseNode.connect(this.flameFilterNode);
      this.flameFilterNode.connect(this.flameGainNode);
      this.flameGainNode.connect(this.ctx.destination);

      this.flameNoiseNode.start(0);
    }

    // Adjust cutoff and volume based on flame intensity (1 = mild, 2 = strong)
    const targetGain = flameLevel === 1 ? 0.04 : 0.09;
    const targetFreq = flameLevel === 1 ? 500 : 950;
    this.flameGainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    this.flameFilterNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
  }

  playCrackle() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400 + Math.random() * 800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  playWaftWhoosh() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  playTestReaction() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    // Harmonic chime indicating chemical color change
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.08, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.3);
    });
  }

  playQuestComplete() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const startTime = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + i * 0.09);

      gain.gain.setValueAtTime(0.09, startTime + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + i * 0.09 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime + i * 0.09);
      osc.stop(startTime + i * 0.09 + 0.25);
    });
  }
}

window.ReactionSound = ReactionSound;
