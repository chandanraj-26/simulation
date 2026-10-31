/**
 * CanvasRenderer - High-DPI 2D Canvas Renderer for Stomata Lab
 * Complies with the Soft Light-Blue Study Law: #E6F2FF canvas background.
 */

export class CanvasRenderer {
  constructor(canvas, model) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.model = model;

    this.dpr = window.devicePixelRatio || 1;
    this.width = 800;
    this.height = 460;

    this.animTime = 0;

    this.initEvents();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 800;
    this.height = rect.height || 460;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    this.render();
  }

  initEvents() {}

  render() {
    const { ctx, width, height } = this;
    this.animTime += 0.04;

    // Study Environment Soft Light-Blue Background
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, width, height);

    this.drawGrid();

    const state = this.model.getState();

    if (this.model.viewMode === 'cellular') {
      this.drawCellularView(state);
    } else {
      this.drawEpidermalPeelView(state);
    }
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

  /* ==========================================================================
     HIGH-POWER CELLULAR APPARATUS VIEW
     ========================================================================== */
  drawCellularView(state) {
    const { ctx, width, height } = this;
    const cx = width * 0.48;
    const cy = height * 0.50;

    // Aperture bulge: 0 (closed) to 36 px (wide open)
    const aperturePx = state.apertureFraction * 36;

    // 1. Draw Surrounding Subsidiary Epidermal Cells
    this.drawSubsidiaryCells(cx, cy);

    // 2. Draw Left and Right Kidney-Shaped Guard Cells
    this.drawGuardCell(cx, cy, -1, aperturePx, state); // Left
    this.drawGuardCell(cx, cy, 1, aperturePx, state);  // Right

    // 3. Draw Stomatal Pore Aperture Gap
    this.drawStomatalPore(cx, cy, aperturePx, state);

    // 4. Draw Gas Exchange & Transpiration Streams
    if (this.model.showGasArrows && state.isOpen) {
      this.drawGasExchangeArrows(cx, cy, state);
    }

    // 5. Draw Legend & Organelle Labels
    this.drawAnatomyLegend(width * 0.06, height * 0.12);
  }

  drawSubsidiaryCells(cx, cy) {
    const { ctx } = this;
    ctx.save();

    // Wavy epidermal pavement outlines around guard cells
    ctx.fillStyle = '#f0fdf4';
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 2.5;

    // Surrounding boundary rings
    const lobes = [
      { x: cx - 180, y: cy - 90, r: 85 },
      { x: cx + 180, y: cy - 90, r: 85 },
      { x: cx - 180, y: cy + 90, r: 85 },
      { x: cx + 180, y: cy + 90, r: 85 },
      { x: cx, y: cy - 180, r: 90 },
      { x: cx, y: cy + 180, r: 90 }
    ];

    lobes.forEach(lobe => {
      ctx.beginPath();
      ctx.arc(lobe.x, lobe.y, lobe.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  }

  drawGuardCell(cx, cy, side, aperturePx, state) {
    const { ctx } = this;
    ctx.save();

    // Side: -1 for left guard cell, +1 for right guard cell
    const cellW = 85;
    const cellH = 190;
    const centerOffset = (aperturePx / 2 + 10) * side;

    // Outer wall expansion with turgor
    const turgorBulge = state.apertureFraction * 18;

    // Guard Cell Body Gradient
    const grad = ctx.createRadialGradient(cx + centerOffset, cy, 10, cx + centerOffset, cy, 90);
    grad.addColorStop(0, '#86efac');
    grad.addColorStop(0.7, '#4ade80');
    grad.addColorStop(1, '#22c55e');

    ctx.fillStyle = grad;
    ctx.beginPath();

    // Kidney curve (outer thin wall vs inner thick wall)
    const innerX = cx + centerOffset;
    const outerX = cx + centerOffset + (cellW + turgorBulge) * side;

    ctx.moveTo(innerX, cy - cellH / 2);
    // Outer convex curve
    ctx.bezierCurveTo(outerX + 15 * side, cy - cellH * 0.4, outerX + 15 * side, cy + cellH * 0.4, innerX, cy + cellH / 2);
    // Inner concave curve (forming the pore wall)
    ctx.quadraticCurveTo(innerX - (15 - aperturePx * 0.3) * side, cy, innerX, cy - cellH / 2);
    ctx.closePath();
    ctx.fill();

    // Thin Elastic Outer Cell Wall
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Thick Inelastic Inner Cell Wall (facing the pore)
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#166534';
    ctx.beginPath();
    ctx.moveTo(innerX, cy - cellH / 2 + 15);
    ctx.quadraticCurveTo(innerX - (15 - aperturePx * 0.3) * side, cy, innerX, cy + cellH / 2 - 15);
    ctx.stroke();

    // Organelles: Nucleus
    ctx.fillStyle = '#4338ca';
    ctx.beginPath();
    ctx.arc(cx + centerOffset + 40 * side, cy - 25, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#312e81';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Organelles: Chloroplasts (green discs)
    const chloroPositions = [
      { y: -60, x: 30 },
      { y: -45, x: 50 },
      { y: 10, x: 45 },
      { y: 35, x: 35 },
      { y: 55, x: 48 }
    ];

    ctx.fillStyle = '#14532d';
    chloroPositions.forEach(pos => {
      ctx.beginPath();
      ctx.ellipse(cx + centerOffset + pos.x * side, cy + pos.y, 8, 5, 0.4 * side, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Potassium K+ Ion Dots (animated diffusion dots)
    const numK = Math.round(state.kConc / 40);
    ctx.fillStyle = '#9333ea';
    for (let k = 0; k < numK; k++) {
      const kx = cx + centerOffset + (20 + (k * 13) % 45) * side;
      const ky = cy - 70 + ((k * 29) % 140) + Math.sin(this.animTime * 2 + k) * 3;
      ctx.beginPath();
      ctx.arc(kx, ky, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawStomatalPore(cx, cy, aperturePx, state) {
    const { ctx } = this;
    ctx.save();

    if (aperturePx < 2) {
      // Closed tight seam line
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 80);
      ctx.lineTo(cx, cy + 80);
      ctx.stroke();
    } else {
      // Open Aperture Elliptical Hole
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, aperturePx / 2, 80, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }

  drawGasExchangeArrows(cx, cy, state) {
    const { ctx } = this;
    ctx.save();

    // H2O Transpiration Vapor (cyan rising arrows)
    const vaporOffset = (this.animTime * 40) % 70;
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;

    for (let i = 0; i < 3; i++) {
      const vx = cx - 10 + i * 10;
      const vy = cy - 40 - vaporOffset - i * 15;

      ctx.beginPath();
      ctx.arc(vx, vy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Label tags
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0284c7';
    ctx.fillText('↑ H₂O Vapor', cx + 25, cy - 70);

    ctx.fillStyle = '#16a34a';
    ctx.fillText('↓ CO₂ Influx', cx + 25, cy + 80);

    ctx.restore();
  }

  drawAnatomyLegend(x, y) {
    const { ctx } = this;
    ctx.save();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, 160, 115, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('STOMATAL APPARATUS', x + 10, y + 18);

    const items = [
      { label: 'Guard Cell (Reniform)', color: '#22c55e' },
      { label: 'Thick Inner Wall', color: '#166534' },
      { label: 'Nucleus', color: '#4338ca' },
      { label: 'Chloroplasts', color: '#14532d' },
      { label: 'K⁺ Potassium Ions', color: '#9333ea' }
    ];

    items.forEach((item, idx) => {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(x + 15, y + 36 + idx * 16, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#334155';
      ctx.fillText(item.label, x + 26, y + 39 + idx * 16);
    });

    ctx.restore();
  }

  /* ==========================================================================
     EPIDERMAL PEEL MICROSCOPE VIEW
     ========================================================================== */
  drawEpidermalPeelView(state) {
    const { ctx, width, height } = this;
    const cx = width * 0.48;
    const cy = height * 0.50;
    const scopeR = 190;

    ctx.save();

    // Circular Microscope Viewport Clip
    ctx.beginPath();
    ctx.arc(cx, cy, scopeR, 0, Math.PI * 2);
    ctx.fillStyle = '#f0fdf4';
    ctx.fill();
    ctx.save();
    ctx.clip();

    // Pavement epidermal cells grid
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 2;
    for (let gx = cx - 220; gx <= cx + 220; gx += 50) {
      for (let gy = cy - 220; gy <= cy + 220; gy += 45) {
        ctx.beginPath();
        ctx.roundRect(gx, gy, 46, 40, 10);
        ctx.stroke();
      }
    }

    // Multiple Stomata Scattered in field of view
    const stomataCoords = [
      { x: cx - 80, y: cy - 70 },
      { x: cx + 70, y: cy - 60 },
      { x: cx - 40, y: cy + 80 },
      { x: cx + 90, y: cy + 60 },
      { x: cx - 120, y: cy + 30 },
      { x: cx + 110, y: cy - 120 },
      { x: cx - 30, y: cy - 130 }
    ];

    stomataCoords.forEach(c => {
      // Mini guard cells
      ctx.fillStyle = '#4ade80';
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.ellipse(c.x - 6, c.y, 6, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(c.x + 6, c.y, 6, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pore aperture
      if (state.isOpen) {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, 2.5, 9, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = '#166534';
        ctx.beginPath();
        ctx.moveTo(c.x, c.y - 8);
        ctx.lineTo(c.x, c.y + 8);
        ctx.stroke();
      }
    });

    ctx.restore(); // remove clip

    // Microscope Brass Objective Ring
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, scopeR + 7, 0, Math.PI * 2);
    ctx.stroke();

    // Metric Field Bar & Stomatal Index HUD
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText('EPIDERMAL PEEL (100× MICROSCOPE)', cx, cy - scopeR - 16);

    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#15803d';
    ctx.fillText('Stomatal Index (SI) = [S / (E + S)] × 100% ≈ 22.4%', cx, cy + scopeR + 24);

    ctx.restore();
  }
}
