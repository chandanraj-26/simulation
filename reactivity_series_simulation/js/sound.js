/**
 * Reactivity Series — Procedural Web Audio & Web Speech Synthesizer
 * Generates liquid splash dips, fizzing effervescence, crystal growth chimes,
 * UI clicks, victory fanfares, and Hinglish mnemonic speech pronunciation.
 */

class ReactivitySoundEngine {
  constructor(state) {
    this.state = state;
    this.ctx = null;
    this.masterGain = null;
    this.fizzGain = null;
    this.fizzSource = null;
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

  playLiquidDip() {
    if (!this.state.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  startFizzing() {
    if (!this.state.soundEnabled) return;
    this.resume();
    if (!this.ctx || this.fizzSource) return;

    const buffer = this.createNoiseBuffer(2.0);
    this.fizzSource = this.ctx.createBufferSource();
    this.fizzSource.buffer = buffer;
    this.fizzSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, this.ctx.currentTime);
    filter.Q.setValueAtTime(4.0, this.ctx.currentTime);

    this.fizzGain = this.ctx.createGain();
    this.fizzGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.fizzGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.2);

    this.fizzSource.connect(filter);
    filter.connect(this.fizzGain);
    this.fizzGain.connect(this.masterGain);

    this.fizzSource.start(0);
  }

  stopFizzing() {
    if (this.fizzGain && this.ctx) {
      this.fizzGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
      setTimeout(() => {
        if (this.fizzSource) {
          try { this.fizzSource.stop(); } catch(e){}
          this.fizzSource.disconnect();
          this.fizzSource = null;
        }
      }, 75);
    }
  }

  playCrystalTinkle() {
    if (!this.state.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1480, now);
    osc.frequency.exponentialRampToValueAtTime(2200, now + 0.08);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  playClick() {
    if (!this.state.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  playQuestChime() {
    if (!this.state.soundEnabled) return;
    this.resume();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
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

  speakMnemonic() {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const text = "Kedar Nath Ka Mali Aalu Zara Pheeke Pakata Hai, Kyunki Hoga Ag Au. Potassium is highest, Gold is lowest!";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }
}

window.ReactivitySoundEngine = ReactivitySoundEngine;
