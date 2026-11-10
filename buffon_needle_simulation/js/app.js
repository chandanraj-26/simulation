/**
 * Buffon's Needle & Monte Carlo Pi Generator Virtual Lab
 * Applied Mathematics & Geometric Probability
 * High-fidelity virtual laboratory featuring realistic oak parquet floorboards,
 * 3D polished steel needles, animated drop physics, crossing beacons,
 * and dynamic statistical confidence band convergence graphing.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.lastDropSound = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playMetallicDrop() {
    if (!this.enabled) return;
    const now = Date.now();
    if (now - this.lastDropSound < 45) return;
    this.lastDropSound = now;

    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // High pitched metallic ping of needle landing
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2200 + Math.random() * 800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.035);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.035);
  }

  playChime() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, this.ctx.currentTime); // C6
    osc.frequency.exponentialRampToValueAtTime(1567.98, this.ctx.currentTime + 0.2); // G6

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }
}

class BuffonNeedleSimulation {
  constructor() {
    this.canvas = document.getElementById('simCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundEngine();

    // Geometry parameters
    this.lineSpacingD = 65; // px (width of wood plank)
    this.needleLengthL = 45; // px (length of needle, L <= D)
    this.isStreaming = false;
    this.streamRate = 6; // needles per frame

    // Monte Carlo counters
    this.totalNeedles = 0;
    this.crossingNeedles = 0;
    this.history = []; // [{ N, piEst, lowerBound, upperBound }]
    this.renderedNeedles = []; // array of needle objects on floor (max 450)
    this.fallingNeedles = []; // needles currently animating their drop

    // Interactive pointer
    this.isInteracting = false;
    this.hoverPos = null;

    // Viewport
    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    this.initDOM();
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initDOM() {
    this.sliderSpacing = document.getElementById('sliderSpacing');
    this.valSpacing = document.getElementById('valSpacing');
    this.sliderLength = document.getElementById('sliderLength');
    this.valLength = document.getElementById('valLength');

    this.btnDrop1 = document.getElementById('btnDrop1');
    this.btnDrop10 = document.getElementById('btnDrop10');
    this.btnDrop100 = document.getElementById('btnDrop100');
    this.btnDrop1000 = document.getElementById('btnDrop1000');
    this.btnStream = document.getElementById('btnStream');
    this.btnClear = document.getElementById('btnClear');
    this.btnExport = document.getElementById('btnExport');
    this.btnResetAll = document.getElementById('btnResetAll');
    this.btnSound = document.getElementById('btnSound');

    // Telemetry readouts
    this.readoutTotal = document.getElementById('readoutTotal');
    this.readoutCrossings = document.getElementById('readoutCrossings');
    this.readoutProb = document.getElementById('readoutProb');
    this.readoutPi = document.getElementById('readoutPi');
    this.readoutError = document.getElementById('readoutError');
    this.readoutAccuracy = document.getElementById('readoutAccuracy');

    // Modals
    this.btnTheory = document.getElementById('btnTheory');
    this.modalTheory = document.getElementById('modalTheory');
    this.btnCloseTheory = document.getElementById('btnCloseTheory');

    if (this.sliderSpacing) {
      this.sliderSpacing.addEventListener('input', (e) => {
        this.lineSpacingD = parseInt(e.target.value);
        if (this.valSpacing) this.valSpacing.textContent = `${this.lineSpacingD} px`;
        if (this.needleLengthL > this.lineSpacingD) {
          this.needleLengthL = this.lineSpacingD;
          if (this.sliderLength) this.sliderLength.value = this.needleLengthL;
          if (this.valLength) this.valLength.textContent = `${this.needleLengthL} px`;
        }
        if (this.sliderLength) this.sliderLength.max = this.lineSpacingD;
      });
    }

    if (this.sliderLength) {
      this.sliderLength.addEventListener('input', (e) => {
        this.needleLengthL = parseInt(e.target.value);
        if (this.valLength) this.valLength.textContent = `${this.needleLengthL} px`;
      });
    }

    if (this.btnDrop1) this.btnDrop1.addEventListener('click', () => this.dropBatch(1, true));
    if (this.btnDrop10) this.btnDrop10.addEventListener('click', () => this.dropBatch(10, true));
    if (this.btnDrop100) this.btnDrop100.addEventListener('click', () => this.dropBatch(100, false));
    if (this.btnDrop1000) this.btnDrop1000.addEventListener('click', () => this.dropBatch(1000, false));

    if (this.btnStream) {
      this.btnStream.addEventListener('click', () => {
        this.isStreaming = !this.isStreaming;
        this.btnStream.textContent = this.isStreaming ? '⏸ Pause Stream' : '▶ Continuous Stream';
        this.btnStream.classList.toggle('active', this.isStreaming);
      });
    }

    if (this.btnClear) {
      this.btnClear.addEventListener('click', () => this.clearBoard());
    }

    if (this.btnExport) {
      this.btnExport.addEventListener('click', () => this.exportCSV());
    }

    if (this.btnResetAll) {
      this.btnResetAll.addEventListener('click', () => this.resetAll());
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

    // Interactive canvas click to drop a needle at mouse position
    this.canvas.addEventListener('pointerdown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const boardW = this.width * 0.54;
      const boardX = 24;
      const boardY = this.height * 0.08;
      const boardH = this.height * 0.84;

      if (x >= boardX && x <= boardX + boardW && y >= boardY && y <= boardY + boardH) {
        this.dropSingleAt(x, y);
      }
    });
  }

  clearBoard() {
    this.totalNeedles = 0;
    this.crossingNeedles = 0;
    this.history = [];
    this.renderedNeedles = [];
    this.fallingNeedles = [];
    this.updateTelemetry();
  }

  resetAll() {
    this.clearBoard();
    this.lineSpacingD = 65;
    this.needleLengthL = 45;
    if (this.sliderSpacing) this.sliderSpacing.value = 65;
    if (this.valSpacing) this.valSpacing.textContent = '65 px';
    if (this.sliderLength) this.sliderLength.value = 45;
    if (this.valLength) this.valLength.textContent = '45 px';
    this.isStreaming = false;
    if (this.btnStream) {
      this.btnStream.textContent = '▶ Continuous Stream';
      this.btnStream.classList.remove('active');
    }
  }

  dropSingleAt(cx, cy) {
    const theta = Math.random() * Math.PI;
    const boardX = 24;
    const relX = cx - boardX;
    const distToLine = relX % this.lineSpacingD;
    const dMin = Math.min(distToLine, this.lineSpacingD - distToLine);
    const halfProjected = (this.needleLengthL / 2) * Math.sin(theta);
    const crosses = dMin <= halfProjected;

    this.totalNeedles++;
    if (crosses) this.crossingNeedles++;

    const halfLen = this.needleLengthL / 2;
    const needle = {
      cx, cy, theta, crosses,
      x1: cx - halfLen * Math.cos(theta),
      y1: cy - halfLen * Math.sin(theta),
      x2: cx + halfLen * Math.cos(theta),
      y2: cy + halfLen * Math.sin(theta),
      dropAltitude: 1.0 // 1.0 down to 0
    };

    this.fallingNeedles.push(needle);
    this.sound.playMetallicDrop();
    this.recordHistoryPoint();
    this.updateTelemetry();
  }

  dropBatch(count, animateFirstFew = false) {
    const boardW = this.width * 0.54;
    const boardH = this.height * 0.84;
    const boardX = 24;
    const boardY = this.height * 0.08;

    const margin = this.needleLengthL / 2 + 4;
    const minX = boardX + margin;
    const maxX = boardX + boardW - margin;
    const minY = boardY + margin;
    const maxY = boardY + boardH - margin;

    for (let i = 0; i < count; i++) {
      const cx = minX + Math.random() * (maxX - minX);
      const cy = minY + Math.random() * (maxY - minY);
      const theta = Math.random() * Math.PI;

      const relX = cx - boardX;
      const distToLine = relX % this.lineSpacingD;
      const dMin = Math.min(distToLine, this.lineSpacingD - distToLine);
      const halfProjected = (this.needleLengthL / 2) * Math.sin(theta);
      const crosses = dMin <= halfProjected;

      this.totalNeedles++;
      if (crosses) this.crossingNeedles++;

      const halfLen = this.needleLengthL / 2;
      const needleObj = {
        cx, cy, theta, crosses,
        x1: cx - halfLen * Math.cos(theta),
        y1: cy - halfLen * Math.sin(theta),
        x2: cx + halfLen * Math.cos(theta),
        y2: cy + halfLen * Math.sin(theta)
      };

      if (animateFirstFew && i < 8) {
        needleObj.dropAltitude = 1.0;
        this.fallingNeedles.push(needleObj);
      } else {
        this.renderedNeedles.push(needleObj);
        if (this.renderedNeedles.length > 400) {
          this.renderedNeedles.shift();
        }
      }
    }

    this.recordHistoryPoint();
    this.sound.playMetallicDrop();
    this.updateTelemetry();
  }

  recordHistoryPoint() {
    if (this.crossingNeedles > 0) {
      const p = this.crossingNeedles / this.totalNeedles;
      const piEst = (2 * this.needleLengthL) / (this.lineSpacingD * p);

      // 95% Confidence Interval error bounds (SE = sqrt(p*(1-p)/N))
      const se = Math.sqrt((p * (1 - p)) / this.totalNeedles);
      const pLower = Math.max(0.001, p - 1.96 * se);
      const pUpper = p + 1.96 * se;
      const piUpper = (2 * this.needleLengthL) / (this.lineSpacingD * pLower);
      const piLower = (2 * this.needleLengthL) / (this.lineSpacingD * pUpper);

      this.history.push({
        N: this.totalNeedles,
        piEst,
        piLower: Math.max(1.8, piLower),
        piUpper: Math.min(4.8, piUpper)
      });

      if (this.history.length > 250) this.history.shift();
    }
  }

  exportCSV() {
    if (this.totalNeedles === 0) return;
    let csv = "Total_Needles_N,Crossings_C,Experimental_Prob_P,Estimated_Pi,Exact_Pi,Absolute_Error\n";
    const p = this.crossingNeedles / this.totalNeedles;
    const piEst = p > 0 ? (2 * this.needleLengthL) / (this.lineSpacingD * p) : 0;
    const err = Math.abs(piEst - Math.PI);
    csv += `${this.totalNeedles},${this.crossingNeedles},${p.toFixed(5)},${piEst.toFixed(5)},${Math.PI.toFixed(5)},${err.toFixed(5)}\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buffon_pi_monte_carlo_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

  animate() {
    if (this.isStreaming) {
      this.dropBatch(this.streamRate, false);
    }

    // Progress falling needles
    for (let i = this.fallingNeedles.length - 1; i >= 0; i--) {
      const fn = this.fallingNeedles[i];
      fn.dropAltitude -= 0.12;
      if (fn.dropAltitude <= 0) {
        fn.dropAltitude = 0;
        this.renderedNeedles.push(fn);
        if (this.renderedNeedles.length > 400) {
          this.renderedNeedles.shift();
        }
        this.fallingNeedles.splice(i, 1);
      }
    }

    this.render();
    requestAnimationFrame(this.animate);
  }

  updateTelemetry() {
    if (this.readoutTotal) this.readoutTotal.textContent = this.totalNeedles.toLocaleString();
    if (this.readoutCrossings) this.readoutCrossings.textContent = this.crossingNeedles.toLocaleString();

    if (this.totalNeedles === 0 || this.crossingNeedles === 0) {
      if (this.readoutPi) this.readoutPi.textContent = '---';
      if (this.readoutError) this.readoutError.textContent = '0.0000';
      if (this.readoutProb) this.readoutProb.textContent = '0.0000';
      if (this.readoutAccuracy) this.readoutAccuracy.textContent = '0.0%';
      return;
    }

    const p = this.crossingNeedles / this.totalNeedles;
    const piEst = (2 * this.needleLengthL) / (this.lineSpacingD * p);
    const absErr = Math.abs(piEst - Math.PI);
    const accuracy = Math.max(0, 100 * (1 - absErr / Math.PI));

    if (this.readoutPi) this.readoutPi.textContent = piEst.toFixed(4);
    if (this.readoutError) this.readoutError.textContent = absErr.toFixed(4);
    if (this.readoutProb) this.readoutProb.textContent = p.toFixed(4);
    if (this.readoutAccuracy) this.readoutAccuracy.textContent = `${accuracy.toFixed(1)}%`;

    if (accuracy > 99.85 && this.totalNeedles >= 200 && this.totalNeedles % 200 === 0) {
      this.sound.playChime();
    }
  }

  render() {
    if (!this.ctx || this.width === 0) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Grid
    this.drawRoomGrid(ctx);

    // 2. Realistic Oak Parquet Wood Floorboard Arena
    this.drawHardwoodFloor(ctx);

    // 3. Resting Needles & Falling Needles
    this.drawNeedles(ctx);

    // 4. Live Pi Convergence Graph with Confidence Interval Envelopes
    this.drawConvergenceGraph(ctx);
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

  drawHardwoodFloor(ctx) {
    const boardW = this.width * 0.54;
    const boardH = this.height * 0.84;
    const boardX = 24;
    const boardY = this.height * 0.08;

    ctx.save();

    // Floorboard boundary shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
    ctx.beginPath();
    ctx.roundRect(boardX + 2, boardY + 3, boardW, boardH, 10);
    ctx.fill();

    // Clip to floor area
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(boardX, boardY, boardW, boardH, 10);
    ctx.clip();

    // Parquet Oak Planks: draw alternating textured wood planks
    const plankTones = ['#FBF4EA', '#F5ECE0', '#EFE3D3', '#EAE0D0'];
    let plankIndex = 0;

    for (let x = boardX; x < boardX + boardW; x += this.lineSpacingD) {
      const pW = Math.min(this.lineSpacingD, boardX + boardW - x);

      // Plank background gradient
      const plankGrad = ctx.createLinearGradient(x, 0, x + pW, 0);
      const tone = plankTones[plankIndex % plankTones.length];
      plankGrad.addColorStop(0, tone);
      plankGrad.addColorStop(0.5, '#FFFFFF');
      plankGrad.addColorStop(1, tone);
      ctx.fillStyle = plankGrad;
      ctx.fillRect(x, boardY, pW, boardH);

      // Fine wood grain striations
      ctx.strokeStyle = 'rgba(180, 83, 9, 0.04)';
      ctx.lineWidth = 1;
      for (let gy = boardY + 12; gy < boardY + boardH; gy += 18) {
        ctx.beginPath();
        ctx.moveTo(x, gy + (plankIndex % 2 === 0 ? 3 : -3));
        ctx.bezierCurveTo(x + pW * 0.3, gy + 5, x + pW * 0.7, gy - 4, x + pW, gy);
        ctx.stroke();
      }

      // Fastening brass nail rivets near top and bottom
      ctx.fillStyle = '#D97706';
      ctx.beginPath();
      ctx.arc(x + pW / 2, boardY + 12, 1.8, 0, Math.PI * 2);
      ctx.arc(x + pW / 2, boardY + boardH - 12, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Recessed groove seam line between planks (the Buffon grid line!)
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(x, boardY);
      ctx.lineTo(x, boardY + boardH);
      ctx.stroke();

      // Inset dark shadow line right next to seam
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.2)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x + 2, boardY);
      ctx.lineTo(x + 2, boardY + boardH);
      ctx.stroke();

      plankIndex++;
    }

    ctx.restore(); // Restore clip

    // Outer border frame
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(boardX, boardY, boardW, boardH, 10);
    ctx.stroke();

    // Top Dimension Bar showing Plank Width D
    ctx.strokeStyle = '#0369A1';
    ctx.lineWidth = 1.5;
    const dimY = boardY - 14;
    const dimX1 = boardX;
    const dimX2 = boardX + this.lineSpacingD;

    ctx.beginPath();
    ctx.moveTo(dimX1, dimY);
    ctx.lineTo(dimX2, dimY);
    // End ticks
    ctx.moveTo(dimX1, dimY - 4);
    ctx.lineTo(dimX1, dimY + 4);
    ctx.moveTo(dimX2, dimY - 4);
    ctx.lineTo(dimX2, dimY + 4);
    ctx.stroke();

    // Dimension Pill
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0284C7';
    ctx.textAlign = 'left';
    ctx.fillText(`Plank Width (D) = ${this.lineSpacingD}px  |  Needle Length (L) = ${this.needleLengthL}px`, dimX2 + 14, dimY + 3.5);

    ctx.restore();
  }

  drawNeedles(ctx) {
    ctx.save();

    // Render all settled needles on floor
    // Pass 1: Drop shadows
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.16)';
    ctx.lineWidth = 2.2;
    for (let n of this.renderedNeedles) {
      ctx.beginPath();
      ctx.moveTo(n.x1 + 1.8, n.y1 + 2.2);
      ctx.lineTo(n.x2 + 1.8, n.y2 + 2.2);
      ctx.stroke();
    }

    // Pass 2: Steel Needle bodies
    for (let n of this.renderedNeedles) {
      if (n.crosses) {
        // Crossing needle: Glowing Amber/Gold aura
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.lineWidth = 5.0;
        ctx.beginPath();
        ctx.moveTo(n.x1, n.y1);
        ctx.lineTo(n.x2, n.y2);
        ctx.stroke();

        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2.4;
      } else {
        // Non-crossing needle: Stainless Steel metallic line
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 1.8;
      }

      ctx.beginPath();
      ctx.moveTo(n.x1, n.y1);
      ctx.lineTo(n.x2, n.y2);
      ctx.stroke();

      // Sharp pointed tip at end 1
      ctx.fillStyle = n.crosses ? '#D97706' : '#0369A1';
      ctx.beginPath();
      ctx.arc(n.x1, n.y1, 2.0, 0, Math.PI * 2);
      ctx.fill();

      // Eyelet oval bead at end 2
      ctx.beginPath();
      ctx.arc(n.x2, n.y2, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render currently falling needles with drop altitude scaling & closing shadow
    for (let fn of this.fallingNeedles) {
      const alt = fn.dropAltitude; // 1.0 down to 0
      const shadowDist = alt * 18;

      // Ground shadow
      ctx.strokeStyle = `rgba(15, 23, 42, ${0.25 * (1 - alt)})`;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(fn.x1 + shadowDist, fn.y1 + shadowDist);
      ctx.lineTo(fn.x2 + shadowDist, fn.y2 + shadowDist);
      ctx.stroke();

      // Needle in flight (scaled up slightly for 3D depth)
      ctx.strokeStyle = fn.crosses ? '#F59E0B' : '#38BDF8';
      ctx.lineWidth = 3.0 + alt * 2.0;
      ctx.beginPath();
      ctx.moveTo(fn.x1, fn.y1 - alt * 24);
      ctx.lineTo(fn.x2, fn.y2 - alt * 24);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawConvergenceGraph(ctx) {
    const gx = this.width * 0.60;
    const gy = this.height * 0.08;
    const gw = this.width * 0.36;
    const gh = this.height * 0.84;

    ctx.save();

    // Background Container
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(gx, gy, gw, gh, 12);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Title
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'left';
    ctx.fillText('π MONTE CARLO CONVERGENCE & 95% CI', gx + 16, gy + 22);

    // Plotting area
    const plotX = gx + 42;
    const plotY = gy + 40;
    const plotW = gw - 56;
    const plotH = gh - 65;

    const piMin = 2.0;
    const piMax = 4.4;

    // Y-Axis Horizontal Grid Lines
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    ctx.font = '500 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.textAlign = 'right';

    for (let pVal = 2.0; pVal <= 4.4; pVal += 0.5) {
      const y = plotY + plotH - ((pVal - piMin) / (piMax - piMin)) * plotH;
      ctx.beginPath();
      ctx.moveTo(plotX, y);
      ctx.lineTo(plotX + plotW, y);
      ctx.stroke();
      ctx.fillText(pVal.toFixed(1), plotX - 6, y + 3);
    }

    // Exact Mathematical Constant π = 3.14159... Red Reference Line
    const truePiY = plotY + plotH - ((Math.PI - piMin) / (piMax - piMin)) * plotH;

    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(plotX, truePiY);
    ctx.lineTo(plotX + plotW, truePiY);
    ctx.stroke();
    ctx.setLineDash([]);

    // π reference label
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#DC2626';
    ctx.textAlign = 'left';
    ctx.fillText('π = 3.14159...', plotX + 8, truePiY - 5);

    // Plot Monte Carlo Data
    if (this.history.length > 1) {
      const firstN = this.history[0].N;
      const lastN = Math.max(firstN + 50, this.history[this.history.length - 1].N);

      // 1. Shaded 95% Confidence Interval Band (narrows over time)
      ctx.fillStyle = 'rgba(2, 132, 199, 0.08)';
      ctx.beginPath();
      for (let i = 0; i < this.history.length; i++) {
        const h = this.history[i];
        const x = plotX + ((h.N - firstN) / (lastN - firstN)) * plotW;
        const yTop = plotY + plotH - ((h.piUpper - piMin) / (piMax - piMin)) * plotH;
        if (i === 0) ctx.moveTo(x, yTop);
        else ctx.lineTo(x, yTop);
      }
      for (let i = this.history.length - 1; i >= 0; i--) {
        const h = this.history[i];
        const x = plotX + ((h.N - firstN) / (lastN - firstN)) * plotW;
        const yBot = plotY + plotH - ((h.piLower - piMin) / (piMax - piMin)) * plotH;
        ctx.lineTo(x, yBot);
      }
      ctx.closePath();
      ctx.fill();

      // 2. Calculated Pi curve
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let i = 0; i < this.history.length; i++) {
        const h = this.history[i];
        const x = plotX + ((h.N - firstN) / (lastN - firstN)) * plotW;
        const y = plotY + plotH - ((h.piEst - piMin) / (piMax - piMin)) * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Pulsating tip marker
      const latest = this.history[this.history.length - 1];
      const curX = plotX + ((latest.N - firstN) / (lastN - firstN)) * plotW;
      const curY = plotY + plotH - ((latest.piEst - piMin) / (piMax - piMin)) * plotH;

      ctx.fillStyle = '#0284C7';
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

// Instantiate simulation when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.sim = new BuffonNeedleSimulation();
});
