/**
 * state.js
 * Central state store for reaction rate & surface area simulation.
 */

import { PARTICLE_SIZES, CONCENTRATIONS } from './reaction_data.js';

class State {
  constructor() {
    this.particleSize = PARTICLE_SIZES[0]; // Large chips
    this.conc = CONCENTRATIONS[1]; // 1.0 M
    this.timeSec = 0.0;
    this.listeners = [];
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== fn);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  setParticleSize(sizeId) {
    const found = PARTICLE_SIZES.find(p => p.id === sizeId);
    if (found) {
      this.particleSize = found;
      this.notify();
    }
  }

  setConcentration(concVal) {
    const found = CONCENTRATIONS.find(c => c.id === Number(concVal));
    if (found) {
      this.conc = found;
      this.notify();
    }
  }

  setTimeSec(t) {
    this.timeSec = Math.max(0.0, Math.min(120.0, Number(t)));
    this.notify();
  }

  reset() {
    this.particleSize = PARTICLE_SIZES[0];
    this.conc = CONCENTRATIONS[1];
    this.timeSec = 0.0;
    this.notify();
  }
}

export const state = new State();
