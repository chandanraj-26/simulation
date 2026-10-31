/**
 * OpticsEngine - Mathematical Model for Spherical Mirrors (Ray Optics)
 * Cartesian Sign Convention:
 *  - Pole P is origin (0, 0)
 *  - Distances measured in direction of incident light are positive (+x)
 *  - Distances opposite to incident light are negative (-x)
 *  - Concave Mirror: f < 0, R = 2f < 0
 *  - Convex Mirror: f > 0, R = 2f > 0
 *  - Real object in front: u < 0
 *  - Formula: 1/f = 1/v + 1/u ==> v = (f * u) / (u - f)
 *  - Magnification: m = -v / u = h_i / h_o
 */

export class OpticsModel {
  constructor() {
    this.mirrorType = 'concave'; // 'concave' or 'convex'
    this.focalDistance = 15.0;   // magnitude |f| in cm (typically 10 - 30 cm)
    this.objectDistance = 30.0;  // magnitude |u| in cm (typically 5 - 60 cm)
    this.objectHeight = 5.0;     // h_o in cm (typically 2 - 10 cm)

    // Ray display toggles
    this.showParallelRay = true;
    this.showFocalRay = true;
    this.showCurvatureRay = true;
    this.showVirtualExtensions = true;

    // History of observations
    this.history = [];

    // Quiz state
    this.quiz = null;
  }

  get f() {
    return this.mirrorType === 'concave' ? -this.focalDistance : this.focalDistance;
  }

  get R() {
    return 2 * this.f;
  }

  get u() {
    return -this.objectDistance;
  }

  // Calculate optical state
  getRayOptics() {
    const f = this.f;
    const u = this.u;
    const h_o = this.objectHeight;

    // Check if object is at focus
    const isAtFocus = Math.abs(u - f) < 0.2;

    let v = 0;
    let m = 0;
    let h_i = 0;
    let isInfinity = false;
    let isReal = true;
    let isErect = false;
    let natureText = '';

    if (isAtFocus) {
      isInfinity = true;
      v = Infinity;
      m = Infinity;
      h_i = Infinity;
      natureText = 'Image formed at Infinity (Highly Magnified, Real & Inverted)';
    } else {
      v = (f * u) / (u - f);
      m = -v / u;
      h_i = m * h_o;

      isReal = (v < 0);
      isErect = (m > 0);

      const sizeDesc = Math.abs(Math.abs(m) - 1.0) < 0.05
        ? 'Same Size'
        : (Math.abs(m) > 1.0 ? 'Magnified' : 'Diminished');

      const orientationDesc = isErect ? 'Virtual & Erect' : 'Real & Inverted';
      const positionDesc = v > 0
        ? `Behind Mirror (${Math.abs(v).toFixed(1)} cm)`
        : `In Front of Mirror (${Math.abs(v).toFixed(1)} cm)`;

      natureText = `${orientationDesc}, ${sizeDesc} (${positionDesc})`;
    }

    return {
      mirrorType: this.mirrorType,
      f: parseFloat(f.toFixed(1)),
      R: parseFloat(this.R.toFixed(1)),
      u: parseFloat(u.toFixed(1)),
      v: isInfinity ? Infinity : parseFloat(v.toFixed(1)),
      m: isInfinity ? Infinity : parseFloat(m.toFixed(2)),
      h_o: parseFloat(h_o.toFixed(1)),
      h_i: isInfinity ? Infinity : parseFloat(h_i.toFixed(1)),
      isReal,
      isErect,
      isInfinity,
      natureText
    };
  }

  setPreset(name) {
    const fMag = this.focalDistance;
    switch (name) {
      case 'beyond_c':
        this.mirrorType = 'concave';
        this.objectDistance = 2.5 * fMag;
        break;
      case 'at_c':
        this.mirrorType = 'concave';
        this.objectDistance = 2.0 * fMag;
        break;
      case 'between_c_f':
        this.mirrorType = 'concave';
        this.objectDistance = 1.5 * fMag;
        break;
      case 'at_f':
        this.mirrorType = 'concave';
        this.objectDistance = 1.0 * fMag;
        break;
      case 'between_f_p':
        this.mirrorType = 'concave';
        this.objectDistance = 0.5 * fMag;
        break;
      case 'convex_any':
        this.mirrorType = 'convex';
        this.objectDistance = 1.8 * fMag;
        break;
    }
  }

  logObservation() {
    const time = new Date().toLocaleTimeString();
    const r = this.getRayOptics();
    this.history.unshift({
      time,
      type: r.mirrorType === 'concave' ? 'Concave' : 'Convex',
      f: `${r.f} cm`,
      u: `${r.u} cm`,
      v: r.isInfinity ? '∞ (Infinity)' : `${r.v} cm`,
      m: r.isInfinity ? '∞' : `${r.m}×`,
      nature: r.natureText
    });
    if (this.history.length > 20) this.history.pop();
  }

  generateQuiz() {
    const types = ['concave', 'convex'];
    const selectedType = types[Math.floor(Math.random() * types.length)];
    this.mirrorType = selectedType;

    // Pick random focal length and object distance
    this.focalDistance = [10, 15, 20][Math.floor(Math.random() * 3)];
    if (selectedType === 'concave') {
      const candidates = [this.focalDistance * 0.5, this.focalDistance * 1.5, this.focalDistance * 2.0, this.focalDistance * 2.5];
      this.objectDistance = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      this.objectDistance = +(Math.random() * 25 + 10).toFixed(1);
    }

    const r = this.getRayOptics();
    this.quiz = {
      targetV: r.v,
      targetM: r.m,
      prompt: `Given a ${r.mirrorType} mirror with focal distance |f| = ${this.focalDistance} cm, and an object placed at distance |u| = ${this.objectDistance} cm: Calculate the image distance v (in cm, including Cartesian sign) and magnification m.`
    };
    return this.quiz;
  }
}
