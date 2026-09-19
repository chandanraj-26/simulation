/**
 * CircuitLab — Interactive Wheatstone Bridge & Meter Bridge
 * UI Controller Module: DOM bindings, telemetry updates, HUD, math explainer,
 * laboratory observation table, challenge mode, and modal managers.
 */

import { state, setState, subscribe } from './state.js';
import { solveWheatstone, generateMathExplanation } from './bridge.js';

export function initUI(renderer) {
  // DOM Elements - Mode Switchers
  const btnModeWheatstone = document.getElementById('btnModeWheatstone');
  const btnModeMeterBridge = document.getElementById('btnModeMeterBridge');

  // Sliders & Controls
  const sliderP = document.getElementById('sliderP');
  const valP = document.getElementById('valP');
  const sliderQ = document.getElementById('sliderQ');
  const valQ = document.getElementById('valQ');
  const sliderR = document.getElementById('sliderR');
  const valR = document.getElementById('valR');
  const sliderS = document.getElementById('sliderS');
  const valS = document.getElementById('valS');
  const sliderVoltage = document.getElementById('sliderVoltage');
  const valVoltage = document.getElementById('valVoltage');
  const sliderJockey = document.getElementById('sliderJockey');
  const valJockey = document.getElementById('valJockey');

  // Sidebar card containers (conditional visibility based on mode)
  const cardWheatstoneArms = document.getElementById('cardWheatstoneArms');
  const cardMeterBridge = document.getElementById('cardMeterBridge');

  // Toggles & Switches
  const chkKeyK1 = document.getElementById('chkKeyK1');
  const chkKeyK2 = document.getElementById('chkKeyK2');
  const chkShunt = document.getElementById('chkShunt');
  const chkElectrons = document.getElementById('chkElectrons');
  const chkHeatmap = document.getElementById('chkHeatmap');
  const btnToggleAutoBalance = document.getElementById('btnToggleAutoBalance');

  // Canvas Viewport Overlays
  const btnExpandCanvas = document.getElementById('btnExpandCanvas');
  const canvasCard = document.querySelector('.canvas-card');
  const badgeBalance = document.getElementById('badgeBalance');
  const badgeDirection = document.getElementById('badgeDirection');
  const badgeRatioText = document.getElementById('badgeRatioText');

  // Telemetry Grid
  const readoutIg = document.getElementById('readoutIg');
  const readoutDeflection = document.getElementById('readoutDeflection');
  const readoutVBD = document.getElementById('readoutVBD');
  const readoutRatioPQ = document.getElementById('readoutRatioPQ');
  const readoutRatioRS = document.getElementById('readoutRatioRS');
  const readoutItotal = document.getElementById('readoutItotal');

  // Math Explainer
  const mathContainer = document.getElementById('mathContainer');

  // Observation Notebook Table
  const btnRecordObs = document.getElementById('btnRecordObs');
  const btnExportCSV = document.getElementById('btnExportCSV');
  const btnClearObs = document.getElementById('btnClearObs');
  const obsTableBody = document.getElementById('obsTableBody');
  const meanResistanceVal = document.getElementById('meanResistanceVal');

  // Modals
  const modalTheory = document.getElementById('modalTheory');
  const btnOpenTheory = document.getElementById('btnOpenTheory');
  const btnCloseTheory = document.getElementById('btnCloseTheory');

  const btnResetAll = document.getElementById('btnResetAll');

  // =========================================================================
  // 1. PRIMARY MODE SWITCHING
  // =========================================================================
  const setMode = (mode) => {
    btnModeWheatstone?.classList.toggle('active', mode === 'wheatstone');
    btnModeMeterBridge?.classList.toggle('active', mode === 'meterBridge');

    if (cardWheatstoneArms) cardWheatstoneArms.style.display = (mode === 'wheatstone') ? 'block' : 'none';
    if (cardMeterBridge) cardMeterBridge.style.display = (mode === 'meterBridge') ? 'block' : 'none';

    setState({ mode });
  };

  btnModeWheatstone?.addEventListener('click', () => setMode('wheatstone'));
  btnModeMeterBridge?.addEventListener('click', () => setMode('meterBridge'));

  // =========================================================================
  // 2. PRESET CHIP BUTTONS
  // =========================================================================
  document.querySelectorAll('.preset-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const preset = chip.getAttribute('data-preset');
      switch (preset) {
        case 'balanced-1':
          setMode('wheatstone');
          setState({ P: 100, Q: 100, R: 100, S: 100 });
          break;
        case 'balanced-10':
          setMode('wheatstone');
          setState({ P: 1000, Q: 100, R: 500, S: 50 });
          break;
        case 'unbalanced-right':
          setMode('wheatstone');
          setState({ P: 100, Q: 100, R: 180, S: 100 });
          break;
        case 'unbalanced-left':
          setMode('wheatstone');
          setState({ P: 100, Q: 100, R: 50, S: 100 });
          break;
        case 'max-sensitivity':
          setMode('wheatstone');
          setState({ P: 100, Q: 100, R: 100, S: 100, voltage: 6.0 });
          break;
        case 'meter-center':
          setMode('meterBridge');
          setState({ R: 50, S: 50, jockeyPos: 50.0 });
          break;
        case 'meter-33':
          setMode('meterBridge');
          setState({ R: 25, S: 50, jockeyPos: 33.3 });
          break;
        case 'meter-66':
          setMode('meterBridge');
          setState({ R: 100, S: 50, jockeyPos: 66.7 });
          break;
      }
    });
  });

  // =========================================================================
  // 3. AUTO-BALANCE BUTTON
  // =========================================================================
  btnToggleAutoBalance?.addEventListener('click', () => {
    if (state.mode === 'wheatstone') {
      // Balance condition: P/Q = R/S => S = R * (Q / P)
      const idealS = parseFloat(((state.R * state.Q) / state.P).toFixed(1));
      setState({ S: idealS });
    } else {
      // Meter Bridge: R / S = l / (100 - l) => l = 100 * R / (R + S)
      const idealL = parseFloat(((100.0 * state.R) / (state.R + state.S)).toFixed(1));
      setState({ jockeyPos: idealL });
    }
  });

  // =========================================================================
  // 4. SLIDERS & FINE-TUNING BUTTONS
  // =========================================================================
  sliderP?.addEventListener('input', (e) => setState({ P: parseFloat(e.target.value) }));
  sliderQ?.addEventListener('input', (e) => setState({ Q: parseFloat(e.target.value) }));
  sliderR?.addEventListener('input', (e) => setState({ R: parseFloat(e.target.value) }));
  sliderS?.addEventListener('input', (e) => setState({ S: parseFloat(e.target.value) }));
  sliderVoltage?.addEventListener('input', (e) => setState({ voltage: parseFloat(e.target.value) }));
  sliderJockey?.addEventListener('input', (e) => {
    setState({ jockeyPos: parseFloat(e.target.value) });
  });

  // Step buttons for Jockey
  document.querySelectorAll('.btn-jockey-step').forEach((btn) => {
    btn.addEventListener('click', () => {
      const step = parseFloat(btn.getAttribute('data-step') || '0');
      const nextL = Math.max(0.1, Math.min(99.9, state.jockeyPos + step));
      setState({ jockeyPos: parseFloat(nextL.toFixed(1)) });
    });
  });

  // Step buttons for Resistor R
  document.querySelectorAll('.btn-r-step').forEach((btn) => {
    btn.addEventListener('click', () => {
      const step = parseFloat(btn.getAttribute('data-step') || '0');
      const nextR = Math.max(1, Math.min(2000, state.R + step));
      setState({ R: parseFloat(nextR.toFixed(1)) });
    });
  });

  // =========================================================================
  // 5. SWITCHES & TOGGLES
  // =========================================================================
  chkKeyK1?.addEventListener('change', (e) => {
    setState({ keyK1: e.target.checked });
  });

  chkKeyK2?.addEventListener('change', (e) => {
    setState({ keyK2: e.target.checked });
  });

  chkShunt?.addEventListener('change', (e) => {
    setState({ galvSensitivity: e.target.checked ? 'shunted' : 'high' });
  });

  chkElectrons?.addEventListener('change', (e) => setState({ showElectrons: e.target.checked }));
  chkHeatmap?.addEventListener('change', (e) => setState({ showHeatmap: e.target.checked }));

  // Expand Viewport
  btnExpandCanvas?.addEventListener('click', () => {
    canvasCard?.classList.toggle('expanded');
    const isExp = canvasCard?.classList.contains('expanded');
    btnExpandCanvas.innerHTML = isExp ? '<span>✕</span> Normal View' : '<span>⛶</span> Expand View';
    setTimeout(() => renderer.resize(), 320);
  });



  // =========================================================================
  // 7. OBSERVATION NOTEBOOK TABLE
  // =========================================================================
  const updateObsTableUI = () => {
    if (!obsTableBody) return;
    obsTableBody.innerHTML = '';

    if (state.observations.length === 0) {
      obsTableBody.innerHTML = `<tr><td colspan="7" style="color:#94a3b8; padding:16px;">No observations recorded yet. Find a balance point and click "Record Observation".</td></tr>`;
      if (meanResistanceVal) meanResistanceVal.textContent = '-- Ω';
      return;
    }

    let sumX = 0;
    state.observations.forEach((obs, idx) => {
      sumX += obs.S;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${obs.R.toFixed(1)}</td>
        <td>${obs.l.toFixed(1)}</td>
        <td>${obs.lPrime.toFixed(1)}</td>
        <td><b>${obs.S.toFixed(2)}</b></td>
        <td>${obs.time}</td>
        <td><button class="del-btn" data-id="${obs.id}" title="Delete observation">&times;</button></td>
      `;
      obsTableBody.appendChild(tr);
    });

    const mean = sumX / state.observations.length;
    if (meanResistanceVal) {
      meanResistanceVal.textContent = `${mean.toFixed(2)} Ω (N = ${state.observations.length})`;
    }

    // Attach delete listeners
    obsTableBody.querySelectorAll('.del-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id') || '0', 10);
        setState({ observations: state.observations.filter(o => o.id !== id) });
      });
    });
  };

  btnRecordObs?.addEventListener('click', () => {
    const results = solveWheatstone(state);
    const S = state.mode === 'meterBridge' ? results.calculatedS_meterBridge : results.S;
    const l = results.l;
    const lPrime = 100.0 - l;
    const newObs = {
      id: Date.now(),
      R: state.R,
      l,
      lPrime,
      S,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setState({ observations: [...state.observations, newObs] });
  });

  btnClearObs?.addEventListener('click', () => {
    if (confirm('Clear all observations from table?')) {
      setState({ observations: [] });
    }
  });

  btnExportCSV?.addEventListener('click', () => {
    if (state.observations.length === 0) {
      alert('No observations to export.');
      return;
    }
    let csv = 'Obs_No,Known_Resistance_R_Ohms,Balancing_Length_l_cm,100_minus_l_cm,Unknown_Resistance_X_Ohms,Timestamp\n';
    state.observations.forEach((obs, idx) => {
      csv += `${idx + 1},${obs.R.toFixed(1)},${obs.l.toFixed(1)},${obs.lPrime.toFixed(1)},${obs.S.toFixed(2)},${obs.time}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meter_bridge_observations_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // =========================================================================
  // 8. MODAL MANAGERS & QUIZ
  // =========================================================================
  btnOpenTheory?.addEventListener('click', () => modalTheory?.classList.add('active'));
  btnCloseTheory?.addEventListener('click', () => modalTheory?.classList.remove('active'));

  // Close modal on outside click
  window.addEventListener('click', (e) => {
    if (e.target === modalTheory) modalTheory?.classList.remove('active');
  });

  // Reset all defaults
  btnResetAll?.addEventListener('click', () => {
    setMode('wheatstone');
    setState({
      P: 100, Q: 100, R: 100, S: 100,
      voltage: 6.0, rBat: 0.2, Rg: 50.0,
      galvSensitivity: 'high',
      keyK1: true, keyK2: true,
      jockeyPos: 50.0,
      observations: []
    });
  });

  // =========================================================================
  // 9. SUBSCRIBE TO STATE UPDATES (LIVE TELEMETRY & MATH RECOMPUTE)
  // =========================================================================
  subscribe((currState) => {
    // Synchronize slider values
    if (sliderP) sliderP.value = currState.P;
    if (valP) valP.textContent = `${currState.P.toFixed(1)} Ω`;

    if (sliderQ) sliderQ.value = currState.Q;
    if (valQ) valQ.textContent = `${currState.Q.toFixed(1)} Ω`;

    if (sliderR) sliderR.value = currState.R;
    if (valR) valR.textContent = `${currState.R.toFixed(1)} Ω`;

    if (sliderS) sliderS.value = currState.S;
    if (valS) valS.textContent = `${currState.S.toFixed(1)} Ω`;

    if (sliderVoltage) sliderVoltage.value = currState.voltage;
    if (valVoltage) valVoltage.textContent = `${currState.voltage.toFixed(1)} V`;

    if (sliderJockey) sliderJockey.value = currState.jockeyPos;
    if (valJockey) valJockey.textContent = `${currState.jockeyPos.toFixed(1)} cm`;

    // Solve circuit physics
    const results = solveWheatstone(currState);

    // Update Floating HUD on Canvas
    if (badgeBalance) {
      if (results.isBalanced) {
        badgeBalance.className = 'hud-badge badge-balanced';
        badgeBalance.innerHTML = '<span>✓</span> BALANCED (Null Point)';
      } else {
        badgeBalance.className = 'hud-badge badge-unbalanced';
        badgeBalance.innerHTML = '<span>⚠</span> UNBALANCED BRIDGE';
      }
    }

    if (badgeDirection) {
      if (results.isBalanced) {
        badgeDirection.className = 'hud-badge badge-balanced';
        badgeDirection.textContent = 'I_g = 0 (Null Deflection)';
      } else if (results.VBD > 0) {
        badgeDirection.className = 'hud-badge badge-right';
        badgeDirection.textContent = 'Current B → D (Right Deflection)';
      } else {
        badgeDirection.className = 'hud-badge badge-left';
        badgeDirection.textContent = 'Current D → B (Left Deflection)';
      }
    }

    if (badgeRatioText) {
      badgeRatioText.textContent = `P/Q = ${(results.P / results.Q).toFixed(3)} | R/S = ${(results.R / results.S).toFixed(3)}`;
    }

    // Update Live Telemetry Cards
    if (readoutIg) {
      const uA = (results.Ig * 1e6).toFixed(1);
      readoutIg.textContent = results.isBalanced ? '0.0 μA' : `${uA} μA`;
    }

    if (readoutDeflection) {
      readoutDeflection.textContent = `${results.deflectionDiv.toFixed(1)} div`;
    }

    if (readoutVBD) {
      readoutVBD.textContent = `${(results.VBD).toFixed(3)} V`;
    }

    if (readoutRatioPQ) {
      readoutRatioPQ.textContent = `${(results.P / results.Q).toFixed(3)}`;
    }

    if (readoutRatioRS) {
      readoutRatioRS.textContent = `${(results.R / results.S).toFixed(3)}`;
    }

    if (readoutItotal) {
      readoutItotal.textContent = `${(results.Itotal * 1000).toFixed(1)} mA`;
    }

    // Step-by-Step Math Explainer
    if (mathContainer) {
      mathContainer.innerHTML = generateMathExplanation(results, currState);
    }

    // Observation Table
    updateObsTableUI();
  });
}
