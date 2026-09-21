/**
 * ArchimedesLab — Interactive Archimedes' Principle & Buoyancy Simulation
 * Physics Calculation Engine
 * Formulates exact hydrostatic forces, buoyant force, Hooke's law, apparent weight,
 * flotation equilibrium, and step-by-step mathematical explanations.
 */

/**
 * Solve all hydrostatic and buoyancy telemetry.
 * @param {Object} p - State snapshot
 * @returns {Object} Comprehensive physics solution
 */
export function solveArchimedes(p) {
  const g = p.g; // m/s²
  const rho_f = Math.max(1, p.fluidDensity); // kg/m³
  const rho_obj = Math.max(1, p.objectDensity); // kg/m³

  // Object Volume in m³ (1 cm³ = 1e-6 m³)
  const V_total_cm3 = Math.max(1, p.objectVolumeCm3);
  const V_total = V_total_cm3 * 1e-6; // m³
  const H_cm = Math.max(1, p.objectHeightCm);
  const H_m = H_cm * 0.01; // m
  const area_m2 = V_total / H_m; // m²

  // Additional cargo for boat mode
  const cargoMassKg = (p.mode === 'flotation' && p.objectShape === 'boat') ? (p.boatCargoMassGrams * 0.001) : 0;

  // Object Mass and True Weight in Air
  const baseObjectMassKg = rho_obj * V_total;
  const totalMassKg = baseObjectMassKg + cargoMassKg;
  const W_true = totalMassKg * g; // Newtons
  const effectiveDensity = totalMassKg / V_total; // kg/m³

  // Determine Submersion Percentage
  let submersionPct = p.submersionPct;
  let isFreelyFloating = (p.mode === 'flotation');

  if (isFreelyFloating) {
    // Flotation equilibrium: Object settles where Buoyant Force = Total Weight
    // V_sub * rho_f * g = m_total * g => V_sub / V_total = effectiveDensity / rho_f
    const floatRatio = effectiveDensity / rho_f;
    if (floatRatio <= 1.0) {
      submersionPct = floatRatio * 100.0;
    } else {
      submersionPct = 100.0; // Sunk to the bottom
    }
  }

  // Clamped submersion fraction
  const subFrac = Math.max(0, Math.min(1, submersionPct / 100.0));
  const V_sub = V_total * subFrac; // m³
  const V_sub_cm3 = V_total_cm3 * subFrac; // cm³

  // Displaced Fluid Mass & Weight
  const m_disp = rho_f * V_sub; // kg
  const m_disp_grams = m_disp * 1000; // grams
  const W_disp = m_disp * g; // N

  // Buoyant Force (Archimedes' Principle)
  const F_buoyant = rho_f * V_sub * g; // N

  // Tension on Spring Balance / Apparent Weight
  let tension = 0;
  let normalForceBottom = 0;
  let netForce = 0;

  if (isFreelyFloating) {
    // Freely floating without string balance
    if (effectiveDensity <= rho_f) {
      // Floating or neutral: Net force is 0, Apparent weight is 0
      tension = 0;
      normalForceBottom = 0;
      netForce = 0;
    } else {
      // Sunk to the bottom: Normal force from bottom supports remaining weight
      normalForceBottom = Math.max(0, W_true - F_buoyant);
      tension = 0;
      netForce = 0;
    }
  } else {
    // Suspended from Spring Balance
    if (W_true >= F_buoyant) {
      tension = W_true - F_buoyant;
      netForce = 0;
    } else {
      // Object wants to float up; tension in string goes slack (0 N)
      tension = 0;
      netForce = F_buoyant - W_true; // Net upward buoyant acceleration if untethered
    }
  }

  const W_apparent = tension;
  const weightLoss = Math.max(0, W_true - W_apparent);

  // Hydrostatic Pressure at Top and Bottom of Submerged Body
  // Assume top of body is at depth h_top when submerged by subFrac
  const submergedHeight = H_m * subFrac;
  const h_top = subFrac > 0 ? (0.05) : 0; // 5 cm baseline depth for realism
  const h_bottom = h_top + submergedHeight;

  const P_atm = 101325; // Pa
  const P_top_gauge = rho_f * g * h_top; // Pa
  const P_bottom_gauge = rho_f * g * h_bottom; // Pa
  const deltaP = P_bottom_gauge - P_top_gauge; // Pa

  const F_top_down = P_top_gauge * area_m2;
  const F_bottom_up = P_bottom_gauge * area_m2;
  const F_hydro_net = deltaP * area_m2; // Equals F_buoyant

  // Flotation Character
  let character = 'Neutral';
  let characterBadge = 'badge-neutral';
  const densityRatio = effectiveDensity / rho_f;

  if (densityRatio < 0.99) {
    character = `Floats (${submersionPct.toFixed(1)}% Submerged)`;
    characterBadge = 'badge-floating';
  } else if (densityRatio > 1.01) {
    character = isFreelyFloating ? 'Sinks to Bottom' : 'Sinking Density';
    characterBadge = 'badge-sinking';
  } else {
    character = 'Neutrally Buoyant (Suspended)';
    characterBadge = 'badge-neutral';
  }

  // Verification error percentage between Weight Loss and Displaced Fluid Weight
  const diff = Math.abs(weightLoss - W_disp);
  const errorPct = W_true > 0 ? (diff / W_true) * 100 : 0;
  const isVerified = Math.abs(F_buoyant - W_disp) < 1e-4;

  return {
    g,
    rho_f,
    rho_obj,
    effectiveDensity,
    V_total_cm3,
    V_total,
    V_sub_cm3,
    V_sub,
    H_cm,
    H_m,
    area_m2,
    submersionPct,
    subFrac,
    totalMassKg,
    cargoMassKg,
    baseObjectMassKg,
    W_true,
    m_disp,
    m_disp_grams,
    W_disp,
    F_buoyant,
    W_apparent,
    weightLoss,
    tension,
    normalForceBottom,
    netForce,
    h_top,
    h_bottom,
    P_top_gauge,
    P_bottom_gauge,
    deltaP,
    F_top_down,
    F_bottom_up,
    F_hydro_net,
    character,
    characterBadge,
    densityRatio,
    errorPct,
    isVerified,
    isFreelyFloating
  };
}

