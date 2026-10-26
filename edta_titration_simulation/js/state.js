/**
 * Reactive State Management for EDTA Titration
 */

class EdtaStateStore {
  constructor() {
    this.trials = [];

    this.quests = [
      { id: 'q1', text: 'Pipette 50.0 mL of hard water sample into conical flask', completed: true },
      { id: 'q2', text: 'Add 2 mL of NH₄Cl-NH₄OH buffer (pH = 10) and 2–3 drops of EBT indicator', completed: true },
      { id: 'q3', text: 'Titrate with standard 0.01 M EDTA until wine red changes to clear sky blue', completed: false },
      { id: 'q4', text: 'Calculate Total Hardness in ppm of CaCO₃ equivalent', completed: false }
    ];

    this.listeners = new Set();
  }

  logTrial(titerMl, hardnessPpm) {
    this.trials.push({
      trialNumber: this.trials.length + 1,
      titerMl: titerMl.toFixed(2),
      hardnessPpm: hardnessPpm,
      timestamp: new Date().toLocaleTimeString()
    });
    this.completeQuest('q4');
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

export const state = new EdtaStateStore();
