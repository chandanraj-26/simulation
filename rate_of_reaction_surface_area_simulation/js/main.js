/**
 * main.js
 * Initializes the Rate of Reaction & Surface Area virtual lab.
 */

import { ReactionEngine } from './reaction_engine.js';
import { ReactionRenderer } from './renderer.js';
import { state } from './state.js';
import { setupUI } from './ui.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('reactionCanvas');
  const engine = new ReactionEngine(state.particleSize, state.conc);
  const renderer = new ReactionRenderer(canvas, engine, state);

  renderer.resize();
  renderer.render();

  window.addEventListener('resize', () => {
    renderer.resize();
    renderer.render();
  });

  setupUI(engine, renderer);
});
