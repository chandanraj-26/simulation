# Young's Double Slit Experiment & Wave Interference Virtual Laboratory (`/ydse_simulation`)

An interactive STEM wave optics virtual laboratory for NCERT Class 12 & AP Physics exploring Huygens' principle, coherent wave superposition, path and phase differences, fringe width ($\beta$), diffraction envelope, thin sheet fringe displacement, and polychromatic white light fringes.

## Key Features
- **Huygens Circular Wavefront Synthesis**: 60 FPS real-time rendering of concentric wavefront emissions propagating from slits $S_1$ and $S_2$, forming continuous hyperbola-shaped nodal and antinodal interference lines.
- **Multispectral Wavelength Controls**: Continuous tuning from $400\text{ nm}$ to $700\text{ nm}$ alongside calibrated laser presets: Violet ($405\text{ nm}$), Blue ($470\text{ nm}$), Green ($532\text{ nm}$), Sodium Yellow ($589\text{ nm}$), and Red ($650\text{ nm}$).
- **Polychromatic White Light Mode**: Real-time spectral integration demonstrating the classic landmark optical phenomenon: a crisp central white fringe flanked by violet-to-red colored bands that gradually transition into uniform diffuse illumination.
- **Thin Mica Sheet Insertion & Fringe Shift**: Insert a transparent mica plate ($t \in [0.5, 8.0]\ \mu\text{m}, \mu = 1.55$) in front of slit $S_1$ to observe the upward spatial shift $\Delta y = \frac{D}{d}(\mu - 1)t$ while rigorously maintaining constant fringe width $\beta$.
- **Draggable Photometer Sensor**: Move an interactive photometer sensor along the screen to measure exact position $y$, intensity ratio $I/I_0$, optical path difference $\Delta x$, and fringe order $n$, complete with procedural pitch-modulating audio feedback.
- **Combined Interference & Diffraction Profile**: Dynamic real-time $I(y)$ intensity curve reflecting both double-slit interference and single-slit diffraction sinc envelopes.

## Running Locally
```bash
cd ydse_simulation
node server.js   # http://localhost:8123
```
Or open `index.html` directly in any modern browser.
