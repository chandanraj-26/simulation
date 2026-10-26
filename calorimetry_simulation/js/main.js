/**
 * Application Entry Point for Calorimetry Simulation
 */

import { CalorimetryEngine } from './calorimetry_engine.js';
import { CalorimetryRenderer } from './renderer.js';
import { CalorimetryUI } from './ui.js';
import { state } from './state.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simulation-canvas');
  if (!canvas) return;

  const engine = new CalorimetryEngine();
  const renderer = new CalorimetryRenderer(canvas, engine, state);
  const ui = new CalorimetryUI(engine, state);

  const onResize = () => {
    renderer.resize();
  };
  window.addEventListener('resize', onResize);
  setTimeout(onResize, 100);

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
