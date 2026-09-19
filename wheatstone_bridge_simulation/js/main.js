/**
 * CircuitLab — Interactive Wheatstone Bridge & Meter Bridge
 * Application Entry Point & Orchestrator
 */

import { state, setState } from './state.js';
import { CircuitRenderer } from './renderer.js';
import { initUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('circuitCanvas');
  if (!canvas) {
    console.error('Circuit canvas element (#circuitCanvas) not found!');
    return;
  }

  // Initialize Canvas 2D Renderer
  const renderer = new CircuitRenderer(canvas);

  // Dynamic window resizing
  window.addEventListener('resize', () => {
    renderer.resize();
  });

  // Initialize UI Bindings
  initUI(renderer);

  // Broadcast initial state to render UI readouts
  setState({});

  console.log('⚡ CircuitLab — Wheatstone Bridge & Meter Bridge simulation initialized successfully!');
});
