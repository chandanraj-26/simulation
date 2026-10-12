/**
 * SpringLab — Canvas 2D Laboratory Apparatus & Harmonic Motion Renderer
 * Detailed 3D metallic spring coils, slotted brass weights, Series/Parallel linkages,
 * metric vertical ruler, reference lines, force vector arrows, and energy bars.
 */

class SpringRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;

    this.width = 1000;
    this.height = 540;

    // Default view scale: 90% for clean, spacious fit
    this.viewScale = 0.90;

    this.time = 0;
    this.lastFrameTime = performance.now();

    // World origin & scaling
    // 1 meter = scalePPM pixels
    this.scalePPM = 520.0; // pixels per meter (0.1m = 52px)
    this.apparatusX = 320; // horizontal center of laboratory stand
    this.standTopY = 85;   // top suspension hook Y coordinate

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

    // Position apparatus in the left-center, leaving right room for tray and graphs
    this.apparatusX = Math.max(260, this.width * 0.35);
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

    // Physics Step (if not dragging mass)
    const state = window.simState;
    if (!state.isPaused && !state.isDraggingMass) {
      this.updatePhysics(dt * state.simSpeed);
    }

    // Record trace history for real-time displacement graph
    state.traceHistory.push({
      t: this.time,
      x: state.x,
      xEq: state.getEquilibriumElongation()
    });
    if (state.traceHistory.length > state.maxTracePoints) {
      state.traceHistory.shift();
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

    // 1. Draw Lab Stand, Metric Ruler & Reference Lines
    this.drawLabStand(ctx, h);
    if (state.showRuler) this.drawMetricRuler(ctx);
    this.drawReferenceLines(ctx);

    // 2. Draw Coiled Spring(s)
    const springEndY = this.drawSpringApparatus(ctx);

    // 3. Draw Weight Hanger & Attached Masses
    this.drawAttachedMasses(ctx, springEndY);

    // 4. Draw Force Vectors
    if (state.showForceVectors) {
      this.drawForceVectors(ctx, springEndY);
    }

    // 5. Draw Laboratory Weight Tray (Bench)
    this.drawWeightTray(ctx);

    // 6. Draw Real-Time Oscilloscope Trace Graph
    if (state.showTraceGraph) {
      this.drawOscilloscopeGraph(ctx);
    }

    // 7. Draw Real-Time Energy Bar Chart
    if (state.showEnergyChart) {
      this.drawEnergyChart(ctx);
    }

    // 8. Draw Dragged Weight (in hand)
    if (state.draggedTrayWeight) {
      this.drawFloatingWeight(ctx, state.draggedTrayWeight, state.draggedPointerPos.x, state.draggedPointerPos.y);
    }

    ctx.restore();
  }

  // =========================================================================
  // PHYSICS INTEGRATION STEP
  // =========================================================================
  updatePhysics(dt) {
    const state = window.simState;
    const m = state.getTotalMass();
    const k = state.getEffectiveK();
    const g = state.getGravity();
    const c = state.damping;

    if (m <= 0) {
      // No mass: spring snaps to unstretched length L0
      state.x = 0;
      state.v = 0;
      state.a = 0;
      return;
    }

    // Sub-stepping for ultra-smooth 60 FPS accuracy
    const substeps = 4;
    const subDt = dt / substeps;

    for (let step = 0; step < substeps; step++) {
      const res = Physics.rk4Step(state.x, state.v, subDt, m, k, g, c);
      state.x = res.x;
      state.v = res.v;
      state.a = res.a;
    }
  }

  // =========================================================================
  // LABORATORY BACKGROUND & LIGHTING
  // =========================================================================
  drawLaboratoryBackground(ctx, w, h) {
    // Subtle classroom lab bench gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#f8fafc');
    bgGrad.addColorStop(0.7, '#f1f5f9');
    bgGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Wooden laboratory table bench surface at bottom
    const tableY = h - 35;
    const woodGrad = ctx.createLinearGradient(0, tableY, 0, h);
    woodGrad.addColorStop(0, '#78350f');
    woodGrad.addColorStop(0.2, '#92400e');
    woodGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = woodGrad;
    ctx.fillRect(0, tableY, w, 35);

    // Table edge highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(0, tableY, w, 2);
  }

  // =========================================================================
  // LABORATORY STAND & ROD
  // =========================================================================
  drawLabStand(ctx, h) {
    const sx = this.apparatusX;
    const topY = this.standTopY;
    const tableY = h - 35;

    // Heavy Cast-Iron Base Plate on Table
    ctx.save();
    ctx.fillStyle = '#334155';
    ctx.fillRect(sx - 130, tableY - 14, 180, 14);
    ctx.fillStyle = '#475569';
    ctx.fillRect(sx - 128, tableY - 14, 176, 2); // bevel highlight
    ctx.restore();

    // Vertical Stainless Steel Stand Rod
    const rodX = sx - 80;
    const rodGrad = ctx.createLinearGradient(rodX - 6, 0, rodX + 6, 0);
    rodGrad.addColorStop(0, '#94a3b8');
    rodGrad.addColorStop(0.5, '#f8fafc');
    rodGrad.addColorStop(1, '#64748b');

    ctx.fillStyle = rodGrad;
    ctx.fillRect(rodX - 5, topY - 20, 10, tableY - topY + 6);

    // Top Right-Angle Clamp & Horizontal Arm
    ctx.fillStyle = '#334155';
    ctx.fillRect(rodX - 9, topY - 12, 18, 20); // clamp block
    // Brass clamp thumbscrew
    ctx.fillStyle = '#d97706';
    ctx.fillRect(rodX - 18, topY - 6, 9, 8);

    // Horizontal Steel Arm
    const armGrad = ctx.createLinearGradient(0, topY - 5, 0, topY + 5);
    armGrad.addColorStop(0, '#cbd5e1');
    armGrad.addColorStop(0.5, '#ffffff');
    armGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = armGrad;
    ctx.fillRect(rodX, topY - 4, sx - rodX + 35, 8);

    // Suspension Hook at sx
    ctx.save();
    ctx.strokeStyle = '#d97706'; // brass ring
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(sx, topY + 8, 7, Math.PI, Math.PI * 2.8);
    ctx.stroke();
    ctx.restore();
  }

  // =========================================================================
  // VERTICAL METRIC RULER (Centimeters & Millimeters)
  // =========================================================================
  drawMetricRuler(ctx) {
    const rx = this.apparatusX + 90;
    const topY = this.standTopY;
    const rulerH = 410;

    ctx.save();
    // Yellowish Wooden / Acrylic Lab Ruler
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(rx, topY, 32, rulerH);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1;
    ctx.strokeRect(rx, topY, 32, rulerH);

    // Tick Marks (0 to 60 cm)
    // 1 cm = scalePPM * 0.01 = 5.2 px
    const cmPixels = this.scalePPM * 0.01;
    ctx.fillStyle = '#78350f';
    ctx.font = '700 8.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    for (let cm = 0; cm <= 70; cm++) {
      const y = topY + cm * cmPixels;
      if (y > topY + rulerH - 4) break;

      ctx.beginPath();
      ctx.strokeStyle = '#92400e';
      if (cm % 10 === 0) {
        // Major 10 cm line
        ctx.lineWidth = 1.5;
        ctx.moveTo(rx, y);
        ctx.lineTo(rx + 16, y);
        ctx.stroke();
        ctx.fillText(`${cm}`, rx + 28, y + 3);
      } else if (cm % 5 === 0) {
        // 5 cm line
        ctx.lineWidth = 1.2;
        ctx.moveTo(rx, y);
        ctx.lineTo(rx + 11, y);
        ctx.stroke();
      } else {
        // 1 cm line
        ctx.lineWidth = 0.8;
        ctx.moveTo(rx, y);
        ctx.lineTo(rx + 6, y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // =========================================================================
  // REFERENCE LINES (Unstretched L0, Equilibrium, Current Extension)
  // =========================================================================
  drawReferenceLines(ctx) {
    const state = window.simState;
    const sx = this.apparatusX;
    const topY = this.standTopY;
    const ppm = this.scalePPM;

    const unstretchedY = topY + state.unstretchedLength * ppm;
    const eqY = unstretchedY + state.getEquilibriumElongation() * ppm;
    const currentY = unstretchedY + state.x * ppm;

    ctx.save();

    // 1. Unstretched Resting Length Line (L0)
    if (state.showUnstretchedLine) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(sx - 60, unstretchedY);
      ctx.lineTo(sx + 130, unstretchedY);
      ctx.stroke();

      ctx.fillStyle = '#059669';
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`L₀ = ${(state.unstretchedLength * 100).toFixed(0)} cm (Unstretched)`, sx + 134, unstretchedY + 3);
    }

    // 2. Equilibrium Line (Static Rest Position)
    if (state.showEquilibriumLine && state.getTotalMass() > 0) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(sx - 60, eqY);
      ctx.lineTo(sx + 130, eqY);
      ctx.stroke();

      const deltaXcm = (state.getEquilibriumElongation() * 100).toFixed(1);
      ctx.fillStyle = '#0284c7';
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Equilibrium (Δx = ${deltaXcm} cm)`, sx + 134, eqY + 3);
    }

    // 3. Current Elongation Indicator
    if (state.showExtremeLine) {
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sx - 50, currentY);
      ctx.lineTo(sx + 90, currentY);
      ctx.stroke();
    }

    ctx.restore();
  }

  // =========================================================================
  // COILED SPRING(S) DRAWING
  // =========================================================================
  drawSpringApparatus(ctx) {
    const state = window.simState;
    const sx = this.apparatusX;
    const topY = this.standTopY + 16;
    const ppm = this.scalePPM;

    // Total stretched spring length in pixels
    const totalLengthPx = Math.max(30, (state.unstretchedLength + state.x) * ppm);

    if (state.mode === 'single' || state.mode === 'mystery') {
      // Single Spring
      this.drawSpringCoil(ctx, sx, topY, totalLengthPx, 18, state.k1);
      return topY + totalLengthPx;
    } else if (state.mode === 'parallel') {
      // Twin Parallel Springs side by side
      const spacing = 28;
      // Top connecting bar
      ctx.fillStyle = '#475569';
      ctx.fillRect(sx - spacing - 4, topY - 2, spacing * 2 + 8, 4);

      // Left spring (k1)
      this.drawSpringCoil(ctx, sx - spacing, topY + 2, totalLengthPx - 4, 14, state.k1);
      // Right spring (k2)
      this.drawSpringCoil(ctx, sx + spacing, topY + 2, totalLengthPx - 4, 14, state.k2);

      // Bottom connecting bar
      const bottomY = topY + totalLengthPx;
      ctx.fillStyle = '#475569';
      ctx.fillRect(sx - spacing - 4, bottomY - 2, spacing * 2 + 8, 4);

      // Center hook
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(sx, bottomY + 6, 6, Math.PI, Math.PI * 2.8);
      ctx.stroke();

      return bottomY + 12;
    } else if (state.mode === 'series') {
      // Two Springs in Series (one below the other linked by connector ring)
      const halfLen = totalLengthPx * 0.5;

      // Spring 1 (top)
      this.drawSpringCoil(ctx, sx, topY, halfLen, 16, state.k1);

      // Connecting brass ring
      const midY = topY + halfLen;
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sx, midY, 5, 0, Math.PI * 2);
      ctx.stroke();

      // Spring 2 (bottom)
      this.drawSpringCoil(ctx, sx, midY + 8, halfLen - 8, 16, state.k2);

      return topY + totalLengthPx;
    }

    return topY + totalLengthPx;
  }

  /**
   * Draws a realistic 3D metallic spring helix
   */
  drawSpringCoil(ctx, cx, startY, length, coilRadius, k) {
    // Number of coils scales slightly with spring constant k (14 to 22 coils)
    const numCoils = Math.round(14 + (k / 100.0) * 8);
    const coilStep = (length - 20) / numCoils;

    ctx.save();

    // Top straight lead wire
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, startY);
    ctx.lineTo(cx, startY + 10);
    ctx.stroke();

    let curY = startY + 10;

    // Coiled Helix with 3D gradient illusion
    for (let c = 0; c < numCoils; c++) {
      const nextY = curY + coilStep;

      // Back half of coil (shadowed)
      ctx.beginPath();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.4;
      ctx.moveTo(cx - coilRadius, curY + coilStep * 0.25);
      ctx.bezierCurveTo(cx - coilRadius, curY + coilStep * 0.1, cx + coilRadius, curY + coilStep * 0.1, cx + coilRadius, curY + coilStep * 0.5);
      ctx.stroke();

      // Front half of coil (highlighted steel)
      ctx.beginPath();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.8;
      ctx.moveTo(cx + coilRadius, curY + coilStep * 0.5);
      ctx.bezierCurveTo(cx + coilRadius, curY + coilStep * 0.85, cx - coilRadius, curY + coilStep * 0.85, cx - coilRadius, nextY + coilStep * 0.25);
      ctx.stroke();

      curY = nextY;
    }

    // Bottom straight lead wire & hook ring
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, curY);
    ctx.lineTo(cx, startY + length - 8);
    ctx.stroke();

    // Bottom hook loop
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, startY + length, 7, -Math.PI / 2, Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  // =========================================================================
  // ATTACHED MASSES & WEIGHT HANGER
  // =========================================================================
  drawAttachedMasses(ctx, hookY) {
    const state = window.simState;
    const sx = this.apparatusX;
    const weights = state.attachedWeights;

    // Hanger Rod extending downwards from hook
    let curY = hookY + 8;

    // Hitbox for grabbing and dragging the spring mass
    const grabH = Math.max(50, weights.length * 16 + 30);
    this.hitBoxes.push({
      type: 'spring_mass',
      x: sx - 40,
      y: hookY,
      w: 80,
      h: grabH
    });

    if (weights.length === 0) {
      // Empty brass hanger
      ctx.save();
      ctx.fillStyle = '#d97706';
      ctx.fillRect(sx - 2, curY, 4, 30);
      ctx.fillRect(sx - 14, curY + 30, 28, 4); // base plate
      ctx.restore();
      return;
    }

    // Draw stack of weights
    ctx.save();
    weights.forEach((w, idx) => {
      this.drawWeightEntity(ctx, w, sx, curY);
      curY += this.getWeightHeight(w);
    });

    // Mass grab handle glow if hovered/dragging
    if (state.isDraggingMass) {
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(sx - 42, hookY - 2, 84, grabH + 4);
    }

    ctx.restore();
  }

  getWeightHeight(w) {
    if (w.type === 'cylinder') return 28;
    if (w.type === 'block') return 36;
    if (w.type === 'crown') return 32;
    if (w.type === 'crystal') return 28;
    if (w.type === 'wood') return 24;
    return 14; // disc
  }

  drawWeightEntity(ctx, w, cx, cy) {
    ctx.save();

    if (w.type === 'crown') {
      // Golden Royal Crown (Mystery)
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy + 28);
      ctx.lineTo(cx + 24, cy + 28);
      ctx.lineTo(cx + 22, cy);
      ctx.lineTo(cx + 11, cy + 12);
      ctx.lineTo(cx, cy - 2);
      ctx.lineTo(cx - 11, cy + 12);
      ctx.lineTo(cx - 22, cy);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Jewels
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, cy + 18, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#78350f';
      ctx.font = '700 8px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('👑 CROWN', cx, cy + 26);
    } else if (w.type === 'crystal') {
      // Quartz Geode
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 18, cy + 12);
      ctx.lineTo(cx + 12, cy + 26);
      ctx.lineTo(cx - 12, cy + 26);
      ctx.lineTo(cx - 18, cy + 12);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#6b21a8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 8px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('💎 GEM', cx, cy + 18);
    } else if (w.type === 'wood') {
      // Wooden block
      ctx.fillStyle = '#92400e';
      ctx.fillRect(cx - 20, cy, 40, 22);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 20, cy, 40, 22);

      ctx.fillStyle = '#fef3c7';
      ctx.font = '700 8px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🪵 WOOD', cx, cy + 14);
    } else if (w.type === 'block') {
      // 1000g Heavy Cast Iron Block
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx - 30, cy, 60, 32);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - 30, cy, 60, 32);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('1000 g', cx, cy + 20);
    } else if (w.type === 'cylinder') {
      // 500g Brass Cylinder
      const grad = ctx.createLinearGradient(cx - 22, 0, cx + 22, 0);
      grad.addColorStop(0, '#b45309');
      grad.addColorStop(0.4, '#fde68a');
      grad.addColorStop(1, '#92400e');
      ctx.fillStyle = grad;
      ctx.fillRect(cx - 22, cy, 44, 26);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(cx - 22, cy, 44, 26);

      ctx.fillStyle = '#451a03';
      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('500 g', cx, cy + 17);
    } else {
      // Slotted Brass Disc
      const discW = Math.min(56, 32 + (w.mass / 0.25) * 12);
      const grad = ctx.createLinearGradient(cx - discW / 2, 0, cx + discW / 2, 0);
      grad.addColorStop(0, '#d97706');
      grad.addColorStop(0.35, '#fef08a');
      grad.addColorStop(1, '#b45309');
      ctx.fillStyle = grad;
      ctx.fillRect(cx - discW / 2, cy, discW, 12);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - discW / 2, cy, discW, 12);

      // Slotted opening
      ctx.fillStyle = '#451a03';
      ctx.fillRect(cx - 2, cy, 4, 12);

      ctx.fillStyle = '#451a03';
      ctx.font = '700 8px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(w.mass * 1000)}g`, cx - discW / 4, cy + 9);
    }

    ctx.restore();
  }

  // =========================================================================
  // FORCE VECTORS (Spring Force Fs, Weight W, Net Force Fnet)
  // =========================================================================
  drawForceVectors(ctx, hookY) {
    const state = window.simState;
    const sx = this.apparatusX - 55;
    const m = state.getTotalMass();
    if (m <= 0) return;

    const g = state.getGravity();
    const k = state.getEffectiveK();

    // Forces in Newtons
    const fGravity = m * g; // downwards
    const fSpring = k * state.x; // upwards
    const fNet = fGravity - fSpring;

    // Vector scale: 1 Newton = 12 pixels
    const vecScale = 14.0;
    const cy = hookY + 20;

    ctx.save();
    // 1. Restoring Spring Force (Fs) - Blue upwards
    if (Math.abs(fSpring) > 0.05) {
      this.drawArrow(ctx, sx, cy, sx, cy - fSpring * vecScale, '#0284c7', `F_s = ${fSpring.toFixed(1)} N`);
    }

    // 2. Gravitational Weight Force (W) - Orange downwards
    if (fGravity > 0.05) {
      this.drawArrow(ctx, sx + 22, cy, sx + 22, cy + fGravity * vecScale, '#ea580c', `W = ${fGravity.toFixed(1)} N`);
    }

    // 3. Net Force (Fnet) - Purple
    if (Math.abs(fNet) > 0.1) {
      this.drawArrow(ctx, sx - 22, cy, sx - 22, cy + fNet * vecScale, '#8b5cf6', `F_net = ${fNet.toFixed(1)} N`);
    }
    ctx.restore();
  }

  drawArrow(ctx, fromX, fromY, toX, toY, color, label) {
    const headLen = 6;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.2;

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
  // LABORATORY BENCH WEIGHT TRAY
  // =========================================================================
  drawWeightTray(ctx) {
    const state = window.simState;
    const tx = Math.max(this.apparatusX + 170, this.width - 290);
    const ty = 85;
    const tw = 250;
    const th = 175;

    ctx.save();
    // Wooden Storage Tray
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(tx, ty, tw, th);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.strokeRect(tx, ty, tw, th);

    // Tray Header Banner
    ctx.fillStyle = '#b45309';
    ctx.fillRect(tx, ty, tw, 22);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 10.5px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚖️ WEIGHT TRAY (DRAG ONTO HOOK)', tx + tw / 2, ty + 15);

    // Grid of weights in tray
    const cols = 4;
    const itemW = 54;
    const itemH = 65;

    state.benchWeights.forEach((w, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const ix = tx + 14 + col * (itemW + 6);
      const iy = ty + 32 + row * (itemH + 4);

      // Register hitbox for dragging
      this.hitBoxes.push({
        type: 'tray_weight',
        weight: w,
        x: ix,
        y: iy,
        w: itemW,
        h: itemH
      });

      // Item holder slot box
      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(ix, iy, itemW, itemH);
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 1;
      ctx.strokeRect(ix, iy, itemW, itemH);

      // Draw weight icon
      this.drawWeightEntity(ctx, w, ix + itemW / 2, iy + 8);

      // Label below
      ctx.fillStyle = '#78350f';
      ctx.font = '600 8.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      const label = w.isMystery ? 'Mystery' : `${Math.round(w.mass * 1000)}g`;
      ctx.fillText(label, ix + itemW / 2, iy + itemH - 6);
    });

    ctx.restore();
  }

  drawFloatingWeight(ctx, w, x, y) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    this.drawWeightEntity(ctx, w, x, y - 10);
    ctx.restore();
  }

  // =========================================================================
  // REAL-TIME DISPLACEMENT OSCILLOSCOPE GRAPH (x vs t)
  // =========================================================================
  drawOscilloscopeGraph(ctx) {
    const state = window.simState;
    const gx = Math.max(this.apparatusX + 170, this.width - 290);
    const gy = 275;
    const gw = 250;
    const gh = 110;

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
    ctx.fillText('DISPLACEMENT x(t) [cm]', gx + 8, gy + 14);

    // Center zero/equilibrium line
    const zeroY = gy + gh * 0.55;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(gx, zeroY);
    ctx.lineTo(gx + gw, zeroY);
    ctx.stroke();

    // Plot real-time wave
    if (state.traceHistory.length > 1) {
      ctx.setLineDash([]);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const numPts = state.traceHistory.length;
      const dx = gw / state.maxTracePoints;

      state.traceHistory.forEach((pt, idx) => {
        const xPos = gx + idx * dx;
        // Scale: 1 cm elongation = 3 px
        const offsetCm = (pt.x - pt.xEq) * 100.0;
        const yPos = zeroY + offsetCm * 2.4;
        if (idx === 0) ctx.moveTo(xPos, yPos);
        else ctx.lineTo(xPos, yPos);
      });

      ctx.stroke();
    }

    // Live Readout
    const curExtCm = ((state.x - state.getEquilibriumElongation()) * 100).toFixed(1);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${curExtCm > 0 ? '+' : ''}${curExtCm} cm`, gx + gw - 8, gy + 14);

    ctx.restore();
  }

  // =========================================================================
  // REAL-TIME ENERGY BAR CHART (Ek, Ep, Eg, Etot)
  // =========================================================================
  drawEnergyChart(ctx) {
    const state = window.simState;
    const bx = Math.max(this.apparatusX + 170, this.width - 290);
    const by = 400;
    const bw = 250;
    const bh = 95;

    const m = state.getTotalMass();
    const k = state.getEffectiveK();
    const g = state.getGravity();

    const energies = Physics.calculateEnergies(state.x, state.v, m, k, g);

    ctx.save();
    // Card container
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

    // 3 Bars: Ek (Kinetic), Ep (Elastic), Etot
    const maxE = Math.max(0.5, energies.ke + energies.peElastic);
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

    renderBar('Kinetic', energies.ke, '#3b82f6', by + 26);
    renderBar('Elastic', energies.peElastic, '#f97316', by + 46);
    renderBar('Total E', energies.ke + energies.peElastic, '#8b5cf6', by + 66);

    ctx.restore();
  }
}

window.SpringRenderer = SpringRenderer;
