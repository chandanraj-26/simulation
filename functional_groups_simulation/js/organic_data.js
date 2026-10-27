/**
 * Organic Compounds & Diagnostic Reagent Tests Dataset
 * NCERT Class 12 Qualitative Organic Analysis
 */

export const COMPOUNDS = {
  cyclohexene: {
    id: 'cyclohexene',
    name: 'Cyclohexene (Alkene)',
    group: 'Unsaturation (C=C)',
    formula: 'C6H10',
    color: 'rgba(255, 255, 255, 0.4)',
    responses: {
      bromine_water: { positive: true, obs: 'Instant de-colorization of reddish-brown Br2 water', product: '1,2-Dibromocyclohexane' },
      baeyers: { positive: true, obs: 'De-colorization of purple KMnO4 with brown MnO2↓ precipitate', product: 'cis-Cyclohexane-1,2-diol' },
      sodium: { positive: false, obs: 'No reaction; sodium sinks with zero bubbling' },
      tollens: { positive: false, obs: 'No silver mirror formed' },
      nahco3: { positive: false, obs: 'No effervescence' }
    }
  },
  ethanol: {
    id: 'ethanol',
    name: 'Ethanol (Alcohol)',
    group: 'Alcoholic (-OH)',
    formula: 'C2H5OH',
    color: 'rgba(255, 255, 255, 0.4)',
    responses: {
      bromine_water: { positive: false, obs: 'Bromine color remains reddish-orange' },
      baeyers: { positive: false, obs: 'No immediate de-colorization in the cold' },
      sodium: { positive: true, obs: 'Brisk effervescence of H2↑ gas (squeaky pop with burning splint)', product: 'Sodium ethoxide (C2H5ONa)' },
      tollens: { positive: false, obs: 'No silver mirror formed' },
      nahco3: { positive: false, obs: 'No effervescence' }
    }
  },
  acetaldehyde: {
    id: 'acetaldehyde',
    name: 'Acetaldehyde (Aldehyde)',
    group: 'Aldehydic (-CHO)',
    formula: 'CH3CHO',
    color: 'rgba(255, 255, 255, 0.4)',
    responses: {
      bromine_water: { positive: false, obs: 'No unsaturation reaction' },
      baeyers: { positive: false, obs: 'No cold reaction' },
      sodium: { positive: false, obs: 'No H2 evolution' },
      tollens: { positive: true, obs: 'Glittering metallic Silver Mirror (Ag) coats inner tube walls!', product: 'Metallic Silver (2Ag↓)' },
      nahco3: { positive: false, obs: 'No effervescence' }
    }
  },
  acetic_acid: {
    id: 'acetic_acid',
    name: 'Acetic Acid (Carboxylic Acid)',
    group: 'Carboxylic (-COOH)',
    formula: 'CH3COOH',
    color: 'rgba(255, 255, 255, 0.4)',
    responses: {
      bromine_water: { positive: false, obs: 'No reaction' },
      baeyers: { positive: false, obs: 'No reaction' },
      sodium: { positive: true, obs: 'Rapid bubbling of H2↑' },
      tollens: { positive: false, obs: 'No silver mirror' },
      nahco3: { positive: true, obs: 'Vigorous brisk effervescence of CO2↑ gas turning lime water milky!', product: 'Sodium acetate + CO2↑ + H2O' }
    }
  }
};

export const REAGENTS = {
  bromine_water: { id: 'bromine_water', name: 'Bromine Water (Br2 / CCl4)', color: '#d97706', label: 'Test for Unsaturation' },
  baeyers: { id: 'baeyers', name: "Baeyer's Reagent (Alk. KMnO4)", color: '#7c3aed', label: 'Cold KMnO4 Test' },
  sodium: { id: 'sodium', name: 'Sodium Metal Piece (Na)', color: '#cbd5e1', label: 'Active Metal Test (-OH)' },
  tollens: { id: 'tollens', name: "Tollens' Reagent (Ammoniacal AgNO3)", color: '#94a3b8', label: 'Silver Mirror Test (-CHO)' },
  nahco3: { id: 'nahco3', name: 'Sodium Bicarbonate (5% NaHCO3)', color: '#ffffff', label: 'Brisk Effervescence (-COOH)' }
};
