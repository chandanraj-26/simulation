# Density, Mass & Buoyancy (Float or Sink) Virtual Laboratory (`/buoyancy_simulation`)

An interactive STEM physics simulation for NCERT Class 9 Physics exploring Archimedes' principle, density calculation ($\rho = m/V$), fluid displacement, buoyant force, and conditions for equilibrium flotation.

## Key Features
- **8 Distinct Solid Materials**: Styrofoam ($\rho = 0.05\text{ kg/L}$), Pine Wood ($\rho = 0.50\text{ kg/L}$), Glacial Ice ($\rho = 0.92\text{ kg/L}$, exhibiting the 92% submerged iceberg phenomenon), Aluminum ($\rho = 2.70\text{ kg/L}$), Steel ($\rho = 7.85\text{ kg/L}$), Copper ($\rho = 8.96\text{ kg/L}$), Solid Gold ($\rho = 19.30\text{ kg/L}$), and Custom block.
- **5 Fluid Mediums**: Pure Water ($\rho = 1.00\text{ kg/L}$), Dense Sea Water ($\rho = 1.03\text{ kg/L}$), Olive Oil ($\rho = 0.92\text{ kg/L}$), Viscous Glycerin ($\rho = 1.26\text{ kg/L}$), and Liquid Mercury ($\rho = 13.60\text{ kg/L}$, in which steel and copper float!).
- **Overflow Measuring Cylinder**: Catches displaced liquid volume, empirically confirming Archimedes' displacement rule ($V_{\text{displaced}} = V_{\text{submerged}}$).
- **Dynamic Damped Harmonic Motion**: Drag the block underwater and release it to observe realistic bobbing oscillation governed by $\Sigma F = F_g - F_b - \text{drag}$.
- **Force Vector Visualization**: Live rendered vectors for downward gravity ($F_g = mg$, Red) and upward buoyancy ($F_b = \rho_f V_{\text{sub}} g$, Green) scaled to force magnitude.
- **Procedural Web Audio API**: Realistic water splash, slosh, and bottom contact sound effects synthesized dynamically.
- **Observation Notebook & Practice Challenges**: Record laboratory trials and test your intuition with randomized flotation prediction challenges.

## Running Locally
```bash
cd buoyancy_simulation
# Open index.html in any modern browser
```
