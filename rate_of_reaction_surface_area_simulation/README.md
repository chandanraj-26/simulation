# Factors Affecting Rate of Reaction: Surface Area & Concentration Virtual Lab

An interactive STEM virtual chemistry laboratory exploring the kinetics of heterogeneous chemical reactions, specifically the effect of surface area (particle size) and acid concentration on the reaction between calcium carbonate and hydrochloric acid (CBSE Class 10 Chapter 1 / Class 11 Chemical Kinetics):

$$\text{CaCO}_3(s) + 2\text{HCl}(aq) \to \text{CaCl}_2(aq) + \text{H}_2\text{O}(l) + \text{CO}_2(g)\uparrow$$

## Key Features
- **Surface Area Comparative Investigation**:
  - **Large Marble Chips**: Low specific surface area $\implies$ Moderate collision frequency, gentle bubbling rate.
  - **Fine Marble Powder**: High specific surface area $\implies$ Massive exposed contact area with hydronium ions, rapid initial effervescence surge, shorter completion time.
- **Variable Hydrochloric Acid Concentration**:
  - $0.5\text{ M}$, $1.0\text{ M}$, and $2.0\text{ M } \text{HCl}$ to evaluate rate dependence on concentration ($r \propto [\text{H}^+]^n$).
- **Dual Analytical Metrology**:
  1. **Mass Loss Method**: Digital balance measuring mass reduction $\Delta m(t)$ as heavy $\text{CO}_2$ gas ($44\text{ g/mol}$) escapes through loose cotton wool plug.
  2. **Gas Syringe Collection**: $100\text{ mL}$ graduated gas syringe tracking volume $V_{\text{CO}_2}(t)$ evolved over time.
- **Dynamic Kinetics Telemetry Plot**: Real-time $V_{\text{CO}_2}$ vs $t$ curve with tangent slope representing instantaneous reaction rate $\frac{dV}{dt}$.
- **Soft Light-Blue Academic Aesthetics**: Zero external dependencies, responsive canvas layout.

## Running Locally
```bash
node server.js
# Access at http://localhost:8106
```
