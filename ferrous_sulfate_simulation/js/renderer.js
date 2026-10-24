/**
 * Thermal Decomposition of Ferrous Sulfate — Canvas 2D Apparatus Renderer
 * Renders laboratory retort stand, tilted borosilicate boiling tube with test tube holder,
 * Bunsen burner flame dynamics, crystal color metamorphosis, water droplet condensation,
 * rising fumes plume, chemical test strips, and safety wafting hand.
 */

class ReactionRenderer {
  constructor(canvas, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = state;
    this.dpr = window.devicePixelRatio || 1;
    this.width = 800;
    this.height = 540;

    this.flameFlicker = 0;
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
    this.flameFlicker += 0.15;

    // 1. Studio Laboratory Environment & Bench
    this.drawLabBench(ctx);

    // 2. Retort Stand & Test Tube Clamp
    this.drawRetortStand(ctx);

    // 3. Bunsen Burner & Dynamic Flame
    this.drawBunsenBurner(ctx);

    // 4. Boiling Tube with Contents & Condensation
    this.drawBoilingTube(ctx);

    // 5. Chemical Test Strip (if active)
    this.drawChemicalTestStrip(ctx);

    // 6. Safety Wafting Hand Animation (if active)
    if (this.state.waftingActive) {
      this.drawWaftingHand(ctx);
    }

    // 7. Safety Precaution Notice Banner
    this.drawSafetyPrecautionBanner(ctx);
  }

  drawLabBench(ctx) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#F0F7FF');
    bgGrad.addColorStop(1, '#E2E8F0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Lab bench surface
    const benchY = this.height * 0.86;
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(0, benchY, this.width, this.height - benchY);

    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(this.width, benchY);
    ctx.stroke();

    // Soft bench shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, benchY, this.width, 8);
  }

  drawRetortStand(ctx) {
    const benchY = this.height * 0.86;
    const standX = this.width * 0.22;

    // Heavy cast iron base
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(standX - 55, benchY - 14, 110, 14, [4, 4, 0, 0]);
    ctx.fill();

    // Steel vertical upright rod
    ctx.fillStyle = '#64748B';
    ctx.fillRect(standX - 4, this.height * 0.18, 8, benchY - 14 - this.height * 0.18);

    // Metallic clamp bosshead on vertical rod
    const clampY = this.height * 0.42;
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(standX - 8, clampY - 12, 16, 24);

    // Clamp horizontal arm reaching out to boiling tube
    ctx.fillStyle = '#475569';
    ctx.fillRect(standX + 8, clampY - 4, this.width * 0.18, 8);

    // Test tube holder / wooden jaw clamp
    const jawX = standX + 8 + this.width * 0.18;
    ctx.fillStyle = '#B45309'; // Wooden texture clamp
    ctx.fillRect(jawX - 6, clampY - 18, 16, 36);
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(jawX - 6, clampY - 18, 16, 36);
  }

