/**
 * Reactive State Management for Calorimetry Simulation
 */

class CalorimetryStateStore {
  constructor() {
    this.trials = [];

    this.quests = [
      { id: 'q1', text: 'Measure initial temperature of acid and base solutions (25.0°C)', completed: true },
      { id: 'q2', text: 'Pour base into calorimeter and initiate motorized stirring', completed: false },
      { id: 'q3', text: 'Record peak temperature rise ΔT and compute enthalpy ΔH_neut', completed: false },
      { id: 'q4', text: 'Compare Strong Acid (HCl) against Weak Acid (CH₃COOH) dissociation penalty', completed: false }
    ];

    this.listeners = new Set();
  }

  logTrial(deltaT, deltaH) {
    this.trials.push({
      trialNumber: this.trials.length + 1,
      deltaT: deltaT,
      deltaH: deltaH,
      timestamp: new Date().toLocaleTimeString()
    });
    this.completeQuest('q3');
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

export const state = new CalorimetryStateStore();
