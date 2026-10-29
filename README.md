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

### 17. 🔥 [Flame Test & Atomic Emission Spectra Simulator (`/flame_test_simulation`)](flame_test_simulation/)
- **Quantum Electron Transitions & Bohr Model**: Real-time photon emission ($\Delta E = h\nu = \frac{hc}{\lambda}$) during valence orbital de-excitation.
- **Precision Bunsen Burner**: Adjustable gas valve ($0–100\%$) and rotating brass air collar (luminous yellow safety flame $\to$ non-luminous roaring blue heating cone at $\sim 1300^\circ\text{C}$).
- **7 Supported Metal Salts**: $\text{NaCl}$ (Golden Yellow D-line, $589\text{ nm}$), $\text{KCl}$ (Lilac, $404\text{ nm}$), $\text{CuCl}_2$ (Emerald Green/Cyan, $521\text{ nm}$), $\text{SrCl}_2$ (Crimson, $660\text{ nm}$), $\text{CaCl}_2$ (Brick Red, $622\text{ nm}$), $\text{BaCl}_2$ (Apple Green, $553\text{ nm}$), $\text{LiCl}$ (Carmine Magenta, $671\text{ nm}$).
- **Calibrated Quantum Spectroscope**: High-resolution nanometer diffraction scale ($380–750\text{ nm}$) rendering discrete emission lines with live photon energy ($\text{eV}$).
- **Cobalt Blue Glass Filter & Mystery Cation Detective**: $\text{Co}^{2+}$ optical silicate filter for yellow absorption, loop decontamination with conc. $\text{HCl}$, and blind mystery sample deduction challenges.

### 18. 🧪 [Reaction Kinetics & The Disappearing Cross Simulator (`/kinetics_simulation`)](kinetics_simulation/)
- **Colloidal Sulfur Precipitation Dynamics**: $\text{Na}_2\text{S}_2\text{O}_3 + 2\text{HCl} \to 2\text{NaCl} + \text{SO}_2 + \text{S}\downarrow + \text{H}_2\text{O}$ scattering light through solution.
- **Top-Down Erlenmeyer Flask & Ceramic Tile**: White porcelain tile with bold black cross ("X") progressively obscured as sulfur turbidity reaches critical threshold ($<8\%$ transmittance).
- **Differential Rate Laws & Concentration Series**: Verification of first-order kinetics with respect to thiosulfate ($\text{Rate} \propto [\text{Na}_2\text{S}_2\text{O}_3]$).
- **Arrhenius Equation & Activation Energy**: Temperature regulation ($10^\circ\text{C}–65^\circ\text{C}$), live $\ln(1/t)$ vs. $1/T$ plot, and automatic $E_a$ calculation ($\approx 52\text{ kJ/mol}$).
- **Analytical Lab Notebook & CSV Export**: Automated stopwatch timer, photometer extinction alarm bell, trial history recording, and one-click data export.

### 19. 🎈 [Kinetic Gas Laws & Ideal Gas Simulator (`/gas_laws_simulation`)](gas_laws_simulation/)
- **Ideal Gas Equation & KMT Engine**: Full microscopic hard-sphere elastic wall collision physics yielding macroscopic $PV = nRT$.
- **Draggable Piston Cylinder Chamber**: Smooth interactive volume variation from $5.0\text{ L}$ to $25.0\text{ L}$ with live Bourdon tube analog pressure manometer.
- **Classical Gas Law Locks**: Lock Temperature (Boyle: $P \propto 1/V$), Lock Pressure (Charles: $V \propto T$), or Lock Volume (Gay-Lussac: $P \propto T$).
- **Maxwell-Boltzmann Velocity Distributions**: Real-time speed histograms comparing light Helium ($v_{\text{rms}} \approx 1370\text{ m/s}$) against heavy Argon ($v_{\text{rms}} \approx 430\text{ m/s}$).
- **Bicycle Pump & Substage Thermal Bath**: Inject gas moles ($n$), vent gas, and adjust absolute temperature from $100\text{ K}$ to $750\text{ K}$ with live P-V and V-T state diagrams.

