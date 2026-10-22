/**
 * Electrolysis & Electroplating — Canvas 2D Scientific Apparatus Renderer
 * Renders Hofmann Voltameter, Acidified Water Meniscus, Graduated Ticks,
 * Copper Electroplating Beaker, Cu2+ Ion Drift, and Splint Combustion SFX.
 */

class ElectrolysisRenderer {
  constructor(canvas, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = state;
    this.dpr = window.devicePixelRatio || 1;
    this.width = 800;
    this.height = 540;

    // Hit-testing bounding boxes for interactive canvas elements
    this.interactiveBounds = {
      h2Tap: null,
      o2Tap: null,
      splint: null
    };

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

    // 1. Draw soft laboratory bench background
    this.drawLabEnvironment(ctx);

    // 2. Render Apparatus based on active Mode
    if (this.state.mode === 'water_splitting') {
      this.drawHofmannVoltameter(ctx);
    } else {
      this.drawElectroplatingBath(ctx);
    }

    // 3. Draw Digital DC Power Supply Unit
    this.drawPowerSupply(ctx);

    // 4. Render Testing Splint & Chemical Flame Reactions
    this.drawSplintAndReactions(ctx);

    // 5. Draw In-Canvas Telemetry Badges & Stoichiometry Ratio
    this.drawCanvasHUD(ctx);
  }

  drawLabEnvironment(ctx) {
    // Soft light-blue study environment
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#F4F9FF');
    bgGrad.addColorStop(1, '#E6F2FF');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Lab bench surface
    const benchY = this.height * 0.88;
    ctx.fillStyle = '#D9E8F8';
    ctx.fillRect(0, benchY, this.width, this.height - benchY);
    ctx.strokeStyle = '#BDD5EA';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, benchY);
    ctx.lineTo(this.width, benchY);
    ctx.stroke();

    // Subtle laboratory stand clamp
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    const standX = this.width * 0.5;
    ctx.beginPath();
    ctx.moveTo(standX, benchY);
    ctx.lineTo(standX, this.height * 0.16);
    ctx.stroke();

