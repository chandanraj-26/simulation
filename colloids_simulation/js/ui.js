/**
 * UI Controller for Colloids Simulation
 */

import { sound } from './sound.js';
import { SOLS } from './colloid_data.js';

export class ColloidUI {
  constructor(engine, state) {
    this.engine = engine;
    this.state = state;

    this.cacheElements();
    this.bindEvents();
    this.renderInitial();
  }

  cacheElements() {
    this.solSelect = document.getElementById('sol-select');
    this.btnLaser = document.getElementById('btn-laser');
    this.btnReset = document.getElementById('btn-reset');
    this.btnMute = document.getElementById('btn-mute');
    this.electrolyteContainer = document.getElementById('electrolyte-container');

    // Telemetry readouts
    this.valSol = document.getElementById('val-sol');
    this.valCharge = document.getElementById('val-charge');
    this.valElectrolyte = document.getElementById('val-electrolyte');
    this.valCoagulation = document.getElementById('val-coagulation');

    // Quests
    this.questList = document.getElementById('quest-list');
  }

  bindEvents() {
    this.solSelect.addEventListener('change', (e) => {
      sound.playDrop();
      this.engine.setSol(e.target.value);
      this.renderElectrolyteButtons();
      if (e.target.value === 'starch') this.state.completeQuest('q4');
    });

    this.btnLaser.addEventListener('click', () => {
      sound.playLaserPing();
      this.engine.showTyndall = !this.engine.showTyndall;
      this.btnLaser.textContent = this.engine.showTyndall ? 'Green Laser: ON' : 'Green Laser: OFF';
      this.btnLaser.classList.toggle('active', this.engine.showTyndall);
      this.state.completeQuest('q2');
    });

    this.btnReset.addEventListener('click', () => {
      sound.playDrop();
      this.engine.reset();
    });

    this.btnMute.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      this.btnMute.textContent = isMuted ? '🔇 Audio Muted' : '🔊 Audio Active';
    });

    this.state.subscribe(() => {
      this.updateQuests();
    });
  }

  renderInitial() {
    this.renderElectrolyteButtons();
    this.updateQuests();
  }

  renderElectrolyteButtons() {
    const sol = SOLS[this.engine.solId];
    this.electrolyteContainer.innerHTML = '';

    sol.activeElectrolytes.forEach((el, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn-action';
      btn.innerHTML = `<strong>${el.name}</strong> • Flocc. Val: ${el.flocculationValue} mM`;
      btn.addEventListener('click', () => {
        sound.playDrop();
        this.engine.addElectrolyte(idx);
        if (el.valency >= 4) this.state.completeQuest('q3');
      });
      this.electrolyteContainer.appendChild(btn);
    });
  }

  update(metrics) {
    this.valSol.textContent = metrics.solName;
    this.valCharge.textContent = `${metrics.charge} (${metrics.type})`;
    this.valElectrolyte.textContent = metrics.activeElectrolyteName;
    this.valCoagulation.textContent = `${metrics.coagulationPercent}%`;
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
