/**
 * CircuitLab — Interactive Wheatstone & Meter Bridge Simulation
 * State Management Module
 * Holds the single source of truth for circuit parameters, apparatus state, and UI.
 */

export const state = {
  // Primary mode: 'wheatstone' (Diamond schematic) | 'meterBridge' (Slide-wire bench)
  mode: 'wheatstone',

  // Classical Wheatstone Bridge Resistances (in Ohms)
  P: 100.0,
  Q: 100.0,
  R: 100.0,
  S: 100.0,

  // DC Power Supply
  voltage: 6.0,          // Volts
  rBat: 0.2,             // Battery internal resistance (Ohms)

  // Galvanometer Detector
  Rg: 50.0,              // Galvanometer coil resistance (Ohms)
  galvFSD: 300e-6,       // Full scale deflection current (300 microamps = 30 divisions)
  galvSensitivity: 'high', // 'high' (unshunted) | 'shunted' (shunted with 5 ohm protection resistor)

  // Keys & Contacts
  keyK1: true,           // Battery circuit key
  keyK2: true,           // Galvanometer circuit key
  jockeyTouching: true,  // Meter Bridge jockey contact

  // Meter Bridge Parameters
  jockeyPos: 50.0,       // Position l in cm (0.0 to 100.0 cm)
  meterWireResPerCm: 0.1, // 0.1 Ohm/cm -> 10 Ohm total bridge wire
  wireMaterial: 'constantan',
  unknownWireLength: 100.0, // cm (for resistivity experiment rho = X*pi*d^2 / 4L)
  unknownWireDiameter: 0.42, // mm (measured with screw gauge)
  endErrorA: 0.0,        // End error alpha at 0 cm (cm)
  endErrorC: 0.0,        // End error beta at 100 cm (cm)

  // Visual & Simulation Toggles
  showElectrons: true,
  showHeatmap: true,
  showCurrentLabels: true,
  showGrid: true,
  apparatusView: 'schematic', // 'schematic' | 'realistic' (for wheatstone mode)

  // Viewport & Zoom
  autoFit: true,
  panOffset: { x: 0, y: 0 },
  zoom: 1.0,

  // Interaction
  isDragging: null,      // 'jockey' | 'resistor' | 'pan'
  hoveredTarget: null,

  // Lab Notebook Observations
  observations: []
};

const listeners = new Set();

/**
 * Subscribe to state changes.
 * @param {Function} listener
 * @returns {Function} Unsubscribe function
 */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Update state and notify all listeners.
 * @param {Partial<typeof state>} updates
 */
export function setState(updates) {
  let changed = false;
  for (const [key, value] of Object.entries(updates)) {
    if (state[key] !== value) {
      state[key] = value;
      changed = true;
    }
  }
  if (changed) {
    for (const listener of listeners) {
      listener(state);
    }
  }
}

/**
 * Get current snapshot of the state.
 */
export function getState() {
  return { ...state };
}
