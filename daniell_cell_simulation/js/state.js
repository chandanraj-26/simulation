/**
 * Reactive State Management for Daniell Cell
 */

class DaniellStateStore {
  constructor() {
    this.showElectronFlow = true;
    this.showIonMigration = true;

    this.quests = [
      { id: 'q1', text: 'Set standard concentrations [Zn²⁺] = 1.0 M and [Cu²⁺] = 1.0 M to verify E° = +1.10 V', completed: true },
      { id: 'q2', text: 'Observe effect of lowering [Zn²⁺] to 0.01 M: voltage increases according to Nernst law', completed: false },
      { id: 'q3', text: 'Remove the Salt Bridge and observe immediate open-circuit zero voltage drop', completed: false },
      { id: 'q4', text: 'Observe cathodic copper deposition and anodic zinc dissolution mass balance', completed: false }
    ];

    this.listeners = new Set();
  }

  completeQuest(id) {
    const q = this.quests.find(item => item.id === id);
    if (q && !q.completed) {
      q.completed = true;
      this.notify();
    }
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }
}

export const state = new DaniellStateStore();
