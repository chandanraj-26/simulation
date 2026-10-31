/**
 * ResonanceModel - Acoustic Closed-Pipe Standing Wave Physics & Thermodynamics
 * NCERT Class 11 Physics Practical:
 *   v(T) = 331.3 * sqrt(1 + T/273.15)
 *   lambda = v / f
 *   End correction: e = 0.3 * d
 *   L1 = lambda/4 - e
 *   L2 = 3*lambda/4 - e
 *   v_calc = 2 * f * (L2 - L1)
 */

export const FORK_FREQUENCIES = [
  { freq: 512, note: 'C5 (High C)', standard: true },
  { freq: 440, note: 'A4 (Concert Pitch)', standard: false },
  { freq: 384, note: 'G4', standard: false },
  { freq: 256, note: 'C4 (Middle C)', standard: false }
];

export class ResonanceModel {
  constructor() {
    this.frequency = 512;          // Hz
    this.temperature = 25.0;       // °C
    this.tubeDiameter = 3.0;       // cm
    this.waterColumnHeight = 84.0; // cm of water in 100 cm tube (Air column L = 100 - waterHeight)

    // Standing wave visualization toggle
    this.showWaveform = true;

    this.history = [];
    this.quiz = null;
  }

  // Speed of sound in dry air at temperature T
  get speedOfSound() {
    return 331.3 * Math.sqrt(1 + this.temperature / 273.15); // in m/s
  }

  // Wavelength in centimeters
  get wavelengthCm() {
    return (this.speedOfSound / this.frequency) * 100.0;
  }

  // End correction e in centimeters
  get endCorrectionCm() {
    return 0.3 * this.tubeDiameter;
  }

  // Theoretical 1st resonance length L1 in cm
  get L1() {
    return this.wavelengthCm / 4.0 - this.endCorrectionCm;
  }

  // Theoretical 2nd resonance length L2 in cm
  get L2() {
    return (3.0 * this.wavelengthCm) / 4.0 - this.endCorrectionCm;
  }

  // Current physical air column length L in cm (top of tube to water meniscus)
  get airColumnLength() {
    return 100.0 - this.waterColumnHeight;
  }

  set airColumnLength(val) {
    this.waterColumnHeight = Math.max(0, Math.min(100.0, 100.0 - val));
  }

  // Acoustic resonance proximity (0.0 to 1.0)
  getResonanceProximity() {
    const L = this.airColumnLength;
    const sigma = 1.2; // sharpness band width in cm

    const dist1 = Math.abs(L - this.L1);
    const dist2 = Math.abs(L - this.L2);

    const q1 = Math.exp(-(dist1 * dist1) / (2 * sigma * sigma));
    const q2 = Math.exp(-(dist2 * dist2) / (2 * sigma * sigma));

    return {
      factor: Math.max(q1, q2),
      isAtL1: dist1 < 0.8,
      isAtL2: dist2 < 0.8,
      dist1,
      dist2
    };
  }

  logObservation() {
    const time = new Date().toLocaleTimeString();
    const vTrue = this.speedOfSound;
    const l1 = this.L1.toFixed(1);
    const l2 = this.L2.toFixed(1);
    const vCalc = 2 * this.frequency * ((this.L2 - this.L1) / 100.0);

    this.history.unshift({
      time,
      freq: `${this.frequency} Hz`,
      temp: `${this.temperature.toFixed(1)} °C`,
      L1: `${l1} cm`,
      L2: `${l2} cm`,
      lambda: `${this.wavelengthCm.toFixed(1)} cm`,
      speedCalc: `${vCalc.toFixed(1)} m/s`,
      speedTrue: `${vTrue.toFixed(1)} m/s`
    });
    if (this.history.length > 20) this.history.pop();
  }

  generateQuiz() {
    // Pick random frequency and temperature
    const fObj = FORK_FREQUENCIES[Math.floor(Math.random() * FORK_FREQUENCIES.length)];
    this.frequency = fObj.freq;
    this.temperature = Math.floor(Math.random() * 25 + 10); // 10 to 35 °C

    const vTrue = this.speedOfSound;
    const l1 = this.L1;
    const l2 = this.L2;

    this.quiz = {
      targetV: parseFloat(vTrue.toFixed(1)),
      targetL1: parseFloat(l1.toFixed(1)),
      targetL2: parseFloat(l2.toFixed(1)),
      prompt: `Given a tuning fork of frequency f = ${this.frequency} Hz, and air temperature T = ${this.temperature}°C with tube diameter d = ${this.tubeDiameter} cm: Find the first resonance length L₁ (cm) and determine the speed of sound v (m/s).`
    };
    return this.quiz;
  }
}
