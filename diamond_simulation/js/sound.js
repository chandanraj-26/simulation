/**
 * DiamondCutSim — Web Audio API Soundscape & Crystal Synthesizer
 * Provides sparkling acoustic feedback, crystal refraction chimes,
 * TIR bounce pings, laser swept-sine feedback, and quest fanfare.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.lastSparkleTime = 0;
    this.lastBounceTime = 0;
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  toggle(enable) {
    this.enabled = enable !== undefined ? enable : !this.enabled;
    return this.enabled;
  }

  /**
   * Sparkling crystal chime when rays emerge through crown facets (brilliance/fire)
   */
  playSparkleChime(intensity = 0.5) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (now - this.lastSparkleTime < 0.15) return; // rate limit
    this.lastSparkleTime = now;

    try {
      // Bell-like high frequency harmonics
      const freqs = [1760, 2637, 3520, 4400]; // A6, E7, A7, C#8
      freqs.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * (1 + (Math.random() - 0.5) * 0.05), now + i * 0.04);

        const vol = 0.04 * intensity / (i + 1);
        gain.gain.setValueAtTime(0.0001, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(vol, now + i * 0.04 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.4);
      });
    } catch (e) {
      console.warn('Sparkle chime error:', e);
    }
  }

  /**
   * Subtle glass tick when light undergoes Total Internal Reflection at a facet
   */
  playBouncePing(bounceCount = 1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (now - this.lastBounceTime < 0.08) return;
    this.lastBounceTime = now;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      // Pitch rises slightly with number of internal bounces
      const pitch = 880 + Math.min(6, bounceCount) * 110;
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.6, now + 0.06);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn('Bounce ping error:', e);
    }
  }

  /**
   * Laser tuning tone when adjusting laser wavelength
   */
  playLaserTone(wavelengthNm = 589) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Map 380nm (violet) to high pitch (1200Hz), 750nm (red) to lower pitch (400Hz)
      const norm = (750 - wavelengthNm) / (750 - 380);
      const freq = 400 + norm * 800;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn('Laser tone error:', e);
    }
  }

  /**
   * Subtle UI click sound for buttons and presets
   */
  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      console.warn('Click sound error:', e);
    }
  }

  /**
   * Crystal quest completion fanfare (sparkling major chord arpeggio)
   */
  playSuccessFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.5);
      });
    } catch (e) {
      console.warn('Success fanfare error:', e);
    }
  }
}

window.soundEngine = new SoundEngine();
