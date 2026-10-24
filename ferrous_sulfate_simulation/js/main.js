/**
 * Thermal Decomposition of Ferrous Sulfate — Application Entry Point
 * Orchestrates animation loop, physics, audio, and responsive canvas sizing.
 * Strictly adheres to Simulation Guidelines: requestAnimationFrame with try...catch guards.
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simulation-canvas');
  if (!canvas) {
    console.error('Simulation canvas not found in DOM.');
    return;
  }

  // 1. Initialize simulation subsystems
  const state = new ReactionState();
  const soundEngine = new ReactionSound();
  const engine = new ThermalEngine(state, soundEngine);
  const renderer = new ReactionRenderer(canvas, state);
  const ui = new ReactionUI(state, soundEngine, renderer);

  // 2. Responsive canvas resize
  function handleResize() {
    renderer.resize();
  }

  window.addEventListener('resize', handleResize);
  handleResize();

  // 3. Animation loop with simulation guidelines error guard
  let lastTime = performance.now();

  function animate(now) {
    requestAnimationFrame(animate);

    try {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Update thermal kinetics and particles
      engine.update(dt);

      // Render apparatus
      renderer.render();
    } catch (err) {
      console.error('Simulation animation loop error:', err);
    }
  }

  requestAnimationFrame(animate);
});
