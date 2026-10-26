# Redox Titration & Permanganometry Virtual Laboratory

Interactive STEM simulation modeling redox stoichiometry, self-indicating potassium permanganate ($\text{KMnO}_4$), analytical burette drops, magnetic stirrer vortex, and equivalence endpoint detection against Mohr's Salt and Oxalic Acid.

## Pedagogical Objectives (NCERT Class 11 & Class 12 Practical Chemistry)
1. **Self-Indicating Permanganometry**: Potassium permanganate ($\text{KMnO}_4$) serves as its own internal indicator. The deep purple $\text{MnO}_4^-$ ion reduces into almost colorless $\text{Mn}^{2+}$ in acidic medium until the equivalence point, where one drop in excess imparts a permanent faint pink tint.
2. **Half-Cell Redox Reactions in Acidic Medium**:
   $$\text{MnO}_4^- + 8\text{H}^+ + 5e^- \to \text{Mn}^{2+} + 4\text{H}_2\text{O} \quad (E^\circ = +1.51\text{ V})$$
3. **Primary Standard Reactions**:
   - **Mohr's Salt** ($\text{FeSO}_4 \cdot (\text{NH}_4)_2\text{SO}_4 \cdot 6\text{H}_2\text{O}$):
     $$5\text{Fe}^{2+} + \text{MnO}_4^- + 8\text{H}^+ \to 5\text{Fe}^{3+} + \text{Mn}^{2+} + 4\text{H}_2\text{O}$$
   - **Oxalic Acid** ($(\text{COOH})_2 \cdot 2\text{H}_2\text{O}$):
     $$5\text{C}_2\text{O}_4^{2-} + 2\text{MnO}_4^- + 16\text{H}^+ \to 10\text{CO}_2\uparrow + 2\text{Mn}^{2+} + 8\text{H}_2\text{O}$$
     *(Requires pre-heating to $60\text{–}70^\circ\text{C}$ to initiate autocatalytic reaction by formed $\text{Mn}^{2+}$)*
4. **Interactive Laboratory Bench**:
   - $50\text{ mL}$ Class A glass burette with dark purple meniscus reading from top of meniscus (opaque solution rule).
   - Magnetic stirrer hot plate with variable rotation speed and spinning Teflon magnetic bar.
   - Live Potentiometric Redox Curve ($E_{\text{cell}}$ vs. $V_{\text{titrant}}$) and analytical concordant titer log.

## Running Locally
```bash
node server.js
# Access at http://localhost:8089
```
