/**
 * Chemical Equilibrium & Le Chatelier's Principle Virtual Laboratory
 * Strict Zero-Dependency Vanilla Web Standard & Simulation Guidelines
 */

class LeChatelierSimulation {
  constructor() {
    this.canvas = document.getElementById('simCanvas');
    this.ctx = this.canvas.getContext('2d');

    // System: 'fe_scn' or 'co_cl'
    this.currentSystem = 'fe_scn';

    // State of Tube 2 (Active Test Tube)
    this.testState = {
      // Perturbations accumulated
      shiftFactor: 0.0, // -1.0 (fully left/decolorized) to +1.0 (fully right/deep red or blue)
      precipitateAgSCN: false,
      lastAction: 'Equilibrium Baseline'
    };

    // Tube 3 (Hot Bath, 80°C) and Tube 4 (Ice Bath, 0°C)
    this.hotBathTemp = 80;
    this.iceBathTemp = 0;

    // Selected Tube for Spectrophotometer (1, 2, 3, or 4)
    this.selectedTube = 2;
    this.soundEnabled = true;

    // Droplets animation
    this.droplets = [];

    // Audio Context
    this.audioCtx = null;

    this.initDOM();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.attachEvents();
    this.startLoop();
  }

  initDOM() {
    this.selectSystem = document.getElementById('selectSystem');
    this.reagentsContainer = document.getElementById('reagentsContainer');

    this.teleEquilibriumState = document.getElementById('teleEquilibriumState');
    this.teleAbsorbance = document.getElementById('teleAbsorbance');
    this.teleTransmittance = document.getElementById('teleTransmittance');
    this.teleActivePerturbation = document.getElementById('teleActivePerturbation');

    this.btnAudioToggle = document.getElementById('btnAudioToggle');
    this.btnResetAll = document.getElementById('btnResetAll');
    this.btnOpenTheory = document.getElementById('btnOpenTheory');
    this.btnCloseTheory = document.getElementById('btnCloseTheory');
    this.modalTheory = document.getElementById('modalTheory');

    this.renderReagentButtons();
  }

