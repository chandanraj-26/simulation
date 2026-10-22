/**
 * CardiacSim — Application Bootstrap & Animation Loop
 * Orchestrates the 60 FPS cardiac physics update, canvas rendering, and UI synchronization.
 */

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('cardiacCanvas');
  if (!canvas) {
    console.error('Cardiac simulation canvas not found.');
    return;
  }

  // 1. Initialize State
  const state = window.cardiacState;

  // 2. Initialize Sound Engine
  const sound = window.cardiacSound;

  // 3. Initialize Cardiac Engine
  const engine = new window.CardiacEngine(state);
  window.cardiacEngine = engine;

  // 4. Initialize Renderer
  const renderer = new window.CardiacRenderer(canvas, state);
  window.cardiacRenderer = renderer;

  // 5. Initialize UI Controller
  const ui = new window.CardiacUI(state);
  window.cardiacUI = ui;

  // 6. Handle Window Resize
  let resizeTimeout = null;
  const handleResize = () => {
    renderer.resize();
  };
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
  });

  // 7. High-Precision 60 FPS Animation Loop
  let lastTime = performance.now();

  function animate(currentTime) {
    const dt = Math.min(0.1, (currentTime - lastTime) / 1000); // Clamp max dt to 100ms
    lastTime = currentTime;

    // Physics & Hemodynamics Step
    engine.update(dt);

    // Canvas 2D Render Step
    renderer.render();

    // UI Telemetry Sync Step (every frame or throttled)
    ui.updateTelemetry();

    requestAnimationFrame(animate);
  }

  requestAnimationFrame((time) => {
    lastTime = time;
    requestAnimationFrame(animate);
  });

  console.log('Human Cardiac Cycle & ECG Simulator initialized successfully.');
});
