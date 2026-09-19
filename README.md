# Interactive Physics Simulations Suite

A collection of interactive, client-side STEM physics simulations built with HTML5 Canvas, modern Vanilla CSS, and JavaScript.

---

## 🔬 Simulations Included

### 1. 🔍 [Lens Simulation (`/lens_simulation`)](lens_simulation/)
- **Convex & Concave Lenses**: Real-time ray tracing (Ray 1, Ray 2, Ray 3) and virtual ray back-extensions.
- **Interactive Objects**: Upright Arrow, Candle Flame, and **Student Character** (with ray emissions from the raised index fingertip).
- **Image Formation**: Real inverted images on projection screens vs. upright holographic virtual images.
- **HUD & Bench Controls**: Live focal length ($f$), object distance ($u$), image distance ($v$), and magnification ($m$).

### 2. 🌈 [Prism Simulation (`/prism_simulation`)](prism_simulation/)
- **Light Refraction & Snell's Law**: $n_1 \sin(\theta_1) = n_2 \sin(\theta_2)$ with incident angle and prism apex angle controls.
- **VIBGYOR Chromatic Dispersion**: Cauchy dispersion equation modeling wavelength-dependent refractive indices ($n(\lambda) = A + B/\lambda^2$).
- **Total Internal Reflection (TIR)**: Critical angle $\theta_c$ calculation and visualization.
- **Monochromatic & White Light Sources**: Real-time spectrum analysis.

### 3. 🚀 [Rocket Simulation (`/rocket_simulation`)](rocket_simulation/)
- **Newton's Laws of Motion**: $F_{\text{net}} = ma$, action-reaction pairs, weight ($W = mg$), and thrust.
- **Atmospheric Layers & Karman Line**: Troposphere through Outer Space cross-section.
- **2D Thrust Vectoring**: Real-time trajectory plotting and force resolution ($F_x, F_y$).
- **Telemetry Graphs & CSV Export**: Real-time altitude, velocity, and acceleration plotting.

---

## 💻 Tech Stack
- **Pure Web Standards**: HTML5, Canvas 2D API, CSS3, ES6+ JavaScript.
- **Zero External Dependencies**: Works out-of-the-box locally or deployed to Vercel / GitHub Pages.

---

## 🚀 Running Locally
You can run any simulation using any static web server:

```bash
# Lens Simulation
cd lens_simulation
python -m http.server 8085

# Prism Simulation
cd prism_simulation
python -m http.server 8099

# Rocket Simulation
cd rocket_simulation
python -m http.server 8080
```
Or simply open the `index.html` or `simulation.html` file in any modern web browser.
