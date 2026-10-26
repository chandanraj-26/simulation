/**
 * Electrochemical Engine for Daniell Cell & Nernst Equation
 */

import { ELECTRODES, SALT_BRIDGES } from './daniell_data.js';

export class DaniellEngine {
  constructor() {
    this.cellPairId = 'zinc_copper';
    this.saltBridgeId = 'kcl';

    // Concentrations in mol/L
    this.anodeConcentration = 1.0;  // [Zn2+]
    this.cathodeConcentration = 1.0; // [Cu2+]

    // Temperature in Kelvin
    this.temperatureK = 298.15; // 25°C

    // Physical state
    this.saltBridgeInserted = true;
    this.circuitClosed = true;

    // Mass tracking
    this.elapsedSeconds = 0;
    this.cellCurrentAmps = 0.0;
    this.anodeMassLossGrams = 0.0;
    this.cathodeMassGainGrams = 0.0;

    // Electron particle coordinates along wire
    this.electronParticles = [];
    this.ionParticles = [];
    this.initParticles();
  }

  initParticles() {
    this.electronParticles = [];
    for (let i = 0; i < 20; i++) {
      this.electronParticles.push({ progress: i / 20 });
    }

    this.ionParticles = [];
    for (let i = 0; i < 16; i++) {
      this.ionParticles.push({
        progress: Math.random(),
        type: i % 2 === 0 ? 'cation' : 'anion'
      });
    }
  }

  setAnodeConcentration(conc) {
    this.anodeConcentration = Math.max(0.001, Math.min(2.5, conc));
  }

  setCathodeConcentration(conc) {
    this.cathodeConcentration = Math.max(0.001, Math.min(2.5, conc));
  }

  setTemperature(tempK) {
    this.temperatureK = Math.max(273.15, Math.min(360.15, tempK));
  }

  toggleSaltBridge() {
    this.saltBridgeInserted = !this.saltBridgeInserted;
  }

  toggleCircuit() {
    this.circuitClosed = !this.circuitClosed;
  }

  reset() {
    this.anodeConcentration = 1.0;
    this.cathodeConcentration = 1.0;
    this.temperatureK = 298.15;
    this.saltBridgeInserted = true;
    this.circuitClosed = true;
    this.elapsedSeconds = 0;
    this.anodeMassLossGrams = 0.0;
    this.cathodeMassGainGrams = 0.0;
  }

  update(deltaSeconds) {
    const eCell = this.calculateCellPotential();

    if (this.circuitClosed && this.saltBridgeInserted && eCell > 0.001) {
      this.elapsedSeconds += deltaSeconds;

      // Simulated current across load
      const externalResistance = 10.0; // 10 ohms
      this.cellCurrentAmps = eCell / externalResistance;

      // Move electron particles along wire (Anode -> Voltmeter -> Cathode)
      const speed = this.cellCurrentAmps * 0.45;
      this.electronParticles.forEach(p => {
        p.progress = (p.progress + speed * deltaSeconds) % 1.0;
      });

      // Move salt bridge ions
      this.ionParticles.forEach(p => {
        p.progress = (p.progress + speed * 0.3 * deltaSeconds) % 1.0;
      });

      // Faraday's Law of Electrolysis
      // dm = (M * I * t) / (n * F)
      const F = 96485; // C/mol
      const n = 2;
      const mZinc = (65.38 * this.cellCurrentAmps * deltaSeconds) / (n * F);
      const mCopper = (63.55 * this.cellCurrentAmps * deltaSeconds) / (n * F);

      this.anodeMassLossGrams += mZinc * 50; // Accelerated visual display
      this.cathodeMassGainGrams += mCopper * 50;
    } else {
      this.cellCurrentAmps = 0.0;
    }
  }

  calculateCellPotential() {
    if (!this.saltBridgeInserted) return 0.0;

    const cellData = ELECTRODES[this.cellPairId];
    const E0 = cellData.standardCellPotential;
    const n = cellData.electronsTransferred;

    // Nernst Equation: E_cell = E0 - (2.303 * R * T / n * F) * log10(Q)
    const R = 8.314;
    const F = 96485;
    const nernstFactor = (2.303 * R * this.temperatureK) / (n * F);

    const Q = this.anodeConcentration / this.cathodeConcentration;
    const eCell = E0 - nernstFactor * Math.log10(Q);

    return Math.max(0.0, eCell);
  }

  getMetrics() {
    const eCell = this.calculateCellPotential();
    const cellData = ELECTRODES[this.cellPairId];
    const n = cellData.electronsTransferred;
    const F = 96485;

    // Gibbs Free Energy: Delta G = -n * F * E_cell (in kJ/mol)
    const deltaG = (-n * F * eCell) / 1000.0;

    // Reaction Quotient Q
    const Q = (this.anodeConcentration / this.cathodeConcentration).toFixed(4);

    return {
      cellPotentialVolts: this.circuitClosed ? eCell : 0.0,
      openCircuitPotential: eCell,
      standardPotential: cellData.standardCellPotential,
      deltaGKJ: deltaG.toFixed(2),
      reactionQuotientQ: Q,
      currentAmps: this.cellCurrentAmps,
      anodeMassLoss: this.anodeMassLossGrams.toFixed(4),
      cathodeMassGain: this.cathodeMassGainGrams.toFixed(4),
      saltBridgeInserted: this.saltBridgeInserted,
      circuitClosed: this.circuitClosed
    };
  }
}
