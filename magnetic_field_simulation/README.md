# Magnetic Field Lines & Draggable Compass Virtual Laboratory

A zero-dependency, responsive physics virtual laboratory adhering to NCERT Class 10/12 Science curriculum.

## Features
- **Accurate Dipole Magnetostatics Engine**: Resolves field vector components $B_x, B_y$ and total intensity $|B|$ for bar magnets.
- **Draggable Pocket Compass with Inertia**: Needle displays realistic damped harmonic oscillations aligning with the local field vector.
- **Multiple Visualizations**: Continuous field lines, sprinkled iron filings, and vector arrow grids.
- **Earth's Field & Neutral Points**: Toggle horizontal Earth magnetic field ($B_H$) to demonstrate neutral points ($B_{\text{net}} = 0$).
- **Responsive Layout**: Adheres to soft light-blue study aesthetic (`#F0F7FF`) and dual-font typography (`Plus Jakarta Sans` + `JetBrains Mono`).
- **Web Audio Synthesis**: Procedural magnetic ticking and compass click SFX.

## Running Locally
```bash
cd magnetic_field_simulation
node server.js
```
Open [http://localhost:8116](http://localhost:8116) in your web browser.

