/**
 * Agarose Gel Electrophoresis & DNA Fingerprinting Virtual Laboratory
 * Strict Zero-Dependency Vanilla Web Standard & Simulation Guidelines
 */

class GelElectrophoresisSimulation {
  constructor() {
    this.canvas = document.getElementById('simCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Electrophoresis Parameters
    this.voltage = 100; // Volts DC (60 to 150)
    this.agarosePercent = 1.0; // % gel density (0.7 to 2.0)
    this.isRunning = false;
    this.elapsedMinutes = 0.0; // simulated run time in minutes
    this.uvTransilluminator = false;
    this.soundEnabled = true;

    // Bubbles at electrodes
    this.bubbles = [];

    // Lane Definitions
    this.lanes = [
      {
        id: 'ladder',
        name: '1kb Ladder',
        bands: [
          { bp: 10000, intensity: 0.7 },
          { bp: 8000, intensity: 0.75 },
          { bp: 6000, intensity: 0.8 },
          { bp: 4000, intensity: 0.9 },
          { bp: 3000, intensity: 1.0 }, // reference landmark band
          { bp: 2000, intensity: 0.85 },
          { bp: 1500, intensity: 0.8 },
          { bp: 1000, intensity: 0.75 },
          { bp: 500, intensity: 0.7 }
        ]
      },
      {
        id: 'evidence',
        name: 'Evidence',
        bands: [
          { bp: 7500, intensity: 0.85 },
          { bp: 4200, intensity: 0.95 },
          { bp: 2800, intensity: 0.90 },
          { bp: 1200, intensity: 0.80 }
        ]
      },
      {
        id: 'suspect1',
        name: 'Suspect 1',
        bands: [
          { bp: 8500, intensity: 0.8 },
          { bp: 5000, intensity: 0.85 },
          { bp: 3100, intensity: 0.9 },
          { bp: 900, intensity: 0.75 }
        ]
      },
      {
        id: 'suspect2',
        name: 'Suspect 2',
        bands: [
          { bp: 7500, intensity: 0.85 },
          { bp: 4200, intensity: 0.95 },
          { bp: 2800, intensity: 0.90 },
          { bp: 1200, intensity: 0.80 }
        ]
      },
      {
        id: 'suspect3',
        name: 'Suspect 3',
        bands: [
          { bp: 6200, intensity: 0.85 },
          { bp: 4000, intensity: 0.9 },
          { bp: 2500, intensity: 0.85 },
          { bp: 1400, intensity: 0.8 }
        ]
      },
      {
        id: 'plasmid',
        name: 'EcoRI Dig',
        bands: [
          { bp: 4361, intensity: 0.95 },
          { bp: 1850, intensity: 0.85 }
        ]
      }
    ];

    // Tracking Dyes (visible in white light)
    this.trackingDyes = {
      xyleneCyanol: { bpEquiv: 4000, color: 'rgba(56, 189, 248, 0.7)' },
      bromophenolBlue: { bpEquiv: 350, color: 'rgba(30, 58, 138, 0.85)' }
    };

    // Hovered band detection
    this.hoveredBand = null;

    // Audio Context
    this.audioCtx = null;
    this.powerHumOsc = null;
    this.powerHumGain = null;

    this.initDOM();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.attachEvents();
    this.startLoop();
  }

  initDOM() {
    this.sliderVoltage = document.getElementById('sliderVoltage');
    this.sliderAgarose = document.getElementById('sliderAgarose');

    this.valVoltage = document.getElementById('valVoltage');
    this.valAgarose = document.getElementById('valAgarose');

    this.teleTime = document.getElementById('teleTime');
    this.teleDyeFront = document.getElementById('teleDyeFront');
    this.teleForensicMatch = document.getElementById('teleForensicMatch');
    this.telePowerState = document.getElementById('telePowerState');

    this.btnRun = document.getElementById('btnRun');
    this.toggleUV = document.getElementById('toggleUV');

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

      // DC hum
      this.powerHumOsc = this.audioCtx.createOscillator();
      this.powerHumGain = this.audioCtx.createGain();

      this.powerHumOsc.type = 'sawtooth';
      this.powerHumOsc.frequency.setValueAtTime(60, this.audioCtx.currentTime); // 60 Hz mains hum
      this.powerHumGain.gain.setValueAtTime(0, this.audioCtx.currentTime);

      this.powerHumOsc.connect(this.powerHumGain);
      this.powerHumGain.connect(this.audioCtx.destination);
      this.powerHumOsc.start();
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  updatePowerAudio(active) {
    if (!this.soundEnabled || !this.audioCtx || !this.powerHumGain) return;
    try {
      const target = active ? 0.025 : 0;
      this.powerHumGain.gain.setTargetAtTime(target, this.audioCtx.currentTime, 0.05);
    } catch (e) {}
  }

  playClickSound() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
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
    this.sliderVoltage.addEventListener('input', (e) => {
      this.initAudio();
      this.voltage = parseInt(e.target.value);
      this.valVoltage.textContent = `${this.voltage} V`;
      this.updateTelemetry();
    });

    this.sliderAgarose.addEventListener('input', (e) => {
      this.initAudio();
      this.agarosePercent = parseFloat(e.target.value);
      this.valAgarose.textContent = `${this.agarosePercent.toFixed(1)}%`;
      this.updateTelemetry();
    });

    this.btnRun.addEventListener('click', () => {
      this.initAudio();
      this.isRunning = !this.isRunning;
      this.btnRun.textContent = this.isRunning ? '⏸ Pause Run' : '⚡ Start Electrophoresis';
      this.btnRun.classList.toggle('running', this.isRunning);
      this.updatePowerAudio(this.isRunning);
      this.updateTelemetry();
    });

    this.toggleUV.addEventListener('change', (e) => {
      this.initAudio();
      this.uvTransilluminator = e.target.checked;
      this.playClickSound();
      this.updateTelemetry();
    });

    this.btnAudioToggle.addEventListener('click', () => {
      this.initAudio();
      this.soundEnabled = !this.soundEnabled;
      this.btnAudioToggle.textContent = this.soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
      if (!this.soundEnabled) this.updatePowerAudio(false);
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

    // Hover hit test on bands
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      this.checkBandHover(mx, my);
    });

    this.updateTelemetry();
  }

  resetAll() {
    this.isRunning = false;
    this.elapsedMinutes = 0.0;
    this.voltage = 100;
    this.agarosePercent = 1.0;
    this.uvTransilluminator = false;
    this.hoveredBand = null;
    this.bubbles = [];

    this.sliderVoltage.value = 100;
    this.sliderAgarose.value = 1.0;

    this.valVoltage.textContent = '100 V';
    this.valAgarose.textContent = '1.0%';

    this.btnRun.textContent = '⚡ Start Electrophoresis';
    this.btnRun.classList.remove('running');
    this.toggleUV.checked = false;

    this.updatePowerAudio(false);
    this.updateTelemetry();
    this.playClickSound();
  }

  // Calculate migration distance y (normalized 0 to 1 along gel length)
  calculateMigration(bp) {
    // Distance inversely proportional to log10(bp)
    // d = k * (V / 100) * (t / 60) * (1 / (log10(bp) * agarosePercent^0.5))
    const logBp = Math.log10(bp);
    const speed = (this.voltage / 100.0) * (1.0 / (Math.pow(this.agarosePercent, 0.7) * (logBp - 1.8)));
    // Total migrated fraction
    const frac = (this.elapsedMinutes / 60.0) * speed * 0.75;
    return Math.min(0.92, Math.max(0.02, frac));
  }

  updateTelemetry() {
    this.teleTime.textContent = `${this.elapsedMinutes.toFixed(1)} min`;

    // Blue dye front progress
    const dyeFrac = this.calculateMigration(350);
    this.teleDyeFront.textContent = `${(dyeFrac * 100).toFixed(0)}% of Gel`;

    // Forensic Match deduction
    if (this.elapsedMinutes >= 15.0) {
      this.teleForensicMatch.textContent = 'Suspect 2 Matches Evidence!';
      this.teleForensicMatch.style.color = '#10B981';
    } else {
      this.teleForensicMatch.textContent = 'Run gel ≥15m to resolve';
      this.teleForensicMatch.style.color = '#475569';
    }

    if (this.isRunning) {
      this.telePowerState.textContent = `${this.voltage}V DC (Active)`;
      this.telePowerState.style.color = '#10B981';
    } else {
      this.telePowerState.textContent = 'Standby (Paused)';
      this.telePowerState.style.color = '#475569';
    }
  }

  startLoop() {
    const render = (time) => {
      this.updatePhysics();
      this.draw();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  updatePhysics() {
    if (this.isRunning) {
      // 1 real second = 0.5 simulated minutes
      this.elapsedMinutes = Math.min(90.0, this.elapsedMinutes + (1 / 60) * 0.5);
      this.updateTelemetry();

      // Spawn Electrolysis Bubbles at Platinum Wire Electrodes
      if (Math.random() < 0.4) {
        // Top cathode (-) emits H2 bubbles
        this.bubbles.push({
          x: this.width * 0.12 + Math.random() * (this.width * 0.46),
          y: this.height * 0.16,
          vy: - (0.5 + Math.random() * 0.8),
          r: 1.5 + Math.random() * 1.5
        });
      }
      if (Math.random() < 0.25) {
        // Bottom anode (+) emits O2 bubbles
        this.bubbles.push({
          x: this.width * 0.12 + Math.random() * (this.width * 0.46),
          y: this.height * 0.82,
          vy: - (0.5 + Math.random() * 0.8),
          r: 1.5 + Math.random() * 1.5
        });
      }
    }

    // Update Bubbles
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.y += b.vy;
      if (b.y < this.height * 0.10) {
        this.bubbles.splice(i, 1);
      }
    }
  }

  checkBandHover(mx, my) {
    const gelX = this.width * 0.12;
    const gelY = this.height * 0.16;
    const gelW = this.width * 0.46;
    const gelH = this.height * 0.68;

    const laneW = gelW / this.lanes.length;
    const wellY = gelY + 30;
    const maxMigrateH = gelH - 45;

    this.hoveredBand = null;

    if (mx >= gelX && mx <= gelX + gelW && my >= gelY && my <= gelY + gelH) {
      const laneIdx = Math.floor((mx - gelX) / laneW);
      if (laneIdx >= 0 && laneIdx < this.lanes.length) {
        const lane = this.lanes[laneIdx];
        for (const band of lane.bands) {
          const by = wellY + this.calculateMigration(band.bp) * maxMigrateH;
          if (Math.abs(my - by) < 6) {
            this.hoveredBand = {
              laneName: lane.name,
              bp: band.bp,
              y: by,
              x: mx
            };
            break;
          }
        }
      }
    }
  }

  draw() {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    // Grid
    this.drawBackgroundGrid();

    // Chamber Dimensions
    const chamberX = width * 0.08;
    const chamberY = height * 0.10;
    const chamberW = width * 0.54;
    const chamberH = height * 0.80;

    // 1. Draw Electrophoresis Chamber & Buffer Bed
    this.drawElectrophoresisTank(chamberX, chamberY, chamberW, chamberH);

    // 2. Draw Agarose Gel Slab & Wells
    this.drawAgaroseGel(chamberX, chamberY, chamberW, chamberH);

    // 3. Draw Migrating DNA Bands & Dyes
    this.drawDNABands(chamberX, chamberY, chamberW, chamberH);

    // 4. Draw Platinum Electrodes & Bubbles
    this.drawElectrodes(chamberX, chamberY, chamberW, chamberH);

    // 5. Draw Semi-Log Size Calibration Graph (Right 34%)
    const graphX = width * 0.64;
    const graphY = height * 0.10;
    const graphW = width * 0.33;
    const graphH = height * 0.80;

    this.drawSemiLogGraph(graphX, graphY, graphW, graphH);

    // 6. Draw Hover Reticle Tooltip
    if (this.hoveredBand) {
      this.drawBandTooltip();
    }
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

  drawElectrophoresisTank(cx, cy, cw, ch) {
    const { ctx } = this;
    ctx.save();

    // Outer acrylic tank body
    ctx.fillStyle = this.uvTransilluminator ? '#090D16' : '#FFFFFF';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(cx, cy, cw, ch, 14);
    ctx.fill();
    ctx.stroke();

    // 1x TAE Buffer liquid reservoir
    const bufferY = cy + 18;
    const bufferH = ch - 36;
    ctx.fillStyle = this.uvTransilluminator ? 'rgba(15, 23, 42, 0.95)' : 'rgba(224, 242, 254, 0.45)';
    ctx.fillRect(cx + 8, bufferY, cw - 16, bufferH);

    // Tank labels: Cathode (-) at top, Anode (+) at bottom
    ctx.font = '700 11px JetBrains Mono';
    ctx.fillStyle = '#EF4444';
    ctx.textAlign = 'left';
    ctx.fillText('CATHODE (-) [BLACK]', cx + 16, cy + 16);

    ctx.fillStyle = '#10B981';
    ctx.fillText('ANODE (+) [RED]', cx + 16, cy + ch - 8);

    ctx.restore();
  }

  drawAgaroseGel(cx, cy, cw, ch) {
    const { ctx } = this;
    ctx.save();

    const gelX = cx + cw * 0.10;
    const gelY = cy + ch * 0.08;
    const gelW = cw * 0.80;
    const gelH = ch * 0.84;

    // Gel bed appearance
    if (this.uvTransilluminator) {
      // Glowing deep purple/black UV backdrop
      ctx.fillStyle = '#1E1B4B';
      ctx.strokeStyle = '#4338CA';
    } else {
      // Translucent opalescent gel slab
      ctx.fillStyle = 'rgba(248, 250, 252, 0.85)';
      ctx.strokeStyle = '#CBD5E1';
    }
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(gelX, gelY, gelW, gelH, 8);
    ctx.fill();
    ctx.stroke();

    // Loading Wells
    const laneW = gelW / this.lanes.length;
    const wellW = laneW * 0.65;
    const wellH = 12;
    const wellY = gelY + 24;

    for (let i = 0; i < this.lanes.length; i++) {
      const wx = gelX + i * laneW + (laneW - wellW) * 0.5;

      // Well indents
      ctx.fillStyle = this.uvTransilluminator ? '#0F172A' : '#E2E8F0';
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(wx, wellY, wellW, wellH, 2);
      ctx.fill();
      ctx.stroke();

      // Lane header labels
      ctx.font = '700 9px JetBrains Mono';
      ctx.fillStyle = this.uvTransilluminator ? '#C7D2FE' : '#475569';
      ctx.textAlign = 'center';
      ctx.fillText(this.lanes[i].name, wx + wellW * 0.5, wellY - 6);
    }

    ctx.restore();
  }

  drawDNABands(cx, cy, cw, ch) {
    const { ctx } = this;
    ctx.save();

    const gelX = cx + cw * 0.10;
    const gelY = cy + ch * 0.08;
    const gelW = cw * 0.80;
    const gelH = ch * 0.84;

    const laneW = gelW / this.lanes.length;
    const wellW = laneW * 0.65;
    const wellY = gelY + 24;
    const maxMigrateH = gelH - 45;

    // 1. If visible light, draw tracking dyes (Bromophenol Blue & Xylene Cyanol)
    if (!this.uvTransilluminator) {
      // Bromophenol Blue (faster dye)
      const bpBlueFrac = this.calculateMigration(this.trackingDyes.bromophenolBlue.bpEquiv);
      const bpBlueY = wellY + bpBlueFrac * maxMigrateH;

      ctx.fillStyle = this.trackingDyes.bromophenolBlue.color;
      for (let i = 0; i < this.lanes.length; i++) {
        const wx = gelX + i * laneW + (laneW - wellW) * 0.5;
        ctx.beginPath();
        ctx.roundRect(wx, bpBlueY, wellW, 5, 2);
        ctx.fill();
      }

      // Xylene Cyanol (slower dye)
      const xcFrac = this.calculateMigration(this.trackingDyes.xyleneCyanol.bpEquiv);
      const xcY = wellY + xcFrac * maxMigrateH;

      ctx.fillStyle = this.trackingDyes.xyleneCyanol.color;
      for (let i = 0; i < this.lanes.length; i++) {
        const wx = gelX + i * laneW + (laneW - wellW) * 0.5;
        ctx.beginPath();
        ctx.roundRect(wx, xcY, wellW, 4, 2);
        ctx.fill();
      }
    } else {
      // 2. Under UV Light: Intercalated GelGreen / Ethidium Bromide DNA Bands Glow!
      ctx.shadowColor = '#34D399';
      ctx.shadowBlur = 8;

      for (let i = 0; i < this.lanes.length; i++) {
        const lane = this.lanes[i];
        const wx = gelX + i * laneW + (laneW - wellW) * 0.5;

        for (const band of lane.bands) {
          const frac = this.calculateMigration(band.bp);
          const by = wellY + frac * maxMigrateH;

          // Band thickness scales with fragment size; intensity scales with mass
          const bH = Math.max(3, Math.min(6, 6 - (frac * 3)));
          ctx.fillStyle = `rgba(52, 211, 153, ${band.intensity.toFixed(2)})`;

          ctx.beginPath();
          ctx.roundRect(wx, by, wellW, bH, 2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  drawElectrodes(cx, cy, cw, ch) {
    const { ctx } = this;
    ctx.save();

    // Platinum Wire Cathode (-) at Top
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + 25, cy + 24);
    ctx.lineTo(cx + cw - 25, cy + 24);
    ctx.stroke();

    // Platinum Wire Anode (+) at Bottom
    ctx.beginPath();
    ctx.moveTo(cx + 25, cy + ch - 24);
    ctx.lineTo(cx + cw - 25, cy + ch - 24);
    ctx.stroke();

    // Gas Bubbles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.lineWidth = 1;
    for (const b of this.bubbles) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  drawSemiLogGraph(gx, gy, gw, gh) {
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
    ctx.font = '700 12px Plus Jakarta Sans';
    ctx.textAlign = 'left';
    ctx.fillText('Semi-Log DNA Size Calibration Curve', gx + 16, gy + 24);

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
    ctx.fillText('Migration Distance d (mm)', xOrigin + plotW * 0.5, yOrigin + 22);

    ctx.save();
    ctx.translate(xOrigin - 30, yOrigin - plotH * 0.5);
    ctx.rotate(-Math.PI * 0.5);
    ctx.fillText('log₁₀(Base Pairs)', 0, 0);
    ctx.restore();

    // Log bp from 2.5 (300 bp) to 4.2 (16,000 bp)
    const minLog = 2.5;
    const maxLog = 4.2;

    const toX = (frac) => xOrigin + frac * plotW;
    const toY = (logVal) => yOrigin - ((logVal - minLog) / (maxLog - minLog)) * plotH;

    // Plot ladder reference curve
    const ladderL = this.lanes[0];
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < ladderL.bands.length; i++) {
      const b = ladderL.bands[i];
      const frac = this.calculateMigration(b.bp);
      const px = toX(frac);
      const py = toY(Math.log10(b.bp));

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Plot ladder points
    for (const b of ladderL.bands) {
      const frac = this.calculateMigration(b.bp);
      const px = toX(frac);
      const py = toY(Math.log10(b.bp));

      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Callout Box
    ctx.fillStyle = '#F0F7FF';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(gx + 40, gy + 40, 150, 42, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 9px JetBrains Mono';
    ctx.fillStyle = '#0369A1';
    ctx.textAlign = 'left';
    ctx.fillText('d ∝ 1 / log₁₀(bp)', gx + 48, gy + 55);
    ctx.font = '600 8.5px JetBrains Mono';
    ctx.fillText('Smaller fragments migrate faster', gx + 48, gy + 70);

    ctx.restore();
  }

  drawBandTooltip() {
    const { ctx } = this;
    const { laneName, bp, x, y } = this.hoveredBand;

    ctx.save();
    const boxW = 120;
    const boxH = 40;
    const boxX = Math.min(this.width - boxW - 20, x + 12);
    const boxY = y - boxH * 0.5;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 10px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText(`${laneName}`, boxX + 8, boxY + 16);

    ctx.fillStyle = '#34D399';
    ctx.font = '600 10px JetBrains Mono';
    ctx.fillText(`Size: ${bp.toLocaleString()} bp`, boxX + 8, boxY + 31);

    ctx.restore();
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.sim = new GelElectrophoresisSimulation();
});
