/**
 * salt_engine.js
 * Evaluates systematic qualitative reactions and observations.
 */

import { PRESET_SALTS } from './salt_data.js';

export class SaltEngine {
  constructor(activeSalt = PRESET_SALTS[0]) {
    this.activeSalt = activeSalt;
    this.currentReagent = null;
    this.reactionActive = false;
  }

  setSalt(salt) {
    this.activeSalt = salt;
    this.currentReagent = null;
    this.reactionActive = false;
  }

  applyReagent(reagentId) {
    this.currentReagent = reagentId;
    this.reactionActive = true;
    return this.evaluateResult(reagentId);
  }

  evaluateResult(reagentId) {
    const cation = this.activeSalt.cation;
    const anion = this.activeSalt.anion;

    // 1. Dilute H2SO4 test for Anions
    if (reagentId === 'dil_h2so4') {
      if (anion === 'CO3') {
        return {
          observation: 'Brisk effervescence with rapid evolution of colorless, odorless CO₂ gas.',
          inference: 'Carbonate ion (CO₃²⁻) confirmed. (CO₂ turns lime water milky).',
          color: 'rgba(255, 255, 255, 0.85)',
          hasBubbles: true,
          precipitate: false
        };
      }
      return {
        observation: 'No brisk effervescence observed in cold or upon mild heating.',
        inference: 'Dilute H₂SO₄ group anions (CO₃²⁻, S²⁻, SO₃²⁻) absent.',
        color: 'rgba(241, 245, 249, 0.4)',
        hasBubbles: false,
        precipitate: false
      };
    }

    // 2. AgNO3 test for Halides
    if (reagentId === 'agno3') {
      if (anion === 'Cl') {
        return {
          observation: 'Dense curdy white precipitate formed, completely soluble in excess NH₄OH.',
          inference: 'Chloride ion (Cl⁻) confirmed: Ag⁺ + Cl⁻ → AgCl↓ (white).',
          color: '#FFFFFF',
          hasBubbles: false,
          precipitate: true
        };
      }
      return {
        observation: 'No white curdy precipitate formed.',
        inference: 'Chloride (Cl⁻) absent.',
        color: 'rgba(241, 245, 249, 0.4)',
        hasBubbles: false,
        precipitate: false
      };
    }

    // 3. BaCl2 test for Sulfate
    if (reagentId === 'bacl2') {
      if (anion === 'SO4') {
        return {
          observation: 'Heavy, dense white precipitate formed instantly, completely insoluble in conc. HCl.',
          inference: 'Sulfate ion (SO₄²⁻) confirmed: Ba²⁺ + SO₄²⁻ → BaSO₄↓.',
          color: '#F8FAFC',
          hasBubbles: false,
          precipitate: true
        };
      }
      return {
        observation: 'Solution remains clear with no precipitate.',
        inference: 'Sulfate (SO₄²⁻) absent.',
        color: 'rgba(241, 245, 249, 0.4)',
        hasBubbles: false,
        precipitate: false
      };
    }

    // 4. Nessler's Reagent for Group 0 Cation (NH4+)
    if (reagentId === 'nessler') {
      if (cation === 'NH4') {
        return {
          observation: 'Dense reddish-brown precipitate formed immediately.',
          inference: 'Ammonium cation (NH₄⁺) confirmed: Iodide of Millon\'s base formed.',
          color: '#9A3412', // Rich reddish-brown
          hasBubbles: false,
          precipitate: true
        };
      }
      return {
        observation: 'No brown precipitate formed.',
        inference: 'Ammonium radical (NH₄⁺) absent.',
        color: 'rgba(241, 245, 249, 0.4)',
        hasBubbles: false,
        precipitate: false
      };
    }

    // 5. NH4OH for Group II Cu2+
    if (reagentId === 'nh4oh') {
      if (cation === 'Cu') {
        return {
          observation: 'Pale blue precipitate dissolved in excess NH₄OH to produce an intense, magnificent deep Royal Blue solution.',
          inference: 'Copper(II) cation (Cu²⁺) confirmed: Tetraamminecopper(II) complex [Cu(NH₃)₄]²⁺.',
          color: '#1D4ED8', // Royal blue
          hasBubbles: false,
          precipitate: false
        };
      }
      return {
        observation: 'No deep blue complexation observed.',
        inference: 'Copper(II) absent.',
        color: 'rgba(241, 245, 249, 0.4)',
        hasBubbles: false,
        precipitate: false
      };
    }

    // 6. Potassium Ferrocyanide for Group III Fe3+
    if (reagentId === 'k4fecn6') {
      if (cation === 'Fe') {
        return {
          observation: 'Intense Prussian Blue precipitate/colloidal suspension formed instantly.',
          inference: 'Ferric ion (Fe³⁺) confirmed: Fe₄[Fe(CN)₆]₃ (Prussian Blue).',
          color: '#0C4A6E', // Deep prussian blue
          hasBubbles: false,
          precipitate: true
        };
      }
      return {
        observation: 'No Prussian Blue color observed.',
        inference: 'Ferric ion (Fe³⁺) absent.',
        color: 'rgba(241, 245, 249, 0.4)',
        hasBubbles: false,
        precipitate: false
      };
    }

    // 7. Flame Platinum Wire Test
    if (reagentId === 'flame') {
      if (cation === 'Ba') {
        return {
          observation: 'Persistent grassy Apple-Green flame color when viewed with naked eye.',
          inference: 'Barium ion (Ba²⁺) confirmed by characteristic atomic emission.',
          color: '#84CC16', // Apple green
          hasBubbles: false,
          precipitate: false,
          isFlame: true
        };
      } else if (cation === 'Cu') {
        return {
          observation: 'Non-luminous Bunsen flame imparted a vivid emerald green / bluish-green hue.',
          inference: 'Copper (Cu²⁺) confirmed by flame test.',
          color: '#10B981',
          hasBubbles: false,
          precipitate: false,
          isFlame: true
        };
      }
      return {
        observation: 'No characteristic colored flame imparted.',
        inference: 'Flame test non-responsive for this cation.',
        color: '#F59E0B',
        hasBubbles: false,
        precipitate: false,
        isFlame: true
      };
    }

    return {
      observation: 'No reaction observed.',
      inference: 'Negative test.',
      color: 'rgba(241, 245, 249, 0.4)',
      hasBubbles: false,
      precipitate: false
    };
  }
}
