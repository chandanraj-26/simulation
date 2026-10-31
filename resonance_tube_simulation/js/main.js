/**
 * Application Entry Point - Resonance Air Column & Speed of Sound Lab
 */
import { ResonanceModel } from './resonance_model.js';
import { CanvasRenderer } from './renderer.js';
import { UIController } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simCanvas');
  const model = new ResonanceModel();
  const renderer = new CanvasRenderer(canvas, model);
  const ui = new UIController(model, renderer);

  const handleResize = () => {
    renderer.resize();
    ui.updateAll();
  };

  window.addEventListener('resize', handleResize);
  setTimeout(handleResize, 50);

  // Animation loop for vibrating tines & standing waves
  const loop = () => {
    renderer.render();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
});
