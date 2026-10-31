/**
 * CaliperState - Analytical engine for Vernier Caliper & Screw Gauge (Micrometer)
 * Calculates scale alignments, least counts, zero errors, and accurate readouts.
 */

export const PRESET_OBJECTS = [
  { id: 'free', name: 'Free Exploration (No Object)', size: 0, color: 'transparent', shape: 'none' },
  { id: 'sphere', name: 'Steel Ball Bearing (Ø ~16.4 mm)', size: 16.4, color: '#94a3b8', shape: 'circle' },
  { id: 'cylinder', name: 'Brass Cylinder (Ø ~22.6 mm)', size: 22.6, color: '#f59e0b', shape: 'cylinder' },
  { id: 'glass_slab', name: 'Glass Plate Thickness (~8.7 mm)', size: 8.7, color: '#38bdf8', shape: 'slab' },
  { id: 'wire', name: 'Copper Wire (Ø ~1.85 mm)', size: 1.85, color: '#ea580c', shape: 'wire' },
  { id: 'coin', name: 'One Rupee Coin (Ø ~25.0 mm)', size: 25.0, color: '#cbd5e1', shape: 'coin' },
  { id: 'custom', name: 'Custom User Object', size: 12.0, color: '#6366f1', shape: 'custom' }
];

export class InstrumentModel {
  constructor() {
    this.mode = 'vernier'; // 'vernier' or 'screw_gauge'
    
    // --- Vernier Caliper Parameters ---
    this.vernier = {
      jawPosition: 0.0,       // in mm (0 to 120 mm)
      zeroError: 0.0,         // in mm (-0.5 to +0.5 mm)
      msd: 1.0,               // 1 mm
      numDivisions: 10,       // 10 divisions = 9 mm (LC = 0.1 mm) or 20 (LC = 0.05)
      maxRange: 120.0,        // 120 mm
    };

    // --- Screw Gauge Parameters ---
    this.screwGauge = {
      spindlePosition: 0.0,   // in mm (0 to 25 mm)
      zeroError: 0.0,         // in mm (-0.10 to +0.10 mm)
      pitch: 1.0,             // 1 mm per rotation (or 0.5 mm)
      divisions: 100,         // 100 circular divisions (LC = 0.01 mm)
      maxRange: 25.0,         // 25 mm
    };

    // Active object
    this.selectedObjectId = 'sphere';
    this.customSize = 12.0;

    // Measurement reading lock / clamp
    this.isClamped = false;
    this.magnifierActive = true;
    this.magnifierPos = { x: 0, y: 0 };
    
    // History log
    this.history = [];

    // Current quiz target
    this.quiz = null;
  }

  get currentObject() {
    const obj = PRESET_OBJECTS.find(o => o.id === this.selectedObjectId) || PRESET_OBJECTS[0];
    if (obj.id === 'custom') {
      return { ...obj, size: this.customSize };
    }
    return obj;
  }

  // Set active instrument mode
  setMode(mode) {
    if (mode === 'vernier' || mode === 'screw_gauge') {
      this.mode = mode;
      this.clampToObject();
    }
  }

  // Least count calculations
  getVernierLC() {
    return this.vernier.msd / this.vernier.numDivisions; // 1.0 / 10 = 0.1 mm
  }

  getScrewGaugeLC() {
    return this.screwGauge.pitch / this.screwGauge.divisions; // 1.0 / 100 = 0.01 mm
  }

  // Vernier analytical readings
  getVernierReadings() {
    const rawPos = this.vernier.jawPosition; // in mm
    const msd = this.vernier.msd;
    const lc = this.getVernierLC();
    const zeroError = this.vernier.zeroError;

    // Main scale reading: greatest integer multiple of msd <= rawPos
    const msr = Math.floor(rawPos / msd) * msd;
    
    // Remaining fractional distance
    const frac = rawPos - msr;
    
    // Vernier scale coincidence: div where (div * VSD) aligns with an MSD line
    // VSD = (numDivisions - 1) / numDivisions * MSD
    // Alignment occurs when (msr + k*MSD) ≈ rawPos + div*VSD
    // Simplifies to: div ≈ round(frac / LC)
    let vsr = Math.round(frac / lc);
    if (vsr >= this.vernier.numDivisions) {
      vsr = this.vernier.numDivisions - 1;
    }

    const uncorrectedTotal = msr + (vsr * lc);
    const correctedTotal = Math.max(0, uncorrectedTotal - zeroError);

    return {
      msr: parseFloat(msr.toFixed(2)),
      vsr: vsr,
      lc: lc,
      zeroError: parseFloat(zeroError.toFixed(2)),
      uncorrected: parseFloat(uncorrectedTotal.toFixed(2)),
      corrected: parseFloat(correctedTotal.toFixed(2)),
      fractionMm: parseFloat((vsr * lc).toFixed(2))
    };
  }

