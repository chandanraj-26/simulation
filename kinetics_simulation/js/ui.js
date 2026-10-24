/**
 * Reaction Kinetics — UI Controller
 * Manages DOM slider inputs, reaction run/pause/reset lifecycle,
 * trial table updates, plot mode switches, CSV export, and modals.
 */

class KineticsUI {
  constructor(state, engine) {
    this.state = state;
    this.engine = engine;

    this.cacheElements();
    this.bindEvents();
    this.updateTelemetry();
    this.renderQuestsList();
  }

  cacheElements() {
    // Reaction sliders
    this.sliderTemp = document.getElementById('sliderTemp');
    this.valTemp = document.getElementById('valTemp');
    this.sliderConc = document.getElementById('sliderConc');
    this.valConc = document.getElementById('valConc');
    this.sliderHCl = document.getElementById('sliderHCl');
    this.valHCl = document.getElementById('valHCl');

    // Run buttons
    this.btnStart = document.getElementById('btnStart');
    this.btnPause = document.getElementById('btnPause');
    this.btnReset = document.getElementById('btnReset');
    this.btnStirrer = document.getElementById('btnStirrer');

    // Speed selector & Plot mode tabs
    this.selectSpeed = document.getElementById('selectSpeed');
    this.btnPlotRateConc = document.getElementById('btnPlotRateConc');
    this.btnPlotArrhenius = document.getElementById('btnPlotArrhenius');

    // Presets
    this.btnPresetConc = document.getElementById('btnPresetConc');
    this.btnPresetTemp = document.getElementById('btnPresetTemp');
    this.btnPresetChilled = document.getElementById('btnPresetChilled');

    // Telemetry Cards
    this.telTime = document.getElementById('telTime');
    this.telRate = document.getElementById('telRate');
    this.telTransmittance = document.getElementById('telTransmittance');
    this.telEa = document.getElementById('telEa');

    // Trial Data Table & Actions
    this.tableBody = document.getElementById('trialTableBody');
    this.btnClearTrials = document.getElementById('btnClearTrials');
    this.btnExportCSV = document.getElementById('btnExportCSV');

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
      if (window.kineticsSound) window.kineticsSound.resume();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    // 1. Temperature Slider
    if (this.sliderTemp) {
      this.sliderTemp.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.state.setTemperature(val);
        if (this.valTemp) this.valTemp.textContent = `${val.toFixed(1)} °C`;
      });
    }

    // 2. Thiosulfate Concentration Slider
    if (this.sliderConc) {
      this.sliderConc.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.state.setThiosulfateConc(val);
        if (this.valConc) this.valConc.textContent = `${val.toFixed(2)} M`;
      });
    }

    // 3. HCl Concentration Slider
    if (this.sliderHCl) {
      this.sliderHCl.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.state.setHClConc(val);
        if (this.valHCl) this.valHCl.textContent = `${val.toFixed(2)} M`;
      });
    }

    // 4. Start Reaction
    if (this.btnStart) {
      this.btnStart.addEventListener('click', () => {
        if (this.state.status === 'running') return;
        this.state.startReaction();
        if (window.kineticsSound) {
          window.kineticsSound.playPourSound();
          window.kineticsSound.playStopwatchBeep();
          if (this.state.isStirring) window.kineticsSound.startStirrerHum();
        }
      });
    }

    // 5. Pause Reaction
    if (this.btnPause) {
      this.btnPause.addEventListener('click', () => {
        this.state.pauseReaction();
        if (window.kineticsSound) {
          window.kineticsSound.playStopwatchBeep();
          window.kineticsSound.stopStirrerHum();
        }
      });
    }

    // 6. Reset Reaction
    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => {
        this.state.resetReaction();
        this.engine.reset();
        if (window.kineticsSound) {
          window.kineticsSound.playStopwatchBeep();
          window.kineticsSound.stopStirrerHum();
        }
      });
    }

    // 7. Stirrer Toggle
    if (this.btnStirrer) {
      this.btnStirrer.addEventListener('click', () => {
        const active = this.state.toggleStirrer();
        this.btnStirrer.classList.toggle('active', active);
        this.btnStirrer.innerHTML = active ? '🌀 Stirrer: ON' : '⚪ Stirrer: OFF';
        if (window.kineticsSound) {
          if (active && this.state.status === 'running') window.kineticsSound.startStirrerHum();
          else window.kineticsSound.stopStirrerHum();
        }
      });
    }

    // 8. Simulation Speed Selector
    if (this.selectSpeed) {
      this.selectSpeed.addEventListener('change', (e) => {
        this.state.setSimSpeed(parseFloat(e.target.value));
      });
    }

    // 9. Graph Mode Switches
    if (this.btnPlotRateConc) {
      this.btnPlotRateConc.addEventListener('click', () => {
        this.state.setPlotMode('rate_vs_conc');
        this.btnPlotRateConc.classList.add('active');
        if (this.btnPlotArrhenius) this.btnPlotArrhenius.classList.remove('active');
      });
    }
    if (this.btnPlotArrhenius) {
      this.btnPlotArrhenius.addEventListener('click', () => {
        this.state.setPlotMode('arrhenius');
        this.btnPlotArrhenius.classList.add('active');
        if (this.btnPlotRateConc) this.btnPlotRateConc.classList.remove('active');
      });
    }

    // 10. Presets
    if (this.btnPresetConc) {
      this.btnPresetConc.addEventListener('click', () => this.applyPresetValues('conc-series'));
    }
    if (this.btnPresetTemp) {
      this.btnPresetTemp.addEventListener('click', () => this.applyPresetValues('temp-series'));
    }
    if (this.btnPresetChilled) {
      this.btnPresetChilled.addEventListener('click', () => this.applyPresetValues('cold-reaction'));
    }

    // 11. Clear Trials
    if (this.btnClearTrials) {
      this.btnClearTrials.addEventListener('click', () => {
        this.state.clearTrials();
        this.renderTrialsTable();
      });
    }

    // 12. Export CSV
    if (this.btnExportCSV) {
      this.btnExportCSV.addEventListener('click', () => this.exportCSV());
    }

    // 13. Header Modals
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

    // 14. Audio Toggle
    if (this.btnAudioToggle) {
      this.btnAudioToggle.addEventListener('click', () => {
        const enabled = this.state.toggleSound();
        this.btnAudioToggle.innerHTML = enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
        this.btnAudioToggle.classList.toggle('active', enabled);
        if (!enabled && window.kineticsSound) {
          window.kineticsSound.stopStirrerHum();
        }
      });
    }

    // State notifications
    this.state.subscribe((event, payload) => {
      this.updateTelemetry();
      if (event === 'trial_recorded') {
        this.renderTrialsTable();
      }
      if (event === 'quest_completed') {
        this.renderQuestsList();
        if (window.kineticsSound) window.kineticsSound.playQuestChime();
      }
    });
  }

  applyPresetValues(presetId) {
    this.state.applyPreset(presetId);
    this.engine.reset();
    if (this.sliderTemp) this.sliderTemp.value = this.state.temperatureC;
    if (this.valTemp) this.valTemp.textContent = `${this.state.temperatureC.toFixed(1)} °C`;
    if (this.sliderConc) this.sliderConc.value = this.state.thiosulfateConc;
    if (this.valConc) this.valConc.textContent = `${this.state.thiosulfateConc.toFixed(2)} M`;
    if (this.sliderHCl) this.sliderHCl.value = this.state.hclConc;
    if (this.valHCl) this.valHCl.textContent = `${this.state.hclConc.toFixed(2)} M`;
  }

  updateTelemetry() {
    // 1. Elapsed Time
    if (this.telTime) {
      this.telTime.textContent = `${this.state.elapsedSeconds.toFixed(2)} s`;
    }

    // 2. Transmittance %
    if (this.telTransmittance) {
      this.telTransmittance.textContent = `${this.state.transmittancePct.toFixed(1)} %`;
    }

    // 3. Rate 1/t
    if (this.telRate) {
      if (this.state.elapsedSeconds > 0) {
        const rate = (1 / this.state.elapsedSeconds).toFixed(4);
        this.telRate.textContent = `${rate} s⁻¹`;
      } else {
        this.telRate.textContent = '—';
      }
    }

    // 4. Calculate Activation Energy from Trials (if >= 2 distinct temperatures)
    if (this.telEa) {
      const calcEa = this.calculateActivationEnergy();
      if (calcEa !== null) {
        this.telEa.textContent = `${calcEa.toFixed(1)} kJ/mol`;
      } else {
        this.telEa.textContent = 'Need 2+ Temps';
      }
    }

    // 5. Update quest badge counter
    const completedCount = this.state.quests.filter(q => q.completed).length;
    if (this.questBadgeCount) {
      this.questBadgeCount.textContent = `${completedCount}/${this.state.quests.length}`;
    }
  }

  calculateActivationEnergy() {
    const trials = this.state.trials.filter(t => t.lnRate !== null);
    if (trials.length < 2) return null;

    // Check if temperatures differ
    const temps = trials.map(t => t.tempC);
    if (Math.max(...temps) - Math.min(...temps) < 3.0) return null;

    // Linear regression: y = slope * x + intercept
    // y = ln(rate), x = 1/T (in 1/K)
    // slope = -Ea / R => Ea = -slope * R
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const n = trials.length;

    trials.forEach(t => {
      const x = t.reciprocalTempK;
      const y = t.lnRate;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const R = window.KINETICS_DATA.R_GAS_CONSTANT; // 8.314 J/(mol*K)
    const EaJoules = -slope * R;

    return Math.max(10, Math.min(120, EaJoules / 1000)); // in kJ/mol
  }

  renderTrialsTable() {
    if (!this.tableBody) return;
    this.tableBody.innerHTML = '';

    if (this.state.trials.length === 0) {
      this.tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94A3B8;">No trials recorded yet.</td></tr>`;
      return;
    }

    this.state.trials.forEach(t => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>T${t.trialNum}</strong></td>
        <td>${t.tempC}°C</td>
        <td>${t.concM} M</td>
        <td>${t.timeS} s</td>
        <td>${t.rate.toFixed(4)} s⁻¹</td>
      `;
      this.tableBody.appendChild(row);
    });
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

  exportCSV() {
    if (this.state.trials.length === 0) {
      alert('No trial data to export. Run a reaction trial first.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Trial,Temp_C,Temp_K,Na2S2O3_M,HCl_M,Time_Seconds,Rate_s_inv,ln_Rate\n';

    this.state.trials.forEach(t => {
      csvContent += `${t.trialNum},${t.tempC},${t.tempK},${t.concM},${t.hclM},${t.timeS},${t.rate},${t.lnRate}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'reaction_kinetics_trials.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

window.KineticsUI = KineticsUI;
