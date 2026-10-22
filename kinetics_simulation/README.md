# Reaction Kinetics & The Disappearing Cross Simulator

An interactive STEM Chemistry virtual laboratory investigating rate of reaction, colloidal sulfur precipitation dynamics, concentration orders, temperature acceleration, and Arrhenius activation energy calculation.

---

## 🔬 Core Chemical & Kinetic Principles

### 1. Chemical Reaction & Mechanism
$$\text{Na}_2\text{S}_2\text{O}_3\text{ (aq)} + 2\text{HCl (aq)} \longrightarrow 2\text{NaCl (aq)} + \text{SO}_2\text{ (g)} + \text{S}\downarrow\text{ (colloidal yellow s)} + \text{H}_2\text{O (l)}$$

- The reaction produces insoluble elemental sulfur ($S_8$), which precipitates in colloidal form.
- The solution clouds over time until it obscures a black cross marked on a white ceramic tile placed beneath the flask.
- Since a fixed mass of sulfur is required for optical extinction:
  $$\text{Relative Rate} \propto \frac{1}{\Delta t}\ (\text{s}^{-1})$$

### 2. Differential Rate Law
$$\text{Rate} = k(T) \cdot [\text{Na}_2\text{S}_2\text{O}_3]^x \cdot [\text{HCl}]^y$$
- **Order with respect to Thiosulfate**: $x \approx 1.0$ (Direct proportionality; doubling concentration halves extinction time).
- **Order with respect to HCl**: $y \approx 0$ (Pseudo zero-order in excess acid).

### 3. Arrhenius Equation & Activation Energy ($E_a$)
$$k = A \exp\left(-\frac{E_a}{RT}\right) \implies \ln(k) = \ln(A) - \frac{E_a}{R}\left(\frac{1}{T}\right)$$
- Plotting $\ln(1/t)$ vs. $1/T\ (\text{K}^{-1})$ yields a straight line with slope $= -E_a / R$.
- Multiplying by $R = 8.314\text{ J/(mol}\cdot\text{K)}$ determines the empirical activation energy ($\approx 52\text{ kJ/mol}$).

---

## 🛠️ Interactive Features
- **Top-Down Erlenmeyer Flask & Ceramic Tile**: Watch the black cross progressively dim, blur, and vanish as colloidal sulfur scatters transmitted light.
- **Spinning Magnetic Stir Bar**: Interactive Teflon magnetic stirrer maintains uniform suspension and accelerates mass transport.
- **Integrated Digital Stopwatch**: Millisecond-accurate timer with auto-stop upon cross extinction.
- **Optical Transmittance Photometer**: Measures transmitted light ($100\% \to 0\%$) with extinction threshold alarm bell at $<8\%$.
- **Real-Time Analytical Graphs**: Toggle between:
  1. Rate ($1/t$) vs. $[\text{Na}_2\text{S}_2\text{O}_3]$ Concentration.
  2. Arrhenius Plot ($\ln(1/t)$ vs. $1/T$) with live activation energy calculation.
- **Lab Notebook & CSV Export**: Automatically records trials with temperature, concentration, extinction time, and rate, with one-click CSV download.
- **Procedural Web Audio Engine**: Synthesizes liquid pouring, magnetic stirrer vortex hum, stopwatch beeps, and extinction alert chimes.
