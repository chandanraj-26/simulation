/**
 * Flame Test & Atomic Emission Spectra — Scientific Chemical Dataset
 * Contains empirical spectroscopic data, electron transitions, flame colors,
 * quantum wavelengths (nm), photon energies (eV), and educational cytology notes.
 */

const ELEMENTS_DATA = {
  none: {
    id: 'none',
    name: 'Clean Loop (No Salt)',
    formula: '—',
    ion: '—',
    flameColorName: 'Base Blue Burner Flame',
    hexCore: '#3B82F6',
    hexGlow: '#60A5FA',
    rgbGlow: [59, 130, 246],
    spectralLines: [],
    dominantWavelength: null,
    photonEnergyEV: null,
    electronTransition: 'Non-luminous thermal radiation from methane combustion (CH₄ + 2O₂ → CO₂ + 2H₂O)',
    flameDescription: 'Normal non-luminous blue flame produced by complete combustion of hydrocarbon fuel gas.',
    cobaltEffect: 'Remains blue-purple under cobalt glass with faint attenuation.',
    safetyNotes: 'Ensure loop is heated to glowing orange to burn off contaminants.'
  },
  na: {
    id: 'na',
    name: 'Sodium Chloride',
    formula: 'NaCl',
    ion: 'Na⁺',
    flameColorName: 'Intense Golden Yellow',
    hexCore: '#FACC15',
    hexGlow: '#F59E0B',
    rgbGlow: [245, 158, 11],
    spectralLines: [
      { nm: 589.0, intensity: 1.0, color: '#FFD700', label: '589.0 nm (D₂ line)' },
      { nm: 589.6, intensity: 0.9, color: '#FFCA00', label: '589.6 nm (D₁ line)' },
      { nm: 330.2, intensity: 0.15, color: '#A855F7', label: '330.2 nm (UV)' },
      { nm: 818.3, intensity: 0.2, color: '#DC2626', label: '818.3 nm (IR)' }
    ],
    dominantWavelength: 589.0,
    photonEnergyEV: 2.10,
    electronTransition: '3p → 3s orbital de-excitation (excited 3p¹ state relaxes to ground [Ne] 3s¹)',
    flameDescription: 'Extremely luminous, persistent golden-yellow flame. So sensitive that even trace fingerprint sweat produces this color.',
    cobaltEffect: 'Completely absorbed and filtered out by Cobalt Blue glass (appears colorless/invisible).',
    safetyNotes: 'Common table salt. Harmless, but easily masks other element flames without cobalt glass.'
  },
  k: {
    id: 'k',
    name: 'Potassium Chloride',
    formula: 'KCl',
    ion: 'K⁺',
    flameColorName: 'Soft Lilac / Violet',
    hexCore: '#C084FC',
    hexGlow: '#9333EA',
    rgbGlow: [168, 85, 247],
    spectralLines: [
      { nm: 404.4, intensity: 0.65, color: '#8B5CF6', label: '404.4 nm (Violet)' },
      { nm: 404.7, intensity: 0.55, color: '#7C3AED', label: '404.7 nm (Violet)' },
      { nm: 766.5, intensity: 0.95, color: '#991B1B', label: '766.5 nm (Deep Red)' },
      { nm: 769.9, intensity: 0.85, color: '#7F1D1D', label: '769.9 nm (Deep Red)' }
    ],
    dominantWavelength: 404.4,
    photonEnergyEV: 3.06,
    electronTransition: '5p → 4s and 4p → 4s orbital transitions in excited potassium atoms',
    flameDescription: 'Gentle, transient lilac-violet flame that is easily overwhelmed by ubiquitous sodium impurities.',
    cobaltEffect: 'Easily viewed through Cobalt Blue glass as a distinct crimson-violet tint, since cobalt absorbs yellow sodium light.',
    safetyNotes: 'Keep sample dry. Often contaminated with trace sodium, making cobalt glass mandatory.'
  },
  cu: {
    id: 'cu',
    name: 'Copper(II) Chloride',
    formula: 'CuCl₂',
    ion: 'Cu²⁺',
    flameColorName: 'Vivid Emerald Green & Cyan',
    hexCore: '#34D399',
    hexGlow: '#059669',
    rgbGlow: [16, 185, 129],
    spectralLines: [
      { nm: 510.6, intensity: 0.85, color: '#10B981', label: '510.6 nm (Green)' },
      { nm: 515.3, intensity: 0.70, color: '#059669', label: '515.3 nm (Green)' },
      { nm: 521.8, intensity: 0.90, color: '#047857', label: '521.8 nm (Green)' },
      { nm: 465.1, intensity: 0.50, color: '#06B6D4', label: '465.1 nm (Cyan)' },
      { nm: 435.8, intensity: 0.40, color: '#3B82F6', label: '435.8 nm (Blue)' }
    ],
    dominantWavelength: 521.8,
    photonEnergyEV: 2.38,
    electronTransition: 'Excited CuCl vapor molecular bands and copper atom 4p → 4s transitions',
    flameDescription: 'Striking emerald-green core with turquoise-cyan flashes and sparkling electric edges.',
    cobaltEffect: 'Appears vibrant royal blue-green through cobalt glass.',
    safetyNotes: 'Avoid breathing halide vapors. Produce vivid colors in pyrotechnics and fireworks.'
  },
  ca: {
    id: 'ca',
    name: 'Calcium Chloride',
    formula: 'CaCl₂',
    ion: 'Ca²⁺',
    flameColorName: 'Brick Red / Orange-Red',
    hexCore: '#FB923C',
    hexGlow: '#EA580C',
    rgbGlow: [234, 88, 12],
    spectralLines: [
      { nm: 622.0, intensity: 0.90, color: '#F97316', label: '622.0 nm (Orange-Red)' },
      { nm: 553.3, intensity: 0.45, color: '#84CC16', label: '553.3 nm (Yellow-Green)' },
      { nm: 422.7, intensity: 0.60, color: '#6366F1', label: '422.7 nm (Violet-Blue)' }
    ],
    dominantWavelength: 622.0,
    photonEnergyEV: 1.99,
    electronTransition: 'CaOH molecular bands and 4p → 4s singlet atomic transitions',
    flameDescription: 'Distinctive brick-red or warm terracotta-orange flame with short flashes.',
    cobaltEffect: 'Appears faint olive-green or grayish through cobalt glass.',
    safetyNotes: 'Hygroscopic salt; absorbs atmospheric moisture quickly.'
  },
  sr: {
    id: 'sr',
    name: 'Strontium Chloride',
    formula: 'SrCl₂',
    ion: 'Sr²⁺',
    flameColorName: 'Brilliant Crimson / Scarlet',
    hexCore: '#F43F5E',
    hexGlow: '#E11D48',
    rgbGlow: [225, 29, 72],
    spectralLines: [
      { nm: 660.0, intensity: 0.95, color: '#EF4444', label: '660.0 nm (Scarlet)' },
      { nm: 682.0, intensity: 0.80, color: '#DC2626', label: '682.0 nm (Deep Red)' },
      { nm: 460.7, intensity: 0.70, color: '#38BDF8', label: '460.7 nm (Sky Blue)' }
    ],
    dominantWavelength: 660.0,
    photonEnergyEV: 1.88,
    electronTransition: 'SrOH molecular emission and 5p → 5s resonant atomic transitions',
    flameDescription: 'Intense, persistent crimson-scarlet red. Used as the primary red colorant in emergency road flares and fireworks.',
    cobaltEffect: 'Appears purple-violet through cobalt glass.',
    safetyNotes: 'Heavier alkaline earth metal; produces exceptionally vivid red light.'
  },
  ba: {
    id: 'ba',
    name: 'Barium Chloride',
    formula: 'BaCl₂',
    ion: 'Ba²⁺',
    flameColorName: 'Pale Apple Green',
    hexCore: '#A3E635',
    hexGlow: '#65A30D',
    rgbGlow: [132, 204, 22],
    spectralLines: [
      { nm: 514.0, intensity: 0.75, color: '#22C55E', label: '514.0 nm (Green)' },
      { nm: 524.2, intensity: 0.85, color: '#16A34A', label: '524.2 nm (Green)' },
      { nm: 534.0, intensity: 0.80, color: '#15803D', label: '534.0 nm (Green)' },
      { nm: 553.5, intensity: 0.90, color: '#84CC16', label: '553.5 nm (Yellow-Green)' }
    ],
    dominantWavelength: 553.5,
    photonEnergyEV: 2.24,
    electronTransition: 'BaOH and BaCl molecular bands coupled with 6p → 6s atomic transitions',
    flameDescription: 'Distinctive pale chartreuse / yellowish apple-green flame that takes a few seconds of heating to develop.',
    cobaltEffect: 'Appears yellow-green through cobalt glass.',
    safetyNotes: 'Barium salts are toxic if ingested; always handle with laboratory spatulas.'
  },
  li: {
    id: 'li',
    name: 'Lithium Chloride',
    formula: 'LiCl',
    ion: 'Li⁺',
    flameColorName: 'Carmine Magenta / Fuchsia',
    hexCore: '#FB7185',
    hexGlow: '#BE123C',
    rgbGlow: [190, 18, 60],
    spectralLines: [
      { nm: 670.8, intensity: 1.0, color: '#E11D48', label: '670.8 nm (Carmine Red)' },
      { nm: 610.3, intensity: 0.35, color: '#F97316', label: '610.3 nm (Orange)' },
      { nm: 323.3, intensity: 0.20, color: '#8B5CF6', label: '323.3 nm (UV)' }
    ],
    dominantWavelength: 670.8,
    photonEnergyEV: 1.85,
    electronTransition: '2p → 2s resonant atomic transition in vaporized lithium atoms',
    flameDescription: 'Deep, rich carmine-magenta red, visibly more purplish/pinkish than strontium scarlet.',
    cobaltEffect: 'Appears dark carmine red through cobalt glass.',
    safetyNotes: 'Lightest alkali metal; burns vigorously in flame with high spectral purity.'
  }
};

// Mystery unknown samples for student detective challenge
const MYSTERY_SAMPLES = [
  { id: 'mystery-1', code: 'Sample Alpha', actualElement: 'cu', hint: 'Produces green flashes with a dominant line near 521 nm.' },
  { id: 'mystery-2', code: 'Sample Beta', actualElement: 'na', hint: 'Overwhelmingly intense yellow flame; filtered completely by cobalt glass.' },
  { id: 'mystery-3', code: 'Sample Gamma', actualElement: 'k', hint: 'Delicate lilac flame that requires cobalt glass to confirm.' },
  { id: 'mystery-4', code: 'Sample Delta', actualElement: 'sr', hint: 'Deep crimson-scarlet flame used in safety flare pyrotechnics.' }
];

window.ELEMENTS_DATA = ELEMENTS_DATA;
window.MYSTERY_SAMPLES = MYSTERY_SAMPLES;
