/**
 * CardiacSim — User Interface Controller
 * Connects DOM controls, sliders, buttons, modals, quests, and telemetry cards
 * with the state management store and sound/renderer systems.
 */

class CardiacUI {
  constructor(state) {
    this.state = state;
    this.cacheElements();
    this.bindEvents();
    this.updateTelemetry();
    this.renderQuestsList();
  }

  cacheElements() {
    // Mode buttons
    this.btnModeAnatomy = document.getElementById('btnModeAnatomy');
    this.btnModeWiggers = document.getElementById('btnModeWiggers');
    this.btnModeSplit = document.getElementById('btnModeSplit');
    this.btnModeAuscultation = document.getElementById('btnModeAuscultation');

    // Header buttons
    this.btnPlayPause = document.getElementById('btnPlayPause');
    this.btnAudioToggle = document.getElementById('btnAudioToggle');
    this.btnBeepToggle = document.getElementById('btnBeepToggle');
    this.btnResetAll = document.getElementById('btnResetAll');
    this.btnOpenQuests = document.getElementById('btnOpenQuests');
    this.btnOpenTheory = document.getElementById('btnOpenTheory');

    // Zoom buttons
    this.btnZoomIn = document.getElementById('btnZoomIn');
    this.btnZoomOut = document.getElementById('btnZoomOut');
    this.btnZoomFit = document.getElementById('btnZoomFit');
    this.lblZoomLevel = document.getElementById('lblZoomLevel');

    // Step & Speed buttons
    this.btnStepBack = document.getElementById('btnStepBack');
    this.btnStepForward = document.getElementById('btnStepForward');
    this.speedButtons = [
      { btn: document.getElementById('btnSpeed01'), speed: 0.1 },
      { btn: document.getElementById('btnSpeed025'), speed: 0.25 },
      { btn: document.getElementById('btnSpeed05'), speed: 0.5 },
      { btn: document.getElementById('btnSpeed10'), speed: 1.0 }
    ];

    // Phase Scrubber elements
    this.sliderPhase = document.getElementById('sliderPhase');
    this.lblPhasePercent = document.getElementById('lblPhasePercent');
    this.lblPhaseSubName = document.getElementById('lblPhaseSubName');
    this.isDraggingPhaseSlider = false;
    this.phaseButtons = [1, 2, 3, 4, 5, 6, 7].map(n => document.getElementById(`btnPhase${n}`));

    // Controls
    this.sliderBpm = document.getElementById('sliderBpm');
    this.valBpm = document.getElementById('valBpm');
    this.sliderContractility = document.getElementById('sliderContractility');
    this.valContractility = document.getElementById('valContractility');
    this.selectRhythm = document.getElementById('selectRhythm');

    // Presets
    this.btnPresetResting = document.getElementById('btnPresetResting');
    this.btnPresetExercise = document.getElementById('btnPresetExercise');
    this.btnPresetSleep = document.getElementById('btnPresetSleep');

    // Telemetry Cards
    this.cardBpm = document.getElementById('cardBpm');
    this.cardBP = document.getElementById('cardBP');
    this.cardSVEF = document.getElementById('cardSVEF');
    this.cardCO = document.getElementById('cardCO');
    this.cardPhase = document.getElementById('cardPhase');
    this.hudBadgeBpm = document.getElementById('hudBadgeBpm');
    this.hudBadgeCO = document.getElementById('hudBadgeCO');
    this.hudBadgeBP = document.getElementById('hudBadgeBP');

    // Modals
    this.modalQuests = document.getElementById('modalQuests');
    this.modalTheory = document.getElementById('modalTheory');
    this.btnCloseQuests = document.getElementById('btnCloseQuests');
    this.btnCloseTheory = document.getElementById('btnCloseTheory');
    this.questsContainer = document.getElementById('questsContainer');
    this.questBadgeCount = document.getElementById('questBadgeCount');
  }

