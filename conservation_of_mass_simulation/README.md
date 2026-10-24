# Law of Conservation of Mass Virtual Laboratory

An interactive STEM virtual chemistry laboratory simulation for Class 9 students verifying Antoine Lavoisier's (1789) Law of Conservation of Mass based strictly on **NCERT Class 9 Chapter 3 Activity 3.1 & 3.2**.

## Scientific Principles Modeled
- **The Conservation Law**: *"Mass can neither be created nor destroyed in a chemical reaction."* Total mass of reactants equals total mass of products ($m_1 = m_2$).
- **NCERT Experimental Systems**:
  1. **Barium Chloride + Sodium Sulfate**:
     $\text{BaCl}_2 (\text{aq}) + \text{Na}_2\text{SO}_4 (\text{aq}) \to \text{BaSO}_4 (\text{s})\downarrow + 2\text{NaCl} (\text{aq})$
     Instant dense, milky-white barium sulfate precipitation with $\Delta m = 0.000\text{ g}$.
  2. **Lead Nitrate + Potassium Iodide (Golden Rain)**:
     $\text{Pb(NO}_3)_2 (\text{aq}) + 2\text{KI} (\text{aq}) \to \text{PbI}_2 (\text{s})\downarrow + 2\text{KNO}_3 (\text{aq})$
     Brilliant canary-yellow precipitate of lead iodide with $100\%$ mass conservation.
  3. **Calcium Carbonate + Acid (Closed vs. Open System Investigation)**:
     $\text{CaCO}_3 (\text{s}) + 2\text{HCl} (\text{aq}) \to \text{CaCl}_2 (\text{aq}) + \text{H}_2\text{O} (\text{l}) + \text{CO}_2 (\text{g})\uparrow$
     Demonstrating that when sealed with a rubber cork, mass is strictly conserved; but when uncorked, escaping $\text{CO}_2$ gas causes an apparent mass drop ($\Delta m \approx -0.440\text{ g}$).
- **Interactive Laboratory Apparatus**:
  - Precision Digital Analytical Balance ($\pm 0.001\text{ g}$ precision) with green fluorescent readout and tare controls.
  - $250\text{ mL}$ Pyrex conical flask with suspension thread and glass ignition tube.
  - Smooth flask tilting & swirling animation that spills the ignition tube into the flask solution.
  - Rubber cork seal toggle (Corked / Uncorked).
  - Live atomic accounting ledger verifying $\sum \text{Atoms}_{\text{Reactants}} = \sum \text{Atoms}_{\text{Products}}$.

## How to Run
```bash
node server.js
```
Open [http://localhost:8079/](http://localhost:8079/) in any modern web browser.
