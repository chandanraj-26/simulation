/**
 * Redox Titration & Permanganometry with KMnO4 & Mohr's Salt
 * Strict Zero-Dependency Vanilla Web Standard & Simulation Guidelines
 */

class RedoxTitrationSimulation {
  constructor() {
    this.canvas = document.getElementById('simCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Chemical Parameters
    this.titrantMolarity = 0.020; // M KMnO4
    this.analyteVolume = 20.0; // mL
    this.analyteMolarity = 0.050; // M Fe2+ (Mohr's Salt)
    this.analyteType = 'mohrs_salt'; // 'mohrs_salt' or 'oxalic_acid'

    // Calculation of Equivalence Volume
    // 5 Fe2+ + MnO4- + 8 H+ -> 5 Fe3+ + Mn2+ + 4 H2O
    // V_eq = (M_fe * V_fe / 5) / M_kmno4
    this.vEquivalence = 10.00; // mL

    // Current State
    this.titrantAdded = 0.00; // mL added from burette
    this.stopcockMode = 'off'; // 'off', 'slow', 'fast'
    this.stirrerSpeed = 500; // RPM
    this.stirrerAngle = 0;
    this.solutionTemp = 25; // deg C
    this.endpointReached = false;
    this.soundEnabled = true;

    // Droplets
    this.droplets = [];
    this.lastDropTime = 0;

    // Historical Points for Titration Curve
    this.curvePoints = [];
    this.recordCurvePoint(0);

    // Audio Context
    this.audioCtx = null;

    this.initDOM();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.attachEvents();
    this.startLoop();
  }

  initDOM() {
    this.selectAnalyte = document.getElementById('selectAnalyte');
    this.sliderStirrer = document.getElementById('sliderStirrer');
    this.valStirrer = document.getElementById('valStirrer');

    this.teleBuretteVol = document.getElementById('teleBuretteVol');
    this.telePotential = document.getElementById('telePotential');
    this.teleFeRatio = document.getElementById('teleFeRatio');
    this.teleIndicatorStatus = document.getElementById('teleIndicatorStatus');

    this.btnStop = document.getElementById('btnStop');
    this.btnDrop = document.getElementById('btnDrop');
    this.btnSlow = document.getElementById('btnSlow');
    this.btnFast = document.getElementById('btnFast');

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

  playDropPlop() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450 + Math.random() * 80, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {}
  }

  playEndpointChime() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + idx * 0.08);
        osc.stop(this.audioCtx.currentTime + idx * 0.08 + 0.35);
      });
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

  attachEvents() {
    this.selectAnalyte.addEventListener('change', (e) => {
      this.initAudio();
      this.analyteType = e.target.value;
      if (this.analyteType === 'oxalic_acid') {
        // Oxalic acid requires 2:5 stoichiometry with KMnO4
        // 5 (COOH)2 + 2 MnO4- + 6 H+ -> 10 CO2 + 2 Mn2+ + 8 H2O
        // Moles (COOH)2 = 20 mL * 0.05 M = 1.0 mmol
        // KMnO4 mmol = 1.0 * (2/5) = 0.40 mmol -> V = 0.40 / 0.02 = 20.0 mL
        this.vEquivalence = 20.00;
        this.solutionTemp = 65; // Warm bath
      } else {
        this.vEquivalence = 10.00;
        this.solutionTemp = 25;
      }
      this.resetAll(false);
    });

    this.sliderStirrer.addEventListener('input', (e) => {
      this.stirrerSpeed = parseInt(e.target.value);
      this.valStirrer.textContent = `${this.stirrerSpeed} RPM`;
    });

    // Stopcock Action Buttons
    this.btnStop.addEventListener('click', () => {
      this.initAudio();
      this.setStopcockMode('off');
    });

    this.btnDrop.addEventListener('click', () => {
      this.initAudio();
      this.setStopcockMode('off');
      this.addSingleDrop();
    });

    this.btnSlow.addEventListener('click', () => {
      this.initAudio();
      this.setStopcockMode(this.stopcockMode === 'slow' ? 'off' : 'slow');
    });

    this.btnFast.addEventListener('click', () => {
      this.initAudio();
      this.setStopcockMode(this.stopcockMode === 'fast' ? 'off' : 'fast');
    });

    this.btnAudioToggle.addEventListener('click', () => {
      this.initAudio();
      this.soundEnabled = !this.soundEnabled;
      this.btnAudioToggle.textContent = this.soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    });

    this.btnResetAll.addEventListener('click', () => {
      this.resetAll(true);
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

  setStopcockMode(mode) {
    this.stopcockMode = mode;
    this.btnStop.classList.toggle('active', mode === 'off');
    this.btnSlow.classList.toggle('active', mode === 'slow');
    this.btnFast.classList.toggle('active', mode === 'fast');
  }

  addSingleDrop() {
    if (this.titrantAdded >= 50.0) return;
    this.titrantAdded = Math.min(50.0, this.titrantAdded + 0.05);
    this.checkEndpoint();
    this.recordCurvePoint(this.titrantAdded);
    this.updateTelemetry();
    this.playDropPlop();

    // Spawn visual drop
    const buretteTipX = this.width * 0.28;
    const buretteTipY = this.height * 0.44;
    this.droplets.push({ x: buretteTipX, y: buretteTipY, vy: 2.5 });
  }

  checkEndpoint() {
    if (!this.endpointReached && this.titrantAdded >= this.vEquivalence) {
      this.endpointReached = true;
      this.playEndpointChime();
    }
  }

  recordCurvePoint(vol) {
    const pot = this.calculatePotential(vol);
    this.curvePoints.push({ vol, pot });
  }

  resetAll(resetSelect = true) {
    this.titrantAdded = 0.00;
    this.setStopcockMode('off');
    this.endpointReached = false;
    this.droplets = [];
    this.curvePoints = [];
    this.recordCurvePoint(0);

    if (resetSelect) {
      this.selectAnalyte.value = 'mohrs_salt';
      this.analyteType = 'mohrs_salt';
      this.vEquivalence = 10.00;
      this.solutionTemp = 25;
    }

    this.sliderStirrer.value = 500;
    this.stirrerSpeed = 500;
    this.valStirrer.textContent = '500 RPM';

    this.updateTelemetry();
  }

  calculatePotential(vol) {
    const vEq = this.vEquivalence;
    const E0_Fe = 0.771; // V (Fe3+ / Fe2+)
    const E0_Mn = 1.510; // V (MnO4- / Mn2+)

    if (vol <= 0.01) {
      return 0.65;
    } else if (vol < vEq - 0.05) {
      // Fraction of Fe2+ titrated: f = vol / vEq
      const f = vol / vEq;
      // Nernst: E = E0_Fe + 0.0591 * log10(f / (1 - f))
      const ratio = Math.max(0.001, Math.min(999, f / (1.0 - f)));
      return E0_Fe + 0.0591 * Math.log10(ratio);
    } else if (Math.abs(vol - vEq) <= 0.05) {
      // Equivalence point weighted average potential: (5*E0_Mn + E0_Fe)/6
      return (5 * E0_Mn + E0_Fe) / 6; // ≈ 1.387 V
    } else {
      // Excess KMnO4
      const excessRatio = (vol - vEq) / vEq;
      const pot = E0_Mn + (0.0591 / 5) * Math.log10(Math.max(0.001, excessRatio));
      return Math.min(1.55, pot);
    }
  }

  getFlaskSolutionColor() {
    const vEq = this.vEquivalence;
    const diff = this.titrantAdded - vEq;

    if (diff < -0.05) {
      // Clear, very pale yellowish-green tint of Fe2+/Fe3+
      return 'rgba(238, 245, 235, 0.5)';
    } else if (diff <= 0.25) {
      // Sharp permanent faint pink equivalence color!
      return 'rgba(244, 114, 182, 0.45)';
    } else {
      // Deepening pink to purple as excess KMnO4 builds
      const excessAlpha = Math.min(0.9, 0.45 + (diff / 10) * 0.45);
      return `rgba(162, 28, 145, ${excessAlpha.toFixed(2)})`;
    }
  }

  updateTelemetry() {
    const pot = this.calculatePotential(this.titrantAdded);
    const vEq = this.vEquivalence;

    this.teleBuretteVol.textContent = `${this.titrantAdded.toFixed(2)} mL`;
    this.telePotential.textContent = `${pot.toFixed(3)} V`;

    // Fe3+ / Fe2+ molar ratio
    let feRatioStr = '0.00';
    if (this.titrantAdded < vEq) {
      const frac = this.titrantAdded / vEq;
      feRatioStr = (frac / (1 - frac)).toFixed(2);
    } else {
      feRatioStr = '100% Fe³⁺';
    }
    this.teleFeRatio.textContent = feRatioStr;

    // Indicator Status
    if (this.titrantAdded < vEq - 0.05) {
      this.teleIndicatorStatus.textContent = 'Colorless (Before Eq)';
      this.teleIndicatorStatus.style.color = '#475569';
    } else if (Math.abs(this.titrantAdded - vEq) <= 0.25) {
      this.teleIndicatorStatus.textContent = '🌸 Faint Pink (Equivalence!)';
      this.teleIndicatorStatus.style.color = '#DB2777';
    } else {
      this.teleIndicatorStatus.textContent = 'Deep Purple (Over-titrated)';
      this.teleIndicatorStatus.style.color = '#701A75';
    }
  }

  startLoop() {
    const render = (time) => {
      this.updatePhysics(time);
      this.draw();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  updatePhysics(time) {
    const now = performance.now();

    // Stirrer rotation
    this.stirrerAngle += (this.stirrerSpeed / 60) * 0.1;

    // Automatic titration feeding
    if (this.stopcockMode === 'slow') {
      if (now - this.lastDropTime > 400) {
        this.lastDropTime = now;
        this.addSingleDrop();
      }
    } else if (this.stopcockMode === 'fast') {
      if (now - this.lastDropTime > 120) {
        this.lastDropTime = now;
        this.addSingleDrop();
      }
    }

    // Update Falling Droplets
    const flaskNeckY = this.height * 0.58;
    for (let i = this.droplets.length - 1; i >= 0; i--) {
      const d = this.droplets[i];
      d.vy += 0.25; // gravity
      d.y += d.vy;
      if (d.y >= flaskNeckY) {
        this.droplets.splice(i, 1);
      }
    }
  }

  draw() {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    // Grid
    this.drawBackgroundGrid();

    // 1. Draw Burette & Stand (Left 50%)
    const benchX = width * 0.28;
    this.drawTitrationBench(benchX);

    // 2. Draw Falling Droplets
    this.drawDroplets();

    // 3. Draw Potentiometric Titration Curve (Right 42%)
    const graphX = width * 0.55;
    const graphY = height * 0.10;
    const graphW = width * 0.41;
    const graphH = height * 0.80;

    this.drawTitrationGraph(graphX, graphY, graphW, graphH);
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

  drawTitrationBench(bx) {
    const { ctx, height } = this;
    ctx.save();

    // Metal Retort Stand & Base
    const standBaseY = height * 0.88;
    ctx.fillStyle = '#334155';
    ctx.fillRect(bx - 100, standBaseY, 180, 16);
    ctx.fillStyle = '#64748B';
    ctx.fillRect(bx - 70, height * 0.06, 8, standBaseY - height * 0.06);

    // Clamp Arm
    ctx.fillStyle = '#475569';
    ctx.fillRect(bx - 70, height * 0.25, 70, 8);

    // --- Glass Burette ---
    const buretteW = 18;
    const buretteTopY = height * 0.08;
    const buretteBottomY = height * 0.40;
    const buretteH = buretteBottomY - buretteTopY;

    // Liquid inside burette (KMnO4 deep purple)
    const liquidTopY = buretteTopY + (this.titrantAdded / 50.0) * buretteH;
    ctx.fillStyle = 'rgba(112, 26, 117, 0.85)';
    ctx.fillRect(bx - buretteW * 0.5, liquidTopY, buretteW, buretteBottomY - liquidTopY);

    // Upper dark meniscus curve
    ctx.fillStyle = '#4A044E';
    ctx.beginPath();
    ctx.ellipse(bx, liquidTopY, buretteW * 0.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glass walls
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx - buretteW * 0.5, buretteTopY, buretteW, buretteH);

    // Graduation marks on burette
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.font = '600 8px JetBrains Mono';
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'right';

    for (let ml = 0; ml <= 50; ml += 10) {
      const my = buretteTopY + (ml / 50.0) * buretteH;
      ctx.beginPath();
      ctx.moveTo(bx + buretteW * 0.5 - 6, my);
      ctx.lineTo(bx + buretteW * 0.5, my);
      ctx.stroke();

      ctx.fillText(`${ml}`, bx - buretteW * 0.5 - 4, my + 3);
    }

    // Burette Stopcock & Valve
    const stopcockY = buretteBottomY + 8;
    ctx.fillStyle = '#64748B';
    ctx.fillRect(bx - 4, buretteBottomY, 8, 16);

    // Valve handle
    ctx.fillStyle = this.stopcockMode === 'off' ? '#EF4444' : '#10B981';
    ctx.beginPath();
    ctx.roundRect(bx - 12, stopcockY - 4, 24, 8, 3);
    ctx.fill();

    // Delivery Tip
    ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
    ctx.beginPath();
    ctx.moveTo(bx - 3, stopcockY + 6);
    ctx.lineTo(bx + 3, stopcockY + 6);
    ctx.lineTo(bx + 1, height * 0.45);
    ctx.lineTo(bx - 1, height * 0.45);
    ctx.closePath();
    ctx.fill();

    // --- Magnetic Stirrer Hotplate ---
    const plateY = height * 0.74;
    const plateW = 140;
    const plateH = 28;

    ctx.fillStyle = '#E2E8F0';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bx - plateW * 0.5, plateY, plateW, plateH, 6);
    ctx.fill();
    ctx.stroke();

    // Knobs
    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.arc(bx - 35, plateY + 14, 6, 0, Math.PI * 2);
    ctx.arc(bx + 35, plateY + 14, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '700 9px JetBrains Mono';
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.stirrerSpeed} RPM`, bx, plateY + 18);

    // --- Conical Flask (Erlenmeyer) ---
    const flaskBottomY = plateY;
    const flaskBaseW = 100;
    const flaskNeckW = 24;
    const flaskNeckTopY = height * 0.48;
    const flaskShoulderY = height * 0.58;

    // Liquid inside flask
    const solutionColor = this.getFlaskSolutionColor();
    const liquidH = (flaskBottomY - flaskShoulderY) * 0.75;
    const liquidTopY = flaskBottomY - liquidH;

    // Liquid Body polygon
    ctx.fillStyle = solutionColor;
    ctx.beginPath();
    ctx.moveTo(bx - flaskBaseW * 0.46, flaskBottomY);
    ctx.lineTo(bx + flaskBaseW * 0.46, flaskBottomY);
    ctx.lineTo(bx + flaskBaseW * 0.28, liquidTopY);
    ctx.lineTo(bx - flaskBaseW * 0.28, liquidTopY);
    ctx.closePath();
    ctx.fill();

    // Liquid Vortex if stirring
    if (this.stirrerSpeed > 100) {
      const vortexDepth = Math.min(22, (this.stirrerSpeed / 1000) * 22);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(bx, liquidTopY, flaskBaseW * 0.25, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = solutionColor;
      ctx.beginPath();
      ctx.ellipse(bx, liquidTopY + vortexDepth * 0.5, 6, vortexDepth, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Spinning Magnetic Teflon Stir Bar
    const stirBarY = flaskBottomY - 4;
    ctx.save();
    ctx.translate(bx, stirBarY);
    ctx.rotate(this.stirrerAngle);
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-12, -3, 24, 6, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Glass outline of flask
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bx - flaskNeckW * 0.5, flaskNeckTopY);
    ctx.lineTo(bx - flaskNeckW * 0.5, flaskShoulderY);
    ctx.lineTo(bx - flaskBaseW * 0.5, flaskBottomY);
    ctx.lineTo(bx + flaskBaseW * 0.5, flaskBottomY);
    ctx.lineTo(bx + flaskNeckW * 0.5, flaskShoulderY);
    ctx.lineTo(bx + flaskNeckW * 0.5, flaskNeckTopY);
    ctx.stroke();

    // Lip
    ctx.strokeRect(bx - flaskNeckW * 0.5 - 3, flaskNeckTopY - 3, flaskNeckW + 6, 3);

    ctx.restore();
  }

  drawDroplets() {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = '#701A75';
    for (const d of this.droplets) {
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, 2.5, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawTitrationGraph(gx, gy, gw, gh) {
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
    ctx.fillText('Potentiometric Redox Titration Curve', gx + 16, gy + 24);

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
    ctx.fillText('V(KMnO₄) in mL', xOrigin + plotW * 0.5, yOrigin + 22);

    ctx.save();
    ctx.translate(xOrigin - 30, yOrigin - plotH * 0.5);
    ctx.rotate(-Math.PI * 0.5);
    ctx.fillText('Potential E (V)', 0, 0);
    ctx.restore();

    // Scale mapping (Vol: 0 to 25 mL, E: 0.5 V to 1.6 V)
    const maxVol = this.analyteType === 'oxalic_acid' ? 30.0 : 20.0;
    const minE = 0.5;
    const maxE = 1.6;

    const toX = (v) => xOrigin + (v / maxVol) * plotW;
    const toY = (e) => yOrigin - ((e - minE) / (maxE - minE)) * plotH;

    // Grid lines for V_eq and E_eq
    const vEq = this.vEquivalence;
    const xEq = toX(vEq);
    ctx.strokeStyle = '#E2E8F0';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(xEq, yOrigin);
    ctx.lineTo(xEq, yOrigin - plotH);
    ctx.stroke();

    ctx.font = '700 9px JetBrains Mono';
    ctx.fillStyle = '#DB2777';
    ctx.textAlign = 'center';
    ctx.fillText(`V_eq = ${vEq.toFixed(1)}mL`, xEq, yOrigin - plotH + 12);
    ctx.setLineDash([]);

    // Full Theoretical Curve (Light Line)
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let v = 0.1; v <= maxVol; v += 0.2) {
      const pot = this.calculatePotential(v);
      const px = toX(v);
      const py = toY(pot);
      if (v === 0.1) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Staged Curve Recorded by User
    if (this.curvePoints.length > 1) {
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(toX(this.curvePoints[0].vol), toY(this.curvePoints[0].pot));
      for (let i = 1; i < this.curvePoints.length; i++) {
        ctx.lineTo(toX(this.curvePoints[i].vol), toY(this.curvePoints[i].pot));
      }
      ctx.stroke();
    }

    // Current Operating Point (Live Radar)
    const curPot = this.calculatePotential(this.titrantAdded);
    const curPx = toX(Math.min(maxVol, this.titrantAdded));
    const curPy = toY(curPot);

    ctx.fillStyle = this.titrantAdded >= vEq ? '#DB2777' : '#0284C7';
    ctx.shadowColor = 'rgba(219, 39, 119, 0.5)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(curPx, curPy, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.sim = new RedoxTitrationSimulation();
});
