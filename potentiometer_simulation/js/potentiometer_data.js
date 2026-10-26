/**
 * Potentiometer Bench Electrical Constants & Cells Data
 */

export const CELLS = {
  leclanche: {
    id: 'leclanche',
    name: 'Leclanché Cell (E₁)',
    emf: 1.45, // Volts
    internalResistance: 1.8, // Ohms
    description: 'Carbon-zinc primary cell with MnO2 depolarizer.'
  },
  daniell: {
    id: 'daniell',
    name: 'Daniell Cell (E₂)',
    emf: 1.08, // Volts
    internalResistance: 1.2, // Ohms
    description: 'Zn-Cu cell with constant 1.08 V EMF.'
  }
};

export const BENCH_CONFIG = {
  wireCount: 4,
  wireLengthPerSegmentCm: 100, // 100 cm per segment = 400 cm total
  driverEmf: 2.0, // 2.0 V Lead accumulator
  rheostatResistance: 5.0, // adjustable
  wireResistancePerMeter: 4.0 // 4 ohms/m -> total wire resistance = 16 ohms
};
