/**
 * Single-Slit Fraunhofer Diffraction Virtual Laboratory
 * Strict Zero-Dependency Vanilla Web Standard & Simulation Guidelines
 */

class DiffractionSimulation {
  constructor() {
    this.canvas = document.getElementById('simCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Physical Parameters
    this.wavelength = 650; // nm
    this.slitWidth = 0.10; // mm (a)
    this.screenDistance = 1.50; // m (D)

    // Interactive Probe
    this.probeY = 0.0; // mm from central axis
    this.isDraggingProbe = false;
    this.soundEnabled = true;

    // Audio Context
    this.audioCtx = null;
    this.probeOsc = null;
    this.probeGain = null;

    this.initDOM();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.attachEvents();
    this.startLoop();
  }

  initDOM() {
    this.sliderWavelength = document.getElementById('sliderWavelength');
    this.sliderSlitWidth = document.getElementById('sliderSlitWidth');
    this.sliderScreenDistance = document.getElementById('sliderScreenDistance');

    this.valWavelength = document.getElementById('valWavelength');
    this.valSlitWidth = document.getElementById('valSlitWidth');
    this.valScreenDistance = document.getElementById('valScreenDistance');

    this.teleCentralWidth = document.getElementById('teleCentralWidth');
    this.teleAngularHalfWidth = document.getElementById('teleAngularHalfWidth');
    this.teleProbePos = document.getElementById('teleProbePos');
    this.teleIntensity = document.getElementById('teleIntensity');

    this.btnAudioToggle = document.getElementById('btnAudioToggle');
    this.btnResetAll = document.getElementById('btnResetAll');
    this.btnOpenTheory = document.getElementById('btnOpenTheory');
    this.btnCloseTheory = document.getElementById('btnCloseTheory');
    this.modalTheory = document.getElementById('modalTheory');

    this.colorPills = document.querySelectorAll('.pill-btn[data-wavelength]');
  }

  initAudio() {
    if (this.audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();

      this.probeOsc = this.audioCtx.createOscillator();
      this.probeGain = this.audioCtx.createGain();

      this.probeOsc.type = 'sine';
      this.probeOsc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      this.probeGain.gain.setValueAtTime(0, this.audioCtx.currentTime);

      this.probeOsc.connect(this.probeGain);
      this.probeGain.connect(this.audioCtx.destination);
      this.probeOsc.start();
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  updateProbeAudio(intensity) {
    if (!this.soundEnabled || !this.audioCtx || !this.probeGain) return;
    try {
      const freq = 220 + intensity * 600;
      this.probeOsc.frequency.setTargetAtTime(freq, this.audioCtx.currentTime, 0.02);
      const targetGain = this.isDraggingProbe ? Math.max(0.01, intensity * 0.10) : 0;
      this.probeGain.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, 0.02);
    } catch (e) {}
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  attachEvents() {
    this.sliderWavelength.addEventListener('input', (e) => {
      this.initAudio();
      this.wavelength = parseFloat(e.target.value);
      this.valWavelength.textContent = `${this.wavelength} nm`;
      this.updateActivePresetPill();
      this.updateTelemetry();
    });

    this.sliderSlitWidth.addEventListener('input', (e) => {
      this.initAudio();
      this.slitWidth = parseFloat(e.target.value);
      this.valSlitWidth.textContent = `${this.slitWidth.toFixed(2)} mm`;
      this.updateTelemetry();
    });

    this.sliderScreenDistance.addEventListener('input', (e) => {
      this.initAudio();
      this.screenDistance = parseFloat(e.target.value);
      this.valScreenDistance.textContent = `${this.screenDistance.toFixed(2)} m`;
      this.updateTelemetry();
    });

    this.colorPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.initAudio();
        this.wavelength = parseFloat(pill.getAttribute('data-wavelength'));
        this.sliderWavelength.value = this.wavelength;
        this.valWavelength.textContent = `${this.wavelength} nm`;
        this.updateActivePresetPill();
        this.updateTelemetry();
      });
    });

    this.btnAudioToggle.addEventListener('click', () => {
      this.initAudio();
      this.soundEnabled = !this.soundEnabled;
      this.btnAudioToggle.textContent = this.soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
      if (!this.soundEnabled && this.probeGain) {
        this.probeGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      }
    });

    this.btnResetAll.addEventListener('click', () => {
      this.resetAll();
    });

    this.btnOpenTheory.addEventListener('click', () => {
      this.modalTheory.classList.add('open');
    });

    this.btnCloseTheory.addEventListener('click', () => {
      this.modalTheory.classList.remove('open');
    });

