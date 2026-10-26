/**
 * meter_bridge_data.js
 * Wire materials, standard resistance box values, scalable bridge wire lengths, and physical presets.
 */

export const UNKNOWN_WIRES = [
  {
    id: 'nichrome',
    name: 'Nichrome Wire Coil',
    trueResistance: 4.80, // Ohms
    trueResistivity: 1.10e-6, // Ohm*m
    wireLengthCm: 50.0,
    wireDiameterMm: 0.38
  },
  {
    id: 'constantan',
    name: 'Constantan Wire Coil',
    trueResistance: 3.12, // Ohms
    trueResistivity: 4.9e-7, // Ohm*m
    wireLengthCm: 60.0,
    wireDiameterMm: 0.35
  },
  {
    id: 'manganin',
    name: 'Manganin Wire Coil',
    trueResistance: 6.40, // Ohms
    trueResistivity: 4.8e-7, // Ohm*m
    wireLengthCm: 80.0,
    wireDiameterMm: 0.31
  },
  {
    id: 'copper',
    name: 'Copper Thin Coil',
    trueResistance: 1.25, // Ohms
    trueResistivity: 1.68e-8, // Ohm*m
    wireLengthCm: 150.0,
    wireDiameterMm: 0.45
  }
];

export const WIRE_LENGTH_PRESETS = [
  { lengthCm: 100, label: '100 cm (1.0 m - Standard NCERT Bridge)' },
  { lengthCm: 200, label: '200 cm (2.0 m - Extended High-Sensitivity)' },
  { lengthCm: 400, label: '400 cm (4.0 m - 4-Wire Precision Bench)' },
  { lengthCm: 1000, label: '1000 cm (10.0 m - Metrology Grade Calibration)' }
];

export const RESISTANCE_BOX_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15];

export const EXPERIMENT_STEPS = [
  {
    title: '1. Scale Bridge Wire Length',
    desc: 'Choose between 100 cm standard, 200 cm, 400 cm, or 1000 cm. Longer bridge wires provide smaller least counts and vastly higher experimental sensitivity.'
  },
  {
    title: '2. Connect & Adjust Resistance Box R',
    desc: 'Select a standard resistance R so the null point l falls comfortably near the central 40% - 60% zone.'
  },
  {
    title: '3. Slide Jockey to Find Null Point',
    desc: 'Slide the jockey along the calibrated wire. Find where galvanometer deflection is exactly 0 div.'
  },
  {
    title: '4. Calculate Resistance X & Resistivity ρ',
    desc: 'Apply X = R * (L_wire - l) / l, then determine material resistivity ρ = X * π * r² / L.'
  }
];
