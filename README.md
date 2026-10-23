# Interactive Physics Simulations Suite

A collection of interactive, client-side STEM physics simulations built with HTML5 Canvas, modern Vanilla CSS, and JavaScript.

---

## 🔬 Simulations Included

### 1. 🔍 [Lens Simulation (`/lens_simulation`)](lens_simulation/)
- **Convex & Concave Lenses**: Real-time ray tracing (Ray 1, Ray 2, Ray 3) and virtual ray back-extensions.
- **Interactive Objects**: Upright Arrow, Candle Flame, and **Student Character** (with ray emissions from the raised index fingertip).
- **Image Formation**: Real inverted images on projection screens vs. upright holographic virtual images.
- **HUD & Bench Controls**: Live focal length ($f$), object distance ($u$), image distance ($v$), and magnification ($m$).

### 2. 🌈 [Prism Simulation (`/prism_simulation`)](prism_simulation/)
- **Light Refraction & Snell's Law**: $n_1 \sin(\theta_1) = n_2 \sin(\theta_2)$ with incident angle and prism apex angle controls.
- **VIBGYOR Chromatic Dispersion**: Cauchy dispersion equation modeling wavelength-dependent refractive indices ($n(\lambda) = A + B/\lambda^2$).
- **Total Internal Reflection (TIR)**: Critical angle $\theta_c$ calculation and visualization.
- **Monochromatic & White Light Sources**: Real-time spectrum analysis.

### 3. 🚀 [Rocket Simulation (`/rocket_simulation`)](rocket_simulation/)
- **Newton's Laws of Motion**: $F_{\text{net}} = ma$, action-reaction pairs, weight ($W = mg$), and thrust.
- **Atmospheric Layers & Karman Line**: Troposphere through Outer Space cross-section.
- **2D Thrust Vectoring**: Real-time trajectory plotting and force resolution ($F_x, F_y$).
- **Telemetry Graphs & CSV Export**: Real-time altitude, velocity, and acceleration plotting.

### 4. ⚖️ [Wheatstone Bridge Simulation (`/wheatstone_bridge_simulation`)](wheatstone_bridge_simulation/)
- **Classical 4-Resistor Network**: Nodal analysis, Thévenin equivalent circuit, galvanometer null-deflection.
- **Meter Bridge Laboratory Bench**: 100 cm slide-wire apparatus, draggable jockey, and end error corrections.
- **Resistivity Determination**: Specific resistance ($\rho$) calculation from wire gauge and length.

### 5. 🌊 [Archimedes' Principle Simulation (`/archimedes_simulation`)](archimedes_simulation/)
- **Eureka Overflow Can**: Spring balance tension ($W_{\text{apparent}}$), overflow spout fluid displacement into a digital-scale graduated catch cylinder.
- **Hydrostatic Depth Pressure & FBD**: Pressure vectors $P(y) = P_0 + \rho g y$ acting on all surfaces, proving $F_B = \Delta P \cdot A$, plus Free Body Diagram vectors.
- **Flotation, Boat Cargo & Crown Mystery**: Damped harmonic bobbing, Plimsoll line cargo capacity, and King Hiero's golden crown density test.
- **Telemetry & Lab Notebook**: Real-time Apparent Weight Loss vs Displaced Fluid Weight logger with CSV export.

### 6. 🧪 [Acid-Base Indicator Simulation (`/acid_base_simulation`)](acid_base_simulation/)
- **Spot Plate & Test Tubes Lab**: 4 glass test tubes on wooden rack, 6-well porcelain spot plate, 14 reagents, and detective mystery analytes.
- **Interactive Reagent Pipettes & Litmus Strips**: Reagent dropper bottles with falling drops, Blue/Red litmus strips, universal pH test paper, and draggable benchtop digital pH meter probe.
- **Analytical Acid-Base Titration Lab**: 50 mL glass burette with working stopcock, Erlenmeyer flask on active magnetic stirrer with spinning bar and liquid vortex, and live real-time Titration Curve ($pH$ vs. $V_{\text{titrant}}$) graph.
- **Microscopic Molecular Equilibrium**: Real-time Brownian motion of $[HIn]$ and $[In^-]$ molecules demonstrating Henderson-Hasselbalch relation ($pH = pK_a + \log([In^-]/[HIn])$).
- **9 Supported Indicators**: Universal Indicator, Phenolphthalein, Bromothymol Blue, Methyl Orange, Litmus Solution, Red Cabbage (Anthocyanin), Turmeric (Curcumin), Phenol Red, Thymol Blue.
- **Interactive Student Quests & Lab Notebook**: 5 gamified STEM missions, synthesized Web Audio sound FX, and CSV export.

