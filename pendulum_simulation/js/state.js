/**
 * PendulumLab — State Management & Reactive Store
 */

class SimulationState {
  constructor() {
    this.mode = 'single'; // 'single' | 'isochronism' | 'phase_space' | 'large_angle'

    // Pendulum 1 Parameters
    this.length1 = 1.00; // meters (100 cm)
    this.mass1 = 0.50;   // kg
    this.theta1 = Physics.degToRad(30.0); // current angle in radians
    this.omega1 = 0.0;   // angular velocity (rad/s)
    this.alpha1 = 0.0;   // angular acceleration (rad/s^2)
    this.initialAngle1Deg = 30.0;

    // Pendulum 2 Parameters (Dual comparison in Isochronism mode)
    this.length2 = 1.00; // meters
    this.mass2 = 1.00;   // kg (different mass or different angle)
    this.theta2 = Physics.degToRad(10.0);
    this.omega2 = 0.0;
    this.alpha2 = 0.0;
    this.initialAngle2Deg = 10.0;

    // Damping / Friction
    this.damping = 0.015; // light air drag
    this.gravityKey = 'earth';
    this.simSpeed = 1.0;
    this.isPaused = false;

    // Drag Interaction State
    this.isDraggingBob1 = false;
    this.isDraggingBob2 = false;

    // Visual Overlays
    this.showVelocityVector = true;
    this.showAccelerationVector = false;
    this.showForceVectors = true;
    this.showTracePath = true;
    this.showPhotogate = true;
    this.showEnergyBars = true;
    this.showProtractor = true;

    // Motion Trajectory Trails (History of bob positions)
    this.trail1 = [];
    this.trail2 = [];
    this.maxTrailPoints = 120;

    // Phase Portrait History (theta vs omega)
    this.phasePoints = [];
    this.maxPhasePoints = 300;

    // Photogate Sensor at Equilibrium (theta = 0)
    this.photogate = {
      lastCrossingTime: null,
      lastDirection: 0,
      measuredPeriod: null,
      crossingCount: 0
    };

    // Quests
    this.quests = [
      {
        id: 1,
        title: "Galileo's Isochronism Discovery",
        desc: "In Dual Mode, set Pendulum 1 to 30° and Pendulum 2 to 10° with the same length (1.0 m). Observe both pendulums stay perfectly in phase!",
        stars: 1,
        completed: false,
        check: () => {
          return this.mode === 'isochronism' &&
                 Math.abs(this.length1 - this.length2) < 0.05 &&
                 Math.abs(this.initialAngle1Deg - this.initialAngle2Deg) >= 15;
        }
      },
      {
        id: 2,
        title: "Mass Independence Principle",
        desc: "Set Pendulum 1 to 0.2 kg and Pendulum 2 to 1.5 kg with identical length. Notice the period is identical regardless of mass!",
        stars: 2,
        completed: false,
        check: () => {
          return this.mode === 'isochronism' &&
                 Math.abs(this.length1 - this.length2) < 0.05 &&
                 Math.abs(this.mass1 - this.mass2) >= 0.8;
        }
      },
      {
        id: 3,
        title: "The Square Root Length Law",
        desc: "Set length L = 0.25 m (Period ~1.0 s), then quadruple length to L = 1.00 m. Verify the period doubles to ~2.0 s (T ∝ √L)!",
        stars: 3,
        completed: false,
        state: { sawQuarter: false, sawFull: false },
        check: () => {
          if (Math.abs(this.length1 - 0.25) < 0.03) this.quests[2].state.sawQuarter = true;
          if (Math.abs(this.length1 - 1.00) < 0.03) this.quests[2].state.sawFull = true;
          return this.quests[2].state.sawQuarter && this.quests[2].state.sawFull;
        }
      },
      {
        id: 4,
        title: "Lunar Cathedral",
        desc: "Switch celestial gravity to The Moon (g = 1.62 m/s²). Observe the period more than double to ~4.94 s in slow-motion!",
        stars: 4,
        completed: false,
        check: () => {
          return this.gravityKey === 'moon';
        }
      },
      {
        id: 5,
        title: "Large-Angle Nonlinear Breakdown",
        desc: "Pull the bob to a wide angle (θ ≥ 75°). Observe the actual measured period become noticeably longer than Galileo's small-angle formula!",
        stars: 5,
        completed: false,
        check: () => {
          return Math.abs(Physics.radToDeg(this.theta1)) >= 70.0;
        }
      }
    ];
  }

  getGravity() {
    const env = Physics.environments[this.gravityKey];
    return env ? env.g : 9.81;
  }

  resetToInitial() {
    this.theta1 = Physics.degToRad(this.initialAngle1Deg);
    this.omega1 = 0.0;
    this.alpha1 = 0.0;
    this.trail1 = [];

    this.theta2 = Physics.degToRad(this.initialAngle2Deg);
    this.omega2 = 0.0;
    this.alpha2 = 0.0;
    this.trail2 = [];

    this.phasePoints = [];
    this.photogate.lastCrossingTime = null;
    this.photogate.crossingCount = 0;

    if (window.soundEngine) window.soundEngine.playReleaseSound();
  }

  checkQuests() {
    this.quests.forEach(q => {
      if (!q.completed && q.check()) {
        q.completed = true;
        if (window.soundEngine) window.soundEngine.playSuccessFanfare();
        if (window.pendulumUI && window.pendulumUI.showToast) {
          window.pendulumUI.showToast(`⭐ Quest Complete: "${q.title}"!`, 'success');
        }
      }
    });
  }
}

window.simState = new SimulationState();
