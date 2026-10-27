/**
 * UI Controller for Calorimetry Simulation
 */

import { sound } from './sound.js';
import { REACTION_SYSTEMS } from './calorimetry_data.js';

export class CalorimetryUI {
  constructor(engine, state) {
    this.engine = engine;
    this.state = state;

    this.cacheElements();
    this.bindEvents();
    this.renderInitial();
  }

  cacheElements() {
    this.systemSelect = document.getElementById('system-select');
    this.btnMix = document.getElementById('btn-mix');
    this.btnReset = document.getElementById('btn-reset');
    this.btnLogTrial = document.getElementById('btn-log-trial');
    this.btnMute = document.getElementById('btn-mute');

    // Telemetry readouts
    this.valTemp = document.getElementById('val-temp');
    this.valDeltaT = document.getElementById('val-delta-t');
    this.valHeat = document.getElementById('val-heat');
    this.valDeltaH = document.getElementById('val-delta-h');

    // Info
    this.systemInfoBox = document.getElementById('system-info-box');

    // Trials table
    this.trialTableBody = document.getElementById('trial-table-body');

    // Quests
    this.questList = document.getElementById('quest-list');
  }

  bindEvents() {
    this.systemSelect.addEventListener('change', (e) => {
      sound.playClick();
      this.engine.setSystem(e.target.value);
      this.updateSystemInfo();
      if (e.target.value === 'ch3cooh_naoh') {
        this.state.completeQuest('q4');
      }
    });

    this.btnMix.addEventListener('click', () => {
      sound.playPour();
      this.engine.triggerMix();
      this.state.completeQuest('q2');
    });

    this.btnLogTrial.addEventListener('click', () => {
      sound.playClick();
      const m = this.engine.getMetrics();
      this.state.logTrial(m.deltaTC, m.deltaHKJ);
    });

    this.btnReset.addEventListener('click', () => {
      sound.playClick();
      this.engine.reset();
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
    this.updateSystemInfo();
    this.updateQuests();
    this.updateTrialsTable();
  }

  updateSystemInfo() {
    const sys = REACTION_SYSTEMS[this.engine.systemId];
    this.systemInfoBox.innerHTML = `
      <div class="system-card">
        <h4>${sys.name}</h4>
        <p class="type-tag">${sys.type}</p>
        <p class="notes-tag">${sys.notes}</p>
        <div class="std-box">
          Standard ΔH° = <strong>${sys.standardDeltaH} kJ/mol</strong>
        </div>
      </div>
    `;
  }

  update(metrics) {
    this.valTemp.textContent = `${metrics.currentTempC} °C`;
    this.valDeltaT.textContent = `+${metrics.deltaTC} °C`;
    this.valHeat.textContent = `${metrics.heatJoules} J`;
    this.valDeltaH.textContent = `${metrics.deltaHKJ} kJ/mol`;
  }

  updateTrialsTable() {
    this.trialTableBody.innerHTML = '';
    this.state.trials.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${t.trialNumber}</td>
        <td>+${t.deltaT} °C</td>
        <td><strong>${t.deltaH} kJ/mol</strong></td>
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
