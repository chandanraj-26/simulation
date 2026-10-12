# PhotosynthesisLab — Interactive Elodea Bubble Counter & Limiting Factors Simulator

An interactive biological laboratory simulation designed for Class 9–12 and AP Biology students. Explores cellular photosynthesis, water photolysis, oxygen bubble generation from aquatic Elodea/Hydrilla, the inverse square law of light ($I \propto 1/d^2$), Engelmann's action spectrum (White, Blue, Red vs Green light), dissolved carbon dioxide ($\text{NaHCO}_3$) saturation, temperature enzyme kinetics (optimum vs thermal denaturation), and chloroplast thylakoid reactions.

## Key Features
- **Apparatus Bench**:
  - Movable illuminating lamp with realistic light cone on a metric ruler bench.
  - Submerged *Elodea densa* waterweed sprig emitting streams of rising buoyant $O_2$ bubbles.
  - Inverted glass funnel and graduated collection tube accumulating oxygen gas volume ($V_{O_2}$ in mL).
  - Optical infrared bubble photogate sensor flashing on detection and incrementing counts.
- **Biophysics Engine**:
  - Light intensity governed by the inverse-square law $I = I_0 / (d / d_0)^2$.
  - Chlorophyll absorption coefficients: White (1.00), Blue 450nm (0.95), Red 660nm (0.88), Green 530nm (0.08 - Green light paradox).
  - Michaelis-Menten dissolved $\text{NaHCO}_3$ saturation curve.
  - Temperature bell curve with peak at ~28°C and rapid Rubisco enzyme denaturation above 40°C.
- **Modes**:
  - **Apparatus Bench**: Classic laboratory setup with live bubbling.
  - **Chloroplast View**: Thylakoid membrane water photolysis ($2\text{H}_2\text{O} \to \text{O}_2 + 4\text{H}^+ + 4e^-$), ATP synthase, and Calvin cycle.
  - **Kinetic Curves**: Real-time plot of Rate (BPM) vs. Lamp Distance.
- **Strict Light Theme**: Clean, bright, professional laboratory aesthetic with zero text clipping at 100% zoom.
- **Interactive Tools**:
  - Digital stopwatch with Start/Pause/Reset.
  - 5 Gamified Student Quests and comprehensive Theory modal.
  - Procedural Web Audio synthesizer for bubbles, lamp click, and fanfares.

## Local Running
```bash
cd d:\simulation\photosynthesis_simulation
python -m http.server 8094
```
Open [http://localhost:8094](http://localhost:8094) in your browser.
