# Single-Slit Fraunhofer Diffraction Virtual Laboratory (`/diffraction_simulation`)

An interactive STEM optical wave diffraction virtual laboratory for NCERT Class 12 Physics exploring single-slit Fraunhofer diffraction, sinc-squared intensity distributions, central maximum width ($W_0$), secondary maxima intensity decay, and photometer probe metrology.

## Key Features
- **Analytical Sinc-Squared Optics Engine**: 60 FPS real-time rendering of the Fraunhofer diffraction equation:
  $$I(\theta) = I_0 \left(\frac{\sin\beta}{\beta}\right)^2, \quad \beta = \frac{\pi a \sin\theta}{\lambda} \approx \frac{\pi a y}{\lambda D}$$
- **Multispectral Laser Diodes**: Calibrated coherent sources spanning Violet ($405\text{ nm}$), Blue ($470\text{ nm}$), Green ($532\text{ nm}$), Sodium Yellow ($589\text{ nm}$), and Red ($650\text{ nm}$).
- **Precision Slit & Bench Geometry**: Continuous micrometer slit width variation ($a \in [0.04, 0.30]\text{ mm}$) and screen distance ($D \in [0.8, 2.5]\text{ m}$) verifying that central maximum width is double the secondary fringe widths ($W_0 = \frac{2\lambda D}{a}$).
- **Interactive Photometer Sensor**: Move an optical sensor across the screen to sample relative intensity $I/I_0$, position $y$, and nearest diffraction minima/maxima orders, with procedural pitch-modulating audio.
- **Combined Pattern & Intensity Profile**: Visualizes both the realistic 2D diffraction band appearance on the screen and the smooth overlay of the analytical intensity curve.

## Running Locally
```bash
cd diffraction_simulation
node server.js   # http://localhost:8129
```
Or open `index.html` directly in any modern browser.

