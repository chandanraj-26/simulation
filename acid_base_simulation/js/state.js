/**
 * AcidBaseLab — State Management & Reactive Store
 */

class SimulationState {
  constructor() {
    this.mode = 'spot_tubes'; // 'spot_tubes' | 'titration' | 'molecular'
    this.substanceKey = 'lemon';
    this.customPH = 7.0;
    this.indicatorKey = 'universal';
    this.soundEnabled = true;

    // Active tool: 'dropper' | 'blue_litmus' | 'red_litmus' | 'ph_paper' | 'probe'
    this.activeTool = 'dropper';

    // Active selected vessel target: { type: 'tube' | 'well', index: number }
    this.selectedVessel = { type: 'tube', index: 0 };

    // Dropper liquid drops in flight (for spot/tube animations)
    this.dropperDrops = [];

    // Test Tube Rack: 4 glass tubes
    this.testTubes = [
      {
        id: 'tube_0',
        name: 'Tube 1',
        substanceKey: 'hcl',
        customPH: 1.0,
        volume: 15.0, // mL
        indicatorKey: null,
        dropsAdded: 0,
        litmusTested: null,
        colorHex: 'rgba(235, 245, 255, 0.3)',
        liquidHeight: 0.65
      },
      {
        id: 'tube_1',
        name: 'Tube 2',
        substanceKey: 'water',
        customPH: 7.0,
        volume: 15.0,
        indicatorKey: null,
        dropsAdded: 0,
        litmusTested: null,
        colorHex: 'rgba(235, 248, 255, 0.3)',
        liquidHeight: 0.65
      },
      {
        id: 'tube_2',
        name: 'Tube 3',
        substanceKey: 'baking_soda',
        customPH: 8.5,
        volume: 15.0,
        indicatorKey: null,
        dropsAdded: 0,
        litmusTested: null,
        colorHex: 'rgba(240, 248, 255, 0.3)',
        liquidHeight: 0.65
      },
      {
        id: 'tube_3',
        name: 'Tube 4',
        substanceKey: 'naoh_01m',
        customPH: 13.0,
        volume: 15.0,
        indicatorKey: null,
        dropsAdded: 0,
        litmusTested: null,
        colorHex: 'rgba(240, 250, 255, 0.3)',
        liquidHeight: 0.65
      }
    ];

    // Porcelain Spot Plate: 6 wells
    this.spotWells = [
      { id: 'well_0', name: 'Well A', substanceKey: 'lemon', customPH: 2.2, volume: 3.0, indicatorKey: null, dropsAdded: 0, litmusTested: null, colorHex: 'rgba(254, 240, 138, 0.45)' },
      { id: 'well_1', name: 'Well B', substanceKey: 'vinegar', customPH: 2.8, volume: 3.0, indicatorKey: null, dropsAdded: 0, litmusTested: null, colorHex: 'rgba(245, 245, 240, 0.25)' },
      { id: 'well_2', name: 'Well C', substanceKey: 'water', customPH: 7.0, volume: 3.0, indicatorKey: null, dropsAdded: 0, litmusTested: null, colorHex: 'rgba(235, 248, 255, 0.25)' },
      { id: 'well_3', name: 'Well D', substanceKey: 'blood', customPH: 7.4, volume: 3.0, indicatorKey: null, dropsAdded: 0, litmusTested: null, colorHex: 'rgba(254, 205, 211, 0.35)' },
      { id: 'well_4', name: 'Well E', substanceKey: 'ammonia', customPH: 11.5, volume: 3.0, indicatorKey: null, dropsAdded: 0, litmusTested: null, colorHex: 'rgba(230, 245, 255, 0.25)' },
      { id: 'well_5', name: 'Well F', substanceKey: 'mystery_a', customPH: 2.4, volume: 3.0, indicatorKey: null, dropsAdded: 0, litmusTested: null, colorHex: 'rgba(240, 245, 255, 0.25)' }
    ];

    // Tool dragging & apparatus positions
    this.draggedTool = null; // { tool: string, x: number, y: number, isDragging: boolean }
    this.dippedState = {
      isDipped: false,
      targetVessel: null,
      tool: null,
      measuredPH: null,
      stripResultColor: null
    };

    // Digital pH Meter state
    this.digitalProbe = {
      x: 180,
      y: 120,
      isDragging: false,
      readingPH: null,
      activeTarget: null
    };

    // Litmus Paper strips state on lab bench
    this.strips = {
      red_litmus: { x: 70, y: 70, isDipped: false, dippedColor: null, isDragging: false },
      blue_litmus: { x: 110, y: 70, isDipped: false, dippedColor: null, isDragging: false },
      ph_paper: { x: 150, y: 70, isDipped: false, dippedColor: null, isDragging: false }
    };

    // =======================================================================
    // TITRATION SYSTEM STATE
    // =======================================================================
    this.titration = {
      analyteType: 'strong_acid', // 'strong_acid' (0.1M HCl) | 'weak_acid' (0.1M CH3COOH)
      analyteVol: 25.0, // mL
      analyteConc: 0.10, // M
      titrantConc: 0.10, // M (NaOH)
      buretteCapacity: 50.0, // mL
      titrantAdded: 0.0, // mL dispensed
      stopcockState: 'closed', // 'closed' | 'dropwise' | 'streaming'
      indicator: 'phenolphthalein', // 'phenolphthalein' | 'bromothymol_blue' | 'methyl_orange'
      stirrerSpeed: 45, // %
      stirrerAngle: 0,
      stirrerVortexHeight: 0,
      drops: [], // in-flight drops from burette tip to flask
      swirlBlooms: [], // transient color blooms in flask
      history: [{ volume: 0.0, pH: 1.0, color: 'rgba(245, 245, 250, 0.1)' }],
      isNeutralized: false,
      isPastEquivalence: false
    };

    // =======================================================================
    // MOLECULAR EQUILIBRIUM SIMULATOR STATE
    // =======================================================================
    this.molecular = {
      pH: 7.0,
      pKa: 7.0,
      indicatorName: 'Bromothymol Blue',
      acidColorHex: '#facc15',
      baseColorHex: '#1d4ed8',
      particles: [],
      maxParticles: 45,
      flashEvents: []
    };

    // =======================================================================
    // STUDENT QUESTS / MISSIONS
    // =======================================================================
    this.quests = [
      {
        id: 1,
        title: "The Kitchen Detective",
        desc: "Add Red Cabbage indicator to 3 vessels (an Acid, Water, and a Base) to observe the natural anthocyanin chromatic spectrum!",
        stars: 1,
        completed: false,
        check: () => {
          let hasAcid = false;
          let hasWater = false;
          let hasBase = false;
          const allVessels = [...this.testTubes, ...this.spotWells];
          for (const v of allVessels) {
            if (v.indicatorKey === 'red_cabbage' && v.dropsAdded >= 1) {
              const ph = this.getVesselPH(v);
              if (ph < 5.0) hasAcid = true;
              if (Math.abs(ph - 7.0) <= 0.5) hasWater = true;
              if (ph > 8.0) hasBase = true;
            }
          }
          return hasAcid && hasWater && hasBase;
        }
      },
      {
        id: 2,
        title: "Litmus Paper Sleuth",
        desc: "Dip Blue Litmus into an acidic tube (turns Red) and Red Litmus into a basic tube (turns Blue)!",
        stars: 2,
        completed: false,
        state: { blueTurnedRed: false, redTurnedBlue: false },
        check: () => {
          return this.quests[1].state.blueTurnedRed && this.quests[1].state.redTurnedBlue;
        }
      },
      {
        id: 3,
        title: "Dropwise Precision Titration",
        desc: "In Titration Lab, titrate 25 mL HCl using Phenolphthalein. Hit the sharp faint-pink equivalence endpoint (24.8–25.2 mL) without overtitrating (>25.5 mL)!",
        stars: 3,
        completed: false,
        check: () => {
          const v = this.titration.titrantAdded;
          const ind = this.titration.indicator;
          return ind === 'phenolphthalein' && v >= 24.8 && v <= 25.2;
        }
      },
      {
        id: 4,
        title: "Universal pH Match",
        desc: "Test Mystery Liquid A with Universal Indicator or pH Paper, then measure its true pH with the digital probe!",
        stars: 4,
        completed: false,
        state: { testedWithIndicator: false, measuredWithProbe: false },
        check: () => {
          return this.quests[3].state.testedWithIndicator && this.quests[3].state.measuredWithProbe;
        }
      },
      {
        id: 5,
        title: "Indicator Selection Master",
        desc: "Switch Titration to Weak Acid (Acetic Acid). Titrate to endpoint with Phenolphthalein (matches alkaline equivalence pH ~8.7)!",
        stars: 5,
        completed: false,
        check: () => {
          return this.titration.analyteType === 'weak_acid' &&
                 this.titration.indicator === 'phenolphthalein' &&
                 this.titration.titrantAdded >= 24.7 &&
                 this.titration.titrantAdded <= 25.3;
        }
      }
    ];

    // Lab Observation Notebook
    this.labLogs = [];

    // Confetti explosion particles
    this.confetti = [];
  }

