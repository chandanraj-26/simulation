# Stomatal Transpiration & Guard Cell Turgidity Virtual Laboratory (`/stomata_simulation`)

An interactive STEM biology virtual laboratory for NCERT Class 10 & Class 11 Biology (Plant Physiology & Life Processes) exploring the osmoregulation of stomatal opening and closing, guard cell turgor pressure ($\Psi_p$), potassium ($K^+$) ion flux, and transpiration rates.

## Key Features
- **Dual Visual Modes**:
  - **High-Power Cellular Zoom**: Close-up of the kidney-shaped (*reniform*) guard cell pair, showing anisotropic cell walls (thick inelastic inner wall vs. thin elastic outer wall), photosynthetic chloroplasts, nucleus, active $K^+$ ion transport, and dynamic aperture opening ($0\text{ to }12\ \mu\text{m}$).
  - **Epidermal Peel Microscope View**: 100× microscope view across epidermal pavement cells displaying scattered stomata with empirical Stomatal Index ($\text{SI} \approx 22\%$) calculation.
- **Biophysical $K^+$ Ion Mechanism**: Day/night illumination stimulates proton-pumping ($H^+$-ATPase), driving $K^+$ influx into guard cells, lowering osmotic potential ($\Psi_s$), and generating endosmotic turgor pressure ($\Psi_p \approx 1.5\text{ MPa}$) to pull open the stomatal aperture.
- **Environmental & Drought Stress Regulation**: Control light intensity ($0-100\%$), ambient relative humidity ($20-90\%$), leaf temperature ($15-40^\circ\text{C}$), and Abscisic Acid (ABA) stress hormone to trigger stomatal closure.
- **Transpiration & Gas Exchange Visualizer**: Animated ascending water vapor ($H_2O$) transpiration plumes and photosynthetic $CO_2$ assimilation arrows.
- **Procedural Web Audio API**: Osmotic water flow rushing sounds, transpiration whispers, and diurnal day/night transition chimes.
- **Observation Notebook & Scenario Quizzes**: Record physiological trials and test your understanding with randomized environmental scenarios.

## Running Locally
```bash
cd stomata_simulation
# Open index.html in any modern browser
```
