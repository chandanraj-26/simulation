/**
 * PhysicsLab - Exact Geometric Optics & Ray Tracing Engine
 * Accurately models Snell's Law, Cauchy Chromatic Dispersion, and Total Internal Reflection.
 */
window.PhysicsLab = window.PhysicsLab || {};

(function(lab) {
  // Vector math helper functions
  const vec = {
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
    rotate: (v, angleRad) => ({
      x: v.x * Math.cos(angleRad) - v.y * Math.sin(angleRad),
      y: v.x * Math.sin(angleRad) + v.y * Math.cos(angleRad)
    })
  };

  lab.vec = vec;

  // Line segment intersection helper
  // Ray: P + t * D (t >= 0), Segment: A to B (u in [0, 1])
  function intersectRaySegment(P, D, A, B) {
    const AB = vec.sub(B, A);
    const denom = vec.cross(D, AB);
    if (Math.abs(denom) < 1e-9) return null; // parallel

    const AP = vec.sub(P, A);
    const t = vec.cross(AB, AP) / denom;
    const u = vec.cross(D, AP) / denom;

    if (t > 1e-5 && u >= -0.01 && u <= 1.01) {
      return {
        point: vec.add(P, vec.mul(D, t)),
        t: t,
        u: Math.max(0, Math.min(1, u))
      };
    }
    return null;
  }

  // Calculate refractive index for a given wavelength using Cauchy formula
  // lambda in nm
  lab.getRefractiveIndex = function(baseN, cauchyB, lambdaNm) {
    const lambdaUm = lambdaNm / 1000.0;
    const refLambdaUm = 0.589; // 589 nm (Sodium D-line)
    const n = baseN + cauchyB * (1.0 / (lambdaUm * lambdaUm) - 1.0 / (refLambdaUm * refLambdaUm));
    return Math.max(1.0, n);
  };

  // Calculate Prism Polygon Vertices based on apex angle A and canvas dimensions
  lab.getPrismGeometry = function(cx, cy, size, apexDeg) {
    const halfApexRad = (apexDeg * Math.PI) / 360.0;
    const h = size;
    const halfBaseW = h * Math.tan(halfApexRad);

    const top = { x: cx, y: cy - h * 0.52 };
    const left = { x: cx - halfBaseW, y: cy + h * 0.48 };
    const right = { x: cx + halfBaseW, y: cy + h * 0.48 };

    // Outward Unit Normals in Canvas Coordinates (y points down):
    // Face 1: Left face (from left to top)
    const edge1 = vec.sub(top, left); // (halfBaseW, -h)
    // Outward normal must point UP and LEFT: x < 0, y < 0
    const norm1 = vec.norm({ x: edge1.y, y: -edge1.x });

    // Face 2: Right face (from top to right)
    const edge2 = vec.sub(right, top); // (halfBaseW, h)
    // Outward normal must point UP and RIGHT: x > 0, y < 0
    const norm2 = vec.norm({ x: edge2.y, y: -edge2.x });

    // Base: left -> right (Outward normal points straight DOWN: y > 0)
    const normBase = { x: 0, y: 1 };

    return {
      top,
      left,
      right,
      halfBaseW,
      h,
      norm1,
      norm2,
      normBase,
      apexDeg,
      halfApexRad
    };
  };

  // Core Ray Trace Function for a single wavelength
  lab.traceSingleRay = function(incidentRayStart, incidentRayDir, prism, nPrism, nAmbient = 1.0) {
    // 1. Intersect incident ray with Face 1 (left to top)
    const hit1 = intersectRaySegment(incidentRayStart, incidentRayDir, prism.left, prism.top);
    if (!hit1) {
      return {
        hasHit: false,
        segments: [{ start: incidentRayStart, end: vec.add(incidentRayStart, vec.mul(incidentRayDir, 1000)), type: 'incident' }]
      };
    }

    const P1 = hit1.point;
    const N1 = prism.norm1; // Outward unit normal of Face 1

    // Angle of incidence i: angle between -incidentRayDir and N1
    const cosI = Math.max(-1, Math.min(1, -vec.dot(incidentRayDir, N1)));
    const iRad = Math.acos(cosI);
    const iDeg = (iRad * 180) / Math.PI;

    // Snell's law at Surface 1: n1 * sin(i) = n2 * sin(r1)
    const sinI = Math.sin(iRad);
    const sinR1 = (nAmbient / nPrism) * sinI;

    if (Math.abs(sinR1) > 1.0) {
      const R1 = vec.sub(incidentRayDir, vec.mul(N1, 2 * vec.dot(incidentRayDir, N1)));
      return {
        hasHit: true,
        iDeg,
        segments: [
          { start: incidentRayStart, end: P1, type: 'incident' },
          { start: P1, end: vec.add(P1, vec.mul(R1, 800)), type: 'reflected' }
        ]
      };
    }

    const r1Rad = Math.asin(Math.max(-1, Math.min(1, sinR1)));
    const r1Deg = (r1Rad * 180) / Math.PI;

    // Vector direction inside prism T1 via Snell's Law
    const mu1 = nAmbient / nPrism;
    const cosR1 = Math.cos(r1Rad);
    const T1 = vec.norm(vec.add(vec.mul(incidentRayDir, mu1), vec.mul(N1, mu1 * cosI - cosR1)));

    // 2. Intersect internal ray with Face 2 (top to right) or Base
    const hit2 = intersectRaySegment(P1, T1, prism.top, prism.right);
    const hitBase = intersectRaySegment(P1, T1, prism.left, prism.right);

    const hit = hit2 || hitBase;
    if (!hit) {
      return {
        hasHit: true,
        P1,
        iDeg,
        r1Deg,
        segments: [
          { start: incidentRayStart, end: P1, type: 'incident' },
          { start: P1, end: vec.add(P1, vec.mul(T1, 600)), type: 'refracted' }
        ]
      };
    }

    const P2 = hit.point;
    const isFace2 = (hit === hit2);
    const N2 = isFace2 ? prism.norm2 : prism.normBase;

    // Angle of incidence inside prism at Face 2 (r2)
    // T1 travels inside towards boundary, N2 is outward normal pointing into air
    const cosR2 = Math.max(-1, Math.min(1, vec.dot(T1, N2)));
    const r2Rad = Math.acos(cosR2);
    const r2Deg = (r2Rad * 180) / Math.PI;

    // Critical Angle at Face 2: sin(theta_c) = nAmbient / nPrism
    const sinCrit = nAmbient / nPrism;
    const critRad = sinCrit <= 1.0 ? Math.asin(sinCrit) : Math.PI / 2;
    const critDeg = (critRad * 180) / Math.PI;

    const sinR2 = Math.sin(r2Rad);
    const sinE = (nPrism / nAmbient) * sinR2;

    const isTIR = sinE > 1.0 || r2Deg >= critDeg;

    let emergentEnd;
    let emergentDir;
    let eDeg = 0;
    let deltaDeg = 0;

    if (isTIR) {
      // Total Internal Reflection at Face 2
      const R2 = vec.norm(vec.sub(T1, vec.mul(N2, 2 * vec.dot(T1, N2))));
      const hitTIRBase = intersectRaySegment(P2, R2, prism.left, prism.right);
      const hitTIRFace1 = intersectRaySegment(P2, R2, prism.left, prism.top);
      const endPt = hitTIRBase ? hitTIRBase.point : hitTIRFace1 ? hitTIRFace1.point : vec.add(P2, vec.mul(R2, 350));

      return {
        hasHit: true,
        P1,
        P2,
        iDeg,
        r1Deg,
        r2Deg,
        eDeg: null,
        deltaDeg: null,
        critDeg,
        isTIR: true,
        segments: [
          { start: incidentRayStart, end: P1, type: 'incident' },
          { start: P1, end: P2, type: 'refracted' },
          { start: P2, end: endPt, type: 'tir' }
        ]
      };
    }

    // Refraction into air at Face 2: Emergent ray
    const eRad = Math.asin(Math.max(-1, Math.min(1, sinE)));
    eDeg = (eRad * 180) / Math.PI;

    const mu2 = nPrism / nAmbient;
    const cosE = Math.cos(eRad);
    emergentDir = vec.norm(vec.add(vec.mul(T1, mu2), vec.mul(N2, cosE - mu2 * cosR2)));
    emergentEnd = vec.add(P2, vec.mul(emergentDir, 800));

    // Deviation angle delta: angle between incidentRayDir and emergentDir
    const dotDev = Math.max(-1, Math.min(1, vec.dot(incidentRayDir, emergentDir)));
    deltaDeg = (Math.acos(dotDev) * 180) / Math.PI;

    return {
      hasHit: true,
      P1,
      P2,
      iDeg,
      r1Deg,
      r2Deg,
      eDeg,
      deltaDeg,
      critDeg,
      isTIR: false,
      incidentDir: incidentRayDir,
      emergentDir: emergentDir,
      segments: [
        { start: incidentRayStart, end: P1, type: 'incident' },
        { start: P1, end: P2, type: 'refracted' },
        { start: P2, end: emergentEnd, type: 'emergent' }
      ]
    };
  };

  // Solve all rays (White Light dispersion fan or single Monochromatic laser)
  lab.solveOptics = function(canvasW, canvasH) {
    const s = lab.state;
    const cfg = lab.getConfig();

    const cx = canvasW * 0.36;
    const cy = canvasH * 0.43;
    const prismSize = Math.min(canvasW * 0.27, canvasH * 0.48);

    const prism = lab.getPrismGeometry(cx, cy, prismSize, cfg.prismAngle);

    // Target point on Face 1 (middle of Face 1)
    const targetPt = vec.add(prism.top, vec.mul(vec.sub(prism.left, prism.top), 0.50));

    // Incident Ray Direction based on angle of incidence i
    // N1 is outward normal from Face 1
    // inNormAngle points INTO the prism from Face 1
    const inNormAngle = Math.atan2(-prism.norm1.y, -prism.norm1.x);
    const iRad = (cfg.incidentAngle * Math.PI) / 180.0;

    // Angle of ray approaching targetPt from the left
    const rayAngle = inNormAngle - iRad;
    const incidentDir = { x: Math.cos(rayAngle), y: Math.sin(rayAngle) };

    // Light source origin (Torch on the left)
    const maxLenX = (targetPt.x - 55) / Math.max(0.1, Math.abs(incidentDir.x));
    const beamLength = Math.max(90, Math.min(prismSize * 0.88, maxLenX));
    const defaultTorchPos = vec.sub(targetPt, vec.mul(incidentDir, beamLength));
    const torchPos = s.torchUserPos ? s.torchUserPos : defaultTorchPos;

    // Actual ray direction from torch to target point
    const actualDir = s.torchUserPos ? vec.norm(vec.sub(targetPt, s.torchUserPos)) : incidentDir;

    // Observation Screen Geometry (placed to leave room on right for the VIBGYOR detector panel)
    const screenX = canvasW * 0.74 + s.screenDistanceOffset;
    const screenTop = { x: screenX, y: canvasH * 0.08 };
    const screenBottom = { x: screenX, y: canvasH * 0.92 };

    const traces = [];

    if (cfg.lightType === 'laser') {
      // Single wavelength laser ray
      const nWl = lab.getRefractiveIndex(cfg.n, cfg.cauchyB, cfg.wavelength);
      const trace = lab.traceSingleRay(torchPos, actualDir, prism, nWl, cfg.ambientN);
      trace.wavelength = cfg.wavelength;
      trace.color = lab.wavelengthToRGB(cfg.wavelength).hex;
      trace.rgba = lab.wavelengthToRGB(cfg.wavelength).rgba;

      if (trace.emergentDir && trace.P2) {
        const hitScreen = intersectRaySegment(trace.P2, trace.emergentDir, screenTop, screenBottom);
        if (hitScreen) {
          trace.screenHit = hitScreen.point;
          if (trace.segments[2]) trace.segments[2].end = hitScreen.point;
        }
      }

      traces.push(trace);
    } else {
      // White light: Trace all 7 spectral bands (VIBGYOR)
      // Visual dispersion scale applied so students can clearly distinguish the 7 rainbow bands
      const visualCauchyB = cfg.cauchyB * cfg.dispersionScale;

      for (let i = 0; i < lab.spectralBands.length; i++) {
        const band = lab.spectralBands[i];
        const nWl = lab.getRefractiveIndex(cfg.n, visualCauchyB, band.wl);
        const trace = lab.traceSingleRay(torchPos, actualDir, prism, nWl, cfg.ambientN);
        trace.wavelength = band.wl;
        trace.name = band.name;
        trace.color = band.color;
        trace.rgba = (a = 1) => lab.wavelengthToRGB(band.wl).rgba(a);

        if (trace.emergentDir && trace.P2) {
          const hitScreen = intersectRaySegment(trace.P2, trace.emergentDir, screenTop, screenBottom);
          if (hitScreen) {
            trace.screenHit = hitScreen.point;
            if (trace.segments[2]) trace.segments[2].end = hitScreen.point;
          }
        }

        traces.push(trace);
      }
    }

    // Mid-spectrum trace (Yellow 589nm / Green 532nm) for primary readouts
    const midTrace = traces.find(t => t.wavelength === 589) || traces[Math.floor(traces.length / 2)] || traces[0];

    // Minimum Deviation theoretical calculation:
    // n = sin((A + Dmin) / 2) / sin(A / 2)
    const sinHalfA = Math.sin((cfg.prismAngle * Math.PI) / 360.0);
    const sinTerm = cfg.n * sinHalfA;
    let theoreticalDmin = null;
    let minDevIncidence = null;

    if (sinTerm <= 1.0) {
      theoreticalDmin = (2.0 * Math.asin(sinTerm) - (cfg.prismAngle * Math.PI) / 180.0) * (180.0 / Math.PI);
      minDevIncidence = (cfg.prismAngle + theoreticalDmin) / 2.0;
    }

    // Calculate angular dispersion spread between Red (685nm) and Violet (405nm)
    let dispersionAngle = 0;
    const violetTrace = traces.find(t => t.name === 'Violet');
    const redTrace = traces.find(t => t.name === 'Red');
    if (violetTrace && redTrace && violetTrace.deltaDeg && redTrace.deltaDeg) {
      dispersionAngle = Math.abs(violetTrace.deltaDeg - redTrace.deltaDeg);
    }

    // Update state telemetry
    if (midTrace && midTrace.hasHit) {
      s.telemetry.i = midTrace.iDeg || cfg.incidentAngle;
      s.telemetry.r1 = midTrace.r1Deg || 0;
      s.telemetry.r2 = midTrace.r2Deg || 0;
      s.telemetry.e = midTrace.eDeg !== null ? midTrace.eDeg : 0;
      s.telemetry.delta = midTrace.deltaDeg !== null ? midTrace.deltaDeg : (s.telemetry.i + s.telemetry.e - cfg.prismAngle);
      s.telemetry.criticalAngle = midTrace.critDeg || 0;
      s.telemetry.isTIR = !!midTrace.isTIR;
      s.telemetry.isMinDev = minDevIncidence !== null && Math.abs(s.telemetry.i - minDevIncidence) < 0.9;
      s.telemetry.minDeviationAngle = theoreticalDmin || 0;
      s.telemetry.dispersionAngle = dispersionAngle;
    }

    return {
      prism,
      torchPos,
      targetPt,
      actualDir,
      traces,
      screenTop,
      screenBottom,
      screenX,
      midTrace,
      theoreticalDmin,
      minDevIncidence
    };
  };

  // Generate theoretical delta vs i curve for graph
  lab.generateDeltaVsICurve = function() {
    const cfg = lab.getConfig();
    const A_deg = cfg.prismAngle;
    const n = cfg.n;
    const curve = [];

    for (let i_deg = 15; i_deg <= 85; i_deg += 0.5) {
      const i_rad = (i_deg * Math.PI) / 180.0;
      const sin_r1 = Math.sin(i_rad) / n;
      if (sin_r1 > 1.0) continue;

      const r1_rad = Math.asin(sin_r1);
      const r1_deg = (r1_rad * 180.0) / Math.PI;
      const r2_deg = A_deg - r1_deg;

      if (r2_deg < 0) continue;
      const r2_rad = (r2_deg * Math.PI) / 180.0;
      const sin_e = n * Math.sin(r2_rad);

      if (sin_e <= 1.0) {
        const e_rad = Math.asin(sin_e);
        const e_deg = (e_rad * 180.0) / Math.PI;
        const delta = i_deg + e_deg - A_deg;
        curve.push({ i: i_deg, delta: delta, isTIR: false });
      } else {
        curve.push({ i: i_deg, delta: null, isTIR: true });
      }
    }
    lab.state.deltaVsICurve = curve;
    return curve;
  };

})(window.PhysicsLab);
