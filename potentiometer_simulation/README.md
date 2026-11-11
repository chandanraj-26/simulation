# Potentiometer EMF Comparison & Internal Resistance Virtual Laboratory (`/potentiometer_simulation`)

An interactive STEM physics metrology virtual laboratory for NCERT Class 12 Physics Practical curriculum exploring the 400 cm Potentiometer, potential gradient determination, comparison of primary cell electromotive forces, and internal resistance evaluation via null deflection.

## Key Features
- **Authentic 400 cm Wooden Bench**: 4 parallel segments of $100\text{ cm}$ Constantan/Manganin wire connected by thick low-resistance brass strips, with centimeter graduations and binding posts $A$ and $B$.
- **Two Classical Physics Practical Experiments**:
  - **EMF Comparison**: $\frac{E_1}{E_2} = \frac{l_1}{l_2}$ comparing Leclanché ($E_1 = 1.450\text{ V}$) and Daniell ($E_2 = 1.080\text{ V}$) cells.
  - **Internal Resistance Determination**: $r = R\left(\frac{l_1 - l_2}{l_2}\right)$ utilizing variable shunt resistance boxes ($R \in [1, 20]\ \Omega$) and secondary key toggling.
- **Interactive Knife-Edge Jockey**: Drag along any of the four wire segments with continuous sub-millimeter position tracking, snapping, and length readouts.
- **Center-Zero Sensitive Galvanometer**: Damped needle deflection ($\pm 30$ divisions) driven by potential difference $(V(l) - E)$, featuring audible harmonic chime on achieving the true null point ($I_g = 0$).
- **Primary Driver Circuitry**: Variable rheostat regulating current from a $2.0\text{ V}$ accumulator, controlling potential gradient $k \in [3.0, 5.5]\text{ mV/cm}$.

## Running Locally
```bash
cd potentiometer_simulation
node server.js   # http://localhost:8128
```
Or open `index.html` directly in any modern browser.

