/**
 * Electrolysis & Electroplating — UI Controller & DOM Binder
 * Binds sliders, mode tabs, splint triggers, telemetry readouts,
 * quest trackers, and interactive canvas hit-testing.
 */

class ElectrolysisUI {
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
    // Mode Switchers
    this.modeWaterBtn = document.getElementById('modeWaterBtn');
    this.modePlateBtn = document.getElementById('modePlateBtn');

    // Controls
    this.powerBtn = document.getElementById('powerBtn');
    this.voltageSlider = document.getElementById('voltageSlider');
    this.voltageVal = document.getElementById('voltageVal');
    this.resetBtn = document.getElementById('resetBtn');
    this.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.guideBtn = document.getElementById('guideBtn');
    this.guideModal = document.getElementById('guideModal');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.modalGotItBtn = document.getElementById('modalGotItBtn');

    // Splint Actions
    this.testH2Btn = document.getElementById('testH2Btn');
    this.testO2Btn = document.getElementById('testO2Btn');

    // Telemetry Cards
    this.card1Title = document.getElementById('card1Title');
    this.card1Val = document.getElementById('card1Val');
    this.card1Unit = document.getElementById('card1Unit');

    this.card2Title = document.getElementById('card2Title');
    this.card2Val = document.getElementById('card2Val');
    this.card2Unit = document.getElementById('card2Unit');

    this.card3Title = document.getElementById('card3Title');
    this.card3Val = document.getElementById('card3Val');
    this.card3Unit = document.getElementById('card3Unit');

    this.card4Title = document.getElementById('card4Title');
    this.card4Val = document.getElementById('card4Val');
    this.card4Unit = document.getElementById('card4Unit');

