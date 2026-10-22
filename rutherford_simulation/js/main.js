/**
 * Rutherford Alpha Scattering — Application Entry Point
 * Orchestrates animation loop, physics step updates, apparatus rendering, and error guards.
 */

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simCanvas');
  if (!canvas) {
    console.error('Simulation canvas element not found!');
    return;
  }

  // Instantiate Modules
  const state = new RutherfordState();
  const sound = new RutherfordSoundEngine(state);
  const engine = new RutherfordEngine(state, sound);
  const renderer = new RutherfordRenderer(canvas, state);
  const ui = new RutherfordUI(state, sound, renderer);

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

      // Update scattering physics & particle positions
      engine.update(dt);

      // Render apparatus
      renderer.render();

      // Render live telemetry
      ui.renderTelemetry();
    } catch (err) {
      console.error('Simulation loop error:', err);
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  console.log('Rutherford Scattering Simulation initialized successfully.');
});
