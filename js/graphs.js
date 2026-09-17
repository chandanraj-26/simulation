/**
 * PhysicsLab - Real-Time Telemetry Graphing Engine
 * Synchronously renders Velocity v(t), Acceleration a(t), and Height y(t) with cursor and peaks.
 */
window.PhysicsLab = window.PhysicsLab || {};

(function(lab) {
  const $ = id => lab.$(id);

  lab.drawGraphs = function() {
    const graphCanvas = $('graphCanvas');
    if (!graphCanvas) return;
    const graphCtx = graphCanvas.getContext('2d');
    const { width: W, height: H, dpr } = lab.setupCanvas(graphCanvas);
    graphCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    graphCtx.clearRect(0, 0, W, H);

    graphCtx.fillStyle = '#ffffff';
    graphCtx.fillRect(0, 0, W, H);

    const historyData = lab.state.historyData;
    const L = 72, R = 28, T = 20, B = 38, G = 14;
    const plotW = Math.max(30, W - L - R);
    const laneH = Math.max(38, (H - T - B - G * 2) / 3);
    const totalPlotH = laneH * 3 + G * 2;

    const currentT = historyData.length ? historyData[historyData.length - 1].t : 0;
    const maxT = Math.max(10, Math.ceil(Math.max(currentT, 1) / 10) * 10);

    const lanes = [
      { key: 'speed', label: 'Velocity v(t)', unit: 'm/s', color: '#0284c7', zero: true },
      { key: 'ay', label: 'Acceleration a(t)', unit: 'm/s²', color: '#7c3aed', zero: true },
      { key: 'y', label: 'Height y(t)', unit: 'm', color: '#d97706', zero: true }
    ];

    // Shared vertical time cursor
    if (historyData.length) {
      const cx = L + (currentT / maxT) * plotW;
      graphCtx.save();
      graphCtx.strokeStyle = '#94a3b8';
      graphCtx.setLineDash([4, 4]);
      graphCtx.lineWidth = 1.5;
      graphCtx.beginPath();
      graphCtx.moveTo(cx, T);
      graphCtx.lineTo(cx, T + totalPlotH);
      graphCtx.stroke();
      graphCtx.restore();
    }

    lanes.forEach((lane, idx) => {
      const vals = historyData.length ? historyData.map(p => p[lane.key]) : [0];
      let lo = Math.min(...vals), hi = Math.max(...vals);

      if (lane.key === 'speed' || lane.key === 'y') {
        lo = Math.min(0, lo);
      } else {
        lo = Math.min(lo, 0);
        hi = Math.max(hi, 0);
      }
      if (hi === lo) hi = lo + 1;
      const pad = (hi - lo) * 0.12;
      lo -= pad;
      hi += pad;
      if (lane.key === 'speed' || lane.key === 'y') lo = Math.min(0, lo);

      const top = T + idx * (laneH + G);
      const bottom = top + laneH;

      graphCtx.fillStyle = idx % 2 === 0 ? '#f8fafc' : '#f1f5f9';
      graphCtx.fillRect(L, top, plotW, laneH);
      graphCtx.strokeStyle = '#e2e8f0';
      graphCtx.lineWidth = 1;
      graphCtx.strokeRect(L, top, plotW, laneH);

      // Grid lines
      graphCtx.strokeStyle = '#e2e8f0';
      for (let j = 1; j <= 3; j++) {
        const yy = top + (laneH * j) / 4;
        graphCtx.beginPath();
        graphCtx.moveTo(L, yy);
        graphCtx.lineTo(L + plotW, yy);
        graphCtx.stroke();
      }
      for (let j = 1; j <= 5; j++) {
        const xx = L + (plotW * j) / 6;
        graphCtx.beginPath();
        graphCtx.moveTo(xx, top);
        graphCtx.lineTo(xx, bottom);
        graphCtx.stroke();
      }

      const yFor = v => top + laneH - ((v - lo) / (hi - lo)) * laneH;

      // Zero-line
      if (lo < 0 && hi > 0) {
        const zy = yFor(0);
        graphCtx.save();
        graphCtx.strokeStyle = '#94a3b8';
        graphCtx.lineWidth = 1.2;
        graphCtx.setLineDash([4, 4]);
        graphCtx.beginPath();
        graphCtx.moveTo(L, zy);
        graphCtx.lineTo(L + plotW, zy);
        graphCtx.stroke();
        graphCtx.restore();
      }

      graphCtx.fillStyle = lane.color;
      graphCtx.font = 'bold 11px Plus Jakarta Sans, system-ui, sans-serif';
      graphCtx.fillText(lane.label, 8, top + 14);
      graphCtx.fillStyle = '#64748b';
      graphCtx.font = '9px JetBrains Mono, monospace';
      graphCtx.fillText(lane.unit, 8, top + 26);

      for (let j = 0; j <= 3; j++) {
        const val = hi - ((hi - lo) * j) / 3;
        graphCtx.fillText(lab.fmtNum(val, Math.abs(val) >= 100 ? 0 : 1), 10, top + 8 + (laneH * j) / 3);
      }

      // Plot curves
      if (!historyData.length) {
        graphCtx.fillStyle = '#94a3b8';
        graphCtx.font = '11px Plus Jakarta Sans, system-ui, sans-serif';
        graphCtx.fillText('Press Play or 1 Step to begin plotting live data', L + 16, top + laneH / 2 + 4);
      } else {
        graphCtx.save();
        graphCtx.beginPath();
        historyData.forEach((p, i) => {
          const xx = L + (p.t / maxT) * plotW;
          const yy = yFor(p[lane.key]);
          if (i === 0) graphCtx.moveTo(xx, yy);
          else graphCtx.lineTo(xx, yy);
        });
        graphCtx.strokeStyle = lane.color;
        graphCtx.lineWidth = 2.4;
        graphCtx.lineJoin = 'round';
        graphCtx.stroke();

        const lastPt = historyData[historyData.length - 1];
        const lx = L + (lastPt.t / maxT) * plotW;
        const ly = yFor(lastPt[lane.key]);
        graphCtx.fillStyle = lane.color;
        graphCtx.beginPath();
        graphCtx.arc(lx, ly, 4.5, 0, Math.PI * 2);
        graphCtx.fill();
        graphCtx.strokeStyle = '#ffffff';
        graphCtx.lineWidth = 1.5;
        graphCtx.stroke();

        const txt = `${lab.fmtNum(lastPt[lane.key], 1)} ${lane.unit}`;
        const bx = Math.min(lx + 8, L + plotW - 75);
        const by = Math.max(top + 14, Math.min(ly - 6, bottom - 6));
        graphCtx.fillStyle = lane.color;
        graphCtx.font = 'bold 10px JetBrains Mono, monospace';
        graphCtx.fillText(txt, bx, by);
        graphCtx.restore();
      }
    });

    // Time Axis (Shared X Axis)
    const xAxisY = T + totalPlotH;
    graphCtx.strokeStyle = '#cbd5e1';
    graphCtx.lineWidth = 1.2;
    graphCtx.beginPath();
    graphCtx.moveTo(L, xAxisY);
    graphCtx.lineTo(L + plotW, xAxisY);
    graphCtx.stroke();

    for (let i = 0; i <= 6; i++) {
      const frac = i / 6;
      const xx = L + plotW * frac;
      graphCtx.beginPath();
      graphCtx.moveTo(xx, xAxisY);
      graphCtx.lineTo(xx, xAxisY + 4);
      graphCtx.stroke();

      graphCtx.fillStyle = '#64748b';
      graphCtx.font = '10px JetBrains Mono, monospace';
      graphCtx.fillText(`${(maxT * frac).toFixed(0)}s`, xx - 8, xAxisY + 16);
    }
    graphCtx.fillStyle = '#334155';
    graphCtx.font = 'bold 11px Plus Jakarta Sans, system-ui, sans-serif';
    graphCtx.fillText('Time (seconds)', L + plotW / 2 - 36, xAxisY + 30);
  };
})(window.PhysicsLab);
