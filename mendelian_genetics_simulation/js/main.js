/**
 * Application Entry Point - Mendelian Genetics Cross Virtual Lab
 */
import { GeneticsModel } from './genetics_model.js';
import { CanvasRenderer } from './renderer.js';
import { UIController } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simCanvas');
  const model = new GeneticsModel();
  const renderer = new CanvasRenderer(canvas, model);
  const ui = new UIController(model, renderer);

  const handleResize = () => {
    renderer.resize();
    ui.updateAll();
  };

  window.addEventListener('resize', handleResize);
  setTimeout(handleResize, 50);
});
