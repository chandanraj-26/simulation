/**
 * Kinetic Gas Laws — Canvas 2D Renderer
 * Renders the precision piston-cylinder chamber, draggable piston shaft,
 * elastic gas molecules with velocity vectors, analog Bourdon pressure manometer,
 * substage thermal bath, bicycle pump, and live thermodynamic state curves.
 */

class GasRenderer {
  constructor(canvas, state, engine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = state;
    this.engine = engine;

    this.width = 900;
    this.height = 540;
    this.dpr = 1;

    // Interactive Dragging
    this.isDraggingPiston = false;
    this.dragStartX = 0;
    this.dragStartVol = 15;

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

  getChamberBounds() {
    const left = 32;
    const top = 110;
    const bottom = Math.min(460, this.height * 0.78);
    const chamberHeight = bottom - top;

    // Minimum width (5 L) to Maximum width (25 L)
    const minW = 80;
    const maxW = Math.min(320, this.width * 0.42);

    const volFraction = (this.state.volumeL - window.GAS_DATA.chamber.minVolumeL) /
      (window.GAS_DATA.chamber.maxVolumeL - window.GAS_DATA.chamber.minVolumeL);
    const chamberW = minW + volFraction * (maxW - minW);

    return {
      left: left,
      right: left + chamberW,
      top: top,
      bottom: bottom,
      height: chamberHeight,
      width: chamberW,
      minW: minW,
      maxW: maxW
    };
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
      const b = this.getChamberBounds();

      // Test hit on Piston Handle (right side of chamber)
      if (pos.x >= b.right - 14 && pos.x <= b.right + 42 && pos.y >= b.top && pos.y <= b.bottom) {
        if (this.state.lockParam !== 'volume') {
          this.isDraggingPiston = true;
          this.dragStartX = pos.x;
          this.dragStartVol = this.state.volumeL;
          this.canvas.style.cursor = 'ew-resize';
          if (window.gasSound) window.gasSound.playPistonSlide();
        }
      }
    };

    const onMove = (e) => {
      const pos = getPos(e);
      const b = this.getChamberBounds();

      if (this.isDraggingPiston) {
        const dx = pos.x - this.dragStartX;
        const volPerPixel = (window.GAS_DATA.chamber.maxVolumeL - window.GAS_DATA.chamber.minVolumeL) / (b.maxW - b.minW);
        const newVol = this.dragStartVol + dx * volPerPixel;
        this.state.setVolume(newVol);
      } else {
        const isOverHandle = (pos.x >= b.right - 14 && pos.x <= b.right + 42 && pos.y >= b.top && pos.y <= b.bottom);
        this.canvas.style.cursor = isOverHandle && this.state.lockParam !== 'volume' ? 'ew-resize' : 'crosshair';
      }
    };

    const onUp = () => {
      this.isDraggingPiston = false;
      this.canvas.style.cursor = 'crosshair';
    };

    this.canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    this.canvas.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Soft Light-Blue Study Environment Backdrop
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, w, h);

    this.drawBackgroundGrid(ctx, w, h);

    const b = this.getChamberBounds();

    // 2. Substage Thermal Heating/Cooling Bath
    this.drawThermalBath(ctx, b);

    // 3. Piston-Cylinder Chamber
    this.drawChamberAndPiston(ctx, b);

    // 4. Elastic Gas Molecules
    this.drawMolecules(ctx);

    // 5. Analog Bourdon Pressure Manometer
    this.drawPressureManometer(ctx, b);

    // 6. Interactive Bicycle Pump & Vent Valve
    this.drawPumpAndValve(ctx, b);

    // 7. Live Analytical Thermodynamic Graph (Right Side)
    const graphX = Math.max(380, b.left + b.maxW + 48);
    const graphY = 24;
    const graphW = Math.max(260, w - graphX - 20);
    const graphH = h - 48;

    if (w > 660) {
      this.drawStateGraph(ctx, graphX, graphY, graphW, graphH);
    }

    // 8. Top-Left Floating State HUD
    this.drawStateHUD(ctx, b);
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

