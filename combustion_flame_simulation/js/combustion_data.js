/**
 * combustion_data.js
 * Flame zones, thermal profiles, and fuel calorific values.
 */

export const FLAME_ZONES = [
  {
    id: 'outer',
    name: 'Outer Zone (Non-Luminous)',
    color: '#3B82F6',
    tempC: 1400,
    combustion: 'Complete Combustion',
    desc: 'Hottest zone. Ample oxygen supply allows complete oxidation of carbon to CO₂. Goldsmiths blow through this zone.'
  },
  {
    id: 'middle',
    name: 'Middle Zone (Luminous)',
    color: '#FBBF24',
    tempC: 1000,
    combustion: 'Partial / Incomplete Combustion',
    desc: 'Moderately hot. Insufficient oxygen leaves unburnt carbon particles glowing bright yellow. Deposits soot on a glass slide.'
  },
  {
    id: 'inner',
    name: 'Innermost Zone (Dark Zone)',
    color: '#1E293B',
    tempC: 600,
    combustion: 'No Combustion (Vaporization)',
    desc: 'Coolest zone. Contains unburnt wax vapor straight from the wick. Vapor can be ignited with a burning match.'
  }
];

export const AIR_SUPPLY_MODES = [
  { id: 'open', label: 'Case A: Free Air Ingress (Blocks Under Chimney)', airPercent: 100, flameState: 'steady' },
  { id: 'restricted', label: 'Case B: Restricted Air (Chimney Flat on Table)', airPercent: 20, flameState: 'flicker' },
  { id: 'sealed', label: 'Case C: Air Cut Off (Glass Plate Covering Chimney)', airPercent: 0, flameState: 'extinguished' }
];

export const FUELS = [
  { id: 'wood', name: 'Dry Wood', calorificKjKg: 20000, sootLevel: 'High', state: 'Solid' },
  { id: 'coal', name: 'Bituminous Coal', calorificKjKg: 30000, sootLevel: 'Very High', state: 'Solid' },
  { id: 'lpg', name: 'LPG (Butane/Propane)', calorificKjKg: 55000, sootLevel: 'Zero', state: 'Gas' },
  { id: 'h2', name: 'Hydrogen Gas', calorificKjKg: 150000, sootLevel: 'Zero (H₂O only)', state: 'Gas' }
];