    // Stand base
    ctx.fillStyle = '#64748B';
    ctx.fillRect(standX - 45, benchY - 6, 90, 8);
  }

  drawHofmannVoltameter(ctx) {
    const cx = this.width * 0.5;
    const colSpacing = Math.min(130, this.width * 0.18);
    const h2X = cx - colSpacing;
    const o2X = cx + colSpacing;
    const tubeW = Math.min(48, this.width * 0.065);
    const topY = this.height * 0.18;
    const bottomY = this.height * 0.78;
    const tubeH = bottomY - topY;

    // Save tap bounds for interactive clicks
    this.interactiveBounds.h2Tap = {
      x: h2X - 25, y: topY - 30, w: 50, h: 30, gas: 'hydrogen'
    };
    this.interactiveBounds.o2Tap = {
      x: o2X - 25, y: topY - 30, w: 50, h: 30, gas: 'oxygen'
    };

    // Calculate meniscus liquid levels from accumulated gas volume
    const h2Fraction = Math.min(1.0, this.state.h2Volume / this.state.maxTubeCapacity);
    const o2Fraction = Math.min(1.0, this.state.o2Volume / this.state.maxTubeCapacity);

    const h2MeniscusY = topY + 20 + h2Fraction * (tubeH - 50);
    const o2MeniscusY = topY + 20 + o2Fraction * (tubeH - 50);

    // 1. Draw central thistle funnel & cross connecting tubes
    ctx.fillStyle = 'rgba(215, 238, 255, 0.75)';
    ctx.strokeStyle = 'rgba(90, 140, 190, 0.65)';
    ctx.lineWidth = 3;

    // Cross tubes at bottom connecting columns to central bulb
    ctx.beginPath();
    ctx.rect(h2X, bottomY - 35, colSpacing * 2, 28);
    ctx.fill();
    ctx.stroke();

    // Central reservoir bulb & tube
    ctx.beginPath();
    ctx.arc(cx, topY + 65, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(cx - 12, topY + 100, 24, bottomY - 35 - (topY + 100));
    ctx.fill();
    ctx.stroke();

    // Funnel top
    ctx.beginPath();
    ctx.moveTo(cx - 26, topY + 18);
    ctx.lineTo(cx + 26, topY + 18);
    ctx.lineTo(cx + 14, topY + 40);
    ctx.lineTo(cx - 14, topY + 40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Draw Left Column (Cathode - H₂)
    this.drawGraduatedColumn(ctx, h2X, topY, tubeW, tubeH, h2MeniscusY, 'H₂ (Cathode / −)', '#2563EB', this.state.h2Volume);

    // 3. Draw Right Column (Anode - O₂)
    this.drawGraduatedColumn(ctx, o2X, topY, tubeW, tubeH, o2MeniscusY, 'O₂ (Anode / +)', '#DC2626', this.state.o2Volume);

    // 4. Draw Rising Gas Bubbles
    this.drawBubbles(ctx, h2X, o2X, bottomY);

    // 5. Draw Platinum Electrodes & Wiring
    this.drawElectrodeAssembly(ctx, h2X, bottomY, 'cathode', '#2563EB');
    this.drawElectrodeAssembly(ctx, o2X, bottomY, 'anode', '#DC2626');

    // 6. Draw Stopcock Taps at the top of each tube
    this.drawStopcock(ctx, h2X, topY, 'H₂ Tap (Cathode)', this.interactiveBounds.h2Tap);
    this.drawStopcock(ctx, o2X, topY, 'O₂ Tap (Anode)', this.interactiveBounds.o2Tap);
  }

  drawGraduatedColumn(ctx, x, topY, w, h, meniscusY, label, accentColor, volumeML) {
    const halfW = w / 2;

    // Gas collection pocket (clear gas above meniscus)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(x - halfW, topY, w, meniscusY - topY);

    // Acidified aqueous solution (translucent light blue)
    const liquidGrad = ctx.createLinearGradient(x - halfW, topY, x + halfW, topY + h);
    liquidGrad.addColorStop(0, 'rgba(165, 218, 255, 0.70)');
    liquidGrad.addColorStop(1, 'rgba(130, 195, 245, 0.85)');
    ctx.fillStyle = liquidGrad;
    ctx.fillRect(x - halfW, meniscusY, w, topY + h - meniscusY);

    // Curved meniscus surface
    ctx.fillStyle = 'rgba(110, 180, 235, 0.9)';
    ctx.beginPath();
    ctx.ellipse(x, meniscusY, halfW, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glass tube borders
    ctx.strokeStyle = 'rgba(70, 130, 180, 0.8)';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - halfW, topY, w, h);

    // Graduation tick marks
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const numTicks = 8;
    for (let i = 0; i <= numTicks; i++) {
      const ty = topY + 20 + (i / numTicks) * (h - 50);
      const isMajor = i % 2 === 0;
      const tickLen = isMajor ? 12 : 7;
      const mlVal = (i * 5).toFixed(0);

      ctx.strokeStyle = 'rgba(30, 70, 110, 0.65)';
      ctx.lineWidth = isMajor ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(x + halfW, ty);
      ctx.lineTo(x + halfW - tickLen, ty);
      ctx.stroke();

      if (isMajor) {
        ctx.fillStyle = '#1E3A8A';
        ctx.fillText(`${mlVal}`, x + halfW - tickLen - 3, ty);
      }
    }

    // Column Header Tag
    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = accentColor;
    ctx.fillText(label, x, topY - 38);

    // Real-time Volume Pill
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    const badgeW = 74;
    const badgeH = 22;
    ctx.beginPath();
    ctx.roundRect(x - badgeW / 2, topY + h + 12, badgeW, badgeH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillStyle = accentColor;
    ctx.fillText(`${volumeML.toFixed(1)} mL`, x, topY + h + 24);
  }

  drawStopcock(ctx, x, topY, title, bounds) {
    // Valve body
    ctx.fillStyle = '#CBD5E1';
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - 8, topY - 18, 16, 18, 2);
    ctx.fill();
    ctx.stroke();

    // Valve handle (crossbar)
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.roundRect(x - 18, topY - 26, 36, 8, 4);
    ctx.fill();
    ctx.stroke();

    // Tap highlight if hovered or active
    ctx.fillStyle = 'rgba(2, 132, 199, 0.15)';
    ctx.strokeStyle = '#0284C7';
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
    ctx.setLineDash([]);
  }

  drawElectrodeAssembly(ctx, x, bottomY, type, wireColor) {
    // Rubber stopper
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(x - 20, bottomY);
    ctx.lineTo(x + 20, bottomY);
    ctx.lineTo(x + 14, bottomY + 22);
    ctx.lineTo(x - 14, bottomY + 22);
    ctx.closePath();
    ctx.fill();

    // Platinum electrode wire & foil inside tube
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, bottomY + 18);
    ctx.lineTo(x, bottomY - 32);
    ctx.stroke();

    // Platinum foil rectangle
    ctx.fillStyle = '#64748B';
    ctx.fillRect(x - 6, bottomY - 32, 12, 16);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 6, bottomY - 32, 12, 16);

    // Circuit Lead Wire to Power Supply
    ctx.strokeStyle = wireColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, bottomY + 22);
    ctx.bezierCurveTo(x, bottomY + 50, this.width * 0.18, bottomY + 45, this.width * 0.18, this.height * 0.72);
    ctx.stroke();
  }

  drawBubbles(ctx, h2X, o2X, bottomY) {
    for (const b of this.state.bubbles) {
      const colX = b.tube === 'h2' ? h2X : o2X;
      const bx = colX + b.xOffset + Math.sin(b.driftPhase) * 2.5;
      const by = this.height * b.yNorm;

      ctx.beginPath();
      ctx.arc(bx, by, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = b.tube === 'h2' ? 'rgba(235, 245, 255, 0.85)' : 'rgba(225, 240, 255, 0.80)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(100, 160, 220, 0.9)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Bubble specular highlight
      ctx.beginPath();
      ctx.arc(bx - b.radius * 0.35, by - b.radius * 0.35, b.radius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    }
  }

  drawElectroplatingBath(ctx) {
    const cx = this.width * 0.52;
    const cy = this.height * 0.52;
    const beakerW = Math.min(360, this.width * 0.48);
    const beakerH = 260;
    const beakerL = cx - beakerW / 2;
    const beakerR = cx + beakerW / 2;
    const beakerBottom = cy + beakerH / 2;
    const beakerTop = cy - beakerH / 2;

    // 1. Borosilicate Beaker Body
    ctx.strokeStyle = 'rgba(70, 130, 190, 0.85)';
    ctx.lineWidth = 4;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.moveTo(beakerL - 10, beakerTop);
    ctx.lineTo(beakerL, beakerTop);
    ctx.lineTo(beakerL, beakerBottom - 16);
    ctx.arcTo(beakerL, beakerBottom, beakerL + 16, beakerBottom, 16);
    ctx.lineTo(beakerR - 16, beakerBottom);
    ctx.arcTo(beakerR, beakerBottom, beakerR, beakerBottom - 16, 16);
    ctx.lineTo(beakerR, beakerTop);
    ctx.lineTo(beakerR + 10, beakerTop);
    ctx.stroke();
    ctx.fill();

    // 2. Copper(II) Sulfate Solution (Vibrant Deep Cyan / Blue)
    const solTop = beakerTop + 45;
    const cuGrad = ctx.createLinearGradient(beakerL, solTop, beakerL, beakerBottom);
    cuGrad.addColorStop(0, 'rgba(14, 165, 233, 0.65)'); // Luminous blue
    cuGrad.addColorStop(1, 'rgba(2, 132, 199, 0.85)');
    ctx.fillStyle = cuGrad;
    ctx.beginPath();
    ctx.rect(beakerL + 4, solTop, beakerW - 8, beakerBottom - solTop - 4);
    ctx.fill();

    // Solution Meniscus
    ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.beginPath();
    ctx.ellipse(cx, solTop, beakerW / 2 - 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Beaker graduation markings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#FFFFFF';
    for (let ml = 100; ml <= 400; ml += 100) {
      const gy = beakerBottom - ((ml / 500) * (beakerH - 60));
      ctx.beginPath();
      ctx.moveTo(beakerL + 6, gy);
      ctx.lineTo(beakerL + 22, gy);
      ctx.stroke();
      ctx.fillText(`${ml} mL`, beakerL + 26, gy + 3);
    }

    // 3. Copper Anode Plate (Pure Cu, Left)
    const anodeX = cx - beakerW * 0.28;
    const anodeY = solTop - 30;
    const anodeW = 32;
    const anodeH = 180;

    const cuMetalGrad = ctx.createLinearGradient(anodeX - anodeW / 2, anodeY, anodeX + anodeW / 2, anodeY);
    cuMetalGrad.addColorStop(0, '#B45309');
    cuMetalGrad.addColorStop(0.5, '#EA580C');
    cuMetalGrad.addColorStop(1, '#9A3412');
    ctx.fillStyle = cuMetalGrad;
    ctx.fillRect(anodeX - anodeW / 2, anodeY, anodeW, anodeH);
    ctx.strokeStyle = '#7C2D12';
    ctx.lineWidth = 2;
    ctx.strokeRect(anodeX - anodeW / 2, anodeY, anodeW, anodeH);

    // Anode label
    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#B45309';
    ctx.textAlign = 'center';
    ctx.fillText('Pure Cu Anode (+)', anodeX, anodeY - 14);

    // 4. Iron Key Cathode (Right)
    const cathodeX = cx + beakerW * 0.28;
    const keyY = solTop + 35;
    this.drawKeyCathode(ctx, cathodeX, keyY);

    // 5. Cu2+ Ion Drift Particles
    ctx.fillStyle = '#38BDF8';
    for (const ion of this.state.ions) {
      const ix = beakerL + ion.xNorm * beakerW;
      const iy = solTop + ion.yNorm * (beakerH - 70);

      ctx.beginPath();
      ctx.arc(ix, iy, ion.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56, 189, 248, ${ion.alpha})`;
      ctx.fill();

      // Glow halo
      ctx.beginPath();
      ctx.arc(ix, iy, ion.radius * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(186, 230, 253, ${ion.alpha * 0.4})`;
      ctx.fill();
    }

    // 6. Connect Circuit Lead Wires
    ctx.strokeStyle = '#DC2626'; // Red Anode Wire
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(anodeX, anodeY);
    ctx.bezierCurveTo(anodeX, anodeY - 40, this.width * 0.18, beakerTop - 20, this.width * 0.18, this.height * 0.72);
    ctx.stroke();

    ctx.strokeStyle = '#2563EB'; // Blue/Black Cathode Wire
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cathodeX, keyY - 25);
    ctx.bezierCurveTo(cathodeX, keyY - 60, this.width * 0.15, beakerTop - 40, this.width * 0.15, this.height * 0.72);
    ctx.stroke();
  }

  drawKeyCathode(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Suspension alligator clip
    ctx.fillStyle = '#64748B';
    ctx.fillRect(-6, -35, 12, 25);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-6, -35, 12, 25);

    // Key base metallic colors (Gray iron transitioning to reddish Cu as mass accumulates)
    const platingRatio = Math.min(1.0, this.state.cuMassPlated / 40.0);
    const keySteel = '#94A3B8';
    const cuRed = '#C2410C';

    // Head of the key (ring)
    ctx.lineWidth = 7;
    ctx.strokeStyle = platingRatio > 0.1 ? cuRed : keySteel;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.stroke();

    // Key shaft
    ctx.fillStyle = platingRatio > 0.1 ? cuRed : keySteel;
    ctx.fillRect(-4, 16, 8, 70);

    // Key wards (teeth)
    ctx.fillRect(4, 52, 16, 7);
    ctx.fillRect(4, 68, 12, 8);

    // Lustrous copper plating highlight if plated
    if (platingRatio > 0.05) {
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.7)';
      ctx.lineWidth = 2;
      ctx.strokeRect(-5, 15, 10, 72);
    }

    ctx.restore();

    // Cathode title & Real-time mass readout
    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#1E3A8A';
    ctx.textAlign = 'center';
    ctx.fillText('Iron Key Cathode (−)', x, y - 44);

    // Live Deposited Mass Tag
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#C2410C';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x - 55, y + 105, 110, 24, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#C2410C';
    ctx.fillText(`+${this.state.cuMassPlated.toFixed(2)} mg Cu`, x, y + 121);
  }

  drawPowerSupply(ctx) {
    const pwX = Math.min(160, this.width * 0.18);
    const pwY = this.height * 0.74;
    const pwW = 140;
    const pwH = 95;

    // Chassis
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(pwX - pwW / 2, pwY - pwH / 2, pwW, pwH, 8);
    ctx.fill();
    ctx.stroke();

    // Digital LED Display (Green V & A)
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(pwX - pwW / 2 + 10, pwY - pwH / 2 + 10, pwW - 20, 36);

    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = this.state.powerOn ? '#22C55E' : '#475569';
    ctx.fillText(`${this.state.voltage.toFixed(1)} V`, pwX - pwW / 2 + 16, pwY - pwH / 2 + 25);

    ctx.textAlign = 'right';
    ctx.fillText(`${this.state.current.toFixed(2)} A`, pwX + pwW / 2 - 16, pwY - pwH / 2 + 25);

    ctx.font = '9px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.textAlign = 'center';
    ctx.fillText('DC REGULATED SUPPLY', pwX, pwY - pwH / 2 + 40);

    // Binding posts (+ / -)
    // Red (+) Anode post
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(pwX + 32, pwY + 24, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 10px monospace';
    ctx.fillText('+', pwX + 32, pwY + 27);

    // Blue/Black (-) Cathode post
    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.arc(pwX - 32, pwY + 24, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 10px monospace';
    ctx.fillText('−', pwX - 32, pwY + 27);

    // Power indicator LED
    ctx.fillStyle = this.state.powerOn ? '#22C55E' : '#DC2626';
    ctx.beginPath();
    ctx.arc(pwX, pwY + 24, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawSplintAndReactions(ctx) {
    if (this.state.mode !== 'water_splitting') return;

    // 1. Draw Active Splint Reaction (Burst/Relight)
    if (this.state.splintTestActive === 'hydrogen') {
      const tap = this.interactiveBounds.h2Tap;
      const rx = tap.x + tap.w / 2;
      const ry = tap.y;

      // Pale blue pop flame & blast radius
      const blastGrad = ctx.createRadialGradient(rx, ry, 2, rx, ry, 55);
      blastGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      blastGrad.addColorStop(0.3, 'rgba(147, 197, 253, 0.85)');
      blastGrad.addColorStop(0.7, 'rgba(59, 130, 246, 0.5)');
      blastGrad.addColorStop(1, 'rgba(37, 99, 235, 0.0)');
      ctx.fillStyle = blastGrad;
      ctx.beginPath();
      ctx.arc(rx, ry, 55, 0, Math.PI * 2);
      ctx.fill();

      // Squeaky POP text callout
      ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#1D4ED8';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ SQUEAKY POP!', rx, ry - 35);
    } else if (this.state.splintTestActive === 'oxygen') {
      const tap = this.interactiveBounds.o2Tap;
      const rx = tap.x + tap.w / 2;
      const ry = tap.y;

      // Vigorous yellow flame reignition
      const flameGrad = ctx.createRadialGradient(rx, ry, 2, rx, ry, 48);
      flameGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      flameGrad.addColorStop(0.3, 'rgba(253, 224, 71, 0.9)');
      flameGrad.addColorStop(0.65, 'rgba(249, 115, 22, 0.6)');
      flameGrad.addColorStop(1, 'rgba(220, 38, 38, 0.0)');
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.arc(rx, ry, 48, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#C2410C';
      ctx.textAlign = 'center';
      ctx.fillText('🔥 FLAME RELIGHT!', rx, ry - 35);
    }
  }

  drawCanvasHUD(ctx) {
    // Top Stoichiometric Ratio Pill
    if (this.state.mode === 'water_splitting') {
      const hudW = 260;
      const hudH = 36;
      const hudX = this.width * 0.5 - hudW / 2;
      const hudY = 16;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.90)';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(hudX, hudY, hudW, hudH, 18);
      ctx.fill();
      ctx.stroke();

      const ratio = this.state.o2Volume > 0.05
        ? (this.state.h2Volume / this.state.o2Volume).toFixed(2)
        : '2.00';

      ctx.font = '700 12px "JetBrains Mono", monospace';
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Ratio V(H₂) : V(O₂) = ${ratio} : 1.00`, hudX + hudW / 2, hudY + hudH / 2);
    } else {
      // Electroplating HUD: Faraday's Constant & Deposition Rate
      const hudW = 280;
      const hudH = 36;
      const hudX = this.width * 0.5 - hudW / 2;
      const hudY = 16;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.90)';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(hudX, hudY, hudW, hudH, 18);
      ctx.fill();
      ctx.stroke();

      ctx.font = '700 12px "JetBrains Mono", monospace';
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Key Mass: ${(this.state.initialKeyMass + this.state.cuMassPlated / 1000).toFixed(4)} g`, hudX + hudW / 2, hudY + hudH / 2);
    }
  }
}

window.ElectrolysisRenderer = ElectrolysisRenderer;