  drawThermalBath(ctx, b) {
    ctx.save();
    const bathY = b.bottom + 8;
    const bathH = 28;
    const tempK = this.state.temperatureK;

    // Thermal color: Blue chilled (<250 K) -> Neutral (250-350 K) -> Glowing Orange (>350 K)
    let bathColor;
    if (tempK < 250) {
      bathColor = 'rgba(56, 189, 248, 0.65)'; // Ice blue
    } else if (tempK < 380) {
      bathColor = 'rgba(203, 213, 225, 0.6)'; // Neutral steel
    } else {
      bathColor = 'rgba(249, 115, 22, 0.75)'; // Heat orange
    }

    ctx.fillStyle = bathColor;
    this.roundRect(ctx, b.left - 6, bathY, b.maxW + 28, bathH, 6);
    ctx.fill();
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = `700 11px 'JetBrains Mono', monospace`;
    ctx.fillStyle = tempK > 380 ? '#7C2D12' : (tempK < 250 ? '#0369A1' : '#334155');
    ctx.textAlign = 'center';
    const tempLabel = tempK > 380 ? `🔥 HEATING BATH (${Math.round(tempK)} K)` : (tempK < 250 ? `❄️ ICE BATH (${Math.round(tempK)} K)` : `THERMAL EQUILIBRIUM (${Math.round(tempK)} K)`);
    ctx.fillText(tempLabel, b.left + (b.maxW + 28) * 0.5, bathY + 18);

    ctx.restore();
  }

