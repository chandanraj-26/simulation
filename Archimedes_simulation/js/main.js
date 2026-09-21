/**
 * ArchimedesLab — Interactive Archimedes' Principle & Buoyancy
 * Application Entry Point & Orchestrator
 */

import { state, setState } from './state.js';
import { HydroRenderer } from './renderer.js';
import { initUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hydroCanvas');
  if (!canvas) {
    console.error('Hydro canvas element (#hydroCanvas) not found!');
    return;
  }

  // Initialize Canvas 2D Renderer
  const renderer = new HydroRenderer(canvas);

  // Dynamic window resizing
  window.addEventListener('resize', () => {
    renderer.resize();
  });

  // Initialize UI Bindings
  initUI(renderer);

  // Broadcast initial state to trigger initial UI and math rendering
  setState({});

  console.log("🌊 ArchimedesLab — Archimedes' Principle & Buoyancy simulation initialized successfully!");
});
