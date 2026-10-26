/**
 * UI Controller for Chromatography Laboratory
 */

import { sound } from './sound.js';
import { SAMPLES, SOLVENTS } from './chromatography_data.js';

export class ChromatographyUI {
  constructor(engine, state) {
    this.engine = engine;
    this.state = state;

    this.cacheElements();
    this.bindEvents();
    this.renderInitial();
  }

  cacheElements() {
    this.sampleSelect = document.getElementById('sample-select');
    this.solventSelect = document.getElementById('solvent-select');
    this.btnPlay = document.getElementById('btn-play');
    this.btnReset = document.getElementById('btn-reset');
    this.speedSlider = document.getElementById('speed-slider');
    this.speedLabel = document.getElementById('speed-label');
    this.btnRuler = document.getElementById('btn-ruler');
    this.btnLid = document.getElementById('btn-lid');
    this.btnMute = document.getElementById('btn-mute');

    // Telemetry readouts
    this.valSolventDist = document.getElementById('val-solvent-dist');
    this.valElapsedTime = document.getElementById('val-elapsed-time');
    this.valBandsCount = document.getElementById('val-bands-count');
    this.valCapSpeed = document.getElementById('val-cap-speed');

    // Pigment Table
    this.tableBody = document.getElementById('pigment-table-body');
    this.pigmentDetailCard = document.getElementById('pigment-detail-card');

    // Quests
    this.questList = document.getElementById('quest-list');
  }

  bindEvents() {
    this.sampleSelect.addEventListener('change', (e) => {
      sound.playClick();
      this.state.setSample(e.target.value);
      this.engine.loadExperiment(this.state.getSample(), this.state.getSolvent());
    });

    this.solventSelect.addEventListener('change', (e) => {
      sound.playClick();
      this.state.setSolvent(e.target.value);
      this.engine.loadExperiment(this.state.getSample(), this.state.getSolvent());
    });

    this.btnPlay.addEventListener('click', () => {
      sound.playClick();
      if (this.engine.isRunning) {
        this.engine.pause();
        this.btnPlay.innerHTML = `<span>▶</span> Start Migration`;
      } else {
        this.engine.start();
        this.state.completeQuest('q1');
        this.btnPlay.innerHTML = `<span>⏸</span> Pause`;
      }
    });

    this.btnReset.addEventListener('click', () => {
      sound.playClick();
      this.engine.reset();
      this.btnPlay.innerHTML = `<span>▶</span> Start Migration`;
    });

    this.speedSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.engine.setTimeScale(val);
      this.speedLabel.textContent = `${val.toFixed(1)}x`;
    });

    this.btnRuler.addEventListener('click', () => {
      sound.playClick();
      this.state.toggleRuler();
      this.btnRuler.classList.toggle('active', this.state.showRuler);
    });

    this.btnLid.addEventListener('click', () => {
      sound.playClick();
      this.state.setLid(!this.state.chamberLidClosed);
      this.btnLid.textContent = this.state.chamberLidClosed ? 'Lid: Sealed' : 'Lid: Open';
    });

    this.btnMute.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      this.btnMute.textContent = isMuted ? '🔇 Audio Muted' : '🔊 Audio Active';
    });

    this.state.subscribe(() => {
      this.updateQuests();
      this.updatePigmentCard();
    });
  }

  renderInitial() {
    this.updateQuests();
    this.updatePigmentCard();
  }

  update(metrics) {
    // Update play button text if complete
    if (metrics.isComplete && this.engine.isRunning === false) {
      this.btnPlay.innerHTML = `<span>✓</span> Migration Complete`;
      this.state.completeQuest('q3');
    }

    if (metrics.netSolventDistanceCm > 3.0) {
      this.state.completeQuest('q2');
    }

    // Telemetry updates
    this.valSolventDist.textContent = `${metrics.netSolventDistanceCm.toFixed(2)} cm`;
    this.valElapsedTime.textContent = `${metrics.elapsedTime.toFixed(1)} s`;
    this.valBandsCount.textContent = metrics.pigments.length;

    const speed = metrics.elapsedTime > 0 ? (metrics.netSolventDistanceCm / metrics.elapsedTime).toFixed(3) : '0.000';
    this.valCapSpeed.textContent = `${speed} cm/s`;

    // Render table rows
    this.renderPigmentRows(metrics.pigments);
  }

  renderPigmentRows(pigments) {
    this.tableBody.innerHTML = '';
    pigments.forEach(p => {
      const tr = document.createElement('tr');
      if (this.state.selectedPigmentId === p.id) {
        tr.className = 'active-row';
      }
      tr.innerHTML = `
        <td style="display:flex; align-items:center; gap:8px;">
          <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${p.color}; border:1px solid rgba(0,0,0,0.2);"></span>
          <strong>${p.name}</strong>
        </td>
        <td>${p.distanceFromBaselineCm.toFixed(2)} cm</td>
        <td><strong>${p.rfCalculated}</strong></td>
        <td><span class="ref-badge">${p.rfReference}</span></td>
      `;
      tr.addEventListener('click', () => {
        sound.playClick();
        this.state.selectPigment(p.id);
      });
      this.tableBody.appendChild(tr);
    });
  }

  updatePigmentCard() {
    const sample = this.state.getSample();
    const currentId = this.state.selectedPigmentId;
    const pigment = sample.pigments.find(p => p.id === currentId);

    if (!pigment) {
      this.pigmentDetailCard.innerHTML = `
        <p class="placeholder-text">Click any pigment band on the strip or in the table to inspect chemical formula, polarity notes, and retention mechanisms.</p>
      `;
      return;
    }

    this.pigmentDetailCard.innerHTML = `
      <div class="pigment-card-content">
        <div class="pigment-card-header" style="border-left: 4px solid ${pigment.color};">
          <h4>${pigment.name}</h4>
          <span class="formula-tag">${pigment.formula}</span>
        </div>
        <p class="notes-text">${pigment.notes}</p>
        <div class="rf-formula-box">
          $$R_f = \\frac{\\text{Distance traveled by pigment}}{\\text{Distance traveled by solvent front}} = ${pigment.rf.toFixed(2)}$$
        </div>
      </div>
    `;
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
