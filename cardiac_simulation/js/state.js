/**
 * CardiacSim — State Management Store
 * Manages heart rate, rhythm modes, valve status, stethoscope position,
 * telemetry metrics, quests, and view configurations.
 */

class CardiacState {
  constructor() {
    // Core cardiac cycle state
    this.bpm = 72; // Beats per minute (40 - 180)
    this.contractility = 1.0; // Inotropic factor (0.6 - 1.5)
    this.mode = 'anatomy'; // 'anatomy' | 'wiggers' | 'split' | 'auscultation'
    this.rhythm = 'normal'; // 'normal' | 'exercise' | 'bradycardia' | 'tachycardia' | 'afib' | 'vtach' | 'stenosis' | 'regurgitation'

    // Simulation timing & physics (Default 0.25x Slow-Motion for clear educational observation)
    this.phase = 0.0; // Current cardiac cycle phase [0.0, 1.0)
    this.isRunning = true;
    this.simSpeed = 0.25; // 0.1x, 0.25x, 0.5x, 1.0x
    this.timeElapsed = 0.0; // Total seconds elapsed
    this.zoom = 1.0;

    // Auscultation Stethoscope Tool
    this.stethoscope = {
      active: true,
      x: 0.5, // Normalized coordinates [0, 1]
      y: 0.5,
      isDragging: false,
      currentZone: null, // 'aortic' | 'pulmonic' | 'tricuspid' | 'mitral' | null
      zoneProximity: {
        aortic: 0,
        pulmonic: 0,
        tricuspid: 0,
        mitral: 0
      }
    };

    // Audio switches
    this.soundEnabled = true;
    this.monitorBeep = true;
    this.auscultationAudio = true;
    this.masterVolume = 0.85;

    // Live Hemodynamic Metrics
    this.metrics = {
      edv: 125, // End-Diastolic Volume (mL)
      esv: 55,  // End-Systolic Volume (mL)
      sv: 70,   // Stroke Volume (mL)
      ef: 56,   // Ejection Fraction (%)
      co: 5.04, // Cardiac Output (L/min)
      bpSys: 120, // Systolic BP (mmHg)
      bpDia: 80,  // Diastolic BP (mmHg)
      map: 93,    // Mean Arterial Pressure (mmHg)
      lvPressure: 10, // Live LV pressure (mmHg)
      aorticPressure: 80, // Live Aortic pressure (mmHg)
      laPressure: 6, // Live Left Atrial pressure (mmHg)
      ecgMv: 0.0, // Live ECG voltage (mV)
      currentPhaseName: 'Diastole: Rapid Filling',
      phaseNumber: 6
    };

    // Valve States (true = open, false = closed)
    this.valves = {
      tricuspid: true,
      mitral: true,
      pulmonic: false,
      aortic: false
    };

    // Conduction pathway glowing status
    this.conduction = {
      saFired: false,
      atriaDepol: 0.0,
      avNodeDelay: 0.0,
      hisPurkinje: 0.0,
      ventricleDepol: 0.0,
      ventricleRepol: 0.0
    };

    // Telemetry trace history for Oscilloscope / Wiggers
    this.traceHistoryLength = 400;
    this.ecgTrace = new Array(this.traceHistoryLength).fill(0);
    this.lvPressureTrace = new Array(this.traceHistoryLength).fill(10);
    this.aorticPressureTrace = new Array(this.traceHistoryLength).fill(80);
    this.laPressureTrace = new Array(this.traceHistoryLength).fill(6);
    this.volumeTrace = new Array(this.traceHistoryLength).fill(120);
    this.pcgTrace = new Array(this.traceHistoryLength).fill(0);

    // Active Lab Quests & Progress
    this.quests = [
      {
        id: 'quest-pacemaker',
        title: 'Trace the SA-to-Purkinje Highway',
        desc: 'Observe the electrical spark start at the SA Node, pass through the AV Node with a physiologic delay, and fire the ventricles.',
        completed: false
      },
      {
        id: 'quest-wiggers-s1',
        title: 'Correlate S1 ("LUB") with Valve Closure',
        desc: 'Identify which valves snap shut during Isovolumetric Contraction right at the peak of the R-wave to create the S1 heart sound.',
        completed: false
      },
      {
        id: 'quest-cardiac-output',
        title: 'Target Athletic Output (CO > 12.0 L/min)',
        desc: 'Engage Exercise Mode or increase Heart Rate and Contractility to achieve an elevated cardiac output above 12.0 L/min.',
        completed: false
      },
      {
        id: 'quest-auscultation-apex',
        title: 'Auscultate the Mitral Valve at Cardiac Apex',
        desc: 'Drag the stethoscope bell to the Mitral / Apex landmark (5th Intercostal space) to hear the pronounced S1 and apical impulse.',
        completed: false
      },
      {
        id: 'quest-arrhythmia-afib',
        title: 'Diagnose Atrial Fibrillation (AFib)',
        desc: 'Switch to AFib rhythm and observe the absence of P-waves on the ECG and the irregular ventricular response.',
        completed: false
      }
    ];

    // Listeners for UI state changes
    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify(event, payload) {
    for (const listener of this.listeners) {
      listener(event, payload, this);
    }
  }

  setBpm(newBpm) {
    this.bpm = Math.max(35, Math.min(200, Math.round(newBpm)));
    this.recomputeHemodynamics();
    this.notify('bpm_change', { bpm: this.bpm });
  }

  setRhythm(rhythmKey) {
    this.rhythm = rhythmKey;
    switch (rhythmKey) {
      case 'exercise':
        this.bpm = 145;
        this.contractility = 1.35;
        break;
      case 'bradycardia':
        this.bpm = 45;
        this.contractility = 1.0;
        break;
      case 'tachycardia':
        this.bpm = 130;
        this.contractility = 1.0;
        break;
      case 'afib':
        this.bpm = 115;
        this.contractility = 0.85;
        this.checkQuest('quest-arrhythmia-afib');
        break;
      case 'vtach':
        this.bpm = 165;
        this.contractility = 0.55;
        break;
      case 'stenosis':
        this.bpm = 78;
        this.contractility = 1.2;
        break;
      case 'regurgitation':
        this.bpm = 82;
        this.contractility = 0.95;
        break;
      case 'normal':
      default:
        this.bpm = 72;
        this.contractility = 1.0;
        break;
    }
    this.recomputeHemodynamics();
    this.notify('rhythm_change', { rhythm: this.rhythm });
  }

  setContractility(val) {
    this.contractility = Math.max(0.5, Math.min(1.6, parseFloat(val)));
    this.recomputeHemodynamics();
    this.notify('contractility_change', { contractility: this.contractility });
  }

  setMode(modeKey) {
    this.mode = modeKey;
    this.notify('mode_change', { mode: this.mode });
  }

  togglePlayPause() {
    this.isRunning = !this.isRunning;
    this.notify('running_change', { isRunning: this.isRunning });
    return this.isRunning;
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.notify('sound_change', { soundEnabled: this.soundEnabled });
    return this.soundEnabled;
  }

  toggleMonitorBeep() {
    this.monitorBeep = !this.monitorBeep;
    this.notify('monitor_change', { monitorBeep: this.monitorBeep });
    return this.monitorBeep;
  }

  setSimSpeed(speed) {
    this.simSpeed = Math.max(0.05, Math.min(2.0, parseFloat(speed)));
    this.notify('speed_change', { simSpeed: this.simSpeed });
  }

  setPhase(p) {
    this.phase = Math.max(0.0, Math.min(0.999, parseFloat(p)));
    if (window.cardiacEngine) {
      window.cardiacEngine.determinePhase(this.phase);
      const { lvP, aoP, laP } = window.cardiacEngine.calculatePressures(this.phase);
      this.metrics.lvPressure = Math.round(lvP);
      this.metrics.aorticPressure = Math.round(aoP);
      this.metrics.laPressure = Math.round(laP);
      this.metrics.ecgMv = parseFloat(window.cardiacEngine.calculateECG(this.phase).toFixed(3));
    }
    this.notify('phase_scrub', { phase: this.phase });
  }

  stepPhase(delta) {
    let nextPhase = (this.phase + delta) % 1.0;
    if (nextPhase < 0) nextPhase += 1.0;
    this.setPhase(nextPhase);
  }

  jumpToPhaseNumber(num) {
    const targets = {
      1: 0.05, // Atrial Systole
      2: 0.15, // Isovolumetric Contraction
      3: 0.26, // Rapid Ejection
      4: 0.40, // Reduced Ejection
      5: 0.48, // Isovolumetric Relaxation
      6: 0.60, // Rapid Filling
      7: 0.85  // Diastasis
    };
    if (targets[num] !== undefined) {
      this.setPhase(targets[num]);
    }
  }

  setZoom(z) {
    this.zoom = Math.max(0.6, Math.min(2.0, z));
    this.notify('zoom_change', { zoom: this.zoom });
  }

  recomputeHemodynamics() {
    // Hemodynamic calculations based on Frank-Starling Law & inotropic state
    let baseEdv = 125;
    let baseEsv = 55;

    if (this.rhythm === 'exercise') {
      baseEdv = 140; // increased venous return
      baseEsv = 40;  // hyperdynamic emptying
    } else if (this.rhythm === 'vtach') {
      baseEdv = 75;  // grossly inadequate diastolic filling
      baseEsv = 50;
    } else if (this.rhythm === 'afib') {
      baseEdv = 110; // loss of atrial kick (20% reduction)
      baseEsv = 55;
    } else if (this.rhythm === 'stenosis') {
      baseEdv = 135;
      baseEsv = 65;
    }

    const edv = Math.round(baseEdv);
    const esv = Math.round(baseEsv / this.contractility);
    const sv = Math.max(10, edv - esv);
    const ef = Math.round((sv / edv) * 100);
    const co = parseFloat(((this.bpm * sv) / 1000).toFixed(2));

    // Blood pressures
    let bpSys = Math.round(100 + (sv * 0.35) * this.contractility);
    let bpDia = Math.round(70 + (this.bpm * 0.15));

    if (this.rhythm === 'stenosis') {
      bpSys = 110; // narrow pulse pressure
      bpDia = 82;
    } else if (this.rhythm === 'vtach') {
      bpSys = 75; // profound hypotension
      bpDia = 50;
    }

    const map = Math.round(bpDia + (bpSys - bpDia) / 3);

    this.metrics.edv = edv;
    this.metrics.esv = esv;
    this.metrics.sv = sv;
    this.metrics.ef = ef;
    this.metrics.co = co;
    this.metrics.bpSys = bpSys;
    this.metrics.bpDia = bpDia;
    this.metrics.map = map;

    if (co >= 12.0) {
      this.checkQuest('quest-cardiac-output');
    }
  }

  checkQuest(questId) {
    const q = this.quests.find(item => item.id === questId);
    if (q && !q.completed) {
      q.completed = true;
      this.notify('quest_completed', { quest: q });
    }
  }

  reset() {
    this.bpm = 72;
    this.contractility = 1.0;
    this.rhythm = 'normal';
    this.mode = 'anatomy';
    this.phase = 0.0;
    this.isRunning = true;
    this.simSpeed = 1.0;
    this.zoom = 1.0;
    this.recomputeHemodynamics();
    this.notify('reset', {});
  }
}

// Global state singleton
window.cardiacState = new CardiacState();
