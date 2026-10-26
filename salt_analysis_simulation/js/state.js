/**
 * state.js
 * Central state store for salt analysis experiment.
 */

import { PRESET_SALTS } from './salt_data.js';

class State {
  constructor() {
    this.activeSalt = PRESET_SALTS[0];
    this.currentReagent = null;
    this.lastResult = null;
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

  setSalt(saltId) {
    const found = PRESET_SALTS.find(s => s.id === saltId);
    if (found) {
      this.activeSalt = found;
      this.currentReagent = null;
      this.lastResult = null;
      this.notify();
    }
  }

  setReagentResult(reagentId, result) {
    this.currentReagent = reagentId;
    this.lastResult = result;
    this.notify();
  }

  reset() {
    this.activeSalt = PRESET_SALTS[0];
    this.currentReagent = null;
    this.lastResult = null;
    this.notify();
  }
}

export const state = new State();
