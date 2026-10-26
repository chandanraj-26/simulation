/**
 * OhmLab — Canvas 2D Laboratory Renderer (js/renderer.js)
 * Implements 3 tab-switched interactive views:
 *   1. 'circuit': Full interactive schematic, knife switch, dual meters, wire particles, thermal glow
 *   2. 'drift': Microscopic Drude model, vibrating Cu lattice ions, free electron scattering
 *   3. 'graph': Precision Cartesian V-I plot, live radar operating point, regression line
 * Plus a dynamic laboratory safety hazard overlay.
 *
 * Attaches to window.ohmRenderer.
 */

class OhmsLawRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    this.width = 960;
    this.height = 540;
    this.lastFrameTime = performance.now();

    // Active View Tab: 'circuit' | 'drift' | 'graph'
    this.activeView = 'circuit';

    // Animation & Component States
    this.switchAngle = 0;              // 0 = open (~35 deg), 1 = closed (0 deg)
    this.switchPrevClosed = false;
    this.sparkPool = [];               // Spark particles on switch snap or fault
    this.heatWaves = [];               // Rising shimmer waves above resistor

    // Meter Needles (smoothed)
    this.ammeterNeedleVal = 0;
    this.voltmeterNeedleVal = 0;

    // Wire Flow Particles
    this.wireParticles = [];
    this.initWireParticles(50);

    // Drude Model Particles (Microscopic Drift View)
    this.driftElectrons = [];
    this.latticeIons = [];
    this.initDrudeModel();

    // V-I Graph Animation
    this.radarPingPhase = 0;
    this.regressionProgress = 0;

    // Hazard Strobe
    this.hazardStrobePhase = 0;

    // Cached Physics Packet
    this.circuitData = null;
  }

  // =========================================================================
  // INITIALIZATION & RESIZE
  // =========================================================================

  initWireParticles(count) {
    this.wireParticles = [];
    for (let i = 0; i < count; i++) {
      this.wireParticles.push({
        t: i / count, // Parameter 0 to 1 along circuit loop
        offset: (Math.random() - 0.5) * 4
      });
    }
  }

  initDrudeModel() {
    this.driftElectrons = [];
    this.latticeIons = [];

    // Initialize 80 free electrons
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 80; // thermal speed in px/s
      this.driftElectrons.push({
        x: Math.random() * 800,
        y: Math.random() * 300,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        collisionTimer: 0
      });
    }
  }

  setupLatticeGrid() {
    this.latticeIons = [];
    const cols = 12;
    const rows = 5;
    const startX = this.width * 0.12;
    const endX = this.width * 0.88;
    const startY = this.height * 0.28;
    const endY = this.height * 0.72;

    const dx = (endX - startX) / (cols - 1);
    const dy = (endY - startY) / (rows - 1);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Hexagonal staggered offset
        const staggerX = (r % 2 === 1) ? dx * 0.5 : 0;
        const x0 = startX + c * dx + staggerX;
        const y0 = startY + r * dy;
        if (x0 <= endX + 10) {
          this.latticeIons.push({
            x0: x0,
            y0: y0,
            jitterX: 0,
            jitterY: 0,
            phase: Math.random() * Math.PI * 2
          });
        }
      }
    }
  }

  resize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 960;
    this.height = rect.height || 540;

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Recompute lattice grid when dimensions change
    this.setupLatticeGrid();
  }

  setActiveView(view) {
    this.activeView = view;
  }

  // =========================================================================
  // MAIN RENDER LOOP
  // =========================================================================

  render() {
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0.001, (now - this.lastFrameTime) / 1000));
    this.lastFrameTime = now;

    const state = window.simState;

    // 1. Solve Physics & Synchronize State
    if (!state.isPaused && window.OhmsLawPhysics) {
      this.circuitData = window.OhmsLawPhysics.solve({
        voltage: state.voltage,
        resistance: state.resistance,
        tempCoeff: state.tempCoeff,
        temperature: state.temperature,
        switchClosed: state.switchClosed,
        ammeterMode: state.ammeterMode,
        voltmeterMode: state.voltmeterMode,
        dt: dt
      });

      // Write derived quantities to state
      state.current = this.circuitData.current;
      state.currentResistor = this.circuitData.currentResistor;
      state.voltageResistor = this.circuitData.voltageResistor;
      state.voltageVoltmeter = this.circuitData.voltageVoltmeter;
      state.power = this.circuitData.power;
      state.effectiveResistance = this.circuitData.R_eff;
      state.temperature = this.circuitData.T_new;
      state.driftVelocity = this.circuitData.driftVelocity;
      state.hazardActive = this.circuitData.hazard.active;
      state.hazardType = this.circuitData.hazard.type;
      state.hazardMessage = this.circuitData.hazard.message;

      // Update Procedural Sound
      if (window.soundEngine) {
        window.soundEngine.updateElectricalHum(state.current);
        window.soundEngine.updateOverheatBuzz(state.temperature);

        if (state.hazardActive) {
          window.soundEngine.playHazardAlarm();
        } else {
          window.soundEngine.stopHazardAlarm();
        }
      }

      // Check Student Laboratory Quests
      state.checkQuests();
    }

    // 2. Clear Screen with Light-Blue Study Canvas
    this.ctx.fillStyle = '#E6F2FF';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 3. Render Active View Tab
    switch (this.activeView) {
      case 'circuit':
        this.renderCircuitView(dt, state);
        break;
      case 'drift':
        this.renderDriftView(dt, state);
        break;
      case 'graph':
        this.renderGraphView(dt, state);
        break;
      default:
        this.renderCircuitView(dt, state);
    }

    // 4. Render Hazard Overlay (if active, renders across all views)
    if (state.hazardActive) {
      this.renderHazardOverlay(dt, state);
    }
  }

  // =========================================================================
  // VIEW 1: CIRCUIT SCHEMATIC VIEW
  // =========================================================================

  renderCircuitView(dt, state) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Circuit Bounds (Proportional)
    const leftX = w * 0.16;
    const rightX = w * 0.84;
    const topY = h * 0.24;
    const bottomY = h * 0.78;

    // Draw Subtle Workstation Grid
    this.drawCanvasGrid();

    // 1. Draw Wires (Copper Busbars)
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Base Wire Path
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(leftX, bottomY);
    ctx.lineTo(leftX, topY);
    ctx.lineTo(rightX, topY);
    ctx.lineTo(rightX, bottomY);
    ctx.lineTo(leftX, bottomY);
    ctx.stroke();

    // Inner Core Wire Glow
    ctx.strokeStyle = state.switchClosed && state.current > 0.001 ? '#60A5FA' : '#CBD5E1';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // 2. Draw Wire Current Flow Particles
    if (state.switchClosed && state.current > 0.0001) {
      this.drawWireParticles(dt, state, leftX, rightX, topY, bottomY);
    }

    // 3. Draw Battery (EMF Source) on Left Wire
    const batteryCenterY = (topY + bottomY) * 0.5;
    this.drawBattery(leftX, batteryCenterY, state);

    // 4. Draw Knife Switch on Top Wire (Left-Center)
    const switchCenterX = leftX + (rightX - leftX) * 0.28;
    this.drawKnifeSwitch(switchCenterX, topY, dt, state);

    // 5. Draw Ammeter on Top Wire (Right-Center or Parallel Fault)
    if (state.ammeterMode === 'series') {
      const ammeterCenterX = leftX + (rightX - leftX) * 0.70;
      this.drawAmmeter(ammeterCenterX, topY, dt, state);
    } else {
      // Parallel Ammeter Fault jumper wires across battery!
      this.drawParallelAmmeter(leftX, topY, bottomY, dt, state);
    }

    // 6. Draw Load Resistor on Right Wire
    const resistorCenterY = (topY + bottomY) * 0.5;
    this.drawResistor(rightX, resistorCenterY, dt, state);

    // 7. Draw Voltmeter
    if (state.voltmeterMode === 'parallel') {
      // Parallel Voltmeter branched outside Resistor
      const voltmeterCenterX = rightX + Math.min(80, w * 0.09);
      this.drawParallelVoltmeter(rightX, voltmeterCenterX, topY, bottomY, resistorCenterY, dt, state);
    } else {
      // Voltmeter Series Hazard (inserted into bottom wire)
      const voltmeterCenterX = (leftX + rightX) * 0.5;
      this.drawSeriesVoltmeter(voltmeterCenterX, bottomY, dt, state);
    }

    // 8. Wire Annotation Labels (if enabled)
    if (state.showCurrentLabels) {
      this.drawCircuitLabels(leftX, rightX, topY, bottomY, state);
    }

    // 9. Spark particles
    this.renderSparks(dt);
  }

  drawCanvasGrid() {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = '#DCEBFA';
    ctx.lineWidth = 1;
    const step = 30;
    for (let x = 0; x < this.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- COMPONENT: BATTERY ---
  drawBattery(cx, cy, state) {
    const ctx = this.ctx;
    const plateWidth = 36;
    const shortWidth = 20;
    const plateGap = 8;

    ctx.save();

    // Clear wire underneath
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(cx - 24, cy - 35, 48, 70);

    // Positive Plate (Long, Red)
    ctx.strokeStyle = '#E63946';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - plateWidth / 2, cy - plateGap);
    ctx.lineTo(cx + plateWidth / 2, cy - plateGap);
    ctx.stroke();

    // Negative Plate (Short, Thick, Blue)
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx - shortWidth / 2, cy + plateGap);
    ctx.lineTo(cx + shortWidth / 2, cy + plateGap);
    ctx.stroke();

    // Terminals + and -
    ctx.font = "bold 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = '#E63946';
    ctx.textAlign = 'right';
    ctx.fillText('+', cx - plateWidth / 2 - 8, cy - plateGap + 4);

    ctx.fillStyle = '#2563EB';
    ctx.fillText('−', cx - plateWidth / 2 - 8, cy + plateGap + 5);

    // Voltage Label
    ctx.textAlign = 'left';
    ctx.font = "bold 14px 'JetBrains Mono', monospace";
    ctx.fillStyle = '#0F172A';
    ctx.fillText(`${state.voltage.toFixed(1)} V`, cx + plateWidth / 2 + 10, cy + 4);

    ctx.font = "11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = '#475569';
    ctx.fillText('DC Source', cx + plateWidth / 2 + 10, cy + 18);

    ctx.restore();
  }

  // --- COMPONENT: KNIFE SWITCH ---
  drawKnifeSwitch(cx, cy, dt, state) {
    const ctx = this.ctx;
    const bladeLen = 42;

    // Smooth animation of knife switch blade
    const targetAngle = state.switchClosed ? 0.0 : 0.65; // radians (~37 deg)
    this.switchAngle += (targetAngle - this.switchAngle) * Math.min(1.0, dt * 18);

    // Snap sound and spark on transition
    if (state.switchClosed && !this.switchPrevClosed) {
      if (window.soundEngine) {
        window.soundEngine.playSwitchClick();
        window.soundEngine.playSparkArc();
      }
      this.createSparks(cx + bladeLen * 0.9, cy, 14, '#60A5FA');
    }
    this.switchPrevClosed = state.switchClosed;

    ctx.save();

    // Clear wire gap
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(cx - 24, cy - 20, bladeLen + 40, 40);

    // Left Contact Post (Brass)
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FDE68A';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Right Contact Jaw (Brass Clip)
    const jawX = cx + bladeLen;
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.arc(jawX, cy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FDE68A';
    ctx.beginPath();
    ctx.arc(jawX, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Animated Switch Blade
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-this.switchAngle);

    // Knife blade bar
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(bladeLen, 0);
    ctx.stroke();

    // Insulated handle at the end
    ctx.fillStyle = state.switchClosed ? '#10B981' : '#DC2626';
    ctx.beginPath();
    ctx.roundRect(bladeLen - 8, -6, 16, 12, 4);
    ctx.fill();

    ctx.restore();

    // Switch Label
    ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = state.switchClosed ? '#059669' : '#DC2626';
    ctx.textAlign = 'center';
    ctx.fillText(state.switchClosed ? 'SWITCH CLOSED' : 'SWITCH OPEN', cx + bladeLen / 2, cy - 24);

    ctx.restore();
  }

  // --- COMPONENT: AMMETER ---
  drawAmmeter(cx, cy, dt, state) {
    const ctx = this.ctx;
    const radius = 28;

    // Smoothed meter needle reading
    const targetVal = state.current;
    this.ammeterNeedleVal += (targetVal - this.ammeterNeedleVal) * Math.min(1.0, dt * 10);

    ctx.save();

    // Clear wire underneath
    ctx.fillStyle = '#E6F2FF';
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
    ctx.fill();

    // Brass outer bezel ring
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dial Scale Arc
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy + 4, radius * 0.65, Math.PI * 0.8, Math.PI * 0.2);
    ctx.stroke();

    // Animated Needle
    // Max scale: 0.5A for normal, higher for high current
    const maxI = state.resistance < 20 ? 3.0 : 0.5;
    const fraction = Math.min(1.0, Math.max(0, this.ammeterNeedleVal / maxI));
    const needleAngle = Math.PI * 0.8 + fraction * (Math.PI * 1.4);

    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 4);
    ctx.lineTo(cx + Math.cos(needleAngle) * (radius * 0.65), cy + 4 + Math.sin(needleAngle) * (radius * 0.65));
    ctx.stroke();

    // Center pivot pin
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(cx, cy + 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Meter Label 'A'
    ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = '#2563EB';
    ctx.textAlign = 'center';
    ctx.fillText('A', cx, cy - 8);

    // Digital readout badge below
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = '#0F172A';
    const displayVal = this.ammeterNeedleVal >= 1.0 ? `${this.ammeterNeedleVal.toFixed(2)} A` : `${(this.ammeterNeedleVal * 1000).toFixed(1)} mA`;
    ctx.fillText(displayVal, cx, cy + radius + 15);

    ctx.restore();
  }

  // --- COMPONENT: PARALLEL AMMETER FAULT ---
  drawParallelAmmeter(leftX, topY, bottomY, dt, state) {
    const ctx = this.ctx;
    const ammeterX = leftX + 70;
    const ammeterY = (topY + bottomY) * 0.5;

    ctx.save();

    // Jumper leads shorting across the battery
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 4;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(leftX, topY);
    ctx.lineTo(ammeterX, topY);
    ctx.lineTo(ammeterX, bottomY);
    ctx.lineTo(leftX, bottomY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Ammeter body in middle of hazard jumper
    this.drawAmmeter(ammeterX, ammeterY, dt, state);

    // Hazard sparks around terminals
    if (state.switchClosed && Math.random() < 0.35) {
      this.createSparks(ammeterX, ammeterY - 28, 6, '#EF4444');
      this.createSparks(ammeterX, ammeterY + 28, 6, '#EF4444');
    }

    ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = '#DC2626';
    ctx.textAlign = 'center';
    ctx.fillText('⚠ PARALLEL SHORT', ammeterX, ammeterY - 38);

    ctx.restore();
  }

  // --- COMPONENT: RESISTOR ---
  drawResistor(cx, cy, dt, state) {
    const ctx = this.ctx;
    const bodyW = 28;
    const bodyH = 74;

    ctx.save();

    // 1. Resistor Thermal Glow (if enabled and hot)
    if (state.showHeatGlow && state.temperature > 40) {
      const heatFraction = Math.min(1.0, (state.temperature - 40) / 140);
      const glowRadius = bodyH * (0.6 + heatFraction * 0.9);

      const grad = ctx.createRadialGradient(cx, cy, bodyW * 0.3, cx, cy, glowRadius);
      grad.addColorStop(0, `rgba(239, 68, 68, ${0.45 * heatFraction})`);
      grad.addColorStop(0.5, `rgba(249, 115, 22, ${0.25 * heatFraction})`);
      grad.addColorStop(1, 'rgba(249, 115, 22, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Heat shimmer waves
      if (Math.random() < 0.25 * heatFraction) {
        this.heatWaves.push({
          x: cx + (Math.random() - 0.5) * 24,
          y: cy - bodyH * 0.4,
          alpha: 0.6,
          radius: 6 + Math.random() * 8
        });
      }
    }

    // Render rising heat waves
    this.renderHeatWaves(dt);

    // Clear wire under resistor
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(cx - bodyW - 4, cy - bodyH / 2 - 4, (bodyW + 4) * 2, bodyH + 8);

    // Ceramic Resistor Body
    ctx.fillStyle = '#E2D3B3';
    ctx.strokeStyle = '#A38F68';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH, 8);
    ctx.fill();
    ctx.stroke();

    // Metallic Terminal Caps
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(cx - bodyW / 2, cy - bodyH / 2, bodyW, 8);
    ctx.fillRect(cx - bodyW / 2, cy + bodyH / 2 - 8, bodyW, 8);

    // 4 Color Code Bands
    const bands = this.getResistorColorBands(state.resistance);
    const bandYOffsets = [-18, -6, 6, 18];
    bands.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(cx - bodyW / 2, cy + bandYOffsets[i], bodyW, 5);
    });

    // Resistor Info Label
    ctx.font = "bold 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'left';
    ctx.fillText(`${state.effectiveResistance.toFixed(1)} Ω`, cx + bodyW / 2 + 12, cy - 6);

    ctx.font = "11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = '#475569';
    ctx.fillText(`P = ${state.power < 1 ? (state.power * 1000).toFixed(0) + ' mW' : state.power.toFixed(2) + ' W'}`, cx + bodyW / 2 + 12, cy + 10);
    ctx.fillText(`T = ${state.temperature.toFixed(1)} °C`, cx + bodyW / 2 + 12, cy + 24);

    ctx.restore();
  }

  getResistorColorBands(R) {
    const digitColors = [
      '#0F172A', // 0 Black
      '#854D0E', // 1 Brown
      '#DC2626', // 2 Red
      '#EA580C', // 3 Orange
      '#EAB308', // 4 Yellow
      '#16A34A', // 5 Green
      '#2563EB', // 6 Blue
      '#7C3AED', // 7 Violet
      '#64748B', // 8 Grey
      '#F8FAFC'  // 9 White
    ];

    const rVal = Math.round(R);
    const s = rVal.toString();
    const d1 = parseInt(s[0], 10) || 1;
    const d2 = s.length > 1 ? parseInt(s[1], 10) : 0;
    const multiplier = Math.max(0, s.length - 2);

    return [
      digitColors[d1] || '#854D0E',
      digitColors[d2] || '#0F172A',
      digitColors[multiplier] || '#854D0E',
      '#D97706' // Gold (±5% tolerance)
    ];
  }

  // --- COMPONENT: PARALLEL VOLTMETER ---
  drawParallelVoltmeter(rightX, cx, topY, bottomY, resistorCenterY, dt, state) {
    const ctx = this.ctx;
    const radius = 28;

    // Smoothed voltmeter needle
    const targetVal = state.voltageVoltmeter;
    this.voltmeterNeedleVal += (targetVal - this.voltmeterNeedleVal) * Math.min(1.0, dt * 10);

    ctx.save();

    // Measurement probe jumper leads
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(rightX, topY + 40);
    ctx.lineTo(cx, topY + 40);
    ctx.lineTo(cx, resistorCenterY - radius);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rightX, bottomY - 40);
    ctx.lineTo(cx, bottomY - 40);
    ctx.lineTo(cx, resistorCenterY + radius);
    ctx.stroke();
    ctx.setLineDash([]);

    // Voltmeter Body
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, resistorCenterY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Arc Scale
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, resistorCenterY + 4, radius * 0.65, Math.PI * 0.8, Math.PI * 0.2);
    ctx.stroke();

    // Needle
    const maxV = 25.0;
    const fraction = Math.min(1.0, Math.max(0, this.voltmeterNeedleVal / maxV));
    const needleAngle = Math.PI * 0.8 + fraction * (Math.PI * 1.4);

    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, resistorCenterY + 4);
    ctx.lineTo(cx + Math.cos(needleAngle) * (radius * 0.65), resistorCenterY + 4 + Math.sin(needleAngle) * (radius * 0.65));
    ctx.stroke();

    // Pivot pin
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(cx, resistorCenterY + 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Meter Label 'V'
    ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = '#D97706';
    ctx.textAlign = 'center';
    ctx.fillText('V', cx, resistorCenterY - 8);

    // Digital readout badge
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = '#0F172A';
    ctx.fillText(`${this.voltmeterNeedleVal.toFixed(2)} V`, cx, resistorCenterY + radius + 15);

    ctx.restore();
  }

  // --- COMPONENT: SERIES VOLTMETER HAZARD ---
  drawSeriesVoltmeter(cx, bottomY, dt, state) {
    const ctx = this.ctx;
    const radius = 28;

    ctx.save();
    // Clear bottom wire gap
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(cx - 36, bottomY - 36, 72, 72);

    // Voltmeter inserted into loop
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, bottomY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = '#DC2626';
    ctx.textAlign = 'center';
    ctx.fillText('V', cx, bottomY - 6);

    ctx.font = "bold 10px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText('SERIES FAULT', cx, bottomY + 12);

    ctx.restore();
  }

  // --- WIRE FLOW PARTICLES ---
  drawWireParticles(dt, state, leftX, rightX, topY, bottomY) {
    const ctx = this.ctx;
    const totalLength = 2 * ((rightX - leftX) + (bottomY - topY));

    // Current speed scaling: 1A ~ 0.5 loops per sec
    const speed = Math.max(0.04, Math.min(1.2, state.current * 0.8));
    const isConventional = state.flowDirection === 'conventional';

    ctx.save();
    for (let i = 0; i < this.wireParticles.length; i++) {
      const p = this.wireParticles[i];

      // Update parameter along closed loop
      if (isConventional) {
        p.t = (p.t + speed * dt) % 1.0; // Clockwise
      } else {
        p.t = (p.t - speed * dt + 1.0) % 1.0; // Counter-clockwise (physical electrons)
      }

      // Convert loop parameter t (0 to 1) into (x, y) coordinates
      const pos = this.getLoopCoordinates(p.t, leftX, rightX, topY, bottomY);

      // Draw particle
      ctx.fillStyle = isConventional ? '#F59E0B' : '#06B6D4';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Particle charge label '+' or '−'
      ctx.font = "bold 8px monospace";
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isConventional ? '+' : '−', pos.x, pos.y);
    }
    ctx.restore();
  }

  getLoopCoordinates(t, leftX, rightX, topY, bottomY) {
    const w = rightX - leftX;
    const h = bottomY - topY;
    const perimeter = 2 * (w + h);
    const dist = t * perimeter;

    if (dist <= w) {
      // Top segment: Left to Right
      return { x: leftX + dist, y: topY };
    } else if (dist <= w + h) {
      // Right segment: Top to Bottom
      return { x: rightX, y: topY + (dist - w) };
    } else if (dist <= 2 * w + h) {
      // Bottom segment: Right to Left
      return { x: rightX - (dist - (w + h)), y: bottomY };
    } else {
      // Left segment: Bottom to Top
      return { x: leftX, y: bottomY - (dist - (2 * w + h)) };
    }
  }

  // --- WIRE LABELS ---
  drawCircuitLabels(leftX, rightX, topY, bottomY, state) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = '#475569';

    // Top rail potential
    ctx.textAlign = 'center';
    ctx.fillText(`+${state.voltage.toFixed(1)} V (High Rail)`, (leftX + rightX) * 0.5, topY - 14);

    // Bottom rail ground reference
    ctx.fillText('0.0 V (Return Rail / Ground)', (leftX + rightX) * 0.5, bottomY + 22);

    ctx.restore();
  }

  // --- SPARKS & HEAT WAVES ---
  createSparks(x, y, count, color = '#60A5FA') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 120;
      this.sparkPool.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0.15 + Math.random() * 0.2,
        color: color
      });
    }
  }

  renderSparks(dt) {
    const ctx = this.ctx;
    for (let i = this.sparkPool.length - 1; i >= 0; i--) {
      const sp = this.sparkPool[i];
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.life -= dt;
      if (sp.life <= 0) {
        this.sparkPool.splice(i, 1);
        continue;
      }
      ctx.fillStyle = sp.color;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderHeatWaves(dt) {
    const ctx = this.ctx;
    ctx.save();
    for (let i = this.heatWaves.length - 1; i >= 0; i--) {
      const hw = this.heatWaves[i];
      hw.y -= dt * 35;
      hw.alpha -= dt * 0.6;
      hw.radius += dt * 8;
      if (hw.alpha <= 0) {
        this.heatWaves.splice(i, 1);
        continue;
      }
      ctx.strokeStyle = `rgba(239, 68, 68, ${hw.alpha * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(hw.x, hw.y, hw.radius, Math.PI * 0.8, Math.PI * 0.2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // =========================================================================
  // VIEW 2: MICROSCOPIC ELECTRON DRIFT (DRUDE MODEL)
  // =========================================================================

  renderDriftView(dt, state) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Draw Background Grid
    this.drawCanvasGrid();

    // Wire Conduit Pipe Boundaries
    const pipeTop = h * 0.22;
    const pipeBottom = h * 0.78;
    const pipeLeft = w * 0.08;
    const pipeRight = w * 0.92;

    // Outer casing
    ctx.save();
    ctx.fillStyle = '#F1F5F9';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(pipeLeft, pipeTop, pipeRight - pipeLeft, pipeBottom - pipeTop, 16);
    ctx.fill();
    ctx.stroke();

    // Electric Field Vector Header
    if (state.switchClosed && state.voltage > 0) {
      this.drawElectricFieldArrows(pipeLeft, pipeRight, pipeTop - 25, state);
    }

    // 1. Update and Render Metallic Lattice Ions (Cu2+)
    const tempK = state.temperature + 273.15;
    const jitterAmplitude = Math.min(8.0, 1.2 + Math.sqrt(tempK / 298.15) * 2.5);

    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < this.latticeIons.length; i++) {
      const ion = this.latticeIons[i];
      ion.phase += dt * (15 + (state.temperature / 25) * 10);
      ion.jitterX = Math.cos(ion.phase) * jitterAmplitude;
      ion.jitterY = Math.sin(ion.phase * 1.3) * jitterAmplitude;

      const ix = ion.x0 + ion.jitterX;
      const iy = ion.y0 + ion.jitterY;

      // Golden ion sphere
      const ionGrad = ctx.createRadialGradient(ix - 3, iy - 3, 2, ix, iy, 14);
      ionGrad.addColorStop(0, '#FEF08A');
      ionGrad.addColorStop(1, '#EAB308');

      ctx.fillStyle = ionGrad;
      ctx.strokeStyle = '#CA8A04';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ix, iy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cu2+ Core Label
      ctx.fillStyle = '#713F12';
      ctx.fillText('Cu²⁺', ix, iy);
    }

    // 2. Update and Render Free Electrons (Drude Gas)
    // Drift acceleration from Electric Field
    const isElectronFlow = state.flowDirection === 'electron';
    // If conventional, drift rightward; if electron flow, leftward
    const driftDirection = isElectronFlow ? -1 : 1;
    const driftSpeedPx = state.switchClosed ? (state.driftVelocity * 1e6 * 20 + (state.voltage / 24) * 85) * driftDirection : 0;

    for (let i = 0; i < this.driftElectrons.length; i++) {
      const e = this.driftElectrons[i];

      // Random thermal walk + net electric drift
      e.x += (e.vx + driftSpeedPx) * dt;
      e.y += e.vy * dt;

      // Pipe wall bounce (top and bottom)
      if (e.y < pipeTop + 12) {
        e.y = pipeTop + 12;
        e.vy = Math.abs(e.vy);
      } else if (e.y > pipeBottom - 12) {
        e.y = pipeBottom - 12;
        e.vy = -Math.abs(e.vy);
      }

      // Wrap around horizontal conduit ends
      if (e.x < pipeLeft + 6) e.x = pipeRight - 6;
      if (e.x > pipeRight - 6) e.x = pipeLeft + 6;

      // Collision scattering with lattice ions
      for (let j = 0; j < this.latticeIons.length; j++) {
        const ion = this.latticeIons[j];
        const ix = ion.x0 + ion.jitterX;
        const iy = ion.y0 + ion.jitterY;
        const dist = Math.hypot(e.x - ix, e.y - iy);

        if (dist < 18 && e.collisionTimer <= 0) {
          // Drude scattering: deflect electron in random direction
          const scatterAngle = Math.random() * Math.PI * 2;
          const currentSpd = Math.hypot(e.vx, e.vy);
          e.vx = Math.cos(scatterAngle) * currentSpd;
          e.vy = Math.sin(scatterAngle) * currentSpd;
          e.collisionTimer = 0.08;

          // Collision spark transferring kinetic energy to lattice
          this.createSparks(ix, iy, 2, '#FFFFFF');
          break;
        }
      }

      if (e.collisionTimer > 0) e.collisionTimer -= dt;

      // Draw Electron (Cyan Particle with Glow)
      ctx.fillStyle = '#06B6D4';
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(e.x, e.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Top Microscopic HUD
    this.drawDriftViewHUD(w, h, state);

    ctx.restore();
  }

  drawElectricFieldArrows(x1, x2, y, state) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = '#E63946';
    ctx.fillStyle = '#E63946';
    ctx.lineWidth = 2.5;

    ctx.font = "bold 12px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(`Applied Electric Field E = ${(state.voltage / 0.5).toFixed(1)} V/m →`, (x1 + x2) * 0.5, y - 6);

    // Arrow line across top
    const arrowY = y + 8;
    ctx.beginPath();
    ctx.moveTo(x1 + 40, arrowY);
    ctx.lineTo(x2 - 40, arrowY);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(x2 - 40, arrowY);
    ctx.lineTo(x2 - 50, arrowY - 5);
    ctx.lineTo(x2 - 50, arrowY + 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawDriftViewHUD(w, h, state) {
    const ctx = this.ctx;
    ctx.save();

    // Bottom telemetry strip inside drift view
    const hudY = h * 0.88;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(w * 0.08, hudY, w * 0.84, 44, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'left';

    const vdDisplay = `${(state.driftVelocity * 1e6).toFixed(2)} μm/s`;
    ctx.fillText(`Drift Velocity (v_d): ${vdDisplay}`, w * 0.11, hudY + 26);

    ctx.fillStyle = '#2563EB';
    ctx.fillText(`Carrier Density: n = 8.5×10²⁸ m⁻³`, w * 0.42, hudY + 26);

    ctx.fillStyle = '#D97706';
    ctx.fillText(`Lattice Jitter: T = ${state.temperature.toFixed(1)} °C`, w * 0.72, hudY + 26);

    ctx.restore();
  }

  // =========================================================================
  // VIEW 3: CARTESIAN V-I CHARACTERISTIC GRAPH VIEW
  // =========================================================================

  renderGraphView(dt, state) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Graph Area Margins
    const padLeft = Math.max(70, w * 0.10);
    const padRight = Math.max(40, w * 0.08);
    const padTop = Math.max(50, h * 0.12);
    const padBottom = Math.max(60, h * 0.16);

    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    // Axis Limits: V on Y (0 to 25V), I on X (0 to dynamic maxI in Amperes)
    const maxV = 25.0; // Volts
    // Dynamic max current based on nominal resistance
    const maxI = state.resistance < 15 ? 3.0 : (state.resistance < 50 ? 1.0 : 0.3); // Amperes

    // Coordinate Transforms
    const toScreenX = (iVal) => padLeft + (Math.max(0, iVal) / maxI) * plotW;
    const toScreenY = (vVal) => (padTop + plotH) - (Math.max(0, vVal) / maxV) * plotH;

    ctx.save();

    // 1. Graph Background & Gridlines
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(padLeft, padTop, plotW, plotH);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;

    // X Grid (Current I)
    const xSteps = 5;
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'center';

    for (let step = 0; step <= xSteps; step++) {
      const iVal = (step / xSteps) * maxI;
      const x = toScreenX(iVal);
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + plotH);
      ctx.stroke();

      const label = maxI >= 1.0 ? `${iVal.toFixed(2)} A` : `${(iVal * 1000).toFixed(0)} mA`;
      ctx.fillText(label, x, padTop + plotH + 20);
    }

    // Y Grid (Voltage V)
    const ySteps = 5;
    ctx.textAlign = 'right';

    for (let step = 0; step <= ySteps; step++) {
      const vVal = (step / ySteps) * maxV;
      const y = toScreenY(vVal);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();

      ctx.fillText(`${vVal.toFixed(0)} V`, padLeft - 10, y + 4);
    }

    // 2. Axes Lines
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.stroke();

    // Axis Titles
    ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'center';
    ctx.fillText(`Electric Current I (Amperes)`, padLeft + plotW * 0.5, padTop + plotH + 46);

    ctx.save();
    ctx.translate(padLeft - 44, padTop + plotH * 0.5);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`Potential Difference V (Volts)`, 0, 0);
    ctx.restore();

    // 3. Draw Recorded Experimental Data Points
    if (state.graphDataPoints && state.graphDataPoints.length > 0) {
      for (let i = 0; i < state.graphDataPoints.length; i++) {
        const pt = state.graphDataPoints[i];
        const px = toScreenX(pt.I);
        const py = toScreenY(pt.V);

        // Point circle with border
        ctx.fillStyle = '#7C3AED';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Point coordinate callout on hover or static index
        ctx.font = "bold 9px 'JetBrains Mono', monospace";
        ctx.fillStyle = '#6D28D9';
        ctx.textAlign = 'left';
        ctx.fillText(`(${pt.V.toFixed(1)}V)`, px + 8, py - 4);
      }
    }

    // 4. Draw Linear Regression Best-Fit Line (if enabled)
    if (state.showRegressionLine && state.graphDataPoints && state.graphDataPoints.length >= 2) {
      const reg = window.OhmsLawPhysics.linearRegression(state.graphDataPoints);
      if (reg) {
        // Line from origin (0, 0) through end of axis
        const endI = maxI;
        const endV = reg.slope * endI;

        ctx.strokeStyle = '#16A34A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(toScreenX(0), toScreenY(0));
        ctx.lineTo(toScreenX(endI), toScreenY(endV));
        ctx.stroke();

        // Best-fit slope badge in top corner
        this.drawRegressionBadge(padLeft + 16, padTop + 16, reg, state);
      }
    }

    // 5. Draw Live Real-Time Operating Point (Radar Ping)
    if (state.switchClosed && state.current > 0) {
      const currX = toScreenX(state.currentResistor);
      const currY = toScreenY(state.voltageResistor);

      // Radar pulsating ring
      this.radarPingPhase = (this.radarPingPhase + dt * 2.5) % 1.0;
      const pingRadius = 6 + this.radarPingPhase * 16;
      const pingAlpha = 1.0 - this.radarPingPhase;

      ctx.strokeStyle = `rgba(230, 57, 70, ${pingAlpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(currX, currY, pingRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Center solid dot
      ctx.fillStyle = '#E63946';
      ctx.beginPath();
      ctx.arc(currX, currY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Drop projection lines to axes
      ctx.strokeStyle = 'rgba(230, 57, 70, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(currX, currY);
      ctx.lineTo(currX, padTop + plotH);
      ctx.moveTo(currX, currY);
      ctx.lineTo(padLeft, currY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  drawRegressionBadge(x, y, reg, state) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#86EFAC';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, 220, 68, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 12px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = '#15803D';
    ctx.textAlign = 'left';
    ctx.fillText('📈 Best-Fit Regression Line', x + 10, y + 18);

    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = '#0F172A';
    ctx.fillText(`Slope (R_exp) = ${reg.slope.toFixed(2)} Ω`, x + 10, y + 36);
    ctx.fillText(`Fit Quality R² = ${reg.r2.toFixed(4)}`, x + 10, y + 52);

    ctx.restore();
  }

  // =========================================================================
  // HAZARD OVERLAY: LABORATORY SAFETY FAULT STROBE & BANNER
  // =========================================================================

  renderHazardOverlay(dt, state) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    this.hazardStrobePhase += dt * 5;
    const strobeAlpha = (Math.sin(this.hazardStrobePhase) * 0.5 + 0.5) * 0.25;

    ctx.save();

    // Red Pulsing Strobe Border
    ctx.fillStyle = `rgba(220, 38, 38, ${strobeAlpha})`;
    ctx.fillRect(0, 0, w, h);

    // Hazard Banner Card Sliding Down from Top Center
    const bannerW = Math.min(620, w * 0.9);
    const bannerH = 74;
    const bannerX = (w - bannerW) * 0.5;
    const bannerY = 16;

    ctx.fillStyle = 'rgba(254, 242, 242, 0.96)';
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 12);
    ctx.fill();
    ctx.stroke();

    // Warning Icon
    ctx.font = "26px sans-serif";
    ctx.textAlign = 'left';
    ctx.fillText('⚠️', bannerX + 16, bannerY + 46);

    // Hazard Title
    ctx.font = "bold 14px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = '#991B1B';
    const title = state.hazardType === 'AMMETER_PARALLEL' ? 'CATASTROPHIC HAZARD: Ammeter In Parallel (Short Circuit!)' : 'TOPOLOGY WARNING: Voltmeter In Series (Open Loop!)';
    ctx.fillText(title, bannerX + 54, bannerY + 28);

    // Hazard Description
    ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = '#7F1D1D';
    const sub = state.hazardType === 'AMMETER_PARALLEL' ? 'Ammeter internal resistance R ≈ 0 Ω. Full supply voltage across meter creates extreme surge!' : 'Voltmeter internal resistance R ≈ 100 kΩ. High impedance drops current to near-zero microamps.';
    ctx.fillText(sub, bannerX + 54, bannerY + 50);

    ctx.restore();
  }
}

window.OhmsLawRenderer = OhmsLawRenderer;
