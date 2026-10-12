/**
 * ProjectileLab — Canvas 2D Kinematics Renderer
 * High-DPI physics rendering, dynamic cannon rotation, projectile trail tracing,
 * vector decomposition, and bullseye target collision.
 */

class ProjectileRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;

    this.width = 1000;
    this.height = 480;

    // Default view scale: 90% for spacious, balanced fit
    this.viewScale = 0.90;

    this.time = 0;
    this.lastFrameTime = performance.now();

    // World origin & scaling
    this.originX = 70; // pixels from left
    this.groundY = 410; // pixels from top
    this.scalePPM = 10.0; // pixels per meter (dynamically calculated)

    // Interactive target dragging
    this.isDraggingTarget = false;
    this.isDraggingCannonAngle = false;

    this.hitBoxes = [];
  }

  setZoom(scale) {
    this.viewScale = Math.max(0.65, Math.min(1.4, scale));
  }

  zoomIn() {
    this.setZoom(this.viewScale + 0.08);
  }

  zoomOut() {
    this.setZoom(this.viewScale - 0.08);
  }

  resetZoom() {
    this.setZoom(0.90);
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width || 960;
    this.height = rect.height || 480;

    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);

    this.groundY = this.height * 0.82;
  }

  // World (meters) to Canvas (pixels) coordinates
  worldToCanvas(x, y) {
    return {
      x: this.originX + x * this.scalePPM,
      y: this.groundY - y * this.scalePPM
    };
  }

  canvasToWorld(px, py) {
    return {
      x: Math.max(0, (px - this.originX) / this.scalePPM),
      y: Math.max(0, (this.groundY - py) / this.scalePPM)
    };
  }

  transformPointerPos(raw) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    return {
      x: cx + (raw.x - cx) / this.viewScale,
      y: cy + (raw.y - cy) / this.viewScale
    };
  }

  // =========================================================================
  // MAIN ANIMATION LOOP
  // =========================================================================
  render() {
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.lastFrameTime) / 1000.0);
    this.lastFrameTime = now;
    this.time += dt;

    this.hitBoxes = [];
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Dynamically adjust scalePPM so current trajectory fits comfortably
    this.updateDynamicScale();

    ctx.clearRect(0, 0, w, h);

    // Draw Sky, Clouds & Hills
    this.drawLandscapeBackground(ctx, w, h);

    // Apply View Zoom
    ctx.save();
    const cx = w / 2;
    const cy = h / 2;
    ctx.translate(cx, cy);
    ctx.scale(this.viewScale, this.viewScale);
    ctx.translate(-cx, -cy);

    // Draw Ground & Metric Distance Grid
    this.drawGroundRuler(ctx, w, h);

    // Update Projectile Physics Simulation Step
    const state = window.simState;
    if (state.activeShot && !state.isPaused) {
      this.updateActiveShot(state.activeShot, dt * state.simSpeed);
    }

    // Draw Trajectories
    if (state.mode === 'multi_angle') {
      this.drawMultiAngleTrajectories(ctx);
    } else {
      this.drawPastTrajectories(ctx);
    }

    // Always render active shot in all simulation modes!
    if (state.activeShot) {
      this.drawActiveShot(ctx, state.activeShot);
    }

    // Draw Cliff / Scaffolding Platform (if launchHeight > 0)
    if (state.launchHeight > 0) {
      this.drawLaunchPlatform(ctx, state.launchHeight);
    }

    // Draw Cannon Apparatus
    this.drawCannon(ctx, state.angle, state.launchHeight);

    // Draw Target Bullseye
    this.drawTargetBullseye(ctx, state.target);

    // Draw Particles & Confetti
    this.renderParticles(ctx, dt);

    ctx.restore();
  }

  updateDynamicScale() {
    const state = window.simState;
    const g = state.getGravity();
    const v0 = state.velocity;
    // Estimated max range
    const maxEstRange = Math.max(50.0, (v0 * v0) / g + state.target.x + 10.0);
    const availableWidth = this.width - this.originX - 60;
    const targetScale = Math.min(22.0, Math.max(3.0, availableWidth / maxEstRange));

    // Smooth lerp scale
    this.scalePPM += (targetScale - this.scalePPM) * 0.08;
  }

  // =========================================================================
  // ENVIRONMENT & BACKGROUND
  // =========================================================================
  drawLandscapeBackground(ctx, w, h) {
    const state = window.simState;

    if (state.gravityKey === 'moon') {
      // Lunar Black Space & Gray Regolith
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, this.groundY);

      // Stars
      ctx.fillStyle = '#ffffff';
      for (let s = 0; s < 40; s++) {
        const sx = ((s * 37) % w);
        const sy = ((s * 23) % (this.groundY - 30));
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Distant Earth in lunar sky
      ctx.save();
      ctx.beginPath();
      ctx.arc(w * 0.85, 70, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w * 0.85, 70, 22, -Math.PI / 4, Math.PI / 4);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.restore();
      return;
    }

    if (state.gravityKey === 'mars') {
      // Dusty Reddish Martian Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
      skyGrad.addColorStop(0, '#7c2d12');
      skyGrad.addColorStop(1, '#ea580c');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, this.groundY);
      return;
    }

    // Terrestrial Earth Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
    skyGrad.addColorStop(0, '#e0f2fe');
    skyGrad.addColorStop(0.7, '#bae6fd');
    skyGrad.addColorStop(1, '#f8fafc');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, this.groundY);

    // Distant Rolling Green Hills
    ctx.fillStyle = 'rgba(74, 222, 128, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, this.groundY);
    ctx.quadraticCurveTo(w * 0.25, this.groundY - 55, w * 0.5, this.groundY - 30);
    ctx.quadraticCurveTo(w * 0.75, this.groundY - 10, w, this.groundY - 45);
    ctx.lineTo(w, this.groundY);
    ctx.closePath();
    ctx.fill();

    // Floating Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    this.drawCloud(ctx, ((this.time * 8) % (w + 120)) - 60, 45, 36);
    this.drawCloud(ctx, (((this.time * 5) + 300) % (w + 120)) - 60, 80, 28);
  }

  drawCloud(ctx, cx, cy, r) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.7, cy - r * 0.2, r * 0.75, 0, Math.PI * 2);
    ctx.arc(cx - r * 0.7, cy + r * 0.1, r * 0.65, 0, Math.PI * 2);
    ctx.fill();
  }

  // DRAW GROUND & METRIC RULER
  drawGroundRuler(ctx, w, h) {
    const state = window.simState;
    const gy = this.groundY;

    // Ground grass strip
    ctx.fillStyle = state.gravityKey === 'moon' ? '#64748b' : (state.gravityKey === 'mars' ? '#c2410c' : '#15803d');
    ctx.fillRect(0, gy, w, 8);

    // Underground soil block
    ctx.fillStyle = state.gravityKey === 'moon' ? '#334155' : (state.gravityKey === 'mars' ? '#7c2d12' : '#3f2212');
    ctx.fillRect(0, gy + 8, w, h - gy - 8);

    // Metric Distance Tick Marks on Ground (Every 5m and 10m)
    ctx.strokeStyle = '#cbd5e1';
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 9.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    const maxMeters = (w - this.originX) / this.scalePPM;
    const step = maxMeters > 120 ? 20 : (maxMeters > 60 ? 10 : 5);

    for (let m = 0; m <= maxMeters; m += step) {
      const cx = this.originX + m * this.scalePPM;
      ctx.lineWidth = m % 10 === 0 ? 2 : 1;

      ctx.beginPath();
      ctx.moveTo(cx, gy);
      ctx.lineTo(cx, gy + (m % 10 === 0 ? 10 : 6));
      ctx.stroke();

      if (m % 10 === 0) {
        ctx.fillText(`${m}m`, cx, gy + 22);
      }
    }
  }

  // =========================================================================
  // LAUNCH PLATFORM / CLIFF (y0 > 0)
  // =========================================================================
  drawLaunchPlatform(ctx, y0) {
    const gy = this.groundY;
    const topY = gy - y0 * this.scalePPM;
    const pw = this.originX + 16;

    // Stone cliff / wooden scaffolding tower
    ctx.save();
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, topY, pw, gy - topY);

    // Stone brick patterns
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let by = topY; by < gy; by += 16) {
      ctx.beginPath();
      ctx.moveTo(0, by);
      ctx.lineTo(pw, by);
      ctx.stroke();
    }

    // Platform top railing
    ctx.fillStyle = '#64748b';
    ctx.fillRect(pw - 4, topY - 12, 4, 12);
    ctx.restore();
  }

  // =========================================================================
  // CANNON APPARATUS
  // =========================================================================
  drawCannon(ctx, angleDeg, y0) {
    const state = window.simState;
    const origin = this.worldToCanvas(0, y0);
    const rad = Physics.degToRad(angleDeg);

    ctx.save();
    ctx.translate(origin.x, origin.y);

    // Recoil offset along barrel line
    const recoilDist = state.cannonRecoil || 0;
    if (state.cannonRecoil > 0) {
      state.cannonRecoil -= 0.6;
    }

    // 1. Angle Protractor Arc behind cannon
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, 42, -Math.PI / 2, 0);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Active angle arc fill
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 36, 0, -rad, true);
    ctx.closePath();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fill();

    // Degree readout
    ctx.fillStyle = '#0284c7';
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${angleDeg.toFixed(1)}°`, Math.cos(-rad / 2) * 48, Math.sin(-rad / 2) * 48);
    ctx.restore();

    // 2. Pivoting Barrel
    ctx.save();
    ctx.rotate(-rad);
    ctx.translate(-recoilDist, 0);

    // Cast-iron barrel gradient
    const barrelLen = 34;
    const barrelWidth = 14;
    const barrelGrad = ctx.createLinearGradient(0, -barrelWidth / 2, 0, barrelWidth / 2);
    barrelGrad.addColorStop(0, '#64748b');
    barrelGrad.addColorStop(0.5, '#0f172a');
    barrelGrad.addColorStop(1, '#334155');

    ctx.fillStyle = barrelGrad;
    ctx.beginPath();
    ctx.moveTo(0, -barrelWidth / 2);
    ctx.lineTo(barrelLen, -(barrelWidth * 0.4));
    ctx.lineTo(barrelLen, barrelWidth * 0.4);
    ctx.lineTo(0, barrelWidth / 2);
    ctx.closePath();
    ctx.fill();

    // Muzzle ring lip
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(barrelLen - 2, -(barrelWidth * 0.45), 4, barrelWidth * 0.9);

    // Muzzle flash burst at tip of barrel during recoil
    if (state.cannonRecoil > 3) {
      const flashSize = state.cannonRecoil * 2.5;
      const flashGrad = ctx.createRadialGradient(barrelLen, 0, 2, barrelLen, 0, flashSize);
      flashGrad.addColorStop(0, '#ffffff');
      flashGrad.addColorStop(0.3, '#facc15');
      flashGrad.addColorStop(0.7, '#ea580c');
      flashGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(barrelLen, 0, flashSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Wheel Carriage Base
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#b45309'; // wood wheel
    ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Wheel spokes
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(12, 0);
    ctx.moveTo(0, -12);
    ctx.lineTo(0, 12);
    ctx.stroke();

    // Center brass axle pin
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#eab308';
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // TARGET & BULLSEYE
  // =========================================================================
  drawTargetBullseye(ctx, target) {
    const pos = this.worldToCanvas(target.x, target.y);
    const tw = target.radius * this.scalePPM * 2;
    const th = 8; // flat on ground

    // Hitbox for dragging target position along ground
    this.hitBoxes.push({
      type: 'target',
      x: pos.x - tw / 2,
      y: pos.y - 12,
      w: tw,
      h: 24
    });

    ctx.save();
    // Concentric bullseye ellipse on ground
    const rings = ['#ef4444', '#ffffff', '#ef4444', '#ffffff', '#eab308'];
    const rx = target.radius * this.scalePPM;
    const ry = 8;

    for (let r = rings.length - 1; r >= 0; r--) {
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, rx * ((r + 1) / rings.length), ry * ((r + 1) / rings.length), 0, 0, Math.PI * 2);
      ctx.fillStyle = rings[r];
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Flag banner pole at target center
    ctx.fillStyle = '#475569';
    ctx.fillRect(pos.x - 1.5, pos.y - 42, 3, 42);

    // Red triangular flag
    ctx.beginPath();
    ctx.moveTo(pos.x + 1.5, pos.y - 42);
    ctx.lineTo(pos.x + 22, pos.y - 32);
    ctx.lineTo(pos.x + 1.5, pos.y - 22);
    ctx.closePath();
    ctx.fillStyle = '#f43f5e';
    ctx.fill();

    // Distance label below
    ctx.fillStyle = '#1e293b';
    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Target: ${target.x.toFixed(1)}m`, pos.x, pos.y + 18);
    ctx.restore();
  }

  // =========================================================================
  // ACTIVE PROJECTILE IN FLIGHT
  // =========================================================================
  updateActiveShot(shot, dt) {
    const state = window.simState;
    const g = state.getGravity();
    const rho = state.getAirDensity();
    const proj = Physics.projectiles[state.projectileKey] || Physics.projectiles['cannonball'];

    shot.t += dt;

    if (!state.airResistance || rho <= 0) {
      // Analytical kinematics
      const v0x = shot.v0x !== undefined ? shot.v0x : (shot.v0 * Math.cos(Physics.degToRad(shot.angle)));
      const v0y = shot.v0y !== undefined ? shot.v0y : (shot.v0 * Math.sin(Physics.degToRad(shot.angle)));
      const y0 = shot.y0 !== undefined ? shot.y0 : state.launchHeight;

      shot.x = v0x * shot.t;
      shot.y = Math.max(0, y0 + v0y * shot.t - 0.5 * g * shot.t * shot.t);
      shot.vx = v0x;
      shot.vy = v0y - g * shot.t;
    } else {
      // Step numerical drag: F_drag = 0.5 * Cd * rho * A * v^2
      const m = proj.mass;
      const area = Math.PI * proj.radius * proj.radius;
      const kDrag = 0.5 * proj.Cd * rho * area;

      const speed = Math.hypot(shot.vx, shot.vy);
      const fDrag = kDrag * speed * speed;
      const fDragX = speed > 0 ? -fDrag * (shot.vx / speed) : 0;
      const fDragY = speed > 0 ? -fDrag * (shot.vy / speed) : 0;

      const ax = fDragX / m;
      const ay = -g + fDragY / m;

      shot.vx += ax * dt;
      shot.vy += ay * dt;
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
    }

    if (shot.y > shot.maxHeightReached) {
      shot.maxHeightReached = shot.y;
    }

    // Add trail point smoothly
    const lastPt = shot.trail[shot.trail.length - 1];
    if (!lastPt || Math.hypot(shot.x - lastPt.x, shot.y - lastPt.y) > 0.4) {
      shot.trail.push({ x: shot.x, y: shot.y });
    }

    // Spawn subtle fiery spark particles in flight
    if (Math.random() < 0.35) {
      state.muzzleParticles.push({
        x: shot.x,
        y: shot.y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: ['#f59e0b', '#fbbf24', '#ef4444', '#ffffff'][Math.floor(Math.random() * 4)],
        size: Math.random() * 3 + 1.5,
        life: 0.28
      });
    }

    // Check Ground Impact (after at least 0.04s flight time)
    if (shot.y <= 0 && shot.t > 0.04) {
      shot.y = 0;
      shot.landedX = shot.x;

      // Check Target Hit (within target radius)
      const distToTarget = Math.abs(shot.x - state.target.x);
      if (distToTarget <= state.target.radius) {
        shot.isTargetHit = true;
        state.triggerTargetHit(shot.x, 0);
      } else {
        state.triggerImpact(shot.x, 0);
      }

      // Check Quests
      state.checkQuests(shot);

      // Save to past trajectories and stop flight
      state.pastTrajectories.push({
        trail: [...shot.trail],
        landedX: shot.landedX,
        maxH: shot.maxHeightReached,
        color: proj.accentColor || '#38bdf8',
        projKey: state.projectileKey
      });

      state.activeShot = null;
    }
  }

  drawActiveShot(ctx, shot) {
    const state = window.simState;
    const proj = Physics.projectiles[state.projectileKey] || Physics.projectiles['cannonball'];
    const pos = this.worldToCanvas(shot.x, shot.y);

    // 1. Trail Line (Luminous ribbon)
    if (state.showTrail && shot.trail.length > 1) {
      ctx.save();
      ctx.shadowColor = proj.accentColor || '#38bdf8';
      ctx.shadowBlur = 4;
      ctx.strokeStyle = proj.accentColor || '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      shot.trail.forEach((p, idx) => {
        const cpos = this.worldToCanvas(p.x, p.y);
        if (idx === 0) ctx.moveTo(cpos.x, cpos.y);
        else ctx.lineTo(cpos.x, cpos.y);
      });
      ctx.stroke();

      // Glowing markers every interval
      ctx.fillStyle = '#ffffff';
      shot.trail.forEach((p, idx) => {
        if (idx % 16 === 0) {
          const cpos = this.worldToCanvas(p.x, p.y);
          ctx.beginPath();
          ctx.arc(cpos.x, cpos.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();
    }

    // 2. Peak Height Indicator
    if (state.showPeakIndicator && shot.maxHeightReached > 0.5) {
      const peakPos = this.worldToCanvas(shot.x, shot.maxHeightReached);
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(this.originX, peakPos.y);
      ctx.lineTo(pos.x, peakPos.y);
      ctx.stroke();

      ctx.fillStyle = '#b45309';
      ctx.font = '700 9.5px "JetBrains Mono", monospace';
      ctx.fillText(`H_max: ${shot.maxHeightReached.toFixed(1)}m`, this.originX + 10, peakPos.y - 4);
      ctx.restore();
    }

    // 3. Projectile Body & Outer Glow Halo
    ctx.save();
    const glowGrad = ctx.createRadialGradient(pos.x, pos.y, 2, pos.x, pos.y, 20);
    glowGrad.addColorStop(0, 'rgba(255, 237, 213, 0.85)');
    glowGrad.addColorStop(0.35, 'rgba(249, 115, 22, 0.4)');
    glowGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Render detailed projectile mesh
    this.renderProjectileMesh(ctx, state.projectileKey, pos.x, pos.y, shot);
    ctx.restore();

    // 4. Force & Velocity Vectors
    if (state.showVelocityVectors) {
      const vecScale = 2.0;
      const speed = Math.hypot(shot.vx, shot.vy);
      // Total velocity arrow (purple)
      this.drawArrow(ctx, pos.x, pos.y, pos.x + shot.vx * vecScale, pos.y - shot.vy * vecScale, '#8b5cf6', `v (${speed.toFixed(1)})`);
      // Vx horizontal arrow (cyan)
      this.drawArrow(ctx, pos.x, pos.y, pos.x + shot.vx * vecScale, pos.y, '#0284c7', `v_x (${shot.vx.toFixed(1)})`);
      // Vy vertical arrow (green)
      this.drawArrow(ctx, pos.x, pos.y, pos.x, pos.y - shot.vy * vecScale, '#10b981', `v_y (${shot.vy.toFixed(1)})`);
    }

    if (state.showAccelerationVector) {
      const g = state.getGravity();
      this.drawArrow(ctx, pos.x, pos.y, pos.x, pos.y + g * 2.8, '#ef4444', `g (-${g.toFixed(1)})`);
    }
  }

  renderProjectileMesh(ctx, key, cx, cy, shot) {
    if (key === 'baseball') {
      // Baseball: White sphere with red curved stitching
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Red stitches
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx - 3, cy, 6, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 3, cy, 6, Math.PI * 2 / 3, Math.PI * 4 / 3);
      ctx.stroke();
    } else if (key === 'golfball') {
      // Golf ball: White with dimple dots
      ctx.beginPath();
      ctx.arc(cx, cy, 7.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#cbd5e1';
      for (let d = -4; d <= 4; d += 3) {
        ctx.fillRect(cx + d, cy - 2, 1.5, 1.5);
        ctx.fillRect(cx + d, cy + 2, 1.5, 1.5);
      }
    } else if (key === 'tank_shell') {
      // Tank shell: Pointed streamlined missile
      const angle = Math.atan2(-shot.vy, shot.vx);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.fillStyle = '#15803d';
      ctx.fillRect(-12, -4, 18, 8);
      // Gold nose cone
      ctx.beginPath();
      ctx.moveTo(6, -4);
      ctx.lineTo(14, 0);
      ctx.lineTo(6, 4);
      ctx.closePath();
      ctx.fillStyle = '#eab308';
      ctx.fill();
      ctx.restore();
    } else if (key === 'piano') {
      // Grand Piano
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-12, -8, 24, 16);
      // Keyboard keys
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-10, -6, 20, 4);
      ctx.fillStyle = '#000000';
      ctx.fillRect(-7, -6, 2, 3);
      ctx.fillRect(-2, -6, 2, 3);
      ctx.fillRect(3, -6, 2, 3);
      ctx.restore();
    } else {
      // Cast-Iron Cannonball: 3D Metallic Shading
      const grad = ctx.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, 11);
      grad.addColorStop(0, '#94a3b8');
      grad.addColorStop(0.3, '#475569');
      grad.addColorStop(0.8, '#1e293b');
      grad.addColorStop(1, '#090d16');

      ctx.beginPath();
      ctx.arc(cx, cy, 10.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Specular highlight gleam
      ctx.beginPath();
      ctx.arc(cx - 3, cy - 3, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fill();
    }
  }

  drawArrow(ctx, fromX, fromY, toX, toY, color, label) {
    const headLen = 6;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    if (label) {
      ctx.font = '700 8.5px "JetBrains Mono", monospace';
      ctx.fillText(label, toX + 6, toY);
    }
    ctx.restore();
  }

  // DRAW PAST SHOT TRAJECTORIES
  drawPastTrajectories(ctx) {
    const state = window.simState;
    if (!state.showTrail) return;

    state.pastTrajectories.forEach((pt, i) => {
      ctx.save();
      ctx.strokeStyle = pt.color || 'rgba(148, 163, 184, 0.5)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      pt.trail.forEach((p, idx) => {
        const cpos = this.worldToCanvas(p.x, p.y);
        if (idx === 0) ctx.moveTo(cpos.x, cpos.y);
        else ctx.lineTo(cpos.x, cpos.y);
      });
      ctx.stroke();

      // Landed resting marker & distance tag
      if (pt.landedX !== null && pt.landedX !== undefined) {
        const lpos = this.worldToCanvas(pt.landedX, 0);

        // Resting marker on grass
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(lpos.x, lpos.y - 5, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#334155';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = '700 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`📍 ${pt.landedX.toFixed(1)}m`, lpos.x, lpos.y + 14);
      }
      ctx.restore();
    });
  }

  // DRAW MULTI-ANGLE COMPARISON OVERLAY (15, 30, 45, 60, 75 deg)
  drawMultiAngleTrajectories(ctx) {
    const state = window.simState;
    const colors = ['#f43f5e', '#ea580c', '#eab308', '#10b981', '#3b82f6'];
    const g = state.getGravity();

    state.multiAngles.forEach((deg, idx) => {
      const data = Physics.generateTrajectoryPath({
        v0: state.velocity,
        angleDeg: deg,
        y0: state.launchHeight,
        g: g,
        useAirDrag: state.airResistance,
        airDensity: state.getAirDensity(),
        projectileKey: state.projectileKey
      });

      ctx.save();
      ctx.strokeStyle = colors[idx % colors.length];
      ctx.lineWidth = deg === 45 ? 3 : 1.8;
      ctx.beginPath();

      data.points.forEach((p, pidx) => {
        const cpos = this.worldToCanvas(p.x, p.y);
        if (pidx === 0) ctx.moveTo(cpos.x, cpos.y);
        else ctx.lineTo(cpos.x, cpos.y);
      });
      ctx.stroke();

      // Landing marker badge
      const landPos = this.worldToCanvas(data.range, 0);
      ctx.fillStyle = colors[idx % colors.length];
      ctx.font = '700 8.5px "JetBrains Mono", monospace';
      ctx.fillText(`${deg}° (${data.range.toFixed(1)}m)`, landPos.x, landPos.y - 6);
      ctx.restore();
    });
  }

  // =========================================================================
  // PARTICLES (MUZZLE BLAST, IMPACT, CONFETTI)
  // =========================================================================
  renderParticles(ctx, dt) {
    const state = window.simState;

    // Muzzle blast smoke/fire
    for (let i = state.muzzleParticles.length - 1; i >= 0; i--) {
      const p = state.muzzleParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      const pos = this.worldToCanvas(p.x, p.y);
      ctx.save();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life * 2.5);
      ctx.fill();
      ctx.restore();

      if (p.life <= 0) state.muzzleParticles.splice(i, 1);
    }

    // Dirt impact
    for (let i = state.impactParticles.length - 1; i >= 0; i--) {
      const p = state.impactParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy -= 18 * dt; // gravity
      p.life -= dt;

      const pos = this.worldToCanvas(p.x, p.y);
      ctx.save();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life * 2.0);
      ctx.fill();
      ctx.restore();

      if (p.life <= 0) state.impactParticles.splice(i, 1);
    }

    // Confetti
    for (let i = state.confetti.length - 1; i >= 0; i--) {
      const p = state.confetti[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy -= 8 * dt;
      p.rot += p.vRot;
      p.life -= 0.6 * dt;

      const pos = this.worldToCanvas(p.x, p.y);
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();

      if (p.life <= 0) state.confetti.splice(i, 1);
    }
  }
}

window.ProjectileRenderer = ProjectileRenderer;
