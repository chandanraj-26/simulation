/**
 * Application Entry Point for Potentiometer Laboratory
 */

import { PotentiometerEngine } from './potentiometer_engine.js';
import { PotentiometerRenderer } from './renderer.js';
import { PotentiometerUI } from './ui.js';
import { state } from './state.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simulation-canvas');
  if (!canvas) return;

  const engine = new PotentiometerEngine();
  const renderer = new PotentiometerRenderer(canvas, engine, state);
  const ui = new PotentiometerUI(engine, state);

  const onResize = () => {
    renderer.resize();
  };
  window.addEventListener('resize', onResize);
  setTimeout(onResize, 100);

  let lastTimestamp = performance.now();

  function loop(now) {
    lastTimestamp = now;

    renderer.draw();
    ui.update(engine.getMetrics());

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
});
