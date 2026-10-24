/**
 * Law of Conservation of Mass — UI Controller & DOM Binder
 * Binds reaction system tabs, tilting trigger, cork toggle,
 * tare button, telemetry cards, and NCERT curriculum quests.
 */

class MassUI {
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
    // System Tabs
    this.sysBariumBtn = document.getElementById('sysBariumBtn');
    this.sysLeadBtn = document.getElementById('sysLeadBtn');
    this.sysGasBtn = document.getElementById('sysGasBtn');

    // Controls
    this.tiltBtn = document.getElementById('tiltBtn');
    this.corkBtn = document.getElementById('corkBtn');
    this.tareBtn = document.getElementById('tareBtn');
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

    // Reaction Banner & Breakdown
    this.reactionTitle = document.getElementById('reactionTitle');
    this.equationBlock = document.getElementById('equationBlock');
    this.explanationText = document.getElementById('explanationText');
    this.massBreakdownBody = document.getElementById('massBreakdownBody');
    this.questList = document.getElementById('questList');

    // Modal
    this.guideModal = document.getElementById('guideModal');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.modalGotItBtn = document.getElementById('modalGotItBtn');
  }

  bindEvents() {
    // System Tabs
    this.sysBariumBtn.addEventListener('click', () => {
      this.sound.playBeep();
      this.state.setSystem('barium_sodium');
    });

    this.sysLeadBtn.addEventListener('click', () => {
      this.sound.playBeep();
      this.state.setSystem('lead_potassium');
    });

    this.sysGasBtn.addEventListener('click', () => {
      this.sound.playBeep();
      this.state.setSystem('calcium_acid');
    });

    // Tilt & Mix
    this.tiltBtn.addEventListener('click', () => {
      if (this.state.mixed) {
        alert('Solutions have already been mixed! Click "Reset Apparatus" to run a fresh trial.');
        return;
      }
      this.state.tiltFlask();
    });

    // Cork Toggle
    this.corkBtn.addEventListener('click', () => {
      this.sound.playCorkClick();
      this.state.toggleCork();
      this.corkBtn.textContent = this.state.isCorked ? '🔒 Remove Cork' : '🔓 Seal with Cork';
    });

    // Tare Button
    this.tareBtn.addEventListener('click', () => {
      this.sound.playTareBeep();
      this.state.tareScale();
      this.tareBtn.textContent = this.state.isTared ? '↺ Zero Tare' : '⊘ Tare Scale';
    });

    // Reset Apparatus
    this.resetBtn.addEventListener('click', () => {
      this.sound.playBeep();
      this.state.resetApparatus();
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
      if (eventType === 'system_change') {
        this.updateSystemTabs(data.systemId);
        this.updateStaticContent();
      } else if (eventType === 'cork_toggle' || eventType === 'reset') {
        this.updateStaticContent();
      } else if (eventType === 'quest_completed') {
        this.sound.playQuestChime();
        this.renderQuests();
      }
    });

    this.renderQuests();
  }

  updateSystemTabs(sysId) {
    this.sysBariumBtn.classList.toggle('active', sysId === 'barium_sodium');
    this.sysLeadBtn.classList.toggle('active', sysId === 'lead_potassium');
    this.sysGasBtn.classList.toggle('active', sysId === 'calcium_acid');
  }

  updateStaticContent() {
    const sys = MASS_DATA.systems[this.state.currentSystemId];
    this.reactionTitle.textContent = sys.name;
    this.equationBlock.textContent = sys.equation;
    this.explanationText.textContent = sys.explanation;

    // Mass Breakdown Table
    const flaskTare = MASS_DATA.tareWeights.conicalFlask.toFixed(3);
    const flaskSol = sys.solutionFlask.massG.toFixed(3);
    const tubeWithSol = (MASS_DATA.tareWeights.ignitionTube + sys.solutionTube.massG + MASS_DATA.tareWeights.thread).toFixed(3);
    const corkMass = this.state.isCorked ? MASS_DATA.tareWeights.rubberCork.toFixed(3) : '0.000 (Removed)';
    const totalGross = this.state.getRawMass().toFixed(3);

    this.massBreakdownBody.innerHTML = `
      <tr><td>Conical Flask Tare</td><td>${flaskTare} g</td></tr>
      <tr><td>${sys.solutionFlask.name}</td><td>${flaskSol} g</td></tr>
      <tr><td>Ignition Tube + Contents</td><td>${tubeWithSol} g</td></tr>
      <tr><td>Rubber Cork Seal</td><td>${corkMass} ${this.state.isCorked ? 'g' : ''}</td></tr>
      <tr style="font-weight: 700; border-top: 2px solid #CBD5E1;">
        <td>Total System Mass</td><td>${totalGross} g</td>
      </tr>
    `;
  }

  renderTelemetry() {
    const sys = MASS_DATA.systems[this.state.currentSystemId];
    const displayMass = this.state.getDisplayMass();
    const rawMass = this.state.getRawMass();

    // Initial mass without gas loss
    let initialMass = MASS_DATA.tareWeights.conicalFlask +
                      MASS_DATA.tareWeights.ignitionTube +
                      MASS_DATA.tareWeights.thread +
                      sys.solutionFlask.massG +
                      sys.solutionTube.massG;
    if (this.state.isCorked) initialMass += MASS_DATA.tareWeights.rubberCork;

    const deltaM = rawMass - initialMass;

    this.card1Val.textContent = displayMass.toFixed(3);
    this.card1Unit.textContent = this.state.isTared ? 'Grams (Tared Net)' : 'Grams (Gross Total)';

    this.card2Val.textContent = initialMass.toFixed(3);
    this.card2Unit.textContent = 'Initial Mass m₁ (g)';

    this.card3Val.textContent = `${deltaM >= 0 ? '+' : ''}${deltaM.toFixed(3)}`;
    this.card3Unit.textContent = Math.abs(deltaM) < 0.001 ? 'Δm = 0 (100% Conserved)' : 'Mass Deficit (Gas Escaped)';

    this.card4Val.textContent = this.state.isCorked ? 'SEALED' : 'OPEN / UNSEALED';
    this.card4Unit.textContent = this.state.isCorked ? 'Closed System (Cork on)' : 'Vented to atmosphere';
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

window.MassUI = MassUI;
