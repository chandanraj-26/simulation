# Inclined Plane, Friction & Angle of Repose Virtual Laboratory

A zero-dependency, responsive physics virtual laboratory adhering to NCERT Class 11 Science curriculum.

## Features
- **Newtonian Kinematics & Friction Engine**: Computes exact normal force $N = mg \cos\theta$, static friction $f_s \le \mu_s N$, kinetic friction $f_k = \mu_k N$, and sliding acceleration $a = g(\sin\theta - \mu_k \cos\theta)$.
- **Angle of Repose Detection**: $\theta_c = \arctan(\mu_s)$ with immediate automatic transition from static to kinetic regime.
- **Dynamic Free Body Diagram (FBD)**: Live visual force vector overlays on the block for $\vec{N}$, $\vec{W} = mg$, and $\vec{f}$.
- **Dual Optical Photogates**: Measures transit time $\Delta t$ and terminal velocity $v$.
- **Surface Presets**: Wood on Wood, Steel on Steel, Glass on Glass, Rubber on Concrete, and Teflon on Teflon.
- **Web Audio Synthesis**: Procedural ratchet clicks, friction scraping sound, and photogate chimes.

## Running Locally
```bash
cd inclined_plane_simulation
node server.js
```
Open [http://localhost:8118](http://localhost:8118) in your web browser.

