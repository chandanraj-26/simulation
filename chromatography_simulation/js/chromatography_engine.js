/**
 * Chromatography Physics Engine
 * Models Washburn capillary action, solute partition kinetics, and Gaussian diffusion
 */

export class ChromatographyEngine {
  constructor(options = {}) {
    this.stripLengthCm = 14.0; // 14 cm Whatman paper strip
    this.baselineCm = 1.5;     // 1.5 cm from bottom
    this.solventLimitCm = 12.5; // Top stop line
    
    this.elapsedSeconds = 0;
    this.isRunning = false;
    this.isComplete = false;
    this.timeScale = 1.0; // multiplier (1x, 2x, 5x, 10x)

    this.sample = null;
    this.solvent = null;

    // State tracking
    this.solventHeightCm = 0; // relative to baseline
    this.pigmentStates = [];
  }

  loadExperiment(sample, solvent) {
    this.sample = sample;
    this.solvent = solvent;
    this.reset();
  }

  reset() {
    this.elapsedSeconds = 0;
    this.isRunning = false;
    this.isComplete = false;
    this.solventHeightCm = 0;

    if (!this.sample) return;

    this.pigmentStates = this.sample.pigments.map(pigment => ({
      ...pigment,
      distanceCm: 0,
      currentRf: 0,
      spotSpreadRadius: this.sample.initialSpotRadius || 6,
      opacity: 0.95
    }));
  }

  start() {
    if (this.isComplete) return;
    this.isRunning = true;
  }

  pause() {
    this.isRunning = false;
  }

  setTimeScale(scale) {
    this.timeScale = Math.max(0.2, Math.min(10.0, scale));
  }

  update(deltaSeconds) {
    if (!this.isRunning || this.isComplete) return;

    const effectiveDt = deltaSeconds * this.timeScale;
    this.elapsedSeconds += effectiveDt;

    // Washburn's equation: h(t) = sqrt(k * t)
    // Speed factor depends on solvent viscosity & surface tension
    const k = (this.solvent ? this.solvent.capillarySpeedFactor : 1.0) * 0.45;
    const maxRise = this.solventLimitCm - this.baselineCm; // 11.0 cm

    // Capillary rise with progressive slowing
    const calculatedHeight = Math.min(maxRise, Math.sqrt(2 * k * this.elapsedSeconds));
    this.solventHeightCm = calculatedHeight;

    // Check completion
    if (this.solventHeightCm >= maxRise) {
      this.solventHeightCm = maxRise;
      this.isRunning = false;
      this.isComplete = true;
    }

    // Update each pigment position
    const totalTravel = this.solventHeightCm;
    this.pigmentStates.forEach(pigment => {
      // Distance traveled = solventTravel * Rf
      const targetDistance = totalTravel * pigment.rf;
      pigment.distanceCm = targetDistance;
      pigment.currentRf = totalTravel > 0 ? (pigment.distanceCm / totalTravel) : 0;

      // 1D Gaussian diffusion spreading along strip
      const diffusion = Math.sqrt(1 + (this.elapsedSeconds * 0.05 * (pigment.diffusionRate || 1.0)));
      pigment.spotSpreadRadius = (this.sample.initialSpotRadius || 6) * Math.min(2.2, diffusion);
    });
  }

  getMetrics() {
    const totalRise = this.solventHeightCm;
    return {
      elapsedTime: this.elapsedSeconds,
      solventFrontCm: totalRise + this.baselineCm,
      netSolventDistanceCm: totalRise,
      isComplete: this.isComplete,
      isRunning: this.isRunning,
      pigments: this.pigmentStates.map(p => ({
        id: p.id,
        name: p.name,
        color: p.color,
        distanceFromBaselineCm: p.distanceCm,
        rfCalculated: totalRise > 0.1 ? (p.distanceCm / totalRise).toFixed(3) : '0.000',
        rfReference: p.rf.toFixed(3)
      }))
    };
  }
}
