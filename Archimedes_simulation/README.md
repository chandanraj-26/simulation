# 🌊 ArchimedesLab — Interactive Archimedes' Principle & Buoyancy Simulation

A state-of-the-art interactive physics simulation designed for Class 9–12 and AP Physics students and educators to master **Archimedes' Principle**, **Hydrostatic Pressure**, **Buoyant Force Vectors**, **Apparent Weight Loss**, and the practical **Eureka Displacement Can** experiment.

---

- **🎮 Interactive Student Lab Quests & Missions**:
  - **⭐ Quest 1: "Archimedes' Eureka Proof"** — Submerge the iron cylinder completely and verify that Apparent Weight Loss = Displaced Fluid Weight on the digital scale!
  - **⭐⭐ Quest 2: "Catch the Goldsmith Thief!"** — Unmask King Hiero's dishonest goldsmith by proving that the silver alloy crown displaces ~40% more water!
  - **⭐⭐⭐ Quest 3: "The Titanic Iceberg Secret"** — Discover why ~90% of an iceberg is hidden beneath the ocean surface!
  - **⭐⭐⭐⭐ Quest 4: "Cargo Ship Master"** — Load cargo crates onto the steamboat to reach 70-85% draft without exceeding the red Plimsoll danger mark!
  - **⭐⭐⭐⭐⭐ Quest 5: "Deep-Sea Neutral Buoyancy"** — Adjust density so the scuba diver floats neutrally suspended in the fluid ($F_B = W_0$)!
  - Celebratory fanfare sound & confetti burst upon quest completion!

- **🚰 Fully Functional Interactive Laboratory Apparatus**:
  - **Clickable Refill Water Tap**: Turn the tap on or off with realistic streaming water pouring from the nozzle directly into the tank.
  - **Calibrated Observable Submersion**: Tank calibrated at ~320 mL line so students observe immersion from 0% (air) to 100% (submerged) with zero clipping.
  - **Displaced Fluid Catch Beaker & Precision Scale**: Overflow fluid pours dynamically into the graduated catch beaker; scale measures displaced mass to $0.01\text{ g}$.
  - **Hooke's Law Spring Balance**: Coiled blue spring, red pointer, and top digital tension pill with black suspension wire down to the cylinder.
  - **Archimedes Principle Verification Card**: Live proof that $\text{Apparent Weight Loss} = \text{Displaced Fluid Weight}$.

- **🦆 Engaging Student Characters & Relatable Objects**:
  - 🦆 **Rubber Ducky**: Floats cheerfully with buoyant harmonic bobbing and cute quacks!
  - 🤿 **Scuba Diver**: Wetsuit, mask, and streams of rising air bubbles!
  - 👑 **King Hiero's Royal Crown**: Ornate golden crown with sparkling gems.
  - 🚢 **Cargo Steamboat**: Plimsoll waterline, animated smokestack puffs, and stackable cargo crates!
  - 🧊 **Titanic Iceberg**: Translucent crystalline iceberg showing the 90% underwater phenomenon.
  - 🪙 **Heavy Blacksmith Anvil**: Heavy metallic sinking with dramatic fluid displacement!

- **🔬 3 Distinct Laboratory Simulation Modes**:
  - **1. Eureka Overflow Lab (Displacement Can & Spring Balance)**:
    - Suspended spring balance measuring true weight ($W_0$) and apparent weight ($W_{\text{apparent}}$) via Hooke's law coiled spring dynamics.
    - Physical Eureka can with side overflow spout filled right to the brim.
    - Digital weighing scale ($0.01\text{ g}$ precision) holding a graduated catch cylinder collecting overflowing fluid.
    - Real-time droplet fluid pouring and splash particles.
    - Direct side-by-side experimental proof:
      $$\text{Apparent Weight Loss } (\Delta W = W_0 - W_{\text{app}}) = \text{Displaced Fluid Weight } (W_{\text{disp}})$$
  - **2. Hydrostatic Depth Pressure & Free Body Diagram (FBD)**:
    - Dedicated Free Body Diagram (FBD) side panel cleanly displaying $W_0$, $F_B$, and $T$ vectors with zero overlapping!
    - Cross-section view of immersed bodies in fluid with metric depth ruler and isobaric pressure depth contours ($P = \rho g h$).
    - Dynamic hydrostatic pressure force arrows on all faces:
      - Top face: downward force $F_{\text{top}} = P_{\text{top}} \cdot A$
      - Bottom face: upward force $F_{\text{bottom}} = P_{\text{bottom}} \cdot A$ (longer than top!)
      - Lateral faces: horizontal inward force vectors increasing linearly with depth that symmetrically cancel out.
    - Net vertical buoyant force vector:
      $$F_B = F_{\text{bottom}} - F_{\text{top}} = \Delta P \cdot A = \rho_{\text{fluid}} \cdot g \cdot V_{\text{sub}}$$
  - **3. Flotation, Cargo Boat & King Hiero's Crown Mystery**:
    - Freely floating bodies with realistic harmonic bobbing and damped fluid oscillations when dragged and released.
    - Cargo barge with Plimsoll waterline and stackable cargo crates, illustrating maximum payload capacity before swamping.
    - Archimedes' famous crown mystery density test: compare King Hiero's pure gold crown ($19300\text{ kg/m}^3$) against the suspect goldsmith's alloy crown ($13800\text{ kg/m}^3$).

