/**
 * DiamondCutSim — User Interface Controller & Event Bindings
 * Handles mode buttons, parameter sliders, preset loaders,
 * visual toggles, laboratory quests modal, theory modal, and telemetry HUD.
 */

class DiamondUI {
  constructor() {
    this.renderer = null;
    this.init();
  }

  setRenderer(renderer) {
    this.renderer = renderer;
  }

  init() {
    this.bindModeButtons();
    this.bindControls();
    this.bindToggles();
    this.bindModals();
    this.bindHeaderActions();
  }

  bindModeButtons() {
    const modes = [
      { id: 'btnModeBrilliance', mode: 'brilliance' },
      { id: 'btnModeFire', mode: 'fire' },
      { id: 'btnModeTIR', mode: 'tir_demo' },
      { id: 'btnModeCutCompare', mode: 'cut_compare' },
      { id: 'btnModeCustomCut', mode: 'custom_cut' }
    ];

    modes.forEach(m => {
      const btn = document.getElementById(m.id);
      if (btn) {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.mode-type-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          window.simState.setMode(m.mode);
          this.syncControlsFromState();
          if (window.soundEngine) window.soundEngine.playClick();
          this.showToast(`Switched to mode: ${btn.innerText.trim()}`, 'info');
        });
      }
    });
  }

  bindControls() {
    const state = window.simState;

    // Material Selector
    const selMaterial = document.getElementById('selMaterial');
    if (selMaterial) {
      selMaterial.addEventListener('change', (e) => {
        state.materialKey = e.target.value;
        const mat = state.getMaterial();
        const descEl = document.getElementById('lblMaterialDesc');
        if (descEl) descEl.textContent = `${mat.name} (n = ${mat.n}): ${mat.desc}`;
        if (window.soundEngine) window.soundEngine.playSparkleChime(0.6);
      });
    }

    // Cut Shape Selector
    const selCut = document.getElementById('selCut');
    if (selCut) {
      selCut.addEventListener('change', (e) => {
        state.cutType = e.target.value;
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    // Incident Angle Slider
    const sldAngle = document.getElementById('sldIncidentAngle');
    const lblAngle = document.getElementById('lblIncidentAngleVal');
    if (sldAngle && lblAngle) {
      sldAngle.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.incidentAngleDeg = val;
        lblAngle.textContent = `${val >= 0 ? '+' : ''}${val.toFixed(1)}°`;
        if (window.soundEngine) window.soundEngine.playBouncePing(1);
      });
    }

    // Light Type Selector (White vs Laser)
    const btnLightWhite = document.getElementById('btnLightWhite');
    const btnLightLaser = document.getElementById('btnLightLaser');
    const laserControls = document.getElementById('laserControlsGroup');

    if (btnLightWhite && btnLightLaser) {
      btnLightWhite.addEventListener('click', () => {
        btnLightWhite.classList.add('active');
        btnLightLaser.classList.remove('active');
        state.lightType = 'white';
        if (laserControls) laserControls.style.display = 'none';
        if (window.soundEngine) window.soundEngine.playSparkleChime(0.8);
      });

      btnLightLaser.addEventListener('click', () => {
        btnLightLaser.classList.add('active');
        btnLightWhite.classList.remove('active');
        state.lightType = 'laser';
        if (laserControls) laserControls.style.display = 'block';
        if (window.soundEngine) window.soundEngine.playLaserTone(state.laserWavelength);
      });
    }

    // Beam Profile (Single vs Collimated Beam)
    const btnBeamSingle = document.getElementById('btnBeamSingle');
    const btnBeamMulti = document.getElementById('btnBeamMulti');
    if (btnBeamSingle && btnBeamMulti) {
      btnBeamSingle.addEventListener('click', () => {
        btnBeamSingle.classList.add('active');
        btnBeamMulti.classList.remove('active');
        state.beamMode = 'single';
        if (window.soundEngine) window.soundEngine.playClick();
      });

      btnBeamMulti.addEventListener('click', () => {
        btnBeamMulti.classList.add('active');
        btnBeamSingle.classList.remove('active');
        state.beamMode = 'multi';
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    // Laser Wavelength Slider
    const sldWl = document.getElementById('sldLaserWavelength');
    const lblWl = document.getElementById('lblLaserWavelengthVal');
    const swatchWl = document.getElementById('laserColorSwatch');
    if (sldWl && lblWl) {
      sldWl.addEventListener('input', (e) => {
        const wl = parseInt(e.target.value, 10);
        state.laserWavelength = wl;
        lblWl.textContent = `${wl} nm`;
        const color = Optics.wavelengthToCSS(wl);
        if (swatchWl) swatchWl.style.backgroundColor = color;
        if (window.soundEngine) window.soundEngine.playLaserTone(wl);
      });
    }

    // Dispersion Multiplier
    const sldDisp = document.getElementById('sldDispersionScale');
    const lblDisp = document.getElementById('lblDispersionScaleVal');
    if (sldDisp && lblDisp) {
      sldDisp.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.dispersionScale = val;
        lblDisp.textContent = `${val.toFixed(1)}×`;
      });
    }

    // Crown Angle Slider
    const sldCrown = document.getElementById('sldCrownAngle');
    const lblCrown = document.getElementById('lblCrownAngleVal');
    if (sldCrown && lblCrown) {
      sldCrown.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.cutParams.crownAngleDeg = val;
        lblCrown.textContent = `${val.toFixed(1)}°`;
      });
    }

    // Pavilion Angle Slider
    const sldPav = document.getElementById('sldPavilionAngle');
    const lblPav = document.getElementById('lblPavilionAngleVal');
    if (sldPav && lblPav) {
      sldPav.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.cutParams.pavilionAngleDeg = val;
        lblPav.textContent = `${val.toFixed(2)}°`;
      });
    }

    // Table Ratio Slider
    const sldTable = document.getElementById('sldTableRatio');
    const lblTable = document.getElementById('lblTableRatioVal');
    if (sldTable && lblTable) {
      sldTable.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.cutParams.tableRatio = val / 100;
        lblTable.textContent = `${val}%`;
      });
    }

    // Cut Proportions Presets
    const btnPresetIdeal = document.getElementById('btnPresetIdeal');
    const btnPresetShallow = document.getElementById('btnPresetShallow');
    const btnPresetDeep = document.getElementById('btnPresetDeep');

    if (btnPresetIdeal) {
      btnPresetIdeal.addEventListener('click', () => {
        state.cutParams = { crownAngleDeg: 34.5, pavilionAngleDeg: 40.75, tableRatio: 0.57 };
        this.syncControlsFromState();
        if (window.soundEngine) window.soundEngine.playSparkleChime(1.0);
        this.showToast('Applied Tolkowsky Ideal Cut Proportions ⭐', 'success');
      });
    }

    if (btnPresetShallow) {
      btnPresetShallow.addEventListener('click', () => {
        state.cutParams = { crownAngleDeg: 30.0, pavilionAngleDeg: 37.0, tableRatio: 0.65 };
        this.syncControlsFromState();
        if (window.soundEngine) window.soundEngine.playClick();
        this.showToast('Applied Shallow Cut (Light Leaks Out Bottom)', 'warning');
      });
    }

    if (btnPresetDeep) {
      btnPresetDeep.addEventListener('click', () => {
        state.cutParams = { crownAngleDeg: 37.0, pavilionAngleDeg: 43.5, tableRatio: 0.53 };
        this.syncControlsFromState();
        if (window.soundEngine) window.soundEngine.playClick();
        this.showToast('Applied Deep Cut (Light Leaks Out Sides)', 'warning');
      });
    }
  }

  bindToggles() {
    const state = window.simState;
    const toggles = [
      { id: 'chkShowRays', prop: 'showRays' },
      { id: 'chkShowNormals', prop: 'showNormals' },
      { id: 'chkShowAngles', prop: 'showAngles' },
      { id: 'chkShowCriticalCone', prop: 'showCriticalCone' },
      { id: 'chkShowFacetLabels', prop: 'showFacetLabels' },
      { id: 'chkShowFireRainbow', prop: 'showFireRainbow' },
      { id: 'chkShowPhotons', prop: 'showPhotons' },
      { id: 'chkShowGrid', prop: 'showGrid' }
    ];

    toggles.forEach(t => {
      const el = document.getElementById(t.id);
      if (el) {
        el.checked = !!state[t.prop];
        el.addEventListener('change', (e) => {
          state[t.prop] = e.target.checked;
        });
      }
    });
  }

  bindModals() {
    // Quests Modal
    const btnQuests = document.getElementById('btnOpenQuests');
    const modalQuests = document.getElementById('modalQuests');
    const btnCloseQuests = document.getElementById('btnCloseQuests');

    if (btnQuests && modalQuests) {
      btnQuests.addEventListener('click', () => {
        this.renderQuestsList();
        modalQuests.classList.add('active');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }
    if (btnCloseQuests && modalQuests) {
      btnCloseQuests.addEventListener('click', () => {
        modalQuests.classList.remove('active');
      });
    }

    // Theory Modal
    const btnTheory = document.getElementById('btnOpenTheory');
    const modalTheory = document.getElementById('modalTheory');
    const btnCloseTheory = document.getElementById('btnCloseTheory');

    if (btnTheory && modalTheory) {
      btnTheory.addEventListener('click', () => {
        modalTheory.classList.add('active');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }
    if (btnCloseTheory && modalTheory) {
      btnCloseTheory.addEventListener('click', () => {
        modalTheory.classList.remove('active');
      });
    }

    // Close on backdrop click
    [modalQuests, modalTheory].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.classList.remove('active');
        });
      }
    });
  }

  bindHeaderActions() {
    const state = window.simState;

    // Play / Pause
    const btnPlayPause = document.getElementById('btnPlayPause');
    if (btnPlayPause) {
      btnPlayPause.addEventListener('click', () => {
        state.isPaused = !state.isPaused;
        btnPlayPause.innerHTML = state.isPaused
          ? '<span>▶️</span> Resume'
          : '<span>⏸️</span> Pause';
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    // Sound Engine Toggle
    const btnAudio = document.getElementById('btnAudioToggle');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        const enabled = window.soundEngine.toggle();
        btnAudio.innerHTML = enabled ? '🔊 Sound: ON' : '🔈 Sound: OFF';
        btnAudio.classList.toggle('active', enabled);
      });
    }

    // Reset All
    const btnReset = document.getElementById('btnResetAll');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        state.resetAll();
        if (this.renderer) this.renderer.resetView();
        this.syncControlsFromState();
        if (window.soundEngine) window.soundEngine.playClick();
        this.showToast('Reset diamond simulation parameters to default', 'info');
      });
    }

    // View Zoom Controls
    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');
    const btnZoomFit = document.getElementById('btnZoomFit');

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        if (this.renderer) {
          this.renderer.view.zoom = Math.min(2.5, this.renderer.view.zoom * 1.15);
          this.updateZoomDisplay();
        }
      });
    }
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        if (this.renderer) {
          this.renderer.view.zoom = Math.max(0.5, this.renderer.view.zoom * 0.85);
          this.updateZoomDisplay();
        }
      });
    }
    if (btnZoomFit) {
      btnZoomFit.addEventListener('click', () => {
        if (this.renderer) {
          this.renderer.resetView();
          this.updateZoomDisplay();
        }
      });
    }
  }

  updateZoomDisplay() {
    const lbl = document.getElementById('lblZoomLevel');
    if (lbl && this.renderer) {
      lbl.textContent = `${Math.round(this.renderer.view.zoom * 100)}%`;
    }
  }

  syncControlsFromState() {
    const state = window.simState;

    // Angle slider
    const sldAngle = document.getElementById('sldIncidentAngle');
    const lblAngle = document.getElementById('lblIncidentAngleVal');
    if (sldAngle && lblAngle) {
      sldAngle.value = state.incidentAngleDeg;
      lblAngle.textContent = `${state.incidentAngleDeg >= 0 ? '+' : ''}${state.incidentAngleDeg.toFixed(1)}°`;
    }

    // Cut sliders
    const sldCrown = document.getElementById('sldCrownAngle');
    const lblCrown = document.getElementById('lblCrownAngleVal');
    if (sldCrown && lblCrown) {
      sldCrown.value = state.cutParams.crownAngleDeg;
      lblCrown.textContent = `${state.cutParams.crownAngleDeg.toFixed(1)}°`;
    }

    const sldPav = document.getElementById('sldPavilionAngle');
    const lblPav = document.getElementById('lblPavilionAngleVal');
    if (sldPav && lblPav) {
      sldPav.value = state.cutParams.pavilionAngleDeg;
      lblPav.textContent = `${state.cutParams.pavilionAngleDeg.toFixed(2)}°`;
    }

    const sldTable = document.getElementById('sldTableRatio');
    const lblTable = document.getElementById('lblTableRatioVal');
    if (sldTable && lblTable) {
      sldTable.value = Math.round(state.cutParams.tableRatio * 100);
      lblTable.textContent = `${Math.round(state.cutParams.tableRatio * 100)}%`;
    }

    // Material
    const selMat = document.getElementById('selMaterial');
    if (selMat) selMat.value = state.materialKey;

    // Cut type
    const selCut = document.getElementById('selCut');
    if (selCut) selCut.value = state.cutType;

    // Light type buttons
    const btnLightWhite = document.getElementById('btnLightWhite');
    const btnLightLaser = document.getElementById('btnLightLaser');
    const laserControls = document.getElementById('laserControlsGroup');

    if (btnLightWhite && btnLightLaser) {
      btnLightWhite.classList.toggle('active', state.lightType === 'white');
      btnLightLaser.classList.toggle('active', state.lightType === 'laser');
      if (laserControls) {
        laserControls.style.display = state.lightType === 'laser' ? 'block' : 'none';
      }
    }

    // Beam profile buttons
    const btnBeamSingle = document.getElementById('btnBeamSingle');
    const btnBeamMulti = document.getElementById('btnBeamMulti');
    if (btnBeamSingle && btnBeamMulti) {
      btnBeamSingle.classList.toggle('active', state.beamMode === 'single');
      btnBeamMulti.classList.toggle('active', state.beamMode === 'multi');
    }

    this.updateZoomDisplay();
  }

  updateHUD() {
    const state = window.simState;
    const telem = state.telemetry;

    // Top status badges
    const badgeRI = document.getElementById('hudBadgeRI');
    const badgeCrit = document.getElementById('hudBadgeCrit');
    const badgeBrilliance = document.getElementById('hudBadgeBrilliance');

    if (badgeRI) badgeRI.textContent = `n = ${telem.nGem.toFixed(3)}`;
    if (badgeCrit) badgeCrit.textContent = `θ_c = ${telem.critDeg.toFixed(1)}°`;
    if (badgeBrilliance) badgeBrilliance.textContent = `Brilliance: ${telem.brilliance}%`;

    // Telemetry Cards
    const hudAngleI = document.getElementById('hudAngleIVal');
    const hudAngleR = document.getElementById('hudAngleRVal');
    const hudCrit = document.getElementById('hudCritVal');
    const hudBounces = document.getElementById('hudBouncesVal');
    const hudBrilliance = document.getElementById('hudBrillianceVal');
    const hudFire = document.getElementById('hudFireVal');
    const hudCutGrade = document.getElementById('hudCutGradeVal');

    if (hudAngleI) hudAngleI.textContent = `${telem.iDeg.toFixed(1)}°`;
    if (hudAngleR) hudAngleR.textContent = `${telem.r1Deg.toFixed(1)}°`;
    if (hudCrit) hudCrit.textContent = `${telem.critDeg.toFixed(1)}°`;
    if (hudBounces) hudBounces.textContent = `${telem.totalInternalReflections}`;
    if (hudBrilliance) hudBrilliance.textContent = `${telem.brilliance}%`;
    if (hudFire) hudFire.textContent = `${telem.fire.toFixed(1)}°`;
    if (hudCutGrade) {
      hudCutGrade.textContent = telem.cutGrade;
      hudCutGrade.className = 'telemetry-card-val ' + (telem.brilliance >= 70 ? 'grade-excellent' : 'grade-warning');
    }
  }

  renderQuestsList() {
    const listEl = document.getElementById('questsListContainer');
    if (!listEl) return;

    const quests = window.simState.quests;
    listEl.innerHTML = quests.map(q => `
      <div class="quest-card ${q.completed ? 'completed' : ''}">
        <div class="quest-header">
          <div class="quest-title-wrap">
            <span class="quest-badge">${q.completed ? '✅ COMPLETED' : '⭐ ' + '★'.repeat(q.stars)}</span>
            <h4 class="quest-title">${q.title}</h4>
          </div>
          <span class="quest-status">${q.completed ? '100 XP' : 'Locked'}</span>
        </div>
        <p class="quest-desc">${q.desc}</p>
      </div>
    `).join('');
  }

  showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '💎' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
      <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

window.DiamondUI = DiamondUI;
