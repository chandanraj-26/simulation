/**
 * PeriodicLab — Reactive State Management Engine
 * Stores application UI state, element selection, mnemonic mode,
 * filter queries, periodic trend selections, and quiz progression.
 */

class PeriodicState {
  constructor() {
    this.state = {
      // Default to Calcium (Z=20) for instant preview of "Beta Mange Car Scooter Baap Raazi"
      activeElementId: 20,
      hoveredElementId: null,

      // View modes: 'table', 'bohr', 'trends'
      currentMode: 'table',

      // Hinglish mnemonics displayed prominently by default
      mnemonicOverlay: true,

      // Filter settings
      filterCategory: 'all',
      filterBlock: 'all',
      filterState: 'all',
      searchQuery: '',

      // Periodic trends heatmap property
      trendProperty: 'electronegativity',

      // Group or series highlight
      highlightedGroup: null,
      highlightedPeriod: null,
      highlightedSeries: null,

      // Quiz trainer state
      quiz: {
        active: false,
        currentIndex: 0,
        score: 0,
        streak: 0,
        answered: false,
        selectedOption: null
      },

      // Audio & Speech settings
      soundEnabled: true,
      speechEnabled: true
    };

    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  getActiveElement() {
    return getElement(this.state.activeElementId);
  }

  setState(updates) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };
    this.notify(prevState);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(prevState) {
    for (const listener of this.listeners) {
      try {
        listener(this.state, prevState);
      } catch (err) {
        console.error('State listener error:', err);
      }
    }
  }

  // Helper actions
  selectElement(z) {
    if (this.state.activeElementId === z) return;
    this.setState({ activeElementId: z });
    if (window.sound) window.sound.playSelect(z);
  }

  setHoveredElement(z) {
    this.state.hoveredElementId = z;
    if (z && window.sound) window.sound.playHover();
  }

  toggleMnemonicOverlay() {
    const next = !this.state.mnemonicOverlay;
    this.setState({ mnemonicOverlay: next });
    if (window.sound) window.sound.playPop();
  }

  setMode(mode) {
    if (this.state.currentMode === mode) return;
    this.setState({ currentMode: mode });
    if (window.sound) window.sound.playPop();
  }

  setTrendProperty(prop) {
    this.setState({ trendProperty: prop });
    if (window.sound) window.sound.playGroupSweep();
  }

  highlightGroup(groupNum) {
    this.setState({
      highlightedGroup: groupNum,
      highlightedPeriod: null,
      highlightedSeries: null
    });
    if (groupNum && window.sound) window.sound.playGroupSweep();
  }

  highlightPeriod(periodNum) {
    this.setState({
      highlightedPeriod: periodNum,
      highlightedGroup: null,
      highlightedSeries: null
    });
    if (periodNum && window.sound) window.sound.playGroupSweep();
  }

  highlightSeries(seriesId) {
    this.setState({
      highlightedSeries: seriesId,
      highlightedGroup: null,
      highlightedPeriod: null
    });
    if (seriesId && window.sound) window.sound.playGroupSweep();
  }

  clearHighlights() {
    this.setState({
      highlightedGroup: null,
      highlightedPeriod: null,
      highlightedSeries: null
    });
  }

  setFilter(type, value) {
    const update = {};
    if (type === 'category') update.filterCategory = value;
    if (type === 'block') update.filterBlock = value;
    if (type === 'state') update.filterState = value;
    if (type === 'search') update.searchQuery = value;
    this.setState(update);
    if (window.sound) window.sound.playHover();
  }

  resetAllFilters() {
    this.setState({
      filterCategory: 'all',
      filterBlock: 'all',
      filterState: 'all',
      searchQuery: '',
      highlightedGroup: null,
      highlightedPeriod: null,
      highlightedSeries: null
    });
    if (window.sound) window.sound.playPop();
  }
}

// Global state instance attached to window
const appState = new PeriodicState();
window.appState = appState;
window.PeriodicState = PeriodicState;
