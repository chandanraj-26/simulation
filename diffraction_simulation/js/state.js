/**
 * state.js
 * Central state store for diffraction simulation.
 */

import { LASER_PRESETS } from './diffraction_data.js';

class State {
  constructor() {
    this.laserActive = true;
    this.laserPreset = LASER_PRESETS[0];
    this.wavelengthNm = 650;
    this.slitWidthMm = 0.08;
    this.screenDistanceM = 1.5;
    this.probeYMm = 0.0;
    this.soundEnabled = true;
    this.activeQuestIndex = 0;
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

  setLaserActive(val) {
    this.laserActive = !!val;
    this.notify();
  }

  setLaserPreset(presetId) {
    const found = LASER_PRESETS.find(p => p.id === presetId);
    if (found) {
      this.laserPreset = found;
      this.wavelengthNm = found.wavelengthNm;
      this.notify();
    }
  }

  setWavelength(nm) {
    this.wavelengthNm = Number(nm);
    this.notify();
  }

  setSlitWidth(mm) {
    this.slitWidthMm = Number(mm);
    this.notify();
  }

  setScreenDistance(m) {
    this.screenDistanceM = Number(m);
    this.notify();
  }

  setProbeY(yMm) {
    this.probeYMm = Number(yMm);
    this.notify();
  }

  reset() {
    this.laserActive = true;
    this.laserPreset = LASER_PRESETS[0];
    this.wavelengthNm = 650;
    this.slitWidthMm = 0.08;
    this.screenDistanceM = 1.5;
    this.probeYMm = 0.0;
    this.notify();
  }
}

export const state = new State();
