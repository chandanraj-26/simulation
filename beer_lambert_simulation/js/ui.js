/**
 * ui.js
 * Controls, event listeners, and live telemetry updates for Beer-Lambert lab.
 */

import { state } from './state.js';
import { soundManager } from './sound.js';
import { SOLUTES, CUVETTE_PATHS } from './spectro_data.js';

export function setupUI(engine, renderer) {
  const soluteSelect = document.getElementById('soluteSelect');
  const pathSelect = document.getElementById('pathSelect');
  const concSlider = document.getElementById('concSlider');
  const concVal = document.getElementById('concVal');
  const resetBtn = document.getElementById('resetBtn');

  // Telemetry elements
  const telAbsorbance = document.getElementById('telAbsorbance');
  const telTransmittance = document.getElementById('telTransmittance');
  const telMolarAbs = document.getElementById('telMolarAbs');
  const telLambda = document.getElementById('telLambda');

  function updateSliderBounds() {
    const s = state.solute;
    concSlider.min = s.concentrationRange[0];
    concSlider.max = s.concentrationRange[1];
    concSlider.step = (s.concentrationRange[1] - s.concentrationRange[0]) / 100.0;
    concSlider.value = state.concentrationM;
    concVal.textContent = `${state.concentrationM.toFixed(4)} ${s.unit}`;
  }

  soluteSelect.addEventListener('change', (e) => {
    state.setSolute(e.target.value);
    engine.setSolute(state.solute);
    updateSliderBounds();
    soundManager.playShutter();
  });

  pathSelect.addEventListener('change', (e) => {
    const cm = parseFloat(e.target.value);
    state.setPathLength(cm);
    engine.setPathLength(cm);
    soundManager.playShutter();
  });

  concSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.setConcentration(val);
    engine.setConcentration(val);
    concVal.textContent = `${val.toFixed(4)} ${state.solute.unit}`;
  });

  resetBtn.addEventListener('click', () => {
    state.reset();
    engine.setSolute(state.solute);
    engine.setPathLength(state.pathLengthCm);
    engine.setConcentration(state.concentrationM);
    soluteSelect.value = state.solute.id;
    pathSelect.value = state.pathLengthCm;
    updateSliderBounds();
    soundManager.playShutter();
  });

  function updateTelemetry() {
    const A = engine.getAbsorbance();
    const T = engine.getTransmittancePercent();

    telAbsorbance.textContent = A.toFixed(3);
    telTransmittance.textContent = `${T.toFixed(1)}%`;
    telMolarAbs.textContent = `${state.solute.molarAbsorptivity} L·mol⁻¹·cm⁻¹`;
    telLambda.textContent = `${state.solute.lambdaMaxNm} nm`;
  }

  state.subscribe(() => {
    updateTelemetry();
    renderer.render();
  });

  updateSliderBounds();
  updateTelemetry();
}
