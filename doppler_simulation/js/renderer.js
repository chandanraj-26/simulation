/**
 * DopplerLab — High-DPI Canvas 2D Acoustic Wavefront & Mach Cone Renderer
 * Renders expanding spherical acoustic wavefronts, Doppler compression/rarefaction,
 * supersonic Mach cone shockwave envelopes, CRT oscilloscope, and frequency spectrum.
 */

class DopplerRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;

    this.width = 1000;
    this.height = 540;
    this.viewScale = 1.0;

    this.lastFrameTime = performance.now();
    this.hitBoxes = [];

    // Visual pulse timer for emitter
    this.emitterPulse = 0;
    this.shockCrossedObserver = false;
  }

  setZoom(scale) {
    this.viewScale = Math.max(0.6, Math.min(1.8, scale));
  }

  zoomIn() {
    this.setZoom(this.viewScale + 0.1);
  }

  zoomOut() {
    this.setZoom(this.viewScale - 0.1);
  }

  resetZoom() {
    this.setZoom(1.0);
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width || 1000;
    this.height = rect.height || 540;

    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
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
    const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000.0);
    this.lastFrameTime = now;

    const state = window.simState;
    if (!state.isPaused) {
      this.updatePhysics(dt * state.simSpeed);
    }

    this.hitBoxes = [];
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Deep Acoustic Space Background
    this.drawBackground(ctx, w, h);

    // Apply Zoom & Pan
    ctx.save();
    const cx = w / 2;
    const cy = h / 2;
    ctx.translate(cx, cy);
    ctx.scale(this.viewScale, this.viewScale);
    ctx.translate(-cx, -cy);

    // 2. Draw Subtle Acoustic Distance Grid
    if (state.showGrid) {
      this.drawAcousticGrid(ctx, w, h);
    }

    // 3. Draw Road in Ambulance Mode
    if (state.mode === 'ambulance') {
      this.drawAmbulanceRoad(ctx, w, h);
    }

    // 4. Draw Line-of-Sight Ray between Source & Observer
    this.drawLineOfSight(ctx);

    // 5. Draw Supersonic Mach Cone Envelope
    if (state.showMachCone && state.telemetry.machNumber >= 1.0) {
      this.drawMachCone(ctx);
    }

    // 6. Draw Expanding Acoustic Wavefront Rings
    if (state.showWavefronts) {
      this.drawWavefrontRings(ctx);
    }

    // 7. Draw Observer (Microphone / Ear Sensor)
    this.drawObserver(ctx);

    // 8. Draw Acoustic Source (Transducer / Vehicle)
    this.drawSource(ctx);

    ctx.restore();

    // 9. Draw HUD Overlays (Oscilloscope & Spectrum Card) in Screen Coordinates
    if (state.showOscilloscope) {
      this.drawOscilloscopeCard(ctx);
    }

    if (state.showSpectrum) {
      this.drawSpectrumCard(ctx);
    }
  }

  // =========================================================================
  // PHYSICS UPDATE & WAVEFRONT PROPAGATION
  // =========================================================================
  updatePhysics(dt) {
    const state = window.simState;
    const vSound = state.getSoundSpeed();
    state.simTime += dt;

    // 1. Update Source Position (if not being dragged)
    if (!state.isDraggingSource) {
      state.source.x += state.source.vx * dt;
      state.source.y += state.source.vy * dt;

      // Wrap around canvas edges smoothly
      const margin = 100;
      if (state.source.x > this.width + margin) {
        state.source.x = -margin;
      } else if (state.source.x < -margin) {
        state.source.x = this.width + margin;
      }
      if (state.source.y > this.height + margin) {
        state.source.y = -margin;
      } else if (state.source.y < -margin) {
        state.source.y = this.height + margin;
      }
    }

    // 2. Update Observer Position (if not being dragged)
    if (!state.isDraggingObserver) {
      state.observer.x += state.observer.vx * dt;
      state.observer.y += state.observer.vy * dt;

      const margin = 80;
      if (state.observer.x > this.width + margin) {
        state.observer.x = -margin;
      } else if (state.observer.x < -margin) {
        state.observer.x = this.width + margin;
      }
    }

    // 3. Emit Acoustic Wavefront Rings at regular intervals
    if (state.simTime - state.lastEmissionTime >= state.emissionInterval) {
      state.lastEmissionTime = state.simTime;
      state.wavefrontCounter++;

      state.wavefronts.push({
        id: state.wavefrontCounter,
        emitX: state.source.x,
        emitY: state.source.y,
        birthTime: state.simTime,
        radius: 0,
        f0: state.source.f0,
        vSound: vSound
      });

      // Keep array memory bounded
      if (state.wavefronts.length > state.maxWavefronts) {
        state.wavefronts.shift();
      }

      this.emitterPulse = 1.0;
    }

    this.emitterPulse = Math.max(0, this.emitterPulse - dt * 4.0);

    // 4. Expand all active wavefront rings at speed of sound
    const maxRadius = Math.hypot(this.width, this.height) * 1.5;
    for (let i = state.wavefronts.length - 1; i >= 0; i--) {
      const ring = state.wavefronts[i];
      const age = state.simTime - ring.birthTime;
      ring.radius = vSound * age;

      // Check if ring hits observer for audio blip
      const distToObs = Math.hypot(state.observer.x - ring.emitX, state.observer.y - ring.emitY);
      if (Math.abs(ring.radius - distToObs) < 4.0 && !ring.hitObs) {
        ring.hitObs = true;
        if (window.soundEngine && state.mode !== 'ambulance') {
          window.soundEngine.playWavefrontCrossing();
        }
      }

      // Cull rings that expanded beyond screen
      if (ring.radius > maxRadius) {
        state.wavefronts.splice(i, 1);
      }
    }

    // 5. Compute Live 2D Doppler Telemetry
    const srcPos = { x: state.source.x, y: state.source.y };
    const srcVel = { x: state.source.vx, y: state.source.vy };
    const obsPos = { x: state.observer.x, y: state.observer.y };
    const obsVel = { x: state.observer.vx, y: state.observer.vy };

    const dop = Physics.calculate2DDoppler(state.source.f0, vSound, srcPos, srcVel, obsPos, obsVel);
    const machAngle = Physics.getMachAngle(dop.machNumber);

    state.telemetry = {
      fObs: dop.fObs,
      f0: state.source.f0,
      lambdaObs: dop.lambdaObs,
      lambda0: dop.lambda0,
      machNumber: dop.machNumber,
      ratio: dop.ratio,
      vSound: vSound,
      distance: dop.distance,
      radialSrcVel: dop.radialSrcVel,
      radialObsVel: dop.radialObsVel,
      machAngleDeg: machAngle !== null ? (machAngle * 180 / Math.PI) : null
    };

    // 6. Check Sonic Boom Trigger (when supersonic shock front crosses observer)
    if (dop.machNumber >= 1.0 && machAngle !== null) {
      const srcHeading = Math.atan2(srcVel.y, srcVel.x);
      const angleToObs = Math.atan2(obsPos.y - srcPos.y, obsPos.x - srcPos.x);
      let diffAngle = Math.abs(angleToObs - (srcHeading + Math.PI));
      while (diffAngle > Math.PI) diffAngle = Math.abs(diffAngle - 2 * Math.PI);

      const shockAngle = Math.PI / 2 - machAngle;
      if (Math.abs(diffAngle - shockAngle) < 0.15 && dop.distance < 450) {
        if (!this.shockCrossedObserver) {
          this.shockCrossedObserver = true;
          if (window.soundEngine) window.soundEngine.playSonicBoom();
        }
      } else {
        this.shockCrossedObserver = false;
      }
    }

    // 7. Update Continuous Web Audio Doppler Tone
    if (window.soundEngine) {
      const relX = (state.source.x - state.observer.x) / 300;
      const pan = Math.max(-1, Math.min(1, relX));
      const intensity = Physics.getIntensity(dop.distance, 80);
      window.soundEngine.updateDopplerTone(dop.fObs, intensity, pan, state.mode);
    }

    // 8. Update CRT Oscilloscope History
    const phaseSrc = 2.0 * Math.PI * state.source.f0 * state.simTime;
    const phaseObs = 2.0 * Math.PI * dop.fObs * state.simTime;
    state.waveformHistory.push({
      srcVal: Math.sin(phaseSrc),
      obsVal: Math.sin(phaseObs),
      time: state.simTime
    });
    if (state.waveformHistory.length > state.maxWaveformPoints) {
      state.waveformHistory.shift();
    }
  }

  // =========================================================================
  // BACKGROUND & ENVIRONMENT
  // =========================================================================
  drawBackground(ctx, w, h) {
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, Math.max(w, h));
    bgGrad.addColorStop(0, '#0c1222');
    bgGrad.addColorStop(0.6, '#070b14');
    bgGrad.addColorStop(1, '#030509');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
  }

  drawAcousticGrid(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
    ctx.lineWidth = 1;

    const gridSize = 50;
    ctx.beginPath();
    for (let x = 0; x < w; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Medium sound speed watermark
    ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    const state = window.simState;
    const med = Physics.mediums[state.mediumKey];
    ctx.fillText(`${med ? med.name : 'Medium'}: v_sound = ${state.getSoundSpeed()} m/s`, w - 16, h - 16);
    ctx.restore();
  }

  drawAmbulanceRoad(ctx, w, h) {
    const roadY = 200;
    const roadH = 64;

    ctx.save();
    // Asphalt
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, roadY - roadH / 2, w, roadH);

    // Road borders
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, roadY - roadH / 2);
    ctx.lineTo(w, roadY - roadH / 2);
    ctx.moveTo(0, roadY + roadH / 2);
    ctx.lineTo(w, roadY + roadH / 2);
    ctx.stroke();

    // Dashed center line
    ctx.setLineDash([16, 16]);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, roadY);
    ctx.lineTo(w, roadY);
    ctx.stroke();

    // Sidewalk
    ctx.setLineDash([]);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, roadY + roadH / 2, w, 32);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('EMERGENCY LANE (400 km/h TEST ROAD)', 20, roadY - roadH / 2 - 8);
    ctx.fillText('SIDEWALK OBSERVER POSITION', 20, roadY + roadH / 2 + 22);

    ctx.restore();
  }

  // =========================================================================
  // LINE OF SIGHT RAY
  // =========================================================================
  drawLineOfSight(ctx) {
    const state = window.simState;
    const sx = state.source.x;
    const sy = state.source.y;
    const ox = state.observer.x;
    const oy = state.observer.y;

    ctx.save();
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ox, oy);
    ctx.stroke();

    // Middle distance badge
    const mx = (sx + ox) / 2;
    const my = (sy + oy) / 2;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(mx - 32, my - 10, 64, 18);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(mx - 32, my - 10, 64, 18);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${state.telemetry.distance.toFixed(0)} m`, mx, my + 3);

    ctx.restore();
  }

  // =========================================================================
  // EXPANDING ACOUSTIC WAVEFRONT RINGS
  // =========================================================================
  drawWavefrontRings(ctx) {
    const state = window.simState;
    if (state.wavefronts.length === 0) return;

    ctx.save();

    state.wavefronts.forEach((ring) => {
      if (ring.radius <= 0) return;

      // Attenuation / alpha decay with radius
      const maxDist = 700;
      const alpha = Math.max(0.08, Math.min(0.85, 1.0 - ring.radius / maxDist));

      // Calculate Doppler wavelength shift relative to observer
      // If source moves towards observer, wavefronts are compressed in front
      ctx.beginPath();
      ctx.arc(ring.emitX, ring.emitY, ring.radius, 0, Math.PI * 2);

      // Color gradation:
      // Approaching (compressed): Electric Cyan / Blue (#00f2fe / #38bdf8)
      // Receding (dilated): Radiant Amber / Coral (#fb923c / #f43f5e)
      const isCompressed = state.telemetry.ratio >= 1.0;
      let strokeColor = isCompressed
        ? `rgba(56, 189, 248, ${alpha})`
        : `rgba(251, 146, 60, ${alpha})`;

      if (state.telemetry.machNumber >= 1.0) {
        strokeColor = `rgba(168, 85, 247, ${alpha * 1.1})`; // Violet shock
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Draw faint center emission mark for newest rings
      if (ring.radius < 60) {
        ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(ring.emitX, ring.emitY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();
  }

  // =========================================================================
  // SUPERSONIC MACH CONE ENVELOPE (SHOCK WAVE)
  // =========================================================================
  drawMachCone(ctx) {
    const state = window.simState;
    const sx = state.source.x;
    const sy = state.source.y;
    const vx = state.source.vx;
    const vy = state.source.vy;

    const speed = Math.hypot(vx, vy);
    if (speed <= 0) return;

    const machAngle = Physics.getMachAngle(state.telemetry.machNumber);
    if (machAngle === null) return;

    const heading = Math.atan2(vy, vx);
    const coneLen = 700;

    // The shockwave lines form angles (heading + PI - mu) and (heading + PI + mu)
    const angle1 = heading + Math.PI - machAngle;
    const angle2 = heading + Math.PI + machAngle;

    const x1 = sx + coneLen * Math.cos(angle1);
    const y1 = sy + coneLen * Math.sin(angle1);
    const x2 = sx + coneLen * Math.cos(angle2);
    const y2 = sy + coneLen * Math.sin(angle2);

    ctx.save();

    // Shaded Mach Cone Interior
    const coneGrad = ctx.createRadialGradient(sx, sy, 20, sx, sy, coneLen);
    coneGrad.addColorStop(0, 'rgba(239, 68, 68, 0.22)');
    coneGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.12)');
    coneGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');

    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fill();

    // Shockwave Front Boundary Lines
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(sx, sy);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Label Mach Angle (mu)
    const arcRadius = 45;
    ctx.beginPath();
    ctx.arc(sx, sy, arcRadius, heading + Math.PI - machAngle, heading + Math.PI);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const deg = (machAngle * 180 / Math.PI).toFixed(1);
    const labelAngle = heading + Math.PI - machAngle / 2;
    const lx = sx + (arcRadius + 16) * Math.cos(labelAngle);
    const ly = sy + (arcRadius + 16) * Math.sin(labelAngle);

    ctx.fillStyle = '#facc15';
    ctx.font = '700 9.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`μ = ${deg}°`, lx, ly);

    ctx.restore();
  }

  // =========================================================================
  // ACOUSTIC SOURCE (EMITTER / JET / AMBULANCE)
  // =========================================================================
  drawSource(ctx) {
    const state = window.simState;
    const sx = state.source.x;
    const sy = state.source.y;
    const r = state.source.radius;

    // Register Hitbox for dragging
    this.hitBoxes.push({
      type: 'source',
      x: sx - r - 8,
      y: sy - r - 8,
      w: (r + 8) * 2,
      h: (r + 8) * 2
    });

    ctx.save();

    // Emission Pulse Aura
    if (this.emitterPulse > 0) {
      const pulseR = r + this.emitterPulse * 18;
      ctx.beginPath();
      ctx.arc(sx, sy, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${this.emitterPulse * 0.7})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (state.mode === 'ambulance') {
      // Draw Ambulance Car Sprite
      const carW = 38;
      const carH = 22;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx - carW / 2, sy - carH / 2, carW, carH);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx - carW / 2, sy - carH / 2, carW, carH);

      // Red Cross
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(sx - 3, sy - 7, 6, 14);
      ctx.fillRect(sx - 7, sy - 3, 14, 6);

      // Flashing Emergency Beacon
      const isRed = (Math.floor(state.simTime * 8) % 2) === 0;
      ctx.fillStyle = isRed ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(sx, sy - carH / 2 - 3, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // High-Tech Transducer Orb
      const grad = ctx.createRadialGradient(sx - 3, sy - 3, 1, sx, sy, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#38bdf8');
      grad.addColorStop(0.8, '#0284c7');
      grad.addColorStop(1, '#0f172a');

      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Speaker soundwave icon inside
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 9px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔊', sx, sy + 3);
    }

    // Source Velocity Vector Arrow
    if (state.showVectors && Math.hypot(state.source.vx, state.source.vy) > 1) {
      const vScale = 0.35;
      const vx = state.source.vx * vScale;
      const vy = state.source.vy * vScale;
      this.drawArrow(ctx, sx, sy, sx + vx, sy + vy, '#38bdf8', `v_src = ${Math.hypot(state.source.vx, state.source.vy).toFixed(0)} m/s`);
    }

    // Label above source
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 9.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Source (f₀ = ${state.source.f0} Hz)`, sx, sy - r - 10);

    ctx.restore();
  }

  // =========================================================================
  // OBSERVER (MICROPHONE / EAR SENSOR)
  // =========================================================================
  drawObserver(ctx) {
    const state = window.simState;
    const ox = state.observer.x;
    const oy = state.observer.y;
    const r = state.observer.radius;

    this.hitBoxes.push({
      type: 'observer',
      x: ox - r - 8,
      y: oy - r - 8,
      w: (r + 8) * 2,
      h: (r + 8) * 2
    });

    ctx.save();

    // Outer Sensor Target Rings
    ctx.beginPath();
    ctx.arc(ox, oy, r + 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.setLineDash([2, 3]);
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Core Orb
    const grad = ctx.createRadialGradient(ox - 2, oy - 2, 1, ox, oy, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#34d399');
    grad.addColorStop(0.8, '#059669');
    grad.addColorStop(1, '#064e3b');

    ctx.beginPath();
    ctx.arc(ox, oy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Ear / Mic Icon
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 9px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👂', ox, oy + 3);

    // Observer Velocity Vector Arrow
    if (state.showVectors && Math.hypot(state.observer.vx, state.observer.vy) > 1) {
      const vScale = 0.35;
      const vx = state.observer.vx * vScale;
      const vy = state.observer.vy * vScale;
      this.drawArrow(ctx, ox, oy, ox + vx, oy + vy, '#10b981', `v_obs = ${Math.hypot(state.observer.vx, state.observer.vy).toFixed(0)} m/s`);
    }

    // Telemetry Badge above Observer
    const isCompressed = state.telemetry.ratio >= 1.0;
    const badgeColor = isCompressed ? '#38bdf8' : '#fb923c';

    ctx.fillStyle = badgeColor;
    ctx.font = '700 10.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Observed: ${state.telemetry.fObs.toFixed(1)} Hz`, ox, oy - r - 12);

    ctx.font = '600 8.5px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`(Shift: ${(state.telemetry.ratio * 100).toFixed(0)}%)`, ox, oy - r - 2);

    ctx.restore();
  }

  // =========================================================================
  // VECTOR ARROW HELPER
  // =========================================================================
  drawArrow(ctx, fromX, fromY, toX, toY, color, label) {
    const headLen = 7;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.0;

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
      ctx.textAlign = 'center';
      ctx.fillText(label, toX, toY + (toY > fromY ? 14 : -8));
    }
    ctx.restore();
  }

  // =========================================================================
  // CRT OSCILLOSCOPE CARD (EMITTED VS RECEIVED SINE WAVE)
  // =========================================================================
  drawOscilloscopeCard(ctx) {
    const state = window.simState;
    const gx = 20;
    const gy = 16;
    const gw = 260;
    const gh = 100;

    ctx.save();
    // CRT Terminal Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(gx, gy, gw, gh);

    // Title banner
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('CRT OSCILLOSCOPE [f₀ vs f_obs]', gx + 8, gy + 14);

    // Center zero line
    const zeroY = gy + gh * 0.58;
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(gx, zeroY);
    ctx.lineTo(gx + gw, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot waveform history
    if (state.waveformHistory.length > 2) {
      const numPts = state.waveformHistory.length;
      const dx = gw / state.maxWaveformPoints;

      // Emitted wave (Reference: Dashed Gray/White)
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      state.waveformHistory.forEach((pt, idx) => {
        const xPos = gx + idx * dx;
        const yPos = zeroY - pt.srcVal * 24;
        if (idx === 0) ctx.moveTo(xPos, yPos);
        else ctx.lineTo(xPos, yPos);
      });
      ctx.stroke();

      // Observed wave (Glowing Doppler Cyan/Orange)
      const isCompressed = state.telemetry.ratio >= 1.0;
      ctx.strokeStyle = isCompressed ? '#00f2fe' : '#fb923c';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      state.waveformHistory.forEach((pt, idx) => {
        const xPos = gx + idx * dx;
        const yPos = zeroY - pt.obsVal * 24;
        if (idx === 0) ctx.moveTo(xPos, yPos);
        else ctx.lineTo(xPos, yPos);
      });
      ctx.stroke();
    }

    // Legend
    ctx.font = '600 8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Source f₀', gx + gw - 80, gy + 14);
    ctx.fillStyle = state.telemetry.ratio >= 1.0 ? '#00f2fe' : '#fb923c';
    ctx.fillText('Observed f', gx + gw - 80, gy + 24);

    ctx.restore();
  }

  // =========================================================================
  // DYNAMIC FREQUENCY SPECTRUM CARD
  // =========================================================================
  drawSpectrumCard(ctx) {
    const state = window.simState;
    const bx = 20;
    const by = 126;
    const bw = 260;
    const bh = 84;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(bx, by, bw, bh);

    // Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 9px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📊 FREQUENCY & WAVELENGTH RATIO', bx + 8, by + 14);

    const barW = 125;
    const barH = 8;
    const maxFreq = 1200; // Hz scale limit

    const renderSpectrumBar = (lbl, val, color, y, unit) => {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 8px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(lbl, bx + 8, y + 7);

      // Track
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(bx + 64, y, barW, barH);

      // Fill
      const fillW = Math.min(barW, Math.max(0, (val / maxFreq) * barW));
      ctx.fillStyle = color;
      ctx.fillRect(bx + 64, y, fillW, barH);

      // Number
      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 8px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${val.toFixed(0)} ${unit}`, bx + bw - 8, y + 7);
    };

    renderSpectrumBar('f_source', state.source.f0, '#94a3b8', by + 26, 'Hz');
    const isCompressed = state.telemetry.ratio >= 1.0;
    renderSpectrumBar('f_obs', state.telemetry.fObs, isCompressed ? '#38bdf8' : '#fb923c', by + 42, 'Hz');

    // Wavelength comparison readout
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 8px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('λ_obs / λ₀ :', bx + 8, by + 68);

    const lambdaRatio = state.telemetry.ratio > 0 ? (1.0 / state.telemetry.ratio) : 1.0;
    ctx.fillStyle = isCompressed ? '#38bdf8' : '#fb923c';
    ctx.font = '700 8.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${lambdaRatio.toFixed(2)}x (λ_obs = ${state.telemetry.lambdaObs.toFixed(2)} m)`, bx + bw - 8, by + 68);

    ctx.restore();
  }
}

window.DopplerRenderer = DopplerRenderer;
