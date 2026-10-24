/**
 * Electrolysis & Electroplating — Central Simulation State
 * Reactive state container with subscriber notification system and quest tracker.
 */

class ElectrolysisState {
  constructor() {
    this.mode = 'water_splitting'; // 'water_splitting' | 'electroplating'
    this.powerOn = false;
    this.voltage = 6.0; // Volts (0 - 12V)
    this.solutionResistance = 4.0; // Ohms
    this.current = 0.0; // Amperes
    this.timeElapsed = 0.0; // Simulated seconds

    // Mode A: Water Splitting State
    this.h2Volume = 0.0; // mL
    this.o2Volume = 0.0; // mL
    this.maxTubeCapacity = 45.0; // mL max readable volume

    // Mode B: Electroplating State
    this.cuMassPlated = 0.0; // mg (milligrams)
    this.initialKeyMass = 12.450; // g
    this.platingThicknessUm = 0.0; // micrometers

    // Splint Testing System
    this.splintMode = 'none'; // 'none' | 'burning' | 'glowing'
    this.splintPos = { x: 0, y: 0 };
    this.isDraggingSplint = false;
    this.splintTestActive = null; // null | 'hydrogen' | 'oxygen'
    this.splintTestTimer = 0;

    // Particles & Simulation Arrays
    this.bubbles = [];
    this.ions = [];

    // Global Settings
    this.soundEnabled = true;
    this.simSpeed = 1.0;

    // Quests for Class 9/10 Lab Curriculum
    this.quests = [
      {
        id: 'q1',
        title: 'Initiate Electrolysis',
        desc: 'Turn on the DC power supply at > 2.0 V to overcome the water decomposition overpotential.',
        completed: false
      },
      {
        id: 'q2',
        title: 'Stoichiometric 2:1 Ratio',
        desc: 'Accumulate at least 8.0 mL of H₂ gas and observe the 2:1 volume ratio between H₂ and O₂.',
        completed: false
      },
      {
        id: 'q3',
        title: 'Hydrogen Pop Test',
        desc: 'Light a wooden splint and bring it to the Hydrogen tap (Cathode) to observe the squeaky pop.',
        completed: false
      },
      {
        id: 'q4',
        title: 'Oxygen Relight Test',
        desc: 'Light a glowing splint and hold it near the Oxygen tap (Anode) to watch the flame reignite.',
        completed: false
      },
      {
        id: 'q5',
        title: 'Copper Electroplating',
        desc: 'Switch to Electroplating mode and deposit at least 25 mg of pure Copper onto the iron key cathode.',
        completed: false
      }
    ];

    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(eventType, data) {
    for (const listener of this.listeners) {
      try {
        listener(eventType, data, this);
      } catch (err) {
        console.error('State listener error:', err);
      }
    }
  }

  setMode(newMode) {
    if (this.mode === newMode) return;
    this.mode = newMode;
    this.powerOn = false;
    this.current = 0.0;
    this.splintMode = 'none';
    this.splintTestActive = null;
    this.notify('mode_change', { mode: this.mode });
  }

  togglePower() {
    this.powerOn = !this.powerOn;
    this.notify('power_toggle', { powerOn: this.powerOn });
    this.checkQuests();
  }

  setVoltage(val) {
    this.voltage = Math.max(0.0, Math.min(12.0, parseFloat(val) || 0.0));
    this.notify('voltage_change', { voltage: this.voltage });
    this.checkQuests();
  }

  setSplintMode(mode) {
    this.splintMode = mode;
    this.splintTestActive = null;
    this.notify('splint_mode_change', { splintMode: this.splintMode });
  }

  resetCurrentMode() {
    if (this.mode === 'water_splitting') {
      this.h2Volume = 0.0;
      this.o2Volume = 0.0;
    } else {
      this.cuMassPlated = 0.0;
      this.platingThicknessUm = 0.0;
    }
    this.timeElapsed = 0.0;
    this.bubbles = [];
    this.ions = [];
    this.splintTestActive = null;
    this.notify('reset', {});
  }

  triggerSplintTest(gasType) {
    if (this.splintTestActive) return false;
    if (gasType === 'hydrogen' && this.h2Volume < 1.0) return false;
    if (gasType === 'oxygen' && this.o2Volume < 0.5) return false;

    this.splintTestActive = gasType;
    this.splintTestTimer = 1.8; // seconds

    if (gasType === 'hydrogen') {
      this.h2Volume = Math.max(0, this.h2Volume - 4.0);
      this.completeQuest('q3');
    } else if (gasType === 'oxygen') {
      this.o2Volume = Math.max(0, this.o2Volume - 2.0);
      this.completeQuest('q4');
    }

    this.notify('splint_test', { gasType });
    return true;
  }

  completeQuest(questId) {
    const q = this.quests.find(item => item.id === questId);
    if (q && !q.completed) {
      q.completed = true;
      this.notify('quest_completed', { quest: q });
    }
  }

  checkQuests() {
    // Quest 1: Turn on power supply at > 2V
    if (this.powerOn && this.voltage >= 2.0) {
      this.completeQuest('q1');
    }

    // Quest 2: Collect at least 8 mL H2
    if (this.h2Volume >= 8.0 && this.o2Volume >= 3.5) {
      this.completeQuest('q2');
    }

    // Quest 5: Electroplating > 25 mg Cu
    if (this.mode === 'electroplating' && this.cuMassPlated >= 25.0) {
      this.completeQuest('q5');
    }
  }
}

window.ElectrolysisState = ElectrolysisState;
