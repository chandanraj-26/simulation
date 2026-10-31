# Vernier Caliper & Micrometer Screw Gauge Virtual Laboratory (`/vernier_caliper_simulation`)

A high-precision, interactive STEM metrology virtual laboratory built in compliance with NCERT Class 11 Physics Practical curriculum (Activity 1 & 2).

## Features
- **Dual Metrology Instruments**:
  - **Vernier Caliper**: $1\text{ MSD} = 1.0\text{ mm}$, $10\text{ VSD} = 9\text{ MSD} = 9.0\text{ mm}$, yielding a Least Count of $\mathbf{0.1\text{ mm}}$ ($0.01\text{ cm}$).
  - **Micrometer Screw Gauge**: Pitch $= 1.0\text{ mm}$, $100$ circular scale divisions, yielding a Least Count of $\mathbf{0.01\text{ mm}}$ ($10\ \mu\text{m}$).
- **Interactive High-DPI 2D Canvas**: Drag movable sliding jaws or spindle directly with smooth touch/mouse support.
- **3.5× Magnifying Loupe**: Floating zoom inset clearly displaying the coincident division line.
- **Realistic Zero Error Engine**: Configurable positive and negative zero errors with real-time analytical correction ($\text{Corrected} = \text{Observed} - \text{Zero Error}$).
- **Authentic Test Specimens**: Steel ball bearing, brass cylinder, glass plate, copper wire, and coin with realistic physical rendering and automatic jaw clamping.
- **Procedural Web Audio API**: Physical ratchet gear clicks, slider friction ticks, and jaw contact snaps synthesized dynamically with zero external audio assets.
- **Observation Notebook**: Record trials into an interactive live table.
- **Interactive Practice Mode**: Random reading challenges with automated precision scoring.

## Running Locally
```bash
cd vernier_caliper_simulation
# Open index.html in any modern browser, or serve with:
npx serve .
```
