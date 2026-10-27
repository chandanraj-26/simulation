/**
 * Canvas 2D Apparatus Renderer for EDTA Titration
 */

export class EdtaRenderer {
  constructor(canvas, engine, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.engine = engine;
    this.state = state;

    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.stirrerAngle = 0;
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

  draw() {
    const { ctx, width, height } = this;
    if (width === 0 || height === 0) return;

    // Academic soft light-blue background
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, width, height);

    this.stirrerAngle += 0.35;

    this.drawBench(width, height);

    const apparatusX = width > 768 ? width * 0.40 : width * 0.5;

    this.drawStand(apparatusX, height);
    this.drawBurette(apparatusX, height);
    this.drawFlaskAndStirrer(apparatusX, height);

    if (width > 600) {
      this.drawComplexationCurve(width * 0.68, height * 0.14, width * 0.28, height * 0.42);
    }
  }

  drawBench(w, h) {
    const { ctx } = this;
    const benchY = h * 0.88;
    ctx.fillStyle = '#D9E8F8';
    ctx.fillRect(0, benchY, w, h - benchY);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(w, benchY);
    ctx.stroke();
  }

  drawStand(cx, h) {
    const { ctx } = this;
    const standBaseX = cx - 90;
    const standBaseY = h * 0.88;

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(standBaseX - 35, standBaseY - 14, 180, 14, 4);
    ctx.fill();

    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(standBaseX, h * 0.06, 10, standBaseY - h * 0.06 - 14);

    ctx.fillStyle = '#475569';
    ctx.fillRect(standBaseX - 5, h * 0.32, 45, 12);
  }

  drawBurette(cx, h) {
    const { ctx } = this;
    const buretteW = 20;
    const buretteTop = h * 0.06;
    const buretteH = h * 0.48;
    const buretteBottom = buretteTop + buretteH;
    const x = cx - buretteW / 2;

    // Colorless EDTA solution in glass tube
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(x, buretteTop, buretteW, buretteH);

    const fractionRemaining = Math.max(0, (50.0 - this.engine.titrantVolumeMl) / 50.0);
    const liquidTop = buretteTop + (1 - fractionRemaining) * (buretteH - 30);
    const liquidH = (buretteBottom - 20) - liquidTop;

    if (liquidH > 0) {
      ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
      ctx.fillRect(x + 2, liquidTop, buretteW - 4, liquidH);

      // Concave water meniscus
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x + buretteW / 2, liquidTop - 2, buretteW / 2 - 2, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
    }

    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(x, buretteTop, buretteW, buretteH - 20);

    // Graduations
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1;
    for (let ml = 0; ml <= 50; ml += 5) {
      const tickY = buretteTop + (ml / 50.0) * (buretteH - 30);
      ctx.beginPath();
      ctx.moveTo(x + buretteW, tickY);
      ctx.lineTo(x + buretteW - 6, tickY);
      ctx.stroke();

      if (ml % 10 === 0) {
        ctx.fillStyle = '#1E293B';
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillText(`${ml}`, x + buretteW + 6, tickY + 3);
      }
    }

    // Stopcock
    const stopcockY = buretteBottom - 18;
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(x - 6, stopcockY, buretteW + 12, 8);

    ctx.fillStyle = this.engine.stopcockOpen ? '#16A34A' : '#DC2626';
    ctx.beginPath();
    ctx.arc(x + buretteW + 8, stopcockY + 4, 6, 0, Math.PI * 2);
    ctx.fill();

    // Delivery Tip & Droplet
    const tipY = buretteBottom + 12;
    if (this.engine.stopcockOpen && fractionRemaining > 0) {
      const dropProgress = (performance.now() % 350) / 350;
      const dropY = tipY + dropProgress * 65;
      ctx.fillStyle = '#BAE6FD';
      ctx.beginPath();
      ctx.ellipse(x + buretteW / 2, dropY, 2.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawFlaskAndStirrer(cx, h) {
    const { ctx } = this;
    const plateY = h * 0.84;
    const plateW = 150;
    const plateH = 22;

    ctx.fillStyle = '#E2E8F0';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - plateW / 2, plateY, plateW, plateH, 6);
    ctx.fill();
    ctx.stroke();

    const flaskBottomY = plateY - 4;
    const flaskH = 110;
    const flaskTopY = flaskBottomY - flaskH;
    const neckW = 28;
    const baseW = 100;

    // Erlenmeyer Flask
    ctx.beginPath();
    ctx.moveTo(cx - neckW / 2, flaskTopY);
    ctx.lineTo(cx - neckW / 2, flaskTopY + 25);
    ctx.lineTo(cx - baseW / 2, flaskBottomY);
    ctx.lineTo(cx + baseW / 2, flaskBottomY);
    ctx.lineTo(cx + neckW / 2, flaskTopY + 25);
    ctx.lineTo(cx + neckW / 2, flaskTopY);
    ctx.closePath();

    ctx.save();
    ctx.clip();

    const flaskMetrics = this.engine.getFlaskColor();
    const liquidTop = flaskBottomY - 60;
    ctx.fillStyle = flaskMetrics.colorRgba;
    ctx.fillRect(cx - baseW / 2, liquidTop, baseW, 60);

    // Stirrer Vortex & Bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, liquidTop, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, flaskBottomY - 6);
    ctx.rotate(this.stirrerAngle);
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-12, -3.5, 24, 7, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();

    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawComplexationCurve(x, y, w, h) {
    const { ctx } = this;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px "Inter", sans-serif';
    ctx.fillText('COMPLEXATION CURVE (pM vs V_EDTA)', x + 12, y + 20);

    const plotX = x + 34;
    const plotY = y + 34;
    const plotW = w - 46;
    const plotH = h - 54;

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.strokeRect(plotX, plotY, plotW, plotH);

    ctx.fillStyle = '#64748B';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('pM 10', plotX - 26, plotY + 10);
    ctx.fillText('pM 2', plotX - 26, plotY + plotH);
    ctx.fillText('0', plotX, plotY + plotH + 12);
    ctx.fillText('V_eq', plotX + (this.engine.equivalenceVolumeMl / 30.0) * plotW - 10, plotY + plotH + 12);
    ctx.fillText('30 mL', plotX + plotW - 25, plotY + plotH + 12);

    // Sigmoid pM curve
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let v = 0; v <= 30; v += 0.5) {
      const px = plotX + (v / 30.0) * plotW;
      const vEq = this.engine.equivalenceVolumeMl;
      // Sigmoid transition from pM 2 to pM 10
      const normPM = 1 / (1 + Math.exp(-(v - vEq) * 1.5));
      const py = plotY + plotH - (normPM * plotH * 0.8 + plotH * 0.1);

      if (v === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
}
