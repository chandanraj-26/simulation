/**
 * Rutherford Alpha Scattering — UI Controller & DOM Binder
 * Binds view mode tabs, model switcher, detector rotation slider,
 * telemetry updates, quest tracking, and modal manual.
 */

class RutherfordUI {
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
    this.viewMacroBtn = document.getElementById('viewMacroBtn');
    this.viewMicroBtn = document.getElementById('viewMicroBtn');
    this.modelRutherfordBtn = document.getElementById('modelRutherfordBtn');
    this.modelThomsonBtn = document.getElementById('modelThomsonBtn');

    // Controls
    this.beamBtn = document.getElementById('beamBtn');
    this.detectorSlider = document.getElementById('detectorSlider');
    this.detectorAngleVal = document.getElementById('detectorAngleVal');
    this.beamRateSlider = document.getElementById('beamRateSlider');
    this.beamRateVal = document.getElementById('beamRateVal');
    this.targetMetalSelect = document.getElementById('targetMetalSelect');
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

    // Reaction Banner & Quests
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
    // View Mode
    this.viewMacroBtn.addEventListener('click', () => {
      this.sound.playDialRatchet();
      this.state.setViewMode('macro_bench');
    });

    this.viewMicroBtn.addEventListener('click', () => {
      this.sound.playDialRatchet();
      this.state.setViewMode('micro_nuclear');
    });

    // Model Switcher
    this.modelRutherfordBtn.addEventListener('click', () => {
      this.sound.playDialRatchet();
      this.state.setModel('rutherford');
    });

    this.modelThomsonBtn.addEventListener('click', () => {
      this.sound.playDialRatchet();
      this.state.setModel('thomson');
    });

    // Beam Toggle
    this.beamBtn.addEventListener('click', () => {
      this.sound.playDialRatchet();
      this.state.toggleBeam();
      this.beamBtn.textContent = this.state.beamActive ? '⏸ Pause Alpha Beam' : '▶ Fire Alpha Beam';
      this.beamBtn.classList.toggle('active', !this.state.beamActive);
    });

    // Detector Rotation Angle Slider
    this.detectorSlider.addEventListener('input', (e) => {
      const angle = parseFloat(e.target.value);
      this.detectorAngleVal.textContent = `${angle.toFixed(0)}°`;
      this.state.setDetectorAngle(angle);
      if (Math.abs(angle % 15) === 0) {
        this.sound.playDialRatchet();
      }
    });

    // Beam Rate Slider
    this.beamRateSlider.addEventListener('input', (e) => {
      const rate = parseInt(e.target.value);
      this.state.beamRate = rate;
      this.beamRateVal.textContent = `${rate}x`;
    });

    // Target Metal Select
    this.targetMetalSelect.addEventListener('change', (e) => {
      this.sound.playDialRatchet();
      this.state.setTargetMetal(e.target.value);
    });

    // Reset Statistics
    this.resetBtn.addEventListener('click', () => {
      this.sound.playDialRatchet();
      this.state.resetStats();
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
      if (eventType === 'view_mode_change') {
        this.viewMacroBtn.classList.toggle('active', data.mode === 'macro_bench');
        this.viewMicroBtn.classList.toggle('active', data.mode === 'micro_nuclear');
        this.updateStaticContent();
      } else if (eventType === 'model_change') {
        this.modelRutherfordBtn.classList.toggle('active', data.model === 'rutherford');
        this.modelThomsonBtn.classList.toggle('active', data.model === 'thomson');
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

  updateStaticContent() {
    if (this.state.model === 'rutherford') {
      this.reactionTitle.textContent = 'Rutherford Planetary Nuclear Model (1911)';
      this.equationBlock.textContent = 'b = (z · Z · e²) / (4πε₀ · m · v²) · cot(θ / 2)   |   N(θ) ∝ 1 / sin⁴(θ / 2)';
      this.explanationText.textContent = RUTHERFORD_DATA.models.rutherford.desc;
    } else {
      this.reactionTitle.textContent = "J.J. Thomson 'Plum Pudding' Model (1904)";
      this.equationBlock.textContent = 'E_internal = (Q_total · r) / (4πε₀ · R³)   |   Maximum Possible θ < 1°';
      this.explanationText.textContent = RUTHERFORD_DATA.models.thomson.desc;
    }
  }

  renderTelemetry() {
    const total = this.state.totalCount;
    this.card1Val.textContent = `${total}`;
    this.card1Unit.textContent = 'Alphas Tracked';

    const undefPct = total > 0 ? ((this.state.undeflectedCount / total) * 100).toFixed(1) : '100.0';
    this.card2Val.textContent = `${undefPct}%`;
    this.card2Unit.textContent = `Undeflected (θ < 5°) [${this.state.undeflectedCount}]`;

    const defPct = total > 0 ? ((this.state.deflectedCount / total) * 100).toFixed(2) : '0.00';
    this.card3Val.textContent = `${defPct}%`;
    this.card3Unit.textContent = `Scattered (5° ≤ θ < 90°) [${this.state.deflectedCount}]`;

    this.card4Val.textContent = `${this.state.backscatteredCount}`;
    const ratio = this.state.backscatteredCount > 0 ? `1 in ~${Math.round(total / this.state.backscatteredCount)}` : '0 detected yet';
    this.card4Unit.textContent = `Backscatter (θ ≥ 90°) [${ratio}]`;
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

window.RutherfordUI = RutherfordUI;
