/**
 * main.js
 * Initializes the Combustion, Flame Zones & Calorific Value virtual lab.
 */

import { CombustionEngine } from './combustion_engine.js';
import { CombustionRenderer } from './renderer.js';
import { state } from './state.js';
import { setupUI } from './ui.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('combustionCanvas');
  const engine = new CombustionEngine();
  const renderer = new CombustionRenderer(canvas, engine, state);

  renderer.resize();
  renderer.render();

  window.addEventListener('resize', () => {
    renderer.resize();
    renderer.render();
  });

  setupUI(engine, renderer);
});
