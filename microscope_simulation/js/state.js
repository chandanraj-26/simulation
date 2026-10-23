/**
 * MicroscopeSim — State Management Store
 * Manages microscope optics, objective nosepiece, stage XY calipers,
 * focus planes, illumination, cell tagging dictionary, mitotic index, and laboratory quests.
 */

class MicroscopeState {
  constructor() {
    // Current Specimen Slide
    this.slide = 'onion'; // 'onion' | 'whitefish' | 'micrometer'

    // Optical System
    this.objective = '10x'; // '4x' | '10x' | '40x' | '100x'
    this.eyepieceMag = 10; // 10x standard ocular lens
    this.stageX = 0; // Stage translation offsets in micrometers
    this.stageY = 0;
    this.coarseFocus = 50; // 0 - 100 (optimal 50)
    this.fineFocus = 50;   // 0 - 100 (optimal 50)
    this.clarity = 1.0;    // Live optical clarity [0.0 - 1.0]

    // Illumination & Substage Optics
    this.lightIntensity = 0.85; // 0.1 to 1.0
    this.irisDiaphragm = 0.80;  // 0.2 to 1.0 (aperture contrast)
    this.hasImmersionOil = false; // Required for 100x objective

    // Display overlays
    this.showGraticule = false; // Ocular micrometer reticle
    this.showPhaseGuides = true; // Visual outline highlights

    // Interactive Cell Tagging & Mitotic Index
    this.activeTagTool = 'inspect'; // 'inspect' | 'interphase' | 'prophase' | 'metaphase' | 'anaphase' | 'telophase'
    this.taggedCells = {}; // { [cellId]: tagString }
    this.selectedCell = null; // Cell currently opened in detail modal

    this.tally = {
      interphase: 0,
      prophase: 0,
      metaphase: 0,
      anaphase: 0,
      telophase: 0,
      totalCounted: 0,
      dividingCounted: 0,
      mitoticIndex: 0.0
    };

    // Audio
    this.soundEnabled = true;

    // Laboratory Quests
    this.quests = [
      {
        id: 'quest-focus-400x',
        title: 'High-Power Focus Calibration',
        desc: 'Switch to the 40× objective (400× total magnification) and adjust Coarse & Fine focus to achieve >90% optical clarity.',
        completed: false
      },
      {
        id: 'quest-find-metaphase',
        title: 'Locate the Metaphase Equatorial Plate',
        desc: 'Find and tag a cell in Metaphase with sister chromatids neatly aligned along the equatorial spindle plate.',
        completed: false
      },
      {
        id: 'quest-find-anaphase',
        title: 'Catch Anaphase Chromatid Separation',
        desc: 'Locate and tag an Anaphase cell showing V-shaped sister chromatids actively migrating to opposite spindle poles.',
        completed: false
      },
      {
        id: 'quest-mitotic-index',
        title: 'Calculate Meristematic Mitotic Index',
        desc: 'Tag at least 15 cells in the tissue slice to calculate the biological Mitotic Index of the apical meristem.',
        completed: false
      },
      {
        id: 'quest-oil-immersion',
        title: '1000× Oil Immersion Resolution',
        desc: 'Switch to the 100× objective, apply Immersion Oil, and fine-focus to observe chromatin condensation at 1000×.',
        completed: false
      }
    ];

    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify(event, payload) {
    for (const listener of this.listeners) {
      listener(event, payload, this);
    }
  }

  getTotalMagnification() {
    const objNum = parseInt(this.objective, 10);
    return this.eyepieceMag * objNum;
  }

  setSlide(slideType) {
    this.slide = slideType;
    this.stageX = 0;
    this.stageY = 0;
    this.taggedCells = {};
    this.recomputeTally();
    this.notify('slide_change', { slide: this.slide });
  }

  setObjective(obj) {
    const prevObj = this.objective;
    this.objective = obj;

    // Slight focus drift when switching par-focal objectives
    if (obj === '40x' || obj === '100x') {
      this.fineFocus = 46 + (Math.random() - 0.5) * 8;
    }

    this.checkQuests();
    this.notify('objective_change', { objective: this.objective, prevObjective: prevObj });
  }

  setCoarseFocus(val) {
    this.coarseFocus = Math.max(0, Math.min(100, parseFloat(val)));
    this.checkQuests();
    this.notify('focus_change', { coarse: this.coarseFocus, fine: this.fineFocus });
  }

  setFineFocus(val) {
    this.fineFocus = Math.max(0, Math.min(100, parseFloat(val)));
    this.checkQuests();
    this.notify('focus_change', { coarse: this.coarseFocus, fine: this.fineFocus });
  }

  setStageXY(x, y) {
    this.stageX = Math.max(-300, Math.min(300, x));
    this.stageY = Math.max(-300, Math.min(300, y));
    this.notify('stage_change', { stageX: this.stageX, stageY: this.stageY });
  }

  setLightIntensity(val) {
    this.lightIntensity = Math.max(0.1, Math.min(1.0, parseFloat(val)));
    this.notify('light_change', { light: this.lightIntensity });
  }

  setIrisDiaphragm(val) {
    this.irisDiaphragm = Math.max(0.2, Math.min(1.0, parseFloat(val)));
    this.notify('iris_change', { iris: this.irisDiaphragm });
  }

  toggleImmersionOil() {
    this.hasImmersionOil = !this.hasImmersionOil;
    this.checkQuests();
    this.notify('oil_change', { hasOil: this.hasImmersionOil });
    return this.hasImmersionOil;
  }

  toggleGraticule() {
    this.showGraticule = !this.showGraticule;
    this.notify('graticule_change', { showGraticule: this.showGraticule });
    return this.showGraticule;
  }

  togglePhaseGuides() {
    this.showPhaseGuides = !this.showPhaseGuides;
    this.notify('guides_change', { showGuides: this.showPhaseGuides });
    return this.showPhaseGuides;
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.notify('sound_change', { soundEnabled: this.soundEnabled });
    return this.soundEnabled;
  }

  setActiveTagTool(tool) {
    this.activeTagTool = tool;
    this.notify('tool_change', { tool: this.activeTagTool });
  }

  tagCell(cellId, stageTag) {
    if (stageTag === 'clear') {
      delete this.taggedCells[cellId];
    } else {
      this.taggedCells[cellId] = stageTag;
    }
    this.recomputeTally();
    this.checkQuests();
    this.notify('cell_tagged', { cellId, stage: stageTag });
  }

  recomputeTally() {
    const counts = {
      interphase: 0,
      prophase: 0,
      metaphase: 0,
      anaphase: 0,
      telophase: 0
    };

    let total = 0;
    for (const tag of Object.values(this.taggedCells)) {
      if (counts[tag] !== undefined) {
        counts[tag]++;
        total++;
      }
    }

    const dividing = counts.prophase + counts.metaphase + counts.anaphase + counts.telophase;
    const mi = total > 0 ? parseFloat(((dividing / total) * 100).toFixed(1)) : 0.0;

    this.tally.interphase = counts.interphase;
    this.tally.prophase = counts.prophase;
    this.tally.metaphase = counts.metaphase;
    this.tally.anaphase = counts.anaphase;
    this.tally.telophase = counts.telophase;
    this.tally.totalCounted = total;
    this.tally.dividingCounted = dividing;
    this.tally.mitoticIndex = mi;
  }

  checkQuests() {
    // Quest 1: 40x focus calibration
    if (this.objective === '40x' && this.clarity > 0.90) {
      this.completeQuest('quest-focus-400x');
    }

    // Quest 2 & 3: Find Metaphase & Anaphase
    for (const [id, tag] of Object.entries(this.taggedCells)) {
      const cell = window.cellsData && window.cellsData.getCellById(this.slide, id);
      if (cell) {
        if (tag === 'metaphase' && cell.stage === 'metaphase') {
          this.completeQuest('quest-find-metaphase');
        }
        if (tag === 'anaphase' && cell.stage === 'anaphase') {
          this.completeQuest('quest-find-anaphase');
        }
      }
    }

    // Quest 4: Mitotic index count >= 15
    if (this.tally.totalCounted >= 15) {
      this.completeQuest('quest-mitotic-index');
    }

    // Quest 5: 100x Oil immersion
    if (this.objective === '100x' && this.hasImmersionOil && this.clarity > 0.85) {
      this.completeQuest('quest-oil-immersion');
    }
  }

  completeQuest(questId) {
    const q = this.quests.find(item => item.id === questId);
    if (q && !q.completed) {
      q.completed = true;
      this.notify('quest_completed', { quest: q });
    }
  }

  reset() {
    this.slide = 'onion';
    this.objective = '10x';
    this.stageX = 0;
    this.stageY = 0;
    this.coarseFocus = 50;
    this.fineFocus = 50;
    this.lightIntensity = 0.85;
    this.irisDiaphragm = 0.80;
    this.hasImmersionOil = false;
    this.showGraticule = false;
    this.taggedCells = {};
    this.recomputeTally();
    this.notify('reset', {});
  }
}

// Global microscope state singleton
window.microscopeState = new MicroscopeState();
