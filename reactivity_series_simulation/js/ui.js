/**
 * Reactivity Series — UI Controller & DOM Binder
 * Binds metal selection, dipping actions, solution customization,
 * telemetry updates, quest tracking, and canvas click delegation.
 */

class ReactivityUI {
  constructor(state, soundEngine, renderer) {
    this.state = state;
    this.sound = soundEngine;
    this.renderer = renderer;

    this.cacheDOM();
    this.bindEvents();
    this.subscribeState();
    this.updateStaticContent();
  }

  cacheDOM() {
    this.canvas = document.getElementById('simCanvas');

    // Controls
    this.dipBtn = document.getElementById('dipBtn');
    this.removeBtn = document.getElementById('removeBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.mnemonicBtn = document.getElementById('mnemonicBtn');
    this.guideBtn = document.getElementById('guideBtn');

    // Selectors
    this.activeTubeSelect = document.getElementById('activeTubeSelect');
    this.solutionSelect = document.getElementById('solutionSelect');
    this.metalPills = document.querySelectorAll('.metal-pill');

    // Telemetry Cards
    this.card1Val = document.getElementById('card1Val');
    this.card1Unit = document.getElementById('card1Unit');

    this.card2Val = document.getElementById('card2Val');
    this.card2Unit = document.getElementById('card2Unit');

    this.card3Val = document.getElementById('card3Val');
    this.card3Unit = document.getElementById('card3Unit');

    this.card4Val = document.getElementById('card4Val');
    this.card4Unit = document.getElementById('card4Unit');

    // Banner & Quests
    this.reactionTitle = document.getElementById('reactionTitle');
    this.equationBlock = document.getElementById('equationBlock');
    this.observationText = document.getElementById('observationText');
    this.questList = document.getElementById('questList');

    // Modal
    this.guideModal = document.getElementById('guideModal');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.modalGotItBtn = document.getElementById('modalGotItBtn');
  }

  bindEvents() {
    // Metal Sample Selection Pills
    this.metalPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.sound.playClick();
        const metalId = pill.dataset.metal;
        this.metalPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.state.selectMetal(metalId);
      });
    });

    // Active Tube Dropdown
    this.activeTubeSelect.addEventListener('change', (e) => {
      const id = parseInt(e.target.value);
      this.sound.playClick();
      this.state.selectTube(id);
    });

    // Change Solution Dropdown
    this.solutionSelect.addEventListener('change', (e) => {
      const solId = e.target.value;
      this.sound.playLiquidDip();
      this.state.changeTubeSolution(this.state.selectedTubeId, solId);
    });

    // Dip Metal Button
    this.dipBtn.addEventListener('click', () => {
      this.sound.playLiquidDip();
      this.state.submergeMetalIntoTube(this.state.selectedTubeId, this.state.selectedMetal);
    });

    // Remove Metal Button
    this.removeBtn.addEventListener('click', () => {
      this.sound.playClick();
      this.state.removeMetalFromTube(this.state.selectedTubeId);
    });

    // Reset Rack
    this.resetBtn.addEventListener('click', () => {
      this.sound.playClick();
      this.state.resetAllTubes();
    });

    // Recite Mnemonic
    this.mnemonicBtn.addEventListener('click', () => {
      this.sound.speakMnemonic();
    });

    // Sound Toggle
    this.soundToggleBtn.addEventListener('click', () => {
      this.state.soundEnabled = !this.state.soundEnabled;
      this.soundToggleBtn.textContent = this.state.soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    });

    // Guide Modal
    this.guideBtn.addEventListener('click', () => this.toggleModal(true));
    this.closeModalBtn.addEventListener('click', () => this.toggleModal(false));
    this.modalGotItBtn.addEventListener('click', () => this.toggleModal(false));

    // Interactive Canvas Click on Tube Bounds
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (const b of this.renderer.tubeBounds) {
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
          this.activeTubeSelect.value = b.id;
          this.state.selectTube(b.id);
          this.sound.playClick();
          break;
        }
      }
    });
  }

  subscribeState() {
    this.state.subscribe((eventType, data) => {
      if (eventType === 'tube_select') {
        this.activeTubeSelect.value = data.tubeId;
        this.updateStaticContent();
      } else if (eventType === 'metal_submerged' || eventType === 'metal_removed' || eventType === 'solution_change') {
        this.updateStaticContent();
      } else if (eventType === 'quest_completed') {
        this.sound.playQuestChime();
        this.renderQuests();
      } else if (eventType === 'reset') {
        this.updateStaticContent();
        this.renderQuests();
      }
    });

    this.renderQuests();
  }

  updateStaticContent() {
    const selTube = this.state.tubes.find(t => t.id === this.state.selectedTubeId);
    if (!selTube) return;

    // Update solution dropdown to match selected tube
    this.solutionSelect.value = selTube.solutionId;

    // Update dip/remove button state
    if (selTube.isSubmerged) {
      this.dipBtn.style.display = 'none';
      this.removeBtn.style.display = 'inline-flex';
    } else {
      this.dipBtn.style.display = 'inline-flex';
      this.removeBtn.style.display = 'none';
    }

    // Reaction Equation & Observation Banner
    if (selTube.isSubmerged && selTube.metalId) {
      const key = `${selTube.metalId}+${selTube.solutionId}`;
      const rxn = REACTIVITY_DATA.reactions[key];
      if (rxn) {
        this.reactionTitle.textContent = rxn.occurs ? 'Displacement Reaction in Progress' : 'No Chemical Reaction';
        this.equationBlock.textContent = rxn.equation;
        this.observationText.textContent = rxn.observation;
      } else {
        const metal = REACTIVITY_DATA.metals[selTube.metalId];
        const sol = REACTIVITY_DATA.solutions[selTube.solutionId];
        const willDisplace = metal.reactivityRank < sol.reactivityRank;
        this.reactionTitle.textContent = willDisplace ? 'Displacement Expected' : 'No Reaction Expected';
        this.equationBlock.textContent = `${metal.symbol} (s) + ${sol.id} (aq) → ${willDisplace ? 'Displacement Occurs' : 'No Reaction'}`;
        this.observationText.textContent = willDisplace ? `${metal.name} is higher in the series and can displace ${sol.metalSymbol}.` : `${metal.name} is lower in the series and cannot displace ${sol.metalSymbol}.`;
      }
    } else {
      this.reactionTitle.textContent = `Awaiting Metal Sample in ${selTube.name}`;
      this.equationBlock.textContent = `Select a metal sample above and click "Dip Metal into ${selTube.name}" to begin.`;
      this.observationText.textContent = `Current Solution: ${REACTIVITY_DATA.solutions[selTube.solutionId].name}`;
    }
  }

  renderTelemetry() {
    const selTube = this.state.tubes.find(t => t.id === this.state.selectedTubeId);
    if (!selTube) return;

    this.card1Val.textContent = selTube.name;
    this.card1Unit.textContent = `${selTube.solutionId} (0.5 M)`;

    this.card2Val.textContent = selTube.metalId ? REACTIVITY_DATA.metals[selTube.metalId].name : 'None';
    this.card2Unit.textContent = selTube.isSubmerged ? 'Submerged in solution' : 'On bench rack';

    this.card3Val.textContent = `${selTube.temperatureC.toFixed(1)}`;
    this.card3Unit.textContent = selTube.temperatureC > 25.2 ? 'Exothermic Rise (°C)' : 'Ambient Room Temp';

    const progressPct = Math.round(selTube.reactionProgress * 100);
    this.card4Val.textContent = `${progressPct}%`;
    this.card4Unit.textContent = progressPct >= 100 ? 'Reaction Complete' : (selTube.isSubmerged ? 'Displacing...' : 'Idle');
  }

  renderQuests() {
    this.questList.innerHTML = '';
    for (const q of this.state.quests) {
      const item = document.createElement('div');
      item.className = `quest-item ${q.completed ? 'completed' : ''}`;
      item.innerHTML = `
        <div class="quest-checkbox">${q.completed ? '✓' : ''}</div>
        <div class="quest-text-group">
          <div class="quest-text-title">${q.title}</div>
          <div class="quest-text-desc">${q.desc}</div>
        </div>
      `;
      this.questList.appendChild(item);
    }
  }

  toggleModal(show) {
    if (show) {
      this.guideModal.classList.add('active');
    } else {
      this.guideModal.classList.remove('active');
    }
  }
}

window.ReactivityUI = ReactivityUI;
