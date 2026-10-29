/**
 * state.js
 * Central state store for crystallization simulation.
 */

class State {
  constructor() {
    this.stageIndex = 0; // 0 to 4
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

  setStageIndex(idx) {
    this.stageIndex = Math.max(0, Math.min(4, Number(idx)));
    this.notify();
  }

  reset() {
    this.stageIndex = 0;
    this.notify();
  }
}

export const state = new State();
