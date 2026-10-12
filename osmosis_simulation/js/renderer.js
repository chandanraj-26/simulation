/**
 * OsmosisLab — Canvas 2D Cellular & Molecular Biology Renderer
 * High-DPI cellular physics, plant plasmolysis, RBC hemolysis,
 * U-tube osmometer head displacement, and aquaporin membrane view.
 */

class OsmosisRenderer {
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

    this.centerX = 460;
    this.centerY = 260;
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

    this.centerX = this.width * 0.48;
    this.centerY = this.height * 0.48;
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

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // Update Biological Dynamics (Smooth Lerp)
    this.updateBiologicalDynamics(dt);

    // Draw Laboratory Background
    this.drawLabBackground(ctx, w, h);

    // Apply View Zoom
    ctx.save();
    const cx = w / 2;
    const cy = h / 2;
    ctx.translate(cx, cy);
    ctx.scale(this.viewScale, this.viewScale);
    ctx.translate(-cx, -cy);

    const state = window.simState;

    if (state.mode === 'plant') {
      this.drawPlantCellMode(ctx);
    } else if (state.mode === 'rbc') {
      this.drawRBCMode(ctx);
    } else if (state.mode === 'utube') {
      this.drawUTubeMode(ctx);
    } else if (state.mode === 'aquaporin') {
      this.drawAquaporinMode(ctx);
    }

