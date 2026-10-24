/**
 * Electrolysis & Electroplating — Electrochemical Constants & Stoichiometry
 * Implements Faraday's laws of electrolysis, standard electrode potentials,
 * gas volume stoichiometry, and electroplating deposition kinetics.
 */

const ELECTROLYSIS_DATA = {
  FARADAY_CONSTANT: 96485.33, // Coulombs / mol e-
  MOLAR_GAS_VOLUME_STP: 24.45, // L/mol at 25°C, 1 atm (24,450 mL/mol)

  // 1. Water Splitting Mode (Hofmann Voltameter)
  waterSplitting: {
    title: 'Electrolysis of Acidified Water (Hofmann Voltameter)',
    electrolyte: 'Dilute Sulfuric Acid (0.1 M H₂SO₄ in pure H₂O)',
    cathodeReaction: '2H⁺ (aq) + 2e⁻ → H₂ (g) [Reduction / Cathode]',
    anodeReaction: '2H₂O (l) → O₂ (g) + 4H⁺ (aq) + 4e⁻ [Oxidation / Anode]',
    overallReaction: '2H₂O (l) → 2H₂ (g) + O₂ (g)',
    stoichiometryRatio: '2 : 1 (H₂ : O₂)',
    minDecompositionVoltage: 1.23, // Volts theoretical (practical overpotential ~1.8V)
    hydrogenGasMolarMass: 2.016, // g/mol
    oxygenGasMolarMass: 31.998 // g/mol
  },

  // 2. Copper Electroplating Mode
  electroplating: {
    title: 'Copper Electroplating of an Iron Key',
    electrolyte: 'Copper(II) Sulfate Solution (0.5 M CuSO₄ with dilute H₂SO₄)',
    anode: 'Pure Copper Plate (Cu → Cu²⁺ + 2e⁻)',
    cathode: 'Iron Key (Cu²⁺ + 2e⁻ → Cu deposited)',
    copperMolarMass: 63.546, // g/mol
    electronsTransferred: 2, // n = 2 for Cu²⁺
    initialKeyMassG: 12.450 // Initial tare mass of the key
  },

  // Gas Identification Tests
  splintTests: {
    hydrogen: {
      result: 'pop',
      name: 'Squeaky Pop Test',
      desc: 'Hydrogen gas explodes with a characteristic high-pitched squeaky "POP" and pale blue flash: 2H₂ + O₂ → 2H₂O'
    },
    oxygen: {
      result: 'relight',
      name: 'Glowing Splint Relight',
      desc: 'Oxygen supports vigorous combustion, causing a glowing wooden ember to reignite and burst into bright yellow flame.'
    }
  }
};

window.ELECTROLYSIS_DATA = ELECTROLYSIS_DATA;
