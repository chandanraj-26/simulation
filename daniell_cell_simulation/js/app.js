/**
 * Galvanic Daniell Cell & Nernst Equation Virtual Laboratory
 * Strict Zero-Dependency Vanilla Web Standard & Simulation Guidelines
 */

class DaniellCellSimulation {
  constructor() {
    this.canvas = document.getElementById('simCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Physical & Thermodynamic Constants
    this.R = 8.314; // J/(mol*K)
    this.F = 96485; // C/mol
    this.n = 2; // electrons transferred
    this.E0_standard = 1.100; // V at 298.15 K

    // Concentrations & Thermodynamics
    this.concZn = 0.100; // M
    this.concCu = 1.000; // M
    this.tempC = 25; // deg C
    this.saltBridgeInserted = true;
    this.switchClosed = true;
    this.soundEnabled = true;

    // Electron and Ion Particles
    this.wireElectrons = [];
    this.solutionIons = [];
    this.initParticles();

    // Audio Context
    this.audioCtx = null;

    this.initDOM();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.attachEvents();
    this.startLoop();
  }

  initDOM() {
    this.sliderZn = document.getElementById('sliderZn');
    this.sliderCu = document.getElementById('sliderCu');
    this.sliderTemp = document.getElementById('sliderTemp');

    this.valZn = document.getElementById('valZn');
    this.valCu = document.getElementById('valCu');
    this.valTemp = document.getElementById('valTemp');

    this.teleEMF = document.getElementById('teleEMF');
    this.teleDeltaG = document.getElementById('teleDeltaG');
    this.teleQuotient = document.getElementById('teleQuotient');
    this.teleCircuitState = document.getElementById('teleCircuitState');

    this.toggleBridge = document.getElementById('toggleBridge');
    this.toggleSwitch = document.getElementById('toggleSwitch');

    this.btnAudioToggle = document.getElementById('btnAudioToggle');
    this.btnResetAll = document.getElementById('btnResetAll');
    this.btnOpenTheory = document.getElementById('btnOpenTheory');
    this.btnCloseTheory = document.getElementById('btnCloseTheory');
    this.modalTheory = document.getElementById('modalTheory');
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

  playClickSound() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {}
  }

  playBridgeSplash() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.07, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {}
  }

