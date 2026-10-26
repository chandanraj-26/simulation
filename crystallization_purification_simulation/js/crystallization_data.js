/**
 * crystallization_data.js
 * Steps, mass stoichiometry, and solubility parameters for CuSO4.5H2O.
 */

export const STAGES = [
  {
    id: 'stage_1',
    stepNumber: 1,
    title: 'Stage 1: Dissolution & Acidification',
    instruction: 'Dissolve 10.0 g of impure crude copper sulfate in 40 mL distilled water. Add 2 mL dilute H₂SO₄ to prevent hydrolysis of cupric ions into basic salts.',
    apparatus: 'beaker_stirrer'
  },
  {
    id: 'stage_2',
    stepNumber: 2,
    title: 'Stage 2: Hot Gravity Filtration',
    instruction: 'Filter the hot turbid solution through a conical glass funnel lined with fluted filter paper into an evaporating dish. Insoluble sand/clay is retained on paper.',
    apparatus: 'funnel_dish'
  },
  {
    id: 'stage_3',
    stepNumber: 3,
    title: 'Stage 3: Concentration to Crystallization Point',
    instruction: 'Evaporate the clear blue filtrate over a wire gauze until concentrated to 1/3 volume. Dip a glass rod and blow air — a thin crystalline crust confirms readiness.',
    apparatus: 'evaporating_dish_burner'
  },
  {
    id: 'stage_4',
    stepNumber: 4,
    title: 'Stage 4: Slow Undisturbed Cooling',
    instruction: 'Remove the dish from heat, cover with a clean watch glass, and allow it to cool slowly without disturbance. Large geometric crystals start to nucleate and grow.',
    apparatus: 'cooling_dish'
  },
  {
    id: 'stage_5',
    stepNumber: 5,
    title: 'Stage 5: Crystal Harvesting & Weighing',
    instruction: 'Decant the mother liquor. Collect the deep-blue sparkling triclinic CuSO₄·5H₂O crystals, dry them between sheets of filter paper, and determine percentage yield.',
    apparatus: 'crystals_filter_paper'
  }
];

export const SOLUBILITY_DATA = {
  at20C: 20.7, // g per 100g water
  at60C: 40.0,
  at100C: 75.4
};
