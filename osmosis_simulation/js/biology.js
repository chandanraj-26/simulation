/**
 * OsmosisLab — Osmosis, Water Potential & Plasmolysis Biology Engine
 * Quantitative biophysical calculations for solute potential (Ψs = -iCRT),
 * pressure potential (Ψp), plant cell turgor, RBC hemolysis, and U-tube osmometry.
 */

const Biology = {
  // Gas constant and standard temperature (298.15 K)
  R: 0.008314, // L·MPa / (mol·K)
  T: 298.15,

  // Specimen baselines
  specimens: {
    'plant': {
      name: 'Onion Epidermal Plant Cell',
      internalSolutePercent: 2.0, // ~2.0% cell sap
      wallWidth: 260,
      wallHeight: 180,
      description: 'Features a rigid cellulose cell wall, large central vacuole, and dynamic turgor pressure.'
    },
    'rbc': {
      name: 'Human Red Blood Cell (Erythrocyte)',
      internalSolutePercent: 0.9, // 0.9% physiological saline
      normalRadius: 65,
      description: 'Lacks a rigid cell wall; swells and lyses in hypotonic solutions, crenates in hypertonic solutions.'
    },
    'utube': {
      name: 'U-Tube Osmometer Apparatus',
      description: 'U-shaped glass tube with semi-permeable membrane demonstrating osmotic water head displacement.'
    },
    'aquaporin': {
      name: 'Molecular Aquaporin Membrane View',
      description: 'Microscopic lipid bilayer showing selective permeability: water passes through aquaporin pores while solute is blocked.'
    }
  },

  /**
   * Calculates Solute Potential: Ψs = -i·C·R·T (in MPa)
   * Approximated for sucrose/saline: Ψs ≈ -0.4 * (solutePercent / 1.0)
   */
  calculateSolutePotential(solutePercent) {
    return -0.40 * solutePercent;
  },

  /**
   * Classifies solution tonicity relative to cell internal solute
   */
  getTonicity(extPercent, intPercent) {
    const diff = extPercent - intPercent;
    if (Math.abs(diff) < 0.20) return 'isotonic';
    if (diff < 0) return 'hypotonic';
    return 'hypertonic';
  },

  /**
   * Computes plant cell equilibrium state
   * Returns: { protoplastVolumeRatio, turgorPressure, stateName, stateColor }
   */
  calculatePlantCellState(extPercent, currentVol) {
    const intPercent = 2.0;
    const tonicity = this.getTonicity(extPercent, intPercent);

    let targetVol = 1.0;
    let turgor = 0.0;
    let stateName = 'Flaccid (Isotonic)';
    let stateColor = '#0284c7';

    if (extPercent <= 0.3) {
      // Hypotonic pure water
      targetVol = 1.08;
      turgor = 0.82;
      stateName = 'Fully Turgid (Normal Plant State)';
      stateColor = '#15803d';
    } else if (extPercent < intPercent) {
      // Slightly hypotonic
      const frac = (intPercent - extPercent) / intPercent;
      targetVol = 1.0 + frac * 0.08;
      turgor = frac * 0.75;
      stateName = 'Turgid';
      stateColor = '#16a34a';
    } else if (Math.abs(extPercent - intPercent) <= 0.3) {
      // Isotonic
      targetVol = 1.0;
      turgor = 0.02;
      stateName = 'Flaccid (Incipient Plasmolysis)';
      stateColor = '#0284c7';
    } else {
      // Hypertonic (Plasmolysis)
      const shrinkFactor = Math.min(0.65, (extPercent - intPercent) * 0.075);
      targetVol = Math.max(0.38, 1.0 - shrinkFactor);
      turgor = 0.0;
      if (targetVol < 0.6) {
        stateName = 'Severe Plasmolysis';
        stateColor = '#ef4444';
      } else {
        stateName = 'Plasmolysed';
        stateColor = '#f97316';
      }
    }

    return {
      targetVol,
      turgor,
      stateName,
      stateColor,
      tonicity,
      psiS_ext: this.calculateSolutePotential(extPercent),
      psiS_int: this.calculateSolutePotential(intPercent)
    };
  },

  /**
   * Computes Animal Cell (RBC) state
   * Returns: { targetVol, isLysed, stateName, stateColor }
   */
  calculateRBCState(extPercent) {
    const intPercent = 0.9; // 0.9% physiological saline
    let targetVol = 1.0;
    let isLysed = false;
    let stateName = 'Normal Biconcave Disc (Isotonic)';
    let stateColor = '#0284c7';

    if (extPercent <= 0.20) {
      // Pure water or very dilute -> Cell bursts (Hemolysis)
      targetVol = 1.45;
      isLysed = true;
      stateName = 'Lysed / Hemolysis (Membrane Ruptured!)';
      stateColor = '#dc2626';
    } else if (extPercent < 0.70) {
      // Swollen spherical
      const swell = (0.9 - extPercent) * 0.55;
      targetVol = 1.0 + swell;
      stateName = 'Swollen Sphere (Hypotonic)';
      stateColor = '#16a34a';
    } else if (extPercent <= 1.10) {
      // Isotonic
      targetVol = 1.0;
      stateName = 'Normal Biconcave Disc (0.9% Saline)';
      stateColor = '#0284c7';
    } else {
      // Hypertonic -> Crenation
      const shrink = Math.min(0.55, (extPercent - 0.9) * 0.08);
      targetVol = Math.max(0.45, 1.0 - shrink);
      stateName = 'Crenated / Shriveled (Hypertonic)';
      stateColor = '#ea580c';
    }

    return {
      targetVol,
      isLysed,
      stateName,
      stateColor,
      tonicity: this.getTonicity(extPercent, intPercent),
      psiS_ext: this.calculateSolutePotential(extPercent),
      psiS_int: this.calculateSolutePotential(intPercent)
    };
  },

  /**
   * U-Tube Osmometer Height Difference
   * Left Arm vs Right Arm concentration
   */
  calculateUTubeHeightDiff(concLeft, concRight) {
    // Height difference in cm: 1% conc diff ≈ 3.5 cm liquid height
    const deltaC = concRight - concLeft;
    return deltaC * 3.6;
  }
};

window.Biology = Biology;
