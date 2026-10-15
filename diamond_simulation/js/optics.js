/**
 * DiamondCutSim — Geometric Optics & Ray Tracing Engine for Diamond Crystals
 * Implements Snell's law, Sellmeier chromatic dispersion for diamond (C),
 * Total Internal Reflection (TIR), multi-bounce ray tracing through faceted
 * gem geometries, and critical angle calculations.
 */

const Optics = {
  // =========================================================================
  // 2D Vector Math
  // =========================================================================
  vec: {
    add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y }),
    sub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y }),
    mul: (a, s) => ({ x: a.x * s, y: a.y * s }),
    dot: (a, b) => a.x * b.x + a.y * b.y,
    cross: (a, b) => a.x * b.y - a.y * b.x,
    mag: a => Math.hypot(a.x, a.y),
    norm: a => {
      const m = Math.hypot(a.x, a.y);
      return m > 1e-9 ? { x: a.x / m, y: a.y / m } : { x: 0, y: 0 };
    },
    rotate: (v, rad) => ({
      x: v.x * Math.cos(rad) - v.y * Math.sin(rad),
      y: v.x * Math.sin(rad) + v.y * Math.cos(rad)
    }),
    reflect: (d, n) => {
      const dn = 2 * (d.x * n.x + d.y * n.y);
      return { x: d.x - dn * n.x, y: d.y - dn * n.y };
    },
    perp: a => ({ x: -a.y, y: a.x })
  },

  // =========================================================================
  // SPECTRAL COLOR BANDS — 7 VIBGYOR Wavelengths
  // =========================================================================
  spectralBands: [
    { name: 'Violet',  wl: 405, color: '#8b00ff' },
    { name: 'Indigo',  wl: 440, color: '#4b0082' },
    { name: 'Blue',    wl: 470, color: '#0060ff' },
    { name: 'Green',   wl: 532, color: '#00c853' },
    { name: 'Yellow',  wl: 580, color: '#ffd600' },
    { name: 'Orange',  wl: 610, color: '#ff6d00' },
    { name: 'Red',     wl: 680, color: '#ff1744' }
  ],

  // =========================================================================
  // MATERIAL PRESETS — Refractive Indices & Dispersion Constants
  // =========================================================================
  materials: {
    'diamond':    { name: 'Diamond (C)',       n: 2.417, cauchyB: 0.0354, desc: 'Exceptionally high RI and extreme fire.' },
    'cubic_z':    { name: 'Cubic Zirconia',    n: 2.170, cauchyB: 0.0280, desc: 'Popular diamond simulant with high brilliance.' },
    'moissanite': { name: 'Moissanite (SiC)',  n: 2.650, cauchyB: 0.0420, desc: 'Higher RI than diamond with rainbow fire.' },
    'glass':      { name: 'Crown Glass',       n: 1.520, cauchyB: 0.0044, desc: 'Ordinary optical glass with low dispersion.' },
    'sapphire':   { name: 'Sapphire (Al₂O₃)',  n: 1.770, cauchyB: 0.0100, desc: 'Hard corundum with moderate dispersion.' },
    'zircon':     { name: 'Zircon (ZrSiO₄)',   n: 1.930, cauchyB: 0.0150, desc: 'Natural gemstone with good fire.' }
  },

  /**
   * Cauchy Dispersion: n(λ) = n_D + B * (1/λ² - 1/λ_D²)
   * λ in nm; reference wavelength λ_D = 589 nm (Sodium D-line)
   */
  getRefractiveIndex(baseN, cauchyB, lambdaNm) {
    const lambdaUm = lambdaNm / 1000.0;
    const refLambdaUm = 0.589;
    const n = baseN + cauchyB * (1.0 / (lambdaUm * lambdaUm) - 1.0 / (refLambdaUm * refLambdaUm));
    return Math.max(1.0, n);
  },

  /**
   * Critical Angle for TIR: θ_c = arcsin(n₂/n₁)
   */
  getCriticalAngle(nInside, nOutside) {
    const ratio = nOutside / nInside;
    if (ratio >= 1.0) return Math.PI / 2;
    return Math.asin(ratio);
  },

  /**
   * Snell's Law Refraction: n₁ sin(θ₁) = n₂ sin(θ₂)
   * Returns refracted direction or null if TIR occurs.
   * @param {Object} d - Incident direction (unit vector)
   * @param {Object} n - Surface outward normal (unit vector, pointing away from medium 2)
   * @param {number} n1 - Refractive index of incident medium
   * @param {number} n2 - Refractive index of transmitted medium
   */
  refract(d, n, n1, n2) {
    const v = this.vec;
    const cosI = -v.dot(d, n);
    const mu = n1 / n2;
    const sinT2 = mu * mu * (1.0 - cosI * cosI);

    if (sinT2 > 1.0) return null; // TIR

    const cosT = Math.sqrt(1.0 - sinT2);
    return v.norm(v.add(v.mul(d, mu), v.mul(n, mu * cosI - cosT)));
  },

  /**
   * Ray-Segment Intersection: P + t*D intersects segment A→B
   */
  intersectRaySegment(P, D, A, B) {
    const v = this.vec;
    const AB = v.sub(B, A);
    const denom = v.cross(D, AB);
    if (Math.abs(denom) < 1e-9) return null;

    const AP = v.sub(P, A);
    const t = v.cross(AB, AP) / denom;
    const u = v.cross(D, AP) / denom;

    if (t > 1e-4 && u >= -0.001 && u <= 1.001) {
      return {
        point: v.add(P, v.mul(D, t)),
        t: t,
        u: Math.max(0, Math.min(1, u))
      };
    }
    return null;
  },

  /**
   * Find nearest facet intersection from a point with a direction
   * @param {Object} P - Ray origin
   * @param {Object} D - Ray direction (unit)
   * @param {Array}  facets - Array of { a, b, normal } objects
   * @param {number} skipFacetIdx - Index to skip (the facet we just came from)
   */
  findNearestFacetHit(P, D, facets, skipFacetIdx) {
    let nearest = null;
    let nearIdx = -1;

    for (let i = 0; i < facets.length; i++) {
      if (i === skipFacetIdx) continue;
      const f = facets[i];
      const hit = this.intersectRaySegment(P, D, f.a, f.b);
      if (hit && (!nearest || hit.t < nearest.t)) {
        nearest = hit;
        nearIdx = i;
      }
    }

    return nearest ? { hit: nearest, facetIdx: nearIdx } : null;
  },

  /**
   * Multi-Bounce Ray Trace through a faceted gem polygon
   * Traces a single wavelength ray through the diamond, bouncing via TIR
   * until it exits or runs out of bounces.
   *
   * @param {Object} rayOrigin  - Start point of the incident ray
   * @param {Object} rayDir     - Direction (unit) of incident ray
   * @param {Array}  facets     - Diamond facet array [{ a, b, normal }]
   * @param {number} nGem       - Refractive index of gem at this wavelength
   * @param {number} nAir       - Ambient RI (1.0)
   * @param {number} maxBounces - Maximum internal bounces allowed
   */
  traceRayThroughGem(rayOrigin, rayDir, facets, nGem, nAir, maxBounces) {
    const v = this.vec;
    const segments = [];
    const bouncePoints = [];

    // 1. Find entry facet
    const entryResult = this.findNearestFacetHit(rayOrigin, rayDir, facets, -1);
    if (!entryResult) {
      segments.push({ start: rayOrigin, end: v.add(rayOrigin, v.mul(rayDir, 1200)), type: 'incident', color: null });
      return { segments, bouncePoints, entered: false, exitDir: null, exitPoint: null, bounceCount: 0, iDeg: 0 };
    }

    const entryPoint = entryResult.hit.point;
    const entryFacet = facets[entryResult.facetIdx];

    // Calculate angle of incidence
    let entryNormal = entryFacet.normal;
    // Ensure normal points against the ray direction (outward)
    if (v.dot(rayDir, entryNormal) > 0) {
      entryNormal = v.mul(entryNormal, -1);
    }

    const cosI = Math.abs(v.dot(rayDir, entryNormal));
    const iDeg = Math.acos(Math.min(1, cosI)) * 180 / Math.PI;

    // Incident segment
    segments.push({ start: rayOrigin, end: entryPoint, type: 'incident', color: null });

    // 2. Refract into the gem (air → gem)
    const refractedDir = this.refract(rayDir, entryNormal, nAir, nGem);
    if (!refractedDir) {
      // Total external reflection (extremely rare at entry)
      const reflDir = v.reflect(rayDir, entryNormal);
      segments.push({ start: entryPoint, end: v.add(entryPoint, v.mul(reflDir, 600)), type: 'reflected', color: null });
      return { segments, bouncePoints, entered: false, exitDir: reflDir, exitPoint: entryPoint, bounceCount: 0, iDeg };
    }

    // Refraction angle
    const cosR = Math.abs(v.dot(refractedDir, entryNormal));
    const r1Deg = Math.acos(Math.min(1, cosR)) * 180 / Math.PI;

    // 3. Internal multi-bounce ray tracing
    let currentPos = entryPoint;
    let currentDir = refractedDir;
    let lastFacetIdx = entryResult.facetIdx;
    let bounceCount = 0;
    let exitDir = null;
    let exitPoint = null;

    for (let b = 0; b < maxBounces; b++) {
      const nextResult = this.findNearestFacetHit(currentPos, currentDir, facets, lastFacetIdx);
      if (!nextResult) {
        // Ray escaped through a gap (shouldn't happen in a closed polygon)
        segments.push({ start: currentPos, end: v.add(currentPos, v.mul(currentDir, 400)), type: 'internal', color: null });
        break;
      }

      const nextPoint = nextResult.hit.point;
      const nextFacet = facets[nextResult.facetIdx];

      // Check normal orientation (facetNormal points in direction ray is heading)
      let facetNormal = nextFacet.normal;
      if (v.dot(currentDir, facetNormal) < 0) {
        facetNormal = v.mul(facetNormal, -1);
      }

      // Internal segment
      segments.push({ start: currentPos, end: nextPoint, type: 'internal', color: null });
      bouncePoints.push({ point: nextPoint, normal: facetNormal, facetName: nextFacet.name });

      // Try to refract out (gem → air)
      const normalOpposing = v.mul(facetNormal, -1);
      const exitRefracted = this.refract(currentDir, normalOpposing, nGem, nAir);

      if (exitRefracted) {
        // Ray exits the gem! Check if it hits any OTHER gem facet from the outside:
        exitDir = exitRefracted;
        exitPoint = nextPoint;
        const extHit = this.findNearestFacetHit(nextPoint, exitRefracted, facets, nextResult.facetIdx);
        const endPoint = extHit ? extHit.hit.point : v.add(nextPoint, v.mul(exitRefracted, 450));
        segments.push({ start: nextPoint, end: endPoint, type: 'emergent', color: null });
        break;
      } else {
        // Total Internal Reflection (TIR)
        bounceCount++;
        const reflDir = v.reflect(currentDir, normalOpposing);
        currentDir = v.norm(reflDir);
        currentPos = nextPoint;
        lastFacetIdx = nextResult.facetIdx;
      }
    }

    // Critical angle for this material
    const critAngle = this.getCriticalAngle(nGem, nAir);
    const critDeg = critAngle * 180 / Math.PI;

    return {
      segments,
      bouncePoints,
      entered: true,
      exitDir,
      exitPoint,
      bounceCount,
      iDeg,
      r1Deg,
      critDeg,
      nGem,
      entryNormal,
      entryFacetName: entryFacet.name
    };
  },

  // =========================================================================
  // DIAMOND CUT GEOMETRIES (2D Cross-Sections)
  // =========================================================================

  /**
   * Generate an authentic Round Brilliant Cut Diamond geometry (2D cross-section)
   * The brilliant cut has: Table, Crown facets, Girdle, Pavilion facets, Culet
   *
   * @param {number} cx - Center X
   * @param {number} cy - Center Y (at girdle level)
   * @param {number} width - Total girdle width in px
   * @param {Object} params - { crownAngleDeg, pavilionAngleDeg, tableRatio }
   */
  getBrilliantCutGeometry(cx, cy, width, params) {
    const v = this.vec;
    const crownAngle = (params.crownAngleDeg || 34.5) * Math.PI / 180;
    const pavilionAngle = (params.pavilionAngleDeg || 40.75) * Math.PI / 180;
    const tableRatio = params.tableRatio || 0.57;

    const halfWidth = width / 2;
    const tableHalfW = halfWidth * tableRatio;
    const girdleH = 8;
    const crownHeight = (halfWidth - tableHalfW) * Math.tan(crownAngle);
    const pavilionDepth = halfWidth * Math.tan(pavilionAngle);
    const culetHalfW = 2;

    // Key vertices (going clockwise from top-left of table)
    const tableLeft   = { x: cx - tableHalfW, y: cy - girdleH / 2 - crownHeight };
    const tableRight  = { x: cx + tableHalfW, y: cy - girdleH / 2 - crownHeight };
    const girdleTopR  = { x: cx + halfWidth,  y: cy - girdleH / 2 };
    const girdleBotR  = { x: cx + halfWidth,  y: cy + girdleH / 2 };
    const culetRight  = { x: cx + culetHalfW, y: cy + girdleH / 2 + pavilionDepth };
    const culetLeft   = { x: cx - culetHalfW, y: cy + girdleH / 2 + pavilionDepth };
    const girdleBotL  = { x: cx - halfWidth,  y: cy + girdleH / 2 };
    const girdleTopL  = { x: cx - halfWidth,  y: cy - girdleH / 2 };

    const vertices = [
      tableLeft,   // 0
      tableRight,  // 1
      girdleTopR,  // 2
      girdleBotR,  // 3
      culetRight,  // 4
      culetLeft,   // 5
      girdleBotL,  // 6
      girdleTopL   // 7
    ];

    const names = [
      'Table',
      'Crown Right',
      'Girdle Right',
      'Pavilion Right',
      'Culet',
      'Pavilion Left',
      'Girdle Left',
      'Crown Left'
    ];

    // Generate facets from consecutive vertex pairs
    const facets = [];
    for (let i = 0; i < vertices.length; i++) {
      const a = vertices[i];
      const b = vertices[(i + 1) % vertices.length];
      const edge = v.sub(b, a);
      const normal = v.norm({ x: edge.y, y: -edge.x });
      facets.push({
        a: a,
        b: b,
        normal: normal,
        name: names[i] || `Facet ${i + 1}`
      });
    }

    return {
      vertices,
      facets,
      cx, cy,
      width,
      crownHeight,
      pavilionDepth,
      tableHalfW,
      halfWidth,
      girdleH,
      cutName: 'Round Brilliant',
      params
    };
  },

  /**
   * Generate a Princess Cut Diamond geometry (2D cross-section)
   * Square profile with steep crown and pavilion
   */
  getPrincessCutGeometry(cx, cy, width, params) {
    const v = this.vec;
    const crownAngle = (params.crownAngleDeg || 28) * Math.PI / 180;
    const pavilionAngle = (params.pavilionAngleDeg || 42) * Math.PI / 180;
    const tableRatio = params.tableRatio || 0.62;

    const halfWidth = width / 2;
    const tableHalfW = halfWidth * tableRatio;
    const girdleH = 8;
    const crownHeight = (halfWidth - tableHalfW) * Math.tan(crownAngle);
    const pavilionDepth = halfWidth * Math.tan(pavilionAngle);
    const culetHalfW = 2;

    const vertices = [
      { x: cx - tableHalfW, y: cy - girdleH / 2 - crownHeight }, // 0: table left
      { x: cx + tableHalfW, y: cy - girdleH / 2 - crownHeight }, // 1: table right
      { x: cx + halfWidth,  y: cy - girdleH / 2 },               // 2: girdle top right
      { x: cx + halfWidth,  y: cy + girdleH / 2 },               // 3: girdle bot right
      { x: cx + culetHalfW, y: cy + girdleH / 2 + pavilionDepth }, // 4: culet right
      { x: cx - culetHalfW, y: cy + girdleH / 2 + pavilionDepth }, // 5: culet left
      { x: cx - halfWidth,  y: cy + girdleH / 2 },               // 6: girdle bot left
      { x: cx - halfWidth,  y: cy - girdleH / 2 }                // 7: girdle top left
    ];

    const facets = [];
    for (let i = 0; i < vertices.length; i++) {
      const a = vertices[i];
      const b = vertices[(i + 1) % vertices.length];
      const edge = v.sub(b, a);
      const normal = v.norm({ x: edge.y, y: -edge.x });
      facets.push({ a, b, normal, name: `Princess Facet ${i + 1}` });
    }

    return {
      vertices, facets, cx, cy, width,
      crownHeight, pavilionDepth, tableHalfW, halfWidth, girdleH,
      cutName: 'Princess',
      params
    };
  },

  /**
   * Generate an Emerald Cut Diamond geometry (2D cross-section)
   * Step-cut with rectangular profile and clipped corners
   */
  getEmeraldCutGeometry(cx, cy, width, params) {
    const v = this.vec;
    const crownAngle = (params.crownAngleDeg || 25) * Math.PI / 180;
    const pavilionAngle = (params.pavilionAngleDeg || 38) * Math.PI / 180;
    const tableRatio = params.tableRatio || 0.65;

    const halfWidth = width / 2;
    const tableHalfW = halfWidth * tableRatio;
    const crownHeight = (halfWidth - tableHalfW) * Math.tan(crownAngle);
    const pavilionDepth = halfWidth * Math.tan(pavilionAngle);
    const clipX = halfWidth * 0.2;

    const vertices = [
      { x: cx - tableHalfW, y: cy - crownHeight },  // 0
      { x: cx + tableHalfW, y: cy - crownHeight },  // 1
      { x: cx + halfWidth - clipX, y: cy - crownHeight * 0.3 }, // 2
      { x: cx + halfWidth,  y: cy },                 // 3
      { x: cx + halfWidth * 0.5, y: cy + pavilionDepth * 0.7 }, // 4
      { x: cx, y: cy + pavilionDepth },               // 5
      { x: cx - halfWidth * 0.5, y: cy + pavilionDepth * 0.7 }, // 6
      { x: cx - halfWidth,  y: cy },                 // 7
      { x: cx - halfWidth + clipX, y: cy - crownHeight * 0.3 }  // 8
    ];

    const facets = [];
    for (let i = 0; i < vertices.length; i++) {
      const a = vertices[i];
      const b = vertices[(i + 1) % vertices.length];
      const edge = v.sub(b, a);
      const normal = v.norm({ x: edge.y, y: -edge.x });
      facets.push({ a, b, normal, name: `Facet ${i + 1}` });
    }

    return {
      vertices, facets, cx, cy, width,
      crownHeight, pavilionDepth, tableHalfW, halfWidth,
      cutName: 'Emerald',
      params
    };
  },

  _getFacetName(idx) {
    const names = ['Table', 'Upper Crown Right', 'Crown Right', 'Girdle Right',
                   'Pavilion Right', 'Culet', 'Pavilion Left', 'Girdle Left', 'Crown Left'];
    return names[idx] || `Facet ${idx + 1}`;
  },

  // =========================================================================
  // SPECTRAL COLOR UTILITIES
  // =========================================================================

  /**
   * Convert wavelength in nm to approximate sRGB hex color
   */
  wavelengthToCSS(wl) {
    let r, g, b;
    if (wl >= 380 && wl < 440)       { r = -(wl - 440) / 60; g = 0; b = 1; }
    else if (wl >= 440 && wl < 490)  { r = 0; g = (wl - 440) / 50; b = 1; }
    else if (wl >= 490 && wl < 510)  { r = 0; g = 1; b = -(wl - 510) / 20; }
    else if (wl >= 510 && wl < 580)  { r = (wl - 510) / 70; g = 1; b = 0; }
    else if (wl >= 580 && wl < 645)  { r = 1; g = -(wl - 645) / 65; b = 0; }
    else if (wl >= 645 && wl <= 780) { r = 1; g = 0; b = 0; }
    else                              { r = 0; g = 0; b = 0; }

    // Intensity edge falloff
    let factor;
    if (wl >= 380 && wl < 420)       factor = 0.3 + 0.7 * (wl - 380) / 40;
    else if (wl >= 420 && wl <= 700) factor = 1.0;
    else if (wl > 700 && wl <= 780)  factor = 0.3 + 0.7 * (780 - wl) / 80;
    else                              factor = 0.0;

    r = Math.round(255 * Math.pow(r * factor, 0.8));
    g = Math.round(255 * Math.pow(g * factor, 0.8));
    b = Math.round(255 * Math.pow(b * factor, 0.8));

    return `rgb(${r},${g},${b})`;
  },

  wavelengthToRGBA(wl, alpha) {
    const css = this.wavelengthToCSS(wl);
    return css.replace('rgb(', 'rgba(').replace(')', `,${alpha})`);
  }
};

window.Optics = Optics;
