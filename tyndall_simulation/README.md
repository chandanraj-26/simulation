# Tyndall Effect, Colloidal Solutions & Suspensions Virtual Lab

A high-fidelity, zero-dependency interactive STEM virtual laboratory simulating **Class 9 NCERT Chemistry Chapter 2: "Is Matter Around Us Pure?" (Activities 2.1 & 2.2)**.

## Curriculum Mapping
- **Class**: 9th Grade (CBSE / NCERT / State Boards / IGCSE)
- **Subject**: Chemistry / Physical Science
- **Chapter**: Chapter 2: Is Matter Around Us Pure?
- **Activities**:
  - **Activity 2.1**: Classification of mixtures into True Solutions, Colloidal Sols, and Suspensions.
  - **Activity 2.2**: Direct comparison of optical Tyndall scattering, filtration separation behavior, and stability against settling under gravity.

## Core Scientific Features
1. **Rayleigh-Tyndall Optical Scattering**:
   - Tunable laser diode emitter across visible wavelengths:
     - **Red Laser (650 nm)**: Standard reference baseline ($I_{\text{rel}} = 1.0$).
     - **Green DPSS Laser (532 nm)**: Higher scattering ($I_{\text{rel}} \approx 2.23\times$).
     - **Blue Diode Laser (405 nm)**: Maximum scattering intensity ($I_{\text{rel}} \approx 6.61\times$), verifying Rayleigh's law:
       $$I \propto \frac{1}{\lambda^4}$$
2. **Three-Beaker Optical Bench**:
   - **True Solution ($\text{CuSO}_4$ in $\text{H}_2\text{O}$)**: Particle diameter $< 1\text{ nm}$. Beam passes through completely invisible; zero optical scattering.
   - **Colloidal Sol (Dilute Milk / Starch Sol)**: Particle diameter $1\text{ nm}$ to $1000\text{ nm}$. Intense, luminous Tyndall cone illuminated along the beam axis.
   - **Suspension (Chalk Powder in Water)**: Particle diameter $> 1000\text{ nm}$. Turbid light scattering when stirred; sediment settles over time to the bottom of the beaker.
3. **Ultramicroscopic Brownian Motion Mode**:
   - View colloidal particles undergoing rapid, erratic, zig-zag thermal molecular bombardment from solvent water molecules.
4. **Filtration Separation Mode**:
   - Demonstrates filter paper pore size selectivity: suspension chalk residue is trapped on filter paper, while true solutions and colloidal sols pass cleanly through.
5. **Interactive Quests & Telemetry**:
   - 5 structured NCERT pedagogical quests tracking user observations.
   - Real-time particle diameter, stability indices, and scattering percentages.

## Running Locally
```bash
node server.js
```
The lab is available at `http://localhost:8076/`.
