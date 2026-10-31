# Resonance Air Column & Speed of Sound Virtual Laboratory (`/resonance_tube_simulation`)

An interactive STEM acoustics virtual laboratory for NCERT Class 11 Physics (Waves & Sound Practical) exploring closed-end acoustic organ pipes, quarter-wave standing waves, tuning fork harmonics, Rayleigh end correction, and precision speed of sound determination.

## Key Features
- **Authentic Resonance Apparatus**: 100 cm borosilicate glass tube with centimeter graduation ruler, connected via flexible rubber tubing to a movable water reservoir.
- **Dynamic Water Level Adjustment**: Drag the reservoir bottle up or down to vary the air column length, observing real-time meniscus displacement.
- **Pure Tuning Fork Acoustic Synthesis**: Struck tuning forks ($512\text{ Hz}$, $440\text{ Hz}$, $384\text{ Hz}$, $256\text{ Hz}$) dynamically synthesized via the Web Audio API with realistic mallet strike transients and exponentially decaying ringing tones.
- **Acoustic Resonance Amplification**: As air column length approaches theoretical resonance points ($L_1 = \lambda/4 - e$ or $L_2 = 3\lambda/4 - e$), acoustic sound volume surges exponentially, mimicking real physics laboratory resonance.
- **Standing Wave Harmonic Overlay**: Visualizes spatial displacement envelopes with Node ($N$) at the rigid water boundary and Antinode ($A$) at the open mouth.
- **Thermodynamic Speed of Sound**: Temperature regulation ($0^\circ\text{C}$ to $40^\circ\text{C}$) calculating $v(T) = 331.3 \times \sqrt{1 + T/273.15}\text{ m/s}$.
- **Observation Notebook & Practice Challenges**: Record laboratory trials and test acoustic problem-solving skills in randomized mystery challenges.

## Running Locally
```bash
cd resonance_tube_simulation
# Open index.html in any modern browser
```