  drawChamberAndPiston(ctx, b) {
    ctx.save();

    // 1. Transparent Quartz Cylinder Interior
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(b.left, b.top, b.width, b.height);

    // 2. Steel Heavy Frame (Top, Bottom, Left Wall)
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(b.left + b.maxW + 10, b.top);
    ctx.lineTo(b.left, b.top);
    ctx.lineTo(b.left, b.bottom);
    ctx.lineTo(b.left + b.maxW + 10, b.bottom);
    ctx.stroke();

    // 3. Heavy Draggable Piston Head (Right Wall)
    const pistonW = 20;
    const pistonX = b.right;

    const pistonGrad = ctx.createLinearGradient(pistonX, 0, pistonX + pistonW, 0);
    pistonGrad.addColorStop(0, '#475569');
    pistonGrad.addColorStop(0.3, '#E2E8F0');
    pistonGrad.addColorStop(0.7, '#94A3B8');
    pistonGrad.addColorStop(1, '#334155');

    ctx.fillStyle = pistonGrad;
    ctx.fillRect(pistonX, b.top, pistonW, b.height);

    // Rubber O-Ring Seals at Top and Bottom of Piston
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(pistonX - 2, b.top + 4, 4, 10);
    ctx.fillRect(pistonX - 2, b.bottom - 14, 4, 10);

    // 4. Piston Connecting Shaft & Drag Handle
    const shaftL = 50;
    ctx.fillStyle = '#64748B';
    ctx.fillRect(pistonX + pistonW, b.top + b.height * 0.5 - 6, shaftL, 12);

    // Handle Grip
    ctx.fillStyle = this.state.lockParam === 'volume' ? '#94A3B8' : '#0284C7';
    this.roundRect(ctx, pistonX + pistonW + shaftL, b.top + b.height * 0.5 - 24, 14, 48, 6);
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Volume readout inside chamber
    ctx.font = `700 13px 'JetBrains Mono', monospace`;
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.state.volumeL.toFixed(1)} L`, b.left + b.width * 0.5, b.bottom - 12);

    ctx.restore();
  }

  drawMolecules(ctx) {
    ctx.save();
    for (const p of this.engine.particles) {
      // Draw gas molecule sphere
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Velocity vector arrow
      if (this.state.showVelocityVectors) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 3.5, p.y + p.vy * 3.5);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawPressureManometer(ctx, b) {
    ctx.save();
    // Dial Position centered atop the chamber
    const mx = b.left + 50;
    const my = b.top - 46;
    const dialR = 34;

    // Brass connection pipe
    ctx.fillStyle = '#D97706';
    ctx.fillRect(mx - 4, my + dialR - 4, 8, b.top - (my + dialR) + 6);

    // Outer Dial Chrome Bezel
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(mx, my, dialR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Color Arc Sectors: Green safe (0 to 5 atm), Amber (5 to 8 atm), Red (>8 atm)
    // 0 atm = -135 deg (-3pi/4), 10 atm = +135 deg (3pi/4)
    const p = Math.min(10.0, this.state.pressureAtm);
    const startAngle = -Math.PI * 0.75;
    const endAngle = Math.PI * 0.75;
    const pFraction = p / 10.0;
    const needleAngle = startAngle + pFraction * (endAngle - startAngle);

    // Green safe arc
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(mx, my, dialR - 5, startAngle, startAngle + 0.5 * (endAngle - startAngle));
    ctx.stroke();

    // Red danger arc
    ctx.strokeStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(mx, my, dialR - 5, startAngle + 0.8 * (endAngle - startAngle), endAngle);
    ctx.stroke();

    // Rotating Needle
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx + Math.cos(needleAngle) * (dialR - 8), my + Math.sin(needleAngle) * (dialR - 8));
    ctx.stroke();

    // Pin
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(mx, my, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Digital readout below dial
    ctx.font = `700 11px 'JetBrains Mono', monospace`;
    ctx.fillStyle = p > 8.0 ? '#DC2626' : '#0F172A';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.state.pressureAtm.toFixed(2)} atm`, mx + 64, my);

    ctx.restore();
  }

  drawPumpAndValve(ctx, b) {
    ctx.save();
    // Simple interactive port on left wall
    const portY = b.top + b.height * 0.5;

    // Inlet spigot
    ctx.fillStyle = '#D97706';
    ctx.fillRect(b.left - 16, portY - 6, 16, 12);

    // Air hose
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(b.left - 16, portY);
    ctx.bezierCurveTo(b.left - 45, portY, b.left - 60, portY + 40, b.left - 20, portY + 60);
    ctx.stroke();

    ctx.restore();
  }

  drawStateGraph(ctx, gx, gy, gw, gh) {
    ctx.save();
    // Glassmorphic graph container
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    this.roundRect(ctx, gx, gy, gw, gh, 8);
    ctx.fill();
    ctx.stroke();

    // Plot Title & Selected Mode
    ctx.font = `700 12px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'left';

    let title = 'P-V Isotherm Diagram (Pressure vs. Volume)';
    let xLabel = 'Volume V (Liters)';
    let yLabel = 'Pressure P (atm)';

    if (this.state.plotMode === 'VT') {
      title = 'V-T Isobar Diagram (Volume vs. Temperature)';
      xLabel = 'Temperature T (Kelvin)';
      yLabel = 'Volume V (L)';
    } else if (this.state.plotMode === 'PT') {
      title = 'P-T Isochoric Diagram (Pressure vs. Temperature)';
      xLabel = 'Temperature T (Kelvin)';
      yLabel = 'Pressure P (atm)';
    } else if (this.state.plotMode === 'maxwell') {
      title = 'Maxwell-Boltzmann Speed Distribution f(v)';
      xLabel = 'Speed v (m/s)';
      yLabel = 'Fraction of Molecules';
    }

    ctx.fillText(title, gx + 16, gy + 22);

    const px = gx + 54;
    const py = gy + 42;
    const pw = gw - 74;
    const ph = gh - 82;

    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(px, py, pw, ph);

    // Axes
    ctx.font = `600 10px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'center';
    ctx.fillText(xLabel, px + pw * 0.5, py + ph + 28);

    ctx.save();
    ctx.translate(px - 36, py + ph * 0.5);
    ctx.rotate(-Math.PI * 0.5);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();

    // Render Curves based on Plot Mode
    if (this.state.plotMode === 'PV') {
      this.drawPVIsoquants(ctx, px, py, pw, ph);
    } else if (this.state.plotMode === 'VT') {
      this.drawVTIsobars(ctx, px, py, pw, ph);
    } else if (this.state.plotMode === 'PT') {
      this.drawPTIsolines(ctx, px, py, pw, ph);
    } else if (this.state.plotMode === 'maxwell') {
      this.drawMaxwellDistribution(ctx, px, py, pw, ph);
    }

    ctx.restore();
  }

  drawPVIsoquants(ctx, px, py, pw, ph) {
    const maxV = 28.0;
    const maxP = 8.0;

    // Draw theoretical Boyle hyperbola P = nRT/V for current T
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    const R = window.GAS_DATA.R_ATM;

    for (let v = 5.0; v <= 25.0; v += 0.5) {
      const p = (this.state.moles * R * this.state.temperatureK) / v;
      const x = px + (v / maxV) * pw;
      const y = py + ph - (p / maxP) * ph;
      if (v === 5.0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw historical recorded trajectory points
    if (this.state.stateHistory.length > 1) {
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.state.stateHistory.forEach((pt, i) => {
        const x = px + (pt.v / maxV) * pw;
        const y = py + ph - (pt.p / maxP) * ph;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // Current operating point
    const curX = px + (this.state.volumeL / maxV) * pw;
    const curY = py + ph - (this.state.pressureAtm / maxP) * ph;

    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(curX, curY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  drawVTIsobars(ctx, px, py, pw, ph) {
    const maxT = 800.0;
    const maxV = 28.0;

    // Absolute zero origin line extrapolation
    ctx.strokeStyle = 'rgba(234, 88, 12, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(px, py + ph);
    const endV = (this.state.moles * window.GAS_DATA.R_ATM * 750) / this.state.pressureAtm;
    ctx.lineTo(px + (750 / maxT) * pw, py + ph - (endV / maxV) * ph);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current Operating Point
    const curX = px + (this.state.temperatureK / maxT) * pw;
    const curY = py + ph - (this.state.volumeL / maxV) * ph;

    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.arc(curX, curY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  drawPTIsolines(ctx, px, py, pw, ph) {
    const maxT = 800.0;
    const maxP = 8.0;

    const curX = px + (this.state.temperatureK / maxT) * pw;
    const curY = py + ph - (this.state.pressureAtm / maxP) * ph;

    ctx.fillStyle = '#7C3AED';
    ctx.beginPath();
    ctx.arc(curX, curY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  drawMaxwellDistribution(ctx, px, py, pw, ph) {
    const { bins } = this.engine.getSpeedDistribution(12);
    const binW = pw / bins.length;
    const maxCount = Math.max(8, ...bins);

    ctx.fillStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1;

    bins.forEach((count, i) => {
      const bh = (count / maxCount) * ph;
      const bx = px + i * binW;
      const by = py + ph - bh;
      ctx.fillRect(bx, by, binW - 2, bh);
      ctx.strokeRect(bx, by, binW - 2, bh);
    });

    // Root-mean-square line marker
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + pw * 0.55, py);
    ctx.lineTo(px + pw * 0.55, py + ph);
    ctx.stroke();

    ctx.font = `700 9px 'JetBrains Mono', monospace`;
    ctx.fillStyle = '#EF4444';
    ctx.fillText(`v_rms = ${Math.round(this.state.vRms)} m/s`, px + pw * 0.55 + 6, py + 14);
  }

  drawStateHUD(ctx, b) {
    ctx.save();
    // Top-left HUD badge: Status & Active Lock
    ctx.font = `700 11px 'JetBrains Mono', monospace`;
    const lockText = this.state.lockParam === 'none' ? 'FREE EXPANSION' : `LOCKED: ${this.state.lockParam.toUpperCase()} CONSTANT`;
    const tw = ctx.measureText(lockText).width;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    this.roundRect(ctx, 16, 16, tw + 20, 26, 6);
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = this.state.lockParam === 'none' ? '#0F172A' : '#D97706';
    ctx.fillText(lockText, 26, 33);

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

window.GasRenderer = GasRenderer;
