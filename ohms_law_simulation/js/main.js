/**
 * OhmLab — Application Orchestrator & Bootstrap (js/main.js)
 * Initializes Renderer, UI Controller, Audio Unlock, Keyboard Shortcuts,
 * and Protected 60 FPS Animation Loop.
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('circuitCanvas');
  if (!canvas) {
    console.error('OhmLab Critical: #circuitCanvas element not found in DOM!');
    return;
  }

  // 1. Initialize Canvas 2D Renderer
  window.ohmRenderer = new window.OhmsLawRenderer(canvas);
  window.ohmRenderer.resize();

  // 2. Initialize UI Controller & DOM Bindings
  window.ohmUI = new window.OhmsLabUI();

  // 3. Responsive Resize Handler (with layout settling timeout)
  window.addEventListener('resize', () => {
    if (window.ohmRenderer) {
      window.ohmRenderer.resize();
    }
  });

  // Call resize after layout settling (320ms debounce for drawers/transitions)
  setTimeout(() => {
    if (window.ohmRenderer) {
      window.ohmRenderer.resize();
    }
  }, 320);

  // 4. Audio Unlock on First User Interaction Gesture
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

  // 5. Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Avoid interfering with inputs or sliders
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.code === 'Space') {
      e.preventDefault();
      document.getElementById('btnPlayPause')?.click();
    } else if (e.code === 'KeyR') {
      document.getElementById('btnResetAll')?.click();
    }
  });

  // 6. Protected 60 FPS Animation & Telemetry Loop
  function loop() {
    try {
      if (window.ohmRenderer) {
        window.ohmRenderer.render();
      }
      if (window.ohmUI) {
        window.ohmUI.updateTelemetry();
      }
    } catch (err) {
      console.error('OhmLab Animation Loop Error:', err);
    }
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  console.log('⚡ OhmLab — Ohm\'s Law Virtual Laboratory initialized successfully.');
});
