/**
 * Canvas 2D Apparatus & Thermogram Renderer for Calorimetry
 */

export class CalorimetryRenderer {
  constructor(canvas, engine, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.engine = engine;
    this.state = state;

    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.stirrerYOffset = 0;
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

    this.stirrerYOffset = Math.sin(performance.now() * 0.005) * 8;

    this.drawBench(width, height);

    const cx = width > 768 ? width * 0.38 : width * 0.5;
    const calW = 160;
    const calH = 150;
    const calY = height * 0.50;

    this.drawCalorimeter(cx, calY, calW, calH);

    if (width > 600) {
      this.drawThermogram(width * 0.66, height * 0.16, width * 0.30, height * 0.45);
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

  drawCalorimeter(cx, y, w, h) {
    const { ctx } = this;
    const x = cx - w / 2;

    // Outer double-wall Styrofoam insulation
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - 8, y - 4, w + 16, h + 8, [4, 4, 18, 18]);
    ctx.fill();
    ctx.stroke();

    // Inner Styrofoam cup
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, [2, 2, 14, 14]);
    ctx.fill();
    ctx.stroke();

    // Solution inside calorimeter (fills 65% when mixed)
    const solH = this.engine.isMixed ? h * 0.65 : h * 0.35;
    const solTop = y + h - solH;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x + 2, y, w - 4, h - 2, [0, 0, 12, 12]);
    ctx.clip();

    ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.fillRect(x, solTop, w, solH);

    ctx.restore();

    // Calorimeter Insulating Cork Lid
    ctx.fillStyle = '#D4A373';
    ctx.strokeStyle = '#8C5628';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - 14, y - 16, w + 28, 16, 4);
    ctx.fill();
    ctx.stroke();

    // Wire Stirrer
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    const stirrerX = cx - 28;
    ctx.beginPath();
    ctx.moveTo(stirrerX, y - 55 + this.stirrerYOffset);
    ctx.lineTo(stirrerX, y + h - 25 + this.stirrerYOffset);
    // Loop
    ctx.arc(stirrerX + 10, y + h - 25 + this.stirrerYOffset, 10, Math.PI, 0, true);
    ctx.stroke();

    // Thermometer Probe
    const thermX = cx + 24;
    this.drawThermometer(thermX, y - 85, y + h - 20);
  }

  drawThermometer(x, topY, bottomY) {
    const { ctx } = this;
    const w = 8;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, topY, w, bottomY - topY, 4);
    ctx.fill();
    ctx.stroke();

    // Red alcohol mercury column
    const fraction = Math.min(1.0, Math.max(0.0, (this.engine.currentTempC - 20.0) / 20.0));
    const colH = (bottomY - topY - 12) * fraction;
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x - w / 2 + 2, bottomY - colH - 6, w - 4, colH);

    // Bulb
    ctx.beginPath();
    ctx.arc(x, bottomY - 4, 6, 0, Math.PI * 2);
    ctx.fill();

    // Live Temperature Tag
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText(`${this.engine.currentTempC.toFixed(1)}°C`, x + 14, topY + 22);
  }

  drawThermogram(x, y, w, h) {
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
    ctx.fillText('THERMOGRAM (T vs Time)', x + 12, y + 20);

    const plotX = x + 34;
    const plotY = y + 34;
    const plotW = w - 46;
    const plotH = h - 54;

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.strokeRect(plotX, plotY, plotW, plotH);

    ctx.fillStyle = '#64748B';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('35°C', plotX - 26, plotY + 10);
    ctx.fillText('25°C', plotX - 26, plotY + plotH);
    ctx.fillText('0s', plotX, plotY + plotH + 12);
    ctx.fillText('30s', plotX + plotW - 20, plotY + plotH + 12);

    const history = this.engine.thermogramHistory;
    if (history.length > 1) {
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.2;
      ctx.beginPath();

      history.forEach((pt, idx) => {
        const px = plotX + (Math.min(30.0, pt.t) / 30.0) * plotW;
        const normT = (pt.temp - 25.0) / 10.0;
        const py = plotY + plotH - (normT * plotH);

        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }
  }
}
