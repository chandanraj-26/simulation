/**
 * Rutherford Alpha Scattering — Canvas 2D Apparatus Renderer
 * Renders Circular ZnS Detector Ring, Lead Collimator Box, Gold Foil,
 * Movable Scintillation Microscope, Microscopic Nuclear Coulomb Repulsion,
 * Thomson Plum Pudding Model, and Real-Time Angular Distribution Histogram.
 */

class RutherfordRenderer {
  constructor(canvas, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = state;
    this.dpr = window.devicePixelRatio || 1;
    this.width = 800;
    this.height = 540;

    this.resize();
  }

  resize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 800;
    this.height = rect.height || 540;

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Soft laboratory background
    this.drawLabEnvironment(ctx);

    // 2. Render Macro Bench or Micro Nuclear View
    if (this.state.viewMode === 'macro_bench') {
      this.drawMacroBenchView(ctx);
    } else {
      this.drawMicroNuclearView(ctx);
    }

    // 3. Render In-Canvas Angular Distribution Histogram
    this.drawHistogramHUD(ctx);
  }

  drawLabEnvironment(ctx) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#F4F9FF');
    bgGrad.addColorStop(1, '#E6F2FF');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  drawMacroBenchView(ctx) {
    const cx = this.width * 0.44;
    const cy = this.height * 0.50;
    const ringRadius = Math.min(220, this.width * 0.28);

    // 1. Circular Zinc Sulfide (ZnS) Detector Screen Ring
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, 0.25, Math.PI * 2 - 0.25);
    ctx.stroke();

    // Fluorescent inner phosphor layer (ZnS)
    ctx.strokeStyle = '#4ADE80';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius - 5, 0.25, Math.PI * 2 - 0.25);
    ctx.stroke();

    // Angle Graduation Ticks around the ring
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1E293B';

    const angles = [0, 30, 60, 90, 120, 150, 180, -150, -120, -90, -60, -30];
    for (const deg of angles) {
      const rad = (deg * Math.PI) / 180.0;
      const tx = cx + Math.cos(rad) * (ringRadius + 16);
      const ty = cy + Math.sin(rad) * (ringRadius + 16);
      ctx.fillText(`${deg}°`, tx, ty);

      // Tick mark
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(rad) * (ringRadius - 8), cy + Math.sin(rad) * (ringRadius - 8));
      ctx.lineTo(cx + Math.cos(rad) * (ringRadius + 4), cy + Math.sin(rad) * (ringRadius + 4));
      ctx.stroke();
    }

    // 2. Lead Collimator Box & Alpha Radioactive Source (Left)
    const boxX = cx - ringRadius * 1.05;
    const boxY = cy;
    const boxW = 54;
    const boxH = 46;

    // Heavy lead block
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(boxX - boxW, boxY - boxH / 2, boxW, boxH, 4);
    ctx.fill();
    ctx.stroke();

    // Collimator exit nozzle / pinhole
    ctx.fillStyle = '#64748B';
    ctx.fillRect(boxX, boxY - 4, 14, 8);

    // Radioactive source inside
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(boxX - boxW / 2, boxY, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '700 8px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#F8FAFC';
    ctx.textAlign = 'center';
    ctx.fillText('Po-210', boxX - boxW / 2, boxY + 2);
    ctx.fillText('LEAD BOX', boxX - boxW / 2, boxY - 14);

    // 3. Central Gold Foil Target (Center)
    ctx.save();
    // Stand base
    ctx.fillStyle = '#B45309';
    ctx.fillRect(cx - 3, cy - 35, 6, 70);

    // Gleaming gold leaf strip
    const goldGrad = ctx.createLinearGradient(cx - 3, cy - 30, cx + 3, cy + 30);
    goldGrad.addColorStop(0, '#FBBF24');
    goldGrad.addColorStop(0.5, '#F59E0B');
    goldGrad.addColorStop(1, '#D97706');

    ctx.fillStyle = goldGrad;
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 1;
    ctx.fillRect(cx - 2, cy - 30, 4, 60);
    ctx.strokeRect(cx - 2, cy - 30, 4, 60);

    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#B45309';
    ctx.textAlign = 'center';
    ctx.fillText('Gold Foil (100 nm)', cx, cy - 42);
    ctx.restore();

    // 4. Movable Optical Microscope / ZnS Detector Unit
    const detRad = (this.state.detectorAngleDeg * Math.PI) / 180.0;
    const detX = cx + Math.cos(detRad) * ringRadius;
    const detY = cy + Math.sin(detRad) * ringRadius;

    ctx.save();
    ctx.translate(detX, detY);
    ctx.rotate(detRad + Math.PI); // Point eyepiece inward

    // Microscope body
    ctx.fillStyle = '#D97706'; // Polished brass
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(0, -9, 36, 18, 3);
    ctx.fill();
    ctx.stroke();

    // Objective lens cone
    ctx.fillStyle = '#92400E';
    ctx.beginPath();
    ctx.moveTo(36, -6);
    ctx.lineTo(46, -3);
    ctx.lineTo(46, 3);
    ctx.lineTo(36, 6);
    ctx.closePath();
    ctx.fill();

    // Eyepiece
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-8, -6, 8, 12);

    ctx.restore();

    // 5. In-flight Alpha Particles
    for (const a of this.state.alphas) {
      const px = cx + a.x * (ringRadius / 0.42);
      const py = cy + a.y * (ringRadius / 0.42);

      // Glowing blue alpha projectile
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0284C7';
      ctx.fill();

      // Specular core
      ctx.beginPath();
      ctx.arc(px, py, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    }

    // 6. Phosphorescent Scintillation Flashes on ZnS Screen
    for (const s of this.state.scintillations) {
      const sx = cx + s.x * (ringRadius / 0.42);
      const sy = cy + s.y * (ringRadius / 0.42);

      const grad = ctx.createRadialGradient(sx, sy, 1, sx, sy, 14);
      grad.addColorStop(0, `rgba(255, 255, 255, ${s.alpha})`);
      grad.addColorStop(0.3, `rgba(74, 222, 128, ${s.alpha * 0.9})`);
      grad.addColorStop(0.8, `rgba(34, 197, 94, ${s.alpha * 0.4})`);
      grad.addColorStop(1, 'rgba(34, 197, 94, 0.0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, 14, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawMicroNuclearView(ctx) {
    const cx = this.width * 0.44;
    const cy = this.height * 0.50;
    const viewSize = Math.min(260, this.width * 0.32);

    // Zoom container boundary
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(cx, cy, viewSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (this.state.model === 'rutherford') {
      // Rutherford Nuclear Model:
      // Atomic outer boundary (mostly empty space, 10^-10 m)
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, viewSize * 0.88, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#0284C7';
      ctx.textAlign = 'center';
      ctx.fillText('Atomic Electron Shell (~10⁻¹⁰ m) — Vast Empty Space', cx, cy - viewSize * 0.88 - 8);

      // Central Dense Positive Gold Nucleus (+79e, ~10^-14 m)
      const nucleusR = 12;
      const nucGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, nucleusR * 2.5);
      nucGrad.addColorStop(0, '#FFFFFF');
      nucGrad.addColorStop(0.3, '#F59E0B');
      nucGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.6)');
      nucGrad.addColorStop(1, 'rgba(239, 68, 68, 0.0)');

      ctx.fillStyle = nucGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, nucleusR * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Nucleus core ball
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(cx, cy, nucleusR, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('+79e', cx, cy + 3);

      ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#DC2626';
      ctx.fillText('Dense Nucleus (~10⁻¹⁴ m)', cx, cy + nucleusR + 16);
    } else {
      // J.J. Thomson Plum Pudding Model:
      // Diffuse positive sphere filling entire atom
      const puddingGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, viewSize * 0.85);
      puddingGrad.addColorStop(0, 'rgba(254, 205, 211, 0.7)');
      puddingGrad.addColorStop(1, 'rgba(251, 113, 133, 0.4)');
      ctx.fillStyle = puddingGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, viewSize * 0.85, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#E11D48';
      ctx.textAlign = 'center';
      ctx.fillText("Uniform Diffuse Positive Cloud (+79e)", cx, cy - viewSize * 0.85 - 8);

      // Scattered electrons like plums in pudding
      const plums = [
        { x: -50, y: -40 }, { x: 45, y: -30 }, { x: -30, y: 40 },
        { x: 50, y: 35 }, { x: 0, y: -60 }, { x: 0, y: 60 }
      ];
      ctx.fillStyle = '#2563EB';
      for (const p of plums) {
        ctx.beginPath();
        ctx.arc(cx + p.x, cy + p.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 8px monospace';
        ctx.fillText('−', cx + p.x, cy + p.y + 2.5);
        ctx.fillStyle = '#2563EB';
      }
    }

    // Draw Micro Alpha Particles & Hyperbolic Trajectories
    for (const a of this.state.alphas) {
      const px = cx + a.x * (viewSize / 0.5);
      const py = cy + a.y * (viewSize / 0.5);

      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0284C7';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    }
  }

  drawHistogramHUD(ctx) {
    const hx = Math.max(16, this.width - 260);
    const hy = 16;
    const hw = 244;
    const hh = 190;

    // Glassmorphic panel
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(hx, hy, hw, hh, 8);
    ctx.fill();
    ctx.stroke();

    // Header
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0284C7';
    ctx.textAlign = 'left';
    ctx.fillText('ANGULAR SCATTERING N(θ)', hx + 12, hy + 18);

    // Mini Bar Chart: 18 bins (0° to 180°)
    const chartX = hx + 16;
    const chartY = hy + 35;
    const chartW = hw - 32;
    const chartH = 105;

    // Chart axes
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartX, chartY);
    ctx.lineTo(chartX, chartY + chartH);
    ctx.lineTo(chartX + chartW, chartY + chartH);
    ctx.stroke();

    // Find max in bins
    const maxVal = Math.max(1, ...this.state.histogram);
    const binW = chartW / 18;

    for (let i = 0; i < 18; i++) {
      const val = this.state.histogram[i];
      // Logarithmic or power scaled height so small backscatter counts are visible
      const barH = val > 0 ? Math.max(2, (Math.log10(val + 1) / Math.log10(maxVal + 1)) * (chartH - 8)) : 0;
      const bx = chartX + i * binW;
      const by = chartY + chartH - barH;

      ctx.fillStyle = i < 1 ? '#0284C7' : (i < 9 ? '#22C55E' : '#DC2626');
      ctx.fillRect(bx + 1, by, binW - 2, barH);
    }

    // Chart axis labels
    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'left';
    ctx.fillText('0°', chartX, chartY + chartH + 12);
    ctx.textAlign = 'center';
    ctx.fillText('90°', chartX + chartW / 2, chartY + chartH + 12);
    ctx.textAlign = 'right';
    ctx.fillText('180°', chartX + chartW, chartY + chartH + 12);

    // Summary Scorecard line
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'left';
    const total = Math.max(1, this.state.totalCount);
    const undefPct = ((this.state.undeflectedCount / total) * 100).toFixed(1);
    ctx.fillText(`Pass-Through: ${undefPct}% | Backscatter: ${this.state.backscatteredCount}`, hx + 12, hy + hh - 10);
  }
}

window.RutherfordRenderer = RutherfordRenderer;
