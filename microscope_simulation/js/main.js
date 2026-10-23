/**
 * MicroscopeSim — Application Bootstrap & Animation Loop
 * Orchestrates optical engine updates, canvas 2D rendering, and UI synchronization.
 */

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('microscopeCanvas');
  if (!canvas) {
    console.error('Microscope canvas element not found.');
    return;
  }

  // 1. Initialize State
  const state = window.microscopeState;

  // 2. Initialize Sound
  const sound = window.microscopeSound;

  // 3. Initialize Optical Engine
  const engine = new window.MicroscopeEngine(state);
  window.microscopeEngine = engine;

  // 4. Initialize Renderer
  const renderer = new window.MicroscopeRenderer(canvas, state, engine);
  window.microscopeRenderer = renderer;

  // 5. Initialize UI Controller
  const ui = new window.MicroscopeUI(state, engine);
  window.microscopeUI = ui;

  // 6. Handle Window Resize
  let resizeTimeout = null;
  const handleResize = () => {
    renderer.resize();
  };
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
  });

  // 7. 60 FPS Animation & Rendering Loop
  function animate() {
    try {
      // Optical calculation step
      engine.update();

      // Canvas render step
      renderer.render();

      // UI telemetry sync
      ui.updateTelemetry();
    } catch (err) {
      console.error('Microscope animation loop error:', err);
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  console.log('Virtual Compound Microscope & Mitosis Simulator initialized successfully.');
});