  initParticles() {
    this.wireElectrons = [];
    for (let i = 0; i < 20; i++) {
      this.wireElectrons.push({ progress: i / 20.0 });
    }
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

  attachEvents() {
    this.sliderZn.addEventListener('input', (e) => {
      this.initAudio();
      this.concZn = parseFloat(e.target.value);
      this.valZn.textContent = `${this.concZn.toFixed(3)} M`;
      this.updateTelemetry();
    });

    this.sliderCu.addEventListener('input', (e) => {
      this.initAudio();
      this.concCu = parseFloat(e.target.value);
      this.valCu.textContent = `${this.concCu.toFixed(3)} M`;
      this.updateTelemetry();
    });

    this.sliderTemp.addEventListener('input', (e) => {
      this.initAudio();
      this.tempC = parseInt(e.target.value);
      this.valTemp.textContent = `${this.tempC}°C`;
      this.updateTelemetry();
    });

    this.toggleBridge.addEventListener('change', (e) => {
      this.initAudio();
      this.saltBridgeInserted = e.target.checked;
      this.playBridgeSplash();
      this.updateTelemetry();
    });

    this.toggleSwitch.addEventListener('change', (e) => {
      this.initAudio();
      this.switchClosed = e.target.checked;
      this.playClickSound();
      this.updateTelemetry();
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

    this.updateTelemetry();
  }

  resetAll() {
    this.concZn = 0.100;
    this.concCu = 1.000;
    this.tempC = 25;
    this.saltBridgeInserted = true;
    this.switchClosed = true;

    this.sliderZn.value = 0.100;
    this.sliderCu.value = 1.000;
    this.sliderTemp.value = 25;

    this.valZn.textContent = '0.100 M';
    this.valCu.textContent = '1.000 M';
    this.valTemp.textContent = '25°C';

    this.toggleBridge.checked = true;
    this.toggleSwitch.checked = true;

    this.updateTelemetry();
    this.playClickSound();
  }

  calculateEMF() {
    if (!this.saltBridgeInserted || !this.switchClosed) {
      return 0.000;
    }
    const T_K = 273.15 + this.tempC;
    // Nernst slope factor: 2.302585 * R * T / (n * F)
    const nernstFactor = (2.302585 * this.R * T_K) / (this.n * this.F);
    const Q = this.concZn / this.concCu;
    return this.E0_standard - nernstFactor * Math.log10(Q);
  }

  updateTelemetry() {
    const emf = this.calculateEMF();
    const Q = this.concZn / this.concCu;
    const deltaG_kJ = - (this.n * this.F * emf) / 1000;

    this.teleEMF.textContent = `${emf.toFixed(3)} V`;
    this.teleDeltaG.textContent = `${deltaG_kJ.toFixed(1)} kJ/mol`;
    this.teleQuotient.textContent = `Q = ${Q >= 1 ? Q.toFixed(2) : Q.toFixed(4)}`;

    if (!this.saltBridgeInserted) {
      this.teleCircuitState.textContent = 'Open (No Salt Bridge)';
      this.teleCircuitState.style.color = '#EF4444';
    } else if (!this.switchClosed) {
      this.teleCircuitState.textContent = 'Open (Switch Off)';
      this.teleCircuitState.style.color = '#EF4444';
    } else {
      this.teleCircuitState.textContent = 'Closed & Operating';
      this.teleCircuitState.style.color = '#10B981';
    }
  }

  startLoop() {
    const render = () => {
      this.updatePhysics();
      this.draw();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  updatePhysics() {
    const emf = this.calculateEMF();
    if (emf > 0.05) {
      // Advance electron flow along wire (clockwise: Zn -> Voltmeter -> Cu)
      const speed = 0.006 * (emf / 1.100);
      for (const e of this.wireElectrons) {
        e.progress = (e.progress + speed) % 1.0;
      }
    }
  }

  draw() {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    // Grid
    this.drawBackgroundGrid();

    // Apparatus dimensions
    const benchX = width * 0.08;
    const benchY = height * 0.15;
    const benchW = width * 0.52;
    const benchH = height * 0.75;

    // 1. Draw Two Beakers & Electrodes
    this.drawBeakersAndElectrodes(benchX, benchY, benchW, benchH);

    // 2. Draw Salt Bridge
    this.drawSaltBridge(benchX, benchY, benchW, benchH);

    // 3. Draw External Wire & Meter
    this.drawExternalCircuit(benchX, benchY, benchW, benchH);

    // 4. Draw Nernst Plot (Right 36%)
    const graphX = width * 0.63;
    const graphY = height * 0.10;
    const graphW = width * 0.34;
    const graphH = height * 0.80;

    this.drawNernstGraph(graphX, graphY, graphW, graphH);
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

  drawBeakersAndElectrodes(bx, by, bw, bh) {
    const { ctx } = this;
    ctx.save();

    const beakerW = bw * 0.42;
    const beakerH = bh * 0.55;
    const beakerY = by + bh * 0.40;

    const b1X = bx;
    const b2X = bx + bw - beakerW;

    // --- Left Beaker: ZnSO4 (Clear to very pale blue-grey) ---
    ctx.fillStyle = 'rgba(241, 245, 249, 0.75)';
    ctx.fillRect(b1X + 4, beakerY + 30, beakerW - 8, beakerH - 34);

    ctx.strokeStyle = 'rgba(100, 116, 139, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(b1X, beakerY, beakerW, beakerH);

    // Zinc Electrode Strip (Silver Grey)
    const znX = b1X + beakerW * 0.5 - 14;
    ctx.fillStyle = '#94A3B8';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(znX, beakerY - 35, 28, beakerH - 20, 3);
    ctx.fill();
    ctx.stroke();

    // Zinc Labels
    ctx.font = '700 11px JetBrains Mono';
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'center';
    ctx.fillText('ANODE (-)', b1X + beakerW * 0.5, beakerY + beakerH + 18);
    ctx.font = '600 10px JetBrains Mono';
    ctx.fillStyle = '#475569';
    ctx.fillText(`Zn | Zn²⁺ (${this.concZn.toFixed(3)}M)`, b1X + beakerW * 0.5, beakerY + beakerH + 32);

    // --- Right Beaker: CuSO4 (Vibrant Sky Blue) ---
    // Color depth scales with [Cu2+]
    const cuAlpha = Math.min(0.85, 0.25 + (this.concCu / 2.0) * 0.55);
    ctx.fillStyle = `rgba(56, 189, 248, ${cuAlpha.toFixed(2)})`;
    ctx.fillRect(b2X + 4, beakerY + 30, beakerW - 8, beakerH - 34);

    ctx.strokeStyle = 'rgba(100, 116, 139, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(b2X, beakerY, beakerW, beakerH);

    // Copper Electrode Strip (Copper Orange/Red)
    const cuX = b2X + beakerW * 0.5 - 14;
    ctx.fillStyle = '#B45309';
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cuX, beakerY - 35, 28, beakerH - 20, 3);
    ctx.fill();
    ctx.stroke();

    // Copper Labels
    ctx.font = '700 11px JetBrains Mono';
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'center';
    ctx.fillText('CATHODE (+)', b2X + beakerW * 0.5, beakerY + beakerH + 18);
    ctx.font = '600 10px JetBrains Mono';
    ctx.fillStyle = '#475569';
    ctx.fillText(`Cu²⁺ (${this.concCu.toFixed(3)}M) | Cu`, b2X + beakerW * 0.5, beakerY + beakerH + 32);

    ctx.restore();
  }

  drawSaltBridge(bx, by, bw, bh) {
    const { ctx } = this;
    ctx.save();

    const beakerW = bw * 0.42;
    const beakerY = by + bh * 0.40;

    const b1X = bx;
    const b2X = bx + bw - beakerW;

    const leftSubmergeX = b1X + beakerW * 0.82;
    const rightSubmergeX = b2X + beakerW * 0.18;
    const bridgeY = this.saltBridgeInserted ? beakerY + 15 : beakerY - 55;

    // Inverted U-Tube Salt Bridge
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.85)';
    ctx.fillStyle = 'rgba(224, 231, 255, 0.85)';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(leftSubmergeX, bridgeY + 65);
    ctx.lineTo(leftSubmergeX, bridgeY);
    ctx.lineTo(rightSubmergeX, bridgeY);
    ctx.lineTo(rightSubmergeX, bridgeY + 65);
    ctx.stroke();

    // Label
    ctx.font = '700 10px JetBrains Mono';
    ctx.fillStyle = '#4338CA';
    ctx.textAlign = 'center';
    ctx.fillText(this.saltBridgeInserted ? 'SALT BRIDGE (KCl/Agar)' : '[SALT BRIDGE REMOVED]', (leftSubmergeX + rightSubmergeX) * 0.5, bridgeY - 10);

    // Ion flow arrows if operating
    if (this.saltBridgeInserted && this.calculateEMF() > 0.05) {
      ctx.font = '600 9px JetBrains Mono';
      ctx.fillStyle = '#1D4ED8';
      ctx.fillText('← Cl⁻', leftSubmergeX - 8, bridgeY + 35);
      ctx.fillText('K⁺ →', rightSubmergeX + 8, bridgeY + 35);
    }

    ctx.restore();
  }

  drawExternalCircuit(bx, by, bw, bh) {
    const { ctx } = this;
    ctx.save();

    const beakerW = bw * 0.42;
    const beakerY = by + bh * 0.40;

    const znX = bx + beakerW * 0.5;
    const cuX = bx + bw - beakerW * 0.5;
    const wireTopY = by + 20;

    // Wire path coordinates
    const p1 = { x: znX, y: beakerY - 35 };
    const p2 = { x: znX, y: wireTopY };
    const p3 = { x: (znX + cuX) * 0.5, y: wireTopY };
    const p4 = { x: cuX, y: wireTopY };
    const p5 = { x: cuX, y: beakerY - 35 };

    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2.5;

    // Left segment
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x - 25, p3.y);
    ctx.stroke();

    // Right segment
    ctx.beginPath();
    ctx.moveTo(p3.x + 25, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.lineTo(p5.x, p5.y);
    ctx.stroke();

    // Digital Voltmeter Widget at p3
    const meterX = p3.x;
    const meterY = p3.y;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(meterX - 35, meterY - 18, 70, 36, 6);
    ctx.fill();
    ctx.stroke();

    const emf = this.calculateEMF();
    ctx.fillStyle = emf > 0.05 ? '#0284C7' : '#EF4444';
    ctx.font = '700 12px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${emf.toFixed(3)} V`, meterX, meterY);

    // Knife Switch at right shoulder
    const switchX = (meterX + p4.x) * 0.5;
    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.arc(switchX - 10, wireTopY, 3, 0, Math.PI * 2);
    ctx.arc(switchX + 10, wireTopY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(switchX - 10, wireTopY);
    if (this.switchClosed) {
      ctx.lineTo(switchX + 10, wireTopY);
    } else {
      ctx.lineTo(switchX + 6, wireTopY - 16);
    }
    ctx.stroke();

    // Electron Animation along Wire
    if (this.calculateEMF() > 0.05) {
      const wireLength = (p1.y - p2.y) + (p4.x - p2.x) + (p5.y - p4.y);
      for (const e of this.wireElectrons) {
        const d = e.progress * wireLength;
        let ex, ey;

        if (d < (p1.y - p2.y)) {
          // Going up from Zn
          ex = p1.x;
          ey = p1.y - d;
        } else if (d < (p1.y - p2.y) + (p4.x - p2.x)) {
          // Going right towards Cu
          ex = p2.x + (d - (p1.y - p2.y));
          ey = wireTopY;
        } else {
          // Going down to Cu
          ex = p4.x;
          ey = wireTopY + (d - ((p1.y - p2.y) + (p4.x - p2.x)));
        }

        ctx.fillStyle = '#2563EB';
        ctx.beginPath();
        ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 7px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('-', ex, ey);
      }
    }

    ctx.restore();
  }

  drawNernstGraph(gx, gy, gw, gh) {
    const { ctx } = this;
    ctx.save();

    // Card Container
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(gx, gy, gw, gh, 12);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.fillStyle = '#0F172A';
    ctx.font = '700 12px Plus Jakarta Sans';
    ctx.textAlign = 'left';
    ctx.fillText('Nernst Potential vs. Reaction Quotient log₁₀(Q)', gx + 16, gy + 24);

    const xOrigin = gx + 45;
    const yOrigin = gy + gh - 35;
    const plotW = gw - 65;
    const plotH = gh - 75;

    // Axes
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(xOrigin, yOrigin);
    ctx.lineTo(xOrigin + plotW, yOrigin);
    ctx.moveTo(xOrigin, yOrigin);
    ctx.lineTo(xOrigin, yOrigin - plotH);
    ctx.stroke();

    // Labels
    ctx.font = '600 10px JetBrains Mono';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.fillText('log₁₀([Zn²⁺] / [Cu²⁺])', xOrigin + plotW * 0.5, yOrigin + 22);

    ctx.save();
    ctx.translate(xOrigin - 30, yOrigin - plotH * 0.5);
    ctx.rotate(-Math.PI * 0.5);
    ctx.fillText('Cell EMF E (V)', 0, 0);
    ctx.restore();

    // Scale mapping (log10(Q) from -3 to +3, E from 1.00 V to 1.20 V)
    const minLogQ = -3.0;
    const maxLogQ = 3.0;
    const minE = 1.00;
    const maxE = 1.20;

    const toX = (lq) => xOrigin + ((lq - minLogQ) / (maxLogQ - minLogQ)) * plotW;
    const toY = (e) => yOrigin - ((e - minE) / (maxE - minE)) * plotH;

    // Standard 1.100 V Line
    const yStd = toY(1.100);
    ctx.strokeStyle = '#E2E8F0';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(xOrigin, yStd);
    ctx.lineTo(xOrigin + plotW, yStd);
    ctx.stroke();

    ctx.font = '700 9px JetBrains Mono';
    ctx.fillStyle = '#94A3B8';
    ctx.textAlign = 'right';
    ctx.fillText('E° = 1.100V', xOrigin + plotW - 4, yStd - 4);
    ctx.setLineDash([]);

    // Linear Nernst Slope Line
    const T_K = 273.15 + this.tempC;
    const slope = (2.302585 * this.R * T_K) / (this.n * this.F);

    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const startX = toX(minLogQ);
    const startY = toY(this.E0_standard - slope * minLogQ);
    ctx.moveTo(startX, startY);

    const endX = toX(maxLogQ);
    const endY = toY(this.E0_standard - slope * maxLogQ);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Current Operating Point
    const curQ = this.concZn / this.concCu;
    const curLogQ = Math.log10(curQ);
    const curEMF = this.calculateEMF();

    if (this.saltBridgeInserted && this.switchClosed && curLogQ >= minLogQ && curLogQ <= maxLogQ) {
      const curPx = toX(curLogQ);
      const curPy = toY(curEMF);

      ctx.fillStyle = '#F59E0B';
      ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(curPx, curPy, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.font = '700 9px JetBrains Mono';
      ctx.fillStyle = '#D97706';
      ctx.textAlign = 'left';
      ctx.fillText(`(${curEMF.toFixed(3)}V)`, curPx + 8, curPy - 4);
    }

    ctx.restore();
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.sim = new DaniellCellSimulation();
});

