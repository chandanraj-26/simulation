# Chemical Equilibrium & Le Chatelier's Principle Virtual Laboratory (`/le_chatelier_simulation`)

An interactive STEM chemical equilibrium virtual laboratory for NCERT Class 11 Chemistry exploring Le Chatelier's principle, stress response to concentration and temperature disturbances, and spectrophotometric absorbance analysis.

## Key Features
- **Two Classical Reversible Equilibrium Systems**:
  - **Iron(III) Thiocyanate System**: $\text{Fe}^{3+} + \text{SCN}^- \rightleftharpoons [\text{Fe(SCN)}]^{2+}$ (exothermic, blood-red complex vs. pale yellow reactants).
  - **Cobalt(II) Chloro System**: $[\text{Co(H}_2\text{O})_6]^{2+} + 4\text{Cl}^- \rightleftharpoons [\text{CoCl}_4]^{2-} + 6\text{H}_2\text{O}$ (endothermic, pink octahedral hexaaqua vs. intense royal blue tetrahedral tetrachloro).
- **Interactive 4-Tube Laboratory Bench**:
  - Tube 1: Reference Control Standard.
  - Tube 2: Active Test Tube with chemical dropper additions ($\text{FeCl}_3$, $\text{KSCN}$, Oxalic Acid, $\text{AgNO}_3$, conc. $\text{HCl}$, water).
  - Tube 3: Hot Water Bath immersion ($80^\circ\text{C}$).
  - Tube 4: Ice Water Bath immersion ($0^\circ\text{C}$).
- **Digital Spectrophotometer Integration**: Click any of the 4 tubes to insert its cuvette into the collimated laser beam, displaying real-time Absorbance ($A$) and Transmittance ($\%T$).
- **Procedural Sound**: Reagent droplet sounds, ice clinks, hot water bath sizzle, and digital optical density beeps synthesized via the Web Audio API.

## Running Locally
```bash
cd le_chatelier_simulation
node server.js   # http://localhost:8130
```
Or open `index.html` directly in any modern browser.

