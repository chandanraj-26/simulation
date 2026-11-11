# Paper & Thin-Layer Chromatography Virtual Laboratory

A physically and biochemically rigorous virtual laboratory simulating ascending paper and thin-layer chromatography (TLC). The simulation models Lucas-Washburn capillary ascent kinetics and differential solute partition dynamics across polar cellulose stationary phases and organic mobile phases.

## Scientific Features

- **Biophysical Capillary Ascent:**
  - Implements the Lucas-Washburn equation:
    $$h(t) = \sqrt{\frac{\gamma \cdot r \cdot \cos\theta}{2\eta} \cdot t}$$
  - Dynamic viscous drag slows front velocity as the solvent front ascends.
- **Multicomponent Sample Systems:**
  1. **Spinach Chloroplast Extract (*Spinacia oleracea*):**
     - $\beta$-Carotene ($R_f \approx 0.94$, yellow-orange, non-polar hydrocarbon).
     - Xanthophyll ($R_f \approx 0.72$, yellow, dihydroxy carotenoid).
     - Chlorophyll $a$ ($R_f \approx 0.58$, blue-green, porphyrin ring).
     - Chlorophyll $b$ ($R_f \approx 0.42$, yellow-green, polar formyl substituent).
  2. **Water-Soluble Felt-Tip Ink:**
     - Fast Cyan Dye ($R_f \approx 0.83$).
     - Magenta Dye ($R_f \approx 0.54$).
     - Tartrazine Yellow ($R_f \approx 0.28$).
  3. **Amino Acid Mixture:**
     - Leucine ($R_f \approx 0.74$, hydrophobic branched).
     - Alanine ($R_f \approx 0.39$, neutral).
     - Glycine ($R_f \approx 0.26$, high polarity).
     - Ninhydrin reagent spray button triggering Ruhemann's purple complex visualization.
- **Interactive Measurement Tools:**
  - Draggable transparent millimeter/centimeter acrylic ruler for measuring $d_{\text{solute}}$ and $d_{\text{solvent}}$.
  - Real-time retardation factor ($R_f$) telemetry table.
  - Procedural capillary wicking sound synthesis via Web Audio API.

## Running Locally

```bash
cd chromatography_simulation
node server.js
```
Open [http://localhost:8131](http://localhost:8131) in any modern web browser.
