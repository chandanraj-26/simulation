/**
 * OhmLab — Procedural Sound Engine (js/sound.js)
 * Synthesizes dynamic audio for switch clicks, electric sparks, meter hum,
 * thermal sizzle, hazard alarms, and quest achievements using Web Audio API.
 *
 * Zero external audio assets. Attaches to window.soundEngine.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;

    // Continuous sound nodes
    this.humGain = null;
    this.humOsc = null;
    this.humOsc2 = null;

    this.sizzleGain = null;
    this.sizzleOsc = null;

    this.alarmGain = null;
    this.alarmOsc = null;
    this.alarmInterval = null;
    this.isAlarming = false;
  }

  /**
   * Lazily initializes AudioContext on the first user interaction.
   */
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Set up continuous 60Hz transformer electrical hum
      this.setupHumLoop();

      // Set up thermal sizzle loop
      this.setupSizzleLoop();
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
    }
  }

  setupHumLoop() {
    if (!this.ctx) return;
    this.humGain = this.ctx.createGain();
    this.humGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.humOsc = this.ctx.createOscillator();
    this.humOsc.type = 'triangle';
    this.humOsc.frequency.setValueAtTime(60, this.ctx.currentTime); // 60 Hz mains

    this.humOsc2 = this.ctx.createOscillator();
    this.humOsc2.type = 'sine';
    this.humOsc2.frequency.setValueAtTime(120, this.ctx.currentTime); // 120 Hz harmonic

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(240, this.ctx.currentTime);

    this.humOsc.connect(filter);
    this.humOsc2.connect(filter);
    filter.connect(this.humGain);
    this.humGain.connect(this.ctx.destination);

    this.humOsc.start();
    this.humOsc2.start();
  }

  setupSizzleLoop() {
    if (!this.ctx) return;
    this.sizzleGain = this.ctx.createGain();
    this.sizzleGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.sizzleOsc = this.ctx.createOscillator();
    this.sizzleOsc.type = 'sawtooth';
    this.sizzleOsc.frequency.setValueAtTime(320, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    this.sizzleOsc.connect(filter);
    filter.connect(this.sizzleGain);
    this.sizzleGain.connect(this.ctx.destination);

    this.sizzleOsc.start();
  }

  /**
   * Toggles sound on/off.
   */
  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.silenceAll();
    }
    return this.enabled;
  }

  silenceAll() {
    if (this.humGain && this.ctx) {
      this.humGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    if (this.sizzleGain && this.ctx) {
      this.sizzleGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    this.stopHazardAlarm();
  }

  /**
   * Mechanical knife switch snap SFX.
   */
  playSwitchClick() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  /**
   * Switch contact electric spark arc snap.
   */
  playSparkArc() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.04); // 40ms buffer
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.Q.setValueAtTime(2.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch (e) {}
  }

  /**
   * High crisp chime when a V-I data point is logged.
   */
  playDataPing() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1320, now); // E6

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  /**
   * Continuous hazard warning buzzer during short circuit or safety fault.
   */
  playHazardAlarm() {
    if (!this.enabled || !this.ctx || this.isAlarming) return;
    this.isAlarming = true;

    try {
      this.alarmGain = this.ctx.createGain();
      this.alarmGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      this.alarmOsc = this.ctx.createOscillator();
      this.alarmOsc.type = 'sawtooth';
      this.alarmOsc.frequency.setValueAtTime(880, this.ctx.currentTime);

      this.alarmOsc.connect(this.alarmGain);
      this.alarmGain.connect(this.ctx.destination);
      this.alarmOsc.start();

      let toggle = false;
      this.alarmInterval = setInterval(() => {
        if (!this.ctx || !this.alarmGain) return;
        toggle = !toggle;
        this.alarmGain.gain.setValueAtTime(toggle ? 0.25 : 0.02, this.ctx.currentTime);
        if (this.alarmOsc) {
          this.alarmOsc.frequency.setValueAtTime(toggle ? 880 : 660, this.ctx.currentTime);
        }
      }, 160);
    } catch (e) {}
  }

  stopHazardAlarm() {
    if (!this.isAlarming) return;
    this.isAlarming = false;
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
    if (this.alarmOsc) {
      try {
        this.alarmOsc.stop();
        this.alarmOsc.disconnect();
      } catch (e) {}
      this.alarmOsc = null;
    }
    if (this.alarmGain) {
      try {
        this.alarmGain.disconnect();
      } catch (e) {}
      this.alarmGain = null;
    }
  }

  /**
   * Modulates 60Hz transformer electrical hum level with current.
   * @param {number} current Total circuit current in Amperes
   */
  updateElectricalHum(current) {
    if (!this.enabled || !this.ctx || !this.humGain) return;
    const targetGain = Math.min(0.2, (current / 2.0) * 0.12);
    this.humGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
  }

  /**
   * Modulates thermal resistor sizzle when resistor exceeds 80°C.
   * @param {number} temperature Resistor temperature in °C
   */
  updateOverheatBuzz(temperature) {
    if (!this.enabled || !this.ctx || !this.sizzleGain) return;
    if (temperature < 60) {
      this.sizzleGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      return;
    }
    const ratio = Math.min(1.0, (temperature - 60) / 140);
    const targetGain = ratio * 0.15;
    this.sizzleGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    if (this.sizzleOsc) {
      this.sizzleOsc.frequency.setTargetAtTime(300 + ratio * 200, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Ascending victory chime for quest completion.
   */
  playQuestFanfare() {
    if (!this.enabled || !this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.2);
        } catch (e) {}
      }, idx * 75);
    });
  }
}

window.soundEngine = new SoundEngine();
