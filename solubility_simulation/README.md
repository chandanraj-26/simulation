# Solubility Curves, Saturated Solutions & Crystallization Virtual Laboratory

An interactive STEM virtual chemistry laboratory simulation for Class 9 students exploring thermodynamic solubility equilibrium, temperature dependence ($S$ vs $T$), saturation states, and fractional crystallization purification based on **NCERT Class 9 Chapter 2 Activity 2.3 & 2.4**.

## Scientific Principles Modeled
- **Solubility Definition**: Maximum grams of solute soluble in $100\text{ g}$ of solvent ($\text{H}_2\text{O}$) at temperature $T$ to form a saturated solution.
- **Thermodynamic Behavior of 4 Classic Salts**:
  1. **Potassium Nitrate ($\text{KNO}_3$)**: Steep endothermic rise (from $13.3\text{ g}$ at $0^\circ\text{C}$ to $246\text{ g}$ at $100^\circ\text{C}$).
  2. **Sodium Chloride ($\text{NaCl}$)**: Nearly flat slope ($35.7\text{ g} \to 39.8\text{ g}$). Cannot be purified by cooling; requires complete evaporation.
  3. **Copper(II) Sulfate ($\text{CuSO}_4 \cdot 5\text{H}_2\text{O}$)**: Moderate positive slope yielding rich azure-blue triclinic gem-like crystals.
  4. **Cerium(III) Sulfate ($\text{Ce}_2(\text{SO}_4)_3$)**: Rare retrograde (inverse) solubility where dissolving is exothermic and heating causes precipitation!
- **Interactive Heating & Crystallization Apparatus**:
  - $250\text{ mL}$ borosilicate glass beaker with volume graduations on ceramic wire gauze and cast-iron tripod.
  - Adjustable Bunsen burner with realistic flame scaling ($20^\circ\text{C} \to 100^\circ\text{C}$).
  - Spatula dosing ($+5\text{ g}, +20\text{ g}$) with animated falling powder grains.
  - Undissolved solute sediment tracking at beaker bottom.
  - Suspended seed crystal growing sparkling geometric crystal clusters upon cooling a supersaturated solution.
- **Dynamic Phase Diagram ($S$ vs. $T$)**:
  - Real-time plotting of theoretical solubility curves.
  - Glowing live operating beacon $(T, m_{\text{added}})$.
  - Clear demarcations of **Unsaturated**, **Saturated**, and **Supersaturated** thermodynamic zones.

## How to Run
```bash
node server.js
```
Open [http://localhost:8077/](http://localhost:8077/) in any modern web browser.
