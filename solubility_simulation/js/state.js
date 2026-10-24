/**
 * Solubility & Crystallization — Central Simulation State
 * Reactive state container managing thermodynamic solubility equilibrium,
 * temperature regulation, dissolution kinetics, and crystal nucleation.
 */

class SolubilityState {
  constructor() {
    this.selectedSalt = 'KNO3'; // 'KNO3' | 'NaCl' | 'CuSO4' | 'Ce2SO4_3'
    this.waterMassG = 100.0; // Standard 100 g solvent
    this.soluteAddedG = 0.0;
    this.temperatureC = 20.0; // Room temp (°C)
    this.heatingPower = 0.0; // 0.0 (Off) to 1.0 (Full Flame)
    this.coolingActive = false;
    this.stirring = false;
    this.seedCrystalAdded = false;
    this.crystalMassFormedG = 0.0;
    this.soundEnabled = true;

    // Particles
    this.fallingParticles = [];
    this.sedimentParticles = [];
    this.grownCrystals = [];

    // Quests for Class 9 NCERT Activity 2.3 & 2.4
    this.quests = [
      {
        id: 'q1',
        title: 'Reach Saturation Point',
        desc: 'Add solute to 20°C water until undissolved sediment appears at the bottom (Solution becomes Saturated).',
        completed: false
      },
      {
        id: 'q2',
        title: 'Thermal Dissolution',
        desc: 'Light the Bunsen burner and heat the solution above 50°C to dissolve the sediment completely.',
        completed: false
      },
      {
        id: 'q3',
        title: 'Hot Concentrated Solution',
        desc: 'Add extra solute at elevated temperature (> 70°C) to push dissolved solute beyond the room-temp limit.',
        completed: false
      },
      {
        id: 'q4',
        title: 'Seed & Crystallize',
        desc: 'Cool the hot solution down below 30°C and add a seed crystal to harvest sparkling pure crystals.',
        completed: false
      },
      {
        id: 'q5',
        title: 'Compare Solubility Slopes',
        desc: 'Switch between Potassium Nitrate (steep endothermic) and Sodium Chloride (nearly flat) on the phase chart.',
        completed: false
      }
    ];

    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(eventType, data) {
    for (const listener of this.listeners) {
      try {
        listener(eventType, data, this);
      } catch (err) {
        console.error('State listener error:', err);
      }
    }
  }

  setSalt(saltId) {
    if (this.selectedSalt === saltId) return;
    this.selectedSalt = saltId;
    this.resetBeaker();
    this.notify('salt_change', { saltId });
    if (saltId === 'NaCl') {
      this.completeQuest('q5');
    }
  }

  addSolute(grams) {
    this.soluteAddedG += grams;

    // Spawn falling particles
    const saltData = SOLUBILITY_DATA.salts[this.selectedSalt];
    for (let i = 0; i < 18; i++) {
      this.fallingParticles.push({
        xNorm: 0.38 + Math.random() * 0.24,
        yNorm: 0.20,
        vy: 0.35 + Math.random() * 0.25,
        color: saltData.color,
        radius: 1.5 + Math.random() * 1.5
      });
    }

    this.notify('solute_added', { grams, total: this.soluteAddedG });
    this.checkQuests();
  }

  setHeatingPower(power) {
    this.heatingPower = Math.max(0.0, Math.min(1.0, parseFloat(power) || 0.0));
    if (this.heatingPower > 0) {
      this.coolingActive = false;
    }
    this.notify('heating_change', { power: this.heatingPower });
    this.checkQuests();
  }

  toggleCooling() {
    this.coolingActive = !this.coolingActive;
    if (this.coolingActive) {
      this.heatingPower = 0.0;
    }
    this.notify('cooling_toggle', { cooling: this.coolingActive });
    this.checkQuests();
  }

  addSeedCrystal() {
    this.seedCrystalAdded = true;
    this.notify('seed_added', {});
    this.checkQuests();
  }

  resetBeaker() {
    this.soluteAddedG = 0.0;
    this.temperatureC = 20.0;
    this.heatingPower = 0.0;
    this.coolingActive = false;
    this.seedCrystalAdded = false;
    this.crystalMassFormedG = 0.0;
    this.fallingParticles = [];
    this.sedimentParticles = [];
    this.grownCrystals = [];
    this.notify('reset', {});
  }

  getSolubilityLimit() {
    const salt = SOLUBILITY_DATA.salts[this.selectedSalt];
    return Math.max(0.0, salt.solubility(this.temperatureC));
  }

  getDissolvedMass() {
    return Math.min(this.soluteAddedG, this.getSolubilityLimit());
  }

  getUndissolvedMass() {
    return Math.max(0.0, this.soluteAddedG - this.getSolubilityLimit());
  }

  getSolutionState() {
    const limit = this.getSolubilityLimit();
    if (this.soluteAddedG < limit - 0.5) return 'unsaturated';
    if (Math.abs(this.soluteAddedG - limit) <= 0.5 || this.soluteAddedG > limit) return 'saturated';
    return 'supersaturated';
  }

  completeQuest(questId) {
    const q = this.quests.find(item => item.id === questId);
    if (q && !q.completed) {
      q.completed = true;
      this.notify('quest_completed', { quest: q });
    }
  }

  checkQuests() {
    // Quest 1: Saturation reached with undissolved sediment at 20°C
    if (this.getUndissolvedMass() > 2.0 && this.temperatureC <= 25.0) {
      this.completeQuest('q1');
    }

    // Quest 2: Heat above 50°C and dissolve sediment
    if (this.temperatureC >= 50.0 && this.getUndissolvedMass() < 0.5 && this.soluteAddedG >= 35.0) {
      this.completeQuest('q2');
    }

    // Quest 3: Hot concentrated solution > 70°C with high solute
    if (this.temperatureC >= 70.0 && this.soluteAddedG >= 75.0 && this.selectedSalt === 'KNO3') {
      this.completeQuest('q3');
    }

    // Quest 4: Cool below 30°C and seed crystals
    if (this.temperatureC <= 30.0 && this.seedCrystalAdded && this.crystalMassFormedG >= 10.0) {
      this.completeQuest('q4');
    }
  }
}

window.SolubilityState = SolubilityState;
