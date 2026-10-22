/**
 * Solubility & Crystallization — Canvas 2D Laboratory Apparatus Renderer
 * Renders Bunsen Burner, Tripod & Wire Gauze, 250 mL Borosilicate Beaker,
 * Digital Thermometer, Seed Crystal Growth, and Live Dynamic Phase Curve Chart.
 */

class SolubilityRenderer {
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

    // 1. Soft laboratory environment & bench
    this.drawLabEnvironment(ctx);

    // 2. Heating & Dissolution Apparatus (Tripod, Burner, Beaker)
    this.drawApparatusBench(ctx);

    // 3. Live Thermodynamic Solubility Curve ($S$ vs $T$) Phase Chart
    this.drawPhaseCurveChart(ctx);
  }

  drawLabEnvironment(ctx) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#F4F9FF');
    bgGrad.addColorStop(1, '#E6F2FF');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Lab bench surface
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

  drawApparatusBench(ctx) {
    const bx = this.width * 0.28;
    const benchY = this.height * 0.88;

    // 1. Iron Tripod Stand with Ceramic Wire Gauze
    const tripodW = 150;
    const tripodH = 110;
    const gauzeY = benchY - tripodH;

    // Tripod legs
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Left leg
    ctx.moveTo(bx - tripodW / 2 + 10, gauzeY);
    ctx.lineTo(bx - tripodW / 2 - 15, benchY);
    // Right leg
    ctx.moveTo(bx + tripodW / 2 - 10, gauzeY);
    ctx.lineTo(bx + tripodW / 2 + 15, benchY);
    // Center back leg
    ctx.moveTo(bx, gauzeY);
    ctx.lineTo(bx, benchY);
    ctx.stroke();

    // Tripod ring
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(bx - tripodW / 2, gauzeY - 4, tripodW, 8, 4);
    ctx.fill();

    // Ceramic wire gauze
    ctx.fillStyle = '#E2E8F0';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bx - tripodW / 2 + 12, gauzeY - 7, tripodW - 24, 6, 2);
    ctx.fill();
    ctx.stroke();

    // 2. Bunsen Burner underneath tripod
    const burnerW = 28;
    const burnerH = 65;
    const burnerY = benchY - burnerH;

    ctx.fillStyle = '#64748B';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    // Chimney tube
    ctx.fillRect(bx - burnerW / 2, burnerY, burnerW, burnerH - 12);
    ctx.strokeRect(bx - burnerW / 2, burnerY, burnerW, burnerH - 12);
    // Base
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(bx - 32, benchY - 14, 64, 14, 4);
    ctx.fill();

    // Bunsen Flame if heating
    if (this.state.heatingPower > 0.05) {
      const flameH = 35 + this.state.heatingPower * 30;
      const flameGrad = ctx.createRadialGradient(bx, burnerY - flameH * 0.4, 2, bx, burnerY - flameH * 0.4, 26);
      flameGrad.addColorStop(0, '#FFFFFF');
      flameGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.9)'); // Hot blue inner cone
      flameGrad.addColorStop(0.7, 'rgba(2, 132, 199, 0.7)');
      flameGrad.addColorStop(1, 'rgba(2, 132, 199, 0.0)');

      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(bx - 12, burnerY);
      ctx.quadraticCurveTo(bx - 18, burnerY - flameH * 0.6, bx, burnerY - flameH);
      ctx.quadraticCurveTo(bx + 18, burnerY - flameH * 0.6, bx + 12, burnerY);
      ctx.closePath();
      ctx.fill();
    }

    // 3. 250 mL Borosilicate Glass Beaker resting on wire gauze
    const beakerW = 120;
    const beakerH = 145;
    const beakerBottomY = gauzeY - 7;
    const beakerTopY = beakerBottomY - beakerH;
    const beakerL = bx - beakerW / 2;
    const beakerR = bx + beakerW / 2;

    const salt = SOLUBILITY_DATA.salts[this.state.selectedSalt];

    // Beaker liquid fill (100 mL H2O)
    const liquidTopY = beakerBottomY - beakerH * 0.65;
    ctx.fillStyle = salt.solutionColor;
    ctx.fillRect(beakerL + 4, liquidTopY, beakerW - 8, beakerBottomY - liquidTopY);

    // Curved meniscus
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(bx, liquidTopY, beakerW / 2 - 4, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Undissolved Solute Sediment at beaker bottom
    const undissolvedG = this.state.getUndissolvedMass();
    if (undissolvedG > 0) {
      const sedimentH = Math.min(24, Math.max(3, undissolvedG * 0.6));
      ctx.fillStyle = salt.color === '#FFFFFF' ? '#F1F5F9' : salt.color;
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(beakerL + 6, beakerBottomY - sedimentH, beakerW - 12, sedimentH, [0, 0, 6, 6]);
      ctx.fill();
      ctx.stroke();

      ctx.font = '700 9px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'center';
      ctx.fillText(`${undissolvedG.toFixed(1)}g undissolved`, bx, beakerBottomY - sedimentH - 4);
    }

    // Falling powder particles when solute is added
    for (const p of this.state.fallingParticles) {
      const px = beakerL + p.xNorm * beakerW;
      const py = beakerTopY + p.yNorm * beakerH;
      ctx.beginPath();
      ctx.arc(px, py, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    // Suspended Seed Crystal & Grown Facets
    if (this.state.seedCrystalAdded) {
      const seedY = liquidTopY + 35;
      // Thread suspension
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx + 15, beakerTopY - 15);
      ctx.lineTo(bx + 15, seedY);
      ctx.stroke();

      // Seed crystal body + grown facets
      ctx.save();
      ctx.translate(bx + 15, seedY);
      ctx.fillStyle = salt.crystalColor;
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1;

      // Base rhombic seed
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(6, 0);
      ctx.lineTo(0, 6);
      ctx.lineTo(-6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Grown crystal clusters
      for (const c of this.state.grownCrystals) {
        ctx.save();
        ctx.translate(c.xOffset, c.yOffset);
        ctx.rotate(c.rotation);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
        ctx.strokeRect(-c.size / 2, -c.size / 2, c.size, c.size);
        ctx.restore();
      }
      ctx.restore();

      if (this.state.crystalMassFormedG > 0) {
        ctx.font = '700 9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#0284C7';
        ctx.textAlign = 'left';
        ctx.fillText(`+${this.state.crystalMassFormedG.toFixed(1)}g pure crystals`, bx + 28, seedY + 4);
      }
    }

    // Borosilicate Glass Beaker Walls & Spout
    ctx.strokeStyle = 'rgba(70, 130, 190, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(beakerL - 6, beakerTopY);
    ctx.lineTo(beakerL, beakerTopY);
    ctx.lineTo(beakerL, beakerBottomY - 8);
    ctx.arcTo(beakerL, beakerBottomY, beakerL + 8, beakerBottomY, 8);
    ctx.lineTo(beakerR - 8, beakerBottomY);
    ctx.arcTo(beakerR, beakerBottomY, beakerR, beakerBottomY - 8, 8);
    ctx.lineTo(beakerR, beakerTopY);
    ctx.stroke();

    // Graduation lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0F172A';
    for (let ml = 50; ml <= 200; ml += 50) {
      const my = beakerBottomY - (ml / 250) * beakerH;
      ctx.beginPath();
      ctx.moveTo(beakerL + 4, my);
      ctx.lineTo(beakerL + 16, my);
      ctx.stroke();
      ctx.fillText(`${ml} mL`, beakerL + 20, my + 3);
    }

    // 4. Submerged Digital Thermometer Probe
    const tx = bx - 32;
    const ty = beakerTopY - 25;
    const th = beakerH * 0.95;

    // Glass tube stem
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(tx - 3, ty, 6, th, 3);
    ctx.fill();
    ctx.stroke();

    // Red bulb
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(tx, ty + th + 4, 6, 0, Math.PI * 2);
    ctx.fill();

    // Red liquid height (10°C to 100°C)
    const tRatio = Math.max(0, Math.min(1, (this.state.temperatureC - 10) / 90));
    ctx.fillRect(tx - 1.5, ty + th - th * tRatio, 3, th * tRatio);

    // Digital Temperature Readout Tag
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(tx - 28, ty - 22, 56, 20, 4);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#DC2626';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.state.temperatureC.toFixed(1)}°C`, tx, ty - 9);
  }

  drawPhaseCurveChart(ctx) {
    const px = this.width * 0.52;
    const py = 20;
    const pw = this.width * 0.44;
    const ph = this.height * 0.56;

    // Chart Background Panel
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 10);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0284C7';
    ctx.textAlign = 'left';
    ctx.fillText('DYNAMIC SOLUBILITY PHASE DIAGRAM (S vs. T)', px + 16, py + 22);

    // Plot Arena
    const ax = px + 45;
    const ay = py + 40;
    const aw = pw - 60;
    const ah = ph - 70;

    // Plot Grid Lines
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    for (let t = 0; t <= 100; t += 20) {
      const gx = ax + (t / 100) * aw;
      ctx.beginPath();
      ctx.moveTo(gx, ay);
      ctx.lineTo(gx, ay + ah);
      ctx.stroke();
    }
    for (let s = 0; s <= 250; s += 50) {
      const gy = ay + ah - (s / 250) * ah;
      ctx.beginPath();
      ctx.moveTo(ax, gy);
      ctx.lineTo(ax + aw, gy);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax, ay + ah);
    ctx.lineTo(ax + aw, ay + ah);
    ctx.stroke();

    // Axis Labels
    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'center';
    for (let t = 0; t <= 100; t += 20) {
      const gx = ax + (t / 100) * aw;
      ctx.fillText(`${t}°C`, gx, ay + ah + 14);
    }

    ctx.textAlign = 'right';
    for (let s = 0; s <= 250; s += 50) {
      const gy = ay + ah - (s / 250) * ah;
      ctx.fillText(`${s}`, ax - 6, gy + 3);
    }

    ctx.font = '700 9px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Solute (g / 100g H₂O)', ax + 60, ay - 6);

    // Draw Theoretical Solubility Curve for active salt
    const salt = SOLUBILITY_DATA.salts[this.state.selectedSalt];
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let t = 0; t <= 100; t += 2) {
      const sVal = salt.solubility(t);
      const plotX = ax + (t / 100) * aw;
      const plotY = ay + ah - Math.min(1.0, sVal / 250.0) * ah;
      if (t === 0) ctx.moveTo(plotX, plotY);
      else ctx.lineTo(plotX, plotY);
    }
    ctx.stroke();

    // Label Unsaturated & Supersaturated zones
    ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(22, 163, 74, 0.7)'; // Green for unsaturated
    ctx.fillText('UNSATURATED ZONE (Solution dissolves all)', ax + aw * 0.45, ay + ah - 16);

    ctx.fillStyle = 'rgba(220, 38, 38, 0.7)'; // Red for supersaturated
    ctx.fillText('SUPERSATURATED ZONE (Precipitation & Crystals)', ax + aw * 0.45, ay + 20);

    // Plot Live Operating Point (T, Solute Added)
    const opX = ax + (this.state.temperatureC / 100) * aw;
    const opY = ay + ah - Math.min(1.0, this.state.soluteAddedG / 250.0) * ah;

    // Glowing Operating Beacon
    const beaconGrad = ctx.createRadialGradient(opX, opY, 2, opX, opY, 14);
    beaconGrad.addColorStop(0, '#FFFFFF');
    beaconGrad.addColorStop(0.4, '#DC2626');
    beaconGrad.addColorStop(1, 'rgba(220, 38, 38, 0.0)');
    ctx.fillStyle = beaconGrad;
    ctx.beginPath();
    ctx.arc(opX, opY, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(opX, opY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Coordinate tooltip pill
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.roundRect(opX + 8, opY - 18, 95, 18, 4);
    ctx.fill();

    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(`(${this.state.temperatureC.toFixed(0)}°C, ${this.state.soluteAddedG.toFixed(1)}g)`, opX + 55, opY - 6);
  }
}

window.SolubilityRenderer = SolubilityRenderer;