### 7. 🎯 [Projectile Motion Simulation (`/projectile_simulation`)](projectile_simulation/)
- **2D Kinematics Engine**: Analytical trajectory equations & numerical quadratic air drag ($F_{\text{drag}} = \frac{1}{2} C_d \rho A v^2$).
- **Live Vector Overlays**: Real-time velocity decomposition ($\vec{v}, \vec{v}_x, \vec{v}_y$) and downward acceleration ($\vec{g}$).
- **Interactive Modes**: Firing Range (free physics exploration), Target Challenge (bullseye mini-game with scoring), and Multi-Angle Plot (complementary angles symmetry visualization).
- **Celestial Gravity & Projectiles**: Earth, Moon, Mars, Jupiter gravity environments with 5 projectiles (Cannonball, Baseball, Golf Ball, Tank Shell, Grand Piano).
- **In-App Zoom & Synthesized Sound**: Centered smooth scaling HUD controls, recoil animation, and Web Audio API blast and hit sounds.

### 8. ⚖️ [Hooke's Law & Spring-Mass Scale (`/spring_simulation`)](spring_simulation/)
- **Linear Elasticity & Spring Scale**: Hooke's law $F_s = -k \Delta x$ and mass weighing balance $m = \frac{k \Delta x}{g}$.
- **Simple Harmonic Motion (SHM)**: 60 FPS Runge-Kutta 4th Order (RK4) numerical integrator, natural frequency $\omega_0 = \sqrt{k/m}$, period $T_0 = 2\pi\sqrt{m/k}$, and critical damping controls.
- **Series & Parallel Linkages**: Dynamic effective stiffness ($k_{\text{eff}} = k_1 + k_2$ in parallel vs. $k_{\text{eff}} = \frac{k_1 k_2}{k_1 + k_2}$ in series).
- **Laboratory Bench Apparatus**: Realistic 3D metallic spring coils, slotted brass weights (50g–1000g), mystery objects (Royal Crown, Quartz Gem, Wood Block), metric ruler, and digital stopwatch with photogate timer.
- **Waveforms & Energy Conservation**: Live displacement wave oscilloscope $x(t)$, real-time mechanical energy bar chart ($E_k, E_p, E_{\text{total}}$), and force vector arrows.

### 9. 🕰️ [Simple Pendulum & Galileo's Isochronism (`/pendulum_simulation`)](pendulum_simulation/)
- **Galileo's Isochronism (1581)**: Dual pendulum comparison proving period is independent of amplitude for small angles and independent of bob mass.
- **Nonlinear Kinematics Engine**: 60 FPS RK4 solver for $\ddot{\theta} + \frac{b}{mL^2}\dot{\theta} + \frac{g}{L}\sin\theta = 0$, Legendre elliptic series expansion for large angles ($T = T_0(1 + \frac{1}{16}\theta_0^2 + \dots)$), and dynamic string tension resolution.
- **Optical Photogate & Protractor**: Interactive angle protractor arc, laser diode photogate sensor at $\theta = 0$ measuring period automatically with sound feedback.
- **Phase Space & Waveforms**: Real-time oscilloscope waveform $\theta(t)$, closed-orbit Phase Space Portrait ($\theta$ vs. $\omega$), and Mechanical Energy Bar Chart ($E_k, E_p, E_{\text{total}}$).

### 10. 🌿 [Osmosis & Cell Plasmolysis Lab (`/osmosis_simulation`)](osmosis_simulation/)
- **Onion Epidermal Plant Cell**: Rigid outer cellulose cell wall, dynamic protoplast and central vacuole, turgor pressure ($\Psi_p$ up to 0.8 MPa) in hypotonic solution, and corner detachment (**plasmolysis**) in hypertonic salt solution ($\ge 7.0\%$).
- **Red Blood Cell (Animal Cell)**: Normal biconcave disc in physiological 0.9% saline, spiky crenation in hypertonic, and osmotic burst (**hemolysis**) in hypotonic solutions ($\le 0.2\%$).
- **U-Tube Osmometer**: Semi-permeable membrane demonstrating hydrostatic column height rise ($\Delta h$) proportional to solute concentration gradient.
- **Aquaporin Molecular View**: Lipid bilayer channel proteins facilitating single-file water flux while blocking solute particles.
- **Biophysics Engine**: Real-time solute potential $\Psi_s = -iCRT$, pressure potential $\Psi_p$, 5 gamified laboratory quests, and zero-blowout layout at 100% zoom.

