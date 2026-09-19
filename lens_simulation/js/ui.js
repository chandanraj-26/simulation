/**
 * OpticsLab — Interactive Lens Simulation
 * UI Controller Module: DOM bindings, HUD updates, math cards, modals, and preset triggers
 */

import { state, setState, subscribe } from './state.js';
import { calculateOptics, generateMathExplanation } from './optics.js';

export function initUI(renderer) {
  // DOM Elements - Sliders & Inputs
  const focalSlider = document.getElementById('sliderFocal');
  const focalVal = document.getElementById('valFocal');
  const objDistSlider = document.getElementById('sliderObjDist');
  const objDistVal = document.getElementById('valObjDist');
  const objHeightSlider = document.getElementById('sliderObjHeight');
  const objHeightVal = document.getElementById('valObjHeight');

  // Lens Type Buttons
  const btnConvex = document.getElementById('btnTypeConvex');
  const btnConcave = document.getElementById('btnTypeConcave');

  // Object Type Buttons
  const btnObjStudent = document.getElementById('btnObjStudent');
  const btnObjCandle = document.getElementById('btnObjCandle');
  const btnObjArrow = document.getElementById('btnObjArrow');

  // Ray Toggles
  const chkRay1 = document.getElementById('chkRay1');
  const chkRay2 = document.getElementById('chkRay2');
  const chkRay3 = document.getElementById('chkRay3');
  const chkVirtual = document.getElementById('chkVirtual');
  const chkLightCone = document.getElementById('chkLightCone');
  const chkAnimate = document.getElementById('chkAnimate');
  const chkGrid = document.getElementById('chkGrid');
  const chkRuler = document.getElementById('chkRuler');

  // HUD Readouts & Badges
  const badgeNature = document.getElementById('badgeNature');
  const badgeOrientation = document.getElementById('badgeOrientation');
  const badgeSize = document.getElementById('badgeSize');
  const badgeZone = document.getElementById('badgeZone');

  const readoutU = document.getElementById('readoutU');
  const readoutV = document.getElementById('readoutV');
  const readoutF = document.getElementById('readoutF');
  const readoutM = document.getElementById('readoutM');
  const readoutP = document.getElementById('readoutP');
  const readoutHi = document.getElementById('readoutHi');

  // Math Steps Container
  const mathContainer = document.getElementById('mathContainer');

  const modalSignConvention = document.getElementById('modalSignConvention');
  const btnOpenSign = document.getElementById('btnOpenSign');
  const btnCloseSign = document.getElementById('btnCloseSign');

  const btnResetView = document.getElementById('btnResetView');
  const btnToggleAutoFit = document.getElementById('btnToggleAutoFit');
  const lblAutoFit = document.getElementById('lblAutoFit');
  const btnExpandCanvas = document.getElementById('btnExpandCanvas');
  const canvasCard = document.querySelector('.canvas-card');

  // Auto-Fit Toggle
  btnToggleAutoFit?.addEventListener('click', () => {
    const nextFit = !state.autoFit;
    if (nextFit) {
      state.panOffset = { x: 0, y: 0 };
      state.zoom = 1.0;
    }
    setState({ autoFit: nextFit });
  });

  // Expand Canvas Height
  btnExpandCanvas?.addEventListener('click', () => {
    canvasCard?.classList.toggle('expanded');
    const isExp = canvasCard?.classList.contains('expanded');
    btnExpandCanvas.innerHTML = isExp ? '<span>✕</span> Normal View' : '<span>⛶</span> Expand View';
    setTimeout(() => renderer.resize(), 320);
  });

  // =========================================================================
  // 1. INPUT EVENT LISTENERS (SLIDERS)
  // =========================================================================
  focalSlider?.addEventListener('input', (e) => {
    setState({ focalLength: parseFloat(e.target.value) });
  });

  objDistSlider?.addEventListener('input', (e) => {
    // Slider is positive distance, we map it to negative Cartesian coordinate u
    const dist = parseFloat(e.target.value);
    setState({ objectDistance: -dist });
  });

  objHeightSlider?.addEventListener('input', (e) => {
    setState({ objectHeight: parseFloat(e.target.value) });
  });

  // Lens Type Toggle
  btnConvex?.addEventListener('click', () => {
    setState({ lensType: 'convex' });
  });

  btnConcave?.addEventListener('click', () => {
    setState({ lensType: 'concave' });
  });

  // Object Type Toggle
  btnObjStudent?.addEventListener('click', () => {
    setState({ objectType: 'student' });
  });

  btnObjCandle?.addEventListener('click', () => {
    setState({ objectType: 'candle' });
  });

  btnObjArrow?.addEventListener('click', () => {
    setState({ objectType: 'arrow' });
  });

  // Ray & Feature Checkboxes
  chkRay1?.addEventListener('change', (e) => setState({ showRay1: e.target.checked }));
  chkRay2?.addEventListener('change', (e) => setState({ showRay2: e.target.checked }));
  chkRay3?.addEventListener('change', (e) => setState({ showRay3: e.target.checked }));
  chkVirtual?.addEventListener('change', (e) => setState({ showVirtualRays: e.target.checked }));
  chkLightCone?.addEventListener('change', (e) => setState({ showLightCone: e.target.checked }));
  chkAnimate?.addEventListener('change', (e) => setState({ animateRays: e.target.checked }));
  chkGrid?.addEventListener('change', (e) => setState({ showGrid: e.target.checked }));
  chkRuler?.addEventListener('change', (e) => setState({ showRuler: e.target.checked }));

  // Reset View
  btnResetView?.addEventListener('click', () => {
    state.panOffset = { x: 0, y: 0 };
    state.zoom = 1.0;
    setState({
      autoFit: true,
      lensType: 'convex',
      focalLength: 20,
      objectDistance: -40,
      objectHeight: 15
    });
  });

  // =========================================================================
  // 2. PRESET BUTTONS
  // =========================================================================
  const presetButtons = document.querySelectorAll('[data-preset]');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      applyPreset(preset);
    });
  });

  function applyPreset(preset) {
    const f = state.focalLength;
    state.panOffset = { x: 0, y: 0 };
    state.zoom = 1.0;

    switch (preset) {
      case 'convex-beyond-2f':
        setState({ autoFit: true, lensType: 'convex', objectDistance: -2.5 * f, objectHeight: 15 });
        break;
      case 'convex-at-2f':
        setState({ autoFit: true, lensType: 'convex', objectDistance: -2.0 * f, objectHeight: 15 });
        break;
      case 'convex-between-f-2f':
        setState({ autoFit: true, lensType: 'convex', objectDistance: -1.5 * f, objectHeight: 15 });
        break;
      case 'convex-at-f':
        setState({ autoFit: true, lensType: 'convex', objectDistance: -1.0 * f, objectHeight: 15 });
        break;
      case 'convex-inside-f':
        setState({ autoFit: true, lensType: 'convex', objectDistance: -0.5 * f, objectHeight: 15 });
        break;
      case 'concave-distant':
        setState({ autoFit: true, lensType: 'concave', objectDistance: -60, objectHeight: 15 });
        break;
      case 'concave-close':
        setState({ autoFit: true, lensType: 'concave', objectDistance: -20, objectHeight: 15 });
        break;
    }
  }

  // =========================================================================
  // 3. MODALS: SIGN CONVENTION & CHALLENGES
  // =========================================================================
  btnOpenSign?.addEventListener('click', () => {
    modalSignConvention?.classList.add('active');
  });
  btnCloseSign?.addEventListener('click', () => {
    modalSignConvention?.classList.remove('active');
  });



  // =========================================================================
  // 4. REACTIVE STATE SUBSCRIPTION & DOM UPDATES
  // =========================================================================
  subscribe((currentState) => {
    const optics = calculateOptics(currentState);

    // Sync Sliders & Values
    if (focalSlider) focalSlider.value = currentState.focalLength;
    if (focalVal) focalVal.textContent = `${currentState.focalLength.toFixed(1)} cm`;

    if (objDistSlider) objDistSlider.value = Math.abs(currentState.objectDistance);
    if (objDistVal) objDistVal.textContent = `${Math.abs(currentState.objectDistance).toFixed(1)} cm`;

    if (objHeightSlider) objHeightSlider.value = currentState.objectHeight;
    if (objHeightVal) objHeightVal.textContent = `${currentState.objectHeight.toFixed(1)} cm`;

    // Sync Lens Type Active Buttons
    if (btnConvex && btnConcave) {
      if (currentState.lensType === 'convex') {
        btnConvex.classList.add('active');
        btnConcave.classList.remove('active');
      } else {
        btnConvex.classList.remove('active');
        btnConcave.classList.add('active');
      }
    }

    // Sync Object Type Active Buttons
    if (btnObjStudent) {
      btnObjStudent.classList.toggle('active', currentState.objectType === 'student');
    }
    if (btnObjCandle) {
      btnObjCandle.classList.toggle('active', currentState.objectType === 'candle');
    }
    if (btnObjArrow) {
      btnObjArrow.classList.toggle('active', currentState.objectType === 'arrow');
    }

    // Sync Auto-Fit Button
    if (btnToggleAutoFit && lblAutoFit) {
      if (currentState.autoFit) {
        btnToggleAutoFit.classList.add('active');
        lblAutoFit.textContent = 'Auto-Fit: ON';
      } else {
        btnToggleAutoFit.classList.remove('active');
        lblAutoFit.textContent = 'Auto-Fit: OFF';
      }
    }

    // Update Live HUD Badges
    updateHUD(optics);

    // Update Math Card Steps
    updateMathDrawer(optics);

  });

  function updateHUD(optics) {
    const { isAtInfinity, isReal, isUpright, sizeCategory, zoneDescription, u, v, f, m, hi, power } = optics;

    // Badges
    if (badgeNature) {
      if (isAtInfinity) {
        badgeNature.className = 'hud-badge badge-infinity';
        badgeNature.textContent = 'At Infinity (∞)';
      } else if (isReal) {
        badgeNature.className = 'hud-badge badge-real';
        badgeNature.textContent = 'Real Image';
      } else {
        badgeNature.className = 'hud-badge badge-virtual';
        badgeNature.textContent = 'Virtual Image';
      }
    }

    if (badgeOrientation) {
      if (isAtInfinity) {
        badgeOrientation.className = 'hud-badge badge-neutral';
        badgeOrientation.textContent = '—';
      } else if (isUpright) {
        badgeOrientation.className = 'hud-badge badge-upright';
        badgeOrientation.textContent = 'Upright (Erect)';
      } else {
        badgeOrientation.className = 'hud-badge badge-inverted';
        badgeOrientation.textContent = 'Inverted';
      }
    }

    if (badgeSize) {
      if (isAtInfinity) {
        badgeSize.className = 'hud-badge badge-infinity';
        badgeSize.textContent = 'Highly Enlarged';
      } else if (sizeCategory === 'magnified') {
        badgeSize.className = 'hud-badge badge-magnified';
        badgeSize.textContent = `Magnified (${Math.abs(m).toFixed(2)}×)`;
      } else if (sizeCategory === 'diminished') {
        badgeSize.className = 'hud-badge badge-diminished';
        badgeSize.textContent = `Diminished (${Math.abs(m).toFixed(2)}×)`;
      } else {
        badgeSize.className = 'hud-badge badge-same';
        badgeSize.textContent = 'Same Size (1.0×)';
      }
    }

    if (badgeZone) {
      badgeZone.textContent = zoneDescription;
    }

    // Numerical Readouts
    if (readoutU) readoutU.textContent = `${u.toFixed(1)} cm`;
    if (readoutV) readoutV.textContent = isAtInfinity ? '±∞' : `${v > 0 ? '+' : ''}${v.toFixed(1)} cm`;
    if (readoutF) readoutF.textContent = `${f > 0 ? '+' : ''}${f.toFixed(1)} cm`;
    if (readoutM) readoutM.textContent = isAtInfinity ? '±∞' : `${m > 0 ? '+' : ''}${m.toFixed(2)}`;
    if (readoutP) readoutP.textContent = `${power > 0 ? '+' : ''}${power} D`;
    if (readoutHi) readoutHi.textContent = isAtInfinity ? '±∞' : `${hi > 0 ? '+' : ''}${hi.toFixed(1)} cm`;
  }

  function updateMathDrawer(optics) {
    if (!mathContainer) return;
    const steps = generateMathExplanation(optics);

    mathContainer.innerHTML = '';
    steps.forEach(step => {
      const stepDiv = document.createElement('div');
      stepDiv.className = 'math-step-card';

      let html = `<div class="math-step-title">${step.title}</div>`;
      if (step.formula) {
        html += `<div class="math-step-formula">${step.formula}</div>`;
      }
      html += `<div class="math-step-body">`;
      step.body.forEach(line => {
        html += `<div class="math-line">${line}</div>`;
      });
      html += `</div>`;

      stepDiv.innerHTML = html;
      mathContainer.appendChild(stepDiv);
    });
  }
}
