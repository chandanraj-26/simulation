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

  // Helper to draw clean rounded pill badge with shadow
  lab.drawStudentBadge = function(ctx, x, y, text, color) {
    ctx.save();
    ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
    const paddingX = 10;
    const textW = ctx.measureText(text).width;
    const badgeW = textW + paddingX * 2;
    const badgeH = 24;

    // Drop shadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;

    // White pill background with colored border
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(x - badgeW / 2, y - badgeH / 2, badgeW, badgeH, 12);
    ctx.fill();
    ctx.stroke();

    // Text label
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
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

  // Draw Rocket (Aerodynamic White with Red fins and animated flame)
  // Draw Rocket (Aerodynamic White with Red fins, animated flame, and landing gear)
  lab.drawRocket = function(ctx, px, py, angleDeg = 0, p = null) {
    ctx.save();
    ctx.translate(px, py);
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
  lab.drawVectors = function(ctx, px, py, p) {
    const showForces = !$('chkForces') || $('chkForces').checked;
    if (!showForces) return;

    const showValues = !$('chkValues') || $('chkValues').checked;
    const showReaction = $('chkReaction') && $('chkReaction').checked;
    const state = lab.state;
    const speed = Math.hypot(state.velX, state.velY);

    // 1. UPWARD THRUST ARROW (Emerald Green) - only when fuel > 0
    if (p.effectiveThrust > 0) {
      const tLen = Math.min(120, 25 + (p.effectiveThrust / 100000) * 85);
      const tx = px - 35, ty1 = py, ty2 = ty1 - tLen;
      lab.drawBoldArrow(ctx, tx, ty1, tx, ty2, '#10b981', 4);
      const thrustLabel = showValues ? `Thrust: ${lab.fmtNum(p.effectiveThrust, 0)} N` : `Thrust (Up)`;
      lab.drawStudentBadge(ctx, tx, ty2 - 16, thrustLabel, '#059669');
    }

    // 2. DOWNWARD WEIGHT / GRAVITY ARROW (Warm Amber)
    if (p.weight > 0) {
      const wLen = Math.min(80, 20 + (p.weight / 100000) * 55);
      const wx = px + 35, wy1 = py, wy2 = wy1 + wLen;
      lab.drawBoldArrow(ctx, wx, wy1, wx, wy2, '#f59e0b', 4);
      const weightLabel = showValues ? `Weight: ${lab.fmtNum(p.weight, 0)} N` : `Weight (Down)`;
      lab.drawStudentBadge(ctx, wx, wy2 + 14, weightLabel, '#d97706');
    }

    // 3. NET RESULTANT FORCE ARROW (Electric Blue)
    if (Math.abs(p.fy) > 50) {
      const netLen = Math.min(120, 22 + (Math.abs(p.fy) / 100000) * 85);
      const nx = px + 80, ny1 = py;
      const ny2 = p.fy > 0 ? ny1 - netLen : ny1 + netLen;
      lab.drawBoldArrow(ctx, nx, ny1, nx, ny2, '#0284c7', 4);
      const netLabel = showValues ? `Fnet: ${(p.fy > 0 ? '+' : '')}${lab.fmtNum(p.netForce, 0)} N` : `Net Force`;
      lab.drawStudentBadge(ctx, nx, p.fy > 0 ? ny2 - 16 : ny2 + 16, netLabel, '#0284c7');
    } else if (p.effectiveThrust > 0 && Math.abs(p.effectiveThrust - p.weight) <= 50) {
      // Balanced forces indicator badge
      lab.drawStudentBadge(ctx, px + 80, py, 'Net Force = 0 N (Balanced ⚖️)', '#059669');
    }

    // 4. ACTION-REACTION EXHAUST (Newton's 3rd Law Pair)
    if (showReaction && p.effectiveThrust > 0) {
      const exLen = 42;
      lab.drawBoldArrow(ctx, px, py + 26, px, py + 26 + exLen, '#ec4899', 3.5);
      lab.drawStudentBadge(ctx, px, py + 26 + exLen + 14, 'Exhaust (Action)', '#db2777');
    }

    // 5. VELOCITY DIRECTION ARROW (Cyan) when in motion
    if (speed > 1.5 && state.posY > 0) {
      const vLen = Math.min(70, 18 + speed * 1.1);
      const vx = px - 78, vy1 = py;
      const vAngle = Math.atan2(state.velY, state.velX); // angle in canvas coords (where down is positive Y)
      // canvas Y is inverted from physics Y:
      const vEndPx = vx + Math.cos(vAngle) * (state.velX !== 0 ? Math.sign(state.velX) * 15 : 0);
      const vEndPy = state.velY >= 0 ? vy1 - vLen : vy1 + vLen;
      lab.drawBoldArrow(ctx, vx, vy1, vx, vEndPy, '#06b6d4', 3.5);
      const velText = state.velY >= 0 ? `v: ↑ +${speed.toFixed(0)} m/s` : `v: ↓ -${speed.toFixed(0)} m/s`;
      lab.drawStudentBadge(ctx, vx, state.velY >= 0 ? vEndPy - 16 : vEndPy + 16, velText, '#0891b2');
    }
  };

  // Draw Ground Launchpad & Cheerful Atmosphere (Stable Horizon for 15-30s Flight)
  lab.drawFriendlyBackground = function(ctx, W, H, alt) {
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
    // Green grassy meadow
    ctx.fillStyle = '#10b981';
    ctx.fillRect(0, groundScreenY, W, 12);
    ctx.fillStyle = '#059669';
    ctx.fillRect(0, groundScreenY + 10, W, 4);

    // Earth foundation soil
    ctx.fillStyle = '#5c4033';
    ctx.fillRect(0, groundScreenY + 14, W, H - groundScreenY);

    // Clean Launchpad concrete deck
    const padW = 110, padX = W * 0.5 - padW / 2;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(padX, groundScreenY - 6, padW, 8);

    // Yellow caution edge
    ctx.fillStyle = '#facc15';
    ctx.fillRect(padX, groundScreenY - 6, padW, 2);

    // Gantry Tower
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(padX - 22, groundScreenY - 100, 16, 96);
    ctx.restore();

    return groundScreenY;
  };

  // Main Canvas Draw Call (Calibrated for 15-30s Suborbital Flight & 2D Parabolic Arcs)
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

    // 1. Draw Cheerful & Friendly Scenery
    const groundScreenY = lab.drawFriendlyBackground(simCtx, W, H, alt);

    // 2. Coordinate Scaling for complete 15-30s flight (0 to ~320m fits gracefully)
    const maxExpectedAlt = Math.max(320, alt * 1.15);
    const scaleY = (groundScreenY - 70) / maxExpectedAlt;
    const scaleX = Math.min(scaleY * 0.75, 0.85);

    const rocketScreenY = groundScreenY - 26 - (alt * scaleY);
    const rocketScreenX = W * 0.5 + (state.posX * scaleX);

    // 3. Draw Parabolic Flight Trajectory Arc
    const showTrail = !$('chkTrail') || $('chkTrail').checked;
    if (showTrail && state.trajectoryPoints.length > 1) {
      simCtx.save();
      simCtx.strokeStyle = 'rgba(37, 99, 235, 0.5)';
      simCtx.lineWidth = 2.5;
      simCtx.setLineDash([4, 4]);
      simCtx.beginPath();
      for (let i = 0; i < state.trajectoryPoints.length; i++) {
        const pt = state.trajectoryPoints[i];
        const tx = W * 0.5 + (pt.x * scaleX);
        const ty = groundScreenY - 26 - (pt.y * scaleY);
        if (i === 0) simCtx.moveTo(tx, ty);
        else simCtx.lineTo(tx, ty);
      }
      simCtx.stroke();
      simCtx.restore();
    }

    // 4. Calculate Rocket Rotation Angle:
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

    // 5. Draw Rocket Body
    lab.drawRocket(simCtx, rocketScreenX, rocketScreenY, rocketDrawAngle, p);

    // 6. Draw Clean Force & Velocity Vectors
    lab.drawVectors(simCtx, rocketScreenX, rocketScreenY, p);

    // 7. Touchdown Celebration Badge when landed
    if (state.posY <= 0 && state.simTime > 2.0 && state.currentFuel <= 0) {
      lab.drawStudentBadge(simCtx, rocketScreenX, rocketScreenY - 45, '🛬 Landed Safely on Earth!', '#059669');
    }
  };
})(window.PhysicsLab);
