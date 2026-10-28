# Single Slit Fraunhofer Diffraction Simulation (Physics Lab)

An interactive, high-precision STEM virtual laboratory simulating single-slit optical Fraunhofer diffraction using coherent monochromatic laser beams.

## Key Features
- **Monochromatic Laser Sources**: Red ($650\text{ nm}$), Green ($532\text{ nm}$), Blue/Violet ($405\text{ nm}$), and Custom wavelength control.
- **Micro-Positioner Slit Control**: Adjustable slit width $a \in [0.02, 0.40]\text{ mm}$ via precision micrometer screw.
- **Bench Geometry**: Variable slit-to-screen distance $D \in [0.5, 3.0]\text{ m}$.
- **Fraunhofer Diffraction Engine**: Exact sinc-squared intensity profile:
  $$I(\theta) = I_0 \left(\frac{\sin \beta}{\beta}\right)^2, \quad \beta = \frac{\pi a}{\lambda}\sin\theta \approx \frac{\pi a y}{\lambda D}$$
- **Photodetector / Photometer Wand**: Interactive draggable probe measuring live relative irradiance along the screen ($y$-axis).
- **Dual Visual Modes**: Photorealistic laser diffraction pattern screen + real-time mathematical intensity distribution plot $I(y)$.
- **Educational Quests & Challenges**:
  - Calculate slit width from minima positions: $a \sin\theta = m\lambda$.
  - Verify inverse proportionality of central fringe width $\beta_0 = \frac{2\lambda D}{a}$.
  - Compare diffraction envelope across Red vs. Green vs. Blue lasers.
- **Audio Synthesis**: Web Audio API photon detector hum, micrometer click, and laser shutter sounds.
- **Soft Light-Blue Academic Aesthetics**: Zero external dependencies, responsive canvas layout.

## Running Locally
```bash
node server.js
# Access at http://localhost:8097
```
