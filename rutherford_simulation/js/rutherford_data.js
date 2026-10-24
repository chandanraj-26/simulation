/**
 * Rutherford Alpha Particle Scattering Experiment — Scientific Database
 * Implements Coulomb scattering dynamics, nuclear charge constants,
 * Rutherford scattering formula, and Thomson vs. Rutherford model comparison.
 */

const RUTHERFORD_DATA = {
  constants: {
    vacuumPermittivity: 8.8541878e-12, // F/m (epsilon_0)
    elementaryCharge: 1.6021766e-19,   // C (e)
    alphaCharge: 2 * 1.6021766e-19,     // C (2e for He2+)
    alphaMassKg: 6.644657e-27,         // kg (m_alpha)
    goldAtomicNumber: 79,              // Z for Gold (Au)
    goldNuclearCharge: 79 * 1.6021766e-19,
    alphaEnergyMeV: 5.5,               // Kinetic Energy E_k of typical alpha from 214Bi / 210Po
    goldFoilThicknessNm: 100,          // ~100 nm (approx 1000 atomic layers)
    atomRadiusM: 1.0e-10,              // 0.1 nm (1 Angstrom)
    nucleusRadiusM: 1.0e-14            // 10^-14 m (~10,000 times smaller than atom)
  },

  quotes: {
    rutherford: `"It was quite the most incredible event that has ever happened to me in my life. It was almost as incredible as if you fired a 15-inch shell at a piece of tissue paper and it came back and hit you." — Ernest Rutherford (1911)`
  },

  models: {
    rutherford: {
      name: 'Rutherford Planetary Nuclear Model (1911)',
      desc: 'Atom is mostly empty space. All positive charge and nearly all mass is concentrated in an ultra-dense, minute nucleus at the center. Produces rare large-angle rebounds.',
      deflectionBehavior: 'Most particles pass straight through with theta < 2°; ~1 in 8,000 to 12,000 particles rebounds at theta >= 90° due to direct Coulomb repulsion with dense positive nucleus.'
    },
    thomson: {
      name: "J.J. Thomson 'Plum Pudding' Model (1904)",
      desc: 'Positive charge is spread uniformly over a diffuse sphere of radius ~10⁻¹⁰ m with electrons embedded like plums in a pudding. Electric field inside is weak.',
      deflectionBehavior: 'Because positive charge is spread diffusely, the maximum possible deflection is less than 1° (theta_max ≈ 0.8°). Large-angle backscattering is physically impossible in this model.'
    }
  },

  // Target metals
  targetMetals: {
    Au: { symbol: 'Au', name: 'Gold Foil', Z: 79, color: '#F59E0B' },
    Ag: { symbol: 'Ag', name: 'Silver Foil', Z: 47, color: '#94A3B8' },
    Cu: { symbol: 'Cu', name: 'Copper Foil', Z: 29, color: '#C2410C' },
    Al: { symbol: 'Al', name: 'Aluminium Foil', Z: 13, color: '#CBD5E1' }
  }
};

window.RUTHERFORD_DATA = RUTHERFORD_DATA;
