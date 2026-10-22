/**
 * CardiacSim — Cardiac Cycle & Electrophysiology Engine
 * Accurately models the 7 phases of the cardiac cycle, Wiggers pressure-volume relationships,
 * Lead II ECG wave synthesis, heart valve dynamics, and blood particle flow.
 */

class CardiacEngine {
  constructor(state) {
    this.state = state;

    // Blood flow corpuscles (RBC particles)
    this.particles = [];
    this.initParticles(160);

    // Audio triggers flags
    this.s1Triggered = false;
    this.s2Triggered = false;
    this.rWaveTriggered = false;

    // Random timing jitter for AFib
    this.afibCycleModifier = 1.0;
  }

  initParticles(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      // Half in pulmonary/right side (venous/deoxygenated, blue), half in systemic/left side (arterial/oxygenated, red)
      const isSystemic = i >= count / 2;
      this.particles.push({
        id: i,
        isSystemic: isSystemic,
        t: Math.random(), // Track progress [0, 1]
        speed: 0.15 + Math.random() * 0.1,
        offset: (Math.random() - 0.5) * 14,
        size: 3.0 + Math.random() * 1.5,
        alpha: 0.6 + Math.random() * 0.4
      });
    }
  }

  update(dt) {
    if (!this.state.isRunning) return;

    // Cycle length T = 60 / BPM in seconds
    const cycleDuration = (60 / this.state.bpm) * this.afibCycleModifier;
    const phaseIncrement = (dt * this.state.simSpeed) / cycleDuration;

    const prevPhase = this.state.phase;
    this.state.phase = (this.state.phase + phaseIncrement) % 1.0;
    this.state.timeElapsed += dt;

    // Randomize next cycle length slightly if in AFib
    if (this.state.phase < prevPhase) {
      if (this.state.rhythm === 'afib') {
        this.afibCycleModifier = 0.8 + Math.random() * 0.45;
      } else {
        this.afibCycleModifier = 1.0;
      }
      this.s1Triggered = false;
      this.s2Triggered = false;
      this.rWaveTriggered = false;
    }

    const p = this.state.phase;

    // Determine current phase of cardiac cycle
    this.determinePhase(p);

    // Calculate live pressures, volumes, and ECG voltage
    const { lvP, aoP, laP } = this.calculatePressures(p);
    const vol = this.calculateVolume(p);
    const ecg = this.calculateECG(p);
    const pcg = this.calculatePCG(p);

    this.state.metrics.lvPressure = Math.round(lvP);
    this.state.metrics.aorticPressure = Math.round(aoP);
    this.state.metrics.laPressure = Math.round(laP);
    this.state.metrics.ecgMv = parseFloat(ecg.toFixed(3));

    // Update trace histories (push newest, shift oldest)
    this.state.ecgTrace.shift();
    this.state.ecgTrace.push(ecg);

    this.state.lvPressureTrace.shift();
    this.state.lvPressureTrace.push(lvP);

    this.state.aorticPressureTrace.shift();
    this.state.aorticPressureTrace.push(aoP);

    this.state.laPressureTrace.shift();
    this.state.laPressureTrace.push(laP);

    this.state.volumeTrace.shift();
    this.state.volumeTrace.push(vol);

    this.state.pcgTrace.shift();
    this.state.pcgTrace.push(pcg);

    // Update Electrical Conduction system status
    this.updateConduction(p);

    // Update Blood particles
    this.updateParticles(dt, p);

    // Check Audio Sound triggers
    this.checkAudioTriggers(p, prevPhase);
  }

  determinePhase(p) {
    // 7 Classical Phases of Cardiac Cycle
    // Normal cycle standard phase intervals:
    // 1. Atrial Systole: [0.00 - 0.12)
    // 2. Isovolumetric Contraction: [0.12 - 0.18)
    // 3. Rapid Ventricular Ejection: [0.18 - 0.35)
    // 4. Reduced Ventricular Ejection: [0.35 - 0.45)
    // 5. Isovolumetric Relaxation: [0.45 - 0.52)
    // 6. Rapid Ventricular Filling: [0.52 - 0.70)
    // 7. Diastasis (Reduced Filling): [0.70 - 1.00)

    if (p < 0.12) {
      this.state.metrics.phaseNumber = 1;
      this.state.metrics.currentPhaseName = '1. Atrial Systole (P-wave Active Filling)';
      this.state.valves.tricuspid = true;
      this.state.valves.mitral = true;
      this.state.valves.pulmonic = false;
      this.state.valves.aortic = false;
    } else if (p < 0.18) {
      this.state.metrics.phaseNumber = 2;
      this.state.metrics.currentPhaseName = '2. Isovolumetric Contraction (All Valves Closed, S1)';
      this.state.valves.tricuspid = false;
      this.state.valves.mitral = false;
      this.state.valves.pulmonic = false;
      this.state.valves.aortic = false;
      this.state.checkQuest('quest-wiggers-s1');
    } else if (p < 0.35) {
      this.state.metrics.phaseNumber = 3;
      this.state.metrics.currentPhaseName = '3. Rapid Ventricular Ejection (SL Valves Open)';
      this.state.valves.tricuspid = false;
      this.state.valves.mitral = false;
      this.state.valves.pulmonic = true;
      this.state.valves.aortic = true;
    } else if (p < 0.45) {
      this.state.metrics.phaseNumber = 4;
      this.state.metrics.currentPhaseName = '4. Reduced Ejection (Ventricular Repolarization)';
      this.state.valves.tricuspid = false;
      this.state.valves.mitral = false;
      this.state.valves.pulmonic = true;
      this.state.valves.aortic = true;
    } else if (p < 0.52) {
      this.state.metrics.phaseNumber = 5;
      this.state.metrics.currentPhaseName = '5. Isovolumetric Relaxation (All Valves Closed, S2)';
      this.state.valves.tricuspid = false;
      this.state.valves.mitral = false;
      this.state.valves.pulmonic = false;
      this.state.valves.aortic = false;
    } else if (p < 0.70) {
      this.state.metrics.phaseNumber = 6;
      this.state.metrics.currentPhaseName = '6. Rapid Ventricular Filling (AV Valves Open)';
      this.state.valves.tricuspid = true;
      this.state.valves.mitral = true;
      this.state.valves.pulmonic = false;
      this.state.valves.aortic = false;
    } else {
      this.state.metrics.phaseNumber = 7;
      this.state.metrics.currentPhaseName = '7. Diastasis (Reduced Passive Filling)';
      this.state.valves.tricuspid = true;
      this.state.valves.mitral = true;
      this.state.valves.pulmonic = false;
      this.state.valves.aortic = false;
    }

    // Pathological valve leaks
    if (this.state.rhythm === 'regurgitation') {
      // Incompetent mitral valve leaks during systole
      if (p >= 0.12 && p < 0.45) {
        this.state.valves.mitral = true; // backward leak
      }
    }
  }

  calculatePressures(p) {
    const sysPeak = this.state.metrics.bpSys;
    const diaBase = this.state.metrics.bpDia;
    let lvP = 8;
    let aoP = diaBase;
    let laP = 6;

    if (p < 0.12) {
      // Atrial Systole: LA contracts slightly, pushing atrial pressure up ('a' wave)
      const subP = p / 0.12;
      laP = 6 + 6 * Math.sin(subP * Math.PI);
      lvP = 6 + 4 * Math.sin(subP * Math.PI);
      aoP = diaBase - (diaBase * 0.08 * (p / 0.12));
    } else if (p < 0.18) {
      // Isovolumetric Contraction: LV pressure rockets from 10 to diaBase (80 mmHg)
      const subP = (p - 0.12) / 0.06;
      lvP = 10 + (diaBase - 10) * Math.pow(subP, 1.8);
      aoP = diaBase - 2;
      laP = 8 + 3 * Math.sin(subP * Math.PI); // 'c' wave from AV valve bulging
    } else if (p < 0.35) {
      // Rapid Ejection: LV and Aorta track together up to peak systolic
      const subP = (p - 0.18) / 0.17;
      const angle = (subP * Math.PI * 0.7);
      const pressureRise = (sysPeak - diaBase) * Math.sin(angle);
      
      let peakMultiplier = 1.0;
      if (this.state.rhythm === 'stenosis') {
        peakMultiplier = 1.6; // High LV pressure gradient in aortic stenosis
      }

      lvP = diaBase + pressureRise * peakMultiplier;
      aoP = diaBase + pressureRise;
      laP = 5 + 3 * subP;
    } else if (p < 0.45) {
      // Reduced Ejection: Pressures begin dropping together
      const subP = (p - 0.35) / 0.10;
      const remaining = Math.cos(subP * Math.PI * 0.5);
      lvP = diaBase + (sysPeak - diaBase) * 0.7 * remaining;
      aoP = diaBase + (sysPeak - diaBase) * 0.75 * remaining;
      laP = 7 + 2 * subP;
    } else if (p < 0.52) {
      // Isovolumetric Relaxation: LV plunges below atrial pressure; Aorta exhibits Dicrotic Notch!
      const subP = (p - 0.45) / 0.07;
      lvP = (diaBase * 0.75) * (1 - Math.pow(subP, 0.7)) + 6;
      
      // Dicrotic notch (incisura) rebound in aortic pressure
      const dicroticBump = 10 * Math.sin(subP * Math.PI * 2) * Math.exp(-subP * 3);
      aoP = diaBase + (sysPeak - diaBase) * 0.35 + dicroticBump;
      laP = 9 + 4 * Math.sin(subP * Math.PI); // 'v' wave from venous filling
    } else if (p < 0.70) {
      // Rapid Filling: LV is near bottom (5-8 mmHg), Aorta gradually slopes down
      const subP = (p - 0.52) / 0.18;
      lvP = 5 + 4 * subP;
      aoP = diaBase + 12 * (1 - subP);
      laP = 9 - 3 * subP;
    } else {
      // Diastasis: Slow passive filling
      const subP = (p - 0.70) / 0.30;
      lvP = 8 + 3 * subP;
      aoP = diaBase * (1 - 0.08 * subP);
      laP = 6;
    }

    return { lvP: Math.max(3, lvP), aoP: Math.max(40, aoP), laP: Math.max(2, laP) };
  }

  calculateVolume(p) {
    const edv = this.state.metrics.edv;
    const esv = this.state.metrics.esv;
    const sv = edv - esv;

    if (p < 0.12) {
      // Atrial kick adds final 15-20%
      const subP = p / 0.12;
      return (edv - sv * 0.15) + (sv * 0.15) * Math.sin(subP * Math.PI * 0.5);
    } else if (p < 0.18) {
      // Isovolumetric Contraction: Volume constant at EDV
      return edv;
    } else if (p < 0.35) {
      // Rapid Ejection: 70% of stroke volume ejected
      const subP = (p - 0.18) / 0.17;
      return edv - (sv * 0.70) * Math.sin(subP * Math.PI * 0.5);
    } else if (p < 0.45) {
      // Reduced Ejection: remaining 30% ejected down to ESV
      const subP = (p - 0.35) / 0.10;
      return (edv - sv * 0.70) - (sv * 0.30) * Math.sin(subP * Math.PI * 0.5);
    } else if (p < 0.52) {
      // Isovolumetric Relaxation: Volume constant at ESV
      return esv;
    } else if (p < 0.70) {
      // Rapid Filling: 70% of stroke volume filled rapidly
      const subP = (p - 0.52) / 0.18;
      return esv + (sv * 0.70) * Math.sin(subP * Math.PI * 0.5);
    } else {
      // Diastasis: slow gradual filling
      const subP = (p - 0.70) / 0.30;
      return (esv + sv * 0.70) + (sv * 0.15) * subP;
    }
  }

  calculateECG(p) {
    // Lead II ECG Synthesis with high fidelity Gaussian components
    // Special Pathology Modifiers:
    if (this.state.rhythm === 'afib') {
      // No P-wave, fibrillatory baseline noise, irregular QRS
      const noise = (Math.sin(p * 70) * 0.04 + Math.cos(p * 110) * 0.03);
      if (p >= 0.13 && p < 0.20) {
        // Narrow irregular QRS
        const sub = (p - 0.15) / 0.02;
        return 1.1 * Math.exp(-Math.pow(sub, 2) * 4) + noise;
      }
      return noise;
    }

    if (this.state.rhythm === 'vtach') {
      // Wide bizarre monomorphic complexes, rate high, no P wave
      const sub = (p - 0.25) / 0.16;
      return (1.2 * Math.sin(sub * Math.PI)) * Math.exp(-Math.pow(sub, 2) * 2);
    }

    let voltage = 0.0;

    // 1. P-Wave (Atrial Depolarization): centered at p = 0.06
    if (p >= 0.01 && p <= 0.11) {
      const u = (p - 0.06) / 0.025;
      voltage += 0.18 * Math.exp(-0.5 * u * u);
    }

    // 2. Q-Wave (Interventricular Septum Depolarization): negative dip at p = 0.135
    if (p >= 0.125 && p <= 0.145) {
      const u = (p - 0.135) / 0.007;
      voltage -= 0.12 * Math.exp(-0.5 * u * u);
    }

    // 3. R-Wave (Ventricular Main Depolarization): tall sharp peak at p = 0.15
    if (p >= 0.138 && p <= 0.165) {
      const u = (p - 0.150) / 0.007;
      voltage += 1.25 * Math.exp(-0.5 * u * u);
    }

    // 4. S-Wave (Late Ventricular Base Depolarization): negative dip at p = 0.168
    if (p >= 0.160 && p <= 0.180) {
      const u = (p - 0.168) / 0.007;
      voltage -= 0.32 * Math.exp(-0.5 * u * u);
    }

    // 5. T-Wave (Ventricular Repolarization): broad asymmetric wave around p = 0.38
    if (p >= 0.28 && p <= 0.48) {
      const u = (p - 0.38) / 0.055;
      voltage += 0.32 * Math.exp(-0.5 * u * u);
    }

    // Isoelectric baseline noise floor (subtle real bio-signal jitter)
    voltage += (Math.sin(p * 200) * 0.008);

    return voltage;
  }

  calculatePCG(p) {
    // Phonocardiogram (heart sounds signal)
    let pcg = 0.0;

    // S1 sound around p = 0.14 - 0.18 (AV valve closure)
    if (p >= 0.14 && p <= 0.18) {
      const u = (p - 0.16) / 0.015;
      pcg += Math.sin((p - 0.14) * 250) * Math.exp(-0.5 * u * u) * 0.8;
    }

    // S2 sound around p = 0.45 - 0.50 (SL valve closure)
    if (p >= 0.45 && p <= 0.50) {
      const u = (p - 0.475) / 0.015;
      pcg += Math.sin((p - 0.45) * 400) * Math.exp(-0.5 * u * u) * 0.9;
    }

    // Pathological Murmurs
    if (this.state.rhythm === 'stenosis') {
      // Systolic ejection diamond murmur between S1 and S2
      if (p > 0.18 && p < 0.45) {
        const env = Math.sin(((p - 0.18) / 0.27) * Math.PI);
        pcg += (Math.random() - 0.5) * 0.65 * env;
      }
    } else if (this.state.rhythm === 'regurgitation') {
      // Holosystolic plateau murmur
      if (p >= 0.15 && p <= 0.45) {
        pcg += (Math.random() - 0.5) * 0.5;
      }
    }

    return pcg;
  }

  updateConduction(p) {
    // Map electrical wave propagation along conduction pathways
    // 1. SA Node: fires at p = 0.00
    this.state.conduction.saFired = (p < 0.08);
    if (p < 0.05) {
      this.state.checkQuest('quest-pacemaker');
    }

    // 2. Atrial Depolarization: p = [0.02 - 0.10]
    if (p >= 0.02 && p <= 0.10) {
      this.state.conduction.atriaDepol = 1.0 - Math.abs((p - 0.06) / 0.04);
    } else {
      this.state.conduction.atriaDepol = 0.0;
    }

    // 3. AV Node Delay (0.12s pause): p = [0.08 - 0.13]
    if (p >= 0.08 && p <= 0.13) {
      this.state.conduction.avNodeDelay = 1.0 - Math.abs((p - 0.105) / 0.025);
    } else {
      this.state.conduction.avNodeDelay = 0.0;
    }

    // 4. Bundle of His & Purkinje fibers: p = [0.13 - 0.17]
    if (p >= 0.13 && p <= 0.18) {
      this.state.conduction.hisPurkinje = 1.0 - Math.abs((p - 0.15) / 0.025);
      this.state.conduction.ventricleDepol = 1.0;
    } else {
      this.state.conduction.hisPurkinje = 0.0;
      this.state.conduction.ventricleDepol = 0.0;
    }

    // 5. Ventricular Repolarization (T-wave): p = [0.30 - 0.46]
    if (p >= 0.30 && p <= 0.46) {
      this.state.conduction.ventricleRepol = 1.0 - Math.abs((p - 0.38) / 0.08);
    } else {
      this.state.conduction.ventricleRepol = 0.0;
    }
  }

  updateParticles(dt, p) {
    // Accelerate particles when corresponding valves are open and pumping
    let rightVelocity = 0.2;
    let leftVelocity = 0.2;

    if (this.state.valves.aortic) {
      leftVelocity = 0.8; // Ejection blast into Aorta
    } else if (this.state.valves.mitral) {
      leftVelocity = 0.5; // Inflow from LA into LV
    }

    if (this.state.valves.pulmonic) {
      rightVelocity = 0.8;
    } else if (this.state.valves.tricuspid) {
      rightVelocity = 0.5;
    }

    for (const part of this.particles) {
      const v = part.isSystemic ? leftVelocity : rightVelocity;
      part.t += (dt * part.speed * v * this.state.simSpeed);
      if (part.t > 1.0) {
        part.t -= 1.0;
        part.offset = (Math.random() - 0.5) * 14;
      }
    }
  }

  checkAudioTriggers(p, prevPhase) {
    // S1 trigger (Isovolumetric contraction, closure of AV valves)
    if (p >= 0.14 && prevPhase < 0.14 && !this.s1Triggered) {
      this.s1Triggered = true;
      if (window.cardiacSound) {
        window.cardiacSound.playS1();
      }
    }

    // R-Wave ECG monitor beep trigger
    if (p >= 0.15 && prevPhase < 0.15 && !this.rWaveTriggered) {
      this.rWaveTriggered = true;
      if (window.cardiacSound && this.state.monitorBeep) {
        window.cardiacSound.playECGBeep();
      }
    }

    // S2 trigger (Isovolumetric relaxation, closure of Semilunar valves)
    if (p >= 0.46 && prevPhase < 0.46 && !this.s2Triggered) {
      this.s2Triggered = true;
      if (window.cardiacSound) {
        window.cardiacSound.playS2();
      }
    }
  }
}

// Attach engine to window
window.CardiacEngine = CardiacEngine;
