/**
 * ArchimedesLab — Interactive Archimedes' Principle & Buoyancy Simulation
 * UI Controller Module: DOM bindings, telemetry updates, HUD, math explainer,
 * laboratory observation notebook table, challenge mode, and modal dialogs.
 */

import { state, setState, subscribe, FLUID_PRESETS, MATERIAL_PRESETS, GRAVITY_PRESETS } from './state.js';
import { solveArchimedes, generateMathExplanation } from './physics.js';

export function initUI(renderer) {
  // Mode Switcher Buttons
  const btnModeEureka = document.getElementById('btnModeEureka');
  const btnModePressure = document.getElementById('btnModePressure');
  const btnModeFlotation = document.getElementById('btnModeFlotation');

  // Sliders & Value Badges
  const sliderSubmersion = document.getElementById('sliderSubmersion');
  const valSubmersion = document.getElementById('valSubmersion');
  const sliderVolume = document.getElementById('sliderVolume');
  const valVolume = document.getElementById('valVolume');
  const sliderFluidDensity = document.getElementById('sliderFluidDensity');
  const valFluidDensity = document.getElementById('valFluidDensity');
  const sliderObjDensity = document.getElementById('sliderObjDensity');
  const valObjDensity = document.getElementById('valObjDensity');
  const sliderBoatCargo = document.getElementById('sliderBoatCargo');
  const valBoatCargo = document.getElementById('valBoatCargo');

  // Container visibility cards
  const cardBoatCargo = document.getElementById('cardBoatCargo');
  const cardSubmersion = document.getElementById('cardSubmersion');

  // Select Dropdowns
  const selectFluid = document.getElementById('selectFluid');
  const selectGravity = document.getElementById('selectGravity');

  // Shape Buttons
  const shapeButtons = document.querySelectorAll('.shape-btn');

  // Toggles & Switches
  const chkPressureVectors = document.getElementById('chkPressureVectors');
  const chkFBD = document.getElementById('chkFBD');
  const chkGrid = document.getElementById('chkGrid');
  const btnExpandCanvas = document.getElementById('btnExpandCanvas');
  const canvasContainer = document.querySelector('.canvas-container');

  // Header Status HUD
  const badgeCharacter = document.getElementById('badgeCharacter');
  const badgeVerification = document.getElementById('badgeVerification');
  const badgeLossRatio = document.getElementById('badgeLossRatio');

  // Telemetry Readouts
  const readoutW0 = document.getElementById('readoutW0');
  const readoutFB = document.getElementById('readoutFB');
  const readoutWapp = document.getElementById('readoutWapp');
  const readoutVsub = document.getElementById('readoutVsub');
  const readoutWdisp = document.getElementById('readoutWdisp');
  const readoutPbase = document.getElementById('readoutPbase');

  // Mathematical Explainer
  const mathContainer = document.getElementById('mathContainer');

  // Observation Notebook Table
  const btnRecordObs = document.getElementById('btnRecordObs');
  const btnExportCSV = document.getElementById('btnExportCSV');
  const btnClearObs = document.getElementById('btnClearObs');
  const obsTableBody = document.getElementById('obsTableBody');
  const meanLossVal = document.getElementById('meanLossVal');
  const meanDispVal = document.getElementById('meanDispVal');

  // Modals
  const modalTheory = document.getElementById('modalTheory');
  const btnOpenTheory = document.getElementById('btnOpenTheory');
  const btnCloseTheory = document.getElementById('btnCloseTheory');

  const modalChallenge = document.getElementById('modalChallenge');
  const btnOpenChallenge = document.getElementById('btnOpenChallenge');
  const btnCloseChallenge = document.getElementById('btnCloseChallenge');

  const btnResetAll = document.getElementById('btnResetAll');

  // =========================================================================
  // 1. PRIMARY MODE SWITCHING
  // =========================================================================
  const setMode = (mode) => {
    btnModeEureka?.classList.toggle('active', mode === 'eureka');
    btnModePressure?.classList.toggle('active', mode === 'pressure');
    btnModeFlotation?.classList.toggle('active', mode === 'flotation');

    // Show/hide mode-specific sidebar sections
    if (cardBoatCargo) {
      cardBoatCargo.style.display = (mode === 'flotation' && state.objectShape === 'boat') ? 'flex' : 'none';
    }
    if (cardSubmersion) {
      cardSubmersion.style.display = (mode === 'flotation') ? 'none' : 'flex';
    }

    setState({ mode });
  };

  btnModeEureka?.addEventListener('click', () => setMode('eureka'));
  btnModePressure?.addEventListener('click', () => setMode('pressure'));
  btnModeFlotation?.addEventListener('click', () => setMode('flotation'));

  // =========================================================================
  // 2. PRESET CHIP BUTTONS
  // =========================================================================
  document.querySelectorAll('.preset-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const preset = chip.getAttribute('data-preset');
      switch (preset) {
        case 'heavy-sink':
          setMode('eureka');
          setState({
            fluidType: 'water',
            fluidDensity: 1000.0,
            materialType: 'iron',
            objectDensity: 7870.0,
            objectShape: 'cylinder',
            submersionPct: 100.0
          });
          break;
        case 'classic-float':
          setMode('flotation');
          setState({
            fluidType: 'water',
            fluidDensity: 1000.0,
            materialType: 'wood_pine',
            objectDensity: 500.0,
            objectShape: 'cube',
            submersionPct: 50.0
          });
          break;
        case 'tip-iceberg':
          setMode('flotation');
          setState({
            fluidType: 'saltwater',
            fluidDensity: 1025.0,
            materialType: 'ice',
            objectDensity: 917.0,
            objectShape: 'cube',
            submersionPct: 89.5
          });
          break;
        case 'mercury-iron':
          setMode('flotation');
          setState({
            fluidType: 'mercury',
            fluidDensity: 13600.0,
            materialType: 'iron',
            objectDensity: 7870.0,
            objectShape: 'cube',
            submersionPct: 57.9
          });
          break;
        case 'neutral-buoy':
          setMode('pressure');
          setState({
            fluidType: 'water',
            fluidDensity: 1000.0,
            materialType: 'custom',
            objectDensity: 1000.0,
            objectShape: 'cylinder',
            submersionPct: 80.0
          });
          break;
        case 'crown-mystery':
          setMode('eureka');
          setState({
            fluidType: 'water',
            fluidDensity: 1000.0,
            materialType: 'crown_pure',
            objectDensity: 19300.0,
            objectShape: 'crown',
            submersionPct: 100.0
          });
          break;
        case 'cargo-boat':
          setMode('flotation');
          setState({
            fluidType: 'water',
            fluidDensity: 1000.0,
            materialType: 'boat',
            objectDensity: 280.0,
            objectShape: 'boat',
            boatCargoMassGrams: 150.0
          });
          if (cardBoatCargo) cardBoatCargo.style.display = 'flex';
          break;
      }
    });
  });

  // =========================================================================
  // 3. SUBMERSION QUICK BUTTONS (Floating bar on canvas)
  // =========================================================================
  document.querySelectorAll('.submersion-quick-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pct = parseFloat(btn.getAttribute('data-pct'));
      if (!isNaN(pct)) {
        setState({ submersionPct: pct });
      }
    });
  });

  // =========================================================================
  // 4. SLIDERS & FORM INPUTS
  // =========================================================================
  sliderSubmersion?.addEventListener('input', (e) => {
    setState({ submersionPct: parseFloat(e.target.value) });
  });

  sliderVolume?.addEventListener('input', (e) => {
    setState({ objectVolumeCm3: parseFloat(e.target.value) });
  });

  sliderFluidDensity?.addEventListener('input', (e) => {
    setState({ fluidDensity: parseFloat(e.target.value), fluidType: 'custom' });
    if (selectFluid) selectFluid.value = 'custom';
  });

  sliderObjDensity?.addEventListener('input', (e) => {
    setState({ objectDensity: parseFloat(e.target.value), materialType: 'custom' });
    document.querySelectorAll('.mat-chip').forEach(c => c.classList.remove('active'));
  });

  sliderBoatCargo?.addEventListener('input', (e) => {
    setState({ boatCargoMassGrams: parseFloat(e.target.value) });
  });

  // Fluid select
  selectFluid?.addEventListener('change', (e) => {
    const key = e.target.value;
    if (key !== 'custom' && FLUID_PRESETS[key]) {
      setState({
        fluidType: key,
        fluidDensity: FLUID_PRESETS[key].density
      });
    }
  });

  // Gravity select
  selectGravity?.addEventListener('change', (e) => {
    const key = e.target.value;
    if (GRAVITY_PRESETS[key]) {
      setState({
        gravityKey: key,
        g: GRAVITY_PRESETS[key].g
      });
    }
  });

  // Material chips
  document.querySelectorAll('.mat-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.mat-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const matKey = chip.getAttribute('data-mat');
      if (MATERIAL_PRESETS[matKey]) {
        const mat = MATERIAL_PRESETS[matKey];
        let shape = state.objectShape;
        if (matKey === 'crown_pure' || matKey === 'crown_fake') shape = 'crown';
        else if (matKey === 'boat') shape = 'boat';

        setState({
          materialType: matKey,
          objectDensity: mat.density,
          objectShape: shape
        });

        if (cardBoatCargo) {
          cardBoatCargo.style.display = (shape === 'boat') ? 'flex' : 'none';
        }
      }
    });
  });

  // Shape buttons
  shapeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      shapeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const shape = btn.getAttribute('data-shape');
      setState({ objectShape: shape });

      if (cardBoatCargo) {
        cardBoatCargo.style.display = (shape === 'boat') ? 'flex' : 'none';
      }
    });
  });

  // Visual Switches
  chkPressureVectors?.addEventListener('change', (e) => setState({ showPressureVectors: e.target.checked }));
  chkFBD?.addEventListener('change', (e) => setState({ showFBD: e.target.checked }));
  chkGrid?.addEventListener('change', (e) => setState({ showGrid: e.target.checked }));

  // Expand Canvas View
  btnExpandCanvas?.addEventListener('click', () => {
    const isExpanded = canvasContainer?.classList.toggle('expanded');
    btnExpandCanvas.classList.toggle('active', isExpanded);
    btnExpandCanvas.innerHTML = isExpanded ? '<span>⛶</span> Compact View' : '<span>⛶</span> Expand View';
    renderer.resize();
  });

  // Bench Controls: Tap Toggle & Tare Scale
  const btnToggleTap = document.getElementById('btnToggleTap');
  const btnTareScale = document.getElementById('btnTareScale');

  btnToggleTap?.addEventListener('click', () => {
    renderer.isTapOpen = !renderer.isTapOpen;
    btnToggleTap.classList.toggle('active', renderer.isTapOpen);
    btnToggleTap.innerHTML = renderer.isTapOpen ? '<span>🚰</span> Close Tap' : '<span>🚰</span> Open Tap';
  });

  btnTareScale?.addEventListener('click', () => {
    setState({ submersionPct: 0 });
    renderer.droplets = [];
    renderer.beakerRipples = [];
  });

  // =========================================================================
  // 5. OBSERVATION NOTEBOOK (LOG, CALCULATE, EXPORT CSV)
  // =========================================================================
  btnRecordObs?.addEventListener('click', () => {
    const sol = solveArchimedes(state);
    const obs = {
      id: state.observations.length + 1,
      mode: state.mode,
      material: MATERIAL_PRESETS[state.materialType]?.name || 'Custom',
      fluid: FLUID_PRESETS[state.fluidType]?.name || 'Custom',
      volume: sol.V_total_cm3.toFixed(0),
      subPct: sol.submersionPct.toFixed(1),
      w0: sol.W_true.toFixed(3),
      wApp: sol.W_apparent.toFixed(3),
      wDisp: sol.W_disp.toFixed(3),
      loss: sol.weightLoss.toFixed(3),
      error: sol.errorPct.toFixed(2)
    };

    const newObservations = [...state.observations, obs];
    setState({ observations: newObservations });
  });

  btnClearObs?.addEventListener('click', () => {
    setState({ observations: [] });
  });

  btnExportCSV?.addEventListener('click', () => {
    if (state.observations.length === 0) {
      alert('No laboratory observations recorded yet! Click "Log Current Trial" to record data.');
      return;
    }

    const headers = ['Trial #', 'Mode', 'Material', 'Fluid', 'Volume (cm³)', 'Submerged %', 'Weight in Air W₀ (N)', 'Apparent Weight W_app (N)', 'Displaced Fluid Weight W_disp (N)', 'Measured Weight Loss (N)', 'Error %'];
    const rows = state.observations.map(o => [
      o.id, `"${o.mode}"`, `"${o.material}"`, `"${o.fluid}"`, o.volume, o.subPct, o.w0, o.wApp, o.wDisp, o.loss, o.error
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ArchimedesLab_Observations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // =========================================================================
  // 6. MODALS MANAGEMENT
  // =========================================================================
  btnOpenTheory?.addEventListener('click', () => modalTheory?.classList.add('open'));
  btnCloseTheory?.addEventListener('click', () => modalTheory?.classList.remove('open'));
  modalTheory?.addEventListener('click', (e) => {
    if (e.target === modalTheory) modalTheory.classList.remove('open');
  });

  btnOpenChallenge?.addEventListener('click', () => modalChallenge?.classList.add('open'));
  btnCloseChallenge?.addEventListener('click', () => modalChallenge?.classList.remove('open'));
  modalChallenge?.addEventListener('click', (e) => {
    if (e.target === modalChallenge) modalChallenge.classList.remove('open');
  });

  // Challenge Crown Mystery Buttons
  document.getElementById('btnTestPureGold')?.addEventListener('click', () => {
    setMode('eureka');
    setState({
      materialType: 'crown_pure',
      objectDensity: 19300.0,
      objectShape: 'crown',
      submersionPct: 100.0
    });
    modalChallenge?.classList.remove('open');
  });

  document.getElementById('btnTestFakeCrown')?.addEventListener('click', () => {
    setMode('eureka');
    setState({
      materialType: 'crown_fake',
      objectDensity: 13800.0,
      objectShape: 'crown',
      submersionPct: 100.0
    });
    modalChallenge?.classList.remove('open');
  });

  // Reset All
  btnResetAll?.addEventListener('click', () => {
    setMode('eureka');
    setState({
      fluidType: 'water',
      fluidDensity: 1000.0,
      materialType: 'iron',
      objectDensity: 7870.0,
      objectShape: 'cylinder',
      objectVolumeCm3: 500.0,
      submersionPct: 50.0,
      gravityKey: 'earth',
      g: 9.81,
      boatCargoMassGrams: 0.0,
      showPressureVectors: true,
      showFBD: true,
      showGrid: true,
      observations: []
    });
  });

  // =========================================================================
  // 7. REACTIVE STATE SUBSCRIPTION & DOM RENDER
  // =========================================================================
  subscribe((currState) => {
    const sol = solveArchimedes(currState);

    // Sync Slider values & badges
    if (sliderSubmersion && document.activeElement !== sliderSubmersion) {
      sliderSubmersion.value = currState.submersionPct;
    }
    if (valSubmersion) valSubmersion.textContent = `${currState.submersionPct.toFixed(1)}%`;

    if (sliderVolume && document.activeElement !== sliderVolume) {
      sliderVolume.value = currState.objectVolumeCm3;
    }
    if (valVolume) valVolume.textContent = `${currState.objectVolumeCm3.toFixed(0)} cm³`;

    if (sliderFluidDensity && document.activeElement !== sliderFluidDensity) {
      sliderFluidDensity.value = currState.fluidDensity;
    }
    if (valFluidDensity) valFluidDensity.textContent = `${currState.fluidDensity.toFixed(0)} kg/m³`;

    if (sliderObjDensity && document.activeElement !== sliderObjDensity) {
      sliderObjDensity.value = currState.objectDensity;
    }
    if (valObjDensity) valObjDensity.textContent = `${currState.objectDensity.toFixed(0)} kg/m³`;

    if (sliderBoatCargo && document.activeElement !== sliderBoatCargo) {
      sliderBoatCargo.value = currState.boatCargoMassGrams;
    }
    if (valBoatCargo) valBoatCargo.textContent = `${currState.boatCargoMassGrams.toFixed(0)} g`;

    // Header Status HUD
    if (badgeCharacter) {
      badgeCharacter.textContent = sol.character;
      badgeCharacter.className = `hud-badge ${sol.characterBadge}`;
    }

    if (badgeVerification) {
      badgeVerification.textContent = sol.isVerified ? "✓ F_B = W_fluid" : "F_B ≠ W_fluid";
      badgeVerification.className = `hud-badge ${sol.isVerified ? 'badge-verified' : 'badge-sinking'}`;
    }

    if (badgeLossRatio) {
      badgeLossRatio.textContent = `W_loss = ${sol.weightLoss.toFixed(2)} N | W_disp = ${sol.W_disp.toFixed(2)} N`;
    }

    // Live Telemetry Readouts
    if (readoutW0) readoutW0.textContent = `${sol.W_true.toFixed(3)} N`;
    if (readoutFB) readoutFB.textContent = `${sol.F_buoyant.toFixed(3)} N`;
    if (readoutWapp) readoutWapp.textContent = `${sol.W_apparent.toFixed(3)} N`;
    if (readoutVsub) readoutVsub.textContent = `${sol.V_sub_cm3.toFixed(1)} cm³`;
    if (readoutWdisp) readoutWdisp.textContent = `${sol.W_disp.toFixed(3)} N`;
    if (readoutPbase) readoutPbase.textContent = `${(sol.P_bottom_gauge / 1000).toFixed(2)} kPa`;

    // Step-by-Step Mathematical Explainer
    if (mathContainer) {
      const steps = generateMathExplanation(sol);
      mathContainer.innerHTML = steps.map(s => `
        <div class="math-step-item ${s.isHighlight ? 'math-step-highlight' : ''}">
          <div class="math-step-badge">${s.badge}</div>
          <div class="math-step-title">${s.title}</div>
          <div class="math-step-eq">${s.formula.replace(/\n/g, '<br>')}</div>
          <div class="math-step-result">${s.result}</div>
        </div>
      `).join('');
    }

    // Observation Table Rows
    if (obsTableBody) {
      if (currState.observations.length === 0) {
        obsTableBody.innerHTML = `
          <tr>
            <td colspan="9" class="table-empty-notice">
              No observations recorded yet. Submerge the object and click "Log Current Trial" above.
            </td>
          </tr>
        `;
        if (meanLossVal) meanLossVal.textContent = '--';
        if (meanDispVal) meanDispVal.textContent = '--';
      } else {
        obsTableBody.innerHTML = currState.observations.map(o => `
          <tr>
            <td>#${o.id}</td>
            <td><strong>${o.material}</strong></td>
            <td>${o.fluid}</td>
            <td>${o.volume} cm³</td>
            <td>${o.w0} N</td>
            <td>${o.wApp} N</td>
            <td><strong style="color:#0284c7;">${o.wDisp} N</strong></td>
            <td><strong style="color:#10b981;">${o.loss} N</strong></td>
            <td>${o.error}%</td>
          </tr>
        `).join('');

        // Compute Mean Loss and Mean Displaced Weight
        const sumLoss = currState.observations.reduce((acc, o) => acc + parseFloat(o.loss), 0);
        const sumDisp = currState.observations.reduce((acc, o) => acc + parseFloat(o.wDisp), 0);
        const meanLoss = (sumLoss / currState.observations.length).toFixed(3);
        const meanDisp = (sumDisp / currState.observations.length).toFixed(3);

        if (meanLossVal) meanLossVal.textContent = `${meanLoss} N`;
        if (meanDispVal) meanDispVal.textContent = `${meanDisp} N`;
      }
    }
  });
}
