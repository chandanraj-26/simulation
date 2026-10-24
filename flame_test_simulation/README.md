# Flame Test & Atomic Emission Spectra Simulator

An interactive STEM Chemistry laboratory exploring flame test coloration, Bohr atomic excitation, quantum photon emission ($\Delta E = hc/\lambda$), and calibrated optical emission spectroscopy.

---

## 🔬 Core Physical & Chemical Concepts

### 1. Quantum Electron Excitation & Relaxation
When metallic salts are heated in a high-temperature Bunsen burner flame:
1. **Thermal Vaporization & Dissociation**:
   $$\text{MCl}_x\text{ (s)} \xrightarrow{\Delta} \text{M (g)} + x\text{Cl (g)}$$
2. **Thermal Excitation**: Ground-state valence electrons absorb kinetic thermal energy and undergo quantum jumps to excited higher-energy orbitals ($n_1 \to n_2$).
3. **Spontaneous Photon Emission**:
   $$\Delta E = E_2 - E_1 = h\nu = \frac{hc}{\lambda}$$
   Where:
   - $h = 6.626 \times 10^{-34}\text{ J}\cdot\text{s}$ (Planck's constant)
   - $c = 3.00 \times 10^8\text{ m/s}$ (Speed of light)
   - $\lambda$ = Wavelength of the emitted photon in nanometers ($\text{nm}$)
   - $\Delta E$ = Energy gap in electronvolts ($\text{eV}$)

---

## 🧪 Supported Chemical Cations & Spectral Signatures

| Metal Salt | Ion | Flame Color | Dominant Emission ($\lambda$) | Photon Energy ($\Delta E$) |
| :--- | :---: | :--- | :---: | :---: |
| **Sodium Chloride** ($\text{NaCl}$) | $\text{Na}^+$ | Intense Golden Yellow | $589.0\text{ nm}$ (D-line doublet) | $2.10\text{ eV}$ |
| **Potassium Chloride** ($\text{KCl}$) | $\text{K}^+$ | Delicate Lilac / Violet | $404.4\text{ nm}$ & $766.5\text{ nm}$ | $3.06\text{ eV}$ |
| **Copper(II) Chloride** ($\text{CuCl}_2$) | $\text{Cu}^{2+}$ | Vivid Emerald Green & Cyan | $521.8\text{ nm}$ & $510.6\text{ nm}$ | $2.38\text{ eV}$ |
| **Strontium Chloride** ($\text{SrCl}_2$) | $\text{Sr}^{2+}$ | Brilliant Crimson / Scarlet | $660.0\text{ nm}$ & $682.0\text{ nm}$ | $1.88\text{ eV}$ |
| **Calcium Chloride** ($\text{CaCl}_2$) | $\text{Ca}^{2+}$ | Brick Red / Orange-Red | $622.0\text{ nm}$ | $1.99\text{ eV}$ |
| **Barium Chloride** ($\text{BaCl}_2$) | $\text{Ba}^{2+}$ | Pale Apple Green | $553.5\text{ nm}$ & $524.2\text{ nm}$ | $2.24\text{ eV}$ |
| **Lithium Chloride** ($\text{LiCl}$) | $\text{Li}^+$ | Carmine Magenta-Fuchsia | $670.8\text{ nm}$ | $1.85\text{ eV}$ |

---

## 🛠️ Interactive Features
- **Precision Bunsen Burner**: Adjustable gas needle valve ($0–100\%$) and rotating brass air collar (Safety flame with yellow soot $\to$ Roaring non-luminous blue flame with inner cone at $\sim 1300^\circ\text{C}$).
- **Interactive Nichrome Wire Loop**: Click or drag loop into the flame. Heats from room temperature up to bright incandescence ($1100^\circ\text{C}$).
- **Cobalt Blue Glass Filter**: Simulates $\text{Co}^{2+}$ optical silicate absorption of the $589\text{ nm}$ sodium yellow band.
- **Calibrated Quantum Spectroscope**: High-resolution diffraction scale ($380\text{ nm}$ to $750\text{ nm}$) rendering precise discrete spectral lines with live $\Delta E$ in $\text{eV}$.
- **Mystery Detective Challenge**: Blind-test unknown cations (Samples Alpha, Beta, Gamma) and identify them using flame and spectral evidence.
- **Procedural Web Audio Engine**: Zero-asset audio synthesizing gas flow hiss, burner roaring flame turbulence, loop sizzle, glass dish taps, and quest chimes.
