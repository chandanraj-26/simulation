/**
 * meter_bridge_engine.js
 * Scalable physics engine for Meter Bridge Wheatstone network and galvanometer deflection.
 */

export class MeterBridgeEngine {
  constructor(knownR = 4.0, unknownWire = null, totalWireLengthCm = 100.0) {
    this.knownR = knownR; // Ohms in left gap
    this.unknownWire = unknownWire;
    this.totalWireLengthCm = totalWireLengthCm;
    this.driverVoltage = 2.0; // Volts
  }

  setKnownResistance(r) {
    this.knownR = Math.max(0.1, r);
  }

  setUnknownWire(wire) {
    this.unknownWire = wire;
  }

  setTotalWireLength(lengthCm) {
    this.totalWireLengthCm = Math.max(50.0, lengthCm);
  }

  /**
   * Theoretical null point l_0 (in cm from 0 cm left end):
   * R / X = l / (L_total - l) => l_0 = (L_total * R) / (R + X)
   */
  getTheoreticalBalancePointCm() {
    if (!this.unknownWire) return this.totalWireLengthCm * 0.5;
    const X = this.unknownWire.trueResistance;
    return (this.totalWireLengthCm * this.knownR) / (this.knownR + X);
  }

  /**
   * Galvanometer deflection (-30 to +30 divisions)
   */
  getGalvanometerDeflection(jockeyPosCm) {
    const l0 = this.getTheoreticalBalancePointCm();
    const deltaRatio = (jockeyPosCm - l0) / this.totalWireLengthCm;

    // Normalised deflection based on fractional deviation across bridge
    const sensitivity = 280.0;
    const rawDeflection = -deltaRatio * sensitivity;
    return Math.max(-30, Math.min(30, rawDeflection));
  }

  /**
   * Experimentally derived unknown resistance X from balance point l (cm):
   * X = R * (L_total - l) / l
   */
  calculateUnknownResistance(balancePointCm) {
    if (balancePointCm <= 0.1 || balancePointCm >= (this.totalWireLengthCm - 0.1)) return 0;
    return this.knownR * ((this.totalWireLengthCm - balancePointCm) / balancePointCm);
  }

  /**
   * Calculates resistivity rho = (X * pi * r^2) / L
   */
  calculateResistivity(calcX, radiusMm, lengthCm) {
    const rM = (radiusMm * 1e-3);
    const lM = (lengthCm * 1e-2);
    if (lM <= 0) return 0;
    const crossSectionArea = Math.PI * rM * rM;
    return (calcX * crossSectionArea) / lM;
  }
}
