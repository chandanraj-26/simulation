/**
 * OpticsLab — Interactive Lens Simulation
 * Application Entry Point & Orchestrator
 */

import { state, setState } from './state.js';
import { LensRenderer } from './renderer.js';
import { initUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('opticsCanvas');
  if (!canvas) {
    console.error('Optics canvas element not found!');
    return;
  }

  // Initialize Canvas 2D Renderer
  const renderer = new LensRenderer(canvas);

  // Handle dynamic window resizing
  window.addEventListener('resize', () => {
    renderer.resize();
  });

  // Initialize UI Bindings
  initUI(renderer);

  // Trigger initial state broadcast
  setState({});

  console.log('🌈 OpticsLab — Lens Simulation initialized successfully!');
});
