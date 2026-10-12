/**
 * PhotosynthesisLab — High-DPI Canvas 2D Renderer (LIGHT THEME)
 * Visualizes:
 * 1. Laboratory Bench Apparatus:
 *    - Movable lamp with radiant sunny YELLOW rays, directional ray dashes & photons
 *    - Glass water beaker with inverted funnel
 *    - Fresh Elodea densa aquatic sprig with cut stem
 *    - Inverted collection tube with rising buoyant bubbles and accumulating O₂ gas pocket
 *    - Optical bubble photogate sensor flashing on detection
 * 2. Ultra-Detailed Chloroplast & Thylakoid View:
 *    - Double envelope membrane (outer + inner) & stroma
 *    - Multiple Thylakoid Grana stacks & stroma lamellae frets
 *    - Photosystem II (PSII/P680) with water photolysis (2H₂O -> O₂ + 4H⁺ + 4e⁻)
 *    - Cytochrome b₆f, Photosystem I (PSI/P700), FNR -> NADPH
 *    - ATP Synthase rotary turbine synthesizing ATP from H⁺ gradient
 *    - Calvin-Benson Cycle in stroma (Fixation by Rubisco, Reduction, Regeneration -> Glucose)
 *    - Starch granules, plastoglobules, cpDNA, and incoming yellow photon packets
 * 3. Rich Kinetic Curves Mode:
 *    - 4 Interactive Curve Tabs: Distance (1/d²), Light Intensity, Temperature, CO₂ Conc
 *    - Shaded physiological zones (Light-limited, Saturation, Optimum, Denaturation)
 *    - Live pulsing operating point cursor & exact governing mathematical formulas
 */

class PhotosynthesisRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;

    this.width = 1000;
    this.height = 540;

    // Default view scale: 90% for clean spacious layout
    this.viewScale = 0.90;

    this.time = 0;
    this.lastFrameTime = performance.now();

    // Sensor flash state
    this.sensorFlashTimer = 0;

    // Graph history buffer
    this.historyPoints = [];
    this.historyTimer = 0;

    // Click handler for in-canvas interactive buttons (e.g. Graph Tabs)
    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
  }

  setZoom(scale) {
    this.viewScale = Math.max(0.65, Math.min(1.35, scale));
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

  handleCanvasClick(e) {
    const state = window.simState;
    if (state.mode !== 'graph') return;

    const rect = this.canvas.getBoundingClientRect();
    const rawPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    const pos = this.transformPointerPos(rawPos);

    // Graph tab bounds at Y ~ 55 to 80
    const cx = this.width / 2;
    const tabs = [
      { id: 'distance', label: '1. Distance (1/d²)', x: cx - 270, w: 125 },
      { id: 'intensity', label: '2. Light Intensity', x: cx - 135, w: 125 },
      { id: 'temp', label: '3. Temperature', x: cx, w: 125 },
      { id: 'nahco3', label: '4. CO₂ (NaHCO₃)', x: cx + 135, w: 125 }
    ];

    tabs.forEach(tab => {
      if (pos.x >= tab.x && pos.x <= tab.x + tab.w && pos.y >= 58 && pos.y <= 85) {
        state.setGraphTab(tab.id);
      }
    });
  }

  // =========================================================================
  // MAIN ANIMATION LOOP
  // =========================================================================
  render() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000.0);
    this.lastFrameTime = now;
    this.time += dt;

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // Update Dynamics (Bubble creation & motion, Stopwatch, Sensor)
    this.updateDynamics(dt);

    // Clean Bright Laboratory Background (Light Theme)
    this.drawLabBackground(ctx, w, h);

    // Apply View Zoom
    ctx.save();
    const cx = w / 2;
    const cy = h / 2;
    ctx.translate(cx, cy);
    ctx.scale(this.viewScale, this.viewScale);
    ctx.translate(-cx, -cy);

    const state = window.simState;

    if (state.mode === 'apparatus') {
      this.drawApparatusMode(ctx, w, h);
    } else if (state.mode === 'chloroplast') {
      this.drawChloroplastMode(ctx, w, h);
    } else if (state.mode === 'graph') {
      this.drawGraphMode(ctx, w, h);
    }

    ctx.restore();
  }

  // =========================================================================
  // DYNAMICS ENGINE (Bubbles, Buoyancy, Optical Photogate)
  // =========================================================================
  updateDynamics(dt) {
    const state = window.simState;
    if (state.isPaused) return;

    if (state.stopwatchRunning) {
      state.stopwatchSeconds += dt;
    }

    if (this.sensorFlashTimer > 0) {
      this.sensorFlashTimer = Math.max(0, this.sensorFlashTimer - dt * 4.5);
    }

    const metrics = PhotosynthesisBiophysics.calculateRate(state);
    const effectiveInterval = metrics.intervalSec;

    if (metrics.rateBPM > 0.05) {
      state.bubbleSpawnTimer += dt;
      if (state.bubbleSpawnTimer >= effectiveInterval) {
        state.bubbleSpawnTimer -= effectiveInterval;
        this.spawnBubble();
      }
    }

    const tubeTopY = 140;

    for (let i = state.bubbles.length - 1; i >= 0; i--) {
      const b = state.bubbles[i];
      b.y -= b.vy * dt;
      b.wobblePhase += b.wobbleSpeed * dt;
      b.currX = b.stemX + Math.sin(b.wobblePhase) * b.wobbleAmp;

      if (!b.sensed && b.y <= 275 && b.y >= 255) {
        b.sensed = true;
        this.sensorFlashTimer = 1.0;
        if (state.stopwatchRunning) {
          state.totalBubblesCounted++;
        }
        if (window.soundEngine) {
          window.soundEngine.playBubble();
        }
      }

      if (b.y <= tubeTopY) {
        state.accumulatedO2Volume = Math.min(15.0, state.accumulatedO2Volume + 0.04);
        state.bubbles.splice(i, 1);
      }
    }

    this.historyTimer += dt;
    if (this.historyTimer >= 0.5) {
      this.historyTimer = 0;
      this.historyPoints.push({
        time: state.stopwatchSeconds,
        bpm: metrics.rateBPM,
        distance: state.distanceCm
      });
      if (this.historyPoints.length > 50) this.historyPoints.shift();
    }
  }

  spawnBubble() {
    const state = window.simState;
    const stemX = 580;
    const stemY = 360;

    state.bubbles.push({
      stemX: stemX,
      currX: stemX,
      y: stemY,
      radius: 4.5 + Math.random() * 2.0,
      vy: 85 + Math.random() * 30,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: 7.0 + Math.random() * 4.0,
      wobbleAmp: 3.5,
      sensed: false
    });
  }

  // =========================================================================
  // LIGHT THEME LABORATORY BACKGROUND
  // =========================================================================
  drawLabBackground(ctx, w, h) {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#ffffff');
    bg.addColorStop(0.7, '#f8fafc');
    bg.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Benchtop division line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 440);
    ctx.lineTo(w, 440);
    ctx.stroke();

    // Lab bench wood grain base
    const benchGrad = ctx.createLinearGradient(0, 440, 0, h);
    benchGrad.addColorStop(0, '#e2e8f0');
    benchGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = benchGrad;
    ctx.fillRect(0, 440, w, h - 440);
  }

  // =========================================================================
  // 1. APPARATUS MODE (Classic Laboratory Bench Setup)
  // =========================================================================
  drawApparatusMode(ctx, w, h) {
    const state = window.simState;
    const metrics = PhotosynthesisBiophysics.calculateRate(state);

    const beakerCenterX = 580;
    const beakerBottomY = 440;
    const beakerW = 220;
    const beakerH = 260;

    const minLampX = 110;
    const maxLampX = 330;
    const lampX = minLampX + (1.0 - (state.distanceCm - 10) / 90.0) * (maxLampX - minLampX);
    const lampY = 320;

    // 1. Metric Ruler Bench Scale
    this.drawMetricRuler(ctx, lampX, beakerCenterX, 440, state.distanceCm);

    // 2. Movable Lamp with RADIANT YELLOW RAYS
    this.drawLaboratoryLamp(ctx, lampX, lampY, beakerCenterX, state.lampOn, metrics.filterInfo);

    // 3. Water Beaker & Liquid
    this.drawWaterBeaker(ctx, beakerCenterX, beakerBottomY, beakerW, beakerH, state.tempC, state.nahco3Percent);

    // 4. Submerged Fresh Elodea Sprig
    this.drawElodeaSprig(ctx, beakerCenterX, beakerBottomY - 40);

    // 5. Inverted Glass Funnel
    this.drawInvertedFunnel(ctx, beakerCenterX, beakerBottomY - 20);

    // 6. Inverted Gas Collection Tube & Oxygen Pocket
    this.drawGasCollectionTube(ctx, beakerCenterX, beakerBottomY - 140, state.accumulatedO2Volume);

    // 7. Optical Bubble Photogate Sensor
    this.drawBubblePhotogate(ctx, beakerCenterX, 268, this.sensorFlashTimer);

    // 8. Floating Oxygen Bubbles
    this.drawFloatingBubbles(ctx, state.bubbles);

    // 9. Floating Information Labels & Indicators
    this.drawApparatusLabels(ctx, lampX, beakerCenterX, metrics);
  }

  drawMetricRuler(ctx, lampX, beakerX, y, distCm) {
    ctx.save();
    const rulerY = y - 4;
    const startX = 80;
    const endX = beakerX - 110;

    ctx.fillStyle = '#fef08a';
    ctx.fillRect(startX, rulerY, endX - startX, 16);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(startX, rulerY, endX - startX, 16);

    ctx.strokeStyle = '#854d0e';
    ctx.fillStyle = '#713f12';
    ctx.font = '600 7.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    for (let x = startX; x <= endX; x += 12) {
      const isMajor = ((x - startX) % 36 === 0);
      const tickH = isMajor ? 10 : 5;
      ctx.beginPath();
      ctx.moveTo(x, rulerY);
      ctx.lineTo(x, rulerY + tickH);
      ctx.stroke();

      if (isMajor) {
        const cmVal = Math.round(100 - ((x - startX) / (endX - startX)) * 90);
        ctx.fillText(`${cmVal}`, x, rulerY + 14);
      }
    }

    ctx.strokeStyle = '#0284c7';
    ctx.fillStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(lampX + 30, rulerY - 12);
    ctx.lineTo(beakerX - 110, rulerY - 12);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`↔ Distance: ${distCm.toFixed(0)} cm`, (lampX + 30 + beakerX - 110) / 2, rulerY - 16);

    ctx.restore();
  }

  drawLaboratoryLamp(ctx, x, y, targetX, isOn, filterInfo) {
    ctx.save();

    // 1. Stand & Base
    ctx.fillStyle = '#475569';
    ctx.fillRect(x - 35, 430, 70, 10);
    ctx.fillRect(x - 5, y - 40, 10, 440 - (y - 40));

    // Clamp
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x - 8, y - 10, 26, 8);

    // Lamp Bell Housing
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(x + 12, y - 32);
    ctx.quadraticCurveTo(x + 40, y - 15, x + 50, y);
    ctx.quadraticCurveTo(x + 40, y + 15, x + 12, y + 32);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Light Bulb Glowing in VIBRANT SUNNY YELLOW / Selected Filter Hex
    const bulbColor = isOn ? (filterInfo.hex === '#f8fafc' ? '#facc15' : filterInfo.hex) : '#94a3b8';
    ctx.beginPath();
    ctx.arc(x + 32, y, 14, 0, Math.PI * 2);
    ctx.fillStyle = bulbColor;
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Optical Filter Glass Slot
    ctx.fillStyle = bulbColor;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.fillRect(x + 48, y - 26, 5, 52);
    ctx.strokeRect(x + 48, y - 26, 5, 52);

    // Filter Tag Label
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 8.5px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${filterInfo.wave}`, x + 50, y - 32);

    // =========================================================================
    // VIBRANT YELLOW LIGHT RAYS & DIRECTIONAL PHOTON STREAMS
    // =========================================================================
    if (isOn) {
      // 1. Broad Sunny Golden Light Cone
      const coneGrad = ctx.createLinearGradient(x + 50, y, targetX, y);
      const isYellowSetting = filterInfo.hex === '#facc15' || filterInfo.hex === '#f8fafc';
      const glowStart = isYellowSetting ? 'rgba(250, 204, 21, 0.42)' : filterInfo.glow;
      const glowMid = isYellowSetting ? 'rgba(250, 204, 21, 0.18)' : filterInfo.glow.replace('0.45', '0.18');

      coneGrad.addColorStop(0, glowStart);
      coneGrad.addColorStop(0.5, glowMid);
      coneGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(x + 53, y - 26);
      ctx.lineTo(targetX + 110, y - 140);
      ctx.lineTo(targetX + 110, y + 140);
      ctx.lineTo(x + 53, y + 26);
      ctx.closePath();
      ctx.fill();

      // 2. High-Visibility Directional Yellow Light Rays (Animated flowing dashes)
      const rayColor = isYellowSetting ? '#eab308' : (filterInfo.rayColor || '#eab308');
      ctx.strokeStyle = rayColor;
      ctx.lineWidth = 2.0;
      ctx.setLineDash([9, 7]);
      ctx.lineDashOffset = -this.time * 45; // animated photon wave traveling towards beaker!

      const offsets = [-20, -10, 0, 10, 20];
      offsets.forEach(offsetY => {
        ctx.beginPath();
        ctx.moveTo(x + 53, y + offsetY);
        ctx.lineTo(targetX + 70, y + offsetY * 5.2);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // 3. Sunny Photon Energy Sparkles (Small golden dots traveling towards beaker)
      ctx.fillStyle = isYellowSetting ? '#fef08a' : '#ffffff';
      for (let p = 0; p < 6; p++) {
        const progress = ((this.time * 1.2 + p * 0.18) % 1.0);
        const px = (x + 55) + progress * (targetX - x - 10);
        const py = y + (Math.sin(p * 2 + this.time * 3) * 22 * progress);
        ctx.beginPath();
        ctx.arc(px, py, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  drawWaterBeaker(ctx, cx, bottomY, w, h, tempC, nahco3) {
    ctx.save();
    const topY = bottomY - h;

    const liquidH = h * 0.88;
    const liquidY = bottomY - liquidH;

    const liqGrad = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
    liqGrad.addColorStop(0, 'rgba(224, 242, 254, 0.45)');
    liqGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.35)');
    liqGrad.addColorStop(1, 'rgba(224, 242, 254, 0.45)');

    ctx.fillStyle = liqGrad;
    ctx.fillRect(cx - w / 2, liquidY, w, liquidH);

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, liquidY, w / 2 - 2, 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - w / 2 - 8, topY);
    ctx.lineTo(cx - w / 2, topY + 8);
    ctx.lineTo(cx - w / 2, bottomY - 6);
    ctx.quadraticCurveTo(cx - w / 2, bottomY, cx - w / 2 + 10, bottomY);
    ctx.lineTo(cx + w / 2 - 10, bottomY);
    ctx.quadraticCurveTo(cx + w / 2, bottomY, cx + w / 2, bottomY - 6);
    ctx.lineTo(cx + w / 2, topY);
    ctx.stroke();

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.fillStyle = '#475569';
    ctx.font = '600 8.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    [bottomY - 50, bottomY - 110, bottomY - 170].forEach((gy, idx) => {
      ctx.beginPath();
      ctx.moveTo(cx + w / 2, gy);
      ctx.lineTo(cx + w / 2 - 16, gy);
      ctx.stroke();
      ctx.fillText(`${(idx + 1) * 200} mL`, cx + w / 2 - 20, gy + 3);
    });

    ctx.fillStyle = '#0369a1';
    ctx.font = '700 9px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Water Bath: ${tempC}°C | NaHCO₃: ${nahco3.toFixed(1)}%`, cx - w / 2 + 12, bottomY - 12);

    ctx.restore();
  }

  drawElodeaSprig(ctx, cx, y) {
    ctx.save();

    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(cx - 30, y);
    ctx.quadraticCurveTo(cx - 10, y - 45, cx, y - 75);
    ctx.stroke();

    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - 2, y - 73);
    ctx.lineTo(cx + 2, y - 77);
    ctx.stroke();

    const leafNodes = [
      { x: cx - 28, y: y - 5, angle: -0.6 },
      { x: cx - 22, y: y - 22, angle: 0.5 },
      { x: cx - 14, y: y - 40, angle: -0.7 },
      { x: cx - 6,  y: y - 56, angle: 0.6 },
      { x: cx - 1,  y: y - 70, angle: -0.4 }
    ];

    leafNodes.forEach(node => {
      [-0.7, 0, 0.7].forEach(offset => {
        const a = node.angle + offset;
        const leafLen = 22;
        const lx = node.x + Math.cos(a) * leafLen;
        const ly = node.y + Math.sin(a) * leafLen;

        ctx.fillStyle = '#16a34a';
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.quadraticCurveTo(node.x + Math.cos(a - 0.3) * (leafLen * 0.6), node.y + Math.sin(a - 0.3) * (leafLen * 0.6), lx, ly);
        ctx.quadraticCurveTo(node.x + Math.cos(a + 0.3) * (leafLen * 0.6), node.y + Math.sin(a + 0.3) * (leafLen * 0.6), node.x, node.y);
        ctx.fill();
        ctx.stroke();
      });
    });

    ctx.fillStyle = '#14532d';
    ctx.font = '700 9.5px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Fresh Elodea Sprig', cx - 90, y + 10);

    ctx.restore();
  }

  drawInvertedFunnel(ctx, cx, baseY) {
    ctx.save();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;

    const bellW = 160;
    const neckW = 20;
    const neckTopY = 240;
    const bellTopY = 320;

    ctx.beginPath();
    ctx.moveTo(cx - bellW / 2, baseY);
    ctx.lineTo(cx - neckW / 2, bellTopY);
    ctx.lineTo(cx - neckW / 2, neckTopY);
    ctx.lineTo(cx + neckW / 2, neckTopY);
    ctx.lineTo(cx + neckW / 2, bellTopY);
    ctx.lineTo(cx + bellW / 2, baseY);
    ctx.stroke();

    ctx.restore();
  }

  drawGasCollectionTube(ctx, cx, tubeBottomY, gasVol) {
    ctx.save();
    const tubeW = 28;
    const tubeH = 170;
    const tubeTopY = tubeBottomY - tubeH;

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(cx - tubeW / 2, tubeBottomY);
    ctx.lineTo(cx - tubeW / 2, tubeTopY + 10);
    ctx.arc(cx, tubeTopY + 10, tubeW / 2, Math.PI, 0, false);
    ctx.lineTo(cx + tubeW / 2, tubeBottomY);
    ctx.stroke();

    const maxPocketH = 80;
    const pocketH = Math.min(maxPocketH, gasVol * 5.2);
    const meniscusY = tubeTopY + 10 + pocketH;

    if (pocketH > 2) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - tubeW / 2 + 2, tubeTopY + 10, tubeW - 4, pocketH);

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, meniscusY, tubeW / 2 - 2, 4, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#0369a1';
      ctx.font = '700 8.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`O₂ Gas: ${gasVol.toFixed(2)} mL`, cx + tubeW / 2 + 8, meniscusY - 5);
    }

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    for (let y = tubeTopY + 20; y <= tubeBottomY - 10; y += 14) {
      ctx.beginPath();
      ctx.moveTo(cx + tubeW / 2, y);
      ctx.lineTo(cx + tubeW / 2 - 6, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawBubblePhotogate(ctx, cx, y, flash) {
    ctx.save();
    const sensorW = 44;
    const sensorH = 16;

    ctx.fillStyle = '#1e293b';
    this.roundRect(ctx, cx - sensorW / 2, y - sensorH / 2, sensorW, sensorH, 4);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = flash > 0.1 ? '#ef4444' : '#7f1d1d';
    ctx.beginPath();
    ctx.arc(cx - 16, y, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = flash > 0.1 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.3)';
    ctx.lineWidth = flash > 0.1 ? 2.5 : 1;
    ctx.beginPath();
    ctx.moveTo(cx - 16, y);
    ctx.lineTo(cx + 16, y);
    ctx.stroke();

    if (flash > 0.1) {
      ctx.strokeStyle = `rgba(34, 197, 94, ${flash})`;
      ctx.lineWidth = 3;
      this.roundRect(ctx, cx - sensorW / 2 - 2, y - sensorH / 2 - 2, sensorW + 4, sensorH + 4, 6);
      ctx.stroke();
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 8.5px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Optical Bubble Photogate', cx + sensorW / 2 + 8, y + 3);

    ctx.restore();
  }

  drawFloatingBubbles(ctx, bubbles) {
    ctx.save();

    bubbles.forEach(b => {
      const grad = ctx.createRadialGradient(b.currX - 1.5, b.y - 1.5, 1, b.currX, b.y, b.radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#bae6fd');
      grad.addColorStop(1, 'rgba(2, 132, 199, 0.7)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.currX, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(b.currX - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.28, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  drawApparatusLabels(ctx, lampX, beakerX, metrics) {
    ctx.save();
    const tagX = beakerX;
    const tagY = 70;

    ctx.fillStyle = '#f8fafc';
    this.roundRect(ctx, tagX - 140, tagY - 16, 280, 28, 6);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#0369a1';
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Limiting Factor: ${metrics.limitingFactor}`, tagX, tagY + 2);

    ctx.restore();
  }

  // =========================================================================
  // 2. ULTRA-DETAILED CHLOROPLAST MOLECULAR VIEW
  // =========================================================================
  drawChloroplastMode(ctx, w, h) {
    const cx = w / 2;
    const cy = h / 2;

    ctx.save();

    // 1. Chloroplast Double Membrane Envelope (Outer + Inner + Intermembrane Space)
    const chloroW = 680;
    const chloroH = 370;

    // Outer Membrane (Dark green outer boundary)
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 6;
    ctx.fillStyle = '#dcfce7'; // Stroma base color
    this.roundRect(ctx, cx - chloroW / 2, cy - chloroH / 2, chloroW, chloroH, 40);
    ctx.fill();
    ctx.stroke();

    // Intermembrane Space gap & Inner Membrane
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    this.roundRect(ctx, cx - chloroW / 2 + 8, cy - chloroH / 2 + 8, chloroW - 16, chloroH - 16, 34);
    ctx.stroke();

    // Banner Title
    ctx.fillStyle = '#14532d';
    ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Chloroplast Ultrastructure & Macromolecular Photosynthetic Machinery', cx, cy - chloroH / 2 + 28);
    ctx.font = '600 9.5px "JetBrains Mono", monospace';
    ctx.fillStyle = '#15803d';
    ctx.fillText('Double Envelope Membrane | Aqueous Stroma | Thylakoid Lumen', cx, cy - chloroH / 2 + 42);

    // =========================================================================
    // LEFT HALF: THYLAKOID MEMBRANE & ELECTRON TRANSPORT CHAIN
    // =========================================================================
    const granaCenter = cx - 160;

    // Multiple Thylakoid Grana Stacks connected by Stroma Lamellae Frets
    // Grana 1, 2, 3
    [-80, 0, 80].forEach((gxOffset, sIdx) => {
      const gx = granaCenter + gxOffset * 0.85;
      const stackCount = 4;
      for (let i = 0; i < stackCount; i++) {
        const ty = cy - 40 + i * 20;
        // Thylakoid Disc
        ctx.fillStyle = '#15803d';
        this.roundRect(ctx, gx - 38, ty, 76, 15, 4);
        ctx.fill();
        ctx.strokeStyle = '#86efac';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 8.5px "JetBrains Mono", monospace';
      ctx.fillText(`Granum ${sIdx + 1}`, gx, cy + 48);
    });

    // Connecting Stroma Lamellae (Frets)
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(granaCenter - 65, cy - 20);
    ctx.lineTo(granaCenter + 65, cy - 20);
    ctx.moveTo(granaCenter - 65, cy + 10);
    ctx.lineTo(granaCenter + 65, cy + 10);
    ctx.stroke();

    // Detailed Thylakoid Membrane Complex Box (Zoomed Inset Panel)
    const insetX = cx - 210;
    const insetY = cy + 70;
    const insetW = 280;
    const insetH = 95;

    ctx.fillStyle = '#ffffff';
    this.roundRect(ctx, insetX - insetW / 2, insetY, insetW, insetH, 8);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Complex 1: Photosystem II (PSII / P680) + Water Splitting OEC
    ctx.fillStyle = '#059669';
    this.roundRect(ctx, insetX - 120, insetY + 28, 48, 38, 5);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 8px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PS II', insetX - 96, insetY + 44);
    ctx.fillText('(P680)', insetX - 96, insetY + 56);

    // Water Photolysis Arrow & Equation
    ctx.fillStyle = '#0284c7';
    ctx.font = '700 8px "JetBrains Mono", monospace';
    ctx.fillText('2H₂O → O₂↑ + 4H⁺', insetX - 96, insetY + 80);

    // Electron Flow Arrow
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.moveTo(insetX - 70, insetY + 48);
    ctx.lineTo(insetX - 25, insetY + 48);
    ctx.stroke();
    ctx.setLineDash([]);

    // Complex 2: Cytochrome b6f & PS I (P700)
    ctx.fillStyle = '#7c3aed';
    this.roundRect(ctx, insetX - 25, insetY + 28, 48, 38, 5);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('PS I', insetX - 1, insetY + 44);
    ctx.fillText('NADP⁺→', insetX - 1, insetY + 56);
    ctx.fillStyle = '#6d28d9';
    ctx.fillText('NADPH', insetX - 1, insetY + 80);

    // Complex 3: Rotary ATP Synthase
    ctx.fillStyle = '#d97706';
    this.roundRect(ctx, insetX + 70, insetY + 20, 48, 50, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('ATP', insetX + 94, insetY + 40);
    ctx.fillText('Synthase', insetX + 94, insetY + 52);
    ctx.fillStyle = '#b45309';
    ctx.fillText('ADP → ATP', insetX + 94, insetY + 80);

    // Incoming Light Photons (hν) striking PSII / PSI
    const isUV = state.filterColor === 'uv';
    const photonColor = isUV ? '#7c3aed' : (PhotosynthesisBiophysics.COLOR_FACTORS[state.filterColor]?.rayColor || '#eab308');
    ctx.strokeStyle = photonColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -this.time * 25;
    ctx.beginPath();
    ctx.moveTo(granaCenter - 80, cy - 130);
    ctx.lineTo(granaCenter - 50, cy - 60);
    ctx.moveTo(granaCenter, cy - 130);
    ctx.lineTo(granaCenter + 20, cy - 60);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = photonColor;
    ctx.font = '800 10px "JetBrains Mono", monospace';
    ctx.fillText(isUV ? '⚡ High-Energy UV Photons (350nm)' : '☀️ Photons (hν)', granaCenter - 25, cy - 135);

    if (isUV) {
      ctx.fillStyle = '#7e22ce';
      ctx.font = '700 8.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('⚠️ Low PAR Absorption & PSII Photoinhibition', granaCenter - 25, cy - 120);
    }

    // =========================================================================
    // RIGHT HALF: CALVIN-BENSON CYCLE IN STROMA (Dark Phase)
    // =========================================================================
    const calvinX = cx + 170;
    const calvinY = cy;

    // Orbit Ring
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(calvinX, calvinY, 75, 0, Math.PI * 2);
    ctx.stroke();

    // Calvin Cycle Rotating Nodes
    const phases = [
      { label: '1. Carbon Fixation (Rubisco)', sub: 'CO₂ + RuBP → 3-PGA', angle: -Math.PI / 2, color: '#047857' },
      { label: '2. Reduction Phase', sub: 'Uses ATP & NADPH', angle: Math.PI / 6, color: '#0284c7' },
      { label: '3. RuBP Regeneration', sub: 'Glucose (C₆H₁₂O₆) Output', angle: (5 * Math.PI) / 6, color: '#d97706' }
    ];

    phases.forEach(p => {
      const px = calvinX + Math.cos(p.angle) * 75;
      const py = calvinY + Math.sin(p.angle) * 75;

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Calvin Center Text
    ctx.fillStyle = '#9a3412';
    ctx.font = '800 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Calvin-Benson', calvinX, calvinY - 14);
    ctx.fillText('Cycle (Stroma)', calvinX, calvinY);
    ctx.font = '600 8.5px "JetBrains Mono", monospace';
    ctx.fillStyle = '#475569';
    ctx.fillText('Rubisco Catalyzed', calvinX, calvinY + 16);

    // Phase Callout Boxes
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 9px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('CO₂ Input (from NaHCO₃)', calvinX, calvinY - 95);
    ctx.fillStyle = '#16a34a';
    ctx.fillText('Glucose & Starch Synthesis ↓', calvinX, calvinY + 100);

    // Starch Granule & Lipid Plastoglobule Storage
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(cx + 280, cy - 60, 30, 18, Math.PI / 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#854d0e';
    ctx.font = '700 8px "JetBrains Mono", monospace';
    ctx.fillText('Starch Granule', cx + 280, cy - 58);

    // Lipid Plastoglobules
    [cy + 40, cy + 65].forEach(py => {
      ctx.beginPath();
      ctx.arc(cx + 295, py, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#fdba74';
      ctx.fill();
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    ctx.fillStyle = '#9a3412';
    ctx.fillText('Plastoglobules', cx + 295, cy + 85);

    ctx.restore();
  }

  // =========================================================================
  // 3. RICH KINETIC CURVES MODE (4 Interactive Tabs & Limiting Factors)
  // =========================================================================
  drawGraphMode(ctx, w, h) {
    const state = window.simState;
    const cx = w / 2;
    const cy = h / 2;
    const graphW = 720;
    const graphH = 370;
    const gx = cx - graphW / 2;
    const gy = cy - graphH / 2;

    ctx.save();

    // White Graph Board
    ctx.fillStyle = '#ffffff';
    this.roundRect(ctx, gx, gy, graphW, graphH, 14);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // =========================================================================
    // 4 INTERACTIVE CURVE TABS AT TOP OF GRAPH
    // =========================================================================
    const tabs = [
      { id: 'distance', label: '1. Distance (1/d²)', x: cx - 270, w: 125 },
      { id: 'intensity', label: '2. Light Intensity', x: cx - 135, w: 125 },
      { id: 'temp', label: '3. Temperature', x: cx, w: 125 },
      { id: 'nahco3', label: '4. CO₂ (NaHCO₃)', x: cx + 135, w: 125 }
    ];

    const activeTab = state.activeGraphTab || 'distance';

    tabs.forEach(tab => {
      const isActive = tab.id === activeTab;
      ctx.fillStyle = isActive ? '#ecfdf5' : '#f8fafc';
      this.roundRect(ctx, tab.x, gy + 14, tab.w, 26, 6);
      ctx.fill();
      ctx.strokeStyle = isActive ? '#059669' : '#e2e8f0';
      ctx.lineWidth = isActive ? 1.8 : 1;
      ctx.stroke();

      ctx.fillStyle = isActive ? '#065f46' : '#475569';
      ctx.font = isActive ? '700 9.5px "Plus Jakarta Sans", sans-serif' : '600 9px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tab.label, tab.x + tab.w / 2, gy + 31);
    });

    // Plot Dimensions
    const plotX = gx + 65;
    const plotY = gy + 65;
    const plotW = graphW - 100;
    const plotH = graphH - 125;

    // Draw Axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(plotX, plotY);
    ctx.lineTo(plotX, plotY + plotH);
    ctx.lineTo(plotX + plotW, plotY + plotH);
    ctx.stroke();

    // Y-Axis Grid & Labels (0, 15, 30, 45, 60 BPM)
    ctx.fillStyle = '#475569';
    ctx.font = '600 8.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    for (let bpm = 0; bpm <= 60; bpm += 15) {
      const py = plotY + plotH - (bpm / 60.0) * plotH;
      ctx.fillText(`${bpm}`, plotX - 8, py + 3);

      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(plotX, py);
      ctx.lineTo(plotX + plotW, py);
      ctx.stroke();
    }
    ctx.fillText('BPM', plotX - 8, plotY - 6);

    // =========================================================================
    // CURVE-SPECIFIC RENDERING
    // =========================================================================
    const currentMetrics = PhotosynthesisBiophysics.calculateRate(state);

    if (activeTab === 'distance') {
      // 1. RATE VS DISTANCE (Inverse-Square Law)
      this.drawDistanceCurve(ctx, plotX, plotY, plotW, plotH, state, currentMetrics);
    } else if (activeTab === 'intensity') {
      // 2. RATE VS LIGHT INTENSITY (Michaelis-Menten Saturation)
      this.drawIntensityCurve(ctx, plotX, plotY, plotW, plotH, state, currentMetrics);
    } else if (activeTab === 'temp') {
      // 3. RATE VS TEMPERATURE (Enzyme Kinetics & Thermal Denaturation)
      this.drawTemperatureCurve(ctx, plotX, plotY, plotW, plotH, state, currentMetrics);
    } else if (activeTab === 'nahco3') {
      // 4. RATE VS CO2 CONCENTRATION (Substrate Saturation)
      this.drawCO2Curve(ctx, plotX, plotY, plotW, plotH, state, currentMetrics);
    }

    ctx.restore();
  }

  drawDistanceCurve(ctx, plotX, plotY, plotW, plotH, state, currentMetrics) {
    // X-Axis Ticks (10cm to 100cm)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    ctx.font = '600 8.5px "JetBrains Mono", monospace';
    for (let d = 10; d <= 100; d += 15) {
      const px = plotX + ((d - 10) / 90.0) * plotW;
      ctx.fillText(`${d}cm`, px, plotY + plotH + 16);
    }
    ctx.fillText('Lamp Distance (cm) — Inverse Square Law (I ∝ 1/d²)', plotX + plotW / 2, plotY + plotH + 34);

    // Curve Formula Tag
    this.drawFormulaTag(ctx, plotX + plotW - 140, plotY + 16, 'I = I₀ / (d / d₀)²', '#0284c7');

    // Theoretical 1/d² Curve
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let d = 10; d <= 100; d += 1) {
      const m = PhotosynthesisBiophysics.calculateRate({
        distanceCm: d,
        lampOn: state.lampOn,
        filterColor: state.filterColor,
        nahco3Percent: state.nahco3Percent,
        tempC: state.tempC
      });
      const px = plotX + ((d - 10) / 90.0) * plotW;
      const py = plotY + plotH - (m.rateBPM / 60.0) * plotH;
      if (d === 10) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Active Operating Point
    const currPx = plotX + ((state.distanceCm - 10) / 90.0) * plotW;
    const currPy = plotY + plotH - (currentMetrics.rateBPM / 60.0) * plotH;
    this.drawOperatingPoint(ctx, currPx, currPy, `${currentMetrics.rateBPM.toFixed(1)} BPM @ ${state.distanceCm}cm`);
  }

  drawIntensityCurve(ctx, plotX, plotY, plotW, plotH, state, currentMetrics) {
    // X-Axis Ticks (0% to 100% Intensity)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    ctx.font = '600 8.5px "JetBrains Mono", monospace';
    for (let i = 0; i <= 100; i += 20) {
      const px = plotX + (i / 100.0) * plotW;
      ctx.fillText(`${i}%`, px, plotY + plotH + 16);
    }
    ctx.fillText('Light Intensity (%) — Light-Limiting Slope vs. Saturation Plateau', plotX + plotW / 2, plotY + plotH + 34);

    // Shaded Saturation Region (Intensity > 60%)
    ctx.fillStyle = 'rgba(234, 179, 8, 0.08)';
    ctx.fillRect(plotX + 0.6 * plotW, plotY, 0.4 * plotW, plotH);
    ctx.fillStyle = '#ca8a04';
    ctx.font = '700 8px "JetBrains Mono", monospace';
    ctx.fillText('LIGHT SATURATED PLATEAU', plotX + 0.8 * plotW, plotY + 20);

    // Formula Tag
    this.drawFormulaTag(ctx, plotX + plotW - 140, plotY + 16, 'Rate = R_max · [I / (I + K_I)]', '#d97706');

    // Saturation Curve
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 100; i += 1) {
      const fLight = PhotosynthesisBiophysics.getLightSaturationFactor(i);
      const colorObj = PhotosynthesisBiophysics.COLOR_FACTORS[state.filterColor] || PhotosynthesisBiophysics.COLOR_FACTORS.white;
      const fColor = colorObj.factor;
      const fCO2 = PhotosynthesisBiophysics.getCarbonDioxideFactor(state.nahco3Percent);
      const fTemp = PhotosynthesisBiophysics.getTemperatureFactor(state.tempC);
      const bpm = 64.0 * fLight * fColor * fCO2 * fTemp;

      const px = plotX + (i / 100.0) * plotW;
      const py = plotY + plotH - (bpm / 60.0) * plotH;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Active Operating Point
    const currPx = plotX + (currentMetrics.intensity / 100.0) * plotW;
    const currPy = plotY + plotH - (currentMetrics.rateBPM / 60.0) * plotH;
    this.drawOperatingPoint(ctx, currPx, currPy, `${currentMetrics.rateBPM.toFixed(1)} BPM @ ${currentMetrics.intensity.toFixed(0)}% Light`);
  }

  drawTemperatureCurve(ctx, plotX, plotY, plotW, plotH, state, currentMetrics) {
    // X-Axis Ticks (5°C to 50°C)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    ctx.font = '600 8.5px "JetBrains Mono", monospace';
    for (let t = 5; t <= 50; t += 5) {
      const px = plotX + ((t - 5) / 45.0) * plotW;
      ctx.fillText(`${t}°C`, px, plotY + plotH + 16);
    }
    ctx.fillText('Temperature (°C) — Optimum Window (~28°C) vs. Thermal Denaturation (>40°C)', plotX + plotW / 2, plotY + plotH + 34);

    // Shaded Thermal Denaturation Region (> 40°C)
    const denatureX = plotX + ((40 - 5) / 45.0) * plotW;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
    ctx.fillRect(denatureX, plotY, plotX + plotW - denatureX, plotH);
    ctx.fillStyle = '#dc2626';
    ctx.font = '700 8px "JetBrains Mono", monospace';
    ctx.fillText('THERMAL DENATURATION', denatureX + (plotX + plotW - denatureX) / 2, plotY + 20);

    // Formula Tag
    this.drawFormulaTag(ctx, plotX + plotW - 140, plotY + 16, 'Enzyme Kinetics (Q10 = 2)', '#16a34a');

    // Bell Curve with Rapid Denaturation drop
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let t = 5; t <= 50; t += 0.5) {
      const m = PhotosynthesisBiophysics.calculateRate({
        distanceCm: state.distanceCm,
        lampOn: state.lampOn,
        filterColor: state.filterColor,
        nahco3Percent: state.nahco3Percent,
        tempC: t
      });
      const px = plotX + ((t - 5) / 45.0) * plotW;
      const py = plotY + plotH - (m.rateBPM / 60.0) * plotH;
      if (t === 5) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Active Operating Point
    const currPx = plotX + ((state.tempC - 5) / 45.0) * plotW;
    const currPy = plotY + plotH - (currentMetrics.rateBPM / 60.0) * plotH;
    this.drawOperatingPoint(ctx, currPx, currPy, `${currentMetrics.rateBPM.toFixed(1)} BPM @ ${state.tempC}°C`);
  }

  drawCO2Curve(ctx, plotX, plotY, plotW, plotH, state, currentMetrics) {
    // X-Axis Ticks (0% to 2% NaHCO3)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    ctx.font = '600 8.5px "JetBrains Mono", monospace';
    for (let c = 0.0; c <= 2.0; c += 0.5) {
      const px = plotX + (c / 2.0) * plotW;
      ctx.fillText(`${c.toFixed(1)}%`, px, plotY + plotH + 16);
    }
    ctx.fillText('Dissolved NaHCO₃ Concentration (%) — Carbon Dioxide Saturation Kinetics', plotX + plotW / 2, plotY + plotH + 34);

    // Formula Tag
    this.drawFormulaTag(ctx, plotX + plotW - 140, plotY + 16, 'f(CO₂) = [C] / ([C] + K_m)', '#7c3aed');

    // Hyperbolic Saturation Curve
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let c = 0.0; c <= 2.0; c += 0.05) {
      const m = PhotosynthesisBiophysics.calculateRate({
        distanceCm: state.distanceCm,
        lampOn: state.lampOn,
        filterColor: state.filterColor,
        nahco3Percent: c,
        tempC: state.tempC
      });
      const px = plotX + (c / 2.0) * plotW;
      const py = plotY + plotH - (m.rateBPM / 60.0) * plotH;
      if (c === 0.0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Active Operating Point
    const currPx = plotX + (state.nahco3Percent / 2.0) * plotW;
    const currPy = plotY + plotH - (currentMetrics.rateBPM / 60.0) * plotH;
    this.drawOperatingPoint(ctx, currPx, currPy, `${currentMetrics.rateBPM.toFixed(1)} BPM @ ${state.nahco3Percent.toFixed(1)}% NaHCO₃`);
  }

  drawFormulaTag(ctx, x, y, formula, color) {
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    this.roundRect(ctx, x, y, 130, 20, 4);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = '700 8.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(formula, x + 65, y + 13);
    ctx.restore();
  }

  drawOperatingPoint(ctx, px, py, label) {
    ctx.save();
    // Pulsing halo
    const pulse = 1.0 + Math.sin(this.time * 6) * 0.25;
    ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
    ctx.beginPath();
    ctx.arc(px, py, 11 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Center Dot
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Callout Tag
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 9.5px "JetBrains Mono", monospace';
    ctx.textAlign = px > 500 ? 'right' : 'left';
    const tagX = px > 500 ? px - 12 : px + 12;
    ctx.fillText(label, tagX, py - 6);
    ctx.restore();
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

window.PhotosynthesisRenderer = PhotosynthesisRenderer;