  getVesselPH(vessel) {
    if (vessel.substanceKey === 'custom') {
      return vessel.customPH !== undefined ? vessel.customPH : this.customPH;
    }
    const sub = Chemistry.substances[vessel.substanceKey];
    return sub ? sub.defaultPH : 7.0;
  }

  getVesselBaseColor(vessel) {
    const sub = Chemistry.substances[vessel.substanceKey];
    return sub ? sub.colorBase : 'rgba(235, 245, 255, 0.3)';
  }

  // Update a vessel with added indicator drops
  addIndicatorToVessel(vessel, indicatorKey, numDrops = 1) {
    vessel.indicatorKey = indicatorKey;
    vessel.dropsAdded = (vessel.dropsAdded || 0) + numDrops;

    const ph = this.getVesselPH(vessel);
    const indColor = Chemistry.getIndicatorColor(indicatorKey, ph);

    // Color intensity increases with drops (up to 3 drops)
    const factor = Math.min(1.0, 0.4 + vessel.dropsAdded * 0.25);
    vessel.colorHex = `rgba(${indColor.r}, ${indColor.g}, ${indColor.b}, ${Math.min(0.9, indColor.a * factor)})`;

    // Quest check
    this.checkQuests();

    return vessel;
  }

  // Set substance for a vessel
  setVesselSubstance(vessel, substanceKey, customPH = null) {
    vessel.substanceKey = substanceKey;
    if (customPH !== null) vessel.customPH = customPH;
    vessel.indicatorKey = null;
    vessel.dropsAdded = 0;
    vessel.litmusTested = null;
    vessel.colorHex = this.getVesselBaseColor(vessel);
  }

