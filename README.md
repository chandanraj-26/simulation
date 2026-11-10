# Interactive STEM Simulations & Virtual Labs Suite

A collection of 43 interactive, client-side STEM virtual laboratories and simulations across Physics, Chemistry, and Biology built with HTML5 Canvas, modern Vanilla CSS, and JavaScript.

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

### 28. 🔲 [Refraction Through a Glass Slab & Lateral Displacement (`/glass_slab_simulation`)](glass_slab_simulation/)
- **Rigorous Snell's Law & Lateral Displacement Engine**: Calculates $r = \arcsin(\sin(i)/n)$ and lateral shift $d = \frac{t \sin(i - r)}{\cos(r)}$.
- **Interactive Laser & Pin Method**: Drag incident laser source or switch to classical 4-pin practical alignment ($P_1, P_2, P_3, P_4$).
- **Visual Overlays**: Normal lines ($N_1, N_2$), angle arcs, undeviated ray extension, and protractor angle guide.
- **Material Presets**: Crown Glass ($1.52$), Flint Glass ($1.66$), Water ($1.33$), Fused Quartz ($1.46$), and Diamond ($2.42$).

### 29. 🧲 [Magnetic Field Lines & Draggable Compass (`/magnetic_field_simulation`)](magnetic_field_simulation/)
- **Accurate Dipole Magnetostatics Engine**: Resolves field vector components $B_x, B_y$ and total intensity $|B|$ for bar magnets.
- **Draggable Pocket Compass with Inertia**: Needle displays realistic damped harmonic oscillations aligning with the local field vector.
- **Multiple Visualizations**: Continuous field lines, sprinkled iron filings, and vector arrow grids.
- **Earth's Field & Neutral Points**: Toggle horizontal Earth magnetic field ($B_H$) to demonstrate neutral points ($B_{\text{net}} = 0$).

### 30. 🧪 [Liquid Density Tower & Buoyancy Layers (`/density_tower_simulation`)](density_tower_simulation/)
- **5-Layer Stratified Fluid Column**: Real-time modeling of Honey ($1.42\text{ g/cm}^3$), Dish Soap ($1.06\text{ g/cm}^3$), Water ($1.00\text{ g/cm}^3$), Vegetable Oil ($0.92\text{ g/cm}^3$), and Rubbing Alcohol ($0.79\text{ g/cm}^3$).
- **Interactive Drag-and-Drop Objects**: Drag steel bolts, cherry tomatoes, lego bricks, ice cubes, candle wax, cork stoppers, or custom synthesize an object.
- **Damped Harmonic Settling**: Stokes drag and Archimedean buoyancy accurately simulate equilibrium floatation at liquid interfaces.
- **Thermal Expansion Variations**: Adjust temperature to demonstrate temperature-dependent fluid density changes.

### 31. 🛷 [Inclined Plane, Friction & Angle of Repose (`/inclined_plane_simulation`)](inclined_plane_simulation/)
- **Newtonian Kinematics & Friction Engine**: Computes exact normal force $N = mg \cos\theta$, static friction $f_s \le \mu_s N$, kinetic friction $f_k = \mu_k N$, and sliding acceleration $a = g(\sin\theta - \mu_k \cos\theta)$.
- **Angle of Repose Detection**: $\theta_c = \arctan(\mu_s)$ with immediate automatic transition from static to kinetic regime.
- **Dynamic Free Body Diagram (FBD)**: Live visual force vector overlays on the block for $\vec{N}$, $\vec{W} = mg$, and $\vec{f}$.
- **Dual Optical Photogates**: Measures transit time $\Delta t$ and terminal velocity $v$.

### 32. 🌡️ [Exothermic vs. Endothermic Reaction Calorimeter (`/calorimetry_heat_simulation`)](calorimetry_heat_simulation/)
- **Thermodynamic Enthalpy Engine**: Calculates heat transferred $q = mc\Delta T$ and molar enthalpy $\Delta H = -q/n$.
- **4 Classical Reactions**: Quicklime hydration ($\text{CaO} + \text{H}_2\text{O}$), Acid-Base Neutralization ($\text{HCl} + \text{NaOH}$), Ammonium Chloride Dissolution ($\text{NH}_4\text{Cl}$), and Citric Acid + Baking Soda.
- **Live Strip Chart**: Temperature vs. Time $T(t)$ curve with horizontal ambient reference line.
- **Physical Apparatus**: Insulated vacuum jacket, digital thermometer immersion probe, rotating magnetic stir bar.

