/**
 * renderer.js
 * Canvas 2D apparatus rendering for NCERT 4-tube rusting of iron experiment.
 */

import { TUBES_CONFIG } from './rusting_data.js';

export class RustingRenderer {
  constructor(canvas, engine, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.engine = engine;
    this.state = state;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  render() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const ctx = this.ctx;

    // Academic soft light-blue canvas background
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, w, h);

    // Subtle background grid
    ctx.strokeStyle = '#D5E6F7';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Wooden test tube rack base
    const rackY = h * 0.76;
    const rackW = w * 0.90;
    const rackX = (w - rackW) / 2;

    // Rack back support & base
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(rackX, rackY, rackW, 14);
    ctx.fillStyle = '#64748B';
    ctx.fillRect(rackX, rackY + 14, rackW, 8);

    // 4 Test Tubes
    const numTubes = TUBES_CONFIG.length;
    const spacing = rackW / (numTubes + 1);

    TUBES_CONFIG.forEach((tube, idx) => {
      const tubeX = rackX + spacing * (idx + 1);
      const tubeY = h * 0.16;
      const tubeW = 46;
      const tubeH = rackY - tubeY + 6;

      this.renderTestTube(tubeX, tubeY, tubeW, tubeH, tube);
    });
  }

  renderTestTube(x, y, w, h, config) {
    const ctx = this.ctx;
    const corrosion = this.engine.getTubeCorrosionPercent(config);
    const protection = this.state.protectionMethod;

    // Tube center X
    const cx = x;
    const r = w / 2;

    // 1. Liquids inside tube
    if (config.hasWater) {
      const liquidH = h * config.liquidHeightRatio;
      const liquidY = y + h - liquidH;

      ctx.fillStyle = config.liquidColor;
      ctx.beginPath();
      ctx.moveTo(cx - r + 3, liquidY);
      ctx.lineTo(cx + r - 3, liquidY);
      ctx.lineTo(cx + r - 3, y + h - r);
      ctx.arc(cx, y + h - r, r - 3, 0, Math.PI);
      ctx.lineTo(cx - r + 3, liquidY);
      ctx.closePath();
      ctx.fill();

      // Oil layer for Tube B
      if (config.hasOilSeal) {
        const oilH = 18;
        ctx.fillStyle = 'rgba(245, 158, 11, 0.75)'; // Amber oil layer
        ctx.fillRect(cx - r + 3, liquidY, w - 6, oilH);

        ctx.fillStyle = '#78350F';
        ctx.font = 'bold 8px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Oil Seal', cx, liquidY + 12);
      }

      // Rust precipitate flakes in liquid at bottom if corroded
      if (corrosion > 5) {
        const flakeCount = Math.floor(corrosion / 3);
        ctx.fillStyle = '#B45309';
        for (let i = 0; i < flakeCount; i++) {
          const fx = cx - r + 6 + ((i * 7) % (w - 12));
          const fy = y + h - 14 - ((i * 4) % 18);
          ctx.beginPath();
          ctx.arc(fx, fy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Desiccant pellets in Tube C
    if (config.hasDesiccant) {
      ctx.fillStyle = '#E2E8F0';
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const px = cx - r + 8 + ((i * 8) % (w - 16));
        const py = y + h - 10 - Math.floor(i / 3) * 6;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CaCl₂ pellets', cx, y + h - 30);
    }

    // 2. Iron Nail inside tube
    const nailX = cx;
    const nailY1 = y + h * 0.32;
    const nailY2 = y + h - 12;
    const nailW = 7;

    // Nail body (tilted slightly)
    ctx.save();
    ctx.translate(nailX, (nailY1 + nailY2) / 2);
    ctx.rotate(-0.06);

    const nailLen = nailY2 - nailY1;
    // Base nail color
    let nailColor = '#64748B'; // Steel grey
    if (protection === 'galvanized') nailColor = '#94A3B8'; // Shiny zinc
    else if (protection === 'grease') nailColor = '#475569';

    ctx.fillStyle = nailColor;
    ctx.fillRect(-nailW / 2, -nailLen / 2, nailW, nailLen);

    // Nail head
    ctx.fillStyle = '#334155';
    ctx.fillRect(-nailW - 2, -nailLen / 2 - 3, nailW * 2 + 4, 4);

    // Rust coating overlay on nail surface
    if (corrosion > 0) {
      const rustAlpha = Math.min(0.95, corrosion / 85.0);
      ctx.fillStyle = `rgba(180, 83, 9, ${rustAlpha})`; // Reddish-brown Fe2O3
      ctx.fillRect(-nailW / 2 - 1, -nailLen / 2 + 6, nailW + 2, nailLen - 10);
    }

    // Coiled Mg ribbon if selected
    if (protection === 'mg_ribbon') {
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2.5;
      for (let my = -nailLen / 2 + 12; my < nailLen / 2 - 8; my += 14) {
        ctx.beginPath();
        ctx.moveTo(-nailW, my);
        ctx.lineTo(nailW, my + 6);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 3. Test Tube Glass Wall & Rim
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    // Left lip
    ctx.moveTo(cx - r - 4, y);
    ctx.lineTo(cx - r, y);
    ctx.lineTo(cx - r, y + h - r);
    // Hemispherical rounded bottom
    ctx.arc(cx, y + h - r, r, Math.PI, 0, true);
    ctx.lineTo(cx + r, y);
    ctx.lineTo(cx + r + 4, y);
    ctx.stroke();

    // Glass shine reflection highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - r + 4, y + 15);
    ctx.lineTo(cx - r + 4, y + h - r);
    ctx.stroke();

    // Rubber stopper for Tube B and Tube C
    if (config.hasOilSeal || config.hasDesiccant) {
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.moveTo(cx - r + 2, y + 12);
      ctx.lineTo(cx - r - 2, y - 6);
      ctx.lineTo(cx + r + 2, y - 6);
      ctx.lineTo(cx + r - 2, y + 12);
      ctx.closePath();
      ctx.fill();
    }

    // 4. Tube Header Label & Condition Badge
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(config.label.split(':')[0], cx, y - 18);

    // Rust state badge
    if (corrosion > 1) {
      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 9.5px Inter, sans-serif';
      ctx.fillText(`RUSTED (${corrosion.toFixed(0)}%)`, cx, y + h + 22);
    } else {
      ctx.fillStyle = '#16A34A';
      ctx.font = 'bold 9.5px Inter, sans-serif';
      ctx.fillText('NO RUST (0%)', cx, y + h + 22);
    }
  }
}
