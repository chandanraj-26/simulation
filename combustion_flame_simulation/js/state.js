/**
 * state.js
 * Central state store for combustion & flame simulation.
 */

import { AIR_SUPPLY_MODES } from './combustion_data.js';

class State {
  constructor() {
    this.airMode = AIR_SUPPLY_MODES[0];
    this.insertedTool = 'none'; // 'none', 'glass_slide', 'copper_wire'
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

  setAirMode(modeId) {
    const found = AIR_SUPPLY_MODES.find(m => m.id === modeId);
    if (found) {
      this.airMode = found;
      this.notify();
    }
  }

  setInsertedTool(toolId) {
    this.insertedTool = toolId;
    this.notify();
  }

  reset() {
    this.airMode = AIR_SUPPLY_MODES[0];
    this.insertedTool = 'none';
    this.notify();
  }
}

export const state = new State();
