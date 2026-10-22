/**
 * Reaction Kinetics — Application Bootstrap & 60 FPS Animation Loop
 * Orchestrates Arrhenius kinetics differential integration, canvas 2D rendering, and UI sync.
 */

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('kineticsCanvas');
  if (!canvas) {
    console.error('Kinetics canvas element not found.');
    return;
  }

  // 1. Initialize State
  const state = window.kineticsState;

  // 2. Initialize Sound Engine
  const sound = new window.KineticsSoundEngine(state);
  window.kineticsSound = sound;

  // 3. Initialize Chemical Physics & Kinetics Engine
  const engine = new window.KineticsEngine(state);
  window.kineticsEngine = engine;

  // 4. Initialize Canvas 2D Renderer
  const renderer = new window.KineticsRenderer(canvas, state, engine);
  window.kineticsRenderer = renderer;

  // 5. Initialize UI Controller
  const ui = new window.KineticsUI(state, engine);
  window.kineticsUI = ui;

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
    const deltaSec = Math.min(0.1, (now - lastTime) / 1000.0);
    lastTime = now;

    try {
      // Numerical chemical kinetics integration
      engine.update(deltaSec);

      // Canvas render step
      renderer.render();

      // UI telemetry sync
      ui.updateTelemetry();
    } catch (err) {
      console.error('Kinetics animation loop error:', err);
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  console.log('Reaction Kinetics (Disappearing Cross) Simulator initialized successfully.');
});
