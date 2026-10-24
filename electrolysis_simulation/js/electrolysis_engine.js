/**
 * Electrolysis & Electroplating — Physics & Electrochemical Engine
 * Implements Faraday's Laws of Electrolysis, Stoichiometric Gas Displacement,
 * Effervescent Bubble Buoyancy, and Copper Cathode Electrodeposition.
 */

class ElectrolysisEngine {
  constructor(state, soundEngine) {
    this.state = state;
    this.sound = soundEngine;
    this.lastTime = performance.now();
    this.wasBubbling = false;
  }

  update(dt) {
    // Clamp delta time to avoid large jumps if tab is inactive
    const delta = Math.min(dt, 0.1) * (this.state.simSpeed || 1.0);

    // 1. Calculate Electrochemical Current (Ohm's Law with overpotential)
    if (this.state.powerOn) {
      if (this.state.mode === 'water_splitting') {
        const decompThreshold = 1.78; // V (1.23V standard + Pt overpotential)
        if (this.state.voltage > decompThreshold) {
          this.state.current = (this.state.voltage - decompThreshold) / this.state.solutionResistance;
        } else {
          this.state.current = 0.0;
        }
      } else {
        // Electroplating Cu in CuSO4: low overpotential (~0.15 V)
        const plateThreshold = 0.15;
        if (this.state.voltage > plateThreshold) {
          this.state.current = (this.state.voltage - plateThreshold) / (this.state.solutionResistance * 0.85);
        } else {
          this.state.current = 0.0;
        }
      }
    } else {
      this.state.current = 0.0;
    }

    // 2. Sound Management for Effervescence
    const isActivelyBubbling = this.state.powerOn && this.state.current > 0.05;
    if (isActivelyBubbling && !this.wasBubbling) {
      this.sound.startBubblingSound();
      this.wasBubbling = true;
    } else if (!isActivelyBubbling && this.wasBubbling) {
      this.sound.stopBubblingSound();
      this.wasBubbling = false;
    }

    // 3. Integrate Faraday's Laws
    if (this.state.powerOn && this.state.current > 0.0) {
      this.state.timeElapsed += delta;

      // Accelerated lab timescale: 1 sec = 25 sec real time for engaging interactive learning
      const timeScaleFactor = 25.0;
      const effectiveDt = delta * timeScaleFactor;
      const coulombs = this.state.current * effectiveDt;
      const molElectrons = coulombs / ELECTROLYSIS_DATA.FARADAY_CONSTANT;

      if (this.state.mode === 'water_splitting') {
        // Mode A: Water Splitting
        // Cathode: 2H+ + 2e- -> H2 => mol H2 = mol e- / 2
        // Anode: 2H2O -> O2 + 4H+ + 4e- => mol O2 = mol e- / 4
        const molH2 = molElectrons / 2.0;
        const molO2 = molElectrons / 4.0;

        const deltaH2mL = molH2 * ELECTROLYSIS_DATA.MOLAR_GAS_VOLUME_STP * 1000.0;
        const deltaO2mL = molO2 * ELECTROLYSIS_DATA.MOLAR_GAS_VOLUME_STP * 1000.0;

        this.state.h2Volume = Math.min(this.state.maxTubeCapacity, this.state.h2Volume + deltaH2mL);
        this.state.o2Volume = Math.min(this.state.maxTubeCapacity, this.state.o2Volume + deltaO2mL);
      } else {
        // Mode B: Electroplating
        // Cu2+ + 2e- -> Cu(s)
        // m = (mol e- / 2) * M_Cu * 1000 mg/g
        const molCu = molElectrons / 2.0;
        const deltaCuMg = molCu * ELECTROLYSIS_DATA.electroplating.copperMolarMass * 1000.0;

        this.state.cuMassPlated += deltaCuMg;
        // Key area ~ 15 cm2, Cu density = 8.96 g/cm3
        // thickness in micrometers = (mass_g / (area * density)) * 10,000
        const massG = this.state.cuMassPlated / 1000.0;
        this.state.platingThicknessUm = (massG / (15.0 * 8.96)) * 10000.0;
      }

      this.state.checkQuests();
    }

    // 4. Update Splint Test Timer
    if (this.state.splintTestActive) {
      this.state.splintTestTimer -= delta;
      if (this.state.splintTestTimer <= 0) {
        this.state.splintTestActive = null;
      }
    }

    // 5. Spawn & Update Particles
    this.updateParticles(delta);
  }