  // Screw Gauge analytical readings
  getScrewGaugeReadings() {
    const rawPos = this.screwGauge.spindlePosition; // in mm
    const pitch = this.screwGauge.pitch;
    const divs = this.screwGauge.divisions;
    const lc = this.getScrewGaugeLC();
    const zeroError = this.screwGauge.zeroError;

    // Pitch Scale Reading (linear sleeve mark visible)
    const psr = Math.floor(rawPos / pitch) * pitch;

    // Fractional advance within the current pitch
    const frac = rawPos - psr;
    let hsr = Math.round(frac / lc) % divs;

    const uncorrectedTotal = psr + (hsr * lc);
    const correctedTotal = Math.max(0, uncorrectedTotal - zeroError);

    return {
      psr: parseFloat(psr.toFixed(2)),
      hsr: hsr,
      lc: lc,
      zeroError: parseFloat(zeroError.toFixed(3)),
      uncorrected: parseFloat(uncorrectedTotal.toFixed(3)),
      corrected: parseFloat(correctedTotal.toFixed(3)),
      fractionMm: parseFloat((hsr * lc).toFixed(3))
    };
  }

  // Clamp jaws to the selected object's physical thickness
  clampToObject() {
    const obj = this.currentObject;
    if (obj.size > 0) {
      if (this.mode === 'vernier') {
        this.vernier.jawPosition = Math.min(this.vernier.maxRange, obj.size + this.vernier.zeroError);
      } else {
        this.screwGauge.spindlePosition = Math.min(this.screwGauge.maxRange, obj.size + this.screwGauge.zeroError);
      }
    }
  }

  // Set position directly (via slider or dragging)
  setPosition(value) {
    if (this.isClamped) return;
    if (this.mode === 'vernier') {
      this.vernier.jawPosition = Math.max(0, Math.min(this.vernier.maxRange, value));
    } else {
      this.screwGauge.spindlePosition = Math.max(0, Math.min(this.screwGauge.maxRange, value));
    }
  }

  // Step position by delta (fine adjustment)
  stepPosition(delta) {
    if (this.isClamped) return;
    if (this.mode === 'vernier') {
      this.setPosition(this.vernier.jawPosition + delta);
    } else {
      this.setPosition(this.screwGauge.spindlePosition + delta);
    }
  }

  // Set zero error
  setZeroError(val) {
    if (this.mode === 'vernier') {
      this.vernier.zeroError = val;
    } else {
      this.screwGauge.zeroError = val;
    }
  }

  // Save current observation to the lab log
  logObservation() {
    const time = new Date().toLocaleTimeString();
    if (this.mode === 'vernier') {
      const r = this.getVernierReadings();
      this.history.unshift({
        time,
        instrument: 'Vernier Caliper',
        object: this.currentObject.name,
        mainScale: `${r.msr} mm`,
        vernierDiv: `${r.vsr} div`,
        zeroError: `${r.zeroError >= 0 ? '+' : ''}${r.zeroError} mm`,
        total: `${r.corrected} mm (${(r.corrected / 10).toFixed(3)} cm)`
      });
    } else {
      const r = this.getScrewGaugeReadings();
      this.history.unshift({
        time,
        instrument: 'Screw Gauge',
        object: this.currentObject.name,
        mainScale: `${r.psr} mm`,
        vernierDiv: `${r.hsr} div`,
        zeroError: `${r.zeroError >= 0 ? '+' : ''}${r.zeroError} mm`,
        total: `${r.corrected} mm (${(r.corrected * 1000).toFixed(1)} µm)`
      });
    }
    if (this.history.length > 20) this.history.pop();
  }

  // Generate a random mystery practice challenge
  generateQuiz() {
    if (this.mode === 'vernier') {
      const randomTrue = +(Math.random() * 45 + 3).toFixed(1);
      const randomZero = +((Math.random() * 0.4 - 0.2).toFixed(1));
      this.vernier.zeroError = randomZero;
      this.vernier.jawPosition = +(randomTrue + randomZero).toFixed(1);
      const r = this.getVernierReadings();
      this.quiz = {
        instrument: 'vernier',
        targetReading: r.corrected,
        zeroError: randomZero,
        prompt: `Read the Vernier Caliper! What is the true corrected dimension in mm? (Zero Error: ${randomZero >= 0 ? '+' : ''}${randomZero} mm)`
      };
    } else {
      const randomTrue = +(Math.random() * 12 + 1.2).toFixed(2);
      const randomZero = +((Math.random() * 0.06 - 0.03).toFixed(3));
      this.screwGauge.zeroError = randomZero;
      this.screwGauge.spindlePosition = +(randomTrue + randomZero).toFixed(2);
      const r = this.getScrewGaugeReadings();
      this.quiz = {
        instrument: 'screw_gauge',
        targetReading: r.corrected,
        zeroError: randomZero,
        prompt: `Read the Micrometer Screw Gauge! What is the true corrected thickness in mm? (Zero Error: ${randomZero >= 0 ? '+' : ''}${randomZero} mm)`
      };
    }
    return this.quiz;
  }
}
