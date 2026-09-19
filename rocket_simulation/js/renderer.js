/**
 * PhysicsLab - Canvas Rendering Engine (Student-Friendly Edition)
 * Clean, high-contrast illustration of rocket, clear force arrows, and atmospheric scenery.
 */
window.PhysicsLab = window.PhysicsLab || {};

(function(lab) {
  const $ = id => lab.$(id);

  // Setup canvas for high-DPI displays
  lab.setupCanvas = function(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    return { width: w / dpr, height: h / dpr, dpr };
  };

  // Helper to draw clean rounded pill badge with shadow (clamped to canvas borders)
  lab.drawStudentBadge = function(ctx, x, y, text, color) {
    ctx.save();
    ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
    const paddingX = 10;
    const textW = ctx.measureText(text).width;
    const badgeW = textW + paddingX * 2;
    const badgeH = 24;

    const W = ctx.canvas.width / (window.devicePixelRatio || 1);
    const H = ctx.canvas.height / (window.devicePixelRatio || 1);
    // Boundary safe clamping: badge will never be clipped off screen edges
    const safeX = Math.max(badgeW / 2 + 6, Math.min(W - badgeW / 2 - 6, x));
    const safeY = Math.max(badgeH / 2 + 6, Math.min(H - badgeH / 2 - 6, y));

    // Drop shadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;

    // White pill background with colored border
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(safeX - badgeW / 2, safeY - badgeH / 2, badgeW, badgeH, 12);
    ctx.fill();
    ctx.stroke();

    // Text label
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, safeX, safeY);
    ctx.restore();
  };

  // Helper to draw a bold, friendly vector arrow
  lab.drawBoldArrow = function(ctx, x1, y1, x2, y2, color, width = 4) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 12;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  lab.drawRocket = function(ctx, px, py, angleDeg = 0, p = null, zoomFactor = 1.0) {
    ctx.save();
    ctx.translate(px, py);
    const z = Math.min(1.0, Math.max(0.65, zoomFactor));
    ctx.scale(z, z);
    ctx.rotate((angleDeg * Math.PI) / 180);

    const cfg = lab.getConfig();
    const state = lab.state;
    const effectiveThrust = p ? p.effectiveThrust : ((state.currentFuel > 0 || cfg.infiniteFuel) ? cfg.thrust : 0);

    // 1. Dynamic exhaust flame ONLY when engines produce effective thrust (and fuel is not empty)
    if (effectiveThrust > 0 && (state.running || state.simTime > 0)) {
      const flamePower = effectiveThrust / 100000;
      const flameLen = Math.min(75, 20 + flamePower * 55 + Math.random() * 8);

      // Outer Flame (Orange)
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(-9, 20);
      ctx.lineTo(0, 20 + flameLen);
      ctx.lineTo(9, 20);
      ctx.closePath();
      ctx.fill();

      // Inner Flame (Bright Yellow)
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(-5, 20);
      ctx.lineTo(0, 20 + flameLen * 0.65);
      ctx.lineTo(5, 20);
      ctx.closePath();
      ctx.fill();
    }

    // 2. Rocket Fuselage
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, -36); // Nosecone tip
    ctx.quadraticCurveTo(-15, -18, -13, 20);
    ctx.lineTo(13, 20);
    ctx.quadraticCurveTo(15, -18, 0, -36);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red Nosecone Tip
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -36);
    ctx.quadraticCurveTo(-8, -25, -7, -17);
    ctx.lineTo(7, -17);
    ctx.quadraticCurveTo(8, -25, 0, -36);
    ctx.closePath();
    ctx.fill();

    // Side Stabilizer Fins
    ctx.fillStyle = '#ef4444';
    // Left fin
    ctx.beginPath();
    ctx.moveTo(-11, 6);
    ctx.lineTo(-24, 22);
    ctx.lineTo(-11, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Right fin
    ctx.beginPath();
    ctx.moveTo(11, 6);
    ctx.lineTo(24, 22);
    ctx.lineTo(11, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Porthole Window
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, -5, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Nozzle
    ctx.fillStyle = '#334155';
    ctx.fillRect(-6, 20, 12, 5);

    ctx.restore();
  };

  // Draw Clear, Color-Coded Force & Velocity Arrows (PhET Style)
  lab.drawVectors = function(ctx, px, py, p, zoomFactor = 1.0) {
    const showForces = !$('chkForces') || $('chkForces').checked;
    if (!showForces) return;

    const showValues = !$('chkValues') || $('chkValues').checked;
    const showReaction = $('chkReaction') && $('chkReaction').checked;
    const state = lab.state;
    const speed = Math.hypot(state.velX, state.velY);
    const arrowScale = Math.min(1.0, Math.max(0.65, zoomFactor));
    const arrowWidth = Math.max(2.5, 4 * arrowScale);

    // 1. UPWARD THRUST ARROW (Emerald Green) - only when fuel > 0
    if (p.effectiveThrust > 0) {
      const tLen = Math.min(110 * arrowScale, (22 + (p.effectiveThrust / 100000) * 80) * arrowScale);
      const tx = px - 35 * arrowScale, ty1 = py, ty2 = ty1 - tLen;
      lab.drawBoldArrow(ctx, tx, ty1, tx, ty2, '#10b981', arrowWidth);
      const thrustLabel = showValues ? `Thrust: ${lab.fmtNum(p.effectiveThrust, 0)} N` : `Thrust (Up)`;
      lab.drawStudentBadge(ctx, tx, ty2 - 16, thrustLabel, '#059669');
    }

    // 2. DOWNWARD WEIGHT / GRAVITY ARROW (Warm Amber)
    if (p.weight > 0) {
      const wLen = Math.min(75 * arrowScale, (18 + (p.weight / 100000) * 50) * arrowScale);
      const wx = px + 35 * arrowScale, wy1 = py, wy2 = wy1 + wLen;
      lab.drawBoldArrow(ctx, wx, wy1, wx, wy2, '#f59e0b', arrowWidth);
      const weightLabel = showValues ? `Weight: ${lab.fmtNum(p.weight, 0)} N` : `Weight (Down)`;
      lab.drawStudentBadge(ctx, wx, wy2 + 14, weightLabel, '#d97706');
    }

    // 3. NET RESULTANT FORCE ARROW (Electric Blue)
    if (Math.abs(p.fy) > 50) {
      const netLen = Math.min(110 * arrowScale, (20 + (Math.abs(p.fy) / 100000) * 80) * arrowScale);
      const nx = px + 75 * arrowScale, ny1 = py;
      const ny2 = p.fy > 0 ? ny1 - netLen : ny1 + netLen;
      lab.drawBoldArrow(ctx, nx, ny1, nx, ny2, '#0284c7', arrowWidth);
      const netLabel = showValues ? `Fnet: ${(p.fy > 0 ? '+' : '')}${lab.fmtNum(p.netForce, 0)} N` : `Net Force`;
      lab.drawStudentBadge(ctx, nx, p.fy > 0 ? ny2 - 16 : ny2 + 16, netLabel, '#0284c7');
    } else if (p.effectiveThrust > 0 && Math.abs(p.effectiveThrust - p.weight) <= 50) {
      // Balanced forces indicator badge
      lab.drawStudentBadge(ctx, px + 75 * arrowScale, py, 'Net Force = 0 N (Balanced ⚖️)', '#059669');
    }

    // 4. ACTION-REACTION EXHAUST (Newton's 3rd Law Pair)
    if (showReaction && p.effectiveThrust > 0) {
      const exLen = 40 * arrowScale;
      lab.drawBoldArrow(ctx, px, py + 22, px, py + 22 + exLen, '#ec4899', Math.max(2.5, 3.5 * arrowScale));
      lab.drawStudentBadge(ctx, px, py + 22 + exLen + 14, 'Exhaust (Action)', '#db2777');
    }

    // 5. VELOCITY DIRECTION ARROW (Cyan) when in motion
    if (speed > 1.5 && state.posY > 0) {
      const vLen = Math.min(65 * arrowScale, (16 + speed * 0.9) * arrowScale);
      const vx = px - 75 * arrowScale, vy1 = py;
      const vEndPy = state.velY >= 0 ? vy1 - vLen : vy1 + vLen;
      lab.drawBoldArrow(ctx, vx, vy1, vx, vEndPy, '#06b6d4', Math.max(2.5, 3.5 * arrowScale));
      const velText = state.velY >= 0 ? `v: ↑ +${speed.toFixed(0)} m/s` : `v: ↓ -${speed.toFixed(0)} m/s`;
      lab.drawStudentBadge(ctx, vx, state.velY >= 0 ? vEndPy - 16 : vEndPy + 16, velText, '#0891b2');
    }
  };

  // Draw Ground Launchpad & Cheerful Atmosphere (Stable Horizon with Dynamic Launchpad Alignment)
  lab.drawFriendlyBackground = function(ctx, W, H, alt, padScreenX = W * 0.5, zoomFactor = 1.0) {
    // Dynamic Sky Gradient based on altitude
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    if (alt < 1000) {
      // Cheerful Daylight Sky
      skyGrad.addColorStop(0, '#38bdf8');
      skyGrad.addColorStop(0.6, '#7dd3fc');
      skyGrad.addColorStop(1, '#bae6fd');
    } else if (alt < 10000) {
      // Upper Sky
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(0.7, '#38bdf8');
      skyGrad.addColorStop(1, '#7dd3fc');
    } else {
      // Space
      skyGrad.addColorStop(0, '#030712');
      skyGrad.addColorStop(0.7, '#0f172a');
      skyGrad.addColorStop(1, '#1e293b');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Fluffy daytime clouds near ground
    if (alt < 2000) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      // Left Cloud
      ctx.beginPath();
      ctx.arc(W * 0.16, H * 0.32, 22, 0, Math.PI * 2);
      ctx.arc(W * 0.16 + 18, H * 0.32 - 7, 26, 0, Math.PI * 2);
      ctx.arc(W * 0.16 + 40, H * 0.32, 18, 0, Math.PI * 2);
      ctx.fill();
      // Right Cloud
      ctx.beginPath();
      ctx.arc(W * 0.82, H * 0.26, 20, 0, Math.PI * 2);
      ctx.arc(W * 0.82 + 18, H * 0.26 - 6, 24, 0, Math.PI * 2);
      ctx.arc(W * 0.82 + 38, H * 0.26, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Ground Level on Canvas - stays anchored at bottom so the full ascent, peak, and fall are visible!
    const groundScreenY = H - 52;
    ctx.save();
    // Green grassy meadow across entire width
    ctx.fillStyle = '#10b981';
    ctx.fillRect(0, groundScreenY, W, 12);
    ctx.fillStyle = '#059669';
    ctx.fillRect(0, groundScreenY + 10, W, 4);

    // Earth foundation soil
    ctx.fillStyle = '#5c4033';
    ctx.fillRect(0, groundScreenY + 14, W, H - groundScreenY);

    // Clean Launchpad concrete deck (centered dynamically at padScreenX)
    const z = Math.min(1.0, Math.max(0.65, zoomFactor));
    const padW = 100 * z;
    const padX = padScreenX - padW / 2;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(padX, groundScreenY - 6, padW, 8);

    // Yellow caution edge
    ctx.fillStyle = '#facc15';
    ctx.fillRect(padX, groundScreenY - 6, padW, 2);

    // Gantry Tower
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = Math.max(1.5, 2 * z);
    const gantryW = 16 * z;
    const gantryH = 92 * z;
    ctx.strokeRect(padX - gantryW - 4, groundScreenY - gantryH - 4, gantryW, gantryH);
    ctx.restore();

    return groundScreenY;
  };

  // Main Canvas Draw Call with Dynamic Self-Framing Bounding-Box Camera
  lab.drawScene = function() {
    const simCanvas = $('simCanvas');
    if (!simCanvas) return;
    const simCtx = simCanvas.getContext('2d');
    const { width: W, height: H, dpr } = lab.setupCanvas(simCanvas);
    simCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    simCtx.clearRect(0, 0, W, H);

    const state = lab.state;
    const alt = state.posY;
    const p = lab.calcPhysics();
    const groundScreenY = H - 52;

    // 1. Compute World Bounding Box spanning launchpad (0, 0), current rocket, and trajectory
    let minX = Math.min(0, state.posX);
    let maxX = Math.max(0, state.posX);
    let maxY = Math.max(140, state.posY);

    if (state.trajectoryPoints && state.trajectoryPoints.length > 0) {
      for (let i = 0; i < state.trajectoryPoints.length; i++) {
        const pt = state.trajectoryPoints[i];
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y > maxY) maxY = pt.y;
      }
    }

    // 2. Compute Safe Target Zoom & Horizontal Midpoint
    const marginSide = Math.min(100, Math.max(70, W * 0.12));
    const availW = Math.max(120, W - marginSide * 2);
    const spanX = Math.max(90, maxX - minX);
    const scaleX = availW / spanX;

    const marginTop = 135;
    const availH = Math.max(120, groundScreenY - 26 - marginTop);
    const scaleY = availH / Math.max(120, maxY);

    // Uniform isotropic scaling (keeps true geometric proportions and angles)
    const idealScale = Math.min(scaleX, scaleY, 1.15);
    const midWorldX = (minX + maxX) * 0.5;

    // Smooth camera tracking
    if (state.camScale == null || state.camMidX == null) {
      state.camScale = idealScale;
      state.camMidX = midWorldX;
    } else {
      const zoomRate = idealScale < state.camScale ? 0.12 : 0.08;
      state.camScale += (idealScale - state.camScale) * zoomRate;
      state.camMidX += (midWorldX - state.camMidX) * 0.12;
    }

    // Hard Boundary Clamp: Absolute guarantee that rocket NEVER exceeds safe canvas frame
    const maxAllowedOffsetX = (W * 0.5) - marginSide;
    if ((state.posX - state.camMidX) * state.camScale > maxAllowedOffsetX) {
      state.camMidX = state.posX - (maxAllowedOffsetX / state.camScale);
    }
    if ((state.posX - state.camMidX) * state.camScale < -maxAllowedOffsetX) {
      state.camMidX = state.posX + (maxAllowedOffsetX / state.camScale);
    }
    if (state.posY * state.camScale > availH) {
      state.camScale = availH / Math.max(1, state.posY);
    }

    const activeScale = state.camScale;
    const activeMidX = state.camMidX;
    const zoomFactor = Math.min(1.0, Math.max(0.65, activeScale / 1.0));

    // World to Screen Coordinate Helpers
    const worldToScreenX = wx => (W * 0.5) + ((wx - activeMidX) * activeScale);
    const worldToScreenY = wy => groundScreenY - 26 - (wy * activeScale);

    const padScreenX = worldToScreenX(0);
    const rocketScreenX = worldToScreenX(state.posX);
    const rocketScreenY = worldToScreenY(state.posY);

    // 3. Draw Friendly Scenery with dynamically aligned launchpad
    lab.drawFriendlyBackground(simCtx, W, H, alt, padScreenX, zoomFactor);

    // 4. Draw Parabolic Flight Trajectory Arc
    const showTrail = !$('chkTrail') || $('chkTrail').checked;
    if (showTrail && state.trajectoryPoints && state.trajectoryPoints.length > 1) {
      simCtx.save();
      simCtx.strokeStyle = 'rgba(37, 99, 235, 0.55)';
      simCtx.lineWidth = 2.5;
      simCtx.setLineDash([4, 4]);
      simCtx.beginPath();
      for (let i = 0; i < state.trajectoryPoints.length; i++) {
        const pt = state.trajectoryPoints[i];
        const tx = worldToScreenX(pt.x);
        const ty = worldToScreenY(pt.y);
        if (i === 0) simCtx.moveTo(tx, ty);
        else simCtx.lineTo(tx, ty);
      }
      simCtx.stroke();
      simCtx.restore();
    }

    // 5. Calculate Rocket Rotation Angle:
    // Ascent: matches launch angle θ.
    // Near apex & descent: smoothly tilts nose down to indicate falling back to Earth.
    let rocketDrawAngle = p.cfg.angle;
    if (state.posY > 1 && state.simTime > 0.5) {
      if (state.velY < -1.5) {
        // Free fall descent - nose points towards ground
        const descentTilt = p.cfg.angle !== 0 ? (p.cfg.angle > 0 ? 160 : -160) : 180;
        rocketDrawAngle = descentTilt;
      } else if (Math.abs(state.velY) <= 1.5) {
        // Near apex
        rocketDrawAngle = p.cfg.angle * 0.5;
      }
    }

    // 6. Draw Rocket Body
    lab.drawRocket(simCtx, rocketScreenX, rocketScreenY, rocketDrawAngle, p, zoomFactor);

    // 7. Draw Clean Force & Velocity Vectors
    lab.drawVectors(simCtx, rocketScreenX, rocketScreenY, p, zoomFactor);

    // 8. Touchdown Celebration Badge when landed
    if (state.posY <= 0 && state.simTime > 2.0 && state.currentFuel <= 0) {
      lab.drawStudentBadge(simCtx, rocketScreenX, rocketScreenY - 45, '🛬 Landed Safely on Earth!', '#059669');
    }
  };
})(window.PhysicsLab);
