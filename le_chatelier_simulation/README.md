# Chemical Equilibrium & Le Chatelier's Principle Virtual Laboratory

Interactive STEM simulation modeling dynamic chemical equilibrium shifts under concentration perturbations and temperature alterations across Iron(III) Thiocyanate and Cobalt(II) Chloride coordination complexes.

## Pedagogical Objectives (NCERT Class 11 Chapter 7 Chemical Equilibrium)
1. **Le Chatelier's Principle**: When a system at equilibrium is subjected to a disturbance (change in concentration, temperature, or pressure), the equilibrium position shifts in the direction that counteracts the applied disturbance.
2. **Reversible Systems Investigated**:
   - **System 1: Iron(III) Thiocyanate Equilibrium**:
     $$\text{Fe}^{3+}(aq)\text{ (pale yellow)} + \text{SCN}^-(aq)\text{ (colorless)} \rightleftharpoons [\text{Fe(SCN)}]^{2+}(aq)\text{ (blood red)} \quad (\Delta H < 0)$$
     - Adding $\text{FeCl}_3$ or $\text{KSCN}$: Shifts forward (deepens blood-red color).
     - Adding $\text{H}_2\text{C}_2\text{O}_4$ (Oxalic acid): Complexation of $\text{Fe}^{3+}$ into stable $[\text{Fe(C}_2\text{O}_4)_3]^{3-}$ pulls equilibrium backward (solution turns yellow).
     - Adding $\text{AgNO}_3$: Precipitates $\text{AgSCN}\downarrow$, removing $\text{SCN}^-$, shifting backward.
   - **System 2: Cobalt(II) Hexaaqua / Tetrachloro Complex Equilibrium**:
     $$[\text{Co(H}_2\text{O})_6]^{2+}(aq)\text{ (pink, octahedral)} + 4\text{Cl}^-(aq) \rightleftharpoons [\text{CoCl}_4]^{2-}(aq)\text{ (deep blue, tetrahedral)} + 6\text{H}_2\text{O} \quad (\Delta H > 0\text{, endothermic})$$
     - Placing in Hot Water Bath ($>70^\circ\text{C}$): Endothermic forward shift $\to$ deep cobalt blue.
     - Placing in Ice Water Bath ($0^\circ\text{C}$): Exothermic reverse shift $\to$ delicate rosy pink.
     - Adding conc. $\text{HCl}$ or Acetone: Shifts forward to blue.
     - Adding distilled $\text{H}_2\text{O}$: Shifts reverse to pink.
3. **Interactive Features**:
   - 4-tube comparison rack (Reference standard + 3 test perturbation tubes).
   - Hot and Ice water immersion baths.
   - Live Spectrophotometer Transmittance/Absorbance optical meter.
   - Real-time molar concentration bar graphs ($[\text{Reactants}]$ vs $[\text{Products}]$).

## Running Locally
```bash
node server.js
# Access at http://localhost:8091
```
