/**
 * PHModel - Thermodynamic equilibrium and ionic balance model
 * Solves the quadratic self-ionization of water under dilution:
 *   [H+] * [OH-] = Kw = 1.0e-14
 *   pH = -log10([H+]), pOH = -log10([OH-])
 */

export const SOLUTIONS = [
  { id: 'battery_acid', name: 'Battery Acid (H₂SO₄)', basePH: 0.70, type: 'strong_acid' },
  { id: 'gastric_juice', name: 'Stomach Acid / Gastric Juice', basePH: 1.50, type: 'acid' },
  { id: 'lemon_juice', name: 'Fresh Lemon Juice', basePH: 2.30, type: 'acid' },
  { id: 'vinegar', name: 'Household Vinegar (5% CH₃COOH)', basePH: 2.80, type: 'acid' },
  { id: 'tomato_juice', name: 'Tomato Juice', basePH: 4.10, type: 'weak_acid' },
  { id: 'black_coffee', name: 'Black Coffee', basePH: 5.00, type: 'weak_acid' },
  { id: 'pure_water', name: 'Pure Distilled Water (25°C)', basePH: 7.00, type: 'neutral' },
  { id: 'human_blood', name: 'Human Blood Plasma', basePH: 7.40, type: 'weak_base' },
  { id: 'baking_soda', name: 'Baking Soda Solution (NaHCO₃)', basePH: 8.40, type: 'weak_base' },
  { id: 'milk_magnesia', name: 'Milk of Magnesia (Mg(OH)₂)', basePH: 10.50, type: 'base' },
  { id: 'household_ammonia', name: 'Household Ammonia Cleaner (NH₃)', basePH: 11.50, type: 'base' },
  { id: 'bleach', name: 'Chlorine Bleach (NaOCl)', basePH: 12.50, type: 'strong_base' },
  { id: 'drain_cleaner', name: 'Drain Cleaner (1.0 M NaOH)', basePH: 13.50, type: 'strong_base' }
];

export class PHModel {
  constructor() {
    this.selectedSolutionId = 'lemon_juice';
    this.volume = 0.50;      // Current liquid volume in Liters (0.1 to 1.0 L)
    this.soluteVolume = 0.50;// Initial solute volume in Liters
    this.maxVolume = 1.00;   // 1.0 Liter beaker capacity

    // Submerged sensor probe state
    this.probePos = { x: 340, y: 220 }; // probe tip coordinates in canvas
    this.isProbeSubmerged = true;

    // Microscopic particle view toggle
    this.showParticles = true;

    // History
    this.history = [];
    this.quiz = null;
  }

  get currentSolution() {
    return SOLUTIONS.find(s => s.id === this.selectedSolutionId) || SOLUTIONS[2];
  }

  // Calculate analytical pH, pOH, and ion concentrations
  getAnalysis() {
    const sol = this.currentSolution;
    const Kw = 1.0e-14;

    // Initial ion concentrations in the undiluted solute
    const h0 = Math.pow(10, -sol.basePH);
    const oh0 = Kw / h0;

    // Net excess moles of H+ (positive if acidic, negative if basic)
    const netMolesExcess = (h0 - oh0) * this.soluteVolume;

    // Concentration difference in the diluted mixture
    const deltaC = netMolesExcess / this.volume;

    // Solve [H+]^2 - deltaC * [H+] - Kw = 0
    const hConc = (deltaC + Math.sqrt(deltaC * deltaC + 4 * Kw)) / 2;
    const ohConc = Kw / hConc;

    const currentPH = -Math.log10(hConc);
    const currentPOH = -Math.log10(ohConc);

    // Classification
    let classification = 'Neutral';
    if (currentPH < 6.8) {
      classification = currentPH < 3.0 ? 'Strongly Acidic' : 'Weakly Acidic';
    } else if (currentPH > 7.2) {
      classification = currentPH > 11.0 ? 'Strongly Basic / Alkaline' : 'Weakly Basic';
    }

    return {
      name: sol.name,
      pH: parseFloat(currentPH.toFixed(2)),
      pOH: parseFloat(currentPOH.toFixed(2)),
      hConc: hConc,
      ohConc: ohConc,
      hFormatted: hConc < 1e-3 ? hConc.toExponential(2) : hConc.toFixed(4),
      ohFormatted: ohConc < 1e-3 ? ohConc.toExponential(2) : ohConc.toFixed(4),
      volume: parseFloat(this.volume.toFixed(2)),
      soluteVolume: parseFloat(this.soluteVolume.toFixed(2)),
      classification,
      color: this.getIndicatorColor(currentPH)
    };
  }

