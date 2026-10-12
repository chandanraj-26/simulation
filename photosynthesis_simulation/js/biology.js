/**
 * PhotosynthesisLab — Biophysics Engine
 * Implements Blackman's Principle of Limiting Factors:
 * 1. Inverse Square Law of Light (I ∝ 1/d²)
 * 2. Engelmann Action Spectrum (Chlorophyll a/b absorption: White, Blue, Red vs Green)
 * 3. Carbon Dioxide Saturation (NaHCO₃ Michaelis-Menten kinetics)
 * 4. Temperature Optimum & Thermal Denaturation (Rubisco enzyme kinetics)
 */

class PhotosynthesisBiophysics {
  // Action spectrum relative photosynthetic efficiency by optical filter color
  static COLOR_FACTORS = {
    white: { factor: 1.00, name: 'Sunlight / White', hex: '#facc15', glow: 'rgba(250, 204, 21, 0.45)', rayColor: '#eab308', wave: '400–700 nm' },
    blue:  { factor: 0.95, name: 'Blue Filter (450 nm)', hex: '#38bdf8', glow: 'rgba(56, 189, 248, 0.45)', rayColor: '#0284c7', wave: '450 nm' },
    red:   { factor: 0.88, name: 'Red Filter (660 nm)', hex: '#f87171', glow: 'rgba(248, 113, 113, 0.45)', rayColor: '#dc2626', wave: '660 nm' },
    green: { factor: 0.08, name: 'Green Filter (530 nm)', hex: '#4ade80', glow: 'rgba(74, 222, 128, 0.45)', rayColor: '#16a34a', wave: '530 nm' },
    uv:    { factor: 0.04, name: 'UV Rays (350 nm)', hex: '#a855f7', glow: 'rgba(168, 85, 247, 0.48)', rayColor: '#7c3aed', wave: '350 nm (UV)' }
  };

  /**
   * Calculate effective light intensity at Elodea stem based on lamp distance
   * Inverse Square Law: I = I_ref * (d_ref / d)^2
   * @param {number} distanceCm - Distance in cm (10 to 100 cm)
   * @param {boolean} lampOn - Whether the lamp is switched on
   * @param {number} ambientLux - Background laboratory ambient light (~5%)
   * @returns {number} Intensity from 0 to 100 (%)
   */
  static calculateLightIntensity(distanceCm, lampOn = true, ambientLux = 4.0) {
    if (!lampOn) return ambientLux;
    const clampedDist = Math.max(10, Math.min(100, distanceCm));
    // Inverse square relation with d_ref = 15 cm yielding ~100% intensity
    const rawIntensity = 100.0 * Math.pow(15.0 / clampedDist, 2.0);
    return Math.min(100.0, Math.max(ambientLux, rawIntensity));
  }

  /**
   * Light reaction efficiency factor (Rectangular hyperbola saturation)
   * @param {number} intensityPercent - Light intensity (0 to 100%)
   * @returns {number} Factor between 0 and 1
   */
  static getLightSaturationFactor(intensityPercent) {
    // Half-saturation constant K_I = 25%
    return intensityPercent / (intensityPercent + 25.0);
  }

  /**
   * Carbon dioxide availability factor (Michaelis-Menten kinetics)
   * @param {number} nahco3Percent - NaHCO3 concentration (0.0% to 2.0%)
   * @returns {number} Factor between 0 and 1
   */
  static getCarbonDioxideFactor(nahco3Percent) {
    if (nahco3Percent <= 0.001) return 0.0; // No CO2 => zero Calvin cycle dark reaction
    // Half-saturation K_c = 0.20%
    return (nahco3Percent) / (nahco3Percent + 0.20);
  }

  /**
   * Temperature enzyme activity factor (Bell-shaped curve with denaturation)
   * @param {number} tempC - Temperature in Celsius (5°C to 50°C)
   * @returns {number} Factor between 0 and 1
   */
  static getTemperatureFactor(tempC) {
    // Optimum temperature: 28°C. Cold slows collision rate; heat denatures Rubisco
    if (tempC <= 0 || tempC >= 48) return 0.0;
    
    // Gaussian rise to optimum
    const optDiff = tempC - 28.0;
    let factor = Math.exp(-(optDiff * optDiff) / (2.0 * 9.0 * 9.0));

    // Rapid thermal denaturation drop above 38°C
    if (tempC > 38.0) {
      const heatPenalty = Math.pow((tempC - 38.0) / 10.0, 2.0);
      factor = Math.max(0.0, factor - heatPenalty);
    }

    return Math.max(0.0, Math.min(1.0, factor));
  }

  /**
   * Comprehensive Photosynthetic Rate & Bubble Production Calculation
   * @param {object} params
   * @returns {object} Rate metrics and limiting factor identification
   */
  static calculateRate({
    distanceCm = 30,
    lampOn = true,
    filterColor = 'white',
    nahco3Percent = 0.5,
    tempC = 25
  }) {
    const intensity = this.calculateLightIntensity(distanceCm, lampOn);
    const fLight = this.getLightSaturationFactor(intensity);
    const colorObj = this.COLOR_FACTORS[filterColor] || this.COLOR_FACTORS.white;
    const fColor = colorObj.factor;
    const fCO2 = this.getCarbonDioxideFactor(nahco3Percent);
    const fTemp = this.getTemperatureFactor(tempC);

    // Maximum theoretical rate: 64 bubbles / min under ideal conditions
    const MAX_BPM = 64.0;
    const combinedFactor = fLight * fColor * fCO2 * fTemp;
    const rateBPM = MAX_BPM * combinedFactor;

    // Identify the single most limiting factor (Blackman's Law)
    const factorScores = [
      { name: 'Light Intensity (Distance)', score: fLight },
      { name: 'Light Wavelength (Color)', score: fColor },
      { name: 'CO₂ Concentration (NaHCO₃)', score: fCO2 },
      { name: 'Temperature (Enzyme Kinetics)', score: fTemp }
    ];
    factorScores.sort((a, b) => a.score - b.score);
    const limitingFactor = factorScores[0].name;

    // Seconds per bubble (interval)
    const intervalSec = rateBPM > 0.05 ? 60.0 / rateBPM : Infinity;

    return {
      rateBPM,
      intensity,
      fLight,
      fColor,
      fCO2,
      fTemp,
      limitingFactor,
      intervalSec,
      filterInfo: colorObj
    };
  }
}

window.PhotosynthesisBiophysics = PhotosynthesisBiophysics;
