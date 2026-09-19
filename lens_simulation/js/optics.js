/**
 * OpticsLab — Interactive Lens Simulation
 * Pure Optics Calculation Engine
 * Follows the New Cartesian Sign Convention:
 * - Optical Center O is at (0, 0)
 * - Incident light travels from Left to Right (+x)
 * - Object distance u is negative (u < 0) for real objects in front of lens
 * - Convex Lens: f > 0
 * - Concave Lens: f < 0
 * - Thin Lens Equation: 1/v - 1/u = 1/f => v = (u * f) / (u + f)
 * - Magnification: m = v / u = h_i / h_o => h_i = m * h_o
 */

/**
 * Calculate optical properties of the current system.
 * @param {Object} params
 * @param {string} params.lensType 'convex' | 'concave'
 * @param {number} params.focalLength magnitude in cm (> 0)
 * @param {number} params.objectDistance Cartesian coordinate u in cm (< 0)
 * @param {number} params.objectHeight Cartesian coordinate h_o in cm (> 0)
 * @param {number} [params.apertureHeight=30]
 */
export function calculateOptics({ lensType, focalLength, objectDistance, objectHeight, apertureHeight = 30 }) {
  const isConvex = lensType === 'convex';
  // Signed focal length according to Cartesian Sign Convention
  const f = isConvex ? Math.abs(focalLength) : -Math.abs(focalLength);
  const u = objectDistance; // typically negative
  const ho = objectHeight;

  // Cardinal points in Cartesian coordinates (cm)
  // Left side: F1 (-f), 2F1 (-2f) for convex; for concave, near focus is at -|f|
  const absF = Math.abs(focalLength);
  const cardinalPoints = {
    O: { x: 0, y: 0, label: 'O' },
    F1: { x: -absF, y: 0, label: 'F₁' },
    twoF1: { x: -2 * absF, y: 0, label: '2F₁' },
    F2: { x: absF, y: 0, label: 'F₂' },
    twoF2: { x: 2 * absF, y: 0, label: '2F₂' }
  };

  // Check for Object at Focus (u + f = 0)
  const denom = u + f;
  const isAtInfinity = Math.abs(denom) < 0.2; // within 2mm threshold

  let v = null;
  let m = null;
  let hi = null;
  let isReal = null;
  let isUpright = null;
  let sizeCategory = 'magnified';
  let zoneDescription = '';

  if (!isAtInfinity) {
    v = (u * f) / denom;
    m = v / u;
    hi = m * ho;
    isReal = v > 0;
    isUpright = m > 0;

    const absM = Math.abs(m);
    if (Math.abs(absM - 1.0) < 0.04) {
      sizeCategory = 'same';
    } else if (absM > 1.0) {
      sizeCategory = 'magnified';
    } else {
      sizeCategory = 'diminished';
    }

    // Pedagogical zone descriptions
    if (isConvex) {
      if (u < -2 * absF - 0.8) {
        zoneDescription = 'Between F₂ and 2F₂ (Diminished, Real, Inverted)';
      } else if (Math.abs(u - (-2 * absF)) <= 0.8) {
        zoneDescription = 'At 2F₂ (Same Size, Real, Inverted)';
      } else if (u > -2 * absF + 0.8 && u < -absF - 0.8) {
        zoneDescription = 'Beyond 2F₂ (Magnified, Real, Inverted)';
      } else if (u > -absF + 0.8) {
        zoneDescription = 'Behind Object on Same Side (Virtual, Upright, Magnifying Glass)';
      } else {
        zoneDescription = 'Near Infinity';
      }
    } else {
      zoneDescription = 'Between Optical Center (O) and Focus F₁ (Virtual, Diminished, Upright)';
    }
  } else {
    isReal = null;
    isUpright = null;
    sizeCategory = 'infinite';
    zoneDescription = 'Image Formed at Infinity (Emergent rays are parallel)';
  }

  // Optical power in Diopters (P = 1 / f in meters = 100 / f in cm)
  const power = (100 / f).toFixed(2);

  // Compute 3 Principal Ray Geometries
  const rays = computePrincipalRays({
    isConvex,
    f,
    absF,
    u,
    ho,
    v,
    hi,
    isAtInfinity,
    apertureHeight
  });

  return {
    lensType,
    f,
    absF,
    u,
    ho,
    v,
    m,
    hi,
    power,
    cardinalPoints,
    isAtInfinity,
    isReal,
    isUpright,
    sizeCategory,
    zoneDescription,
    rays
  };
}

