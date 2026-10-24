/**
 * Reaction Kinetics — Procedural Web Audio Sound Engine
 * Synthesizes liquid reagent pouring, magnetic stirrer whirl,
 * stopwatch start/stop beeps, optical extinction alerts, and quest chimes.
 */

class KineticsSoundEngine {
  constructor(state) {
    this.state = state;
    this.ctx = null;
    this.masterGain = null;
    this.stirrerGain = null;
    this.stirrerSource = null;
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

  createNoiseBuffer(seconds = 1.5) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  playPourSound() {
    if (!this.state.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    // Resonant filtered noise burst resembling liquid stream
    const buffer = this.createNoiseBuffer(0.45);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.4);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(now);
    source.stop(now + 0.48);
  }

  startStirrerHum() {
    if (!this.state.soundEnabled) return;
    this.resume();
    if (!this.ctx || this.stirrerSource) return;

    // Gentle low-frequency liquid vortex swirl
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, this.ctx.currentTime);

    this.stirrerGain = this.ctx.createGain();
    this.stirrerGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.stirrerGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.1);

    osc.connect(filter);
    filter.connect(this.stirrerGain);
    this.stirrerGain.connect(this.masterGain);

    osc.start(0);
    this.stirrerSource = osc;
  }

  stopStirrerHum() {
    if (this.stirrerSource && this.stirrerGain && this.ctx) {
      this.stirrerGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
      setTimeout(() => {
        if (this.stirrerSource) {
          try { this.stirrerSource.stop(); } catch(e){}
          this.stirrerSource.disconnect();
          this.stirrerSource = null;
        }
      }, 80);
    }
  }

  playStopwatchBeep() {
    if (!this.state.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  playExtinctionBell() {
    if (!this.state.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    // Dual chime when cross disappears
    const now = this.ctx.currentTime;
    [880, 1320].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.001, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.06 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.42);
    });
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

window.KineticsSoundEngine = KineticsSoundEngine;
