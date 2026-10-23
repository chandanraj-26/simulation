/**
 * MicroscopeSim — UI Controller
 * Manages DOM controls, objective nosepiece buttons, stage X-Y vernier calipers,
 * coarse/fine focus dials, cell tagging tools, Mitotic Index scorecard, and modal dialogs.
 */

class MicroscopeUI {
  constructor(state, engine) {
    this.state = state;
    this.engine = engine;

    this.cacheElements();
    this.bindEvents();
    this.updateTelemetry();
    this.renderQuestsList();
  }

  cacheElements() {
    // Specimen slide buttons
    this.btnSlideOnion = document.getElementById('btnSlideOnion');
    this.btnSlideWhitefish = document.getElementById('btnSlideWhitefish');
    this.btnSlideMicrometer = document.getElementById('btnSlideMicrometer');

    // Objective nosepiece buttons
    this.objButtons = [
      { btn: document.getElementById('btnObj4x'), obj: '4x' },
      { btn: document.getElementById('btnObj10x'), obj: '10x' },
      { btn: document.getElementById('btnObj40x'), obj: '40x' },
      { btn: document.getElementById('btnObj100x'), obj: '100x' }
    ];

    // Focus sliders & readouts
    this.sliderCoarse = document.getElementById('sliderCoarse');
    this.sliderFine = document.getElementById('sliderFine');
    this.valCoarse = document.getElementById('valCoarse');
    this.valFine = document.getElementById('valFine');

    // Stage translation buttons
    this.btnStageUp = document.getElementById('btnStageUp');
    this.btnStageDown = document.getElementById('btnStageDown');
    this.btnStageLeft = document.getElementById('btnStageLeft');
    this.btnStageRight = document.getElementById('btnStageRight');
    this.btnStageCenter = document.getElementById('btnStageCenter');
    this.lblStageCoords = document.getElementById('lblStageCoords');

    // Substage illumination controls
    this.sliderLight = document.getElementById('sliderLight');
    this.valLight = document.getElementById('valLight');
    this.sliderIris = document.getElementById('sliderIris');
    this.valIris = document.getElementById('valIris');
    this.btnImmersionOil = document.getElementById('btnImmersionOil');
    this.btnGraticule = document.getElementById('btnGraticule');

    // Cell tagging tool buttons
    this.tagButtons = [
      { btn: document.getElementById('btnToolInspect'), tool: 'inspect' },
      { btn: document.getElementById('btnToolInterphase'), tool: 'interphase' },
      { btn: document.getElementById('btnToolProphase'), tool: 'prophase' },
      { btn: document.getElementById('btnToolMetaphase'), tool: 'metaphase' },
      { btn: document.getElementById('btnToolAnaphase'), tool: 'anaphase' },
      { btn: document.getElementById('btnToolTelophase'), tool: 'telophase' }
    ];
    this.btnClearTags = document.getElementById('btnClearTags');

    // Telemetry Cards & Scorecard
    this.cardMag = document.getElementById('cardMag');
    this.cardClarity = document.getElementById('cardClarity');
    this.cardStage = document.getElementById('cardStage');
    this.cardMitoticIndex = document.getElementById('cardMitoticIndex');

    this.tallyInterphase = document.getElementById('tallyInterphase');
    this.tallyProphase = document.getElementById('tallyProphase');
    this.tallyMetaphase = document.getElementById('tallyMetaphase');
    this.tallyAnaphase = document.getElementById('tallyAnaphase');
    this.tallyTelophase = document.getElementById('tallyTelophase');
    this.tallyTotal = document.getElementById('tallyTotal');
    this.valMitoticIndexScore = document.getElementById('valMitoticIndexScore');

    // Header Actions
    this.btnAudioToggle = document.getElementById('btnAudioToggle');
    this.btnResetAll = document.getElementById('btnResetAll');
    this.btnOpenQuests = document.getElementById('btnOpenQuests');
    this.btnOpenTheory = document.getElementById('btnOpenTheory');
    this.questBadgeCount = document.getElementById('questBadgeCount');

    // Modals
    this.modalQuests = document.getElementById('modalQuests');
    this.btnCloseQuests = document.getElementById('btnCloseQuests');
    this.questsContainer = document.getElementById('questsContainer');

    this.modalTheory = document.getElementById('modalTheory');
    this.btnCloseTheory = document.getElementById('btnCloseTheory');

    this.modalCellDetail = document.getElementById('modalCellDetail');
    this.btnCloseCell = document.getElementById('btnCloseCell');
    this.cellModalTitle = document.getElementById('cellModalTitle');
    this.cellModalDesc = document.getElementById('cellModalDesc');
    this.cellModalFeatures = document.getElementById('cellModalFeatures');
    this.cellModalMolecular = document.getElementById('cellModalMolecular');
  }

