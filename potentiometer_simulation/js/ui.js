/**
 * UI Controller for Potentiometer Laboratory
 */

import { sound } from './sound.js';

export class PotentiometerUI {
  constructor(engine, state) {
    this.engine = engine;
    this.state = state;

    this.cacheElements();
    this.bindEvents();
    this.renderInitial();
  }

  cacheElements() {
    this.btnCell1 = document.getElementById('btn-cell1');
    this.btnCell2 = document.getElementById('btn-cell2');
    this.btnInternalR = document.getElementById('btn-internal-r');
    this.sliderJockey = document.getElementById('slider-jockey');
    this.labelJockey = document.getElementById('label-jockey');
    this.sliderRheostat = document.getElementById('slider-rheostat');
    this.labelRheostat = document.getElementById('label-rheostat');

    this.btnLogTrial = document.getElementById('btn-log-trial');
    this.btnMute = document.getElementById('btn-mute');

    // Telemetry readouts
    this.valJockeyCm = document.getElementById('val-jockey-cm');
    this.valDeflection = document.getElementById('val-deflection');
    this.valGrad = document.getElementById('val-grad');
    this.valRatio = document.getElementById('val-ratio');
    this.valNullBadge = document.getElementById('val-null-badge');

    // Trials table
    this.trialTableBody = document.getElementById('trial-table-body');

    // Quests
    this.questList = document.getElementById('quest-list');
  }

  bindEvents() {
    this.btnCell1.addEventListener('click', () => {
      sound.playClick();
      this.engine.setCellMode('cell1');
      this.updateModeButtons();
    });

    this.btnCell2.addEventListener('click', () => {
      sound.playClick();
      this.engine.setCellMode('cell2');
      this.updateModeButtons();
    });

    this.btnInternalR.addEventListener('click', () => {
      sound.playClick();
      this.engine.setCellMode('internal_r');
      this.updateModeButtons();
      this.state.completeQuest('q4');
    });

    this.sliderJockey.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.engine.setJockeyPosition(val);
      this.labelJockey.textContent = `${val.toFixed(1)} cm`;
    });

    this.sliderRheostat.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.engine.setRheostat(val);
      this.labelRheostat.textContent = `${val.toFixed(1)} Ω`;
    });

    this.btnLogTrial.addEventListener('click', () => {
      sound.playClick();
      const m = this.engine.getMetrics();
      this.state.logTrial(this.engine.activeCellKey, m.jockeyCm, m.isNullPoint);
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
    this.updateModeButtons();
    this.updateQuests();
    this.updateTrialsTable();
  }

  updateModeButtons() {
    const mode = this.engine.activeCellKey;
    this.btnCell1.classList.toggle('active', mode === 'cell1');
    this.btnCell2.classList.toggle('active', mode === 'cell2');
    this.btnInternalR.classList.toggle('active', mode === 'internal_r');
  }

  update(metrics) {
    this.valJockeyCm.textContent = `${metrics.jockeyCm} cm`;
    this.valDeflection.textContent = `${metrics.galvanometerDeflection} div`;
    this.valGrad.textContent = `${metrics.potentialGradient} mV/cm`;
    this.valRatio.textContent = metrics.emfRatio;

    // Null point indicator
    if (metrics.isNullPoint) {
      this.valNullBadge.textContent = '● NULL POINT REACHED (I_g = 0)';
      this.valNullBadge.style.backgroundColor = '#DCFCE7';
      this.valNullBadge.style.color = '#15803D';

      if (this.engine.activeCellKey === 'cell1') this.state.completeQuest('q1');
      if (this.engine.activeCellKey === 'cell2') {
        this.state.completeQuest('q2');
        this.state.completeQuest('q3');
      }
    } else {
      this.valNullBadge.textContent = '○ Off-Balance (Deflecting)';
      this.valNullBadge.style.backgroundColor = '#F1F5F9';
      this.valNullBadge.style.color = '#475569';
    }
  }

  updateTrialsTable() {
    this.trialTableBody.innerHTML = '';
    this.state.trials.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${t.trialNumber}</td>
        <td>${t.mode.toUpperCase()}</td>
        <td><strong>${t.balancingLengthCm} cm</strong></td>
        <td>${t.status}</td>
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
