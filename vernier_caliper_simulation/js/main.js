/**
 * Application Entry Point - Vernier Caliper & Screw Gauge Virtual Lab
 */
import { InstrumentModel } from './caliper.js';
import { CanvasRenderer } from './renderer.js';
import { UIController } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simCanvas');
  const model = new InstrumentModel();
  const renderer = new CanvasRenderer(canvas, model);
  const ui = new UIController(model, renderer);

  // Resize handler
  const handleResize = () => {
    renderer.resize();
    ui.updateAll();
  };

  window.addEventListener('resize', handleResize);
  // Initial size setup
  setTimeout(handleResize, 50);

  // Default clamp to ball bearing
  model.clampToObject();
  ui.updateAll();
});
