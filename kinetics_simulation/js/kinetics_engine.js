/**
 * Reaction Kinetics — Chemical Physics & Numerical Kinetics Engine
 * Solves rate differential equations, computes temperature-dependent Arrhenius rate constants,
 * models colloidal sulfur light scattering, and updates fluid vortex particles.
 */

class ColloidalParticle {
  constructor(radiusMax) {
    this.reset(radiusMax);
  }

  reset(radiusMax) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * radiusMax;
    this.x = Math.cos(angle) * r;
    this.y = Math.sin(angle) * r;
    this.rDist = r;
    this.angle = angle;
    this.angularSpeed = (0.02 + Math.random() * 0.04) * (1.1 - r / (radiusMax + 1));
    this.size = 1.0 + Math.random() * 2.2;
    this.alpha = 0.15 + Math.random() * 0.45;
  }

  update(dt, isStirring, radiusMax) {
    if (isStirring) {
      this.angle += this.angularSpeed * dt * 2.5;
      this.x = Math.cos(this.angle) * this.rDist;
      this.y = Math.sin(this.angle) * this.rDist;
    } else {
      // Brownian micro-jitter
      this.x += (Math.random() - 0.5) * 0.6 * dt;
      this.y += (Math.random() - 0.5) * 0.6 * dt;
    }
  }
}

class KineticsEngine {
  constructor(state) {
    this.state = state;
    this.particles = [];
    this.particleCount = 90;
    this.sulfurConcentration = 0.0; // mol/L of elemental colloidal sulfur formed

    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(new ColloidalParticle(110));
    }
  }

  update(deltaSec) {
    if (this.state.status !== 'running') {
      return;
    }

    const dt = deltaSec * this.state.simSpeed;
    this.state.elapsedSeconds += dt;

    // 1. Calculate Arrhenius Rate Constant k(T)
    const T_Kelvin = this.state.temperatureC + 273.15;
    const Ea = window.KINETICS_DATA.ACTIVATION_ENERGY; // 52 kJ/mol
    const R = window.KINETICS_DATA.R_GAS_CONSTANT; // 8.314 J/(mol*K)
    const A = window.KINETICS_DATA.PRE_EXPONENTIAL_A;

    // Standard Arrhenius equation: k = A * exp(-Ea / (R * T))
    const k = A * Math.exp(-Ea / (R * T_Kelvin));

    // 2. Rate of Sulfur Precipitation: d[S]/dt = k * [Na2S2O3]^1.0 * [HCl]^0.08
    // Rate is primarily first-order in Thiosulfate, minimal dependence on excess HCl
    const rateOfSulfur = k * Math.pow(this.state.thiosulfateConc, 1.0) * Math.pow(this.state.hclConc, 0.08);

    // Integrate sulfur mass accumulation
    this.sulfurConcentration += rateOfSulfur * dt;

    // 3. Optical Extinction (Lambert-Beer & Rayleigh scattering approximation)
    // Critical opacity required to obscure the black cross = 0.92
    const extinctionCoeff = 38.0; // Calibration factor
    const rawOpacity = 1.0 - Math.exp(-extinctionCoeff * Math.pow(this.sulfurConcentration, 1.25));
    this.state.opacity = Math.min(1.0, Math.max(0.0, rawOpacity));
    this.state.transmittancePct = Math.max(0.0, (1.0 - this.state.opacity) * 100);

    // 4. Update Swirling Colloid Particles
    for (const p of this.particles) {
      p.update(dt, this.state.isStirring, 110);
    }

    // 5. Test Optical Extinction Threshold (Black Cross Vanishes)
    if (!this.state.crossObscured && this.state.opacity >= window.KINETICS_DATA.CRITICAL_OPACITY_THRESHOLD) {
      this.state.crossObscured = true;
      this.state.status = 'completed';

      // Record completed trial data
      this.state.recordTrial();

      // Trigger auditory extinction chime
      if (window.kineticsSound) {
        window.kineticsSound.playExtinctionBell();
        window.kineticsSound.stopStirrerHum();
      }
    }
  }

  reset() {
    this.sulfurConcentration = 0.0;
    this.state.opacity = 0.0;
    this.state.transmittancePct = 100.0;
    this.state.crossObscured = false;
  }
}

window.KineticsEngine = KineticsEngine;
