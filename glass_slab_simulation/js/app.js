/**
 * Glass Slab Virtual Lab - Refraction & Lateral Displacement
 * High precision 2D Optics Simulation
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playLaserClick() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playPing() {
    if (!this.enabled) return;
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.5, this.ctx.currentTime + 0.15); // C6

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }
}

class GlassSlabSimulation {
  constructor() {
    this.canvas = document.getElementById('simCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundEngine();

    // Simulation state
    this.angleI = 45; // degrees (0 to 80)
    this.thicknessMm = 60; // mm (30 to 100)
    this.refractiveIndex = 1.52; // Crown Glass
    this.mediumName = 'Crown Glass';
    this.mode = 'laser'; // 'laser' or 'pins'
    this.showUndeviated = true;
    this.showNormals = true;
    this.showProtractor = false;

    // Interaction state
    this.isDragging = false;
    this.dragTarget = null;

    // Geometry caches
    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    this.initDOM();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.setupInteractions();
    this.update();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  animate() {
    this.render();
    requestAnimationFrame(this.animate);
  }

  initDOM() {
    // Controls
    this.sliderAngle = document.getElementById('sliderAngle');
    this.valAngle = document.getElementById('valAngle');
    this.sliderThickness = document.getElementById('sliderThickness');
    this.valThickness = document.getElementById('valThickness');
    this.selectMedium = document.getElementById('selectMedium');

    this.chkUndeviated = document.getElementById('chkUndeviated');
    this.chkNormals = document.getElementById('chkNormals');
    this.chkProtractor = document.getElementById('chkProtractor');
    this.selectMode = document.getElementById('selectMode');

    // Telemetry
    this.readoutI = document.getElementById('readoutI');
    this.readoutR = document.getElementById('readoutR');
    this.readoutE = document.getElementById('readoutE');
    this.readoutD = document.getElementById('readoutD');
    this.readoutSpeed = document.getElementById('readoutSpeed');
    this.readoutIndex = document.getElementById('readoutIndex');

    // Audio button
    this.btnAudio = document.getElementById('btnAudioToggle');
    this.btnAudio.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.btnAudio.textContent = this.sound.enabled ? '🔊 Sound: ON' : '🔈 Sound: OFF';
      if (this.sound.enabled) this.sound.playLaserClick();
    });

    // Reset button
    document.getElementById('btnResetAll').addEventListener('click', () => {
      this.angleI = 45;
      this.thicknessMm = 60;
      this.refractiveIndex = 1.52;
      this.mediumName = 'Crown Glass';
      this.mode = 'laser';
      this.showUndeviated = true;
      this.showNormals = true;
      this.showProtractor = false;

      this.sliderAngle.value = 45;
      this.valAngle.textContent = '45.0°';
      this.sliderThickness.value = 60;
      this.valThickness.textContent = '60 mm';
      this.selectMedium.value = '1.52';
      this.chkUndeviated.checked = true;
      this.chkNormals.checked = true;
      this.chkProtractor.checked = false;
      this.selectMode.value = 'laser';

      this.sound.playPing();
      this.update();
    });

    // Modals
    const theoryModal = document.getElementById('modalTheory');
    document.getElementById('btnOpenTheory').addEventListener('click', () => {
      theoryModal.classList.add('open');
      this.sound.playLaserClick();
    });
    document.getElementById('btnCloseTheory').addEventListener('click', () => {
      theoryModal.classList.remove('open');
    });

    theoryModal.addEventListener('click', (e) => {
      if (e.target === theoryModal) theoryModal.classList.remove('open');
    });

    // Event listeners
    this.sliderAngle.addEventListener('input', (e) => {
      this.angleI = parseFloat(e.target.value);
      this.valAngle.textContent = `${this.angleI.toFixed(1)}°`;
      this.update();
    });

    this.sliderThickness.addEventListener('input', (e) => {
      this.thicknessMm = parseFloat(e.target.value);
      this.valThickness.textContent = `${this.thicknessMm} mm`;
      this.update();
    });

    this.selectMedium.addEventListener('change', (e) => {
      this.refractiveIndex = parseFloat(e.target.value);
      const selectedOption = this.selectMedium.options[this.selectMedium.selectedIndex];
      this.mediumName = selectedOption.text.split('(')[0].trim();
      this.sound.playLaserClick();
      this.update();
    });

    this.chkUndeviated.addEventListener('change', (e) => {
      this.showUndeviated = e.target.checked;
      this.render();
    });

    this.chkNormals.addEventListener('change', (e) => {
      this.showNormals = e.target.checked;
      this.render();
    });

    this.chkProtractor.addEventListener('change', (e) => {
      this.showProtractor = e.target.checked;
      this.render();
    });

    this.selectMode.addEventListener('change', (e) => {
      this.mode = e.target.value;
      this.sound.playLaserClick();
      this.render();
    });
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.render();
  }

  setupInteractions() {
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
      // Check hit near incident ray source or incidence point
      const p1 = this.calcIncidentSourcePos();
      const dist = Math.hypot(pos.x - p1.x, pos.y - p1.y);
      if (dist < 30) {
        this.isDragging = true;
        this.canvas.style.cursor = 'grabbing';
      }
    };

    const handlePointerMove = (e) => {
      const pos = getPos(e);
      if (this.isDragging) {
        // Compute angle relative to entry normal
        const entryPoint = this.calcEntryPoint();
        const dx = entryPoint.x - pos.x;
        const dy = entryPoint.y - pos.y;
        if (dy > 10) {
          let deg = Math.atan2(dx, dy) * (180 / Math.PI);
          deg = Math.max(0, Math.min(80, deg));
          this.angleI = deg;
          this.sliderAngle.value = deg.toFixed(1);
          this.valAngle.textContent = `${deg.toFixed(1)}°`;
          this.update();
        }
      } else {
        const p1 = this.calcIncidentSourcePos();
        const dist = Math.hypot(pos.x - p1.x, pos.y - p1.y);
        this.canvas.style.cursor = dist < 30 ? 'grab' : 'crosshair';
      }
    };

    const handlePointerUp = () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
        this.sound.playLaserClick();
      }
    };

    this.canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    this.canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
  }

  calcEntryPoint() {
    return {
      x: this.width * 0.42,
      y: this.height * 0.35
    };
  }

  calcIncidentSourcePos() {
    const entry = this.calcEntryPoint();
    const radI = (this.angleI * Math.PI) / 180;
    const rayLen = Math.min(this.width * 0.32, 200);
    return {
      x: entry.x - rayLen * Math.sin(radI),
      y: entry.y - rayLen * Math.cos(radI)
    };
  }

  update() {
    const radI = (this.angleI * Math.PI) / 180;
    // Snell's Law: 1 * sin(i) = n * sin(r) => r = asin(sin(i) / n)
    const sinR = Math.sin(radI) / this.refractiveIndex;
    const radR = Math.asin(Math.max(-1, Math.min(1, sinR)));
    const degR = (radR * 180) / Math.PI;

    // Angle of emergence e = i (since opposite surfaces are parallel)
    const degE = this.angleI;

    // Lateral displacement: d = t * sin(i - r) / cos(r)
    // Convert thickness mm to scaled value
    const cosR = Math.cos(radR);
    let dMm = 0;
    if (cosR > 0.0001) {
      dMm = (this.thicknessMm * Math.sin(radI - radR)) / cosR;
    }

    // Speed of light in medium: v = c / n (c = 3e8 m/s)
    const speed = (3.0 / this.refractiveIndex).toFixed(2);

    // Update telemetry
    this.readoutI.textContent = `${this.angleI.toFixed(1)}°`;
    this.readoutR.textContent = `${degR.toFixed(1)}°`;
    this.readoutE.textContent = `${degE.toFixed(1)}°`;
    this.readoutD.textContent = `${dMm.toFixed(2)} mm`;
    this.readoutSpeed.textContent = `${speed} × 10⁸ m/s`;
    this.readoutIndex.textContent = this.refractiveIndex.toFixed(2);

    this.render();
  }

  render() {
    if (!this.ctx || this.width === 0) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Coordinate setups
    const entry = this.calcEntryPoint();
    const slabWidth = this.width * 0.76;
    const slabLeft = this.width * 0.12;
    // Map thickness mm (30 to 100) to pixels (90 to 220)
    const slabThicknessPx = 90 + ((this.thicknessMm - 30) / 70) * 130;
    const slabTop = entry.y;
    const slabBottom = slabTop + slabThicknessPx;

    // 1. Draw Lab Bench Grid Pattern
    this.drawBenchGrid(ctx);

    // 2. Draw Glass Slab Block
    this.drawGlassBlock(ctx, slabLeft, slabTop, slabWidth, slabThicknessPx);

    // 3. Optics calculations
    const radI = (this.angleI * Math.PI) / 180;
    const sinR = Math.sin(radI) / this.refractiveIndex;
    const radR = Math.asin(Math.max(-1, Math.min(1, sinR)));

    // Point of exit at bottom face
    // dx in slab = slabThicknessPx * tan(r)
    const dxInSlab = slabThicknessPx * Math.tan(radR);
    const exit = {
      x: entry.x + dxInSlab,
      y: slabBottom
    };

    const source = this.calcIncidentSourcePos();

    // Emergent ray direction is same as incident: dx/len = sin(i), dy/len = cos(i)
    const emergentLen = Math.min(this.width * 0.32, 200);
    const emergentEnd = {
      x: exit.x + emergentLen * Math.sin(radI),
      y: exit.y + emergentLen * Math.cos(radI)
    };

    // Undeviated ray continuation from entry point
    const totalDepth = slabThicknessPx + emergentLen;
    const undeviatedEnd = {
      x: entry.x + totalDepth * Math.sin(radI),
      y: entry.y + totalDepth * Math.cos(radI)
    };

    // 4. Draw Normal Lines
    if (this.showNormals) {
      this.drawNormals(ctx, entry, exit, 55);
    }

    // 5. Draw Protractor Overlay if enabled
    if (this.showProtractor) {
      this.drawProtractor(ctx, entry.x, entry.y);
    }

    // 6. Draw Undeviated Path
    if (this.showUndeviated && this.angleI > 0.5) {
      this.drawUndeviatedRay(ctx, entry, undeviatedEnd);
      this.drawLateralShiftBracket(ctx, exit, entry, radI);
    }

    // 7. Draw Rays & Angle Arcs
    this.drawLightPath(ctx, source, entry, exit, emergentEnd, radI, radR);

    // 8. Pins mode markings if active
    if (this.mode === 'pins') {
      this.drawPins(ctx, source, entry, exit, emergentEnd);
    }

    // 9. Laser Source Apparatus
    if (this.mode === 'laser') {
      this.drawLaserApparatus(ctx, source, entry);
    }

    // 10. Labels & Dimension callouts
    this.drawDimensionsAndLabels(ctx, slabLeft, slabTop, slabWidth, slabThicknessPx, entry, exit);
  }

  drawBenchGrid(ctx) {
    ctx.strokeStyle = '#DDEAF8';
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
  }

  drawGlassBlock(ctx, x, y, w, h) {
    // Glass slab background tint
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, 'rgba(186, 230, 253, 0.45)');
    grad.addColorStop(1, 'rgba(125, 211, 252, 0.30)');

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);

    // Slab border with beveled glass edge look
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Inner highlight reflection
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 2);
    ctx.lineTo(x + w - 2, y + 2);
    ctx.stroke();

    // Medium watermark text
    ctx.save();
    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(2, 132, 199, 0.5)';
    ctx.textAlign = 'right';
    ctx.fillText(`${this.mediumName.toUpperCase()} (n = ${this.refractiveIndex.toFixed(2)})`, x + w - 16, y + h - 14);
    ctx.restore();
  }

  drawNormals(ctx, entry, exit, len) {
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;

    // Normal at entry (N1 N1')
    ctx.beginPath();
    ctx.moveTo(entry.x, entry.y - len);
    ctx.lineTo(entry.x, entry.y + len);
    ctx.stroke();

    // Normal at exit (N2 N2')
    ctx.beginPath();
    ctx.moveTo(exit.x, exit.y - len);
    ctx.lineTo(exit.x, exit.y + len);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.fillText("N₁", entry.x, entry.y - len - 6);
    ctx.fillText("N₁'", entry.x, entry.y + len + 14);
    ctx.fillText("N₂", exit.x, exit.y - len - 6);
    ctx.fillText("N₂'", exit.x, exit.y + len + 14);
    ctx.restore();
  }

  drawProtractor(ctx, cx, cy) {
    ctx.save();
    const r = 85;
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.4)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;

    // Semi-circle above the entry point
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ticks
    for (let deg = 0; deg <= 180; deg += 10) {
      const rad = ((180 + deg) * Math.PI) / 180;
      const innerR = deg % 30 === 0 ? r - 12 : r - 6;
      ctx.beginPath();
      ctx.moveTo(cx + innerR * Math.cos(rad), cy + innerR * Math.sin(rad));
      ctx.lineTo(cx + r * Math.cos(rad), cy + r * Math.sin(rad));
      ctx.stroke();
    }
    ctx.restore();
  }

  drawUndeviatedRay(ctx, entry, end) {
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(entry.x, entry.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'left';
    ctx.fillText("Undeviated Path", end.x + 8, end.y + 4);
    ctx.restore();
  }

  drawLateralShiftBracket(ctx, exit, entry, radI) {
    // Compute perpendicular projection of exit onto undeviated ray line
    // Undeviated line goes from entry along unit vector: u = (sin(i), cos(i))
    const vx = exit.x - entry.x;
    const vy = exit.y - entry.y;
    const ux = Math.sin(radI);
    const uy = Math.cos(radI);
    const dot = vx * ux + vy * uy;
    const projX = entry.x + dot * ux;
    const projY = entry.y + dot * uy;

    ctx.save();
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 2;

    // Perpendicular line segment representing lateral displacement d
    ctx.beginPath();
    ctx.moveTo(exit.x, exit.y);
    ctx.lineTo(projX, projY);
    ctx.stroke();

    // Small right-angle symbol at projection
    const sqSize = 6;
    const perpX = (exit.x - projX);
    const perpY = (exit.y - projY);
    const pLen = Math.hypot(perpX, perpY);
    if (pLen > 10) {
      const px = (perpX / pLen) * sqSize;
      const py = (perpY / pLen) * sqSize;
      const qx = -ux * sqSize;
      const qy = -uy * sqSize;

      ctx.beginPath();
      ctx.moveTo(projX + px, projY + py);
      ctx.lineTo(projX + px + qx, projY + py + qy);
      ctx.lineTo(projX + qx, projY + qy);
      ctx.stroke();
    }

    // Displacement label 'd'
    const midX = (exit.x + projX) / 2;
    const midY = (exit.y + projY) / 2;
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.fillStyle = '#7C3AED';
    ctx.textAlign = 'right';
    ctx.fillText("Lateral Shift (d)", midX - 8, midY + 4);
    ctx.restore();
  }

  drawLightPath(ctx, source, entry, exit, emergentEnd, radI, radR) {
    ctx.save();
    const t = performance.now() * 0.001;

    // Helper for multi-layer laser beam
    const drawLaserSegment = (p1, p2, glowColor, coreColor, showPulse = true) => {
      // 1. Wide outer ambient halo
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // 2. Focused mid beam
      ctx.strokeStyle = glowColor.replace('0.18', '0.6').replace('0.2', '0.6');
      ctx.lineWidth = 4;
      ctx.stroke();

      // 3. Hot coherent white core
      ctx.strokeStyle = coreColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 4. Moving photon pulses along beam
      if (showPulse) {
        const segLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const numPulses = 3;
        for (let i = 0; i < numPulses; i++) {
          const frac = ((t * 1.5 + i / numPulses) % 1.0);
          const px = p1.x + (p2.x - p1.x) * frac;
          const py = p1.y + (p2.y - p1.y) * frac;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    // 1. Incident Ray (Red Laser 650 nm)
    drawLaserSegment(source, entry, 'rgba(239, 68, 68, 0.22)', '#FFFFFF');
    this.drawArrowhead(ctx, source, entry, 0.55, '#DC2626');

    // 2. Refracted Ray inside slab (Blue/Cyan in glass)
    drawLaserSegment(entry, exit, 'rgba(37, 99, 235, 0.25)', '#BAE6FD');
    this.drawArrowhead(ctx, entry, exit, 0.5, '#1D4ED8');

    // 3. Emergent Ray (Red Laser 650 nm)
    drawLaserSegment(exit, emergentEnd, 'rgba(239, 68, 68, 0.22)', '#FFFFFF');
    this.drawArrowhead(ctx, exit, emergentEnd, 0.5, '#DC2626');

    // 4. Sparkling Refraction Interface Hits (At entry and exit points)
    const drawSparklePing = (pt, color) => {
      ctx.save();
      ctx.translate(pt.x, pt.y);
      const pingPulse = (Math.sin(t * 8) * 0.5 + 0.5);

      // Radial glare glow
      const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, 12 + pingPulse * 6);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.4, color);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 14 + pingPulse * 6, 0, Math.PI * 2);
      ctx.fill();

      // 4 Star sparkle cross rays
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.2;
      const r = 8 + pingPulse * 5;
      ctx.beginPath();
      ctx.moveTo(-r, 0); ctx.lineTo(r, 0);
      ctx.moveTo(0, -r); ctx.lineTo(0, r);
      ctx.stroke();

      ctx.restore();
    };

    drawSparklePing(entry, '#EF4444');
    drawSparklePing(exit, '#38BDF8');

    // 5. Angle Arcs
    if (this.angleI > 4) {
      this.drawAngleArc(ctx, entry.x, entry.y, 40, -Math.PI / 2 - radI, -Math.PI / 2, `∠i = ${this.angleI.toFixed(1)}°`, '#DC2626');
      this.drawAngleArc(ctx, entry.x, entry.y, 42, Math.PI / 2 - radR, Math.PI / 2, `∠r = ${(radR * 180 / Math.PI).toFixed(1)}°`, '#2563EB', true);
      this.drawAngleArc(ctx, exit.x, exit.y, 40, Math.PI / 2 - radI, Math.PI / 2, `∠e = ${this.angleI.toFixed(1)}°`, '#DC2626', true);
    }

    ctx.restore();
  }

  drawArrowhead(ctx, from, to, t, color) {
    const px = from.x + (to.x - from.x) * t;
    const py = from.y + (to.y - from.y) * t;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const headLen = 9;

    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - headLen * Math.cos(angle - Math.PI / 6), py - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(px - headLen * Math.cos(angle + Math.PI / 6), py - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawAngleArc(ctx, cx, cy, radius, startAngle, endAngle, label, color, insideSlab = false) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle, false);
    ctx.stroke();

    const midAngle = (startAngle + endAngle) / 2;
    const lx = cx + (radius + 12) * Math.cos(midAngle);
    const ly = cy + (radius + 12) * Math.sin(midAngle);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(label, lx, ly + (insideSlab ? 12 : -4));
    ctx.restore();
  }

  drawLaserApparatus(ctx, source, entry) {
    const angle = Math.atan2(entry.y - source.y, entry.x - source.x);
    ctx.save();
    ctx.translate(source.x, source.y);
    ctx.rotate(angle);

    // Laser barrel housing
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-45, -12, 45, 24);

    // Brass emitter ring
    ctx.fillStyle = '#EAB308';
    ctx.fillRect(0, -9, 8, 18);

    // Laser diode LED status light
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.arc(-24, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    // Laser emitter glow dot
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(8, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draggable grab ring around laser
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-20, 0, 24, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  drawPins(ctx, source, entry, exit, emergentEnd) {
    // 2 pins on incident ray, 2 pins on emergent ray
    const p1 = { x: source.x + (entry.x - source.x) * 0.25, y: source.y + (entry.y - source.y) * 0.25 };
    const p2 = { x: source.x + (entry.x - source.x) * 0.75, y: source.y + (entry.y - source.y) * 0.75 };
    const p3 = { x: exit.x + (emergentEnd.x - exit.x) * 0.25, y: exit.y + (emergentEnd.y - exit.y) * 0.25 };
    const p4 = { x: exit.x + (emergentEnd.x - exit.x) * 0.75, y: exit.y + (emergentEnd.y - exit.y) * 0.75 };

    const drawSinglePin = (pt, label) => {
      ctx.save();
      // Pin head
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#991B1B';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pin needle center dot
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
      ctx.fill();

      // Pin label
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'left';
      ctx.fillText(label, pt.x + 9, pt.y + 4);
      ctx.restore();
    };

    drawSinglePin(p1, 'P₁');
    drawSinglePin(p2, 'P₂');
    drawSinglePin(p3, 'P₃');
    drawSinglePin(p4, 'P₄');
  }

  drawDimensionsAndLabels(ctx, x, y, w, h, entry, exit) {
    ctx.save();
    // Thickness dimension arrow on left side
    const dimX = x - 24;
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(dimX, y);
    ctx.lineTo(dimX, y + h);
    ctx.stroke();

    // Arrows
    ctx.beginPath();
    ctx.moveTo(dimX - 4, y + 6);
    ctx.lineTo(dimX, y);
    ctx.lineTo(dimX + 4, y + 6);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(dimX - 4, y + h - 6);
    ctx.lineTo(dimX, y + h);
    ctx.lineTo(dimX + 4, y + h - 6);
    ctx.stroke();

    // Dimension text
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'right';
    ctx.fillText(`t = ${this.thicknessMm} mm`, dimX - 8, y + h / 2 + 4);

    // Face Labels
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'left';
    ctx.fillText("Top Face (Air → Glass)", x + 16, y - 8);
    ctx.fillText("Bottom Face (Glass → Air)", x + 16, y + h + 18);

    ctx.restore();
  }
}

// Start simulation on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new GlassSlabSimulation();
});

