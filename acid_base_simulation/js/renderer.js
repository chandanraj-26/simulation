/**
 * AcidBaseLab — High-DPI Canvas 2D Rendering Engine
 * Photorealistic laboratory apparatus with responsive proportional scaling,
 * adjustable zoom viewport, dynamic liquid vortex, and molecular equilibrium.
 */

class LaboratoryRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;

    // Viewport actual dimensions
    this.width = 1000;
    this.height = 480;

    // View zoom scale (default 0.90 for optimal spacious fit)
    this.viewScale = 0.90;

    // Animation time accumulator
    this.time = 0;
    this.lastFrameTime = performance.now();

    // Hit-testing bounding boxes for interactive canvas objects
    this.hitBoxes = [];

    // Drag tracking
    this.dragOffset = { x: 0, y: 0 };
    this.activeDragItem = null;

    // Init molecular particles
    this.initMolecularParticles();
  }

  getSubstanceShortLabel(substanceKey) {
    const labels = {
      'hcl': '0.1M HCl',
      'gastric': 'Gastric',
      'lemon': 'Lemon',
      'vinegar': 'Vinegar',
      'soda': 'Soda',
      'coffee': 'Coffee',
      'milk': 'Milk',
      'water': 'Pure Water',
      'blood': 'Blood',
      'baking_soda': 'Baking Soda',
      'magnesia': 'Mg(OH)₂',
      'ammonia': 'Ammonia',
      'bleach': 'Bleach',
      'naoh_01m': '0.1M NaOH',
      'mystery_a': 'Mystery A',
      'mystery_b': 'Mystery B',
      'mystery_c': 'Mystery C'
    };
    return labels[substanceKey] || 'Sample';
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
    this.height = rect.height || 480;

    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  }

  // =========================================================================
  // MAIN ANIMATION RENDER LOOP
  // =========================================================================
  render() {
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.lastFrameTime) / 1000.0);
    this.lastFrameTime = now;
    this.time += dt;

    this.hitBoxes = [];
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // Draw Lab Ambient Environment & Bench
    this.drawLabBackground(ctx, w, h);

    // Apply viewport zoom transform centered in canvas
    ctx.save();
    const cx = w / 2;
    const cy = h / 2;
    ctx.translate(cx, cy);
    ctx.scale(this.viewScale, this.viewScale);
    ctx.translate(-cx, -cy);

    // Mode-specific rendering
    const state = window.simState;
    if (state.mode === 'spot_tubes') {
      this.renderSpotAndTubesMode(ctx, w, h, dt);
    } else if (state.mode === 'titration') {
      this.renderTitrationMode(ctx, w, h, dt);
    } else if (state.mode === 'molecular') {
      this.renderMolecularMode(ctx, w, h, dt);
    }

    // Render Dragged Tools (Probe, Strips, Pipette)
    this.renderActiveTools(ctx, w, h);

    // Render Confetti
    this.renderParticles(ctx, dt);

    ctx.restore();
  }

  // Convert raw mouse/touch canvas coordinates to transformed space
  transformPointerPos(pos) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    return {
      x: cx + (pos.x - cx) / this.viewScale,
      y: cy + (pos.y - cy) / this.viewScale
    };
  }

  // =========================================================================
  // LAB BENCH BACKGROUND
  // =========================================================================
  drawLabBackground(ctx, w, h) {
    const benchY = h * 0.65;
    const benchH = h - benchY;

    // Wall background
    const wallGrad = ctx.createLinearGradient(0, 0, 0, benchY);
    wallGrad.addColorStop(0, '#f8fafc');
    wallGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, w, benchY);

    // Wall ceramic grid tiles
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
    ctx.lineWidth = 1;
    const tileSize = 50;
    for (let x = 0; x < w; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, benchY);
      ctx.stroke();
    }
    for (let y = 0; y < benchY; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Benchtop beveled edge highlight
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, benchY - 1, w, 2);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, benchY + 1, w, 2);

    // Polished dark laboratory benchtop
    const benchGrad = ctx.createLinearGradient(0, benchY + 3, 0, h);
    benchGrad.addColorStop(0, '#334155');
    benchGrad.addColorStop(0.12, '#1e293b');
    benchGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, benchY + 3, w, benchH - 3);

    // Surface sheen
    const glossGrad = ctx.createLinearGradient(0, benchY + 3, 0, benchY + 30);
    glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = glossGrad;
    ctx.fillRect(0, benchY + 3, w, 30);

    // Front edge trim
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, h - 8, w, 8);
  }

  // =========================================================================
  // MODE 1: SPOT PLATE & TEST TUBES LAB
  // =========================================================================
  renderSpotAndTubesMode(ctx, w, h, dt) {
    const state = window.simState;
    const benchY = h * 0.65;

    // 1. Top Shelves: Dropper Bottles, Test Strips, Digital Meter
    this.drawReagentShelf(ctx, 30, 16, 420, 72);
    this.drawLitmusDispenser(ctx, 465, 16, 210, 72);
    this.drawDigitalPHMeterBase(ctx, w - 250, 16, 220, 80);

    // 2. Test Tube Wooden Rack on left benchtop
    const rackW = 400;
    const rackH = 165;
    const rackX = 35;
    const rackY = benchY - rackH + 18;
    this.drawTestTubeRack(ctx, rackX, rackY, rackW, rackH, state.testTubes);

    // 3. Porcelain Spot Plate on right benchtop
    const plateW = 370;
    const plateH = 165;
    const plateX = 465;
    const plateY = benchY - plateH + 18;
    this.drawPorcelainSpotPlate(ctx, plateX, plateY, plateW, plateH, state.spotWells);

    // 4. Update in-flight drops
    this.updateAndDrawDropperDrops(ctx, dt);
  }

  // DRAW TEST TUBE RACK (4 GLASS TUBES)
  drawTestTubeRack(ctx, x, y, w, h, tubes) {
    const state = window.simState;

    // Wooden base of rack
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = '#b45309'; // warm mahogany wood
    ctx.fillRect(x + 10, y + 25, w - 20, 10); // top support bar
    ctx.fillRect(x + 10, y + h - 18, w - 20, 14); // bottom base plate

    // Vertical posts
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x, y + 15, 14, h - 15);
    ctx.fillRect(x + w - 14, y + 15, 14, h - 15);
    ctx.restore();

    // Tubes layout
    const tubeCount = tubes.length;
    const spacing = (w - 50) / tubeCount;

    for (let i = 0; i < tubeCount; i++) {
      const tube = tubes[i];
      const tubeX = x + 30 + i * spacing;
      const tubeY = y + 8;
      const tubeW = 36;
      const tubeH = h - 35;

      this.hitBoxes.push({
        type: 'tube',
        index: i,
        x: tubeX,
        y: tubeY,
        w: tubeW,
        h: tubeH
      });

      const isSelected = state.selectedVessel.type === 'tube' && state.selectedVessel.index === i;
      this.drawSingleTestTube(ctx, tubeX, tubeY, tubeW, tubeH, tube, isSelected, i + 1);
    }

    // Front guard rail
    ctx.fillStyle = 'rgba(180, 83, 9, 0.85)';
    ctx.fillRect(x + 10, y + h * 0.50, w - 20, 8);
  }

  drawSingleTestTube(ctx, x, y, w, h, tube, isSelected, tubeNum) {
    const sub = Chemistry.substances[tube.substanceKey];
    const r = w / 2;
    const bottomCenterY = y + h - r;

    // Selection halo
    if (isSelected) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x - 3, y - 3, w + 6, h + 6);
      ctx.restore();
    }

    // Fluid inside tube
    const liquidTopY = y + h * 0.32;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + 2, liquidTopY);
    ctx.lineTo(x + w - 2, liquidTopY);
    ctx.lineTo(x + w - 2, bottomCenterY);
    ctx.arc(x + r, bottomCenterY, r - 2, 0, Math.PI);
    ctx.lineTo(x + 2, liquidTopY);
    ctx.closePath();
    ctx.clip();

    const baseColor = tube.colorHex || 'rgba(235, 245, 255, 0.3)';
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, liquidTopY, w, h);

    // Liquid meniscus
    ctx.beginPath();
    ctx.ellipse(x + r, liquidTopY, r - 2, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();

    // Rising micro-bubbles
    for (let b = 0; b < 2; b++) {
      const bubbleX = x + 6 + ((b * 12 + this.time * 6) % (w - 12));
      const bubbleY = liquidTopY + 10 + ((b * 22 + this.time * 14) % (h * 0.5));
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fill();
    }
    ctx.restore();

    // Glass tube body outline
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, bottomCenterY);
    ctx.arc(x + r, bottomCenterY, r, 0, Math.PI);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.85)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Glass lip at top
    ctx.beginPath();
    ctx.ellipse(x + r, y, r + 2, 3.5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Specular reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(x + 2, y + 4, 4, h - 16);
    ctx.restore();

    // Clean tube labels & badge
    ctx.save();
    ctx.textAlign = 'center';

    // Badge above tube
    ctx.fillStyle = '#0284c7';
    ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Tube ${tubeNum}`, x + r, y - 6);

    // Substance label on rack
    const shortName = this.getSubstanceShortLabel(tube.substanceKey);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 9.5px "JetBrains Mono", monospace';
    ctx.fillText(shortName, x + r, y + h * 0.56);

    // Indicator status badge if added
    if (tube.indicatorKey) {
      const ind = Chemistry.indicators[tube.indicatorKey];
      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 8px "JetBrains Mono", monospace';
      ctx.fillText(`+${tube.dropsAdded}d ${ind ? ind.shortName : ''}`, x + r, y + h + 12);
    }
    ctx.restore();
  }

  // DRAW PORCELAIN SPOT PLATE (6 ROUND WELLS)
  drawPorcelainSpotPlate(ctx, x, y, w, h, wells) {
    const state = window.simState;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;

    // Glazed white ceramic plate
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    this.roundRect(ctx, x, y, w, h, 14, true, true);
    ctx.restore();

    // Title Header
    ctx.fillStyle = '#64748b';
    ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('PORCELAIN SPOT PLATE (WELLS A–F)', x + 16, y + 18);

    // 2 rows x 3 columns
    const cols = 3;
    const cellW = (w - 20) / cols;
    const cellH = (h - 26) / 2;
    const radius = 20; // Ample spacing

    wells.forEach((well, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = x + 10 + col * cellW + cellW / 2;
      const cy = y + 26 + row * cellH + cellH / 2;

      this.hitBoxes.push({
        type: 'well',
        index: idx,
        x: cx - radius,
        y: cy - radius,
        w: radius * 2,
        h: radius * 2
      });

      const isSelected = state.selectedVessel.type === 'well' && state.selectedVessel.index === idx;

      // Outer cavity depression
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
      ctx.fillStyle = '#cbd5e1';
      ctx.fill();

      // Inner cavity gradient
      const wellGrad = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, radius);
      wellGrad.addColorStop(0, '#f1f5f9');
      wellGrad.addColorStop(0.8, '#e2e8f0');
      wellGrad.addColorStop(1, '#94a3b8');
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = wellGrad;
      ctx.fill();

      // Fluid pool in well
      const fluidGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius - 3);
      const fluidColor = well.colorHex || 'rgba(235, 245, 255, 0.3)';
      fluidGrad.addColorStop(0, fluidColor);
      fluidGrad.addColorStop(0.8, fluidColor);
      fluidGrad.addColorStop(1, 'rgba(0, 0, 0, 0.12)');
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 3, 0, Math.PI * 2);
      ctx.fillStyle = fluidGrad;
      ctx.fill();

      // Specular glare
      ctx.beginPath();
      ctx.ellipse(cx - 5, cy - 5, 5, 3, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();

      // Selection ring
      if (isSelected) {
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Letter above well (Well A, B, C...)
      ctx.fillStyle = '#334155';
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      const letter = String.fromCharCode(65 + idx);
      ctx.fillText(letter, cx, cy - radius - 3);

      // Substance short name cleanly below
      const shortName = this.getSubstanceShortLabel(well.substanceKey);
      ctx.fillStyle = '#475569';
      ctx.font = '600 8.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(shortName, cx, cy + radius + 11);

      if (well.indicatorKey) {
        const ind = Chemistry.indicators[well.indicatorKey];
        ctx.fillStyle = '#0284c7';
        ctx.font = '700 7.5px "JetBrains Mono", monospace';
        ctx.fillText(`+${well.dropsAdded}d ${ind ? ind.shortName : ''}`, cx, cy + radius + 20);
      }
      ctx.restore();
    });
  }

  // DRAW REAGENT SHELF WITH INDICATOR DROPPER BOTTLES
  drawReagentShelf(ctx, x, y, w, h) {
    const state = window.simState;

    ctx.save();
    ctx.fillStyle = '#1e293b';
    this.roundRect(ctx, x, y, w, h, 10, true, false);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('🧪 INDICATOR DROPPER BOTTLES', x + 12, y + 15);

    const keys = ['universal', 'phenolphthalein', 'bromothymol_blue', 'methyl_orange', 'red_cabbage'];
    const bottleW = (w - 24) / keys.length;

    keys.forEach((key, i) => {
      const ind = Chemistry.indicators[key];
      const bx = x + 10 + i * bottleW;
      const by = y + 22;
      const bw = bottleW - 6;
      const bh = h - 28;
      const isSelected = state.indicatorKey === key;

      this.hitBoxes.push({
        type: 'indicator_bottle',
        indicatorKey: key,
        x: bx,
        y: by,
        w: bw,
        h: bh
      });

      // Bottle body
      ctx.fillStyle = isSelected ? '#0284c7' : '#0f172a';
      ctx.strokeStyle = isSelected ? '#38bdf8' : '#334155';
      ctx.lineWidth = 1;
      this.roundRect(ctx, bx, by, bw, bh, 6, true, true);

      // Color pill swatch
      ctx.fillStyle = ind.dropperBottleColor || '#38bdf8';
      this.roundRect(ctx, bx + 5, by + 5, bw - 10, 12, 3, true, false);

      // Label
      ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
      ctx.font = '600 9px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ind.shortName.substring(0, 11), bx + bw / 2, by + 28);

      ctx.fillStyle = isSelected ? '#bae6fd' : '#64748b';
      ctx.font = '500 8px "JetBrains Mono", monospace';
      ctx.fillText('Pipette', bx + bw / 2, by + 38);
    });
    ctx.restore();
  }

  // DRAW LITMUS STRIP DISPENSER
  drawLitmusDispenser(ctx, x, y, w, h) {
    const state = window.simState;

    ctx.save();
    ctx.fillStyle = '#1e293b';
    this.roundRect(ctx, x, y, w, h, 10, true, false);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('📄 TEST STRIPS (DRAG TO DIP)', x + 12, y + 15);

    const strips = [
      { key: 'red_litmus', name: 'Red Litmus', color: '#ef4444' },
      { key: 'blue_litmus', name: 'Blue Litmus', color: '#2563eb' },
      { key: 'ph_paper', name: 'pH Paper', color: '#f59e0b' }
    ];
    const sw = (w - 20) / 3;

    strips.forEach((s, idx) => {
      const sx = x + 10 + idx * sw;
      const sy = y + 22;
      const sbw = sw - 5;
      const sbh = h - 28;

      this.hitBoxes.push({
        type: 'strip_dispenser',
        stripKey: s.key,
        x: sx,
        y: sy,
        w: sbw,
        h: sbh
      });

      ctx.fillStyle = '#0f172a';
      this.roundRect(ctx, sx, sy, sbw, sbh, 6, true, false);

      // Mini strip swatch
      ctx.fillStyle = s.color;
      this.roundRect(ctx, sx + sbw / 2 - 6, sy + 6, 12, 20, 2, true, false);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 8.5px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.name.split(' ')[0], sx + sbw / 2, sy + 36);
    });
    ctx.restore();
  }

  // DRAW BENCHTOP DIGITAL PH METER
  drawDigitalPHMeterBase(ctx, x, y, w, h) {
    const state = window.simState;

    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, x, y, w, h, 10, true, true);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('DIGITAL pH METER', x + 12, y + 16);

    // Screen
    ctx.fillStyle = '#020617';
    ctx.strokeStyle = '#1e293b';
    this.roundRect(ctx, x + 10, y + 22, w - 70, 48, 5, true, true);

    // Status LED
    ctx.beginPath();
    ctx.arc(x + w - 75, y + 14, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = state.digitalProbe.activeTarget ? '#22c55e' : '#64748b';
    ctx.fill();

    // Readout
    ctx.textAlign = 'right';
    ctx.font = '700 20px "JetBrains Mono", monospace';
    if (state.digitalProbe.readingPH !== null) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(state.digitalProbe.readingPH.toFixed(2), x + w - 76, y + 54);
    } else {
      ctx.fillStyle = '#334155';
      ctx.fillText('--.--', x + w - 76, y + 54);
    }

    ctx.textAlign = 'left';
    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('pH', x + 18, y + 52);

    // Dedicated Docking Slot for Handheld Glass Electrode Probe (Right of meter)
    const dockX = x + w - 50;
    const dockY = y + 20;
    const dockW = 40;
    const dockH = 50;

    this.hitBoxes.push({
      type: 'probe_holder',
      x: dockX,
      y: dockY,
      w: dockW,
      h: dockH
    });

    ctx.fillStyle = '#1e293b';
    this.roundRect(ctx, dockX, dockY, dockW, dockH, 6, true, false);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 8.5px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔬 Probe', dockX + dockW / 2, dockY + 22);
    ctx.fillText('Stand', dockX + dockW / 2, dockY + 36);

    // If probe is NOT being dragged and NOT active, park it gracefully right in the dock!
    if (!state.digitalProbe.isDragging && !state.digitalProbe.activeTarget && state.digitalProbe.readingPH === null) {
      state.digitalProbe.x = dockX + dockW / 2;
      state.digitalProbe.y = dockY - 10;
    }

    ctx.restore();
  }

  // IN-FLIGHT DROPPER DROPLETS
  updateAndDrawDropperDrops(ctx, dt) {
    const state = window.simState;
    for (let i = state.dropperDrops.length - 1; i >= 0; i--) {
      const drop = state.dropperDrops[i];
      drop.y += drop.vy * dt;
      drop.vy += 800 * dt;

      ctx.save();
      ctx.fillStyle = drop.color;
      ctx.beginPath();
      ctx.ellipse(drop.x, drop.y, 3.5, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (drop.y >= drop.targetY) {
        state.dropperDrops.splice(i, 1);
        if (drop.targetVessel) {
          state.addIndicatorToVessel(drop.targetVessel, drop.indicatorKey, 1);
          if (window.soundEngine) window.soundEngine.playDropSound();
        }
      }
    }
  }

  // =========================================================================
  // MODE 2: DYNAMIC ACID-BASE TITRATION LAB
  // =========================================================================
  renderTitrationMode(ctx, w, h, dt) {
    const state = window.simState;
    const tit = state.titration;

    // Handle burette flow
    if (tit.stopcockState === 'dropwise') {
      tit.titrantAdded = Math.min(50.0, tit.titrantAdded + 0.35 * dt);
      if (Math.random() < 0.25) this.spawnTitrationDrop();
    } else if (tit.stopcockState === 'streaming') {
      tit.titrantAdded = Math.min(50.0, tit.titrantAdded + 1.8 * dt);
      if (Math.random() < 0.75) this.spawnTitrationDrop();
    }

    // Stirrer rotation
    if (tit.stirrerSpeed > 0) {
      tit.stirrerAngle += (tit.stirrerSpeed / 100) * 18 * dt;
      tit.stirrerVortexHeight = (tit.stirrerSpeed / 100) * 14;
    } else {
      tit.stirrerVortexHeight = 0;
    }

    // 1. Retort Stand & Clamp (Left)
    this.drawRetortStand(ctx, 60, 20, 200, h * 0.75);

    // 2. 50 mL Glass Burette
    this.drawBurette(ctx, 160, 20, 32, 240, tit);

    // 3. Erlenmeyer Flask & Magnetic Stirrer
    this.drawErlenmeyerAndStirrer(ctx, 125, 250, 105, 175, tit, dt);

    // 4. Live Titration Curve HUD Graph (Right side)
    this.drawTitrationCurveHUD(ctx, 305, 18, w - 325, h - 38, tit);
  }

  spawnTitrationDrop() {
    const tit = window.simState.titration;
    if (tit.titrantAdded >= tit.buretteCapacity) return;

    tit.drops.push({
      x: 176 + (Math.random() - 0.5) * 2,
      y: 260,
      vy: 110,
      targetY: 335
    });
  }

  // DRAW RETORT STAND & CLAMP
  drawRetortStand(ctx, x, y, w, h) {
    ctx.save();
    ctx.fillStyle = '#1e293b';
    this.roundRect(ctx, x, y + h - 20, w, 20, 5, true, false);

    // Rod
    const rodX = x + 24;
    const rodGrad = ctx.createLinearGradient(rodX, y, rodX + 10, y);
    rodGrad.addColorStop(0, '#94a3b8');
    rodGrad.addColorStop(0.5, '#f8fafc');
    rodGrad.addColorStop(1, '#475569');
    ctx.fillStyle = rodGrad;
    ctx.fillRect(rodX, y, 10, h - 20);

    // Clamp arms
    ctx.fillStyle = '#334155';
    ctx.fillRect(rodX + 8, y + 70, 85, 8);
    ctx.fillRect(rodX + 8, y + 175, 85, 8);
    ctx.restore();
  }

  // DRAW 50 mL GLASS BURETTE
  drawBurette(ctx, x, y, w, h, tit) {
    ctx.save();
    const r = w / 2;
    const tubeX = x;
    const tubeY = y;
    const tubeW = w;
    const tubeH = h - 35;

    // Fluid column
    const capacity = tit.buretteCapacity;
    const volumeLeft = Math.max(0, capacity - tit.titrantAdded);
    const fillPercent = volumeLeft / capacity;
    const fluidTopY = tubeY + (1.0 - fillPercent) * (tubeH - 16) + 8;

    if (volumeLeft > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(tubeX + 2, fluidTopY, tubeW - 4, (tubeY + tubeH) - fluidTopY);
      ctx.clip();

      const naohGrad = ctx.createLinearGradient(tubeX, fluidTopY, tubeX + tubeW, tubeY + tubeH);
      naohGrad.addColorStop(0, 'rgba(235, 248, 255, 0.45)');
      naohGrad.addColorStop(1, 'rgba(200, 230, 255, 0.65)');
      ctx.fillStyle = naohGrad;
      ctx.fillRect(tubeX, fluidTopY, tubeW, tubeH);

      ctx.beginPath();
      ctx.ellipse(tubeX + r, fluidTopY, r - 2, 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();
      ctx.restore();
    }

    // Glass outline
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.85)';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(tubeX, tubeY, tubeW, tubeH);

    // Graduations
    ctx.fillStyle = '#0f172a';
    ctx.font = '600 7.5px "JetBrains Mono", monospace';
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.lineWidth = 1;

    for (let ml = 0; ml <= 50; ml += 10) {
      const markY = tubeY + 8 + (ml / 50) * (tubeH - 16);
      ctx.beginPath();
      ctx.moveTo(tubeX + tubeW - 10, markY);
      ctx.lineTo(tubeX + tubeW - 2, markY);
      ctx.stroke();
      ctx.fillText(ml.toString(), tubeX + 4, markY + 3);
    }

    // Stopcock
    const stopcockY = tubeY + tubeH;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(tubeX + r - 3, stopcockY, 6, 20);

    this.hitBoxes.push({
      type: 'stopcock',
      x: tubeX + r - 18,
      y: stopcockY + 3,
      w: 36,
      h: 16
    });

    ctx.save();
    ctx.translate(tubeX + r, stopcockY + 10);
    if (tit.stopcockState === 'closed') {
      ctx.rotate(0);
    } else if (tit.stopcockState === 'dropwise') {
      ctx.rotate(Math.PI / 4);
    } else {
      ctx.rotate(Math.PI / 2);
    }

    ctx.fillStyle = tit.stopcockState === 'closed' ? '#ef4444' : (tit.stopcockState === 'dropwise' ? '#f59e0b' : '#10b981');
    this.roundRect(ctx, -14, -4, 28, 8, 3, true, false);
    ctx.restore();

    // Jet tip
    ctx.beginPath();
    ctx.moveTo(tubeX + r - 2, stopcockY + 20);
    ctx.lineTo(tubeX + r + 2, stopcockY + 20);
    ctx.lineTo(tubeX + r + 1, stopcockY + 35);
    ctx.lineTo(tubeX + r - 1, stopcockY + 35);
    ctx.closePath();
    ctx.fillStyle = 'rgba(203, 213, 225, 0.9)';
    ctx.fill();

    // Volume readout
    ctx.fillStyle = '#0284c7';
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${tit.titrantAdded.toFixed(1)} mL NaOH`, tubeX + r, tubeY - 5);
    ctx.restore();

    this.renderTitrationDrops(ctx);
  }

  renderTitrationDrops(ctx) {
    const tit = window.simState.titration;
    for (let i = tit.drops.length - 1; i >= 0; i--) {
      const drop = tit.drops[i];
      drop.y += drop.vy * 0.05;
      drop.vy += 35;

      ctx.save();
      ctx.fillStyle = 'rgba(224, 242, 254, 0.9)';
      ctx.beginPath();
      ctx.ellipse(drop.x, drop.y, 2, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (drop.y >= drop.targetY) {
        tit.drops.splice(i, 1);
        if (window.soundEngine && Math.random() < 0.3) {
          window.soundEngine.playDropSound();
        }

        const instantaneousPH = Chemistry.calcTitrationPH(
          tit.analyteType,
          tit.analyteVol,
          tit.analyteConc,
          tit.titrantAdded,
          tit.titrantConc
        );

        if (instantaneousPH > 7.5 || Math.abs(tit.titrantAdded - 25.0) < 1.5) {
          tit.swirlBlooms.push({
            x: drop.x,
            y: drop.targetY + 10,
            radius: 6,
            maxRadius: 24,
            color: Chemistry.indicators[tit.indicator].baseColorHex || '#e11d48',
            alpha: 0.8
          });
        }
      }
    }
  }

  // DRAW ERLENMEYER FLASK & MAGNETIC STIRRER
  drawErlenmeyerAndStirrer(ctx, x, y, w, h, tit, dt) {
    ctx.save();
    const stirrerY = y + h - 42;
    const stirrerH = 42;

    // Stirrer unit
    ctx.fillStyle = '#0f172a';
    this.roundRect(ctx, x - 18, stirrerY, w + 36, stirrerH, 8, true, false);

    ctx.fillStyle = '#f8fafc';
    this.roundRect(ctx, x - 14, stirrerY + 2, w + 28, 8, 3, true, false);

    // Speed Knob
    const knobX = x + w / 2;
    const knobY = stirrerY + 24;
    ctx.beginPath();
    ctx.arc(knobX, knobY, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();

    // LED
    ctx.beginPath();
    ctx.arc(x - 2, stirrerY + 24, 3, 0, Math.PI * 2);
    ctx.fillStyle = tit.stirrerSpeed > 0 ? '#10b981' : '#64748b';
    ctx.fill();

    // Erlenmeyer Flask
    const flaskX = x;
    const flaskY = y + 25;
    const flaskW = w;
    const flaskH = h - 70;

    const neckW = 28;
    const neckH = 28;
    const neckX = flaskX + (flaskW - neckW) / 2;
    const neckY = flaskY;

    const currentPH = Chemistry.calcTitrationPH(
      tit.analyteType,
      tit.analyteVol,
      tit.analyteConc,
      tit.titrantAdded,
      tit.titrantConc
    );

    const indColorObj = Chemistry.getIndicatorColor(tit.indicator, currentPH);
    const fluidColor = `rgba(${indColorObj.r}, ${indColorObj.g}, ${indColorObj.b}, 0.85)`;

    const liquidTopY = flaskY + flaskH * 0.45;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(neckX - 8, liquidTopY);
    ctx.lineTo(neckX + neckW + 8, liquidTopY);
    ctx.lineTo(flaskX + flaskW, flaskY + flaskH);
    ctx.lineTo(flaskX, flaskY + flaskH);
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = fluidColor;
    ctx.fillRect(flaskX, liquidTopY, flaskW, flaskH);

    // Vortex
    const vortexDepth = tit.stirrerVortexHeight;
    ctx.beginPath();
    ctx.moveTo(flaskX + 12, liquidTopY);
    ctx.quadraticCurveTo(flaskX + flaskW / 2, liquidTopY + vortexDepth, flaskX + flaskW - 12, liquidTopY);
    ctx.quadraticCurveTo(flaskX + flaskW / 2, liquidTopY - 3, flaskX + 12, liquidTopY);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();

    // Swirl blooms
    for (let b = tit.swirlBlooms.length - 1; b >= 0; b--) {
      const bloom = tit.swirlBlooms[b];
      bloom.radius += 18 * dt;
      bloom.alpha -= 0.65 * dt;

      ctx.save();
      ctx.beginPath();
      ctx.arc(bloom.x, bloom.y, bloom.radius, 0, Math.PI * 2);
      ctx.fillStyle = bloom.color;
      ctx.globalAlpha = Math.max(0, bloom.alpha);
      ctx.fill();
      ctx.restore();

      if (bloom.alpha <= 0) tit.swirlBlooms.splice(b, 1);
    }

    // Stir bar
    const barX = flaskX + flaskW / 2;
    const barY = flaskY + flaskH - 7;
    ctx.save();
    ctx.translate(barX, barY);
    ctx.rotate(tit.stirrerAngle);
    ctx.fillStyle = '#ffffff';
    this.roundRect(ctx, -11, -3, 22, 6, 3, true, false);
    ctx.restore();
    ctx.restore();

    // Glass body
    ctx.beginPath();
    ctx.moveTo(neckX, neckY);
    ctx.lineTo(neckX + neckW, neckY);
    ctx.lineTo(neckX + neckW, neckY + neckH);
    ctx.lineTo(flaskX + flaskW, flaskY + flaskH);
    ctx.lineTo(flaskX, flaskY + flaskH);
    ctx.lineTo(neckX, neckY + neckH);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.85)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    window.simState.checkQuests();
  }

  // DRAW TITRATION CURVE HUD GRAPH
  drawTitrationCurveHUD(ctx, x, y, w, h, tit) {
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, x, y, w, h, 12, true, true);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📈 LIVE TITRATION CURVE: pH vs. VOLUME OF NaOH', x + 18, y + 22);

    const currentPH = Chemistry.calcTitrationPH(
      tit.analyteType,
      tit.analyteVol,
      tit.analyteConc,
      tit.titrantAdded,
      tit.titrantConc
    );

    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`V = ${tit.titrantAdded.toFixed(2)} mL | pH = ${currentPH.toFixed(2)}`, x + w - 18, y + 22);

    const gx = x + 44;
    const gy = y + 40;
    const gw = w - 68;
    const gh = h - 76;

    ctx.fillStyle = '#020617';
    ctx.fillRect(gx, gy, gw, gh);

    // Indicator transition band
    const ind = Chemistry.indicators[tit.indicator];
    if (ind && ind.rangeLow !== undefined && ind.rangeHigh !== undefined) {
      const yLow = gy + gh - (ind.rangeLow / 14.0) * gh;
      const yHigh = gy + gh - (ind.rangeHigh / 14.0) * gh;
      const bandHeight = yLow - yHigh;

      ctx.fillStyle = 'rgba(244, 63, 94, 0.18)';
      ctx.fillRect(gx, yHigh, gw, bandHeight);

      ctx.fillStyle = '#f43f5e';
      ctx.font = '600 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${ind.shortName} range [${ind.rangeLow} - ${ind.rangeHigh}]`, gx + gw - 6, yHigh + 12);
    }

    // Grid lines for pH
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    for (let ph = 0; ph <= 14; ph += 2) {
      const py = gy + gh - (ph / 14.0) * gh;
      ctx.beginPath();
      ctx.moveTo(gx, py);
      ctx.lineTo(gx + gw, py);
      ctx.stroke();
      ctx.fillText(ph.toString(), gx - 6, py + 3);
    }

    // Grid lines for Volume
    ctx.textAlign = 'center';
    for (let v = 0; v <= 50; v += 10) {
      const vx = gx + (v / 50.0) * gw;
      ctx.beginPath();
      ctx.moveTo(vx, gy);
      ctx.lineTo(vx, gy + gh);
      ctx.stroke();
      ctx.fillText(v.toString(), vx, gy + gh + 14);
    }

    // Equivalence dashed line
    const eqX = gx + (25.0 / 50.0) * gw;
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(eqX, gy);
    ctx.lineTo(eqX, gy + gh);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#eab308';
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillText('V_eq = 25.0 mL', eqX, gy + 12);

    // Dotted theoretical curve
    ctx.save();
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let v = 0; v <= 50; v += 0.5) {
      const tph = Chemistry.calcTitrationPH(tit.analyteType, tit.analyteVol, tit.analyteConc, v, tit.titrantConc);
      const px = gx + (v / 50.0) * gw;
      const py = gy + gh - (tph / 14.0) * gh;
      if (v === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();

    // Actual path
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const maxV = Math.min(50.0, tit.titrantAdded);
    for (let v = 0; v <= maxV; v += 0.25) {
      const rph = Chemistry.calcTitrationPH(tit.analyteType, tit.analyteVol, tit.analyteConc, v, tit.titrantConc);
      const px = gx + (v / 50.0) * gw;
      const py = gy + gh - (rph / 14.0) * gh;
      if (v === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();

    // Pulse dot
    const currX = gx + (maxV / 50.0) * gw;
    const currY = gy + gh - (currentPH / 14.0) * gh;
    ctx.beginPath();
    ctx.arc(currX, currY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Axes
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Volume of 0.1 M NaOH Titrant Added (mL)', gx + gw / 2, gy + gh + 26);
    ctx.restore();
  }

  // =========================================================================
  // MODE 3: MOLECULAR EQUILIBRIUM
  // =========================================================================
  initMolecularParticles() {
    this.molParticles = [];
    const count = 42;
    for (let i = 0; i < count; i++) {
      this.molParticles.push({
        x: Math.random() * 260 - 130,
        y: Math.random() * 260 - 130,
        vx: (Math.random() - 0.5) * 50,
        vy: (Math.random() - 0.5) * 50,
        radius: 11,
        isProtonated: Math.random() < 0.5,
        bondFlash: 0
      });
    }
  }

  renderMolecularMode(ctx, w, h, dt) {
    const state = window.simState;
    const ind = Chemistry.indicators[state.indicatorKey] || Chemistry.indicators['bromothymol_blue'];
    const { fHIn, fInMinus } = Chemistry.getIndicatorFractions(state.customPH, ind.pKa);

    const cx = w * 0.35;
    const cy = h * 0.50;
    const chamberR = Math.min(160, h * 0.38);

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, chamberR + 10, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, chamberR, 0, Math.PI * 2);
    ctx.fillStyle = '#020617';
    ctx.fill();
    ctx.clip();

    // Particles
    const acidColor = ind.acidColorHex || '#facc15';
    const baseColor = ind.baseColorHex || '#1d4ed8';

    this.molParticles.forEach((p, idx) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const dist = Math.hypot(p.x, p.y);
      if (dist + p.radius > chamberR - 4) {
        const nx = p.x / dist;
        const ny = p.y / dist;
        const dot = p.vx * nx + p.vy * ny;
        p.vx -= 2 * dot * nx;
        p.vy -= 2 * dot * ny;
        p.x = nx * (chamberR - 4 - p.radius);
        p.y = ny * (chamberR - 4 - p.radius);
      }

      const targetProtonated = (idx / this.molParticles.length) < fHIn;
      if (p.isProtonated !== targetProtonated && Math.random() < 0.05) {
        p.isProtonated = targetProtonated;
        p.bondFlash = 1.0;
      }
      if (p.bondFlash > 0) p.bondFlash -= 3.0 * dt;

      const px = cx + p.x;
      const py = cy + p.y;

      ctx.save();
      if (p.isProtonated) {
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = acidColor;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px + 8, py - 5, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 7px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('H⁺', px + 8, py - 2);
      } else {
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('–', px, py + 3.5);
      }
      ctx.restore();
    });
    ctx.restore();

    this.drawMolecularTelemetryPanel(ctx, w * 0.68, 18, w * 0.29, h - 36, state, fHIn, fInMinus, ind);
  }

  drawMolecularTelemetryPanel(ctx, x, y, w, h, state, fHIn, fInMinus, ind) {
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, x, y, w, h, 12, true, true);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('⚛️ EQUILIBRIUM TELEMETRY', x + 14, y + 22);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Indicator: ${ind.name}`, x + 14, y + 42);
    ctx.fillText(`pKa = ${ind.pKa.toFixed(1)} | pH = ${state.customPH.toFixed(2)}`, x + 14, y + 58);

    // Formula box
    ctx.fillStyle = '#020617';
    this.roundRect(ctx, x + 12, y + 70, w - 24, 52, 6, true, false);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.fillText('pH = pKa + log([In⁻]/[HIn])', x + 18, y + 90);

    const ratio = Math.pow(10, state.customPH - ind.pKa);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 9px "JetBrains Mono", monospace';
    ctx.fillText(`Ratio: ${ratio < 1000 ? ratio.toFixed(3) : Chemistry.formatExp(ratio)}`, x + 18, y + 108);

    // Bars
    const barY1 = y + 140;
    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`[HIn] Acid Form (${(fHIn * 100).toFixed(1)}%)`, x + 14, barY1);
    ctx.fillStyle = '#1e293b';
    this.roundRect(ctx, x + 14, barY1 + 6, w - 28, 12, 3, true, false);
    ctx.fillStyle = ind.acidColorHex || '#facc15';
    this.roundRect(ctx, x + 14, barY1 + 6, (w - 28) * fHIn, 12, 3, true, false);

    const barY2 = y + 190;
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`[In⁻] Base Form (${(fInMinus * 100).toFixed(1)}%)`, x + 14, barY2);
    ctx.fillStyle = '#1e293b';
    this.roundRect(ctx, x + 14, barY2 + 6, w - 28, 12, 3, true, false);
    ctx.fillStyle = ind.baseColorHex || '#1d4ed8';
    this.roundRect(ctx, x + 14, barY2 + 6, (w - 28) * fInMinus, 12, 3, true, false);

    // Color Swatch
    const swatchY = y + 240;
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('Macroscopic Solution Color:', x + 14, swatchY);
    const indColor = Chemistry.getIndicatorColor(state.indicatorKey, state.customPH);
    ctx.fillStyle = `rgb(${indColor.r}, ${indColor.g}, ${indColor.b})`;
    this.roundRect(ctx, x + 14, swatchY + 8, w - 28, 30, 6, true, false);
    ctx.restore();
  }

  // =========================================================================
  // ACTIVE DRAGGED TOOLS (LITMUS STRIPS, PH PROBE)
  // =========================================================================
  renderActiveTools(ctx, w, h) {
    const state = window.simState;
    this.renderDigitalProbe(ctx);

    ['red_litmus', 'blue_litmus', 'ph_paper'].forEach(key => {
      const strip = state.strips[key];
      if (strip.isDragging || strip.isDipped) {
        this.renderLitmusStrip(ctx, key, strip);
      }
    });
  }

  renderDigitalProbe(ctx) {
    const probe = window.simState.digitalProbe;
    const px = probe.x;
    const py = probe.y;

    ctx.save();
    // Cable: only draw graceful loop if probe is active/moved away from stand
    const meterBaseX = this.width - 150;
    const meterBaseY = 70;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(meterBaseX, meterBaseY);
    ctx.quadraticCurveTo((meterBaseX + px) / 2, Math.max(meterBaseY, py) + 40, px, py);
    ctx.stroke();

    // Probe Handle
    ctx.fillStyle = '#1e293b';
    this.roundRect(ctx, px - 5, py, 10, 48, 3, true, false);

    // Glass shaft
    ctx.fillStyle = 'rgba(203, 213, 225, 0.7)';
    ctx.fillRect(px - 3, py + 48, 6, 32);

    // Sensing bulb
    ctx.beginPath();
    ctx.arc(px, py + 83, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  renderLitmusStrip(ctx, key, strip) {
    const sx = strip.x;
    const sy = strip.y;
    const sw = 12;
    const sh = 56;

    let defaultColor = '#ef4444';
    if (key === 'blue_litmus') defaultColor = '#2563eb';
    if (key === 'ph_paper') defaultColor = '#f59e0b';

    ctx.save();
    ctx.fillStyle = defaultColor;
    this.roundRect(ctx, sx - sw / 2, sy, sw, sh * 0.6, 2, true, false);

    ctx.fillStyle = strip.dippedColor || defaultColor;
    this.roundRect(ctx, sx - sw / 2, sy + sh * 0.6, sw, sh * 0.4, 2, true, false);

    if (strip.dippedColor) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx - sw / 2, sy + sh * 0.6);
      ctx.lineTo(sx + sw / 2, sy + sh * 0.6);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderParticles(ctx, dt) {
    const state = window.simState;
    for (let i = state.confetti.length - 1; i >= 0; i--) {
      const p = state.confetti[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 9.8 * dt * 4;
      p.rot += p.vRot;
      p.life -= 0.6 * dt;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();

      if (p.life <= 0) state.confetti.splice(i, 1);
    }
  }

  roundRect(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }
}

window.LaboratoryRenderer = LaboratoryRenderer;
