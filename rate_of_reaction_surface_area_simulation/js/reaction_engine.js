/**
 * reaction_engine.js
 * Heterogeneous reaction kinetics engine for CaCO3 + HCl.
 */

import { PARTICLE_SIZES, CONCENTRATIONS, MAX_CO2_VOLUME_ML } from './reaction_data.js';

export class ReactionEngine {
  constructor(particleSize = PARTICLE_SIZES[0], conc = CONCENTRATIONS[1]) {
    this.particleSize = particleSize;
    this.conc = conc;
    this.timeSec = 0.0;
    this.initialTotalMassG = 150.00; // Flask + acid + marble
  }

  setParticleSize(size) {
    this.particleSize = size;
  }

  setConcentration(conc) {
    this.conc = conc;
  }

  setTime(t) {
    this.timeSec = Math.max(0.0, Math.min(120.0, t));
  }

  getEffectiveK() {
    return this.particleSize.rateConstantK * this.conc.factor;
  }

  getVolumeAt(t) {
    const k = this.getEffectiveK();
    return MAX_CO2_VOLUME_ML * (1.0 - Math.exp(-k * t));
  }

  getCurrentVolume() {
    return this.getVolumeAt(this.timeSec);
  }

  getInstantaneousRate() {
    const k = this.getEffectiveK();
    // dV/dt in mL/s
    return k * MAX_CO2_VOLUME_ML * Math.exp(-k * this.timeSec);
  }

  getMassLossG() {
    // 1 mole CO2 (44g) occupies 24000 mL at room temp
    const moles = (this.getCurrentVolume() * 1e-3) / 24.0;
    return moles * 44.0;
  }

  getCurrentBalanceMass() {
    return this.initialTotalMassG - this.getMassLossG();
  }
}
