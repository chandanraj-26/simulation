/**
 * AcidBaseLab — Chemistry & Equilibrium Engine
 * Mathematical models for acid-base equilibrium, Henderson-Hasselbalch,
 * multi-spline spectrophotometric indicator color calculation, and titration curves.
 */

const Chemistry = {
  // Constant Kw at 25 deg C
  Kw: 1.0e-14,

  // Substance Catalog: 14 real-world substances + Mystery solutions
  substances: {
    'hcl': {
      name: '0.1 M Hydrochloric Acid (HCl)',
      formula: 'HCl(aq)',
      category: 'Strong Acid',
      defaultPH: 1.0,
      description: 'Fully dissociated mineral acid found in gastric juices and industrial synthesis.',
      colorBase: 'rgba(235, 245, 255, 0.25)' // clear watery
    },
    'gastric': {
      name: 'Stomach Gastric Acid',
      formula: 'HCl + enzymes',
      category: 'Strong Acid',
      defaultPH: 1.5,
      description: 'Digestive fluid produced by parietal cells in the human stomach lining.',
      colorBase: 'rgba(250, 245, 220, 0.3)'
    },
    'lemon': {
      name: 'Fresh Lemon Juice',
      formula: 'C6H8O7 (Citric Acid)',
      category: 'Weak Acid',
      defaultPH: 2.2,
      description: 'Natural citrus fruit extract rich in citric and ascorbic acids.',
      colorBase: 'rgba(254, 240, 138, 0.45)' // slight pale yellow
    },
    'vinegar': {
      name: 'Distilled White Vinegar',
      formula: 'CH3COOH (Acetic Acid ~5%)',
      category: 'Weak Acid',
      defaultPH: 2.8,
      description: 'Fermented acetic acid solution widely used in household cooking and cleaning.',
      colorBase: 'rgba(245, 245, 240, 0.25)'
    },
    'soda': {
      name: 'Carbonated Soft Drink',
      formula: 'H2CO3 + H3PO4',
      category: 'Weak Acid',
      defaultPH: 3.2,
      description: 'Beverage acidified with dissolved carbonic acid and phosphoric acid.',
      colorBase: 'rgba(200, 160, 120, 0.4)'
    },
    'coffee': {
      name: 'Black Coffee',
      formula: 'Chlorogenic acids',
      category: 'Weak Acid',
      defaultPH: 5.0,
      description: 'Infusion of roasted coffee beans containing mild chlorogenic and quinic acids.',
      colorBase: 'rgba(180, 130, 90, 0.45)'
    },
    'milk': {
      name: "Cow's Fresh Milk",
      formula: 'Lactic acid + Casein',
      category: 'Weak Acid / Near Neutral',
      defaultPH: 6.6,
      description: 'Dairy emulsion containing lactose, proteins, and trace lactic acid.',
      colorBase: 'rgba(255, 255, 250, 0.6)'
    },
    'water': {
      name: 'Pure Distilled Water (H2O)',
      formula: 'H2O',
      category: 'Neutral',
      defaultPH: 7.0,
      description: 'Deionized neutral water with balanced autoionization [H+] = [OH-] = 10^-7 M.',
      colorBase: 'rgba(235, 248, 255, 0.25)'
    },
    'blood': {
      name: 'Human Blood / Saline',
      formula: 'HCO3^- / H2CO3 buffer',
      category: 'Slightly Alkaline Buffer',
      defaultPH: 7.4,
      description: 'Physiological blood plasma strictly buffered at pH 7.35–7.45 by carbonic acid-bicarbonate.',
      colorBase: 'rgba(254, 205, 211, 0.35)'
    },
    'baking_soda': {
      name: 'Baking Soda Solution',
      formula: 'NaHCO3(aq)',
      category: 'Weak Base',
      defaultPH: 8.5,
      description: 'Sodium bicarbonate solution, an amphiprotic salt that hydrolyzes to alkaline pH.',
      colorBase: 'rgba(240, 248, 255, 0.25)'
    },
    'magnesia': {
      name: 'Milk of Magnesia',
      formula: 'Mg(OH)2 suspension',
      category: 'Base / Antacid',
      defaultPH: 10.5,
      description: 'Magnesium hydroxide antacid suspension used to neutralize excess stomach acidity.',
      colorBase: 'rgba(248, 250, 252, 0.55)'
    },
    'ammonia': {
      name: 'Household Ammonia Cleaner',
      formula: 'NH3(aq) / NH4OH',
      category: 'Weak Base',
      defaultPH: 11.5,
      description: 'Aqueous ammonia solution used as a grease-cutting household cleaning agent.',
      colorBase: 'rgba(230, 245, 255, 0.25)'
    },
    'bleach': {
      name: 'Household Bleach',
      formula: 'NaClO(aq)',
      category: 'Strong Alkaline',
      defaultPH: 12.5,
      description: 'Sodium hypochlorite solution, strongly alkaline oxidizing disinfectant.',
      colorBase: 'rgba(245, 255, 235, 0.3)'
    },
    'naoh_01m': {
      name: '0.1 M Sodium Hydroxide (NaOH)',
      formula: 'NaOH(aq)',
      category: 'Strong Base',
      defaultPH: 13.0,
      description: 'Caustic soda solution, completely dissociated strong base [OH-] = 0.1 M.',
      colorBase: 'rgba(240, 250, 255, 0.25)'
    },
    'mystery_a': {
      name: 'Mystery Liquid A (Unknown pH)',
      formula: 'Unknown Analyte',
      category: 'Mystery Sample',
      defaultPH: 2.4, // Lemon/Vinegar range
      description: 'A transparent unknown solution for student lab detective testing.',
      colorBase: 'rgba(240, 245, 255, 0.25)',
      isMystery: true
    },
    'mystery_b': {
      name: 'Mystery Liquid B (Unknown pH)',
      formula: 'Unknown Analyte',
      category: 'Mystery Sample',
      defaultPH: 7.0, // Neutral pure water
      description: 'A transparent unknown solution for student lab detective testing.',
      colorBase: 'rgba(240, 245, 255, 0.25)',
      isMystery: true
    },
    'mystery_c': {
      name: 'Mystery Liquid C (Unknown pH)',
      formula: 'Unknown Analyte',
      category: 'Mystery Sample',
      defaultPH: 11.8, // Basic ammonia range
      description: 'A transparent unknown solution for student lab detective testing.',
      colorBase: 'rgba(240, 245, 255, 0.25)',
      isMystery: true
    }
  },

  // Comprehensive Catalog of 9 Indicators
  indicators: {
    'universal': {
      name: 'Universal Indicator',
      shortName: 'Universal',
      type: 'composite',
      pKa: 7.0,
      rangeLow: 1.0,
      rangeHigh: 13.0,
      description: 'A blend of thymol blue, methyl red, bromothymol blue, and phenolphthalein showing continuous spectral rainbow hues from pH 0 to 14.',
      acidColorHex: '#ef4444',
      baseColorHex: '#7c3aed',
      dropperBottleColor: '#10b981',
      // Multi-point spectrum interpolation points: [pH, [r, g, b]]
      spectrum: [
        [0.0, [220, 38, 38]],   // Deep Red
        [2.0, [239, 68, 68]],   // Crimson Red
        [4.0, [249, 115, 22]],  // Orange
        [5.5, [234, 179, 8]],   // Amber / Orange-Yellow
        [6.5, [132, 204, 22]],  // Yellow-Green
        [7.0, [34, 197, 94]],   // Pure Green (Neutral)
        [8.0, [20, 184, 166]],  // Teal / Cyan
        [9.5, [14, 165, 233]],  // Sky Blue
        [11.0, [59, 130, 246]], // Cobalt Blue
        [12.5, [124, 58, 237]], // Violet
        [14.0, [88, 28, 135]]   // Deep Purple
      ]
    },
    'phenolphthalein': {
      name: 'Phenolphthalein',
      shortName: 'Phenol.',
      type: 'single',
      pKa: 9.3,
      rangeLow: 8.2,
      rangeHigh: 10.0,
      description: 'Colorless in acidic and neutral solutions (pH < 8.2), transforming into vibrant magenta-pink (pH 8.2–10.0). Ideal for strong base titrations.',
      acidColor: [250, 250, 250, 0.05], // Virtually colorless
      baseColor: [225, 29, 72, 0.85],   // Vivid Magenta / Rose Pink
      acidColorHex: '#f1f5f9',
      baseColorHex: '#e11d48',
      dropperBottleColor: '#e11d48'
    },
    'bromothymol_blue': {
      name: 'Bromothymol Blue (BTB)',
      shortName: 'Bromothymol',
      type: 'single',
      pKa: 7.1,
      rangeLow: 6.0,
      rangeHigh: 7.6,
      description: 'Brilliant yellow in acid (pH < 6.0), crisp emerald green at neutral (pH 6.8–7.1), and intense royal blue in base (pH > 7.6).',
      acidColor: [250, 204, 21, 0.85],  // Canary Yellow
      baseColor: [29, 78, 216, 0.85],   // Royal Blue
      neutralColor: [16, 185, 129, 0.85],// Green
      acidColorHex: '#facc15',
      baseColorHex: '#1d4ed8',
      dropperBottleColor: '#2563eb'
    },
    'methyl_orange': {
      name: 'Methyl Orange',
      shortName: 'Methyl Org.',
      type: 'single',
      pKa: 3.4,
      rangeLow: 3.1,
      rangeHigh: 4.4,
      description: 'Red in strong acid (pH < 3.1), passing through a vivid orange intermediate, to bright yellow (pH > 4.4). Excellent for strong acid-weak base titrations.',
      acidColor: [220, 38, 38, 0.85],  // Red
      baseColor: [250, 204, 21, 0.85], // Yellow
      neutralColor: [249, 115, 22, 0.85], // Orange
      acidColorHex: '#dc2626',
      baseColorHex: '#facc15',
      dropperBottleColor: '#ea580c'
    },
    'litmus_solution': {
      name: 'Litmus Solution',
      shortName: 'Litmus Sol.',
      type: 'single',
      pKa: 6.5,
      rangeLow: 4.5,
      rangeHigh: 8.3,
      description: 'Extracted from lichens (Roccella tinctoria). Bright red in acid (pH < 4.5), purple at neutral (pH 7.0), and vibrant blue in alkaline (pH > 8.3).',
      acidColor: [239, 68, 68, 0.85],  // Red
      baseColor: [37, 99, 235, 0.85],  // Blue
      neutralColor: [147, 51, 234, 0.85], // Purple
      acidColorHex: '#ef4444',
      baseColorHex: '#2563eb',
      dropperBottleColor: '#7c3aed'
    },
    'red_cabbage': {
      name: 'Red Cabbage Extract (Anthocyanin)',
      shortName: 'Red Cabbage',
      type: 'composite',
      pKa: 7.0,
      rangeLow: 1.0,
      rangeHigh: 13.0,
      description: 'Natural anthocyanin extract exhibiting stunning wide-range chromatic transitions: Ruby Red (pH 1-2) -> Purple/Pink (pH 3-5) -> Violet-Blue (pH 6-7) -> Emerald Green (pH 8-9) -> Golden Yellow (pH 11-14).',
      acidColorHex: '#e11d48',
      baseColorHex: '#eab308',
      dropperBottleColor: '#9333ea',
      spectrum: [
        [1.0, [225, 29, 72]],   // Ruby Red (Flavylium cation)
        [2.5, [244, 63, 94]],   // Vivid Pink-Red
        [4.0, [192, 38, 211]],  // Purple / Violet-Pink
        [6.0, [99, 102, 241]],  // Violet-Blue (Neutral Quinonoidal)
        [7.0, [59, 130, 246]],  // Deep Blue
        [8.5, [16, 185, 129]],  // Emerald Green
        [10.0, [13, 148, 136]], // Dark Green
        [12.0, [234, 179, 8]],  // Golden Yellow (Chalcone)
        [14.0, [202, 138, 4]]   // Deep Yellow-Amber
      ]
    },
    'turmeric': {
      name: 'Turmeric Extract (Curcumin)',
      shortName: 'Turmeric',
      type: 'single',
      pKa: 8.0,
      rangeLow: 7.4,
      rangeHigh: 8.8,
      description: 'Everyday natural kitchen indicator! Remains bright sunshine yellow in acidic and neutral conditions, turning deep reddish-brown / blood-orange in basic solutions (soaps, baking soda, NaOH).',
      acidColor: [250, 204, 21, 0.85],  // Bright Yellow
      baseColor: [153, 27, 27, 0.85],   // Deep Reddish-Brown
      acidColorHex: '#facc15',
      baseColorHex: '#991b1b',
      dropperBottleColor: '#eab308'
    },
    'phenol_red': {
      name: 'Phenol Red',
      shortName: 'Phenol Red',
      type: 'single',
      pKa: 7.9,
      rangeLow: 6.8,
      rangeHigh: 8.2,
      description: 'Yellow in acid (pH < 6.8), passing through peach/orange, into intense red-pink (pH > 8.2). Commonly used in swimming pool testing and cell culture.',
      acidColor: [253, 224, 71, 0.85], // Yellow
      baseColor: [225, 29, 72, 0.85],  // Bright Red
      neutralColor: [249, 115, 22, 0.85], // Peach Orange
      acidColorHex: '#fde047',
      baseColorHex: '#e11d48',
      dropperBottleColor: '#f43f5e'
    },
    'thymol_blue': {
      name: 'Thymol Blue (Dual Range)',
      shortName: 'Thymol Blue',
      type: 'composite',
      pKa: 8.8,
      rangeLow: 1.2,
      rangeHigh: 9.6,
      description: 'Unique two-stage indicator: First transition (pH 1.2–2.8) from Red to Yellow; Second transition (pH 8.0–9.6) from Yellow to Blue.',
      acidColorHex: '#ef4444',
      baseColorHex: '#2563eb',
      dropperBottleColor: '#0284c7',
      spectrum: [
        [0.0, [220, 38, 38]],   // Red
        [1.2, [239, 68, 68]],   // Red
        [2.8, [250, 204, 21]],  // Yellow
        [7.0, [250, 204, 21]],  // Yellow
        [8.0, [132, 204, 22]],  // Yellow-Green
        [9.6, [37, 99, 235]],   // Brilliant Blue
        [14.0, [29, 78, 216]]   // Blue
      ]
    }
  },

  // Calculations for [H+] and [OH-]
  getHConc(pH) {
    return Math.pow(10, -pH);
  },

  getOHConc(pH) {
    return Math.pow(10, -(14.0 - pH));
  },

  getPOH(pH) {
    return 14.0 - pH;
  },

  formatExp(num) {
    if (num <= 0) return '0.00';
    const exp = Math.floor(Math.log10(num));
    const mantissa = num / Math.pow(10, exp);
    return `${mantissa.toFixed(2)} × 10^(${exp})`;
  },

  // Henderson-Hasselbalch Indicator Protonated Fraction:
  // [In-] / [HIn] = 10^(pH - pKa)
  // f_HIn = 1 / (1 + 10^(pH - pKa))
  // f_InMinus = 10^(pH - pKa) / (1 + 10^(pH - pKa))
  getIndicatorFractions(pH, pKa) {
    const ratio = Math.pow(10, pH - pKa);
    const fInMinus = ratio / (1.0 + ratio);
    const fHIn = 1.0 / (1.0 + ratio);
    return {
      fHIn: Math.max(0, Math.min(1, fHIn)),
      fInMinus: Math.max(0, Math.min(1, fInMinus)),
      ratio: ratio
    };
  },

  // Color calculation from pH and indicator
  getIndicatorColor(indicatorKey, pH) {
    const ind = this.indicators[indicatorKey] || this.indicators['universal'];

    // Composite multi-spectrum indicator (Universal, Red Cabbage, Thymol Blue)
    if (ind.type === 'composite' && ind.spectrum) {
      const spec = ind.spectrum;
      // Clamp pH
      const clampedPH = Math.max(0, Math.min(14, pH));

      // Find segment
      for (let i = 0; i < spec.length - 1; i++) {
        const [pH1, rgb1] = spec[i];
        const [pH2, rgb2] = spec[i + 1];

        if (clampedPH >= pH1 && clampedPH <= pH2) {
          const t = (clampedPH - pH1) / (pH2 - pH1);
          const r = Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * t);
          const g = Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * t);
          const b = Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * t);
          return { r, g, b, a: 0.82, hex: this.rgbToHex(r, g, b) };
        }
      }

      // Edge fallbacks
      const last = spec[spec.length - 1][1];
      return { r: last[0], g: last[1], b: last[2], a: 0.82, hex: this.rgbToHex(last[0], last[1], last[2]) };
    }

    // Single equilibrium indicator governed by Henderson-Hasselbalch
    const { fHIn, fInMinus } = this.getIndicatorFractions(pH, ind.pKa);
    const acid = ind.acidColor;
    const base = ind.baseColor;

    // Subtractive / transmissive optical blend
    const r = Math.round(acid[0] * fHIn + base[0] * fInMinus);
    const g = Math.round(acid[1] * fHIn + base[1] * fInMinus);
    const b = Math.round(acid[2] * fHIn + base[2] * fInMinus);
    const a = acid[3] * fHIn + base[3] * fInMinus;

    return {
      r,
      g,
      b,
      a: Math.max(0.2, a),
      hex: this.rgbToHex(r, g, b)
    };
  },

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, x)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  },

  // Litmus Paper Strip Reaction
  // Returns dipped color and status message
  testLitmusStrip(stripType, pH) {
    if (stripType === 'red_litmus') {
      // Red litmus stays red in acid (pH < 7) and neutral (pH ~ 7), turns blue in base (pH > 8.0)
      if (pH > 8.0) {
        return {
          paperColor: '#2563eb', // turns blue!
          description: 'Turns BLUE (Alkaline / Basic Solution)',
          isChange: true
        };
      } else {
        return {
          paperColor: '#ef4444', // stays red
          description: 'Remains RED (Acidic or Neutral Solution)',
          isChange: false
        };
      }
    } else if (stripType === 'blue_litmus') {
      // Blue litmus turns red in acid (pH < 6.0), stays blue in neutral / base
      if (pH < 6.0) {
        return {
          paperColor: '#ef4444', // turns red!
          description: 'Turns RED (Acidic Solution)',
          isChange: true
        };
      } else {
        return {
          paperColor: '#2563eb', // stays blue
          description: 'Remains BLUE (Neutral or Basic Solution)',
          isChange: false
        };
      }
    } else if (stripType === 'ph_paper') {
      // Universal pH indicator paper
      const colorObj = this.getIndicatorColor('universal', pH);
      return {
        paperColor: colorObj.hex,
        description: `Color matches pH ~${pH.toFixed(1)} on standard universal chart`,
        isChange: true
      };
    }

    return { paperColor: '#ffffff', description: 'Unknown Strip', isChange: false };
  },

  // =========================================================================
  // TITRATION EQUILIBRIUM SOLVER
  // =========================================================================

  /**
   * Calculates instantaneous pH during an acid-base titration.
   * @param {string} analyteType - 'strong_acid' (0.1M HCl) or 'weak_acid' (0.1M Acetic Acid)
   * @param {number} analyteVol - Volume of analyte in flask (mL, e.g. 25.0)
   * @param {number} analyteConc - Concentration of analyte (M, e.g. 0.1)
   * @param {number} titrantVolAdded - Volume of titrant added from burette (mL)
   * @param {number} titrantConc - Concentration of titrant NaOH (M, e.g. 0.1)
   */
  calcTitrationPH(analyteType, analyteVol, analyteConc, titrantVolAdded, titrantConc) {
    const Va = analyteVol; // mL
    const Ca = analyteConc; // M
    const Vb = Math.max(0, titrantVolAdded); // mL
    const Cb = titrantConc; // M
    const Vtotal = Va + Vb;

    // Equivalence volume
    const Veq = (Ca * Va) / Cb; // mL (25.0 mL when Ca = Cb = 0.1)

    // CASE 1: Strong Acid (0.1 M HCl) titrated with Strong Base (0.1 M NaOH)
    if (analyteType === 'strong_acid') {
      if (Vb < Veq) {
        // Excess H+
        const molesHRemaining = (Ca * Va - Cb * Vb) / 1000.0;
        const concH = molesHRemaining / (Vtotal / 1000.0);
        const pH = -Math.log10(Math.max(concH, 1e-14));
        return Math.max(1.0, Math.min(6.99, pH));
      } else if (Math.abs(Vb - Veq) < 0.001) {
        // Exact equivalence point
        return 7.00;
      } else {
        // Excess OH-
        const molesOHExcess = (Cb * Vb - Ca * Va) / 1000.0;
        const concOH = molesOHExcess / (Vtotal / 1000.0);
        const pOH = -Math.log10(Math.max(concOH, 1e-14));
        const pH = 14.0 - pOH;
        return Math.max(7.01, Math.min(13.5, pH));
      }
    }

    // CASE 2: Weak Acid (Acetic Acid, pKa = 4.76) titrated with Strong Base (NaOH)
    const pKa = 4.76;
    const Ka = Math.pow(10, -pKa);

    if (Vb <= 0.001) {
      // Initial un-titrated weak acid: [H+] = sqrt(Ka * Ca)
      const concH = Math.sqrt(Ka * Ca);
      return -Math.log10(concH); // ~2.88
    } else if (Vb < Veq) {
      // Buffer region: Henderson-Hasselbalch equation
      // pH = pKa + log([A-] / [HA]) = pKa + log(Vb / (Veq - Vb))
      const ratio = Vb / (Veq - Vb);
      const pH = pKa + Math.log10(ratio);
      return Math.max(2.88, Math.min(8.0, pH));
    } else if (Math.abs(Vb - Veq) < 0.02) {
      // Equivalence point: Hydrolysis of acetate ion CH3COO- + H2O <-> CH3COOH + OH-
      // Salt concentration Csalt = (Ca * Va) / Vtotal
      const Csalt = (Ca * Va) / Vtotal;
      const Kb = this.Kw / Ka;
      const concOH = Math.sqrt(Kb * Csalt);
      const pOH = -Math.log10(concOH);
      return 14.0 - pOH; // ~8.72
    } else {
      // Past equivalence point: Excess strong base dictates pH
      const molesOHExcess = (Cb * Vb - Ca * Va) / 1000.0;
      const concOH = molesOHExcess / (Vtotal / 1000.0);
      const pOH = -Math.log10(Math.max(concOH, 1e-14));
      return Math.max(8.75, Math.min(13.5, 14.0 - pOH));
    }
  },

  // Generates complete ideal titration curve data for plotting
  generateTitrationCurve(analyteType, analyteVol = 25.0, analyteConc = 0.1, titrantConc = 0.1) {
    const points = [];
    const maxV = 50.0; // 50 mL burette
    const step = 0.25;

    for (let v = 0; v <= maxV; v += step) {
      const pH = this.calcTitrationPH(analyteType, analyteVol, analyteConc, v, titrantConc);
      points.push({ volume: v, pH });
    }
    return points;
  }
};

window.Chemistry = Chemistry;
