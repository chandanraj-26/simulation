/**
 * DopplerLab — Web Audio API Synthesizer & Acoustic Soundscape
 * Real-time continuous Doppler pitch synthesis, emergency siren mode,
 * sonic boom shockwave rumble, and laboratory auditory cues.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.oscillator = null;
    this.gainNode = null;
    this.pannerNode = null;
    this.isPlayingDoppler = false;
    this.lastBoomTime = 0;
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
      this.ensureContinuousSynth();
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  ensureContinuousSynth() {
    if (!this.ctx || this.oscillator) return;

    try {
      this.oscillator = this.ctx.createOscillator();
      this.gainNode = this.ctx.createGain();

      if (this.ctx.createStereoPanner) {
        this.pannerNode = this.ctx.createStereoPanner();
        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.pannerNode);
        this.pannerNode.connect(this.ctx.destination);
      } else {
        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.ctx.destination);
      }

      this.oscillator.type = 'sine';
      this.oscillator.frequency.setValueAtTime(440, this.ctx.currentTime);
      this.gainNode.gain.setValueAtTime(0.0001, this.ctx.currentTime); // start silent
      this.oscillator.start();
      this.isPlayingDoppler = true;
    } catch (e) {
      console.warn('Continuous synth setup error:', e);
    }
  }

  toggle(enable) {
    this.enabled = enable !== undefined ? enable : !this.enabled;
    if (!this.enabled && this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
    }
    return this.enabled;
  }

  /**
   * Continuous Doppler Pitch update called each frame or on state change
   * @param {number} freq - Observed frequency in Hz
   * @param {number} intensity - Distance attenuation (0.0 to 1.0)
   * @param {number} pan - Stereo balance (-1.0 to +1.0)
   * @param {string} mode - Simulation mode ('ambulance', 'subsonic', etc.)
   */
  updateDopplerTone(freq, intensity = 0.5, pan = 0, mode = 'subsonic') {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || !this.oscillator || !this.gainNode) return;

    try {
      const now = this.ctx.currentTime;
      // Clamp frequency to pleasant hearing range
      const clampedFreq = Math.max(60, Math.min(2200, freq));

      // Timbre adjustment based on mode
      if (mode === 'ambulance') {
        this.oscillator.type = 'sawtooth';
      } else {
        this.oscillator.type = 'sine';
      }

      // Smooth pitch change (glide)
      this.oscillator.frequency.setTargetAtTime(clampedFreq, now, 0.04);

      // Volume scaling with distance & mode
      const baseVol = mode === 'ambulance' ? 0.08 : 0.12;
      const targetGain = Math.max(0.001, Math.min(0.25, baseVol * intensity));
      this.gainNode.gain.setTargetAtTime(targetGain, now, 0.05);

      // Stereo Pan
      if (this.pannerNode) {
        const clampedPan = Math.max(-1, Math.min(1, pan));
        this.pannerNode.pan.setTargetAtTime(clampedPan, now, 0.05);
      }
    } catch (e) {}
  }

  // Supersonic Sonic Boom Explosion / Thump
  playSonicBoom() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = performance.now();
    if (now - this.lastBoomTime < 1200) return; // Prevent spam
    this.lastBoomTime = now;

    try {
      const t = this.ctx.currentTime;

      // Low-frequency burst
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.exponentialRampToValueAtTime(80, t + 0.4);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.5);
    } catch (e) {}
  }

  // Wavefront crossing detector blip
  playWavefrontCrossing() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.03);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch (e) {}
  }

  // UI button click
  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(260, t + 0.04);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.06);
    } catch (e) {}
  }

  // Quest victory fanfare
  playSuccessFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const startT = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const t = startT + idx * 0.1;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.25);
      });
    } catch (e) {}
  }
}

window.soundEngine = new SoundEngine();
