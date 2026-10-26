/**
 * state.js
 * Central state store for scalable meter bridge experiment.
 */

import { UNKNOWN_WIRES } from './meter_bridge_data.js';

class State {
  constructor() {
    this.totalWireLengthCm = 100.0;
    this.knownR = 4.0;
    this.unknownWire = UNKNOWN_WIRES[0];
    this.jockeyPosCm = 50.0;
    this.wireDiameterMm = this.unknownWire.wireDiameterMm;
    this.wireLengthCm = this.unknownWire.wireLengthCm;
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

  setTotalWireLength(lengthCm) {
    this.totalWireLengthCm = Number(lengthCm);
    this.jockeyPosCm = this.totalWireLengthCm * 0.5;
    this.notify();
  }

  setKnownR(val) {
    this.knownR = Number(val);
    this.notify();
  }

  setUnknownWire(wireId) {
    const found = UNKNOWN_WIRES.find(w => w.id === wireId);
    if (found) {
      this.unknownWire = found;
      this.wireDiameterMm = found.wireDiameterMm;
      this.wireLengthCm = found.wireLengthCm;
      this.notify();
    }
  }

  setJockeyPos(cm) {
    this.jockeyPosCm = Math.max(0.5, Math.min(this.totalWireLengthCm - 0.5, Number(cm)));
    this.notify();
  }

  setWireDiameter(mm) {
    this.wireDiameterMm = Number(mm);
    this.notify();
  }

  setWireLength(cm) {
    this.wireLengthCm = Number(cm);
    this.notify();
  }

  reset() {
    this.totalWireLengthCm = 100.0;
    this.knownR = 4.0;
    this.unknownWire = UNKNOWN_WIRES[0];
    this.jockeyPosCm = 50.0;
    this.wireDiameterMm = this.unknownWire.wireDiameterMm;
    this.wireLengthCm = this.unknownWire.wireLengthCm;
    this.notify();
  }
}

export const state = new State();
