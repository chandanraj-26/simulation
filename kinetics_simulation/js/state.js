/**
 * Reaction Kinetics — State Management Store
 * Manages reactant concentrations, water bath temperature,
 * stopwatch integration, colloidal sulfur opacity, trial histories, and quests.
 */

class KineticsState {
  constructor() {
    // 1. Thermodynamic & Chemical Parameters
    this.temperatureC = 25.0; // °C
    this.thiosulfateConc = 0.10; // mol/L (M)
    this.hclConc = 1.0; // mol/L (M)
    this.thiosulfateVol = 50; // mL
    this.hclVol = 10; // mL
    this.waterVol = 0; // mL (fixed 60 mL total volume)

    // 2. Reaction State & Photometer
    this.status = 'idle'; // 'idle' | 'running' | 'completed' | 'paused'
    this.elapsedSeconds = 0.0;
    this.opacity = 0.0; // 0.0 (crystal clear) to 1.0 (dense sulfur opacity)
    this.transmittancePct = 100.0; // % light transmitted
    this.crossObscured = false;
    this.simSpeed = 1.0; // 1x, 2x, 5x
    this.isStirring = true;

    // 3. Analytical Trial Records & Plot Mode
    this.trials = [];
    this.plotMode = 'rate_vs_conc'; // 'rate_vs_conc' | 'arrhenius' | 'transmittance_curve'

    // 4. Audio
    this.soundEnabled = true;

    // 5. Educational Quests
    this.quests = [
      {
        id: 'quest-first-trial',
        title: 'Run First Kinetics Trial',
        desc: 'Pour reactants into the flask over the black cross and measure the time required for complete optical extinction.',
        completed: false
      },
      {
        id: 'quest-conc-order',
        title: 'Investigate Concentration Dependence',
        desc: 'Run a trial with high concentration (≥0.16 M) and another with low concentration (≤0.06 M) to verify Rate ∝ [Na₂S₂O₃].',
        completed: false
      },
      {
        id: 'quest-temp-accelerate',
        title: 'Thermal Kinetic Acceleration (Q₁₀ Effect)',
        desc: 'Increase reaction temperature by at least 15°C and observe the dramatic reduction in extinction time.',
        completed: false
      },
      {
        id: 'quest-arrhenius-plot',
        title: 'Complete 4 Laboratory Trials',
        desc: 'Collect data across 4 distinct trials to populate the Arrhenius rate curve and determine activation energy.',
        completed: false
      },
      {
        id: 'quest-ice-bath',
        title: 'Chilled Kinetic Arrest (T ≤ 15°C)',
        desc: 'Conduct a trial below 15°C to demonstrate how reduced molecular kinetic energy slows sulfur nucleation.',
        completed: false
      }
    ];

    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify(event, payload) {
    for (const listener of this.listeners) {
      try {
        listener(event, payload, this);
      } catch (err) {
        console.error('Kinetics state listener error:', err);
      }
    }
  }

  setTemperature(val) {
    this.temperatureC = Math.max(10, Math.min(65, parseFloat(val)));
    this.notify('temp_change', { tempC: this.temperatureC });
  }

  setThiosulfateConc(val) {
    this.thiosulfateConc = Math.max(0.02, Math.min(0.20, parseFloat(val)));
    this.notify('conc_change', { thiosulfateConc: this.thiosulfateConc });
  }

  setHClConc(val) {
    this.hclConc = Math.max(0.5, Math.min(2.0, parseFloat(val)));
    this.notify('hcl_change', { hclConc: this.hclConc });
  }

  setSimSpeed(speed) {
    this.simSpeed = parseFloat(speed) || 1.0;
    this.notify('speed_change', { simSpeed: this.simSpeed });
  }

  setPlotMode(mode) {
    this.plotMode = mode;
    this.notify('plot_mode_change', { plotMode: this.plotMode });
  }

  toggleStirrer() {
    this.isStirring = !this.isStirring;
    this.notify('stirrer_change', { isStirring: this.isStirring });
    return this.isStirring;
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.notify('sound_change', { soundEnabled: this.soundEnabled });
    return this.soundEnabled;
  }

  startReaction() {
    if (this.status === 'completed') {
      this.resetReaction();
    }
    this.status = 'running';
    this.notify('reaction_start', {});
  }

  pauseReaction() {
    if (this.status === 'running') {
      this.status = 'paused';
      this.notify('reaction_pause', {});
    }
  }

  resetReaction() {
    this.status = 'idle';
    this.elapsedSeconds = 0.0;
    this.opacity = 0.0;
    this.transmittancePct = 100.0;
    this.crossObscured = false;
    this.notify('reaction_reset', {});
  }

  recordTrial() {
    const rate = this.elapsedSeconds > 0 ? parseFloat((1 / this.elapsedSeconds).toFixed(5)) : 0;
    const trialRecord = {
      id: `trial-${Date.now()}`,
      trialNum: this.trials.length + 1,
      tempC: parseFloat(this.temperatureC.toFixed(1)),
      tempK: parseFloat((this.temperatureC + 273.15).toFixed(1)),
      concM: parseFloat(this.thiosulfateConc.toFixed(3)),
      hclM: parseFloat(this.hclConc.toFixed(2)),
      timeS: parseFloat(this.elapsedSeconds.toFixed(2)),
      rate: rate,
      lnRate: rate > 0 ? parseFloat(Math.log(rate).toFixed(3)) : null,
      reciprocalTempK: parseFloat((1 / (this.temperatureC + 273.15)).toFixed(6))
    };

    this.trials.push(trialRecord);
    this.checkQuests();
    this.notify('trial_recorded', { trial: trialRecord });
    return trialRecord;
  }

  clearTrials() {
    this.trials = [];
    this.notify('trials_cleared', {});
  }

  checkQuests() {
    // 1. First trial completed
    const q1 = this.quests.find(q => q.id === 'quest-first-trial');
    if (q1 && !q1.completed && this.trials.length >= 1) {
      q1.completed = true;
      this.notify('quest_completed', { quest: q1 });
    }

    // 2. High and low conc trials
    const q2 = this.quests.find(q => q.id === 'quest-conc-order');
    if (q2 && !q2.completed) {
      const hasHigh = this.trials.some(t => t.concM >= 0.16);
      const hasLow = this.trials.some(t => t.concM <= 0.06);
      if (hasHigh && hasLow) {
        q2.completed = true;
        this.notify('quest_completed', { quest: q2 });
      }
    }

    // 3. Temperature acceleration
    const q3 = this.quests.find(q => q.id === 'quest-temp-accelerate');
    if (q3 && !q3.completed) {
      const temps = this.trials.map(t => t.tempC);
      if (temps.length >= 2) {
        const deltaT = Math.max(...temps) - Math.min(...temps);
        if (deltaT >= 15) {
          q3.completed = true;
          this.notify('quest_completed', { quest: q3 });
        }
      }
    }

    // 4. Complete 4 trials
    const q4 = this.quests.find(q => q.id === 'quest-arrhenius-plot');
    if (q4 && !q4.completed && this.trials.length >= 4) {
      q4.completed = true;
      this.notify('quest_completed', { quest: q4 });
    }

    // 5. Chilled trial
    const q5 = this.quests.find(q => q.id === 'quest-ice-bath');
    if (q5 && !q5.completed && this.trials.some(t => t.tempC <= 15)) {
      q5.completed = true;
      this.notify('quest_completed', { quest: q5 });
    }
  }

  applyPreset(presetId) {
    const p = window.KINETICS_DATA.presets.find(x => x.id === presetId);
    if (!p) return;
    this.setTemperature(p.tempC);
    this.setThiosulfateConc(p.thiosulfateM);
    this.setHClConc(p.hclM);
    this.resetReaction();
    this.notify('preset_applied', { preset: p });
  }
}

window.KineticsState = KineticsState;
window.kineticsState = new KineticsState();
