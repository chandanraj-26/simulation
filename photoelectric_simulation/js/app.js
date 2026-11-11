/**
 * Photoelectric Effect & Planck's Constant Determination
 * Strict Zero-Dependency Vanilla Web Standard & Simulation Guidelines
 */

// Safe CanvasRenderingContext2D.roundRect Polyfill
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
    let r = radii || 0;
    if (Array.isArray(r)) r = r[0] || 0;
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

class PhotoelectricSimulation {
  constructor() {
    this.canvas = document.getElementById('simCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Physical Constants
    this.h = 6.626e-34; // J*s
    this.e = 1.602e-19; // C
    this.c = 3.0e8; // m/s
    this.hc_eV_nm = 1239.84; // eV * nm

    // Materials Library (Work function Phi in eV)
    this.materials = {
      cesium: { name: 'Cesium (Cs)', phi: 2.14, color: '#FBBF24' },
      potassium: { name: 'Potassium (K)', phi: 2.30, color: '#C084FC' },
      sodium: { name: 'Sodium (Na)', phi: 2.75, color: '#F59E0B' },
      calcium: { name: 'Calcium (Ca)', phi: 2.87, color: '#94A3B8' },
      zinc: { name: 'Zinc (Zn)', phi: 4.31, color: '#64748B' },
      platinum: { name: 'Platinum (Pt)', phi: 6.35, color: '#E2E8F0' }
    };

    // Current State
    this.currentMaterialKey = 'sodium';
    this.wavelength = 400; // nm
    this.intensity = 60; // %
    this.voltage = 0.0; // V (-4.0 to +4.0)
    this.activeGraphTab = 'iv'; // 'iv' or 'v0_nu'
    this.soundEnabled = true;

    // Particle Arrays
    this.photons = [];
    this.electrons = [];
    this.lastSpawnTime = 0;

    // Audio Context
    this.audioCtx = null;

    this.initDOM();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.attachEvents();
    this.startLoop();
  }

  initDOM() {
    this.selectMaterial = document.getElementById('selectMaterial');
    this.sliderWavelength = document.getElementById('sliderWavelength');
    this.sliderIntensity = document.getElementById('sliderIntensity');
    this.sliderVoltage = document.getElementById('sliderVoltage');

    this.valWavelength = document.getElementById('valWavelength');
    this.valIntensity = document.getElementById('valIntensity');
    this.valVoltage = document.getElementById('valVoltage');

    this.telePhotonEnergy = document.getElementById('telePhotonEnergy');
    this.teleWorkFunction = document.getElementById('teleWorkFunction');
    this.teleMaxKE = document.getElementById('teleMaxKE');
    this.teleStoppingPotential = document.getElementById('teleStoppingPotential');

    this.tabIV = document.getElementById('tabIV');
    this.tabV0Nu = document.getElementById('tabV0Nu');

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

  playEmissionClick() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + Math.random() * 400, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.015, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.02);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.02);
    } catch (e) {}
  }

  playStoppingBeep() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.1);
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
    this.selectMaterial.addEventListener('change', (e) => {
      this.initAudio();
      this.currentMaterialKey = e.target.value;
      this.electrons = [];
      this.updateTelemetry();
    });

    this.sliderWavelength.addEventListener('input', (e) => {
      this.initAudio();
      this.wavelength = parseFloat(e.target.value);
      this.valWavelength.textContent = `${this.wavelength} nm`;
      this.updateTelemetry();
    });

    this.sliderIntensity.addEventListener('input', (e) => {
      this.initAudio();
      this.intensity = parseFloat(e.target.value);
      this.valIntensity.textContent = `${this.intensity}%`;
      this.updateTelemetry();
    });

    this.sliderVoltage.addEventListener('input', (e) => {
      this.initAudio();
      const prevV = this.voltage;
      this.voltage = parseFloat(e.target.value);
      this.valVoltage.textContent = `${this.voltage >= 0 ? '+' : ''}${this.voltage.toFixed(2)} V`;

      // Check if crossing stopping potential
      const curV0 = this.getStoppingPotential();
      if ((prevV > -curV0 && this.voltage <= -curV0) || (prevV <= -curV0 && this.voltage > -curV0)) {
        this.playStoppingBeep();
      }
      this.updateTelemetry();
    });

    this.tabIV.addEventListener('click', () => {
      this.activeGraphTab = 'iv';
      this.tabIV.classList.add('active');
      this.tabV0Nu.classList.remove('active');
    });

    this.tabV0Nu.addEventListener('click', () => {
      this.activeGraphTab = 'v0_nu';
      this.tabV0Nu.classList.add('active');
      this.tabIV.classList.remove('active');
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
    this.currentMaterialKey = 'sodium';
    this.wavelength = 400;
    this.intensity = 60;
    this.voltage = 0.0;
    this.electrons = [];
    this.photons = [];

    this.selectMaterial.value = 'sodium';
    this.sliderWavelength.value = 400;
    this.sliderIntensity.value = 60;
    this.sliderVoltage.value = 0.0;

    this.valWavelength.textContent = '400 nm';
    this.valIntensity.textContent = '60%';
    this.valVoltage.textContent = '+0.00 V';

    this.updateTelemetry();
  }

  getPhotonEnergy() {
    return this.hc_eV_nm / this.wavelength;
  }

  getWorkFunction() {
    return this.materials[this.currentMaterialKey].phi;
  }

  getMaxKE() {
    const E = this.getPhotonEnergy();
    const phi = this.getWorkFunction();
    return Math.max(0, E - phi);
  }

  getStoppingPotential() {
    return this.getMaxKE(); // Since K_max = e * V_0
  }

  getPhotocurrent() {
    const E = this.getPhotonEnergy();
    const phi = this.getWorkFunction();
    if (E <= phi || this.intensity === 0) return 0;

    const V0 = this.getStoppingPotential();
    const Isat = this.intensity * 0.12; // microamperes scale

    if (this.voltage <= -V0) {
      return 0.0;
    } else if (this.voltage < 0) {
      // Smooth deceleration curve towards stopping potential
      const frac = (this.voltage - (-V0)) / V0;
      return Isat * Math.pow(frac, 1.8) * 0.85;
    } else {
      // Saturation region with small forward exponential rise
      return Isat * (0.85 + 0.15 * (1 - Math.exp(-this.voltage / 0.9)));
    }
  }

  updateTelemetry() {
    const E = this.getPhotonEnergy();
    const phi = this.getWorkFunction();
    const kMax = this.getMaxKE();
    const v0 = this.getStoppingPotential();
    const current = this.getPhotocurrent();

    this.telePhotonEnergy.textContent = `${E.toFixed(2)} eV`;
    this.teleWorkFunction.textContent = `${phi.toFixed(2)} eV`;
    this.teleMaxKE.textContent = `${kMax.toFixed(2)} eV`;
    this.teleStoppingPotential.textContent = `${v0.toFixed(2)} V`;

    const teleCurrent = document.getElementById('telePhotocurrent');
    if (teleCurrent) {
      teleCurrent.textContent = `${current.toFixed(2)} µA`;
    }
  }

  wavelengthToColor(wl, alpha = 1) {
    let r = 0, g = 0, b = 0;
    if (wl < 380) {
      // Ultraviolet
      r = 0.55; g = 0.1; b = 0.85;
    } else if (wl >= 380 && wl < 440) {
      r = -(wl - 440) / (440 - 380);
      b = 1.0;
    } else if (wl >= 440 && wl < 490) {
      g = (wl - 440) / (490 - 440);
      b = 1.0;
    } else if (wl >= 490 && wl < 510) {
      g = 1.0;
      b = -(wl - 510) / (510 - 490);
    } else if (wl >= 510 && wl < 580) {
      r = (wl - 510) / (580 - 510);
      g = 1.0;
    } else if (wl >= 580 && wl < 645) {
      r = 1.0;
      g = -(wl - 645) / (645 - 580);
    } else if (wl >= 645 && wl <= 780) {
      r = 1.0;
    } else {
      r = 0.8; g = 0.8; b = 0.8;
    }
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
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
    const dt = 1 / 60;

    // Tube dimensions
    const tubeX = this.width * 0.10;
    const tubeY = this.height * 0.12;
    const tubeW = this.width * 0.48;
    const tubeH = this.height * 0.76;

    const cathodeX = tubeX + 50;
    const cathodeTopY = tubeY + 40;
    const cathodeBottomY = tubeY + tubeH - 40;

    const anodeX = tubeX + tubeW - 50;

    // Spawn Photons based on intensity
    if (this.intensity > 0 && now - this.lastSpawnTime > (140 - this.intensity * 1.1)) {
      this.lastSpawnTime = now;
      const targetY = cathodeTopY + Math.random() * (cathodeBottomY - cathodeTopY);
      this.photons.push({
        x: tubeX + 15,
        y: tubeY - 10,
        tx: cathodeX,
        ty: targetY,
        vx: (cathodeX - (tubeX + 15)) * 0.045,
        vy: (targetY - (tubeY - 10)) * 0.045
      });
    }

    // Update Photons
    for (let i = this.photons.length - 1; i >= 0; i--) {
      const p = this.photons[i];
      p.x += p.vx;
      p.y += p.vy;

      // Check collision with cathode
      if (p.x >= p.tx) {
        // Photon hit cathode!
        const kMax = this.getMaxKE();
        if (kMax > 0) {
          // Photoelectron ejected!
          const initialSpeed = 1.8 + Math.sqrt(kMax) * 2.2 * (0.4 + Math.random() * 0.6);
          const angle = (Math.random() - 0.5) * 0.9; // forward cone
          this.electrons.push({
            x: cathodeX + 3,
            y: p.ty,
            vx: Math.cos(angle) * initialSpeed,
            vy: Math.sin(angle) * initialSpeed,
            trail: []
          });
          if (Math.random() < 0.25) this.playEmissionClick();
        }
        this.photons.splice(i, 1);
      }
    }

    // Electric field acceleration: a = (e * V) / (m * d)
    // Positive voltage accelerates electrons rightward toward anode
    const eAcc = (this.voltage / 4.0) * 0.12;

    // Update Electrons
    for (let i = this.electrons.length - 1; i >= 0; i--) {
      const e = this.electrons[i];

      // Store trail
      e.trail.push({ x: e.x, y: e.y });
      if (e.trail.length > 5) e.trail.shift();

      e.vx += eAcc;
      e.x += e.vx;
      e.y += e.vy;

      // Check if reached anode
      if (e.x >= anodeX) {
        this.electrons.splice(i, 1);
        continue;
      }

      // Check if turned back and hit cathode
      if (e.x < cathodeX - 2) {
        this.electrons.splice(i, 1);
        continue;
      }

      // Bounds checking within tube
      if (e.y < tubeY + 20 || e.y > tubeY + tubeH - 20) {
        this.electrons.splice(i, 1);
      }
    }
  }

  draw() {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    // Grid
    this.drawBackgroundGrid();

    // 1. Draw Phototube Apparatus (Left 55% of canvas)
    const tubeX = width * 0.08;
    const tubeY = height * 0.10;
    const tubeW = width * 0.50;
    const tubeH = height * 0.80;

    this.drawPhototube(tubeX, tubeY, tubeW, tubeH);

    // 2. Draw Photons & Electrons
    this.drawParticles();

    // 3. Draw External Circuit (Battery, Rheostat, Microammeter, Voltmeter)
    this.drawExternalCircuit(tubeX, tubeY, tubeW, tubeH);

    // 4. Draw Characteristic Graphs (Right 38% of canvas)
    const graphX = width * 0.62;
    const graphY = height * 0.10;
    const graphW = width * 0.35;
    const graphH = height * 0.80;

    this.drawGraphPanel(graphX, graphY, graphW, graphH);
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

  drawPhototube(x, y, w, h) {
    const { ctx } = this;
    ctx.save();

    // Glass bulb glow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 28);
    ctx.fill();
    ctx.stroke();

    // Quartz window inset on top left
    ctx.fillStyle = 'rgba(224, 242, 254, 0.9)';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x + 15, y - 8, 70, 16, 4);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 9px JetBrains Mono';
    ctx.fillStyle = '#0284C7';
    ctx.textAlign = 'center';
    ctx.fillText('QUARTZ WINDOW', x + 50, y + 4);

    // Curved Cathode Plate (Emmiter, C)
    const cathodeX = x + 50;
    const cathodeTopY = y + 40;
    const cathodeBottomY = y + h - 40;

    const mat = this.materials[this.currentMaterialKey];
    ctx.strokeStyle = mat.color;
    ctx.fillStyle = mat.color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cathodeX - 20, (cathodeTopY + cathodeBottomY) * 0.5, (cathodeBottomY - cathodeTopY) * 0.55, -0.6, 0.6);
    ctx.stroke();

    // Cathode Label
    ctx.font = '700 12px JetBrains Mono';
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'right';
    ctx.fillText('CATHODE (C)', cathodeX - 25, y + 30);
    ctx.font = '600 10px JetBrains Mono';
    ctx.fillStyle = '#475569';
    ctx.fillText(`${mat.name} [Φ=${mat.phi}eV]`, cathodeX - 25, y + 45);

    // Anode Plate / Collector Ring (A)
    const anodeX = x + w - 50;
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(anodeX, cathodeTopY + 20);
    ctx.lineTo(anodeX, cathodeBottomY - 20);
    ctx.stroke();

    // Anode Label
    ctx.font = '700 12px JetBrains Mono';
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'left';
    ctx.fillText('ANODE (A)', anodeX + 15, y + 30);
    ctx.font = '600 10px JetBrains Mono';
    ctx.fillStyle = '#475569';
    ctx.fillText('Collector', anodeX + 15, y + 45);

    // Evacuated chamber watermark
    ctx.font = '700 10px JetBrains Mono';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('EVACUATED QUARTZ CHAMBER', x + w * 0.5, y + h * 0.5);

    ctx.restore();
  }

  drawParticles() {
    const { ctx } = this;
    ctx.save();

    // 1. Draw Incoming Photons
    const photonColor = this.wavelengthToColor(this.wavelength, 0.9);
    for (const p of this.photons) {
      ctx.fillStyle = photonColor;
      ctx.shadowColor = photonColor;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Photon wave packet tail
      ctx.strokeStyle = photonColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(p.x - p.vx * 3, p.y - p.vy * 3);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    // 2. Draw Ejected Photoelectrons
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#3B82F6';
    for (const e of this.electrons) {
      // Trail
      if (e.trail.length > 1) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(e.trail[0].x, e.trail[0].y);
        for (let i = 1; i < e.trail.length; i++) {
          ctx.lineTo(e.trail[i].x, e.trail[i].y);
        }
        ctx.stroke();
      }

      // Electron head
      ctx.fillStyle = '#1D4ED8';
      ctx.beginPath();
      ctx.arc(e.x, e.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Minus sign inside
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 8px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('-', e.x, e.y);
    }

    ctx.restore();
  }

  drawExternalCircuit(x, y, w, h) {
    const { ctx } = this;
    ctx.save();

    const cathodeX = x + 40;
    const anodeX = x + w - 50;
    const bottomWireY = y + h + 30;

    // Busbars from cathode & anode to external circuit
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2.5;

    // Cathode wire down
    ctx.beginPath();
    ctx.moveTo(cathodeX, y + h - 35);
    ctx.lineTo(cathodeX, bottomWireY);
    ctx.lineTo(x + w * 0.35, bottomWireY);
    ctx.stroke();

    // Anode wire down
    ctx.beginPath();
    ctx.moveTo(anodeX, y + h - 35);
    ctx.lineTo(anodeX, bottomWireY);
    ctx.lineTo(x + w * 0.65, bottomWireY);
    ctx.stroke();

    // Microammeter Widget (center-left)
    const ammeterX = x + w * 0.25;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ammeterX, bottomWireY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0284C7';
    ctx.font = '700 11px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('µA', ammeterX, bottomWireY);

    // Current Readout Tag
    const current = this.getPhotocurrent();
    ctx.fillStyle = '#0F172A';
    ctx.font = '700 11px JetBrains Mono';
    ctx.fillText(`${current.toFixed(2)} µA`, ammeterX, bottomWireY + 28);

    // Variable DC Source / Commutator (center-right)
    const batteryX = x + w * 0.50;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(batteryX - 35, bottomWireY - 14, 70, 28, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this.voltage >= 0 ? '#10B981' : '#EF4444';
    ctx.font = '700 11px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.voltage >= 0 ? '+' : ''}${this.voltage.toFixed(2)} V`, batteryX, bottomWireY);

    ctx.restore();
  }

  drawGraphPanel(gx, gy, gw, gh) {
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

    if (this.activeGraphTab === 'iv') {
      this.drawIVGraph(gx + 16, gy + 35, gw - 32, gh - 65);
    } else {
      this.drawV0NuGraph(gx + 16, gy + 35, gw - 32, gh - 65);
    }

    ctx.restore();
  }

  drawIVGraph(x, y, w, h) {
    const { ctx } = this;
    ctx.save();

    // Title
    ctx.fillStyle = '#0F172A';
    ctx.font = '700 12px Plus Jakarta Sans';
    ctx.textAlign = 'left';
    ctx.fillText('Photocurrent (I) vs. Retarding Voltage (V)', x, y - 10);

    // Coordinate Axes
    const originX = x + w * 0.55; // 0V line
    const originY = y + h - 25;

    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;

    // X Axis
    ctx.beginPath();
    ctx.moveTo(x, originY);
    ctx.lineTo(x + w, originY);
    ctx.stroke();

    // Y Axis (V = 0)
    ctx.beginPath();
    ctx.moveTo(originX, y);
    ctx.lineTo(originX, originY + 5);
    ctx.stroke();

    // Axis Labels
    ctx.font = '600 10px JetBrains Mono';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.fillText('0', originX, originY + 14);
    ctx.fillText('+V', x + w - 10, originY + 14);
    ctx.fillText('-V', x + 10, originY + 14);

    ctx.textAlign = 'right';
    ctx.fillText('I_sat', originX - 6, y + 16);

    const v0 = this.getStoppingPotential();
    const curV = this.voltage;
    const vScale = (w * 0.45) / 4.0; // 4 Volts scale
    const iScale = (h - 40);

    // Plot I-V Curve
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const startVx = originX - (4.0 * vScale);
    ctx.moveTo(startVx, originY);

    for (let vx = -4.0; vx <= 4.0; vx += 0.1) {
      const px = originX + vx * vScale;
      let currNorm = 0;
      if (vx <= -v0) {
        currNorm = 0;
      } else if (vx < 0) {
        currNorm = Math.pow((vx - (-v0)) / v0, 1.8) * 0.85;
      } else {
        currNorm = 0.85 + 0.15 * (1 - Math.exp(-vx / 0.9));
      }
      const py = originY - currNorm * (this.intensity / 100) * iScale;
      ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Mark Stopping Potential -V0
    if (v0 > 0) {
      const v0Px = originX - v0 * vScale;
      ctx.fillStyle = '#EF4444';
      ctx.strokeStyle = '#EF4444';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(v0Px, originY);
      ctx.lineTo(v0Px, originY - 30);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(v0Px, originY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '700 10px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`-V₀ (${(-v0).toFixed(2)}V)`, v0Px, originY - 36);
    }

    // Mark Current Operating Point
    const opX = originX + curV * vScale;
    const curNorm = this.getPhotocurrent() / (12);
    const opY = originY - (this.getPhotocurrent() / (this.intensity * 0.12 || 1)) * (this.intensity / 100) * iScale;

    ctx.fillStyle = '#F59E0B';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(opX, opY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawV0NuGraph(x, y, w, h) {
    const { ctx } = this;
    ctx.save();

    // Title
    ctx.fillStyle = '#0F172A';
    ctx.font = '700 12px Plus Jakarta Sans';
    ctx.textAlign = 'left';
    ctx.fillText('Stopping Potential (V₀) vs. Frequency (ν)', x, y - 10);

    const originX = x + 35;
    const originY = y + h - 25;

    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;

    // X Axis
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(x + w, originY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(originX, y);
    ctx.lineTo(originX, originY);
    ctx.stroke();

    // Axis Labels
    ctx.font = '600 10px JetBrains Mono';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.fillText('ν (×10¹⁴ Hz)', x + w - 30, originY + 16);

    ctx.textAlign = 'right';
    ctx.fillText('V₀ (V)', originX - 6, y + 14);

    // Linear fit line: V0 = (h/e) * nu - Phi/e
    // nu range: 0 to 20 x 10^14 Hz
    const nuMax = 18.0; // x10^14 Hz
    const vMax = 4.0; // V

    const nuScale = (w - 50) / nuMax;
    const vScale = (h - 45) / vMax;

    const phi = this.getWorkFunction();
    const nu0 = (phi / 4.1357); // Threshold frequency in 10^14 Hz

    // Line
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const startPx = originX + nu0 * nuScale;
    ctx.moveTo(startPx, originY);

    const endNu = nuMax;
    const endV0 = Math.max(0, (endNu * 4.1357e-15 * 1e14 - phi));
    const endPx = originX + endNu * nuScale;
    const endPy = originY - endV0 * vScale;

    ctx.lineTo(endPx, endPy);
    ctx.stroke();

    // Threshold frequency mark
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(startPx, originY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '700 9px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`ν₀=${nu0.toFixed(2)}`, startPx, originY + 14);

    // Current Operating Frequency Point
    const curNu = (this.c / (this.wavelength * 1e-9)) / 1e14;
    const curV0 = this.getStoppingPotential();
    const curPx = originX + curNu * nuScale;
    const curPy = originY - curV0 * vScale;

    if (curPx <= x + w) {
      ctx.fillStyle = '#F59E0B';
      ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(curPx, curPy, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.font = '700 9px JetBrains Mono';
      ctx.fillStyle = '#D97706';
      ctx.textAlign = 'left';
      ctx.fillText(`ν=${curNu.toFixed(1)}`, curPx + 8, curPy - 4);
    }

    // Callout box with slope = h/e
    ctx.fillStyle = '#F0F7FF';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x + 40, y + 15, 125, 38, 4);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 9px JetBrains Mono';
    ctx.fillStyle = '#0369A1';
    ctx.textAlign = 'left';
    ctx.fillText('Slope = h/e', x + 46, y + 28);
    ctx.font = '600 8.5px JetBrains Mono';
    ctx.fillText('≈ 4.14×10⁻¹⁵ V·s', x + 46, y + 42);

    ctx.restore();
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.sim = new PhotoelectricSimulation();
});

