/**
 * Kinetic Gas Laws — UI Controller
 * Manages slider inputs, bicycle air pump / vent valve buttons,
 * parameter lock toggles (Boyle, Charles, Gay-Lussac), plot mode tabs, and modals.
 */

class GasUI {
  constructor(state, engine) {
    this.state = state;
    this.engine = engine;

    this.cacheElements();
    this.bindEvents();
    this.updateTelemetry();
    this.renderQuestsList();
  }

  cacheElements() {
    // Sliders & Readouts
    this.sliderVol = document.getElementById('sliderVol');
    this.valVol = document.getElementById('valVol');
    this.sliderTemp = document.getElementById('sliderTemp');
    this.valTemp = document.getElementById('valTemp');
    this.sliderMoles = document.getElementById('sliderMoles');
    this.valMoles = document.getElementById('valMoles');

    // Pump & Vent Buttons
    this.btnPump = document.getElementById('btnPump');
    this.btnVent = document.getElementById('btnVent');

    // Species Pills
    this.speciesButtons = Array.from(document.querySelectorAll('.species-pill-btn'));

    // Parameter Lock Buttons
    this.lockButtons = Array.from(document.querySelectorAll('.lock-pill-btn'));

    // Plot Mode Buttons
    this.btnPlotPV = document.getElementById('btnPlotPV');
    this.btnPlotVT = document.getElementById('btnPlotVT');
    this.btnPlotPT = document.getElementById('btnPlotPT');
    this.btnPlotMaxwell = document.getElementById('btnPlotMaxwell');
    this.plotButtons = [this.btnPlotPV, this.btnPlotVT, this.btnPlotPT, this.btnPlotMaxwell].filter(Boolean);

    // Vector Toggle & Clear History
    this.btnToggleVectors = document.getElementById('btnToggleVectors');
    this.btnClearHistory = document.getElementById('btnClearHistory');

    // Presets
    this.btnPresetBoyle = document.getElementById('btnPresetBoyle');
    this.btnPresetCharles = document.getElementById('btnPresetCharles');
    this.btnPresetGayLussac = document.getElementById('btnPresetGayLussac');
    this.btnPresetAvogadro = document.getElementById('btnPresetAvogadro');

    // Telemetry Cards
    this.telPressure = document.getElementById('telPressure');
    this.telPressureKPa = document.getElementById('telPressureKPa');
    this.telVolume = document.getElementById('telVolume');
    this.telTemp = document.getElementById('telTemp');
    this.telSpeed = document.getElementById('telSpeed');

    // Header buttons & Modals
    this.btnOpenQuests = document.getElementById('btnOpenQuests');
    this.btnOpenTheory = document.getElementById('btnOpenTheory');
    this.btnAudioToggle = document.getElementById('btnAudioToggle');
    this.questBadgeCount = document.getElementById('questBadgeCount');

    this.modalQuests = document.getElementById('modalQuests');
    this.btnCloseQuests = document.getElementById('btnCloseQuests');
    this.questsContainer = document.getElementById('questsContainer');

    this.modalTheory = document.getElementById('modalTheory');
    this.btnCloseTheory = document.getElementById('btnCloseTheory');
  }

  bindEvents() {
    // Audio unlock on user touch/click
    const unlockAudio = () => {
      if (window.gasSound) window.gasSound.resume();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    // 1. Volume Slider
    if (this.sliderVol) {
      this.sliderVol.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.state.setVolume(val);
        if (window.gasSound) window.gasSound.playPistonSlide();
      });
    }

