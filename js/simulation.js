/**
 * PhysicsLab - Simulation Lifecycle Controller
 * Manages run, pause, reset, step, and the high-frequency animation loop.
 */
window.PhysicsLab = window.PhysicsLab || {};

(function(lab) {
  const $ = id => lab.$(id);

  lab.stopSim = function() {
    lab.state.running = false;
    cancelAnimationFrame(lab.state.rafId);
    if ($('btnPlay')) $('btnPlay').disabled = false;
    if ($('btnPause')) $('btnPause').disabled = true;
  };

  lab.autoReadyForLaunch = function() {
    if (lab.state.running) return;
    const state = lab.state;
    state.simTime = 0;
    state.posX = 0;
    state.posY = 0;
    state.velX = 0;
    state.velY = 0;
    state.accelX = 0;
    state.accelY = 0;
    state.maxAltReached = 0;
    const cfg = lab.getConfig();
    state.currentFuel = cfg.fuel || 100;
    state.currentMass = cfg.mass;

    if ($('simStatus')) {
      $('simStatus').textContent = 'READY TO LAUNCH';
      $('simStatus').className = 'stage-status-badge ready';
    }
    if ($('btnPlay')) {
      $('btnPlay').disabled = false;
      $('btnPlay').classList.add('ready-pulse');
    }
    if ($('btnPause')) $('btnPause').disabled = true;

    lab.updateControlBadges();
    lab.updateUI();
    lab.drawScene();
    lab.drawGraphs();
  };

  lab.resetSim = function() {
    lab.stopSim();
    clearTimeout(lab.state.autoReadyTimeout);
    lab.state.historyData = [];
    lab.state.trajectoryPoints = [];
    lab.state.cameraManualLayer = null;
    lab.autoReadyForLaunch();
  };

  lab.playSim = function() {
    if (lab.state.running) return;
    clearTimeout(lab.state.autoReadyTimeout);

    // Auto-ready for launch if previous flight ended or rocket is at rest with fuel spent
    if (lab.state.simTime > 0 && (lab.state.posY <= 0 || lab.state.currentFuel <= 0)) {
      lab.autoReadyForLaunch();
    }

    lab.state.running = true;
    lab.state.cameraManualLayer = null; // restore auto follow
    if ($('btnPlay')) $('btnPlay').classList.remove('ready-pulse');
    if ($('simStatus')) {
      $('simStatus').textContent = 'RUNNING';
      $('simStatus').className = 'status-badge running';
    }
    if ($('btnPlay')) $('btnPlay').disabled = true;
    if ($('btnPause')) $('btnPause').disabled = false;
    lab.state.lastTimestamp = performance.now();
    lab.state.rafId = requestAnimationFrame(lab.simLoop);
  };

  lab.pauseSim = function() {
    if (!lab.state.running) return;
    lab.stopSim();
    clearTimeout(lab.state.autoReadyTimeout);
    if ($('simStatus')) {
      $('simStatus').textContent = 'PAUSED';
      $('simStatus').className = 'status-badge paused';
    }
  };

  lab.simLoop = function(now) {
    const state = lab.state;
    if (!state.running) return;
    const deltaMs = now - state.lastTimestamp;
    state.lastTimestamp = now;

    const dt = Math.min(deltaMs / 1000, 0.05) * state.simSpeedMultiplier;

    lab.stepPhysics(dt);
    lab.updateUI();
    lab.drawScene();
    lab.drawGraphs();

    // Automatic flight completion when rocket completes its flight cycle and touches down
    const cfg = lab.getConfig();
    if (state.simTime >= 40 || (!cfg.infiniteFuel && state.currentFuel <= 0 && state.maxAltReached > 3 && state.posY <= 0 && state.velY <= 0.05)) {
      lab.stopSim();
      if ($('simStatus')) {
        $('simStatus').textContent = `🛬 TOUCHDOWN (${state.simTime.toFixed(1)}s)`;
        $('simStatus').className = 'stage-status-badge';
      }

      // Automatically ready the rocket for next launch with current settings after brief landing display
      clearTimeout(lab.state.autoReadyTimeout);
      lab.state.autoReadyTimeout = setTimeout(() => {
        if (!lab.state.running && lab.state.posY <= 0) {
          lab.autoReadyForLaunch();
        }
      }, 1500);
      return;
    }

    state.rafId = requestAnimationFrame(lab.simLoop);
  };
})(window.PhysicsLab);
