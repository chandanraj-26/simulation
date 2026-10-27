# Colloidal Sols Preparation & Hardy-Schulze Rule Virtual Laboratory

Interactive STEM surface chemistry simulation modeling the preparation of lyophobic ferric hydroxide ($\text{Fe(OH)}_3$) and lyophilic starch sols, Tyndall laser cone scattering, and coagulation kinetics governed by the Hardy-Schulze law.

## Pedagogical Objectives (NCERT Class 12 Chemistry Chapter 5 Surface Chemistry)
1. **Preparation of Ferric Hydroxide Sol ($\text{Fe(OH)}_3$)**:
   $$\text{FeCl}_3(aq) + 3\text{H}_2\text{O}(l) \xrightarrow{\text{boiling}} \text{Fe(OH)}_3\text{ (sol)} + 3\text{HCl}(aq)$$
   Preferential adsorption of $\text{Fe}^{3+}$ ions gives the colloidal sol particles a net positive charge ($[\text{Fe(OH)}_3]\text{Fe}^{3+} : 3\text{Cl}^-$), stabilizing the wine-red sol.
2. **Hardy-Schulze Rule of Coagulation**:
   - The coagulating power of an active ion is directly proportional to the $6^{\text{th}}$ power of its valency:
     $$\text{Coagulating Power} \propto z^6$$
   - For a positively charged sol ($\text{Fe(OH)}_3$): Coagulating power of anions increases dramatically with charge:
     $$\text{Cl}^- < \text{SO}_4^{2-} < \text{PO}_4^{3-} < [\text{Fe(CN)}_6]^{4-}$$
   - Coagulation Value (flocculation value in mmol/L) is inversely proportional to coagulating power.
3. **Tyndall Effect & Brownian Motion**:
   Light scattering in the colloidal dimension range ($1\text{–}1000\text{ nm}$) visualized with a green laser diode ($532\text{ nm}$).

## Running Locally
```bash
node server.js
# Access at http://localhost:8095
```
