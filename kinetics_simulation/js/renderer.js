/**
 * Reaction Kinetics — Canvas 2D Renderer
 * Renders the laboratory bench, white ceramic tile with bold black cross ("X"),
 * borosilicate Erlenmeyer flask, spinning magnetic stir bar, colloidal sulfur turbidity,
 * optical transmittance photometer, and live analytical kinetics curves.
 */

class KineticsRenderer {
  constructor(canvas, state, engine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = state;
    this.engine = engine;

    this.width = 900;
    this.height = 540;
    this.dpr = 1;

    this.stirAngle = 0;

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
    // Optional click on flask to toggle stirring or start reaction
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const flaskX = this.width * 0.32;
      const flaskY = this.height * 0.52;
      const dist = Math.hypot(x - flaskX, y - flaskY);

      if (dist < 110) {
        if (this.state.status === 'idle') {
          this.state.startReaction();
          if (window.kineticsSound) {
            window.kineticsSound.playPourSound();
            window.kineticsSound.startStirrerHum();
          }
        } else if (this.state.status === 'running') {
          this.state.toggleStirrer();
          if (window.kineticsSound) {
            if (this.state.isStirring) window.kineticsSound.startStirrerHum();
            else window.kineticsSound.stopStirrerHum();
          }
        }
      }
    });
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
    const flaskX = Math.min(280, w * 0.32);
    const flaskY = h * 0.52;
    const flaskR = Math.min(105, h * 0.22);

    // 2. White Ceramic Tile & Bold Black Cross Beneath Flask
    this.drawCeramicTileAndCross(ctx, flaskX, flaskY, flaskR);

    // 3. Borosilicate Flask & Turbid Colloidal Sulfur Solution
    this.drawErlenmeyerFlask(ctx, flaskX, flaskY, flaskR);

    // 4. Optical Transmittance Photometer Gauge (HUD)
    this.drawPhotometerGauge(ctx, flaskX, flaskY, flaskR);

    // 5. Live Analytical Kinetics Graph (Right Side)
    const graphX = flaskX + flaskR + 36;
    const graphY = 24;
    const graphW = Math.max(260, w - graphX - 20);
    const graphH = h - 48;

    if (w > 640) {
      this.drawAnalyticalGraph(ctx, graphX, graphY, graphW, graphH);
    }

    // 6. Digital Stopwatch & Condition HUD
    this.drawStopwatchHUD(ctx, flaskX, flaskY - flaskR - 38);
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

  drawCeramicTileAndCross(ctx, cx, cy, radius) {
    ctx.save();
    const tileW = radius * 2.3;
    const tileH = radius * 2.3;

    // Cast shadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;

    // White porcelain glazed tile
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.fillRect(cx - tileW * 0.5, cy - tileH * 0.5, tileW, tileH);
    ctx.strokeRect(cx - tileW * 0.5, cy - tileH * 0.5, tileW, tileH);

    ctx.shadowColor = 'transparent';

    // Bold Black Cross ("X") Printed On Tile
    // As opacity increases, the cross is obscured by the solution layer above it
    const crossSize = radius * 0.85;
    const opacity = this.state.opacity;
    const crossAlpha = Math.max(0.0, 1.0 - opacity * 1.08);

    if (crossAlpha > 0.01) {
      ctx.save();
      ctx.strokeStyle = `rgba(15, 23, 42, ${crossAlpha})`;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';

      // Diagonal 1
      ctx.beginPath();
      ctx.moveTo(cx - crossSize * 0.5, cy - crossSize * 0.5);
      ctx.lineTo(cx + crossSize * 0.5, cy + crossSize * 0.5);
      ctx.stroke();

      // Diagonal 2
      ctx.beginPath();
      ctx.moveTo(cx + crossSize * 0.5, cy - crossSize * 0.5);
      ctx.lineTo(cx - crossSize * 0.5, cy + crossSize * 0.5);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }

  drawErlenmeyerFlask(ctx, cx, cy, radius) {
    ctx.save();
    const opacity = this.state.opacity;

    // 1. Solution Color Interpolation
    // Starts crystal clear water-blue -> opalescent white -> milky yellow colloidal sulfur
    let fluidR, fluidG, fluidB, fluidAlpha;
    if (opacity < 0.2) {
      // Clear water phase
      fluidR = 224; fluidG = 242; fluidB = 254;
      fluidAlpha = 0.25 + opacity * 0.8;
    } else if (opacity < 0.6) {
      // Milky nucleation phase
      fluidR = 254; fluidG = 249; fluidB = 195;
      fluidAlpha = 0.55 + opacity * 0.35;
    } else {
      // Dense yellow colloidal sulfur sludge
      fluidR = 250; fluidG = 204; fluidB = 21;
      fluidAlpha = 0.85 + opacity * 0.14;
    }

    // Fill flask interior with colloidal liquid
    const liquidGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius);
    liquidGrad.addColorStop(0, `rgba(${fluidR}, ${fluidG}, ${fluidB}, ${fluidAlpha})`);
    liquidGrad.addColorStop(0.85, `rgba(${Math.round(fluidR * 0.95)}, ${Math.round(fluidG * 0.95)}, ${Math.round(fluidB * 0.85)}, ${fluidAlpha})`);
    liquidGrad.addColorStop(1, `rgba(${Math.round(fluidR * 0.85)}, ${Math.round(fluidG * 0.85)}, ${Math.round(fluidB * 0.7)}, ${Math.min(1.0, fluidAlpha + 0.1)})`);

    ctx.fillStyle = liquidGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Swirling Colloid Micro-Particles
    if (opacity > 0.05) {
      ctx.save();
      for (const p of this.engine.particles) {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * opacity * 0.75})`;
        ctx.beginPath();
        ctx.arc(cx + p.x, cy + p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 3. Spinning Magnetic Stir Bar (Teflon White Pill)
    if (this.state.isStirring) {
      this.stirAngle += (this.state.status === 'running' ? 0.35 : 0.12);
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.stirAngle);

    // Magnetic stir bar shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    this.roundRect(ctx, -18, -4, 36, 8, 4);
    ctx.fill();

    // Teflon white stir pill
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    this.roundRect(ctx, -18, -6, 36, 8, 4);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // 4. Heavy Borosilicate Glass Flask Outer Rim & Reflections
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.45)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Glass wall specular reflection highlights
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 4, -Math.PI * 0.85, -Math.PI * 0.45);
    ctx.stroke();

    // Graduated volume tick marks on glass
    ctx.font = `600 10px 'JetBrains Mono', monospace`;
    ctx.fillStyle = '#64748B';
    ctx.fillText('60 mL', cx - radius + 12, cy - 2);

    ctx.restore();
  }

  drawPhotometerGauge(ctx, cx, cy, radius) {
    ctx.save();
    const barW = radius * 2.1;
    const barH = 10;
    const barX = cx - barW * 0.5;
    const barY = cy + radius + 22;

    // Photometer Bar Track
    ctx.fillStyle = '#E2E8F0';
    this.roundRect(ctx, barX, barY, barW, barH, 5);
    ctx.fill();

    // Transmittance fill
    const pct = this.state.transmittancePct / 100;
    const fillW = Math.max(0, barW * pct);

    const barColor = pct > 0.4 ? '#059669' : (pct > 0.1 ? '#D97706' : '#E11D48');
    ctx.fillStyle = barColor;
    this.roundRect(ctx, barX, barY, fillW, barH, 5);
    ctx.fill();

    // Photometer Labels
    ctx.font = `700 10px 'JetBrains Mono', monospace`;
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'left';
    ctx.fillText(`TRANSMISSION: ${this.state.transmittancePct.toFixed(1)}%`, barX, barY + 22);

    ctx.textAlign = 'right';
    if (this.state.crossObscured) {
      ctx.fillStyle = '#E11D48';
      ctx.fillText('CROSS OBSCURED', barX + barW, barY + 22);
    } else {
      ctx.fillStyle = '#059669';
      ctx.fillText('CROSS VISIBLE', barX + barW, barY + 22);
    }

    ctx.restore();
  }

  drawStopwatchHUD(ctx, x, y) {
    ctx.save();
    const sec = this.state.elapsedSeconds;
    const mins = Math.floor(sec / 60);
    const secs = (sec % 60).toFixed(2);
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')} s`;

    // Time Card
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    this.roundRect(ctx, x - 95, y, 190, 32, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = `700 15px 'JetBrains Mono', monospace`;
    ctx.fillStyle = this.state.status === 'running' ? '#0284C7' : (this.state.status === 'completed' ? '#059669' : '#0F172A');
    ctx.textAlign = 'center';
    ctx.fillText(`⏱️ ${timeStr}`, x, y + 21);

    ctx.restore();
  }

  drawAnalyticalGraph(ctx, gx, gy, gw, gh) {
    ctx.save();
    // Glassmorphic graph container
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    this.roundRect(ctx, gx, gy, gw, gh, 8);
    ctx.fill();
    ctx.stroke();

    // Graph Title & Active Mode
    ctx.font = `700 12px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'left';

    let title = 'Reaction Rate vs. [Na₂S₂O₃] Concentration';
    let xLabel = 'Concentration [Na₂S₂O₃] (mol/L)';
    let yLabel = 'Relative Rate 1/t (s⁻¹)';

    if (this.state.plotMode === 'arrhenius') {
      title = 'Arrhenius Plot: ln(Rate) vs. 1/T';
      xLabel = '1/T × 10³ (K⁻¹)';
      yLabel = 'ln(Rate 1/t)';
    } else if (this.state.plotMode === 'transmittance_curve') {
      title = 'Turbidity Curve: Transmittance vs. Time';
      xLabel = 'Elapsed Time (s)';
      yLabel = 'Light Transmittance (%)';
    }

    ctx.fillText(title, gx + 16, gy + 22);

    // Plot Inner Canvas
    const px = gx + 54;
    const py = gy + 42;
    const pw = gw - 74;
    const ph = gh - 82;

    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(px, py, pw, ph);

    // Gridlines
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const ly = py + (ph / 5) * i;
      ctx.beginPath();
      ctx.moveTo(px, ly);
      ctx.lineTo(px + pw, ly);
      ctx.stroke();
    }

    // Axes Labels
    ctx.font = `600 10px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'center';
    ctx.fillText(xLabel, px + pw * 0.5, py + ph + 28);

    ctx.save();
    ctx.translate(px - 36, py + ph * 0.5);
    ctx.rotate(-Math.PI * 0.5);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();

    // Plot Data Points from Completed Trials
    if (this.state.trials.length > 0) {
      if (this.state.plotMode === 'rate_vs_conc') {
        this.plotRateVsConc(ctx, px, py, pw, ph);
      } else if (this.state.plotMode === 'arrhenius') {
        this.plotArrhenius(ctx, px, py, pw, ph);
      }
    } else {
      ctx.font = `600 12px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = '#94A3B8';
      ctx.textAlign = 'center';
      ctx.fillText('No completed trials recorded yet. Run reactions to plot data.', px + pw * 0.5, py + ph * 0.5);
    }

    ctx.restore();
  }

  plotRateVsConc(ctx, px, py, pw, ph) {
    const trials = this.state.trials;
    const maxConc = 0.22;
    const maxRate = Math.max(0.12, ...trials.map(t => t.rate * 1.2));

    ctx.strokeStyle = '#0284C7';
    ctx.fillStyle = '#0284C7';

    trials.forEach((t, i) => {
      const cx = px + (t.concM / maxConc) * pw;
      const cy = py + ph - (t.rate / maxRate) * ph;

      // Draw point
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Label point with Trial #
      ctx.font = `700 9px 'JetBrains Mono', monospace`;
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'center';
      ctx.fillText(`T${t.trialNum}`, cx, cy - 8);
      ctx.fillStyle = '#0284C7';
    });

    // Best fit origin line if >= 2 points
    if (trials.length >= 2) {
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(px, py + ph);
      const lastX = px + pw;
      const avgSlope = trials.reduce((acc, t) => acc + (t.rate / t.concM), 0) / trials.length;
      const lastY = py + ph - Math.min(ph, (avgSlope * maxConc / maxRate) * ph);
      ctx.lineTo(lastX, lastY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  plotArrhenius(ctx, px, py, pw, ph) {
    const trials = this.state.trials.filter(t => t.lnRate !== null);
    if (trials.length === 0) return;

    const minX = Math.min(...trials.map(t => t.reciprocalTempK * 1000)) * 0.95;
    const maxX = Math.max(...trials.map(t => t.reciprocalTempK * 1000)) * 1.05;
    const minY = Math.min(...trials.map(t => t.lnRate)) - 0.5;
    const maxY = Math.max(...trials.map(t => t.lnRate)) + 0.5;

    ctx.fillStyle = '#EA580C';
    ctx.strokeStyle = '#EA580C';

    trials.forEach((t) => {
      const valX = t.reciprocalTempK * 1000;
      const cx = px + ((valX - minX) / (maxX - minX || 1)) * pw;
      const cy = py + ph - ((t.lnRate - minY) / (maxY - minY || 1)) * ph;

      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = `700 9px 'JetBrains Mono', monospace`;
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'center';
      ctx.fillText(`${t.tempC}°C`, cx, cy - 8);
      ctx.fillStyle = '#EA580C';
    });
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

window.KineticsRenderer = KineticsRenderer;
