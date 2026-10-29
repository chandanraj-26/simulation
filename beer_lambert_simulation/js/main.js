/**
 * main.js
 * Initializes the Spectrophotometry & Beer-Lambert Law virtual lab.
 */

import { SpectroEngine } from './spectro_engine.js';
import { SpectroRenderer } from './renderer.js';
import { state } from './state.js';
import { setupUI } from './ui.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('spectroCanvas');
  const engine = new SpectroEngine(state.solute, state.pathLengthCm, state.concentrationM);
  const renderer = new SpectroRenderer(canvas, engine, state);

  renderer.resize();
  renderer.render();

  window.addEventListener('resize', () => {
    renderer.resize();
    renderer.render();
  });

  setupUI(engine, renderer);
});
