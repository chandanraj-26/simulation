/**
 * Thermal Decomposition of Ferrous Sulfate — Reactive Simulation State
 * Manages thermal dynamics, dehydration, crystal color metamorphosis,
 * gas evolution, chemical test strip reactions, and NCERT quests.
 */

class ReactionState {
  constructor() {
    this.flameLevel = 0; // 0 = Off, 1 = Mild (100-300°C), 2 = Strong Roaring (400-650°C)
    this.temperature = 25.0; // Current temperature in °C
    this.dehydrationProgress = 0.0; // 0.0 to 1.0 (FeSO4·7H2O -> FeSO4 + 7H2O)
    this.decompositionProgress = 0.0; // 0.0 to 1.0 (2FeSO4 -> Fe2O3 + SO2 + SO3)

    this.activeTestProbe = 'none'; // 'none' | 'litmus' | 'dichromate'
    this.litmusProgress = 0.0; // 0.0 (blue) to 1.0 (red)
    this.dichromateProgress = 0.0; // 0.0 (orange) to 1.0 (green)

    this.waftingActive = false;
    this.waftingTimer = 0;

    this.initialMass = 2.000; // grams
    this.soundEnabled = true;

    // Condensed water droplets on the upper cooler walls of the boiling tube
    this.waterDroplets = [];
    this.initWaterDroplets();

    // Solid crystal grains sitting in the bottom curved well of the boiling tube
    this.crystalGrains = [];
    this.initCrystalGrains();

    // Gas plume particles
    this.gasParticles = [];

    // 5 NCERT Curriculum Quests
    this.quests = [
      {
        id: 'q1',
        title: 'Hydrated Green Vitriol',
        desc: 'Observe pale green crystalline ferrous sulfate heptahydrate (FeSO₄·7H₂O) before heating.',
        completed: true // Auto-acknowledged on lab entry
      },
      {
        id: 'q2',
        title: 'Water of Crystallization Loss',
        desc: 'Heat with mild flame (~150–250°C) until green crystals turn dirty white and water droplets condense on the tube wall.',
        completed: false
      },
      {
        id: 'q3',
        title: 'Thermal Decomposition & Residue',
        desc: 'Heat strongly (>500°C) to break down FeSO₄ into dark reddish-brown ferric oxide (Fe₂O₃) residue.',
        completed: false
      },
      {
        id: 'q4',
        title: 'Acidic Gas Detection (Litmus Test)',
        desc: 'Hold moist blue litmus paper near the mouth of the tube while gases evolve to observe color change to red.',
        completed: false
      },
      {
        id: 'q5',
        title: 'Laboratory Safety Wafting',
        desc: 'Waft the fumes gently towards the nose using hand motion to observe the suffocating odor of burning sulfur.',
        completed: false
      }
    ];

    this.listeners = [];
  }

  initWaterDroplets() {
    this.waterDroplets = [];
    for (let i = 0; i < 24; i++) {
      this.waterDroplets.push({
        xOffset: -8 + Math.random() * 16,
        yPos: 0.28 + Math.random() * 0.25, // Upper-mid section of boiling tube
        radius: 1.2 + Math.random() * 2.2,
        opacity: 0.0
      });
    }
  }

  initCrystalGrains() {
    this.crystalGrains = [];
    for (let i = 0; i < 45; i++) {
      this.crystalGrains.push({
        rx: (Math.random() - 0.5) * 22,
        ry: Math.random() * 24 - 12,
        size: 3.5 + Math.random() * 3.5,
        angle: Math.random() * Math.PI * 2,
        aspect: 0.7 + Math.random() * 0.6
      });
    }
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
        console.error('Reaction state listener error:', err);
      }
    }
  }

  setFlameLevel(level) {
    if (this.flameLevel === level) return;
    this.flameLevel = level;
    this.notify('flame_change', { level });
  }

  setActiveTestProbe(probeKey) {
    if (this.activeTestProbe === probeKey) {
      this.activeTestProbe = 'none';
    } else {
      this.activeTestProbe = probeKey;
    }
    this.notify('probe_change', { probe: this.activeTestProbe });
  }

  triggerWafting() {
    this.waftingActive = true;
    this.waftingTimer = 2.0; // 2 seconds animation
    this.notify('waft', {});
    if (this.decompositionProgress > 0.1) {
      this.completeQuest('q5');
    }
  }

  resetAll() {
    this.flameLevel = 0;
    this.temperature = 25.0;
    this.dehydrationProgress = 0.0;
    this.decompositionProgress = 0.0;
    this.activeTestProbe = 'none';
    this.litmusProgress = 0.0;
    this.dichromateProgress = 0.0;
    this.waftingActive = false;
    this.waftingTimer = 0;
    this.gasParticles = [];
    this.initWaterDroplets();
    this.initCrystalGrains();
    this.notify('reset', {});
  }

  completeQuest(questId) {
    const q = this.quests.find(item => item.id === questId);
    if (q && !q.completed) {
      q.completed = true;
      this.notify('quest_completed', { quest: q });
    }
  }

  getCurrentStage() {
    if (this.temperature < 100) return REACTION_DATA.stages[0];
    if (this.temperature < 380) return REACTION_DATA.stages[1];
    return REACTION_DATA.stages[2];
  }

  // Calculate current solid composition and masses
  getMassLedger() {
    const balance = REACTION_DATA.calculateMassBalance(this.initialMass);
    const lostWater = balance.waterVapor * this.dehydrationProgress;
    const lostSOx = (balance.so2Gas + balance.so3Gas) * this.decompositionProgress;

    const remainingMass = this.initialMass - lostWater - lostSOx;
    return {
      initialMass: this.initialMass,
      currentMass: Math.max(balance.fe2o3Residue, remainingMass),
      waterEvolved: lostWater,
      so2Evolved: balance.so2Gas * this.decompositionProgress,
      so3Evolved: balance.so3Gas * this.decompositionProgress,
      fe2o3Formed: balance.fe2o3Residue * this.decompositionProgress
    };
  }
}

window.ReactionState = ReactionState;
