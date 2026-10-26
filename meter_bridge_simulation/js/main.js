/**
 * main.js
 * Initializes the Meter Bridge experiment virtual lab.
 */

import { MeterBridgeEngine } from './meter_bridge_engine.js';
import { MeterBridgeRenderer } from './renderer.js';
import { state } from './state.js';
import { setupUI } from './ui.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('meterBridgeCanvas');
  const engine = new MeterBridgeEngine(state.knownR, state.unknownWire);
  const renderer = new MeterBridgeRenderer(canvas, engine, state);

  renderer.resize();
  renderer.render();

  window.addEventListener('resize', () => {
    renderer.resize();
    renderer.render();
  });

  setupUI(engine, renderer);
});
