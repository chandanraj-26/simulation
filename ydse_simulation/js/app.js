/**
 * Young's Double Slit Experiment (YDSE) & Wave Interference
 * Strict Zero-Dependency Vanilla Web Standard & Simulation Guidelines
 */

class YDSESimulation {
  constructor() {
    this.canvas = document.getElementById('simCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Physical Parameters
    this.wavelength = 650; // nm (Red default)
    this.slitDistance = 0.25; // mm (d)
    this.screenDistance = 1.20; // m (D)
    this.slitWidth = 0.04; // mm (a)
    this.isWhiteLight = false;

    // Thin Film / Mica sheet insertion
    this.hasThinSheet = false;
    this.sheetThickness = 3.0; // micrometers
    this.sheetRefractiveIndex = 1.55; // Mica

    // Visualization Options
    this.showWavefronts = true;
    this.showIntensityProfile = true;
    this.showRays = true;
    this.soundEnabled = true;

    // Interactive Probe
    this.probeY = 0; // mm from central axis on the screen
    this.isDraggingProbe = false;

    // Audio Context
    this.audioCtx = null;
    this.probeOsc = null;
    this.probeGain = null;

    // Animation loop
    this.phaseTime = 0;
    this.animId = null;

    this.initDOM();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.attachEvents();
    this.startLoop();
  }

  initDOM() {
    // Sliders
    this.sliderWavelength = document.getElementById('sliderWavelength');
    this.sliderSlitDistance = document.getElementById('sliderSlitDistance');
    this.sliderScreenDistance = document.getElementById('sliderScreenDistance');
    this.sliderSlitWidth = document.getElementById('sliderSlitWidth');
    this.sliderSheetThickness = document.getElementById('sliderSheetThickness');

    // Badges
    this.valWavelength = document.getElementById('valWavelength');
    this.valSlitDistance = document.getElementById('valSlitDistance');
    this.valScreenDistance = document.getElementById('valScreenDistance');
    this.valSlitWidth = document.getElementById('valSlitWidth');
    this.valSheetThickness = document.getElementById('valSheetThickness');

    // Telemetry Cards
    this.teleFringeWidth = document.getElementById('teleFringeWidth');
    this.teleAngularWidth = document.getElementById('teleAngularWidth');
    this.teleProbePos = document.getElementById('teleProbePos');
    this.telePathDiff = document.getElementById('telePathDiff');

    // Toggles
    this.toggleWavefronts = document.getElementById('toggleWavefronts');
    this.toggleIntensity = document.getElementById('toggleIntensity');
    this.toggleRays = document.getElementById('toggleRays');
    this.toggleThinSheet = document.getElementById('toggleThinSheet');

    // Buttons
    this.btnAudioToggle = document.getElementById('btnAudioToggle');
    this.btnResetAll = document.getElementById('btnResetAll');
    this.btnOpenTheory = document.getElementById('btnOpenTheory');
    this.btnCloseTheory = document.getElementById('btnCloseTheory');
    this.modalTheory = document.getElementById('modalTheory');

    // Preset color buttons
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
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  playClickSound() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {}
  }

  updateProbeAudio(normalizedIntensity) {
    if (!this.soundEnabled || !this.audioCtx || !this.probeGain) return;
    try {
      // Frequency rises with intensity
      const freq = 220 + normalizedIntensity * 550;
      this.probeOsc.frequency.setTargetAtTime(freq, this.audioCtx.currentTime, 0.02);
      const targetGain = this.isDraggingProbe ? Math.max(0.01, normalizedIntensity * 0.12) : 0;
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
    // Wavelength slider
    this.sliderWavelength.addEventListener('input', (e) => {
      this.initAudio();
      this.isWhiteLight = false;
      this.wavelength = parseFloat(e.target.value);
      this.valWavelength.textContent = `${this.wavelength} nm`;
      this.updateActivePresetPill();
      this.updateTelemetry();
    });

    // Slit distance (d)
    this.sliderSlitDistance.addEventListener('input', (e) => {
      this.slitDistance = parseFloat(e.target.value);
      this.valSlitDistance.textContent = `${this.slitDistance.toFixed(2)} mm`;
      this.updateTelemetry();
    });

    // Screen distance (D)
    this.sliderScreenDistance.addEventListener('input', (e) => {
      this.screenDistance = parseFloat(e.target.value);
      this.valScreenDistance.textContent = `${this.screenDistance.toFixed(2)} m`;
      this.updateTelemetry();
    });

    // Slit width (a)
    this.sliderSlitWidth.addEventListener('input', (e) => {
      this.slitWidth = parseFloat(e.target.value);
      this.valSlitWidth.textContent = `${this.slitWidth.toFixed(2)} mm`;
      this.updateTelemetry();
    });

    // Sheet thickness (t)
    if (this.sliderSheetThickness) {
      this.sliderSheetThickness.addEventListener('input', (e) => {
        this.sheetThickness = parseFloat(e.target.value);
        this.valSheetThickness.textContent = `${this.sheetThickness.toFixed(1)} µm`;
        this.updateTelemetry();
      });
    }

    // Color Presets
    this.colorPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.initAudio();
        this.playClickSound();
        const wl = pill.getAttribute('data-wavelength');
        if (wl === 'white') {
          this.isWhiteLight = true;
          this.valWavelength.textContent = 'Polychromatic (White)';
        } else {
          this.isWhiteLight = false;
          this.wavelength = parseFloat(wl);
          this.sliderWavelength.value = this.wavelength;
          this.valWavelength.textContent = `${this.wavelength} nm`;
        }
        this.colorPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.updateTelemetry();
      });
    });

    // Toggles
    this.toggleWavefronts.addEventListener('change', (e) => {
      this.showWavefronts = e.target.checked;
    });

    this.toggleIntensity.addEventListener('change', (e) => {
      this.showIntensityProfile = e.target.checked;
    });

    this.toggleRays.addEventListener('change', (e) => {
      this.showRays = e.target.checked;
    });

    this.toggleThinSheet.addEventListener('change', (e) => {
      this.hasThinSheet = e.target.checked;
      const grp = document.getElementById('sheetThicknessGroup');
      if (grp) grp.style.display = this.hasThinSheet ? 'block' : 'none';
      this.updateTelemetry();
    });

    // Audio Toggle
    this.btnAudioToggle.addEventListener('click', () => {
      this.initAudio();
      this.soundEnabled = !this.soundEnabled;
      this.btnAudioToggle.textContent = this.soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
      if (!this.soundEnabled && this.probeGain) {
        this.probeGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      }
    });

    // Reset
    this.btnResetAll.addEventListener('click', () => {
      this.resetAll();
    });

    // Theory Modal
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

    // Canvas Pointer Events for Draggable Probe
    const handlePointerDown = (evt) => {
      this.initAudio();
      const rect = this.canvas.getBoundingClientRect();
      const mx = (evt.clientX || (evt.touches && evt.touches[0].clientX)) - rect.left;
      const my = (evt.clientY || (evt.touches && evt.touches[0].clientY)) - rect.top;

      const screenX = this.width * 0.82;
      const screenH = this.height * 0.76;
      const screenCenterY = this.height * 0.5;

      // Check if clicked near the screen column
      if (Math.abs(mx - screenX) < 45 || mx > screenX - 20) {
        this.isDraggingProbe = true;
        const mmScale = 25; // 25 mm span over screen height
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
      const mmScale = 25;
      const dyPx = my - screenCenterY;
      this.probeY = Math.max(-25, Math.min(25, (dyPx / (screenH * 0.5)) * mmScale));
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
      const wl = p.getAttribute('data-wavelength');
      if (wl !== 'white' && Math.abs(parseFloat(wl) - this.wavelength) < 10) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
  }

  resetAll() {
    this.wavelength = 650;
    this.slitDistance = 0.25;
    this.screenDistance = 1.20;
    this.slitWidth = 0.04;
    this.isWhiteLight = false;
    this.hasThinSheet = false;
    this.sheetThickness = 3.0;
    this.probeY = 0;

    this.sliderWavelength.value = 650;
    this.sliderSlitDistance.value = 0.25;
    this.sliderScreenDistance.value = 1.20;
    this.sliderSlitWidth.value = 0.04;
    if (this.sliderSheetThickness) this.sliderSheetThickness.value = 3.0;

    this.valWavelength.textContent = '650 nm';
    this.valSlitDistance.textContent = '0.25 mm';
    this.valScreenDistance.textContent = '1.20 m';
    this.valSlitWidth.textContent = '0.04 mm';
    if (this.valSheetThickness) this.valSheetThickness.textContent = '3.0 µm';

    this.toggleWavefronts.checked = true;
    this.toggleIntensity.checked = true;
    this.toggleRays.checked = true;
    this.toggleThinSheet.checked = false;
    this.showWavefronts = true;
    this.showIntensityProfile = true;
    this.showRays = true;

    const grp = document.getElementById('sheetThicknessGroup');
    if (grp) grp.style.display = 'none';

    this.updateActivePresetPill();
    this.updateTelemetry();
    this.playClickSound();
  }

  // Wavelength to RGB color string
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

  // Analytical intensity computation at screen position y (mm)
  getIntensityAt(y_mm, wl_nm = this.wavelength) {
    const y_m = y_mm * 1e-3;
    const d_m = this.slitDistance * 1e-3;
    const D_m = this.screenDistance;
    const lambda_m = wl_nm * 1e-9;
    const a_m = this.slitWidth * 1e-3;

    // Geometric path difference
    let pathDiff_m = (y_m * d_m) / D_m;

    // If thin transparent sheet inserted in front of upper slit S1
    if (this.hasThinSheet) {
      const extraPath = (this.sheetRefractiveIndex - 1.0) * (this.sheetThickness * 1e-6);
      pathDiff_m -= extraPath; // Shifts pattern upwards
    }

    const phaseDiff = (2 * Math.PI / lambda_m) * pathDiff_m;
    const interferenceFactor = Math.pow(Math.cos(phaseDiff / 2), 2);

    // Single-slit diffraction envelope: beta = pi * a * sin(theta) / lambda
    const sinTheta = y_m / Math.sqrt(y_m * y_m + D_m * D_m);
    const beta = (Math.PI * a_m * sinTheta) / lambda_m;
    const diffractionFactor = beta === 0 ? 1 : Math.pow(Math.sin(beta) / beta, 2);

    return interferenceFactor * diffractionFactor;
  }

  updateTelemetry() {
    // Fringe Width beta = (lambda * D) / d
    const lambda_m = this.wavelength * 1e-9;
    const d_m = this.slitDistance * 1e-3;
    const D_m = this.screenDistance;
    const beta_m = (lambda_m * D_m) / d_m;
    const beta_mm = beta_m * 1e3;

    // Angular fringe width theta = lambda / d in milliradians
    const theta_mrad = (lambda_m / d_m) * 1e3;

    // Path difference at probe position
    let pathDiff_um = ((this.probeY * 1e-3 * d_m) / D_m) * 1e6;
    if (this.hasThinSheet) {
      const shift_um = (this.sheetRefractiveIndex - 1.0) * this.sheetThickness;
      pathDiff_um -= shift_um;
    }

    // Fringe order n = delta / lambda
    const fringeOrder = pathDiff_um / (this.wavelength * 1e-3);

    // Screen shift due to sheet
    let sheetShift_mm = 0;
    if (this.hasThinSheet) {
      sheetShift_mm = ((D_m / d_m) * (this.sheetRefractiveIndex - 1.0) * (this.sheetThickness * 1e-6)) * 1e3;
    }

    this.teleFringeWidth.textContent = `${beta_mm.toFixed(3)} mm`;
    this.teleAngularWidth.textContent = `${theta_mrad.toFixed(2)} mrad`;
    this.teleProbePos.textContent = `${this.probeY >= 0 ? '+' : ''}${this.probeY.toFixed(2)} mm`;
    this.telePathDiff.textContent = `${pathDiff_um.toFixed(2)} µm (n=${fringeOrder.toFixed(2)})`;

    // Audio update for probe
    const curIntensity = this.getIntensityAt(this.probeY);
    this.updateProbeAudio(curIntensity);
  }

  startLoop() {
    const render = () => {
      this.phaseTime += 0.04;
      this.draw();
      this.animId = requestAnimationFrame(render);
    };
    this.animId = requestAnimationFrame(render);
  }

  draw() {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    // Soft background grid
    this.drawBackgroundGrid();

    // Coordinates of apparatus
    const laserX = width * 0.08;
    const laserY = height * 0.5;

    const slitApertureX = width * 0.32;
    const slitDistPx = Math.max(16, (this.slitDistance / 1.0) * 80);
    const s1Y = laserY - slitDistPx * 0.5;
    const s2Y = laserY + slitDistPx * 0.5;

    const screenX = width * 0.82;
    const screenW = width * 0.14;
    const screenH = height * 0.78;
    const screenTopY = (height - screenH) * 0.5;

    // 1. Draw Wavefronts if enabled
    if (this.showWavefronts && !this.isWhiteLight) {
      this.drawHuygensWavefronts(slitApertureX, s1Y, s2Y, screenX);
    }

    // 2. Draw Incident Beam from Laser to Slits
    this.drawIncidentBeam(laserX, laserY, slitApertureX, s1Y, s2Y);

    // 3. Draw Rays to Probe
    if (this.showRays) {
      const probeCanvasY = laserY + (this.probeY / 25) * (screenH * 0.5);
      this.drawInterferenceRays(slitApertureX, s1Y, s2Y, screenX, probeCanvasY);
    }

    // 4. Draw Double Slit Barrier
    this.drawSlitBarrier(slitApertureX, s1Y, s2Y);

    // 5. Draw Thin Sheet if enabled
    if (this.hasThinSheet) {
      this.drawThinSheet(slitApertureX, s1Y);
    }

    // 6. Draw Screen & Fringe Pattern
    this.drawScreenFringes(screenX, screenTopY, screenW, screenH);

    // 7. Draw Intensity Profile Graph
    if (this.showIntensityProfile) {
      this.drawIntensityProfile(screenX - 15, screenTopY, screenH);
    }

    // 8. Draw Draggable Photometer Probe
    const probeCanvasY = laserY + (this.probeY / 25) * (screenH * 0.5);
    this.drawProbe(screenX, probeCanvasY);

    // 9. Draw Laser Gun Apparatus
    this.drawLaserApparatus(laserX, laserY);

    // 10. Draw Axis and Dimension Annotations
    this.drawAnnotations(slitApertureX, s1Y, s2Y, screenX, laserY);
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

    // Optical Principal Axis
    ctx.strokeStyle = '#94A3B8';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.5);
    ctx.lineTo(width, height * 0.5);
    ctx.stroke();

    ctx.restore();
  }

  drawLaserApparatus(x, y) {
    const { ctx } = this;
    ctx.save();

    const beamColor = this.isWhiteLight ? '#FFFFFF' : this.wavelengthToColor(this.wavelength, 1);

    // Body
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x - 55, y - 22, 50, 44, 6);
    ctx.fill();
    ctx.stroke();

    // Nozzle
    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.roundRect(x - 5, y - 12, 10, 24, 3);
    ctx.fill();
    ctx.stroke();

    // Glowing laser aperture tip
    ctx.fillStyle = beamColor;
    ctx.shadowColor = beamColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x + 5, y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 10px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText('LASER', x - 30, y - 4);
    ctx.font = '600 9px JetBrains Mono';
    ctx.fillText(this.isWhiteLight ? 'WHITE' : `${this.wavelength}nm`, x - 30, y + 10);

    ctx.restore();
  }

  drawIncidentBeam(lx, ly, sx, s1y, s2y) {
    const { ctx } = this;
    ctx.save();

    const beamColor = this.isWhiteLight ? 'rgba(255, 255, 255, 0.75)' : this.wavelengthToColor(this.wavelength, 0.5);
    const coreColor = this.isWhiteLight ? 'rgba(255, 255, 255, 0.95)' : this.wavelengthToColor(this.wavelength, 0.85);

    // Expanding coherent beam illuminating both slits
    const grad = ctx.createLinearGradient(lx, ly, sx, ly);
    grad.addColorStop(0, beamColor);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(lx + 6, ly);
    ctx.lineTo(sx, s1y - 15);
    ctx.lineTo(sx, s2y + 15);
    ctx.closePath();
    ctx.fill();

    // Central ray
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx + 6, ly);
    ctx.lineTo(sx, ly);
    ctx.stroke();

    ctx.restore();
  }

  drawSlitBarrier(x, s1y, s2y) {
    const { ctx, height } = this;
    ctx.save();

    const barrierW = 10;
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.5;

    // Top section
    ctx.fillRect(x - barrierW * 0.5, 0, barrierW, s1y - 3);
    ctx.strokeRect(x - barrierW * 0.5, 0, barrierW, s1y - 3);

    // Middle section between S1 and S2
    ctx.fillRect(x - barrierW * 0.5, s1y + 3, barrierW, (s2y - 3) - (s1y + 3));
    ctx.strokeRect(x - barrierW * 0.5, s1y + 3, barrierW, (s2y - 3) - (s1y + 3));

    // Bottom section
    ctx.fillRect(x - barrierW * 0.5, s2y + 3, barrierW, height - (s2y + 3));
    ctx.strokeRect(x - barrierW * 0.5, s2y + 3, barrierW, height - (s2y + 3));

    // Glowing slits
    const slitGlow = this.isWhiteLight ? '#FFFFFF' : this.wavelengthToColor(this.wavelength, 1);
    ctx.fillStyle = slitGlow;
    ctx.shadowColor = slitGlow;
    ctx.shadowBlur = 8;
    ctx.fillRect(x - 2, s1y - 2, 4, 4);
    ctx.fillRect(x - 2, s2y - 2, 4, 4);

    // Slit labels
    ctx.shadowBlur = 0;
    ctx.font = '700 11px JetBrains Mono';
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'right';
    ctx.fillText('S₁', x - 12, s1y + 4);
    ctx.fillText('S₂', x - 12, s2y + 4);

    ctx.restore();
  }

  drawThinSheet(sx, s1y) {
    const { ctx } = this;
    ctx.save();
    const sheetW = 6;
    const sheetH = 26;

    ctx.fillStyle = 'rgba(186, 230, 253, 0.75)';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(sx + 5, s1y - sheetH * 0.5, sheetW, sheetH, 2);
    ctx.fill();
    ctx.stroke();

    // Callout
    ctx.font = '600 10px JetBrains Mono';
    ctx.fillStyle = '#0369A1';
    ctx.textAlign = 'left';
    ctx.fillText(`Mica: ${this.sheetThickness}µm`, sx + 16, s1y - 4);
    ctx.fillText(`µ = ${this.sheetRefractiveIndex}`, sx + 16, s1y + 8);

    ctx.restore();
  }

  drawHuygensWavefronts(sx, s1y, s2y, screenX) {
    const { ctx } = this;
    ctx.save();

    const maxR = screenX - sx;
    const waveSpacing = 22; // wave crest separation in px
    const offset = (this.phaseTime * 20) % waveSpacing;
    const waveColor = this.wavelengthToColor(this.wavelength, 0.18);

    ctx.strokeStyle = waveColor;
    ctx.lineWidth = 1.5;

    for (let r = offset; r < maxR; r += waveSpacing) {
      if (r <= 4) continue;
      // Slit 1 wavefront
      ctx.beginPath();
      ctx.arc(sx, s1y, r, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();

      // Slit 2 wavefront
      ctx.beginPath();
      ctx.arc(sx, s2y, r, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawInterferenceRays(sx, s1y, s2y, screenX, probeCanvasY) {
    const { ctx } = this;
    ctx.save();

    const rayColor = this.isWhiteLight ? 'rgba(71, 85, 105, 0.7)' : this.wavelengthToColor(this.wavelength, 0.75);
    ctx.strokeStyle = rayColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);

    // Ray from S1 to probe
    ctx.beginPath();
    ctx.moveTo(sx + 2, s1y);
    ctx.lineTo(screenX, probeCanvasY);
    ctx.stroke();

    // Ray from S2 to probe
    ctx.beginPath();
    ctx.moveTo(sx + 2, s2y);
    ctx.lineTo(screenX, probeCanvasY);
    ctx.stroke();

    ctx.restore();
  }

  drawScreenFringes(x, y, w, h) {
    const { ctx } = this;
    ctx.save();

    // Screen frame
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Compute fringe slice rows across the screen height
    const sliceH = 2;
    const halfH = h * 0.5;
    const centerY = y + halfH;
    const mmSpan = 25; // Screen covers [-25 mm, +25 mm]

    for (let py = y; py < y + h; py += sliceH) {
      const y_mm = ((py - centerY) / halfH) * mmSpan;

      let r = 0, g = 0, b = 0;

      if (this.isWhiteLight) {
        // Polychromatic: sum intensities across spectrum (400 nm to 700 nm)
        const wavelengths = [420, 460, 500, 540, 580, 620, 660];
        wavelengths.forEach(wl => {
          const intensity = this.getIntensityAt(y_mm, wl);
          // Simple RGB contribution
          if (wl <= 470) { b += intensity * 1.2; }
          else if (wl <= 560) { g += intensity * 1.1; r += intensity * 0.4; }
          else { r += intensity * 1.2; g += intensity * 0.4; }
        });
        r = Math.min(255, Math.round((r / wavelengths.length) * 255 * 1.8));
        g = Math.min(255, Math.round((g / wavelengths.length) * 255 * 1.8));
        b = Math.min(255, Math.round((b / wavelengths.length) * 255 * 1.8));
      } else {
        const intensity = this.getIntensityAt(y_mm, this.wavelength);
        // Single color
        const baseColor = this.wavelengthToColor(this.wavelength, 1);
        // Extract RGB
        const match = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          r = Math.round(parseInt(match[1]) * intensity);
          g = Math.round(parseInt(match[2]) * intensity);
          b = Math.round(parseInt(match[3]) * intensity);
        }
      }

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x + 2, py, w - 4, sliceH);
    }

    // Ruler markings along the screen
    ctx.fillStyle = '#94A3B8';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1;
    ctx.font = '600 9px JetBrains Mono';
    ctx.textAlign = 'right';

    for (let mm = -20; mm <= 20; mm += 5) {
      const markY = centerY + (mm / mmSpan) * halfH;
      ctx.beginPath();
      ctx.moveTo(x + 2, markY);
      ctx.lineTo(x + 8, markY);
      ctx.stroke();

      ctx.fillText(`${mm > 0 ? '+' : ''}${mm}mm`, x - 4, markY + 3);
    }

    // Screen Header Label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 11px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText('PROJECTION SCREEN', x + w * 0.5, y - 8);

    ctx.restore();
  }

  drawIntensityProfile(xEnd, y, h) {
    const { ctx } = this;
    ctx.save();

    const graphWidth = 65;
    const halfH = h * 0.5;
    const centerY = y + halfH;
    const mmSpan = 25;

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

    // Label
    ctx.font = '700 9px JetBrains Mono';
    ctx.fillStyle = '#0284C7';
    ctx.textAlign = 'right';
    ctx.fillText('I(y) PROFILE', xEnd - 10, y + 14);

    ctx.restore();
  }

  drawProbe(screenX, probeY) {
    const { ctx } = this;
    ctx.save();

    // Probe sensor crosshair on the screen
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(screenX - 10, probeY);
    ctx.lineTo(screenX + 50, probeY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Probe Head Widget
    ctx.fillStyle = '#F59E0B';
    ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(screenX + 15, probeY, 7, 0, Math.PI * 2);
    ctx.fill();

    // Readout Box
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

  drawAnnotations(sx, s1y, s2y, screenX, centerY) {
    const { ctx, height } = this;
    ctx.save();

    // Distance D dimension line
    const dimY = height - 26;
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(sx, dimY);
    ctx.lineTo(screenX, dimY);
    ctx.stroke();

    // Dimension arrows
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

    // Slit distance d dimension
    ctx.strokeStyle = '#64748B';
    ctx.beginPath();
    ctx.moveTo(sx - 24, s1y);
    ctx.lineTo(sx - 24, s2y);
    ctx.stroke();

    ctx.font = '700 10px JetBrains Mono';
    ctx.textAlign = 'right';
    ctx.fillText(`d = ${this.slitDistance.toFixed(2)}mm`, sx - 30, (s1y + s2y) * 0.5 + 4);

    ctx.restore();
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.sim = new YDSESimulation();
});
