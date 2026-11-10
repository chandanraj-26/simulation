/**
 * Exothermic vs Endothermic Reaction Calorimeter Virtual Lab
 * NCERT Class 10 & 11 Chemistry (Thermochemistry & Enthalpy of Reaction)
 * High-fidelity virtual laboratory featuring realistic Dewar vacuum flask,
 * magnetic vortex stirrer, dissolving crystal dynamics, steam/frost effects,
 * and precision digital probe instrumentation.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.stirrerOsc = null;
    this.stirrerGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  playReactionSizzle() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Noise buffer for boiling/fizzing sound
    const bufferSize = Math.floor(this.ctx.sampleRate * 1.2);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playFrostChime() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const notes = [1046.5, 1318.5, 1567.98]; // C6, E6, G6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
      }, idx * 60);
    });
  }

  playBeep() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  toggleStirrer(enable) {
    if (!this.enabled || !enable) {
      if (this.stirrerOsc) {
        try {
          this.stirrerGain.gain.setValueAtTime(0, this.ctx.currentTime);
          this.stirrerOsc.stop();
          this.stirrerOsc.disconnect();
        } catch (e) {}
        this.stirrerOsc = null;
        this.stirrerGain = null;
      }
      return;
    }

    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.stirrerOsc) return;

    this.stirrerOsc = this.ctx.createOscillator();
    this.stirrerGain = this.ctx.createGain();

    this.stirrerOsc.type = 'sine';
    this.stirrerOsc.frequency.setValueAtTime(75, this.ctx.currentTime);

    this.stirrerGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

    this.stirrerOsc.connect(this.stirrerGain);
    this.stirrerGain.connect(this.ctx.destination);
    this.stirrerOsc.start();
  }
}

class CalorimeterSimulation {
  constructor() {
    this.canvas = document.getElementById('simCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundEngine();

    // Reaction database with thermodynamic parameters
    this.reactions = {
      quicklime: {
        id: 'quicklime',
        name: 'Quicklime + Water',
        formula: 'CaO(s) + H₂O(l) → Ca(OH)₂(aq)',
        type: 'EXOTHERMIC',
        deltaH: -65.2, // kJ / mol
        molarMass: 56.08, // g/mol
        solubilityMax: 30, // max grams
        colorBase: 'rgba(254, 243, 199, 0.75)',
        colorHot: 'rgba(254, 215, 170, 0.95)',
        hasSteam: true
      },
      cacl2: {
        id: 'cacl2',
        name: 'Calcium Chloride Dissolution',
        formula: 'CaCl₂(s) → Ca²⁺(aq) + 2Cl⁻(aq)',
        type: 'EXOTHERMIC',
        deltaH: -81.3, // kJ / mol
        molarMass: 110.98,
        solubilityMax: 40,
        colorBase: 'rgba(224, 242, 254, 0.7)',
        colorHot: 'rgba(253, 186, 116, 0.9)',
        hasSteam: true
      },
      nh4no3: {
        id: 'nh4no3',
        name: 'Ammonium Nitrate (Cold Pack)',
        formula: 'NH₄NO₃(s) → NH₄⁺(aq) + NO₃⁻(aq)',
        type: 'ENDOTHERMIC',
        deltaH: +25.7, // kJ / mol
        molarMass: 80.04,
        solubilityMax: 40,
        colorBase: 'rgba(224, 242, 254, 0.7)',
        colorHot: 'rgba(186, 230, 253, 0.9)',
        hasFrost: true
      },
      urea: {
        id: 'urea',
        name: 'Urea Dissolution',
        formula: 'CO(NH₂)₂(s) → CO(NH₂)₂(aq)',
        type: 'ENDOTHERMIC',
        deltaH: +15.3, // kJ / mol
        molarMass: 60.06,
        solubilityMax: 40,
        colorBase: 'rgba(240, 249, 255, 0.7)',
        colorHot: 'rgba(207, 250, 254, 0.85)',
        hasFrost: true
      },
      neutralization: {
        id: 'neutralization',
        name: 'Acid-Base Neutralization',
        formula: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
        type: 'EXOTHERMIC',
        deltaH: -57.1, // kJ / mol
        molarMass: 39.997,
        solubilityMax: 20,
        colorBase: 'rgba(240, 249, 255, 0.7)',
        colorHot: 'rgba(254, 202, 202, 0.85)',
        hasSteam: false
      }
    };

    this.currentReactionId = 'quicklime';
    this.ambientTemp = 25.0; // °C
    this.currentTemp = 25.0;
    this.initialTemp = 25.0;
    this.targetTemp = 25.0;

    this.reagentMass = 10.0; // g
    this.waterVolume = 100.0; // mL = grams
    this.isStirring = true;
    this.stirAngle = 0;

    // Reaction progression
    this.reactionActive = false;
    this.reactionProgress = 0; // 0 to 1
    this.heatJoules = 0;
    this.simTime = 0;

    // Interactive powder granules & steam/frost particle systems
    this.crystals = [];
    this.steamParticles = [];
    this.chartHistory = [{ time: 0, temp: 25.0 }];

    // Geometry
    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    this.initDOM();
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.lastFrameTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initDOM() {
    this.selectReaction = document.getElementById('selectReaction');
    this.sliderMass = document.getElementById('sliderMass');
    this.valMass = document.getElementById('valMass');
    this.sliderWater = document.getElementById('sliderWater');
    this.valWater = document.getElementById('valWater');
    this.chkStirrer = document.getElementById('chkStirrer');
    this.btnStart = document.getElementById('btnStart');
    this.btnReset = document.getElementById('btnReset');
    this.btnResetAll = document.getElementById('btnResetAll');
    this.btnSound = document.getElementById('btnSound');

    // Telemetry readouts
    this.readoutTemp = document.getElementById('readoutTemp');
    this.readoutDeltaT = document.getElementById('readoutDeltaT');
    this.readoutHeat = document.getElementById('readoutHeat');
    this.readoutDeltaH = document.getElementById('readoutDeltaH');
    this.readoutType = document.getElementById('readoutType');

    // Modals
    this.btnTheory = document.getElementById('btnTheory');
    this.modalTheory = document.getElementById('modalTheory');
    this.btnCloseTheory = document.getElementById('btnCloseTheory');

    if (this.selectReaction) {
      this.selectReaction.addEventListener('change', (e) => {
        this.currentReactionId = e.target.value;
        this.resetCalorimeter();
        this.sound.playClick();
      });
    }

    if (this.sliderMass) {
      this.sliderMass.addEventListener('input', (e) => {
        this.reagentMass = parseFloat(e.target.value);
        if (this.valMass) this.valMass.textContent = `${this.reagentMass.toFixed(1)} g`;
      });
    }

    if (this.sliderWater) {
      this.sliderWater.addEventListener('input', (e) => {
        this.waterVolume = parseFloat(e.target.value);
        if (this.valWater) this.valWater.textContent = `${this.waterVolume.toFixed(0)} mL`;
      });
    }

    if (this.chkStirrer) {
      this.chkStirrer.addEventListener('change', (e) => {
        this.isStirring = e.target.checked;
        this.sound.toggleStirrer(this.isStirring);
      });
    }

    if (this.btnStart) {
      this.btnStart.addEventListener('click', () => {
        this.triggerReaction();
      });
    }

    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => {
        this.resetCalorimeter();
        this.sound.playClick();
      });
    }

    if (this.btnResetAll) {
      this.btnResetAll.addEventListener('click', () => {
        this.resetCalorimeter();
        this.currentReactionId = 'quicklime';
        if (this.selectReaction) this.selectReaction.value = 'quicklime';
        this.reagentMass = 10.0;
        if (this.sliderMass) this.sliderMass.value = 10;
        if (this.valMass) this.valMass.textContent = '10.0 g';
        this.waterVolume = 100.0;
        if (this.sliderWater) this.sliderWater.value = 100;
        if (this.valWater) this.valWater.textContent = '100 mL';
        this.isStirring = true;
        if (this.chkStirrer) this.chkStirrer.checked = true;
        this.sound.toggleStirrer(true);
        this.sound.playClick();
      });
    }

    if (this.btnSound) {
      this.btnSound.addEventListener('click', () => {
        this.sound.enabled = !this.sound.enabled;
        this.btnSound.textContent = this.sound.enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
      });
    }

    if (this.btnTheory && this.modalTheory) {
      this.btnTheory.addEventListener('click', () => this.modalTheory.classList.add('open'));
    }
    if (this.btnCloseTheory && this.modalTheory) {
      this.btnCloseTheory.addEventListener('click', () => this.modalTheory.classList.remove('open'));
    }

    this.sound.toggleStirrer(this.isStirring);
  }

  triggerReaction() {
    if (this.reactionActive) return;
    this.reactionActive = true;
    this.reactionProgress = 0;
    this.initialTemp = this.currentTemp;

    const rxn = this.reactions[this.currentReactionId];
    const moles = this.reagentMass / rxn.molarMass;
    const cWater = 4.184; // J/(g·°C)
    // q_reaction = n * ΔH
    // q_water = -q_reaction = m * c * ΔT
    const qReactionJ = moles * rxn.deltaH * 1000;
    const qWaterJ = -qReactionJ;
    this.heatJoules = Math.abs(qWaterJ);

    const deltaTTheoretical = qWaterJ / (this.waterVolume * cWater);
    this.targetTemp = Math.max(1.5, Math.min(98.5, this.initialTemp + deltaTTheoretical));

    // Spawn falling crystals into the chamber
    this.spawnCrystals(35);

    if (rxn.type === 'EXOTHERMIC') {
      this.sound.playReactionSizzle();
    } else {
      this.sound.playFrostChime();
    }
  }

  resetCalorimeter() {
    this.currentTemp = this.ambientTemp;
    this.initialTemp = this.ambientTemp;
    this.targetTemp = this.ambientTemp;
    this.reactionActive = false;
    this.reactionProgress = 0;
    this.heatJoules = 0;
    this.simTime = 0;
    this.chartHistory = [{ time: 0, temp: this.ambientTemp }];
    this.crystals = [];
    this.steamParticles = [];
    this.updateTelemetry();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  spawnCrystals(count) {
    const cx = this.width * 0.28;
    const cy = this.height * 0.44;

    for (let i = 0; i < count; i++) {
      this.crystals.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy - 60 - Math.random() * 30,
        vy: 40 + Math.random() * 60,
        vx: (Math.random() - 0.5) * 20,
        size: 2.5 + Math.random() * 3,
        alpha: 1.0,
        dissolved: false
      });
    }
  }

  spawnSteam(count) {
    const cx = this.width * 0.28;
    const topY = this.height * 0.32;

    for (let i = 0; i < count; i++) {
      this.steamParticles.push({
        x: cx + (Math.random() - 0.5) * 30,
        y: topY,
        vx: (Math.random() - 0.5) * 15,
        vy: -25 - Math.random() * 35,
        radius: 3 + Math.random() * 4,
        alpha: 0.65
      });
    }
  }

  animate(now) {
    const dt = Math.min((now - this.lastFrameTime) / 1000, 0.05);
    this.lastFrameTime = now;
    this.simTime += dt;

    if (this.isStirring) {
      this.stirAngle += 16 * dt;
    }

    // Reaction progression
    if (this.reactionActive) {
      this.reactionProgress += dt * 0.22; // ~4.5 seconds reaction time
      if (this.reactionProgress >= 1) {
        this.reactionProgress = 1;
        this.reactionActive = false;
        this.sound.playBeep();
      }

      // Sigmoid-like smooth progression
      const ease = this.reactionProgress * this.reactionProgress * (3 - 2 * this.reactionProgress);
      this.currentTemp = this.initialTemp + (this.targetTemp - this.initialTemp) * ease;

      const rxn = this.reactions[this.currentReactionId];
      if (rxn.hasSteam && this.currentTemp > 38 && Math.random() < 0.35) {
        this.spawnSteam(2);
      }
    } else {
      // Newton's law of cooling back towards ambient
      const k = 0.005;
      this.currentTemp += (this.ambientTemp - this.currentTemp) * k * dt;
    }

    // Update dissolving crystals
    const chamberBottomY = this.height * 0.66;
    for (let i = this.crystals.length - 1; i >= 0; i--) {
      const c = this.crystals[i];
      c.x += c.vx * dt;
      c.y += c.vy * dt;

      if (c.y > chamberBottomY - 10) {
        c.y = chamberBottomY - 10;
        c.alpha -= dt * 0.6; // dissolve on bottom
        if (c.alpha <= 0) {
          this.crystals.splice(i, 1);
        }
      }
    }

    // Update billowing steam particles
    for (let i = this.steamParticles.length - 1; i >= 0; i--) {
      const sp = this.steamParticles[i];
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.radius += 5 * dt;
      sp.alpha -= 0.5 * dt;
      if (sp.alpha <= 0) {
        this.steamParticles.splice(i, 1);
      }
    }

    // Record temperature history for strip chart
    const lastPoint = this.chartHistory[this.chartHistory.length - 1];
    if (!lastPoint || this.simTime - lastPoint.time >= 0.15) {
      this.chartHistory.push({ time: this.simTime, temp: this.currentTemp });
      if (this.chartHistory.length > 220) {
        this.chartHistory.shift();
      }
    }

    this.render(now * 0.001);
    this.updateTelemetry();

    requestAnimationFrame(this.animate);
  }

  updateTelemetry() {
    const rxn = this.reactions[this.currentReactionId];
    const deltaT = this.currentTemp - this.initialTemp;

    if (this.readoutTemp) {
      this.readoutTemp.textContent = `${this.currentTemp.toFixed(1)} °C`;
    }
    if (this.readoutDeltaT) {
      const sign = deltaT >= 0 ? '+' : '';
      this.readoutDeltaT.textContent = `${sign}${deltaT.toFixed(1)} °C`;
    }
    if (this.readoutHeat) {
      this.readoutHeat.textContent = `${this.heatJoules.toFixed(0)} J`;
    }
    if (this.readoutDeltaH) {
      const sign = rxn.deltaH > 0 ? '+' : '';
      this.readoutDeltaH.textContent = `${sign}${rxn.deltaH.toFixed(1)} kJ/mol`;
    }
    if (this.readoutType) {
      this.readoutType.textContent = rxn.type;
      this.readoutType.style.color = rxn.type === 'EXOTHERMIC' ? '#DC2626' : '#0284C7';
    }
  }

  render(t) {
    if (!this.ctx || this.width === 0) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Grid
    this.drawRoomGrid(ctx);

    // 2. Bench Table
    const benchY = this.height * 0.82;
    this.drawLabBench(ctx, benchY);

    // 3. Dewar Vacuum Calorimeter
    const calCx = this.width * 0.28;
    this.drawDewarCalorimeter(ctx, calCx, benchY, t);

    // 4. Live Strip Chart
    this.drawStripChart(ctx);
  }

  drawRoomGrid(ctx) {
    ctx.strokeStyle = '#DDEAF8';
    ctx.lineWidth = 1;
    const step = 32;
    for (let x = 0; x < this.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
  }

  drawLabBench(ctx, benchY) {
    ctx.save();
    // Bench countertop
    const topGrad = ctx.createLinearGradient(0, benchY, 0, benchY + 16);
    topGrad.addColorStop(0, '#E2E8F0');
    topGrad.addColorStop(1, '#CBD5E1');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, benchY, this.width, 16);

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, benchY + 1);
    ctx.lineTo(this.width, benchY + 1);
    ctx.stroke();

    // Fascia
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, benchY + 16, this.width, this.height - benchY - 16);
    ctx.restore();
  }

  drawDewarCalorimeter(ctx, cx, benchY, t) {
    const vesselW = 160;
    const vesselH = 210;
    const vesselTop = benchY - vesselH;
    const rxn = this.reactions[this.currentReactionId];

    ctx.save();

    // Shadow under calorimeter base
    ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
    ctx.beginPath();
    ctx.ellipse(cx, benchY, vesselW / 2 + 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. Outer Insulating Jacket (Brushed Silver / Anodized Aluminum)
    const jacketGrad = ctx.createLinearGradient(cx - vesselW / 2, 0, cx + vesselW / 2, 0);
    jacketGrad.addColorStop(0, '#94A3B8');
    jacketGrad.addColorStop(0.2, '#F1F5F9');
    jacketGrad.addColorStop(0.5, '#CBD5E1');
    jacketGrad.addColorStop(0.8, '#E2E8F0');
    jacketGrad.addColorStop(1, '#64748B');

    ctx.fillStyle = jacketGrad;
    ctx.beginPath();
    ctx.roundRect(cx - vesselW / 2, vesselTop, vesselW, vesselH, [8, 8, 12, 12]);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Embossed Laboratory Label on outer jacket
    ctx.font = '700 9px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'center';
    ctx.fillText('DEWAR CALORIMETER 300mL', cx, benchY - 14);

    // 2. Double-Walled Silvered Glass Vacuum Liner (Dewar Cross-Section Cutout)
    const linerW = vesselW - 32;
    const linerH = vesselH - 32;
    const linerTop = vesselTop + 24;

    const dewarGrad = ctx.createLinearGradient(cx - linerW / 2, 0, cx + linerW / 2, 0);
    dewarGrad.addColorStop(0, '#E2E8F0');
    dewarGrad.addColorStop(0.3, '#FFFFFF');
    dewarGrad.addColorStop(0.7, '#E0F2FE');
    dewarGrad.addColorStop(1, '#CBD5E1');

    ctx.fillStyle = dewarGrad;
    ctx.beginPath();
    ctx.roundRect(cx - linerW / 2, linerTop, linerW, linerH, [0, 0, 10, 10]);
    ctx.fill();
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Liquid Solution & Vortex
    const waterFrac = this.waterVolume / 250;
    const liquidH = (linerH - 20) * (0.35 + waterFrac * 0.5);
    const liquidY = linerTop + linerH - liquidH;

    // Fluid color shifting based on temperature
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx - linerW / 2 + 3, linerTop + 4, linerW - 6, linerH - 8, [0, 0, 8, 8]);
    ctx.clip();

    // Fluid gradient
    const fluidGrad = ctx.createLinearGradient(0, liquidY, 0, linerTop + linerH);
    if (this.currentTemp > 35) {
      fluidGrad.addColorStop(0, 'rgba(254, 215, 170, 0.85)'); // Warm amber
      fluidGrad.addColorStop(1, 'rgba(251, 146, 60, 0.7)');
    } else if (this.currentTemp < 20) {
      fluidGrad.addColorStop(0, 'rgba(186, 230, 253, 0.9)'); // Frosty cyan
      fluidGrad.addColorStop(1, 'rgba(125, 211, 252, 0.75)');
    } else {
      fluidGrad.addColorStop(0, 'rgba(224, 242, 254, 0.75)');
      fluidGrad.addColorStop(1, 'rgba(186, 230, 253, 0.6)');
    }

    ctx.fillStyle = fluidGrad;
    ctx.beginPath();
    ctx.moveTo(cx - linerW / 2 + 3, linerTop + linerH);
    ctx.lineTo(cx + linerW / 2 - 3, linerTop + linerH);
    ctx.lineTo(cx + linerW / 2 - 3, liquidY);

    if (this.isStirring) {
      // Dynamic rotating vortex dip
      const vortexDepth = 10;
      ctx.quadraticCurveTo(cx, liquidY + vortexDepth, cx - linerW / 2 + 3, liquidY);
    } else {
      ctx.lineTo(cx - linerW / 2 + 3, liquidY);
    }
    ctx.closePath();
    ctx.fill();

    // Vortex surface ripple ellipse
    if (this.isStirring) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, liquidY + 5, 24, 4.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 4. Magnetic Stir Flea (Teflon-coated magnetic stirring bar)
    const fleaY = linerTop + linerH - 12;
    const fleaW = 28;
    const fleaH = 7;

    ctx.save();
    ctx.translate(cx, fleaY);
    if (this.isStirring) {
      ctx.scale(Math.cos(this.stirAngle), 1);
    }
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(-fleaW / 2, -fleaH / 2, fleaW, fleaH, 3);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // Center ring on stir bar
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(-2, -fleaH / 2, 4, fleaH);
    ctx.restore();

    // 5. Falling / Dissolving Crystals
    for (let c of this.crystals) {
      ctx.fillStyle = `rgba(255, 255, 255, ${c.alpha})`;
      ctx.strokeStyle = `rgba(148, 163, 184, ${c.alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // 6. Frost Crystals on Inner Wall if Endothermic (T < 18°C)
    if (this.currentTemp < 20) {
      const frostAlpha = Math.min(0.85, (20 - this.currentTemp) / 14);
      ctx.strokeStyle = `rgba(255, 255, 255, ${frostAlpha})`;
      ctx.lineWidth = 1.5;

      // Dendritic frost branches
      const branchY = [liquidY + 15, liquidY + 40, liquidY + 70];
      for (let by of branchY) {
        // Left frost
        ctx.beginPath();
        ctx.moveTo(cx - linerW / 2 + 4, by);
        ctx.lineTo(cx - linerW / 2 + 18, by - 6);
        ctx.lineTo(cx - linerW / 2 + 25, by - 2);
        ctx.stroke();

        // Right frost
        ctx.beginPath();
        ctx.moveTo(cx + linerW / 2 - 4, by + 10);
        ctx.lineTo(cx + linerW / 2 - 16, by + 4);
        ctx.lineTo(cx + linerW / 2 - 22, by + 8);
        ctx.stroke();
      }
    }

    ctx.restore(); // Restore liner clip

    // 7. Billowing Steam Particles for Exothermic (CaO)
    for (let sp of this.steamParticles) {
      ctx.fillStyle = `rgba(255, 255, 255, ${sp.alpha})`;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 8. Thick Insulating Rubber Gasket Lid
    const lidW = vesselW + 8;
    const lidH = 18;
    const lidY = vesselTop - 4;

    const lidGrad = ctx.createLinearGradient(0, lidY, 0, lidY + lidH);
    lidGrad.addColorStop(0, '#64748B');
    lidGrad.addColorStop(0.5, '#475569');
    lidGrad.addColorStop(1, '#334155');

    ctx.fillStyle = lidGrad;
    ctx.beginPath();
    ctx.roundRect(cx - lidW / 2, lidY, lidW, lidH, 4);
    ctx.fill();
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 9. Precision Digital Thermometer Immersion Probe
    const probeX = cx + 22;
    const probeTipY = linerTop + linerH - 25;
    const probeTopY = vesselTop - 70;

    // Stainless steel probe shaft
    const shaftW = 5;
    const shaftGrad = ctx.createLinearGradient(probeX - shaftW / 2, 0, probeX + shaftW / 2, 0);
    shaftGrad.addColorStop(0, '#94A3B8');
    shaftGrad.addColorStop(0.3, '#F8FAFC');
    shaftGrad.addColorStop(0.8, '#64748B');
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(probeX - shaftW / 2, probeTopY, shaftW, probeTipY - probeTopY);

    // Gold / Platinum sensor tip
    ctx.fillStyle = '#EAB308';
    ctx.beginPath();
    ctx.roundRect(probeX - shaftW / 2, probeTipY - 6, shaftW, 6, [0, 0, 2, 2]);
    ctx.fill();

    // Digital Instrument Display Module at probe head
    const headW = 76;
    const headH = 40;
    const headX = probeX - headW / 2;
    const headY = probeTopY - headH;

    // Molded plastic case
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.roundRect(headX, headY, headW, headH, 6);
    ctx.fill();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // LCD Green / Cyan Backlight
    ctx.fillStyle = '#022C22';
    ctx.beginPath();
    ctx.roundRect(headX + 5, headY + 5, headW - 10, headH - 10, 3);
    ctx.fill();

    // Digital readout text
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.fillStyle = '#34D399';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.currentTemp.toFixed(1)}°C`, headX + headW / 2, headY + 23);

    ctx.font = '600 8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#059669';
    ctx.fillText('DIGITAL PROBE', headX + headW / 2, headY + 32);

    ctx.restore();
  }

  drawStripChart(ctx) {
    const chartX = this.width * 0.52;
    const chartY = 30;
    const chartW = this.width * 0.44;
    const chartH = this.height * 0.72;

    ctx.save();

    // Chart card background
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(chartX, chartY, chartW, chartH, 12);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Chart Title
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'left';
    ctx.fillText('TEMPERATURE VS. TIME STRIP CHART', chartX + 16, chartY + 24);

    // Plotting area
    const plotX = chartX + 44;
    const plotY = chartY + 45;
    const plotW = chartW - 60;
    const plotH = chartH - 75;

    // Grid lines for temperature: 0°C, 25°C, 50°C, 75°C, 100°C
    const tempMin = 0;
    const tempMax = 100;

    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    ctx.font = '500 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.textAlign = 'right';

    for (let temp = 0; temp <= 100; temp += 25) {
      const y = plotY + plotH - ((temp - tempMin) / (tempMax - tempMin)) * plotH;
      ctx.beginPath();
      ctx.moveTo(plotX, y);
      ctx.lineTo(plotX + plotW, y);
      ctx.stroke();
      ctx.fillText(`${temp}°C`, plotX - 6, y + 3);
    }

    // Baseline ambient temp dashed marker (25°C)
    const baseLineY = plotY + plotH - ((this.ambientTemp - tempMin) / (tempMax - tempMin)) * plotH;
    ctx.strokeStyle = '#CBD5E1';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(plotX, baseLineY);
    ctx.lineTo(plotX + plotW, baseLineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot Temperature Curve
    if (this.chartHistory.length > 1) {
      const tMin = this.chartHistory[0].time;
      const tMax = Math.max(tMin + 15, this.chartHistory[this.chartHistory.length - 1].time);

      ctx.beginPath();
      for (let i = 0; i < this.chartHistory.length; i++) {
        const pt = this.chartHistory[i];
        const x = plotX + ((pt.time - tMin) / (tMax - tMin)) * plotW;
        const y = plotY + plotH - ((pt.temp - tempMin) / (tempMax - tempMin)) * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      const rxn = this.reactions[this.currentReactionId];
      ctx.strokeStyle = rxn.type === 'EXOTHERMIC' ? '#EF4444' : '#0284C7';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Current point pulsating marker
      const lastPt = this.chartHistory[this.chartHistory.length - 1];
      const curX = plotX + ((lastPt.time - tMin) / (tMax - tMin)) * plotW;
      const curY = plotY + plotH - ((lastPt.temp - tempMin) / (tempMax - tempMin)) * plotH;

      ctx.fillStyle = rxn.type === 'EXOTHERMIC' ? '#DC2626' : '#0284C7';
      ctx.beginPath();
      ctx.arc(curX, curY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }
}

// Initialize when DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  window.sim = new CalorimeterSimulation();
});
