/**
 * CoasterLab — Reactive Simulation State, Presets & Gamified Quests
 */

class SimulationState {
  constructor() {
    // Mode
    this.loopType = 'circular'; // 'circular' | 'clothoid'
    this.status = 'IDLE'; // 'IDLE' | 'RUNNING' | 'PAUSED' | 'FALLING' | 'CRASHED' | 'FINISHED'

    // Physics Parameters
    this.h0 = 40.0;            // Initial drop height (m)
    this.loopRadius = 10.0;    // Loop radius R (m)
    this.mass = 500;           // Cart mass (kg)
    this.simSpeed = 1.0;       // Speed multiplier (0.25x to 3.0x)
    this.friction = 0.0;       // Kinetic friction coefficient mu_k
    this.isFrictionEnabled = false;

    // Cart Dynamic State
    this.s = 0.0;              // Current arc distance along track (m)
    this.x = 0.0;              // Current X coordinate (m)
    this.y = this.h0;          // Current Y coordinate (m)
    this.vx = 0.0;             // Velocity X (m/s)
    this.vy = 0.0;             // Velocity Y (m/s)
    this.v = 0.0;              // Scalar speed (m/s)
    this.angle = 0.0;          // Heading angle (rad)
    this.tumbleSpeed = 0.0;    // Angular velocity when falling (rad/s)
    this.normalForce = 0.0;    // Normal contact force (N)
    this.gForce = 1.0;         // Felt G-force (Gs)
    this.maxGForce = 1.0;      // Peak G-force in current run

    // Energy Accounting (Joules)
    this.initialEnergy = Physics.getPotentialEnergy(this.mass, this.h0);
    this.totalEnergy = this.initialEnergy;
    this.pe = this.initialEnergy;
    this.ke = 0.0;
    this.frictionLoss = 0.0;

    // Detach and Fail Details
    this.detachPoint = null;
    this.fallTrail = [];
    this.crashTime = 0;

    // Visual Overlays
    this.showVelocityVector = true;
    this.showForceVectors = true;
    this.showEnergyBars = true;
    this.showSpeedTrail = true;
    this.trail = [];
    this.maxTrailPoints = 80;

    // Audio Mute State
    this.isAudioMuted = false;

    // Gamification Quests (5 progressive STEM challenges)
    this.quests = [
      {
        id: 1,
        title: "First Ride!",
        desc: "Complete a full coaster run from the top hill all the way to the finish brake track.",
        stars: 1,
        completed: false,
        check: () => {
          return this.status === 'FINISHED';
        }
      },
      {
        id: 2,
        title: "The 2.5R Rule",
        desc: "Set release height h₀ = 2.5 × R (e.g., 25 m for a 10 m loop). Observe N drop to near-zero at the apex without detaching!",
        stars: 2,
        completed: false,
        check: () => {
          const ratio = this.h0 / this.loopRadius;
          return Math.abs(ratio - 2.5) < 0.15 && this.status === 'FINISHED';
        }
      },
      {
        id: 3,
        title: "Mass Independence Law",
        desc: "Test the coaster with a light cart (≤ 250 kg) and a heavy cart (≥ 1200 kg). Verify both reach identical top speeds!",
        stars: 3,
        completed: false,
        state: { sawLight: false, sawHeavy: false },
        check: () => {
          if (this.status === 'FINISHED' || this.s > 80) {
            if (this.mass <= 250) this.quests[2].state.sawLight = true;
            if (this.mass >= 1200) this.quests[2].state.sawHeavy = true;
          }
          return this.quests[2].state.sawLight && this.quests[2].state.sawHeavy;
        }
      },
      {
        id: 4,
        title: "Friction Derailment",
        desc: "Enable friction (μ ≥ 0.03) with a release height of 28 m on a 10 m loop. Watch energy dissipation cause the cart to detach and tumble!",
        stars: 4,
        completed: false,
        check: () => {
          return this.isFrictionEnabled && this.friction >= 0.025 && this.status === 'CRASHED';
        }
      },
      {
        id: 5,
        title: "Clothoid Engineer",
        desc: "Switch to the Teardrop (Clothoid) Loop and run at h₀ = 45 m. Verify peak G-forces remain comfortably lower than in a circular loop!",
        stars: 5,
        completed: false,
        check: () => {
          return this.loopType === 'clothoid' && this.h0 >= 40 && this.status === 'FINISHED';
        }
      }
    ];

    // Presets definitions
    this.presets = {
      safe: {
        name: "Safe Run",
        h0: 40.0,
        loopRadius: 10.0,
        friction: 0.0,
        isFrictionEnabled: false,
        loopType: 'circular'
      },
      barely: {
        name: "Barely Makes It",
        h0: 25.0,
        loopRadius: 10.0,
        friction: 0.0,
        isFrictionEnabled: false,
        loopType: 'circular'
      },
      fail: {
        name: "Fail Preset",
        h0: 20.0,
        loopRadius: 10.0,
        friction: 0.0,
        isFrictionEnabled: false,
        loopType: 'circular'
      }
    };
  }

  getMinHeight() {
    return 2.5 * this.loopRadius;
  }

  resetToTop(track) {
    this.status = 'IDLE';
    this.s = 0.0;
    this.initialEnergy = Physics.getPotentialEnergy(this.mass, this.h0);
    this.totalEnergy = this.initialEnergy;
    this.pe = this.initialEnergy;
    this.ke = 0.0;
    this.v = 0.0;
    this.vx = 0.0;
    this.vy = 0.0;
    this.frictionLoss = 0.0;
    this.normalForce = this.mass * Physics.G;
    this.gForce = 1.0;
    this.maxGForce = 1.0;
    this.detachPoint = null;
    this.fallTrail = [];
    this.trail = [];
    this.tumbleSpeed = 0.0;

    if (track) {
      const p = track.sampleAt(0);
      this.x = p.x;
      this.y = p.y;
      this.angle = p.angle;
    }
  }

  applyPreset(key, track) {
    const p = this.presets[key];
    if (!p) return;
    this.h0 = p.h0;
    this.loopRadius = p.loopRadius;
    this.friction = p.friction;
    this.isFrictionEnabled = p.isFrictionEnabled;
    this.loopType = p.loopType;
    if (track) {
      track.setParameters(this.h0, this.loopRadius, this.loopType);
    }
    this.resetToTop(track);
  }

  checkQuests() {
    this.quests.forEach(q => {
      if (!q.completed && q.check()) {
        q.completed = true;
        if (window.soundEngine) window.soundEngine.playSuccessFanfare();
        if (window.coasterUI && window.coasterUI.showToast) {
          window.coasterUI.showToast(`⭐ Quest Complete: "${q.title}"!`, 'success');
        }
      }
    });
  }
}

window.simState = new SimulationState();