### 20. ⚡ [Electrolysis of Water & Copper Electroplating Simulator (`/electrolysis_simulation`)](electrolysis_simulation/)
- **Hofmann Voltameter & Acidified Water**: Dilute $0.1\text{ M } \text{H}_2\text{SO}_4$ decomposition on platinum electrodes with dynamic meniscus displacement.
- **Stoichiometric 2:1 Gas Volume Ratio**: Accurate analytical evolution of Hydrogen ($V_{\text{H}_2}$, cathode) and Oxygen ($V_{\text{O}_2}$, anode) at exactly $2 : 1$ molar and volumetric ratio.
- **Interactive Gas Identification Tests**: Test Hydrogen tap with a burning splint to trigger the characteristic **Squeaky Pop explosion**, and test Oxygen with a glowing splint to observe **flame reignition**.
- **Copper Electroplating Bath**: Faraday's First Law ($m = \frac{M \cdot I \cdot t}{z \cdot F}$) depositing pure copper onto an iron key cathode in blue $\text{CuSO}_4$ solution with real-time thickness ($\mu\text{m}$) and $\text{Cu}^{2+}$ ion migration drift.
- **Digital DC Power Supply**: Variable voltage ($0–12\text{ V}$), decomposition overpotential threshold ($1.78\text{ V}$), procedural effervescent bubbling audio, and 5 NCERT curriculum quests.

### 21. ⚗️ [Reactivity Series & Metal Displacement Reactions Simulator (`/reactivity_series_simulation`)](reactivity_series_simulation/)
- **Single Replacement Reactions**: Explore electropositivity and displacement ($A + BC \to AC + B$) across $\text{Fe}$, $\text{Zn}$, $\text{Cu}$, $\text{Mg}$, and $\text{Ag}$ metals.
- **Color Transitions & Precipitation**: Iron nail turning blue $\text{CuSO}_4$ into pale green $\text{FeSO}_4$, zinc decolorizing copper sulfate with spongy copper precipitate, and sparkling dendritic silver crystal needles growing on copper wire in $\text{AgNO}_3$.
- **Thermodynamic Enthalpy Rise**: Measurable exothermic temperature rise with submerged digital thermometer probe ($\Delta T > 6^\circ\text{C}$).
- **Electrochemical Ladder & Coaching Mnemonic**: Complete reduction potentials ($E^\circ$) and audio speech synthesis reciting the classic Hinglish mnemonic *"Kedar Nath Ka Mali Aalu Zara Pheeke Pakata Hai, Kyun-ki Hoga Ag Au"*.

### 22. ⚖️ [Law of Conservation of Mass Simulator (`/conservation_of_mass_simulation`)](conservation_of_mass_simulation/)
- **Antoine Lavoisier (1789) & NCERT Activity 3.1**: Verify mass invariance ($m_1 = m_2, \Delta m = 0.000\text{ g}$) across chemical reactions.
- **Precipitation Systems**: $\text{BaCl}_2 + \text{Na}_2\text{SO}_4 \to \text{BaSO}_4\downarrow + 2\text{NaCl}$ (milky white precipitate) and $\text{Pb(NO}_3)_2 + 2\text{KI} \to \text{PbI}_2\downarrow + 2\text{KNO}_3$ (golden canary yellow precipitate).
- **Closed vs. Open Flask Investigation**: $\text{CaCO}_3 + 2\text{HCl} \to \text{CaCl}_2 + \text{H}_2\text{O} + \text{CO}_2\uparrow$ demonstrating that sealed cork preserves mass, while uncorked flask shows an apparent mass drop from escaping $\text{CO}_2$ gas.
- **Digital Analytical Balance & Flask Tilting**: High-precision $\pm 0.001\text{ g}$ balance, $250\text{ mL}$ conical flask with suspended ignition tube, tilt and swirl animation, and real-time atomic accounting ledger.

### 23. ⚛️ [Rutherford Alpha Particle Scattering & Planetary Atom Simulator (`/rutherford_simulation`)](rutherford_simulation/)
- **Ernest Rutherford (1911) Gold Foil Experiment**: Polonium alpha source ($\text{He}^{2+}$, $5.5\text{ MeV}$), $100\text{ nm}$ gold foil, and circular Zinc Sulfide ($\text{ZnS}$) phosphorescent screen.
- **Three Landmark Observations**: Overwhelming pass-through ($>99\%$ with $\theta < 5^\circ$ proving mostly empty space), small/moderate deflections ($5^\circ \le \theta < 90^\circ$), and rare dramatic backscattering ($\theta \ge 90^\circ$, 1 in ~8,000 to 12,000) discovering the dense nucleus.
- **Dual Perspective & Plum Pudding Model**: Switch between Macro Bench Apparatus view and Microscopic Nuclear zoom with hyperbolic Coulomb trajectories, plus side-by-side comparison with J.J. Thomson's 1904 Plum Pudding model.
- **Real-Time Angular Histogram**: Live $N(\theta) \propto \frac{1}{\sin^4(\theta / 2)}$ bar chart, movable detector telescope on $\pm 180^\circ$ track, and Geiger counter audio clicks.

