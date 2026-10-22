# Reactivity Series & Metal Displacement Reactions Virtual Laboratory

An interactive STEM virtual chemistry laboratory simulation for Class 9 and 10 students exploring standard electrode potentials ($E^\circ$), the electrochemical activity ladder, single replacement displacement reactions, exothermic enthalpy changes, and dendritic silver crystal growth.

## Scientific Phenomenon Modeled
- **Single Displacement Reactions ($A + BC \to AC + B$)**:
  - **Iron Nail in Copper(II) Sulfate**: $\text{Fe} + \text{CuSO}_4 \to \text{FeSO}_4 + \text{Cu}\downarrow$ (blue $\to$ pale green with reddish-brown copper deposit).
  - **Zinc Strip in Copper(II) Sulfate**: $\text{Zn} + \text{CuSO}_4 \to \text{ZnSO}_4 + \text{Cu}\downarrow$ (complete decoloration with spongy black-brown copper precipitate and measurable exothermic temperature rise $\Delta T > 6^\circ\text{C}$).
  - **Copper Wire in Silver Nitrate**: $\text{Cu} + 2\text{AgNO}_3 \to \text{Cu(NO}_3)_2 + 2\text{Ag}\downarrow$ (clear solution turns azure blue with spectacular dendritic silver crystal needles branching out on copper).
  - **Magnesium Ribbon Reactions**: Rapid effervescent displacement of zinc and copper salts.
  - **Unreactive Control Experiments**: Copper in $\text{FeSO}_4$ or $\text{ZnSO}_4$ (proving that less reactive metals cannot displace more reactive elements).
- **Interactive Teak Wood Test Tube Rack**:
  - 4 borosilicate test tubes with customizable aqueous solutions.
  - Submerge and withdraw metal strips on suspensions.
  - Real-time solution color blending and effervescent fizz bubble mechanics.
  - Submerged glass digital thermometer reading reaction heat in real-time.
- **Electrochemical Ladder & Coaching Mnemonic**:
  - Live $E^\circ$ potential and reactivity rank display.
  - Interactive speech pronunciation reciting the Hinglish mnemonic:
    *"Kedar Nath Ka Mali Aalu Zara Pheeke Pakata Hai, Kyun-ki Hoga Ag Au"*.

## Zero-Dependency Architecture
Built with pure native HTML5, CSS3, ES6+ JavaScript, Canvas 2D, and procedural Web Audio SFX adhering strictly to `simulation-guidelines`.

## How to Run
```bash
node server.js
```
Open [http://localhost:8081/](http://localhost:8081/) in any modern web browser.