    // Banner & Quests
    this.reactionTitle = document.getElementById('reactionTitle');
    this.equationBlock = document.getElementById('equationBlock');
    this.questList = document.getElementById('questList');
    this.canvas = document.getElementById('simCanvas');
  }

  bindEvents() {
    // Mode Switch
    this.modeWaterBtn.addEventListener('click', () => {
      this.state.setMode('water_splitting');
    });

    this.modePlateBtn.addEventListener('click', () => {
      this.state.setMode('electroplating');
    });

    // Power
    this.powerBtn.addEventListener('click', () => {
      this.sound.playSwitchClick();
      this.state.togglePower();
    });

    // Voltage Slider
    this.voltageSlider.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      this.voltageVal.textContent = `${v.toFixed(1)} V`;
      this.state.setVoltage(v);
    });

    // Splint Buttons
    this.testH2Btn.addEventListener('click', () => {
      if (this.state.h2Volume < 1.0) {
        alert('Please collect at least 1.0 mL of Hydrogen (H₂) first by running the electrolysis!');
        return;
      }
      this.sound.playHydrogenPop();
      this.state.triggerSplintTest('hydrogen');
    });

    this.testO2Btn.addEventListener('click', () => {
      if (this.state.o2Volume < 0.5) {
        alert('Please collect at least 0.5 mL of Oxygen (O₂) first by running the electrolysis!');
        return;
      }
      this.sound.playOxygenRelight();
      this.state.triggerSplintTest('oxygen');
    });

    // Reset
    this.resetBtn.addEventListener('click', () => {
      this.sound.playSwitchClick();
      this.state.resetCurrentMode();
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

    // Interactive Tap Clicks on Canvas
    this.canvas.addEventListener('click', (e) => {
      if (this.state.mode !== 'water_splitting') return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const h2Tap = this.renderer.interactiveBounds.h2Tap;
      const o2Tap = this.renderer.interactiveBounds.o2Tap;

      if (h2Tap && x >= h2Tap.x && x <= h2Tap.x + h2Tap.w && y >= h2Tap.y && y <= h2Tap.y + h2Tap.h) {
        this.testH2Btn.click();
      } else if (o2Tap && x >= o2Tap.x && x <= o2Tap.x + o2Tap.w && y >= o2Tap.y && y <= o2Tap.y + o2Tap.h) {
        this.testO2Btn.click();
      }
    });
  }

  subscribeState() {
    this.state.subscribe((eventType, data) => {
      if (eventType === 'mode_change') {
        this.updateModeUI(data.mode);
        this.updateStaticContent();
      } else if (eventType === 'power_toggle') {
        this.updatePowerUI(data.powerOn);
      } else if (eventType === 'quest_completed') {
        this.sound.playQuestChime();
        this.renderQuests();
      } else if (eventType === 'reset') {
        this.renderQuests();
      }
    });

    this.renderQuests();
  }

  updateModeUI(mode) {
    if (mode === 'water_splitting') {
      this.modeWaterBtn.classList.add('active');
      this.modePlateBtn.classList.remove('active');
      this.testH2Btn.style.display = 'inline-flex';
      this.testO2Btn.style.display = 'inline-flex';
    } else {
      this.modeWaterBtn.classList.remove('active');
      this.modePlateBtn.classList.add('active');
      this.testH2Btn.style.display = 'none';
      this.testO2Btn.style.display = 'none';
    }
  }

  updatePowerUI(powerOn) {
    if (powerOn) {
      this.powerBtn.classList.add('active');
      this.powerBtn.innerHTML = '⏻ STOP CURRENT';
    } else {
      this.powerBtn.classList.remove('active');
      this.powerBtn.innerHTML = '⏻ START CURRENT';
    }
  }

  updateStaticContent() {
    if (this.state.mode === 'water_splitting') {
      this.reactionTitle.textContent = 'Electrolysis of Water (Acidified H₂SO₄)';
      this.equationBlock.textContent = '2H₂O (l)  →  2H₂ (g) [Cathode]  +  O₂ (g) [Anode]  (Stoichiometric Ratio = 2 : 1)';

      this.card1Title.textContent = 'POTENTIAL / EMF';
      this.card1Unit.textContent = 'Volts (DC)';

      this.card2Title.textContent = 'FARADAIC CURRENT';
      this.card2Unit.textContent = 'Amperes (I)';

      this.card3Title.textContent = 'H₂ GAS (CATHODE)';
      this.card3Unit.textContent = 'mL collected';

      this.card4Title.textContent = 'O₂ GAS (ANODE)';
      this.card4Unit.textContent = 'mL collected';
    } else {
      this.reactionTitle.textContent = 'Copper Electroplating in CuSO₄ Solution';
      this.equationBlock.textContent = 'Cu (s) [Anode] → Cu²⁺ (aq) + 2e⁻  |  Cu²⁺ (aq) + 2e⁻ → Cu (s) [Iron Key Cathode]';

      this.card1Title.textContent = 'POTENTIAL / EMF';
      this.card1Unit.textContent = 'Volts (DC)';

      this.card2Title.textContent = 'DEPOSITION CURRENT';
      this.card2Unit.textContent = 'Amperes (I)';

      this.card3Title.textContent = 'PLATED COPPER';
      this.card3Unit.textContent = 'mg deposited';

      this.card4Title.textContent = 'COATING THICKNESS';
      this.card4Unit.textContent = 'micrometers (µm)';
    }
  }

  renderTelemetry() {
    this.card1Val.textContent = `${this.state.voltage.toFixed(1)}`;
    this.card2Val.textContent = `${this.state.current.toFixed(2)}`;

    if (this.state.mode === 'water_splitting') {
      this.card3Val.textContent = `${this.state.h2Volume.toFixed(2)}`;
      this.card4Val.textContent = `${this.state.o2Volume.toFixed(2)}`;
    } else {
      this.card3Val.textContent = `${this.state.cuMassPlated.toFixed(2)}`;
      this.card4Val.textContent = `${this.state.platingThicknessUm.toFixed(2)}`;
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

window.ElectrolysisUI = ElectrolysisUI;
