# Kinetic Gas Laws & Ideal Gas Simulator

An interactive STEM Chemistry & Physics virtual laboratory exploring Boyle's, Charles's, and Gay-Lussac's gas laws, microscopic kinetic molecular theory (KMT), draggable piston volume changes, and Maxwell-Boltzmann velocity distributions.

---

## 🔬 Core Physical & Chemical Laws

### 1. The Ideal Gas Equation
$$P \cdot V = n \cdot R \cdot T$$
- $P$ = Pressure in atmospheres ($\text{atm}$) or Pascals ($\text{Pa}$)
- $V$ = Volume in Liters ($\text{L}$)
- $n$ = Amount of gas in moles ($\text{mol}$)
- $R = 0.08206\text{ L}\cdot\text{atm/(mol}\cdot\text{K)} = 8.314\text{ J/(mol}\cdot\text{K)}$
- $T$ = Absolute temperature in Kelvin ($\text{K}$)

### 2. Classical Gas Laws
- **Boyle’s Law (Isothermal)**: $P_1 V_1 = P_2 V_2 \implies P \propto \frac{1}{V}$ (at constant $T, n$).
- **Charles’s Law (Isobaric)**: $\frac{V_1}{T_1} = \frac{V_2}{T_2} \implies V \propto T$ (at constant $P, n$).
- **Gay-Lussac’s Law (Isochoric)**: $\frac{P_1}{T_1} = \frac{P_2}{T_2} \implies P \propto T$ (at constant $V, n$).
- **Avogadro’s Hypothesis**: $\frac{V_1}{n_1} = \frac{V_2}{n_2} \implies V \propto n$ (at constant $P, T$).

### 3. Kinetic Molecular Theory & Molecular Speeds
$$v_{\text{rms}} = \sqrt{\frac{3 R T}{M}}$$
- Light molecules ($\text{He}$, $M = 4.0\text{ g/mol}$) travel at over $1360\text{ m/s}$ at $300\text{ K}$, whereas heavy molecules ($\text{Ar}$, $M = 40.0\text{ g/mol}$) travel at $\sim 430\text{ m/s}$.
- Pressure arises microscopically from elastic momentum transfers against the chamber walls:
  $$P_{\text{kinetic}} = \frac{1}{A \cdot \Delta t} \sum 2 m v_\perp$$

---

## 🛠️ Interactive Features
- **Piston-Cylinder Chamber**: Drag the piston handle horizontally to compress or expand chamber volume from $5.0\text{ L}$ to $25.0\text{ L}$.
- **Analog Bourdon Manometer**: Circular pressure dial with rotating needle and overpressure warning zone.
- **Bicycle Air Pump & Vent Valve**: Pump handle injects $+0.25\text{ mol}$ of gas; vent valve vents $-0.25\text{ mol}$.
- **Substage Thermal Bath**: Visual heating flame / ice bath regulating temperature from $100\text{ K}$ to $750\text{ K}$.
- **Noble Gas Species Library**: Switch between Helium ($\text{He}$), Neon ($\text{Ne}$), Argon ($\text{Ar}$), and Krypton ($\text{Kr}$).
- **Parameter Lock Constraints**: Lock Temperature (Boyle), Lock Pressure (Charles), or Lock Volume (Gay-Lussac).
- **Analytical State Curves**: Live P-V Isotherms, V-T Isobars, P-T Isochores, and real-time Maxwell-Boltzmann speed histograms.
- **Procedural Web Audio Engine**: Zero-asset audio synthesizing bicycle pump strokes, vent hisses, piston slide friction, and overpressure alarms.