  bindEvents() {
    // Audio unlock on any first user touch/click
    const unlockAudio = () => {
      if (window.cardiacSound) {
        window.cardiacSound.resume();
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    // Mode Selector
    const modeButtons = [
      { btn: this.btnModeAnatomy, mode: 'anatomy' },
      { btn: this.btnModeWiggers, mode: 'wiggers' },
      { btn: this.btnModeSplit, mode: 'split' },
      { btn: this.btnModeAuscultation, mode: 'auscultation' }
    ];

    modeButtons.forEach(({ btn, mode }) => {
      if (btn) {
        btn.addEventListener('click', () => {
          modeButtons.forEach(b => b.btn.classList.remove('active'));
          btn.classList.add('active');
          this.state.setMode(mode);
          if (window.cardiacSound) window.cardiacSound.resume();
        });
      }
    });

    // Play / Pause
    if (this.btnPlayPause) {
      this.btnPlayPause.addEventListener('click', () => {
        const isRunning = this.state.togglePlayPause();
        this.btnPlayPause.innerHTML = isRunning ? '<span>⏸️</span> Pause' : '<span>▶️</span> Resume';
        this.btnPlayPause.classList.toggle('btn-paused', !isRunning);
      });
    }

    // Audio Toggle
    if (this.btnAudioToggle) {
      this.btnAudioToggle.addEventListener('click', () => {
        const active = this.state.toggleSound();
        this.btnAudioToggle.innerHTML = active ? '🔊 Sound: ON' : '🔇 Sound: OFF';
        this.btnAudioToggle.classList.toggle('active', active);
        if (active && window.cardiacSound) window.cardiacSound.resume();
      });
    }

    // Monitor Beep Toggle
    if (this.btnBeepToggle) {
      this.btnBeepToggle.addEventListener('click', () => {
        const active = this.state.toggleMonitorBeep();
        this.btnBeepToggle.innerHTML = active ? '📟 Beep: ON' : '📟 Beep: OFF';
        this.btnBeepToggle.classList.toggle('active', active);
        if (active && window.cardiacSound) window.cardiacSound.resume();
      });
    }

    // Reset All
    if (this.btnResetAll) {
      this.btnResetAll.addEventListener('click', () => {
        this.state.reset();
        this.syncControls();
      });
    }

    // Zoom controls
    if (this.btnZoomIn) {
      this.btnZoomIn.addEventListener('click', () => {
        this.state.setZoom(this.state.zoom + 0.15);
        this.updateZoomLabel();
      });
    }
    if (this.btnZoomOut) {
      this.btnZoomOut.addEventListener('click', () => {
        this.state.setZoom(this.state.zoom - 0.15);
        this.updateZoomLabel();
      });
    }
    if (this.btnZoomFit) {
      this.btnZoomFit.addEventListener('click', () => {
        this.state.setZoom(1.0);
        this.updateZoomLabel();
      });
    }

    // Step Buttons (Frame-by-frame scrubbing)
    if (this.btnStepBack) {
      this.btnStepBack.addEventListener('click', () => {
        this.state.isRunning = false;
        if (this.btnPlayPause) {
          this.btnPlayPause.innerHTML = '<span>▶️</span> Resume';
          this.btnPlayPause.classList.add('btn-paused');
        }
        this.state.stepPhase(-0.02);
      });
    }

    if (this.btnStepForward) {
      this.btnStepForward.addEventListener('click', () => {
        this.state.isRunning = false;
        if (this.btnPlayPause) {
          this.btnPlayPause.innerHTML = '<span>▶️</span> Resume';
          this.btnPlayPause.classList.add('btn-paused');
        }
        this.state.stepPhase(0.02);
      });
    }

    // Speed Selector Buttons
    this.speedButtons.forEach(({ btn, speed }) => {
      if (btn) {
        btn.addEventListener('click', () => {
          this.speedButtons.forEach(s => s.btn && s.btn.classList.remove('active'));
          btn.classList.add('active');
          this.state.setSimSpeed(speed);
        });
      }
    });

    // Phase Scrubber Slider
    if (this.sliderPhase) {
      this.sliderPhase.addEventListener('mousedown', () => { this.isDraggingPhaseSlider = true; });
      this.sliderPhase.addEventListener('touchstart', () => { this.isDraggingPhaseSlider = true; }, { passive: true });
      this.sliderPhase.addEventListener('mouseup', () => { this.isDraggingPhaseSlider = false; });
      this.sliderPhase.addEventListener('touchend', () => { this.isDraggingPhaseSlider = false; });

      this.sliderPhase.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.state.setPhase(val / 100);
      });
    }

    // 7 Phase Jump Buttons
    this.phaseButtons.forEach((btn, idx) => {
      if (btn) {
        btn.addEventListener('click', () => {
          this.state.jumpToPhaseNumber(idx + 1);
        });
      }
    });

    // Heart Rate Slider
    if (this.sliderBpm) {
      this.sliderBpm.addEventListener('input', (e) => {
        this.state.setBpm(e.target.value);
        if (this.valBpm) this.valBpm.textContent = `${this.state.bpm} BPM`;
      });
    }

    // Contractility Slider
    if (this.sliderContractility) {
      this.sliderContractility.addEventListener('input', (e) => {
        this.state.setContractility(e.target.value);
        if (this.valContractility) this.valContractility.textContent = `${this.state.contractility.toFixed(2)}x`;
      });
    }

    // Rhythm Select
    if (this.selectRhythm) {
      this.selectRhythm.addEventListener('change', (e) => {
        this.state.setRhythm(e.target.value);
        this.syncControls();
      });
    }

    // Presets
    if (this.btnPresetResting) {
      this.btnPresetResting.addEventListener('click', () => {
        this.state.setRhythm('normal');
        this.syncControls();
      });
    }
    if (this.btnPresetExercise) {
      this.btnPresetExercise.addEventListener('click', () => {
        this.state.setRhythm('exercise');
        this.syncControls();
      });
    }
    if (this.btnPresetSleep) {
      this.btnPresetSleep.addEventListener('click', () => {
        this.state.setRhythm('bradycardia');
        this.syncControls();
      });
    }

    // Modals
    if (this.btnOpenQuests && this.modalQuests) {
      this.btnOpenQuests.addEventListener('click', () => {
        this.modalQuests.classList.add('active');
        this.renderQuestsList();
      });
    }
    if (this.btnCloseQuests && this.modalQuests) {
      this.btnCloseQuests.addEventListener('click', () => {
        this.modalQuests.classList.remove('active');
      });
    }

    if (this.btnOpenTheory && this.modalTheory) {
      this.btnOpenTheory.addEventListener('click', () => {
        this.modalTheory.classList.add('active');
      });
    }
    if (this.btnCloseTheory && this.modalTheory) {
      this.btnCloseTheory.addEventListener('click', () => {
        this.modalTheory.classList.remove('active');
      });
    }

    // State change observer
    this.state.subscribe((event, payload) => {
      if (event === 'quest_completed') {
        this.showQuestNotification(payload.quest);
        this.renderQuestsList();
        if (window.cardiacSound) window.cardiacSound.playChime();
      }
    });
  }

