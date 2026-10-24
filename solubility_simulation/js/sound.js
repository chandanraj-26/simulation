/**
 * Solubility & Crystallization — Procedural Web Audio Sound Engine
 * Synthesizes spatula clinks, liquid stirring vortex whirs,
 * Bunsen burner flame roar, crystal nucleation pings, and quest fanfares.
 */

class SolubilitySoundEngine {
  constructor(state) {
    this.state = state;
    this.ctx = null;
    this.masterGain = null;
    this.flameGain = null;
    this.flameSource = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported in this browser.', e);
    }
  }

  resume() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  createNoiseBuffer(seconds = 1.0) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  playSpatulaClink() {
    if (!this.state.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1450, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  playStirringWhir() {
    if (!this.state.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.linearRampToValueAtTime(280, now + 0.15);
    osc.frequency.linearRampToValueAtTime(220, now + 0.3);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  startFlameRoar(intensity = 0.5) {
    if (!this.state.soundEnabled) return;
    this.resume();
    if (!this.ctx || this.flameSource) return;

    const buffer = this.createNoiseBuffer(2.0);
    this.flameSource = this.ctx.createBufferSource();
    this.flameSource.buffer = buffer;
    this.flameSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    this.flameGain = this.ctx.createGain();
    this.flameGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.flameGain.gain.linearRampToValueAtTime(0.15 * intensity, this.ctx.currentTime + 0.15);

    this.flameSource.connect(filter);
    filter.connect(this.flameGain);
    this.flameGain.connect(this.masterGain);

    this.flameSource.start(0);
  }

  stopFlameRoar() {
    if (this.flameGain && this.ctx) {
      this.flameGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.06);
      setTimeout(() => {
        if (this.flameSource) {
          try { this.flameSource.stop(); } catch(e){}
          this.flameSource.disconnect();
          this.flameSource = null;
        }
      }, 80);
    }
  }

  playNucleationPing() {
    if (!this.state.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, now); // High A6
    osc.frequency.exponentialRampToValueAtTime(2640, now + 0.08);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  playQuestChime() {
    if (!this.state.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const startTime = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.35, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.48);
    });
  }
}

window.SolubilitySoundEngine = SolubilitySoundEngine;
