/**
 * StomataModel - Plant Physiology, Guard Cell Osmoregulation & Transpiration
 * NCERT Class 10/11 Biology:
 *  - K+ ion influx / efflux mechanism
 *  - Turgor pressure: Psi_p
 *  - Stomatal aperture: W_pore (0 to 12 µm)
 *  - Transpiration rate & Vapor Pressure Deficit (VPD)
 */

export class StomataModel {
  constructor() {
    this.viewMode = 'cellular'; // 'cellular' or 'epidermal'

    // Environmental parameters
    this.isDay = true;
    this.lightIntensity = 80;    // 0 to 100%
    this.humidity = 50;          // 20 to 90%
    this.temperature = 25.0;     // 15 to 40 °C
    this.abaLevel = 'none';      // 'none', 'moderate', 'high'

    // Gas exchange overlay toggle
    this.showGasArrows = true;

    this.history = [];
    this.quiz = null;
  }

  // Calculate biophysical state
  getState() {
    // Light factor
    const lightEff = this.isDay ? (this.lightIntensity / 100.0) : 0.05;

    // ABA drought hormone inhibition factor
    let abaFactor = 1.0;
    if (this.abaLevel === 'moderate') abaFactor = 0.45;
    else if (this.abaLevel === 'high') abaFactor = 0.05;

    // Potassium ion concentration in guard cells (mM)
    const kConc = 120 + lightEff * 360 * abaFactor;

    // Guard cell turgor pressure (MPa)
    const turgor = 0.2 + (kConc - 120) * (1.6 / 360);

    // Stomatal aperture width (microns, 0 to 12 µm)
    const aperture = Math.max(0, Math.min(12.0, ((turgor - 0.2) / 1.6) * 12.0));

    // Vapor Pressure Deficit (VPD)
    const satVaporPress = 0.61078 * Math.exp((17.27 * this.temperature) / (this.temperature + 237.3)); // kPa
    const actualVaporPress = satVaporPress * (this.humidity / 100.0);
    const vpd = Math.max(0.2, satVaporPress - actualVaporPress); // kPa

    // Stomatal conductance (mol / m² s)
    const g_s = (aperture / 12.0) * 0.45;

    // Transpiration rate (mmol H2O / m² s)
    const transpirationRate = g_s * vpd * 4.2;

    // CO2 assimilation rate (µmol CO2 / m² s)
    const co2Rate = lightEff > 0.1 ? (aperture / 12.0) * lightEff * 18.0 : 0.0;

    const isOpen = (aperture > 1.5);
    let stateLabel = isOpen ? 'Open & Turgid' : 'Closed & Flaccid';
    if (this.abaLevel === 'high') stateLabel = 'Closed (ABA Stress Triggered)';

    return {
      isDay: this.isDay,
      kConc: Math.round(kConc),
      turgor: parseFloat(turgor.toFixed(2)),
      aperture: parseFloat(aperture.toFixed(1)),
      apertureFraction: parseFloat((aperture / 12.0).toFixed(2)),
      transpirationRate: parseFloat(transpirationRate.toFixed(2)),
      co2Rate: parseFloat(co2Rate.toFixed(1)),
      vpd: parseFloat(vpd.toFixed(2)),
      isOpen,
      stateLabel
    };
  }

  logObservation() {
    const time = new Date().toLocaleTimeString();
    const s = this.getState();
    this.history.unshift({
      time,
      light: this.isDay ? `${this.lightIntensity}% Light` : 'Night (Dark)',
      turgor: `${s.turgor} MPa`,
      aperture: `${s.aperture} µm`,
      kConc: `${s.kConc} mM K⁺`,
      transpiration: `${s.transpirationRate} mmol/m²s`,
      status: s.stateLabel
    });
    if (this.history.length > 20) this.history.pop();
  }

  generateQuiz() {
    // Pick random environmental setting
    this.isDay = Math.random() > 0.5;
    this.lightIntensity = this.isDay ? Math.floor(Math.random() * 50 + 50) : 0;
    this.abaLevel = Math.random() > 0.6 ? 'high' : 'none';

    const s = this.getState();
    this.quiz = {
      targetState: s.isOpen ? 'open' : 'closed',
      prompt: `Under conditions of ${this.isDay ? `Bright Daylight (${this.lightIntensity}%)` : 'Dark Night'} with ABA stress = "${this.abaLevel}": Predict whether guard cells are Turgid (Open) or Flaccid (Closed), and what happens to K⁺ ions.`
    };
    return this.quiz;
  }
}
