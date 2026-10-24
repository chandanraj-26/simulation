/**
 * Law of Conservation of Mass — Application Entry Point
 * Orchestrates animation loop, physics step updates, apparatus rendering, and error guards.
 */

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simCanvas');
  if (!canvas) {
    console.error('Simulation canvas element not found!');
    return;
  }

  // Instantiate Modules
  const state = new MassState();
  const sound = new MassSoundEngine(state);
  const engine = new MassEngine(state, sound);
  const renderer = new MassRenderer(canvas, state);
  const ui = new MassUI(state, sound, renderer);

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

      // Update tilting and particle physics
      engine.update(dt);

      // Render balance and flask apparatus
      renderer.render();

      // Render live telemetry
      ui.renderTelemetry();
    } catch (err) {
      console.error('Simulation loop error:', err);
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  console.log('Conservation of Mass Simulation initialized successfully.');
});
