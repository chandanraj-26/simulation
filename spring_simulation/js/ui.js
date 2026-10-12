/**
 * SpringLab — UI Controller & Interaction Engine
 */

class SpringUI {
  constructor() {
    this.canvas = document.getElementById('springCanvas');
    this.isMouseDown = false;
    this.activeDragType = null; // 'spring_mass' | 'tray_weight'
    this.draggedWeightItem = null;

    this.initEventListeners();
    this.initCanvasInteractions();
    this.initStopwatch();
    this.updateHUD();
  }

  initEventListeners() {
    const state = window.simState;

    // Mode Switchers
    document.getElementById('btnModeSingle')?.addEventListener('click', () => this.switchMode('single'));
    document.getElementById('btnModeSeries')?.addEventListener('click', () => this.switchMode('series'));
    document.getElementById('btnModeParallel')?.addEventListener('click', () => this.switchMode('parallel'));
    document.getElementById('btnModeMystery')?.addEventListener('click', () => this.switchMode('mystery'));

    // Spring 1 Stiffness (k1)
    const k1Slider = document.getElementById('k1Slider');
    const k1Number = document.getElementById('k1Number');
    if (k1Slider) {
      k1Slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.k1 = val;
        if (k1Number) k1Number.value = val.toFixed(1);
        this.updateHUD();
        state.checkQuests();
      });
    }
    if (k1Number) {
      k1Number.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 50;
        val = Math.max(10, Math.min(100, val));
        state.k1 = val;
        if (k1Slider) k1Slider.value = val;
        this.updateHUD();
        state.checkQuests();
      });
    }

    // Spring 2 Stiffness (k2 - Series/Parallel)
    const k2Slider = document.getElementById('k2Slider');
    const k2Number = document.getElementById('k2Number');
    if (k2Slider) {
      k2Slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.k2 = val;
        if (k2Number) k2Number.value = val.toFixed(1);
        this.updateHUD();
      });
    }
    if (k2Number) {
      k2Number.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 50;
        val = Math.max(10, Math.min(100, val));
        state.k2 = val;
        if (k2Slider) k2Slider.value = val;
        this.updateHUD();
      });
    }

    // Damping Slider
    const dampSlider = document.getElementById('dampSlider');
    const dampValue = document.getElementById('dampValue');
    if (dampSlider) {
      dampSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.damping = val;
        if (dampValue) dampValue.textContent = val.toFixed(2);
      });
    }

    // Damping Preset Buttons
    document.getElementById('btnDampNone')?.addEventListener('click', () => {
      state.damping = 0.0;
      if (dampSlider) dampSlider.value = 0.0;
      if (dampValue) dampValue.textContent = '0.00';
      this.showToast('Damping: None (Undamped Harmonic Oscillator)', 'info');
    });

    document.getElementById('btnDampLight')?.addEventListener('click', () => {
      state.damping = 0.18;
      if (dampSlider) dampSlider.value = 0.18;
      if (dampValue) dampValue.textContent = '0.18';
      this.showToast('Damping: Light (Underdamped)', 'info');
    });

    document.getElementById('btnDampCritical')?.addEventListener('click', () => {
      const m = state.getTotalMass();
      const k = state.getEffectiveK();
      const cCrit = Physics.calculateCriticalDamping(m, k);
      state.damping = Math.min(5.0, cCrit);
      if (dampSlider) dampSlider.value = state.damping;
      if (dampValue) dampValue.textContent = state.damping.toFixed(2);
      this.showToast(`Damping: Critical (~${cCrit.toFixed(2)} N·s/m)`, 'info');
    });

    // Planetary Gravity
    const selGravity = document.getElementById('selGravity');
    if (selGravity) {
      selGravity.addEventListener('change', (e) => {
        state.gravityKey = e.target.value;
        const env = Physics.environments[state.gravityKey];
        this.showToast(`Celestial Gravity: ${env.name} (g = ${env.g} m/s²)`, 'info');
        this.updateHUD();
        state.checkQuests();
      });
    }

    // Direct Action: Rest to Equilibrium
    document.getElementById('btnRestEq')?.addEventListener('click', () => {
      state.resetToEquilibrium();
      if (window.soundEngine) window.soundEngine.playClick();
      this.showToast('Damped to static equilibrium rest position.', 'info');
    });

    // Direct Action: Pull & Release Initial Displacement
    document.getElementById('btnDisplace')?.addEventListener('click', () => {
      state.x += 0.08; // pull down 8 cm
      state.v = 0.0;
      if (window.soundEngine) window.soundEngine.playSpringTwang(260);
      this.showToast('Displaced spring by +8 cm and released!', 'info');
    });

    // Clear Weights
    document.getElementById('btnClearWeights')?.addEventListener('click', () => {
      state.clearAttachedWeights();
      this.updateHUD();
      this.showToast('All attached masses removed from spring.', 'info');
    });

    // Reference Display Toggles
    document.getElementById('chkUnstretched')?.addEventListener('change', (e) => state.showUnstretchedLine = e.target.checked);
    document.getElementById('chkEquilibrium')?.addEventListener('change', (e) => state.showEquilibriumLine = e.target.checked);
    document.getElementById('chkRuler')?.addEventListener('change', (e) => state.showRuler = e.target.checked);
    document.getElementById('chkForces')?.addEventListener('change', (e) => state.showForceVectors = e.target.checked);
    document.getElementById('chkEnergy')?.addEventListener('change', (e) => state.showEnergyChart = e.target.checked);
    document.getElementById('chkGraph')?.addEventListener('change', (e) => state.showTraceGraph = e.target.checked);

    // Speed Controls
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const spd = parseFloat(e.currentTarget.dataset.speed);
        state.simSpeed = spd;
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });

    // Zoom Controls
    document.getElementById('btnZoomIn')?.addEventListener('click', () => {
      window.springRenderer?.zoomIn();
      this.updateZoomLabel();
    });
    document.getElementById('btnZoomOut')?.addEventListener('click', () => {
      window.springRenderer?.zoomOut();
      this.updateZoomLabel();
    });
    document.getElementById('btnZoomFit')?.addEventListener('click', () => {
      window.springRenderer?.resetZoom();
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
    if (lbl && window.springRenderer) {
      lbl.textContent = `${Math.round(window.springRenderer.viewScale * 100)}%`;
    }
  }

  // =========================================================================
  // CANVAS MOUSE & TOUCH INTERACTIONS
  // =========================================================================
  initCanvasInteractions() {
    const canvas = this.canvas;

    const getPos = (e) => {
      const renderer = window.springRenderer;
      if (!renderer) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const raw = {
        x: (clientX - rect.left) * (renderer.width / rect.width),
        y: (clientY - rect.top) * (renderer.height / rect.height)
      };
      return renderer.transformPointerPos(raw);
    };

    canvas.addEventListener('mousedown', (e) => {
      const pos = getPos(e);
      this.isMouseDown = true;
      this.handlePointerDown(pos);
    });

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const pos = getPos(e);
      this.isMouseDown = true;
      this.handlePointerDown(pos);
    }, { passive: false });

    window.addEventListener('mousemove', (e) => {
      if (!this.isMouseDown) return;
      const pos = getPos(e);
      this.handlePointerMove(pos);
    });

    window.addEventListener('touchmove', (e) => {
      if (!this.isMouseDown) return;
      const pos = getPos(e);
      this.handlePointerMove(pos);
    }, { passive: false });

    window.addEventListener('mouseup', () => {
      this.handlePointerUp();
    });

    window.addEventListener('touchend', () => {
      this.handlePointerUp();
    });
  }

  handlePointerDown(pos) {
    const state = window.simState;
    const renderer = window.springRenderer;
    if (!renderer) return;

    // Check hitboxes in reverse order (top items first)
    const hit = [...renderer.hitBoxes].reverse().find(b => {
      return pos.x >= b.x && pos.x <= b.x + b.w &&
             pos.y >= b.y && pos.y <= b.y + b.h;
    });

    if (hit) {
      if (hit.type === 'spring_mass') {
        // Grabbed the mass attached to the spring to pull it manually
        state.isDraggingMass = true;
        state.dragStartY = pos.y;
        state.dragStartElongation = state.x;
        state.v = 0.0;
        this.activeDragType = 'spring_mass';
        if (window.soundEngine) window.soundEngine.playSpringTwang(180);
      } else if (hit.type === 'tray_weight') {
        // Grabbed a weight from the laboratory bench tray
        this.activeDragType = 'tray_weight';
        state.draggedTrayWeight = hit.weight;
        state.draggedPointerPos = { x: pos.x, y: pos.y };
        if (window.soundEngine) window.soundEngine.playClick();
      }
    }
  }

  handlePointerMove(pos) {
    const state = window.simState;
    const renderer = window.springRenderer;
    if (!renderer) return;

    if (this.activeDragType === 'spring_mass' && state.isDraggingMass) {
      // Manual pulling of spring
      const dyPixels = pos.y - state.dragStartY;
      const dyMeters = dyPixels / renderer.scalePPM;
      state.x = Math.max(-0.15, state.dragStartElongation + dyMeters);
      state.v = 0.0;
      this.updateHUD();
    } else if (this.activeDragType === 'tray_weight' && state.draggedTrayWeight) {
      state.draggedPointerPos = { x: pos.x, y: pos.y };
    }
  }

  handlePointerUp() {
    const state = window.simState;
    const renderer = window.springRenderer;

    if (this.activeDragType === 'spring_mass') {
      state.isDraggingMass = false;
      this.activeDragType = null;
      if (window.soundEngine) window.soundEngine.playSpringTwang(240);
      this.showToast('Released mass! Oscillating in harmonic motion.', 'info');
    } else if (this.activeDragType === 'tray_weight' && state.draggedTrayWeight) {
      // Check if dropped near the spring apparatus
      const sx = renderer.apparatusX;
      const distToApparatus = Math.abs(state.draggedPointerPos.x - sx);

      if (distToApparatus < 90) {
        // Successfully attached weight to spring!
        state.attachWeight(state.draggedTrayWeight);
        this.showToast(`Attached ${state.draggedTrayWeight.name} to spring hook!`, 'success');
        this.updateHUD();
      } else {
        // Dropped back onto bench
        if (window.soundEngine) window.soundEngine.playWeightDrop();
      }

      state.draggedTrayWeight = null;
      this.activeDragType = null;
    }

    this.isMouseDown = false;
  }

  // =========================================================================
  // DIGITAL STOPWATCH & PHOTOGATE
  // =========================================================================
  initStopwatch() {
    const state = window.simState;
    const btnStart = document.getElementById('btnStopwatchStart');
    const btnReset = document.getElementById('btnStopwatchReset');
    const display = document.getElementById('stopwatchDisplay');

    let timerInterval = null;

    if (btnStart) {
      btnStart.addEventListener('click', () => {
        state.stopwatch.running = !state.stopwatch.running;
        btnStart.textContent = state.stopwatch.running ? '⏸ Pause' : '▶ Start';
        btnStart.classList.toggle('active', state.stopwatch.running);

        if (state.stopwatch.running) {
          state.stopwatch.startTime = performance.now() - state.stopwatch.elapsed;
          timerInterval = setInterval(() => {
            state.stopwatch.elapsed = performance.now() - state.stopwatch.startTime;
            const sec = (state.stopwatch.elapsed / 1000).toFixed(2);
            if (display) display.textContent = `${sec} s`;
          }, 40);
          if (window.soundEngine) window.soundEngine.playBeep();
        } else {
          clearInterval(timerInterval);
        }
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        state.stopwatch.running = false;
        state.stopwatch.elapsed = 0;
        clearInterval(timerInterval);
        if (btnStart) {
          btnStart.textContent = '▶ Start';
          btnStart.classList.remove('active');
        }
        if (display) display.textContent = '0.00 s';
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }
  }

  // =========================================================================
  // MODES & HUD
  // =========================================================================
  switchMode(modeKey) {
    const state = window.simState;
    state.mode = modeKey;

    document.querySelectorAll('.mode-type-btn').forEach(btn => btn.classList.remove('active'));
    if (modeKey === 'single') document.getElementById('btnModeSingle')?.classList.add('active');
    if (modeKey === 'series') document.getElementById('btnModeSeries')?.classList.add('active');
    if (modeKey === 'parallel') document.getElementById('btnModeParallel')?.classList.add('active');
    if (modeKey === 'mystery') document.getElementById('btnModeMystery')?.classList.add('active');

    // Show/hide Spring 2 controls in series/parallel modes
    const grpK2 = document.getElementById('grpSpring2');
    if (grpK2) {
      grpK2.classList.toggle('hidden', modeKey !== 'series' && modeKey !== 'parallel');
    }

    if (modeKey === 'mystery') {
      // Auto attach mystery crown for detective mission
      state.attachedWeights = [
        { id: 'w_crown', name: 'Golden Crown', mass: 0.38, color: '#fbbf24', type: 'crown', isMystery: true }
      ];
      this.showToast('Mystery Challenge: Weigh the Golden Crown using Hooke\'s Law!', 'info');
    }

    if (window.soundEngine) window.soundEngine.playClick();
    this.updateHUD();
    state.checkQuests();
  }

  updateHUD() {
    const state = window.simState;
    const m = state.getTotalMass();
    const k = state.getEffectiveK();
    const g = state.getGravity();

    const deltaXEq = state.getEquilibriumElongation(); // meters
    const period = Physics.calculatePeriod(m, k);
    const freq = period > 0 ? (1.0 / period) : 0;
    const fSpring = k * state.x;
    const weight = m * g;

    // Badges & Telemetry Cards
    const hudK = document.getElementById('hudK');
    if (hudK) hudK.textContent = `${k.toFixed(1)} N/m`;

    const hudMass = document.getElementById('hudMass');
    if (hudMass) hudMass.textContent = `${(m * 1000).toFixed(0)} g (${m.toFixed(3)} kg)`;

    const hudExtension = document.getElementById('hudExtension');
    if (hudExtension) hudExtension.textContent = `${(deltaXEq * 100).toFixed(1)} cm`;

    const hudPeriod = document.getElementById('hudPeriod');
    if (hudPeriod) hudPeriod.textContent = `${period.toFixed(2)} s`;

    const hudFreq = document.getElementById('hudFreq');
    if (hudFreq) hudFreq.textContent = `${freq.toFixed(2)} Hz`;

    const hudBadgeG = document.getElementById('hudBadgeG');
    if (hudBadgeG) hudBadgeG.textContent = `g = ${g.toFixed(2)} m/s²`;
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
    state.mode = 'single';
    state.k1 = 50.0;
    state.k2 = 50.0;
    state.gravityKey = 'earth';
    state.damping = 0.20;
    state.attachedWeights = [
      { id: 'w_250g', name: '250 g Brass Disc', mass: 0.25, color: '#b45309', type: 'disc' }
    ];
    state.resetToEquilibrium();

    const k1Slider = document.getElementById('k1Slider');
    const k1Number = document.getElementById('k1Number');
    if (k1Slider) k1Slider.value = 50;
    if (k1Number) k1Number.value = '50.0';

    const k2Slider = document.getElementById('k2Slider');
    const k2Number = document.getElementById('k2Number');
    if (k2Slider) k2Slider.value = 50;
    if (k2Number) k2Number.value = '50.0';

    const dampSlider = document.getElementById('dampSlider');
    const dampValue = document.getElementById('dampValue');
    if (dampSlider) dampSlider.value = 0.20;
    if (dampValue) dampValue.textContent = '0.20';

    const selG = document.getElementById('selGravity');
    if (selG) selG.value = 'earth';

    this.switchMode('single');
    if (window.soundEngine) window.soundEngine.playClick();
    this.updateHUD();
    this.showToast('Reset all parameters to default laboratory bench settings.', 'info');
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

window.SpringUI = SpringUI;
