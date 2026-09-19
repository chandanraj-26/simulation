/**
 * CircuitLab — Interactive Wheatstone Bridge & Meter Bridge Physics Engine
 * Performs exact nodal analysis, Thévenin equivalent calculations,
 * Meter Bridge calculations, sensitivity analysis, and step-by-step math derivations.
 */

/**
 * Solves the Wheatstone Bridge network.
 * @param {Object} p - Circuit parameters from state
 * @returns {Object} Full telemetry and physics analysis
 */
export function solveWheatstone(p) {
  const isMeterBridge = p.mode === 'meterBridge';
  const isChallenge = p.mode === 'challenge';

  let P = p.P;
  let Q = p.Q;
  let R = p.R;
  let S = isChallenge ? p.mysteryS : p.S;

  // In meter bridge mode, P and Q are determined by wire length l
  let l = Math.max(0.1, Math.min(99.9, p.jockeyPos));
  let lEffA = l + p.endErrorA;
  let lEffC = (100.0 - l) + p.endErrorC;

  if (isMeterBridge) {
    const sigma = p.meterWireResPerCm;
    P = lEffA * sigma;
    Q = lEffC * sigma;
    R = p.R;
    S = isChallenge ? p.mysteryS : p.S;
  }

  // Ensure non-zero positive resistances
  P = Math.max(0.001, P);
  Q = Math.max(0.001, Q);
  R = Math.max(0.001, R);
  S = Math.max(0.001, S);

  const key1 = p.keyK1;
  const key2 = p.keyK2 && (!isMeterBridge || p.jockeyTouching);
  const Vbat = p.voltage;
  const rBat = Math.max(0.001, p.rBat);

  // Effective Galvanometer Resistance (accounting for optional protection shunt)
  const isShunted = p.galvSensitivity === 'shunted';
  const Rshunt = 5.0; // 5 Ohm parallel protection shunt
  const RgEff = isShunted ? (p.Rg * Rshunt) / (p.Rg + Rshunt) : p.Rg;

  // Default results if battery key is open
  if (!key1) {
    return {
      VA: 0, VB: 0, VC: 0, VD: 0,
      VBD: 0, Vth: 0, Rth: 0,
      IP: 0, IQ: 0, IR: 0, IS: 0,
      Ig: 0, IgalvActual: 0, Itotal: 0,
      P_ratio: P / Q,
      RS_ratio: R / S,
      isBalanced: Math.abs(P / Q - R / S) < 1e-4,
      deflectionDiv: 0,
      P, Q, R, S,
      l, lEffA, lEffC,
      reqBridge: 0,
      sensitivity: 0,
      errorPct: 0,
      wireResistivity: 0
    };
  }

  // Exact Nodal Analysis:
  // Node C is Ground (0 V). Node A is positive rail.
  // When Key 2 is closed, nodes B and D are connected through RgEff.
  // When Key 2 is open, RgEff -> infinity (conductance 0).
  const Gg = key2 ? 1 / RgEff : 0;
  const GB = 1 / P + 1 / Q + Gg;
  const GD = 1 / R + 1 / S + Gg;
  const det = GB * GD - Gg * Gg;

  // Input admittance Yin = Itotal / VA
  const vB_per_VA = (GD / P + Gg / R) / det;
  const vD_per_VA = (GB / R + Gg / P) / det;

  const Yin = (1 - vB_per_VA) / P + (1 - vD_per_VA) / R;
  const ReqBridge = 1 / Math.max(1e-9, Yin);

  // Loaded battery voltage at Node A
  const VA = Vbat * (ReqBridge / (ReqBridge + rBat));
  const VB = VA * vB_per_VA;
  const VD = VA * vD_per_VA;
  const VC = 0;

  // Branch currents (conventional current from higher to lower potential)
  const IP = (VA - VB) / P;
  const IQ = VB / Q;
  const IR = (VA - VD) / R;
  const IS = VD / S;
  const Itotal = IP + IR;

  // Galvanometer current from B to D
  const I_BD = key2 ? (VB - VD) / RgEff : 0;
  // Actual current passing through galvanometer coil
  const IgalvActual = isShunted ? I_BD * (Rshunt / (p.Rg + Rshunt)) : I_BD;

  // Thévenin equivalent across terminals B and D
  const Vth = VA * (Q / (P + Q) - S / (R + S));
  const Rth = (P * Q) / (P + Q) + (R * S) / (R + S);

  // Ratios
  const P_ratio = P / Q;
  const RS_ratio = R / S;
  const isBalanced = Math.abs(P_ratio - RS_ratio) < 0.002 || Math.abs(IgalvActual) < 0.2e-6;

  // Deflection in scale divisions (-30 to +30)
  // Full scale is 300 microamps = 30 div -> 10 uA per division
  const currentPerDiv = 10e-6;
  let deflectionDiv = IgalvActual / currentPerDiv;
  // Clamped at physical mechanical stops (-35 to +35)
  deflectionDiv = Math.max(-35, Math.min(35, deflectionDiv));

  // If balanced within tolerance, snap deflection to exact 0
  if (isBalanced) {
    deflectionDiv = 0;
  }

  // Experimental Unknown Resistance S calculated from meter bridge formula
  const calculatedS_meterBridge = R * (lEffC / lEffA);

  // Fractional percentage error estimation: dS/S = 100 * dl / (l * (100 - l)) with dl = 0.1 cm
  const dl = 0.1; // 1 mm reading error on meter scale
  const errorPct = (100.0 * dl) / (l * (100.0 - l)) * 100.0;

  // Specific Resistance / Resistivity rho of unknown wire
  // rho = (S * pi * d^2) / (4 * L)
  const d_meters = (p.unknownWireDiameter || 0.45) * 1e-3;
  const L_meters = (p.unknownWireLength || 100.0) * 1e-2;
  const crossSectionArea = (Math.PI * d_meters * d_meters) / 4;
  const wireResistivity = (S * crossSectionArea) / Math.max(1e-4, L_meters);

  // Bridge Sensitivity: d(theta)/d(dR/R)
  // S_bridge = (V * Rth) / (Rg + Rth) * [ P*Q / (P+Q)^2 ]
  const sensitivity = (VA / (RgEff + Rth)) * ((P * Q) / Math.pow(P + Q, 2)) * 1000;

  return {
    VA, VB, VC, VD,
    VBD: VB - VD,
    Vth, Rth,
    IP, IQ, IR, IS,
    Ig: I_BD,
    IgalvActual,
    Itotal,
    P_ratio,
    RS_ratio,
    isBalanced,
    deflectionDiv,
    P, Q, R, S,
    l, lEffA, lEffC,
    calculatedS_meterBridge,
    errorPct,
    wireResistivity,
    sensitivity,
    reqBridge: ReqBridge
  };
}

