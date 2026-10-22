/**
 * MicroscopeSim — Canvas 2D Renderer
 * Renders the circular microscope ocular field-of-view, realistic cytology histology,
 * stained chromosomes across all 5 mitotic phases, spindle fibers, cell plates/furrows,
 * stage micrometer calibration scale, and ocular reticle graticule.
 */

class MicroscopeRenderer {
  constructor(canvas, state, engine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = state;
    this.engine = engine;

    this.width = 800;
    this.height = 540;
    this.dpr = 1;

    // Hovered cell tracking
    this.hoveredCell = null;

    // Stage dragging interaction
    this.isDraggingStage = false;
    this.dragStart = { x: 0, y: 0 };
    this.stageStart = { x: 0, y: 0 };

    this.bindEvents();
    this.resize();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.width = Math.max(320, rect.width);
    this.height = Math.max(340, rect.height);

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  bindEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const onDown = (e) => {
      const pos = getPos(e);
      const cx = this.width * 0.5;
      const cy = this.height * 0.5;
      const radius = Math.min(this.width, this.height) * 0.44;

      const dist = Math.hypot(pos.x - cx, pos.y - cy);
      if (dist <= radius) {
        // If clicking on cell in tagging or inspect mode
        const clickedCell = this.engine.hitTestCell(pos.x, pos.y, cx, cy, radius);

        if (clickedCell) {
          if (this.state.activeTagTool === 'inspect') {
            this.state.selectedCell = clickedCell;
            this.state.notify('cell_inspect', { cell: clickedCell });
            if (window.microscopeSound) window.microscopeSound.playTagPop();
            return;
          } else {
            // Tag cell with active phase tool
            this.state.tagCell(clickedCell.id, this.state.activeTagTool);
            if (window.microscopeSound) window.microscopeSound.playTagPop();
            return;
          }
        }

        // Start stage translation drag
        this.isDraggingStage = true;
        this.dragStart = { x: pos.x, y: pos.y };
        this.stageStart = { x: this.state.stageX, y: this.state.stageY };
        this.canvas.style.cursor = 'grabbing';
      }
    };

    const onMove = (e) => {
      const pos = getPos(e);
      const cx = this.width * 0.5;
      const cy = this.height * 0.5;
      const radius = Math.min(this.width, this.height) * 0.44;

      if (this.isDraggingStage) {
        const scale = this.engine.getMagnificationScale();
        const dx = (pos.x - this.dragStart.x) / scale;
        const dy = (pos.y - this.dragStart.y) / scale;
        this.state.setStageXY(this.stageStart.x + dx, this.stageStart.y + dy);
      } else {
        const dist = Math.hypot(pos.x - cx, pos.y - cy);
        if (dist <= radius) {
          this.hoveredCell = this.engine.hitTestCell(pos.x, pos.y, cx, cy, radius);
          this.canvas.style.cursor = this.hoveredCell ? 'pointer' : 'grab';
        } else {
          this.hoveredCell = null;
          this.canvas.style.cursor = 'default';
        }
      }
    };

    const onUp = () => {
      this.isDraggingStage = false;
      this.canvas.style.cursor = 'default';
    };

    this.canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    this.canvas.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Soft Light-Blue Study Environment Backdrop
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, w, h);

    // Coordinate grid in background
    this.drawBackgroundGrid(ctx, w, h);

    // Microscope Ocular Geometry
    const cx = w * 0.5;
    const cy = h * 0.5;
    const ocularRadius = Math.min(w, h) * 0.44;

    // 2. Heavy Anodized Metallic Ocular Ring Shadow & Bezel
    this.drawMicroscopeBezel(ctx, cx, cy, ocularRadius);

    // 3. Circular Ocular Portal (Clipped Field of View)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, ocularRadius, 0, Math.PI * 2);
    ctx.clip();

    // Field-of-view illumination background
    const light = this.state.lightIntensity;
    const aperture = this.state.irisDiaphragm;
    ctx.fillStyle = `rgba(255, 253, 245, ${0.85 * light})`;
    ctx.fillRect(cx - ocularRadius, cy - ocularRadius, ocularRadius * 2, ocularRadius * 2);

    // Apply focus blur / depth of field
    const blur = this.engine.getBlurRadius();
    if (blur > 0.8) {
      ctx.filter = `blur(${Math.min(12, blur)}px)`;
    } else {
      ctx.filter = 'none';
    }

