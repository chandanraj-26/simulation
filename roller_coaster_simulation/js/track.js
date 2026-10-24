/**
 * CoasterLab — Parametric Track Geometry & Curve Analysis Engine
 * Generates smooth piecewise coaster tracks (Initial Hill -> Flat -> Loop -> Airtime Hill -> Brake Run)
 * Pre-computes arc-length LUT, local curvature kappa, tangent angles, and inward normals.
 */

class CoasterTrack {
  constructor() {
    this.h0 = 40.0;           // Initial hill height (m)
    this.loopRadius = 10.0;   // Loop radius R (m)
    this.loopType = 'circular'; // 'circular' | 'clothoid'
    
    // Geometry segments bounds
    this.lut = [];            // Arc-length look-up table
    this.totalLength = 0;     // Total arc length (m)
    this.loopStartS = 0;
    this.loopEndS = 0;
    this.apexS = 0;
    this.apexX = 0;
    this.apexY = 0;

    this.rebuildTrack();
  }

  setParameters(h0, loopRadius, loopType = 'circular') {
    this.h0 = Math.max(5, Math.min(80, h0));
    this.loopRadius = Math.max(4, Math.min(22, loopRadius));
    this.loopType = loopType;
    this.rebuildTrack();
  }

  /**
   * Rebuilds the parametric track path and computes the arc-length lookup table.
   */
  rebuildTrack() {
    const rawPoints = [];
    const h0 = this.h0;
    const R = this.loopRadius;

    // --- Segment 1: Initial Hill ---
    // Smooth cosine drop from (0, h0) to (x1, 0)
    const hillLength = Math.max(28, h0 * 1.6);
    const nHill = 140;
    for (let i = 0; i <= nHill; i++) {
      const u = i / nHill;
      const x = u * hillLength;
      // Cosine ramp: y = h0 * (1 + cos(pi * u)) / 2
      const y = (h0 / 2) * (1 + Math.cos(Math.PI * u));
      rawPoints.push({ x, y, segment: 'hill' });
    }

    const xHillEnd = hillLength;

    // --- Segment 2: Approach Straight ---
    const approachLength = 16.0;
    const nApp = 40;
    for (let i = 1; i <= nApp; i++) {
      const u = i / nApp;
      const x = xHillEnd + u * approachLength;
      const y = 0;
      rawPoints.push({ x, y, segment: 'flat1' });
    }

    const xLoopEntry = xHillEnd + approachLength;

    // --- Segment 3: Vertical Loop (Circular or Clothoid) ---
    const nLoop = 360;
    const loopSeparation = R * 0.45; // slight forward drift to separate entrance & exit rails cleanly

    if (this.loopType === 'circular') {
      // Circle parameterized from theta = -PI/2 to 3*PI/2 (counter-clockwise looking into track)
      // Bottom entrance at theta = -PI/2, apex at theta = PI/2, exit at theta = 3*PI/2
      const xCenter = xLoopEntry;
      const yCenter = R;

      for (let i = 1; i <= nLoop; i++) {
        const u = i / nLoop; // 0 to 1
        const theta = -Math.PI / 2 + u * 2 * Math.PI;
        // Forward lateral displacement to avoid self-intersection
        const drift = u * loopSeparation;
        const x = xCenter + R * Math.cos(theta) + drift;
        const y = yCenter + R * Math.sin(theta);
        rawPoints.push({ x, y, segment: 'loop', loopU: u });
      }
    } else {
      // Clothoid / Teardrop Loop:
      // Radius varies smoothly: tightest at top (R_top ~ 0.65 R), wider at entry/exit (R_base ~ 1.25 R)
      // r(theta) = R * (0.95 - 0.32 * sin(theta))
      const xCenter = xLoopEntry;
      const yCenter = R * 1.05;

      for (let i = 1; i <= nLoop; i++) {
        const u = i / nLoop;
        const theta = -Math.PI / 2 + u * 2 * Math.PI;
        const rFactor = 0.96 - 0.30 * Math.sin(theta);
        const currentR = R * rFactor;
        const drift = u * loopSeparation;
        const x = xCenter + currentR * Math.cos(theta) + drift;
        const y = Math.max(0, yCenter + currentR * Math.sin(theta));
        rawPoints.push({ x, y, segment: 'loop', loopU: u });
      }
    }

    const xLoopExit = rawPoints[rawPoints.length - 1].x;

    // --- Segment 4: Low Valley & Airtime Hill ---
    const valleyLen = 14.0;
    const nVal = 30;
    for (let i = 1; i <= nVal; i++) {
      const u = i / nVal;
      const x = xLoopExit + u * valleyLen;
      const y = 0;
      rawPoints.push({ x, y, segment: 'flat2' });
    }

    const xAirtimeStart = xLoopExit + valleyLen;
    const airtimeLen = Math.max(24, h0 * 0.9);
    const airtimeHeight = Math.min(h0 * 0.38, R * 1.4);
    const nAir = 100;
    for (let i = 1; i <= nAir; i++) {
      const u = i / nAir;
      const x = xAirtimeStart + u * airtimeLen;
      // Inverted cosine hill: peak at u = 0.5
      const y = airtimeHeight * Math.sin(Math.PI * u);
      rawPoints.push({ x, y, segment: 'airtime' });
    }

    const xAirtimeEnd = xAirtimeStart + airtimeLen;

    // --- Segment 5: Brake Run / Finish Straight ---
    const brakeLen = 50.0;
    const nBrake = 60;
    for (let i = 1; i <= nBrake; i++) {
      const u = i / nBrake;
      const x = xAirtimeEnd + u * brakeLen;
      const y = 0;
      rawPoints.push({ x, y, segment: 'brake' });
    }

    // --- Compile Arc-Length LUT with High Resolution Interpolation ---
    this.compileLUT(rawPoints);
  }

