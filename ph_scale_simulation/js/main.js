/**
 * Application Entry Point - pH Scale & Dilution Virtual Lab
 */
import { PHModel } from './ph_model.js';
import { CanvasRenderer } from './renderer.js';
import { UIController } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simCanvas');
  const model = new PHModel();
  const renderer = new CanvasRenderer(canvas, model);
  const ui = new UIController(model, renderer);

  const handleResize = () => {
    renderer.resize();
    ui.updateAll();
  };

  window.addEventListener('resize', handleResize);
  setTimeout(handleResize, 50);

  // Animation render loop for meniscus waves and ion particles
  const loop = () => {
    renderer.render();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
});
