/**
 * PeriodicLab — UI Controller & DOM Orchestration
 * Builds the 18-column periodic grid, handles Hinglish mnemonic rendering,
 * search & category filtering, trend heatmaps, modals, and user events.
 */

class UIController {
  constructor() {
    this.gridContainer = document.getElementById('periodicTableGrid');
    this.mnemonicBanner = document.getElementById('mnemonicBanner');
    this.bohrRenderer = null;

    // Modals
    this.quizModal = document.getElementById('quizModal');
    this.theoryModal = document.getElementById('theoryModal');

    // State of matters emoji
    this.stateIcons = {
      solid: '🧊',
      liquid: '💧',
      gas: '💨',
      synthetic: '⚛️'
    };
  }

  init() {
    this.bohrRenderer = new BohrAtomRenderer('bohrCanvas');
    this.buildPeriodicGrid();
    this.bindEvents();
    this.bindModals();

    // Subscribe to state changes
    appState.subscribe((state, prev) => this.handleStateChange(state, prev));

    // Initial render for default element (Calcium Z=20)
    const initialElement = appState.getActiveElement();
    if (initialElement) {
      this.updateProfileSidebar(initialElement);
      this.updateMnemonicBanner(initialElement);
      this.bohrRenderer.setElement(initialElement);
    }
  }

  // Build 18-column grid + headers + Lanthanides/Actinides
  buildPeriodicGrid() {
    if (!this.gridContainer) return;
    this.gridContainer.innerHTML = '';

    // 1. Column 0, Row 0 corner cell
    const cornerCell = document.createElement('div');
    cornerCell.className = 'grid-header-group';
    cornerCell.style.gridColumn = '1';
    cornerCell.style.gridRow = '1';
    cornerCell.innerHTML = 'Z';
    this.gridContainer.appendChild(cornerCell);

    // 2. Group Header numbers 1 to 18 (Row 1, Cols 2 to 19)
    for (let g = 1; g <= 18; g++) {
      const gHeader = document.createElement('div');
      gHeader.className = 'grid-header-group';
      gHeader.style.gridColumn = String(g + 1);
      gHeader.style.gridRow = '1';
      gHeader.innerHTML = `<span>${g}</span>`;
      gHeader.title = `Highlight Group ${g}`;

      gHeader.addEventListener('mouseenter', () => appState.highlightGroup(g));
      gHeader.addEventListener('mouseleave', () => appState.clearHighlights());
      gHeader.addEventListener('click', () => {
        appState.highlightGroup(g);
        // Find first element of this group
        const firstEl = ELEMENTS_DATA.find(el => el.group === g);
        if (firstEl) appState.selectElement(firstEl.z);
      });

      this.gridContainer.appendChild(gHeader);
    }

    // 3. Period Header numbers 1 to 7 (Col 1, Rows 2 to 8)
    for (let p = 1; p <= 7; p++) {
      const pHeader = document.createElement('div');
      pHeader.className = 'grid-header-period';
      pHeader.style.gridColumn = '1';
      pHeader.style.gridRow = String(p + 1);
      pHeader.innerHTML = `<span>${p}</span>`;
      pHeader.title = `Highlight Period ${p}`;

      pHeader.addEventListener('mouseenter', () => appState.highlightPeriod(p));
      pHeader.addEventListener('mouseleave', () => appState.clearHighlights());
      pHeader.addEventListener('click', () => {
        appState.highlightPeriod(p);
        const firstEl = ELEMENTS_DATA.find(el => el.period === p);
        if (firstEl) appState.selectElement(firstEl.z);
      });

      this.gridContainer.appendChild(pHeader);
    }

    // 4. Lanthanide & Actinide Placeholder slots in main table
    // Period 6, Col 3 (Grid Col 4, Grid Row 7)
    const lanthSlot = document.createElement('div');
    lanthSlot.className = 'f-block-slot';
    lanthSlot.style.gridColumn = '4';
    lanthSlot.style.gridRow = '7';
    lanthSlot.innerHTML = `
      <span class="f-block-slot-range">57–71</span>
      <span class="f-block-slot-title">Lanthanides</span>
    `;
    lanthSlot.addEventListener('mouseenter', () => appState.highlightSeries('f4'));
    lanthSlot.addEventListener('mouseleave', () => appState.clearHighlights());
    lanthSlot.addEventListener('click', () => {
      appState.highlightSeries('f4');
      appState.selectElement(57);
    });
    this.gridContainer.appendChild(lanthSlot);

    // Period 7, Col 3 (Grid Col 4, Grid Row 8)
    const actSlot = document.createElement('div');
    actSlot.className = 'f-block-slot';
    actSlot.style.gridColumn = '4';
    actSlot.style.gridRow = '8';
    actSlot.innerHTML = `
      <span class="f-block-slot-range">89–103</span>
      <span class="f-block-slot-title">Actinides</span>
    `;
    actSlot.addEventListener('mouseenter', () => appState.highlightSeries('f5'));
    actSlot.addEventListener('mouseleave', () => appState.clearHighlights());
    actSlot.addEventListener('click', () => {
      appState.highlightSeries('f5');
      appState.selectElement(89);
    });
    this.gridContainer.appendChild(actSlot);

    // 5. Render All 118 Element Cells
    ELEMENTS_DATA.forEach(el => {
      const cell = this.createElementCell(el);
      this.gridContainer.appendChild(cell);
    });
  }

