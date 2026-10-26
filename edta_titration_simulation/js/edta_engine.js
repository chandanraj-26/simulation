/**
 * EDTA Titration & Complexometric Kinetics Engine
 */

import { WATER_SAMPLES, TITRANT } from './edta_data.js';

export class EdtaEngine {
  constructor() {
    this.sampleId = 'tap_water';
    this.titrantVolumeMl = 0.0;
    this.stopcockOpen = false;
    this.flowRateMlPerSec = 0.4;

    this.hasBufferAdded = true;    // pH 10 buffer added
    this.hasIndicatorAdded = true; // EBT indicator added

    this.stirrerRpm = 450;
    this.recomputeEquivalence();
  }

  setSample(id) {
    if (WATER_SAMPLES[id]) {
      this.sampleId = id;
      this.reset();
    }
  }

  recomputeEquivalence() {
    const sample = WATER_SAMPLES[this.sampleId];
    // Hardness ppm = (V_edta * M_edta * 100 * 1000) / V_sample
    // V_edta = (Hardness * V_sample) / (M_edta * 100000)
    const vEdta = (sample.expectedHardnessPpm * sample.sampleVolumeMl) / (TITRANT.molarity * 100000);
    this.equivalenceVolumeMl = vEdta;
  }

  reset() {
    this.titrantVolumeMl = 0.0;
    this.stopcockOpen = false;
    this.recomputeEquivalence();
  }

  addSingleDrop() {
    this.titrantVolumeMl = Math.min(50.0, this.titrantVolumeMl + 0.05);
  }

  update(deltaSeconds) {
    if (this.stopcockOpen && this.titrantVolumeMl < 50.0) {
      this.titrantVolumeMl = Math.min(50.0, this.titrantVolumeMl + this.flowRateMlPerSec * deltaSeconds);
    }
  }

  getFlaskColor() {
    if (!this.hasIndicatorAdded) {
      return {
        colorHex: '#e2e8f0',
        colorRgba: 'rgba(241, 245, 249, 0.4)',
        label: 'Colorless (No Indicator Added)'
      };
    }

    const v = this.titrantVolumeMl;
    const vEq = this.equivalenceVolumeMl;

    if (v < vEq - 0.1) {
      // Wine Red ([Ca-EBT]2+ complex)
      return {
        colorHex: '#831843',
        colorRgba: 'rgba(131, 24, 67, 0.78)',
        label: 'WINE RED ([Mg-EBT]²⁺ Complex)'
      };
    } else if (Math.abs(v - vEq) <= 0.1) {
      // Transition purple-violet
      return {
        colorHex: '#6b21a8',
        colorRgba: 'rgba(107, 33, 168, 0.78)',
        label: 'Purple Transition (Equivalence Point)'
      };
    } else {
      // Clear Sky Blue (Free HIn2-)
      return {
        colorHex: '#0284c7',
        colorRgba: 'rgba(2, 132, 199, 0.85)',
        label: 'CLEAR SKY BLUE (Equivalence Reached - Free EBT)'
      };
    }
  }

  getMetrics() {
    const v = this.titrantVolumeMl;
    const vEq = this.equivalenceVolumeMl;
    const sample = WATER_SAMPLES[this.sampleId];
    const isEndpoint = v >= vEq;
    const flask = this.getFlaskColor();

    const calcHardness = v > 0.1
      ? ((v * TITRANT.molarity * 100 * 1000) / sample.sampleVolumeMl).toFixed(1)
      : '0.0';

    return {
      titrantVolumeMl: v,
      equivalenceVolumeMl: vEq,
      isEndpoint,
      flaskColor: flask,
      calculatedHardnessPpm: calcHardness,
      stirrerRpm: this.stirrerRpm
    };
  }
}
