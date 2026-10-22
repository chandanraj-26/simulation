/**
 * Flame Test — Thermal & Particle Physics Engine
 * Models buoyant convective gas flow, non-equilibrium electron thermal excitation,
 * nichrome loop heating/cooling, and salt vaporization kinetics.
 */

class FlameParticle {
  constructor(x, y, vx, vy, life, maxLife, size, colorRgb, type = 'flame') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = maxLife;
    this.size = size;
    this.colorRgb = colorRgb; // [r, g, b]
    this.type = type; // 'flame' | 'inner' | 'salt' | 'spark'
  }

  update(dt = 1.0) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    // Buoyant thermal deceleration upwards
    this.vy *= 0.985;
    // Convective necking (flame tapers towards top)
    this.vx *= 0.95;
    this.size = Math.max(0.5, this.size * 0.992);
  }

  getAlpha() {
    const progress = this.life / this.maxLife;
    if (progress > 0.8) {
      return (1.0 - progress) / 0.2; // Fade in
    }
    return Math.max(0, progress); // Fade out
  }
}

class FlameEngine {
  constructor(state) {
    this.state = state;
    this.particles = [];
    this.maxParticles = 140;
    this.time = 0;
  }

  update(dt = 1.0) {
    this.time += 0.05 * dt;

    if (!this.state.isLit || this.state.gasValve <= 5) {
      // Burner is extinguished; rapidly cool loop and clear flame particles
      this.particles = this.particles.filter(p => {
        p.update(dt);
        return p.life > 0;
      });
      this.state.loopTemp = Math.max(25, this.state.loopTemp - 8 * dt);
      return;
    }

    // 1. Nichrome Wire Loop Thermodynamics
    if (this.state.isLoopInFlame) {
      const maxBurnerTemp = 350 + this.state.airCollar * 950 + (this.state.gasValve / 100) * 150;
      // Thermal conduction towards flame equilibrium
      this.state.loopTemp += (maxBurnerTemp - this.state.loopTemp) * 0.06 * dt;

      // 2. Salt Sublimation / Ionization Kinetics
      if (this.state.activeSalt !== 'none' && this.state.saltAmount > 0) {
        if (this.state.loopTemp > 500) {
          // Slow steady vaporization of metal halide salt
          const burnRate = 0.0018 * (this.state.loopTemp / 800) * dt;
          this.state.saltAmount = Math.max(0, this.state.saltAmount - burnRate);
        }
      }
    } else {
      // Ambient convective cooling when out of flame
      this.state.loopTemp = Math.max(25, this.state.loopTemp - 5.5 * dt);
    }

    // 3. Emit New Flame Particles
    this.spawnParticles();

    // 4. Update Particle Physics
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(dt);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  spawnParticles() {
    const valve = this.state.gasValve / 100;
    const air = this.state.airCollar;
    const flameHeight = 80 + valve * 130;
    const countToSpawn = Math.round(3 + valve * 5);

    // Get active salt color for emission
    const elem = this.state.getActiveElementData();
    const hasActiveSalt = (this.state.isLoopInFlame && this.state.activeSalt !== 'none' && this.state.saltAmount > 0.05);

    for (let i = 0; i < countToSpawn; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const nozzleRadius = 14;
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * nozzleRadius;
      const startX = Math.cos(angle) * r;
      const startY = 0; // Relative to burner mouth

      // Upward velocity
      const speed = -(2.8 + valve * 3.8 + Math.random() * 1.5);
      const vx = (Math.random() - 0.5) * (0.8 + valve * 0.8) + Math.sin(this.time * 2 + i) * 0.3;
      const vy = speed;

      const maxLife = 22 + Math.random() * 18;
      const size = 12 + Math.random() * 10 + valve * 8;

      let rgb;
      let type = 'flame';

      if (hasActiveSalt && Math.random() < 0.65) {
        // Ionized metal salt coloration
        rgb = elem.rgbGlow || [250, 204, 21];
        type = 'salt';
      } else if (air < 0.35) {
        // Luminous Safety Flame (Incandescent yellow/orange soot)
        const t = Math.random();
        rgb = [255, 140 + Math.round(t * 85), 20];
      } else {
        // Non-Luminous Blue Roaring Flame
        if (Math.abs(startX) < nozzleRadius * 0.55 && Math.random() < 0.45) {
          // Inner cool cyan cone
          rgb = [6, 182, 212];
          type = 'inner';
        } else {
          // Outer high-temperature mantle
          rgb = [59, 130, 246];
        }
      }

      this.particles.push(new FlameParticle(startX, startY, vx, vy, maxLife, maxLife, size, rgb, type));
    }
  }

  getLoopGlowColor() {
    const temp = this.state.loopTemp;
    if (temp < 480) return null; // Below visible incandescence
    if (temp < 650) return 'rgba(185, 28, 28, 0.45)'; // Faint dull red
    if (temp < 850) return 'rgba(239, 68, 68, 0.75)'; // Cherry red
    if (temp < 1050) return 'rgba(249, 115, 22, 0.90)'; // Bright orange
    return 'rgba(254, 240, 138, 0.95)'; // Yellow-white heat
  }
}

window.FlameEngine = FlameEngine;
