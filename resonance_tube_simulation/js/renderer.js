/**
 * CanvasRenderer - High-DPI 2D Canvas Renderer for Resonance Tube Lab
 * Study Environment Law: #E6F2FF canvas background.
 */

export class CanvasRenderer {
  constructor(canvas, model) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.model = model;

    this.dpr = window.devicePixelRatio || 1;
    this.width = 800;
    this.height = 480;

    this.animTime = 0;
    this.isDraggingReservoir = false;

    this.initEvents();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 800;
    this.height = rect.height || 480;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    this.render();
  }

  initEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const startDrag = (e) => {
      const p = getPos(e);
      const resX = this.width * 0.68;
      const tubeTopY = 70;
      const tubeH = 360;
      const waterY = tubeTopY + (this.model.airColumnLength / 100.0) * tubeH;

      // Click near the reservoir bottle
      if (Math.abs(p.x - resX) < 40 && Math.abs(p.y - waterY) < 60) {
        this.isDraggingReservoir = true;
      }
    };

    const onDrag = (e) => {
      if (!this.isDraggingReservoir) return;
      const p = getPos(e);
      const tubeTopY = 70;
      const tubeH = 360;

      const frac = (p.y - tubeTopY) / tubeH;
      const newAirL = Math.max(0, Math.min(100.0, frac * 100.0));
      this.model.airColumnLength = parseFloat(newAirL.toFixed(1));
      this.render();
    };

    const stopDrag = () => {
      this.isDraggingReservoir = false;
    };

    this.canvas.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);

    this.canvas.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchmove', onDrag, { passive: true });
    window.addEventListener('touchend', stopDrag);
  }

  render() {
    const { ctx, width, height } = this;
    this.animTime += 0.05;

    // Soft Light-Blue Study Law Background
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, width, height);

    this.drawGrid();

    // Bench Geometry
    const tubeX = width * 0.38;
    const tubeW = 40;
    const tubeTopY = 70;
    const tubeH = 360;
    const tubeBottomY = tubeTopY + tubeH;

    const resX = width * 0.68;
    const resW = 46;
    const resH = 90;

    const airL = this.model.airColumnLength;
    const waterY = tubeTopY + (airL / 100.0) * tubeH;

    const prox = this.model.getResonanceProximity();

    // 1. Draw Stand & Retort Clamp
    this.drawRetortStand(tubeX - 55, tubeTopY - 20, tubeBottomY + 30);
    this.drawRetortStand(resX + 35, tubeTopY - 20, tubeBottomY + 30);

    // 2. Draw Connecting Flexible Rubber Tube
    this.drawFlexibleTubing(tubeX + tubeW / 2, tubeBottomY, resX, waterY + resH / 2);

    // 3. Draw Water in Tube and Reservoir
    this.drawWaterFill(tubeX, waterY, tubeW, tubeBottomY);
    this.drawReservoir(resX - resW / 2, waterY - resH / 2, resW, resH);

    // 4. Draw Standing Wave Harmonic Overlay inside Air Column
    if (this.model.showWaveform && airL > 2.0) {
      this.drawStandingWave(tubeX, tubeTopY, tubeW, waterY, prox);
    }

    // 5. Draw Glass Tube Outlines & Metric Centimeter Ruler
    this.drawGlassTubeAndScale(tubeX, tubeTopY, tubeW, tubeH, tubeBottomY);

    // 6. Draw Vibrating Tuning Fork over Tube Mouth
    this.drawTuningFork(tubeX + tubeW / 2, tubeTopY - 26, prox.factor);

    // 7. Draw Sound Intensity Decibel VU Meter Bar
    this.drawVUMeter(width * 0.12, tubeTopY + 20, 24, 200, prox.factor);
  }

  drawGrid() {
    const { ctx, width, height } = this;
    ctx.save();
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawRetortStand(x, topY, groundY) {
    const { ctx } = this;
    ctx.save();

    // Heavy Cast Iron Base
    ctx.fillStyle = '#334155';
    ctx.fillRect(x - 30, groundY - 10, 60, 10);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(x - 30, groundY - 10, 60, 10);

    // Vertical Steel Rod
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x - 3, topY, 6, groundY - topY - 10);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(x - 3, topY, 6, groundY - topY - 10);

    ctx.restore();
  }

  drawFlexibleTubing(x1, y1, x2, y2) {
    const { ctx } = this;
    ctx.save();

    // Curved rubber tube
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(x1, y1 + 50, x2 - 20, y2 + 50, x2, y2);
    ctx.stroke();

    // Water channel inside translucent tubing
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(x1, y1 + 50, x2 - 20, y2 + 50, x2, y2);
    ctx.stroke();

    ctx.restore();
  }

  drawWaterFill(x, waterY, w, bottomY) {
    const { ctx } = this;
    ctx.save();

    const waterH = bottomY - waterY;
    if (waterH <= 0) {
      ctx.restore();
      return;
    }

    // Water gradient
    const grad = ctx.createLinearGradient(x, 0, x + w, 0);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.65)');
    grad.addColorStop(0.5, 'rgba(14, 165, 233, 0.5)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.65)');

    ctx.fillStyle = grad;
    ctx.fillRect(x + 2, waterY, w - 4, waterH);

    // Concave Meniscus at water surface
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + 2, waterY);
    ctx.quadraticCurveTo(x + w / 2, waterY + 4, x + w - 2, waterY);
    ctx.stroke();

    ctx.restore();
  }

  drawReservoir(x, y, w, h) {
    const { ctx } = this;
    ctx.save();

    // Water inside reservoir
    ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.fillRect(x + 3, y + 10, w - 6, h - 14);

    // Glass vessel body
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.stroke();

    // Brass Clamp Bracket attached to stand
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x + w - 4, y + h / 2 - 8, 18, 16);
    ctx.strokeStyle = '#92400e';
    ctx.strokeRect(x + w - 4, y + h / 2 - 8, 18, 16);

    // Grab handle icon
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('↕ DRAG', x + w / 2, y + h / 2 + 3);

    ctx.restore();
  }

  drawGlassTubeAndScale(x, topY, w, h, bottomY) {
    const { ctx } = this;
    ctx.save();

    // Glass walls
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, topY, w, h);

    // Glass reflection highlights
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 5, topY + 5);
    ctx.lineTo(x + 5, bottomY - 5);
    ctx.stroke();

    // Centimeter Scale on the left of the tube (0 to 100 cm)
    ctx.fillStyle = '#0f172a';
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    for (let cm = 0; cm <= 100; cm += 5) {
      const sy = topY + (cm / 100.0) * h;
      const isMajor = (cm % 10 === 0);

      ctx.beginPath();
      ctx.moveTo(x, sy);
      ctx.lineTo(x - (isMajor ? 12 : 7), sy);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = isMajor ? 1.5 : 1;
      ctx.stroke();

      if (isMajor) {
        ctx.fillText(`${cm}`, x - 15, sy + 3);
      }
    }

    // Label on ruler
    ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('LENGTH (cm)', x - 26, topY - 10);

    ctx.restore();
  }

  drawStandingWave(tubeX, tubeTopY, tubeW, waterY, prox) {
    const { ctx } = this;
    ctx.save();

    const columnH = waterY - tubeTopY;
    const cx = tubeX + tubeW / 2;
    const maxAmp = (tubeW / 2 - 4) * (0.3 + prox.factor * 0.7);

    // Wave color turns brilliant glowing amber/cyan at resonance
    const waveColor = prox.factor > 0.4 ? '#dc2626' : '#0284c7';
    ctx.strokeStyle = waveColor;
    ctx.lineWidth = prox.factor > 0.5 ? 2.5 : 1.5;

    // Left and right standing wave envelope branches
    for (let branch = -1; branch <= 1; branch += 2) {
      ctx.beginPath();
      for (let y = tubeTopY; y <= waterY; y += 4) {
        const normY = (waterY - y) / columnH; // 0 at water surface, 1 at mouth
        // Antinode at mouth, Node at water surface
        const spatialAmp = Math.sin((normY * Math.PI) / 2);
        const dynamicOsc = Math.cos(this.animTime * 15);
        const offset = branch * spatialAmp * maxAmp * dynamicOsc;

        if (y === tubeTopY) ctx.moveTo(cx + offset, y);
        else ctx.lineTo(cx + offset, y);
      }
      ctx.stroke();
    }

    // Node & Antinode labels
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#dc2626';
    ctx.fillText('A (Antinode)', cx + tubeW / 2 + 10, tubeTopY + 10);
    ctx.fillText('N (Node)', cx + tubeW / 2 + 10, waterY - 4);

    ctx.restore();
  }

  drawTuningFork(x, y, resonanceFactor) {
    const { ctx } = this;
    ctx.save();

    // Stem handle
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x - 3, y - 25, 6, 20);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(x - 3, y - 25, 6, 20);

    // U-shaped Prongs / Tines
    const tineW = 5;
    const tineH = 26;
    const tineGap = 12;

    const vibration = Math.sin(this.animTime * 25) * (1.5 + resonanceFactor * 2.0);

    // Left tine
    ctx.fillRect(x - tineGap / 2 - tineW + vibration, y - 5, tineW, tineH);
    ctx.strokeRect(x - tineGap / 2 - tineW + vibration, y - 5, tineW, tineH);

    // Right tine
    ctx.fillRect(x + tineGap / 2 - vibration, y - 5, tineW, tineH);
    ctx.strokeRect(x + tineGap / 2 - vibration, y - 5, tineW, tineH);

    // Connecting arch
    ctx.beginPath();
    ctx.arc(x, y - 5, tineGap / 2 + tineW, Math.PI, 0, true);
    ctx.lineWidth = tineW;
    ctx.strokeStyle = '#94a3b8';
    ctx.stroke();

    // Frequency stamp tag
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.model.frequency} Hz`, x, y - 30);

    ctx.restore();
  }

  drawVUMeter(x, y, w, h, factor) {
    const { ctx } = this;
    ctx.save();

    ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText('RESONANCE', x + w / 2, y - 8);

    // Meter channel box
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();

    // Level fill
    const fillH = factor * (h - 8);
    const grad = ctx.createLinearGradient(0, y + h, 0, y);
    grad.addColorStop(0, '#22c55e');
    grad.addColorStop(0.6, '#eab308');
    grad.addColorStop(1, '#ef4444');

    ctx.fillStyle = grad;
    ctx.fillRect(x + 4, y + h - 4 - fillH, w - 8, fillH);

    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${Math.round(factor * 100)}%`, x + w / 2, y + h - 8);

    ctx.restore();
  }
}
