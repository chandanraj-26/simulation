/**
 * DopplerLab — Main Application Entry Point
 * Bootstraps renderer, UI controller, audio unlock gestures, and 60 FPS animation loop.
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('dopplerCanvas');
  if (!canvas) {
    console.error('Doppler canvas element not found!');
    return;
  }

  // 1. Initialize High-DPI Wavefront Renderer
  window.dopplerRenderer = new DopplerRenderer(canvas);
  window.dopplerRenderer.resize();

  // 2. Initialize UI Controller
  window.dopplerUI = new DopplerUI();

  // 3. Handle Window Resizing
  window.addEventListener('resize', () => {
    if (window.dopplerRenderer) {
      window.dopplerRenderer.resize();
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
      if (window.dopplerRenderer) {
        window.dopplerRenderer.render();
      }
    } catch (err) {
      console.error('DopplerLab Render Loop Error:', err);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  console.log('🔊 DopplerLab Initialized Successfully.');
});
