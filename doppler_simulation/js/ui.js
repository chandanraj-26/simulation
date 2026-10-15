/**
 * DopplerLab — UI Controller & Interaction Engine
 * Manages canvas pointer dragging, mode switching, sliders, HUD telemetry,
 * student quest evaluation, and interactive modals.
 */

class DopplerUI {
  constructor() {
    this.canvas = document.getElementById('dopplerCanvas');
    this.isMouseDown = false;
    this.activeDragTarget = null; // 'source' | 'observer'
    this.dragStart = { x: 0, y: 0 };

    this.initEventListeners();
    this.initCanvasInteractions();
    this.initModals();
    this.renderQuestsList();
    this.updateHUD();

    // Regular HUD telemetry update timer
    setInterval(() => {
      this.updateHUD();
      if (window.simState) {
        window.simState.checkQuests();
        this.renderQuestsList();
      }
    }, 120);
  }

  initEventListeners() {
    const state = window.simState;

    // Mode Switchers
    const modeButtons = [
      { id: 'btnModeSubsonic', mode: 'subsonic' },
      { id: 'btnModeSupersonic', mode: 'supersonic' },
      { id: 'btnModeObserver', mode: 'observer_motion' },
      { id: 'btnModeAmbulance', mode: 'ambulance' },
      { id: 'btnModeStationary', mode: 'stationary' }
    ];

    modeButtons.forEach(({ id, mode }) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.switchMode(mode);
          if (window.soundEngine) window.soundEngine.playClick();
        });
      }
    });

    // Play / Pause Toggle
    const btnPlayPause = document.getElementById('btnPlayPause');
    if (btnPlayPause) {
      btnPlayPause.addEventListener('click', () => {
        state.isPaused = !state.isPaused;
        btnPlayPause.innerHTML = state.isPaused ? '<span>▶️</span> Resume' : '<span>⏸️</span> Pause';
        btnPlayPause.classList.toggle('active', state.isPaused);
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    // Reset Simulation
    const btnResetAll = document.getElementById('btnResetAll');
    if (btnResetAll) {
      btnResetAll.addEventListener('click', () => {
        state.resetAll();
        this.syncControlsFromState();
        this.updateHUD();
        this.showToast('Laboratory parameters reset to defaults.', 'info');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    // Sound Toggle
    const btnAudioToggle = document.getElementById('btnAudioToggle');
    if (btnAudioToggle) {
      btnAudioToggle.addEventListener('click', () => {
        if (window.soundEngine) {
          const enabled = window.soundEngine.toggle();
          btnAudioToggle.innerHTML = enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
          btnAudioToggle.classList.toggle('active', enabled);
        }
      });
    }

    // Zoom Controls
    document.getElementById('btnZoomIn')?.addEventListener('click', () => {
      if (window.dopplerRenderer) {
        window.dopplerRenderer.zoomIn();
        this.updateZoomHUD();
      }
    });
    document.getElementById('btnZoomOut')?.addEventListener('click', () => {
      if (window.dopplerRenderer) {
        window.dopplerRenderer.zoomOut();
        this.updateZoomHUD();
      }
    });
    document.getElementById('btnZoomFit')?.addEventListener('click', () => {
      if (window.dopplerRenderer) {
        window.dopplerRenderer.resetZoom();
        this.updateZoomHUD();
      }
    });

    // Source Velocity Slider & Number
    const srcVelSlider = document.getElementById('srcVelSlider');
    const srcVelNumber = document.getElementById('srcVelNumber');
    if (srcVelSlider) {
      srcVelSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.source.vx = val;
        if (srcVelNumber) srcVelNumber.value = val.toFixed(0);
        this.updateHUD();
        state.checkQuests();
      });
    }
    if (srcVelNumber) {
      srcVelNumber.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 120;
        val = Math.max(0, Math.min(650, val));
        state.source.vx = val;
        if (srcVelSlider) srcVelSlider.value = val;
        this.updateHUD();
        state.checkQuests();
      });
    }

    // Source Frequency Slider & Number
    const srcFreqSlider = document.getElementById('srcFreqSlider');
    const srcFreqNumber = document.getElementById('srcFreqNumber');
    if (srcFreqSlider) {
      srcFreqSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.source.f0 = val;
        if (srcFreqNumber) srcFreqNumber.value = val.toFixed(0);
        this.updateHUD();
        state.checkQuests();
      });
    }
    if (srcFreqNumber) {
      srcFreqNumber.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 440;
        val = Math.max(100, Math.min(1000, val));
        state.source.f0 = val;
        if (srcFreqSlider) srcFreqSlider.value = val;
        this.updateHUD();
        state.checkQuests();
      });
    }

    // Observer Velocity Slider & Number
    const obsVelSlider = document.getElementById('obsVelSlider');
    const obsVelNumber = document.getElementById('obsVelNumber');
    if (obsVelSlider) {
      obsVelSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.observer.vx = val;
        if (obsVelNumber) obsVelNumber.value = val.toFixed(0);
        this.updateHUD();
        state.checkQuests();
      });
    }
    if (obsVelNumber) {
      obsVelNumber.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 0;
        val = Math.max(-250, Math.min(250, val));
        state.observer.vx = val;
        if (obsVelSlider) obsVelSlider.value = val;
        this.updateHUD();
        state.checkQuests();
      });
    }

    // Medium Selection Dropdown
    const selMedium = document.getElementById('selMedium');
    if (selMedium) {
      selMedium.addEventListener('change', (e) => {
        state.mediumKey = e.target.value;
        this.updateHUD();
        state.checkQuests();
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    // Visual Display Toggles
    this.bindCheckbox('chkWavefronts', (val) => state.showWavefronts = val);
    this.bindCheckbox('chkMachCone', (val) => state.showMachCone = val);
    this.bindCheckbox('chkVectors', (val) => state.showVectors = val);
    this.bindCheckbox('chkGrid', (val) => state.showGrid = val);
    this.bindCheckbox('chkOscilloscope', (val) => state.showOscilloscope = val);
    this.bindCheckbox('chkSpectrum', (val) => state.showSpectrum = val);

    // Simulation Speed Buttons
    const speedButtons = document.querySelectorAll('.speed-btn');
    speedButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        speedButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.simSpeed = parseFloat(btn.dataset.speed || '1.0');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });
  }

  bindCheckbox(id, setter) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', (e) => {
        setter(e.target.checked);
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }
  }

  switchMode(mode) {
    const state = window.simState;
    state.setMode(mode);

    // Update active mode buttons
    const modeButtons = [
      { id: 'btnModeSubsonic', mode: 'subsonic' },
      { id: 'btnModeSupersonic', mode: 'supersonic' },
      { id: 'btnModeObserver', mode: 'observer_motion' },
      { id: 'btnModeAmbulance', mode: 'ambulance' },
      { id: 'btnModeStationary', mode: 'stationary' }
    ];

    modeButtons.forEach(({ id, mode: m }) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.toggle('active', m === mode);
      }
    });

    this.syncControlsFromState();
    this.updateHUD();

    const modeTitles = {
      'subsonic': 'Subsonic Doppler Motion (v_src < v_sound)',
      'supersonic': 'Supersonic Mach Cone Envelope (Mach >= 1.0)',
      'observer_motion': 'Moving Observer Approaching Stationary Source',
      'ambulance': 'Ambulance Emergency Siren Drive-By Scenario',
      'stationary': 'Stationary Concentric Acoustic Reference Wavefronts'
    };
    this.showToast(modeTitles[mode] || 'Mode activated', 'info');
  }

  syncControlsFromState() {
    const state = window.simState;
    const srcVelSlider = document.getElementById('srcVelSlider');
    const srcVelNumber = document.getElementById('srcVelNumber');
    if (srcVelSlider) srcVelSlider.value = state.source.vx;
    if (srcVelNumber) srcVelNumber.value = state.source.vx.toFixed(0);

    const srcFreqSlider = document.getElementById('srcFreqSlider');
    const srcFreqNumber = document.getElementById('srcFreqNumber');
    if (srcFreqSlider) srcFreqSlider.value = state.source.f0;
    if (srcFreqNumber) srcFreqNumber.value = state.source.f0.toFixed(0);

    const obsVelSlider = document.getElementById('obsVelSlider');
    const obsVelNumber = document.getElementById('obsVelNumber');
    if (obsVelSlider) obsVelSlider.value = state.observer.vx;
    if (obsVelNumber) obsVelNumber.value = state.observer.vx.toFixed(0);

    const selMedium = document.getElementById('selMedium');
    if (selMedium) selMedium.value = state.mediumKey;
  }

  initCanvasInteractions() {
    const canvas = this.canvas;
    if (!canvas) return;

    const getCanvasPos = (evt) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = evt.clientX || (evt.touches && evt.touches[0].clientX) || 0;
      const clientY = evt.clientY || (evt.touches && evt.touches[0].clientY) || 0;
      const raw = {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
      if (window.dopplerRenderer) {
        return window.dopplerRenderer.transformPointerPos(raw);
      }
      return raw;
    };

    const handlePointerDown = (evt) => {
      const pos = getCanvasPos(evt);
      const renderer = window.dopplerRenderer;
      if (!renderer) return;

      const hit = renderer.hitBoxes.find(b =>
        pos.x >= b.x && pos.x <= b.x + b.w &&
        pos.y >= b.y && pos.y <= b.y + b.h
      );

      if (hit) {
        this.isMouseDown = true;
        this.activeDragTarget = hit.type;
        canvas.style.cursor = 'grabbing';

        const state = window.simState;
        if (hit.type === 'source') {
          state.isDraggingSource = true;
        } else if (hit.type === 'observer') {
          state.isDraggingObserver = true;
        }
      }
    };

    const handlePointerMove = (evt) => {
      const pos = getCanvasPos(evt);
      const renderer = window.dopplerRenderer;
      const state = window.simState;

      if (this.isMouseDown && this.activeDragTarget) {
        if (this.activeDragTarget === 'source') {
          state.source.x = Math.max(30, Math.min(renderer.width - 30, pos.x));
          state.source.y = Math.max(30, Math.min(renderer.height - 30, pos.y));
        } else if (this.activeDragTarget === 'observer') {
          state.observer.x = Math.max(30, Math.min(renderer.width - 30, pos.x));
          state.observer.y = Math.max(30, Math.min(renderer.height - 30, pos.y));
        }
        this.updateHUD();
        state.checkQuests();
      } else if (renderer) {
        const hit = renderer.hitBoxes.find(b =>
          pos.x >= b.x && pos.x <= b.x + b.w &&
          pos.y >= b.y && pos.y <= b.y + b.h
        );
        canvas.style.cursor = hit ? 'grab' : 'default';
      }
    };

    const handlePointerUp = () => {
      this.isMouseDown = false;
      this.activeDragTarget = null;
      const state = window.simState;
      state.isDraggingSource = false;
      state.isDraggingObserver = false;
      canvas.style.cursor = 'default';
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvas.addEventListener('touchstart', (e) => { handlePointerDown(e); e.preventDefault(); }, { passive: false });
    window.addEventListener('touchmove', (e) => { handlePointerMove(e); }, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
  }

  updateHUD() {
    const state = window.simState;
    if (!state) return;

    const t = state.telemetry;

    // Header Badges
    const badgeMach = document.getElementById('hudBadgeMach');
    if (badgeMach) {
      badgeMach.textContent = `Mach ${t.machNumber.toFixed(2)}`;
      badgeMach.className = 'hud-badge ' + (t.machNumber >= 1.0 ? 'badge-orange' : 'badge-blue');
    }

    const badgeFObs = document.getElementById('hudBadgeFObs');
    if (badgeFObs) {
      badgeFObs.textContent = `f_obs = ${t.fObs.toFixed(1)} Hz`;
    }

    const badgeVSound = document.getElementById('hudBadgeVSound');
    if (badgeVSound) {
      badgeVSound.textContent = `v = ${t.vSound} m/s`;
    }

    // Telemetry Cards
    const hudFObsVal = document.getElementById('hudFObsVal');
    if (hudFObsVal) hudFObsVal.textContent = `${t.fObs.toFixed(1)} Hz`;

    const hudFSrcVal = document.getElementById('hudFSrcVal');
    if (hudFSrcVal) hudFSrcVal.textContent = `${t.f0.toFixed(0)} Hz`;

    const hudMachVal = document.getElementById('hudMachVal');
    if (hudMachVal) {
      hudMachVal.textContent = `M = ${t.machNumber.toFixed(2)}`;
    }

    const hudLambdaVal = document.getElementById('hudLambdaVal');
    if (hudLambdaVal) hudLambdaVal.textContent = `${t.lambdaObs.toFixed(2)} m`;

    const hudShiftRatio = document.getElementById('hudShiftRatio');
    if (hudShiftRatio) {
      const pct = (t.ratio * 100).toFixed(1);
      hudShiftRatio.textContent = `${pct}%`;
    }

    const hudDistance = document.getElementById('hudDistance');
    if (hudDistance) hudDistance.textContent = `${t.distance.toFixed(0)} m`;
  }

  updateZoomHUD() {
    const lbl = document.getElementById('lblZoomLevel');
    if (lbl && window.dopplerRenderer) {
      lbl.textContent = `${Math.round(window.dopplerRenderer.viewScale * 100)}%`;
    }
  }

  initModals() {
    // Quests Modal
    const modalQuests = document.getElementById('modalQuests');
    document.getElementById('btnOpenQuests')?.addEventListener('click', () => {
      modalQuests?.classList.add('active');
      this.renderQuestsList();
      if (window.soundEngine) window.soundEngine.playClick();
    });

    // Theory Modal
    const modalTheory = document.getElementById('modalTheory');
    document.getElementById('btnOpenTheory')?.addEventListener('click', () => {
      modalTheory?.classList.add('active');
      if (window.soundEngine) window.soundEngine.playClick();
    });

    // Close buttons & backdrop clicks
    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.modal-wrapper').forEach(m => m.classList.remove('active'));
      });
    });

    // Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-wrapper').forEach(m => m.classList.remove('active'));
      }
    });
  }

  renderQuestsList() {
    const container = document.getElementById('questsListContainer');
    if (!container || !window.simState) return;

    container.innerHTML = '';
    window.simState.quests.forEach(q => {
      const card = document.createElement('div');
      card.className = `quest-card ${q.completed ? 'completed' : ''}`;

      const stars = '⭐'.repeat(q.stars);
      card.innerHTML = `
        <div class="quest-header">
          <div class="quest-title-wrap">
            <span class="quest-stars">${stars}</span>
            <h4 class="quest-title">${q.title}</h4>
          </div>
          <span class="quest-status-badge ${q.completed ? 'badge-success' : 'badge-pending'}">
            ${q.completed ? 'COMPLETED ✓' : 'IN PROGRESS'}
          </span>
        </div>
        <p class="quest-desc">${q.desc}</p>
      `;
      container.appendChild(card);
    });
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

window.DopplerUI = DopplerUI;
