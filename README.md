# 🚀 PhysicsLab — Rocket Motion & Newton's Laws Simulator

An interactive, web-based physics simulation designed for Class 9–10 students and educators to explore **Newton's Laws of Motion**, **gravity ($W = mg$)**, **velocity**, **mass**, and **acceleration ($a = \frac{F_{\text{net}}}{m}$)**.

![PhysicsLab Preview](simulation.html)

---

## ✨ Features

- **🎬 Full-Page Video Landing Intro**: Features a 10-second introductory lesson video explaining how rockets fly using **Newton's Third Law** ($F_{\text{action}} = -F_{\text{reaction}}$), complete with interactive play/pause, un-mute audio controls, and a quick-action lab entry button.
- **🌍 Realistic Earth Atmosphere & Crust Cross-Section**:
  - **Crust Foundation (0 m)**: Bedrock cross-section with tectonic strata layers.
  - **Troposphere (0–12 km)**: Daytime sky, cloud layers, and mountain summits.
  - **Stratosphere (12–50 km)**: Weather balloons and protective ozone layer.
  - **Mesosphere (50–85 km)**: Noctilucent clouds and burning meteors.
  - **Thermosphere (85–600 km)**: Auroras and the **Kármán line (100 km)**, the official boundary of space.
  - **Deep Outer Space (>600 km)**: Deep space starfields, orbital satellites, and Earth curvature.
- **📐 2D Thrust Angle & Vector Resolution**:
  - Direct slider control ($\theta \in [-60^\circ, +60^\circ]$) with rocket visual rotation.
  - Trigonometric force component breakdown ($F_x = F_{\text{thrust}} \cdot \sin\theta$, $F_y = F_{\text{thrust}} \cdot \cos\theta$).
  - Animated dashed flight path trajectory showing real-time 2D projectile arc.
- **🎯 100% Non-Overlapping Force Badges**:
  - Vector badges are dynamically spaced using a collision-resolution algorithm so labels never obscure one another.
- **📈 Real-Time Multi-Trace Telemetry Graphs**:
  - Synchronized plotting of velocity $v(t)$, acceleration $a(t)$, and altitude $y(t)$ with peak markers.
- **💾 CSV Telemetry Export**:
  - Download high-frequency time-series physics data for lab analysis in Excel, Google Sheets, or Python.

---

## 🛠️ Tech Stack

- **HTML5 & Vanilla JavaScript**: Zero dependencies, fully client-side and ultra-fast.
- **HTML5 2D Canvas**: Custom high-DPI rendering engine for atmospheric physics and telemetry graphs.
- **Modern CSS3 Design System**: Clean light theme with curated typography (Google Fonts: *Plus Jakarta Sans* & *JetBrains Mono*).

---

## 🚀 Getting Started

Simply open `simulation.html` in any modern web browser:

```bash
# Clone the repository
git clone https://github.com/chandanraj-03/sim.git

# Navigate to the folder
cd sim

# Open simulation.html in your default browser
# (Windows)
start simulation.html

# (macOS)
open simulation.html

# (Linux)
xdg-open simulation.html
```

---

## 📚 Educational Core Formulas

1. **Newton's First Law (Law of Inertia)**:
   $$\Sigma F = 0 \implies v = \text{constant}$$
2. **Newton's Second Law (Law of Force & Acceleration)**:
   $$F_{\text{net}} = m \cdot a \implies a = \frac{F_{\text{thrust}} - W}{m}$$
3. **Newton's Third Law (Action & Reaction)**:
   $$\vec{F}_{\text{action}} = -\vec{F}_{\text{reaction}}$$
4. **Weight Force**:
   $$W = m \cdot g \quad (g \approx 9.8\text{ m/s}^2 \text{ at Earth surface})$$

---

## 📄 License

MIT License — Feel free to use and adapt for classrooms, STEM workshops, and physics education!
