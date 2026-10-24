/**
 * Flame Test — Procedural Web Audio Sound Engine
 * Synthesizes gas flow hiss, burner roaring flame combustion,
 * loop vaporization sizzle, glass dish taps, and quest completion chimes.
 */

class FlameSoundEngine {
  constructor(state) {
    this.state = state;
    this.ctx = null;
    this.masterGain = null;
    this.gasGain = null;
    this.gasNoiseNode = null;
    this.roarFilter = null;
    this.isRoaring = false;
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

  createNoiseBuffer(seconds = 2.0) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  startBurnerSound(gasValve, airCollar) {
    if (!this.state.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    if (!this.gasNoiseNode) {
      const buffer = this.createNoiseBuffer(3.0);
      this.gasNoiseNode = this.ctx.createBufferSource();
      this.gasNoiseNode.buffer = buffer;
      this.gasNoiseNode.loop = true;

      this.roarFilter = this.ctx.createBiquadFilter();
      this.roarFilter.type = 'bandpass';
      this.roarFilter.frequency.setValueAtTime(260 + airCollar * 480, this.ctx.currentTime);
      this.roarFilter.Q.setValueAtTime(1.4, this.ctx.currentTime);

      this.gasGain = this.ctx.createGain();
      const targetGain = Math.max(0.001, (gasValve / 100) * 0.22);
      this.gasGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);

      this.gasNoiseNode.connect(this.roarFilter);
      this.roarFilter.connect(this.gasGain);
      this.gasGain.connect(this.masterGain);

      this.gasNoiseNode.start(0);
      this.isRoaring = true;
    } else {
      this.updateBurnerSound(gasValve, airCollar);
    }
  }

  updateBurnerSound(gasValve, airCollar) {
    if (!this.ctx || !this.gasGain || !this.roarFilter) return;
    const now = this.ctx.currentTime;
    const targetGain = (gasValve / 100) * (0.12 + airCollar * 0.18);
    this.gasGain.gain.setTargetAtTime(targetGain, now, 0.08);

    // Roaring frequency shifts up as air collar opens
    const centerFreq = 220 + airCollar * 550;
    this.roarFilter.frequency.setTargetAtTime(centerFreq, now, 0.1);
  }

  stopBurnerSound() {
    if (this.gasGain && this.ctx) {
      this.gasGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.08);
      setTimeout(() => {
        if (this.gasNoiseNode) {
          try { this.gasNoiseNode.stop(); } catch(e){}
          this.gasNoiseNode.disconnect();
          this.gasNoiseNode = null;
        }
        this.isRoaring = false;
      }, 100);
    }
  }

  playIgnitionWhoosh() {
    if (!this.state.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.28);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  playLoopSizzle() {
    if (!this.state.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    // High frequency micro-crackle when salt vaporizes
    const buffer = this.createNoiseBuffer(0.35);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2400, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(now);
    source.stop(now + 0.38);
  }

  playGlassDishTap() {
    if (!this.state.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1240, now);
    osc.frequency.exponentialRampToValueAtTime(820, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  playQuestChime() {
    if (!this.state.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
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

window.FlameSoundEngine = FlameSoundEngine;
