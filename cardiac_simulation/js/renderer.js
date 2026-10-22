/**
 * CardiacSim — Canvas 2D Renderer
 * Renders the 4-chamber beating heart anatomy, cardiac conduction highway,
 * blood flow corpuscles, interactive stethoscope auscultation landmarks,
 * and synchronized Wiggers multi-channel physiological oscilloscope.
 */

class CardiacRenderer {
  constructor(canvas, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = state;

    this.width = 800;
    this.height = 540;
    this.dpr = 1;

    // Stethoscope dragging state
    this.isDraggingStethoscope = false;
    this.dragOffset = { x: 0, y: 0 };

    // Auscultation landmarks (proportional coordinates in canvas)
    this.landmarks = {
      aortic: { name: 'Aortic Area (2nd R ICS)', xPct: 0.38, yPct: 0.32, color: '#E11D48', note: 'Best for S2 & Aortic Stenosis' },
      pulmonic: { name: 'Pulmonic Area (2nd L ICS)', xPct: 0.58, yPct: 0.32, color: '#0284C7', note: 'Best for Pulmonic Valve & S2 split' },
      tricuspid: { name: 'Tricuspid Area (4th L ICS)', xPct: 0.44, yPct: 0.52, color: '#059669', note: 'Best for Tricuspid Valve & S1' },
      mitral: { name: 'Mitral / Apex (5th L ICS)', xPct: 0.62, yPct: 0.68, color: '#7C3AED', note: 'Best for S1 & Mitral Regurgitation' }
    };

    this.bindEvents();
    this.resize();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.width = Math.max(320, rect.width);
    this.height = Math.max(340, rect.height);

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  bindEvents() {
    // Pointer events for dragging stethoscope tool
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) / this.width,
        y: (clientY - rect.top) / this.height
      };
    };

    const onDown = (e) => {
      const pos = getPos(e);
      const steth = this.state.stethoscope;
      const dx = (pos.x - steth.x) * this.width;
      const dy = (pos.y - steth.y) * this.height;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 45 && this.state.mode !== 'wiggers') {
        this.isDraggingStethoscope = true;
        steth.isDragging = true;
        this.dragOffset.x = pos.x - steth.x;
        this.dragOffset.y = pos.y - steth.y;
        this.canvas.style.cursor = 'grabbing';
      } else if (this.state.mode === 'wiggers' || (this.state.mode === 'split' && pos.x > 0.5)) {
        // Scrub Wiggers cycle directly
        this.isScrubbingWiggers = true;
        this.scrubFromPosition(pos);
      }
    };

    const onMove = (e) => {
      const pos = getPos(e);
      const steth = this.state.stethoscope;

      if (this.isDraggingStethoscope) {
        steth.x = Math.max(0.08, Math.min(0.92, pos.x - this.dragOffset.x));
        steth.y = Math.max(0.08, Math.min(0.92, pos.y - this.dragOffset.y));
        this.checkStethoscopeProximity();
      } else if (this.isScrubbingWiggers) {
        this.scrubFromPosition(pos);
      } else {
        const dx = (pos.x - steth.x) * this.width;
        const dy = (pos.y - steth.y) * this.height;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 45 && this.state.mode !== 'wiggers') {
          this.canvas.style.cursor = 'grab';
        } else if (this.state.mode === 'wiggers' || (this.state.mode === 'split' && pos.x > 0.5)) {
          this.canvas.style.cursor = 'ew-resize';
        } else {
          this.canvas.style.cursor = 'crosshair';
        }
      }
    };

    const onUp = () => {
      this.isDraggingStethoscope = false;
      this.isScrubbingWiggers = false;
      this.state.stethoscope.isDragging = false;
      this.canvas.style.cursor = 'crosshair';
    };

    this.canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    this.canvas.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
  }

  checkStethoscopeProximity() {
    const steth = this.state.stethoscope;
    let closestZone = null;
    let minDistance = 999;

    for (const [key, lm] of Object.entries(this.landmarks)) {
      const dx = (steth.x - lm.xPct) * this.width;
      const dy = (steth.y - lm.yPct) * this.height;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Distance threshold: 48 pixels
      if (dist < 55 && dist < minDistance) {
        minDistance = dist;
        closestZone = key;
      }
    }

    steth.currentZone = closestZone;

    if (closestZone === 'mitral') {
      this.state.checkQuest('quest-auscultation-apex');
    }
  }

  scrubFromPosition(pos) {
    let p = 0;
    if (this.state.mode === 'wiggers') {
      const graphX = 20 + 10;
      const graphW = this.width - 40 - 20;
      p = (pos.x * this.width - graphX) / graphW;
    } else if (this.state.mode === 'split') {
      const halfW = this.width * 0.5;
      const graphX = halfW + 16 + 10;
      const graphW = halfW - 32 - 20;
      p = (pos.x * this.width - graphX) / graphW;
    }
    this.state.setPhase(Math.max(0, Math.min(0.999, p)));
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // 1. Soft Light-Blue Study Environment Backdrop
    ctx.fillStyle = '#E6F2FF';
    ctx.fillRect(0, 0, w, h);

    // Subtle academic millimeter coordinate grid
    this.drawMedicalGrid(ctx, w, h);

    const mode = this.state.mode;

    if (mode === 'anatomy') {
      this.drawHeartAnatomy(ctx, w * 0.5, h * 0.5, Math.min(w, h) * 0.44 * this.state.zoom);
      this.drawLandmarks(ctx, w, h);
      this.drawStethoscope(ctx, w, h);
    } else if (mode === 'wiggers') {
      this.drawWiggersOscilloscope(ctx, 20, 20, w - 40, h - 40);
    } else if (mode === 'split') {
      const halfW = w * 0.5;
      this.drawHeartAnatomy(ctx, halfW * 0.5, h * 0.5, Math.min(halfW, h) * 0.42 * this.state.zoom);
      this.drawLandmarks(ctx, halfW, h);
      this.drawStethoscope(ctx, halfW, h);

      // Divider line
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(halfW, 10);
      ctx.lineTo(halfW, h - 10);
      ctx.stroke();

      this.drawWiggersOscilloscope(ctx, halfW + 16, 20, halfW - 32, h - 40);
    } else if (mode === 'auscultation') {
      this.drawAuscultationBench(ctx, w, h);
      this.drawLandmarks(ctx, w, h);
      this.drawStethoscope(ctx, w, h);
    }

    // Floating cycle phase badge at top-center (only in Anatomy and Auscultation modes)
    if (mode === 'anatomy' || mode === 'auscultation') {
      this.drawPhaseBanner(ctx, w);
    }
  }

  drawMedicalGrid(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.45)';
    ctx.lineWidth = 1;
    const step = 25;
    ctx.beginPath();
    for (let x = step; x < w; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = step; y < h; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  drawPhaseBanner(ctx, w) {
    ctx.save();
    const phaseName = this.state.metrics.currentPhaseName;
    const fontSize = Math.max(11, Math.min(13, Math.round(w * 0.016)));
    ctx.font = `600 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
    
    const textWidth = ctx.measureText(phaseName).width;
    const bannerW = textWidth + 36;
    const bannerH = 28;
    const bannerX = (w - bannerW) * 0.5;
    const bannerY = 12;

    // Glass pill background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    this.roundRect(ctx, bannerX, bannerY, bannerW, bannerH, 14);
    ctx.fill();

    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(phaseName, w * 0.5, bannerY + bannerH * 0.5);
    ctx.restore();
  }

  drawHeartAnatomy(ctx, cx, cy, radius) {
    ctx.save();

    const p = this.state.phase;
    // Systolic contraction mechanical factor (ventricular contraction during p = 0.12 to 0.48)
    let contractFactor = 0;
    if (p >= 0.12 && p <= 0.45) {
      contractFactor = Math.sin(((p - 0.12) / 0.33) * Math.PI) * 0.14 * this.state.contractility;
    }

    // Atrial systole contraction (p = 0.00 to 0.12)
    let atriaContract = 0;
    if (p <= 0.12) {
      atriaContract = Math.sin((p / 0.12) * Math.PI) * 0.10;
    }

    const scale = radius / 200;

    // 1. Myocardium (Muscular outer cardiac wall)
    ctx.fillStyle = '#FDA4AF'; // Soft cardiac myocardium tone
    ctx.strokeStyle = '#E11D48';
    ctx.lineWidth = 5 * scale;

    ctx.beginPath();
    // Heart base and apex contour
    const apexY = cy + radius * (1.15 - contractFactor * 0.4);
    const leftWallX = cx - radius * (0.95 - atriaContract * 0.2);
    const rightWallX = cx + radius * (0.95 - contractFactor * 0.5);

    ctx.moveTo(cx, cy - radius * 0.6);
    // Left atrium bulge
    ctx.bezierCurveTo(cx - radius * 0.6, cy - radius * 0.8, leftWallX, cy - radius * 0.2, leftWallX, cy + radius * 0.2);
    // Left ventricle down to apex
    ctx.bezierCurveTo(leftWallX, cy + radius * 0.7, cx - radius * 0.2, apexY, cx - radius * 0.05, apexY);
    // Right ventricle contour up to right side
    ctx.bezierCurveTo(cx + radius * 0.2, apexY, rightWallX, cy + radius * 0.7, rightWallX, cy + radius * 0.2);
    // Right atrium bulge
    ctx.bezierCurveTo(rightWallX, cy - radius * 0.2, cx + radius * 0.6, cy - radius * 0.8, cx, cy - radius * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Interventricular Septum (Muscular dividing wall)
    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.moveTo(cx - 10 * scale, cy - radius * 0.3);
    ctx.lineTo(cx - 16 * scale, apexY - 15 * scale);
    ctx.lineTo(cx + 12 * scale, apexY - 15 * scale);
    ctx.lineTo(cx + 8 * scale, cy - radius * 0.3);
    ctx.closePath();
    ctx.fill();

    // 3. Right Atrium & Ventricle Chamber Cavity (Deoxygenated, Sapphire Blue)
    ctx.fillStyle = 'rgba(2, 132, 199, 0.22)';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2.5;

    // Right Ventricle (RV) cavity
    ctx.beginPath();
    ctx.moveTo(cx - 14 * scale, cy + radius * 0.1);
    ctx.lineTo(cx - 14 * scale, apexY - 20 * scale);
    ctx.quadraticCurveTo(cx - radius * 0.65, cy + radius * 0.6, cx - radius * 0.7, cy + radius * 0.2);
    ctx.lineTo(cx - radius * 0.35, cy + radius * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Atrium (RA) cavity
    ctx.beginPath();
    ctx.arc(cx - radius * 0.5, cy - radius * 0.3, radius * 0.32 * (1 - atriaContract * 0.3), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 4. Left Atrium & Ventricle Chamber Cavity (Oxygenated, Crimson Red)
    ctx.fillStyle = 'rgba(225, 29, 72, 0.22)';
    ctx.strokeStyle = '#E11D48';
    ctx.lineWidth = 2.5;

    // Left Ventricle (LV) cavity - thicker muscle wall, smaller lumen during contraction
    ctx.beginPath();
    ctx.moveTo(cx + 10 * scale, cy + radius * 0.1);
    ctx.lineTo(cx + 8 * scale, apexY - 20 * scale);
    ctx.quadraticCurveTo(cx + radius * (0.68 - contractFactor), cy + radius * 0.6, cx + radius * (0.7 - contractFactor), cy + radius * 0.2);
    ctx.lineTo(cx + radius * 0.35, cy + radius * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Left Atrium (LA) cavity
    ctx.beginPath();
    ctx.arc(cx + radius * 0.45, cy - radius * 0.3, radius * 0.30 * (1 - atriaContract * 0.3), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 5. Great Vessels (Vena Cava, Pulmonary Artery, Aorta, Pulmonary Veins)
    this.drawGreatVessels(ctx, cx, cy, radius, scale);

    // 6. Heart Valves with Dynamic Leaflets
    this.drawValves(ctx, cx, cy, radius, scale);

    // 7. Electrical Conduction Highway (SA, AV, Bundle of His, Purkinje)
    this.drawConductionSystem(ctx, cx, cy, radius, scale);

    // 8. Blood flow particles (Erythrocytes)
    this.drawBloodParticles(ctx, cx, cy, radius, scale);

    // 9. Chamber Labels
    this.drawChamberLabels(ctx, cx, cy, radius, scale);

    ctx.restore();
  }

  drawGreatVessels(ctx, cx, cy, radius, scale) {
    ctx.save();

    // Aortic Arch (Ascending, Arch, Descending) - Oxygenated Crimson
    ctx.fillStyle = 'rgba(225, 29, 72, 0.35)';
    ctx.strokeStyle = '#BE123C';
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    ctx.moveTo(cx + 8 * scale, cy - radius * 0.3);
    ctx.bezierCurveTo(cx + 20 * scale, cy - radius * 0.95, cx - 40 * scale, cy - radius * 1.05, cx - 60 * scale, cy - radius * 0.7);
    ctx.lineTo(cx - 45 * scale, cy - radius * 0.6);
    ctx.bezierCurveTo(cx - 30 * scale, cy - radius * 0.85, cx + 5 * scale, cy - radius * 0.8, cx - 5 * scale, cy - radius * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3 Brachiocephalic Arch Branches
    ctx.beginPath();
    ctx.moveTo(cx - 30 * scale, cy - radius * 0.95);
    ctx.lineTo(cx - 35 * scale, cy - radius * 1.15);
    ctx.moveTo(cx - 10 * scale, cy - radius * 0.98);
    ctx.lineTo(cx - 12 * scale, cy - radius * 1.18);
    ctx.moveTo(cx + 10 * scale, cy - radius * 0.92);
    ctx.lineTo(cx + 12 * scale, cy - radius * 1.15);
    ctx.stroke();

    // Pulmonary Trunk & Arteries (Crossing under aorta) - Blue
    ctx.fillStyle = 'rgba(2, 132, 199, 0.35)';
    ctx.strokeStyle = '#0369A1';
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    ctx.moveTo(cx - 20 * scale, cy - radius * 0.25);
    ctx.bezierCurveTo(cx - 25 * scale, cy - radius * 0.8, cx + 50 * scale, cy - radius * 0.75, cx + 70 * scale, cy - radius * 0.65);
    ctx.lineTo(cx + 65 * scale, cy - radius * 0.52);
    ctx.bezierCurveTo(cx + 40 * scale, cy - radius * 0.6, cx - 8 * scale, cy - radius * 0.65, cx - 5 * scale, cy - radius * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Superior Vena Cava (SVC) - Right Blue Inflow
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.7, cy - radius * 0.85);
    ctx.lineTo(cx - radius * 0.7, cy - radius * 0.45);
    ctx.lineTo(cx - radius * 0.5, cy - radius * 0.45);
    ctx.lineTo(cx - radius * 0.5, cy - radius * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawValves(ctx, cx, cy, radius, scale) {
    ctx.save();
    const valves = this.state.valves;

    // 1. Tricuspid Valve (Between RA and RV, left on diagram)
    const triOpen = valves.tricuspid;
    const triX = cx - radius * 0.5;
    const triY = cy + radius * 0.08;
    this.drawValveLeaflet(ctx, triX, triY, 24 * scale, triOpen, '#0284C7', 'Tricuspid');

    // 2. Mitral (Bicuspid) Valve (Between LA and LV, right on diagram)
    const mitOpen = valves.mitral;
    const mitX = cx + radius * 0.45;
    const mitY = cy + radius * 0.08;
    this.drawValveLeaflet(ctx, mitX, mitY, 24 * scale, mitOpen, '#E11D48', 'Mitral');

    // 3. Pulmonary Semilunar Valve (Base of Pulmonary Trunk)
    const pulOpen = valves.pulmonic;
    const pulX = cx - 12 * scale;
    const pulY = cy - radius * 0.22;
    this.drawSemilunarValve(ctx, pulX, pulY, 16 * scale, pulOpen, '#0369A1', 'Pulmonary SL');

    // 4. Aortic Semilunar Valve (Base of Aorta)
    const aoOpen = valves.aortic;
    const aoX = cx + 8 * scale;
    const aoY = cy - radius * 0.22;
    this.drawSemilunarValve(ctx, aoX, aoY, 16 * scale, aoOpen, '#BE123C', 'Aortic SL');

    ctx.restore();
  }

  drawValveLeaflet(ctx, x, y, size, isOpen, color, label) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    // Papillary muscle & chordae tendineae
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.8, y + size * 1.2);
    ctx.lineTo(x - size * 0.4, y + (isOpen ? size * 0.8 : 0));
    ctx.moveTo(x + size * 0.8, y + size * 1.2);
    ctx.lineTo(x + size * 0.4, y + (isOpen ? size * 0.8 : 0));
    ctx.stroke();

    // Valve flaps
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (isOpen) {
      // Flaps swing down to allow forward inflow
      ctx.moveTo(x - size * 0.9, y);
      ctx.lineTo(x - size * 0.35, y + size * 0.85);
      ctx.moveTo(x + size * 0.9, y);
      ctx.lineTo(x + size * 0.35, y + size * 0.85);
    } else {
      // Flaps meet firmly at center line, preventing regurgitation
      ctx.moveTo(x - size * 0.9, y);
      ctx.lineTo(x, y + 2);
      ctx.moveTo(x + size * 0.9, y);
      ctx.lineTo(x, y + 2);
    }
    ctx.stroke();

    ctx.restore();
  }

  drawSemilunarValve(ctx, x, y, size, isOpen, color, label) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    ctx.beginPath();
    if (isOpen) {
      // Semilunar pockets pushed against vessel wall
      ctx.arc(x - size * 0.5, y, size * 0.4, -Math.PI * 0.3, Math.PI * 0.3);
      ctx.arc(x + size * 0.5, y, size * 0.4, Math.PI * 0.7, Math.PI * 1.3);
    } else {
      // Cup-like cusps meet in lumen center
      ctx.arc(x - size * 0.25, y, size * 0.4, 0, Math.PI * 0.5);
      ctx.arc(x + size * 0.25, y, size * 0.4, Math.PI * 0.5, Math.PI);
    }
    ctx.stroke();
    ctx.restore();
  }

  drawConductionSystem(ctx, cx, cy, radius, scale) {
    ctx.save();
    const cond = this.state.conduction;

    // SA Node (Pacemaker) located in superior wall of Right Atrium
    const saX = cx - radius * 0.62;
    const saY = cy - radius * 0.48;

    // AV Node located in inferior interatrial septum
    const avX = cx - 6 * scale;
    const avY = cy + radius * 0.05;

    // Bundle of His running down interventricular septum
    const hisY = cy + radius * 0.25;
    const apexY = cy + radius * 0.95;

    // Draw Pathway Lines
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)'; // Emerald conduction pathway
    ctx.lineWidth = 2.5 * scale;
    ctx.lineJoin = 'round';

    // Internodal pathways from SA to AV node
    ctx.beginPath();
    ctx.moveTo(saX, saY);
    ctx.quadraticCurveTo(cx - radius * 0.35, cy - radius * 0.2, avX, avY);
    ctx.stroke();

    // Bachmann's bundle over to Left Atrium
    ctx.beginPath();
    ctx.moveTo(saX, saY);
    ctx.quadraticCurveTo(cx, cy - radius * 0.55, cx + radius * 0.4, cy - radius * 0.35);
    ctx.stroke();

    // Bundle of His & Bundle Branches
    ctx.beginPath();
    ctx.moveTo(avX, avY);
    ctx.lineTo(cx - 2 * scale, hisY);
    // Right branch
    ctx.quadraticCurveTo(cx - radius * 0.25, cy + radius * 0.6, cx - 18 * scale, apexY - 20 * scale);
    // Left branch
    ctx.moveTo(cx - 2 * scale, hisY);
    ctx.quadraticCurveTo(cx + radius * 0.25, cy + radius * 0.6, cx + 18 * scale, apexY - 20 * scale);
    ctx.stroke();

    // Purkinje fibers branching into ventricular walls
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
    // Right ventricular Purkinje network
    ctx.beginPath();
    ctx.moveTo(cx - 18 * scale, apexY - 20 * scale);
    ctx.lineTo(cx - radius * 0.5, cy + radius * 0.7);
    ctx.lineTo(cx - radius * 0.65, cy + radius * 0.4);
    // Left ventricular Purkinje network
    ctx.moveTo(cx + 18 * scale, apexY - 20 * scale);
    ctx.lineTo(cx + radius * 0.55, cy + radius * 0.7);
    ctx.lineTo(cx + radius * 0.65, cy + radius * 0.35);
    ctx.stroke();

    // Glowing Activation Spark Pulses
    if (cond.saFired) {
      this.drawGlowNode(ctx, saX, saY, 9 * scale, '#F59E0B', '#FDE68A', 'SA Node');
    } else {
      this.drawGlowNode(ctx, saX, saY, 6 * scale, '#10B981', '#A7F3D0', 'SA Node');
    }

    if (cond.avNodeDelay > 0.3) {
      this.drawGlowNode(ctx, avX, avY, 8 * scale, '#F59E0B', '#FDE68A', 'AV Node');
    } else {
      this.drawGlowNode(ctx, avX, avY, 5 * scale, '#10B981', '#A7F3D0', 'AV Node');
    }

    // Traveling Wave Spark during Ventricular Depolarization (QRS)
    if (cond.hisPurkinje > 0.1) {
      ctx.fillStyle = '#FBBF24';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 14;

      const sparkPhase = cond.hisPurkinje;
      const sparkY = hisY + (apexY - hisY) * (1 - sparkPhase);

      ctx.beginPath();
      ctx.arc(cx - radius * 0.25 * sparkPhase, sparkY, 5 * scale, 0, Math.PI * 2);
      ctx.arc(cx + radius * 0.25 * sparkPhase, sparkY, 5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';
    }

    ctx.restore();
  }

  drawGlowNode(ctx, x, y, radius, outerColor, innerColor, label) {
    ctx.save();
    ctx.shadowColor = outerColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = outerColor;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = innerColor;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#0F172A';
    ctx.font = `700 10px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - radius - 4);
    ctx.restore();
  }

  drawBloodParticles(ctx, cx, cy, radius, scale) {
    ctx.save();
    const apexY = cy + radius * 0.95;

    for (const part of window.cardiacEngine.particles) {
      let px = 0;
      let py = 0;

      if (!part.isSystemic) {
        // Venous Path (SVC -> RA -> Tricuspid -> RV -> Pulmonary Artery)
        ctx.fillStyle = `rgba(2, 132, 199, ${part.alpha})`;
        if (part.t < 0.3) {
          // Inflow into RA
          const sub = part.t / 0.3;
          px = cx - radius * 0.6 + part.offset;
          py = cy - radius * 0.7 + sub * radius * 0.5;
        } else if (part.t < 0.6) {
          // Flow through Tricuspid into RV
          const sub = (part.t - 0.3) / 0.3;
          px = cx - radius * 0.5 + sub * radius * 0.2 + part.offset * 0.5;
          py = cy + sub * radius * 0.6;
        } else {
          // Ejected up into Pulmonary Trunk
          const sub = (part.t - 0.6) / 0.4;
          px = cx - radius * 0.3 + sub * radius * 0.45 + part.offset * 0.4;
          py = (cy + radius * 0.6) - sub * radius * 1.1;
        }
      } else {
        // Arterial Path (Pulmonary Veins -> LA -> Mitral -> LV -> Aorta)
        ctx.fillStyle = `rgba(225, 29, 72, ${part.alpha})`;
        if (part.t < 0.3) {
          // Inflow into LA
          const sub = part.t / 0.3;
          px = cx + radius * 0.55 + part.offset;
          py = cy - radius * 0.6 + sub * radius * 0.45;
        } else if (part.t < 0.6) {
          // Flow through Mitral into LV
          const sub = (part.t - 0.3) / 0.3;
          px = cx + radius * 0.45 - sub * radius * 0.2 + part.offset * 0.5;
          py = cy + sub * radius * 0.65;
        } else {
          // Ejected through Aortic Valve into Arch
          const sub = (part.t - 0.6) / 0.4;
          px = (cx + radius * 0.25) - sub * radius * 0.4 + part.offset * 0.4;
          py = (cy + radius * 0.65) - sub * radius * 1.25;
        }
      }

      ctx.beginPath();
      ctx.arc(px, py, part.size * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawChamberLabels(ctx, cx, cy, radius, scale) {
    ctx.save();
    ctx.font = `700 ${Math.max(11, Math.round(13 * scale))}px 'Plus Jakarta Sans', sans-serif`;
    ctx.textAlign = 'center';

    // RA
    ctx.fillStyle = '#0369A1';
    ctx.fillText('Right Atrium', cx - radius * 0.5, cy - radius * 0.2);
    ctx.font = `500 ${Math.max(9, Math.round(10 * scale))}px 'JetBrains Mono', monospace`;
    ctx.fillText('Deoxygenated', cx - radius * 0.5, cy - radius * 0.12);

    // RV
    ctx.font = `700 ${Math.max(11, Math.round(13 * scale))}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillText('Right Ventricle', cx - radius * 0.4, cy + radius * 0.45);

    // LA
    ctx.fillStyle = '#BE123C';
    ctx.fillText('Left Atrium', cx + radius * 0.48, cy - radius * 0.2);
    ctx.font = `500 ${Math.max(9, Math.round(10 * scale))}px 'JetBrains Mono', monospace`;
    ctx.fillText('Oxygenated', cx + radius * 0.48, cy - radius * 0.12);

    // LV
    ctx.font = `700 ${Math.max(11, Math.round(13 * scale))}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillText('Left Ventricle', cx + radius * 0.42, cy + radius * 0.45);

    ctx.restore();
  }

  drawLandmarks(ctx, w, h) {
    ctx.save();
    for (const [key, lm] of Object.entries(this.landmarks)) {
      const lx = lm.xPct * w;
      const ly = lm.yPct * h;
      const isSelected = this.state.stethoscope.currentZone === key;

      // Pulsing target circle
      ctx.fillStyle = isSelected ? lm.color : 'rgba(255, 255, 255, 0.90)';
      ctx.strokeStyle = lm.color;
      ctx.lineWidth = isSelected ? 3 : 1.8;

      ctx.beginPath();
      ctx.arc(lx, ly, isSelected ? 18 : 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Badge letter
      ctx.fillStyle = isSelected ? '#FFFFFF' : lm.color;
      ctx.font = `700 12px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(key[0].toUpperCase(), lx, ly);

      // Tooltip pill below landmark
      if (isSelected) {
        ctx.font = `600 11px 'Plus Jakarta Sans', sans-serif`;
        const text = lm.name;
        const tw = ctx.measureText(text).width;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        this.roundRect(ctx, lx - tw * 0.5 - 8, ly + 22, tw + 16, 22, 4);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(text, lx, ly + 33);
      }
    }
    ctx.restore();
  }

  drawStethoscope(ctx, w, h) {
    ctx.save();
    const steth = this.state.stethoscope;
    const sx = steth.x * w;
    const sy = steth.y * h;

    // Acoustic wave concentric rings if sound active and over a landmark
    if (steth.currentZone && this.state.soundEnabled) {
      const p = this.state.phase;
      const ringRadius = 24 + ((p * 3) % 1) * 28;
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Flexible rubber tubing leading off to top right
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(sx + 50, sy - 80, w - 80, 40, w - 20, 20);
    ctx.stroke();

    // Metallic chrome connector
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.arc(sx, sy, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Outer rubber rim
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(sx, sy, 17, 0, Math.PI * 2);
    ctx.fill();

    // Inner diaphragm
    ctx.fillStyle = steth.currentZone ? '#E11D48' : '#CBD5E1';
    ctx.beginPath();
    ctx.arc(sx, sy, 11, 0, Math.PI * 2);
    ctx.fill();

    // Stethoscope Label
    ctx.fillStyle = '#0F172A';
    ctx.font = `600 11px 'Plus Jakarta Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🩺 Stethoscope', sx, sy + 32);

    ctx.restore();
  }

  drawWiggersOscilloscope(ctx, x, y, w, h) {
    ctx.save();

    // Backdrop
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    const topHeaderH = 26;
    const graphX = x + 10;
    const graphY = y + topHeaderH + 6;
    const graphW = w - 20;
    const graphH = h - topHeaderH - 16;
    const channelHeight = graphH / 4;

    // 1. Draw Phase Background Bands & Labels
    this.drawWiggersPhaseBands(ctx, graphX, y + 4, graphW, h - 14, topHeaderH);

    // 2. Channel 1: ECG Lead II Trace
    this.drawECGChannel(ctx, graphX, graphY, graphW, channelHeight);

    // 3. Channel 2: Pressures (LV, Aorta with dicrotic notch, LA)
    this.drawPressureChannel(ctx, graphX, graphY + channelHeight, graphW, channelHeight);

    // 4. Channel 3: Ventricular Volume
    this.drawVolumeChannel(ctx, graphX, graphY + channelHeight * 2, graphW, channelHeight);

    // 5. Channel 4: Phonocardiogram (PCG)
    this.drawPCGChannel(ctx, graphX, graphY + channelHeight * 3, graphW, channelHeight);

    // 6. Live Vertical Sweep Cursor showing current cardiac phase
    const currPhase = this.state.phase;
    const sweepX = graphX + graphW * currPhase;
    ctx.strokeStyle = '#E11D48';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(sweepX, graphY - 4);
    ctx.lineTo(sweepX, graphY + graphH);
    ctx.stroke();

    // Top cursor head with live phase tag
    ctx.fillStyle = '#E11D48';
    ctx.beginPath();
    ctx.arc(sweepX, graphY - 4, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawWiggersPhaseBands(ctx, gx, gy, gw, gh, headerH) {
    ctx.save();
    // 7 Phases boundaries: [startP, endP, name, isIsovolumetric]
    const phases = [
      { start: 0.00, end: 0.12, name: '1. Atrial Systole', iso: false },
      { start: 0.12, end: 0.18, name: '2. Isovol. Contr.', iso: true },
      { start: 0.18, end: 0.35, name: '3. Rapid Ejection', iso: false },
      { start: 0.35, end: 0.45, name: '4. Reduced Eject.', iso: false },
      { start: 0.45, end: 0.52, name: '5. Isovol. Relax.', iso: true },
      { start: 0.52, end: 0.70, name: '6. Rapid Filling', iso: false },
      { start: 0.70, end: 1.00, name: '7. Diastasis', iso: false }
    ];

    ctx.font = `700 ${Math.max(9, Math.min(11, Math.round(gw * 0.013)))}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const ph of phases) {
      const bx = gx + ph.start * gw;
      const bw = (ph.end - ph.start) * gw;

      // Alternating subtle column tint
      if (ph.iso) {
        ctx.fillStyle = 'rgba(254, 243, 199, 0.45)'; // Amber tint for all-valves-closed isovolumetric phases
      } else {
        ctx.fillStyle = (phases.indexOf(ph) % 2 === 0) ? 'rgba(248, 250, 252, 0.8)' : 'rgba(241, 245, 249, 0.4)';
      }
      ctx.fillRect(bx, gy + headerH, bw, gh - headerH);

      // Phase column header pill
      ctx.fillStyle = ph.iso ? '#B45309' : '#475569';
      ctx.fillText(ph.name, bx + bw * 0.5, gy + headerH * 0.5);

      // Vertical dashed boundary line
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(bx + bw, gy + headerH);
      ctx.lineTo(bx + bw, gy + gh);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Key Valve Event Labels at bottom
    ctx.font = `600 10px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillStyle = '#E11D48';
    ctx.fillText('AV Closes (S1)', gx + 0.12 * gw, gy + gh - 6);
    ctx.fillStyle = '#059669';
    ctx.fillText('SL Opens', gx + 0.18 * gw, gy + gh - 6);
    ctx.fillStyle = '#E11D48';
    ctx.fillText('SL Closes (S2)', gx + 0.48 * gw, gy + gh - 6);
    ctx.fillStyle = '#059669';
    ctx.fillText('AV Opens', gx + 0.54 * gw, gy + gh - 6);

    ctx.restore();
  }

  drawECGChannel(ctx, x, y, w, h) {
    ctx.save();
    ctx.fillStyle = '#059669';
    ctx.font = `700 11px 'JetBrains Mono', monospace`;
    ctx.fillText('ECG LEAD II (mV) [P, QRS, T]', x + 8, y + 13);

    // Baseline
    const midY = y + h * 0.65;
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, midY);
    ctx.lineTo(x + w, midY);
    ctx.stroke();

    // Plot Canonical Stable ECG curve across p = 0 to 1
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    const steps = 240;
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      const px = x + p * w;
      const val = window.cardiacEngine.calculateECG(p);
      const py = midY - val * (h * 0.42);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Glowing Current Phase Dot
    const currP = this.state.phase;
    const currVal = window.cardiacEngine.calculateECG(currP);
    const dotX = x + currP * w;
    const dotY = midY - currVal * (h * 0.42);
    ctx.fillStyle = '#10B981';
    ctx.shadowColor = '#059669';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Live Readout
    ctx.textAlign = 'right';
    ctx.fillText(`${this.state.metrics.ecgMv.toFixed(2)} mV`, x + w - 8, y + 13);
    ctx.restore();
  }

  drawPressureChannel(ctx, x, y, w, h) {
    ctx.save();
    ctx.fillStyle = '#0F172A';
    ctx.font = `700 11px 'JetBrains Mono', monospace`;
    ctx.fillText('PRESSURES (mmHg) — LV (Red), Aorta (Amber), LA (Blue)', x + 8, y + 13);

    const maxP = 140;
    const toY = (val) => y + h - 8 - (val / maxP) * (h - 22);

    const steps = 240;
    // LV Pressure curve
    ctx.strokeStyle = '#E11D48';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      const { lvP } = window.cardiacEngine.calculatePressures(p);
      const px = x + p * w;
      const py = toY(lvP);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Aortic Pressure curve (with Dicrotic Notch)
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      const { aoP } = window.cardiacEngine.calculatePressures(p);
      const px = x + p * w;
      const py = toY(aoP);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // LA Pressure curve
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      const { laP } = window.cardiacEngine.calculatePressures(p);
      const px = x + p * w;
      const py = toY(laP);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Glowing Current Phase Dots
    const currP = this.state.phase;
    const { lvP, aoP } = window.cardiacEngine.calculatePressures(currP);
    const dotX = x + currP * w;
    ctx.fillStyle = '#E11D48';
    ctx.beginPath();
    ctx.arc(dotX, toY(lvP), 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.arc(dotX, toY(aoP), 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Live Readouts
    ctx.textAlign = 'right';
    ctx.fillStyle = '#E11D48';
    ctx.fillText(`LV: ${this.state.metrics.lvPressure} mmHg | Ao: ${this.state.metrics.aorticPressure} mmHg`, x + w - 8, y + 13);
    ctx.restore();
  }

  drawVolumeChannel(ctx, x, y, w, h) {
    ctx.save();
    ctx.fillStyle = '#7C3AED';
    ctx.font = `700 11px 'JetBrains Mono', monospace`;
    ctx.fillText('VENTRICULAR VOLUME (mL) [EDV -> ESV]', x + 8, y + 13);

    const maxVol = 160;
    const minVol = 20;
    const toY = (val) => y + h - 8 - ((val - minVol) / (maxVol - minVol)) * (h - 22);

    const steps = 240;
    ctx.strokeStyle = '#7C3AED';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      const vol = window.cardiacEngine.calculateVolume(p);
      const px = x + p * w;
      const py = toY(vol);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Current phase dot
    const currP = this.state.phase;
    const currVol = window.cardiacEngine.calculateVolume(currP);
    ctx.fillStyle = '#7C3AED';
    ctx.beginPath();
    ctx.arc(x + currP * w, toY(currVol), 4, 0, Math.PI * 2);
    ctx.fill();

    // Live Readout
    ctx.textAlign = 'right';
    ctx.fillText(`Vol: ${Math.round(currVol)} mL (EDV ${this.state.metrics.edv} / ESV ${this.state.metrics.esv})`, x + w - 8, y + 13);
    ctx.restore();
  }

  drawPCGChannel(ctx, x, y, w, h) {
    ctx.save();
    ctx.fillStyle = '#0284C7';
    ctx.font = `700 11px 'JetBrains Mono', monospace`;
    ctx.fillText('PHONOCARDIOGRAM (PCG) — S1 ("LUB") & S2 ("DUB")', x + 8, y + 13);

    const midY = y + h * 0.55;
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, midY);
    ctx.lineTo(x + w, midY);
    ctx.stroke();

    const steps = 240;
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      const pcg = window.cardiacEngine.calculatePCG(p);
      const px = x + p * w;
      const py = midY - pcg * (h * 0.38);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.restore();
  }

  drawAuscultationBench(ctx, w, h) {
    ctx.save();
    // Anatomical chest cage outline backdrop
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    this.roundRect(ctx, w * 0.15, h * 0.12, w * 0.7, h * 0.76, 24);
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Sternum & Rib contours
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    // Sternum bone in midline
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.18);
    ctx.lineTo(w * 0.5, h * 0.65);
    ctx.stroke();

    // Clavicles
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(w * 0.28, h * 0.20);
    ctx.lineTo(w * 0.5, h * 0.18);
    ctx.lineTo(w * 0.72, h * 0.20);
    ctx.stroke();

    // Instructions banner
    ctx.fillStyle = '#0F172A';
    ctx.font = `700 14px 'Plus Jakarta Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Interactive Cardiac Auscultation Bench', w * 0.5, h * 0.18);
    ctx.font = `500 12px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillStyle = '#475569';
    ctx.fillText('Drag the stethoscope bell onto the 4 anatomical valve listening posts (A, P, T, M)', w * 0.5, h * 0.22);

    ctx.restore();
  }

  roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

// Attach renderer to window
window.CardiacRenderer = CardiacRenderer;
