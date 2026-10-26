/**
 * Potentiometer Circuit Nodal Analysis & Galvanometer Deflection
 */

import { CELLS, BENCH_CONFIG } from './potentiometer_data.js';

export class PotentiometerEngine {
  constructor() {
    this.activeCellKey = 'cell1'; // 'cell1' (Leclanche), 'cell2' (Daniell), or 'internal_r'
    this.rheostatOhms = 4.0;
    this.shuntResistanceOhms = 5.0; // Resistance box for internal r
    this.jockeyPositionCm = 150.0;  // 0 to 400 cm

    this.recomputeCircuit();
  }

  recomputeCircuit() {
    const totalWireR = BENCH_CONFIG.wireResistancePerMeter * 4; // 16 ohms
    const totalR = totalWireR + this.rheostatOhms;
    const current = BENCH_CONFIG.driverEmf / totalR; // Amps

    const potentialDropAcrossWire = current * totalWireR; // Volts
    this.potentialGradientK = potentialDropAcrossWire / 400.0; // V/cm

    // Calculate theoretical balancing lengths
    this.l1BalancingCm = CELLS.leclanche.emf / this.potentialGradientK;
    this.l2BalancingCm = CELLS.daniell.emf / this.potentialGradientK;

    // Terminal potential for internal resistance mode
    const r = CELLS.leclanche.internalResistance;
    const R = this.shuntResistanceOhms;
    const V_terminal = CELLS.leclanche.emf * (R / (R + r));
    this.lShuntBalancingCm = V_terminal / this.potentialGradientK;
  }

  setCellMode(mode) {
    this.activeCellKey = mode;
  }

  setRheostat(ohms) {
    this.rheostatOhms = Math.max(0.5, Math.min(25.0, ohms));
    this.recomputeCircuit();
  }

  setJockeyPosition(cm) {
    this.jockeyPositionCm = Math.max(0.0, Math.min(400.0, cm));
  }

  getGalvanometerDeflection() {
    let targetEmf = CELLS.leclanche.emf;
    if (this.activeCellKey === 'cell2') targetEmf = CELLS.daniell.emf;
    else if (this.activeCellKey === 'internal_r') {
      const r = CELLS.leclanche.internalResistance;
      const R = this.shuntResistanceOhms;
      targetEmf = CELLS.leclanche.emf * (R / (R + r));
    }

    const wirePotentialAtJockey = this.potentialGradientK * this.jockeyPositionCm;
    const deltaV = wirePotentialAtJockey - targetEmf;

    // Needle deflection proportional to potential difference
    const sensitivity = 180.0; // divisions per volt
    const rawDeflection = deltaV * sensitivity;
    return Math.max(-30.0, Math.min(30.0, rawDeflection));
  }

  getMetrics() {
    const defl = this.getGalvanometerDeflection();
    const isNull = Math.abs(defl) < 0.6;

    return {
      jockeyCm: this.jockeyPositionCm.toFixed(1),
      potentialGradient: (this.potentialGradientK * 1000).toFixed(2), // mV/cm
      galvanometerDeflection: defl.toFixed(1),
      isNullPoint: isNull,
      l1Reference: this.l1BalancingCm.toFixed(1),
      l2Reference: this.l2BalancingCm.toFixed(1),
      emfRatio: (this.l1BalancingCm / this.l2BalancingCm).toFixed(3)
    };
  }
}
