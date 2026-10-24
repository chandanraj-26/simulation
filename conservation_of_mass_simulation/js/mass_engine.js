/**
 * Law of Conservation of Mass — Physics & Chemical Kinetics Engine
 * Smooth flask tilting kinematics, ignition tube spill dynamics,
 * precipitate particle precipitation, and closed vs open gas transport.
 */

class MassEngine {
  constructor(state, soundEngine) {
    this.state = state;
    this.sound = soundEngine;
    this.tiltPhase = 'idle'; // 'idle' | 'tilting' | 'returning'
    this.wasHissing = false;
  }

  update(dt) {
    const delta = Math.min(dt, 0.1);
    const sys = MASS_DATA.systems[this.state.currentSystemId];

    // 1. Flask Tilting Kinematics
    if (this.state.isTilted) {
      const maxTilt = 0.72; // ~41 degrees
      const tiltSpeed = 1.4; // rad/s

      if (this.tiltPhase === 'idle') {
        this.tiltPhase = 'tilting';
        this.sound.playSlosh();
      }

      if (this.tiltPhase === 'tilting') {
        this.state.tiltAngle = Math.min(maxTilt, this.state.tiltAngle + tiltSpeed * delta);
        if (this.state.tiltAngle >= maxTilt) {
          // Ignition tube has emptied its contents into the flask
          this.state.mixed = true;
          this.sound.playPrecipitateWhoosh();
          this.tiltPhase = 'returning';
        }
      } else if (this.tiltPhase === 'returning') {
        this.state.tiltAngle = Math.max(0.0, this.state.tiltAngle - tiltSpeed * delta);
        if (this.state.tiltAngle <= 0.0) {
          this.state.isTilted = false;
          this.tiltPhase = 'idle';
        }
      }
    }

    // 2. Chemical Reaction Kinetics & Precipitation
    if (this.state.mixed && this.state.reactionProgress < 1.0) {
      this.state.reactionProgress = Math.min(1.0, this.state.reactionProgress + delta * 0.45);

      // Spawn precipitate particles
      if (Math.random() < 0.6 && this.state.particles.length < 90) {
        this.state.particles.push({
          xNorm: 0.35 + Math.random() * 0.30,
          yNorm: 0.65 + Math.random() * 0.10,
          vy: 0.08 + Math.random() * 0.08,
          vx: (Math.random() - 0.5) * 0.04,
          radius: 1.5 + Math.random() * 2.2,
          isGas: false
        });
      }
    }

    // 3. Gas System Escaped Gas Dynamics (Open vs Closed)
    if (this.state.mixed && sys.gasEvolved) {
      // Spawn bubbles
      if (Math.random() < 0.5 && this.state.particles.length < 120) {
        this.state.particles.push({
          xNorm: 0.35 + Math.random() * 0.30,
          yNorm: 0.75 + Math.random() * 0.15,
          vy: -(0.18 + Math.random() * 0.15),
          vx: (Math.random() - 0.5) * 0.02,
          radius: 1.8 + Math.random() * 2.5,
          isGas: true
        });
      }

      // If flask is uncorked, gas escapes causing visible mass deficit
      if (!this.state.isCorked) {
        if (this.state.escapedGasG < sys.gasMassG) {
          this.state.escapedGasG = Math.min(sys.gasMassG, this.state.escapedGasG + delta * 0.08);
          if (!this.wasHissing) {
            this.sound.playGasHiss();
            this.wasHissing = true;
          }
        }
      } else {
        this.wasHissing = false;
      }
    }

    // 4. Update visual particles
    for (let i = this.state.particles.length - 1; i >= 0; i--) {
      const p = this.state.particles[i];
      p.yNorm += p.vy * delta;
      p.xNorm += p.vx * delta;

      if (!p.isGas) {
        // Precipitate settles to flask bottom (~0.88)
        if (p.yNorm >= 0.88) {
          p.vy = 0;
          p.vx = 0;
        }
      } else {
        // Gas bubbles rise to liquid surface (~0.58) or escape if uncorked
        if (p.yNorm <= 0.58 && this.state.isCorked) {
          this.state.particles.splice(i, 1);
        } else if (p.yNorm <= 0.22 && !this.state.isCorked) {
          this.state.particles.splice(i, 1);
        }
      }
    }

    // Check quests
    this.state.checkQuests();
  }
}

window.MassEngine = MassEngine;
