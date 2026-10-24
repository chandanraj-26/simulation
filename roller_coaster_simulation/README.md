# 🎢 CoasterLab — Roller Coaster Kinematics & Loop Fail Dynamics

An interactive STEM physics engine and virtual laboratory built for students (grades 8–12 and AP Physics) to explore how conservation of mechanical energy, centripetal acceleration, and normal contact forces govern roller coaster loops.

---

## 🌟 Key Features

1. **Real-Time 60 FPS Numerical Kinematics**:
   - Continuous integration of cart velocity, arc-distance $s$, height $y$, and local track curvature $\kappa$.
   - Automatic calculation of kinetic ($KE$) and gravitational potential ($PE$) energies.

2. **The 2.5R Rule & Loop Clearance**:
   - Teaches why a drop height of at least $h_{\text{min}} = 2.5R$ is mandatory for a circular loop of radius $R$.
   - Interactive live indicator showing whether the current release height passes or fails.

3. **Loop Fail Dynamics & Ballistic Projectile Flight**:
   - When normal contact force drops to $N \le 0$ inside the loop, the cart detaches from the track equation.
   - Smooth transition into unconstrained 2D projectile motion ($a_x = 0, a_y = -g$) with rotational tumbling and ground collision FX.

4. **Circular vs. Clothoid (Teardrop) Loops**:
   - Compare the high, spine-compressing G-forces of circular loops with modern Euler spiral clothoids.

5. **Gamified Quests & Star Ratings**:
   - 5 progressive challenges covering energy conservation, mass independence, friction dissipation, and loop geometry.

6. **Procedural Web Audio**:
   - Dynamic rail wind rumble, descent whoosh, loop entry resonance, metallic detachment clank, crash thuds, and fanfare chimes.

7. **Strict Responsive Study Environment**:
   - Conforms strictly to the simulation design system: soft light-blue study palette (`#F0F7FF`, `#E6F2FF`), zero CSS blowout, and cross-device responsiveness (PC, tablet, mobile).

---

## 📐 Physics Derivations

### 1. Conservation of Mechanical Energy
$$E_{\text{total}} = m g y + \frac{1}{2} m v^2 = m g h_0$$
$$v(y) = \sqrt{2g(h_0 - y)}$$

### 2. Normal Force & Centripetal Acceleration at Apex
At the very top of a loop ($y = 2R$):
$$F_{\text{radial}} = N + mg = \frac{m v^2}{R} \implies N = m\left(\frac{v^2}{R} - g\right)$$

### 3. The Condition for Loop Completion
To avoid falling off the track, $N \ge 0$:
$$\frac{v_{\text{apex}}^2}{R} \ge g \implies v_{\text{apex}} \ge \sqrt{gR}$$
Substituting into the energy conservation equation:
$$mgh_{\text{min}} = mg(2R) + \frac{1}{2}m(\sqrt{gR})^2 = 2.5mgR \implies h_{\text{min}} = 2.5R$$

---

## 🚀 Running Locally

No installation or build step is required. Simply open `index.html` in any modern web browser or serve via Python / Node:

```bash
# Using Python 3
python3 -m http.server 3000

# Open browser at:
http://localhost:3000
```
