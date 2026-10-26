/**
 * rusting_engine.js
 * Electrochemical kinetics and mass balance engine for iron corrosion.
 */

export class RustingEngine {
  constructor(protectionMethod = 'none') {
    this.day = 0.0; // Simulated days (0.0 to 7.0)
    this.protectionMethod = protectionMethod; // 'none', 'galvanized', 'grease', 'mg_ribbon'
    this.initialNailMassG = 5.000;
  }

  setDay(day) {
    this.day = Math.max(0.0, Math.min(7.0, day));
  }

  setProtection(methodId) {
    this.protectionMethod = methodId;
  }

  /**
   * Get corrosion percentage (0.0 to 100.0%) for a given tube config
   */
  getTubeCorrosionPercent(tubeConfig) {
    if (!tubeConfig.hasAir || !tubeConfig.hasWater) {
      return 0.0;
    }

    let protectionFactor = 1.0;
    if (this.protectionMethod === 'galvanized') protectionFactor = 0.02;
    else if (this.protectionMethod === 'grease') protectionFactor = 0.05;
    else if (this.protectionMethod === 'mg_ribbon') protectionFactor = 0.01;

    const maxRate = tubeConfig.rustRate * 14.28; // Up to 100% on day 7 for normal
    const corrosion = (this.day / 7.0) * maxRate * protectionFactor;
    return Math.min(100.0, Math.max(0.0, corrosion));
  }

  /**
   * Get total oxidized nail mass in grams
   */
  getNailMass(tubeConfig) {
    const rustPercent = this.getTubeCorrosionPercent(tubeConfig);
    // Iron to Hydrated Rust Fe2O3.H2O has molar mass ratio ~ 1.59
    const oxidizedFeMass = (this.initialNailMassG * 0.20) * (rustPercent / 100.0);
    const addedO2AndWater = oxidizedFeMass * 0.59;
    return this.initialNailMassG + addedO2AndWater;
  }
}
