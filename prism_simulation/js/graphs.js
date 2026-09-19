/**
 * PhysicsLab - Real-Time Optical Analytics & Graphs
 * Plots Angle of Deviation δ(i) curve, Cauchy Dispersion n(λ) curve, and exports CSV.
 */
window.PhysicsLab = window.PhysicsLab || {};

(function(lab) {
  const $ = id => lab.$(id);

  let canvasDelta, ctxDelta;
  let canvasCauchy, ctxCauchy;
  let dpr = 1;

  lab.initGraphs = function() {
    canvasDelta = $('graphCanvasDelta');
    canvasCauchy = $('graphCanvasCauchy');
    lab.resizeGraphs();
  };

  lab.resizeGraphs = function() {
    dpr = window.devicePixelRatio || 1;
    [canvasDelta, canvasCauchy].forEach(can => {
      if (!can) return;
      const rect = can.getBoundingClientRect();
      can.width = Math.round(rect.width * dpr);
      can.height = Math.round(rect.height * dpr);
    });
  };

  lab.drawGraphs = function() {
    drawDeltaVsIGraph();
    drawCauchyGraph();
    updateSpectrometerStats();
  };

  // 1. Graph: Deviation δ vs Angle of Incidence i
  function drawDeltaVsIGraph() {
    if (!canvasDelta) return;
    ctxDelta = canvasDelta.getContext('2d');
    if (!ctxDelta) return;

    const w = canvasDelta.width / dpr;
    const h = canvasDelta.height / dpr;

    ctxDelta.setTransform(1, 0, 0, 1, 0, 0);
    ctxDelta.clearRect(0, 0, canvasDelta.width, canvasDelta.height);
    ctxDelta.scale(dpr, dpr);

    const padL = 50, padR = 20, padT = 30, padB = 40;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Background
    ctxDelta.fillStyle = '#f8fafc';
    ctxDelta.fillRect(0, 0, w, h);

    // Grid lines
    ctxDelta.strokeStyle = '#e2e8f0';
    ctxDelta.lineWidth = 1;
    ctxDelta.font = '10.5px JetBrains Mono, monospace';
    ctxDelta.fillStyle = '#64748b';

    // X-axis: Incidence i (0° to 90°)
    for (let i = 0; i <= 90; i += 15) {
      const x = padL + (i / 90) * plotW;
      ctxDelta.beginPath();
      ctxDelta.moveTo(x, padT);
      ctxDelta.lineTo(x, padT + plotH);
      ctxDelta.stroke();
      ctxDelta.textAlign = 'center';
      ctxDelta.fillText(`${i}°`, x, padT + plotH + 16);
    }

    // Y-axis: Deviation δ (20° to 80°)
    const minD = 20, maxD = 80;
    for (let d = minD; d <= maxD; d += 15) {
      const y = padT + plotH - ((d - minD) / (maxD - minD)) * plotH;
      ctxDelta.beginPath();
      ctxDelta.moveTo(padL, y);
      ctxDelta.lineTo(padL + plotW, y);
      ctxDelta.stroke();
      ctxDelta.textAlign = 'right';
      ctxDelta.fillText(`${d}°`, padL - 8, y + 4);
    }

    // Axis Labels
    ctxDelta.font = '700 11.5px Plus Jakarta Sans, sans-serif';
    ctxDelta.fillStyle = '#0f172a';
    ctxDelta.textAlign = 'center';
    ctxDelta.fillText('Angle of Incidence i (°)', padL + plotW / 2, h - 8);

    ctxDelta.save();
    ctxDelta.translate(14, padT + plotH / 2);
    ctxDelta.rotate(-Math.PI / 2);
    ctxDelta.fillText('Deviation δ (°)', 0, 0);
    ctxDelta.restore();

    // Plot Theoretical δ(i) Curve
    const curve = lab.generateDeltaVsICurve();
    ctxDelta.beginPath();
    let started = false;

    curve.forEach(pt => {
      if (pt.delta === null || pt.delta < minD || pt.delta > maxD) {
        started = false;
        return;
      }
      const x = padL + (pt.i / 90) * plotW;
      const y = padT + plotH - ((pt.delta - minD) / (maxD - minD)) * plotH;

      if (!started) {
        ctxDelta.moveTo(x, y);
        started = true;
      } else {
        ctxDelta.lineTo(x, y);
      }
    });

    ctxDelta.strokeStyle = '#2563eb';
    ctxDelta.lineWidth = 2.5;
    ctxDelta.stroke();

    // Mark Minimum Deviation Point (D_min, i_min)
    const tel = lab.state.telemetry;
    const cfg = lab.getConfig();
    const sinHalfA = Math.sin((cfg.prismAngle * Math.PI) / 360.0);
    const sinTerm = cfg.n * sinHalfA;

    if (sinTerm <= 1.0) {
      const dMin = (2.0 * Math.asin(sinTerm) - (cfg.prismAngle * Math.PI) / 180.0) * (180.0 / Math.PI);
      const iMin = (cfg.prismAngle + dMin) / 2.0;

      if (dMin >= minD && dMin <= maxD && iMin <= 90) {
        const mx = padL + (iMin / 90) * plotW;
        const my = padT + plotH - ((dMin - minD) / (maxD - minD)) * plotH;

        // Dashed drop lines
        ctxDelta.save();
        ctxDelta.setLineDash([3, 3]);
        ctxDelta.strokeStyle = '#10b981';
        ctxDelta.beginPath();
        ctxDelta.moveTo(mx, my);
        ctxDelta.lineTo(mx, padT + plotH);
        ctxDelta.moveTo(mx, my);
        ctxDelta.lineTo(padL, my);
        ctxDelta.stroke();
        ctxDelta.restore();

        // Vertex Dot
        ctxDelta.fillStyle = '#10b981';
        ctxDelta.beginPath();
        ctxDelta.arc(mx, my, 5, 0, Math.PI * 2);
        ctxDelta.fill();

        // Label
        ctxDelta.font = '700 10.5px JetBrains Mono, monospace';
        ctxDelta.fillStyle = '#059669';
        ctxDelta.textAlign = 'left';
        ctxDelta.fillText(`D_min: ${dMin.toFixed(1)}°`, mx + 8, my - 6);
      }
    }

    // Mark Current Live Operating Point
    if (!tel.isTIR && tel.delta >= minD && tel.delta <= maxD) {
      const curX = padL + (tel.i / 90) * plotW;
      const curY = padT + plotH - ((tel.delta - minD) / (maxD - minD)) * plotH;

      ctxDelta.fillStyle = '#7c3aed';
      ctxDelta.shadowColor = '#7c3aed';
      ctxDelta.shadowBlur = 10;
      ctxDelta.beginPath();
      ctxDelta.arc(curX, curY, 6, 0, Math.PI * 2);
      ctxDelta.fill();
      ctxDelta.shadowBlur = 0;

      ctxDelta.font = '700 11px JetBrains Mono, monospace';
      ctxDelta.textAlign = 'right';
      ctxDelta.fillText(`Live: (${tel.i.toFixed(1)}°, ${tel.delta.toFixed(1)}°)`, curX - 10, curY - 8);
    }
  }

  // 2. Graph: Cauchy Chromatic Dispersion n(λ)
  function drawCauchyGraph() {
    if (!canvasCauchy) return;
    ctxCauchy = canvasCauchy.getContext('2d');
    if (!ctxCauchy) return;

    const w = canvasCauchy.width / dpr;
    const h = canvasCauchy.height / dpr;

    ctxCauchy.setTransform(1, 0, 0, 1, 0, 0);
    ctxCauchy.clearRect(0, 0, canvasCauchy.width, canvasCauchy.height);
    ctxCauchy.scale(dpr, dpr);

    const padL = 55, padR = 20, padT = 30, padB = 40;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Background
    ctxCauchy.fillStyle = '#f8fafc';
    ctxCauchy.fillRect(0, 0, w, h);

    const cfg = lab.getConfig();
    const minWl = 380, maxWl = 750;
    const nViolet = lab.getRefractiveIndex(cfg.n, cfg.cauchyB, 400);
    const nRed = lab.getRefractiveIndex(cfg.n, cfg.cauchyB, 700);

    const minN = Number((nRed - 0.015).toFixed(3));
    const maxN = Number((nViolet + 0.02).toFixed(3));

    // Grid lines
    ctxCauchy.strokeStyle = '#e2e8f0';
    ctxCauchy.lineWidth = 1;
    ctxCauchy.font = '10.5px JetBrains Mono, monospace';
    ctxCauchy.fillStyle = '#64748b';

    // X-axis: Wavelength λ (380 to 750 nm)
    for (let wl = 400; wl <= 700; wl += 50) {
      const x = padL + ((wl - minWl) / (maxWl - minWl)) * plotW;
      ctxCauchy.beginPath();
      ctxCauchy.moveTo(x, padT);
      ctxCauchy.lineTo(x, padT + plotH);
      ctxCauchy.stroke();
      ctxCauchy.textAlign = 'center';
      ctxCauchy.fillText(`${wl}`, x, padT + plotH + 16);
    }

    // Y-axis: Refractive Index n
    const stepN = (maxN - minN) / 4;
    for (let i = 0; i <= 4; i++) {
      const nVal = minN + i * stepN;
      const y = padT + plotH - (i / 4) * plotH;
      ctxCauchy.beginPath();
      ctxCauchy.moveTo(padL, y);
      ctxCauchy.lineTo(padL + plotW, y);
      ctxCauchy.stroke();
      ctxCauchy.textAlign = 'right';
      ctxCauchy.fillText(nVal.toFixed(3), padL - 8, y + 4);
    }

    // Axis labels
    ctxCauchy.font = '700 11.5px Plus Jakarta Sans, sans-serif';
    ctxCauchy.fillStyle = '#0f172a';
    ctxCauchy.textAlign = 'center';
    ctxCauchy.fillText('Wavelength λ (nm)', padL + plotW / 2, h - 8);

    ctxCauchy.save();
    ctxCauchy.translate(14, padT + plotH / 2);
    ctxCauchy.rotate(-Math.PI / 2);
    ctxCauchy.fillText('Refractive Index n', 0, 0);
    ctxCauchy.restore();

    // Plot Cauchy Curve
    ctxCauchy.beginPath();
    for (let wl = minWl; wl <= maxWl; wl += 5) {
      const nVal = lab.getRefractiveIndex(cfg.n, cfg.cauchyB, wl);
      const x = padL + ((wl - minWl) / (maxWl - minWl)) * plotW;
      const y = padT + plotH - ((nVal - minN) / (maxN - minN)) * plotH;
      if (wl === minWl) ctxCauchy.moveTo(x, y);
      else ctxCauchy.lineTo(x, y);
    }
    ctxCauchy.strokeStyle = '#dc2626';
    ctxCauchy.lineWidth = 2.5;
    ctxCauchy.stroke();

    // Mark current wavelength if in laser mode
    if (cfg.lightType === 'laser') {
      const curWl = cfg.wavelength;
      const curN = lab.getRefractiveIndex(cfg.n, cfg.cauchyB, curWl);
      const cx = padL + ((curWl - minWl) / (maxWl - minWl)) * plotW;
      const cy = padT + plotH - ((curN - minN) / (maxN - minN)) * plotH;

      ctxCauchy.fillStyle = lab.wavelengthToRGB(curWl).hex;
      ctxCauchy.beginPath();
      ctxCauchy.arc(cx, cy, 6, 0, Math.PI * 2);
      ctxCauchy.fill();

      ctxCauchy.font = '700 10.5px JetBrains Mono, monospace';
      ctxCauchy.fillStyle = '#0f172a';
      ctxCauchy.textAlign = 'left';
      ctxCauchy.fillText(`λ: ${curWl}nm (n=${curN.toFixed(3)})`, cx + 8, cy - 6);
    }
  }

  // Update Spectrometer readout badges
  function updateSpectrometerStats() {
    const cfg = lab.getConfig();
    const nv = lab.getRefractiveIndex(cfg.n, cfg.cauchyB, 405);
    const ny = lab.getRefractiveIndex(cfg.n, cfg.cauchyB, 589);
    const nr = lab.getRefractiveIndex(cfg.n, cfg.cauchyB, 685);

    // Dispersive Power omega = (nv - nr) / (ny - 1)
    const omega = (ny > 1) ? (nv - nr) / (ny - 1) : 0;
    const angDisp = lab.state.telemetry.dispersionAngle;

    if ($('statAngDisp')) $('statAngDisp').textContent = `${angDisp.toFixed(2)}°`;
    if ($('statDispersivePower')) $('statDispersivePower').textContent = omega.toFixed(4);
    if ($('statDeltaMin')) $('statDeltaMin').textContent = `${lab.state.telemetry.minDeviationAngle.toFixed(1)}°`;
  }

  // Export Data to CSV
  lab.exportToCsv = function() {
    const cfg = lab.getConfig();
    const A = cfg.prismAngle;
    const n = cfg.n;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Angle_of_Incidence_deg,Refraction_Angle_r1_deg,Internal_Angle_r2_deg,Emergence_Angle_e_deg,Deviation_Angle_delta_deg,Material,Apex_Angle_deg,Status\n';

    for (let i = 10; i <= 85; i += 1) {
      const iRad = (i * Math.PI) / 180.0;
      const sinR1 = Math.sin(iRad) / n;
      if (sinR1 > 1.0) continue;

      const r1Rad = Math.asin(sinR1);
      const r1 = (r1Rad * 180.0) / Math.PI;
      const r2 = A - r1;

      if (r2 < 0) continue;
      const sinE = n * Math.sin((r2 * Math.PI) / 180.0);

      let eStr = 'N/A';
      let deltaStr = 'N/A';
      let status = 'Emergence';

      if (sinE > 1.0) {
        status = 'Total Internal Reflection';
      } else {
        const e = (Math.asin(sinE) * 180.0) / Math.PI;
        const delta = i + e - A;
        eStr = e.toFixed(2);
        deltaStr = delta.toFixed(2);
      }

      csvContent += `${i.toFixed(1)},${r1.toFixed(2)},${r2.toFixed(2)},${eStr},${deltaStr},${cfg.materialKey},${A.toFixed(1)},${status}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Prism_Optics_Data_${cfg.materialKey}_A${Math.round(A)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

})(window.PhysicsLab);
