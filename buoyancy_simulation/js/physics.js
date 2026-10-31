/**
 * PhysicsEngine - Archimedes' Principle, Density & Dynamic Flotation
 * Solves:
 *   Density: rho = m / V
 *   Gravity Force: Fg = m * g
 *   Buoyant Force: Fb = rho_fluid * V_sub * g
 *   Net Acceleration: a = (Fg - Fb - drag) / m
 */

export const MATERIALS = [
  { id: 'styrofoam', name: 'Styrofoam', density: 0.05, color: '#f8fafc', stroke: '#cbd5e1' },
  { id: 'wood_pine', name: 'Pine Wood', density: 0.50, color: '#d97706', stroke: '#92400e' },
  { id: 'ice', name: 'Ice (Glacial)', density: 0.92, color: '#bae6fd', stroke: '#0284c7' },
  { id: 'aluminum', name: 'Solid Aluminum', density: 2.70, color: '#cbd5e1', stroke: '#64748b' },
  { id: 'steel', name: 'Carbon Steel', density: 7.85, color: '#64748b', stroke: '#334155' },
  { id: 'copper', name: 'Pure Copper', density: 8.96, color: '#f97316', stroke: '#c2410c' },
  { id: 'gold', name: 'Solid Gold Bar', density: 19.30, color: '#eab308', stroke: '#a16207' },
  { id: 'custom', name: 'Custom Adjustable', density: 1.00, color: '#6366f1', stroke: '#4338ca' }
];

export const LIQUIDS = [
  { id: 'water', name: 'Pure Water', density: 1.00, color: 'rgba(56, 189, 248, 0.45)', surfaceColor: '#0284c7' },
  { id: 'sea_water', name: 'Dense Sea Water', density: 1.03, color: 'rgba(14, 165, 233, 0.55)', surfaceColor: '#0369a1' },
  { id: 'oil', name: 'Olive Oil', density: 0.92, color: 'rgba(234, 179, 8, 0.45)', surfaceColor: '#ca8a04' },
  { id: 'glycerin', name: 'Viscous Glycerin', density: 1.26, color: 'rgba(168, 85, 247, 0.35)', surfaceColor: '#9333ea' },
  { id: 'mercury', name: 'Liquid Mercury', density: 13.60, color: 'rgba(148, 163, 184, 0.95)', surfaceColor: '#475569' }
];

export class BuoyancyModel {
  constructor() {
    this.selectedMaterialId = 'wood_pine';
    this.selectedLiquidId = 'water';

    // Block physical properties
    this.volume = 2.0;       // Liters (dm³)
    this.mass = 1.0;         // kg
    this.g = 9.80;           // m/s²

    // Dynamic state (1D vertical axis)
    this.y = 0.0;            // displacement relative to water line in meters
    this.vy = 0.0;           // velocity in m/s
    this.isGrabbed = false;

    // Scale mode
    this.showVectors = true;
    this.history = [];
    this.quiz = null;

    this.recalcMaterial();
  }

  get material() {
    return MATERIALS.find(m => m.id === this.selectedMaterialId) || MATERIALS[1];
  }

  get liquid() {
    return LIQUIDS.find(l => l.id === this.selectedLiquidId) || LIQUIDS[0];
  }

  recalcMaterial() {
    if (this.selectedMaterialId !== 'custom') {
      this.mass = parseFloat((this.material.density * this.volume).toFixed(2));
    }
  }

  get density() {
    return this.mass / this.volume;
  }

