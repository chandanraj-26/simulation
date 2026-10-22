/**
 * Tyndall Effect & Colloidal Scattering — Canvas 2D Apparatus Renderer
 * Renders Optical Bench with 3 Glass Beakers, Diode Laser Beam Scattering Cone,
 * Ultramicroscopic Brownian Motion Arena, and Filter Paper Funnel Separation.
 */

class TyndallRenderer {
  constructor(canvas, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = state;
    this.dpr = window.devicePixelRatio || 1;
    this.width = 800;
    this.height = 540;

    this.beakerBounds = [];
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

    // 1. Soft laboratory environment & bench
    this.drawLabEnvironment(ctx);

    // 2. Render based on active View Mode
    if (this.state.viewMode === 'bench') {
      this.drawOpticalBench(ctx);
    } else if (this.state.viewMode === 'brownian_microscope') {
      this.drawBrownianMicroscope(ctx);
    } else {
      this.drawFiltrationApparatus(ctx);
    }
  }

  drawLabEnvironment(ctx) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#F4F9FF');
    bgGrad.addColorStop(1, '#E6F2FF');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Laboratory optical bench rail
    const benchY = this.height * 0.85;
    ctx.fillStyle = '#D9E8F8';
    ctx.fillRect(0, benchY, this.width, this.height - benchY);

    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(this.width, benchY);
    ctx.stroke();
  }

  drawOpticalBench(ctx) {
    const benchY = this.height * 0.85;
    const laser = TYNDALL_DATA.lasers[this.state.laserColor];

    // 1. Laser Diode Emitter Box (Left)
    const lx = Math.min(80, this.width * 0.08);
    const ly = this.height * 0.52;
    const lw = 65;
    const lh = 50;

    // Laser chassis
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(lx - lw / 2, ly - lh / 2, lw, lh, 6);
    ctx.fill();
    ctx.stroke();

    // Laser output aperture
    ctx.fillStyle = laser.color;
    ctx.fillRect(lx + lw / 2 - 4, ly - 4, 8, 8);

    // Label
    ctx.font = '700 8px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.textAlign = 'center';
    ctx.fillText(`${laser.wavelengthNm} nm`, lx, ly + 18);
    ctx.fillText('DIODE LASER', lx, ly - 12);

    // 2. Three Borosilicate Glass Beakers on Bench
    const beakerW = Math.min(130, this.width * 0.17);
    const beakerH = 160;
    const beakerBottomY = benchY - 4;
    const beakerTopY = beakerBottomY - beakerH;

    const spacing = (this.width - lx - lw - 40) / 3.4;
    const b1X = lx + lw / 2 + spacing * 0.8;
    const b2X = b1X + spacing;
    const b3X = b2X + spacing;

    this.beakerBounds = [
      { id: 'true_solution', x: b1X - beakerW / 2, y: beakerTopY, w: beakerW, h: beakerH },
      { id: 'colloid', x: b2X - beakerW / 2, y: beakerTopY, w: beakerW, h: beakerH },
      { id: 'suspension', x: b3X - beakerW / 2, y: beakerTopY, w: beakerW, h: beakerH }
    ];

    // Draw Beaker 1: True Solution (CuSO4)
    this.drawSingleBeaker(ctx, b1X, beakerBottomY, beakerW, beakerH, 'true_solution', '1. True Solution (CuSO₄)', this.state.selectedBeaker === 'true_solution');

    // Draw Beaker 2: Colloidal Sol (Milk / Starch)
    this.drawSingleBeaker(ctx, b2X, beakerBottomY, beakerW, beakerH, 'colloid', '2. Colloid (Milk/Starch)', this.state.selectedBeaker === 'colloid');

    // Draw Beaker 3: Suspension (Chalk Powder)
    this.drawSingleBeaker(ctx, b3X, beakerBottomY, beakerW, beakerH, 'suspension', '3. Suspension (Chalk)', this.state.selectedBeaker === 'suspension');

    // 3. Laser Beam Trajectory across all 3 Beakers
    if (this.state.laserActive) {
      this.drawLaserBeams(ctx, lx + lw / 2 + 4, ly, b1X, b2X, b3X, beakerW, laser);
    }
  }

  drawSingleBeaker(ctx, cx, bottomY, w, h, beakerKey, title, isSelected) {
    const halfW = w / 2;
    const leftX = cx - halfW;
    const rightX = cx + halfW;
    const topY = bottomY - h;
    const liquidTopY = bottomY - h * 0.72;

    const bData = TYNDALL_DATA.beakers[beakerKey];

    // Selected Halo
    if (isSelected) {
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(leftX - 6, topY - 14, w + 12, h + 24);
      ctx.setLineDash([]);
    }

    // Liquid Fill
    ctx.fillStyle = bData.color;
    ctx.fillRect(leftX + 3, liquidTopY, w - 6, bottomY - liquidTopY - 4);

    // Liquid Meniscus
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, liquidTopY, halfW - 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Suspension Particles & Settling Sediment
    if (beakerKey === 'suspension') {
      const sedimentH = this.state.suspensionSettled * 16;
      if (sedimentH > 0) {
        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(leftX + 4, bottomY - sedimentH - 3, w - 8, sedimentH);
      }

      ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
      for (const sp of this.state.suspensionParticles) {
        const px = leftX + sp.xNorm * w;
        const py = topY + sp.yNorm * h;
        ctx.beginPath();
        ctx.arc(px, py, sp.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Borosilicate Glass Beaker Body Outline
    ctx.strokeStyle = 'rgba(70, 130, 190, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftX - 6, topY);
    ctx.lineTo(leftX, topY);
    ctx.lineTo(leftX, bottomY - 6);
    ctx.arcTo(leftX, bottomY, leftX + 6, bottomY, 6);
    ctx.lineTo(rightX - 6, bottomY);
    ctx.arcTo(rightX, bottomY, rightX, bottomY - 6, 6);
    ctx.lineTo(rightX, topY);
    ctx.stroke();

    // Specular Highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leftX + 4, topY + 8);
    ctx.lineTo(leftX + 4, bottomY - 12);
    ctx.stroke();

    // Beaker Title Tag at bottom
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = isSelected ? '#0284C7' : '#475569';
    ctx.textAlign = 'center';
    ctx.fillText(title, cx, bottomY + 22);

    // Particle Size Tag
    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0F172A';
    ctx.fillText(bData.particleSize, cx, bottomY + 36);
  }

  drawLaserBeams(ctx, startX, beamY, b1X, b2X, b3X, beakerW, laser) {
    const halfW = beakerW / 2;
    const endX = this.width - 20;

    // Laser core line (in air: barely visible sharp line)
    ctx.strokeStyle = laser.color;
    ctx.lineWidth = 2;

    // Air Segment 1: from Laser to Beaker 1
    ctx.beginPath();
    ctx.moveTo(startX, beamY);
    ctx.lineTo(b1X - halfW, beamY);
    ctx.stroke();

    // Inside Beaker 1 (True Solution): BEAM IS COMPLETELY INVISIBLE!
    // We intentionally DO NOT draw beam inside Beaker 1!

    // Air Segment 2: between Beaker 1 and Beaker 2
    ctx.beginPath();
    ctx.moveTo(b1X + halfW, beamY);
    ctx.lineTo(b2X - halfW, beamY);
    ctx.stroke();

    // Inside Beaker 2 (Colloid): BRILLIANT TYNDALL SCATTERING CONE!
    const scatterIntensity = this.state.getScatteringIntensity('colloid');
    const glowH = 14 * Math.min(2.0, scatterIntensity);

    const tyndallGrad = ctx.createLinearGradient(b2X - halfW, beamY - glowH, b2X - halfW, beamY + glowH);
    tyndallGrad.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
    tyndallGrad.addColorStop(0.3, laser.beamGlow);
    tyndallGrad.addColorStop(0.5, '#FFFFFF'); // Bright core
    tyndallGrad.addColorStop(0.7, laser.beamGlow);
    tyndallGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = tyndallGrad;
    ctx.fillRect(b2X - halfW + 4, beamY - glowH / 2, beakerW - 8, glowH);

    // Laser beam core inside colloid
    ctx.beginPath();
    ctx.moveTo(b2X - halfW + 4, beamY);
    ctx.lineTo(b2X + halfW - 4, beamY);
    ctx.stroke();

    // Air Segment 3: between Beaker 2 and Beaker 3
    ctx.beginPath();
    ctx.moveTo(b2X + halfW, beamY);
    ctx.lineTo(b3X - halfW, beamY);
    ctx.stroke();

    // Inside Beaker 3 (Suspension): Opaque block / turbid scatter
    const suspIntensity = this.state.getScatteringIntensity('suspension');
    ctx.fillStyle = `rgba(203, 213, 225, ${Math.min(0.85, suspIntensity)})`;
    ctx.fillRect(b3X - halfW + 4, beamY - 12, beakerW - 8, 24);

    ctx.beginPath();
    ctx.moveTo(b3X - halfW + 4, beamY);
    ctx.lineTo(b3X + halfW - 4, beamY);
    ctx.stroke();

    // Exit beam beyond Beaker 3 hitting target wall
    ctx.beginPath();
    ctx.moveTo(b3X + halfW, beamY);
    ctx.lineTo(endX, beamY);
    ctx.stroke();

    // Laser red dot on far wall
    ctx.fillStyle = laser.color;
    ctx.beginPath();
    ctx.arc(endX, beamY, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBrownianMicroscope(ctx) {
    const cx = this.width * 0.50;
    const cy = this.height * 0.48;
    const radius = 135;

    // Dark-field microscope outer body
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Eyepiece circular view arena
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Crosshairs
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();

    // Draw Brownian colloidal particles & zigzag trails
    for (const p of this.state.brownianParticles) {
      // Trail
      if (p.trail.length > 1) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + p.trail[0].x, cy + p.trail[0].y);
        for (let i = 1; i < p.trail.length; i++) {
          ctx.lineTo(cx + p.trail[i].x, cy + p.trail[i].y);
        }
        ctx.stroke();
      }

      // Particle
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(cx + p.x, cy + p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Specular shine
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx + p.x - 1, cy + p.y - 1, p.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Callout title
    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0284C7';
    ctx.textAlign = 'center';
    ctx.fillText('ULTRAMICROSCOPIC BROWNIAN MOTION (Robert Brown 1827)', cx, cy - radius - 24);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#475569';
    ctx.fillText('Continuous erratic zigzag collisions by thermal solvent molecules prevent colloidal settling', cx, cy + radius + 32);
  }

  drawFiltrationApparatus(ctx) {
    const cx = this.width * 0.50;
    const topY = this.height * 0.22;

    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0284C7';
    ctx.textAlign = 'center';
    ctx.fillText('FILTRATION SEPARATION TEST (Whatman Filter Paper)', cx, topY - 30);

    // Three side-by-side filtration setups: True Sol, Colloid, Suspension
    const colSpacing = Math.min(180, this.width * 0.28);
    const cols = [
      { x: cx - colSpacing, name: 'True Solution', passes: true, cake: false, note: 'Passes completely clear' },
      { x: cx, name: 'Colloidal Sol', passes: true, cake: false, note: 'Passes completely through pores' },
      { x: cx + colSpacing, name: 'Suspension', passes: false, cake: true, note: 'Coarse chalk residue trapped!' }
    ];

    for (const c of cols) {
      // Funnel cone
      ctx.fillStyle = 'rgba(219, 234, 254, 0.4)';
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x - 45, topY);
      ctx.lineTo(c.x + 45, topY);
      ctx.lineTo(c.x + 6, topY + 70);
      ctx.lineTo(c.x + 6, topY + 115);
      ctx.lineTo(c.x - 6, topY + 115);
      ctx.lineTo(c.x - 6, topY + 70);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Folded Filter Paper cone
      ctx.fillStyle = '#F8FAFC';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(c.x - 40, topY + 4);
      ctx.lineTo(c.x + 40, topY + 4);
      ctx.lineTo(c.x, topY + 65);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Chalk cake residue on paper if suspension
      if (c.cake) {
        ctx.fillStyle = '#94A3B8';
        ctx.beginPath();
        ctx.moveTo(c.x - 22, topY + 28);
        ctx.lineTo(c.x + 22, topY + 28);
        ctx.lineTo(c.x, topY + 62);
        ctx.closePath();
        ctx.fill();

        ctx.font = '700 9px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#DC2626';
        ctx.fillText('Chalk Residue', c.x, topY + 22);
      }

      // Receiving flask underneath
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x - 18, topY + 120);
      ctx.lineTo(c.x + 18, topY + 120);
      ctx.lineTo(c.x + 36, topY + 185);
      ctx.lineTo(c.x - 36, topY + 185);
      ctx.closePath();
      ctx.stroke();

      // Filtrate liquid in receiving flask
      ctx.fillStyle = c.passes ? 'rgba(186, 230, 253, 0.65)' : 'rgba(235, 248, 255, 0.2)';
      ctx.fillRect(c.x - 32, topY + 160, 64, 24);

      // Labels
      ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(c.name, c.x, topY + 205);

      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillStyle = c.cake ? '#DC2626' : '#16A34A';
      ctx.fillText(c.note, c.x, topY + 220);
    }
  }
}

window.TyndallRenderer = TyndallRenderer;
