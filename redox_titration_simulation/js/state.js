/**
 * Reactive State Management for Redox Titration Simulator
 */

class RedoxStateStore {
  constructor() {
    this.analyteId = 'mohrs_salt';
    this.showPotentiometricCurve = true;
    this.trials = [];

    this.quests = [
      { id: 'q1', text: 'Pipette 20.0 mL of primary standard analyte into conical flask', completed: true },
      { id: 'q2', text: 'Add 1 test tube (~20 mL) of dilute H₂SO₄ to acidify medium', completed: true },
      { id: 'q3', text: 'If using Oxalic Acid, warm flask on hotplate to 60–70°C', completed: false },
      { id: 'q4', text: 'Titrate with standard 0.02 M KMnO₄ until permanent faint pink endpoint', completed: false },
      { id: 'q5', text: 'Record concordant titre volume and compute standard molarity', completed: false }
    ];

    this.listeners = new Set();
  }

  setAnalyte(id) {
    this.analyteId = id;
    this.notify();
  }

  logTrial(titerMl, molarity) {
    this.trials.push({
      trialNumber: this.trials.length + 1,
      analyteId: this.analyteId,
      titerMl: titerMl.toFixed(2),
      molarity: molarity,
      timestamp: new Date().toLocaleTimeString()
    });
    this.completeQuest('q5');
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

export const state = new RedoxStateStore();
