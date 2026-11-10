# Exothermic vs Endothermic Reaction Calorimeter Virtual Laboratory

A zero-dependency, responsive chemistry virtual laboratory adhering to NCERT Class 10/11 Science curriculum.

## Features
- **Thermodynamic Enthalpy Engine**: Calculates heat transferred $q = mc\Delta T$ and molar enthalpy $\Delta H = -q/n$.
- **4 Classical Reactions**:
  - Quicklime hydration ($\text{CaO} + \text{H}_2\text{O}$, $\Delta H = -65.2\text{ kJ/mol}$, intense heating & steam).
  - Acid-Base Neutralization ($\text{HCl} + \text{NaOH}$, $\Delta H = -57.1\text{ kJ/mol}$).
  - Ammonium Chloride Dissolution ($\text{NH}_4\text{Cl}$, $\Delta H = +14.8\text{ kJ/mol}$, chilling & frost).
  - Citric Acid + Baking Soda ($\Delta H = +70.0\text{ kJ/mol}$, cold effervescence).
- **Live Strip Chart**: Temperature vs. Time $T(t)$ curve with horizontal ambient reference line.
- **Physical Apparatus**: Insulated vacuum jacket, digital thermometer immersion probe, rotating magnetic stir bar.
- **Web Audio Synthesis**: Procedural reaction fizz, magnetic stirrer hum, and temperature alarm beeps.

## Running Locally
```bash
cd calorimetry_heat_simulation
node server.js
```
Open [http://localhost:8119](http://localhost:8119) in your web browser.

