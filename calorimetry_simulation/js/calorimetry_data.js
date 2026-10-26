/**
 * Thermochemistry & Enthalpy of Neutralization Data
 */

export const REACTION_SYSTEMS = {
  hcl_naoh: {
    id: 'hcl_naoh',
    name: 'Hydrochloric Acid + Sodium Hydroxide (HCl + NaOH)',
    type: 'Strong Acid - Strong Base',
    acidName: '1.0 M HCl (50.0 mL)',
    baseName: '1.0 M NaOH (50.0 mL)',
    standardDeltaH: -57.1, // kJ/mol
    expectedDeltaT: 6.8,   // °C
    notes: 'Classic strong acid - strong base neutralization. Complete ionization yielding constant -57.1 kJ/mol.'
  },
  hno3_koh: {
    id: 'hno3_koh',
    name: 'Nitric Acid + Potassium Hydroxide (HNO₃ + KOH)',
    type: 'Strong Acid - Strong Base',
    acidName: '1.0 M HNO₃ (50.0 mL)',
    baseName: '1.0 M KOH (50.0 mL)',
    standardDeltaH: -57.1,
    expectedDeltaT: 6.8,
    notes: 'Another strong acid - strong base pair verifying universal enthalpy constancy.'
  },
  ch3cooh_naoh: {
    id: 'ch3cooh_naoh',
    name: 'Acetic Acid + Sodium Hydroxide (CH₃COOH + NaOH)',
    type: 'Weak Acid - Strong Base',
    acidName: '1.0 M CH₃COOH (50.0 mL)',
    baseName: '1.0 M NaOH (50.0 mL)',
    standardDeltaH: -55.2, // kJ/mol
    expectedDeltaT: 6.5,
    notes: 'Enthalpy of ionization consumes ~1.9 kJ/mol, resulting in a slightly lower heat output.'
  }
};
