# Rutherford Alpha Particle Scattering & Planetary Atom Virtual Laboratory

An interactive STEM atomic physics and chemistry virtual laboratory simulation for Class 9 and 12 students, modeling Ernest Rutherford's (1911) gold foil alpha particle scattering experiment, Coulomb repulsive force dynamics, and the discovery of the dense atomic nucleus.

## Scientific Phenomenon Modeled
- **Rutherford's Landmark Experiment (1911)**:
  - Alpha particle beam ($q_1 = +2e$, $\text{He}^{2+}$ ions, $E_k \approx 5.5\text{ MeV}$) from a Polonium radioactive source in a lead collimator box.
  - Bombardment of a 100 nm ultra-thin Gold leaf ($Z = 79$, approx. 1000 atomic layers).
  - Circular Zinc Sulfide ($\text{ZnS}$) phosphorescent scintillation detector screen with movable eyepiece microscope on a $\pm 180^\circ$ track.
  - Three landmark observations:
    1. **Most particles (&gt; 99%) pass straight through undeflected** ($\theta < 5^\circ$) $\implies$ The atom is almost entirely empty space.
    2. **A small fraction undergoes moderate deflection** ($5^\circ \le \theta < 90^\circ$) $\implies$ Concentrated positive charge.
    3. **Rare backscattering ($\theta \ge 90^\circ$, 1 in 8,000 to 12,000)** $\implies$ Total positive charge and almost all mass is concentrated in an ultra-dense, minute nucleus ($r \sim 10^{-14}\text{ m}$) compared to atomic radius ($r \sim 10^{-10}\text{ m}$).
- **Coulomb Scattering Law & Hyperbolic Trajectories**:
  $$b = \frac{z Z e^2}{4\pi\varepsilon_0 m v^2} \cot\left(\frac{\theta}{2}\right) \quad \text{and} \quad N(\theta) \propto \frac{1}{\sin^4(\theta / 2)}$$
- **J.J. Thomson Plum Pudding Comparison Mode**:
  - Direct side-by-side comparison with Thomson's 1904 model (diffuse positive charge sphere with embedded electrons) demonstrating why Thomson's atom cannot deflect alpha particles by more than $0.8^\circ$.

## Zero-Dependency Architecture
Pure native HTML5, CSS3, ES6+ JavaScript, Canvas 2D, and procedural Web Audio API obeying `simulation-guidelines`.

## How to Run
```bash
node server.js
```
Open [http://localhost:8078/](http://localhost:8078/) in any modern web browser.
