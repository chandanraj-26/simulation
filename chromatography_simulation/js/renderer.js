/**
 * High-Precision Canvas 2D Renderer for Paper Chromatography Laboratory
 * Strictly enforces simulation-guidelines: soft light-blue study environment,
 * retina scaling, crisp scientific markers, and zero-blowout layout.
 */

export class ChromatographyRenderer {
  constructor(canvas, engine, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.engine = engine;
    this.state = state;

    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    // Interactive ruler dragging
    this.isDraggingRuler = false;
    this.dragStartY = 0;
    this.rulerPixelOffset = 0;

    // Hit test regions
    this.spotHitBoxes = [];

    this.initEvents();
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

  initEvents() {
    this.canvas.addEventListener('pointerdown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check hit on pigment spots
      for (const spot of this.spotHitBoxes) {
        const dx = x - spot.x;
        const dy = y - spot.y;
        if (dx * dx + dy * dy <= spot.radius * spot.radius + 64) {
          this.state.selectPigment(spot.id);
          return;
        }
      }

      // Check hit on ruler
      if (this.state.showRuler && x >= this.rulerLeft && x <= this.rulerLeft + 50) {
        this.isDraggingRuler = true;
        this.dragStartY = y - this.rulerPixelOffset;
        this.canvas.style.cursor = 'ns-resize';
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDraggingRuler) return;
      const rect = this.canvas.getBoundingClientRect();
      const y = e.clientY - rect.top;
      this.rulerPixelOffset = Math.max(-120, Math.min(120, y - this.dragStartY));
    });

    window.addEventListener('pointerup', () => {
      if (this.isDraggingRuler) {
        this.isDraggingRuler = false;
        this.canvas.style.cursor = 'crosshair';
      }
    });
  }

  draw() {
    const { ctx, width, height } = this;
    if (width === 0 || height === 0) return;

    // Clear with soft light-blue canvas background
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, width, height);

    // Apparatus dimensions
    const centerX = width * 0.44;
    const chamberW = Math.min(280, width * 0.42);
    const chamberH = height * 0.82;
    const chamberTop = height * 0.10;
    const chamberBottom = chamberTop + chamberH;
    const chamberLeft = centerX - chamberW / 2;

    // Paper strip dimensions
    const stripW = chamberW * 0.38;
    const stripTop = chamberTop + 35;
    const stripBottom = chamberBottom - 30;
    const stripH = stripBottom - stripTop;
    const stripLeft = centerX - stripW / 2;

    this.drawLaboratoryBackground(width, height);
    this.drawChamber(chamberLeft, chamberTop, chamberW, chamberH);
    this.drawPaperStrip(stripLeft, stripTop, stripW, stripH);
    this.drawSolventReservoir(chamberLeft, chamberBottom, chamberW);
    this.drawChamberGlassHighlights(chamberLeft, chamberTop, chamberW, chamberH);

    if (this.state.showRuler) {
      this.drawRuler(stripLeft + stripW + 28, stripTop, stripBottom, stripH);
    }