  /**
   * Compiles finely-sampled stations with curvature, tangents, and normal vectors.
   */
  compileLUT(rawPoints) {
    const N = rawPoints.length;
    if (N < 3) return;

    // 1. Calculate cumulative chord distance
    const sArray = [0];
    for (let i = 1; i < N; i++) {
      const dx = rawPoints[i].x - rawPoints[i - 1].x;
      const dy = rawPoints[i].y - rawPoints[i - 1].y;
      const dist = Math.hypot(dx, dy);
      sArray.push(sArray[i - 1] + dist);
    }
    const totalS = sArray[N - 1];
    this.totalLength = totalS;

    // 2. Resample at uniform delta_s intervals (~0.12 m step)
    const targetSteps = 1600;
    const stepS = totalS / targetSteps;
    const lut = [];

    let rawIdx = 0;
    let maxLoopY = -1;
    let apexStation = null;

    for (let step = 0; step <= targetSteps; step++) {
      const s = step * stepS;
      while (rawIdx < N - 2 && sArray[rawIdx + 1] < s) {
        rawIdx++;
      }

      // Linear interpolation factor between raw points
      const s0 = sArray[rawIdx];
      const s1 = sArray[rawIdx + 1] || totalS;
      const t = (s1 > s0) ? (s - s0) / (s1 - s0) : 0;

      const p0 = rawPoints[rawIdx];
      const p1 = rawPoints[rawIdx + 1] || p0;
      const x = p0.x + t * (p1.x - p0.x);
      const y = p0.y + t * (p1.y - p0.y);

      lut.push({
        s,
        x,
        y,
        segment: p0.segment,
        tx: 1,
        ty: 0,
        nx: 0,
        ny: 1,
        angle: 0,
        curvature: 0
      });

      if (p0.segment === 'loop' && y > maxLoopY) {
        maxLoopY = y;
        apexStation = { s, x, y };
      }
    }

    // 3. Compute central differences for Tangents, Normals & Signed Curvature
    const M = lut.length;
    for (let i = 0; i < M; i++) {
      const prev = lut[Math.max(0, i - 1)];
      const next = lut[Math.min(M - 1, i + 1)];
      const ds = next.s - prev.s;

      const dx = (next.x - prev.x) / (ds || 1);
      const dy = (next.y - prev.y) / (ds || 1);
      const mag = Math.hypot(dx, dy) || 1;

      // Unit tangent vector
      const tx = dx / mag;
      const ty = dy / mag;
      lut[i].tx = tx;
      lut[i].ty = ty;
      lut[i].angle = Math.atan2(ty, tx);

      // Inward (centripetal) normal: 90 deg counter-clockwise from tangent
      lut[i].nx = -ty;
      lut[i].ny = tx;

      // Curvature kappa = d(angle)/ds
      const prevAngle = prev.angle || 0;
      const nextAngle = next.angle || 0;
      let dAngle = nextAngle - prevAngle;
      // Wrap angle difference to [-PI, PI]
      while (dAngle > Math.PI) dAngle -= 2 * Math.PI;
      while (dAngle < -Math.PI) dAngle += 2 * Math.PI;
      lut[i].curvature = dAngle / (ds || 1);
    }

    this.lut = lut;

    // Detect loop bounds
    let loopStart = 0;
    let loopEnd = totalS;
    for (let i = 0; i < M; i++) {
      if (lut[i].segment === 'loop') {
        if (loopStart === 0) loopStart = lut[i].s;
        loopEnd = lut[i].s;
      }
    }
    this.loopStartS = loopStart;
    this.loopEndS = loopEnd;

    if (apexStation) {
      this.apexS = apexStation.s;
      this.apexX = apexStation.x;
      this.apexY = apexStation.y;
    } else {
      this.apexS = (loopStart + loopEnd) / 2;
      this.apexX = this.lut[Math.floor(M / 2)].x;
      this.apexY = this.loopRadius * 2;
    }
  }

  /**
   * Fast O(1) Look-up by arc length s.
   */
  sampleAt(s) {
    if (!this.lut || this.lut.length === 0) {
      return { s: 0, x: 0, y: 0, tx: 1, ty: 0, nx: 0, ny: 1, angle: 0, curvature: 0, segment: 'none' };
    }
    const clampedS = Math.max(0, Math.min(this.totalLength, s));
    const M = this.lut.length;
    const indexRatio = clampedS / this.totalLength;
    const floatIdx = indexRatio * (M - 1);
    const i0 = Math.floor(floatIdx);
    const i1 = Math.min(M - 1, i0 + 1);
    const frac = floatIdx - i0;

    const p0 = this.lut[i0];
    const p1 = this.lut[i1];

    return {
      s: clampedS,
      x: p0.x + frac * (p1.x - p0.x),
      y: p0.y + frac * (p1.y - p0.y),
      tx: p0.tx + frac * (p1.tx - p0.tx),
      ty: p0.ty + frac * (p1.ty - p0.ty),
      nx: p0.nx + frac * (p1.nx - p0.nx),
      ny: p0.ny + frac * (p1.ny - p0.ny),
      angle: p0.angle + frac * (p1.angle - p0.angle),
      curvature: p0.curvature + frac * (p1.curvature - p0.curvature),
      segment: p0.segment
    };
  }

  getHeight(s) {
    return this.sampleAt(s).y;
  }

  getMinSafeHeight() {
    // 2.5 * R is the theoretical minimum drop height for a circular loop
    return 2.5 * this.loopRadius;
  }
}

window.CoasterTrack = CoasterTrack;