  // Map pH (0 to 14) to continuous Universal Indicator RGB color
  getIndicatorColor(pH) {
    const clamped = Math.max(0, Math.min(14, pH));
    // Color stops for universal indicator
    const stops = [
      { ph: 0, r: 220, g: 38, b: 38 },   // Deep Red
      { ph: 2, r: 234, g: 88, b: 12 },   // Red-Orange
      { ph: 4, r: 249, g: 115, b: 22 },  // Orange
      { ph: 6, r: 234, g: 179, b: 8 },   // Yellow
      { ph: 7, r: 22, g: 163, b: 74 },   // Neutral Green
      { ph: 8, r: 13, g: 148, b: 136 },  // Teal/Cyan
      { ph: 10, r: 37, g: 99, b: 235 },  // Blue
      { ph: 12, r: 124, g: 58, b: 237 }, // Indigo/Violet
      { ph: 14, r: 147, g: 51, b: 234 }  // Deep Purple
    ];

    let lower = stops[0];
    let upper = stops[stops.length - 1];

    for (let i = 0; i < stops.length - 1; i++) {
      if (clamped >= stops[i].ph && clamped <= stops[i + 1].ph) {
        lower = stops[i];
        upper = stops[i + 1];
        break;
      }
    }

    const t = (clamped - lower.ph) / (upper.ph - lower.ph);
    const r = Math.round(lower.r + t * (upper.r - lower.r));
    const g = Math.round(lower.g + t * (upper.g - lower.g));
    const b = Math.round(lower.b + t * (upper.b - lower.b));

    return `rgb(${r}, ${g}, ${b})`;
  }

  // Add water to dilute
  addWater(amount) {
    const newVol = Math.min(this.maxVolume, this.volume + amount);
    this.volume = parseFloat(newVol.toFixed(3));
  }

  // Drain liquid from beaker
  drainLiquid(amount) {
    if (this.volume <= 0.1) return;
    const ratio = (this.volume - amount) / this.volume;
    this.soluteVolume = Math.max(0.02, parseFloat((this.soluteVolume * ratio).toFixed(3)));
    this.volume = Math.max(0.1, parseFloat((this.volume - amount).toFixed(3)));
  }

  // Change solution
  selectSolution(id) {
    this.selectedSolutionId = id;
    this.volume = 0.50;
    this.soluteVolume = 0.50;
  }

  logObservation() {
    const time = new Date().toLocaleTimeString();
    const a = this.getAnalysis();
    this.history.unshift({
      time,
      solute: a.name,
      volume: `${a.volume} L`,
      pH: a.pH.toFixed(2),
      pOH: a.pOH.toFixed(2),
      hConc: `${a.hFormatted} M`,
      classification: a.classification
    });
    if (this.history.length > 20) this.history.pop();
  }

  generateQuiz() {
    // Pick random solution and random dilution
    const sol = SOLUTIONS[Math.floor(Math.random() * SOLUTIONS.length)];
    this.selectSolution(sol.id);
    this.volume = +(Math.random() * 0.4 + 0.4).toFixed(2);
    this.soluteVolume = +(Math.random() * 0.2 + 0.2).toFixed(2);

    const a = this.getAnalysis();
    this.quiz = {
      targetPH: a.pH,
      targetH: a.hConc,
      prompt: `Analyze the mystery solution in the beaker! Using the submerged pH sensor or color spectrum, determine the exact pH and state whether it is Acidic, Basic, or Neutral.`
    };
    return this.quiz;
  }
}
