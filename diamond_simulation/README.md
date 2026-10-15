# 💎 DiamondCutSim — Snell's Law, Total Internal Reflection & Dispersion Ray Tracer

An interactive, high-precision STEM optics and gemology laboratory demonstrating **Snell's Law of Refraction**, **Cauchy Chromatic Dispersion**, **Total Internal Reflection (TIR)**, and **Marcel Tolkowsky's 1919 Ideal Brilliant Cut Proportions**.

---

## ✨ Features & Capabilities

- **Snell's Law & Cauchy Dispersion Engine**: Traces accurate ray paths through polyhedral crystal facets with wavelength-dependent refractive indices $n(\lambda) = n_D + B(1/\lambda^2 - 1/\lambda_D^2)$.
- **Total Internal Reflection (TIR)**: Calculates critical angles $\theta_c = \arcsin(n_{\text{air}}/n_{\text{gem}})$ (diamond $\theta_c \approx 24.4^\circ$ vs crown glass $41.1^\circ$) and tracks multi-bounce internal reflections.
- **VIBGYOR Rainbow Fire**: Visualizes spectral separation into 7 distinct color bands (Violet, Indigo, Blue, Green, Yellow, Orange, Red) emerging from crown facets.
- **Tolkowsky Diamond Cut Analysis**:
  - **Ideal Cut ($34.5^\circ$ Crown, $40.75^\circ$ Pavilion)**: 100% of entering light reflects off both pavilion facets and exits back up through the crown facets (Maximum Brilliance & Fire).
  - **Shallow Cut (Fish-Eye)**: Light hits pavilion facets below the critical angle and leaks straight through the bottom (Windowing).
  - **Deep Cut (Nail-Head)**: Light bounces at steep angles and escapes out the sides (Extinction).
- **Gemstone Material Library**: Compare Diamond ($n = 2.417$), Moissanite ($n = 2.650$), Cubic Zirconia ($n = 2.170$), Natural Zircon ($n = 1.930$), Sapphire ($n = 1.770$), and Crown Glass ($n = 1.520$).
- **Interactive Light Source / Torch**: Drag and rotate the light source across the table facet, toggle between White Light and Tunable Monochromatic Laser ($380\text{–}750\text{ nm}$), and switch between Single Ray and Collimated Wide Beam ($5\text{ rays}$).
- **Real-Time Web Audio Synthesizer**: Crystal sparkle chimes upon crown exit, glass pings upon internal TIR reflections, and swept-frequency tones during laser tuning.
- **5 Guided Student Quests**: Interactive laboratory challenges testing TIR, chromatic fire, diamond vs glass critical angles, and optimal pavilion angles.
- **Physics Theory Modal**: Full mathematical derivations of Snell's law, Cauchy dispersion, critical angles, and Tolkowsky cut geometry with comparative gemstone index tables.

---

## 📐 Mathematical Formulation

1. **Snell's Law of Refraction**:
   $$n_1 \sin(\theta_1) = n_2 \sin(\theta_2)$$

2. **Critical Angle for Total Internal Reflection (TIR)**:
   $$\theta_c = \arcsin\left(\frac{n_{\text{air}}}{n_{\text{gem}}}\right) \approx \arcsin\left(\frac{1.0}{2.417}\right) = 24.4^\circ$$

3. **Cauchy's Chromatic Dispersion**:
   $$n(\lambda) = n_D + B \left(\frac{1}{\lambda^2} - \frac{1}{\lambda_D^2}\right)$$
   where $\lambda_D = 589\text{ nm}$ (Sodium D-line).

4. **Tolkowsky Brilliant Cut Proportions**:
   - Crown Angle: $34.5^\circ$
   - Pavilion Angle: $40.75^\circ$
   - Table Ratio: $57\%$

---

## 🛠️ Tech Stack

- **Core**: Vanilla HTML5, Canvas 2D API, ES6 JavaScript
- **Audio**: Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`)
- **Typography**: Google Fonts (*Plus Jakarta Sans* & *JetBrains Mono*)
- **Styling**: Pure CSS3 with glassmorphic cards, custom ranges, responsive layout
- **Deployment**: Vercel configuration ready (`vercel.json`)
