/**
 * OsmosisLab — UI Controller & Interaction Engine
 */

class OsmosisUI {
  constructor() {
    this.initEventListeners();
    this.updateHUD();
  }

  initEventListeners() {
    const state = window.simState;

    // Mode Switchers
    document.getElementById('btnModePlant')?.addEventListener('click', () => this.switchMode('plant'));
    document.getElementById('btnModeRBC')?.addEventListener('click', () => this.switchMode('rbc'));
    document.getElementById('btnModeUTube')?.addEventListener('click', () => this.switchMode('utube'));
    document.getElementById('btnModeAquaporin')?.addEventListener('click', () => this.switchMode('aquaporin'));

    // Solute Concentration Slider & Number Input
    const concSlider = document.getElementById('concSlider');
    const concNumber = document.getElementById('concNumber');
    if (concSlider) {
      concSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.setSolutePercent(val);
        if (concNumber) concNumber.value = val.toFixed(1);
        this.updateHUD();
      });
    }
    if (concNumber) {
      concNumber.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 2.0;
        val = Math.max(0.0, Math.min(10.0, val));
        state.setSolutePercent(val);
        if (concSlider) concSlider.value = val;
        this.updateHUD();
      });
    }

    // Tonicity Presets
    document.getElementById('btnPresetPure')?.addEventListener('click', () => {
      state.setSolutePercent(0.0);
      if (concSlider) concSlider.value = 0.0;
      if (concNumber) concNumber.value = '0.0';
      this.updateHUD();
      this.showToast('Solution: Pure Distilled Water (0.0% - Strongly Hypotonic)', 'info');
    });

    document.getElementById('btnPresetIso')?.addEventListener('click', () => {
      const isoVal = state.mode === 'rbc' ? 0.9 : 2.0;
      state.setSolutePercent(isoVal);
      if (concSlider) concSlider.value = isoVal;
      if (concNumber) concNumber.value = isoVal.toFixed(1);
      this.updateHUD();
      this.showToast(`Solution: Physiological Isotonic (${isoVal}% Solute)`, 'info');
    });

    document.getElementById('btnPresetHyper')?.addEventListener('click', () => {
      state.setSolutePercent(8.0);
      if (concSlider) concSlider.value = 8.0;
      if (concNumber) concNumber.value = '8.0';
      this.updateHUD();
      this.showToast('Solution: Concentrated Salt Solution (8.0% - Strongly Hypertonic)', 'info');
    });

    // U-Tube Arm Concentration Sliders
    const uLeftSlider = document.getElementById('uLeftSlider');
    if (uLeftSlider) {
      uLeftSlider.addEventListener('input', (e) => {
        state.uTubeConcLeft = parseFloat(e.target.value);
        state.checkQuests();
        this.updateHUD();
      });
    }
    const uRightSlider = document.getElementById('uRightSlider');
    if (uRightSlider) {
      uRightSlider.addEventListener('input', (e) => {
        state.uTubeConcRight = parseFloat(e.target.value);
        state.checkQuests();
        this.updateHUD();
      });
    }

    // Direct Action: Add Water / Add Salt
    document.getElementById('btnAddWater')?.addEventListener('click', () => {
      state.addDistilledWater();
      if (concSlider) concSlider.value = state.extSolutePercent;
      if (concNumber) concNumber.value = state.extSolutePercent.toFixed(1);
      this.updateHUD();
      this.showToast('Diluted beaker with distilled water (-1.5% solute)', 'info');
    });

    document.getElementById('btnAddSalt')?.addEventListener('click', () => {
      state.addSoluteSalt();
      if (concSlider) concSlider.value = state.extSolutePercent;
      if (concNumber) concNumber.value = state.extSolutePercent.toFixed(1);
      this.updateHUD();
      this.showToast('Added concentrated solute crystals (+1.5% solute)', 'info');
    });

    document.getElementById('btnResetSpecimen')?.addEventListener('click', () => {
      state.resetSpecimen();
      if (concSlider) concSlider.value = state.extSolutePercent;
      if (concNumber) concNumber.value = state.extSolutePercent.toFixed(1);
      this.updateHUD();
      this.showToast('Reset specimen to baseline physiological state.', 'info');
    });

    // Display Toggles
    document.getElementById('chkWaterFlow')?.addEventListener('change', (e) => state.showWaterFlow = e.target.checked);
    document.getElementById('chkMolecules')?.addEventListener('change', (e) => state.showMolecules = e.target.checked);
    document.getElementById('chkOrganelles')?.addEventListener('change', (e) => state.showOrganelles = e.target.checked);

    // Zoom Controls
    document.getElementById('btnZoomIn')?.addEventListener('click', () => {
      window.osmosisRenderer?.zoomIn();
      this.updateZoomLabel();
    });
    document.getElementById('btnZoomOut')?.addEventListener('click', () => {
      window.osmosisRenderer?.zoomOut();
      this.updateZoomLabel();
    });
    document.getElementById('btnZoomFit')?.addEventListener('click', () => {
      window.osmosisRenderer?.resetZoom();
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

    // Modal Close
    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.modal-wrapper').forEach(m => m.classList.remove('active'));
      });
    });
  }

  updateZoomLabel() {
    const lbl = document.getElementById('lblZoomLevel');
    if (lbl && window.osmosisRenderer) {
      lbl.textContent = `${Math.round(window.osmosisRenderer.viewScale * 100)}%`;
    }
  }

  switchMode(modeKey) {
    const state = window.simState;
    state.mode = modeKey;

    document.querySelectorAll('.mode-type-btn').forEach(btn => btn.classList.remove('active'));
    if (modeKey === 'plant') document.getElementById('btnModePlant')?.classList.add('active');
    if (modeKey === 'rbc') document.getElementById('btnModeRBC')?.classList.add('active');
    if (modeKey === 'utube') document.getElementById('btnModeUTube')?.classList.add('active');
    if (modeKey === 'aquaporin') document.getElementById('btnModeAquaporin')?.classList.add('active');

    // Show/hide U-tube specific controls vs Beaker controls
    const grpBeaker = document.getElementById('grpBeakerControls');
    const grpUTube = document.getElementById('grpUTubeControls');

    if (grpBeaker) grpBeaker.classList.toggle('hidden', modeKey === 'utube');
    if (grpUTube) grpUTube.classList.toggle('hidden', modeKey !== 'utube');

    // Set appropriate initial concentration
    if (modeKey === 'plant') {
      state.setSolutePercent(2.0);
    } else if (modeKey === 'rbc') {
      state.setSolutePercent(0.9);
      state.isRbcLysed = false;
    }

    const cSlider = document.getElementById('concSlider');
    const cNum = document.getElementById('concNumber');
    if (cSlider) cSlider.value = state.extSolutePercent;
    if (cNum) cNum.value = state.extSolutePercent.toFixed(1);

    if (window.soundEngine) window.soundEngine.playClick();
    this.updateHUD();
    state.checkQuests();
  }

  updateHUD() {
    const state = window.simState;

    let cellInfo = null;
    if (state.mode === 'plant') {
      cellInfo = Biology.calculatePlantCellState(state.extSolutePercent, state.currentVol);
    } else {
      cellInfo = Biology.calculateRBCState(state.extSolutePercent);
    }

    // Badges & Telemetry Cards
    const hudConc = document.getElementById('hudConc');
    if (hudConc) hudConc.textContent = `${state.extSolutePercent.toFixed(1)}%`;

    const hudTonicity = document.getElementById('hudTonicity');
    if (hudTonicity) {
      hudTonicity.textContent = cellInfo.tonicity.toUpperCase();
      hudTonicity.className = `hud-badge ${cellInfo.tonicity === 'isotonic' ? 'badge-blue' : (cellInfo.tonicity === 'hypotonic' ? 'badge-green' : 'badge-orange')}`;
    }

    const hudCellState = document.getElementById('hudCellState');
    if (hudCellState) {
      hudCellState.textContent = cellInfo.stateName;
      hudCellState.style.color = cellInfo.stateColor;
    }

    const hudPsiS = document.getElementById('hudPsiS');
    if (hudPsiS) {
      hudPsiS.textContent = `${cellInfo.psiS_ext.toFixed(2)} MPa`;
    }

    const hudTurgor = document.getElementById('hudTurgor');
    if (hudTurgor) {
      const p = cellInfo.turgor !== undefined ? cellInfo.turgor : 0.0;
      hudTurgor.textContent = `${p.toFixed(2)} MPa`;
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
    const state = window.simState;
    state.mode = 'plant';
    state.setSolutePercent(2.0);
    state.currentVol = 1.0;
    state.isRbcLysed = false;

    const cSlider = document.getElementById('concSlider');
    const cNum = document.getElementById('concNumber');
    if (cSlider) cSlider.value = 2.0;
    if (cNum) cNum.value = '2.0';

    this.switchMode('plant');
    if (window.soundEngine) window.soundEngine.playClick();
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

window.OsmosisUI = OsmosisUI;
