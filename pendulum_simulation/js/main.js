/**
 * PendulumLab — Main Application Entry Point
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('pendulumCanvas');
  if (!canvas) {
    console.error('Pendulum canvas element not found!');
    return;
  }

  // 1. Initialize Renderer
  window.pendulumRenderer = new PendulumRenderer(canvas);
  window.pendulumRenderer.resize();

  // 2. Initialize UI Controller
  window.pendulumUI = new PendulumUI();

  // 3. Handle window resizing
  window.addEventListener('resize', () => {
    if (window.pendulumRenderer) {
      window.pendulumRenderer.resize();
    }
  });

  // 4. Audio Unlock on first user gesture
  const unlockAudio = () => {
    if (window.soundEngine) window.soundEngine.init();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);

  // 5. Protected 60 FPS Animation Loop
  function loop() {
    try {
      if (window.pendulumRenderer) {
        window.pendulumRenderer.render();
      }
    } catch (err) {
      console.error('PendulumLab Render Loop Error:', err);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  console.log('🕰️ PendulumLab Initialized Successfully.');
});
