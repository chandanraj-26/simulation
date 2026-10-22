/**
 * Tyndall Effect & Colloidal Scattering — Central Simulation State
 * Reactive state container managing laser optics, wavelength dispersion,
 * Brownian motion simulation, suspension settling, and NCERT quests.
 */

class TyndallState {
  constructor() {
    this.viewMode = 'bench'; // 'bench' | 'brownian_microscope' | 'filtration'
    this.laserActive = true;
    this.laserColor = 'red'; // 'red' | 'green' | 'blue'
    this.selectedBeaker = 'colloid'; // 'true_solution' | 'colloid' | 'suspension'
    this.suspensionSettled = 0.0; // 0.0 (freshly stirred) to 1.0 (fully settled)
    this.filtrationActive = false;
    this.soundEnabled = true;

    // Brownian Motion Particles for Microscope Mode
    this.brownianParticles = [];
    this.initBrownianParticles();

    // Suspension Particles for Bench Mode
    this.suspensionParticles = [];
    this.initSuspensionParticles();

    // Quests for Class 9 NCERT Activity 2.1 & 2.2
    this.quests = [
      {
        id: 'q1',
        title: 'Invisible Beam in True Solution',
        desc: 'Observe that the laser beam path is completely invisible inside the True Solution (< 1 nm solute).',
        completed: false
      },
      {
        id: 'q2',
        title: 'Luminous Tyndall Cone',
        desc: 'Observe the bright, luminous scattering cone illuminating the colloidal milk/starch sol (1–1000 nm).',
        completed: false
      },
      {
        id: 'q3',
        title: 'Wavelength Scattering Law',
        desc: 'Switch the laser from Red (650 nm) to Blue (405 nm) to observe higher scattering intensity (I ∝ 1/λ⁴).',
        completed: false
      },
      {
        id: 'q4',
        title: 'Brownian Zigzag Motion',
        desc: 'Switch to Ultramicroscope View and watch colloidal particles undergoing erratic thermal molecular bombardment.',
        completed: false
      },
      {
        id: 'q5',
        title: 'Filtration Separation',
        desc: 'Switch to Filtration View to verify that suspension particles are retained on filter paper while colloids pass through.',
        completed: false
      }
    ];

    this.listeners = [];
  }

  initBrownianParticles() {
    this.brownianParticles = [];
    for (let i = 0; i < 35; i++) {
      this.brownianParticles.push({
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        vx: (Math.random() - 0.5) * 45,
        vy: (Math.random() - 0.5) * 45,
        radius: 3.5 + Math.random() * 3.5,
        trail: []
      });
    }
  }

  initSuspensionParticles() {
    this.suspensionParticles = [];
    for (let i = 0; i < 40; i++) {
      this.suspensionParticles.push({
        xNorm: 0.15 + Math.random() * 0.70,
        yNorm: 0.35 + Math.random() * 0.50,
        radius: 2.0 + Math.random() * 2.5,
        vy: 0.04 + Math.random() * 0.05
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
        console.error('State listener error:', err);
      }
    }
  }

  setViewMode(mode) {
    if (this.viewMode === mode) return;
    this.viewMode = mode;
    this.notify('view_mode_change', { mode });
    if (mode === 'brownian_microscope') {
      this.completeQuest('q4');
    } else if (mode === 'filtration') {
      this.completeQuest('q5');
    }
  }

  setLaserActive(active) {
    this.laserActive = active;
    this.notify('laser_toggle', { active });
    this.checkQuests();
  }

  setLaserColor(colorKey) {
    if (this.laserColor === colorKey) return;
    this.laserColor = colorKey;
    this.notify('laser_color_change', { color: colorKey });
    if (colorKey === 'blue') {
      this.completeQuest('q3');
    }
    this.checkQuests();
  }

  selectBeaker(beakerId) {
    this.selectedBeaker = beakerId;
    this.notify('beaker_select', { beakerId });
  }

  stirSuspension() {
    this.suspensionSettled = 0.0;
    this.initSuspensionParticles();
    this.notify('stir', {});
  }

  resetAll() {
    this.laserActive = true;
    this.laserColor = 'red';
    this.selectedBeaker = 'colloid';
    this.suspensionSettled = 0.0;
    this.initBrownianParticles();
    this.initSuspensionParticles();
    this.notify('reset', {});
  }

  getScatteringIntensity(beakerId) {
    if (!this.laserActive) return 0.0;
    const beaker = TYNDALL_DATA.beakers[beakerId];
    const laser = TYNDALL_DATA.lasers[this.laserColor];

    if (!beaker.tyndallEffect) return 0.0; // True solution = 0
    if (beakerId === 'colloid') {
      return beaker.tyndallScatteringRatio * laser.scatteringFactor;
    }
    // Suspension: scattering decreases as it settles
    const turbidity = 1.0 - this.suspensionSettled * 0.65;
    return beaker.tyndallScatteringRatio * turbidity * laser.scatteringFactor;
  }

  completeQuest(questId) {
    const q = this.quests.find(item => item.id === questId);
    if (q && !q.completed) {
      q.completed = true;
      this.notify('quest_completed', { quest: q });
    }
  }

  checkQuests() {
    if (this.laserActive) {
      this.completeQuest('q1');
      this.completeQuest('q2');
    }
  }
}

window.TyndallState = TyndallState;
