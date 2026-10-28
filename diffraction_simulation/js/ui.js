/**
 * ui.js
 * Binds UI controls, telemetry displays, and sound events.
 */

import { state } from './state.js';
import { soundManager } from './sound.js';
import { LASER_PRESETS, EXPERIMENT_QUESTS } from './diffraction_data.js';

export function setupUI(engine, renderer) {
  // Elements
  const laserBtn = document.getElementById('laserToggleBtn');
  const laserPresetSelect = document.getElementById('laserPresetSelect');
  const slitSlider = document.getElementById('slitSlider');
  const slitVal = document.getElementById('slitVal');
  const distSlider = document.getElementById('distSlider');
  const distVal = document.getElementById('distVal');
  const probeSlider = document.getElementById('probeSlider');
  const probeVal = document.getElementById('probeVal');
  const resetBtn = document.getElementById('resetBtn');

  // Telemetry
  const centralWidthElem = document.getElementById('telCentralWidth');
  const firstMinElem = document.getElementById('telFirstMin');
  const angularWidthElem = document.getElementById('telAngularWidth');
  const probeIrradianceElem = document.getElementById('telProbeIrradiance');

  // Laser toggle
  laserBtn.addEventListener('click', () => {
    state.setLaserActive(!state.laserActive);
    soundManager.playLaserToggle(state.laserActive);
  });

  // Laser preset
  laserPresetSelect.addEventListener('change', (e) => {
    state.setLaserPreset(e.target.value);
    engine.setWavelength(state.wavelengthNm);
    soundManager.playLaserToggle(true);
  });

  // Slit width
  slitSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.setSlitWidth(val);
    engine.setSlitWidth(val);
    slitVal.textContent = `${val.toFixed(2)} mm`;
    soundManager.playMicrometerClick();
  });

  // Screen distance
  distSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.setScreenDistance(val);
    engine.setScreenDistance(val);
    distVal.textContent = `${val.toFixed(1)} m`;
  });

  // Probe slider
  probeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.setProbeY(val);
    probeVal.textContent = `${val >= 0 ? '+' : ''}${val.toFixed(2)} mm`;
    const intensity = engine.getIntensityAt(val);
    soundManager.playProbeHum(intensity);
  });

  // Reset
  resetBtn.addEventListener('click', () => {
    state.reset();
    engine.setWavelength(state.wavelengthNm);
    engine.setSlitWidth(state.slitWidthMm);
    engine.setScreenDistance(state.screenDistanceM);
    laserPresetSelect.value = state.laserPreset.id;
    slitSlider.value = state.slitWidthMm;
    slitVal.textContent = `${state.slitWidthMm.toFixed(2)} mm`;
    distSlider.value = state.screenDistanceM;
    distVal.textContent = `${state.screenDistanceM.toFixed(1)} m`;
    probeSlider.value = state.probeYMm;
    probeVal.textContent = `0.00 mm`;
    soundManager.playLaserToggle(true);
  });

  // Interactive canvas click to move probe
  const canvas = renderer.canvas;
  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const benchH = canvas.clientHeight * 0.44;

    // Only respond if clicked in the screen & graph region (bottom)
    if (clickY > benchH) {
      const pad = 16;
      const boxX = pad;
      const boxW = canvas.clientWidth - pad * 2;
      const plotX = boxX + 40;
      const plotW = boxW - 80;
      const centerX = plotX + plotW / 2;
      const halfSpanMm = 25;

      const clampedX = Math.max(plotX, Math.min(plotX + plotW, clickX));
      const relYMm = ((clampedX - centerX) / (plotW / 2)) * halfSpanMm;

      state.setProbeY(relYMm);
      probeSlider.value = relYMm;
      probeVal.textContent = `${relYMm >= 0 ? '+' : ''}${relYMm.toFixed(2)} mm`;

      const intensity = engine.getIntensityAt(relYMm);
      soundManager.playProbeHum(intensity);
    }
  });

  // Update telemetry on state changes
  function updateTelemetry() {
    laserBtn.textContent = state.laserActive ? 'Laser Beam: ACTIVE' : 'Laser Beam: OFF';
    laserBtn.className = state.laserActive ? 'btn btn-primary' : 'btn btn-secondary';

    const y1 = engine.getFirstMinimumDistanceMm();
    const w0 = engine.getCentralMaximumWidthMm();
    const lambdaM = state.wavelengthNm * 1e-9;
    const aM = state.slitWidthMm * 1e-3;
    const theta1Rad = Math.asin(Math.min(1, lambdaM / aM));
    const theta1Deg = (theta1Rad * 180) / Math.PI;

    const probeI = state.laserActive ? engine.getIntensityAt(state.probeYMm) : 0;

    centralWidthElem.textContent = `${w0.toFixed(2)} mm`;
    firstMinElem.textContent = `±${y1.toFixed(2)} mm`;
    angularWidthElem.textContent = `${(theta1Deg * 60).toFixed(1)} arcmin (${(theta1Rad * 1e3).toFixed(2)} mrad)`;
    probeIrradianceElem.textContent = `${(probeI * 100).toFixed(1)}%`;
  }

  state.subscribe(() => {
    updateTelemetry();
    renderer.render();
  });

  updateTelemetry();
}
