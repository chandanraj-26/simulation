/**
 * DopplerLab — State Management & Reactive Store
 * Holds simulation configuration, source/observer vectors, active wavefront rings,
 * audio state, telemetry metrics, and student laboratory quests.
 */

class SimulationState {
  constructor() {
    this.mode = 'subsonic'; // 'subsonic' | 'supersonic' | 'observer_motion' | 'ambulance' | 'stationary'

    // Medium & Speed of Sound
    this.mediumKey = 'air_20c';
    this.customSoundSpeed = 343; // m/s

    // Acoustic Source Parameters
    this.source = {
      x: 180, // meters in world coordinates
      y: 270,
      vx: 120, // m/s
      vy: 0,
      f0: 440, // Base source frequency (Hz, Concert A)
      amplitude: 1.0,
      radius: 14 // visual icon radius
    };

    // Observer Parameters
    this.observer = {
      x: 720,
      y: 270,
      vx: 0,
      vy: 0,
      radius: 12
    };

    // Wavefront Emission System
    this.wavefronts = [];
    this.maxWavefronts = 90;
    this.emissionInterval = 0.22; // seconds of simulation time between rings
    this.lastEmissionTime = 0;
    this.wavefrontCounter = 0;

    // Simulation Clock & Speed
    this.simTime = 0;
    this.simSpeed = 1.0;
    this.isPaused = false;

    // Drag Interaction State
    this.isDraggingSource = false;
    this.isDraggingObserver = false;
    this.dragOffset = { x: 0, y: 0 };

    // Visual Display Toggles
    this.showWavefronts = true;
    this.showMachCone = true;
    this.showVectors = true;
    this.showWavelengthShift = true;
    this.showGrid = true;
    this.showOscilloscope = true;
    this.showSpectrum = true;

    // Computed Live Telemetry (updated each frame)
    this.telemetry = {
      fObs: 440,
      f0: 440,
      lambdaObs: 0.78,
      lambda0: 0.78,
      machNumber: 0.35,
      ratio: 1.0,
      vSound: 343,
      distance: 540,
      machAngleDeg: null
    };

    // Real-Time Waveform History for CRT Oscilloscope
    this.waveformHistory = [];
    this.maxWaveformPoints = 220;

    // Quests
    this.quests = [
      {
        id: 1,
        title: "Subsonic Wave Compression (Blue Shift)",
        desc: "In Subsonic Mode, set Source Velocity to at least 120 m/s approaching the Observer. Observe the observed frequency soar above 500 Hz as wavefronts compress!",
        stars: 1,
        completed: false,
        check: () => {
          return this.telemetry.radialSrcVel >= 110 && this.telemetry.fObs >= 510;
        }
      },
      {
        id: 2,
        title: "The Sound Barrier (Mach 1.00)",
        desc: "Set the Source Velocity exactly equal to the Speed of Sound (Mach 1.00 ± 0.05). Watch the circular wavefronts pile up into an intense, infinite-density pressure barrier!",
        stars: 2,
        completed: false,
        check: () => {
          return Math.abs(this.telemetry.machNumber - 1.00) <= 0.05 && this.source.vx > 100;
        }
      },
      {
        id: 3,
        title: "Supersonic Flight & Mach Cone",
        desc: "Enter Supersonic Mode (Mach >= 1.4). Verify that all acoustic rings are left inside the conical shockwave envelope with half-angle μ = arcsin(1/M)!",
        stars: 3,
        completed: false,
        check: () => {
          return this.mode === 'supersonic' && this.telemetry.machNumber >= 1.38;
        }
      },
      {
        id: 4,
        title: "The Passing Siren (Doppler Shift in Action)",
        desc: "Launch the Ambulance Drive-by Scenario. Watch the source pass directly across the observer and observe the sudden transition from high pitch (compression) to low pitch (rarefaction)!",
        stars: 4,
        completed: false,
        state: { sawApproach: false, sawRecede: false },
        check: () => {
          if (this.mode === 'ambulance') {
            if (this.telemetry.radialSrcVel > 30) this.quests[3].state.sawApproach = true;
            if (this.telemetry.radialSrcVel < -30 && this.quests[3].state.sawApproach) this.quests[3].state.sawRecede = true;
          }
          return this.quests[3].state.sawApproach && this.quests[3].state.sawRecede;
        }
      },
      {
        id: 5,
        title: "Dense Medium Propagation (Water Sound)",
        desc: "Switch the medium to Fresh Water (sound speed ~1482 m/s). Notice how much faster the wavefronts travel and how significantly the wavelength λ expands!",
        stars: 5,
        completed: false,
        check: () => {
          return this.mediumKey === 'water' && this.telemetry.lambda0 > 2.5;
        }
      }
    ];
  }

  getSoundSpeed() {
    const med = Physics.mediums[this.mediumKey];
    return med ? med.speed : this.customSoundSpeed;
  }

  resetAll() {
    this.simTime = 0;
    this.wavefronts = [];
    this.waveformHistory = [];
    this.lastEmissionTime = 0;
    this.wavefrontCounter = 0;

    if (this.mode === 'subsonic') {
      this.source.x = 180;
      this.source.y = 270;
      this.source.vx = 140;
      this.source.vy = 0;
      this.source.f0 = 440;
      this.observer.x = 750;
      this.observer.y = 270;
      this.observer.vx = 0;
      this.observer.vy = 0;
    } else if (this.mode === 'supersonic') {
      this.source.x = 120;
      this.source.y = 270;
      this.source.vx = 480; // ~Mach 1.4
      this.source.vy = 0;
      this.source.f0 = 440;
      this.observer.x = 720;
      this.observer.y = 380;
      this.observer.vx = 0;
      this.observer.vy = 0;
    } else if (this.mode === 'observer_motion') {
      this.source.x = 480;
      this.source.y = 270;
      this.source.vx = 0;
      this.source.vy = 0;
      this.source.f0 = 440;
      this.observer.x = 180;
      this.observer.y = 270;
      this.observer.vx = 120; // moving towards source
      this.observer.vy = 0;
    } else if (this.mode === 'ambulance') {
      this.source.x = 100;
      this.source.y = 200;
      this.source.vx = 110; // ~400 km/h or high-speed emergency response
      this.source.vy = 0;
      this.source.f0 = 500;
      this.observer.x = 520;
      this.observer.y = 340; // on the sidewalk offset by 140m
      this.observer.vx = 0;
      this.observer.vy = 0;
    } else if (this.mode === 'stationary') {
      this.source.x = 480;
      this.source.y = 270;
      this.source.vx = 0;
      this.source.vy = 0;
      this.source.f0 = 440;
      this.observer.x = 740;
      this.observer.y = 270;
      this.observer.vx = 0;
      this.observer.vy = 0;
    }

    if (window.soundEngine) {
      window.soundEngine.updateDopplerTone(this.telemetry.fObs, 0.1);
    }
  }

  setMode(newMode) {
    this.mode = newMode;
    this.resetAll();
  }

  checkQuests() {
    this.quests.forEach(q => {
      if (!q.completed && q.check()) {
        q.completed = true;
        if (window.soundEngine) window.soundEngine.playSuccessFanfare();
        if (window.dopplerUI && window.dopplerUI.showToast) {
          window.dopplerUI.showToast(`⭐ Quest Complete: "${q.title}"!`, 'success');
        }
      }
    });
  }
}

window.simState = new SimulationState();
