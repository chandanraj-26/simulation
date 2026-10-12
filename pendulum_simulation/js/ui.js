/**
 * PendulumLab — UI Controller & Interaction Engine
 */

class PendulumUI {
  constructor() {
    this.canvas = document.getElementById('pendulumCanvas');
    this.isMouseDown = false;
    this.activeDragTarget = null; // 'bob1' | 'bob2'

    this.initEventListeners();
    this.initCanvasInteractions();
    this.updateHUD();
  }

  initEventListeners() {
    const state = window.simState;

    // Mode Switchers
    document.getElementById('btnModeSingle')?.addEventListener('click', () => this.switchMode('single'));
    document.getElementById('btnModeIsochronism')?.addEventListener('click', () => this.switchMode('isochronism'));
    document.getElementById('btnModePhase')?.addEventListener('click', () => this.switchMode('phase_space'));
    document.getElementById('btnModeLargeAngle')?.addEventListener('click', () => this.switchMode('large_angle'));

    // Pendulum 1 Length (L1)
    const len1Slider = document.getElementById('len1Slider');
    const len1Number = document.getElementById('len1Number');
    if (len1Slider) {
      len1Slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.length1 = val;
        if (len1Number) len1Number.value = val.toFixed(2);
        this.updateHUD();
        state.checkQuests();
      });
    }
    if (len1Number) {
      len1Number.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 1.0;
        val = Math.max(0.20, Math.min(2.50, val));
        state.length1 = val;
        if (len1Slider) len1Slider.value = val;
        this.updateHUD();
        state.checkQuests();
      });
    }

    // Pendulum 1 Mass (m1)
    const mass1Slider = document.getElementById('mass1Slider');
    const mass1Number = document.getElementById('mass1Number');
    if (mass1Slider) {
      mass1Slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.mass1 = val;
        if (mass1Number) mass1Number.value = val.toFixed(2);
        this.updateHUD();
        state.checkQuests();
      });
    }
    if (mass1Number) {
      mass1Number.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 0.5;
        val = Math.max(0.10, Math.min(2.00, val));
        state.mass1 = val;
        if (mass1Slider) mass1Slider.value = val;
        this.updateHUD();
        state.checkQuests();
      });
    }

    // Pendulum 1 Release Angle (theta1)
    const angle1Slider = document.getElementById('angle1Slider');
    const angle1Number = document.getElementById('angle1Number');
    if (angle1Slider) {
      angle1Slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.initialAngle1Deg = val;
        state.theta1 = Physics.degToRad(val);
        state.omega1 = 0.0;
        if (angle1Number) angle1Number.value = val.toFixed(1);
        this.updateHUD();
        state.checkQuests();
      });
    }
    if (angle1Number) {
      angle1Number.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 30;
        val = Math.max(0, Math.min(90, val));
        state.initialAngle1Deg = val;
        state.theta1 = Physics.degToRad(val);
        state.omega1 = 0.0;
        if (angle1Slider) angle1Slider.value = val;
        this.updateHUD();
        state.checkQuests();
      });
    }

    // Pendulum 2 Controls (Dual / Isochronism mode)
    const len2Slider = document.getElementById('len2Slider');
    const len2Number = document.getElementById('len2Number');
    if (len2Slider) {
      len2Slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.length2 = val;
        if (len2Number) len2Number.value = val.toFixed(2);
        state.checkQuests();
      });
    }
    if (len2Number) {
      len2Number.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 1.0;
        val = Math.max(0.20, Math.min(2.50, val));
        state.length2 = val;
        if (len2Slider) len2Slider.value = val;
        state.checkQuests();
      });
    }

    const mass2Slider = document.getElementById('mass2Slider');
    const mass2Number = document.getElementById('mass2Number');
    if (mass2Slider) {
      mass2Slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.mass2 = val;
        if (mass2Number) mass2Number.value = val.toFixed(2);
        state.checkQuests();
      });
    }
    if (mass2Number) {
      mass2Number.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 1.0;
        val = Math.max(0.10, Math.min(2.00, val));
        state.mass2 = val;
        if (mass2Slider) mass2Slider.value = val;
        state.checkQuests();
      });
    }

    const angle2Slider = document.getElementById('angle2Slider');
    const angle2Number = document.getElementById('angle2Number');
    if (angle2Slider) {
      angle2Slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.initialAngle2Deg = val;
        state.theta2 = Physics.degToRad(val);
        state.omega2 = 0.0;
        if (angle2Number) angle2Number.value = val.toFixed(1);
        state.checkQuests();
      });
    }
    if (angle2Number) {
      angle2Number.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 10;
        val = Math.max(0, Math.min(90, val));
        state.initialAngle2Deg = val;
        state.theta2 = Physics.degToRad(val);
        state.omega2 = 0.0;
        if (angle2Slider) angle2Slider.value = val;
        state.checkQuests();
      });
    }

    // Direct Action: Release Both Pendulums
    document.getElementById('btnRelease')?.addEventListener('click', () => {
      state.resetToInitial();
      this.showToast('Released pendulum(s) from rest angle!', 'info');
    });

    // Direct Action: Stop / Rest to Equilibrium
    document.getElementById('btnStop')?.addEventListener('click', () => {
      state.theta1 = 0;
      state.omega1 = 0;
      state.alpha1 = 0;
      state.theta2 = 0;
      state.omega2 = 0;
      state.alpha2 = 0;
      if (window.soundEngine) window.soundEngine.playClick();
      this.showToast('Stopped pendulum at vertical equilibrium.', 'info');
    });

    // Environment Select
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

    // Damping Slider
    const dampSlider = document.getElementById('dampSlider');
    const dampValue = document.getElementById('dampValue');
    if (dampSlider) {
      dampSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.damping = val;
        if (dampValue) dampValue.textContent = val.toFixed(3);
      });
    }

    // Visual Toggles
    document.getElementById('chkForces')?.addEventListener('change', (e) => state.showForceVectors = e.target.checked);
    document.getElementById('chkVelocity')?.addEventListener('change', (e) => state.showVelocityVector = e.target.checked);
    document.getElementById('chkTrails')?.addEventListener('change', (e) => state.showTracePath = e.target.checked);
    document.getElementById('chkPhotogate')?.addEventListener('change', (e) => state.showPhotogate = e.target.checked);
    document.getElementById('chkProtractor')?.addEventListener('change', (e) => state.showProtractor = e.target.checked);
    document.getElementById('chkEnergy')?.addEventListener('change', (e) => state.showEnergyBars = e.target.checked);

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
      window.pendulumRenderer?.zoomIn();
      this.updateZoomLabel();
    });
    document.getElementById('btnZoomOut')?.addEventListener('click', () => {
      window.pendulumRenderer?.zoomOut();
      this.updateZoomLabel();
    });
    document.getElementById('btnZoomFit')?.addEventListener('click', () => {
      window.pendulumRenderer?.resetZoom();
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
    if (lbl && window.pendulumRenderer) {
      lbl.textContent = `${Math.round(window.pendulumRenderer.viewScale * 100)}%`;
    }
  }

  // =========================================================================
  // CANVAS MOUSE & TOUCH INTERACTIONS
  // =========================================================================
  initCanvasInteractions() {
    const canvas = this.canvas;

    const getPos = (e) => {
      const renderer = window.pendulumRenderer;
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
    const renderer = window.pendulumRenderer;
    if (!renderer) return;

    // Check hit on bob1 or bob2
    const hit = [...renderer.hitBoxes].reverse().find(b => {
      return pos.x >= b.x && pos.x <= b.x + b.w &&
             pos.y >= b.y && pos.y <= b.y + b.h;
    });

    if (hit) {
      if (hit.id === 1) {
        state.isDraggingBob1 = true;
        this.activeDragTarget = 'bob1';
        state.omega1 = 0;
      } else if (hit.id === 2) {
        state.isDraggingBob2 = true;
        this.activeDragTarget = 'bob2';
        state.omega2 = 0;
      }
    }
  }

  handlePointerMove(pos) {
    const state = window.simState;
    const renderer = window.pendulumRenderer;
    if (!renderer) return;

    const px = renderer.pivotX;
    const py = renderer.pivotY;

    // Angle theta from vertical downwards:
    // dx = pos.x - px, dy = pos.y - py
    const dx = pos.x - px;
    const dy = pos.y - py;
    const angleRad = Math.atan2(dx, dy);

    if (this.activeDragTarget === 'bob1' && state.isDraggingBob1) {
      state.theta1 = Math.max(-Math.PI * 0.55, Math.min(Math.PI * 0.55, angleRad));
      state.omega1 = 0;
      const deg = Math.abs(Physics.radToDeg(state.theta1));
      const aSlider = document.getElementById('angle1Slider');
      const aNum = document.getElementById('angle1Number');
      if (aSlider) aSlider.value = deg;
      if (aNum) aNum.value = deg.toFixed(1);
      this.updateHUD();
    } else if (this.activeDragTarget === 'bob2' && state.isDraggingBob2) {
      state.theta2 = Math.max(-Math.PI * 0.55, Math.min(Math.PI * 0.55, angleRad));
      state.omega2 = 0;
      const deg = Math.abs(Physics.radToDeg(state.theta2));
      const aSlider = document.getElementById('angle2Slider');
      const aNum = document.getElementById('angle2Number');
      if (aSlider) aSlider.value = deg;
      if (aNum) aNum.value = deg.toFixed(1);
    }
  }

  handlePointerUp() {
    const state = window.simState;
    if (this.activeDragTarget) {
      if (window.soundEngine) window.soundEngine.playReleaseSound();
      this.showToast('Released pendulum into swing!', 'info');
      state.checkQuests();
    }
    state.isDraggingBob1 = false;
    state.isDraggingBob2 = false;
    this.activeDragTarget = null;
    this.isMouseDown = false;
  }

  // =========================================================================
  // MODES & HUD
  // =========================================================================
  switchMode(modeKey) {
    const state = window.simState;
    state.mode = modeKey;

    document.querySelectorAll('.mode-type-btn').forEach(btn => btn.classList.remove('active'));
    if (modeKey === 'single') document.getElementById('btnModeSingle')?.classList.add('active');
    if (modeKey === 'isochronism') document.getElementById('btnModeIsochronism')?.classList.add('active');
    if (modeKey === 'phase_space') document.getElementById('btnModePhase')?.classList.add('active');
    if (modeKey === 'large_angle') document.getElementById('btnModeLargeAngle')?.classList.add('active');

    // Show/hide Pendulum 2 controls in Dual Isochronism mode
    const grpPend2 = document.getElementById('grpPendulum2');
    if (grpPend2) {
      grpPend2.classList.toggle('hidden', modeKey !== 'isochronism');
    }

    if (modeKey === 'isochronism') {
      state.length1 = 1.0;
      state.length2 = 1.0;
      state.initialAngle1Deg = 30.0;
      state.initialAngle2Deg = 10.0;
      state.resetToInitial();
      this.showToast("Dual Mode: Both pendulums share L = 1.0 m to verify Galileo's Isochronism!", 'info');
    } else if (modeKey === 'large_angle') {
      state.initialAngle1Deg = 75.0;
      state.resetToInitial();
      this.showToast("Large-Angle Mode: Watch the true period exceed Galileo's small-angle formula!", 'info');
    }

    if (window.soundEngine) window.soundEngine.playClick();
    this.updateHUD();
    state.checkQuests();
  }

  updateHUD() {
    const state = window.simState;
    const g = state.getGravity();

    // Small-Angle Period T0 = 2*PI*sqrt(L/g)
    const t0 = Physics.calculateSmallAnglePeriod(state.length1, g);
    const tExact = Physics.calculateExactPeriod(state.length1, g, state.theta1);
    const f0 = t0 > 0 ? (1.0 / t0) : 0;
    const tension = Physics.calculateTension(state.theta1, state.omega1, state.length1, state.mass1, g);

    const hudPeriod = document.getElementById('hudPeriod');
    if (hudPeriod) hudPeriod.textContent = `${t0.toFixed(2)} s`;

    const hudFreq = document.getElementById('hudFreq');
    if (hudFreq) hudFreq.textContent = `${f0.toFixed(2)} Hz`;

    const hudTension = document.getElementById('hudTension');
    if (hudTension) hudTension.textContent = `${tension.toFixed(1)} N`;

    const hudLength = document.getElementById('hudLength');
    if (hudLength) hudLength.textContent = `${(state.length1 * 100).toFixed(0)} cm (${state.length1.toFixed(2)} m)`;

    const hudPhotogate = document.getElementById('hudPhotogate');
    if (hudPhotogate) {
      hudPhotogate.textContent = state.photogate.measuredPeriod ? `${state.photogate.measuredPeriod.toFixed(2)} s` : '-- s';
    }

    const hudBadgeAngle = document.getElementById('hudBadgeAngle');
    if (hudBadgeAngle) hudBadgeAngle.textContent = `${Math.abs(Physics.radToDeg(state.theta1)).toFixed(1)}°`;

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
    state.length1 = 1.0;
    state.mass1 = 0.5;
    state.initialAngle1Deg = 30.0;
    state.length2 = 1.0;
    state.mass2 = 1.0;
    state.initialAngle2Deg = 10.0;
    state.gravityKey = 'earth';
    state.damping = 0.015;
    state.resetToInitial();

    const l1Slider = document.getElementById('len1Slider');
    const l1Num = document.getElementById('len1Number');
    if (l1Slider) l1Slider.value = 1.0;
    if (l1Num) l1Num.value = '1.00';

    const m1Slider = document.getElementById('mass1Slider');
    const m1Num = document.getElementById('mass1Number');
    if (m1Slider) m1Slider.value = 0.5;
    if (m1Num) m1Num.value = '0.50';

    const a1Slider = document.getElementById('angle1Slider');
    const a1Num = document.getElementById('angle1Number');
    if (a1Slider) a1Slider.value = 30;
    if (a1Num) a1Num.value = '30.0';

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

window.PendulumUI = PendulumUI;
