# OhmLab — Ohm's Law & V-I Characteristic Virtual Laboratory

An interactive STEM physics simulation for Class 10–12 and AP Physics students, exploring electrical conduction, Ohm's Law, Drude microscopic electron drift, Joule heating dynamics, and circuit safety hazards.

Governed by the **single unified workspace layout law**, **soft light-blue study environment palette**, and **zero-dependency vanilla web architecture**.

---

## ⚡ Physics Topics & Animation Subsystems

1. **Microscopic Drude Model & Electron Drift (`tabDrift`):**
   - Free electron gas colliding with vibrating metallic lattice ions ($Cu^{2+}$).
   - Random thermal motion ($v_{\text{thermal}} \approx 10^5\text{–}10^6\text{ m/s}$) vs. net directed drift velocity ($v_d = I / (nAe)$).
   - Applied electric field vector $\mathbf{E} = V/L$ and collision relaxation scattering.

2. **Knife Switch Closure & Contact Arc (`tabCircuit`):**
   - Animated brass blade with mechanical snap and electric spark arc synthesis.
   - Circuit closure establishing potential difference across the load.

3. **Wire Current Flow & Charge Particle Visualization:**
   - Animated charge carriers flowing along the copper busbars.
   - Dual-mode support: **Conventional Current** ($+ \to -$, clockwise) and **Physical Electron Flow** ($- \to +$, counter-clockwise).

4. **Calibrated Dual Instruments (Ammeter & Voltmeter):**
   - Smooth damped needle deflections calibrated to circuit parameters.
   - High-impedance parallel voltmeter and low-impedance series ammeter.

5. **Joule Heating & Thermal Resistance Drift ($P = I^2 R$):**
   - Dynamic resistor thermal glow and rising heat waves for temperatures exceeding 40°C.
   - Temperature-dependent resistance: $R(T) = R_0 [1 + \alpha(T - T_0)]$, demonstrating non-ohmic deviation at high power.

6. **Cartesian V-I Characteristic Graph (`tabGraph`):**
   - Real-time pulsating radar operating point at $(I(t), V(t))$.
   - Manual experimental data logging for up to 25 points.

7. **Linear Regression Analysis & Ohm's Law Verification:**
   - Least-squares linear regression forced through origin ($V = I \cdot R_{\text{exp}}$).
   - Real-time slope readout and $R^2$ goodness-of-fit correlation.

8. **Instrument Topology Hazards & Laboratory Safety:**
   - **Ammeter in Parallel (Short Circuit):** Direct low-impedance short across power supply triggering current surge and danger strobe.
   - **Voltmeter in Series (Open Loop):** 100 kΩ series impedance choking the circuit loop down to microamperes.

---

## 📁 File Structure

```
ohms_law_simulation/
├── index.html              # Main application markup
├── simulation.html         # Mirror for static host routing
├── vercel.json             # Clean URL and rewrites config
├── css/
│   └── styles.css          # Design system & unified responsive grid
├── js/
│   ├── circuit.js          # Physics engine (OhmsLawPhysics)
│   ├── sound.js            # Procedural Web Audio synthesizer (soundEngine)
│   ├── state.js            # Reactive state store & quest manager (simState)
│   ├── renderer.js         # Canvas 2D renderer (ohmRenderer)
│   ├── ui.js               # UI controller & DOM bindings (ohmUI)
│   └── main.js             # Orchestrator & 60 FPS animation loop
└── README.md               # Laboratory documentation
```

---

## 🚀 Running Locally

No bundlers, package managers, or build steps required. Simply serve the directory with any standard static HTTP server:

```bash
# Python 3
cd ohms_law_simulation
python3 -m http.server 8080

# Or Node.js
npx serve .
```

Open `http://localhost:8080` in your web browser.

---

## ⌨️ Keyboard Shortcuts

- `Spacebar`: Toggle Simulation Pause / Resume
- `R`: Reset Laboratory to Defaults
- `Esc`: Close Modals (Theory / Quests)
