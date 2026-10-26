/**
 * Equilibrium Kinetics & van 't Hoff Thermodynamics Engine
 */

import { SYSTEMS } from './equilibrium_data.js';

export class EquilibriumEngine {
  constructor() {
    this.systemId = 'iron_thiocyanate';
    this.tubes = [];
    this.initTubes();
  }

  setSystem(id) {
    if (SYSTEMS[id]) {
      this.systemId = id;
      this.initTubes();
    }
  }

  initTubes() {
    // 4 test tubes on rack
    this.tubes = [
      { id: 1, label: 'Tube 1 (Reference)', extent: 0.50, targetExtent: 0.50, tempC: 25, appliedDisturbance: 'None (Control)' },
      { id: 2, label: 'Tube 2 (Test A)', extent: 0.50, targetExtent: 0.50, tempC: 25, appliedDisturbance: 'None' },
      { id: 3, label: 'Tube 3 (Test B)', extent: 0.50, targetExtent: 0.50, tempC: 25, appliedDisturbance: 'None' },
      { id: 4, label: 'Tube 4 (Test C)', extent: 0.50, targetExtent: 0.50, tempC: 25, appliedDisturbance: 'None' }
    ];
  }

  applyPerturbation(tubeIndex, reagentId) {
    const tube = this.tubes[tubeIndex];
    if (!tube) return;

    const sys = SYSTEMS[this.systemId];
    const reagent = sys.reagents.find(r => r.id === reagentId);
    if (!reagent) return;

    tube.appliedDisturbance = reagent.label;

    if (reagent.id === 'hot_bath') {
      tube.tempC = 80;
      // van 't Hoff: if endothermic, K increases with T -> forward shift
      tube.targetExtent = sys.enthalpyType === 'endothermic' ? 0.90 : 0.15;
    } else if (reagent.id === 'ice_bath') {
      tube.tempC = 2;
      tube.targetExtent = sys.enthalpyType === 'endothermic' ? 0.10 : 0.85;
    } else if (reagent.shift === 'forward') {
      tube.targetExtent = Math.min(0.95, tube.targetExtent + 0.35);
    } else {
      tube.targetExtent = Math.max(0.05, tube.targetExtent - 0.35);
    }
  }

  reset() {
    this.initTubes();
  }

  update(deltaSeconds) {
    // Smooth relaxation kinetics toward targetExtent
    this.tubes.forEach(tube => {
      const diff = tube.targetExtent - tube.extent;
      tube.extent += diff * Math.min(1.0, deltaSeconds * 3.5);
    });
  }

  getColorForExtent(extent) {
    if (this.systemId === 'iron_thiocyanate') {
      // Extent 0: Pale yellow (254, 240, 138), Extent 1: Blood red (153, 27, 27)
      const r = Math.round(254 + (153 - 254) * extent);
      const g = Math.round(240 + (27 - 240) * extent);
      const b = Math.round(138 + (27 - 138) * extent);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Extent 0: Rosy pink (244, 114, 182), Extent 1: Deep blue (29, 78, 216)
      const r = Math.round(244 + (29 - 244) * extent);
      const g = Math.round(114 + (78 - 114) * extent);
      const b = Math.round(182 + (216 - 182) * extent);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  getMetrics(tubeIndex = 1) {
    const tube = this.tubes[tubeIndex] || this.tubes[0];
    const sys = SYSTEMS[this.systemId];

    // Transmittance & Absorbance
    const productFraction = tube.extent;
    const absorbance = (productFraction * 1.8).toFixed(3);
    const transmittance = (Math.pow(10, -absorbance) * 100).toFixed(1);

    return {
      systemName: sys.name,
      tubeLabel: tube.label,
      disturbance: tube.appliedDisturbance,
      tempC: tube.tempC,
      equilibriumPosition: (tube.extent * 100).toFixed(1),
      absorbance,
      transmittancePercent: transmittance,
      shiftDirection: tube.extent > 0.55 ? 'Forward (Right → Products)' : tube.extent < 0.45 ? 'Reverse (Left → Reactants)' : 'Equilibrium Balanced'
    };
  }
}