    this.modalTheory.addEventListener('click', (e) => {
      if (e.target === this.modalTheory) {
        this.modalTheory.classList.remove('open');
      }
    });

    // Pointer events for photometer sensor
    const handlePointerDown = (evt) => {
      this.initAudio();
      const rect = this.canvas.getBoundingClientRect();
      const mx = (evt.clientX || (evt.touches && evt.touches[0].clientX)) - rect.left;
      const my = (evt.clientY || (evt.touches && evt.touches[0].clientY)) - rect.top;

      const screenX = this.width * 0.82;
      const screenH = this.height * 0.76;
      const screenCenterY = this.height * 0.5;

      if (Math.abs(mx - screenX) < 45 || mx > screenX - 20) {
        this.isDraggingProbe = true;
        const mmScale = 30; // 30 mm span across half screen
        const dyPx = my - screenCenterY;
        this.probeY = (dyPx / (screenH * 0.5)) * mmScale;
        this.updateTelemetry();
      }
    };

    const handlePointerMove = (evt) => {
      if (!this.isDraggingProbe) return;
      const rect = this.canvas.getBoundingClientRect();
      const my = (evt.clientY || (evt.touches && evt.touches[0].clientY)) - rect.top;
      const screenH = this.height * 0.76;
      const screenCenterY = this.height * 0.5;
      const mmScale = 30;
      const dyPx = my - screenCenterY;
      this.probeY = Math.max(-30, Math.min(30, (dyPx / (screenH * 0.5)) * mmScale));
      this.updateTelemetry();
    };

