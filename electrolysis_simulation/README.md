# Electrolysis of Water & Copper Electroplating Virtual Laboratory

An interactive STEM virtual laboratory simulation for Class 9 and 10 Chemistry students, implementing Faraday's laws of electrolysis, stoichiometric gas decomposition, squeaky pop & glowing splint tests, and copper electroplating deposition kinetics.

## Features
- **Hofmann Voltameter Mode**:
  - Acidified water ($0.1\text{ M } \text{H}_2\text{SO}_4$) electrolysis with platinum electrodes.
  - Precise 2:1 stoichiometric volume ratio between Hydrogen ($\text{H}_2$, cathode) and Oxygen ($\text{O}_2$, anode).
  - Dynamic liquid displacement meniscus and buoyant effervescent bubbles popping at the gas-liquid interface.
  - Interactive **Squeaky Pop Test** for Hydrogen and **Glowing Splint Relight Test** for Oxygen.
- **Copper Electroplating Mode**:
  - Pure copper anode plate and iron key cathode immersed in vibrant blue copper(II) sulfate ($\text{CuSO}_4$) solution.
  - Electrodeposition according to Faraday's First Law ($m = \frac{M \cdot I \cdot t}{z \cdot F}$).
  - Real-time copper layer thickness ($\mu\text{m}$) and mass ($mg$) growth.
  - Moving $\text{Cu}^{2+}$ ion migration drift across the electrolyte.
- **Pure Zero-Dependency Stack**:
  - Built with native HTML5, CSS3, ES6+ JavaScript, Canvas 2D, and procedural Web Audio SFX.
  - Governed by `simulation-guidelines` with soft light-blue study environment (`#F0F7FF`/`#E6F2FF`) and responsive dual-column grid.

## How to Run
```bash
node server.js
```
Open [http://localhost:8083/](http://localhost:8083/) in any modern web browser.
