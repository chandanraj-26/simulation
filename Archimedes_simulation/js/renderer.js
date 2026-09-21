/**
 * ArchimedesLab — Interactive Archimedes' Principle & Buoyancy Simulation
 * Canvas 2D Rendering Engine
 * Fully functional interactive apparatus:
 * - Clickable Refill Water Tap that fills water from nozzle directly into the tank
 * - Calibrated water level and guaranteed spring balance vertical clearance (no clipping)
 * - Displaced fluid beaker on digital precision scale with realistic water, waves, and bubbles
 * - Parabolic droplet stream from bottom overflow spout into catch beaker
 * - Brushed metallic cylinder with 1:1 precision drag tracking
 * - Live verification card (Weight Loss = Displaced Fluid)
 */

import { state, setState, FLUID_PRESETS, MATERIAL_PRESETS } from './state.js';
import { solveArchimedes } from './physics.js';

export class HydroRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.width = canvas.width;
    this.height = canvas.height;
    this.dpr = window.devicePixelRatio || 1;
    this.time = 0;

    // Interactive Tap State
    this.isTapOpen = false;
    this.tapFlowTime = 0;
    this.tapSplashes = [];

    // Harmonic bobbing state for free-floating mode
    this.bobbingY = 0;
    this.bobbingVel = 0;
    this.isBobbing = false;

    // Wave animation phase
    this.wavePhase = 0;

    // Dynamic droplet particles from overflow spout
    this.droplets = [];

    // Splash ripples on catch beaker surface
    this.beakerRipples = [];

    // Animated rising bubbles inside catch beaker
    this.beakerBubbles = [
      { xFrac: 0.25, yFrac: 0.85, radius: 2.8, speed: 0.40 },
      { xFrac: 0.48, yFrac: 0.45, radius: 3.5, speed: 0.50 },
      { xFrac: 0.72, yFrac: 0.65, radius: 2.2, speed: 0.35 },
      { xFrac: 0.34, yFrac: 0.20, radius: 3.0, speed: 0.45 },
      { xFrac: 0.62, yFrac: 0.90, radius: 2.6, speed: 0.55 },
      { xFrac: 0.80, yFrac: 0.35, radius: 2.0, speed: 0.38 }
    ];

    // Interactive bounds cache
    this.interactiveBounds = {
      object: null,
      tap: null,
      scale: null
    };

    this.hoveredInteractive = null;
    this.isDraggingObject = false;
    this.dragStartY = 0;
    this.dragStartSubmersion = 0;
    this.objectTravelDistance = 99;

    this.initCanvas();
    this.bindEvents();
    this.startLoop();
  }

  initCanvas() {
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;

    this.ctx.resetTransform?.() || this.ctx.setTransform(1, 0, 0, 1, 0, 0);
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

    const handlePointerDown = (e) => {
      const pos = getPos(e);

      // 1. Check Tap Click
      if (this.interactiveBounds.tap && this.isInsideRect(pos, this.interactiveBounds.tap)) {
        this.isTapOpen = !this.isTapOpen;
        e.preventDefault();
        return;
      }

      // 2. Check Digital Scale Click (Tare / Empty Displaced Beaker)
      if (this.interactiveBounds.scale && this.isInsideRect(pos, this.interactiveBounds.scale)) {
        setState({ submersionPct: 0 });
        this.droplets = [];
        this.beakerRipples = [];
        e.preventDefault();
        return;
      }

      // 3. Check Cylinder Drag Click
      if (this.interactiveBounds.object && this.isInsideRect(pos, this.interactiveBounds.object)) {
        this.isDraggingObject = true;
        this.dragStartY = pos.y;
        this.dragStartSubmersion = state.submersionPct;
        this.canvas.style.cursor = 'grabbing';
        e.preventDefault();
      }
    };

    const handlePointerMove = (e) => {
      const pos = getPos(e);

      if (this.isDraggingObject) {
        const deltaY = pos.y - this.dragStartY;
        const travel = this.objectTravelDistance || 99;
        const deltaPct = (deltaY / travel) * 100;
        let newPct = Math.max(0, Math.min(100, this.dragStartSubmersion + deltaPct));

        if (state.mode === 'flotation') {
          this.bobbingY = deltaY * 0.45;
          this.bobbingVel = 0;
        } else {
          setState({ submersionPct: newPct });
        }
        e.preventDefault();
      } else {
        // Update Cursor & Hover
        if (this.interactiveBounds.tap && this.isInsideRect(pos, this.interactiveBounds.tap)) {
          this.canvas.style.cursor = 'pointer';
          this.hoveredInteractive = 'tap';
        } else if (this.interactiveBounds.scale && this.isInsideRect(pos, this.interactiveBounds.scale)) {
          this.canvas.style.cursor = 'pointer';
          this.hoveredInteractive = 'scale';
        } else if (this.interactiveBounds.object && this.isInsideRect(pos, this.interactiveBounds.object)) {
          this.canvas.style.cursor = 'grab';
          this.hoveredInteractive = 'object';
        } else {
          this.canvas.style.cursor = 'default';
          this.hoveredInteractive = null;
        }
      }
    };

    const handlePointerUp = () => {
      if (this.isDraggingObject) {
        this.isDraggingObject = false;
        this.canvas.style.cursor = 'grab';
        if (state.mode === 'flotation') {
          this.isBobbing = true;
          this.bobbingVel = -this.bobbingY * 0.18;
        }
      }
    };

    this.canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    this.canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
  }

  isInsideRect(pt, r) {
    return pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h;
  }

  startLoop() {
    const loop = (timestamp) => {
      this.time = timestamp * 0.001;
      this.updatePhysics();
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  updatePhysics() {
    this.wavePhase += 0.04;

    // Tap Flow Simulation & Splashes
    if (this.isTapOpen) {
      this.tapFlowTime += 0.06;
      // Splash particles where stream enters tank water
      if (this.tapContactX && this.tapContactY && Math.random() < 0.6) {
        this.tapSplashes.push({
          x: this.tapContactX + (Math.random() * 8 - 4),
          y: this.tapContactY,
          vx: (Math.random() - 0.5) * 2.2,
          vy: -Math.random() * 2.5 - 1.2,
          alpha: 1.0,
          radius: 1.5 + Math.random() * 1.5
        });
      }
    }

    // Update Tap Splashes
    for (let i = this.tapSplashes.length - 1; i >= 0; i--) {
      const s = this.tapSplashes[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.22;
      s.alpha -= 0.035;
      if (s.alpha <= 0) this.tapSplashes.splice(i, 1);
    }

    // Harmonic bobbing for floating mode
    if (this.isBobbing) {
      const springK = 0.065;
      const damping = 0.92;
      const acc = -springK * this.bobbingY;
      this.bobbingVel = (this.bobbingVel + acc) * damping;
      this.bobbingY += this.bobbingVel;

      if (Math.abs(this.bobbingY) < 0.15 && Math.abs(this.bobbingVel) < 0.05) {
        this.bobbingY = 0;
        this.bobbingVel = 0;
        this.isBobbing = false;
      }
    }

    // Overflow droplet particles from spout when cylinder is submerged OR tap is running
    const shouldDisplace = (state.mode === 'eureka') && (state.submersionPct > 2 || this.isTapOpen);
    if (shouldDisplace) {
      if (Math.random() < 0.50 && this.spoutTipX && this.spoutTipY) {
        this.droplets.push({
          x: this.spoutTipX,
          y: this.spoutTipY,
          vx: 1.5 + Math.random() * 0.5,
          vy: 0.6 + Math.random() * 0.4,
          alpha: 1.0,
          radius: 2.4 + Math.random() * 1.4
        });
      }
    }

    // Update Droplets
    for (let i = this.droplets.length - 1; i >= 0; i--) {
      const d = this.droplets[i];
      d.x += d.vx;
      d.y += d.vy;
      d.vy += 0.28;
      d.alpha -= 0.015;

      // When droplet hits beaker fluid surface, spawn ripple
      if (this.beakerWaterSurfaceY && d.y >= this.beakerWaterSurfaceY && d.x >= this.beakerLeftX && d.x <= this.beakerRightX) {
        this.beakerRipples.push({
          x: d.x,
          y: this.beakerWaterSurfaceY,
          radius: 2,
          maxRadius: 16,
          alpha: 0.8
        });
        this.droplets.splice(i, 1);
        continue;
      }

      if (d.alpha <= 0 || (this.beakerCatchFloorY && d.y >= this.beakerCatchFloorY)) {
        this.droplets.splice(i, 1);
      }
    }

    // Update Beaker Ripples
    for (let i = this.beakerRipples.length - 1; i >= 0; i--) {
      const r = this.beakerRipples[i];
      r.radius += 0.6;
      r.alpha -= 0.035;
      if (r.alpha <= 0) this.beakerRipples.splice(i, 1);
    }

    // Update Catch Beaker Rising Bubbles
    for (const b of this.beakerBubbles) {
      b.yFrac -= 0.005 * b.speed;
      if (b.yFrac < 0) {
        b.yFrac = 1.0;
        b.xFrac = 0.15 + Math.random() * 0.70;
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    const sol = solveArchimedes(state);

    // Soft Light-Cyan Grid Background (matching real-world lab)
    this.renderLabBackground(ctx, w, h);

    // Render active mode
    if (state.mode === 'eureka') {
      this.renderEurekaMode(ctx, w, h, sol);
    } else if (state.mode === 'pressure') {
      this.renderPressureMode(ctx, w, h, sol);
    } else if (state.mode === 'flotation') {
      this.renderFlotationMode(ctx, w, h, sol);
    }
  }

  // =========================================================================
  // LABORATORY BACKGROUND & GRID
  // =========================================================================
  renderLabBackground(ctx, w, h) {
    ctx.fillStyle = '#f4f9fd';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.12)';
    ctx.lineWidth = 1;
    const step = 32;

    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // =========================================================================
  // 1. EUREKA OVERFLOW LAB (EXACT REAL-WORLD SETUP WITH GUARANTEED CLEARANCES)
  // =========================================================================
  renderEurekaMode(ctx, w, h, sol) {
    const floorY = h - 30;

    // Horizontal centering
    const apparatusW = 680;
    const leftMargin = Math.max(30, (w - apparatusW) * 0.35 + 20);

    // Elevated Table: slab is elevated so spout tip is safely above catch beaker
    const tableW = 320;
    const tableH = 20;
    const tableX = leftMargin + 30;
    const tableY = floorY - 145;

    // Main Tank: bottom rests on table slab
    const tankW = 270;
    const tankH = 225;
    const tankX = tableX + 25;
    // Guaranteed top rim coordinate: ALWAYS >= 180 so spring balance has plenty of headroom
    const tankY = Math.max(185, tableY - tankH);

    // Water level calibrated at ~320 mL line (tankY + 103)
    const waterLevelY = tankY + 103;

    // Overflow Spout near bottom right of tank
    const spoutY = tankY + tankH - 38;
    const spoutLength = 76;
    this.spoutTipX = tankX + tankW + spoutLength;
    this.spoutTipY = spoutY + 10;

    // Catch Beaker & Digital Scale on floor to the right
    const scaleX = tankX + tankW + 82;
    const scaleW = 160;
    const scaleH = 34;
    const scaleY = floorY - scaleH;

    const beakerW = 115;
    const beakerH = 140;
    const beakerX = scaleX + (scaleW - beakerW) / 2;
    const beakerY = scaleY - beakerH;
    this.beakerLeftX = beakerX;
    this.beakerRightX = beakerX + beakerW;
    this.beakerCatchFloorY = scaleY - 16;

    this.interactiveBounds.scale = {
      x: scaleX,
      y: scaleY,
      w: scaleW,
      h: scaleH
    };

    const fluidInfo = FLUID_PRESETS[state.fluidType] || FLUID_PRESETS.water;
    const matInfo = MATERIAL_PRESETS[state.materialType] || MATERIAL_PRESETS.iron;

    // 1. Elevated Table
    this.renderLabTable(ctx, tableX, tableY, tableW, tableH, floorY);

    // 2. Main Water Tank
    this.renderMainTank(ctx, tankX, tankY, tankW, tankH, waterLevelY, spoutY, spoutLength, fluidInfo, sol);

    // 3. Fully Functional Water Refill Tap
    this.renderWaterTap(ctx, tankX, tankY, waterLevelY);

    // 4. Suspended Metallic Cylinder (Guaranteed no overlap with spring balance)
    const centerX = tankX + tankW / 2;
    const objW = (state.objectShape === 'boat') ? 130 : 82;
    const objH = (state.objectShape === 'boat') ? 65 : 86;
    const objX = centerX - objW / 2;

    // In air: cylinder top is below tank rim, bottom is comfortably above water level
    const hangingAirY = tankY + 12;
    // Fully submerged: cylinder top is immersed below water, bottom is well above tank floor
    const fullySubmergedY = waterLevelY + 10;
    this.objectTravelDistance = fullySubmergedY - hangingAirY;
    const currentObjY = hangingAirY + this.objectTravelDistance * sol.subFrac;

    this.interactiveBounds.object = {
      x: objX,
      y: currentObjY,
      w: objW,
      h: objH
    };

    // 5. Centered Spring Balance directly above tank
    const springTopY = 16;
    this.renderSpringBalance(ctx, centerX, springTopY, currentObjY, sol);

    // 6. Immersed Metallic Body
    this.renderImmersedBody(ctx, objX, currentObjY, objW, objH, matInfo, sol);

    // 7. Displaced Fluid Beaker & Digital Scale
    this.renderCatchBeakerAndScale(ctx, scaleX, scaleY, scaleW, scaleH, beakerX, beakerY, beakerW, beakerH, fluidInfo, sol);

    // 8. Droplets from Spout
    this.renderDroplets(ctx, fluidInfo);

    // 9. Verification Card in Top-Right
    const cardX = Math.min(w - 290, scaleX - 10);
    const cardY = springTopY + 4;
    this.renderVerificationCard(ctx, cardX, cardY, sol);
  }

  // =========================================================================
  // LABORATORY BENCH TABLE
  // =========================================================================
  renderLabTable(ctx, x, y, w, h, floorY) {
    ctx.save();

    // Table Slab
    const slabGrad = ctx.createLinearGradient(x, y, x, y + h);
    slabGrad.addColorStop(0, '#334155');
    slabGrad.addColorStop(0.3, '#1e293b');
    slabGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = slabGrad;

    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, 4) : ctx.rect(x, y, w, h);
    ctx.fill();

    // Beveled highlight
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 2, y, w - 4, 2.5);

    // Sturdy Cylindrical Legs
    const legW = 24;
    const leg1X = x + 24;
    const leg2X = x + w - 48;
    const legH = floorY - (y + h);

    const drawLeg = (lx) => {
      const legGrad = ctx.createLinearGradient(lx, 0, lx + legW, 0);
      legGrad.addColorStop(0, '#1e293b');
      legGrad.addColorStop(0.4, '#475569');
      legGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = legGrad;
      ctx.fillRect(lx, y + h, legW, legH - 8);

      // Top decorative collar
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(lx - 3, y + h, legW + 6, 6);

      // Lower stepped collar
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(lx - 2, floorY - 14, legW + 4, 6);

      // Round Cast Iron Pedestal Foot at floor
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(lx + legW / 2, floorY - 4, 18, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Soft contact shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
      ctx.beginPath();
      ctx.ellipse(lx + legW / 2, floorY - 1, 20, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    drawLeg(leg1X);
    drawLeg(leg2X);

    ctx.restore();
  }

  // =========================================================================
  // MAIN WATER TANK WITH 100-500 mL GRADUATIONS & OVERFLOW SPOUT
  // =========================================================================
  renderMainTank(ctx, x, y, w, h, waterY, spoutY, spoutLen, fluidInfo, sol) {
    ctx.save();

    // Fluid inside tank
    const fluidH = (y + h) - waterY;
    const fluidGrad = ctx.createLinearGradient(x, waterY, x, y + h);
    fluidGrad.addColorStop(0, fluidInfo.color);
    fluidGrad.addColorStop(1, fluidInfo.surfaceColor);
    ctx.fillStyle = fluidGrad;
    ctx.fillRect(x + 5, waterY, w - 10, fluidH);

    // Water surface wave
    ctx.fillStyle = fluidInfo.surfaceColor;
    ctx.beginPath();
    ctx.moveTo(x + 5, waterY);
    for (let px = x + 5; px <= x + w - 5; px += 6) {
      const wave = Math.sin(px * 0.08 + this.wavePhase) * 1.5;
      ctx.lineTo(px, waterY + wave);
    }
    ctx.lineTo(x + w - 5, waterY + 3.5);
    ctx.lineTo(x + 5, waterY + 3.5);
    ctx.fill();

    // Electric Blue Glass Tank Frame (Left, Bottom, Right with Spout Cutout)
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, spoutY + 12);
    // Spout cutout connection
    ctx.lineTo(x + w + spoutLen, spoutY + 12);
    ctx.lineTo(x + w + spoutLen - 2, spoutY - 4);
    ctx.lineTo(x + w, spoutY - 4);
    ctx.lineTo(x + w, y);
    ctx.stroke();

    // Spout Mounting Collar & Pipe
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x + w, spoutY - 8, 12, 24);
    ctx.fillRect(x + w + 12, spoutY - 4, spoutLen - 12, 14);

    // Angle-cut spout tip
    ctx.beginPath();
    ctx.moveTo(x + w + spoutLen - 2, spoutY - 4);
    ctx.lineTo(x + w + spoutLen + 6, spoutY + 10);
    ctx.lineTo(x + w + spoutLen - 4, spoutY + 14);
    ctx.lineTo(x + w + spoutLen - 12, spoutY + 10);
    ctx.closePath();
    ctx.fill();

    // Spout Fluid Stream inside pipe (when displacing or tap open)
    if (state.submersionPct > 2 || this.isTapOpen) {
      ctx.fillStyle = fluidInfo.surfaceColor;
      ctx.fillRect(x + w + 10, spoutY, spoutLen - 8, 8);
    }

    // Spout Label & Pointer
    ctx.font = '600 11px var(--font-main)';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText('Overflow Spout', x + w + 42, spoutY - 26);
    ctx.fillText('(Bottom)', x + w + 42, spoutY - 14);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w + 42, spoutY - 10);
    ctx.lineTo(x + w + 20, spoutY - 2);
    ctx.stroke();

    // Graduation Scale on Left Wall (100 - 500 mL)
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.font = '700 12px var(--font-mono)';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';

    ctx.beginPath();
    ctx.moveTo(x + 18, y + 24);
    ctx.lineTo(x + 18, y + h - 20);
    ctx.stroke();

    const marks = [
      { val: 500, my: y + 40 },
      { val: 400, my: y + 75 },
      { val: 300, my: y + 110 },
      { val: 200, my: y + 145 },
      { val: 100, my: y + 180 }
    ];

    marks.forEach(m => {
      ctx.beginPath();
      ctx.moveTo(x + 18, m.my);
      ctx.lineTo(x + 30, m.my);
      ctx.stroke();
      ctx.fillText(`— ${m.val}`, x + 34, m.my + 4);
    });

    ctx.font = '700 11px var(--font-mono)';
    ctx.fillStyle = '#475569';
    ctx.fillText('mL', x + 26, y + h - 14);

    ctx.restore();
  }

  // =========================================================================
  // FULLY FUNCTIONAL WATER REFILL TAP (CLICKABLE & POURS ALL THE WAY DOWN)
  // =========================================================================
  renderWaterTap(ctx, tankX, tankY, waterLevelY) {
    ctx.save();

    const tapX = tankX - 42;
    const tapY = tankY - 30;

    // Cache interactive click bounds for the tap
    this.interactiveBounds.tap = {
      x: tapX - 22,
      y: tapY - 25,
      w: 96,
      h: 56
    };

    const isHovered = (this.hoveredInteractive === 'tap');

    // Dark grey incoming water pipe
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(tapX - 18, tapY + 2, 34, 14, 3) : ctx.rect(tapX - 18, tapY + 2, 34, 14);
    ctx.fill();

    // Blue Valve Body (highlights on hover)
    ctx.fillStyle = isHovered ? '#0284c7' : '#0369a1';
    ctx.fillRect(tapX + 14, tapY - 4, 16, 26);

    // Cross-Handle Valve Knob on top (animates when open)
    ctx.save();
    ctx.translate(tapX + 22, tapY - 8);
    if (this.isTapOpen) {
      ctx.rotate(Math.PI / 4);
    }
    ctx.fillStyle = this.isTapOpen ? '#38bdf8' : '#0f172a';
    ctx.fillRect(-12, -3, 24, 6);
    ctx.fillRect(-3, -9, 6, 18);
    ctx.restore();

    // Down-turned Faucet Spout Nozzle over tank
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(tapX + 30, tapY + 4);
    ctx.lineTo(tapX + 54, tapY + 4);
    ctx.quadraticCurveTo(tapX + 68, tapY + 4, tapX + 68, tapY + 24);
    ctx.lineTo(tapX + 56, tapY + 24);
    ctx.quadraticCurveTo(tapX + 56, tapY + 16, tapX + 48, tapY + 16);
    ctx.lineTo(tapX + 30, tapY + 16);
    ctx.closePath();
    ctx.fill();

    // Nozzle exit coordinates
    const nozzleX = tapX + 57;
    const nozzleTopY = tapY + 24;
    this.tapContactX = nozzleX + 4.5;
    this.tapContactY = waterLevelY;

    // ACTIVE WATER STREAM: Runs ALL THE WAY DOWN into the water surface!
    if (this.isTapOpen) {
      const streamHeight = Math.max(0, waterLevelY - nozzleTopY);

      const streamGrad = ctx.createLinearGradient(nozzleX, 0, nozzleX + 9, 0);
      streamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
      streamGrad.addColorStop(0.4, 'rgba(224, 242, 254, 0.95)');
      streamGrad.addColorStop(1, 'rgba(2, 132, 199, 0.85)');
      ctx.fillStyle = streamGrad;
      ctx.fillRect(nozzleX, nozzleTopY, 9, streamHeight);

      // Splash ripples where stream penetrates water surface
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(this.tapContactX, waterLevelY + 1, 10, 3.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Render splash droplets
      ctx.fillStyle = '#bae6fd';
      for (const sp of this.tapSplashes) {
        ctx.globalAlpha = Math.max(0, sp.alpha);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    } else {
      // Idle single water drop at nozzle tip
      ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.beginPath();
      ctx.arc(nozzleX + 4.5, nozzleTopY + 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tap Label with Leader Line & Click Prompt
    ctx.font = '600 11px var(--font-main)';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText('Tap', tapX - 15, tapY - 24);
    ctx.fillText('(Refill Water)', tapX - 15, tapY - 12);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tapX - 15, tapY - 6);
    ctx.lineTo(tapX + 12, tapY + 8);
    ctx.stroke();

    // Interactive Click Indicator Badge
    const badgeText = this.isTapOpen ? '💧 Flowing (Click to Stop)' : (isHovered ? '👆 Click to Fill Water' : 'Click Tap');
    const badgeBg = this.isTapOpen ? '#ecfdf5' : (isHovered ? '#e0f2fe' : '#ffffff');
    const badgeColor = this.isTapOpen ? '#059669' : (isHovered ? '#0284c7' : '#64748b');
    const badgeBorder = this.isTapOpen ? '#a7f3d0' : (isHovered ? '#7dd3fc' : '#cbd5e1');

    this.drawTextPill(ctx, tapX + 22, tapY - 32, badgeText, badgeBg, badgeColor, badgeBorder);

    ctx.restore();
  }

  // =========================================================================
  // SPRING BALANCE & TOP DIGITAL PILL
  // =========================================================================
  renderSpringBalance(ctx, cx, topY, currentObjY, sol) {
    ctx.save();

    // Top Digital Readout Pill
    const pillW = 86;
    const pillH = 24;
    const pillX = cx - pillW / 2;
    const pillY = topY;

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(pillX, pillY, pillW, pillH, 7) : ctx.rect(pillX, pillY, pillW, pillH);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 13px var(--font-mono)';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText(`${sol.tension.toFixed(2)} N`, cx, pillY + 16.5);

    // Spring Balance Casing: Compact 95px height to ensure wide clearance
    const casingW = 42;
    const casingH = 95;
    const casingX = cx - casingW / 2;
    const casingY = topY + pillH + 5;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(casingX, casingY, casingW, casingH, 5) : ctx.rect(casingX, casingY, casingW, casingH);
    ctx.fill();
    ctx.stroke();

    // Scale marks on left: 0, 10, 20, 31, 41, 51
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.font = '600 8.5px var(--font-mono)';
    ctx.fillStyle = '#0f172a';

    const scaleLabels = [0, 10, 20, 31, 41, 51];
    for (let i = 0; i < scaleLabels.length; i++) {
      const sy = casingY + 12 + (i / (scaleLabels.length - 1)) * (casingH - 24);
      ctx.beginPath();
      ctx.moveTo(casingX + 4, sy);
      ctx.lineTo(casingX + 12, sy);
      ctx.stroke();
      ctx.textAlign = 'left';
      ctx.fillText(`${scaleLabels[i]}`, casingX + 14, sy + 3);
    }

    // Blue Coiled Zigzag Spring
    const springTopY = casingY + 10;
    const maxExt = casingH - 26;
    const maxScaleN = 51.0;
    const extRatio = Math.max(0, Math.min(1.0, sol.tension / maxScaleN));
    const pointerY = springTopY + extRatio * maxExt;

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx + 6, springTopY);
    const coils = 10;
    const coilStep = (pointerY - springTopY) / coils;
    for (let c = 0; c < coils; c++) {
      const cy = springTopY + c * coilStep;
      const sign = (c % 2 === 0) ? 1 : -1;
      ctx.lineTo(cx + 6 + sign * 7, cy + coilStep * 0.5);
      ctx.lineTo(cx + 6, cy + coilStep);
    }
    ctx.stroke();

    // Sharp Red Arrow Pointer Indicator
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(casingX + 2, pointerY);
    ctx.lineTo(casingX + 18, pointerY);
    ctx.lineTo(casingX + 24, pointerY + 4);
    ctx.lineTo(casingX + 18, pointerY + 8);
    ctx.lineTo(casingX + 2, pointerY + 8);
    ctx.closePath();
    ctx.fill();

    // Black Vertical Suspension Wire down into Cylinder
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, pointerY + 8);
    ctx.lineTo(cx, currentObjY);
    ctx.stroke();

    // Attachment hook
    ctx.beginPath();
    ctx.arc(cx, currentObjY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // SUSPENDED IMMERSED OBJECT (ROUNDED METALLIC CYLINDER)
  // =========================================================================
  renderImmersedBody(ctx, x, y, w, h, matInfo, sol) {
    ctx.save();
    const cx = x + w / 2;
    const cy = y + h / 2;

    if (this.isDraggingObject) {
      ctx.shadowColor = 'rgba(2, 132, 199, 0.7)';
      ctx.shadowBlur = 12;
    }

    if (state.objectShape === 'duck') {
      this.renderRubberDucky(ctx, x, y, w, h);
    } else if (state.objectShape === 'crown') {
      this.renderRoyalCrown(ctx, x, y, w, h, matInfo);
    } else if (state.objectShape === 'boat') {
      this.renderSteamboat(ctx, x, y, w, h, sol);
    } else if (state.objectShape === 'diver') {
      this.renderScubaDiver(ctx, x, y, w, h);
    } else {
      // Sleek Brushed Silver Metallic Cylinder
      const grad = ctx.createLinearGradient(x, y, x + w, y);
      grad.addColorStop(0, '#475569');
      grad.addColorStop(0.22, '#94a3b8');
      grad.addColorStop(0.48, '#e2e8f0');
      grad.addColorStop(0.55, '#f8fafc');
      grad.addColorStop(0.78, '#94a3b8');
      grad.addColorStop(1, '#334155');

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, w, h, 14) : ctx.rect(x, y, w, h);
      ctx.fill();
      ctx.stroke();

      // Clean Mass text directly in center
      ctx.font = '700 13px var(--font-mono)';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(`${(sol.totalMassKg * 1000).toFixed(0)} g`, cx, cy + 5);
    }

    ctx.restore();
  }

  // =========================================================================
  // DISPLACED FLUID BEAKER & DIGITAL SCALE (REALISTIC DISPLACED WATER)
  // =========================================================================
  renderCatchBeakerAndScale(ctx, scaleX, scaleY, scaleW, scaleH, beakerX, beakerY, beakerW, beakerH, fluidInfo, sol) {
    ctx.save();

    // 1. Digital Precision Scale Platform
    const scaleGrad = ctx.createLinearGradient(scaleX, scaleY, scaleX, scaleY + scaleH);
    scaleGrad.addColorStop(0, '#334155');
    scaleGrad.addColorStop(0.2, '#1e293b');
    scaleGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = scaleGrad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(scaleX, scaleY, scaleW, scaleH, 6) : ctx.rect(scaleX, scaleY, scaleW, scaleH);
    ctx.fill();

    // Bevelled top plate
    ctx.fillStyle = '#475569';
    ctx.fillRect(scaleX + 6, scaleY + 2, scaleW - 12, 3);

    // Glowing LED Screen Window
    const lcdW = 120;
    const lcdH = 22;
    const lcdX = scaleX + (scaleW - lcdW) / 2;
    const lcdY = scaleY + 8;

    ctx.fillStyle = '#022c22';
    ctx.fillRect(lcdX, lcdY, lcdW, lcdH);

    // Glowing Emerald Green Digital Readout of Displaced Mass
    ctx.font = '700 14px var(--font-mono)';
    ctx.fillStyle = '#34d399';
    ctx.textAlign = 'center';
    ctx.fillText(`${sol.m_disp_grams.toFixed(1)} g`, lcdX + lcdW / 2, lcdY + 12.5);

    ctx.font = '700 8px var(--font-main)';
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText('PRECISION 0.01g', lcdX + lcdW / 2, lcdY + 20);

    // Rubber feet of digital scale
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(scaleX + 16, scaleY + scaleH, 18, 3);
    ctx.fillRect(scaleX + scaleW - 34, scaleY + scaleH, 18, 3);

    // Scale Click / Tare Hint
    if (this.hoveredInteractive === 'scale') {
      this.drawTextPill(ctx, scaleX + scaleW / 2, scaleY - 14, '👆 Click to Tare / Empty Beaker', '#ffffff', '#0284c7', '#7dd3fc');
    }

    // 2. Catch Beaker (Displaced Fluid Container)
    const maxFluidH = beakerH - 24;
    // Fluid level directly matches displaced volume V_sub_cm3 (up to 500 mL)
    const fluidFillH = Math.min(maxFluidH, (sol.V_sub_cm3 / 500) * (beakerH - 28));
    const fluidTopY = beakerY + beakerH - fluidFillH;
    this.beakerWaterSurfaceY = fluidTopY;

    // Displaced Water inside Beaker
    if (fluidFillH > 2) {
      const grad = ctx.createLinearGradient(beakerX, fluidTopY, beakerX, beakerY + beakerH);
      grad.addColorStop(0, fluidInfo.color);
      grad.addColorStop(1, fluidInfo.surfaceColor);
      ctx.fillStyle = grad;
      ctx.fillRect(beakerX + 4, fluidTopY, beakerW - 8, fluidFillH);

      // Curved Meniscus line
      ctx.fillStyle = fluidInfo.surfaceColor;
      ctx.fillRect(beakerX + 4, fluidTopY, beakerW - 8, 2.5);

      // Splash ripples where droplets land
      ctx.save();
      for (const rip of this.beakerRipples) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${rip.alpha})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(rip.x, fluidTopY, rip.radius, rip.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Rising air bubbles inside displaced fluid
      ctx.save();
      for (const b of this.beakerBubbles) {
        const bx = beakerX + 8 + b.xFrac * (beakerW - 16);
        const by = fluidTopY + 4 + b.yFrac * (fluidFillH - 8);
        if (by > fluidTopY && by < beakerY + beakerH - 4) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(bx, by, b.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Bubble glint
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(bx - b.radius * 0.3, by - b.radius * 0.3, b.radius * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Glass Beaker Outline
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(beakerX, beakerY);
    ctx.lineTo(beakerX, beakerY + beakerH);
    ctx.lineTo(beakerX + beakerW, beakerY + beakerH);
    ctx.lineTo(beakerX + beakerW, beakerY);
    ctx.stroke();

    // Right-Side Graduations: 100 mL to 500 mL
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.8;
    ctx.font = '700 10px var(--font-mono)';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';

    const beakerMarks = [
      { val: 500, by: beakerY + 22 },
      { val: 400, by: beakerY + 48 },
      { val: 300, by: beakerY + 74 },
      { val: 200, by: beakerY + 100 },
      { val: 100, by: beakerY + 126 }
    ];

    beakerMarks.forEach(bm => {
      ctx.beginPath();
      ctx.moveTo(beakerX + beakerW - 14, bm.by);
      ctx.lineTo(beakerX + beakerW - 4, bm.by);
      ctx.stroke();
      ctx.fillText(`— ${bm.val} mL`, beakerX + beakerW - 74, bm.by + 3);
    });

    // Clear "Displaced Water" Badge above beaker
    this.drawTextPill(
      ctx,
      beakerX + beakerW / 2,
      beakerY - 14,
      `💧 Displaced: ${sol.V_sub_cm3.toFixed(1)} mL`,
      '#f0f9ff',
      '#0284c7',
      '#bae6fd'
    );

    ctx.restore();
  }

  // =========================================================================
  // DROPLET PARTICLES
  // =========================================================================
  renderDroplets(ctx, fluidInfo) {
    ctx.save();
    ctx.fillStyle = fluidInfo.surfaceColor;
    for (const d of this.droplets) {
      ctx.globalAlpha = Math.max(0, d.alpha);
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // =========================================================================
  // VERIFICATION CARD (UPPER-RIGHT PLAQUE)
  // =========================================================================
  renderVerificationCard(ctx, x, y, sol) {
    ctx.save();
    const w = 276;
    const h = 58;

    // White Card with 2px Green Border
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, 10) : ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();

    // Top line: ✓ ARCHIMEDES' PRINCIPLE VERIFIED
    ctx.font = '700 12px var(--font-main)';
    ctx.fillStyle = '#059669';
    ctx.textAlign = 'left';
    ctx.fillText("✓ ARCHIMEDES' PRINCIPLE VERIFIED", x + 16, y + 24);

    // Bottom line: Weight Loss: 2.45 N = Displaced: 2.45 N
    ctx.font = '600 11px var(--font-mono)';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`Weight Loss: ${sol.weightLoss.toFixed(2)} N  =  Displaced: ${sol.W_disp.toFixed(2)} N`, x + 16, y + 44);

    ctx.restore();
  }

  // =========================================================================
  // HYDROSTATIC & FLOTATION MODES
  // =========================================================================
  renderPressureMode(ctx, w, h, sol) {
    const floorY = h - 35;
    const fbdW = 180;
    const fbdH = 310;
    const fbdX = 24;
    const fbdY = floorY - fbdH - 10;
    this.renderDedicatedFBDCard(ctx, fbdX, fbdY, fbdW, fbdH, sol);

    const tankX = fbdX + fbdW + 28;
    const tankW = w - tankX - 24;
    const tankH = 320;
    const tankY = floorY - tankH;

    const fluidInfo = FLUID_PRESETS[state.fluidType] || FLUID_PRESETS.water;
    const matInfo = MATERIAL_PRESETS[state.materialType] || MATERIAL_PRESETS.iron;

    const waterSurfaceY = tankY + 85;
    ctx.save();
    ctx.fillStyle = fluidInfo.color;
    ctx.fillRect(tankX + 6, waterSurfaceY, tankW - 12, (tankY + tankH) - waterSurfaceY);

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.strokeRect(tankX, tankY, tankW, tankH);
    ctx.restore();

    const blockW = 85;
    const blockH = 95;
    const blockX = tankX + (tankW - blockW) / 2 - 20;
    const hangingAirY = waterSurfaceY - blockH - 12;
    const fullySubmergedY = waterSurfaceY + 28;
    const blockY = hangingAirY + (fullySubmergedY - hangingAirY) * sol.subFrac;

    this.interactiveBounds.object = { x: blockX, y: blockY, w: blockW, h: blockH };
    this.renderImmersedBody(ctx, blockX, blockY, blockW, blockH, matInfo, sol);

    if (state.showPressureVectors && sol.subFrac > 0) {
      this.renderCleanHydrostaticVectors(ctx, blockX, blockY, blockW, blockH, waterSurfaceY, sol);
    }
  }

  renderDedicatedFBDCard(ctx, x, y, w, h, sol) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, 10) : ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();

    ctx.font = '800 12px var(--font-main)';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText('FREE BODY DIAGRAM', x + w / 2, y + 24);

    const cx = x + w / 2;
    const cy = y + h / 2 + 10;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();

    const scale = 1.2;
    const lenW = Math.max(20, Math.min(95, sol.W_true * scale));
    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = '#ef4444';
    ctx.lineWidth = 3.5;
    this.drawVectorArrow(ctx, cx, cy, cx, cy + lenW, 7);
    this.drawTextPill(ctx, cx, cy + lenW + 12, `W = ${sol.W_true.toFixed(2)}N`, '#fef2f2', '#ef4444');

    if (sol.F_buoyant > 0.05) {
      const lenFB = Math.max(15, Math.min(85, sol.F_buoyant * scale));
      ctx.strokeStyle = '#10b981';
      ctx.fillStyle = '#10b981';
      ctx.lineWidth = 3.5;
      this.drawVectorArrow(ctx, cx - 14, cy, cx - 14, cy - lenFB, 7);
      this.drawTextPill(ctx, cx - 35, cy - lenFB - 10, `F_B = ${sol.F_buoyant.toFixed(2)}N`, '#ecfdf5', '#059669');
    }

    if (sol.tension > 0.05) {
      const lenT = Math.max(15, Math.min(85, sol.tension * scale));
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;
      this.drawVectorArrow(ctx, cx + 14, cy, cx + 14, cy - lenT, 7);
      this.drawTextPill(ctx, cx + 38, cy - lenT - 10, `T = ${sol.tension.toFixed(2)}N`, '#e0f2fe', '#0284c7');
    }
    ctx.restore();
  }

  renderCleanHydrostaticVectors(ctx, bx, by, bw, bh, surfaceY, sol) {
    ctx.save();
    if (by >= surfaceY) {
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      this.drawVectorArrow(ctx, bx + bw * 0.3, by - 30, bx + bw * 0.3, by, 5);
      this.drawVectorArrow(ctx, bx + bw * 0.7, by - 30, bx + bw * 0.7, by, 5);
      this.drawTextPill(ctx, bx + bw / 2, by - 42, `P_top: ${sol.F_top_down.toFixed(2)}N`, '#fef2f2', '#ef4444');
    }

    ctx.strokeStyle = '#10b981';
    ctx.fillStyle = '#10b981';
    ctx.lineWidth = 2.5;
    this.drawVectorArrow(ctx, bx + bw * 0.3, by + bh + 40, bx + bw * 0.3, by + bh, 6);
    this.drawVectorArrow(ctx, bx + bw * 0.7, by + bh + 40, bx + bw * 0.7, by + bh, 6);
    this.drawTextPill(ctx, bx + bw / 2, by + bh + 54, `P_bottom: ${sol.F_bottom_up.toFixed(2)}N`, '#ecfdf5', '#059669');

    ctx.strokeStyle = '#0284c7';
    ctx.fillStyle = '#0284c7';
    ctx.lineWidth = 1.8;
    const startY = Math.max(by, surfaceY);
    const endY = by + bh;
    for (let y = startY + 18; y < endY - 8; y += 24) {
      const depthFrac = (y - surfaceY) / (endY - surfaceY);
      const len = 14 + depthFrac * 22;
      this.drawVectorArrow(ctx, bx - len, y, bx, y, 4);
      this.drawVectorArrow(ctx, bx + bw + len, y, bx + bw, y, 4);
    }
    this.drawTextPill(ctx, bx + bw + 65, by + bh / 2, 'Lateral Forces Cancel ↔', '#f0f9ff', '#0284c7');
    ctx.restore();
  }

  renderFlotationMode(ctx, w, h, sol) {
    const floorY = h - 35;
    const tankW = 480;
    const tankH = 280;
    const tankX = (w - tankW) / 2;
    const tankY = floorY - tankH;

    const fluidInfo = FLUID_PRESETS[state.fluidType] || FLUID_PRESETS.water;
    const matInfo = MATERIAL_PRESETS[state.materialType] || MATERIAL_PRESETS.boat;
    const waterSurfaceY = tankY + 95;

    ctx.save();
    const grad = ctx.createLinearGradient(tankX, waterSurfaceY, tankX, tankY + tankH);
    grad.addColorStop(0, fluidInfo.color);
    grad.addColorStop(1, fluidInfo.surfaceColor);
    ctx.fillStyle = grad;
    ctx.fillRect(tankX + 5, waterSurfaceY, tankW - 10, (tankY + tankH) - waterSurfaceY);

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.strokeRect(tankX, tankY, tankW, tankH);
    ctx.restore();

    const objW = (state.objectShape === 'boat') ? 160 : 90;
    const objH = (state.objectShape === 'boat') ? 80 : 90;
    const objX = (w - objW) / 2;

    let targetY = 0;
    if (sol.densityRatio <= 1.0) {
      targetY = waterSurfaceY - (objH * (1 - sol.subFrac)) + this.bobbingY;
    } else {
      targetY = (tankY + tankH) - objH - 2;
    }

    this.interactiveBounds.object = { x: objX, y: targetY, w: objW, h: objH };
    this.renderImmersedBody(ctx, objX, targetY, objW, objH, matInfo, sol);

    const statusText = sol.densityRatio <= 1.0
      ? `✓ Flotation Equilibrium: ${(sol.submersionPct).toFixed(1)}% Submerged (F_B = W₀)`
      : `⚠️ Sinking: Density (${sol.effectiveDensity.toFixed(0)} kg/m³) > Fluid (${sol.rho_f.toFixed(0)} kg/m³) — Resting on Bottom`;

    this.drawTextPill(ctx, w / 2, tankY + 28, statusText, '#ffffff', sol.densityRatio <= 1.0 ? '#059669' : '#dc2626');
  }

  // Draw Text Pill Helper with optional custom border
  drawTextPill(ctx, x, y, text, bgColor, textColor, borderColor = textColor) {
    ctx.save();
    ctx.font = '700 10px var(--font-mono)';
    const textW = ctx.measureText(text).width + 12;
    const pillH = 18;

    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x - textW / 2, y - pillH / 2, textW, pillH, 9) : ctx.rect(x - textW / 2, y - pillH / 2, textW, pillH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y + 3.5);
    ctx.restore();
  }

  // Draw Arrow Helper
  drawVectorArrow(ctx, fromX, fromY, toX, toY, headLength = 7) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  // Character Renderers (Duck, Crown, Boat, Diver)
  renderRubberDucky(ctx, x, y, w, h) {
    ctx.save();
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 32, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 14, cy - 10, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.ellipse(cx + 32, cy - 8, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx + 20, cy - 14, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderRoyalCrown(ctx, x, y, w, h, matInfo) {
    ctx.save();
    const cx = x + w / 2;
    ctx.fillStyle = matInfo.color;
    ctx.strokeStyle = matInfo.stroke;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + h - 8);
    ctx.lineTo(x + 10, y + 25);
    ctx.lineTo(x + w * 0.25, y + 45);
    ctx.lineTo(cx, y + 10);
    ctx.lineTo(x + w * 0.75, y + 45);
    ctx.lineTo(x + w - 10, y + 25);
    ctx.lineTo(x + w - 10, y + h - 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(cx, y + 12, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderSteamboat(ctx, x, y, w, h, sol) {
    ctx.save();
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(x + 10, y + h / 2);
    ctx.lineTo(x + 25, y + h - 5);
    ctx.lineTo(x + w - 25, y + h - 5);
    ctx.lineTo(x + w - 10, y + h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 20);
    ctx.lineTo(x + 10, y + h / 2);
    ctx.lineTo(x + w - 10, y + h / 2);
    ctx.lineTo(x + w - 5, y + 20);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  renderScubaDiver(ctx, x, y, w, h) {
    ctx.save();
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 15, cy - 25, 30, 50);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(cx - 10, cy - 20, 20, 12);
    ctx.restore();
  }
}
