# ⚖️ CircuitLab — Interactive Wheatstone Bridge & Meter Bridge Simulation

A state-of-the-art interactive physics simulation designed for Class 11–12 and AP Physics students and educators to master **Kirchhoff's Laws**, the **Wheatstone Bridge Principle**, and the practical **Meter Bridge (Slide-Wire Bridge)** experiment.

---

## ✨ Key Features

- **🔬 Dual Laboratory Simulation Modes**:
  - **Classical Wheatstone Bridge Network (Diamond View)**:
    - Interactive 4-resistor bridge network ($P, Q, R, S$) with central Galvanometer ($G$) and DC source ($V$).
    - Dynamic potential gradient color-mapping along branches (Red: High $+V \to$ Blue: Ground $0\text{V}$).
    - Flowing electron/charge animations reflecting real-time branch current magnitudes and directions.
    - Live node voltage potentials ($V_A, V_B, V_C, V_D$) and current telemetry ($I_P, I_Q, I_R, I_S, I_g$).
  - **Realistic Meter Bridge Apparatus View (Laboratory Bench)**:
    - Highly detailed physical apparatus: polished wooden base, 100 cm graduated metric ruler (millimeter marks), heavy brass binding strips with knurled terminals, uniform 1-meter stretched manganin wire.
    - Resistance Box ($R$) with clickable/adjustable brass plugs.
    - Unknown Resistance coil ($S$ / $X$) with wire diameter and length parameters for resistivity determination ($\rho$).
    - Tactile **Interactive Draggable Jockey** with knife-edge contact along the meter scale.
    - Center-zero galvanometer ($-30\text{ div} \dots 0 \dots +30\text{ div}$) with parallax correction mirror and critically damped pointer dynamics.

- **📊 Live Telemetry Grid & Character HUD**:
  - Galvanometer current ($I_g$) with $\mu\text{A}$ resolution and deflection angle ($\theta$).
  - Bridge ratio comparator: $\frac{P}{Q}$ vs $\frac{R}{S}$ with instant balance status indicator.
  - Potential difference across detector terminals: $V_{BD} = V_B - V_D$.
  - Total circuit current ($I_{\text{total}}$) and power consumption.
  - Bridge sensitivity metric: $S = \frac{d\theta}{dR}$.

- **📐 Live Mathematical Explainer & Derivations**:
  - Dynamic step-by-step substitution of Kirchhoff’s Current Law ($KCL$) and Loop Rule ($KVL$).
  - Full unbalanced bridge solution using Thévenin’s Equivalent Theorem:
    $$V_{th} = V \left(\frac{Q}{P+Q} - \frac{S}{R+S}\right), \quad I_g = \frac{V_{th}}{R_{th} + R_g}$$
  - Meter Bridge balancing formula:
    $$S = R \cdot \frac{100 - l}{l}$$
  - Fractional error propagation and sensitivity curve:
    $$\frac{\Delta S}{S} = \frac{100\,\Delta l}{l(100 - l)}$$
    (Demonstrates why balance points near $50\text{ cm}$ yield minimal experimental error).

- **📝 Experimental Observation Notebook**:
  - One-click observation logger recording $R$, $l$, $(100-l)$, and computed $X$.
  - Automatic computation of Mean Resistance and Standard Deviation.
  - Export data table to CSV or print for lab records.

---

## 📚 Core Physics Formulas

### 1. Wheatstone Bridge Balance Condition
When the galvanometer registers **null deflection** ($I_g = 0$):
$$\frac{P}{Q} = \frac{R}{S} \iff P \cdot S = Q \cdot R$$

### 2. Meter Bridge Balancing Formula
For a uniform resistance wire of length $100\text{ cm}$:
$$S = R \cdot \frac{100 - l}{l}$$
With end corrections $\alpha$ (at $0\text{ cm}$) and $\beta$ (at $100\text{ cm}$):
$$S = R \cdot \frac{100 - l + \beta}{l + \alpha}$$

### 3. Specific Resistance (Resistivity $\rho$) of Unknown Wire
$$\rho = \frac{S \cdot \pi \cdot d^2}{4 \cdot L_{\text{wire}}}$$
Where $d$ is the wire diameter measured by screw gauge and $L_{\text{wire}}$ is the length of the unknown wire.

---

## 🚀 Running Locally

Open `index.html` in any modern web browser or serve via any static HTTP server:
```bash
python -m http.server 8080
```
Then navigate to `http://localhost:8080/wheatstone_bridge_simulation/`.
