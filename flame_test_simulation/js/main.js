/**
 * Flame Test — Application Bootstrap & 60 FPS Animation Loop
 * Orchestrates thermal particle physics, canvas 2D rendering, and UI sync.
 */

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('flameCanvas');
  if (!canvas) {
    console.error('Flame canvas element not found.');
    return;
  }

  // 1. Initialize State
  const state = window.flameState;

  // 2. Initialize Sound Engine
  const sound = new window.FlameSoundEngine(state);
  window.flameSound = sound;

  // 3. Initialize Particle & Thermal Engine
  const engine = new window.FlameEngine(state);
  window.flameEngine = engine;

  // 4. Initialize Canvas 2D Renderer
  const renderer = new window.FlameRenderer(canvas, state, engine);
  window.flameRenderer = renderer;

  // 5. Initialize UI Controller
  const ui = new window.FlameUI(state, engine);
  window.flameUI = ui;

  // 6. Responsive Window Resize Handler
  let resizeTimeout = null;
  const handleResize = () => {
    renderer.resize();
  };
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
  });

  // 7. 60 FPS Animation Loop with Exception Safeguard
  let lastTime = performance.now();
  function animate(now) {
    const dt = Math.min(2.0, (now - lastTime) / 16.666);
    lastTime = now;

    try {
      // Physics update step
      engine.update(dt);

      // Canvas render step
      renderer.render();

      // UI telemetry sync
      ui.updateTelemetry();
    } catch (err) {
      console.error('Flame animation loop error:', err);
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  console.log('Flame Test & Atomic Emission Spectra Simulation initialized successfully.');
});
