/**
 * ProjectileLab — UI Controller & Interaction Engine
 */

class ProjectileUI {
  constructor() {
    this.canvas = document.getElementById('projectileCanvas');
    this.isMouseDown = false;
    this.activeDragging = null; // 'target'

    this.initEventListeners();
    this.initCanvasInteractions();
    this.updateHUD();
  }

  initEventListeners() {
    const state = window.simState;

    // Fire Cannon Button
    const btnFire = document.getElementById('btnFire');
    if (btnFire) {
      btnFire.addEventListener('click', () => {
        state.fire();
        this.updateHUD();
      });
    }

    // Spacebar to fire cannon
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
        e.preventDefault();
        state.fire();
        this.updateHUD();
      }
    });

    // Clear Trails Button
    const btnClear = document.getElementById('btnClearTrails');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        state.clearTrajectories();
        this.showToast('Past trajectory trails cleared.', 'info');
      });
    }

    // Mode Switchers
    const btnModeFree = document.getElementById('btnModeFree');
    const btnModeTarget = document.getElementById('btnModeTarget');
    const btnModeMulti = document.getElementById('btnModeMulti');

    if (btnModeFree) btnModeFree.addEventListener('click', () => this.switchMode('free_range'));
    if (btnModeTarget) btnModeTarget.addEventListener('click', () => this.switchMode('target_challenge'));
    if (btnModeMulti) btnModeMulti.addEventListener('click', () => this.switchMode('multi_angle'));

    // Angle Slider & Input
    const angleSlider = document.getElementById('angleSlider');
    const angleNumber = document.getElementById('angleNumber');
    if (angleSlider) {
      angleSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.angle = val;
        if (angleNumber) angleNumber.value = val.toFixed(1);
        this.updateHUD();
      });
    }
    if (angleNumber) {
      angleNumber.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 45;
        val = Math.max(0, Math.min(90, val));
        state.angle = val;
        if (angleSlider) angleSlider.value = val;
        this.updateHUD();
      });
    }

    // Velocity Slider & Input
    const velocitySlider = document.getElementById('velocitySlider');
    const velocityNumber = document.getElementById('velocityNumber');
    if (velocitySlider) {
      velocitySlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.velocity = val;
        if (velocityNumber) velocityNumber.value = val.toFixed(1);
        this.updateHUD();
      });
    }
    if (velocityNumber) {
      velocityNumber.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 20;
        val = Math.max(5, Math.min(60, val));
        state.velocity = val;
        if (velocitySlider) velocitySlider.value = val;
        this.updateHUD();
      });
    }

    // Launch Height Slider & Input
    const heightSlider = document.getElementById('heightSlider');
    const heightNumber = document.getElementById('heightNumber');
    if (heightSlider) {
      heightSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.launchHeight = val;
        if (heightNumber) heightNumber.value = val.toFixed(1);
        this.updateHUD();
      });
    }
    if (heightNumber) {
      heightNumber.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 0;
        val = Math.max(0, Math.min(40, val));
        state.launchHeight = val;
        if (heightSlider) heightSlider.value = val;
        this.updateHUD();
      });
    }

    // Target Distance Slider
    const targetSlider = document.getElementById('targetSlider');
    const targetNumber = document.getElementById('targetNumber');
    if (targetSlider) {
      targetSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.target.x = val;
        if (targetNumber) targetNumber.value = val.toFixed(1);
      });
    }
    if (targetNumber) {
      targetNumber.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 38;
        val = Math.max(10, Math.min(150, val));
        state.target.x = val;
        if (targetSlider) targetSlider.value = val;
      });
    }

    // Environment / Gravity Select
    const selGravity = document.getElementById('selGravity');
    if (selGravity) {
      selGravity.addEventListener('change', (e) => {
        state.gravityKey = e.target.value;
        const env = Physics.environments[state.gravityKey];
        this.showToast(`Gravity environment: ${env.name} (g = ${env.g} m/s²)`, 'info');
        this.updateHUD();
      });
    }

    // Projectile Type Select
    const selProjectile = document.getElementById('selProjectile');
    if (selProjectile) {
      selProjectile.addEventListener('change', (e) => {
        state.projectileKey = e.target.value;
        const proj = Physics.projectiles[state.projectileKey];
        this.showToast(`Selected projectile: ${proj.name} (${proj.mass} kg)`, 'info');
      });
    }

    // Air Resistance Toggle
    const chkAirDrag = document.getElementById('chkAirDrag');
    if (chkAirDrag) {
      chkAirDrag.addEventListener('change', (e) => {
        state.airResistance = e.target.checked;
        this.showToast(state.airResistance ? 'Air Resistance: ENABLED (Quadratic Drag)' : 'Air Resistance: DISABLED (Vacuum)', 'info');
        this.updateHUD();
      });
    }

    // Vectors & Trail Toggles
    const chkVelocityVec = document.getElementById('chkVelocityVec');
    if (chkVelocityVec) {
      chkVelocityVec.addEventListener('change', (e) => {
        state.showVelocityVectors = e.target.checked;
      });
    }

    const chkAccelVec = document.getElementById('chkAccelVec');
    if (chkAccelVec) {
      chkAccelVec.addEventListener('change', (e) => {
        state.showAccelerationVector = e.target.checked;
      });
    }

    const chkTrail = document.getElementById('chkTrail');
    if (chkTrail) {
      chkTrail.addEventListener('change', (e) => {
        state.showTrail = e.target.checked;
      });
    }

    // Simulation Speed
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const spd = parseFloat(e.currentTarget.dataset.speed);
        state.simSpeed = spd;
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });

    // Zoom Controls
    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');
    const btnZoomFit = document.getElementById('btnZoomFit');
    const lblZoom = document.getElementById('lblZoomLevel');

    const updateZoomLabel = () => {
      if (lblZoom && window.projectileRenderer) {
        lblZoom.textContent = `${Math.round(window.projectileRenderer.viewScale * 100)}%`;
      }
    };

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        window.projectileRenderer?.zoomIn();
        updateZoomLabel();
      });
    }
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        window.projectileRenderer?.zoomOut();
        updateZoomLabel();
      });
    }
    if (btnZoomFit) {
      btnZoomFit.addEventListener('click', () => {
        window.projectileRenderer?.resetZoom();
        updateZoomLabel();
      });
    }

    // Modals
    const btnQuests = document.getElementById('btnOpenQuests');
    if (btnQuests) btnQuests.addEventListener('click', () => this.openModal('modalQuests'));

    const btnTheory = document.getElementById('btnOpenTheory');
    if (btnTheory) btnTheory.addEventListener('click', () => this.openModal('modalTheory'));

    const btnAudio = document.getElementById('btnAudioToggle');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        const enabled = window.soundEngine.toggle();
        btnAudio.textContent = enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
        btnAudio.classList.toggle('active', enabled);
      });
    }

    const btnResetAll = document.getElementById('btnResetAll');
    if (btnResetAll) btnResetAll.addEventListener('click', () => this.resetAll());

    // Modal Close
    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          document.querySelectorAll('.modal-wrapper').forEach(m => m.classList.remove('active'));
        }
      });
    });
  }

  // =========================================================================
  // CANVAS MOUSE & TOUCH INTERACTIONS
  // =========================================================================
  initCanvasInteractions() {
    const canvas = this.canvas;

    const getPos = (e) => {
      const renderer = window.projectileRenderer;
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
      this.isMouseDown = false;
      this.activeDragging = null;
    });

    window.addEventListener('touchend', () => {
      this.isMouseDown = false;
      this.activeDragging = null;
    });
  }

  handlePointerDown(pos) {
    const state = window.simState;
    const renderer = window.projectileRenderer;
    if (!renderer) return;

    // Check target hit
    const hit = renderer.hitBoxes.find(b => {
      return pos.x >= b.x && pos.x <= b.x + b.w &&
             pos.y >= b.y && pos.y <= b.y + b.h;
    });

    if (hit && hit.type === 'target') {
      this.activeDragging = 'target';
      return;
    }

    // Check if clicking near cannon barrel to adjust angle
    const origin = renderer.worldToCanvas(0, state.launchHeight);
    const distToCannon = Math.hypot(pos.x - origin.x, pos.y - origin.y);
    if (distToCannon < 65) {
      this.activeDragging = 'cannon';
      this.updateCannonAngleFromPointer(pos, origin);
    }
  }

  handlePointerMove(pos) {
    const state = window.simState;
    const renderer = window.projectileRenderer;
    if (!renderer) return;

    if (this.activeDragging === 'target') {
      const world = renderer.canvasToWorld(pos.x, pos.y);
      state.target.x = Math.max(5.0, Math.min(250.0, world.x));
      const targetSlider = document.getElementById('targetSlider');
      const targetNumber = document.getElementById('targetNumber');
      if (targetSlider) targetSlider.value = state.target.x;
      if (targetNumber) targetNumber.value = state.target.x.toFixed(1);
    } else if (this.activeDragging === 'cannon') {
      const origin = renderer.worldToCanvas(0, state.launchHeight);
      this.updateCannonAngleFromPointer(pos, origin);
    }
  }

  updateCannonAngleFromPointer(pos, origin) {
    const state = window.simState;
    const dx = pos.x - origin.x;
    const dy = origin.y - pos.y; // invert Y
    if (dx >= 0) {
      let deg = Physics.radToDeg(Math.atan2(dy, dx));
      deg = Math.max(0, Math.min(90, deg));
      state.angle = deg;

      const angleSlider = document.getElementById('angleSlider');
      const angleNumber = document.getElementById('angleNumber');
      if (angleSlider) angleSlider.value = deg;
      if (angleNumber) angleNumber.value = deg.toFixed(1);
      this.updateHUD();
    }
  }

  // =========================================================================
  // MODES & HUD
  // =========================================================================
  switchMode(modeKey) {
    const state = window.simState;
    state.mode = modeKey;

    document.querySelectorAll('.mode-type-btn').forEach(btn => btn.classList.remove('active'));
    if (modeKey === 'free_range') document.getElementById('btnModeFree')?.classList.add('active');
    if (modeKey === 'target_challenge') document.getElementById('btnModeTarget')?.classList.add('active');
    if (modeKey === 'multi_angle') document.getElementById('btnModeMulti')?.classList.add('active');

    // Show/hide target distance control in target challenge mode
    const grpTarget = document.getElementById('grpTargetDistance');
    if (grpTarget) {
      grpTarget.classList.toggle('hidden', modeKey !== 'target_challenge');
    }

    if (window.soundEngine) window.soundEngine.playClickSound();
    this.updateHUD();
  }

  updateHUD() {
    const state = window.simState;
    const g = state.getGravity();

    // Theoretical Kinematics
    const ideal = Physics.calculateIdealKinematics(state.velocity, state.angle, state.launchHeight, g);

    const hudRange = document.getElementById('hudRange');
    if (hudRange) hudRange.textContent = `${ideal.range.toFixed(2)} m`;

    const hudHeight = document.getElementById('hudHeight');
    if (hudHeight) hudHeight.textContent = `${ideal.maxHeight.toFixed(2)} m`;

    const hudTime = document.getElementById('hudTime');
    if (hudTime) hudTime.textContent = `${ideal.timeOfFlight.toFixed(2)} s`;

    const hudVx = document.getElementById('hudVx');
    if (hudVx) hudVx.textContent = `${ideal.v0x.toFixed(1)} m/s`;

    const hudVy = document.getElementById('hudVy');
    if (hudVy) hudVy.textContent = `${ideal.v0y.toFixed(1)} m/s`;

    const hudAngle = document.getElementById('hudBadgeAngle');
    if (hudAngle) hudAngle.textContent = `${state.angle.toFixed(1)}°`;

    const hudVelocity = document.getElementById('hudBadgeVelocity');
    if (hudVelocity) hudVelocity.textContent = `${state.velocity.toFixed(1)} m/s`;

    const hudG = document.getElementById('hudBadgeG');
    if (hudG) hudG.textContent = `g = ${g.toFixed(2)} m/s²`;
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
    state.angle = 45.0;
    state.velocity = 20.0;
    state.launchHeight = 0.0;
    state.gravityKey = 'earth';
    state.projectileKey = 'cannonball';
    state.airResistance = false;
    state.clearTrajectories();

    const aSlider = document.getElementById('angleSlider');
    const aNum = document.getElementById('angleNumber');
    if (aSlider) aSlider.value = 45;
    if (aNum) aNum.value = '45.0';

    const vSlider = document.getElementById('velocitySlider');
    const vNum = document.getElementById('velocityNumber');
    if (vSlider) vSlider.value = 20;
    if (vNum) vNum.value = '20.0';

    const hSlider = document.getElementById('heightSlider');
    const hNum = document.getElementById('heightNumber');
    if (hSlider) hSlider.value = 0;
    if (hNum) hNum.value = '0.0';

    const chk = document.getElementById('chkAirDrag');
    if (chk) chk.checked = false;

    const selG = document.getElementById('selGravity');
    if (selG) selG.value = 'earth';

    if (window.soundEngine) window.soundEngine.playClickSound();
    this.updateHUD();
    this.showToast('Reset all projectile parameters to default.', 'info');
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

window.ProjectileUI = ProjectileUI;
