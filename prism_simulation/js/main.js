/**
 * PhysicsLab - Main Application Entry Point
 * Orchestrates initialization of state, renderer, optics engine, graphs, and UI.
 */
window.PhysicsLab = window.PhysicsLab || {};

(function(lab) {
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Renderer & Canvases
    lab.initRenderer();

    // 2. Initialize Real-Time Graphs
    lab.initGraphs();

    // 3. Initialize UI Event Handlers & Badges
    lab.initUIListeners();

    // 4. Initialize Interactive Drag & Simulation Loop
    lab.initSimulation();

    // 5. Initialize Introductory Lesson Modal
    lab.initLanding();

    // 6. Initial UI & Scene Render
    lab.updateUI();
    lab.drawScene();
    lab.drawGraphs();

    // 7. Responsive Window Resize Handler
    window.addEventListener('resize', () => {
      lab.resizeCanvas();
      lab.drawScene();
      lab.resizeGraphs();
      lab.drawGraphs();
    });
  });
})(window.PhysicsLab);