### 24. 🧊 [Solubility Curves, Saturated Solutions & Crystallization Simulator (`/solubility_simulation`)](solubility_simulation/)
- **Thermodynamic Solubility Equilibrium**: Analytical $S(T)$ polynomials in $g\text{ solute} / 100g\ \text{H}_2\text{O}$ across $\text{KNO}_3$ (steep endothermic), $\text{NaCl}$ (flat), $\text{CuSO}_4$ (blue crystals), and $\text{Ce}_2(\text{SO}_4)_3$ (retrograde exothermic).
- **Interactive Laboratory Apparatus**: $250\text{ mL}$ borosilicate beaker on ceramic wire gauze with cast-iron tripod and adjustable Bunsen burner flame ($20^\circ\text{C} \to 100^\circ\text{C}$).
- **Crystallization from Supersaturation**: Cooling with ice bath and introducing a seed crystal to grow sparkling pure geometric crystal clusters.
- **Dynamic Phase Diagram ($S$ vs. $T$)**: Live operating coordinate $(T, m_{\text{added}})$, saturation boundary curve, and unsaturated vs. supersaturated zones.

### 25. 🔦 [Tyndall Effect, Colloids & Suspensions Virtual Lab (`/tyndall_simulation`)](tyndall_simulation/)
- **NCERT Class 9 Activities 2.1 & 2.2**: Direct comparative investigation of True Solutions ($<1\text{ nm}$), Colloidal Sols ($1\text{–}1000\text{ nm}$), and Suspensions ($>1000\text{ nm}$).
- **Rayleigh-Tyndall Scattering ($I \propto 1/\lambda^4$)**: Tunable laser diode across Red ($650\text{ nm}$), Green ($532\text{ nm}$), and Blue ($405\text{ nm}$) demonstrating $6.6\times$ scattering intensification for shorter wavelengths.
- **Three-Beaker Optical Bench**: Simultaneous visual alignment comparing invisible beam in $\text{CuSO}_4$, bright Tyndall cone in milk/starch sol, and turbid light scattering in chalk suspension.
- **Brownian Motion Ultramicroscope**: Thermal molecular collision simulation tracking chaotic zig-zag trajectories of colloidal particles.
- **Filtration Funnel Separation**: Porous filter paper retention testing proving suspension coarse particles are retained while colloids and true solutions pass through.

### 26. 🧪 [Thermal Decomposition of Ferrous Sulfate Crystals (`/ferrous_sulfate_simulation`)](ferrous_sulfate_simulation/)
- **Class 10 NCERT Chapter 1 Activity 1.5**: Direct thermal heating of $\text{FeSO}_4 \cdot 7\text{H}_2\text{O}$ crystals in a borosilicate boiling tube clamped at $45^\circ$ safety tilt.
- **Two-Stage Reaction Thermodynamics**:
  - Stage 1: Dehydration ($\sim 100\text{–}300^\circ\text{C}$) losing 7 water molecules, converting pale green crystals into dirty white anhydrous $\text{FeSO}_4$, with condensed water droplets forming on cooler upper tube walls.
  - Stage 2: Strong decomposition ($>500^\circ\text{C}$) yielding reddish-brown ferric oxide ($\text{Fe}_2\text{O}_3$) residue and evolving acidic, choking $\text{SO}_2$ and $\text{SO}_3$ gases.
- **Gas Identification Tests**: Moist blue litmus paper turning red on contact with acidic sulfur fumes, and acidified potassium dichromate ($\text{K}_2\text{Cr}_2\text{O}_7$) paper turning from orange to green ($\text{Cr}^{3+}$).
- **NCERT Safety Wafting Motion**: Interactive hand-wafting gesture to detect burning sulfur odor safely without direct inhalation.
- **Dynamic Stoichiometric Mass Ledger**: Live tracking of crystal mass ($2.000\text{ g}$ initial $\to 0.575\text{ g}$ residue) with procedural flame hissing and crystal crackling audio.

### 27. 🎢 [Roller Coaster Kinematics & Loop Fail Dynamics (`/roller_coaster_simulation`)](roller_coaster_simulation/)
- **Real-Time Numerical Kinematics & Energy**: Continuous numerical integration of cart velocity, arc-distance $s$, height $y$, and local track curvature $\kappa$ with live $KE$ and $PE$ telemetry.
- **The 2.5R Rule & Critical Apex Velocity**: Interactive demonstration showing why drop height $h_{\text{min}} \ge 2.5R$ and apex velocity $v \ge \sqrt{gR}$ are required for normal force $N \ge 0$.
- **Loop Fail Dynamics & Ballistic Projectile Flight**: Automatic detachment and transition into 2D projectile motion ($a_x = 0, a_y = -g$) with rotational tumbling and impact FX when $N \le 0$.
- **Circular vs. Clothoid (Teardrop) Loops**: Comparative analysis of spine-compressing circular G-forces against smooth modern Euler spiral clothoids.


