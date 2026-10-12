/**
 * SpringLab — Hooke's Law & Harmonic Motion Physics Engine
 * Analytical equilibrium calculations, Series/Parallel configurations,
 * RK4 / Verlet integration, damping regimes, and energy conservation.
 */

const Physics = {
  // Planetary gravity presets (m/s^2)
  environments: {
    'earth': { name: 'Earth', g: 9.81, desc: 'Standard terrestrial gravity.' },
    'moon': { name: 'The Moon', g: 1.62, desc: 'Low lunar gravity (~1/6th Earth).' },
    'mars': { name: 'Mars', g: 3.71, desc: 'Martian gravity (~38% Earth).' },
    'jupiter': { name: 'Jupiter', g: 24.79, desc: 'Jovian gravitational pull.' },
    'zerog': { name: 'Zero-G (Orbit)', g: 0.0, desc: 'Weightless microgravity environment.' }
  },

  // Available slotted brass weights and mystery objects (mass in kg)
  weightsCatalog: [
    { id: 'w_50g', name: '50 g Brass Disc', mass: 0.05, color: '#f59e0b', type: 'disc' },
    { id: 'w_100g', name: '100 g Brass Disc', mass: 0.10, color: '#d97706', type: 'disc' },
    { id: 'w_250g', name: '250 g Brass Disc', mass: 0.25, color: '#b45309', type: 'disc' },
    { id: 'w_500g', name: '500 g Brass Cylinder', mass: 0.50, color: '#92400e', type: 'cylinder' },
    { id: 'w_1000g', name: '1000 g Cast Iron Block', mass: 1.00, color: '#334155', type: 'block' },
    { id: 'w_crown', name: 'Royal Golden Crown (Mystery)', mass: 0.38, color: '#fbbf24', type: 'crown', isMystery: true },
    { id: 'w_crystal', name: 'Quartz Geode (Mystery)', mass: 0.18, color: '#a855f7', type: 'crystal', isMystery: true },
    { id: 'w_wooden', name: 'Oak Wood Block (Mystery)', mass: 0.08, color: '#78350f', type: 'wood', isMystery: true }
  ],

  /**
   * Computes effective spring constant based on topology
   * @param {string} mode - 'single' | 'series' | 'parallel'
   * @param {number} k1 - Spring 1 stiffness (N/m)
   * @param {number} k2 - Spring 2 stiffness (N/m)
   */
  getEffectiveK(mode, k1, k2 = 50) {
    if (mode === 'series') {
      return (k1 * k2) / (k1 + k2);
    } else if (mode === 'parallel') {
      return k1 + k2;
    }
    return k1;
  },

  /**
   * Static Equilibrium Elongation: Delta x_eq = (m * g) / k_eff
   */
  calculateEquilibrium(m, kEff, g) {
    if (kEff <= 0) return 0;
    return (m * g) / kEff;
  },

  /**
   * Natural Angular Frequency: omega = sqrt(k_eff / m)
   */
  calculateNaturalFrequency(m, kEff) {
    if (m <= 0 || kEff <= 0) return 0;
    return Math.sqrt(kEff / m);
  },

  /**
   * Period of Oscillation: T = 2 * PI * sqrt(m / k_eff)
   */
  calculatePeriod(m, kEff) {
    if (m <= 0 || kEff <= 0) return 0;
    return 2.0 * Math.PI * Math.sqrt(m / kEff);
  },

  /**
   * Critical Damping Coefficient: c_crit = 2 * sqrt(m * k_eff)
   */
  calculateCriticalDamping(m, kEff) {
    if (m <= 0 || kEff <= 0) return 0;
    return 2.0 * Math.sqrt(m * kEff);
  },

  /**
   * Acceleration function for second-order ODE:
   * a = (F_gravity - F_spring - F_damping) / m
   *   = g - (kEff * x) / m - (c * v) / m
   * where x is elongation relative to unstretched resting length L0 (downwards positive).
   */
  getAcceleration(x, v, m, kEff, g, c) {
    if (m <= 0) return 0;
    const fGravity = m * g;
    const fSpring = kEff * x;
    const fDamping = c * v;
    return (fGravity - fSpring - fDamping) / m;
  },

  /**
   * Runge-Kutta 4th Order (RK4) Step for stable harmonic physics
   */
  rk4Step(x, v, dt, m, kEff, g, c) {
    if (m <= 0) return { x: 0, v: 0, a: 0 };

    // k1
    const a1 = this.getAcceleration(x, v, m, kEff, g, c);
    const v1 = v;

    // k2
    const x2 = x + 0.5 * v1 * dt;
    const v2 = v + 0.5 * a1 * dt;
    const a2 = this.getAcceleration(x2, v2, m, kEff, g, c);

    // k3
    const x3 = x + 0.5 * v2 * dt;
    const v3 = v + 0.5 * a2 * dt;
    const a3 = this.getAcceleration(x3, v3, m, kEff, g, c);

    // k4
    const x4 = x + v3 * dt;
    const v4 = v + a3 * dt;
    const a4 = this.getAcceleration(x4, v4, m, kEff, g, c);

    const newX = x + (dt / 6.0) * (v1 + 2.0 * v2 + 2.0 * v3 + v4);
    const newV = v + (dt / 6.0) * (a1 + 2.0 * a2 + 2.0 * a3 + a4);
    const newA = this.getAcceleration(newX, newV, m, kEff, g, c);

    return { x: newX, v: newV, a: newA };
  },

  /**
   * Energy Breakdown
   * Kinetic: 0.5 * m * v^2
   * Elastic Potential: 0.5 * k * x^2
   * Gravitational Potential (reference at x = 0): -m * g * x
   */
  calculateEnergies(x, v, m, kEff, g) {
    const ke = 0.5 * m * v * v;
    const peElastic = 0.5 * kEff * x * x;
    const peGrav = -m * g * x;
    const total = ke + peElastic + peGrav;

    return {
      ke: Math.max(0, ke),
      peElastic: Math.max(0, peElastic),
      peGrav: peGrav,
      total: total
    };
  }
};

window.Physics = Physics;
