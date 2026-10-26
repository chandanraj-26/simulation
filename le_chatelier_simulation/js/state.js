/**
 * Reactive State Management for Le Chatelier Simulator
 */

class EquilibriumStateStore {
  constructor() {
    this.selectedTubeIndex = 1; // 0 to 3

    this.quests = [
      { id: 'q1', text: 'Add FeCl₃ to Tube 2: observe blood-red intensification from forward shift', completed: false },
      { id: 'q2', text: 'Add Oxalic Acid to Tube 3: observe yellowing from reverse shift (Fe³⁺ removal)', completed: false },
      { id: 'q3', text: 'Switch to Cobalt Chloride system and immerse in Hot Water Bath (80°C)', completed: false },
      { id: 'q4', text: 'Immerse Cobalt solution in Ice Bath (0°C): observe rosy pink reversible shift', completed: false }
    ];

    this.listeners = new Set();
  }

  selectTube(idx) {
    this.selectedTubeIndex = idx;
    this.notify();
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

export const state = new EquilibriumStateStore();