  drawBunsenBurner(ctx) {
    const benchY = this.height * 0.86;
    const bx = this.width * 0.46;
    const by = benchY - 10;

    // Heavy round base
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(bx - 36, by - 12, 72, 12, [6, 6, 0, 0]);
    ctx.fill();

    // Gas inlet spigot
    ctx.fillStyle = '#475569';
    ctx.fillRect(bx - 44, by - 10, 10, 6);

    // Vertical brass burner barrel
    const barrelH = 90;
    const barrelTopY = by - 12 - barrelH;
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(bx - 9, barrelTopY, 18, barrelH);

    // Rotating air collar with hole
    ctx.fillStyle = '#64748B';
    ctx.fillRect(bx - 11, barrelTopY + 55, 22, 16);
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(bx, barrelTopY + 63, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw Flame if burner is active
    if (this.state.flameLevel > 0) {
      this.drawFlame(ctx, bx, barrelTopY, this.state.flameLevel);
    }
  }

  drawFlame(ctx, bx, barrelTopY, level) {
    const flicker = Math.sin(this.flameFlicker * 3) * 2;
    const flameH = level === 1 ? 65 : 85;

    ctx.save();
    if (level === 1) {
      // Mild Yellow Luminous Flame
      const flameGrad = ctx.createLinearGradient(bx, barrelTopY, bx, barrelTopY - flameH);
      flameGrad.addColorStop(0, 'rgba(59, 130, 246, 0.7)'); // Blue base
      flameGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.9)'); // Yellow-orange body
      flameGrad.addColorStop(0.9, 'rgba(239, 68, 68, 0.8)'); // Reddish tip
      flameGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(bx - 9, barrelTopY);
      ctx.quadraticCurveTo(bx - 16 + flicker, barrelTopY - flameH * 0.5, bx + flicker, barrelTopY - flameH);
      ctx.quadraticCurveTo(bx + 16 + flicker, barrelTopY - flameH * 0.5, bx + 9, barrelTopY);
      ctx.closePath();
      ctx.fill();
    } else {
      // Strong Roaring Blue Non-Luminous Flame (High Heat)
      // Outer oxidizing flame
      const outerGrad = ctx.createLinearGradient(bx, barrelTopY, bx, barrelTopY - flameH);
      outerGrad.addColorStop(0, 'rgba(37, 99, 235, 0.85)');
      outerGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.75)');
      outerGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.moveTo(bx - 10, barrelTopY);
      ctx.quadraticCurveTo(bx - 18 + flicker, barrelTopY - flameH * 0.5, bx + flicker, barrelTopY - flameH);
      ctx.quadraticCurveTo(bx + 18 + flicker, barrelTopY - flameH * 0.5, bx + 10, barrelTopY);
      ctx.closePath();
      ctx.fill();

      // Inner intense light-blue cone
      const innerH = flameH * 0.48;
      const innerGrad = ctx.createLinearGradient(bx, barrelTopY, bx, barrelTopY - innerH);
      innerGrad.addColorStop(0, '#38BDF8');
      innerGrad.addColorStop(1, '#E0F2FE');

      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.moveTo(bx - 7, barrelTopY);
      ctx.quadraticCurveTo(bx - 11, barrelTopY - innerH * 0.5, bx, barrelTopY - innerH);
      ctx.quadraticCurveTo(bx + 11, barrelTopY - innerH * 0.5, bx + 7, barrelTopY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawBoilingTube(ctx) {
    // Tube position: base is directly in the flame path at (bx, by-12-barrelH-15)
    // Angled at 45° towards upper right
    const baseCX = this.width * 0.46;
    const baseCY = this.height * 0.86 - 12 - 90 - 25;
    const angleRad = -Math.PI / 4; // -45 degrees (pointing upper right)

    const tubeLength = 220;
    const tubeRadius = 14;

    ctx.save();
    ctx.translate(baseCX, baseCY);
    ctx.rotate(angleRad);

    // 1. Draw solid contents inside curved bottom of boiling tube
    this.drawSolidCrystals(ctx, tubeRadius);

    // 2. Draw condensed water droplets inside upper-middle walls
    this.drawCondensedWater(ctx, tubeRadius, tubeLength);

    // 3. Draw glass tube walls & lip
    this.drawGlassTube(ctx, tubeRadius, tubeLength);

    // 4. Calculate tube mouth in global coords for gas plume
    ctx.restore();

    // Draw rising gas plume particles in world coordinates
    this.drawGasPlume(ctx, baseCX, baseCY, angleRad, tubeLength);
  }

  drawSolidCrystals(ctx, radius) {
    // Current solid color interpolation
    // Stage 1: Pale green (#4ADE80) -> Dirty white (#CBD5E1)
    // Stage 2: Dirty white (#CBD5E1) -> Reddish brown Fe2O3 (#7F1D1D)
    let fillStyle = '#4ADE80';

    if (this.state.dehydrationProgress < 1.0) {
      // Blend pale green to dirty white
      const t = this.state.dehydrationProgress;
      const r = Math.round(74 + (203 - 74) * t);
      const g = Math.round(222 + (213 - 222) * t);
      const b = Math.round(128 + (225 - 128) * t);
      fillStyle = `rgb(${r}, ${g}, ${b})`;
    } else {
      // Blend dirty white to deep reddish brown
      const t = this.state.decompositionProgress;
      const r = Math.round(203 + (127 - 203) * t);
      const g = Math.round(213 + (29 - 213) * t);
      const b = Math.round(225 + (29 - 225) * t);
      fillStyle = `rgb(${r}, ${g}, ${b})`;
    }

    // Hemispherical bottom bed
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 1.5, 0, Math.PI);
    ctx.lineTo(radius - 1.5, -28);
    ctx.lineTo(-radius + 1.5, -28);
    ctx.closePath();
    ctx.fill();

    // Individual crystal facets / granules
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    for (const g of this.state.crystalGrains) {
      ctx.save();
      ctx.translate(g.rx * 0.45, -14 + g.ry * 0.8);
      ctx.rotate(g.angle);
      ctx.fillRect(-g.size / 2, -g.size / 2, g.size, g.size * g.aspect);
      ctx.restore();
    }
  }

  drawCondensedWater(ctx, radius, tubeLength) {
    if (this.state.dehydrationProgress <= 0.05) return;

    for (const d of this.state.waterDroplets) {
      if (d.opacity <= 0.02) continue;

      const y = -tubeLength * d.yPos;
      const x = (d.xOffset > 0 ? radius - 3 : -radius + 3);

      ctx.save();
      ctx.fillStyle = `rgba(224, 242, 254, ${d.opacity * 0.8})`;
      ctx.strokeStyle = `rgba(56, 189, 248, ${d.opacity * 0.5})`;
      ctx.lineWidth = 0.8;

      ctx.beginPath();
      ctx.arc(x, y, d.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Specular highlight dot
      ctx.fillStyle = `rgba(255, 255, 255, ${d.opacity * 0.9})`;
      ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
      ctx.restore();
    }
  }

  drawGlassTube(ctx, radius, tubeLength) {
    // Glass cylindrical walls & rounded bottom
    ctx.save();
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    // Rounded bottom
    ctx.arc(0, 0, radius, 0, Math.PI);
    // Left wall
    ctx.lineTo(-radius, -tubeLength);
    // Mouth lip left
    ctx.lineTo(-radius - 3, -tubeLength);
    ctx.stroke();

    ctx.beginPath();
    // Right wall
    ctx.moveTo(radius, 0);
    ctx.lineTo(radius, -tubeLength);
    // Mouth lip right
    ctx.lineTo(radius + 3, -tubeLength);
    ctx.stroke();

    // Open mouth ellipse
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, -tubeLength, radius + 3, 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Glass specular reflection highlight down the side
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-radius + 3, -4);
    ctx.lineTo(-radius + 3, -tubeLength + 8);
    ctx.stroke();

    ctx.restore();
  }

  drawGasPlume(ctx, baseCX, baseCY, angleRad, tubeLength) {
    // Calculate tube mouth origin in canvas space
    // Tube points along angleRad (-45 deg): vector is (cos(angleRad - PI/2), sin(angleRad - PI/2))
    const mouthX = baseCX + Math.cos(angleRad - Math.PI / 2) * tubeLength;
    const mouthY = baseCY + Math.sin(angleRad - Math.PI / 2) * tubeLength;

    ctx.save();
    for (const p of this.state.gasParticles) {
      const gx = mouthX + p.x;
      const gy = mouthY + p.y;

      const plumeGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, p.radius);
      plumeGrad.addColorStop(0, `rgba(226, 232, 240, ${p.opacity})`);
      plumeGrad.addColorStop(0.6, `rgba(241, 245, 249, ${p.opacity * 0.5})`);
      plumeGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = plumeGrad;
      ctx.beginPath();
      ctx.arc(gx, gy, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawChemicalTestStrip(ctx) {
    if (this.state.activeTestProbe === 'none') return;

    // Tube mouth location
    const baseCX = this.width * 0.46;
    const baseCY = this.height * 0.86 - 12 - 90 - 25;
    const angleRad = -Math.PI / 4;
    const tubeLength = 220;

    const mouthX = baseCX + Math.cos(angleRad - Math.PI / 2) * tubeLength;
    const mouthY = baseCY + Math.sin(angleRad - Math.PI / 2) * tubeLength;

    // Position strip just 15px above mouth
    const stripX = mouthX + 25;
    const stripY = mouthY - 15;

    ctx.save();
    // Forceps / pair of tongs holding strip
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(stripX + 70, stripY - 30);
    ctx.lineTo(stripX + 15, stripY - 4);
    ctx.stroke();

    if (this.state.activeTestProbe === 'litmus') {
      // Litmus Paper: Blue (#3B82F6) -> Red (#EF4444)
      const t = this.state.litmusProgress;
      const r = Math.round(59 + (239 - 59) * t);
      const g = Math.round(130 + (68 - 130) * t);
      const b = Math.round(246 + (68 - 246) * t);

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(stripX - 15, stripY - 6, 32, 12, 2);
      ctx.fill();
      ctx.stroke();

      // Label callout
      ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(t > 0.5 ? '🔴 Moist Blue Litmus turned RED (Acidic SO₂/SO₃)' : '🔵 Moist Blue Litmus Paper', stripX + 22, stripY + 4);
    } else if (this.state.activeTestProbe === 'dichromate') {
      // K2Cr2O7 Paper: Orange (#F97316) -> Green (#16A34A)
      const t = this.state.dichromateProgress;
      const r = Math.round(249 + (22 - 249) * t);
      const g = Math.round(115 + (163 - 115) * t);
      const b = Math.round(22 + (74 - 22) * t);

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(stripX - 15, stripY - 6, 32, 12, 2);
      ctx.fill();
      ctx.stroke();

      // Label callout
      ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(t > 0.5 ? '🟢 K₂Cr₂O₇ turned GREEN (Cr³⁺ reduced by SO₂)' : '🟠 Acidified K₂Cr₂O₇ Strip', stripX + 22, stripY + 4);
    }

    ctx.restore();
  }

  drawWaftingHand(ctx) {
    const baseCX = this.width * 0.46;
    const baseCY = this.height * 0.86 - 12 - 90 - 25;
    const angleRad = -Math.PI / 4;
    const tubeLength = 220;

    const mouthX = baseCX + Math.cos(angleRad - Math.PI / 2) * tubeLength;
    const mouthY = baseCY + Math.sin(angleRad - Math.PI / 2) * tubeLength;

    const hx = mouthX + 45 + Math.sin(this.state.waftingTimer * 8) * 15;
    const hy = mouthY - 35;

    ctx.save();
    // Motion wave arcs towards user nose icon
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(hx - 20, hy, 28, -Math.PI * 0.35, Math.PI * 0.35);
    ctx.stroke();
    ctx.setLineDash([]);

    // Hand icon & label
    ctx.font = '24px sans-serif';
    ctx.fillText('👋', hx, hy);

    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0369A1';
    ctx.fillText('Wafting fumes gently towards nose...', hx - 50, hy - 25);
    ctx.restore();
  }

  drawSafetyPrecautionBanner(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(254, 242, 242, 0.92)';
    ctx.strokeStyle = '#FECACA';
    ctx.lineWidth = 1;

    const bw = Math.min(520, this.width - 32);
    const bx = (this.width - bw) / 2;
    const by = 14;

    ctx.beginPath();
    ctx.roundRect(bx, by, bw, 32, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#991B1B';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ NCERT Precaution: Never point mouth of boiling tube at yourself or classmates! Waft fumes gently.', this.width / 2, by + 20);
    ctx.restore();
  }
}

window.ReactionRenderer = ReactionRenderer;
