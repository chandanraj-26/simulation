/**
 * reaction_data.js
 * Surface area states, acid concentrations, and kinetic rate constants.
 */

export const PARTICLE_SIZES = [
  {
    id: 'chips',
    name: 'Large Marble Chips (Low Surface Area)',
    relativeSurfaceArea: 1.0,
    rateConstantK: 0.035, // Rate factor
    desc: 'Large cubic lumps; only outer surface contacts acid.'
  },
  {
    id: 'powder',
    name: 'Fine Marble Powder (High Surface Area)',
    relativeSurfaceArea: 8.5,
    rateConstantK: 0.18, // Much faster initial rate
    desc: 'Finely milled dust; colossal surface area exposed to H⁺ collisions.'
  }
];

export const CONCENTRATIONS = [
  { id: 0.5, label: '0.5 M Dilute HCl', factor: 0.5 },
  { id: 1.0, label: '1.0 M Standard HCl', factor: 1.0 },
  { id: 2.0, label: '2.0 M Concentrated HCl', factor: 2.0 }
];

export const TOTAL_CACO3_MASS_G = 5.0; // grams
export const MAX_CO2_VOLUME_ML = 60.0; // mL
