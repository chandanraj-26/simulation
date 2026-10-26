/**
 * OhmLab — UI Controller & DOM Bindings (js/ui.js)
 * Manages user interactions, sliders with logarithmic resistance mapping,
 * preset configurations, telemetry HUD readouts, modals, and toasts.
 *
 * Attaches to window.ohmUI.
 */

class OhmsLabUI {
  constructor() {
    this.dom = {};
    this.toastTimeout = null;

    this.cacheDOM();
    this.bindControls();
    this.bindPresets();
    this.bindModals();
    this.renderQuestList();
    this.syncControlsFromState();
  }

  cacheDOM() {
    // Header & Actions
    this.dom.btnAudioToggle = document.getElementById('btnAudioToggle');
    this.dom.btnResetAll = document.getElementById('btnResetAll');
    this.dom.btnOpenTheory = document.getElementById('btnOpenTheory');
    this.dom.btnOpenQuests = document.getElementById('btnOpenQuests');

    // Canvas Tabs & Controls
    this.dom.tabCircuit = document.getElementById('tabCircuit');
    this.dom.tabDrift = document.getElementById('tabDrift');
    this.dom.tabGraph = document.getElementById('tabGraph');
    this.dom.btnPlayPause = document.getElementById('btnPlayPause');
    this.dom.presetChips = document.querySelectorAll('.preset-chip');

    // Canvas Header HUD Badges
    this.dom.hudBadgeV = document.getElementById('hudBadgeV');
    this.dom.hudBadgeI = document.getElementById('hudBadgeI');
    this.dom.hudBadgeR = document.getElementById('hudBadgeR');

    // Telemetry Cards
    this.dom.telemetryV = document.getElementById('telemetryV');
    this.dom.telemetryI = document.getElementById('telemetryI');
    this.dom.telemetryISub = document.getElementById('telemetryISub');
    this.dom.telemetryR = document.getElementById('telemetryR');
    this.dom.telemetryRSub = document.getElementById('telemetryRSub');
    this.dom.telemetryP = document.getElementById('telemetryP');
    this.dom.telemetryVd = document.getElementById('telemetryVd');
    this.dom.telemetryT = document.getElementById('telemetryT');
    this.dom.telemetryTSub = document.getElementById('telemetryTSub');

    // Sidebar Parameter Sliders
    this.dom.sliderVoltage = document.getElementById('sliderVoltage');
    this.dom.valVoltage = document.getElementById('valVoltage');
    this.dom.sliderResistance = document.getElementById('sliderResistance');
    this.dom.valResistance = document.getElementById('valResistance');
    this.dom.resistorBands = document.getElementById('resistorBands');
    this.dom.resistorColorCodeText = document.getElementById('resistorColorCodeText');

    // Switch
    this.dom.btnSwitchToggle = document.getElementById('btnSwitchToggle');
    this.dom.switchIndicatorDot = document.getElementById('switchIndicatorDot');
    this.dom.switchStatusText = document.getElementById('switchStatusText');

    // Direction & Topologies
    this.dom.segFlowDirection = document.getElementById('segFlowDirection');
    this.dom.segAmmeterMode = document.getElementById('segAmmeterMode');
    this.dom.segVoltmeterMode = document.getElementById('segVoltmeterMode');

    // Checkboxes
    this.dom.chkHeatGlow = document.getElementById('chkHeatGlow');
    this.dom.chkCurrentLabels = document.getElementById('chkCurrentLabels');

    // V-I Experiment
    this.dom.btnRecordPoint = document.getElementById('btnRecordPoint');
    this.dom.btnToggleRegression = document.getElementById('btnToggleRegression');
    this.dom.btnClearPoints = document.getElementById('btnClearPoints');
    this.dom.lblPointsCount = document.getElementById('lblPointsCount');
    this.dom.lblExpR = document.getElementById('lblExpR');
    this.dom.lblNominalR = document.getElementById('lblNominalR');
    this.dom.lblR2 = document.getElementById('lblR2');

    // Modals
    this.dom.modalTheory = document.getElementById('modalTheory');
    this.dom.btnCloseTheory = document.getElementById('btnCloseTheory');
    this.dom.modalQuests = document.getElementById('modalQuests');
    this.dom.btnCloseQuests = document.getElementById('btnCloseQuests');
    this.dom.questListContainer = document.getElementById('questListContainer');

    // Toast
    this.dom.appToast = document.getElementById('appToast');
  }

