/**
 * OpticsLab — Interactive Lens Simulation
 * State Management Module
 * Holds the single source of truth for the optical system and user interface.
 */

export const state = {
  // Lens properties
  lensType: 'convex',       // 'convex' | 'concave'
  focalLength: 20,          // Magnitude in cm (always positive in state; sign handled in optics.js)
  apertureHeight: 30,       // Diameter/aperture height in cm

  // Object Parameters
  objectDistance: -40,      // u in cm (always negative by Cartesian sign convention)
  objectHeight: 15,         // h_o in cm
  objectType: 'student',    // 'student' | 'candle' | 'arrow'

  // Ray & visualization toggles
  showRay1: true,           // Parallel ray -> focuses through F2 (convex) or diverges from F1 (concave)
  showRay2: true,           // Central ray through optical center O
  showRay3: true,           // Focal ray through F1 -> emerges parallel (convex) or towards F2 (concave)
  showVirtualRays: true,    // Dashed backwards extrapolation rays
  showLightCone: false,     // Full bundle of light filling the lens aperture
  showGrid: true,           // Subtle coordinate background grid
  showRuler: true,          // Optical bench cm scale
  showLabels: true,         // F1, 2F1, F2, 2F2, O badges
  animateRays: true,        // Flowing photon pulses along ray paths

  // Viewport & bench transform
  autoFit: true,            // Dynamically auto-fits and centers all diagram elements
  scale: 8,                 // Screen pixels per cm (optical bench zoom)
  originX: 0,               // Optical center X in canvas coords (calculated dynamically)
  originY: 0,               // Principal axis Y in canvas coords (calculated dynamically)
  panOffset: { x: 0, y: 0 },
  zoom: 1.0,

  // Interactive interaction state
  isDragging: null,         // 'object' | 'objectTip' | 'focus1' | 'focus2' | 'bench'
  hoveredTarget: null,      // Name of hovered interactive anchor

  // Active educational mode / preset
  activePreset: null,
  activeChallenge: null,
  challengeSolved: false
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
