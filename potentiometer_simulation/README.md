# Potentiometer Comparison of EMF & Internal Resistance Virtual Laboratory

Interactive STEM physics simulation modeling a 4-wire slide-wire potentiometer bench, driver cell potential gradient ($k = V/L$), two-way key, center-zero galvanometer null deflection, and determination of primary cell EMF ratios and internal resistance.

## Pedagogical Objectives (NCERT Class 12 Physics Chapter 3 Current Electricity)
1. **Principle of Potentiometer**:
   When a constant current flows through a wire of uniform cross-sectional area and composition, the potential drop across any length of the wire is directly proportional to that length:
   $$V \propto l \implies V = k \cdot l$$
   where $k$ is the potential gradient in $\text{V/cm}$.
2. **Comparison of EMF of Two Primary Cells**:
   - For Cell 1 ($E_1$, Leclanché cell): $E_1 = k \cdot l_1$
   - For Cell 2 ($E_2$, Daniell cell): $E_2 = k \cdot l_2$
   $$\frac{E_1}{E_2} = \frac{l_1}{l_2}$$
   Because no current is drawn from the cell at null point, the potentiometer acts as an ideal voltmeter with infinite input impedance.
3. **Internal Resistance ($r$) of a Primary Cell**:
   With shunt resistance $R$ introduced via resistance box:
   $$r = R \left(\frac{l_1}{l_2} - 1\right)$$
4. **Apparatus Bench**:
   - 4-wire $400\text{ cm}$ constantan/manganin wire board with brass connecting strips.
   - Draggable metallic jockey with knife-edge contact.
   - Center-zero moving-coil galvanometer with $\pm 30\text{ division}$ pointer deflection.

## Running Locally
```bash
node server.js
# Access at http://localhost:8096
```
