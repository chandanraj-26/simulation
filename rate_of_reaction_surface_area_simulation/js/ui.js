/**
 * ui.js
 * Controls, event listeners, and live telemetry updates for reaction rate lab.
 */

import { state } from './state.js';
import { soundManager } from './sound.js';
import { PARTICLE_SIZES, CONCENTRATIONS } from './reaction_data.js';

export function setupUI(engine, renderer) {
  const particleSelect = document.getElementById('particleSelect');
  const concSelect = document.getElementById('concSelect');
  const timeSlider = document.getElementById('timeSlider');
  const timeVal = document.getElementById('timeVal');
  const playTimeBtn = document.getElementById('playTimeBtn');
  const resetBtn = document.getElementById('resetBtn');

  // Telemetry elements
  const telVolume = document.getElementById('telVolume');
  const telMass = document.getElementById('telMass');
  const telRate = document.getElementById('telRate');
  const telSurfaceArea = document.getElementById('telSurfaceArea');

  particleSelect.addEventListener('change', (e) => {
    state.setParticleSize(e.target.value);
    engine.setParticleSize(state.particleSize);
    soundManager.playBubbling();
  });

  concSelect.addEventListener('change', (e) => {
    state.setConcentration(e.target.value);
    engine.setConcentration(state.conc);
    soundManager.playBubbling();
  });

  timeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.setTimeSec(val);
    engine.setTime(val);
    timeVal.textContent = `${val.toFixed(0)} s`;
  });

  let timer = null;
  playTimeBtn.addEventListener('click', () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
      playTimeBtn.textContent = '▶ Start Reaction Timer';
      return;
    }

    if (state.timeSec >= 120.0) state.setTimeSec(0.0);
    playTimeBtn.textContent = '⏸ Pause';

    timer = setInterval(() => {
      let nextT = state.timeSec + 1.0;
      if (nextT >= 120.0) {
        nextT = 120.0;
        clearInterval(timer);
        timer = null;
        playTimeBtn.textContent = '▶ Start Reaction Timer';
      }
      state.setTimeSec(nextT);
      engine.setTime(nextT);
      timeSlider.value = nextT;
      timeVal.textContent = `${nextT.toFixed(0)} s`;
      if (Math.random() < 0.25) soundManager.playBubbling();
    }, 100);
  });

  resetBtn.addEventListener('click', () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
      playTimeBtn.textContent = '▶ Start Reaction Timer';
    }
    state.reset();
    engine.setParticleSize(PARTICLE_SIZES[0]);
    engine.setConcentration(CONCENTRATIONS[1]);
    engine.setTime(0.0);
    particleSelect.value = PARTICLE_SIZES[0].id;
    concSelect.value = CONCENTRATIONS[1].id;
    timeSlider.value = 0;
    timeVal.textContent = '0 s';
    soundManager.playBubbling();
  });

  function updateTelemetry() {
    const vol = engine.getCurrentVolume();
    const mass = engine.getCurrentBalanceMass();
    const rate = engine.getInstantaneousRate();

    telVolume.textContent = `${vol.toFixed(1)} mL`;
    telMass.textContent = `${mass.toFixed(2)} g (-${engine.getMassLossG().toFixed(3)}g CO₂)`;
    telRate.textContent = `${rate.toFixed(2)} mL/s`;
    telSurfaceArea.textContent = `${state.particleSize.relativeSurfaceArea}× (Relative)`;
  }

  state.subscribe(() => {
    updateTelemetry();
    renderer.render();
  });

  updateTelemetry();
}
