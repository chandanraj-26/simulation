/**
 * ProjectileLab — Kinematics & Aerodynamic Physics Engine
 * Analytical & numerical projectile trajectory modeling, air drag integration,
 * velocity decomposition, and gravity environments.
 */

const Physics = {
  // Gravity environments (m/s^2)
  environments: {
    'earth': { name: 'Earth', g: 9.81, airDensity: 1.225, desc: 'Standard terrestrial gravity & sea-level atmosphere.' },
    'moon': { name: 'The Moon', g: 1.62, airDensity: 0.0, desc: 'Vacuum lunar surface with ~1/6th Earth gravity.' },
    'mars': { name: 'Mars', g: 3.71, airDensity: 0.02, desc: 'Thin CO2 atmosphere and ~38% Earth gravity.' },
    'jupiter': { name: 'Jupiter', g: 24.79, airDensity: 1.5, desc: 'Crushing Jovian gas giant gravitational pull.' },
    'custom': { name: 'Custom Environment', g: 9.81, airDensity: 1.225, desc: 'User-configured gravitational acceleration.' }
  },

  // Projectile types catalog
  projectiles: {
    'cannonball': {
      name: 'Steel Cannonball',
      mass: 5.0, // kg
      radius: 0.10, // m
      Cd: 0.47, // sphere drag coefficient
      color: '#334155',
      accentColor: '#94a3b8'
    },
    'baseball': {
      name: 'Baseball',
      mass: 0.145, // kg
      radius: 0.037, // m
      Cd: 0.30,
      color: '#f8fafc',
      accentColor: '#ef4444'
    },
    'golfball': {
      name: 'Golf Ball (Dimpled)',
      mass: 0.046, // kg
      radius: 0.021, // m
      Cd: 0.25,
      color: '#ffffff',
      accentColor: '#cbd5e1'
    },
    'tank_shell': {
      name: 'APFSDS Tank Shell',
      mass: 8.5, // kg
      radius: 0.06, // m
      Cd: 0.15, // streamlined
      color: '#15803d',
      accentColor: '#eab308'
    },
    'piano': {
      name: 'Heavy Grand Piano',
      mass: 300.0, // kg
      radius: 0.65, // m
      Cd: 1.15, // bluff body
      color: '#090d16',
      accentColor: '#f1f5f9'
    }
  },

  degToRad(deg) {
    return (deg * Math.PI) / 180.0;
  },

  radToDeg(rad) {
    return (rad * 180.0) / Math.PI;
  },

  /**
   * Calculates ideal analytical trajectory parameters (no air resistance)
   * @param {number} v0 - Initial launch velocity (m/s)
   * @param {number} angleDeg - Launch angle in degrees (0 to 90)
   * @param {number} y0 - Initial launch elevation height (m)
   * @param {number} g - Gravitational acceleration (m/s^2)
   */
  calculateIdealKinematics(v0, angleDeg, y0, g) {
    const theta = this.degToRad(angleDeg);
    const v0x = v0 * Math.cos(theta);
    const v0y = v0 * Math.sin(theta);

    // Max height H_max = y0 + (v0y^2) / (2*g)
    const maxHeight = y0 + (v0y * v0y) / (2 * g);

    // Time to reach peak height: t_peak = v0y / g (if launched upwards)
    const timeToPeak = v0y > 0 ? v0y / g : 0;

    // Time of flight: solve y(t) = y0 + v0y*t - 0.5*g*t^2 = 0
    // Quadratic formula: 0.5*g*t^2 - v0y*t - y0 = 0
    const discriminant = v0y * v0y + 2 * g * y0;
    const timeOfFlight = (v0y + Math.sqrt(Math.max(0, discriminant))) / g;

    // Total horizontal range R = v0x * t_flight
    const range = v0x * timeOfFlight;

    return {
      v0x,
      v0y,
      maxHeight,
      timeToPeak,
      timeOfFlight,
      range
    };
  },

  /**
   * Computes trajectory points with optional numerical air drag
   */
  generateTrajectoryPath(params) {
    const {
      v0,
      angleDeg,
      y0 = 0,
      g = 9.81,
      useAirDrag = false,
      airDensity = 1.225,
      projectileKey = 'cannonball'
    } = params;

    const proj = this.projectiles[projectileKey] || this.projectiles['cannonball'];
    const theta = this.degToRad(angleDeg);
    const points = [];

    // Analytical (No drag)
    if (!useAirDrag || airDensity <= 0) {
      const ideal = this.calculateIdealKinematics(v0, angleDeg, y0, g);
      const totalTime = Math.max(0.1, ideal.timeOfFlight);
      const dt = totalTime / 120.0;

      for (let t = 0; t <= totalTime + dt * 0.5; t += dt) {
        const x = ideal.v0x * t;
        const y = Math.max(0, y0 + ideal.v0y * t - 0.5 * g * t * t);
        const vx = ideal.v0x;
        const vy = ideal.v0y - g * t;
        points.push({ x, y, vx, vy, t });
        if (y <= 0 && t > 0) break;
      }
      return {
        points,
        range: ideal.range,
        maxHeight: ideal.maxHeight,
        timeOfFlight: ideal.timeOfFlight
      };
    }

    // Numerical integration with quadratic air drag: F_drag = 0.5 * Cd * rho * A * v^2
    const area = Math.PI * proj.radius * proj.radius;
    const m = proj.mass;
    const kDrag = 0.5 * proj.Cd * airDensity * area;

    let x = 0;
    let y = Math.max(0, y0);
    let vx = v0 * Math.cos(theta);
    let vy = v0 * Math.sin(theta);
    let t = 0;
    const dt = 0.015; // 15 ms step

    let currentMaxH = y;
    points.push({ x, y, vx, vy, t });

    while (y >= 0 && t < 120.0 && x < 2000.0) {
      const speed = Math.hypot(vx, vy);
      const fDrag = kDrag * speed * speed;
      const fDragX = speed > 0 ? -fDrag * (vx / speed) : 0;
      const fDragY = speed > 0 ? -fDrag * (vy / speed) : 0;

      const ax = fDragX / m;
      const ay = -g + fDragY / m;

      // Euler-Cromer integration
      vx += ax * dt;
      vy += ay * dt;
      x += vx * dt;
      y += vy * dt;
      t += dt;

      if (y > currentMaxH) currentMaxH = y;

      if (y <= 0) {
        points.push({ x, y: 0, vx, vy, t });
        break;
      }

      points.push({ x, y, vx, vy, t });
    }

    return {
      points,
      range: x,
      maxHeight: currentMaxH,
      timeOfFlight: t
    };
  }
};

window.Physics = Physics;