### 33. 🌱 [Respiration in Germinating Seeds & CO₂ Absorption (`/seed_respiration_simulation`)](seed_respiration_simulation/)
- **Accurate NCERT Practical Setup**: Conical flask with germinating gram/pea seeds, suspended $\text{KOH}$ tube, rubber stopper, delivery tube, and colored water beaker.
- **Biochemical Respiration Engine**: Models aerobic respiration $\text{C}_6\text{H}_{12}\text{O}_6 + 6\text{O}_2 \to 6\text{CO}_2 + 6\text{H}_2\text{O}$ and $\text{KOH}$ fixation.
- **Partial Vacuum & Water Rise**: Measures $\Delta h(t)$ water column height creep in real time.
- **Enzyme Kinetics & Controls**: Test living germinating seeds, boiled seeds (control with antiseptic), and dormant dry seeds across temperatures ($5^\circ\text{C}–45^\circ\text{C}$).

### 34. 🎯 [Buffon's Needle & Monte Carlo Pi Generator (`/buffon_needle_simulation`)](buffon_needle_simulation/)
- **Stochastic Monte Carlo Engine**: Estimates $\pi \approx \frac{2L \cdot N}{D \cdot C}$ with live convergence tracking.
- **Continuous & Batch Dropping**: Drop +1, +10, +100, +1,000, or stream needles continuously.
- **Interactive Geometric Controls**: Vary needle length ($L$) and plank line spacing ($D$) while enforcing $L \le D$.
- **Live Convergence Chart & CSV Export**: Real-time plot comparing estimated $\pi(N)$ against theoretical $\pi = 3.14159\dots$ with one-click data export.

### 35. ⚡ [Faraday's & Lenz's Law of Electromagnetic Induction (`/electromagnetic_induction_simulation`)](electromagnetic_induction_simulation/)
- **Faraday's Law of Induction**: Real-time analytical rate of change of magnetic flux $\mathcal{E} = -N \frac{d\Phi_B}{dt}$ generating induced electromotive force and microampere currents.
- **Lenz's Law Polarity & Counter-Forces**: Dynamic facing coil polarity badges ('N' or 'S') and retarding vector arrows ($\vec{F}_{\text{Lenz}}$) demonstrating the opposition to incoming and receding magnets.
- **Physical Apparatus Suite**: Cylindrical copper solenoid coil (100–1000 turns), toggleable Soft Iron Core ($\mu_r \approx 45\times$ amplification), 3D AlNiCo bar magnet with field streamlines, and flexible catenary connecting leads.
- **Dual Load Output & Live Oscilloscope**: Center-zero analog galvanometer ($\pm 50\ \mu\text{A}$) with damped needle oscillation vs. Incandescent Bulb & Bipolar Dual LEDs, coupled with a real-time dual-trace oscilloscope comparing $\Phi_B(t)$ and $\mathcal{E}(t)$.
- **3 Motion Kinematics**: Freehand manual dragging, Harmonic AC Shaker ($0.5\text{–}3.0\text{ Hz}$), and Gravity Free-Fall Drop Through showing the classic dual-peak asymmetric induction waveform.

### 36. 📏 [Vernier Caliper & Micrometer Screw Gauge (`/vernier_caliper_simulation`)](vernier_caliper_simulation/)
- **Dual Precision Metrology Instruments**: Vernier Caliper ($1\text{ MSD} = 1.0\text{ mm}$, $10\text{ VSD} = 9\text{ MSD}$, Least Count $= 0.1\text{ mm}$) and Micrometer Screw Gauge (Pitch $= 1.0\text{ mm}$, 100 circular divisions, Least Count $= 0.01\text{ mm}$).
- **High-DPI Interactive Canvas & 3.5× Loupe**: Draggable sliding jaws/thimble with smooth sub-pixel tracking and a floating magnifying loupe highlighting scale coincidences.
- **Zero Error & Analytical Correction**: Full support for positive and negative zero error calibration ($\text{Corrected} = \text{Observed} - \text{Zero Error}$).
- **Specimen Library & Audio Clicks**: Measure steel ball bearing, brass cylinder, glass plate, copper wire, and coin with procedural ratchet and jaw-clamping sounds.

