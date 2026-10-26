/**
 * Canvas 2D Laboratory Apparatus & Curve Renderer for Redox Titration
 */

export class RedoxRenderer {
  constructor(canvas, engine, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.engine = engine;
    this.state = state;

    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    // Stirrer animation angle
    this.stirrerAngle = 0;
    this.bubbleOffset = 0;
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

    // Soft light-blue academic environment
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, width, height);

    this.stirrerAngle += (this.engine.stirrerRpm / 60) * 0.3;
    this.bubbleOffset += 0.05;

    // Benchtop
    this.drawBench(width, height);

    // Apparatus coordinates
    const apparatusX = width > 768 ? width * 0.38 : width * 0.5;

    // Draw Stand, Burette, Stopcock, Drops, Flask, Stirrer
    this.drawRetortStand(apparatusX, height);
    this.drawBurette(apparatusX, height);
    this.drawFlaskAndHotplate(apparatusX, height);

    // Draw Real-time Potentiometric Curve graph inset
    if (width > 600 && this.state.showPotentiometricCurve) {
      this.drawTitrationCurve(width * 0.68, height * 0.12, width * 0.28, height * 0.42);
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

  drawRetortStand(cx, h) {
    const { ctx } = this;
    const standBaseX = cx - 90;
    const standBaseY = h * 0.88;

    // Cast iron heavy base
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(standBaseX - 35, standBaseY - 14, 180, 14, 4);
    ctx.fill();

    // Steel vertical upright rod
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(standBaseX, h * 0.06, 10, standBaseY - h * 0.06 - 14);

    // Cast iron clamp
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

    // Glass tube shadow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(x, buretteTop, buretteW, buretteH);

    // Dark KMnO4 Liquid column
    const fractionRemaining = Math.max(0, (50.0 - this.engine.titrantVolumeMl) / 50.0);
    const liquidTop = buretteTop + (1 - fractionRemaining) * (buretteH - 30);
    const liquidH = (buretteBottom - 20) - liquidTop;

    if (liquidH > 0) {
      ctx.fillStyle = '#4a0e4e'; // Deep imperial KMnO4 purple
      ctx.fillRect(x + 2, liquidTop, buretteW - 4, liquidH);

      // Dark upper meniscus line
      ctx.fillStyle = '#2e0832';
      ctx.fillRect(x + 1, liquidTop, buretteW - 2, 2.5);
    }

    // Glass tube outline
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(x, buretteTop, buretteW, buretteH - 20);

    // Graduated tick marks
    ctx.strokeStyle = '#CBD5E1';
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

    // Stopcock Valve
    const stopcockY = buretteBottom - 18;
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(x - 6, stopcockY, buretteW + 12, 8);

    // Rotating Teflon handle
    ctx.fillStyle = this.engine.stopcockOpen ? '#16A34A' : '#DC2626';
    ctx.beginPath();
    ctx.arc(x + buretteW + 8, stopcockY + 4, 6, 0, Math.PI * 2);
    ctx.fill();

    // Delivery Tip & Dripping Droplet
    const tipY = buretteBottom + 12;
    ctx.strokeStyle = '#64748B';
    ctx.beginPath();
    ctx.moveTo(x + buretteW / 2 - 3, buretteBottom - 10);
    ctx.lineTo(x + buretteW / 2 - 1.5, tipY);
    ctx.lineTo(x + buretteW / 2 + 1.5, tipY);
    ctx.lineTo(x + buretteW / 2 + 3, buretteBottom - 10);
    ctx.stroke();

    // Droplet falling when open
    if (this.engine.stopcockOpen && fractionRemaining > 0) {
      const dropProgress = (performance.now() % 350) / 350;
      const dropY = tipY + dropProgress * 65;
      ctx.fillStyle = '#4a0e4e';
      ctx.beginPath();
      ctx.ellipse(x + buretteW / 2, dropY, 2.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawFlaskAndHotplate(cx, h) {
    const { ctx } = this;
    const hotplateY = h * 0.84;
    const hotplateW = 150;
    const hotplateH = 22;

    // Magnetic Stirrer Hotplate body
    ctx.fillStyle = '#E2E8F0';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - hotplateW / 2, hotplateY, hotplateW, hotplateH, 6);
    ctx.fill();
    ctx.stroke();

    // Ceramic top plate (heating surface glow if heater on)
    ctx.fillStyle = this.engine.isHeaterOn ? 'rgba(239, 68, 68, 0.25)' : '#F8FAFC';
    ctx.fillRect(cx - hotplateW / 2 + 4, hotplateY - 4, hotplateW - 8, 4);

    // Rotary speed dial & temperature light
    ctx.fillStyle = this.engine.isHeaterOn ? '#EF4444' : '#64748B';
    ctx.beginPath();
    ctx.arc(cx - hotplateW / 2 + 20, hotplateY + 11, 4, 0, Math.PI * 2);
    ctx.fill();

    // Conical Flask Dimensions
    const flaskBottomY = hotplateY - 4;
    const flaskH = 110;
    const flaskTopY = flaskBottomY - flaskH;
    const neckW = 28;
    const baseW = 100;

    // Erlenmeyer Flask Outline Path
    ctx.beginPath();
    ctx.moveTo(cx - neckW / 2, flaskTopY);
    ctx.lineTo(cx - neckW / 2, flaskTopY + 25);
    ctx.lineTo(cx - baseW / 2, flaskBottomY);
    ctx.lineTo(cx + baseW / 2, flaskBottomY);
    ctx.lineTo(cx + neckW / 2, flaskTopY + 25);
    ctx.lineTo(cx + neckW / 2, flaskTopY);
    ctx.closePath();

    // Liquid in flask with dynamic appearance
    const flaskMetrics = this.engine.getFlaskAppearance();
    ctx.save();
    ctx.clip();

    // Liquid fills bottom 55% of flask
    const liquidTop = flaskBottomY - 60;
    ctx.fillStyle = flaskMetrics.colorRgba;
    ctx.fillRect(cx - baseW / 2, liquidTop, baseW, 60);

    // Magnetic Stirrer Vortex
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, liquidTop, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotating Teflon Magnetic Bar
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

    // Glass walls outer stroke
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Thermometer in flask
    this.drawThermometer(cx + 22, flaskTopY - 20, flaskBottomY - 10);
  }

  drawThermometer(x, topY, bottomY) {
    const { ctx } = this;
    const w = 6;
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, topY, w, bottomY - topY, 3);
    ctx.fill();
    ctx.stroke();

    // Red alcohol mercury column
    const fraction = (this.engine.temperatureC - 20) / 80.0;
    const colH = (bottomY - topY - 8) * fraction;
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x + 1.5, bottomY - colH - 6, w - 3, colH);

    // Bulb
    ctx.beginPath();
    ctx.arc(x + w / 2, bottomY - 3, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawTitrationCurve(x, y, w, h) {
    const { ctx } = this;

    // Card background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    // Header
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px "Inter", sans-serif';
    ctx.fillText('POTENTIOMETRIC CURVE (E_cell vs V)', x + 12, y + 20);

    // Graph plotting area
    const plotX = x + 34;
    const plotY = y + 34;
    const plotW = w - 46;
    const plotH = h - 54;

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.strokeRect(plotX, plotY, plotW, plotH);

    // Axis labels
    ctx.fillStyle = '#64748B';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('1.6V', plotX - 26, plotY + 10);
    ctx.fillText('0.6V', plotX - 26, plotY + plotH);
    ctx.fillText('0', plotX, plotY + plotH + 12);
    ctx.fillText('V_eq', plotX + (this.engine.equivalenceVolumeMl / 30.0) * plotW - 10, plotY + plotH + 12);
    ctx.fillText('30 mL', plotX + plotW - 25, plotY + plotH + 12);

    // Vertical dashed equivalence line
    const eqX = plotX + (this.engine.equivalenceVolumeMl / 30.0) * plotW;
    ctx.strokeStyle = '#F43F5E';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(eqX, plotY);
    ctx.lineTo(eqX, plotY + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot points
    const history = this.engine.titrationHistory;
    if (history.length > 1) {
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 2.2;
      ctx.beginPath();

      history.forEach((pt, idx) => {
        const px = plotX + (Math.min(30.0, pt.v) / 30.0) * plotW;
        const normE = (pt.eCell - 0.6) / (1.6 - 0.6);
        const py = plotY + plotH - (normE * plotH);

        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Current operating point dot
      const currentV = this.engine.titrantVolumeMl;
      const currentE = this.engine.calculateCellPotential(currentV);
      const curX = plotX + (Math.min(30.0, currentV) / 30.0) * plotW;
      const curY = plotY + plotH - (((currentE - 0.6) / 1.0) * plotH);

      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(curX, curY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