### 28. 🌿 [Paper Chromatography & Plant Pigments Virtual Lab (`/chromatography_simulation`)](chromatography_simulation/)
- **Washburn Capillary Dynamics & Partition**: Dynamic solvent front migration ($h(t) \propto \sqrt{t}$) through Whatman No. 1 cellulose fibers in an airtight sealed chamber.
- **Chloroplast Pigment Separation**: Complete chromatographic resolution of Spinach extract into $\beta$-Carotene ($R_f \approx 0.94$), Xanthophyll ($R_f \approx 0.72$), Chlorophyll $a$ ($R_f \approx 0.58$), and Chlorophyll $b$ ($R_f \approx 0.42$).
- **Synthetic Black Ink Resolution**: Resolves black marker dye into Cyan ($R_f \approx 0.82$), Magenta ($R_f \approx 0.54$), and Tartrazine Yellow ($R_f \approx 0.28$).
- **Interactive Metric $R_f$ Ruler**: Draggable metric ruler measuring solute migration vs solvent front with real-time $R_f = d_{\text{solute}} / d_{\text{solvent}}$ calculation and procedural Web Audio droplet sound FX.

### 29. ⚗️ [Redox Titration & Permanganometry Virtual Lab (`/redox_titration_simulation`)](redox_titration_simulation/)
- **Self-Indicating Permanganometry**: Standard $0.02\text{ M } \text{KMnO}_4$ reducing to colorless $\text{Mn}^{2+}$ in acidic medium, with sharp permanent faint pink equivalence detection.
- **Primary Standards**: Titration of Mohr's Salt ($5\text{Fe}^{2+} + \text{MnO}_4^- + 8\text{H}^+ \to 5\text{Fe}^{3+} + \text{Mn}^{2+} + 4\text{H}_2\text{O}$) and Oxalic Acid with thermal water bath kinetics ($60\text{–}70^\circ\text{C}$).
- **Laboratory Bench Apparatus**: $50\text{ mL}$ glass burette with dark upper meniscus reading, working stopcock, and magnetic stirrer hotplate with spinning Teflon bar and liquid vortex.
- **Live Potentiometric Redox Curve**: Real-time Nernst cell potential ($E_{\text{cell}}$ vs. $V_{\text{titrant}}$) graph tracking sigmoidal inflection at equivalence ($V_{\text{eq}}$).

### 30. ⚡ [Galvanic Daniell Cell & Nernst Equation Virtual Lab (`/daniell_cell_simulation`)](daniell_cell_simulation/)
- **Electrochemical Couple & Nernst Law**: $\text{Zn}(s) | \text{Zn}^{2+}(aq) \parallel \text{Cu}^{2+}(aq) | \text{Cu}(s)$ with live Nernst equation $E_{\text{cell}} = E^\circ - \frac{0.0591}{2}\log_{10}([\text{Zn}^{2+}]/[\text{Cu}^{2+}])$ and Gibbs free energy $\Delta G$.
- **Draggable Salt Bridge**: U-tube filled with $\text{KCl}$ in agar-agar jelly; removing the bridge demonstrates immediate open-circuit drop to $0.000\text{ V}$.
- **Microscopic Electron Drift**: Animated electron transport along external copper wire to LED voltmeter, coupled with $\text{K}^+$ and $\text{Cl}^-$ ion migration through the salt bridge.
- **Faraday Mass Kinetics**: Live tracking of anodic zinc dissolution and cathodic copper deposition mass balance.

### 31. ⚖️ [Chemical Equilibrium & Le Chatelier's Principle Virtual Lab (`/le_chatelier_simulation`)](le_chatelier_simulation/)
- **Two Reversible Equilibrium Systems**:
  - Iron(III) Thiocyanate: $\text{Fe}^{3+} + \text{SCN}^- \rightleftharpoons [\text{Fe(SCN)}]^{2+}$ (blood red forward shift vs yellow reverse shift).
  - Cobalt(II) Hexaaqua / Tetrachloro: $[\text{Co(H}_2\text{O})_6]^{2+} + 4\text{Cl}^- \rightleftharpoons [\text{CoCl}_4]^{2-} + 6\text{H}_2\text{O}$ (endothermic blue forward shift vs pink reverse shift).
- **Perturbation Testing**: Interactive addition of $\text{FeCl}_3$, $\text{KSCN}$, Oxalic acid (complexation), $\text{AgNO}_3$ (precipitation), $\text{HCl}$, and hot ($80^\circ\text{C}$) / ice ($0^\circ\text{C}$) immersion baths.
- **4-Tube Laboratory Rack & Spectrophotometer**: Side-by-side comparison with reference standard tube, live laser absorption beam, and optical absorbance/transmittance readouts.

