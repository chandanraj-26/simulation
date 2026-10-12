/**
 * AcidBaseLab — Web Audio API Synthesizer
 * Pure client-side zero-dependency audio engine for realistic laboratory sound effects.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.stirrerOsc = null;
    this.stirrerGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle(enable) {
    this.enabled = enable !== undefined ? enable : !this.enabled;
    if (!this.enabled && this.stirrerOsc) {
      this.stopStirrerSound();
    }
    return this.enabled;
  }

  // Droplet falling & hitting fluid surface ("plink")
  playDropSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Frequency sweeps down slightly then up for a water droplet acoustic profile
    osc.frequency.setValueAtTime(600 + Math.random() * 200, t);
    osc.frequency.exponentialRampToValueAtTime(1400 + Math.random() * 300, t + 0.08);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  // Glassware clink / probe dip
  playClinkSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(2400, t);
    osc1.frequency.exponentialRampToValueAtTime(1800, t + 0.12);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(3200, t);
    osc2.frequency.exponentialRampToValueAtTime(2800, t + 0.12);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.15);
    osc2.stop(t + 0.15);
  }

  // Dropper squeeze / suction squirt
  playSuctionSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // White noise burst filtered
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(1800, t + 0.1);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.1);
  }

  // Mechanical switch / stopcock click
  playSwitchSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.04);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Continuous magnetic stirrer hum & vortex swirl
  updateStirrerSound(speedPercent) {
    if (!this.enabled || speedPercent <= 0) {
      this.stopStirrerSound();
      return;
    }
    this.init();
    if (!this.ctx) return;

    if (!this.stirrerOsc) {
      const t = this.ctx.currentTime;
      this.stirrerOsc = this.ctx.createOscillator();
      this.stirrerGain = this.ctx.createGain();

      this.stirrerOsc.type = 'sine';
      this.stirrerGain.gain.setValueAtTime(0.001, t);

      this.stirrerOsc.connect(this.stirrerGain);
      this.stirrerGain.connect(this.ctx.destination);
      this.stirrerOsc.start();
    }

    const t = this.ctx.currentTime;
    const freq = 60 + (speedPercent / 100) * 120;
    const volume = 0.01 + (speedPercent / 100) * 0.04;

    this.stirrerOsc.frequency.setTargetAtTime(freq, t, 0.1);
    this.stirrerGain.gain.setTargetAtTime(volume, t, 0.1);
  }

  stopStirrerSound() {
    if (this.stirrerOsc) {
      try {
        const t = this.ctx.currentTime;
        this.stirrerGain.gain.setTargetAtTime(0.0001, t, 0.05);
        setTimeout(() => {
          if (this.stirrerOsc) {
            this.stirrerOsc.stop();
            this.stirrerOsc.disconnect();
            this.stirrerGain.disconnect();
            this.stirrerOsc = null;
            this.stirrerGain = null;
          }
        }, 100);
      } catch (e) {
        this.stirrerOsc = null;
        this.stirrerGain = null;
      }
    }
  }

  // Chemical neutralization / endpoint reaction chime
  playEndpointChime() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.12, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.45);
    });
  }

  // Celebratory fanfare for completing quests
  playSuccessFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chord = [
      { f: 523.25, delay: 0.00, dur: 0.18 }, // C5
      { f: 659.25, delay: 0.12, dur: 0.18 }, // E5
      { f: 783.99, delay: 0.24, dur: 0.18 }, // G5
      { f: 1046.50, delay: 0.36, dur: 0.55 }, // C6
      { f: 1318.51, delay: 0.42, dur: 0.55 }  // E6
    ];

    chord.forEach(item => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, t + item.delay);

      gain.gain.setValueAtTime(0.15, t + item.delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + item.delay + item.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + item.delay);
      osc.stop(t + item.delay + item.dur);
    });
  }
}

window.soundEngine = new SoundEngine();