/**
 * Compute geometric coordinates for the 3 textbook principal rays.
 * Returns segment arrays for incident, refracted, and virtual back-extensions.
 */
function computePrincipalRays({ isConvex, f, absF, u, ho, v, hi, isAtInfinity, apertureHeight }) {
  const lensApertureMaxY = apertureHeight / 2;
  const targetV = v !== null && !isAtInfinity ? v : 60;
  const rayEndX = Math.max(130, targetV > 0 ? targetV + 45 : 130);
  const rayLeftBound = Math.min(-140, u - 45, targetV < 0 ? targetV - 45 : -140);

  // Object tip coordinates
  const tip = { x: u, y: ho };

  // =========================================================================
  // RAY 1: Parallel to Principal Axis from object tip to lens plane
  // Convex: Refracts through opposite focus F2 (+absF, 0)
  // Concave: Diverges as if coming from near focus F1 (-absF, 0)
  // =========================================================================
  const ray1 = {
    id: 1,
    name: 'Ray 1: Parallel to Axis',
    color: '#06b6d4', // Cyan
    incident: [tip, { x: 0, y: ho }],
    refracted: [],
    virtual: []
  };

  if (isConvex) {
    // Passes through (absF, 0). Slope k = (0 - ho) / (absF - 0) = -ho / absF
    const k1 = -ho / absF;
    const yEnd = ho + k1 * rayEndX;
    ray1.refracted = [{ x: 0, y: ho }, { x: rayEndX, y: yEnd }];

    // If virtual image (u > -absF), emergent rays diverge, so back-extension is needed
    if (v !== null && v < 0) {
      // Virtual line extends backward from (0, ho) to (v, hi) or left bound
      ray1.virtual = [{ x: 0, y: ho }, { x: Math.min(v - 10, rayLeftBound), y: ho + k1 * Math.min(v - 10, rayLeftBound) }];
    }
  } else {
    // Concave: Diverges from (-absF, 0).
    // Slope from (-absF, 0) to (0, ho) is k = ho / absF
    const k1 = ho / absF;
    const yEnd = ho + k1 * rayEndX;
    ray1.refracted = [{ x: 0, y: ho }, { x: rayEndX, y: yEnd }];
    // Virtual back-extension connects (0, ho) back through (-absF, 0)
    ray1.virtual = [{ x: 0, y: ho }, { x: -absF - 10, y: ho + k1 * (-absF - 10) }];
  }

  // =========================================================================
  // RAY 2: Through Optical Center O (0, 0)
  // Passes straight through without deviation
  // =========================================================================
  const ray2 = {
    id: 2,
    name: 'Ray 2: Through Optical Center (O)',
    color: '#3b82f6', // Bright Blue
    incident: [tip, { x: 0, y: 0 }],
    refracted: [],
    virtual: []
  };

  // Slope k2 = (0 - ho) / (0 - u) = ho / u
  const k2 = ho / u;
  const yEnd2 = k2 * rayEndX;
  ray2.refracted = [{ x: 0, y: 0 }, { x: rayEndX, y: yEnd2 }];

  if (v !== null && v < 0) {
    // Virtual back-extension to the left past the image
    const virtX = Math.min(v - 10, rayLeftBound);
    ray2.virtual = [{ x: 0, y: 0 }, { x: virtX, y: k2 * virtX }];
  }

  // =========================================================================
  // RAY 3: Directed through Focus
  // Convex: Through near focus F1 (-absF, 0) to lens -> emerges parallel to axis at y = hi
  // Concave: Directed towards far focus F2 (+absF, 0) to lens -> emerges parallel to axis at y = hi
  // =========================================================================
  // =========================================================================
  // RAY 3: Directed through Focus
  // Convex:
  //   - If u < -absF (outside focus): Ray from tip passes through F1 (-absF, 0)
  //     to lens at (0, hi) -> emerges parallel to principal axis at height hi.
  //   - If -absF < u < 0 (inside focus / magnifier): Ray from tip is directed
  //     along line from F1 (-absF, 0) -> hits lens at (0, hi) -> emerges parallel.
  //     Dashed guide from F1 to tip shows alignment.
  //   - If u == -absF (at focus): Ray through F1 is vertical, parallel to lens.
  // Concave:
  //   - Incident ray from tip aimed towards far focus F2 (+absF, 0)
  //     hits lens at (0, hi) -> emerges parallel to principal axis at height hi.
  // =========================================================================
  const ray3 = {
    id: 3,
    name: 'Ray 3: Focal Ray (Emerges Parallel)',
    color: '#10b981', // Emerald Green
    incident: [],
    refracted: [],
    virtual: [],
    focalGuide: [],
    incidentTargetVirt: []
  };

  if (!isAtInfinity && hi !== null) {
    const yLens3 = hi;

    if (isConvex) {
      if (u < -absF) {
        // Normal case: Object is beyond F1.
        // Ray travels from tip through F1 (-absF, 0) to the lens at (0, hi).
        // Broken into 2 segments: [tip -> F1] and [F1 -> lens] for clear arrow placement
        ray3.incidentSegments = [
          [tip, { x: -absF, y: 0 }],
          [{ x: -absF, y: 0 }, { x: 0, y: yLens3 }]
        ];
        // Backward compatibility
        ray3.incident = [tip, { x: 0, y: yLens3 }];

        // Refracted ray emerges parallel to principal axis at height hi.
        // If real image formed at v > 0, split into [lens -> image] and [image -> end]
        if (v !== null && v > 0) {
          ray3.refractedSegments = [
            [{ x: 0, y: yLens3 }, { x: v, y: yLens3 }],
            [{ x: v, y: yLens3 }, { x: rayEndX, y: yLens3 }]
          ];
        } else {
          ray3.refractedSegments = [
            [{ x: 0, y: yLens3 }, { x: rayEndX, y: yLens3 }]
          ];
        }
        ray3.refracted = [{ x: 0, y: yLens3 }, { x: rayEndX, y: yLens3 }];
      } else {
        // Magnifying glass case: Object is inside focal length (-absF < u < 0).
        // Light travels from tip to lens (0, yLens3).
        ray3.incident = [tip, { x: 0, y: yLens3 }];
        ray3.incidentSegments = [[tip, { x: 0, y: yLens3 }]];

        // Dashed guide line showing this ray aligns with near focus F1
        ray3.focalGuide = [{ x: -absF, y: 0 }, tip];

        // Refracted ray emerges parallel to principal axis
        ray3.refracted = [{ x: 0, y: yLens3 }, { x: rayEndX, y: yLens3 }];
        ray3.refractedSegments = [[{ x: 0, y: yLens3 }, { x: rayEndX, y: yLens3 }]];

        // Virtual backward extension to virtual image at (v, hi)
        if (v < 0) {
          ray3.virtual = [{ x: 0, y: yLens3 }, { x: Math.min(v - 15, rayLeftBound), y: yLens3 }];
        }
      }
    } else {
      // Concave Lens: Incident ray aimed towards far focus F2 (+absF, 0).
      // Ray travels from tip to lens at (0, yLens3).
      ray3.incident = [tip, { x: 0, y: yLens3 }];
      ray3.incidentSegments = [[tip, { x: 0, y: yLens3 }]];

      // Dashed projection towards far focus F2 to show aim
      ray3.incidentTargetVirt = [{ x: 0, y: yLens3 }, { x: absF, y: 0 }];

      // Refracted ray emerges parallel to axis at height yLens3
      ray3.refracted = [{ x: 0, y: yLens3 }, { x: rayEndX, y: yLens3 }];
      ray3.refractedSegments = [[{ x: 0, y: yLens3 }, { x: rayEndX, y: yLens3 }]];

      // Virtual back-extension: horizontal dashed line to virtual image
      ray3.virtual = [{ x: 0, y: yLens3 }, { x: Math.min(v - 15, rayLeftBound), y: yLens3 }];
    }
  } else {
    // When object is at focus (u = -f for convex lens), ray from tip through F1
    // is purely vertical and parallel to lens plane.
    if (isConvex) {
      ray3.isVerticalAtFocus = true;
      ray3.focalGuide = [{ x: -absF, y: 0 }, tip];
      ray3.incident = [];
      ray3.refracted = [];
    }
  }

  return [ray1, ray2, ray3];
}