  syncControls() {
    if (this.sliderBpm) this.sliderBpm.value = this.state.bpm;
    if (this.valBpm) this.valBpm.textContent = `${this.state.bpm} BPM`;

    if (this.sliderContractility) this.sliderContractility.value = this.state.contractility;
    if (this.valContractility) this.valContractility.textContent = `${this.state.contractility.toFixed(2)}x`;

    if (this.selectRhythm) this.selectRhythm.value = this.state.rhythm;
  }

  updateZoomLabel() {
    if (this.lblZoomLevel) {
      this.lblZoomLevel.textContent = `${Math.round(this.state.zoom * 100)}%`;
    }
  }

  updateTelemetry() {
    const m = this.state.metrics;

    if (this.cardBpm) this.cardBpm.textContent = `${this.state.bpm} BPM`;
    if (this.cardBP) this.cardBP.textContent = `${m.bpSys}/${m.bpDia} mmHg (MAP ${m.map})`;
    if (this.cardSVEF) this.cardSVEF.textContent = `${m.sv} mL (${m.ef}%)`;
    if (this.cardCO) this.cardCO.textContent = `${m.co.toFixed(2)} L/min`;
    if (this.cardPhase) this.cardPhase.textContent = m.currentPhaseName;

    if (this.hudBadgeBpm) this.hudBadgeBpm.textContent = `${this.state.bpm} BPM`;
    if (this.hudBadgeCO) this.hudBadgeCO.textContent = `CO: ${m.co.toFixed(1)} L/min`;
    if (this.hudBadgeBP) this.hudBadgeBP.textContent = `BP: ${m.bpSys}/${m.bpDia}`;

    // Update Phase Scrubber Bar
    if (this.sliderPhase && !this.isDraggingPhaseSlider) {
      this.sliderPhase.value = (this.state.phase * 100).toFixed(1);
    }
    if (this.lblPhasePercent) {
      this.lblPhasePercent.textContent = `${Math.round(this.state.phase * 100)}%`;
    }
    if (this.lblPhaseSubName) {
      this.lblPhaseSubName.textContent = m.currentPhaseName;
    }

    // Highlight active phase button
    const activePhaseNum = m.phaseNumber;
    this.phaseButtons.forEach((btn, idx) => {
      if (btn) {
        btn.classList.toggle('active', (idx + 1) === activePhaseNum);
      }
    });
  }

  renderQuestsList() {
    if (!this.questsContainer) return;
    this.questsContainer.innerHTML = '';

    let completedCount = 0;
    this.state.quests.forEach((q, idx) => {
      if (q.completed) completedCount++;

      const item = document.createElement('div');
      item.className = `quest-card ${q.completed ? 'completed' : ''}`;
      item.innerHTML = `
        <div class="quest-header">
          <span class="quest-status-icon">${q.completed ? '✅' : '🎯'}</span>
          <h4 class="quest-title">${idx + 1}. ${q.title}</h4>
        </div>
        <p class="quest-desc">${q.desc}</p>
        <span class="quest-pill">${q.completed ? 'COMPLETED' : 'IN PROGRESS'}</span>
      `;
      this.questsContainer.appendChild(item);
    });

    if (this.questBadgeCount) {
      this.questBadgeCount.textContent = `${completedCount}/${this.state.quests.length}`;
    }
  }

  showQuestNotification(quest) {
    const toast = document.createElement('div');
    toast.className = 'quest-toast';
    toast.innerHTML = `
      <div style="font-size: 20px;">⭐</div>
      <div>
        <strong>Mission Accomplished!</strong>
        <div>${quest.title}</div>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('visible');
    }, 10);
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }
}

// Global UI instance
window.CardiacUI = CardiacUI;
