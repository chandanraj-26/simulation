# Agarose Gel Electrophoresis & DNA Fingerprinting Virtual Laboratory (`/gel_electrophoresis_simulation`)

An interactive STEM biotechnology virtual laboratory for NCERT Class 12 Biology & AP Biology exploring horizontal agarose gel electrophoresis, molecular sieving, DNA ladder size calibration, UV transillumination, and forensic DNA fingerprinting.

## Key Features
- **Molecular Sieving Simulation**: Models electric field migration ($E = V/L$) through a 3D porous agarose mesh, demonstrating that migration distance is inversely proportional to the logarithm of fragment size ($d \propto 1 / \log_{10}(\text{bp})$).
- **6-Lane Experimental Setup**:
  - Lane 1: 1 kb DNA Molecular Weight Ladder ($500\text{–}10,000\text{ bp}$).
  - Lane 2: Crime Scene DNA Forensic Evidence.
  - Lanes 3–5: Suspects 1, 2, and 3 DNA profiling (demonstrating exact match for Suspect 2).
  - Lane 6: Plasmid restriction digest (uncut supercoiled vs. linearized double digest).
- **Dual Visual Modes**:
  - **Visible Light Mode**: Displays submerged loading wells, electrode electrolysis bubbling ($2\text{H}_2\text{O} \to 2\text{H}_2\uparrow + \text{O}_2\uparrow$), and blue tracking dyes (Bromophenol Blue and Xylene Cyanol).
  - **UV Transilluminator Mode**: Simulates $312\text{ nm}$ ultraviolet excitation of intercalated GelGreen / Ethidium Bromide dyes, illuminating vibrant fluorescent glowing green DNA bands in the dark chamber.
- **Interactive Band Reticle & Semi-Log Plot**: Hover over any DNA band to display exact base pair size and migration distance, with live semi-log calibration curve plotting $d$ vs $\log_{10}(\text{bp})$.
- **Procedural Sound**: Synthesizes DC power supply mains hum, UV ballast buzz, and band hover detection clicks via the Web Audio API.

## Running Locally
```bash
cd gel_electrophoresis_simulation
node server.js   # http://localhost:8127
```
Or open `index.html` directly in any modern browser.
