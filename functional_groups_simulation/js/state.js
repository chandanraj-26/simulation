/**
 * Reactive State Management for Organic Functional Groups
 */

class OrganicStateStore {
  constructor() {
    this.quests = [
      { id: 'q1', text: 'Test Cyclohexene with Bromine Water: observe instantaneous de-colorization', completed: false },
      { id: 'q2', text: 'Test Ethanol with Sodium Metal: observe brisk effervescence of H₂ gas', completed: false },
      { id: 'q3', text: 'Test Acetaldehyde with Tollens\' Reagent: produce glittering metallic Silver Mirror', completed: false },
      { id: 'q4', text: 'Test Acetic Acid with 5% NaHCO₃: observe vigorous effervescence of CO₂ gas', completed: false }
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

export const state = new OrganicStateStore();
