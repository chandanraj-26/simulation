/**
 * PendulumLab — Classical Nonlinear Pendulum & Kinematics Engine
 * Numerical RK4 integration of d²θ/dt² + (b/mL²)dθ/dt + (g/L)sinθ = 0,
 * large-angle series expansion, string tension, and energy conservation.
 */

const Physics = {
  // Planetary gravity presets (m/s^2)
  environments: {
    'earth': { name: 'Earth', g: 9.81, desc: 'Standard terrestrial gravitational field.' },
    'moon': { name: 'The Moon', g: 1.62, desc: 'Lunar surface gravity (~1/6th of Earth).' },
    'mars': { name: 'Mars', g: 3.71, desc: 'Martian gravitational acceleration (~38% Earth).' },
    'jupiter': { name: 'Jupiter', g: 24.79, desc: 'Crushing Jovian gravitational acceleration.' },
    'zerog': { name: 'Zero-G Orbit', g: 0.0, desc: 'Weightless microgravity condition.' }
  },

  degToRad(deg) {
    return (deg * Math.PI) / 180.0;
  },

  radToDeg(rad) {
    return (rad * 180.0) / Math.PI;
  },

  /**
   * Small-Angle Theoretical Period: T0 = 2*PI*sqrt(L/g)
   */
  calculateSmallAnglePeriod(length, g) {
    if (length <= 0 || g <= 0) return 0;
    return 2.0 * Math.PI * Math.sqrt(length / g);
  },

  /**
   * Exact Large-Angle Period via Borda / Legendre series expansion:
   * T = T0 * (1 + (1/16)*theta0^2 + (11/3072)*theta0^4 + ...)
   */
  calculateExactPeriod(length, g, theta0Rad) {
    const t0 = this.calculateSmallAnglePeriod(length, g);
    if (t0 <= 0) return 0;
    const th2 = theta0Rad * theta0Rad;
    const th4 = th2 * th2;
    const correction = 1.0 + (1.0 / 16.0) * th2 + (11.0 / 3072.0) * th4;
    return t0 * correction;
  },

  /**
   * Computes angular acceleration alpha = d²θ/dt²:
   * alpha = -(g / L) * sin(theta) - (damping / (m * L^2)) * omega
   */
  getAngularAcceleration(theta, omega, length, mass, g, damping) {
    if (length <= 0 || mass <= 0) return 0;
    const restoring = -(g / length) * Math.sin(theta);
    const drag = (damping / (mass * length * length)) * omega;
    return restoring - drag;
  },

  /**
   * Runge-Kutta 4th Order (RK4) Step for stable nonlinear pendulum
   */
  rk4Step(theta, omega, dt, length, mass, g, damping) {
    // k1
    const a1 = this.getAngularAcceleration(theta, omega, length, mass, g, damping);
    const v1 = omega;

    // k2
    const th2 = theta + 0.5 * v1 * dt;
    const om2 = omega + 0.5 * a1 * dt;
    const a2 = this.getAngularAcceleration(th2, om2, length, mass, g, damping);

    // k3
    const th3 = theta + 0.5 * om2 * dt;
    const om3 = omega + 0.5 * a2 * dt;
    const a3 = this.getAngularAcceleration(th3, om3, length, mass, g, damping);

    // k4
    const th4 = theta + om3 * dt;
    const om4 = omega + a3 * dt;
    const a4 = this.getAngularAcceleration(th4, om4, length, mass, g, damping);

    const newTheta = theta + (dt / 6.0) * (v1 + 2.0 * om2 + 2.0 * om3 + om4);
    const newOmega = omega + (dt / 6.0) * (a1 + 2.0 * a2 + 2.0 * a3 + a4);
    const newAlpha = this.getAngularAcceleration(newTheta, newOmega, length, mass, g, damping);

    return { theta: newTheta, omega: newOmega, alpha: newAlpha };
  },

  /**
   * Tension force in the string:
   * T_tension = m * (g * cos(theta) + L * omega^2)
   */
  calculateTension(theta, omega, length, mass, g) {
    const v = length * omega;
    const centripetal = (v * v) / length;
    const gravityComponent = g * Math.cos(theta);
    return Math.max(0, mass * (gravityComponent + centripetal));
  },

  /**
   * Energy Breakdown:
   * E_k = 0.5 * m * (L * omega)^2
   * E_p = m * g * h = m * g * L * (1 - cos(theta))
   */
  calculateEnergies(theta, omega, length, mass, g) {
    const v = length * omega;
    const ke = 0.5 * mass * v * v;
    const h = length * (1.0 - Math.cos(theta));
    const pe = mass * g * h;
    return {
      ke: Math.max(0, ke),
      pe: Math.max(0, pe),
      total: ke + pe,
      h: h,
      v: Math.abs(v)
    };
  }
};

window.Physics = Physics;