  initAudio() {
    if (this.audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  playDropSound() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, this.audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {}
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

  renderReagentButtons() {
    this.reagentsContainer.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'reagent-grid';

    if (this.currentSystem === 'fe_scn') {
      const btns = [
        { label: '+ FeCl₃ (Fe³⁺)', action: () => this.applyPerturbation(0.35, '+ FeCl₃: shifts forward → deeper red') },
        { label: '+ KSCN (SCN⁻)', action: () => this.applyPerturbation(0.35, '+ KSCN: shifts forward → deeper red') },
        { label: '+ Oxalic Acid', action: () => this.applyPerturbation(-0.45, '+ Oxalic Acid: complexes Fe³⁺, shifts reverse') },
        { label: '+ AgNO₃', action: () => { this.testState.precipitateAgSCN = true; this.applyPerturbation(-0.55, '+ AgNO₃: precipitates AgSCN↓, shifts reverse'); } },
        { label: '↺ Restore Baseline', action: () => this.resetTestTube() }
      ];

      btns.forEach(b => {
        const btn = document.createElement('button');
        btn.className = 'reagent-btn';
        btn.textContent = b.label;
        btn.addEventListener('click', () => {
          this.initAudio();
          this.playDropSound();
          b.action();
        });
        grid.appendChild(btn);
      });
    } else {
      const btns = [
        { label: '+ Conc. HCl (Cl⁻)', action: () => this.applyPerturbation(0.45, '+ HCl: increases [Cl⁻], shifts forward → blue') },
        { label: '+ H₂O (Dilution)', action: () => this.applyPerturbation(-0.45, '+ H₂O: dilutes system, shifts reverse → pink') },
        { label: '↺ Restore Baseline', action: () => this.resetTestTube() }
      ];

      btns.forEach(b => {
        const btn = document.createElement('button');
        btn.className = 'reagent-btn';
        btn.textContent = b.label;
        btn.addEventListener('click', () => {
          this.initAudio();
          this.playDropSound();
          b.action();
        });
        grid.appendChild(btn);
      });
    }

    this.reagentsContainer.appendChild(grid);
  }

  applyPerturbation(delta, description) {
    this.testState.shiftFactor = Math.max(-1.0, Math.min(1.0, this.testState.shiftFactor + delta));
    this.testState.lastAction = description;
    this.updateTelemetry();
  }

  resetTestTube() {
    this.testState.shiftFactor = 0.0;
    this.testState.precipitateAgSCN = false;
    this.testState.lastAction = 'Equilibrium Baseline Restored';
    this.updateTelemetry();
  }

  attachEvents() {
    this.selectSystem.addEventListener('change', (e) => {
      this.initAudio();
      this.currentSystem = e.target.value;
      this.resetAll();
      this.renderReagentButtons();
    });

    this.btnAudioToggle.addEventListener('click', () => {
      this.initAudio();
      this.soundEnabled = !this.soundEnabled;
      this.btnAudioToggle.textContent = this.soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    });

    this.btnResetAll.addEventListener('click', () => {
      this.resetAll();
    });

    this.btnOpenTheory.addEventListener('click', () => {
      this.modalTheory.classList.add('open');
    });

    this.btnCloseTheory.addEventListener('click', () => {
      this.modalTheory.classList.remove('open');
    });

    this.modalTheory.addEventListener('click', (e) => {
      if (e.target === this.modalTheory) {
        this.modalTheory.classList.remove('open');
      }
    });

    // Canvas click to select tube for spectrophotometer
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const rackX = this.width * 0.08;
      const rackW = this.width * 0.54;
      const tubeSpacing = rackW / 4;

      for (let i = 0; i < 4; i++) {
        const tx = rackX + i * tubeSpacing + tubeSpacing * 0.5;
        if (Math.abs(mx - tx) < 30) {
          this.selectedTube = i + 1;
          this.initAudio();
          this.playDropSound();
          this.updateTelemetry();
          break;
        }
      }
    });

    this.updateTelemetry();
  }

  resetAll() {
    this.resetTestTube();
    this.selectedTube = 2;
    this.updateTelemetry();
  }

  // Calculate Shift Factor for any tube (-1.0 to +1.0)
  getTubeShift(tubeIndex) {
    if (tubeIndex === 1) {
      return 0.0; // Control baseline
    } else if (tubeIndex === 2) {
      return this.testState.shiftFactor; // User test tube
    } else if (tubeIndex === 3) {
      // Hot Bath (80°C)
      if (this.currentSystem === 'fe_scn') {
        // Exothermic: heating shifts reverse (left)
        return -0.65;
      } else {
        // Endothermic: heating shifts forward (right, royal blue!)
        return 0.85;
      }
    } else {
      // Ice Bath (0°C)
      if (this.currentSystem === 'fe_scn') {
        // Exothermic: cooling shifts forward (right, deeper red)
        return 0.65;
      } else {
        // Endothermic: cooling shifts reverse (left, rose pink)
        return -0.85;
      }
    }
  }

  getTubeColor(tubeIndex) {
    const shift = this.getTubeShift(tubeIndex);

    if (this.currentSystem === 'fe_scn') {
      // Baseline (0): Amber-orange/red
      // Left (-1): Pale straw yellow (Fe3+)
      // Right (+1): Intense dark blood-red ([Fe(SCN)]2+)
      const redVal = Math.round(180 + shift * 60);
      const greenVal = Math.round(100 - shift * 80);
      const blueVal = Math.round(30 - shift * 20);
      const alpha = Math.min(0.92, Math.max(0.35, 0.65 + shift * 0.25));
      return `rgba(${redVal}, ${Math.max(10, greenVal)}, ${Math.max(10, blueVal)}, ${alpha.toFixed(2)})`;
    } else {
      // Co2+ system:
      // Baseline (0): Violet/purple
      // Left (-1): Rose pink ([Co(H2O)6]2+)
      // Right (+1): Intense Royal Blue ([CoCl4]2-)
      if (shift < 0) {
        // Blending toward pink
        const f = Math.abs(shift);
        return `rgba(${Math.round(236 * f + 140 * (1 - f))}, ${Math.round(72 * f + 60 * (1 - f))}, ${Math.round(153 * f + 200 * (1 - f))}, 0.75)`;
      } else {
        // Blending toward blue
        const f = shift;
        return `rgba(${Math.round(29 * f + 140 * (1 - f))}, ${Math.round(78 * f + 60 * (1 - f))}, ${Math.round(216 * f + 200 * (1 - f))}, 0.85)`;
      }
    }
  }