### 32. 💧 [Complexometric EDTA Titration & Water Hardness Virtual Lab (`/edta_titration_simulation`)](edta_titration_simulation/)
- **Complexometric Chelation Chemistry**: Standard $0.01\text{ M } \text{Na}_2\text{H}_2\text{Y}$ complexing $\text{Ca}^{2+}$ and $\text{Mg}^{2+}$ ($1 : 1$ stoichiometric stability constant $\log K_f \approx 10.7$).
- **Eriochrome Black T (EBT) Metal-Ion Indicator**: Sharp wine-red $[\text{M-In}]^-$ to free sky-blue $\text{HIn}^{2-}$ transition at equivalence point ($pH = 10.0$ buffered by $\text{NH}_3/\text{NH}_4\text{Cl}$).
- **Dual Hardness Diagnostics**: Analyze and compare Tap Water, Temporary Hard Water (boiling $\to$ precipitates $\text{CaCO}_3\downarrow$), Permanent Hard Water, and Distilled Water.
- **Precision Titration Bench & Dynamic Equivalence Curve**: $50\text{ mL}$ micro-stopcock burette, magnetic stirrer vortex, dynamic pCa titration curve, and hardness quantification in $\text{ppm } \text{CaCO}_3$.

### 33. 🧪 [Qualitative Organic Analysis & Functional Groups Virtual Lab (`/functional_groups_simulation`)](functional_groups_simulation/)
- **Comprehensive Organic Classifications**: Alkenes / Unsaturation, Alcohols ($-OH$), Aldehydes ($-CHO$), Ketones ($>C=O$), and Carboxylic Acids ($-COOH$).
- **Diagnostic Chemical Spot Tests**:
  - Unsaturation: Bromine Water decolourisation and Baeyer's alkaline $\text{KMnO}_4$ oxidation (purple to brown $\text{MnO}_2\downarrow$).
  - Alcohols: Sodium metal effervescence ($2\text{R-OH} + 2\text{Na} \to 2\text{R-ONa} + \text{H}_2\uparrow$) with burning splint squeaky pop sound.
  - Aldehydes: Tollens' Silver Mirror test ($[\text{Ag(NH}_3)_2]^+$ reduction to reflective metallic silver mirror coating) and Fehling's red cuprous oxide ($\text{Cu}_2\text{O}\downarrow$).
  - Carboxylic Acids: Saturated $\text{NaHCO}_3$ brisk effervescence of $\text{CO}_2\uparrow$ with lime water milky test.
- **Blind Mystery Sample Deduction**: Unknown compound challenge with structured elimination algorithm and animated test-tube reactions.

### 34. 🌡️ [Calorimetry & Heat of Neutralization Virtual Lab (`/calorimetry_simulation`)](calorimetry_simulation/)
- **Thermochemistry & Hess's Law**: High-precision Coffee-Cup Calorimeter measuring enthalpy of neutralization:
  $\Delta H_{\text{neut}} = -\frac{(m_{\text{sol}} c_{\text{sol}} + C_{\text{cal}}) \Delta T}{n_{\text{water}}}$
- **Three Prototypical Acid-Base Systems**:
  - Strong Acid + Strong Base: $\text{HCl} + \text{NaOH} \to \Delta H \approx -57.1\text{ kJ/mol}$ (theoretical benchmark).
  - Weak Acid + Strong Base: $\text{CH}_3\text{COOH} + \text{NaOH} \to \Delta H \approx -55.2\text{ kJ/mol}$ (accounting for dissociation enthalpy).
  - Strong Acid + Weak Base: $\text{HCl} + \text{NH}_4\text{OH} \to \Delta H \approx -51.5\text{ kJ/mol}$.
- **Interactive Calorimetric Bench**: Nested insulated polystyrene cups, rubber stopper with mechanical wire stirrer, and digital immersion thermometer probe ($\pm 0.01^\circ\text{C}$).
- **Real-Time Thermogram $T(t)$**: Dynamic temperature-time graph plotting thermal equilibration, peak exothermic surge, and asymptotic Newton's law cooling extrapolation.

### 35. 🧪 [Colloid Preparation & Hardy-Schulze Coagulation Virtual Lab (`/colloids_simulation`)](colloids_simulation/)
- **Lyophobic & Lyophilic Sol Synthesis**:
  - Ferric Hydroxide Sol: Boiling hydrolysis $\text{FeCl}_3 + 3\text{H}_2\text{O} \to \text{Fe(OH)}_3(\text{sol}) + 3\text{HCl}$ with positive surface charge ($[\text{Fe(OH)}_3]\text{Fe}^{3+}:3\text{Cl}^-$).
  - Starch Sol: Dispersion and heating of potato starch paste forming reversible lyophilic sol.
