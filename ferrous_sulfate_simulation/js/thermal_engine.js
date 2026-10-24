/**
 * Thermal Decomposition of Ferrous Sulfate — Thermodynamics & Kinetic Engine
 * Simulates Newton's law of cooling / heating, dehydration kinetics,
 * decomposition reaction rates, and chemical strip color transformations.
 */

class ThermalEngine {
  constructor(state, soundEngine) {
    this.state = state;
    this.sound = soundEngine;
    this.crackleTimer = 0;
  }

  update(dt) {
    const delta = Math.min(dt, 0.1);

    // 1. Temperature Evolution
    let targetTemp = 25.0;
    let rateConst = 0.08;

    if (this.state.flameLevel === 1) {
      targetTemp = 260.0;
      rateConst = 0.16;
    } else if (this.state.flameLevel === 2) {
      targetTemp = 640.0;
      rateConst = 0.22;
    }

    if (this.state.temperature < targetTemp) {
      this.state.temperature += (targetTemp - this.state.temperature) * rateConst * delta;
    } else {
      this.state.temperature -= (this.state.temperature - targetTemp) * 0.06 * delta;
    }

    // 2. Sound sync with flame
    this.sound.updateFlameSound(this.state.flameLevel);

    // 3. Dehydration Kinetics (FeSO4·7H2O -> FeSO4 + 7H2O)
    if (this.state.temperature >= 95.0 && this.state.dehydrationProgress < 1.0) {
      const rate = Math.min(0.12, (this.state.temperature - 90) * 0.001);
      this.state.dehydrationProgress = Math.min(1.0, this.state.dehydrationProgress + rate * delta);

      // Random crystal dehydration crackle sounds
      this.crackleTimer += delta;
      if (this.crackleTimer > 0.35) {
        this.crackleTimer = 0;
        if (Math.random() < 0.6) {
          this.sound.playCrackle();
        }
      }

      // Update condensed water droplets visibility on tube wall
      for (const d of this.state.waterDroplets) {
        if (d.opacity < this.state.dehydrationProgress) {
          d.opacity = Math.min(1.0, d.opacity + delta * 0.2);
        }
      }

      if (this.state.dehydrationProgress >= 0.85) {
        this.state.completeQuest('q2');
      }
    }

    // 4. Decomposition Kinetics (2FeSO4 -> Fe2O3 + SO2 + SO3)
    // Only proceeds significantly once dehydration is well underway and temp >= 380°C
    if (this.state.temperature >= 380.0 && this.state.dehydrationProgress >= 0.6 && this.state.decompositionProgress < 1.0) {
      const decompRate = Math.min(0.09, (this.state.temperature - 360) * 0.0006);
      this.state.decompositionProgress = Math.min(1.0, this.state.decompositionProgress + decompRate * delta);

      if (this.state.decompositionProgress >= 0.70) {
        this.state.completeQuest('q3');
      }
    }

    // 5. Gas Particles Generation & Physics (SO2 & SO3 fumes)
    if (this.state.decompositionProgress > 0.02 && this.state.temperature > 300.0) {
      const spawnRate = this.state.flameLevel === 2 ? 3 : 1;
      for (let i = 0; i < spawnRate; i++) {
        if (Math.random() < 0.45 && this.state.gasParticles.length < 50) {
          this.state.gasParticles.push({
            x: 0,
            y: 0,
            vx: 15 + Math.random() * 25,
            vy: -20 - Math.random() * 35,
            radius: 4 + Math.random() * 6,
            opacity: 0.7,
            life: 1.0
          });
        }
      }
    }

    // Update active gas plume particles
    for (let i = this.state.gasParticles.length - 1; i >= 0; i--) {
      const p = this.state.gasParticles[i];
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.radius += delta * 6;
      p.life -= delta * 0.75;
      p.opacity = p.life * 0.5;

      if (p.life <= 0) {
        this.state.gasParticles.splice(i, 1);
      }
    }

    // 6. Chemical Test Strips Color Metamorphosis
    if (this.state.decompositionProgress > 0.05 && this.state.temperature > 300) {
      if (this.state.activeTestProbe === 'litmus') {
        if (this.state.litmusProgress < 1.0) {
          const old = this.state.litmusProgress;
          this.state.litmusProgress = Math.min(1.0, this.state.litmusProgress + delta * 0.7);
          if (old < 0.9 && this.state.litmusProgress >= 0.9) {
            this.sound.playTestReaction();
            this.state.completeQuest('q4');
          }
        }
      } else if (this.state.activeTestProbe === 'dichromate') {
        if (this.state.dichromateProgress < 1.0) {
          const old = this.state.dichromateProgress;
          this.state.dichromateProgress = Math.min(1.0, this.state.dichromateProgress + delta * 0.6);
          if (old < 0.9 && this.state.dichromateProgress >= 0.9) {
            this.sound.playTestReaction();
          }
        }
      }
    }

    // 7. Wafting Gesture Countdown
    if (this.state.waftingActive) {
      this.state.waftingTimer -= delta;
      if (this.state.waftingTimer <= 0) {
        this.state.waftingActive = false;
      }
    }
  }
}

window.ThermalEngine = ThermalEngine;
