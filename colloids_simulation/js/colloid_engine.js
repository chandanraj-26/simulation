/**
 * Colloidal Dynamics & Brownian Motion Engine
 */

import { SOLS } from './colloid_data.js';

export class ColloidEngine {
  constructor() {
    this.solId = 'ferric_hydroxide';
    this.showTyndall = true;
    this.coagulationProgress = 0.0;
    this.isCoagulating = false;
    this.activeElectrolyte = null;

    this.particles = [];
    this.initParticles();
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < 60; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * 110,
        y: Math.random() * 85 + 10,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        radius: Math.random() * 2.2 + 1.2
      });
    }
  }

  setSol(id) {
    if (SOLS[id]) {
      this.solId = id;
      this.reset();
    }
  }

  addElectrolyte(index) {
    const sol = SOLS[this.solId];
    const electrolyte = sol.activeElectrolytes[index];
    if (!electrolyte) return;

    this.activeElectrolyte = electrolyte;
    this.isCoagulating = true;
    this.coagulationProgress = 0.0;
  }

  reset() {
    this.coagulationProgress = 0.0;
    this.isCoagulating = false;
    this.activeElectrolyte = null;
    this.initParticles();
  }

  update(deltaSeconds) {
    // Flocculation speed proportional to powerRatio
    if (this.isCoagulating && this.activeElectrolyte) {
      const speed = Math.min(2.5, 0.2 * Math.log10(this.activeElectrolyte.powerRatio + 1));
      this.coagulationProgress = Math.min(1.0, this.coagulationProgress + deltaSeconds * speed);
    }

    // Brownian motion updates
    this.particles.forEach(p => {
      // Chaotic thermal kick
      p.vx += (Math.random() - 0.5) * 20 * deltaSeconds;
      p.vy += (Math.random() - 0.5) * 20 * deltaSeconds;

      // Damping
      p.vx *= 0.96;
      p.vy *= 0.96;

      // Gravitational settling if coagulated
      if (this.coagulationProgress > 0.4) {
        p.vy += 15 * deltaSeconds * this.coagulationProgress;
        p.radius = Math.min(4.5, p.radius + deltaSeconds * 0.5);
      }

      p.x += p.vx * deltaSeconds;
      p.y += p.vy * deltaSeconds;

      // Boundary bounce
      if (p.x < -55) { p.x = -55; p.vx *= -1; }
      if (p.x > 55) { p.x = 55; p.vx *= -1; }
      if (p.y < 5) { p.y = 5; p.vy *= -1; }
      if (p.y > 95) { p.y = 95; p.vy *= -0.3; }
    });
  }

  getMetrics() {
    const sol = SOLS[this.solId];
    return {
      solName: sol.name,
      charge: sol.charge,
      type: sol.type,
      activeElectrolyteName: this.activeElectrolyte ? this.activeElectrolyte.name : 'None Added',
      coagulationPercent: (this.coagulationProgress * 100).toFixed(0),
      isCoagulated: this.coagulationProgress >= 0.95
    };
  }
}
