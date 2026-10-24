/**
 * OhmLab — Physics Engine (js/circuit.js)
 * Implements Drude Conduction Model, Ohm's Law, Joule Thermal Dynamics,
 * Meter Topology & Fault Simulation, and Linear Regression Analysis.
 *
 * Zero external dependencies. Attaches to window.OhmsLawPhysics.
 */

const OhmsLawPhysics = {
  // Physical Constants
  ELECTRON_CHARGE: 1.602176634e-19,       // C (elementary charge e)
  ELECTRON_MASS: 9.1093837e-31,          // kg (electron mass m_e)
  CARRIER_DENSITY_COPPER: 8.5e28,        // m^-3 (free electron density n for Cu)
  WIRE_CROSS_AREA: 1.0e-6,               // m^2 (1 mm^2 standard cross-section)
  AMBIENT_TEMP: 25.0,                    // °C (standard ambient room temperature)
  THERMAL_CAPACITY: 5.0,                 // J/°C (thermal capacity C_th of resistor body)
  CONVECTION_COEFF: 0.15,                // W/°C (convective cooling coefficient h)
  MAX_TEMP: 200.0,                       // °C (maximum safety temperature clamp)
  DEFAULT_ALPHA: 0.004,                  // 1/°C (temperature coefficient of resistance)

  // Instrument Internal Resistances
  AMMETER_INTERNAL_R: 0.05,              // Ω (practical shunt ammeter resistance)
  VOLTMETER_INTERNAL_R: 100000.0,        // Ω (100 kΩ practical voltmeter resistance)
  WIRE_RESISTANCE: 0.02,                 // Ω (lead wire and contact resistance)
  SHORT_CIRCUIT_MAX_CURRENT: 50.0,       // A (protective clamp on short-circuit current)

  /**
   * Computes effective resistance accounting for Joule heating temperature rise.
   * R(T) = R0 * [1 + α * (T - T_amb)]
   * @param {number} R0 Base resistance at 25°C in Ohms
   * @param {number} alpha Temperature coefficient (1/°C)
   * @param {number} temperature Current temperature in °C
   * @returns {number} Effective resistance in Ohms
   */
  computeEffectiveResistance(R0, alpha = 0.004, temperature = 25.0) {
    const baseR = Math.max(0.01, R0);
    const deltaT = Math.max(0, temperature - this.AMBIENT_TEMP);
    const rEff = baseR * (1.0 + alpha * deltaT);
    return Math.max(0.01, rEff);
  },

  /**
   * Checks for circuit topology hazards (Ammeter in parallel or Voltmeter in series).
   * @param {string} ammeterMode 'series' | 'parallel'
   * @param {string} voltmeterMode 'parallel' | 'series'
   * @param {number} voltage Supply voltage in Volts
   * @param {boolean} switchClosed Switch state
   * @returns {object} Hazard status object
   */
  checkHazard(ammeterMode, voltmeterMode, voltage, switchClosed) {
    if (!switchClosed || voltage <= 0) {
      return { active: false, type: null, title: 'Safe', message: 'Circuit is open or unpowered.', severity: null };
    }

    if (ammeterMode === 'parallel') {
      return {
        active: true,
        type: 'AMMETER_PARALLEL',
        title: 'DANGER: Ammeter In Parallel (Short Circuit)',
        message: 'An ammeter has near-zero internal resistance (0.05 Ω). Placing it in parallel across the voltage supply causes a catastrophic short-circuit surge!',
        severity: 'danger'
      };
    }

    if (voltmeterMode === 'series') {
      return {
        active: true,
        type: 'VOLTMETER_SERIES',
        title: 'WARNING: Voltmeter In Series (Open Loop)',
        message: 'A voltmeter has extremely high internal resistance (100 kΩ). Connecting it in series chokes the circuit loop, dropping current to microamperes!',
        severity: 'warning'
      };
    }

    return { active: false, type: null, title: 'Normal Circuit', message: 'Meters wired correctly.', severity: null };
  },

  /**
   * Computes current, resistor voltage, and instrument readings.
   * @param {number} V Supply voltage in Volts
   * @param {number} R_eff Effective resistor resistance in Ohms
   * @param {boolean} switchClosed Switch state
   * @param {string} ammeterMode 'series' | 'parallel'
   * @param {string} voltmeterMode 'parallel' | 'series'
   * @returns {object} Current and voltage values across components
   */
  computeCurrent(V, R_eff, switchClosed, ammeterMode = 'series', voltmeterMode = 'parallel') {
    if (!switchClosed || V <= 0) {
      return {
        currentTotal: 0,
        currentResistor: 0,
        currentAmmeter: 0,
        voltageResistor: 0,
        voltageVoltmeter: 0,
        isShortCircuit: false,
        isOpenLoop: false
      };
    }

    // Hazard: Ammeter in parallel (Short-circuit condition)
    if (ammeterMode === 'parallel') {
      const shortR = this.AMMETER_INTERNAL_R + this.WIRE_RESISTANCE;
      const surgeCurrent = Math.min(this.SHORT_CIRCUIT_MAX_CURRENT, V / shortR);
      return {
        currentTotal: surgeCurrent,
        currentResistor: V / (R_eff + this.WIRE_RESISTANCE),
        currentAmmeter: surgeCurrent,
        voltageResistor: V * 0.1, // collapsed voltage due to supply internal drop
        voltageVoltmeter: V * 0.1,
        isShortCircuit: true,
        isOpenLoop: false
      };
    }

    // Hazard: Voltmeter in series (High-impedance choked loop)
    if (voltmeterMode === 'series') {
      const totalSeriesR = this.VOLTMETER_INTERNAL_R + R_eff + this.AMMETER_INTERNAL_R + this.WIRE_RESISTANCE;
      const tinyCurrent = V / totalSeriesR;
      return {
        currentTotal: tinyCurrent,
        currentResistor: tinyCurrent,
        currentAmmeter: tinyCurrent,
        voltageResistor: tinyCurrent * R_eff, // virtually zero volts
        voltageVoltmeter: V - (tinyCurrent * (R_eff + this.AMMETER_INTERNAL_R + this.WIRE_RESISTANCE)), // almost full V
        isShortCircuit: false,
        isOpenLoop: true
      };
    }

    // Normal Topology: Ammeter in series, Voltmeter in parallel across R
    // Resistor in parallel with Voltmeter:
    const R_parallel = (R_eff * this.VOLTMETER_INTERNAL_R) / (R_eff + this.VOLTMETER_INTERNAL_R);
    const R_loop = R_parallel + this.AMMETER_INTERNAL_R + this.WIRE_RESISTANCE;
    const I_loop = V / R_loop;

    const V_resistor = I_loop * R_parallel;
    const I_resistor = V_resistor / R_eff;

    return {
      currentTotal: I_loop,
      currentResistor: I_resistor,
      currentAmmeter: I_loop,
      voltageResistor: V_resistor,
      voltageVoltmeter: V_resistor,
      isShortCircuit: false,
      isOpenLoop: false
    };
  },

  /**
   * Computes Joule electrical power dissipated in the resistor.
   * P = I^2 * R = V * I = V^2 / R
   * @param {number} I Current through resistor in Amperes
   * @param {number} R_eff Resistance in Ohms
   * @returns {number} Dissipated power in Watts
   */
  computePower(I, R_eff) {
    return Math.max(0, I * I * R_eff);
  },

  /**
   * Computes Drude electron drift velocity in the copper wire.
   * vd = I / (n * A * e)
   * @param {number} I Current in Amperes
   * @param {number} n Carrier density (m^-3)
   * @param {number} A Cross-sectional area (m^2)
   * @returns {number} Drift velocity in m/s
   */
  computeDriftVelocity(I, n = this.CARRIER_DENSITY_COPPER, A = this.WIRE_CROSS_AREA) {
    const denominator = n * A * this.ELECTRON_CHARGE;
    if (denominator <= 0) return 0;
    return I / denominator;
  },

  /**
   * Integrates thermal energy accumulation and Newton's law of cooling.
   * dT/dt = (P - h * (T - T_amb)) / C_th
   * @param {number} T_current Current temperature in °C
   * @param {number} power Electrical power dissipated in Watts
   * @param {number} dt Time step in seconds
   * @returns {number} New temperature in °C
   */
  computeTemperature(T_current, power, dt = 0.016) {
    const clampedDt = Math.min(0.1, Math.max(0.001, dt));
    const deltaT = T_current - this.AMBIENT_TEMP;
    const coolingLoss = this.CONVECTION_COEFF * deltaT;
    const netHeatPower = power - coolingLoss;
    const dT = (netHeatPower / this.THERMAL_CAPACITY) * clampedDt;

    const nextT = T_current + dT;
    return Math.min(this.MAX_TEMP, Math.max(this.AMBIENT_TEMP, nextT));
  },

  /**
   * Fits a least-squares linear regression line forced through origin: V = I * R
   * slope m = Σ(x * y) / Σ(x^2)
   * @param {Array<{V: number, I: number}>} points Array of data points
   * @returns {object|null} Regression analysis result
   */
  linearRegression(points) {
    if (!points || points.length < 2) {
      return null;
    }

    let sumXY = 0;
    let sumX2 = 0;
    let sumY = 0;
    let count = points.length;

    for (let i = 0; i < count; i++) {
      const x = points[i].I; // Amperes
      const y = points[i].V; // Volts
      sumXY += x * y;
      sumX2 += x * x;
      sumY += y;
    }

    if (sumX2 === 0) return null;

    // Slope m = R_experimental (Ω)
    const slope = sumXY / sumX2;
    const meanY = sumY / count;

    // Calculate R^2 coefficient of determination
    let ssTot = 0;
    let ssRes = 0;
    for (let i = 0; i < count; i++) {
      const x = points[i].I;
      const y = points[i].V;
      const yPred = slope * x;
      ssRes += Math.pow(y - yPred, 2);
      ssTot += Math.pow(y - meanY, 2);
    }

    const r2 = ssTot === 0 ? 1.0 : Math.max(0, Math.min(1.0, 1.0 - (ssRes / ssTot)));

    return {
      slope: slope, // Experimental Resistance R_exp (Ω)
      conductance: slope > 0 ? (1.0 / slope) : 0, // Experimental Conductance G (S)
      r2: r2,
      pointCount: count
    };
  },

  /**
   * Master solver: computes all circuit quantities for one frame.
   * @param {object} params Circuit state parameters
   * @returns {object} Derived quantities snapshot
   */
  solve(params) {
    const {
      voltage = 6.0,
      resistance = 100.0,
      tempCoeff = this.DEFAULT_ALPHA,
      temperature = this.AMBIENT_TEMP,
      switchClosed = false,
      ammeterMode = 'series',
      voltmeterMode = 'parallel',
      dt = 0.016
    } = params;

    // 1. Temperature-dependent resistance
    const R_eff = this.computeEffectiveResistance(resistance, tempCoeff, temperature);

    // 2. Hazard status
    const hazard = this.checkHazard(ammeterMode, voltmeterMode, voltage, switchClosed);

    // 3. Electrical network solution
    const elec = this.computeCurrent(voltage, R_eff, switchClosed, ammeterMode, voltmeterMode);

    // 4. Power dissipation in resistor
    const power = this.computePower(elec.currentResistor, R_eff);

    // 5. Thermal update
    const T_new = switchClosed ? this.computeTemperature(temperature, power, dt) : this.computeTemperature(temperature, 0, dt);

    // 6. Electron drift velocity
    const driftVelocity = this.computeDriftVelocity(elec.currentTotal);

    return {
      current: elec.currentTotal,
      currentResistor: elec.currentResistor,
      currentAmmeter: elec.currentAmmeter,
      voltageResistor: elec.voltageResistor,
      voltageVoltmeter: elec.voltageVoltmeter,
      power: power,
      R_eff: R_eff,
      T_new: T_new,
      driftVelocity: driftVelocity,
      hazard: hazard,
      isShortCircuit: elec.isShortCircuit,
      isOpenLoop: elec.isOpenLoop
    };
  }
};

window.OhmsLawPhysics = OhmsLawPhysics;
