/**
 * Tyndall Effect, Colloids & Suspensions — Application Lifecycle Entry Point
 * Orchestrates simulation loop, physics updates, and responsive rendering.
 * Strictly adheres to Simulation Guidelines: requestAnimationFrame with try...catch guards.
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('simulation-canvas');
  if (!canvas) {
    console.error('Simulation canvas not found in DOM.');
    return;
  }

  // 1. Initialize Core Systems
  const state = new TyndallState();
  const soundEngine = new TyndallSound();
  const engine = new TyndallEngine(state, soundEngine);
  const renderer = new TyndallRenderer(canvas, state);
  const ui = new TyndallUI(state, soundEngine, renderer);

  // 2. Responsive Canvas Resize Listener
  function handleResize() {
    renderer.resize();
  }

  window.addEventListener('resize', handleResize);
  // Initial layout sizing
  handleResize();

  // 3. Main Animation Loop with Simulation Guideline Error Guard
  let lastTime = performance.now();

  function animate(now) {
    requestAnimationFrame(animate);

    try {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Update physics and Brownian trajectories
      engine.update(dt);

      // Render 2D apparatus
      renderer.render();
    } catch (err) {
      console.error('Simulation animation loop error:', err);
    }
  }

  requestAnimationFrame(animate);
});