### 37. 🪞 [Spherical Mirrors & Ray Optics (`/mirror_simulation`)](mirror_simulation/)
- **Concave & Convex Spherical Mirrors**: Real-time focal curvature toggle ($f < 0$ vs. $f > 0$) with realistic silvered reflective backing and front mirror rim.
- **Cartesian Sign Convention & Optics Engine**: Rigorous sign conventions resolving object distance ($u$), image distance ($v$), focal length ($f$), and linear magnification ($m = -v/u = h_i/h_o$).
- **Three Principal Ray Trajectories**: Real-time ray tracing through focus $F$, parallel to principal axis, and through center of curvature $C$.
- **Draggable Flame & Screen Image**: Interactive upright candle with draggable height and position, displaying inverted real images on projection screens or erect virtual images behind the mirror.

### 38. 🧪 [pH Scale, Dilution & Universal Indicator (`/ph_scale_simulation`)](ph_scale_simulation/)
- **Thermodynamic Auto-Ionization & Sörensen Scale**: Full $K_w = [H_3O^+][OH^-] = 1.0 \times 10^{-14}$ equilibrium engine across $0.0\text{ to }14.0\text{ pH}$.
- **13 Prototypical Everyday & Lab Solutions**: Battery acid, gastric juice, lemon juice, vinegar, coffee, pure water, blood, baking soda, milk of magnesia, ammonia, bleach, and $1.0\text{ M } \text{NaOH}$.
- **Interactive Dilution Faucet & Drain Valve**: Real-time concentration dilution asymptotic towards neutral $\text{pH } 7.0$ when adding water, with dynamic ion population rendering ($H_3O^+$ vs. $OH^-$).
- **Universal Indicator & Digital pH Wand**: Continuous spectrum color engine (red $\to$ green $\to$ purple) and draggable digital electrode wand with synthesized fluid sounds.

### 39. ⚖️ [Density, Mass & Buoyancy (`/buoyancy_simulation`)](buoyancy_simulation/)
- **Archimedes' Flotation & Buoyant Force**: Real-time equilibrium solver balancing downward gravity ($F_g = mg$) against upward buoyant force ($F_b = \rho_f V_{\text{sub}} g$).
- **8 Distinct Materials & 5 Fluids**: Test Styrofoam, Ice (92% submerged iceberg phenomenon), Wood, Aluminum, Steel, Copper, and Gold across Water, Dense Seawater, Olive Oil, Glycerin, and Liquid Mercury.
- **Overflow Catch Cylinder**: Dynamic fluid overflow confirming $V_{\text{displaced}} = V_{\text{submerged}}$ and displaced liquid weight.
- **Damped Harmonic Bobbing**: 60 FPS Stokes fluid drag and buoyant bobbing dynamics with live vector force overlays.

### 40. 🧬 [Mendelian Genetics Cross & Punnett Square (`/mendelian_genetics_simulation`)](mendelian_genetics_simulation/)
- **Monohybrid & Dihybrid Crosses**: Explore Mendel's Law of Segregation ($3:1$ phenotype, $1:2:1$ genotype) and Law of Independent Assortment ($9:3:3:1$ dihybrid matrix).
- **Monte Carlo Random Offspring Sampling**: Generate batches of 10, 50, 200, or 1000 offspring in real time, demonstrating convergence to theoretical ratios via the Law of Large Numbers.
- **Botanical Illustrations & Gamete Meiosis**: Authentic pea vine (*Pisum sativum*) phenotypes, round/wrinkled green/yellow seeds, and animated gamete segregation.
- **Statistical Chi-Square ($\chi^2$) Analysis**: Live goodness-of-fit testing and procedural audio for gamete coin flips and fertilization events.

### 41. 🔊 [Resonance Air Column & Speed of Sound (`/resonance_tube_simulation`)](resonance_tube_simulation/)
- **Closed Organ Pipe Acoustic Resonance**: Models quarter-wave standing acoustic waves ($L_1 = \lambda/4 - e$, $L_2 = 3\lambda/4 - e$) with Rayleigh end-correction ($e \approx 0.6r$).
- **Movable Water Reservoir**: Smooth dynamic water column level control via draggable reservoir flask with realistic meniscus physics.
- **Procedural Web Audio Tuning Forks**: Synthesized pure acoustic tones ($256\text{ Hz}$, $384\text{ Hz}$, $440\text{ Hz}$, $512\text{ Hz}$) with strike hammer transients, exponential decay, and resonant cavity amplification.
- **Thermodynamic Speed of Sound**: Temperature regulation ($0^\circ\text{C}\text{ to }40^\circ\text{C}$) calculating $v(T) = 331.3\sqrt{1 + T/273.15}\text{ m/s}$ with displacement wave node/antinode overlays.

