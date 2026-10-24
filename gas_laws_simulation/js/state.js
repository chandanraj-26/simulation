/**
 * Kinetic Gas Laws — Centralized State Management Store
 * Manages thermodynamic state variables (P, V, T, n), gas species selection,
 * parameter locks (Boyle, Charles, Gay-Lussac), historical state points, and quests.
 */

class GasState {
  constructor() {
    // 1. Primary Thermodynamic Variables
    this.volumeL = 15.0; // Liters
    this.temperatureK = 300.0; // Kelvin (~27 °C)
    this.moles = 1.0; // mol
    this.gasSpecies = 'he'; // 'he' | 'ne' | 'ar' | 'kr'

    // Computed Variables
    this.pressureAtm = 1.64; // atm (computed dynamically via P = nRT/V)
    this.pressureKPa = 166.3; // kPa
    this.vRms = 1368.0; // m/s (He at 300 K)

    // 2. Constraints & Fixed Parameter Locks
    // 'none' | 'temp' (Boyle) | 'pressure' (Charles) | 'volume' (Gay-Lussac)
    this.lockParam = 'none';

    // 3. Chamber & Piston Kinematics
    this.isDraggingPiston = false;
    this.showVelocityVectors = true;
    this.plotMode = 'PV'; // 'PV' | 'VT' | 'PT' | 'maxwell'

    // Historical Points on State Diagram
    this.stateHistory = [];

    // 4. Audio
    this.soundEnabled = true;

    // 5. Educational Quests
    this.quests = [
      {
        id: 'quest-boyle',
        title: "Boyle's Law Isothermal Compression",
        desc: "Lock Temperature (constant T) and halve the volume (e.g., from 16 L to 8 L) to observe pressure doubling.",
        completed: false
      },
      {
        id: 'quest-charles',
        title: "Charles's Law Isobaric Thermal Expansion",
        desc: "Lock Pressure (constant P) and double the absolute temperature (e.g. 200 K to 400 K) to double gas volume.",
        completed: false
      },
      {
        id: 'quest-gay-lussac',
        title: "Gay-Lussac's Rigid Isochoric Heating",
        desc: "Lock Volume (constant V) and heat the cylinder above 550 K to observe proportional pressure rise.",
        completed: false
      },
      {
        id: 'quest-maxwell-speed',
        title: "Maxwell-Boltzmann Mass Comparison",
        desc: "Compare light Helium against heavy Argon at 300 K to observe how molecular mass shifts the velocity distribution.",
        completed: false
      },
      {
        id: 'quest-avogadro-pump',
        title: "Avogadro's Mole Injection",
        desc: "Use the bicycle air pump to inject gas moles up to ≥2.0 mol and observe the resultant volume/pressure increase.",
        completed: false
      }
    ];

    this.listeners = [];
    this.recomputeThermodynamics();
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify(event, payload) {
    for (const listener of this.listeners) {
      try {
        listener(event, payload, this);
      } catch (err) {
        console.error('Gas state listener error:', err);
      }
    }
  }

  recomputeThermodynamics() {
    const R = window.GAS_DATA.R_ATM; // 0.08206 L*atm/(mol*K)
    const R_SI = window.GAS_DATA.R_JOULES; // 8.314 J/(mol*K)

    // Ideal Gas Law: P = n * R * T / V
    this.pressureAtm = (this.moles * R * this.temperatureK) / this.volumeL;
    this.pressureKPa = this.pressureAtm * 101.325;

    // Root-mean-square speed: v_rms = sqrt(3 * R * T / M)
    const species = window.GAS_DATA.species[this.gasSpecies] || window.GAS_DATA.species.he;
    const molarMassKg = species.molarMassG / 1000.0;
    this.vRms = Math.sqrt((3 * R_SI * this.temperatureK) / molarMassKg);

    // Record point in state diagram if history is active
    if (this.stateHistory.length === 0 || Math.hypot(
      this.volumeL - this.stateHistory[this.stateHistory.length - 1].v,
      this.pressureAtm - this.stateHistory[this.stateHistory.length - 1].p
    ) > 0.4) {
      this.stateHistory.push({
        v: parseFloat(this.volumeL.toFixed(2)),
        p: parseFloat(this.pressureAtm.toFixed(2)),
        t: parseFloat(this.temperatureK.toFixed(1)),
        n: parseFloat(this.moles.toFixed(2))
      });
      if (this.stateHistory.length > 50) this.stateHistory.shift();
    }
  }

  setVolume(volL) {
    volL = Math.max(window.GAS_DATA.chamber.minVolumeL, Math.min(window.GAS_DATA.chamber.maxVolumeL, parseFloat(volL)));

    if (this.lockParam === 'volume') return;

    if (this.lockParam === 'pressure') {
      // Isobaric: T must adjust to keep P constant: T = P * V / (n * R)
      const R = window.GAS_DATA.R_ATM;
      const targetT = (this.pressureAtm * volL) / (this.moles * R);
      if (targetT >= window.GAS_DATA.chamber.minTempK && targetT <= window.GAS_DATA.chamber.maxTempK) {
        this.volumeL = volL;
        this.temperatureK = targetT;
      }
    } else {
      this.volumeL = volL;
    }

    this.recomputeThermodynamics();
    this.checkQuests();
    this.notify('volume_change', { volumeL: this.volumeL });
  }

  setTemperature(tempK) {
    tempK = Math.max(window.GAS_DATA.chamber.minTempK, Math.min(window.GAS_DATA.chamber.maxTempK, parseFloat(tempK)));

    if (this.lockParam === 'temp') return;

    if (this.lockParam === 'pressure') {
      // Isobaric: V must adjust to keep P constant: V = n * R * T / P
      const R = window.GAS_DATA.R_ATM;
      const targetV = (this.moles * R * tempK) / this.pressureAtm;
      if (targetV >= window.GAS_DATA.chamber.minVolumeL && targetV <= window.GAS_DATA.chamber.maxVolumeL) {
        this.temperatureK = tempK;
        this.volumeL = targetV;
      }
    } else {
      this.temperatureK = tempK;
    }

    this.recomputeThermodynamics();
    this.checkQuests();
    this.notify('temp_change', { temperatureK: this.temperatureK });
  }

  setMoles(n) {
    n = Math.max(window.GAS_DATA.chamber.minMoles, Math.min(window.GAS_DATA.chamber.maxMoles, parseFloat(n)));
    this.moles = n;
    this.recomputeThermodynamics();
    this.checkQuests();
    this.notify('moles_change', { moles: this.moles });
  }

  injectGasMoles(deltaN = 0.25) {
    this.setMoles(this.moles + deltaN);
    this.notify('gas_injected', { deltaN });
  }

  ventGasMoles(deltaN = 0.25) {
    this.setMoles(this.moles - deltaN);
    this.notify('gas_vented', { deltaN });
  }

  setGasSpecies(speciesId) {
    if (!window.GAS_DATA.species[speciesId]) return;
    this.gasSpecies = speciesId;
    this.recomputeThermodynamics();
    this.checkQuests();
    this.notify('species_change', { gasSpecies: this.gasSpecies });
  }

  setLockParameter(param) {
    this.lockParam = param;
    this.notify('lock_change', { lockParam: this.lockParam });
  }

  setPlotMode(mode) {
    this.plotMode = mode;
    this.notify('plot_mode_change', { plotMode: this.plotMode });
  }

  toggleVectors() {
    this.showVelocityVectors = !this.showVelocityVectors;
    this.notify('vectors_change', { showVectors: this.showVelocityVectors });
    return this.showVelocityVectors;
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.notify('sound_change', { soundEnabled: this.soundEnabled });
    return this.soundEnabled;
  }

  clearHistory() {
    this.stateHistory = [];
    this.notify('history_cleared', {});
  }

  checkQuests() {
    // 1. Boyle's law check
    const q1 = this.quests.find(q => q.id === 'quest-boyle');
    if (q1 && !q1.completed && this.lockParam === 'temp' && this.volumeL <= 8.5) {
      q1.completed = true;
      this.notify('quest_completed', { quest: q1 });
    }

    // 2. Charles's law check
    const q2 = this.quests.find(q => q.id === 'quest-charles');
    if (q2 && !q2.completed && this.lockParam === 'pressure' && this.temperatureK >= 450) {
      q2.completed = true;
      this.notify('quest_completed', { quest: q2 });
    }

    // 3. Gay-Lussac's law check
    const q3 = this.quests.find(q => q.id === 'quest-gay-lussac');
    if (q3 && !q3.completed && this.lockParam === 'volume' && this.temperatureK >= 550) {
      q3.completed = true;
      this.notify('quest_completed', { quest: q3 });
    }

    // 4. Maxwell-Boltzmann heavy species comparison
    const q4 = this.quests.find(q => q.id === 'quest-maxwell-speed');
    if (q4 && !q4.completed && (this.gasSpecies === 'ar' || this.gasSpecies === 'kr')) {
      q4.completed = true;
      this.notify('quest_completed', { quest: q4 });
    }

    // 5. Avogadro mole pump
    const q5 = this.quests.find(q => q.id === 'quest-avogadro-pump');
    if (q5 && !q5.completed && this.moles >= 2.0) {
      q5.completed = true;
      this.notify('quest_completed', { quest: q5 });
    }
  }

  applyPreset(presetId) {
    const p = window.GAS_DATA.presets.find(x => x.id === presetId);
    if (!p) return;
    this.lockParam = 'none';
    this.volumeL = p.volumeL;
    this.temperatureK = p.tempK;
    this.moles = p.moles;
    this.gasSpecies = p.gasId;
    this.recomputeThermodynamics();
    this.lockParam = p.constantParam === 'T' ? 'temp' : (p.constantParam === 'P' ? 'pressure' : (p.constantParam === 'V' ? 'volume' : 'none'));
    this.notify('preset_applied', { preset: p });
  }
}

window.GasState = GasState;
window.gasState = new GasState();
