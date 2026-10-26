/**
 * Reactive State Management for Chromatography Simulator
 */

import { SAMPLES, SOLVENTS } from './chromatography_data.js';

class StateStore {
  constructor() {
    this.sampleId = 'spinach';
    this.solventId = 'pet_ether_acetone';
    this.chamberLidClosed = true;
    this.showRuler = true;
    this.rulerYOffset = 0; // interactive drag
    this.selectedPigmentId = null;
    this.zoomMode = 'chamber'; // 'chamber' or 'strip_closeup'

    this.quests = [
      { id: 'q1', text: 'Seal chamber lid and start solvent migration', completed: false },
      { id: 'q2', text: 'Observe resolution of primary pigment bands', completed: false },
      { id: 'q3', text: 'Reach the solvent front limit (11 cm above baseline)', completed: false },
      { id: 'q4', text: 'Use metric ruler to inspect Rf values of each band', completed: false }
    ];

    this.listeners = new Set();
  }

  getSample() {
    return SAMPLES[this.sampleId] || SAMPLES.spinach;
  }

  getSolvent() {
    return SOLVENTS[this.solventId] || SOLVENTS.pet_ether_acetone;
  }

  setSample(id) {
    if (SAMPLES[id]) {
      this.sampleId = id;
      this.selectedPigmentId = null;
      this.notify();
    }
  }

  setSolvent(id) {
    if (SOLVENTS[id]) {
      this.solventId = id;
      this.notify();
    }
  }

  setLid(closed) {
    this.chamberLidClosed = closed;
    this.notify();
  }

  toggleRuler() {
    this.showRuler = !this.showRuler;
    this.notify();
  }

  setZoom(mode) {
    this.zoomMode = mode;
    this.notify();
  }

  selectPigment(id) {
    this.selectedPigmentId = id;
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

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }
}

export const state = new StateStore();
