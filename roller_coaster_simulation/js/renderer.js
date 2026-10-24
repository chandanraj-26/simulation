/**
 * CoasterLab — Canvas 2D Rendering Engine & Kinematics Animator
 * 8-Layer rendering pipeline: Sky/Grid, Ground, Steel Trellis, Dual-Rail Track,
 * Energy Gauge, Force & Velocity Vectors, Particle FX, and the Loop-Fail Tumbling Sequence.
 */

class CoasterRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    this.width = canvas.clientWidth || 800;
    this.height = canvas.clientHeight || 540;

    // Camera & Transform
    this.camX = 15.0; // World meters
    this.camY = 18.0;
    this.scale = 12.0; // Pixels per meter
    this.targetZoom = 1.0;
    this.currentZoom = 1.0;

    // Track Reference
    this.track = new CoasterTrack();

    // Wheel spin angle
    this.wheelRotation = 0;

    // Particle FX
    this.particles = [];

    // Detach flash animation
    this.detachFlashTimer = 0;

    // Energy Bar Lerp Cache
    this.peBarHeight = 0;
    this.keBarHeight = 0;
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Responsive default scale based on container width
    const baseScale = Math.max(7.0, Math.min(14.0, this.width / 82));
    this.scale = baseScale * this.currentZoom;
  }

  setZoom(zoomFactor) {
    this.targetZoom = Math.max(0.6, Math.min(2.2, zoomFactor));
  }

  worldToScreen(wx, wy) {
    const sx = (wx - this.camX) * this.scale + this.width * 0.35;
    const sy = this.height * 0.78 - (wy - this.camY) * this.scale;
    return { x: sx, y: sy };
  }

  screenToWorld(sx, sy) {
    const wx = (sx - this.width * 0.35) / this.scale + this.camX;
    const wy = (this.height * 0.78 - sy) / this.scale + this.camY;
    return { x: wx, y: wy };
  }

  /**
   * Spawns particle burst at world coordinates (x, y)
   */
  spawnParticles(wx, wy, count = 16, type = 'crash') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (type === 'crash' ? 12 : 6) + 2;
      this.particles.push({
        x: wx,
        y: wy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + (type === 'crash' ? 4 : 2),
        size: Math.random() * 4 + 2,
        life: 1.0,
        decay: Math.random() * 0.02 + 0.015,
        color: type === 'crash'
          ? (Math.random() > 0.5 ? '#EF4444' : '#64748B')
          : (Math.random() > 0.5 ? '#10B981' : '#F59E0B'),
        type
      });
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy -= 9.81 * dt; // gravity on particles
      p.life -= p.decay;
      if (p.y <= 0) {
        p.y = 0;
        p.vy = -p.vy * 0.3;
      }
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Main Render Entry (Called each animation frame)
   */
  render(state, dt) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Smooth Camera Tracking
    this.updateCamera(state);

    // 2. Clear Screen & Draw Soft Study-Sky
    ctx.clearRect(0, 0, w, h);
    this.drawSky(ctx, w, h);

    // 3. Draw Distance Grid & Ground
    this.drawGround(ctx, w, h);

    // 4. Draw Steel Trellis Supports
    this.drawSupports(ctx);

    // 5. Draw Track Reference Markers (Apex line, h_min line)
    this.drawReferenceMarkers(ctx, state);

    // 6. Draw Rails (Ties, dual steel rails, highlights)
    this.drawTrack(ctx, state);

    // 7. Draw Trajectory Trails & Detach Arc
    this.drawTrails(ctx, state);

    // 8. Draw Falling Projectile Arc (if in fail mode)
    this.drawBallisticArc(ctx, state);

    // 9. Draw Cart (Tilted or Tumbling)
    this.drawCart(ctx, state, dt);

    // 10. Draw Force & Velocity Vectors
    if (state.status === 'RUNNING' || state.status === 'IDLE') {
      if (state.showForceVectors) this.drawForceVectors(ctx, state);
      if (state.showVelocityVector) this.drawVelocityVector(ctx, state);
    }

    // 11. Draw Particle Effects
    this.drawParticles(ctx);

    // 12. Draw On-Screen Energy Bar Gauge (Top-Right)
    if (state.showEnergyBars) {
      this.drawEnergyBarGauge(ctx, state, w);
    }
  }

  updateCamera(state) {
    // Lerp zoom
    this.currentZoom += (this.targetZoom - this.currentZoom) * 0.08;
    const baseScale = Math.max(7.0, Math.min(14.0, this.width / 82));
    this.scale = baseScale * this.currentZoom;

    // Smooth camera tracking
    let targetX = state.x;
    let targetY = Math.max(6, state.y * 0.65);

    // Dynamic zoom in inside the loop for dramatic view
    if (state.status === 'RUNNING' && state.s >= this.track.loopStartS && state.s <= this.track.loopEndS) {
      this.targetZoom = 1.25;
    } else {
      this.targetZoom = 1.0;
    }

    this.camX += (targetX - this.camX) * 0.07;
    this.camY += (targetY - this.camY) * 0.07;
  }

  drawSky(ctx, w, h) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#E0F2FE'); // Soft light sky blue
    skyGrad.addColorStop(1, '#F0F7FF'); // Soft study page blue
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle decorative clouds
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    const cloudOffsets = [0.15, 0.45, 0.75];
    cloudOffsets.forEach((ratio, idx) => {
      const cx = (w * ratio - (this.camX * 4) % (w * 1.5) + w * 1.5) % (w * 1.5) - w * 0.2;
      const cy = 40 + idx * 25;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.arc(cx + 20, cy - 8, 36, 0, Math.PI * 2);
      ctx.arc(cx + 45, cy, 26, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  drawGround(ctx, w, h) {
    const groundScreen = this.worldToScreen(0, 0);

    ctx.save();
    // Below ground
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(0, groundScreen.y, w, h - groundScreen.y);

    // Ground surface line
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundScreen.y);
    ctx.lineTo(w, groundScreen.y);
    ctx.stroke();

    // Subtle hatch lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 1;
    const hatchStep = 24;
    for (let x = 0; x < w; x += hatchStep) {
      ctx.beginPath();
      ctx.moveTo(x, groundScreen.y);
      ctx.lineTo(x - 12, groundScreen.y + 16);
      ctx.stroke();
    }

    // Distance metric ticks (every 20 meters)
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = '#64748B';
    const startM = Math.floor(this.screenToWorld(0, 0).x / 20) * 20;
    const endM = Math.ceil(this.screenToWorld(w, 0).x / 20) * 20;
    for (let m = startM; m <= endM; m += 20) {
      if (m >= 0) {
        const pt = this.worldToScreen(m, 0);
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x, pt.y + 6);
        ctx.stroke();
        ctx.fillText(`${m}m`, pt.x - 10, pt.y + 18);
      }
    }
    ctx.restore();
  }

  drawSupports(ctx) {
    const lut = this.track.lut;
    if (!lut || lut.length === 0) return;

    ctx.save();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2.5;

    // Draw vertical support pillars every ~14 meters along track
    let lastSuppX = -999;
    for (let i = 0; i < lut.length; i += 25) {
      const pt = lut[i];
      if (pt.y > 1.5 && Math.abs(pt.x - lastSuppX) > 12) {
        lastSuppX = pt.x;
        const top = this.worldToScreen(pt.x, pt.y);
        const btm = this.worldToScreen(pt.x, 0);

        // Pillar
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(btm.x, btm.y);
        ctx.stroke();

        // Cross bracing if pillar is tall
        if (pt.y > 15) {
          const midY = (pt.y) / 2;
          const midLeft = this.worldToScreen(pt.x - 2, midY);
          const midRight = this.worldToScreen(pt.x + 2, midY);
          ctx.beginPath();
          ctx.moveTo(top.x, top.y);
          ctx.lineTo(midRight.x, midRight.y);
          ctx.moveTo(top.x, top.y);
          ctx.lineTo(midLeft.x, midLeft.y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  drawReferenceMarkers(ctx, state) {
    ctx.save();
    ctx.font = '11px JetBrains Mono, monospace';

    // 1. Initial Hill Height line
    const h0Screen = this.worldToScreen(0, state.h0);
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h0Screen.y);
    ctx.lineTo(this.width, h0Screen.y);
    ctx.stroke();

    ctx.fillStyle = '#0284C7';
    ctx.fillText(`Release Height h₀ = ${state.h0.toFixed(1)} m`, 14, h0Screen.y - 5);

    // 2. Minimum Theoretical Height (h_min = 2.5 R)
    const hMin = 2.5 * state.loopRadius;
    const hMinScreen = this.worldToScreen(0, hMin);
    const isSafe = state.h0 >= hMin;

    ctx.strokeStyle = isSafe ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.6)';
    ctx.beginPath();
    ctx.moveTo(0, hMinScreen.y);
    ctx.lineTo(this.width, hMinScreen.y);
    ctx.stroke();

    ctx.fillStyle = isSafe ? '#059669' : '#DC2626';
    ctx.fillText(`2.5R Rule: h_min = ${hMin.toFixed(1)} m (${isSafe ? 'PASS' : 'FAIL ZONE'})`, 14, hMinScreen.y - 5);

    // 3. Loop Apex Height (y = 2R)
    const apexScreen = this.worldToScreen(this.track.apexX, this.track.apexY);
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.35)';
    ctx.beginPath();
    ctx.moveTo(apexScreen.x - 40, apexScreen.y);
    ctx.lineTo(apexScreen.x + 40, apexScreen.y);
    ctx.stroke();
    ctx.fillStyle = '#7C3AED';
    ctx.fillText(`Apex 2R = ${(state.loopRadius * 2).toFixed(1)} m`, apexScreen.x + 45, apexScreen.y + 4);

    ctx.setLineDash([]);
    ctx.restore();
  }

  drawTrack(ctx, state) {
    const lut = this.track.lut;
    if (!lut || lut.length < 2) return;

    ctx.save();

    // 1. Draw Sleepers / Cross Ties
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2.0;
    const tieSpacing = 4; // every 4th sample
    for (let i = 0; i < lut.length; i += tieSpacing) {
      const pt = lut[i];
      const pScreen = this.worldToScreen(pt.x, pt.y);
      // Offset perpendicular by normal
      const nx = pt.nx * 5;
      const ny = -pt.ny * 5; // screen Y is inverted
      ctx.beginPath();
      ctx.moveTo(pScreen.x - nx, pScreen.y - ny);
      ctx.lineTo(pScreen.x + nx, pScreen.y + ny);
      ctx.stroke();
    }

    // 2. Draw Main Steel Rails (Dual Line)
    // Outer shadow / bottom rail
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    let p0 = this.worldToScreen(lut[0].x, lut[0].y);
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i < lut.length; i++) {
      const p = this.worldToScreen(lut[i].x, lut[i].y);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // Inner bright specular highlight rail
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i < lut.length; i++) {
      const p = this.worldToScreen(lut[i].x, lut[i].y);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // 3. Highlight detachment danger zone on the loop
    if (this.detachFlashTimer > 0) {
      ctx.strokeStyle = `rgba(239, 68, 68, ${Math.min(1.0, this.detachFlashTimer)})`;
      ctx.lineWidth = 7.0;
      ctx.beginPath();
      for (let i = 0; i < lut.length; i++) {
        if (lut[i].segment === 'loop') {
          const p = this.worldToScreen(lut[i].x, lut[i].y);
          if (i === 0 || lut[i - 1].segment !== 'loop') ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
      }
      ctx.stroke();
      this.detachFlashTimer -= 0.02;
    }

    ctx.restore();
  }

  drawTrails(ctx, state) {
    if (!state.showSpeedTrail || state.trail.length < 2) return;

    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 1; i < state.trail.length; i++) {
      const pPrev = this.worldToScreen(state.trail[i - 1].x, state.trail[i - 1].y);
      const pCurr = this.worldToScreen(state.trail[i].x, state.trail[i].y);
      const alpha = (i / state.trail.length) * 0.45;

      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(pPrev.x, pPrev.y);
      ctx.lineTo(pCurr.x, pCurr.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawBallisticArc(ctx, state) {
    if (state.fallTrail.length < 2) return;

    ctx.save();
    ctx.strokeStyle = '#EF4444';
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    const start = this.worldToScreen(state.fallTrail[0].x, state.fallTrail[0].y);
    ctx.moveTo(start.x, start.y);
    for (let i = 1; i < state.fallTrail.length; i++) {
      const pt = this.worldToScreen(state.fallTrail[i].x, state.fallTrail[i].y);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    // Detach point marker
    if (state.detachPoint) {
      const d = this.worldToScreen(state.detachPoint.x, state.detachPoint.y);
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(d.x, d.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '700 11px Plus Jakarta Sans, sans-serif';
      ctx.fillText('⚠ DETACHMENT (N ≤ 0)', d.x + 10, d.y - 6);
    }
    ctx.restore();
  }

  drawCart(ctx, state, dt) {
    const pScreen = this.worldToScreen(state.x, state.y);

    ctx.save();
    ctx.translate(pScreen.x, pScreen.y);

    // Apply rotation: on-track matches tangent, falling tumbles freely
    // Invert angle for canvas screen space coordinates
    ctx.rotate(-state.angle);

    // Crash crumple deformation
    if (state.status === 'CRASHED') {
      ctx.scale(1.3, 0.65);
    }

    // Scale cart proportionally to zoom
    const cWidth = 32;
    const cHeight = 16;

    // Cart Drop Shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
    ctx.beginPath();
    ctx.roundRect(-cWidth / 2 + 1, -cHeight / 2 + 3, cWidth, cHeight, 4);
    ctx.fill();

    // Cart Main Body
    const bodyGrad = ctx.createLinearGradient(-cWidth / 2, -cHeight / 2, cWidth / 2, cHeight / 2);
    bodyGrad.addColorStop(0, '#EF4444');
    bodyGrad.addColorStop(1, '#B91C1C');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-cWidth / 2, -cHeight / 2, cWidth, cHeight, 5);
    ctx.fill();

    // Front Nose / Aerodynamic Hood
    ctx.fillStyle = '#991B1B';
    ctx.beginPath();
    ctx.moveTo(cWidth / 2, -cHeight / 2);
    ctx.lineTo(cWidth / 2 + 6, 0);
    ctx.lineTo(cWidth / 2, cHeight / 2);
    ctx.closePath();
    ctx.fill();

    // Windshield
    ctx.fillStyle = '#BAE6FD';
    ctx.beginPath();
    ctx.roundRect(cWidth / 2 - 10, -cHeight / 2 + 2, 7, cHeight - 4, 2);
    ctx.fill();

    // Rider Head Silhouettes
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.arc(-6, -cHeight / 2 - 3, 4.5, 0, Math.PI * 2); // Rear rider
    ctx.arc(6, -cHeight / 2 - 3, 4.5, 0, Math.PI * 2);  // Front rider
    ctx.fill();

    // Rider safety harness bar
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -cHeight / 2);
    ctx.lineTo(10, -cHeight / 2);
    ctx.stroke();

    // Wheels
    const wheelRadius = 5.5;
    const wheelPositions = [-10, 10];
    if (state.status === 'RUNNING') {
      this.wheelRotation += (state.v / (wheelRadius * 0.1)) * (dt || 0.016);
    }

    wheelPositions.forEach(wx => {
      const wy = cHeight / 2 + 1;
      // Wheel rim
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(wx, wy, wheelRadius, 0, Math.PI * 2);
      ctx.fill();

      // Hubcap
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.arc(wx, wy, 2, 0, Math.PI * 2);
      ctx.fill();

      // Spokes rotating
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const rot = this.wheelRotation;
      ctx.moveTo(wx + Math.cos(rot) * wheelRadius, wy + Math.sin(rot) * wheelRadius);
      ctx.lineTo(wx - Math.cos(rot) * wheelRadius, wy - Math.sin(rot) * wheelRadius);
      ctx.stroke();
    });

    // Speed Lines (when speed > 15 m/s)
    if (state.v > 15 && state.status === 'RUNNING') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-cWidth / 2 - 6, -3);
      ctx.lineTo(-cWidth / 2 - 18, -3);
      ctx.moveTo(-cWidth / 2 - 4, 3);
      ctx.lineTo(-cWidth / 2 - 14, 3);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawForceVectors(ctx, state) {
    const pScreen = this.worldToScreen(state.x, state.y);

    ctx.save();
    // 1. Weight Vector mg (Straight Down, Amber)
    const mgLen = Math.min(60, state.mass * 0.05);
    this.drawArrow(ctx, pScreen.x, pScreen.y, pScreen.x, pScreen.y + mgLen, '#F59E0B', 2.5);

    ctx.font = '700 10.5px JetBrains Mono, monospace';
    ctx.fillStyle = '#B45309';
    ctx.fillText('mg', pScreen.x + 8, pScreen.y + mgLen);

    // 2. Normal Force Vector N (Perpendicular Inward, Purple)
    if (state.normalForce > 0) {
      // Inward normal vector on track
      const sample = this.track.sampleAt(state.s);
      const nx = sample.nx;
      const ny = -sample.ny; // screen coords inverted

      // Scale vector visually (proportional to G-force)
      const nLen = Math.min(80, Math.max(10, state.gForce * 18));
      const endX = pScreen.x + nx * nLen;
      const endY = pScreen.y + ny * nLen;

      this.drawArrow(ctx, pScreen.x, pScreen.y, endX, endY, '#8B5CF6', 3.0);
      ctx.fillStyle = '#6D28D9';
      ctx.fillText(`N (${state.gForce.toFixed(1)}G)`, endX + 6, endY);
    }
    ctx.restore();
  }

  drawVelocityVector(ctx, state) {
    if (state.v <= 0.5) return;
    const pScreen = this.worldToScreen(state.x, state.y);

    ctx.save();
    const sample = this.track.sampleAt(state.s);
    const tx = sample.tx;
    const ty = -sample.ty;

    const vLen = Math.min(80, state.v * 2.2);
    const endX = pScreen.x + tx * vLen;
    const endY = pScreen.y + ty * vLen;

    this.drawArrow(ctx, pScreen.x, pScreen.y, endX, endY, '#10B981', 3.0);
    ctx.font = '700 10.5px JetBrains Mono, monospace';
    ctx.fillStyle = '#047857';
    ctx.fillText(`v = ${state.v.toFixed(1)} m/s`, endX + 6, endY);
    ctx.restore();
  }

  drawArrow(ctx, fromX, fromY, toX, toY, color, width = 2) {
    const headLen = 8;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  drawParticles(ctx) {
    ctx.save();
    for (const p of this.particles) {
      const pScreen = this.worldToScreen(p.x, p.y);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(pScreen.x, pScreen.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawEnergyBarGauge(ctx, state, canvasWidth) {
    const barWidth = 36;
    const barMaxHeight = 150;
    const x = canvasWidth - barWidth - 20;
    const y = 20;

    const totalE = state.initialEnergy || 1;
    const peRatio = Math.max(0, Math.min(1.0, state.pe / totalE));
    const keRatio = Math.max(0, Math.min(1.0, state.ke / totalE));

    const targetPEHeight = peRatio * barMaxHeight;
    const targetKEHeight = keRatio * barMaxHeight;

    // Smooth lerp
    this.peBarHeight += (targetPEHeight - this.peBarHeight) * 0.15;
    this.keBarHeight += (targetKEHeight - this.keBarHeight) * 0.15;

    ctx.save();

    // Container Glass Card
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x - 14, y - 10, barWidth + 82, barMaxHeight + 46, 12);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.font = '700 10px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('ENERGY EXCHANGE', x - 4, y + 2);

    // Background track for bar
    ctx.fillStyle = '#F1F5F9';
    ctx.beginPath();
    ctx.roundRect(x, y + 14, barWidth, barMaxHeight, 6);
    ctx.fill();

    // Potential Energy Bar (Blue, top portion)
    const peH = this.peBarHeight;
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.roundRect(x, y + 14, barWidth, peH, [6, 6, 0, 0]);
    ctx.fill();

    // Kinetic Energy Bar (Emerald, bottom portion)
    const keH = this.keBarHeight;
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.roundRect(x, y + 14 + (barMaxHeight - keH), barWidth, keH, [0, 0, 6, 6]);
    ctx.fill();

    // Numeric Readouts Beside Bars
    ctx.font = '700 10.5px JetBrains Mono, monospace';
    ctx.fillStyle = '#0284C7';
    ctx.fillText(`PE: ${Math.round(state.pe / 1000)} kJ`, x + barWidth + 8, y + 36);

    ctx.fillStyle = '#10B981';
    ctx.fillText(`KE: ${Math.round(state.ke / 1000)} kJ`, x + barWidth + 8, y + 14 + barMaxHeight - 8);

    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillStyle = '#64748B';
    ctx.fillText(`Total: ${Math.round(state.totalEnergy / 1000)} kJ`, x - 4, y + barMaxHeight + 28);

    ctx.restore();
  }

  triggerDetachAnimation() {
    this.detachFlashTimer = 1.0;
  }
}

window.CoasterRenderer = CoasterRenderer;
