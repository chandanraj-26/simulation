/**
 * Reactivity Series & Metal Displacement Reactions — Chemical Database & Thermodynamics
 * Standard electrode reduction potentials (E°), color transitions, reaction enthalpies,
 * and NCERT Class 9/10 laboratory combinations.
 */

const REACTIVITY_DATA = {
  // Activity / Reactivity Series ordered by decreasing electropositivity / reactivity
  reactivityLadder: [
    { symbol: 'K',  name: 'Potassium', E0: -2.93, category: 'Very Vigorous' },
    { symbol: 'Na', name: 'Sodium',    E0: -2.71, category: 'Very Vigorous' },
    { symbol: 'Ca', name: 'Calcium',   E0: -2.87, category: 'Very Vigorous' },
    { symbol: 'Mg', name: 'Magnesium', E0: -2.37, category: 'Rapid' },
    { symbol: 'Al', name: 'Aluminium', E0: -1.66, category: 'Moderate (oxide film)' },
    { symbol: 'Zn', name: 'Zinc',      E0: -0.76, category: 'Moderate' },
    { symbol: 'Fe', name: 'Iron',      E0: -0.44, category: 'Slow / Visible' },
    { symbol: 'Pb', name: 'Lead',      E0: -0.13, category: 'Slow' },
    { symbol: 'H',  name: 'Hydrogen',  E0:  0.00, category: 'Standard Reference' },
    { symbol: 'Cu', name: 'Copper',    E0: +0.34, category: 'Unreactive to H⁺' },
    { symbol: 'Ag', name: 'Silver',    E0: +0.80, category: 'Noble / Low' },
    { symbol: 'Au', name: 'Gold',      E0: +1.50, category: 'Unreactive' }
  ],

  // Coaching Hinglish Mnemonic for CBSE/ICSE students
  mnemonic: 'Kedar (K) Nath (Na) Ka (Ca) Mali (Mg) Aalu (Al) Zara (Zn) Pheeke (Fe) Pakata (Pb) Hai (H), Kyun-ki (Cu) Hoga (Hg) Ag (Ag) Au (Au)',

  // Supported Metal Samples (Solid Strips/Nails)
  metals: {
    Fe: {
      id: 'Fe',
      name: 'Iron Nail',
      color: '#64748B', // Metallic grey/steel
      highlight: '#94A3B8',
      shape: 'nail',
      reactivityRank: 7, // lower number = more reactive
      symbol: 'Fe',
      molarMass: 55.845
    },
    Zn: {
      id: 'Zn',
      name: 'Zinc Strip',
      color: '#94A3B8', // Dull silvery bluish
      highlight: '#CBD5E1',
      shape: 'strip',
      reactivityRank: 6,
      symbol: 'Zn',
      molarMass: 65.38
    },
    Cu: {
      id: 'Cu',
      name: 'Copper Wire Coil',
      color: '#C2410C', // Reddish-orange bronze
      highlight: '#EA580C',
      shape: 'coil',
      reactivityRank: 10,
      symbol: 'Cu',
      molarMass: 63.546
    },
    Mg: {
      id: 'Mg',
      name: 'Magnesium Ribbon',
      color: '#E2E8F0', // Bright shiny silvery white
      highlight: '#FFFFFF',
      shape: 'ribbon',
      reactivityRank: 4,
      symbol: 'Mg',
      molarMass: 24.305
    },
    Ag: {
      id: 'Ag',
      name: 'Silver Wire',
      color: '#E2E8F0', // Brilliant lustrous white
      highlight: '#F8FAFC',
      shape: 'wire',
      reactivityRank: 11,
      symbol: 'Ag',
      molarMass: 107.868
    }
  },

  // Supported Aqueous Salt Solutions
  solutions: {
    CuSO4: {
      id: 'CuSO4',
      name: 'Copper(II) Sulfate (0.5 M)',
      ion: 'Cu²⁺',
      baseColor: 'rgba(14, 165, 233, 0.70)', // Vibrant Sky Blue
      hexColor: '#0EA5E9',
      metalSymbol: 'Cu',
      reactivityRank: 10
    },
    FeSO4: {
      id: 'FeSO4',
      name: 'Ferrous Sulfate (0.5 M)',
      ion: 'Fe²⁺',
      baseColor: 'rgba(134, 239, 172, 0.65)', // Pale Light Green
      hexColor: '#86EFAC',
      metalSymbol: 'Fe',
      reactivityRank: 7
    },
    ZnSO4: {
      id: 'ZnSO4',
      name: 'Zinc Sulfate (0.5 M)',
      ion: 'Zn²⁺',
      baseColor: 'rgba(241, 245, 249, 0.40)', // Clear / Colorless
      hexColor: '#F1F5F9',
      metalSymbol: 'Zn',
      reactivityRank: 6
    },
    AgNO3: {
      id: 'AgNO3',
      name: 'Silver Nitrate (0.5 M)',
      ion: 'Ag⁺',
      baseColor: 'rgba(248, 250, 252, 0.45)', // Crystal Clear
      hexColor: '#F8FAFC',
      metalSymbol: 'Ag',
      reactivityRank: 11
    },
    MgSO4: {
      id: 'MgSO4',
      name: 'Magnesium Sulfate (0.5 M)',
      ion: 'Mg²⁺',
      baseColor: 'rgba(248, 250, 252, 0.35)', // Crystal Clear
      hexColor: '#F8FAFC',
      metalSymbol: 'Mg',
      reactivityRank: 4
    }
  },

  // Reaction Outcomes and Observations
  reactions: {
    // 1. Fe + CuSO4 -> FeSO4 + Cu
    'Fe+CuSO4': {
      occurs: true,
      rate: 0.12, // Progress per second
      equation: 'Fe (s) + CuSO₄ (aq) → FeSO₄ (aq) + Cu (s)↓',
      colorTransition: {
        from: 'rgba(14, 165, 233, 0.70)',
        to: 'rgba(134, 239, 172, 0.65)' // Sky Blue -> Pale Green
      },
      depositType: 'copper_layer', // Reddish-brown deposit on nail
      depositColor: '#9A3412',
      deltaTempC: +2.4, // Mild exothermic
      observation: 'Blue solution turns pale light green; reddish-brown copper deposits on the iron nail.'
    },

    // 2. Zn + CuSO4 -> ZnSO4 + Cu
    'Zn+CuSO4': {
      occurs: true,
      rate: 0.22,
      equation: 'Zn (s) + CuSO₄ (aq) → ZnSO₄ (aq) + Cu (s)↓',
      colorTransition: {
        from: 'rgba(14, 165, 233, 0.70)',
        to: 'rgba(241, 245, 249, 0.40)' // Sky Blue -> Colorless
      },
      depositType: 'spongy_copper',
      depositColor: '#7C2D12',
      deltaTempC: +6.8, // Vigorous exothermic
      observation: 'Intense blue decolors to colorless; spongy dark-brown copper rapidly coats the zinc strip with warmth.'
    },

    // 3. Cu + AgNO3 -> Cu(NO3)2 + 2Ag
    'Cu+AgNO3': {
      occurs: true,
      rate: 0.15,
      equation: 'Cu (s) + 2AgNO₃ (aq) → Cu(NO₃)₂ (aq) + 2Ag (s)↓',
      colorTransition: {
        from: 'rgba(248, 250, 252, 0.45)',
        to: 'rgba(56, 189, 248, 0.65)' // Colorless -> Azure Blue
      },
      depositType: 'silver_crystals', // Sparkling dendritic needles
      depositColor: '#E2E8F0',
      deltaTempC: +1.8,
      observation: 'Clear solution turns delicate azure blue; sparkling, branching metallic silver needles grow like a frosty tree on copper.'
    },

    // 4. Mg + CuSO4 -> MgSO4 + Cu
    'Mg+CuSO4': {
      occurs: true,
      rate: 0.35,
      equation: 'Mg (s) + CuSO₄ (aq) → MgSO₄ (aq) + Cu (s)↓',
      colorTransition: {
        from: 'rgba(14, 165, 233, 0.70)',
        to: 'rgba(241, 245, 249, 0.35)'
      },
      depositType: 'rapid_copper',
      depositColor: '#9A3412',
      deltaTempC: +12.5, // Highly exothermic
      observation: 'Rapid boiling effervescence, blue solution quickly bleaches colorless with heavy copper precipitation.'
    },

    // 5. Mg + ZnSO4 -> MgSO4 + Zn
    'Mg+ZnSO4': {
      occurs: true,
      rate: 0.20,
      equation: 'Mg (s) + ZnSO₄ (aq) → MgSO₄ (aq) + Zn (s)↓',
      colorTransition: {
        from: 'rgba(241, 245, 249, 0.40)',
        to: 'rgba(248, 250, 252, 0.35)'
      },
      depositType: 'zinc_deposit',
      depositColor: '#64748B',
      deltaTempC: +4.2,
      observation: 'Grey zinc coats the magnesium ribbon; solution remains clear.'
    },

    // Control Trials (No reaction)
    'Cu+FeSO4': {
      occurs: false,
      equation: 'Cu (s) + FeSO₄ (aq) → No Reaction (Cu is below Fe in Reactivity Series)',
      observation: 'No change observed. Copper cannot displace iron from ferrous sulfate.'
    },
    'Cu+ZnSO4': {
      occurs: false,
      equation: 'Cu (s) + ZnSO₄ (aq) → No Reaction (Cu is below Zn in Reactivity Series)',
      observation: 'No change observed. Copper cannot displace zinc.'
    },
    'Fe+ZnSO4': {
      occurs: false,
      equation: 'Fe (s) + ZnSO₄ (aq) → No Reaction (Fe is below Zn in Reactivity Series)',
      observation: 'No change observed. Iron cannot displace zinc.'
    },
    'Ag+CuSO4': {
      occurs: false,
      equation: 'Ag (s) + CuSO₄ (aq) → No Reaction (Ag is below Cu in Reactivity Series)',
      observation: 'No change observed. Silver is less reactive than copper.'
    }
  }
};

window.REACTIVITY_DATA = REACTIVITY_DATA;
