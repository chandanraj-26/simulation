/**
 * CoasterLab — Classical Mechanics & Kinematics Engine
 * Energy conservation, centripetal acceleration, normal contact force,
 * G-force calculation, friction dissipation, and ballistic projectile dynamics.
 */

const Physics = {
  G: 9.81, // Gravitational acceleration (m/s^2)

  /**
   * Computes velocity at height y given total mechanical energy.
   * v = sqrt( 2 * (E_total - PE) / m )
   */
  getVelocity(totalEnergy, mass, y) {
    if (mass <= 0) return 0;
    const pe = mass * this.G * Math.max(0, y);
    const availableKE = Math.max(0, totalEnergy - pe);
    return Math.sqrt((2 * availableKE) / mass);
  },

  /**
   * Normal contact force N exerted by track on cart:
   * N = m * (v^2 * kappa + g * tx)
   * Where kappa is track curvature (1/R for circle) and tx is unit tangent x-component.
   */
  calculateNormalForce(mass, velocity, curvature, tx) {
    if (mass <= 0) return 0;
    const centripetalTerm = mass * (velocity * velocity) * curvature;
    // Gravity normal projection: g * tx acts along the inward normal vector
    const gravityNormalTerm = mass * this.G * tx;
    return centripetalTerm + gravityNormalTerm;
  },

  /**
   * Apparent weight felt by riders (in units of G).
   */
  calculateGForce(normalForce, mass) {
    if (mass <= 0) return 1.0;
    return normalForce / (mass * this.G);
  },

  /**
   * Kinetic energy: KE = 0.5 * m * v^2
   */
  getKineticEnergy(mass, velocity) {
    return 0.5 * mass * velocity * velocity;
  },

  /**
   * Gravitational potential energy: PE = m * g * y
   */
  getPotentialEnergy(mass, y) {
    return mass * this.G * Math.max(0, y);
  },

  /**
   * Work done by friction across an incremental track arc ds:
   * dW_f = mu * m * g * cos(alpha) * ds
   */
  getFrictionWorkIncrement(mass, mu, trackAngle, ds) {
    if (mu <= 0 || ds <= 0) return 0;
    const normalGravity = mass * this.G * Math.abs(Math.cos(trackAngle));
    return mu * normalGravity * ds;
  },

  /**
   * Projectile free-fall kinematics step for detached cart:
   * Governed solely by gravity (ax = 0, ay = -g)
   */
  projectileStep(cart, dt) {
    cart.vy -= this.G * dt;
    cart.x += cart.vx * dt;
    cart.y += cart.vy * dt;

    // Cart rotational tumble
    cart.angle += cart.tumbleSpeed * dt;

    // Ground collision test
    if (cart.y <= 0) {
      cart.y = 0;
      cart.vy = 0;
      cart.vx *= 0.2; // friction skidding on ground
      return true; // impacted ground
    }
    return false;
  }
};

window.Physics = Physics;