/**
 * Helper to generate HTML for vertical fraction with numerator over denominator.
 */
export function makeFrac(num, denom) {
  return `<span class="frac"><span class="num">${num}</span><span class="denom">${denom}</span></span>`;
}

function gcd(a, b) {
  a = Math.round(Math.abs(a));
  b = Math.round(Math.abs(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

/**
 * Generate formatted mathematical step-by-step calculations with Cartesian signs
 * presented as clean vertical fractions and LCM steps tailored for Class 10 physics students.
 */
export function generateMathExplanation(optics) {
  const { isConvex, f, absF, u, ho, v, m, hi, isAtInfinity, power } = optics;

  const steps = [];

  // Step 1: Given data with Cartesian signs
  steps.push({
    title: '1. Given Optical Parameters (Cartesian Sign Convention)',
    body: [
      `<b>Object Distance (<i>u</i>):</b> ${u.toFixed(1)} cm &nbsp;<span style="color:#64748b;">(Negative: measured opposite to incident light, left of lens)</span>`,
      `<b>Focal Length (<i>f</i>):</b> ${f > 0 ? '+' : ''}${f.toFixed(1)} cm &nbsp;<span style="color:#64748b;">(${f > 0 ? 'Convex lens has POSITIVE focus (+f)' : 'Concave lens has NEGATIVE focus (-f)'})</span>`,
      `<b>Object Height (<i>h</i><sub>o</sub>):</b> +${ho.toFixed(1)} cm &nbsp;<span style="color:#64748b;">(Positive: measured perpendicularly upward from principal axis)</span>`,
      `<b>Lens Power (<i>P</i>):</b> <i>P</i> = ${makeFrac('100', '<i>f</i> (cm)')} = ${makeFrac('100', `${f > 0 ? '+' : ''}${f.toFixed(1)}`)} = <b>${power > 0 ? '+' : ''}${power} D</b>`
    ]
  });

  // Step 2: Thin Lens Formula with Vertical Fractions & LCM
  const lensFormulaHeader = `${makeFrac('1', '<i>v</i>')} − ${makeFrac('1', '<i>u</i>')} = ${makeFrac('1', '<i>f</i>')} &nbsp;&nbsp;⟹&nbsp;&nbsp; ${makeFrac('1', '<i>v</i>')} = ${makeFrac('1', '<i>f</i>')} + ${makeFrac('1', '<i>u</i>')}`;

  if (isAtInfinity) {
    steps.push({
      title: '2. Applying the Thin Lens Formula',
      formula: lensFormulaHeader,
      body: [
        `<b>Step A (Substitute values):</b> &nbsp; ${makeFrac('1', '<i>v</i>')} = ${makeFrac('1', `+${absF.toFixed(1)}`)} + ${makeFrac('1', `(${u.toFixed(1)})`)} = ${makeFrac('1', absF.toFixed(1))} − ${makeFrac('1', absF.toFixed(1))}`,
        `<b>Step B (Common Denominator):</b> &nbsp; ${makeFrac('1', '<i>v</i>')} = ${makeFrac('1 − 1', absF.toFixed(1))} = ${makeFrac('0', absF.toFixed(1))} = 0`,
        `<b>Step C (Solve for <i>v</i>):</b> &nbsp; <i>v</i> = ${makeFrac('1', '0')} &nbsp;⟹&nbsp; <b style="color:#d97706;"><i>v</i> = ∞ (Infinity)</b>`,
        `💡 <i>Conclusion:</i> When the object is at the Principal Focus (<i>u</i> = −<i>f</i>), refracted rays emerge parallel and meet at infinity.`
      ]
    });
  } else {
    // Solve with Class 10 fraction LCM method
    const absU = Math.abs(u);
    const mult = (Number.isInteger(absF) && Number.isInteger(absU)) ? 1 : 10;
    const fInt = Math.round(absF * mult);
    const uInt = Math.round(absU * mult);

    const g = gcd(fInt, uInt);
    const commonDenomInt = (fInt * uInt) / g;
    const commonDenom = commonDenomInt / mult;

    const numF = (f > 0) ? Math.round(commonDenomInt / fInt) : -Math.round(commonDenomInt / fInt);
    const numU = -Math.round(commonDenomInt / uInt);
    const totalNum = numF + numU;

    const resG = gcd(Math.abs(totalNum), Math.round(commonDenomInt));
    const simpNum = totalNum / (mult > 1 ? resG : resG);
    const simpDenom = (commonDenomInt / (mult > 1 ? resG : resG)) / mult;

    const vFormatted = Number.isInteger(v) ? `${v > 0 ? '+' : ''}${v}` : `${v > 0 ? '+' : ''}${v.toFixed(1)}`;

    let subHtml = '';
    if (f > 0) {
      subHtml = `${makeFrac('1', '<i>v</i>')} = ${makeFrac('1', `+${absF.toFixed(1)}`)} + ${makeFrac('1', `(${u.toFixed(1)})`)} = ${makeFrac('1', absF.toFixed(1))} − ${makeFrac('1', absU.toFixed(1))}`;
    } else {
      subHtml = `${makeFrac('1', '<i>v</i>')} = ${makeFrac('1', `−${absF.toFixed(1)}`)} + ${makeFrac('1', `(${u.toFixed(1)})`)} = −${makeFrac('1', absF.toFixed(1))} − ${makeFrac('1', absU.toFixed(1))}`;
    }

    let lcmExpr = (f > 0) ? `${numF} − ${Math.abs(numU)}` : `−${Math.abs(numF)} − ${Math.abs(numU)}`;
    let lcmHtml = `${makeFrac('1', '<i>v</i>')} = ${makeFrac(lcmExpr, commonDenom.toFixed(mult > 1 ? 1 : 0))} = ${makeFrac(totalNum, commonDenom.toFixed(mult > 1 ? 1 : 0))}`;
    if (resG > 1 && totalNum !== 0) {
      lcmHtml += ` = ${makeFrac(simpNum, simpDenom.toFixed(mult > 1 ? 1 : 0))}`;
    }

    steps.push({
      title: '2. Applying the Thin Lens Formula',
      formula: lensFormulaHeader,
      body: [
        `<b>Step A (Substitute values):</b> &nbsp; ${subHtml}`,
        `<b>Step B (Take LCM & Subtract):</b> &nbsp; ${lcmHtml}`,
        `<b>Step C (Invert to find <i>v</i>):</b> &nbsp; <i>v</i> = ${makeFrac(simpDenom.toFixed(mult > 1 ? 1 : 0), simpNum)} &nbsp;⟹&nbsp; <b style="color:${v > 0 ? '#16a34a' : '#7c3aed'}; font-size:14px;"><i>v</i> = ${vFormatted} cm</b>`,
        v > 0
          ? `👉 <b style="color:#16a34a;"><i>v</i> is POSITIVE (+):</b> A <b>REAL image</b> is formed on the other side of the lens.`
          : `👉 <b style="color:#7c3aed;"><i>v</i> is NEGATIVE (−):</b> A <b>VIRTUAL image</b> is formed on the same side as the object.`
      ]
    });

    // Step 3: Linear Magnification
    const magFormulaHeader = `<i>m</i> = ${makeFrac('<i>v</i>', '<i>u</i>')} = ${makeFrac('<i>h</i><sub>i</sub>', '<i>h</i><sub>o</sub>')} &nbsp;&nbsp;⟹&nbsp;&nbsp; <i>h</i><sub>i</sub> = <i>m</i> × <i>h</i><sub>o</sub>`;

    const hiFormatted = Number.isInteger(hi) ? `${hi > 0 ? '+' : ''}${hi}` : `${hi > 0 ? '+' : ''}${hi.toFixed(1)}`;

    steps.push({
      title: '3. Linear Magnification (m) & Image Height (hᵢ)',
      formula: magFormulaHeader,
      body: [
        `<b>Step A (Calculate <i>m</i>):</b> &nbsp; <i>m</i> = ${makeFrac(`${v > 0 ? '+' : ''}${v.toFixed(1)}`, `${u.toFixed(1)}`)} = <b style="font-size:14px; color:#2563eb;">${m > 0 ? '+' : ''}${m.toFixed(2)}</b>`,
        `<b>Step B (Calculate Image Height <i>h</i><sub>i</sub>):</b> &nbsp; <i>h</i><sub>i</sub> = (${m.toFixed(2)}) × (+${ho.toFixed(1)} cm) = <b style="font-size:14px; color:${hi > 0 ? '#7c3aed' : '#dc2626'};">${hiFormatted} cm</b>`,
        m < 0
          ? `👉 <b style="color:#dc2626;">Negative sign of <i>m</i>:</b> The image is <b>INVERTED</b> (real images are always inverted).`
          : `👉 <b style="color:#2563eb;">Positive sign of <i>m</i>:</b> The image is <b>ERECT / UPRIGHT</b> (virtual images are always upright).`,
        Math.abs(m) > 1.05
          ? `👉 <b style="color:#d97706;">|<i>m</i>| &gt; 1:</b> The image is <b>MAGNIFIED / ENLARGED</b> (${Math.abs(m).toFixed(2)}× original size).`
          : Math.abs(m) < 0.95
          ? `👉 <b style="color:#475569;">|<i>m</i>| &lt; 1:</b> The image is <b>DIMINISHED</b> (${Math.abs(m).toFixed(2)}× original size).`
          : `👉 <b style="color:#0f766e;">|<i>m</i>| = 1:</b> The image is <b>SAME SIZE</b> as the object.`
      ]
    });
  }

  return steps;
}
