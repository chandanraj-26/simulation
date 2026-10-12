# SpringLab — Interactive Hooke's Law & Spring-Mass Harmonic Scale

A zero-dependency, high-precision HTML5 Canvas and JavaScript physics simulation exploring Hooke's Law of Elasticity, Simple Harmonic Motion (SHM), mechanical energy conservation, series and parallel spring linkages, and spring balance scales.

---

## 🌟 Key Features

1. **Hooke's Law & Elasticity**:
   - Linear restoring force: $F_s = -k \Delta x$.
   - Static spring scale balance: $m = \frac{k \Delta x}{g}$.
   - Adjustable spring constant $k_1, k_2$ ($10 - 100\text{ N/m}$).

2. **Simple Harmonic Motion & ODE Physics**:
   - Runge-Kutta 4th Order (RK4) integrator for stable, realistic 60 FPS oscillation.
   - Natural frequency $\omega_0 = \sqrt{\frac{k_{\text{eff}}}{m}}$ and period $T_0 = 2\pi \sqrt{\frac{m}{k_{\text{eff}}}}$.
   - Adjustable damping ($c = 0$ undamped, light, and critical damping $c_{\text{crit}} = 2\sqrt{mk}$).

3. **Spring Network Configurations**:
   - **Single Spring**: Standard vertical spring apparatus.
   - **Series Springs**: End-to-end combination ($\frac{1}{k_{\text{eff}}} = \frac{1}{k_1} + \frac{1}{k_2}$).
   - **Parallel Springs**: Load sharing ($k_{\text{eff}} = k_1 + k_2$).
   - **Mystery Scale Challenge**: Weigh unknown objects (Royal Crown, Quartz Gem, Wood Block) using static extension!

4. **Interactive Laboratory Bench & Weights**:
   - Slotted brass discs (50g, 100g, 250g, 500g, 1000g) in a wooden bench tray.
   - Drag and drop weights onto the hook or drag the mass up/down to displace and release!
   - High-precision vertical metric lab ruler (cm/mm).
   - Reference lines: Unstretched length ($L_0$), Equilibrium position ($\Delta x_{\text{eq}}$), and live extension indicator.

5. **Live Force Vectors, Waveform & Energy Conservation**:
   - Real-time Restoring Force ($\vec{F}_s$), Gravity Weight ($\vec{W}$), and Net Force ($\vec{F}_{\text{net}}$) vectors.
   - Real-time displacement wave $x(t)$ oscilloscope.
   - Real-time Mechanical Energy Bar Chart ($E_k$, $E_p$, and $E_{\text{total}}$).
   - Integrated digital stopwatch with start/pause/reset.

6. **Web Audio Synthesizer**:
   - Procedural Web Audio API sound effects for spring twangs, metal hook clinks, weight drops, stopwatch beeps, and fanfare.

---

## 🚀 Running Locally

```bash
cd spring_simulation
python -m http.server 8091
```

Open your browser at:
```
http://localhost:8091
```