    // 2. Temperature Slider
    if (this.sliderTemp) {
      this.sliderTemp.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.state.setTemperature(val);
        this.engine.rescaleVelocities();
      });
    }

    // 3. Moles Slider
    if (this.sliderMoles) {
      this.sliderMoles.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.state.setMoles(val);
      });
    }

    // 4. Bicycle Air Pump
    if (this.btnPump) {
      this.btnPump.addEventListener('click', () => {
        this.state.injectGasMoles(0.25);
        if (window.gasSound) window.gasSound.playPumpStroke();
      });
    }

    // 5. Vent Valve
    if (this.btnVent) {
      this.btnVent.addEventListener('click', () => {
        this.state.ventGasMoles(0.25);
        if (window.gasSound) window.gasSound.playVentHiss();
      });
    }

    // 6. Species Selection Pills
    this.speciesButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.speciesButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const species = btn.getAttribute('data-species');
        this.state.setGasSpecies(species);
        this.engine.syncParticles();
        this.engine.rescaleVelocities();
        if (window.gasSound) window.gasSound.playPistonSlide();
      });
    });

    // 7. Parameter Lock Buttons
    this.lockButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.lockButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const lock = btn.getAttribute('data-lock');
        this.state.setLockParameter(lock);
        this.updateLockUIState();
        if (window.gasSound) window.gasSound.playPistonSlide();
      });
    });

    // 8. Plot Mode Tabs
    const plotModes = [
      { btn: this.btnPlotPV, mode: 'PV' },
      { btn: this.btnPlotVT, mode: 'VT' },
      { btn: this.btnPlotPT, mode: 'PT' },
      { btn: this.btnPlotMaxwell, mode: 'maxwell' }
    ];

    plotModes.forEach(({ btn, mode }) => {
      if (btn) {
        btn.addEventListener('click', () => {
          this.plotButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.state.setPlotMode(mode);
        });
      }
    });

    // 9. Velocity Vectors Toggle
    if (this.btnToggleVectors) {
      this.btnToggleVectors.addEventListener('click', () => {
        const active = this.state.toggleVectors();
        this.btnToggleVectors.classList.toggle('active', active);
        this.btnToggleVectors.innerHTML = active ? '🏹 Vectors: ON' : '🏹 Vectors: OFF';
      });
    }

    // 10. Clear Trajectory History
    if (this.btnClearHistory) {
      this.btnClearHistory.addEventListener('click', () => {
        this.state.clearHistory();
      });
    }

    // 11. Presets
    if (this.btnPresetBoyle) {
      this.btnPresetBoyle.addEventListener('click', () => this.applyPresetConfig('boyle'));
    }
    if (this.btnPresetCharles) {
      this.btnPresetCharles.addEventListener('click', () => this.applyPresetConfig('charles'));
    }
    if (this.btnPresetGayLussac) {
      this.btnPresetGayLussac.addEventListener('click', () => this.applyPresetConfig('gay-lussac'));
    }
    if (this.btnPresetAvogadro) {
      this.btnPresetAvogadro.addEventListener('click', () => this.applyPresetConfig('avogadro'));
    }

    // 12. Modals (Quests & Theory)
    if (this.btnOpenQuests && this.modalQuests) {
      this.btnOpenQuests.addEventListener('click', () => {
        this.renderQuestsList();
        this.modalQuests.classList.add('open');
      });
    }
    if (this.btnCloseQuests && this.modalQuests) {
      this.btnCloseQuests.addEventListener('click', () => {
        this.modalQuests.classList.remove('open');
      });
    }

    if (this.btnOpenTheory && this.modalTheory) {
      this.btnOpenTheory.addEventListener('click', () => {
        this.modalTheory.classList.add('open');
      });
    }
    if (this.btnCloseTheory && this.modalTheory) {
      this.btnCloseTheory.addEventListener('click', () => {
        this.modalTheory.classList.remove('open');
      });
    }

    // 13. Audio Toggle
    if (this.btnAudioToggle) {
      this.btnAudioToggle.addEventListener('click', () => {
        const enabled = this.state.toggleSound();
        this.btnAudioToggle.innerHTML = enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
        this.btnAudioToggle.classList.toggle('active', enabled);
      });
    }

    // State listeners
    this.state.subscribe((event, payload) => {
      this.updateTelemetry();
      if (event === 'quest_completed') {
        this.renderQuestsList();
        if (window.gasSound) window.gasSound.playQuestChime();
      }
    });
  }

  applyPresetConfig(presetId) {
    this.state.applyPreset(presetId);
    this.engine.syncParticles();
    this.engine.rescaleVelocities();

    // Sync lock buttons
    this.lockButtons.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-lock') === this.state.lockParam);
    });
    this.updateLockUIState();

    // Sync species buttons
    this.speciesButtons.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-species') === this.state.gasSpecies);
    });

    if (window.gasSound) window.gasSound.playPistonSlide();
  }

  updateLockUIState() {
    const lock = this.state.lockParam;
    if (this.sliderVol) this.sliderVol.disabled = (lock === 'volume');
    if (this.sliderTemp) this.sliderTemp.disabled = (lock === 'temp');
  }

  updateTelemetry() {
    // 1. Slider inputs and readouts
    if (this.sliderVol && document.activeElement !== this.sliderVol) {
      this.sliderVol.value = this.state.volumeL;
    }
    if (this.valVol) {
      this.valVol.textContent = `${this.state.volumeL.toFixed(1)} L`;
    }

    if (this.sliderTemp && document.activeElement !== this.sliderTemp) {
      this.sliderTemp.value = this.state.temperatureK;
    }
    if (this.valTemp) {
      const c = (this.state.temperatureK - 273.15).toFixed(1);
      this.valTemp.textContent = `${Math.round(this.state.temperatureK)} K (${c} °C)`;
    }

    if (this.sliderMoles && document.activeElement !== this.sliderMoles) {
      this.sliderMoles.value = this.state.moles;
    }
    if (this.valMoles) {
      this.valMoles.textContent = `${this.state.moles.toFixed(2)} mol`;
    }

    // 2. Telemetry Cards
    if (this.telPressure) {
      this.telPressure.textContent = `${this.state.pressureAtm.toFixed(2)} atm`;
    }
    if (this.telPressureKPa) {
      this.telPressureKPa.textContent = `${this.state.pressureKPa.toFixed(1)} kPa`;
    }
    if (this.telVolume) {
      this.telVolume.textContent = `${this.state.volumeL.toFixed(1)} L`;
    }
    if (this.telTemp) {
      this.telTemp.textContent = `${Math.round(this.state.temperatureK)} K`;
    }
    if (this.telSpeed) {
      this.telSpeed.textContent = `${Math.round(this.state.vRms)} m/s`;
    }

    // 3. Quest Badge
    const completedCount = this.state.quests.filter(q => q.completed).length;
    if (this.questBadgeCount) {
      this.questBadgeCount.textContent = `${completedCount}/${this.state.quests.length}`;
    }
  }

  renderQuestsList() {
    if (!this.questsContainer) return;
    this.questsContainer.innerHTML = '';

    this.state.quests.forEach(quest => {
      const item = document.createElement('div');
      item.className = `quest-item ${quest.completed ? 'completed' : ''}`;
      item.innerHTML = `
        <div class="quest-status-icon">${quest.completed ? '✅' : '⚪'}</div>
        <div>
          <div class="quest-title">${quest.title}</div>
          <div class="quest-desc">${quest.desc}</div>
        </div>
      `;
      this.questsContainer.appendChild(item);
    });
  }
}

window.GasUI = GasUI;