    // 4. Render Active Biological Specimen
    if (this.state.slide === 'onion') {
      this.renderOnionSlide(ctx, cx, cy);
    } else if (this.state.slide === 'whitefish') {
      this.renderWhitefishSlide(ctx, cx, cy);
    } else if (this.state.slide === 'micrometer') {
      this.renderMicrometerSlide(ctx, cx, cy);
    }

    // Reset filter
    ctx.filter = 'none';

    // 5. Immersion Oil Air-Interface Glare (if 100x without oil)
    if (this.state.objective === '100x' && !this.state.hasImmersionOil) {
      this.drawRefractionHaze(ctx, cx, cy, ocularRadius);
    }

    // 6. Substage Diaphragm Vignette
    this.drawDiaphragmVignette(ctx, cx, cy, ocularRadius, aperture);

    // 7. Ocular Reticle / Graticule Overlay
    if (this.state.showGraticule) {
      this.drawOcularGraticule(ctx, cx, cy, ocularRadius);
    }

    ctx.restore(); // Restore clip

    // 8. Ocular Inner Glass Reflection Ring
    this.drawLensReflections(ctx, cx, cy, ocularRadius);

    // 9. Floating Ocular Telemetry & Crosshair Center Pin
    this.drawOcularHUD(ctx, cx, cy, ocularRadius);
  }

  drawBackgroundGrid(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.45)';
    ctx.lineWidth = 1;
    const step = 25;
    ctx.beginPath();
    for (let x = step; x < w; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = step; y < h; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  drawMicroscopeBezel(ctx, cx, cy, radius) {
    ctx.save();
    // Deep cast shadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;

    // Heavy dark ocular barrel ring
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 9, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Outer machined chrome ring
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 19, 0, Math.PI * 2);
    ctx.stroke();

    // Inner brass bezel lip
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 1, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  renderOnionSlide(ctx, cx, cy) {
    const slide = window.cellsData.slides.onion;
    if (!slide || !slide.cells) return;

    const scale = this.engine.getMagnificationScale();

    for (const cell of slide.cells) {
      const scr = this.engine.slideToScreenCoords(cell.x, cell.y, cx, cy);
      const w = cell.w * scale;
      const h = cell.h * scale;

      // Skip cells completely outside FOV bounds
      if (scr.x + w < cx - 350 || scr.x - w > cx + 350 ||
          scr.y + h < cy - 350 || scr.y - h > cy + 350) {
        continue;
      }

      this.drawPlantCell(ctx, scr.x, scr.y, w, h, cell);
    }
  }

  drawPlantCell(ctx, x, y, w, h, cell) {
    ctx.save();
    const halfW = w * 0.5;
    const halfH = h * 0.5;

    // 1. Cytoplasm fill (pale eosin-acetocarmine blush)
    ctx.fillStyle = '#FDF2F8';
    ctx.fillRect(x - halfW, y - halfH, w, h);

    // 2. Cellulose Cell Wall (Rigid double-layered plant wall)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = Math.max(1.2, w * 0.04);
    ctx.strokeRect(x - halfW, y - halfH, w, h);

    // Middle lamella pectin line
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(x - halfW + 1.5, y - halfH + 1.5, w - 3, h - 3);

    // 3. Stained Chromatin & Spindle according to Mitotic Stage
    ctx.translate(x, y);
    ctx.rotate(cell.angle);

    this.drawMitoticStage(ctx, cell.stage, w, h, cell);

    ctx.rotate(-cell.angle);
    ctx.translate(-x, -y);

    // 4. Hover Highlight & Tagged Status Badge
    const isHovered = this.hoveredCell && this.hoveredCell.id === cell.id;
    if (isHovered) {
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(x - halfW, y - halfH, w, h);
      ctx.setLineDash([]);
    }

    const tag = this.state.taggedCells[cell.id];
    if (tag) {
      this.drawCellTagBadge(ctx, x, y - halfH - 6, tag);
    }

    ctx.restore();
  }

  drawMitoticStage(ctx, stage, w, h, cell) {
    const stainPrimary = '#701A75'; // Acetocarmine deep purple-magenta
    const stainSecondary = '#86198F';
    const stainLight = '#C026D3';
    const nucleolusColor = '#4A044E';

    const r = Math.min(w, h) * 0.32;

    switch (stage) {
      case 'interphase': {
        // Intact nuclear envelope
        ctx.fillStyle = 'rgba(217, 70, 239, 0.22)';
        ctx.strokeStyle = stainPrimary;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Prominent dark spherical nucleolus
        ctx.fillStyle = nucleolusColor;
        ctx.beginPath();
        ctx.arc(r * 0.25, -r * 0.15, r * 0.30, 0, Math.PI * 2);
        ctx.fill();

        // Diffuse, granular chromatin stippling
        ctx.fillStyle = stainSecondary;
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * Math.PI * 2;
          const d = (0.2 + (i % 5) * 0.14) * r;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * d, Math.sin(a) * d, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'prophase': {
        // Condensing coiled chromatin spaghetti
        ctx.strokeStyle = stainPrimary;
        ctx.lineWidth = Math.max(1.8, w * 0.05);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2;
          const x1 = Math.cos(a) * (r * 0.8);
          const y1 = Math.sin(a) * (r * 0.8);
          const x2 = Math.cos(a + 1.2) * (r * 0.3);
          const y2 = Math.sin(a + 1.2) * (r * 0.3);
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(0, 0, x2, y2);
        }
        ctx.stroke();

        // Fading broken nuclear envelope remnants
        ctx.strokeStyle = 'rgba(112, 26, 117, 0.4)';
        ctx.lineWidth = 1.0;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.05, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      }

      case 'metaphase': {
        // Faint spindle fibers radiating from poles
        ctx.strokeStyle = 'rgba(8, 145, 178, 0.4)'; // Cyan microtubule fibers
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (let i = -r * 0.8; i <= r * 0.8; i += r * 0.35) {
          ctx.moveTo(0, -r * 1.1); // Top pole
          ctx.lineTo(i, 0);         // Kinetochore plate
          ctx.moveTo(0, r * 1.1);  // Bottom pole
          ctx.lineTo(i, 0);
        }
        ctx.stroke();

        // Chromosomes aligned tightly along Equatorial Metaphase Plate
        ctx.fillStyle = stainPrimary;
        ctx.strokeStyle = nucleolusColor;
        ctx.lineWidth = 1.2;

        const numChr = 6;
        for (let i = 0; i < numChr; i++) {
          const cx = (i - (numChr - 1) / 2) * (r * 0.34);
          ctx.save();
          ctx.translate(cx, 0);
          ctx.beginPath();
          // Condensed double-armed chromatid pair
          ctx.ellipse(0, 0, r * 0.14, r * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
        break;
      }

      case 'anaphase': {
        // Spindle traction lines
        ctx.strokeStyle = 'rgba(8, 145, 178, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (let i = -r * 0.7; i <= r * 0.7; i += r * 0.4) {
          ctx.moveTo(0, -r * 1.15);
          ctx.lineTo(i, -r * 0.45);
          ctx.moveTo(0, r * 1.15);
          ctx.lineTo(i, r * 0.45);
        }
        ctx.stroke();

        // Two separating V-shaped chromatid clusters
        ctx.strokeStyle = stainPrimary;
        ctx.lineWidth = Math.max(2.0, w * 0.055);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Upper migrating group (V arms pointing downwards)
        ctx.beginPath();
        for (let i = -2; i <= 2; i++) {
          const cx = i * (r * 0.35);
          const cy = -r * 0.55;
          ctx.moveTo(cx - r * 0.15, cy + r * 0.25);
          ctx.lineTo(cx, cy);
          ctx.lineTo(cx + r * 0.15, cy + r * 0.25);
        }
        ctx.stroke();

        // Lower migrating group (V arms pointing upwards)
        ctx.beginPath();
        for (let i = -2; i <= 2; i++) {
          const cx = i * (r * 0.35);
          const cy = r * 0.55;
          ctx.moveTo(cx - r * 0.15, cy - r * 0.25);
          ctx.lineTo(cx, cy);
          ctx.lineTo(cx + r * 0.15, cy - r * 0.25);
        }
        ctx.stroke();
        break;
      }

      case 'telophase': {
        // Two daughter nuclei at opposite poles decondensing
        ctx.fillStyle = 'rgba(217, 70, 239, 0.28)';
        ctx.strokeStyle = stainPrimary;
        ctx.lineWidth = 1.3;

        // Top pole daughter nucleus
        ctx.beginPath();
        ctx.arc(0, -r * 0.65, r * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Bottom pole daughter nucleus
        ctx.beginPath();
        ctx.arc(0, r * 0.65, r * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Only plant cells form a Cellulose Cell Plate
        if (!cell || cell.specimen !== 'whitefish') {
          // Forming Primary Cellulose Cell Plate (Phragmoplast vesicle fusion)
          ctx.strokeStyle = '#059669'; // Emerald young cell wall plate
          ctx.lineWidth = Math.max(2.0, w * 0.045);
          ctx.beginPath();
          ctx.moveTo(-w * 0.42, 0);
          ctx.lineTo(w * 0.42, 0);
          ctx.stroke();

          // Vesicle beads fusing into cell plate
          ctx.fillStyle = '#10B981';
          for (let i = -w * 0.35; i <= w * 0.35; i += 7) {
            ctx.beginPath();
            ctx.arc(i, 0, 1.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }
    }
  }

  renderWhitefishSlide(ctx, cx, cy) {
    this.drawWhitefishSlide(ctx, cx, cy);
  }

  drawWhitefishSlide(ctx, cx, cy) {
    const slide = window.cellsData.slides.whitefish;
    if (!slide || !slide.cells) return;

    const scale = this.engine.getMagnificationScale();

    for (const cell of slide.cells) {
      const scr = this.engine.slideToScreenCoords(cell.x, cell.y, cx, cy);
      const w = cell.w * scale;
      const h = cell.h * scale;

      if (scr.x + w < cx - 350 || scr.x - w > cx + 350 ||
          scr.y + h < cy - 350 || scr.y - h > cy + 350) {
        continue;
      }

      this.drawAnimalCell(ctx, scr.x, scr.y, w * 0.5, cell);
    }
  }

  drawAnimalCell(ctx, x, y, radius, cell) {
    ctx.save();

    // Round animal plasma membrane
    ctx.fillStyle = '#FFF1F2'; // Pale eosinophilic cytoplasm
    ctx.strokeStyle = '#BE123C';
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.translate(x, y);
    ctx.rotate(cell.angle);

    // Astral rays (asters) radiating from centrosomes in dividing animal cells
    if (cell.stage === 'metaphase' || cell.stage === 'anaphase') {
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
      ctx.lineWidth = 0.8;
      // Top Aster
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.65);
        ctx.lineTo(Math.cos(a) * (radius * 0.4), -radius * 0.65 + Math.sin(a) * (radius * 0.4));
        ctx.stroke();
      }
      // Bottom Aster
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, radius * 0.65);
        ctx.lineTo(Math.cos(a) * (radius * 0.4), radius * 0.65 + Math.sin(a) * (radius * 0.4));
        ctx.stroke();
      }
    }

    // Animal Cleavage Furrow pinching inward during Telophase
    if (cell.stage === 'telophase') {
      ctx.strokeStyle = '#881337';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-radius, 0);
      ctx.lineTo(-radius * 0.45, 0);
      ctx.moveTo(radius, 0);
      ctx.lineTo(radius * 0.45, 0);
      ctx.stroke();
    }

    this.drawMitoticStage(ctx, cell.stage, radius * 2, radius * 2, cell);

    ctx.rotate(-cell.angle);
    ctx.translate(-x, -y);

    // Hover Highlight
    const isHovered = this.hoveredCell && this.hoveredCell.id === cell.id;
    if (isHovered) {
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const tag = this.state.taggedCells[cell.id];
    if (tag) {
      this.drawCellTagBadge(ctx, x, y - radius - 6, tag);
    }

    ctx.restore();
  }

  renderMicrometerSlide(ctx, cx, cy) {
    ctx.save();
    const scale = this.engine.getMagnificationScale();
    const startX = cx + this.state.stageX * scale;
    const startY = cy + this.state.stageY * scale;

    // Glass slide boundary
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.fillRect(startX - 600, startY - 100, 1200, 200);
    ctx.strokeRect(startX - 600, startY - 100, 1200, 200);

    // 0.01 mm Etched Divisions Scale
    // Total 100 divisions = 1.0 mm (1000 micrometers)
    const tickSpacing = 10 * scale; // 10 micrometers per subdivision

    ctx.strokeStyle = '#0F172A';
    ctx.fillStyle = '#0F172A';
    ctx.font = `600 11px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';

    for (let i = 0; i <= 100; i++) {
      const tx = startX - 500 * scale + i * tickSpacing;
      let tickH = 14;

      if (i % 10 === 0) {
        tickH = 34; // Major 0.1 mm tick
        ctx.fillText(`${(i * 0.01).toFixed(2)}mm`, tx, startY - 40);
      } else if (i % 5 === 0) {
        tickH = 22; // Mid tick
      }

      ctx.lineWidth = (i % 10 === 0) ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(tx, startY - tickH * 0.5);
      ctx.lineTo(tx, startY + tickH * 0.5);
      ctx.stroke();
    }

    // Slide label
    ctx.font = `700 13px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillText('STAGE MICROMETER (1 DIV = 0.01 mm / 10 µm)', startX, startY + 60);

    ctx.restore();
  }

  drawCellTagBadge(ctx, x, y, tag) {
    ctx.save();
    const colors = {
      interphase: '#0284C7',
      prophase: '#D97706',
      metaphase: '#059669',
      anaphase: '#E11D48',
      telophase: '#7C3AED'
    };
    const color = colors[tag] || '#475569';

    ctx.font = `700 10px 'JetBrains Mono', monospace`;
    const label = tag.substring(0, 3).toUpperCase();
    const tw = ctx.measureText(label).width;

    ctx.fillStyle = color;
    ctx.beginPath();
    this.roundRect(ctx, x - tw * 0.5 - 6, y - 14, tw + 12, 16, 4);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y - 6);
    ctx.restore();
  }

  drawDiaphragmVignette(ctx, cx, cy, radius, aperture) {
    ctx.save();
    // Contrast vignette around optical field perimeter
    const grad = ctx.createRadialGradient(cx, cy, radius * (0.6 + aperture * 0.35), cx, cy, radius);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0)');
    grad.addColorStop(1, `rgba(15, 23, 42, ${0.45 * (1.1 - aperture)})`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawRefractionHaze(ctx, cx, cy, radius) {
    ctx.save();
    // Milky optical haze without immersion oil
    ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#BE123C';
    ctx.font = `700 13px 'Plus Jakarta Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ AIR-GLASS REFRACTION MISMATCH', cx, cy - 20);
    ctx.font = `600 11px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillStyle = '#475569';
    ctx.fillText('Apply Immersion Oil (n = 1.515) for High-NA Resolution', cx, cy + 5);
    ctx.restore();
  }

  drawOcularGraticule(ctx, cx, cy, radius) {
    ctx.save();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.lineWidth = 1;

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.8, cy);
    ctx.lineTo(cx + radius * 0.8, cy);
    ctx.moveTo(cx, cy - radius * 0.8);
    ctx.lineTo(cx, cy + radius * 0.8);
    ctx.stroke();

    // 100 Micrometric Divisions along horizontal crosshair
    const step = (radius * 1.6) / 100;
    for (let i = 0; i <= 100; i++) {
      const gx = (cx - radius * 0.8) + i * step;
      let tickH = 4;
      if (i % 10 === 0) tickH = 14;
      else if (i % 5 === 0) tickH = 8;

      ctx.beginPath();
      ctx.moveTo(gx, cy - tickH * 0.5);
      ctx.lineTo(gx, cy + tickH * 0.5);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawLensReflections(ctx, cx, cy, radius) {
    ctx.save();
    // Subtle glassy arc reflections
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 6, -Math.PI * 0.85, -Math.PI * 0.55);
    ctx.stroke();
    ctx.restore();
  }

  drawOcularHUD(ctx, cx, cy, radius) {
    ctx.save();
    // Top-left HUD badge: Total Magnification
    const totalMag = this.state.getTotalMagnification();
    const magText = `${totalMag}× (${this.state.objective} + 10× Ocular)`;
    ctx.font = `700 11px 'JetBrains Mono', monospace`;
    ctx.fillStyle = '#0F172A';
    const tw = ctx.measureText(magText).width;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    this.roundRect(ctx, 16, 16, tw + 20, 26, 6);
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#059669';
    ctx.fillText(magText, 26, 33);

    // Top-right HUD badge: Optical Clarity %
    const clarityPct = Math.round(this.state.clarity * 100);
    const clarText = `Clarity: ${clarityPct}%`;
    const ctw = ctx.measureText(clarText).width;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    this.roundRect(ctx, this.width - ctw - 36, 16, ctw + 20, 26, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = clarityPct > 80 ? '#059669' : (clarityPct > 50 ? '#D97706' : '#E11D48');
    ctx.fillText(clarText, this.width - ctw - 26, 33);

    ctx.restore();
  }

  roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

// Global renderer singleton
window.MicroscopeRenderer = MicroscopeRenderer;
