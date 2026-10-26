# Paper Chromatography & Plant Pigments Virtual Laboratory

Interactive STEM simulation modeling capillary action, mobile vs stationary phase partition, retention factors ($R_f$), and pigment separation across plant chloroplasts (Spinach) and synthetic black inks.

## Pedagogical Objectives (NCERT Class 9 & Class 11)
1. **Stationary vs Mobile Phase**: Partition chromatography where water adsorbed on cellulose fibers acts as the stationary phase, while organic solvent (Petroleum Ether : Acetone 9:1 or Water : Ethanol) acts as the mobile phase.
2. **Washburn's Capillary Dynamics**: Rate of solvent rise modeled via $h(t) = \sqrt{\frac{\gamma r \cos\theta}{2\eta} t}$.
3. **Retention Factor ($R_f$)**: Analytical determination of $R_f = \frac{\text{Distance traveled by pigment}}{\text{Distance traveled by solvent front}}$.
4. **Chloroplast Pigment Separation**:
   - $\beta$-Carotene (Orange-Yellow, $R_f \approx 0.95$)
   - Xanthophyll (Yellow, $R_f \approx 0.71$)
   - Chlorophyll $a$ (Blue-Green, $R_f \approx 0.58$)
   - Chlorophyll $b$ (Olive-Green, $R_f \approx 0.42$)
5. **Black Ink Chromatogram**: Resolving black marker ink into Cyan ($R_f \approx 0.78$), Magenta ($R_f \approx 0.52$), and Yellow ($R_f \approx 0.28$).

## Running Locally
```bash
node server.js
# Access at http://localhost:8088
```
