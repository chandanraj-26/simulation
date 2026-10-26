# Spectrophotometry & Beer-Lambert Law Virtual Lab

An interactive STEM virtual chemistry laboratory simulating UV-Visible Absorption Spectrophotometry to verify the Beer-Lambert Law ($A = \varepsilon \cdot b \cdot c$) and determine the unknown concentration of transition metal solutions (CBSE Class 11/12 Chemistry Practical).

## Key Features
- **Beer-Lambert Law Engine**:
  $$A = -\log_{10}(T) = -\log_{10}\left(\frac{I}{I_0}\right) = \varepsilon \cdot b \cdot c$$
  Where $A$ is absorbance, $T$ is transmittance ($0–100\%$), $\varepsilon$ is molar absorptivity ($\text{L}\cdot\text{mol}^{-1}\cdot\text{cm}^{-1}$), $b$ is optical cuvette path length ($0.5\text{–}2.0\text{ cm}$), and $c$ is molar concentration ($0.001\text{–}0.50\text{ M}$).
- **Standard Transition Metal Solutes**:
  - Potassium Permanganate ($\text{KMnO}_4$, deep purple solution, absorbs green light at $\lambda_{\max} \approx 525\text{ nm}$, $\varepsilon \approx 2200$).
  - Copper Sulfate ($\text{CuSO}_4$, sky blue solution, absorbs red/orange light at $\lambda_{\max} \approx 630\text{ nm}$, $\varepsilon \approx 12$).
  - Potassium Dichromate ($\text{K}_2\text{Cr}_2\text{O}_7$, bright orange solution, absorbs blue/violet light at $\lambda_{\max} \approx 450\text{ nm}$, $\varepsilon \approx 350$).
- **Optical Spectrophotometer Bench**:
  - Collimated light source, diffraction grating monochromator selector, standard fused quartz cuvette holder with liquid solution, and silicon photodiode detector.
- **Dynamic Calibration Curve ($A$ vs $c$)**: Real-time linear regression plot with unknown test sample interpolation.
- **Soft Light-Blue Academic Aesthetics**: Zero external dependencies, responsive canvas layout.

## Running Locally
```bash
node server.js
# Access at http://localhost:8105
```
