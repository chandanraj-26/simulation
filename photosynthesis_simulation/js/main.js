/**
 * PhotosynthesisLab — Main Application Entry Point
 * Sets up canvas, initializes rendering loop, audio unlock, and handles window resizing.
 */

window.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Sound Engine
  window.soundEngine = new SoundEngine();

  // 2. Unlock Web Audio on first user interaction
  const unlockAudio = () => {
    if (window.soundEngine) {
      window.soundEngine.init();
    }
    document.removeEventListener('pointerdown', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
  };
  document.addEventListener('pointerdown', unlockAudio);
  document.addEventListener('keydown', unlockAudio);

  // 3. Setup Canvas & High-DPI Renderer
  const canvas = document.getElementById('simCanvas');
  if (!canvas) {
    console.error('Canvas #simCanvas not found in DOM!');
    return;
  }

  window.photosynthesisRenderer = new PhotosynthesisRenderer(canvas);
  window.photosynthesisRenderer.resize();

  // Resize handler with ResizeObserver
  if (window.ResizeObserver && canvas.parentElement) {
    const ro = new ResizeObserver(() => {
      window.photosynthesisRenderer.resize();
    });
    ro.observe(canvas.parentElement);
  } else {
    window.addEventListener('resize', () => {
      window.photosynthesisRenderer.resize();
    });
  }

  // 4. Initialize UI Controller
  window.photosynthesisUI = new PhotosynthesisUI();
  window.photosynthesisUI.updateZoomLabel();

  // 5. 60 FPS Animation Loop
  let lastHudUpdate = 0;
  function animate(timestamp) {
    requestAnimationFrame(animate);

    try {
      window.photosynthesisRenderer.render();

      // Throttle UI HUD telemetry update to ~20 FPS for peak smoothness
      if (timestamp - lastHudUpdate > 50) {
        window.photosynthesisUI.updateHUD();
        lastHudUpdate = timestamp;
      }
    } catch (err) {
      console.error('Animation loop exception:', err);
    }
  }

  requestAnimationFrame(animate);

  console.log('🌱 PhotosynthesisLab initialized successfully!');
});
