/**
 * PhotosynthesisLab — UI Controller & Interaction Engine
 */

class PhotosynthesisUI {
  constructor() {
    this.initEventListeners();
    this.updateHUD();
  }

  initEventListeners() {
    const state = window.simState;

    // Mode Switchers
    document.getElementById('btnModeApparatus')?.addEventListener('click', () => this.switchMode('apparatus'));
    document.getElementById('btnModeChloroplast')?.addEventListener('click', () => this.switchMode('chloroplast'));
    document.getElementById('btnModeGraph')?.addEventListener('click', () => this.switchMode('graph'));

    // Distance Slider & Input (10 cm to 100 cm)
    const distSlider = document.getElementById('distSlider');
    const distNumber = document.getElementById('distNumber');
    if (distSlider) {
      distSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.setDistance(val);
        if (distNumber) distNumber.value = val.toFixed(0);
        this.updateHUD();
      });
    }
    if (distNumber) {
      distNumber.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 30;
        val = Math.max(10, Math.min(100, val));
        state.setDistance(val);
        if (distSlider) distSlider.value = val;
        this.updateHUD();
      });
    }

    // Lamp Power Toggle
    const btnLamp = document.getElementById('btnLampToggle');
    if (btnLamp) {
      btnLamp.addEventListener('click', () => {
        state.setLampToggle();
        btnLamp.textContent = state.lampOn ? '💡 Lamp: ON' : '🌑 Lamp: OFF';
        btnLamp.classList.toggle('active', state.lampOn);
        this.updateHUD();
      });
    }

    // Optical Color Filters (White/Sunlight, Blue, Red, Green, UV)
    ['white', 'blue', 'red', 'green', 'uv'].forEach(col => {
      const btn = document.getElementById(`btnFilter_${col}`);
      if (btn) {
        btn.addEventListener('click', () => {
          state.setFilterColor(col);
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.updateHUD();
          this.showToast(`Optical Filter: ${col.toUpperCase()} selected`, 'info');
        });
      }
    });

    // NaHCO3 Concentration Slider (0.0% to 2.0%)
    const nahco3Slider = document.getElementById('nahco3Slider');
    const nahco3Number = document.getElementById('nahco3Number');
    if (nahco3Slider) {
      nahco3Slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.setNahco3(val);
        if (nahco3Number) nahco3Number.value = val.toFixed(1);
        this.updateHUD();
      });
    }
    if (nahco3Number) {
      nahco3Number.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 0.5;
        val = Math.max(0.0, Math.min(2.0, val));
        state.setNahco3(val);
        if (nahco3Slider) nahco3Slider.value = val;
        this.updateHUD();
      });
    }

    // Temperature Slider (5°C to 50°C)
    const tempSlider = document.getElementById('tempSlider');
    const tempNumber = document.getElementById('tempNumber');
    if (tempSlider) {
      tempSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.setTemperature(val);
        if (tempNumber) tempNumber.value = val.toFixed(0);
        this.updateHUD();
      });
    }
    if (tempNumber) {
      tempNumber.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 25;
        val = Math.max(5, Math.min(50, val));
        state.setTemperature(val);
        if (tempSlider) tempSlider.value = val;
        this.updateHUD();
      });
    }

    // Digital Bubble Counter & Stopwatch
    const btnStartStopwatch = document.getElementById('btnStartStopwatch');
    if (btnStartStopwatch) {
      btnStartStopwatch.addEventListener('click', () => {
        state.toggleStopwatch();
        btnStartStopwatch.textContent = state.stopwatchRunning ? '⏸ Pause Timer' : '▶ Start Timer';
        btnStartStopwatch.classList.toggle('active', state.stopwatchRunning);
        this.updateHUD();
      });
    }

    document.getElementById('btnResetStopwatch')?.addEventListener('click', () => {
      state.resetStopwatch();
      if (btnStartStopwatch) {
        btnStartStopwatch.textContent = '▶ Start Timer';
        btnStartStopwatch.classList.remove('active');
      }
      this.updateHUD();
      this.showToast('Reset stopwatch and bubble counter to zero.', 'info');
    });

    // Zoom Controls
    document.getElementById('btnZoomIn')?.addEventListener('click', () => {
      window.photosynthesisRenderer?.zoomIn();
      this.updateZoomLabel();
    });
    document.getElementById('btnZoomOut')?.addEventListener('click', () => {
      window.photosynthesisRenderer?.zoomOut();
      this.updateZoomLabel();
    });
    document.getElementById('btnZoomFit')?.addEventListener('click', () => {
      window.photosynthesisRenderer?.resetZoom();
      this.updateZoomLabel();
    });

    // Modals
    document.getElementById('btnOpenQuests')?.addEventListener('click', () => this.openModal('modalQuests'));
    document.getElementById('btnOpenTheory')?.addEventListener('click', () => this.openModal('modalTheory'));
    document.getElementById('btnResetAll')?.addEventListener('click', () => this.resetAll());

    // Sound Toggle
    const btnAudio = document.getElementById('btnAudioToggle');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        const enabled = window.soundEngine.toggle();
        btnAudio.textContent = enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
        btnAudio.classList.toggle('active', enabled);
      });
    }

    // Modal Close buttons & backdrop
    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.modal-wrapper').forEach(m => m.classList.remove('active'));
      });
    });
  }

  updateZoomLabel() {
    const lbl = document.getElementById('lblZoomLevel');
    if (lbl && window.photosynthesisRenderer) {
      lbl.textContent = `${Math.round(window.photosynthesisRenderer.viewScale * 100)}%`;
    }
  }

  switchMode(modeKey) {
    const state = window.simState;
    state.mode = modeKey;

    document.querySelectorAll('.mode-type-btn').forEach(btn => btn.classList.remove('active'));
    if (modeKey === 'apparatus') document.getElementById('btnModeApparatus')?.classList.add('active');
    if (modeKey === 'chloroplast') document.getElementById('btnModeChloroplast')?.classList.add('active');
    if (modeKey === 'graph') document.getElementById('btnModeGraph')?.classList.add('active');

    if (window.soundEngine) window.soundEngine.playClick();
    this.updateHUD();
  }

  updateHUD() {
    const state = window.simState;
    const metrics = PhotosynthesisBiophysics.calculateRate(state);

    // Canvas floating pills
    const hudBpm = document.getElementById('hudBpm');
    if (hudBpm) hudBpm.textContent = `${metrics.rateBPM.toFixed(1)} BPM`;

    const hudIntensity = document.getElementById('hudIntensity');
    if (hudIntensity) hudIntensity.textContent = `${metrics.intensity.toFixed(0)}%`;

    const hudLimiting = document.getElementById('hudLimiting');
    if (hudLimiting) hudLimiting.textContent = metrics.limitingFactor;

    // Telemetry cards
    const cardBpm = document.getElementById('cardBpm');
    if (cardBpm) cardBpm.textContent = `${metrics.rateBPM.toFixed(1)}`;

    const cardO2Vol = document.getElementById('cardO2Vol');
    if (cardO2Vol) cardO2Vol.textContent = `${state.accumulatedO2Volume.toFixed(2)} mL`;

    const cardCounted = document.getElementById('cardCounted');
    if (cardCounted) cardCounted.textContent = `${state.totalBubblesCounted}`;

    // Stopwatch clock display (MM:SS)
    const lblStopwatchTime = document.getElementById('lblStopwatchTime');
    if (lblStopwatchTime) {
      const totalSec = Math.floor(state.stopwatchSeconds);
      const mins = Math.floor(totalSec / 60);
      const secs = totalSec % 60;
      lblStopwatchTime.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      if (modalId === 'modalQuests') {
        this.renderQuestsModal();
      }
    }
  }

  renderQuestsModal() {
    const state = window.simState;
    const container = document.getElementById('questsListContainer');
    if (!container) return;

    container.innerHTML = state.quests.map(q => `
      <div class="quest-card ${q.completed ? 'completed' : ''}">
        <div class="quest-header">
          <div class="quest-title-wrap">
            <span class="quest-stars">${'⭐'.repeat(q.stars)}</span>
            <h4 class="quest-title">${q.title}</h4>
          </div>
          <span class="quest-status-badge ${q.completed ? 'badge-success' : 'badge-pending'}">
            ${q.completed ? '✓ COMPLETED' : 'IN PROGRESS'}
          </span>
        </div>
        <p class="quest-desc">${q.desc}</p>
      </div>
    `).join('');
  }

  resetAll() {
    window.simState.resetAllParameters();

    // Reset UI Inputs
    const distSlider = document.getElementById('distSlider');
    const distNumber = document.getElementById('distNumber');
    if (distSlider) distSlider.value = 30;
    if (distNumber) distNumber.value = 30;

    const btnLamp = document.getElementById('btnLampToggle');
    if (btnLamp) {
      btnLamp.textContent = '💡 Lamp: ON';
      btnLamp.classList.add('active');
    }

    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btnFilter_white')?.classList.add('active');

    const nahco3Slider = document.getElementById('nahco3Slider');
    const nahco3Number = document.getElementById('nahco3Number');
    if (nahco3Slider) nahco3Slider.value = 0.5;
    if (nahco3Number) nahco3Number.value = '0.5';

    const tempSlider = document.getElementById('tempSlider');
    const tempNumber = document.getElementById('tempNumber');
    if (tempSlider) tempSlider.value = 25;
    if (tempNumber) tempNumber.value = 25;

    this.switchMode('apparatus');
    this.updateHUD();
    this.showToast('Reset all parameters to baseline laboratory settings.', 'info');
  }

  showToast(message, type = 'info') {
    let toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.className = 'app-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `app-toast active ${type}`;

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('active');
    }, 3200);
  }
}

window.PhotosynthesisUI = PhotosynthesisUI;
