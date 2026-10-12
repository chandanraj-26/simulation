# PendulumLab — Simple Pendulum & Galileo's Isochronism Simulator

A zero-dependency, high-precision HTML5 Canvas and JavaScript physics simulation exploring the simple pendulum, Galileo's discovery of isochronism, small-angle vs. large-angle nonlinear mechanics, string tension, phase portraits, and energy conservation.

---

## 🌟 Key Features

1. **Galileo's Isochronism (1581)**:
   - Historical discovery in the Cathedral of Pisa that pendulum period is independent of amplitude for small angles.
   - Dual comparison mode: Run two pendulums with identical string length $L = 1.0\text{ m}$ simultaneously at $\theta_1 = 30^\circ$ and $\theta_2 = 10^\circ$, observing synchronous phase!
   - Mass independence verification: Compare $0.2\text{ kg}$ vs $1.5\text{ kg}$ bobs showing identical period ($T \propto m^0$).

2. **Nonlinear Kinematics & Numerical ODE Integration**:
   - 60 FPS Runge-Kutta 4th Order (RK4) integrator for the exact nonlinear pendulum equation:
     $$\frac{d^2\theta}{dt^2} + \frac{b}{m L^2}\frac{d\theta}{dt} + \frac{g}{L}\sin\theta = 0$$
   - Small-angle period: $T_0 = 2\pi\sqrt{L/g}$.
   - Exact large-angle Legendre elliptic expansion:
     $$T = T_0 \left(1 + \frac{1}{16}\theta_0^2 + \frac{11}{3072}\theta_0^4 + \dots\right)$$

3. **Laboratory Apparatus & Optical Photogate**:
   - Interactive draggable bobs with live angle readout tooltips.
   - Low-friction brass pivot with transparent angle protractor.
   - Digital optical photogate sensor at equilibrium ($\theta = 0$) with automated infrared beam crossing timer.
   - Dynamic string tension resolution ($T_{\text{tension}} = m(g\cos\theta + L\omega^2)$).

4. **Multi-Planet Celestial Environments**:
   - Earth ($g = 9.81\text{ m/s}^2$)
   - The Moon ($g = 1.62\text{ m/s}^2$)
   - Mars ($g = 3.71\text{ m/s}^2$)
   - Jupiter ($g = 24.79\text{ m/s}^2$)
   - Zero-G microgravity

5. **Phase Space & Energy Conservation**:
   - Real-time oscilloscope waveform $\theta(t)$.
   - Real-time Phase Space Portrait ($\theta$ vs. $\omega$) plotting closed orbits.
   - Real-time Mechanical Energy Bar Chart ($E_k, E_p, E_{\text{total}}$).

6. **Web Audio Synthesizer**:
   - Zero-dependency procedural Web Audio API sounds for photogate optical chimes, bob release swooshes, and victory fanfares.

---

## 🚀 Running Locally

```bash
cd pendulum_simulation
python -m http.server 8092
```

Open your browser at:
```
http://localhost:8092
```
