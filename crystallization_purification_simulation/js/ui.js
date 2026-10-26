/**
 * ui.js
 * Controls, event listeners, and live telemetry updates for crystallization lab.
 */

import { state } from './state.js';
import { soundManager } from './sound.js';
import { STAGES } from './crystallization_data.js';

export function setupUI(engine, renderer) {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const stageSelect = document.getElementById('stageSelect');
  const resetBtn = document.getElementById('resetBtn');

  // Telemetry elements
  const telStageTitle = document.getElementById('telStageTitle');
  const telInstruction = document.getElementById('telInstruction');
  const telCrudeMass = document.getElementById('telCrudeMass');
  const telSandResidue = document.getElementById('telSandResidue');
  const telPureYield = document.getElementById('telPureYield');
  const telPercentYield = document.getElementById('telPercentYield');

  stageSelect.addEventListener('change', (e) => {
    const idx = parseInt(e.target.value, 10);
    state.setStageIndex(idx);
    engine.setStageIndex(idx);
    soundManager.playStir();
  });

  prevBtn.addEventListener('click', () => {
    if (state.stageIndex > 0) {
      const newIdx = state.stageIndex - 1;
      state.setStageIndex(newIdx);
      engine.setStageIndex(newIdx);
      stageSelect.value = newIdx;
      soundManager.playStir();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (state.stageIndex < STAGES.length - 1) {
      const newIdx = state.stageIndex + 1;
      state.setStageIndex(newIdx);
      engine.setStageIndex(newIdx);
      stageSelect.value = newIdx;
      if (newIdx === 4) soundManager.playSuccess();
      else soundManager.playStir();
    }
  });

  resetBtn.addEventListener('click', () => {
    state.reset();
    engine.setStageIndex(0);
    stageSelect.value = 0;
    soundManager.playStir();
  });

  function updateTelemetry() {
    const curStage = engine.getCurrentStage();
    const metrics = engine.getYieldMetrics();

    telStageTitle.textContent = curStage.title;
    telInstruction.textContent = curStage.instruction;

    telCrudeMass.textContent = `${metrics.crudeMass} g`;
    telSandResidue.textContent = state.stageIndex >= 1 ? `${metrics.sandResidue} g (Separated)` : '0.00 g (Pending)';
    telPureYield.textContent = state.stageIndex === 4 ? `${metrics.pureYield} g (Dry Crystals)` : 'In Progress';
    telPercentYield.textContent = state.stageIndex === 4 ? `${metrics.percentYield}%` : '--';

    prevBtn.disabled = state.stageIndex === 0;
    nextBtn.disabled = state.stageIndex === STAGES.length - 1;
  }

  state.subscribe(() => {
    updateTelemetry();
    renderer.render();
  });

  updateTelemetry();
}
