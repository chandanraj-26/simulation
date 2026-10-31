/**
 * Application Entry Point - Density, Mass & Buoyancy Virtual Lab
 */
import { BuoyancyModel } from './physics.js';
import { CanvasRenderer } from './renderer.js';
import { UIController } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simCanvas');
  const model = new BuoyancyModel();
  const renderer = new CanvasRenderer(canvas, model);
  const ui = new UIController(model, renderer);

  const handleResize = () => {
    renderer.resize();
    ui.updateAll();
  };

  window.addEventListener('resize', handleResize);
  setTimeout(handleResize, 50);

  // Physics animation loop
  let lastTime = performance.now();
  const loop = (currentTime) => {
    const dt = Math.min(0.033, (currentTime - lastTime) / 1000);
    lastTime = currentTime;

    model.updatePhysics(dt);
    renderer.render();

    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
});
