/**
 * Kinetic Gas Laws — Thermodynamic Constants & Gas Species Dataset
 * Defines molar masses, van der Waals constants, root-mean-square speed equations,
 * and standard kinetic molecular theory parameters.
 */

const GAS_DATA = {
  R_ATM: 0.08206, // L * atm / (mol * K)
  R_JOULES: 8.314, // J / (mol * K)
  K_BOLTZMANN: 1.380649e-23, // J / K
  AVOGADRO: 6.02214e23,

  // Supported Gas Species
  species: {
    he: {
      id: 'he',
      name: 'Helium (He)',
      formula: 'He',
      molarMassG: 4.003, // g/mol
      color: '#38BDF8', // Sky Blue
      radius: 4,
      desc: 'Lightest noble gas. High velocity particles with fast diffusion rates.'
    },
    ne: {
      id: 'ne',
      name: 'Neon (Ne)',
      formula: 'Ne',
      molarMassG: 20.18, // g/mol
      color: '#F97316', // Orange
      radius: 5.5,
      desc: 'Moderate mass noble gas. Classic orange-red atomic discharge glow.'
    },
    ar: {
      id: 'ar',
      name: 'Argon (Ar)',
      formula: 'Ar',
      molarMassG: 39.95, // g/mol
      color: '#A855F7', // Purple
      radius: 7,
      desc: 'Abundant atmospheric noble gas. Significantly slower thermal velocities.'
    },
    kr: {
      id: 'kr',
      name: 'Krypton (Kr)',
      formula: 'Kr',
      molarMassG: 83.80, // g/mol
      color: '#10B981', // Emerald
      radius: 8.5,
      desc: 'Heavy noble gas illustrating Graham’s law of effusion and high inertia.'
    }
  },

  // Chamber Boundary Limits
  chamber: {
    minVolumeL: 5.0,
    maxVolumeL: 25.0,
    defaultVolumeL: 15.0,

    minTempK: 100.0, // -173.15 °C
    maxTempK: 750.0, // 476.85 °C
    defaultTempK: 300.0, // ~27 °C (room temp)

    minMoles: 0.20,
    maxMoles: 2.50,
    defaultMoles: 1.00
  },

  // Educational Presets for the 4 Classical Laws
  presets: [
    {
      id: 'boyle',
      name: "Boyle's Law (P ∝ 1/V)",
      constantParam: 'T',
      tempK: 300,
      volumeL: 12.0,
      moles: 1.0,
      gasId: 'he',
      desc: 'Isothermal expansion and compression: Pressure is inversely proportional to volume.'
    },
    {
      id: 'charles',
      name: "Charles's Law (V ∝ T)",
      constantParam: 'P',
      tempK: 250,
      volumeL: 10.0,
      moles: 1.0,
      gasId: 'ne',
      desc: 'Isobaric heating: Gas volume expands linearly with absolute temperature (K).'
    },
    {
      id: 'gay-lussac',
      name: "Gay-Lussac's Law (P ∝ T)",
      constantParam: 'V',
      tempK: 280,
      volumeL: 15.0,
      moles: 1.0,
      gasId: 'ar',
      desc: 'Isochoric heating: In a rigid fixed container, pressure rises directly with temperature.'
    },
    {
      id: 'avogadro',
      name: "Avogadro's Law (V ∝ n)",
      constantParam: 'P, T',
      tempK: 300,
      volumeL: 10.0,
      moles: 0.5,
      gasId: 'he',
      desc: 'Equal volumes of gases at the same temperature and pressure contain equal numbers of moles.'
    }
  ]
};

window.GAS_DATA = GAS_DATA;
