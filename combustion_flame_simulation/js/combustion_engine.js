/**
 * combustion_engine.js
 * Physics and thermodynamics engine for flame zones and combustion kinetics.
 */

import { FLAME_ZONES, AIR_SUPPLY_MODES } from './combustion_data.js';

export class CombustionEngine {
  constructor() {
    this.airMode = AIR_SUPPLY_MODES[0]; // Free air ingress
    this.insertedTool = 'none'; // 'none', 'glass_slide', 'copper_wire', 'glass_tube'
    this.selectedZone = 'middle';
  }

  setAirMode(modeId) {
    const found = AIR_SUPPLY_MODES.find(m => m.id === modeId);
    if (found) this.airMode = found;
  }

  insertTool(toolId) {
    this.insertedTool = toolId;
  }

  getToolOutcome() {
    if (this.airMode.flameState === 'extinguished') {
      return { text: 'Flame is extinguished due to absence of Oxygen (O₂).', imageState: 'extinguished' };
    }

    if (this.insertedTool === 'glass_slide') {
      return {
        text: 'Circular black soot ring formed on the glass slide due to deposition of unburnt incandescent carbon particles from the luminous middle zone.',
        hasSoot: true
      };
    } else if (this.insertedTool === 'copper_wire') {
      return {
        text: 'Copper wire placed just in the non-luminous outer zone glows red-hot in seconds, demonstrating it is the hottest zone (~1400°C).',
        glowsRed: true
      };
    } else if (this.insertedTool === 'glass_tube') {
      return {
        text: 'Unburnt wax vapors from the innermost dark zone travel through the thin glass tube and catch fire at the other open end when a match is brought near.',
        vaporsBurn: true
      };
    }

    return { text: 'Apparatus idling. Select an experimental probe tool.' };
  }
}
