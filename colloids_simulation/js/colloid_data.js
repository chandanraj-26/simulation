/**
 * Colloidal Sols & Hardy-Schulze Coagulation Data
 */

export const SOLS = {
  ferric_hydroxide: {
    id: 'ferric_hydroxide',
    name: 'Ferric Hydroxide Sol [Fe(OH)₃]',
    charge: 'Positive (+)',
    type: 'Lyophobic',
    solColor: 'rgba(185, 28, 28, 0.85)', // Wine red
    activeElectrolytes: [
      { name: 'NaCl (z = 1)', anion: 'Cl⁻', valency: 1, flocculationValue: 100.0, powerRatio: 1 },
      { name: 'Na₂SO₄ (z = 2)', anion: 'SO₄²⁻', valency: 2, flocculationValue: 2.2, powerRatio: 45 },
      { name: 'K₃[Fe(CN)₆] (z = 3)', anion: '[Fe(CN)₆]³⁻', valency: 3, flocculationValue: 0.25, powerRatio: 400 },
      { name: 'K₄[Fe(CN)₆] (z = 4)', anion: '[Fe(CN)₆]⁴⁻', valency: 4, flocculationValue: 0.05, powerRatio: 2000 }
    ]
  },
  starch: {
    id: 'starch',
    name: 'Starch Sol (Amylose / Amylopectin)',
    charge: 'Negative (-)',
    type: 'Lyophilic',
    solColor: 'rgba(241, 245, 249, 0.75)', // Opalescent translucent white
    activeElectrolytes: [
      { name: 'NaCl (z = 1)', cation: 'Na⁺', valency: 1, flocculationValue: 50.0, powerRatio: 1 },
      { name: 'BaCl₂ (z = 2)', cation: 'Ba²⁺', valency: 2, flocculationValue: 0.7, powerRatio: 70 },
      { name: 'AlCl₃ (z = 3)', cation: 'Al³⁺', valency: 3, flocculationValue: 0.09, powerRatio: 550 }
    ]
  }
};
