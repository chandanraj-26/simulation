/**
 * ui.js
 * Controls, event listeners, and live telemetry updates for scalable meter bridge lab.
 */

import { state } from './state.js';
import { soundManager } from './sound.js';

export function setupUI(engine, renderer) {
  const wireLengthSelect = document.getElementById('wireLengthSelect');
  const wireSelect = document.getElementById('wireSelect');
  const knownRSelect = document.getElementById('knownRSelect');
  const jockeySlider = document.getElementById('jockeySlider');
  const jockeyVal = document.getElementById('jockeyVal');
  const resetBtn = document.getElementById('resetBtn');

  // Telemetry elements
  const telL = document.getElementById('telL');
  const telRemL = document.getElementById('telRemL');
  const telGalvDeflection = document.getElementById('telGalvDeflection');
  const telCalcX = document.getElementById('telCalcX');
  const telResistivity = document.getElementById('telResistivity');
  const balanceAlert = document.getElementById('balanceAlert');

  // Wire length select (Scaling)
  wireLengthSelect.addEventListener('change', (e) => {
    const len = parseFloat(e.target.value);
    state.setTotalWireLength(len);
    engine.setTotalWireLength(len);

    jockeySlider.max = len - 0.5;
    jockeySlider.step = len <= 200 ? 0.1 : 0.5;
    jockeySlider.value = state.jockeyPosCm;
    jockeyVal.textContent = `${state.jockeyPosCm.toFixed(1)} cm`;
    soundManager.playKeyClick();
  });

  // Wire coil select
  wireSelect.addEventListener('change', (e) => {
    state.setUnknownWire(e.target.value);
    engine.setUnknownWire(state.unknownWire);
    soundManager.playKeyClick();
  });

  // Known R select
  knownRSelect.addEventListener('change', (e) => {
    const r = parseFloat(e.target.value);
    state.setKnownR(r);
    engine.setKnownResistance(r);
    soundManager.playKeyClick();
  });

  // Jockey slider
  jockeySlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.setJockeyPos(val);
    jockeyVal.textContent = `${val.toFixed(1)} cm`;
    soundManager.playJockeySlide();
  });

  // Reset
  resetBtn.addEventListener('click', () => {
    state.reset();
    engine.setTotalWireLength(state.totalWireLengthCm);
    engine.setKnownResistance(state.knownR);
    engine.setUnknownWire(state.unknownWire);

    wireLengthSelect.value = state.totalWireLengthCm;
    jockeySlider.max = state.totalWireLengthCm - 0.5;
    wireSelect.value = state.unknownWire.id;
    knownRSelect.value = state.knownR;
    jockeySlider.value = state.jockeyPosCm;
    jockeyVal.textContent = `${state.jockeyPosCm.toFixed(1)} cm`;
    soundManager.playKeyClick();
  });

  // Canvas interaction: drag or click along wire
  const canvas = renderer.canvas;
  let isDragging = false;

  function updateJockeyFromCanvas(e) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const padX = Math.max(20, canvas.clientWidth * 0.03);
    const boardX = padX;
    const boardW = canvas.clientWidth - padX * 2;
    const wireStartX = boardX + 75;
    const wireEndX = boardX + boardW - 75;
    const wireLenPx = wireEndX - wireStartX;

    const clampedX = Math.max(wireStartX, Math.min(wireEndX, clickX));
    const posCm = ((clampedX - wireStartX) / wireLenPx) * state.totalWireLengthCm;
    state.setJockeyPos(posCm);
    jockeySlider.value = posCm;
    jockeyVal.textContent = `${posCm.toFixed(1)} cm`;
    soundManager.playJockeySlide();
  }

  canvas.addEventListener('pointerdown', (e) => {
    isDragging = true;
    updateJockeyFromCanvas(e);
  });

  window.addEventListener('pointermove', (e) => {
    if (isDragging) updateJockeyFromCanvas(e);
  });

  window.addEventListener('pointerup', () => {
    isDragging = false;
  });

  // Update telemetry and check null balance
  let wasNull = false;
  function updateTelemetry() {
    const totalL = state.totalWireLengthCm;
    const l = state.jockeyPosCm;
    const remL = totalL - l;
    const deflection = engine.getGalvanometerDeflection(l);
    const calcX = engine.calculateUnknownResistance(l);
    const radiusMm = state.wireDiameterMm / 2.0;
    const rho = engine.calculateResistivity(calcX, radiusMm, state.wireLengthCm);

    telL.textContent = `${l.toFixed(1)} cm`;
    telRemL.textContent = `${remL.toFixed(1)} cm`;

    const isNull = Math.abs(deflection) < 0.4;
    if (isNull) {
      telGalvDeflection.textContent = '0.0 div (NULL BALANCE)';
      telGalvDeflection.style.color = '#16A34A';
      balanceAlert.style.display = 'block';
      if (!wasNull) soundManager.playNullChime();
    } else {
      telGalvDeflection.textContent = `${deflection > 0 ? '+' : ''}${deflection.toFixed(1)} div`;
      telGalvDeflection.style.color = '#DC2626';
      balanceAlert.style.display = 'none';
    }
    wasNull = isNull;

    telCalcX.textContent = `${calcX.toFixed(2)} Ω`;
    telResistivity.textContent = `${rho.toExponential(2)} Ω·m`;
  }

  state.subscribe(() => {
    updateTelemetry();
    renderer.render();
  });

  updateTelemetry();
}
