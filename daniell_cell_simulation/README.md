# Galvanic Daniell Cell & Nernst Equation Virtual Laboratory (`/daniell_cell_simulation`)

An interactive STEM electrochemistry virtual laboratory for NCERT Class 12 Chemistry exploring the Galvanic Daniell Cell, Nernst equation concentration kinetics, Gibbs free energy ($\Delta G = -nFE$), and the fundamental role of the salt bridge.

## Key Features
- **Electrochemical Couple & Thermodynamics**: $\text{Zn}(s) | \text{Zn}^{2+}(aq) \parallel \text{Cu}^{2+}(aq) | \text{Cu}(s)$ with live Nernst equation $E_{\text{cell}} = E^\circ - \frac{2.303 RT}{2F}\log_{10}([\text{Zn}^{2+}]/[\text{Cu}^{2+}])$ and Gibbs free energy $\Delta G$ readouts.
- **Draggable Removable Salt Bridge**: Inverted glass U-tube filled with $\text{KCl}$ agar gel. Toggle or remove the bridge to observe the immediate loss of liquid junction equilibrium and cell voltage dropping to $0.000\text{ V}$.
- **Microscopic Charge Transport**: Real-time animation of Drude electron conduction along external copper leads from Zn anode ($-$) to Cu cathode ($+$), coupled with counter-ion migration ($\text{K}^+$ and $\text{Cl}^-$) inside the salt bridge.
- **Continuous Concentration & Temperature Control**: Independently vary $[\text{Zn}^{2+}]$ and $[\text{Cu}^{2+}]$ from $0.001\text{ M}$ to $2.000\text{ M}$, and regulate temperature from $0^\circ\text{C}$ to $80^\circ\text{C}$.
- **Live Cartesian Nernst Plot**: Real-time operating point radar plotting cell EMF against the reaction quotient $\log_{10} Q$, empirically demonstrating the theoretical slope $-\frac{2.303 RT}{2F} \approx -0.0296\text{ V/decade}$ at $25^\circ\text{C}$.
- **Procedural Sound**: Mechanical switch clicks, salt bridge immersion splash, and digital voltmeter audio feedback.

## Running Locally
```bash
cd daniell_cell_simulation
node server.js   # http://localhost:8126
```
Or open `index.html` directly in any modern browser.