### 11. 🌱 [Photosynthesis & Elodea Bubble Counter (`/photosynthesis_simulation`)](photosynthesis_simulation/)
- **Apparatus Bench**: Movable illuminating lamp on metric ruler bench, submerged fresh *Elodea densa* waterweed sprig, inverted glass funnel, graduated collection tube accumulating oxygen gas volume ($V_{O_2}$ in mL), and flashing optical infrared bubble photogate.
- **Limiting Factors (Blackman's Law)**: Inverse-square light intensity ($I \propto 1/d^2$), Engelmann's action spectrum (White, Blue 450nm, Red 660nm, Green 530nm paradox), $\text{NaHCO}_3$ saturation curve, and temperature enzyme kinetics (optimum vs denaturation).
- **Interactive Modes**: Laboratory apparatus bench, thylakoid photolysis & Calvin cycle molecular view, and real-time kinetic curves graph.
- **Strict Light Theme**: Clean, bright, professional laboratory aesthetic with digital stopwatch and 5 gamified quests.

### 12. ⚛️ [Periodic Table & Hinglish Mnemonics Simulator (`/PT_Table_simulation`)](PT_Table_simulation/)
- **Complete 118 IUPAC Elements**: Complete physical, chemical, and electron configuration data from Hydrogen ($Z=1$) to Oganesson ($Z=118$).
- **Indian Coaching Hinglish Mnemonics**: Group 2 *"Beta Mange Car Scooter Baap Raazi"*, Group 1 *"Helina Ki Rab Se Fariyad"*, Group 13 *"Baingan Aloo Gajar In Thela"*, 3d series *"Science Teacher Vineeta..."*, Lanthanides, and Actinides.
- **Interactive 2D Bohr Atom Visualizer**: Canvas planetary electron orbital animation with concentric shells ($K, L, M, N, O, P, Q$) and nucleus proton/neutron telemetry.
- **Periodic Trends Continuous Heatmaps**: Live color gradient across the table for Electronegativity, Atomic Radius, Ionization Energy, Melting Point, and Density.
- **Synthesized Audio & Speech**: Zero-dependency procedural Web Audio sound FX and Web Speech API pronunciation engine for Hinglish mnemonics.

### 13. 🔊 [Doppler Waves & Mach Cone Simulator (`/doppler_simulation`)](doppler_simulation/)
- **Spherical Acoustic Wavefronts**: 60 FPS expanding ring emissions demonstrating subsonic wavelength compression ($\lambda_{\text{front}} = \frac{v - v_s}{f_0}$) and rarefaction ($\lambda_{\text{rear}} = \frac{v + v_s}{f_0}$).
- **Supersonic Flight & Mach Shock Cone**: Sonic boom barrier constructive interference ($M = 1$) and supersonic conical Mach shockwave envelopes ($M > 1$) with half-angle $\mu = \arcsin(1/M)$.
- **Procedural Doppler Audio Engine**: Web Audio API continuous pitch synthesizer, emergency siren mode with stereo panning, and sonic boom pressure burst FX.
- **5 Exploration Modes**: Subsonic Motion, Mach Cone, Moving Observer, Passing Siren, and Static Source calibration.

### 14. 💎 [Diamond Light Refraction & Cut Simulator (`/diamond_simulation`)](diamond_simulation/)
- **Snell's Law & Cauchy Chromatic Dispersion**: Accurate multi-wavelength ray tracing through faceted gem polygons with wavelength-dependent refractive indices $n(\lambda) = n_D + B(1/\lambda^2 - 1/\lambda_D^2)$.
- **Total Internal Reflection (TIR)**: Precise critical angle boundary calculation ($\theta_c = \arcsin(1/n) \approx 24.4^\circ$ for diamond vs $41.1^\circ$ for glass) with internal bounce tracing and sparkle pings.
- **Marcel Tolkowsky 1919 Ideal Cut Proportions**: Real-time brilliance return and fire dispersion metrics comparing Tolkowsky Ideal ($34.5^\circ$ crown, $40.75^\circ$ pavilion) against Shallow (fish-eye bottom leakage) and Deep (nail-head side extinction) cuts.
- **Gemstone Library & Tunable Light**: Explore Diamond, Moissanite, Cubic Zirconia, Sapphire, Zircon, and Crown Glass with White Light (VIBGYOR fire fan) or Monochromatic Laser ($380\text{–}750\text{ nm}$).

### 15. ❤️ [Human Cardiac Cycle & ECG Simulator (`/cardiac_simulation`)](cardiac_simulation/)
- **4-Chamber Heart Anatomy & Valves**: Beating myocardium, synchronized Tricuspid, Mitral, Pulmonary, and Aortic valves with papillary muscles and chordae tendineae.
- **Electrical Conduction Highway**: SA node pacemaker, internodal pathways, 0.12s AV nodal delay, and His-Purkinje network propagation.
- **Synchronized Wiggers Diagram**: Real-time Lead II ECG (P-QRS-T), ventricular and aortic pressures with **Dicrotic Notch**, ventricular volume ($EDV \to ESV$), and phonocardiogram (PCG).
- **Procedural Web Audio & Auscultation Bench**: Zero-dependency synthesis of $S_1$ ("LUB") and $S_2$ ("DUB"), draggable stethoscope over clinical landmarks (Aortic, Pulmonic, Tricuspid, Mitral/Apex), and pathological murmurs.


### 16. 🔬 [Virtual Compound Microscope & Mitosis Simulator (`/microscope_simulation`)](microscope_simulation/)
- **Revolving Objective Nosepiece & Optics**: 4× Scanning, 10× Low Power, 40× High Power, and 100× Oil Immersion ($n = 1.515$) with coarse/fine micrometric focus and depth-of-field blur.
- **Authentic Cytology Specimen Slides**: Onion Root Tip Squash (*Allium cepa*) with primary cellulose cell plate cytokinesis, and Whitefish Blastula (*Coregonus*) with radiating astral rays (asters) and cleavage furrow.
- **All 5 Stages of Mitosis**: Interphase, Prophase, Metaphase, Anaphase, and Telophase with stained chromatin, kinetochores, and spindle fiber tracking.
- **Interactive Cell Tagging & Mitotic Index**: Live scorecard calculating meristematic Mitotic Index ($\text{MI} = \frac{\text{Dividing}}{\text{Total}} \times 100\%$) and stage micrometer calibration ($0.01\text{ mm} / 10\ \mu\text{m}$).
---

## 💻 Tech Stack
- **Pure Web Standards**: HTML5, Canvas 2D API, CSS3, ES6+ JavaScript.
- **Zero External Dependencies**: Works out-of-the-box locally or deployed to Vercel / GitHub Pages.

---

## 🚀 Running Locally
You can run any simulation using any static web server:

```bash
# Virtual Compound Microscope & Mitosis Simulator
cd microscope_simulation
node server.js   # http://localhost:8099

# Human Cardiac Cycle & ECG Simulator
cd cardiac_simulation
python -m http.server 8098

# Diamond Light Refraction & Cut Simulator
cd diamond_simulation
python -m http.server 8097

# Doppler Waves & Mach Cone Simulator
cd doppler_simulation
python -m http.server 8096

# Periodic Table & Hinglish Mnemonics Simulator
cd PT_Table_simulation
python -m http.server 8095


# Photosynthesis & Elodea Bubble Counter Lab
cd photosynthesis_simulation
python -m http.server 8094

# Osmosis & Cell Plasmolysis Lab
cd osmosis_simulation
python -m http.server 8093

# Simple Pendulum & Galileo's Isochronism Simulation
cd pendulum_simulation
python -m http.server 8092

# Hooke's Law & Spring-Mass Scale Simulation
cd spring_simulation
python -m http.server 8091

# Projectile Motion Simulation
cd projectile_simulation
python -m http.server 8090

# Acid-Base Indicator Simulation
cd acid_base_simulation
python -m http.server 8089

# Archimedes' Principle Simulation
cd archimedes_simulation
python -m http.server 8088

# Lens Simulation
cd lens_simulation
python -m http.server 8085

# Prism Simulation
cd prism_simulation
python -m http.server 8099

# Rocket Simulation
cd rocket_simulation
python -m http.server 8080

# Wheatstone Bridge Simulation
cd wheatstone_bridge_simulation
python -m http.server 8082
```
Or simply open the `index.html` or `simulation.html` file in any modern web browser.




