/**
 * ProjectileLab — Main Application Entry Point
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('projectileCanvas');
  if (!canvas) {
    console.error('Projectile canvas element not found!');
    return;
  }

  // 1. Initialize Renderer
  window.projectileRenderer = new ProjectileRenderer(canvas);
  window.projectileRenderer.resize();

  // 2. Initialize UI Controller
  window.projectileUI = new ProjectileUI();

  // 3. Resize handling with debounce
  window.addEventListener('resize', () => {
    if (window.projectileRenderer) {
      window.projectileRenderer.resize();
    }
  });

  // 4. Audio unlock
  const unlockAudio = () => {
    if (window.soundEngine) window.soundEngine.init();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);

  // 5. Main 60 FPS loop
  function loop() {
    try {
      if (window.projectileRenderer) {
        window.projectileRenderer.render();
      }
    } catch (err) {
      console.error('ProjectileLab Render Error:', err);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  console.log('🎯 ProjectileLab Initialized Successfully.');
});
