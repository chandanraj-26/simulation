/**
 * Thermal Decomposition of Ferrous Sulfate Crystals — Scientific Data & Thermodynamics
 * NCERT Class 10 Chemistry Chapter 1: Chemical Reactions and Equations (Activity 1.5)
 * Analytical molar masses, enthalpy thresholds, color progressions, and chemical tests.
 */

const REACTION_DATA = {
  compounds: {
    heptahydrate: {
      formula: 'FeSO₄·7H₂O',
      name: 'Ferrous Sulfate Heptahydrate (Green Vitriol)',
      molarMass: 278.01, // g/mol
      state: 'Monoclinic crystalline solid',
      color: '#4ADE80', // Pale green
      crystalColorHex: 'rgba(74, 222, 128, 0.95)',
      description: 'Lustrous pale green hydrated crystals containing 7 molecules of water of crystallization per formula unit.'
    },
    anhydrous: {
      formula: 'FeSO₄',
      name: 'Anhydrous Ferrous Sulfate',
      molarMass: 151.91, // g/mol
      state: 'Amorphous dirty white powder',
      color: '#E2E8F0', // Dirty white
      crystalColorHex: 'rgba(226, 232, 240, 0.95)',
      description: 'Dirty white / grayish anhydrous powder formed upon complete loss of water of crystallization.'
    },
    ferricOxide: {
      formula: 'Fe₂O₃',
      name: 'Ferric Oxide (Iron(III) Oxide)',
      molarMass: 159.69, // g/mol
      state: 'Reddish-brown solid residue',
      color: '#7F1D1D', // Deep reddish brown
      crystalColorHex: 'rgba(127, 29, 29, 0.95)',
      description: 'Non-volatile reddish-brown solid residue remaining in the boiling tube after strong thermal decomposition.'
    },
    waterVapor: {
      formula: 'H₂O(g)',
      name: 'Water Vapor / Steam',
      molarMass: 18.015,
      condensationPoint: 100 // °C
    },
    sulfurDioxide: {
      formula: 'SO₂(g)',
      name: 'Sulfur Dioxide Gas',
      molarMass: 64.066,
      nature: 'Acidic, colorless, pungent suffocating odor of burning sulfur, reducing agent.'
    },
    sulfurTrioxide: {
      formula: 'SO₃(g)',
      name: 'Sulfur Trioxide Gas',
      molarMass: 80.063,
      nature: 'Acidic, fuming white vapor, strong dehydrating and oxidizing properties.'
    }
  },

  // Reaction stages by temperature threshold (°C)
  stages: [
    {
      id: 'unheated',
      minTemp: 25,
      maxTemp: 100,
      title: 'Initial Ambient State',
      solid: 'FeSO₄·7H₂O (Pale Green Crystals)',
      solidColor: '#4ADE80',
      reactionEquation: 'No reaction (Ambient equilibrium)',
      observations: 'Pale green crystals resting dry inside the boiling tube.'
    },
    {
      id: 'dehydration',
      minTemp: 100,
      maxTemp: 350,
      title: 'Stage 1: Dehydration (Loss of Water of Crystallization)',
      solid: 'FeSO₄·7H₂O → FeSO₄ + 7H₂O↑',
      solidColor: '#CBD5E1', // Dirty white
      reactionEquation: 'FeSO₄·7H₂O(s) ⟶ FeSO₄(s) + 7H₂O(g)',
      observations: 'Crystals lose their green color and turn dirty white. Droplets of condensed water form on the cooler upper walls of the tube.'
    },
    {
      id: 'decomposition',
      minTemp: 350,
      maxTemp: 650,
      title: 'Stage 2: Strong Thermal Decomposition',
      solid: '2FeSO₄(s) ⟶ Fe₂O₃(s) + SO₂(g) + SO₃(g)',
      solidColor: '#7F1D1D', // Reddish brown
      reactionEquation: '2FeSO₄(s) ⟶ Fe₂O₃(s) + SO₂(g) + SO₃(g)',
      observations: 'Dirty white powder decomposes into a reddish-brown residue (Fe₂O₃). Pungent, choking sulfurous gases (SO₂ & SO₃) evolve rapidly.'
    }
  ],

  // Chemical tests for evolving gases
  chemicalTests: {
    litmus: {
      name: 'Moist Blue Litmus Paper',
      initialColor: '#3B82F6',
      activeColor: '#EF4444',
      result: 'Turns from Blue to Red rapidly due to acidic sulfur dioxide and sulfur trioxide gases (forming sulfurous acid H₂SO₃ & sulfuric acid H₂SO₄ with moisture).'
    },
    dichromate: {
      name: 'Acidified K₂Cr₂O₇ Paper Strip',
      initialColor: '#F97316', // Orange
      activeColor: '#16A34A', // Green
      result: 'Turns from Orange to Green due to reduction of Cr₂O₇²⁻ (orange) to Cr³⁺ (green) by reducing SO₂ gas: K₂Cr₂O₇ + H₂SO₄ + 3SO₂ → K₂SO₄ + Cr₂(SO₄)₃ + H₂O.'
    }
  },

  // Stoichiometry calculation helper (for starting mass m0 in grams)
  calculateMassBalance(initialMassGrams = 2.000) {
    const M_hept = 278.01;
    const moles = initialMassGrams / M_hept;

    const massWater = moles * 7 * 18.015; // 7 H2O
    const massResidueFe2O3 = (moles / 2) * 159.69; // 0.5 Fe2O3
    const massSO2 = moles * 64.066;
    const massSO3 = moles * 80.063;
    const massGases = massSO2 + massSO3;

    return {
      initialMass: initialMassGrams,
      waterVapor: massWater,
      fe2o3Residue: massResidueFe2O3,
      so2Gas: massSO2,
      so3Gas: massSO3,
      totalGases: massWater + massGases
    };
  }
};

window.REACTION_DATA = REACTION_DATA;
