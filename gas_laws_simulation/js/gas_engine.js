/**
 * Kinetic Gas Laws — Elastic Particle Collision & Statistical Engine
 * Models micro-particle elastic kinematics, Maxwell-Boltzmann velocity sampling,
 * momentum transfer wall pressures, and real-time velocity bin histograms.
 */

class GasMolecule {
  constructor(x, y, vx, vy, radius, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
  }

  update(dt, left, right, top, bottom) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    let momentumTransfer = 0;

    // Left wall collision
    if (this.x - this.radius < left) {
      this.x = left + this.radius;
      this.vx = Math.abs(this.vx);
      momentumTransfer += 2 * Math.abs(this.vx);
    }
    // Right wall (Piston face) collision
    else if (this.x + this.radius > right) {
      this.x = right - this.radius;
      this.vx = -Math.abs(this.vx);
      momentumTransfer += 2 * Math.abs(this.vx);
    }

    // Top wall collision
    if (this.y - this.radius < top) {
      this.y = top + this.radius;
      this.vy = Math.abs(this.vy);
      momentumTransfer += 2 * Math.abs(this.vy);
    }
    // Bottom wall collision
    else if (this.y + this.radius > bottom) {
      this.y = bottom - this.radius;
      this.vy = -Math.abs(this.vy);
      momentumTransfer += 2 * Math.abs(this.vy);
    }

    return momentumTransfer;
  }
}

class GasEngine {
  constructor(state) {
    this.state = state;
    this.particles = [];
    this.targetParticleCount = 60;
    this.wallMomentumAcc = 0;
    this.wallPressureSmoothed = 1.64;

    this.syncParticles();
  }

  syncParticles() {
    // Number of particles proportional to moles (e.g. 1.0 mol = 50 particles)
    const count = Math.round(this.state.moles * 50);
    const species = window.GAS_DATA.species[this.state.gasSpecies] || window.GAS_DATA.species.he;

    // Adjust particle array length
    while (this.particles.length < count) {
      const v = this.sampleMaxwellSpeed();
      const angle = Math.random() * Math.PI * 2;
      this.particles.push(new GasMolecule(
        100 + Math.random() * 150,
        150 + Math.random() * 180,
        Math.cos(angle) * v,
        Math.sin(angle) * v,
        species.radius,
        species.color
      ));
    }
    while (this.particles.length > count) {
      this.particles.pop();
    }

    // Update species radius & color
    for (const p of this.particles) {
      p.radius = species.radius;
      p.color = species.color;
    }
  }

  sampleMaxwellSpeed() {
    const species = window.GAS_DATA.species[this.state.gasSpecies] || window.GAS_DATA.species.he;
    // Speed proportional to sqrt(T / M)
    const baseSpeed = Math.sqrt(this.state.temperatureK / species.molarMassG) * 1.8;
    // Box-Muller random gaussian transform for velocity components
    const u1 = Math.random() || 0.001;
    const u2 = Math.random() || 0.001;
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return Math.max(0.4, baseSpeed * (1.0 + z * 0.28));
  }

  rescaleVelocities() {
    const species = window.GAS_DATA.species[this.state.gasSpecies] || window.GAS_DATA.species.he;
    const targetBaseSpeed = Math.sqrt(this.state.temperatureK / species.molarMassG) * 1.8;

    for (const p of this.particles) {
      const currentSpeed = Math.hypot(p.vx, p.vy) || 0.1;
      const angle = Math.atan2(p.vy, p.vx);
      const newSpeed = targetBaseSpeed * (currentSpeed / (targetBaseSpeed || 1) * 0.7 + 0.3);
      p.vx = Math.cos(angle) * newSpeed;
      p.vy = Math.sin(angle) * newSpeed;
    }
  }

  update(deltaSec, bounds) {
    this.syncParticles();

    let totalMomentum = 0;
    const dt = Math.min(0.08, deltaSec);

    for (const p of this.particles) {
      totalMomentum += p.update(dt * 60, bounds.left, bounds.right, bounds.top, bounds.bottom);
    }

    this.wallMomentumAcc += totalMomentum;
  }

  getSpeedDistribution(binsCount = 10) {
    const speeds = this.particles.map(p => Math.hypot(p.vx, p.vy));
    const maxSpeed = Math.max(12, Math.max(...speeds) * 1.15);
    const bins = new Array(binsCount).fill(0);

    speeds.forEach(s => {
      const idx = Math.min(binsCount - 1, Math.floor((s / maxSpeed) * binsCount));
      bins[idx]++;
    });

    return { bins, maxSpeed };
  }
}

window.GasEngine = GasEngine;