/**
 * Generate Step-by-Step Educational Explanation Cards for Archimedes' Principle
 * @param {Object} sol - Physics solution from solveArchimedes
 * @returns {Array<{badge: string, title: string, formula: string, result: string, isHighlight?: boolean}>}
 */
export function generateMathExplanation(sol) {
  const steps = [];

  // Step 1: True Weight in Air
  steps.push({
    badge: 'Step 1: Weight in Air',
    title: 'True Gravitational Weight (W₀ = mg)',
    formula: `W₀ = m · g = (ρ_obj · V) · g = (${sol.effectiveDensity.toFixed(0)} kg/m³ × ${(sol.V_total * 1e4).toFixed(3)}×10⁻⁴ m³) × ${sol.g.toFixed(2)} m/s²`,
    result: `W₀ = ${sol.W_true.toFixed(3)} N  (Mass: ${(sol.totalMassKg * 1000).toFixed(1)} g)`
  });

  // Step 2: Displaced Fluid Volume & Mass
  steps.push({
    badge: 'Step 2: Displaced Fluid',
    title: 'Volume & Mass of Displaced Fluid',
    formula: `V_sub = ${(sol.submersionPct).toFixed(1)}% of ${sol.V_total_cm3.toFixed(0)} cm³ = ${sol.V_sub_cm3.toFixed(1)} cm³\nm_f = ρ_fluid · V_sub = ${sol.rho_f.toFixed(0)} kg/m³ × ${(sol.V_sub * 1e4).toFixed(3)}×10⁻⁴ m³`,
    result: `Displaced Fluid Mass: ${sol.m_disp_grams.toFixed(1)} g`
  });

  // Step 3: Upward Buoyant Force (Archimedes' Law)
  steps.push({
    badge: "Step 3: Archimedes' Principle",
    title: 'Buoyant Force equals Displaced Fluid Weight',
    formula: `F_B = m_f · g = ρ_fluid · V_sub · g = ${sol.m_disp.toFixed(4)} kg × ${sol.g.toFixed(2)} m/s²`,
    result: `F_B = ${sol.F_buoyant.toFixed(3)} N  (Displaced Weight: ${sol.W_disp.toFixed(3)} N)`
  });

  // Step 4: Hydrostatic Pressure Differential
  steps.push({
    badge: 'Step 4: Hydrostatic Origin',
    title: 'Pressure Differential across Immersed Faces',
    formula: `ΔP = ρ_f · g · Δh = ${sol.deltaP.toFixed(1)} Pa\nF_net = ΔP · A = (${sol.P_bottom_gauge.toFixed(1)} - ${sol.P_top_gauge.toFixed(1)} Pa) × ${(sol.area_m2 * 1e4).toFixed(2)} cm²`,
    result: `F_pressure = ${sol.F_hydro_net.toFixed(3)} N  (= F_B exactly)`
  });

  // Step 5: Apparent Weight & Verification
  const isLossVerified = Math.abs(sol.weightLoss - sol.W_disp) < 0.005;
  steps.push({
    badge: 'Step 5: Experimental Verification',
    title: 'Apparent Weight Loss = Displaced Fluid Weight',
    formula: `W_apparent = W₀ - F_B = ${sol.W_true.toFixed(3)} N - ${sol.F_buoyant.toFixed(3)} N = ${sol.W_apparent.toFixed(3)} N\nWeight Loss = ${sol.W_true.toFixed(3)} N - ${sol.W_apparent.toFixed(3)} N = ${sol.weightLoss.toFixed(3)} N`,
    result: isLossVerified
      ? `✓ Archimedes' Principle Confirmed! Loss (${sol.weightLoss.toFixed(3)} N) = Displaced Fluid (${sol.W_disp.toFixed(3)} N)`
      : `Displaced Weight = ${sol.W_disp.toFixed(3)} N`,
    isHighlight: true
  });

  return steps;
}
