/**
 * PhysicsLab - State Management & Utility Helpers
 */
window.PhysicsLab = window.PhysicsLab || {};

(function(lab) {
  // DOM selector shorthand
  lab.$ = function(id) {
    return document.getElementById(id);
  };

  // Helper formatting functions
  lab.fmtNum = function(val, decimals = 1) {
    const abs = Math.abs(val);
    if (abs >= 1000) return Math.round(val).toLocaleString('en-US');
    return Number(val.toFixed(decimals)).toString();
  };

  // Star field cache for space rendering
  lab.stars = [];
  for (let i = 0; i < 160; i++) {
    lab.stars.push({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.8 + 0.6,
      brightness: Math.random() * 0.6 + 0.4,
      twinkleSpeed: Math.random() * 0.05 + 0.02
    });
  }

  // Meteors cache for mesosphere
  lab.meteors = [
    { x: 0.25, y: 0.18, len: 45, angle: 0.65 },
    { x: 0.72, y: 0.32, len: 60, angle: 0.75 },
    { x: 0.48, y: 0.12, len: 35, angle: 0.55 }
  ];

  // Core Simulation State
  lab.state = {
    running: false,
    rafId: 0,
    lastTimestamp: 0,
    simTime: 0,
    posX: 0,
    posY: 0,
    velX: 0,
    velY: 0,
    accelX: 0,
    accelY: 0,
    currentFuel: 100,
    currentMass: 3000,
    simSpeedMultiplier: 1.0,
    cameraManualLayer: null,
    historyData: [],
    trajectoryPoints: [],
    activeChallenge: null,
    challengeState: {
      ch1: false,
      ch2_lowTested: false,
      ch2_highTested: false,
      ch3: false,
      ch4_spaceReached: false,
      ch5_apexSeen: false
    }
  };

  // Config reader from control inputs
  lab.getConfig = function() {
    const $ = lab.$;
    const chkInf = $('chkInfiniteFuel');
    return {
      mass: $('slMass') ? +$('slMass').value : 3000,
      thrust: $('slThrust') ? +$('slThrust').value : 50000,
      angle: $('slAngle') ? +$('slAngle').value : 0,
      gravity: $('slGravity') ? +$('slGravity').value : 9.8,
      side: $('slSide') ? +$('slSide').value : 0,
      fuel: $('slFuel') ? +$('slFuel').value : 100,
      infiniteFuel: chkInf ? chkInf.checked : false
    };
  };
})(window.PhysicsLab);
