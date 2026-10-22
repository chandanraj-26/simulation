/**
 * Law of Conservation of Mass — Central Simulation State
 * Manages apparatus tare, tilting dynamics, solution mixing,
 * precipitate formation, corked vs uncorked gas loss, and NCERT quests.
 */

class MassState {
  constructor() {
    this.currentSystemId = 'barium_sodium';
    this.isCorked = true;
    this.isTilted = false;
    this.tiltAngle = 0.0; // Current tilt radians
    this.mixed = false;
    this.reactionProgress = 0.0; // 0.0 to 1.0
    this.isTared = false;
    this.tareOffset = 0.0;
    this.soundEnabled = true;

    // Escaped gas mass if uncorked in gas system
    this.escapedGasG = 0.0;

    // Visual particles
    this.particles = [];

    // Quests for Class 9 NCERT Activity 3.1
    this.quests = [
      {
        id: 'q1',
        title: 'Weigh Initial Reactants',
        desc: 'Place the sealed conical flask with the suspended ignition tube on the digital balance and note mass m₁.',
        completed: false
      },
      {
        id: 'q2',
        title: 'Tilt & Mix Solutions',
        desc: 'Tilt the flask to spill the ignition tube contents into the flask and observe the milky white BaSO₄ precipitate.',
        completed: false
      },
      {
        id: 'q3',
        title: 'Verify Mass Invariance',
        desc: 'Re-weigh the flask after precipitation and confirm that m₂ = m₁ (Mass is conserved: Δm = 0.000 g).',
        completed: false
      },
      {
        id: 'q4',
        title: 'Golden Rain Reaction',
        desc: 'Switch to Lead Nitrate + KI and observe brilliant canary yellow PbI₂ precipitate with zero mass change.',
        completed: false
      },
      {
        id: 'q5',
        title: 'The Closed System Law',
        desc: 'Test Calcium Carbonate + Acid with the cork REMOVED to demonstrate mass loss caused by escaping CO₂ gas.',
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

  setSystem(systemId) {
    if (this.currentSystemId === systemId) return;
    this.currentSystemId = systemId;
    this.resetApparatus();
    this.notify('system_change', { systemId });
  }

  toggleCork() {
    this.isCorked = !this.isCorked;
    this.notify('cork_toggle', { isCorked: this.isCorked });
    this.checkQuests();
  }

  tiltFlask() {
    if (this.mixed) return;
    this.isTilted = true;
    this.notify('tilt_start', {});
  }

  tareScale() {
    if (this.isTared) {
      this.tareOffset = 0.0;
      this.isTared = false;
    } else {
      this.tareOffset = this.getRawMass();
      this.isTared = true;
    }
    this.notify('tare', { isTared: this.isTared });
  }

  resetApparatus() {
    this.isTilted = false;
    this.tiltAngle = 0.0;
    this.mixed = false;
    this.reactionProgress = 0.0;
    this.escapedGasG = 0.0;
    this.particles = [];
    this.notify('reset', {});
  }

  getRawMass() {
    const sys = MASS_DATA.systems[this.currentSystemId];
    let mass = MASS_DATA.tareWeights.conicalFlask +
               MASS_DATA.tareWeights.ignitionTube +
               MASS_DATA.tareWeights.thread +
               sys.solutionFlask.massG +
               sys.solutionTube.massG;

    if (this.isCorked) {
      mass += MASS_DATA.tareWeights.rubberCork;
    }

    // Deduct gas loss if uncorked and reaction occurred in gas system
    if (!this.isCorked && sys.gasEvolved) {
      mass -= this.escapedGasG;
    }

    return mass;
  }

  getDisplayMass() {
    return Math.max(0.0, this.getRawMass() - this.tareOffset);
  }

  completeQuest(questId) {
    const q = this.quests.find(item => item.id === questId);
    if (q && !q.completed) {
      q.completed = true;
      this.notify('quest_completed', { quest: q });
    }
  }

  checkQuests() {
    // Quest 1: Initial mass noted
    if (this.isCorked && !this.mixed) {
      this.completeQuest('q1');
    }

    // Quest 2: Barium Sulfate mixed
    if (this.currentSystemId === 'barium_sodium' && this.mixed && this.reactionProgress > 0.6) {
      this.completeQuest('q2');
    }

    // Quest 3: Mass invariant m2 = m1
    if (this.currentSystemId === 'barium_sodium' && this.mixed && this.reactionProgress >= 1.0 && this.isCorked) {
      this.completeQuest('q3');
    }

    // Quest 4: Lead Nitrate + KI mixed
    if (this.currentSystemId === 'lead_potassium' && this.mixed && this.reactionProgress > 0.6) {
      this.completeQuest('q4');
    }

    // Quest 5: Uncorked CaCO3 with mass loss
    if (this.currentSystemId === 'calcium_acid' && this.mixed && !this.isCorked && this.escapedGasG >= 0.2) {
      this.completeQuest('q5');
    }
  }
}

window.MassState = MassState;
