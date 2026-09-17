/**
 * PhysicsLab - Core Physics Engine & Atmospheric Model
 */
window.PhysicsLab = window.PhysicsLab || {};

(function(lab) {
  // Calculate live physics forces & acceleration with vector components
  lab.calcPhysics = function() {
    const cfg = lab.getConfig();
    const state = lab.state;
    const effectiveThrust = (state.currentFuel > 0 || cfg.infiniteFuel) ? cfg.thrust : 0;
    const m = Math.max(500, state.currentMass);
    const weight = m * cfg.gravity;

    // Vector resolution: angle theta from vertical
    const rad = (cfg.angle * Math.PI) / 180;
    const thrustX = effectiveThrust * Math.sin(rad);
    const thrustY = effectiveThrust * Math.cos(rad);

    // Forces in SI Units
    const fx = thrustX + cfg.side;
    let fy = thrustY - weight;

    // On ground with net downward or zero force, normal force balances weight
    if (state.posY <= 0 && fy < 0) {
      fy = 0;
    }

    const netForce = Math.hypot(fx, fy);
    const netAngle = netForce > 0 ? (Math.atan2(fy, fx) * 180 / Math.PI) : 0;

    // Friction on ground prevents sliding until liftoff
    let ax = fx / m;
    let ay = fy / m;
    if (state.posY <= 0 && fy <= 0 && thrustY <= weight) {
      ax = 0;
    }

    return {
      cfg,
      m,
      effectiveThrust,
      thrustX,
      thrustY,
      weight,
      fx,
      fy,
      netForce,
      netAngle,
      ax,
      ay
    };
  };

  // Determine current atmospheric layer details
  lab.getAtmosphereLayer = function(alt) {
    if (alt <= 50) {
      return {
        id: 'crust',
        name: '🪨 Earth Surface & Crust',
        altitudeRange: '0 m (Ground Foundation)',
        density: '100%',
        temp: '+15°C',
        desc: 'Continental crust foundation, soil, launch gantry & bedrock'
      };
    } else if (alt <= 12000) {
      return {
        id: 'tropo',
        name: '🌤️ Troposphere',
        altitudeRange: '0 – 12 km',
        density: '100% to 20%',
        temp: '+15°C to -55°C',
        desc: 'Weather clouds, airplane cruising (10 km), Mt. Everest (8.8 km)'
      };
    } else if (alt <= 50000) {
      return {
        id: 'strato',
        name: '🎈 Stratosphere',
        altitudeRange: '12 – 50 km',
        density: '20% to 1%',
        temp: '-55°C to 0°C',
        desc: 'Ozone shield layer (20–35 km), weather research balloons (32 km)'
      };
    } else if (alt <= 85000) {
      return {
        id: 'meso',
        name: '🌠 Mesosphere',
        altitudeRange: '50 – 85 km',
        density: '0.1% to 0.001%',
        temp: '-90°C (Coldest Layer)',
        desc: 'Shooting stars & meteors burn up from friction with gas molecules'
      };
    } else if (alt <= 600000) {
      return {
        id: 'thermo',
        name: '🌌 Thermosphere & Kármán Line',
        altitudeRange: '85 – 600 km',
        density: 'Near Vacuum',
        temp: '+500°C to +1500°C',
        desc: 'Official edge of space (100 km), Aurora Borealis, ISS orbit (408 km)'
      };
    } else {
      return {
        id: 'space',
        name: '✨ Exosphere & Outer Space',
        altitudeRange: '> 600 km',
        density: 'Pure Vacuum',
        temp: 'Cosmic Microwave Background',
        desc: 'Deep outer space, stars, satellites, Earth curvature limb below'
      };
    }
  };

  // Integration step
  lab.stepPhysics = function(dt = 0.1) {
    const cfg = lab.getConfig();
    const state = lab.state;

    // Fuel consumption (Optimized for a 15-25 second educational flight demonstration)
    if (!cfg.infiniteFuel && state.currentFuel > 0 && cfg.thrust > 0) {
      const burnPerSec = 14.0; // Empties in ~7 seconds so students see burnout, apex, and free fall in 15-25s
      const fuelUsed = Math.min(state.currentFuel, burnPerSec * dt);
      state.currentFuel = Math.max(0, state.currentFuel - fuelUsed);
      state.currentMass = Math.max(cfg.mass * 0.4, cfg.mass * (0.4 + 0.6 * (state.currentFuel / 100)));
    } else {
      state.currentMass = cfg.mass;
    }

    const p = lab.calcPhysics();
    state.accelX = p.ax;
    state.accelY = p.ay;

    state.velX += state.accelX * dt;
    state.velY += state.accelY * dt;

    state.posX += state.velX * dt;
    state.posY += state.velY * dt;
    state.maxAltReached = Math.max(state.maxAltReached || 0, state.posY);

    // Ground boundary enforcement
    if (state.posY <= 0) {
      state.posY = 0;
      if (state.velY < 0) state.velY = 0;
      if (p.fy <= 0) {
        state.accelY = 0;
        state.velX *= 0.5;
        if (Math.abs(state.velX) < 0.1) state.velX = 0;
      }
    }

    state.simTime += dt;

    // Record trajectory point for curved flight path rendering
    state.trajectoryPoints.push({ x: state.posX, y: state.posY });
    if (state.trajectoryPoints.length > 700) state.trajectoryPoints.shift();

    // Save history snapshot
    const speed = Math.hypot(state.velX, state.velY);
    const totalAccel = Math.hypot(state.accelX, state.accelY);
    state.historyData.push({
      t: state.simTime,
      x: state.posX,
      y: state.posY,
      vx: state.velX,
      vy: state.velY,
      speed,
      ax: state.accelX,
      ay: state.accelY,
      totalAccel,
      netForce: p.netForce,
      fuel: state.currentFuel
    });

    if (state.historyData.length > 5000) state.historyData.shift();

    // Check challenge accomplishments
    if (lab.verifyChallenges) {
      lab.verifyChallenges(p);
    }
  };
})(window.PhysicsLab);
