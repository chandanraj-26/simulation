/**
 * PhotosynthesisLab — State Management & Reactive Store
 */

class SimulationState {
  constructor() {
    this.mode = 'apparatus'; // 'apparatus' | 'chloroplast' | 'graph'

    // Environmental Independent Variables
    this.distanceCm = 30;       // 10 to 100 cm
    this.lampOn = true;
    this.filterColor = 'white'; // 'white' | 'blue' | 'red' | 'green'
    this.nahco3Percent = 0.5;   // 0.0% to 2.0%
    this.tempC = 25;            // 5°C to 50°C

    // Digital Bubble Counter & Stopwatch
    this.stopwatchRunning = false;
    this.stopwatchSeconds = 0;
    this.totalBubblesCounted = 0;
    this.accumulatedO2Volume = 0.0; // mL in gas tube

    // Active Kinetic Curve Tab ('distance' | 'intensity' | 'temp' | 'nahco3')
    this.activeGraphTab = 'distance';

    // Bubble Physics State
    this.bubbles = [];
    this.bubbleSpawnTimer = 0;

    // Simulation Speed & Pause
    this.simSpeed = 1.0;
    this.isPaused = false;

    // Quests
    this.quests = [
      {
        id: 1,
        title: "The Green Light Paradox",
        desc: "Switch the light filter to Green (530 nm). Observe bubble rate plummet below 6 BPM because green light is reflected by chlorophyll!",
        stars: 1,
        completed: false,
        check: () => {
          const metrics = PhotosynthesisBiophysics.calculateRate(this);
          return this.filterColor === 'green' && metrics.rateBPM < 6.0;
        }
      },
      {
        id: 2,
        title: "Inverse-Square Law",
        desc: "Bring the lamp close to 15 cm or less. Verify the bubble rate increases sharply due to the geometric inverse-square law (I ∝ 1/d²)!",
        stars: 2,
        completed: false,
        check: () => {
          return this.lampOn && this.distanceCm <= 15;
        }
      },
      {
        id: 3,
        title: "Carbon Starvation",
        desc: "Set dissolved NaHCO₃ to 0.0%. Watch oxygen bubble emission stop completely because the Calvin cycle lacks carbon dioxide!",
        stars: 3,
        completed: false,
        check: () => {
          const metrics = PhotosynthesisBiophysics.calculateRate(this);
          return this.nahco3Percent <= 0.02 && metrics.rateBPM <= 0.5;
        }
      },
      {
        id: 4,
        title: "Thermal Denaturation",
        desc: "Heat the water bath to ≥ 44°C. Watch bubble production collapse due to irreversible denaturation of the Rubisco enzyme!",
        stars: 4,
        completed: false,
        check: () => {
          const metrics = PhotosynthesisBiophysics.calculateRate(this);
          return this.tempC >= 44 && metrics.rateBPM <= 2.0;
        }
      },
      {
        id: 5,
        title: "Maximum Productivity Champion",
        desc: "Optimize all limiting factors (Blue or White light, ≤ 15 cm distance, 25°C–30°C, and ≥ 1.0% NaHCO₃) to reach ≥ 45 bubbles/min!",
        stars: 5,
        completed: false,
        check: () => {
          const metrics = PhotosynthesisBiophysics.calculateRate(this);
          return metrics.rateBPM >= 45.0;
        }
      }
    ];
  }

  setDistance(cm) {
    this.distanceCm = Math.max(10, Math.min(100, cm));
    this.checkQuests();
  }

  setLampToggle(state) {
    this.lampOn = state !== undefined ? state : !this.lampOn;
    if (window.soundEngine) window.soundEngine.playLampToggle();
    this.checkQuests();
  }

  setFilterColor(colorKey) {
    if (PhotosynthesisBiophysics.COLOR_FACTORS[colorKey]) {
      this.filterColor = colorKey;
      if (window.soundEngine) window.soundEngine.playClick();
      this.checkQuests();
    }
  }

  setNahco3(percent) {
    this.nahco3Percent = Math.max(0.0, Math.min(2.0, percent));
    this.checkQuests();
  }

  setTemperature(temp) {
    this.tempC = Math.max(5, Math.min(50, temp));
    this.checkQuests();
  }

  setGraphTab(tab) {
    this.activeGraphTab = tab;
    if (window.soundEngine) window.soundEngine.playClick();
  }

  resetStopwatch() {
    this.stopwatchRunning = false;
    this.stopwatchSeconds = 0;
    this.totalBubblesCounted = 0;
    this.accumulatedO2Volume = 0.0;
    if (window.soundEngine) window.soundEngine.playClick();
  }

  toggleStopwatch() {
    this.stopwatchRunning = !this.stopwatchRunning;
    if (window.soundEngine) window.soundEngine.playClick();
  }

  resetAllParameters() {
    this.distanceCm = 30;
    this.lampOn = true;
    this.filterColor = 'white';
    this.nahco3Percent = 0.5;
    this.tempC = 25;
    this.bubbles = [];
    this.resetStopwatch();
    if (window.soundEngine) window.soundEngine.playClick();
  }

  checkQuests() {
    this.quests.forEach(q => {
      if (!q.completed && q.check()) {
        q.completed = true;
        if (window.soundEngine) window.soundEngine.playSuccessFanfare();
        if (window.photosynthesisUI && window.photosynthesisUI.showToast) {
          window.photosynthesisUI.showToast(`⭐ Quest Complete: "${q.title}"!`, 'success');
        }
      }
    });
  }
}

window.simState = new SimulationState();