- **Hardy-Schulze Coagulation Law ($z^6$ Rule)**: Coagulation power scales with the 6th power of the valency of the opposing flocculating ion:
  $\text{Coagulation Power} \propto z^6$
  Demonstrated using $\text{NaCl}$ ($z = 1$), $\text{Na}_2\text{SO}_4$ ($z = 2$), and $\text{Na}_3\text{PO}_4$ / $\text{K}_3[\text{Fe(CN)}_6]$ ($z = 3$).
- **Collimated 532 nm Laser Tyndall Detection**: Active laser scattering verification before and after flocculation, with sedimented precipitate rendering.
- **Interactive Hotplate & Centrifuge Bench**: Temperature control, dropwise burette addition, and live flocculation kinetics telemetry.

### 36. 📏 [Potentiometer EMF Comparison & Internal Resistance Virtual Lab (`/potentiometer_simulation`)](potentiometer_simulation/)
- **400 cm Precision Constantan/Manganin Wire Bench**: 4 segments of $100\text{ cm}$ high-resistivity uniform wire connected by heavy brass strips.
- **Dual Classical Physics Applications**:
  - 1. EMF Comparison of Two Primary Cells: $\frac{E_1}{E_2} = \frac{l_1}{l_2}$ comparing Leclanché ($1.45\text{ V}$) and Daniell ($1.08\text{ V}$) cells.
  - 2. Determination of Internal Resistance ($r$): $r = R \left(\frac{l_1 - l_2}{l_2}\right)$ with plug key resistance box ($R \in [1, 50]\ \Omega$).
- **Interactive Sliding Jockey & Center-Zero Galvanometer**: Draggable knife-edge contact along all 4 wire segments with bi-directional pointer deflection and sensitive null detection ($I_g = 0$).
- **Secondary Driver Circuitry**: Storage accumulator ($2.0\text{ V}$), variable rheostat, and two-way key toggle with authentic electrical click/buzz audio synthesis.

### 37. 🌈 [Single-Slit Fraunhofer Diffraction Virtual Lab (`/diffraction_simulation`)](diffraction_simulation/)
- **Fraunhofer Diffraction Theory**: High-precision sinc-squared optical intensity profiler:
  $I(\theta) = I_0 \left(\frac{\sin \beta}{\beta}\right)^2, \quad \beta = \frac{\pi a \sin\theta}{\lambda} \approx \frac{\pi a y}{\lambda D}$
- **Multispectral Coherent Laser Sources**: Switchable laser diodes: Red ($650\text{ nm}$), Yellow Sodium ($589\text{ nm}$), Green ($532\text{ nm}$), and Blue ($405\text{ nm}$).
- **Precision Micrometer Slit & Bench Geometry**: Continuous slit width variation ($a \in [0.02, 0.30]\text{ mm}$) and screen distance ($D \in [0.5, 3.0]\text{ m}$) verifying central fringe width $W_0 = \frac{2\lambda D}{a}$.
- **Photometer Probe Wand & Live Reticle**: Draggable optical sensor across the screen with real-time digital relative irradiance ($I/I_0$), minima location tags ($\pm y_1$), and audio detector hum.

### 38. 🔩 [Conditions for Rusting of Iron & Prevention Virtual Lab (`/rusting_of_iron_simulation`)](rusting_of_iron_simulation/)
- **NCERT 4-Tube Comparative Investigation**: Direct side-by-side comparison of Tube A (Air + Tap Water), Tube B (Boiled water + Oil seal, excluding dissolved oxygen), Tube C (Dry air with anhydrous $\text{CaCl}_2$ desiccant), and Tube D (Accelerated corrosion in $3.5\%\ \text{NaCl}$ saline).
- **Anti-Corrosion Surface Protection**: Test Galvanization (sacrificial zinc layer, $E^\circ = -0.76\text{ V}$), Grease/Oil hydrophobic barrier coating, and Cathodic Protection with coiled magnesium ribbon ($E^\circ = -2.37\text{ V}$).
- **Electrochemical Corrosion Dynamics**: Anodic iron dissolution ($\text{Fe} \to \text{Fe}^{2+} + 2e^-$), cathodic reduction ($\text{O}_2 + 2\text{H}_2\text{O} + 4e^- \to 4\text{OH}^-$), and mass ledger of hydrated ferric oxide ($\text{Fe}_2\text{O}_3 \cdot x\text{H}_2\text{O}$) accumulation over a 7-day time-lapse.

