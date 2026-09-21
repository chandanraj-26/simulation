/**
 * ArchimedesLab — Interactive Archimedes' Principle & Buoyancy Simulation
 * State Management Module
 * Single source of truth for fluid parameters, immersed objects, simulation modes, and telemetry.
 */

export const FLUID_PRESETS = {
  water: { name: 'Fresh Water', density: 1000.0, color: 'rgba(56, 189, 248, 0.45)', surfaceColor: '#0284c7' },
  saltwater: { name: 'Sea Water (3.5% Salinity)', density: 1025.0, color: 'rgba(14, 165, 233, 0.50)', surfaceColor: '#0369a1' },
  deadsea: { name: 'Dead Sea (Hyper-Saline)', density: 1240.0, color: 'rgba(20, 184, 166, 0.55)', surfaceColor: '#0d9488' },
  oil: { name: 'Olive Oil', density: 920.0, color: 'rgba(234, 179, 8, 0.45)', surfaceColor: '#ca8a04' },
  alcohol: { name: 'Ethyl Alcohol', density: 789.0, color: 'rgba(224, 231, 255, 0.35)', surfaceColor: '#818cf8' },
  glycerin: { name: 'Glycerin', density: 1260.0, color: 'rgba(244, 114, 182, 0.45)', surfaceColor: '#db2777' },
  mercury: { name: 'Liquid Mercury', density: 13600.0, color: 'rgba(148, 163, 184, 0.85)', surfaceColor: '#64748b' }
};

export const MATERIAL_PRESETS = {
  gold: { name: 'Pure Gold (Au)', density: 19300.0, color: '#eab308', stroke: '#ca8a04', category: 'metal' },
  lead: { name: 'Lead (Pb)', density: 11340.0, color: '#64748b', stroke: '#475569', category: 'metal' },
  iron: { name: 'Iron / Steel', density: 7870.0, color: '#94a3b8', stroke: '#475569', category: 'metal' },
  aluminum: { name: 'Aluminum (Al)', density: 2700.0, color: '#cbd5e1', stroke: '#94a3b8', category: 'metal' },
  crown_pure: { name: "King Hiero's Pure Gold Crown", density: 19300.0, color: '#facc15', stroke: '#d97706', category: 'crown' },
  crown_fake: { name: 'Adulterated Crown (Gold-Silver Alloy)', density: 13800.0, color: '#e2e8f0', stroke: '#d97706', category: 'crown' },
  ice: { name: 'Glacial Ice', density: 917.0, color: 'rgba(224, 242, 254, 0.85)', stroke: '#38bdf8', category: 'floating' },
  wood_oak: { name: 'Oak Hardwood', density: 750.0, color: '#a16207', stroke: '#713f12', category: 'wood' },
  wood_pine: { name: 'Pine Softwood', density: 500.0, color: '#d97706', stroke: '#b45309', category: 'wood' },
  cork: { name: 'Natural Cork', density: 240.0, color: '#b45309', stroke: '#78350f', category: 'floating' },
  boat: { name: 'Cargo Barge Hull', density: 280.0, color: '#0284c7', stroke: '#0369a1', category: 'boat' }
};

export const GRAVITY_PRESETS = {
  earth: { name: 'Earth (9.81 m/s²)', g: 9.81 },
  moon: { name: 'Moon (1.62 m/s²)', g: 1.62 },
  mars: { name: 'Mars (3.71 m/s²)', g: 3.71 },
  jupiter: { name: 'Jupiter (24.79 m/s²)', g: 24.79 },
  zero: { name: 'Zero-G Space (0.00 m/s²)', g: 0.0 }
};

export const state = {
  // Active laboratory mode: 'eureka' (Displacement & Overflow) | 'pressure' (Hydrostatic Vectors & FBD) | 'flotation' (Freely floating & Crown mystery)
  mode: 'eureka',

  // Fluid Properties
  fluidType: 'water',
  fluidDensity: 1000.0,      // kg/m³

  // Immersed Object Properties
  materialType: 'iron',
  objectDensity: 7870.0,     // kg/m³
  objectShape: 'cylinder',   // 'cube' | 'cylinder' | 'sphere' | 'crown' | 'boat'
  objectVolumeCm3: 500.0,    // cm³ (500 cm³ = 0.0005 m³)
  objectHeightCm: 10.0,      // cm (used for hydrostatic pressure differential)

  // Submersion position
  // 0% = completely out in air hanging above fluid
  // 100% = fully submerged inside fluid
  // For 'flotation' mode, equilibrium depth is dynamically simulated with spring/buoyant balance
  submersionPct: 50.0,       // 0 to 100%

  // Gravity
  gravityKey: 'earth',
  g: 9.81,                   // m/s²

  // Boat Cargo (in grams) for boat mode
  boatCargoMassGrams: 0.0,

  // Visual Overlays & Physics Toggles
  showPressureVectors: true,
  showFBD: true,
  showGrid: true,
  showDisplacedFlow: true,
  animateWaves: true,
  isExpandedCanvas: false,

  // Draggable Interaction
  isDragging: null,          // 'object' | 'winch' | 'cargo'
  dragStartY: 0,
  dragStartSubmersion: 0,

  // Lab Notebook Observations
  observations: [],

  // Overflow beaker state
  overflowCaughtCm3: 250.0,  // Displaced fluid poured into catch beaker
  isPouring: false
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
