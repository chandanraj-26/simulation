/**
 * Colloids, Suspensions & Tyndall Effect — Scientific Database
 * Class 9 NCERT Chapter 2: Is Matter Around Us Pure (Activities 2.1 & 2.2)
 * Particle size classifications, Rayleigh-Tyndall scattering optics, and filtration behavior.
 */

const TYNDALL_DATA = {
  beakers: {
    true_solution: {
      id: 'true_solution',
      name: 'True Solution (Copper Sulfate / NaCl)',
      solute: 'CuSO₄ in Water',
      type: 'Homogeneous Mixture',
      particleSize: '< 1 nm (Atomic / Molecular Scale)',
      appearance: 'Clear, Transparent, Uniform',
      stability: 'Completely Stable (No settling with time)',
      tyndallEffect: false,
      tyndallScatteringRatio: 0.0,
      filtration: 'Passes completely through filter paper (No residue)',
      color: 'rgba(14, 165, 233, 0.45)', // Sky blue
      description: 'Solute particles are so small (< 1 nm) that they cannot scatter light. The path of the laser beam is completely invisible inside the solution.'
    },

    colloid: {
      id: 'colloid',
      name: 'Colloidal Sol (Dilute Milk / Starch Sol)',
      solute: 'Milk Proteins / Starch Micelles',
      type: 'Heterogeneous (Colloidal Dispersion)',
      particleSize: '1 nm to 1000 nm (Colloidal Scale)',
      appearance: 'Translucent, Milky / Opalescent',
      stability: 'Quite Stable (Brownian motion prevents settling)',
      tyndallEffect: true,
      tyndallScatteringRatio: 0.85,
      filtration: 'Passes through filter paper (Particles too small for pores)',
      color: 'rgba(248, 250, 252, 0.65)', // Milky translucent
      description: 'Particles are large enough (1–1000 nm) to scatter visible light rays. The path of the beam becomes brilliantly luminous (Tyndall Effect).'
    },

    suspension: {
      id: 'suspension',
      name: 'Suspension (Chalk Powder in Water)',
      solute: 'Calcium Carbonate (Chalk) Granules',
      type: 'Heterogeneous Mixture',
      particleSize: '> 1000 nm (Microscopic Scale)',
      appearance: 'Cloudy, Turbid, Opaque',
      stability: 'Unstable (Coarse particles sediment to bottom)',
      tyndallEffect: true, // Scatters opaquely until settled
      tyndallScatteringRatio: 0.95,
      filtration: 'Retained on filter paper (Thick chalk residue)',
      color: 'rgba(226, 232, 240, 0.75)', // Cloudy chalk
      description: 'Coarse particles (> 1000 nm) scatter light opaquely and settle down over time due to gravity. Can be separated easily by filtration.'
    }
  },

  lasers: {
    red: {
      id: 'red',
      name: 'Red Diode Laser',
      wavelengthNm: 650,
      color: '#EF4444',
      beamGlow: 'rgba(239, 68, 68, 0.75)',
      scatteringFactor: 1.0 // Normalized relative to 650 nm (1/lambda^4)
    },
    green: {
      id: 'green',
      name: 'Green DPSS Laser',
      wavelengthNm: 532,
      color: '#22C55E',
      beamGlow: 'rgba(34, 197, 94, 0.85)',
      scatteringFactor: 2.23 // (650/532)^4 ≈ 2.23
    },
    blue: {
      id: 'blue',
      name: 'Violet-Blue Laser',
      wavelengthNm: 405,
      color: '#3B82F6',
      beamGlow: 'rgba(59, 130, 246, 0.90)',
      scatteringFactor: 6.61 // (650/405)^4 ≈ 6.61
    }
  }
};

window.TYNDALL_DATA = TYNDALL_DATA;
