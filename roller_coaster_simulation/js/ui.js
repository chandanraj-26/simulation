/**
 * CoasterLab — User Interface Controller, Presets, Telemetry & Modals
 */

class CoasterUI {
  constructor() {
    this.dom = {
      // Buttons
      btnLaunch: document.getElementById('btnLaunch'),
      btnPause: document.getElementById('btnPause'),
      btnReset: document.getElementById('btnReset'),
      btnAudioToggle: document.getElementById('btnAudioToggle'),
      btnOpenQuests: document.getElementById('btnOpenQuests'),
      btnOpenTheory: document.getElementById('btnOpenTheory'),

      // Loop Mode Buttons
      btnModeCircular: document.getElementById('btnModeCircular'),
      btnModeClothoid: document.getElementById('btnModeClothoid'),

      // Presets
      presetSafe: document.getElementById('presetSafe'),
      presetBarely: document.getElementById('presetBarely'),
      presetFail: document.getElementById('presetFail'),

      // Sliders & Readouts
      sliderH0: document.getElementById('sliderH0'),
      valH0: document.getElementById('valH0'),
      sliderRadius: document.getElementById('sliderRadius'),
      valRadius: document.getElementById('valRadius'),
      sliderMass: document.getElementById('sliderMass'),
      valMass: document.getElementById('valMass'),
      sliderSpeed: document.getElementById('sliderSpeed'),
      valSpeed: document.getElementById('valSpeed'),
      sliderFriction: document.getElementById('sliderFriction'),
      valFriction: document.getElementById('valFriction'),

      // Indicators
      lblHMin: document.getElementById('lblHMin'),
      badgeHMinPass: document.getElementById('badgeHMinPass'),

      // Toggles
      chkVelocityVector: document.getElementById('chkVelocityVector'),
      chkForceVectors: document.getElementById('chkForceVectors'),
      chkEnergyBars: document.getElementById('chkEnergyBars'),
      chkSpeedTrail: document.getElementById('chkSpeedTrail'),
      chkFriction: document.getElementById('chkFriction'),

      // Telemetry Values
      telSpeed: document.getElementById('telSpeed'),
      telSpeedSub: document.getElementById('telSpeedSub'),
      telHeight: document.getElementById('telHeight'),
      telKE: document.getElementById('telKE'),
      telPE: document.getElementById('telPE'),
      telGForce: document.getElementById('telGForce'),
      telNormal: document.getElementById('telNormal'),
      telDist: document.getElementById('telDist'),
      telStatus: document.getElementById('telStatus'),
      cardNormal: document.getElementById('cardNormal'),

      // Modals
      modalQuests: document.getElementById('modalQuests'),
      modalTheory: document.getElementById('modalTheory'),
      questsList: document.getElementById('questsList'),

      // Crash Overlay
      crashOverlay: document.getElementById('crashOverlay'),
      btnCrashReset: document.getElementById('btnCrashReset'),
      crashH0Val: document.getElementById('crashH0Val'),
      crashHMinVal: document.getElementById('crashHMinVal'),

      // Toasts
      toastContainer: document.getElementById('toastContainer')
    };

    this.bindEvents();
    this.updateControlsFromState();
  }

