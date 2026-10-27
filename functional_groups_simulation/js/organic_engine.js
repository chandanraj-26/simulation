/**
 * Organic Reactions & Particle Dynamics Engine
 */

import { COMPOUNDS, REAGENTS } from './organic_data.js';

export class OrganicEngine {
  constructor() {
    this.compoundId = 'ethanol';
    this.activeReagentId = null;
    this.reactionProgress = 0.0; // 0 to 1
    this.isReacting = false;

    // Animated gas bubbles
    this.bubbles = [];
  }

  setCompound(id) {
    if (COMPOUNDS[id]) {
      this.compoundId = id;
      this.reset();
    }
  }

  applyReagent(reagentId) {
    this.activeReagentId = reagentId;
    this.reactionProgress = 0.0;
    this.isReacting = true;
    this.bubbles = [];

    const comp = COMPOUNDS[this.compoundId];
    const res = comp.responses[reagentId];

    // Seed bubbles if gas is evolved (sodium metal -> H2, nahco3 -> CO2)
    if (res && res.positive && (reagentId === 'sodium' || reagentId === 'nahco3')) {
      for (let i = 0; i < 35; i++) {
        this.bubbles.push({
          x: (Math.random() - 0.5) * 24,
          y: Math.random() * 80 + 20,
          radius: Math.random() * 2.5 + 1.2,
          speed: Math.random() * 45 + 30
        });
      }
    }
  }

  reset() {
    this.activeReagentId = null;
    this.reactionProgress = 0.0;
    this.isReacting = false;
    this.bubbles = [];
  }

  update(deltaSeconds) {
    if (this.isReacting) {
      this.reactionProgress = Math.min(1.0, this.reactionProgress + deltaSeconds * 0.85);
    }

    // Update rising gas bubbles
    this.bubbles.forEach(b => {
      b.y -= b.speed * deltaSeconds;
      if (b.y < 0) {
        b.y = 80;
        b.x = (Math.random() - 0.5) * 24;
      }
    });
  }

  getMetrics() {
    const comp = COMPOUNDS[this.compoundId];
    const res = this.activeReagentId ? comp.responses[this.activeReagentId] : null;

    return {
      compoundName: comp.name,
      functionalGroup: comp.group,
      activeReagent: this.activeReagentId ? REAGENTS[this.activeReagentId].name : 'None Added',
      observation: res ? (this.reactionProgress > 0.4 ? res.obs : 'Mixing reagents...') : 'Add a diagnostic reagent to observe functional group response',
      isPositive: res ? res.positive : false,
      progress: this.reactionProgress
    };
  }
}
