/**
 * renderer.js
 * Canvas 2D apparatus rendering for Reaction Kinetics: Flask on Balance & V(t) curve.
 */

export class ReactionRenderer {
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

    // Split layout:
    // Left 44%: Flask on Digital Balance
    // Right 56%: Realtime V(t) Kinetics Graph
    const leftW = w * 0.44;
    const rightW = w * 0.56;

    this.renderFlaskAndBalance(0, 0, leftW, h);
    this.renderKineticsPlot(leftW, 0, rightW, h);
  }

  renderFlaskAndBalance(x, y, w, h) {
    const ctx = this.ctx;
    const cx = x + w / 2;
    const benchY = h * 0.82;

    // Digital Balance Base
    const balW = 120;
    const balH = 40;
    const balX = cx - balW / 2;
    const balY = benchY - balH;

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(balX, balY, balW, balH, 6);
    ctx.fill();

    // Balance Pan
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(balX + 10, balY - 6, balW - 20, 6);

    // Digital LED Mass Display
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(balX + 18, balY + 12, balW - 36, 18);

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.engine.getCurrentBalanceMass().toFixed(2)} g`, cx, balY + 25);

    // Conical Flask on pan
    const flaskW = 86;
    const flaskH = 105;
    const neckW = 26;
    const neckH = 34;
    const flaskY = balY - 6 - flaskH;

    // Flask outline
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.85)';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(cx - neckW / 2, flaskY);
    ctx.lineTo(cx - neckW / 2, flaskY + neckH);
    ctx.lineTo(cx - flaskW / 2, flaskY + flaskH);
    ctx.lineTo(cx + flaskW / 2, flaskY + flaskH);
    ctx.lineTo(cx + neckW / 2, flaskY + neckH);
    ctx.lineTo(cx + neckW / 2, flaskY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Loose cotton wool plug at mouth of flask
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.ellipse(cx, flaskY + 4, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Cotton Wool', cx, flaskY - 8);

    // Acid liquid inside flask
    const liquidH = 38;
    const ly = flaskY + flaskH - liquidH;
    ctx.fillStyle = 'rgba(219, 234, 254, 0.65)';
    ctx.beginPath();
    ctx.moveTo(cx - flaskW / 2 + 6, flaskY + flaskH - 2);
    ctx.lineTo(cx - flaskW / 2 + 14, ly);
    ctx.lineTo(cx + flaskW / 2 - 14, ly);
    ctx.lineTo(cx + flaskW / 2 - 6, flaskY + flaskH - 2);
    ctx.closePath();
    ctx.fill();

    // Marble chips or powder at bottom
    const isPowder = this.state.particleSize.id === 'powder';
    if (isPowder) {
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(cx - 30, flaskY + flaskH - 8, 60, 6);
    } else {
      ctx.fillStyle = '#CBD5E1';
      for (let i = 0; i < 7; i++) {
        const mx = cx - 26 + i * 8;
        const my = flaskY + flaskH - 8 - (i % 2) * 3;
        ctx.fillRect(mx, my, 7, 6);
      }
    }

    // Effervescence bubbling if reaction is progressing
    const rate = this.engine.getInstantaneousRate();
    if (rate > 0.05) {
      const bubbleCount = Math.min(22, Math.floor(rate * 14));
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < bubbleCount; i++) {
        const bx = cx - 20 + ((i * 7 + Date.now() / 60) % 40);
        const by = ly + 4 + ((i * 5) % (liquidH - 8));
        ctx.beginPath();
        ctx.arc(bx, by, 1.5 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  renderKineticsPlot(x, y, w, h) {
    const ctx = this.ctx;
    const pad = 14;
    const boxX = x + pad;
    const boxY = y + 14;
    const boxW = w - pad * 2;
    const boxH = h - pad * 2;

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Real-Time Kinetics: Volume of CO₂ Evolved vs Time (t)', boxX + 16, boxY + 22);

    const plotX = boxX + 45;
    const plotY = boxY + 38;
    const plotW = boxW - 75;
    const plotH = boxH - 65;

    // Axes
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plotX, plotY);
    ctx.lineTo(plotX, plotY + plotH);
    ctx.lineTo(plotX + plotW, plotY + plotH);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#64748B';
    ctx.font = '8.5px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('60 mL', plotX - 6, plotY + 8);
    ctx.fillText('30 mL', plotX - 6, plotY + plotH / 2);
    ctx.fillText('0', plotX - 6, plotY + plotH);

    ctx.textAlign = 'center';
    ctx.fillText('0s', plotX, plotY + plotH + 14);
    ctx.fillText('60s', plotX + plotW / 2, plotY + plotH + 14);
    ctx.fillText('120s', plotX + plotW, plotY + plotH + 14);

    // Plot full theoretical curve
    const maxT = 120.0;
    const maxV = 60.0;

    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const numPts = 100;
    for (let i = 0; i < numPts; i++) {
      const t = (i / (numPts - 1)) * maxT;
      const v = this.engine.getVolumeAt(t);
      const px = plotX + (t / maxT) * plotW;
      const py = plotY + plotH - (v / maxV) * plotH;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Current time position point
    const curT = this.state.timeSec;
    const curV = this.engine.getCurrentVolume();
    const curPx = plotX + (curT / maxT) * plotW;
    const curPy = plotY + plotH - (curV / maxV) * plotH;

    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(curPx, curPy, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`V = ${curV.toFixed(1)} mL`, curPx, curPy - 8);
  }
}