  bindControls() {
    const state = window.simState;

    // 1. Voltage Slider (Linear 0–24 V)
    if (this.dom.sliderVoltage) {
      this.dom.sliderVoltage.addEventListener('input', (e) => {
        state.voltage = parseFloat(e.target.value);
        this.dom.valVoltage.textContent = `${state.voltage.toFixed(2)} V`;
        this.clearActivePresetChip();
      });
    }

    // 2. Resistance Slider (Log Scale: 0 to 300 => 1Ω to 1000Ω)
    if (this.dom.sliderResistance) {
      this.dom.sliderResistance.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        // Map 0 -> 10^0 = 1, 100 -> 10^1 = 10, 200 -> 10^2 = 100, 300 -> 10^3 = 1000
        const calculatedR = Math.pow(10, val / 100);
        state.resistance = calculatedR;
        this.updateResistorDisplay(calculatedR);
        this.clearActivePresetChip();
      });
    }

    // 3. Circuit Knife Switch Toggle
    if (this.dom.btnSwitchToggle) {
      this.dom.btnSwitchToggle.addEventListener('click', () => {
        state.switchClosed = !state.switchClosed;
        this.updateSwitchUI(state.switchClosed);
      });
    }

    // 4. Charge Flow Direction Segmented Control
    if (this.dom.segFlowDirection) {
      const btns = this.dom.segFlowDirection.querySelectorAll('.seg-btn');
      btns.forEach((btn) => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.flowDirection = btn.dataset.flow;
          this.showToast(`Flow Mode: ${state.flowDirection === 'conventional' ? 'Conventional (+ to −)' : 'Electron Flow (− to +)'}`, 'info');
        });
      });
    }

    // 5. Ammeter Topology Segmented Control
    if (this.dom.segAmmeterMode) {
      const btns = this.dom.segAmmeterMode.querySelectorAll('.seg-btn');
      btns.forEach((btn) => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.ammeterMode = btn.dataset.mode;
          if (state.ammeterMode === 'parallel') {
            this.showToast('⚠️ HAZARD: Ammeter placed in parallel! Direct short circuit.', 'warning');
          } else {
            this.showToast('Ammeter wired in Series (Correct).', 'info');
          }
          this.clearActivePresetChip();
        });
      });
    }

    // 6. Voltmeter Topology Segmented Control
    if (this.dom.segVoltmeterMode) {
      const btns = this.dom.segVoltmeterMode.querySelectorAll('.seg-btn');
      btns.forEach((btn) => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.voltmeterMode = btn.dataset.mode;
          if (state.voltmeterMode === 'series') {
            this.showToast('⚠️ HAZARD: Voltmeter placed in series! Open loop impedance.', 'warning');
          } else {
            this.showToast('Voltmeter wired in Parallel (Correct).', 'info');
          }
          this.clearActivePresetChip();
        });
      });
    }

    // 7. Visual Display Checkboxes
    if (this.dom.chkHeatGlow) {
      this.dom.chkHeatGlow.addEventListener('change', (e) => {
        state.showHeatGlow = e.target.checked;
      });
    }
    if (this.dom.chkCurrentLabels) {
      this.dom.chkCurrentLabels.addEventListener('change', (e) => {
        state.showCurrentLabels = e.target.checked;
      });
    }

    // 8. View Tabs (Circuit / Electron Drift / V-I Graph)
    const viewTabs = [
      { btn: this.dom.tabCircuit, view: 'circuit' },
      { btn: this.dom.tabDrift, view: 'drift' },
      { btn: this.dom.tabGraph, view: 'graph' }
    ];

    viewTabs.forEach(({ btn, view }) => {
      if (btn) {
        btn.addEventListener('click', () => {
          viewTabs.forEach(t => {
            if (t.btn) {
              t.btn.classList.remove('active');
              t.btn.setAttribute('aria-selected', 'false');
            }
          });
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
          if (window.ohmRenderer) {
            window.ohmRenderer.setActiveView(view);
          }
        });
      }
    });

    // 9. Play / Pause Button
    if (this.dom.btnPlayPause) {
      this.dom.btnPlayPause.addEventListener('click', () => {
        state.isPaused = !state.isPaused;
        this.dom.btnPlayPause.innerHTML = state.isPaused ? '<span>▶️</span> Resume' : '<span>⏸️</span> Pause';
        this.dom.btnPlayPause.classList.toggle('paused', state.isPaused);
        this.showToast(state.isPaused ? 'Simulation paused.' : 'Simulation running.', 'info');
      });
    }

    // 10. V-I Characteristic Data Buttons
    if (this.dom.btnRecordPoint) {
      this.dom.btnRecordPoint.addEventListener('click', () => {
        state.recordDataPoint();
        this.updateDataSummary();
      });
    }

    if (this.dom.btnToggleRegression) {
      this.dom.btnToggleRegression.addEventListener('click', () => {
        if (!state.graphDataPoints || state.graphDataPoints.length < 2) {
          this.showToast('Log at least 2 points before fitting a line.', 'warning');
          return;
        }
        state.showRegressionLine = !state.showRegressionLine;
        this.dom.btnToggleRegression.classList.toggle('active', state.showRegressionLine);
        this.updateDataSummary();
        this.showToast(state.showRegressionLine ? 'Linear regression best-fit displayed.' : 'Regression line hidden.', 'info');
      });
    }

    if (this.dom.btnClearPoints) {
      this.dom.btnClearPoints.addEventListener('click', () => {
        state.clearDataPoints();
        this.updateDataSummary();
        this.showToast('V-I data points cleared.', 'info');
      });
    }

    // 11. Audio Mute Toggle
    if (this.dom.btnAudioToggle) {
      this.dom.btnAudioToggle.addEventListener('click', () => {
        if (window.soundEngine) {
          const isEnabled = window.soundEngine.toggle();
          this.dom.btnAudioToggle.textContent = isEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
          this.dom.btnAudioToggle.classList.toggle('active', isEnabled);
          this.showToast(isEnabled ? 'Sound synthesizer enabled.' : 'Audio muted.', 'info');
        }
      });
    }

    // 12. Reset All Button
    if (this.dom.btnResetAll) {
      this.dom.btnResetAll.addEventListener('click', () => {
        state.resetAll();
        this.syncControlsFromState();
        this.updateDataSummary();
        this.showToast('Laboratory reset to initial defaults.', 'info');
      });
    }
  }

  // =========================================================================
  // PRESET CONFIGURATIONS
  // =========================================================================

  bindPresets() {
    const state = window.simState;
    if (!this.dom.presetChips) return;

    this.dom.presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const preset = chip.dataset.preset;
        this.dom.presetChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        switch (preset) {
          case 'safe':
            state.voltage = 6.0;
            state.resistance = 100.0;
            state.switchClosed = true;
            state.ammeterMode = 'series';
            state.voltmeterMode = 'parallel';
            break;
          case 'high-current':
            state.voltage = 12.0;
            state.resistance = 10.0;
            state.switchClosed = true;
            state.ammeterMode = 'series';
            state.voltmeterMode = 'parallel';
            break;
          case 'high-resist':
            state.voltage = 6.0;
            state.resistance = 1000.0;
            state.switchClosed = true;
            state.ammeterMode = 'series';
            state.voltmeterMode = 'parallel';
            break;
          case 'max-power':
            state.voltage = 24.0;
            state.resistance = 10.0;
            state.switchClosed = true;
            state.ammeterMode = 'series';
            state.voltmeterMode = 'parallel';
            break;
          case 'short-circuit':
            state.voltage = 12.0;
            state.switchClosed = true;
            state.ammeterMode = 'parallel'; // Fault!
            state.voltmeterMode = 'parallel';
            break;
          case 'open-loop':
            state.voltage = 12.0;
            state.switchClosed = true;
            state.ammeterMode = 'series';
            state.voltmeterMode = 'series'; // Fault!
            break;
        }

        this.syncControlsFromState();
        this.showToast(`Applied preset: "${chip.textContent}"`, 'info');
      });
    });
  }

  clearActivePresetChip() {
    if (this.dom.presetChips) {
      this.dom.presetChips.forEach(c => c.classList.remove('active'));
    }
  }

  // =========================================================================
  // MODALS (THEORY & QUESTS)
  // =========================================================================

  bindModals() {
    // Theory Modal
    if (this.dom.btnOpenTheory && this.dom.modalTheory) {
      this.dom.btnOpenTheory.addEventListener('click', () => {
        this.dom.modalTheory.classList.add('open');
      });
    }
    if (this.dom.btnCloseTheory && this.dom.modalTheory) {
      this.dom.btnCloseTheory.addEventListener('click', () => {
        this.dom.modalTheory.classList.remove('open');
      });
    }

    // Quests Modal
    if (this.dom.btnOpenQuests && this.dom.modalQuests) {
      this.dom.btnOpenQuests.addEventListener('click', () => {
        this.renderQuestList();
        this.dom.modalQuests.classList.add('open');
      });
    }
    if (this.dom.btnCloseQuests && this.dom.modalQuests) {
      this.dom.btnCloseQuests.addEventListener('click', () => {
        this.dom.modalQuests.classList.remove('open');
      });
    }

    // Close on backdrop click
    [this.dom.modalTheory, this.dom.modalQuests].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.classList.remove('open');
          }
        });
      }
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.dom.modalTheory) this.dom.modalTheory.classList.remove('open');
        if (this.dom.modalQuests) this.dom.modalQuests.classList.remove('open');
      }
    });
  }

  renderQuestList() {
    if (!this.dom.questListContainer || !window.simState) return;
    const quests = window.simState.quests;

    let html = '';
    quests.forEach(q => {
      const starStr = '★'.repeat(q.stars) + '☆'.repeat(5 - q.stars);
      html += `
        <div class="quest-card ${q.completed ? 'completed' : ''}">
          <div class="quest-info">
            <div class="quest-title-row">
              <span class="quest-title">${q.completed ? '✅ ' : '⏳ '}${q.title}</span>
              <span class="quest-stars">${starStr}</span>
            </div>
            <div class="quest-desc">${q.desc}</div>
          </div>
          <span class="quest-status-badge">${q.completed ? 'COMPLETED' : 'INCOMPLETE'}</span>
        </div>
      `;
    });

    this.dom.questListContainer.innerHTML = html;
  }

  // =========================================================================
  // TELEMETRY & LIVE READOUTS
  // =========================================================================

  updateTelemetry() {
    const state = window.simState;
    if (!state) return;

    // 1. Supply Voltage
    if (this.dom.telemetryV) {
      this.dom.telemetryV.textContent = `${state.voltage.toFixed(2)} V`;
    }

    // 2. Current
    if (this.dom.telemetryI) {
      if (!state.switchClosed) {
        this.dom.telemetryI.textContent = '0.0 mA';
        if (this.dom.telemetryISub) this.dom.telemetryISub.textContent = 'Switch open (I = 0)';
      } else if (state.current >= 1.0) {
        this.dom.telemetryI.textContent = `${state.current.toFixed(3)} A`;
        if (this.dom.telemetryISub) this.dom.telemetryISub.textContent = `${(state.current * 1000).toFixed(0)} mA in loop`;
      } else {
        this.dom.telemetryI.textContent = `${(state.current * 1000).toFixed(1)} mA`;
        if (this.dom.telemetryISub) this.dom.telemetryISub.textContent = `${state.current.toFixed(4)} A in loop`;
      }
    }

    // 3. Effective Resistance
    if (this.dom.telemetryR) {
      this.dom.telemetryR.textContent = `${state.effectiveResistance.toFixed(1)} Ω`;
      if (this.dom.telemetryRSub) {
        const delta = state.effectiveResistance - state.resistance;
        this.dom.telemetryRSub.textContent = delta > 0.05 ? `+${delta.toFixed(1)} Ω Joule shift` : `R₀ at 25.0 °C`;
      }
    }

    // 4. Power
    if (this.dom.telemetryP) {
      if (state.power >= 1.0) {
        this.dom.telemetryP.textContent = `${state.power.toFixed(2)} W`;
      } else {
        this.dom.telemetryP.textContent = `${(state.power * 1000).toFixed(1)} mW`;
      }
    }

    // 5. Electron Drift Velocity
    if (this.dom.telemetryVd) {
      const vdMicro = state.driftVelocity * 1e6; // μm/s
      if (vdMicro >= 1000) {
        this.dom.telemetryVd.textContent = `${(vdMicro / 1000).toFixed(2)} mm/s`;
      } else {
        this.dom.telemetryVd.textContent = `${vdMicro.toFixed(2)} μm/s`;
      }
    }

    // 6. Temperature
    if (this.dom.telemetryT) {
      this.dom.telemetryT.textContent = `${state.temperature.toFixed(1)} °C`;
      if (this.dom.telemetryTSub) {
        this.dom.telemetryTSub.textContent = state.temperature > 50 ? `Warning: Resistor Hot!` : `Ambient room temp`;
      }
    }

    // Header Status HUD Badges
    if (this.dom.hudBadgeV) {
      this.dom.hudBadgeV.textContent = `V = ${state.voltage.toFixed(2)} V`;
    }
    if (this.dom.hudBadgeI) {
      const iText = state.current >= 1.0 ? `${state.current.toFixed(2)} A` : `${(state.current * 1000).toFixed(1)} mA`;
      this.dom.hudBadgeI.textContent = `I = ${iText}`;
    }
    if (this.dom.hudBadgeR) {
      this.dom.hudBadgeR.textContent = `R = ${state.effectiveResistance.toFixed(1)} Ω`;
    }
  }

  updateDataSummary() {
    const state = window.simState;
    if (!state) return;

    const count = state.graphDataPoints ? state.graphDataPoints.length : 0;
    if (this.dom.lblPointsCount) {
      this.dom.lblPointsCount.textContent = `${count} / 25`;
    }
    if (this.dom.lblNominalR) {
      this.dom.lblNominalR.textContent = `${state.resistance.toFixed(1)} Ω`;
    }

    if (count >= 2 && window.OhmsLawPhysics) {
      const reg = window.OhmsLawPhysics.linearRegression(state.graphDataPoints);
      if (reg) {
        if (this.dom.lblExpR) this.dom.lblExpR.textContent = `${reg.slope.toFixed(2)} Ω`;
        if (this.dom.lblR2) this.dom.lblR2.textContent = `${reg.r2.toFixed(4)}`;
      }
    } else {
      if (this.dom.lblExpR) this.dom.lblExpR.textContent = '--';
      if (this.dom.lblR2) this.dom.lblR2.textContent = '--';
    }
  }

  // =========================================================================
  // SYNC CONTROLS FROM STATE (AFTER PRESETS OR RESET)
  // =========================================================================

  syncControlsFromState() {
    const state = window.simState;
    if (!state) return;

    // Voltage Slider
    if (this.dom.sliderVoltage) {
      this.dom.sliderVoltage.value = state.voltage;
    }
    if (this.dom.valVoltage) {
      this.dom.valVoltage.textContent = `${state.voltage.toFixed(2)} V`;
    }

    // Resistance Slider (invert log mapping: sliderVal = 100 * log10(R))
    if (this.dom.sliderResistance) {
      const sliderVal = Math.round(100 * Math.log10(state.resistance));
      this.dom.sliderResistance.value = Math.max(0, Math.min(300, sliderVal));
    }
    this.updateResistorDisplay(state.resistance);

    // Switch UI
    this.updateSwitchUI(state.switchClosed);

    // Flow Direction
    if (this.dom.segFlowDirection) {
      const btns = this.dom.segFlowDirection.querySelectorAll('.seg-btn');
      btns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.flow === state.flowDirection);
      });
    }

    // Ammeter Mode
    if (this.dom.segAmmeterMode) {
      const btns = this.dom.segAmmeterMode.querySelectorAll('.seg-btn');
      btns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === state.ammeterMode);
      });
    }

    // Voltmeter Mode
    if (this.dom.segVoltmeterMode) {
      const btns = this.dom.segVoltmeterMode.querySelectorAll('.seg-btn');
      btns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === state.voltmeterMode);
      });
    }

    // Checkboxes
    if (this.dom.chkHeatGlow) this.dom.chkHeatGlow.checked = state.showHeatGlow;
    if (this.dom.chkCurrentLabels) this.dom.chkCurrentLabels.checked = state.showCurrentLabels;

    this.updateDataSummary();
  }

  updateSwitchUI(isClosed) {
    if (!this.dom.btnSwitchToggle) return;
    this.dom.btnSwitchToggle.classList.toggle('closed', isClosed);
    if (this.dom.switchStatusText) {
      this.dom.switchStatusText.textContent = isClosed ? 'Switch: CLOSED (Click to Open)' : 'Switch: OPEN (Click to Close)';
    }
  }

  updateResistorDisplay(R) {
    if (this.dom.valResistance) {
      this.dom.valResistance.textContent = `${R.toFixed(1)} Ω`;
    }

    // Update color code stripes & description
    const digitColors = [
      { name: 'Black', hex: '#0F172A' },
      { name: 'Brown', hex: '#854D0E' },
      { name: 'Red', hex: '#DC2626' },
      { name: 'Orange', hex: '#EA580C' },
      { name: 'Yellow', hex: '#EAB308' },
      { name: 'Green', hex: '#16A34A' },
      { name: 'Blue', hex: '#2563EB' },
      { name: 'Violet', hex: '#7C3AED' },
      { name: 'Grey', hex: '#64748B' },
      { name: 'White', hex: '#F8FAFC' }
    ];

    const rVal = Math.round(R);
    const s = rVal.toString();
    const d1 = parseInt(s[0], 10) || 1;
    const d2 = s.length > 1 ? parseInt(s[1], 10) : 0;
    const multiplier = Math.max(0, s.length - 2);

    const c1 = digitColors[d1] || digitColors[1];
    const c2 = digitColors[d2] || digitColors[0];
    const c3 = digitColors[multiplier] || digitColors[1];

    if (this.dom.resistorBands) {
      this.dom.resistorBands.innerHTML = `
        <span class="resistor-band" style="background:${c1.hex};"></span>
        <span class="resistor-band" style="background:${c2.hex};"></span>
        <span class="resistor-band" style="background:${c3.hex};"></span>
        <span class="resistor-band" style="background:#D97706;"></span>
      `;
    }

    if (this.dom.resistorColorCodeText) {
      this.dom.resistorColorCodeText.textContent = `${c1.name} • ${c2.name} • ${c3.name} • Gold (${R.toFixed(0)} Ω ±5%)`;
    }
  }

  showToast(message, type = 'info') {
    if (!this.dom.appToast) return;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.dom.appToast.className = `app-toast ${type} show`;
    this.dom.appToast.textContent = message;

    this.toastTimeout = setTimeout(() => {
      this.dom.appToast.classList.remove('show');
    }, 3000);
  }
}

window.OhmsLabUI = OhmsLabUI;
