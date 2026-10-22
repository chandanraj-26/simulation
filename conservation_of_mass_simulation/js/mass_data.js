/**
 * Law of Conservation of Mass — Chemical Systems & Stoichiometric Database
 * Class 9 NCERT Activity 3.1 & 3.2: Antoine Lavoisier (1789)
 * "Mass can neither be created nor destroyed in a chemical reaction."
 */

const MASS_DATA = {
  tareWeights: {
    conicalFlask: 112.500, // grams (empty 250 mL Pyrex flask)
    ignitionTube: 14.250,  // grams (small glass test tube)
    rubberCork: 18.350,    // grams
    thread: 0.120          // grams
  },

  systems: {
    barium_sodium: {
      id: 'barium_sodium',
      name: 'Barium Chloride + Sodium Sulfate (Precipitation)',
      ncertRef: 'NCERT Class 9 Activity 3.1 (Set X & Y)',
      solutionFlask: {
        name: 'Sodium Sulfate Solution',
        formula: 'Na₂SO₄ (aq)',
        volumeML: 40.0,
        massG: 41.200,
        color: 'rgba(235, 248, 255, 0.45)' // Clear colorless
      },
      solutionTube: {
        name: 'Barium Chloride Solution',
        formula: 'BaCl₂ (aq)',
        volumeML: 10.0,
        massG: 10.850,
        color: 'rgba(235, 248, 255, 0.45)' // Clear colorless
      },
      equation: 'BaCl₂ (aq) + Na₂SO₄ (aq) → BaSO₄ (s)↓ + 2NaCl (aq)',
      precipitateName: 'Barium Sulfate (Dense White Precipitate)',
      precipitateColor: 'rgba(255, 255, 255, 0.95)',
      gasEvolved: false,
      atoms: {
        Ba: { reactant: 1, product: 1 },
        Cl: { reactant: 2, product: 2 },
        Na: { reactant: 2, product: 2 },
        S:  { reactant: 1, product: 1 },
        O:  { reactant: 4, product: 4 }
      },
      explanation: 'Double displacement precipitation reaction. White insoluble barium sulfate settles down while sodium chloride stays in solution. Total mass is strictly conserved.'
    },

    lead_potassium: {
      id: 'lead_potassium',
      name: 'Lead Nitrate + Potassium Iodide (Golden Rain)',
      ncertRef: 'NCERT Class 10 Chapter 1 / Class 9 Activity 3.1',
      solutionFlask: {
        name: 'Potassium Iodide Solution',
        formula: '2KI (aq)',
        volumeML: 40.0,
        massG: 41.500,
        color: 'rgba(240, 249, 255, 0.40)'
      },
      solutionTube: {
        name: 'Lead Nitrate Solution',
        formula: 'Pb(NO₃)₂ (aq)',
        volumeML: 10.0,
        massG: 11.200,
        color: 'rgba(240, 249, 255, 0.40)'
      },
      equation: 'Pb(NO₃)₂ (aq) + 2KI (aq) → PbI₂ (s)↓ + 2KNO₃ (aq)',
      precipitateName: 'Lead(II) Iodide (Brilliant Canary Yellow Precipitate)',
      precipitateColor: 'rgba(250, 204, 21, 0.95)',
      gasEvolved: false,
      atoms: {
        Pb: { reactant: 1, product: 1 },
        N:  { reactant: 2, product: 2 },
        O:  { reactant: 6, product: 6 },
        K:  { reactant: 2, product: 2 },
        I:  { reactant: 2, product: 2 }
      },
      explanation: 'Spectacular yellow precipitation of lead iodide. Mass before mixing equals mass after mixing down to the milligram.'
    },

    calcium_acid: {
      id: 'calcium_acid',
      name: 'Calcium Carbonate + Hydrochloric Acid (Gas Evolution)',
      ncertRef: 'NCERT Closed vs. Open Flask Investigation',
      solutionFlask: {
        name: 'Dilute Hydrochloric Acid',
        formula: '2HCl (aq)',
        volumeML: 40.0,
        massG: 40.800,
        color: 'rgba(235, 248, 255, 0.35)'
      },
      solutionTube: {
        name: 'Calcium Carbonate Chips',
        formula: 'CaCO₃ (s)',
        volumeML: 5.0,
        massG: 5.000,
        color: '#E2E8F0'
      },
      equation: 'CaCO₃ (s) + 2HCl (aq) → CaCl₂ (aq) + H₂O (l) + CO₂ (g)↑',
      precipitateName: 'Effervescent Carbon Dioxide Gas Evolution',
      precipitateColor: 'rgba(200, 230, 255, 0.20)',
      gasEvolved: true,
      gasMassG: 0.440, // Mass of CO2 evolved from 1 g CaCO3
      atoms: {
        Ca: { reactant: 1, product: 1 },
        C:  { reactant: 1, product: 1 },
        O:  { reactant: 3, product: 3 },
        H:  { reactant: 2, product: 2 },
        Cl: { reactant: 2, product: 2 }
      },
      explanation: 'When sealed with a rubber cork, CO₂ gas cannot escape and total mass remains strictly constant. If uncorked, the escaped gas causes a visible mass drop on the balance.'
    }
  }
};

window.MASS_DATA = MASS_DATA;
