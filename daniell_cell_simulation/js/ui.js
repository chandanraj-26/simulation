/**
 * UI Controller for Daniell Cell
 */

import { sound } from './sound.js';

export class DaniellUI {
  constructor(engine, state) {
    this.engine = engine;
    this.state = state;

    this.cacheElements();
    this.bindEvents();
    this.renderInitial();
  }

  cacheElements() {
    this.sliderZn = document.getElementById('slider-zn');
    this.labelZn = document.getElementById('label-zn');
    this.sliderCu = document.getElementById('slider-cu');
    this.labelCu = document.getElementById('label-cu');
    this.sliderTemp = document.getElementById('slider-temp');
    this.labelTemp = document.getElementById('label-temp');

    this.btnSaltBridge = document.getElementById('btn-salt-bridge');
    this.btnCircuit = document.getElementById('btn-circuit');
    this.btnReset = document.getElementById('btn-reset');
    this.btnMute = document.getElementById('btn-mute');

    // Telemetry readouts
    this.valVoltage = document.getElementById('val-voltage');
    this.valStandardE = document.getElementById('val-standard-e');
    this.valDeltaG = document.getElementById('val-delta-g');
    this.valQuotientQ = document.getElementById('val-quotient-q');
    this.valAnodeMass = document.getElementById('val-anode-mass');
    this.valCathodeMass = document.getElementById('val-cathode-mass');

    // Quests
    this.questList = document.getElementById('quest-list');
  }

  bindEvents() {
    this.sliderZn.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.engine.setAnodeConcentration(val);
      this.labelZn.textContent = `${val.toFixed(3)} M`;
      if (val <= 0.05) this.state.completeQuest('q2');
    });

    this.sliderCu.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.engine.setCathodeConcentration(val);
      this.labelCu.textContent = `${val.toFixed(3)} M`;
    });

    this.sliderTemp.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.engine.setTemperature(val);
      this.labelTemp.textContent = `${val.toFixed(1)} K (${(val - 273.15).toFixed(0)}°C)`;
    });

    this.btnSaltBridge.addEventListener('click', () => {
      sound.playSaltBridgePlop();
      this.engine.toggleSaltBridge();
      this.btnSaltBridge.textContent = this.engine.saltBridgeInserted ? 'Remove Salt Bridge' : 'Insert Salt Bridge';
      this.btnSaltBridge.classList.toggle('active', this.engine.saltBridgeInserted);
      if (!this.engine.saltBridgeInserted) this.state.completeQuest('q3');
    });

    this.btnCircuit.addEventListener('click', () => {
      sound.playSwitchClick();
      this.engine.toggleCircuit();
      this.btnCircuit.textContent = this.engine.circuitClosed ? 'Open Circuit Switch' : 'Close Circuit Switch';
      this.btnCircuit.classList.toggle('active', this.engine.circuitClosed);
    });

    this.btnReset.addEventListener('click', () => {
      sound.playClick();
      this.engine.reset();
      this.sliderZn.value = 1.0;
      this.labelZn.textContent = '1.000 M';
      this.sliderCu.value = 1.0;
      this.labelCu.textContent = '1.000 M';
      this.sliderTemp.value = 298.15;
      this.labelTemp.textContent = '298.2 K (25°C)';
      this.btnSaltBridge.textContent = 'Remove Salt Bridge';
      this.btnCircuit.textContent = 'Open Circuit Switch';
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
    this.updateQuests();
  }

  update(metrics) {
    this.valVoltage.textContent = `${metrics.cellPotentialVolts.toFixed(3)} V`;
    this.valStandardE.textContent = `${metrics.standardPotential.toFixed(2)} V`;
    this.valDeltaG.textContent = `${metrics.deltaGKJ} kJ/mol`;
    this.valQuotientQ.textContent = metrics.reactionQuotientQ;
    this.valAnodeMass.textContent = `-${metrics.anodeMassLoss} g`;
    this.valCathodeMass.textContent = `+${metrics.cathodeMassGain} g`;

    if (parseFloat(metrics.cathodeMassGain) > 0.05) {
      this.state.completeQuest('q4');
    }
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
