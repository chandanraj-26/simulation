/**
 * Reactive State Management for Colloids Simulation
 */

class ColloidStateStore {
  constructor() {
    this.quests = [
      { id: 'q1', text: 'Observe positive charge stability on Ferric Hydroxide sol particles', completed: true },
      { id: 'q2', text: 'Toggle 532 nm Green Laser to observe illuminated Tyndall scattering cone', completed: true },
      { id: 'q3', text: 'Add K₄[Fe(CN)₆] (z = 4): observe fastest coagulation per Hardy-Schulze law', completed: false },
      { id: 'q4', text: 'Switch to Starch sol and compare Al³⁺ (z = 3) coagulation power', completed: false }
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

export const state = new ColloidStateStore();
