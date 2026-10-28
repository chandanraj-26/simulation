/**
 * rusting_data.js
 * Test tube conditions, environmental parameters, and electrochemical potentials.
 */

export const TUBES_CONFIG = [
  {
    id: 'tubeA',
    label: 'Tube A: Normal Air + Water',
    description: 'Nail partially submerged in ordinary tap water exposed to atmospheric air.',
    hasAir: true,
    hasWater: true,
    hasSalt: false,
    hasDesiccant: false,
    hasOilSeal: false,
    rustRate: 1.0, // Baseline normal rusting
    liquidColor: 'rgba(219, 234, 254, 0.45)', // Pale blue-tint water
    liquidHeightRatio: 0.55
  },
  {
    id: 'tubeB',
    label: 'Tube B: Boiled Water + Oil Seal',
    description: 'Distilled water boiled to expel dissolved O₂, with a 1 cm layer of oil preventing air entry.',
    hasAir: false,
    hasWater: true,
    hasSalt: false,
    hasDesiccant: false,
    hasOilSeal: true,
    rustRate: 0.0, // Zero rust
    liquidColor: 'rgba(241, 245, 249, 0.5)',
    liquidHeightRatio: 0.65
  },
  {
    id: 'tubeC',
    label: 'Tube C: Dry Air + CaCl₂',
    description: 'Anhydrous Calcium Chloride (CaCl₂) desiccant absorbs all moisture; tightly corked.',
    hasAir: true,
    hasWater: false,
    hasSalt: false,
    hasDesiccant: true,
    hasOilSeal: false,
    rustRate: 0.0, // Zero rust
    liquidColor: 'transparent',
    liquidHeightRatio: 0.0
  },
  {
    id: 'tubeD',
    label: 'Tube D: Saline Water (3.5% NaCl)',
    description: 'Salt solution provides mobile Na⁺ and Cl⁻ ions, accelerating galvanic electron transport.',
    hasAir: true,
    hasWater: true,
    hasSalt: true,
    hasDesiccant: false,
    hasOilSeal: false,
    rustRate: 2.8, // Rapid accelerated rusting
    liquidColor: 'rgba(207, 250, 254, 0.55)',
    liquidHeightRatio: 0.55
  }
];

export const PROTECTION_METHODS = [
  { id: 'none', name: 'Bare Iron Nail (Unprotected)', effectiveness: 0.0, desc: 'Direct contact with environment.' },
  { id: 'galvanized', name: 'Galvanized Zinc Layer', effectiveness: 0.98, desc: 'Zinc acts as sacrificial anode (E° = -0.76 V).' },
  { id: 'grease', name: 'Grease / Oil Film', effectiveness: 0.95, desc: 'Hydrophobic barrier physically blocks H₂O and O₂.' },
  { id: 'mg_ribbon', name: 'Cathodic Mg Ribbon Coiled', effectiveness: 0.99, desc: 'Magnesium sacrifices itself preferentially (E° = -2.37 V).' }
];