- **📊 Live Hydrodynamic Telemetry Grid (6 Metrics)**:
  - True Weight in Air ($W_0 = m \cdot g$)
  - Buoyant Force ($F_B = \rho_f V_{\text{sub}} g$)
  - Apparent Weight / Spring Tension ($W_{\text{app}} = W_0 - F_B$)
  - Submerged Volume ($V_{\text{sub}}$ in $\text{cm}^3$)
  - Weight of Displaced Fluid ($W_{\text{disp}} = m_f \cdot g$)
  - Hydrostatic Gauge Pressure at Base ($P_{\text{bottom}} = \rho_f g h$)

- **📐 Live Step-by-Step Mathematical Explainer**:
  - Live numerical substitution showing every step of the calculation with SI units.
  - Highlights exact agreement between Apparent Weight Loss and Displaced Fluid Weight with a verified status badge.

- **📝 Experimental Observation Notebook**:
  - One-click trial logger recording Trial #, Material, Fluid, Volume, $W_0$, $W_{\text{app}}$, $W_{\text{disp}}$, Weight Loss ($\Delta W$), and Error %.
  - Live calculation of Mean Loss vs Mean Displaced Fluid Weight.
  - One-click CSV export for lab reports.

- **🪐 Planetary Gravitational Fields**:
  - Earth ($9.81\text{ m/s}^2$), Moon ($1.62\text{ m/s}^2$), Mars ($3.71\text{ m/s}^2$), Jupiter ($24.79\text{ m/s}^2$), and Zero-G ($0.00\text{ m/s}^2$).

---

## 📚 Core Physics Principles & Formulas

### 1. Archimedes' Principle
"Any body wholly or partially submerged in a fluid is buoyed up by a force equal to the weight of the fluid displaced by the body."
$$F_B = m_{\text{disp}} \cdot g = \rho_{\text{fluid}} \cdot V_{\text{submerged}} \cdot g$$

### 2. Hydrostatic Origin of Buoyant Force
Hydrostatic gauge pressure at depth $h$:
$$P(h) = \rho_{\text{fluid}} \cdot g \cdot h$$
For an immersed object of height $H$ with top at depth $h_1$ and bottom at $h_2 = h_1 + H$:
$$\Delta P = P_2 - P_1 = \rho_{\text{fluid}} \cdot g \cdot H$$
$$F_B = \Delta P \cdot \text{Area} = \rho_{\text{fluid}} \cdot g \cdot (H \cdot \text{Area}) = \rho_{\text{fluid}} \cdot g \cdot V_{\text{submerged}}$$

### 3. Apparent Weight Loss
$$W_{\text{apparent}} = W_0 - F_B$$
$$\text{Weight Loss } (\Delta W) = W_0 - W_{\text{apparent}} = F_B = W_{\text{displaced fluid}}$$

### 4. Law of Flotation
For a freely floating body in static equilibrium:
$$W_0 = F_B \iff \rho_{\text{object}} \cdot V_{\text{total}} \cdot g = \rho_{\text{fluid}} \cdot V_{\text{submerged}} \cdot g$$
$$\frac{V_{\text{submerged}}}{V_{\text{total}}} = \frac{\rho_{\text{object}}}{\rho_{\text{fluid}}}$$

---

## 💻 Tech Stack
- **Pure Web Standards**: HTML5, Canvas 2D API, CSS3, ES6+ JavaScript.
- **Zero External Dependencies**: Fully self-contained, runs offline or deployable directly to Vercel / GitHub Pages.

---

## 🚀 Running Locally

Open `index.html` in any modern web browser or serve via Python's built-in HTTP server:
```bash
cd archimedes_simulation
python -m http.server 8088
```
Then navigate to `http://localhost:8088/` in your browser.
