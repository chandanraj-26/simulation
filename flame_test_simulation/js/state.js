/**
 * Flame Test — Centralized State Management Store
 * Manages burner thermodynamics, air-to-gas ratio, wire loop kinematics,
 * salt ionization kinetics, optical cobalt glass filter, and laboratory quests.
 */

class FlameState {
  constructor() {
    // 1. Burner Apparatus Thermodynamics
    this.isLit = true;
    this.gasValve = 70; // 0% to 100% flow rate
    this.airCollar = 0.80; // 0.0 (closed = luminous orange safety) to 1.0 (open = roaring non-luminous blue)
    this.flameType = 'roaring'; // 'safety' | 'gentle' | 'roaring'

    // 2. Nichrome Wire Loop
    this.activeSalt = 'cu'; // default to Copper for dazzling green initial render
    this.saltAmount = 1.0; // 1.0 full to 0.0 depleted
    this.isLoopInFlame = true; // default loop in flame
    this.loopTemp = 950; // °C
    this.isLoopClean = false;
    this.isDippingHCl = false;

    // Interactive Loop X-Y Offsets (micrometer / screen coordinates)
    this.loopPos = { x: 0, y: 0 };
    this.isDraggingLoop = false;

    // 3. Optical Spectroscopy & View Modes
    this.useCobaltGlass = false;
    this.spectroscopeOpen = true;
    this.zoomLevel = 1.0;

    // 4. Mystery Detective Challenge
    this.mysteryMode = false;
    this.activeMysteryId = null;
    this.mysteryRevealed = false;
    this.mysteryGuess = null;

    // 5. Audio
    this.soundEnabled = true;

    // 6. Laboratory Quests
    this.quests = [
      {
        id: 'quest-blue-flame',
        title: 'Calibrate Non-Luminous Roaring Flame',
        desc: 'Open the air collar >70% with gas valve >60% to achieve an intense, non-luminous blue heating cone.',
        completed: true
      },
      {
        id: 'quest-sodium-d-line',
        title: 'Sodium D-Line Spectroscopic Emission',
        desc: 'Test Sodium Chloride (NaCl) in the flame and observe the intense 589 nm yellow doublet in the spectroscope.',
        completed: false
      },
      {
        id: 'quest-cobalt-potassium',
        title: 'Cobalt Glass Potassium Verification',
        desc: 'Test Potassium (KCl) and toggle the Cobalt Blue Glass to filter out yellow light and isolate the lilac emission.',
        completed: false
      },
      {
        id: 'quest-clean-loop',
        title: 'Aseptic Chemical Loop Decontamination',
        desc: 'Dip the wire loop into the concentrated HCl wash dish and hold in flame until completely clean without residual color.',
        completed: false
      },
      {
        id: 'quest-mystery-detective',
        title: 'Deduce Unknown Mystery Sample',
        desc: 'Select an Unknown Mystery Sample, burn it, examine its spectral lines, and correctly submit the cation identity.',
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
        console.error('State notification error:', err);
      }
    }
  }

  setBurnerLit(lit) {
    this.isLit = !!lit;
    this.updateFlameType();
    this.checkQuests();
    this.notify('burner_toggle', { isLit: this.isLit });
  }

  setGasValve(val) {
    this.gasValve = Math.max(0, Math.min(100, parseFloat(val)));
    if (this.gasValve === 0 && this.isLit) {
      this.isLit = false;
    }
    this.updateFlameType();
    this.checkQuests();
    this.notify('gas_change', { gasValve: this.gasValve });
  }

  setAirCollar(val) {
    this.airCollar = Math.max(0, Math.min(1.0, parseFloat(val)));
    this.updateFlameType();
    this.checkQuests();
    this.notify('air_change', { airCollar: this.airCollar });
  }

  updateFlameType() {
    if (!this.isLit || this.gasValve <= 5) {
      this.flameType = 'off';
    } else if (this.airCollar < 0.25) {
      this.flameType = 'safety'; // Luminous yellow, soot-producing, cool (~300°C)
    } else if (this.airCollar < 0.65) {
      this.flameType = 'gentle'; // Medium blue (~700°C)
    } else {
      this.flameType = 'roaring'; // Two-zone roaring blue with sharp inner cone (~1100°C–1400°C)
    }
  }

