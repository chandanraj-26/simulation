/**
 * Application Entry Point for Le Chatelier Simulator
 */

import { EquilibriumEngine } from './equilibrium_engine.js';
import { EquilibriumRenderer } from './renderer.js';
import { EquilibriumUI } from './ui.js';
import { state } from './state.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simulation-canvas');
  if (!canvas) return;

  const engine = new EquilibriumEngine();
  const renderer = new EquilibriumRenderer(canvas, engine, state);
  const ui = new EquilibriumUI(engine, state);

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
    ui.update(engine.getMetrics(state.selectedTubeIndex));

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
});
