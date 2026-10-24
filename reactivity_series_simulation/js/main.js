/**
 * Reactivity Series & Metal Displacement Reactions — Application Entry Point
 * Orchestrates animation loop, physics step updates, apparatus rendering, and error guards.
 */

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simCanvas');
  if (!canvas) {
    console.error('Simulation canvas element not found!');
    return;
  }

  // Instantiate Modules
  const state = new ReactivityState();
  const sound = new ReactivitySoundEngine(state);
  const engine = new ReactivityEngine(state, sound);
  const renderer = new ReactivityRenderer(canvas, state);
  const ui = new ReactivityUI(state, sound, renderer);

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

      // Update thermochemistry and particle kinetics
      engine.update(dt);

      // Render canvas apparatus
      renderer.render();

      // Render live telemetry
      ui.renderTelemetry();
    } catch (err) {
      console.error('Simulation loop error:', err);
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  console.log('Reactivity Series Simulation initialized successfully.');
});
