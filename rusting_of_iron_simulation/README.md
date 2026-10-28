# Conditions Necessary for Rusting of Iron & Prevention Virtual Lab

An interactive STEM virtual chemistry laboratory investigating the conditions required for the corrosion/rusting of iron and modern anti-corrosion techniques (CBSE Class 8 Chapter 4 / Class 10 Chapter 3).

## Key Features
- **NCERT 4-Test Tube Comparative Setup**:
  - **Tube A**: Iron nail in ordinary tap water exposed to atmospheric air (Both Air + Water present $\implies$ Heavy reddish-brown rust $\text{Fe}_2\text{O}_3 \cdot x\text{H}_2\text{O}$).
  - **Tube B**: Iron nail in boiled distilled water sealed with an airtight boiled linseed/oil layer (Water present, dissolved $\text{O}_2$ expelled, air excluded $\implies$ No rust).
  - **Tube C**: Iron nail in dry air with anhydrous calcium chloride ($\text{CaCl}_2$) drying agent sealed with rubber cork (Air present, moisture absorbed $\implies$ No rust).
  - **Tube D**: Iron nail in saline solution ($3.5\%\ \text{NaCl}$) with dissolved oxygen (Electrolyte ions accelerate electrochemical electron transfer $\implies$ Accelerated severe corrosion).
- **Anti-Corrosion Surface Protection Methods**:
  - **Galvanization**: Zinc layer acts as sacrificial anode ($E^\circ_{\text{Zn}^{2+}/\text{Zn}} = -0.76\text{ V}$ vs $E^\circ_{\text{Fe}^{2+}/\text{Fe}} = -0.44\text{ V}$).
  - **Oil/Grease Barrier Coating**: Hydrophobic seal excluding both $\text{H}_2\text{O}$ and $\text{O}_2$.
  - **Sacrificial Magnesium Ribbon**: Magnesium ribbon tightly coiled around iron nail.
  - **Potassium Ferricyanide Indicator Test**: Turnbull's Blue ($[\text{Fe}_3(\text{Fe(CN)}_6)_2]$) reveals active $\text{Fe}^{2+}$ dissolution, while pink phenolphthalein confirms cathodic $\text{OH}^-$ generation.
- **Microscopic Electrochemical Reaction Engine**:
  - Anodic oxidation: $\text{Fe}(s) \to \text{Fe}^{2+}(aq) + 2e^-$
  - Cathodic reduction: $\text{O}_2(g) + 2\text{H}_2\text{O}(l) + 4e^- \to 4\text{OH}^-(aq)$
  - Precipitation & Hydration: $4\text{Fe}^{2+} + \text{O}_2 + (4 + 2x)\text{H}_2\text{O} \to 2\text{Fe}_2\text{O}_3 \cdot x\text{H}_2\text{O}(s) + 8\text{H}^+$
- **Audio Feedback**: Procedural bubbling, cork popping, and test-tube glass clinks.
- **Soft Light-Blue Academic Aesthetics**: Zero external dependencies, responsive canvas layout.

## Running Locally
```bash
node server.js
# Access at http://localhost:8101
```
