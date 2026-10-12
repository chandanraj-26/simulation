/**
 * PeriodicLab — Procedural Web Audio API & Speech Synthesis Engine
 * Zero-dependency tactile audio synthesizer and voice pronunciation
 * for Hinglish periodic mnemonics and chemical elements.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.lastHoverTime = 0;
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

  // Soft tactile click for grid cell hover with 60ms debounce
  playHover() {
    if (!this.enabled) return;
    const now = performance.now();
    if (now - this.lastHoverTime < 60) return;
    this.lastHoverTime = now;

    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.035);

      gain.gain.setValueAtTime(0.03, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    } catch (e) {}
  }

  // Resonant glass chime when selecting an element
  playSelect(z = 20) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const baseFreq = 260 + (z % 30) * 14;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, t + 0.08);

      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.21);
    } catch (e) {}
  }

  // Frequency sweep when switching filter or group highlight
  playGroupSweep() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(640, t + 0.12);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.16);
    } catch (e) {}
  }

  // Mode change or modal pop sound
  playPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, t);
      osc.frequency.exponentialRampToValueAtTime(720, t + 0.06);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {}
  }

  // Quiz correct chime fanfare
  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const t = this.ctx.currentTime + i * 0.07;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.23);
      });
    } catch (e) {}
  }

  // Quiz error dull buzz
  playError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.linearRampToValueAtTime(110, t + 0.18);

      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.23);
    } catch (e) {}
  }
}

/**
 * Web Speech API Voice Engine for Hinglish Mnemonics & Pronunciation
 */
class SpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.enabled = true;
    this.preferredVoice = null;

    if (this.synth) {
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
      this.loadVoices();
    }
  }

  loadVoices() {
    if (!this.synth) return [];
    try {
      const voices = this.synth.getVoices() || [];
      if (voices.length > 0) {
        // Look for Hindi or Indian English voice first
        this.preferredVoice = voices.find(v => v.lang === 'hi-IN' || v.lang === 'en-IN') ||
                              voices.find(v => v.lang.startsWith('hi')) ||
                              voices.find(v => v.lang === 'en-GB' || v.lang === 'en-US') ||
                              voices.find(v => v.lang.startsWith('en')) ||
                              voices[0];
      }
      return voices;
    } catch (e) {
      return [];
    }
  }

  toggle(enable) {
    this.enabled = enable !== undefined ? enable : !this.enabled;
    if (!this.enabled && this.synth) {
      try { this.synth.cancel(); } catch (e) {}
    }
    return this.enabled;
  }

  speak(text, onStart, onEnd) {
    if (!this.enabled || !text) return;
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return;
    }

    try {
      // Chrome requires resume() to ensure synth is not paused
      if (this.synth.paused) {
        this.synth.resume();
      }

      // Stop previous utterance
      this.synth.cancel();

      // Refresh voice list if not yet selected
      if (!this.preferredVoice) {
        this.loadVoices();
      }

      // 40ms timeout ensures Chrome's cancel() completes before speak()
      setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          if (this.preferredVoice) {
            utterance.voice = this.preferredVoice;
            utterance.lang = this.preferredVoice.lang || 'en-IN';
          } else {
            utterance.lang = 'en-IN';
          }

          utterance.rate = 0.95; // Clear speaking pace
          utterance.pitch = 1.05;
          utterance.volume = 1.0;

          if (typeof onStart === 'function') {
            utterance.onstart = onStart;
          }

          utterance.onend = () => {
            if (typeof onEnd === 'function') onEnd();
          };

          utterance.onerror = (err) => {
            console.warn('SpeechSynthesis utterance event error:', err);
            if (typeof onEnd === 'function') onEnd();
          };

          this.synth.speak(utterance);
        } catch (err) {
          console.warn('SpeechSynthesis speak call error:', err);
          if (typeof onEnd === 'function') onEnd();
        }
      }, 40);

    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
      if (typeof onEnd === 'function') onEnd();
    }
  }

  speakMnemonic(phrase, word, element, onStart, onEnd) {
    let text = phrase;
    if (word && element) {
      text = `${word} for ${element.name}. Group trick: ${phrase}.`;
    }
    this.speak(text, onStart, onEnd);
  }
}

// Global Singletons attached to window
const sound = new SoundEngine();
const speech = new SpeechEngine();

window.sound = sound;
window.speech = speech;
window.SoundEngine = SoundEngine;
window.SpeechEngine = SpeechEngine;
