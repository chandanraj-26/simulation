/**
 * OsmosisLab — State Management & Reactive Store
 */

class SimulationState {
  constructor() {
    this.mode = 'plant'; // 'plant' | 'rbc' | 'utube' | 'aquaporin'

    // External beaker solution concentration (% w/v)
    this.extSolutePercent = 2.0; // 0% to 10%
    this.simSpeed = 1.0;
    this.isPaused = false;

    // Smooth dynamic state (lerped towards target equilibrium)
    this.currentVol = 1.0; // 1.0 = normal isotonic baseline
    this.isRbcLysed = false;
    this.burstEffectTimer = 0;

    // U-Tube Osmometer state
    this.uTubeConcLeft = 1.0;  // %
    this.uTubeConcRight = 6.0; // %
    this.uTubeLevelDiff = 0.0; // cm

    // Visual options
    this.showWaterFlow = true;
    this.showMolecules = true;
    this.showOrganelles = true;
    this.showWaterPotential = true;

    // Animated molecular particles
    this.waterMolecules = [];
    this.soluteMolecules = [];
    this.lysisParticles = [];

    // Quests
    this.quests = [
      {
        id: 1,
        title: "The Turgid Guardian",
        desc: "Place the plant cell in 0% pure distilled water. Observe water intake expand the vacuole and maximize turgor pressure (~0.8 MPa) without bursting!",
        stars: 1,
        completed: false,
        check: () => {
          return this.mode === 'plant' && this.extSolutePercent <= 0.1 && this.currentVol >= 1.06;
        }
      },
      {
        id: 2,
        title: "Clinical Hemolysis Pop",
        desc: "Switch to Red Blood Cell (RBC) and drop external solute to ≤ 0.2%. Notice the lack of a cell wall causes osmotic lysis (membrane rupture)!",
        stars: 2,
        completed: false,
        check: () => {
          return this.mode === 'rbc' && this.extSolutePercent <= 0.2 && this.isRbcLysed;
        }
      },
      {
        id: 3,
        title: "Onion Cell Plasmolysis",
        desc: "Bathe the plant cell in hypertonic salt solution (≥ 7.0%). Watch the protoplast detach and shrink away from the rigid cellulose cell wall!",
        stars: 3,
        completed: false,
        check: () => {
          return this.mode === 'plant' && this.extSolutePercent >= 7.0 && this.currentVol <= 0.65;
        }
      },
      {
        id: 4,
        title: "Deplasmolysis Revival",
        desc: "After plasmolysing the plant cell, return it to 0% pure distilled water and watch deplasmolysis restore the protoplast to full turgor!",
        stars: 4,
        completed: false,
        state: { wasPlasmolysed: false },
        check: () => {
          if (this.mode === 'plant' && this.currentVol <= 0.65) {
            this.quests[3].state.wasPlasmolysed = true;
          }
          if (this.quests[3].state.wasPlasmolysed && this.extSolutePercent <= 0.5 && this.currentVol >= 1.02) {
            return true;
          }
          return false;
        }
      },
      {
        id: 5,
        title: "U-Tube Osmotic Column",
        desc: "Switch to U-Tube Osmometer. Set Right arm concentration to ≥ 6.0% and Left to 0.0% to observe the osmotic water head rise ≥ 18 cm!",
        stars: 5,
        completed: false,
        check: () => {
          return this.mode === 'utube' && this.uTubeConcLeft <= 0.5 && this.uTubeConcRight >= 6.0;
        }
      }
    ];

    this.initMolecules();
  }

  initMolecules() {
    this.waterMolecules = [];
    this.soluteMolecules = [];

    // Initialize 60 water molecules
    for (let i = 0; i < 65; i++) {
      this.waterMolecules.push({
        x: Math.random() * 400 - 200,
        y: Math.random() * 300 - 150,
        vx: (Math.random() - 0.5) * 45,
        vy: (Math.random() - 0.5) * 45,
        size: 3.5
      });
    }

    // Initialize solute molecules proportional to concentration
    const count = Math.round(this.extSolutePercent * 8);
    for (let i = 0; i < count; i++) {
      this.soluteMolecules.push({
        x: Math.random() * 400 - 200,
        y: Math.random() * 300 - 150,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        size: 8
      });
    }
  }

  setSolutePercent(val) {
    this.extSolutePercent = Math.max(0.0, Math.min(10.0, val));
    if (this.mode === 'rbc' && this.extSolutePercent > 0.4) {
      this.isRbcLysed = false; // Reset lysed state if restored to physiological
    }
    this.initMolecules();
    this.checkQuests();
  }

  addDistilledWater() {
    this.setSolutePercent(Math.max(0.0, this.extSolutePercent - 1.5));
    if (window.soundEngine) window.soundEngine.playDroplet();
  }

  addSoluteSalt() {
    this.setSolutePercent(Math.min(10.0, this.extSolutePercent + 1.5));
    if (window.soundEngine) window.soundEngine.playSaltShaker();
  }

  resetSpecimen() {
    if (this.mode === 'plant') {
      this.setSolutePercent(2.0);
    } else if (this.mode === 'rbc') {
      this.setSolutePercent(0.9);
      this.isRbcLysed = false;
    } else if (this.mode === 'utube') {
      this.uTubeConcLeft = 1.0;
      this.uTubeConcRight = 6.0;
    }
    this.currentVol = 1.0;
    if (window.soundEngine) window.soundEngine.playClick();
  }

  checkQuests() {
    this.quests.forEach(q => {
      if (!q.completed && q.check()) {
        q.completed = true;
        if (window.soundEngine) window.soundEngine.playSuccessFanfare();
        if (window.osmosisUI && window.osmosisUI.showToast) {
          window.osmosisUI.showToast(`⭐ Quest Complete: "${q.title}"!`, 'success');
        }
      }
    });
  }
}

window.simState = new SimulationState();