  bindEvents() {
    const s = window.simState;
    const r = window.coasterRenderer;

    // Launch
    this.dom.btnLaunch?.addEventListener('click', () => {
      if (s.status === 'IDLE' || s.status === 'FINISHED' || s.status === 'CRASHED') {
        s.resetToTop(r?.track);
        s.status = 'RUNNING';
        if (window.soundEngine) {
          window.soundEngine.ensureContext();
          window.soundEngine.playWhoosh();
        }
        this.hideCrashOverlay();
      }
    });

    // Pause / Resume
    this.dom.btnPause?.addEventListener('click', () => {
      if (s.status === 'RUNNING') {
        s.status = 'PAUSED';
        this.dom.btnPause.innerHTML = '<span>▶️</span> Resume';
        if (window.soundEngine) window.soundEngine.stopWind();
      } else if (s.status === 'PAUSED') {
        s.status = 'RUNNING';
        this.dom.btnPause.innerHTML = '<span>⏸️</span> Pause';
      }
    });

    // Reset
    this.dom.btnReset?.addEventListener('click', () => {
      s.resetToTop(r?.track);
      if (window.soundEngine) {
        window.soundEngine.stopWind();
        window.soundEngine.playClick();
      }
      this.hideCrashOverlay();
    });

    // Crash Modal Reset
    this.dom.btnCrashReset?.addEventListener('click', () => {
      s.resetToTop(r?.track);
      this.hideCrashOverlay();
      if (window.soundEngine) {
        window.soundEngine.stopWind();
        window.soundEngine.playClick();
      }
    });

    // Audio Toggle
    this.dom.btnAudioToggle?.addEventListener('click', () => {
      s.isAudioMuted = !s.isAudioMuted;
      if (window.soundEngine) {
        window.soundEngine.isMuted = s.isAudioMuted;
        if (s.isAudioMuted) window.soundEngine.stopWind();
      }
      this.dom.btnAudioToggle.textContent = s.isAudioMuted ? '🔇 Audio: OFF' : '🔊 Audio: ON';
      this.dom.btnAudioToggle.classList.toggle('active', !s.isAudioMuted);
    });

    // Mode Selector (Circular vs Clothoid)
    this.dom.btnModeCircular?.addEventListener('click', () => {
      s.loopType = 'circular';
      this.dom.btnModeCircular.classList.add('active');
      this.dom.btnModeClothoid?.classList.remove('active');
      r?.track.setParameters(s.h0, s.loopRadius, 'circular');
      s.resetToTop(r?.track);
      this.showToast('Switched to Classic Circular Loop (Constant Curvature)');
    });

    this.dom.btnModeClothoid?.addEventListener('click', () => {
      s.loopType = 'clothoid';
      this.dom.btnModeClothoid.classList.add('active');
      this.dom.btnModeCircular?.classList.remove('active');
      r?.track.setParameters(s.h0, s.loopRadius, 'clothoid');
      s.resetToTop(r?.track);
      this.showToast('Switched to Teardrop Clothoid Loop (Reduced G-Force)');
    });

    // Presets
    this.dom.presetSafe?.addEventListener('click', () => {
      s.applyPreset('safe', r?.track);
      this.updateControlsFromState();
      this.highlightPreset('safe');
      this.showToast('Applied "Safe Run" Preset (h₀ = 40m, R = 10m)');
    });

    this.dom.presetBarely?.addEventListener('click', () => {
      s.applyPreset('barely', r?.track);
      this.updateControlsFromState();
      this.highlightPreset('barely');
      this.showToast('Applied "Barely Makes It" Preset (h₀ = 25m = 2.5R exact!)');
    });

    this.dom.presetFail?.addEventListener('click', () => {
      s.applyPreset('fail', r?.track);
      this.updateControlsFromState();
      this.highlightPreset('fail');
      this.showToast('Applied "Fail Preset" (h₀ = 20m < 2.5R minimum!)');
    });

    // Sliders
    this.dom.sliderH0?.addEventListener('input', (e) => {
      s.h0 = parseFloat(e.target.value);
      this.dom.valH0.textContent = `${s.h0.toFixed(1)} m`;
      r?.track.setParameters(s.h0, s.loopRadius, s.loopType);
      s.resetToTop(r?.track);
      this.updateHMinIndicator();
    });

    this.dom.sliderRadius?.addEventListener('input', (e) => {
      s.loopRadius = parseFloat(e.target.value);
      this.dom.valRadius.textContent = `${s.loopRadius.toFixed(1)} m`;
      r?.track.setParameters(s.h0, s.loopRadius, s.loopType);
      s.resetToTop(r?.track);
      this.updateHMinIndicator();
    });

    this.dom.sliderMass?.addEventListener('input', (e) => {
      s.mass = parseInt(e.target.value, 10);
      this.dom.valMass.textContent = `${s.mass} kg`;
      s.initialEnergy = Physics.getPotentialEnergy(s.mass, s.h0);
      s.totalEnergy = s.initialEnergy;
    });

    this.dom.sliderSpeed?.addEventListener('input', (e) => {
      s.simSpeed = parseFloat(e.target.value);
      this.dom.valSpeed.textContent = `${s.simSpeed.toFixed(2)}x`;
    });

    this.dom.sliderFriction?.addEventListener('input', (e) => {
      s.friction = parseFloat(e.target.value);
      this.dom.valFriction.textContent = s.friction.toFixed(3);
    });

    // Toggles
    this.dom.chkVelocityVector?.addEventListener('change', (e) => {
      s.showVelocityVector = e.target.checked;
    });
    this.dom.chkForceVectors?.addEventListener('change', (e) => {
      s.showForceVectors = e.target.checked;
    });
    this.dom.chkEnergyBars?.addEventListener('change', (e) => {
      s.showEnergyBars = e.target.checked;
    });
    this.dom.chkSpeedTrail?.addEventListener('change', (e) => {
      s.showSpeedTrail = e.target.checked;
    });
    this.dom.chkFriction?.addEventListener('change', (e) => {
      s.isFrictionEnabled = e.target.checked;
    });

    // Modals
    this.dom.btnOpenQuests?.addEventListener('click', () => {
      this.renderQuests();
      this.dom.modalQuests?.classList.add('active');
    });

    this.dom.btnOpenTheory?.addEventListener('click', () => {
      this.dom.modalTheory?.classList.add('active');
    });

    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.modal-wrapper').forEach(m => m.classList.remove('active'));
      });
    });
  }

  highlightPreset(key) {
    this.dom.presetSafe?.classList.remove('active-safe');
    this.dom.presetBarely?.classList.remove('active-barely');
    this.dom.presetFail?.classList.remove('active-fail');

    if (key === 'safe') this.dom.presetSafe?.classList.add('active-safe');
    if (key === 'barely') this.dom.presetBarely?.classList.add('active-barely');
    if (key === 'fail') this.dom.presetFail?.classList.add('active-fail');
  }

  updateControlsFromState() {
    const s = window.simState;
    if (this.dom.sliderH0) {
      this.dom.sliderH0.value = s.h0;
      this.dom.valH0.textContent = `${s.h0.toFixed(1)} m`;
    }
    if (this.dom.sliderRadius) {
      this.dom.sliderRadius.value = s.loopRadius;
      this.dom.valRadius.textContent = `${s.loopRadius.toFixed(1)} m`;
    }
    if (this.dom.sliderMass) {
      this.dom.sliderMass.value = s.mass;
      this.dom.valMass.textContent = `${s.mass} kg`;
    }
    if (this.dom.sliderSpeed) {
      this.dom.sliderSpeed.value = s.simSpeed;
      this.dom.valSpeed.textContent = `${s.simSpeed.toFixed(2)}x`;
    }
    if (this.dom.sliderFriction) {
      this.dom.sliderFriction.value = s.friction;
      this.dom.valFriction.textContent = s.friction.toFixed(3);
    }
    if (this.dom.chkFriction) {
      this.dom.chkFriction.checked = s.isFrictionEnabled;
    }
    this.updateHMinIndicator();
  }

  updateHMinIndicator() {
    const s = window.simState;
    const hMin = 2.5 * s.loopRadius;
    if (this.dom.lblHMin) {
      this.dom.lblHMin.textContent = `${hMin.toFixed(1)} m`;
    }
    if (this.dom.badgeHMinPass) {
      const isPass = s.h0 >= hMin;
      this.dom.badgeHMinPass.className = `hmin-badge ${isPass ? 'pass' : 'fail'}`;
      this.dom.badgeHMinPass.textContent = isPass ? 'PASS (Safe)' : 'FAIL (Derail!)';
    }
  }

  updateTelemetry() {
    const s = window.simState;

    if (this.dom.telSpeed) {
      this.dom.telSpeed.textContent = `${s.v.toFixed(1)} m/s`;
      if (this.dom.telSpeedSub) {
        this.dom.telSpeedSub.textContent = `${(s.v * 3.6).toFixed(1)} km/h`;
      }
    }
    if (this.dom.telHeight) {
      this.dom.telHeight.textContent = `${s.y.toFixed(1)} m`;
    }
    if (this.dom.telKE) {
      this.dom.telKE.textContent = `${(s.ke / 1000).toFixed(1)} kJ`;
    }
    if (this.dom.telPE) {
      this.dom.telPE.textContent = `${(s.pe / 1000).toFixed(1)} kJ`;
    }
    if (this.dom.telGForce) {
      this.dom.telGForce.textContent = `${s.gForce.toFixed(2)} G`;
    }
    if (this.dom.telNormal) {
      this.dom.telNormal.textContent = `${(s.normalForce / 1000).toFixed(2)} kN`;
      if (s.normalForce <= 0 && s.status !== 'IDLE') {
        this.dom.cardNormal?.classList.add('highlight-critical');
        this.dom.telNormal.classList.add('color-critical');
      } else {
        this.dom.cardNormal?.classList.remove('highlight-critical');
        this.dom.telNormal.classList.remove('color-critical');
      }
    }
    if (this.dom.telDist) {
      this.dom.telDist.textContent = `${s.s.toFixed(1)} m`;
    }
    if (this.dom.telStatus) {
      let badgeClass = 'hud-pill status-safe';
      let text = 'READY';
      if (s.status === 'RUNNING') text = 'ON TRACK';
      else if (s.status === 'PAUSED') text = 'PAUSED';
      else if (s.status === 'FALLING') {
        text = '⚠ AIRBORNE';
        badgeClass = 'hud-pill status-barely';
      } else if (s.status === 'CRASHED') {
        text = '💥 DERAILED';
        badgeClass = 'hud-pill status-fail';
      } else if (s.status === 'FINISHED') {
        text = '🏁 FINISHED';
      }
      this.dom.telStatus.className = badgeClass;
      this.dom.telStatus.textContent = text;
    }
  }

  showCrashOverlay() {
    const s = window.simState;
    if (this.dom.crashH0Val) this.dom.crashH0Val.textContent = `${s.h0.toFixed(1)} m`;
    if (this.dom.crashHMinVal) this.dom.crashHMinVal.textContent = `${(2.5 * s.loopRadius).toFixed(1)} m`;
    this.dom.crashOverlay?.classList.add('visible');
  }

  hideCrashOverlay() {
    this.dom.crashOverlay?.classList.remove('visible');
  }

  renderQuests() {
    if (!this.dom.questsList) return;
    const s = window.simState;
    this.dom.questsList.innerHTML = s.quests.map(q => `
      <div class="quest-card ${q.completed ? 'completed' : ''}">
        <div class="quest-badge">${q.completed ? '✅' : '🎯'}</div>
        <div class="quest-content">
          <div class="quest-title">
            <span>${q.title}</span>
            <span class="quest-stars">${'⭐'.repeat(q.stars)}</span>
          </div>
          <p class="quest-desc">${q.desc}</p>
        </div>
      </div>
    `).join('');
  }

  showToast(message, type = 'info') {
    if (!this.dom.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>ℹ️</span> <div>${message}</div>`;
    this.dom.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

window.CoasterUI = CoasterUI;
