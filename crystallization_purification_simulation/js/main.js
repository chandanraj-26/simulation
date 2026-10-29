/**
 * main.js
 * Initializes the Crystallization & Purification virtual lab.
 */

import { CrystallizationEngine } from './crystallization_engine.js';
import { CrystallizationRenderer } from './renderer.js';
import { state } from './state.js';
import { setupUI } from './ui.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('crystCanvas');
  const engine = new CrystallizationEngine();
  const renderer = new CrystallizationRenderer(canvas, engine, state);

  renderer.resize();
  renderer.render();

  window.addEventListener('resize', () => {
    renderer.resize();
    renderer.render();
  });

  setupUI(engine, renderer);
});
