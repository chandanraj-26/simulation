# ProjectileLab — Interactive Projectile Motion & Kinematics Simulator

A zero-dependency, high-performance HTML5 Canvas and JavaScript physics simulator for Class 9–12 and AP Physics students, exploring two-dimensional kinematics, parabolic trajectories, drag effects, and celestial gravity.

---

## 🌟 Key Features

1. **Realistic 2D Classical Kinematics**:
   - Velocity decomposition: $v_{0x} = v_0 \cos\theta$, $v_{0y} = v_0 \sin\theta$.
   - Live telemetry: Horizontal range ($R$), maximum height ($H_{\text{max}}$), and time of flight ($t_{\text{flight}}$).
   - Interactive launch controls: elevation angle slider ($0^\circ - 90^\circ$), initial velocity ($5 - 60\text{ m/s}$), and launch platform elevation ($0 - 40\text{ m}$).

2. **Aerodynamic Drag & Mass Mechanics**:
   - Optional quadratic air resistance ($F_d = \frac{1}{2} C_d \rho A v^2$).
   - Multiple projectile types: Steel cannonball (5.0 kg), Baseball (0.145 kg), Golf ball (0.046 kg), Tank shell (8.5 kg), and Grand Piano (300 kg).

3. **Multi-Planet Celestial Gravity**:
   - Earth ($g = 9.81\text{ m/s}^2$)
   - The Moon ($g = 1.62\text{ m/s}^2$)
   - Mars ($g = 3.71\text{ m/s}^2$)
   - Jupiter ($g = 24.79\text{ m/s}^2$)

4. **Interactive Modes**:
   - **Firing Range**: Freeform trajectory exploration with live vector overlays ($\vec{v}$, $\vec{v}_x$, $\vec{v}_y$, and $\vec{g}$).
   - **Target Challenge**: Draggable bullseye target ring mini-game with score calculation and hit fanfare.
   - **Multi-Angle Plot**: Comparative trajectory visualization showing complementary angle symmetry ($15^\circ$ to $75^\circ$).

5. **Student Quests & Theory Lab**:
   - 5 gamified laboratory quests with real-time completion tracking.
   - Built-in theory derivation modal explaining equations of motion.

6. **Web Audio Synthesizer**:
   - Zero-dependency procedural Web Audio API sound effects for cannon blast, ground thud, bullseye chime, and victory fanfares.

---

## 🚀 Running Locally

You can serve the simulation using Python's built-in HTTP server:

```bash
cd projectile_simulation
python -m http.server 8090
```

Open your browser at:
```
http://localhost:8090
```