  // Clear / Rinse all vessels
  rinseAllVessels() {
    this.testTubes.forEach((t, idx) => {
      t.indicatorKey = null;
      t.dropsAdded = 0;
      t.litmusTested = null;
      t.colorHex = this.getVesselBaseColor(t);
    });
    this.spotWells.forEach((w, idx) => {
      w.indicatorKey = null;
      w.dropsAdded = 0;
      w.litmusTested = null;
      w.colorHex = this.getVesselBaseColor(w);
    });
    this.strips.red_litmus.isDipped = false;
    this.strips.red_litmus.dippedColor = null;
    this.strips.blue_litmus.isDipped = false;
    this.strips.blue_litmus.dippedColor = null;
    this.strips.ph_paper.isDipped = false;
    this.strips.ph_paper.dippedColor = null;
  }

  // Add observation log entry
  logObservation(entry) {
    this.labLogs.unshift({
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      mode: this.mode,
      sample: entry.sample || 'Custom Sample',
      test: entry.test || 'General Test',
      indicator: entry.indicator || 'None',
      pH: entry.pH !== undefined ? entry.pH.toFixed(2) : '--',
      observation: entry.observation || 'No details'
    });
  }

  // Validate student quests
  checkQuests() {
    this.quests.forEach(q => {
      if (!q.completed && q.check()) {
        q.completed = true;
        this.triggerConfetti();
        if (window.soundEngine) {
          window.soundEngine.playSuccessFanfare();
        }
        if (window.AcidBaseUI && window.AcidBaseUI.showToast) {
          window.AcidBaseUI.showToast(`⭐ Quest Complete: "${q.title}"!`, 'success');
        }
      }
    });
  }

  triggerConfetti() {
    this.confetti = [];
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#eab308'];
    for (let i = 0; i < 90; i++) {
      this.confetti.push({
        x: Math.random() * 800 + 100,
        y: Math.random() * 200 + 50,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * -6 - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 7 + 4,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2,
        life: 1.0
      });
    }
  }
}

window.simState = new SimulationState();
