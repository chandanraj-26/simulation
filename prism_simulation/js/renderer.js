/**
 * PhysicsLab - High-DPI 2D Canvas Optics & Dispersion Renderer
 * Produces crisp, luminous visual ray tracing with glass caustics, rainbows, and angle arcs.
 */
window.PhysicsLab = window.PhysicsLab || {};

(function(lab) {
  const $ = id => lab.$(id);
  const vec = lab.vec;

  let canvas, ctx;
  let dpr = 1;

  // Preload torch.png for light source
  const torchImg = new Image();
  torchImg.src = 'torch.png';
  let torchLoaded = false;
  torchImg.onload = function() {
    torchLoaded = true;
    if (lab.drawScene) lab.drawScene();
  };

  lab.initRenderer = function() {
    canvas = $('simCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    lab.resizeCanvas();
  };

  lab.resizeCanvas = function() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    if (ctx) ctx.scale(dpr, dpr);
  };

  // Main Draw Scene Entry Point
  lab.drawScene = function() {
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // Reset transform & clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    // Subtle background grid
    drawBackgroundGrid(w, h);

    // Solve ray optics for current state
    const optics = lab.solveOptics(w, h);
    const cfg = lab.getConfig();

    // 1. Draw Protractor Overlay if toggled
    if (cfg.showProtractor && optics.targetPt) {
      drawProtractor(optics.targetPt, optics.prism.norm1);
    }

    // 2. Draw Triangular Glass Prism
    drawPrism(optics.prism, cfg);

    // 3. Draw Observation Screen on the right
    if (cfg.showScreen) {
      drawObservationScreen(optics.screenTop, optics.screenBottom, optics.traces, cfg);
    }

    // 4. Draw Normal Lines (N1, N2)
    if (cfg.showNormals && optics.midTrace && optics.midTrace.hasHit) {
      drawNormals(optics);
    }

    // 5. Draw Light Rays (Incident, Refracted, Emergent, TIR)
    if (cfg.beamActive) {
      drawLightRays(optics, cfg);
    }

    // 6. Draw Virtual Extended Rays & Deviation Angle
    if (cfg.beamActive && cfg.showVirtualRays && optics.midTrace && optics.midTrace.hasHit && !optics.midTrace.isTIR) {
      drawVirtualDeviationRays(optics);
    }

    // 7. Draw Angle Arcs & Labels (i, r1, r2, e, delta, A)
    if (cfg.beamActive && cfg.showAngles && optics.midTrace && optics.midTrace.hasHit) {
      drawAngleArcs(optics);
    }

    // 8. Draw Light Source (Torch / Laser Collimator)
    drawTorch(optics.torchPos, optics.targetPt, cfg);

    // 9. Update live status badge
    updateStatusBadge(optics);
  };

  // Subtle Cartesian / optical bench grid
  function drawBackgroundGrid(w, h) {
    ctx.save();
    ctx.strokeStyle = '#edf2f7';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Draw Triangular Glass Prism
  function drawPrism(prism, cfg) {
    const { top, left, right } = prism;

    ctx.save();

    // Prism Glass Shadow
    ctx.shadowColor = 'rgba(37, 99, 235, 0.12)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 12;

    // Prism Body Gradient (Crystal Glass Refraction appearance)
    const grad = ctx.createLinearGradient(left.x, left.y, right.x, top.y);
    if (cfg.materialKey === 'diamond') {
      grad.addColorStop(0, 'rgba(238, 242, 255, 0.72)');
      grad.addColorStop(0.5, 'rgba(224, 231, 255, 0.55)');
      grad.addColorStop(1, 'rgba(219, 234, 254, 0.80)');
    } else if (cfg.materialKey === 'water') {
      grad.addColorStop(0, 'rgba(224, 242, 254, 0.50)');
      grad.addColorStop(0.5, 'rgba(240, 249, 255, 0.40)');
      grad.addColorStop(1, 'rgba(186, 230, 253, 0.55)');
    } else {
      // Crown & Flint Glass
      grad.addColorStop(0, 'rgba(241, 245, 249, 0.65)');
      grad.addColorStop(0.3, 'rgba(224, 242, 254, 0.45)');
      grad.addColorStop(0.7, 'rgba(238, 242, 255, 0.45)');
      grad.addColorStop(1, 'rgba(226, 232, 240, 0.70)');
    }

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(right.x, right.y);
    ctx.lineTo(left.x, left.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Prism Internal Facet Highlights (Bevel & Optical Polish lines)
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(top.x, top.y + 3);
    ctx.lineTo(left.x + 3, left.y - 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(147, 197, 253, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(top.x, (left.y + top.y) / 2);
    ctx.stroke();

    // Face Labels (Face 1: AB, Face 2: AC, Base: BC)
    ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Face 1 (Incident)', (left.x + top.x) / 2 - 50, (left.y * 0.4 + top.y * 0.6) - 10);
    ctx.fillText('Face 2 (Emergent)', (right.x + top.x) / 2 + 10, (right.y * 0.4 + top.y * 0.6) - 10);
    ctx.fillText('Base', top.x - 12, left.y + 16);

    // Apex Angle A Indicator at Top
    ctx.beginPath();
    ctx.arc(top.x, top.y, 28, Math.PI / 2 - prism.halfApexRad, Math.PI / 2 + prism.halfApexRad, false);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.font = '700 12px JetBrains Mono, monospace';
    ctx.fillStyle = '#1d4ed8';
    ctx.textAlign = 'center';
    ctx.fillText(`A = ${Math.round(cfg.prismAngle)}°`, top.x, top.y + 44);

    ctx.restore();
  }

  // Draw Observation Screen on the right with Magnified VIBGYOR Detector Card
  function drawObservationScreen(screenTop, screenBottom, traces, cfg) {
    ctx.save();

    const x = screenTop.x;
    const yTop = screenTop.y;
    const yBot = screenBottom.y;
    const h = yBot - yTop;

    // Screen stand / vertical bar
    ctx.fillStyle = '#334155';
    ctx.fillRect(x - 4, yTop - 10, 8, h + 20);

    // Screen Front Surface (White reflective board)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.fillRect(x - 3, yTop, 6, h);
    ctx.strokeRect(x - 3, yTop, 6, h);

    // Base feet of screen
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 22, yBot + 10, 44, 8);

    // Title label
    ctx.font = '700 12px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.fillText('Observation Screen', x, yTop - 16);

    const hits = traces.filter(t => t.screenHit).map(t => ({
      y: t.screenHit.y,
      color: t.color,
      name: t.name || `${cfg.wavelength}nm`,
      wl: t.wavelength
    }));

    if (hits.length > 1) {
      // Sort from top to bottom (Red to Violet as they arrive)
      hits.sort((a, b) => a.y - b.y);

      const minY = hits[0].y;
      const maxY = hits[hits.length - 1].y;
      const specH = Math.max(28, maxY - minY + 18);

      // 1. Rainbow band on the screen bar surface itself
      const specGrad = ctx.createLinearGradient(0, minY - 6, 0, maxY + 6);
      hits.forEach(h => {
        const stop = (h.y - (minY - 6)) / (specH || 1);
        specGrad.addColorStop(Math.max(0, Math.min(1, stop)), h.color);
      });

      ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
      ctx.shadowBlur = 14;
      ctx.fillStyle = specGrad;
      ctx.fillRect(x - 8, minY - 6, 16, specH);
      ctx.shadowBlur = 0;

      // Draw dot ticks on the screen where each ray hits
      hits.forEach(h => {
        ctx.fillStyle = h.color;
        ctx.beginPath();
        ctx.arc(x, h.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Magnified VIBGYOR Screen Detector Panel (Directly to the right of the screen)
      const detX = x + 24;
      const detW = 195;
      const rowH = 26;
      const detH = 46 + hits.length * rowH + 12;
      const hitCenterY = (minY + maxY) / 2;
      const detY = Math.max(yTop + 10, Math.min(yBot - detH - 10, hitCenterY - detH / 2));

      // Projection Guidelines from screen to detector card
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#ef4444'; // Red line
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x + 8, minY);
      ctx.lineTo(detX, detY + 48 + rowH * 0.5);
      ctx.stroke();

      ctx.strokeStyle = '#7e22ce'; // Violet line
      ctx.beginPath();
      ctx.moveTo(x + 8, maxY);
      ctx.lineTo(detX, detY + 48 + (hits.length - 0.5) * rowH);
      ctx.stroke();
      ctx.restore();

      // Detector Card Background (Frosted Glass container)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 4;
      ctx.strokeStyle = '#bfdbfe';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(detX, detY, detW, detH, 12);
      ctx.fill();
      ctx.stroke();
      ctx.shadowColor = 'transparent';

      // Header inside Card
      ctx.fillStyle = '#1e293b';
      ctx.font = '800 12.5px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🌈 VIBGYOR SPECTRUM', detX + 12, detY + 22);

      ctx.fillStyle = '#64748b';
      ctx.font = '600 10.5px Plus Jakarta Sans, sans-serif';
      ctx.fillText('Screen Projection Readout', detX + 12, detY + 37);

      // Divider line
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(detX + 10, detY + 42);
      ctx.lineTo(detX + detW - 10, detY + 42);
      ctx.stroke();

      // VIBGYOR letter mapping
      const letterMap = {
        'Red': { letter: 'R', note: 'Least Bent' },
        'Orange': { letter: 'O', note: '' },
        'Yellow': { letter: 'Y', note: '' },
        'Green': { letter: 'G', note: '' },
        'Blue': { letter: 'B', note: '' },
        'Indigo': { letter: 'I', note: '' },
        'Violet': { letter: 'V', note: 'Most Bent' }
      };

      // 7 Color Rows
      hits.forEach((h, idx) => {
        const ry = detY + 48 + idx * rowH;
        const meta = letterMap[h.name] || { letter: '•', note: '' };

        // Color Swatch Pill
        ctx.fillStyle = h.color;
        ctx.beginPath();
        ctx.roundRect(detX + 10, ry + 2, 22, 20, 5);
        ctx.fill();

        // White Letter inside swatch
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 11px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(meta.letter, detX + 21, ry + 16);

        // Color Name & Wavelength
        ctx.font = '700 11.5px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'left';
        ctx.fillText(`${h.name} (${h.wl}nm)`, detX + 38, ry + 16);

        // Note (Least bent / Most bent)
        if (meta.note) {
          ctx.font = '700 9.5px JetBrains Mono, monospace';
          ctx.fillStyle = meta.letter === 'R' ? '#dc2626' : '#7e22ce';
          ctx.textAlign = 'right';
          ctx.fillText(meta.note, detX + detW - 10, ry + 16);
        }
      });

    } else if (hits.length === 1) {
      // Single laser spot
      const spot = hits[0];
      ctx.shadowColor = spot.color;
      ctx.shadowBlur = 18;
      ctx.fillStyle = spot.color;
      ctx.beginPath();
      ctx.arc(x, spot.y, 7, 0, Math.PI * 2);
      ctx.fill();

      // Detector Card for Laser
      const detX = x + 24;
      const detW = 190;
      const detH = 95;
      const detY = Math.max(yTop + 10, Math.min(yBot - detH - 10, spot.y - detH / 2));

      // Guideline
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = spot.color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x + 8, spot.y);
      ctx.lineTo(detX, spot.y);
      ctx.stroke();
      ctx.restore();

      // Card
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(15, 23, 42, 0.1)';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = '#bfdbfe';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(detX, detY, detW, detH, 12);
      ctx.fill();
      ctx.stroke();
      ctx.shadowColor = 'transparent';

      // Header
      ctx.fillStyle = '#1e293b';
      ctx.font = '800 12.5px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🔴 LASER SPOT DETECTOR', detX + 12, detY + 22);

      // Swatch + details
      ctx.fillStyle = spot.color;
      ctx.beginPath();
      ctx.arc(detX + 24, detY + 54, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = '700 12.5px JetBrains Mono, monospace';
      ctx.fillText(`λ = ${cfg.wavelength} nm`, detX + 44, detY + 52);

      ctx.fillStyle = '#64748b';
      ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
      ctx.fillText(`Monochromatic Light`, detX + 44, detY + 68);

    } else if (lab.state.telemetry.isTIR) {
      // Total Internal Reflection Alert
      const detX = x + 24;
      const detW = 190;
      const detH = 75;
      const detY = (yTop + yBot) / 2 - detH / 2;

      ctx.fillStyle = '#fef2f2';
      ctx.strokeStyle = '#fecaca';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(detX, detY, detW, detH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#dc2626';
      ctx.font = '800 12.5px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('⚠️ NO LIGHT ON SCREEN', detX + 12, detY + 28);

      ctx.fillStyle = '#991b1b';
      ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
      ctx.fillText('100% Total Internal Reflection', detX + 12, detY + 48);
      ctx.fillText('inside prism (r₂ > θ_c)', detX + 12, detY + 62);
    }

    ctx.restore();
  }

  // Draw Normal Lines (N1 at Face 1, N2 at Face 2)
  function drawNormals(optics) {
    const { midTrace, prism } = optics;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;

    // Normal 1 at P1
    if (midTrace.P1) {
      const p1 = midTrace.P1;
      const n1 = prism.norm1;
      const len = 70;
      ctx.beginPath();
      ctx.moveTo(p1.x - n1.x * len, p1.y - n1.y * len);
      ctx.lineTo(p1.x + n1.x * len, p1.y + n1.y * len);
      ctx.stroke();

      // Label N1
      ctx.font = '700 11.5px JetBrains Mono, monospace';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText('N₁', p1.x + n1.x * (len + 12), p1.y + n1.y * (len + 12));
    }

    // Normal 2 at P2
    if (midTrace.P2) {
      const p2 = midTrace.P2;
      const n2 = prism.norm2;
      const len = 70;
      ctx.beginPath();
      ctx.moveTo(p2.x - n2.x * len, p2.y - n2.y * len);
      ctx.lineTo(p2.x + n2.x * len, p2.y + n2.y * len);
      ctx.stroke();

      // Label N2
      ctx.font = '700 11.5px JetBrains Mono, monospace';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText('N₂', p2.x + n2.x * (len + 12), p2.y + n2.y * (len + 12));
    }

    ctx.restore();
  }

  // Draw Light Rays (Incident, Refracted, Emergent, Dispersion Fan)
  function drawLightRays(optics, cfg) {
    const { traces, torchPos, targetPt } = optics;
    ctx.save();

    // If White Light: Draw continuous rainbow polygon between rays for smooth photorealistic dispersion!
    if (cfg.lightType === 'white' && traces.length >= 2) {
      const firstTrace = traces[0];
      const lastTrace = traces[traces.length - 1];

      // Draw dispersion fan polygon inside prism (P1 to Face 2)
      if (firstTrace.P1 && firstTrace.P2 && lastTrace.P2) {
        const polyGrad = ctx.createLinearGradient(firstTrace.P2.x, firstTrace.P2.y, lastTrace.P2.x, lastTrace.P2.y);
        polyGrad.addColorStop(0, 'rgba(126, 34, 206, 0.25)'); // Violet
        polyGrad.addColorStop(1, 'rgba(220, 38, 38, 0.25)');  // Red

        ctx.fillStyle = polyGrad;
        ctx.beginPath();
        ctx.moveTo(firstTrace.P1.x, firstTrace.P1.y);
        for (let i = 0; i < traces.length; i++) {
          if (traces[i].P2) ctx.lineTo(traces[i].P2.x, traces[i].P2.y);
        }
        ctx.closePath();
        ctx.fill();
      }

      // Draw emergent dispersion fan polygon heading to observation screen
      if (firstTrace.screenHit && lastTrace.screenHit && firstTrace.P2 && lastTrace.P2) {
        const fanGrad = ctx.createLinearGradient(0, firstTrace.screenHit.y, 0, lastTrace.screenHit.y);
        fanGrad.addColorStop(0, 'rgba(126, 34, 206, 0.35)');
        fanGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.35)');
        fanGrad.addColorStop(1, 'rgba(220, 38, 38, 0.35)');

        ctx.fillStyle = fanGrad;
        ctx.beginPath();
        ctx.moveTo(firstTrace.P2.x, firstTrace.P2.y);
        ctx.lineTo(firstTrace.screenHit.x, firstTrace.screenHit.y);
        ctx.lineTo(lastTrace.screenHit.x, lastTrace.screenHit.y);
        ctx.lineTo(lastTrace.P2.x, lastTrace.P2.y);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Incident Beam from Torch to Face 1
    const incStart = torchPos;
    const incEnd = targetPt;
    const isLaser = (cfg.lightType === 'laser');

    ctx.lineCap = 'round';

    if (isLaser) {
      const laserColor = lab.wavelengthToRGB(cfg.wavelength).hex;
      // Laser core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(incStart.x, incStart.y);
      ctx.lineTo(incEnd.x, incEnd.y);
      ctx.stroke();

      // Laser glow
      ctx.shadowColor = laserColor;
      ctx.shadowBlur = 14;
      ctx.strokeStyle = laserColor;
      ctx.lineWidth = 4;
      ctx.stroke();
    } else {
      // White light incident collimated beam
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(incStart.x, incStart.y);
      ctx.lineTo(incEnd.x, incEnd.y);
      ctx.stroke();

      // Border contour for visibility on light background
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw individual spectral traces (Refracted & Emergent rays)
    traces.forEach(trace => {
      trace.segments.forEach(seg => {
        if (seg.type === 'incident') return; // already drawn above

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(seg.start.x, seg.start.y);
        ctx.lineTo(seg.end.x, seg.end.y);

        if (seg.type === 'tir') {
          // Total internal reflection ray: Glowing danger warning style
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;
          ctx.stroke();
        } else if (isLaser) {
          ctx.strokeStyle = trace.color;
          ctx.lineWidth = 3.2;
          ctx.shadowColor = trace.color;
          ctx.shadowBlur = 12;
          ctx.stroke();
        } else {
          // White Light dispersion bands
          ctx.strokeStyle = trace.color;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = trace.color;
          ctx.shadowBlur = 8;
          ctx.stroke();
        }
        ctx.restore();
      });
    });

    ctx.restore();
  }

  // Draw Virtual Extended Rays & Angle of Deviation δ
  function drawVirtualDeviationRays(optics) {
    const { midTrace, targetPt, torchPos } = optics;
    if (!midTrace.P2 || !midTrace.emergentDir) return;

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;

    // Forward extension of Incident Ray: targetPt + t * incidentDir
    const incDir = optics.actualDir;
    const extIncEnd = vec.add(targetPt, vec.mul(incDir, 320));

    ctx.beginPath();
    ctx.moveTo(targetPt.x, targetPt.y);
    ctx.lineTo(extIncEnd.x, extIncEnd.y);
    ctx.stroke();

    // Backward extension of Emergent Ray: P2 - t * emergentDir
    const emDir = midTrace.emergentDir;
    const extEmStart = vec.sub(midTrace.P2, vec.mul(emDir, 280));

    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(midTrace.P2.x, midTrace.P2.y);
    ctx.lineTo(extEmStart.x, extEmStart.y);
    ctx.stroke();

    // Find intersection vertex Q of extended incident and emergent rays
    // Ray 1: targetPt + t * incDir
    // Ray 2: P2 - u * emDir
    const A = targetPt;
    const B = extIncEnd;
    const C = extEmStart;
    const D = midTrace.P2;

    const denom = (B.x - A.x) * (D.y - C.y) - (B.y - A.y) * (D.x - C.x);
    if (Math.abs(denom) > 1e-6) {
      const t = ((C.x - A.x) * (D.y - C.y) - (C.y - A.y) * (D.x - C.x)) / denom;
      const Q = {
        x: A.x + t * (B.x - A.x),
        y: A.y + t * (B.y - A.y)
      };

      // Draw Deviation Vertex Dot
      ctx.setLineDash([]);
      ctx.fillStyle = '#7c3aed';
      ctx.beginPath();
      ctx.arc(Q.x, Q.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Deviation Angle Arc δ
      const angleInc = Math.atan2(incDir.y, incDir.x);
      const angleEm = Math.atan2(emDir.y, emDir.x);

      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 2.2;
      drawShortestArc(ctx, Q.x, Q.y, 32, angleInc, angleEm);

      // Label δ
      const deltaDeg = Math.round(midTrace.deltaDeg || 0);
      ctx.font = '700 12.5px JetBrains Mono, monospace';
      ctx.fillStyle = '#7c3aed';
      ctx.textAlign = 'left';
      ctx.fillText(`δ = ${deltaDeg}°`, Q.x + 38, Q.y - 6);
    }

    ctx.restore();
  }

  // Draw shortest angle arc helper
  function drawShortestArc(ctx, x, y, r, a1, a2) {
    let diff = a2 - a1;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    const anticlockwise = diff < 0;
    ctx.beginPath();
    ctx.arc(x, y, r, a1, a1 + diff, anticlockwise);
    ctx.stroke();
  }

  // Draw Angle Arcs & Values (i, r1, r2, e)
  function drawAngleArcs(optics) {
    const { midTrace, prism } = optics;
    if (!midTrace.P1) return;

    ctx.save();
    ctx.lineWidth = 1.8;

    // Angle of Incidence i at P1
    const p1 = midTrace.P1;
    const n1 = prism.norm1;
    const incDir = optics.actualDir;

    const angleN1 = Math.atan2(n1.y, n1.x);
    const angleRayFromTorch = Math.atan2(-incDir.y, -incDir.x);

    ctx.strokeStyle = '#059669';
    drawShortestArc(ctx, p1.x, p1.y, 32, angleN1, angleRayFromTorch);

    ctx.font = '700 11.5px JetBrains Mono, monospace';
    ctx.fillStyle = '#059669';
    ctx.textAlign = 'right';
    ctx.fillText(`i = ${Math.round(midTrace.iDeg)}°`, p1.x - 34, p1.y - 12);

    // Angle of Refraction r1 at P1
    if (midTrace.P2) {
      const angleInPrism = Math.atan2(midTrace.P2.y - p1.y, midTrace.P2.x - p1.x);
      const angleInNormal = Math.atan2(-n1.y, -n1.x);

      ctx.strokeStyle = '#0284c7';
      drawShortestArc(ctx, p1.x, p1.y, 24, angleInNormal, angleInPrism);

      ctx.fillStyle = '#0284c7';
      ctx.textAlign = 'left';
      ctx.fillText(`r₁ = ${Math.round(midTrace.r1Deg)}°`, p1.x + 12, p1.y + 26);
    }

    // Angle r2 and e at P2
    if (midTrace.P2 && !midTrace.isTIR && midTrace.eDeg !== null) {
      const p2 = midTrace.P2;
      const n2 = prism.norm2;
      const emDir = midTrace.emergentDir;

      const angleN2 = Math.atan2(n2.y, n2.x);
      const angleEm = Math.atan2(emDir.y, emDir.x);

      // Emergence Angle e
      ctx.strokeStyle = '#d97706';
      drawShortestArc(ctx, p2.x, p2.y, 32, angleN2, angleEm);

      ctx.fillStyle = '#d97706';
      ctx.textAlign = 'left';
      ctx.fillText(`e = ${Math.round(midTrace.eDeg)}°`, p2.x + 36, p2.y - 10);

      // Internal Angle r2
      const angleInNormal2 = Math.atan2(-n2.y, -n2.x);
      const angleFromP1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);

      ctx.strokeStyle = '#0284c7';
      drawShortestArc(ctx, p2.x, p2.y, 24, angleInNormal2, angleFromP1);

      ctx.fillStyle = '#0284c7';
      ctx.textAlign = 'right';
      ctx.fillText(`r₂ = ${Math.round(midTrace.r2Deg)}°`, p2.x - 12, p2.y + 24);
    }

    ctx.restore();
  }

  // Draw Light Source (Torch using torch.png)
  function drawTorch(pos, targetPt, cfg) {
    ctx.save();
    const dir = vec.norm(vec.sub(targetPt, pos));
    const angle = Math.atan2(dir.y, dir.x);

    ctx.translate(pos.x, pos.y);
    ctx.rotate(angle);

    const isLaser = (cfg.lightType === 'laser');
    const beamColor = isLaser ? lab.wavelengthToRGB(cfg.wavelength).hex : '#ffffff';

    if (torchImg.complete && torchImg.naturalWidth > 0) {
      const drawW = 126;
      const aspect = torchImg.naturalHeight / torchImg.naturalWidth;
      const drawH = drawW * aspect;
      const scale = drawW / torchImg.naturalWidth;

      // Lens aperture in torch.png coordinates is at x=825, y=444
      const offsetX = -825 * scale;
      const offsetY = -444 * scale;

      // Draggable hover ring around the torch handle/body
      ctx.save();
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(-58, 0, 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Draw torch image
      ctx.drawImage(torchImg, offsetX, offsetY, drawW, drawH);

      // Active illuminated lens emitter highlight
      if (cfg.beamActive) {
        ctx.save();
        ctx.fillStyle = beamColor;
        ctx.shadowColor = beamColor;
        ctx.shadowBlur = isLaser ? 20 : 16;

        // Glowing lens aperture ellipse
        ctx.beginPath();
        ctx.ellipse(0, 0, 3.5, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Forward emission bloom
        const bloom = ctx.createRadialGradient(0, 0, 1, 4, 0, 16);
        bloom.addColorStop(0, beamColor);
        bloom.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = bloom;
        ctx.beginPath();
        ctx.arc(3, 0, 16, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        ctx.restore();
      }
    } else {
      // Fallback vector collimator while image is loading
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-45, -12, 45, 24);
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(12, -10);
      ctx.lineTo(12, 10);
      ctx.lineTo(0, 16);
      ctx.closePath();
      ctx.fill();

      const lensColor = isLaser ? beamColor : '#ffffff';
      ctx.fillStyle = lensColor;
      ctx.shadowColor = lensColor;
      ctx.shadowBlur = 14;
      ctx.fillRect(12, -8, 4, 16);
    }

    ctx.restore();
  }

  // Draw Protractor Overlay
  function drawProtractor(center, normal) {
    ctx.save();
    ctx.translate(center.x, center.y);
    const normAngle = Math.atan2(normal.y, normal.x);
    ctx.rotate(normAngle);

    const r = 90;

    // Semi-transparent protractor disc
    ctx.fillStyle = 'rgba(238, 242, 255, 0.35)';
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Degree tick marks
    ctx.strokeStyle = '#64748b';
    ctx.fillStyle = '#64748b';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';

    for (let deg = -90; deg <= 90; deg += 10) {
      const rad = (deg * Math.PI) / 180.0;
      const isMajor = deg % 30 === 0;
      const tickLen = isMajor ? 8 : 4;
      const x1 = Math.cos(rad) * r;
      const y1 = Math.sin(rad) * r;
      const x2 = Math.cos(rad) * (r - tickLen);
      const y2 = Math.sin(rad) * (r - tickLen);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      if (isMajor && deg !== -90 && deg !== 90) {
        const lx = Math.cos(rad) * (r - 18);
        const ly = Math.sin(rad) * (r - 18);
        ctx.fillText(`${Math.abs(deg)}°`, lx, ly + 3);
      }
    }

    ctx.restore();
  }

  // Live status badge updater
  function updateStatusBadge(optics) {
    const badge = $('simStatus');
    if (!badge) return;

    if (optics.midTrace && optics.midTrace.isTIR) {
      badge.textContent = '🪞 TOTAL INTERNAL REFLECTION (TIR)';
      badge.className = 'stage-status-badge tir';
    } else if (lab.state.telemetry.isMinDev) {
      badge.textContent = '🎯 MINIMUM DEVIATION REACHED (i = e)';
      badge.className = 'stage-status-badge min-dev';
    } else if (lab.state.beamActive) {
      badge.textContent = '⚡ RAY TRACING ACTIVE';
      badge.className = 'stage-status-badge active';
    } else {
      badge.textContent = 'READY';
      badge.className = 'stage-status-badge';
    }
  }

})(window.PhysicsLab);
