/**
 * Reactivity Series — Kinetics & Thermochemistry Physics Engine
 * Evaluates standard reduction potentials, exothermic heat release,
 * precipitation kinetics, dendritic silver crystal growth, and bubble physics.
 */

class ReactivityEngine {
  constructor(state, soundEngine) {
    this.state = state;
    this.sound = soundEngine;
    this.wasFizzing = false;
  }

  update(dt) {
    const delta = Math.min(dt, 0.1);
    let anyActiveReaction = false;

    for (const tube of this.state.tubes) {
      if (!tube.isSubmerged || !tube.metalId) continue;

      const key = `${tube.metalId}+${tube.solutionId}`;
      const rxn = REACTIVITY_DATA.reactions[key];

      if (rxn && rxn.occurs) {
        anyActiveReaction = true;

        // Advance reaction progress
        if (tube.reactionProgress < 1.0) {
          tube.reactionProgress = Math.min(1.0, tube.reactionProgress + rxn.rate * delta);
          tube.temperatureC = 25.0 + rxn.deltaTempC * tube.reactionProgress;

          // Spawn effervescent fizz bubbles
          if (Math.random() < 0.4) {
            tube.bubbles.push({
              xNorm: 0.35 + Math.random() * 0.30,
              yNorm: 0.75 + Math.random() * 0.15,
              vy: 0.15 + Math.random() * 0.12,
              radius: 1.2 + Math.random() * 1.6,
              wobble: Math.random() * Math.PI * 2
            });
          }

          // Spawn silver dendritic crystals if Cu in AgNO3
          if (rxn.depositType === 'silver_crystals' && Math.random() < 0.25 && tube.crystals.length < 45) {
            const side = Math.random() < 0.5 ? -1 : 1;
            tube.crystals.push({
              yNorm: 0.48 + Math.random() * 0.36,
              len: 4 + Math.random() * 8,
              angle: (side * (Math.PI / 4 + (Math.random() - 0.5) * 0.4)),
              thickness: 1.5 + Math.random() * 1.5,
              alpha: 0.9
            });
            if (Math.random() < 0.1) {
              this.sound.playCrystalTinkle();
            }
          }
        }
      } else {
        // No reaction: temperature stays ambient, progress is zero
        tube.temperatureC = 25.0;
        tube.reactionProgress = 0.0;
      }

      // Update bubbles
      for (let i = tube.bubbles.length - 1; i >= 0; i--) {
        const b = tube.bubbles[i];
        b.yNorm -= b.vy * delta;
        b.wobble += delta * 6.0;
        // Reach solution surface (~0.38)
        if (b.yNorm <= 0.38) {
          tube.bubbles.splice(i, 1);
        }
      }
    }

    // Audio management for effervescence
    if (anyActiveReaction && !this.wasFizzing) {
      this.sound.startFizzing();
      this.wasFizzing = true;
    } else if (!anyActiveReaction && this.wasFizzing) {
      this.sound.stopFizzing();
      this.wasFizzing = false;
    }

    // Verify quest milestones
    this.state.checkQuests();
  }
}

window.ReactivityEngine = ReactivityEngine;
