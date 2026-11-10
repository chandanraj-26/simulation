# Respiration in Germinating Seeds Virtual Laboratory

A zero-dependency, responsive biology virtual laboratory adhering to NCERT Class 10 Science curriculum (Life Processes).

## Features
- **Accurate NCERT Practical Setup**: Conical flask with germinating gram/pea seeds, suspended $\text{KOH}$ tube, rubber stopper, delivery tube, and colored water beaker.
- **Biochemical Respiration Engine**: Models aerobic respiration $\text{C}_6\text{H}_{12}\text{O}_6 + 6\text{O}_2 \to 6\text{CO}_2 + 6\text{H}_2\text{O}$ and $\text{KOH}$ fixation.
- **Partial Vacuum & Water Rise**: Measures $\Delta h(t)$ water column height creep in real time.
- **Enzyme Kinetics & Controls**: Test living germinating seeds, boiled seeds (control with antiseptic), and dormant dry seeds across temperatures ($5^\circ\text{C}–45^\circ\text{C}$).
- **Time-Lapse Controller**: Variable speed simulation ($1\times, 10\times, 60\times, 300\times$).
- **Web Audio Synthesis**: Procedural clock ticking and liquid suction gurgle.

## Running Locally
```bash
cd seed_respiration_simulation
node server.js
```
Open [http://localhost:8120](http://localhost:8120) in your web browser.

