/**
 * renderer.js
 * Canvas 2D apparatus rendering for Spectrophotometer & Beer-Lambert Law.
 */

export class SpectroRenderer {
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

    // Soft light-blue canvas background
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
    // Top 52%: Optical Spectrophotometer Bench
    // Bottom 48%: Calibration Curve (A vs c)
    const benchH = h * 0.52;
    const graphH = h * 0.48;

    this.renderOpticalBench(0, 0, w, benchH);
    this.renderCalibrationGraph(0, benchH, w, graphH);
  }

  renderOpticalBench(x, y, w, h) {
    const ctx = this.ctx;
    const solute = this.state.solute;
    const pathCm = this.state.pathLengthCm;
    const transPercent = this.engine.getTransmittancePercent();

    const beamY = y + h * 0.52;

    // 1. Light Source
    const lampX = x + 35;
    const lampW = 65;
    const lampH = 50;
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(lampX, beamY - lampH / 2, lampW, lampH, 6);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9.5px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LAMP (I₀)', lampX + lampW / 2, beamY - 4);
    ctx.font = '8px Inter, sans-serif';
    ctx.fillText('White Light', lampX + lampW / 2, beamY + 10);

    // 2. Monochromator Filter
    const monoX = lampX + lampW + 40;
    const monoW = 20;
    const monoH = 65;
    ctx.fillStyle = '#475569';
    ctx.fillRect(monoX, beamY - monoH / 2, monoW, monoH);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`λ = ${solute.lambdaMaxNm}nm`, monoX + monoW / 2, beamY - monoH / 2 - 8);

    // Incident monochromatic beam (I0 = 100%)
    ctx.strokeStyle = '#10B981'; // Chosen wavelength color
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(monoX + monoW, beamY);
    const cuvetteX = w * 0.48;
    ctx.lineTo(cuvetteX, beamY);
    ctx.stroke();

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 8.5px Inter, sans-serif';
    ctx.fillText('Incident Beam I₀', (monoX + monoW + cuvetteX) / 2, beamY - 8);

    // 3. Cuvette Holder & Solution
    const cuvetteW = Math.max(30, Math.min(80, pathCm * 36));
    const cuvetteH = 80;
    const cx = cuvetteX;
    const cy = beamY - cuvetteH / 2;

    // Quartz cuvette walls
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(cx, cy, cuvetteW, cuvetteH);
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, cuvetteW, cuvetteH);

    // Colored solution inside cuvette (alpha scales with concentration)
    const normConc = Math.min(1.0, this.state.concentrationM / solute.concentrationRange[1]);
    const solAlpha = Math.min(0.92, Math.max(0.15, normConc));

    ctx.fillStyle = solute.solutionColor;
    ctx.globalAlpha = solAlpha;
    ctx.fillRect(cx + 2, cy + 6, cuvetteW - 4, cuvetteH - 8);
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`b = ${pathCm.toFixed(1)} cm`, cx + cuvetteW / 2, cy + cuvetteH + 16);

    // 4. Exiting Attenuated Beam (I)
    const detX = w - 85;
    const beamThick = Math.max(1, (transPercent / 100) * 5);

    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = beamThick;
    ctx.beginPath();
    ctx.moveTo(cx + cuvetteW, beamY);
    ctx.lineTo(detX, beamY);
    ctx.stroke();

    // 5. Photodiode Detector
    const detW = 55;
    const detH = 60;
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(detX, beamY - detH / 2, detW, detH, 6);
    ctx.fill();

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DETECTOR', detX + detW / 2, beamY - 8);
    ctx.fillText(`${transPercent.toFixed(1)}% T`, detX + detW / 2, beamY + 8);
  }

  renderCalibrationGraph(x, y, w, h) {
    const ctx = this.ctx;
    const solute = this.state.solute;
    const curA = this.engine.getAbsorbance();
    const curC = this.state.concentrationM;

    // Card border
    const pad = 14;
    const boxX = x + pad;
    const boxY = y + 4;
    const boxW = w - pad * 2;
    const boxH = h - pad;

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
    ctx.fillText('Beer-Lambert Calibration Line: Absorbance (A) vs Concentration (c)', boxX + 16, boxY + 20);

    // Graph plotting area
    const plotX = boxX + 45;
    const plotY = boxY + 34;
    const plotW = boxW - 80;
    const plotH = boxH - 56;

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
    ctx.fillText('A = 1.5', plotX - 6, plotY + 8);
    ctx.fillText('0', plotX - 6, plotY + plotH);

    ctx.textAlign = 'center';
    ctx.fillText('c = 0', plotX, plotY + plotH + 14);
    ctx.fillText(`c_max (${solute.concentrationRange[1]} ${solute.unit})`, plotX + plotW, plotY + plotH + 14);

    // Linear calibration curve
    const maxA = 1.5;
    const maxC = solute.concentrationRange[1];

    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(plotX, plotY + plotH);

    const endA = solute.molarAbsorptivity * this.state.pathLengthCm * maxC;
    const endPx = plotX + plotW;
    const endPy = plotY + plotH - Math.min(1.0, endA / maxA) * plotH;
    ctx.lineTo(endPx, endPy);
    ctx.stroke();

    // Current operating point dot
    const curPx = plotX + (curC / maxC) * plotW;
    const curPy = plotY + plotH - Math.min(1.0, curA / maxA) * plotH;

    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(curPx, curPy, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`A = ${curA.toFixed(3)}`, curPx, curPy - 8);
  }
}
