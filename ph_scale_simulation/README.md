# pH Scale, Dilution & Universal Indicator Virtual Laboratory (`/ph_scale_simulation`)

An interactive STEM chemistry virtual laboratory for NCERT Class 10 & Class 11 Chemistry exploring Sørensen's pH scale, thermodynamic auto-ionization ($K_w = 1.0 \times 10^{-14}$), logarithmic hydronium and hydroxide concentration kinetics, and dynamic dilution.

## Key Features
- **13 Prototypical Solution Samples**: Battery acid ($0.5\text{ M } \text{H}_2\text{SO}_4$, $\text{pH } 0.7$), stomach gastric juice ($\text{pH } 1.5$), lemon juice ($\text{pH } 2.3$), vinegar ($\text{pH } 2.8$), coffee ($\text{pH } 5.0$), pure water ($\text{pH } 7.0$), human blood ($\text{pH } 7.4$), baking soda ($\text{pH } 8.4$), milk of magnesia ($\text{pH } 10.5$), household ammonia ($\text{pH } 11.5$), bleach ($\text{pH } 12.5$), and drain cleaner ($1.0\text{ M } \text{NaOH}$, $\text{pH } 13.5$).
- **Continuous Universal Indicator Color Engine**: Continuous color interpolation mapping continuous pH ($0.0 \to 14.0$) into realistic indicator shades (deep red $\to$ orange $\to$ yellow $\to$ green $\to$ blue $\to$ purple).
- **Interactive Water Faucet & Bottom Drain**: Press-and-hold water faucet pours distilled water to dilute the solution, asymptotic towards $\text{pH } 7.0$. Drain valve empties volume.
- **Draggable pH Sensor Wand**: Move the sensor wand with glass bulb electrode into the liquid to get real-time digital LCD readouts.
- **Microscopic Ion Bubble Engine**: Visualizes dynamic equilibrium populations of red $\text{H}_3\text{O}^+$ hydronium ions and blue $\text{OH}^-$ hydroxide ions floating in solution.
- **Procedural Web Audio API**: Realistic water stream rushing noise, drain whoosh, and sensor beeps generated on-the-fly.
- **Observation Notebook & Mystery Quizzes**: Record dilution trials and test deduction skills in randomized mystery challenges.

## Running Locally
```bash
cd ph_scale_simulation
# Open index.html in any modern browser
```
