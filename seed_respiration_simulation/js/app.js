/**
 * Respiration in Germinating Seeds Virtual Lab
 * NCERT Class 10 Biology (Life Processes - Respiration Practical)
 * High-fidelity biological laboratory simulation with realistic glassware,
 * retort stand, organic sprouting seeds, chemical KOH absorption, and capillary rise.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.lastTickTime = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playSuction(pitch = 300) {
    if (!this.enabled) return;
    const now = Date.now();
    if (now - this.lastTickTime < 180) return;
    this.lastTickTime = now;

    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  playGurgle() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320 - i * 40, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.06);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.06);
      }, i * 50);
    }
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.02);
  }
}

class SeedRespirationSimulation {
  constructor() {
    this.canvas = document.getElementById('simCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundEngine();

    // Physiological state
    this.seedType = 'germinating'; // 'germinating', 'boiled', 'dormant'
    this.temperature = 28; // °C
    this.isAirtight = true;
    this.timeScale = 60; // 1s real = 60s (1 min) sim time

    // Measurements
    this.elapsedSimSeconds = 0;
    this.waterRiseMm = 0; // 0 to 80 mm
    this.targetWaterRiseMm = 0;
    this.co2AbsorbedMg = 0;
    this.o2ConsumedUList = 0;

    // Biological particle system (CO2 micro-molecules drifting to KOH tube)
    this.particles = [];
    this.initParticles();

    // Procedural seeds generation (realistic organic seed pile)
    this.seeds = [];
    this.initSeeds();

    // Geometry & HiDPI
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
    this.selectSeeds = document.getElementById('selectSeeds');
    this.sliderTemp = document.getElementById('sliderTemp');
    this.valTemp = document.getElementById('valTemp');
    this.chkAirtight = document.getElementById('chkAirtight');
    this.selectSpeed = document.getElementById('selectSpeed');
    this.btnResetExp = document.getElementById('btnResetExp');
    this.btnResetAll = document.getElementById('btnResetAll');
    this.btnSound = document.getElementById('btnSound');

    // Telemetry
    this.readoutTime = document.getElementById('readoutTime');
    this.readoutHeight = document.getElementById('readoutHeight');
    this.readoutRate = document.getElementById('readoutRate');
    this.readoutCO2 = document.getElementById('readoutCO2');

    // Modals
    this.btnTheory = document.getElementById('btnTheory');
    this.modalTheory = document.getElementById('modalTheory');
    this.btnCloseTheory = document.getElementById('btnCloseTheory');

    if (this.selectSeeds) {
      this.selectSeeds.addEventListener('change', (e) => {
        this.seedType = e.target.value;
        this.sound.playClick();
        this.initSeeds();
      });
    }

    if (this.sliderTemp) {
      this.sliderTemp.addEventListener('input', (e) => {
        this.temperature = parseFloat(e.target.value);
        if (this.valTemp) this.valTemp.textContent = `${this.temperature.toFixed(0)}°C`;
      });
    }

    if (this.chkAirtight) {
      this.chkAirtight.addEventListener('change', (e) => {
        this.isAirtight = e.target.checked;
        if (!this.isAirtight) {
          this.sound.playGurgle();
        } else {
          this.sound.playClick();
        }
      });
    }

    if (this.selectSpeed) {
      this.selectSpeed.addEventListener('change', (e) => {
        this.timeScale = parseFloat(e.target.value);
        this.sound.playClick();
      });
    }

    if (this.btnResetExp) {
      this.btnResetExp.addEventListener('click', () => {
        this.resetExperiment();
        this.sound.playClick();
      });
    }

    if (this.btnResetAll) {
      this.btnResetAll.addEventListener('click', () => {
        this.resetAll();
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
  }

  initSeeds() {
    this.seeds = [];
    const count = 38;
    // Generate organic cluster of seeds resting on cotton base
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const col = (i % 10) - 4.5;
      const row = Math.floor(i / 10);
      const jitterX = (Math.random() - 0.5) * 8;
      const jitterY = (Math.random() - 0.5) * 5;

      this.seeds.push({
        relX: col * 14 + jitterX,
        relY: -row * 10 + jitterY - 6,
        radiusX: 6.5 + Math.random() * 1.5,
        radiusY: 5.0 + Math.random() * 1.2,
        rotation: (Math.random() - 0.5) * 0.8,
        radicleLen: 6 + Math.random() * 8,
        radicleAngle: (Math.random() - 0.5) * 1.4 - Math.PI / 2,
        tone: 0.85 + Math.random() * 0.3
      });
    }
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < 24; i++) {
      this.particles.push({
        x: 0,
        y: 0,
        vy: -0.6 - Math.random() * 0.8,
        vx: (Math.random() - 0.5) * 0.5,
        alpha: Math.random(),
        size: 1.5 + Math.random() * 2,
        life: Math.random()
      });
    }
  }

  resetExperiment() {
    this.elapsedSimSeconds = 0;
    this.waterRiseMm = 0;
    this.targetWaterRiseMm = 0;
    this.co2AbsorbedMg = 0;
    this.o2ConsumedUList = 0;
  }

  resetAll() {
    this.resetExperiment();
    this.seedType = 'germinating';
    if (this.selectSeeds) this.selectSeeds.value = 'germinating';
    this.temperature = 28;
    if (this.sliderTemp) this.sliderTemp.value = 28;
    if (this.valTemp) this.valTemp.textContent = '28°C';
    this.isAirtight = true;
    if (this.chkAirtight) this.chkAirtight.checked = true;
    this.timeScale = 60;
    if (this.selectSpeed) this.selectSpeed.value = '60';
    this.initSeeds();
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

  getRespirationRatePerHour() {
    if (!this.isAirtight) return 0;

    if (this.seedType === 'boiled') {
      return 0.0; // Denatured enzymes
    }
    if (this.seedType === 'dormant') {
      return 0.2; // Barely measurable basal respiration
    }

    // Active germinating seeds: Q10 ~ 2.0 temperature dependence
    // Optimum at ~36-38°C; sharp drop > 44°C
    let tempFactor = 1.0;
    if (this.temperature <= 38) {
      tempFactor = Math.pow(2.0, (this.temperature - 25) / 10);
    } else if (this.temperature <= 46) {
      tempFactor = Math.pow(2.0, (38 - 25) / 10) * Math.max(0, 1 - (this.temperature - 38) / 8);
    } else {
      tempFactor = 0.05; // Denaturation at extreme temperature
    }

    const baseRate = 12.0; // mm / hr at 25°C
    return baseRate * tempFactor;
  }

  animate(now) {
    const dtReal = Math.min((now - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = now;

    const dtSim = dtReal * this.timeScale;
    this.elapsedSimSeconds += dtSim;

    const ratePerHour = this.getRespirationRatePerHour();
    const ratePerSec = ratePerHour / 3600;

    if (this.isAirtight) {
      const oldVal = this.waterRiseMm;
      this.waterRiseMm = Math.min(78, this.waterRiseMm + ratePerSec * dtSim);
      if (Math.floor(this.waterRiseMm) > Math.floor(oldVal)) {
        this.sound.playSuction(260 + this.waterRiseMm * 4);
      }
    } else {
      // If seal is broken, water column falls back to zero rapidly
      if (this.waterRiseMm > 0.1) {
        this.waterRiseMm = Math.max(0, this.waterRiseMm - dtReal * 25);
      }
    }

    this.co2AbsorbedMg = (this.waterRiseMm * 0.18).toFixed(1);
    this.o2ConsumedUList = (this.waterRiseMm * 14.5).toFixed(0);

    this.render(now * 0.001);
    this.updateTelemetry(ratePerHour);

    requestAnimationFrame(this.animate);
  }

  updateTelemetry(ratePerHour) {
    const totalHours = Math.floor(this.elapsedSimSeconds / 3600);
    const totalMins = Math.floor((this.elapsedSimSeconds % 3600) / 60);
    const timeStr = `${String(totalHours).padStart(2, '0')}h ${String(totalMins).padStart(2, '0')}m`;

    if (this.readoutTime) this.readoutTime.textContent = timeStr;
    if (this.readoutHeight) this.readoutHeight.textContent = `${this.waterRiseMm.toFixed(1)} mm`;
    if (this.readoutRate) this.readoutRate.textContent = `${ratePerHour.toFixed(1)} mm/hr`;
    if (this.readoutCO2) this.readoutCO2.textContent = `${this.co2AbsorbedMg} mg`;
  }

  render(t) {
    if (!this.ctx || this.width === 0) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Academic Study Bench Room & Grid
    this.drawRoomBackground(ctx);

    // 2. Heavy Laboratory Bench Top
    const benchY = this.height * 0.82;
    this.drawLabBench(ctx, benchY);

    // 3. Retort Clamp Stand supporting the Erlenmeyer Flask
    const flaskCx = this.width * 0.32;
    this.drawRetortStand(ctx, flaskCx - 85, benchY);

    // 4. Conical Flask (250 mL Pyrex)
    this.drawErlenmeyerFlask(ctx, flaskCx, benchY, t);

    // 5. Beaker with Eosin-Red Water & Precision Millimeter Ruler
    const beakerCx = this.width * 0.74;
    this.drawEosinBeakerAndRuler(ctx, beakerCx, benchY);

    // 6. Double-walled Glass Delivery Tube with dynamic water column
    this.drawDeliveryTube(ctx, flaskCx, beakerCx, benchY, t);
  }

  drawRoomBackground(ctx) {
    // Subtle background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#F8FAFC');
    grad.addColorStop(1, '#EDF5FD');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Soft architectural lab grid
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
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
    // Bench shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
    ctx.fillRect(0, benchY, this.width, 10);

    // Countertop top surface (polished grey slate / lab epoxy)
    const topGrad = ctx.createLinearGradient(0, benchY, 0, benchY + 16);
    topGrad.addColorStop(0, '#E2E8F0');
    topGrad.addColorStop(1, '#CBD5E1');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, benchY, this.width, 16);

    // Polished bevel highlight
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, benchY + 1);
    ctx.lineTo(this.width, benchY + 1);
    ctx.stroke();

    // Bench front fascia (dark oak wood grain)
    const fasciaGrad = ctx.createLinearGradient(0, benchY + 16, 0, this.height);
    fasciaGrad.addColorStop(0, '#475569');
    fasciaGrad.addColorStop(1, '#1E293B');
    ctx.fillStyle = fasciaGrad;
    ctx.fillRect(0, benchY + 16, this.width, this.height - (benchY + 16));

    ctx.restore();
  }

  drawRetortStand(ctx, standX, benchY) {
    ctx.save();
    // Heavy cast iron base
    const baseW = 100;
    const baseH = 12;
    const baseLeft = standX - baseW / 2;

    // Shadow under base
    ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
    ctx.beginPath();
    ctx.ellipse(standX, benchY + 2, baseW / 2 + 6, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cast iron metallic gradient
    const baseGrad = ctx.createLinearGradient(baseLeft, benchY - baseH, baseLeft, benchY);
    baseGrad.addColorStop(0, '#64748B');
    baseGrad.addColorStop(0.5, '#334155');
    baseGrad.addColorStop(1, '#1E293B');
    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.roundRect(baseLeft, benchY - baseH, baseW, baseH, [4, 4, 1, 1]);
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Stainless steel vertical rod
    const rodX = standX + 16;
    const rodTop = benchY - 260;
    const rodW = 7;

    const rodGrad = ctx.createLinearGradient(rodX - rodW / 2, 0, rodX + rodW / 2, 0);
    rodGrad.addColorStop(0, '#94A3B8');
    rodGrad.addColorStop(0.3, '#F8FAFC');
    rodGrad.addColorStop(0.8, '#64748B');
    rodGrad.addColorStop(1, '#334155');

    ctx.fillStyle = rodGrad;
    ctx.fillRect(rodX - rodW / 2, rodTop, rodW, benchY - baseH - rodTop);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(rodX - rodW / 2, rodTop, rodW, benchY - baseH - rodTop);

    // Cast iron bosshead & clamp holding flask neck
    const clampY = benchY - 180;
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(rodX - 8, clampY - 10, 16, 20, 3);
    ctx.fill();

    // Brass tightening thumbscrew
    ctx.fillStyle = '#D97706';
    ctx.fillRect(rodX - 16, clampY - 4, 8, 8);

    // Horizontal clamp arm reaching to flask neck
    const armLen = (this.width * 0.32 - 24) - rodX;
    ctx.fillStyle = '#475569';
    ctx.fillRect(rodX + 8, clampY - 3, armLen, 6);

    // Rubber-sleeved clamp jaws around flask neck
    ctx.fillStyle = '#DC2626'; // red rubber sleeve
    ctx.beginPath();
    ctx.arc(rodX + 8 + armLen + 2, clampY, 14, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#DC2626';
    ctx.stroke();

    ctx.restore();
  }

  drawErlenmeyerFlask(ctx, cx, benchY, t) {
    const flaskH = 220;
    const neckTop = benchY - flaskH;
    const neckW = 46;
    const baseW = 186;
    const shoulderY = benchY - 120;

    ctx.save();

    // Drop shadow under flask base
    ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
    ctx.beginPath();
    ctx.ellipse(cx, benchY, baseW / 2 + 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flask glass path
    const buildFlaskPath = () => {
      ctx.beginPath();
      // Lip
      ctx.moveTo(cx - neckW / 2 - 3, neckTop - 2);
      ctx.lineTo(cx + neckW / 2 + 3, neckTop - 2);
      ctx.lineTo(cx + neckW / 2, neckTop + 4);
      // Neck
      ctx.lineTo(cx + neckW / 2, shoulderY);
      // Right conical shoulder to base
      ctx.lineTo(cx + baseW / 2, benchY - 4);
      ctx.quadraticCurveTo(cx + baseW / 2, benchY, cx + baseW / 2 - 8, benchY);
      // Bottom face
      ctx.lineTo(cx - baseW / 2 + 8, benchY);
      ctx.quadraticCurveTo(cx - baseW / 2, benchY, cx - baseW / 2, benchY - 4);
      // Left shoulder to neck
      ctx.lineTo(cx - neckW / 2, shoulderY);
      ctx.lineTo(cx - neckW / 2, neckTop + 4);
      ctx.closePath();
    };

    // Glass fill gradient (crystal clear Pyrex with subtle ambient highlight)
    const glassGrad = ctx.createLinearGradient(cx - baseW / 2, neckTop, cx + baseW / 2, benchY);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.88)');
    glassGrad.addColorStop(0.3, 'rgba(240, 249, 255, 0.75)');
    glassGrad.addColorStop(0.7, 'rgba(224, 242, 254, 0.65)');
    glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.85)');

    ctx.fillStyle = glassGrad;
    buildFlaskPath();
    ctx.fill();

    // Clip internal contents inside the flask
    ctx.save();
    buildFlaskPath();
    ctx.clip();

    // 1. Moist cotton wool bed at base
    const cottonY = benchY - 24;
    const cottonGrad = ctx.createLinearGradient(0, cottonY, 0, benchY);
    cottonGrad.addColorStop(0, '#F8FAFC');
    cottonGrad.addColorStop(0.5, '#E2E8F0');
    cottonGrad.addColorStop(1, '#CBD5E1');
    ctx.fillStyle = cottonGrad;
    ctx.beginPath();
    ctx.roundRect(cx - baseW / 2 + 8, cottonY, baseW - 16, 24, [8, 8, 2, 2]);
    ctx.fill();

    // Cotton wispy fibers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.2;
    for (let f = 0; f < 18; f++) {
      const fx = cx - baseW / 2 + 16 + f * 9;
      ctx.beginPath();
      ctx.moveTo(fx, cottonY + 6);
      ctx.quadraticCurveTo(fx + (f % 2 === 0 ? 4 : -4), cottonY + 1, fx + (f % 3 === 0 ? 6 : -3), cottonY - 2);
      ctx.stroke();
    }

    // 2. Realistic Organic Seeds (Gram / Pea Seeds)
    for (let s of this.seeds) {
      const sx = cx + s.relX;
      const sy = benchY - 20 + s.relY;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(s.rotation);

      // Seed body gradient
      const seedGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, s.radiusX);
      if (this.seedType === 'germinating') {
        // Vibrant living green / golden gram
        seedGrad.addColorStop(0, '#BEF264');
        seedGrad.addColorStop(0.5, '#84CC16');
        seedGrad.addColorStop(1, '#4D7C0F');
      } else if (this.seedType === 'boiled') {
        // Pale lifeless dull olive / brown boiled seeds
        seedGrad.addColorStop(0, '#D6D3D1');
        seedGrad.addColorStop(0.5, '#A8A29E');
        seedGrad.addColorStop(1, '#57534E');
      } else {
        // Dry golden dormant chickpea
        seedGrad.addColorStop(0, '#FDE047');
        seedGrad.addColorStop(0.5, '#CA8A04');
        seedGrad.addColorStop(1, '#854D0E');
      }

      ctx.fillStyle = seedGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, s.radiusX, s.radiusY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Seed hilum / eye spot
      ctx.fillStyle = '#FEF9C3';
      ctx.beginPath();
      ctx.ellipse(-1, 0, 1.6, 2.4, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Sprouting ivory radicle rootlet (only for living germinating seeds)
      if (this.seedType === 'germinating') {
        ctx.strokeStyle = '#FEFCE8';
        ctx.lineWidth = 2.0;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.radiusX - 1, 0);
        const curveX = s.radiusX + s.radicleLen * 0.6;
        const curveY = s.radicleLen * 0.4;
        const endX = s.radiusX + s.radicleLen;
        const endY = -s.radicleLen * 0.7;
        ctx.quadraticCurveTo(curveX, curveY, endX, endY);
        ctx.stroke();
      }

      ctx.restore();
    }

    // 3. Respiration Gas Micro-Particles (CO2 diffusing towards suspended KOH tube)
    if (this.seedType === 'germinating' && this.isAirtight) {
      const targetX = cx;
      const targetY = benchY - 100;

      for (let p of this.particles) {
        p.life += 0.015;
        if (p.life > 1.0) {
          p.life = 0;
          p.x = cx + (Math.random() - 0.5) * (baseW - 60);
          p.y = benchY - 35;
        }

        // Steer slightly towards target
        p.x += (targetX - p.x) * 0.01 + p.vx;
        p.y += p.vy;

        const alpha = Math.sin(p.life * Math.PI) * 0.55;
        ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Suspended Test Tube with KOH Pellets
    const tubeW = 22;
    const tubeH = 68;
    const tubeX = cx;
    const tubeY = benchY - 145;

    // Suspension thread from rubber stopper
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(tubeX, neckTop + 24);
    ctx.lineTo(tubeX, tubeY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glass test tube body
    const ttGrad = ctx.createLinearGradient(tubeX - tubeW / 2, tubeY, tubeX + tubeW / 2, tubeY);
    ttGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    ttGrad.addColorStop(0.3, 'rgba(224, 242, 254, 0.6)');
    ttGrad.addColorStop(0.8, 'rgba(186, 230, 253, 0.4)');
    ttGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

    ctx.fillStyle = ttGrad;
    ctx.beginPath();
    ctx.roundRect(tubeX - tubeW / 2, tubeY, tubeW, tubeH, [0, 0, 11, 11]);
    ctx.fill();
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Solid White KOH Pellets
    const pelletColors = ['#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0'];
    for (let k = 0; k < 5; k++) {
      const py = tubeY + tubeH - 8 - k * 10;
      ctx.fillStyle = pelletColors[k % pelletColors.length];
      ctx.beginPath();
      ctx.ellipse(tubeX, py, 7.5, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Chemical Absorption Glow around KOH
    if (this.seedType === 'germinating' && this.isAirtight) {
      const pulse = Math.sin(t * 4) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(14, 165, 233, ${0.12 * pulse})`;
      ctx.beginPath();
      ctx.roundRect(tubeX - tubeW / 2 - 4, tubeY - 4, tubeW + 8, tubeH + 8, 14);
      ctx.fill();
    }

    // KOH Pellets annotation badge
    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0369A1';
    ctx.textAlign = 'left';
    ctx.fillText('KOH Tube', tubeX + 16, tubeY + 28);
    ctx.font = '500 9px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('Fixes CO₂', tubeX + 16, tubeY + 42);

    // Moisture condensation micro-droplets on glass shoulder
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    const droplets = [
      { x: cx - 35, y: shoulderY - 20, r: 2.2 },
      { x: cx - 24, y: shoulderY - 8, r: 1.8 },
      { x: cx + 32, y: shoulderY - 14, r: 2.4 },
      { x: cx + 42, y: shoulderY + 12, r: 2.0 },
      { x: cx - 48, y: shoulderY + 25, r: 2.5 }
    ];
    for (let d of droplets) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore(); // Restore clip

    // Volumetric graduation markings on outside of flask
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0284C7';
    ctx.textAlign = 'right';

    const grads = [
      { y: benchY - 45, label: '50mL' },
      { y: benchY - 75, label: '100mL' },
      { y: benchY - 105, label: '150mL' },
      { y: benchY - 135, label: '200mL' }
    ];
    for (let g of grads) {
      // Find left x at this y
      const frac = (benchY - g.y) / (benchY - shoulderY);
      const wAtY = baseW - (baseW - neckW) * Math.min(1, Math.max(0, frac));
      const gx = cx - wAtY / 2 + 8;
      ctx.beginPath();
      ctx.moveTo(gx, g.y);
      ctx.lineTo(gx + 14, g.y);
      ctx.stroke();
      ctx.fillText(g.label, gx - 4, g.y + 3);
    }

    // Outer glassware stroke & highlights
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2.2;
    buildFlaskPath();
    ctx.stroke();

    // Specular glass shine along shoulder
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(cx - neckW / 2 + 4, shoulderY - 30);
    ctx.lineTo(cx - baseW / 2 + 18, benchY - 10);
    ctx.stroke();

    // Rubber Stopper in Flask Neck
    const stopperTop = neckTop - 12;
    const stopperH = 26;
    const stopperGrad = ctx.createLinearGradient(0, stopperTop, 0, stopperTop + stopperH);
    if (this.isAirtight) {
      stopperGrad.addColorStop(0, '#475569');
      stopperGrad.addColorStop(0.5, '#334155');
      stopperGrad.addColorStop(1, '#1E293B');
    } else {
      // Tilted loose stopper with warning red tint
      stopperGrad.addColorStop(0, '#F87171');
      stopperGrad.addColorStop(1, '#DC2626');
    }

    ctx.fillStyle = stopperGrad;
    ctx.beginPath();
    const tilt = this.isAirtight ? 0 : 0.08;
    ctx.save();
    ctx.translate(cx, stopperTop + stopperH / 2);
    ctx.rotate(tilt);
    ctx.roundRect(-neckW / 2 + 2, -stopperH / 2, neckW - 4, stopperH, 3);
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Translucent vaseline airtight grease seal around cork
    if (this.isAirtight) {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
      ctx.fillRect(-neckW / 2 - 1, stopperH / 2 - 4, neckW + 2, 6);
    }
    ctx.restore();

    ctx.restore();
  }

  drawEosinBeakerAndRuler(ctx, bx, benchY) {
    const bw = 96;
    const bh = 115;
    const bTop = benchY - bh;

    ctx.save();

    // Beaker shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
    ctx.beginPath();
    ctx.ellipse(bx, benchY, bw / 2 + 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. Millimeter Precision Ruler standing behind beaker
    const rulerW = 22;
    const rulerH = 135;
    const rulerX = bx + bw / 2 - 28;
    const rulerY = benchY - rulerH;

    // Wooden / Acrylic Ruler body
    const rulerGrad = ctx.createLinearGradient(rulerX, 0, rulerX + rulerW, 0);
    rulerGrad.addColorStop(0, '#FEF08A');
    rulerGrad.addColorStop(0.5, '#FDE047');
    rulerGrad.addColorStop(1, '#EAB308');
    ctx.fillStyle = rulerGrad;
    ctx.fillRect(rulerX, rulerY, rulerW, rulerH);
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 1;
    ctx.strokeRect(rulerX, rulerY, rulerW, rulerH);

    // Millimeter ticks on ruler
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 0.8;
    ctx.font = '600 7px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    for (let mm = 0; mm <= 80; mm += 2) {
      const my = benchY - 10 - mm * 1.35;
      if (my < rulerY + 4) break;

      const isCm = mm % 10 === 0;
      const tickLen = isCm ? 8 : (mm % 5 === 0 ? 5 : 3);
      ctx.beginPath();
      ctx.moveTo(rulerX, my);
      ctx.lineTo(rulerX + tickLen, my);
      ctx.stroke();

      if (isCm && mm > 0) {
        ctx.fillText(`${mm / 10}`, rulerX + rulerW - 3, my + 2.5);
      }
    }

    // 2. Pyrex Beaker Glass Body
    const beakerGrad = ctx.createLinearGradient(bx - bw / 2, bTop, bx + bw / 2, benchY);
    beakerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    beakerGrad.addColorStop(0.3, 'rgba(224, 242, 254, 0.6)');
    beakerGrad.addColorStop(1, 'rgba(255, 255, 255, 0.8)');

    ctx.fillStyle = beakerGrad;
    ctx.beginPath();
    ctx.roundRect(bx - bw / 2, bTop, bw, bh, [0, 0, 8, 8]);
    ctx.fill();

    // 3. Colored Eosin-Red Water inside Beaker
    const liquidH = bh * 0.62;
    const liquidY = benchY - liquidH;

    const redGrad = ctx.createLinearGradient(0, liquidY, 0, benchY);
    redGrad.addColorStop(0, '#EF4444');
    redGrad.addColorStop(0.4, '#DC2626');
    redGrad.addColorStop(1, '#991B1B');

    ctx.fillStyle = redGrad;
    ctx.beginPath();
    ctx.roundRect(bx - bw / 2 + 2, liquidY, bw - 4, liquidH - 2, [0, 0, 6, 6]);
    ctx.fill();

    // Liquid surface meniscus
    ctx.fillStyle = '#F87171';
    ctx.beginPath();
    ctx.ellipse(bx, liquidY, (bw - 6) / 2, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Beaker graduation markings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.font = '600 8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';

    const bGrads = [
      { y: benchY - 24, label: '25' },
      { y: benchY - 44, label: '50' },
      { y: benchY - 64, label: '75' }
    ];
    for (let bg of bGrads) {
      ctx.beginPath();
      ctx.moveTo(bx - bw / 2 + 4, bg.y);
      ctx.lineTo(bx - bw / 2 + 14, bg.y);
      ctx.stroke();
      ctx.fillText(bg.label, bx - bw / 2 + 16, bg.y + 3);
    }

    // Beaker border & spout
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx - bw / 2 - 4, bTop);
    ctx.lineTo(bx - bw / 2, bTop);
    ctx.lineTo(bx - bw / 2, benchY - 4);
    ctx.quadraticCurveTo(bx - bw / 2, benchY, bx - bw / 2 + 4, benchY);
    ctx.lineTo(bx + bw / 2 - 4, benchY);
    ctx.quadraticCurveTo(bx + bw / 2, benchY, bx + bw / 2, benchY - 4);
    ctx.lineTo(bx + bw / 2, bTop);
    ctx.stroke();

    // Title label
    ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.fillText('Colored Eosin Water', bx, benchY + 18);

    ctx.restore();
  }

  drawDeliveryTube(ctx, flaskCx, beakerCx, benchY, t) {
    const flaskNeckTop = benchY - 220;
    const beakerLiquidY = benchY - (115 * 0.62);
    const beakerBottom = benchY - 10;

    const tubeRadius = 14;
    const tubeThick = 6.5;

    // Delivery tube path coordinates
    const startX = flaskCx;
    const startY = flaskNeckTop + 35;
    const topY = flaskNeckTop - 36;
    const endX = beakerCx - 14;
    const endY = beakerBottom;

    ctx.save();

    // 1. Draw outer glass tube (double-walled clear cylinder)
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.4)';
    ctx.lineWidth = tubeThick + 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, topY + tubeRadius);
    ctx.arcTo(startX, topY, startX + tubeRadius, topY, tubeRadius);
    ctx.lineTo(endX - tubeRadius, topY);
    ctx.arcTo(endX, topY, endX, topY + tubeRadius, tubeRadius);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Clear hollow glass center
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = tubeThick;
    ctx.stroke();

    // 2. Creeping Eosin Red Liquid Column inside Tube
    // Rise height in mm mapped to pixels (1 mm ~ 1.35 px)
    const risePx = this.waterRiseMm * 1.35;

    if (risePx > 0.5) {
      const liquidLevelY = beakerLiquidY - risePx;

      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = tubeThick - 1.2;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(endX, beakerBottom);

      if (liquidLevelY >= topY + tubeRadius) {
        // Vertical rise inside beaker arm
        ctx.lineTo(endX, liquidLevelY);
      } else {
        // Liquid has reached and turned past the corner!
        ctx.lineTo(endX, topY + tubeRadius);
        ctx.arcTo(endX, topY, endX - tubeRadius, topY, tubeRadius);
        const horizProgress = Math.min((topY + tubeRadius) - liquidLevelY, endX - startX - 2 * tubeRadius);
        ctx.lineTo(endX - tubeRadius - horizProgress, topY);
      }
      ctx.stroke();

      // Liquid Meniscus Bubble & Pointer callout
      const meniscusY = Math.max(topY + 6, liquidLevelY);
      ctx.fillStyle = '#991B1B';
      ctx.beginPath();
      ctx.ellipse(endX, meniscusY, (tubeThick - 1) / 2, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Floating Callout Badge indicating current rise Δh
      ctx.save();
      const badgeX = endX + 22;
      const badgeY = meniscusY;

      // Pointer line
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(endX + 4, meniscusY);
      ctx.lineTo(badgeX, badgeY);
      ctx.stroke();

      // Badge pill
      ctx.fillStyle = '#FEF2F2';
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY - 11, 72, 22, 5);
      ctx.fill();
      ctx.stroke();

      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#DC2626';
      ctx.textAlign = 'center';
      ctx.fillText(`Δh=${this.waterRiseMm.toFixed(1)}mm`, badgeX + 36, badgeY + 4);
      ctx.restore();
    }

    ctx.restore();
  }
}

// Instantiate simulation when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.sim = new SeedRespirationSimulation();
});