  selectSalt(saltId) {
    this.activeSalt = saltId;
    this.saltAmount = 1.0;
    this.isLoopClean = (saltId === 'none');
    this.mysteryMode = false;
    this.checkQuests();
    this.notify('salt_select', { saltId });
  }

  selectMystery(mysteryId) {
    const mystery = window.MYSTERY_SAMPLES.find(m => m.id === mysteryId);
    if (!mystery) return;
    this.mysteryMode = true;
    this.activeMysteryId = mysteryId;
    this.activeSalt = mystery.actualElement;
    this.saltAmount = 1.0;
    this.isLoopClean = false;
    this.mysteryRevealed = false;
    this.mysteryGuess = null;
    this.notify('mystery_select', { mysteryId });
  }

  submitMysteryGuess(guessElement) {
    const mystery = window.MYSTERY_SAMPLES.find(m => m.id === this.activeMysteryId);
    if (!mystery) return false;
    const isCorrect = (guessElement === mystery.actualElement);
    this.mysteryRevealed = true;
    this.mysteryGuess = guessElement;
    if (isCorrect) {
      const q = this.quests.find(x => x.id === 'quest-mystery-detective');
      if (q && !q.completed) {
        q.completed = true;
        this.notify('quest_completed', { quest: q });
      }
    }
    this.notify('mystery_result', { isCorrect, actual: mystery.actualElement, guess: guessElement });
    return isCorrect;
  }

  setLoopInFlame(inFlame) {
    this.isLoopInFlame = inFlame;
    this.checkQuests();
    this.notify('loop_flame_change', { isInFlame: this.isLoopInFlame });
  }

  cleanLoopInHCl() {
    this.isDippingHCl = true;
    this.activeSalt = 'none';
    this.saltAmount = 0.0;
    this.isLoopClean = true;
    setTimeout(() => {
      this.isDippingHCl = false;
      this.checkQuests();
      this.notify('loop_cleaned', {});
    }, 450);
  }

  toggleCobaltGlass() {
    this.useCobaltGlass = !this.useCobaltGlass;
    this.checkQuests();
    this.notify('cobalt_toggle', { useCobaltGlass: this.useCobaltGlass });
    return this.useCobaltGlass;
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.notify('sound_toggle', { soundEnabled: this.soundEnabled });
    return this.soundEnabled;
  }

  resetAll() {
    this.isLit = true;
    this.gasValve = 70;
    this.airCollar = 0.80;
    this.activeSalt = 'none';
    this.saltAmount = 1.0;
    this.isLoopInFlame = false;
    this.useCobaltGlass = false;
    this.mysteryMode = false;
    this.updateFlameType();
    this.notify('reset_all', {});
  }

  checkQuests() {
    // 1. Blue roaring flame
    const q1 = this.quests.find(x => x.id === 'quest-blue-flame');
    if (q1 && !q1.completed && this.isLit && this.airCollar >= 0.70 && this.gasValve >= 60) {
      q1.completed = true;
      this.notify('quest_completed', { quest: q1 });
    }

    // 2. Sodium D-line
    const q2 = this.quests.find(x => x.id === 'quest-sodium-d-line');
    if (q2 && !q2.completed && this.isLit && this.isLoopInFlame && this.activeSalt === 'na' && this.saltAmount > 0.1) {
      q2.completed = true;
      this.notify('quest_completed', { quest: q2 });
    }

    // 3. Cobalt glass with Potassium
    const q3 = this.quests.find(x => x.id === 'quest-cobalt-potassium');
    if (q3 && !q3.completed && this.isLit && this.isLoopInFlame && this.activeSalt === 'k' && this.useCobaltGlass) {
      q3.completed = true;
      this.notify('quest_completed', { quest: q3 });
    }

    // 4. Clean loop in HCl
    const q4 = this.quests.find(x => x.id === 'quest-clean-loop');
    if (q4 && !q4.completed && this.isLoopClean && this.isLoopInFlame && this.loopTemp > 800) {
      q4.completed = true;
      this.notify('quest_completed', { quest: q4 });
    }
  }

  getActiveElementData() {
    return window.ELEMENTS_DATA[this.activeSalt] || window.ELEMENTS_DATA.none;
  }
}

window.FlameState = FlameState;
window.flameState = new FlameState();
