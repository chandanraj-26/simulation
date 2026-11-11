# Redox Titration & Permanganometry Virtual Laboratory (`/redox_titration_simulation`)

An interactive STEM analytical chemistry virtual laboratory for NCERT Class 11 & Class 12 Chemistry exploring quantitative permanganometry, self-indicating equivalence endpoints, Mohr's salt oxidation, and potentiometric Nernst curves.

## Key Features
- **Self-Indicating Permanganometry**: Standard $0.020\text{ M } \text{KMnO}_4$ reducing from deep violet $[{\text{MnO}_4}^-]$ to colorless $\text{Mn}^{2+}$ in acidic medium, with sharp permanent faint pink equivalence detection.
- **Stoichiometric Redox Reactions**:
  - Mohr's Salt: $5\text{Fe}^{2+} + \text{MnO}_4^- + 8\text{H}^+ \to 5\text{Fe}^{3+} + \text{Mn}^{2+} + 4\text{H}_2\text{O}$ ($1:5$ stoichiometry).
  - Oxalic Acid: $5(\text{COOH})_2 + 2\text{MnO}_4^- + 6\text{H}^+ \to 10\text{CO}_2\uparrow + 2\text{Mn}^{2+} + 8\text{H}_2\text{O}$ ($2:5$ stoichiometry at $60\text{–}70^\circ\text{C}$).
- **Interactive Laboratory Bench**: $50\text{ mL}$ glass burette with dark upper meniscus readouts, working multi-mode stopcock (Single Drop $+0.05\text{ mL}$, Slow Drip, Fast Stream), and magnetic stirrer hotplate with variable RPM, spinning Teflon bar, and liquid vortex.
- **Live Potentiometric Redox Curve**: Real-time Nernst cell potential ($E_{\text{cell}}$ vs. $V_{\text{titrant}}$) graph with dynamic operating radar tracking the sharp sigmoidal inflection at equivalence ($V_{\text{eq}}$).
- **Procedural Sound**: Web Audio drops, valve clicks, and celebratory harmonic chime on catching the true equivalence point.

## Running Locally
```bash
cd redox_titration_simulation
node server.js   # http://localhost:8125
```
Or open `index.html` directly in any modern browser.

