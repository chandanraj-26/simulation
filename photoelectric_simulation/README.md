# Photoelectric Effect & Planck's Constant Virtual Laboratory (`/photoelectric_simulation`)

An interactive STEM quantum physics virtual laboratory for NCERT Class 12 & Modern Physics exploring Albert Einstein's 1905 Nobel-prize-winning photoelectric effect, photon quantization ($E = h\nu$), work function ($\Phi_0$), stopping potential ($V_0$), and Planck's constant ($h/e$) determination.

## Key Features
- **Evacuated Quartz Phototube Simulation**: 60 FPS real-time rendering of photons incident through a quartz window, surface electron ejection, and electric field acceleration/deceleration between curved cathode and collector anode.
- **6 Authentic Metal Cathodes**: Explore Cesium ($\Phi_0 = 2.14\text{ eV}$), Potassium ($2.30\text{ eV}$), Sodium ($2.75\text{ eV}$), Calcium ($2.87\text{ eV}$), Zinc ($4.31\text{ eV}$, requiring UV light), and Platinum ($6.35\text{ eV}$).
- **Continuous Photon Spectrum**: Tune wavelength from deep ultraviolet ($150\text{ nm}$) to infrared ($750\text{ nm}$) with live photon energy ($E = hc/\lambda$) and maximum kinetic energy ($K_{\max} = E - \Phi_0$) telemetry.
- **Variable Retarding Potential & Stopping Voltage**: Smooth potentiometer adjusting voltage from $-4.00\text{ V}$ (retarding) to $+4.00\text{ V}$ (accelerating), demonstrating instantaneous electron turnback at $V \le -V_0$.
- **Dual Live Characteristic Graphs**:
  - **Photocurrent vs. Voltage ($I\text{--}V$)**: Shows saturation current plateau scaling with light intensity and exact $V$-intercept at $-V_0$.
  - **Stopping Potential vs. Frequency ($V_0\text{--}\nu$)**: Plots the landmark linear relation whose slope directly yields $h/e \approx 4.14 \times 10^{-15}\text{ V}\cdot\text{s}$ and x-intercept yields threshold frequency $\nu_0$.
- **Zero-Dependency Procedural Audio**: Synthesizes photon strike clicks and stopping potential threshold alert tones dynamically using the Web Audio API.

## Running Locally
```bash
cd photoelectric_simulation
node server.js   # http://localhost:8124
```
Or open `index.html` directly in any modern browser.

