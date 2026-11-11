/**
 * Magnetic Field Lines & Draggable Compass Virtual Lab
 * NCERT Class 10 & 12 Physics
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
    this.lastTickTime = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playCompassTick() {
    if (!this.enabled) return;
    const now = Date.now();
    if (now - this.lastTickTime < 60) return; // throttle ticks
    this.lastTickTime = now;

    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  playSnap() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }
}

class MagneticFieldSimulation {
  constructor() {
    this.canvas = document.getElementById('simCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundEngine();

    // Magnet properties
    this.magnetLength = 160;
    this.magnetHeight = 42;
    this.poleStrength = 1.0; // 0.2 to 2.5
    this.polarityFlipped = false; // false: N on right, S on left

    // Earth's Field
    this.earthFieldEnabled = false;
    this.earthFieldStrength = 0.25; // Points North (towards top)

    // View Options
    this.viewMode = 'lines'; // 'lines', 'filings', 'vectors', 'none'
    this.showCompass = true;

    // Draggable Compass state
    this.compass = {
      x: 0,
      y: 0,
      radius: 28,
      needleAngle: 0,
      targetAngle: 0,
      angularVel: 0,
      isDragging: false
    };

    // Iron filings cache
    this.filings = [];
    this.initFilings(700);

    // Geometry
    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    this.initDOM();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.setupInteractions();

    // Animation Loop
    this.lastFrameTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initFilings(count) {
    this.filings = [];
    for (let i = 0; i < count; i++) {
      this.filings.push({
        u: Math.random(),
        v: Math.random(),
        len: 4 + Math.random() * 5
      });
    }
  }

  initDOM() {
    this.sliderStrength = document.getElementById('sliderStrength');
    this.valStrength = document.getElementById('valStrength');
    this.selectView = document.getElementById('selectView');
    this.chkEarth = document.getElementById('chkEarth');
    this.btnFlip = document.getElementById('btnFlip');
    this.btnCenterCompass = document.getElementById('btnCenterCompass');

    this.readoutBx = document.getElementById('readoutBx');
    this.readoutBy = document.getElementById('readoutBy');
    this.readoutBTotal = document.getElementById('readoutBTotal');
    this.readoutAngle = document.getElementById('readoutAngle');

    // Audio
    this.btnAudio = document.getElementById('btnAudioToggle');
    this.btnAudio.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.btnAudio.textContent = this.sound.enabled ? '🔊 Sound: ON' : '🔈 Sound: OFF';
    });

    // Reset
    document.getElementById('btnResetAll').addEventListener('click', () => {
      this.poleStrength = 1.0;
      this.sliderStrength.value = 1.0;
      this.valStrength.textContent = '1.0×';
      this.polarityFlipped = false;
      this.earthFieldEnabled = false;
      this.chkEarth.checked = false;
      this.viewMode = 'lines';
      this.selectView.value = 'lines';
      this.centerCompass();
      this.sound.playSnap();
    });

    // Modal
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

    // Inputs
    this.sliderStrength.addEventListener('input', (e) => {
      this.poleStrength = parseFloat(e.target.value);
      this.valStrength.textContent = `${this.poleStrength.toFixed(1)}×`;
    });

    this.selectView.addEventListener('change', (e) => {
      this.viewMode = e.target.value;
      this.sound.playSnap();
    });

    this.chkEarth.addEventListener('change', (e) => {
      this.earthFieldEnabled = e.target.checked;
      this.sound.playSnap();
    });

    this.btnFlip.addEventListener('click', () => {
      this.polarityFlipped = !this.polarityFlipped;
      this.sound.playSnap();
    });

    this.btnCenterCompass.addEventListener('click', () => {
      this.centerCompass();
      this.sound.playSnap();
    });
  }

  centerCompass() {
    this.compass.x = this.width * 0.5;
    this.compass.y = this.height * 0.22;
    this.compass.angularVel = 0.2;
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (this.compass.x === 0 && this.compass.y === 0) {
      this.centerCompass();
    }
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
      const dist = Math.hypot(pos.x - this.compass.x, pos.y - this.compass.y);
      if (dist < this.compass.radius + 15) {
        this.compass.isDragging = true;
        this.canvas.style.cursor = 'grabbing';
        this.sound.playSnap();
      }
    };

    const handlePointerMove = (e) => {
      const pos = getPos(e);
      if (this.compass.isDragging) {
        this.compass.x = Math.max(30, Math.min(this.width - 30, pos.x));
        this.compass.y = Math.max(30, Math.min(this.height - 30, pos.y));
      } else {
        const dist = Math.hypot(pos.x - this.compass.x, pos.y - this.compass.y);
        this.canvas.style.cursor = dist < this.compass.radius + 15 ? 'grab' : 'crosshair';
      }
    };

    const handlePointerUp = () => {
      if (this.compass.isDragging) {
        this.compass.isDragging = false;
        this.canvas.style.cursor = 'grab';
        this.sound.playCompassTick();
      }
    };

    this.canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    this.canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
  }

  getPoles() {
    const cx = this.width * 0.5;
    const cy = this.height * 0.54;
    const halfL = this.magnetLength * 0.44;

    if (!this.polarityFlipped) {
      // South on left (-X), North on right (+X)
      return {
        north: { x: cx + halfL, y: cy },
        south: { x: cx - halfL, y: cy }
      };
    } else {
      // North on left (-X), South on right (+X)
      return {
        north: { x: cx - halfL, y: cy },
        south: { x: cx + halfL, y: cy }
      };
    }
  }

  calcFieldAt(x, y) {
    const poles = this.getPoles();
    const k = 18000 * this.poleStrength;

    // Vector from North pole (repulsive to test north pole)
    const dxN = x - poles.north.x;
    const dyN = y - poles.north.y;
    const rN2 = dxN * dxN + dyN * dyN + 100; // softening
    const rN = Math.sqrt(rN2);
    const bN = k / (rN2 * rN);
    let bx = bN * dxN;
    let by = bN * dyN;

    // Vector towards South pole (attractive to test north pole)
    const dxS = x - poles.south.x;
    const dyS = y - poles.south.y;
    const rS2 = dxS * dxS + dyS * dyS + 100;
    const rS = Math.sqrt(rS2);
    const bS = k / (rS2 * rS);
    bx -= bS * dxS;
    by -= bS * dyS;

    // Earth's Field (pointing upwards / North, -Y in screen coordinates)
    if (this.earthFieldEnabled) {
      const bEarth = this.earthFieldStrength * 1.5;
      by -= bEarth;
    }

    const bTotal = Math.hypot(bx, by);
    return { bx, by, bTotal };
  }

  animate(now) {
    const dt = Math.min((now - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = now;

    // Update compass physics with damped harmonic oscillation
    const field = this.calcFieldAt(this.compass.x, this.compass.y);
    if (field.bTotal > 0.001) {
      this.compass.targetAngle = Math.atan2(field.by, field.bx);

      // Shortest angular difference
      let diff = this.compass.targetAngle - this.compass.needleAngle;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;

      // Restoring torque proportional to field strength
      const springK = Math.min(60, 15 + field.bTotal * 12);
      const damping = 8.5;
      const torque = diff * springK;

      this.compass.angularVel += (torque - this.compass.angularVel * damping) * dt;
      this.compass.needleAngle += this.compass.angularVel * dt;

      if (Math.abs(this.compass.angularVel) > 0.8) {
        this.sound.playCompassTick();
      }
    }

    this.render();
    this.updateTelemetry(field);

    requestAnimationFrame(this.animate);
  }

  updateTelemetry(field) {
    // Convert to realistic microteslas
    const uT = (field.bTotal * 18.5).toFixed(1);
    const deg = (((this.compass.needleAngle * 180 / Math.PI) % 360 + 360) % 360).toFixed(0);

    this.readoutBTotal.textContent = `${uT} µT`;
    this.readoutBx.textContent = `${(field.bx * 18.5).toFixed(1)} µT`;
    this.readoutBy.textContent = `${(-field.by * 18.5).toFixed(1)} µT`;
    this.readoutAngle.textContent = `${deg}°`;
  }

  render() {
    if (!this.ctx || this.width === 0) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Grid
    this.drawGrid(ctx);

    // 2. View modes
    if (this.viewMode === 'lines') {
      this.drawFieldLines(ctx);
    } else if (this.viewMode === 'filings') {
      this.drawIronFilings(ctx);
    } else if (this.viewMode === 'vectors') {
      this.drawVectorGrid(ctx);
    }

    // 3. Neutral points if Earth's field is active
    if (this.earthFieldEnabled) {
      this.drawNeutralPoints(ctx);
    }

    // 4. Bar Magnet
    this.drawBarMagnet(ctx);

    // 5. Draggable Compass
    if (this.showCompass) {
      this.drawCompass(ctx);
    }
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

  drawBarMagnet(ctx) {
    const cx = this.width * 0.5;
    const cy = this.height * 0.54;
    const w = this.magnetLength;
    const h = this.magnetHeight;
    const halfW = w / 2;
    const halfH = h / 2;
    const poles = this.getPoles();

    ctx.save();

    // 1. Soft magnetic pole glow auras
    const auraRadius = 55 * Math.sqrt(this.poleStrength);
    const gradAuraN = ctx.createRadialGradient(poles.north.x, poles.north.y, 10, poles.north.x, poles.north.y, auraRadius);
    gradAuraN.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
    gradAuraN.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
    ctx.fillStyle = gradAuraN;
    ctx.beginPath();
    ctx.arc(poles.north.x, poles.north.y, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    const gradAuraS = ctx.createRadialGradient(poles.south.x, poles.south.y, 10, poles.south.x, poles.south.y, auraRadius);
    gradAuraS.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
    gradAuraS.addColorStop(1, 'rgba(37, 99, 235, 0.0)');
    ctx.fillStyle = gradAuraS;
    ctx.beginPath();
    ctx.arc(poles.south.x, poles.south.y, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Magnet Drop Shadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;

    const nLeft = this.polarityFlipped ? cx - halfW : cx;
    const sLeft = this.polarityFlipped ? cx : cx - halfW;

    // North Pole (Red 3D metallic enameled finish)
    const gradN = ctx.createLinearGradient(0, cy - halfH, 0, cy + halfH);
    gradN.addColorStop(0, '#F87171');
    gradN.addColorStop(0.2, '#EF4444');
    gradN.addColorStop(0.6, '#DC2626');
    gradN.addColorStop(1, '#991B1B');
    ctx.fillStyle = gradN;
    ctx.fillRect(nLeft, cy - halfH, halfW, h);

    // South Pole (Blue 3D metallic enameled finish)
    const gradS = ctx.createLinearGradient(0, cy - halfH, 0, cy + halfH);
    gradS.addColorStop(0, '#60A5FA');
    gradS.addColorStop(0.2, '#3B82F6');
    gradS.addColorStop(0.6, '#2563EB');
    gradS.addColorStop(1, '#1E40AF');
    ctx.fillStyle = gradS;
    ctx.fillRect(sLeft, cy - halfH, halfW, h);

    ctx.shadowBlur = 0;

    // Brushed metal reflection streak along top edge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(cx - halfW, cy - halfH + 2, w, 3);

    // Dark bottom bevel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(cx - halfW, cy + halfH - 4, w, 4);

    // Magnet Outer Border
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(cx - halfW, cy - halfH, w, h);

    // Center divider with chrome collar
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(cx - 3, cy - halfH - 1, 6, h + 2);
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 3, cy - halfH - 1, 6, h + 2);

    // Embossed Pole Letters
    ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 3;

    if (!this.polarityFlipped) {
      ctx.fillText('S', cx - halfW * 0.5, cy);
      ctx.fillText('N', cx + halfW * 0.5, cy);
    } else {
      ctx.fillText('N', cx - halfW * 0.5, cy);
      ctx.fillText('S', cx + halfW * 0.5, cy);
    }

    ctx.restore();
  }

  drawFieldLines(ctx) {
    const poles = this.getPoles();
    const seeds = 18;
    const animOffset = (performance.now() * 0.001 * 0.8) % 1.0;

    ctx.save();
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.65)';
    ctx.lineWidth = 1.6;

    for (let i = 0; i < seeds; i++) {
      const angle = (i / seeds) * 2 * Math.PI;
      let currX = poles.north.x + 18 * Math.cos(angle);
      let currY = poles.north.y + 18 * Math.sin(angle);

      const points = [{ x: currX, y: currY }];
      let step = 0;
      let insideBounds = true;

      while (step < 250 && insideBounds) {
        step++;
        const field = this.calcFieldAt(currX, currY);
        if (field.bTotal < 0.0001) break;

        const ds = 4;
        currX += (field.bx / field.bTotal) * ds;
        currY += (field.by / field.bTotal) * ds;

        points.push({ x: currX, y: currY });

        const distS = Math.hypot(currX - poles.south.x, currY - poles.south.y);
        if (distS < 16) break;

        if (currX < -50 || currX > this.width + 50 || currY < -50 || currY > this.height + 50) {
          insideBounds = false;
        }
      }

      // Draw continuous line
      ctx.beginPath();
      for (let j = 0; j < points.length; j++) {
        if (j === 0) ctx.moveTo(points[j].x, points[j].y);
        else ctx.lineTo(points[j].x, points[j].y);
      }
      ctx.stroke();

      // Draw glowing animated flux packet gliding along this line
      if (points.length > 20) {
        const pIdx = Math.floor(((i / seeds + animOffset) % 1.0) * (points.length - 1));
        const p = points[pIdx];
        if (p) {
          ctx.save();
          ctx.fillStyle = '#38BDF8';
          ctx.shadowColor = '#0284C7';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Mid-way arrow
      if (points.length > 50) {
        const midIdx = Math.floor(points.length * 0.45);
        const p1 = points[midIdx];
        const p2 = points[midIdx + 1];
        if (p1 && p2) {
          this.drawFieldArrow(ctx, p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        }
      }
    }

    ctx.restore();
  }

  drawFieldArrow(ctx, x, y, vx, vy) {
    const angle = Math.atan2(vy, vx);
    const len = 6;
    ctx.save();
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.moveTo(x + len * Math.cos(angle), y + len * Math.sin(angle));
    ctx.lineTo(x - len * Math.cos(angle - Math.PI / 6), y - len * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - len * Math.cos(angle + Math.PI / 6), y - len * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawIronFilings(ctx) {
    ctx.save();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;

    for (let f of this.filings) {
      const px = f.u * this.width;
      const py = f.v * this.height;

      const field = this.calcFieldAt(px, py);
      if (field.bTotal < 0.001) continue;

      const angle = Math.atan2(field.by, field.bx);
      const halfL = f.len * 0.5;

      ctx.beginPath();
      ctx.moveTo(px - halfL * Math.cos(angle), py - halfL * Math.sin(angle));
      ctx.lineTo(px + halfL * Math.cos(angle), py + halfL * Math.sin(angle));
      ctx.stroke();
    }

    ctx.restore();
  }

  drawVectorGrid(ctx) {
    ctx.save();
    const step = 38;
    for (let x = 30; x < this.width; x += step) {
      for (let y = 30; y < this.height; y += step) {
        const field = this.calcFieldAt(x, y);
        if (field.bTotal < 0.001) continue;

        const angle = Math.atan2(field.by, field.bx);
        const len = Math.min(18, 5 + field.bTotal * 6);
        const alpha = Math.min(0.85, 0.2 + field.bTotal * 0.3);

        ctx.strokeStyle = `rgba(2, 132, 199, ${alpha})`;
        ctx.fillStyle = `rgba(2, 132, 199, ${alpha})`;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + len * Math.cos(angle), y + len * Math.sin(angle));
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawNeutralPoints(ctx) {
    // Scan broad equatorial axis for minimum field
    const cx = this.width * 0.5;
    const poles = this.getPoles();

    // Neutral points typically occur on broadside (equatorial) or end-on (axial)
    const pts = [
      { x: cx, y: poles.north.y - 110 },
      { x: cx, y: poles.north.y + 110 }
    ];

    ctx.save();
    for (let p of pts) {
      ctx.strokeStyle = '#E11D48';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#E11D48';
      ctx.textAlign = 'center';
      ctx.fillText('N.P. (B = 0)', p.x, p.y - 18);
    }
    ctx.restore();
  }

  drawCompass(ctx) {
    const { x, y, radius, needleAngle } = this.compass;

    ctx.save();
    ctx.translate(x, y);

    // Compass Outer Brass Ring with stepped metallic finish
    ctx.shadowColor = 'rgba(15, 23, 42, 0.25)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    const brassGrad = ctx.createRadialGradient(0, 0, radius - 4, 0, 0, radius + 4);
    brassGrad.addColorStop(0, '#FDE68A');
    brassGrad.addColorStop(0.5, '#D97706');
    brassGrad.addColorStop(1, '#92400E');

    ctx.fillStyle = brassGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // White compass face dial
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, radius - 2, 0, Math.PI * 2);
    ctx.fill();

    // Degree Ticks around perimeter (every 30°)
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1;
    for (let deg = 0; deg < 360; deg += 30) {
      const a = (deg * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo((radius - 6) * Math.cos(a), (radius - 6) * Math.sin(a));
      ctx.lineTo((radius - 2) * Math.cos(a), (radius - 2) * Math.sin(a));
      ctx.stroke();
    }

    // Cardinal Points (N, S, E, W)
    ctx.font = '800 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#DC2626';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', 0, -radius + 10);

    ctx.fillStyle = '#64748B';
    ctx.fillText('S', 0, radius - 10);
    ctx.fillText('E', radius - 10, 0);
    ctx.fillText('W', -radius + 10, 0);

    // Rotating Needle
    ctx.rotate(needleAngle);

    const needleLen = radius * 0.78;
    const needleW = 5.5;

    // North Tip (Vibrant Red)
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.moveTo(0, -needleLen);
    ctx.lineTo(needleW, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.moveTo(0, -needleLen);
    ctx.lineTo(-needleW, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // South Tip (Blue)
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.moveTo(0, needleLen);
    ctx.lineTo(needleW, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1D4ED8';
    ctx.beginPath();
    ctx.moveTo(0, needleLen);
    ctx.lineTo(-needleW, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Center brass pivot jewel
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();

    // Glass lens reflection curved highlight over compass
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.ellipse(0, 0, radius - 2, radius - 2, 0, 0, Math.PI * 2);
    ctx.clip();

    const lensGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
    lensGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    lensGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.05)');
    lensGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = lensGrad;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.ellipse(-radius * 0.25, -radius * 0.25, radius * 0.55, radius * 0.3, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new MagneticFieldSimulation();
});

