/**
 * Flame Test — Canvas 2D Renderer
 * Renders the laboratory bench, precision Bunsen burner apparatus,
 * fluid buoyant flame particles, glowing nichrome loop, cobalt blue glass filter,
 * watch glasses with chemical crystal powders, and calibrated quantum spectroscope.
 */

class FlameRenderer {
  constructor(canvas, state, engine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = state;
    this.engine = engine;

    this.width = 900;
    this.height = 540;
    this.dpr = 1;

    // Interactive Loop Dragging
    this.isDraggingLoop = false;
    this.dragOffset = { x: 0, y: 0 };

    this.bindEvents();
    this.resize();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.width = Math.max(340, rect.width);
    this.height = Math.max(360, rect.height);

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  bindEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const onDown = (e) => {
      const pos = getPos(e);
      const burnerX = this.width * 0.42;
      const burnerY = this.height * 0.68;
      const loopPos = this.getLoopScreenCoords(burnerX, burnerY);

      const dist = Math.hypot(pos.x - loopPos.x, pos.y - loopPos.y);
      if (dist < 45) {
        this.isDraggingLoop = true;
        this.dragOffset = { x: pos.x - loopPos.x, y: pos.y - loopPos.y };
        this.canvas.style.cursor = 'grabbing';
      }
    };

    const onMove = (e) => {
      const pos = getPos(e);
      const burnerX = this.width * 0.42;
      const burnerY = this.height * 0.68;
      const loopPos = this.getLoopScreenCoords(burnerX, burnerY);

      if (this.isDraggingLoop) {
        const dx = pos.x - this.dragOffset.x - burnerX;
        const dy = pos.y - this.dragOffset.y - burnerY;
        this.state.loopPos = { x: dx, y: dy };

        // Test if loop is in flame zone
        const inFlame = (Math.abs(dx) < 32 && dy > -190 && dy < -50);
        this.state.setLoopInFlame(inFlame);
      } else {
        const dist = Math.hypot(pos.x - loopPos.x, pos.y - loopPos.y);
        this.canvas.style.cursor = dist < 45 ? 'grab' : 'crosshair';
      }
    };

    const onUp = () => {
      this.isDraggingLoop = false;
      this.canvas.style.cursor = 'crosshair';
    };

    this.canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    this.canvas.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
  }

  getLoopScreenCoords(burnerX, burnerY) {
    if (this.state.isLoopInFlame && !this.isDraggingLoop) {
      // Resting position in the hottest flame zone (just above the inner cone)
      return { x: burnerX + 6, y: burnerY - 110 };
    }
    return {
      x: burnerX + this.state.loopPos.x,
      y: burnerY + this.state.loopPos.y
    };
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Soft Light-Blue Study Environment Backdrop
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, w, h);

    this.drawBackgroundGrid(ctx, w, h);

    // Apparatus Positioning
    const benchY = h * 0.82;
    const burnerX = w * 0.42;
    const burnerY = benchY - 12;

    // 2. Laboratory Bench Surface
    this.drawLabBench(ctx, w, h, benchY);

    // 3. Watch Glasses & Chemical Salt Dishes
    this.drawWatchGlasses(ctx, w, benchY);

    // 4. Precision Bunsen Burner Apparatus
    this.drawBunsenBurner(ctx, burnerX, burnerY);

    // 5. Buoyant Convective Flame (Multi-Zone Thermal Physics)
    if (this.state.isLit && this.state.gasValve > 5) {
      this.drawFlame(ctx, burnerX, burnerY - 128);
    }

    // 6. Interactive Nichrome Wire Loop & Glass Rod
    const loopPos = this.getLoopScreenCoords(burnerX, burnerY);
    this.drawNichromeLoop(ctx, loopPos.x, loopPos.y);

    // 7. Cobalt Blue Glass Filter Overlay
    if (this.state.useCobaltGlass) {
      this.drawCobaltGlassOverlay(ctx, w, h);
    }

