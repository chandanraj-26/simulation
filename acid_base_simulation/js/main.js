/**
 * AcidBaseLab — Main Application Entry Point
 * Initializes audio context, Canvas 2D engine, UI controller,
 * and kicks off the 60 FPS animation loop.
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('indicatorCanvas');
  if (!canvas) {
    console.error('Indicator canvas element not found!');
    return;
  }

  // 1. Initialize Renderer
  window.laboratoryRenderer = new LaboratoryRenderer(canvas);
  window.laboratoryRenderer.resize();

  // 2. Initialize UI Controller
  window.acidBaseUI = new AcidBaseUI();

  // 3. Resize handling with debounce
  window.addEventListener('resize', () => {
    if (window.laboratoryRenderer) {
      window.laboratoryRenderer.resize();
    }
  });

  // 4. Audio Unlock on first user gesture
  const unlockAudio = () => {
    if (window.soundEngine) {
      window.soundEngine.init();
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);

  // 5. Main 60 FPS Animation Loop
  function animationFrame() {
    if (window.laboratoryRenderer) {
      window.laboratoryRenderer.render();
    }
    requestAnimationFrame(animationFrame);
  }
  requestAnimationFrame(animationFrame);

  console.log('🧪 AcidBaseLab Initialized Successfully.');
});
