/**
 * state.js
 * Central state store for spectrophotometry simulation.
 */

import { SOLUTES, CUVETTE_PATHS } from './spectro_data.js';

class State {
  constructor() {
    this.solute = SOLUTES[1]; // CuSO4
    this.pathLengthCm = CUVETTE_PATHS[1].pathCm; // 1.0 cm
    this.concentrationM = this.solute.defaultConc;
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

  setSolute(soluteId) {
    const found = SOLUTES.find(s => s.id === soluteId);
    if (found) {
      this.solute = found;
      this.concentrationM = found.defaultConc;
      this.notify();
    }
  }

  setPathLength(cm) {
    this.pathLengthCm = Number(cm);
    this.notify();
  }

  setConcentration(molar) {
    this.concentrationM = Number(molar);
    this.notify();
  }

  reset() {
    this.solute = SOLUTES[1];
    this.pathLengthCm = CUVETTE_PATHS[1].pathCm;
    this.concentrationM = this.solute.defaultConc;
    this.notify();
  }
}

export const state = new State();
