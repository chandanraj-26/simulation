/**
 * main.js
 * Initializes the Qualitative Salt Analysis virtual lab.
 */

import { SaltEngine } from './salt_engine.js';
import { SaltRenderer } from './renderer.js';
import { state } from './state.js';
import { setupUI } from './ui.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('saltCanvas');
  const engine = new SaltEngine(state.activeSalt);
  const renderer = new SaltRenderer(canvas, engine, state);

  renderer.resize();
  renderer.render();

  window.addEventListener('resize', () => {
    renderer.resize();
    renderer.render();
  });

  setupUI(engine, renderer);
});