  getAbsorbance(tubeIndex) {
    const shift = this.getTubeShift(tubeIndex);
    // Absorbance proportional to complex concentration
    const norm = (shift + 1.0) / 2.0; // 0 to 1
    return 0.05 + norm * 1.45; // 0.05 to 1.50
  }

  updateTelemetry() {
    const shift = this.getTubeShift(this.selectedTube);
    const abs = this.getAbsorbance(this.selectedTube);
    const trans = Math.pow(10, -abs) * 100; // %T = 10^-A * 100

    let shiftDesc = 'At Dynamic Equilibrium';
    if (shift > 0.15) shiftDesc = 'Shifted Forward (Products)';
    else if (shift < -0.15) shiftDesc = 'Shifted Reverse (Reactants)';

    this.teleEquilibriumState.textContent = `Tube ${this.selectedTube}: ${shiftDesc}`;
    this.teleAbsorbance.textContent = `${abs.toFixed(3)} A`;
    this.teleTransmittance.textContent = `${trans.toFixed(1)}% T`;
    this.teleActivePerturbation.textContent = this.testState.lastAction;
  }

  startLoop() {
    const render = () => {
      this.draw();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  draw() {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    // Grid
    this.drawBackgroundGrid();

    // 1. Draw 4-Tube Laboratory Rack (Left 58%)
    const rackX = width * 0.06;
    const rackY = height * 0.15;
    const rackW = width * 0.54;
    const rackH = height * 0.75;

    this.drawLaboratoryRack(rackX, rackY, rackW, rackH);

    // 2. Draw Spectrophotometer & Sensor Reticle (Right 34%)
    const specX = width * 0.63;
    const specY = height * 0.10;
    const specW = width * 0.34;
    const specH = height * 0.80;

    this.drawSpectrophotometer(specX, specY, specW, specH);
  }

  drawBackgroundGrid() {
    const { ctx, width, height } = this;
    ctx.save();
    ctx.strokeStyle = '#DCE9F6';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (let x = 40; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 40; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawLaboratoryRack(rx, ry, rw, rh) {
    const { ctx } = this;
    ctx.save();

    // Wooden / Polypropylene Test Tube Rack Base & Uprights
    const baseH = 20;
    const baseY = ry + rh * 0.82;
    ctx.fillStyle = '#CBD5E1';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(rx, baseY, rw, baseH, 6);
    ctx.fill();
    ctx.stroke();

    // Middle Shelf with holes
    const shelfY = ry + rh * 0.35;
    ctx.fillStyle = 'rgba(203, 213, 225, 0.7)';
    ctx.fillRect(rx, shelfY, rw, 14);
    ctx.strokeRect(rx, shelfY, rw, 14);

    const tubeSpacing = rw / 4;
    const tubeW = 28;
    const tubeH = rh * 0.60;
    const tubeTopY = ry + rh * 0.15;

    // Draw 4 Test Tubes
    for (let i = 0; i < 4; i++) {
      const tubeIdx = i + 1;
      const tx = rx + i * tubeSpacing + (tubeSpacing - tubeW) * 0.5;

      // Special environments for Tube 3 (Hot Bath) and Tube 4 (Ice Bath)
      if (tubeIdx === 3) {
        // Hot Bath Beaker around tube
        ctx.fillStyle = 'rgba(254, 243, 199, 0.6)';
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.5;
        ctx.fillRect(tx - 10, baseY - 65, tubeW + 20, 65);
        ctx.strokeRect(tx - 10, baseY - 65, tubeW + 20, 65);

        ctx.font = '700 8.5px JetBrains Mono';
        ctx.fillStyle = '#D97706';
        ctx.textAlign = 'center';
        ctx.fillText('HOT 80°C', tx + tubeW * 0.5, baseY - 70);
      } else if (tubeIdx === 4) {
        // Ice Bath Beaker with Ice cubes
        ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.fillRect(tx - 10, baseY - 65, tubeW + 20, 65);
        ctx.strokeRect(tx - 10, baseY - 65, tubeW + 20, 65);

        ctx.font = '700 8.5px JetBrains Mono';
        ctx.fillStyle = '#0284C7';
        ctx.textAlign = 'center';
        ctx.fillText('ICE 0°C', tx + tubeW * 0.5, baseY - 70);
      }

      // Liquid inside tube
      const liquidColor = this.getTubeColor(tubeIdx);
      const liquidH = tubeH * 0.65;
      const liquidTopY = tubeTopY + tubeH - liquidH;

      ctx.fillStyle = liquidColor;
      ctx.beginPath();
      ctx.roundRect(tx + 2, liquidTopY, tubeW - 4, liquidH - 4, [0, 0, 10, 10]);
      ctx.fill();

      // White AgSCN precipitate in tube 2 if formed
      if (tubeIdx === 2 && this.testState.precipitateAgSCN) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(tx + 4, tubeTopY + tubeH - 12, tubeW - 8, 8, [0, 0, 8, 8]);
        ctx.fill();
        ctx.font = '700 8px JetBrains Mono';
        ctx.fillStyle = '#475569';
        ctx.fillText('AgSCN↓', tx + tubeW * 0.5, tubeTopY + tubeH + 16);
      }

      // Glass Tube Shell
      ctx.strokeStyle = this.selectedTube === tubeIdx ? '#0284C7' : 'rgba(100, 116, 139, 0.85)';
      ctx.lineWidth = this.selectedTube === tubeIdx ? 3 : 2;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.roundRect(tx, tubeTopY, tubeW, tubeH, [0, 0, 14, 14]);
      ctx.fill();
      ctx.stroke();

      // Rim
      ctx.strokeRect(tx - 3, tubeTopY - 3, tubeW + 6, 3);

      // Tube Selection Badge / Label
      ctx.font = '700 10px JetBrains Mono';
      ctx.fillStyle = this.selectedTube === tubeIdx ? '#0284C7' : '#0F172A';
      ctx.textAlign = 'center';
      ctx.fillText(`Tube ${tubeIdx}`, tx + tubeW * 0.5, tubeTopY - 14);

      let subLabel = 'Control';
      if (tubeIdx === 2) subLabel = 'Test';
      else if (tubeIdx === 3) subLabel = '80°C';
      else if (tubeIdx === 4) subLabel = '0°C';

      ctx.font = '600 9px Plus Jakarta Sans';
      ctx.fillStyle = '#64748B';
      ctx.fillText(subLabel, tx + tubeW * 0.5, baseY + 36);
    }

    ctx.restore();
  }

  drawSpectrophotometer(gx, gy, gw, gh) {
    const { ctx } = this;
    ctx.save();

    // Container
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(gx, gy, gw, gh, 12);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.fillStyle = '#0F172A';
    ctx.font = '700 13px Plus Jakarta Sans';
    ctx.textAlign = 'left';
    ctx.fillText('Digital Spectrophotometer Analysis', gx + 16, gy + 26);

    // Selected Tube Preview
    const pBoxY = gy + 45;
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(gx + 16, pBoxY, gw - 32, 100, 8);
    ctx.fill();
    ctx.stroke();

    // Cuvette in spectrophotometer beam
    const cuvetteX = gx + 45;
    const cuvetteY = pBoxY + 18;
    const cuvetteW = 28;
    const cuvetteH = 64;

    const solColor = this.getTubeColor(this.selectedTube);
    ctx.fillStyle = solColor;
    ctx.fillRect(cuvetteX, cuvetteY + 10, cuvetteW, cuvetteH - 10);
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.strokeRect(cuvetteX, cuvetteY, cuvetteW, cuvetteH);

    // Collimated Laser Beam passing through
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(gx + 16, cuvetteY + cuvetteH * 0.5);
    ctx.lineTo(cuvetteX, cuvetteY + cuvetteH * 0.5);
    ctx.stroke();

    // Attenuated beam exiting
    const abs = this.getAbsorbance(this.selectedTube);
    const transFrac = Math.pow(10, -abs);
    ctx.strokeStyle = `rgba(16, 185, 129, ${transFrac.toFixed(2)})`;
    ctx.beginPath();
    ctx.moveTo(cuvetteX + cuvetteW, cuvetteY + cuvetteH * 0.5);
    ctx.lineTo(gx + gw - 32, cuvetteY + cuvetteH * 0.5);
    ctx.stroke();

    // LCD Readouts
    const textX = cuvetteX + cuvetteW + 20;
    ctx.font = '700 11px JetBrains Mono';
    ctx.fillStyle = '#0F172A';
    ctx.fillText(`Target: Tube ${this.selectedTube}`, textX, cuvetteY + 18);

    ctx.font = '700 13px JetBrains Mono';
    ctx.fillStyle = '#0284C7';
    ctx.fillText(`Absorbance: ${abs.toFixed(3)} A`, textX, cuvetteY + 38);

    ctx.font = '600 11px JetBrains Mono';
    ctx.fillStyle = '#10B981';
    ctx.fillText(`Transmittance: ${(transFrac * 100).toFixed(1)}%`, textX, cuvetteY + 56);

    // Beer-Lambert / Le Chatelier Deduction Box
    const dBoxY = gy + 165;
    ctx.fillStyle = '#F0F7FF';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(gx + 16, dBoxY, gw - 32, 115, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 10.5px JetBrains Mono';
    ctx.fillStyle = '#0369A1';
    ctx.fillText('LE CHATELIER PRINCIPLE SHIFT', gx + 26, dBoxY + 22);

    ctx.font = '600 9.5px Plus Jakarta Sans';
    ctx.fillStyle = '#334155';
    if (this.currentSystem === 'fe_scn') {
      ctx.fillText('Fe³⁺ + SCN⁻ ⇌ [Fe(SCN)]²⁺ (Blood-Red)', gx + 26, dBoxY + 42);
      ctx.fillText('• Exothermic reaction (ΔH < 0)', gx + 26, dBoxY + 60);
      ctx.fillText('• Adding reactants increases [Fe(SCN)]²⁺', gx + 26, dBoxY + 76);
      ctx.fillText('• Heating shifts equilibrium in reverse', gx + 26, dBoxY + 92);
      ctx.fillText('• Oxalic acid / AgNO₃ complexes/precipitates', gx + 26, dBoxY + 106);
    } else {
      ctx.fillText('[Co(H₂O)₆]²⁺ (Pink) + 4Cl⁻ ⇌ [CoCl₄]²⁻ (Blue)', gx + 26, dBoxY + 42);
      ctx.fillText('• Endothermic reaction (ΔH > 0)', gx + 26, dBoxY + 60);
      ctx.fillText('• Hot bath (80°C) shifts forward → Royal Blue', gx + 26, dBoxY + 76);
      ctx.fillText('• Ice bath (0°C) shifts reverse → Rose Pink', gx + 26, dBoxY + 92);
      ctx.fillText('• Dilution with H₂O shifts reverse to pink', gx + 26, dBoxY + 106);
    }

    ctx.restore();
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.sim = new LeChatelierSimulation();
});

