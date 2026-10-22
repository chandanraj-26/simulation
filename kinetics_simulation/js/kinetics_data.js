/**
 * Reaction Kinetics — Chemical Constants & Mathematical Models
 * Implements empirical rate laws, Arrhenius activation energy equations,
 * and colloidal sulfur turbidity optical scattering models.
 */

const KINETICS_DATA = {
  reactionName: 'Sodium Thiosulfate & Hydrochloric Acid Cross Disappearance',
  equation: 'Na₂S₂O₃ (aq) + 2HCl (aq) → 2NaCl (aq) + SO₂ (g) + S (colloidal yellow s) + H₂O (l)',
  ionicEquation: 'S₂O₃²⁻ (aq) + 2H⁺ (aq) → SO₂ (g) + S (s) + H₂O (l)',

  // Arrhenius Kinetics Parameters
  // Rate = k * [Na2S2O3]^1.0 * [HCl]^0.0
  // k(T) = A * exp(-Ea / (R * T))
  R_GAS_CONSTANT: 8.314, // J/(mol * K)
  ACTIVATION_ENERGY: 52000, // 52.0 kJ/mol typical empirical Ea
  PRE_EXPONENTIAL_A: 1.45e8, // Frequency factor A

  // Standard Lab Reagent Stocks
  stockThiosulfate: {
    name: 'Sodium Thiosulfate (Na₂S₂O₃)',
    stockMolarity: 0.20, // mol/L
    minConc: 0.02,
    maxConc: 0.20,
    defaultConc: 0.10
  },
  stockHCl: {
    name: 'Hydrochloric Acid (HCl)',
    stockMolarity: 2.0, // mol/L
    minConc: 0.5,
    maxConc: 2.0,
    defaultConc: 1.0
  },

  // Optical Transmission & Opacity Constants
  CRITICAL_OPACITY_THRESHOLD: 0.92, // Optical extinction point where black cross vanishes (8% transmission)

  // Guided Educational Presets
  presets: [
    {
      id: 'conc-series',
      name: 'Concentration Series (Isothermal 25°C)',
      tempC: 25,
      thiosulfateM: 0.16,
      hclM: 1.0,
      notes: 'Investigates order of reaction with respect to [Na₂S₂O₃].'
    },
    {
      id: 'temp-series',
      name: 'Temperature Series (Fixed 0.10 M)',
      tempC: 45,
      thiosulfateM: 0.10,
      hclM: 1.0,
      notes: 'Investigates temperature acceleration and determines Arrhenius Ea.'
    },
    {
      id: 'cold-reaction',
      name: 'Ice-Bath Chilled (12°C)',
      tempC: 12,
      thiosulfateM: 0.08,
      hclM: 1.0,
      notes: 'Demonstrates low-temperature kinetic arrest and slow sulfur nucleation.'
    }
  ]
};

window.KINETICS_DATA = KINETICS_DATA;
