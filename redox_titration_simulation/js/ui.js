/**
 * UI Controller for Redox Titration Simulator
 */

import { sound } from './sound.js';
import { ANALYTES, TITRANT } from './redox_data.js';

export class RedoxUI {
  constructor(engine, state) {
    this.engine = engine;
    this.state = state;

    this.cacheElements();
    this.bindEvents();
    this.renderInitial();
  }

  cacheElements() {
    this.analyteSelect = document.getElementById('analyte-select');
    this.btnStopcock = document.getElementById('btn-stopcock');
    this.btnSingleDrop = document.getElementById('btn-single-drop');
    this.btnHeater = document.getElementById('btn-heater');
    this.btnLogTrial = document.getElementById('btn-log-trial');
    this.btnReset = document.getElementById('btn-reset');
    this.btnMute = document.getElementById('btn-mute');

    // Telemetry readouts
    this.valTitrantVolume = document.getElementById('val-titrant-volume');
    this.valEquivVolume = document.getElementById('val-equiv-volume');
    this.valPotential = document.getElementById('val-potential');
    this.valTemperature = document.getElementById('val-temperature');
    this.valStatusBadge = document.getElementById('val-status-badge');
    this.valCalcMolarity = document.getElementById('val-calc-molarity');

    // Chemistry Profile
    this.analyteInfoBox = document.getElementById('analyte-info-box');

    // Trials Table
    this.trialTableBody = document.getElementById('trial-table-body');

    // Quests
    this.questList = document.getElementById('quest-list');
  }

  bindEvents() {
    this.analyteSelect.addEventListener('change', (e) => {
      sound.playClick();
      this.engine.setAnalyte(e.target.value);
      this.state.setAnalyte(e.target.value);
      this.updateAnalyteInfo();
    });

    this.btnStopcock.addEventListener('click', () => {
      sound.playClick();
      this.engine.stopcockOpen = !this.engine.stopcockOpen;
      this.btnStopcock.textContent = this.engine.stopcockOpen ? 'Close Stopcock Valve' : 'Open Stopcock Valve';
      this.btnStopcock.classList.toggle('active', this.engine.stopcockOpen);
    });

    this.btnSingleDrop.addEventListener('click', () => {
      sound.playDrop();
      this.engine.addSingleDrop();
    });

    this.btnHeater.addEventListener('click', () => {
      sound.playClick();
      this.engine.isHeaterOn = !this.engine.isHeaterOn;
      this.btnHeater.textContent = this.engine.isHeaterOn ? '🔥 Hotplate: ON' : 'Hotplate: OFF';
      this.btnHeater.classList.toggle('active', this.engine.isHeaterOn);
      if (this.engine.isHeaterOn) {
        this.state.completeQuest('q3');
      }
    });

    this.btnLogTrial.addEventListener('click', () => {
      sound.playClick();
      const m = this.engine.getMetrics();
      this.state.logTrial(m.titrantVolumeMl, m.molarityDetermined);
    });

    this.btnReset.addEventListener('click', () => {
      sound.playClick();
      this.engine.reset();
      this.btnStopcock.textContent = 'Open Stopcock Valve';
      this.btnStopcock.classList.remove('active');
    });

    this.btnMute.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      this.btnMute.textContent = isMuted ? '🔇 Audio Muted' : '🔊 Audio Active';
    });

    this.state.subscribe(() => {
      this.updateQuests();
      this.updateTrialsTable();
    });
  }

  renderInitial() {
    this.updateAnalyteInfo();
    this.updateQuests();
    this.updateTrialsTable();
  }

  update(metrics) {
    this.valTitrantVolume.textContent = `${metrics.titrantVolumeMl.toFixed(2)} mL`;
    this.valEquivVolume.textContent = `${metrics.equivalenceVolumeMl.toFixed(2)} mL`;
    this.valPotential.textContent = `${metrics.cellPotentialVolts.toFixed(3)} V`;
    this.valTemperature.textContent = `${metrics.temperatureC.toFixed(1)} °C`;
    this.valCalcMolarity.textContent = metrics.molarityDetermined;

    // Appearance badge
    this.valStatusBadge.textContent = metrics.flaskAppearance.label;
    if (metrics.flaskAppearance.isAtOrPastEndpoint) {
      this.valStatusBadge.style.backgroundColor = metrics.flaskAppearance.colorHex;
      this.valStatusBadge.style.color = '#FFFFFF';
      this.state.completeQuest('q4');
    } else {
      this.valStatusBadge.style.backgroundColor = '#F1F5F9';
      this.valStatusBadge.style.color = '#334155';
    }

    // Auto-shut off stopcock if full
    if (metrics.titrantVolumeMl >= 50.0 && this.engine.stopcockOpen) {
      this.engine.stopcockOpen = false;
      this.btnStopcock.textContent = 'Open Stopcock Valve';
      this.btnStopcock.classList.remove('active');
    }
  }

  updateAnalyteInfo() {
    const analyte = ANALYTES[this.state.analyteId];
    this.analyteInfoBox.innerHTML = `
      <div class="analyte-card">
        <h4>${analyte.name}</h4>
        <p class="eq-tag">${analyte.equation}</p>
        <p class="notes-tag">${analyte.description}</p>
        <div class="calc-box">
          Standard Potential: <strong>E° = +${analyte.standardPotentialVolts} V</strong> • Stoichiometry: <strong>${analyte.stoichiometryRatio} : 1</strong>
        </div>
      </div>
    `;
  }

  updateTrialsTable() {
    this.trialTableBody.innerHTML = '';
    this.state.trials.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${t.trialNumber}</td>
        <td><strong>${t.titerMl} mL</strong></td>
        <td>${t.molarity} M</td>
        <td>${t.timestamp}</td>
      `;
      this.trialTableBody.appendChild(tr);
    });
  }

  updateQuests() {
    this.questList.innerHTML = '';
    this.state.quests.forEach(q => {
      const li = document.createElement('li');
      li.className = q.completed ? 'quest-done' : '';
      li.innerHTML = `
        <span class="quest-checkbox">${q.completed ? '✓' : '○'}</span>
        <span class="quest-text">${q.text}</span>
      `;
      this.questList.appendChild(li);
    });
  }
}
