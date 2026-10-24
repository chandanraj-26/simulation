/**
 * Solubility & Crystallization — Thermodynamic & Kinetic Engine
 * Models heat transfer, dissolution rates, thermodynamic equilibrium,
 * and crystal nucleation kinetics from supersaturated solutions.
 */

class SolubilityEngine {
  constructor(state, soundEngine) {
    this.state = state;
    this.sound = soundEngine;
    this.wasHeating = false;
    this.hasPlayedNucleationSound = false;
  }

  update(dt) {
    const delta = Math.min(dt, 0.1);

    // 1. Heat Transfer & Temperature Dynamics
    if (this.state.heatingPower > 0.0) {
      // Bunsen burner heating: heats up to 100°C boiling point
      const heatRate = 9.5 * this.state.heatingPower; // °C/sec
      this.state.temperatureC = Math.min(100.0, this.state.temperatureC + heatRate * delta);

      if (!this.wasHeating) {
        this.sound.startFlameRoar(this.state.heatingPower);
        this.wasHeating = true;
      }
    } else if (this.state.coolingActive) {
      // Ice water cooling bath: cools rapidly towards 10°C
      const coolRate = 8.0;
      this.state.temperatureC = Math.max(10.0, this.state.temperatureC - coolRate * delta);
      if (this.wasHeating) {
        this.sound.stopFlameRoar();
        this.wasHeating = false;
      }
    } else {
      // Natural ambient thermal equilibration towards 20°C
      if (this.state.temperatureC > 20.0) {
        this.state.temperatureC = Math.max(20.0, this.state.temperatureC - 0.6 * delta);
      } else if (this.state.temperatureC < 20.0) {
        this.state.temperatureC = Math.min(20.0, this.state.temperatureC + 0.6 * delta);
      }
      if (this.wasHeating) {
        this.sound.stopFlameRoar();
        this.wasHeating = false;
      }
    }

    // 2. Advance Falling Solute Particles
    for (let i = this.state.fallingParticles.length - 1; i >= 0; i--) {
      const p = this.state.fallingParticles[i];
      p.yNorm += p.vy * delta;

      // Reached beaker liquid bottom (~0.76)
      if (p.yNorm >= 0.76) {
        this.state.fallingParticles.splice(i, 1);
      }
    }

    // 3. Crystallization Kinetics from Supersaturated / Cooled Solution
    const solubilityLimit = this.state.getSolubilityLimit();
    const excessSolute = Math.max(0.0, this.state.soluteAddedG - solubilityLimit);

    if (this.state.seedCrystalAdded && excessSolute > 0.0) {
      // Crystallize excess solute out onto seed crystal
      const growthRate = 4.2 * delta;
      const amountToCrystallize = Math.min(excessSolute - this.state.crystalMassFormedG, growthRate);

      if (amountToCrystallize > 0.0) {
        this.state.crystalMassFormedG += amountToCrystallize;

        if (!this.hasPlayedNucleationSound) {
          this.sound.playNucleationPing();
          this.hasPlayedNucleationSound = true;
        }

        // Spawn grown crystal facet
        if (Math.random() < 0.25 && this.state.grownCrystals.length < 24) {
          const salt = SOLUBILITY_DATA.salts[this.state.selectedSalt];
          this.state.grownCrystals.push({
            xOffset: (Math.random() - 0.5) * 22,
            yOffset: (Math.random() - 0.5) * 22,
            size: 4 + Math.random() * 8,
            rotation: Math.random() * Math.PI,
            color: salt.crystalColor
          });
        }
      }
    } else if (excessSolute <= 0.0) {
      // In heated solution, crystals redissolve
      this.state.crystalMassFormedG = Math.max(0.0, this.state.crystalMassFormedG - 5.0 * delta);
      if (this.state.crystalMassFormedG <= 0.0) {
        this.state.grownCrystals = [];
        this.hasPlayedNucleationSound = false;
      }
    }

    // Verify quest milestones
    this.state.checkQuests();
  }
}

window.SolubilityEngine = SolubilityEngine;
