/**
 * ui.js
 * Controls, event listeners, and live telemetry updates for salt analysis lab.
 */

import { state } from './state.js';
import { soundManager } from './sound.js';
import { PRESET_SALTS, REAGENTS } from './salt_data.js';

export function setupUI(engine, renderer) {
  const saltSelect = document.getElementById('saltSelect');
  const reagentSelect = document.getElementById('reagentSelect');
  const applyBtn = document.getElementById('applyBtn');
  const resetBtn = document.getElementById('resetBtn');

  // Telemetry elements
  const telObservation = document.getElementById('telObservation');
  const telInference = document.getElementById('telInference');
  const telCationStatus = document.getElementById('telCationStatus');
  const telAnionStatus = document.getElementById('telAnionStatus');

  saltSelect.addEventListener('change', (e) => {
    state.setSalt(e.target.value);
    engine.setSalt(state.activeSalt);
    soundManager.playDropper();
  });

  applyBtn.addEventListener('click', () => {
    const reagentId = reagentSelect.value;
    const result = engine.applyReagent(reagentId);
    state.setReagentResult(reagentId, result);

    if (result.hasBubbles) soundManager.playEffervescence();
    else if (result.precipitate || result.isFlame) soundManager.playSuccessChime();
    else soundManager.playDropper();
  });

  resetBtn.addEventListener('click', () => {
    state.reset();
    engine.setSalt(state.activeSalt);
    saltSelect.value = state.activeSalt.id;
    reagentSelect.value = REAGENTS[0].id;
    soundManager.playDropper();
  });

  function updateTelemetry() {
    const result = state.lastResult;
    if (result) {
      telObservation.textContent = result.observation;
      telInference.textContent = result.inference;
    } else {
      telObservation.textContent = 'Awaiting chemical reagent addition...';
      telInference.textContent = '--';
    }

    telCationStatus.textContent = state.activeSalt.cation;
    telAnionStatus.textContent = state.activeSalt.anion;
  }

  state.subscribe(() => {
    updateTelemetry();
    renderer.render();
  });

  updateTelemetry();
}
