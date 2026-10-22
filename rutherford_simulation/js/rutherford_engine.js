/**
 * Rutherford Alpha Scattering — Coulomb Nuclear Physics Engine
 * Implements Coulomb repulsion, distance of closest approach,
 * impact parameter deflection, Thomson vs. Rutherford model trajectories,
 * and phosphorescent scintillation detection.
 */

class RutherfordEngine {
  constructor(state, soundEngine) {
    this.state = state;
    this.sound = soundEngine;
    this.spawnTimer = 0;
  }

  update(dt) {
    const delta = Math.min(dt, 0.1);

    // 1. Spawn Alpha Particles from Collimated Emitter
    if (this.state.beamActive) {
      this.spawnTimer += delta;
      const spawnInterval = 0.08 / (this.state.beamRate || 6);

      while (this.spawnTimer >= spawnInterval) {
        this.spawnTimer -= spawnInterval;
        this.spawnAlpha();
      }
    }

    // 2. Advance Active Alpha Trajectories
    const isMicro = this.state.viewMode === 'micro_nuclear';
    const isThomson = this.state.model === 'thomson';

    for (let i = this.state.alphas.length - 1; i >= 0; i--) {
      const a = this.state.alphas[i];
      a.age += delta;

      if (!isMicro) {
        // Macro Bench Mode: Trajectory from left collimator (-0.45) to central gold foil (0.0)
        if (a.stage === 'approaching') {
          a.x += a.vx * delta;
          a.y += a.vy * delta;

          // Reached gold foil at x = 0
          if (a.x >= 0.0) {
            a.stage = 'scattered';
            // Compute Rutherford scattering angle based on model and impact parameter
            const theta = this.calculateDeflection(a.impactParam, isThomson);
            a.thetaDeg = theta;
            const thetaRad = (theta * Math.PI) / 180.0;

            const speed = Math.hypot(a.vx, a.vy);
            a.vx = speed * Math.cos(thetaRad);
            a.vy = speed * Math.sin(thetaRad);
          }
        } else if (a.stage === 'scattered') {
          a.x += a.vx * delta;
          a.y += a.vy * delta;

          // Check if particle hits the circular ZnS detector ring (radius ~ 0.42)
          const distFromCenter = Math.hypot(a.x, a.y);
          if (distFromCenter >= 0.42) {
            this.handleDetectorImpact(a);
            this.state.alphas.splice(i, 1);
            continue;
          }
        }
      } else {
        // Micro Nuclear Zoom Mode: Hyperbolic trajectory around central nucleus
        this.updateMicroParticle(a, delta, isThomson);

        // Remove if exited zoom arena
        if (Math.abs(a.x) > 0.55 || Math.abs(a.y) > 0.55) {
          this.state.alphas.splice(i, 1);
          continue;
        }
      }

      // Max lifetime cleanup
      if (a.age > 3.0) {
        this.state.alphas.splice(i, 1);
      }
    }

    // 3. Fade Scintillation Flashes
    for (let i = this.state.scintillations.length - 1; i >= 0; i--) {
      const s = this.state.scintillations[i];
      s.alpha -= delta * 2.2;
      if (s.alpha <= 0) {
        this.state.scintillations.splice(i, 1);
      }
    }
  }

  spawnAlpha() {
    // Generate impact parameter distribution
    // Most particles have large b; very few have tiny b
    const sign = Math.random() < 0.5 ? -1 : 1;
    // Bias towards small impact parameters occasionally to make backscattering discoverable in real-time
    let normB;
    const r = Math.random();
    if (r < 0.035) {
      normB = (Math.random() * 0.04) * sign; // Rare head-on / near head-on collision
    } else if (r < 0.18) {
      normB = (0.04 + Math.random() * 0.25) * sign; // Moderate deflection
    } else {
      normB = (0.25 + Math.random() * 0.75) * sign; // Undeflected pass-through
    }

    const speed = 0.55; // Normalized screen units / sec

    this.state.alphas.push({
      x: -0.45,
      y: normB * 0.08,
      vx: speed,
      vy: 0.0,
      impactParam: normB,
      stage: 'approaching',
      age: 0,
      thetaDeg: 0,
      // For micro mode:
      microX: -0.5,
      microY: normB * 0.35,
      microVx: 0.8,
      microVy: 0.0
    });
  }

  calculateDeflection(normB, isThomson) {
    if (isThomson) {
      // In Thomson's Plum Pudding, maximum deflection is under 0.8 degrees
      return (Math.random() - 0.5) * 1.2;
    }

    // Rutherford formula: cot(theta / 2) = 2b / d_min
    const dMinNorm = 0.025; // Scaled distance of closest approach
    const absB = Math.abs(normB);
    const sign = normB >= 0 ? 1 : -1;

    // Rutherford angle calculation
    const cotHalfTheta = (2.0 * absB) / dMinNorm;
    let thetaRad = 2.0 * Math.atan(1.0 / Math.max(0.001, cotHalfTheta));

    // Convert to degrees
    let thetaDeg = (thetaRad * 180.0) / Math.PI;

    // Add subtle multiple-scattering jitter through foil (~100 nm)
    thetaDeg += (Math.random() - 0.5) * 0.8;

    return thetaDeg * sign;
  }

  updateMicroParticle(a, dt, isThomson) {
    if (isThomson) {
      // Straight through with faint oscillation
      a.microX += a.microVx * dt;
      a.microY += a.microVy * dt + (Math.random() - 0.5) * 0.002;
      a.x = a.microX;
      a.y = a.microY;
      return;
    }

    // Rutherford Coulomb 1/r^2 repulsive force from central gold nucleus (0, 0)
    const dx = a.microX;
    const dy = a.microY;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    const kCoupled = 0.00085; // Scaled repulsive strength (z*Z*e^2 / 4*pi*eps_0)
    if (dist > 0.008) {
      const fMag = kCoupled / Math.max(0.0002, distSq);
      const fx = (dx / dist) * fMag;
      const fy = (dy / dist) * fMag;

      a.microVx += fx * dt;
      a.microVy += fy * dt;
    }

    a.microX += a.microVx * dt;
    a.microY += a.microVy * dt;

    a.x = a.microX;
    a.y = a.microY;
  }

  handleDetectorImpact(alpha) {
    const angleRad = Math.atan2(alpha.y, alpha.x);
    const angleDeg = (angleRad * 180.0) / Math.PI;

    // Record scattering statistics
    this.state.recordScattering(angleDeg);

    // Spawn green phosphorescent scintillation flash on ZnS ring
    this.state.scintillations.push({
      x: alpha.x,
      y: alpha.y,
      alpha: 1.0,
      radius: 4.5
    });

    // Check if within detector telescope aperture
    const diff = Math.abs(angleDeg - this.state.detectorAngleDeg);
    const inDetector = diff <= (this.state.detectorAperture / 2.0);

    if (inDetector) {
      this.sound.playGeigerClick();
    } else if (Math.random() < 0.2) {
      this.sound.playScintillationPing();
    }

    if (Math.abs(angleDeg) >= 90.0) {
      this.sound.playBackscatterThump();
    }
  }
}

window.RutherfordEngine = RutherfordEngine;
