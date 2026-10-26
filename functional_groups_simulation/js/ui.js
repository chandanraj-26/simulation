/**
 * UI Controller for Organic Functional Groups
 */

import { sound } from './sound.js';
import { COMPOUNDS, REAGENTS } from './organic_data.js';

export class OrganicUI {
  constructor(engine, state) {
    this.engine = engine;
    this.state = state;

    this.cacheElements();
    this.bindEvents();
    this.renderInitial();
  }

  cacheElements() {
    this.compoundSelect = document.getElementById('compound-select');
    this.reagentsContainer = document.getElementById('reagents-container');
    this.btnReset = document.getElementById('btn-reset');
    this.btnSqueakyPop = document.getElementById('btn-squeaky-pop');
    this.btnMute = document.getElementById('btn-mute');

    // Telemetry readouts
    this.valCompound = document.getElementById('val-compound');
    this.valGroup = document.getElementById('val-group');
    this.valReagent = document.getElementById('val-reagent');
    this.valObsBox = document.getElementById('val-obs-box');

    // Quests
    this.questList = document.getElementById('quest-list');
  }

  bindEvents() {
    this.compoundSelect.addEventListener('change', (e) => {
      sound.playDroplet();
      this.engine.setCompound(e.target.value);
    });

    this.btnReset.addEventListener('click', () => {
      sound.playDroplet();
      this.engine.reset();
    });

    this.btnSqueakyPop.addEventListener('click', () => {
      sound.playSqueakyPop();
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
    this.renderReagentButtons();
    this.updateQuests();
  }

  renderReagentButtons() {
    this.reagentsContainer.innerHTML = '';
    Object.values(REAGENTS).forEach(r => {
      const btn = document.createElement('button');
      btn.className = 'btn-action';
      btn.textContent = `+ Add ${r.name}`;
      btn.addEventListener('click', () => {
        sound.playDroplet();
        this.engine.applyReagent(r.id);

        if (r.id === 'sodium' || r.id === 'nahco3') {
          setTimeout(() => sound.playFizz(), 200);
        }

        // Quest checks
        const compId = this.engine.compoundId;
        if (compId === 'cyclohexene' && r.id === 'bromine_water') this.state.completeQuest('q1');
        if (compId === 'ethanol' && r.id === 'sodium') this.state.completeQuest('q2');
        if (compId === 'acetaldehyde' && r.id === 'tollens') this.state.completeQuest('q3');
        if (compId === 'acetic_acid' && r.id === 'nahco3') this.state.completeQuest('q4');
      });
      this.reagentsContainer.appendChild(btn);
    });
  }

  update(metrics) {
    this.valCompound.textContent = metrics.compoundName;
    this.valGroup.textContent = metrics.functionalGroup;
    this.valReagent.textContent = metrics.activeReagent;

    this.valObsBox.textContent = metrics.observation;
    this.valObsBox.style.backgroundColor = metrics.isPositive ? '#DCFCE7' : '#F8FAFC';
    this.valObsBox.style.borderColor = metrics.isPositive ? '#86EFAC' : '#CBD5E1';
    this.valObsBox.style.color = metrics.isPositive ? '#166534' : '#334155';

    // Show squeaky pop test button if sodium gas is evolving
    this.btnSqueakyPop.style.display = (this.engine.activeReagentId === 'sodium' && metrics.isPositive) ? 'block' : 'none';
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
