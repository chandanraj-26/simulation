/**
 * Faraday's & Lenz's Law of Electromagnetic Induction Virtual Laboratory
 * NCERT Class 10 & 12 Physics
 * 
 * High-Fidelity Physics & Graphics Engine:
 * - Full pass-through kinematics: magnet crosses completely through the coil from side to side
 * - Machined lab flywheel & piston drive rod with true physical crank linkage
 * - Open axial tunnel: magnet glides smoothly inside the coil aperture in all modes
 * - Concentric outer soft iron flux sleeve (never blocks the central bore!)
 * - Warping magnetic field streamlines that compress/stretch according to Lenz's law
 * - Expanding magnetic shockwave ripples visualizing Lenz's opposing force
 * - Ballistic hairspring galvanometer needle with mirrored scale shadow
 * - Incandescent tungsten filament thermal glow & dual bipolar LEDs
 * - Dual-trace live oscilloscope strip chart (Flux vs Induced EMF)
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.humOsc = null;
    this.humGain = null;
    this.lastTickTime = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playTick(pitch = 1200) {
    if (!this.enabled) return;
    const now = Date.now();
    if (now - this.lastTickTime < 45) return;
    this.lastTickTime = now;

    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.35, this.ctx.currentTime + 0.035);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.035);
  }

  playSnap() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(760, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playClink() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  updateHum(frequency, amplitude) {
    if (!this.enabled || amplitude < 0.015) {
      if (this.humOsc) {
        try {
          this.humGain.gain.setValueAtTime(0, this.ctx.currentTime);
          this.humOsc.stop();
          this.humOsc.disconnect();
        } catch (e) {}
        this.humOsc = null;
        this.humGain = null;
      }
      return;
    }

    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    if (!this.humOsc) {
      this.humOsc = this.ctx.createOscillator();
      this.humGain = this.ctx.createGain();
      this.humOsc.type = 'sine';
      this.humOsc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      this.humGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.humOsc.connect(this.humGain);
      this.humGain.connect(this.ctx.destination);
      this.humOsc.start();
    } else {
      this.humOsc.frequency.setValueAtTime(Math.max(50, Math.min(650, frequency)), this.ctx.currentTime);
      const targetGain = Math.min(0.09, amplitude * 0.07);
      this.humGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
  }
}

class FaradayLenzSimulation {
  constructor() {
    this.canvas = document.getElementById('simCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundEngine();

    // Coil geometry & electrical parameters
    this.coil = {
      x: 0,
      y: 0,
      width: 140, // compact width so magnet easily passes completely through
      radius: 46,
      innerRadius: 36, // open axial bore
      turns: 400,
      coreMu: 1.0, // 1.0 = Air, 45.0 = Soft Iron
      resistance: 4.8 // ohms
    };

    // Magnet properties
    this.magnet = {
      x: 0,
      y: 0,
      width: 100, // compact 100px bar magnet
      height: 32,
      vx: 0,
      vy: 0,
      strength: 1.0,
      flipped: false, // false: N on right, S on left
      isDragging: false,
      dragOffsetX: 0,
      dragOffsetY: 0,
      prevX: 0,
      prevY: 0
    };

    // Kinematics modes: 'manual', 'shaker', 'drop'
    this.motionMode = 'manual';

    // Mechanical Crank Shaker (Heavy Brass Flywheel + Steel Piston Rod)
    this.shaker = {
      freq: 1.2, // Hz
      phase: 0,
      amplitude: 155, // Full stroke: passes completely through coil
      flywheelRadius: 48,
      crankRadius: 36,
      pivotX: 0,
      pivotY: 0
    };

    // Gravity Drop Tower
    this.drop = {
      active: false,
      y: 0,
      vy: 0,
      startY: 0,
      g: 1650 // px/s^2
    };

    // Electromagnetic state
    this.flux = 0; // Wb
    this.prevFlux = 0;
    this.dFluxDt = 0; // Wb/s
    this.inducedEMF = 0; // V
    this.inducedCurrent = 0; // A
    this.lenzForce = 0; // N
    this.coilFacePolarity = null; // 'N', 'S', or null

    // Shockwave ripple pulses (Lenz magnetic barrier)
    this.shockRipples = [];

    // Circuit Load: 'galvo' or 'bulb'
    this.loadType = 'galvo';

    // Galvanometer needle physics (ballistic damped spring)
    this.galvo = {
      x: 0,
      y: 0,
      radius: 64,
      needleAngle: 0,
      angularVel: 0,
      targetAngle: 0,
      maxCurrent: 50e-6 // 50 uA full scale
    };

    // Thermal filament glow & LED states
    this.filamentTemp = 300; // Kelvin
    this.bulbBrightness = 0;
    this.ledGreenGlow = 0;
    this.ledRedGlow = 0;

    // Dual-Trace Oscilloscope History
    this.chartHistory = [];
    this.chartMaxSamples = 180;
    this.simTime = 0;

    // Visual diagnostic overlays
    this.showFieldLines = true;
    this.showLenz = true;
    this.showCurrentFlow = true;

    // Helical Current Particles
    this.helicalParticles = [];
    this.initHelicalParticles(64);

    // Responsive Geometry
    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    this.initDOM();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.setupInteractions();

    this.lastFrameTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initHelicalParticles(count) {
    this.helicalParticles = [];
    for (let i = 0; i < count; i++) {
      this.helicalParticles.push({
        phase: i / count,
        speedFactor: 0.8 + Math.random() * 0.4
      });
    }
  }

  initDOM() {
    this.sliderTurns = document.getElementById('sliderTurns');
    this.valTurns = document.getElementById('valTurns');
    this.selectCore = document.getElementById('selectCore');
    this.selectLoad = document.getElementById('selectLoad');

    this.selectMotionMode = document.getElementById('selectMotionMode');
    this.sliderFreq = document.getElementById('sliderFreq');
    this.valFreq = document.getElementById('valFreq');
    this.shakerControls = document.getElementById('shakerControls');
    this.sliderStrength = document.getElementById('sliderStrength');
    this.valStrength = document.getElementById('valStrength');
    this.btnFlipMagnet = document.getElementById('btnFlipMagnet');
    this.btnDropMagnet = document.getElementById('btnDropMagnet');
    this.motionStatusBadge = document.getElementById('motionStatusBadge');

    this.chkFieldLines = document.getElementById('chkFieldLines');
    this.chkLenz = document.getElementById('chkLenz');
    this.chkCurrentFlow = document.getElementById('chkCurrentFlow');

    this.readoutVel = document.getElementById('readoutVel');
    this.readoutFlux = document.getElementById('readoutFlux');
    this.readoutEMF = document.getElementById('readoutEMF');
    this.readoutCurrent = document.getElementById('readoutCurrent');
    this.readoutLenzStatus = document.getElementById('readoutLenzStatus');

    // Audio button
    this.btnAudio = document.getElementById('btnAudioToggle');
    this.btnAudio.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.btnAudio.textContent = this.sound.enabled ? '🔊 Sound: ON' : '🔈 Sound: OFF';
      if (this.sound.enabled) this.sound.playSnap();
    });

    // Reset All button
    document.getElementById('btnResetAll').addEventListener('click', () => {
      this.coil.turns = 400;
      this.sliderTurns.value = 400;
      this.valTurns.textContent = '400 turns';

      this.coil.coreMu = 1.0;
      this.selectCore.value = '1';

      this.loadType = 'galvo';
      this.selectLoad.value = 'galvo';

      this.motionMode = 'manual';
      this.selectMotionMode.value = 'manual';
      this.shakerControls.style.display = 'none';
      this.btnDropMagnet.style.display = 'none';
      this.motionStatusBadge.textContent = 'Manual Drag Mode (Full Axis Range)';

      this.magnet.strength = 1.0;
      this.sliderStrength.value = 1.0;
      this.valStrength.textContent = '1.0×';
      this.magnet.flipped = false;

      this.resetMagnetPosition();
      this.chartHistory = [];
      this.sound.playSnap();
    });

    // Theory modal
    const theoryModal = document.getElementById('modalTheory');
    document.getElementById('btnOpenTheory').addEventListener('click', () => {
      theoryModal.classList.add('open');
      this.sound.playSnap();
    });
    document.getElementById('btnCloseTheory').addEventListener('click', () => {
      theoryModal.classList.remove('open');
    });
    theoryModal.addEventListener('click', (e) => {
      if (e.target === theoryModal) theoryModal.classList.remove('open');
    });

    // Control listeners
    this.sliderTurns.addEventListener('input', (e) => {
      this.coil.turns = parseInt(e.target.value, 10);
      this.coil.resistance = (this.coil.turns * 0.012).toFixed(1);
      this.valTurns.textContent = `${this.coil.turns} turns`;
    });

    this.selectCore.addEventListener('change', (e) => {
      this.coil.coreMu = parseFloat(e.target.value);
      this.sound.playSnap();
    });

    this.selectLoad.addEventListener('change', (e) => {
      this.loadType = e.target.value;
      this.sound.playSnap();
    });

    this.selectMotionMode.addEventListener('change', (e) => {
      this.motionMode = e.target.value;
      if (this.motionMode === 'shaker') {
        this.shakerControls.style.display = 'block';
        this.btnDropMagnet.style.display = 'none';
        this.motionStatusBadge.textContent = 'AC Shaker: Full Pass-Through Active';
        this.shaker.phase = -Math.PI / 2; // start on the left outside
      } else if (this.motionMode === 'drop') {
        this.shakerControls.style.display = 'none';
        this.btnDropMagnet.style.display = 'block';
        this.motionStatusBadge.textContent = 'Drop Tower Ready (Click Drop)';
        this.resetMagnetForDrop();
      } else {
        this.shakerControls.style.display = 'none';
        this.btnDropMagnet.style.display = 'none';
        this.motionStatusBadge.textContent = 'Manual Drag Mode (Full Axis Range)';
        this.resetMagnetPosition();
      }
      this.sound.playSnap();
    });

    this.sliderFreq.addEventListener('input', (e) => {
      this.shaker.freq = parseFloat(e.target.value);
      this.valFreq.textContent = `${this.shaker.freq.toFixed(1)} Hz`;
    });

    this.sliderStrength.addEventListener('input', (e) => {
      this.magnet.strength = parseFloat(e.target.value);
      this.valStrength.textContent = `${this.magnet.strength.toFixed(1)}×`;
    });

    this.btnFlipMagnet.addEventListener('click', () => {
      this.magnet.flipped = !this.magnet.flipped;
      this.sound.playSnap();
    });

    this.btnDropMagnet.addEventListener('click', () => {
      this.triggerDrop();
    });

    // Toggles
    this.chkFieldLines.addEventListener('change', (e) => {
      this.showFieldLines = e.target.checked;
    });
    this.chkLenz.addEventListener('change', (e) => {
      this.showLenz = e.target.checked;
    });
    this.chkCurrentFlow.addEventListener('change', (e) => {
      this.showCurrentFlow = e.target.checked;
    });
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Apparatus proportional layout
    // Center coil horizontally in the left-to-middle bench zone
    this.coil.x = this.width * 0.45;
    this.coil.y = this.height * 0.38;
    this.coil.width = Math.min(150, this.width * 0.22);
    this.coil.radius = Math.min(52, this.height * 0.13);
    this.coil.innerRadius = this.coil.radius * 0.78;

    // Galvanometer / Load on the right
    this.galvo.x = this.width * 0.85;
    this.galvo.y = this.height * 0.28;
    this.galvo.radius = Math.min(68, this.width * 0.11);

    // Shaker Crank Flywheel on the far left
    this.shaker.pivotX = Math.max(50, this.width * 0.11);
    this.shaker.pivotY = this.coil.y;

    // Amplitude guaranteed to cross completely through and out both sides:
    // Coil extends from coil.x - coil.width/2 to coil.x + coil.width/2.
    // Magnet has width 100px.
    // Minimum amplitude for full clearance = coil.width/2 + magnet.width/2 + 25px
    this.shaker.amplitude = (this.coil.width * 0.5) + (this.magnet.width * 0.5) + 35;

    if (this.motionMode === 'drop') {
      this.resetMagnetForDrop();
    } else {
      if (this.magnet.x === 0) {
        this.resetMagnetPosition();
      } else {
        this.magnet.y = this.coil.y;
      }
    }
  }

  resetMagnetPosition() {
    // Start cleanly on the left side, ready to be plunged
    this.magnet.x = this.coil.x - this.shaker.amplitude;
    this.magnet.y = this.coil.y;
    this.magnet.prevX = this.magnet.x;
    this.magnet.prevY = this.magnet.y;
    this.magnet.vx = 0;
    this.magnet.vy = 0;
  }

  resetMagnetForDrop() {
    this.magnet.x = this.coil.x;
    this.magnet.y = this.height * 0.10;
    this.magnet.prevX = this.magnet.x;
    this.magnet.prevY = this.magnet.y;
    this.magnet.vx = 0;
    this.magnet.vy = 0;
    this.drop.active = false;
  }

  triggerDrop() {
    this.resetMagnetForDrop();
    this.drop.active = true;
    this.drop.y = this.magnet.y;
    this.drop.vy = 0;
    this.sound.playSnap();
  }

  setupInteractions() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const handlePointerDown = (e) => {
      if (this.motionMode !== 'manual') return;
      const pos = getPos(e);
      const m = this.magnet;
      const hitRadius = Math.max(m.width * 0.55, m.height * 1.2);
      const dist = Math.hypot(pos.x - m.x, pos.y - m.y);

      if (dist <= hitRadius + 18) {
        m.isDragging = true;
        m.dragOffsetX = m.x - pos.x;
        m.dragOffsetY = m.y - pos.y;
        this.canvas.style.cursor = 'grabbing';
        this.sound.playSnap();
      }
    };

    const handlePointerMove = (e) => {
      const pos = getPos(e);
      const m = this.magnet;
      if (m.isDragging && this.motionMode === 'manual') {
        const targetX = pos.x + m.dragOffsetX;
        // Allow full horizontal traverse: from far left (50px) past the coil to right side (up to load entrance)
        const maxRight = this.galvo.x - this.galvo.radius - m.width * 0.5 - 20;
        m.x = Math.max(60, Math.min(maxRight, targetX));
        m.y = this.coil.y; // constrained along coil center bore
      } else {
        const hitRadius = Math.max(m.width * 0.55, m.height * 1.2);
        const dist = Math.hypot(pos.x - m.x, pos.y - m.y);
        this.canvas.style.cursor = (dist <= hitRadius + 18 && this.motionMode === 'manual') ? 'grab' : 'crosshair';
      }
    };

    const handlePointerUp = () => {
      if (this.magnet.isDragging) {
        this.magnet.isDragging = false;
        this.canvas.style.cursor = 'grab';
      }
    };

    this.canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    this.canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
  }

  // =========================================================================
  // PHYSICS & ELECTROMAGNETIC CORE
  // =========================================================================
  computePhysics(dt) {
    const m = this.magnet;
    const c = this.coil;

    // 1. Update Magnet Kinematics
    if (this.motionMode === 'shaker') {
      // Harmonic Crank Kinematics: Magnet executes pure sinusoidal oscillation
      // centered EXACTLY at the coil center (c.x), crossing all the way through!
      this.shaker.phase += 2 * Math.PI * this.shaker.freq * dt;

      const prevX = m.x;
      // Magnet oscillates from c.x - amplitude (far left) to c.x + amplitude (far right)
      m.x = c.x + Math.sin(this.shaker.phase) * this.shaker.amplitude;
      m.y = c.y;
      m.vx = (m.x - prevX) / dt;
      m.vy = 0;
    } else if (this.motionMode === 'drop') {
      if (this.drop.active) {
        m.vy += this.drop.g * dt;
        m.y += m.vy * dt;
        m.vx = m.vy; // project downward speed into axial calculation
        m.x = c.x;

        const floorY = this.height * 0.72;
        if (m.y >= floorY) {
          m.y = floorY;
          this.drop.active = false;
          m.vy = 0;
          m.vx = 0;
          this.sound.playClink();
        }
      }
    } else {
      // Manual drag mode velocity with responsive smoothing
      const instantVx = (m.x - m.prevX) / Math.max(dt, 0.001);
      m.vx += (instantVx - m.vx) * Math.min(1.0, dt * 28);
      m.prevX = m.x;
      m.prevY = m.y;
    }

    // 2. Magnetic Flux Analytical Integration
    const pxToMeters = 0.1 / 180;
    const dx = (this.motionMode === 'drop' ? (m.y - c.y) : (m.x - c.x)) * pxToMeters;
    const coilRadiusM = c.radius * pxToMeters;

    const dipoleSign = m.flipped ? -1.0 : 1.0;
    const M = 2.0e-3 * m.strength * dipoleSign;

    const mu0 = 4 * Math.PI * 1e-7;
    const denom = Math.pow(dx * dx + coilRadiusM * coilRadiusM, 1.5);
    const fluxWb = (c.coreMu * mu0 * M * Math.PI * coilRadiusM * coilRadiusM) / (2 * denom);

    this.prevFlux = this.flux;
    this.flux = fluxWb;

    // 3. Faraday's Law Rate of Change: 𝓔 = -N * dΦ/dt
    const denom52 = Math.pow(dx * dx + coilRadiusM * coilRadiusM, 2.5);
    const dPhiDx = -1.5 * (c.coreMu * mu0 * M * Math.PI * coilRadiusM * coilRadiusM * 2 * dx) / (2 * denom52);

    const vxMeters = (this.motionMode === 'drop' ? m.vy : m.vx) * pxToMeters;
    this.dFluxDt = dPhiDx * vxMeters;

    this.inducedEMF = -c.turns * this.dFluxDt; // Volts

    const totalR = c.resistance + 15.0; // 15 ohms meter load
    this.inducedCurrent = this.inducedEMF / totalR; // Amperes

    // 4. Lenz's Law: Counter-Field & Opposing Force
    this.lenzForce = -this.inducedCurrent * m.strength * 14.0;

    if (Math.abs(this.inducedEMF) > 0.0003) {
      if (this.inducedCurrent > 0) {
        this.coilFacePolarity = m.flipped ? 'S' : 'N';
      } else {
        this.coilFacePolarity = m.flipped ? 'N' : 'S';
      }

      // Spawn glowing magnetic ripple waves at coil mouth when moving fast
      if (Math.abs(vxMeters) > 0.12 && Math.random() < 0.45) {
        const rimX = m.x < c.x ? c.x - c.width / 2 : c.x + c.width / 2;
        this.shockRipples.push({
          x: rimX,
          y: c.y,
          rx: 10,
          ry: c.radius * 0.8,
          dir: Math.sign(m.vx),
          alpha: 0.9,
          color: this.coilFacePolarity === 'N' ? '#DC2626' : '#2563EB'
        });
      }
    } else {
      this.coilFacePolarity = null;
    }

    // Update expanding magnetic ripple waves
    for (let i = this.shockRipples.length - 1; i >= 0; i--) {
      const rip = this.shockRipples[i];
      rip.rx += 95 * dt;
      rip.ry += 40 * dt;
      rip.x += rip.dir * 45 * dt;
      rip.alpha -= dt * 1.8;
      if (rip.alpha <= 0) {
        this.shockRipples.splice(i, 1);
      }
    }

    // 5. Galvanometer Needle Physics (Ballistic Inertia + Hairspring)
    const maxI = this.galvo.maxCurrent;
    this.galvo.targetAngle = Math.max(-0.72, Math.min(0.72, (this.inducedCurrent / maxI) * 0.72));

    const angleDiff = this.galvo.targetAngle - this.galvo.needleAngle;
    const springK = 42.0;
    const damping = 9.2;
    const torque = angleDiff * springK;

    this.galvo.angularVel += (torque - this.galvo.angularVel * damping) * dt;
    this.galvo.needleAngle += this.galvo.angularVel * dt;

    if (Math.abs(this.galvo.angularVel) > 1.3 && Math.random() < 0.25) {
      this.sound.playTick(950 + Math.abs(this.galvo.needleAngle) * 450);
    }

    // 6. Thermal Incandescent Bulb & Dual LEDs
    const absEMF = Math.abs(this.inducedEMF);
    const targetFilamentTemp = 300 + Math.min(2500, Math.pow(absEMF / 0.035, 1.8) * 2200);
    this.filamentTemp += (targetFilamentTemp - this.filamentTemp) * Math.min(1.0, dt * 12);
    this.bulbBrightness = Math.max(0, (this.filamentTemp - 800) / 1900);

    if (this.inducedCurrent > 1.2e-6) {
      this.ledGreenGlow = Math.min(1.0, this.inducedCurrent / 22e-6);
      this.ledRedGlow = 0;
    } else if (this.inducedCurrent < -1.2e-6) {
      this.ledRedGlow = Math.min(1.0, -this.inducedCurrent / 22e-6);
      this.ledGreenGlow = 0;
    } else {
      this.ledGreenGlow = 0;
      this.ledRedGlow = 0;
    }

    // Audio hum in shaker mode
    if (this.motionMode === 'shaker') {
      this.sound.updateHum(this.shaker.freq * 120, Math.min(1.0, absEMF * 45));
    } else {
      this.sound.updateHum(0, 0);
    }

    // 7. Live Dual-Trace Oscilloscope History
    this.simTime += dt;
    if (this.chartHistory.length === 0 || this.simTime - this.chartHistory[this.chartHistory.length - 1].time >= 0.03) {
      this.chartHistory.push({
        time: this.simTime,
        flux: this.flux * 1e6, // uWb
        emf: this.inducedEMF * 1e3 // mV
      });
      if (this.chartHistory.length > this.chartMaxSamples) {
        this.chartHistory.shift();
      }
    }
  }

  animate(now) {
    const dt = Math.min((now - this.lastFrameTime) / 1000, 0.05);
    this.lastFrameTime = now;

    this.computePhysics(dt);
    this.render();
    this.updateTelemetry();

    requestAnimationFrame(this.animate);
  }

  updateTelemetry() {
    const v = (this.motionMode === 'drop' ? this.magnet.vy : this.magnet.vx) * (0.1 / 180);
    this.readoutVel.textContent = `${v.toFixed(2)} m/s`;

    const fluxUWb = (this.flux * 1e6).toFixed(2);
    this.readoutFlux.textContent = `${fluxUWb} µWb`;

    const emfMV = (this.inducedEMF * 1e3).toFixed(1);
    this.readoutEMF.textContent = `${emfMV} mV`;

    const currUA = (this.inducedCurrent * 1e6).toFixed(1);
    this.readoutCurrent.textContent = `${currUA} µA`;

    if (this.coilFacePolarity) {
      const polText = this.coilFacePolarity === 'N' ? 'Facing: NORTH (Repulsive)' : 'Facing: SOUTH (Attractive)';
      this.readoutLenzStatus.textContent = polText;
      this.readoutLenzStatus.style.color = this.coilFacePolarity === 'N' ? '#DC2626' : '#2563EB';
    } else {
      this.readoutLenzStatus.textContent = 'Coil Face: Inactive';
      this.readoutLenzStatus.style.color = 'var(--text-muted)';
    }
  }

  // =========================================================================
  // HIGH-FIDELITY RENDERER
  // =========================================================================
  render() {
    if (!this.ctx || this.width === 0) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Grid & Countertop Table
    this.drawRoomGrid(ctx);

    const benchY = this.height * 0.54;
    this.drawBenchTop(ctx, benchY);

    // 2. Drop Tower Guide (if in Drop mode)
    if (this.motionMode === 'drop') {
      this.drawDropTowerGuide(ctx);
    }

    // 3. Circuit Flexible Twisted Copper Connecting Leads
    this.drawConnectingWires(ctx);

    // 4. Load Instrument (Galvanometer vs. Bulb & Dual LEDs)
    if (this.loadType === 'galvo') {
      this.drawCenterZeroGalvanometer(ctx);
    } else {
      this.drawBulbAndDualLEDs(ctx);
    }

    // =======================================================================
    // 3D Z-DEPTH SORTED SOLENOID & FULL PASS-THROUGH MAGNET
    // =======================================================================
    // A. Back half of the helical copper coil loops (-Z)
    this.drawCoilLoops(ctx, 'back');

    // B. The 3D Bar Magnet (Passes cleanly THROUGH the hollow central aperture!)
    this.drawBarMagnet(ctx);

    // C. The Concentric Outer Ferromagnetic Sleeve (Soft Iron) or Clear Acrylic Outer Shell
    this.drawCoilOuterSleeve(ctx);

    // D. Front half of the helical copper coil loops (+Z, over magnet!)
    this.drawCoilLoops(ctx, 'front');

    // E. Mechanical Shaker Crankshaft Engine (drawn in front of bench)
    if (this.motionMode === 'shaker') {
      this.drawMechanicalCrankEngine(ctx);
    }

    // F. Dynamic Magnetic Field Streamlines with Lenz Warping
    if (this.showFieldLines) {
      this.drawWarpedFieldStreamlines(ctx);
    }

    // G. Expanding Magnetic Barrier Ripples (Lenz shockwaves)
    this.drawMagneticRipples(ctx);

    // H. Lenz Polarity Emblems & Opposing Force Vectors
    if (this.showLenz && this.coilFacePolarity) {
      this.drawLenzDiagnostics(ctx);
    }

    // 5. Live Dual-Trace Oscilloscope Strip Chart
    this.drawOscilloscopeChart(ctx);
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

  drawBenchTop(ctx, benchY) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
    ctx.fillRect(0, benchY, this.width, 10);

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

    ctx.fillStyle = '#334155';
    ctx.fillRect(0, benchY + 16, this.width, this.height - benchY - 16);

    // Precision Millimeter scale etched into the bench rail
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.lineWidth = 0.8;
    ctx.font = '600 7px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.textAlign = 'center';

    for (let x = 40; x < this.width - 40; x += 15) {
      const isMajor = (x - 40) % 60 === 0;
      const tickH = isMajor ? 7 : 3.5;
      ctx.beginPath();
      ctx.moveTo(x, benchY + 8);
      ctx.lineTo(x, benchY + 8 - tickH);
      ctx.stroke();

      if (isMajor) {
        ctx.fillText(`${(x - 40) / 15}`, x, benchY + 14);
      }
    }

    ctx.restore();
  }

  // =========================================================================
  // PRECISION MACHINED CRANKSHAFT ENGINE
  // =========================================================================
  drawMechanicalCrankEngine(ctx) {
    const s = this.shaker;
    const m = this.magnet;

    ctx.save();

    // 1. Heavy Cast-Iron Bench Pedestal Base
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(s.pivotX - 32, s.pivotY + 28, 64, 18, [4, 4, 2, 2]);
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 2. Machined Chrome/Brass Industrial Flywheel
    ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    const rWheel = s.flywheelRadius;
    const wheelGrad = ctx.createRadialGradient(s.pivotX, s.pivotY, 6, s.pivotX, s.pivotY, rWheel);
    wheelGrad.addColorStop(0, '#CBD5E1');
    wheelGrad.addColorStop(0.3, '#F1F5F9');
    wheelGrad.addColorStop(0.7, '#94A3B8');
    wheelGrad.addColorStop(1, '#475569');

    ctx.fillStyle = wheelGrad;
    ctx.beginPath();
    ctx.arc(s.pivotX, s.pivotY, rWheel, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Flywheel 3 Symmetrical Counterweight Balance Cutouts
    for (let a = 0; a < 3; a++) {
      const cutoutAngle = s.phase + (a * 2 * Math.PI) / 3;
      const hx = s.pivotX + Math.cos(cutoutAngle) * (rWheel * 0.58);
      const hy = s.pivotY + Math.sin(cutoutAngle) * (rWheel * 0.58);
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(hx, hy, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center Steel Hub with brass nut
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.arc(s.pivotX, s.pivotY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 3. Eccentric Crank Pin
    const pinAngle = s.phase + Math.PI / 2;
    const pinX = s.pivotX + Math.cos(pinAngle) * s.crankRadius;
    const pinY = s.pivotY + Math.sin(pinAngle) * s.crankRadius;

    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(pinX, pinY, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#991B1B';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 4. Polished Steel Connecting Pushrod
    // Attach to rear brass coupling on magnet
    const attachX = m.x - m.width / 2;
    const attachY = m.y;

    // Steel Rod Body
    const rodGrad = ctx.createLinearGradient(pinX, pinY, attachX, attachY);
    rodGrad.addColorStop(0, '#64748B');
    rodGrad.addColorStop(0.5, '#E2E8F0');
    rodGrad.addColorStop(1, '#64748B');

    ctx.strokeStyle = rodGrad;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pinX, pinY);
    ctx.lineTo(attachX, attachY);
    ctx.stroke();

    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pinX, pinY);
    ctx.lineTo(attachX, attachY);
    ctx.stroke();

    // Rod End Ball-Joint Bearing Coupling
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.arc(attachX, attachY, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  drawDropTowerGuide(ctx) {
    const c = this.coil;
    const topY = this.height * 0.08;
    const botY = this.height * 0.72;

    ctx.save();
    const tubeW = c.radius * 2 + 10;
    const tubeLeft = c.x - tubeW / 2;

    ctx.fillStyle = 'rgba(240, 249, 255, 0.4)';
    ctx.fillRect(tubeLeft, topY, tubeW, botY - topY);
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(tubeLeft, topY, tubeW, botY - topY);

    ctx.strokeStyle = 'rgba(2, 132, 199, 0.6)';
    ctx.lineWidth = 1;
    ctx.font = '600 8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0284C7';
    ctx.textAlign = 'right';

    for (let cm = 0; cm <= 40; cm += 5) {
      const y = topY + (cm / 40) * (botY - topY - 30);
      const isMajor = cm % 10 === 0;
      const tickLen = isMajor ? 10 : 5;

      ctx.beginPath();
      ctx.moveTo(tubeLeft, y);
      ctx.lineTo(tubeLeft + tickLen, y);
      ctx.stroke();

      if (isMajor) {
        ctx.fillText(`${cm}cm`, tubeLeft - 4, y + 3);
      }
    }

    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.roundRect(tubeLeft + 4, botY - 14, tubeW - 8, 14, [4, 4, 1, 1]);
    ctx.fill();
    ctx.strokeStyle = '#991B1B';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  // =========================================================================
  // 3D DEPTH-SORTED HELICAL SOLENOID COIL
  // =========================================================================
  drawCoilLoops(ctx, pass) {
    const c = this.coil;
    const numLoops = 22;
    const loopSpacing = c.width / numLoops;
    const tubeLeft = c.x - c.width / 2;

    ctx.save();
    const currentAmp = Math.min(1.0, Math.abs(this.inducedCurrent) * 1.8e5);
    const wireGlowAlpha = currentAmp * 0.75;

    for (let i = 0; i < numLoops; i++) {
      const x1 = tubeLeft + i * loopSpacing;
      const x2 = x1 + loopSpacing;

      ctx.beginPath();
      if (pass === 'back') {
        // Back half of helical loop: dips behind cavity from bottom (+Y) to top (-Y)
        ctx.moveTo(x1, c.y + c.radius);
        ctx.bezierCurveTo(x1 - loopSpacing * 0.2, c.y, x2 - loopSpacing * 0.2, c.y, x2, c.y - c.radius);

        ctx.strokeStyle = '#78350F'; // darker copper for rear pass
        ctx.lineWidth = 4.0;
        ctx.stroke();
      } else {
        // Front half of helical loop: crosses in front from top (-Y) to bottom (+Y) OVER the magnet!
        ctx.moveTo(x1, c.y - c.radius);
        ctx.bezierCurveTo(x1 + loopSpacing * 0.4, c.y, x2 + loopSpacing * 0.4, c.y, x2, c.y + c.radius);

        // Radiant 3D golden copper gradient
        const wireGrad = ctx.createLinearGradient(x1, c.y - c.radius, x2, c.y + c.radius);
        wireGrad.addColorStop(0, '#FDE68A');
        wireGrad.addColorStop(0.3, '#F59E0B');
        wireGrad.addColorStop(0.7, '#B45309');
        wireGrad.addColorStop(1, '#92400E');

        ctx.strokeStyle = wireGrad;
        ctx.lineWidth = 4.6;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Current Glow Bloom
        if (wireGlowAlpha > 0.05) {
          ctx.strokeStyle = `rgba(56, 189, 248, ${wireGlowAlpha})`;
          ctx.lineWidth = 6.8;
          ctx.stroke();
        }

        // Specular Wire Reflection
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(x1 + 2, c.y - c.radius * 0.4);
        ctx.lineTo(x2 - 2, c.y + c.radius * 0.4);
        ctx.stroke();
      }
    }

    // Drift Electrons on front face
    if (pass === 'front' && this.showCurrentFlow && Math.abs(this.inducedCurrent) > 1e-6) {
      const dir = Math.sign(this.inducedCurrent);
      const speed = Math.min(3.2, Math.abs(this.inducedCurrent) * 1.8e5);

      for (let p of this.helicalParticles) {
        p.phase = (p.phase + dir * speed * p.speedFactor * 0.009) % 1.0;
        if (p.phase < 0) p.phase += 1.0;

        const loopIdx = Math.floor(p.phase * numLoops);
        const x1 = tubeLeft + loopIdx * loopSpacing;
        const x2 = x1 + loopSpacing;
        const t = (p.phase * numLoops) % 1.0;

        // Quadratic interpolation across front diagonal
        const px = x1 + t * loopSpacing;
        const py = (c.y - c.radius) + t * (2 * c.radius);

        ctx.fillStyle = '#38BDF8';
        ctx.shadowColor = '#0284C7';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();
  }

  // Outer Shell / Soft Iron Sleeve (wraps OUTSIDE the coil, leaving cavity completely hollow!)
  drawCoilOuterSleeve(ctx) {
    const c = this.coil;
    const tubeLeft = c.x - c.width / 2;
    const tubeW = c.width;

    ctx.save();
    // Bench Mount Foot
    const mountW = tubeW + 28;
    const mountH = 16;
    const benchY = this.height * 0.54;

    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.roundRect(c.x - mountW / 2, benchY - mountH, mountW, mountH, [4, 4, 1, 1]);
    ctx.fill();
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // If Soft Iron Core is selected: render heavy ferromagnetic outer yoke sleeve
    if (c.coreMu > 1.5) {
      const sleeveH = 14;
      // Top iron yoke rail
      const ironGrad = ctx.createLinearGradient(0, c.y - c.radius - sleeveH, 0, c.y - c.radius);
      ironGrad.addColorStop(0, '#64748B');
      ironGrad.addColorStop(0.3, '#CBD5E1');
      ironGrad.addColorStop(0.8, '#475569');
      ironGrad.addColorStop(1, '#1E293B');

      ctx.fillStyle = ironGrad;
      ctx.beginPath();
      ctx.roundRect(tubeLeft - 8, c.y - c.radius - sleeveH, tubeW + 16, sleeveH, 3);
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Bottom iron yoke rail
      ctx.beginPath();
      ctx.roundRect(tubeLeft - 8, c.y + c.radius, tubeW + 16, sleeveH, 3);
      ctx.fill();
      ctx.stroke();

      // Soft Iron Badge
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;
      ctx.textAlign = 'center';
      ctx.fillText('FERROMAGNETIC SOFT IRON SLEEVE (μr ≈ 45)', c.x, c.y - c.radius - 3);
      ctx.shadowBlur = 0;
    }

    // Acrylic End Mount Flanges
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(tubeLeft, c.y, 8, c.radius + 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(tubeLeft + tubeW, c.y, 8, c.radius + 6, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Knurled Binding Posts on Top
    const termLeftX = tubeLeft + 16;
    const termRightX = tubeLeft + tubeW - 16;
    const termY = c.y - c.radius - (c.coreMu > 1.5 ? 24 : 12);

    const drawPost = (tx, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(tx - 5, termY, 10, 12);
      ctx.fillStyle = '#D97706';
      ctx.fillRect(tx - 7, termY - 6, 14, 6);
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 1;
      ctx.strokeRect(tx - 7, termY - 6, 14, 6);
    };

    drawPost(termLeftX, '#DC2626');
    drawPost(termRightX, '#1E293B');

    // Specification Text
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'center';
    ctx.fillText(`SOLENOID COIL (${c.turns} TURNS)`, c.x, benchY - 3);

    ctx.restore();
  }

  // =========================================================================
  // 3D ALNICO BAR MAGNET (PASSES SMOOTHLY THROUGH BORE)
  // =========================================================================
  drawBarMagnet(ctx) {
    const m = this.magnet;
    const mx = m.x;
    const my = m.y;
    const w = m.width;
    const h = m.height;
    const halfW = w / 2;
    const halfH = h / 2;

    ctx.save();

    // Magnet Shadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;

    const northOnRight = !m.flipped;
    const leftColor = northOnRight ? 'south' : 'north';
    const rightColor = northOnRight ? 'north' : 'south';

    const drawPole = (px, pType) => {
      const grad = ctx.createLinearGradient(0, my - halfH, 0, my + halfH);
      if (pType === 'north') {
        grad.addColorStop(0, '#F87171');
        grad.addColorStop(0.2, '#EF4444');
        grad.addColorStop(0.6, '#DC2626');
        grad.addColorStop(1, '#991B1B');
      } else {
        grad.addColorStop(0, '#60A5FA');
        grad.addColorStop(0.2, '#3B82F6');
        grad.addColorStop(0.6, '#2563EB');
        grad.addColorStop(1, '#1E40AF');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(px, my - halfH, halfW, h);
    };

    drawPole(mx - halfW, leftColor);
    drawPole(mx, rightColor);

    ctx.shadowBlur = 0;

    // Brushed metal streak on top edge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(mx - halfW, my - halfH + 2, w, 2.5);

    // Dark bottom bevel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(mx - halfW, my + halfH - 3, w, 3);

    // Magnet Outer Border
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    ctx.strokeRect(mx - halfW, my - halfH, w, h);

    // Center divider with chrome collar
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(mx - 2.5, my - halfH - 1, 5, h + 2);
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1;
    ctx.strokeRect(mx - 2.5, my - halfH - 1, 5, h + 2);

    // Embossed Pole Letters
    ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 3;

    if (northOnRight) {
      ctx.fillText('S', mx - halfW * 0.5, my);
      ctx.fillText('N', mx + halfW * 0.5, my);
    } else {
      ctx.fillText('N', mx - halfW * 0.5, my);
      ctx.fillText('S', mx + halfW * 0.5, my);
    }
    ctx.shadowBlur = 0;

    // Draggable grab ring in manual mode
    if (this.motionMode === 'manual') {
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.7)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.roundRect(mx - halfW - 6, my - halfH - 6, w + 12, h + 12, 7);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  // =========================================================================
  // WARPING MAGNETIC STREAMLINES
  // =========================================================================
  drawWarpedFieldStreamlines(ctx) {
    const m = this.magnet;
    const c = this.coil;
    const mx = m.x;
    const my = m.y;
    const halfW = m.width / 2;

    const northRight = !this.magnet.flipped;
    const nX = northRight ? mx + halfW : mx - halfW;
    const sX = northRight ? mx - halfW : mx + halfW;

    ctx.save();
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.45)';
    ctx.lineWidth = 1.5;

    const warpCompression = (this.coilFacePolarity === 'N') ? 1.45 : (this.coilFacePolarity === 'S' ? 0.75 : 1.0);

    const loopConfigs = [
      { rY: 32, spreadX: 42 },
      { rY: 60, spreadX: 80 },
      { rY: 96, spreadX: 125 }
    ];

    for (let loop of loopConfigs) {
      const rY = loop.rY * warpCompression;
      const spX = loop.spreadX;

      ctx.beginPath();
      ctx.moveTo(nX, my);
      ctx.bezierCurveTo(nX + (northRight ? spX : -spX), my - rY * 1.5, sX - (northRight ? spX : -spX), my - rY * 1.5, sX, my);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(nX, my);
      ctx.bezierCurveTo(nX + (northRight ? spX : -spX), my + rY * 1.5, sX - (northRight ? spX : -spX), my + rY * 1.5, sX, my);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawMagneticRipples(ctx) {
    ctx.save();
    for (let rip of this.shockRipples) {
      ctx.strokeStyle = rip.color;
      ctx.globalAlpha = rip.alpha;
      ctx.lineWidth = 2.2;
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      ctx.ellipse(rip.x, rip.y, Math.max(2, rip.rx), Math.max(4, rip.ry), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawLenzDiagnostics(ctx) {
    const c = this.coil;
    const m = this.magnet;
    const pole = this.coilFacePolarity;

    ctx.save();
    const facingRight = m.x > c.x;
    const badgeX = facingRight ? c.x + c.width / 2 + 16 : c.x - c.width / 2 - 16;
    const badgeY = c.y - c.radius - 14;

    const badgeColor = pole === 'N' ? '#DC2626' : '#2563EB';
    ctx.fillStyle = badgeColor;
    ctx.shadowColor = badgeColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pole, badgeX, badgeY);

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, 20, 0, Math.PI * 1.6, false);
    ctx.stroke();

    // Retarding Lenz Magnetic Force Vector on the Magnet
    const arrowDir = -Math.sign(m.vx || (m.x - c.x));
    const forceLen = Math.min(55, Math.abs(this.lenzForce) * 35 + 14);
    const arrowStartX = m.x;
    const arrowStartY = m.y - m.height / 2 - 16;
    const arrowEndX = arrowStartX + arrowDir * forceLen;

    ctx.strokeStyle = '#7C3AED';
    ctx.fillStyle = '#7C3AED';
    ctx.lineWidth = 2.8;

    ctx.beginPath();
    ctx.moveTo(arrowStartX, arrowStartY);
    ctx.lineTo(arrowEndX, arrowStartY);
    ctx.stroke();

    const headLen = 9;
    ctx.beginPath();
    ctx.moveTo(arrowEndX, arrowStartY);
    ctx.lineTo(arrowEndX - arrowDir * headLen, arrowStartY - 6);
    ctx.lineTo(arrowEndX - arrowDir * headLen, arrowStartY + 6);
    ctx.closePath();
    ctx.fill();

    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillText('F_Lenz', (arrowStartX + arrowEndX) / 2, arrowStartY - 11);

    ctx.restore();
  }

  drawConnectingWires(ctx) {
    const c = this.coil;
    const termLeftX = c.x - c.width / 2 + 16;
    const termRightX = c.x + c.width / 2 - 16;
    const termY = c.y - c.radius - (c.coreMu > 1.5 ? 24 : 12);

    let loadTermRedX, loadTermRedY, loadTermBlackX, loadTermBlackY;

    if (this.loadType === 'galvo') {
      const gX = this.galvo.x;
      const gY = this.galvo.y;
      loadTermRedX = gX - 30;
      loadTermRedY = gY + 52;
      loadTermBlackX = gX + 30;
      loadTermBlackY = gY + 52;
    } else {
      const bX = this.galvo.x;
      const bY = this.galvo.y;
      loadTermRedX = bX - 22;
      loadTermRedY = bY + 44;
      loadTermBlackX = bX + 22;
      loadTermBlackY = bY + 44;
    }

    ctx.save();
    ctx.lineWidth = 2.6;

    // Red Wire (+ lead)
    ctx.strokeStyle = '#DC2626';
    ctx.beginPath();
    ctx.moveTo(termLeftX, termY);
    ctx.bezierCurveTo(termLeftX + 50, termY - 50, loadTermRedX - 70, loadTermRedY - 40, loadTermRedX, loadTermRedY);
    ctx.stroke();

    // Black Wire (- lead)
    ctx.strokeStyle = '#1E293B';
    ctx.beginPath();
    ctx.moveTo(termRightX, termY);
    ctx.bezierCurveTo(termRightX + 50, termY - 40, loadTermBlackX - 50, loadTermBlackY - 30, loadTermBlackX, loadTermBlackY);
    ctx.stroke();

    ctx.restore();
  }

  drawCenterZeroGalvanometer(ctx) {
    const gx = this.galvo.x;
    const gy = this.galvo.y;
    const r = this.galvo.radius;

    ctx.save();
    ctx.translate(gx, gy);

    ctx.shadowColor = 'rgba(15, 23, 42, 0.18)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;

    const casingGrad = ctx.createRadialGradient(0, 0, r - 6, 0, 0, r + 8);
    casingGrad.addColorStop(0, '#CBD5E1');
    casingGrad.addColorStop(0.7, '#64748B');
    casingGrad.addColorStop(1, '#1E293B');

    ctx.fillStyle = casingGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r + 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Dial Face
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, r - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Anti-Parallax Mirrored Arc Strip
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, -Math.PI * 0.75, -Math.PI * 0.25, false);
    ctx.stroke();

    // Dial Scale (-50 to +50 uA)
    const maxAngle = 0.72;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.font = '600 8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'center';

    const numTicks = 10;
    for (let i = -numTicks; i <= numTicks; i++) {
      const frac = i / numTicks;
      const a = -Math.PI / 2 + frac * maxAngle;
      const isMajor = i % 5 === 0;
      const isCenter = i === 0;
      const tickLen = isCenter ? 12 : (isMajor ? 8 : 4);

      const r1 = r * 0.78;
      const r2 = r1 - tickLen;

      ctx.beginPath();
      ctx.moveTo(r1 * Math.cos(a), r1 * Math.sin(a));
      ctx.lineTo(r2 * Math.cos(a), r2 * Math.sin(a));
      ctx.stroke();

      if (isMajor) {
        const val = i * 5;
        const tx = (r2 - 8) * Math.cos(a);
        const ty = (r2 - 8) * Math.sin(a);
        ctx.fillText(`${Math.abs(val)}`, tx, ty + 3);
      }
    }

    // Emblem
    ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0F172A';
    ctx.fillText('G', 0, r * 0.28);
    ctx.font = '600 8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748B';
    ctx.fillText('±50 µA', 0, r * 0.44);

    // Dynamic Needle Shadow on dial below
    ctx.save();
    ctx.rotate(this.galvo.needleAngle + 0.03);
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.15)';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.lineTo(0, -r * 0.80);
    ctx.stroke();
    ctx.restore();

    // Balanced Indicator Needle
    ctx.save();
    ctx.rotate(this.galvo.needleAngle);

    ctx.strokeStyle = '#E11D48';
    ctx.fillStyle = '#E11D48';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 7);
    ctx.lineTo(0, -r * 0.82);
    ctx.stroke();

    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();

    // Curved Specular Glint
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r - 3, 0, Math.PI * 2);
    ctx.clip();
    const glassGrad = ctx.createLinearGradient(-r, -r, r, r);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    glassGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.05)');
    glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.restore();

    ctx.restore();
  }

  drawBulbAndDualLEDs(ctx) {
    const bx = this.galvo.x;
    const by = this.galvo.y;

    ctx.save();
    ctx.translate(bx, by);

    // Mount Board
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-45, -55, 90, 110, 10);
    ctx.fill();
    ctx.stroke();

    // 1. Incandescent Light Bulb
    const bulbY = -12;
    const bulbR = 19;

    if (this.bulbBrightness > 0.05) {
      const haloR = bulbR + 32 * this.bulbBrightness;
      const haloGrad = ctx.createRadialGradient(0, bulbY, bulbR * 0.4, 0, bulbY, haloR);
      haloGrad.addColorStop(0, `rgba(254, 240, 138, ${0.9 * this.bulbBrightness})`);
      haloGrad.addColorStop(0.4, `rgba(251, 146, 60, ${0.5 * this.bulbBrightness})`);
      haloGrad.addColorStop(1, 'rgba(251, 146, 60, 0.0)');

      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(0, bulbY, haloR, 0, Math.PI * 2);
      ctx.fill();
    }

    const bulbGlass = ctx.createRadialGradient(-5, bulbY - 5, 2, 0, bulbY, bulbR);
    if (this.bulbBrightness > 0.05) {
      bulbGlass.addColorStop(0, '#FFFFFF');
      bulbGlass.addColorStop(0.4, '#FEF08A');
      bulbGlass.addColorStop(1, '#F59E0B');
    } else {
      bulbGlass.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      bulbGlass.addColorStop(0.7, 'rgba(240, 249, 255, 0.6)');
      bulbGlass.addColorStop(1, 'rgba(203, 213, 225, 0.8)');
    }

    ctx.fillStyle = bulbGlass;
    ctx.beginPath();
    ctx.arc(0, bulbY, bulbR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    let filColor = '#64748B';
    if (this.filamentTemp > 1800) filColor = '#FFFFFF';
    else if (this.filamentTemp > 1200) filColor = '#FEF08A';
    else if (this.filamentTemp > 700) filColor = '#EF4444';

    ctx.strokeStyle = filColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-6, bulbY + 7);
    ctx.lineTo(-4, bulbY - 3);
    ctx.lineTo(0, bulbY - 7);
    ctx.lineTo(4, bulbY - 3);
    ctx.lineTo(6, bulbY + 7);
    ctx.stroke();

    ctx.fillStyle = '#D97706';
    ctx.fillRect(-7, bulbY + bulbR - 2, 14, 10);

    // 2. Dual Bipolar LEDs
    const ledY = 32;

    const drawLED = (lx, colorOn, colorOff, glowVal, label) => {
      ctx.fillStyle = glowVal > 0.1 ? colorOn : colorOff;
      if (glowVal > 0.1) {
        ctx.shadowColor = colorOn;
        ctx.shadowBlur = 12 * glowVal;
      }
      ctx.beginPath();
      ctx.arc(lx, ledY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.font = '700 8px "JetBrains Mono", monospace';
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'center';
      ctx.fillText(label, lx, ledY + 15);
    };

    drawLED(-18, '#22C55E', '#14532D', this.ledGreenGlow, '+I');
    drawLED(18, '#EF4444', '#7F1D1D', this.ledRedGlow, '-I');

    ctx.restore();
  }

  drawOscilloscopeChart(ctx) {
    const chartW = Math.min(380, this.width * 0.44);
    const chartH = 110;
    const chartX = this.width - chartW - 16;
    const chartY = this.height - chartH - 14;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(chartX, chartY, chartW, chartH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'left';
    ctx.fillText('LIVE OSCILLOSCOPE DUAL TRACE', chartX + 12, chartY + 16);

    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0284C7';
    ctx.fillText('● Φ_B (Flux)', chartX + chartW - 145, chartY + 16);
    ctx.fillStyle = '#DC2626';
    ctx.fillText('● 𝓔 (EMF)', chartX + chartW - 65, chartY + 16);

    const zeroY = chartY + chartH / 2 + 10;
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartX + 12, zeroY);
    ctx.lineTo(chartX + chartW - 12, zeroY);
    ctx.stroke();

    if (this.chartHistory.length < 2) {
      ctx.restore();
      return;
    }

    const plotW = chartW - 24;
    const plotLeft = chartX + 12;
    const maxValY = 38;

    // Trace 1: Magnetic Flux Φ (Blue)
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i < this.chartHistory.length; i++) {
      const pt = this.chartHistory[i];
      const px = plotLeft + (i / (this.chartMaxSamples - 1)) * plotW;
      const py = zeroY - Math.max(-maxValY, Math.min(maxValY, pt.flux * 3.5));
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Trace 2: Induced EMF 𝓔 (Red)
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i < this.chartHistory.length; i++) {
      const pt = this.chartHistory[i];
      const px = plotLeft + (i / (this.chartMaxSamples - 1)) * plotW;
      const py = zeroY - Math.max(-maxValY, Math.min(maxValY, pt.emf * 1.8));
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new FaradayLenzSimulation();
});