  updateParticles(dt) {
    // Generate bubbles when current flows
    if (this.state.powerOn && this.state.current > 0.05) {
      const bubbleRate = Math.min(18, Math.max(3, Math.round(this.state.current * 4.5)));

      if (this.state.mode === 'water_splitting') {
        // Hydrogen cathode (left column): generates 2x bubbles
        for (let i = 0; i < bubbleRate * 2; i++) {
          if (Math.random() < 0.35) {
            this.state.bubbles.push({
              tube: 'h2',
              xOffset: (Math.random() - 0.5) * 22,
              yNorm: 0.90 + Math.random() * 0.05, // starts at platinum electrode base
              radius: 1.5 + Math.random() * 2.5,
              vy: 0.18 + Math.random() * 0.15,
              driftPhase: Math.random() * Math.PI * 2,
              gasType: 'H₂'
            });
          }
        }

        // Oxygen anode (right column): generates 1x bubbles
        for (let i = 0; i < bubbleRate; i++) {
          if (Math.random() < 0.35) {
            this.state.bubbles.push({
              tube: 'o2',
              xOffset: (Math.random() - 0.5) * 22,
              yNorm: 0.90 + Math.random() * 0.05,
              radius: 1.8 + Math.random() * 2.8,
              vy: 0.16 + Math.random() * 0.14,
              driftPhase: Math.random() * Math.PI * 2,
              gasType: 'O₂'
            });
          }
        }
      } else {
        // Electroplating: Cu2+ ion drift particles migrating from Anode (left) to Cathode Key (right)
        if (Math.random() < 0.45) {
          this.state.ions.push({
            xNorm: 0.28 + Math.random() * 0.05, // Near copper plate
            yNorm: 0.38 + Math.random() * 0.40,
            vxNorm: 0.08 + Math.random() * 0.07, // Drifts right towards key
            vyNorm: (Math.random() - 0.5) * 0.04,
            alpha: 1.0,
            radius: 2.0 + Math.random() * 1.5
          });
        }
      }
    }

    // Advance bubbles
    const maxH2Displacement = 0.20 + (this.state.h2Volume / this.state.maxTubeCapacity) * 0.55;
    const maxO2Displacement = 0.20 + (this.state.o2Volume / this.state.maxTubeCapacity) * 0.55;

    for (let i = this.state.bubbles.length - 1; i >= 0; i--) {
      const b = this.state.bubbles[i];
      b.yNorm -= b.vy * dt;
      b.driftPhase += dt * 5.0;

      const surfaceY = b.tube === 'h2' ? maxH2Displacement : maxO2Displacement;
      // Bubble pops when it reaches the liquid meniscus level
      if (b.yNorm <= surfaceY) {
        this.state.bubbles.splice(i, 1);
      }
    }

    // Advance ions
    for (let i = this.state.ions.length - 1; i >= 0; i--) {
      const ion = this.state.ions[i];
      ion.xNorm += ion.vxNorm * dt;
      ion.yNorm += ion.vyNorm * dt;
      ion.alpha -= dt * 0.35;

      // Arrives near cathode key (~0.68) or fades out
      if (ion.xNorm >= 0.68 || ion.alpha <= 0.0) {
        this.state.ions.splice(i, 1);
      }
    }
  }
}

window.ElectrolysisEngine = ElectrolysisEngine;
