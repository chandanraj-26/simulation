/**
 * diffraction_data.js
 * Laser presets, optical constants, and theoretical presets for Fraunhofer diffraction.
 */

export const LASER_PRESETS = [
  { id: 'red', name: 'He-Ne / Red Diode', wavelengthNm: 650, colorHex: '#EF4444', rgb: [239, 68, 68] },
  { id: 'green', name: 'DPSS Green', wavelengthNm: 532, colorHex: '#10B981', rgb: [16, 185, 129] },
  { id: 'blue', name: 'InGaN Violet-Blue', wavelengthNm: 405, colorHex: '#6366F1', rgb: [99, 102, 241] },
  { id: 'yellow', name: 'Sodium D-Line', wavelengthNm: 589, colorHex: '#F59E0B', rgb: [245, 158, 11] }
];

export const SLIT_PRESETS = [
  { id: 'narrow', label: 'Narrow Slit (0.04 mm)', widthMm: 0.04 },
  { id: 'standard', label: 'Standard Slit (0.10 mm)', widthMm: 0.10 },
  { id: 'wide', label: 'Wide Slit (0.24 mm)', widthMm: 0.24 },
  { id: 'custom', label: 'Micrometer Manual', widthMm: 0.12 }
];

export const EXPERIMENT_QUESTS = [
  {
    id: 'quest_1',
    title: '1. Observe Central Maximum Spread',
    goal: 'Increase the slit width from 0.04 mm to 0.20 mm. Observe how the central peak narrows as slit width increases (inverse relationship: 2λD/a).'
  },
  {
    id: 'quest_2',
    title: '2. Wavelength Dependence',
    goal: 'Switch between Red (650 nm) and Blue (405 nm). Verify that longer wavelengths produce wider diffraction fringes for the same slit.'
  },
  {
    id: 'quest_3',
    title: '3. Photometer Probe Scan',
    goal: 'Drag the photometer probe across the screen to locate the 1st dark fringe (minimum) where intensity drops to 0.'
  }
];
