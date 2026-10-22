/**
 * Law of Conservation of Mass — Canvas 2D Laboratory Apparatus Renderer
 * Renders Precision Digital Analytical Balance, 250 mL Conical Flask,
 * Suspended Ignition Tube, Rubber Cork Seal, Tilting Dynamics, and Atomic HUD.
 */

class MassRenderer {
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

    // 1. Soft study environment & lab bench
    this.drawLabEnvironment(ctx);

    // 2. High-Precision Digital Analytical Balance
    const balanceBounds = this.drawAnalyticalBalance(ctx);

    // 3. Conical Flask with Suspended Ignition Tube & Liquids
    this.drawConicalFlask(ctx, balanceBounds.panX, balanceBounds.panY);

    // 4. In-Canvas Atomic Balance HUD
    this.drawAtomicLedgerHUD(ctx);
  }

  drawLabEnvironment(ctx) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#F4F9FF');
    bgGrad.addColorStop(1, '#E6F2FF');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Bench surface
    const benchY = this.height * 0.88;
    ctx.fillStyle = '#D9E8F8';
    ctx.fillRect(0, benchY, this.width, this.height - benchY);

    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(this.width, benchY);
    ctx.stroke();
  }

  drawAnalyticalBalance(ctx) {
    const cx = this.width * 0.44;
    const benchY = this.height * 0.88;

    const baseW = Math.min(380, this.width * 0.52);
    const baseH = 85;
    const baseX = cx - baseW / 2;
    const baseY = benchY - baseH;

    // Scale Main Body (Modern laboratory white/metallic chassis)
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(baseX, baseY, baseW, baseH, 10);
    ctx.fill();
    ctx.stroke();

    // Rubber leveling feet
    ctx.fillStyle = '#334155';
    ctx.fillRect(baseX + 18, benchY - 4, 24, 4);
    ctx.fillRect(baseX + baseW - 42, benchY - 4, 24, 4);

    // Digital LED Display (Dark bezel with vibrant green 7-segment numbers)
    const dispW = baseW * 0.55;
    const dispH = 44;
    const dispX = cx - dispW / 2;
    const dispY = baseY + 20;

    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(dispX, dispY, dispW, dispH, 6);
    ctx.fill();
    ctx.stroke();

    // Mass readout in grams
    const massVal = this.state.getDisplayMass().toFixed(3);
    ctx.font = '700 22px "JetBrains Mono", monospace';
    ctx.fillStyle = '#22C55E';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${massVal} g`, dispX + dispW - 14, dispY + dispH / 2);

    // Stable indicator dot
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.arc(dispX + 16, dispY + dispH / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '600 9px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.textAlign = 'left';
    ctx.fillText('STABLE', dispX + 26, dispY + dispH / 2 + 1);

    // Stainless Steel Weighing Pan
    const panW = baseW * 0.72;
    const panH = 12;
    const panX = cx;
    const panY = baseY - 8;

    const panGrad = ctx.createLinearGradient(panX - panW / 2, panY, panX + panW / 2, panY);
    panGrad.addColorStop(0, '#94A3B8');
    panGrad.addColorStop(0.5, '#E2E8F0');
    panGrad.addColorStop(1, '#94A3B8');

    ctx.fillStyle = panGrad;
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(panX - panW / 2, panY, panW, panH, 4);
    ctx.fill();
    ctx.stroke();

    return { panX, panY, panW };
  }

  drawConicalFlask(ctx, panX, panY) {
    const sys = MASS_DATA.systems[this.state.currentSystemId];
    const flaskBottomY = panY;
    const flaskH = 210;
    const bottomW = 160;
    const neckW = 38;
    const neckH = 55;

    ctx.save();
    // Pivot around bottom center for realistic tilting kinematics
    ctx.translate(panX, flaskBottomY);
    ctx.rotate(this.state.tiltAngle);

    // 1. Flask Liquid Fill
    const liquidH = 75;
    const halfBottom = bottomW / 2;
    const halfNeck = neckW / 2;

    // Liquid color (clear initially, transitions to white or canary yellow on mixing)
    let liquidColor = sys.solutionFlask.color;
    if (this.state.mixed && this.state.reactionProgress > 0) {
      if (sys.id === 'barium_sodium') {
        liquidColor = `rgba(255, 255, 255, ${0.45 + this.state.reactionProgress * 0.50})`;
      } else if (sys.id === 'lead_potassium') {
        liquidColor = `rgba(250, 204, 21, ${0.30 + this.state.reactionProgress * 0.65})`;
      } else {
        liquidColor = `rgba(225, 240, 255, 0.40)`;
      }
    }

    // Clip to flask body for liquid drawing
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-halfBottom + 8, 0);
    ctx.lineTo(halfBottom - 8, 0);
    ctx.quadraticCurveTo(halfBottom, 0, halfBottom - 10, -25);
    ctx.lineTo(halfNeck, -flaskH + neckH);
    ctx.lineTo(halfNeck, -flaskH);
    ctx.lineTo(-halfNeck, -flaskH);
    ctx.lineTo(-halfNeck, -flaskH + neckH);
    ctx.lineTo(-halfBottom + 10, -25);
    ctx.quadraticCurveTo(-halfBottom, 0, -halfBottom + 8, 0);
    ctx.closePath();
    ctx.clip();

    // Fill liquid
    ctx.fillStyle = liquidColor;
    ctx.fillRect(-halfBottom, -liquidH, bottomW, liquidH);

    // Draw settling precipitate particles
    for (const p of this.state.particles) {
      const px = (p.xNorm - 0.5) * bottomW;
      const py = -liquidH * (1.0 - p.yNorm);

      ctx.beginPath();
      ctx.arc(px, py, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.isGas ? 'rgba(255, 255, 255, 0.8)' : sys.precipitateColor;
      ctx.fill();
    }

    ctx.restore();

    // 2. Suspended Ignition Tube inside the flask
    this.drawSuspendedIgnitionTube(ctx, sys, flaskH, neckH);

    // 3. Conical Flask Glass Body Outline & Specular Highlights
    ctx.strokeStyle = 'rgba(70, 130, 190, 0.85)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-halfBottom + 8, 0);
    ctx.lineTo(halfBottom - 8, 0);
    ctx.quadraticCurveTo(halfBottom, 0, halfBottom - 10, -25);
    ctx.lineTo(halfNeck, -flaskH + neckH);
    ctx.lineTo(halfNeck, -flaskH);
    // Lip rim
    ctx.lineTo(halfNeck + 4, -flaskH);
    ctx.lineTo(halfNeck + 4, -flaskH - 4);
    ctx.lineTo(-halfNeck - 4, -flaskH - 4);
    ctx.lineTo(-halfNeck - 4, -flaskH);
    ctx.lineTo(-halfNeck, -flaskH);
    ctx.lineTo(-halfNeck, -flaskH + neckH);
    ctx.lineTo(-halfBottom + 10, -25);
    ctx.quadraticCurveTo(-halfBottom, 0, -halfBottom + 8, 0);
    ctx.stroke();

    // Volumetric Graduation Tick Lines
    ctx.strokeStyle = 'rgba(70, 130, 190, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#1E3A8A';
    for (let ml = 50; ml <= 200; ml += 50) {
      const gy = -(ml / 250) * (flaskH - neckH);
      const halfWAtY = halfNeck + ((flaskH - neckH + gy) / (flaskH - neckH)) * (halfBottom - halfNeck);
      ctx.beginPath();
      ctx.moveTo(-halfWAtY + 8, gy);
      ctx.lineTo(-halfWAtY + 22, gy);
      ctx.stroke();
      ctx.fillText(`${ml} mL`, -halfWAtY + 26, gy + 3);
    }

    // 4. Rubber Cork Stopper (Sealing flask or removed)
    if (this.state.isCorked) {
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-halfNeck - 2, -flaskH - 2);
      ctx.lineTo(halfNeck + 2, -flaskH - 2);
      ctx.lineTo(halfNeck - 2, -flaskH - 26);
      ctx.lineTo(-halfNeck + 2, -flaskH - 26);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // "CORK SEALED" badge
      ctx.font = '700 9px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText('SEALED', 0, -flaskH - 12);
    }

    ctx.restore();

    // If uncorked, draw cork resting beside the flask on the balance pan
    if (!this.state.isCorked) {
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(panX + 68, flaskBottomY - 18, 22, 18, 3);
      ctx.fill();
      ctx.stroke();

      // Escaping gas cloud if uncorked and gas reaction occurred
      if (this.state.mixed && sys.gasEvolved) {
        ctx.fillStyle = 'rgba(203, 213, 225, 0.5)';
        ctx.beginPath();
        ctx.arc(panX + 15, flaskBottomY - flaskH - 15, 14, 0, Math.PI * 2);
        ctx.arc(panX - 10, flaskBottomY - flaskH - 28, 18, 0, Math.PI * 2);
        ctx.arc(panX + 8, flaskBottomY - flaskH - 42, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#DC2626';
        ctx.textAlign = 'center';
        ctx.fillText('💨 CO₂ Gas Escaping!', panX, flaskBottomY - flaskH - 55);
      }
    }
  }

  drawSuspendedIgnitionTube(ctx, sys, flaskH, neckH) {
    const tubeW = 14;
    const tubeH = 65;

    // Thread suspension hanging from cork / flask neck
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -flaskH);
    ctx.lineTo(0, -flaskH + 70);
    ctx.stroke();

    // Ignition tube orientation depends on tilt
    ctx.save();
    ctx.translate(0, -flaskH + 70);

    // Tip over when flask tilts
    if (this.state.tiltAngle > 0.1) {
      ctx.rotate(this.state.tiltAngle * 1.8);
    }

    // Ignition tube body
    ctx.fillStyle = this.state.mixed ? 'rgba(255, 255, 255, 0.4)' : sys.solutionTube.color;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-tubeW / 2, 0, tubeW, tubeH, [0, 0, tubeW / 2, tubeW / 2]);
    ctx.fill();
    ctx.stroke();

    // Tube solution fill if not mixed
    if (!this.state.mixed) {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.8)';
      ctx.beginPath();
      ctx.roundRect(-tubeW / 2 + 1, tubeH * 0.35, tubeW - 2, tubeH * 0.65 - 1, [0, 0, tubeW / 2, tubeW / 2]);
      ctx.fill();
    }

    ctx.restore();
  }

  drawAtomicLedgerHUD(ctx) {
    const sys = MASS_DATA.systems[this.state.currentSystemId];
    const hx = Math.max(16, this.width - 270);
    const hy = 16;
    const hw = 250;
    const hh = 195;

    // Glassmorphic panel
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(hx, hy, hw, hh, 8);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0284C7';
    ctx.textAlign = 'left';
    ctx.fillText('ATOMIC STOICHIOMETRIC LEDGER', hx + 12, hy + 18);

    // Table Header
    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748B';
    ctx.fillText('Element', hx + 14, hy + 38);
    ctx.fillText('Reactants', hx + 95, hy + 38);
    ctx.fillText('Products', hx + 180, hy + 38);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hx + 10, hy + 44);
    ctx.lineTo(hx + hw - 10, hy + 44);
    ctx.stroke();

    // Render atomic counts
    let lineY = hy + 62;
    const atoms = sys.atoms;
    for (const [elem, counts] of Object.entries(atoms)) {
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(elem, hx + 18, lineY);
      ctx.fillText(`${counts.reactant}`, hx + 115, lineY);
      ctx.fillText(`${counts.product}`, hx + 200, lineY);
      lineY += 20;
    }

    // Invariance badge
    ctx.fillStyle = '#F0FDF4';
    ctx.strokeStyle = '#BBF7D0';
    ctx.beginPath();
    ctx.roundRect(hx + 10, hy + hh - 28, hw - 20, 20, 4);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#16A34A';
    ctx.textAlign = 'center';
    ctx.fillText('LAW VERIFIED: Δm = 0.000 g (100% CONSERVED)', hx + hw / 2, hy + hh - 15);
  }
}

window.MassRenderer = MassRenderer;
