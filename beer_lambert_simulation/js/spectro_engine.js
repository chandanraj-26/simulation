/**
 * spectro_engine.js
 * Beer-Lambert Law physics and spectrophotometric optical calculations.
 */

export class SpectroEngine {
  constructor(solute, pathLengthCm = 1.0, concentrationM = 0.08) {
    this.solute = solute;
    this.pathLengthCm = pathLengthCm;
    this.concentrationM = concentrationM;
    this.i0 = 100.0; // Incident beam irradiance %
  }

  setSolute(solute) {
    this.solute = solute;
    this.concentrationM = solute.defaultConc;
  }

  setPathLength(cm) {
    this.pathLengthCm = Math.max(0.1, cm);
  }

  setConcentration(molar) {
    this.concentrationM = Math.max(0.0, molar);
  }

  /**
   * Absorbance A = epsilon * b * c
   */
  getAbsorbance() {
    return this.solute.molarAbsorptivity * this.pathLengthCm * this.concentrationM;
  }

  /**
   * Transmittance T = 10^(-A)
   */
  getTransmittancePercent() {
    const A = this.getAbsorbance();
    const T = Math.pow(10, -A);
    return Math.max(0.001, Math.min(100.0, T * 100.0));
  }

  /**
   * Exiting beam irradiance I
   */
  getTransmittedIrradiance() {
    return (this.getTransmittancePercent() / 100.0) * this.i0;
  }
}
