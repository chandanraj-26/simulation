# Galvanic Daniell Cell & Nernst Equation Virtual Laboratory

Interactive STEM electrochemical simulation modeling standard reduction potentials, half-cell reactions, draggable salt bridge ion migration, external circuit electron drift, digital DC voltmeter EMF, and real-time Nernst equation equilibrium.

## Pedagogical Objectives (NCERT Class 12 Chapter 3 Electrochemistry)
1. **Electrochemical Cell Construction**:
   - Anode (Negative electrode, Oxidation): $\text{Zn}(s) \to \text{Zn}^{2+}(aq) + 2e^-$ ($E^\circ = -0.76\text{ V}$)
   - Cathode (Positive electrode, Reduction): $\text{Cu}^{2+}(aq) + 2e^- \to \text{Cu}(s)$ ($E^\circ = +0.34\text{ V}$)
   - Overall Cell Reaction: $\text{Zn}(s) + \text{Cu}^{2+}(aq) \to \text{Zn}^{2+}(aq) + \text{Cu}(s)$
2. **Standard Cell Potential ($E^\circ_{\text{cell}}$)**:
   $$E^\circ_{\text{cell}} = E^\circ_{\text{cathode}} - E^\circ_{\text{anode}} = 0.34\text{ V} - (-0.76\text{ V}) = +1.10\text{ V}$$
3. **Nernst Equation at $298\text{ K}$**:
   $$E_{\text{cell}} = E^\circ_{\text{cell}} - \frac{0.0591}{n}\log_{10}\frac{[\text{Zn}^{2+}]}{[\text{Cu}^{2+}]}$$
   where $n = 2$ electrons transferred.
4. **Role of Salt Bridge**:
   - U-tube filled with agar-agar jelly saturated with inert electrolyte ($\text{KCl}$, $\text{KNO}_3$, or $\text{NH}_4\text{NO}_3$).
   - Maintains electrical neutrality by migrating $\text{K}^+$ into the cathode compartment and $\text{Cl}^-$ into the anode compartment.
   - Removing the salt bridge immediately drops cell voltage to $0.00\text{ V}$ due to circuit open / charge buildup.

## Running Locally
```bash
node server.js
# Access at http://localhost:8090
```
