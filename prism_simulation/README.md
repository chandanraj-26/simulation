# 🌈 PhysicsLab — Prism Light Refraction, Dispersion (VIBGYOR) & Snell's Law Simulator

An interactive, web-based physics simulation designed for Class 9–12 STEM students and educators to explore **Snell's Law of Refraction**, **Cauchy Chromatic Dispersion**, **Angle of Minimum Deviation ($D_{\text{min}}$)**, **Total Internal Reflection (TIR)**, and **Critical Angle ($\theta_c$)**.

![PhysicsLab Preview](simulation.html)

---

## ✨ Features

- **🎬 Full-Page Interactive Optics Lesson Intro**: Features an introductory interactive animated theater demonstration explaining why white light splits into rainbow colors using differential refractive speeds ($v = c/n$), complete with audio narration, replay controls, and quick-action lab entry.
- **💎 Exact Geometric Ray Tracing & Multi-Wavelength Dispersion**:
  - **White Light Mode**: Splitting of polychromatic light into full continuous **VIBGYOR** (Violet, Indigo, Blue, Green, Yellow, Orange, Red) spectrum.
  - **Monochromatic Laser Mode**: Tunable laser from 380 nm (UV/violet) to 750 nm (infrared/red) with dynamic beam colors and CIE RGB conversion.
  - **Total Internal Reflection (TIR)**: Detects when internal angle $r_2 > \theta_c$ and demonstrates internal reflection off Face 2.
- **📐 Interactive Geometric Overlays & Protractor**:
  - Direct incident angle slider control ($i \in [15^\circ, 80^\circ]$) with quick presets and auto-align to Minimum Deviation ($D_{\text{min}}$).
  - Toggles for normal lines ($N_1, N_2$), angle labels & arcs ($i, r_1, r_2, e, \delta$), virtual extended rays, and semi-transparent protractor.
  - Movable light source collimator / torch directly draggable on the canvas.
  - Observation screen on the right displaying real-time projected spectral bands.
- **🎯 "What's Happening?" Live Pedagogical Explainer**:
  - Plain English physics concept breakdown updating in real-time as parameters change.
  - Step-by-step mathematical calculations for Surface 1 refraction, Face 2 internal angles, and total net deviation.
- **📈 Real-Time Multi-Trace Analytics & Spectrometry**:
  - **$\delta$ vs $i$ Curve**: Real-time curve showing the characteristic $U$-shape and marking the exact minimum deviation vertex $(i_{\text{min}}, D_{\text{min}})$.
  - **Cauchy Dispersion Curve**: Visualizing $n(\lambda)$ across visible wavelengths.
  - **Spectrometer Analysis**: Angular dispersion $\Delta\theta = \delta_{\text{violet}} - \delta_{\text{red}}$ and material dispersive power $\omega$.
- **💾 CSV Telemetry & Experiment Export**:
  - Export full angle datasets ($i, r_1, r_2, e, \delta$, status) for classroom lab reports and analysis in Excel or Python.

---

## 🛠️ Tech Stack

- **HTML5 & Vanilla JavaScript**: Modular ES6+ architecture, zero dependencies, lightning-fast client execution.
- **HTML5 2D Canvas**: High-DPI ray tracing engine with glass caustics, beam glow, and color gradients.
- **Modern CSS3 Design System**: Clean light theme with curated typography (Google Fonts: *Plus Jakarta Sans* & *JetBrains Mono*).

---

## 🚀 Getting Started

Simply open `simulation.html` or `index.html` in any modern web browser:

```bash
# Navigate to the prism simulation folder
cd prism_simmulation

# Open simulation.html in your default browser
# (Windows)
start simulation.html

# (macOS)
open simulation.html

# (Linux)
xdg-open simulation.html
```

---

## 📚 Educational Core Formulas

1. **Snell's Law of Refraction**:
   $$n_1 \sin(i) = n_2 \sin(r_1) \implies r_1 = \arcsin\left(\frac{n_1}{n_2} \sin(i)\right)$$

2. **Prism Internal Angle Relation**:
   $$r_1 + r_2 = A \implies r_2 = A - r_1$$

3. **Critical Angle ($\theta_c$) & Total Internal Reflection (TIR)**:
   $$\theta_c = \arcsin\left(\frac{n_{\text{ambient}}}{n_{\text{prism}}}\right)$$
   If $r_2 > \theta_c$, the ray undergoes **Total Internal Reflection** and cannot emerge into air.

4. **Angle of Emergence & Total Deviation ($\delta$)**:
   $$n_{\text{prism}} \sin(r_2) = n_{\text{ambient}} \sin(e) \implies e = \arcsin\left(\frac{n_{\text{prism}}}{n_{\text{ambient}}} \sin(r_2)\right)$$
   $$\delta = i + e - A$$

5. **Prism Formula at Minimum Deviation ($D_{\text{min}}$)**:
   At minimum deviation, $i = e$ and $r_1 = r_2 = \frac{A}{2}$:
   $$n = \frac{\sin\left(\frac{A + D_{\text{min}}}{2}\right)}{\sin\left(\frac{A}{2}\right)}$$

6. **Cauchy Dispersion Formula**:
   $$n(\lambda) = A_c + \frac{B_c}{\lambda^2}$$

---

## 📄 License

MIT License — Free to use and adapt for schools, colleges, STEM workshops, and physics education!
