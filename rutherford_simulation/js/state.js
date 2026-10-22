/**
 * Rutherford Alpha Scattering — Central Simulation State
 * Reactive state container managing beam state, view modes,
 * Thomson vs. Rutherford atomic models, detector rotation, and NCERT quests.
 */

class RutherfordState {
  constructor() {
    this.viewMode = 'macro_bench'; // 'macro_bench' | 'micro_nuclear'
    this.model = 'rutherford'; // 'rutherford' | 'thomson'
    this.targetMetal = 'Au'; // 'Au' | 'Ag' | 'Cu' | 'Al'
    this.beamActive = true;
    this.beamRate = 6; // Particles spawned per frame tick
    this.detectorAngleDeg = 0.0; // Angle of movable ZnS microscope
    this.detectorAperture = 16.0; // Degrees detection arc width
    this.soundEnabled = true;

    // Active particle systems
    this.alphas = [];
    this.scintillations = [];

    // Telemetry Statistics
    this.totalCount = 0;
    this.undeflectedCount = 0; // theta < 5 deg
    this.deflectedCount = 0;   // 5 deg <= theta < 90 deg
    this.backscatteredCount = 0; // theta >= 90 deg

    // 18 Angular histogram bins (0-10, 10-20, ... 170-180 deg)
    this.histogram = new Array(18).fill(0);

    // Quests for Class 9 NCERT Chapter 4
    this.quests = [
      {
        id: 'q1',
        title: 'Empty Space Proof',
        desc: 'Fire the alpha particle beam through the gold foil and confirm > 98% pass straight undeflected (θ < 5°).',
        completed: false
      },
      {
        id: 'q2',
        title: 'Detect Deflected Particles',
        desc: 'Rotate the movable ZnS detector to an angle θ ≥ 25° and detect scintillations from deflected alpha particles.',
        completed: false
      },
      {
        id: 'q3',
        title: 'Detect Rare Backscattering',
        desc: 'Observe a rare alpha particle rebounding backwards at θ ≥ 90° due to direct Coulomb nuclear collision.',
        completed: false
      },
      {
        id: 'q4',
        title: 'Thomson Model Comparison',
        desc: 'Switch to J.J. Thomson’s Plum Pudding model and verify that deflections never exceed 1° in diffuse positive charge.',
        completed: false
      },
      {
        id: 'q5',
        title: 'Nuclear Scale Discovery',
        desc: 'Switch to Microscopic Nuclear View and examine how a nucleus of 10⁻¹⁴ m sits inside an atom of 10⁻¹⁰ m.',
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

  setViewMode(mode) {
    if (this.viewMode === mode) return;
    this.viewMode = mode;
    this.alphas = [];
    this.notify('view_mode_change', { mode });
    if (mode === 'micro_nuclear') {
      this.completeQuest('q5');
    }
  }

  setModel(model) {
    if (this.model === model) return;
    this.model = model;
    this.alphas = [];
    this.notify('model_change', { model });
    if (model === 'thomson') {
      this.completeQuest('q4');
    }
  }

  setTargetMetal(metalKey) {
    if (this.targetMetal === metalKey) return;
    this.targetMetal = metalKey;
    this.notify('target_metal_change', { metal: metalKey });
  }

  setDetectorAngle(deg) {
    this.detectorAngleDeg = Math.max(-180, Math.min(180, parseFloat(deg) || 0));
    this.notify('detector_angle_change', { angle: this.detectorAngleDeg });
    this.checkQuests();
  }

  toggleBeam() {
    this.beamActive = !this.beamActive;
    this.notify('beam_toggle', { active: this.beamActive });
  }

  resetStats() {
    this.totalCount = 0;
    this.undeflectedCount = 0;
    this.deflectedCount = 0;
    this.backscatteredCount = 0;
    this.histogram.fill(0);
    this.alphas = [];
    this.scintillations = [];
    this.notify('reset', {});
  }

  recordScattering(thetaDeg) {
    this.totalCount++;
    const absTheta = Math.abs(thetaDeg);

    if (absTheta < 5.0) {
      this.undeflectedCount++;
    } else if (absTheta < 90.0) {
      this.deflectedCount++;
    } else {
      this.backscatteredCount++;
      this.completeQuest('q3');
    }

    const binIdx = Math.min(17, Math.floor(absTheta / 10.0));
    this.histogram[binIdx]++;

    this.checkQuests();
  }

  completeQuest(questId) {
    const q = this.quests.find(item => item.id === questId);
    if (q && !q.completed) {
      q.completed = true;
      this.notify('quest_completed', { quest: q });
    }
  }

  checkQuests() {
    // Quest 1: > 100 particles with > 95% undeflected
    if (this.totalCount > 80 && (this.undeflectedCount / this.totalCount) > 0.90) {
      this.completeQuest('q1');
    }

    // Quest 2: Detector rotated to >= 25 deg and detected count
    if (Math.abs(this.detectorAngleDeg) >= 25.0 && this.deflectedCount > 5) {
      this.completeQuest('q2');
    }
  }
}

window.RutherfordState = RutherfordState;
