# OsmosisLab — Interactive Cell Plasmolysis & Osmoregulation Simulator

An interactive, high-fidelity biological laboratory simulation designed for Class 9–12 and AP Biology students. Explores cellular osmosis, water potential ($\Psi = \Psi_s + \Psi_p$), turgor pressure, onion epidermal cell plasmolysis/deplasmolysis, erythrocyte osmotic lysis (hemolysis) vs crenation, U-tube osmometer hydrostatic head rise, and aquaporin membrane dynamics.

## Key Features
- **🌿 Onion Epidermal Plant Cell**:
  - Rigid outer cellulose cell wall.
  - Expanding central vacuole and protoplast under hypotonic conditions (turgor pressure up to 0.8 MPa).
  - Dramatic detachment from corners and protoplast shrinkage (**plasmolysis**) in hypertonic salt solutions (≥ 7.0%).
  - Fully reversible deplasmolysis upon returning to distilled water.
- **🩸 Red Blood Cell (Animal Cell)**:
  - Normal biconcave disc in physiological 0.9% saline.
  - Spiky crenation in hypertonic solution.
  - Spherical swelling and dramatic membrane rupture (**hemolysis**) in hypotonic solutions ($\le 0.2\%$).
- **🧪 U-Tube Osmometer**:
  - Selectively permeable membrane barrier.
  - Water column rises on the higher-concentration side due to osmotic pressure until hydrostatic equilibrium ($\Delta h = \rho g h$).
- **🔬 Aquaporin Molecular View**:
  - Lipid bilayer with protein channel pores.
  - Rapid single-file water molecule passage down chemical potential gradient.
  - Solute crystals physically blocked from passing.
- **Biophysics Engine**:
  - Solute potential $\Psi_s = -iCRT$.
  - Pressure potential $\Psi_p$.
  - Real-time molarity and tonicity classification.
- **Interactive Controls & Audio**:
  - Dynamic concentration slider (0% to 10%).
  - Quick tonicity presets (Pure Water 0%, Isotonic 0.9%/2%, Hypertonic 8%).
  - Quick action buttons: "💧 Add Water", "🧂 Add Salt", "↺ Reset".
  - Audio synthesizer with custom Web Audio droplet, crystal, and burst sounds.
  - 5 Gamified Laboratory Quests and educational Theory Modal.

## Local Running
```bash
cd d:\simulation\osmosis_simulation
python -m http.server 8093
```
Open [http://localhost:8093](http://localhost:8093) in your browser.
