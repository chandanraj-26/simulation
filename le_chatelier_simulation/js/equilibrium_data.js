/**
 * Equilibrium Chemical Systems & Le Chatelier Constants
 * NCERT Class 11 Chapter 7 Chemical Equilibrium
 */

export const SYSTEMS = {
  iron_thiocyanate: {
    id: 'iron_thiocyanate',
    name: 'Iron(III) Thiocyanate Equilibrium',
    equation: 'Fe³⁺(aq) + SCN⁻(aq) ⇌ [Fe(SCN)]²⁺(aq)',
    deltaH: -25.0, // kJ/mol (Exothermic forward)
    enthalpyType: 'exothermic',
    reactants: [
      { name: 'Fe³⁺ (Iron(III) ion)', color: '#fef08a', colorName: 'Pale Yellow' },
      { name: 'SCN⁻ (Thiocyanate ion)', color: '#ffffff', colorName: 'Colorless' }
    ],
    product: {
      name: '[Fe(SCN)]²⁺ (Iron-thiocyanate complex)',
      color: '#991b1b',
      colorName: 'Deep Blood Red'
    },
    defaultTempC: 25,
    reagents: [
      { id: 'add_fe', label: '+ FeCl₃ (Add Fe³⁺)', shift: 'forward', effect: 'Shifts forward → Intensifies blood-red color' },
      { id: 'add_scn', label: '+ KSCN (Add SCN⁻)', shift: 'forward', effect: 'Shifts forward → Intensifies blood-red color' },
      { id: 'add_oxalate', label: '+ Oxalic Acid (Complexes Fe³⁺)', shift: 'reverse', effect: 'Pulls Fe³⁺ into stable [Fe(C₂O₄)₃]³⁻ → Shifts reverse (turns yellow)' },
      { id: 'add_agno3', label: '+ AgNO₃ (Precipitates AgSCN)', shift: 'reverse', effect: 'Removes SCN⁻ as white AgSCN↓ → Shifts reverse to pale yellow' }
    ]
  },
  cobalt_chloride: {
    id: 'cobalt_chloride',
    name: 'Cobalt(II) Hexaaqua / Tetrachloro Equilibrium',
    equation: '[Co(H₂O)₆]²⁺(aq) + 4Cl⁻(aq) ⇌ [CoCl₄]²⁻(aq) + 6H₂O',
    deltaH: 50.0, // kJ/mol (Endothermic forward)
    enthalpyType: 'endothermic',
    reactants: [
      { name: '[Co(H₂O)₆]²⁺ (Octahedral)', color: '#f472b6', colorName: 'Rosy Pink' },
      { name: 'Cl⁻ (Chloride ion)', color: '#ffffff', colorName: 'Colorless' }
    ],
    product: {
      name: '[CoCl₄]²⁻ (Tetrahedral)',
      color: '#1d4ed8',
      colorName: 'Deep Cobalt Blue'
    },
    defaultTempC: 25,
    reagents: [
      { id: 'add_hcl', label: '+ Conc. HCl (Add Cl⁻)', shift: 'forward', effect: 'Increases [Cl⁻] → Shifts forward to intense blue' },
      { id: 'add_water', label: '+ Distilled H₂O', shift: 'reverse', effect: 'Increases [H₂O] & dilutes Cl⁻ → Shifts reverse to rosy pink' },
      { id: 'hot_bath', label: '♨ Immersion: Hot Water (80°C)', shift: 'forward', effect: 'Endothermic forward absorption → Turns deep blue' },
      { id: 'ice_bath', label: '❄ Immersion: Ice Water (0°C)', shift: 'reverse', effect: 'Exothermic reverse release → Turns rosy pink' }
    ]
  }
};
