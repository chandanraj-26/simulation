/**
 * DiamondCutSim — Main Application Entry Point
 * Orchestrates canvas renderer, state store, UI bindings, and animation loop.
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('diamondCanvas');
  if (!canvas) {
    console.error('Diamond canvas element not found!');
    return;
  }

  // 1. Initialize Renderer
  const renderer = new DiamondRenderer(canvas);

  // 2. Initialize UI
  const ui = new DiamondUI();
  ui.setRenderer(renderer);
  window.diamondUI = ui;

  // 3. Sync initial UI controls with state
  ui.syncControlsFromState();

  // 4. Animation loop
  function loop(timestamp) {
    renderer.render();
    ui.updateHUD();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  // Audio gesture unlock on first click anywhere
  const unlockAudio = () => {
    if (window.soundEngine) {
      window.soundEngine.init();
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });

  console.log('💎 DiamondCutSim initialized successfully!');
});