### 42. 🌿 [Stomatal Transpiration & Guard Cell Turgidity (`/stomata_simulation`)](stomata_simulation/)
- **Guard Cell Osmoregulation & Turgor Pressure**: Cellular mechanism driven by $H^+$-ATPase proton pumping, $K^+$ ion influx/efflux, and asymmetric elastic cell wall expansion opening apertures up to $12\ \mu\text{m}$.
- **Dual Visual Perspectives**: High-power cellular view with chloroplasts, nucleus, and ion channels vs. 100× epidermal peel microscope view with Stomatal Index calculation.
- **Environmental Factors & ABA Hormone**: Modulate light intensity, relative humidity, leaf temperature, and Abscisic Acid (ABA) drought stress response.
- **Transpiration Plumes & Procedural Audio**: Ascending water vapor transpiration plumes, $\text{CO}_2$ influx arrows, and dynamic day/night ambient chimes.

### 43. ⚡ [Ohm's Law & V-I Characteristic Virtual Laboratory (`/ohms_law_simulation`)](ohms_law_simulation/)
- **Ohm's Law & Drude Electron Drift**: Resolves $V = IR$ alongside microscopic Drude electron gas drift velocity ($v_d = I / (nAe)$) and electric field acceleration $\mathbf{E} = V/L$.
- **Complete Bench Circuit Apparatus**: Variable DC power supply, knife switch with electric contact arc, calibrated series ammeter, and parallel voltmeter.
- **Joule Heating & Thermal Resistance Drift**: Resistor thermal glow and non-linear resistance drift $R(T) = R_0[1 + \alpha(T - T_0)]$ at elevated currents.
- **Live V-I Characteristic Plot**: Real-time Cartesian coordinate plotting with operating point radar and 25-point experimental data logger.

---

## 💻 Tech Stack
- **Pure Web Standards**: HTML5, Canvas 2D API, CSS3, ES6+ JavaScript.
- **Zero External Dependencies**: Works out-of-the-box locally or deployed to Vercel / GitHub Pages.

---

## 🚀 Running Locally
You can run any simulation using any static web server:

```bash
# Refraction Through a Glass Slab & Lateral Displacement
cd glass_slab_simulation
node server.js   # http://localhost:8115

# Magnetic Field Lines & Draggable Compass
cd magnetic_field_simulation
node server.js   # http://localhost:8116

# Liquid Density Tower & Buoyancy Layers
cd density_tower_simulation
node server.js   # http://localhost:8117

# Inclined Plane, Friction & Angle of Repose
cd inclined_plane_simulation
node server.js   # http://localhost:8118

# Exothermic vs. Endothermic Reaction Calorimeter
cd calorimetry_heat_simulation
node server.js   # http://localhost:8119

# Respiration in Germinating Seeds & CO₂ Absorption
cd seed_respiration_simulation
node server.js   # http://localhost:8120

# Buffon's Needle & Monte Carlo Pi Generator
cd buffon_needle_simulation
node server.js   # http://localhost:8121

# Faraday's & Lenz's Law of Electromagnetic Induction
cd electromagnetic_induction_simulation
node server.js   # http://localhost:8122

# Vernier Caliper & Micrometer Screw Gauge Virtual Laboratory
cd vernier_caliper_simulation
node server.js   # http://localhost:8108

# Spherical Mirrors & Ray Optics Virtual Laboratory
cd mirror_simulation
node server.js   # http://localhost:8109

# pH Scale, Dilution & Universal Indicator Virtual Lab
cd ph_scale_simulation
node server.js   # http://localhost:8110

# Density, Mass & Buoyancy (Float or Sink) Virtual Lab
cd buoyancy_simulation
node server.js   # http://localhost:8111

# Mendelian Genetics Cross & Punnett Square Virtual Lab
cd mendelian_genetics_simulation
node server.js   # http://localhost:8112

# Resonance Air Column & Speed of Sound Virtual Lab
cd resonance_tube_simulation
node server.js   # http://localhost:8113

# Stomatal Transpiration & Guard Cell Turgidity Virtual Lab
cd stomata_simulation
node server.js   # http://localhost:8107

# Ohm's Law & V-I Characteristic Virtual Laboratory
cd ohms_law_simulation
python -m http.server 8114

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




