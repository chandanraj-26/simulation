/**
 * PendulumLab — Canvas 2D Classical Pendulum & Phase Space Renderer
 * High-DPI physics rendering, metallic bob shading, protractor angle arc,
 * tension & gravity vectors, photogate laser sensor, phase space plot, and energy bars.
 */

class PendulumRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;

    this.width = 1000;
    this.height = 540;

    // Default view scale: 90% for clean spacious layout
    this.viewScale = 0.90;

    this.time = 0;
    this.lastFrameTime = performance.now();

    // World origin & scaling
    // 1 meter = scalePPM pixels
    this.scalePPM = 180.0; // pixels per meter (1.0m = 180px)
    this.pivotX = 330;     // horizontal pivot position
    this.pivotY = 90;      // vertical pivot position

    this.hitBoxes = [];
  }

  setZoom(scale) {
    this.viewScale = Math.max(0.65, Math.min(1.35, scale));
  }

  zoomIn() {
    this.setZoom(this.viewScale + 0.08);
  }

  zoomOut() {
    this.setZoom(this.viewScale - 0.08);
  }

  resetZoom() {
    this.setZoom(0.90);
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width || 960;
    this.height = rect.height || 540;

    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);

    this.pivotX = Math.max(260, this.width * 0.36);
  }

  transformPointerPos(raw) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    return {
      x: cx + (raw.x - cx) / this.viewScale,
      y: cy + (raw.y - cy) / this.viewScale
    };
  }

  // =========================================================================
  // MAIN ANIMATION LOOP
  // =========================================================================
  render() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000.0);
    this.lastFrameTime = now;
    this.time += dt;

    this.hitBoxes = [];
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // Physics Step (if not dragging bob)
    const state = window.simState;
    if (!state.isPaused) {
      this.updatePhysics(dt * state.simSpeed);
    }

    // Draw Background
    this.drawLaboratoryBackground(ctx, w, h);

    // Apply View Zoom
    ctx.save();
    const cx = w / 2;
    const cy = h / 2;
    ctx.translate(cx, cy);
    ctx.scale(this.viewScale, this.viewScale);
    ctx.translate(-cx, -cy);

    // 1. Draw Lab Stand & Ceiling Support
    this.drawLabStand(ctx, h);

    // 2. Draw Top Protractor Angle Arc
    if (state.showProtractor) {
      this.drawProtractor(ctx);
    }

    // 3. Draw Equilibrium Reference Line & Photogate Sensor
    this.drawEquilibriumLine(ctx);
    if (state.showPhotogate) {
      this.drawPhotogateSensor(ctx);
    }

    // 4. Draw Trajectory Trail(s)
    if (state.showTracePath) {
      this.drawMotionTrails(ctx);
    }

    // 5. Draw Pendulum 2 (in Isochronism / Dual mode)
    if (state.mode === 'isochronism') {
      this.drawSinglePendulum(ctx, 2, state.theta2, state.omega2, state.length2, state.mass2, '#ea580c', '#fed7aa');
    }

    // 6. Draw Pendulum 1 (Primary)
    this.drawSinglePendulum(ctx, 1, state.theta1, state.omega1, state.length1, state.mass1, '#0284c7', '#bae6fd');

    // 7. Draw Real-Time Oscilloscope Wave / Phase Space Card
    if (state.mode === 'phase_space') {
      this.drawPhaseSpacePortrait(ctx);
    } else {
      this.drawAngleWaveform(ctx);
    }

    // 8. Draw Real-Time Mechanical Energy Bar Chart
    if (state.showEnergyBars) {
      this.drawEnergyChart(ctx);
    }

    ctx.restore();
  }

  // =========================================================================
  // PHYSICS INTEGRATION STEP (RK4)
  // =========================================================================
  updatePhysics(dt) {
    const state = window.simState;
    const g = state.getGravity();
    const substeps = 4;
    const subDt = dt / substeps;

    // Substep Pendulum 1
    if (!state.isDraggingBob1) {
      for (let s = 0; s < substeps; s++) {
        const res = Physics.rk4Step(state.theta1, state.omega1, subDt, state.length1, state.mass1, g, state.damping);
        state.theta1 = res.theta;
        state.omega1 = res.omega;
        state.alpha1 = res.alpha;
      }

      // Check Photogate Crossing (crossing theta = 0)
      this.checkPhotogateCrossing(state.theta1);
    }

    // Substep Pendulum 2 (in Isochronism mode)
    if (state.mode === 'isochronism' && !state.isDraggingBob2) {
      for (let s = 0; s < substeps; s++) {
        const res = Physics.rk4Step(state.theta2, state.omega2, subDt, state.length2, state.mass2, g, state.damping);
        state.theta2 = res.theta;
        state.omega2 = res.omega;
        state.alpha2 = res.alpha;
      }
    }

    // Record trail points
    const p1 = this.getBobCanvasPos(state.theta1, state.length1);
    state.trail1.push({ x: p1.x, y: p1.y });
    if (state.trail1.length > state.maxTrailPoints) state.trail1.shift();

    if (state.mode === 'isochronism') {
      const p2 = this.getBobCanvasPos(state.theta2, state.length2);
      state.trail2.push({ x: p2.x, y: p2.y });
      if (state.trail2.length > state.maxTrailPoints) state.trail2.shift();
    }

    // Record Phase portrait
    state.phasePoints.push({ theta: state.theta1, omega: state.omega1 });
    if (state.phasePoints.length > state.maxPhasePoints) state.phasePoints.shift();
  }

  checkPhotogateCrossing(theta) {
    const state = window.simState;
    const dir = Math.sign(theta);

    if (state.photogate.lastDirection !== 0 && dir !== 0 && dir !== state.photogate.lastDirection) {
      // Crossed equilibrium zero line!
      const now = performance.now();
      if (state.photogate.lastCrossingTime !== null) {
        const halfPeriod = (now - state.photogate.lastCrossingTime) / 1000.0;
        // Two consecutive crossings form a full period
        if (state.photogate.crossingCount % 2 === 0 && halfPeriod > 0.15) {
          state.photogate.measuredPeriod = halfPeriod * 2.0;
        }
      }
      state.photogate.lastCrossingTime = now;
      state.photogate.crossingCount++;

      if (window.soundEngine) window.soundEngine.playPhotogateChime();
    }

    state.photogate.lastDirection = dir;
  }

  getBobCanvasPos(theta, length) {
    const rPixels = length * this.scalePPM;
    return {
      x: this.pivotX + rPixels * Math.sin(theta),
      y: this.pivotY + rPixels * Math.cos(theta)
    };
  }

  // =========================================================================
  // ENVIRONMENT & LABORATORY BACKGROUND
  // =========================================================================
  drawLaboratoryBackground(ctx, w, h) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#f8fafc');
    bgGrad.addColorStop(0.7, '#f1f5f9');
    bgGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Bottom polished bench
    const tableY = h - 35;
    const woodGrad = ctx.createLinearGradient(0, tableY, 0, h);
    woodGrad.addColorStop(0, '#78350f');
    woodGrad.addColorStop(0.2, '#92400e');
    woodGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = woodGrad;
    ctx.fillRect(0, tableY, w, 35);
  }

  // =========================================================================
  // LABORATORY STAND & PIVOT
  // =========================================================================
  drawLabStand(ctx, h) {
    const px = this.pivotX;
    const py = this.pivotY;
    const tableY = h - 35;

    // Heavy Cast Iron Base Plate
    ctx.save();
    ctx.fillStyle = '#334155';
    ctx.fillRect(px - 140, tableY - 14, 180, 14);
    ctx.fillStyle = '#475569';
    ctx.fillRect(px - 138, tableY - 14, 176, 2);

    // Vertical Stand Rod
    const rodX = px - 90;
    const rodGrad = ctx.createLinearGradient(rodX - 6, 0, rodX + 6, 0);
    rodGrad.addColorStop(0, '#94a3b8');
    rodGrad.addColorStop(0.5, '#f8fafc');
    rodGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = rodGrad;
    ctx.fillRect(rodX - 5, py - 30, 10, tableY - py + 16);

    // Top Clamp Block
    ctx.fillStyle = '#334155';
    ctx.fillRect(rodX - 9, py - 20, 18, 24);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(rodX - 18, py - 14, 9, 8); // clamp screw

    // Horizontal Arm
    const armGrad = ctx.createLinearGradient(0, py - 5, 0, py + 5);
    armGrad.addColorStop(0, '#cbd5e1');
    armGrad.addColorStop(0.5, '#ffffff');
    armGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = armGrad;
    ctx.fillRect(rodX, py - 5, px - rodX + 35, 10);

    // Center Low-Friction Brass Ball-Bearing Pivot
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#d97706';
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  // =========================================================================
  // PROTRACTOR ANGLE ARC
  // =========================================================================
  drawProtractor(ctx) {
    const px = this.pivotX;
    const py = this.pivotY;
    const r = 70;

    ctx.save();
    // Semi-transparent protractor fan
    ctx.beginPath();
    ctx.arc(px, py, r, Math.PI * 0.1, Math.PI * 0.9);
    ctx.fillStyle = 'rgba(2, 132, 199, 0.05)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Degree ticks
    ctx.fillStyle = '#475569';
    ctx.font = '600 8.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    const angles = [-60, -45, -30, -15, 0, 15, 30, 45, 60];
    angles.forEach(deg => {
      const rad = (deg * Math.PI) / 180.0;
      // In screen coords, 0 deg is downwards (PI / 2)
      const screenAngle = Math.PI / 2 + rad;
      const x1 = px + r * Math.cos(screenAngle);
      const y1 = py + r * Math.sin(screenAngle);
      const x2 = px + (r + (deg % 30 === 0 ? 8 : 4)) * Math.cos(screenAngle);
      const y2 = py + (r + (deg % 30 === 0 ? 8 : 4)) * Math.sin(screenAngle);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      if (deg % 30 === 0 && deg !== 0) {
        const tx = px + (r + 18) * Math.cos(screenAngle);
        const ty = py + (r + 18) * Math.sin(screenAngle);
        ctx.fillText(`${Math.abs(deg)}°`, tx, ty);
      }
    });

    ctx.restore();
  }

  // =========================================================================
  // EQUILIBRIUM LINE & PHOTOGATE SENSOR
  // =========================================================================
  drawEquilibriumLine(ctx) {
    const px = this.pivotX;
    const py = this.pivotY;
    const maxL = 2.4 * this.scalePPM;

    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(px, py + 12);
    ctx.lineTo(px, py + maxL);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '700 8.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Equilibrium (θ = 0°)', px, py + maxL + 12);
    ctx.restore();
  }

  drawPhotogateSensor(ctx) {
    const px = this.pivotX;
    const py = this.pivotY;
    const state = window.simState;
    const sensorY = py + state.length1 * this.scalePPM;

    ctx.save();
    // U-shaped optical bracket
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(px - 22, sensorY - 14, 8, 28);
    ctx.fillRect(px + 14, sensorY - 14, 8, 28);
    ctx.fillRect(px - 22, sensorY + 10, 44, 6); // base bridge

    // Red Infrared Laser Line across the gate
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px - 14, sensorY);
    ctx.lineTo(px + 14, sensorY);
    ctx.stroke();

    // LED Status indicator
    const isTriggered = Math.abs(state.theta1) < 0.06;
    ctx.fillStyle = isTriggered ? '#22c55e' : '#dc2626';
    ctx.beginPath();
    ctx.arc(px + 20, sensorY - 8, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // MOTION TRAILS
  // =========================================================================
  drawMotionTrails(ctx) {
    const state = window.simState;

    // Trail 1
    if (state.trail1.length > 1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      state.trail1.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.restore();
    }

    // Trail 2 (Isochronism mode)
    if (state.mode === 'isochronism' && state.trail2.length > 1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      state.trail2.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.restore();
    }
  }

  // =========================================================================
  // SINGLE PENDULUM DRAWING (String, Bob, Vectors, Angle Readout)
  // =========================================================================
  drawSinglePendulum(ctx, id, theta, omega, length, mass, mainColor, accentColor) {
    const state = window.simState;
    const px = this.pivotX;
    const py = this.pivotY;
    const bob = this.getBobCanvasPos(theta, length);

    // Bob Radius scales with cube-root of mass: r = 12 to 24px
    const bobRadius = Math.round(11 + Math.cbrt(mass) * 8);

    // Register Hitbox for dragging
    this.hitBoxes.push({
      type: `pendulum_bob_${id}`,
      id: id,
      x: bob.x - bobRadius - 6,
      y: bob.y - bobRadius - 6,
      w: (bobRadius + 6) * 2,
      h: (bobRadius + 6) * 2
    });

    ctx.save();

    // 1. Taut String
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(bob.x, bob.y);
    ctx.stroke();

    // 2. 3D Spherical Metallic Bob
    const grad = ctx.createRadialGradient(bob.x - bobRadius * 0.35, bob.y - bobRadius * 0.35, 2, bob.x, bob.y, bobRadius);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, accentColor);
    grad.addColorStop(0.8, mainColor);
    grad.addColorStop(1, '#0f172a');

    ctx.beginPath();
    ctx.arc(bob.x, bob.y, bobRadius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Mass Stamp Label
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 8.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${mass.toFixed(2)}kg`, bob.x, bob.y + 3);

    // Angle degree readout above bob
    const deg = Physics.radToDeg(theta);
    ctx.fillStyle = mainColor;
    ctx.font = '700 9.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${deg.toFixed(1)}°`, bob.x, bob.y - bobRadius - 8);

    // 3. Force Vectors
    if (state.showForceVectors) {
      const g = state.getGravity();
      const tension = Physics.calculateTension(theta, omega, length, mass, g);
      const weight = mass * g;
      const vecScale = 8.0;

      // Tension Arrow (pointing toward pivot)
      const tAngle = Math.atan2(py - bob.y, px - bob.x);
      const tx = bob.x + tension * vecScale * Math.cos(tAngle);
      const ty = bob.y + tension * vecScale * Math.sin(tAngle);
      this.drawArrow(ctx, bob.x, bob.y, tx, ty, '#0284c7', `T = ${tension.toFixed(1)} N`);

      // Weight Arrow (pointing straight down)
      this.drawArrow(ctx, bob.x, bob.y, bob.x, bob.y + weight * vecScale, '#ef4444', `W = ${weight.toFixed(1)} N`);

      // Velocity Vector (tangent to circle)
      if (state.showVelocityVector && Math.abs(omega) > 0.05) {
        const v = length * omega;
        const vScale = 14.0;
        const vAngle = theta; // perpendicular to radius
        const vx = bob.x + v * vScale * Math.cos(vAngle);
        const vy = bob.y - v * vScale * Math.sin(vAngle);
        this.drawArrow(ctx, bob.x, bob.y, vx, vy, '#10b981', `v = ${Math.abs(v).toFixed(1)} m/s`);
      }
    }

    ctx.restore();
  }

  drawArrow(ctx, fromX, fromY, toX, toY, color, label) {
    const headLen = 6;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.0;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    if (label) {
      ctx.font = '700 8.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, toX, toY + (toY > fromY ? 12 : -6));
    }
    ctx.restore();
  }

  // =========================================================================
  // REAL-TIME ANGLE WAVEFORM OSCILLOSCOPE θ(t)
  // =========================================================================
  drawAngleWaveform(ctx) {
    const state = window.simState;
    const gx = Math.max(this.pivotX + 170, this.width - 290);
    const gy = 85;
    const gw = 250;
    const gh = 120;

    ctx.save();
    // Dark CRT oscilloscope card
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(gx, gy, gw, gh);

    // Title banner
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 9.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('OSCILLOSCOPE θ(t) [deg]', gx + 8, gy + 14);

    // Center zero angle line
    const zeroY = gy + gh * 0.55;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(gx, zeroY);
    ctx.lineTo(gx + gw, zeroY);
    ctx.stroke();

    // Plot real-time wave from phase history
    if (state.phasePoints.length > 1) {
      ctx.setLineDash([]);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const numPts = state.phasePoints.length;
      const dx = gw / state.maxPhasePoints;

      state.phasePoints.forEach((pt, idx) => {
        const xPos = gx + idx * dx;
        const deg = Physics.radToDeg(pt.theta);
        // Scale: 45 deg = 35 px
        const yPos = zeroY - (deg / 60.0) * 40.0;
        if (idx === 0) ctx.moveTo(xPos, yPos);
        else ctx.lineTo(xPos, yPos);
      });
      ctx.stroke();
    }

    // Live Readout
    const curDeg = Physics.radToDeg(state.theta1).toFixed(1);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${curDeg}°`, gx + gw - 8, gy + 14);

    ctx.restore();
  }

  // =========================================================================
  // PHASE SPACE PORTRAIT (θ vs. ω)
  // =========================================================================
  drawPhaseSpacePortrait(ctx) {
    const state = window.simState;
    const gx = Math.max(this.pivotX + 170, this.width - 290);
    const gy = 85;
    const gw = 250;
    const gh = 135;

    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(gx, gy, gw, gh);

    // Title
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 9.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('PHASE PORTRAIT (θ vs. ω)', gx + 8, gy + 14);

    const cx = gx + gw / 2;
    const cy = gy + gh / 2 + 6;

    // Crosshairs
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(gx, cy);
    ctx.lineTo(gx + gw, cy);
    ctx.moveTo(cx, gy + 20);
    ctx.lineTo(cx, gy + gh);
    ctx.stroke();

    // Phase orbit
    if (state.phasePoints.length > 1) {
      ctx.setLineDash([]);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.8;
      ctx.beginPath();

      state.phasePoints.forEach((p, idx) => {
        const ox = cx + (p.theta / Math.PI) * 90;
        const oy = cy - (p.omega / 6.0) * 45;
        if (idx === 0) ctx.moveTo(ox, oy);
        else ctx.lineTo(ox, oy);
      });
      ctx.stroke();

      // Current state dot
      const cur = state.phasePoints[state.phasePoints.length - 1];
      const curX = cx + (cur.theta / Math.PI) * 90;
      const curY = cy - (cur.omega / 6.0) * 45;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(curX, curY, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // =========================================================================
  // MECHANICAL ENERGY BAR CHART (Ek, Ep, Etot)
  // =========================================================================
  drawEnergyChart(ctx) {
    const state = window.simState;
    const bx = Math.max(this.pivotX + 170, this.width - 290);
    const by = 240;
    const bw = 250;
    const bh = 100;

    const g = state.getGravity();
    const e = Physics.calculateEnergies(state.theta1, state.omega1, state.length1, state.mass1, g);

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);

    // Title
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 9.5px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('⚡ MECHANICAL ENERGY CONSERVATION', bx + 8, by + 14);

    const maxE = Math.max(0.5, e.total);
    const barW = 120;
    const barH = 10;

    const renderBar = (lbl, val, color, y) => {
      ctx.fillStyle = '#64748b';
      ctx.font = '600 8.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(lbl, bx + 8, y + 8);

      // Track
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(bx + 62, y, barW, barH);

      // Value Fill
      const fillW = Math.min(barW, Math.max(0, (val / maxE) * barW));
      ctx.fillStyle = color;
      ctx.fillRect(bx + 62, y, fillW, barH);

      // Number
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 8.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${val.toFixed(2)} J`, bx + bw - 8, y + 8);
    };

    renderBar('Kinetic', e.ke, '#3b82f6', by + 26);
    renderBar('Potential', e.pe, '#ea580c', by + 46);
    renderBar('Total E', e.total, '#8b5cf6', by + 66);

    ctx.restore();
  }
}

window.PendulumRenderer = PendulumRenderer;
