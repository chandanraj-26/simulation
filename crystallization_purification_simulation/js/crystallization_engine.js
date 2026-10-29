/**
 * crystallization_engine.js
 * Physical chemistry engine for mass accounting, solubility saturation, and crystal yield.
 */

import { STAGES } from './crystallization_data.js';

export class CrystallizationEngine {
  constructor(crudeMassG = 10.00) {
    this.crudeMassG = crudeMassG;
    this.stageIndex = 0; // 0 to 4
    this.sandImpurityG = 0.85;
    this.solubleImpurityG = 0.35;
    this.waterVolumeMl = 40;
    this.pureYieldG = 7.65;
  }

  setStageIndex(idx) {
    this.stageIndex = Math.max(0, Math.min(STAGES.length - 1, idx));
  }

  nextStage() {
    if (this.stageIndex < STAGES.length - 1) {
      this.stageIndex++;
      return true;
    }
    return false;
  }

  prevStage() {
    if (this.stageIndex > 0) {
      this.stageIndex--;
      return true;
    }
    return false;
  }

  getCurrentStage() {
    return STAGES[this.stageIndex];
  }

  getYieldMetrics() {
    const theoreticalMax = this.crudeMassG - (this.sandImpurityG + this.solubleImpurityG);
    const percentYield = (this.pureYieldG / theoreticalMax) * 100.0;
    return {
      crudeMass: this.crudeMassG.toFixed(2),
      sandResidue: this.sandImpurityG.toFixed(2),
      pureYield: this.pureYieldG.toFixed(2),
      percentYield: percentYield.toFixed(1)
    };
  }
}
