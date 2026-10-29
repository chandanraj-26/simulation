/**
 * spectro_data.js
 * Solute parameters, lambda max wavelengths, and molar absorptivities.
 */

export const SOLUTES = [
  {
    id: 'kmno4',
    name: 'Potassium Permanganate (KMnO₄)',
    solutionColor: '#A855F7', // Purple
    lambdaMaxNm: 525, // Green light absorbed
    molarAbsorptivity: 2200,
    concentrationRange: [0.0001, 0.001], // Molar
    defaultConc: 0.0005,
    unit: 'mM'
  },
  {
    id: 'cuso4',
    name: 'Copper Sulfate (CuSO₄)',
    solutionColor: '#38BDF8', // Sky Blue
    lambdaMaxNm: 630, // Orange-red light absorbed
    molarAbsorptivity: 12.0,
    concentrationRange: [0.01, 0.20], // Molar
    defaultConc: 0.08,
    unit: 'M'
  },
  {
    id: 'k2cr2o7',
    name: 'Potassium Dichromate (K₂Cr₂O₇)',
    solutionColor: '#F97316', // Orange
    lambdaMaxNm: 450, // Blue-violet light absorbed
    molarAbsorptivity: 350.0,
    concentrationRange: [0.0005, 0.005], // Molar
    defaultConc: 0.0025,
    unit: 'mM'
  }
];

export const CUVETTE_PATHS = [
  { id: 0.5, label: '0.5 cm Micro-Cuvette', pathCm: 0.5 },
  { id: 1.0, label: '1.0 cm Standard Quartz Cuvette', pathCm: 1.0 },
  { id: 2.0, label: '2.0 cm Extended Optical Cell', pathCm: 2.0 }
];