  bindEvents() {
    // Audio unlock on user touch/click
    const unlockAudio = () => {
      if (window.microscopeSound) window.microscopeSound.resume();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    // Slide Selection
    const slideBtns = [
      { btn: this.btnSlideOnion, slide: 'onion' },
      { btn: this.btnSlideWhitefish, slide: 'whitefish' },
      { btn: this.btnSlideMicrometer, slide: 'micrometer' }
    ];

    slideBtns.forEach(({ btn, slide }) => {
      if (btn) {
        btn.addEventListener('click', () => {
          slideBtns.forEach(s => s.btn && s.btn.classList.remove('active'));
          btn.classList.add('active');
          this.state.setSlide(slide);
          if (window.microscopeSound) window.microscopeSound.playObjectiveClick();
        });
      }
    });

    // Objective Nosepiece Selection
    this.objButtons.forEach(({ btn, obj }) => {
      if (btn) {
        btn.addEventListener('click', () => {
          this.objButtons.forEach(o => o.btn && o.btn.classList.remove('active'));
          btn.classList.add('active');
          this.state.setObjective(obj);
          if (window.microscopeSound) window.microscopeSound.playObjectiveClick();
        });
      }
    });

    // Focus Sliders
    if (this.sliderCoarse) {
      this.sliderCoarse.addEventListener('input', (e) => {
        this.state.setCoarseFocus(e.target.value);
        if (this.valCoarse) this.valCoarse.textContent = `${this.state.coarseFocus}%`;
        if (window.microscopeSound) window.microscopeSound.playFocusTick();
      });
    }

    if (this.sliderFine) {
      this.sliderFine.addEventListener('input', (e) => {
        this.state.setFineFocus(e.target.value);
        if (this.valFine) this.valFine.textContent = `${this.state.fineFocus}%`;
        if (window.microscopeSound) window.microscopeSound.playFocusTick();
      });
    }

    // Stage Translation Controls
    const step = 25;
    if (this.btnStageUp) {
      this.btnStageUp.addEventListener('click', () => this.state.setStageXY(this.state.stageX, this.state.stageY + step));
    }
    if (this.btnStageDown) {
      this.btnStageDown.addEventListener('click', () => this.state.setStageXY(this.state.stageX, this.state.stageY - step));
    }
    if (this.btnStageLeft) {
      this.btnStageLeft.addEventListener('click', () => this.state.setStageXY(this.state.stageX + step, this.state.stageY));
    }
    if (this.btnStageRight) {
      this.btnStageRight.addEventListener('click', () => this.state.setStageXY(this.state.stageX - step, this.state.stageY));
    }
    if (this.btnStageCenter) {
      this.btnStageCenter.addEventListener('click', () => this.state.setStageXY(0, 0));
    }

    // Substage Optics
    if (this.sliderLight) {
      this.sliderLight.addEventListener('input', (e) => {
        this.state.setLightIntensity(e.target.value);
        if (this.valLight) this.valLight.textContent = `${Math.round(this.state.lightIntensity * 100)}%`;
      });
    }

    if (this.sliderIris) {
      this.sliderIris.addEventListener('input', (e) => {
        this.state.setIrisDiaphragm(e.target.value);
        if (this.valIris) this.valIris.textContent = `${Math.round(this.state.irisDiaphragm * 100)}%`;
      });
    }

    if (this.btnImmersionOil) {
      this.btnImmersionOil.addEventListener('click', () => {
        const active = this.state.toggleImmersionOil();
        this.btnImmersionOil.classList.toggle('active', active);
        this.btnImmersionOil.innerHTML = active ? '💧 Oil: APPLIED' : '💧 Immersion Oil';
        if (window.microscopeSound) window.microscopeSound.playTagPop();
      });
    }

    if (this.btnGraticule) {
      this.btnGraticule.addEventListener('click', () => {
        const active = this.state.toggleGraticule();
        this.btnGraticule.classList.toggle('active', active);
        if (window.microscopeSound) window.microscopeSound.playTagPop();
      });
    }

    // Cell Tagging Tool Palette
    this.tagButtons.forEach(({ btn, tool }) => {
      if (btn) {
        btn.addEventListener('click', () => {
          this.tagButtons.forEach(t => t.btn && t.btn.classList.remove('active'));
          btn.classList.add('active');
          this.state.setActiveTagTool(tool);
          if (window.microscopeSound) window.microscopeSound.playTagPop();
        });
      }
    });

    if (this.btnClearTags) {
      this.btnClearTags.addEventListener('click', () => {
        this.state.taggedCells = {};
        this.state.recomputeTally();
        this.updateTelemetry();
        if (window.microscopeSound) window.microscopeSound.playObjectiveClick();
      });
    }

    // Audio Toggle
    if (this.btnAudioToggle) {
      this.btnAudioToggle.addEventListener('click', () => {
        const active = this.state.toggleSound();
        this.btnAudioToggle.innerHTML = active ? '🔊 Sound: ON' : '🔇 Sound: OFF';
        this.btnAudioToggle.classList.toggle('active', active);
      });
    }

    // Reset All
    if (this.btnResetAll) {
      this.btnResetAll.addEventListener('click', () => {
        this.state.reset();
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

    if (this.btnCloseCell && this.modalCellDetail) {
      this.btnCloseCell.addEventListener('click', () => {
        this.modalCellDetail.classList.remove('active');
      });
    }

    // State change events
    this.state.subscribe((event, payload) => {
      if (event === 'cell_inspect') {
        this.showCellDetailModal(payload.cell);
      } else if (event === 'quest_completed') {
        this.showQuestNotification(payload.quest);
        this.renderQuestsList();
        if (window.microscopeSound) window.microscopeSound.playChime();
      }
    });
  }

  syncControls() {
    // Reset inputs to match state
    if (this.sliderCoarse) this.sliderCoarse.value = this.state.coarseFocus;
    if (this.sliderFine) this.sliderFine.value = this.state.fineFocus;
    if (this.valCoarse) this.valCoarse.textContent = `${this.state.coarseFocus}%`;
    if (this.valFine) this.valFine.textContent = `${this.state.fineFocus}%`;

    if (this.sliderLight) this.sliderLight.value = this.state.lightIntensity;
    if (this.sliderIris) this.sliderIris.value = this.state.irisDiaphragm;
    if (this.valLight) this.valLight.textContent = `${Math.round(this.state.lightIntensity * 100)}%`;
    if (this.valIris) this.valIris.textContent = `${Math.round(this.state.irisDiaphragm * 100)}%`;

    if (this.btnImmersionOil) {
      this.btnImmersionOil.classList.remove('active');
      this.btnImmersionOil.innerHTML = '💧 Immersion Oil';
    }

    this.objButtons.forEach(({ btn, obj }) => {
      if (btn) btn.classList.toggle('active', obj === this.state.objective);
    });

    this.updateTelemetry();
  }

  updateTelemetry() {
    const totalMag = this.state.getTotalMagnification();
    const clarityPct = Math.round(this.state.clarity * 100);

    if (this.cardMag) this.cardMag.textContent = `${totalMag}× (${this.state.objective})`;
    if (this.cardClarity) this.cardClarity.textContent = `${clarityPct}%`;
    if (this.cardStage) this.cardStage.textContent = `X: ${Math.round(this.state.stageX)} µm | Y: ${Math.round(this.state.stageY)} µm`;
    if (this.lblStageCoords) this.lblStageCoords.textContent = `(${Math.round(this.state.stageX)}, ${Math.round(this.state.stageY)}) µm`;

    const tally = this.state.tally;
    if (this.cardMitoticIndex) this.cardMitoticIndex.textContent = `${tally.mitoticIndex}% (${tally.dividingCounted}/${tally.totalCounted})`;

    // Scorecard table
    if (this.tallyInterphase) this.tallyInterphase.textContent = tally.interphase;
    if (this.tallyProphase) this.tallyProphase.textContent = tally.prophase;
    if (this.tallyMetaphase) this.tallyMetaphase.textContent = tally.metaphase;
    if (this.tallyAnaphase) this.tallyAnaphase.textContent = tally.anaphase;
    if (this.tallyTelophase) this.tallyTelophase.textContent = tally.telophase;
    if (this.tallyTotal) this.tallyTotal.textContent = tally.totalCounted;
    if (this.valMitoticIndexScore) this.valMitoticIndexScore.textContent = `${tally.mitoticIndex}%`;
  }

  showCellDetailModal(cell) {
    if (!this.modalCellDetail) return;
    const stageInfo = window.cellsData.stageDescriptions[cell.stage];
    if (!stageInfo) return;

    if (this.cellModalTitle) this.cellModalTitle.textContent = `🔬 Cell Inspection: ${stageInfo.name}`;
    if (this.cellModalDesc) this.cellModalDesc.textContent = stageInfo.desc;

    if (this.cellModalFeatures) {
      this.cellModalFeatures.innerHTML = '';
      stageInfo.keyFeatures.forEach(feat => {
        const li = document.createElement('li');
        li.textContent = feat;
        this.cellModalFeatures.appendChild(li);
      });
    }

    if (this.cellModalMolecular) {
      this.cellModalMolecular.textContent = stageInfo.molecularEvents;
    }

    this.modalCellDetail.classList.add('active');
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
        <strong>Cytology Lab Mission Accomplished!</strong>
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

// Global UI singleton
window.MicroscopeUI = MicroscopeUI;