/**
 * Generates pedagogical step-by-step mathematical explanation cards with LaTeX-style fractions.
 * @param {Object} results - output from solveWheatstone
 * @param {Object} state - current simulation state
 * @returns {string} HTML markup for math explainer cards
 */
export function generateMathExplanation(results, state) {
  const isMeter = state.mode === 'meterBridge';
  const { P, Q, R, S, VA, VB, VD, VBD, Ig, deflectionDiv, isBalanced, l, calculatedS_meterBridge, errorPct } = results;

  const fmt = (n, dec = 2) => (typeof n === 'number' ? n.toFixed(dec) : n);
  const fmtExp = (n) => {
    if (Math.abs(n) < 1e-5) return '0.00';
    return (n * 1e6).toFixed(2);
  };

  // Step 1: Bridge Ratios & Balance Condition
  const pOverQ = fmt(P / Q, 3);
  const rOverS = fmt(R / S, 3);

  const step1Html = `
    <div class="math-step-card ${isBalanced ? 'step-balanced' : ''}">
      <div class="math-step-title">
        <span>Step 1: Ratio Arm Balance Condition (Kirchhoff's Junction & Loop Laws)</span>
        <span class="hud-badge ${isBalanced ? 'badge-balanced' : 'badge-unbalanced'}">
          ${isBalanced ? '✓ Bridge Balanced' : '⚠ Bridge Unbalanced'}
        </span>
      </div>
      <div class="math-step-formula">
        <span>Condition:</span>
        <span class="frac"><span class="num">P</span><span class="denom">Q</span></span>
        <span>=</span>
        <span class="frac"><span class="num">R</span><span class="denom">S</span></span>
        <span>&iff;</span>
        <span>P &middot; S = Q &middot; R</span>
      </div>
      <div class="math-step-body">
        <div class="math-line">
          <span>Arm Ratio 1:</span>
          <span class="frac"><span class="num">P</span><span class="denom">Q</span></span>
          <span>=</span>
          <span class="frac"><span class="num">${fmt(P, 1)} &Omega;</span><span class="denom">${fmt(Q, 1)} &Omega;</span></span>
          <span>= <b>${pOverQ}</b></span>
        </div>
        <div class="math-line">
          <span>Arm Ratio 2:</span>
          <span class="frac"><span class="num">R</span><span class="denom">S</span></span>
          <span>=</span>
          <span class="frac"><span class="num">${fmt(R, 1)} &Omega;</span><span class="denom">${fmt(S, 1)} &Omega;</span></span>
          <span>= <b>${rOverS}</b></span>
        </div>
        <div class="math-line" style="margin-top:4px; font-size:12.5px;">
          ${isBalanced 
            ? '<span style="color:#16a34a; font-weight:700;">Since P/Q = R/S, potential V<sub>B</sub> = V<sub>D</sub>, so NO current flows through the Galvanometer (I<sub>g</sub> = 0)!</span>' 
            : `<span style="color:#b45309; font-weight:700;">Since P/Q &ne; R/S (${pOverQ} &ne; ${rOverS}), a potential difference exists: V<sub>BD</sub> = ${fmt(VBD, 3)} V.</span>`
          }
        </div>
      </div>
    </div>
  `;

  // Step 2: Unbalanced Bridge & Galvanometer Current
  const step2Html = `
    <div class="math-step-card">
      <div class="math-step-title">
        <span>Step 2: Thévenin Equivalent & Galvanometer Current (I<sub>g</sub>)</span>
      </div>
      <div class="math-step-formula">
        <span>I<sub>g</sub> = </span>
        <span class="frac">
          <span class="num">V<sub>th</sub></span>
          <span class="denom">R<sub>th</sub> + R<sub>g</sub></span>
        </span>
        <span>=</span>
        <span class="frac">
          <span class="num">V &middot; [ <span class="frac"><span class="num">Q</span><span class="denom">P + Q</span></span> &minus; <span class="frac"><span class="num">S</span><span class="denom">R + S</span></span> ]</span>
          <span class="denom">R<sub>th</sub> + R<sub>g</sub></span>
        </span>
      </div>
      <div class="math-step-body">
        <div class="math-line">
          <span>Node Voltages:</span>
          <span>V<sub>A</sub> = ${fmt(VA, 2)} V,</span>
          <span>V<sub>B</sub> = ${fmt(VB, 3)} V,</span>
          <span>V<sub>D</sub> = ${fmt(VD, 3)} V</span>
        </div>
        <div class="math-line">
          <span>Open-Circuit Voltage (V<sub>BD</sub>):</span>
          <span>V<sub>B</sub> &minus; V<sub>D</sub> = <b>${fmt(VBD, 4)} V</b></span>
        </div>
        <div class="math-line">
          <span>Galvanometer Current (I<sub>g</sub>):</span>
          <span><b>${fmtExp(Ig)} &mu;A</b> &rarr; Pointer Deflection: <b>${fmt(deflectionDiv, 1)} divisions</b></span>
        </div>
      </div>
    </div>
  `;

  // Step 3: Meter Bridge Formula & Error Analysis (if in meter bridge mode)
  let step3Html = '';
  if (isMeter) {
    step3Html = `
      <div class="math-step-card">
        <div class="math-step-title">
          <span>Step 3: Meter Bridge Unknown Resistance & Sensitivity Analysis</span>
        </div>
        <div class="math-step-formula">
          <span>S = R &middot; </span>
          <span class="frac">
            <span class="num">100 &minus; l</span>
            <span class="denom">l</span>
          </span>
          <span>&emsp; &amp; &emsp;</span>
          <span class="frac">
            <span class="num">&Delta;S</span>
            <span class="denom">S</span>
          </span>
          <span>=</span>
          <span class="frac">
            <span class="num">100 &middot; &Delta;l</span>
            <span class="denom">l (100 &minus; l)</span>
          </span>
        </div>
        <div class="math-step-body">
          <div class="math-line">
            <span>Balancing Length (l):</span>
            <span><b>${fmt(l, 1)} cm</b> &emsp;|&emsp; (100 &minus; l) = <b>${fmt(100 - l, 1)} cm</b></span>
          </div>
          <div class="math-line">
            <span>Calculated Resistance (S):</span>
            <span>${fmt(R, 1)} &times; (${fmt(100 - l, 1)} / ${fmt(l, 1)}) = <b style="color:#2563eb; font-size:14px;">${fmt(calculatedS_meterBridge, 2)} &Omega;</b></span>
          </div>
          <div class="math-line">
            <span>Estimated Reading Uncertainty (&plusmn;&Delta;l = 1 mm):</span>
            <span><b>${fmt(errorPct, 2)}%</b></span>
            <span style="font-size:11.5px; color:#64748b;">(Minimal at l = 50.0 cm)</span>
          </div>
        </div>
      </div>
    `;
  }

  return step1Html + step2Html + step3Html;
}