  // Create an individual element cell with coordinates & attributes
  createElementCell(el) {
    const cell = document.createElement('div');
    cell.className = 'element-cell';
    cell.id = `el-cell-${el.z}`;
    cell.dataset.z = el.z;
    cell.dataset.category = el.category;
    cell.dataset.block = el.block;
    cell.dataset.state = el.standardState;
    cell.dataset.group = el.group || '';
    cell.dataset.period = el.period;

    // Grid position mapping:
    // Grid Column: Col 1 is period numbers, so Group 1 is Col 2, Group 18 is Col 19.
    // Grid Row: Row 1 is group numbers, so Period 1 is Row 2, Period 7 is Row 8.
    // Row 9 is empty spacer.
    // Row 10 is Lanthanides (57-71).
    // Row 11 is Actinides (89-103).
    let gridCol, gridRow;

    if (el.z >= 57 && el.z <= 71) {
      // Lanthanides row: Col 4 to Col 18
      gridCol = (el.z - 57) + 4;
      gridRow = 10;
    } else if (el.z >= 89 && el.z <= 103) {
      // Actinides row: Col 4 to Col 18
      gridCol = (el.z - 89) + 4;
      gridRow = 11;
    } else {
      gridCol = el.group + 1;
      gridRow = el.period + 1;
    }

    cell.style.gridColumn = String(gridCol);
    cell.style.gridRow = String(gridRow);

    // Initial Active state check
    if (el.z === appState.getState().activeElementId) {
      cell.classList.add('active');
    }

    const stateIcon = this.stateIcons[el.standardState] || '⚛️';
    const mnemonicWord = el.mnemonic && el.mnemonic.word ? el.mnemonic.word : '';
    const longClass = mnemonicWord.length > 7 ? ' long-text' : '';

    cell.innerHTML = `
      <div class="cell-top">
        <span class="cell-z">${el.z}</span>
        <span class="cell-state-icon" title="${el.standardState}">${stateIcon}</span>
      </div>
      <div class="cell-symbol">${el.symbol}</div>
      <div class="cell-bottom">
        <span class="cell-name">${el.name}</span>
        <span class="cell-mass">${el.atomicMass.toFixed(2)}</span>
      </div>
      <span class="cell-mnemonic-tag${longClass}" id="mnemonic-tag-${el.z}" title="${mnemonicWord}">${mnemonicWord}</span>
    `;

    // Event listeners
    cell.addEventListener('mouseenter', () => {
      appState.setHoveredElement(el.z);
    });

    cell.addEventListener('mouseleave', () => {
      appState.setHoveredElement(null);
    });

    cell.addEventListener('click', () => {
      appState.selectElement(el.z);
    });

    return cell;
  }

