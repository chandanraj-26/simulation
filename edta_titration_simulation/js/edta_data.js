/**
 * Water Hardness & Complexometric Chemistry Dataset
 */

export const WATER_SAMPLES = {
  tap_water: {
    id: 'tap_water',
    name: 'Municipal Tap Water',
    expectedHardnessPpm: 240, // ppm CaCO3
    sampleVolumeMl: 50.0,
    calciumMgL: 65,
    magnesiumMgL: 19,
    description: 'Moderately hard drinking water from municipal supply.'
  },
  groundwater: {
    id: 'groundwater',
    name: 'Deep Borewell Groundwater',
    expectedHardnessPpm: 480, // ppm CaCO3
    sampleVolumeMl: 50.0,
    calciumMgL: 130,
    magnesiumMgL: 38,
    description: 'Hard water extracted from limestone and dolomite aquifers.'
  },
  boiled_water: {
    id: 'boiled_water',
    name: 'Boiled Tap Water (Permanent Hardness)',
    expectedHardnessPpm: 120, // ppm CaCO3
    sampleVolumeMl: 50.0,
    calciumMgL: 32,
    magnesiumMgL: 10,
    description: 'Bicarbonates precipitated as insoluble CaCO3; only permanent sulfate/chloride hardness remains.'
  }
};

export const TITRANT = {
  name: 'Standard Disodium EDTA Solution',
  formula: 'Na2H2Y·2H2O',
  molarity: 0.01, // 0.01 M
  color: 'rgba(255, 255, 255, 0.2)' // clear colorless liquid
};
