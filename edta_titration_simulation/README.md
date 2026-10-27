# Water Hardness & Complexometric EDTA Titration Virtual Laboratory

Interactive STEM analytical chemistry simulation modeling complexometric titration of hard water ($Ca^{2+}, Mg^{2+}$) using disodium EDTA, buffer $\text{pH} = 10$, and Eriochrome Black T (EBT) metallochromic indicator.

## Pedagogical Objectives (NCERT Class 11 Chemistry & Engineering Chemistry)
1. **Types of Water Hardness**:
   - Temporary Hardness: Dissolved bicarbonates $\text{Ca(HCO}_3)_2$ and $\text{Mg(HCO}_3)_2$, removable by boiling.
   - Permanent Hardness: Dissolved sulfates and chlorides $\text{CaCl}_2, \text{MgSO}_4, \text{MgCl}_2$.
2. **Chelation Chemistry with Disodium EDTA**:
   $$\text{M}^{2+} + \text{H}_2\text{Y}^{2-} \rightleftharpoons [\text{MY}]^{2-} + 2\text{H}^+$$
   Hexadentate ligand forming an extremely stable $1:1$ octahedral chelate ring with alkaline earth metal cations ($\log K_f \approx 10.7$ for $\text{Ca}^{2+}$).
3. **Metallochromic Indicator Mechanism (Eriochrome Black T)**:
   - At $\text{pH} = 10$ ($\text{NH}_4\text{Cl} - \text{NH}_4\text{OH}$ buffer), free EBT exists as sky-blue $\text{HIn}^{2-}$.
   - Upon addition to hard water containing $\text{Mg}^{2+}$: forms an unstable wine-red complex $[\text{Mg-EBT}]^{2+}$.
   - During titration with EDTA: EDTA displaces EBT because the $[\text{Mg-EDTA}]^{2-}$ complex is far more stable.
   - Sharp equivalence point: The solution turns instantaneously from **Wine Red to Clear Sky Blue**!
4. **Hardness Calculation**:
   $$\text{Total Hardness (in ppm CaCO}_3) = \frac{V_{\text{EDTA}} \times M_{\text{EDTA}} \times 100 \times 1000}{V_{\text{water sample}}}$$

## Running Locally
```bash
node server.js
# Access at http://localhost:8092
```
