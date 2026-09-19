/**
 * CircuitLab — Interactive Wheatstone Bridge & Meter Bridge
 * Canvas 2D Rendering Engine
 * Renders both the Classical Wheatstone Diamond Network and
 * the Realistic Physics Laboratory Meter Bridge Bench with animated charges,
 * realistic center-zero galvanometer pointer dynamics, and draggable jockey.
 */

import { state, setState } from './state.js';
import { solveWheatstone } from './bridge.js';

export class CircuitRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Display DPI & dimensions
    this.dpr = window.devicePixelRatio || 1;
    this.width = 0;
    this.height = 0;

    // Electron flow particle animation
    this.particles = [];
    this.initParticles();

    // Damped galvanometer needle dynamics
    this.currentDeflection = 0.0;
    this.needleVelocity = 0.0;

    // Interactive drag state
    this.isDraggingJockey = false;
    this.hoveredItem = null;

    // Interactive hitboxes
    this.hitboxes = {
      jockey: null,
      wire: null,
      key1: null,
      key2: null
    };

    // Photographic Apparatus Assets for student memorization
    this.images = {
      resistanceBox: this.loadImage('assets/resistance_box.jpg'),
      resistorCoil: this.loadImage('assets/resistor_coil.jpg'),
      galvanometer: this.loadImage('assets/galvanometer.jpg'),
      jockey: this.loadImage('assets/jockey.jpg'),
      batteryEliminator: this.loadImage('assets/battery_eliminator.jpg')
    };

    this.bindEvents();
    this.resize();

    // Start 60fps render loop
    this.lastTime = performance.now();
    this.renderLoop = this.renderLoop.bind(this);
    requestAnimationFrame(this.renderLoop);
  }

  loadImage(src) {
    const img = new Image();
    img.src = src;
    img.loaded = false;
    img.onload = () => { img.loaded = true; };
    return img;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < 60; i++) {
      this.particles.push({
        t: Math.random(),
        speed: 0.15 + Math.random() * 0.1,
        branch: Math.floor(Math.random() * 5), // 0: P, 1: Q, 2: R, 3: S, 4: Galv
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
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

    const handleDown = (pos) => {
      // Check Jockey hit
      if (this.hitboxes.jockey && this.isPointInBox(pos, this.hitboxes.jockey)) {
        this.isDraggingJockey = true;
        return;
      }

      // Check Wire hit (direct jump of jockey)
      if (this.hitboxes.wire && this.isPointInBox(pos, this.hitboxes.wire)) {
        this.isDraggingJockey = true;
        this.updateJockeyFromX(pos.x);
        return;
      }

      // Check Key 1 hit
      if (this.hitboxes.key1 && this.isPointInCircle(pos, this.hitboxes.key1)) {
        setState({ keyK1: !state.keyK1 });
        return;
      }

      // Check Key 2 hit
      if (this.hitboxes.key2 && this.isPointInCircle(pos, this.hitboxes.key2)) {
        setState({ keyK2: !state.keyK2 });
        return;
      }
    };

    const handleMove = (pos) => {
      if (this.isDraggingJockey) {
        this.updateJockeyFromX(pos.x);
        return;
      }

      // Hover feedback
      let cursor = 'default';
      let hovered = null;

      if (this.hitboxes.jockey && this.isPointInBox(pos, this.hitboxes.jockey)) {
        cursor = 'ew-resize';
        hovered = 'jockey';
      } else if (this.hitboxes.wire && this.isPointInBox(pos, this.hitboxes.wire)) {
        cursor = 'crosshair';
        hovered = 'wire';
      } else if (
        (this.hitboxes.key1 && this.isPointInCircle(pos, this.hitboxes.key1)) ||
        (this.hitboxes.key2 && this.isPointInCircle(pos, this.hitboxes.key2))
      ) {
        cursor = 'pointer';
        hovered = 'key';
      }

      this.canvas.style.cursor = cursor;
      this.hoveredItem = hovered;
    };

    const handleUp = () => {
      if (this.isDraggingJockey) {
        this.isDraggingJockey = false;
      }
    };

    // Mouse Events
    this.canvas.addEventListener('mousedown', (e) => handleDown(getPos(e)));
    window.addEventListener('mousemove', (e) => handleMove(getPos(e)));
    window.addEventListener('mouseup', handleUp);

    // Touch Events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleDown(getPos(e));
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (this.isDraggingJockey) {
        e.preventDefault();
        handleMove(getPos(e));
      }
    }, { passive: false });

    window.addEventListener('touchend', handleUp);
  }

  isPointInBox(pos, box) {
    return pos.x >= box.x && pos.x <= box.x + box.w && pos.y >= box.y && pos.y <= box.y + box.h;
  }

  isPointInCircle(pos, circle) {
    const dx = pos.x - circle.x;
    const dy = pos.y - circle.y;
    return dx * dx + dy * dy <= circle.r * circle.r;
  }

  updateJockeyFromX(x) {
    if (!this.hitboxes.wire) return;
    const { x: wx, w: ww } = this.hitboxes.wire;
    const ratio = Math.max(0.005, Math.min(0.995, (x - wx) / ww));
    const newL = parseFloat((ratio * 100.0).toFixed(1));
    setState({ jockeyPos: newL });
  }

  renderLoop(time) {
    const dt = Math.min(0.05, (time - this.lastTime) / 1000);
    this.lastTime = time;

    // Solve physics for current frame
    const results = solveWheatstone(state);

    // Update damped galvanometer needle physics (spring-damper simulation)
    const targetDeflection = results.deflectionDiv;
    const springK = 80.0;
    const damping = 12.0;
    const force = (targetDeflection - this.currentDeflection) * springK;
    this.needleVelocity += (force - this.needleVelocity * damping) * dt;
    this.currentDeflection += this.needleVelocity * dt;

    // Clear background
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Subtle background grid
    if (state.showGrid) {
      this.drawBackgroundGrid();
    }

    // Render corresponding view
    if (state.mode === 'wheatstone') {
      this.renderWheatstoneDiamond(results, dt);
    } else {
      this.renderMeterBridgeApparatus(results, dt);
    }

    requestAnimationFrame(this.renderLoop);
  }

  drawBackgroundGrid() {
    this.ctx.save();
    this.ctx.strokeStyle = '#f8fafc';
    this.ctx.lineWidth = 1;
    const step = 28;

    this.ctx.beginPath();
    for (let x = 0; x < this.width; x += step) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
    }
    for (let y = 0; y < this.height; y += step) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
    }
    this.ctx.stroke();
    ctxRestore: this.ctx.restore();
  }

  // =========================================================================
  // VIEW 1: CLASSICAL WHEATSTONE DIAMOND SCHEMATIC (WELL-PROPORTIONED)
  // =========================================================================
  renderWheatstoneDiamond(results, dt) {
    const ctx = this.ctx;

    // Perfectly centered coordinates with generous breathing room
    const cx = this.width * 0.50;
    const cy = Math.max(220, Math.round(this.height * 0.45));

    const spanX = Math.min(260, Math.max(180, this.width * 0.28));
    const spanY = Math.min(130, Math.max(105, this.height * 0.23));

    // Primary Diamond Nodes
    const nodeA = { x: cx - spanX, y: cy }; // Left (Battery +)
    const nodeB = { x: cx, y: cy - spanY }; // Top (between P and Q)
    const nodeC = { x: cx + spanX, y: cy }; // Right (Battery - Ground)
    const nodeD = { x: cx, y: cy + spanY }; // Bottom (between R and S)

    // Top Bridge Status Banner
    this.drawBridgeBanner(cx, 22, results);

    // Battery loop coordinates (generous clearance below Node D)
    const batY = nodeD.y + 65;
    const batNodeLeft = { x: nodeA.x, y: batY };
    const batNodeRight = { x: nodeC.x, y: batY };

    // 1. Draw Wires with Potential Heatmap
    this.drawBranchWire(nodeA, nodeB, results.VA, results.VB, 'P');
    this.drawBranchWire(nodeB, nodeC, results.VB, results.VC, 'Q');
    this.drawBranchWire(nodeA, nodeD, results.VA, results.VD, 'R');
    this.drawBranchWire(nodeD, nodeC, results.VD, results.VC, 'S');

    // Central Detector Branch (B to D)
    this.drawBranchWire(nodeB, nodeD, results.VB, results.VD, 'Galv');

    // Battery Circuit External Loop
    this.drawBatteryLoop(nodeA, batNodeLeft, batNodeRight, nodeC, results.VA);

    // 2. Animated Charge Carriers (Electrons)
    if (state.showElectrons && state.keyK1) {
      this.drawAnimatedCharges(nodeA, nodeB, nodeC, nodeD, batNodeLeft, batNodeRight, results, dt);
    }

    // 3. Resistor Components - Self-contained cards with zero external overflow
    this.drawResistorBox((nodeA.x + nodeB.x) / 2, (nodeA.y + nodeB.y) / 2, 'P', 'Ratio 1', 'Arm AB', results.P, results.IP);
    this.drawResistorBox((nodeB.x + nodeC.x) / 2, (nodeB.y + nodeC.y) / 2, 'Q', 'Ratio 2', 'Arm BC', results.Q, results.IQ);
    this.drawResistorBox((nodeA.x + nodeD.x) / 2, (nodeA.y + nodeD.y) / 2, 'R', 'Standard', 'Arm AD', results.R, results.IR);
    this.drawResistorBox((nodeD.x + nodeC.x) / 2, (nodeD.y + nodeC.y) / 2, 'S', 'Unknown X', 'Arm DC', results.S, results.IS);

    // 4. Central Galvanometer Instrument (compact face with internal label)
    const galvR = 36;
    this.drawGalvanometerMeter(cx, cy, galvR, results);

    // 5. Galvanometer Key K2 (centered between Node B and Galvanometer, text to right)
    const key2Y = Math.round((nodeB.y + (cy - galvR)) / 2);
    this.drawPlugKey(cx, key2Y, state.keyK2, 'K₂', 'Galv Key', 'right');
    this.hitboxes.key2 = { x: cx, y: key2Y, r: 18 };

    // 6. Battery Power Supply & Key K1 (below Node D with 35px+ clearance)
    const batX = cx - 65;
    const key1X = cx + 65;
    this.drawBatterySupply(batX, batY, results.VA, state.voltage);
    this.drawPlugKey(key1X, batY, state.keyK1, 'K₁', 'Battery Key', 'below');
    this.hitboxes.key1 = { x: key1X, y: batY, r: 18 };

    // 7. Node Voltage Callout Badges (single line compact pills)
    this.drawNodeBadge(nodeA.x - 56, nodeA.y, 'A', 'Input (+)', results.VA, '#ef4444');
    this.drawNodeBadge(nodeB.x, nodeB.y - 18, 'B', 'Detector Top', results.VB, '#2563eb');
    this.drawNodeBadge(nodeC.x + 56, nodeC.y, 'C', 'Ground (0V)', results.VC, '#10b981');
    this.drawNodeBadge(nodeD.x, nodeD.y + 18, 'D', 'Detector Bottom', results.VD, '#7c3aed');
  }

  drawBridgeBanner(cx, y, results) {
    const ctx = this.ctx;
    ctx.save();
    const isBal = results.isBalanced;
    const bg = isBal ? '#ecfdf5' : '#ffffff';
    const border = isBal ? '#10b981' : '#cbd5e1';
    const textColor = isBal ? '#047857' : '#475569';
    const title = isBal
      ? '✓ BRIDGE IN BALANCE (NULL POINT): P / Q = R / S  ➔  V_B = V_D  ➔  I_g = 0'
      : '⚡ WHEATSTONE BRIDGE NETWORK: Adjust P, Q, R or S to achieve Null Point (I_g = 0)';

    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    const tw = ctx.measureText(title).width + 28;

    ctx.fillStyle = bg;
    ctx.strokeStyle = border;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(15, 23, 42, 0.06)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.roundRect(cx - tw / 2, y - 12, tw, 24, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, cx, y);
    ctx.restore();
  }

  // Draw wire segment with potential gradient
  drawBranchWire(p1, p2, v1, v2, branchName) {
    const ctx = this.ctx;
    ctx.save();
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    if (state.showHeatmap && state.keyK1) {
      const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      grad.addColorStop(0, this.getPotentialColor(v1));
      grad.addColorStop(1, this.getPotentialColor(v2));
      ctx.strokeStyle = grad;
    } else {
      ctx.strokeStyle = '#64748b';
    }

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    ctx.restore();
  }

  drawBatteryLoop(nA, bL, bR, nC, vA) {
    const ctx = this.ctx;
    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = state.keyK1 ? '#2563eb' : '#94a3b8';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(nA.x, nA.y);
    ctx.lineTo(bL.x, bL.y);
    ctx.lineTo(bR.x, bR.y);
    ctx.lineTo(nC.x, nC.y);
    ctx.stroke();
    ctx.restore();
  }

  getPotentialColor(v) {
    const maxV = Math.max(1, state.voltage);
    const norm = Math.max(0, Math.min(1, v / maxV));
    if (norm > 0.8) return '#ef4444';
    if (norm > 0.5) return '#f59e0b';
    if (norm > 0.25) return '#10b981';
    if (norm > 0.1) return '#06b6d4';
    return '#3b82f6';
  }

  getEIAColorBands(ohms) {
    const palette = ['#1e293b', '#854d0e', '#dc2626', '#ea580c', '#eab308', '#16a34a', '#2563eb', '#9333ea', '#64748b', '#f8fafc'];
    const r = Math.max(1, Math.round(ohms));
    const str = r.toString();
    let b1 = palette[1];
    let b2 = palette[0];
    let b3 = palette[1];
    if (str.length === 1) {
      b1 = palette[parseInt(str[0])];
      b2 = palette[0];
      b3 = palette[0];
    } else if (str.length === 2) {
      b1 = palette[parseInt(str[0])];
      b2 = palette[parseInt(str[1])];
      b3 = palette[0];
    } else {
      b1 = palette[parseInt(str[0])];
      b2 = palette[parseInt(str[1])];
      const mult = str.length - 2;
      b3 = palette[Math.min(palette.length - 1, mult)];
    }
    const b4 = '#ca8a04'; // Gold 5% tolerance
    return [b1, b2, b3, b4];
  }

  // Draw Resistor Component with Authentic Ceramic Body & Student Identification Card (Self-Contained)
  drawResistorBox(x, y, label, role, arm, resVal, current) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    const w = 122;
    const h = 46;

    // Card Container (High contrast white badge clearing wire line)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();

    // Row 1 (Dedicated Top Row): Resistor Name & Role (Centered, alone)
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Resistor ${label} (${role})`, 0, -h / 2 + 11);

    // Row 2 (Middle Row): Ceramic Resistor on left, Value on right
    const rbx = -w / 2 + 10;
    const rby = -4;
    const rbw = 32;
    const rbh = 12;

    // Ceramic body
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(rbx, rby, rbw, rbh, 3);
    ctx.fill();
    ctx.stroke();

    // 4 Color Bands
    const bands = this.getEIAColorBands(resVal);
    const bandOffsets = [4, 11, 18, 25];
    bands.forEach((color, idx) => {
      ctx.fillStyle = color;
      ctx.fillRect(rbx + bandOffsets[idx], rby, 3, rbh);
    });

    // Wire leads
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(rbx - 4, rby + rbh / 2);
    ctx.lineTo(rbx, rby + rbh / 2);
    ctx.moveTo(rbx + rbw, rby + rbh / 2);
    ctx.lineTo(rbx + rbw + 4, rby + rbh / 2);
    ctx.stroke();

    // Resistor Value
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${resVal.toFixed(0)} Ω`, w / 2 - 10, rby + 10);

    // Row 3 (Dedicated Bottom Row): Branch Current (Centered, alone)
    if (state.keyK1) {
      ctx.fillStyle = '#2563eb';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`I_${label} = ${(current * 1000).toFixed(1)} mA`, 0, h / 2 - 5);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 8px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('[Key K₁ Open • I = 0]', 0, h / 2 - 5);
    }

    ctx.restore();
  }

  // Central Miniature Galvanometer (in diamond schematic - internal label, no colliding badge)
  drawGalvanometerMeter(x, y, radius, results) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Bezel
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(15, 23, 42, 0.10)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = results.isBalanced ? '#10b981' : '#334155';
    ctx.stroke();

    // Brass inner rim
    ctx.beginPath();
    ctx.arc(0, 0, radius - 3, 0, Math.PI * 2);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Instrument symbol 'G' inside top of dial
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('G', 0, -radius * 0.38);

    // Scale arc
    const arcR = radius * 0.65;
    ctx.beginPath();
    ctx.arc(0, 8, arcR, -Math.PI * 0.72, -Math.PI * 0.28);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#475569';
    ctx.stroke();

    // Scale tick marks
    for (let div = -30; div <= 30; div += 10) {
      const theta = -Math.PI / 2 + (div / 30) * (Math.PI * 0.22);
      const isZero = div === 0;
      const tLen = isZero ? 6 : 4;

      ctx.beginPath();
      ctx.moveTo(arcR * Math.cos(theta), 8 + arcR * Math.sin(theta));
      ctx.lineTo((arcR - tLen) * Math.cos(theta), 8 + (arcR - tLen) * Math.sin(theta));
      ctx.lineWidth = isZero ? 2 : 1;
      ctx.strokeStyle = isZero ? '#10b981' : '#334155';
      ctx.stroke();
    }

    // Pointer needle
    const maxAngle = Math.PI * 0.22;
    const angleRatio = this.currentDeflection / 30.0;
    const needleAngle = -Math.PI / 2 + angleRatio * maxAngle;

    ctx.save();
    ctx.translate(0, 8);
    ctx.rotate(needleAngle);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -arcR);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.restore();

    // Current readout / Status below meter
    ctx.fillStyle = results.isBalanced ? '#15803d' : '#2563eb';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(results.isBalanced ? '✓ NULL POINT (0.0 μA)' : `${(results.Ig * 1e6).toFixed(1)} μA`, 0, radius + 13);

    ctx.restore();
  }

  // Draw Node Voltage Badge (Compact single-line pill)
  drawNodeBadge(x, y, name, role, voltage, color) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    const txt = `Node ${name}: ${voltage.toFixed(2)}V`;
    ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
    const tw = Math.max(86, ctx.measureText(txt).width + 16);
    const th = 22;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.roundRect(-tw / 2, -th / 2, tw, th, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, 0, 0);

    ctx.restore();
  }

  // Draw Plug Key with Role and State (Flexible placement to avoid wire collisions)
  drawPlugKey(x, y, isClosed, label, role, textSide = 'below') {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Base block
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-13, -9, 26, 18, 4);
    ctx.fill();
    ctx.stroke();

    // Plug
    if (isClosed) {
      ctx.fillStyle = '#eab308'; // Brass plug inserted
      ctx.strokeStyle = '#ca8a04';
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = '#0f172a'; // Empty hole
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (textSide === 'right') {
      // Placed to the right of the key (for Key K2)
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`Key ${label} (${role})`, 18, -2);

      ctx.fillStyle = isClosed ? '#15803d' : '#64748b';
      ctx.font = 'bold 8px "JetBrains Mono", monospace';
      ctx.fillText(isClosed ? '[CLOSED]' : '[OPEN]', 18, 9);
    } else {
      // Placed below the key (for Key K1)
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`Key ${label}`, 0, 18);

      ctx.fillStyle = isClosed ? '#15803d' : '#64748b';
      ctx.font = 'bold 8px "JetBrains Mono", monospace';
      ctx.fillText(isClosed ? '[CLOSED]' : '[OPEN]', 0, 28);
    }

    ctx.restore();
  }

  // Draw Battery Supply with Role and Polarity (Strictly below wire to prevent Node D collision)
  drawBatterySupply(x, y, vA, vBat) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;

    // Positive plate (longer)
    ctx.beginPath();
    ctx.moveTo(-7, -10);
    ctx.lineTo(-7, 10);
    ctx.stroke();

    // Negative plate (thicker, shorter)
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(7, -6);
    ctx.lineTo(7, 6);
    ctx.stroke();

    // Signs & Labels
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px "JetBrains Mono"';
    ctx.textAlign = 'right';
    ctx.fillText('+ Pos', -12, 3);

    ctx.fillStyle = '#3b82f6';
    ctx.textAlign = 'left';
    ctx.fillText('− Neg', 12, 3);

    // Callout Title BELOW plates
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`DC Supply (E = ${vBat.toFixed(1)}V)`, 0, 20);

    ctx.fillStyle = '#64748b';
    ctx.font = '8px "Plus Jakarta Sans"';
    ctx.fillText('Battery Arm AC', 0, 30);

    ctx.restore();
  }

  // Draw Animated Moving Charge Dots
  drawAnimatedCharges(nA, nB, nC, nD, bL, bR, results, dt) {
    const ctx = this.ctx;
    ctx.save();

    this.particles.forEach((p) => {
      const currentScale = Math.min(3, Math.max(0.2, results.Itotal * 100));
      p.t = (p.t + p.speed * dt * currentScale) % 1.0;

      let from, to, branchCurrent;
      if (p.branch === 0) {
        from = nA; to = nB; branchCurrent = results.IP;
      } else if (p.branch === 1) {
        from = nB; to = nC; branchCurrent = results.IQ;
      } else if (p.branch === 2) {
        from = nA; to = nD; branchCurrent = results.IR;
      } else if (p.branch === 3) {
        from = nD; to = nC; branchCurrent = results.IS;
      } else {
        if (results.VBD >= 0) {
          from = nB; to = nD;
        } else {
          from = nD; to = nB;
        }
        branchCurrent = Math.abs(results.Ig);
      }

      if (branchCurrent > 1e-6) {
        const px = from.x + (to.x - from.x) * p.t;
        const py = from.y + (to.y - from.y) * p.t;

        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
      }
    });

    ctx.restore();
  }

  // =========================================================================
  // VIEW 2: REALISTIC LABORATORY METER BRIDGE APPARATUS (CLEAN & BALANCED)
  // =========================================================================
  renderMeterBridgeApparatus(results, dt) {
    const ctx = this.ctx;

    // Board Dimensions - Proportional and completely contained
    const benchW = Math.min(this.width - 60, 940);
    const benchMarginX = (this.width - benchW) / 2;
    const benchY = Math.max(148, Math.round(this.height * 0.30));
    const benchH = 160;

    // Top Status Banner for Student Education
    this.drawMeterBanner(this.width * 0.5, 20, results);

    // 1. Draw Wooden Laboratory Bench with Grain
    this.drawWoodenBench(benchMarginX, benchY, benchW, benchH);

    // 2. Metric 100 cm Graduated Ruler
    const rulerX = benchMarginX + 38;
    const rulerW = benchW - 76;
    const rulerY = benchY + 82;
    const rulerH = 26;
    this.drawMetricRuler(rulerX, rulerY, rulerW, rulerH);

    // 3. Stretched Manganin Bridge Wire (Uniform cross-section)
    const wireY = rulerY + 6;
    this.drawStretchedWire(rulerX, wireY, rulerW);
    this.hitboxes.wire = { x: rulerX, y: rulerY - 8, w: rulerW, h: rulerH + 16 };

    // 4. Heavy Brass Binding Strips (Left L, Center, Right L)
    const stripY = benchY + 14;
    this.drawBrassStrips(rulerX, rulerW, stripY);

    // 5. Left Gap: Standard Resistance Box (R) with photo asset and callout
    const gap1CX = rulerX + rulerW * 0.22;
    this.drawPhysicalResistanceBox(gap1CX, stripY - 6, results.R);

    // 6. Right Gap: Unknown Wire Coil (X / S) with photo asset and callout
    const gap2CX = rulerX + rulerW * 0.78;
    this.drawUnknownResistanceCoil(gap2CX, stripY - 6, results.S);

    // 7. Laboratory Center-Zero Galvanometer sitting neatly between banner and bench
    const galvX = rulerX + rulerW * 0.50;
    const galvY = Math.round((32 + benchY) / 2);
    const galvR = 34;
    this.drawFullLabGalvanometer(galvX, galvY, galvR, results);

    // 8. Connecting Wires (Connected to terminals below Galvanometer)
    this.drawApparatusWires(rulerX, rulerW, stripY, wireY, gap1CX, gap2CX, galvX, galvY, galvR);

    // 9. Interactive Draggable Jockey with pointer and label
    const jockeyX = rulerX + (state.jockeyPos / 100.0) * rulerW;
    this.drawJockey(jockeyX, wireY, results.isBalanced);
    this.hitboxes.jockey = { x: jockeyX - 16, y: wireY - 42, w: 32, h: 48 };

    // 10. Balancing Dimension Brackets below ruler (l and 100-l)
    this.drawBalancingDimensionBrackets(rulerX, rulerW, rulerY + rulerH + 4, jockeyX, state.jockeyPos, results);

    // 11. Battery Eliminator centered below the bench
    const batBoxW = 150;
    const batBoxX = rulerX + rulerW * 0.5 - batBoxW / 2;
    const batBoxY = benchY + benchH + 14;
    this.drawBenchBatterySupply(batBoxX, batBoxY, rulerX, rulerX + rulerW, wireY);
  }

  drawMeterBanner(cx, y, results) {
    const ctx = this.ctx;
    ctx.save();
    const isBal = results.isBalanced;
    const bg = isBal ? '#ecfdf5' : '#ffffff';
    const border = isBal ? '#10b981' : '#cbd5e1';
    const textColor = isBal ? '#047857' : '#475569';
    const l = state.jockeyPos;
    const computedX = (results.R * (100 - l) / Math.max(0.1, l)).toFixed(2);
    const title = isBal
      ? `✓ NULL POINT BALANCED: l = ${l.toFixed(1)} cm  ➔  X = R·(100−l)/l = ${computedX} Ω (I_g = 0 μA)`
      : `⚡ METER BRIDGE APPARATUS: Drag Jockey along wire to locate Null Point (I_g = 0 μA)`;

    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    const tw = ctx.measureText(title).width + 28;

    ctx.fillStyle = bg;
    ctx.strokeStyle = border;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(15, 23, 42, 0.06)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.roundRect(cx - tw / 2, y - 11, tw, 22, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, cx, y);
    ctx.restore();
  }

  drawBalancingDimensionBrackets(rulerX, rulerW, y, jockeyX, l, results) {
    const ctx = this.ctx;
    ctx.save();

    const bracketY = y + 7;
    const arrowSize = 4;

    // 1. Left Bracket (Balancing Length l, Arm P)
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rulerX, bracketY - 4);
    ctx.lineTo(rulerX, bracketY + 4);
    ctx.moveTo(rulerX, bracketY);
    ctx.lineTo(jockeyX, bracketY);
    ctx.moveTo(jockeyX, bracketY - 4);
    ctx.lineTo(jockeyX, bracketY + 4);
    ctx.stroke();

    if (jockeyX - rulerX > 20) {
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.moveTo(rulerX, bracketY);
      ctx.lineTo(rulerX + arrowSize, bracketY - arrowSize);
      ctx.lineTo(rulerX + arrowSize, bracketY + arrowSize);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(jockeyX, bracketY);
      ctx.lineTo(jockeyX - arrowSize, bracketY - arrowSize);
      ctx.lineTo(jockeyX - arrowSize, bracketY + arrowSize);
      ctx.fill();
    }

    const leftMidX = (rulerX + jockeyX) / 2;
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#1e40af';
    ctx.textAlign = 'center';
    ctx.fillText(`l = ${l.toFixed(1)} cm [Arm P]`, leftMidX, bracketY + 11);

    // 2. Right Bracket (Remaining Length 100 - l, Arm Q)
    const rightEndX = rulerX + rulerW;
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rightEndX, bracketY - 4);
    ctx.lineTo(rightEndX, bracketY + 4);
    ctx.moveTo(jockeyX, bracketY);
    ctx.lineTo(rightEndX, bracketY);
    ctx.moveTo(rightEndX, bracketY - 4);
    ctx.lineTo(rightEndX, bracketY + 4);
    ctx.stroke();

    if (rightEndX - jockeyX > 20) {
      ctx.fillStyle = '#7c3aed';
      ctx.beginPath();
      ctx.moveTo(jockeyX, bracketY);
      ctx.lineTo(jockeyX + arrowSize, bracketY - arrowSize);
      ctx.lineTo(jockeyX + arrowSize, bracketY + arrowSize);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(rightEndX, bracketY);
      ctx.lineTo(rightEndX - arrowSize, bracketY - arrowSize);
      ctx.lineTo(rightEndX - arrowSize, bracketY + arrowSize);
      ctx.fill();
    }

    const rightMidX = (jockeyX + rightEndX) / 2;
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#5b21b6';
    ctx.textAlign = 'center';
    ctx.fillText(`(100−l) = ${(100 - l).toFixed(1)} cm [Arm Q]`, rightMidX, bracketY + 11);

    ctx.restore();
  }

  drawWoodenBench(x, y, w, h) {
    const ctx = this.ctx;
    ctx.save();

    // Wood Base Shadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    // Wood Grain Gradient
    const woodGrad = ctx.createLinearGradient(x, y, x, y + h);
    woodGrad.addColorStop(0, '#fef3c7');
    woodGrad.addColorStop(0.5, '#fde68a');
    woodGrad.addColorStop(1, '#f59e0b');

    ctx.fillStyle = woodGrad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Wood border
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#d97706';
    ctx.stroke();

    // Subtle wood grain streaks
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.08)';
    ctx.lineWidth = 1.5;
    for (let i = y + 14; i < y + h - 14; i += 16) {
      ctx.beginPath();
      ctx.moveTo(x + 10, i);
      ctx.lineTo(x + w - 10, i);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawMetricRuler(x, y, w, h) {
    const ctx = this.ctx;
    ctx.save();

    // Polished Birch Ruler
    ctx.fillStyle = '#fffbeb';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();

    // Millimeter and Centimeter Graduations
    for (let cm = 0; cm <= 100; cm++) {
      const rx = x + (cm / 100) * w;
      const isTen = cm % 10 === 0;
      const isFive = cm % 5 === 0;
      const tickH = isTen ? 12 : isFive ? 8 : 4;

      ctx.beginPath();
      ctx.moveTo(rx, y);
      ctx.lineTo(rx, y + tickH);
      ctx.lineWidth = isTen ? 1.5 : 0.8;
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();

      // Number labels every 10 cm
      if (isTen) {
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(cm.toString(), rx, y + h - 5);
      }
    }

    ctx.restore();
  }

  drawStretchedWire(x, y, w) {
    const ctx = this.ctx;
    ctx.save();

    // Metallic Constantan Wire
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.stroke();

    // Subtle metallic highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y - 0.5);
    ctx.lineTo(x + w, y - 0.5);
    ctx.stroke();

    ctx.restore();
  }

  drawBrassStrips(rulerX, rulerW, stripY) {
    const ctx = this.ctx;
    const stripH = 30;
    const thickness = 18;

    const drawBrassBar = (bx, by, bw, bh) => {
      ctx.save();
      const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.5, '#eab308');
      grad.addColorStop(1, '#ca8a04');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(bx, by, bw, bh);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    const drawTerminalScrew = (tx, ty) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(tx, ty, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ca8a04';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.2;
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(tx, ty, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
      ctx.restore();
    };

    // 1. Left L-strip
    drawBrassBar(rulerX - 18, stripY, 28, stripH);
    drawBrassBar(rulerX - 18, stripY + stripH, thickness, 56);
    drawTerminalScrew(rulerX - 4, stripY + 10);
    drawTerminalScrew(rulerX - 9, stripY + stripH + 42);

    // Callout badge for Terminal A
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('Terminal A (0cm)', rulerX - 22, stripY + stripH + 45);

    // 2. Right L-strip
    drawBrassBar(rulerX + rulerW - 10, stripY, 28, stripH);
    drawBrassBar(rulerX + rulerW, stripY + stripH, thickness, 56);
    drawTerminalScrew(rulerX + rulerW + 4, stripY + 10);
    drawTerminalScrew(rulerX + rulerW + 9, stripY + stripH + 42);

    // Callout badge for Terminal C
    ctx.textAlign = 'left';
    ctx.fillText('Terminal C (100cm)', rulerX + rulerW + 22, stripY + stripH + 45);

    // 3. Central Straight Strip (leaving two gaps)
    const gapMargin = rulerW * 0.28;
    const centerW = rulerW - gapMargin * 2;
    const centerStartX = rulerX + gapMargin;
    drawBrassBar(centerStartX, stripY, centerW, stripH);

    // 3 Terminal screws on central strip
    drawTerminalScrew(centerStartX + 10, stripY + 15);
    drawTerminalScrew(centerStartX + centerW / 2, stripY + 15); // Galvanometer connection
    drawTerminalScrew(centerStartX + centerW - 10, stripY + 15);

    // Callout badge for Terminal D (Positioned neatly ABOVE the central strip to keep jockey corridor clear)
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Terminal D (Detector)', centerStartX + centerW / 2, stripY - 4);
  }

  drawPhysicalResistanceBox(x, y, resVal) {
    const ctx = this.ctx;
    const w = 84;
    const h = 42;

    ctx.save();
    ctx.translate(x, y);

    // If real photographic image is loaded, render it!
    if (this.images.resistanceBox && this.images.resistanceBox.loaded) {
      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.15)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 6);
      ctx.clip();
      ctx.drawImage(this.images.resistanceBox, -w / 2, -h / 2, w, h);
      ctx.restore();

      // Border
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 6);
      ctx.stroke();
    } else {
      // Teakwood box base fallback
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 5);
      ctx.fill();
      ctx.stroke();

      // Top ebonite plate
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, 3);
      ctx.fill();
      ctx.stroke();

      // Plugs
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.arc(i * 14, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? '#1e293b' : '#a16207';
        ctx.fill();
      }
    }

    // Callout Card Badge above (Compact single-line)
    const bw = 116;
    const bh = 18;
    const by = -h / 2 - bh - 4;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.roundRect(-bw / 2, by, bw, bh, 5);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();

    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`R = ${resVal.toFixed(1)} Ω (Known)`, 0, by + 12);

    ctx.restore();
  }

  drawUnknownResistanceCoil(x, y, sVal) {
    const ctx = this.ctx;
    const w = 80;
    const h = 42;

    ctx.save();
    ctx.translate(x, y);

    // If real photographic image is loaded, render it!
    if (this.images.resistorCoil && this.images.resistorCoil.loaded) {
      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.15)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 6);
      ctx.clip();
      ctx.drawImage(this.images.resistorCoil, -w / 2, -h / 2, w, h);
      ctx.restore();

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 6);
      ctx.stroke();
    } else {
      // Bobbin Base Fallback
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 6);
      ctx.fill();
      ctx.stroke();

      // Copper Wire Turns
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2.2;
      for (let i = -24; i <= 24; i += 6) {
        ctx.beginPath();
        ctx.moveTo(i, -12);
        ctx.lineTo(i, 12);
        ctx.stroke();
      }
    }

    // Callout Card Badge above (Compact single-line)
    const bw = 116;
    const bh = 18;
    const by = -h / 2 - bh - 4;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.roundRect(-bw / 2, by, bw, bh, 5);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();

    ctx.fillStyle = '#6d28d9';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`X = ${sVal.toFixed(1)} Ω (Unknown)`, 0, by + 12);

    ctx.restore();
  }

  drawFullLabGalvanometer(x, y, radius, results) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Title label directly above meter rim (No colliding floating box)
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Center-Zero Galvanometer (G)', 0, -radius - 5);

    // If real image is loaded, render dial face from photo
    if (this.images.galvanometer && this.images.galvanometer.loaded) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radius + 4, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(this.images.galvanometer, -radius - 4, -radius - 4, (radius + 4) * 2, (radius + 4) * 2);
      ctx.restore();

      // Brass outer rim
      ctx.beginPath();
      ctx.arc(0, 0, radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else {
      // Outer Housing Fallback
      ctx.beginPath();
      ctx.arc(0, 0, radius + 6, 0, Math.PI * 2);
      ctx.fillStyle = '#334155';
      ctx.fill();

      // Brass Bezel Ring
      ctx.beginPath();
      ctx.arc(0, 0, radius + 2, 0, Math.PI * 2);
      ctx.fillStyle = '#eab308';
      ctx.fill();

      // White Glass Face
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#475569';
      ctx.stroke();

      // Scale Arc (needle pivot is at y = 14)
      const pivotY = 14;
      const arcR = radius * 0.72;
      ctx.beginPath();
      ctx.arc(0, pivotY, arcR, -Math.PI * 0.72, -Math.PI * 0.28);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Clean, spaced tick marks and labels (-30, 0, +30)
      for (let div = -30; div <= 30; div += 10) {
        const theta = -Math.PI / 2 + (div / 30) * (Math.PI * 0.22);
        const isZero = div === 0;
        const isEnd = Math.abs(div) === 30;
        const tLen = (isZero || isEnd) ? 6 : 3.5;

        ctx.beginPath();
        ctx.moveTo(arcR * Math.cos(theta), pivotY + arcR * Math.sin(theta));
        ctx.lineTo((arcR - tLen) * Math.cos(theta), pivotY + (arcR - tLen) * Math.sin(theta));
        ctx.lineWidth = isZero ? 2 : 1;
        ctx.strokeStyle = isZero ? '#10b981' : '#0f172a';
        ctx.stroke();

        if (isZero || isEnd) {
          ctx.fillStyle = isZero ? '#10b981' : '#64748b';
          ctx.font = 'bold 8.5px "JetBrains Mono"';
          ctx.textAlign = 'center';
          const lbl = isZero ? '0' : Math.abs(div).toString();
          ctx.fillText(lbl, (arcR - 12) * Math.cos(theta), pivotY + (arcR - 12) * Math.sin(theta) + 3);
        }
      }
    }

    // Moving Needle Pointer
    const pivotY = 14;
    const arcR = radius * 0.72;
    const needleTheta = -Math.PI / 2 + (this.currentDeflection / 30) * (Math.PI * 0.22);
    ctx.beginPath();
    ctx.moveTo(0, pivotY);
    ctx.lineTo((arcR + 4) * Math.cos(needleTheta), pivotY + (arcR + 4) * Math.sin(needleTheta));
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Pivot cap
    ctx.beginPath();
    ctx.arc(0, pivotY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Status readout at bottom
    ctx.fillStyle = results.isBalanced ? '#15803d' : '#1d4ed8';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    const statusTxt = results.isBalanced ? '✓ 0.0 μA (NULL)' : `I_g = ${(results.Ig * 1e6).toFixed(1)} μA`;
    ctx.fillText(statusTxt, 0, radius + 12);

    ctx.restore();
  }

  drawJockey(x, wireY, isBalanced) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, wireY);

    // Brass knife-edge contact blade
    ctx.fillStyle = isBalanced ? '#10b981' : '#eab308';
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-5, -14);
    ctx.lineTo(5, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Insulated ebonite handle
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-5, -34, 10, 20, 3);
    ctx.fill();

    // Grip ridges on handle
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;
    for (let h = -30; h <= -18; h += 4) {
      ctx.beginPath();
      ctx.moveTo(-3.5, h);
      ctx.lineTo(3.5, h);
      ctx.stroke();
    }

    // Contact spark when circuit active
    if (state.keyK1) {
      ctx.beginPath();
      ctx.arc(0, 0, isBalanced ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isBalanced ? 'rgba(16, 185, 129, 0.8)' : 'rgba(234, 179, 8, 0.8)';
      ctx.fill();
    }

    // Callout Badge with Downward Pointer Arrow (Compact, cleanly fits above handle)
    const bw = 96;
    const bh = 18;
    const by = -48;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = isBalanced ? '#10b981' : '#2563eb';
    ctx.lineWidth = 1.4;
    ctx.shadowColor = 'rgba(15, 23, 42, 0.10)';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.roundRect(-bw / 2, by, bw, bh, 4);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();

    // Downward arrow pointing to knife edge
    ctx.fillStyle = isBalanced ? '#10b981' : '#2563eb';
    ctx.beginPath();
    ctx.moveTo(-3.5, by + bh);
    ctx.lineTo(3.5, by + bh);
    ctx.lineTo(0, by + bh + 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = isBalanced ? '#047857' : '#1d4ed8';
    ctx.font = 'bold 8.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Jockey: ${state.jockeyPos.toFixed(1)} cm`, 0, by + 12);

    ctx.restore();
  }

  drawApparatusWires(rulerX, rulerW, stripY, wireY, gap1CX, gap2CX, galvX, galvY, galvR) {
    const ctx = this.ctx;
    ctx.save();
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';

    // 1. Galvanometer wire from center strip terminal to Galvanometer bottom
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(galvX, stripY + 15);
    ctx.lineTo(galvX, galvY + galvR + 4);
    ctx.stroke();

    // 2. Galvanometer to Jockey wire (Leaves from bottom-left terminal, loops smoothly to handle)
    const jockeyX = rulerX + (state.jockeyPos / 100.0) * rulerW;
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(galvX - 10, galvY + galvR + 4);
    ctx.bezierCurveTo(galvX - 22, galvY + galvR + 24, jockeyX, wireY - 55, jockeyX, wireY - 34);
    ctx.stroke();

    ctx.restore();
  }

  drawBenchBatterySupply(x, y, leftTerminalX, rightTerminalX, wireY) {
    const ctx = this.ctx;
    ctx.save();

    // Battery Eliminator Box
    const boxW = 150;
    const boxH = 44;

    if (this.images.batteryEliminator && this.images.batteryEliminator.loaded) {
      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.15)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, boxW, boxH, 6);
      ctx.clip();
      ctx.drawImage(this.images.batteryEliminator, x, y, boxW, boxH);
      ctx.restore();

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, boxW, boxH, 6);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(x, y, boxW, boxH, 6);
      ctx.fill();
      ctx.stroke();
    }

    // Callout Label Card on Battery
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.beginPath();
    ctx.roundRect(x + 5, y + 5, boxW - 10, boxH - 10, 4);
    ctx.fill();

    // LED indicator
    ctx.beginPath();
    ctx.arc(x + 16, y + boxH / 2, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = state.keyK1 ? '#10b981' : '#dc2626';
    ctx.fill();

    // Title and voltage text inside box (Clean, nothing overlaps!)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9.5px "Plus Jakarta Sans"';
    ctx.textAlign = 'left';
    ctx.fillText('DC Battery Eliminator (E)', x + 26, y + 17);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 8.5px "JetBrains Mono"';
    ctx.fillText(`${state.voltage.toFixed(1)}V DC Supply • Arm AC`, x + 26, y + 31);

    // 1. Red (+) wire: Leaves LEFT side of box, runs left to Terminal A
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(x, y + boxH / 2);
    ctx.lineTo(leftTerminalX - 9, y + boxH / 2);
    ctx.lineTo(leftTerminalX - 9, wireY + 15);
    ctx.stroke();

    // Red wire label placed neatly along the wire path outside the box
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 8.5px "JetBrains Mono"';
    ctx.textAlign = 'center';
    ctx.fillText('(+) Red Lead → A', (x + leftTerminalX - 9) / 2, y + boxH / 2 - 5);

    // 2. Blue (−) wire: Leaves RIGHT side of box, runs right to Terminal C
    ctx.strokeStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(x + boxW, y + boxH / 2);
    ctx.lineTo(rightTerminalX + 9, y + boxH / 2);
    ctx.lineTo(rightTerminalX + 9, wireY + 15);
    ctx.stroke();

    // Blue wire label placed neatly along the wire path outside the box
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 8.5px "JetBrains Mono"';
    ctx.textAlign = 'center';
    ctx.fillText('(−) Blue Lead → C', (x + boxW + rightTerminalX + 9) / 2, y + boxH / 2 - 5);

    ctx.restore();
  }
}
