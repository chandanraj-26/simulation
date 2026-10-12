/**
 * PeriodicLab — Application Bootstrap & Keyboard Navigation
 * Zero-dependency client-side execution, keyboard shortcuts, and lifecycle.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI controller
  const ui = new UIController();
  ui.init();
  window.ui = ui;

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // If inside search input or other text field, ignore shortcuts
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      if (e.key === 'Escape') {
        document.activeElement.blur();
      }
      return;
    }

    const currentZ = appState.getState().activeElementId;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        if (currentZ < 118) appState.selectElement(currentZ + 1);
        break;

      case 'ArrowLeft':
        e.preventDefault();
        if (currentZ > 1) appState.selectElement(currentZ - 1);
        break;

      case 'm':
      case 'M':
        e.preventDefault();
        appState.toggleMnemonicOverlay();
        break;

      case 's':
      case 'S':
        e.preventDefault();
        const btnSound = document.getElementById('btnToggleSound');
        if (btnSound) btnSound.click();
        break;

      case 'v':
      case 'V':
        e.preventDefault();
        const btnSpeech = document.getElementById('btnToggleSpeech');
        if (btnSpeech) btnSpeech.click();
        break;

      case '/':
      case 'f':
      case 'F':
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.focus();
        break;

      case 'Escape':
        e.preventDefault();
        // Close modals if open
        const quizModal = document.getElementById('quizModal');
        const theoryModal = document.getElementById('theoryModal');
        if (quizModal && quizModal.classList.contains('open')) {
          quizModal.classList.remove('open');
        }
        if (theoryModal && theoryModal.classList.contains('open')) {
          theoryModal.classList.remove('open');
        }
        break;
    }
  });

  console.log('⚛️ PeriodicLab initialized successfully with all 118 elements & Hinglish mnemonics.');
});
