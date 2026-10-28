/**
 * Reactive State Management for Potentiometer
 */

class PotentiometerStateStore {
  constructor() {
    this.trials = [];

    this.quests = [
      { id: 'q1', text: 'Select Leclanché Cell (E₁) and find null point balancing length l₁', completed: false },
      { id: 'q2', text: 'Select Daniell Cell (E₂) and find null point balancing length l₂', completed: false },
      { id: 'q3', text: 'Verify EMF ratio: E₁ / E₂ = l₁ / l₂ ≈ 1.34', completed: false },
      { id: 'q4', text: 'Engage Resistance Box shunt and determine internal resistance r', completed: false }
    ];

    this.listeners = new Set();
  }

  logTrial(mode, lengthCm, isNull) {
    this.trials.push({
      trialNumber: this.trials.length + 1,
      mode: mode,
      balancingLengthCm: lengthCm,
      status: isNull ? 'Null Point Achieved' : 'Off-Balance',
      timestamp: new Date().toLocaleTimeString()
    });
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

export const state = new PotentiometerStateStore();
