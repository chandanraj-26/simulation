/**
 * renderer.js
 * Canvas 2D visualization of the optical bench, laser beam, slit, and diffraction screen.
 */

export class DiffractionRenderer {
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

    // Background - soft light-blue study environment
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid lines
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
    // Top 48%: Optical Bench schematic (Laser -> Slit -> Divergence)
    // Bottom 52%: Diffraction Screen View & Sinc-squared Intensity Graph
    const benchH = h * 0.44;
    const screenH = h * 0.56;

    this.renderOpticalBench(0, 0, w, benchH);
    this.renderScreenAndProfile(0, benchH, w, screenH);
  }

  renderOpticalBench(x, y, w, h) {
    const ctx = this.ctx;
    const laserActive = this.state.laserActive;
    const laserColor = this.state.laserPreset.colorHex;

    // Bench base rail
    const railY = y + h - 25;
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(x + 20, railY, w - 40, 8);
    ctx.fillStyle = '#64748B';
    ctx.fillRect(x + 20, railY + 8, w - 40, 4);

    // Millimeter marks along rail
    ctx.strokeStyle = '#CBD5E1';
    for (let rx = x + 30; rx < x + w - 30; rx += 15) {
      ctx.beginPath();
      ctx.moveTo(rx, railY);
      ctx.lineTo(rx, railY + 4);
      ctx.stroke();
    }

    // Component Positions (relative along X)
    const laserX = x + 40;
    const slitX = x + w * 0.38;
    const screenX = x + w - 60;
    const beamY = y + h * 0.48;

    // 1. Laser Source
    const laserW = 70;
    const laserH = 50;
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(laserX, beamY - laserH / 2, laserW, laserH, 6);
    ctx.fill();

    // Diode head
    ctx.fillStyle = '#475569';
    ctx.fillRect(laserX + laserW, beamY - 12, 12, 24);

    // Laser Aperture Glow
    if (laserActive) {
      ctx.fillStyle = laserColor;
      ctx.beginPath();
      ctx.arc(laserX + laserW + 12, beamY, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Laser Label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LASER', laserX + laserW / 2, beamY - 6);
    ctx.fillText(`${this.state.wavelengthNm} nm`, laserX + laserW / 2, beamY + 12);

    // 2. Slit Mount
    const slitW = 18;
    const slitMountH = 90;
    ctx.fillStyle = '#334155';
    ctx.fillRect(slitX, beamY - slitMountH / 2, slitW, slitMountH);

    // Slit Aperture Opening (magnified visually for perception)
    const visualGap = Math.max(3, Math.min(14, this.state.slitWidthMm * 40));
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(slitX, beamY - visualGap / 2, slitW, visualGap);

    // Slit Label & Micrometer Top Knob
    ctx.fillStyle = '#64748B';
    ctx.fillRect(slitX + 4, beamY - slitMountH / 2 - 14, 10, 14);
    ctx.fillStyle = '#0F172A';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Slit a = ${this.state.slitWidthMm.toFixed(2)} mm`, slitX + slitW / 2, beamY - slitMountH / 2 - 20);

    // 3. Screen (Right Wall)
    const screenWVal = 16;
    const screenWallH = 120;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.fillRect(screenX, beamY - screenWallH / 2, screenWVal, screenWallH);
    ctx.strokeRect(screenX, beamY - screenWallH / 2, screenWVal, screenWallH);

    ctx.fillStyle = '#0F172A';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`Screen (D = ${this.state.screenDistanceM.toFixed(1)} m)`, screenX + screenWVal / 2, beamY - screenWallH / 2 - 12);

    // 4. Laser Beams
    if (laserActive) {
      // Direct collimated beam from laser to slit
      ctx.strokeStyle = laserColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(laserX + laserW + 12, beamY);
      ctx.lineTo(slitX, beamY);
      ctx.stroke();

      // Soft glow around collimated beam
      ctx.strokeStyle = `${laserColor}44`;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(laserX + laserW + 12, beamY);
      ctx.lineTo(slitX, beamY);
      ctx.stroke();

      // Diffracted Fan beyond the slit
      const y1Mm = this.engine.getFirstMinimumDistanceMm();
      const visualSpread = Math.min(50, y1Mm * 1.8);

      // Central envelope fan
      ctx.fillStyle = `${laserColor}26`;
      ctx.beginPath();
      ctx.moveTo(slitX + slitW, beamY);
      ctx.lineTo(screenX, beamY - visualSpread);
      ctx.lineTo(screenX, beamY + visualSpread);
      ctx.closePath();
      ctx.fill();

      // Outer subsidiary fan
      ctx.fillStyle = `${laserColor}12`;
      ctx.beginPath();
      ctx.moveTo(slitX + slitW, beamY);
      ctx.lineTo(screenX, beamY - visualSpread * 2);
      ctx.lineTo(screenX, beamY + visualSpread * 2);
      ctx.closePath();
      ctx.fill();

      // Ray lines
      ctx.strokeStyle = `${laserColor}99`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      // Central axis
      ctx.beginPath();
      ctx.moveTo(slitX + slitW, beamY);
      ctx.lineTo(screenX, beamY);
      ctx.stroke();
      // Upper 1st minimum ray
      ctx.beginPath();
      ctx.moveTo(slitX + slitW, beamY);
      ctx.lineTo(screenX, beamY - visualSpread);
      ctx.stroke();
      // Lower 1st minimum ray
      ctx.beginPath();
      ctx.moveTo(slitX + slitW, beamY);
      ctx.lineTo(screenX, beamY + visualSpread);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  renderScreenAndProfile(x, y, w, h) {
    const ctx = this.ctx;
    const laserActive = this.state.laserActive;
    const rgb = this.state.laserPreset.rgb || [239, 68, 68];

    // Card border / container for Screen + Plot
    const pad = 16;
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

    // Section title
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Screen Diffraction Fringe Pattern & Relative Irradiance I(y) / I₀', boxX + 16, boxY + 22);

    // Physical scale: total screen span displayed = 50 mm (-25 mm to +25 mm)
    const halfSpanMm = 25;
    const plotX = boxX + 40;
    const plotY = boxY + 36;
    const plotW = boxW - 80;
    const plotH = boxH - 85;

    // 1. Draw Simulated Optical Screen Band (Top strip inside box)
    const bandH = 28;
    const bandY = plotY;
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(plotX, bandY, plotW, bandH);

    if (laserActive) {
      // Draw pixel intensity slices across band
      const imgData = ctx.createImageData(plotW, bandH);
      for (let px = 0; px < plotW; px++) {
        const yMm = -halfSpanMm + (px / (plotW - 1)) * (halfSpanMm * 2);
        const intensity = this.engine.getIntensityAt(yMm);
        // Non-linear gamma for realistic optical glow
        const alpha = Math.min(255, Math.floor(Math.pow(intensity, 0.45) * 255));

        for (let py = 0; py < bandH; py++) {
          const idx = (py * plotW + px) * 4;
          imgData.data[idx] = rgb[0];
          imgData.data[idx + 1] = rgb[1];
          imgData.data[idx + 2] = rgb[2];
          imgData.data[idx + 3] = alpha;
        }
      }
      ctx.putImageData(imgData, plotX, bandY);
    }

    // 2. Draw Mathematical Sinc-squared Intensity Curve
    const graphY = bandY + bandH + 8;
    const graphH = plotH - bandH - 8;

    // Graph axes
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Baseline (I = 0)
    ctx.moveTo(plotX, graphY + graphH);
    ctx.lineTo(plotX + plotW, graphY + graphH);
    // Center axis (y = 0)
    const centerX = plotX + plotW / 2;
    ctx.moveTo(centerX, graphY);
    ctx.lineTo(centerX, graphY + graphH);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#64748B';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('0', centerX, graphY + graphH + 16);
    ctx.fillText(`-${halfSpanMm} mm`, plotX, graphY + graphH + 16);
    ctx.fillText(`+${halfSpanMm} mm`, plotX + plotW, graphY + graphH + 16);

    ctx.textAlign = 'right';
    ctx.fillText('I₀ (1.0)', plotX - 8, graphY + 10);
    ctx.fillText('0.5', plotX - 8, graphY + graphH / 2);
    ctx.fillText('0', plotX - 8, graphY + graphH);

    if (laserActive) {
      // Plot curve
      ctx.strokeStyle = this.state.laserPreset.colorHex;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const numPts = 300;
      for (let i = 0; i < numPts; i++) {
        const px = plotX + (i / (numPts - 1)) * plotW;
        const yMm = -halfSpanMm + (i / (numPts - 1)) * (halfSpanMm * 2);
        const intensity = this.engine.getIntensityAt(yMm);
        const py = graphY + graphH - intensity * (graphH - 12);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Mark 1st minima locations with dashed lines
      const y1Mm = this.engine.getFirstMinimumDistanceMm();
      const pxPlus1 = centerX + (y1Mm / halfSpanMm) * (plotW / 2);
      const pxMinus1 = centerX - (y1Mm / halfSpanMm) * (plotW / 2);

      if (pxPlus1 <= plotX + plotW) {
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);

        ctx.beginPath();
        ctx.moveTo(pxPlus1, bandY);
        ctx.lineTo(pxPlus1, graphY + graphH);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pxMinus1, bandY);
        ctx.lineTo(pxMinus1, graphY + graphH);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#DC2626';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`-y₁ = -${y1Mm.toFixed(2)} mm`, pxMinus1, graphY + 28);
        ctx.fillText(`+y₁ = +${y1Mm.toFixed(2)} mm`, pxPlus1, graphY + 28);
      }

      // 3. Photometer Wand Probe
      const probeYMm = this.state.probeYMm;
      const probePx = centerX + (probeYMm / halfSpanMm) * (plotW / 2);
      const probeIntensity = this.engine.getIntensityAt(probeYMm);

      if (probePx >= plotX && probePx <= plotX + plotW) {
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(probePx, bandY - 4);
        ctx.lineTo(probePx, graphY + graphH + 4);
        ctx.stroke();

        // Target reticle / probe marker
        const markerY = graphY + graphH - probeIntensity * (graphH - 12);
        ctx.fillStyle = '#2563EB';
        ctx.beginPath();
        ctx.arc(probePx, markerY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Tooltip badge
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.roundRect(probePx - 42, bandY - 26, 84, 20, 4);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`y: ${probeYMm >= 0 ? '+' : ''}${probeYMm.toFixed(2)} mm`, probePx, bandY - 17);
        ctx.fillText(`I: ${(probeIntensity * 100).toFixed(1)}%`, probePx, bandY - 9);
      }
    }
  }
}
