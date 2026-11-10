# Refraction Through a Rectangular Glass Slab & Lateral Displacement

A zero-dependency, responsive virtual optics laboratory adhering to NCERT Class 10/12 Science curriculum.

## Features
- **Rigorous Snell's Law & Lateral Displacement Engine**: Calculates $r = \arcsin(\sin(i)/n)$ and lateral shift $d = \frac{t \sin(i - r)}{\cos(r)}$.
- **Interactive Laser & Pin Method**: Drag incident laser source or switch to classical 4-pin practical alignment ($P_1, P_2, P_3, P_4$).
- **Visual Overlays**: Normal lines ($N_1, N_2$), angle arcs, undeviated ray extension, and protractor angle guide.
- **Material Presets**: Crown Glass ($1.52$), Flint Glass ($1.66$), Water ($1.33$), Fused Quartz ($1.46$), and Diamond ($2.42$).
- **Responsive Layout**: Soft light-blue study aesthetic (`#F0F7FF`), dual-font typography (`Plus Jakarta Sans` + `JetBrains Mono`), and touch device support.
- **Web Audio Synthesis**: Procedural laser hum and optical click feedback.

## Running Locally
```bash
cd glass_slab_simulation
node server.js
```
Open [http://localhost:8115](http://localhost:8115) in your web browser.

