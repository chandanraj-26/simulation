/**
 * main.js
 * Initializes the Diffraction simulation app.
 */

import { DiffractionEngine } from './diffraction_engine.js';
import { DiffractionRenderer } from './renderer.js';
import { state } from './state.js';
import { setupUI } from './ui.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('diffractionCanvas');
  const engine = new DiffractionEngine(state.wavelengthNm, state.slitWidthMm, state.screenDistanceM);
  const renderer = new DiffractionRenderer(canvas, engine, state);

  // Initial resize and render
  renderer.resize();
  renderer.render();

  window.addEventListener('resize', () => {
    renderer.resize();
    renderer.render();
  });

  // Setup UI event listeners
  setupUI(engine, renderer);
});
