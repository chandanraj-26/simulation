/**
 * AcidBaseLab — User Interface Controller & Interaction System
 * Handles mouse/touch drag-and-drop apparatus physics, modal dialogs,
 * laboratory notebook logging, CSV export, and audio feedback.
 */

class AcidBaseUI {
  constructor() {
    this.canvas = document.getElementById('indicatorCanvas');
    this.activeDragging = null; // 'probe' | 'red_litmus' | 'blue_litmus' | 'ph_paper'
    this.isMouseDown = false;
    this.lastMousePos = { x: 0, y: 0 };

    this.initEventListeners();
    this.initCanvasInteractions();
    this.updateHUD();
  }

  initEventListeners() {
    const state = window.simState;

    // Mode Switcher Buttons
    const btnSpot = document.getElementById('btnModeSpot');
    const btnTitration = document.getElementById('btnModeTitration');
    const btnMolecular = document.getElementById('btnModeMolecular');

    if (btnSpot) {
      btnSpot.addEventListener('click', () => this.switchMode('spot_tubes'));
    }
    if (btnTitration) {
      btnTitration.addEventListener('click', () => this.switchMode('titration'));
    }
    if (btnMolecular) {
      btnMolecular.addEventListener('click', () => this.switchMode('molecular'));
    }

    // Quick Substance Preset Chips
    document.querySelectorAll('.preset-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const subKey = e.currentTarget.dataset.substance;
        this.selectSubstancePreset(subKey);
      });
    });

    // Custom pH Slider & Number Input
    const phSlider = document.getElementById('inputPHSlider');
    const phNumber = document.getElementById('inputPHNumber');

    if (phSlider) {
      phSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (phNumber) phNumber.value = val.toFixed(2);
        this.updateCustomPH(val);
      });
    }

    if (phNumber) {
      phNumber.addEventListener('change', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 7.0;
        val = Math.max(0, Math.min(14, val));
        if (phSlider) phSlider.value = val;
        this.updateCustomPH(val);
      });
    }

    // Indicator Selector
    document.querySelectorAll('.indicator-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const indKey = e.currentTarget.dataset.indicator;
        this.selectIndicator(indKey);
      });
    });

    // Action Controls
    const btnAddDrop = document.getElementById('btnAddDrop');
    if (btnAddDrop) {
      btnAddDrop.addEventListener('click', () => this.addDropToSelectedVessel());
    }

    const btnRinse = document.getElementById('btnRinse');
    if (btnRinse) {
      btnRinse.addEventListener('click', () => {
        state.rinseAllVessels();
        if (window.soundEngine) window.soundEngine.playSuctionSound();
        this.showToast('Vessels rinsed with deionized water.', 'info');
      });
    }

    const btnLogObservation = document.getElementById('btnLogObservation');
    if (btnLogObservation) {
      btnLogObservation.addEventListener('click', () => this.logCurrentObservation());
    }

    // Titration Controls
    const selAnalyte = document.getElementById('selAnalyteType');
    if (selAnalyte) {
      selAnalyte.addEventListener('change', (e) => {
        state.titration.analyteType = e.target.value;
        this.showToast(`Analyte switched to ${e.target.options[e.target.selectedIndex].text}`, 'info');
      });
    }

    const selTitrantInd = document.getElementById('selTitrantIndicator');
    if (selTitrantInd) {
      selTitrantInd.addEventListener('change', (e) => {
        state.titration.indicator = e.target.value;
        this.showToast(`Titration indicator set to ${e.target.options[e.target.selectedIndex].text}`, 'info');
      });
    }

    const btnStopcockToggle = document.getElementById('btnStopcockToggle');
    if (btnStopcockToggle) {
      btnStopcockToggle.addEventListener('click', () => this.cycleStopcock());
    }

    const btnRefillBurette = document.getElementById('btnRefillBurette');
    if (btnRefillBurette) {
      btnRefillBurette.addEventListener('click', () => {
        state.titration.titrantAdded = 0.0;
        state.titration.stopcockState = 'closed';
        state.titration.drops = [];
        state.titration.swirlBlooms = [];
        if (window.soundEngine) window.soundEngine.playSwitchSound();
        this.showToast('Burette refilled with 0.1 M NaOH to 0.00 mL mark.', 'info');
        this.updateTitrationUI();
      });
    }

    const stirrerSlider = document.getElementById('stirrerSpeedSlider');
    if (stirrerSlider) {
      stirrerSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        state.titration.stirrerSpeed = val;
        const lbl = document.getElementById('stirrerSpeedVal');
        if (lbl) lbl.textContent = `${val}%`;
        if (window.soundEngine) window.soundEngine.updateStirrerSound(val);
      });
    }

    // Modal Dialog Openers
    const btnQuests = document.getElementById('btnOpenQuests');
    if (btnQuests) {
      btnQuests.addEventListener('click', () => this.openModal('modalQuests'));
    }

    const btnTheory = document.getElementById('btnOpenTheory');
    if (btnTheory) {
      btnTheory.addEventListener('click', () => this.openModal('modalTheory'));
    }

    const btnLabReport = document.getElementById('btnOpenLabReport');
    if (btnLabReport) {
      btnLabReport.addEventListener('click', () => {
        this.renderLabReportTable();
        this.openModal('modalLabReport');
      });
    }

    const btnResetAll = document.getElementById('btnResetAll');
    if (btnResetAll) {
      btnResetAll.addEventListener('click', () => this.resetAll());
    }

    // Audio Toggle
    const btnAudio = document.getElementById('btnAudioToggle');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        const enabled = window.soundEngine.toggle();
        btnAudio.textContent = enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
        btnAudio.classList.toggle('active', enabled);
      });
    }

    // Zoom scale controls
    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');
    const btnZoomFit = document.getElementById('btnZoomFit');
    const lblZoom = document.getElementById('lblZoomLevel');

    const updateZoomLabel = () => {
      if (lblZoom && window.laboratoryRenderer) {
        lblZoom.textContent = `${Math.round(window.laboratoryRenderer.viewScale * 100)}%`;
      }
    };

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        window.laboratoryRenderer?.zoomIn();
        updateZoomLabel();
      });
    }
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        window.laboratoryRenderer?.zoomOut();
        updateZoomLabel();
      });
    }
    if (btnZoomFit) {
      btnZoomFit.addEventListener('click', () => {
        window.laboratoryRenderer?.resetZoom();
        updateZoomLabel();
      });
    }

    // Modal Close Buttons
    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          document.querySelectorAll('.modal-wrapper').forEach(m => m.classList.remove('active'));
        }
      });
    });

    // CSV Download
    const btnExportCSV = document.getElementById('btnExportCSV');
    if (btnExportCSV) {
      btnExportCSV.addEventListener('click', () => this.exportCSV());
    }
  }

  // =========================================================================
  // CANVAS MOUSE & TOUCH DRAG INTERACTIONS
  // =========================================================================
  initCanvasInteractions() {
    const canvas = this.canvas;

    const getPos = (e) => {
      const renderer = window.laboratoryRenderer;
      if (!renderer) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rawPos = {
        x: (clientX - rect.left) * (renderer.width / rect.width),
        y: (clientY - rect.top) * (renderer.height / rect.height)
      };
      return renderer.transformPointerPos(rawPos);
    };

    // MOUSE DOWN
    canvas.addEventListener('mousedown', (e) => {
      const pos = getPos(e);
      this.isMouseDown = true;
      this.lastMousePos = pos;
      this.handlePointerDown(pos);
    });

    // TOUCH START
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const pos = getPos(e);
      this.isMouseDown = true;
      this.lastMousePos = pos;
      this.handlePointerDown(pos);
    }, { passive: false });

    // MOUSE MOVE
    window.addEventListener('mousemove', (e) => {
      if (!this.isMouseDown) return;
      const pos = getPos(e);
      this.handlePointerMove(pos);
    });

    // TOUCH MOVE
    window.addEventListener('touchmove', (e) => {
      if (!this.isMouseDown) return;
      const pos = getPos(e);
      this.handlePointerMove(pos);
    }, { passive: false });

    // MOUSE UP
    window.addEventListener('mouseup', () => {
      if (this.isMouseDown) {
        this.isMouseDown = false;
        this.handlePointerUp();
      }
    });

    // TOUCH END
    window.addEventListener('touchend', () => {
      if (this.isMouseDown) {
        this.isMouseDown = false;
        this.handlePointerUp();
      }
    });
  }

  handlePointerDown(pos) {
    const renderer = window.laboratoryRenderer;
    const state = window.simState;
    if (!renderer) return;

    // Hit-test interactive apparatus boxes
    const hits = renderer.hitBoxes.filter(box => {
      return pos.x >= box.x && pos.x <= box.x + box.w &&
             pos.y >= box.y && pos.y <= box.y + box.h;
    });

    if (hits.length === 0) {
      // Check if clicked near digital probe to drag it
      const distProbe = Math.hypot(pos.x - state.digitalProbe.x, pos.y - (state.digitalProbe.y + 40));
      if (distProbe < 35) {
        this.activeDragging = 'probe';
        state.digitalProbe.isDragging = true;
        return;
      }
      return;
    }

    const hit = hits[hits.length - 1]; // topmost hit

    // Case 1: Clicked Test Tube
    if (hit.type === 'tube') {
      state.selectedVessel = { type: 'tube', index: hit.index };
      this.addDropToVessel(state.testTubes[hit.index], hit.x + hit.w / 2, hit.y + 20);
      this.updateHUD();
      return;
    }

    // Case 2: Clicked Spot Well
    if (hit.type === 'well') {
      state.selectedVessel = { type: 'well', index: hit.index };
      this.addDropToVessel(state.spotWells[hit.index], hit.x + hit.w / 2, hit.y + 20);
      this.updateHUD();
      return;
    }

    // Case 3: Clicked Reagent Shelf Bottle
    if (hit.type === 'indicator_bottle') {
      this.selectIndicator(hit.indicatorKey);
      if (window.soundEngine) window.soundEngine.playSwitchSound();
      return;
    }

    // Case 4: Clicked Test Strip Dispenser -> Start Dragging Strip
    if (hit.type === 'strip_dispenser') {
      this.activeDragging = hit.stripKey;
      state.strips[hit.stripKey].isDragging = true;
      state.strips[hit.stripKey].x = pos.x;
      state.strips[hit.stripKey].y = pos.y;
      if (window.soundEngine) window.soundEngine.playSuctionSound();
      return;
    }

    // Case 5: Clicked Probe Holder
    if (hit.type === 'probe_holder') {
      this.activeDragging = 'probe';
      state.digitalProbe.isDragging = true;
      state.digitalProbe.x = pos.x;
      state.digitalProbe.y = pos.y - 40;
      if (window.soundEngine) window.soundEngine.playClinkSound();
      return;
    }

    // Case 6: Clicked Burette Stopcock
    if (hit.type === 'stopcock') {
      this.cycleStopcock();
      return;
    }
  }

  handlePointerMove(pos) {
    const state = window.simState;
    const renderer = window.laboratoryRenderer;

    if (this.activeDragging === 'probe') {
      state.digitalProbe.x = pos.x;
      state.digitalProbe.y = pos.y - 40;
      this.checkProbeCollision(pos);
    } else if (this.activeDragging && state.strips[this.activeDragging]) {
      const strip = state.strips[this.activeDragging];
      strip.x = pos.x;
      strip.y = pos.y - 20;
      this.checkStripCollision(this.activeDragging, pos);
    }
  }

  handlePointerUp() {
    const state = window.simState;
    if (this.activeDragging === 'probe') {
      state.digitalProbe.isDragging = false;
      // If probe was released outside any liquid, keep reading or reset
    } else if (this.activeDragging && state.strips[this.activeDragging]) {
      state.strips[this.activeDragging].isDragging = false;
    }
    this.activeDragging = null;
  }

  // Check if digital probe tip is inside a test tube or spot well
  checkProbeCollision(pos) {
    const state = window.simState;
    const renderer = window.laboratoryRenderer;
    const tipX = state.digitalProbe.x;
    const tipY = state.digitalProbe.y + 104;

    const hit = renderer.hitBoxes.find(box => {
      return (box.type === 'tube' || box.type === 'well') &&
             tipX >= box.x && tipX <= box.x + box.w &&
             tipY >= box.y && tipY <= box.y + box.h;
    });

    if (hit) {
      const vessel = hit.type === 'tube' ? state.testTubes[hit.index] : state.spotWells[hit.index];
      const ph = state.getVesselPH(vessel);
      state.digitalProbe.readingPH = ph;
      state.digitalProbe.activeTarget = vessel;

      // Quest 4 check
      if (vessel.substanceKey === 'mystery_a') {
        state.quests[3].state.measuredWithProbe = true;
        state.checkQuests();
      }
    } else {
      state.digitalProbe.activeTarget = null;
    }
  }

  // Check if litmus paper strip is dipped into a test tube or spot well
  checkStripCollision(stripKey, pos) {
    const state = window.simState;
    const renderer = window.laboratoryRenderer;
    const strip = state.strips[stripKey];
    const tipX = strip.x;
    const tipY = strip.y + 60; // bottom tip of strip

    const hit = renderer.hitBoxes.find(box => {
      return (box.type === 'tube' || box.type === 'well') &&
             tipX >= box.x && tipX <= box.x + box.w &&
             tipY >= box.y && tipY <= box.y + box.h;
    });

    if (hit) {
      const vessel = hit.type === 'tube' ? state.testTubes[hit.index] : state.spotWells[hit.index];
      const ph = state.getVesselPH(vessel);
      const res = Chemistry.testLitmusStrip(stripKey, ph);

      strip.isDipped = true;
      strip.dippedColor = res.paperColor;
      vessel.litmusTested = stripKey;

      if (window.soundEngine && !strip.hasPlayedSound) {
        window.soundEngine.playClinkSound();
        strip.hasPlayedSound = true;
      }

      this.showToast(`${res.description}`, 'info');

      // Quest 2 checks
      if (stripKey === 'blue_litmus' && res.paperColor === '#ef4444') {
        state.quests[1].state.blueTurnedRed = true;
      }
      if (stripKey === 'red_litmus' && res.paperColor === '#2563eb') {
        state.quests[1].state.redTurnedBlue = true;
      }

      // Quest 4 check
      if (stripKey === 'ph_paper' && vessel.substanceKey === 'mystery_a') {
        state.quests[3].state.testedWithIndicator = true;
      }

      state.checkQuests();
    } else {
      strip.hasPlayedSound = false;
    }
  }

  // Add animated drop to target vessel
  addDropToVessel(vessel, dropStartX, dropStartY) {
    const state = window.simState;
    const ind = Chemistry.indicators[state.indicatorKey];

    state.dropperDrops.push({
      x: dropStartX,
      y: dropStartY - 30,
      vy: 180,
      targetY: dropStartY + 10,
      color: ind ? (ind.dropperBottleColor || '#38bdf8') : '#38bdf8',
      indicatorKey: state.indicatorKey,
      targetVessel: vessel
    });

    if (window.soundEngine) window.soundEngine.playSuctionSound();

    // Quest 4 check
    if (vessel.substanceKey === 'mystery_a' && state.indicatorKey === 'universal') {
      state.quests[3].state.testedWithIndicator = true;
    }
  }

  addDropToSelectedVessel() {
    const state = window.simState;
    const sel = state.selectedVessel;
    const vessel = sel.type === 'tube' ? state.testTubes[sel.index] : state.spotWells[sel.index];
    if (vessel) {
      state.addIndicatorToVessel(vessel, state.indicatorKey, 1);
      if (window.soundEngine) window.soundEngine.playDropSound();
      this.showToast(`Added 1 drop of ${Chemistry.indicators[state.indicatorKey].name} to ${vessel.name}`, 'success');
      this.updateHUD();
    }
  }

  // =========================================================================
  // ACTIONS & MODES
  // =========================================================================
  switchMode(modeKey) {
    const state = window.simState;
    state.mode = modeKey;

    document.querySelectorAll('.mode-type-btn').forEach(btn => btn.classList.remove('active'));
    if (modeKey === 'spot_tubes') {
      document.getElementById('btnModeSpot')?.classList.add('active');
    } else if (modeKey === 'titration') {
      document.getElementById('btnModeTitration')?.classList.add('active');
    } else if (modeKey === 'molecular') {
      document.getElementById('btnModeMolecular')?.classList.add('active');
    }

    // Toggle sidebar sections
    document.getElementById('secSpotControls')?.classList.toggle('hidden', modeKey !== 'spot_tubes');
    document.getElementById('secTitrationControls')?.classList.toggle('hidden', modeKey !== 'titration');
    document.getElementById('secMolecularControls')?.classList.toggle('hidden', modeKey !== 'molecular');

    if (window.soundEngine) {
      window.soundEngine.playSwitchSound();
      if (modeKey === 'titration') {
        window.soundEngine.updateStirrerSound(state.titration.stirrerSpeed);
      } else {
        window.soundEngine.stopStirrerSound();
      }
    }

    this.updateHUD();
  }

  selectSubstancePreset(subKey) {
    const state = window.simState;
    const sub = Chemistry.substances[subKey];
    if (!sub) return;

    state.substanceKey = subKey;
    state.customPH = sub.defaultPH;

    const slider = document.getElementById('inputPHSlider');
    const num = document.getElementById('inputPHNumber');
    if (slider) slider.value = sub.defaultPH;
    if (num) num.value = sub.defaultPH.toFixed(2);

    // Update preset chips UI
    document.querySelectorAll('.preset-chip').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.substance === subKey);
    });

    // Update selected vessel
    const sel = state.selectedVessel;
    const vessel = sel.type === 'tube' ? state.testTubes[sel.index] : state.spotWells[sel.index];
    if (vessel) {
      state.setVesselSubstance(vessel, subKey, sub.defaultPH);
    }

    if (window.soundEngine) window.soundEngine.playSuctionSound();
    this.showToast(`Selected substance: ${sub.name} (pH ${sub.defaultPH})`, 'info');
    this.updateHUD();
  }

  updateCustomPH(ph) {
    const state = window.simState;
    state.customPH = ph;
    state.substanceKey = 'custom';

    // Deselect preset chips
    document.querySelectorAll('.preset-chip').forEach(btn => btn.classList.remove('active'));

    const sel = state.selectedVessel;
    const vessel = sel.type === 'tube' ? state.testTubes[sel.index] : state.spotWells[sel.index];
    if (vessel) {
      vessel.substanceKey = 'custom';
      vessel.customPH = ph;
      if (vessel.indicatorKey) {
        state.addIndicatorToVessel(vessel, vessel.indicatorKey, 0); // recalculate color
      }
    }

    this.updateHUD();
  }

  selectIndicator(indKey) {
    const state = window.simState;
    const ind = Chemistry.indicators[indKey];
    if (!ind) return;

    state.indicatorKey = indKey;

    document.querySelectorAll('.indicator-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.indicator === indKey);
    });

    this.updateHUD();
  }

  cycleStopcock() {
    const state = window.simState;
    const tit = state.titration;
    const btn = document.getElementById('btnStopcockToggle');

    if (tit.stopcockState === 'closed') {
      tit.stopcockState = 'dropwise';
      if (btn) btn.innerHTML = '💧 Stopcock: <strong>DROPWISE</strong>';
      this.showToast('Burette stopcock opened to slow DROPWISE flow.', 'info');
    } else if (tit.stopcockState === 'dropwise') {
      tit.stopcockState = 'streaming';
      if (btn) btn.innerHTML = '🌊 Stopcock: <strong>STREAMING</strong>';
      this.showToast('Burette stopcock opened to FAST STREAM.', 'warning');
    } else {
      tit.stopcockState = 'closed';
      if (btn) btn.innerHTML = '⏹ Stopcock: <strong>CLOSED</strong>';
      this.showToast('Burette stopcock closed.', 'info');
    }

    if (window.soundEngine) window.soundEngine.playSwitchSound();
  }

  updateTitrationUI() {
    const btn = document.getElementById('btnStopcockToggle');
    const tit = window.simState.titration;
    if (btn) {
      btn.innerHTML = tit.stopcockState === 'closed'
        ? '⏹ Stopcock: <strong>CLOSED</strong>'
        : (tit.stopcockState === 'dropwise' ? '💧 Stopcock: <strong>DROPWISE</strong>' : '🌊 Stopcock: <strong>STREAMING</strong>');
    }
  }

  // =========================================================================
  // HUD & TELEMETRY UPDATES
  // =========================================================================
  updateHUD() {
    const state = window.simState;
    const currentPH = state.customPH;
    const pOH = Chemistry.getPOH(currentPH);
    const concH = Chemistry.getHConc(currentPH);
    const concOH = Chemistry.getOHConc(currentPH);

    // Update Telemetry Header Badges
    const badgePH = document.getElementById('hudBadgePH');
    if (badgePH) badgePH.textContent = `pH ${currentPH.toFixed(2)}`;

    const badgePOH = document.getElementById('hudBadgePOH');
    if (badgePOH) badgePOH.textContent = `pOH ${pOH.toFixed(2)}`;

    const badgeH = document.getElementById('hudBadgeHConc');
    if (badgeH) badgeH.textContent = `[H⁺] = ${Chemistry.formatExp(concH)} M`;

    const badgeOH = document.getElementById('hudBadgeOHConc');
    if (badgeOH) badgeOH.textContent = `[OH⁻] = ${Chemistry.formatExp(concOH)} M`;

    const badgeInd = document.getElementById('hudBadgeIndicator');
    if (badgeInd) {
      const ind = Chemistry.indicators[state.indicatorKey];
      badgeInd.textContent = ind ? ind.name : 'Indicator';
    }

    // Color Swatch Preview
    const indColor = Chemistry.getIndicatorColor(state.indicatorKey, currentPH);
    const swatch = document.getElementById('hudColorSwatch');
    if (swatch) {
      swatch.style.backgroundColor = indColor.hex;
    }
  }

  // =========================================================================
  // LAB OBSERVATION LOGGING & EXPORT
  // =========================================================================
  logCurrentObservation() {
    const state = window.simState;
    const sel = state.selectedVessel;
    const vessel = sel.type === 'tube' ? state.testTubes[sel.index] : state.spotWells[sel.index];
    const ph = state.getVesselPH(vessel);
    const ind = vessel.indicatorKey ? Chemistry.indicators[vessel.indicatorKey].name : 'None';
    const sub = Chemistry.substances[vessel.substanceKey];

    const note = vessel.indicatorKey
      ? `Added ${vessel.dropsAdded} drops of ${ind}. Observed color: ${vessel.colorHex}.`
      : 'Initial solution without indicator.';

    state.logObservation({
      sample: `${vessel.name} (${sub ? sub.name : 'Custom'})`,
      test: `Indicator Test (${state.mode})`,
      indicator: ind,
      pH: ph,
      observation: note
    });

    if (window.soundEngine) window.soundEngine.playEndpointChime();
    this.showToast(`Observation saved to Lab Notebook (#${state.labLogs.length})`, 'success');
  }

  renderLabReportTable() {
    const state = window.simState;
    const tbody = document.getElementById('reportTableBody');
    if (!tbody) return;

    if (state.labLogs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:20px;">No observations recorded yet. Perform tests and click "Log Observation"!</td></tr>`;
      return;
    }

    tbody.innerHTML = state.labLogs.map((log, idx) => `
      <tr>
        <td><strong>#${state.labLogs.length - idx}</strong></td>
        <td>${log.time}</td>
        <td><strong>${log.sample}</strong></td>
        <td>${log.indicator}</td>
        <td><span class="badge-ph">${log.pH}</span></td>
        <td>${log.observation}</td>
      </tr>
    `).join('');
  }

  exportCSV() {
    const state = window.simState;
    if (state.labLogs.length === 0) {
      this.showToast('Lab notebook is empty. Record observations first!', 'warning');
      return;
    }

    const headers = ['Record ID', 'Timestamp', 'Mode', 'Sample', 'Test', 'Indicator', 'pH', 'Observation'];
    const rows = state.labLogs.map(l => [
      l.id,
      `"${l.time}"`,
      `"${l.mode}"`,
      `"${l.sample}"`,
      `"${l.test}"`,
      `"${l.indicator}"`,
      l.pH,
      `"${l.observation.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AcidBaseLab_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast('CSV Lab Report exported successfully!', 'success');
  }

  // =========================================================================
  // MODALS & NOTIFICATIONS
  // =========================================================================
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
    state.rinseAllVessels();
    state.titration.titrantAdded = 0.0;
    state.titration.stopcockState = 'closed';
    state.titration.drops = [];
    state.titration.swirlBlooms = [];
    state.digitalProbe.readingPH = null;
    state.customPH = 7.0;
    state.substanceKey = 'water';
    state.indicatorKey = 'universal';

    const slider = document.getElementById('inputPHSlider');
    const num = document.getElementById('inputPHNumber');
    if (slider) slider.value = 7.0;
    if (num) num.value = '7.00';

    this.selectIndicator('universal');
    this.updateHUD();
    this.updateTitrationUI();
    if (window.soundEngine) window.soundEngine.playSwitchSound();
    this.showToast('Simulation reset to defaults.', 'info');
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

window.AcidBaseUI = AcidBaseUI;
