/**
 * Application Entry Point - Stomatal Transpiration & Guard Cell Turgidity Virtual Lab
 */
import { StomataModel } from './stomata_model.js';
import { CanvasRenderer } from './renderer.js';
import { UIController } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simCanvas');
  const model = new StomataModel();
  const renderer = new CanvasRenderer(canvas, model);
  const ui = new UIController(model, renderer);

  const handleResize = () => {
    renderer.resize();
    ui.updateAll();
  };

  window.addEventListener('resize', handleResize);
  setTimeout(handleResize, 50);

  // Animation loop for ion pulsing and transpiration gas particles
  const loop = () => {
    renderer.render();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
});
