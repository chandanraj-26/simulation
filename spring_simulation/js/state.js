/**
 * SpringLab — State Management & Reactive Store
 */

class SimulationState {
  constructor() {
    this.mode = 'single'; // 'single' | 'series' | 'parallel' | 'mystery'

    // Spring Constants (N/m)
    this.k1 = 50.0;
    this.k2 = 50.0;
    this.unstretchedLength = 0.22; // meters (22 cm)

    // Gravity
    this.gravityKey = 'earth';

    // Damping (N·s/m)
    this.damping = 0.20; // light underdamped oscillation
    this.simSpeed = 1.0;
    this.isPaused = false;

    // Physical Oscillator State (downwards positive from unstretched L0)
    this.x = 0.0; // elongation (m)
    this.v = 0.0; // velocity (m/s)
    this.a = 0.0; // acceleration (m/s^2)

    // Attached Weights on the Spring Hook
    this.attachedWeights = [
      { id: 'w_250g', name: '250 g Brass Disc', mass: 0.25, color: '#b45309', type: 'disc' }
    ];

    // Weights available on laboratory bench tray
    this.benchWeights = [
      { id: 'w_50g', name: '50 g Disc', mass: 0.05, color: '#f59e0b', type: 'disc' },
      { id: 'w_100g', name: '100 g Disc', mass: 0.10, color: '#d97706', type: 'disc' },
      { id: 'w_250g_2', name: '250 g Disc', mass: 0.25, color: '#b45309', type: 'disc' },
      { id: 'w_500g', name: '500 g Cylinder', mass: 0.50, color: '#92400e', type: 'cylinder' },
      { id: 'w_1000g', name: '1000 g Block', mass: 1.00, color: '#334155', type: 'block' },
      { id: 'w_crown', name: 'Golden Crown', mass: 0.38, color: '#fbbf24', type: 'crown', isMystery: true },
      { id: 'w_crystal', name: 'Quartz Gem', mass: 0.18, color: '#a855f7', type: 'crystal', isMystery: true },
      { id: 'w_wooden', name: 'Wood Block', mass: 0.08, color: '#78350f', type: 'wood', isMystery: true }
    ];

    // Active drag / interaction state
    this.isDraggingMass = false;
    this.dragStartY = 0;
    this.dragStartElongation = 0;

    // Dragging an unattached weight from tray to hook
    this.draggedTrayWeight = null;
    this.draggedPointerPos = { x: 0, y: 0 };

    // Reference Line Displays
    this.showUnstretchedLine = true;
    this.showEquilibriumLine = true;
    this.showExtremeLine = true;
    this.showRuler = true;
    this.showForceVectors = true;
    this.showEnergyChart = true;
    this.showTraceGraph = true;

    // Real-Time Displacement History (for graph)
    this.traceHistory = [];
    this.maxTracePoints = 250;

    // Digital Stopwatch & Period Photogate
    this.stopwatch = {
      running: false,
      startTime: 0,
      elapsed: 0,
      lastCrossingTime: null,
      measuredPeriod: null,
      crossingCount: 0
    };

    // Quests
    this.quests = [
      {
        id: 1,
        title: "Hooke's Proportionality",
        desc: "Attach 250 g, then 500 g to the single spring (k = 50 N/m). Observe the static elongation double from ~4.9 cm to ~9.8 cm!",
        stars: 1,
        completed: false,
        state: { saw250: false, saw500: false },
        check: () => {
          const m = this.getTotalMass();
          if (this.mode === 'single' && Math.abs(this.k1 - 50) <= 2) {
            if (Math.abs(m - 0.25) < 0.01) this.quests[0].state.saw250 = true;
            if (Math.abs(m - 0.50) < 0.01) this.quests[0].state.saw500 = true;
            return this.quests[0].state.saw250 && this.quests[0].state.saw500;
          }
          return false;
        }
      },
      {
        id: 2,
        title: "Parallel Double Stiffness",
        desc: "Switch to Parallel Springs mode (k1 = k2 = 50 N/m). Observe the effective spring constant double to 100 N/m and elongation halve!",
        stars: 2,
        completed: false,
        check: () => {
          return this.mode === 'parallel' && this.getEffectiveK() >= 95;
        }
      },
      {
        id: 3,
        title: "Series Flexibility",
        desc: "Switch to Series Springs mode (k1 = k2 = 50 N/m). Notice the effective stiffness drops to 25 N/m and elongation doubles!",
        stars: 3,
        completed: false,
        check: () => {
          return this.mode === 'series' && Math.abs(this.getEffectiveK() - 25.0) <= 2;
        }
      },
      {
        id: 4,
        title: "Mystery Crown Appraiser",
        desc: "Drag the Royal Golden Crown onto the spring. Read the equilibrium extension (cm) and determine its mass using m = k·Δx / g!",
        stars: 4,
        completed: false,
        check: () => {
          return this.attachedWeights.some(w => w.id === 'w_crown');
        }
      },
      {
        id: 5,
        title: "Zero-G Orbital Oscillation",
        desc: "Switch environment to Zero-G (g = 0). Pull the mass downwards and release it to observe pure harmonic vibration around x = 0!",
        stars: 5,
        completed: false,
        check: () => {
          return this.gravityKey === 'zerog' && Math.abs(this.v) > 0.1;
        }
      }
    ];

    // Initialize initial static equilibrium elongation
    this.resetToEquilibrium();
  }

  getGravity() {
    const env = Physics.environments[this.gravityKey];
    return env ? env.g : 9.81;
  }

  getEffectiveK() {
    return Physics.getEffectiveK(this.mode, this.k1, this.k2);
  }

  getTotalMass() {
    return this.attachedWeights.reduce((sum, w) => sum + w.mass, 0);
  }

  getEquilibriumElongation() {
    const m = this.getTotalMass();
    const k = this.getEffectiveK();
    const g = this.getGravity();
    return Physics.calculateEquilibrium(m, k, g);
  }

  resetToEquilibrium() {
    const xEq = this.getEquilibriumElongation();
    this.x = xEq;
    this.v = 0.0;
    this.a = 0.0;
  }

  attachWeight(weight) {
    this.attachedWeights.push(weight);
    if (window.soundEngine) window.soundEngine.playHookClink();
    this.checkQuests();
  }

  removeWeight(weightId) {
    const idx = this.attachedWeights.findIndex(w => w.id === weightId);
    if (idx !== -1) {
      const removed = this.attachedWeights.splice(idx, 1)[0];
      if (window.soundEngine) window.soundEngine.playWeightDrop();
      return removed;
    }
    return null;
  }

  clearAttachedWeights() {
    this.attachedWeights = [];
    if (window.soundEngine) window.soundEngine.playWeightDrop();
    this.resetToEquilibrium();
  }

  checkQuests() {
    this.quests.forEach(q => {
      if (!q.completed && q.check()) {
        q.completed = true;
        if (window.soundEngine) window.soundEngine.playSuccessFanfare();
        if (window.springUI && window.springUI.showToast) {
          window.springUI.showToast(`⭐ Quest Complete: "${q.title}"!`, 'success');
        }
      }
    });
  }
}

window.simState = new SimulationState();