    // 8. Optical Spectroscope & Wavelength Analyzer HUD
    if (this.state.spectroscopeOpen) {
      this.drawSpectroscopeHUD(ctx, w, h);
    }

    // 9. Telemetry HUD Tags
    this.drawTelemetryBadges(ctx, w, h);
  }

  drawBackgroundGrid(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.45)';
    ctx.lineWidth = 1;
    const step = 28;
    ctx.beginPath();
    for (let x = step; x < w; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = step; y < h; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  drawLabBench(ctx, w, h, benchY) {
    ctx.save();
    // Phenolic resin heat-resistant lab benchtop
    const benchGrad = ctx.createLinearGradient(0, benchY, 0, h);
    benchGrad.addColorStop(0, '#CBD5E1');
    benchGrad.addColorStop(0.12, '#E2E8F0');
    benchGrad.addColorStop(1, '#94A3B8');

    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, benchY, w, h - benchY);

    // Top beveled edge highlight
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(w, benchY);
    ctx.stroke();

    // Dark under-edge drop shadow
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, benchY + 8);
    ctx.lineTo(w, benchY + 8);
    ctx.stroke();

    ctx.restore();
  }

  drawWatchGlasses(ctx, w, benchY) {
    ctx.save();
    const elem = this.state.getActiveElementData();
    const salts = [
      { id: 'hcl', label: 'Conc. HCl Wash', color: '#E0F2FE', isLiquid: true },
      { id: 'na', label: 'NaCl (Na⁺)', color: '#FFFFFF' },
      { id: 'k', label: 'KCl (K⁺)', color: '#F1F5F9' },
      { id: 'cu', label: 'CuCl₂ (Cu²⁺)', color: '#06B6D4' },
      { id: 'sr', label: 'SrCl₂ (Sr²⁺)', color: '#FFFFFF' }
    ];

    const startX = 24;
    const spacing = Math.min(84, (w * 0.32) / salts.length);

    salts.forEach((s, idx) => {
      const gx = startX + idx * spacing;
      const gy = benchY + 36;
      const isSelected = (this.state.activeSalt === s.id);

      // Glass watch dish rim
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.strokeStyle = isSelected ? '#0284C7' : '#94A3B8';
      ctx.lineWidth = isSelected ? 2.5 : 1.2;

      ctx.beginPath();
      ctx.ellipse(gx, gy, 26, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Chemical powder deposit inside dish
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.ellipse(gx, gy - 2, 16, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Label below dish
      ctx.font = `600 10px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = isSelected ? '#0369A1' : '#475569';
      ctx.textAlign = 'center';
      ctx.fillText(s.label, gx, gy + 22);
    });

    ctx.restore();
  }

  drawBunsenBurner(ctx, bx, by) {
    ctx.save();
    // 1. Cast-Iron Triangular Base
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.moveTo(bx - 44, by);
    ctx.lineTo(bx + 44, by);
    ctx.lineTo(bx + 32, by - 14);
    ctx.lineTo(bx - 32, by - 14);
    ctx.closePath();
    ctx.fill();

    // Rubber feet
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(bx - 46, by - 3, 12, 4);
    ctx.fillRect(bx + 34, by - 3, 12, 4);

    // 2. Gas Inlet Spigot & Flexible Rubber Hose
    ctx.fillStyle = '#D97706'; // Brass fitting
    ctx.fillRect(bx - 32, by - 26, 16, 8);

    // Orange ribbed gas tubing heading off-screen
    ctx.strokeStyle = '#F97316';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(bx - 28, by - 22);
    ctx.bezierCurveTo(bx - 80, by - 20, bx - 110, by + 12, bx - 140, by + 14);
    ctx.stroke();

    // 3. Brass Air-Control Collar
    const collarY = by - 38;
    const collarH = 20;
    const collarW = 24;

    const brassGrad = ctx.createLinearGradient(bx - collarW * 0.5, 0, bx + collarW * 0.5, 0);
    brassGrad.addColorStop(0, '#B45309');
    brassGrad.addColorStop(0.35, '#FDE68A');
    brassGrad.addColorStop(0.7, '#D97706');
    brassGrad.addColorStop(1, '#92400E');

    ctx.fillStyle = brassGrad;
    ctx.fillRect(bx - collarW * 0.5, collarY, collarW, collarH);

    // Air Hole Aperture (Opens as airCollar increases)
    const airHoleW = 10 * this.state.airCollar;
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.ellipse(bx, collarY + collarH * 0.5, airHoleW * 0.5, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Nickel-Plated Steel Barrel Column
    const barrelTopY = by - 128;
    const barrelH = 90;
    const barrelW = 18;

    const steelGrad = ctx.createLinearGradient(bx - barrelW * 0.5, 0, bx + barrelW * 0.5, 0);
    steelGrad.addColorStop(0, '#64748B');
    steelGrad.addColorStop(0.25, '#F8FAFC');
    steelGrad.addColorStop(0.55, '#CBD5E1');
    steelGrad.addColorStop(0.85, '#94A3B8');
    steelGrad.addColorStop(1, '#475569');

    ctx.fillStyle = steelGrad;
    ctx.fillRect(bx - barrelW * 0.5, barrelTopY, barrelW, barrelH);

    // Machine Knurled Nozzle Ring at top rim
    ctx.fillStyle = '#334155';
    ctx.fillRect(bx - barrelW * 0.5 - 2, barrelTopY, barrelW + 4, 6);

    ctx.restore();
  }

  drawFlame(ctx, bx, topRimY) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const valve = this.state.gasValve / 100;
    const air = this.state.airCollar;
    const elem = this.state.getActiveElementData();
    const hasActiveSalt = (this.state.isLoopInFlame && this.state.activeSalt !== 'none' && this.state.saltAmount > 0.05);

    // 1. Draw Thermal Micro-Particles
    for (const p of this.engine.particles) {
      const alpha = p.getAlpha() * (0.35 + valve * 0.45);
      const [r, g, b] = p.colorRgb;

      const grad = ctx.createRadialGradient(bx + p.x, topRimY + p.y, 0, bx + p.x, topRimY + p.y, p.size);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bx + p.x, topRimY + p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. High-Temperature Inner Cone (Roaring Non-Luminous Core)
    if (air >= 0.35) {
      const coneH = 34 + valve * 28;
      const coneW = 10;

      const coneGrad = ctx.createLinearGradient(0, topRimY, 0, topRimY - coneH);
      coneGrad.addColorStop(0, 'rgba(6, 182, 212, 0.90)'); // Bright Cyan
      coneGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.75)');
      coneGrad.addColorStop(1, 'rgba(59, 130, 246, 0.15)');

      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(bx - coneW * 0.5, topRimY);
      ctx.quadraticCurveTo(bx - coneW * 0.4, topRimY - coneH * 0.5, bx, topRimY - coneH);
      ctx.quadraticCurveTo(bx + coneW * 0.4, topRimY - coneH * 0.5, bx + coneW * 0.5, topRimY);
      ctx.closePath();
      ctx.fill();
    }

    // 3. Ionized Metal Flame Core Glow
    if (hasActiveSalt) {
      const glowR = 36 + valve * 30;
      const [sr, sg, sb] = elem.rgbGlow || [250, 204, 21];

      const saltGrad = ctx.createRadialGradient(bx, topRimY - 60, 4, bx, topRimY - 60, glowR);
      saltGrad.addColorStop(0, `rgba(${sr}, ${sg}, ${sb}, 0.85)`);
      saltGrad.addColorStop(0.6, `rgba(${sr}, ${sg}, ${sb}, 0.45)`);
      saltGrad.addColorStop(1, `rgba(${sr}, ${sg}, ${sb}, 0)`);

      ctx.fillStyle = saltGrad;
      ctx.beginPath();
      ctx.arc(bx, topRimY - 60, glowR, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawNichromeLoop(ctx, lx, ly) {
    ctx.save();
    // Glass holding rod handle
    const handleW = 10;
    const handleL = 160;

    const glassGrad = ctx.createLinearGradient(lx + 20, ly - handleW * 0.5, lx + 20, ly + handleW * 0.5);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    glassGrad.addColorStop(0.5, 'rgba(203, 213, 225, 0.4)');
    glassGrad.addColorStop(1, 'rgba(148, 163, 184, 0.9)');

    ctx.fillStyle = glassGrad;
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1;
    ctx.fillRect(lx + 70, ly - handleW * 0.5, handleL, handleW);
    ctx.strokeRect(lx + 70, ly - handleW * 0.5, handleL, handleW);

    // Brass chuck connector
    ctx.fillStyle = '#D97706';
    ctx.fillRect(lx + 58, ly - 6, 12, 12);

    // Nichrome wire stem
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(lx + 58, ly);
    ctx.lineTo(lx + 10, ly);
    ctx.stroke();

    // Circular loop sampling tip
    const loopRadius = 8;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(lx, ly, loopRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Incandescent Wire Glow (Temperature Dependent)
    const glowColor = this.engine.getLoopGlowColor();
    if (glowColor) {
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(lx, ly, loopRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowColor = 'transparent';
    }

    // Salt crystal bead inside loop
    if (this.state.activeSalt !== 'none' && this.state.saltAmount > 0.05) {
      const elem = this.state.getActiveElementData();
      ctx.fillStyle = elem.hexCore || '#FFFFFF';
      ctx.beginPath();
      ctx.arc(lx, ly, loopRadius * 0.55 * this.state.saltAmount, 0, Math.PI * 2);
      ctx.fill();
    }

    // Loop interaction label hint
    if (!this.isDraggingLoop) {
      ctx.font = `600 11px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = '#0369A1';
      ctx.textAlign = 'center';
      ctx.fillText('Drag Loop into Flame', lx + 20, ly - 22);
    }

    ctx.restore();
  }

  drawCobaltGlassOverlay(ctx, w, h) {
    ctx.save();
    // Translucent Cobalt Blue (Co²⁺ silicate glass)
    ctx.fillStyle = 'rgba(30, 58, 138, 0.52)';
    ctx.fillRect(0, 0, w, h);

    // Glass sheen reflections
    const sheen = ctx.createLinearGradient(0, 0, w, h);
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    sheen.addColorStop(0.3, 'rgba(255, 255, 255, 0.02)');
    sheen.addColorStop(0.65, 'rgba(255, 255, 255, 0.12)');
    sheen.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);

    // Glass Bevel Rim Indicator
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, w - 6, h - 6);

    // Badge in top center
    ctx.font = `700 12px 'JetBrains Mono', monospace`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('👓 COBALT BLUE GLASS ACTIVE (Na⁺ 589 nm Yellow Absorption Filter)', w * 0.5, 24);

    ctx.restore();
  }

  drawSpectroscopeHUD(ctx, w, h) {
    ctx.save();
    const elem = this.state.getActiveElementData();
    const hasActiveSalt = (this.state.isLoopInFlame && this.state.activeSalt !== 'none' && this.state.saltAmount > 0.05);

    // Top-right floating glassmorphic Spectroscope Card
    const cardW = Math.min(380, w * 0.44);
    const cardH = 92;
    const cardX = w - cardW - 16;
    const cardY = 16;

    // Card backdrop
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    this.roundRect(ctx, cardX, cardY, cardW, cardH, 8);
    ctx.fill();
    ctx.stroke();

    // Spectroscope Title & Live Wavelength
    ctx.font = `700 11px 'JetBrains Mono', monospace`;
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'left';
    ctx.fillText('QUANTUM EMISSION SPECTROSCOPE', cardX + 12, cardY + 18);

    if (hasActiveSalt && elem.dominantWavelength) {
      ctx.fillStyle = '#059669';
      ctx.textAlign = 'right';
      ctx.fillText(`λ = ${elem.dominantWavelength} nm | ${elem.photonEnergyEV} eV`, cardX + cardW - 12, cardY + 18);
    } else {
      ctx.fillStyle = '#64748B';
      ctx.textAlign = 'right';
      ctx.fillText('No discrete lines', cardX + cardW - 12, cardY + 18);
    }

    // Spectral Dispersion Bar (380 nm to 750 nm)
    const specX = cardX + 12;
    const specY = cardY + 28;
    const specW = cardW - 24;
    const specH = 26;

    // Background dark optical diffraction scale
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(specX, specY, specW, specH);

    // Continuous baseline rainbow (faint)
    const rainbow = ctx.createLinearGradient(specX, 0, specX + specW, 0);
    rainbow.addColorStop(0.00, 'rgba(147, 51, 234, 0.15)'); // 380 nm Violet
    rainbow.addColorStop(0.18, 'rgba(59, 130, 246, 0.15)');  // 450 nm Blue
    rainbow.addColorStop(0.38, 'rgba(16, 185, 129, 0.15)'); // 520 nm Green
    rainbow.addColorStop(0.56, 'rgba(234, 179, 8, 0.15)');  // 590 nm Yellow
    rainbow.addColorStop(0.72, 'rgba(249, 115, 22, 0.15)'); // 650 nm Orange
    rainbow.addColorStop(1.00, 'rgba(239, 68, 68, 0.15)');  // 750 nm Red

    ctx.fillStyle = rainbow;
    ctx.fillRect(specX, specY, specW, specH);

    // Wavelength Axis Ticks (400, 500, 600, 700 nm)
    ctx.font = `600 9px 'JetBrains Mono', monospace`;
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'center';

    const nmToX = (nm) => specX + ((nm - 380) / (750 - 380)) * specW;

    [400, 500, 600, 700].forEach(nm => {
      const tx = nmToX(nm);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tx, specY);
      ctx.lineTo(tx, specY + specH);
      ctx.stroke();
      ctx.fillText(`${nm}`, tx, specY + specH + 12);
    });

    // 3. Render Discrete Quantum Emission Lines
    if (hasActiveSalt && elem.spectralLines) {
      for (const line of elem.spectralLines) {
        if (line.nm < 380 || line.nm > 750) continue;

        // Cobalt glass absorption for Sodium
        if (this.state.useCobaltGlass && elem.id === 'na') continue;

        const lx = nmToX(line.nm);
        ctx.strokeStyle = line.color;
        ctx.lineWidth = Math.max(2, line.intensity * 3.5);
        ctx.shadowColor = line.color;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(lx, specY);
        ctx.lineTo(lx, specY + specH);
        ctx.stroke();

        ctx.shadowColor = 'transparent';
      }
    }

    ctx.restore();
  }

  drawTelemetryBadges(ctx, w, h) {
    ctx.save();
    const elem = this.state.getActiveElementData();

    // Top-left Flame Status Badge
    ctx.font = `700 11px 'JetBrains Mono', monospace`;
    const tempText = `Flame Temp: ${Math.round(this.state.loopTemp)}°C`;
    const tw = ctx.measureText(tempText).width;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    this.roundRect(ctx, 16, 16, tw + 20, 26, 6);
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = this.state.loopTemp > 800 ? '#EA580C' : '#0284C7';
    ctx.fillText(tempText, 26, 33);

    // Active Element Badge
    const elemText = this.state.mysteryMode ? `Sample: Unknown Cation` : `Salt: ${elem.name} (${elem.formula})`;
    const etw = ctx.measureText(elemText).width;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    this.roundRect(ctx, 16, 48, etw + 20, 26, 6);
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.fillText(elemText, 26, 65);

    ctx.restore();
  }

  roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

window.FlameRenderer = FlameRenderer;
