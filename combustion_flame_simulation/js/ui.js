/**
 * ui.js
 * Controls, event listeners, and live telemetry updates for combustion lab.
 */

import { state } from './state.js';
import { soundManager } from './sound.js';

export function setupUI(engine, renderer) {
  const airModeSelect = document.getElementById('airModeSelect');
  const toolSelect = document.getElementById('toolSelect');
  const resetBtn = document.getElementById('resetBtn');

  // Telemetry elements
  const telFlameState = document.getElementById('telFlameState');
  const telOxygenSupply = document.getElementById('telOxygenSupply');
  const telObservation = document.getElementById('telObservation');

  airModeSelect.addEventListener('change', (e) => {
    state.setAirMode(e.target.value);
    engine.setAirMode(e.target.value);
    soundManager.playMatchStrike();
  });

  toolSelect.addEventListener('change', (e) => {
    state.setInsertedTool(e.target.value);
    engine.insertTool(e.target.value);
    soundManager.playToolClink();
  });

  resetBtn.addEventListener('click', () => {
    state.reset();
    engine.setAirMode('open');
    engine.insertTool('none');
    airModeSelect.value = 'open';
    toolSelect.value = 'none';
    soundManager.playMatchStrike();
  });

  function updateTelemetry() {
    const mode = state.airMode;
    telFlameState.textContent = mode.flameState.toUpperCase();
    telFlameState.style.color = mode.flameState === 'extinguished' ? '#DC2626' : (mode.flameState === 'flicker' ? '#D97706' : '#16A34A');
    telOxygenSupply.textContent = `${mode.airPercent}% (${mode.label.split(':')[0]})`;

    const outcome = engine.getToolOutcome();
    telObservation.textContent = outcome.text;
  }

  state.subscribe(() => {
    updateTelemetry();
    renderer.render();
  });

  updateTelemetry();
}