    this.drawHUDCallouts(stripLeft, stripTop, stripW, stripH);
  }

  drawLaboratoryBackground(w, h) {
    const { ctx } = this;

    // Soft bench horizon line
    ctx.fillStyle = '#D9E8F8';
    ctx.fillRect(0, h * 0.86, w, h * 0.14);

    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.86);
    ctx.lineTo(w, h * 0.86);
    ctx.stroke();

    // Subtle grid lines for academic feel
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h * 0.86);
      ctx.stroke();
    }
  }

  drawChamber(x, y, w, h) {
    const { ctx } = this;

    // Glass body shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
    ctx.roundRect(x - 4, y, w + 8, h + 4, 12);
    ctx.fill();

    // Glass jar interior
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();

    // Glass outer stroke
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Chamber Airtight Glass Lid
    const lidH = 18;
    if (this.state.chamberLidClosed) {
      ctx.fillStyle = '#CBD5E1';
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x - 8, y - lidH + 2, w + 16, lidH, 4);
      ctx.fill();
      ctx.stroke();

      // Knob
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.arc(x + w / 2, y - lidH, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Suspension Clip holding Whatman paper
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + w / 2 - 14, y + 8, 28, 12);
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + w / 2 - 14, y + 8, 28, 12);
  }

  drawPaperStrip(x, y, w, h) {
    const { ctx } = this;

    // Whatman No. 1 paper background
    ctx.fillStyle = '#FAFCFF';
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();

    // Cellulose paper fiber texture
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // Baseline (Pencil mark at 1.5 cm from bottom)
    const baselineRatio = this.engine.baselineCm / this.engine.stripLengthCm;
    const baselineY = y + h * (1 - baselineRatio);

    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(x + 4, baselineY);
    ctx.lineTo(x + w - 4, baselineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Pencil Baseline Label
    ctx.fillStyle = '#64748B';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('ORIGIN BASELINE (1.5 cm)', x + 8, baselineY + 13);

    // Solvent limit line (stop line at 12.5 cm from bottom)
    const limitRatio = this.engine.solventLimitCm / this.engine.stripLengthCm;
    const limitY = y + h * (1 - limitRatio);
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x + 4, limitY);
    ctx.lineTo(x + w - 4, limitY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#EF4444';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('SOLVENT LIMIT (12.5 cm)', x + 8, limitY - 5);

    // Rising Solvent Front Level
    const currentSolventCm = this.engine.solventHeightCm; // net rise above baseline
    const totalCurrentCm = this.engine.baselineCm + currentSolventCm;
    const currentRatio = totalCurrentCm / this.engine.stripLengthCm;
    const solventFrontY = y + h * (1 - currentRatio);

    // Wet portion of paper
    if (currentSolventCm > 0) {
      const grad = ctx.createLinearGradient(0, baselineY, 0, solventFrontY);
      grad.addColorStop(0, 'rgba(219, 234, 254, 0.45)');
      grad.addColorStop(1, 'rgba(191, 219, 254, 0.70)');

      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, solventFrontY, w - 2, baselineY - solventFrontY);

      // Glistening solvent meniscus line
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(x, solventFrontY);
      ctx.lineTo(x + w, solventFrontY);
      ctx.stroke();

      // Glistening wave micro-highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(x + w * 0.2, solventFrontY - 1, w * 0.35, 1.5);
    }

    // Clear spot hit boxes
    this.spotHitBoxes = [];

    // Draw Pigment Spots
    const sample = this.state.getSample();
    const centerX = x + w / 2;

    if (currentSolventCm === 0) {
      // Unresolved initial spot at origin
      ctx.fillStyle = sample.spotColor;
      ctx.beginPath();
      ctx.arc(centerX, baselineY, sample.initialSpotRadius || 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.3)';
      ctx.stroke();
    } else {
      // Resolved bands migrating up
      const maxRisePixels = baselineY - limitY;

      this.engine.pigmentStates.forEach(pigment => {
        const riseRatio = (this.engine.solventLimitCm - this.engine.baselineCm);
        const spotPixelsUp = (pigment.distanceCm / riseRatio) * maxRisePixels;
        const spotY = baselineY - spotPixelsUp;
        const radius = pigment.spotSpreadRadius || 7;

        // Register hit test
        this.spotHitBoxes.push({
          id: pigment.id,
          name: pigment.name,
          x: centerX,
          y: spotY,
          radius: radius
        });

        // Gaussian elliptical spot glow
        const spotGrad = ctx.createRadialGradient(centerX, spotY, 2, centerX, spotY, radius * 1.5);
        spotGrad.addColorStop(0, pigment.colorRgba || pigment.color);
        spotGrad.addColorStop(0.7, pigment.color);
        spotGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.ellipse(centerX, spotY, radius * 1.4, radius * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        // Highlighting selected spot
        if (this.state.selectedPigmentId === pigment.id) {
          ctx.strokeStyle = '#0F172A';
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 2]);
          ctx.beginPath();
          ctx.arc(centerX, spotY, radius * 1.8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Selection callout label
          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.fillText(`◄ ${pigment.name} (Rf = ${pigment.currentRf.toFixed(2)})`, centerX + radius * 1.8 + 8, spotY + 4);
        }
      });
    }
  }

  drawSolventReservoir(chamberLeft, chamberBottom, chamberW) {
    const { ctx } = this;
    const poolH = 34;
    const poolTop = chamberBottom - poolH;

    // Organic solvent liquid pool
    ctx.fillStyle = 'rgba(147, 197, 253, 0.55)';
    ctx.fillRect(chamberLeft + 2, poolTop, chamberW - 4, poolH - 2);

    // Liquid surface meniscus
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(chamberLeft + 2, poolTop);
    ctx.lineTo(chamberLeft + chamberW - 2, poolTop);
    ctx.stroke();

    // Solvent pool label
    ctx.fillStyle = '#1E3A8A';
    ctx.font = '10px "Inter", sans-serif';
    ctx.fillText(this.state.getSolvent().name, chamberLeft + 12, poolTop + 22);
  }

  drawChamberGlassHighlights(x, y, w, h) {
    const { ctx } = this;
    // Left vertical glass reflection
    const grad = ctx.createLinearGradient(x, 0, x + 25, 0);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x + 2, y + 2, 24, h - 4);
  }

  drawRuler(rulerX, stripTop, stripBottom, stripH) {
    const { ctx } = this;
    const rulerW = 42;
    const actualRulerY = stripTop + this.rulerPixelOffset;

    this.rulerLeft = rulerX;

    // Wooden/plastic metric ruler body
    ctx.fillStyle = 'rgba(254, 243, 199, 0.94)';
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(rulerX, actualRulerY - 10, rulerW, stripH + 20, 4);
    ctx.fill();
    ctx.stroke();

    // Metric graduation ticks (14 cm scale)
    const cmPixels = stripH / this.engine.stripLengthCm;
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = '#78350F';
    ctx.font = '9px "JetBrains Mono", monospace';

    for (let cm = 0; cm <= 14; cm++) {
      // Invert so 0 cm is at bottom baseline
      const tickY = (actualRulerY + stripH) - (cm * cmPixels);

      // Major cm line
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rulerX, tickY);
      ctx.lineTo(rulerX + 16, tickY);
      ctx.stroke();

      ctx.fillText(`${cm}`, rulerX + 20, tickY + 3);

      // Half cm line
      if (cm < 14) {
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(rulerX, tickY - cmPixels * 0.5);
        ctx.lineTo(rulerX + 10, tickY - cmPixels * 0.5);
        ctx.stroke();
      }
    }

    // Drag Handle Pill
    ctx.fillStyle = '#D97706';
    ctx.fillRect(rulerX + 14, actualRulerY - 6, 14, 4);
  }

  drawHUDCallouts(stripLeft, stripTop, stripW, stripH) {
    const { ctx } = this;
    const metrics = this.engine.getMetrics();

    // Top HUD live status pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(16, 16, 260, 48, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px "Inter", sans-serif';
    ctx.fillText('Solvent Migration Front:', 28, 36);

    ctx.fillStyle = '#2563EB';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillText(`${metrics.netSolventDistanceCm.toFixed(2)} cm / 11.00 cm`, 28, 54);
  }
}
