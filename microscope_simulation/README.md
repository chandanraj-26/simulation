# Virtual Compound Microscope & Mitosis Simulator (`/microscope_simulation`)

An interactive STEM cytology and microscopy virtual laboratory exploring compound light microscope operation, focal plane depth-of-field, specimen slides (*Allium cepa* onion root tip and *Coregonus* whitefish blastula), chromosome staining, cell phase tagging, and Mitotic Index calculation.

---

## 🔬 Key Scientific Features

### 1. Compound Light Microscope Operation
- **Revolving Nosepiece**: 4 parfocal objectives (4× Scanning, 10× Low Power, 40× High Power, 100× Oil Immersion) combined with a 10× ocular eyepiece yielding 40×, 100×, 400×, and 1000× total magnifications.
- **Focus Mechanics**:
  - Coarse Adjustment Macro Dial.
  - Fine Adjustment Micrometric Knob.
  - Depth-of-Field (DoF) physics: Simulates realistic focal blur based on numerical aperture ($NA$) and focal plane offset $\Delta z$.
- **Substage Optics & Oil Immersion**:
  - Light intensity potentiometer & Iris diaphragm aperture lever (modulating contrast and optical edge definition).
  - Immersion Oil ($n = 1.515$) mechanics: Eliminates air-glass refractive index dispersion at 1000×.
  - Ocular Reticle / Graticule with 100 etched micrometric divisions.

### 2. Biological Specimen Slides
- **🧅 Onion Root Tip Meristem (*Allium cepa*)**:
  - Longitudinal files of meristematic cells stained with acetocarmine / Feulgen purple-magenta.
  - Plant cytology: Rigid cellulose cell walls, middle lamella, and forming Cell Plate (phragmoplast vesicle fusion) in Telophase.
- **🐟 Whitefish Blastula (*Coregonus*)**:
  - Animal embryonic blastomeres showing centrosomes, radiating astral rays (asters), and equatorial Cleavage Furrow constriction during cytokinesis.
- **📏 Stage Micrometer Calibration Slide**:
  - 1.0 mm etched glass scale with 100 subdivisions ($10\ \mu\text{m}$ each) for ocular graticule calibration.

### 3. All 5 Stages of Mitosis & Cytology Inspection
1. **Interphase (G1, S, G2)**: Intact nuclear envelope, prominent dark spherical nucleolus, granular uncoiled chromatin.
2. **Prophase**: Chromatin condensation into visible tangled chromatids, fading nucleolus, spindle assembly.
3. **Metaphase**: Maximum chromosome condensation aligned along the central equatorial Metaphase Plate.
4. **Anaphase**: Cohesin cleavage by Separase, V-shaped sister chromatids migrating toward opposite spindle poles.
5. **Telophase & Cytokinesis**: Nuclear envelope reformation, chromosome decondensation, and primary cell plate / cleavage furrow.

### 4. Interactive Cell Tagging & Mitotic Index Scorecard
- Students can tag individual cells across the tissue slice.
- Real-time tally table computing the biological Mitotic Index:
  $$\text{Mitotic Index} = \frac{\text{Dividing Cells (Prophase + Metaphase + Anaphase + Telophase)}}{\text{Total Counted Cells}} \times 100\%$$

---

## 🚀 Running Locally

Open `index.html` or `simulation.html` directly in any modern browser, or run a local static web server:

```bash
cd microscope_simulation
python -m http.server 8099
```
