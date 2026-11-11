/**
 * Liquid Density Tower & Buoyancy Virtual Laboratory
 * Realistic 3D Glass Metrology, Dynamic Fluid Meniscus & Physics Engine
 * NCERT Class 8 & 9 Science
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

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playSplash(viscosity = 1.0) {
    if (!this.enabled) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const dur = 0.22 * Math.max(0.6, viscosity);

    // Deep water plop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const startFreq = 420 / Math.sqrt(viscosity);
    const endFreq = 120 / Math.sqrt(viscosity);
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + dur);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + dur);

    // Secondary splash noise spray
    if (viscosity < 2.0) {
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.06, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.ctx.destination);
      noise.start();
    }
  }

  playClink() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.08);
  }

  playBubble() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600 + Math.random() * 400, now);
    osc.frequency.exponentialRampToValueAtTime(1200 + Math.random() * 400, now + 0.04);

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.04);
  }
}

class DensityTowerSimulation {
  constructor() {
    this.canvas = document.getElementById('simCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundEngine();

    this.temperature = 25; // °C

    // Immiscible Liquid Layers (Bottom to Top)
    this.liquids = [
      {
        name: 'Honey',
        baseDensity: 1.42,
        viscosity: 12.0,
        colorTop: 'rgba(217, 119, 6, 0.92)',
        colorMid: 'rgba(180, 83, 9, 0.88)',
        colorBottom: 'rgba(120, 53, 15, 0.95)',
        surfaceColor: 'rgba(251, 191, 36, 0.95)',
        meniscusColor: '#B45309',
        ripplePhase: 0,
        rippleAmp: 0
      },
      {
        name: 'Dish Soap',
        baseDensity: 1.06,
        viscosity: 3.5,
        colorTop: 'rgba(13, 148, 136, 0.88)',
        colorMid: 'rgba(15, 118, 110, 0.84)',
        colorBottom: 'rgba(17, 94, 89, 0.90)',
        surfaceColor: 'rgba(45, 212, 191, 0.92)',
        meniscusColor: '#0F766E',
        ripplePhase: 0,
        rippleAmp: 0
      },
      {
        name: 'Colored Water',
        baseDensity: 1.00,
        viscosity: 1.0,
        colorTop: 'rgba(56, 189, 248, 0.82)',
        colorMid: 'rgba(14, 165, 233, 0.78)',
        colorBottom: 'rgba(2, 132, 199, 0.85)',
        surfaceColor: 'rgba(186, 230, 253, 0.92)',
        meniscusColor: '#0284C7',
        ripplePhase: 0,
        rippleAmp: 0
      },
      {
        name: 'Vegetable Oil',
        baseDensity: 0.92,
        viscosity: 1.8,
        colorTop: 'rgba(250, 204, 21, 0.85)',
        colorMid: 'rgba(234, 179, 8, 0.80)',
        colorBottom: 'rgba(202, 138, 4, 0.88)',
        surfaceColor: 'rgba(254, 240, 138, 0.94)',
        meniscusColor: '#CA8A04',
        ripplePhase: 0,
        rippleAmp: 0
      },
      {
        name: 'Rubbing Alcohol',
        baseDensity: 0.79,
        viscosity: 0.8,
        colorTop: 'rgba(244, 63, 94, 0.80)',
        colorMid: 'rgba(225, 29, 72, 0.75)',
        colorBottom: 'rgba(190, 18, 60, 0.82)',
        surfaceColor: 'rgba(254, 205, 211, 0.90)',
        meniscusColor: '#E11D48',
        ripplePhase: 0,
        rippleAmp: 0
      }
    ];

    // Objects with rich 3D rendering profiles
    this.objects = [
      {
        id: 'bolt',
        name: 'Steel Bolt',
        density: 7.85,
        mass: 24.0,
        volume: 3.06,
        radius: 17,
        type: 'bolt',
        inCylinder: false,
        x: 0, y: 0, vy: 0,
        rotation: 0.15,
        targetRotation: 0.15
      },
      {
        id: 'tomato',
        name: 'Cherry Tomato',
        density: 1.15,
        mass: 12.0,
        volume: 10.43,
        radius: 18,
        type: 'tomato',
        inCylinder: false,
        x: 0, y: 0, vy: 0,
        rotation: 0,
        targetRotation: 0
      },
      {
        id: 'lego',
        name: 'Plastic Lego Brick',
        density: 1.03,
        mass: 8.0,
        volume: 7.77,
        radius: 17,
        type: 'lego',
        inCylinder: false,
        x: 0, y: 0, vy: 0,
        rotation: 0.1,
        targetRotation: 0.1
      },
      {
        id: 'ice',
        name: 'Ice Cube',
        density: 0.92,
        mass: 10.0,
        volume: 10.87,
        radius: 17,
        type: 'ice',
        inCylinder: false,
        x: 0, y: 0, vy: 0,
        rotation: 0.2,
        targetRotation: 0.2
      },
      {
        id: 'wax',
        name: 'Candle Wax',
        density: 0.85,
        mass: 7.0,
        volume: 8.24,
        radius: 16,
        type: 'wax',
        inCylinder: false,
        x: 0, y: 0, vy: 0,
        rotation: 0,
        targetRotation: 0
      },
      {
        id: 'cork',
        name: 'Cork Stopper',
        density: 0.24,
        mass: 2.5,
        volume: 10.42,
        radius: 17,
        type: 'cork',
        inCylinder: false,
        x: 0, y: 0, vy: 0,
        rotation: -0.1,
        targetRotation: -0.1
      },
      {
        id: 'custom',
        name: 'Crystal Orb',
        density: 0.98,
        mass: 15.0,
        volume: 15.3,
        radius: 18,
        type: 'custom',
        inCylinder: false,
        x: 0, y: 0, vy: 0,
        rotation: 0,
        targetRotation: 0
      }
    ];

    this.activeObj = this.objects[0];
    this.draggedObj = null;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    // Particles (splashes, bubbles)
    this.particles = [];
    this.bubbles = [];

    // Geometry layout
    this.cylinder = { x: 0, y: 0, w: 0, h: 0, rx: 0, ry: 0, topY: 0, bottomY: 0 };
    this.tray = { x: 0, y: 0, w: 0, h: 0 };

    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.animTime = 0;

    this.initDOM();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.setupInteractions();

    this.lastFrameTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initDOM() {
    this.sliderTemp = document.getElementById('sliderTemp');
    this.valTemp = document.getElementById('valTemp');
    this.sliderCustomMass = document.getElementById('sliderCustomMass');
    this.valCustomMass = document.getElementById('valCustomMass');
    this.sliderCustomVol = document.getElementById('sliderCustomVol');
    this.valCustomVol = document.getElementById('valCustomVol');
    this.valCustomDensity = document.getElementById('valCustomDensity');
    this.btnResetObjects = document.getElementById('btnResetObjects');

    this.readoutObjName = document.getElementById('readoutObjName');
    this.readoutObjDensity = document.getElementById('readoutObjDensity');
    this.readoutLayerName = document.getElementById('readoutLayerName');
    this.readoutStatus = document.getElementById('readoutStatus');

    // Audio toggle
    this.btnAudio = document.getElementById('btnAudioToggle');
    this.btnAudio.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.btnAudio.textContent = this.sound.enabled ? '🔊 Sound: ON' : '🔈 Sound: OFF';
    });

    // Reset All
    document.getElementById('btnResetAll').addEventListener('click', () => {
      this.temperature = 25;
      this.sliderTemp.value = 25;
      this.valTemp.textContent = '25°C';
      this.resetAllObjectsToTray();
      this.sound.playClink();
    });

    this.btnResetObjects.addEventListener('click', () => {
      this.resetAllObjectsToTray();
      this.sound.playClink();
    });

    // Theory Modal
    const theoryModal = document.getElementById('modalTheory');
    document.getElementById('btnOpenTheory').addEventListener('click', () => {
      theoryModal.classList.add('open');
      this.sound.playClink();
    });
    document.getElementById('btnCloseTheory').addEventListener('click', () => {
      theoryModal.classList.remove('open');
    });
    theoryModal.addEventListener('click', (e) => {
      if (e.target === theoryModal) theoryModal.classList.remove('open');
    });

    // Sliders
    this.sliderTemp.addEventListener('input', (e) => {
      this.temperature = parseFloat(e.target.value);
      this.valTemp.textContent = `${this.temperature.toFixed(0)}°C`;
    });

    const updateCustomObj = () => {
      const m = parseFloat(this.sliderCustomMass.value);
      const v = parseFloat(this.sliderCustomVol.value);
      const custom = this.objects.find(o => o.id === 'custom');
      custom.mass = m;
      custom.volume = v;
      custom.density = m / v;
      this.valCustomMass.textContent = `${m.toFixed(1)} g`;
      this.valCustomVol.textContent = `${v.toFixed(1)} cm³`;
      this.valCustomDensity.textContent = `${custom.density.toFixed(2)} g/cm³`;
      this.updateTelemetry();
    };

    this.sliderCustomMass.addEventListener('input', updateCustomObj);
    this.sliderCustomVol.addEventListener('input', updateCustomObj);
  }

  getLiquidDensity(baseDensity) {
    const dt = this.temperature - 20;
    return baseDensity * (1 - 0.0006 * dt);
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // 3D Cylinder geometry
    const cylW = Math.min(185, this.width * 0.36);
    const cylH = this.height * 0.74;
    const rx = cylW * 0.5;
    const ry = 14; // 3D ellipse height

    this.cylinder = {
      x: this.width * 0.32 - rx,
      y: this.height * 0.14,
      w: cylW,
      h: cylH,
      rx: rx,
      ry: ry,
      topY: this.height * 0.14,
      bottomY: this.height * 0.14 + cylH
    };

    // Specimen rack on the right
    const trayW = Math.min(260, this.width * 0.42);
    const trayH = this.height * 0.78;
    this.tray = {
      x: this.width * 0.72 - trayW / 2,
      y: this.height * 0.11,
      w: trayW,
      h: trayH
    };

    this.positionTrayObjects();
  }

  positionTrayObjects() {
    const startY = this.tray.y + 44;
    const spacingY = (this.tray.h - 60) / this.objects.length;
    this.objects.forEach((obj, idx) => {
      if (!obj.inCylinder && obj !== this.draggedObj) {
        obj.x = this.tray.x + 36;
        obj.y = startY + idx * spacingY + 12;
        obj.vy = 0;
      }
    });
  }

  resetAllObjectsToTray() {
    this.objects.forEach(obj => {
      obj.inCylinder = false;
      obj.vy = 0;
    });
    this.positionTrayObjects();
    this.updateTelemetry();
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
      const pos = getPos(e);
      this.hasDragged = false;
      this.dragStartPos = { ...pos };

      for (let i = this.objects.length - 1; i >= 0; i--) {
        const obj = this.objects[i];
        const dist = Math.hypot(pos.x - obj.x, pos.y - obj.y);
        if (dist <= obj.radius + 14) {
          this.draggedObj = obj;
          this.activeObj = obj;
          this.dragOffsetX = obj.x - pos.x;
          this.dragOffsetY = obj.y - pos.y;
          this.canvas.style.cursor = 'grabbing';
          this.sound.playClink();
          this.updateTelemetry();
          break;
        }
      }
    };

    const handlePointerMove = (e) => {
      const pos = getPos(e);
      if (this.draggedObj) {
        if (Math.hypot(pos.x - this.dragStartPos.x, pos.y - this.dragStartPos.y) > 6) {
          this.hasDragged = true;
        }
        this.draggedObj.x = pos.x + this.dragOffsetX;
        this.draggedObj.y = pos.y + this.dragOffsetY;
        this.draggedObj.vy = 0;
      } else {
        let hover = false;
        for (let obj of this.objects) {
          if (Math.hypot(pos.x - obj.x, pos.y - obj.y) <= obj.radius + 14) {
            hover = true;
            break;
          }
        }
        this.canvas.style.cursor = hover ? 'grab' : 'default';
      }
    };

    const handlePointerUp = () => {
      if (this.draggedObj) {
        const obj = this.draggedObj;
        const c = this.cylinder;
        const insideCylX = obj.x >= c.x - 15 && obj.x <= c.x + c.w + 15;
        const insideCylY = obj.y >= c.topY - 40 && obj.y <= c.bottomY + 15;

        // If clicked/tapped on tray without significant drag, auto-drop into cylinder
        if (!this.hasDragged && !obj.inCylinder) {
          obj.inCylinder = true;
          obj.x = c.x + c.rx;
          obj.y = c.topY;
          obj.vy = 25; // initial downward plunge
          this.triggerSplash(obj.x, c.topY, 18, 0.8);
          this.liquids[4].rippleAmp = 15;
          this.sound.playSplash(0.8);
        } else if (insideCylX && insideCylY) {
          obj.inCylinder = true;
          obj.x = c.x + c.rx;
          if (obj.y < c.topY) {
            obj.y = c.topY;
            obj.vy = 30; // plunge into top surface
          } else {
            obj.vy = Math.max(15, obj.vy);
          }
          this.triggerSplash(obj.x, c.topY, 16, 0.8);
          this.liquids[4].rippleAmp = 14;
          this.sound.playSplash(0.8);
        } else {
          obj.inCylinder = false;
          this.positionTrayObjects();
          this.sound.playClink();
        }

        this.draggedObj = null;
        this.canvas.style.cursor = 'grab';
        this.updateTelemetry();
      }
    };

    this.canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    this.canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
  }

  triggerSplash(x, y, count, viscosity) {
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      const speed = (2.5 + Math.random() * 4.0) / Math.sqrt(viscosity);
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.8 + Math.random() * 2.2,
        alpha: 1.0,
        color: 'rgba(255, 255, 255, 0.9)'
      });
    }
  }

  calcTargetEquilibriumY(obj) {
    const c = this.cylinder;
    const numLayers = this.liquids.length;
    const layerH = c.h / numLayers;

    const honeyDensity = this.getLiquidDensity(this.liquids[0].baseDensity);
    if (obj.density >= honeyDensity) {
      return c.bottomY - obj.radius - 8;
    }

    const alcoholDensity = this.getLiquidDensity(this.liquids[4].baseDensity);
    if (obj.density <= alcoholDensity) {
      return c.topY + obj.radius * 0.4;
    }

    for (let i = 0; i < numLayers - 1; i++) {
      const lowerDensity = this.getLiquidDensity(this.liquids[i].baseDensity);
      const upperDensity = this.getLiquidDensity(this.liquids[i + 1].baseDensity);

      if (obj.density <= lowerDensity && obj.density >= upperDensity) {
        const interfaceY = c.bottomY - (i + 1) * layerH;
        const frac = (lowerDensity - obj.density) / (lowerDensity - upperDensity);
        return interfaceY - (frac - 0.5) * (obj.radius * 1.6);
      }
    }

    return c.bottomY - layerH * 0.5;
  }

  animate(now) {
    const dt = Math.min((now - this.lastFrameTime) / 1000, 0.05);
    this.lastFrameTime = now;
    this.animTime += dt;

    // Animate fluid layer ripples
    for (let l of this.liquids) {
      if (l.rippleAmp > 0.05) {
        l.ripplePhase += 14 * dt;
        l.rippleAmp *= Math.pow(0.88, dt * 60);
      } else {
        l.rippleAmp = 0;
      }
    }

    // Update submerged objects physics
    const c = this.cylinder;
    const numLayers = this.liquids.length;
    const layerH = c.h / numLayers;

    for (let obj of this.objects) {
      if (obj.inCylinder && obj !== this.draggedObj) {
        const targetY = this.calcTargetEquilibriumY(obj);
        const dy = targetY - obj.y;

        // Determine current liquid viscosity
        const distFromBottom = c.bottomY - obj.y;
        const layerIdx = Math.max(0, Math.min(numLayers - 1, Math.floor(distFromBottom / layerH)));
        const currentViscosity = this.liquids[layerIdx].viscosity;

        // Terminal sinking / floating speed tailored to viscosity
        const maxTerminalSpeed = Math.max(22, 130 / Math.pow(currentViscosity, 0.42));
        const dir = Math.sign(dy);
        const desiredSpeed = Math.min(maxTerminalSpeed, Math.abs(dy) * 5.0) * dir;

        // Smooth acceleration towards target speed with fluid damping
        const responsiveness = Math.min(1.0, dt * (14.0 / Math.pow(currentViscosity, 0.3)));
        obj.vy += (desiredSpeed - obj.vy) * responsiveness;
        obj.y += obj.vy * dt;

        // Gentle tilt wobble while descending through fluids
        obj.rotation += (Math.sin(this.animTime * 3.5 + obj.radius) * 0.12 - obj.rotation) * dt * 4;

        // Spawn trailing micro-bubbles if descending fast
        if (Math.abs(obj.vy) > 8 && Math.random() < 0.35) {
          this.bubbles.push({
            x: obj.x + (Math.random() - 0.5) * obj.radius,
            y: obj.y + obj.radius * 0.5,
            radius: 1.2 + Math.random() * 1.8,
            vy: -15 - Math.random() * 20,
            alpha: 0.8
          });
          if (Math.random() < 0.08) this.sound.playBubble();
        }

        // Trigger interface ripples when crossing boundaries
        for (let i = 0; i < numLayers; i++) {
          const ifY = c.bottomY - i * layerH;
          if (Math.abs(obj.y - ifY) < 6 && Math.abs(obj.vy) > 5) {
            this.liquids[Math.min(numLayers - 1, i)].rippleAmp = Math.min(10, Math.abs(obj.vy) * 0.5);
          }
        }
      }
    }

    // Update splash particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 9.8 * 0.04;
      p.alpha -= 0.035;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }

    // Update bubbles
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.y += b.vy * dt;
      b.x += Math.sin(this.animTime * 6 + b.y * 0.1) * 0.3;
      if (b.y <= c.topY) {
        this.bubbles.splice(i, 1);
      }
    }

    this.render();
    requestAnimationFrame(this.animate);
  }

  updateTelemetry() {
    if (!this.activeObj) return;
    const obj = this.activeObj;
    this.readoutObjName.textContent = obj.name;
    this.readoutObjDensity.textContent = `${obj.density.toFixed(2)} g/cm³`;

    if (!obj.inCylinder) {
      this.readoutLayerName.textContent = 'On Specimen Rack';
      this.readoutStatus.textContent = 'Ready to drop';
      return;
    }

    const c = this.cylinder;
    const layerH = c.h / this.liquids.length;
    const distFromBottom = c.bottomY - obj.y;
    const layerIdx = Math.max(0, Math.min(this.liquids.length - 1, Math.floor(distFromBottom / layerH)));
    const curLiquid = this.liquids[layerIdx];
    const curDensity = this.getLiquidDensity(curLiquid.baseDensity);

    this.readoutLayerName.textContent = `${curLiquid.name} (${curDensity.toFixed(2)})`;

    if (obj.density > this.getLiquidDensity(this.liquids[0].baseDensity)) {
      this.readoutStatus.textContent = 'Sunk to Bottom';
    } else if (obj.density < this.getLiquidDensity(this.liquids[4].baseDensity)) {
      this.readoutStatus.textContent = 'Surface Float';
    } else {
      this.readoutStatus.textContent = 'Equilibrium Float';
    }
  }

  render() {
    if (!this.ctx || this.width === 0) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Clean Lab Bench Grid
    this.drawGrid(ctx);

    // 2. Specimen Rack on Right
    this.drawSpecimenRack(ctx);

    // 3. 3D Graduated Cylinder Background Wall
    this.drawCylinderBack(ctx);

    // 4. Immiscible Fluid Cylinders with 3D Elliptical Menisci
    this.drawLiquidLayers(ctx);

    // 5. Rising Micro-Bubbles
    this.drawBubbles(ctx);

    // 6. Submerged Objects
    this.drawSubmergedObjects(ctx);

    // 7. 3D Glass Front Wall (Glass reflections, specular highlights & graduation ticks)
    this.drawCylinderFront(ctx);

    // 8. Splash Droplets
    this.drawSplashParticles(ctx);

    // 9. Unsubmerged Objects on Rack or being Dragged
    this.drawRackAndDraggedObjects(ctx);
  }

  drawGrid(ctx) {
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

  drawSpecimenRack(ctx) {
    const t = this.tray;
    ctx.save();

    // Acrylic Rack Base Plate with Soft Shadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(t.x, t.y, t.w, t.h, 14);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Header bar
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.roundRect(t.x, t.y, t.w, 36, [14, 14, 0, 0]);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.stroke();

    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.fillText('LAB SPECIMEN RACK', t.x + t.w * 0.5, t.y + 22);

    // Recessed circular wells for each specimen
    const startY = t.y + 44;
    const spacingY = (t.h - 60) / this.objects.length;

    this.objects.forEach((obj, idx) => {
      const cy = startY + idx * spacingY + 12;
      const cx = t.x + 36;

      // Recessed well
      ctx.fillStyle = '#F1F5F9';
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, 22, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Specimen text metadata
      ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = obj === this.activeObj ? '#0284C7' : '#1E293B';
      ctx.textAlign = 'left';
      ctx.fillText(obj.name, cx + 32, cy + 1);

      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#64748B';
      ctx.fillText(`ρ = ${obj.density.toFixed(2)} g/cm³`, cx + 32, cy + 15);
    });

    ctx.restore();
  }

  drawCylinderBack(ctx) {
    const c = this.cylinder;
    ctx.save();

    // Heavy Glass Pedestal Base (Hexagonal foot)
    const baseW = c.w + 48;
    const baseY = c.bottomY;
    const baseH = 20;

    ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(c.x + c.rx - baseW / 2, baseY, baseW, baseH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Glass wall back fill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(c.x, c.topY, c.w, c.h);

    ctx.restore();
  }

  drawLiquidLayers(ctx) {
    const c = this.cylinder;
    const numLayers = this.liquids.length;
    const layerH = c.h / numLayers;
    const cx = c.x + c.rx;

    ctx.save();

    // Draw from bottom (Honey) to top (Alcohol)
    for (let i = 0; i < numLayers; i++) {
      const liquid = this.liquids[i];
      const botY = c.bottomY - i * layerH;
      const topY = botY - layerH;

      // 3D Cylinder Liquid Body Gradient
      const grad = ctx.createLinearGradient(c.x, 0, c.x + c.w, 0);
      grad.addColorStop(0, liquid.colorBottom);
      grad.addColorStop(0.2, liquid.colorTop);
      grad.addColorStop(0.5, liquid.colorMid);
      grad.addColorStop(0.85, liquid.colorTop);
      grad.addColorStop(1, liquid.colorBottom);

      ctx.fillStyle = grad;

      // Draw 3D curved liquid slice
      ctx.beginPath();
      // Start top-left
      ctx.moveTo(c.x, topY);
      // Top elliptical meniscus curve (front half)
      ctx.ellipse(cx, topY, c.rx, c.ry, 0, Math.PI, 0, false);
      // Down right wall
      ctx.lineTo(c.x + c.w, botY);
      // Bottom elliptical meniscus curve (front half)
      ctx.ellipse(cx, botY, c.rx, c.ry, 0, 0, Math.PI, false);
      // Up left wall
      ctx.closePath();
      ctx.fill();

      // Top Meniscus Cap (Visible elliptical fluid surface)
      const capGrad = ctx.createRadialGradient(cx, topY, 5, cx, topY, c.rx);
      capGrad.addColorStop(0, liquid.surfaceColor);
      capGrad.addColorStop(1, liquid.colorMid);

      ctx.fillStyle = capGrad;
      ctx.strokeStyle = liquid.meniscusColor;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.ellipse(cx, topY, c.rx, c.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Fluid Ripple Waves if active
      if (liquid.rippleAmp > 0.1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.8;
        const rWave = c.rx * (0.3 + 0.5 * Math.sin(liquid.ripplePhase));
        ctx.beginPath();
        ctx.ellipse(cx, topY, Math.max(5, rWave), Math.max(2, rWave * (c.ry / c.rx)), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Elegant Fluid Label with live density
      ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 4;
      ctx.textAlign = 'left';
      const curDens = this.getLiquidDensity(liquid.baseDensity).toFixed(2);
      ctx.fillText(liquid.name, c.x + 14, topY + layerH * 0.55);

      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillText(`${curDens} g/cm³`, c.x + 14, topY + layerH * 0.55 + 13);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  drawBubbles(ctx) {
    ctx.save();
    for (let b of this.bubbles) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  drawSubmergedObjects(ctx) {
    for (let obj of this.objects) {
      if (obj.inCylinder && obj !== this.draggedObj) {
        this.render3DObject(ctx, obj.x, obj.y, obj);
      }
    }
  }

  drawCylinderFront(ctx) {
    const c = this.cylinder;
    const cx = c.x + c.rx;

    ctx.save();

    // 1. Glass Cylinder Outer Walls
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 3.5;

    // Left wall
    ctx.beginPath();
    ctx.moveTo(c.x, c.topY - 14);
    ctx.lineTo(c.x, c.bottomY);
    ctx.stroke();

    // Right wall
    ctx.beginPath();
    ctx.moveTo(c.x + c.w, c.topY - 14);
    ctx.lineTo(c.x + c.w, c.bottomY);
    ctx.stroke();

    // Top Rim & Spout
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, c.topY, c.rx, c.ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Glass Reflection Highlights (Borosilicate Glare Streaks)
    const glare1 = ctx.createLinearGradient(c.x, 0, c.x + 22, 0);
    glare1.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    glare1.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = glare1;
    ctx.fillRect(c.x + 3, c.topY - 10, 20, c.h + 10);

    const glare2 = ctx.createLinearGradient(c.x + c.w - 14, 0, c.x + c.w, 0);
    glare2.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
    glare2.addColorStop(1, 'rgba(255, 255, 255, 0.5)');
    ctx.fillStyle = glare2;
    ctx.fillRect(c.x + c.w - 14, c.topY - 10, 11, c.h + 10);

    // 2. Precision Graduation Scale (0 to 500 mL)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 1.4;
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    for (let ml = 0; ml <= 500; ml += 25) {
      const y = c.bottomY - (ml / 500) * c.h;
      const isMajor = ml % 100 === 0;
      const isMid = ml % 50 === 0;
      const tickLen = isMajor ? 14 : (isMid ? 9 : 5);

      ctx.beginPath();
      ctx.moveTo(c.x + c.w, y);
      ctx.lineTo(c.x + c.w - tickLen, y);
      ctx.stroke();

      if (isMajor && ml > 0 && ml < 500) {
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 3;
        ctx.fillText(`${ml}mL`, c.x + c.w - 18, y + 3);
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();
  }

  drawSplashParticles(ctx) {
    ctx.save();
    for (let p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawRackAndDraggedObjects(ctx) {
    for (let obj of this.objects) {
      if (!obj.inCylinder || obj === this.draggedObj) {
        this.render3DObject(ctx, obj.x, obj.y, obj);
      }
    }
  }

  // =========================================================================
  // 3D SPECIMEN RENDERER (NO FLAT EMOJIS!)
  // =========================================================================
  render3DObject(ctx, x, y, obj) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(obj.rotation);

    // Active glow halo
    if (obj === this.activeObj) {
      ctx.shadowColor = 'rgba(2, 132, 199, 0.6)';
      ctx.shadowBlur = 14;
    } else {
      ctx.shadowColor = 'rgba(15, 23, 42, 0.2)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;
    }

    switch (obj.type) {
      case 'bolt':
        this.drawSteelBolt(ctx);
        break;
      case 'tomato':
        this.drawCherryTomato(ctx);
        break;
      case 'lego':
        this.drawLegoBrick(ctx);
        break;
      case 'ice':
        this.drawIceCube(ctx);
        break;
      case 'wax':
        this.drawCandleWax(ctx);
        break;
      case 'cork':
        this.drawCorkStopper(ctx);
        break;
      case 'custom':
        this.drawCrystalOrb(ctx);
        break;
    }

    ctx.restore();
  }

  // 1. Steel Bolt: 3D Hex Head & Threaded Shank
  drawSteelBolt(ctx) {
    // Hexagonal Bolt Head
    const gradHead = ctx.createLinearGradient(-14, -14, 14, 14);
    gradHead.addColorStop(0, '#CBD5E1');
    gradHead.addColorStop(0.3, '#94A3B8');
    gradHead.addColorStop(0.7, '#64748B');
    gradHead.addColorStop(1, '#334155');

    ctx.fillStyle = gradHead;
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1.5;

    // Hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const hx = 13 * Math.cos(a);
      const hy = 13 * Math.sin(a) - 6;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Threaded Cylindrical Shank
    const shankW = 10;
    const shankH = 18;
    const shankX = -shankW / 2;
    const shankY = 2;

    const gradShank = ctx.createLinearGradient(shankX, 0, shankX + shankW, 0);
    gradShank.addColorStop(0, '#475569');
    gradShank.addColorStop(0.4, '#CBD5E1');
    gradShank.addColorStop(1, '#334155');

    ctx.fillStyle = gradShank;
    ctx.fillRect(shankX, shankY, shankW, shankH);
    ctx.strokeRect(shankX, shankY, shankW, shankH);

    // Thread grooves
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    for (let ty = shankY + 3; ty < shankY + shankH; ty += 3.5) {
      ctx.beginPath();
      ctx.moveTo(shankX, ty);
      ctx.lineTo(shankX + shankW, ty - 1.5);
      ctx.stroke();
    }
  }

  // 2. Cherry Tomato: Glossy organic red sphere with green calyx stem
  drawCherryTomato(ctx) {
    const r = 16;
    // Radial gradient for glossy 3D fruit sphere
    const grad = ctx.createRadialGradient(-5, -5, 2, 0, 0, r);
    grad.addColorStop(0, '#F87171');
    grad.addColorStop(0.3, '#EF4444');
    grad.addColorStop(0.7, '#DC2626');
    grad.addColorStop(1, '#991B1B');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 2, r, 0, Math.PI * 2);
    ctx.fill();

    // Specular Highlight Spot
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.ellipse(-5, -4, 4, 2.5, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Star-shaped Green Calyx (Leaf Stem on top)
    ctx.fillStyle = '#65A30D';
    ctx.strokeStyle = '#3F6212';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(8 * Math.cos(a), -12 + 6 * Math.sin(a));
      ctx.lineTo(3 * Math.cos(a + 0.3), -12 + 2 * Math.sin(a + 0.3));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Little central brown stem stalk
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.quadraticCurveTo(2, -18, 4, -20);
    ctx.stroke();
  }

  // 3. Plastic Lego Brick: 3D perspective rectangular brick with studs
  drawLegoBrick(ctx) {
    const w = 26;
    const h = 18;

    // Top face
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(-w / 2, -h / 2, w, h);

    // Front shaded bevel
    const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    grad.addColorStop(0, '#2563EB');
    grad.addColorStop(1, '#1D4ED8');
    ctx.fillStyle = grad;
    ctx.fillRect(-w / 2, -h / 2 + 4, w, h - 4);

    ctx.strokeStyle = '#1E40AF';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    // 2 Cylindrical Lego Studs on top
    const drawStud = (sx) => {
      ctx.fillStyle = '#60A5FA';
      ctx.strokeStyle = '#1D4ED8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(sx, -h / 2, 5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    };
    drawStud(-7);
    drawStud(7);
  }

  // 4. Ice Cube: Translucent crystal block with inner refractions
  drawIceCube(ctx) {
    const s = 24;
    // Translucent cyan-white icy gradient
    const grad = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
    grad.addColorStop(0, 'rgba(240, 249, 255, 0.95)');
    grad.addColorStop(0.4, 'rgba(186, 230, 253, 0.85)');
    grad.addColorStop(1, 'rgba(125, 211, 252, 0.75)');

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(-s / 2, -s / 2, s, s, 4);
    ctx.fill();
    ctx.stroke();

    // Inner frosty air fissures
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(2, 2);
    ctx.lineTo(8, -2);
    ctx.stroke();

    // Specular edge glint
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-7, -7, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Candle Wax: Creamy wax cylinder with wick
  drawCandleWax(ctx) {
    const w = 18;
    const h = 24;

    // Wax body gradient
    const grad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    grad.addColorStop(0, '#FEF08A');
    grad.addColorStop(0.3, '#FEF9C3');
    grad.addColorStop(0.8, '#FDE047');
    grad.addColorStop(1, '#CA8A04');

    ctx.fillStyle = grad;
    ctx.fillRect(-w / 2, -h / 2 + 4, w, h - 4);

    // Rounded top wax pool
    ctx.fillStyle = '#FEF9C3';
    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, -h / 2 + 4, w / 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Wax body stroke
    ctx.strokeRect(-w / 2, -h / 2 + 4, w, h - 4);

    // Candle wick thread
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -h / 2 + 4);
    ctx.quadraticCurveTo(1, -h / 2 - 2, 2, -h / 2 - 4);
    ctx.stroke();
  }

  // 6. Cork Stopper: Tapered conical cork with organic pores
  drawCorkStopper(ctx) {
    const topW = 20;
    const botW = 15;
    const h = 24;

    // Tapered cork trapezoid
    const grad = ctx.createLinearGradient(-topW / 2, 0, topW / 2, 0);
    grad.addColorStop(0, '#B45309');
    grad.addColorStop(0.3, '#F59E0B');
    grad.addColorStop(0.7, '#D97706');
    grad.addColorStop(1, '#78350F');

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(-topW / 2, -h / 2);
    ctx.lineTo(topW / 2, -h / 2);
    ctx.lineTo(botW / 2, h / 2);
    ctx.lineTo(-botW / 2, h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Natural cork pores/speckles
    ctx.fillStyle = '#451A03';
    const pores = [
      { x: -4, y: -5, r: 1 },
      { x: 3, y: -2, r: 1.2 },
      { x: -2, y: 4, r: 0.9 },
      { x: 4, y: 6, r: 1.1 }
    ];
    for (let p of pores) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 7. Custom Crystal Orb: Radiant iridescent sphere
  drawCrystalOrb(ctx) {
    const r = 16;
    const grad = ctx.createRadialGradient(-4, -4, 2, 0, 0, r);
    grad.addColorStop(0, '#C084FC');
    grad.addColorStop(0.4, '#9333EA');
    grad.addColorStop(0.8, '#7E22CE');
    grad.addColorStop(1, '#581C87');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.ellipse(-5, -5, 4, 2, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Golden Equatorial Ring
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, r + 4, 5, 0.3, 0, Math.PI * 2);
    ctx.stroke();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new DensityTowerSimulation();
});
