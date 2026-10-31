/**
 * CanvasRenderer - High-DPI 2D Canvas Renderer for pH Scale & Dilution Lab
 * Study Environment Law: #E6F2FF canvas background.
 */

export class CanvasRenderer {
  constructor(canvas, model) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.model = model;

    this.dpr = window.devicePixelRatio || 1;
    this.width = 800;
    this.height = 450;

    // Faucet / drain animation states
    this.isPouring = false;
    this.isDraining = false;
    this.animTime = 0;

    // Draggable probe state
    this.isDraggingProbe = false;
    this.dragOffset = { x: 0, y: 0 };

    this.initEvents();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 800;
    this.height = rect.height || 450;

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
      const probe = this.model.probePos;
      // Distance to probe wand handle or tip
      if (Math.hypot(p.x - probe.x, p.y - (probe.y - 70)) < 40 || Math.hypot(p.x - probe.x, p.y - probe.y) < 30) {
        this.isDraggingProbe = true;
        this.dragOffset.x = p.x - probe.x;
        this.dragOffset.y = p.y - probe.y;
      }
    };

    const onDrag = (e) => {
      if (!this.isDraggingProbe) return;
      const p = getPos(e);
      this.model.probePos.x = Math.max(100, Math.min(this.width - 100, p.x - this.dragOffset.x));
      this.model.probePos.y = Math.max(80, Math.min(this.height - 40, p.y - this.dragOffset.y));
      this.render();
    };

    const stopDrag = () => {
      this.isDraggingProbe = false;
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

    // Study Environment Soft Light-Blue
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, width, height);

    this.drawGrid();

    // Beaker Geometry
    const beakerX = width * 0.35;
    const beakerBottomY = height * 0.88;
    const beakerW = 280;
    const beakerH = 260;
    const beakerTopY = beakerBottomY - beakerH;

    const analysis = this.model.getAnalysis();

    // 1. Draw Water Faucet Pipe on top
    this.drawFaucet(beakerX + 60, beakerTopY - 45);

    // 2. Draw Bottom Drain Valve Pipe
    this.drawDrainValve(beakerX + beakerW - 50, beakerBottomY);

    // 3. Draw Liquid Solution inside Beaker
    const liquidH = (this.model.volume / this.model.maxVolume) * (beakerH - 30);
    const liquidTopY = beakerBottomY - liquidH;

    this.drawLiquid(beakerX, beakerBottomY, beakerW, liquidH, liquidTopY, analysis.color);

    // 4. Draw Floating Microscopic Ions (H3O+ and OH-)
    if (this.model.showParticles && this.model.volume > 0.05) {
      this.drawIonParticles(beakerX, beakerW, liquidTopY, beakerBottomY, analysis.pH);
    }

    // 5. Draw Glass Beaker Walls & Graduation Marks
    this.drawBeakerGlass(beakerX, beakerBottomY, beakerW, beakerH, beakerTopY);

    // 6. Draw Submerged pH Sensor Probe Wand with LCD meter
    this.drawSensorProbe(liquidTopY, analysis);

    // 7. Draw Continuous pH Indicator Palette Reference on the side
    this.drawReferenceScale(width * 0.82, height * 0.15, 45, 260, analysis.pH);
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

  drawFaucet(x, y) {
    const { ctx } = this;
    ctx.save();

    // Brass/Chrome Faucet Pipe
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x - 30, y, 40, 22);
    ctx.fillRect(x, y, 22, 45);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 30, y, 40, 22);
    ctx.strokeRect(x, y, 22, 45);

    // Faucet Handle Valve
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x + 2, y - 12, 18, 12);
    ctx.fillRect(x - 8, y - 18, 38, 8);

    // Streaming Water Jet if pouring
    if (this.isPouring) {
      const streamGrad = ctx.createLinearGradient(x + 11, y + 45, x + 11, y + 160);
      streamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
      streamGrad.addColorStop(1, 'rgba(14, 165, 233, 0.5)');

      ctx.fillStyle = streamGrad;
      ctx.fillRect(x + 6, y + 45, 10, 110);

      // Splash ripples at contact
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x + 11, y + 155, 8 + Math.sin(this.animTime * 10) * 3, 0, Math.PI);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawDrainValve(x, y) {
    const { ctx } = this;
    ctx.save();

    // Drain Spout
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x, y, 22, 35);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, 22, 35);

    if (this.isDraining) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.fillRect(x + 6, y + 35, 10, 50);
    }

    ctx.restore();
  }

  drawLiquid(x, bottomY, w, h, topY, colorRgb) {
    const { ctx } = this;
    ctx.save();

    if (h <= 0) {
      ctx.restore();
      return;
    }

    // Liquid Body Gradient with soft transparency
    ctx.fillStyle = colorRgb;
    ctx.globalAlpha = 0.78;

    ctx.beginPath();
    ctx.moveTo(x + 4, bottomY - 4);
    ctx.lineTo(x + 4, topY);

    // Gentle sinusoidal meniscus surface
    const waveAmp = this.isPouring || this.isDraining ? 3.0 : 1.2;
    for (let wx = x + 4; wx <= x + w - 4; wx += 10) {
      const wy = topY + Math.sin((wx * 0.05) + this.animTime * 3) * waveAmp;
      ctx.lineTo(wx, wy);
    }

    ctx.lineTo(x + w - 4, bottomY - 4);
    ctx.closePath();
    ctx.fill();

    // Meniscus Highlight Rim
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 4, topY);
    ctx.lineTo(x + w - 4, topY);
    ctx.stroke();

    ctx.restore();
  }

  drawIonParticles(x, w, topY, bottomY, pH) {
    const { ctx } = this;
    ctx.save();

    // Ratio of H+ to OH- particles based on pH
    // pH < 7: More H3O+ (Red); pH > 7: More OH- (Blue); pH 7: equal
    const totalParticles = 24;
    let numH = Math.round(totalParticles * Math.pow(10, (7 - pH) / 3) / (Math.pow(10, (7 - pH) / 3) + 1));
    numH = Math.max(1, Math.min(totalParticles - 1, numH));
    const numOH = totalParticles - numH;

    const drawIon = (ix, iy, label, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(ix, iy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 7px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, ix, iy);
    };

    // Deterministic pseudo-random placement animated by time
    for (let i = 0; i < totalParticles; i++) {
      const isH = (i < numH);
      const seed = i * 137.5;
      const px = x + 25 + ((seed * 11) % (w - 50)) + Math.sin(this.animTime + seed) * 6;
      const py = topY + 20 + ((seed * 17) % (bottomY - topY - 35)) + Math.cos(this.animTime * 0.8 + seed) * 5;

      if (py > topY + 10 && py < bottomY - 10) {
        if (isH) {
          drawIon(px, py, 'H⁺', '#dc2626');
        } else {
          drawIon(px, py, 'OH⁻', '#2563eb');
        }
      }
    }

    ctx.restore();
  }

  drawBeakerGlass(x, bottomY, w, h, topY) {
    const { ctx } = this;
    ctx.save();

    // Borosilicate Glass Outlines
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Beaker spout on top left
    ctx.moveTo(x - 14, topY);
    ctx.lineTo(x, topY);
    ctx.lineTo(x, bottomY - 10);
    ctx.quadraticCurveTo(x, bottomY, x + 10, bottomY);
    ctx.lineTo(x + w - 10, bottomY);
    ctx.quadraticCurveTo(x + w, bottomY, x + w, bottomY - 10);
    ctx.lineTo(x + w, topY);
    ctx.stroke();

    // Glass reflection sheen
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 10, topY + 15);
    ctx.lineTo(x + 10, bottomY - 15);
    ctx.stroke();

    // Graduation Scale Marks (0.1 L to 1.0 L)
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'right';

    for (let mark = 1; mark <= 10; mark++) {
      const vol = mark * 0.1;
      const my = bottomY - (vol / this.model.maxVolume) * (h - 30);

      ctx.beginPath();
      ctx.moveTo(x + w - 24, my);
      ctx.lineTo(x + w, my);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = (mark % 5 === 0) ? 2 : 1;
      ctx.stroke();

      if (mark % 2 === 0) {
        ctx.fillText(`${vol.toFixed(1)} L`, x + w - 28, my + 3);
      }
    }

    ctx.restore();
  }

  drawSensorProbe(liquidTopY, analysis) {
    const { ctx } = this;
    ctx.save();

    const probe = this.model.probePos;
    const isSubmerged = (probe.y >= liquidTopY && probe.y <= this.height * 0.88);
    this.model.isProbeSubmerged = isSubmerged;

    // Flexible cable leading up offscreen
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(probe.x, probe.y - 120);
    ctx.quadraticCurveTo(probe.x + 30, probe.y - 180, probe.x + 60, 20);
    ctx.stroke();

    // Stainless Steel Electrode Wand Shaft
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(probe.x - 4, probe.y - 110, 8, 110);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(probe.x - 4, probe.y - 110, 8, 110);

    // Glass Bulb Sensor Tip
    const tipGrad = ctx.createRadialGradient(probe.x, probe.y, 1, probe.x, probe.y, 8);
    tipGrad.addColorStop(0, '#ffffff');
    tipGrad.addColorStop(0.6, isSubmerged ? '#38bdf8' : '#94a3b8');
    tipGrad.addColorStop(1, '#0284c7');

    ctx.fillStyle = tipGrad;
    ctx.beginPath();
    ctx.arc(probe.x, probe.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0369a1';
    ctx.stroke();

    // Digital LCD Housing attached to probe
    const meterX = probe.x - 55;
    const meterY = probe.y - 115;
    const meterW = 110;
    const meterH = 50;

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(meterX, meterY, meterW, meterH, 8);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // LCD Screen Glow
    ctx.fillStyle = '#022c22';
    ctx.fillRect(meterX + 8, meterY + 8, meterW - 16, meterH - 16);
    ctx.strokeStyle = '#059669';
    ctx.strokeRect(meterX + 8, meterY + 8, meterW - 16, meterH - 16);

    // Live Readout Text
    ctx.textAlign = 'center';
    if (isSubmerged) {
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 15px "JetBrains Mono", monospace';
      ctx.fillText(`pH: ${analysis.pH.toFixed(2)}`, meterX + meterW / 2, meterY + 28);
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillStyle = '#86efac';
      ctx.fillText(`${analysis.classification.toUpperCase()}`, meterX + meterW / 2, meterY + 39);
    } else {
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.fillText('SUBMERGE PROBE', meterX + meterW / 2, meterY + 30);
    }

    ctx.restore();
  }

  drawReferenceScale(x, y, w, h, currentPH) {
    const { ctx } = this;
    ctx.save();

    // Header label
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText('pH SPECTRUM', x + w / 2, y - 10);

    // Continuous Universal Indicator Gradient Bar
    const grad = ctx.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, '#dc2626');   // pH 0
    grad.addColorStop(0.28, '#ea580c'); // pH 4
    grad.addColorStop(0.5, '#16a34a');  // pH 7
    grad.addColorStop(0.71, '#2563eb'); // pH 10
    grad.addColorStop(1, '#7c3aed');    // pH 14

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Scale ticks and numbers (0, 7, 14)
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('0', x + w / 2, y + 14);
    ctx.fillText('7', x + w / 2, y + h / 2 + 4);
    ctx.fillText('14', x + w / 2, y + h - 6);

    // Indicator pointer arrow showing current pH
    const pointerY = y + (currentPH / 14.0) * h;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(x - 8, pointerY);
    ctx.lineTo(x - 16, pointerY - 6);
    ctx.lineTo(x - 16, pointerY + 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
