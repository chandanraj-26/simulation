/**
 * Kinetic Gas Laws — Application Bootstrap & 60 FPS Animation Loop
 * Orchestrates micro-particle elastic collision integration, canvas 2D rendering, and UI sync.
 */

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gasCanvas');
  if (!canvas) {
    console.error('Gas laws canvas element not found.');
    return;
  }

  // 1. Initialize State Store
  const state = window.gasState;

  // 2. Initialize Sound Engine
  const sound = new window.GasSoundEngine(state);
  window.gasSound = sound;

  // 3. Initialize Kinetic Gas Engine
  const engine = new window.GasEngine(state);
  window.gasEngine = engine;

  // 4. Initialize Canvas 2D Renderer
  const renderer = new window.GasRenderer(canvas, state, engine);
  window.gasRenderer = renderer;

  // 5. Initialize UI Controller
  const ui = new window.GasUI(state, engine);
  window.gasUI = ui;

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
    const deltaSec = Math.min(0.08, (now - lastTime) / 1000.0);
    lastTime = now;

    try {
      // Elastic wall collision and particle physics step
      const bounds = renderer.getChamberBounds();
      engine.update(deltaSec, bounds);

      // Canvas render step
      renderer.render();

      // UI telemetry sync
      ui.updateTelemetry();
    } catch (err) {
      console.error('Gas laws animation loop error:', err);
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  console.log('Kinetic Gas Laws & Ideal Gas Simulator initialized successfully.');
});
