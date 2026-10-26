/**
 * UI Controller for Le Chatelier Simulator
 */

import { sound } from './sound.js';
import { SYSTEMS } from './equilibrium_data.js';

export class EquilibriumUI {
  constructor(engine, state) {
    this.engine = engine;
    this.state = state;

    this.cacheElements();
    this.bindEvents();
    this.renderInitial();
  }

  cacheElements() {
    this.systemSelect = document.getElementById('system-select');
    this.reagentsContainer = document.getElementById('reagents-container');
    this.tubeButtonsContainer = document.getElementById('tube-buttons-container');
    this.btnReset = document.getElementById('btn-reset');
    this.btnMute = document.getElementById('btn-mute');

    // Telemetry readouts
    this.valEquilPos = document.getElementById('val-equil-pos');
    this.valAbsorbance = document.getElementById('val-absorbance');
    this.valTransmittance = document.getElementById('val-transmittance');
    this.valShiftDir = document.getElementById('val-shift-dir');

    // System info
    this.systemEqTag = document.getElementById('system-eq-tag');
    this.systemEnthalpyTag = document.getElementById('system-enthalpy-tag');

    // Quests
    this.questList = document.getElementById('quest-list');
  }

  bindEvents() {
    this.systemSelect.addEventListener('change', (e) => {
      sound.playClick();
      this.engine.setSystem(e.target.value);
      this.renderReagents();
      this.updateSystemInfo();
      if (e.target.value === 'cobalt_chloride') {
        this.state.completeQuest('q3');
      }
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
      this.updateTubeButtons();
    });
  }

  renderInitial() {
    this.renderTubeButtons();
    this.renderReagents();
    this.updateSystemInfo();
    this.updateQuests();
  }

  renderTubeButtons() {
    this.tubeButtonsContainer.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const btn = document.createElement('button');
      btn.className = `btn-secondary ${this.state.selectedTubeIndex === i ? 'active' : ''}`;
      btn.textContent = `Tube ${i + 1}`;
      btn.addEventListener('click', () => {
        sound.playClick();
        this.state.selectTube(i);
      });
      this.tubeButtonsContainer.appendChild(btn);
    }
  }

  updateTubeButtons() {
    Array.from(this.tubeButtonsContainer.children).forEach((btn, idx) => {
      btn.classList.toggle('active', this.state.selectedTubeIndex === idx);
    });
  }

  renderReagents() {
    const sys = SYSTEMS[this.engine.systemId];
    this.reagentsContainer.innerHTML = '';

    sys.reagents.forEach(r => {
      const btn = document.createElement('button');
      btn.className = 'btn-action';
      btn.textContent = r.label;
      btn.title = r.effect;
      btn.addEventListener('click', () => {
        if (r.id.includes('bath')) sound.playThermalShift();
        else sound.playDroplet();

        this.engine.applyPerturbation(this.state.selectedTubeIndex, r.id);

        if (r.id === 'add_fe') this.state.completeQuest('q1');
        if (r.id === 'add_oxalate') this.state.completeQuest('q2');
        if (r.id === 'ice_bath') this.state.completeQuest('q4');
      });
      this.reagentsContainer.appendChild(btn);
    });
  }

  updateSystemInfo() {
    const sys = SYSTEMS[this.engine.systemId];
    this.systemEqTag.textContent = sys.equation;
    this.systemEnthalpyTag.textContent = `ΔH = ${sys.deltaH > 0 ? '+' : ''}${sys.deltaH} kJ/mol (${sys.enthalpyType.toUpperCase()})`;
  }

  update(metrics) {
    this.valEquilPos.textContent = `${metrics.equilibriumPosition}%`;
    this.valAbsorbance.textContent = metrics.absorbance;
    this.valTransmittance.textContent = `${metrics.transmittancePercent}%`;
    this.valShiftDir.textContent = metrics.shiftDirection;
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
