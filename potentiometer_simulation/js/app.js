/**
 * Potentiometer EMF Comparison & Internal Resistance Virtual Laboratory
 * Strict Zero-Dependency Vanilla Web Standard & Simulation Guidelines
 */

class PotentiometerSimulation {
  constructor() {
    this.canvas = document.getElementById('simCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Physical Parameters
    this.vDriver = 2.00; // Volts (Storage Accumulator)
    this.wireLengthTotal = 400.0; // cm (4 segments x 100 cm)
    this.rheostatR = 15.0; // Ohms (controls gradient k)
    this.wireResistance = 25.0; // Ohms (total 400 cm wire)

    // Mode: 'compare_emf' or 'internal_r'
    this.mode = 'compare_emf';

    // Cell Definitions
    this.cells = {
      leclanche: { name: 'Leclanché Cell', emf: 1.450 },
      daniell: { name: 'Daniell Cell', emf: 1.080 }
    };
    this.selectedCellKey = 'leclanche'; // for compare_emf mode

    // Internal resistance mode state
    this.cellEMF = 1.400; // V
    this.internalR_true = 2.40; // Ohms
    this.shuntR = 5.0; // Ohms from resistance box
    this.shuntKeyClosed = false;

    // Jockey State
    this.jockeyLength = 150.0; // cm along wire [0 to 400]
    this.isDraggingJockey = false;
    this.needleDeflection = 0.0; // -30 to +30 scale
    this.soundEnabled = true;

    // Audio Context
    this.audioCtx = null;

    this.initDOM();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.attachEvents();
    this.startLoop();
  }

  initDOM() {
    this.tabCompare = document.getElementById('tabCompare');
    this.tabInternalR = document.getElementById('tabInternalR');

    this.panelCompare = document.getElementById('panelCompare');
    this.panelInternalR = document.getElementById('panelInternalR');

    this.selectCell = document.getElementById('selectCell');
    this.sliderRheostat = document.getElementById('sliderRheostat');
    this.valRheostat = document.getElementById('valRheostat');

    this.sliderShuntR = document.getElementById('sliderShuntR');
    this.valShuntR = document.getElementById('valShuntR');
    this.toggleShuntKey = document.getElementById('toggleShuntKey');

    this.teleJockeyPos = document.getElementById('teleJockeyPos');
    this.teleGradient = document.getElementById('teleGradient');
    this.teleGalvoCurrent = document.getElementById('teleGalvoCurrent');
    this.teleResult = document.getElementById('teleResult');

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

  playJockeyClick() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600 + Math.random() * 200, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.03, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.03);
    } catch (e) {}
  }

  playNullChime() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime); // High A5
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.25);
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
    this.tabCompare.addEventListener('click', () => {
      this.mode = 'compare_emf';
      this.tabCompare.classList.add('active');
      this.tabInternalR.classList.remove('active');
      this.panelCompare.style.display = 'block';
      this.panelInternalR.style.display = 'none';
      this.updateTelemetry();
    });

    this.tabInternalR.addEventListener('click', () => {
      this.mode = 'internal_r';
      this.tabInternalR.classList.add('active');
      this.tabCompare.classList.remove('active');
      this.panelCompare.style.display = 'none';
      this.panelInternalR.style.display = 'block';
      this.updateTelemetry();
    });

    this.selectCell.addEventListener('change', (e) => {
      this.initAudio();
      this.selectedCellKey = e.target.value;
      this.updateTelemetry();
    });

    this.sliderRheostat.addEventListener('input', (e) => {
      this.initAudio();
      this.rheostatR = parseFloat(e.target.value);
      this.valRheostat.textContent = `${this.rheostatR.toFixed(1)} Ω`;
      this.updateTelemetry();
    });

    this.sliderShuntR.addEventListener('input', (e) => {
      this.initAudio();
      this.shuntR = parseFloat(e.target.value);
      this.valShuntR.textContent = `${this.shuntR.toFixed(1)} Ω`;
      this.updateTelemetry();
    });

    this.toggleShuntKey.addEventListener('change', (e) => {
      this.initAudio();
      this.shuntKeyClosed = e.target.checked;
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

    // Pointer Events for Draggable Jockey
    const handlePointerDown = (evt) => {
      this.initAudio();
      const rect = this.canvas.getBoundingClientRect();
      const mx = (evt.clientX || (evt.touches && evt.touches[0].clientX)) - rect.left;
      const my = (evt.clientY || (evt.touches && evt.touches[0].clientY)) - rect.top;

      const boardX = this.width * 0.08;
      const boardY = this.height * 0.18;
      const boardW = this.width * 0.54;
      const boardH = this.height * 0.44;

      if (mx >= boardX - 10 && mx <= boardX + boardW + 10 && my >= boardY - 10 && my <= boardY + boardH + 10) {
        this.isDraggingJockey = true;
        this.updateJockeyFromMouse(mx, my);
      }
    };

    const handlePointerMove = (evt) => {
      if (!this.isDraggingJockey) return;
      const rect = this.canvas.getBoundingClientRect();
      const mx = (evt.clientX || (evt.touches && evt.touches[0].clientX)) - rect.left;
      const my = (evt.clientY || (evt.touches && evt.touches[0].clientY)) - rect.top;
      this.updateJockeyFromMouse(mx, my);
    };

    const handlePointerUp = () => {
      this.isDraggingJockey = false;
    };

    this.canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    this.canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    this.updateTelemetry();
  }

  updateJockeyFromMouse(mx, my) {
    const boardX = this.width * 0.08;
    const boardY = this.height * 0.18;
    const boardW = this.width * 0.54;
    const wireSpacing = (this.height * 0.44) / 4;

    // Detect which wire (0, 1, 2, or 3)
    const relY = my - boardY;
    let wireIdx = Math.floor(relY / wireSpacing);
    wireIdx = Math.max(0, Math.min(3, wireIdx));

    // Fraction along wire (0.0 to 1.0)
    const fracX = Math.max(0, Math.min(1, (mx - (boardX + 25)) / (boardW - 50)));

    let cm;
    if (wireIdx === 0) {
      cm = fracX * 100.0;
    } else if (wireIdx === 1) {
      cm = 100.0 + (1.0 - fracX) * 100.0;
    } else if (wireIdx === 2) {
      cm = 200.0 + fracX * 100.0;
    } else {
      cm = 300.0 + (1.0 - fracX) * 100.0;
    }

    const prevL = this.jockeyLength;
    this.jockeyLength = Math.max(0.5, Math.min(399.5, cm));

    // Check if crossing null balance
    const targetV = this.getTargetVoltage();
    const k = this.getPotentialGradient();
    const balanceL = targetV / k;

    if ((prevL < balanceL && this.jockeyLength >= balanceL) || (prevL > balanceL && this.jockeyLength <= balanceL)) {
      this.playNullChime();
    } else if (Math.abs(prevL - this.jockeyLength) > 5) {
      this.playJockeyClick();
    }

    this.updateTelemetry();
  }

  resetAll() {
    this.mode = 'compare_emf';
    this.selectedCellKey = 'leclanche';
    this.rheostatR = 15.0;
    this.shuntR = 5.0;
    this.shuntKeyClosed = false;
    this.jockeyLength = 150.0;

    this.sliderRheostat.value = 15.0;
    this.sliderShuntR.value = 5.0;
    this.toggleShuntKey.checked = false;

    this.valRheostat.textContent = '15.0 Ω';
    this.valShuntR.textContent = '5.0 Ω';

    this.tabCompare.classList.add('active');
    this.tabInternalR.classList.remove('active');
    this.panelCompare.style.display = 'block';
    this.panelInternalR.style.display = 'none';

    this.updateTelemetry();
    this.playJockeyClick();
  }

  // Potential gradient k = V_wire / 400 (V/cm)
  getPotentialGradient() {
    const totalDriverR = this.wireResistance + this.rheostatR;
    const current = this.vDriver / totalDriverR; // Amperes
    const vWireTotal = current * this.wireResistance;
    return vWireTotal / this.wireLengthTotal; // V/cm
  }

  getTargetVoltage() {
    if (this.mode === 'compare_emf') {
      return this.cells[this.selectedCellKey].emf;
    } else {
      if (!this.shuntKeyClosed) {
        // Open circuit: measures true EMF E
        return this.cellEMF;
      } else {
        // Closed circuit: terminal voltage V = E * R / (R + r)
        return (this.cellEMF * this.shuntR) / (this.shuntR + this.internalR_true);
      }
    }
  }

  updateTelemetry() {
    const k = this.getPotentialGradient();
    const vJockey = this.jockeyLength * k;
    const vTarget = this.getTargetVoltage();
    const vDiff = vJockey - vTarget;

    // Deflection of galvanometer: max ±30 divisions
    this.needleDeflection = Math.max(-30, Math.min(30, vDiff * 250));

    this.teleJockeyPos.textContent = `${this.jockeyLength.toFixed(1)} cm`;
    this.teleGradient.textContent = `${(k * 1000).toFixed(2)} mV/cm`;

    if (Math.abs(vDiff) < 0.003) {
      this.teleGalvoCurrent.textContent = '0.0 div (Null Deflection!)';
      this.teleGalvoCurrent.style.color = '#10B981';
    } else {
      this.teleGalvoCurrent.textContent = `${this.needleDeflection.toFixed(1)} div`;
      this.teleGalvoCurrent.style.color = '#EF4444';
    }

    if (this.mode === 'compare_emf') {
      const l1 = this.cells.leclanche.emf / k;
      const l2 = this.cells.daniell.emf / k;
      this.teleResult.textContent = `E₁/E₂ = ${(l1 / l2).toFixed(3)} (Theory: 1.343)`;
    } else {
      const l1 = this.cellEMF / k;
      const l2 = ((this.cellEMF * this.shuntR) / (this.shuntR + this.internalR_true)) / k;
      const r_calc = this.shuntR * ((l1 - l2) / l2);
      this.teleResult.textContent = `r = ${r_calc.toFixed(2)} Ω (True: ${this.internalR_true.toFixed(2)}Ω)`;
    }
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

    // Board Dimensions
    const boardX = width * 0.06;
    const boardY = height * 0.16;
    const boardW = width * 0.56;
    const boardH = height * 0.44;

    // 1. Draw 4-Wire Wooden Potentiometer Board
    this.drawPotentiometerBoard(boardX, boardY, boardW, boardH);

    // 2. Draw Jockey Needle on Wire
    this.drawJockey(boardX, boardY, boardW, boardH);

    // 3. Draw Center-Zero Galvanometer & Circuits Below
    this.drawCircuitsAndGalvo(boardX, boardY + boardH + 20, boardW, height * 0.30);

    // 4. Draw Precision Telemetry Strip & Summary Panel (Right 34%)
    const rightX = width * 0.65;
    const rightY = height * 0.10;
    const rightW = width * 0.32;
    const rightH = height * 0.80;

    this.drawRightPanel(rightX, rightY, rightW, rightH);
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

  drawPotentiometerBoard(bx, by, bw, bh) {
    const { ctx } = this;
    ctx.save();

    // Wooden Board Base
    ctx.fillStyle = '#E2E8F0';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 10);
    ctx.fill();
    ctx.stroke();

    // Wooden Texture / Rim
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx + 8, by + 8, bw - 16, bh - 16);

    // Brass Strips on Ends
    const stripW = 16;
    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 1.5;

    const wireSpacing = bh / 4;
    const wStartX = bx + 28;
    const wEndX = bx + bw - 28;

    // Left Copper Strip 1 (Connecting wire 1 and 2 at right end, wire 2 and 3 at left end)
    // Left connector between wire 1 and 2
    ctx.fillRect(bx + 12, by + wireSpacing * 1.5 - 12, stripW, wireSpacing + 24);
    // Right connector between wire 0 and 1
    ctx.fillRect(wEndX + 2, by + wireSpacing * 0.5 - 12, stripW, wireSpacing + 24);
    // Right connector between wire 2 and 3
    ctx.fillRect(wEndX + 2, by + wireSpacing * 2.5 - 12, stripW, wireSpacing + 24);

    // 4 Manganin/Constantan Wires
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 2.5;

    for (let i = 0; i < 4; i++) {
      const wy = by + wireSpacing * (i + 0.5);
      ctx.beginPath();
      ctx.moveTo(wStartX, wy);
      ctx.lineTo(wEndX, wy);
      ctx.stroke();

      // Centimeter Scale marks on board
      ctx.fillStyle = '#64748B';
      ctx.font = '600 8.5px JetBrains Mono';
      ctx.textAlign = 'center';

      for (let cm = 0; cm <= 100; cm += 20) {
        const mx = wStartX + (cm / 100.0) * (wEndX - wStartX);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mx, wy - 4);
        ctx.lineTo(mx, wy + 4);
        ctx.stroke();

        let displayCm;
        if (i % 2 === 0) displayCm = i * 100 + cm;
        else displayCm = i * 100 + (100 - cm);

        ctx.fillText(`${displayCm}`, mx, wy + 14);
      }
    }

    // Terminal Binding Posts: A (0 cm) and B (400 cm)
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(wStartX, by + wireSpacing * 0.5, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '700 11px JetBrains Mono';
    ctx.textAlign = 'right';
    ctx.fillText('A (0cm)', wStartX - 8, by + wireSpacing * 0.5 + 4);

    ctx.beginPath();
    ctx.arc(wStartX, by + wireSpacing * 3.5, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillText('B (400cm)', wStartX - 8, by + wireSpacing * 3.5 + 4);

    ctx.restore();
  }

  drawJockey(bx, by, bw, bh) {
    const { ctx } = this;
    ctx.save();

    const wireSpacing = bh / 4;
    const wStartX = bx + 28;
    const wEndX = bx + bw - 28;

    // Convert jockey length (0 to 400) to Canvas (x, y)
    let wireIdx = Math.floor(this.jockeyLength / 100.0);
    wireIdx = Math.max(0, Math.min(3, wireIdx));
    const cmInWire = this.jockeyLength - wireIdx * 100.0;

    let fracX;
    if (wireIdx % 2 === 0) {
      fracX = cmInWire / 100.0;
    } else {
      fracX = (100.0 - cmInWire) / 100.0;
    }

    const jx = wStartX + fracX * (wEndX - wStartX);
    const jy = by + wireSpacing * (wireIdx + 0.5);

    // Knife-Edge Jockey Icon
    ctx.fillStyle = '#EF4444';
    ctx.strokeStyle = '#B91C1C';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(jx, jy);
    ctx.lineTo(jx - 8, jy - 22);
    ctx.lineTo(jx + 8, jy - 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Jockey Handle
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(jx - 4, jy - 38, 8, 16);

    // Position Tag Callout
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(jx - 30, jy - 56, 60, 16, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#EF4444';
    ctx.font = '700 9px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.jockeyLength.toFixed(1)} cm`, jx, jy - 44);

    ctx.restore();
  }

  drawCircuitsAndGalvo(cx, cy, cw, ch) {
    const { ctx } = this;
    ctx.save();

    // Center-Zero Galvanometer Widget
    const galvoX = cx + cw * 0.5;
    const galvoY = cy + ch * 0.45;
    const galvoR = 34;

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(galvoX, galvoY, galvoR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Galvanometer Scale Arc (-30 to +30)
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(galvoX, galvoY, galvoR - 10, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();

    // Center Zero mark
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(galvoX, galvoY - galvoR + 10);
    ctx.lineTo(galvoX, galvoY - galvoR + 17);
    ctx.stroke();

    ctx.font = '700 9px JetBrains Mono';
    ctx.fillStyle = '#10B981';
    ctx.textAlign = 'center';
    ctx.fillText('0', galvoX, galvoY - galvoR + 25);

    // Deflecting Needle
    const needleAngle = -Math.PI * 0.5 + (this.needleDeflection / 30.0) * (Math.PI * 0.3);
    ctx.strokeStyle = Math.abs(this.needleDeflection) < 0.5 ? '#10B981' : '#EF4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(galvoX, galvoY);
    ctx.lineTo(galvoX + Math.cos(needleAngle) * (galvoR - 8), galvoY + Math.sin(needleAngle) * (galvoR - 8));
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = '700 10px JetBrains Mono';
    ctx.fillText('GALVANOMETER', galvoX, galvoY + 16);

    // Primary & Secondary Driver Circuitry Labels
    ctx.font = '600 10px JetBrains Mono';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'left';
    ctx.fillText('DRIVER: Accumulator (2.0V) + Rheostat (Rh)', cx, cy + 10);

    if (this.mode === 'compare_emf') {
      ctx.fillText(`TEST: ${this.cells[this.selectedCellKey].name} (${this.cells[this.selectedCellKey].emf.toFixed(3)}V)`, cx, cy + 26);
    } else {
      ctx.fillText(`TEST: Cell (1.4V) + Shunt R (${this.shuntR}Ω) [${this.shuntKeyClosed ? 'Key CLOSED' : 'Key OPEN'}]`, cx, cy + 26);
    }

    ctx.restore();
  }

  drawRightPanel(gx, gy, gw, gh) {
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

    // Header
    ctx.fillStyle = '#0F172A';
    ctx.font = '700 13px Plus Jakarta Sans';
    ctx.textAlign = 'left';
    ctx.fillText('Potentiometer Analytical Ledger', gx + 16, gy + 26);

    const k = this.getPotentialGradient();
    const targetV = this.getTargetVoltage();
    const balanceL = targetV / k;

    // Calculation Box
    ctx.fillStyle = '#F0F7FF';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(gx + 16, gy + 45, gw - 32, 110, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 11px JetBrains Mono';
    ctx.fillStyle = '#0369A1';
    ctx.fillText('NULL BALANCE PREDICTION', gx + 26, gy + 68);

    ctx.font = '600 10px JetBrains Mono';
    ctx.fillStyle = '#0F172A';
    ctx.fillText(`Potential Grad k: ${(k * 1000).toFixed(2)} mV/cm`, gx + 26, gy + 88);
    ctx.fillText(`Target EMF / V:   ${targetV.toFixed(3)} V`, gx + 26, gy + 106);

    ctx.fillStyle = '#DB2777';
    ctx.font = '700 11px JetBrains Mono';
    ctx.fillText(`Null Length l:    ${balanceL.toFixed(1)} cm`, gx + 26, gy + 128);

    // Theory summary table
    const tableY = gy + 175;
    ctx.fillStyle = '#475569';
    ctx.font = '600 10px Plus Jakarta Sans';
    if (this.mode === 'compare_emf') {
      ctx.fillText('EMF Comparison Principle:', gx + 16, tableY);
      ctx.font = '10px JetBrains Mono';
      ctx.fillText('E₁ = k · l₁  (Leclanché)', gx + 16, tableY + 20);
      ctx.fillText('E₂ = k · l₂  (Daniell)', gx + 16, tableY + 38);
      ctx.fillText('E₁ / E₂ = l₁ / l₂', gx + 16, tableY + 56);
      ctx.fillStyle = '#10B981';
      ctx.font = '700 11px JetBrains Mono';
      ctx.fillText('No current drawn at null point!', gx + 16, tableY + 85);
    } else {
      ctx.fillText('Internal Resistance Principle:', gx + 16, tableY);
      ctx.font = '10px JetBrains Mono';
      ctx.fillText('Open Key K₂:   E = k · l₁', gx + 16, tableY + 20);
      ctx.fillText('Closed Key K₂: V = k · l₂', gx + 16, tableY + 38);
      ctx.fillText('r = R · (l₁ - l₂) / l₂', gx + 16, tableY + 56);
      ctx.fillStyle = '#10B981';
      ctx.font = '700 11px JetBrains Mono';
      ctx.fillText(`True internal r = ${this.internalR_true.toFixed(2)} Ω`, gx + 16, tableY + 85);
    }

    ctx.restore();
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.sim = new PotentiometerSimulation();
});

