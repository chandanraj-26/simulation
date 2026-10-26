/**
 * Main Application Entry Point
 * Paper Chromatography & Plant Pigments Virtual Laboratory
 */

import { ChromatographyEngine } from './chromatography_engine.js';
import { ChromatographyRenderer } from './renderer.js';
import { ChromatographyUI } from './ui.js';
import { state } from './state.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simulation-canvas');
  if (!canvas) return;

  const engine = new ChromatographyEngine();
  const renderer = new ChromatographyRenderer(canvas, engine, state);
  const ui = new ChromatographyUI(engine, state);

  // Initialize with selected sample and solvent
  engine.loadExperiment(state.getSample(), state.getSolvent());

  // Handle resizing
  const onResize = () => {
    renderer.resize();
  };
  window.addEventListener('resize', onResize);
  setTimeout(onResize, 100);

  // 60 FPS Animation Loop
  let lastTimestamp = performance.now();

  function loop(now) {
    const deltaSeconds = Math.min(0.1, (now - lastTimestamp) / 1000);
    lastTimestamp = now;

    engine.update(deltaSeconds);
    renderer.draw();
    ui.update(engine.getMetrics());

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
});
