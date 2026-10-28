/**
 * state.js
 * Central state store for iron rusting experiment.
 */

class State {
  constructor() {
    this.day = 0.0;
    this.protectionMethod = 'none'; // 'none', 'galvanized', 'grease', 'mg_ribbon'
    this.listeners = [];
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== fn);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  setDay(day) {
    this.day = Math.max(0.0, Math.min(7.0, Number(day)));
    this.notify();
  }

  setProtectionMethod(method) {
    this.protectionMethod = method;
    this.notify();
  }

  reset() {
    this.day = 0.0;
    this.protectionMethod = 'none';
    this.notify();
  }
}

export const state = new State();
