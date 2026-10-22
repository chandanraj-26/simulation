/**
 * Solubility Curves, Saturated Solutions & Crystallization — Scientific Database
 * Class 9 NCERT Chapter 2: Is Matter Around Us Pure (Activity 2.3 & 2.4)
 * Accurate solubility polynomials (g solute / 100 g H2O) as a function of temperature T (°C).
 */

const SOLUBILITY_DATA = {
  salts: {
    KNO3: {
      id: 'KNO3',
      name: 'Potassium Nitrate (KNO₃)',
      color: '#FFFFFF', // White crystalline powder
      solutionColor: 'rgba(235, 248, 255, 0.45)', // Clear colorless
      crystalShape: 'prismatic',
      crystalColor: '#F8FAFC',
      slopeType: 'steep_endothermic',
      // S(T) = 13.3 + 0.38*T + 0.019*T^2 (approximate fit from 0 to 100°C)
      solubility: (T) => 13.3 + 0.38 * T + 0.0195 * (T * T),
      points: [
        { T: 0, S: 13.3 }, { T: 20, S: 31.6 }, { T: 40, S: 63.9 },
        { T: 60, S: 110.0 }, { T: 80, S: 169.0 }, { T: 100, S: 246.0 }
      ],
      description: 'Remarkably steep positive slope. Solubility increases by over 700% from 20°C to 100°C. Ideal for purifying via fractional crystallization.'
    },

    NaCl: {
      id: 'NaCl',
      name: 'Sodium Chloride (Common Salt)',
      color: '#FFFFFF',
      solutionColor: 'rgba(235, 248, 255, 0.40)',
      crystalShape: 'cubic',
      crystalColor: '#FFFFFF',
      slopeType: 'nearly_flat',
      // S(T) ≈ 35.7 + 0.038*T
      solubility: (T) => 35.7 + 0.038 * T,
      points: [
        { T: 0, S: 35.7 }, { T: 20, S: 36.0 }, { T: 40, S: 36.6 },
        { T: 60, S: 37.3 }, { T: 80, S: 38.4 }, { T: 100, S: 39.8 }
      ],
      description: 'Nearly flat curve. Solubility barely changes between 0°C and 100°C. Cannot be purified by cooling; requires complete evaporation.'
    },

    CuSO4: {
      id: 'CuSO4',
      name: 'Copper(II) Sulfate Pentahydrate (CuSO₄·5H₂O)',
      color: '#0284C7', // Vibrant crystalline blue
      solutionColor: 'rgba(14, 165, 233, 0.70)', // Sky blue
      crystalShape: 'triclinic',
      crystalColor: '#0369A1',
      slopeType: 'moderate_endothermic',
      // S(T) ≈ 14.3 + 0.28*T + 0.0034*T^2
      solubility: (T) => 14.3 + 0.28 * T + 0.0034 * (T * T),
      points: [
        { T: 0, S: 14.3 }, { T: 20, S: 20.7 }, { T: 40, S: 28.5 },
        { T: 60, S: 40.0 }, { T: 80, S: 55.0 }, { T: 100, S: 75.4 }
      ],
      description: 'Moderate positive slope. Yields gorgeous deep-blue rhombic/triclinic gem-like crystals upon cooling.'
    },

    Ce2SO4_3: {
      id: 'Ce2SO4_3',
      name: 'Cerium(III) Sulfate (Ce₂(SO₄)₃)',
      color: '#FEF08A', // Pale yellow
      solutionColor: 'rgba(254, 240, 138, 0.35)',
      crystalShape: 'needle',
      crystalColor: '#FDE047',
      slopeType: 'retrograde_exothermic',
      // S(T) ≈ 20.8 - 0.26*T + 0.0009*T^2
      solubility: (T) => Math.max(1.5, 20.8 - 0.26 * T + 0.0009 * (T * T)),
      points: [
        { T: 0, S: 20.8 }, { T: 20, S: 10.1 }, { T: 40, S: 5.6 },
        { T: 60, S: 3.8 }, { T: 80, S: 2.6 }, { T: 100, S: 1.5 }
      ],
      description: 'Rare retrograde (inverse) solubility! Dissolving is exothermic; heating causes crystals to precipitate out of solution.'
    }
  }
};

window.SOLUBILITY_DATA = SOLUBILITY_DATA;
