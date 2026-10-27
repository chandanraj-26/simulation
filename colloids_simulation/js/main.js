/**
 * Application Entry Point for Colloids Simulation
 */

import { ColloidEngine } from './colloid_engine.js';
import { ColloidRenderer } from './renderer.js';
import { ColloidUI } from './ui.js';
import { state } from './state.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simulation-canvas');
  if (!canvas) return;

  const engine = new ColloidEngine();
  const renderer = new ColloidRenderer(canvas, engine, state);
  const ui = new ColloidUI(engine, state);

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
