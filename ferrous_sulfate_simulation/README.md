# Thermal Decomposition of Ferrous Sulfate Crystals Virtual Lab

A high-fidelity, zero-dependency interactive STEM virtual laboratory simulating **Class 10 NCERT Chemistry Chapter 1: "Chemical Reactions and Equations" (Activity 1.5)**.

## Curriculum Mapping
- **Class**: 10th Grade (CBSE / NCERT / State Boards / IGCSE)
- **Subject**: Chemistry / Science
- **Chapter**: Chapter 1: Chemical Reactions and Equations
- **Activity**: **Activity 1.5**: Heating ferrous sulfate crystals ($\text{FeSO}_4 \cdot 7\text{H}_2\text{O}$) in a dry boiling tube and observing color changes, water condensation, gas smell, and litmus paper reaction.

## Core Chemical Principles & Stages
1. **Stage 1: Dehydration (Water of Crystallization Loss)**:
   $$\text{FeSO}_4 \cdot 7\text{H}_2\text{O}(s)\ [\text{Pale Green}] \xrightarrow{\sim 100\text{–}300^\circ\text{C}} \text{FeSO}_4(s)\ [\text{Dirty White Anhydrous}] + 7\text{H}_2\text{O}(g)$$
   - Color shifts from pale green (green vitriol) to dirty white.
   - Tiny droplets of condensed water form on the cooler upper walls of the boiling tube.
2. **Stage 2: Strong Thermal Decomposition**:
   $$2\text{FeSO}_4(s)\ [\text{Dirty White}] \xrightarrow{> 500^\circ\text{C}} \text{Fe}_2\text{O}_3(s)\ [\text{Reddish-Brown Solid Residue}] + \text{SO}_2(g) + \text{SO}_3(g)$$
   - Decomposition into solid ferric oxide ($\text{Fe}_2\text{O}_3$) residue.
   - Evolution of two acidic, suffocating gases: sulfur dioxide ($\text{SO}_2$) and sulfur trioxide ($\text{SO}_3$).
3. **Chemical Identification Tests**:
   - **Moist Blue Litmus Paper Test**:
     Turns from **Blue to Red** rapidly upon contact with the evolving sulfur oxide fumes ($\text{SO}_2 + \text{H}_2\text{O} \to \text{H}_2\text{SO}_3$).
   - **Acidified Potassium Dichromate ($\text{K}_2\text{Cr}_2\text{O}_7$) Strip**:
     Turns from **Orange to Green** ($\text{Cr}^{3+}$) due to the strong reducing action of $\text{SO}_2$:
     $$\text{K}_2\text{Cr}_2\text{O}_7 + \text{H}_2\text{SO}_4 + 3\text{SO}_2 \to \text{K}_2\text{SO}_4 + \text{Cr}_2(\text{SO}_4)_3 + \text{H}_2\text{O}$$
4. **NCERT Laboratory Safety Precautions**:
   - Clamped boiling tube with safety $45^\circ$ angle pointing away from the experimenter and neighbors.
   - Wafting technique: gently waving fumes towards the nose to safely detect the pungent odor of burning sulfur.
5. **Analytical Stoichiometry Ledger**:
   - Real-time mass balance calculation tracking initial mass ($2.000\text{ g}$), water of crystallization lost ($0.906\text{ g}$), acidic gas evolved ($0.518\text{ g}$), and $\text{Fe}_2\text{O}_3$ residue remaining ($0.575\text{ g}$).

## Running Locally
```bash
node server.js
```
The lab is available at `http://localhost:8075/`.