  // Update top sticky Hinglish mnemonic banner
  updateMnemonicBanner(el) {
    if (!this.mnemonicBanner || !el) return;

    const m = el.mnemonic;
    if (!m) {
      this.mnemonicBanner.style.display = 'none';
      return;
    }
    this.mnemonicBanner.style.display = 'block';

    const groupTitle = m.groupTitle || `Group ${el.group || ''}`;
    const phrase = m.phrase || '';
    const meaning = m.meaning || '';

    // Find the matching catalog item to render the full interactive sequence
    const catalogItem = MNEMONICS_CATALOG.find(c => c.elements.includes(el.z));

    let flowHtml = '';
    if (catalogItem && catalogItem.breakdown) {
      flowHtml = catalogItem.breakdown.map((item, idx) => {
        const isActive = item.z === el.z;
        const arrow = idx < catalogItem.breakdown.length - 1 ? '<span class="mnemonic-arrow">→</span>' : '';
        return `
          <div class="mnemonic-step-pill ${isActive ? 'active' : ''}" data-z="${item.z}">
            <span class="mnemonic-step-symbol">${item.symbol}</span>
            <span>${item.word}</span>
          </div>
          ${arrow}
        `;
      }).join('');
    } else {
      flowHtml = `
        <div class="mnemonic-step-pill active" data-z="${el.z}">
          <span class="mnemonic-step-symbol">${el.symbol}</span>
          <span>${m.word}</span>
        </div>
      `;
    }

    this.mnemonicBanner.innerHTML = `
      <div class="mnemonic-banner-inner">
        <div class="mnemonic-content-left">
          <div class="mnemonic-badge-group">
            <span>💡</span> ${groupTitle}
          </div>
          <div class="mnemonic-phrase-flow">
            ${flowHtml}
          </div>
        </div>
        <div class="mnemonic-content-right">
          <div class="mnemonic-meaning-box" title="${catalogItem ? catalogItem.hindiPhrase : ''}">
            <span>📖</span> "${phrase}"
          </div>
          <button id="btnBannerSpeak" class="btn-speak" title="Listen to this Hinglish mnemonic spoken aloud">
            <span>🔊</span> Listen
          </button>
        </div>
      </div>
    `;

    // Click handler for mnemonic flow pills
    this.mnemonicBanner.querySelectorAll('.mnemonic-step-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const targetZ = parseInt(pill.dataset.z, 10);
        if (targetZ) appState.selectElement(targetZ);
      });
    });

    // Voice playback button
    const btnSpeak = document.getElementById('btnBannerSpeak');
    if (btnSpeak) {
      btnSpeak.onclick = (e) => {
        e.stopPropagation();
        this.triggerSpeech(btnSpeak, phrase, m.word, el);
      };
    }
  }

  // Update sidebar element profile & Bohr visualizer
  updateProfileSidebar(el) {
    if (!el) return;

    // 1. Symbol & Title block
    const symbolText = document.getElementById('profileSymbolText');
    const symbolZ = document.getElementById('profileSymbolZ');
    const nameEl = document.getElementById('profileName');
    const catPill = document.getElementById('profileCategoryPill');
    const symbolBox = document.getElementById('profileSymbolBox');

    if (symbolText) symbolText.textContent = el.symbol;
    if (symbolZ) symbolZ.textContent = el.z;
    if (nameEl) nameEl.textContent = el.name;
    if (catPill) {
      catPill.textContent = el.category.replace('-', ' ');
      catPill.style.color = `var(--cat-${el.category}, #38bdf8)`;
      catPill.style.borderColor = `var(--cat-${el.category}, #38bdf8)`;
    }
    if (symbolBox) {
      symbolBox.style.borderColor = `var(--cat-${el.category}, #38bdf8)`;
      symbolBox.style.boxShadow = `0 4px 16px var(--cat-${el.category}, rgba(56, 189, 248, 0.3))`;
    }

    // 2. Hinglish Mnemonic Card
    const mWord = document.getElementById('profileMnemonicWord');
    const mDesc = document.getElementById('profileMnemonicDesc');
    const btnProfileSpeak = document.getElementById('btnProfileSpeak');

    if (mWord && el.mnemonic) {
      mWord.innerHTML = `<span>${el.mnemonic.word}</span> (${el.mnemonic.hindiWord || ''})`;
    }
    if (mDesc && el.mnemonic) {
      mDesc.textContent = `"${el.mnemonic.phrase}" — ${el.mnemonic.meaning}`;
    }
    if (btnProfileSpeak) {
      btnProfileSpeak.onclick = (e) => {
        e.stopPropagation();
        this.triggerSpeech(btnProfileSpeak, el.mnemonic ? el.mnemonic.phrase : el.name, el.mnemonic ? el.mnemonic.word : '', el);
      };
    }

    // 3. Properties Table
    this.setProp('propElectConfig', el.electronConfiguration);
    this.setProp('propValenceShells', el.shells ? el.shells.join(', ') : '—');
    this.setProp('propElectroneg', el.electronegativity !== null ? el.electronegativity : 'N/A');
    this.setProp('propAtomicRadius', el.atomicRadius ? `${el.atomicRadius} pm` : 'N/A');
    this.setProp('propIonization', el.ionizationEnergy ? `${el.ionizationEnergy} kJ/mol` : 'N/A');
    this.setProp('propDensity', el.density ? `${el.density} g/cm³` : 'N/A');
    this.setProp('propMelting', el.meltingPoint ? `${el.meltingPoint} K (${(el.meltingPoint - 273.15).toFixed(1)}°C)` : 'N/A');
    this.setProp('propBoiling', el.boilingPoint ? `${el.boilingPoint} K (${(el.boilingPoint - 273.15).toFixed(1)}°C)` : 'N/A');
    this.setProp('propDiscovery', `${el.discoveryYear > 0 ? el.discoveryYear : 'Ancient'} (${el.discoverer})`);

    // 4. Practical Uses & Description
    const descEl = document.getElementById('profileDescription');
    const usesEl = document.getElementById('profileUses');
    if (descEl) descEl.textContent = el.description;
    if (usesEl) usesEl.textContent = el.practicalUses;

    // 5. Update Bohr Visualizer
    if (this.bohrRenderer) {
      this.bohrRenderer.setElement(el);
    }
  }

  // Voice speech feedback handler
  triggerSpeech(buttonEl, phrase, word, el) {
    if (!buttonEl) return;
    const originalHtml = buttonEl.innerHTML;
    buttonEl.innerHTML = '<span>🔊</span> Speaking...';
    buttonEl.style.opacity = '0.75';

    const restore = () => {
      buttonEl.innerHTML = originalHtml;
      buttonEl.style.opacity = '1';
    };

    if (window.sound) window.sound.playPop();

    if (window.speech) {
      window.speech.speakMnemonic(phrase, word, el, null, restore);
    } else {
      setTimeout(restore, 1200);
    }
  }

  setProp(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // Handle reactive state changes
  handleStateChange(state, prev) {
    // 1. Element selection changed (Fast O(1) active element class toggle)
    if (state.activeElementId !== prev.activeElementId) {
      if (this.currentActiveCell) {
        this.currentActiveCell.classList.remove('active');
      } else {
        const oldCell = document.querySelector('.element-cell.active');
        if (oldCell) oldCell.classList.remove('active');
      }

      const activeCell = document.getElementById(`el-cell-${state.activeElementId}`);
      if (activeCell) {
        activeCell.classList.add('active');
        this.currentActiveCell = activeCell;
      }

      const el = appState.getActiveElement();
      if (el) {
        this.updateProfileSidebar(el);
        this.updateMnemonicBanner(el);
      }
    }

    // 2. Mnemonic Overlay toggled
    if (state.mnemonicOverlay !== prev.mnemonicOverlay) {
      document.querySelectorAll('.cell-mnemonic-tag').forEach(tag => {
        tag.style.display = state.mnemonicOverlay ? 'block' : 'none';
      });
      const btnToggle = document.getElementById('btnToggleMnemonic');
      if (btnToggle) {
        btnToggle.classList.toggle('active', state.mnemonicOverlay);
        btnToggle.innerHTML = state.mnemonicOverlay 
          ? '<span>💡</span> Mnemonics: ON' 
          : '<span>💡</span> Mnemonics: OFF';
      }
    }

    // 3. Filters or search changed
    if (state.filterCategory !== prev.filterCategory ||
        state.filterBlock !== prev.filterBlock ||
        state.filterState !== prev.filterState ||
        state.searchQuery !== prev.searchQuery) {
      this.applyFilters(state);
    }

    // 4. Group / Period Highlight changed
    if (state.highlightedGroup !== prev.highlightedGroup ||
        state.highlightedPeriod !== prev.highlightedPeriod ||
        state.highlightedSeries !== prev.highlightedSeries) {
      this.applyHighlights(state);
    }

    // 5. Mode Switch (Standard Table vs Trends Heatmap)
    if (state.currentMode !== prev.currentMode || state.trendProperty !== prev.trendProperty) {
      this.applyMode(state);
    }
  }

  // Filter elements by query, category, block, or state
  applyFilters(state) {
    const q = state.searchQuery.trim().toLowerCase();

    ELEMENTS_DATA.forEach(el => {
      const cell = document.getElementById(`el-cell-${el.z}`);
      if (!cell) return;

      let match = true;

      if (state.filterCategory !== 'all' && el.category !== state.filterCategory) {
        match = false;
      }
      if (state.filterBlock !== 'all' && el.block !== state.filterBlock) {
        match = false;
      }
      if (state.filterState !== 'all' && el.standardState !== state.filterState) {
        match = false;
      }

      if (match && q) {
        const matchName = el.name.toLowerCase().includes(q);
        const matchSymbol = el.symbol.toLowerCase().includes(q);
        const matchZ = String(el.z) === q;
        const matchMnemonic = el.mnemonic && (
          el.mnemonic.word.toLowerCase().includes(q) ||
          el.mnemonic.phrase.toLowerCase().includes(q)
        );
        match = matchName || matchSymbol || matchZ || matchMnemonic;
      }

      cell.classList.toggle('dimmed', !match);
    });
  }

  // Highlight whole group, period, or transition series
  applyHighlights(state) {
    ELEMENTS_DATA.forEach(el => {
      const cell = document.getElementById(`el-cell-${el.z}`);
      if (!cell) return;

      let isHighlight = false;

      if (state.highlightedGroup && el.group === state.highlightedGroup) {
        isHighlight = true;
      } else if (state.highlightedPeriod && el.period === state.highlightedPeriod) {
        isHighlight = true;
      } else if (state.highlightedSeries) {
        const catItem = MNEMONICS_CATALOG.find(c => c.id === state.highlightedSeries);
        if (catItem && catItem.elements.includes(el.z)) {
          isHighlight = true;
        }
      }

      cell.classList.toggle('highlight-group', isHighlight);
    });
  }

  // Apply Trends Heatmap or Table Mode
  applyMode(state) {
    const trendBar = document.getElementById('trendControlBar');
    if (trendBar) {
      trendBar.classList.toggle('visible', state.currentMode === 'trends');
    }

    if (state.currentMode === 'trends') {
      this.renderTrendHeatmap(state.trendProperty);
    } else {
      // Clear heatmap styles
      ELEMENTS_DATA.forEach(el => {
        const cell = document.getElementById(`el-cell-${el.z}`);
        if (cell) {
          cell.style.backgroundColor = '';
          cell.style.borderColor = '';
        }
      });
    }
  }

  // Dynamic continuous color gradient calculation for trends
  renderTrendHeatmap(property) {
    const validValues = ELEMENTS_DATA
      .map(el => el[property])
      .filter(v => v !== null && v !== undefined && typeof v === 'number');

    if (validValues.length === 0) return;

    const min = Math.min(...validValues);
    const max = Math.max(...validValues);

    const minLabel = document.getElementById('trendMinVal');
    const maxLabel = document.getElementById('trendMaxVal');
    if (minLabel) minLabel.textContent = min.toFixed(1);
    if (maxLabel) maxLabel.textContent = max.toFixed(1);

    ELEMENTS_DATA.forEach(el => {
      const cell = document.getElementById(`el-cell-${el.z}`);
      if (!cell) return;

      const val = el[property];
      if (val === null || val === undefined) {
        cell.style.backgroundColor = '#f1f5f9';
        return;
      }

      const ratio = (val - min) / (max - min || 1);
      // Interpolate color from Cyan (200, 100%, 50%) to Red (0, 100%, 50%)
      const hue = (1 - ratio) * 200; // 200 (cyan) -> 0 (red)
      cell.style.backgroundColor = `hsla(${hue}, 85%, 88%, 0.9)`;
      cell.style.borderColor = `hsla(${hue}, 80%, 45%, 0.8)`;
    });
  }

  // Bind UI Control Buttons & Search Events
  bindEvents() {
    // 1. Search Input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        appState.setFilter('search', e.target.value);
      });
    }

    // 2. Mnemonic Toggle Button
    const btnToggleMnemonic = document.getElementById('btnToggleMnemonic');
    if (btnToggleMnemonic) {
      btnToggleMnemonic.addEventListener('click', () => {
        appState.toggleMnemonicOverlay();
      });
    }

    // 3. Mode Switch Buttons
    const btnModeTable = document.getElementById('btnModeTable');
    const btnModeTrends = document.getElementById('btnModeTrends');

    if (btnModeTable) {
      btnModeTable.addEventListener('click', () => {
        appState.setMode('table');
        btnModeTable.classList.add('active');
        if (btnModeTrends) btnModeTrends.classList.remove('active');
      });
    }

    if (btnModeTrends) {
      btnModeTrends.addEventListener('click', () => {
        appState.setMode('trends');
        btnModeTrends.classList.add('active');
        if (btnModeTable) btnModeTable.classList.remove('active');
      });
    }

    // 4. Trend Property Dropdown
    const trendSelect = document.getElementById('trendPropertySelect');
    if (trendSelect) {
      trendSelect.addEventListener('change', (e) => {
        appState.setTrendProperty(e.target.value);
      });
    }

    // 5. Category Legend Filters
    document.querySelectorAll('.legend-item').forEach(item => {
      item.addEventListener('click', () => {
        const cat = item.dataset.category;
        const current = appState.getState().filterCategory;
        appState.setFilter('category', current === cat ? 'all' : cat);

        document.querySelectorAll('.legend-item').forEach(i => i.classList.remove('active'));
        if (current !== cat) item.classList.add('active');
      });
    });

    // 6. Block Filters (s, p, d, f)
    document.querySelectorAll('.block-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const block = chip.dataset.block;
        const current = appState.getState().filterBlock;
        appState.setFilter('block', current === block ? 'all' : block);

        document.querySelectorAll('.block-chip').forEach(c => c.classList.remove('active'));
        if (current !== block) chip.classList.add('active');
      });
    });

    // 7. Sound & Audio Toggles
    const btnSound = document.getElementById('btnToggleSound');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        const enabled = window.sound ? window.sound.toggle() : false;
        btnSound.innerHTML = enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
        btnSound.classList.toggle('active', enabled);
      });
    }

    const btnSpeech = document.getElementById('btnToggleSpeech');
    if (btnSpeech) {
      btnSpeech.addEventListener('click', () => {
        const enabled = window.speech ? window.speech.toggle() : false;
        btnSpeech.innerHTML = enabled ? '🗣️ Voice: ON' : '🤐 Voice: OFF';
        btnSpeech.classList.toggle('active', enabled);
      });
    }

    // 8. Reset All Filters
    const btnReset = document.getElementById('btnResetAll');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        appState.resetAllFilters();
        if (searchInput) searchInput.value = '';
        document.querySelectorAll('.legend-item, .block-chip').forEach(el => el.classList.remove('active'));
      });
    }
  }

  // Bind Quiz Trainer & Theory Modals
  bindModals() {
    // 1. Memory Trainer Quiz Modal
    const btnOpenQuiz = document.getElementById('btnOpenQuiz');
    const btnCloseQuiz = document.getElementById('btnCloseQuiz');

    if (btnOpenQuiz) {
      btnOpenQuiz.addEventListener('click', () => this.openQuizModal());
    }
    if (btnCloseQuiz) {
      btnCloseQuiz.addEventListener('click', () => this.closeQuizModal());
    }

    // 2. Theory & Laws Modal
    const btnOpenTheory = document.getElementById('btnOpenTheory');
    const btnCloseTheory = document.getElementById('btnCloseTheory');

    if (btnOpenTheory) {
      btnOpenTheory.addEventListener('click', () => {
        if (this.theoryModal) this.theoryModal.classList.add('open');
        if (window.sound) window.sound.playPop();
      });
    }
    if (btnCloseTheory) {
      btnCloseTheory.addEventListener('click', () => {
        if (this.theoryModal) this.theoryModal.classList.remove('open');
      });
    }

    // Close on overlay click
    [this.quizModal, this.theoryModal].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.classList.remove('open');
        });
      }
    });
  }

  // Memory Trainer Quiz Engine
  openQuizModal() {
    if (!this.quizModal) return;
    this.quizModal.classList.add('open');
    if (window.sound) window.sound.playPop();
    this.quizState = {
      index: 0,
      score: 0,
      streak: 0,
      answered: false
    };
    this.renderQuizQuestion();
  }

  closeQuizModal() {
    if (this.quizModal) this.quizModal.classList.remove('open');
  }

  renderQuizQuestion() {
    const q = QUIZ_QUESTIONS[this.quizState.index % QUIZ_QUESTIONS.length];
    const qBox = document.getElementById('quizQuestionText');
    const optionsList = document.getElementById('quizOptionsList');
    const feedbackBox = document.getElementById('quizFeedbackBox');
    const scoreVal = document.getElementById('quizScoreVal');
    const streakVal = document.getElementById('quizStreakVal');
    const btnNext = document.getElementById('btnQuizNext');

    if (scoreVal) scoreVal.textContent = this.quizState.score;
    if (streakVal) streakVal.textContent = this.quizState.streak;
    if (qBox) qBox.textContent = `${this.quizState.index + 1}. ${q.question}`;
    if (feedbackBox) {
      feedbackBox.className = 'quiz-feedback-box';
      feedbackBox.innerHTML = '';
    }
    if (btnNext) btnNext.style.display = 'none';

    this.quizState.answered = false;

    if (optionsList) {
      optionsList.innerHTML = '';
      q.options.forEach((optText, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.textContent = optText;
        btn.addEventListener('click', () => this.handleQuizAnswer(i, q));
        optionsList.appendChild(btn);
      });
    }
  }

  handleQuizAnswer(selectedIndex, question) {
    if (this.quizState.answered) return;
    this.quizState.answered = true;

    const options = document.querySelectorAll('.quiz-option-btn');
    const feedbackBox = document.getElementById('quizFeedbackBox');
    const btnNext = document.getElementById('btnQuizNext');

    const isCorrect = selectedIndex === question.answerIndex;

    options.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === question.answerIndex) {
        btn.classList.add('correct');
      } else if (idx === selectedIndex) {
        btn.classList.add('wrong');
      }
    });

    if (isCorrect) {
      this.quizState.score += 10;
      this.quizState.streak += 1;
      if (window.sound) window.sound.playSuccess();
    } else {
      this.quizState.streak = 0;
      if (window.sound) window.sound.playError();
    }

    const scoreVal = document.getElementById('quizScoreVal');
    const streakVal = document.getElementById('quizStreakVal');
    if (scoreVal) scoreVal.textContent = this.quizState.score;
    if (streakVal) streakVal.textContent = this.quizState.streak;

    if (feedbackBox) {
      feedbackBox.className = `quiz-feedback-box visible ${isCorrect ? 'correct-feed' : 'wrong-feed'}`;
      feedbackBox.innerHTML = `
        <strong>${isCorrect ? '🎉 Correct!' : '❌ Incorrect!'}</strong>
        <p style="margin-top:4px;">${question.explanation}</p>
      `;
    }

    if (btnNext) {
      btnNext.style.display = 'inline-block';
      btnNext.onclick = () => {
        this.quizState.index++;
        this.renderQuizQuestion();
      };
    }
  }
}
