/**
 * Tyndall Effect & Colloidal Scattering — Physics & Brownian Motion Engine
 * Simulates thermal molecular collisions (Brownian zigzag paths),
 * gravitational sedimentation of suspensions, and Rayleigh-Tyndall optical scattering.
 */

class TyndallEngine {
  constructor(state, soundEngine) {
    this.state = state;
    this.sound = soundEngine;
    this.brownianTickTimer = 0;
  }

  update(dt) {
    const delta = Math.min(dt, 0.1);

    // 1. Advance Brownian Motion in Microscope Mode
    if (this.state.viewMode === 'brownian_microscope') {
      const boundaryR = 120; // Radius of microscope circular field

      for (const p of this.state.brownianParticles) {
        // Random thermal molecular bombardment kicks
        if (Math.random() < 0.35) {
          p.vx += (Math.random() - 0.5) * 60;
          p.vy += (Math.random() - 0.5) * 60;

          // Drag / viscosity dampening
          p.vx *= 0.85;
          p.vy *= 0.85;
        }

        // Store trail
        if (p.trail.length > 12) {
          p.trail.shift();
        }
        p.trail.push({ x: p.x, y: p.y });

        // Update position
        p.x += p.vx * delta;
        p.y += p.vy * delta;

        // Boundary containment
        const dist = Math.hypot(p.x, p.y);
        if (dist >= boundaryR - p.radius) {
          const angle = Math.atan2(p.y, p.x);
          p.x = Math.cos(angle) * (boundaryR - p.radius - 1);
          p.y = Math.sin(angle) * (boundaryR - p.radius - 1);
          p.vx = -p.vx * 0.8;
          p.vy = -p.vy * 0.8;
        }
      }

      this.brownianTickTimer += delta;
      if (this.brownianTickTimer > 0.4) {
        this.brownianTickTimer = 0;
        if (Math.random() < 0.3) {
          this.sound.playBrownianTick();
        }
      }
    }

    // 2. Advance Suspension Sedimentation
    if (this.state.suspensionSettled < 1.0) {
      this.state.suspensionSettled = Math.min(1.0, this.state.suspensionSettled + delta * 0.025);

      for (const sp of this.state.suspensionParticles) {
        if (sp.yNorm < 0.82) {
          sp.yNorm += sp.vy * delta;
        }
      }
    }

    // Check quests
    this.state.checkQuests();
  }
}

window.TyndallEngine = TyndallEngine;
