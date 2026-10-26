/**
 * Electrochemical Data & Reduction Potentials
 * NCERT Class 12 Chapter 3 Electrochemistry
 */

export const ELECTRODES = {
  zinc_copper: {
    id: 'zinc_copper',
    name: 'Classic Daniell Cell (Zn - Cu)',
    anode: {
      name: 'Zinc (Zn)',
      metal: 'Zn',
      ion: 'Zn²⁺',
      standardPotential: -0.76, // V
      color: '#94a3b8',
      solColor: 'rgba(241, 245, 249, 0.6)',
      reaction: 'Zn(s) → Zn²⁺(aq) + 2e⁻ (Oxidation)'
    },
    cathode: {
      name: 'Copper (Cu)',
      metal: 'Cu',
      ion: 'Cu²⁺',
      standardPotential: 0.34, // V
      color: '#b45309', // Copper reddish-orange
      solColor: 'rgba(59, 130, 246, 0.45)', // Blue CuSO4
      reaction: 'Cu²⁺(aq) + 2e⁻ → Cu(s) (Reduction)'
    },
    standardCellPotential: 1.10, // V
    electronsTransferred: 2
  },
  zinc_silver: {
    id: 'zinc_silver',
    name: 'Zinc - Silver Cell (Zn - Ag)',
    anode: {
      name: 'Zinc (Zn)',
      metal: 'Zn',
      ion: 'Zn²⁺',
      standardPotential: -0.76,
      color: '#94a3b8',
      solColor: 'rgba(241, 245, 249, 0.6)',
      reaction: 'Zn(s) → Zn²⁺(aq) + 2e⁻ (Oxidation)'
    },
    cathode: {
      name: 'Silver (Ag)',
      metal: 'Ag',
      ion: 'Ag⁺',
      standardPotential: 0.80,
      color: '#cbd5e1',
      solColor: 'rgba(248, 250, 252, 0.7)', // Colorless AgNO3
      reaction: '2Ag⁺(aq) + 2e⁻ → 2Ag(s) (Reduction)'
    },
    standardCellPotential: 1.56, // V
    electronsTransferred: 2
  }
};

export const SALT_BRIDGES = {
  kcl: {
    id: 'kcl',
    name: 'Potassium Chloride (KCl in agar-agar)',
    cation: 'K⁺',
    anion: 'Cl⁻',
    transferenceMatch: 'Equitransferent (u_K+ ≈ u_Cl-)',
    notes: 'Standard salt bridge. Eliminates liquid junction potential.'
  },
  kno3: {
    id: 'kno3',
    name: 'Potassium Nitrate (KNO₃ in agar-agar)',
    cation: 'K⁺',
    anion: 'NO₃⁻',
    transferenceMatch: 'High mobility match',
    notes: 'Used when silver or lead ions are present to avoid chloride precipitation.'
  }
};
