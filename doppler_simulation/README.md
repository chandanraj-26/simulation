# 🔊 DopplerLab — Acoustic Wavefront Ring Expansion & Mach Cone Simulator

An interactive, high-precision STEM physics laboratory demonstrating the **classical 2D Doppler Effect**, expanding spherical acoustic wavefront rings, subsonic compression (blue shift), dilated rarefaction (red shift), sonic barrier constructive interference ($M = 1$), and supersonic Mach cone shockwave envelopes ($M > 1$).

---

## ✨ Features & Capabilities

- **Real-Time Acoustic Wavefronts**: Continuously emits expanding circular pressure wavefront rings from the source's position, propagating outward at the medium's local speed of sound ($v$).
- **Color-Coded Wave Compression**: Visualizes compressed leading wavefronts in electric cyan / blue and dilated trailing wavefronts in warm amber / coral.
- **Supersonic Flight & Mach Cone Envelope**: When source velocity exceeds sound speed ($M \ge 1$), renders the conical envelope with half-angle $\mu = \arcsin(1/M)$ and shock wave pressure shading.
- **Real-Time Web Audio Synthesizer**: Procedurally synthesizes the actual observed Doppler frequency with continuous pitch gliding, stereo panning based on observer position, and sonic boom shockwave bursts.
- **5 Exploration Modes**:
  1. **Subsonic Motion** — Moving source approaching and receding from a stationary observer.
  2. **Mach Cone (M ≥ 1)** — Supersonic flight, shock fronts, and Mach angle measurement.
  3. **Moving Observer** — Observer moving towards or away from a stationary acoustic source.
  4. **Passing Siren** — Emergency vehicle siren drive-by with stereo panning and classic frequency drop.
  5. **Static Source** — Concentric calibration rings for wavelength measurement.
- **CRT Oscilloscope & Frequency Spectrum**: Live sine wave comparison ($f_0$ vs $f_{\text{obs}}$) and dynamic wavelength compression bar.
- **Interactive Drag & Drop**: Click and drag the Source or Observer anywhere on the 2D plane to create custom angles and trajectories.
- **5 Guided Student Quests**: Interactive challenge missions with automatic completion detection and star awards.
- **Physics Theory Modal**: Derivations of 2D Doppler formulas, Mach angles, sonic booms, radar, and redshift astronomy parallels.

---

## 📐 Mathematical Formulation

1. **General 2D Doppler Formula**:
   $$f_{\text{obs}} = f_0 \frac{v \pm v_{\text{obs},\parallel}}{v \mp v_{\text{src},\parallel}}$$
   where $v_{\text{src},\parallel}$ and $v_{\text{obs},\parallel}$ are the velocity components along the line connecting source and observer.

2. **Observed Wavelength**:
   $$\lambda_{\text{obs}} = \frac{v}{f_{\text{obs}}}$$

3. **Mach Number**:
   $$M = \frac{v_{\text{src}}}{v}$$

4. **Mach Cone Half-Angle**:
   $$\sin(\mu) = \frac{1}{M} \implies \mu = \arcsin\left(\frac{1}{M}\right)$$

---

## 🛠️ Tech Stack

- **Core**: Vanilla HTML5, Canvas 2D API, ES6 JavaScript
- **Audio**: Web Audio API (`AudioContext`, `OscillatorNode`, `StereoPannerNode`, `BiquadFilterNode`)
- **Typography**: Google Fonts (*Plus Jakarta Sans* & *JetBrains Mono*)
- **Styling**: Pure CSS3 with CSS variables, responsive grid, and custom dark mode themes
- **Deployment**: Vercel configuration ready (`vercel.json`)
