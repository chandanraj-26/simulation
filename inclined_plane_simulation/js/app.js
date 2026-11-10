/**
 * Inclined Plane, Friction, Angle of Repose & Photogates Virtual Lab
 * NCERT Class 11 Physics (Laws of Motion & Friction)
 * High-fidelity virtual mechanics laboratory featuring realistic material textures,
 * precision engraved brass protractor quadrant, optical photogate timers,
 * Free Body Diagram vectors, and dynamic friction-threshold physics.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.scrapeOsc = null;
    this.scrapeGain = null;
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
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  playPhotogateBeep(freq = 1200) {
    if (!this.enabled) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  startScrape(vel) {
    if (!this.enabled) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    if (!this.scrapeOsc) {
      this.scrapeOsc = this.ctx.createOscillator();
      this.scrapeGain = this.ctx.createGain();
      this.scrapeOsc.type = 'sawtooth';
      this.scrapeOsc.frequency.setValueAtTime(120, this.ctx.currentTime);

      this.scrapeGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      this.scrapeOsc.connect(this.scrapeGain);
      this.scrapeGain.connect(this.ctx.destination);
      this.scrapeOsc.start();
    }
    const targetFreq = Math.min(380, 110 + vel * 90);
    this.scrapeOsc.frequency.setValueAtTime(targetFreq, this.ctx.currentTime);
  }

  stopScrape() {
    if (this.scrapeOsc) {
      try {
        this.scrapeGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.scrapeOsc.stop();
        this.scrapeOsc.disconnect();
      } catch (e) {}
      this.scrapeOsc = null;
      this.scrapeGain = null;
    }
  }
}

class InclinedPlaneSimulation {
  constructor() {
    this.canvas = document.getElementById('simCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundEngine();

    // Mechanics parameters
    this.angleDeg = 20; // ramp angle in degrees
    this.blockMassKg = 5.0; // kg
    this.g = 9.806; // m/s^2

    // Material pairs database
    this.materials = {
      wood_wood: {
        id: 'wood_wood',
        name: 'Wood on Wood',
        muS: 0.50,
        muK: 0.35,
        trackColor: '#E2C29B',
        blockColor: '#B47B48',
        style: 'wood'
      },
      steel_steel: {
        id: 'steel_steel',
        name: 'Steel on Steel',
        muS: 0.74,
        muK: 0.57,
        trackColor: '#CBD5E1',
        blockColor: '#64748B',
        style: 'steel'
      },
      rubber_concrete: {
        id: 'rubber_concrete',
        name: 'Rubber on Concrete',
        muS: 0.90,
        muK: 0.70,
        trackColor: '#94A3B8',
        blockColor: '#1E293B',
        style: 'concrete'
      },
      ice_glass: {
        id: 'ice_glass',
        name: 'Ice on Glass',
        muS: 0.10,
        muK: 0.03,
        trackColor: '#E0F2FE',
        blockColor: '#38BDF8',
        style: 'ice'
      },
      sandpaper_wood: {
        id: 'sandpaper_wood',
        name: 'Sandpaper on Wood',
        muS: 0.95,
        muK: 0.75,
        trackColor: '#B45309',
        blockColor: '#78350F',
        style: 'sandpaper'
      }
    };
    this.currentMaterialId = 'wood_wood';

    // Track kinematics (in physical meters, track length = 2.0 m)
    this.trackLengthM = 2.0;
    this.blockPosM = 1.6; // starts near top
    this.blockVelM = 0;
    this.blockAccM = 0;
    this.isSliding = false;

    // Photogates at fixed positions along track (in meters from pivot)
    this.gate1M = 0.5; // lower gate
    this.gate2M = 1.3; // upper gate
    this.gate1Time = 0;
    this.gate2Time = 0;
    this.gate1Passed = false;
    this.gate2Passed = false;
    this.v1 = 0;
    this.v2 = 0;

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
    this.sliderAngle = document.getElementById('sliderAngle');
    this.valAngle = document.getElementById('valAngle');
    this.sliderMass = document.getElementById('sliderMass');
    this.valMass = document.getElementById('valMass');
    this.selectMaterial = document.getElementById('selectMaterial');
    this.btnTap = document.getElementById('btnTap');
    this.btnReset = document.getElementById('btnReset');
    this.btnResetAll = document.getElementById('btnResetAll');
    this.btnSound = document.getElementById('btnSound');

    // Telemetry readouts
    this.readoutThetaC = document.getElementById('readoutThetaC');
    this.readoutN = document.getElementById('readoutN');
    this.readoutFriction = document.getElementById('readoutFriction');
    this.readoutAcc = document.getElementById('readoutAcc');
    this.readoutVel = document.getElementById('readoutVel');
    this.readoutTime = document.getElementById('readoutTime');

    // Modals
    this.btnTheory = document.getElementById('btnTheory');
    this.modalTheory = document.getElementById('modalTheory');
    this.btnCloseTheory = document.getElementById('btnCloseTheory');

    if (this.sliderAngle) {
      this.sliderAngle.addEventListener('input', (e) => {
        this.angleDeg = parseFloat(e.target.value);
        if (this.valAngle) this.valAngle.textContent = `${this.angleDeg.toFixed(1)}°`;
      });
    }

    if (this.sliderMass) {
      this.sliderMass.addEventListener('input', (e) => {
        this.blockMassKg = parseFloat(e.target.value);
        if (this.valMass) this.valMass.textContent = `${this.blockMassKg.toFixed(1)} kg`;
      });
    }

    if (this.selectMaterial) {
      this.selectMaterial.addEventListener('change', (e) => {
        this.currentMaterialId = e.target.value;
        this.resetBlock();
        this.sound.playClick();
      });
    }

    if (this.btnTap) {
      this.btnTap.addEventListener('click', () => {
        this.tapRelease();
        this.sound.playClick();
      });
    }

    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => {
        this.resetBlock();
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

  resetBlock() {
    this.blockPosM = 1.6;
    this.blockVelM = 0;
    this.blockAccM = 0;
    this.isSliding = false;
    this.gate1Passed = false;
    this.gate2Passed = false;
    this.gate1Time = 0;
    this.gate2Time = 0;
    this.v1 = 0;
    this.v2 = 0;
    this.sound.stopScrape();
  }

  resetAll() {
    this.resetBlock();
    this.angleDeg = 20;
    if (this.sliderAngle) this.sliderAngle.value = 20;
    if (this.valAngle) this.valAngle.textContent = '20.0°';
    this.blockMassKg = 5.0;
    if (this.sliderMass) this.sliderMass.value = 5.0;
    if (this.valMass) this.valMass.textContent = '5.0 kg';
    this.currentMaterialId = 'wood_wood';
    if (this.selectMaterial) this.selectMaterial.value = 'wood_wood';
  }

  tapRelease() {
    // A tap imparts a tiny initial perturbation to break static friction
    this.isSliding = true;
    this.blockVelM = Math.max(0.08, this.blockVelM);
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

  animate(now) {
    const dt = Math.min((now - this.lastFrameTime) / 1000, 0.05);
    this.lastFrameTime = now;

    const mat = this.materials[this.currentMaterialId];
    const rad = (this.angleDeg * Math.PI) / 180;
    const thetaCRad = Math.atan(mat.muS);
    const thetaCDeg = (thetaCRad * 180) / Math.PI;

    // Forces calculation
    const normalForce = this.blockMassKg * this.g * Math.cos(rad);
    const downhillGravity = this.blockMassKg * this.g * Math.sin(rad);
    const maxStaticFriction = mat.muS * normalForce;
    const kineticFriction = mat.muK * normalForce;

    let frictionForce = 0;

    // Static vs Kinetic friction logic
    if (!this.isSliding) {
      if (downhillGravity > maxStaticFriction) {
        // Tipping past critical angle of repose initiates sliding!
        this.isSliding = true;
      } else {
        // Static equilibrium: friction exactly opposes downhill gravity
        frictionForce = downhillGravity;
        this.blockAccM = 0;
        this.blockVelM = 0;
      }
    }

    if (this.isSliding) {
      frictionForce = kineticFriction;
      // Net downhill accelerating force: F_net = m*g*sin(theta) - mu_k*m*g*cos(theta)
      const fNet = downhillGravity - kineticFriction;
      this.blockAccM = fNet / this.blockMassKg;

      if (this.blockPosM > 0.06) {
        this.blockVelM += this.blockAccM * dt;

        // If downhill force is less than kinetic friction, block slows down
        if (this.blockVelM < 0) {
          this.blockVelM = 0;
          this.isSliding = false;
        }

        const oldPos = this.blockPosM;
        this.blockPosM = Math.max(0.06, this.blockPosM - this.blockVelM * dt);

        // Sound of scraping
        if (this.blockVelM > 0.05) {
          this.sound.startScrape(this.blockVelM);
        } else {
          this.sound.stopScrape();
        }

        // Photogate crossings (upper gate 2, then lower gate 1)
        if (oldPos >= this.gate2M && this.blockPosM < this.gate2M && !this.gate2Passed) {
          this.gate2Passed = true;
          this.gate2Time = now * 0.001;
          this.v2 = this.blockVelM;
          this.sound.playPhotogateBeep(1400);
        }

        if (oldPos >= this.gate1M && this.blockPosM < this.gate1M && !this.gate1Passed) {
          this.gate1Passed = true;
          this.gate1Time = now * 0.001;
          this.v1 = this.blockVelM;
          this.sound.playPhotogateBeep(1000);
        }
      } else {
        // Block reached end of ramp bumper
        this.blockVelM = 0;
        this.blockAccM = 0;
        this.isSliding = false;
        this.sound.stopScrape();
      }
    }

    this.render(rad, mat);
    this.updateTelemetry(thetaCDeg, normalForce, frictionForce);

    requestAnimationFrame(this.animate);
  }

  updateTelemetry(thetaC, normal, friction) {
    if (this.readoutThetaC) this.readoutThetaC.textContent = `${thetaC.toFixed(1)}°`;
    if (this.readoutN) this.readoutN.textContent = `${normal.toFixed(1)} N`;
    if (this.readoutFriction) this.readoutFriction.textContent = `${friction.toFixed(1)} N`;
    if (this.readoutAcc) this.readoutAcc.textContent = `${Math.max(0, this.blockAccM).toFixed(2)} m/s²`;
    if (this.readoutVel) this.readoutVel.textContent = `${this.blockVelM.toFixed(2)} m/s`;

    if (this.readoutTime) {
      if (this.gate1Passed && this.gate2Passed) {
        const deltaT = Math.abs(this.gate1Time - this.gate2Time);
        this.readoutTime.textContent = `${deltaT.toFixed(3)} s`;
      } else if (this.gate2Passed) {
        this.readoutTime.textContent = 'Timing Gate 1...';
      } else {
        this.readoutTime.textContent = '0.000 s';
      }
    }
  }

  render(rad, mat) {
    if (!this.ctx || this.width === 0) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Grid
    this.drawRoomGrid(ctx);

    // 2. Geometry
    const pivotX = this.width * 0.16;
    const pivotY = this.height * 0.82;
    const rampPxLen = Math.min(this.width * 0.70, 680);

    const endX = pivotX + rampPxLen * Math.cos(rad);
    const endY = pivotY - rampPxLen * Math.sin(rad);

    // 3. Lab Bench Base & Ground Table
    this.drawLabBench(ctx, pivotX, pivotY, rampPxLen);

    // 4. Heavy Brass Protractor Arc with Degrees
    this.drawBrassProtractor(ctx, pivotX, pivotY, rad);

    // 5. Incline Elevation Jack Mechanism under right end
    this.drawElevationJack(ctx, endX, pivotY, endY);

    // 6. Incline Track Board with Material Texture & Metric Ruler
    this.drawInclineTrack(ctx, pivotX, pivotY, endX, endY, rad, rampPxLen, mat);

    // 7. Infrared Optical Photogates
    this.drawPhotogates(ctx, pivotX, pivotY, rad, rampPxLen);

    // 8. 3D Sliding Block & Free Body Diagram Vectors
    this.drawBlockAndFBD(ctx, pivotX, pivotY, rad, rampPxLen, mat);
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

  drawLabBench(ctx, px, py, len) {
    ctx.save();
    // Heavy lab bench horizontal top
    const benchW = len + 100;
    const startX = px - 40;

    const benchGrad = ctx.createLinearGradient(0, py, 0, py + 16);
    benchGrad.addColorStop(0, '#E2E8F0');
    benchGrad.addColorStop(1, '#CBD5E1');
    ctx.fillStyle = benchGrad;
    ctx.fillRect(startX, py, benchW, 16);

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(startX, py + 1);
    ctx.lineTo(startX + benchW, py + 1);
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.fillRect(startX, py + 16, benchW, this.height - py - 16);

    // Heavy cast iron pivot bracket at (px, py)
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(px - 14, py - 14, 28, 20, [6, 6, 2, 2]);
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Pivot brass bolt center
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.arc(px, py - 4, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawBrassProtractor(ctx, px, py, rad) {
    ctx.save();
    const arcR = 85;

    // Brass quadrant fill
    ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, arcR, 0, -rad, true);
    ctx.closePath();
    ctx.fill();

    // Brass border
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Degree tick marks (every 10°)
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 1;
    ctx.font = '600 8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#78350F';
    ctx.textAlign = 'center';

    for (let deg = 0; deg <= 60; deg += 10) {
      const a = (-deg * Math.PI) / 180;
      const innerR = deg % 30 === 0 ? arcR - 12 : arcR - 6;
      const x1 = px + innerR * Math.cos(a);
      const y1 = py + innerR * Math.sin(a);
      const x2 = px + arcR * Math.cos(a);
      const y2 = py + arcR * Math.sin(a);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      if (deg > 0 && deg % 20 === 0) {
        const tx = px + (arcR - 20) * Math.cos(a);
        const ty = py + (arcR - 20) * Math.sin(a);
        ctx.fillText(`${deg}°`, tx, ty + 3);
      }
    }

    // Live angle readout badge
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0284C7';
    ctx.textAlign = 'left';
    ctx.fillText(`θ = ${this.angleDeg.toFixed(1)}°`, px + arcR + 10, py - 12);

    ctx.restore();
  }

  drawElevationJack(ctx, endX, baseY, endY) {
    ctx.save();
    // Vertical chrome support rod
    const rodW = 8;
    const rodGrad = ctx.createLinearGradient(endX - rodW / 2, 0, endX + rodW / 2, 0);
    rodGrad.addColorStop(0, '#94A3B8');
    rodGrad.addColorStop(0.3, '#F8FAFC');
    rodGrad.addColorStop(0.8, '#64748B');

    ctx.fillStyle = rodGrad;
    ctx.fillRect(endX - rodW / 2, endY, rodW, baseY - endY);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(endX - rodW / 2, endY, rodW, baseY - endY);

    // Heavy round base foot on table
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(endX - 22, baseY - 8, 44, 8, 3);
    ctx.fill();

    // Knurled brass elevation adjustment screw knob
    const knobY = (endY + baseY) * 0.5;
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.roundRect(endX - 12, knobY - 8, 24, 16, 3);
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  drawInclineTrack(ctx, px, py, ex, ey, rad, rampPxLen, mat) {
    const rampThickness = 16;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-rad);

    // Track Body Gradient based on material
    const trackGrad = ctx.createLinearGradient(0, 0, 0, rampThickness);
    if (mat.style === 'wood') {
      trackGrad.addColorStop(0, '#FEF3C7');
      trackGrad.addColorStop(0.5, '#FDE68A');
      trackGrad.addColorStop(1, '#D97706');
    } else if (mat.style === 'steel') {
      trackGrad.addColorStop(0, '#F1F5F9');
      trackGrad.addColorStop(0.5, '#CBD5E1');
      trackGrad.addColorStop(1, '#64748B');
    } else if (mat.style === 'concrete') {
      trackGrad.addColorStop(0, '#E2E8F0');
      trackGrad.addColorStop(1, '#64748B');
    } else if (mat.style === 'ice') {
      trackGrad.addColorStop(0, '#F0F9FF');
      trackGrad.addColorStop(0.5, '#BAE6FD');
      trackGrad.addColorStop(1, '#0284C7');
    } else {
      trackGrad.addColorStop(0, '#D97706');
      trackGrad.addColorStop(1, '#78350F');
    }

    ctx.fillStyle = trackGrad;
    ctx.fillRect(0, 0, rampPxLen, rampThickness);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(0, 0, rampPxLen, rampThickness);

    // Metric Scale in Centimeters along side of track
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.lineWidth = 0.8;
    ctx.font = '600 7px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.textAlign = 'center';

    const numCm = 20;
    const cmStepPx = rampPxLen / numCm;
    for (let c = 0; c <= numCm; c++) {
      const x = c * cmStepPx;
      const isMajor = c % 5 === 0;
      const tickH = isMajor ? 8 : 4;
      ctx.beginPath();
      ctx.moveTo(x, rampThickness);
      ctx.lineTo(x, rampThickness - tickH);
      ctx.stroke();

      if (isMajor && c > 0 && c < numCm) {
        ctx.fillText(`${c * 10}`, x, rampThickness - 10);
      }
    }

    // End Stop / Bumper Block at bottom
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(0, -18, 8, 18);
    ctx.strokeRect(0, -18, 8, 18);

    ctx.restore();
  }

  drawPhotogates(ctx, px, py, rad, rampPxLen) {
    const drawGate = (gateM, label, passed) => {
      const frac = gateM / this.trackLengthM;
      const gateDistPx = frac * rampPxLen;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-rad);
      ctx.translate(gateDistPx, 0);

      // Gate Clamp U-Frame
      const frameW = 12;
      const frameH = 46;
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.roundRect(-frameW / 2, -frameH, frameW, frameH, 3);
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Infrared Optical Beam emitter line (flashes amber when active)
      ctx.strokeStyle = passed ? '#F59E0B' : 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, -frameH + 10);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.setLineDash([]);

      // Status Indicator LED on gate top
      ctx.fillStyle = passed ? '#F59E0B' : '#10B981';
      ctx.beginPath();
      ctx.arc(0, -frameH + 6, 3.0, 0, Math.PI * 2);
      ctx.fill();

      // Gate Name Label
      ctx.font = '700 8px "JetBrains Mono", monospace';
      ctx.fillStyle = '#0284C7';
      ctx.textAlign = 'center';
      ctx.fillText(label, 0, -frameH - 5);

      ctx.restore();
    };

    drawGate(this.gate1M, 'GATE 1', this.gate1Passed);
    drawGate(this.gate2M, 'GATE 2', this.gate2Passed);
  }

  drawBlockAndFBD(ctx, px, py, rad, rampPxLen, mat) {
    const frac = this.blockPosM / this.trackLengthM;
    const blockDistPx = frac * rampPxLen;
    const blockW = 48;
    const blockH = 34;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-rad);
    ctx.translate(blockDistPx, 0);

    // 1. 3D Block
    ctx.save();
    // Block material fill
    const bGrad = ctx.createLinearGradient(0, -blockH, 0, 0);
    if (mat.style === 'wood') {
      bGrad.addColorStop(0, '#FDE68A');
      bGrad.addColorStop(1, '#B45309');
    } else if (mat.style === 'steel') {
      bGrad.addColorStop(0, '#F8FAFC');
      bGrad.addColorStop(0.5, '#CBD5E1');
      bGrad.addColorStop(1, '#475569');
    } else if (mat.style === 'concrete') {
      bGrad.addColorStop(0, '#475569');
      bGrad.addColorStop(1, '#0F172A');
    } else if (mat.style === 'ice') {
      bGrad.addColorStop(0, '#E0F2FE');
      bGrad.addColorStop(1, '#0284C7');
    } else {
      bGrad.addColorStop(0, '#92400E');
      bGrad.addColorStop(1, '#451A03');
    }

    ctx.fillStyle = bGrad;
    ctx.beginPath();
    ctx.roundRect(-blockW / 2, -blockH, blockW, blockH, 3);
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Mass Stamp Text on block face
    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.fillStyle = mat.style === 'concrete' || mat.style === 'sandpaper' ? '#FFFFFF' : '#0F172A';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.blockMassKg.toFixed(1)}kg`, 0, -blockH / 2 + 3.5);
    ctx.restore();

    // Center of Mass (CM) coordinates
    const cmX = 0;
    const cmY = -blockH / 2;

    // 2. Free Body Diagram (FBD) Glowing Vector Arrows
    // Vector scale: 1 N = 1.8 px
    const scale = 1.6;
    const normalVal = this.blockMassKg * this.g * Math.cos(rad);
    const gravityVal = this.blockMassKg * this.g;
    const downhillVal = this.blockMassKg * this.g * Math.sin(rad);

    // Vector 1: Normal Reaction Force N (Perpendicular upwards: (0, -normalVal*scale))
    const nLen = normalVal * scale;
    this.drawArrow(ctx, cmX, cmY, cmX, cmY - nLen, '#10B981', `N = ${normalVal.toFixed(0)}N`);

    // Vector 2: Friction Force f (Pointing uphill along track: (+f*scale, 0))
    const matObj = this.materials[this.currentMaterialId];
    const fVal = this.isSliding ? (matObj.muK * normalVal) : Math.min(downhillVal, matObj.muS * normalVal);
    const fLen = fVal * scale;
    this.drawArrow(ctx, cmX, cmY, cmX + fLen, cmY, '#F59E0B', `f = ${fVal.toFixed(0)}N`);

    // Vector 3: True Gravity W = mg (Straight Downwards in World Frame!)
    // To draw in world frame downwards, rotate back by +rad
    ctx.save();
    ctx.translate(cmX, cmY);
    ctx.rotate(rad);
    const mgLen = gravityVal * scale;
    this.drawArrow(ctx, 0, 0, 0, mgLen, '#EF4444', `mg = ${gravityVal.toFixed(0)}N`);
    ctx.restore();

    ctx.restore();
  }

  drawArrow(ctx, x1, y1, x2, y2, color, label) {
    const headLen = 8;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Text Label
    if (label) {
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      const offset = 12;
      const lx = x2 + offset * Math.cos(angle);
      const ly = y2 + offset * Math.sin(angle);
      ctx.fillText(label, lx, ly + 3);
    }

    ctx.restore();
  }
}

// Instantiate simulation when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.sim = new InclinedPlaneSimulation();
});
