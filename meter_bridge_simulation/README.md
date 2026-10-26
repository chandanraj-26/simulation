# Meter Bridge & Specific Resistance (Resistivity) Virtual Lab

An interactive, high-precision STEM virtual laboratory simulating the Meter Bridge (Wheatstone Bridge principle) to determine the resistance of an unknown coil and find the specific resistance (resistivity $\rho$) of its material (NCERT Class 12 Physics).

## Key Features
- **100 cm Stretched Wire Bench**: 1-meter uniform constantan/manganin wire clamped over calibrated millimeter scale between heavy L-shaped copper strips.
- **Wheatstone Bridge Balance Condition**:
  $$\frac{P}{Q} = \frac{R}{X} \implies \frac{l}{100 - l} = \frac{R}{X} \implies X = R \cdot \frac{100 - l}{l}$$
- **Specific Resistance (Resistivity $\rho$) Metrology**:
  $$\rho = \frac{X \cdot \pi r^2}{L}$$
  with micrometer screw gauge to measure wire radius $r$ and meter rule to measure coil wire length $L$.
- **Interactive Sliding Knife-Edge Jockey**: Smooth dragging along the 100 cm wire with center-zero galvanometer deflection and sensitive null detection ($I_g = 0$).
- **Plug-Key Resistance Box ($R$)**: Adjustable standard resistance ($1\ \Omega$ to $20\ \Omega$) to ensure null point falls near the sensitive central region ($40\text{–}60\text{ cm}$).
- **Multiple Unknown Wire Materials**: Constantan, Manganin, Nichrome, and Copper mystery coils.
- **Audio Feedback**: Authentic key insertion clicks, sliding contact scratch, and galvanometer null chime.
- **Soft Light-Blue Academic Aesthetics**: Zero external dependencies, responsive canvas layout.

## Running Locally
```bash
node server.js
# Access at http://localhost:8100
```
