/**
 * UI Controller for EDTA Titration
 */

import { sound } from './sound.js';
import { WATER_SAMPLES } from './edta_data.js';

export class EdtaUI {
  constructor(engine, state) {
    this.engine = engine;
    this.state = state;

    this.cacheElements();
    this.bindEvents();
    this.renderInitial();
  }

  cacheElements() {
    this.sampleSelect = document.getElementById('sample-select');
    this.btnStopcock = document.getElementById('btn-stopcock');
    this.btnSingleDrop = document.getElementById('btn-single-drop');
    this.btnLogTrial = document.getElementById('btn-log-trial');
    this.btnReset = document.getElementById('btn-reset');
    this.btnMute = document.getElementById('btn-mute');

    // Telemetry readouts
    this.valTitrantVolume = document.getElementById('val-titrant-volume');
    this.valEquivVolume = document.getElementById('val-equiv-volume');
    this.valHardness = document.getElementById('val-hardness');
    this.valStatusBadge = document.getElementById('val-status-badge');

    // Trial log table
    this.trialTableBody = document.getElementById('trial-table-body');

    // Quests
    this.questList = document.getElementById('quest-list');
  }

  bindEvents() {
    this.sampleSelect.addEventListener('change', (e) => {
      sound.playClick();
      this.engine.setSample(e.target.value);
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

    this.btnLogTrial.addEventListener('click', () => {
      sound.playClick();
      const m = this.engine.getMetrics();
      this.state.logTrial(m.titrantVolumeMl, m.calculatedHardnessPpm);
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
    this.updateQuests();
    this.updateTrialsTable();
  }

  update(metrics) {
    this.valTitrantVolume.textContent = `${metrics.titrantVolumeMl.toFixed(2)} mL`;
    this.valEquivVolume.textContent = `${metrics.equivalenceVolumeMl.toFixed(2)} mL`;
    this.valHardness.textContent = `${metrics.calculatedHardnessPpm} ppm`;

    this.valStatusBadge.textContent = metrics.flaskColor.label;
    if (metrics.isEndpoint) {
      this.valStatusBadge.style.backgroundColor = metrics.flaskColor.colorHex;
      this.valStatusBadge.style.color = '#FFFFFF';
      this.state.completeQuest('q3');
    } else {
      this.valStatusBadge.style.backgroundColor = '#F1F5F9';
      this.valStatusBadge.style.color = '#334155';
    }

    if (metrics.titrantVolumeMl >= 50.0 && this.engine.stopcockOpen) {
      this.engine.stopcockOpen = false;
      this.btnStopcock.textContent = 'Open Stopcock Valve';
      this.btnStopcock.classList.remove('active');
    }
  }

  updateTrialsTable() {
    this.trialTableBody.innerHTML = '';
    this.state.trials.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${t.trialNumber}</td>
        <td><strong>${t.titerMl} mL</strong></td>
        <td><strong>${t.hardnessPpm} ppm</strong></td>
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
