/**
 * Solubility & Crystallization — Application Entry Point
 * Orchestrates animation loop, physics step updates, apparatus rendering, and error guards.
 */

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simCanvas');
  if (!canvas) {
    console.error('Simulation canvas element not found!');
    return;
  }

  // Instantiate Modules
  const state = new SolubilityState();
  const sound = new SolubilitySoundEngine(state);
  const engine = new SolubilityEngine(state, sound);
  const renderer = new SolubilityRenderer(canvas, state);
  const ui = new SolubilityUI(state, sound, renderer);

  // Responsive Auto-Resize
  window.addEventListener('resize', () => {
    renderer.resize();
  });

  setTimeout(() => {
    renderer.resize();
  }, 320);

  // Animation Loop
  let lastTimestamp = performance.now();

  function animate(now) {
    try {
      const dt = (now - lastTimestamp) / 1000.0;
      lastTimestamp = now;

      // Update thermodynamics and crystal kinetics
      engine.update(dt);

      // Render apparatus and phase chart
      renderer.render();

      // Render live telemetry
      ui.renderTelemetry();
    } catch (err) {
      console.error('Simulation loop error:', err);
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  console.log('Solubility & Crystallization Simulation initialized successfully.');
});
