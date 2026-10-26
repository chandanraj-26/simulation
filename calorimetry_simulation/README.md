# Solution Calorimetry & Heat of Neutralization Virtual Laboratory

Interactive STEM thermochemistry simulation modeling enthalpy of neutralization ($\Delta H_{\text{neut}}$) across strong vs. weak acid-base systems in a constant-pressure Styrofoam cup calorimeter.

## Pedagogical Objectives (NCERT Class 11 Chemistry Chapter 6 Thermodynamics)
1. **Enthalpy of Neutralization ($\Delta H_{\text{neut}}$)**:
   The heat change when one gram equivalent of an acid is completely neutralized by one gram equivalent of a base in dilute aqueous solution.
2. **Strong Acid - Strong Base Constancy**:
   $$\text{H}^+(aq) + \text{OH}^-(aq) \to \text{H}_2\text{O}(l) \quad (\Delta H^\circ = -57.1\text{ kJ/mol})$$
   Because strong acids and bases are completely dissociated, the net reaction is always the formation of water from hydronium and hydroxide ions.
3. **Weak Acid Penalty**:
   For $\text{CH}_3\text{COOH} + \text{NaOH}$, $\Delta H_{\text{neut}} \approx -55.2\text{ kJ/mol}$. The remaining $\sim 1.9\text{ kJ/mol}$ is consumed as the enthalpy of ionization ($\Delta H_{\text{ion}}$) to dissociate acetic acid molecules.
4. **Calorimeter First Law Energy Balance**:
   $$q_{\text{rxn}} = -[m_{\text{sol}} \cdot c_{\text{sol}} + W] \cdot \Delta T$$
   where $c_{\text{sol}} \approx 4.184\text{ J/g}\cdot^\circ\text{C}$ and $W$ is the water equivalent (heat capacity) of the calorimeter vessel.

## Running Locally
```bash
node server.js
# Access at http://localhost:8094
```