  // Analytical physics state
  getTelemetry() {
    const rho_obj = this.density;
    const rho_fluid = this.liquid.density;
    const V_total = this.volume; // L
    const g = this.g;

    const gravityForce = this.mass * g; // Newtons

    // Equilibrium submerged fraction
    const submergedFraction = Math.min(1.0, rho_obj / rho_fluid);
    const V_submerged = submergedFraction * V_total; // L
    const maxBuoyantForce = rho_fluid * V_total * g; // if fully submerged
    const buoyantForce = rho_fluid * V_submerged * g; // at equilibrium

    const isFloating = (rho_obj < rho_fluid);
    const isNeutral = Math.abs(rho_obj - rho_fluid) < 0.02;
    const isSinking = (rho_obj > rho_fluid);

    let stateLabel = 'Floats (Partially Submerged)';
    if (isNeutral) stateLabel = 'Neutrally Buoyant (Suspended)';
    else if (isSinking) stateLabel = 'Sinks to Bottom';

    const apparentWeight = isSinking ? gravityForce - maxBuoyantForce : 0;

    return {
      mass: parseFloat(this.mass.toFixed(2)),
      volume: parseFloat(this.volume.toFixed(2)),
      densityObj: parseFloat(rho_obj.toFixed(2)),
      densityFluid: parseFloat(rho_fluid.toFixed(2)),
      gravityForce: parseFloat(gravityForce.toFixed(2)),
      buoyantForce: parseFloat(buoyantForce.toFixed(2)),
      maxBuoyantForce: parseFloat(maxBuoyantForce.toFixed(2)),
      apparentWeight: parseFloat(apparentWeight.toFixed(2)),
      submergedFraction: parseFloat((submergedFraction * 100).toFixed(1)),
      V_displaced: parseFloat(V_submerged.toFixed(2)),
      isFloating,
      isNeutral,
      isSinking,
      stateLabel
    };
  }

  // Numerical time step for smooth bobbing animation
  updatePhysics(dt) {
    if (this.isGrabbed) return;

    const rho_fluid = this.liquid.density;
    const g = this.g;
    const m = Math.max(0.01, this.mass);
    const blockHeightMeters = 0.25;

    // Submerged depth in meters (-blockHeight/2 to +blockHeight/2 around y)
    // y = 0 means center of block is at water surface
    const bottomY = this.y + blockHeightMeters / 2;
    let submergedH = Math.max(0, Math.min(blockHeightMeters, bottomY));
    let frac = submergedH / blockHeightMeters;

    // Forces
    const Fg = m * g;
    const Fb = rho_fluid * (frac * this.volume) * g;
    const damping = -6.0 * this.vy * (frac > 0 ? 3.0 : 0.5);

    const Fnet = Fg - Fb + damping;
    const ay = Fnet / m;

    this.vy += ay * dt;
    this.y += this.vy * dt;

    // Bottom tank floor collision limit
    const floorY = 0.45;
    if (this.y > floorY) {
      this.y = floorY;
      if (this.vy > 0) this.vy = -this.vy * 0.15;
    }

    // Top ceiling limit
    if (this.y < -0.35) {
      this.y = -0.35;
      this.vy = 0;
    }
  }

  logObservation() {
    const time = new Date().toLocaleTimeString();
    const t = this.getTelemetry();
    this.history.unshift({
      time,
      material: this.material.name,
      liquid: this.liquid.name,
      densityObj: `${t.densityObj} kg/L`,
      densityFluid: `${t.densityFluid} kg/L`,
      buoyantForce: `${t.buoyantForce} N`,
      displaced: `${t.V_displaced} L`,
      state: t.stateLabel
    });
    if (this.history.length > 20) this.history.pop();
  }

  generateQuiz() {
    // Pick random material and random liquid
    const mat = MATERIALS[Math.floor(Math.random() * (MATERIALS.length - 1))];
    const liq = LIQUIDS[Math.floor(Math.random() * LIQUIDS.length)];
    this.selectedMaterialId = mat.id;
    this.selectedLiquidId = liq.id;
    this.volume = +(Math.random() * 2 + 1).toFixed(1);
    this.recalcMaterial();

    const t = this.getTelemetry();
    this.quiz = {
      targetState: t.isFloating ? 'float' : (t.isNeutral ? 'neutral' : 'sink'),
      targetSubmerged: t.submergedFraction,
      prompt: `Predict the behavior of ${mat.name} (ρ = ${t.densityObj} kg/L) placed in ${liq.name} (ρ = ${t.densityFluid} kg/L). Will it Float or Sink, and what % of its volume will submerge?`
    };
    return this.quiz;
  }
}
