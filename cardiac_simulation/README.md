# Human Cardiac Cycle & ECG Simulator (`/cardiac_simulation`)

An interactive STEM biology and medical physiology virtual laboratory exploring the 4-chamber human heart, cardiac electrical conduction highway, valve hemodynamics, Lead II ECG tracing, Wiggers diagram, and clinical stethoscope auscultation.

---

## 🫀 Key Features & Scientific Principles

### 1. 4-Chamber Beating Heart Anatomy & Conduction System
- **Anatomical Cross-Section**: Stylized 4-chamber cross-section with dynamic myocardial wall thickening during systole and lumen expansion/emptying.
- **Deoxygenated vs. Oxygenated Circulation**:
  - Right Atrium & Ventricle (Superior/Inferior Vena Cava & Pulmonary Trunk in sapphire blue `#0284C7`).
  - Left Atrium & Ventricle (Pulmonary Veins & Systemic Aorta in rich crimson `#E11D48`).
- **Heart Valve Dynamics**:
  - Atrioventricular (AV) Valves: Tricuspid (Right) and Mitral / Bicuspid (Left) with papillary muscles and chordae tendineae.
  - Semilunar (SL) Valves: Pulmonary (Right) and Aortic (Left) opening during ejection and snapping shut during diastole.
- **Electrical Conduction Highway**:
  - Sinoatrial (SA) Node pacemaker firing pulse.
  - Internodal pathways to the Atrioventricular (AV) Node with a 0.12s physiologic conduction delay (PR segment).
  - Bundle of His, Left & Right bundle branches down the interventricular septum, and arborizing Purkinje network triggering synchronous ventricular systole.

### 2. Synchronized Wiggers Diagram & Multi-Channel Oscilloscope
- **Channel 1 — Lead II ECG**: High-fidelity synthesis of P wave, PR segment, QRS complex, ST segment, and T wave.
- **Channel 2 — Hemodynamic Pressures**: Live Left Ventricular pressure ($10\text{–}120\text{ mmHg}$), Aortic pressure with **Dicrotic Notch (Incisura)** at aortic valve closure, and Left Atrial pressure ($a$, $c$, $v$ waves).
- **Channel 3 — Ventricular Volume**: Tracks End-Diastolic Volume ($EDV \approx 125\text{ mL}$) down to End-Systolic Volume ($ESV \approx 55\text{ mL}$) with plateauing during isovolumetric phases.
- **Channel 4 — Phonocardiogram (PCG)**: Correlates $S_1$ ("LUB") and $S_2$ ("DUB") heart sounds with valve closure.

### 3. Procedural Web Audio & Auscultation Bench
- **Zero External Audio Files**: Pure Web Audio API synthesis for $S_1$ (deep resonant thump at 50 Hz) and $S_2$ (sharp click at 110 Hz).
- **Interactive Stethoscope**: Draggable chest piece across the 4 primary clinical cardiac auscultation landmarks:
  - **A — Aortic Area** (2nd Right Intercostal space) — S2 loudest.
  - **P — Pulmonic Area** (2nd Left Intercostal space) — S2 split.
  - **T — Tricuspid Area** (4th Left Sternal Border) — S1.
  - **M — Mitral / Apex Area** (5th Left Midclavicular line) — S1 loudest.
- **Hospital Monitor Beep**: Clinical R-wave acoustic chirp (880 Hz / 1046 Hz).
- **Acoustic Murmurs**: Synthesizes systolic ejection murmur for Aortic Stenosis and blowing holosystolic murmur for Mitral Regurgitation.

### 4. Hemodynamics & Pathology Modes
- **Live Calculations**:
  - Stroke Volume ($SV = EDV - ESV$)
  - Cardiac Output ($CO = (HR \times SV) / 1000\text{ L/min}$)
  - Ejection Fraction ($EF = (SV / EDV) \times 100\%$)
  - Mean Arterial Pressure ($MAP = DP + \frac{1}{3}(SP - DP)$)
- **Pathology Modes**:
  - Normal Sinus Rhythm (72 BPM)
  - Exercise / Sympathetic Drive (145 BPM, high CO)
  - Sinus Bradycardia (45 BPM)
  - Sinus Tachycardia (130 BPM)
  - Atrial Fibrillation (AFib, absent P-waves, irregular rhythm)
  - Ventricular Tachycardia (VTach, wide bizarre QRS, low CO)
  - Aortic Stenosis (high LV peak pressure, systolic murmur)
  - Mitral Regurgitation (retrograde atrial leakage, holosystolic murmur)

---

## 🚀 Running Locally

Open `index.html` or `simulation.html` directly in any modern browser, or run a local static web server:

```bash
cd cardiac_simulation
python -m http.server 8098
```
