/**
 * Calorimetry Physics & Thermodynamic Newton Cooling Engine
 */

import { REACTION_SYSTEMS } from './calorimetry_data.js';

export class CalorimetryEngine {
  constructor() {
    this.systemId = 'hcl_naoh';
    this.initialTempC = 25.0;
    this.currentTempC = 25.0;
    this.isMixed = false;
    this.elapsedSeconds = 0;
    this.stirrerRpm = 350;

    this.thermogramHistory = [{ t: 0, temp: 25.0 }];
  }

  setSystem(id) {
    if (REACTION_SYSTEMS[id]) {
      this.systemId = id;
      this.reset();
    }
  }

  triggerMix() {
    if (this.isMixed) return;
    this.isMixed = true;
  }

  reset() {
    this.isMixed = false;
    this.elapsedSeconds = 0;
    this.currentTempC = this.initialTempC;
    this.thermogramHistory = [{ t: 0, temp: this.initialTempC }];
  }

  update(deltaSeconds) {
    if (!this.isMixed) return;

    this.elapsedSeconds += deltaSeconds;
    const sys = REACTION_SYSTEMS[this.systemId];
    const maxDeltaT = sys.expectedDeltaT;

    // Fast exothermic release + slow Newton cooling
    const heatRelease = maxDeltaT * (1 - Math.exp(-this.elapsedSeconds / 3.0));
    const coolingLoss = 0.008 * (this.currentTempC - this.initialTempC) * this.elapsedSeconds;

    this.currentTempC = this.initialTempC + Math.max(0, heatRelease - coolingLoss);

    // Record thermogram points
    const last = this.thermogramHistory[this.thermogramHistory.length - 1];
    if (!last || this.elapsedSeconds - last.t >= 0.5) {
      this.thermogramHistory.push({
        t: parseFloat(this.elapsedSeconds.toFixed(1)),
        temp: parseFloat(this.currentTempC.toFixed(2))
      });
    }
  }

  getMetrics() {
    const sys = REACTION_SYSTEMS[this.systemId];
    const deltaT = Math.max(0, this.currentTempC - this.initialTempC);

    // q = (m_sol * c + W) * deltaT
    // m_sol = 100 g, c = 4.184 J/g°C, W = 25 J/°C (calorimeter constant)
    const heatJoules = (100 * 4.184 + 25) * deltaT;
    const molesReacted = 0.05; // 50 mL of 1.0 M = 0.05 moles
    const deltaHKJ = deltaT > 0.2 ? (-heatJoules / (molesReacted * 1000)).toFixed(2) : '0.00';

    return {
      systemName: sys.name,
      currentTempC: this.currentTempC.toFixed(2),
      initialTempC: this.initialTempC.toFixed(1),
      deltaTC: deltaT.toFixed(2),
      heatJoules: heatJoules.toFixed(1),
      deltaHKJ: deltaHKJ,
      standardDeltaH: sys.standardDeltaH,
      isMixed: this.isMixed
    };
  }
}
