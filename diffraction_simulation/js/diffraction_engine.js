/**
 * diffraction_engine.js
 * High-precision Fraunhofer single-slit wave optics physics engine.
 */

export class DiffractionEngine {
  constructor(wavelengthNm = 650, slitWidthMm = 0.08, screenDistanceM = 1.5) {
    this.wavelengthNm = wavelengthNm;
    this.slitWidthMm = slitWidthMm;
    this.screenDistanceM = screenDistanceM;
    this.i0 = 1.0; // Peak intensity normalized
  }

  setWavelength(nm) {
    this.wavelengthNm = Math.max(380, Math.min(780, nm));
  }

  setSlitWidth(mm) {
    this.slitWidthMm = Math.max(0.01, Math.min(0.50, mm));
  }

  setScreenDistance(m) {
    this.screenDistanceM = Math.max(0.4, Math.min(4.0, m));
  }

  /**
   * Computes the normalized intensity I(y) at vertical screen position y (in mm).
   * y = 0 is the optical center axis.
   */
  getIntensityAt(yMm) {
    const lambdaM = this.wavelengthNm * 1e-9;
    const aM = this.slitWidthMm * 1e-3;
    const yM = yMm * 1e-3;
    const DM = this.screenDistanceM;

    // Small angle approximation: sin(theta) ~ tan(theta) = y / D
    // beta = (pi * a * y) / (lambda * D)
    const beta = (Math.PI * aM * yM) / (lambdaM * DM);

    if (Math.abs(beta) < 1e-7) {
      return this.i0;
    }

    const sinc = Math.sin(beta) / beta;
    return this.i0 * sinc * sinc;
  }

  /**
   * Distance between central peak and m-th order minimum (in mm):
   * y_m = (m * lambda * D) / a
   */
  getFirstMinimumDistanceMm() {
    const lambdaM = this.wavelengthNm * 1e-9;
    const aM = this.slitWidthMm * 1e-3;
    const DM = this.screenDistanceM;
    return ((lambdaM * DM) / aM) * 1e3; // return in mm
  }

  /**
   * Total width of central maximum (in mm): 2 * y_1
   */
  getCentralMaximumWidthMm() {
    return 2 * this.getFirstMinimumDistanceMm();
  }

  /**
   * Generate array of intensity data points across screen range [-halfSpanMm, +halfSpanMm]
   */
  generateProfile(halfSpanMm = 40, numSamples = 400) {
    const step = (halfSpanMm * 2) / (numSamples - 1);
    const points = [];
    for (let i = 0; i < numSamples; i++) {
      const yMm = -halfSpanMm + i * step;
      const intensity = this.getIntensityAt(yMm);
      points.push({ yMm, intensity });
    }
    return points;
  }
}
