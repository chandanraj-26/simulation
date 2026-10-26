/**
 * ui.js
 * Controls, event listeners, and live telemetry updates for rusting lab.
 */

import { state } from './state.js';
import { soundManager } from './sound.js';
import { TUBES_CONFIG } from './rusting_data.js';

export function setupUI(engine, renderer) {
  const daySlider = document.getElementById('daySlider');
  const dayVal = document.getElementById('dayVal');
  const protectionSelect = document.getElementById('protectionSelect');
  const playTimeBtn = document.getElementById('playTimeBtn');
  const resetBtn = document.getElementById('resetBtn');

  // Telemetry
  const telA = document.getElementById('telA');
  const telB = document.getElementById('telB');
  const telC = document.getElementById('telC');
  const telD = document.getElementById('telD');

  // Day slider
  daySlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.setDay(val);
    engine.setDay(val);
    dayVal.textContent = `Day ${val.toFixed(1)}`;
    soundManager.playDayTick();
  });

  // Protection method select
  protectionSelect.addEventListener('change', (e) => {
    state.setProtectionMethod(e.target.value);
    engine.setProtection(e.target.value);
    soundManager.playGlassClink();
  });

  // Play Time Lapse animation
  let timer = null;
  playTimeBtn.addEventListener('click', () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
      playTimeBtn.textContent = '▶ Play Time Lapse';
      return;
    }

    if (state.day >= 7.0) state.setDay(0.0);
    playTimeBtn.textContent = '⏸ Pause';

    timer = setInterval(() => {
      let nextDay = state.day + 0.2;
      if (nextDay >= 7.0) {
        nextDay = 7.0;
        clearInterval(timer);
        timer = null;
        playTimeBtn.textContent = '▶ Play Time Lapse';
      }
      state.setDay(nextDay);
      engine.setDay(nextDay);
      daySlider.value = nextDay;
      dayVal.textContent = `Day ${nextDay.toFixed(1)}`;
    }, 100);
  });

  // Reset
  resetBtn.addEventListener('click', () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
      playTimeBtn.textContent = '▶ Play Time Lapse';
    }
    state.reset();
    engine.setDay(0.0);
    engine.setProtection('none');
    daySlider.value = 0;
    dayVal.textContent = 'Day 0.0';
    protectionSelect.value = 'none';
    soundManager.playGlassClink();
  });

  function updateTelemetry() {
    const corrA = engine.getTubeCorrosionPercent(TUBES_CONFIG[0]);
    const corrB = engine.getTubeCorrosionPercent(TUBES_CONFIG[1]);
    const corrC = engine.getTubeCorrosionPercent(TUBES_CONFIG[2]);
    const corrD = engine.getTubeCorrosionPercent(TUBES_CONFIG[3]);

    telA.textContent = corrA > 0 ? `${corrA.toFixed(1)}% Rust (Mass: ${engine.getNailMass(TUBES_CONFIG[0]).toFixed(3)}g)` : 'No Rust (5.000g)';
    telB.textContent = corrB > 0 ? `${corrB.toFixed(1)}% Rust` : 'No Rust (No Dissolved O₂)';
    telC.textContent = corrC > 0 ? `${corrC.toFixed(1)}% Rust` : 'No Rust (No Moisture)';
    telD.textContent = corrD > 0 ? `${corrD.toFixed(1)}% Rapid Rust (Mass: ${engine.getNailMass(TUBES_CONFIG[3]).toFixed(3)}g)` : 'No Rust (5.000g)';
  }

  state.subscribe(() => {
    updateTelemetry();
    renderer.render();
  });

  updateTelemetry();
}
