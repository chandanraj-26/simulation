# Combustion, Flame Zones & Calorific Value Virtual Lab

An interactive STEM virtual chemistry laboratory exploring the three distinct zones of a candle flame, the Fire Triangle conditions, and the calorific values of various fuels (CBSE Class 8 Chapter 6 / NCERT Science).

## Key Features
- **3 Distinct Flame Zones**:
  1. **Non-Luminous Outer Zone (Blue)**: Zone of complete combustion; highest temperature ($\sim 1400^\circ\text{C}$); used by goldsmiths with a metallic blowpipe.
  2. **Luminous Middle Zone (Yellow)**: Zone of partial/incomplete combustion; moderately hot ($\sim 1000^\circ\text{C}$); carbon particles glow incandescent yellow; circular black soot ring deposit test on clean glass slide.
  3. **Innermost Dark Zone (Black/Translucent)**: Unburnt wax vapors surrounding wick; least hot ($\sim 600^\circ\text{C}$); glass tube vapor siphon ignition test.
- **Fire Triangle & Air Supply Chimney**:
  - Fuel, Heat (Ignition Temperature), and Oxygen ($O_2$).
  - Chimney placed on wooden blocks (free air ingress $\implies$ steady luminous flame).
  - Chimney resting flat on table (restricted air $\implies$ flickering flame producing soot).
  - Chimney sealed with glass plate (zero air $\implies$ flame extinguishes immediately).
- **Calorific Value & Fuel Efficiency Comparison**:
  - Compare fuels: Wood ($17,000\text{–}22,000\text{ kJ/kg}$), Coal ($25,000\text{–}33,000\text{ kJ/kg}$), LPG ($55,000\text{ kJ/kg}$), and Hydrogen ($150,000\text{ kJ/kg}$).
  - Simulated water boiling calorimeter tracking $\Delta T$ and heating rate.
- **Audio Feedback**: Flickering flame hissing, glass slide placement, and match ignition.
- **Soft Light-Blue Academic Aesthetics**: Zero external dependencies, responsive canvas layout.

## Running Locally
```bash
node server.js
# Access at http://localhost:8103
```
