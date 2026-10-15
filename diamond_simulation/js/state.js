/**
 * DiamondCutSim — State Management & Reactive Store
 * Holds diamond cut parameters, light source config, material selection,
 * display toggles, computed telemetry, and student laboratory quests.
 */

class SimulationState {
  constructor() {
    // Current exploration mode
    this.mode = 'brilliance'; // 'brilliance' | 'fire' | 'tir_demo' | 'cut_compare' | 'custom_cut'

    // Diamond Material & Geometry
    this.materialKey = 'diamond';
    this.cutType = 'brilliant'; // 'brilliant' | 'princess' | 'emerald'
    this.cutParams = {
      crownAngleDeg: 34.5,
      pavilionAngleDeg: 40.75,
      tableRatio: 0.57
    };
    this.diamondWidth = 280; // px
    this.diamondOffset = { x: 0, y: 0 };
    this.zoom = 1.0;

    // Incident Light
    this.lightType = 'white'; // 'white' | 'laser'
    this.beamMode = 'multi'; // 'multi' (collimated beam) | 'single'
    this.laserWavelength = 589; // nm (sodium D-line)
    this.incidentAngleDeg = 0; // relative to table normal (0 = straight down)
    this.dispersionScale = 3.5; // visual exaggeration factor for clarity
    this.lightSourceX = 0.5; // 0..1 across table width
    this.maxBounces = 12;

    // Simulation Clock
    this.simTime = 0;
    this.isPaused = false;
    this.simSpeed = 1.0;
    this.showPhotons = true;

    // User Drag State
    this.isDraggingLight = false;
    this.isDraggingDiamond = false;
    this.isRotatingLight = false;

    // Visual Display Toggles
    this.showRays = true;
    this.showNormals = false;
    this.showAngles = true;
    this.showSpectralFan = true;
    this.showFacetLabels = false;
    this.showCriticalCone = true;
    this.showFireRainbow = true;
    this.showGrid = true;

    // Computed Telemetry (updated each frame)
    this.telemetry = {
      iDeg: 0,
      r1Deg: 0,
      critDeg: 24.4,
      nGem: 2.417,
      bounceCount: 0,
      totalInternalReflections: 0,
      dispersedColors: 0,
      brilliance: 0, // fraction of light returned through crown
      fire: 0 // spectral spread in degrees
    };

    // Traced ray results (populated by renderer)
    this.traces = [];

    // Quests
    this.quests = [
      {
        id: 1,
        title: "Total Internal Reflection — Why Diamonds Sparkle",
        desc: "Set the diamond to Round Brilliant cut. Observe how the steep pavilion angles cause light to bounce multiple times via TIR (θ > 24.4° critical angle) before exiting the crown!",
        stars: 1,
        completed: false,
        check: () => {
          return this.cutType === 'brilliant' && this.telemetry.totalInternalReflections >= 2;
        }
      },
      {
        id: 2,
        title: "The Fire Within — Chromatic Dispersion",
        desc: "Switch to White Light mode. Observe how the diamond splits white light into a rainbow of colors (VIBGYOR fire) just like a prism! This is due to Cauchy dispersion: n(λ) varies with wavelength.",
        stars: 2,
        completed: false,
        check: () => {
          return this.lightType === 'white' && this.telemetry.dispersedColors >= 4;
        }
      },
      {
        id: 3,
        title: "Glass vs Diamond — Critical Angle Comparison",
        desc: "Switch the material to Crown Glass (n = 1.52). Notice how the critical angle jumps from 24.4° to 41.1°! Most light escapes through the pavilion instead of reflecting — glass 'diamonds' have far less sparkle.",
        stars: 3,
        completed: false,
        state: { sawDiamond: false, sawGlass: false },
        check: () => {
          if (this.materialKey === 'diamond') this.quests[2].state.sawDiamond = true;
          if (this.materialKey === 'glass') this.quests[2].state.sawGlass = true;
          return this.quests[2].state.sawDiamond && this.quests[2].state.sawGlass;
        }
      },
      {
        id: 4,
        title: "Perfect Pavilion — The 40.75° Sweet Spot",
        desc: "In Custom Cut mode, adjust the Pavilion Angle to exactly 40.75° (±0.5°). This is the ideal angle where maximum light returns through the crown — the hallmark of a well-cut diamond!",
        stars: 4,
        completed: false,
        check: () => {
          return this.mode === 'custom_cut' && Math.abs(this.cutParams.pavilionAngleDeg - 40.75) <= 0.5;
        }
      },
      {
        id: 5,
        title: "Moissanite Rainbow — Even More Fire!",
        desc: "Switch the material to Moissanite (n = 2.65). Its higher refractive index produces even more dramatic rainbow dispersion than diamond! Compare the spectral spread.",
        stars: 5,
        completed: false,
        check: () => {
          return this.materialKey === 'moissanite' && this.telemetry.fire > 0;
        }
      }
    ];
  }

  getMaterial() {
    return Optics.materials[this.materialKey] || Optics.materials['diamond'];
  }

  resetAll() {
    this.incidentAngleDeg = 0;
    this.lightSourceX = 0.5;
    this.traces = [];
    this.simTime = 0;
    this.cutParams = {
      crownAngleDeg: 34.5,
      pavilionAngleDeg: 40.75,
      tableRatio: 0.57
    };
    this.lightType = 'white';
    this.materialKey = 'diamond';
    this.cutType = 'brilliant';
  }

  setMode(newMode) {
    this.mode = newMode;
    switch (newMode) {
      case 'brilliance':
        this.lightType = 'white';
        this.beamMode = 'multi';
        this.incidentAngleDeg = 0;
        this.cutType = 'brilliant';
        this.cutParams = { crownAngleDeg: 34.5, pavilionAngleDeg: 40.75, tableRatio: 0.57 };
        this.materialKey = 'diamond';
        break;
      case 'fire':
        this.lightType = 'white';
        this.beamMode = 'multi';
        this.incidentAngleDeg = 6.0;
        this.cutType = 'brilliant';
        this.dispersionScale = 4.5;
        this.materialKey = 'diamond';
        break;
      case 'tir_demo':
        this.lightType = 'laser';
        this.beamMode = 'single';
        this.laserWavelength = 532; // green
        this.incidentAngleDeg = 12.0;
        this.cutType = 'brilliant';
        this.materialKey = 'diamond';
        break;
      case 'cut_compare':
        this.lightType = 'white';
        this.beamMode = 'multi';
        this.incidentAngleDeg = 0;
        this.materialKey = 'diamond';
        break;
      case 'custom_cut':
        this.lightType = 'white';
        this.beamMode = 'multi';
        this.incidentAngleDeg = 0;
        this.materialKey = 'diamond';
        break;
    }
    this.traces = [];
    this.simTime = 0;
  }

  checkQuests() {
    this.quests.forEach(q => {
      if (!q.completed && q.check()) {
        q.completed = true;
        if (window.soundEngine) window.soundEngine.playSuccessFanfare();
        if (window.diamondUI && window.diamondUI.showToast) {
          window.diamondUI.showToast(`💎 Quest Complete: "${q.title}"!`, 'success');
        }
      }
    });
  }
}

window.simState = new SimulationState();
