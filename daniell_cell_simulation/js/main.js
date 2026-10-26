/**
 * Application Entry Point for Daniell Cell
 */

import { DaniellEngine } from './daniell_engine.js';
import { DaniellRenderer } from './renderer.js';
import { DaniellUI } from './ui.js';
import { state } from './state.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simulation-canvas');
  if (!canvas) return;

  const engine = new DaniellEngine();
  const renderer = new DaniellRenderer(canvas, engine, state);
  const ui = new DaniellUI(engine, state);

  // Resize listener
  const onResize = () => {
    renderer.resize();
  };
  window.addEventListener('resize', onResize);
  setTimeout(onResize, 100);

  // Animation Loop
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
