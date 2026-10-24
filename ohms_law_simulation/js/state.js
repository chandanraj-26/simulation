/**
 * OhmLab — Reactive Simulation State Store (js/state.js)
 * Manages physical parameters, meter topologies, thermal accumulation,
 * V-I graph datasets, and student laboratory quest achievements.
 *
 * Attaches to window.simState.
 */

class OhmsLawState {
  constructor() {
    // 1. Power Supply
    this.voltage = 6.0;               // Volts (0 – 24 V)

    // 2. Resistor
    this.resistance = 100.0;          // Ohms R0 at 25°C (1 – 1000 Ω)
    this.tempCoeff = 0.004;           // 1/°C (α thermal coefficient)

    // 3. Switch State
    this.switchClosed = false;

    // 4. Computed Dynamic Quantities (updated by physics engine each frame)
    this.current = 0.0;               // Amperes (total circuit current)
    this.currentResistor = 0.0;       // Amperes (through resistor)
    this.voltageResistor = 0.0;       // Volts (across resistor)
    this.voltageVoltmeter = 0.0;      // Volts (measured by voltmeter)
    this.power = 0.0;                 // Watts (Joule heating rate)
    this.effectiveResistance = 100.0; // Ohms (R(T))
    this.temperature = 25.0;          // °C (resistor body temp)
    this.driftVelocity = 0.0;         // m/s (Drude microscopic electron drift)

    // 5. Meter Topology Modes
    this.ammeterMode = 'series';      // 'series' | 'parallel'
    this.voltmeterMode = 'parallel';  // 'parallel' | 'series'

    // 6. Charge Flow Direction
    this.flowDirection = 'conventional'; // 'conventional' | 'electron'

    // 7. Visual Display Toggles
    this.showHeatGlow = true;
    this.showCurrentLabels = true;

    // 8. V-I Characteristic Data Points
    this.graphDataPoints = [];        // Array of { V: number, I: number, R_set: number }
    this.showRegressionLine = false;

    // 9. Hazard State
    this.hazardActive = false;
    this.hazardType = null;
    this.hazardMessage = '';
    this.observedShortCircuit = false;
    this.observedOpenLoop = false;

    // 10. Simulation Control
    this.isPaused = false;
    this.soundEnabled = true;

    // 11. Student Laboratory Quests
    this.quests = [
      {
        id: 'quest_1',
        title: 'First Contact',
        desc: 'Close the circuit knife switch and establish non-zero electric current.',
        stars: 1,
        completed: false,
        check: (s) => s.switchClosed && s.current > 0.001
      },
      {
        id: 'quest_2',
        title: 'Data Collector',
        desc: 'Log at least 5 distinct V-I data points across different voltage settings.',
        stars: 2,
        completed: false,
        check: (s) => s.graphDataPoints && s.graphDataPoints.length >= 5
      },
      {
        id: 'quest_3',
        title: "Ohm's Law Verification",
        desc: 'Plot the linear regression line with 5+ points and achieve R² ≥ 0.95.',
        stars: 3,
        completed: false,
        check: (s) => {
          if (!s.showRegressionLine || !s.graphDataPoints || s.graphDataPoints.length < 5) return false;
          if (!window.OhmsLawPhysics) return false;
          const reg = window.OhmsLawPhysics.linearRegression(s.graphDataPoints);
          return reg && reg.r2 >= 0.95;
        }
      },
      {
        id: 'quest_4',
        title: 'Thermal Power Surge',
        desc: 'Dissipate high electrical power (P > 5 W) and raise resistor temperature past 80°C.',
        stars: 3,
        completed: false,
        check: (s) => s.switchClosed && s.temperature >= 80.0 && s.power > 5.0
      },
      {
        id: 'quest_5',
        title: 'Hazard Inspector',
        desc: 'Simulate both ammeter-in-parallel (short circuit) and voltmeter-in-series (open loop).',
        stars: 4,
        completed: false,
        check: (s) => s.observedShortCircuit && s.observedOpenLoop
      },
      {
        id: 'quest_6',
        title: 'Drude Electron Explorer',
        desc: 'Switch to Electron flow mode and observe electron drift under high voltage (V ≥ 20V).',
        stars: 5,
        completed: false,
        check: (s) => s.switchClosed && s.flowDirection === 'electron' && s.voltage >= 20.0 && s.driftVelocity > 0.00001
      }
    ];
  }

