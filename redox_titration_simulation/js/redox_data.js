/**
 * Redox Chemistry & Permanganometry Constants
 * NCERT Class 11 Chapter 8 & Class 12 Electrochemistry Practical
 */

export const ANALYTES = {
  mohrs_salt: {
    id: 'mohrs_salt',
    name: "Mohr's Salt [FeSO4·(NH4)2SO4·6H2O]",
    analyteMolecule: "Fe²⁺ (Ferrous ion)",
    molarity: 0.05, // M (or N/20)
    pipetteVolumeMl: 20.0,
    stoichiometryRatio: 5, // 5 moles Fe2+ per 1 mole MnO4-
    needsHeating: false,
    recommendedTempC: 25,
    equation: "5Fe²⁺ + MnO₄⁻ + 8H⁺ → 5Fe³⁺ + Mn²⁺ + 4H₂O",
    standardPotentialVolts: 0.77, // Fe3+/Fe2+ E0 = +0.77V
    description: "Primary standard ferrous ammonium sulfate. Fast room-temperature redox kinetics."
  },
  oxalic_acid: {
    id: 'oxalic_acid',
    name: "Oxalic Acid [(COOH)2·2H2O]",
    analyteMolecule: "C2O4²⁻ (Oxalate ion)",
    molarity: 0.05, // M (or N/10)
    pipetteVolumeMl: 20.0,
    stoichiometryRatio: 2.5, // 5 moles C2O4(2-) per 2 moles MnO4- (ratio = 2.5)
    needsHeating: true,
    recommendedTempC: 65,
    equation: "5C₂O₄²⁻ + 2MnO₄⁻ + 16H⁺ → 10CO₂↑ + 2Mn²⁺ + 8H₂O",
    standardPotentialVolts: -0.49, // CO2 / C2O4(2-)
    description: "Requires warming to 60–70°C. Autocatalyzed by produced Mn²⁺ ions."
  }
};

export const TITRANT = {
  name: "Potassium Permanganate (KMnO₄)",
  molarity: 0.02, // 0.02 M standard solution
  color: "#4a0e4e", // Deep imperial purple
  colorRgba: "rgba(74, 14, 78, 0.95)",
  standardPotentialVolts: 1.51 // MnO4-/Mn2+ E0 = +1.51V
};
