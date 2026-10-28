/**
 * salt_data.js
 * Anions, cations, reagents, and systematic observation outcomes.
 */

export const ANIONS = [
  { id: 'CO3', name: 'Carbonate (CO₃²⁻)', group: 'Dilute H₂SO₄', desc: 'Brisk effervescence with dil. acid' },
  { id: 'Cl', name: 'Chloride (Cl⁻)', group: 'Conc. H₂SO₄', desc: 'Curdy white ppt with AgNO₃, soluble in NH₄OH' },
  { id: 'SO4', name: 'Sulfate (SO₄²⁻)', group: 'Special Group', desc: 'Dense white ppt with BaCl₂, insoluble in HCl' },
  { id: 'NO3', name: 'Nitrate (NO₃⁻)', group: 'Conc. H₂SO₄', desc: 'Brown Ring Test at interface with FeSO₄' }
];

export const CATIONS = [
  { id: 'NH4', name: 'Ammonium (NH₄⁺)', group: 'Group 0', desc: 'Brown ppt with Nessler\'s Reagent' },
  { id: 'Cu', name: 'Copper(II) (Cu²⁺)', group: 'Group II', desc: 'Deep royal blue with excess NH₄OH' },
  { id: 'Fe', name: 'Iron(III) (Fe³⁺)', group: 'Group III', desc: 'Prussian Blue ppt with K₄[Fe(CN)₆]' },
  { id: 'Al', name: 'Aluminium (Al³⁺)', group: 'Group III', desc: 'Gelatinous white ppt, Blue Lake test' },
  { id: 'Ba', name: 'Barium (Ba²⁺)', group: 'Group V', desc: 'Apple green flame test, white ppt with K₂CrO₄' }
];

export const REAGENTS = [
  { id: 'dil_h2so4', name: 'Dilute H₂SO₄', type: 'anion' },
  { id: 'agno3', name: 'Silver Nitrate (AgNO₃)', type: 'anion' },
  { id: 'bacl2', name: 'Barium Chloride (BaCl₂)', type: 'anion' },
  { id: 'nessler', name: 'Nessler\'s Reagent', type: 'cation' },
  { id: 'nh4oh', name: 'Ammonium Hydroxide (NH₄OH)', type: 'cation' },
  { id: 'k4fecn6', name: 'Potassium Ferrocyanide', type: 'cation' },
  { id: 'flame', name: 'Flame Platinum Wire Test', type: 'flame' }
];

export const PRESET_SALTS = [
  { id: 'NH4Cl', name: 'Ammonium Chloride (NH₄Cl)', cation: 'NH4', anion: 'Cl', appearance: 'White crystalline solid' },
  { id: 'CuSO4', name: 'Copper Sulfate (CuSO₄)', cation: 'Cu', anion: 'SO4', appearance: 'Blue crystalline powder' },
  { id: 'FeCl3', name: 'Ferric Chloride (FeCl₃)', cation: 'Fe', anion: 'Cl', appearance: 'Yellow-brown solid' },
  { id: 'BaCO3', name: 'Barium Carbonate (BaCO₃)', cation: 'Ba', anion: 'CO3', appearance: 'White insoluble powder' }
];
