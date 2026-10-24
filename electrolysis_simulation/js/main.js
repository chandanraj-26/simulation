/**
 * Electrolysis & Electroplating — Application Entry Point
 * Coordinates animation loop, error guards, physics stepping, and rendering.
 */

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simCanvas');
  if (!canvas) {
    console.error('Simulation canvas element not found!');
    return;
  }

  // Instantiate Modules
  const state = new ElectrolysisState();
  const sound = new ElectrolysisSoundEngine(state);
  const engine = new ElectrolysisEngine(state, sound);
  const renderer = new ElectrolysisRenderer(canvas, state);
  const ui = new ElectrolysisUI(state, sound, renderer);

  // Resize handling
  window.addEventListener('resize', () => {
    renderer.resize();
  });

  // Secondary layout transition resize check
  setTimeout(() => {
    renderer.resize();
  }, 320);

  // Animation Loop with RK4 / Delta Time
  let lastTimestamp = performance.now();

  function animate(now) {
    try {
      const dt = (now - lastTimestamp) / 1000.0;
      lastTimestamp = now;

      // Update electrochemistry physics
      engine.update(dt);

      // Render apparatus
      renderer.render();

      // Update live telemetry HUD numbers
      ui.renderTelemetry();
    } catch (err) {
      console.error('Simulation loop error:', err);
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  console.log('Electrolysis & Electroplating Simulation initialized successfully.');
});
