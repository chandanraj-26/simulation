/**
 * Paper Chromatography Dataset & Chemical Constants
 * NCERT Class 9 Chapter 2 & Class 11 Chemistry Practical
 */

export const SAMPLES = {
  spinach: {
    id: 'spinach',
    name: 'Spinach Chloroplast Extract',
    description: 'Fresh Spinacia oleracea leaf extract in acetone/petroleum ether',
    recommendedSolvent: 'pet_ether_acetone',
    spotColor: '#2d6a4f',
    initialSpotRadius: 6,
    pigments: [
      {
        id: 'carotene',
        name: 'β-Carotene',
        formula: 'C40H56',
        color: '#ff9e00',
        colorRgba: 'rgba(255, 158, 0, 0.88)',
        rf: 0.94,
        diffusionRate: 1.2,
        notes: 'Hydrocarbon carotenoid with no polar oxygen groups; highest solubility in nonpolar solvent front.'
      },
      {
        id: 'xanthophyll',
        name: 'Xanthophyll (Lutein)',
        formula: 'C40H56O2',
        color: '#ffd166',
        colorRgba: 'rgba(255, 209, 102, 0.88)',
        rf: 0.72,
        diffusionRate: 1.0,
        notes: 'Oxygenated carotenoid with two hydroxyl (-OH) groups forming mild hydrogen bonds with cellulose.'
      },
      {
        id: 'chlorophyll_a',
        name: 'Chlorophyll a',
        formula: 'C55H72MgN4O5',
        color: '#06d6a0',
        colorRgba: 'rgba(6, 214, 160, 0.90)',
        rf: 0.58,
        diffusionRate: 0.9,
        notes: 'Primary photosynthetic pigment with central Mg²⁺ porphyrin ring and nonpolar phytol tail.'
      },
      {
        id: 'chlorophyll_b',
        name: 'Chlorophyll b',
        formula: 'C55H70MgN4O6',
        color: '#38b000',
        colorRgba: 'rgba(56, 176, 0, 0.90)',
        rf: 0.42,
        diffusionRate: 0.8,
        notes: 'Contains a polar formyl (-CHO) group replacing -CH₃, creating stronger adsorption to cellulose.'
      }
    ]
  },
  black_ink: {
    id: 'black_ink',
    name: 'Water-Soluble Black Marker Ink',
    description: 'Commercial synthetic dye mixture in water/alcohol base',
    recommendedSolvent: 'water_ethanol',
    spotColor: '#1a1a2e',
    initialSpotRadius: 7,
    pigments: [
      {
        id: 'cyan_dye',
        name: 'Cyan Synthetic Dye',
        formula: 'C32H16CuN8',
        color: '#00b4d8',
        colorRgba: 'rgba(0, 180, 216, 0.88)',
        rf: 0.82,
        diffusionRate: 1.1,
        notes: 'High solubility in mobile phase, minimal interaction with paper fibers.'
      },
      {
        id: 'magenta_dye',
        name: 'Magenta / Rhodamine Dye',
        formula: 'C28H31ClN2O3',
        color: '#f72585',
        colorRgba: 'rgba(247, 37, 133, 0.88)',
        rf: 0.54,
        diffusionRate: 0.95,
        notes: 'Intermediate polarity and partition coefficient.'
      },
      {
        id: 'yellow_dye',
        name: 'Tartrazine Yellow Dye',
        formula: 'C16H9N4Na3O9S2',
        color: '#ffb703',
        colorRgba: 'rgba(255, 183, 3, 0.90)',
        rf: 0.28,
        diffusionRate: 0.75,
        notes: 'Sulfonate groups interact strongly with polar cellulose fibers via electrostatic and H-bonding.'
      }
    ]
  },
  hibiscus: {
    id: 'hibiscus',
    name: 'Red Hibiscus Petal Extract',
    description: 'Ethanolic extract of Hibiscus rosa-sinensis petals',
    recommendedSolvent: 'water_ethanol',
    spotColor: '#9d0208',
    initialSpotRadius: 6,
    pigments: [
      {
        id: 'flavonol',
        name: 'Quercetin Flavonols',
        formula: 'C15H10O7',
        color: '#f4a261',
        colorRgba: 'rgba(244, 162, 97, 0.88)',
        rf: 0.85,
        diffusionRate: 1.0,
        notes: 'Flavonoid antioxidant migrating rapidly near solvent front.'
      },
      {
        id: 'anthocyanin',
        name: 'Cyanidin-3-sophoroside',
        formula: 'C27H31O16⁺',
        color: '#d00000',
        colorRgba: 'rgba(208, 0, 0, 0.90)',
        rf: 0.46,
        diffusionRate: 0.85,
        notes: 'Water-soluble vacuolar anthocyanin pigment with pH-dependent coloration.'
      }
    ]
  }
};

export const SOLVENTS = {
  pet_ether_acetone: {
    id: 'pet_ether_acetone',
    name: 'Petroleum Ether : Acetone (9:1 v/v)',
    description: 'Standard non-polar organic solvent system for plant pigment resolution',
    viscosity: 0.32, // mPa.s
    surfaceTension: 20.5, // mN/m
    capillarySpeedFactor: 1.25,
    recommendedFor: 'spinach'
  },
  water_ethanol: {
    id: 'water_ethanol',
    name: 'Water : Ethanol (1:1 v/v)',
    description: 'Polar solvent mixture ideal for hydrophilic dyes and anthocyanins',
    viscosity: 1.85, // mPa.s
    surfaceTension: 32.0, // mN/m
    capillarySpeedFactor: 0.85,
    recommendedFor: 'black_ink'
  },
  pure_water: {
    id: 'pure_water',
    name: 'Distilled Water (100%)',
    description: 'Highly polar aqueous mobile phase',
    viscosity: 1.00,
    surfaceTension: 72.8,
    capillarySpeedFactor: 0.95,
    recommendedFor: 'hibiscus'
  }
};