    const handlePointerUp = () => {
      this.isDraggingProbe = false;
      if (this.probeGain && this.audioCtx) {
        this.probeGain.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.05);
      }
    };

    this.canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    this.canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    this.updateTelemetry();
  }

  updateActivePresetPill() {
    this.colorPills.forEach(p => {
      const wl = parseFloat(p.getAttribute('data-wavelength'));
      p.classList.toggle('active', Math.abs(wl - this.wavelength) < 10);
    });
  }

  resetAll() {
    this.wavelength = 650;
    this.slitWidth = 0.10;
    this.screenDistance = 1.50;
    this.probeY = 0.0;

    this.sliderWavelength.value = 650;
    this.sliderSlitWidth.value = 0.10;
    this.sliderScreenDistance.value = 1.50;

    this.valWavelength.textContent = '650 nm';
    this.valSlitWidth.textContent = '0.10 mm';
    this.valScreenDistance.textContent = '1.50 m';

    this.updateActivePresetPill();
    this.updateTelemetry();
  }

  getIntensityAt(y_mm) {
    const y_m = y_mm * 1e-3;
    const a_m = this.slitWidth * 1e-3;
    const D_m = this.screenDistance;
    const lambda_m = this.wavelength * 1e-9;

    const sinTheta = y_m / Math.sqrt(y_m * y_m + D_m * D_m);
    const beta = (Math.PI * a_m * sinTheta) / lambda_m;

    if (Math.abs(beta) < 1e-5) return 1.0;
    return Math.pow(Math.sin(beta) / beta, 2);
  }

  updateTelemetry() {
    const a_m = this.slitWidth * 1e-3;
    const D_m = this.screenDistance;
    const lambda_m = this.wavelength * 1e-9;

    // Central Fringe Width W0 = 2 * lambda * D / a
    const w0_mm = ((2.0 * lambda_m * D_m) / a_m) * 1e3;
    // Angular Half Width theta0 = lambda / a (mrad)
    const theta0_mrad = (lambda_m / a_m) * 1e3;

    const intensity = this.getIntensityAt(this.probeY);

    this.teleCentralWidth.textContent = `${w0_mm.toFixed(2)} mm`;
    this.teleAngularHalfWidth.textContent = `${theta0_mrad.toFixed(2)} mrad`;
    this.teleProbePos.textContent = `${this.probeY >= 0 ? '+' : ''}${this.probeY.toFixed(2)} mm`;
    this.teleIntensity.textContent = `${(intensity * 100).toFixed(1)}% (I/I₀)`;

    this.updateProbeAudio(intensity);
  }

  wavelengthToColor(wl, alpha = 1) {
    let r = 0, g = 0, b = 0;
    if (wl >= 380 && wl < 440) {
      r = -(wl - 440) / (440 - 380);
      b = 1.0;
    } else if (wl >= 440 && wl < 490) {
      g = (wl - 440) / (490 - 440);
      b = 1.0;
    } else if (wl >= 490 && wl < 510) {
      g = 1.0;
      b = -(wl - 510) / (510 - 490);
    } else if (wl >= 510 && wl < 580) {
      r = (wl - 510) / (580 - 510);
      g = 1.0;
    } else if (wl >= 580 && wl < 645) {
      r = 1.0;
      g = -(wl - 645) / (645 - 580);
    } else if (wl >= 645 && wl <= 780) {
      r = 1.0;
    } else {
      r = 0.9; g = 0.9; b = 0.9;
    }
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
  }

  startLoop() {
    const render = () => {
      this.draw();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  draw() {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    // Grid
    this.drawBackgroundGrid();

    const laserX = width * 0.08;
    const laserY = height * 0.5;

    const slitX = width * 0.35;
    const slitH_px = Math.max(10, (this.slitWidth / 0.30) * 45);

    const screenX = width * 0.82;
    const screenW = width * 0.14;
    const screenH = height * 0.78;
    const screenTopY = (height - screenH) * 0.5;

    // 1. Draw Collimated Incident Laser Beam
    this.drawIncidentLaser(laserX, laserY, slitX);

    // 2. Draw Diffracted Wave Envelope
    this.drawDiffractedEnvelope(slitX, laserY, screenX, screenTopY, screenH);

    // 3. Draw Single Slit Aperture
    this.drawSlitAperture(slitX, laserY, slitH_px);

    // 4. Draw Screen with Diffraction Bands
    this.drawScreenBands(screenX, screenTopY, screenW, screenH);

    // 5. Draw Sinc-Squared Intensity Profile
    this.drawIntensityProfile(screenX - 15, screenTopY, screenH);

    // 6. Draw Photometer Probe
    const probeCanvasY = laserY + (this.probeY / 30) * (screenH * 0.5);
    this.drawProbe(screenX, probeCanvasY);

    // 7. Draw Laser Apparatus
    this.drawLaserHead(laserX, laserY);

    // 8. Annotations
    this.drawAnnotations(slitX, screenX, laserY);
  }

  drawBackgroundGrid() {
    const { ctx, width, height } = this;
    ctx.save();
    ctx.strokeStyle = '#DCE9F6';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (let x = 40; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 40; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    // Optical Axis
    ctx.strokeStyle = '#94A3B8';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.5);
    ctx.lineTo(width, height * 0.5);
    ctx.stroke();

    ctx.restore();
  }

  drawLaserHead(x, y) {
    const { ctx } = this;
    ctx.save();
    const beamColor = this.wavelengthToColor(this.wavelength, 1);

    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - 55, y - 22, 50, 44, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.roundRect(x - 5, y - 12, 10, 24, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = beamColor;
    ctx.shadowColor = beamColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x + 5, y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 10px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText('LASER', x - 30, y - 4);
    ctx.font = '600 9px JetBrains Mono';
    ctx.fillText(`${this.wavelength}nm`, x - 30, y + 10);

    ctx.restore();
  }

  drawIncidentLaser(lx, ly, sx) {
    const { ctx } = this;
    ctx.save();
    const beamColor = this.wavelengthToColor(this.wavelength, 0.45);
    const coreColor = this.wavelengthToColor(this.wavelength, 0.9);

    ctx.fillStyle = beamColor;
    ctx.fillRect(lx + 6, ly - 8, sx - (lx + 6), 16);

    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx + 6, ly);
    ctx.lineTo(sx, ly);
    ctx.stroke();

    ctx.restore();
  }

  drawSlitAperture(sx, sy, slitH) {
    const { ctx, height } = this;
    ctx.save();

    const barrierW = 10;
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.5;

    // Top Baffle
    ctx.fillRect(sx - barrierW * 0.5, 0, barrierW, sy - slitH * 0.5);
    ctx.strokeRect(sx - barrierW * 0.5, 0, barrierW, sy - slitH * 0.5);

    // Bottom Baffle
    ctx.fillRect(sx - barrierW * 0.5, sy + slitH * 0.5, barrierW, height - (sy + slitH * 0.5));
    ctx.strokeRect(sx - barrierW * 0.5, sy + slitH * 0.5, barrierW, height - (sy + slitH * 0.5));

    // Slit gap glow
    const beamColor = this.wavelengthToColor(this.wavelength, 1);
    ctx.fillStyle = beamColor;
    ctx.shadowColor = beamColor;
    ctx.shadowBlur = 8;
    ctx.fillRect(sx - 2, sy - slitH * 0.5, 4, slitH);

    ctx.shadowBlur = 0;
    ctx.font = '700 11px JetBrains Mono';
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'right';
    ctx.fillText(`a = ${this.slitWidth.toFixed(2)}mm`, sx - 14, sy + 4);

    ctx.restore();
  }

  drawDiffractedEnvelope(sx, sy, screenX, screenTopY, screenH) {
    const { ctx } = this;
    ctx.save();

    const beamColor = this.wavelengthToColor(this.wavelength, 0.12);
    ctx.fillStyle = beamColor;

    // Triangular spreading cone to screen
    ctx.beginPath();
    ctx.moveTo(sx + 5, sy);
    ctx.lineTo(screenX, screenTopY);
    ctx.lineTo(screenX, screenTopY + screenH);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawScreenBands(x, y, w, h) {
    const { ctx } = this;
    ctx.save();

    // Screen frame
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    const sliceH = 2;
    const halfH = h * 0.5;
    const centerY = y + halfH;
    const mmSpan = 30; // covers [-30mm, +30mm]

    const baseColor = this.wavelengthToColor(this.wavelength, 1);
    const match = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    const cr = match ? parseInt(match[1]) : 255;
    const cg = match ? parseInt(match[2]) : 50;
    const cb = match ? parseInt(match[3]) : 50;

    for (let py = y; py < y + h; py += sliceH) {
      const y_mm = ((py - centerY) / halfH) * mmSpan;
      const intensity = this.getIntensityAt(y_mm);

      const r = Math.round(cr * intensity);
      const g = Math.round(cg * intensity);
      const b = Math.round(cb * intensity);

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x + 2, py, w - 4, sliceH);
    }

    // Ruler marks along the screen
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1;
    ctx.font = '600 9px JetBrains Mono';
    ctx.fillStyle = '#94A3B8';
    ctx.textAlign = 'right';

    for (let mm = -25; mm <= 25; mm += 5) {
      const markY = centerY + (mm / mmSpan) * halfH;
      ctx.beginPath();
      ctx.moveTo(x + 2, markY);
      ctx.lineTo(x + 8, markY);
      ctx.stroke();

      ctx.fillText(`${mm > 0 ? '+' : ''}${mm}mm`, x - 4, markY + 3);
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 11px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText('DIFFRACTION PATTERN', x + w * 0.5, y - 8);

    ctx.restore();
  }

  drawIntensityProfile(xEnd, y, h) {
    const { ctx } = this;
    ctx.save();

    const graphWidth = 65;
    const halfH = h * 0.5;
    const centerY = y + halfH;
    const mmSpan = 30;

    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1.8;
    ctx.fillStyle = 'rgba(2, 132, 199, 0.12)';

    ctx.beginPath();
    ctx.moveTo(xEnd, y);

    for (let py = y; py <= y + h; py += 3) {
      const y_mm = ((py - centerY) / halfH) * mmSpan;
      const intensity = this.getIntensityAt(y_mm);
      const px = xEnd - (intensity * graphWidth);
      ctx.lineTo(px, py);
    }

    ctx.lineTo(xEnd, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 9px JetBrains Mono';
    ctx.fillStyle = '#0284C7';
    ctx.textAlign = 'right';
    ctx.fillText('SINC²(β) PROFILE', xEnd - 8, y + 14);

    ctx.restore();
  }

  drawProbe(screenX, probeY) {
    const { ctx } = this;
    ctx.save();

    // Probe sensor crosshair
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(screenX - 10, probeY);
    ctx.lineTo(screenX + 50, probeY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#F59E0B';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(screenX + 15, probeY, 7, 0, Math.PI * 2);
    ctx.fill();

    // Readout box
    ctx.shadowBlur = 0;
    const intensity = this.getIntensityAt(this.probeY);
    const boxW = 86;
    const boxH = 34;
    const boxX = screenX + 30;
    const boxY = probeY - boxH * 0.5;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = '700 10px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText(`y: ${this.probeY >= 0 ? '+' : ''}${this.probeY.toFixed(1)}mm`, boxX + 8, boxY + 14);
    ctx.font = '600 9px JetBrains Mono';
    ctx.fillStyle = '#D97706';
    ctx.fillText(`I/I₀: ${(intensity * 100).toFixed(1)}%`, boxX + 8, boxY + 27);

    ctx.restore();
  }

  drawAnnotations(sx, screenX, centerY) {
    const { ctx, height } = this;
    ctx.save();

    const dimY = height - 26;
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(sx, dimY);
    ctx.lineTo(screenX, dimY);
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.moveTo(sx, dimY - 4);
    ctx.lineTo(sx + 6, dimY);
    ctx.lineTo(sx, dimY + 4);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(screenX, dimY - 4);
    ctx.lineTo(screenX - 6, dimY);
    ctx.lineTo(screenX, dimY + 4);
    ctx.fill();

    ctx.font = '700 11px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`D = ${this.screenDistance.toFixed(2)} m`, (sx + screenX) * 0.5, dimY - 6);

    ctx.restore();
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.sim = new DiffractionSimulation();
});