  /**
   * Resets all parameters to factory defaults while cooling down resistor.
   */
  resetAll() {
    this.voltage = 6.0;
    this.resistance = 100.0;
    this.tempCoeff = 0.004;
    this.switchClosed = false;
    this.current = 0.0;
    this.currentResistor = 0.0;
    this.voltageResistor = 0.0;
    this.voltageVoltmeter = 0.0;
    this.power = 0.0;
    this.effectiveResistance = 100.0;
    this.temperature = 25.0;
    this.driftVelocity = 0.0;
    this.ammeterMode = 'series';
    this.voltmeterMode = 'parallel';
    this.flowDirection = 'conventional';
    this.showHeatGlow = true;
    this.showCurrentLabels = true;
    this.graphDataPoints = [];
    this.showRegressionLine = false;
    this.hazardActive = false;
    this.hazardType = null;
    this.hazardMessage = '';
    this.isPaused = false;

    if (window.soundEngine) {
      window.soundEngine.silenceAll();
    }
  }

  /**
   * Adds the current (V, I) operating point to the experimental dataset.
   */
  recordDataPoint() {
    if (!this.switchClosed || this.current <= 0) {
      if (window.ohmUI?.showToast) {
        window.ohmUI.showToast('Close switch to establish current before recording.', 'warning');
      }
      return false;
    }

    if (this.hazardActive) {
      if (window.ohmUI?.showToast) {
        window.ohmUI.showToast('Cannot record accurate data during meter fault hazard.', 'warning');
      }
      return false;
    }

    // Check for near-duplicate point
    const currentV = Number(this.voltageResistor.toFixed(2));
    const currentI = Number(this.currentResistor.toFixed(4));

    const duplicate = this.graphDataPoints.some(pt => {
      return Math.abs(pt.V - currentV) < 0.1 && Math.abs(pt.I - currentI) < 0.0005;
    });

    if (duplicate) {
      if (window.ohmUI?.showToast) {
        window.ohmUI.showToast('A data point at this operating voltage already exists.', 'info');
      }
      return false;
    }

    if (this.graphDataPoints.length >= 25) {
      if (window.ohmUI?.showToast) {
        window.ohmUI.showToast('Dataset full (maximum 25 points).', 'warning');
      }
      return false;
    }

    this.graphDataPoints.push({
      V: currentV,
      I: currentI,
      R_set: this.resistance,
      R_eff: Number(this.effectiveResistance.toFixed(2)),
      T: Number(this.temperature.toFixed(1))
    });

    // Sort by voltage ascending
    this.graphDataPoints.sort((a, b) => a.V - b.V);

    if (window.soundEngine) {
      window.soundEngine.playDataPing();
    }

    if (window.ohmUI?.showToast) {
      window.ohmUI.showToast(`Logged point: V = ${currentV} V, I = ${(currentI * 1000).toFixed(1)} mA`, 'success');
    }

    return true;
  }

  /**
   * Clears experimental data points.
   */
  clearDataPoints() {
    this.graphDataPoints = [];
    this.showRegressionLine = false;
  }

  /**
   * Checks quest conditions and fires celebrations on newly completed quests.
   */
  checkQuests() {
    // Track hazard observations for Quest 5
    if (this.hazardActive) {
      if (this.hazardType === 'AMMETER_PARALLEL') this.observedShortCircuit = true;
      if (this.hazardType === 'VOLTMETER_SERIES') this.observedOpenLoop = true;
    }

    for (let i = 0; i < this.quests.length; i++) {
      const q = this.quests[i];
      if (!q.completed && q.check(this)) {
        q.completed = true;
        if (window.soundEngine) {
          window.soundEngine.playQuestFanfare();
        }
        if (window.ohmUI?.showToast) {
          window.ohmUI.showToast(`⭐ Quest Completed: "${q.title}"!`, 'success');
        }
        if (window.ohmUI?.renderQuestList) {
          window.ohmUI.renderQuestList();
        }
      }
    }
  }
}

window.simState = new OhmsLawState();
