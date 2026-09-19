/**
 * PhysicsLab - UI Sync, Pedagogical Inspector & Challenge Verifier
 * Designed specifically for Class 9–10 students: clear, conversational, and encouraging.
 */
window.PhysicsLab = window.PhysicsLab || {};

(function(lab) {
  const $ = id => lab.$(id);

  // Sync control badges with slider values
  lab.updateControlBadges = function() {
    const cfg = lab.getConfig();
    const state = lab.state;

    if ($('outMass')) $('outMass').textContent = lab.fmtNum(cfg.mass, 0) + ' kg';
    if ($('outThrust')) $('outThrust').textContent = lab.fmtNum(cfg.thrust, 0) + ' N';
    if ($('outGravity')) $('outGravity').textContent = cfg.gravity.toFixed(1) + ' m/s²';

    const angleSign = cfg.angle > 0 ? `+${cfg.angle}° (Tilt Right)` : cfg.angle < 0 ? `${cfg.angle}° (Tilt Left)` : `0° (Straight Up)`;
    if ($('outAngle')) $('outAngle').textContent = angleSign;
    if ($('outSide')) $('outSide').textContent = (cfg.side > 0 ? '+' : '') + lab.fmtNum(cfg.side, 0) + ' N';

    // Update fuel tank badge & status
    if ($('outFuel')) {
      $('outFuel').textContent = cfg.infiniteFuel ? '∞' : `${Math.round(state.currentFuel)}%`;
    }
    if ($('fuelStatusText')) {
      $('fuelStatusText').textContent = cfg.infiniteFuel ? 'Infinite' : (state.currentFuel <= 0 ? 'Empty' : (state.running ? 'Burning' : 'Ready'));
    }
    if ($('fuelBar')) {
      const fuelPct = cfg.infiniteFuel ? 100 : Math.max(0, Math.min(100, state.currentFuel));
      $('fuelBar').style.width = `${fuelPct}%`;
      $('fuelBar').className = fuelPct > 40 ? 'fuel-bar' : fuelPct > 15 ? 'fuel-bar amber' : 'fuel-bar red';
    }

    // Dynamic calculation note for Class 10: W = mg
    if ($('weightFormulaNote')) {
      const w = Math.round(cfg.mass * cfg.gravity);
      const planetName = cfg.gravity === 9.8 ? 'Earth' :
                         cfg.gravity === 1.6 ? 'Moon' :
                         cfg.gravity === 3.7 ? 'Mars' :
                         cfg.gravity === 0.0 ? 'Outer Space' : 'Custom';
      $('weightFormulaNote').innerHTML = `💡 On <b>${planetName}</b>: Weight (W = m × g) = ${lab.fmtNum(cfg.mass, 0)} kg × ${cfg.gravity.toFixed(1)} m/s² = <b>${lab.fmtNum(w, 0)} N</b>`;
    }

    if ($('hudEnv')) {
      $('hudEnv').textContent = cfg.gravity === 9.8 ? '🌍 Earth (9.8 m/s²)' :
                                cfg.gravity === 1.6 ? '🌕 Moon (1.6 m/s²)' :
                                cfg.gravity === 3.7 ? '🔴 Mars (3.7 m/s²)' :
                                cfg.gravity === 0.0 ? '🪐 Zero-G Space (0.0 m/s²)' :
                                `Custom (${cfg.gravity.toFixed(1)} m/s²)`;
    }
  };

  // Live UI updates & Student Telemetry Gauges
  lab.updateUI = function() {
    const state = lab.state;
    const cfg = lab.getConfig();
    const p = lab.calcPhysics();
    const speed = Math.hypot(state.velX, state.velY);
    const totalAccel = Math.hypot(state.accelX, state.accelY);

    const layer = lab.getAtmosphereLayer(state.posY);

    // 1. Update Student Gauges
    if ($('gaugeTime')) {
      $('gaugeTime').textContent = `${state.simTime.toFixed(1)} s`;
    }
    if ($('gaugeAlt')) {
      $('gaugeAlt').textContent = state.posY >= 1000 ? `${(state.posY / 1000).toFixed(1)} km` : `${Math.round(state.posY)} m`;
    }
    if ($('gaugeSpeed')) {
      const spdVal = Math.round(speed);
      if (state.posY > 0 && Math.abs(state.velY) > 0.4) {
        if (state.velY > 0) {
          $('gaugeSpeed').textContent = `↑ +${spdVal} m/s`;
          $('gaugeSpeed').className = 'gauge-val up';
        } else {
          $('gaugeSpeed').textContent = `↓ -${spdVal} m/s`;
          $('gaugeSpeed').className = 'gauge-val down';
        }
      } else {
        $('gaugeSpeed').textContent = `${spdVal} m/s`;
        $('gaugeSpeed').className = 'gauge-val';
      }
    }
    if ($('gaugeAccel')) {
      $('gaugeAccel').textContent = `${(state.accelY >= 0 ? '+' : '')}${totalAccel.toFixed(1)} m/s²`;
    }

    // 2. Live Fuel Bar animation
    if ($('fuelBar')) {
      const fuelPct = cfg.infiniteFuel ? 100 : Math.max(0, Math.min(100, state.currentFuel));
      $('fuelBar').style.width = `${fuelPct}%`;
      $('fuelBar').className = fuelPct > 40 ? 'fuel-bar' : fuelPct > 15 ? 'fuel-bar amber' : 'fuel-bar red';
    }
    if ($('outFuel')) {
      $('outFuel').textContent = cfg.infiniteFuel ? '∞' : `${Math.round(state.currentFuel)}%`;
    }
    if ($('fuelStatusText')) {
      $('fuelStatusText').textContent = cfg.infiniteFuel ? 'Infinite' : (state.currentFuel <= 0 ? 'Empty (Off)' : (state.running ? 'Burning' : 'Ready'));
    }

    // Update active atmospheric pill in advanced view
    document.querySelectorAll('.atmo-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.layer === layer.id);
    });

    // Peak stats on graph
    if (state.historyData.length) {
      const maxSpeed = Math.max(...state.historyData.map(h => h.speed));
      const maxAccel = Math.max(...state.historyData.map(h => h.totalAccel));
      const maxAlt = Math.max(...state.historyData.map(h => h.y));
      if ($('peakVel')) $('peakVel').textContent = `Peak v: ${lab.fmtNum(maxSpeed, 1)} m/s`;
      if ($('peakAccel')) $('peakAccel').textContent = `Peak a: ${lab.fmtNum(maxAccel, 1)} m/s²`;
      if ($('peakAlt')) $('peakAlt').textContent = maxAlt >= 1000 ? `Max Alt: ${(maxAlt / 1000).toFixed(1)} km` : `Max Alt: ${lab.fmtNum(maxAlt, 0)} m`;
    }

    // Update Pedagogical Law Explanation
    lab.updateInspector(p, layer);
  };

  // Student-friendly Newton's laws inspector (15-30s Flight Stages)
  lab.updateInspector = function(p, layer) {
    const state = lab.state;
    const badge = $('lawBadge');
    const exp = $('lawExplanation');

    if ($('stepThrust')) $('stepThrust').textContent = `${lab.fmtNum(p.effectiveThrust, 0)} N`;
    if ($('stepWeight')) $('stepWeight').textContent = `${lab.fmtNum(p.weight, 0)} N`;
    if ($('stepWeightSub')) $('stepWeightSub').textContent = `m (${lab.fmtNum(p.m, 0)} kg) × g (${p.cfg.gravity.toFixed(1)})`;
    if ($('stepNet')) $('stepNet').textContent = `${(p.fy >= 0 ? '+' : '')}${lab.fmtNum(p.netForce, 0)} N`;
    if ($('stepAccel')) $('stepAccel').textContent = `a = ${(p.ay >= 0 ? '+' : '')}${Math.hypot(p.ax, p.ay).toFixed(2)} m/s² ${p.ay >= 0 ? 'upward' : 'downward'}`;

    if (!badge || !exp) return;

    // Phase 1: Touchdown completion
    if (state.posY <= 0 && state.simTime > 1.5 && state.currentFuel <= 0) {
      badge.textContent = "🛬 Touchdown! Flight Completed";
      badge.style.background = "#ecfdf5";
      badge.style.color = "#059669";
      exp.innerHTML = `<b>Mission Complete in ${state.simTime.toFixed(1)}s!</b> The rocket launched, accelerated under thrust, ran out of fuel, climbed to its apex, and was pulled all the way back to Earth by gravity!`;
      return;
    }

    // Phase 2: Hover / Balanced Equilibrium (Newton's 1st Law)
    if (state.posY <= 0 && Math.abs(p.effectiveThrust - p.weight) <= 80 && p.effectiveThrust > 0) {
      badge.textContent = "⚖️ Newton's 1st Law: Balanced Forces (Equilibrium)";
      badge.style.background = "#ecfdf5";
      badge.style.color = "#059669";
      exp.innerHTML = `<b>Forces are Balanced!</b> Upward Thrust (${lab.fmtNum(p.effectiveThrust, 0)} N) equals Downward Weight (${lab.fmtNum(p.weight, 0)} N). Therefore <b>Net Force F<sub>net</sub> = 0 N</b> and <b>Acceleration a = 0 m/s²</b>. The rocket stays safely at rest!`;
      return;
    }

    // Phase 3: Insufficient Thrust to liftoff
    if (state.posY <= 0 && state.running && p.effectiveThrust > 0 && p.effectiveThrust < p.weight) {
      badge.textContent = "⚠️ Thrust < Weight: Rocket Cannot Lift Off";
      badge.style.background = "#fff1f2";
      badge.style.color = "#e11d48";
      exp.innerHTML = `<b>Engine power too low!</b> Thrust (${lab.fmtNum(p.effectiveThrust, 0)} N) is less than Weight (${lab.fmtNum(p.weight, 0)} N). Increase Engine Thrust above ${lab.fmtNum(p.weight, 0)} N to achieve liftoff!`;
      return;
    }

    // Phase 4: Powered Ascent (Newton's 2nd Law F = ma)
    if (p.effectiveThrust > p.weight && (state.running || state.posY > 0) && state.currentFuel > 0) {
      badge.textContent = "⚡ Powered Ascent: Unbalanced Force Produces Acceleration (F = ma)";
      badge.style.background = "#eff6ff";
      badge.style.color = "#2563eb";
      exp.innerHTML = `<b>Thrust is GREATER than Weight!</b> The engine pushes upward with ${lab.fmtNum(p.effectiveThrust, 0)} N against gravity (${lab.fmtNum(p.weight, 0)} N). Net force <b>+${lab.fmtNum(p.netForce, 0)} N</b> causes upward acceleration <b>+${p.ay.toFixed(2)} m/s²</b>.`;
      return;
    }

    // Phase 5: Fuel Out / Free Fall / Apex
    if (p.effectiveThrust <= 0 && state.posY > 0) {
      if (state.velY > 1.2) {
        // Coasting upwards on inertia
        badge.textContent = "⛽ Fuel Exhausted: Coasting on Inertia";
        badge.style.background = "#fffbeb";
        badge.style.color = "#d97706";
        exp.innerHTML = `<b>Fuel is empty! Engines cut off.</b> The rocket continues rising due to <b>inertia (Newton's 1st Law)</b>, but Earth's downward gravity slows it down by <b>${p.cfg.gravity.toFixed(1)} m/s</b> every second!`;
      } else if (Math.abs(state.velY) <= 1.2) {
        // The Apex
        badge.textContent = "🔝 The Apex (Highest Point: v = 0 m/s)";
        badge.style.background = "#fef3c7";
        badge.style.color = "#b45309";
        exp.innerHTML = `<b>Peak Altitude Reached!</b> Vertical speed has dropped to exactly <b>0 m/s</b>. Gravity is still pulling downward at <b>-${p.cfg.gravity.toFixed(1)} m/s²</b>, so the rocket is about to fall back down!`;
      } else {
        // Free fall descent
        badge.textContent = "🌍 Free Fall: Gravity Accelerating Rocket Downward";
        badge.style.background = "#fee2e2";
        badge.style.color = "#b91c1c";
        exp.innerHTML = `<b>Falling back to Earth!</b> Gravity accelerates the rocket downwards at <b>-${p.cfg.gravity.toFixed(1)} m/s²</b>, causing downward velocity to increase until landing!`;
      }
      return;
    }

    // Phase 6: Ready on launchpad
    badge.textContent = "🚀 Ready on Launchpad";
    badge.style.background = "#f1f5f9";
    badge.style.color = "#475569";
    exp.innerHTML = `Adjust Thrust, Angle, and Mass, then click <b>▶ Launch Rocket</b> to watch the complete 15–25s flight cycle!`;
  };

  lab.verifyChallenges = function(p) {
    // challenges evaluation maintained
  };
})(window.PhysicsLab);
