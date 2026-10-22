/**
 * Solubility & Crystallization — UI Controller & DOM Binder
 * Binds solute switchers, spatula powder additions, burner power slider,
 * ice bath toggles, seed crystal trigger, telemetry updates, and quests.
 */

class SolubilityUI {
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
    // Solute Switchers
    this.soluteKno3Btn = document.getElementById('soluteKno3Btn');
    this.soluteNaclBtn = document.getElementById('soluteNaclBtn');
    this.soluteCuso4Btn = document.getElementById('soluteCuso4Btn');
    this.soluteCeBtn = document.getElementById('soluteCeBtn');

    // Controls
    this.add5gBtn = document.getElementById('add5gBtn');
    this.add20gBtn = document.getElementById('add20gBtn');
    this.flameSlider = document.getElementById('flameSlider');
    this.flameVal = document.getElementById('flameVal');
    this.iceBathBtn = document.getElementById('iceBathBtn');
    this.seedCrystalBtn = document.getElementById('seedCrystalBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.guideBtn = document.getElementById('guideBtn');

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
    this.explanationText = document.getElementById('explanationText');
    this.questList = document.getElementById('questList');

    // Modal
    this.guideModal = document.getElementById('guideModal');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.modalGotItBtn = document.getElementById('modalGotItBtn');
  }

  bindEvents() {
    // Solute Switchers
    this.soluteKno3Btn.addEventListener('click', () => {
      this.sound.playSpatulaClink();
      this.state.setSalt('KNO3');
    });

    this.soluteNaclBtn.addEventListener('click', () => {
      this.sound.playSpatulaClink();
      this.state.setSalt('NaCl');
    });

    this.soluteCuso4Btn.addEventListener('click', () => {
      this.sound.playSpatulaClink();
      this.state.setSalt('CuSO4');
    });

    this.soluteCeBtn.addEventListener('click', () => {
      this.sound.playSpatulaClink();
      this.state.setSalt('Ce2SO4_3');
    });

    // Add Solute Spatula
    this.add5gBtn.addEventListener('click', () => {
      this.sound.playSpatulaClink();
      this.state.addSolute(5.0);
    });

    this.add20gBtn.addEventListener('click', () => {
      this.sound.playSpatulaClink();
      this.state.addSolute(20.0);
    });

    // Flame Slider
    this.flameSlider.addEventListener('input', (e) => {
      const power = parseFloat(e.target.value) / 100.0;
      this.state.setHeatingPower(power);
      this.flameVal.textContent = power > 0 ? `${Math.round(power * 100)}%` : 'OFF';
      this.iceBathBtn.classList.remove('active');
    });

    // Ice Bath Cooling Toggle
    this.iceBathBtn.addEventListener('click', () => {
      this.sound.playStirringWhir();
      this.state.toggleCooling();
      this.iceBathBtn.classList.toggle('active', this.state.coolingActive);
      if (this.state.coolingActive) {
        this.flameSlider.value = 0;
        this.flameVal.textContent = 'OFF';
      }
    });

    // Seed Crystal
    this.seedCrystalBtn.addEventListener('click', () => {
      this.sound.playNucleationPing();
      this.state.addSeedCrystal();
    });

    // Reset Beaker
    this.resetBtn.addEventListener('click', () => {
      this.sound.playSpatulaClink();
      this.state.resetBeaker();
      this.flameSlider.value = 0;
      this.flameVal.textContent = 'OFF';
      this.iceBathBtn.classList.remove('active');
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
  }

  subscribeState() {
    this.state.subscribe((eventType, data) => {
      if (eventType === 'salt_change') {
        this.updateSaltTabs(data.saltId);
        this.updateStaticContent();
      } else if (eventType === 'quest_completed') {
        this.sound.playQuestChime();
        this.renderQuests();
      } else if (eventType === 'reset') {
        this.renderQuests();
      }
    });

    this.renderQuests();
  }

  updateSaltTabs(saltId) {
    this.soluteKno3Btn.classList.toggle('active', saltId === 'KNO3');
    this.soluteNaclBtn.classList.toggle('active', saltId === 'NaCl');
    this.soluteCuso4Btn.classList.toggle('active', saltId === 'CuSO4');
    this.soluteCeBtn.classList.toggle('active', saltId === 'Ce2SO4_3');
  }

  updateStaticContent() {
    const salt = SOLUBILITY_DATA.salts[this.state.selectedSalt];
    this.reactionTitle.textContent = `${salt.name} Thermodynamic Profile`;
    this.equationBlock.textContent = `Solvent: 100.0 g pure H₂O   |   Slope Characteristic: ${salt.slopeType.replace('_', ' ').toUpperCase()}`;
    this.explanationText.textContent = salt.description;
  }

  renderTelemetry() {
    this.card1Val.textContent = `${this.state.temperatureC.toFixed(1)}°C`;
    this.card1Unit.textContent = this.state.heatingPower > 0 ? `Heating (${Math.round(this.state.heatingPower * 100)}% flame)` : (this.state.coolingActive ? 'Ice Bath Cooling' : 'Ambient Equilibrium');

    this.card2Val.textContent = `${this.state.soluteAddedG.toFixed(1)} g`;
    this.card2Unit.textContent = `Total Added (${this.state.getDissolvedMass().toFixed(1)}g dissolved)`;

    const limit = this.state.getSolubilityLimit();
    this.card3Val.textContent = `${limit.toFixed(1)} g`;
    this.card3Unit.textContent = 'Solubility Limit at T (g / 100g H₂O)';

    const status = this.state.getSolutionState();
    if (status === 'unsaturated') {
      this.card4Val.textContent = 'UNSATURATED';
      this.card4Unit.textContent = 'Can dissolve more solute freely';
    } else if (status === 'saturated') {
      this.card4Val.textContent = 'SATURATED';
      this.card4Unit.textContent = `${this.state.getUndissolvedMass().toFixed(1)}g undissolved sediment`;
    } else {
      this.card4Val.textContent = 'SUPERSATURATED';
      this.card4Unit.textContent = this.state.seedCrystalAdded ? `Crystallizing (+${this.state.crystalMassFormedG.toFixed(1)}g pure)` : 'Metastable (Click Seed Crystal)';
    }
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

window.SolubilityUI = SolubilityUI;
