/**
 * CardiacSim — Procedural Web Audio Sound Engine
 * Synthesizes realistic S1 ("LUB"), S2 ("DUB"), ECG monitor telemetry beeps,
 * auscultation acoustic filtering, and pathological heart murmurs without external audio files.
 */

class CardiacSound {
  constructor(state) {
    this.state = state;
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.isInitialized = false;

    // Auscultation spatial focus
    this.activeZoneGain = {
      aortic: 1.0,
      pulmonic: 1.0,
      tricuspid: 1.0,
      mitral: 1.0
    };
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.state.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported in this browser.', e);
    }
  }

  resume() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playS1() {
    if (!this.state.soundEnabled || !this.isInitialized) return;
    this.resume();

    // S1 ("LUB"): Closure of AV valves (Mitral & Tricuspid)
    // Acoustic profile: Deeper resonance (~45-60 Hz), longer duration (~120-140ms)
    const now = this.ctx.currentTime;

    // Calculate auscultation volume boost if stethoscope is near apex/mitral area
    let zoneMultiplier = 1.0;
    if (this.state.stethoscope.active && this.state.stethoscope.currentZone) {
      if (this.state.stethoscope.currentZone === 'mitral') {
        zoneMultiplier = 1.5; // S1 loudest at cardiac apex!
      } else if (this.state.stethoscope.currentZone === 'aortic') {
        zoneMultiplier = 0.7; // S1 softer at aortic base
      }
    }

    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    // Primary low-frequency thump
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);

    // Sub-bass physical vibration
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(45, now);
    subOsc.frequency.exponentialRampToValueAtTime(28, now + 0.12);

    // Lowpass filter modeling chest wall acoustic absorption
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);
    filter.Q.setValueAtTime(2.5, now);

    // Amplitude envelope
    const baseAmp = 0.7 * this.state.masterVolume * zoneMultiplier;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(baseAmp, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 0.14);
    subOsc.stop(now + 0.14);

    // Pathological Murmurs during systole
    if (this.state.rhythm === 'stenosis') {
      this.playSystolicMurmur(now, 0.22);
    } else if (this.state.rhythm === 'regurgitation') {
      this.playHolosystolicMurmur(now, 0.25);
    }
  }

  playS2() {
    if (!this.state.soundEnabled || !this.isInitialized) return;
    this.resume();

    // S2 ("DUB"): Closure of Semilunar valves (Aortic & Pulmonary)
    // Acoustic profile: Higher frequency snap (~90-120 Hz), crisper decay (~70-90ms)
    const now = this.ctx.currentTime;

    // Calculate auscultation volume boost if stethoscope is near aortic/pulmonic base
    let zoneMultiplier = 1.0;
    if (this.state.stethoscope.active && this.state.stethoscope.currentZone) {
      if (this.state.stethoscope.currentZone === 'aortic' || this.state.stethoscope.currentZone === 'pulmonic') {
        zoneMultiplier = 1.6; // S2 loudest at base of the heart!
      } else if (this.state.stethoscope.currentZone === 'mitral') {
        zoneMultiplier = 0.8;
      }
    }

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(115, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.08);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(110, now);
    filter.Q.setValueAtTime(3.0, now);

    const baseAmp = 0.85 * this.state.masterVolume * zoneMultiplier;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(baseAmp, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.10);
  }

  playECGBeep() {
    if (!this.state.soundEnabled || !this.state.monitorBeep || !this.isInitialized) return;
    this.resume();

    // High medical monitor chirp on R-wave peak
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // A5 clinical pitch
    
    // Pitch shift higher if tachycardia
    if (this.state.bpm > 100) {
      osc.frequency.setValueAtTime(1046.5, now); // C6 emergency pitch
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12 * this.state.masterVolume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  playSystolicMurmur(startTime, duration) {
    // Diamond-shaped crescendo-decrescendo murmur of Aortic Stenosis
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, startTime);
    filter.Q.setValueAtTime(2.0, startTime);

    const gain = this.ctx.createGain();
    const half = duration * 0.5;
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.25 * this.state.masterVolume, startTime + half);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(startTime + 0.03);
    whiteNoise.stop(startTime + duration);
  }

  playHolosystolicMurmur(startTime, duration) {
    // Flat plateau blowing murmur of Mitral Regurgitation
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.4;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, startTime);
    filter.Q.setValueAtTime(1.5, startTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.20 * this.state.masterVolume, startTime + 0.02);
    gain.gain.setValueAtTime(0.20 * this.state.masterVolume, startTime + duration - 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(startTime + 0.02);
    whiteNoise.stop(startTime + duration);
  }

  playChime() {
    if (!this.state.soundEnabled) return;
    this.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15); // C6

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }
}

// Global sound singleton
window.cardiacSound = new CardiacSound(window.cardiacState);
