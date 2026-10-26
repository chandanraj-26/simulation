/**
 * Redox Chemistry Engine & Nernst Potential Calculations
 */

import { ANALYTES, TITRANT } from './redox_data.js';

export class RedoxEngine {
  constructor() {
    this.analyteId = 'mohrs_salt';
    this.titrantVolumeMl = 0.0;
    this.stopcockOpen = false;
    this.flowRateMlPerSec = 0.35; // controllable flow rate
    this.temperatureC = 25.0;     // Flask temperature
    this.isHeaterOn = false;
    this.stirrerRpm = 400;        // Magnetic stirrer speed

    this.titrationHistory = []; // points for E_cell vs V_titrant curve

    this.recomputeEquivalence();
  }

  setAnalyte(id) {
    if (ANALYTES[id]) {
      this.analyteId = id;
      this.reset();
    }
  }

  recomputeEquivalence() {
    const analyte = ANALYTES[this.analyteId];
    const analyteMoles = analyte.molarity * (analyte.pipetteVolumeMl / 1000);
    const titrantMolesRequired = analyteMoles / analyte.stoichiometryRatio;
    this.equivalenceVolumeMl = (titrantMolesRequired / TITRANT.molarity) * 1000;
  }

  reset() {
    this.titrantVolumeMl = 0.0;
    this.stopcockOpen = false;
    this.temperatureC = 25.0;
    this.isHeaterOn = false;
    this.titrationHistory = [];
    this.recomputeEquivalence();
    this.recordDataPoint();
  }

  addSingleDrop() {
    const dropVolume = 0.05; // 0.05 mL per drop
    this.titrantVolumeMl = Math.min(50.0, this.titrantVolumeMl + dropVolume);
    this.recordDataPoint();
  }

  update(deltaSeconds) {
    // Thermal heating simulation
    if (this.isHeaterOn) {
      this.temperatureC = Math.min(85.0, this.temperatureC + deltaSeconds * 4.5);
    } else {
      this.temperatureC = Math.max(25.0, this.temperatureC - deltaSeconds * 1.2);
    }

    // Continuous burette outflow
    if (this.stopcockOpen && this.titrantVolumeMl < 50.0) {
      const added = this.flowRateMlPerSec * deltaSeconds;
      this.titrantVolumeMl = Math.min(50.0, this.titrantVolumeMl + added);
      this.recordDataPoint();
    }
  }

  recordDataPoint() {
    const v = parseFloat(this.titrantVolumeMl.toFixed(2));
    const eCell = this.calculateCellPotential(v);

    // Keep points spaced evenly
    const last = this.titrationHistory[this.titrationHistory.length - 1];
    if (!last || Math.abs(last.v - v) >= 0.1 || Math.abs(v - this.equivalenceVolumeMl) < 0.2) {
      this.titrationHistory.push({ v, eCell });
    }
  }

  calculateCellPotential(v) {
    const vEq = this.equivalenceVolumeMl;
    const E0_analyte = ANALYTES[this.analyteId].standardPotentialVolts;
    const E0_titrant = TITRANT.standardPotentialVolts;

    // Nernst logarithmic sigmoidal curve
    if (v < 0.01) return E0_analyte - 0.15;

    if (v < vEq - 0.02) {
      const fraction = v / vEq;
      return E0_analyte + 0.0591 * Math.log10(fraction / (1 - fraction + 0.001));
    } else if (Math.abs(v - vEq) <= 0.02) {
      // Equivalence point weighted average potential
      return (1 * E0_analyte + 5 * E0_titrant) / 6.0;
    } else {
      const excessFraction = (v - vEq) / vEq;
      return E0_titrant + (0.0591 / 5) * Math.log10(Math.max(0.001, excessFraction));
    }
  }

  getFlaskAppearance() {
    const v = this.titrantVolumeMl;
    const vEq = this.equivalenceVolumeMl;
    const analyte = ANALYTES[this.analyteId];

    // Check if oxalic acid is too cold for reaction kinetics
    const isColdOxalic = (analyte.needsHeating && this.temperatureC < 55.0);

    if (v < vEq) {
      // Before equivalence
      return {
        isAtOrPastEndpoint: false,
        colorHex: '#f8fafc',
        colorRgba: 'rgba(240, 248, 255, 0.4)',
        label: isColdOxalic ? 'Slow Reaction (Heat Flask to >60°C)' : 'Colorless (Rapid reduction to Mn²⁺)'
      };
    } else if (v >= vEq && v < vEq + 0.5) {
      // Crisp permanent faint pink endpoint!
      return {
        isAtOrPastEndpoint: true,
        colorHex: '#f490af',
        colorRgba: 'rgba(244, 144, 175, 0.65)',
        label: 'PERMANENT FAINT PINK (Equivalence Point Reached)'
      };
    } else {
      // Excess KMnO4
      return {
        isAtOrPastEndpoint: true,
        colorHex: '#701a75',
        colorRgba: 'rgba(112, 26, 117, 0.85)',
        label: 'Dark Purple (Excess KMnO₄ Titrant)'
      };
    }
  }

  getMetrics() {
    const v = this.titrantVolumeMl;
    const vEq = this.equivalenceVolumeMl;
    const isEndpoint = v >= vEq;
    const flask = this.getFlaskAppearance();

    return {
      titrantVolumeMl: v,
      equivalenceVolumeMl: vEq,
      isEndpoint,
      cellPotentialVolts: this.calculateCellPotential(v),
      temperatureC: this.temperatureC,
      flaskAppearance: flask,
      stirrerRpm: this.stirrerRpm,
      molarityDetermined: (v > 0.5) ? ((ANALYTES[this.analyteId].molarity * ANALYTES[this.analyteId].pipetteVolumeMl) / (v * ANALYTES[this.analyteId].stoichiometryRatio)).toFixed(4) : '—'
    };
  }
}
