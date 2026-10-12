/**
 * SpringLab — Main Application Entry Point
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('springCanvas');
  if (!canvas) {
    console.error('Spring canvas element not found!');
    return;
  }

  // 1. Initialize Renderer
  window.springRenderer = new SpringRenderer(canvas);
  window.springRenderer.resize();

  // 2. Initialize UI Controller
  window.springUI = new SpringUI();

  // 3. Handle window resizing
  window.addEventListener('resize', () => {
    if (window.springRenderer) {
      window.springRenderer.resize();
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
      if (window.springRenderer) {
        window.springRenderer.render();
      }
    } catch (err) {
      console.error('SpringLab Render Loop Error:', err);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  console.log('⚖️ SpringLab Initialized Successfully.');
});
