# Spherical Mirrors & Ray Optics Virtual Laboratory (`/mirror_simulation`)

An interactive STEM optical simulation for NCERT Class 10 & Class 12 Physics exploring Concave & Convex spherical mirrors, the Mirror Equation, Cartesian sign conventions, and linear magnification.

## Key Features
- **Concave & Convex Mirror Types**: Real-time curvature switching ($f < 0$ vs. $f > 0$) with realistic curved reflective front rim and hatched silvering on the back side.
- **Cartesian Sign Convention**: Rigorous implementation where distances in front of mirror are negative ($-x$) and virtual distances behind mirror are positive ($+x$).
- **Three Principal Ray Paths**:
  1. Ray 1 (Red): Parallel ray reflecting through the principal focus $F$.
  2. Ray 2 (Blue): Ray through focus reflecting parallel to the principal axis.
  3. Ray 3 (Green): Ray through center of curvature $C$ retracing its incident trajectory.
- **Draggable Interactive Candle**: Drag candle horizontally along the bench axis to change object distance $u$, or drag flame tip vertically to change object height $h_o$.
- **Image Formation Physics**: Renders inverted real images or glowing erect virtual images with dashed retro-projected extensions behind the mirror.
- **Standard Presets**:
  - Beyond $C$ ($u > 2f$)
  - At $C$ ($u = 2f$)
  - Between $C$ & $F$ ($f < u < 2f$)
  - At $F$ ($u = f$, image at infinity)
  - Between $F$ & $P$ ($u < f$, virtual magnified dental mirror)
  - Convex mirror (rear-view mirror setting)
- **Procedural Web Audio API**: Ray ticks and snap chimes synthesized dynamically.
- **Observation Notebook & Practice Challenges**: Record experimental trials into an observation ledger, and take randomized calculation quizzes.

## Running Locally
```bash
cd mirror_simulation
# Open index.html in any modern browser
```
