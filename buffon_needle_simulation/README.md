# Buffon's Needle & Monte Carlo Pi Virtual Laboratory

A zero-dependency, responsive applied mathematics virtual laboratory implementing Georges-Louis Leclerc, Comte de Buffon's 1777 stochastic geometric probability problem.

## Features
- **Stochastic Monte Carlo Engine**: Estimates $\pi \approx \frac{2L \cdot N}{D \cdot C}$ with live convergence tracking.
- **Continuous & Batch Dropping**: Drop +1, +10, +100, +1,000, or stream needles continuously.
- **Interactive Geometric Controls**: Vary needle length ($L$) and plank line spacing ($D$) while enforcing $L \le D$.
- **Live Convergence Chart**: Real-time plot comparing estimated $\pi(N)$ against theoretical $\pi = 3.14159\dots$
- **Data Export**: One-click CSV export of needle trials and probability convergence.
- **Web Audio Synthesis**: Procedural needle drop "tink" and precision chime.

## Running Locally
```bash
cd buffon_needle_simulation
node server.js
```
Open [http://localhost:8121](http://localhost:8121) in your web browser.

