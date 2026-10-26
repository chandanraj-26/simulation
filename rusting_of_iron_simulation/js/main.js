/**
 * main.js
 * Initializes the Rusting of Iron experiment virtual lab.
 */

import { RustingEngine } from './rusting_engine.js';
import { RustingRenderer } from './renderer.js';
import { state } from './state.js';
import { setupUI } from './ui.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('rustingCanvas');
  const engine = new RustingEngine(state.protectionMethod);
  const renderer = new RustingRenderer(canvas, engine, state);

  renderer.resize();
  renderer.render();

  window.addEventListener('resize', () => {
    renderer.resize();
    renderer.render();
  });

  setupUI(engine, renderer);
});