    ctx.restore();
  }

  // =========================================================================
  // BIOLOGICAL DYNAMICS (Volume Lerping & Particle Motion)
  // =========================================================================
  updateBiologicalDynamics(dt) {
    const state = window.simState;

    if (state.mode === 'plant') {
      const plantState = Biology.calculatePlantCellState(state.extSolutePercent, state.currentVol);
      // Smoothly adjust current volume towards target
      state.currentVol += (plantState.targetVol - state.currentVol) * 2.2 * dt;
    } else if (state.mode === 'rbc') {
      const rbcState = Biology.calculateRBCState(state.extSolutePercent);
      if (rbcState.isLysed && !state.isRbcLysed) {
        state.isRbcLysed = true;
        this.spawnLysisBurst();
        if (window.soundEngine) window.soundEngine.playCellBurst();
      }
      state.currentVol += (rbcState.targetVol - state.currentVol) * 2.5 * dt;
    } else if (state.mode === 'utube') {
      const targetDiff = Biology.calculateUTubeHeightDiff(state.uTubeConcLeft, state.uTubeConcRight);
      state.uTubeLevelDiff += (targetDiff - state.uTubeLevelDiff) * 2.0 * dt;
    }

    // Update animated molecular particles
    state.waterMolecules.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < -240) p.x = 240;
      if (p.x > 240) p.x = -240;
      if (p.y < -170) p.y = 170;
      if (p.y > 170) p.y = -170;
    });

    state.soluteMolecules.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < -240) p.x = 240;
      if (p.x > 240) p.x = -240;
      if (p.y < -170) p.y = 170;
      if (p.y > 170) p.y = -170;
    });

    // Update lysis particles
    for (let i = state.lysisParticles.length - 1; i >= 0; i--) {
      const lp = state.lysisParticles[i];
      lp.x += lp.vx * dt;
      lp.y += lp.vy * dt;
      lp.life -= dt;
      if (lp.life <= 0) state.lysisParticles.splice(i, 1);
    }
  }

  spawnLysisBurst() {
    const state = window.simState;
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 85 + 35;
      state.lysisParticles.push({
        x: this.centerX,
        y: this.centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() < 0.6 ? '#dc2626' : '#f87171',
        size: Math.random() * 5 + 3,
        life: 0.8
      });
    }
  }

  // =========================================================================
  // LABORATORY BACKGROUND & LIGHTING
  // =========================================================================
  drawLabBackground(ctx, w, h) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#f8fafc');
    bgGrad.addColorStop(0.7, '#f1f5f9');
    bgGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
  }

  // =========================================================================
  // 1. PLANT CELL MODE (Onion Cell, Plasmolysis, Turgor)
  // =========================================================================
  drawPlantCellMode(ctx) {
    const state = window.simState;
    const cx = this.centerX;
    const cy = this.centerY;

    // Draw Surrounding Solution Beaker
    this.drawSolutionChamber(ctx, cx, cy, state.extSolutePercent);

    const cellW = 300;
    const cellH = 200;
    const vol = state.currentVol; // 1.0 = normal, 1.08 = turgid, 0.45 = plasmolysed

    ctx.save();

    // 1. Rigid Cellulose Cell Wall (Outer Fixed Box)
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 14;
    ctx.lineJoin = 'round';
    ctx.strokeRect(cx - cellW / 2, cy - cellH / 2, cellW, cellH);

    // Inner Cell Wall border
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - cellW / 2 + 5, cy - cellH / 2 + 5, cellW - 10, cellH - 10);

    // 2. Extracellular Fluid Gap (if Plasmolysed)
    // When protoplast shrinks, space between membrane and wall is filled with external hypertonic solution!
    if (vol < 0.95) {
      ctx.fillStyle = this.getSolutionColor(state.extSolutePercent, 0.25);
      ctx.fillRect(cx - cellW / 2 + 7, cy - cellH / 2 + 7, cellW - 14, cellH - 14);

      // Labeling Extracellular Gap
      ctx.fillStyle = '#b45309';
      ctx.font = '700 8.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Hypertonic Solution Enters Gap', cx - cellW / 2 + 12, cy - cellH / 2 + 20);
    }

    // 3. Protoplast (Living Content Inside Plasma Membrane)
    // Protoplast shrinks away from corners in hypertonic solution!
    const protoW = (cellW - 14) * Math.min(1.0, vol);
    const protoH = (cellH - 14) * Math.min(1.0, vol);

    // Cytoplasm Gradient
    const cytoGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, protoW * 0.6);
    cytoGrad.addColorStop(0, '#fbcfe8');
    cytoGrad.addColorStop(0.7, '#f472b6');
    cytoGrad.addColorStop(1, '#db2777');

    ctx.fillStyle = cytoGrad;
    ctx.beginPath();
    // Rounded protoplast boundary
    const cornerRadius = vol < 0.9 ? 35 : 12;
    this.roundRect(ctx, cx - protoW / 2, cy - protoH / 2, protoW, protoH, cornerRadius);
    ctx.fill();

    // Plasma Membrane (Thin Boundary)
    ctx.strokeStyle = '#9d174d';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 4. Large Central Vacuole
    const vacW = protoW * 0.65;
    const vacH = protoH * 0.60;
    const vacGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, vacW * 0.5);
    vacGrad.addColorStop(0, '#e0e7ff');
    vacGrad.addColorStop(0.8, '#a5b4fc');
    vacGrad.addColorStop(1, '#818cf8');

    ctx.fillStyle = vacGrad;
    ctx.beginPath();
    this.roundRect(ctx, cx - vacW / 2, cy - vacH / 2, vacW, vacH, cornerRadius * 0.7);
    ctx.fill();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Vacuole Label
    ctx.fillStyle = '#3730a3';
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Central Vacuole (Cell Sap)', cx, cy + 3);

    // 5. Nucleus with Nucleolus
    const nucX = cx + protoW * 0.32;
    const nucY = cy - protoH * 0.22;
    ctx.beginPath();
    ctx.arc(nucX, nucY, 13, 0, Math.PI * 2);
    ctx.fillStyle = '#7e22ce';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Nucleolus
    ctx.beginPath();
    ctx.arc(nucX - 2, nucY - 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#3b0764';
    ctx.fill();

    // 6. Chloroplasts in Cytoplasm
    const chloroSpots = [
      { x: cx - protoW * 0.35, y: cy - protoH * 0.3 },
      { x: cx - protoW * 0.38, y: cy + protoH * 0.25 },
      { x: cx + protoW * 0.34, y: cy + protoH * 0.28 },
      { x: cx - protoW * 0.1,  y: cy - protoH * 0.38 },
      { x: cx + protoW * 0.12, y: cy + protoH * 0.36 }
    ];
    chloroSpots.forEach(pt => {
      ctx.beginPath();
      ctx.ellipse(pt.x, pt.y, 10, 6, Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = '#16a34a';
      ctx.fill();
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // 7. Water Net Diffusion Direction Arrows
    if (state.showWaterFlow) {
      this.drawOsmoticFlowArrows(ctx, cx, cy, state.extSolutePercent, 2.0);
    }

    // 8. Labels
    ctx.fillStyle = '#14532d';
    ctx.font = '800 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Rigid Cellulose Cell Wall (Permeable)', cx, cy - cellH / 2 - 14);

    ctx.restore();
  }

  // =========================================================================
  // 2. ANIMAL CELL MODE (Red Blood Cell / RBC / Hemolysis / Crenation)
  // =========================================================================
  drawRBCMode(ctx) {
    const state = window.simState;
    const cx = this.centerX;
    const cy = this.centerY;

    this.drawSolutionChamber(ctx, cx, cy, state.extSolutePercent);

    const vol = state.currentVol;
    const baseR = 75;
    const r = baseR * Math.pow(vol, 0.45);

    ctx.save();

    if (state.isRbcLysed) {
      // 1. Ruptured Cell Ghost (Hemolysis)
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.05, 0, Math.PI * 2);
      ctx.stroke();

      // Rupture tears
      ctx.setLineDash([]);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.5;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * (r - 10), cy + Math.sin(a) * (r - 10));
        ctx.lineTo(cx + Math.cos(a) * (r + 18), cy + Math.sin(a) * (r + 18));
        ctx.stroke();
      }

      // Escaping Hemoglobin Cloud
      const hemoGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r * 1.3);
      hemoGrad.addColorStop(0, 'rgba(239, 68, 68, 0.55)');
      hemoGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.2)');
      hemoGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = hemoGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Render burst particles
      state.lysisParticles.forEach(lp => {
        ctx.fillStyle = lp.color;
        ctx.globalAlpha = Math.max(0, lp.life);
        ctx.beginPath();
        ctx.arc(lp.x, lp.y, lp.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#991b1b';
      ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💥 HEMOLYSIS (CELL BURST!)', cx, cy);
      ctx.font = '600 9.5px "JetBrains Mono", monospace';
      ctx.fillText('Membrane ruptured by osmotic pressure', cx, cy + 18);
    } else {
      // Intact Erythrocyte
      if (state.extSolutePercent > 1.2) {
        // Crenated (Spiky shriveled contour)
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        const spikes = 16;
        for (let i = 0; i < spikes * 2; i++) {
          const angle = (i * Math.PI) / spikes;
          const dist = (i % 2 === 0) ? r : r * 0.78;
          const sx = cx + Math.cos(angle) * dist;
          const sy = cy + Math.sin(angle) * dist;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Crenated RBC', cx, cy + 3);
      } else {
        // Normal or Swollen Biconcave Disc
        const rbcGrad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
        rbcGrad.addColorStop(0, '#f87171');
        rbcGrad.addColorStop(0.65, '#dc2626');
        rbcGrad.addColorStop(1, '#991b1b');

        ctx.fillStyle = rbcGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Biconcave Central Dimple
        if (vol <= 1.15) {
          ctx.fillStyle = 'rgba(127, 29, 29, 0.45)';
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 10.5px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(vol > 1.15 ? 'Swollen Sphere' : 'Biconcave Disc', cx, cy + 4);
      }
    }

    if (state.showWaterFlow && !state.isRbcLysed) {
      this.drawOsmoticFlowArrows(ctx, cx, cy, state.extSolutePercent, 0.9);
    }

    ctx.restore();
  }

  // =========================================================================
  // 3. U-TUBE OSMOMETER MODE (Hydrostatic Head vs Osmotic Pressure)
  // =========================================================================
  drawUTubeMode(ctx) {
    const state = window.simState;
    const cx = this.centerX;
    const cy = this.centerY + 30;

    const tubeWidth = 55;
    const halfSpan = 90;
    const baseLevel = cy - 20;

    // Head difference in pixels
    const diffPx = state.uTubeLevelDiff * 3.2;
    const leftMeniscusY = baseLevel + diffPx * 0.5;
    const rightMeniscusY = baseLevel - diffPx * 0.5;

    ctx.save();

    // 1. Glass U-Tube Outer Shell
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.fillStyle = '#f8fafc';

    // Left Arm Liquid
    const leftGrad = ctx.createLinearGradient(0, leftMeniscusY, 0, cy + 120);
    leftGrad.addColorStop(0, this.getSolutionColor(state.uTubeConcLeft, 0.4));
    leftGrad.addColorStop(1, this.getSolutionColor(state.uTubeConcLeft, 0.8));
    ctx.fillStyle = leftGrad;
    ctx.fillRect(cx - halfSpan - tubeWidth / 2, leftMeniscusY, tubeWidth, cy + 100 - leftMeniscusY);

    // Right Arm Liquid
    const rightGrad = ctx.createLinearGradient(0, rightMeniscusY, 0, cy + 120);
    rightGrad.addColorStop(0, this.getSolutionColor(state.uTubeConcRight, 0.4));
    rightGrad.addColorStop(1, this.getSolutionColor(state.uTubeConcRight, 0.8));
    ctx.fillStyle = rightGrad;
    ctx.fillRect(cx + halfSpan - tubeWidth / 2, rightMeniscusY, tubeWidth, cy + 100 - rightMeniscusY);

    // Bottom Connecting U-Bend Liquid
    ctx.beginPath();
    ctx.arc(cx, cy + 100, halfSpan + tubeWidth / 2, 0, Math.PI);
    ctx.fillStyle = leftGrad;
    ctx.fill();

    // Semi-Permeable Membrane at Bottom Center (dashed green barrier)
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 70);
    ctx.lineTo(cx, cy + 130);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glass Tube Outlines
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    // Left outer/inner walls
    ctx.strokeRect(cx - halfSpan - tubeWidth / 2, cy - 140, tubeWidth, cy + 140 - (cy - 140));
    ctx.strokeRect(cx + halfSpan - tubeWidth / 2, cy - 140, tubeWidth, cy + 140 - (cy - 140));

    // Meniscus Curves
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(cx - halfSpan, leftMeniscusY, tubeWidth / 2, 5, 0, 0, Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx + halfSpan, rightMeniscusY, tubeWidth / 2, 5, 0, 0, Math.PI);
    ctx.stroke();

    // Height Difference Indicator Line
    if (Math.abs(diffPx) > 5) {
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx - halfSpan + tubeWidth / 2, leftMeniscusY);
      ctx.lineTo(cx + halfSpan - tubeWidth / 2, leftMeniscusY);
      ctx.moveTo(cx - halfSpan + tubeWidth / 2, rightMeniscusY);
      ctx.lineTo(cx + halfSpan - tubeWidth / 2, rightMeniscusY);
      ctx.stroke();

      // Dimension Arrow
      ctx.setLineDash([]);
      ctx.fillStyle = '#ef4444';
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Δh = ${Math.abs(state.uTubeLevelDiff).toFixed(1)} cm`, cx, (leftMeniscusY + rightMeniscusY) / 2 + 4);
    }

    // Membrane Label
    ctx.fillStyle = '#166534';
    ctx.font = '700 9.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Semi-Permeable Membrane', cx, cy + 145);

    // Left and Right Solution Badges
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Left Arm: ${state.uTubeConcLeft.toFixed(1)}% Solute`, cx - halfSpan, cy - 150);
    ctx.fillText(`Right Arm: ${state.uTubeConcRight.toFixed(1)}% Solute`, cx + halfSpan, cy - 150);

    ctx.restore();
  }

  // =========================================================================
  // 4. MOLECULAR AQUAPORIN MEMBRANE VIEW
  // =========================================================================
  drawAquaporinMode(ctx) {
    const state = window.simState;
    const cx = this.centerX;
    const cy = this.centerY;

    ctx.save();

    // Background Chamber (Clean Light Laboratory Fluid)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(cx - 240, cy - 150, 480, 300);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 240, cy - 150, 480, 300);

    // Lipid Bilayer Membrane Center Strip (Light Soft Neutral)
    const memW = 34;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(cx - memW / 2, cy - 150, memW, 300);

    // Phospholipid Heads (Blue circular heads)
    for (let y = cy - 145; y < cy + 150; y += 14) {
      if (Math.abs(y - cy) < 40) continue; // gap for aquaporin channel

      // Left Layer
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(cx - memW / 2 + 4, y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Right Layer
      ctx.beginPath();
      ctx.arc(cx + memW / 2 - 4, y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Hydrophobic fatty acid tails
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - memW / 2 + 8, y);
      ctx.lineTo(cx, y - 2);
      ctx.moveTo(cx + memW / 2 - 8, y);
      ctx.lineTo(cx, y + 2);
      ctx.stroke();
    }

    // Protein Aquaporin Channel (Hourglass Pore in Center)
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.moveTo(cx - memW / 2 - 4, cy - 40);
    ctx.bezierCurveTo(cx - 4, cy - 10, cx - 4, cy + 10, cx - memW / 2 - 4, cy + 40);
    ctx.lineTo(cx + memW / 2 + 4, cy + 40);
    ctx.bezierCurveTo(cx + 4, cy + 10, cx + 4, cy - 10, cx + memW / 2 + 4, cy - 40);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Aquaporin label
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 8.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('AQUAPORIN', cx, cy - 4);

    // Water Molecules (Small Cyan Spheres)
    state.waterMolecules.forEach(m => {
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(cx + m.x, cy + m.y, m.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Solute Molecules (Large Orange Spheres)
    state.soluteMolecules.forEach(m => {
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(cx + m.x, cy + m.y, m.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fed7aa';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Side Labels
    ctx.fillStyle = '#1e293b';
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Extracellular Fluid', cx - 140, cy - 130);
    ctx.fillText('Intracellular Cytosol', cx + 140, cy - 130);

    ctx.restore();
  }

  // =========================================================================
  // OSMOTIC FLUX ARROWS & CHAMBER VISUALS
  // =========================================================================
  drawOsmoticFlowArrows(ctx, cx, cy, extConc, intConc) {
    const diff = intConc - extConc;
    if (Math.abs(diff) < 0.2) return; // Isotonic equilibrium

    const isEndosmosis = diff > 0; // Water moves in!
    const arrowColor = isEndosmosis ? '#0284c7' : '#ea580c';
    const label = isEndosmosis ? 'Net Water Inflow (Endosmosis)' : 'Net Water Outflow (Exosmosis)';

    ctx.save();
    const arrowLen = 35;
    const angles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];

    angles.forEach(ang => {
      const startDist = isEndosmosis ? 180 : 120;
      const endDist = isEndosmosis ? 120 : 180;
      const x1 = cx + Math.cos(ang) * startDist;
      const y1 = cy + Math.sin(ang) * startDist;
      const x2 = cx + Math.cos(ang) * endDist;
      const y2 = cy + Math.sin(ang) * endDist;

      ctx.strokeStyle = arrowColor;
      ctx.fillStyle = arrowColor;
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Arrowhead
      const headLen = 8;
      const tipAng = Math.atan2(y2 - y1, x2 - x1);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headLen * Math.cos(tipAng - Math.PI / 6), y2 - headLen * Math.sin(tipAng - Math.PI / 6));
      ctx.lineTo(x2 - headLen * Math.cos(tipAng + Math.PI / 6), y2 - headLen * Math.sin(tipAng + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    });

    // Badge
    ctx.fillStyle = arrowColor;
    ctx.font = '700 10.5px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, cy + 145);

    ctx.restore();
  }

  drawSolutionChamber(ctx, cx, cy, conc) {
    ctx.save();
    const w = 460;
    const h = 320;

    // Beaker liquid fill
    ctx.fillStyle = this.getSolutionColor(conc, 0.18);
    ctx.fillRect(cx - w / 2, cy - h / 2, w, h);

    // Glass Beaker Walls
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';
    ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);

    // Beaker Volume Graduation Lines (100ml, 200ml, 300ml)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = '#334155';
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';

    [cy + 80, cy, cy - 80].forEach((gy, idx) => {
      ctx.beginPath();
      ctx.moveTo(cx - w / 2, gy);
      ctx.lineTo(cx - w / 2 + 18, gy);
      ctx.stroke();
      ctx.fillText(`${(idx + 1) * 100} mL`, cx - w / 2 + 22, gy + 3);
    });

    ctx.restore();
  }

  getSolutionColor(conc, alpha = 0.3) {
    // Pure water = light blue, high salt = amber tint
    if (conc <= 0.5) return `rgba(224, 242, 254, ${alpha})`;
    if (conc <= 2.5) return `rgba(186, 230, 253, ${alpha})`;
    if (conc <= 5.0) return `rgba(254, 240, 138, ${alpha})`;
    return `rgba(253, 186, 116, ${alpha})`;
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

window.OsmosisRenderer = OsmosisRenderer;
