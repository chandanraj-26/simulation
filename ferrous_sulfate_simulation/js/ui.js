/**
 * Thermal Decomposition of Ferrous Sulfate — UI Controller & Telemetry Binder
 * Handles DOM interactions, test probe selection, flame adjustments,
 * stoichiometric telemetry updates, and NCERT quests synchronization.
 */

class ReactionUI {
  constructor(state, soundEngine, renderer) {
    this.state = state;
    this.sound = soundEngine;
    this.renderer = renderer;

    this.initDOMReferences();
    this.bindEvents();
    this.renderQuests();
    this.updateAll();

    this.state.subscribe((event, data) => this.handleStateChange(event, data));
  }

  initDOMReferences() {
    // Flame controls
    this.flamePills = document.querySelectorAll('.flame-pill');

    // Test probes
    this.probePills = document.querySelectorAll('.probe-pill');

    // Action buttons
    this.btnWaft = document.getElementById('btn-waft');
    this.btnSound = document.getElementById('btn-sound');
    this.btnReset = document.getElementById('btn-reset');

    // Telemetry displays
    this.txtTemp = document.getElementById('telemetry-temp');
    this.txtStage = document.getElementById('telemetry-stage');
    this.txtSolidFormula = document.getElementById('telemetry-solid');
    this.txtEvolvingGases = document.getElementById('telemetry-gases');
    this.txtCurrentMass = document.getElementById('telemetry-mass-current');
    this.txtWaterEvolved = document.getElementById('telemetry-water-evolved');
    this.txtSOxEvolved = document.getElementById('telemetry-sox-evolved');

    // Quest list
    this.questListContainer = document.getElementById('quest-list');
  }

  bindEvents() {
    // Flame intensity buttons
    this.flamePills.forEach(pill => {
      pill.addEventListener('click', () => {
        const level = parseInt(pill.dataset.flame, 10);
        this.state.setFlameLevel(level);
        this.sound.playClick();
      });
    });

    // Test probes (litmus, potassium dichromate)
    this.probePills.forEach(pill => {
      pill.addEventListener('click', () => {
        const probe = pill.dataset.probe;
        this.state.setActiveTestProbe(probe);
        this.sound.playClick();
      });
    });

    // Wafting button
    if (this.btnWaft) {
      this.btnWaft.addEventListener('click', () => {
        this.state.triggerWafting();
        this.sound.playWaftWhoosh();
      });
    }

    // Sound toggle
    if (this.btnSound) {
      this.btnSound.addEventListener('click', () => {
        const enabled = this.sound.toggle();
        this.btnSound.innerHTML = enabled ? '<span>🔊</span> Sound: ON' : '<span>🔇</span> Sound: OFF';
      });
    }

    // Reset button
    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => {
        this.state.resetAll();
        this.sound.playClick();
        this.updateAll();
      });
    }
  }

  handleStateChange(event, data) {
    if (event === 'quest_completed') {
      this.sound.playQuestComplete();
      this.renderQuests();
    }
    this.updateAll();
  }

  updateAll() {
    // 1. Update flame pills
    this.flamePills.forEach(pill => {
      const level = parseInt(pill.dataset.flame, 10);
      pill.classList.toggle('active', level === this.state.flameLevel);
    });

    // 2. Update probe pills
    this.probePills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.probe === this.state.activeTestProbe);
    });

    // 3. Update temperature & stage telemetry
    const stage = this.state.getCurrentStage();
    if (this.txtTemp) {
      this.txtTemp.textContent = `${Math.round(this.state.temperature)} °C`;
    }
    if (this.txtStage) {
      this.txtStage.textContent = stage.title;
    }
    if (this.txtSolidFormula) {
      this.txtSolidFormula.textContent = stage.solid;
    }

    // 4. Update gas telemetry
    if (this.txtEvolvingGases) {
      if (this.state.decompositionProgress > 0.05) {
        this.txtEvolvingGases.innerHTML = '<span class="badge-danger">SO₂(g) + SO₃(g) (Suffocating Choking Odor)</span>';
      } else if (this.state.dehydrationProgress > 0.05) {
        this.txtEvolvingGases.innerHTML = '<span class="badge-info">H₂O(g) (Water Vapor Steam)</span>';
      } else {
        this.txtEvolvingGases.innerHTML = '<span class="badge-neutral">None (No heating)</span>';
      }
    }

    // 5. Update stoichiometric mass balance ledger
    const ledger = this.state.getMassLedger();
    if (this.txtCurrentMass) {
      this.txtCurrentMass.textContent = `${ledger.currentMass.toFixed(3)} g`;
    }
    if (this.txtWaterEvolved) {
      this.txtWaterEvolved.textContent = `${ledger.waterEvolved.toFixed(3)} g`;
    }
    if (this.txtSOxEvolved) {
      const totalSOx = ledger.so2Evolved + ledger.so3Evolved;
      this.txtSOxEvolved.textContent = `${totalSOx.toFixed(3)} g`;
    }
  }

  renderQuests() {
    if (!this.questListContainer) return;
    this.questListContainer.innerHTML = '';

    this.state.quests.forEach(q => {
      const item = document.createElement('div');
      item.className = `quest-item ${q.completed ? 'completed' : ''}`;
      item.innerHTML = `
        <div class="quest-checkbox">${q.completed ? '✓' : ''}</div>
        <div class="quest-content">
          <div class="quest-title">${q.title}</div>
          <div class="quest-desc">${q.desc}</div>
        </div>
      `;
      this.questListContainer.appendChild(item);
    });
  }
}

window.ReactionUI = ReactionUI;