### 39. 🧪 [Systematic Qualitative Inorganic Salt Analysis Virtual Lab (`/salt_analysis_simulation`)](salt_analysis_simulation/)
- **Systematic Anion Group Analysis**: Dilute $\text{H}_2\text{SO}_4$ group ($\text{CO}_3^{2-}$ brisk effervescence of $\text{CO}_2\uparrow$ turning lime water milky), Concentrated acid group ($\text{Cl}^-$ curdy white $\text{AgCl}\downarrow$ soluble in $\text{NH}_4\text{OH}$), and Special group ($\text{SO}_4^{2-}$ dense white $\text{BaSO}_4\downarrow$ insoluble in $\text{HCl}$).
- **Systematic Cation Group Analysis**: Group 0 ($\text{NH}_4^+$ reddish-brown precipitate with Nessler's Reagent), Group II ($\text{Cu}^{2+}$ deep royal blue complex $[\text{Cu(NH}_3)_4]^{2+}$ with excess $\text{NH}_4\text{OH}$), Group III ($\text{Fe}^{3+}$ Prussian Blue $\text{Fe}_4[\text{Fe(CN)}_6]_3\downarrow$), and Flame Test platinum wire loop emission (Apple Green $\text{Ba}^{2+}$ vs Emerald Green $\text{Cu}^{2+}$).
- **Comprehensive Practical Bench**: Reagent droppers, test-tube rack, effervescence bubble animation, precipitate formation, and deductive identification scorecard.

### 40. 🔥 [Combustion, Flame Zones & Air Supply Virtual Lab (`/combustion_flame_simulation`)](combustion_flame_simulation/)
- **Three Distinct Candle Flame Zones**: Outer Non-Luminous Zone (complete combustion, blue, hottest zone $\sim 1400^\circ\text{C}$), Middle Luminous Zone (incomplete combustion, bright incandescent yellow $\sim 1000^\circ\text{C}$, glowing carbon particles), and Innermost Dark Zone (unburnt wax vapors straight from wick $\sim 600^\circ\text{C}$).
- **Fire Triangle & Chimney Air Ingress**: Compare Case A (wooden blocks permitting bottom air intake $\to$ steady flame), Case B (chimney flat on table $\to$ flickering sooty flame), and Case C (top covered with glass plate $\to$ immediate flame extinction due to oxygen depletion).
- **Experimental Zone Probing**: Insert a clean glass slide into the luminous zone to collect a circular black carbon soot ring, and hold a copper wire in the outer blue zone to observe immediate red-hot incandescence.

### 41. 💎 [Purification of Copper Sulfate by Crystallization Virtual Lab (`/crystallization_purification_simulation`)](crystallization_purification_simulation/)
- **NCERT 5-Stage Practical Protocol**: Dissolution of crude impure blue vitriol with dilute $\text{H}_2\text{SO}_4$ (preventing cupric hydrolysis), hot gravity filtration separating insoluble sand, concentration on wire gauze to crystallization point, slow undisturbed cooling, and harvesting pure triclinic $\text{CuSO}_4 \cdot 5\text{H}_2\text{O}$ crystals.
- **Stoichiometric Mass Balance & Yield**: Real-time analytical balance tracking initial crude sample ($10.00\text{ g}$), sand residue ($0.85\text{ g}$), pure crystal yield ($7.65\text{ g}$), and percentage recovery yield ($83.6\%$).
- **Microscopic Triclinic Crystal Lattice**: Crystal facets growing from mother liquor with procedural stirring and crystal harvesting audio.

### 42. 🌈 [Spectrophotometry & Beer-Lambert Law Virtual Lab (`/beer_lambert_simulation`)](beer_lambert_simulation/)
- **Beer-Lambert Law Metrology**: Rigorous analytical verification of $A = -\log_{10}(T) = \varepsilon \cdot b \cdot c$ with adjustable cuvette optical path length ($b \in [0.5, 2.0]\text{ cm}$) and concentration ($c$).
- **Transition Metal Solute Library**: Potassium Permanganate ($\text{KMnO}_4$, purple, $\lambda_{\max} = 525\text{ nm}$, $\varepsilon = 2200$), Copper Sulfate ($\text{CuSO}_4$, sky blue, $\lambda_{\max} = 630\text{ nm}$, $\varepsilon = 12$), and Potassium Dichromate ($\text{K}_2\text{Cr}_2\text{O}_7$, orange, $\lambda_{\max} = 450\text{ nm}$, $\varepsilon = 350$).
- **Optical Spectrophotometer Bench & Live Calibration Curve**: Collimated light lamp ($I_0$), diffraction grating monochromator, quartz cuvette with attenuated exiting beam ($I$), silicon photodiode detector ($0\text{–}100\%\ T$), and live linear calibration plot ($A$ vs $c$).

### 43. ⏱️ [Rate of Reaction & Surface Area Kinetics Virtual Lab (`/rate_of_reaction_surface_area_simulation`)](rate_of_reaction_surface_area_simulation/)
- **Heterogeneous Reaction Kinetics**: $\text{CaCO}_3(s) + 2\text{HCl}(aq) \to \text{CaCl}_2(aq) + \text{H}_2\text{O}(l) + \text{CO}_2(g)\uparrow$ evaluating collision theory and particle size.
- **Surface Area Comparative Benchmark**: Large marble chips (low surface area, slow gradual effervescence) vs Fine marble powder ($8.5\times$ relative surface area, rapid initial surge of carbon dioxide evolution).
- **Acid Concentration Variation**: Compare $0.5\text{ M}$, $1.0\text{ M}$, and $2.0\text{ M } \text{HCl}$ showing direct proportional relationship with reaction velocity.
- **Dual Measurement Methods & Live Graph**: Conical flask on digital balance with cotton wool plug tracking mass loss $\Delta m(t)$ of escaping $\text{CO}_2$, and dynamic real-time plot of gas volume $V(t)$ with instantaneous rate tangent $\frac{dV}{dt}$.
---

## 💻 Tech Stack
- **Pure Web Standards**: HTML5, Canvas 2D API, CSS3, ES6+ JavaScript.
- **Zero External Dependencies**: Works out-of-the-box locally or deployed to Vercel / GitHub Pages.

---

## 🚀 Running Locally
You can run any simulation using any static web server:

```bash
# Combustion, Flame Zones & Air Supply Virtual Lab
cd combustion_flame_simulation
node server.js   # http://localhost:8103

# Purification of Copper Sulfate by Crystallization Virtual Lab
cd crystallization_purification_simulation
node server.js   # http://localhost:8104

# Spectrophotometry & Beer-Lambert Law Virtual Lab
cd beer_lambert_simulation
node server.js   # http://localhost:8105

# Rate of Reaction & Surface Area Kinetics Virtual Lab
cd rate_of_reaction_surface_area_simulation
node server.js   # http://localhost:8106

# Potentiometer EMF Comparison & Internal Resistance Virtual Lab
cd potentiometer_simulation
node server.js   # http://localhost:8096

# Single-Slit Fraunhofer Diffraction Virtual Lab
cd diffraction_simulation
node server.js   # http://localhost:8097

# Conditions for Rusting of Iron & Prevention Virtual Lab
cd rusting_of_iron_simulation
node server.js   # http://localhost:8101

# Systematic Qualitative Inorganic Salt Analysis Virtual Lab
cd salt_analysis_simulation
node server.js   # http://localhost:8102

# Complexometric EDTA Titration & Water Hardness Virtual Lab
cd edta_titration_simulation
node server.js   # http://localhost:8092

# Qualitative Organic Analysis & Functional Groups Virtual Lab
cd functional_groups_simulation
node server.js   # http://localhost:8093

# Calorimetry & Heat of Neutralization Virtual Lab
cd calorimetry_simulation
node server.js   # http://localhost:8094

# Colloid Preparation & Hardy-Schulze Coagulation Virtual Lab
cd colloids_simulation
node server.js   # http://localhost:8095

# Paper Chromatography & Plant Pigments Virtual Lab
cd chromatography_simulation
node server.js   # http://localhost:8088

# Redox Titration & Permanganometry Virtual Lab
cd redox_titration_simulation
node server.js   # http://localhost:8089

# Galvanic Daniell Cell & Nernst Equation Virtual Lab
cd daniell_cell_simulation
node server.js   # http://localhost:8090

# Chemical Equilibrium & Le Chatelier's Principle Simulator
cd le_chatelier_simulation
node server.js   # http://localhost:8091

# Roller Coaster Kinematics & Loop Fail Dynamics
cd roller_coaster_simulation
python -m http.server 3000

# Thermal Decomposition of Ferrous Sulfate Crystals
cd ferrous_sulfate_simulation
node server.js   # http://localhost:8075

# Tyndall Effect, Colloids & Suspensions Simulator
cd tyndall_simulation
node server.js   # http://localhost:8076

# Solubility Curves & Crystallization Simulator
cd solubility_simulation
node server.js   # http://localhost:8077

# Rutherford Alpha Particle Scattering & Planetary Atom Simulator
cd rutherford_simulation
node server.js   # http://localhost:8078

# Law of Conservation of Mass Simulator
cd conservation_of_mass_simulation
node server.js   # http://localhost:8079

# Reactivity Series & Metal Displacement Reactions Simulator
cd reactivity_series_simulation
node server.js   # http://localhost:8081

# Electrolysis of Water & Copper Electroplating Simulator
cd electrolysis_simulation
node server.js   # http://localhost:8083

# Kinetic Gas Laws & Ideal Gas Simulator
cd gas_laws_simulation
node server.js   # http://localhost:8084

# Reaction Kinetics & The Disappearing Cross Simulator
cd kinetics_simulation
node server.js   # http://localhost:8086

# Flame Test & Atomic Emission Spectra Simulator
cd flame_test_simulation
node server.js   # http://localhost:8087

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




